import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

import { window } from '../../src/window';

import { FeatureFlagManager } from '../../src/flags/index';
import { FeatureFlagPersistence, VariantLookupPolicy } from '../../src/flags/flags-persistence';
import { VisualExperimentsManager } from '../../src/visual-experiments/index';
import { setupFakeIDB } from './test-utils/indexed-db';
import { ALLOW_ALL_CONSENT_GATE } from './test-utils/consent-gate';

chai.use(sinonChai);

// In the plain (non-DOM) unit environment the src/window stub cannot resolve
// urls, so page scoping is permissive here; it is asserted in the jsdom-backed
// VisualExperimentsManager suite.
const PAGE_URL = `http://localhost/pricing`;

const visualChangesPayload = [
  { type: `setAttribute`, selector: `.cta`, attribute: `data-variant`, value: `B` },
  { type: `setStyle`, selector: `.cta`, property: `color`, value: `red` },
];

const treatmentResponse = (visualChanges = visualChangesPayload) => ({
  variant_key: `B`,
  variant_value: { $mp: { url: PAGE_URL, visualChanges } },
  experiment_id: `exp1`,
  is_experiment_active: true,
  is_qa_tester: false,
});
const controlResponse = {
  variant_key: `control`,
  variant_value: { $mp: { url: PAGE_URL, visualChanges: [] } },
  experiment_id: `exp1`,
  is_experiment_active: true,
  is_qa_tester: false,
};

