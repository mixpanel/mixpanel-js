import { expect } from 'chai';
import localStorage from 'localStorage';
import intersection from 'lodash/intersection';
import map from 'lodash/map';
import uniq from 'lodash/uniq';
import sinon from 'sinon';

import { acquireLockForPid } from './lock-test-utils';
import { RequestQueue } from '../../src/request-queue';

const DEFAULT_FLUSH_INTERVAL = 10000;
const START_TIME = 50000;

describe(`RequestQueue`, function() {
  let clock = null;
  let queue;

  beforeEach(function() {
    if (clock) {
      clock.restore();
    }
    clock = sinon.useFakeTimers(START_TIME);
    localStorage.clear();
    queue = new RequestQueue(`fake-rq-key`, {storage: localStorage});
  });

  afterEach(function() {
    if (clock) {
      clock.restore();
    }
    clock = null;
  });

  it(`initializes a mutex with the same key`, function() {
    expect(queue.storageKey).to.equal(`fake-rq-key`);
    expect(queue.lock.storageKey).to.equal(`fake-rq-key`);
  });

  describe(`enqueue`, function() {
    const item = {event: `foo`, properties: {bar: `baz`}};

    it(`stores the given item in memory`, function() {
      expect(queue.memQueue).to.be.empty;
      queue.enqueue(item, DEFAULT_FLUSH_INTERVAL);
      expect(queue.memQueue).to.have.lengthOf(1);

      const queuedEntry = queue.memQueue[0];
      expect(queuedEntry.id).to.be.a(`string`);
      expect(queuedEntry.flushAfter).to.be.greaterThan(+(new Date()) + DEFAULT_FLUSH_INTERVAL);
      expect(queuedEntry.payload).to.deep.equal(item);
    });

    it(`persists the given item in localStorage`, function() {
      expect(localStorage.getItem(`fake-rq-key`)).to.be.null;
      expect(queue.readFromStorage()).to.be.empty;
      queue.enqueue(item, DEFAULT_FLUSH_INTERVAL);
      expect(localStorage.getItem(`fake-rq-key`)).to.be.a(`string`);
    });

    it(`runs callback after persisting`, function(done) {
      expect(queue.readFromStorage()).to.be.empty;
      queue.enqueue(item, DEFAULT_FLUSH_INTERVAL, function(succeeded) {
        expect(succeeded).to.be.ok;

        expect(localStorage.getItem(`fake-rq-key`)).to.be.a(`string`);
        const storedQueue = queue.readFromStorage();
        expect(storedQueue).to.have.lengthOf(1);

        const queuedEntry = storedQueue[0];
        expect(queuedEntry.id).to.be.a(`string`);
        expect(queuedEntry.flushAfter).to.be.greaterThan(+(new Date()) + DEFAULT_FLUSH_INTERVAL);
        expect(queuedEntry.payload).to.deep.equal(item);

        done();
      });
    });

    it(`waits for current lock holder to release`, function(done) {
      const firstHolder = new RequestQueue(`fake-rq-key`, {storage: localStorage, pid: `first-holder`});
      const firstItem = {event: `first`};
      acquireLockForPid(queue.lock, `first-holder`);

      expect(queue.readFromStorage()).to.be.empty;

      // should not get enqueued until after firstHolder's enqueue() below, since
      // firstHolder has the lock
      queue.enqueue(item, DEFAULT_FLUSH_INTERVAL, function() {
        const storedQueue = queue.readFromStorage();
        expect(storedQueue).to.have.lengthOf(2);
        expect(storedQueue[0].payload).to.deep.equal(firstItem);
        expect(storedQueue[1].payload).to.deep.equal(item);
        done();
      });

      firstHolder.enqueue(firstItem, DEFAULT_FLUSH_INTERVAL);

      clock.tick(1000);
    });

    context(`when persistence fails`, function() {
      function persistenceFailureTests() {
        it(`reports failure in callback`, function(done) {
          expect(queue.readFromStorage()).to.be.empty;
          queue.enqueue(item, DEFAULT_FLUSH_INTERVAL, function(succeeded) {
            expect(succeeded).not.to.be.ok;
            expect(localStorage.getItem(`fake-rq-key`)).to.be.null;
            expect(queue.readFromStorage()).to.be.empty;
            done();
          });
          clock.tick(1000);
        });

        it(`does not add item to in-mem queue`, function(done) {
          expect(queue.readFromStorage()).to.be.empty;
          queue.enqueue(item, DEFAULT_FLUSH_INTERVAL, function(succeeded) {
            expect(succeeded).not.to.be.ok;
            expect(queue.memQueue).to.have.lengthOf(0);
            done();
          });
          clock.tick(1000);
        });
      }

      context(`during lock acquisition`, function() {
        beforeEach(function() {
          sinon.stub(localStorage, `setItem`).throws(`localStorage disabled`);
        });

        afterEach(function() {
          localStorage.setItem.restore();
        });

        persistenceFailureTests();
      });

      context(`mid-acquisition`, function() {
        beforeEach(function() {
          localStorage.clear();
          queue = new RequestQueue(`fake-rq-key`, {storage: localStorage, pid: `mypid`});
          sinon.stub(localStorage, `setItem`)
            .withArgs(`fake-rq-key:Y`, `mypid`)
            .onCall(0).returns(null)
            .onCall(1).callsFake(function() {
              // now break it for every call, as though it just got disabled
              localStorage.setItem.restore();
              sinon.stub(localStorage, `setItem`).returns(null);
            });
          localStorage.setItem.callThrough();
        });

        afterEach(function() {
          localStorage.setItem.restore();
        });

        persistenceFailureTests();
      });

      context(`after lock acquisition`, function() {
        beforeEach(function() {
          queue.storage = {
            getItem: localStorage.getItem.bind(localStorage),
            setItem: () => {
              throw new Error(`persistence failure`);
            },
          };
        });

        persistenceFailureTests();
      });
    });
  });

  describe(`fillBatch`, function() {
    const items = [
      {event: `foo1`, properties: {bar1: `baz1`}},
      {event: `foo2`, properties: {bar2: `baz2`}},
      {event: `foo3`, properties: {bar3: `baz3`}},
      {event: `foo4`, properties: {bar4: `baz4`}},
      {event: `foo5`, properties: {bar5: `baz5`}},
    ];

    beforeEach(function() {
      for (const item of items) {
        queue.enqueue(item, DEFAULT_FLUSH_INTERVAL);
      }
      expect(queue.readFromStorage()).to.have.lengthOf(items.length);
    });

    it(`reads the requested number of items from the in-mem queue`, function() {
      const batch = queue.fillBatch(3);
      expect(batch).to.have.lengthOf(3);
      expect(batch[0].payload).to.deep.equal(items[0]);
      expect(batch[1].payload).to.deep.equal(items[1]);
      expect(batch[2].payload).to.deep.equal(items[2]);
    });

    it(`does not remove items from any queue`, function() {
      const batch = queue.fillBatch(3);
      expect(batch).to.have.lengthOf(3);
      expect(queue.memQueue).to.have.lengthOf(items.length);
      expect(queue.readFromStorage()).to.have.lengthOf(items.length);
    });

    it(`gracefully accepts requests for more items than are in the queue`, function() {
      const batch = queue.fillBatch(50);
      expect(batch).to.have.lengthOf(items.length);
    });

    context(`with orphaned items in the persisted queue (localStorage)`, function() {
      let persistedItems;

      beforeEach(function() {
        persistedItems = [
          // orphaned, flush anytime
          {id: `abc`, flushAfter: +(new Date()) - 60000, payload: {event: `foo6`, properties: {bar6: `baz6`}}},

          // not yet time to flush
          {id: `def`, flushAfter: +(new Date()) + 60000, payload: {event: `foo7`, properties: {bar7: `baz7`}}},

          // orphaned, flush anytime
          {id: `ghi`, flushAfter: +(new Date()) - 60000, payload: {event: `foo8`, properties: {bar8: `baz8`}}},
        ];
        queue.saveToStorage(persistedItems);
      });

      it(`does not look in the persisted queue if the in-mem queue has enough items`, function() {
        const batch = queue.fillBatch(3);
        expect(batch).to.have.lengthOf(3);
        const persistedIDs = map(persistedItems, `id`);
        const batchIDs = map(batch, `id`);
        expect(intersection(batchIDs, persistedIDs)).to.be.empty;
      });

      it(`adds persisted items to the batch which are past their flushAfter time`, function() {
        const batch = queue.fillBatch(7);
        expect(batch).to.have.lengthOf(7);
        const batchIDs = map(batch, `id`);
        expect(batchIDs).to.include(`abc`);
        expect(batchIDs).not.to.include(`def`);
        expect(batchIDs).to.include(`ghi`);
      });

      it(`does not add persisted items to the batch which are not yet past their flushAfter time`, function() {
        const batch = queue.fillBatch(10);
        expect(batch).to.have.lengthOf(7);
        const batchIDs = map(batch, `id`);
        expect(batchIDs).not.to.include(`def`);
      });

      it(`does not duplicate in-mem items which are already in the batch`, function() {
        // duplicate the ID of an in-mem item into persistence with a past flushAfter time
        persistedItems[0].id = queue.memQueue[0].id;
        queue.saveToStorage(persistedItems);

        const batch = queue.fillBatch(7);
        expect(batch).to.have.lengthOf(6);
        const batchIDs = map(batch, `id`);
        expect(uniq(batchIDs).length).to.equal(batchIDs.length);
        expect(batchIDs).to.include(`ghi`); // good persisted item
      });

      it(`marks orphaned items`, function() {
        const batchAttrs = queue.fillBatch(7).map(item => ({
          event: item.payload.event,
          orphaned: !!item.orphaned,
        }));
        expect(batchAttrs).to.deep.equal([
          {event: `foo1`, orphaned: false},
          {event: `foo2`, orphaned: false},
          {event: `foo3`, orphaned: false},
          {event: `foo4`, orphaned: false},
          {event: `foo5`, orphaned: false},
          {event: `foo6`, orphaned: true},
          // foo7 is not yet ready to flush
          {event: `foo8`, orphaned: true},
        ]);
      });

      it(`is resilient to malformed localStorage entries`, function() {
        let batch;
        const origStorageEntry = localStorage.getItem(`fake-rq-key`);

        localStorage.setItem(`fake-rq-key`, `garbage`);
        batch = queue.fillBatch(10);
        expect(batch).to.have.lengthOf(5);

        localStorage.setItem(`fake-rq-key`, `{}`); // valid JSON, wrong type
        batch = queue.fillBatch(10);
        expect(batch).to.have.lengthOf(5);

        // just to verify that the storage (de)serialization here works
        localStorage.setItem(`fake-rq-key`, origStorageEntry);
        batch = queue.fillBatch(10);
        expect(batch).to.have.lengthOf(7);
      });
    });
  });

  describe(`removeItemsByID`, function() {
    const items = [
      {event: `foo1`, properties: {bar1: `baz1`}},
      {event: `foo2`, properties: {bar2: `baz2`}},
      {event: `foo3`, properties: {bar3: `baz3`}},
      {event: `foo4`, properties: {bar4: `baz4`}},
      {event: `foo5`, properties: {bar5: `baz5`}},
    ];
    let origIDs; // generated item IDs from initial queue

    beforeEach(function() {
      for (const item of items) {
        queue.enqueue(item, DEFAULT_FLUSH_INTERVAL);
      }
      expect(queue.readFromStorage()).to.have.lengthOf(items.length);
      origIDs = map(queue.memQueue, `id`);
    });

    it(`removes items with the given IDs from the in-mem queue`, function() {
      queue.removeItemsByID([origIDs[0], origIDs[3]]); // remove 1st and 4th entries
      expect(queue.memQueue).to.have.lengthOf(3);
      expect(queue.memQueue[0].payload.event).to.equal(`foo2`);
      expect(queue.memQueue[1].payload.event).to.equal(`foo3`);
      expect(queue.memQueue[2].payload.event).to.equal(`foo5`);
    });

    it(`removes items with the given IDs from the persisted queue`, function() {
      queue.removeItemsByID([origIDs[1], origIDs[2]]); // remove 2nd and 3rd entries
      const storedQueue = queue.readFromStorage();
      expect(storedQueue).to.have.lengthOf(3);
      expect(storedQueue[0].payload.event).to.equal(`foo1`);
      expect(storedQueue[1].payload.event).to.equal(`foo4`);
      expect(storedQueue[2].payload.event).to.equal(`foo5`);
    });

    it(`removes invalid items from both queues`, function() {
      // sprinkle some bad items into the queue
      queue.memQueue.splice(1, 0, `garbage entry {{`);
      queue.memQueue.push({pure: `nonsense`});
      queue.saveToStorage(queue.memQueue);

      expect(queue.memQueue).to.have.lengthOf(7);
      let storedQueue = queue.readFromStorage();
      expect(storedQueue).to.have.lengthOf(7);

      queue.removeItemsByID([origIDs[0], origIDs[3]]); // remove foo1 and foo4

      expect(queue.memQueue).to.have.lengthOf(3); // 7 total minus 2 invalid minus 2 removed by ID
      expect(queue.memQueue[0].payload.event).to.equal(`foo2`);
      expect(queue.memQueue[1].payload.event).to.equal(`foo3`);
      expect(queue.memQueue[2].payload.event).to.equal(`foo5`);

      storedQueue = queue.readFromStorage();
      expect(storedQueue).to.have.lengthOf(3);
      expect(storedQueue[0].payload.event).to.equal(`foo2`);
      expect(storedQueue[1].payload.event).to.equal(`foo3`);
      expect(storedQueue[2].payload.event).to.equal(`foo5`);
    });

    it(`runs callback after persisting`, function(done) {
      queue.removeItemsByID([origIDs[1], origIDs[2]], function(succeeded) {
        expect(succeeded).to.be.ok;
        const storedQueue = queue.readFromStorage();
        expect(storedQueue).to.have.lengthOf(3);
        expect(storedQueue[0].payload.event).to.equal(`foo1`);
        expect(storedQueue[1].payload.event).to.equal(`foo4`);
        expect(storedQueue[2].payload.event).to.equal(`foo5`);
        done();
      });
    });

    context(`when persistence fails`, function() {
      beforeEach(function() {
        queue.storage = {
          getItem: localStorage.getItem.bind(localStorage),
          setItem: () => {
            throw new Error(`persistence failure`);
          },
        };
      });

      it(`reports failure in callback`, function(done) {
        queue.removeItemsByID([origIDs[1], origIDs[2]], function(succeeded) {
          expect(succeeded).not.to.be.ok;
          done();
        });
      });

      it(`still removes items from in-mem queue`, function(done) {
        queue.removeItemsByID([origIDs[1], origIDs[2]], function(succeeded) {
          expect(succeeded).not.to.be.ok;
          expect(queue.memQueue).to.have.lengthOf(3);
          expect(queue.memQueue[0].payload.event).to.equal(`foo1`);
          expect(queue.memQueue[1].payload.event).to.equal(`foo4`);
          expect(queue.memQueue[2].payload.event).to.equal(`foo5`);
          done();
        });
      });
    });
  });

  describe(`updatePayloads`, function() {
    const items = [
      {event: `foo1`, properties: {bar1: `baz1`}},
      {event: `foo2`, properties: {bar2: `baz2`}},
      {event: `foo3`, properties: {bar3: `baz3`}},
      {event: `foo4`, properties: {bar4: `baz4`}},
      {event: `foo5`, properties: {bar5: `baz5`}},
    ];
    let origIDs; // generated item IDs from initial queue

    beforeEach(function() {
      for (const item of items) {
        queue.enqueue(item, DEFAULT_FLUSH_INTERVAL);
      }
      expect(queue.readFromStorage()).to.have.lengthOf(items.length);
      origIDs = map(queue.memQueue, `id`);
    });

    it(`replaces payloads in in-mem queue`, function() {
      queue.updatePayloads({
        [origIDs[0]]: {foo: `bar`},
      });
      expect(queue.memQueue[0].id).to.equal(origIDs[0]);
      expect(queue.memQueue[0].payload).to.deep.equal({foo: `bar`});
    });

    it(`replaces payloads in persisted queue`, function() {
      queue.updatePayloads({
        [origIDs[3]]: {foo: `bar`},
      });
      expect(queue.readFromStorage()[3].payload).to.deep.equal({foo: `bar`});
    });

    it(`doesn't affect items which are not in itemsToUpdate`, function() {
      queue.updatePayloads({
        [origIDs[1]]: {foo1: `bar`},
        [origIDs[3]]: {foo3: `bar`},
      });
      expect(map(queue.readFromStorage(), `payload`)).to.deep.equal([
        {event: `foo1`, properties: {bar1: `baz1`}},
        {foo1: `bar`},
        {event: `foo3`, properties: {bar3: `baz3`}},
        {foo3: `bar`},
        {event: `foo5`, properties: {bar5: `baz5`}},
      ]);
    });

    it(`removes items which are set to null`, function() {
      queue.updatePayloads({
        [origIDs[1]]: null,
        [origIDs[3]]: {foo3: `bar`},
        [origIDs[4]]: null,
      });
      expect(map(queue.readFromStorage(), `payload`)).to.deep.equal([
        {event: `foo1`, properties: {bar1: `baz1`}},
        // deleted item
        {event: `foo3`, properties: {bar3: `baz3`}},
        {foo3: `bar`},
        // deleted item
      ]);
    });
  });

  describe(`readFromStorage`, function() {
    it(`decodes any serialized array from localStorage`, function() {
      localStorage.setItem(`fake-rq-key`, `[]`);
      expect(queue.readFromStorage()).to.eql([]);

      localStorage.setItem(`fake-rq-key`, `[3, 2, "a"]`);
      expect(queue.readFromStorage()).to.eql([3, 2, `a`]);

      localStorage.setItem(`fake-rq-key`, `[{"id":"abc","payload":{"foo":"bar"}},{"id":"def","payload":{"baz":"quux"}}]`);
      expect(queue.readFromStorage()).to.eql([
        {id: `abc`, payload: {foo: `bar`}},
        {id: `def`, payload: {baz: `quux`}},
      ]);
    });

    it(`turns non-array serialized data into an empty array`, function() {
      localStorage.setItem(`fake-rq-key`, `5`);
      expect(queue.readFromStorage()).to.eql([]);

      localStorage.setItem(`fake-rq-key`, `"a"`);
      expect(queue.readFromStorage()).to.eql([]);

      localStorage.setItem(`fake-rq-key`, `{}`);
      expect(queue.readFromStorage()).to.eql([]);

      localStorage.setItem(`fake-rq-key`, ``);
      expect(queue.readFromStorage()).to.eql([]);
    });

    it(`turns malformed serialized data into an empty array`, function() {
      localStorage.setItem(`fake-rq-key`, `asdf{xc`);
      expect(queue.readFromStorage()).to.eql([]);

      localStorage.setItem(`fake-rq-key`, `[{"foo":"bar"},`);
      expect(queue.readFromStorage()).to.eql([]);
    });

    it(`returns an empty array when the storage entry is missing`, function() {
      localStorage.removeItem(`fake-rq-key`);
      expect(queue.readFromStorage()).to.eql([]);
    });
  });

  describe(`saveToStorage`, function() {
    it(`serializes any array to localStorage`, function() {
      queue.saveToStorage([]);
      expect(localStorage.getItem(`fake-rq-key`)).to.equal(`[]`);

      queue.saveToStorage([`a`, `b`, {foo: `bar`}]);
      expect(localStorage.getItem(`fake-rq-key`)).to.equal(`["a","b",{"foo":"bar"}]`);
    });

    it(`returns true on success`, function() {
      expect(queue.saveToStorage([1, 2, 3])).to.be.ok;
    });

    it(`returns false on failure`, function() {
      const unstringifyable = {};
      unstringifyable.foo = unstringifyable; // circular reference
      expect(queue.saveToStorage(unstringifyable)).not.to.be.ok;
    });
  });

  describe(`clear`, function() {
    beforeEach(function() {
      queue.enqueue({event: `foo1`, properties: {bar1: `baz1`}}, DEFAULT_FLUSH_INTERVAL);
      queue.enqueue({event: `foo2`, properties: {bar2: `baz2`}}, DEFAULT_FLUSH_INTERVAL);
      expect(queue.readFromStorage()).to.have.lengthOf(2);
    });

    it(`removes all items from in-mem queue`, function() {
      expect(queue.memQueue).to.have.lengthOf(2);
      queue.clear();
      expect(queue.memQueue).to.be.empty;
    });

    it(`removes all items from localStorage`, function() {
      queue.clear();
      expect(localStorage.getItem(`fake-rq-key`)).to.be.null;
      expect(queue.readFromStorage()).to.eql([]);
    });
  });
});
