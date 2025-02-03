import { Promise } from '../promise-polyfill';
import { IDBStorageWrapper, RECORDING_REGISTRY_STORE_NAME } from '../storage/indexed-db';
import { SessionRecording } from './session-recording';
import { _ } from '../utils';

/**
 * Module for handling the storage and retrieval of recording metadata as well as any active recordings.
 * Makes sure that only one tab can be recording at a time.
 */
var RecordingRegistry = function (options) {
    this.idb = new IDBStorageWrapper(RECORDING_REGISTRY_STORE_NAME);
    this.errorReporter = options.errorReporter;
    this.mixpanelInstance = options.mixpanelInstance;
    this.sharedLockStorage = options.sharedLockStorage;
};

RecordingRegistry.prototype.handleError = function (err) {
    this.errorReporter('IndexedDB error: ', err);
};

/**
 * @param {import('./session-recording').SerializedRecording} serializedRecording
 */
RecordingRegistry.prototype.setActiveRecording = function (serializedRecording) {
    return this.idb.init()
        .then(_.bind(function () {
            return this.idb.setItem(this.mixpanelInstance.get_tab_id(), serializedRecording);
        }, this))
        .catch(_.bind(this.handleError, this));
};

/**
 * @returns {Promise<import('./session-recording').SerializedRecording>}
 */
RecordingRegistry.prototype.getActiveRecording = function () {
    return this.idb.init()
        .then(_.bind(function () {
            return this.idb.getItem(this.mixpanelInstance.get_tab_id());
        }, this))
        .then(_.bind(function (serializedRecording) {
            if (serializedRecording && this._isExpired(serializedRecording)) {
                return null;
            } else {
                return serializedRecording;
            }
        }, this))
        .catch(_.bind(this.handleError, this));
};

RecordingRegistry.prototype.clearActiveRecording = function () {
    // mark recording as expired instead of deleting it in case the page unloads mid-flush and doesn't make it to ingestion.
    // this will ensure the next pageload will flush the remaining events, but not try to continue the recording.
    return this.getActiveRecording()
        .then(_.bind(function (serializedRecording) {
            if (serializedRecording) {
                serializedRecording['maxExpires'] = 0;
                return this.setActiveRecording(serializedRecording);
            }
        }, this))
        .catch(_.bind(this.handleError, this));
};

/**
 * Flush any inactive recordings from the registry to minimize data loss.
 * The main idea here is that we can flush remaining rrweb events on the next page load if a tab is closed mid-batch.
 */
RecordingRegistry.prototype.flushInactiveRecordings = function () {
    var inactiveRecordings = [];
    return this.idb.init()
        .then(_.bind(function() {
            return this.idb.getAll();
        }, this))
        .then(_.bind(function (serializedRecordings) {
            // clean up any expired recordings from the registry, non-expired ones may be active in other tabs
            inactiveRecordings = serializedRecordings.filter(_.bind(function (serializedRecording) {
                return this._isExpired(serializedRecording);
            }, this));

            return Promise.all(
                inactiveRecordings.map(_.bind(function (serializedRecording) {
                    var sessionRecording = SessionRecording.deserialize(serializedRecording, {
                        mixpanelInstance: this.mixpanelInstance,
                        sharedLockStorage: this.sharedLockStorage
                    });
                    return sessionRecording.unloadPersistedData();
                }, this))
            );
        }, this))
        .then(_.bind(function() {
            // expired recordings were successfully flushed, we can clean them up from the registry
            return Promise.all(
                inactiveRecordings.map(_.bind(function (serializedRecording) {
                    return this.idb.removeItem(serializedRecording['tabId']);
                }, this))
            );
        }, this))
        .catch(_.bind(this.handleError, this));
};

/**
 * @param {import('./session-recording').SerializedRecording} serializedRecording
 * @returns {boolean}
 */
RecordingRegistry.prototype._isExpired = function (serializedRecording) {
    var now = new Date().getTime();
    return now > serializedRecording['maxExpires'] || now > serializedRecording['idleExpires'];
};

export { RecordingRegistry };
