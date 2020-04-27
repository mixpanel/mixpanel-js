import { expect } from 'chai';
import localStorage from 'localStorage';
import sinon from 'sinon';

import { RequestBatcher } from '../../src/request-batcher';

const START_TIME = 100000;

describe(`RequestBatcher`, function() {
  let batcher;
  let clock = null;

  beforeEach(function() {
    if (clock) {
      clock.restore();
    }
    clock = sinon.useFakeTimers(START_TIME);
    localStorage.clear();
    batcher = new RequestBatcher(`fake-rb-key`, `/fake-track/`, {
      libConfig: {
        batch_flush_interval_ms: 5000,
        batch_size: 50,
      },
      storage: localStorage,
    });
  });

  afterEach(function() {
    if (clock) {
      clock.restore();
    }
    clock = null;
  });

  describe(`enqueue`, function() {
    it(`stores the item with the configured flush interval`, function(done) {
      batcher.enqueue({foo: `bar`}, function(succeeded) {
        expect(succeeded).to.be.ok;
        expect(batcher.queue.memQueue).to.have.lengthOf(1);
        const queuedEntry = batcher.queue.memQueue[0];
        expect(queuedEntry.flushAfter).to.be.greaterThan(START_TIME + 5000);
        expect(queuedEntry.flushAfter).to.be.lessThan(START_TIME + 15000);
        expect(queuedEntry.payload).to.deep.equal({foo: `bar`});
        done();
      });
    });
  });

  it(`does not flush until started`, function() {
    batcher.enqueue({foo: `bar`});
    clock.tick(20000);
debugger;
batcher.start();
  });

  it(`flushes immediately on start`);
  it(`picks up orphaned items`);
});
