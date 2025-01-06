import { window } from '../window';
import { MAX_RECORDING_MS, MAX_VALUE_FOR_MIN_RECORDING_MS, console_with_prefix, _} from '../utils'; // eslint-disable-line camelcase
import { IDBStorageWrapper, RECORDING_EVENTS_STORE_NAME } from '../storage/indexed-db';
import { addOptOutCheckMixpanelLib } from '../gdpr-utils';
import { RequestBatcher } from '../request-batcher';
import Config from '../config';

var logger = console_with_prefix('recorder');
var CompressionStream = window['CompressionStream'];

var RECORDER_BATCHER_LIB_CONFIG = {
    'batch_size': 1000,
    'batch_flush_interval_ms': 10 * 1000,
    'batch_request_timeout_ms': 90 * 1000,
    'batch_autostart': true
};

var ACTIVE_SOURCES = [1, 2, 3, 4, 5, 6, 7, 12, 14];

function isUserEvent(ev) {
    return ev.type === 3 && ACTIVE_SOURCES.includes(ev.data.source);
}

var NOOP = function () {};

/**
 * @typedef {Object} SerializedRecording
 * @property {number} idleExpires
 * @property {number} maxExpires
 * @property {number} replayStartTime
 * @property {number} seqNo
 * @property {string} batchStartUrl
 * @property {string} replayId
 */


/**
 * This class encapsulates a single session recording and its lifecycle.
 * @param {Object} options
 * @param {Object} [options.mixpanelInstance] - reference to the core MixpanelLib
 * @param {String} [options.replayId] - unique uuid for a single replay
 * @param {Function} [options.onIdleTimeout] - callback when a recording reaches idle timeout
 * @param {Function} [options.onMaxLengthReached] - callback when a recording reaches its maximum length
 * @param {Function} [options.rrwebRecord] - rrweb's `record` function
 * @param {SerializedRecording} [options.serializedRecording] - serialized recording to resume
 */
var SessionRecording = function(options) {
    this._mixpanel = options.mixpanelInstance;
    this._onIdleTimeout = options.onIdleTimeout || NOOP;
    this._onMaxLengthReached = options.onMaxLengthReached || NOOP;
    this._onBatchSent = options.onBatchSent || NOOP;
    this._rrwebRecord = options.rrwebRecord || null;

    // internal rrweb stopRecording function
    this._stopRecording = null;

    if (options.serializedRecording) {
        this.batchStartUrl = options.serializedRecording['batchStartUrl'];
        this.replayStartUrl = options.serializedRecording['replayStartUrl'];
        this.idleExpires = options.serializedRecording['idleExpires'];
        this.maxExpires = options.serializedRecording['maxExpires'];
        this.replayId = options.serializedRecording['replayId'];
        this.replayStartTime = options.serializedRecording['replayStartTime'];
        this.seqNo = options.serializedRecording['seqNo'];

        this._isResumed = true;
    } else {
        this.batchStartUrl = null;
        this.replayStartUrl = null;
        this.idleExpires = null;
        this.maxExpires = null;
        this.replayId = options.replayId;
        this.replayStartTime = null;
        this.seqNo = 0;

        this._isResumed = false;
    }

    this.idleTimeoutId = null;

    this.maxTimeoutId = null;

    this.recordMaxMs = MAX_RECORDING_MS;
    this.recordMinMs = 0;

    // each replay has its own batcher key to avoid conflicts between rrweb events of different recordings
    // this will be important when persistence is introduced
    this.batcherKey = '__mprec_' + this.getConfig('name') + '_' + this.getConfig('token') + '_' + this.replayId;
    this.queueStorage = new IDBStorageWrapper(RECORDING_EVENTS_STORE_NAME);
    this.batcher = new RequestBatcher(this.batcherKey, {
        errorReporter: _.bind(this.reportError, this),
        flushOnlyOnInterval: true,
        libConfig: RECORDER_BATCHER_LIB_CONFIG,
        sendRequestFunc: _.bind(this.flushEventsWithOptOut, this),
        queueStorage: this.queueStorage,
        usePersistence: true,
    });
};

SessionRecording.prototype.unloadPersistedData = function () {
    return this.batcher.flush()
        .then(_.bind(function () {
            return this.queueStorage.removeItem(this.batcherKey);
        }, this));
};

SessionRecording.prototype.getConfig = function(configVar) {
    return this._mixpanel.get_config(configVar);
};

// Alias for getConfig, used by the common addOptOutCheckMixpanelLib function which
// reaches into this class instance and expects the snake case version of the function.
// eslint-disable-next-line camelcase
SessionRecording.prototype.get_config = function(configVar) {
    return this.getConfig(configVar);
};

