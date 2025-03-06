import { SharedLock } from './shared-lock';
import { batchedThrottle, cheap_guid, console_with_prefix, localStorageSupported, _ } from './utils'; // eslint-disable-line camelcase
import { window } from './window';
import { LocalStorageWrapper } from './storage/local-storage';
import { Promise } from './promise-polyfill';

var logger = console_with_prefix('batch');

/**
 * RequestQueue: queue for batching API requests with localStorage backup for retries.
 * Maintains an in-memory queue which represents the source of truth for the current
 * page, but also writes all items out to a copy in the browser's localStorage, which
 * can be read on subsequent pageloads and retried. For batchability, all the request
 * items in the queue should be of the same type (events, people updates, group updates)
 * so they can be sent in a single request to the same API endpoint.
 *
 * LocalStorage keying and locking: In order for reloads and subsequent pageloads of
 * the same site to access the same persisted data, they must share the same localStorage
 * key (for instance based on project token and queue type). Therefore access to the
 * localStorage entry is guarded by an asynchronous mutex (SharedLock) to prevent
 * simultaneously open windows/tabs from overwriting each other's data (which would lead
 * to data loss in some situations).
 * @constructor
 */
var RequestQueue = function (storageKey, options) {
    options = options || {};
    this.storageKey = storageKey;
    this.usePersistence = options.usePersistence;
    if (this.usePersistence) {
        this.queueStorage = options.queueStorage || new LocalStorageWrapper();
        this.lock = new SharedLock(storageKey, {
            storage: options.sharedLockStorage || window.localStorage,
            timeoutMS: options.sharedLockTimeoutMS,
        });
    }
    this.reportError = options.errorReporter || _.bind(logger.error, logger);

    this.pid = options.pid || null; // pass pid to test out storage lock contention scenarios

    this.memQueue = [];
    this.initialized = false;

    if (options.enqueueThrottleMs) {
        this.enqueuePersisted = batchedThrottle(_.bind(this._enqueuePersisted, this), options.enqueueThrottleMs);
    } else {
        this.enqueuePersisted = _.bind(function (queueEntry) {
            return this._enqueuePersisted([queueEntry]);
        }, this);
    }
};

RequestQueue.prototype.ensureInit = function () {
    if (this.initialized) {
        return Promise.resolve();
    }

    return this.queueStorage
        .init()
        .then(_.bind(function () {
            this.initialized = true;
        }, this))
        .catch(_.bind(function (err) {
            this.reportError('Error initializing queue persistence. Disabling persistence', err);
            this.initialized = true;
            this.usePersistence = false;
        }, this));
};

/**
 * Add one item to queues (memory and localStorage). The queued entry includes
 * the given item along with an auto-generated ID and a "flush-after" timestamp.
 * It is expected that the item will be sent over the network and dequeued
 * before the flush-after time; if this doesn't happen it is considered orphaned
 * (e.g., the original tab where it was enqueued got closed before it could be
 * sent) and the item can be sent by any tab that finds it in localStorage.
 *
 * The final callback param is called with a param indicating success or
 * failure of the enqueue operation; it is asynchronous because the localStorage
 * lock is asynchronous.
 */
RequestQueue.prototype.enqueue = function (item, flushInterval) {
    var queueEntry = {
        'id': cheap_guid(),
        'flushAfter': new Date().getTime() + flushInterval * 2,
        'payload': item
    };

    if (!this.usePersistence) {
        this.memQueue.push(queueEntry);
        return Promise.resolve(true);
    } else {
        return this.enqueuePersisted(queueEntry);
    }
};

RequestQueue.prototype._enqueuePersisted = function (queueEntries) {
    var enqueueItem = _.bind(function () {
        return this.ensureInit()
            .then(_.bind(function () {
                return this.readFromStorage();
            }, this))
            .then(_.bind(function (storedQueue) {
                return this.saveToStorage(storedQueue.concat(queueEntries));
            }, this))
            .then(_.bind(function (succeeded) {
                // only add to in-memory queue when storage succeeds
                if (succeeded) {
                    this.memQueue = this.memQueue.concat(queueEntries);
                }

                return succeeded;
            }, this))
            .catch(_.bind(function (err) {
                this.reportError('Error enqueueing items', err, queueEntries);
                return false;
            }, this));
    }, this);

    return this.lock
        .withLock(enqueueItem, this.pid)
        .catch(_.bind(function (err) {
            this.reportError('Error acquiring storage lock', err);
            return false;
        }, this));
};

/**
 * Read out the given number of queue entries. If this.memQueue
 * has fewer than batchSize items, then look for "orphaned" items
 * in the persisted queue (items where the 'flushAfter' time has
 * already passed).
 */
RequestQueue.prototype.fillBatch = function (batchSize) {
    var batch = this.memQueue.slice(0, batchSize);
    if (this.usePersistence && batch.length < batchSize) {
        // don't need lock just to read events; localStorage is thread-safe
        // and the worst that could happen is a duplicate send of some
        // orphaned events, which will be deduplicated on the server side
        return this.ensureInit()
            .then(_.bind(function () {
                return this.readFromStorage();
            }, this))
            .then(_.bind(function (storedQueue) {
                if (storedQueue.length) {
                    // item IDs already in batch; don't duplicate out of storage
                    var idsInBatch = {}; // poor man's Set
                    _.each(batch, function (item) {
                        idsInBatch[item['id']] = true;
                    });

                    for (var i = 0; i < storedQueue.length; i++) {
                        var item = storedQueue[i];
                        if (new Date().getTime() > item['flushAfter'] && !idsInBatch[item['id']]) {
                            item.orphaned = true;
                            batch.push(item);
                            if (batch.length >= batchSize) {
                                break;
                            }
                        }
                    }
                }

                return batch;
            }, this));
    } else {
        return Promise.resolve(batch);
    }
};

