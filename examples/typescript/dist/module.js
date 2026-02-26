import mixpanel from '../../../dist/mixpanel.cjs.js';
mixpanel.init("FAKE_TOKEN", {
    debug: true,
    loaded: function () {
        mixpanel.track('loaded() callback works but is unnecessary');
        console.log("Mixpanel cjs loaded successfully with TypeScript");
    },
    remote_settings_mode: 'fallback',
    record_console: true,
    record_network: true,
    record_network_options: {
        initiatorTypes: ['fetch', 'xmlhttprequest', 'img', 'link'],
        ignoreRequestUrls: ['https://example.com/ignore-this-url'],
        ignoreRequestFn: function (data) {
            var _a;
            return ((_a = data.responseHeaders) === null || _a === void 0 ? void 0 : _a['content-type']) === 'image/png';
        },
        recordHeaders: {
            request: ['content-type'],
            response: ['content-type', 'x-custom-header']
        },
        recordBodyUrls: {
            request: ['https://example.com/record-body'],
            response: ['https://example.com/record-body']
        },
        recordInitialRequests: true
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
