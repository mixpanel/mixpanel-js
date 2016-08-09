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
            var trackKey, trackSpy, ceTrackSpy;
            module("Test Collect Everything", {
                setup: function() {
                    trackKey = "track";
                    for (var key in mixpanel) { // if the lib is minified, we need to find the right key
                        if (key != "track" && mixpanel[key] == mixpanel.track) {
                            trackKey = key;
                            break;
                        }
                    }

                    trackSpy = sinon.spy(mixpanel, trackKey);
                    ceTrackSpy = sinon.spy(mixpanelCE, trackKey);
                },
                teardown: function() {
                    delete mixpanel[trackKey]
                    delete mixpanelCE[trackKey]
                }
            });

            if (mixpanelCE['__autotrack_enabled']) {
                test("click on anchor tag", 4, function() {
                    var aTag = document.createElement('a');
                    document.body.appendChild(aTag);
                    simulateEvent(aTag, 'click');
                    ok(trackSpy.notCalled, "Clicking a link does not fire an event for non CE lib");
                    ok(ceTrackSpy.calledOnce, "Clicking a link fires an event for CE lib");

                    var args = ceTrackSpy.args[0];
                    var event = args[0];
                    var props = args[1];
                    ok(event === "$web_event", "Event is '$web_event'");
                    ok(props['$elements'][0]['tag_name'] === "a", "Tracked element's tag name is 'a'");
                });

                test("click on svg with class", 4, function() {
                    var svgTag = document.querySelector('.svg-class');
                    ceTrackSpy.reset();
                    simulateEvent(svgTag, 'click');
                    ok(ceTrackSpy.calledOnce, "Clicking an svg with a class fires an event for CE lib");

                    var args = ceTrackSpy.args[0];
                    var event = args[0];
                    var props = args[1];
                    ok(event === "$web_event", "Event is '$web_event'");
                    ok(props['$elements'][0]['tag_name'] === "svg", "Tracked element's tag name is 'svg'");
                    ok(props['$elements'][0]['classes'][0] === "svg-class", "Tracked element's class list has 'svg-class'");
                });

            } else {
              var warning = 'autotrack is disabled, not running autotrack tests';
              $('#qunit-userAgent').after($('<div class="qunit-warning" style="color:red;padding:10px;">Warning: ' + warning + '</div>'));
            }
        }, 10000); // there's a race condition where CE isn't enabled until decide responds so we need to wait for that
    };
})();
