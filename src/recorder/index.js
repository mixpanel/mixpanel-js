import {default as record} from 'rrweb/es/rrweb/packages/rrweb/src/record/index.js';

import { MAX_RECORDING_MS, console_with_prefix, _, make_xhr_request } from '../utils'; // eslint-disable-line camelcase
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
    this.batchStartTime = null;
    this.replayLengthMs = 0;
    this.sendBatchId = null;

    this.idleTimeoutId = null;
    this.maxTimeoutId = null;

    this.recordMaxMs = MAX_RECORDING_MS;
    this._initBatcher();
};


MixpanelRecorder.prototype._initBatcher = function () {
    this.batcher = new RequestBatcher('__mprec', {
        batchSize: BATCH_SIZE,
        flushIntervalMs: BATCH_FLUSH_INTERVAL_MS,
        requestTimeoutMs: BATCH_REQUEST_TIMEOUT_MS,
        autoStart: true,
        sendRequestFunc: _.bind(function(data, options, callback) {
            this.sendRequestWithOptOut(data, options, callback);
        }, this),
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
    this.batchStartTime = this.replayStartTime;

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
MixpanelRecorder.prototype.flushEventsWithOptOut = function () {
    this._flushEvents(_.bind(this._onOptOut, this));
};

MixpanelRecorder.prototype.sendRequestWithOptOut = function (data, options, cb) {
    this._sendRequest(data, options, cb, _.bind(this._onOptOut, this));
};

MixpanelRecorder.prototype._onOptOut = function (code) {
    // addOptOutCheckMixpanelLib invokes this function with code=0 when the user has opted out
    if (code === 0) {
        this.recEvents = [];
        this.stopRecording();
    }
};

MixpanelRecorder.prototype._sendRequest = function(reqParams, reqBody) {
    window['fetch'](this.get_config('api_host') + '/' + this.get_config('api_routes')['record'] + '?' + new URLSearchParams(reqParams), {
        'method': 'POST',
        'headers': {
            'Authorization': 'Basic ' + btoa(this.get_config('token') + ':'),
            'Content-Type': 'application/octet-stream'
        },
        'body': reqBody
    });
};

/**
 * @api private
 * Private method, flushes the current batch of events to the server.
 */
MixpanelRecorder.prototype._flushEvents = addOptOutCheckMixpanelLib(function() {
    var numEvents = this.recEvents.length;
    if (numEvents > 0) {
        var reqParams = {
            'distinct_id': String(this._mixpanel.get_distinct_id()),
            'seq': this.seqNo++,
            'batch_start_time': this.batchStartTime / 1000,
            'replay_id': this.replayId,
            'replay_length_ms': this.replayLengthMs,
            'replay_start_time': this.replayStartTime / 1000
        };
        var eventsJson = _.JSONEncode(this.recEvents);

        // send ID management props if they exist
        var deviceId = this._mixpanel.get_property('$device_id');
        if (deviceId) {
            reqParams['$device_id'] = deviceId;
        }
        var userId = this._mixpanel.get_property('$user_id');
        if (userId) {
            reqParams['$user_id'] = userId;
        }

        this.recEvents = this.recEvents.slice(numEvents);
        this.batchStartTime = new Date().getTime();
        if (CompressionStream) {
            var jsonStream = new Blob([eventsJson], {type: 'application/json'}).stream();
            var gzipStream = jsonStream.pipeThrough(new CompressionStream('gzip'));
            new Response(gzipStream)
                .blob()
                .then(_.bind(function(compressedBlob) {
                    reqParams['format'] = 'gzip';
                    this._sendRequest(reqParams, compressedBlob);
                }, this));
        } else {
            reqParams['format'] = 'body';
            this._sendRequest(reqParams, eventsJson);
        }
    }
});

MixpanelRecorder.prototype._sendRequest = function (data, options, callback) {
    var url = this.get_config('api_host') + '/' + this.get_config('api_routes')['record'];
    var headers = {
        'Authorization': 'Basic ' + btoa(this.get_config('token') + ':'),
        'Content-Type': 'application/json'
    };

    var reqBody = {
        'distinct_id': String(this._mixpanel.get_distinct_id()),
        'events': data,
        'seq': this.seqNo++,
        'batch_start_time': this.batchStartTime / 1000,
        'replay_id': this.replayId,
        'replay_length_ms': this.replayLengthMs,
        'replay_start_time': this.replayStartTime / 1000
    };

    var reqOptions = _.extend({}, options, {
        method: 'POST',
        url: url,
        'body_data': JSON.stringify(reqBody),
        headers: headers,
        callback: callback,
    });

    make_xhr_request(reqOptions);
};

window['__mp_recorder'] = MixpanelRecorder;
