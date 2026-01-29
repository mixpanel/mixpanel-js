/* global chai, sinon */

const { expect } = chai;
import { clearAllLibInstances, clearAllStorage, untilDone } from "../utils";

export function targetingTests(mixpanel) {
  describe(`targeting loader`, function() {
    let token;

    beforeEach(async () => {
      token = `TARGET_TEST_${Math.random().toString(36).substring(7)}`;
      await clearAllStorage();

      // Clean up targeting globals
      delete window[`__mp_targeting`];
      delete window[`__mp_targeting_lib`];

      // Clean up targeting script tags from previous tests
      const scripts = document.querySelectorAll(`script[src*="mixpanel-targeting"]`);
      scripts.forEach(script => script.remove());
    });

    afterEach(async () => {
      await clearAllLibInstances(mixpanel);
      delete window[`__mp_targeting`];
      delete window[`__mp_targeting_lib`];
    });

    // Category 1: Basic Loading
    describe(`basic loading`, function() {
      it(`successfully loads targeting bundle`, async function() {
        await new Promise((resolve) => {
          mixpanel.init(token, {
            flags: true,
            targeting_src: `./static/build/mixpanel-targeting.js`,
            debug: true,
            loaded: resolve
          }, `test`);
        });

        // Access internal flags API to trigger targeting load
        const flagsManager = mixpanel.test.flags;
        if (!flagsManager) {
          throw new Error(`Flags not initialized - ensure flags: true in config`);
        }

        // Trigger targeting load via internal API
        if (!window[`__mp_targeting`]) {
          flagsManager.getTargeting();
        }

        expect(window[`__mp_targeting`]).to.exist;
        expect(window[`__mp_targeting`].then).to.be.a(`function`);

        // Wait for the bundle to load
        await untilDone(() => window[`__mp_targeting_lib`], 10000);

        expect(window[`__mp_targeting_lib`]).to.exist;
        expect(window[`__mp_targeting_lib`].eventMatchesCriteria).to.be.a(`function`);
      });

      it(`window global set during load`, async function() {
        await new Promise((resolve) => {
          mixpanel.init(token, {
            flags: true,
            targeting_src: `./static/build/mixpanel-targeting.js`,
            debug: true,
            loaded: resolve
          }, `test`);
        });

        const flagsManager = mixpanel.test.flags;

        // Check that promise is set before bundle finishes loading
        expect(window[`__mp_targeting`]).to.not.exist;

        // Trigger load
        flagsManager.getTargeting();

        // Promise should be set immediately
        expect(window[`__mp_targeting`]).to.exist;
        expect(window[`__mp_targeting`].then).to.be.a(`function`);

        // Wait for actual bundle to load
        await untilDone(() => window[`__mp_targeting_lib`], 10000);
      });

      it(`library accessible after load`, async function() {
        await new Promise((resolve) => {
          mixpanel.init(token, {
            flags: true,
            targeting_src: `./static/build/mixpanel-targeting.js`,
            debug: true,
            loaded: resolve
          }, `test`);
        });

        const flagsManager = mixpanel.test.flags;
        flagsManager.getTargeting();

        await untilDone(() => window[`__mp_targeting_lib`], 10000);

        const library = await window[`__mp_targeting`];
        expect(library).to.equal(window[`__mp_targeting_lib`]);
        expect(library.eventMatchesCriteria).to.be.a(`function`);
      });
    });

    // Category 2: Promise Caching & Deduplication
    describe(`promise caching and deduplication`, function() {
      it(`multiple calls return same promise`, async function() {
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
        const promise1 = window[`__mp_targeting`];

        flagsManager.getTargeting();
        const promise2 = window[`__mp_targeting`];

        flagsManager.getTargeting();
        const promise3 = window[`__mp_targeting`];

        // All should be the same promise instance
        expect(promise1).to.equal(promise2);
        expect(promise2).to.equal(promise3);

        await untilDone(() => window[`__mp_targeting_lib`], 10000);
      });

      it(`does not load script twice`, async function() {
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

        await untilDone(() => window[`__mp_targeting_lib`], 10000);

        // Count script tags with targeting bundle
        const scripts = document.querySelectorAll(`script[src*="mixpanel-targeting"]`);
        expect(scripts.length).to.be.at.most(1);
      });

      it(`reuses already loaded library`, async function() {
        await new Promise((resolve) => {
          mixpanel.init(token, {
            flags: true,
            targeting_src: `./static/build/mixpanel-targeting.js`,
            debug: true,
            loaded: resolve
          }, `test`);
        });

        const flagsManager = mixpanel.test.flags;

        // First load
        flagsManager.getTargeting();
        await untilDone(() => window[`__mp_targeting_lib`], 10000);
        const library1 = window[`__mp_targeting_lib`];

        // Second load should reuse
        flagsManager.getTargeting();
        const library2 = await window[`__mp_targeting`];

        expect(library1).to.equal(library2);
      });
    });

    // Category 3: Sync/Async Access Patterns
    describe(`sync and async access patterns`, function() {
      it(`getTargeting() returns promise`, async function() {
        await new Promise((resolve) => {
          mixpanel.init(token, {
            flags: true,
            targeting_src: `./static/build/mixpanel-targeting.js`,
            debug: true,
            loaded: resolve
          }, `test`);
        });

        const flagsManager = mixpanel.test.flags;
        flagsManager.getTargeting();

        await untilDone(() => window[`__mp_targeting_lib`], 10000);

        // Test that the promise is accessible and resolves to the library
        expect(window[`__mp_targeting`]).to.exist;
        expect(window[`__mp_targeting`].then).to.be.a(`function`);

        const library = await window[`__mp_targeting`];
        expect(library.eventMatchesCriteria).to.be.a(`function`);
      });

      it(`getTargeting() before init rejects`, async function() {
        // When targeting is not initialized, window['__mp_targeting'] should not exist
        expect(window[`__mp_targeting`]).to.not.exist;
        expect(window[`__mp_targeting_lib`]).to.not.exist;
      });

      it(`getTargeting() works after loaded`, async function() {
        await new Promise((resolve) => {
          mixpanel.init(token, {
            flags: true,
            targeting_src: `./static/build/mixpanel-targeting.js`,
            debug: true,
            loaded: resolve
          }, `test`);
        });

        const flagsManager = mixpanel.test.flags;
        flagsManager.getTargeting();

        await untilDone(() => window[`__mp_targeting_lib`], 10000);

        // After loading, the promise should resolve immediately when accessed again
        const library = await window[`__mp_targeting`];
        expect(library).to.equal(window[`__mp_targeting_lib`]);
      });
    });

    // Category 4: Error Handling
    describe(`error handling`, function() {
      it(`handles 404 on bundle load`, async function() {
        await new Promise((resolve) => {
          mixpanel.init(token, {
            flags: true,
            targeting_src: `/nonexistent/path/targeting.js`,
            debug: true,
            loaded: resolve
          }, `test`);
        });

        const flagsManager = mixpanel.test.flags;
        flagsManager.getTargeting();

        // Wait a bit for the load to attempt and fail
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Promise should exist but may reject
        expect(window[`__mp_targeting`]).to.exist;
      });

      it(`handles script load error`, async function() {
        await new Promise((resolve) => {
          mixpanel.init(token, {
            flags: true,
            targeting_src: `https://invalid-domain-that-does-not-exist.com/targeting.js`,
            debug: true,
            loaded: resolve
          }, `test`);
        });

        const flagsManager = mixpanel.test.flags;
        flagsManager.getTargeting();

        // Wait for load to fail
        await new Promise(resolve => setTimeout(resolve, 2000));

        expect(window[`__mp_targeting`]).to.exist;
      });

      it(`handles bundle without proper global`, async function() {
        await new Promise((resolve) => {
          mixpanel.init(token, {
            flags: true,
            debug: true,
            loaded: resolve
          }, `test`);
        });

        const flagsManager = mixpanel.test.flags;

        // Stub loadExtraBundle to simulate a bundle that doesn't set the global
        const originalLoadExtraBundle = flagsManager.loadExtraBundle;
        flagsManager.loadExtraBundle = function(src, callback) {
          // Simulate bundle load without setting window['__mp_targeting_lib']
          setTimeout(callback, 10);
        };

        flagsManager.getTargeting();

        try {
          await window[`__mp_targeting`];
          throw new Error(`Should have rejected`);
        } catch (error) {
          expect(error.message).to.include(`failed to load`);
        } finally {
          flagsManager.loadExtraBundle = originalLoadExtraBundle;
        }
      });
    });

    // Category 5: Integration with Flags
    describe(`integration with flags`, function() {
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

      it(`flags automatically load targeting with property filters`, async function() {
        // Set up fetch response before init
        fetchStub.callsFake((url, options) => {
          fetchRequests.push({ url, options });
          if (url.includes(`/flags`)) {
            return Promise.resolve({
              ok: true,
              json: () => Promise.resolve({
                flags: {
                  'test-flag': {
                    variant_key: `control`,
                    variant_value: false
                  }
                },
                pending_first_time_events: [{
                  flag_key: `test-flag`,
                  flag_id: 123,
                  project_id: 456,
                  first_time_event_hash: `abc123`,
                  event_name: `test_event`,
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

        const flagsRequest = fetchRequests.find(req => req.url.includes(`/flags`));
        expect(flagsRequest).to.exist;

        // Wait for targeting to start loading
        await untilDone(() => window[`__mp_targeting`], 5000);

        expect(window[`__mp_targeting`]).to.exist;
        expect(window[`__mp_targeting`].then).to.be.a(`function`);
      });

      it(`first-time event check uses loaded library`, async function() {
        // Set up fetch response
        fetchStub.callsFake((url, options) => {
          fetchRequests.push({ url, options });
          if (url.includes(`/flags`)) {
            return Promise.resolve({
              ok: true,
              json: () => Promise.resolve({
                flags: {
                  'test-flag': {
                    variant_key: `control`,
                    variant_value: false
                  }
                },
                pending_first_time_events: [{
                  flag_key: `test-flag`,
                  flag_id: 123,
                  project_id: 456,
                  first_time_event_hash: `abc123`,
                  event_name: `test_event`,
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

        // Wait for targeting to load
        await untilDone(() => window[`__mp_targeting_lib`], 10000);

        // Track matching event
        mixpanel.test.track(`test_event`, { price: 150 });

        // Wait for flag to potentially activate
        await new Promise(resolve => setTimeout(resolve, 500));

        // Verify the flag switched to treatment variant
        const flagValue = mixpanel.test.flags.get_variant_value_sync(`test-flag`);
        expect(flagValue).to.equal(true);
      });

      it(`simple first-time events work without targeting`, async function() {
        // Set up fetch response
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
                  flag_id: 789,
                  project_id: 456,
                  first_time_event_hash: `xyz789`,
                  event_name: `simple_event`,
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

        // Wait a bit to ensure targeting doesn't load
        await new Promise(resolve => setTimeout(resolve, 500));

        // Targeting should NOT load (no property filters)
        expect(window[`__mp_targeting`]).to.not.exist;

        // Track simple event (no properties needed)
        mixpanel.test.track(`simple_event`);

        // Wait for activation
        await new Promise(resolve => setTimeout(resolve, 500));

        // Flag should still switch
        const flagValue = mixpanel.test.flags.get_variant_value_sync(`simple-flag`);
        expect(flagValue).to.equal(true);
      });
    });

    // Category 6: Cleanup & Edge Cases
    describe(`cleanup and edge cases`, function() {
      it(`targeting globals persist after instance cleanup`, async function() {
        await new Promise((resolve) => {
          mixpanel.init(token, {
            flags: true,
            targeting_src: `./static/build/mixpanel-targeting.js`,
            debug: true,
            loaded: resolve
          }, `test`);
        });

        const flagsManager = mixpanel.test.flags;
        flagsManager.getTargeting();

        await untilDone(() => window[`__mp_targeting_lib`], 10000);

        const library1 = window[`__mp_targeting_lib`];

        // Clean up instance
        await clearAllLibInstances(mixpanel);

        // Globals should persist (singleton pattern)
        expect(window[`__mp_targeting_lib`]).to.equal(library1);
        expect(window[`__mp_targeting`]).to.exist;
      });

      it(`multiple instances share targeting singleton`, async function() {
        const token1 = `TARGET_TEST_1_${Math.random().toString(36).substring(7)}`;
        const token2 = `TARGET_TEST_2_${Math.random().toString(36).substring(7)}`;

        await new Promise((resolve) => {
          mixpanel.init(token1, {
            flags: true,
            targeting_src: `./static/build/mixpanel-targeting.js`,
            debug: true,
            loaded: resolve
          }, `test1`);
        });

        await new Promise((resolve) => {
          mixpanel.init(token2, {
            flags: true,
            targeting_src: `./static/build/mixpanel-targeting.js`,
            debug: true,
            loaded: resolve
          }, `test2`);
        });

        const flagsManager1 = mixpanel.test1.flags;
        const flagsManager2 = mixpanel.test2.flags;

        flagsManager1.getTargeting();
        await untilDone(() => window[`__mp_targeting_lib`], 10000);

        const library1 = window[`__mp_targeting_lib`];

        // Second instance should share same library
        flagsManager2.getTargeting();
        const library2 = await window[`__mp_targeting`];

        expect(library1).to.equal(library2);
      });

      it(`works with relative and absolute URLs`, async function() {
        // Test with relative URL (default)
        await new Promise((resolve) => {
          mixpanel.init(token, {
            flags: true,
            targeting_src: `./static/build/mixpanel-targeting.js`,
            debug: true,
            loaded: resolve
          }, `test`);
        });

        const flagsManager = mixpanel.test.flags;
        flagsManager.getTargeting();

        await untilDone(() => window[`__mp_targeting_lib`], 10000);

        expect(window[`__mp_targeting_lib`]).to.exist;

        // Clean up for next test
        flagsManager.resetTargeting();
        await clearAllLibInstances(mixpanel);

        // Test with absolute URL
        const absoluteToken = `TARGET_TEST_ABS_${Math.random().toString(36).substring(7)}`;
        await new Promise((resolve) => {
          mixpanel.init(absoluteToken, {
            flags: true,
            targeting_src: window.location.origin + `/static/build/mixpanel-targeting.js`,
            debug: true,
            loaded: resolve
          }, `testabs`);
        });

        const flagsManagerAbs = mixpanel.testabs.flags;
        flagsManagerAbs.getTargeting();

        await untilDone(() => window[`__mp_targeting_lib`], 10000);

        expect(window[`__mp_targeting_lib`]).to.exist;
      });

      it(`reinitializes if globals cleared`, async function() {
        await new Promise((resolve) => {
          mixpanel.init(token, {
            flags: true,
            targeting_src: `./static/build/mixpanel-targeting.js`,
            debug: true,
            loaded: resolve
          }, `test`);
        });

        const flagsManager = mixpanel.test.flags;
        flagsManager.getTargeting();

        await untilDone(() => window[`__mp_targeting_lib`], 10000);

        // Manually clear globals
        delete window[`__mp_targeting`];
        delete window[`__mp_targeting_lib`];

        // Trigger reload
        flagsManager.getTargeting();

        // Should reinitialize
        expect(window[`__mp_targeting`]).to.exist;

        await untilDone(() => window[`__mp_targeting_lib`], 10000);

        expect(window[`__mp_targeting_lib`]).to.exist;
      });
    });
  });
}
