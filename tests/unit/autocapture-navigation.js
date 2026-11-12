/*
 * Integration guard: the location-change detection extracted into src/navigation.js
 * still drives autocapture's SPA pageview re-firing. Autocapture subscribes to the
 * EV_MP_LOCATION_CHANGE event that ensureLocationChangeListeners() dispatches.
 */
import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import jsdom from 'jsdom-global';

chai.use(sinonChai);

describe(`autocapture SPA pageview via shared navigation detector`, function () {
  let mixpanel;
  let teardown;

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
    teardown = jsdom(``, { url: `http://localhost/start` });
  });

  afterEach(function () {
    mixpanel = null;
    teardown();
    sinon.restore();
  });

  it(`re-fires a pageview on history.pushState when track_pageview is enabled`, function () {
    mixpanel = loadFreshMixpanel();
    // 'full-url' mode re-fires on any URL change (a boolean true only fires the
    // initial on-load pageview).
    mixpanel.init(`test-token`, { track_pageview: `full-url`, batch_requests: false });

    // Spy after the initial on-load pageview so we isolate the navigation-driven one.
    const spy = sinon.spy(mixpanel, `track_pageview`);
    global.window.history.pushState({}, ``, `/next`);

    expect(spy).to.have.been.called;
  });
});
