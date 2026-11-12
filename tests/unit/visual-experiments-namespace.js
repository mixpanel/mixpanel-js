import { expect } from 'chai';
import sinon from 'sinon';
import jsdom from 'jsdom-global';

// Exercises the public mixpanel.experiments namespace the extension drives during
// authoring, on a real MixpanelLib instance in jsdom. The extension holds a
// reference to this instance (via the $mp_sdk_to_extension_event dispatched in
// create_mplib) and calls these methods directly — there is no in-SDK postMessage
// listener.
describe(`Visual experiments mixpanel.experiments namespace`, function () {
  let mixpanel;
  let teardown;

  // Fully reset the SDK module graph so it binds to the current jsdom
  // window/document (mirrors tests/unit/loader-import.js).
  const loadFreshMixpanel = () => {
    Object.keys(require.cache).forEach((key) => {
      if (key.includes(`/src/`)) {
        delete require.cache[key];
      }
    });
    return require(`../../src/loaders/loader-module`).default;
  };

  beforeEach(function () {
    this.timeout(5000);
    // pretendToBeVisual gives jsdom requestAnimationFrame, which the visual-change
    // engine requires (see the engine's minApisSupported).
    teardown = jsdom(``, { url: `http://localhost/pricing`, pretendToBeVisual: true });
  });

  afterEach(function () {
    // Clear the anti-flicker failsafe timer and disconnect the engine's observer
    // before the jsdom window is torn down.
    if (mixpanel) {
      if (mixpanel.visualExperiments._navTeardown) {
        mixpanel.visualExperiments._navTeardown();
      }
      if (mixpanel.visualExperiments._engine) {
        mixpanel.visualExperiments._engine.revertVisualChanges();
      }
      if (mixpanel.visualExperiments._antiFlicker) {
        mixpanel.visualExperiments._antiFlicker.reveal();
      }
    }
    mixpanel = null;
    teardown();
    sinon.restore();
  });

  it(`is undefined when visual_experiments is not enabled`, function () {
    mixpanel = loadFreshMixpanel();
    mixpanel.init(`test-token`, { batch_requests: false });
    expect(mixpanel.experiments).to.be.undefined;
  });

  [true, false, undefined].forEach((enabled) => {
    it(`tracks fetched controls only when visual_experiments is enabled (${enabled})`, async function () {
      global.window.fetch = sinon.stub().resolves({
        json: sinon.stub().resolves({
          flags: {
            controlExperiment: {
              variant_key: `control`,
              variant_value: { $mp: { url: `http://localhost/pricing`, visualChanges: [] } },
              experiment_id: `exp1`,
            },
          },
        }),
      });
      mixpanel = loadFreshMixpanel();
      const config = { flags: true, batch_requests: false };
      if (enabled !== undefined) {
        config.visual_experiments = enabled;
      }
      mixpanel.init(`test-token`, config);
      const trackSpy = sinon.stub(mixpanel.flags, `track`);

      await mixpanel.flags.persistenceLoadedPromise;
      await mixpanel.flags.whenReady();

      expect(mixpanel.flags.getAllVariantsSync().get(`controlExperiment`).key).to.equal(`control`);
      expect(trackSpy.callCount).to.equal(enabled ? 1 : 0);
      if (enabled) {
        expect(trackSpy.firstCall.args[0]).to.equal(`$experiment_started`);
        expect(trackSpy.firstCall.args[1][`$experiment_type`]).to.equal(`visual`);
      }
    });
  });

  it(`exposes the four contract methods when visual_experiments is enabled`, function () {
    mixpanel = loadFreshMixpanel();
    mixpanel.init(`test-token`, { visual_experiments: true, batch_requests: false });
    expect(mixpanel.experiments).to.be.an(`object`);
    expect(mixpanel.experiments.applyVisualChanges).to.be.a(`function`);
    expect(mixpanel.experiments.revertVisualChanges).to.be.a(`function`);
    expect(mixpanel.experiments.startEditorSession).to.be.a(`function`);
    expect(mixpanel.experiments.endEditorSession).to.be.a(`function`);
  });

  [true, { persistence: { variantLookupPolicy: `networkOnly` } }].forEach((flags) => {
    it(`fetches and applies visual variants with flags configured as ${JSON.stringify(flags)}`, async function () {
      document.body.innerHTML = `<button class="cta">Original</button>`;
      const fetchStub = global.window.fetch = sinon.stub().resolves({
        json: sinon.stub().resolves({ flags: {
          visual: {
            variant_key: `treatment`,
            variant_value: { $mp: {
              url: `http://localhost/pricing`,
              visualChanges: [{ type: `setText`, selector: `.cta`, value: `Treatment` }],
            } },
          },
        } }),
      });
      mixpanel = loadFreshMixpanel();
      mixpanel.init(`test-token`, { flags, visual_experiments: true, batch_requests: false });
      await mixpanel.flags.persistenceLoadedPromise;
      await mixpanel.flags.whenReady();

      expect(fetchStub.calledOnce).to.be.true;
      expect(document.querySelector(`.cta`).textContent).to.equal(`Treatment`);
      expect(document.documentElement.classList.contains(`mp-antiflicker-hide`)).to.be.false;
    });
  });

  [false, undefined].forEach((flags) => {
    it(`supports local authoring without fetching when flags is ${flags}`, async function () {
      const fetchStub = global.window.fetch = sinon.stub();
      mixpanel = loadFreshMixpanel();
      const { FeatureFlagManager: FreshFlagManager } = require(`../../src/flags`);
      const initSpy = sinon.spy(FreshFlagManager.prototype, `init`);
      const config = { visual_experiments: true, batch_requests: false };
      if (flags !== undefined) {
        config.flags = flags;
      }
      mixpanel.init(`test-token`, config);
      await initSpy.firstCall.returnValue;

      expect(fetchStub.called).to.be.false;
      document.body.innerHTML = `<button class="cta">Original</button>`;
      mixpanel.experiments.applyVisualChanges([
        { type: `setText`, selector: `.cta`, value: `Editor preview` },
      ]);
      expect(document.querySelector(`.cta`).textContent).to.equal(`Editor preview`);
      expect(document.documentElement.classList.contains(`mp-antiflicker-hide`)).to.be.false;
    });
  });

  [
    { name: `flag fetching is disabled`, flags: false },
    { name: `delivery contains no variants`, flags: true },
    { name: `the flags request fails`, flags: true, fails: true },
  ].forEach(({ name, flags, fails }) => {
    it(`reveals the page after initialization when ${name}`, async function () {
      const fetchStub = sinon.stub();
      if (fails) {
        fetchStub.rejects(new Error(`Flags unavailable`));
      } else {
        fetchStub.resolves({ json: sinon.stub().resolves({ flags: {} }) });
      }
      global.window.fetch = fetchStub;
      mixpanel = loadFreshMixpanel();
      const { FeatureFlagManager: FreshFlagManager } = require(`../../src/flags`);
      const initSpy = sinon.spy(FreshFlagManager.prototype, `init`);

      mixpanel.init(`test-token`, {
        flags,
        visual_experiments: true,
        visual_experiments_hide_timeout_ms: 60000,
        batch_requests: false,
      });
      expect(document.documentElement.classList.contains(`mp-antiflicker-hide`)).to.be.true;

      await initSpy.firstCall.returnValue;

      expect(document.documentElement.classList.contains(`mp-antiflicker-hide`)).to.be.false;
      expect(document.getElementById(`mp-antiflicker-style`)).to.equal(null);
      expect(fetchStub.callCount).to.equal(flags ? 1 : 0);
      // Editing remains available independently of successful flag delivery.
      document.body.innerHTML = `<h1>Original</h1>`;
      mixpanel.experiments.applyVisualChanges([
        { type: `setText`, selector: `h1`, value: `Preview` },
      ]);
      expect(document.querySelector(`h1`).textContent).to.equal(`Preview`);
      mixpanel.experiments.revertVisualChanges();
      expect(document.querySelector(`h1`).textContent).to.equal(`Original`);
    });
  });

  it(`does not register a postMessage listener at init`, function () {
    const addSpy = sinon.spy(global.window, `addEventListener`);
    mixpanel = loadFreshMixpanel();
    mixpanel.init(`test-token`, { visual_experiments: true, batch_requests: false });
    const messageCalls = addSpy.getCalls().filter((call) => call.args[0] === `message`);
    expect(messageCalls).to.have.length(0);
  });

  it(`applyVisualChanges works even when flag-fetch APIs are unavailable`, function () {
    delete global.window.fetch;
    mixpanel = loadFreshMixpanel();
    mixpanel.init(`test-token`, { visual_experiments: true, batch_requests: false });
    document.body.innerHTML = `<button class="cta">a</button>`;
    mixpanel.experiments.applyVisualChanges([
      { type: `setAttribute`, selector: `.cta`, attribute: `data-variant`, value: `B` },
    ]);
    expect(document.querySelector(`.cta`).getAttribute(`data-variant`)).to.equal(`B`);
  });

  it(`startEditorSession suppresses replay and clears an earlier standalone preview`, function () {
    mixpanel = loadFreshMixpanel();
    mixpanel.init(`test-token`, { visual_experiments: true, batch_requests: false });
    document.body.innerHTML = `<button class="cta">a</button>`;
    // Simulate a variant already replayed on page load.
    mixpanel.experiments.applyVisualChanges([
      { type: `setAttribute`, selector: `.cta`, attribute: `data-variant`, value: `B` },
    ]);
    expect(document.querySelector(`.cta`).getAttribute(`data-variant`)).to.equal(`B`);

    mixpanel.experiments.startEditorSession(`exp1`);
    // Replay for exp1 is suppressed...
    expect(mixpanel.visualExperiments._suppressedExperiments[`exp1`]).to.be.true;
    // ...and the already-applied variant is reverted so the preview is the sole driver.
    expect(document.querySelector(`.cta`).hasAttribute(`data-variant`)).to.be.false;
  });

  it(`endEditorSession reverts the preview, unsuppresses, and lets replay resume`, function () {
    mixpanel = loadFreshMixpanel();
    mixpanel.init(`test-token`, { visual_experiments: true, batch_requests: false });
    document.body.innerHTML = `<button class="cta">a</button>`;

    mixpanel.experiments.startEditorSession(`exp1`);
    expect(mixpanel.visualExperiments._suppressedExperiments[`exp1`]).to.be.true;

    // Author a preview change during the session.
    mixpanel.experiments.applyVisualChanges([
      { type: `setAttribute`, selector: `.cta`, attribute: `data-preview`, value: `on` },
    ]);
    expect(document.querySelector(`.cta`).getAttribute(`data-preview`)).to.equal(`on`);

    mixpanel.experiments.endEditorSession(`exp1`);
    // Preview cleared...
    expect(document.querySelector(`.cta`).hasAttribute(`data-preview`)).to.be.false;
    // ...and replay is unblocked for exp1.
    expect(mixpanel.visualExperiments._suppressedExperiments[`exp1`]).to.be.undefined;

    // A follow-up flag delivery now re-applies exp1's persisted mutations.
    const map = new Map([
      [`exp1`, {
        key: `B`,
        experiment_id: `exp1`,
        value: { $mp: { url: `http://localhost/pricing`, visualChanges: [
          { type: `setAttribute`, selector: `.cta`, attribute: `data-variant`, value: `B` },
        ] } },
      }],
    ]);
    mixpanel.visualExperiments.onFlagsDelivered(map);
    expect(document.querySelector(`.cta`).getAttribute(`data-variant`)).to.equal(`B`);
  });

  it(`applies on SPA navigation to a matching page and reverts on navigating away`, function () {
    mixpanel = loadFreshMixpanel();
    mixpanel.init(`test-token`, { visual_experiments: true, batch_requests: false });
    document.body.innerHTML = `<button class="cta">a</button>`;

    // Seed the already-delivered variant map (as if flags had been delivered),
    // scoped to /dashboard. No network fetch is involved on navigation.
    mixpanel.flags.flags = new Map([
      [`exp1`, {
        key: `B`,
        experiment_id: `exp1`,
        value: { $mp: { url: `http://localhost/dashboard`, visualChanges: [
          { type: `setAttribute`, selector: `.cta`, attribute: `data-variant`, value: `B` },
        ] } },
      }],
    ]);

    // Client-side navigate to the authored page -> engine applies from cache.
    global.window.history.pushState({}, ``, `/dashboard`);
    expect(document.querySelector(`.cta`).getAttribute(`data-variant`)).to.equal(`B`);

    // Navigate to a page with no matching variant -> prior changes are reverted.
    global.window.history.pushState({}, ``, `/settings`);
    expect(document.querySelector(`.cta`).hasAttribute(`data-variant`)).to.be.false;
  });

  describe(`editor previews alongside live experiments`, function () {
    let responseFlags;
    let fetchStub;
    let trackSpy;
    const preview = [{ type: `setText`, selector: `h1`, value: `Preview headline` }];
    const variant = (experimentId, selector, text, url = `http://localhost/pricing`) => ({
      experiment_id: experimentId,
      variant_key: `treatment`,
      variant_value: { $mp: {
        url,
        visualChanges: [{ type: `setText`, selector, value: text }],
      } },
    });

    beforeEach(async function () {
      document.body.innerHTML = `<h1>Original headline</h1><footer>Original footer</footer><aside>Original sidebar</aside>`;
      responseFlags = {
        headline: variant(`exp-a`, `h1`, `Live headline`),
        footer: variant(`exp-b`, `footer`, `Live footer`),
        sidebar: variant(`exp-c`, `aside`, `Other page`, `http://localhost/other`),
      };
      fetchStub = sinon.stub().callsFake(() => Promise.resolve({
        json: () => Promise.resolve({ flags: responseFlags }),
      }));
      global.window.fetch = fetchStub;
      mixpanel = loadFreshMixpanel();
      mixpanel.init(`test-token`, { flags: true, visual_experiments: true, batch_requests: false });
      trackSpy = sinon.stub(mixpanel.flags, `track`);
      await mixpanel.flags.persistenceLoadedPromise;
      await mixpanel.flags.whenReady();
      trackSpy.resetHistory();
    });

    it(`preserves unrelated changes through editing and restores live changes when editing ends`, function () {
      mixpanel.experiments.startEditorSession(`exp-a`);
      expect(document.querySelector(`h1`).textContent).to.equal(`Original headline`);
      expect(document.querySelector(`footer`).textContent).to.equal(`Live footer`);

      mixpanel.experiments.applyVisualChanges(preview);
      expect(document.querySelector(`h1`).textContent).to.equal(`Preview headline`);
      expect(document.querySelector(`footer`).textContent).to.equal(`Live footer`);
      expect(trackSpy.callCount).to.equal(0);

      mixpanel.experiments.endEditorSession(`exp-a`);
      expect(document.querySelector(`h1`).textContent).to.equal(`Live headline`);
      expect(document.querySelector(`footer`).textContent).to.equal(`Live footer`);
    });

    it(`preserves the preview across flag refreshes without recording preview exposures`, async function () {
      mixpanel.experiments.startEditorSession(`exp-a`);
      mixpanel.experiments.applyVisualChanges(preview);
      responseFlags.footer = variant(`exp-b`, `footer`, `Updated footer`);
      await mixpanel.flags.loadFlags();

      expect(document.querySelector(`h1`).textContent).to.equal(`Preview headline`);
      expect(document.querySelector(`footer`).textContent).to.equal(`Updated footer`);
      expect(trackSpy.getCalls().map(call => call.args[1][`Experiment name`])).to.deep.equal([`footer`]);

      responseFlags = {};
      await mixpanel.flags.loadFlags();
      expect(document.querySelector(`h1`).textContent).to.equal(`Preview headline`);
      expect(document.querySelector(`footer`).textContent).to.equal(`Original footer`);
      expect(trackSpy.callCount).to.equal(1);
    });

    [`empty changes`, `explicit revert`].forEach(clearMethod => {
      it(`clears a treatment preview using ${clearMethod} without clearing another experiment`, function () {
        mixpanel.experiments.startEditorSession(`exp-a`);
        mixpanel.experiments.applyVisualChanges(preview);
        if (clearMethod === `empty changes`) {
          mixpanel.experiments.applyVisualChanges([]);
        } else {
          mixpanel.experiments.revertVisualChanges();
        }

        expect(document.querySelector(`h1`).textContent).to.equal(`Original headline`);
        expect(document.querySelector(`footer`).textContent).to.equal(`Live footer`);
        expect(trackSpy.callCount).to.equal(0);
      });
    });

    it(`clears an empty control preview even when no live changes remain`, async function () {
      responseFlags = { headline: responseFlags.headline };
      await mixpanel.flags.loadFlags();
      mixpanel.experiments.startEditorSession(`exp-a`);
      mixpanel.experiments.applyVisualChanges(preview);
      mixpanel.experiments.applyVisualChanges([]);
      expect(document.querySelector(`h1`).textContent).to.equal(`Original headline`);
      expect(mixpanel.visualExperiments._engine._currentMutations).to.have.length(0);
    });

    it(`scopes the preview to its authoring page across navigation and refreshes`, async function () {
      mixpanel.experiments.startEditorSession(`exp-a`);
      mixpanel.experiments.applyVisualChanges(preview);
      const fetchCount = fetchStub.callCount;
      global.window.history.pushState({}, ``, `/other`);
      expect(document.querySelector(`h1`).textContent).to.equal(`Original headline`);
      expect(document.querySelector(`footer`).textContent).to.equal(`Original footer`);
      expect(document.querySelector(`aside`).textContent).to.equal(`Other page`);
      expect(fetchStub.callCount).to.equal(fetchCount);
      await mixpanel.flags.loadFlags();
      expect(document.querySelector(`h1`).textContent).to.equal(`Original headline`);

      global.window.history.pushState({}, ``, `/pricing?campaign=test#details`);
      expect(document.querySelector(`h1`).textContent).to.equal(`Preview headline`);
      expect(document.querySelector(`footer`).textContent).to.equal(`Live footer`);
      expect(document.querySelector(`aside`).textContent).to.equal(`Original sidebar`);
      expect(trackSpy.getCalls().some(call => call.args[1][`Experiment name`] === `headline`)).to.be.false;
    });

    it(`restarts the same experiment on a different page without carrying previews between pages`, function () {
      mixpanel.experiments.startEditorSession(`exp-a`);
      mixpanel.experiments.applyVisualChanges(preview);
      const fetchCount = fetchStub.callCount;

      global.window.history.pushState({}, ``, `/other`);
      mixpanel.experiments.startEditorSession(`exp-a`);
      expect(document.querySelector(`h1`).textContent).to.equal(`Original headline`);
      expect(document.querySelector(`aside`).textContent).to.equal(`Other page`);

      // Restarting discards the old preview even before new edits arrive.
      global.window.history.pushState({}, ``, `/pricing`);
      expect(document.querySelector(`h1`).textContent).to.equal(`Original headline`);
      expect(document.querySelector(`footer`).textContent).to.equal(`Live footer`);

      global.window.history.pushState({}, ``, `/other`);
      mixpanel.experiments.applyVisualChanges([
        { type: `setText`, selector: `h1`, value: `Other page preview` },
      ]);
      expect(document.querySelector(`h1`).textContent).to.equal(`Other page preview`);
      expect(document.querySelector(`aside`).textContent).to.equal(`Other page`);

      global.window.history.pushState({}, ``, `/pricing`);
      expect(document.querySelector(`h1`).textContent).to.equal(`Original headline`);
      global.window.history.pushState({}, ``, `/other`);
      expect(document.querySelector(`h1`).textContent).to.equal(`Other page preview`);
      expect(fetchStub.callCount).to.equal(fetchCount);
      expect(trackSpy.getCalls().some(call => call.args[1][`Experiment name`] === `headline`)).to.be.false;

      mixpanel.experiments.endEditorSession(`exp-a`);
      expect(document.querySelector(`h1`).textContent).to.equal(`Original headline`);
      expect(document.querySelector(`aside`).textContent).to.equal(`Other page`);
      global.window.history.pushState({}, ``, `/pricing`);
      expect(document.querySelector(`h1`).textContent).to.equal(`Live headline`);
    });

    it(`preserves a repeated session on the same normalized page`, function () {
      mixpanel.experiments.startEditorSession(`exp-a`);
      mixpanel.experiments.applyVisualChanges(preview);
      global.window.history.pushState({}, ``, `/pricing/?campaign=test#details`);
      mixpanel.experiments.startEditorSession(`exp-a`);
      expect(document.querySelector(`h1`).textContent).to.equal(`Preview headline`);
      expect(document.querySelector(`footer`).textContent).to.equal(`Live footer`);
      expect(trackSpy.callCount).to.equal(0);
    });

    it(`preserves repeated sessions and ignores a stale end message after switching experiments`, function () {
      mixpanel.experiments.startEditorSession(`exp-a`);
      mixpanel.experiments.applyVisualChanges(preview);
      mixpanel.experiments.startEditorSession(`exp-a`);
      expect(document.querySelector(`h1`).textContent).to.equal(`Preview headline`);

      mixpanel.experiments.startEditorSession(`exp-b`);
      expect(document.querySelector(`h1`).textContent).to.equal(`Live headline`);
      expect(document.querySelector(`footer`).textContent).to.equal(`Original footer`);
      mixpanel.experiments.applyVisualChanges([{ type: `setText`, selector: `footer`, value: `Preview footer` }]);
      mixpanel.experiments.endEditorSession(`exp-a`);
      expect(document.querySelector(`footer`).textContent).to.equal(`Preview footer`);
      mixpanel.experiments.endEditorSession(`exp-b`);
      expect(document.querySelector(`footer`).textContent).to.equal(`Live footer`);
    });
  });
});
