import mixpanel from '../../../build/mixpanel.cjs.js';
import { PARENT_PORT } from '../test-ports';

var parentOrigin = window.location.protocol + `//` + window.location.hostname + `:` + PARENT_PORT;

mixpanel.init(`RECORDER_TEST_TOKEN`, {
  debug: true,
  record_sessions_percent: 100,
  record_allowed_iframe_origins: [parentOrigin],
  record_console: false,
  loaded: function() {
    window.parent.postMessage({type: `mp_test_child_ready`}, `*`);
  }
});

// Respond to state queries from parent test
window.addEventListener(`message`, function(event) {
  if (event.data && event.data.type === `mp_test_query_state`) {
    var props = {};
    try { props = mixpanel.get_session_recording_properties(); } catch(e) {} // eslint-disable-line no-empty
    event.source.postMessage({
      type: `mp_test_state_response`,
      replayId: props[`$mp_replay_id`] || null,
      distinctId: mixpanel.get_distinct_id()
    }, event.origin);
  }
});