/**
 * Remove items with matching 'id' from array (immutably)
 * also remove any item without a valid id (e.g., malformed
 * storage entries).
 */
var filterOutIDsAndInvalid = function (items, idSet) {
    var filteredItems = [];
    _.each(items, function (item) {
        if (item['id'] && !idSet[item['id']]) {
            filteredItems.push(item);
        }
    });
    return filteredItems;
};

/**
 * Remove items with matching IDs from both in-memory queue
 * and persisted queue
 */
RequestQueue.prototype.removeItemsByID = function (ids) {
    var idSet = {}; // poor man's Set
    _.each(ids, function (id) {
        idSet[id] = true;
    });

    this.memQueue = filterOutIDsAndInvalid(this.memQueue, idSet);
    if (!this.usePersistence) {
        return Promise.resolve(true);
    } else {
        var removeFromStorage = _.bind(function () {
            return this.ensureInit()
                .then(_.bind(function () {
                    return this.readFromStorage();
                }, this))
                .then(_.bind(function (storedQueue) {
                    storedQueue = filterOutIDsAndInvalid(storedQueue, idSet);
                    return this.saveToStorage(storedQueue);
                }, this))
                .then(_.bind(function () {
                    return this.readFromStorage();
                }, this))
                .then(_.bind(function (storedQueue) {
                    // an extra check: did storage report success but somehow
                    // the items are still there?
                    for (var i = 0; i < storedQueue.length; i++) {
                        var item = storedQueue[i];
                        if (item['id'] && !!idSet[item['id']]) {
                            throw new Error('Item not removed from storage');
                        }
                    }
                    return true;
                }, this))
                .catch(_.bind(function (err) {
                    this.reportError('Error removing items', err, ids);
                    return false;
                }, this));
        }, this);

        return this.lock
            .withLock(removeFromStorage, this.pid)
            .catch(_.bind(function (err) {
                this.reportError('Error acquiring storage lock', err);
                if (!localStorageSupported(this.lock.storage, true)) {
                    // Looks like localStorage writes have stopped working sometime after
                    // initialization (probably full), and so nobody can acquire locks
                    // anymore. Consider it temporarily safe to remove items without the
                    // lock, since nobody's writing successfully anyway.
                    return removeFromStorage()
                        .then(_.bind(function (success) {
                            if (!success) {
                                // OK, we couldn't even write out the smaller queue. Try clearing it
                                // entirely.
                                return this.queueStorage.removeItem(this.storageKey).then(function () {
                                    return success;
                                });
                            }
                            return success;
                        }, this))
                        .catch(_.bind(function (err) {
                            this.reportError('Error clearing queue', err);
                            return false;
                        }, this));
                } else {
                    return false;
                }
            }, this));
    }
};

// internal helper for RequestQueue.updatePayloads
var updatePayloads = function (existingItems, itemsToUpdate) {
    var newItems = [];
    _.each(existingItems, function (item) {
        var id = item['id'];
        if (id in itemsToUpdate) {
            var newPayload = itemsToUpdate[id];
            if (newPayload !== null) {
                item['payload'] = newPayload;
                newItems.push(item);
            }
        } else {
            // no update
            newItems.push(item);
        }
    });
    return newItems;
};

/**
 * Update payloads of given items in both in-memory queue and
 * persisted queue. Items set to null are removed from queues.
 */
RequestQueue.prototype.updatePayloads = function (itemsToUpdate) {
    this.memQueue = updatePayloads(this.memQueue, itemsToUpdate);
    if (!this.usePersistence) {
        return Promise.resolve(true);
    } else {
        return this.lock
            .withLock(_.bind(function lockAcquired() {
                return this.ensureInit()
                    .then(_.bind(function () {
                        return this.readFromStorage();
                    }, this))
                    .then(_.bind(function (storedQueue) {
                        storedQueue = updatePayloads(storedQueue, itemsToUpdate);
                        return this.saveToStorage(storedQueue);
                    }, this))
                    .catch(_.bind(function (err) {
                        this.reportError('Error updating items', itemsToUpdate, err);
                        return false;
                    }, this));
            }, this), this.pid)
            .catch(_.bind(function (err) {
                this.reportError('Error acquiring storage lock', err);
                return false;
            }, this));
    }
};

/**
 * Read and parse items array from localStorage entry, handling
 * malformed/missing data if necessary.
 */
RequestQueue.prototype.readFromStorage = function () {
    return this.ensureInit()
        .then(_.bind(function () {
            return this.queueStorage.getItem(this.storageKey);
        }, this))
        .then(_.bind(function (storageEntry) {
            if (storageEntry) {
                if (!_.isArray(storageEntry)) {
                    this.reportError('Invalid storage entry:', storageEntry);
                    storageEntry = null;
                }
            }
            return storageEntry || [];
        }, this))
        .catch(_.bind(function (err) {
            this.reportError('Error retrieving queue', err);
            return [];
        }, this));
};

/**
 * Serialize the given items array to localStorage.
 */
RequestQueue.prototype.saveToStorage = function (queue) {
    return this.ensureInit()
        .then(_.bind(function () {
            return this.queueStorage.setItem(this.storageKey, queue);
        }, this))
        .then(function () {
            return true;
        })
        .catch(_.bind(function (err) {
            this.reportError('Error saving queue', err);
            return false;
        }, this));
};

/**
 * Clear out queues (memory and localStorage).
 */
RequestQueue.prototype.clear = function () {
    this.memQueue = [];

    if (this.usePersistence) {
        return this.ensureInit()
            .then(_.bind(function () {
                return this.queueStorage.removeItem(this.storageKey);
            }, this));
    } else {
        return Promise.resolve();
    }
};

export { RequestQueue };
