import { Promise } from './promise-polyfill';
import { console_with_prefix, localStorageSupported } from './utils'; // eslint-disable-line camelcase

var logger = console_with_prefix('lock');

/**
 * SharedLock: a mutex built on HTML5 localStorage, to ensure that only one browser
 * window/tab at a time will be able to access shared resources.
 *
 * Based on the Alur and Taubenfeld fast lock
 * (http://www.cs.rochester.edu/research/synchronization/pseudocode/fastlock.html)
 * with an added timeout to ensure there will be eventual progress in the event
 * that a window is closed in the middle of the callback.
 *
 * Implementation based on the original version by David Wolever (https://github.com/wolever)
 * at https://gist.github.com/wolever/5fd7573d1ef6166e8f8c4af286a69432.
 *
 * @example
 * const myLock = new SharedLock('some-key');
 * myLock.withLock(function() {
 *   console.log('I hold the mutex!');
 * });
 *
 * @constructor
 */
var SharedLock = function(key, options) {
    options = options || {};

    this.storageKey = key;
    this.storage = options.storage || window.localStorage;
    this.pollIntervalMS = options.pollIntervalMS || 100;
    this.timeoutMS = options.timeoutMS || 2000;
};

SharedLock.prototype.withLock = function(lockedCB, pid) {
    var i = pid || (new Date().getTime() + '|' + Math.random());
    var startTime = new Date().getTime();
    var key = this.storageKey;
    var pollIntervalMS = this.pollIntervalMS;
    var timeoutMS = this.timeoutMS;
    var storage = this.storage;

    var keyX = key + ':X';
    var keyY = key + ':Y';
    var keyZ = key + ':Z';

    var delay = function() {
        return new Promise(function (resolve) {
            if (new Date().getTime() - startTime > timeoutMS) {
                logger.error('Timeout waiting for mutex on ' + key + '; clearing lock. [' + i + ']');
                storage.removeItem(keyZ);
                storage.removeItem(keyY);
                resolve(loop());
            } else {
                setTimeout(resolve, pollIntervalMS * (Math.random() + 0.1));
            }
        });
    };

    var waitFor = function(predicate) {
        if (predicate()) {
            return Promise.resolve();
        } else {
            return delay().then(function () {
                return waitFor(predicate);
            });
        }
    };

    var getSetY = function() {
        var valY = storage.getItem(keyY);
        if (valY && valY !== i) { // if Y == i then this process already has the lock (useful for test cases)
            return false;
        } else {
            storage.setItem(keyY, i);
            if (storage.getItem(keyY) === i) {
                return true;
            } else {
                if (!localStorageSupported(storage, true)) {
                    throw new Error('localStorage support dropped while acquiring lock');
                }
                return false;
            }
        }
    };

    var loop = function() {
        storage.setItem(keyX, i);
        return waitFor(getSetY)
            .then(function () {
                if (storage.getItem(keyX) === i) {
                    return;
                }

                return delay();
            })
            .then(function () {
                if (storage.getItem(keyY) !== i) {
                    return loop();
                }

                return waitFor(function () {
                    return !storage.getItem(keyZ);
                });
            });
    };

    var clearLock = function () {
        storage.removeItem(keyZ);
        if (storage.getItem(keyY) === i) {
            storage.removeItem(keyY);
        }
        if (storage.getItem(keyX) === i) {
            storage.removeItem(keyX);
        }
    };

    if (localStorageSupported(storage, true)) {
        return loop()
            .then(function () {
                return lockedCB();
            })
            .then(function (returnValue) {
                clearLock();
                // propogate the return value from the lockedCB
                return returnValue;
            })
            .catch(function (err) {
                clearLock();
                // something went wrong acquiring lock, let caller handle the rejected promise
                return Promise.reject(err);
            });
    } else {
        return Promise.reject(new Error('localStorage support check failed'));
    }
};

export { SharedLock };
