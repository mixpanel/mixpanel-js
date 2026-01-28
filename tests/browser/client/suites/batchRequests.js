/* global chai, sinon */

const { expect } = chai;
import { clearLibInstance, clearAllStorage, clearAllLibInstances, untilDone } from "../utils";

const BATCH_TOKEN = `FAKE_TOKEN_BATCHTEST`;
const LOCALSTORAGE_PREFIX = `__mpq_` + BATCH_TOKEN;
const LOCALSTORAGE_EVENTS_KEY = LOCALSTORAGE_PREFIX + `_ev`;

function initBatchLibInstance(mixpanel, options) {
  return new Promise((resolve) => {
    mixpanel.init(BATCH_TOKEN, {
      batch_requests: true,
      debug: true,
      ...(options || {}),
      error_reporter: console.error,
      loaded: () => {
        mixpanel.batchtest.clear_opt_in_out_tracking();
        resolve();
      },
    }, `batchtest`);
  });
}

function getRequestData(request, keyPath) {
  try {
    const data = JSON.parse(decodeURIComponent(request.requestBody.match(/data=([^&]+)/)[1]));
    (keyPath || []).forEach(function(key) {
      data = data[key];
    });
    return data;
  } catch (err) {
    console.error(err);
    return null;
  }
}

function getSendBeaconRequestData(sendBeaconSpy) {
  return sendBeaconSpy.args
    .map((args) => getRequestData({ requestBody: args[1] }))
    .filter((data) => data);
}

