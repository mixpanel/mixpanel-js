var mixpanel = require('./mixpanel.umd.js');

mixpanel.init("FAKE_TOKEN", {
    debug: true,
    loaded: function() {
        alert("Mixpanel loaded successfully via Webpack/UMD");
    }
});
