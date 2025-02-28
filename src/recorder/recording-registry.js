import { Promise } from '../promise-polyfill';
import { IDBStorageWrapper, RECORDING_REGISTRY_STORE_NAME } from '../storage/indexed-db';
import { SessionRecording } from './session-recording';
import { isRecordingExpired } from './utils';

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
    var tabId = serializedRecording['tabId'];
    if (!tabId) {
        console.warn('No tab ID is set, cannot persist recording metadata.');
        return Promise.resolve();
    }

    return this.idb.init()
        .then(function () {
            return this.idb.setItem(tabId, serializedRecording);
        }.bind(this))
        .catch(this.handleError.bind(this));
};

/**
 * @returns {Promise<import('./session-recording').SerializedRecording>}
 */
RecordingRegistry.prototype.getActiveRecording = function () {
    return this.idb.init()
        .then(function () {
            return this.idb.getItem(this.mixpanelInstance.get_tab_id());
        }.bind(this))
        .then(function (serializedRecording) {
            return isRecordingExpired(serializedRecording) ? null : serializedRecording;
        }.bind(this))
        .catch(this.handleError.bind(this));
};

RecordingRegistry.prototype.clearActiveRecording = function () {
    // mark recording as expired instead of deleting it in case the page unloads mid-flush and doesn't make it to ingestion.
    // this will ensure the next pageload will flush the remaining events, but not try to continue the recording.
    return this.getActiveRecording()
        .then(function (serializedRecording) {
            if (serializedRecording) {
                serializedRecording['maxExpires'] = 0;
                return this.setActiveRecording(serializedRecording);
            }
        }.bind(this))
        .catch(this.handleError.bind(this));
};

/**
 * Flush any inactive recordings from the registry to minimize data loss.
 * The main idea here is that we can flush remaining rrweb events on the next page load if a tab is closed mid-batch.
 */
RecordingRegistry.prototype.flushInactiveRecordings = function () {
    return this.idb.init()
        .then(function() {
            return this.idb.getAll();
        }.bind(this))
        .then(function (serializedRecordings) {
            // clean up any expired recordings from the registry, non-expired ones may be active in other tabs
            var unloadPromises = serializedRecordings
                .filter(function (serializedRecording) {
                    return isRecordingExpired(serializedRecording);
                })
                .map(function (serializedRecording) {
                    var sessionRecording = SessionRecording.deserialize(serializedRecording, {
                        mixpanelInstance: this.mixpanelInstance,
                        sharedLockStorage: this.sharedLockStorage
                    });
                    return sessionRecording.unloadPersistedData()
                        .then(function () {
                            // expired recording was successfully flushed, we can clean it up from the registry
                            return this.idb.removeItem(serializedRecording['tabId']);
                        }.bind(this))
                        .catch(this.handleError.bind(this));
                }.bind(this));

            return Promise.all(unloadPromises);
        }.bind(this))
        .catch(this.handleError.bind(this));
};

export { RecordingRegistry };
