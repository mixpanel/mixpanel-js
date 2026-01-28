/* global chai */

const { expect } = chai;
import { randName, containsObj, clearAllLibInstances } from "../utils";

export function trackTests(mixpanel) {
  describe(`track`, function() {
    let token;
    beforeEach(async () => {
      token = randName();
      mixpanel.init(token, {
        batch_requests: false,
        debug: true
      }, `test`);
    });

    afterEach(async () => {
      await clearAllLibInstances(mixpanel);
    });

    it(`invokes the callback`, async () => {
      const callbackArg = await new Promise((resolve) => {
        mixpanel.test.track(`test event`, {}, resolve);
      });

      expect(callbackArg).to.equal(1, `invokes callback with 1 for success`);
    });

    it(`preserves property names during minify`, async () => {
      const props = {};
      const letters = `abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ`;

      for (const l1 of letters) {
        for (const l2 of letters) {
          const pair = l1 + l2;
          props[pair] = pair;
        }
      }

      const expectedProps = Object.assign(props, {token});
      const trackResult = mixpanel.test.track(`test`, props);

      expect(containsObj(trackResult.properties, expectedProps)).to.equal(true, `Nothing strange happened to properties`);
    });
  });
}
