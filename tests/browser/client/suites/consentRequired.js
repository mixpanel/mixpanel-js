/* global chai, sinon */

const { expect } = chai;
import { clearAllLibInstances, clearLibInstance, clearAllStorage, getIDBValue, putIDBValue, randName, simulateMouseClick, untilDone, untilDoneAsync } from "../utils";
import { FLAGS_STORE_NAME, MIXPANEL_FLAGS_DB_NAME, PERSISTED_VARIANTS_KEY_PREFIX } from "../../../../src/flags/flags-persistence";
import { RECORDING_EVENTS_STORE_NAME, RECORDING_REGISTRY_STORE_NAME } from "../../../../src/recorder/idb-config";

// the modes that store and send nothing identifying before consent
const CONSENT_REQUIRED_MODES = [`require_consent`];

export function consentRequiredTests(mixpanel) {
  CONSENT_REQUIRED_MODES.forEach(mode => describe(`consent_mode: '${mode}'`, function() {
    let token, idbOpenSpy, xhrSendSpy, fetchSpy, beaconSpy;

    const REAL_CONFIG = {
      consent_mode: mode,
      opt_out_tracking_by_default: true,
      persistence: `localStorage`,
      autocapture: true,
      track_pageview: true,
      record_sessions_percent: 100,
      flags: true,
      lib_base_path: `./static/build/async-modules/`,
      debug: true,
    };

    function initConsentRequired(config, name = `test`) {
      return new Promise(resolve => {
        mixpanel.init(token, Object.assign({}, REAL_CONFIG, config, {loaded: resolve}), name);
      });
    }

    function storageKeysWithToken(storage) {
      return Object.keys(storage).filter(key => key.includes(token));
    }

    function cookiesWithToken() {
      return document.cookie.split(`;`).map(cookie => cookie.trim()).filter(cookie => cookie.includes(token));
    }

    function requestsWithToken() {
      const xhrBodies = xhrSendSpy.getCalls().map(call => String(call.args[0] || ``));
      const beaconBodies = beaconSpy ? beaconSpy.getCalls().map(call => String(call.args[1] || ``)) : [];
      const fetches = fetchSpy.getCalls().map(call => JSON.stringify(call.args));
      return xhrBodies.concat(beaconBodies, fetches)
        .map(body => decodeURIComponent(body.replace(/\+/g, ` `)))
        .filter(body => body.includes(token) || body.includes(btoa(token + `:`)));
    }

    beforeEach(async () => {
      token = randName();
      await clearAllStorage();
      idbOpenSpy = sinon.spy(window.indexedDB, `open`);
      xhrSendSpy = sinon.spy(window.XMLHttpRequest.prototype, `send`);
      fetchSpy = sinon.spy(window, `fetch`);
      beaconSpy = navigator.sendBeacon ? sinon.spy(navigator, `sendBeacon`) : null;
    });

    afterEach(async () => {
      sinon.restore();
      await clearAllLibInstances(mixpanel);
    });

    [`localStorage`, `cookie`].forEach(persistence => {
      it(`stores nothing and sends nothing before consent, with ${persistence} persistence`, async () => {
        await initConsentRequired({persistence});
        const button = document.createElement(`button`);
        document.body.appendChild(button);
        simulateMouseClick(button);
        mixpanel.test.track(`custom event`);
        mixpanel.test.people.set({name: `visitor`});
        await new Promise(resolve => setTimeout(resolve, 1000));
        button.remove();

        expect(storageKeysWithToken(localStorage)).to.deep.equal([]);
        expect(storageKeysWithToken(sessionStorage)).to.deep.equal([]);
        expect(cookiesWithToken()).to.deep.equal([]);
        // clearAllStorage() leaves the flags database behind, and opening it to remove this
        // instance's variants stores nothing; no other database may be touched at all
        const cleanedDbNames = [MIXPANEL_FLAGS_DB_NAME];
        const openedDbNames = idbOpenSpy.getCalls().map(call => call.args[0]);
        expect(openedDbNames.filter(name => !cleanedDbNames.includes(name))).to.deep.equal([]);
        expect(await getIDBValue(FLAGS_STORE_NAME, PERSISTED_VARIANTS_KEY_PREFIX + token)).to.equal(undefined);
        expect(requestsWithToken()).to.deep.equal([]);
        expect(mixpanel.test.get_distinct_id()).to.equal(undefined);
      });
    });

    it(`deletes identifiers the device was carrying before consent mode`, async () => {
      localStorage.setItem(`mp_${token}_mixpanel`, JSON.stringify({distinct_id: `$device:stale`, $device_id: `stale`}));
      localStorage.setItem(`__mpq_${token}_ev`, JSON.stringify([{id: `queued`, payload: {event: `before consent mode`}}]));
      sessionStorage.setItem(`mp_tab_id_test_${token}`, `$tab-stale`);
      const variantsKey = PERSISTED_VARIANTS_KEY_PREFIX + token;
      await putIDBValue(FLAGS_STORE_NAME, variantsKey, {flags: {stale: {variant_key: `on`}}});
      expect(await getIDBValue(FLAGS_STORE_NAME, variantsKey)).to.not.equal(undefined);

      await initConsentRequired();
      await new Promise(resolve => setTimeout(resolve, 1000));

      expect(await getIDBValue(FLAGS_STORE_NAME, variantsKey)).to.equal(undefined);
      expect(storageKeysWithToken(localStorage)).to.deep.equal([]);
      expect(storageKeysWithToken(sessionStorage)).to.deep.equal([]);
      expect(cookiesWithToken()).to.deep.equal([]);
      expect(requestsWithToken()).to.deep.equal([]);
      expect(mixpanel.test.get_distinct_id()).to.equal(undefined);
    });

    it(`keeps unsent replay from earlier pages on the device, unsent, before consent`, async () => {
      const replayKey = `__mprec_test_${token}_stale-replay`;
      await putIDBValue(RECORDING_EVENTS_STORE_NAME, replayKey, [{id: `queued`, payload: {type: 2}}]);
      await putIDBValue(RECORDING_REGISTRY_STORE_NAME, `$tab-stale`, {replayId: `stale-replay`, tabId: `$tab-stale`, maxExpires: 0});

      await initConsentRequired();
      await new Promise(resolve => setTimeout(resolve, 1000));

      expect(await getIDBValue(RECORDING_EVENTS_STORE_NAME, replayKey)).to.not.equal(undefined);
      expect(await getIDBValue(RECORDING_REGISTRY_STORE_NAME, `$tab-stale`)).to.not.equal(undefined);
      expect(requestsWithToken()).to.deep.equal([]);
    });

    [`localStorage`, `cookie`].forEach(persistence => {
      it(`keeps only the decision and sends nothing after a consented visitor withdraws, with ${persistence} persistence`, async () => {
        await initConsentRequired({persistence, batch_requests: true});
        mixpanel.test.opt_in_tracking();
        await untilDone(() => requestsWithToken().some(body => body.includes(`$opt_in`)));
        mixpanel.test.track(`queued before withdrawal`);

        mixpanel.test.opt_out_tracking();
        xhrSendSpy.resetHistory();
        fetchSpy.resetHistory();
        if (beaconSpy) {
          beaconSpy.resetHistory();
        }
        mixpanel.test.track(`after withdrawal`);
        await new Promise(resolve => setTimeout(resolve, 1000));

        const decisionKey = `__mp_opt_in_out_${token}`;
        if (persistence === `cookie`) {
          expect(storageKeysWithToken(localStorage)).to.deep.equal([]);
          expect(cookiesWithToken()).to.deep.equal([`${decisionKey}=0`]);
        } else {
          expect(storageKeysWithToken(localStorage)).to.deep.equal([decisionKey]);
          expect(cookiesWithToken()).to.deep.equal([]);
        }
        expect(storageKeysWithToken(sessionStorage)).to.deep.equal([]);
        expect(await getIDBValue(FLAGS_STORE_NAME, PERSISTED_VARIANTS_KEY_PREFIX + token)).to.equal(undefined);
        expect(requestsWithToken()).to.deep.equal([]);
      });
    });

    it(`stores an ID and sends $opt_in after opt-in`, async () => {
      await initConsentRequired();
      mixpanel.test.opt_in_tracking();

      const distinctId = mixpanel.test.get_distinct_id();
      expect(distinctId).to.match(/^\$device:/);
      const stored = JSON.parse(localStorage.getItem(`mp_${token}_mixpanel`));
      expect(stored.distinct_id).to.equal(distinctId);
      expect(localStorage.getItem(`__mp_opt_in_out_${token}`)).to.equal(`1`);
      await untilDone(() => requestsWithToken().some(body => body.includes(`$opt_in`) && body.includes(distinctId)));
    });

    it(`restarts batching and replay with the same ID when a visitor withdraws and opts in again on the page`, async () => {
      const isRecording = () => Object.keys(mixpanel.test.get_session_recording_properties()).length > 0;
      await initConsentRequired({batch_requests: true, batch_flush_interval_ms: 100});
      mixpanel.test.opt_in_tracking();
      await untilDone(isRecording);
      const distinctId = mixpanel.test.get_distinct_id();

      mixpanel.test.opt_out_tracking();
      await untilDone(() => !isRecording());

      mixpanel.test.opt_in_tracking();
      mixpanel.test.track(`after re-opt-in`);

      await untilDone(isRecording);
      await untilDone(() => requestsWithToken().some(body => body.includes(`after re-opt-in`) && body.includes(distinctId)));
      expect(mixpanel.test.get_distinct_id()).to.equal(distinctId);
      expect(localStorage.getItem(`__mp_opt_in_out_${token}`)).to.equal(`1`);
    });

    it(`keeps this tab's unsent replay on the device, unsent, after a withdrawal`, async () => {
      const isRecording = () => Object.keys(mixpanel.test.get_session_recording_properties()).length > 0;
      await initConsentRequired();
      mixpanel.test.opt_in_tracking();
      await untilDone(isRecording);
      const tabId = mixpanel.test.get_tab_id();
      await untilDoneAsync(async () => {
        if (await getIDBValue(RECORDING_REGISTRY_STORE_NAME, tabId) === undefined) {
          throw new Error(`replay not registered yet`);
        }
      });

      mixpanel.test.opt_out_tracking();
      xhrSendSpy.resetHistory();
      fetchSpy.resetHistory();
      if (beaconSpy) {
        beaconSpy.resetHistory();
      }
      await untilDone(() => !isRecording());
      await new Promise(resolve => setTimeout(resolve, 1000));

      expect(await getIDBValue(RECORDING_REGISTRY_STORE_NAME, tabId)).to.not.equal(undefined);
      expect(storageKeysWithToken(sessionStorage)).to.deep.equal([]);
      expect(requestsWithToken()).to.deep.equal([]);
    });

    it(`keeps blocking after a refusal, across page loads`, async () => {
      await initConsentRequired();
      mixpanel.test.opt_out_tracking();
      // a reload drops the instance but keeps the stored decision, so this teardown leaves it alone
      await clearLibInstance(mixpanel, mixpanel.test, false);
      xhrSendSpy.resetHistory();

      await initConsentRequired({}, `reloaded`);
      mixpanel.reloaded.track(`after refusal`);
      await new Promise(resolve => setTimeout(resolve, 500));

      expect(mixpanel.reloaded.has_opted_out_tracking()).to.equal(true);
      expect(requestsWithToken().filter(body => body.includes(`after refusal`))).to.deep.equal([]);
    });
  }));
}
