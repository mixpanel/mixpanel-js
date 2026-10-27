/* global chai, sinon */

const { expect } = chai;
import { randName, clearAllLibInstances, clearAllStorage, clearLibInstance, clearMixpanelCookies, getXhrRequestData } from "../utils";

export function gdprTests(mixpanel) {
  describe(`opt-out status`, function() {
    let token, optInOutKey;

    beforeEach(() => {
      token = randName();
      optInOutKey = `__mp_opt_in_out_${token}`;
    });

    afterEach(async () => {
      await clearAllLibInstances(mixpanel);
      localStorage.removeItem(optInOutKey);
      clearMixpanelCookies();
    });

    function initInstance() {
      mixpanel.init(token, {
        opt_out_tracking_persistence_type: `localStorage`,
        batch_requests: false,
      }, `gdprtest`);
      return mixpanel.gdprtest;
    }

    function expectOptedOut(instance, expected) {
      const callback = sinon.spy();
      instance.track(`event`, {}, callback);

      expect(instance.has_opted_out_tracking()).to.equal(expected);
      expect(callback.calledWith(0)).to.equal(expected);
    }

    it(`is opted out everywhere if the opt-out is only in a cookie`, () => {
      const instance = initInstance();
      document.cookie = `${optInOutKey}=0; path=/`;

      expectOptedOut(instance, true);
    });

    it(`is opted in everywhere if localStorage holds an opt-in over a cookie opt-out`, () => {
      const instance = initInstance();
      document.cookie = `${optInOutKey}=0; path=/`;
      localStorage.setItem(optInOutKey, `1`);

      expectOptedOut(instance, false);
    });

    it(`moves a cookie opt-out into localStorage on init`, () => {
      document.cookie = `${optInOutKey}=0; path=/`;
      const instance = initInstance();

      expect(localStorage.getItem(optInOutKey)).to.equal(`0`);
      expect(document.cookie).to.not.contain(optInOutKey);
      expectOptedOut(instance, true);
    });

    it(`moves a cookie opt-in into localStorage on init`, () => {
      document.cookie = `${optInOutKey}=1; path=/`;
      const instance = initInstance();

      expect(localStorage.getItem(optInOutKey)).to.equal(`1`);
      expect(document.cookie).to.not.contain(optInOutKey);
      expect(instance.has_opted_in_tracking()).to.equal(true);
      expectOptedOut(instance, false);
    });
  });

  describe(`opt-in and opt-out of tracking and people updates`, function() {
    const CUSTOM_COOKIE_PREFIX = `𝓶𝓶𝓶𝓬𝓸𝓸𝓴𝓲𝓮𝓼`;
    const METHODS = [
      [`track`, [`event_name`, {prop: `value`}]],
      [`set`, [`prop_name`, `prop_value`]],
      [`set_once`, [`prop_name`, `prop_value`]],
      [`increment`, [`prop_name`, 1]],
      [`append`, [`prop_name`, `prop_value`]],
      [`union`, [`prop_name`, `prop_value`]],
    ];
    let token;

    beforeEach(async () => {
      token = randName();
      await clearAllStorage();
    });

    afterEach(async () => {
      sinon.restore();
      await clearAllLibInstances(mixpanel);
      clearMixpanelCookies();
    });

    function initInstance(config) {
      mixpanel.init(token, Object.assign({}, config, {batch_requests: false}), `gdprtest`);
      return mixpanel.gdprtest;
    }

    async function decideAndClear(config, decide) {
      const instance = initInstance(config);
      decide(instance);
      await clearLibInstance(mixpanel, instance, /* clear_opt_in_out */ false);
    }

    // the requests the setup makes, recorded without sending them
    function recordXhrRequests(func) {
      const fakeXhr = sinon.useFakeXMLHttpRequest();
      const requests = [];
      fakeXhr.onCreate = request => requests.push(request);
      try {
        func();
      } finally {
        fakeXhr.restore();
      }
      return requests;
    }

    function scenariosFor(persistenceType) {
      const config = {opt_out_tracking_persistence_type: persistenceType};
      const optOutByDefault = {opt_out_tracking_by_default: true, opt_out_tracking_persistence_type: persistenceType};
      return [
        {title: `is enabled by opt-in`, optedIn: true, config,
          postInit: instance => instance.opt_in_tracking()},
        {title: `is disabled by opt-out`, optedIn: false, userCleared: true, config,
          postInit: instance => instance.opt_out_tracking()},
        {title: `is disabled by opt-out without clearing user data when delete_user is false`, optedIn: false, config,
          postInit: instance => instance.opt_out_tracking({delete_user: false})},
        {title: `is disabled by opt-in followed by opt-out`, optedIn: false, userCleared: true, config,
          postInit: instance => {
            instance.opt_in_tracking();
            instance.opt_out_tracking();
          }},
        {title: `is enabled by opt-out followed by opt-in`, optedIn: true, userCleared: true, config,
          postInit: instance => {
            instance.opt_out_tracking();
            instance.opt_in_tracking();
          }},
        {title: `is enabled with an opt-in cookie and opt-out as default`, optedIn: true, config: optOutByDefault,
          preInit: () => decideAndClear({opt_out_tracking_persistence_type: `cookie`}, instance => instance.opt_in_tracking())},
        {title: `is disabled by opt-out as default`, optedIn: false, config: optOutByDefault},
        {title: `is enabled by opt-out as default followed by opt-in`, optedIn: true, config: optOutByDefault,
          postInit: instance => instance.opt_in_tracking()},
        {title: `is disabled by the mp_optout cookie`, optedIn: false, config,
          preInit: () => {
            document.cookie = `mp_optout=1; path=/`;
          }},
        {title: `is enabled by the mp_optout cookie followed by opt-in`, optedIn: true, config,
          preInit: () => {
            document.cookie = `mp_optout=1; path=/`;
          },
          postInit: instance => instance.opt_in_tracking()},
        {title: `is enabled by opt-in with a custom cookie prefix passed as an option`, optedIn: true,
          postInit: instance => instance.opt_in_tracking({cookie_prefix: CUSTOM_COOKIE_PREFIX})},
        {title: `is not disabled by opt-out with a custom cookie prefix passed as an option`, optedIn: true, userCleared: true, config,
          postInit: instance => instance.opt_out_tracking({cookie_prefix: CUSTOM_COOKIE_PREFIX})},
        {title: `is enabled by opt-in with a custom cookie prefix in the config`, optedIn: true,
          config: {opt_out_tracking_cookie_prefix: CUSTOM_COOKIE_PREFIX, opt_out_tracking_persistence_type: persistenceType},
          postInit: instance => instance.opt_in_tracking()},
        {title: `is enabled by ignore_dnt despite navigator.doNotTrack="1"`, optedIn: true,
          config: {ignore_dnt: true, window: {navigator: {doNotTrack: `1`}}}},
        {title: `is disabled by navigator.doNotTrack="1"`, optedIn: false,
          config: {window: {navigator: {doNotTrack: `1`}}}},
        {title: `is disabled by legacy Firefox navigator.doNotTrack="yes"`, optedIn: false,
          config: {window: {navigator: {doNotTrack: `yes`}}}},
        {title: `is disabled by legacy Safari window.doNotTrack="1"`, optedIn: false,
          config: {window: {doNotTrack: `1`}}},
        {title: `is disabled by legacy MSIE navigator.msDoNotTrack="1"`, optedIn: false,
          config: {window: {navigator: {msDoNotTrack: `1`}}}},
      ];
    }

    const UPGRADE_SCENARIOS = [
      {title: `is enabled by an opt-in cookie upgraded to localStorage`, optedIn: true,
        config: {opt_out_tracking_persistence_type: `localStorage`},
        preInit: () => decideAndClear({opt_out_tracking_persistence_type: `cookie`}, instance => instance.opt_in_tracking())},
      {title: `is disabled by an opt-out cookie upgraded to localStorage`, optedIn: false,
        config: {opt_out_tracking_persistence_type: `localStorage`},
        preInit: () => decideAndClear({opt_out_tracking_persistence_type: `cookie`}, instance => instance.opt_out_tracking())},
    ];

    METHODS.forEach(([method, args]) => describe(method, function() {
      const scenarios = scenariosFor(`cookie`).map(scenario => Object.assign({persistenceType: `cookie`}, scenario))
        .concat(scenariosFor(`localStorage`).map(scenario => Object.assign({persistenceType: `localStorage`}, scenario)))
        .concat(UPGRADE_SCENARIOS);

      scenarios.forEach(scenario => {
        const title = scenario.persistenceType ? `${scenario.title}, with ${scenario.persistenceType} opt-out persistence` : scenario.title;
        it(title, async () => {
          if (scenario.preInit) {
            await scenario.preInit();
          }
          const instance = initInstance(scenario.config || {});
          instance.identify(randName());
          const requests = recordXhrRequests(() => (scenario.postInit || (() => {}))(instance));

          const target = instance[method] ? instance : instance.people;
          const response = await new Promise(resolve => target[method].apply(target, args.concat(resolve)));

          expect(response).to.equal(scenario.optedIn ? 1 : 0);
          const engageRequests = requests.filter(request => request.url.indexOf(`/engage/`) >= 0);
          if (scenario.userCleared) {
            expect(getXhrRequestData(engageRequests[0], [`$delete`]), `delete_user request`).to.exist;
            expect(getXhrRequestData(engageRequests[1], [`$set`, `$transactions`]), `clear_charges request`).to.deep.equal([]);
          } else {
            expect(engageRequests).to.have.lengthOf(0);
          }
        });
      });
    }));
  });

  describe(`persistence on opt-in and opt-out`, function() {
    let token;

    beforeEach(async () => {
      token = randName();
      await clearAllStorage();
    });

    afterEach(async () => {
      await clearAllLibInstances(mixpanel);
      clearMixpanelCookies();
    });

    [`cookie`, `localStorage`].forEach(persistence => [`cookie`, `localStorage`].forEach(optOutPersistence => {
      describe(`${persistence} persistence, opt-out stored in ${optOutPersistence}`, function() {
        function initInstance(config) {
          mixpanel.init(token, Object.assign({
            persistence,
            opt_out_tracking_persistence_type: optOutPersistence,
          }, config), `gdprtest`);
          return mixpanel.gdprtest;
        }

        function isStored(instance) {
          const name = instance.persistence.name;
          if (persistence === `localStorage`) {
            return !!localStorage.getItem(name);
          }
          return document.cookie.split(`;`).some(cookie => cookie.trim().startsWith(name + `=`));
        }

        async function initAfter(decide) {
          const instance = initInstance();
          decide(instance);
          await clearLibInstance(mixpanel, instance, /* clear_opt_in_out */ false);
          return initInstance();
        }

        it(`stores the props on init when undecided`, () => {
          expect(isStored(initInstance())).to.equal(true);
        });

        it(`stores nothing on init after an opt-out`, async () => {
          const instance = await initAfter(lib => lib.opt_out_tracking());
          expect(isStored(instance)).to.equal(false);
        });

        it(`stores the props on init after an opt-in`, async () => {
          const instance = await initAfter(lib => lib.opt_in_tracking());
          expect(isStored(instance)).to.equal(true);
        });

        it(`removes the props on opt-out and stores them again on opt-in`, () => {
          const instance = initInstance();
          expect(isStored(instance)).to.equal(true);
          instance.opt_out_tracking();
          expect(isStored(instance)).to.equal(false);
          instance.opt_in_tracking();
          expect(isStored(instance)).to.equal(true);
        });

        it(`keeps the props on opt-out with clear_persistence false`, () => {
          const instance = initInstance();
          instance.opt_out_tracking({clear_persistence: false});
          expect(isStored(instance)).to.equal(true);
          instance.opt_in_tracking();
          expect(isStored(instance)).to.equal(true);
        });

        it(`stores nothing on opt-in with enable_persistence false`, () => {
          const instance = initInstance();
          expect(isStored(instance)).to.equal(true);
          instance.opt_out_tracking();
          expect(isStored(instance)).to.equal(false);
          instance.opt_in_tracking({enable_persistence: false});
          expect(isStored(instance)).to.equal(false);
        });

        it(`keeps the props under opt-out as default until an opt-out`, () => {
          const instance = initInstance({opt_out_tracking_by_default: true});
          expect(isStored(instance)).to.equal(true);
          instance.opt_in_tracking();
          expect(isStored(instance)).to.equal(true);
          instance.opt_out_tracking();
          expect(isStored(instance)).to.equal(false);
        });

        it(`stores nothing under opt-out of tracking and persistence as default until an opt-in`, () => {
          const instance = initInstance({opt_out_tracking_by_default: true, opt_out_persistence_by_default: true});
          expect(isStored(instance)).to.equal(false);
          instance.opt_in_tracking();
          expect(isStored(instance)).to.equal(true);
          instance.opt_out_tracking();
          expect(isStored(instance)).to.equal(false);
        });

        it(`keeps the props under the mp_optout cookie until an opt-out`, () => {
          document.cookie = `mp_optout=1; path=/`;
          const instance = initInstance();
          expect(isStored(instance)).to.equal(true);
          instance.opt_in_tracking();
          expect(isStored(instance)).to.equal(true);
          instance.opt_out_tracking();
          expect(isStored(instance)).to.equal(false);
        });
      });
    }));
  });
}
