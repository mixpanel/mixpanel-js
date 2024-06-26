import chai, { expect } from 'chai';
import localStorage from 'localStorage';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

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

  function configureBatchSize(batchSize) {
      libConfig.batch_size = batchSize;
      batcher.resetBatchSize();
  }

  function getLocalStorageItems() {
    return JSON.parse(localStorage.getItem(LOCALSTORAGE_KEY));
  }

  function sendResponse(status, {error, retryAfter} = {}) {
    // respond to last request sent
    const requestIndex = batcher.sendRequest.args.length - 1;
    batcher.sendRequest.args[requestIndex][2]({
      status,
      retryAfter,
      error,
    });
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
      sendRequestFunc: sinon.spy(),
      storage: localStorage,
      usePersistence: true,
    }, optionOverrides));
  }

  beforeEach(function() {
    if (clock) {
      clock.restore();
    }
    clock = sinon.useFakeTimers(START_TIME);
    localStorage.clear();

    initBatcher();
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

    it(`only stores the item in memory when usePersistence=false`, function(done) {
      initBatcher({usePersistence: false});
      batcher.enqueue({foo: `bar`}, function(succeeded) {
        expect(succeeded).to.be.ok;
        expect(batcher.queue.memQueue).to.have.lengthOf(1);
        expect(getLocalStorageItems()).to.be.null;
        const queuedEntry = batcher.queue.memQueue[0];
        expect(queuedEntry.flushAfter).to.be.greaterThan(START_TIME + 5000);
        expect(queuedEntry.flushAfter).to.be.lessThan(START_TIME + 15000);
        expect(queuedEntry.payload).to.deep.equal({foo: `bar`});
        done();
      });
    });
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
      expect(batcher.sendRequest.args[0][0]).to.deep.equal([{foo: `bar`}]);
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

    it(`transforms items before sending if a hook function has been provided`, function() {
      batcher.beforeSendHook = item => mapValues(item, v => v.toUpperCase());
      batcher.enqueue({Hello: `World`});
      batcher.enqueue({foo: `bar`});
      batcher.flush();
      expect(batcher.sendRequest).to.have.been.calledOnce;
      expect(batcher.sendRequest.args[0][0]).to.deep.equal([
        {Hello: `WORLD`},
        {foo: `BAR`},
      ]);
    });

    it(`chains multiple requests when queue exceeds configured batch size`, function() {
      configureBatchSize(3);
      for (let i = 1; i <= 8; i++) { // 3 batches (3/3/2 events)
        batcher.enqueue({ev: `queued event ${i}`});
      }

      batcher.flush();

      expect(batcher.sendRequest).to.have.been.calledOnce;
      sendResponse(200);
      // second request should follow immediately
      expect(batcher.sendRequest).to.have.been.calledTwice;
      sendResponse(200);
      expect(batcher.sendRequest).to.have.been.calledThrice; // forsooth

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
      clock.tick(DEFAULT_FLUSH_INTERVAL * 2);
      expect(batcher.sendRequest).to.have.been.calledThrice;
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

      expect(batcher.sendRequest.args[0][0]).to.deep.equal([{foo: `bar`}]);
      expect(batcher.sendRequest.args[1][0]).to.deep.equal([{foo2: `bar2`}]);
    });

    describe(`error handling`, function() {
      it(`retries with exponential backoff`, function() {
        batcher.enqueue({foo: `bar`});
        batcher.enqueue({foo2: `bar2`});
        batcher.flush();
        expect(batcher.sendRequest).to.have.been.calledOnce;
        sendResponse(500);

        clock.tick(DEFAULT_FLUSH_INTERVAL);
        // no new requests, items are still in queue
        expect(batcher.sendRequest).to.have.been.calledOnce;
        expect(batcher.queue.memQueue).to.have.lengthOf(2);
        expect(getLocalStorageItems()).to.have.lengthOf(2);

        clock.tick(DEFAULT_FLUSH_INTERVAL);
        // retry with same data
        expect(batcher.sendRequest).to.have.been.calledTwice;
        expect(batcher.sendRequest.args[1][0]).to.deep.equal(batcher.sendRequest.args[0][0]);

        // oh no, another explosion!
        sendResponse(503);
        clock.tick(DEFAULT_FLUSH_INTERVAL * 2);
        // no new requests, items are still in queue
        expect(batcher.sendRequest).to.have.been.calledTwice;
        expect(batcher.queue.memQueue).to.have.lengthOf(2);
        expect(getLocalStorageItems()).to.have.lengthOf(2);

        clock.tick(DEFAULT_FLUSH_INTERVAL * 2);
        // retry with same data
        expect(batcher.sendRequest).to.have.been.calledThrice;
        expect(batcher.sendRequest.args[2][0]).to.deep.equal(batcher.sendRequest.args[0][0]);

        // do it again, oh the humanity
        sendResponse(503);
        clock.tick(DEFAULT_FLUSH_INTERVAL * 4);
        // no new requests, items are still in queue
        expect(batcher.sendRequest).to.have.been.calledThrice;
        expect(batcher.queue.memQueue).to.have.lengthOf(2);
        expect(getLocalStorageItems()).to.have.lengthOf(2);

        clock.tick(DEFAULT_FLUSH_INTERVAL * 4);
        // retry with same data
        expect(batcher.sendRequest).to.have.callCount(4);
        expect(batcher.sendRequest.args[3][0]).to.deep.equal(batcher.sendRequest.args[0][0]);

        // will the madness ever end? finally the API call succeeds
        sendResponse(200);
        clock.tick(DEFAULT_FLUSH_INTERVAL * 100); // a long time
        expect(batcher.sendRequest).to.have.callCount(4); // no new requests
        expect(batcher.queue.memQueue).to.be.empty;
        expect(getLocalStorageItems()).to.be.empty;
      });

      it(`caps backoff at 10 minutes`, function() {
        batcher.enqueue({foo: `bar`});
        batcher.flush();

        let expectedRequests = 1;
        let tryAfter = DEFAULT_FLUSH_INTERVAL * 2;
        const TEN_MINUTES = 10 * 60 * 1000;
        while (tryAfter <= TEN_MINUTES) {
          expect(batcher.sendRequest).to.have.callCount(expectedRequests);
          sendResponse(503);

          clock.tick(tryAfter);
          tryAfter *= 2;
          expectedRequests++;
        }

        expect(batcher.sendRequest).to.have.callCount(expectedRequests);
        sendResponse(503);
        clock.tick(TEN_MINUTES - 1);
        expect(batcher.sendRequest).to.have.callCount(expectedRequests); // no new request
        clock.tick(1);
        expect(batcher.sendRequest).to.have.callCount(++expectedRequests);

        // do it again, exactly 10 minutes til next request
        expect(batcher.sendRequest).to.have.callCount(expectedRequests);
        sendResponse(503);
        clock.tick(TEN_MINUTES - 1);
        expect(batcher.sendRequest).to.have.callCount(expectedRequests); // no new request
        clock.tick(1);
        expect(batcher.sendRequest).to.have.callCount(++expectedRequests);
      });

      it(`resets flush interval when request succeeds after backoff`, function() {
        batcher.flush();
        batcher.enqueue({ev: `queued event 1`});
        batcher.enqueue({ev: `queued event 2`});

        // fail a couple times
        clock.tick(DEFAULT_FLUSH_INTERVAL);
        expect(batcher.sendRequest).to.have.been.calledOnce;
        sendResponse(503);
        clock.tick(DEFAULT_FLUSH_INTERVAL * 2);
        expect(batcher.sendRequest).to.have.been.calledTwice;
        sendResponse(503);

        // configuring default flush interval shouldn't affect anything during failure backoff
        libConfig.batch_flush_interval_ms = 8000;

        clock.tick(DEFAULT_FLUSH_INTERVAL * 4);
        expect(batcher.sendRequest).to.have.been.calledThrice;
        sendResponse(503);

        // succeed!
        clock.tick(DEFAULT_FLUSH_INTERVAL * 8);
        expect(batcher.sendRequest).to.have.callCount(4);
        sendResponse(200);

        // at this point the success response should have reset the interval to the 8000
        // configured above
        batcher.enqueue({ev: `queued event 3`});
        clock.tick(7000);
        expect(batcher.sendRequest).to.have.callCount(4); // no new request yet
        clock.tick(1000);
        expect(batcher.sendRequest).to.have.callCount(5);
      });

      it(`can queue up new events while failing requests are retrying`, function() {
        batcher.flush();
        batcher.enqueue({ev: `queued event 1`});
        batcher.enqueue({ev: `queued event 2`});

        // fail a couple times
        clock.tick(DEFAULT_FLUSH_INTERVAL);
        expect(batcher.sendRequest).to.have.been.calledOnce;
        sendResponse(503);
        clock.tick(DEFAULT_FLUSH_INTERVAL * 2);
        expect(batcher.sendRequest).to.have.been.calledTwice;
        sendResponse(503);

        batcher.enqueue({ev: `queued event 3`});

        clock.tick(DEFAULT_FLUSH_INTERVAL * 4);
        expect(batcher.sendRequest).to.have.callCount(3);

        // should include all events in current retry
        expect(batcher.sendRequest.args[2][0]).to.deep.equal([
          {ev: `queued event 1`},
          {ev: `queued event 2`},
          {ev: `queued event 3`},
        ]);
      });

      it(`does not retry 400s / successful API rejections`, function() {
        batcher.enqueue({ev: `queued event 1`});
        batcher.enqueue({ev: `queued event 2`});
        batcher.flush();

        expect(batcher.queue.memQueue).to.have.lengthOf(2);
        expect(getLocalStorageItems()).to.have.lengthOf(2);
        sendResponse(400);

        clock.tick(100000);
        expect(batcher.sendRequest).to.have.been.calledOnce; // no new request
        expect(batcher.queue.memQueue).to.be.empty;
        expect(getLocalStorageItems()).to.be.empty;
      });

      it(`does not retry ERR_BLOCKED_BY_CLIENT`, function() {
        batcher.enqueue({ev: `queued event 1`});
        batcher.enqueue({ev: `queued event 2`});
        batcher.flush();

        expect(batcher.queue.memQueue).to.have.lengthOf(2);
        expect(getLocalStorageItems()).to.have.lengthOf(2);
        sendResponse(0);

        clock.tick(100000);
        expect(batcher.sendRequest).to.have.been.calledOnce; // no new request
        expect(batcher.queue.memQueue).to.be.empty;
        expect(getLocalStorageItems()).to.be.empty;
      });

      it(`retries with backoff after 429`, function() {
        batcher.enqueue({foo: `bar`});
        batcher.enqueue({foo2: `bar2`});
        batcher.flush();
        expect(batcher.sendRequest).to.have.been.calledOnce;
        sendResponse(429);

        clock.tick(DEFAULT_FLUSH_INTERVAL);
        // no new requests, items are still in queue
        expect(batcher.sendRequest).to.have.been.calledOnce;
        expect(batcher.queue.memQueue).to.have.lengthOf(2);
        expect(getLocalStorageItems()).to.have.lengthOf(2);

        clock.tick(DEFAULT_FLUSH_INTERVAL);
        // retry with same data
        expect(batcher.sendRequest).to.have.been.calledTwice;
        expect(batcher.sendRequest.args[1][0]).to.deep.equal(batcher.sendRequest.args[0][0]);
      });

      it(`reduces batch size after 413 Payload Too Large`, function() {
        configureBatchSize(9); // nice odd number

        for (let i = 1; i <= 7; i++) {
          batcher.enqueue({ev: `queued event ${i}`});
        }
        batcher.flush();

        // should have tried to send all 7 items in one go
        expect(batcher.sendRequest.args[0][0]).to.have.lengthOf(7);

        sendResponse(413);
        clock.tick(DEFAULT_FLUSH_INTERVAL);
        expect(batcher.sendRequest).to.have.been.calledTwice; // no backoff
        // reduced batch size
        expect(batcher.sendRequest.args[1][0]).to.deep.equal([
          {ev: `queued event 1`},
          {ev: `queued event 2`},
          {ev: `queued event 3`},
          {ev: `queued event 4`},
        ]);

        sendResponse(200);
        clock.tick(DEFAULT_FLUSH_INTERVAL);
        expect(batcher.sendRequest).to.have.been.calledThrice;
        // remaining items from original batch
        expect(batcher.sendRequest.args[2][0]).to.deep.equal([
          {ev: `queued event 5`},
          {ev: `queued event 6`},
          {ev: `queued event 7`},
        ]);
      });

      it(`does not retry single item which produces 413 Payload Too Large`, function() {
        batcher.enqueue({ev: `bloated item`});
        batcher.flush();
        expect(batcher.sendRequest).to.have.been.calledOnce;
        sendResponse(413);
        clock.tick(240000);
        expect(batcher.sendRequest).to.have.been.calledOnce; // no new request

        // first item should have been dropped, and we resume normal batching
        batcher.enqueue({ev: `normal item 1`});
        batcher.enqueue({ev: `normal item 2`});
        clock.tick(DEFAULT_FLUSH_INTERVAL);
        expect(batcher.sendRequest).to.have.been.calledTwice;
        expect(batcher.sendRequest.args[1][0]).to.deep.equal([
          {ev: `normal item 1`},
          {ev: `normal item 2`},
        ]);
      });

      it(`respects Retry-After response header for one retry`, function() {
        batcher.enqueue({ev: `queued event 1`});
        batcher.enqueue({ev: `queued event 2`});
        batcher.flush();

        sendResponse(503, {retryAfter: `20`});
        clock.tick(10000);
        expect(batcher.sendRequest).to.have.been.calledOnce; // no retry yet
        clock.tick(10000);
        expect(batcher.sendRequest).to.have.been.calledTwice; // 20s have passed

        // after success, should reset to configured flush interval
        sendResponse(200);
        batcher.enqueue({ev: `queued event 3`});
        clock.tick(DEFAULT_FLUSH_INTERVAL);
        expect(batcher.sendRequest).to.have.been.calledThrice;
        expect(batcher.sendRequest.args[2][0]).to.deep.equal([
          {ev: `queued event 3`},
        ]);
      });

      it(`handles failures to remove items from queue and eventually stops batchers`, function() {
        batcher.stopAllBatching = sinon.spy();

        batcher.enqueue({foo: `bar`});
        batcher.flush();

        batcher.queue.storage = {
          getItem: localStorage.getItem.bind(localStorage),
          setItem: () => {
            throw new Error(`persistence failure`);
          },
        };

        expect(batcher.queue.memQueue).to.have.lengthOf(1);
        expect(getLocalStorageItems()).to.have.lengthOf(1);
        sendResponse(200);
        expect(batcher.queue.memQueue).to.be.empty;
        expect(getLocalStorageItems()).to.have.lengthOf(1);
        expect(batcher.consecutiveRemovalFailures).to.equal(1);

        // no immediate flush
        expect(batcher.sendRequest).to.have.been.calledOnce;

        // make the event orphaned so we try to send it again
        clock.tick(DEFAULT_FLUSH_INTERVAL * 3);
        expect(batcher.sendRequest).to.have.been.calledTwice;
        sendResponse(200);
        expect(batcher.consecutiveRemovalFailures).to.equal(2);

        // now it will try to send on every flush
        clock.tick(DEFAULT_FLUSH_INTERVAL);
        expect(batcher.sendRequest).to.have.callCount(3);
        sendResponse(200);
        expect(batcher.consecutiveRemovalFailures).to.equal(3);

        clock.tick(DEFAULT_FLUSH_INTERVAL);
        expect(batcher.sendRequest).to.have.callCount(4);
        sendResponse(200);
        expect(batcher.consecutiveRemovalFailures).to.equal(4);

        clock.tick(DEFAULT_FLUSH_INTERVAL);
        expect(batcher.sendRequest).to.have.callCount(5);
        sendResponse(200);
        expect(batcher.consecutiveRemovalFailures).to.equal(5);

        expect(batcher.stopAllBatching).not.to.have.been.called;
        clock.tick(DEFAULT_FLUSH_INTERVAL);
        expect(batcher.sendRequest).to.have.callCount(6);
        sendResponse(200);
        expect(batcher.consecutiveRemovalFailures).to.equal(6);
        expect(batcher.stopAllBatching).to.have.been.calledOnce;
      });

      context(`when request times out`, function() {
        function timeOutRequest() {
          sendResponse(0, {error: `timeout`});
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
          expect(batcher.sendRequest.args[1][0]).to.deep.equal([{foo: `bar`}]);
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
          expect(batcher.sendRequest.args[1][0]).to.deep.equal([{foo: `bar`}]);
        });
      });
    });
  });

  context(`before starting`, function() {
    it(`does not flush`, function() {
      batcher.enqueue({foo: `bar`});
      clock.tick(20000);
      expect(batcher.sendRequest).not.to.have.been.called;
    });

    it(`flushes immediately on start`, function() {
      batcher.enqueue({foo: `bar`});
      clock.tick(20000);
      batcher.start();
      expect(batcher.sendRequest).to.have.been.calledOnce;
      expect(batcher.sendRequest.args[0][0]).to.deep.equal([{foo: `bar`}]);
    });
  });

  context(`after starting`, function() {
    beforeEach(function() {
      batcher.start();
    });

    it(`does not send requests until flush interval`, function() {
      batcher.enqueue({first: `event`});
      expect(batcher.sendRequest).not.to.have.been.called;
      clock.tick(1000);
      expect(batcher.sendRequest).not.to.have.been.called;
      batcher.enqueue({second: `event`});
      expect(batcher.sendRequest).not.to.have.been.called;
      clock.tick(1000);
      expect(batcher.sendRequest).not.to.have.been.called;
      clock.tick(DEFAULT_FLUSH_INTERVAL);
      expect(batcher.sendRequest).to.have.been.calledOnce;
      expect(batcher.sendRequest.args[0][0]).to.deep.equal([
        {first: `event`}, {second: `event`},
      ]);
    });

    it(`still sends batched requests if localStorage gets cleared`, function() {
      batcher.enqueue({name: `storagetest 1`});
      batcher.enqueue({name: `storagetest 2`});
      expect(getLocalStorageItems().map(item => item.payload)).to.deep.equal([
        {name: `storagetest 1`},
        {name: `storagetest 2`},
      ]);

      // kill it
      localStorage.removeItem(LOCALSTORAGE_KEY);

      expect(batcher.sendRequest).not.to.have.been.called;
      clock.tick(DEFAULT_FLUSH_INTERVAL);
      expect(batcher.sendRequest).to.have.been.calledOnce;
      expect(batcher.sendRequest.args[0][0]).to.deep.equal([
        {name: `storagetest 1`},
        {name: `storagetest 2`},
      ]);
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
      const batchEvents = batcher.sendRequest.args[0][0];
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
      const batchEvents = batcher.sendRequest.args[0][0];
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
      const payload = batcher.sendRequest.args[0][0];
      expect(payload).to.have.lengthOf(1);
      expect(payload[0]).to.have.property(`event`, `orphaned event 1`);
      expect(payload[0]).to.have.nested.include({'properties.foo': `bar`});

      expect(getLocalStorageItems()).to.have.lengthOf(2);
      sendResponse(200);
      expect(getLocalStorageItems()).to.have.lengthOf(1);

      clock.tick(20000);
      expect(batcher.sendRequest).to.have.been.calledOnce; // no new request

      // second event becomes orphaned

      clock.tick(200000);
      expect(batcher.sendRequest).to.have.been.calledTwice;
      expect(batcher.sendRequest.args[1][0]).to.deep.equal([
        {'event': `orphaned event 2`},
      ]);

      expect(getLocalStorageItems()).to.have.lengthOf(1);
      sendResponse(200);
      expect(getLocalStorageItems()).to.be.empty;
    });

    it(`does not apply before-send hooks to orphaned items`, function() {
      batcher.beforeSendHook = item => mapValues(item, v => v.toUpperCase());

      localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify([
        {id: `fakeID1`, flushAfter: Date.now() - 60000, payload: {
            'event': `orphaned event 1`,
        }},
        {id: `fakeID2`, flushAfter: Date.now() - 240000, payload: {
            'event': `orphaned event 2`,
        }}
      ]));
      batcher.enqueue({Hello: `World`});
      batcher.enqueue({foo: `bar`});

      batcher.start();
      expect(batcher.sendRequest).to.have.been.calledOnce;
      expect(batcher.sendRequest.args[0][0]).to.deep.equal([
        {Hello: `WORLD`},
        {foo: `BAR`},
        {event: `orphaned event 1`}, // did not get uppercased
        {event: `orphaned event 2`},
      ]);
      expect(getLocalStorageItems()).to.have.lengthOf(4);
      sendResponse(200);
      expect(getLocalStorageItems()).to.be.empty;
    });

    it(`ignores and overwrites malformed localStorage entries`, function() {
      localStorage.setItem(LOCALSTORAGE_KEY, `just some garbage {{{`);
      batcher.start();
      expect(batcher.sendRequest).not.to.have.been.called;

      // should clear and overwrite garbage localStorage when enqueueing
      batcher.enqueue({foo: `bar`});
      batcher.enqueue({baz: `quux`});
      expect(getLocalStorageItems().map(item => item.payload)).to.deep.equal([
        {foo: `bar`},
        {baz: `quux`},
      ]);

      clock.tick(DEFAULT_FLUSH_INTERVAL);
      expect(batcher.sendRequest).to.have.been.calledOnce;
      expect(batcher.sendRequest.args[0][0]).to.deep.equal([
        {foo: `bar`},
        {baz: `quux`},
      ]);
    });

    it(`drops malformed individual items in the localStorage queue`, function() {
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

      batcher.start();
      expect(batcher.sendRequest).to.have.been.calledOnce;
      const payload = batcher.sendRequest.args[0][0];
      expect(payload).to.have.lengthOf(2);
      expect(payload[0]).to.have.property(`event`, `orphaned event 1`);
      expect(payload[0]).to.have.nested.include({'properties.foo': `bar`});
      expect(payload[1]).to.have.property(`event`, `orphaned event 2`);
      expect(payload[1]).not.to.have.property(`properties`);

      sendResponse(200);
      expect(getLocalStorageItems()).to.be.empty; // invalid item got cleared
    });
  });
});
