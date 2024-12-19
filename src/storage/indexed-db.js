import { Promise } from '../promise-polyfill';
import { window } from '../window';
var MIXPANEL_DB_NAME = 'mixpanelBrowserDb';

var RECORDING_EVENTS_STORE_NAME = 'mixpanelReplayEvents';
var RECORDING_REGISTRY_STORE_NAME = 'mixpanelRecordingRegistry';

// note: increment the version number when adding new object stores
var DB_VERSION = 1;
var OBJECT_STORES = [RECORDING_EVENTS_STORE_NAME, RECORDING_REGISTRY_STORE_NAME];

/**
 * @type {import('./wrapper').StorageWrapper}
 */
var IDBStorageWrapper = function (storeName) {
    /**
     * @type {Promise<IDBDatabase>|null}
     */
    this.dbPromise = null;
    this.storeName = storeName;
};

IDBStorageWrapper.prototype.init = function () {
    if (!window.indexedDB) {
        return Promise.reject('indexedDB is not supported in this browser');
    }

    var self = this;
    this.dbPromise = new Promise(function (resolve, reject) {
        var openRequest = indexedDB.open(MIXPANEL_DB_NAME, DB_VERSION);
        openRequest.onerror = function () {
            reject(openRequest.error);
        };

        openRequest.onsuccess = function () {
            self._db = openRequest.result;
            resolve(openRequest.result);
        };

        openRequest.onupgradeneeded = function (event) {
            var db = event.target.result;

            OBJECT_STORES.forEach(function (storeName) {
                db.createObjectStore(storeName);
            });
        };
    });

    return this.dbPromise
        .then(function (dbOrError) {
            if (dbOrError instanceof IDBDatabase) {
                return Promise.resolve();
            } else {
                return Promise.reject(dbOrError);
            }
        });
};

/**
 * @param {IDBTransactionMode} mode
 * @param {function(IDBObjectStore): void} storeCb
 */
IDBStorageWrapper.prototype.makeTransaction = function (mode, storeCb) {
    var self = this;
    return this.dbPromise.then(function (db) {
        return new Promise(function (resolve, reject) {
            var transaction = db.transaction(self.storeName, mode);
            transaction.oncomplete = function () {
                resolve(transaction);
            };
            transaction.onabort = transaction.onerror = function () {
                reject(transaction.error);
            };

            storeCb(transaction.objectStore(self.storeName));
        });
    });
};

IDBStorageWrapper.prototype.setItem = function (key, value) {
    return this.makeTransaction('readwrite', function (objectStore) {
        objectStore.put(value, key);
    });
};

IDBStorageWrapper.prototype.getItem = function (key) {
    var req;
    return this.makeTransaction('readonly', function (objectStore) {
        req = objectStore.get(key);
    }).then(function () {
        return req.result;
    });
};

IDBStorageWrapper.prototype.removeItem = function (key) {
    return this.makeTransaction('readwrite', function (objectStore) {
        objectStore.delete(key);
    });
};

IDBStorageWrapper.prototype.getAll = function () {
    var req;
    return this.makeTransaction('readonly', function (objectStore) {
        req = objectStore.getAll();
    }).then(function () {
        return req.result;
    });
};

export { IDBStorageWrapper, RECORDING_EVENTS_STORE_NAME, RECORDING_REGISTRY_STORE_NAME };
