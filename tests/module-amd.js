QUnit.config.autostart = false;

requirejs(['../build/mixpanel.amd'], function(mixpanel) {

    $('#qunit-tests').addClass('hidepass');
    mixpanel.init("MIXPANEL_TOKEN", {
        cookie_name: "test",
        reset_cookie: true,
        debug: true
    });

    test_mixpanel(mixpanel);

    test('mixpanel object is not attached to window', 1, function() {
        ok(_.isUndefined(window.mixpanel), "window.mixpanel should be undefined");
    });

    QUnit.start();

});
