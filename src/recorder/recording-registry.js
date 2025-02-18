import { Promise } from '../promise-polyfill';
import { IDBStorageWrapper, RECORDING_REGISTRY_STORE_NAME } from '../storage/indexed-db';
import { SessionRecording } from './session-recording';
import { isRecordingExpired } from './utils';
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
    var tabId = this.mixpanelInstance.get_tab_id();
    if (!tabId) {
        console.warn('No tab ID is set, cannot persist recording metadata.');
        return Promise.resolve();
    }

    return this.idb.init()
        .then(_.bind(function () {
            return this.idb.setItem(tabId, serializedRecording);
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
            return isRecordingExpired(serializedRecording) ? null : serializedRecording;
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
    return this.idb.init()
        .then(_.bind(function() {
            return this.idb.getAll();
        }, this))
        .then(_.bind(function (serializedRecordings) {
            // clean up any expired recordings from the registry, non-expired ones may be active in other tabs
            var unloadPromises = serializedRecordings
                .filter(function (serializedRecording) {
                    return isRecordingExpired(serializedRecording);
                })
                .map(_.bind(function (serializedRecording) {
                    var sessionRecording = SessionRecording.deserialize(serializedRecording, {
                        mixpanelInstance: this.mixpanelInstance,
                        sharedLockStorage: this.sharedLockStorage
                    });
                    return sessionRecording.unloadPersistedData()
                        .then(_.bind(function () {
                            // expired recording was successfully flushed, we can clean it up from the registry
                            return this.idb.removeItem(serializedRecording['tabId']);
                        }, this))
                        .catch(_.bind(this.handleError, this));
                }, this));

            return Promise.all(unloadPromises);
        }, this))
        .catch(_.bind(this.handleError, this));
};

export { RecordingRegistry };