SessionRecording.prototype.startRecording = function (shouldStopBatcher) {
    if (this._rrwebRecord === null) {
        this.reportError('rrweb record function not provided. ');
        return;
    }

    if (this._stopRecording !== null) {
        logger.log('Recording already in progress, skipping startRecording.');
        return;
    }

    this.recordMaxMs = this.getConfig('record_max_ms');
    if (this.recordMaxMs > MAX_RECORDING_MS) {
        this.recordMaxMs = MAX_RECORDING_MS;
        logger.critical('record_max_ms cannot be greater than ' + MAX_RECORDING_MS + 'ms. Capping value.');
    }
    this.maxExpires = new Date().getTime() + this.recordMaxMs;

    this.recordMinMs = this.getConfig('record_min_ms');
    if (this.recordMinMs > MAX_VALUE_FOR_MIN_RECORDING_MS) {
        this.recordMinMs = MAX_VALUE_FOR_MIN_RECORDING_MS;
        logger.critical('record_min_ms cannot be greater than ' + MAX_VALUE_FOR_MIN_RECORDING_MS + 'ms. Capping value.');
    }

    if (!this._isResumed) {
        this.replayStartTime = new Date().getTime();
        this.batchStartUrl = _.info.currentUrl();
        this.replayStartUrl = _.info.currentUrl();
    }

    if (shouldStopBatcher || this.recordMinMs > 0) {
        // the primary case for shouldStopBatcher is when we're starting recording after a reset
        // and don't want to send anything over the network until there's
        // actual user activity
        // this also applies if the minimum recording length has not been hit yet
        // so that we don't send data until we know the recording will be long enough
        this.batcher.stop();
    } else {
        this.batcher.start();
    }

    var resetIdleTimeout = _.bind(function () {
        clearTimeout(this.idleTimeoutId);
        var idleTimeoutMs = this.getConfig('record_idle_timeout_ms');
        this.idleTimeoutId = setTimeout(this._onIdleTimeout, idleTimeoutMs);
        this.idleExpires = new Date().getTime() + idleTimeoutMs;
    }, this);

    var blockSelector = this.getConfig('record_block_selector');
    if (blockSelector === '' || blockSelector === null) {
        blockSelector = undefined;
    }

    this._stopRecording = this._rrwebRecord({
        'emit': _.bind(function (ev) {
            this.batcher.enqueue(ev);
            if (isUserEvent(ev)) {
                if (this.batcher.stopped && new Date().getTime() - this.replayStartTime >= this.recordMinMs) {
                    // start flushing again after user activity
                    this.batcher.start();
                }
                resetIdleTimeout();
            }
        }, this),
        'blockClass': this.getConfig('record_block_class'),
        'blockSelector': blockSelector,
        'collectFonts': this.getConfig('record_collect_fonts'),
        'dataURLOptions': { // canvas image options (https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toDataURL)
            'type': 'image/webp',
            'quality': 0.6
        },
        'maskAllInputs': true,
        'maskTextClass': this.getConfig('record_mask_text_class'),
        'maskTextSelector': this.getConfig('record_mask_text_selector'),
        'recordCanvas': this.getConfig('record_canvas'),
        'sampling': {
            'canvas': 15
        }
    });

    if (typeof this._stopRecording !== 'function') {
        this.reportError('rrweb failed to start, skipping this recording.');
        this._stopRecording = null;
        this.stopRecording(); // stop batcher looping and any timeouts
        return;
    }

    resetIdleTimeout();

    this.maxTimeoutId = setTimeout(_.bind(this._onMaxLengthReached, this), this.recordMaxMs);
};

SessionRecording.prototype.stopRecording = function () {
    if (!this.isRrwebStopped()) {
        try {
            this._stopRecording();
        } catch (err) {
            this.reportError('Error with rrweb stopRecording', err);
        }
        this._stopRecording = null;
    }

    if (this.batcher.stopped) {
        // never got user activity to flush after reset, so just clear the batcher
        this.batcher.clear();
    } else {
        // flush any remaining events from running batcher
        this.batcher.flush();
        this.batcher.stop();
    }

    clearTimeout(this.idleTimeoutId);
    clearTimeout(this.maxTimeoutId);
};

SessionRecording.prototype.isRrwebStopped = function () {
    return this._stopRecording === null;
};

/**
 * Flushes the current batch of events to the server, but passes an opt-out callback to make sure
 * we stop recording and dump any queued events if the user has opted out.
 */
