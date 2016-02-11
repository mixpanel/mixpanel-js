import mixpanel from '../../src/loader-module';

mixpanel.init("FAKE_TOKEN", {
    debug: true,
    loaded: function() {
        mixpanel.track('loaded() callback works but is unnecessary');
        alert("Mixpanel loaded successfully via ES2015 Modules/Babelify");
    }
});

mixpanel.track('Tracking after mixpanel.init');
