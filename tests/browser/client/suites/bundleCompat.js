/* global chai, sinon */

import { clearAllStorage, clearAllLibInstances, untilDone, resetRecorder, resetTargeting, getExternalLibraryScript, simulateMouseClick, getXhrRequestData} from "../utils";
import { RECORDER_GLOBAL_NAME, TARGETING_GLOBAL_NAME } from "../../../../src/config";

const expect = chai.expect;

/**
 * Tests that the recorder and targeting bundles load and function correctly
 * when pointed at different sources via recorder_src / targeting_src config options.
 *
 * Each bundle is tested with:
 *   1. The local legacy (non-hashed) build
 *   2. The currently deployed CDN bundle at cdn.mxpnl.com (backward compatibility)
 */
export function bundleCompatTests(mixpanel) {
  const IS_RECORDER_BUNDLED = Boolean(window[RECORDER_GLOBAL_NAME]);
  const IS_TARGETING_BUNDLED = Boolean(window[TARGETING_GLOBAL_NAME]);

  context(`bundle compatibility`, function() {
    // These tests only apply to builds that load bundles asynchronously via script tags.
    // Module builds have the recorder and targeting bundled inline, so there is no script to load.
    if (IS_RECORDER_BUNDLED || IS_TARGETING_BUNDLED) {
      return;
    }

    let token;
    let xhrRequests;
    let xhr;
    let fetchStub;
    let clock;

    beforeEach(async function() {
      token = `BUNDLE_COMPAT_${Math.random().toString(36).substring(7)}`;
      await clearAllLibInstances(mixpanel);
      await clearAllStorage();
      resetRecorder();
      resetTargeting();

      xhrRequests = [];
      xhr = sinon.useFakeXMLHttpRequest();
      xhr.onCreate = (req) => xhrRequests.push(req);

      fetchStub = sinon.stub(window, `fetch`);
      fetchStub.returns(Promise.resolve(new Response(JSON.stringify({code: 200, status: `OK`}), {
        status: 200,
        headers: { 'Content-type': `application/json` }
      })));

      clock = sinon.useFakeTimers({toFake: [
        `setTimeout`, `clearTimeout`, `setInterval`, `clearInterval`
      ]});
    });

    afterEach(async function() {
      if (mixpanel.bundletest) {
        await mixpanel.bundletest.stop_session_recording();
      }
      xhrRequests = [];
      sinon.restore();
      await clearAllLibInstances(mixpanel);
      resetRecorder();
      resetTargeting();
    });

    async function verifyRecorderBundle(recorderSrc) {
      // Init with the given recorder_src and start recording
      await new Promise((resolve) => {
        mixpanel.init(token, {
          debug: true,
          record_sessions_percent: 100,
          recorder_src: recorderSrc,
          loaded: resolve
        }, `bundletest`);
      });

      // Verify script tag points to the right source
      const recorderScript = () => getExternalLibraryScript(`mixpanel-recorder`);
      await untilDone(() => Boolean(recorderScript()), 10000);
      expect(recorderScript().src).to.contain(`mixpanel-recorder`);

      // Wait for script to finish loading
      await new Promise((resolve) => {
        if (window[RECORDER_GLOBAL_NAME]) {
          resolve();
        } else {
          recorderScript().addEventListener(`load`, resolve);
        }
      });

      // Wait for recording to produce a replay ID
      await untilDone(() => Object.keys(mixpanel.bundletest.get_session_recording_properties()).length > 0);
      const replayId = mixpanel.bundletest.get_session_recording_properties()[`$mp_replay_id`];
      expect(replayId).to.be.a(`string`);

      // Generate some recording data and verify it gets sent
      simulateMouseClick(document.body);
      await untilDone(() => {
        const recorder = mixpanel.bundletest.__get_recorder();
        return recorder && recorder.activeRecording;
      });
      await clock.tickAsync(500);
      await mixpanel.bundletest.__get_recorder().activeRecording.__enqueuePromise;

      await clock.tickAsync(10 * 1000);
      await untilDone(() => fetchStub.getCalls().length >= 1);

      // Verify recording payload was sent via fetch
      const recordCall = fetchStub.getCall(0);
      expect(recordCall.args[0]).to.match(/\/record\//);
      expect(recordCall.args[1].body.constructor).to.equal(Blob);

      // Track a mixpanel event and verify its payload includes the replay ID
      mixpanel.bundletest.track(`compat_test_event`, {test_prop: `hello`});

      await clock.tickAsync(10 * 1000);
      await untilDone(() => xhrRequests.some((req) => req.url && req.url.includes(`/track`)));

      const trackRequest = xhrRequests.find((req) => req.url && req.url.includes(`/track`));
      expect(trackRequest).to.exist;

      const trackedEvents = getXhrRequestData(trackRequest);
      const compatEvent = (Array.isArray(trackedEvents) ? trackedEvents : [trackedEvents])
        .find((e) => e.event === `compat_test_event`);
      expect(compatEvent).to.exist;
      expect(compatEvent.properties[`$mp_replay_id`]).to.equal(replayId);
    }

    async function verifyTargetingBundle(targetingSrc) {
      // Stub fetch to return a flags response with a pending first-time event
      // that requires property evaluation via the targeting bundle
      fetchStub.callsFake((url) => {
        if (url.includes(`/flags`)) {
          return Promise.resolve(new Response(JSON.stringify({
            flags: {
              'compat-test-flag': {
                variant_key: `control`,
                variant_value: false
              }
            },
            pending_first_time_events: [{
              flag_key: `compat-test-flag`,
              flag_id: 999,
              project_id: 456,
              first_time_event_hash: `compat123`,
              event_name: `compat_event`,
              property_filters: { '>': [{'var': `score`}, 50] },
              pending_variant: {
                variant_key: `treatment`,
                variant_value: true
              }
            }]
          }), {
            status: 200,
            headers: { 'Content-Type': `application/json` }
          }));
        }
        return new Promise(() => {});
      });

      // Init with the given targeting_src and flags enabled
      await new Promise((resolve) => {
        mixpanel.init(token, {
          debug: true,
          flags: true,
          targeting_src: targetingSrc,
          loaded: resolve
        }, `bundletest`);
      });

      // Wait for flags request to fire
      await untilDone(() => fetchStub.called, 5000);

      // Targeting should auto-load because the flag has property_filters
      await untilDone(() => window[TARGETING_GLOBAL_NAME], 10000);

      // Verify script tag points to the right source
      const script = getExternalLibraryScript(`mixpanel-targeting`);
      expect(script.src).to.contain(`mixpanel-targeting`);

      const library = await window[TARGETING_GLOBAL_NAME];
      expect(library).to.exist;
      expect(library.eventMatchesCriteria).to.be.a(`function`);

      // Initial flag value should be control
      expect(mixpanel.bundletest.flags.get_variant_value_sync(`compat-test-flag`)).to.equal(false);

      // Track an event that matches the property filter (score > 50)
      mixpanel.bundletest.track(`compat_event`, { score: 100 });

      // Wait for the flag to switch to treatment
      await untilDone(() => mixpanel.bundletest.flags.get_variant_value_sync(`compat-test-flag`) === true, 5000);
      expect(mixpanel.bundletest.flags.get_variant_value_sync(`compat-test-flag`)).to.equal(true);
    }

    const RECORDER_SOURCES = [
      {label: `local legacy build`, src: `./static/build/mixpanel-recorder.js`},
      {label: `local legacy minified build`, src: `./static/build/mixpanel-recorder.min.js`},
      {label: `cdn.mxpnl.com (backward compat)`, src: `https://cdn.mxpnl.com/libs/mixpanel-recorder.js`},
      {label: `cdn.mxpnl.com minified (backward compat)`, src: `https://cdn.mxpnl.com/libs/mixpanel-recorder.min.js`},
    ];

    const TARGETING_SOURCES = [
      {label: `local legacy build`, src: `./static/build/mixpanel-targeting.js`},
      {label: `local legacy minified build`, src: `./static/build/mixpanel-targeting.min.js`},
      {label: `cdn.mxpnl.com (backward compat)`, src: `https://cdn.mxpnl.com/libs/mixpanel-targeting.js`},
      {label: `cdn.mxpnl.com minified (backward compat)`, src: `https://cdn.mxpnl.com/libs/mixpanel-targeting.min.js`},
    ];

    describe(`recorder bundle`, function() {
      RECORDER_SOURCES.forEach(({label, src}) => {
        it(`loads and records using ${label}`, async function() {
          await verifyRecorderBundle(src);
        });
      });
    });

    describe(`targeting bundle`, function() {
      TARGETING_SOURCES.forEach(({label, src}) => {
        it(`loads and evaluates targeting using ${label}`, async function() {
          await verifyTargetingBundle(src);
        });
      });
    });
  });
}
