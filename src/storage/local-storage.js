import { Promise } from '../promise-polyfill';
import { _, JSONParse, JSONStringify } from '../utils'; // eslint-disable-line camelcase
import { window } from '../window';

/**
 * @type {import('./wrapper').StorageWrapper}
 */
var LocalStorageWrapper = function (storageOverride) {
    this.storage = storageOverride || window.localStorage;
};

LocalStorageWrapper.prototype.init = function () {
    return Promise.resolve();
};

LocalStorageWrapper.prototype.setItem = function (key, value) {
    return new Promise(_.bind(function (resolve, reject) {
        try {
            this.storage.setItem(key, JSONStringify(value));
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
            item = JSONParse(this.storage.getItem(key));
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
