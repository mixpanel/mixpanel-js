import { expect } from 'chai';
import path from 'path';
import sinon from 'sinon';

import jsdomSetup from './jsdom-setup';

const TOKEN = `gdpr-instance-token`;
const SRC_DIR = path.resolve(__dirname, `../../src`);

// the other opt-out status cases are browser tests (tests/browser/client/suites/gdpr.js); these
// need the cached localStorage probe re-run, which the browser suite can't reach
describe(`opt-out status on a Mixpanel instance`, function() {
  let mixpanel, utils, gdpr;

  // registered before jsdomSetup so it runs before the jsdom window is torn down
  afterEach(function() {
    sinon.restore();
  });

  jsdomSetup({
    beforeCallback: () => {
      // every src module must bind to this test's jsdom window and start with a fresh localStorage probe
      Object.keys(require.cache)
        .filter(modulePath => modulePath.startsWith(SRC_DIR))
        .forEach(modulePath => delete require.cache[modulePath]);
      const {init_as_module} = require(`../../src/mixpanel-core`);
      const {loadNoop} = require(`../../src/loaders/bundle-loaders`);
      mixpanel = init_as_module(loadNoop);
      utils = require(`../../src/utils`);
      gdpr = require(`../../src/opt-out-flag`);
      window.localStorage.clear();
    },
  });

  function initInstance() {
    return mixpanel.init(TOKEN, {
      opt_out_tracking_persistence_type: `localStorage`,
      batch_requests: false,
    }, `gdpr_instance`);
  }

  function makeLocalStorageWritesFail() {
    sinon.stub(window.Storage.prototype, `setItem`).throws(new Error(`QuotaExceededError`));
    utils.localStorageSupported(window.localStorage, true);
  }

  function expectOptedOut(instance, expected) {
    const callback = sinon.spy();
    instance.track(`event`, {}, callback);

    expect(instance.has_opted_out_tracking()).to.equal(expected);
    expect(callback.calledWith(0)).to.equal(expected);
  }

  it(`should keep persistence off after an opt-out when the config changes`, function() {
    const instance = mixpanel.init(TOKEN, {
      persistence: `localStorage`,
      opt_out_tracking_persistence_type: `localStorage`,
      batch_requests: false,
    }, `gdpr_instance`);
    instance.opt_out_tracking();

    instance.set_config({debug: false});

    expect(window.localStorage.getItem(`mp_${TOKEN}_mixpanel`)).to.equal(null);
  });

  it(`should be opted out everywhere if localStorage rejects writes but holds an opt-out`, function() {
    const instance = initInstance();
    gdpr.optOut(TOKEN, {persistenceType: `localStorage`});
    makeLocalStorageWritesFail();

    expectOptedOut(instance, true);
  });

  it(`should be opted out everywhere if localStorage rejects writes and opt_out_tracking() writes the cookie`, function() {
    const instance = initInstance();
    gdpr.optIn(TOKEN, {persistenceType: `localStorage`});
    makeLocalStorageWritesFail();
    instance.opt_out_tracking();

    expect(document.cookie).to.contain(`__mp_opt_in_out_${TOKEN}=0`);
    expectOptedOut(instance, true);
  });
});
