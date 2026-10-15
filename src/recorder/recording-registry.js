import { Promise } from '../promise-polyfill';
import { SharedLock } from '../shared-lock';
import { IDBStorageWrapper } from '../storage/indexed-db';
import { _, getLocalStorage } from '../utils';
import {
    MIXPANEL_BROWSER_DB_NAME,
    RECORDING_REGISTRY_STORE_NAME,
    RECORDER_VERSION_DATA
} from './idb-config';
import { SessionRecording } from './session-recording';
import { getRecordingBatcherKeyPrefix, isRecordingExpired } from './utils';

// SharedLock keeps its state in <key>:X, <key>:Y and <key>:Z
var LOCK_STORAGE_KEY_REGEX = /^(.+):[XYZ]$/;

// well past the recording lock timeout, so a lock this idle is not in use by any tab
var ORPHANED_LOCK_MIN_IDLE_MS = 60 * 1000;

/**
 * Module for handling the storage and retrieval of recording metadata as well as any active recordings.
 * Makes sure that only one tab can be recording at a time.
 */
var RecordingRegistry = function (options) {
    /** @type {IDBStorageWrapper} */
    this.idb = new IDBStorageWrapper(MIXPANEL_BROWSER_DB_NAME, RECORDING_REGISTRY_STORE_NAME, RECORDER_VERSION_DATA);
    this.errorReporter = options.errorReporter;
    this.mixpanelInstance = options.mixpanelInstance;
    this.sharedLockStorage = options.sharedLockStorage;
};

RecordingRegistry.prototype.isPersistenceEnabled = function() {
    return !this.mixpanelInstance.get_config('disable_persistence');
};

RecordingRegistry.prototype.handleError = function (err) {
    this.errorReporter('IndexedDB error: ', err);
};

/**
 * @param {import('./session-recording').SerializedRecording} serializedRecording
 */
RecordingRegistry.prototype.setActiveRecording = function (serializedRecording) {
    if (!this.isPersistenceEnabled()) {
        return Promise.resolve();
    }

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
    if (!this.isPersistenceEnabled()) {
        return Promise.resolve(null);
    }

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
    if (this.isPersistenceEnabled()) {
        // mark recording as expired instead of deleting it in case the page unloads mid-flush and doesn't make it to ingestion.
        // this will ensure the next pageload will flush the remaining events, but not try to continue the recording.
        return this.markActiveRecordingExpired();
    } else {
        return this.deleteActiveRecording();
    }
};

RecordingRegistry.prototype.markActiveRecordingExpired = function () {
    return this.getActiveRecording()
        .then(function (serializedRecording) {
            if (serializedRecording) {
                serializedRecording['maxExpires'] = 0;
                return this.setActiveRecording(serializedRecording);
            }
        }.bind(this))
        .catch(this.handleError.bind(this));
};

RecordingRegistry.prototype.deleteActiveRecording = function () {
    // avoid initializing IDB if this registry instance hasn't already written a recording
    if (this.idb.isInitialized()) {
        return this.idb.removeItem(this.mixpanelInstance.get_tab_id())
            .catch(this.handleError.bind(this));
    } else {
        return Promise.resolve();
    }
};

/**
 * Flush any inactive recordings from the registry to minimize data loss.
 * The main idea here is that we can flush remaining rrweb events on the next page load if a tab is closed mid-batch.
 */
RecordingRegistry.prototype.flushInactiveRecordings = function () {
    if (!this.isPersistenceEnabled()) {
        return Promise.resolve([]);
    }

    return this.idb.init()
        .then(function() {
            return this.idb.getAll();
        }.bind(this))
        .then(function (serializedRecordings) {
            var activeReplayIds = {};
            _.each(serializedRecordings, function (serializedRecording) {
                if (!isRecordingExpired(serializedRecording)) {
                    activeReplayIds[serializedRecording['replayId']] = true;
                }
            });

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

            return Promise.all(unloadPromises).then(function (results) {
                this.clearOrphanedLocks(activeReplayIds);
                return results;
            }.bind(this));
        }.bind(this))
        .catch(this.handleError.bind(this));
};

/**
 * Remove lock keys left in localStorage by recordings that are not active anywhere, e.g. when a tab
 * closed while holding its lock. Each recording has its own lock key, so nothing else ever revisits them.
 * @param {Object<string, boolean>} activeReplayIds
 */
RecordingRegistry.prototype.clearOrphanedLocks = function (activeReplayIds) {
    var storage = this.sharedLockStorage || getLocalStorage();
    if (!storage) {
        return;
    }

    var keyPrefix = getRecordingBatcherKeyPrefix(this.mixpanelInstance);
    try {
        var orphanedLockKeys = {};
        for (var i = 0; i < storage.length; i++) {
            var match = LOCK_STORAGE_KEY_REGEX.exec(storage.key(i));
            if (match && match[1].indexOf(keyPrefix) === 0 && !activeReplayIds[match[1].slice(keyPrefix.length)]) {
                orphanedLockKeys[match[1]] = true;
            }
        }

        _.each(_.keys(orphanedLockKeys), function (lockKey) {
            var lock = new SharedLock(lockKey, {storage: storage});
            if (lock.isIdleFor(ORPHANED_LOCK_MIN_IDLE_MS)) {
                lock.clear();
            }
        });
    } catch (err) {
        this.errorReporter('Error clearing orphaned recording locks', err);
    }
};

export { RecordingRegistry };
