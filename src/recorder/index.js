import { record } from 'rrweb';
import { IncrementalSource, EventType } from '@rrweb/types';

import { MAX_RECORDING_MS, MAX_VALUE_FOR_MIN_RECORDING_MS, console_with_prefix, _, window} from '../utils'; // eslint-disable-line camelcase
import { addOptOutCheckMixpanelLib } from '../gdpr-utils';
import { RequestBatcher } from '../request-batcher';

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

var MixpanelRecorder = function(mixpanelInstance) {
    this._mixpanel = mixpanelInstance;

    // internal rrweb stopRecording function
    this._stopRecording = null;

    this.recEvents = [];
    this.seqNo = 0;
    this.replayId = null;
    this.replayStartTime = null;
    this.sendBatchId = null;

    this.idleTimeoutId = null;
    this.maxTimeoutId = null;

    this.recordMaxMs = MAX_RECORDING_MS;
    this.recordMinMs = 0;
    this._initBatcher();
};


MixpanelRecorder.prototype._initBatcher = function () {
    this.batcher = new RequestBatcher('__mprec', {
        libConfig: RECORDER_BATCHER_LIB_CONFIG,
        sendRequestFunc: _.bind(this.flushEventsWithOptOut, this),
        errorReporter: _.bind(this.reportError, this),
        flushOnlyOnInterval: true,
        usePersistence: false
    });
};

// eslint-disable-next-line camelcase
MixpanelRecorder.prototype.get_config = function(configVar) {
    return this._mixpanel.get_config(configVar);
};

MixpanelRecorder.prototype.startRecording = function (shouldStopBatcher) {
    if (this._stopRecording !== null) {
        logger.log('Recording already in progress, skipping startRecording.');
        return;
    }

    this.recordMaxMs = this.get_config('record_max_ms');
    if (this.recordMaxMs > MAX_RECORDING_MS) {
        this.recordMaxMs = MAX_RECORDING_MS;
        logger.critical('record_max_ms cannot be greater than ' + MAX_RECORDING_MS + 'ms. Capping value.');
    }

    this.recordMinMs = this.get_config('record_min_ms');
    if (this.recordMinMs > MAX_VALUE_FOR_MIN_RECORDING_MS) {
        this.recordMinMs = MAX_VALUE_FOR_MIN_RECORDING_MS;
        logger.critical('record_min_ms cannot be greater than ' + MAX_VALUE_FOR_MIN_RECORDING_MS + 'ms. Capping value.');
    }

    this.recEvents = [];
    this.seqNo = 0;
    this.replayStartTime = new Date().getTime();

    this.replayId = _.UUID();

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
        this.idleTimeoutId = setTimeout(_.bind(function () {
            logger.log('Idle timeout reached, restarting recording.');
            this.resetRecording();
        }, this), this.get_config('record_idle_timeout_ms'));
    }, this);

    var blockSelector = this.get_config('record_block_selector');
    if (blockSelector === '' || blockSelector === null) {
        blockSelector = undefined;
    }

    this._stopRecording = record({
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
        'blockClass': this.get_config('record_block_class'),
        'blockSelector': blockSelector,
        'collectFonts': this.get_config('record_collect_fonts'),
        'inlineImages': this.get_config('record_inline_images'),
        'maskAllInputs': true,
        'maskTextClass': this.get_config('record_mask_text_class'),
        'maskTextSelector': this.get_config('record_mask_text_selector')
    });

    resetIdleTimeout();

    this.maxTimeoutId = setTimeout(_.bind(this.resetRecording, this), this.recordMaxMs);
};

MixpanelRecorder.prototype.resetRecording = function () {
    this.stopRecording();
    this.startRecording(true);
};

MixpanelRecorder.prototype.stopRecording = function () {
    if (this._stopRecording !== null) {
        this._stopRecording();
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
    this.replayId = null;

    clearTimeout(this.idleTimeoutId);
    clearTimeout(this.maxTimeoutId);
};

/**
 * Flushes the current batch of events to the server, but passes an opt-out callback to make sure
 * we stop recording and dump any queued events if the user has opted out.
 */
MixpanelRecorder.prototype.flushEventsWithOptOut = function (data, options, cb) {
    this._flushEvents(data, options, cb, _.bind(this._onOptOut, this));
};

MixpanelRecorder.prototype._onOptOut = function (code) {
    // addOptOutCheckMixpanelLib invokes this function with code=0 when the user has opted out
    if (code === 0) {
        this.recEvents = [];
        this.stopRecording();
    }
};

MixpanelRecorder.prototype._sendRequest = function(currentReplayId, reqParams, reqBody, callback) {
    var onSuccess = _.bind(function (response, responseBody) {
        // Increment sequence counter only if the request was successful to guarantee ordering.
        // RequestBatcher will always flush the next batch after the previous one succeeds.
        // extra check to see if the replay ID has changed so that we don't increment the seqNo on the wrong replay
        if (response.status === 200 && this.replayId === currentReplayId) {
            this.seqNo++;
        }
        callback({
            status: 0,
            httpStatusCode: response.status,
            responseBody: responseBody,
            retryAfter: response.headers.get('Retry-After')
        });
    }, this);

    window['fetch'](this.get_config('api_host') + '/' + this.get_config('api_routes')['record'] + '?' + new URLSearchParams(reqParams), {
        'method': 'POST',
        'headers': {
            'Authorization': 'Basic ' + btoa(this.get_config('token') + ':'),
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

MixpanelRecorder.prototype._flushEvents = addOptOutCheckMixpanelLib(function (data, options, callback) {
    const numEvents = data.length;

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
            'distinct_id': String(this._mixpanel.get_distinct_id()),
            'seq': this.seqNo,
            'batch_start_time': batchStartTime / 1000,
            'replay_id': replayId,
            'replay_length_ms': replayLengthMs,
            'replay_start_time': this.replayStartTime / 1000
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


MixpanelRecorder.prototype.reportError = function(msg, err) {
    logger.error.apply(logger.error, arguments);
    try {
        if (!err && !(msg instanceof Error)) {
            msg = new Error(msg);
        }
        this.get_config('error_reporter')(msg, err);
    } catch(err) {
        logger.error(err);
    }
};


window['__mp_recorder'] = MixpanelRecorder;
