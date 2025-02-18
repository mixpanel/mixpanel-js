import { IDBFactory, IDBDatabase} from 'fake-indexeddb';

import { window } from '../../../src/window';

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
  return new Promise((resolve) => {
    const openRequest = window.indexedDB.open(dbName, version);
    openRequest.onsuccess = function () {
      resolve(openRequest.result);
    };

    openRequest.onupgradeneeded = function (ev) {
      const db = ev.target.result;
      stores.forEach(function (storeName) {
        db.createObjectStore(storeName);
      });
    };
  });
};

export const idbTransaction = (storeName, cb) => {
  return new Promise((resolve) => {
    const openRequest = window.indexedDB.open(`mixpanelBrowserDb`, 1);
    openRequest.onsuccess = function () {
      const db = openRequest.result;
      const transaction = db.transaction([storeName], `readwrite`);
      const req = cb(transaction.objectStore(storeName));

      transaction.oncomplete = function () {
        resolve(req.result);
      };
    };
  });
};

export const idbGetItem = (storeName, key) => {
  return idbTransaction(storeName, (store) => store.get(key));
};

export const idbSetItem = (storeName, key, value) => {
  return idbTransaction(storeName, (store) => store.put(value, key));
};
