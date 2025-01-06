import { Promise } from './promise-polyfill';
import { IDBStorageWrapper, RECORDING_REGISTRY_STORE_NAME } from './storage/indexed-db';
import { SessionRecording } from './recorder/session-recording';
import { _ } from './utils';
import { window } from './window';

/**
 * Module for handling the storage and retrieval of recording metadata as well as any active recordings.
 * Makes sure that only one tab can be recording at a time.
 */
var RecordingRegistry = function (options) {
    this.idb = new IDBStorageWrapper(RECORDING_REGISTRY_STORE_NAME);
    this.errorReporter = options.errorReporter;
    this.mixpanelInstance = options.mixpanelInstance;

    this.flushInactiveRecordings();

    this._hasTabLock = null;
    this.tabLockKey = 'mp_recording_tab_lock_' + this.mixpanelInstance.get_config('token');
    this.activeReplayIdKey = 'mp_active_replay_id_' + this.mixpanelInstance.get_config('token');
};

RecordingRegistry.prototype.handleIdbError = function (err) {
    this.errorReporter('IndexedDB error: ', err);
};

/**
 * @param {import('./recorder/session-recording').SerializedRecording} recording
 */
RecordingRegistry.prototype.setActiveRecording = function (serializedRecording) {
    window.sessionStorage.setItem(this.activeReplayIdKey, serializedRecording['replayId']);
    return this.idb.init()
        .then(_.bind(function () {
            return this.idb.setItem(serializedRecording['replayId'], serializedRecording);
        }, this))
        .catch(_.bind(this.handleIdbError, this));
};

/**
 * @param {string} replayId
 * @returns {Promise<import('./recorder/session-recording').SerializedRecording>}
 */
RecordingRegistry.prototype.getActiveRecording = function () {
    var replayId = this._getActiveReplayId();
    var activeRecordingPromise;
    if (replayId) {
        activeRecordingPromise = this.idb.init()
            .then(_.bind(function () {
                return this.idb.getItem(replayId);
            }, this))
            .then(_.bind(function (serializedRecording) {
                if (serializedRecording && this._isExpired(serializedRecording)) {
                    return null;
                } else {
                    return serializedRecording;
                }
            }, this))
            .catch(_.bind(this.handleIdbError, this));
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
            // clean up any expired recordings from the registry, non-expired ones may be active in other tabs
            var expiredRecordings = serializedRecordings.filter(_.bind(function (serializedRecording) {
                return this._isExpired(serializedRecording);
            }, this));

            return Promise.all(
                expiredRecordings.map(_.bind(function (serializedRecording) {
                    return this.idb.removeItem(serializedRecording['replayId']);
                }, this))
            );
        }, this))
        .catch(_.bind(this.handleIdbError, this));
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
                window.addEventListener('beforeunload', _.bind(function () {
                    window.sessionStorage.removeItem(this.tabLockKey);
                }, this));
            }
        } catch (err) {
            this.errorReporter('checking tab lock failed', err);
            this._hasTabLock = false;
        }
    }

    return this._hasTabLock;
};

RecordingRegistry.prototype._getActiveReplayId = function () {
    var replayId = null;
    // todo(jakub) test what happens here after a tab is duplicated along with the lock, then it also falls into the sample and starts recording
    if (this._getTabLock()) {
        replayId = window.sessionStorage.getItem(this.activeReplayIdKey);
    }
    return replayId;
};

/**
 * @param {import('./recorder/session-recording').SerializedRecording} serializedRecording
 * @returns {boolean}
 */
RecordingRegistry.prototype._isExpired = function (serializedRecording) {
    var now = new Date().getTime();
    return now > serializedRecording['maxExpires'] || now > serializedRecording['idleExpires'];
};

export { RecordingRegistry };
