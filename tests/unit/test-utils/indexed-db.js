import { IDBFactory, IDBDatabase} from 'fake-indexeddb';

import { window } from '../../../src/window';
import {
  MIXPANEL_BROWSER_DB_NAME,
  RECORDING_EVENTS_STORE_NAME,
  RECORDING_REGISTRY_STORE_NAME,
} from '../../../src/recorder/idb-config';
import { FLAGS_STORE_NAME } from '../../../src/flags/flags-persistence';

const MIXPANEL_FLAGS_DB_NAME = `mixpanelFlagsDb`;

const STORE_TO_DB_NAME = {
  [RECORDING_EVENTS_STORE_NAME]: MIXPANEL_BROWSER_DB_NAME,
  [RECORDING_REGISTRY_STORE_NAME]: MIXPANEL_BROWSER_DB_NAME,
  [FLAGS_STORE_NAME]: MIXPANEL_FLAGS_DB_NAME,
};

export function setupFakeIDB() {
  beforeEach(function () {
    window.indexedDB = new IDBFactory();
    window.IDBDatabase = IDBDatabase;
  });

  afterEach(function () {
    delete window.indexedDB;
    delete window.IDBDatabase;
  });
}

export const idbCreateDatabase = (dbName, version, stores) => {
  return new Promise((resolve, reject) => {
    const openRequest = window.indexedDB.open(dbName, version);
    openRequest.onsuccess = function () {
      resolve(openRequest.result);
    };

    openRequest.onupgradeneeded = function (ev) {
      const db = ev.target.result;
      stores.forEach(function (storeName) {
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName);
        }
      });
    };

    openRequest.onerror = function () {
      reject(openRequest.error);
    };
  });
};

export const idbTransaction = (storeName, cb) => {
  const dbName = STORE_TO_DB_NAME[storeName];
  if (!dbName) {
    return Promise.reject(new Error(`Unknown IDB store: ${storeName}`));
  }
  return new Promise((resolve, reject) => {
    const openRequest = window.indexedDB.open(dbName, 1);
    openRequest.onsuccess = function () {
      const db = openRequest.result;
      const transaction = db.transaction([storeName], `readwrite`);
      const req = cb(transaction.objectStore(storeName));

      transaction.oncomplete = function () {
        resolve(req.result);
      };
      transaction.onerror = function () {
        reject(transaction.error);
      };
    };
    openRequest.onupgradeneeded = function (ev) {
      const db = ev.target.result;
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName);
      }
    };
    openRequest.onerror = function () {
      reject(openRequest.error);
    };
  });
};

export const idbGetItem = (storeName, key) => {
  return idbTransaction(storeName, (store) => store.get(key));
};

export const idbSetItem = (storeName, key, value) => {
  return idbTransaction(storeName, (store) => store.put(value, key));
};
