import { expect } from 'chai';
import localStorage from 'localStorage';

import { RequestQueue } from '../../src/request-queue';

const DEFAULT_FLUSH_INTERVAL = 10000;

describe(`RequestQueue`, function() {
  let queue;

  beforeEach(function() {
    localStorage.clear();
    queue = new RequestQueue(`fake-rq-key`, {storage: localStorage});
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
      expect(queue.read()).to.be.empty;
      queue.enqueue(item, DEFAULT_FLUSH_INTERVAL);
      expect(localStorage.getItem(`fake-rq-key`)).to.be.a(`string`);
    });

    it(`runs callback after persisting`, function(done) {
      expect(queue.read()).to.be.empty;
      queue.enqueue(item, DEFAULT_FLUSH_INTERVAL, function(succeeded) {
        expect(succeeded).to.be.ok;

        expect(localStorage.getItem(`fake-rq-key`)).to.be.a(`string`);
        const storedQueue = queue.read();
        expect(storedQueue).to.have.lengthOf(1);

        const queuedEntry = storedQueue[0];
        expect(queuedEntry.id).to.be.a(`string`);
        expect(queuedEntry.flushAfter).to.be.greaterThan(+(new Date()) + DEFAULT_FLUSH_INTERVAL);
        expect(queuedEntry.payload).to.deep.equal(item);

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
        expect(queue.read()).to.be.empty;
        queue.enqueue(item, DEFAULT_FLUSH_INTERVAL, function(succeeded) {
          expect(succeeded).not.to.be.ok;
          expect(localStorage.getItem(`fake-rq-key`)).to.be.null;
          expect(queue.read()).to.be.empty;
          done();
        });
      });

      it(`keeps item in in-mem queue`, function(done) {
        expect(queue.read()).to.be.empty;
        queue.enqueue(item, DEFAULT_FLUSH_INTERVAL, function(succeeded) {
          expect(succeeded).not.to.be.ok;
          expect(queue.memQueue).to.have.lengthOf(1);
          expect(queue.memQueue[0].payload).to.deep.equal(item);
          done();
        });
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
      expect(queue.read()).to.have.lengthOf(items.length);
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
      expect(queue.read()).to.have.lengthOf(items.length);
    });

    it(`gracefully accepts requests for more items than are in the queue`, function() {
      const batch = queue.fillBatch(50);
      expect(batch).to.have.lengthOf(items.length);
    });
  });
});
