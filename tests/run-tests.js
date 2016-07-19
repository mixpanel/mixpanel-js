(function() {
    $('#qunit-tests').addClass('hidepass');
    var mixpanelLoading = $.Deferred();
    var mixpanelCELoading = $.Deferred();
    window.mixpanel.init("MIXPANEL_TOKEN",
    {
        autotrack: false,
        cookie_name: "test",
        reset_cookie: true,
        debug: true,
        loaded: function(mixpanel) {
            mixpanelLoading.resolve(mixpanel);
            testMixpanel(mixpanel);
        }
    });

    window.mixpanel.init("854983da12a1c2e164b2bca4488604d2",
    {
        autotrack: true,
        cookie_name: "test_ce",
        reset_cookie: true,
        debug: true,
        loaded: function(mixpanel) {
            mixpanelCELoading.resolve(mixpanel);
        }
    }, "ce");

    testAsync(window.mixpanel, window.mixpanel.ce);
    testCEAsync(window.mixpanel.ce);

    $.when(mixpanelLoading, mixpanelCELoading).done(function(mixpanel, mixpanelCE) {
        if (mixpanel.ce.get_config('autotrack') === true) { // could be set to false as a part of the initialization process
            testMixpanelCE(mixpanel, mixpanelCE);
        }
    });
})(window);
