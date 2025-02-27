import Config from './config';
import { Promise } from './promise-polyfill';
import { RequestQueue } from './request-queue';
import { console_with_prefix, isOnline, _ } from './utils'; // eslint-disable-line camelcase

// maximum interval between request retries after exponential backoff
var MAX_RETRY_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes

var logger = console_with_prefix('batch');

/**
 * RequestBatcher: manages the queueing, flushing, retry etc of requests of one
 * type (events, people, groups).
 * Uses RequestQueue to manage the backing store.
 * @constructor
 */
var RequestBatcher = function(storageKey, options) {
    this.errorReporter = options.errorReporter;
    this.queue = new RequestQueue(storageKey, {
        errorReporter: _.bind(this.reportError, this),
        queueStorage: options.queueStorage,
        sharedLockStorage: options.sharedLockStorage,
        sharedLockTimeoutMS: options.sharedLockTimeoutMS,
        usePersistence: options.usePersistence,
        enqueueThrottleMs: options.enqueueThrottleMs
    });

    this.libConfig = options.libConfig;
    this.sendRequest = options.sendRequestFunc;
    this.beforeSendHook = options.beforeSendHook;
    this.stopAllBatching = options.stopAllBatchingFunc;

    // seed variable batch size + flush interval with configured values
    this.batchSize = this.libConfig['batch_size'];
    this.flushInterval = this.libConfig['batch_flush_interval_ms'];

    this.stopped = !this.libConfig['batch_autostart'];
    this.consecutiveRemovalFailures = 0;

    // extra client-side dedupe
    this.itemIdsSentSuccessfully = {};

    // Make the flush occur at the interval specified by flushIntervalMs, default behavior will attempt consecutive flushes
    // as long as the queue is not empty. This is useful for high-frequency events like Session Replay where we might end up
    // in a request loop and get ratelimited by the server.
    this.flushOnlyOnInterval = options.flushOnlyOnInterval || false;

    this._flushPromise = null;
};

/**
 * Add one item to queue.
 */
RequestBatcher.prototype.enqueue = function(item) {
    return this.queue.enqueue(item, this.flushInterval);
};

/**
 * Start flushing batches at the configured time interval. Must call
 * this method upon SDK init in order to send anything over the network.
 */
RequestBatcher.prototype.start = function() {
    this.stopped = false;
    this.consecutiveRemovalFailures = 0;
    return this.flush();
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
    return this.queue.clear();
};

/**
 * Restore batch size configuration to whatever is set in the main SDK.
 */
RequestBatcher.prototype.resetBatchSize = function() {
    this.batchSize = this.libConfig['batch_size'];
};

/**
 * Restore flush interval time configuration to whatever is set in the main SDK.
 */
RequestBatcher.prototype.resetFlush = function() {
    this.scheduleFlush(this.libConfig['batch_flush_interval_ms']);
};

/**
 * Schedule the next flush in the given number of milliseconds.
 */
RequestBatcher.prototype.scheduleFlush = function(flushMS) {
    this.flushInterval = flushMS;
    if (!this.stopped) { // don't schedule anymore if batching has been stopped
        this.timeoutID = setTimeout(_.bind(function() {
            if (!this.stopped) {
                this._flushPromise = this.flush();
            }
        }, this), this.flushInterval);
    }
};

/**
 * Send a request using the sendRequest callback, but promisified.
 * TODO: sendRequest should be promisified in the first place.
 */
