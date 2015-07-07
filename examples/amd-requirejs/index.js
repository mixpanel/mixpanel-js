requirejs(['./mixpanel.amd'], function(mixpanel) {

    mixpanel.init("FAKE_TOKEN", {
        debug: true,
        loaded: function() {
            alert("Mixpanel loaded successfully via RequireJS/AMD");
        }
    });

});
