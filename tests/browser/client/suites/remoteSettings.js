/* global chai, sinon */

const { expect } = chai;
import { clearLibInstance, untilDone, makeDelayedFetchResponse } from "../utils";

const SETTINGS_TEST_TOKEN = `SETTINGS_TEST_TOKEN`;

export function remoteSettingsTests(mixpanel) {
  describe(`remote_settings`, function() {
    let fetchStub;

    beforeEach(async function() {
      fetchStub = sinon.stub(window, 'fetch');
      fetchStub.returns(Promise.resolve(new Response(JSON.stringify({
        sdk_config: {
          config: {
            record_sessions_percent: 30
          }
        }
      }), {
        status: 200,
        headers: {'Content-type': 'application/json'}
      })));
    });

    afterEach(async function() {
      if (mixpanel.remote_settings) {
        mixpanel.remote_settings.stop_session_recording();
        await clearLibInstance(mixpanel, mixpanel.remote_settings);
      }
      fetchStub.restore();
    });

    it(`ignores remote settings when disabled (default)`, async function() {
      mixpanel.init(SETTINGS_TEST_TOKEN, {
        record_sessions_percent: 20,
      }, 'remote_settings');

      expect(fetchStub.called).to.equal(false, "fetch should not be called in disabled mode");
      expect(mixpanel.remote_settings.get_config('record_sessions_percent')).to.equal(20, "local settings were applied");
    });

    it(`applies fetched settings in fallback mode`, async function() {
      mixpanel.init(SETTINGS_TEST_TOKEN, {
        remote_settings_mode: 'fallback',
        record_sessions_percent: 10,
      }, 'remote_settings');

      await untilDone(() => mixpanel.remote_settings.get_config('record_sessions_percent') === 30);

      expect(fetchStub.called).to.equal(true, "fetch was called to get remote settings");
      expect(mixpanel.remote_settings.get_config('record_sessions_percent')).to.equal(30, "remote settings were applied");
    });

    it(`falls back to local settings on fetch failure`, async function() {
      fetchStub.returns(Promise.reject(new Error('Network error')));

      mixpanel.init(SETTINGS_TEST_TOKEN, {
        remote_settings_mode: 'fallback',
        record_sessions_percent: 20,
      }, 'remote_settings');

      await untilDone(() => fetchStub.called);

      expect(fetchStub.called).to.equal(true, "fetch was called to get remote settings");
      expect(mixpanel.remote_settings.get_config('record_sessions_percent')).to.equal(20, "local settings were applied");
    });

    it(`respects 500ms timeout in fallback mode`, async function() {
      var clock = sinon.useFakeTimers();

      // Return a promise that resolves after 600ms which is longer than the 500ms timeout
      fetchStub.returns(makeDelayedFetchResponse(200, {
        sdk_config: {
          config: {
            record_sessions_percent: 40
          }
        }
      }, 600));

      mixpanel.init(SETTINGS_TEST_TOKEN, {
        remote_settings_mode: 'fallback',
        record_sessions_percent: 25,
      }, 'remote_settings');

      // Tick to 500ms - this triggers the abort timeout
      await clock.tickAsync(500);

      expect(fetchStub.called).to.equal(true, "fetch was called");
      expect(mixpanel.remote_settings.get_config('record_sessions_percent')).to.equal(25, "local settings were applied after timeout");

      clock.restore();
    });

    it(`skips remote fetch without AbortController support`, async function() {
      var originalAbortController = window.AbortController;
      delete window.AbortController;

      mixpanel.init(SETTINGS_TEST_TOKEN, {
        remote_settings_mode: 'fallback',
        record_sessions_percent: 25,
      }, 'remote_settings');

      expect(fetchStub.called).to.equal(false, "fetch was not called");
      expect(mixpanel.remote_settings.get_config('record_sessions_percent')).to.equal(25, "local settings were applied");

      window.AbortController = originalAbortController;
    });

    it(`applies only valid keys from semi-invalid config in fallback mode`, async function() {
      fetchStub.returns(Promise.resolve(new Response(JSON.stringify({
        sdk_config: {
          config: {
            record_sessions_percent: 30,
            invalid_key: 'should be ignored',
            record_heatmap_data: true,
          }
        }
      }), {
        status: 200,
        headers: {'Content-type': 'application/json'}
      })));

      mixpanel.init(SETTINGS_TEST_TOKEN, {
        remote_settings_mode: 'fallback',
        record_sessions_percent: 10,
        record_heatmap_data: false,
      }, 'remote_settings');

      await untilDone(() =>
        mixpanel.remote_settings.get_config('record_sessions_percent') === 30 &&
        mixpanel.remote_settings.get_config('record_heatmap_data') === true
      );

      expect(fetchStub.called).to.equal(true, "fetch was called to get remote settings");
      expect(mixpanel.remote_settings.get_config('record_sessions_percent')).to.equal(30, "valid config key was applied");
      expect(mixpanel.remote_settings.get_config('record_heatmap_data')).to.equal(true, "another valid config key was applied");
      expect(mixpanel.remote_settings.get_config('invalid_key')).to.be.undefined;
    });

    it(`falls back to local settings when all remote keys are invalid`, async function() {
      fetchStub.returns(Promise.resolve(new Response(JSON.stringify({
        sdk_config: {
          config: {
            invalid_key: 'should be ignored',
            another_invalid_key: true,
          }
        }
      }), {
        status: 200,
        headers: {'Content-type': 'application/json'}
      })));

      mixpanel.init(SETTINGS_TEST_TOKEN, {
        remote_settings_mode: 'fallback',
        record_sessions_percent: 10,
        record_heatmap_data: false,
      }, 'remote_settings');

      await untilDone(() => fetchStub.called);

      expect(fetchStub.called).to.equal(true, "fetch was called to get remote settings");
      expect(mixpanel.remote_settings.get_config('record_sessions_percent')).to.equal(10, "local config key was applied");
      expect(mixpanel.remote_settings.get_config('record_heatmap_data')).to.equal(false, "local config key was applied");
      expect(mixpanel.remote_settings.get_config('invalid_key')).to.be.undefined;
      expect(mixpanel.remote_settings.get_config('another_invalid_key')).to.be.undefined;
    });

    it(`initializes session recording on fetch success in strict mode`, async function() {
      fetchStub.returns(Promise.resolve(new Response(JSON.stringify({
        sdk_config: {
          config: {
            record_sessions_percent: 30
          }
        }
      }), {
        status: 200,
        headers: {'Content-type': 'application/json'}
      })));

      mixpanel.init(SETTINGS_TEST_TOKEN, {
        remote_settings_mode: 'strict',
        record_sessions_percent: 10,
      }, 'remote_settings');

      await untilDone(() => mixpanel.remote_settings.get_config('record_sessions_percent') === 30);

      expect(fetchStub.called).to.equal(true, "fetch was called to get remote settings");
      expect(mixpanel.remote_settings.get_config('record_sessions_percent')).to.equal(30, "remote settings were applied");
    });

    it(`disables session recording on fetch failure in strict mode`, async function() {
      fetchStub.returns(Promise.reject(new Error('Network error')));

      mixpanel.init(SETTINGS_TEST_TOKEN, {
        remote_settings_mode: 'strict',
        record_sessions_percent: 10,
      }, 'remote_settings');

      await untilDone(() =>
        fetchStub.called &&
        mixpanel.remote_settings.get_config('record_sessions_percent') === 0
      );

      expect(fetchStub.called).to.equal(true, "fetch was called to get remote settings");
      expect(mixpanel.remote_settings.get_config('record_sessions_percent')).to.equal(0, "Recordings disabled");
    });

    it(`disables session recording when all remote keys are invalid in strict mode`, async function() {
      fetchStub.returns(Promise.resolve(new Response(JSON.stringify({
        sdk_config: {
          config: {
            invalid_key: 'should be ignored',
            another_invalid_key: 12345,
          }
        }
      }), {
        status: 200,
        headers: {'Content-type': 'application/json'}
      })));

      mixpanel.init(SETTINGS_TEST_TOKEN, {
        remote_settings_mode: 'strict',
        record_sessions_percent: 20,
      }, 'remote_settings');

      await untilDone(() =>
        fetchStub.called &&
        mixpanel.remote_settings.get_config('record_sessions_percent') === 0
      );

      expect(fetchStub.called).to.equal(true, "fetch was called to get remote settings");
      expect(mixpanel.remote_settings.get_config('record_sessions_percent')).to.equal(0, "recordings disabled when no valid remote config keys found");
      expect(mixpanel.remote_settings.get_config('invalid_key')).to.be.undefined;
      expect(mixpanel.remote_settings.get_config('another_invalid_key')).to.be.undefined;
    });

    it(`applies only valid keys from semi-invalid config in strict mode`, async function() {
      fetchStub.returns(Promise.resolve(new Response(JSON.stringify({
        sdk_config: {
          config: {
            record_sessions_percent: 30,
            invalid_key: 'should be ignored',
          }
        }
      }), {
        status: 200,
        headers: {'Content-type': 'application/json'}
      })));

      mixpanel.init(SETTINGS_TEST_TOKEN, {
        remote_settings_mode: 'strict',
        record_sessions_percent: 10,
        record_heatmap_data: false,
      }, 'remote_settings');

      await untilDone(() => mixpanel.remote_settings.get_config('record_sessions_percent') === 30);

      expect(fetchStub.called).to.equal(true, "fetch was called to get remote settings");
      expect(mixpanel.remote_settings.get_config('record_sessions_percent')).to.equal(30, "valid config key was applied");
      expect(mixpanel.remote_settings.get_config('record_heatmap_data')).to.equal(false, "local key still applied");
      expect(mixpanel.remote_settings.get_config('invalid_key')).to.be.undefined;
    });
  });
}
