(function() {
    // add ?hidepass query param to hide results of successful test cases
    if (window.location.href.indexOf('hidepass') >= 0) {
        $('#qunit-tests').addClass('hidepass');
    }

    window.mixpanel.init("MIXPANEL_TOKEN",
    {
        cookie_name: "test",
        reset_cookie: true,
        debug: true,
        loaded: function(mixpanel) {
            mixpanel.init("MIXPANEL_NONBATCHING_TOKEN", {
                batch_requests: false,
                debug: true,
            }, "nonbatching");
            testMixpanel(mixpanel);
        }
    });

    testAsync(window.mixpanel);
})(window);
