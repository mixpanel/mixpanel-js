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

  function getLocalStorageItems() {
    return JSON.parse(localStorage.getItem(`fake-rb-key`));
  }

  function sendResponse(status, requestIndex = null) {
    if (requestIndex === null) {
      // default to last request sent
      requestIndex = batcher.sendRequest.args.length - 1;
    }
    batcher.sendRequest.args[requestIndex][3]({
      'xhr_req': {status},
    });
  }

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

  context(`when items already exist in localStorage`, function() {
    it(`flushes orphaned items immediately`, function() {
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

      expect(getLocalStorageItems()).to.have.lengthOf(2);
      sendResponse(200);
      expect(getLocalStorageItems()).to.be.empty;
    });

    it(`ignores non-orphaned items`, function() {
      localStorage.setItem(`fake-rb-key`, JSON.stringify([
        {id: `fakeID1`, flushAfter: Date.now() - 60000, payload: {
            'event': `orphaned event 1`, 'properties': {'foo': 'bar'},
        }},
        {id: `fakeID2`, flushAfter: Date.now() + 240000, payload: {
            'event': `orphaned event 2`,
        }}
      ]));

      batcher.start();
      expect(batcher.sendRequest).to.have.been.calledOnce;
      const batchEvents = batcher.sendRequest.args[0][1];
      expect(batchEvents).to.have.lengthOf(1);
      expect(batchEvents[0].event).to.equal(`orphaned event 1`);

      expect(getLocalStorageItems()).to.have.lengthOf(2);
      sendResponse(200);
      expect(getLocalStorageItems()).to.have.lengthOf(1);
    });

    it(`sends pre-existing items as they become orphaned later`, function() {
      localStorage.setItem(`fake-rb-key`, JSON.stringify([
        {id: `fakeID1`, flushAfter: Date.now() + 60000, payload: {
            'event': `orphaned event 1`, 'properties': {'foo': 'bar'},
        }},
        {id: `fakeID2`, flushAfter: Date.now() + 240000, payload: {
            'event': `orphaned event 2`,
        }}
      ]));

      batcher.start();

      clock.tick(20000);
      expect(batcher.sendRequest).not.to.have.been.called;

      // first event becomes orphaned

      clock.tick(80000);
      expect(batcher.sendRequest).to.have.been.calledOnce;
      let batchEvents = batcher.sendRequest.args[0][1];
      expect(batchEvents).to.have.lengthOf(1);
      expect(batchEvents[0].event).to.equal(`orphaned event 1`);

      expect(getLocalStorageItems()).to.have.lengthOf(2);
      sendResponse(200);
      expect(getLocalStorageItems()).to.have.lengthOf(1);

      clock.tick(20000);
      expect(batcher.sendRequest).to.have.been.calledOnce; // no new request

      // second event becomes orphaned

      clock.tick(200000);
      expect(batcher.sendRequest).to.have.been.calledTwice;
      batchEvents = batcher.sendRequest.args[1][1];
      expect(batchEvents[0].event).to.equal(`orphaned event 2`);

      expect(getLocalStorageItems()).to.have.lengthOf(1);
      sendResponse(200);
      expect(getLocalStorageItems()).to.be.empty;
    });
  });
});
