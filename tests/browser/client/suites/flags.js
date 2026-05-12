/* global chai, sinon */

const { expect } = chai;
import { clearAllLibInstances, clearAllStorage, clearMixpanelCookies, getIDBValue, untilDone, untilDoneAsync, resetTargeting } from "../utils";
import { TARGETING_GLOBAL_NAME } from "../../../../src/config";
import { FLAGS_STORE_NAME, PERSISTED_VARIANTS_KEY_PREFIX } from "../../../../src/flags/flags-persistence";

export function flagsTests(mixpanel) {
  describe(`feature flags`, function() {
    // Module tests have targeting bundled in already, so don't need to reset it
    const IS_TARGETING_BUNDLED = Boolean(window[TARGETING_GLOBAL_NAME]);
    let token;

    beforeEach(async () => {
      token = `TARGET_TEST_${Math.random().toString(36).substring(7)}`;
      await clearAllStorage();
    });

    afterEach(async () => {
      await clearAllLibInstances(mixpanel);
      if (!IS_TARGETING_BUNDLED) {
        resetTargeting();
      }
    });

    // SECTION 1: Targeting Loader (3 tests)
    describe(`targeting loader`, function() {
      it(`successfully loads targeting bundle`, async function() {
        await new Promise((resolve) => {
          mixpanel.init(token, {
            flags: true,
            lib_base_path: `./static/build/async-modules/`,
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
        expect(window[TARGETING_GLOBAL_NAME]).to.exist;
        expect(window[TARGETING_GLOBAL_NAME].then).to.be.a(`function`);

        // Wait for bundle to load
        const library = await window[TARGETING_GLOBAL_NAME];
        expect(library).to.exist;
        expect(library.eventMatchesCriteria).to.be.a(`function`);
      });

      it(`does not load script twice when called multiple times`, async function() {
        await new Promise((resolve) => {
          mixpanel.init(token, {
            flags: true,
            lib_base_path: `./static/build/async-modules/`,
            debug: true,
            loaded: resolve
          }, `test`);
        });

        const flagsManager = mixpanel.test.flags;

        // Trigger load multiple times
        flagsManager.getTargeting();
        flagsManager.getTargeting();
        flagsManager.getTargeting();

        await window[TARGETING_GLOBAL_NAME];

        // Count script tags with targeting bundle
        const scripts = document.querySelectorAll(`script[src*="mixpanel-targeting"]`);
        expect(scripts.length).to.be.at.most(1);
      });

      it(`returns promise-based API`, async function() {
        await new Promise((resolve) => {
          mixpanel.init(token, {
            flags: true,
            lib_base_path: `./static/build/async-modules/`,
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
      let fetchStub;

      beforeEach(() => {
        fetchStub = sinon.stub(window, `fetch`).callsFake(() => {
          // Return a never-resolving promise by default
          return new Promise(() => {});
        });
      });

      afterEach(() => {
        sinon.restore();
      });

      it(`switches flag variant when event matches numeric property filter`, async function() {
        // Setup fetch response
        fetchStub.callsFake((url) => {
          if (url.includes(`/flags`)) {
            return Promise.resolve(new Response(JSON.stringify({
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
                property_filters: { '>': [{'var': `price`}, 100] },
                pending_variant: {
                  variant_key: `treatment`,
                  variant_value: true
                }
              }]
            }), {
              status: 200,
              headers: { 'Content-Type': `application/json` }
            }));
          }
          return new Promise(() => {});
        });

        await new Promise((resolve) => {
          mixpanel.init(token, {
            flags: true,
            lib_base_path: `./static/build/async-modules/`,
            debug: true,
            loaded: resolve
          }, `test`);
        });

        // Wait for flags request
        await untilDone(() => fetchStub.called, 5000);

        // Initial flag value should be control
        let flagValue = mixpanel.test.flags.get_variant_value_sync(`premium-feature`);
        expect(flagValue).to.equal(false);

        // Track matching event (price > 100)
        mixpanel.test.track(`purchase`, { price: 150 });

        // Wait for flag to switch to treatment variant
        await untilDone(() => mixpanel.test.flags.get_variant_value_sync(`premium-feature`) === true, 5000);

        // Flag should switch to treatment variant
        flagValue = mixpanel.test.flags.get_variant_value_sync(`premium-feature`);
        expect(flagValue).to.equal(true);
      });

      it(`does not switch variant when event doesn't match property filter`, async function() {
        // Setup fetch response
        fetchStub.callsFake((url) => {
          if (url.includes(`/flags`)) {
            return Promise.resolve(new Response(JSON.stringify({
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
                property_filters: { '>': [{'var': `price`}, 100] },
                pending_variant: {
                  variant_key: `treatment`,
                  variant_value: true
                }
              }]
            }), {
              status: 200,
              headers: { 'Content-Type': `application/json` }
            }));
          }
          return new Promise(() => {});
        });

        await new Promise((resolve) => {
          mixpanel.init(token, {
            flags: true,
            lib_base_path: `./static/build/async-modules/`,
            debug: true,
            loaded: resolve
          }, `test`);
        });

        await untilDone(() => fetchStub.called, 5000);

        // Store initial value
        const initialValue = mixpanel.test.flags.get_variant_value_sync(`premium-feature`);

        // Track non-matching event (price < 100)
        mixpanel.test.track(`purchase`, { price: 50 });

        // Give time for event processing, then verify flag hasn't changed
        await new Promise(resolve => setTimeout(resolve, 100));

        // Flag should remain control
        const flagValue = mixpanel.test.flags.get_variant_value_sync(`premium-feature`);
        expect(flagValue).to.equal(false);
        expect(flagValue).to.equal(initialValue);
      });

      it(`switches variant with string property filter`, async function() {
        fetchStub.callsFake((url) => {
          if (url.includes(`/flags`)) {
            return Promise.resolve(new Response(JSON.stringify({
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
                property_filters: { '==': [{'var': `country`}, `US`] },
                pending_variant: {
                  variant_key: `treatment`,
                  variant_value: `us-version`
                }
              }]
            }), {
              status: 200,
              headers: { 'Content-Type': `application/json` }
            }));
          }
          return new Promise(() => {});
        });

        await new Promise((resolve) => {
          mixpanel.init(token, {
            flags: true,
            lib_base_path: `./static/build/async-modules/`,
            debug: true,
            loaded: resolve
          }, `test`);
        });

        await untilDone(() => fetchStub.called, 5000);

        // Track matching event with country = 'US'
        mixpanel.test.track(`page_view`, { country: `US` });

        // Wait for flag to switch to treatment variant
        await untilDone(() => mixpanel.test.flags.get_variant_value_sync(`region-feature`) === `us-version`, 5000);

        // Flag should switch to treatment variant
        const flagValue = mixpanel.test.flags.get_variant_value_sync(`region-feature`);
        expect(flagValue).to.equal(`us-version`);
      });

      it(`evaluates complex property filter with multiple conditions`, async function() {
        fetchStub.callsFake((url) => {
          if (url.includes(`/flags`)) {
            return Promise.resolve(new Response(JSON.stringify({
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
                    { '>': [{'var': `price`}, 100] },
                    { '==': [{'var': `country`}, `US`] }
                  ]
                },
                pending_variant: {
                  variant_key: `treatment`,
                  variant_value: true
                }
              }]
            }), {
              status: 200,
              headers: { 'Content-Type': `application/json` }
            }));
          }
          return new Promise(() => {});
        });

        await new Promise((resolve) => {
          mixpanel.init(token, {
            flags: true,
            lib_base_path: `./static/build/async-modules/`,
            debug: true,
            loaded: resolve
          }, `test`);
        });

        await untilDone(() => fetchStub.called, 5000);

        // Track event matching both conditions
        mixpanel.test.track(`checkout`, { price: 150, country: `US` });

        // Wait for flag to switch to treatment
        await untilDone(() => mixpanel.test.flags.get_variant_value_sync(`complex-feature`) === true, 5000);

        // Flag should switch to treatment
        const flagValue = mixpanel.test.flags.get_variant_value_sync(`complex-feature`);
        expect(flagValue).to.equal(true);
      });

      it(`handles multiple flags with different first-time events independently`, async function() {
        fetchStub.callsFake((url) => {
          if (url.includes(`/flags`)) {
            return Promise.resolve(new Response(JSON.stringify({
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
                  property_filters: { '>': [{'var': `price`}, 100] },
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
            }), {
              status: 200,
              headers: { 'Content-Type': `application/json` }
            }));
          }
          return new Promise(() => {});
        });

        await new Promise((resolve) => {
          mixpanel.init(token, {
            flags: true,
            lib_base_path: `./static/build/async-modules/`,
            debug: true,
            loaded: resolve
          }, `test`);
        });

        await untilDone(() => fetchStub.called, 5000);

        // Track event matching only flag-a
        mixpanel.test.track(`purchase`, { price: 150 });

        // Wait for flag-a to switch to treatment
        await untilDone(() => mixpanel.test.flags.get_variant_value_sync(`flag-a`) === true, 5000);

        // Flag A should switch, Flag B should remain control
        expect(mixpanel.test.flags.get_variant_value_sync(`flag-a`)).to.equal(true);
        expect(mixpanel.test.flags.get_variant_value_sync(`flag-b`)).to.equal(false);

        // Now track event matching flag-b
        mixpanel.test.track(`signup`);

        // Wait for flag-b to switch to treatment
        await untilDone(() => mixpanel.test.flags.get_variant_value_sync(`flag-b`) === true, 5000);

        // Both flags should now be treatment
        expect(mixpanel.test.flags.get_variant_value_sync(`flag-a`)).to.equal(true);
        expect(mixpanel.test.flags.get_variant_value_sync(`flag-b`)).to.equal(true);
      });

      it(`flags without property filters work when targeting fails to load`, async function() {
        fetchStub.callsFake((url) => {
          if (url.includes(`/flags`)) {
            return Promise.resolve(new Response(JSON.stringify({
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
            }), {
              status: 200,
              headers: { 'Content-Type': `application/json` }
            }));
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

        await untilDone(() => fetchStub.called, 5000);

        // Wait a bit for targeting to fail
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Track the simple event (no property filter needed)
        mixpanel.test.track(`simple_event`);

        // Wait for flag to switch to treatment
        await untilDone(() => mixpanel.test.flags.get_variant_value_sync(`simple-flag`) === true, 5000);

        // Flag should still switch even though targeting failed
        const flagValue = mixpanel.test.flags.get_variant_value_sync(`simple-flag`);
        expect(flagValue).to.equal(true);
      });

      it(`automatically loads targeting bundle when flag needs property evaluation`, async function() {
        fetchStub.callsFake((url) => {
          if (url.includes(`/flags`)) {
            return Promise.resolve(new Response(JSON.stringify({
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
                property_filters: { '>': [{'var': `value`}, 50] },
                pending_variant: {
                  variant_key: `treatment`,
                  variant_value: true
                }
              }]
            }), {
              status: 200,
              headers: { 'Content-Type': `application/json` }
            }));
          }
          return new Promise(() => {});
        });

        await new Promise((resolve) => {
          mixpanel.init(token, {
            flags: true,
            lib_base_path: `./static/build/async-modules/`,
            debug: true,
            loaded: resolve
          }, `test`);
        });

        // Wait for flags to load
        await untilDone(() => fetchStub.called, 5000);

        // Targeting should load automatically because flag has property_filters
        await untilDone(() => window[TARGETING_GLOBAL_NAME], 5000);

        // Verify targeting library loaded
        expect(window[TARGETING_GLOBAL_NAME]).to.exist;

        const library = await window[TARGETING_GLOBAL_NAME];
        expect(library).to.exist;
        expect(library.eventMatchesCriteria).to.be.a(`function`);

        // Verify it works for property evaluation
        mixpanel.test.track(`test_event`, { value: 100 });

        // Wait for flag to switch to treatment
        await untilDone(() => mixpanel.test.flags.get_variant_value_sync(`auto-load-flag`) === true, 5000);

        const flagValue = mixpanel.test.flags.get_variant_value_sync(`auto-load-flag`);
        expect(flagValue).to.equal(true);
      });
    });

    // SECTION 3: Variant Persistence
    describe(`persistence`, function () {
      const persistedKeyFor = (t) => PERSISTED_VARIANTS_KEY_PREFIX + t;

      // Default fetch handler — never resolves. Tests reassign this for the
      // primer/test phases to control flag-fetch behavior without recreating the stub.
      let fetchHandler;

      beforeEach(function () {
        fetchHandler = function () { return new Promise(function () {}); };
        sinon.stub(window, `fetch`).callsFake(function (url) {
          return fetchHandler(url);
        });
      });

      afterEach(function () {
        sinon.restore();
      });

      // Returns a fetch handler that resolves /flags with the supplied variants
      // and lets every other URL hang (matching how tests already isolate flag traffic).
      function flagsFetchHandler(flagVariants) {
        return function (url) {
          if (url.includes(`/flags`)) {
            return Promise.resolve(new Response(JSON.stringify({
              flags: flagVariants,
            }), { status: 200, headers: { 'Content-Type': `application/json` } }));
          }
          return new Promise(function () {});
        };
      }

      // Initialize a named instance and wait for `loaded`.
      function initInstance(initToken, instanceName, flagsConfig) {
        return new Promise(function (resolve) {
          mixpanel.init(initToken, {
            flags: flagsConfig,
            debug: true,
            loaded: resolve,
          }, instanceName);
        });
      }

      // Initialize a "primer" instance with persistenceUntilNetworkSuccess, let its fetch succeed
      // with the supplied variants, and wait until those variants are written to IDB.
      // Returns the primer's distinct_id.
      async function primeCache(primerToken, flagVariants) {
        fetchHandler = flagsFetchHandler(flagVariants);
        await initInstance(primerToken, `primer`, { persistence: { variantLookupPolicy: `persistenceUntilNetworkSuccess` } });

        const firstFlagKey = Object.keys(flagVariants)[0];
        await untilDoneAsync(async function () {
          const stored = await getIDBValue(FLAGS_STORE_NAME, persistedKeyFor(primerToken));
          if (!stored || !stored.flagVariants || !stored.flagVariants[firstFlagKey]) {
            throw new Error(`not yet`);
          }
        }, 5000);

        return mixpanel.primer.get_distinct_id();
      }

      it(`persists variants on first successful fetch`, async function () {
        this.timeout(10000);
        console.log(`[flags-persistence test] Start persistence test`);
        const fetchCalls = [];
        const baseHandler = flagsFetchHandler({
          flagA: { variant_key: `varA`, variant_value: `1` },
        });
        fetchHandler = function (url) {
          fetchCalls.push(url);
          console.log(`[flags-persistence-test] fetch called:`, url);
          return baseHandler(url);
        };

        await initInstance(token, `test`, { persistence: { variantLookupPolicy: `persistenceUntilNetworkSuccess` } });
        console.log(`[flags-persistence-test] init resolved; distinct_id:`, mixpanel.test.get_distinct_id());

        await new Promise(function (resolve) { setTimeout(resolve, 1000); });

        console.log(`[flags-persistence-test] fetch call count:`, fetchCalls.length, `urls:`, fetchCalls);

        const stored = await getIDBValue(FLAGS_STORE_NAME, persistedKeyFor(token));
        console.log(`[flags-persistence-test] IDB stored value:`, JSON.stringify(stored));

        expect(stored).to.exist;
        expect(stored.persistedAt).to.be.a(`number`);
        expect(stored.distinctId).to.equal(mixpanel.test.get_distinct_id());
        expect(stored.flagVariants.flagA.variant_key).to.equal(`varA`);
      });

      it(`persistenceUntilNetworkSuccess serves from cache before any network fetch resolves`, async function () {
        // Phase 1: prime the cache with a real fetch.
        const primerDistinctId = await primeCache(token, {
          flagA: { variant_key: `primed`, variant_value: `primedValue` },
        });

        // Phase 2: a fresh instance with the same token shares the cookie, so it
        // reads the same distinct_id and should serve flagA from persistence
        // even though fetch never resolves.
        fetchHandler = function () { return new Promise(function () {}); };
        await initInstance(token, `test`, { persistence: { variantLookupPolicy: `persistenceUntilNetworkSuccess` } });
        expect(mixpanel.test.get_distinct_id()).to.equal(primerDistinctId);

        await untilDone(function () {
          const v = mixpanel.test.flags.get_variant_sync(`flagA`, { value: `fallback` });
          return v && v.key === `primed`;
        }, 5000);

        const variant = mixpanel.test.flags.get_variant_sync(`flagA`, { value: `fallback` });
        expect(variant.key).to.equal(`primed`);
        expect(variant.variant_source).to.equal(`persistence`);
      });

      it(`networkFirst falls back to cache on fetch failure`, async function () {
        await primeCache(token, {
          flagA: { variant_key: `primed`, variant_value: `primedValue` },
        });

        // Phase 2: networkFirst with a failing fetch should fall back to the primed cache.
        fetchHandler = function () { return Promise.reject(new Error(`network down`)); };
        await initInstance(token, `test`, { persistence: { variantLookupPolicy: `networkFirst` } });

        await untilDone(function () {
          const v = mixpanel.test.flags.get_variant_sync(`flagA`, { value: `fallback` });
          return v && v.key === `primed`;
        }, 5000);

        const variant = mixpanel.test.flags.get_variant_sync(`flagA`, { value: `fallback` });
        expect(variant.key).to.equal(`primed`);
      });

      it(`clears persisted variants on distinct_id mismatch`, async function () {
        // Prime the cache with one distinct_id, then init a fresh instance under
        // the same token but a different distinct_id (forced by clearing cookies
        // between phases). The load path should detect the mismatch and clear
        // the cached entry.
        const primerDistinctId = await primeCache(token, {
          flagA: { variant_key: `primed`, variant_value: `primedValue` },
        });

        // Wipe cookies so the next init generates a new distinct_id, while
        // leaving IDB intact.
        clearMixpanelCookies();

        fetchHandler = function () { return new Promise(function () {}); };
        await initInstance(token, `test`, { persistence: { variantLookupPolicy: `persistenceUntilNetworkSuccess` } });
        expect(mixpanel.test.get_distinct_id()).to.not.equal(primerDistinctId);

        await untilDoneAsync(async function () {
          const stored = await getIDBValue(FLAGS_STORE_NAME, persistedKeyFor(token));
          if (stored !== undefined) throw new Error(`not yet`);
        }, 5000);

        const variant = mixpanel.test.flags.get_variant_sync(`flagA`, { value: `fallback` });
        expect(variant.value).to.equal(`fallback`);

        const stored = await getIDBValue(FLAGS_STORE_NAME, persistedKeyFor(token));
        expect(stored).to.be.undefined;
      });

      it(`does not clear cache when TTL has expired (eviction is lazy)`, async function () {
        // Backdate Date.now during the primer's fetch so the persisted entry
        // already looks ~2 minutes old by the time the test instance reads it.
        const realNow = Date.now();
        const dateStub = sinon.stub(Date, `now`).returns(realNow - 120000);

        await primeCache(token, {
          flagA: { variant_key: `primed`, variant_value: `primedValue` },
        });

        dateStub.restore();

        // Phase 2: TTL of 60s with a hung fetch — load should detect expiry,
        // skip serving the expired data, but leave the entry in IDB.
        fetchHandler = function () { return new Promise(function () {}); };
        await initInstance(token, `test`, {
          persistence: {
            variantLookupPolicy: `networkFirst`,
            persistenceTtlMs: 60000,
          },
        });

        // Give the load a moment to evaluate the expiry path.
        await new Promise(function (resolve) { setTimeout(resolve, 500); });

        const variant = mixpanel.test.flags.get_variant_sync(`flagA`, { value: `fallback` });
        expect(variant.value).to.equal(`fallback`);

        const stored = await getIDBValue(FLAGS_STORE_NAME, persistedKeyFor(token));
        expect(stored).to.exist;
        expect(stored.flagVariants.flagA.variant_key).to.equal(`primed`);
      });

      it(`networkOnly clears any pre-existing persisted data on init`, async function () {
        // Phase 1: prime the cache via a caching policy.
        await primeCache(token, {
          flagA: { variant_key: `primed`, variant_value: `primedValue` },
        });

        // Phase 2: a fresh instance with the same token but networkOnly policy
        // should wipe the cached blob on init.
        fetchHandler = function () { return new Promise(function () {}); };
        await initInstance(token, `test`, { persistence: { variantLookupPolicy: `networkOnly` } });

        await untilDoneAsync(async function () {
          const stored = await getIDBValue(FLAGS_STORE_NAME, persistedKeyFor(token));
          if (stored !== undefined) throw new Error(`not yet`);
        }, 5000);

        const stored = await getIDBValue(FLAGS_STORE_NAME, persistedKeyFor(token));
        expect(stored).to.be.undefined;
      });

      it(`mixpanel.reset() clears persisted variants and refetches with new distinct_id`, async function () {
        const flagsRequests = [];
        fetchHandler = function (url) {
          if (url.includes(`/flags`)) {
            flagsRequests.push(url);
            return Promise.resolve(new Response(JSON.stringify({
              flags: { flagA: { variant_key: `varA`, variant_value: `1` } },
            }), { status: 200, headers: { 'Content-Type': `application/json` } }));
          }
          return new Promise(function () {});
        };

        await initInstance(token, `test`, { persistence: { variantLookupPolicy: `persistenceUntilNetworkSuccess` } });

        await untilDoneAsync(async function () {
          const stored = await getIDBValue(FLAGS_STORE_NAME, persistedKeyFor(token));
          if (!stored || !stored.flagVariants || !stored.flagVariants.flagA) {
            throw new Error(`not yet`);
          }
        }, 5000);

        const initialDistinctId = mixpanel.test.get_distinct_id();
        flagsRequests.length = 0;

        mixpanel.test.reset();

        await untilDoneAsync(async function () {
          if (flagsRequests.length === 0) throw new Error(`no fetch yet`);
          const stored = await getIDBValue(FLAGS_STORE_NAME, persistedKeyFor(token));
          if (!stored || stored.distinctId !== mixpanel.test.get_distinct_id() || stored.distinctId === initialDistinctId) {
            throw new Error(`not yet`);
          }
        }, 5000);

        const newDistinctId = mixpanel.test.get_distinct_id();
        expect(newDistinctId).to.not.equal(initialDistinctId);

        const lastUrl = flagsRequests[flagsRequests.length - 1];
        const urlObj = new URL(lastUrl);
        const contextParam = urlObj.searchParams.get(`context`);
        const context = JSON.parse(decodeURIComponent(contextParam));
        expect(context.distinct_id).to.equal(newDistinctId);

        const stored = await getIDBValue(FLAGS_STORE_NAME, persistedKeyFor(token));
        expect(stored.distinctId).to.equal(newDistinctId);
      });
    });
  });
}
