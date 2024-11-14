import chai, { expect } from 'chai';
import localStorage from 'localStorage';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { LocalStorageWrapper } from '../../src/storage/local-storage';

import { window } from '../../src/utils';

chai.use(sinonChai);

import { RequestBatcher } from '../../src/request-batcher';
import {mapValues} from 'lodash';

const LOCALSTORAGE_KEY = `fake-rb-key`;
const START_TIME = 100000;
const DEFAULT_FLUSH_INTERVAL = 5000;
const REQUEST_TIMEOUT_MS = 90000;

describe(`RequestBatcher`, function() {
  let batcher;
  let libConfig;
  let clock = null;
  let fakeSendRequest = null;

  function configureBatchSize(batchSize) {
      libConfig.batch_size = batchSize;
      batcher.resetBatchSize();
  }

  function getLocalStorageItems() {
    return JSON.parse(localStorage.getItem(LOCALSTORAGE_KEY));
  }

  function initBatcher(optionOverrides) {
    optionOverrides = optionOverrides || {};
    libConfig = {
      batch_flush_interval_ms: DEFAULT_FLUSH_INTERVAL,
      batch_request_timeout_ms: REQUEST_TIMEOUT_MS,
      batch_size: 50,
      batch_autostart: true,
    };

    batcher = new RequestBatcher(LOCALSTORAGE_KEY, Object.assign({
      libConfig,
      sendRequestFunc: sinon.stub().callsFake(fakeSendRequest(200)),
      queueStorage: new LocalStorageWrapper(localStorage),
      sharedLockStorage: localStorage,
      usePersistence: true,
    }, optionOverrides));
  }

  beforeEach(function() {
    if (clock) {
      clock.restore();
    }
    clock = sinon.useFakeTimers(START_TIME);
    // uses fake timers for delay
    fakeSendRequest = function(httpStatusCode, {error, retryAfter, delay} = {}) {
      return async function(_data, _options, cb) {
        if (delay) {
          await new Promise(resolve => setTimeout(resolve, delay));
        }
        return cb({
          httpStatusCode,
          retryAfter,
          error,
        });
      };
    };

    localStorage.clear();

    initBatcher();
  });

  afterEach(function() {
    if (clock) {
      clock.restore();
    }
    clock = null;
    fakeSendRequest = null;
  });

  describe(`enqueue`, function() {
    it(`stores the item with the configured flush interval`, async function() {
      const succeeded = await batcher.enqueue({foo: `bar`});
      expect(succeeded).to.be.ok;
      expect(batcher.queue.memQueue).to.have.lengthOf(1);
      const queuedEntry = batcher.queue.memQueue[0];
      expect(queuedEntry.flushAfter).to.be.greaterThan(START_TIME + 5000);
      expect(queuedEntry.flushAfter).to.be.lessThan(START_TIME + 15000);
      expect(queuedEntry.payload).to.deep.equal({foo: `bar`});
    });

    it(`only stores the item in memory when usePersistence=false`, async function() {
      initBatcher({usePersistence: false});
      const succeeded = await batcher.enqueue({foo: `bar`});
      expect(succeeded).to.be.ok;
      expect(batcher.queue.memQueue).to.have.lengthOf(1);
      expect(getLocalStorageItems()).to.be.null;
      const queuedEntry = batcher.queue.memQueue[0];
      expect(queuedEntry.flushAfter).to.be.greaterThan(START_TIME + 5000);
      expect(queuedEntry.flushAfter).to.be.lessThan(START_TIME + 15000);
      expect(queuedEntry.payload).to.deep.equal({foo: `bar`});
    });
  });

  describe(`flush`, function() {
    it(`does not call sendRequest when queue is empty`, async function() {
      await batcher.flush();
      expect(batcher.sendRequest).not.to.have.been.called;
    });

    it(`calls sendRequestFunc with items to flush`, async function() {
      await batcher.enqueue({foo: `bar`});
      await batcher.flush();
      expect(batcher.sendRequest).to.have.been.calledOnce;
      expect(batcher.sendRequest.args[0][0]).to.deep.equal([{foo: `bar`}]);
    });

    it(`removes items from queue on successful response`, async function() {
      batcher.sendRequest.onFirstCall().callsFake(fakeSendRequest(200));
      await batcher.enqueue({foo: `bar`});

      expect(batcher.queue.memQueue).to.have.lengthOf(1);
      expect(getLocalStorageItems()).to.have.lengthOf(1);

      await batcher.flush();

      expect(batcher.queue.memQueue).to.be.empty;
      expect(getLocalStorageItems()).to.be.empty;
    });

    it(`transforms items before sending if a hook function has been provided`, async function() {
      batcher.beforeSendHook = item => mapValues(item, v => v.toUpperCase());
      await batcher.enqueue({Hello: `World`});
      await batcher.enqueue({foo: `bar`});
      await batcher.flush();
      expect(batcher.sendRequest).to.have.been.calledOnce;
      expect(batcher.sendRequest.args[0][0]).to.deep.equal([
        {Hello: `WORLD`},
        {foo: `BAR`},
      ]);
    });

    it(`chains multiple requests when queue exceeds configured batch size`, async function() {
      configureBatchSize(3);
      for (let i = 1; i <= 8; i++) { // 3 batches (3/3/2 events)
        await batcher.enqueue({ev: `queued event ${i}`});
      }

      await batcher.flush();

      expect(batcher.sendRequest).to.have.been.calledThrice;

      // check what was sent in those requests
      expect(batcher.sendRequest.args[0][0]).to.deep.equal([
        {ev: `queued event 1`},
        {ev: `queued event 2`},
        {ev: `queued event 3`},
      ]);
      expect(batcher.sendRequest.args[1][0]).to.deep.equal([
        {ev: `queued event 4`},
        {ev: `queued event 5`},
        {ev: `queued event 6`},
      ]);
      expect(batcher.sendRequest.args[2][0]).to.deep.equal([
        {ev: `queued event 7`},
        {ev: `queued event 8`},
      ]);

      // no new requests after that
      await clock.tickAsync(DEFAULT_FLUSH_INTERVAL * 2);
      expect(batcher.sendRequest).to.have.been.calledThrice;
    });

    it(`prevents reentrant flushes`, async function() {
      batcher.sendRequest.onFirstCall().callsFake(fakeSendRequest(200, {delay: 100}));
      await batcher.enqueue({foo: `bar`});

      batcher.flush();
      await clock.tickAsync(25); // allows flush promise chain to execute, but no response yet.
      expect(batcher.sendRequest).to.have.been.calledOnce;

      await batcher.enqueue({foo2: `bar2`});
      batcher.flush();

      await clock.tickAsync(25); // would allow flush promise chain to execute, but it shouldn't
      expect(batcher.sendRequest).to.have.been.calledOnce; // no new request

      await clock.tickAsync(100); // now the first request has completed
      expect(batcher.sendRequest).to.have.been.calledTwice;

      expect(batcher.sendRequest.args[0][0]).to.deep.equal([{foo: `bar`}]);
      expect(batcher.sendRequest.args[1][0]).to.deep.equal([{foo2: `bar2`}]);
    });

    describe(`error handling`, function() {
      it(`retries with exponential backoff`, async function() {
        batcher.sendRequest
          .onCall(0).callsFake(fakeSendRequest(500))
          .onCall(1).callsFake(fakeSendRequest(503))
          .onCall(2).callsFake(fakeSendRequest(503))
          .onCall(3).callsFake(fakeSendRequest(200));

        await batcher.enqueue({foo: `bar`});
        await batcher.enqueue({foo2: `bar2`});
        await batcher.flush();

        expect(batcher.sendRequest).to.have.been.calledOnce;

        await clock.tickAsync(DEFAULT_FLUSH_INTERVAL);

        // no new requests, items are still in queue
        expect(batcher.sendRequest).to.have.been.calledOnce;
        expect(batcher.queue.memQueue).to.have.lengthOf(2);
        expect(getLocalStorageItems()).to.have.lengthOf(2);

        await clock.tickAsync(DEFAULT_FLUSH_INTERVAL);
        // retry with same data
        expect(batcher.sendRequest).to.have.been.calledTwice;
        expect(batcher.sendRequest.args[1][0]).to.deep.equal(batcher.sendRequest.args[0][0]);

        // oh no, another explosion!
        await clock.tickAsync(DEFAULT_FLUSH_INTERVAL * 2);
        // no new requests, items are still in queue
        expect(batcher.sendRequest).to.have.been.calledTwice;
        expect(batcher.queue.memQueue).to.have.lengthOf(2);
        expect(getLocalStorageItems()).to.have.lengthOf(2);

        await clock.tickAsync(DEFAULT_FLUSH_INTERVAL * 2);
        // retry with same data
        expect(batcher.sendRequest).to.have.been.calledThrice;
        expect(batcher.sendRequest.args[2][0]).to.deep.equal(batcher.sendRequest.args[0][0]);

        // do it again, oh the humanity
        await clock.tickAsync(DEFAULT_FLUSH_INTERVAL * 4);
        // no new requests, items are still in queue
        expect(batcher.sendRequest).to.have.been.calledThrice;
        expect(batcher.queue.memQueue).to.have.lengthOf(2);
        expect(getLocalStorageItems()).to.have.lengthOf(2);

        await clock.tickAsync(DEFAULT_FLUSH_INTERVAL * 4);
        // retry with same data
        expect(batcher.sendRequest).to.have.callCount(4);
        expect(batcher.sendRequest.args[3][0]).to.deep.equal(batcher.sendRequest.args[0][0]);

        // will the madness ever end? finally the API call succeeds
        await clock.tickAsync(DEFAULT_FLUSH_INTERVAL * 100); // a long time
        expect(batcher.sendRequest).to.have.callCount(4); // no new requests
        expect(batcher.queue.memQueue).to.be.empty;
        expect(getLocalStorageItems()).to.be.empty;
      });

      it(`caps backoff at 10 minutes`, async function() {
        batcher.sendRequest.callsFake(fakeSendRequest(503));
        await batcher.enqueue({foo: `bar`});
        await batcher.flush();

        let expectedRequests = 1;
        let tryAfter = DEFAULT_FLUSH_INTERVAL * 2;
        const TEN_MINUTES = 10 * 60 * 1000;
        while (tryAfter <= TEN_MINUTES) {
          expect(batcher.sendRequest).to.have.callCount(expectedRequests);

          await clock.tickAsync(tryAfter);
          tryAfter *= 2;
          expectedRequests++;
        }

        expect(batcher.sendRequest).to.have.callCount(expectedRequests);
        await clock.tickAsync(TEN_MINUTES - 1);
        expect(batcher.sendRequest).to.have.callCount(expectedRequests); // no new request
        await clock.tickAsync(1);
        expect(batcher.sendRequest).to.have.callCount(++expectedRequests);

        // do it again, exactly 10 minutes til next request
        expect(batcher.sendRequest).to.have.callCount(expectedRequests);
        await clock.tickAsync(TEN_MINUTES - 1);
        expect(batcher.sendRequest).to.have.callCount(expectedRequests); // no new request
        await clock.tickAsync(1);
        expect(batcher.sendRequest).to.have.callCount(++expectedRequests);
      });

      it(`resets flush interval when request succeeds after backoff`, async function() {
        batcher.sendRequest
          .onCall(0).callsFake(fakeSendRequest(503))
          .onCall(1).callsFake(fakeSendRequest(503))
          .onCall(2).callsFake(fakeSendRequest(503))
          .onCall(3).callsFake(fakeSendRequest(200));

        await batcher.flush();
        await batcher.enqueue({ev: `queued event 1`});
        await batcher.enqueue({ev: `queued event 2`});

        // fail a couple times
        await clock.tickAsync(DEFAULT_FLUSH_INTERVAL);
        expect(batcher.sendRequest).to.have.been.calledOnce;
        await clock.tickAsync(DEFAULT_FLUSH_INTERVAL * 2);
        expect(batcher.sendRequest).to.have.been.calledTwice;

        // configuring default flush interval shouldn't affect anything during failure backoff
        libConfig.batch_flush_interval_ms = 8000;

        await clock.tickAsync(DEFAULT_FLUSH_INTERVAL * 4);
        expect(batcher.sendRequest).to.have.been.calledThrice;

        // succeed!
        await clock.tickAsync(DEFAULT_FLUSH_INTERVAL * 8);
        expect(batcher.sendRequest).to.have.callCount(4);

        // at this point the success response should have reset the interval to the 8000
        // configured above
        await batcher.enqueue({ev: `queued event 3`});
        await clock.tickAsync(7000);
        expect(batcher.sendRequest).to.have.callCount(4); // no new request yet
        await clock.tickAsync(1000);
        expect(batcher.sendRequest).to.have.callCount(5);
      });

      it(`can queue up new events while failing requests are retrying`, async function() {
        batcher.sendRequest.callsFake(fakeSendRequest(503));
        await batcher.flush();
        await batcher.enqueue({ev: `queued event 1`});
        await batcher.enqueue({ev: `queued event 2`});

        // fail a couple times
        await clock.tickAsync(DEFAULT_FLUSH_INTERVAL);
        expect(batcher.sendRequest).to.have.been.calledOnce;
        await clock.tickAsync(DEFAULT_FLUSH_INTERVAL * 2);
        expect(batcher.sendRequest).to.have.been.calledTwice;

        await batcher.enqueue({ev: `queued event 3`});

        await clock.tickAsync(DEFAULT_FLUSH_INTERVAL * 4);
        expect(batcher.sendRequest).to.have.callCount(3);

        // should include all events in current retry
        expect(batcher.sendRequest.args[2][0]).to.deep.equal([
          {ev: `queued event 1`},
          {ev: `queued event 2`},
          {ev: `queued event 3`},
        ]);
      });

      it(`retries ERR_INTERNET_DISCONNECTED and continues queueing`, async function() {
        batcher.sendRequest.callsFake(fakeSendRequest(0));

        var isOnlineStub = sinon.stub(window.navigator, `onLine`).value(false);
        await batcher.flush();
        await batcher.enqueue({ev: `queued event 1`});
        await batcher.enqueue({ev: `queued event 2`});

        // fail a couple times
        await clock.tickAsync(DEFAULT_FLUSH_INTERVAL);
        expect(batcher.sendRequest).to.have.been.calledOnce;
        await clock.tickAsync(DEFAULT_FLUSH_INTERVAL * 2);
        expect(batcher.sendRequest).to.have.been.calledTwice;

        batcher.enqueue({ev: `queued event 3`});

        await clock.tickAsync(DEFAULT_FLUSH_INTERVAL * 4);
        expect(batcher.sendRequest).to.have.callCount(3);

        // should include all events in current retry
        expect(batcher.sendRequest.args[2][0]).to.deep.equal([
          {ev: `queued event 1`},
          {ev: `queued event 2`},
          {ev: `queued event 3`},
        ]);
        isOnlineStub.restore();
      });

      it(`does not retry 400s / successful API rejections`, async function() {
        batcher.sendRequest.callsFake(fakeSendRequest(400, {delay: 100}));
        await batcher.enqueue({ev: `queued event 1`});
        await batcher.enqueue({ev: `queued event 2`});
        
        batcher.flush();
        await clock.tickAsync(50); // allows flush promise chain to execute, but no response yet.
        expect(batcher.queue.memQueue).to.have.lengthOf(2);
        expect(getLocalStorageItems()).to.have.lengthOf(2);

        await clock.tickAsync(100000);
        expect(batcher.sendRequest).to.have.been.calledOnce; // no new request
        expect(batcher.queue.memQueue).to.be.empty;
        expect(getLocalStorageItems()).to.be.empty;
      });

      it(`does not retry ERR_BLOCKED_BY_CLIENT`, async function() {
        batcher.sendRequest.callsFake(fakeSendRequest(0), {delay: 100});

        await batcher.enqueue({ev: `queued event 1`});
        await batcher.enqueue({ev: `queued event 2`});
        batcher.flush();

        expect(batcher.queue.memQueue).to.have.lengthOf(2);
        expect(getLocalStorageItems()).to.have.lengthOf(2);

        await clock.tickAsync(100000);
        expect(batcher.sendRequest).to.have.been.calledOnce; // no new request
        expect(batcher.queue.memQueue).to.be.empty;
        expect(getLocalStorageItems()).to.be.empty;
      });

      it(`retries with backoff after 429`, async function() {
        batcher.sendRequest.callsFake(fakeSendRequest(429), {delay: 100});

        await batcher.enqueue({foo: `bar`});
        await batcher.enqueue({foo2: `bar2`});
        batcher.flush();
        await clock.tickAsync(50);
        expect(batcher.sendRequest).to.have.been.calledOnce;

        await clock.tickAsync(DEFAULT_FLUSH_INTERVAL);
        // no new requests, items are still in queue
        expect(batcher.sendRequest).to.have.been.calledOnce;
        expect(batcher.queue.memQueue).to.have.lengthOf(2);
        expect(getLocalStorageItems()).to.have.lengthOf(2);

        await clock.tickAsync(DEFAULT_FLUSH_INTERVAL);
        // retry with same data
        expect(batcher.sendRequest).to.have.been.calledTwice;
        expect(batcher.sendRequest.args[1][0]).to.deep.equal(batcher.sendRequest.args[0][0]);
      });

      it(`reduces batch size after 413 Payload Too Large`, async function() {
        configureBatchSize(9); // nice odd number
        batcher.sendRequest
          .onCall(0).callsFake(fakeSendRequest(413))
          .onCall(1).callsFake(fakeSendRequest(200), {delay: 100})

        for (let i = 1; i <= 7; i++) {
          await batcher.enqueue({ev: `queued event ${i}`});
        }
        await batcher.flush();

        // should have tried to send all 7 items in one go
        expect(batcher.sendRequest.args[0][0]).to.have.lengthOf(7);
        expect(batcher.sendRequest).to.have.been.calledOnce;

        await clock.tickAsync(DEFAULT_FLUSH_INTERVAL);
        expect(batcher.sendRequest).to.have.been.calledThrice; // flushes two halves
        // reduced batch size
        expect(batcher.sendRequest.args[1][0]).to.deep.equal([
          {ev: `queued event 1`},
          {ev: `queued event 2`},
          {ev: `queued event 3`},
          {ev: `queued event 4`},
        ]);
        expect(batcher.sendRequest.args[2][0]).to.deep.equal([
          {ev: `queued event 5`},
          {ev: `queued event 6`},
          {ev: `queued event 7`},
        ]);
      });

      it(`does not retry single item which produces 413 Payload Too Large`, async function() {
        batcher.sendRequest.callsFake(fakeSendRequest(413));

        await batcher.enqueue({ev: `bloated item`});
        await batcher.flush();
        expect(batcher.sendRequest).to.have.been.calledOnce;
        await clock.tickAsync(240000);
        expect(batcher.sendRequest).to.have.been.calledOnce; // no new request

        // first item should have been dropped, and we resume normal batching
        batcher.enqueue({ev: `normal item 1`});
        batcher.enqueue({ev: `normal item 2`});
        await clock.tickAsync(DEFAULT_FLUSH_INTERVAL);
        expect(batcher.sendRequest).to.have.been.calledTwice;
        expect(batcher.sendRequest.args[1][0]).to.deep.equal([
          {ev: `normal item 1`},
          {ev: `normal item 2`},
        ]);
      });

      it(`respects Retry-After response header for one retry`, async function() {
        batcher.sendRequest
          .onCall(0).callsFake(fakeSendRequest(503, {retryAfter: `20`}))
          .onCall(1).callsFake(fakeSendRequest(200));

        await batcher.enqueue({ev: `queued event 1`});
        await batcher.enqueue({ev: `queued event 2`});
        await batcher.flush();

        await clock.tickAsync(10000);
        expect(batcher.sendRequest).to.have.been.calledOnce; // no retry yet
        await clock.tickAsync(10000);
        expect(batcher.sendRequest).to.have.been.calledTwice; // 20s have passed

        // after success, should reset to configured flush interval
        batcher.enqueue({ev: `queued event 3`});
        await clock.tickAsync(DEFAULT_FLUSH_INTERVAL);
        expect(batcher.sendRequest).to.have.been.calledThrice;
        expect(batcher.sendRequest.args[2][0]).to.deep.equal([
          {ev: `queued event 3`},
        ]);
      });

      it(`handles failures to remove items from queue and eventually stops batchers`, async function() {
        batcher.sendRequest.callsFake(fakeSendRequest(200, {delay: 100}));
        batcher.stopAllBatching = sinon.spy();

        await batcher.enqueue({foo: `bar`});
        batcher.flush()
        await clock.tickAsync(50);

        batcher.queue.queueStorage = new LocalStorageWrapper({
          getItem: localStorage.getItem.bind(localStorage),
          setItem: () => {
            throw new Error(`persistence failure`);
          },
        });

        expect(batcher.queue.memQueue).to.have.lengthOf(1);
        expect(getLocalStorageItems()).to.have.lengthOf(1);

        await clock.tickAsync(50);
        expect(batcher.queue.memQueue).to.be.empty;
        expect(getLocalStorageItems()).to.have.lengthOf(1);
        expect(batcher.consecutiveRemovalFailures).to.equal(1);

        // no immediate flush
        expect(batcher.sendRequest).to.have.been.calledOnce;

        // make the event orphaned so we try to send it again
        await clock.tickAsync(DEFAULT_FLUSH_INTERVAL * 3);
        expect(batcher.sendRequest).to.have.been.calledTwice;
        expect(batcher.consecutiveRemovalFailures).to.equal(2);

        // now it will try to send on every flush
        await clock.tickAsync(DEFAULT_FLUSH_INTERVAL);
        expect(batcher.sendRequest).to.have.callCount(3);
        expect(batcher.consecutiveRemovalFailures).to.equal(3);

        await clock.tickAsync(DEFAULT_FLUSH_INTERVAL);
        expect(batcher.sendRequest).to.have.callCount(4);
        expect(batcher.consecutiveRemovalFailures).to.equal(4);

        await clock.tickAsync(DEFAULT_FLUSH_INTERVAL);
        expect(batcher.sendRequest).to.have.callCount(5);
        expect(batcher.consecutiveRemovalFailures).to.equal(5);

        expect(batcher.stopAllBatching).not.to.have.been.called;
        await clock.tickAsync(DEFAULT_FLUSH_INTERVAL);
        expect(batcher.sendRequest).to.have.callCount(6);
        expect(batcher.consecutiveRemovalFailures).to.equal(6);
        expect(batcher.stopAllBatching).to.have.been.calledOnce;
      });

      context(`when request times out`, function() {
        function timeOutRequest() {
          sendResponse(0, {error: `timeout`});
        }

        it(`keeps items in the queue`, async function() {
          batcher.sendRequest.callsFake(fakeSendRequest(0, {delay: REQUEST_TIMEOUT_MS, error: `timeout`}));

          await batcher.enqueue({foo: `bar`});
          batcher.flush();
          await clock.tickAsync(REQUEST_TIMEOUT_MS);
          expect(batcher.queue.memQueue).to.have.lengthOf(1);
          expect(getLocalStorageItems()).to.have.lengthOf(1);
        });

        it(`retries immediately`, async function() {
          batcher.sendRequest.callsFake(fakeSendRequest(0, {delay: REQUEST_TIMEOUT_MS, error: `timeout`}));

          await batcher.enqueue({foo: `bar`});
          batcher.flush();

          await clock.tickAsync(REQUEST_TIMEOUT_MS);
          expect(batcher.sendRequest).to.have.been.calledTwice;
          expect(batcher.sendRequest.args[1][0]).to.deep.equal([{foo: `bar`}]);
        });

        it(`checks clock before treating it as a real timeout`, async function() {
          // ensure flush is resilient to "timed out" responses coming too
          // quickly and causing a fast flush/fail loop
          batcher.sendRequest.callsFake(fakeSendRequest(0, {delay: 100, error: `timeout`}));

          await batcher.enqueue({foo: `bar`});
          batcher.flush();
          await clock.tickAsync(50);

          expect(batcher.sendRequest).to.have.been.calledOnce;
          await clock.tickAsync(50);
          // no new request; there was no significant time between sending
          // the original request and getting the "timeout" response
          expect(batcher.sendRequest).to.have.been.calledOnce;

          // should have been treated like a normal error and backed off
          await clock.tickAsync(DEFAULT_FLUSH_INTERVAL * 2);
          expect(batcher.sendRequest).to.have.been.calledTwice;
          expect(batcher.sendRequest.args[1][0]).to.deep.equal([{foo: `bar`}]);
        });
      });
    });
  });

  context(`before starting`, function() {
    it(`does not flush`, async function() {
      batcher.enqueue({foo: `bar`});
      await clock.tickAsync(20000);
      expect(batcher.sendRequest).not.to.have.been.called;
    });

    it(`flushes immediately on start`, async function() {
      batcher.enqueue({foo: `bar`});
      await clock.tickAsync(20000);
      await batcher.start();
      expect(batcher.sendRequest).to.have.been.calledOnce;
      expect(batcher.sendRequest.args[0][0]).to.deep.equal([{foo: `bar`}]);
    });
  });

  context(`after starting`, function() {
    beforeEach(function() {
      batcher.start();
    });

    it(`does not send requests until flush interval`, async function() {
      await batcher.enqueue({first: `event`});
      expect(batcher.sendRequest).not.to.have.been.called;
      await clock.tickAsync(1000);
      expect(batcher.sendRequest).not.to.have.been.called;
      await batcher.enqueue({second: `event`});
      expect(batcher.sendRequest).not.to.have.been.called;
      await clock.tickAsync(1000);
      expect(batcher.sendRequest).not.to.have.been.called;
      await clock.tickAsync(DEFAULT_FLUSH_INTERVAL);
      expect(batcher.sendRequest).to.have.been.calledOnce;
      expect(batcher.sendRequest.args[0][0]).to.deep.equal([
        {first: `event`}, {second: `event`},
      ]);
    });

    it(`still sends batched requests if localStorage gets cleared`, async function() {
      await batcher.enqueue({name: `storagetest 1`});
      await batcher.enqueue({name: `storagetest 2`});
      expect(getLocalStorageItems().map(item => item.payload)).to.deep.equal([
        {name: `storagetest 1`},
        {name: `storagetest 2`},
      ]);

      // kill it
      localStorage.removeItem(LOCALSTORAGE_KEY);

      expect(batcher.sendRequest).not.to.have.been.called;
      await clock.tickAsync(DEFAULT_FLUSH_INTERVAL);
      expect(batcher.sendRequest).to.have.been.calledOnce;
      expect(batcher.sendRequest.args[0][0]).to.deep.equal([
        {name: `storagetest 1`},
        {name: `storagetest 2`},
      ]);
    });
  });

  context(`when items already exist in localStorage`, function() {
    it(`flushes orphaned items immediately`, async function() {
      batcher.sendRequest.callsFake(fakeSendRequest(200, {delay: 100}));

      localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify([
        {id: `fakeID1`, flushAfter: Date.now() - 60000, payload: {
            'event': `orphaned event 1`, 'properties': {'foo': 'bar'},
        }},
        {id: `fakeID2`, flushAfter: Date.now() - 240000, payload: {
            'event': `orphaned event 2`,
        }}
      ]));

      batcher.start();
      await clock.tickAsync(50);

      expect(batcher.sendRequest).to.have.been.calledOnce;
      const batchEvents = batcher.sendRequest.args[0][0];
      expect(batchEvents).to.have.lengthOf(2);
      expect(batchEvents[0].event).to.equal(`orphaned event 1`);
      expect(batchEvents[1].event).to.equal(`orphaned event 2`);

      expect(getLocalStorageItems()).to.have.lengthOf(2);
      await clock.tickAsync(50);
      expect(getLocalStorageItems()).to.be.empty;
    });

    it(`ignores non-orphaned items`, async function() {
      batcher.sendRequest.callsFake(fakeSendRequest(200, {delay: 100}));

      localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify([
        {id: `fakeID1`, flushAfter: Date.now() - 60000, payload: {
            'event': `orphaned event 1`, 'properties': {'foo': 'bar'},
        }},
        {id: `fakeID2`, flushAfter: Date.now() + 240000, payload: {
            'event': `orphaned event 2`,
        }}
      ]));

      batcher.start();
      await clock.tickAsync(50);
      expect(batcher.sendRequest).to.have.been.calledOnce;
      const batchEvents = batcher.sendRequest.args[0][0];
      expect(batchEvents).to.have.lengthOf(1);
      expect(batchEvents[0].event).to.equal(`orphaned event 1`);

      expect(getLocalStorageItems()).to.have.lengthOf(2);
      await clock.tickAsync(50);
      expect(getLocalStorageItems()).to.have.lengthOf(1);
    });

    it(`sends pre-existing items as they become orphaned later`, async function() {
      localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify([
        {id: `fakeID1`, flushAfter: Date.now() + 60000, payload: {
            'event': `orphaned event 1`, 'properties': {'foo': 'bar'},
        }},
        {id: `fakeID2`, flushAfter: Date.now() + 240000, payload: {
            'event': `orphaned event 2`,
        }}
      ]));

      batcher.start();

      await clock.tickAsync(20000);
      expect(batcher.sendRequest).not.to.have.been.called;

      // first event becomes orphaned

      await clock.tickAsync(80000);
      expect(batcher.sendRequest).to.have.been.calledOnce;
      const payload = batcher.sendRequest.args[0][0];
      expect(payload).to.have.lengthOf(1);
      expect(payload[0]).to.have.property(`event`, `orphaned event 1`);
      expect(payload[0]).to.have.nested.include({'properties.foo': `bar`});

      expect(getLocalStorageItems()).to.have.lengthOf(1);
      expect(getLocalStorageItems()[0].payload.event).to.equal(`orphaned event 2`);

      await clock.tickAsync(20000);
      expect(batcher.sendRequest).to.have.been.calledOnce; // no new request

      // second event becomes orphaned

      await clock.tickAsync(200000);
      expect(batcher.sendRequest).to.have.been.calledTwice;
      expect(batcher.sendRequest.args[1][0]).to.deep.equal([
        {'event': `orphaned event 2`},
      ]);
      expect(getLocalStorageItems()).to.be.empty;
    });

    it(`does not apply before-send hooks to orphaned items`, async function() {
      batcher.sendRequest.callsFake(fakeSendRequest(200, {delay: 100}));
      batcher.beforeSendHook = item => mapValues(item, v => v.toUpperCase());

      localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify([
        {id: `fakeID1`, flushAfter: Date.now() - 60000, payload: {
            'event': `orphaned event 1`,
        }},
        {id: `fakeID2`, flushAfter: Date.now() - 240000, payload: {
            'event': `orphaned event 2`,
        }}
      ]));
      await batcher.enqueue({Hello: `World`});
      await batcher.enqueue({foo: `bar`});

      batcher.start();
      await clock.tickAsync(50);
      expect(batcher.sendRequest).to.have.been.calledOnce;
      expect(batcher.sendRequest.args[0][0]).to.deep.equal([
        {Hello: `WORLD`},
        {foo: `BAR`},
        {event: `orphaned event 1`}, // did not get uppercased
        {event: `orphaned event 2`},
      ]);
      expect(getLocalStorageItems()).to.have.lengthOf(4);

      await clock.tickAsync(50);
      expect(getLocalStorageItems()).to.be.empty;
    });

    it(`ignores and overwrites malformed localStorage entries`, async function() {
      localStorage.setItem(LOCALSTORAGE_KEY, `just some garbage {{{`);
      await batcher.start();
      expect(batcher.sendRequest).not.to.have.been.called;

      // should clear and overwrite garbage localStorage when enqueueing
      await batcher.enqueue({foo: `bar`});
      await batcher.enqueue({baz: `quux`});
      expect(getLocalStorageItems().map(item => item.payload)).to.deep.equal([
        {foo: `bar`},
        {baz: `quux`},
      ]);

      await clock.tickAsync(DEFAULT_FLUSH_INTERVAL);
      expect(batcher.sendRequest).to.have.been.calledOnce;
      expect(batcher.sendRequest.args[0][0]).to.deep.equal([
        {foo: `bar`},
        {baz: `quux`},
      ]);
    });

    it(`drops malformed individual items in the localStorage queue`, async function() {
      localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify([
        {id: `fakeID1`, flushAfter: Date.now() - 10000, payload: {
          'event': `orphaned event 1`, 'properties': {'foo': 'bar'},
        }},

        `HOW DID THIS RANDOM STRING GET IN MY QUEUE??`,

        {id: `fakeID2`, flushAfter: Date.now() - 10000, payload: {
          'event': `orphaned event 2`,
        }}
      ]));
      expect(JSON.parse(localStorage.getItem(LOCALSTORAGE_KEY))).to.have.lengthOf(3);

      await batcher.start();
      expect(batcher.sendRequest).to.have.been.calledOnce;
      const payload = batcher.sendRequest.args[0][0];
      expect(payload).to.have.lengthOf(2);
      expect(payload[0]).to.have.property(`event`, `orphaned event 1`);
      expect(payload[0]).to.have.nested.include({'properties.foo': `bar`});
      expect(payload[1]).to.have.property(`event`, `orphaned event 2`);
      expect(payload[1]).not.to.have.property(`properties`);
      expect(getLocalStorageItems()).to.be.empty; // invalid item got cleared
    });
  });
});
