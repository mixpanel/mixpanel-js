import {default as record} from 'rrweb/es/rrweb/packages/rrweb/src/record/index.js';

import { MAX_RECORDING_MS, console_with_prefix, _ } from '../utils'; // eslint-disable-line camelcase
import { addOptOutCheckMixpanelLib } from '../gdpr-utils';

var logger = console_with_prefix('recorder');

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

    var resetIdleTimeout = _.bind(function () {
        clearTimeout(this.idleTimeoutId);
        this.idleTimeoutId = setTimeout(_.bind(function () {
            logger.log('Idle timeout reached, restarting recording.');
            this.resetRecording();
        }, this), this.get_config('record_idle_timeout_ms'));
    }, this);

    this._stopRecording = record({
        'emit': _.bind(function (ev) {
            this.recEvents.push(ev);
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

    this.sendBatchId = setInterval(_.bind(this.flushEventsWithOptOut, this), 10000);
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

    this._flushEvents(); // flush any remaining events
    this.replayId = null;

    clearInterval(this.sendBatchId);
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

MixpanelRecorder.prototype._onOptOut = function (code) {
    // addOptOutCheckMixpanelLib invokes this function with code=0 when the user has opted out
    if (code === 0) {
        this.recEvents = [];
        this.stopRecording();
    }
};

/**
 * @api private
 * Private method, flushes the current batch of events to the server.
 */
MixpanelRecorder.prototype._flushEvents = addOptOutCheckMixpanelLib(function() {
    var numEvents = this.recEvents.length;
    if (numEvents > 0) {
        var reqBody = {
            'distinct_id': String(this._mixpanel.get_distinct_id()),
            'events': this.recEvents,
            'seq': this.seqNo++,
            'batch_start_time': this.batchStartTime / 1000,
            'replay_id': this.replayId,
            'replay_length_ms': this.replayLengthMs,
            'replay_start_time': this.replayStartTime / 1000
        };

        // send ID management props if they exist
        var deviceId = this._mixpanel.get_property('$device_id');
        if (deviceId) {
            reqBody['$device_id'] = deviceId;
        }
        var userId = this._mixpanel.get_property('$user_id');
        if (userId) {
            reqBody['$user_id'] = userId;
        }

        window['fetch'](this.get_config('api_host') + '/' + this.get_config('api_routes')['record'], {
            'method': 'POST',
            'headers': {
                'Authorization': 'Basic ' + btoa(this.get_config('token') + ':'),
                'Content-Type': 'application/json'
            },
            'body': _.JSONEncode(reqBody)
        });
        this.recEvents = this.recEvents.slice(numEvents);
        this.batchStartTime = new Date().getTime();
    }
});

window['__mp_recorder'] = MixpanelRecorder;
