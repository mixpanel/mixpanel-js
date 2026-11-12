import { expect } from 'chai';
import sinon from 'sinon';
import { JSDOM } from 'jsdom';
import { FeatureFlagManager } from '../../src/flags/index';
import { FeatureFlagPersistence, VariantLookupPolicy } from '../../src/flags/flags-persistence';
import { VisualExperimentsManager } from '../../src/visual-experiments/index';
import { window } from '../../src/window';
import { _, document } from '../../src/utils';
import { setupFakeIDB } from './test-utils/indexed-db';
import { ALLOW_ALL_CONSENT_GATE } from './test-utils/consent-gate';

describe(`Shared visual previews`, function() {
  setupFakeIDB();
  let manager, fetchStub, track, apply, revert, response, originalLocation, originalDocument, originalFetch, dom;
  const preview = {
    variant_key: `treatment`, experiment_id: `exp-preview`, is_experiment_active: false,
    is_preview: true,
    variant_value: { $mp: { url: `https://customer.test/pricing`, visualChanges: [
      { type: `setText`, selector: `.title`, value: `Preview title` }
    ] } }
  };
  const ordinary = { variant_key: `control`, variant_value: false, experiment_id: `exp-normal` };
  const pending = (key) => ({ flag_key: key, first_time_event_hash: `hash`, event_name: `Purchase`, pending_variant: { variant_key: `triggered`, variant_value: true } });

  beforeEach(function() {
    originalLocation = window.location;
    originalDocument = window.document;
    originalFetch = window.fetch;
    dom = new JSDOM(``, { url: `https://customer.test/pricing?x=1&mp_preview_token=signed.token#/checkout` });
    window.location = dom.window.location;
    window.document = dom.window.document;
    response = { flags: { visual: preview, ordinary }, pending_first_time_events: [pending(`visual`), pending(`ordinary`)] };
    fetchStub = sinon.stub().callsFake(() => Promise.resolve({ json: () => Promise.resolve(response) }));
    window.fetch = fetchStub;
    track = sinon.spy();
    apply = sinon.spy();
    revert = sinon.spy();
    const config = { token: `preview-test`, flags: { persistence: { variantLookupPolicy: VariantLookupPolicy.PERSISTENCE_UNTIL_NETWORK_SUCCESS } } };
    manager = new FeatureFlagManager({
      consentGate: ALLOW_ALL_CONSENT_GATE,
      getFullApiRoute: () => `https://api.mixpanel.test/flags`,
      getConfigFunc: key => config[key],
      getPropertyFunc: () => `user`,
      trackingFunc: track,
      visualExperiments: new VisualExperimentsManager({
        getConfigFunc: key => config[key],
        getVariantsFunc: () => manager.getAllVariantsSync(),
        trackExposureFunc: (name, feature) => manager.trackVisualExposure(name, feature),
        applyVisualChangesFunc: apply,
        revertVisualChangesFunc: revert
      })
    });
  });

  afterEach(function() {
    window.location = originalLocation;
    window.document = originalDocument;
    window.fetch = originalFetch;
    dom.window.close();
    delete window.__mp_targeting;
    sinon.restore();
  });

  it(`requests preview with normal flags in one request and applies the selected disabled variant`, async function() {
    await manager.init();
    expect(fetchStub.callCount).to.equal(1);
    const url = new URL(fetchStub.firstCall.args[0]);
    expect(url.searchParams.get(`mp_preview_token`)).to.equal(`signed.token`);
    expect(fetchStub.firstCall.args[1].referrerPolicy).to.equal(`no-referrer`);
    expect(url.searchParams.get(`token`)).to.equal(`preview-test`);
    expect(manager.getVariantSync(`visual`).is_preview).to.equal(true);
    expect(apply.firstCall.args[0]).to.deep.equal(preview.variant_value.$mp.visualChanges);
    expect(window.location.hash).to.equal(`#/checkout`);
  });

  it(`suppresses preview exposure before dedup while normal flags still emit exposures`, async function() {
    await manager.init();
    manager.getVariantSync(`visual`);
    manager.getVariantSync(`visual`);
    expect(track.callCount).to.equal(0);
    expect(manager.trackedFeatures.has(`visual`)).to.equal(false);
    manager.getVariantSync(`ordinary`);
    expect(track.callCount).to.equal(1);
    expect(track.firstCall.args[0]).to.equal(`$experiment_started`);
    await manager.loadFlags();
    manager.getVariantSync(`visual`);
    expect(track.callCount).to.equal(1);
    expect(new URL(fetchStub.secondCall.args[0]).searchParams.get(`mp_preview_token`)).to.equal(`signed.token`);
  });

  it(`never loads cached variants or pending activations before a preview resolves`, async function() {
    const load = sinon.spy(FeatureFlagPersistence.prototype, `loadFlagsFromStorage`);
    let resolve;
    fetchStub.returns(new Promise(done => { resolve = done; }));
    const ready = manager.init();
    await manager.persistenceLoadedPromise;
    manager.getVariantSync(`visual`, { value: false });
    expect(load.called).to.equal(false);
    expect(track.called).to.equal(false);
    expect(apply.called).to.equal(false);
    expect(manager.pendingFirstTimeEvents).to.deep.equal({});
    resolve({ json: () => Promise.resolve(response) });
    await ready;
    manager.getVariantSync(`visual`);
    expect(track.called).to.equal(false);
  });

  it(`overrides activated variants and discards pending preview activations`, async function() {
    response = { flags: { visual: ordinary } };
    await manager.init();
    manager.activatedFirstTimeEvents[`visual:hash`] = true;
    response = { flags: { visual: preview }, pending_first_time_events: [pending(`visual`)] };
    await manager.loadFlags();
    expect(manager.getVariantSync(`visual`).key).to.equal(`treatment`);
    expect(manager.activatedFirstTimeEvents).to.deep.equal({});
    expect(manager.pendingFirstTimeEvents).to.deep.equal({});
    await manager.checkFirstTimeEvents(`Purchase`, {});
    expect(fetchStub.callCount).to.equal(2);
    expect(manager.getVariantSync(`visual`).is_preview).to.equal(true);
  });

  it(`does not activate a first-time event whose targeting finishes after preview delivery`, async function() {
    response = { flags: { visual: ordinary }, pending_first_time_events: [pending(`visual`)] };
    await manager.init();
    let finishTargeting;
    window.__mp_targeting = new Promise(resolve => { finishTargeting = resolve; });
    const eventCheck = manager.checkFirstTimeEvents(`Purchase`, {});
    response = { flags: { visual: preview } };
    await manager.loadFlags();
    finishTargeting({ eventMatchesCriteria: () => ({ matches: true }) });
    await eventCheck;
    expect(manager.getVariantSync(`visual`).is_preview).to.equal(true);
    expect(fetchStub.callCount).to.equal(2);
    expect(track.called).to.equal(false);
  });

  it(`excludes preview assignments and their pending events from persisted state`, async function() {
    await manager.init();
    await manager.persistence.save(manager._buildContext(), manager.flags, {
      'visual:hash': pending(`visual`), 'ordinary:hash': pending(`ordinary`)
    });
    const stored = await manager.persistence.loadFlagsFromStorage(manager._buildContext());
    expect(stored.flags.has(`visual`)).to.equal(false);
    expect(stored.flags.has(`ordinary`)).to.equal(true);
    expect(Object.keys(stored.pendingFirstTimeEvents)).to.deep.equal([`ordinary:hash`]);
  });

  it(`reverts when a refresh selects an empty control preview`, async function() {
    await manager.init();
    response = { flags: { visual: Object.assign({}, preview, { variant_key: `control`, variant_value: { $mp: { url: `https://customer.test/pricing`, visualChanges: [] } } }) } };
    await manager.loadFlags();
    expect(revert.callCount).to.equal(1);
    expect(manager.getVariantSync(`visual`).key).to.equal(`control`);
    expect(track.called).to.equal(false);
  });

  it(`uses ordinary delivery when preview validation fails and when the URL token is removed`, async function() {
    response = { flags: { visual: ordinary }, preview_error: { code: `preview_unavailable` } };
    await manager.init();
    expect(manager.getVariantSync(`visual`).is_preview).to.equal(undefined);
    expect(track.callCount).to.equal(1);
    dom.window.history.replaceState({}, ``, `/pricing?x=1#/checkout`);
    await manager.loadFlags();
    expect(new URL(fetchStub.secondCall.args[0]).searchParams.has(`mp_preview_token`)).to.equal(false);
    expect(fetchStub.secondCall.args[1]).not.to.have.property(`referrerPolicy`);
  });

  it(`does not include request credentials in propagated fetch errors`, async function() {
    await manager.init();
    fetchStub.rejects(new Error(`Fetch failed for ?mp_preview_token=signed.token`));
    try {
      await manager.loadFlags();
      throw new Error(`Expected rejection`);
    } catch (error) {
      expect(error.message).to.equal(`Error fetching preview flags`);
    }
  });
});

