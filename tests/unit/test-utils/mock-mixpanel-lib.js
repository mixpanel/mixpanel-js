/* eslint-disable camelcase */

// stubbable mixpanel lib mock with some reasonable defaults
export class MockMixpanelLib {
  /**
   * @param {import('../../../src/index').Config} config
   */
  constructor(config) {
    this._config = Object.assign({
      token: `test-token`,
      'record_sessions_percent': 100,
      'record_min_ms': 0,
      'record_max_ms': 24 * 60 * 60 * 1000,
      'record_idle_timeout_ms': 30 * 60 * 1000,
      'name': `mp_test`,
      'api_host': `https://api.mixpanel.com`,
      'api_routes': {
        'record': `record`,
      },
      'opt_out_tracking_persistence_type': `localStorage`,
      // helpful for some debugging, commented out for noise
      // 'error_reporter': console.error
    }, config || {});
  }

  get_distinct_id() {
    return `test-distinct-id`;
  }

  get_config(configVar) {
    return this._config[configVar];
  }

  get_api_host() {
    return this.get_config('api_host');
  }

  get_property (propName) {
    return {
      '$device_id': `test-device-id`,
      '$user_id': `test-user-id`,
    }[propName];
  }

  get_tab_id () {
    return `test-tab-id`;
  }
}