RequestBatcher.prototype.sendRequestPromise = function(data, options) {
    return new Promise(_.bind(function(resolve) {
        this.sendRequest(data, options, resolve);
    }, this));
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
    if (this.requestInProgress) {
        logger.log('Flush: Request already in progress');
        return Promise.resolve();
    }

    this.requestInProgress = true;

    options = options || {};
    var timeoutMS = this.libConfig['batch_request_timeout_ms'];
    var startTime = new Date().getTime();
    var currentBatchSize = this.batchSize;

    return this.queue.fillBatch(currentBatchSize)
        .then(_.bind(function(batch) {

            // if there's more items in the queue than the batch size, attempt
            // to flush again after the current batch is done.
            var attemptSecondaryFlush = batch.length === currentBatchSize;
            var dataForRequest = [];
            var transformedItems = {};
            _.each(batch, function(item) {
                var payload = item['payload'];
                if (this.beforeSendHook && !item.orphaned) {
                    payload = this.beforeSendHook(payload);
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
                this.requestInProgress = false;
                this.resetFlush();
                return Promise.resolve(); // nothing to do
            }

            var removeItemsFromQueue = _.bind(function () {
                return this.queue
                    .removeItemsByID(
                        _.map(batch, function (item) {
                            return item['id'];
                        })
                    )
                    .then(_.bind(function (succeeded) {
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

                        if (succeeded) {
                            this.consecutiveRemovalFailures = 0;
                            if (this.flushOnlyOnInterval && !attemptSecondaryFlush) {
                                this.resetFlush(); // schedule next batch with a delay
                                return Promise.resolve();
                            } else {
                                return this.flush(); // handle next batch if the queue isn't empty
                            }
                        } else {
                            if (++this.consecutiveRemovalFailures > 5) {
                                this.reportError('Too many queue failures; disabling batching system.');
                                this.stopAllBatching();
                            } else {
                                this.resetFlush();
                            }
                            return Promise.resolve();
                        }
                    }, this));
            }, this);

            var batchSendCallback = _.bind(function(res) {
                this.requestInProgress = false;

                try {

                    // handle API response in a try-catch to make sure we can reset the
                    // flush operation if something goes wrong

                    if (options.unloading) {
                        // update persisted data to include hook transformations
                        return this.queue.updatePayloads(transformedItems);
                    } else if (
                        _.isObject(res) &&
                            res.error === 'timeout' &&
                            new Date().getTime() - startTime >= timeoutMS
                    ) {
                        this.reportError('Network timeout; retrying');
                        return this.flush();
                    } else if (
                        _.isObject(res) &&
                            (
                                res.httpStatusCode >= 500
                                || res.httpStatusCode === 429
                                || (res.httpStatusCode <= 0 && !isOnline())
                                || res.error === 'timeout'
                            )
                    ) {
                        // network or API error, or 429 Too Many Requests, retry
                        var retryMS = this.flushInterval * 2;
                        if (res.retryAfter) {
                            retryMS = (parseInt(res.retryAfter, 10) * 1000) || retryMS;
                        }
                        retryMS = Math.min(MAX_RETRY_INTERVAL_MS, retryMS);
                        this.reportError('Error; retry in ' + retryMS + ' ms');
                        this.scheduleFlush(retryMS);
                        return Promise.resolve();
                    } else if (_.isObject(res) && res.httpStatusCode === 413) {
                        // 413 Payload Too Large
                        if (batch.length > 1) {
                            var halvedBatchSize = Math.max(1, Math.floor(currentBatchSize / 2));
                            this.batchSize = Math.min(this.batchSize, halvedBatchSize, batch.length - 1);
                            this.reportError('413 response; reducing batch size to ' + this.batchSize);
                            this.resetFlush();
                            return Promise.resolve();
                        } else {
                            this.reportError('Single-event request too large; dropping', batch);
                            this.resetBatchSize();
                            return removeItemsFromQueue();
                        }
                    } else {
                        // successful network request+response; remove each item in batch from queue
                        // (even if it was e.g. a 400, in which case retrying won't help)
                        return removeItemsFromQueue();
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
            return this.sendRequestPromise(dataForRequest, requestOptions).then(batchSendCallback);
        }, this))
        .catch(_.bind(function(err) {
            this.reportError('Error flushing request queue', err);
            this.resetFlush();
        }, this));
};

/**
 * Log error to global logger and optional user-defined logger.
 */
RequestBatcher.prototype.reportError = function(msg, err) {
    logger.error.apply(logger.error, arguments);
    if (this.errorReporter) {
        try {
            if (!(err instanceof Error)) {
                err = new Error(msg);
            }
            this.errorReporter(msg, err);
        } catch(err) {
            logger.error(err);
        }
    }
};

export { RequestBatcher };
