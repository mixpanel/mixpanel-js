import {record} from 'rrweb';

import { SessionRecording } from './session-recording';
import { console_with_prefix, _, window} from '../utils'; // eslint-disable-line camelcase

var logger = console_with_prefix('recorder');

/**
 * Recorder API: manages recordings and exposes methods public to the core Mixpanel library.
 * @param {Object} [options.mixpanelInstance] - reference to the core MixpanelLib
 */
var MixpanelRecorder = function(mixpanelInstance) {
    this._mixpanel = mixpanelInstance;
    this.activeRecording = null;
};

MixpanelRecorder.prototype.startRecording = function(shouldStopBatcher) {
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

    this.activeRecording = new SessionRecording({
        mixpanelInstance: this._mixpanel,
        onIdleTimeout: onIdleTimeout,
        onMaxLengthReached: onMaxLengthReached,
        replayId: _.UUID(),
        rrwebRecord: record
    });

    this.activeRecording.startRecording(shouldStopBatcher);
};

MixpanelRecorder.prototype.stopRecording = function() {
    if (this.activeRecording) {
        this.activeRecording.stopRecording();
        this.activeRecording = null;
    }
};

MixpanelRecorder.prototype.resetRecording = function () {
    this.stopRecording();
    this.startRecording(true);
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
