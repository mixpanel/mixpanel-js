import { record } from 'rrweb';
import { Promise } from '../promise-polyfill';
import { SessionRecording } from './session-recording';
import { RecordingRegistry } from './recording-registry';

import { console_with_prefix, _ } from '../utils'; // eslint-disable-line camelcase

var logger = console_with_prefix('recorder');

/**
 * Recorder API: bundles rrweb and and exposes methods to start and stop recordings.
 * @param {Object} [options.mixpanelInstance] - reference to the core MixpanelLib
*/
var MixpanelRecorder = function(mixpanelInstance, rrwebRecord, sharedLockStorage) {
    this.mixpanelInstance = mixpanelInstance;
    this.rrwebRecord = rrwebRecord || record;
    this.sharedLockStorage = sharedLockStorage;

    /**
     * @member {import('./registry').RecordingRegistry}
     */
    this.recordingRegistry = new RecordingRegistry({
        mixpanelInstance: this.mixpanelInstance,
        errorReporter: logger.error,
        sharedLockStorage: sharedLockStorage
    });
    this._flushInactivePromise = this.recordingRegistry.flushInactiveRecordings();

    this.activeRecording = null;
};

MixpanelRecorder.prototype.startRecording = function(options) {
    options = options || {};
    if (this.activeRecording && !this.activeRecording.isRrwebStopped()) {
        logger.log('Recording already in progress, skipping startRecording.');
        return;
    }

    var onIdleTimeout = function () {
        logger.log('Idle timeout reached, restarting recording.');
        this.resetRecording();
    }.bind(this);

    var onMaxLengthReached = function () {
        logger.log('Max recording length reached, stopping recording.');
        this.resetRecording();
    }.bind(this);

    var onBatchSent = function () {
        this.recordingRegistry.setActiveRecording(this.activeRecording.serialize());
        this['__flushPromise'] = this.activeRecording.batcher._flushPromise;
    }.bind(this);

    /**
     * @type {import('./session-recording').SessionRecordingOptions}
     */
    var sessionRecordingOptions = {
        mixpanelInstance: this.mixpanelInstance,
        onBatchSent: onBatchSent,
        onIdleTimeout: onIdleTimeout,
        onMaxLengthReached: onMaxLengthReached,
        replayId: _.UUID(),
        rrwebRecord: this.rrwebRecord,
        sharedLockStorage: this.sharedLockStorage
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
    var stopPromise = this._stopCurrentRecording(false);
    this.recordingRegistry.clearActiveRecording();
    this.activeRecording = null;
    return stopPromise;
};

MixpanelRecorder.prototype.pauseRecording = function() {
    return this._stopCurrentRecording(false);
};

MixpanelRecorder.prototype._stopCurrentRecording = function(skipFlush) {
    if (this.activeRecording) {
        return this.activeRecording.stopRecording(skipFlush);
    }
    return Promise.resolve();
};

MixpanelRecorder.prototype.resumeRecording = function (startNewIfInactive) {
    if (this.activeRecording && this.activeRecording.isRrwebStopped()) {
        this.activeRecording.startRecording(false);
        return Promise.resolve(null);
    }

    return this.recordingRegistry.getActiveRecording()
        .then(function (activeSerializedRecording) {
            if (activeSerializedRecording) {
                return this.startRecording({activeSerializedRecording: activeSerializedRecording});
            } else if (startNewIfInactive) {
                return this.startRecording({shouldStopBatcher: false});
            } else {
                logger.log('No resumable recording found.');
                return null;
            }
        }.bind(this));
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


export { MixpanelRecorder };
