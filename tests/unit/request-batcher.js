import chai, { expect } from 'chai';
import localStorage from 'localStorage';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

chai.use(sinonChai);

import { RequestBatcher } from '../../src/request-batcher';

const LOCALSTORAGE_KEY = `fake-rb-key`;
const START_TIME = 100000;
const DEFAULT_FLUSH_INTERVAL = 5000;
const REQUEST_TIMEOUT_MS = 90000;

describe(`RequestBatcher`, function() {
  let batcher;
  let clock = null;

  function getLocalStorageItems() {
    return JSON.parse(localStorage.getItem(LOCALSTORAGE_KEY));
  }

  function sendResponse(status, error) {
    // respond to last request sent
    const requestIndex = batcher.sendRequest.args.length - 1;
    batcher.sendRequest.args[requestIndex][3]({
      'xhr_req': {status},
      error,
    });
  }

  beforeEach(function() {
    if (clock) {
      clock.restore();
    }
    clock = sinon.useFakeTimers(START_TIME);
    localStorage.clear();

    batcher = new RequestBatcher(LOCALSTORAGE_KEY, `/fake-track/`, {
      libConfig: {
        batch_flush_interval_ms: DEFAULT_FLUSH_INTERVAL,
        batch_request_timeout_ms: REQUEST_TIMEOUT_MS,
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

  describe(`flush`, function() {
    it(`does not call sendRequest when queue is empty`, function() {
      batcher.flush();
      expect(batcher.sendRequest).not.to.have.been.called;
    });

    it(`calls sendRequest with items to flush`, function() {
      batcher.enqueue({foo: `bar`});
      batcher.flush();
      expect(batcher.sendRequest).to.have.been.calledOnce;
      expect(batcher.sendRequest.args[0][1]).to.deep.equal([{foo: `bar`}]);
    });

    it(`removes items from queue on successful response`, function() {
      batcher.enqueue({foo: `bar`});
      batcher.flush();

      expect(batcher.queue.memQueue).to.have.lengthOf(1);
      expect(getLocalStorageItems()).to.have.lengthOf(1);
      sendResponse(200);
      expect(batcher.queue.memQueue).to.be.empty;
      expect(getLocalStorageItems()).to.be.empty;
    });

    it(`prevents reentrant flushes`, function() {
      batcher.enqueue({foo: `bar`});
      batcher.flush();
      expect(batcher.sendRequest).to.have.been.calledOnce;

      batcher.enqueue({foo2: `bar2`});
      batcher.flush();
      expect(batcher.sendRequest).to.have.been.calledOnce; // no new request

      sendResponse(200);
      expect(batcher.sendRequest).to.have.been.calledTwice;

      expect(batcher.sendRequest.args[0][1]).to.deep.equal([{foo: `bar`}]);
      expect(batcher.sendRequest.args[1][1]).to.deep.equal([{foo2: `bar2`}]);
    });

    context(`when request times out`, function() {
      function timeOutRequest() {
        sendResponse(0, `timeout`);
      }

      it(`keeps items in the queue`, function() {
        batcher.enqueue({foo: `bar`});
        batcher.flush();
        clock.tick(REQUEST_TIMEOUT_MS);
        timeOutRequest();
        expect(batcher.queue.memQueue).to.have.lengthOf(1);
        expect(getLocalStorageItems()).to.have.lengthOf(1);
      });

      it(`retries immediately`, function() {
        batcher.enqueue({foo: `bar`});
        batcher.flush();
        clock.tick(REQUEST_TIMEOUT_MS);
        timeOutRequest();
        expect(batcher.sendRequest).to.have.been.calledTwice;
        expect(batcher.sendRequest.args[1][1]).to.deep.equal([{foo: `bar`}]);
      });

      it(`checks clock before treating it as a real timeout`, function() {
        // ensure flush is resilient to "timed out" responses coming too
        // quickly and causing a fast flush/fail loop

        batcher.enqueue({foo: `bar`});
        batcher.flush();
        expect(batcher.sendRequest).to.have.been.calledOnce;
        timeOutRequest();

        // no new request; there was no significant time between sending
        // the original request and getting the "timeout" response
        expect(batcher.sendRequest).to.have.been.calledOnce;

        // should have been treated like a normal error and backed off
        clock.tick(DEFAULT_FLUSH_INTERVAL * 2);
        expect(batcher.sendRequest).to.have.been.calledTwice;
        expect(batcher.sendRequest.args[1][1]).to.deep.equal([{foo: `bar`}]);
      });
    });
  });

  context(`when items already exist in localStorage`, function() {
    it(`flushes orphaned items immediately`, function() {
      localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify([
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
      localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify([
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
      localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify([
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