describe(`Preview URL redaction`, function() {
  it(`redacts repeated and encoded preview values while retaining parameter names and other URL components`, function() {
    expect(_.sanitizeUrl(`https://c.test/p?mp_preview_token=one&x=a%20b&mp%5Fpreview%5Ftoken=two#/route?q=1`))
      .to.equal(`https://c.test/p?mp_preview_token=REDACTED&x=a%20b&mp%5Fpreview%5Ftoken=REDACTED#/route?q=1`);
    expect(_.sanitizeUrl(`?mp_preview_token=secret`)).to.equal(`?mp_preview_token=REDACTED`);
    expect(_.sanitizeUrl(`https://api.test/flags?token=project&mp_preview_token=secret`))
      .to.equal(`https://api.test/flags?token=project&mp_preview_token=REDACTED`);
    expect(_.sanitizeUrl(`https://c.test/?preview_token=customer&mp_preview_token=secret`))
      .to.equal(`https://c.test/?preview_token=customer&mp_preview_token=REDACTED`);
    expect(_.sanitizeUrl(`https://c.test/?x=1#mp_preview_token=anchor`)).to.equal(`https://c.test/?x=1#mp_preview_token=anchor`);
  });

  it(`handles empty values and malformed unrelated parameters without exposing other credentials`, function() {
    expect(_.sanitizeUrl(`?broken%=x&mp_preview_token=secret&mp_preview_token=&x=1`))
      .to.equal(`?broken%=x&mp_preview_token=REDACTED&mp_preview_token=REDACTED&x=1`);
    expect(_.sanitizeUrl(`https://c.test/?x=1#/route?mp_preview_token=secret`))
      .to.equal(`https://c.test/?x=1#/route?mp_preview_token=REDACTED`);
    for (const value of [null, undefined, 123, {}, ``]) {
      expect(_.sanitizeUrl(value)).to.equal(value);
    }
  });

  it(`preserves query formatting while decoding only parameter names`, function() {
    expect(_.sanitizeUrl(`https://c.test/p?bare&x=a=b?c&&mp_preview_token=a=b&mp%5fpreview%5ftoken&plus+key=a+b&encoded=%26%3D&#/route?mp_preview_token=two&x=%20#anchor`))
      .to.equal(`https://c.test/p?bare&x=a=b?c&&mp_preview_token=REDACTED&mp%5fpreview%5ftoken=REDACTED&plus+key=a+b&encoded=%26%3D&#/route?mp_preview_token=REDACTED&x=%20#anchor`);
    expect(_.sanitizeUrl(`https://c.test/mp_preview_token=path#anchor&mp_preview_token=value`))
      .to.equal(`https://c.test/mp_preview_token=path#anchor&mp_preview_token=value`);
  });

  it(`returns the original input if sanitization unexpectedly throws`, function() {
    const url = `https://c.test/?mp_preview_token=secret`;
    const originalReplace = String.prototype.replace;
    const replace = sinon.stub(String.prototype, `replace`).callsFake(function() {
      if (String(this) === url) {
        throw new Error(`Unexpected replacement failure`);
      }
      return originalReplace.apply(this, arguments);
    });
    let result;
    try {
      result = _.sanitizeUrl(url);
    } finally {
      replace.restore();
    }
    expect(result).to.equal(url);
  });

  it(`redacts default page, search and referrer telemetry while retaining the actual URL`, function() {
    const oldLocation = window.location;
    const oldReferrer = document.referrer;
    window.location = { href: `https://c.test/p?mp_preview_token=secret&x=1`, search: `?mp_preview_token=secret&x=1` };
    document.referrer = `https://c.test/?mp_preview_token=other`;
    try {
      expect(_.info.properties().$current_url).to.equal(`https://c.test/p?mp_preview_token=REDACTED&x=1`);
      expect(_.info.properties().$referrer).to.equal(`https://c.test/?mp_preview_token=REDACTED`);
      expect(_.info.mpPageViewProperties().current_url_search).to.equal(`?mp_preview_token=REDACTED&x=1`);
      expect(window.location.href).to.contain(`secret`);
    } finally {
      window.location = oldLocation;
      document.referrer = oldReferrer;
    }
  });
});
