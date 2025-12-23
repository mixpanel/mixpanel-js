import mixpanel from '../../../dist/mixpanel-core.cjs.js';

mixpanel.init("FAKE_TOKEN", {
    debug: true,
    loaded: function() {
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
        before_send_events: function(event) {
            console.log("before_send_events hook called with event:", event);
            // Modify event properties
            event.properties['hook_added_property'] = 'hook_value';
            return event;
        },
    },
}, "hookstuff");