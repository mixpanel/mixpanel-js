import { record } from 'rrweb';
import { Promise } from '../promise-polyfill';
import { SessionRecording } from './session-recording';
import { RecordingRegistry } from './recording-registry';

import { console_with_prefix, _ } from '../utils'; // eslint-disable-line camelcase
import { window } from '../window';

var logger = console_with_prefix('recorder');

/**
 * Recorder API: bundles rrweb and and exposes methods to start and stop recordings.
 * @param {Object} [options.mixpanelInstance] - reference to the core MixpanelLib
*/
var MixpanelRecorder = function(mixpanelInstance) {
    this.mixpanelInstance = mixpanelInstance;

    /**
     * @member {import('./registry').RecordingRegistry}
     */
    this.recordingRegistry = new RecordingRegistry({mixpanelInstance: this.mixpanelInstance, errorReporter: logger.error});
    this.recordingRegistry.flushInactiveRecordings();
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
        this['__flushPromise'] = this.activeRecording.batcher._flushPromise;
    }, this);

    /**
     * @type {import('./session-recording').SessionRecordingOptions}
     */
    var sessionRecordingOptions = {
        mixpanelInstance: this.mixpanelInstance,
        onBatchSent: onBatchSent,
        onIdleTimeout: onIdleTimeout,
        onMaxLengthReached: onMaxLengthReached,
        replayId: _.UUID(),
        rrwebRecord: record,
    };

    if (options.activeSerializedRecording) {
        this.activeRecording = SessionRecording.deserialize(options.activeSerializedRecording, sessionRecordingOptions);
    } else {
        this.activeRecording = new SessionRecording(sessionRecordingOptions);
    }

    this.activeRecording.startRecording(options.shouldStopBatcher);
    return this.recordingRegistry.setActiveRecording(this.activeRecording.serialize());
};

MixpanelRecorder.prototype.stopRecording = function() {
    if (this.activeRecording) {
        this.activeRecording.stopRecording();
        this.recordingRegistry.clearActiveRecording();
        this.activeRecording = null;
    }
};

MixpanelRecorder.prototype.pauseRecording = function() {
    if (this.activeRecording) {
        this.activeRecording.stopRecording();
    }
};

MixpanelRecorder.prototype.resumeRecording = function (startNewIfInactive) {
    if (this.activeRecording && this.activeRecording.isRrwebStopped()) {
        this.activeRecording.startRecording(false);
        return Promise.resolve(null);
    }

    return this.recordingRegistry.getActiveRecording()
        .then(_.bind(function (activeSerializedRecording) {
            if (activeSerializedRecording) {
                return this.startRecording({activeSerializedRecording: activeSerializedRecording});
            } else if (startNewIfInactive) {
                this.startRecording({shouldStopBatcher: false});
            } else {
                logger.info('No resumable recording found.');
                return null;
            }
        }, this));
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
