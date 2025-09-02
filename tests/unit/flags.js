import chai, { expect } from "chai";
import sinon from "sinon";
import sinonChai from "sinon-chai";

import { FeatureFlagManager } from "../../src/flags/index";
import { window } from "../../src/window";
import Config from "../../src/config";

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
    };

    flagManager = new FeatureFlagManager(initOptions);
    flagManager.flags = null;
  });

  afterEach(function () {
    sinon.restore();
  });

  describe(`fetchFlags`, function () {
    it(`does not fetch flags when system is disabled`, function () {
      initOptions.getConfigFunc.withArgs(`flags`).returns(null);
      flagManager = new FeatureFlagManager(initOptions);
      flagManager.flags = null;

      flagManager.fetchFlags();

      expect(mockFetch).not.to.have.been.called;
    });

    it(`makes GET request to correct endpoint with proper headers and query parameters`, function () {
      flagManager.fetchFlags();

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
      flagManager.fetchFlags();

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

      flagManager.fetchFlags();

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
      flagManager.fetchFlags();

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

      flagManager.fetchFlags();

      await flagManager.fetchPromise;

      expect(flagManager.flags).to.be.instanceOf(Map);
      expect(flagManager.flags.size).to.equal(0);
    });

    it(`handles network fetch errors gracefully`, async function () {
      mockFetch.rejects(new Error(`Network error`));

      flagManager.fetchFlags();

      await flagManager.fetchPromise;
    });
  });
});
