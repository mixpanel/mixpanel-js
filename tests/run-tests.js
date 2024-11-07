(function() {
    // add ?hidepass query param to hide results of successful test cases
    if (window.location.href.indexOf('hidepass') >= 0) {
        $('#qunit-tests').addClass('hidepass');
    }

    var initPromise = new Promise(function(resolve) {
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
                    resolve(mixpanel);
                }
            });
    });
    window.initPromise = initPromise;
    var testAsyncPromise = new Promise(function(resolve) {
        testAsync(window.mixpanel, resolve);
    });

    testAsyncPromise
        .then(function() {
            return initPromise;
        })
        .then(function(mp) {
            testMixpanel(mp);
        });
})(window);
