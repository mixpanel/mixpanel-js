(function() {
    function simulateEvent(element, type) {
        if (document.createEvent) {
            // Trigger for the good browsers
            var trigger = document.createEvent('HTMLEvents');
            trigger.initEvent(type, true, true);
            element.dispatchEvent(trigger);
        } else if (document.createEventObject) {
            // Trigger for Internet Explorer
            var trigger = document.createEventObject();
            element.fireEvent('on' + type, trigger);
        }
    }

    window.testMixpanelCE = function(mixpanel, mixpanelCE) {
        setTimeout(function() {
            module("Test Collect Everything")

            var trackKey = "track";
            for (var key in mixpanel) { // if the lib is minified, we need to find the right key
                if (key != "track" && mixpanel[key] == mixpanel.track) {
                    trackKey = key;
                    break;
                }
            }

            if (mixpanelCE['__autotrack_enabled']) {
                test("Testing click", 4, function() {
                    var trackSpy = sinon.spy(mixpanel, trackKey);
                    var ceTrackSpy = sinon.spy(mixpanelCE, trackKey);
                    var aTag = document.createElement('a');
                    document.body.appendChild(aTag);
                    simulateEvent(aTag, 'click');
                    ok(trackSpy.notCalled, "Clicking a link does not fire an event for non CE lib");
                    ok(ceTrackSpy.calledOnce, "Clicking a link fires an event for CE lib");

                    var args = ceTrackSpy.args[0];
                    var event = args[0];
                    var props = args[1];
                    ok(event === "$web_event", "Event is '$web_event'");
                    ok(props['$elements'][0]['tag_name'] === "A", "Tracked element's tag name is 'A'");
                });
            } else {
              var warning = 'autotrack is disabled, not running autotrack tests';
              $('#qunit-userAgent').after($('<div class="qunit-warning" style="color:red;padding:10px;">Warning: ' + warning + '</div>'));
            }
        }, 10000); // there's a race condition where CE isn't enabled until decide responds so we need to wait for that
    };
})();
