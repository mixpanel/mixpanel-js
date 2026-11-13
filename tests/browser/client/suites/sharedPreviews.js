/* global chai, sinon */
import {clearAllLibInstances, clearAllStorage, getIDBValue, untilDone, untilDoneAsync} from '../utils';
import {FLAGS_STORE_NAME, PERSISTED_VARIANTS_KEY_PREFIX} from '../../../../src/flags/flags-persistence';
import {Config} from '../../../../src/config';

const {expect} = chai;

export function sharedPreviewTests(mixpanel) {
  describe(`shared visual previews`, function() {
    this.timeout(10000);
    let originalUrl, fixture, fetchStub, token, events, response;
    const credential = `browser-preview-token`;

    function setPreviewUrl(enabled) {
      const url = new URL(window.location.href);
      if (enabled) {
        url.searchParams.set(`mp_preview_token`, credential);
      } else {
        url.searchParams.delete(`mp_preview_token`);
      }
      window.history.replaceState(null, ``, url);
    }

    function visualVariant(text, isPreview = true) {
      return {
        variant_key: isPreview ? `treatment` : `normal`,
        experiment_id: `visual-experiment`,
        is_experiment_active: !isPreview,
        is_preview: isPreview,
        variant_value: {$mp: {
          url: window.location.origin + window.location.pathname,
          visualChanges: text === null ? [] : [
            {type: `setText`, selector: `#shared-preview-fixture`, value: text},
          ],
        }},
      };
    }

    function exposures() {
      return events.filter(event => event.event === `$experiment_started`);
    }

    async function initialize() {
      await new Promise(resolve => mixpanel.init(token, {
        flags: {persistence: {variantLookupPolicy: `persistenceUntilNetworkSuccess`}},
        visual_experiments: true,
        debug: true,
        autocapture: false,
        track_pageview: false,
        batch_requests: false,
        record_sessions_percent: 0,
        api_host: window.location.origin,
        hooks: {before_send_events: event => { events.push(event); return event; }},
        loaded: resolve,
      }, `sharedPreview`));
      await mixpanel.sharedPreview.flags.when_ready();
      return mixpanel.sharedPreview;
    }

    beforeEach(async function() {
      await clearAllLibInstances(mixpanel);
      await clearAllStorage();
      originalUrl = window.location.href;
      token = `SHARED_PREVIEW_${Math.random()}`;
      events = [];
      fixture = document.createElement(`div`);
      fixture.id = `shared-preview-fixture`;
      fixture.textContent = `Original`;
      document.body.appendChild(fixture);
      setPreviewUrl(true);
      response = {flags: {
        visual: visualVariant(`Preview`),
        ordinary: {variant_key: `control`, variant_value: false, experiment_id: `ordinary-experiment`},
      }};
      fetchStub = sinon.stub(window, `fetch`).callsFake(url => Promise.resolve(new Response(
        JSON.stringify(String(url).includes(`/flags`) ? response : 1),
        {status: 200, headers: {'Content-Type': `application/json`}},
      )));
    });

    afterEach(async function() {
      if (mixpanel.sharedPreview) {
        // Reverting an editor preview preserves delivered experiments. Clear
        // those variants too, so a discarded instance cannot keep observing and
        // reapplying changes to the next test's fixture.
        response = {flags: {}};
        await mixpanel.sharedPreview.flags.load_flags();
        mixpanel.sharedPreview.experiments.revertVisualChanges();
        expect(fixture.textContent).to.equal(`Original`);
      }
      await clearAllLibInstances(mixpanel);
      sinon.restore();
      fixture.remove();
      window.history.replaceState(null, ``, originalUrl);
    });

    it(`renders a shared link without exposure or persisted preview assignments`, async function() {
      const sdk = await initialize();
      await untilDone(() => fixture.textContent === `Preview`);
      const requests = fetchStub.getCalls().filter(call => String(call.args[0]).includes(`/flags`));
      expect(requests).to.have.length(1);
      expect(new URL(requests[0].args[0]).searchParams.get(`mp_preview_token`)).to.equal(credential);
      expect(requests[0].args[1].referrerPolicy).to.equal(`no-referrer`);
      expect(sdk.SDK_VERSION).to.equal(Config.LIB_VERSION);
      expect(sdk.flags.get_variant_sync(`visual`).is_preview).to.equal(true);
      expect(exposures()).to.have.length(0);
      sdk.flags.get_variant_sync(`ordinary`);
      expect(exposures()).to.have.length(1);
      expect(exposures()[0].properties[`Experiment name`]).to.equal(`ordinary`);
      expect(JSON.stringify(events)).not.to.contain(credential);
      expect(exposures()[0].properties.$current_url).to.contain(`mp_preview_token=REDACTED`);
      expect(window.location.search).to.contain(credential);

      let stored;
      await untilDoneAsync(async () => {
        stored = await getIDBValue(FLAGS_STORE_NAME, PERSISTED_VARIANTS_KEY_PREFIX + token);
        return !!stored;
      });
      expect(stored.flagVariants).not.to.have.property(`visual`);
      expect(stored.flagVariants).to.have.property(`ordinary`);
    });

    it(`refreshes preview edits, reverts an empty control, and resumes normal delivery on exit`, async function() {
      const sdk = await initialize();
      await untilDone(() => fixture.textContent === `Preview`);
      response.flags.visual = visualVariant(`Updated preview`);
      await sdk.flags.load_flags();
      await untilDone(() => fixture.textContent === `Updated preview`);
      expect(new URL(fetchStub.lastCall.args[0]).searchParams.get(`mp_preview_token`)).to.equal(credential);
      response.flags.visual = visualVariant(null);
      response.flags.visual.variant_key = `control`;
      await sdk.flags.load_flags();
      await untilDone(() => fixture.textContent === `Original`);
      expect(exposures()).to.have.length(0);

      setPreviewUrl(false);
      response.flags.visual = visualVariant(`Normal variant`, false);
      await sdk.flags.load_flags();
      await untilDone(() => fixture.textContent === `Normal variant`);
      const requests = fetchStub.getCalls().filter(call => String(call.args[0]).includes(`/flags`));
      expect(new URL(requests[requests.length - 1].args[0]).searchParams.has(`mp_preview_token`)).to.equal(false);
      expect(exposures()).to.have.length(1);
      expect(exposures()[0].properties[`Experiment name`]).to.equal(`visual`);
    });

    for (const code of [`invalid_preview_token`, `preview_unavailable`, `unexpected-secret`]) {
      it(`falls back to normal flags and safely logs ${code}`, async function() {
        const warn = sinon.stub(window.console, `warn`);
        response = {
          flags: {visual: visualVariant(`Normal variant`, false)},
          preview_error: {code, token: credential},
        };
        await initialize();
        await untilDone(() => fixture.textContent === `Normal variant`);
        expect(exposures()).to.have.length(1);
        const diagnostic = warn.getCalls().map(call => call.args.join(` `)).join(`\n`);
        expect(diagnostic).to.contain(code === `unexpected-secret` ? `unknown_preview_error` : code);
        expect(diagnostic).not.to.contain(credential);
        expect(diagnostic).not.to.contain(`unexpected-secret`);
      });
    }
  });
}
