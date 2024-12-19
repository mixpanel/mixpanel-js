import {record} from 'rrweb';

import { SessionRecording } from './session-recording';
import { console_with_prefix, _ } from '../utils'; // eslint-disable-line camelcase
import { window } from '../window';

var logger = console_with_prefix('recorder');

/**
 * Recorder API: bundles rrweb and and exposes methods to start and stop recordings.
 * @param {Object} [options.mixpanelInstance] - reference to the core MixpanelLib
 * @param {import('../recording-registry').RecordingRegistry} [options.recordingRegistry] - reference to the recording registry
*/
var MixpanelRecorder = function(options) {
    this.mixpanelInstance = options.mixpanelInstance;

    /**
     * @type {import('../recording-registry').RecordingRegistry}
     */
    this.recordingRegistry = options.recordingRegistry;
    this.activeRecording = null;
};

MixpanelRecorder.prototype.startRecording = function(options) {
    options = options || {};
    if (this.activeRecording && !this.activeRecording.isRrwebStopped()) {
        logger.log('Recording already in progress, skipping startRecording.');
        return;
    }

    var onIdleTimeout = _.bind(function () {
        logger.log('Idle timeout reached, restarting recording.');
        this.resetRecording();
    }, this);

    var onMaxLengthReached = _.bind(function () {
        logger.log('Max recording length reached, stopping recording.');
        this.resetRecording();
    }, this);

    var onBatchSent = _.bind(function () {
        this.recordingRegistry.setActiveRecording(this.activeRecording.serialize());
    }, this);

    this.activeRecording = new SessionRecording({
        mixpanelInstance: this.mixpanelInstance,
        onBatchSent: onBatchSent,
        onIdleTimeout: onIdleTimeout,
        onMaxLengthReached: onMaxLengthReached,
        replayId: _.UUID(),
        rrwebRecord: record,
        serializedRecording: options.activeSerializedRecording
    });

    this.activeRecording.startRecording(options.shouldStopBatcher);
    this.recordingRegistry.setActiveRecording(this.activeRecording.serialize());
};

MixpanelRecorder.prototype.stopRecording = function() {
    if (this.activeRecording) {
        this.activeRecording.stopRecording();
        this.recordingRegistry.clearActiveRecording();
        this.activeRecording = null;
    }
};

MixpanelRecorder.prototype.resetRecording = function () {
    this.stopRecording();
    this.startRecording({shouldStopBatcher: true});
};

MixpanelRecorder.prototype.getActiveReplayId = function () {
    if (this.activeRecording && !this.activeRecording.isRrwebStopped()) {
        return this.activeRecording.replayId;
    } else {
        return null;
    }
};

// getter so that older mixpanel-core versions can still retrieve the replay ID
// when pulling the latest recorder bundle from the CDN
Object.defineProperty(MixpanelRecorder.prototype, 'replayId', {
    get: function () {
        return this.getActiveReplayId();
    }
});

window['__mp_recorder'] = MixpanelRecorder;
