import mixpanel from '../../../dist/mixpanel-with-async-recorder.cjs.js';

mixpanel.init("FAKE_TOKEN", {
    debug: true,
    loaded: function() {
        mixpanel.track('loaded() callback works but is unnecessary');
        console.log("Mixpanel with async recorder loaded successfully with TypeScript");
    }
});

mixpanel.track('TypeScript Example Event', {
    source: 'typescript-example',
    timestamp: new Date().toISOString()
});

mixpanel.people.set({
    "$name": "TypeScript User",
    "$email": "user@example.com",
    "plan": "core"
});
