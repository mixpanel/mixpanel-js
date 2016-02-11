var mixpanel = require('./mixpanel.cjs.js');

mixpanel.init("FAKE_TOKEN", {
    debug: true,
    loaded: function() {
        mixpanel.track('loaded() callback works but is unnecessary');
        alert("Mixpanel loaded successfully via Browserify/CommonJS");
    }
});

mixpanel.track('Tracking after mixpanel.init');
