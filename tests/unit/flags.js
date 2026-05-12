import chai, { expect } from "chai";
import sinon from "sinon";
import sinonChai from "sinon-chai";
import * as jsonLogic from "json-logic-js";

import { window } from "../../src/window";
import { Config } from "../../src/config";

import { FeatureFlagManager } from "../../src/flags/index";
import {
  FeatureFlagPersistence,
  VariantLookupPolicy,
} from "../../src/flags/flags-persistence";
import { setupFakeIDB } from "./test-utils/indexed-db";

chai.use(sinonChai);

describe(`FeatureFlagManager`, function () {
  let flagManager;
  let mockConfig;
  let mockFetch;
  let mockResponse;
  let initOptions;

  beforeEach(function () {
    mockConfig = {
      api_host: `https://api.mixpanel.com`,
      api_routes: { flags: `flags` },
      token: `test-token`,
      targeting_src: `https://cdn.mxpnl.com/libs/mixpanel-targeting.min.js`,
      flags: {
        context: {
          user_id: `test-user`,
          group_id: `test-group`,
        },
      },
    };

    mockResponse = {
      json: sinon.stub().resolves({
        code: 200,
        flags: {
          deepThoughtAnswerExperiment: {
            variant_key: `fortyTwo`,
            variant_value: `42`,
            experiment_id: `exp12345`,
            is_experiment_active: true,
            is_qa_tester: false,
          },
          infiniteImprobabilityDrive: {
            variant_key: `enabled`,
            variant_value: `enabled`,
          },
          babelFishTranslation: {
            variant_key: `control`,
            variant_value: `disabled`,
          },
        },
      }),
    };

    mockFetch = sinon.stub().resolves(mockResponse);
    window[`fetch`] = mockFetch;

    initOptions = {
      getFullApiRoute: sinon.stub().returns(`https://api.mixpanel.com/flags`),
      getConfigFunc: sinon.stub().callsFake((key) => mockConfig[key]),
      setConfigFunc: sinon.stub().callsFake((key, value) => { mockConfig[key] = value; }),
      getPropertyFunc: sinon.stub().callsFake((key) => {
        if (key === `distinct_id`) return `test-distinct-id`;
        if (key === `$device_id`) return `test-device-id`;
        return null;
      }),
      trackingFunc: sinon.stub(),
      loadExtraBundle: sinon.stub().callsFake((src, callback) => {
        callback();
      }),
    };

    flagManager = new FeatureFlagManager(initOptions);
  });

  afterEach(function () {
    sinon.restore();
    delete window[`fetch`];
    delete window[`__mp_targeting`];
  });

  async function seedPersistedVariants(policy, distinctId, deviceId, variants, pending) {
    const seed = new FeatureFlagPersistence({ variantLookupPolicy: policy }, mockConfig.token);
    await seed.idb.init();
    await seed.save(
      { distinct_id: distinctId, device_id: deviceId },
      new Map(Object.entries(variants)),
      pending
    );
  }

  function makeFetchHang() {
    mockFetch.returns(new Promise(function () {}));
  }

  describe(`init`, function () {
    it(`does not fetch flags when system is disabled`, function () {
      initOptions.getConfigFunc.withArgs(`flags`).returns(null);

      flagManager.init();

      expect(mockFetch).not.to.have.been.called;
    });

    it(`makes GET request to correct endpoint with proper headers and query parameters`, async function () {
      await flagManager.init();

      expect(mockFetch).to.have.been.calledOnce;

      const [url, options] = mockFetch.firstCall.args;
      expect(url).to.include(`https://api.mixpanel.com/flags?`);
      expect(url).to.include(`context=`);
      expect(url).to.include(`token=test-token`);
      expect(url).to.include(`mp_lib=web`);
      expect(url).to.include(`%24lib_version=${Config.LIB_VERSION}`);
      expect(options.method).to.equal(`GET`);
      expect(options.headers[`Authorization`]).to.equal(
        `Basic ` + btoa(`test-token:`)
      );
      expect(options.headers[`Content-Type`]).to.be.undefined;
    });

    it(`sends correct parameters with distinct_id, device_id, and context in URL`, async function () {
      await flagManager.init();

      const [url] = mockFetch.firstCall.args;
      const urlObj = new URL(url);
      const contextParam = urlObj.searchParams.get(`context`);
      const context = JSON.parse(decodeURIComponent(contextParam));

      expect(context.distinct_id).to.equal(`test-distinct-id`);
      expect(context.device_id).to.equal(`test-device-id`);
      expect(context.user_id).to.equal(`test-user`);
      expect(context.group_id).to.equal(`test-group`);
    });

    it(`sends parameters with only distinct_id and device_id when no additional context configured`, async function () {
      mockConfig.flags = {};

      await flagManager.init();

      const [url] = mockFetch.firstCall.args;
      const urlObj = new URL(url);
      const contextParam = urlObj.searchParams.get(`context`);
      const context = JSON.parse(decodeURIComponent(contextParam));

      expect(context.distinct_id).to.equal(`test-distinct-id`);
      expect(context.device_id).to.equal(`test-device-id`);
      expect(context.user_id).to.be.undefined;
      expect(context.group_id).to.be.undefined;
    });

    it(`handles successful response and parses flags correctly`, async function () {
      await flagManager.init();

      expect(flagManager.flags).to.be.instanceOf(Map);
      expect(flagManager.flags.size).to.equal(3);

      const deepThoughtFlag = flagManager.flags.get(
        `deepThoughtAnswerExperiment`
      );
      expect(deepThoughtFlag.key).to.equal(`fortyTwo`);
      expect(deepThoughtFlag.value).to.equal(`42`);

      const improbabilityFlag = flagManager.flags.get(
        `infiniteImprobabilityDrive`
      );
      expect(improbabilityFlag.key).to.equal(`enabled`);
      expect(improbabilityFlag.value).to.equal(`enabled`);

      const babelFishFlag = flagManager.flags.get(`babelFishTranslation`);
      expect(babelFishFlag.key).to.equal(`control`);
      expect(babelFishFlag.value).to.equal(`disabled`);
    });

    it(`handles response with empty flags object`, async function () {
      mockResponse.json.resolves({ code: 200, flags: {} });

      await flagManager.init();

      expect(flagManager.flags).to.be.instanceOf(Map);
      expect(flagManager.flags.size).to.equal(0);
    });

    it(`handles network fetch errors gracefully`, async function () {
      mockFetch.rejects(new Error(`Network error`));

      // init swallows the error, but fetchPromise itself rejects
      await flagManager.init();

      try {
        await flagManager.fetchPromise;
        expect.fail(`fetchPromise should have rejected`);
      } catch (err) {
        expect(err.message).to.equal(`Network error`);
      }
    });
  });

  describe(`getVariantValue`, function () {
    beforeEach(async function () {
      await flagManager.init();
    });

    it(`tracks expected properties in exposure event`, async function () {
      const result = await flagManager.getVariantValue(
        `deepThoughtAnswerExperiment`
      );

      expect(initOptions.trackingFunc).to.have.been.calledOnce;
      const [eventName, properties] = initOptions.trackingFunc.firstCall.args;

      expect(eventName).to.equal(`$experiment_started`);

      expect(properties[`Experiment name`]).to.equal(
        `deepThoughtAnswerExperiment`
      );
      expect(properties[`Variant name`]).to.equal(`fortyTwo`);
      expect(properties[`$experiment_type`]).to.equal(`feature_flag`);
      expect(properties[`$experiment_id`]).to.equal(`exp12345`);
      expect(properties[`$is_experiment_active`]).to.equal(true);
      expect(properties[`$is_qa_tester`]).to.equal(false);
      expect(properties[`Variant fetch start time`]).to.be.a(`string`);
      expect(properties[`Variant fetch complete time`]).to.be.a(`string`);
      expect(properties[`Variant fetch latency (ms)`]).to.be.a(`number`);

      expect(result).to.equal(`42`);
    });
  });

  describe(`trackFeatureCheck`, function () {
    beforeEach(function () {
      // trackedFeatures is normally created by init(); set it here so we can
      // exercise trackFeatureCheck directly without triggering a fetch.
      flagManager.trackedFeatures = new Set();
    });

    function trackedProperties() {
      return initOptions.trackingFunc.firstCall.args[1];
    }

    it(`emits null for fetch start/complete dates when no fetch has completed`, function () {
      flagManager.trackFeatureCheck(`flagA`, { key: `varA`, value: `1` });

      expect(initOptions.trackingFunc).to.have.been.calledOnce;
      const props = trackedProperties();

      expect(props[`Variant fetch start time`]).to.be.null;
      expect(props[`Variant fetch complete time`]).to.be.null;
      expect(props[`Variant fetch latency (ms)`]).to.be.undefined;
      expect(props[`Variant fetch traceparent`]).to.be.undefined;
    });

    it(`includes $persisted_at_in_ms and $ttl_in_ms when the variant came from persistence`, function () {
      flagManager.trackFeatureCheck(`flagA`, {
        key: `varA`,
        value: `1`,
        variant_source: `persistence`,
        persisted_at_in_ms: 1700000000000,
        ttl_in_ms: 86400000,
      });

      expect(trackedProperties()[`$persisted_at_in_ms`]).to.equal(1700000000000);
      expect(trackedProperties()[`$ttl_in_ms`]).to.equal(86400000);
    });

    it(`omits $persisted_at_in_ms and $ttl_in_ms when the variant has no persistence metadata`, function () {
      flagManager.trackFeatureCheck(`flagA`, { key: `varA`, value: `1` });

      expect(trackedProperties()).to.not.have.property(`$persisted_at_in_ms`);
      expect(trackedProperties()).to.not.have.property(`$ttl_in_ms`);
    });

    it(`emits ISO date strings when fetch timestamps are populated`, function () {
      const start = Date.now() - 100;
      const end = Date.now();
      flagManager._fetchStartTime = start;
      flagManager._fetchCompleteTime = end;
      flagManager._fetchLatency = end - start;

      flagManager.trackFeatureCheck(`flagA`, { key: `varA`, value: `1` });

      const props = trackedProperties();
      expect(props[`Variant fetch start time`]).to.equal(new Date(start).toISOString());
      expect(props[`Variant fetch complete time`]).to.equal(new Date(end).toISOString());
      expect(props[`Variant fetch latency (ms)`]).to.equal(end - start);
    });

    it(`omits $experiment_id, $is_experiment_active, $is_qa_tester, $variant_source when the feature lacks them`, function () {
      flagManager.trackFeatureCheck(`flagA`, { key: `varA`, value: `1` });

      const props = trackedProperties();
      expect(props).to.not.have.property(`$experiment_id`);
      expect(props).to.not.have.property(`$is_experiment_active`);
      expect(props).to.not.have.property(`$is_qa_tester`);
      expect(props).to.not.have.property(`$variant_source`);
    });

    it(`omits $experiment_id, $is_experiment_active, $is_qa_tester, $variant_source when their values are null`, function () {
      flagManager.trackFeatureCheck(`flagA`, {
        key: `varA`,
        value: `1`,
        experiment_id: null,
        is_experiment_active: null,
        is_qa_tester: null,
        variant_source: null,
      });

      const props = trackedProperties();
      expect(props).to.not.have.property(`$experiment_id`);
      expect(props).to.not.have.property(`$is_experiment_active`);
      expect(props).to.not.have.property(`$is_qa_tester`);
      expect(props).to.not.have.property(`$variant_source`);
    });

    it(`emits boolean false values for $is_experiment_active and $is_qa_tester (false is "present")`, function () {
      flagManager.trackFeatureCheck(`flagA`, {
        key: `varA`,
        value: `1`,
        is_experiment_active: false,
        is_qa_tester: false,
      });

      const props = trackedProperties();
      expect(props[`$is_experiment_active`]).to.equal(false);
      expect(props[`$is_qa_tester`]).to.equal(false);
    });
  });

  describe(`First-Time Event Targeting`, function () {
    beforeEach(function () {
      // Mock response with first-time event definitions
      mockResponse = {
        json: sinon.stub().resolves({
          code: 200,
          flags: {
            "onboarding-checklist": {
              variant_key: `control`,
              variant_value: false,
              experiment_id: null,
              is_experiment_active: false,
            },
            "premium-welcome": {
              variant_key: `control`,
              variant_value: null,
              experiment_id: null,
              is_experiment_active: false,
            },
          },
          pending_first_time_events: [
            {
              flag_key: `onboarding-checklist`,
              flag_id: `flag-123`,
              project_id: 3,
              first_time_event_hash: `abc123def456`,
              event_name: `Dashboard Viewed`,
              property_filters: {},
              pending_variant: {
                variant_key: `treatment`,
                variant_value: true,
                experiment_id: 123,
                is_experiment_active: true,
              },
            },
            {
              flag_key: `premium-welcome`,
              flag_id: `flag-456`,
              project_id: 3,
              first_time_event_hash: `xyz789`,
              event_name: `Purchase Complete`,
              property_filters: {
                ">": [{ var: `amount` }, 100],
              },
              pending_variant: {
                variant_key: `premium`,
                variant_value: { discount: 20 },
                experiment_id: 456,
                is_experiment_active: true,
              },
            },
          ],
        }),
      };

      mockFetch.resolves(mockResponse);
    });

    describe(`fetchFlags parsing`, function () {
      it(`parses pending_first_time_events from response`, async function () {
        await flagManager.init();

        const eventKey = `onboarding-checklist:abc123def456`;
        expect(flagManager.pendingFirstTimeEvents).to.have.property(eventKey);

        const pendingEvent = flagManager.pendingFirstTimeEvents[eventKey];
        expect(pendingEvent.flag_key).to.equal(`onboarding-checklist`);
        expect(pendingEvent.flag_id).to.equal(`flag-123`);
        expect(pendingEvent.project_id).to.equal(3);
        expect(pendingEvent.first_time_event_hash).to.equal(`abc123def456`);
        expect(pendingEvent.event_name).to.equal(`Dashboard Viewed`);
        expect(pendingEvent.pending_variant.variant_key).to.equal(`treatment`);
      });

      it(`applies current variant immediately`, async function () {
        await flagManager.init();

        const flag = flagManager.flags.get(`onboarding-checklist`);
        expect(flag.key).to.equal(`control`);
        expect(flag.value).to.equal(false);
      });

      it(`handles empty pending_first_time_events`, async function () {
        mockResponse.json.resolves({
          code: 200,
          flags: {
            "simple-flag": {
              variant_key: `enabled`,
              variant_value: true,
            },
          },
        });

        await flagManager.init();

        expect(flagManager.pendingFirstTimeEvents).to.not.have.property(
          `simple-flag`
        );
      });
    });

    describe(`checkFirstTimeEvents`, function () {
      beforeEach(async function () {
        // Pre-load targeting to avoid timing issues with loadExtraBundle
        window[`__mp_targeting`] = Promise.resolve({
          eventMatchesCriteria: function(eventName, properties, criteria) {
            if (eventName !== criteria.event_name) {
              return { matches: false };
            }
            if (criteria.property_filters && Object.keys(criteria.property_filters).length > 0) {
              try {
                var filtersMatch = jsonLogic.apply(criteria.property_filters, properties || {});
                return { matches: filtersMatch };
              } catch (error) {
                return { matches: false, error: error.toString() };
              }
            }
            return { matches: true };
          }
        });

        await flagManager.init();
        sinon.resetHistory();
      });

      it(`matches event by exact name and switches variant`, async function () {
        flagManager.checkFirstTimeEvents(`Dashboard Viewed`, {});
        await new Promise(resolve => setTimeout(resolve, 0));

        const flag = flagManager.flags.get(`onboarding-checklist`);
        expect(flag.key).to.equal(`treatment`);
        expect(flag.value).to.equal(true);
        expect(flag.experiment_id).to.equal(123);
      });

      it(`does not match event with different name`, function () {
        flagManager.checkFirstTimeEvents(`Other Event`, {});

        const flag = flagManager.flags.get(`onboarding-checklist`);
        expect(flag.key).to.equal(`control`);
        expect(flag.value).to.equal(false);
      });

      it(`is case-sensitive for event names`, function () {
        flagManager.checkFirstTimeEvents(`dashboard viewed`, {});

        const flag = flagManager.flags.get(`onboarding-checklist`);
        expect(flag.key).to.equal(`control`);
      });

      it(`evaluates property filters using JsonLogic`, async function () {
        // Event with amount > 100 should match
        flagManager.checkFirstTimeEvents(`Purchase Complete`, { amount: 150 });
        await new Promise(resolve => setTimeout(resolve, 0));

        const flag = flagManager.flags.get(`premium-welcome`);
        expect(flag.key).to.equal(`premium`);
        expect(flag.value).to.deep.equal({ discount: 20 });
      });

      it(`does not match when property filters fail`, function () {
        // Event with amount <= 100 should not match
        flagManager.checkFirstTimeEvents(`Purchase Complete`, { amount: 50 });

        const flag = flagManager.flags.get(`premium-welcome`);
        expect(flag.key).to.equal(`control`);
      });

      it(`handles undefined properties in filters`, function () {
        // Event without amount property should not match
        flagManager.checkFirstTimeEvents(`Purchase Complete`, {});

        const flag = flagManager.flags.get(`premium-welcome`);
        expect(flag.key).to.equal(`control`);
      });

      it(`requires exact case match for property keys`, async function () {
        // Event with incorrect case for property key should NOT match
        flagManager.checkFirstTimeEvents(`Purchase Complete`, {
          Amount: 150,
          CATEGORY: `PREMIUM`,
        });
        await new Promise(resolve => setTimeout(resolve, 0));

        const flag = flagManager.flags.get(`premium-welcome`);
        // Should remain control due to case mismatch
        expect(flag.key).to.equal(`control`);

        // Event with correct case should match
        flagManager.checkFirstTimeEvents(`Purchase Complete`, {
          amount: 150,
          category: `premium`,
        });
        await new Promise(resolve => setTimeout(resolve, 0));

        const flagAfter = flagManager.flags.get(`premium-welcome`);
        expect(flagAfter.key).to.equal(`premium`);
      });

      it(`marks event as activated after first match`, async function () {
        flagManager.checkFirstTimeEvents(`Dashboard Viewed`, {});
        await new Promise(resolve => setTimeout(resolve, 0));

        const eventKey = `onboarding-checklist:abc123def456`;
        expect(flagManager.activatedFirstTimeEvents[eventKey]).to.equal(true);
      });

      it(`does not re-trigger on subsequent matching events`, async function () {
        // First event triggers
        flagManager.checkFirstTimeEvents(`Dashboard Viewed`, {});
        await new Promise(resolve => setTimeout(resolve, 0));
        const eventKey = `onboarding-checklist:abc123def456`;
        expect(flagManager.activatedFirstTimeEvents[eventKey]).to.equal(true);

        // Reset the flag to verify it doesn't get updated again
        flagManager.flags.set(`onboarding-checklist`, {key: `control`});

        // Second event should not trigger again (event is already activated)
        flagManager.checkFirstTimeEvents(`Dashboard Viewed`, {});
        await new Promise(resolve => setTimeout(resolve, 0));
        const flag = flagManager.flags.get(`onboarding-checklist`);
        expect(flag.key).to.equal(`control`); // unchanged from our reset
      });

      it(`does not track experiment started (deferred to getVariant)`, function () {
        flagManager.checkFirstTimeEvents(`Dashboard Viewed`, {});

        // Tracking is NOT called - experiment_started will be tracked when getVariant is called
        expect(initOptions.trackingFunc).to.not.have.been.called;
      });

      it(`calls recording endpoint with correct payload`, async function () {
        flagManager.checkFirstTimeEvents(`Dashboard Viewed`, {});
        await new Promise(resolve => setTimeout(resolve, 0));

        expect(mockFetch).to.have.been.calledOnce; // sinon.resetHistory() was called in beforeEach
        const recordingCall = mockFetch.firstCall;
        const [url, options] = recordingCall.args;

        expect(url).to.include(`flag-123/first-time-events`);
        expect(options.method).to.equal(`POST`);
        expect(options.headers[`Content-Type`]).to.equal(`application/json`);

        const payload = JSON.parse(options.body);
        expect(payload.distinct_id).to.equal(`test-distinct-id`);
        expect(payload.project_id).to.equal(3);
        expect(payload.first_time_event_hash).to.equal(`abc123def456`);
      });

      it(`handles recording endpoint failures gracefully`, async function () {
        mockFetch.onFirstCall().rejects(new Error(`Network error`));

        // Should not throw
        expect(() => {
          flagManager.checkFirstTimeEvents(`Dashboard Viewed`, {});
        }).to.not.throw();
        await new Promise(resolve => setTimeout(resolve, 0));

        // Variant should still be switched
        const flag = flagManager.flags.get(`onboarding-checklist`);
        expect(flag.key).to.equal(`treatment`);
      });

      it(`handles JsonLogic evaluation errors gracefully`, function () {
        // Invalid property filter that causes error
        const eventKey = `onboarding-checklist:abc123def456`;
        flagManager.pendingFirstTimeEvents[eventKey].property_filters = {
          invalid_operator: [],
        };

        // Should not throw
        expect(() => {
          flagManager.checkFirstTimeEvents(`Dashboard Viewed`, {});
        }).to.not.throw();

        // Variant should not switch on error
        const flag = flagManager.flags.get(`onboarding-checklist`);
        expect(flag.key).to.equal(`control`);
      });

      it(`handles multiple events for same flag independently`, async function () {
        // Set up flag with two different pending events (different cohort hashes)
        mockResponse.json.resolves({
          code: 200,
          flags: {
            "multi-event-flag": {
              variant_key: `control`,
              variant_value: null,
            },
          },
          pending_first_time_events: [
            {
              flag_key: `multi-event-flag`,
              flag_id: `flag-multi`,
              project_id: 3,
              first_time_event_hash: `cohort-A`,
              event_name: `Event A`,
              property_filters: {},
              pending_variant: {
                variant_key: `variant-A`,
                variant_value: `value-A`,
                experiment_id: 100,
                is_experiment_active: true,
              },
            },
            {
              flag_key: `multi-event-flag`,
              flag_id: `flag-multi`,
              project_id: 3,
              first_time_event_hash: `cohort-B`,
              event_name: `Event B`,
              property_filters: {},
              pending_variant: {
                variant_key: `variant-B`,
                variant_value: `value-B`,
                experiment_id: 200,
                is_experiment_active: true,
              },
            },
          ],
        });

        await flagManager.init();

        // Both events should be stored with different keys
        const eventKeyA = `multi-event-flag:cohort-A`;
        const eventKeyB = `multi-event-flag:cohort-B`;
        expect(flagManager.pendingFirstTimeEvents[eventKeyA]).to.exist;
        expect(flagManager.pendingFirstTimeEvents[eventKeyB]).to.exist;

        // Activate Event A
        flagManager.checkFirstTimeEvents(`Event A`, {});
        await new Promise(resolve => setTimeout(resolve, 0));

        // Event A should be marked as activated
        expect(flagManager.activatedFirstTimeEvents[eventKeyA]).to.equal(true);

        // Event B should still be pending (not activated)
        expect(flagManager.activatedFirstTimeEvents[eventKeyB]).to.be.undefined;

        // Flag should have variant A
        const flag = flagManager.flags.get(`multi-event-flag`);
        expect(flag.key).to.equal(`variant-A`);
        expect(flag.value).to.equal(`value-A`);

        // Now activate Event B
        flagManager.checkFirstTimeEvents(`Event B`, {});
        await new Promise(resolve => setTimeout(resolve, 0));

        // Event B should now be activated
        expect(flagManager.activatedFirstTimeEvents[eventKeyB]).to.equal(true);

        // Flag should now have variant B (last event wins)
        const flagAfter = flagManager.flags.get(`multi-event-flag`);
        expect(flagAfter.key).to.equal(`variant-B`);
        expect(flagAfter.value).to.equal(`value-B`);
      });
    });

    describe(`session persistence across refetches`, function () {
      beforeEach(async function () {
        // Pre-load targeting to avoid timing issues with loadExtraBundle
        window[`__mp_targeting`] = Promise.resolve({
          eventMatchesCriteria: function(eventName, properties, criteria) {
            if (eventName !== criteria.event_name) {
              return { matches: false };
            }
            if (criteria.property_filters && Object.keys(criteria.property_filters).length > 0) {
              try {
                var filtersMatch = jsonLogic.apply(criteria.property_filters, properties || {});
                return { matches: filtersMatch };
              } catch (error) {
                return { matches: false, error: error.toString() };
              }
            }
            return { matches: true };
          }
        });

        await flagManager.init();
        sinon.resetHistory();
      });

      it(`preserves activated variant when flags are refetched`, async function () {
        // Activate first-time event
        flagManager.checkFirstTimeEvents(`Dashboard Viewed`, {});
        await new Promise(resolve => setTimeout(resolve, 0));

        const flagBefore = flagManager.flags.get(`onboarding-checklist`);
        expect(flagBefore.key).to.equal(`treatment`);

        // Refetch flags (server still returns same pending definition)
        await flagManager.fetchFlags();

        // Variant should be preserved
        const flagAfter = flagManager.flags.get(`onboarding-checklist`);
        expect(flagAfter.key).to.equal(`treatment`);
        expect(flagAfter.value).to.equal(true);
      });

      it(`does not re-add activated flag to pending events on refetch`, async function () {
        // Activate first-time event
        flagManager.checkFirstTimeEvents(`Dashboard Viewed`, {});
        await new Promise(resolve => setTimeout(resolve, 0));
        const eventKey = `onboarding-checklist:abc123def456`;
        expect(flagManager.activatedFirstTimeEvents[eventKey]).to.equal(true);

        // Refetch flags
        await flagManager.fetchFlags();

        // Pending events should not include the activated event
        expect(flagManager.pendingFirstTimeEvents).to.not.have.property(
          eventKey
        );
      });

      it(`allows new flags to be added on refetch`, async function () {
        // Add new flag in next fetch response
        mockResponse.json.resolves({
          code: 200,
          flags: {
            "onboarding-checklist": {
              variant_key: `control`,
              variant_value: false,
            },
            "new-flag": {
              variant_key: `v1`,
              variant_value: `test`,
            },
          },
          pending_first_time_events: [
            {
              flag_key: `onboarding-checklist`,
              flag_id: `flag-123`,
              project_id: 3,
              first_time_event_hash: `abc123def456`,
              event_name: `Dashboard Viewed`,
              property_filters: {},
              pending_variant: {
                variant_key: `treatment`,
                variant_value: true,
                experiment_id: 123,
                is_experiment_active: true,
              },
            },
            {
              flag_key: `new-flag`,
              flag_id: `flag-789`,
              project_id: 3,
              first_time_event_hash: `new123`,
              event_name: `New Event`,
              property_filters: {},
              pending_variant: {
                variant_key: `v2`,
                variant_value: `test2`,
                experiment_id: 789,
                is_experiment_active: true,
              },
            },
          ],
        });

        // Refetch flags
        await flagManager.fetchFlags();

        // New flag should be added
        expect(flagManager.flags.get(`new-flag`)).to.exist;
        const newEventKey = `new-flag:new123`;
        expect(flagManager.pendingFirstTimeEvents[newEventKey]).to.exist;
      });
    });

    describe(`orphaned pending events`, function () {
      it(`stores pending events even if flag is not in flags object`, async function () {
        mockResponse.json.resolves({
          code: 200,
          flags: {
            "existing-flag": {
              variant_key: `control`,
              variant_value: false,
            },
          },
          pending_first_time_events: [
            {
              flag_key: `orphaned-flag`,
              flag_id: `orphan-123`,
              project_id: 3,
              first_time_event_hash: `orphan-hash`,
              event_name: `Orphan Event`,
              property_filters: {},
              pending_variant: {
                variant_key: `orphan-variant`,
                variant_value: `orphan-value`,
                experiment_id: 999,
                is_experiment_active: true,
              },
            },
          ],
        });

        await flagManager.init();

        // Orphaned pending event should be stored
        const orphanEventKey = `orphaned-flag:orphan-hash`;
        expect(flagManager.pendingFirstTimeEvents).to.have.property(
          orphanEventKey
        );
        expect(flagManager.pendingFirstTimeEvents[orphanEventKey]).to.exist;

        // Flag should NOT be in flags Map yet
        expect(flagManager.flags.has(`orphaned-flag`)).to.be.false;
      });

      it(`creates flag entry when orphaned pending event activates`, async function () {
        mockResponse.json.resolves({
          code: 200,
          flags: {
            "existing-flag": {
              variant_key: `control`,
              variant_value: false,
            },
          },
          pending_first_time_events: [
            {
              flag_key: `orphaned-flag`,
              flag_id: `orphan-123`,
              project_id: 3,
              first_time_event_hash: `orphan-hash`,
              event_name: `Orphan Event`,
              property_filters: {},
              pending_variant: {
                variant_key: `orphan-variant`,
                variant_value: `orphan-value`,
                experiment_id: 999,
                is_experiment_active: true,
              },
            },
          ],
        });

        await flagManager.init();
        sinon.resetHistory();

        // Verify flag doesn't exist yet
        expect(flagManager.flags.has(`orphaned-flag`)).to.be.false;

        // Trigger the orphaned event
        flagManager.checkFirstTimeEvents(`Orphan Event`, {});
        await new Promise(resolve => setTimeout(resolve, 0));

        // Flag should now be created in flags Map
        expect(flagManager.flags.has(`orphaned-flag`)).to.be.true;

        const flag = flagManager.flags.get(`orphaned-flag`);
        expect(flag.key).to.equal(`orphan-variant`);
        expect(flag.value).to.equal(`orphan-value`);
        expect(flag.experiment_id).to.equal(999);

        // Should NOT track feature flag check event (deferred to getVariant)
        expect(initOptions.trackingFunc).to.not.have.been.called;

        // Should call recording endpoint
        expect(mockFetch).to.have.been.calledOnce;
      });

      it(`preserves activated orphaned flag on refetch even if not in new response`, async function () {
        // Initial response with orphaned pending event
        mockResponse.json.resolves({
          code: 200,
          flags: {},
          pending_first_time_events: [
            {
              flag_key: `orphaned-flag`,
              flag_id: `orphan-123`,
              project_id: 3,
              first_time_event_hash: `orphan-hash`,
              event_name: `Orphan Event`,
              property_filters: {},
              pending_variant: {
                variant_key: `orphan-variant`,
                variant_value: `orphan-value`,
                experiment_id: 999,
                is_experiment_active: true,
              },
            },
          ],
        });

        await flagManager.init();

        // Activate the orphaned flag
        flagManager.checkFirstTimeEvents(`Orphan Event`, {});

        // Refetch with response that doesn't include this flag at all
        mockResponse.json.resolves({
          code: 200,
          flags: {
            "some-other-flag": {
              variant_key: `other`,
              variant_value: `other`,
            },
          },
          pending_first_time_events: [],
        });

        await flagManager.fetchFlags();

        // Activated orphaned flag should still be in flags Map
        expect(flagManager.flags.has(`orphaned-flag`)).to.be.true;
        const flag = flagManager.flags.get(`orphaned-flag`);
        expect(flag.key).to.equal(`orphan-variant`);
      });
    });

    describe(`dynamic targeting loading`, function () {
      beforeEach(function () {
        // Clear targeting globals to test dynamic loading
        delete window[`__mp_targeting`];
        mockConfig.targeting_src = `https://cdn.mxpnl.com/libs/mixpanel-targeting.min.js`;
        initOptions.targetingSrc = `https://cdn.mxpnl.com/libs/mixpanel-targeting.min.js`;
        flagManager = new FeatureFlagManager(initOptions);
      });

      it(`calls loadExtraBundle when pending events have property filters`, async function () {
        await flagManager.init();

        expect(initOptions.loadExtraBundle).to.have.been.calledOnce;
        expect(initOptions.loadExtraBundle).to.have.been.calledWith(
          `https://cdn.mxpnl.com/libs/mixpanel-targeting.min.js`,
          sinon.match.func
        );
      });

      it(`does not call loadExtraBundle when no pending events have property filters`, async function () {
        mockResponse.json.resolves({
          code: 200,
          flags: {
            "onboarding-checklist": {
              variant_key: `control`,
              variant_value: false,
            },
          },
          pending_first_time_events: [
            {
              flag_key: `onboarding-checklist`,
              flag_id: `flag-123`,
              project_id: 3,
              first_time_event_hash: `abc123def456`,
              event_name: `Dashboard Viewed`,
              property_filters: {}, // Empty filters
              pending_variant: {
                variant_key: `treatment`,
                variant_value: true,
                experiment_id: 123,
                is_experiment_active: true,
              },
            },
          ],
        });

        // Reset spy since beforeEach already called new FeatureFlagManager
        initOptions.loadExtraBundle.resetHistory();

        await flagManager.init();

        expect(initOptions.loadExtraBundle).to.not.have.been.called;
      });

      it(`does not call loadExtraBundle when targeting is already loaded`, async function () {
        // Pre-load targeting by setting window['__mp_targeting'] directly
        window[`__mp_targeting`] = Promise.resolve({
          eventMatchesCriteria: function(eventName, properties, criteria) {
            if (eventName !== criteria.event_name) {
              return { matches: false };
            }
            return { matches: true };
          }
        });

        // Reset spy since beforeEach already called new FeatureFlagManager
        initOptions.loadExtraBundle.resetHistory();

        await flagManager.init();

        expect(initOptions.loadExtraBundle).to.not.have.been.called;
      });

      it(`logs error when checkFirstTimeEvents is called without targeting loaded`, async function () {
        mockResponse.json.resolves({
          code: 200,
          flags: {
            "premium-welcome": {
              variant_key: `control`,
              variant_value: null,
            },
          },
          pending_first_time_events: [
            {
              flag_key: `premium-welcome`,
              flag_id: `flag-456`,
              project_id: 3,
              first_time_event_hash: `xyz789`,
              event_name: `Purchase Complete`,
              property_filters: {
                ">": [{ var: `amount` }, 100],
              },
              pending_variant: {
                variant_key: `premium`,
                variant_value: { discount: 20 },
                experiment_id: 456,
                is_experiment_active: true,
              },
            },
          ],
        });

        // Don't let loadExtraBundle actually load targeting
        initOptions.loadExtraBundle = sinon.stub();
        initOptions.targetingSrc = `https://cdn.mxpnl.com/libs/mixpanel-targeting.min.js`;

        flagManager = new FeatureFlagManager(initOptions);
        await flagManager.init();

        // Try to check event before targeting loads
        flagManager.checkFirstTimeEvents(`Purchase Complete`, { amount: 150 });

        // Flag should not be activated (fail closed)
        const flag = flagManager.flags.get(`premium-welcome`);
        expect(flag.key).to.equal(`control`);
      });
    });
  });

  describe(`loadFlags`, function () {
    it(`fetches flags when no request is in flight`, async function () {
      await flagManager.init();
      mockFetch.resetHistory();

      await flagManager.loadFlags();

      expect(mockFetch).to.have.been.calledOnce;
    });

    it(`reuses in-flight fetch instead of starting a new one`, async function () {
      // Make fetch hang so the request is genuinely in-flight
      let resolveFetch;
      mockFetch.onFirstCall().returns(new Promise(function (resolve) { resolveFetch = resolve; }));

      // Don't await init: the fetch is hung. One macrotask is enough for init's load step to
      // resolve and assign this.fetchPromise to the in-flight fetch.
      flagManager.init();
      await new Promise(function (resolve) { setTimeout(resolve, 0); });

      const loadPromise = flagManager.loadFlags();

      // Unblock the first fetch so the test can clean up
      resolveFetch(mockResponse);
      await loadPromise;

      // Should NOT have started a second fetch
      expect(mockFetch).to.have.been.calledOnce;
    });

    it(`reuses in-flight fetch and rejects if that fetch fails`, async function () {
      // Make fetch hang so the request is genuinely in-flight, then reject
      let rejectFetch;
      mockFetch.onFirstCall().returns(new Promise(function (resolve, reject) { rejectFetch = reject; }));

      flagManager.init();
      await new Promise(function (resolve) { setTimeout(resolve, 0); });

      const loadPromise = flagManager.loadFlags();

      // Should NOT have started a second fetch
      expect(mockFetch).to.have.been.calledOnce;

      // Reject the in-flight fetch
      rejectFetch(new Error(`Network error`));

      try {
        await loadPromise;
        expect.fail(`loadFlags should have rejected`);
      } catch (err) {
        expect(err).to.be.an.instanceOf(Error);
        expect(err.message).to.equal(`Network error`);
      }
    });

    it(`returns resolved promise when system is not enabled`, async function () {
      initOptions.getConfigFunc.withArgs(`flags`).returns(null);
      flagManager = new FeatureFlagManager(initOptions);

      const result = await flagManager.loadFlags();

      expect(result).to.be.undefined;
      expect(mockFetch).not.to.have.been.called;
    });

    it(`resolves when fetch succeeds`, async function () {
      await flagManager.init();
      mockFetch.resetHistory();

      // loadFlags should resolve without error on success
      await flagManager.loadFlags();

      expect(mockFetch).to.have.been.calledOnce;
    });

    it(`rejects when fetch fails with a network error`, async function () {
      await flagManager.init();

      // Make next fetch fail with network error
      mockFetch.rejects(new Error(`Network error`));

      try {
        await flagManager.loadFlags();
        expect.fail(`loadFlags should have rejected`);
      } catch (err) {
        expect(err).to.be.an.instanceOf(Error);
        expect(err.message).to.equal(`Network error`);
      }
    });

    it(`rejects when fetch returns a bad response`, async function () {
      await flagManager.init();

      // Make next fetch return a response with invalid JSON / no flags
      mockResponse.json.resolves({ code: 200 }); // no 'flags' key

      try {
        await flagManager.loadFlags();
        expect.fail(`loadFlags should have rejected`);
      } catch (err) {
        expect(err).to.be.an.instanceOf(Error);
        expect(err.message).to.equal(`No flags in API response`);
      }
    });

    it(`rejects for all callers of fetchFlags when fetch fails`, async function () {
      await flagManager.init();

      // Make next fetch fail with network error
      mockFetch.rejects(new Error(`Network error`));

      // fetchFlags now always rejects on error; callers like init/updateContext add their own .catch()
      try {
        await flagManager.fetchFlags();
        expect.fail(`fetchFlags should have rejected`);
      } catch (err) {
        expect(err).to.be.an.instanceOf(Error);
        expect(err.message).to.equal(`Network error`);
      }
    });

    it(`rejects when called while an init-triggered fetch is in-flight and that fetch fails`, async function () {
      // Make init's fetch hang, then fail
      let rejectFetch;
      mockFetch.onFirstCall().returns(new Promise(function (resolve, reject) { rejectFetch = reject; }));

      flagManager.init();
      await new Promise(function (resolve) { setTimeout(resolve, 0); });

      const loadPromise = flagManager.loadFlags();

      // loadFlags should reuse the in-flight fetch, not start a new one
      expect(mockFetch).to.have.been.calledOnce;

      // Reject init's fetch
      rejectFetch(new Error(`Init network error`));

      try {
        await loadPromise;
        expect.fail(`loadFlags should have rejected`);
      } catch (err) {
        expect(err).to.be.an.instanceOf(Error);
        expect(err.message).to.equal(`Init network error`);
      }
    });

    it(`rejects when called while an updateContext-triggered fetch is in-flight and that fetch fails`, async function () {
      await flagManager.init();

      // Configure updateContext fetch to hang, then fail
      let rejectUpdateContextFetch;
      mockFetch
        .onSecondCall().returns(new Promise(function (resolve, reject) { rejectUpdateContextFetch = reject; }));

      flagManager.updateContext({key: `value`});

      // loadFlags should reuse updateContext's in-flight fetch, not start a new one
      const loadPromise = flagManager.loadFlags();
      expect(mockFetch).to.have.been.calledTwice; // init + updateContext, NOT a third call

      // Reject the updateContext fetch
      rejectUpdateContextFetch(new Error(`UpdateContext network error`));

      try {
        await loadPromise;
        expect.fail(`loadFlags should have rejected`);
      } catch (err) {
        expect(err).to.be.an.instanceOf(Error);
        expect(err.message).to.equal(`UpdateContext network error`);
      }
    });

    it(`preserves previously-fetched flags after a failed loadFlags`, async function () {
      await flagManager.init();

      // Verify flags were loaded
      expect(flagManager.flags).to.be.instanceOf(Map);
      expect(flagManager.flags.size).to.equal(3);

      // Make the next fetch fail
      mockFetch.rejects(new Error(`Network error`));

      try {
        await flagManager.loadFlags();
        expect.fail(`loadFlags should have rejected`);
      } catch (err) {
        expect(err.message).to.equal(`Network error`);
      }

      // Flags from the initial successful fetch should still be accessible
      expect(flagManager.flags).to.be.instanceOf(Map);
      expect(flagManager.flags.size).to.equal(3);

      const deepThoughtFlag = flagManager.flags.get(`deepThoughtAnswerExperiment`);
      expect(deepThoughtFlag.key).to.equal(`fortyTwo`);
      expect(deepThoughtFlag.value).to.equal(`42`);

      // Sync methods should still work
      expect(flagManager.areFlagsReady()).to.be.true;
      const variant = flagManager.getVariantSync(`deepThoughtAnswerExperiment`);
      expect(variant.key).to.equal(`fortyTwo`);
    });
  });

  describe(`reset`, function () {
    setupFakeIDB();

    it(`clears fetched flags`, async function () {
      await flagManager.init();
      flagManager.reset();

      const fallback = { value: `fallback-value` };
      expect(flagManager.getVariantSync(`deepThoughtAnswerExperiment`, fallback)).to.deep.equal({ value: `fallback-value`, variant_source: `fallback` });
    });

    it(`triggers a new fetchFlags call`, async function () {
      await flagManager.init();
      mockFetch.resetHistory();

      await flagManager.reset();

      expect(mockFetch).to.have.been.calledOnce;
    });

    it(`is a best effort call`, async function () {
      await flagManager.init();
      mockFetch.rejects(new Error(`Network error`));
      await flagManager.reset();
    });

    it(`clears persisted variants when persistence is enabled`, async function () {
      mockConfig.flags.persistence = { variantLookupPolicy: VariantLookupPolicy.PERSISTENCE_UNTIL_NETWORK_SUCCESS };
      await flagManager.init();

      const clearSpy = sinon.spy(flagManager.persistence, `clear`);
      await flagManager.reset();

      expect(clearSpy).to.have.been.calledOnce;
    });

    it(`refetches with the new distinct_id after distinct_id changes`, async function () {
      mockConfig.flags.persistence = { variantLookupPolicy: VariantLookupPolicy.PERSISTENCE_UNTIL_NETWORK_SUCCESS };
      await flagManager.init();
      mockFetch.resetHistory();
      initOptions.getPropertyFunc.withArgs(`distinct_id`).returns(`new-distinct-id`);

      await flagManager.reset();

      const contextParam = new URL(mockFetch.firstCall.args[0]).searchParams.get(`context`);
      expect(JSON.parse(contextParam).distinct_id).to.equal(`new-distinct-id`);
    });
  });

  describe(`getAllVariants`, function () {
    setupFakeIDB();

    it(`returns empty Map when init has not been called`, async function () {
      expect(await flagManager.getAllVariants()).to.deep.equal(new Map());
    });

    it(`returns the full flags Map after fetch resolves`, async function () {
      await flagManager.init();
      const result = await flagManager.getAllVariants();
      expect(result.get(`deepThoughtAnswerExperiment`).key).to.equal(`fortyTwo`);
    });

    it(`returns empty Map on fetch failure with networkOnly persistence policy`, async function () {
      mockFetch.rejects(new Error(`Network error`));
      await flagManager.init();
      expect(await flagManager.getAllVariants()).to.deep.equal(new Map());
    });

    it(`with networkFirst, returns the persisted Map when fetch fails`, async function () {
      mockConfig.flags.persistence = { variantLookupPolicy: VariantLookupPolicy.NETWORK_FIRST };
      await seedPersistedVariants(VariantLookupPolicy.NETWORK_FIRST, `test-distinct-id`, `test-device-id`, {
        flagA: { key: `seeded`, value: `cached` },
      });
      mockFetch.rejects(new Error(`Network error`));
      await flagManager.init();

      const result = await flagManager.getAllVariants();
      expect(result.get(`flagA`).key).to.equal(`seeded`);
      expect(result.get(`flagA`).variant_source).to.equal(`persistence`);
    });

    it(`with persistenceUntilNetworkSuccess, resolves immediately from cache without awaiting in-flight fetch`, async function () {
      mockConfig.flags.persistence = { variantLookupPolicy: VariantLookupPolicy.PERSISTENCE_UNTIL_NETWORK_SUCCESS };
      await seedPersistedVariants(VariantLookupPolicy.PERSISTENCE_UNTIL_NETWORK_SUCCESS, `test-distinct-id`, `test-device-id`, {
        flagA: { key: `cached`, value: `v1` },
      });
      makeFetchHang();
      // We can't await init() here: it would await the hung fetch. Awaiting the persistence load
      // step alone is enough to populate this.flags from cache.
      flagManager.init();
      await flagManager.persistenceLoadedPromise;

      const result = await flagManager.getAllVariants();
      expect(result.get(`flagA`).key).to.equal(`cached`);
    });

    it(`restores pendingFirstTimeEvents from persistence`, async function () {
      mockConfig.flags.persistence = { variantLookupPolicy: VariantLookupPolicy.PERSISTENCE_UNTIL_NETWORK_SUCCESS };
      const pending = { 'flagA:hash1': { flag_key: `flagA`, event_name: `Viewed` } };
      await seedPersistedVariants(
        VariantLookupPolicy.PERSISTENCE_UNTIL_NETWORK_SUCCESS,
        `test-distinct-id`,
        `test-device-id`,
        { flagA: { key: `cached`, value: `v1` } },
        pending
      );
      makeFetchHang();
      flagManager.init();
      await flagManager.persistenceLoadedPromise;

      expect(flagManager.pendingFirstTimeEvents).to.deep.equal(pending);
      expect(flagManager.activatedFirstTimeEvents).to.deep.equal({});
    });

    it(`with disable_persistence: true, ignores seeded IDB and effectively becomes networkOnly`, async function () {
      mockConfig.flags.persistence = { variantLookupPolicy: VariantLookupPolicy.PERSISTENCE_UNTIL_NETWORK_SUCCESS };
      mockConfig.disable_persistence = true;
      await seedPersistedVariants(VariantLookupPolicy.PERSISTENCE_UNTIL_NETWORK_SUCCESS, `test-distinct-id`, `test-device-id`, {
        flagA: { key: `seeded`, value: `cached` },
      });

      await flagManager.init();

      expect(flagManager.persistence.getPolicy()).to.equal(VariantLookupPolicy.NETWORK_ONLY);
      const result = await flagManager.getAllVariants();
      expect(result.get(`deepThoughtAnswerExperiment`).variant_source).to.equal(`network`);
      expect(result.has(`flagA`)).to.equal(false);
    });
  });

  describe(`getAllVariantsSync`, function () {
    it(`returns an empty map when flags is null`, function () {
      expect(flagManager.getAllVariantsSync()).to.deep.equal(new Map());
    });

    it(`returns the flags Map when populated`, async function () {
      await flagManager.init();
      expect(flagManager.getAllVariantsSync()).to.equal(flagManager.flags);
    });

    it(`does not trigger an exposure event`, async function () {
      await flagManager.init();
      initOptions.trackingFunc.resetHistory();

      flagManager.getAllVariantsSync();

      expect(initOptions.trackingFunc).to.not.have.been.called;
    });
  });

  describe(`getVariant`, function () {
    setupFakeIDB();

    it(`with networkOnly, awaits fetch and returns variant on success`, async function () {
      await flagManager.init();
      const variant = await flagManager.getVariant(`deepThoughtAnswerExperiment`, { value: `fallback` });
      expect(variant.key).to.equal(`fortyTwo`);
    });

    it(`with networkOnly, returns fallback on fetch failure`, async function () {
      mockFetch.rejects(new Error(`Network error`));
      await flagManager.init();

      const fallback = { value: `fallback-value` };
      expect(await flagManager.getVariant(`deepThoughtAnswerExperiment`, fallback)).to.deep.equal({ value: `fallback-value`, variant_source: `fallback` });
    });

    it(`with networkFirst, returns the persisted variant on fetch failure`, async function () {
      mockConfig.flags.persistence = { variantLookupPolicy: VariantLookupPolicy.NETWORK_FIRST };
      await seedPersistedVariants(VariantLookupPolicy.NETWORK_FIRST, `test-distinct-id`, `test-device-id`, {
        flagA: { key: `cached-key`, value: `cached-value` },
      });
      mockFetch.rejects(new Error(`Network error`));
      await flagManager.init();

      const variant = await flagManager.getVariant(`flagA`, { value: `fallback` });
      expect(variant.key).to.equal(`cached-key`);
      expect(variant.variant_source).to.equal(`persistence`);
    });

    it(`with persistenceUntilNetworkSuccess, resolves immediately from cache without awaiting in-flight fetch`, async function () {
      mockConfig.flags.persistence = { variantLookupPolicy: VariantLookupPolicy.PERSISTENCE_UNTIL_NETWORK_SUCCESS };
      await seedPersistedVariants(VariantLookupPolicy.PERSISTENCE_UNTIL_NETWORK_SUCCESS, `test-distinct-id`, `test-device-id`, {
        flagA: { key: `cached`, value: `v1` },
      });
      makeFetchHang();
      // We can't await init() here: it would await the hung fetch. One macrotask is enough for
      // the persistence load step to resolve and populate this.flags from cache.
      flagManager.init();
      await new Promise(function (resolve) { setTimeout(resolve, 0); });

      const variant = await flagManager.getVariant(`flagA`, { value: `fallback` });
      expect(variant.key).to.equal(`cached`);
    });
  });

  describe(`TTL expiry on read`, function () {
    setupFakeIDB();

    const TTL_MS = 24 * 60 * 60 * 1000;

    async function loadPersistedVariants(variants, pending) {
      mockConfig.flags.persistence = { variantLookupPolicy: VariantLookupPolicy.NETWORK_FIRST };
      await seedPersistedVariants(
        VariantLookupPolicy.NETWORK_FIRST,
        `test-distinct-id`,
        `test-device-id`,
        variants,
        pending
      );
      mockFetch.rejects(new Error(`Network error`));
      await flagManager.init();
    }

    function advanceTimePast(ms) {
      const now = Date.now();
      sinon.stub(Date, `now`).returns(now + ms);
    }

    it(`returns the persisted variant when within TTL and does not clear persistence`, async function () {
      await loadPersistedVariants({ flagA: { key: `cached`, value: `v1` } });
      const clearSpy = sinon.spy(flagManager.persistence, `clear`);

      const variant = flagManager.getVariantSync(`flagA`, { value: `fallback` });

      expect(variant.key).to.equal(`cached`);
      expect(flagManager.flags).to.not.be.null;
      expect(clearSpy).to.not.have.been.called;
    });

    it(`getVariantSync returns fallback when loaded persistence is stale and leaves in-memory state intact`, async function () {
      await loadPersistedVariants({ flagA: { key: `cached`, value: `v1` } });
      const clearSpy = sinon.spy(flagManager.persistence, `clear`);
      advanceTimePast(TTL_MS + 1000);

      const fallback = { value: `fallback` };
      const result = flagManager.getVariantSync(`flagA`, fallback);

      expect(result).to.deep.equal({ value: `fallback`, variant_source: `fallback` });
      expect(flagManager.flags).to.not.be.null;
      expect(flagManager.flags.has(`flagA`)).to.be.true;
      expect(clearSpy).to.not.have.been.called;
    });

    it(`getAllVariantsSync returns empty Map when loaded persistence is stale and leaves in-memory state intact`, async function () {
      await loadPersistedVariants({ flagA: { key: `cached`, value: `v1` } });
      const clearSpy = sinon.spy(flagManager.persistence, `clear`);
      advanceTimePast(TTL_MS + 1000);

      const result = flagManager.getAllVariantsSync();

      expect(result).to.deep.equal(new Map());
      expect(flagManager.flags).to.not.be.null;
      expect(flagManager.flags.has(`flagA`)).to.be.true;
      expect(clearSpy).to.not.have.been.called;
    });

    it(`leaves network-sourced variants untouched even if simulated time passes TTL`, async function () {
      await flagManager.init(); // NETWORK_ONLY default; this.flags comes from the network response
      const clearSpy = sinon.spy(flagManager.persistence, `clear`);
      advanceTimePast(TTL_MS * 365);

      const variant = flagManager.getVariantSync(`deepThoughtAnswerExperiment`, { value: `fallback` });

      expect(variant.key).to.equal(`fortyTwo`);
      expect(flagManager.flags).to.not.be.null;
      expect(clearSpy).to.not.have.been.called;
    });

    it(`async getVariant returns fallback when loaded persistence is stale`, async function () {
      await loadPersistedVariants({ flagA: { key: `cached`, value: `v1` } });
      advanceTimePast(TTL_MS + 1000);

      const fallback = { value: `fallback` };
      const result = await flagManager.getVariant(`flagA`, fallback);

      expect(result).to.deep.equal({ value: `fallback`, variant_source: `fallback` });
      expect(flagManager.flags).to.not.be.null;
    });

    it(`async getAllVariants returns empty Map when loaded persistence is stale`, async function () {
      await loadPersistedVariants({ flagA: { key: `cached`, value: `v1` } });
      advanceTimePast(TTL_MS + 1000);

      const result = await flagManager.getAllVariants();

      expect(result).to.deep.equal(new Map());
      expect(flagManager.flags).to.not.be.null;
    });

    it(`preserves both pendingFirstTimeEvents and trackedFeatures on expiry`, async function () {
      const pending = { 'flagA:hash1': { flag_key: `flagA`, event_name: `Viewed` } };
      await loadPersistedVariants({ flagA: { key: `cached`, value: `v1` } }, pending);
      flagManager.trackedFeatures.add(`previouslyTrackedFlag`);
      advanceTimePast(TTL_MS + 1000);

      flagManager.getVariantSync(`flagA`, { value: `fallback` });

      expect(flagManager.pendingFirstTimeEvents).to.deep.equal(pending);
      expect(flagManager.trackedFeatures.has(`previouslyTrackedFlag`)).to.be.true;
    });

    it(`with persistenceUntilNetworkSuccess, awaits in-flight fetch when persisted variants expire in-session and returns the network value`, async function () {
      mockConfig.flags.persistence = { variantLookupPolicy: VariantLookupPolicy.PERSISTENCE_UNTIL_NETWORK_SUCCESS };
      await seedPersistedVariants(VariantLookupPolicy.PERSISTENCE_UNTIL_NETWORK_SUCCESS, `test-distinct-id`, `test-device-id`, {
        flagA: { key: `cached`, value: `v1` },
      });

      let resolveFetch;
      mockFetch.returns(new Promise(function (resolve) { resolveFetch = resolve; }));
      mockResponse.json.resolves({ code: 200, flags: {
        flagA: { variant_key: `fresh`, variant_value: `v2` },
      }});

      flagManager.init();
      await flagManager.persistenceLoadedPromise;
      advanceTimePast(TTL_MS + 1000);

      const pendingResult = flagManager.getVariant(`flagA`, { value: `fallback` });
      resolveFetch(mockResponse);
      const result = await pendingResult;

      expect(result.key).to.equal(`fresh`);
      expect(result.value).to.equal(`v2`);
    });

    it(`with persistenceUntilNetworkSuccess, awaits in-flight fetch when persisted variants expire in-session and returns fallback when the network fails`, async function () {
      mockConfig.flags.persistence = { variantLookupPolicy: VariantLookupPolicy.PERSISTENCE_UNTIL_NETWORK_SUCCESS };
      await seedPersistedVariants(VariantLookupPolicy.PERSISTENCE_UNTIL_NETWORK_SUCCESS, `test-distinct-id`, `test-device-id`, {
        flagA: { key: `cached`, value: `v1` },
      });

      let rejectFetch;
      mockFetch.returns(new Promise(function (_resolve, reject) { rejectFetch = reject; }));

      flagManager.init();
      await flagManager.persistenceLoadedPromise;
      advanceTimePast(TTL_MS + 1000);

      const fallback = { value: `fallback` };
      const pendingResult = flagManager.getVariant(`flagA`, fallback);
      rejectFetch(new Error(`Network error`));
      const result = await pendingResult;

      expect(result).to.deep.equal({ value: `fallback`, variant_source: `fallback` });
    });
  });
});
