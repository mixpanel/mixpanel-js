(function() {

    var mixpanel; // don't use window.mixpanel, use instance passed to testMixpanel()

    var old_onload = window.onload;
    var old_handler_run = false;
    window.onload = function() {
        if (old_onload) old_onload.call(window);
        old_handler_run = true;
        return true;
    };
    var loadedRecorderProject = false; // global script tag check

    var _jsc = [];
    var mpmodule = function(module_name, extra_setup, extra_teardown) {

        module(module_name, {
            setup: function() {
                this.token = rand_name();
                this.id = rand_name();

                mixpanel.init(this.token, {
                    batch_requests: false,
                    debug: true
                }, "test");
                _.each(_jsc, function(key) {
                    mixpanel.test._jsc[key] = function() {};
                });

                if (extra_setup) {
                    extra_setup.call(this);
                }
            },
            teardown: function() {
                // When we tear this down each time we lose the callbacks.
                // We don't always block on .track() calls, so in browsers where
                // we can't use xhr, the jsonp query is invalid. To fix this,
                // we save the keys but make the callbacks noops.
                if (mixpanel.test) {
                    _jsc = _.uniq(_jsc.concat(_.keys(mixpanel.test._jsc)));
                    clearLibInstance(mixpanel.test);
                }

                clearAllLibInstances();

                // Necessary because the alias tests can't clean up after themselves, as there is no callback.
                _.each(document.cookie.split(';'), function(c) {
                    var name = c.split('=')[0].replace(/^\s+|\s+$/g, '');
                    if (name.match(/mp_test_\d+_mixpanel$/)) {
                        if (window.console) {
                            console.log("removing cookie:", name);
                        }
                        cookie.remove(name);
                        cookie.remove(name, true);
                    }
                });

                if (window.localStorage) {
                    window.localStorage.clear();
                }

                if (window.sessionStorage) {
                    window.sessionStorage.clear();
                }

                if (extra_teardown) {
                    extra_teardown.call(this);
                }
            }
        });
    };

    var USE_XHR = (window.XMLHttpRequest && 'withCredentials' in new XMLHttpRequest());

    /* XMLHttpRequest recording - writes "fake" XHR request objects to this.requests for later assertion in tests
     * usage:
     *     mpmodule("module name", startRecordingXhrRequests, stopRecordingXhrRequests);
     *     // this.requests will be available for the duration of the module
     */
    function startRecordingXhrRequests() {
        this.xhr = sinon.useFakeXMLHttpRequest();
        this.requests = [];
        this.xhr.onCreate = _.bind(function(req) {
            this.requests.push(req);
        }, this);
    }

    function stopRecordingXhrRequests() {
        this.xhr.restore();
    }

    /* sendBeacon recording - stubs navigator.sendBeacon for later assertion in tests
     * usage:
     *     mpmodule("module name", startRecordingSendBeaconRequests, stopRecordingSendBeaconRequests);
     */
    function startRecordingSendBeaconRequests() {
        if (navigator.sendBeacon) {
            this.sendBeaconStub = sinon.stub(navigator, 'sendBeacon').returns(true);
        }
    }

    function stopRecordingSendBeaconRequests() {
        if (this.sendBeaconStub) {
            this.sendBeaconStub.restore();
        }
    }

    /* XMLHttpRequest recording - writes "fake" XHR request objects to this.requests for later assertion in tests
     * usage:
     *     // run from within a test module, `this` (QUnit test object) should be bound at callsite:
     *     var func = function() { ... code that makes some requests ... };
     *     var requests = recordXhrRequests.call(this, func);
     *     // return value `requests` contains any XHR requests made during func's execution
     */
    function recordXhrRequests(func) {
        try {
            startRecordingXhrRequests.call(this);
            func.call(this);
        } catch (err) {
            stopRecordingXhrRequests.call(this);
            throw err;
        }
        stopRecordingXhrRequests.call(this);
        return this.requests || [];
    }

    function getRequestData(request, keyPath) {
        try {
            var data = JSON.parse(decodeURIComponent(request.requestBody.match(/data=([^&]+)/)[1]));
            (keyPath || []).forEach(function(key) {
                data = data[key];
            });
            return data;
        } catch (err) {
            console.error(err);
            return null;
        }
    }

    function getSendBeaconData(beaconRequest, keyPath) {
        try {
            var data = JSON.parse(decodeURIComponent(beaconRequest.match(/data=([^&]+)/)[1]));
            (keyPath || []).forEach(function(key) {
                data = data[key];
            });
            return data;
        } catch (err) {
            console.error(err);
            return null;
        }
    }

    var DEVICE_ID_PREFIX = '$device:';
    function stripDevicePrefix(id) {
        if (id.indexOf(DEVICE_ID_PREFIX) === 0) {
            id = id.slice(DEVICE_ID_PREFIX.length);
        }
        return id;
    };

    function notOk(state, message) {
        equal(state, false, message);
    };

    function isUndefined(prop, message) {
        ok(typeof(prop) === "undefined", message);
    }

    function isDefined(obj, prop, message) {
        ok(obj.hasOwnProperty(prop), message)
    }

    function callsError(callback, message) {
        var old_error = console.error;

        console.error = function(msg) {
            ok(msg == 'Mixpanel error:', message);
        }

        callback(function() {
            console.error = old_error;
        });
    }

    function clearLibInstance(instance, clear_opt_in_out) {
        var name = instance.config.name;
        clear_opt_in_out = typeof clear_opt_in_out === 'undefined' ? true : clear_opt_in_out;

        if (name === "mixpanel") {
            throw "Cannot clear main lib instance";
        }

        instance.set_config({autocapture: false, track_pageview: false});
        instance.persistence.clear();
        instance.stop_batch_senders();

        if (instance.get_session_replay_url()) {
            instance.stop_session_recording();
        }

        if (clear_opt_in_out) {
            instance.clear_opt_in_out_tracking();
        }

        delete mixpanel[name];
    }

    function clearAllLibInstances() {
        _.each(mixpanel, function(maybeLibInstance) {
            if (
                typeof(maybeLibInstance) === 'object'
                && maybeLibInstance.config
                && maybeLibInstance.config.name
                && maybeLibInstance.config.name !== 'mixpanel'
                && maybeLibInstance.config.name !== 'nonbatching' // set in the HTML wrapper, don't clear
            ) {
                clearLibInstance(maybeLibInstance);
            }
        });
    }

    var append_fixture = function(a) {
        return $(a).appendTo('#qunit-fixture');
    };

    /**
     * Creates and attaches an element with a random class name to the DOM.
     * @param {string} elText - The text content of the element.
     * @param {string} elTag - The tag name of the element. Defaults to 'a'.
     * @returns {object} - An object containing the element, its class name, and its name.
     */
    var ele_with_class = function(elText, elTag = 'a') {
        var name = rand_name();
        var class_name = "." + name;

        var openTag = '<' + elTag + '>';
        var closeTag = '</' + elTag + '>';

        var a = $(openTag + (elText || "") + closeTag).attr("class", name).attr("href", "#");
        append_fixture(a);
        return {
            e: a.get(0),
            class_name: class_name,
            name: name
        };
    };

    var form_with_class = function() {
        var name = rand_name();
        var class_name = "." + name;
        var f = $("<form>").attr("class", name);
        append_fixture(f);
        return {
            e: f.get(0),
            class_name: class_name,
            name: name
        };
    };

    var link_with_id = function() {
        var name = rand_name();
        var id = "#" + name;
        var a = $("<a></a>").attr("id", name).attr("href", "#");
        append_fixture(a);
        return {
            e: $(id).get(0),
            id: id,
            name: name
        };
    };

    var rand_name = function() {
        return "test_" + Math.floor(Math.random() * 10000000);
    };

    var clear_super_properties = function(inst) {
        (inst || mixpanel).persistence.clear();
    };

    // does obj a contain all of obj b?
    var contains_obj = function(a, b) {
        return !_.any(b, function(val, key) {
            return !(a[key] === b[key]);
        });
    };

    var cookie = {
        exists: function(name) {
            return document.cookie.indexOf(name + "=") !== -1;
        },

        get: function(name) {
            var nameEQ = name + "=";
            var ca = document.cookie.split(';');
            for (var i = 0; i < ca.length; i++) {
                var c = ca[i];
                while (c.charAt(0) == ' ') c = c.substring(1, c.length);
                if (c.indexOf(nameEQ) == 0) return decodeURIComponent(c.substring(nameEQ.length, c.length));
            }
            return null;
        },

        set: function(name, value, days, cross_subdomain) {
            var cdomain = "",
                expires = "";

            if (cross_subdomain) {
                var matches = document.location.hostname.match(/[a-z0-9][a-z0-9\-]+\.[a-z\.]{2,6}$/i),
                    domain = matches ? matches[0] : '';

                cdomain = ((domain) ? "; domain=." + domain : "");
            }

            if (days) {
                var date = new Date();
                date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
                expires = "; expires=" + date.toGMTString();
            }

            document.cookie = name + "=" + encodeURIComponent(value) + expires + "; path=/" + cdomain;
        },

        remove: function(name, cross_subdomain) {
            cookie.set(name, '', -1, cross_subdomain);
        }
    };

    // make sure that the untilDone polling ignores sinon.useFakeTimers
    var realSetTimeout = window.setTimeout;
    var realSetInterval = window.setInterval;
    var realClearTimeout = window.clearTimeout;
    var realClearInterval = window.clearInterval;
    var untilDone = function(func) {
        var interval;
        var timeout = realSetTimeout(function() {
            realClearInterval(interval);
            ok(false, 'untilDone timed out');
            start();
        }, 5000);
        interval = realSetInterval(function() {
            func(function() {
                realClearTimeout(timeout);
                realClearInterval(interval);
                start();
            });
        }, 20);
    };

    var untilDonePromise = function(func) {
        return new Promise(function(resolve, reject) {
            var interval;
            var timeout = realSetTimeout(function() {
                realClearInterval(interval);
                ok(false, 'untilDonePromise timed out');
                reject('untilDonePromise timed out');
            }, 5000);
            interval = realSetInterval(function() {
                if (func()) {
                    realClearTimeout(timeout);
                    realClearInterval(interval);
                    resolve();
                }
            }, 20);
        });
    };

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

    function simulateMouseClick(element, options) {
        options = options || {};
        var x = options.x || 0;
        var y = options.y || 0;

        if (element.click && options.x === undefined && options.y === undefined) {
            element.click();
        } else {
            var evt = element.ownerDocument.createEvent('MouseEvents');
            evt.initMouseEvent('click', true, true, element.ownerDocument.defaultView, 1, x, y, x, y, false, false, false, false, 0, null);
            element.dispatchEvent(evt);
        }
    }

    /**
     * Simulates a series of rapid mouse clicks on an element to mimic a rage click.
     * @param {Element} element - The element to click
     * @param {sinon.SinonFakeTimers} clock - The clock timer to use for waiting between clicks
     * @param {number} clickCount - How many clicks to simulate
     * @param {number} intervalMs - Interval between clicks in milliseconds
     */
    function simulateRageClick(element, clock, clickCount = 4, intervalMs = 100) {
        for (var i = 0; i < clickCount; i++) {
            simulateMouseClick(element);
            if (i < clickCount - 1) clock.tick(intervalMs);
        }
    }

    function date_to_ISO(d) {
        // YYYY-MM-DDTHH:MM:SS in UTC
        function pad(n) {
            return n < 10 ? '0' + n : n
        }
        return d.getUTCFullYear() + '-' + pad(d.getUTCMonth() + 1) + '-' + pad(d.getUTCDate()) + 'T' + pad(d.getUTCHours()) + ':' + pad(d.getUTCMinutes()) + ':' + pad(d.getUTCSeconds());
    }

    window.testAsync = function(mixpanel_test_lib, done_with_async_test) {
        /* Tests for async/snippet behavior (prior to load).
         * Make sure we re-order args, etc.
         */

        mixpanel = mixpanel_test_lib;

        var test1 = {
            id: "asjief32f",
            name: "bilbo",
            properties: null
        };

        mixpanel.push(function() {
            this.persistence.clear();
        });

        mixpanel.time_event('test');
        mixpanel.track('test', {}, function(response, data) {
            test1.properties = data.properties;
        });
        var lib_loaded = mixpanel.__loaded;
        mixpanel.identify(test1.id);
        mixpanel.name_tag(test1.name);

        // only run pre-load snippet tests if lib didn't finish loading before identify/name_tag calls
        if (!lib_loaded) {
            module("async tracking");

            asyncTest("priority functions", 4, function() {
                untilDone(function(done) {
                    if (test1.properties !== null) {
                        var p = test1.properties;
                        same(p.mp_name_tag, test1.name, "name_tag should fire before track");
                        same(p["$user_id"], test1.id, "identify should fire before track");
                        same(p.distinct_id, test1.id, "identify should fire before track");
                        ok(!_.isUndefined(p.$duration), "duration should be set");
                        done();
                        realSetTimeout(done_with_async_test, 10);
                    }
                });
            });
        } else {
            var warning = 'mixpanel-js library loaded before test setup; skipping async tracking tests';
            $('#qunit-userAgent').after($('<div class="qunit-warning" style="color:red;padding:10px;">Warning: ' + warning + '</div>'));
            done_with_async_test();
        }
    };

    window.testMixpanel = function(mixpanel_test_lib) {
        /* Tests to run once the lib is loaded on the page.
         */

        mixpanel = mixpanel_test_lib;

        module("onload handler preserved");
        test("User Onload handlers are preserved", 1, function() {
            ok(old_handler_run, "Old onload handler was run");
        });

        mpmodule("mixpanel.track");

        test("before_track hook", 1, function() {
            mixpanel.test.add_hook('before_track', function(event_data) {
                return {
                    event_name: event_data.event_name + ' before_tracked!',
                };
            })
            var data = mixpanel.test.track('testing', {});
            same(data.event, 'testing before_tracked!', 'should transform tracked event name with hook');
        });

        test("before_identify hook", 2, function() {
            mixpanel.test.identify('old unique id!');
            var track1 = mixpanel.test.track('haha');
            same(track1.properties.distinct_id, 'old unique id!', 'identify should set distinct id');

            mixpanel.test.add_hook('before_identify', function(identify_data) {
                return {
                    unique_id: "new unique id!",
                };
            })
            mixpanel.test.identify('old unique id!');
            var track2 = mixpanel.test.track('haha');
            same(track2.properties.distinct_id, 'new unique id!', 'hook should override distinct id');
        });

        test("before_register hook", 1, function() {
            mixpanel.test.add_hook('before_register', function(register_data) {
                return {
                    properties: {
                        old_property_key: false
                    },
                };
            })
            mixpanel.test.register({old_property_key: true});
            var track2 = mixpanel.test.track('haha', { has_properties: true});
            same(track2.properties.old_property_key, false, 'hook should override super property value');
        });

        test("before_register_once hook", 2, function() {
            mixpanel.test.register_once({old_property_key: true});
            mixpanel.test.add_hook('before_register_once', function(register_once_data) {
                return {
                    properties: {
                        old_property_key: false
                    },
                };
            })
            mixpanel.test.register_once({new_property_key: true});
            var track = mixpanel.test.track('haha');
            same(track.properties.new_property_key, undefined, 'hook should override register property');
            same(track.properties.old_property_key, true, 'register_once should mean nothing changed');
        });

        test("before_unregister hook", 1, function() {
            mixpanel.test.register({old_property_key: true});
            mixpanel.test.add_hook('before_register_once', function(register_once_data) {
                return {
                    property: "dont unregister anything"
                };
            })
            mixpanel.test.unregister({property: "old_property_key"});
            var track = mixpanel.test.track('haha');
            same(track.properties.old_property_key, true, 'hook should override unregister property');
        });

        test("hooks change arguments for sdk function", 1, function() {
            mixpanel.test.add_hook('before_track', function(event_data) {
                // No longer returning any properties
                return {
                    event_name: event_data.event_name,
                };
            })

            var data = mixpanel.test.track('haha', { has_properties: true});
            same(data.properties.has_properties, undefined, 'original tracked property dropped');
        });

        test("add_hook and remove_hook multiple hooks", 4, function() {
            mixpanel.test.add_hook('before_track', function(event_data) {
                event_data.properties.hook1 = true
                return {
                    event_name: event_data.event_name + '6',
                    properties: event_data.properties
                };
            })
            mixpanel.test.add_hook('before_track', function(event_data) {
                event_data.properties.hook2 = true
                return {
                    event_name: event_data.event_name + '7',
                    properties: event_data.properties
                };
            })
            var data = mixpanel.test.track('haha', {});
            same(data.event, 'haha67', 'should transform tracked event name with hook');
            ok(data.properties.hook1);
            ok(data.properties.hook2);

            mixpanel.test.remove_hook('before_track')
            data = mixpanel.test.track('haha', {});
            same(data.event, 'haha', 'tracked event name should stay the same');
        });

        test("add_hook works ontop of set_config hooks", 3, function() {
            mixpanel.test.set_config({
                hooks: {
                    before_track: function hook1(event_data) {
                        event_data.properties.hook1 = true
                        return {
                            event_name: event_data.event_name + '6',
                            properties: event_data.properties
                        };
                    }
                }
            });
            mixpanel.test.add_hook('before_track', function(event_data) {
                event_data.properties.hook2 = true
                return {
                    event_name: event_data.event_name + '7',
                    properties: event_data.properties
                };
            })
            var data = mixpanel.test.track('haha', {});
            same(data.event, 'haha67', 'should transform tracked event name with hook');
            ok(data.properties.hook1);
            ok(data.properties.hook2);
        });

        test("set_config is destructive of existing hooks", 3, function() {
            mixpanel.test.add_hook('before_track', function(event_data) {
                event_data.properties.hook1 = true
                return {
                    event_name: event_data.event_name + '6',
                    properties: event_data.properties
                };
            })
            mixpanel.test.set_config({
                hooks: {
                    before_track: function hook2(event_data) {
                        event_data.properties.hook2 = true
                        return {
                            event_name: event_data.event_name + '7',
                            properties: event_data.properties
                        };
                    }
                }
            });

            var data = mixpanel.test.track('haha', {});
            same(data.event, 'haha7', 'should transform tracked only with set_config hook');
            same(data.properties.hook1, undefined, 'hook1 should be erased');
            ok(data.properties.hook2);
        });
    };
})();
