import Config from './config';
import { RequestQueue } from './request-queue';
import { console_with_prefix, _ } from './utils'; // eslint-disable-line camelcase

// maximum interval between request retries after exponential backoff
var MAX_RETRY_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes

var logger = console_with_prefix('batch');

/**
 * RequestBatcher: manages the queueing, flushing, retry etc of requests of one
 * type (events, people, groups).
 * Uses RequestQueue to manage the backing store.
 * @constructor
 * @param {string} storageKey - Key to access the storage for request queue.
 * @param {Object} options - Configuration options for the RequestBatcher.
 * @param {number} options.batchSize - The size of the batch to be sent in each flush.
 * @param {number} options.flushIntervalMs - Interval in milliseconds between each flush attempt.
 * @param {boolean} options.usePersistence - Whether to use persistent storage.
 * @param {boolean} options.forceDelayFlush - Force flush at the interval specified by flushIntervalMs.
 * @param {boolean} options.autoStart - Automatically start the batcher upon initialization.
 * @param {Object} options.storage - Storage implementation to use.
 * @param {function} options.errorReporter - Function to report errors.
 * @param {function} options.sendRequestFunc - Function to send the request. Takes three arguments:
 *        - data: Array of payload objects to be sent.
 *        - requestOptions: Object containing request options (method, timeout, transport type, etc.).
 *        - callback: Function to be called with the response. Should be called with an object containing optional fields:
 *          - {number} [status] - HTTP status code of the response.
 *          - {string} [error] - Error message if the request failed.
 *          - {string} [retryAfter] - Value of the 'Retry-After' header
 *          - {Object|string} [responseBody] - Body of the response.
 * @param {function} options.stopAllBatchingFunc - Function to stop all batching operations.
 * @param {function} [options.beforeSendHook] - Hook to modify payload before sending.
 * @param {number} [options.requestTimeoutMs] - Timeout for each request.
 */
var RequestBatcher = function(storageKey, options) {
    this.options = options;

    this.queue = new RequestQueue(storageKey, {
        errorReporter: _.bind(this.reportError, this),
        storage: options.storage,
        usePersistence: options.usePersistence
    });

    // seed variable batch size + flush interval with configured values
    this.currentBatchSize = options.batchSize;
    this.currentFlushInterval = options.flushIntervalMs;

    // Forces flush to occur at the interval specified by flushIntervalMs, default behavior will attempt consecutive flushes
    // as long as the queue is not empty. This is useful for high-volume events like Session Replay.
    this.forceDelayFlush = options.forceDelayFlush || false;

    this.stopped = !options.autoStart;
    this.consecutiveRemovalFailures = 0;

    // extra client-side dedupe
    this.itemIdsSentSuccessfully = {};
};

/**
 * Add one item to queue.
 */
RequestBatcher.prototype.enqueue = function(item, cb) {
    this.queue.enqueue(item, this.currentFlushInterval, cb);
};

/**
 * Start flushing batches at the configured time interval. Must call
 * this method upon SDK init in order to send anything over the network.
 */
RequestBatcher.prototype.start = function() {
    this.stopped = false;
    this.consecutiveRemovalFailures = 0;
    this.flush();
};

/**
 * Stop flushing batches. Can be restarted by calling start().
 */
RequestBatcher.prototype.stop = function() {
    this.stopped = true;
    if (this.timeoutID) {
        clearTimeout(this.timeoutID);
        this.timeoutID = null;
    }
};

/**
 * Clear out queue.
 */
RequestBatcher.prototype.clear = function() {
    this.queue.clear();
};

/**
 * Restore batch size configuration to the originally initialized value
 */
RequestBatcher.prototype.resetBatchSize = function() {
    this.currentBatchSize = this.options.batchSize;
};

/**
 * Restore flush interval time configuration to the originally initialized value
 */
RequestBatcher.prototype.resetFlush = function() {
    this.scheduleFlush(this.options.flushIntervalMs);
};

/**
 * Schedule the next flush in the given number of milliseconds.
 */
RequestBatcher.prototype.scheduleFlush = function(flushMS) {
    this.currentFlushInterval = flushMS;
    if (!this.stopped) { // don't schedule anymore if batching has been stopped
        this.timeoutID = setTimeout(_.bind(this.flush, this), this.currentFlushInterval);
    }
};

/**
 * Flush one batch to network. Depending on success/failure modes, it will either
 * remove the batch from the queue or leave it in for retry, and schedule the next
 * flush. In cases of most network or API failures, it will back off exponentially
 * when retrying.
 * @param {Object} [options]
 * @param {boolean} [options.sendBeacon] - whether to send batch with
 * navigator.sendBeacon (only useful for sending batches before page unloads, as
 * sendBeacon offers no callbacks or status indications)
 */
