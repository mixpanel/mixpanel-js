var mixpanel = require('./mixpanel.umd.js');

mixpanel.init("FAKE_TOKEN", {
    debug: true,
    loaded: function() {
        mixpanel.track('loaded() callback works but is unnecessary');
        alert("Mixpanel loaded successfully via Webpack/UMD");
    }
});

mixpanel.track('Tracking after mixpanel.init');
