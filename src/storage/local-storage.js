import { Promise } from '../promise-polyfill';
import { _ } from '../utils'; // eslint-disable-line camelcase

/**
 * @typedef {import('./wrapper').StorageWrapper}
 */

/**
 * @type {StorageWrapper}
 */
var LocalStorageWrapper = function (storageOverride) {
    this.storage = storageOverride || localStorage;
};

LocalStorageWrapper.prototype.init = function () {
    return Promise.resolve();
};

LocalStorageWrapper.prototype.setItem = function (key, value) {
    return new Promise(_.bind(function (resolve, reject) {
        try {
            this.storage.setItem(key, value);
        } catch (e) {
            reject(e);
        }
        resolve();
    }, this));
};

LocalStorageWrapper.prototype.getItem = function (key) {
    return new Promise(_.bind(function (resolve, reject) {
        var item;
        try {
            item = this.storage.getItem(key);
        } catch (e) {
            reject(e);
        }
        resolve(item);
    }, this));
};

LocalStorageWrapper.prototype.removeItem = function (key) {
    return new Promise(_.bind(function (resolve, reject) {
        try {
            this.storage.removeItem(key);
        } catch (e) {
            reject(e);
        }
        resolve();
    }, this));
};

export { LocalStorageWrapper };
