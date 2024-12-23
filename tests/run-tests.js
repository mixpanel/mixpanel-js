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

    // QUnit won't be able to find the test from testMixpanel using the ?filter query param
    // if it has to wait for testAsync to complete - which we want to do to avoid test leakage into testMixpanel.
    // (e.g. a request fires from testAsync and gets caught in one of testMixpanel's request stubs)
    // Since the vast majority of tests are in testMixpanel and testAsync runs at the beginning, just skip testAsync when there's a filter
    var testAsyncPromise;
    if (!QUnit.config.filter) {
        testAsyncPromise = new Promise(function(resolve) {
            testAsync(window.mixpanel, resolve);
        });
    } else {
        testAsyncPromise = Promise.resolve();
    }

    testAsyncPromise
        .then(function() {
            return initPromise;
        })
        .then(function(mp) {
            testMixpanel(mp);
        });
})(window);
