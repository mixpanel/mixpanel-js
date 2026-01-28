import mixpanel from '../../../dist/mixpanel-core.cjs.js';
mixpanel.init("FAKE_TOKEN", {
    debug: true,
    loaded: function () {
        mixpanel.track('loaded() callback works but is unnecessary');
        console.log("Mixpanel core loaded successfully with TypeScript");
    }
});
mixpanel.track('TypeScript Core Example Event', {
    source: 'typescript-core-example',
    timestamp: new Date().toISOString()
});
mixpanel.people.set({
    "$name": "TypeScript User",
    "$email": "user@example.com",
    "plan": "core"
});
mixpanel.init("FAKE_TOKEN2", {
    hooks: {
        before_identify: function (distinctId) {
            return distinctId + '_modified';
        },
        before_register: function (props) {
            props['hook_added_property'] = 'hook_value';
            return props;
        },
        before_register_once: function (props, defaultVal) {
            props['hook_added_property'] = 'hook_value';
            return [props, defaultVal];
        },
        before_send_events: function (event) {
            event.properties['hook_added_property'] = 'hook_value';
            return event;
        },
        before_track: function (eventName, properties) {
            if (eventName === 'foobar') {
                return null; // drop event
            }
            else {
                properties['hook_added_property'] = 'hook_value';
                return [eventName, properties];
            }
        },
        before_unregister: function (prop) {
            if (prop === 'do_not_remove') {
                return null; // stop, don't remove this prop
            }
            else {
                return prop;
            }
        },
    },
}, "hookstuff");
