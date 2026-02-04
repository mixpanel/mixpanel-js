/* global chai, sinon */

const { expect } = chai;
import { clearAllLibInstances, clearAllStorage, untilDone } from "../utils";

export function flagsTests(mixpanel) {
  describe(`feature flags`, function() {
    let token;

    beforeEach(async () => {
      token = `TARGET_TEST_${Math.random().toString(36).substring(7)}`;
      await clearAllStorage();
    });

    afterEach(async () => {
      await clearAllLibInstances(mixpanel);
    });

    // SECTION 1: Targeting Loader (3 tests)
    describe(`targeting loader`, function() {
      it(`successfully loads targeting bundle`, async function() {
        await new Promise((resolve) => {
          mixpanel.init(token, {
            flags: true,
            targeting_src: `./static/build/mixpanel-targeting.js`,
            debug: true,
            loaded: resolve
          }, `test`);
        });

        const flagsManager = mixpanel.test.flags;
        if (!flagsManager) {
          throw new Error(`Flags not initialized - ensure flags: true in config`);
        }

        // Trigger targeting load
        flagsManager.getTargeting();

        // Verify promise exists
        expect(window[`__mp_targeting`]).to.exist;
        expect(window[`__mp_targeting`].then).to.be.a(`function`);

        // Wait for bundle to load
        const library = await window[`__mp_targeting`];
        expect(library).to.exist;
        expect(library.eventMatchesCriteria).to.be.a(`function`);
      });

      it(`does not load script twice when called multiple times`, async function() {
        await new Promise((resolve) => {
          mixpanel.init(token, {
            flags: true,
            targeting_src: `./static/build/mixpanel-targeting.js`,
            debug: true,
            loaded: resolve
          }, `test`);
        });

        const flagsManager = mixpanel.test.flags;

        // Trigger load multiple times
        flagsManager.getTargeting();
        flagsManager.getTargeting();
        flagsManager.getTargeting();

        await window[`__mp_targeting`];

        // Count script tags with targeting bundle
        const scripts = document.querySelectorAll(`script[src*="mixpanel-targeting"]`);
        expect(scripts.length).to.be.at.most(1);
      });

      it(`returns promise-based API`, async function() {
        await new Promise((resolve) => {
          mixpanel.init(token, {
            flags: true,
            targeting_src: `./static/build/mixpanel-targeting.js`,
            debug: true,
            loaded: resolve
          }, `test`);
        });

        const flagsManager = mixpanel.test.flags;
        const result = flagsManager.getTargeting();

        // Verify it's a promise
        expect(result).to.exist;
        expect(result.then).to.be.a(`function`);

        const library = await result;
        expect(library.eventMatchesCriteria).to.be.a(`function`);
      });
    });

    // SECTION 2: First-Time Event Targeting (7 tests)
    describe(`first-time event targeting`, function() {
      let fetchStub, fetchRequests;

      beforeEach(() => {
        fetchRequests = [];
        fetchStub = sinon.stub(window, `fetch`).callsFake((url, options) => {
          // Store request for test assertions
          fetchRequests.push({ url, options });
          // Return a never-resolving promise by default
          return new Promise(() => {});
        });
      });

      afterEach(() => {
        sinon.restore();
      });

      it(`switches flag variant when event matches numeric property filter`, async function() {
        // Setup fetch response
        fetchStub.callsFake((url, options) => {
          fetchRequests.push({ url, options });
          if (url.includes(`/flags`)) {
            return Promise.resolve({
              ok: true,
              json: () => Promise.resolve({
                flags: {
                  'premium-feature': {
                    variant_key: `control`,
                    variant_value: false
                  }
                },
                pending_first_time_events: [{
                  flag_key: `premium-feature`,
                  flag_id: 123,
                  project_id: 456,
                  first_time_event_hash: `abc123`,
                  event_name: `purchase`,
                  property_filters: { '>': [{'var': 'properties.price'}, 100] },
                  pending_variant: {
                    variant_key: `treatment`,
                    variant_value: true
                  }
                }]
              })
            });
          }
          return new Promise(() => {});
        });

        await new Promise((resolve) => {
          mixpanel.init(token, {
            flags: true,
            targeting_src: `./static/build/mixpanel-targeting.js`,
            debug: true,
            loaded: resolve
          }, `test`);
        });

        // Wait for flags request
        await untilDone(() => fetchRequests.length > 0, 5000);

        // Initial flag value should be control
        let flagValue = mixpanel.test.flags.get_variant_value_sync(`premium-feature`);
        expect(flagValue).to.equal(false);

        // Track matching event (price > 100)
        mixpanel.test.track(`purchase`, { price: 150 });

        // Wait for flag to potentially activate
        await new Promise(resolve => setTimeout(resolve, 500));

        // Flag should switch to treatment variant
        flagValue = mixpanel.test.flags.get_variant_value_sync(`premium-feature`);
        expect(flagValue).to.equal(true);
      });

      it(`does not switch variant when event doesn't match property filter`, async function() {
        // Setup fetch response
        fetchStub.callsFake((url, options) => {
          fetchRequests.push({ url, options });
          if (url.includes(`/flags`)) {
            return Promise.resolve({
              ok: true,
              json: () => Promise.resolve({
                flags: {
                  'premium-feature': {
                    variant_key: `control`,
                    variant_value: false
                  }
                },
                pending_first_time_events: [{
                  flag_key: `premium-feature`,
                  flag_id: 123,
                  project_id: 456,
                  first_time_event_hash: `abc123`,
                  event_name: `purchase`,
                  property_filters: { '>': [{'var': 'properties.price'}, 100] },
                  pending_variant: {
                    variant_key: `treatment`,
                    variant_value: true
                  }
                }]
              })
            });
          }
          return new Promise(() => {});
        });

        await new Promise((resolve) => {
          mixpanel.init(token, {
            flags: true,
            targeting_src: `./static/build/mixpanel-targeting.js`,
            debug: true,
            loaded: resolve
          }, `test`);
        });

        await untilDone(() => fetchRequests.length > 0, 5000);

        // Track non-matching event (price < 100)
        mixpanel.test.track(`purchase`, { price: 50 });

        await new Promise(resolve => setTimeout(resolve, 500));

        // Flag should remain control
        const flagValue = mixpanel.test.flags.get_variant_value_sync(`premium-feature`);
        expect(flagValue).to.equal(false);
      });

      it(`switches variant with string property filter`, async function() {
        fetchStub.callsFake((url, options) => {
          fetchRequests.push({ url, options });
          if (url.includes(`/flags`)) {
            return Promise.resolve({
              ok: true,
              json: () => Promise.resolve({
                flags: {
                  'region-feature': {
                    variant_key: `control`,
                    variant_value: `default`
                  }
                },
                pending_first_time_events: [{
                  flag_key: `region-feature`,
                  flag_id: 789,
                  project_id: 456,
                  first_time_event_hash: `xyz789`,
                  event_name: `page_view`,
                  property_filters: { '==': [{'var': 'properties.country'}, 'US'] },
                  pending_variant: {
                    variant_key: `treatment`,
                    variant_value: `us-version`
                  }
                }]
              })
            });
          }
          return new Promise(() => {});
        });

        await new Promise((resolve) => {
          mixpanel.init(token, {
            flags: true,
            targeting_src: `./static/build/mixpanel-targeting.js`,
            debug: true,
            loaded: resolve
          }, `test`);
        });

        await untilDone(() => fetchRequests.length > 0, 5000);

        // Track matching event with country = 'US'
        mixpanel.test.track(`page_view`, { country: 'US' });

        await new Promise(resolve => setTimeout(resolve, 500));

        // Flag should switch to treatment variant
        const flagValue = mixpanel.test.flags.get_variant_value_sync(`region-feature`);
        expect(flagValue).to.equal(`us-version`);
      });

      it(`evaluates complex property filter with multiple conditions`, async function() {
        fetchStub.callsFake((url, options) => {
          fetchRequests.push({ url, options });
          if (url.includes(`/flags`)) {
            return Promise.resolve({
              ok: true,
              json: () => Promise.resolve({
                flags: {
                  'complex-feature': {
                    variant_key: `control`,
                    variant_value: false
                  }
                },
                pending_first_time_events: [{
                  flag_key: `complex-feature`,
                  flag_id: 999,
                  project_id: 456,
                  first_time_event_hash: `complex123`,
                  event_name: `checkout`,
                  // AND condition: price > 100 AND country == 'US'
                  property_filters: {
                    'and': [
                      { '>': [{'var': 'properties.price'}, 100] },
                      { '==': [{'var': 'properties.country'}, 'US'] }
                    ]
                  },
                  pending_variant: {
                    variant_key: `treatment`,
                    variant_value: true
                  }
                }]
              })
            });
          }
          return new Promise(() => {});
        });

        await new Promise((resolve) => {
          mixpanel.init(token, {
            flags: true,
            targeting_src: `./static/build/mixpanel-targeting.js`,
            debug: true,
            loaded: resolve
          }, `test`);
        });

        await untilDone(() => fetchRequests.length > 0, 5000);

        // Track event matching both conditions
        mixpanel.test.track(`checkout`, { price: 150, country: 'US' });

        await new Promise(resolve => setTimeout(resolve, 500));

        // Flag should switch to treatment
        const flagValue = mixpanel.test.flags.get_variant_value_sync(`complex-feature`);
        expect(flagValue).to.equal(true);
      });

      it(`handles multiple flags with different first-time events independently`, async function() {
        fetchStub.callsFake((url, options) => {
          fetchRequests.push({ url, options });
          if (url.includes(`/flags`)) {
            return Promise.resolve({
              ok: true,
              json: () => Promise.resolve({
                flags: {
                  'flag-a': { variant_key: `control`, variant_value: false },
                  'flag-b': { variant_key: `control`, variant_value: false }
                },
                pending_first_time_events: [
                  {
                    flag_key: `flag-a`,
                    flag_id: 1,
                    project_id: 456,
                    first_time_event_hash: `hash_a`,
                    event_name: `purchase`,
                    property_filters: { '>': [{'var': 'properties.price'}, 100] },
                    pending_variant: { variant_key: `treatment`, variant_value: true }
                  },
                  {
                    flag_key: `flag-b`,
                    flag_id: 2,
                    project_id: 456,
                    first_time_event_hash: `hash_b`,
                    event_name: `signup`,
                    property_filters: null,
                    pending_variant: { variant_key: `treatment`, variant_value: true }
                  }
                ]
              })
            });
          }
          return new Promise(() => {});
        });

        await new Promise((resolve) => {
          mixpanel.init(token, {
            flags: true,
            targeting_src: `./static/build/mixpanel-targeting.js`,
            debug: true,
            loaded: resolve
          }, `test`);
        });

        await untilDone(() => fetchRequests.length > 0, 5000);

        // Track event matching only flag-a
        mixpanel.test.track(`purchase`, { price: 150 });

        await new Promise(resolve => setTimeout(resolve, 500));

        // Flag A should switch, Flag B should remain control
        expect(mixpanel.test.flags.get_variant_value_sync(`flag-a`)).to.equal(true);
        expect(mixpanel.test.flags.get_variant_value_sync(`flag-b`)).to.equal(false);

        // Now track event matching flag-b
        mixpanel.test.track(`signup`);

        await new Promise(resolve => setTimeout(resolve, 500));

        // Both flags should now be treatment
        expect(mixpanel.test.flags.get_variant_value_sync(`flag-a`)).to.equal(true);
        expect(mixpanel.test.flags.get_variant_value_sync(`flag-b`)).to.equal(true);
      });

      it(`flags without property filters work when targeting fails to load`, async function() {
        fetchStub.callsFake((url, options) => {
          fetchRequests.push({ url, options });
          if (url.includes(`/flags`)) {
            return Promise.resolve({
              ok: true,
              json: () => Promise.resolve({
                flags: {
                  'simple-flag': {
                    variant_key: `control`,
                    variant_value: false
                  }
                },
                pending_first_time_events: [{
                  flag_key: `simple-flag`,
                  flag_id: 555,
                  project_id: 456,
                  first_time_event_hash: `simple123`,
                  event_name: `simple_event`,
                  property_filters: null, // No property filters
                  pending_variant: {
                    variant_key: `treatment`,
                    variant_value: true
                  }
                }]
              })
            });
          }
          return new Promise(() => {});
        });

        await new Promise((resolve) => {
          mixpanel.init(token, {
            flags: true,
            targeting_src: `/nonexistent/path/targeting.js`, // Will fail to load
            debug: true,
            loaded: resolve
          }, `test`);
        });

        await untilDone(() => fetchRequests.length > 0, 5000);

        // Wait a bit for targeting to fail
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Track the simple event (no property filter needed)
        mixpanel.test.track(`simple_event`);

        await new Promise(resolve => setTimeout(resolve, 500));

        // Flag should still switch even though targeting failed
        const flagValue = mixpanel.test.flags.get_variant_value_sync(`simple-flag`);
        expect(flagValue).to.equal(true);
      });

      it(`automatically loads targeting bundle when flag needs property evaluation`, async function() {
        fetchStub.callsFake((url, options) => {
          fetchRequests.push({ url, options });
          if (url.includes(`/flags`)) {
            return Promise.resolve({
              ok: true,
              json: () => Promise.resolve({
                flags: {
                  'auto-load-flag': {
                    variant_key: `control`,
                    variant_value: false
                  }
                },
                pending_first_time_events: [{
                  flag_key: `auto-load-flag`,
                  flag_id: 777,
                  project_id: 456,
                  first_time_event_hash: `auto123`,
                  event_name: `test_event`,
                  property_filters: { '>': [{'var': 'properties.value'}, 50] },
                  pending_variant: {
                    variant_key: `treatment`,
                    variant_value: true
                  }
                }]
              })
            });
          }
          return new Promise(() => {});
        });

        await new Promise((resolve) => {
          mixpanel.init(token, {
            flags: true,
            targeting_src: `./static/build/mixpanel-targeting.js`,
            debug: true,
            loaded: resolve
          }, `test`);
        });

        // Wait for flags to load
        await untilDone(() => fetchRequests.length > 0, 5000);

        // Targeting should load automatically because flag has property_filters
        await untilDone(() => window[`__mp_targeting`], 5000);

        // Verify targeting library loaded
        expect(window[`__mp_targeting`]).to.exist;

        const library = await window[`__mp_targeting`];
        expect(library).to.exist;
        expect(library.eventMatchesCriteria).to.be.a(`function`);

        // Verify it works for property evaluation
        mixpanel.test.track(`test_event`, { value: 100 });

        await new Promise(resolve => setTimeout(resolve, 500));

        const flagValue = mixpanel.test.flags.get_variant_value_sync(`auto-load-flag`);
        expect(flagValue).to.equal(true);
      });
    });
  });
}
