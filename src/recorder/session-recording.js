import { window } from '../window';
import { IncrementalSource, EventType } from 'rrweb';
import { MAX_RECORDING_MS, MAX_VALUE_FOR_MIN_RECORDING_MS, console_with_prefix, NOOP_FUNC, _, localStorageSupported} from '../utils'; // eslint-disable-line camelcase
import { IDBStorageWrapper, RECORDING_EVENTS_STORE_NAME } from '../storage/indexed-db';
import { addOptOutCheckMixpanelLib } from '../gdpr-utils';
import { RequestBatcher } from '../request-batcher';
import Config from '../config';
import { RECORD_ENQUEUE_THROTTLE_MS } from './utils';

var logger = console_with_prefix('recorder');
var CompressionStream = window['CompressionStream'];

var RECORDER_BATCHER_LIB_CONFIG = {
    'batch_size': 1000,
    'batch_flush_interval_ms': 10 * 1000,
    'batch_request_timeout_ms': 90 * 1000,
    'batch_autostart': true
};

var ACTIVE_SOURCES = new Set([
    IncrementalSource.MouseMove,
    IncrementalSource.MouseInteraction,
    IncrementalSource.Scroll,
    IncrementalSource.ViewportResize,
    IncrementalSource.Input,
    IncrementalSource.TouchMove,
    IncrementalSource.MediaInteraction,
    IncrementalSource.Drag,
    IncrementalSource.Selection,
]);

function isUserEvent(ev) {
    return ev.type === EventType.IncrementalSnapshot && ACTIVE_SOURCES.has(ev.data.source);
}

/**
 * @typedef {Object} SerializedRecording
 * @property {number} idleExpires
 * @property {number} maxExpires
 * @property {number} replayStartTime
 * @property {number} seqNo
 * @property {string} batchStartUrl
 * @property {string} replayId
 * @property {string} tabId
 * @property {string} replayStartUrl
 */

/**
 * @typedef {Object} SessionRecordingOptions
 * @property {Object} [options.mixpanelInstance] - reference to the core MixpanelLib
 * @property {String} [options.replayId] - unique uuid for a single replay
 * @property {Function} [options.onIdleTimeout] - callback when a recording reaches idle timeout
 * @property {Function} [options.onMaxLengthReached] - callback when a recording reaches its maximum length
 * @property {Function} [options.rrwebRecord] - rrweb's `record` function
 * @property {Function} [options.onBatchSent] - callback when a batch of events is sent to the server
 * @property {Storage} [options.sharedLockStorage] - optional storage for shared lock, used for test dependency injection
 * optional properties for deserialization:
 * @property {number} idleExpires
 * @property {number} maxExpires
 * @property {number} replayStartTime
 * @property {number} seqNo
 * @property {string} batchStartUrl
 * @property {string} replayStartUrl
 */

/**
 * @typedef {Object} UserIdInfo
 * @property {string} distinct_id
 * @property {string} user_id
 * @property {string} device_id
 */


/**
 * This class encapsulates a single session recording and its lifecycle.
 * @param {SessionRecordingOptions} options
 */
var SessionRecording = function(options) {
    this._mixpanel = options.mixpanelInstance;
    this._onIdleTimeout = options.onIdleTimeout || NOOP_FUNC;
    this._onMaxLengthReached = options.onMaxLengthReached || NOOP_FUNC;
    this._onBatchSent = options.onBatchSent || NOOP_FUNC;
    this._rrwebRecord = options.rrwebRecord || null;

    // internal rrweb stopRecording function
    this._stopRecording = null;
    this.replayId = options.replayId;

    this.batchStartUrl = options.batchStartUrl || null;
    this.replayStartUrl = options.replayStartUrl || null;
    this.idleExpires = options.idleExpires || null;
    this.maxExpires = options.maxExpires || null;
    this.replayStartTime = options.replayStartTime || null;
    this.seqNo = options.seqNo || 0;

    this.idleTimeoutId = null;
    this.maxTimeoutId = null;

    this.recordMaxMs = MAX_RECORDING_MS;
    this.recordMinMs = 0;

    // disable persistence if localStorage is not supported
    // request-queue will automatically disable persistence if indexedDB fails to initialize
    var usePersistence = localStorageSupported(options.sharedLockStorage, true);

    // each replay has its own batcher key to avoid conflicts between rrweb events of different recordings
    // this will be important when persistence is introduced
    this.batcherKey = '__mprec_' + this.getConfig('name') + '_' + this.getConfig('token') + '_' + this.replayId;
    this.queueStorage = new IDBStorageWrapper(RECORDING_EVENTS_STORE_NAME);
    this.batcher = new RequestBatcher(this.batcherKey, {
        errorReporter: this.reportError.bind(this),
        flushOnlyOnInterval: true,
        libConfig: RECORDER_BATCHER_LIB_CONFIG,
        sendRequestFunc: this.flushEventsWithOptOut.bind(this),
        queueStorage: this.queueStorage,
        sharedLockStorage: options.sharedLockStorage,
        usePersistence: usePersistence,
        stopAllBatchingFunc: this.stopRecording.bind(this),

        // increased throttle and shared lock timeout because recording events are very high frequency.
        // this will minimize the amount of lock contention between enqueued events.
        // for session recordings there is a lock for each tab anyway, so there's no risk of deadlock between tabs.
        enqueueThrottleMs: RECORD_ENQUEUE_THROTTLE_MS,
        sharedLockTimeoutMS: 10 * 1000,
    });
};

