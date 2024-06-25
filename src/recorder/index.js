import {default as record} from 'rrweb/es/rrweb/packages/rrweb/src/record/index.js';

import { MAX_RECORDING_MS, console_with_prefix, _, } from '../utils'; // eslint-disable-line camelcase
import { addOptOutCheckMixpanelLib } from '../gdpr-utils';
import { RequestBatcher } from '../request-batcher';

var logger = console_with_prefix('recorder');
var CompressionStream = window['CompressionStream'];

var BATCH_SIZE = 1000;
var BATCH_FLUSH_INTERVAL_MS = 10 * 1000;
var BATCH_REQUEST_TIMEOUT_MS = 90 * 1000;

var MixpanelRecorder = function(mixpanelInstance) {
    this._mixpanel = mixpanelInstance;

    // internal rrweb stopRecording function
    this._stopRecording = null;

    this.recEvents = [];
    this.seqNo = 0;
    this.replayId = null;
    this.replayStartTime = null;
    this.replayLengthMs = 0;
    this.sendBatchId = null;

    this.idleTimeoutId = null;
    this.maxTimeoutId = null;

    this.recordMaxMs = MAX_RECORDING_MS;
    this._initBatcher();
};


MixpanelRecorder.prototype._initBatcher = function () {
    var libConfig = {
        'batch_size': BATCH_SIZE,
        'batch_flush_interval_ms': BATCH_FLUSH_INTERVAL_MS,
        'batch_request_timeout_ms': BATCH_REQUEST_TIMEOUT_MS,
        'batch_autostart': true,
    };

    this.batcher = new RequestBatcher('__mprec', {
        libConfig: libConfig,
        sendRequestFunc: _.bind(this.flushEventsWithOptOut, this),
        errorReporter: _.bind(this.reportError, this),
        forceDelayFlush: true,
        usePersistence: false,
    });
};

// eslint-disable-next-line camelcase
MixpanelRecorder.prototype.get_config = function(configVar) {
    return this._mixpanel.get_config(configVar);
};

MixpanelRecorder.prototype.startRecording = function () {
    if (this._stopRecording !== null) {
        logger.log('Recording already in progress, skipping startRecording.');
        return;
    }

    this.recordMaxMs = this.get_config('record_max_ms');
    if (this.recordMaxMs > MAX_RECORDING_MS) {
        this.recordMaxMs = MAX_RECORDING_MS;
        logger.critical('record_max_ms cannot be greater than ' + MAX_RECORDING_MS + 'ms. Capping value.');
    }

    this.recEvents = [];
    this.seqNo = 0;
    this.startDate = new Date();
    this.replayStartTime = this.startDate.getTime();

    this.replayId = _.UUID();
    this.replayLengthMs = 0;

    this.batcher.start();

    var resetIdleTimeout = _.bind(function () {
        clearTimeout(this.idleTimeoutId);
        this.idleTimeoutId = setTimeout(_.bind(function () {
            logger.log('Idle timeout reached, restarting recording.');
            this.resetRecording();
        }, this), this.get_config('record_idle_timeout_ms'));
    }, this);

    this._stopRecording = record({
        'emit': _.bind(function (ev) {
            this.batcher.enqueue(ev);
            this.replayLengthMs = new Date().getTime() - this.replayStartTime;
            resetIdleTimeout();
        }, this),
        'maskAllInputs': true,
        'maskTextSelector': this.get_config('record_mask_text_selector'),
        'blockSelector': this.get_config('record_block_selector'),
        'maskTextClass': this.get_config('record_mask_text_class'),
        'blockClass': this.get_config('record_block_class'),
    });

    resetIdleTimeout();

    this.maxTimeoutId = setTimeout(_.bind(this.resetRecording, this), this.recordMaxMs);
};

MixpanelRecorder.prototype.resetRecording = function () {
    this.stopRecording();
    this.startRecording();
};

MixpanelRecorder.prototype.stopRecording = function () {
    if (this._stopRecording !== null) {
        this._stopRecording();
        this._stopRecording = null;
    }

    this.batcher.flush(); // flush any remaining events
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

MixpanelRecorder.prototype._sendRequest = function(reqParams, reqBody, callback) {
    window['fetch'](this.get_config('api_host') + '/' + this.get_config('api_routes')['record'] + '?' + new URLSearchParams(reqParams), {
        'method': 'POST',
        'headers': {
            'Authorization': 'Basic ' + btoa(this.get_config('token') + ':'),
            'Content-Type': 'application/octet-stream'
        },
        'body': reqBody,
    }).then(function (response) {
        response.json().then(function (responseBody) {
            callback({status: response.status, responseBody: responseBody, retryAfter: response.headers.get('Retry-After')});
        }).catch(function (error) {
            callback({error: error});
        });
    }).catch(function (error) {
        callback({error: error});
    });
};

MixpanelRecorder.prototype._flushEvents = addOptOutCheckMixpanelLib(function (data, options, callback) {
    const numEvents = data.length;

    if (numEvents > 0) {
        // TODO(jakub): make time props based on rrweb events for max accuracy
        var batchStartTime = data[0].timestamp;

        var reqParams = {
            'distinct_id': String(this._mixpanel.get_distinct_id()),
            'seq': this.seqNo++,
            'batch_start_time': batchStartTime / 1000,
            'replay_id': this.replayId,
            'replay_length_ms': this.replayLengthMs,
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
            reqParams['format'] = 'gzip';
            var jsonStream = new Blob([eventsJson], {type: 'application/json'}).stream();
            var gzipStream = jsonStream.pipeThrough(new CompressionStream('gzip'));
            new Response(gzipStream)
                .blob()
                .then(_.bind(function(compressedBlob) {
                    reqParams['format'] = 'gzip';
                    this._sendRequest(reqParams, compressedBlob, callback);
                }, this));
        } else {
            reqParams['format'] = 'body';
            this._sendRequest(reqParams, eventsJson, callback);
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
