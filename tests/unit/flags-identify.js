import { expect } from 'chai';
import path from 'path';
import sinon from 'sinon';

import jsdomSetup from './jsdom-setup';

const TOKEN = `flags-identify-token`;
const SRC_DIR = path.resolve(__dirname, `../../src`);
const FLAG_KEY = `first-time-flag`;
const EVENT_NAME = `First Event`;

const PENDING_RESPONSE = {
  flags: {
    [FLAG_KEY]: {variant_key: `control`, variant_value: false},
  },
  pending_first_time_events: [{
    flag_key: FLAG_KEY,
    flag_id: `flag-1`,
    project_id: 1,
    first_time_event_hash: `hash-1`,
    event_name: EVENT_NAME,
    property_filters: {},
    pending_variant: {
      variant_key: `treatment`,
      variant_value: true,
      experiment_id: `exp-1`,
      is_experiment_active: true,
    },
  }],
};

describe(`flags on identify`, function() {
  let mixpanel, flagResponses;

  afterEach(function() {
    sinon.restore();
  });

  jsdomSetup({
    beforeCallback: () => {
      Object.keys(require.cache)
        .filter(modulePath => modulePath.startsWith(SRC_DIR))
        .forEach(modulePath => delete require.cache[modulePath]);
      const {init_as_module} = require(`../../src/mixpanel-core`);
      mixpanel = init_as_module(sinon.spy());
      window.localStorage.clear();

      flagResponses = {};
      window.fetch = sinon.spy(url => {
        const params = new URL(url).searchParams;
        if (!params.has(`context`)) {
          return Promise.resolve({json: () => Promise.resolve({})});
        }
        const distinctId = JSON.parse(params.get(`context`)).distinct_id;
        const body = flagResponses[distinctId] || PENDING_RESPONSE;
        return Promise.resolve(body).then(resolved => ({json: () => Promise.resolve(resolved)}));
      });
    },
  });

  function initInstance() {
    const instance = mixpanel.init(TOKEN, {
      batch_requests: false,
      flags: {context: {}},
    }, `flags_identify`);
    sinon.stub(instance, `_send_request`);
    return instance;
  }

  function flagFetchesFor(distinctId) {
    return window.fetch.getCalls().filter(call => {
      const context = new URL(call.args[0]).searchParams.get(`context`);
      return context && JSON.parse(context).distinct_id === distinctId;
    });
  }

  async function waitForFlags(instance, distinctId) {
    for (let i = 0; i < 50 && !flagFetchesFor(distinctId).length; i++) {
      await new Promise(resolve => setTimeout(resolve, 0));
    }
    await instance.flags.whenReady();
  }

  function experimentStartedEvents(instance) {
    return instance._send_request.getCalls()
      .map(call => JSON.parse(call.args[1].data))
      .filter(event => event.event === `$experiment_started`);
  }

  async function activateAsUserA(instance) {
    instance.identify(`user-a`);
    await waitForFlags(instance, `user-a`);
    await instance.flags.checkFirstTimeEvents(EVENT_NAME, {});
    expect(instance.flags.flags.get(FLAG_KEY).key).to.equal(`treatment`);
  }

  it(`should not carry an activated first-time variant over to a new distinct id`, async function() {
    const instance = initInstance();
    await activateAsUserA(instance);

    instance.identify(`user-b`);
    await waitForFlags(instance, `user-b`);

    expect(instance.flags.activatedFirstTimeEvents).to.deep.equal({});
    expect(instance.flags.pendingFirstTimeEvents).to.have.property(`${FLAG_KEY}:hash-1`);
    const variant = instance.flags.getVariantSync(FLAG_KEY, null);
    expect(variant.key).to.equal(`control`);
    expect(experimentStartedEvents(instance).map(event => event.properties.distinct_id)).to.deep.equal([`user-b`]);
    expect(experimentStartedEvents(instance)[0].properties[`Variant name`]).to.equal(`control`);
  });

  it(`should not reset flags when identify keeps the same distinct id`, async function() {
    const instance = initInstance();
    await activateAsUserA(instance);
    const resetSpy = sinon.spy(instance.flags, `reset`);
    const fetchCount = window.fetch.callCount;

    instance.identify(`user-a`);
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(resetSpy.called).to.equal(false);
    expect(window.fetch.callCount).to.equal(fetchCount);
    expect(instance.flags.activatedFirstTimeEvents).to.have.property(`${FLAG_KEY}:hash-1`, true);
    expect(instance.flags.getVariantSync(FLAG_KEY, null).key).to.equal(`treatment`);
  });

  it(`should let flag readers wait for the new user's flags right after identify`, async function() {
    const instance = initInstance();
    await activateAsUserA(instance);
    flagResponses[`user-b`] = {
      flags: {[FLAG_KEY]: {variant_key: `user-b-variant`, variant_value: `b`}},
    };

    instance.identify(`user-b`);
    const variant = instance.flags.get_variant(FLAG_KEY, `fallback`);
    await instance.flags.when_ready();

    expect(flagFetchesFor(`user-b`)).to.have.length(1);
    expect(instance.flags.flags.get(FLAG_KEY).key).to.equal(`user-b-variant`);
    expect((await variant).key).to.equal(`user-b-variant`);
  });

  it(`should not return the previous user's variant while the new fetch is in flight`, async function() {
    const instance = initInstance();
    await activateAsUserA(instance);

    let resolveUserB;
    flagResponses[`user-b`] = new Promise(resolve => {
      resolveUserB = resolve;
    });

    instance.identify(`user-b`);
    expect(instance.flags.getVariantSync(FLAG_KEY, `fallback`).value).to.equal(`fallback`);

    for (let i = 0; i < 50 && !flagFetchesFor(`user-b`).length; i++) {
      await new Promise(resolve => setTimeout(resolve, 0));
    }
    expect(flagFetchesFor(`user-b`)).to.have.length(1);
    expect(instance.flags.getVariantSync(FLAG_KEY, `fallback`).value).to.equal(`fallback`);
    const pendingVariant = instance.flags.getVariant(FLAG_KEY, `fallback`);

    resolveUserB(PENDING_RESPONSE);
    expect((await pendingVariant).key).to.equal(`control`);
  });
});
