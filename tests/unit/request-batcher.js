import chai, { expect } from 'chai';
import localStorage from 'localStorage';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

chai.use(sinonChai);

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
      sendRequestFunc: sinon.spy(),
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
    expect(batcher.sendRequest).not.to.have.been.called;
  });

  it(`flushes immediately on start`, function() {
    batcher.enqueue({foo: `bar`});
    clock.tick(20000);
    batcher.start();
    expect(batcher.sendRequest).to.have.been.calledOnce;
    expect(batcher.sendRequest.args[0][1]).to.deep.equal([{foo: `bar`}]);
  });

  it(`picks up orphaned items immediately`, function() {
    localStorage.setItem(`fake-rb-key`, JSON.stringify([
      {id: `fakeID1`, flushAfter: Date.now() - 60000, payload: {
          'event': `orphaned event 1`, 'properties': {'foo': 'bar'},
      }},
      {id: `fakeID2`, flushAfter: Date.now() - 240000, payload: {
          'event': `orphaned event 2`,
      }}
    ]));

    batcher.start();
    expect(batcher.sendRequest).to.have.been.calledOnce;
    const batchEvents = batcher.sendRequest.args[0][1];
    expect(batchEvents).to.have.lengthOf(2);
    expect(batchEvents[0].event).to.equal(`orphaned event 1`);
    expect(batchEvents[1].event).to.equal(`orphaned event 2`);
  });
});
