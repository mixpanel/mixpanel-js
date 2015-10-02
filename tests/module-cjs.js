var mixpanel = require('../build/mixpanel.cjs');

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
