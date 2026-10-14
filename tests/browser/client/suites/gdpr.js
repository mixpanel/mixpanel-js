/* global chai, sinon */

const { expect } = chai;
import { randName, clearAllLibInstances, clearMixpanelCookies } from "../utils";

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
}