/**
 * @returns {UserIdInfo}
 */
SessionRecording.prototype.getUserIdInfo = function () {
    if (this.finalFlushUserIdInfo) {
        return this.finalFlushUserIdInfo;
    }

    var userIdInfo = {
        'distinct_id': String(this._mixpanel.get_distinct_id()),
    };

    // send ID management props if they exist
    var deviceId = this._mixpanel.get_property('$device_id');
    if (deviceId) {
        userIdInfo['$device_id'] = deviceId;
    }
    var userId = this._mixpanel.get_property('$user_id');
    if (userId) {
        userIdInfo['$user_id'] = userId;
    }
    return userIdInfo;
};

SessionRecording.prototype.unloadPersistedData = function () {
    this.batcher.stop();
    return this.batcher.flush()
        .then(function () {
            return this.queueStorage.removeItem(this.batcherKey);
        }.bind(this));
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

    if (!this.maxExpires) {
        this.maxExpires = new Date().getTime() + this.recordMaxMs;
    }

    this.recordMinMs = this.getConfig('record_min_ms');
    if (this.recordMinMs > MAX_VALUE_FOR_MIN_RECORDING_MS) {
        this.recordMinMs = MAX_VALUE_FOR_MIN_RECORDING_MS;
        logger.critical('record_min_ms cannot be greater than ' + MAX_VALUE_FOR_MIN_RECORDING_MS + 'ms. Capping value.');
    }

    if (!this.replayStartTime) {
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

    var resetIdleTimeout = function () {
        clearTimeout(this.idleTimeoutId);
        var idleTimeoutMs = this.getConfig('record_idle_timeout_ms');
        this.idleTimeoutId = setTimeout(this._onIdleTimeout, idleTimeoutMs);
        this.idleExpires = new Date().getTime() + idleTimeoutMs;
    }.bind(this);
    resetIdleTimeout();

    var blockSelector = this.getConfig('record_block_selector');
    if (blockSelector === '' || blockSelector === null) {
        blockSelector = undefined;
    }

    try {
        this._stopRecording = this._rrwebRecord({
            'emit': function (ev) {
                if (this.idleExpires && this.idleExpires < ev.timestamp) {
                    this._onIdleTimeout();
                    return;
                }
                if (isUserEvent(ev)) {
                    if (this.batcher.stopped && new Date().getTime() - this.replayStartTime >= this.recordMinMs) {
                        // start flushing again after user activity
                        this.batcher.start();
                    }
                    resetIdleTimeout();
                }
                // promise only used to await during tests
                this.__enqueuePromise = this.batcher.enqueue(ev);
            }.bind(this),
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
    } catch (err) {
        this.reportError('Unexpected error when starting rrweb recording.', err);
    }

    if (typeof this._stopRecording !== 'function') {
        this.reportError('rrweb failed to start, skipping this recording.');
        this._stopRecording = null;
        this.stopRecording(); // stop batcher looping and any timeouts
        return;
    }

    var maxTimeoutMs = this.maxExpires - new Date().getTime();
    this.maxTimeoutId = setTimeout(this._onMaxLengthReached.bind(this), maxTimeoutMs);
};

SessionRecording.prototype.stopRecording = function (skipFlush) {
    // store the user ID info in case this is getting called in mixpanel.reset()
    this.finalFlushUserIdInfo = this.getUserIdInfo();

    if (!this.isRrwebStopped()) {
        try {
            this._stopRecording();
        } catch (err) {
            this.reportError('Error with rrweb stopRecording', err);
        }
        this._stopRecording = null;
    }

    var flushPromise;
    if (this.batcher.stopped) {
        // never got user activity to flush after reset, so just clear the batcher
        flushPromise = this.batcher.clear();
    } else if (!skipFlush) {
        // flush any remaining events from running batcher
        flushPromise = this.batcher.flush();
    }
    this.batcher.stop();

    clearTimeout(this.idleTimeoutId);
    clearTimeout(this.maxTimeoutId);
    return flushPromise;
};

SessionRecording.prototype.isRrwebStopped = function () {
    return this._stopRecording === null;
};


/**
 * Flushes the current batch of events to the server, but passes an opt-out callback to make sure
 * we stop recording and dump any queued events if the user has opted out.
 */
SessionRecording.prototype.flushEventsWithOptOut = function (data, options, cb) {
    var onOptOut = function (code) {
        // addOptOutCheckMixpanelLib invokes this function with code=0 when the user has opted out
        if (code === 0) {
            this.stopRecording();
            cb({error: 'Tracking has been opted out, stopping recording.'});
        }
    }.bind(this);

    this._flushEvents(data, options, cb, onOptOut);
};

/**
 * @returns {SerializedRecording}
 */
SessionRecording.prototype.serialize = function () {
    // don't break if mixpanel instance was destroyed at some point
    var tabId;
    try {
        tabId = this._mixpanel.get_tab_id();
    } catch (e) {
        this.reportError('Error getting tab ID for serialization ', e);
        tabId = null;
    }

    return {
        'replayId': this.replayId,
        'seqNo': this.seqNo,
        'replayStartTime': this.replayStartTime,
        'batchStartUrl': this.batchStartUrl,
        'replayStartUrl': this.replayStartUrl,
        'idleExpires': this.idleExpires,
        'maxExpires': this.maxExpires,
        'tabId': tabId,
    };
};


/**
 * @static
 * @param {SerializedRecording} serializedRecording
 * @param {SessionRecordingOptions} options
 * @returns {SessionRecording}
 */
SessionRecording.deserialize = function (serializedRecording, options) {
    var recording = new SessionRecording(_.extend({}, options, {
        replayId: serializedRecording['replayId'],
        batchStartUrl: serializedRecording['batchStartUrl'],
        replayStartUrl: serializedRecording['replayStartUrl'],
        idleExpires: serializedRecording['idleExpires'],
        maxExpires: serializedRecording['maxExpires'],
        replayStartTime: serializedRecording['replayStartTime'],
        seqNo: serializedRecording['seqNo'],
        sharedLockStorage: options.sharedLockStorage,
    }));

    return recording;
};

SessionRecording.prototype._sendRequest = function(currentReplayId, reqParams, reqBody, callback) {
    var onSuccess = function (response, responseBody) {
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
    }.bind(this);
    var apiHost = (this._mixpanel.get_api_host && this._mixpanel.get_api_host('record')) || this.getConfig('api_host');
    window['fetch'](apiHost + '/' + this.getConfig('api_routes')['record'] + '?' + new URLSearchParams(reqParams), {
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
        var batchStartTime = Infinity;
        var batchEndTime = -Infinity;
        var hasFullSnapshot = false;
        for (var i = 0; i < numEvents; i++) {
            batchStartTime = Math.min(batchStartTime, data[i].timestamp);
            batchEndTime = Math.max(batchEndTime, data[i].timestamp);
            if (data[i].type === EventType.FullSnapshot) {
                hasFullSnapshot = true;
            }
        }

        if (this.seqNo === 0) {
            if (!hasFullSnapshot) {
                callback({error: 'First batch does not contain a full snapshot. Aborting recording.'});
                this.stopRecording(true);
                return;
            }
            this.replayStartTime = batchStartTime;
        } else if (!this.replayStartTime) {
            this.reportError('Replay start time not set but seqNo is not 0. Using current batch start time as a fallback.');
            this.replayStartTime = batchStartTime;
        }

        var replayLengthMs = batchEndTime - this.replayStartTime;

        var reqParams = {
            '$current_url': this.batchStartUrl,
            '$lib_version': Config.LIB_VERSION,
            'batch_start_time': batchStartTime / 1000,
            'mp_lib': 'web',
            'replay_id': replayId,
            'replay_length_ms': replayLengthMs,
            'replay_start_time': this.replayStartTime / 1000,
            'replay_start_url': this.replayStartUrl,
            'seq': this.seqNo
        };
        var eventsJson = JSON.stringify(data);
        Object.assign(reqParams, this.getUserIdInfo());

        if (CompressionStream) {
            var jsonStream = new Blob([eventsJson], {type: 'application/json'}).stream();
            var gzipStream = jsonStream.pipeThrough(new CompressionStream('gzip'));
            new Response(gzipStream)
                .blob()
                .then(function(compressedBlob) {
                    reqParams['format'] = 'gzip';
                    this._sendRequest(replayId, reqParams, compressedBlob, callback);
                }.bind(this));
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
