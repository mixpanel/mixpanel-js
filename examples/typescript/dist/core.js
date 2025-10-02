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
