import { RequestQueue } from './request-queue';
import { console, _ } from './utils';

// maximum interval between request retries after exponential backoff
var MAX_RETRY_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes

/**
 * RequestBatcher: manages the queueing, flushing, retry etc of requests of one type (events, people, groups).
 * Uses RequestQueue to manage the backing store.
 * @constructor
 */
var RequestBatcher = function(key, options) {
    this.queue = new RequestQueue(key);

    this.endpoint = options.endpoint;
    this.libConfig = options.libConfig;
    this.sendRequest = options.sendRequestFunc;

    // seed variable batch size + flush interval with configured values
    this.batchSize = this.libConfig['batch_size'];
    this.flushInterval = this.libConfig['batch_flush_interval_ms'];

    this.stopped = false;
};

RequestBatcher.prototype.enqueue = function(item, cb) {
    this.queue.enqueue(item, this.flushInterval, cb);
};

RequestBatcher.prototype.start = function() {
    this.flush();
};

RequestBatcher.prototype.stop = function() {
    this.stopped = true;
    if (this.timeoutID) {
        clearTimeout(this.timeoutID);
        this.timeoutID = null;
    }
};

RequestBatcher.prototype.clear = function() {
    this.queue.clear();
};

RequestBatcher.prototype.resetBatchSize = function() {
    this.batchSize = this.libConfig['batch_size'];
};

RequestBatcher.prototype.resetFlush = function() {
    this.scheduleFlush(this.libConfig['batch_flush_interval_ms']); // restore to configured flush interval
};

RequestBatcher.prototype.scheduleFlush = function(flushMS) {
    this.flushInterval = flushMS;
    if (!this.stopped) { // don't schedule anymore if batching has been stopped
        this.timeoutID = setTimeout(_.bind(this.flush, this), this.flushInterval);
    }
};

RequestBatcher.prototype.flush = function(options) {
    try {

        if (this.requestInProgress) {
            console.log('[batch] Flush: Request already in progress');
            return;
        }

        options = options || {};
        var currentBatchSize = this.batchSize;
        var batch = this.queue.fillBatch(currentBatchSize);
        if (batch.length < 1) {
            console.log('[batch] nothing to do');
            this.resetFlush();
            return; // nothing to do
        }

        this.requestInProgress = true;
        console.log('[batch] ' + batch.length + ' items to flush');
        console.log('[batch] items:', batch);

        var dataForRequest = _.map(batch, function(item) { return item['payload']; });
        var batchSendCallback = _.bind(function(res) {
            console.log('[batch] callback', res, batch);
            this.requestInProgress = false;

            try {

                var removeItemsFromQueue = false;
                if (_.isObject(res) && res.error === 'timeout') {
                    console.log('[batch] network timeout; retrying');
                    this.flush();
                } else if (_.isObject(res) && res.xhr_req && res.xhr_req.status >= 500) {
                    // network or API error, retry
                    var retryMS = this.flushInterval * 2;
                    if (res.xhr_req.responseHeaders) {
                        var retryAfter = res.xhr_req.responseHeaders['Retry-After'];
                        if (retryAfter) {
                            retryMS = (parseInt(retryAfter, 10) * 1000) || retryMS;
                        }
                    }
                    retryMS = Math.min(MAX_RETRY_INTERVAL_MS, retryMS);
                    console.log('[batch] retry in ' + retryMS + ' ms');
                    this.scheduleFlush(retryMS);
                } else if (_.isObject(res) && res.xhr_req && res.xhr_req.status === 413) {
                    // 413 Payload Too Large
                    if (batch.length > 1) {
                        var halvedBatchSize = Math.max(1, Math.floor(currentBatchSize / 2));
                        this.batchSize = Math.min(this.batchSize, halvedBatchSize, batch.length - 1);
                        console.log('[batch] 413 response; reducing batch size to ' + this.batchSize);
                        this.resetFlush();
                    } else {
                        console.error('[batch] single-event request too large; dropping', batch);
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
                        _.bind(this.flush, this) // handle next batch if the queue isn't empty
                    );
                }

            } catch(err) {
                console.error('[batch] Error handling API response', err);
                this.resetFlush();
            }
        }, this);
        var requestOptions = {
            method: 'POST',
            verbose: true,
            ignore_json_errors: true, // eslint-disable-line camelcase
            timeout_ms: this.libConfig['batch_request_timeout_ms'] // eslint-disable-line camelcase
        };
        if (options.sendBeacon) {
            requestOptions.transport = 'sendBeacon';
        }
        this.sendRequest(this.endpoint, dataForRequest, requestOptions, batchSendCallback);

    } catch(err) {
        console.error('[batch] Error flushing request queue', err);
        this.resetFlush();
    }
};

export { RequestBatcher };
