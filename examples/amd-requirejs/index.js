requirejs(['./mixpanel.amd'], function(mixpanel) {

    mixpanel.init("FAKE_TOKEN", {
        debug: true,
        loaded: function() {
            mixpanel.track('loaded() callback works but is unnecessary');
            alert("Mixpanel loaded successfully via RequireJS/AMD");
        }
    });

    mixpanel.track('Tracking after mixpanel.init');

});