SessionRecording.prototype.flushEventsWithOptOut = function (data, options, cb) {
    this._flushEvents(data, options, cb, _.bind(this._onOptOut, this));
};

/**
 * @returns {SerializedRecording}
 */
SessionRecording.prototype.serialize = function () {
    return {
        'replayId': this.replayId,
        'seqNo': this.seqNo,
        'replayStartTime': this.replayStartTime,
        'batchStartUrl': this.batchStartUrl,
        'replayStartUrl': this.replayStartUrl,
        'idleExpires': this.idleExpires,
        'maxExpires': this.maxExpires
    };
};

SessionRecording.prototype._onOptOut = function (code) {
    // addOptOutCheckMixpanelLib invokes this function with code=0 when the user has opted out
    if (code === 0) {
        this.stopRecording();
    }
};

SessionRecording.prototype._sendRequest = function(currentReplayId, reqParams, reqBody, callback) {
    var onSuccess = _.bind(function (response, responseBody) {
        // Update batch specific props only if the request was successful to guarantee ordering.
        // RequestBatcher will always flush the next batch after the previous one succeeds.
        // extra check to see if the replay ID has changed so that we don't increment the seqNo on the wrong replay
        if (response.status === 200 && this.replayId === currentReplayId) {
            this.seqNo++;
            this.batchStartUrl = _.info.currentUrl();
        }

        this._onBatchSent();
        callback({
            status: 0,
            httpStatusCode: response.status,
            responseBody: responseBody,
            retryAfter: response.headers.get('Retry-After')
        });
    }, this);

    window['fetch'](this.getConfig('api_host') + '/' + this.getConfig('api_routes')['record'] + '?' + new URLSearchParams(reqParams), {
        'method': 'POST',
        'headers': {
            'Authorization': 'Basic ' + btoa(this.getConfig('token') + ':'),
            'Content-Type': 'application/octet-stream'
        },
        'body': reqBody,
    }).then(function (response) {
        response.json().then(function (responseBody) {
            onSuccess(response, responseBody);
        }).catch(function (error) {
            callback({error: error});
        });
    }).catch(function (error) {
        callback({error: error, httpStatusCode: 0});
    });
};

SessionRecording.prototype._flushEvents = addOptOutCheckMixpanelLib(function (data, options, callback) {
    var numEvents = data.length;

    if (numEvents > 0) {
        var replayId = this.replayId;
        // each rrweb event has a timestamp - leverage those to get time properties
        var batchStartTime = data[0].timestamp;
        if (this.seqNo === 0 || !this.replayStartTime) {
            // extra safety net so that we don't send a null replay start time
            if (this.seqNo !== 0) {
                this.reportError('Replay start time not set but seqNo is not 0. Using current batch start time as a fallback.');
            }

            this.replayStartTime = batchStartTime;
        }
        var replayLengthMs = data[numEvents - 1].timestamp - this.replayStartTime;

        var reqParams = {
            '$current_url': this.batchStartUrl,
            '$lib_version': Config.LIB_VERSION,
            'batch_start_time': batchStartTime / 1000,
            'distinct_id': String(this._mixpanel.get_distinct_id()),
            'mp_lib': 'web',
            'replay_id': replayId,
            'replay_length_ms': replayLengthMs,
            'replay_start_time': this.replayStartTime / 1000,
            'replay_start_url': this.replayStartUrl,
            'seq': this.seqNo
        };
        var eventsJson = _.JSONEncode(data);

        // send ID management props if they exist
        var deviceId = this._mixpanel.get_property('$device_id');
        if (deviceId) {
            reqParams['$device_id'] = deviceId;
        }
        var userId = this._mixpanel.get_property('$user_id');
        if (userId) {
            reqParams['$user_id'] = userId;
        }

        if (CompressionStream) {
            var jsonStream = new Blob([eventsJson], {type: 'application/json'}).stream();
            var gzipStream = jsonStream.pipeThrough(new CompressionStream('gzip'));
            new Response(gzipStream)
                .blob()
                .then(_.bind(function(compressedBlob) {
                    reqParams['format'] = 'gzip';
                    this._sendRequest(replayId, reqParams, compressedBlob, callback);
                }, this));
        } else {
            reqParams['format'] = 'body';
            this._sendRequest(replayId, reqParams, eventsJson, callback);
        }
    }
});


SessionRecording.prototype.reportError = function(msg, err) {
    logger.error.apply(logger.error, arguments);
    try {
        if (!err && !(msg instanceof Error)) {
            msg = new Error(msg);
        }
        this.getConfig('error_reporter')(msg, err);
    } catch(err) {
        logger.error(err);
    }
};

export { SessionRecording };
