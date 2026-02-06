import chai, { expect } from "chai";
import sinon from "sinon";
import sinonChai from "sinon-chai";
import * as jsonLogic from "json-logic-js";

import { window } from "../../src/window";
import Config from "../../src/config";

import { FeatureFlagManager } from "../../src/flags/index";
import { getTargetingPromise } from "../../src/targeting/loader";
import {
  lowercaseKeysAndValues,
  lowercaseOnlyLeafNodes
} from "../../src/targeting/event-matcher";

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

  describe(`init`, function () {
    it(`does not fetch flags when system is disabled`, function () {
      initOptions.getConfigFunc.withArgs(`flags`).returns(null);

      flagManager.init();

      expect(mockFetch).not.to.have.been.called;
    });

    it(`makes GET request to correct endpoint with proper headers and query parameters`, function () {
      flagManager.init();

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

    it(`sends correct parameters with distinct_id, device_id, and context in URL`, function () {
      flagManager.init();

      const [url] = mockFetch.firstCall.args;
      const urlObj = new URL(url);
      const contextParam = urlObj.searchParams.get(`context`);
      const context = JSON.parse(decodeURIComponent(contextParam));

      expect(context.distinct_id).to.equal(`test-distinct-id`);
      expect(context.device_id).to.equal(`test-device-id`);
      expect(context.user_id).to.equal(`test-user`);
      expect(context.group_id).to.equal(`test-group`);
    });

    it(`sends parameters with only distinct_id and device_id when no additional context configured`, function () {
      mockConfig.flags = {};

      flagManager.init();

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
      flagManager.init();

      await flagManager.fetchPromise;

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

      flagManager.init();

      await flagManager.fetchPromise;

      expect(flagManager.flags).to.be.instanceOf(Map);
      expect(flagManager.flags.size).to.equal(0);
    });

    it(`handles network fetch errors gracefully`, async function () {
      mockFetch.rejects(new Error(`Network error`));

      flagManager.init();

      await flagManager.fetchPromise;
    });
  });

  describe(`getVariantValue`, function () {
    beforeEach(function () {
      flagManager.init();
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
                ">": [{ var: `properties.amount` }, 100],
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
        flagManager.init();
        await flagManager.fetchPromise;

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
        flagManager.init();
        await flagManager.fetchPromise;

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

        flagManager.init();
        await flagManager.fetchPromise;

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
                var lowercasedProperties = lowercaseKeysAndValues(properties || {});
                var lowercasedFilters = lowercaseOnlyLeafNodes(criteria.property_filters);
                var data = { properties: lowercasedProperties };
                var filtersMatch = jsonLogic.apply(lowercasedFilters, data);
                return { matches: filtersMatch };
              } catch (error) {
                return { matches: false, error: error.toString() };
              }
            }
            return { matches: true };
          }
        });

        flagManager.init();
        await flagManager.fetchPromise;
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

      it(`matches properties case-insensitively`, async function () {
        // Event with uppercase property keys and values should still match
        flagManager.checkFirstTimeEvents(`Purchase Complete`, {
          Amount: 150,
          CATEGORY: `PREMIUM`,
        });
        await new Promise(resolve => setTimeout(resolve, 0));

        const flag = flagManager.flags.get(`premium-welcome`);
        expect(flag.key).to.equal(`premium`);
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

        flagManager.init();
        await flagManager.fetchPromise;

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
                var lowercasedProperties = lowercaseKeysAndValues(properties || {});
                var lowercasedFilters = lowercaseOnlyLeafNodes(criteria.property_filters);
                var data = { properties: lowercasedProperties };
                var filtersMatch = jsonLogic.apply(lowercasedFilters, data);
                return { matches: filtersMatch };
              } catch (error) {
                return { matches: false, error: error.toString() };
              }
            }
            return { matches: true };
          }
        });

        flagManager.init();
        await flagManager.fetchPromise;
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

        flagManager.init();
        await flagManager.fetchPromise;

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

        flagManager.init();
        await flagManager.fetchPromise;
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

        flagManager.init();
        await flagManager.fetchPromise;

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
      });

      it(`calls loadExtraBundle when pending events have property filters`, async function () {
        flagManager.init();
        await flagManager.fetchPromise;

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

        flagManager.init();
        await flagManager.fetchPromise;

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

        flagManager.init();
        await flagManager.fetchPromise;

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
                ">": [{ var: `properties.amount` }, 100],
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

        flagManager = new FeatureFlagManager(initOptions);
        flagManager.init();
        await flagManager.fetchPromise;

        // Try to check event before targeting loads
        flagManager.checkFirstTimeEvents(`Purchase Complete`, { amount: 150 });

        // Flag should not be activated (fail closed)
        const flag = flagManager.flags.get(`premium-welcome`);
        expect(flag.key).to.equal(`control`);
      });
    });
  });
});