export function batchRequestsTests(mixpanel) {
  describe(`batch_requests`, function() {
    let clock, xhr, xhrRequests = [];

    beforeEach(async function() {
      await clearAllLibInstances(mixpanel);
      await clearAllStorage();

      clock = sinon.useFakeTimers({
        toFake: [`setTimeout`, `clearTimeout`, `setInterval`, `clearInterval`]
      });

      await initBatchLibInstance(mixpanel);
      xhr = sinon.useFakeXMLHttpRequest();
      xhr.onCreate = (req) => xhrRequests.push(req);
    });

    afterEach(async function() {
      xhrRequests = [];
      sinon.restore();
    });

    it(`does not send a request immediately`, async function() {
      mixpanel.batchtest.track(`queued event`, {});

      await clock.tickAsync(1000);
      expect(xhrRequests).to.have.length(0);

      await clock.tickAsync(5000);
      expect(xhrRequests).to.have.length(1);
    });

    it(`sends batched request after flush interval`, async function() {
      mixpanel.batchtest.track(`queued event 1`);
      mixpanel.batchtest.track(`queued event 2`);

      // default batch_flush_interval_ms is 5000
      await clock.tickAsync(7000);

      expect(xhrRequests).to.have.length(1);
      expect(xhrRequests[0].url).to.include(`/track/`);
      const tracked_events = getRequestData(xhrRequests[0]);
      expect(tracked_events).to.have.length(2);
      expect(tracked_events[0].event).to.equal(`queued event 1`);
      expect(tracked_events[1].event).to.equal(`queued event 2`);
    });

    it(`allows configuring flush interval`, async function() {
      // kill off existing instance which has already scheduled its first flush
      await clearLibInstance(mixpanel, mixpanel.batchtest);
      initBatchLibInstance(mixpanel, { batch_flush_interval_ms: 45000 });

      mixpanel.batchtest.track(`queued event`);

      await clock.tickAsync(7000);
      expect(xhrRequests).to.have.length(0);

      await clock.tickAsync(40000);
      expect(xhrRequests).to.have.length(1);
    });

    it(`continues batching after malformed track response`, async function() {
      mixpanel.batchtest.track(`queued event 1`);
      mixpanel.batchtest.track(`queued event 2`);

      await clock.tickAsync(5100);
      xhrRequests[0].respond(200, {}, `{"something":"malformed`);
      mixpanel.batchtest.track(`queued event 3`);

      await clock.tickAsync(5100);
      expect(xhrRequests).to.have.length(2);

      const batch2_events = getRequestData(xhrRequests[1]);
      expect(batch2_events).to.have.length(1);
      expect(batch2_events[0].event).to.equal(`queued event 3`);
    });

    it(`queues batched requests in localStorage`, async function() {
      mixpanel.batchtest.track(`storagetest 1`);
      mixpanel.batchtest.track(`storagetest 2`);

      await clock.tickAsync(2500);
      const stored_requests = JSON.parse(localStorage.getItem(LOCALSTORAGE_EVENTS_KEY));
      expect(stored_requests).to.have.length(2);
      expect(stored_requests[0].payload.event).to.equal(`storagetest 1`);
      expect(stored_requests[1].payload.event).to.equal(`storagetest 2`);
      expect(stored_requests[0].payload.properties.mp_lib).to.equal(`web`);
      expect(stored_requests[0].id).to.not.equal(stored_requests[1].id);
      expect(stored_requests[0].flushAfter).to.be.greaterThan(Date.now());
    });

    it(`clears requests from localStorage after network response`, async function() {
      mixpanel.batchtest.track(`storagetest 1`);
      mixpanel.batchtest.track(`storagetest 2`);

      await clock.tickAsync(5000);
      let stored_requests = JSON.parse(localStorage.getItem(LOCALSTORAGE_EVENTS_KEY));
      expect(stored_requests).to.have.length(2);

      xhrRequests[0].respond(200, {}, `1`);
      await clock.tickAsync(5000);

      stored_requests = JSON.parse(localStorage.getItem(LOCALSTORAGE_EVENTS_KEY));
      expect(stored_requests).to.have.length(0);

      // try again with '0' response
      mixpanel.batchtest.track(`storagetest 1`);
      await clock.tickAsync(1000);

      stored_requests = JSON.parse(localStorage.getItem(LOCALSTORAGE_EVENTS_KEY));
      expect(stored_requests).to.have.length(1);

      await clock.tickAsync(5000);
      xhrRequests[1].respond(400, {}, `0`);
      await clock.tickAsync(1000);

      stored_requests = JSON.parse(localStorage.getItem(LOCALSTORAGE_EVENTS_KEY));
      expect(stored_requests).to.have.length(0);
    });

    it(`does not clear requests from localStorage after 50x response`, async function() {
      mixpanel.batchtest.track(`storagetest 1`);
      mixpanel.batchtest.track(`storagetest 2`);

      await clock.tickAsync(1000);
      let stored_requests = JSON.parse(localStorage.getItem(LOCALSTORAGE_EVENTS_KEY));
      expect(stored_requests).to.have.length(2);

      await clock.tickAsync(5000);
      xhrRequests[0].respond(503, {}, `unavailable`);
      await clock.tickAsync(1000);

      stored_requests = JSON.parse(localStorage.getItem(LOCALSTORAGE_EVENTS_KEY));
      expect(stored_requests).to.have.length(2);

      await clock.tickAsync(10000);
      stored_requests = JSON.parse(localStorage.getItem(LOCALSTORAGE_EVENTS_KEY));
      expect(stored_requests).to.have.length(2);
    });

    it(`does not clear requests from localStorage when offline`, async function() {
      const onlineStub = sinon.stub(window.navigator, `onLine`).value(false);

      mixpanel.batchtest.track(`storagetest 1`);
      mixpanel.batchtest.track(`storagetest 2`);

      await clock.tickAsync(1000);
      let stored_requests = JSON.parse(localStorage.getItem(LOCALSTORAGE_EVENTS_KEY));
      expect(stored_requests).to.have.length(2);

      await clock.tickAsync(5000);
      xhrRequests[0].respond(0, {}, ``);

      await clock.tickAsync(1000);
      stored_requests = JSON.parse(localStorage.getItem(LOCALSTORAGE_EVENTS_KEY));
      expect(stored_requests).to.have.length(2);

      await clock.tickAsync(10000);
      stored_requests = JSON.parse(localStorage.getItem(LOCALSTORAGE_EVENTS_KEY));
      expect(stored_requests).to.have.length(2);

      onlineStub.restore();
    });

    it(`sends orphaned localStorage data on init`, async function() {
      await clearLibInstance(mixpanel, mixpanel.batchtest);
      await clock.tickAsync(1000);
      localStorage.setItem(LOCALSTORAGE_EVENTS_KEY, JSON.stringify([
        { id: `fakeID1`, flushAfter: Date.now() - 60000, payload: { event: `orphaned event 1`, properties: { foo: `bar` } } },
        { id: `fakeID2`, flushAfter: Date.now() - 240000, payload: { event: `orphaned event 2` } }
      ]));

      expect(JSON.parse(localStorage.getItem(LOCALSTORAGE_EVENTS_KEY))).to.have.length(2);

      await initBatchLibInstance(mixpanel);
      await clock.tickAsync(1000);

      expect(xhrRequests).to.have.length(1);
      const batch_events = getRequestData(xhrRequests[0]);
      expect(batch_events).to.have.length(2);
      expect(batch_events[0].event).to.equal(`orphaned event 1`);
      expect(batch_events[1].event).to.equal(`orphaned event 2`);

      xhrRequests[0].respond(200, {}, `1`);
      await clock.tickAsync(1000);

      expect(JSON.parse(localStorage.getItem(LOCALSTORAGE_EVENTS_KEY))).to.have.length(0);
    });

    it(`invokes track callback when item is successfully enqueued`, async function() {
      const trackCallback = sinon.spy();
      mixpanel.batchtest.track(`callback test 1`, {}, trackCallback);

      await clock.tickAsync(10);

      expect(trackCallback.calledOnce).to.be.true;
      const [response, data] = trackCallback.getCall(0).args;
      expect(response).to.equal(1);
      expect(data.event).to.equal(`callback test 1`);
    });

    it(`sends immediate track request when localStorage enqueue fails`, async function() {
      sinon.stub(Storage.prototype, `setItem`).throws(`localStorage disabled`);

      mixpanel.batchtest.track(`failure event`);
      await clock.tickAsync(1000);

      expect(xhrRequests).to.have.length(1);
      const request_data = getRequestData(xhrRequests[0]);
      expect(request_data.event).to.equal(`failure event`);

      await clock.tickAsync(30000);
      expect(xhrRequests).to.have.length(1);

      Storage.prototype.setItem.restore();
    });

    it(`send_immediately track option bypasses queue`, async function() {
      mixpanel.batchtest.track(`immediate event`, {}, { send_immediately: true });

      expect(xhrRequests).to.have.length(1);
      const request_data = getRequestData(xhrRequests[0]);
      expect(request_data.event).to.equal(`immediate event`);

      expect(localStorage.getItem(LOCALSTORAGE_EVENTS_KEY)).to.be.null;

      await clock.tickAsync(30000);
      expect(xhrRequests).to.have.length(1);
    });


    it(`cancels queued requests when opt-out is called`, async function() {
      mixpanel.batchtest.track(`pre-opt-out event 1`);
      mixpanel.batchtest.track(`pre-opt-out event 2`);

      await clock.tickAsync(1000);

      mixpanel.batchtest.opt_out_tracking();
      mixpanel.batchtest.track(`post-opt-out event`);
      await clock.tickAsync(240000);

      expect(localStorage.getItem(LOCALSTORAGE_EVENTS_KEY)).to.be.null;
      expect(xhrRequests).to.have.length(0);
    });

    it(`invokes success callback when opt-out is called after request is sent`, async function() {
      mixpanel.batchtest.track(`pre-opt-out event 1`);
      mixpanel.batchtest.track(`pre-opt-out event 2`);

      await clock.tickAsync(5000);

      expect(xhrRequests).to.have.length(1);
      mixpanel.batchtest.opt_out_tracking();
      mixpanel.batchtest.track(`post-opt-out event`);
      xhrRequests[0].respond(200, {}, `1`);
      await clock.tickAsync(100);

      const stored_requests = JSON.parse(localStorage.getItem(LOCALSTORAGE_EVENTS_KEY));
      expect(stored_requests).to.have.length(0);

      await clock.tickAsync(240000);
      expect(xhrRequests).to.have.length(1);
    });

    it(`handles opt-out after request has been sent`, async function() {
      mixpanel.batchtest.track(`pre-opt-out event 1`);
      mixpanel.batchtest.track(`pre-opt-out event 2`);

      await clock.tickAsync(5000);

      expect(xhrRequests).to.have.length(1);
      mixpanel.batchtest.opt_out_tracking();

      await clock.tickAsync(100000); // let 90s network timeout elapse
      xhrRequests[0].triggerTimeout();
      await clock.tickAsync(240000);

      expect(xhrRequests).to.have.length(1);
    });

    it(`resumes batching upon opt-in`, async function() {
      mixpanel.batchtest.track(`pre-opt-out event 1`);
      mixpanel.batchtest.track(`pre-opt-out event 2`);

      await clock.tickAsync(1000);

      mixpanel.batchtest.opt_out_tracking();
      await clock.tickAsync(100);

      mixpanel.batchtest.track(`post-opt-out event`);
      await clock.tickAsync(5000);

      expect(xhrRequests).to.have.length(0);

      mixpanel.batchtest.opt_in_tracking();
      await clock.tickAsync(100);

      expect(xhrRequests).to.have.length(1);

      mixpanel.batchtest.track(`post-opt-in event 1`);
      mixpanel.batchtest.track(`post-opt-in event 2`);
      await clock.tickAsync(5000);

      expect(xhrRequests).to.have.length(2);

      const batch_events = getRequestData(xhrRequests[1]);
      expect(batch_events).to.have.length(2);
      expect(batch_events[0].event).to.equal(`post-opt-in event 1`);
      expect(batch_events[1].event).to.equal(`post-opt-in event 2`);

      xhrRequests[1].respond(200, {}, `1`);
      await clock.tickAsync(240000);

      expect(xhrRequests).to.have.length(2);
    });

    it(`does not send requests until explicit start with batch_autostart=false`, async function() {
      await clearLibInstance(mixpanel, mixpanel.batchtest);

      await clock.tickAsync(1000);

      await initBatchLibInstance(mixpanel, { batch_autostart: false });
      await clock.tickAsync(1000);

      mixpanel.batchtest.track(`pre-start event 1`);
      mixpanel.batchtest.track(`pre-start event 2`);

      await clock.tickAsync(10000);

      expect(xhrRequests).to.have.length(0);

      mixpanel.batchtest.start_batch_senders();
      await clock.tickAsync(1000);

      expect(xhrRequests).to.have.length(1);

      let batch_events = getRequestData(xhrRequests[0]);
      expect(batch_events[0].event).to.equal(`pre-start event 1`);
      expect(batch_events[1].event).to.equal(`pre-start event 2`);

      xhrRequests[0].respond(200, {}, `1`);
      mixpanel.batchtest.track(`post-start event`);
      await clock.tickAsync(5000);

      expect(xhrRequests).to.have.length(2);

      batch_events = getRequestData(xhrRequests[1]);
      expect(batch_events[0].event).to.equal(`post-start event`);
    });

    it(`sends orphaned localStorage data after explicit start with batch_autostart=false`, async function() {
      await clearLibInstance(mixpanel, mixpanel.batchtest);

      await clock.tickAsync(1000);

      localStorage.setItem(LOCALSTORAGE_EVENTS_KEY, JSON.stringify([
        { id: `fakeID1`, flushAfter: Date.now() - 60000, payload: { event: `orphaned event 1`, properties: { foo: `bar` } } },
        { id: `fakeID2`, flushAfter: Date.now() - 240000, payload: { event: `orphaned event 2` } }
      ]));

      await initBatchLibInstance(mixpanel, { batch_autostart: false });
      await clock.tickAsync(1000);

      expect(xhrRequests).to.have.length(0);

      mixpanel.batchtest.start_batch_senders();
      await clock.tickAsync(1000);

      expect(xhrRequests).to.have.length(1);

      const batch_events = getRequestData(xhrRequests[0]);
      expect(batch_events).to.have.length(2);
      expect(batch_events[0].event).to.equal(`orphaned event 1`);
      expect(batch_events[1].event).to.equal(`orphaned event 2`);
    });

    it(`applies before_send_events hook retroactively to batched but not orphaned events`, async function() {
      await clearLibInstance(mixpanel, mixpanel.batchtest);

      await clock.tickAsync(1000);

      localStorage.setItem(LOCALSTORAGE_EVENTS_KEY, JSON.stringify([
        { id: `fakeID1`, flushAfter: Date.now() - 60000, payload: { event: `orphaned event 1`, properties: { foo: `bar` } } },
        { id: `fakeID2`, flushAfter: Date.now() - 240000, payload: { event: `orphaned event 2` } }
      ]));

      await initBatchLibInstance(mixpanel, {
        batch_autostart: false,
        hooks: {
          before_send_events: (event_data) => {
            return { ...event_data, event: event_data.event.toUpperCase() };
          }
        }
      });

      mixpanel.batchtest.track(`Non-orphaned event`, { hello: `world` });
      await clock.tickAsync(1000);

      mixpanel.batchtest.start_batch_senders();
      await clock.tickAsync(1000);

      expect(xhrRequests).to.have.length(1);

      let batch_events = getRequestData(xhrRequests[0]);
      expect(batch_events).to.have.length(3);
      expect(batch_events[0].event).to.equal(`NON-ORPHANED EVENT`);
      expect(batch_events[0].properties.hello).to.equal(`world`);
      expect(batch_events[1].event).to.equal(`orphaned event 1`);
      expect(batch_events[2].event).to.equal(`orphaned event 2`);

      xhrRequests[0].respond(200, {}, `1`);
      mixpanel.batchtest.track(`post-start event`);
      await clock.tickAsync(5000);

      batch_events = getRequestData(xhrRequests[1]);
      expect(batch_events[0].event).to.equal(`POST-START EVENT`);
    });

    it(`drops queued events when before_send_events hook returns null`, async function() {
      mixpanel.batchtest.set_config({
        hooks: {
          before_send_events: (event_data) => {
            return event_data.event === `dropme` ? null : event_data;
          }
        }
      });

      mixpanel.batchtest.track(`dropme`, { hello: `world` });
      mixpanel.batchtest.track(`track me 1`);
      mixpanel.batchtest.track(`dropme`);
      mixpanel.batchtest.track(`track me 2`);

      await clock.tickAsync(5000);

      expect(xhrRequests).to.have.length(1);

      const batch_events = getRequestData(xhrRequests[0]);
      expect(batch_events).to.have.length(2);

      const eventNames = batch_events.map((event) => event.event).sort();
      expect(eventNames[0]).to.equal(`track me 1`);
      expect(eventNames[1]).to.equal(`track me 2`);
    });

    context(`people updates`, function() {
      this.retries(3);

      beforeEach(async function() {
        // In _loaded(), people.set_once() for referrer runs AFTER the loaded callback resolves.
        // This writes to persistence.props['__mpso'] and saves to cookie. When identify() is
        // called, it reads queued data via load_prop() which re-reads from the cookie. In Safari,
        // there seems to be a race where the cookie write isn't immediately readable, causing identify()
        // to miss the queued $set_once data. We wait for the in-memory props to be populated
        // before proceeding, ensuring the data is ready regardless of timing.
        await untilDone(() => {
          const queue = mixpanel.batchtest.persistence.props[`__mpso`];
          return queue && queue[`$initial_referrer`] !== undefined;
        });
      });

      it(`does not send people updates immediately`, async function() {
        mixpanel.batchtest.identify(`pat`);
        mixpanel.batchtest.people.set(`foo`, `bar`);

        await clock.tickAsync(100);

        expect(xhrRequests).to.have.length(0);
      });

      it(`sends people updates after flush interval`, async function() {
        mixpanel.batchtest.identify(`pat`);
        await clock.tickAsync(100);

        mixpanel.batchtest.people.set(`foo`, `bar`);
        mixpanel.batchtest.people.increment(`llamas`);
        await clock.tickAsync(7000); // default batch_flush_interval_ms is 5000

        const engage_request = xhrRequests.find((req) => req.url.includes(`/engage/`));
        expect(engage_request).to.exist;

        const people_updates = getRequestData(engage_request);
        expect(people_updates).to.have.length(3);
        expect(people_updates[0].$set_once).to.have.property(`$initial_referrer`);
        expect(people_updates[0].$set_once).to.have.property(`$initial_referring_domain`);
        expect(people_updates[1].$set).to.deep.include({ foo: `bar` });
        expect(people_updates[2].$add).to.deep.include({ llamas: 1 });
        expect(people_updates[0].$distinct_id).to.equal(`pat`);
        expect(people_updates[1].$distinct_id).to.equal(`pat`);
        expect(people_updates[2].$distinct_id).to.equal(`pat`);
      });
    });

    context(`group updates`, function() {
      it(`does not send group updates immediately`, async function() {
        mixpanel.batchtest.get_group(`font`, `Times`).set(`serif`, true);

        await clock.tickAsync(100);

        expect(xhrRequests).to.have.length(0);
      });

      it(`sends group updates after flush interval`, async function () {
        mixpanel.batchtest.get_group(`font`, `Times`).set(`serif`, true);
        mixpanel.batchtest.get_group(`font`, `Comic Sans`).delete();

        // default batch_flush_interval_ms is 5000
        await clock.tickAsync(7000);

        expect(xhrRequests).to.have.length(1);

        const group_updates = getRequestData(xhrRequests[0]);
        expect(group_updates).to.have.length(2);

        expect(group_updates[0]).to.deep.include({
          $group_key: `font`,
          $group_id: `Times`
        });
        expect(group_updates[0].$set).to.deep.include({ serif: true });

        expect(group_updates[1]).to.deep.include({
          $group_key: `font`,
          $group_id: `Comic Sans`,
          $delete: ``
        });
      });
    });

    context(`sendBeacon transport`, function() {
      if (!navigator.sendBeacon) {
        console.warn(`navigator.sendBeacon not supported in this browser; skipping sendBeacon transport tests`);
        return;
      }

      let sendBeaconSpy;

      beforeEach(function() {
        if (navigator.sendBeacon) {
          sendBeaconSpy = sinon.stub(navigator, `sendBeacon`).returns(true);
        }
      });

      afterEach(function() {
        if (sendBeaconSpy) {
          sendBeaconSpy.restore();
        }
      });

      it(`flushes queued requests via sendBeacon on pagehide event`, async function() {
        mixpanel.batchtest.track(`queued event`);

        await clock.tickAsync(50);

        const event = new Event(`pagehide`);
        Object.defineProperty(event, `persisted`, { value: `true`, writable: true });
        window.dispatchEvent(event);

        await clock.tickAsync(50);

        expect(sendBeaconSpy.called).to.be.true;
        const request_data = getSendBeaconRequestData(sendBeaconSpy)[0];
        expect(request_data).to.have.length(1);
        expect(request_data[0].event).to.equal(`queued event`);
      });

      it(`flushes queued requests via sendBeacon on visibilitychange event`, async function() {
        mixpanel.batchtest.track(`queued event`);

        await clock.tickAsync(50);

        Object.defineProperty(document, `visibilityState`, { value: `hidden`, writable: true });
        Object.defineProperty(document, `hidden`, { value: true, writable: true });
        window.dispatchEvent(new Event(`visibilitychange`));

        await clock.tickAsync(50);

        expect(sendBeaconSpy.called).to.be.true;
        const request_data = getSendBeaconRequestData(sendBeaconSpy)[0];
        expect(request_data).to.have.length(1);
        expect(request_data[0].event).to.equal(`queued event`);
      });

      it(`handles batch/flush cycle in sendBeacon mode`, async function() {
        mixpanel.batchtest.set_config({ api_transport: `sendBeacon` });

        mixpanel.batchtest.track(`queued event 1`);
        mixpanel.batchtest.track(`queued event 2`);

        await clock.tickAsync(1000);
        expect(sendBeaconSpy.called).to.be.false;

        await clock.tickAsync(5000);
        expect(sendBeaconSpy.calledOnce).to.be.true;

        let request_data = getSendBeaconRequestData(sendBeaconSpy)[0];
        expect(request_data).to.have.length(2);
        expect(request_data[0].event).to.equal(`queued event 1`);
        expect(request_data[1].event).to.equal(`queued event 2`);

        mixpanel.batchtest.track(`queued event 3`);

        await clock.tickAsync(1000);
        expect(sendBeaconSpy.calledOnce).to.be.true;

        await clock.tickAsync(5000);
        expect(sendBeaconSpy.calledTwice).to.be.true;

        request_data = getSendBeaconRequestData(sendBeaconSpy)[1];
        expect(request_data[0].event).to.equal(`queued event 3`);
      });

      it(`applies before_send hooks to events flushed via sendBeacon on pagehide`, async function() {
        mixpanel.batchtest.set_config({
          hooks: {
            before_send_events: (event_data) => {
              event_data.event += ` (transformed)`;
              return event_data;
            }
          }
        });

        mixpanel.batchtest.track(`queued event`);

        await clock.tickAsync(1000);

        let stored_requests = JSON.parse(localStorage.getItem(LOCALSTORAGE_EVENTS_KEY));
        expect(stored_requests).to.have.length(1);

        const event = new Event(`pagehide`);
        Object.defineProperty(event, `persisted`, { value: `true`, writable: true });
        window.dispatchEvent(event);

        await clock.tickAsync(100);

        expect(sendBeaconSpy.called).to.be.true;
        const request_data = getSendBeaconRequestData(sendBeaconSpy)[0];
        expect(request_data).to.have.length(1);
        expect(request_data[0].event).to.equal(`queued event (transformed)`);

        stored_requests = JSON.parse(localStorage.getItem(LOCALSTORAGE_EVENTS_KEY));
        expect(stored_requests).to.have.length(1);
        expect(stored_requests[0].payload.event).to.equal(`queued event (transformed)`);
      });

      it(`applies before_send hooks to events flushed via sendBeacon on visibilitychange`, async function() {
        mixpanel.batchtest.set_config({
          hooks: {
            before_send_events: (event_data) => {
              event_data.event += ` (transformed)`;
              return event_data;
            }
          }
        });

        mixpanel.batchtest.track(`queued event`);

        await clock.tickAsync(100);

        let stored_requests = JSON.parse(localStorage.getItem(LOCALSTORAGE_EVENTS_KEY));
        expect(stored_requests).to.have.length(1);

        Object.defineProperty(document, `visibilityState`, { value: `hidden`, writable: true });
        Object.defineProperty(document, `hidden`, { value: true, writable: true });
        window.dispatchEvent(new Event(`visibilitychange`));

        await clock.tickAsync(100);

        expect(sendBeaconSpy.called).to.be.true;
        const request_data = getSendBeaconRequestData(sendBeaconSpy)[0];
        expect(request_data).to.have.length(1);
        expect(request_data[0].event).to.equal(`queued event (transformed)`);

        stored_requests = JSON.parse(localStorage.getItem(LOCALSTORAGE_EVENTS_KEY));
        expect(stored_requests).to.have.length(1);
        expect(stored_requests[0].payload.event).to.equal(`queued event (transformed)`);
      });
    });
  });
}
