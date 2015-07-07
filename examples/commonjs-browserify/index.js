var mixpanel = require('./mixpanel.cjs.js');

mixpanel.init("FAKE_TOKEN", {
    debug: true,
    loaded: function() {
        alert("Mixpanel loaded successfully via Browserify/CommonJS");
    }
});