RequestBatcher.prototype.flush = function(options) {
    try {

        if (this.requestInProgress) {
            logger.log('Flush: Request already in progress');
            return;
        }

        options = options || {};
        var timeoutMS = this.options.requestTimeoutMs;
        var startTime = new Date().getTime();
        var flushBatchSize = this.currentBatchSize;
        var batch = this.queue.fillBatch(flushBatchSize);
        var dataForRequest = [];
        var transformedItems = {};
        _.each(batch, function(item) {
            var payload = item['payload'];
            if (this.options.beforeSendHook && !item.orphaned) {
                payload = this.options.beforeSendHook(payload);
            }
            if (payload) {
                // mp_sent_by_lib_version prop captures which lib version actually
                // sends each event (regardless of which version originally queued
                // it for sending)
                if (payload['event'] && payload['properties']) {
                    payload['properties'] = _.extend(
                        {},
                        payload['properties'],
                        {'mp_sent_by_lib_version': Config.LIB_VERSION}
                    );
                }
                var addPayload = true;
                var itemId = item['id'];
                if (itemId) {
                    if ((this.itemIdsSentSuccessfully[itemId] || 0) > 5) {
                        this.reportError('[dupe] item ID sent too many times, not sending', {
                            item: item,
                            batchSize: batch.length,
                            timesSent: this.itemIdsSentSuccessfully[itemId]
                        });
                        addPayload = false;
                    }
                } else {
                    this.reportError('[dupe] found item with no ID', {item: item});
                }

                if (addPayload) {
                    dataForRequest.push(payload);
                }
            }
            transformedItems[item['id']] = payload;
        }, this);
        if (dataForRequest.length < 1) {
            this.resetFlush();
            return; // nothing to do
        }

        this.requestInProgress = true;

        var batchSendCallback = _.bind(function(res) {
            this.requestInProgress = false;

            try {

                // handle API response in a try-catch to make sure we can reset the
                // flush operation if something goes wrong

                var removeItemsFromQueue = false;
                if (options.unloading) {
                    // update persisted data to include hook transformations
                    this.queue.updatePayloads(transformedItems);
                } else if (
                    _.isObject(res) &&
                    res.error === 'timeout' &&
                    new Date().getTime() - startTime >= timeoutMS
                ) {
                    this.reportError('Network timeout; retrying');
                    this.flush();
                } else if (
                    _.isObject(res) &&
                    (res.status >= 500 || res.status === 429 || res.error === 'timeout')
                ) {
                    // network or API error, or 429 Too Many Requests, retry
                    var retryMS = this.currentFlushInterval * 2;
                    if (res.retryAfter) {
                        retryMS = (parseInt(res.retryAfter, 10) * 1000) || retryMS;
                    }
                    retryMS = Math.min(MAX_RETRY_INTERVAL_MS, retryMS);
                    this.reportError('Error; retry in ' + retryMS + ' ms');
                    this.scheduleFlush(retryMS);
                } else if (_.isObject(res) && res.status === 413) {
                    // 413 Payload Too Large
                    if (batch.length > 1) {
                        var halvedBatchSize = Math.max(1, Math.floor(flushBatchSize / 2));
                        this.currentBatchSize = Math.min(this.currentBatchSize, halvedBatchSize, batch.length - 1);
                        this.reportError('413 response; reducing batch size to ' + this.batchSize);
                        this.resetFlush();
                    } else {
                        this.reportError('Single-event request too large; dropping', batch);
                        this.resetBatchSize();
                        removeItemsFromQueue = true;
                    }
                } else {
                    // successful network request+response; remove each item in batch from queue
                    // (even if it was e.g. a 400, in which case retrying won't help)
                    removeItemsFromQueue = true;
                }

                if (removeItemsFromQueue) {
                    this.queue.removeItemsByID(
                        _.map(batch, function(item) { return item['id']; }),
                        _.bind(function(succeeded) {
                            if (succeeded) {
                                this.consecutiveRemovalFailures = 0;
                                if (this.forceDelayFlush) {
                                    this.resetFlush(); // schedule next batch with a delay
                                } else {
                                    this.flush(); // handle next batch if the queue isn't empty
                                }
                            } else {
                                this.reportError('Failed to remove items from queue');
                                if (++this.consecutiveRemovalFailures > 5) {
                                    this.reportError('Too many queue failures; disabling batching system.');
                                    this.options.stopAllBatchingFunc();
                                } else {
                                    this.resetFlush();
                                }
                            }
                        }, this)
                    );

                    // client-side dedupe
                    _.each(batch, _.bind(function(item) {
                        var itemId = item['id'];
                        if (itemId) {
                            this.itemIdsSentSuccessfully[itemId] = this.itemIdsSentSuccessfully[itemId] || 0;
                            this.itemIdsSentSuccessfully[itemId]++;
                            if (this.itemIdsSentSuccessfully[itemId] > 5) {
                                this.reportError('[dupe] item ID sent too many times', {
                                    item: item,
                                    batchSize: batch.length,
                                    timesSent: this.itemIdsSentSuccessfully[itemId]
                                });
                            }
                        } else {
                            this.reportError('[dupe] found item with no ID while removing', {item: item});
                        }
                    }, this));
                }

            } catch(err) {
                this.reportError('Error handling API response', err);
                this.resetFlush();
            }
        }, this);
        var requestOptions = {
            method: 'POST',
            verbose: true,
            ignore_json_errors: true, // eslint-disable-line camelcase
            timeout_ms: timeoutMS // eslint-disable-line camelcase
        };
        if (options.unloading) {
            requestOptions.transport = 'sendBeacon';
        }
        logger.log('MIXPANEL REQUEST:', dataForRequest);
        this.options.sendRequestFunc(dataForRequest, requestOptions, batchSendCallback);
    } catch(err) {
        this.reportError('Error flushing request queue', err);
        this.resetFlush();
    }
};

/**
 * Log error to global logger and optional user-defined logger.
 */
RequestBatcher.prototype.reportError = function(msg, err) {
    logger.error.apply(logger.error, arguments);
    if (this.options.errorReporter) {
        try {
            if (!(err instanceof Error)) {
                err = new Error(msg);
            }
            this.options.errorReporter(msg, err);
        } catch(err) {
            logger.error(err);
        }
    }
};

export { RequestBatcher };
