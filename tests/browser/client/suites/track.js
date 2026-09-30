/* global chai */

const { expect } = chai;
import { randName, containsObj, clearAllLibInstances } from "../utils";

export function trackTests(mixpanel) {
  describe(`track`, function() {
    let token;
    beforeEach(() => {
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

    it(`runs on_track hooks with merged properties, and applies their changes`, () => {
      const observed = [];
      mixpanel.test.register({super_prop: `from superprops`});
      mixpanel.test.add_hook(`on_track`, (eventName, properties) => {
        observed.push({eventName, properties});
        return [eventName, Object.assign({}, properties, {added_by_hook: true})];
      });

      const data = mixpanel.test.track(`testing`, {foo: `bar`});

      expect(observed).to.have.lengthOf(1);
      expect(observed[0].eventName).to.equal(`testing`);
      expect(observed[0].properties).to.include({
        foo: `bar`,
        super_prop: `from superprops`,
        token,
        distinct_id: data.properties.distinct_id,
      });
      expect(data.properties.added_by_hook).to.equal(true, `hook changes reach the outbound payload`);
    });

    it(`runs on_track hooks for $identify`, () => {
      const observed = [];
      mixpanel.test.add_hook(`on_track`, (eventName, properties) => {
        observed.push({eventName, properties});
        return [eventName, properties];
      });
      const anonId = mixpanel.test.get_distinct_id();
      const newId = randName();

      mixpanel.test.identify(newId);

      const identify = observed.find((o) => o.eventName === `$identify`);
      expect(identify, `$identify is observed`).to.not.equal(undefined);
      expect(identify.properties).to.include({distinct_id: newId, $anon_distinct_id: anonId});
    });
  });

  describe(`enable`, function() {
    beforeEach(() => {
      mixpanel.init(randName(), {
        batch_requests: false,
        debug: true
      }, `test`);
    });

    afterEach(async () => {
      await clearAllLibInstances(mixpanel);
    });

    it(`enables all event tracking`, () => {
      mixpanel.test.disable();
      mixpanel.test.track(`event_a`, {}, function(response) {
        expect(response).to.equal(0, `track should return an error`);
      });

      mixpanel.test.track(`event_b`, {}, function(response) {
        expect(response).to.equal(0, `track should return an error`);
      });

      mixpanel.test.enable();
      mixpanel.test.track(`event_a`, {}, function(response) {
        expect(response).to.equal(1, `track should be successful`);
      });

      mixpanel.test.track(`event_b`, {}, function(response) {
        expect(response).to.equal(1, `track should be successful`);
      });
    });

    it(`enables individual events passed as an array param`, () => {
      mixpanel.test.disable([`event_a`]);
      mixpanel.test.disable([`event_c`]);

      mixpanel.test.track(`event_a`, {}, function(response) {
        expect(response).to.equal(0, `track should return an error`);
      });

      mixpanel.test.track(`event_b`, {}, function(response) {
        expect(response).to.equal(1, `track should be successful`);
      });

      mixpanel.test.track(`event_c`, {}, function(response) {
        expect(response).to.equal(0, `track should return an error`);
      });

      mixpanel.test.enable([`event_c`]);

      mixpanel.test.track(`event_a`, {}, function(response) {
        expect(response).to.equal(0, `track should still return an error`);
      });

      mixpanel.test.track(`event_b`, {}, function(response) {
        expect(response).to.equal(1, `track should be successful`);
      });

      mixpanel.test.track(`event_c`, {}, function(response) {
        expect(response).to.equal(1, `track should now be successful`);
      });
    });
  });
}
