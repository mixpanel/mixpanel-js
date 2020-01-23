import { expect } from 'chai';
import localStorage from 'localStorage';

import { RequestQueue } from '../../src/request-queue';

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
      queue.enqueue(item, 10000);
      expect(queue.memQueue).to.have.lengthOf(1);

      const queuedEntry = queue.memQueue[0];
      expect(queuedEntry.id).to.be.a(`string`);
      expect(queuedEntry.flushAfter).to.be.greaterThan(+(new Date()) + 10000);
      expect(queuedEntry.payload).to.deep.equal(item);
    });

    it(`persists the given item in localStorage`, function() {
      expect(localStorage.getItem(`fake-rq-key`)).to.be.null;
      expect(queue.read()).to.be.empty;
      queue.enqueue(item, 10000);
      expect(localStorage.getItem(`fake-rq-key`)).to.be.a(`string`);
    });

    it(`runs callback after persisting`, function(done) {
      expect(queue.read()).to.be.empty;
      queue.enqueue(item, 10000, function(succeeded) {
        expect(succeeded).to.be.ok;

        expect(localStorage.getItem(`fake-rq-key`)).to.be.a(`string`);
        const storedQueue = queue.read();
        expect(storedQueue).to.have.lengthOf(1);

        const queuedEntry = storedQueue[0];
        expect(queuedEntry.id).to.be.a(`string`);
        expect(queuedEntry.flushAfter).to.be.greaterThan(+(new Date()) + 10000);
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

      it(`reports failure in callback if persistence failed`, function(done) {
        expect(queue.read()).to.be.empty;
        queue.enqueue(item, 10000, function(succeeded) {
          expect(succeeded).not.to.be.ok;
          expect(localStorage.getItem(`fake-rq-key`)).to.be.null;
          expect(queue.read()).to.be.empty;
          done();
        });
      });
    });
  });
});
