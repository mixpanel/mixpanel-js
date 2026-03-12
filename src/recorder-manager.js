/* eslint camelcase: "off" */
import {RECORDER_FILENAME, TARGETING_FILENAME, RECORDER_GLOBAL_NAME} from './config';
import { _, console, safewrap, safewrapClass } from './utils';
import { window } from './window';
import { Promise } from './promise-polyfill';
import { IDBStorageWrapper, RECORDING_REGISTRY_STORE_NAME } from './storage/indexed-db';
import { isRecordingExpired } from './recorder/utils';
import { getTargetingPromise } from './targeting/loader';


/**
 * RecorderManager: manages session recording initialization, lifecycle and state
 * @constructor
 */
var RecorderManager = function(initOptions) {
    // TODO - Passing in mixpanel instance as it is still needed for recorder creation
    // but ideally we should be able to remove this dependency.
    this.mixpanelInstance = initOptions.mixpanelInstance;

    this.getMpConfig = initOptions.getConfigFunc;
    this.getTabId = initOptions.getTabIdFunc;
    this.reportError = initOptions.reportErrorFunc;
    this.getDistinctId = initOptions.getDistinctIdFunc;
    this.loadExtraBundle = initOptions.loadExtraBundle;
    this.recorderSrc = initOptions.recorderSrc;
    this.targetingSrc = initOptions.targetingSrc;
    this.libBasePath = initOptions.libBasePath;

    this._recorder = null;
};

RecorderManager.prototype.shouldLoadRecorder = function() {
    if (this.getMpConfig('disable_persistence')) {
        console.log('Load recorder check skipped due to disable_persistence config');
        return Promise.resolve(false);
    }

    var recording_registry_idb = new IDBStorageWrapper(RECORDING_REGISTRY_STORE_NAME);
    var tab_id = this.getTabId();
    return recording_registry_idb.init()
        .then(function () {
            return recording_registry_idb.getAll();
        })
        .then(function (recordings) {
            for (var i = 0; i < recordings.length; i++) {
                // if there are expired recordings in the registry, we should load the recorder to flush them
                // if there's a recording for this tab id, we should load the recorder to continue the recording
                if (isRecordingExpired(recordings[i]) || recordings[i]['tabId'] === tab_id) {
                    return true;
                }
            }
            return false;
        })
        .catch(_.bind(function (err) {
            this.reportError('Error checking recording registry', err);
            return false;
        }, this));
};

RecorderManager.prototype.checkAndStartSessionRecording = function(force_start, rate) {
    if (!window['MutationObserver']) {
        console.critical('Browser does not support MutationObserver; skipping session recording');
        return Promise.resolve();
    }

    var loadRecorder = _.bind(function(startNewIfInactive) {
        return new Promise(_.bind(function(resolve) {
            var handleLoadedRecorder = safewrap(_.bind(function() {
                this._recorder = this._recorder || new window[RECORDER_GLOBAL_NAME](this.mixpanelInstance);
                this._recorder['resumeRecording'](startNewIfInactive);
                resolve();
            }, this));

            if (_.isUndefined(window[RECORDER_GLOBAL_NAME])) {
                var recorderSrc = this.recorderSrc || (this.libBasePath + RECORDER_FILENAME);
                this.loadExtraBundle(recorderSrc, handleLoadedRecorder);
            } else {
                handleLoadedRecorder();
            }
        }, this));
    }, this);

    /**
     * If the user is sampled or start_session_recording is called, we always load the recorder since it's guaranteed a recording should start.
     * Otherwise, if the recording registry has any records then it's likely there's a recording in progress or orphaned data that needs to be flushed.
     */
    var effective_rate = _.isUndefined(rate) ? this.getMpConfig('record_sessions_percent') : rate;
    var is_sampled = effective_rate > 0 && Math.random() * 100 <= effective_rate;
    if (force_start || is_sampled) {
        return loadRecorder(true);
    } else {
        return this.shouldLoadRecorder()
            .then(_.bind(function (shouldLoad) {
                if (shouldLoad) {
                    return loadRecorder(false);
                }
                return Promise.resolve();
            }, this));
    }
};

RecorderManager.prototype.isRecording = function() {
    // Safety check: ensure isRecording method exists (older CDN builds may not have it)
    if (!this._recorder || !_.isFunction(this._recorder['isRecording'])) {
        return false;
    }
    try {
        return this._recorder['isRecording']();
    } catch (e) {
        this.reportError('Error checking if recording is active', e);
        return false;
    }
};

RecorderManager.prototype.startRecordingOnEvent = function(event_name, properties) {
    var isRecording = this.isRecording();
    var recordingTriggerEvents = this.getMpConfig('recording_event_triggers');

    if (!isRecording && recordingTriggerEvents) {
        var trigger = recordingTriggerEvents[event_name];
        if (trigger && typeof trigger['percentage'] === 'number') {
            var newRate = trigger['percentage'];
            var propertyFilters = trigger['property_filters'];
            if (propertyFilters && !_.isEmptyObject(propertyFilters)) {
                var targetingSrc = this.targetingSrc || (this.libBasePath + TARGETING_FILENAME);
                getTargetingPromise(this.loadExtraBundle, targetingSrc)
                    .then(function(targeting) {
                        try {
                            var result = targeting['eventMatchesCriteria'](
                                event_name,
                                properties,
                                {
                                    'event_name': event_name,
                                    'property_filters': propertyFilters
                                }
                            );
                            if (result['matches']) {
                                this.checkAndStartSessionRecording(false, newRate);
                            }
                        } catch (err) {
                            console.critical('Could not parse recording event trigger properties logic:', err);
                        }
                    }.bind(this)).catch(function(err) {
                        console.critical('Failed to load targeting library:', err);
                    });
            } else {
                this.checkAndStartSessionRecording(false, newRate);
            }
        }
    }
};

RecorderManager.prototype.stopSessionRecording = function() {
    if (this._recorder) {
        return this._recorder['stopRecording']();
    }
    return Promise.resolve();
};

RecorderManager.prototype.pauseSessionRecording = function() {
    if (this._recorder) {
        return this._recorder['pauseRecording']();
    }
    return Promise.resolve();
};

RecorderManager.prototype.resumeSessionRecording = function() {
    if (this._recorder) {
        return this._recorder['resumeRecording']();
    }
    return Promise.resolve();
};

RecorderManager.prototype.isRecordingHeatmapData = function() {
    return this.getSessionReplayId() && this.getMpConfig('record_heatmap_data');
};

RecorderManager.prototype.getSessionRecordingProperties = function() {
    var props = {};
    var replay_id = this.getSessionReplayId();
    if (replay_id) {
        props['$mp_replay_id'] = replay_id;
    }
    return props;
};

RecorderManager.prototype.getSessionReplayUrl = function() {
    var replay_url = null;
    var replay_id = this.getSessionReplayId();
    if (replay_id) {
        var query_params = _.HTTPBuildQuery({
            'replay_id': replay_id,
            'distinct_id': this.getDistinctId(),
            'token': this.getMpConfig('token')
        });
        replay_url = 'https://mixpanel.com/projects/replay-redirect?' + query_params;
    }
    return replay_url;
};

RecorderManager.prototype.getSessionReplayId = function() {
    var replay_id = null;
    if (this._recorder) {
        replay_id = this._recorder['replayId'];
    }
    return replay_id || null;
};

// "private" public method to reach into the recorder in test cases
RecorderManager.prototype.getRecorder = function() {
    return this._recorder;
};

safewrapClass(RecorderManager);

export { RecorderManager };
