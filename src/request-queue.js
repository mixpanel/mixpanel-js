import { SharedLock } from './shared-lock';
import { cheap_guid, console_with_prefix, JSONParse, JSONStringify, _ } from './utils'; // eslint-disable-line camelcase

var logger = console_with_prefix('batch');

/**
 * RequestQueue: queue for batching API requests with localStorage backup for retries
 * @constructor
 */
var RequestQueue = function(key, options) {
    options = options || {};
    this.storageKey = key;
    this.storage = options.storage || window.localStorage;
    this.lock = new SharedLock(key, {storage: this.storage});

    this.pid = options.pid || null; // pass pid to test out storage lock contention scenarios

    this.memQueue = [];
};

RequestQueue.prototype.enqueue = function(item, flushInterval, cb) {
    var queueEntry = {
        'id': cheap_guid(),
        'flushAfter': new Date().getTime() + flushInterval * 2,
        'payload': item
    };

    try {
        this.lock.withLock(_.bind(function() {
            var succeeded;
            try {
                var storedQueue = this.readFromStorage();
                storedQueue.push(queueEntry);
                succeeded = this.saveToStorage(storedQueue);
                if (succeeded) {
                    // only add to in-memory queue when storage succeeds
                    this.memQueue.push(queueEntry);
                }
            } catch(err) {
                logger.error('Error enqueueing item', item);
                succeeded = false;
            }
            if (cb) {
                cb(succeeded);
            }
        }, this), this.pid);
    } catch(err) {
        logger.error('Error acquiring storage lock', err);
        if (cb) {
            cb(false);
        }
    }
};

/**
 * Read out the given number of queue entries. If this.memQueue
 * has fewer than batchSize items, then look for "orphaned" items
 * in the persisted queue (items where the 'flushAfter' time has
 * already passed).
 */
RequestQueue.prototype.fillBatch = function(batchSize) {
    var batch = this.memQueue.slice(0, batchSize);
    if (batch.length < batchSize) {
        // don't need lock just to read events; localStorage is thread-safe
        // and the worst that could happen is a duplicate send of some
        // orphaned events, which will be deduplicated on the server side
        var storedQueue = this.readFromStorage();
        if (storedQueue.length) {
            // item IDs already in batch; don't duplicate out of storage
            var idsInBatch = {}; // poor man's Set
            _.each(batch, function(item) { idsInBatch[item['id']] = true; });

            for (var i = 0; i < storedQueue.length; i++) {
                var item = storedQueue[i];
                if (new Date().getTime() > item['flushAfter'] && !idsInBatch[item['id']]) {
                    batch.push(item);
                    if (batch.length >= batchSize) {
                        break;
                    }
                }
            }
        }
    }
    return batch;
};

// remove items with matching 'id' from array (immutably)
// also remove any item without a valid id
var filterOutIDsAndInvalid = function(items, idSet) {
    var filteredItems = [];
    _.each(items, function(item) {
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
RequestQueue.prototype.removeItemsByID = function(ids, cb) {
    var idSet = {}; // poor man's Set
    _.each(ids, function(id) { idSet[id] = true; });

    this.memQueue = filterOutIDsAndInvalid(this.memQueue, idSet);
    try {
        this.lock.withLock(_.bind(function() {
            var succeeded;
            try {
                var storedQueue = this.readFromStorage();
                storedQueue = filterOutIDsAndInvalid(storedQueue, idSet);
                succeeded = this.saveToStorage(storedQueue);
            } catch(err) {
                logger.error('Error removing items', ids);
                succeeded = false;
            }
            if (cb) {
                cb(succeeded);
            }
        }, this), this.pid);
    } catch(err) {
        logger.error('Error acquiring storage lock', err);
        if (cb) {
            cb(false);
        }
    }
};

RequestQueue.prototype.readFromStorage = function() {
    var storageEntry;
    try {
        storageEntry = this.storage.getItem(this.storageKey);
        if (storageEntry) {
            storageEntry = JSONParse(storageEntry);
            if (!_.isArray(storageEntry)) {
                logger.error('Invalid storage entry:', storageEntry);
                storageEntry = null;
            }
        }
    } catch (err) {
        logger.error('Error retrieving queue', err);
        storageEntry = null;
    }
    return storageEntry || [];
};

RequestQueue.prototype.saveToStorage = function(queue) {
    try {
        this.storage.setItem(this.storageKey, JSONStringify(queue));
        return true;
    } catch (err) {
        logger.error('Error saving queue', err);
        return false;
    }
};

RequestQueue.prototype.clear = function() {
    this.memQueue = [];
    this.storage.removeItem(this.storageKey);
};

export { RequestQueue };