describe(`Visual experiments delivery`, function () {
  let mockConfig;
  let mockFetch;
  let mockResponse;
  let initOptions;
  let flagManager;

  beforeEach(function () {
    mockConfig = {
      api_host: `https://api.mixpanel.com`,
      api_routes: { flags: `flags` },
      token: `test-token`,
      flags: { context: { user_id: `test-user` } },
      visual_experiments: true,
    };
    mockResponse = {
      json: sinon.stub().resolves({ code: 200, flags: { visualExperiment: treatmentResponse() } }),
    };
    mockFetch = sinon.stub().resolves(mockResponse);
    window[`fetch`] = mockFetch;

    initOptions = {
      getFullApiRoute: sinon.stub().returns(`https://api.mixpanel.com/flags`),
      getConfigFunc: sinon.stub().callsFake((key) => mockConfig[key]),
      setConfigFunc: sinon.stub().callsFake((key, value) => { mockConfig[key] = value; }),
      getPropertyFunc: sinon.stub().callsFake((key) => {
        if (key === `distinct_id`) return `test-distinct-id`;
        if (key === `$device_id`) return `test-device-id`;
        return null;
      }),
      trackingFunc: sinon.stub(),
      loadExtraBundle: sinon.stub().callsFake((src, callback) => { callback(); }),
      consentGate: ALLOW_ALL_CONSENT_GATE,
    };
  });

  afterEach(function () {
    sinon.restore();
    delete window[`fetch`];
  });

  async function seedPersistedVariants(variants) {
    mockConfig.flags.persistence = { variantLookupPolicy: VariantLookupPolicy.PERSISTENCE_UNTIL_NETWORK_SUCCESS };
    const seed = new FeatureFlagPersistence({ variantLookupPolicy: VariantLookupPolicy.PERSISTENCE_UNTIL_NETWORK_SUCCESS }, mockConfig.token);
    await seed.idb.init();
    await seed.save(
      { distinct_id: `test-distinct-id`, device_id: `test-device-id` },
      new Map(Object.entries(variants))
    );
  }

  const persistedTreatment = { visualExperiment: { key: `B`, value: { $mp: { url: PAGE_URL, visualChanges: visualChangesPayload } } } };

  describe(`FeatureFlagManager hooks`, function () {
    let hooks;

    beforeEach(function () {
      hooks = {
        onFlagsDelivered: sinon.spy(),
        onDeliverySettled: sinon.spy(),
        onReset: sinon.spy(),
      };
      initOptions.visualExperiments = hooks;
      flagManager = new FeatureFlagManager(initOptions);
    });

    it(`delivers the fetched variants`, async function () {
      await flagManager.init();
      expect(hooks.onFlagsDelivered).to.have.been.calledOnceWith(flagManager.flags);
      expect(flagManager.flags.get(`visualExperiment`).key).to.equal(`B`);
    });

    it(`delivers again on every fetch`, async function () {
      await flagManager.init();
      await flagManager.loadFlags();
      expect(hooks.onFlagsDelivered).to.have.been.calledTwice;
    });

    it(`settles once delivery completes`, async function () {
      await flagManager.init();
      expect(hooks.onDeliverySettled).to.have.been.calledOnce;
    });

    it(`settles when flag fetching is disabled, without delivering`, async function () {
      mockConfig.flags = false;
      await flagManager.init();
      expect(mockFetch).to.not.have.been.called;
      expect(hooks.onFlagsDelivered).to.not.have.been.called;
      expect(hooks.onDeliverySettled).to.have.been.calledOnce;
    });

    it(`settles when the fetch fails`, async function () {
      mockFetch.rejects(new Error(`Flags unavailable`));
      await flagManager.init();
      expect(hooks.onFlagsDelivered).to.not.have.been.called;
      expect(hooks.onDeliverySettled).to.have.been.calledOnce;
    });

    it(`settles when the required APIs are missing`, function () {
      delete window[`fetch`];
      flagManager = new FeatureFlagManager(initOptions);
      expect(flagManager.init()).to.be.undefined;
      expect(hooks.onDeliverySettled).to.have.been.calledOnce;
    });

    it(`notifies a reset`, async function () {
      await flagManager.init();
      await flagManager.reset();
      expect(hooks.onReset).to.have.been.calledOnce;
      expect(hooks.onFlagsDelivered).to.have.been.calledTwice;
    });

    it(`works without a collaborator`, async function () {
      delete initOptions.visualExperiments;
      flagManager = new FeatureFlagManager(initOptions);
      await flagManager.init();
      await flagManager.reset();
      expect(flagManager.areFlagsReady()).to.be.true;
    });

    describe(`first-time events`, function () {
      beforeEach(function () {
        mockResponse.json.resolves({
          code: 200,
          flags: { visualExperiment: controlResponse },
          pending_first_time_events: [{
            flag_key: `visualExperiment`,
            flag_id: `flag-1`,
            project_id: 3,
            first_time_event_hash: `hash-1`,
            event_name: `Signed Up`,
            property_filters: {},
            pending_variant: treatmentResponse(),
          }],
        });
      });

      it(`delivers again when an event activates a variant`, async function () {
        await flagManager.init();
        hooks.onFlagsDelivered.resetHistory();
        await flagManager.checkFirstTimeEvents(`Signed Up`, {});
        expect(flagManager.flags.get(`visualExperiment`).key).to.equal(`B`);
        expect(hooks.onFlagsDelivered).to.have.been.calledOnceWith(flagManager.flags);
      });

      it(`does not deliver when no event matches`, async function () {
        await flagManager.init();
        hooks.onFlagsDelivered.resetHistory();
        await flagManager.checkFirstTimeEvents(`Something Else`, {});
        expect(hooks.onFlagsDelivered).to.not.have.been.called;
      });
    });

    describe(`from persistence`, function () {
      setupFakeIDB();

      it(`delivers persisted variants before the network fetch`, async function () {
        await seedPersistedVariants(persistedTreatment);
        mockFetch.returns(new Promise(function () {}));

        flagManager.init();
        await flagManager.persistenceLoadedPromise;

        expect(hooks.onFlagsDelivered).to.have.been.calledOnce;
        expect(hooks.onFlagsDelivered.firstCall.args[0].get(`visualExperiment`).key).to.equal(`B`);
        expect(hooks.onDeliverySettled).to.not.have.been.called;
      });

      it(`delivers once per source: persistence first, then the network`, async function () {
        await seedPersistedVariants(persistedTreatment);
        mockResponse.json.resolves({ code: 200, flags: { visualExperiment: Object.assign({}, treatmentResponse(), { variant_key: `C` }) } });

        await flagManager.init();

        expect(hooks.onFlagsDelivered).to.have.been.calledTwice;
        expect(hooks.onFlagsDelivered.firstCall.args[0].get(`visualExperiment`).key).to.equal(`B`);
        expect(hooks.onFlagsDelivered.secondCall.args[0].get(`visualExperiment`).key).to.equal(`C`);
        expect(hooks.onDeliverySettled).to.have.been.calledOnce;
      });
    });
  });

  describe(`end to end with the engine replaced`, function () {
    let visual;
    let applySpy;
    let revertSpy;
    let settledSpy;
    let engineReports;

    const buildPair = () => {
      visual = new VisualExperimentsManager({
        getConfigFunc: (key) => mockConfig[key],
        getVariantsFunc: () => flagManager.getAllVariantsSync(),
        trackExposureFunc: (name, feature) => flagManager.trackVisualExposure(name, feature),
        applyVisualChangesFunc: applySpy,
        revertVisualChangesFunc: revertSpy,
        onSettledFunc: settledSpy,
      });
      flagManager = new FeatureFlagManager(Object.assign({}, initOptions, { visualExperiments: visual }));
    };

    function experimentStartedCalls() {
      return initOptions.trackingFunc.getCalls().filter((call) => call.args[0] === `$experiment_started`);
    }

    beforeEach(function () {
      // Stand-in for the engine: reports every mutation as applied unless a test
      // swaps in different behavior.
      engineReports = (mutations, onFirstApply) => {
        mutations.forEach((mutation, index) => onFirstApply(index));
      };
      applySpy = sinon.spy((mutations, onFirstApply) => engineReports(mutations, onFirstApply));
      revertSpy = sinon.spy();
      settledSpy = sinon.spy();
      buildPair();
    });

    it(`applies the fetched variant's changes and reveals`, async function () {
      await flagManager.init();
      expect(applySpy).to.have.been.calledOnceWith(visualChangesPayload);
      expect(settledSpy).to.have.been.calledOnce;
    });

    it(`reverts and reveals when no variant carries changes`, async function () {
      mockResponse.json.resolves({ code: 200, flags: { plainFlag: { variant_key: `A`, variant_value: `plain-value` } } });
      await flagManager.init();
      expect(applySpy).to.not.have.been.called;
      expect(revertSpy).to.have.been.called;
      expect(settledSpy).to.have.been.calledOnce;
    });

    it(`reveals once when the fetch fails`, async function () {
      mockFetch.rejects(new Error(`Flags unavailable`));
      await flagManager.init();
      expect(settledSpy).to.have.been.calledOnce;
    });

    it(`tracks $experiment_started with $experiment_type visual when changes apply`, async function () {
      await flagManager.init();

      const calls = experimentStartedCalls();
      expect(calls).to.have.length(1);
      const props = calls[0].args[1];
      expect(props[`Experiment name`]).to.equal(`visualExperiment`);
      expect(props[`Variant name`]).to.equal(`B`);
      expect(props[`$experiment_type`]).to.equal(`visual`);
      expect(props[`$experiment_id`]).to.equal(`exp1`);
      expect(props[`$is_experiment_active`]).to.equal(true);
    });

    it(`tracks a control once the page is matched, without an apply`, async function () {
      mockResponse.json.resolves({ code: 200, flags: { visualExperiment: controlResponse } });

      await flagManager.init();

      expect(applySpy).to.not.have.been.called;
      const calls = experimentStartedCalls();
      expect(calls).to.have.length(1);
      expect(calls[0].args[1][`Variant name`]).to.equal(`control`);
      expect(calls[0].args[1][`$experiment_type`]).to.equal(`visual`);
    });

    it(`does not track shared previews when changes apply or code reads the variant`, async function () {
      mockResponse.json.resolves({ code: 200, flags: { visualExperiment: Object.assign({}, treatmentResponse(), { is_preview: true }) } });

      await flagManager.init();
      flagManager.getVariantSync(`visualExperiment`);

      expect(applySpy).to.have.been.calledOnce;
      expect(experimentStartedCalls()).to.have.length(0);
    });

    it(`records code and visual exposures separately, whichever comes first`, async function () {
      let onFirstApply;
      engineReports = (mutations, callback) => { onFirstApply = callback; };
      await flagManager.init();

      // Code reads the flag before its visual change has rendered...
      flagManager.getVariantSync(`visualExperiment`, { key: `fallback`, value: null });
      // ...then the change lands; it must still be recorded as a visual exposure.
      onFirstApply(0);
      // Repeats of either kind stay deduped.
      flagManager.getVariantSync(`visualExperiment`, { key: `fallback`, value: null });
      onFirstApply(1);

      const types = experimentStartedCalls().map((call) => call.args[1][`$experiment_type`]);
      expect(types).to.deep.equal([`feature_flag`, `visual`]);
    });

    it(`does not re-track when cached variants are re-applied`, async function () {
      await flagManager.init();
      visual.onFlagsDelivered(flagManager.flags);

      expect(applySpy).to.have.been.calledTwice;
      expect(experimentStartedCalls()).to.have.length(1);
    });

    it(`tracks a newly delivered control again after reset`, async function () {
      mockResponse.json.resolves({ code: 200, flags: { visualExperiment: controlResponse } });
      await flagManager.init();

      await flagManager.reset();

      expect(experimentStartedCalls()).to.have.length(2);
    });

    it(`does not track an apply from before reset() under the new identity`, async function () {
      let staleOnFirstApply;
      engineReports = (mutations, callback) => {
        if (!staleOnFirstApply) {
          staleOnFirstApply = callback;
        }
      };
      await flagManager.init();
      // The post-reset fetch hangs, leaving the old set's callback live.
      mockFetch.returns(new Promise(function () {}));
      flagManager.reset();

      // A previously unmatched element renders after reset.
      staleOnFirstApply(0);

      expect(experimentStartedCalls()).to.have.length(0);
    });

    [`treatment`, `control`].forEach((firstVariant) => {
      it(`skips pending controls when tracking a ${firstVariant} resets the visitor`, async function () {
        mockResponse.json.resolves({
          code: 200,
          flags: {
            firstExperiment: firstVariant === `treatment` ? treatmentResponse() : controlResponse,
            pendingControl: Object.assign({}, controlResponse, { experiment_id: `exp2` }),
          },
        });
        initOptions.trackingFunc.onFirstCall().callsFake(() => {
          // Keep the new visitor's fetch pending to isolate the old batch.
          mockFetch.returns(new Promise(function () {}));
          flagManager.reset();
        });

        await flagManager.init();

        const names = experimentStartedCalls().map((call) => call.args[1][`Experiment name`]);
        expect(names).to.deep.equal([`firstExperiment`]);
        expect(flagManager.trackedVisualExposures.size).to.equal(0);
        expect(settledSpy).to.have.been.calledOnce;
      });
    });

    [`treatment`, `control`].forEach((variant) => {
      it(`keeps delivering a ${variant} when tracking throws`, async function () {
        mockResponse.json.resolves({ code: 200, flags: { visualExperiment: variant === `treatment` ? treatmentResponse() : controlResponse } });
        initOptions.trackingFunc = sinon.stub().throws(new Error(`before_track blew up`));
        buildPair();

        await flagManager.init();

        expect(applySpy.callCount).to.equal(variant === `treatment` ? 1 : 0);
        expect(settledSpy).to.have.been.calledOnce;
        expect(flagManager.areFlagsReady()).to.be.true;
      });
    });

    it(`does not track when visual experiments are not enabled`, async function () {
      mockConfig.visual_experiments = false;
      // mixpanel-core never binds the engine when disabled, so nothing is applied.
      applySpy = undefined;
      buildPair();

      await flagManager.init();

      expect(experimentStartedCalls()).to.have.length(0);
    });

    describe(`across persistence and network`, function () {
      setupFakeIDB();

      it(`applies once per source and reveals once`, async function () {
        await seedPersistedVariants(persistedTreatment);
        const updatedChanges = [{ type: `setAttribute`, selector: `.cta`, attribute: `data-variant`, value: `C` }];
        mockResponse.json.resolves({ code: 200, flags: { visualExperiment: treatmentResponse(updatedChanges) } });

        await flagManager.init();

        expect(applySpy).to.have.been.calledTwice;
        expect(applySpy.firstCall.args[0]).to.deep.equal(visualChangesPayload);
        expect(applySpy.secondCall.args[0]).to.deep.equal(updatedChanges);
        expect(settledSpy).to.have.been.calledOnce;
      });

      // Mirrors getVariantSync: a network delivery resets exposure dedup, so the
      // persisted apply and the network apply each record one exposure.
      it(`tracks once per delivery source`, async function () {
        await seedPersistedVariants(persistedTreatment);

        await flagManager.init();

        expect(applySpy).to.have.been.calledTwice;
        const calls = experimentStartedCalls();
        expect(calls).to.have.length(2);
        expect(calls[1].args[1][`$experiment_id`]).to.equal(`exp1`);
      });

      it(`still fetches from the network when tracking the persisted apply throws`, async function () {
        await seedPersistedVariants(persistedTreatment);
        initOptions.trackingFunc = sinon.stub().throws(new Error(`before_track blew up`));
        buildPair();

        await flagManager.init();

        expect(mockFetch).to.have.been.calledOnce;
        expect(applySpy).to.have.been.calledTwice;
      });

      it(`does not track a persisted control when visual experiments are disabled`, async function () {
        mockConfig.visual_experiments = false;
        applySpy = undefined;
        buildPair();
        await seedPersistedVariants({ visualExperiment: { key: `control`, value: { $mp: { url: PAGE_URL, visualChanges: [] } } } });
        mockFetch.returns(new Promise(function () {}));

        flagManager.init();
        await flagManager.persistenceLoadedPromise;

        expect(flagManager.flags.get(`visualExperiment`).key).to.equal(`control`);
        expect(experimentStartedCalls()).to.have.length(0);
        expect(settledSpy).to.have.been.calledOnce;
      });
    });
  });
});
