import { Promise } from './promise-polyfill';
import { IDBStorageWrapper, RECORDING_REGISTRY_STORE_NAME } from './storage/indexed-db';
import { SessionRecording } from './recorder/session-recording';
import { _, window } from './utils';

/**
 * Module for handling the storage and retrieval of recording metadata as well as any active recordings.
 * Makes sure that only one tab can be recording at a time.
 */
var RecordingRegistry = function (options) {
    this.idb = new IDBStorageWrapper(RECORDING_REGISTRY_STORE_NAME);
    this.errorReporter = options.errorReporter;
    this.mixpanelInstance = options.mixpanelInstance;

    this.idb.init();
    this.flushInactiveRecordings();

    this._hasTabLock = null;
    this.tabLockKey = 'mp_recording_tab_lock_' + this.mixpanelInstance.get_config('token');
    this.activeReplayIdKey = 'mp_active_replay_id' + this.mixpanelInstance.get_config('token');
};

/**
 * @param {import('./recorder/session-recording').SerializedRecording} recording
 */
RecordingRegistry.prototype.setRecording = function (serializedRecording) {
    window.sessionStorage.setItem(this.activeReplayIdKey, serializedRecording['replayId']);
    return this.idb.setItem(serializedRecording['replayId'], serializedRecording);
};

/**
 * @param {string} replayId
 * @returns {Promise<import('./recorder/session-recording').SerializedRecording>}
 */
RecordingRegistry.prototype.getActiveRecording = function () {
    var replayId = this._getActiveReplayId();
    var activeRecordingPromise;
    var now = new Date().getTime();
    if (replayId) {
        activeRecordingPromise = this.idb.getItem(replayId)
            .then(function (serializedRecording) {
                if (now > serializedRecording['expires']) {
                    return null;
                } else {
                    return serializedRecording;
                }
            });
    } else {
        activeRecordingPromise = Promise.resolve(null);
    }

    return activeRecordingPromise;
};

RecordingRegistry.prototype.clearActiveRecording = function () {
    // don't clear recording metadata from IDB in case the page unloads mid-flush and doesn't make it to ingestion
    // this will ensure the next pageload doesn't try to re-record the same session
    window.sessionStorage.removeItem(this.activeReplayIdKey);
};

/**
 * Flush any inactive recordings from the registry to minimize data loss.
 * The main idea here is that we can flush remaining rrweb events on the next page load when a user navigates away mid-batch.
 */
RecordingRegistry.prototype.flushInactiveRecordings = function () {
    var now = new Date().getTime();
    var serializedRecordings = [];

    return this.idb.init()
        .then(_.bind(function() {
            return this.idb.getAll();
        }, this))
        .then(_.bind(function (s) {
            serializedRecordings = s;

            // flush any recordings that are not currently active, the active one will continue tracking
            var activeReplayId = this._getActiveReplayId();
            var inactiveRecordings = serializedRecordings.filter(function (serializedRecording) {
                return serializedRecording['replayId'] !== activeReplayId;
            });

            return Promise.all(
                inactiveRecordings.map(_.bind(function (serializedRecording) {
                    var sessionRecording = new SessionRecording({
                        mixpanelInstance: this.mixpanelInstance,
                        serializedRecording: serializedRecording
                    });
                    return sessionRecording.unloadPersistedData();
                }, this))
            );
        }, this))
        .then(_.bind(function() {
            // clean up any expired recordings from the registry
            var expiredRecordings = serializedRecordings.filter(function (serializedRecording) {
                return now > serializedRecording['expires'];
            });

            return Promise.all(
                expiredRecordings.map(_.bind(function (serializedRecording) {
                    return this.idb.removeItem(serializedRecording['replayId']);
                }, this))
            );
        }, this));
};

/**
 * Ensures that only one tab can be recording at a time by leveraging a simple sessionStorage key.
 * Since we're using sessionStorage, this is only needed to cover the case of duplicating a tab
 * which will copy session storage over to the new tab.
 */
RecordingRegistry.prototype._getTabLock = function () {
    if (this._hasTabLock === null) {
        try {
            this._hasTabLock = !window.sessionStorage.getItem(this.tabLockKey);

            if (this._hasTabLock) {
                window.sessionStorage.setItem(this.tabLockKey, '1');
                window.addEventListener('beforeunload', function () {
                    window.sessionStorage.removeItem(this.tabLockKey);
                });
            }
        } catch (err) {
            this.reportError('checking tab lock failed', err);
            this._hasTabLock = false;
        }
    }

    return this._hasTabLock;
};

RecordingRegistry.prototype._getActiveReplayId = function () {
    var replayId = null;
    if (this._getTabLock()) {
        var activeReplayKey = 'mp_active_replay_id' + this.mixpanelInstance.get_config('token');
        replayId = window.sessionStorage.getItem(activeReplayKey);
    }
    return replayId;
};

export { RecordingRegistry };
