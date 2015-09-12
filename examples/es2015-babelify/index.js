import mixpanel from './mixpanel.es6';

mixpanel.init("FAKE_TOKEN", {
    debug: true,
    loaded: function() {
        alert("Mixpanel loaded successfully via ES2015 Modules/Babelify");
    }
});
