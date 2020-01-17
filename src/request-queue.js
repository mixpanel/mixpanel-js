import { SharedLock } from './shared-lock';
import { cheap_guid, console, _ } from './utils';

/**
 * RequestQueue: queue for batching API requests with localStorage backup for retries
 * @constructor
 */
var RequestQueue = function(key, options) {
    options = options || {};
    this.storageKey = key;
    this.storage = options.storage || window.localStorage;
    this.lock = new SharedLock(key, {storage: this.storage});

    this.memQueue = [];
};

RequestQueue.prototype.enqueue = function(item, flushInterval, cb) {
    var queueEntry = {
        'id': cheap_guid(),
        'flushAfter': +(new Date()) + flushInterval * 2,
        'payload': item
    };
    console.log('[batch] enqueueing:', queueEntry);

    this.memQueue.push(queueEntry);
    this.lock.withLock(_.bind(function() {
        var succeeded;
        try {
            var storedQueue = this.read();
            storedQueue.push(queueEntry);
            succeeded = this.save(storedQueue);
        } catch(err) {
            console.error('[batch] Error enqueueing item', item);
            succeeded = false;
        }
        if (cb) {
            cb(succeeded);
        }
    }, this));
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
        var storedQueue = this.read();
        for (var i = 0; i < storedQueue.length; i++) {
            var item = storedQueue[i];
            if (+(new Date()) > item['flushAfter']) {
                batch.push(item);
                if (batch.length >= batchSize) {
                    break;
                }
            }
        }
    }
    return batch;
};

// remove items with matching 'id' from array (immutably)
var filterOutIDs = function(items, idSet) {
    var filteredItems = [];
    _.each(items, function(item) {
        if (!idSet[item['id']]) {
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

    this.memQueue = filterOutIDs(this.memQueue, idSet);
    this.lock.withLock(_.bind(function() {
        var succeeded;
        try {
            var storedQueue = this.read();
            storedQueue = filterOutIDs(storedQueue, idSet);
            succeeded = this.save(storedQueue);
        } catch(err) {
            console.error('[batch] Error removing items', ids);
            succeeded = false;
        }
        if (cb) {
            cb(succeeded);
        }
    }, this));
};

RequestQueue.prototype.read = function() {
    var storageEntry;
    try {
        storageEntry = _.JSONDecode(this.storage.getItem(this.storageKey));
        if (!_.isArray(storageEntry)) {
            console.error('[batch] Invalid storage entry:', storageEntry);
            storageEntry = null;
        }
    } catch (err) {
        console.error('[batch] Error retrieving queue', err);
        storageEntry = null;
    }
    return storageEntry || [];
};

RequestQueue.prototype.save = function(queue) {
    try {
        this.storage.setItem(this.storageKey, _.JSONEncode(queue));
        return true;
    } catch (err) {
        console.error('[batch] Error saving queue', err);
        return false;
    }
};

export { RequestQueue };
