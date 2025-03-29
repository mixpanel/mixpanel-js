(function() {

    var mixpanel; // don't use window.mixpanel, use instance passed to testMixpanel()

    var old_onload = window.onload;
    var old_handler_run = false;
    window.onload = function() {
        if (old_onload) old_onload.call(window);
        old_handler_run = true;
        return true;
    };

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

    var ele_with_class = function(elText) {
        var name = rand_name();
        var class_name = "." + name;
        var a = $("<a>" + (elText || "") + "</a>").attr("class", name).attr("href", "#");
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

    function simulateMouseClick(element) {
        if (element.click) {
            element.click();
        } else {
            var evt = element.ownerDocument.createEvent('MouseEvents');
            evt.initMouseEvent('click', true, true, element.ownerDocument.defaultView, 1, 0, 0, 0, 0, false, false, false, false, 0, null);
            element.dispatchEvent(evt);
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

        asyncTest("check callback", 1, function() {
            mixpanel.test.track('test', {}, function(response) {
                same(response, 1, "server returned 1");
                start();
            });
        });

        test("check no property name aliasing occurs during minify", 1, function() {
            var ob = {};
            var letters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
            _.each(letters, function(l1) {
                ob[l1] = l1;
                _.each(letters, function(l2) {
                    var pair = l1 + l2;
                    ob[pair] = pair;
                });
            });

            var expect_ob = _.extend({}, ob);
            expect_ob.token = this.token;
            data = mixpanel.test.track('test', ob);
            ok(contains_obj(data.properties, expect_ob), 'Nothing strange happened to properties');
        });

        test("token property does not override configured token", 1, function() {
            var props = {
                token: "HOPE NOT"
            };
            var data = mixpanel.test.track('test', props);
            same(data.properties.token, mixpanel.test.get_config('token'), 'Property did not override token');
        });

        test("tracking does not mutate properties argument", 3, function() {
            var props = {foo: 'bar', token: 'baz'};
            var data = mixpanel.test.track('test', props);

            same(props.token, 'baz', 'original properties object was not mutated');
            same(data.properties.token, mixpanel.test.get_config('token'));
            same(data.properties.foo, 'bar');
        });

        asyncTest("callback doesn't override", 1, function() {
            var result = [];
            mixpanel.test.track('test', {}, function(response) {
                result.push(1);
            });
            mixpanel.test.track('test', {}, function(response) {
                result.push(2);
            });

            untilDone(function(done) {
                function i(n) {
                    return _.include(result, n);
                }

                if (i(1) && i(2)) {
                    ok('both callbacks executed.');
                    done();
                }
            });
        });

        test("ip is honored", 2, function() {
            mixpanel.test.set_config({
                img: true
            });
            mixpanel.test.track("ip enabled");

            var with_ip = $('img').get(-1);
            mixpanel.test.set_config({
                ip: 0
            });
            mixpanel.test.track("ip disabled");
            var without_ip = $('img').get(-1);

            ok(with_ip.src.indexOf('ip=1') > 0, '_send_request should send ip=1 by default');
            ok(without_ip.src.indexOf('ip=0') > 0, '_send_request should send ip=0 when the config ip=false');
        });


        test("additional query string is honored", 1, function() {
            mixpanel.test.set_config({
                img: true,
                api_extra_query_params: {some_param: 'some_value', another_param: 'another_value'}
            });

            mixpanel.test.track("api_extra_query_params set");
            var with_additional_query_params = $('img').get(-1);

            ok(with_additional_query_params.src.indexOf('some_param=some_value&another_param=another_value') > 0, '_send_request should send extra_query_params when configured');
        });

        test("properties on blacklist are not sent", 4, function() {
            mixpanel.test.set_config({
                property_blacklist: ['$current_url', '$referrer', 'blacklisted_custom_prop']
            });

            var data = mixpanel.test.track('test', {
                blacklisted_custom_prop: 'foo',
                other_custom_prop: 'bar'
            });

            isUndefined(data.properties.$current_url, 'Blacklisted default prop should be removed');
            isUndefined(data.properties.$referrer, 'Blacklisted default prop should be removed');
            isUndefined(data.properties.blacklisted_custom_prop, 'Blacklisted custom prop should be removed');
            same(data.properties.other_custom_prop, 'bar', 'Non-blacklisted custom prop should not be removed');
        });

        test("disable() disables all event tracking from firing", 2, function() {
            stop();
            stop();

            mixpanel.test.disable();

            mixpanel.test.track("event_a", {}, function(response) {
                same(response, 0, "track should return an error");
                start();
            });

            mixpanel.test.track("event_b", {}, function(response) {
                same(response, 0, "track should return an error");
                start();
            });
        });

        test("disable([event_arr]) disables individual events", 3, function() {
            stop();
            stop();
            stop();

            // doing it in two passes to test the disable's concat functionality
            mixpanel.test.disable(['event_a']);
            mixpanel.test.disable(['event_c']);

            mixpanel.test.track("event_a", {}, function(response) {
                same(response, 0, "track should return an error");
                start();
            });

            mixpanel.test.track("event_b", {}, function(response) {
                same(response, 1, "track should be successful");
                start();
            });

            mixpanel.test.track("event_c", {}, function(response) {
                same(response, 0, "track should return an error");
                start();
            });
        });

        // callsError may fail if there is no console, so we can't expect 2 tests
        test("img based tracking", function() {
            var initial_image_count = $('img').length,
                e1 = ele_with_class();

            stop();

            mixpanel.test.set_config({
                img: true
            });
            mixpanel.test.track("image tracking");

            if (window.console) {
                stop();
                callsError(function(restore_console) {
                    mixpanel.test.track_links(e1.class_name, "link_clicked");
                    restore_console();
                    start();
                }, "dom tracking should be disabled");
            }

            untilDone(function(done) {
                if (initial_image_count + 1 === $('img').length) {
                    done();
                }
            });
        });

        test("should truncate properties to 255 characters", 7, function() {
            var props = {
                short_prop: "testing 1 2 3",
                long_prop: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. In felis ipsum, tincidunt ut cursus ut, venenatis at odio. Vivamus sagittis, velit at porta mattis, metus augue posuere augue, et commodo risus dui non purus. Phasellus varius accumsan urna ut luctus. Duis at lorem diam, in aliquam massa nunc.",
                number: 2342,
                obj: {
                    long_prop: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. In felis ipsum, tincidunt ut cursus ut, venenatis at odio. Vivamus sagittis, velit at porta mattis, metus augue posuere augue, et commodo risus dui non purus. Phasellus varius accumsan urna ut luctus. Duis at lorem diam, in aliquam massa nunc."
                },
                num_array: [1, 2, 3],
                longstr_array: ["Lorem ipsum dolor sit amet, consectetur adipiscing elit. In felis ipsum, tincidunt ut cursus ut, venenatis at odio. Vivamus sagittis, velit at porta mattis, metus augue posuere augue, et commodo risus dui non purus. Phasellus varius accumsan urna ut luctus. Duis at lorem diam, in aliquam massa nunc."]
            };

            var data = mixpanel.test.track("Lorem ipsum dolor sit amet, consectetur adipiscing elit. In felis ipsum, tincidunt ut cursus ut, venenatis at odio. Vivamus sagittis, velit at porta mattis, metus augue posuere augue, et commodo risus dui non purus. Phasellus varius accumsan urna ut luctus. Duis at lorem diam, in aliquam massa nunc.", props);

            same(data.event.length, 255, "event name should be truncated");
            same(data.properties.short_prop, props.short_prop, "short string properties should not be truncated");
            same(data.properties.long_prop.length, 255, "long string properties should be truncated");
            same(data.properties.number, props.number, "numbers should be ignored");
            same(data.properties.obj.long_prop.length, 255, "sub objects should have truncated values");
            same(data.properties.num_array, props.num_array, "sub arrays of numbers should be ignored");
            same(data.properties.longstr_array[0].length, 255, "sub arrays of strings should have truncated values");
        }); // truncate properties test

        test("should send screen properties", 2, function() {
            var data = mixpanel.test.track('test', {});

            same(data.properties.$screen_height, screen.height);
            same(data.properties.$screen_width, screen.width);
        });

        test("should _not_ override user sent time", 2, function() {
            var data = mixpanel.test.track('test', {"foo": "bar"});
            var data1 = mixpanel.test.track('test', {"foo": "bar", "time": 123456});

            isDefined(data.properties, 'time', "time not defined")
            same(data1.properties.time, 123456);
        });

        mpmodule("mixpanel.time_event", function() {
            this.clock = sinon.useFakeTimers();
        }, function() {
            this.clock.restore();
        });

        test("it sets $duration to the elapsed time between time_event and track", 1, function() {
            mixpanel.test.time_event('test');
            this.clock.tick(123);
            var data = mixpanel.test.track('test');
            same(data.properties.$duration, 0.123);
        });

        mpmodule("json");

        test("basic", 2, function() {
            var o = 'str';
            var encoded = mixpanel._.JSONEncode(o);
            var expected = '"str"';
            ok(encoded, expected, "encoded string is correct");

            o = {
                'str': 'str',
                2: 2,
                'array': [1],
                'null': null
            };
            encoded = mixpanel._.JSONEncode(o);
            var decoded = mixpanel._.JSONDecode(encoded);
            ok(_.isEqual(decoded, o), "roundtrip should be equal");
        });

        test("special chars", 2, function() {
            var o = '\b';
            var encoded = mixpanel._.JSONEncode(o);
            var valid = ['"\\b"', '"\\u0008"'];
            ok(_.indexOf(valid, encoded) >= 0, "encoded string is correct");

            var decoded = mixpanel._.JSONDecode(encoded);
            ok(_.isEqual(decoded, o), "roundtrip should be equal");
        });

        if (!window.COOKIE_FAILURE_TEST) {
            mpmodule("cookies");

            test("cookie manipulation", 4, function() {
                var c = mixpanel._.cookie,
                    name = "mp_test_cookie_2348958345",
                    content = "testing 1 2 3;2jf3f39*#%&*%@)(@%_@{}[]";

                if (cookie.exists(name)) {
                    c.remove(name);
                }

                notOk(cookie.exists(name), "test cookie should not exist");

                c.set(name, content);

                ok(cookie.exists(name), "test cookie should exist");

                equal(c.get(name), content, "cookie.get should return the cookie's content");

                c.remove(name);

                notOk(cookie.exists(name), "test cookie should not exist");
            });

            test("cookie set (expiration time)", 1, function() {
                var tomorrow = new Date();
                tomorrow.setTime(tomorrow.getTime() + (24 * 60 * 60 * 1000));

                var new_cookie_data = mixpanel._.cookie.set("cookie name", "cookie val", 1);
                var expiry = new_cookie_data.match(/; expires=(.*);/, new_cookie_data)[1];
                expiry = new Date(Date.parse(expiry));

                equal(expiry.getDate(), tomorrow.getDate(), "the third parameter for expiration should be in 'days'");
            });

            test("cookie name", 6, function() {
                var token = "FJDIF",
                    name1 = "mp_" + token + "_mixpanel",
                    name2 = "mp_cn2";

                notOk(cookie.exists(name1), "test cookie should not exist");

                mixpanel.init(token, {}, "cn1");
                ok(cookie.exists(name1), "test cookie should exist");

                notOk(cookie.exists(name2), "test cookie 2 should not exist");

                mixpanel.init(token, {
                    cookie_name: "cn2"
                }, "cn2");
                ok(cookie.exists(name2), "test cookie 2 should exist");

                mixpanel.cn1.cookie.clear();
                mixpanel.cn2.cookie.clear();

                notOk(cookie.exists(name1), "test cookie should not exist");
                notOk(cookie.exists(name2), "test cookie 2 should not exist");

                clearLibInstance(mixpanel.cn1);
                clearLibInstance(mixpanel.cn2);
            });

            if (document.location.protocol === "https:") {
                test("cross-site option doesn't break functionality", 2, function() {
                    // we can only really test that setting cross_site_cookie works and
                    // doesn't kill functionality, since you can't access cookie config
                    // after setting it

                    var cname = mixpanel.test.cookie.name;
                    ok(cookie.exists(cname), "Cookie should exist");
                    mixpanel.test.set_config({cross_site_cookie: true});
                    ok(cookie.exists(cname), "Cookie should still exist");
                });
            }

            test("cross subdomain", 4, function() {
                var name = mixpanel.test.config.cookie_name;

                ok(mixpanel.test.cookie.get_cross_subdomain(), "Cross subdomain should be set correctly");
                // Remove non-cross-subdomain cookie if it exists.
                cookie.remove(name, false);
                ok(cookie.exists(name), "Cookie should still exist");

                mixpanel.test.set_config({
                    cross_subdomain_cookie: false
                });
                notOk(mixpanel.test.cookie.get_cross_subdomain(), "Should switch to false");
                // Remove cross-subdomain cookie if it exists.
                cookie.remove(name, true);
                ok(cookie.exists(name), "Cookie should still exist for current subdomain");
            });

            if (document.location.hostname.split('.').length > 3) {
                test("custom cookie domain", 1, function() {
                    var cname = mixpanel.test.cookie.name;
                    var cdomain = document.location.hostname.split('.').slice(1).join('.');
                    mixpanel.test.set_config({cookie_domain: cdomain});
                    ok(cookie.exists(cname), "Cookie should still exist for current subdomain");
                });
            }

            test("Old values loaded", 1, function() {
                var c1 = {
                    distinct_id: '12345',
                    asdf: 'asdf',
                    $original_referrer: 'http://whodat.com'
                };
                var token = "oldvalues9087tyguhbjkn",
                    name = "mp_" + token + "_mixpanel";

                // Set some existing cookie values & make sure they are loaded in correctly.
                cookie.remove(name);
                cookie.remove(name, true);
                cookie.set(name, mixpanel._.JSONEncode(c1));

                var ov1 = mixpanel.init(token, {}, "ov1");
                ok(contains_obj(ov1.cookie.props, c1), "original cookie values should be loaded");
                clearLibInstance(mixpanel.ov1);
            });

            test("disable cookies", 7, function() {
                var c_name = "mpl_should_not_exist";

                cookie.remove(c_name);
                cookie.remove(c_name, true);

                mixpanel.init("Asdfja", {
                    cookie_name: c_name,
                    disable_cookie: true
                }, "dc0");

                notOk(cookie.exists(c_name), "cookie should not exist");

                var dc1 = mixpanel.init("Asdf", {
                    cookie_name: c_name
                }, "dc1");
                dc1.set_config({
                    disable_cookie: true
                });

                notOk(cookie.exists(c_name), "cookie 2 should not exist");

                var props = {
                    'a': 'b'
                };
                dc1.register(props);

                stop();
                var data = dc1.track('test', {
                    'c': 'd'
                }, function(response) {
                    same(response, 1, "tracking still works");
                    clearLibInstance(dc1);
                    start();
                });

                var dp = data.properties;

                ok('token' in dp, "token included in properties");

                ok(contains_obj(dp, {
                    'a': 'b',
                    'c': 'd'
                }), 'super properties included correctly');
                ok(contains_obj(dc1.cookie.props, props), "Super properties saved");

                notOk(cookie.exists(c_name), "cookie 2 should not exist even after tracking/registering");
            });

            function cookie_included(name, callback) {
                $.getJSON("/tests/cookie_included/" + name, function(resp) {
                    callback(resp);
                });
            }

            asyncTest("secure cookie false by default", 1, function() {
                cookie_included(mixpanel.test.cookie.name, function(resp) {
                    same(resp, 1, "cookie is included in request to server");
                    start();
                });
            });

            asyncTest("secure cookie only sent to https", 1, function() {
                mixpanel.test.set_config({
                    secure_cookie: true
                });
                var expected = document.location.protocol === "https:" ? 1 : 0;

                cookie_included(mixpanel.test.cookie.name, function(resp) {
                    same(resp, expected, "cookie is only included in request to server if https");
                    start();
                });
            });
        }

        if (window.localStorage) {
            mpmodule("localStorage");

            test("localStorage manipulation", 4, function() {
                var storage = mixpanel._.localStorage,
                    name = "mp_test_storage",
                    content = "testing 1 2 3;2jf3f39*#%&*%@)(@%_@{}[]";

                if (window.localStorage.getItem(name)) {
                    storage.remove(name);
                }

                notOk(!!window.localStorage.getItem(name), "localStorage entry should not exist");

                storage.set(name, content);

                ok(!!window.localStorage.getItem(name), "localStorage entry should exist");

                equal(storage.get(name), content, "storage.get should return stored content");

                storage.remove(name);

                notOk(!!window.localStorage.getItem(name), "localStorage entry should not exist");
            });

            test("persistence name", 7, function() {
                var token = "FJDIF",
                    name1 = "mp_" + token + "_mixpanel",
                    name2 = "mp_sn2";

                notOk(!!window.localStorage.getItem(name1), "localStorage entry 1 should not exist");
                mixpanel.init(token, {
                    persistence: 'localStorage'
                }, 'sn1');
                ok(!!window.localStorage.getItem(name1), "localStorage entry 1 should exist");

                notOk(!!window.localStorage.getItem(name2), "localStorage entry 2 should not exist");
                mixpanel.init(token, {
                    persistence: 'localStorage',
                    persistence_name: 'sn2'
                }, 'sn2');
                ok(!!window.localStorage.getItem(name2), "localStorage entry 2 should exist");
                ok(!!window.localStorage.getItem(name1), "localStorage entry 1 should still exist");

                mixpanel.sn1.persistence.clear();
                mixpanel.sn2.persistence.clear();

                notOk(!!window.localStorage.getItem(name1), "localStorage entry 1 should no longer exist");
                notOk(!!window.localStorage.getItem(name2), "localStorage entry 2 should no longer exist");

                clearLibInstance(mixpanel.sn1);
                clearLibInstance(mixpanel.sn2);
            });

            test("invalid persistence type", 2, function() {
                var token = "invperstest",
                    name = "mp_" + token + "_mixpanel";

                mixpanel.init(token, {
                    persistence: 'blargh!!!'
                }, 'ipt1');
                notOk(!!window.localStorage.getItem(name), "localStorage entry should not exist");
                ok(cookie.exists(name) || mixpanel._.cookie.failure_mode, "Cookie should exist");

                clearLibInstance(mixpanel.ipt1);
            });

            test("disable persistence", 24, function() {
                var name = "persistence_name";
                window.localStorage.removeItem(name);

                function disablePersistenceTest(lib) {
                    notOk(!!window.localStorage.getItem('mp_' + name), "localStorage entry should not exist");

                    var props = {
                        'a': 'b'
                    };
                    lib.register(props);

                    stop();
                    var data = lib.track('test', {
                        'c': 'd'
                    }, function(response) {
                        same(response, 1, "tracking still works");
                        start();
                    });

                    var dp = data.properties;

                    ok('token' in dp, "token included in properties");

                    ok(contains_obj(dp, {
                        'a': 'b',
                        'c': 'd'
                    }), 'super properties included correctly');
                    ok(contains_obj(lib.persistence.props, props), "Super properties saved");

                    notOk(!!window.localStorage.getItem('mp_' + name),
                        "localStorage entry should not exist even after tracking/registering"
                    );

                    // ensure everything works as expected after re-enabling persistence
                    lib.set_config({
                        disable_persistence: false
                    });

                    ok(!!window.localStorage.getItem('mp_' + name), "localStorage entry should exist");

                    stop();
                    var data = lib.track('test', {
                        'c': 'd'
                    }, function(response) {
                        same(response, 1, "tracking still works");
                        start();
                    });

                    var dp = data.properties;

                    ok('token' in dp, "token included in properties");

                    ok(contains_obj(dp, {
                        'a': 'b',
                        'c': 'd'
                    }), 'super properties included correctly');
                    ok(contains_obj(lib.persistence.props, props), "Super properties saved");

                    ok(!!window.localStorage.getItem('mp_' + name),
                        "localStorage entry should exist after tracking/registering"
                    );
                }

                var lib1 = mixpanel.init('lib1', {
                    persistence: 'localStorage',
                    persistence_name: name,
                    batch_requests: false,
                    disable_persistence: true // disable persistence via init config
                }, 'lib1');

                disablePersistenceTest(lib1);

                var lib2 = mixpanel.init('lib2', {
                    persistence: 'localStorage',
                    persistence_name: name,
                    batch_requests: false
                }, 'lib2');
                lib2.set_config({
                    disable_persistence: true // disable persistence via post-init set_config
                });

                disablePersistenceTest(lib2);
            });

            test("upgrade from cookie", 9, function() {
                // populate cookie
                var ut1 = mixpanel.init('UT_TOKEN', {}, 'ut1'),
                    persistence_name = 'mp_UT_TOKEN_mixpanel';
                ut1.register({
                    'a': 'b'
                });
                ok(cookie.exists(persistence_name) || mixpanel._.cookie.failure_mode, "cookie should exist");

                // init same project with localStorage
                var ut2 = mixpanel.init('UT_TOKEN', {
                    persistence: 'localStorage'
                }, 'ut2');
                ut2.register({
                    'c': 'd'
                });
                ok(!!window.localStorage.getItem(persistence_name), "localStorage entry should exist");

                ok(contains_obj(ut2.persistence.props, {
                    'a': 'b'
                }) || mixpanel._.cookie.failure_mode, "upgrading from cookie should import props");
                notOk(cookie.exists('mp_UT_TOKEN_mixpanel'), "upgrading from cookie should remove cookie");

                // send track request from upgraded instance
                stop();
                var data = ut2.track('test', {
                    'foo': 'bar'
                }, function(response) {
                    same(response, 1, "tracking still works");
                    start();
                });

                var dp = data.properties;
                ok('token' in dp, "token included in properties");
                ok(contains_obj(dp, {
                    'a': 'b'
                }) || mixpanel._.cookie.failure_mode, "super properties transferred correctly");
                ok(contains_obj(dp, {
                    'c': 'd'
                }), "new super properties registered correctly");
                ok(contains_obj(dp, {
                    'foo': 'bar'
                }), "tracking properties sent correctly");
            });

            test("upgrade from non-existent cookie", 5, function() {
                // populate cookie
                var persistence_name = 'upgrade_test2',
                    full_persistence_name = 'mp_' + persistence_name;
                cookie.remove(full_persistence_name);

                var ut = mixpanel.init('UT_TOKEN', {
                    persistence: 'localStorage',
                    persistence_name: persistence_name
                }, 'ut2');
                ok(!!window.localStorage.getItem(full_persistence_name), "localStorage entry should exist");
                notOk(cookie.exists(full_persistence_name), "cookie should not exist");

                stop();
                var data = ut.track('test', {
                    'foo': 'bar'
                }, function(response) {
                    same(response, 1, "tracking still works");
                    start();
                });

                var dp = data.properties;
                ok('token' in dp, "token included in properties");
                ok(contains_obj(dp, {
                    'foo': 'bar'
                }), "tracking properties sent correctly");
            });

            test("revert from localStorage to cookie", 10, function() {
                // populate localStorage
                var instance1 = mixpanel.init('LS2C_TOKEN', {
                    persistence: 'localStorage'
                }, 'instance1'),
                persistence_name = 'mp_LS2C_TOKEN_mixpanel';
                instance1.register({
                    'a': 'b'
                });
                ok(!!window.localStorage.getItem(persistence_name), "localStorage entry should exist");
                notOk(cookie.exists(persistence_name), "cookie should not exist yet");

                // init same project with cookie
                var instance2 = mixpanel.init('LS2C_TOKEN', {
                    persistence: 'cookie'
                }, 'instance2');
                instance2.register({
                    'c': 'd'
                });
                ok(cookie.exists(persistence_name) || mixpanel._.cookie.failure_mode, "cookie should exist");

                ok(contains_obj(instance2.persistence.props, {
                    'a': 'b'
                }) || mixpanel._.cookie.failure_mode, "reverting from localStorage to cookie should import props");
                notOk(!!window.localStorage.getItem(persistence_name), "reverting from localStorage to cookie should remove localStorage entry");

                // send track request from reverted instance
                stop();
                var data = instance2.track('test', {
                    'foo': 'bar'
                }, function(response) {
                    same(response, 1, "tracking still works");
                    start();
                });

                var dp = data.properties;
                ok('token' in dp, "token included in properties");
                ok(contains_obj(dp, {
                    'a': 'b'
                }) || mixpanel._.cookie.failure_mode, "super properties transferred correctly");
                ok(contains_obj(dp, {
                    'c': 'd'
                }), "new super properties registered correctly");
                ok(contains_obj(dp, {
                    'foo': 'bar'
                }), "tracking properties sent correctly");
            });
        }

        mpmodule("mixpanel");

        var get_superprops_without_defaults = function(instance) {
            return _.omit(
                instance.persistence.properties(),
                'distinct_id',
                '$initial_referrer',
                '$initial_referring_domain',
                '$device_id'
            );
        };


        test("constructor", window.COOKIE_FAILURE_TEST ? 3 : 4, function() {
            var token = 'ASDF',
                sp = {
                    'test': 'all'
                };

            mixpanel.init(token, {persistence_name: 'mpl_t2'}, 'mpl');
            mixpanel.mpl.register(sp);
            ok(contains_obj(mixpanel.mpl.persistence.props, sp), "Super properties set correctly");
            var props = mixpanel.mpl.persistence.properties();
            var distinct_id = props['distinct_id'];
            var device_id = props['$device_id'];
            same(distinct_id, '$device:' + device_id);



            // Recreate object - should pull super props from persistence
            mixpanel.init(token, {persistence_name: 'mpl_t2'}, 'mpl2');
            if (!window.COOKIE_FAILURE_TEST) {
                ok(contains_obj(mixpanel.mpl2.persistence.props, sp), "Super properties saved to persistence");
            }

            mixpanel.init(token, {persistence_name: 'mpl_t'}, 'mpl3');
            same(get_superprops_without_defaults(mixpanel.mpl3), {}, "Super properties shouldn't be loaded from mixpanel persistence")

            clearLibInstance(mixpanel.mpl);
            clearLibInstance(mixpanel.mpl2);
            clearLibInstance(mixpanel.mpl3);
        });

        test("init accepts mp_loader config", 1, function() {
            mixpanel.init('mp-loader-test-token', {mp_loader: 'gtm-wrapper', batch_requests: false}, 'mp_loader_test');

            var event = mixpanel.mp_loader_test.track("check current url (loader)", {});
            var props = event.properties;
            equal(props["mp_loader"], "gtm-wrapper", "mp_loader is properly set");
        });

        test("info properties included", 7, function() {
            var info_props = "$os $browser $current_url $browser_version $referrer $referring_domain mp_lib".split(' ');

            var data = mixpanel.test.track("check info props");
            _.each(info_props, function(prop) {
                ok(prop in data.properties, "properties should include " + prop);
            });
        });

        test("initial referrers set correctly", 8, function() {
            var i_ref = "$initial_referrer",
                i_ref_d = "$initial_referring_domain",
                none_val = "$direct";

            ok(i_ref in mixpanel.test.persistence.props, "initial referrer saved");
            ok(i_ref_d in mixpanel.test.persistence.props, "initial referring domain saved");

            // Clear persistence so we can emulate missing referrer.
            mixpanel.test.persistence.clear();
            mixpanel.test.persistence.update_referrer_info("");

            // If referrer is missing, we want to mark it as None (type-in)
            ok(mixpanel.test.persistence.props[i_ref] === none_val, "emixpanel.testty referrer should mark $initial_referrer as None");
            ok(mixpanel.test.persistence.props[i_ref_d] === none_val, "emixpanel.testty referrer should mark $initial_referring_domain as None");

            var ref = "http://examixpanel.testle.com/a/b/?c=d";
            // Now we update, but the vals should remain None.
            mixpanel.test.persistence.update_referrer_info(ref);
            equal(mixpanel.test.persistence.props[i_ref], none_val, "$inital_referrer should remain None, even after getting a referrer");
            equal(mixpanel.test.persistence.props[i_ref_d], none_val, "$initial_referring_domain should remain None even after getting a referrer");

            // Clear persistence so we can try a real domain
            mixpanel.test.persistence.clear();
            mixpanel.test.persistence.update_referrer_info(ref);
            equal(mixpanel.test.persistence.props[i_ref], ref, "Full referrer should be saved");
            equal(mixpanel.test.persistence.props[i_ref_d], "examixpanel.testle.com", "Just domain should be saved");
        });

        test("current url set correctly", 2, function() {
            var current_url = "$current_url";
            var event = mixpanel.test.track("check current url");
            var props = event.properties;
            ok(current_url in props, "current url in props");
            equal(props[current_url], window.location.href, "current url is properly set");
        });

        test("set_config", 2, function() {
            ok(!mixpanel.config.test, "test isn't set already");
            mixpanel.set_config({
                test: 1
            });
            ok(mixpanel.config.test == 1, "config is saved");
        });

        test("get_property", 2, function() {
            var prop = "test_get_property",
                value = "23fj22j09jdlsa";

            if (mixpanel.persistence.props[prop]) {
                delete mixpanel.persistence.props[prop];
            }
            ok(typeof(mixpanel.get_property(prop)) === 'undefined', "get_property returns undefined for unset properties");

            mixpanel.register({
                "test_get_property": value
            });
            ok(mixpanel.get_property(prop) === value, "get_property successfully returns the correct super property's value");
        });

        test("save_search_keyword", 10, function() {
            var test_data = [
                ["google", "http://www.google.com/#sclient=psy&hl=en&site=&source=hp&q=test&aq=f&aqi=g5&aql=f&oq=&pbx=1&bav=on.2,or.r_gc.r_pw.&fp=78e75b26b3ba4591"],
                ["google", "http://www.google.ca/#sclient=psy&hl=en&biw=1200&bih=1825&source=hp&q=test&aq=f&aqi=g5&aql=&oq=&pbx=1&bav=on.2,or.r_gc.r_pw.&fp=ee961497a1bb4875"],
                ["google", "http://www.google.be/#hl=nl&source=hp&biw=1200&bih=1794&q=test&oq=test&aq=f&aqi=g10&aql=&gs_sm=e&gs_upl=1808l2038l0l4l2l0l0l0l0l139l210l1.1&bav=on.2,or.r_gc.r_pw.&fp=e8b05776699ca8de"],
                ["bing", "http://www.bing.com/search?q=test&go=&form=QBLH&qs=n&sk=&sc=8-4"],
                ["bing", "http://be.bing.com/search?q=test&go=&form=QBLH&filt=all"],
                ["yahoo", "http://search.yahoo.com/search;_ylt=A0oGdSBmkd1NN0AAivtXNyoA?p=test&fr2=sb-top&fr=yfp-t-701&type_param="],
                ["yahoo", "http://ca.search.yahoo.com/search;_ylt=A0oGkmd_kd1NFzcAJGnrFAx.;_ylc=X1MDMjExNDcyMTAwMwRfcgMyBGFvAzEEZnIDeWZwLXQtNzE1BGhvc3RwdmlkAzRlMnVfVW9Ha3lraE5xTmRUYjlsX1FQcFJpU1NNazNka1g4QUF3YUIEbl9ncHMDMTAEbl92cHMDMARvcmlnaW4Dc3JwBHF1ZXJ5A3Rlc3QEc2FvAzEEdnRlc3RpZANNU1lDQUMx?p=test&fr2=sb-top&fr=yfp-t-715&rd=r1"],
                ["duckduckgo", "http://duckduckgo.com/?q=test"]
            ];

            var props = {
                'mp_keyword': 'test',
                '$search_engine': ''
            };

            for (var i = 0; i < test_data.length; i++) {
                clear_super_properties();
                mixpanel.persistence.update_search_keyword(test_data[i][1]);
                props["$search_engine"] = test_data[i][0];
                same(mixpanel.persistence.props, props, "Save search keyword parses query " + i);
            }

            // test URI decoding
            clear_super_properties();
            mixpanel.persistence.update_search_keyword("http://duckduckgo.com/?q=foo%25bar");
            same(mixpanel.persistence.props.mp_keyword, "foo%bar", "Save search keyword performs URI decoding");

            // test malformed URI component
            clear_super_properties();
            mixpanel.persistence.update_search_keyword("http://duckduckgo.com/?q=foo%bar");
            same(mixpanel.persistence.props.mp_keyword, "foo%bar", "Save search keyword is resilient to malformed URI components");
        });

        mpmodule("super properties");

        test("register", 2, function() {
            var props = {
                    'hi': 'there'
                },
                persisted_props = get_superprops_without_defaults(mixpanel.test);

            same(persisted_props, {}, "empty before setting");

            mixpanel.test.register(props);

            same(get_superprops_without_defaults(mixpanel.test), props, "properties set properly");
        });

        test("register_once", 4, function() {
            var props = {
                    'hi': 'there'
                },
                props1 = {
                    'hi': 'ho'
                }

            same(get_superprops_without_defaults(mixpanel.test), {}, "empty before setting");

            mixpanel.test.register_once(props);
            same(get_superprops_without_defaults(mixpanel.test), props, "properties set properly");

            mixpanel.test.register_once(props1);
            same(get_superprops_without_defaults(mixpanel.test), props, "register_once doesn't override already set super property");

            mixpanel.test.register_once({falsey: 0});
            mixpanel.test.register_once({falsey: 1});
            ok(contains_obj(get_superprops_without_defaults(mixpanel.test), {falsey: 0}), "register_once doesn't override already-set falsey value");
        });

        test("identify", 3, function() {
            var distinct_id = mixpanel.test.get_distinct_id();
            mixpanel.test.identify(this.id);
            same(mixpanel.test.get_distinct_id(), this.id);
            same(mixpanel.test.get_property('$user_id'), this.id);
            same(mixpanel.test.get_property('$device_id'), stripDevicePrefix(distinct_id));
        });

        test("identify supports numeric values", 3, function() {
            var distinct_id = mixpanel.test.get_distinct_id();
            mixpanel.test.identify(42);
            same(mixpanel.test.get_distinct_id(), 42);
            same(mixpanel.test.get_property('$user_id'), 42);
            same(mixpanel.test.get_property('$device_id'), stripDevicePrefix(distinct_id));
        });

        test("identify shouldn't set user_id if called with same distinct_id", 3, function() {
            var distinct_id = mixpanel.test.get_distinct_id();
            mixpanel.test.identify(distinct_id);
            same(mixpanel.test.get_distinct_id(), distinct_id);
            isUndefined(mixpanel.test.get_property('$user_id'));
            same(mixpanel.test.get_property('$device_id'), stripDevicePrefix(distinct_id));
        });

        test("identify should return an error when new_distinct_id starts with device prefix", 3, function() {
            var distinct_id = mixpanel.test.get_distinct_id();
            same(mixpanel.test.identify('$device:' + this.id), -1);
            isUndefined(mixpanel.test.get_property('$user_id'));
            same(mixpanel.test.get_property('$device_id'), stripDevicePrefix(distinct_id));
        });

        test("name_tag", 2, function() {
            var name_tag = "fake name";
            same(get_superprops_without_defaults(mixpanel.test), {}, "empty before setting");

            mixpanel.test.name_tag(name_tag);
            same(get_superprops_without_defaults(mixpanel.test), {
                'mp_name_tag': name_tag
            }, "name tag set");
        });

        test("super properties included", 2, function() {
            var props = {
                'a': 'b',
                'c': 'd'
            };
            mixpanel.test.register(props);

            var data = mixpanel.test.track('test');
            var dp = data.properties;

            ok('token' in dp, "token included in properties");

            ok(contains_obj(dp, props), 'super properties included correctly');
        });

        test("super properties overridden by manual props", 2, function() {
            var props = {
                'a': 'b',
                'c': 'd'
            };
            mixpanel.test.register(props);

            var data = mixpanel.test.track('test', {
                'a': 'c'
            });
            var dp = data.properties;

            ok('token' in dp, "token included in properties");

            ok(contains_obj(dp, {
                'a': 'c',
                'c': 'd'
            }), 'super properties included correctly');
        });

        test("register (non-persistent)", 3, function() {
            var props = {'hi': 'there'};

            same(get_superprops_without_defaults(mixpanel.test), {}, "persisted props are empty before setting");
            mixpanel.test.register(props, {persistent: false});
            same(get_superprops_without_defaults(mixpanel.test), {}, "persisted props are empty after setting");

            var data = mixpanel.test.track('test', {'foo': 'bar'});
            ok(contains_obj(data.properties, {
                'foo': 'bar',
                'hi': 'there'
            }), 'non-persistent super properties included in track calls');
        });

        test("register_once (non-persistent)", 5, function() {
            var props1 = {'hi': 'there'},
                props2 = {'hi': 'ho'};

            same(get_superprops_without_defaults(mixpanel.test), {}, "persisted props are empty before setting");
            mixpanel.test.register_once(props1, 'None', {persistent: false});
            same(get_superprops_without_defaults(mixpanel.test), {}, "persisted props are empty after setting");

            var data = mixpanel.test.track('test', {'foo': 'bar'});
            ok(contains_obj(data.properties, {
                'foo': 'bar',
                'hi': 'there'
            }), 'non-persistent super properties included in track calls');

            mixpanel.test.register_once(props2, 'None', {persistent: false});
            data = mixpanel.test.track('test', {'foo': 'bar'});
            ok(contains_obj(data.properties, {
                'foo': 'bar',
                'hi': 'there'
            }), "register_once doesn't override already set super property");

            mixpanel.test.register_once({falsey: 0}, null, {persistent: false});
            mixpanel.test.register_once({falsey: 1}, null, {persistent: false});
            data = mixpanel.test.track('test', {'foo': 'bar'});
            ok(contains_obj(data.properties, {
                falsey: 0
            }), "register_once doesn't override already-set falsey value");
        });

        test("register: precedence of superprops and props", 3, function() {
            var non_persisted_props = {'hi': 'there'},
                persisted_props = {'hi': 'ho'};

            mixpanel.test.register(persisted_props, {persistent: true});
            var data = mixpanel.test.track('test', {'foo': 'bar'});
            ok(contains_obj(data.properties, {
                'foo': 'bar',
                'hi': 'ho'
            }), 'persistent super properties included in track calls');

            mixpanel.test.register(non_persisted_props, {persistent: false});
            data = mixpanel.test.track('test', {'foo': 'bar'});
            ok(contains_obj(data.properties, {
                'foo': 'bar',
                'hi': 'there'
            }), 'non-persistent super properties take precedence over persistent');

            data = mixpanel.test.track('test', {'foo': 'bar', 'hi': 'you'});
            ok(contains_obj(data.properties, {
                'foo': 'bar',
                'hi': 'you'
            }), 'explicitly-set props take precedence over all superprops');
        });

        test("props are loaded from persistence when tracking", function() {
            var data = mixpanel.test.track('test', {'foo': 'bar'});
            ok(contains_obj(data.properties, {'foo': 'bar'}));
            ok(!('a' in data.properties));

            // initialize a separate instance with the same token (same persistence key)
            // and set a super property in it
            mixpanel.init(mixpanel.test.get_config('token'), {}, 'props_load_test');
            mixpanel.props_load_test.register({'a': 'b'});

            // verify that the super property is now used in tracking from the original instance
            data = mixpanel.test.track('test', {'foo': 'bar'});
            ok(contains_obj(data.properties, {
                'foo': 'bar',
                'a': 'b',
            }));
        });

        test("unregister (non-persistent)", 4, function() {
            mixpanel.test.register({'foo': 'persisted'}, {persistent: true});
            mixpanel.test.unregister('foo', {persistent: false});
            same(get_superprops_without_defaults(mixpanel.test), {
                'foo': 'persisted'
            }, "non-persistent unregister does not unset persisted superprops");

            mixpanel.test.register({'bar': 'not persisted'}, {persistent: false});
            var data = mixpanel.test.track('test', {'hello': 'world'});
            ok(contains_obj(data.properties, {
                'hello': 'world',
                'foo': 'persisted',
                'bar': 'not persisted'
            }));

            mixpanel.test.unregister('bar', {persistent: false});
            data = mixpanel.test.track('test', {'hello': 'world'});

            same(data.properties.foo, 'persisted', 'still tracks persisted superprop');
            same(data.properties.bar, undefined, 'unregistered prop is not tracked');
        });

        mpmodule("hooks");

        test("before_send_events hook", 1, function() {
            mixpanel.test.set_config({
                hooks: {
                    before_send_events: function append_42(event_data) {
                        return {
                            event: event_data.event + ' 42',
                            properties: event_data.properties
                        };
                    }
                }
            });
            var data = mixpanel.test.track('my event', {'foo': 'bar'});
            same(data.event, 'my event 42', 'should transform tracked event with hook');
        });

        test("before_send_people hook", 3, function() {
            mixpanel.test.set_config({
                hooks: {
                    before_send_people: function uppercase_name(profile_data) {
                        return _.extend(profile_data, {
                            $set: profile_data.$set ? _.extend(profile_data.$set, {
                                name: profile_data.$set.name.toUpperCase()
                            }) : {}
                        });
                    }
                }
            });
            mixpanel.test.people.set('name', 'stravinsky');

            stop();
            mixpanel.test.identify(this.id, function(resp, data) {
                ok(resp == 1, "Successful write");
                same(data.$set.name, 'STRAVINSKY', 'should transform previously-queued profile update with hook');

                data = mixpanel.test.people.set('name', 'bob');
                same(data.$set.name, 'BOB', 'after identify, should apply hooks when sending immediately');

                start();
            });
        });

        test("before_send_groups hook", 1, function() {
            mixpanel.test.set_config({
                hooks: {
                    before_send_groups: function lowercase_owner(group_data) {
                        return _.extend(group_data, {
                            $set: _.extend(group_data.$set, {
                                owner: group_data.$set.owner.toLowerCase()
                            })
                        });
                    }
                }
            });

            var group = mixpanel.test.get_group('storefront', 'Pro Kitten Trader');
            var data = group.set('owner', 'Brak');
            same(data.$set.owner, 'brak', 'should transform group update with hook');
        });

        test("before_send_events hook affects track_with_groups", 1, function() {
            mixpanel.test.set_config({
                hooks: {
                    before_send_events: function uppercase_storefront(event_data) {
                        return {
                            event: event_data.event,
                            properties: _.extend(event_data.properties, {
                                storefront: event_data.properties.storefront.toUpperCase()
                            })
                        };
                    }
                }
            });
            var data = mixpanel.test.track_with_groups('my event', {
                'foo': 'bar'
            }, {
                'storefront': 'Pro Kitten Trader'
            });
            same(data.properties.storefront, 'PRO KITTEN TRADER', 'should transform group prop with hook');
        });

        test("before_send_ hook prevents track if no value is returned", 1, function() {
            mixpanel.test.set_config({
                hooks: {
                    before_send_events: function(event_data) {
                        // mutates arg but doesn't return anything
                        event_data.event = 'foo';
                    }
                }
            });
            var data = mixpanel.test.track('my event', {'foo': 'bar'});
            same(data, null);
        });

        mpmodule("mixpanel.track_links");

        asyncTest("callback test", 1, function() {
            var e1 = ele_with_class();

            mixpanel.test.track_links(e1.class_name, "link_clicked", {
                "property": "dodeo"
            }, function() {
                start();
                ok(1 === 1, "track_links callback was fired");
                return false; // this stops the browser from going to the link location
            });

            simulateMouseClick(e1.e);
        });

        asyncTest("callbacks are preserved", 1, function() {
            var e1 = ele_with_class();

            var old_was_fired = false;

            e1.e.onclick = function() {
                old_was_fired = true;
                return false;
            };

            mixpanel.test.track_links(e1.class_name, "link_clicked", {
                "property": "it works"
            }, function() {
                start();
                ok(old_was_fired, "Old event was fired, and new event was fired");
                return false;
            });

            simulateMouseClick(e1.e);
        });

        asyncTest("supports changing the timeout", 3, function() {
            var e1 = ele_with_class();

            mixpanel.init(this.token, {
                batch_requests: true,
                debug: true
            }, "batching");

            same(mixpanel.batching.config.track_links_timeout, 300, "track_links_timeout defaults to a sane value");
            mixpanel.batching.set_config({
                "track_links_timeout": 1000
            });
            same(mixpanel.batching.config.track_links_timeout, 1000, "track_links_timeout can be changed");

            // this part is only relevant to non-batching configs
            // setting it to 1 so the callback fires right away
            mixpanel.nonbatching.set_config({
                "track_links_timeout": 1
            });
            mixpanel.nonbatching.track_links(e1.class_name, "do de do", {}, function(timeout_occured) {
                ok(timeout_occured, "track_links_timeout successfully modified the timeout");
                mixpanel.nonbatching.set_config({
                    "track_links_timeout": 300
                });
                start();
                return false;
            });

            simulateMouseClick(e1.e);
        });

        asyncTest("adds a url property to events", 1, function() {
            var e1 = ele_with_class();

            e1.e.href = "#test";
            mixpanel.test.track_links(e1.class_name, "testing url property", {}, function(timeout_occured, properties) {
                ok(properties.url !== undefined && properties.url !== null, "Url property was successfully added");
                start();
                return false;
            });

            simulateMouseClick(e1.e);
        });

        // callsError may fail if there is no console, so we can't expect 1 tests
        test("gracefully fails on invalid query", function() {
            var e1 = link_with_id(),
                e2 = link_with_id();

            mixpanel.test.track_links("a" + e1.id, "this should work");

            if (window.console) {
                stop();
                callsError(function(restore_console) {
                    mixpanel.test.track_links("a#badbadbadid", "this shouldn't work");
                    restore_console();
                    start();
                }, "terrible query should not throw exception");
            }
        });

        test("dom selection library handles svg object className's", 1, function() {
            var name = rand_name(),
                svg = $('<svg width="300" height="100" class="' + name + '"><text class=".label" x="200" y="30">Test</text></svg>');
            append_fixture(svg);

            try {
                mixpanel.test.track_links('.test', "this should not fire an error");
                ok(true);
            } catch (err) {
                if (/TypeError/.exec(err)) {
                    ok(false, "shouldn't throw a type error");
                } else {
                    throw err;
                }
            }

            svg.remove();
        });

        asyncTest("accepts a DOM element as the query", 1, function() {
            var link = ele_with_class().e;
            link.href = "#test";

            mixpanel.test.track_links(link, "testing url property", {}, function() {
                start();
                ok(1===1, "track_links callback was fired");
                return false;
            });

            simulateMouseClick(link);
        });

        asyncTest("accepts a jquery list of elements as the query", 2, function() {
            var link_one = ele_with_class().e;
            var link_two = ele_with_class().e;

            var $links = $(link_one).add(link_two);
            equal($links.length, 2);
            mixpanel.test.track_links($links, "testing jquery links", {}, function() {
                start();
                ok(1===1, "track_links callback was fired");
                return false;
            });

            simulateMouseClick(link_two);
        });

        asyncTest("accepts an iterable list of DOM elements as the query", 2, function() {
            var first_link = link_with_id();
            var second_link = link_with_id();

            var links = document.querySelectorAll(first_link.id + ',' + second_link.id);
            equal(links.length, 2);
            mixpanel.test.track_links(links, "testing url property", {}, function() {
                start();
                ok(1===1, "track_links callback was fired");
                return false;
            });

            simulateMouseClick(first_link.e);
        });

        mpmodule("mixpanel.track_forms");

        asyncTest("callback test", 1, function() {
            var e1 = form_with_class();

            mixpanel.test.track_forms(e1.class_name, "form_submitted", {
                "property": "dodeo"
            }, function() {
                start();
                ok(1 === 1, "track_forms callback was fired");
                return false; // this stops the browser from going to the link location
            });

            simulateEvent(e1.e, 'submit');
        });

        asyncTest("supports changing the timeout", 1, function() {
            var e1 = form_with_class();

            // this part is only relevant to non-batching configs
            // setting it to 1 so the callback fires right away
            mixpanel.nonbatching.set_config({
                "track_links_timeout": 1
            });
            mixpanel.nonbatching.track_forms(e1.class_name, "do de do", {}, function(timeout_occured) {
                start();
                ok(timeout_occured, "track_links_timeout successfully modified the timeout (track_forms)");
                mixpanel.nonbatching.set_config({
                    "track_links_timeout": 300
                });
                return false;
            });

            simulateEvent(e1.e, 'submit');
        });

        asyncTest("accepts a DOM element as the query", 1, function() {
            var form = form_with_class();

            mixpanel.test.track_forms(form.e, "form_submitted", {}, function() {
                start();
                ok(1===1, "track_forms callback was fired");
                return false; // this stops the browser from going to the link location
            });

            simulateEvent(form.e, 'submit');
        });

        asyncTest("accepts an jquery list as the query", 2, function() {
            var $form_one = $('<form>');
            var $form_two = $('<form>');

            var $forms = $form_one.add($form_two);
            equal($forms.length, 2);
            mixpanel.test.track_forms($forms, "form_submitted", {}, function() {
                start();
                ok(1===1, "track_forms callback was fired");
                return false; // this stops the browser from going to the link location
            });

            simulateEvent($form_two[0], 'submit');
        });

        asyncTest("accepts a list of DOM elements as the query", 2, function() {
            var form_one = form_with_class();
            var form_two = form_with_class();

            var forms = document.querySelectorAll(form_one.class_name + ',' + form_two.class_name);
            equal(forms.length, 2);
            mixpanel.test.track_forms(forms, "form_submitted", {}, function() {
                start();
                ok(1===1, "track_forms callback was fired");
                return false; // this stops the browser from going to the link location
            });

            simulateEvent(form_two.e, 'submit');
        });

        mpmodule("mixpanel.alias");
        var __alias = "__alias";

        test("alias sends an event", 2, function() {
            var old_id = mixpanel.test.get_distinct_id(),
                new_id = this.id;

            var ev = mixpanel.test.alias(new_id);

            notOk(old_id === new_id);
            same(ev["event"], "$create_alias");
        });

        test("$create_alias contains required properties", 1, function() {
            var old_id = mixpanel.test.get_distinct_id(),
                new_id = this.id;

            var ev = mixpanel.test.alias(new_id);

            same({
                "distinct_id": old_id,
                "alias": new_id
            }, _.pick(ev.properties, "distinct_id", "alias"));
        });

        test("continues to use old ID after alias call", 3, function() {
            var old_id = mixpanel.test.get_distinct_id(),
                new_id = this.id;
            notOk(old_id === new_id);

            mixpanel.test.alias(new_id);
            same(mixpanel.test.get_distinct_id(), old_id);
            same(mixpanel.test.get_property(__alias), new_id);
        });

        test("aliasing same ID returns error code", 1, function() {
            var old_id = mixpanel.test.get_distinct_id(),
                ev = mixpanel.test.alias(old_id);

            same(ev, -1);
        });

        test("alias prevents identify from changing the ID", 5, function() {
            var old_id = mixpanel.test.get_distinct_id(),
                new_id = this.id;
            notOk(old_id === new_id);
            mixpanel.test.alias(new_id);
            mixpanel.test.identify(new_id);
            same(mixpanel.test.get_distinct_id(), old_id, "identify should not do anything");
            same(mixpanel.test.get_property('$user_id'), new_id, "identify should always set user_id");
            same(mixpanel.test.get_property('$device_id'), stripDevicePrefix(old_id));
            same(mixpanel.test.get_property(__alias), new_id, "identify should not delete the __alias key");
        });

        test("identify with completely new ID blows away alias", 3, function() {
            var old_id = mixpanel.test.get_distinct_id(),
                alias = this.id,
                new_id = rand_name();
            notOk((old_id === alias) || (alias === new_id) || (new_id === old_id));
            mixpanel.test.alias(alias);
            mixpanel.test.identify(new_id);
            same(mixpanel.test.get_distinct_id(), new_id, "identify should replace the distinct id");
            same(mixpanel.test.get_property(__alias), undefined, "__alias should get blown away");
        });

        test("alias not in props", 3, function() {
            var old_id = mixpanel.test.get_distinct_id(),
                new_id = this.id;
            notOk(old_id === new_id);
            mixpanel.test.alias(new_id);
            same(mixpanel.test.get_property(__alias), new_id, "identify should not delete the __alias key");
            notOk(__alias in mixpanel.test.persistence.properties())
        });

        test("alias not allowed when there is previous people distinct id", 2, function() {
            mixpanel.test.register({
                "$people_distinct_id": this.id
            });
            same(mixpanel.test.alias(this.id), -2);
            same(mixpanel.test.get_property(__alias), undefined, "__alias should not be set");
        });

        mpmodule("mixpanel.identify", startRecordingXhrRequests, stopRecordingXhrRequests);

        // we are testing internal logic, not browser behavior, so only run these tests
        // in browsers that use xhr requests and support base64 decoding
        if (USE_XHR && window.btoa && Array.prototype.filter && Array.prototype.map) {

            function getEventsFromTrackRequests(requests) {
                return (requests || [])
                    .filter(function(item) {
                        return item.url.indexOf('https://api-js.mixpanel.com/track/') === 0;
                    })
                    .map(function(request) {
                        return getRequestData(request);
                    });
            }

            test("identify sends an event", 4, function() {
                var current_id = mixpanel.test.get_distinct_id(),
                    new_id = this.id;

                mixpanel.test.identify(new_id);

                var events = getEventsFromTrackRequests(this.requests);

                same(events.length, 1);
                same(events[0]["event"], "$identify");
                same(events[0].properties.distinct_id, new_id);
                same(events[0].properties.$anon_distinct_id, current_id);
            });

            test("repeated identify with same ID does not send an event", 1, function() {
                var current_id = mixpanel.test.get_distinct_id(),
                    new_id = this.id;

                mixpanel.test.identify(new_id);
                mixpanel.test.identify(new_id);

                var events = getEventsFromTrackRequests(this.requests);
                same(events.length, 1);
            });

            test("repeated identify with another ID does send an event", 7, function() {
                var current_id = mixpanel.test.get_distinct_id(),
                    new_id1 = this.id,
                    new_id2 = rand_name();

                mixpanel.test.identify(new_id1);
                mixpanel.test.identify(new_id2);

                var events = getEventsFromTrackRequests(this.requests);

                same(events.length, 2);

                var ev1 = events[0],
                    ev2 = events[1];

                same(ev1["event"], "$identify");
                same(ev1.properties.distinct_id, new_id1);
                same(ev1.properties.$anon_distinct_id, current_id);

                same(ev2["event"], "$identify");
                same(ev2.properties.distinct_id, new_id2);
                same(ev2.properties.$anon_distinct_id, new_id1);
            });

            test("same user logging in after reset sends an event", 13, function() {
                var current_id = mixpanel.test.get_distinct_id(),
                    new_id1 = this.id,
                    new_id2 = rand_name();

                mixpanel.test.identify(new_id1);
                mixpanel.test.track('fake event after identify');
                mixpanel.test.reset();
                var after_reset_id = mixpanel.test.get_distinct_id();
                mixpanel.test.track('fake event after reset');
                mixpanel.test.identify(new_id2);
                mixpanel.test.track('fake event after second identify');

                var events = getEventsFromTrackRequests(this.requests);
                same(events.length, 5);

                var first_identify_event = events[0];
                same(first_identify_event["event"], "$identify");
                same(first_identify_event.properties.distinct_id, new_id1);
                same(first_identify_event.properties.$anon_distinct_id, current_id);

                var fake_event_after_identify = events[1];
                same(fake_event_after_identify["event"], "fake event after identify");
                same(fake_event_after_identify.properties.distinct_id, new_id1);

                var fake_event_after_reset = events[2];
                same(fake_event_after_reset["event"], "fake event after reset");
                same(fake_event_after_reset.properties.distinct_id, after_reset_id);

                var identify_after_reset = events[3];
                same(identify_after_reset["event"], "$identify");
                same(identify_after_reset.properties.distinct_id, new_id2);
                same(identify_after_reset.properties.$anon_distinct_id, after_reset_id);

                var fake_event_after_second_identify = events[4];
                same(fake_event_after_second_identify["event"], "fake event after second identify");
                same(fake_event_after_second_identify.properties.distinct_id, new_id2);
            });

            test("alias also sends an identify event", 7, function() {
                var current_id = mixpanel.test.get_distinct_id(),
                    new_id = rand_name();

                mixpanel.test.alias(new_id);
                var requests = this.requests;
                for (var i = 0; i < requests.length; i++) {
                    requests[i].respond(200, {}, '1');
                }

                var events = getEventsFromTrackRequests(this.requests);
                same(events.length, 2);

                var alias_event = events[0];
                same(alias_event["event"], "$create_alias");
                same(alias_event.properties.alias, new_id);
                same(alias_event.properties.distinct_id, current_id);

                var identify_event = events[1];
                same(identify_event["event"], "$identify");
                same(identify_event.properties.distinct_id, new_id);
                same(identify_event.properties.$anon_distinct_id, current_id);
            });

            test("$identify and $create_alias events are not transformed by hooks", 2, function() {
                mixpanel.test.set_config({
                    hooks: {
                        before_send_events: function append_42(event_data) {
                            return {
                                event: event_data.event + ' 42',
                                properties: event_data.properties
                            };
                        }
                    }
                });

                mixpanel.test.alias(rand_name());
                var requests = this.requests;
                for (var i = 0; i < requests.length; i++) {
                    requests[i].respond(200, {}, '1');
                }

                var events = getEventsFromTrackRequests(this.requests);
                same(events[0]["event"], "$create_alias", "should not have transformed $create_alias event");
                same(events[1]["event"], "$identify", "should not have transformed $identify event");
            });
        }

        module("mixpanel._", {
            setup: function() {
                this.p = mixpanel._;
            }
        });

        test("isObject", 5, function() {
            ok(this.p.isObject({}), "isObject identifies an object");
            ok(this.p.isObject({
                'hi': 'hi'
            }), "isObject identifies an object");
            notOk(this.p.isObject([]), "isObject fails array");
            notOk(this.p.isObject([1, 2, 3]), "isObject fails array");
            notOk(this.p.isObject("a string"), "isObject fails string");
        });

        test("toArray", 4, function() {
            function is_array(obj) {
                var obj_str = Object.prototype.toString.call(obj);
                return (obj_str === '[object Array]');
            }

            var elements = document.getElementsByTagName("*");

            ok(is_array(this.p.toArray([])), "toArray handles arrays");
            ok(is_array(this.p.toArray(elements)), "toArray handles html lists");
            ok(is_array(this.p.toArray(null)), "toArray handles null");
            ok(is_array(this.p.toArray(undefined)), "toArray handles undefined");
        });

        mpmodule("mixpanel.push");

        test("anon function called", 1, function() {
            var a = 1;
            mixpanel.push(function() {
                a = 2;
            });
            same(a, 2, 'Pushed function is executed immediately');
        });

        var value = Math.random();
        test("instance function called", 1, function() {
            mixpanel.push(['register', {
                value: value
            }]);
            same(mixpanel.persistence.props.value, value, "executed immediately");
        });

        mpmodule("mixpanel.people.set");

        test("set (basic functionality)", 8, function() {
            var _to_set = {
                    key1: 'val1'
                },
                _to_set2 = {
                    key2: 'val3',
                    '$age': 34
                },
                s;

            s = mixpanel.people.set('key1', _to_set['key1']);
            ok(contains_obj(s["$set"], _to_set), ".set() a single value works");

            s = mixpanel.people.set(_to_set);
            ok(contains_obj(s["$set"], _to_set), ".set() an object (with only 1 key) works");

            s = mixpanel.people.set(_to_set2);
            ok(contains_obj(s["$set"], _to_set2), ".set() an object (with multiple keys) works");
            var old_distinct_id = mixpanel.test.get_distinct_id();
            mixpanel.test.identify(this.id);
            s = mixpanel.test.people.set(_to_set2);
            same(s['$distinct_id'], this.id);
            same(s['$device_id'], stripDevicePrefix(old_distinct_id));
            same(s['$user_id'], this.id);
            same(s['$token'], this.token);
            ok(contains_obj(s['$set'], _to_set2));
        });

        test("set queues data", 2, function() {
            stop();
            s = mixpanel.test.people.set({
                a: 2
            }, function(resp) {
                same(resp, -1, "responded with 'queued'");
                start();
            });
            ok(contains_obj(mixpanel.test.persistence.props['__mps'], {
                a: 2
            }), "queued set saved");
        });

        test("set hits server immediately if identified", 6, function() {
            var old_distinct_id = mixpanel.test.get_distinct_id();
            mixpanel.test.identify(this.id);

            stop();
            s = mixpanel.test.people.set({
                a: 3
            }, function(resp) {
                same(resp, 1, "responded with 'success'");
                start();
            });
            same(s['$distinct_id'], this.id, '$distinct_id pulled out correctly');
            same(s['$user_id'], this.id, '$user_id pulled out correctly');
            same(s['$device_id'], stripDevicePrefix(old_distinct_id), '$device_id pulled out correctly');
            same(s['$token'], this.token, '$token pulled out correctly');
            ok(contains_obj(s['$set'], {
                'a': 3
            }));
        });

        test("set (info props included)", 3, function() {
            var info_props = "$os $browser $browser_version".split(' ');

            var data = mixpanel.people.set('key1', 'test');

            _.each(info_props, function(prop) {
                ok(prop in data['$set'], "set properties should include " + prop);
            });
        });

        test("set overrides previously queued unset calls", 6, function() {
            mixpanel.test.people.unset('a', function(resp) {
                same(resp, -1, "responded with 'queued'");
            });
            ok(contains_obj(mixpanel.test.persistence.props['__mpus'], {
                a: true
            }), "queued unset saved");
            notOk('a' in mixpanel.test.persistence.props['__mps'], "unset prop not in set queue");

            mixpanel.test.people.set({
                a: 2
            }, function(resp) {
                same(resp, -1, "responded with 'queued'");
            });
            ok(contains_obj(mixpanel.test.persistence.props['__mps'], {
                a: 2,
            }), "queued set call works correctly");
            notOk('a' in mixpanel.test.persistence.props['__mpus'], "set overrides previously queued unset");
        });

        mpmodule("mixpanel.people.unset");

            test("unset (basic functionality)", 6, function() {
                var req_data;

                req_data = mixpanel.people.unset('key1');
                same(req_data['$unset'], ['key1'], '.unset() a single value works');

                req_data = mixpanel.people.unset(['key1']);
                same(req_data['$unset'], ['key1'], '.unset() a single-value array works');

                req_data = mixpanel.people.unset(['key1', 'key2']);
                same(req_data['$unset'], ['key1', 'key2'], '.unset() a multi-value array works');

                mixpanel.test.identify(this.id);
                req_data = mixpanel.test.people.unset(['foo', 'bar']);
                same(req_data['$distinct_id'], this.id);
                same(req_data['$token'], this.token);
                same(req_data['$unset'], ['foo', 'bar']);
            });

            test("unset queues data", 2, function() {
                stop();
                mixpanel.test.people.unset('a', function(resp) {
                    same(resp, -1, "responded with 'queued'");
                    start();
                });
                ok(contains_obj(mixpanel.test.persistence.props['__mpus'], {
                    a: true
                }), "queued unset saved");
            });

            test("unset hits server immediately if identified", 4, function() {
                mixpanel.test.identify(this.id);

                stop();
                req_data = mixpanel.test.people.unset('a', function(resp) {
                    same(resp, 1, "responded with 'success'");
                    start();
                });

                same(req_data['$distinct_id'], this.id, '$distinct_id pulled out correctly');
                same(req_data['$token'], this.token, '$token pulled out correctly');
                same(req_data['$unset'], ['a']);
            });

            test("unset does not undo reserved properties", 5, function() {
                var req_data = mixpanel.people.unset('$distinct_id');
                same(req_data['$unset'], []);

                var req_data = mixpanel.people.unset(['$distinct_id']);
                same(req_data['$unset'], []);

                var req_data = mixpanel.people.unset('$token');
                same(req_data['$unset'], []);

                mixpanel.test.identify(this.id);
                stop();
                req_data = mixpanel.test.people.unset('$distinct_id', function(resp) {
                    same(resp, 0, "responded with 'failure'");
                    start();
                });
                same(req_data['$unset'], []);
            });

            test("queued unset overrides previously queued set calls", 10, function() {
                mixpanel.test.people.set({
                    a: 2
                }, function(resp) {
                    same(resp, -1, "responded with 'queued'");
                });
                ok(contains_obj(mixpanel.test.persistence.props['__mps'], {
                    a: 2,
                }), "queued set call works correctly");

                mixpanel.test.people.unset('a', function(resp) {
                    same(resp, -1, "responded with 'queued'");
                });
                ok(contains_obj(mixpanel.test.persistence.props['__mpus'], {
                    a: true
                }), "queued unset saved");
                notOk('a' in mixpanel.test.persistence.props['__mps'], "removed previously queued prop");

                mixpanel.test.people.set_once({
                    a: 3
                }, function(resp) {
                    same(resp, -1, "responded with 'queued'");
                });
                ok(contains_obj(mixpanel.test.persistence.props['__mpso'], {
                    a: 3,
                }), "queued set_once call works correctly");

                mixpanel.test.people.unset('a', function(resp) {
                    same(resp, -1, "responded with 'queued'");
                });
                ok(contains_obj(mixpanel.test.persistence.props['__mpus'], {
                    a: true
                }), "queued unset saved");
                notOk('a' in mixpanel.test.persistence.props['__mpso'], "removed previously queued prop");
            });

        mpmodule("mixpanel.people.set_once");

        test("set_once (basic functionality)", 6, function() {
            var _to_set = {
                    key1: 'val1'
                },
                _to_set2 = {
                    key2: 'val3',
                    '$age': 34
                },
                s;

            s = mixpanel.people.set_once('key1', _to_set['key1']);
            ok(contains_obj(s["$set_once"], _to_set), ".set_once() a single value works");

            s = mixpanel.people.set_once(_to_set);
            ok(contains_obj(s["$set_once"], _to_set), ".set_once() an object (with only 1 key) works");

            s = mixpanel.people.set_once(_to_set2);
            ok(contains_obj(s["$set_once"], _to_set2), ".set_once() an object (with multiple keys) works");

            mixpanel.test.identify(this.id);
            s = mixpanel.test.people.set_once(_to_set2);
            same(s['$distinct_id'], this.id);
            same(s['$token'], this.token);
            ok(contains_obj(s['$set_once'], _to_set2));
        });

        test("set_once queues data", 2, function() {
            stop();
            s = mixpanel.test.people.set_once({
                a: 2
            }, function(resp) {
                same(resp, -1, "responded with 'queued'");
                start();
            });
            ok(contains_obj(mixpanel.test.persistence.props['__mpso'], {
                a: 2
            }), "queued set_once saved");
        });

        test("set_once hits server immediately if identified", 4, function() {
            mixpanel.test.identify(this.id);

            stop();
            s = mixpanel.test.people.set_once({
                a: 3
            }, function(resp) {
                same(resp, 1, "responded with 'success'");
                start();
            });

            same(s['$distinct_id'], this.id, '$distinct_id pulled out correctly');
            same(s['$token'], this.token, '$token pulled out correctly');
            ok(contains_obj(s['$set_once'], {
                'a': 3
            }));
        });

        test("set_once (info props not included)", 5, function() {
            var info_props = "$os $browser $browser_version $initial_referrer $initial_referring_domain".split(' ');

            var data = mixpanel.people.set_once('key1', 'test');

            _.each(info_props, function(prop) {
                notOk(prop in data['$set_once'], "set_once properties should not include " + prop);
            });
        });

        test("queued set_once calls don't override previously queued calls", 3, function() {
            s = mixpanel.test.people.set_once({
                a: 2
            }, function(resp) {
                same(resp, -1, "responded with 'queued'");
            });

            s = mixpanel.test.people.set_once({
                a: 3,
                b: 4
            }, function(resp) {
                same(resp, -1, "responded with 'queued'");
            });
            ok(contains_obj(mixpanel.test.persistence.props['__mpso'], {
                a: 2,
                b: 4
            }), "queued set_once call works correctly");
        });

        test("set_once overrides previously queued unset calls", 6, function() {
            mixpanel.test.people.unset('a', function(resp) {
                same(resp, -1, "responded with 'queued'");
            });
            ok(contains_obj(mixpanel.test.persistence.props['__mpus'], {
                a: true
            }), "queued unset saved");
            notOk('a' in mixpanel.test.persistence.props['__mpso'], "unset prop not in set_once queue");

            mixpanel.test.people.set_once({
                a: 2
            }, function(resp) {
                same(resp, -1, "responded with 'queued'");
            });
            ok(contains_obj(mixpanel.test.persistence.props['__mpso'], {
                a: 2,
            }), "queued set_once call works correctly");
            notOk('a' in mixpanel.test.persistence.props['__mpus'], "set overrides previously queued unset");
        });

        mpmodule("mixpanel.people.increment");

        test("increment (basic functionality)", 4, function() {
            var _to_inc = {
                    "$age": 3
                },
                _to_inc2 = {
                    "$age": 87,
                    "pageviews": 3
                },
                i;

            i = mixpanel.people.increment("$age");
            same(i["$add"], {
                "$age": 1
            }, ".increment() with no number increments by 1");

            i = mixpanel.people.increment(_to_inc);
            same(i["$add"], _to_inc, ".increment() with an object (only 1 key) works");

            i = mixpanel.people.increment(_to_inc2);
            same(i["$add"], _to_inc2, ".increment() with an object (multiple keys) works");
            var old_distinct_id = mixpanel.test.get_distinct_id();
            mixpanel.test.identify(this.id);
            i = mixpanel.test.people.increment(_to_inc2);
            same(i, {
                "$distinct_id": this.id,
                "$user_id": this.id,
                "$device_id": stripDevicePrefix(old_distinct_id),
                "$token": this.token,
                "$add": _to_inc2
            }, "Basic inc works for additional libs");
        });

        test("increment queues data", 2, function() {
            stop();
            s = mixpanel.test.people.increment({
                a: 2
            }, function(resp) {
                same(resp, -1, "responded with 'queued'");
                start();
            });
            same(mixpanel.test.persistence.props['__mpa'], {
                a: 2
            }, "queued increment saved");
        });

        test("increment hits server immediately if identified", 2, function() {
            var old_distinct_id = mixpanel.test.get_distinct_id();
            mixpanel.test.identify(this.id);

            stop();
            s = mixpanel.test.people.increment({
                a: 3
            }, function(resp) {
                same(resp, 1, "responded with 'success'");
                start();
            });
            same(s, {
                "$distinct_id": this.id,
                "$user_id": this.id,
                "$device_id": stripDevicePrefix(old_distinct_id),
                "$token": this.token,
                "$add": {
                    "a": 3
                }
            }, "$token and $distinct_id pulled out correctly");
        });

        test("increment ignores string values", 1, function() {
            var old_distinct_id = mixpanel.test.get_distinct_id();
            mixpanel.test.identify(this.id);
            i = mixpanel.test.people.increment({
                "a": 1,
                "name": "joe"
            });
            same(i, {
                "$distinct_id": this.id,
                "$user_id": this.id,
                "$device_id": stripDevicePrefix(old_distinct_id),
                "$token": this.token,
                "$add": {
                    "a": 1
                }
            }, "string value ignored");
        });

        mpmodule("mixpanel.people.append");

        test("append (basic functionality)", 5, function() {
            var _append1 = {
                    'key': 'val'
                },
                _append2 = {
                    'key': ['val']
                },
                _append3 = {
                    'key': 'val',
                    'key2': 'val2'
                },
                i;

            i = mixpanel.people.append('key', 'val');
            same(i["$append"], {
                'key': 'val'
            }, ".append() with two params works");

            i = mixpanel.people.append(_append1);
            same(i["$append"], _append1, ".append() with an object (only 1 key) works");

            i = mixpanel.people.append(_append2);
            same(i["$append"], _append2, ".append() with an object (array) works");

            i = mixpanel.people.append(_append3);
            same(i["$append"], _append3, ".append() with an object (multiple keys) works");

            var old_distinct_id = mixpanel.test.get_distinct_id();
            mixpanel.test.identify(this.id);
            i = mixpanel.test.people.append(_append1);
            same(i, {
                "$distinct_id": this.id,
                "$device_id": stripDevicePrefix(old_distinct_id),
                "$user_id": this.id,
                "$token": this.token,
                "$append": _append1
            }, "Basic append works for additional libs");
        });

        test("append queues data", 2, function() {
            stop();
            s = mixpanel.test.people.append({
                a: 2
            }, function(resp) {
                same(resp, -1, "responded with 'queued'");
                start();
            });
            same(mixpanel.test.persistence.props['__mpap'], [{
                a: 2
            }], "queued append saved");
        });

        test("append hits server immediately if identified", 2, function() {
            var old_distinct_id = mixpanel.test.get_distinct_id();
            mixpanel.test.identify(this.id);

            stop();
            s = mixpanel.test.people.append({
                a: 3
            }, function(resp) {
                same(resp, 1, "responded with 'success'");
                start();
            });
            same(s, {
                "$distinct_id": this.id,
                "$device_id": stripDevicePrefix(old_distinct_id),
                "$user_id": this.id,
                "$token": this.token,
                "$append": {
                    "a": 3
                }
            }, "$token and $distinct_id pulled out correctly");
        });

        mpmodule("mixpanel.people.remove");

        test("remove (basic functionality)", 2, function() {
            var expected = {'key': 'val'};

            i = mixpanel.people.append('key', 'val');
            same(i["$append"], expected);

            var old_distinct_id = mixpanel.test.get_distinct_id();
            mixpanel.test.identify(this.id);
            i = mixpanel.test.people.append('key', 'val');
            same(i, {
                "$distinct_id": this.id,
                "$device_id": stripDevicePrefix(old_distinct_id),
                "$user_id": this.id,
                "$token": this.token,
                "$append": expected
            }, "Basic append works");
        });

        test("remove queues data", 2, function() {
            stop();
            s = mixpanel.test.people.remove({
                'key': 'val'
            }, function(resp) {
                same(resp, -1, "responded with 'queued'");
                start();
            });
            same(mixpanel.test.persistence.props['__mpr'], [{
                'key': 'val'
            }], "queued remove saved");
        });

        test("remove hits server immediately if identified", 2, function() {
            var old_distinct_id = mixpanel.test.get_distinct_id();
            mixpanel.test.identify(this.id);

            stop();
            s = mixpanel.test.people.remove({
                a: 3
            }, function(resp) {
                same(resp, 1, "responded with 'success'");
                start();
            });
            same(s, {
                "$distinct_id": this.id,
                "$device_id": stripDevicePrefix(old_distinct_id),
                "$user_id": this.id,
                "$token": this.token,
                "$remove": {
                    "a": 3
                }
            }, "$token and $distinct_id pulled out correctly");
        });

        test("remove overrides previously queued append calls", 6, function() {
            s = mixpanel.test.people.append({a: 2}, function(resp) {
                same(resp, -1, "responded with 'queued'");
            });
            same(mixpanel.test.persistence.props['__mpap'], [{a: 2}], "queued append saved");
            same(mixpanel.test.persistence.props['__mpr'], [], "appended prop not in remove queue");

            mixpanel.test.people.remove({a: 2}, function(resp) {
                same(resp, -1, "responded with 'queued'");
            });
            same(mixpanel.test.persistence.props['__mpr'], [{a: 2}], "queued remove call works correctly");
            same(mixpanel.test.persistence.props['__mpap'], [{}], "remove overrides previously queued append");
        });

        test("remove does not override previously queued append calls with different values", 6, function() {
            s = mixpanel.test.people.append({a: 2}, function(resp) {
                same(resp, -1, "responded with 'queued'");
            });
            same(mixpanel.test.persistence.props['__mpap'], [{a: 2}], "queued append saved");
            same(mixpanel.test.persistence.props['__mpr'], [], "appended prop not in remove queue");

            mixpanel.test.people.remove({a: 5}, function(resp) {
                same(resp, -1, "responded with 'queued'");
            });
            same(mixpanel.test.persistence.props['__mpr'], [{a: 5}], "queued remove call works correctly");
            same(mixpanel.test.persistence.props['__mpap'], [{a: 2}], "remove does not override append of different value");
        });

        mpmodule("mixpanel.people.union");

        test("union (basic functionality)", 7, function() {
            var _union1 = {
                    'key': ['val1']
                },
                _union2 = {
                    'key1': ['val1', 'val2'],
                    'key2': ['val2']
                },
                _union3 = {
                    'key': 'val1'
                },
                _union4 = {
                    'key1': ['val1', 'val2'],
                    'key2': 'val2'
                },
                i;

            i = mixpanel.people.union('key', ['val']);
            same(i["$union"], {
                'key': ['val']
            }, ".union() with two params works");

            i = mixpanel.people.union('key', 'val');
            same(i["$union"], {
                'key': ['val']
            }, ".union() with non-array val works");

            i = mixpanel.people.union(_union1);
            same(i["$union"], _union1, ".union() with an object (with only 1 key) works");

            i = mixpanel.people.union(_union2);
            same(i["$union"], _union2, ".union() with an object (with multiple keys) works");

            i = mixpanel.people.union(_union3);
            same(i["$union"], {
                'key': ['val1']
            }, ".union() with an object (with 1 key and non-array val) works");

            i = mixpanel.people.union(_union4);
            same(i["$union"], {
                'key1': ['val1', 'val2'],
                'key2': ['val2']
            }, ".union() with an object (with multiple keys and non-array val) works");

            var old_distinct_id = mixpanel.test.get_distinct_id();
            mixpanel.test.identify(this.id);
            i = mixpanel.test.people.union(_union2);
            same(i, {
                "$distinct_id": this.id,
                "$device_id": stripDevicePrefix(old_distinct_id),
                "$user_id": this.id,
                "$token": this.token,
                "$union": _union2
            }, "Basic union message works")
        });

        test("union calls provided callback", 2, function() {
            var _union1 = {
                    'key1': ['val1.1'],
                    'key2': ['val1.2']
                },
                _union2 = {
                    'key1': ['val2.1'],
                    'key3': ['val2.3']
                },
                i;

            mixpanel.test.people.union({
                'key': 'val'
            }, function(resp) {
                same(resp, -1, "calls callback in 2-arg form");
            });
            mixpanel.test.people.union('key', 'val', function(resp) {
                same(resp, -1, "calls callback in 3-arg form");
            });
        });

        test("union queues and merges data", 4, function() {
            var _union1 = {
                    'key1': ['val1.1'],
                    'key2': ['val1.2']
                },
                _union2 = {
                    'key1': ['val2.1', 'val1.1'],
                    'key3': ['val2.3']
                },
                i;

            mixpanel.test.people.union(_union1, function(resp) {
                same(resp, -1, "responded with 'queued'");
            });
            same(mixpanel.test.persistence.props['__mpu'], {
                'key1': ['val1.1'],
                'key2': ['val1.2']
            }, "queued union saved");
            mixpanel.test.people.union(_union2, function(resp) {
                same(resp, -1, "responded with 'queued'");
            });
            same(mixpanel.test.persistence.props['__mpu'], {
                'key1': ['val1.1', 'val2.1'],
                'key2': ['val1.2'],
                'key3': ['val2.3']
            }, "queued union saved");
        });

        test("set after union clobbers union queue", 4, function() {
            var _union = {
                    'key1': ['union_val'],
                    'key2': ['val2']
                },
                _set = {
                    'key1': 'set_val'
                },
                i;

            mixpanel.test.people.union(_union, function(resp) {
                same(resp, -1, "responded with 'queued'");
            });

            mixpanel.test.people.set(_set, function(resp) {
                same(resp, -1, "responded with 'queued'");
            });

            same(mixpanel.test.persistence.props['__mpu'], {
                'key2': ['val2']
            }, "set after union empties union queue");
            ok(contains_obj(mixpanel.test.persistence.props['__mps'], {
                'key1': 'set_val'
            }), "set after union enqueues set");
        });

        test("union sends immediately if identified", 2, function() {
            var old_distinct_id = mixpanel.test.get_distinct_id();
            mixpanel.test.identify(this.id);

            stop();
            s = mixpanel.test.people.union({
                a: [3]
            }, function(resp) {
                same(resp, 1, "responded with 'success'");
                start();
            });
            same(s, {
                "$distinct_id": this.id,
                "$device_id": stripDevicePrefix(old_distinct_id),
                "$user_id": this.id,
                "$token": this.token,
                "$union": {
                    "a": [3]
                }
            }, "$token and $distinct_id pulled out correctly");

        });

        mpmodule("mixpanel.people.track_charge");

        test("track_charge (basic functionality)", 2, function() {
            var amt = 50,
                amt_2 = 20,
                charge = {
                    '$amount': amt
                }
            charge_2 = {
                '$amount': amt_2
            }

            var i = mixpanel.people.track_charge(amt);
            ok(contains_obj(i['$append']['$transactions'], charge), '.track_charge() correctly appends to the $transactions object');

            mixpanel.test.identify(this.id);
            i = mixpanel.test.people.track_charge(amt_2);
            ok(contains_obj(i['$append']['$transactions'], charge_2), '.track_charge() works for additional libs');
        });

        test("track_charge accepts properties", 1, function() {
            var amt = 50,
                time = new Date('feb 1 2012'),
                charge = {
                    '$amount': amt,
                    '$time': date_to_ISO(time)
                };

            var i = mixpanel.people.track_charge(amt, {
                '$time': time
            });
            ok(contains_obj(i['$append']['$transactions'], charge), '.track_charge() correctly appends to the $transactions object');
        });

        test("track_charge handles numeric strings", 1, function() {
            var amt = " 40.56 ",
                charge = {
                    '$amount': 40.56
                }
            var i = mixpanel.people.track_charge(amt);

            ok(contains_obj(i['$append']['$transactions'], charge), '.track_charge() correctly converts numeric strings');
        });

        // callsError may fail if there is no console, so we can't expect 2 tests
        test("track_charge handles invalid values", function() {
            if (window.console) {
                callsError(function(restore_console) {
                    mixpanel.people.track_charge();
                    restore_console();
                }, ".track_charge() should call an error if called with no arguments");

                callsError(function(restore_console) {
                    mixpanel.people.track_charge("asdf");
                    restore_console();
                }, ".track_charge() should call an error if called with a non-numeric string argument");
            }
        });

        mpmodule("mixpanel.people.clear_charges");

        test("clear_charges", 1, function() {
            var d = mixpanel.test.people.clear_charges();

            same(d['$set']['$transactions'], [], 'clears transactions array');
        });

        mpmodule("mixpanel.people flushing");

        test("identify with no params", 2, function() {
            var errors = 0;
            distinct_id = mixpanel.test.get_distinct_id();
            if (window.console) {
                var old_error = console.error;
                console.error = function(msg) {
                    errors++;
                    old_error.apply(this, arguments);
                }
            }
            mixpanel.test.identify();
            if (window.console) {
                console.error = old_error;
            }
            same(mixpanel.test.get_distinct_id(), distinct_id);
            equal(errors, 0, "No errors were expected but some were encountered when calling identify with no arguments")
        });

        test("identify flushes set queue", 4, function() {
            mixpanel.test.people.set("a", "b");
            mixpanel.test.people.set("b", "c");

            stop();
            mixpanel.test.identify(this.id, function(resp, data) {
                ok(resp == 1, "Successful write");
                ok(contains_obj(data["$set"], {
                    "a": "b",
                    "b": "c"
                }));
                same(mixpanel.test.persistence.props['__mps'], {}, "Queue is cleared after flushing");
                // reload persistence to make sure it's persisted correctly
                mixpanel.test.persistence.load();
                same(mixpanel.test.persistence.props['__mps'], {}, "Empty queue is persisted");
                start();
            });
        });

        test("identify no params flushes set queue", 4, function() {
            mixpanel.test.people.set("a", "b");
            mixpanel.test.people.set("b", "c");

            stop();
            mixpanel.test.identify(undefined, function(resp, data) {
                ok(resp == 1, "Successful write");
                ok(contains_obj(data["$set"], {
                    "a": "b",
                    "b": "c"
                }));
                same(mixpanel.test.persistence.props['__mps'], {}, "Queue is cleared after flushing");
                // reload persistence to make sure it's persisted correctly
                mixpanel.test.persistence.load();
                same(mixpanel.test.persistence.props['__mps'], {}, "Empty queue is persisted");
                start();
            });
        });

        test("identify flushes set_once queue", 4, function() {
            mixpanel.test.people.set_once("a", "b");
            mixpanel.test.people.set_once("b", "c");

            stop();
            mixpanel.test.identify(this.id, function() {}, function() {}, function() {}, function(resp, data) {
                ok(resp == 1, "Successful write");
                ok(contains_obj(data["$set_once"], {
                    "a": "b",
                    "b": "c"
                }));
                same(mixpanel.test.persistence.props['__mpso'], {}, "Queue is cleared after flushing");
                // reload persistence to make sure it's persisted correctly
                mixpanel.test.persistence.load();
                same(mixpanel.test.persistence.props['__mpso'], {}, "Empty queue is persisted");
                start();
            });
        });

        test("identify flushes add queue", 4, function() {
            var _this = this;
            mixpanel.test.people.increment("a");
            mixpanel.test.people.increment("b", 2);

            stop();
            var old_distinct_id = mixpanel.test.get_distinct_id();
            mixpanel.test.identify(this.id, function() {}, function(resp, data) {
                ok(resp == 1, "Successful write");
                same(data, {
                    "$token": _this.token,
                    "$distinct_id": _this.id,
                    "$device_id": stripDevicePrefix(old_distinct_id),
                    "$user_id": _this.id,
                    "$add": {
                        "a": 1,
                        "b": 2
                    }
                });
                same(mixpanel.test.persistence.props['__mpa'], {}, "Queue is cleared after flushing");
                // reload persistence to make sure it's persisted correctly
                mixpanel.test.persistence.load();
                same(mixpanel.test.persistence.props['__mpa'], {}, "Empty queue is persisted");
                start();
            });
        });

        test("identify flushes append queue", 12, function() {
            var _this = this,
                run = 0,
                queue_name = '__mpap';
            mixpanel.test.people.append("a", 2);
            mixpanel.test.people.append({
                'b': 'asdf'
            });
            mixpanel.test.people.append("c", [1, 2, 3]);

            same(mixpanel.test.persistence.props[queue_name].length, 3, 'Queue has 3 elements before flushing');

            stop();
            stop();
            stop();
            mixpanel.test.identify(this.id, function() {}, function() {}, function(resp, data) {
                ok(resp == 1, "Successful write");
                ok(contains_obj(data, {
                    "$token": _this.token,
                    "$distinct_id": _this.id
                }));

                var $append = data['$append'];
                if (_.has($append, 'a')) {
                    same($append, {
                        'a': 2
                    });
                } else if (_.has($append, 'b')) {
                    same($append, {
                        'b': 'asdf'
                    });
                } else if (_.has($append, 'c')) {
                    same($append, {
                        'c': [1, 2, 3]
                    });
                }

                run++;
                if (run == 3) {
                    same(mixpanel.test.persistence.props[queue_name], [], "Queue is cleared after flushing");
                    // reload persistence to make sure it's persisted correctly
                    mixpanel.test.persistence.load();
                    same(mixpanel.test.persistence.props[queue_name], [], "Empty queue is persisted");
                };
                start();
            });
        });

        test("identify flushes union queue", 4, function() {
            var _union1 = {
                    'key1': ['val1.1'],
                    'key2': 'val1.2'
                },
                i;

            mixpanel.test.people.union(_union1);
            mixpanel.test.people.union("key2", ["val2.2"]);

            stop();
            var noop = function() {};
            mixpanel.test.identify(this.id, noop, noop, noop, noop, function(resp, data) {
                same(resp, 1, "Successful write");
                same(data["$union"], {
                    'key1': ['val1.1'],
                    'key2': ['val1.2', 'val2.2']
                });
                same(mixpanel.test.persistence.props['__mpu'], {}, 'Queue is cleared after flushing');

                mixpanel.test.persistence.load();
                same(mixpanel.test.persistence.props['__mpu'], {}, 'Empty queue is persisted');
                start();
            });
        });

        test("identify does not make a request if nothing is queued", 1, function() {
            var num_scripts = $('script').length;
            mixpanel.test.identify(this.id);
            stop();
            setTimeout(function() {
                same($('script').length, num_scripts, "No scripts added to page.");
                start();
            }, 500);
        });

        // this is in response to a bug where a user fires off two
        // identify()'s back to back, and the second one flushes the same data
        // to the server.  By making sure the queue's are cleared right away
        // (before waiting for the server response), we can avoid this
        // issue.
        test("identify clears out queues before server response", 8, function() {
            mixpanel.test.people.set("key", "val");
            mixpanel.test.people.increment("num");
            mixpanel.test.people.append("ary", 'val');
            mixpanel.test.people.union("stuff", 'val');

            mixpanel.test.identify(this.id);

            same(mixpanel.test.persistence.props['__mpap'], []);
            same(mixpanel.test.persistence.props['__mpu'], {});
            same(mixpanel.test.persistence.props['__mpa'], {});
            same(mixpanel.test.persistence.props['__mps'], {});
            // reload persistence to make sure it's persisted correctly
            mixpanel.test.persistence.load();
            same(mixpanel.test.persistence.props['__mpap'], []);
            same(mixpanel.test.persistence.props['__mpu'], {});
            same(mixpanel.test.persistence.props['__mpa'], {});
            same(mixpanel.test.persistence.props['__mps'], {});
        });

        mpmodule("mixpanel.people.delete_user");

        test("delete_user", 2, function() {
            d = mixpanel.test.people.delete_user();

            same(d, undefined, "Cannot delete user without valid distinct id");

            var old_distinct_id = mixpanel.test.get_distinct_id();
            mixpanel.test.identify(this.id);
            d = mixpanel.test.people.delete_user();
            same(d, {
                "$token": this.token,
                "$distinct_id": this.id,
                "$device_id": stripDevicePrefix(old_distinct_id),
                "$user_id": this.id,
                "$delete": this.id
            }, "Cannot delete user without valid distinct id");
        });

        mpmodule("mixpanel.set_group");

        test("should overwrite super property", 2, function(){
            mixpanel.test.register('company', ['facebook']);
            a = mixpanel.test.set_group('company', ['mixpanel','google']);
            same(a['$set']['company'], ['mixpanel', 'google' ]);
            same(mixpanel.test.get_property('company'), ['mixpanel', 'google']);
        });

        mpmodule("mixpanel.add_group");
        test("add_group (basic functionality)", 2, function(){
            a = mixpanel.test.add_group('company', 'mixpanel');
            same(a['$union']['company'], ['mixpanel']);
            same(mixpanel.test.get_property('company'), ['mixpanel']);
        });

        test("super property", 4, function(){
            mixpanel.test.add_group('company', 'mixpanel');
            same(mixpanel.test.get_property('company'), ['mixpanel']);
            mixpanel.test.add_group('company', 'mixpanel');
            same(mixpanel.test.get_property('company'), ['mixpanel']);
            mixpanel.test.add_group('company', 'google');
            same(mixpanel.test.get_property('company'), ['mixpanel', 'google']);
            mixpanel.test.add_group('company', 'facebook');
            same(mixpanel.test.get_property('company'), ['mixpanel', 'google', 'facebook']);
        });

        mpmodule("mixpanel.remove_group")
        test("remove_group (basic functionality)", 1, function (){
            a = mixpanel.test.remove_group('company', 'mixpanel');
            same(a['$remove']['company'], 'mixpanel');
        });
        test("super properties", 3, function (){
            mixpanel.test.remove_group('company', 'mixpanel');
            same(mixpanel.test.get_property('company'), undefined);
            mixpanel.test.add_group('company', 'google');
            mixpanel.test.remove_group('company', 'mixpanel');
            same(mixpanel.test.get_property('company'), ['google']);
            mixpanel.test.remove_group('company', 'google');
            same(mixpanel.test.get_property('company'), undefined);
        });

        mpmodule("mixpanel.track_with_groups")
        test("track_with_groups (basic functionality)", 1, function (){
            var prop = {"product_name":"macbook"};
            var group_prop = {"company": "mixpanel"};
            t = mixpanel.test.track_with_groups('purchase', prop, group_prop);
            var expected = _.extend({}, prop);
            expected = _.extend(expected, group_prop);
            ok(contains_obj(t['properties'],expected), "should be the union of prop and group_prop");
        });

        test("handle null properties", 1, function (){
            var prop = {"key": "value"};
            t = mixpanel.test.track_with_groups('purchase', null, prop);
            ok(contains_obj(t['properties'], prop))
        });

        test("handle null group properties", 1, function (){
            var prop = {"key": "value"};
            t = mixpanel.test.track_with_groups('purchase', prop, null);
            ok(contains_obj(t['properties'], prop))
        });

        test("overwrite properties", 1, function (){
            var prop = {"key":"value1"};
            var group_prop = {"key": "value2"};
            t = mixpanel.test.track_with_groups('event', prop, group_prop);
            same(t['properties']['key'],'value2' , "group_prop should overwrite prop");
        });
        mpmodule("mixpanel.get_group");
        test("cached", 2, function(){
            var group = mixpanel.test.get_group("may_have", "collision");
            group.foo = 'bar';
            var group2 = mixpanel.test.get_group("may", "have_collision");
            same(group2.foo, undefined);
            var group3 = mixpanel.test.get_group("may_have", "collision");
            same(group3.foo, 'bar');
        });

        mpmodule("mixpanel.group.set")
        test("basic", 4, function(){
            var gs = mixpanel.test.get_group("company","mixpanel").set("key", "value");
            var $set=gs['$set']
            same(gs['$distinct_id'], undefined); //shouldn't have $distinct_id
            same(gs['$group_key'], 'company');
            same(gs['$group_id'], 'mixpanel');
            same($set['key'], 'value');
        });

        mpmodule("mixpanel.group.set_once")
        test("basic", 4, function(){
            var gs = mixpanel.test.get_group("company","mixpanel").set_once("key", "value");
            var $set_once=gs['$set_once']
            same(gs['$distinct_id'], undefined); //shouldn't have $distinct_id
            same(gs['$group_key'], 'company');
            same(gs['$group_id'], 'mixpanel');
            same($set_once['key'], 'value');
        });

        mpmodule("mixpanel.group.union")
        test("basic", 4, function(){
            var gs = mixpanel.test.get_group("company","mixpanel").union("key", ["value"]);
            var $union=gs['$union']
            same(gs['$distinct_id'], undefined); //shouldn't have $distinct_id
            same(gs['$group_key'], 'company');
            same(gs['$group_id'], 'mixpanel');
            same($union['key'], ['value']);
        });

        mpmodule("mixpanel.group.unset")
        test("basic", 4, function(){
            var gs = mixpanel.test.get_group("company","mixpanel").unset("key");
            var $unset=gs['$unset']
            same(gs['$distinct_id'], undefined); //shouldn't have $distinct_id
            same(gs['$group_key'], 'company');
            same(gs['$group_id'], 'mixpanel');
            same($unset, ['key']);
        });

        mpmodule("mixpanel.group.remove")
        test("basic", 4, function(){
            var gs = mixpanel.test.get_group("company","mixpanel").remove("key", "value");
            var $remove = gs['$remove']
            same(gs['$distinct_id'], undefined); //shouldn't have $distinct_id
            same(gs['$group_key'], 'company');
            same(gs['$group_id'], 'mixpanel');
            same($remove['key'], 'value');
        });

        mpmodule("mixpanel.group.delete")
        test("basic", 4, function(){
            var gs = mixpanel.test.get_group("company","mixpanel").delete();
            var $delete = gs['$delete']
            same(gs['$distinct_id'], undefined); //shouldn't have $distinct_id
            same(gs['$group_key'], 'company');
            same(gs['$group_id'], 'mixpanel');
            same($delete, '');
        });

        mpmodule("verbose output");

        asyncTest("track endpoint returns json when verbose=1", 1, function() {
            mixpanel.test.set_config({
                verbose: true
            });

            mixpanel.test.track('test', {}, function(response) {
                same(response, {
                    status: 1,
                    error: null
                }, "server returned success1");
                start();
            });
        });

        asyncTest("engage endpoint returns json when verbose=1", 1, function() {
            mixpanel.test.set_config({
                verbose: true
            });

            mixpanel.test.identify('bilbo');
            mixpanel.test.people.set('test', 123, function(response) {
                same(response, {
                    status: 1,
                    error: null
                }, "server returned success");
                start();
            });
        });

        asyncTest("engage queue returns json when verbose=1", 1, function() {
            mixpanel.test.set_config({
                verbose: true
            });

            mixpanel.test.people.set('test', 123, function(response) {
                same(response, {
                    status: -1,
                    error: null
                }, "library returned queued");
                start();
            });
        });

        mpmodule("debug helpers");

        test("toString", 2, function() {
            same(mixpanel.test.toString(), "mixpanel.test");
            same(mixpanel.test.people.toString(), "mixpanel.test.people");
        });

        mpmodule('user agent parser');

        test('device', 8, function() {
            // facebook browsing
            var a = "Mozilla/5.0 (iPad; CPU OS 7_0_2 like Mac OS X) AppleWebKit/537.51.1 (KHTML, like Gecko) Mobile/11A501 [FBAN/FBIOS;FBAV/6.9.1;FBBV/1102303;FBDV/iPad2,7;FBMD/iPad;FBSN/iPhone OS;FBSV/7.0.2;FBSS/1; FBCR/Verizon;FBID/tablet;FBLC/en_US;FBOP/1]";
            same(mixpanel._.info.device(a), 'iPad');

            var a = "Mozilla/5.0 (iPhone; CPU iPhone OS 7_0 like Mac OS X) AppleWebKit/537.51.1 (KHTML, like Gecko) Mobile/11A465 [FBAN/FBIOS;FBAV/6.9.1;FBBV/1102303;FBDV/iPhone5,1;FBMD/iPhone;FBSN/iPhone OS;FBSV/7.0;FBSS/2; FBCR/AT&T;FBID/phone;FBLC/fr_FR;FBOP/5]"
            same(mixpanel._.info.device(a), 'iPhone');

            var a = "Mozilla/5.0 (iPad; U; CPU iPhone OS 5_1_1 like Mac OS X; en_US) AppleWebKit (KHTML, like Gecko) Mobile [FBAN/FBForIPhone;FBAV/4.1.1;FBBV/4110.0;FBDV/iPad2,1;FBMD/iPad;FBSN/iPhone OS;FBSV/5.1.1;FBSS/1; FBCR/;FBID/tablet;FBLC/en_US;FBSF/1.0]";
            same(mixpanel._.info.device(a), 'iPad');

            // iPhone
            var a = "Mozilla/5.0 (iPhone; CPU iPhone OS 7_0 like Mac OS X) AppleWebKit/537.51.1 (KHTML, like Gecko) Version/7.0 Mobile/11A465 Safari/9537.53";
            same(mixpanel._.info.device(a), 'iPhone');

            // iPod Touch
            var a = "Mozila/5.0 (iPod; U; CPU like Mac OS X; en) AppleWebKit/420.1 (KHTML, like Geckto) Version/3.0 Mobile/3A101a Safari/419.3";
            same(mixpanel._.info.device(a), 'iPod Touch');

            // Android
            var a = "Mozilla/5.0 (Linux; U; Android 2.1; en-us; Nexus One Build/ERD62) AppleWebKit/530.17 (KHTML, like Gecko) Version/4.0 Mobile Safari/530.17";
            same(mixpanel._.info.device(a), 'Android');

            // Blackberry
            var a = "Mozilla/5.0 (BlackBerry; U; BlackBerry 9800; en-US) AppleWebKit/534.8+ (KHTML, like Gecko) Version/6.0.0.448 Mobile Safari/534.8+";
            same(mixpanel._.info.device(a), 'BlackBerry');

            // Windows Phone
            var a = "Mozilla/4.0 (compatible; MSIE 7.0; Windows Phone OS 7.0; Trident/3.1; IEMobile/7.0; Nokia;N70)"
            same(mixpanel._.info.device(a), 'Windows Phone');
        });

        test('browser', 38, function() {
            // facebook mobile
            var a = "Mozilla/5.0 (iPad; CPU OS 7_0_2 like Mac OS X) AppleWebKit/537.51.1 (KHTML, like Gecko) Mobile/11A501 [FBAN/FBIOS;FBAV/6.9.1;FBBV/1102303;FBDV/iPad2,7;FBMD/iPad;FBSN/iPhone OS;FBSV/7.0.2;FBSS/1; FBCR/Verizon;FBID/tablet;FBLC/en_US;FBOP/1]";
            same(mixpanel._.info.browser(a), 'Facebook Mobile');
            notOk(mixpanel._.isBlockedUA(a));

            // chrome
            var a = "Mozilla/5.0 (Windows NT 6.2; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/32.0.1667.0 Safari/537.36";
            same(mixpanel._.info.browser(a), 'Chrome');
            notOk(mixpanel._.isBlockedUA(a));

            var a = "Mozilla/5.0 (Windows NT 6.2; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/29.0.1547.2 Safari/537.36";
            same(mixpanel._.info.browser(a), 'Chrome');
            notOk(mixpanel._.isBlockedUA(a));

            var a = "Mozilla/5.0 (X11; U; CrOS i686 0.9.128; en-US) AppleWebKit/534.10 (KHTML, like Gecko) Chrome/8.0.552.339";
            same(mixpanel._.info.browser(a), 'Chrome');
            notOk(mixpanel._.isBlockedUA(a));

            var a = "Mozilla/5.0 (iPhone; U; CPU iPhone OS 5_1_1 like Mac OS X; en-gb) AppleWebKit/534.46.0 (KHTML, like Gecko) CriOS/19.0.1084.60 Mobile/9B206 Safari/7534.48.3";
            same(mixpanel._.info.browser(a), 'Chrome iOS');
            notOk(mixpanel._.isBlockedUA(a));

            // ie
            var a = "Mozilla/5.0 (Windows NT 6.3; Trident/7.0; rv:11.0) like Gecko";
            same(mixpanel._.info.browser(a), 'Internet Explorer');
            notOk(mixpanel._.isBlockedUA(a));

            var a = "Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.1; Trident/6.0)";
            same(mixpanel._.info.browser(a), 'Internet Explorer');
            notOk(mixpanel._.isBlockedUA(a));

            var a = "Mozilla/5.0 (compatible; MSIE 8.0; Windows NT 5.2; Trident/4.0; Media Center PC 4.0; SLCC1; .NET CLR 3.0.04320)";
            same(mixpanel._.info.browser(a), 'Internet Explorer');
            notOk(mixpanel._.isBlockedUA(a));

            // edge
            var a = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.74 Safari/537.36 Edg/79.0.309.43";
            same(mixpanel._.info.browser(a), 'Microsoft Edge');
            notOk(mixpanel._.isBlockedUA(a));

            var a = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML like Gecko) Chrome/51.0.2704.79 Safari/537.36 Edge/14.14931";
            same(mixpanel._.info.browser(a), 'Microsoft Edge');
            notOk(mixpanel._.isBlockedUA(a));

            // firefox
            var a = "Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:25.0) Gecko/20100101 Firefox/25.0";
            same(mixpanel._.info.browser(a), 'Firefox');
            notOk(mixpanel._.isBlockedUA(a));

            var a = "Mozilla/5.0 (Windows NT 6.2; rv:22.0) Gecko/20130405 Firefox/23.0";
            same(mixpanel._.info.browser(a), 'Firefox');
            notOk(mixpanel._.isBlockedUA(a));

            var a = "Mozilla/5.0 (Windows NT 6.2; Win64; x64; rv:16.0.1) Gecko/20121011 Firefox/21.0.1";
            same(mixpanel._.info.browser(a), 'Firefox');
            notOk(mixpanel._.isBlockedUA(a));

            // Konqueror
            var a = "Mozilla/5.0 (X11; Linux) KHTML/4.9.1 (like Gecko) Konqueror/4.9";
            same(mixpanel._.info.browser(a), 'Konqueror');
            notOk(mixpanel._.isBlockedUA(a));

            var a = "Mozilla/5.0 (compatible; Konqueror/4.2; Linux; X11; x86_64) KHTML/4.2.4 (like Gecko) Fedora/4.2.4-2.fc11";
            same(mixpanel._.info.browser(a), 'Konqueror');
            notOk(mixpanel._.isBlockedUA(a));

            // opera
            same(mixpanel._.info.browser(a, null, true), 'Opera');

            var a = "Opera/9.80 (J2ME/MIDP; Opera Mini/9.80 (J2ME/23.377; U; en) Presto/2.5.25 Version/10.54";
            same(mixpanel._.info.browser(a, null, true), 'Opera Mini');
            notOk(mixpanel._.isBlockedUA(a));

            // safari
            same(mixpanel._.info.browser(a, "Apple"), "Safari");

            var a = "Mozilla/5.0 (iPad; CPU OS 6_0 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/6.0 Mobile/10A5355d Safari/8536.25";
            same(mixpanel._.info.browser(a, "Apple"), 'Mobile Safari');
            notOk(mixpanel._.isBlockedUA(a));

            // samsung browser
            var a = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/5.2 Chrome/51.0.2704.106 Safari/537.36";
            same(mixpanel._.info.browser(a), 'Samsung Internet');
            notOk(mixpanel._.isBlockedUA(a));
        });

        test('browserVersion', 3, function() {
            // edge
            var a = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.74 Safari/537.36 Edg/79.0.309.43";
            same(mixpanel._.info.browserVersion(a), 79.0);

            var a = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML like Gecko) Chrome/51.0.2704.79 Safari/537.36 Edge/14.14931";
            same(mixpanel._.info.browserVersion(a), 14.14931);

            // samsung browser
            var a = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/5.2 Chrome/51.0.2704.106 Safari/537.36";
            same(mixpanel._.info.browserVersion(a), 5.2);
        });

        mpmodule('mixpanel.reset');

        test('reset generates new distinct_id', 2, function() {
            var id = '1234';

            mixpanel.test.identify(id);
            mixpanel.test.reset();

            notEqual(id, mixpanel.test.get_distinct_id());
            var distinct_id = mixpanel.test.get_distinct_id();
            var device_id = mixpanel.test.get_property('$device_id');
            same(distinct_id, '$device:' + device_id);
        });

        test('reset clears super properties', 1, function() {
            var properties = { foo: 1 };

            mixpanel.test.register(properties);
            mixpanel.test.reset();

            var propertiesAfterReset = mixpanel.test.persistence.properties();
            notEqual(properties.foo, propertiesAfterReset.foo);
        });

        test("people updates are queued again after reset", 4, function() {
            mixpanel.test.identify('foo');

            // hits server immediately when identified
            stop();
            s = mixpanel.test.people.set({ y: 6 }, function(resp) {
                same(resp, 1, "responded with 'success'");
                start();
            });
            ok(contains_obj(s['$set'], { 'y': 6 }));

            mixpanel.test.reset();

            // queues after reset
            stop();
            s = mixpanel.test.people.set({ x: 5 }, function(resp) {
                same(resp, -1, "responded with 'queued'");
                start();
            });
            ok(contains_obj(mixpanel.test.persistence.props['__mps'], { x: 5 }), "queued set saved");
        });

        test("identify after reset flushes queues", 5, function() {
            mixpanel.test.identify('foo');
            mixpanel.test.reset();

            mixpanel.test.people.set({ "b": "c" });
            ok(contains_obj(mixpanel.test.persistence.props['__mps'], { "b": "c" }), "queued set saved");

            stop();
            mixpanel.test.identify("bar", function(resp, data) {
                ok(resp == 1, "Successful write");
                ok(contains_obj(data["$set"], { "b": "c" }));
                same(mixpanel.test.persistence.props['__mps'], {}, "Queue is cleared after flushing");
                // reload persistence to make sure it's persisted correctly
                mixpanel.test.persistence.load();
                same(mixpanel.test.persistence.props['__mps'], {}, "Empty queue is persisted");
                start();
            });
        });

        mpmodule("promise polyfill")

        asyncTest("can execute a chain of promises", 3, function () {
            var NPO = mixpanel._.NPO;
            var promise1 = new NPO(function (resolve, reject) {
                resolve('1st return value');
            });

            promise1
                .then(function (value) {
                    same(value, '1st return value');
                    return NPO.resolve('2nd return value'); // return promise
                })
                .then(function (value) {
                    same(value, '2nd return value');
                    return '3rd return value'; // return value
                })
                .then(function (value) {
                    same(value, '3rd return value');
                    start();
                });
        });


        if (/Android|iPhone|iPad|iPod|BlackBerry|Windows Phone/i.test(navigator.userAgent)) {
            mpmodule("mobile tests");
            test("device property included", 1, function() {
                stop();
                mixpanel.test.track("test_device", {}, function(r, data) {
                    ok('$device' in data.properties, "properties should include $device");
                    start();
                });
            });
        }

        if (navigator.sendBeacon) {
            mpmodule("sendBeacon tests");

            test("sendBeacon option supported in .track()", 1, function() {
                var data = mixpanel.test.track("test_sendbeacon", {}, {transport: 'sendBeacon'});
                same(data['event'], 'test_sendbeacon');
            });

            test("sendBeacon supported in library config", 1, function() {
                mixpanel.test.set_config({api_transport: 'sendBeacon'});
                var data = mixpanel.test.track("test_sendbeacon", {});
                same(data['event'], 'test_sendbeacon');
            });

            asyncTest("sendBeacon calls track callback", 1, function() {
                mixpanel.test.set_config({api_transport: 'sendBeacon'});
                mixpanel.test.track("test_sendbeacon", {}, function(response) {
                    same(response, 1, "sendBeacon returned success");
                    start();
                });
            });

            test("sendBeacon tracking handles callback errors", 2, function() {
                mixpanel.test.set_config({api_transport: 'sendBeacon'});
                var data = mixpanel.test.track("test_sendbeacon", {}, function(response) {
                    same(response, 1, "sendBeacon returned success");
                    throw new Error('kaboom');
                });
                same(data['event'], 'test_sendbeacon');
            });
        }

        if (USE_XHR) {
            mpmodule("xhr tests", startRecordingXhrRequests, stopRecordingXhrRequests);

            asyncTest('xhr headers should work', 5, function() {
                mixpanel.test.set_config({
                    xhr_headers: {
                        'x-api-token': 'test-token',
                        'x-api-key': 'test-key'
                    }
                });

                // A meaningless request
                mixpanel.test.track('test', {}, function(response) {
                    same(response, 1, "xhr returned success");
                    start();
                });

                same(this.requests.length, 1, 'track should have fired off a request');
                same(_.keys(this.requests[0].requestHeaders).length, 3, 'both custom headers should be present');
                same(this.requests[0].requestHeaders['x-api-token'], 'test-token', 'x-api-token should be set');
                same(this.requests[0].requestHeaders['x-api-key'], 'test-key', 'x-api-key should be set');

                var resp = '1';
                this.requests[0].respond(200, {
                    'Content-Type': 'text'
                }, resp);
            });

            asyncTest('xhr error handling code works', 2, function() {
                mixpanel.test.track('test', {}, function(response) {
                    same(response, 0, "xhr returned error");
                    start();
                });

                same(this.requests.length, 1, "track should have fired off a request");

                var resp = 'HTTP/1.1 500 Internal Server Error';
                this.requests[0].respond(500, {
                    'Content-Length': resp.length,
                    'Content-Type': 'text'
                }, resp);
            });

            asyncTest('xhr error handling code supports verbose', 3, function() {
                mixpanel.test.set_config({
                    verbose: true
                });

                mixpanel.test.track('test', {}, function(response) {
                    same(response.status, 0, "xhr returned verbose error status");
                    same(response.error, "Bad HTTP status: 500 Internal Server Error", "xhr returned verbose error");
                    start();
                });

                same(this.requests.length, 1, "track should have fired off a request");

                var resp = 'HTTP/1.1 500 Internal Server Error';
                this.requests[0].respond(500, {
                    'Content-Length': resp.length
                }, resp);
            });

            test("tracking defaults to POST", 5, function() {
                mixpanel.test.track('test', {foo: 'bar'});

                same(this.requests.length, 1, "track should have fired off a request");

                var req = this.requests[0];
                same(req.method, 'POST');
                ok(
                    req.requestHeaders['Content-Type'].indexOf('application/x-www-form-urlencoded') >= 0,
                    'POST request should have set Content-Type header correctly'
                );
                same(
                    req.requestBody.indexOf('data='), 0,
                    'POST request should have transmitted data in request body'
                );
                same(
                    req.url.indexOf('data='), -1,
                    'POST request should not have transmitted data on URL'
                );
            });

            test("tracking should escape the body data of POST request", 5, function() {
                // this body tends to generate the characters + and = when using encode_data_for_request
                mixpanel.test.track('test', {title: 'Opatření na zadržení vody v krajině'});

                same(this.requests.length, 1, "track should have fired off a request");

                var req = this.requests[0];
                same(req.method, 'POST');
                var bodyData = req.requestBody.replace('data=', '');
                var badCharacters = ['+', '/', '='];
                for (var i = 0; i < badCharacters.length; i += 1) {
                    var badCharacter = badCharacters[i];
                    same(
                        bodyData.indexOf(badCharacter), -1,
                        'POST request body has invalid character ' + badCharacter
                    );
                }
            });

            test("tracking can be configured to GET", 4, function() {
                mixpanel.test.set_config({api_method: 'GET'});

                mixpanel.test.track('test', {foo: 'bar'});

                same(this.requests.length, 1, "track should have fired off a request");

                var req = this.requests[0];
                same(req.method, 'GET');
                ok(
                    req.url.indexOf('data=') >= 0,
                    'GET request should have transmitted data on URL'
                );
                same(
                    req.requestBody, null,
                    'GET request should not have transmitted data in request body'
                );
            });

            if (navigator.sendBeacon) {
                test("specifying GET overrides sendBeacon transport", 3, function() {
                    mixpanel.test.set_config({api_method: 'GET', api_transport: 'sendBeacon'});

                    mixpanel.test.track('test', {foo: 'bar'});

                    same(this.requests.length, 1, "track should have fired off a request");

                    var req = this.requests[0];
                    same(req.method, 'GET');
                    ok(
                        req.url.indexOf('data=') >= 0,
                        'GET request should have transmitted data on URL'
                    );
                });
            }

            test("tracking can be configured to use base64 encoding", 3, function() {
                mixpanel.test.set_config({api_payload_format: 'base64'});
                mixpanel.test.track('test', {foo: 'bar'});
                same(this.requests.length, 1, "track should have fired off a request");
                var data = JSON.parse(atob(decodeURIComponent(this.requests[0].requestBody.match(/data=([^&]+)/)[1])));
                same(data.event, 'test');
                same(data.properties.foo, 'bar');
            });

            test("track_pageview() fires default page view event", 5, function() {
                mixpanel.test.track_pageview();

                same(this.requests.length, 1, "track_pageview should have fired off a request");

                var data = JSON.parse(decodeURIComponent(this.requests[0].requestBody.match(/data=([^&]+)/)[1]));
                same(data.event, '$mp_web_page_view');
                isDefined(data.properties, 'current_domain', "default $mp_web_page_view event has current_domain property");
                isDefined(data.properties, 'current_url_path', "default $mp_web_page_view event has current_url_path property");
                isDefined(data.properties, 'current_url_protocol', "default $mp_web_page_view event has current_url_protocol property");
            });

            test("track_pageview(props) fires default page view event with properties", 3, function() {
                mixpanel.test.track_pageview({foo: 'bar'});

                same(this.requests.length, 1, "track_pageview should have fired off a request");

                var data = JSON.parse(decodeURIComponent(this.requests[0].requestBody.match(/data=([^&]+)/)[1]));
                same(data.event, '$mp_web_page_view');
                same(data.properties.foo, 'bar');
            });

            test("track_pageview(props, {event_name}) fires default page view event with event properties", 3, function() {
                mixpanel.test.track_pageview({foo: 'bar'}, {event_name: '[internal] admin page view'});

                same(this.requests.length, 1, "track_pageview should have fired off a request");

                var data = JSON.parse(decodeURIComponent(this.requests[0].requestBody.match(/data=([^&]+)/)[1]));
                same(data.event, '[internal] admin page view');
                same(data.properties.foo, 'bar');
            });

            test("track_pageview() ignores legacy string param", 5, function() {
                mixpanel.test.track_pageview('foobar');

                same(this.requests.length, 1, "track_pageview should have fired off a request");

                var data = JSON.parse(decodeURIComponent(this.requests[0].requestBody.match(/data=([^&]+)/)[1]));
                same(data.event, '$mp_web_page_view');
                isDefined(data.properties, 'current_domain', "default $mp_web_page_view event has current_domain property");
                isDefined(data.properties, 'current_url_path', "default $mp_web_page_view event has current_url_path property");
                isDefined(data.properties, 'current_url_protocol', "default $mp_web_page_view event has current_url_protocol property");
            });

            test("init with track_pageview=true fires page view event", 2, function() {
                var next_url = window.location.protocol + "//" + window.location.host + window.location.pathname;
                window.history.pushState({ path: next_url }, '', next_url);

                mixpanel.init("track_pageview_test_token", {
                    track_pageview: true,
                    batch_requests: false,
                }, 'pageviews');
                same(this.requests.length, 1, "init with track_pageview=true should fire request on load");
                var last_event = getRequestData(this.requests[0]);
                same(last_event.event, "$mp_web_page_view", "last request should be $mp_web_page_view event");
            });

            test("init with track_pageview='url-with-path' tracks page views correctly", 5, function() {
                var next_url = window.location.protocol + "//" + window.location.host + window.location.pathname;
                window.history.pushState({ path: next_url }, '', next_url);

                mixpanel.init("track_pageview_test_token", {
                    track_pageview: "url-with-path",
                    batch_requests: false,
                }, 'pageviews_pathonly');
                same(this.requests.length, 1, "init with track_pageview='url-with-path' should fire single request on load");
                var last_event = getRequestData(this.requests[0]);
                same(last_event.event, "$mp_web_page_view", "last request should be $mp_web_page_view event");

                window.dispatchEvent(new Event("mp_locationchange"));
                same(this.requests.length, 1, "mp_locationchange event should not fire page view event on no URL change");

                window.location.href = window.location.href.split('#') + '#anchor'
                same(this.requests.length, 1, "init with track_pageview='url-with-path' should not fire additional request on hash change");

                var next_url = window.location.protocol + "//" + window.location.host + window.location.pathname + '?hello=world';
                window.history.pushState({ path: next_url }, '', next_url);
                same(this.requests.length, 1, "init with track_pageview='url-with-path' should not fire request on query string change");
            });

            test("init with track_pageview='url-with-path-and-query-string' tracks page views correctly", 6, function() {
                var next_url = window.location.protocol + "//" + window.location.host + window.location.pathname;
                window.history.pushState({ path: next_url }, '', next_url);

                mixpanel.init("track_pageview_test_token", {
                    track_pageview: "url-with-path-and-query-string",
                    batch_requests: false,
                }, 'pageviews_pathandquery');
                same(this.requests.length, 1, "init with track_pageview='url-with-path-and-query-string' should fire single request on load");
                var last_event = getRequestData(this.requests[0]);
                same(last_event.event, "$mp_web_page_view", "last request should be $mp_web_page_view event");

                window.dispatchEvent(new Event("mp_locationchange"));
                same(this.requests.length, 1, "mp_locationchange event should not fire page view event on no URL change");

                var next_url = window.location.protocol + "//" + window.location.host + window.location.pathname + '?next=query';
                window.history.pushState({ path: next_url }, '', next_url);
                same(this.requests.length, 2, "init with track_pageview='url-with-path-and-query-string' should fire request on query string change");
                var last_event = getRequestData(this.requests[1]);
                same(last_event.event, "$mp_web_page_view", "last request should be $mp_web_page_view event");

                window.location.href = window.location.href.split('#')[0] + '#anotheranchor'
                same(this.requests.length, 2, "init with track_pageview='url-with-path-and-query-string' should not fire additional request on hash change");

                // TODO do this in clearLibInstance for each test
                mixpanel.pageviews_pathandquery.disable();
            });
        }

        if (USE_XHR) {
            var origHref;
            mpmodule("autocapture tests", function() {
                origHref = window.location.href;
                startRecordingXhrRequests.call(this);
            }, function() {
                stopRecordingXhrRequests.call(this);
                window.history.replaceState(null, null, origHref);
            });

            test("autocapture tracks pageviews with explicit config", 2, function() {
                var next_url = window.location.protocol + "//" + window.location.host + window.location.pathname;
                window.history.pushState({ path: next_url }, '', next_url);

                mixpanel.init("autocapture_test_token", {
                    autocapture: {
                        pageview: true
                    },
                    batch_requests: false
                }, 'acpageviews');
                same(this.requests.length, 1, "autocapture init with pageview=true should fire request on load");
                var last_event = getRequestData(this.requests[0]);
                same(last_event.event, "$mp_web_page_view", "last request should be $mp_web_page_view event");
            });

            test("autocapture tracks pageviews with default config", 2, function() {
                var next_url = window.location.protocol + "//" + window.location.host + window.location.pathname;
                window.history.pushState({ path: next_url }, '', next_url);

                mixpanel.init("autocapture_test_token", {
                    autocapture: true,
                    batch_requests: false
                }, 'acpageviews');
                same(this.requests.length, 1, "autocapture init with autocapture=true should fire request on load");
                var last_event = getRequestData(this.requests[0]);
                same(last_event.event, "$mp_web_page_view", "last request should be $mp_web_page_view event");
            });

            test("autocapture pageview config takes precedence over legacy track_pageview config", 1, function() {
                var next_url = window.location.protocol + "//" + window.location.host + window.location.pathname;
                window.history.pushState({ path: next_url }, '', next_url);

                mixpanel.init("autocapture_test_token", {
                    autocapture: {
                        pageview: false
                    },
                    track_pageview: true,
                    batch_requests: false
                }, 'acpageviews');
                same(this.requests.length, 0, "autocapture init with pageview=false should not fire request on load");
            });

            test("autocapture tracks click events", 4, function() {
                mixpanel.init("autocapture_test_token", {
                    autocapture: {
                        pageview: false,
                        click: true
                    },
                    batch_requests: false
                }, 'acclicks');
                same(this.requests.length, 0, "should not fire any requests on init");

                var e1 = ele_with_class();
                var originalHandlerCalled = false;
                e1.e.onclick = function() {
                    originalHandlerCalled = true;
                    return false;
                }

                simulateMouseClick(e1.e);
                same(this.requests.length, 1, "click event should fire request");
                var last_event = getRequestData(this.requests[0]);
                same(last_event.event, "$mp_click", "last request should be $mp_click event");
                ok(originalHandlerCalled, "original click handler should also have been called");
            });

            test("autocapture click events include relevant properties", 7, function() {
                mixpanel.init("autocapture_test_token", {
                    autocapture: {
                        pageview: false,
                        click: true
                    },
                    batch_requests: false
                }, 'acclicks');

                var anchor = ele_with_class();
                anchor.e.onclick = function() { return false; }

                simulateMouseClick(anchor.e);
                same(this.requests.length, 1, "click event should fire request");
                var last_event = getRequestData(this.requests[0]);
                same(last_event.event, "$mp_click", "last request should be $mp_click event");
                var props = last_event.properties;
                same(props.$el_tag_name, "a", "click event should include tag name");
                same(props.$el_classes, [anchor.name], "click event should include classes");
                ok(props.$viewportHeight > 0, "click event should include viewport height");
                ok(props.$viewportWidth > 0, "click event should include viewport width");
                notOk('$el_id' in props, "click event should not include id when not present");
            });

            test("autocapture click events do not capture text by default", 2, function() {
                mixpanel.init("autocapture_test_token", {
                    autocapture: {
                        pageview: false,
                        click: true
                    },
                    batch_requests: false
                }, 'acclicks');

                var anchor = ele_with_class("some link text");
                anchor.e.onclick = function() { return false; }

                simulateMouseClick(anchor.e);
                same(this.requests.length, 1, "click event should fire request");
                var last_event = getRequestData(this.requests[0]);
                var props = last_event.properties;
                notOk('$el_text' in props, "click event should not include text content");
            });

            test("autocapture click events capture text when configured to", 2, function() {
                mixpanel.init("autocapture_test_token", {
                    autocapture: {
                        pageview: false,
                        click: true,
                        capture_text_content: true
                    },
                    batch_requests: false
                }, 'acclicks');

                var anchor = ele_with_class("some link text");
                anchor.e.onclick = function() { return false; }

                simulateMouseClick(anchor.e);
                same(this.requests.length, 1, "click event should fire request");
                var last_event = getRequestData(this.requests[0]);
                var props = last_event.properties;
                same(props.$el_text, "some link text", "click event should include text content");
            });

            test("autocapture does not track elements with default opt-out classes", 3, function() {
                mixpanel.init("autocapture_test_token", {
                    autocapture: {
                        pageview: false,
                        click: true
                    },
                    batch_requests: false
                }, 'acclicks');

                var anchor = ele_with_class();
                anchor.e.onclick = function() { return false; }
                anchor.e.className = "mp-no-track";

                simulateMouseClick(anchor.e);
                same(this.requests.length, 0, "click event should not have fired request");

                var anchor2 = ele_with_class();
                anchor2.e.onclick = function() { return false; }

                simulateMouseClick(anchor2.e);
                same(this.requests.length, 1, "click event on trackable element should have fired request");
                same(getRequestData(this.requests[0]).event, "$mp_click", "last request should be $mp_click event");
            });

            test("autocapture does not track elements with configured opt-out classes", 3, function() {
                mixpanel.init("autocapture_test_token", {
                    autocapture: {
                        pageview: false,
                        click: true,
                        block_selectors: ["a.custom-non-tracking"]
                    },
                    batch_requests: false
                }, 'acclicks');

                var anchor = ele_with_class();
                anchor.e.onclick = function() { return false; }
                anchor.e.className = "custom-non-tracking";

                simulateMouseClick(anchor.e);
                same(this.requests.length, 0, "click event should not have fired request");

                var anchor2 = ele_with_class();
                anchor2.e.onclick = function() { return false; }

                simulateMouseClick(anchor2.e);
                same(this.requests.length, 1, "click event on trackable element should have fired request");
                same(getRequestData(this.requests[0]).event, "$mp_click", "last request should be $mp_click event");
            });

            test("autocapture supports default opt-out classes and configured opt-out classes together", 2, function() {
                mixpanel.init("autocapture_test_token", {
                    autocapture: {
                        pageview: false,
                        click: true,
                        block_selectors: ["a.custom-non-tracking"]
                    },
                    batch_requests: false
                }, 'acclicks');

                var anchor = ele_with_class();
                anchor.e.onclick = function() { return false; }
                anchor.e.className = "custom-non-tracking";

                simulateMouseClick(anchor.e);
                same(this.requests.length, 0, "click event should not have fired request");

                var anchor2 = ele_with_class();
                anchor2.e.onclick = function() { return false; }
                anchor2.e.className = "mp-no-track";

                simulateMouseClick(anchor2.e);
                same(this.requests.length, 0, "click event should not have fired request");
            });

            test("autocapture supports allowlist of tracked element selectors", 4, function() {
                mixpanel.init("autocapture_test_token", {
                    autocapture: {
                        pageview: false,
                        click: true,
                        allow_selectors: [".track-only-me"]
                    },
                    batch_requests: false
                }, 'acclicks');

                var anchor = ele_with_class();
                anchor.e.onclick = function() { return false; }

                simulateMouseClick(anchor.e);
                same(this.requests.length, 0, "click event should not have fired request");

                // give it a class on the allowlist
                anchor.e.className = "foo track-only-me";
                simulateMouseClick(anchor.e);
                same(this.requests.length, 1, "click event on trackable element should have fired request");
                same(getRequestData(this.requests[0]).event, "$mp_click", "last request should be $mp_click event");

                // element with no classes
                var anchor2 = ele_with_class();
                anchor2.e.onclick = function() { return false; }
                simulateMouseClick(anchor2.e);
                same(this.requests.length, 1, "click event should not have fired request");
            });

            test("autocapture does not track elements blocked by block_element_callback", 3, function() {
                mixpanel.init("autocapture_test_token", {
                    autocapture: {
                        pageview: false,
                        click: true,
                        block_element_callback: function(el, ev) {
                            var href = el.getAttribute('href');
                            // block just click tracking on /user/ links
                            return ev.type === "click" && !!href && href.startsWith('/user/');
                        }
                    },
                    batch_requests: false
                }, 'acclicks');

                var anchor = ele_with_class();
                anchor.e.onclick = function() { return false; }

                anchor.e.setAttribute("href", "/user/123");
                simulateMouseClick(anchor.e);
                same(this.requests.length, 0, "click event should not have fired request");

                anchor.e.setAttribute("href", "/foobar");
                simulateMouseClick(anchor.e);
                same(this.requests.length, 1, "click event on trackable element should have fired request");
                same(getRequestData(this.requests[0]).event, "$mp_click", "last request should be $mp_click event");
            });

            test("autocapture does not track elements when block_element_callback throws an error", 1, function() {
                mixpanel.init("autocapture_test_token", {
                    autocapture: {
                        pageview: false,
                        click: true,
                        block_element_callback: function() {
                            kaboom();
                        }
                    },
                    batch_requests: false
                }, 'acclicks');

                var anchor = ele_with_class();
                anchor.e.onclick = function() { return false; }

                simulateMouseClick(anchor.e);
                same(this.requests.length, 0, "click event should not have fired request");
            });

            test("autocapture does not track elements that don't pass allow_element_callback when provided", 3, function() {
                mixpanel.init("autocapture_test_token", {
                    autocapture: {
                        pageview: false,
                        click: true,
                        allow_element_callback: function(el) {
                            var href = el.getAttribute('href');
                            // only track elements with /foobar/ links
                            return !!href && href.startsWith('/foobar');
                        }
                    },
                    batch_requests: false
                }, 'acclicks');

                var anchor = ele_with_class();
                anchor.e.onclick = function() { return false; }

                anchor.e.setAttribute("href", "/user/123");
                simulateMouseClick(anchor.e);
                same(this.requests.length, 0, "click event should not have fired request");

                anchor.e.setAttribute("href", "/foobar");
                simulateMouseClick(anchor.e);
                same(this.requests.length, 1, "click event on trackable element should have fired request");
                same(getRequestData(this.requests[0]).event, "$mp_click", "last request should be $mp_click event");
            });

            test("autocapture requires all allow-checks to pass when provided", 4, function() {
                mixpanel.init("autocapture_test_token", {
                    autocapture: {
                        pageview: false,
                        click: true,
                        allow_element_callback: function(el) {
                            var href = el.getAttribute('href');
                            // only track elements with /foobar/ links
                            return !!href && href.startsWith('/foobar');
                        },
                        allow_selectors: [".track-only-me"]
                    },
                    batch_requests: false
                }, 'acclicks');

                var anchor = ele_with_class();
                anchor.e.onclick = function() { return false; }

                anchor.e.setAttribute("href", "/user/123");
                simulateMouseClick(anchor.e);
                same(this.requests.length, 0, "click event should not have fired request");

                // make it pass the allow_element_callback, but not the allow_selectors list
                anchor.e.setAttribute("href", "/foobar");
                simulateMouseClick(anchor.e);
                same(this.requests.length, 0, "click event should not have fired request");

                // make it should pass all checks
                anchor.e.className = "foo track-only-me";
                simulateMouseClick(anchor.e);
                same(this.requests.length, 1, "click event on trackable element should have fired request");
                same(getRequestData(this.requests[0]).event, "$mp_click", "last request should be $mp_click event");
            });

            test("autocapture gives precedence to block-checks over allow-checks when both are provided", 7, function() {
                mixpanel.init("autocapture_test_token", {
                    autocapture: {
                        pageview: false,
                        click: true,
                        allow_element_callback: function(el) {
                            var href = el.getAttribute('href');
                            // only track elements with /foobar/ links
                            return !!href && href.startsWith('/foobar');
                        },
                        block_element_callback: function(el) {
                            // block elements with more than 2 classes
                            return el.classList.length > 2;
                        },
                        allow_selectors: [".track-only-me"],
                        block_selectors: [".foo"]
                    },
                    batch_requests: false
                }, 'acclicks');

                var anchor = ele_with_class();
                anchor.e.onclick = function() { return false; }

                // shouldn't pass allow_element_callback
                anchor.e.setAttribute("href", "/user/123");
                simulateMouseClick(anchor.e);
                same(this.requests.length, 0, "click event should not have fired request");

                // make it pass the allow checks
                anchor.e.setAttribute("href", "/foobar");
                anchor.e.className = "track-only-me";
                simulateMouseClick(anchor.e);
                same(this.requests.length, 1, "click event on trackable element should have fired request");
                same(getRequestData(this.requests[0]).event, "$mp_click", "last request should be $mp_click event");

                // keep it passing allow checks, but not block_selectors
                anchor.e.className = "foo track-only-me";
                simulateMouseClick(anchor.e);
                same(this.requests.length, 1, "click event should not have fired request");

                // now make it pass block_selectors but not block_element_callback
                anchor.e.className = "class1 class2 class3 track-only-me";
                simulateMouseClick(anchor.e);
                same(this.requests.length, 1, "click event should not have fired request");

                // now make it pass everything again
                anchor.e.className = "class1 track-only-me";
                simulateMouseClick(anchor.e);
                same(this.requests.length, 2, "click event on trackable element should have fired request");
                same(getRequestData(this.requests[1]).event, "$mp_click", "last request should be $mp_click event");
            });

            test("autocapture does not capture attrs blocked by config", 5, function() {
                mixpanel.init("autocapture_test_token", {
                    autocapture: {
                        pageview: false,
                        click: true,
                        block_attrs: ['href', 'aria-label']
                    },
                    batch_requests: false
                }, 'acclicks');

                var anchor = ele_with_class("some link text");
                anchor.e.onclick = function() { return false; }
                anchor.e.setAttribute('href', '#foo');
                anchor.e.setAttribute('aria-label', 'bar');
                anchor.e.setAttribute('title', 'baz');

                simulateMouseClick(anchor.e);
                same(this.requests.length, 1, "click event should fire request");
                var last_event = getRequestData(this.requests[0]);
                var props = last_event.properties;
                notOk("$el_attr__href" in props, "click event should not include href attribute");
                notOk("$attr-href" in props.$target, "click event target prop should not include href attribute");
                notOk("$attr-aria-label" in props.$target, "click event target prop should not include aria-label attribute");
                ok("$attr-title" in props.$target, "click event target prop should include title attribute");
            });

            test("autocapture captures attrs specified by capture_extra_attrs config", 5, function() {
                mixpanel.init("autocapture_test_token", {
                    autocapture: {
                        pageview: false,
                        click: true,
                        block_attrs: ['href'],
                        capture_extra_attrs: ['data-foo-bar']
                    },
                    batch_requests: false
                }, 'acclicks');

                var anchor = ele_with_class("some link text");
                anchor.e.onclick = function() { return false; }
                anchor.e.setAttribute('href', '#foo');
                anchor.e.setAttribute('data-foo-bar', 'baz');

                simulateMouseClick(anchor.e);
                same(this.requests.length, 1, "click event should fire request");
                var last_event = getRequestData(this.requests[0]);
                var props = last_event.properties;
                notOk("$el_attr__href" in props, "click event should not include href attribute");
                notOk("$attr-href" in props.$target, "click event target prop should not include href attribute");
                same(props["$el_attr__data-foo-bar"], "baz", "click event should include data-foo-bar attribute");
                same(props.$target["$attr-data-foo-bar"], "baz", "click event target prop should include data-foo-bar attribute");
            });

            test("autocapture block_attrs config takes precedence over capture_extra_attrs", 3, function() {
                mixpanel.init("autocapture_test_token", {
                    autocapture: {
                        pageview: false,
                        click: true,
                        block_attrs: ['data-foo-bar'],
                        capture_extra_attrs: ['data-foo-bar']
                    },
                    batch_requests: false
                }, 'acclicks');

                var anchor = ele_with_class("some link text");
                anchor.e.onclick = function() { return false; }
                anchor.e.setAttribute('data-foo-bar', 'baz');

                simulateMouseClick(anchor.e);
                same(this.requests.length, 1, "click event should fire request");
                var last_event = getRequestData(this.requests[0]);
                var props = last_event.properties;
                notOk("$el_attr__data-foo-bar" in props, "click event should not include data-foo-bar attribute");
                notOk("$attr-data-foo-bar" in props.$target, "click event target prop should not include data-foo-bar attribute");
            });

            test("autocapture does not track elements on pages blocked by URL regex config", 4, function() {
                var next_url = window.location.protocol + "//" + window.location.host + window.location.pathname;
                window.history.pushState({ path: next_url }, '', next_url);

                mixpanel.init("autocapture_test_token", {
                    autocapture: {
                        pageview: false,
                        click: true,
                        block_url_regexes: [/\/foopage\/?$/, /#barhash$/]
                    },
                    batch_requests: false
                }, 'acclicks');

                var anchor = ele_with_class();
                anchor.e.onclick = function() { return false; }

                // start on an unblocked page
                simulateMouseClick(anchor.e);
                same(this.requests.length, 1, "click event should have fired request");

                // add blocked hash fragment
                window.location.hash = "barhash";
                simulateMouseClick(anchor.e);
                same(this.requests.length, 1, "click event should not have fired request");

                // change to blocked path
                window.history.replaceState(null, null, next_url + "/foopage");
                simulateMouseClick(anchor.e);
                same(this.requests.length, 1, "click event should not have fired request");

                // back to unblocked path
                window.history.replaceState(null, null, next_url);
                simulateMouseClick(anchor.e);
                same(this.requests.length, 2, "click event should have fired request");
            });

            test("autocapture does not track pageviews on pages blocked by URL regex config", 6, function() {
                var next_url = window.location.protocol + "//" + window.location.host + window.location.pathname;
                window.history.pushState({ path: next_url }, '', next_url);

                mixpanel.init("autocapture_test_token", {
                    autocapture: {
                        block_url_regexes: [/\/foopage\/?$/, /#barhash$/]
                    },
                    batch_requests: false
                }, 'acpageviews');

                // start on an unblocked page
                same(this.requests.length, 1, "autocapture init should fire request on load");
                var last_event = getRequestData(this.requests[0]);
                same(last_event.event, "$mp_web_page_view", "last request should be $mp_web_page_view event");

                // add blocked hash fragment
                window.location.hash = "barhash";
                same(this.requests.length, 1, "URL change should not have fired request");

                // change to blocked path
                window.history.replaceState(null, null, next_url + "/foopage");
                same(this.requests.length, 1, "URL change should not have fired request");

                // back to unblocked path
                window.history.replaceState(null, null, next_url + "/unblockedpath");
                same(this.requests.length, 2, "URL change should have fired request");
                same(last_event.event, "$mp_web_page_view", "last request should be $mp_web_page_view event");
            });

            test("autocapture does not track pageviews on pages not on URL regex allowlist when present", 6, function() {
                var next_url = window.location.protocol + "//" + window.location.host + window.location.pathname;
                window.history.pushState({ path: next_url }, '', next_url);

                mixpanel.init("autocapture_test_token", {
                    autocapture: {
                        allow_url_regexes: [/\/foopage\/?$/, /#barhash$/]
                    },
                    batch_requests: false
                }, 'acpageviews');

                // start on a blocked page
                same(this.requests.length, 0, "autocapture init should not have fired request on load");

                // add allowed hash fragment
                window.location.hash = "barhash";
                same(this.requests.length, 1, "URL change should have fired request");
                var last_event = getRequestData(this.requests[0]);
                same(last_event.event, "$mp_web_page_view", "last request should be $mp_web_page_view event");

                // change to blocked path
                window.history.replaceState(null, null, next_url + "/lalala");
                same(this.requests.length, 1, "URL change should not have fired request");

                // back to unblocked path
                window.history.replaceState(null, null, next_url + "/foopage");
                same(this.requests.length, 2, "URL change should have fired request");
                same(last_event.event, "$mp_web_page_view", "last request should be $mp_web_page_view event");
            });

            test("autocapture can be turned on and off with set_config ", 6, function() {
                var next_url = window.location.protocol + "//" + window.location.host + window.location.pathname;
                window.history.pushState({ path: next_url }, '', next_url);

                mixpanel.init("autocapture_test_token", {
                    autocapture: false,
                    batch_requests: false
                }, 'acconfig');

                var anchor = ele_with_class();
                anchor.e.onclick = function() { return false; }

                simulateMouseClick(anchor.e);
                same(this.requests.length, 0, "click event should not have fired request");

                mixpanel.acconfig.set_config({autocapture: true});

                same(this.requests.length, 1, "autocapture init should fire request");
                var last_event = getRequestData(this.requests[0]);
                same(last_event.event, "$mp_web_page_view", "last request should be $mp_web_page_view event");

                simulateMouseClick(anchor.e);
                same(this.requests.length, 2, "click event should have fired request");
                same(getRequestData(this.requests[1]).event, "$mp_click", "last request should be $mp_click event");

                mixpanel.acconfig.set_config({autocapture: false});

                simulateMouseClick(anchor.e);
                same(this.requests.length, 2, "click event should not have fired request");
            });
        }

        if (USE_XHR && window.localStorage) {
            var BATCH_TOKEN = 'FAKE_TOKEN_BATCHTEST';
            var LOCALSTORAGE_PREFIX = '__mpq_' + BATCH_TOKEN;
            var LOCALSTORAGE_EVENTS_KEY = LOCALSTORAGE_PREFIX + '_ev';
            var LOCALSTORAGE_PEOPLE_KEY = LOCALSTORAGE_PREFIX + '_pp';
            var LOCALSTORAGE_GROUPS_KEY = LOCALSTORAGE_PREFIX + '_gr';

            var clearBatchLocalStorage = function() {
                localStorage.removeItem(LOCALSTORAGE_EVENTS_KEY);
                localStorage.removeItem(LOCALSTORAGE_PEOPLE_KEY);
                localStorage.removeItem(LOCALSTORAGE_GROUPS_KEY);
            };
            var initBatchLibInstance = function(options) {
                options = _.extend({
                    batch_requests: true,
                }, options);
                mixpanel.init(BATCH_TOKEN, options, 'batchtest');
                mixpanel.batchtest.clear_opt_in_out_tracking();
            };

            mpmodule("batch_requests tests", function() {
                this.clock = sinon.useFakeTimers({toFake: [
                    'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval'
                ]});
                startRecordingXhrRequests.call(this);
                if (navigator.sendBeacon) {
                    this.sendBeaconSpy = sinon.spy(navigator, 'sendBeacon');
                }
                if (Storage.prototype.setItem.restore) {
                    Storage.prototype.setItem.restore();
                }
                clearBatchLocalStorage();
                if (mixpanel.batchtest) {
                    clearLibInstance(mixpanel.batchtest);
                }
                initBatchLibInstance();
            }, function() {
                stopRecordingXhrRequests.call(this);
                if (this.sendBeaconSpy) {
                    this.sendBeaconSpy.restore();
                }
                clearBatchLocalStorage();
                if (mixpanel.batchtest) {
                    clearLibInstance(mixpanel.batchtest);
                }
                this.clock.restore();
                if (Storage.prototype.setItem.restore) {
                    Storage.prototype.setItem.restore();
                }
            });

            asyncTest('tracking does not send a request immediately', 2, function() {
                mixpanel.batchtest.track('queued event');
                this.clock.tickAsync(1000)
                    .then(_.bind(function () {
                        same(this.requests.length, 0, "track should not have sent a request");
                        return this.clock.tickAsync(5000);
                    }, this))
                    .then(_.bind(function () {
                        same(this.requests.length, 1, "batch request should have been sent");
                        start();
                    }, this))
            });

            asyncTest('tracking sends request after flush interval', 5, function() {
                mixpanel.batchtest.track('queued event 1');
                mixpanel.batchtest.track('queued event 2');
                
                // default batch_flush_interval_ms is 5000
                return this.clock.tickAsync(7000).then(_.bind(function() {
                    same(this.requests.length, 1, "batch should have sent a single request");
                    ok(this.requests[0].url.indexOf('/track/') >= 0, "only request should be to /track");
                    var tracked_events = getRequestData(this.requests[0]);
                    same(tracked_events.length, 2, "should have sent both events in batch");
                    same(tracked_events[0].event, 'queued event 1');
                    same(tracked_events[1].event, 'queued event 2');
                    start();
                }, this)); 
            });

            asyncTest('flush interval is configurable', 2, function() {
                // kill off existing instance which has already scheduled its first flush
                clearLibInstance(mixpanel.batchtest);
                initBatchLibInstance({batch_flush_interval_ms: 45000});

                mixpanel.batchtest.track('queued event');

                this.clock.tickAsync(7000)
                    .then(_.bind(function () {
                        same(this.requests.length, 0, "batch request should not have been sent yet");
                        return this.clock.tickAsync(40000);
                    }, this))
                    .then(_.bind(function () {
                        same(this.requests.length, 1, "batch request should have been sent");
                        start();
                    }, this))
            });

            asyncTest('malformed track response does not break batching', 3, function() {
                mixpanel.batchtest.track('queued event 1');
                mixpanel.batchtest.track('queued event 2');

                // _.bind(function () {}, this)
                this.clock.tickAsync(5100)
                    .then(_.bind(function () {
                        this.requests[0].respond(200, {}, '{"something":"malformed');
                        mixpanel.batchtest.track('queued event 3');
                        return this.clock.tickAsync(5100);
                    }, this))
                    .then(_.bind(function () {
                        same(this.requests.length, 2, "should have sent both requests with no backoff");
                        var batch2_events = getRequestData(this.requests[1]);
                        same(batch2_events.length, 1, "should have included only one new event in last batch");
                        same(batch2_events[0].event, 'queued event 3');
                        start();
                    }, this))
            });

            asyncTest('batched requests get queued in localStorage', 6, function() {
                mixpanel.batchtest.track('storagetest 1');
                mixpanel.batchtest.track('storagetest 2');
                
                this.clock.tickAsync(2500).then(_.bind(function() {
                    var stored_requests = JSON.parse(localStorage.getItem(LOCALSTORAGE_EVENTS_KEY));
                    same(stored_requests.length, 2, "both events should be in localStorage");
                    same(stored_requests[0].payload.event, 'storagetest 1');
                    same(stored_requests[1].payload.event, 'storagetest 2');
                    same(stored_requests[0].payload.properties.mp_lib, 'web', "should include event properties");
                    ok(stored_requests[0].id !== stored_requests[1].id, "stored request should include unique IDs");
                    ok(stored_requests[0].flushAfter > Date.now(), "stored request should include valid flushAfter time");
                    start();
                }, this))
            });

            asyncTest('requests are cleared from localStorage after network response', 4, function() {
                var stored_requests;

                mixpanel.batchtest.track('storagetest 1');
                mixpanel.batchtest.track('storagetest 2');

                this.clock.tickAsync(5000)
                    .then(_.bind(function() {
                        stored_requests = JSON.parse(localStorage.getItem(LOCALSTORAGE_EVENTS_KEY));
                        same(stored_requests.length, 2, "both events should be in localStorage");
                        this.requests[0].respond(200, {}, '1');
                        return this.clock.tickAsync(5000);
                    }, this))
                    .then(_.bind(function() {
                        stored_requests = JSON.parse(localStorage.getItem(LOCALSTORAGE_EVENTS_KEY));
                        same(stored_requests.length, 0, "both events should have been removed from localStorage");
                        
                        // try again with '0' response
                        mixpanel.batchtest.track('storagetest 1');
                        return this.clock.tickAsync(1000);
                    }, this))
                    .then(_.bind(function() {
                        stored_requests = JSON.parse(localStorage.getItem(LOCALSTORAGE_EVENTS_KEY));
                        same(stored_requests.length, 1, "event should be in localStorage");

                        return this.clock.tickAsync(5000);
                    }, this))
                    .then(_.bind(function() {
                        this.requests[1].respond(400, {}, '0');
                        return this.clock.tickAsync(1000);
                    }, this))
                    .then(_.bind(function() {
                        stored_requests = JSON.parse(localStorage.getItem(LOCALSTORAGE_EVENTS_KEY));
                        same(stored_requests.length, 0, "event should have been removed from localStorage even after 400");
                        start();
                    }, this))
            });

            asyncTest('requests are not cleared from localStorage after 50x response', 3, function() {
                mixpanel.batchtest.track('storagetest 1');
                mixpanel.batchtest.track('storagetest 2');
                
                this.clock.tickAsync(1000)
                    .then(_.bind(function() {
                        stored_requests = JSON.parse(localStorage.getItem(LOCALSTORAGE_EVENTS_KEY));
                        same(stored_requests.length, 2, "both events should be in localStorage");
                        return this.clock.tickAsync(5000);
                    }, this))
                    .then(_.bind(function() {
                        this.requests[0].respond(503, {}, 'unavailable');
                        return this.clock.tickAsync(1000);
                    }, this))
                    .then(_.bind(function() {
                        stored_requests = JSON.parse(localStorage.getItem(LOCALSTORAGE_EVENTS_KEY));
                        same(stored_requests.length, 2, "both events should still be in localStorage");
                        return this.clock.tickAsync(10000);
                    }, this))
                    .then(_.bind(function() {
                        same(stored_requests.length, 2, "both events should still be in localStorage");
                        start();
                    }, this))
            });
            
            asyncTest('requests are not cleared from localStorage when offline', 3, function() {
                var onlineStub = sinon.stub(window.navigator, 'onLine').value(false);

                mixpanel.batchtest.track('storagetest 1');
                mixpanel.batchtest.track('storagetest 2');

                this.clock.tickAsync(1000)
                    .then(_.bind(function() {
                        var stored_requests = JSON.parse(localStorage.getItem(LOCALSTORAGE_EVENTS_KEY));
                        same(stored_requests.length, 2, "both events should be in localStorage");
                        return this.clock.tickAsync(5000);
                    }, this))
                    .then(_.bind(function() {
                        this.requests[0].respond(0, {}, '');
                        return this.clock.tickAsync(1000);
                    }, this))
                    .then(_.bind(function() {
                        stored_requests = JSON.parse(localStorage.getItem(LOCALSTORAGE_EVENTS_KEY));
                        same(stored_requests.length, 2, "both events should still be in localStorage");
                        return this.clock.tickAsync(10000);
                    }, this))
                    .then(_.bind(function() {
                        same(stored_requests.length, 2, "both events should still be in localStorage");
                        onlineStub.restore();
                        start();
                    }, this))
            });

            asyncTest('orphaned data in localStorage gets sent on init', 6, function() {
                clearLibInstance(mixpanel.batchtest);

                // tick first to make sure previous batchers are stopped and cleared
                this.clock.tickAsync(1000)
                    .then(_.bind(function() {
                        localStorage.setItem(LOCALSTORAGE_EVENTS_KEY, JSON.stringify([
                            {id: 'fakeID1', flushAfter: Date.now() - 60000, payload: {
                                'event': 'orphaned event 1', 'properties': {'foo': 'bar'}
                            }},
                            {id: 'fakeID2', flushAfter: Date.now() - 240000, payload: {
                                'event': 'orphaned event 2'
                            }}
                        ]));
                        same(JSON.parse(localStorage.getItem(LOCALSTORAGE_EVENTS_KEY)).length, 2);
    
                        initBatchLibInstance();
                        return this.clock.tickAsync(1000);
                    }, this))
                    .then(_.bind(function() {
                        same(this.requests.length, 1, "request should have been made to send orphaned events");
                        var batch_events = getRequestData(this.requests[0]);
                        same(batch_events.length, 2, "should have included only orphaned events");
                        same(batch_events[0].event, 'orphaned event 1');
                        same(batch_events[1].event, 'orphaned event 2');
                        this.requests[0].respond(200, {}, '1');

                        return this.clock.tickAsync(1000);
                    }, this))
                    .then(_.bind(function() {
                        same(JSON.parse(localStorage.getItem(LOCALSTORAGE_EVENTS_KEY)).length, 0, "orphaned events should have been removed from localStorage");
                        start();
                    }, this));
            });

            asyncTest('track callback runs when item is successfully enqueued', 2, function() {
                mixpanel.batchtest.track('callback test 1', {}, function(response, data) {
                    same(response, 1, "should have passed 1 to callback for success");
                    same(data.event, 'callback test 1', "should have passed enqueued data to callback");
                    start();
                });
                this.clock.tickAsync(10);
            });

            asyncTest('failure to enqueue in localStorage causes immediate track request', 3, function() {
                sinon.stub(Storage.prototype, 'setItem').throws('localStorage disabled');
                mixpanel.batchtest.track('failure event');
                this.clock.tickAsync(1000)
                    .then(_.bind(function() {
                        same(this.requests.length, 1, "request should have been made immediately upon storage failure");
                        var request_data = getRequestData(this.requests[0]);
                        same(request_data.event, 'failure event', "should have sent event that failed to queue");
                        
                        return this.clock.tickAsync(30000);
                    }, this))
                    .then(_.bind(function() {
                        same(this.requests.length, 1, "should not have made any new requests after event was sent");
                        start();
                    }, this))
            });

            test('send_immediately track option bypasses queue', 4, function() {
                mixpanel.batchtest.track('immediate event', {}, {send_immediately: true});
                same(this.requests.length, 1, "request should have been made immediately");
                var request_data = getRequestData(this.requests[0]);
                same(request_data.event, 'immediate event', "should have sent event in immediate request");

                same(localStorage.getItem(LOCALSTORAGE_EVENTS_KEY), null, "send_immediately event should not have been enqueued");

                this.clock.tick(30000);
                same(this.requests.length, 1, "should not have made any new requests after event was sent");
            });

            if (navigator.sendBeacon && window.addEventListener) {
                var getBatchSendBeaconRequestData = function(sendBeaconSpy) {
                    return sendBeaconSpy.args
                        .map(function(args) {
                            return getRequestData({requestBody: args[1]});
                        })
                        .filter(function(data) {
                            return data[0].properties.token === BATCH_TOKEN;
                        });
                };

                asyncTest('queued requests are flushed via sendBeacon before page pagehide - pagehide event', 3, function() {
                    mixpanel.batchtest.track('queued event');
                    
                    this.clock.tickAsync(50)
                        .then(_.bind(function() {
                                var event = new Event('pagehide');
                                Object.defineProperty(event, 'persisted', {value: 'true', writable: true});
                                window.dispatchEvent(event);
                                return this.clock.tickAsync(50);
                            }, this))
                        .then(_.bind(function() {
                            ok(this.sendBeaconSpy.called, "pagehide should have called sendBeacon");
                            var request_data = getBatchSendBeaconRequestData(this.sendBeaconSpy)[0];
                            same(request_data.length, 1, "sendBeacon should have sent a single event");
                            same(request_data[0].event, 'queued event', "sendBeacon should have sent queued event");
                            start();
                        }, this))
                    });

                asyncTest('queued requests are flushed via sendBeacon before page - visibilitychange event', 3, function() {
                    mixpanel.batchtest.track('queued event');

                    this.clock.tickAsync(50)
                        .then(_.bind(function() {
                            Object.defineProperty(document, 'visibilityState', {value: 'hidden', writable: true});
                            Object.defineProperty(document, 'hidden', {value: true, writable: true});
                            window.dispatchEvent(new Event('visibilitychange'));
                            return this.clock.tickAsync(50);
                        }, this))
                        .then(_.bind(function() {
                            ok(this.sendBeaconSpy.called, "visibilitychange should have called sendBeacon");
                            var request_data = getBatchSendBeaconRequestData(this.sendBeaconSpy)[0];
                            same(request_data.length, 1, "sendBeacon should have sent a single event");
                            same(request_data[0].event, 'queued event', "sendBeacon should have sent queued event");
                            start();
                        }, this));
                });

                asyncTest('batch/flush cycle works in sendBeacon mode', 8, function() {
                    mixpanel.batchtest.set_config({api_transport: 'sendBeacon'});

                    mixpanel.batchtest.track('queued event 1');
                    mixpanel.batchtest.track('queued event 2');

                    this.clock.tickAsync(1000)
                        .then(_.bind(function() {
                            notOk(this.sendBeaconSpy.called, "batch request should not have been sent yet");
                            return this.clock.tickAsync(5000);
                        }, this))
                        .then(_.bind(function() {
                            ok(this.sendBeaconSpy.calledOnce, "batch should have sent a single request");
                            var request_data = getBatchSendBeaconRequestData(this.sendBeaconSpy)[0];
                            same(request_data.length, 2, "sendBeacon should have sent both queued events");
                            same(request_data[0].event, 'queued event 1');
                            same(request_data[1].event, 'queued event 2');
                            mixpanel.batchtest.track('queued event 3');
                            return this.clock.tickAsync(1000);
                        }, this))
                        .then(_.bind(function() {
                            ok(this.sendBeaconSpy.calledOnce, "second batch should not have been sent yet");
                            return this.clock.tickAsync(5000);
                        }, this))
                        .then(_.bind(function() {
                            ok(this.sendBeaconSpy.calledTwice, "second batch should have been sent");
                            request_data = getBatchSendBeaconRequestData(this.sendBeaconSpy)[1];
                            same(request_data[0].event, 'queued event 3');
                            start();
                        }, this));
                });

                asyncTest('before_send hooks are applied to events flushed via sendBeacon before pagehide event', 6, function() {
                    mixpanel.batchtest.set_config({
                        hooks: {
                            before_send_events: function(event_data) {
                                event_data.event += ' (transformed)';
                                return event_data;
                            }
                        }
                    });
                    mixpanel.batchtest.track('queued event');

                    this.clock.tickAsync(1000)
                        .then(_.bind(function() {
                            var stored_requests = JSON.parse(localStorage.getItem(LOCALSTORAGE_EVENTS_KEY));
                            same(stored_requests.length, 1, "event should be persisted in localStorage");
                            var event = new Event('pagehide');
                            Object.defineProperty(event, 'persisted', {value: 'true', writable: true});
                            window.dispatchEvent(event);
                            return this.clock.tickAsync(100);
                        }, this))
                        .then(_.bind(function() {
                            ok(this.sendBeaconSpy.called, "page hide event should have called sendBeacon");
                            var request_data = getBatchSendBeaconRequestData(this.sendBeaconSpy)[0];
                            same(request_data.length, 1, "sendBeacon should have sent a single event");
                            same(request_data[0].event, 'queued event (transformed)', "before_send hook should be applied to event on pagehide");
                            stored_requests = JSON.parse(localStorage.getItem(LOCALSTORAGE_EVENTS_KEY));
                            same(stored_requests.length, 1, "event should still be in localStorage");
                            same(stored_requests[0].payload.event, 'queued event (transformed)', "before_send hook should be applied to persisted queue before pagehide");
                            start();
                        }, this));
                });

                asyncTest('before_send hooks are applied to events flushed via sendBeacon before page unloads (visibilitychange changes)', 6, function() {
                    mixpanel.batchtest.set_config({
                        hooks: {
                            before_send_events: function(event_data) {
                                event_data.event += ' (transformed)';
                                return event_data;
                            }
                        }
                    });
                    mixpanel.batchtest.track('queued event');

                    this.clock.tickAsync(100)
                        .then(_.bind(function() {
                            var stored_requests = JSON.parse(localStorage.getItem(LOCALSTORAGE_EVENTS_KEY));
                            same(stored_requests.length, 1, "event should be persisted in localStorage");
                            Object.defineProperty(document, 'visibilityState', {value: 'hidden', writable: true});
                            Object.defineProperty(document, 'hidden', {value: true, writable: true});
                            window.dispatchEvent(new Event('visibilitychange'));
                            
                            return this.clock.tickAsync(100);
                        }, this))
                        .then(_.bind(function() {
                            ok(this.sendBeaconSpy.called, "visibilitychange event should have called sendBeacon");
                            var request_data = getBatchSendBeaconRequestData(this.sendBeaconSpy)[0];
                            same(request_data.length, 1, "sendBeacon should have sent a single event");
                            same(request_data[0].event, 'queued event (transformed)', "before_send hook should be applied to event on visibilitychange");
    
                            stored_requests = JSON.parse(localStorage.getItem(LOCALSTORAGE_EVENTS_KEY));
                            same(stored_requests.length, 1, "event should still be in localStorage");
                            same(stored_requests[0].payload.event, 'queued event (transformed)', "before_send hook should be applied to persisted queue before visibilitychange");
                            start();
                        }, this))
                });
            }

            asyncTest('queued requests are cancelled if opt-out is called', 2, function() {
                mixpanel.batchtest.track('pre-opt-out event 1');
                mixpanel.batchtest.track('pre-opt-out event 2');

                this.clock.tickAsync(1000)
                    .then(_.bind(function() {
                        mixpanel.batchtest.opt_out_tracking();
                        mixpanel.batchtest.track('post-opt-out event');
                        return this.clock.tickAsync(240000);
                    }, this))
                    .then(_.bind(function() {
                        same(localStorage.getItem(LOCALSTORAGE_EVENTS_KEY), null, "localStorage entry should have been cleared by opt-out");
                        same(this.requests.length, 0, "should not have made any requests after opt-out");
                        start();
                    }, this));
            });

            asyncTest('success callback works if opt-out is called after request has been sent', 3, function() {
                mixpanel.batchtest.track('pre-opt-out event 1');
                mixpanel.batchtest.track('pre-opt-out event 2');

                this.clock.tickAsync(5000)
                    .then(_.bind(function() {
                        same(this.requests.length, 1, "should have made request after flush interval");
                        mixpanel.batchtest.opt_out_tracking();
                        mixpanel.batchtest.track('post-opt-out event');
                        this.requests[0].respond(200, {}, '1');
                        return this.clock.tickAsync(100);
                    }, this))
                    .then(_.bind(function() {
                        var stored_requests = JSON.parse(localStorage.getItem(LOCALSTORAGE_EVENTS_KEY));
                        same(stored_requests.length, 0, "localStorage entry should be clear");
                        return this.clock.tickAsync(240000);
                    }, this))
                    .then(_.bind(function() {
                        same(this.requests.length, 1, "no new requests should have been made");
                        start();
                    }, this))
            });

            asyncTest('opt-out after request has been sent', 2, function() {
                mixpanel.batchtest.track('pre-opt-out event 1');
                mixpanel.batchtest.track('pre-opt-out event 2');

                this.clock.tickAsync(5000)
                    .then(_.bind(function() {
                        same(this.requests.length, 1, "should have made request after flush interval");
                        mixpanel.batchtest.opt_out_tracking();

                        return this.clock.tickAsync(100000); // let 90s network timeout elapse
                    }, this))
                    .then(_.bind(function() {
                        this.requests[0].triggerTimeout();
                        return this.clock.tickAsync(240000);
                    }, this))
                    .then(_.bind(function() {
                        same(this.requests.length, 1, "should not have retried failing request after opt-out");
                        start();
                    }, this))
            });

            asyncTest('batching resumes upon opt-in', 7, function() {
                mixpanel.batchtest.track('pre-opt-out event 1');
                mixpanel.batchtest.track('pre-opt-out event 2');

                this.clock.tickAsync(1000)
                    .then(_.bind(function() {
                        mixpanel.batchtest.opt_out_tracking();
                        return this.clock.tickAsync(100);
                    }, this))
                    .then(_.bind(function() {
                        mixpanel.batchtest.track('post-opt-out event');
                        return this.clock.tickAsync(5000);
                    }, this))
                    .then(_.bind(function() {
                        same(this.requests.length, 0, "should not have made any requests yet");
                        mixpanel.batchtest.opt_in_tracking();
                        return this.clock.tickAsync(100);
                    }, this))
                    .then(_.bind(function() {
                        same(this.requests.length, 1, "should have tracked $opt_in immediately");
                        mixpanel.batchtest.track('post-opt-in event 1');
                        mixpanel.batchtest.track('post-opt-in event 2');
                        return this.clock.tickAsync(5000);
                    }, this))
                    .then(_.bind(function() {
                        same(this.requests.length, 2, "should have made request after flush interval");
                        var batch_events = getRequestData(this.requests[1]);
                        same(batch_events.length, 2, "should have included only two new events in last batch");
                        same(batch_events[0].event, 'post-opt-in event 1');
                        same(batch_events[1].event, 'post-opt-in event 2');
                        this.requests[1].respond(200, {}, '1');
                        return this.clock.tickAsync(240000);
                    }, this))
                    .then(_.bind(function() {
                        same(this.requests.length, 2, "no new requests should have been made with orphaned data");
                        start();
                    }, this))
            });

            asyncTest('with batch_autostart=false, requests are not sent until explicit start', 6, function() {
                clearLibInstance(mixpanel.batchtest);
                
                // tick first to make sure previous batchers are stopped and cleared
                this.clock.tickAsync(1000)
                    .then(_.bind(function() {
                        initBatchLibInstance({batch_autostart: false});
                        return this.clock.tickAsync(1000);
                    }, this))
                    .then(_.bind(function() {
                        mixpanel.batchtest.track('pre-start event 1');
                        mixpanel.batchtest.track('pre-start event 2');

                        return this.clock.tickAsync(10000);
                    }, this))
                    .then(_.bind(function() {
                        same(this.requests.length, 0, "should not have made any requests yet");
                        mixpanel.batchtest.start_batch_senders();
                        return this.clock.tickAsync(1000);
                    }, this))
                    .then(_.bind(function() {
                        same(this.requests.length, 1, "should have sent events after batcher start");
                        var batch_events = getRequestData(this.requests[0]);
                        same(batch_events[0].event, 'pre-start event 1');
                        same(batch_events[1].event, 'pre-start event 2');
                        this.requests[0].respond(200, {}, '1');
                        mixpanel.batchtest.track('post-start event');
                        return this.clock.tickAsync(5000);
                    }, this))
                    .then(_.bind(function() {
                        same(this.requests.length, 2, "should continue to flush after batcher start");
                        batch_events = getRequestData(this.requests[1]);
                        same(batch_events[0].event, 'post-start event');
                        start();
                    }, this))
            });

            asyncTest('with batch_autostart=false, orphaned data in localStorage gets sent after explicit start', 5, function() {
                clearLibInstance(mixpanel.batchtest);

                // tick first to make sure previous batchers are stopped and cleared
                this.clock.tickAsync(1000)
                    .then(_.bind(function() {
                        localStorage.setItem(LOCALSTORAGE_EVENTS_KEY, JSON.stringify([
                            {id: 'fakeID1', flushAfter: Date.now() - 60000, payload: {
                                'event': 'orphaned event 1', 'properties': {'foo': 'bar'}
                            }},
                            {id: 'fakeID2', flushAfter: Date.now() - 240000, payload: {
                                'event': 'orphaned event 2'
                            }}
                        ]));
    
                        initBatchLibInstance({batch_autostart: false});
                        return this.clock.tickAsync(1000);
                    }, this))
                    .then(_.bind(function() {
                        same(this.requests.length, 0, "no requests should have been sent yet");
                        mixpanel.batchtest.start_batch_senders();
                        return this.clock.tickAsync(1000);
                    }, this))
                    .then(_.bind(function() {
                        same(this.requests.length, 1, "request should have been made to send orphaned events");
                        var batch_events = getRequestData(this.requests[0]);
                        same(batch_events.length, 2, "should have included only orphaned events");
                        same(batch_events[0].event, 'orphaned event 1');
                        same(batch_events[1].event, 'orphaned event 2');
                        start();
                    }, this))
            });

            asyncTest('before_send_events hook is applied retroactively to batched but not orphaned events', 7, function() {
                clearLibInstance(mixpanel.batchtest);
                // tick first to make sure previous batchers are stopped and cleared
                this.clock.tickAsync(1000)
                    .then(_.bind(function() {
                        localStorage.setItem(LOCALSTORAGE_EVENTS_KEY, JSON.stringify([
                            {id: 'fakeID1', flushAfter: Date.now() - 60000, payload: {
                                'event': 'orphaned event 1', 'properties': {'foo': 'bar'}
                            }},
                            {id: 'fakeID2', flushAfter: Date.now() - 240000, payload: {
                                'event': 'orphaned event 2'
                            }}
                        ]));
    
                        initBatchLibInstance({
                            batch_autostart: false,
                            hooks: {
                                before_send_events: function(event_data) {
                                    return _.extend(event_data, {event: event_data.event.toUpperCase()});
                                }
                            }
                        });
                        mixpanel.batchtest.track('Non-orphaned event', {'hello': 'world'});
                        return this.clock.tickAsync(1000);
                    }, this))
                    .then(_.bind(function() {
                        mixpanel.batchtest.start_batch_senders();
                        return this.clock.tickAsync(1000);
                    }, this))
                    .then(_.bind(function() {
                        same(this.requests.length, 1);
                        var batch_events = getRequestData(this.requests[0]);
                        same(batch_events.length, 3, "should have included all events");
                        same(batch_events[0].event, 'NON-ORPHANED EVENT', "should have applied hook to non-orphaned event");
                        same(batch_events[0].properties['hello'], 'world', "should not have affected properties");
                        same(batch_events[1].event, 'orphaned event 1', "should not have applied hook to orphaned event");
                        same(batch_events[2].event, 'orphaned event 2', "should not have applied hook to orphaned event");
                        this.requests[0].respond(200, {}, '1');
                        mixpanel.batchtest.track('post-start event');
                        return this.clock.tickAsync(5000)
                    }, this))
                    .then(_.bind(function() {
                        batch_events = getRequestData(this.requests[1]);
                        same(batch_events[0].event, 'POST-START EVENT', "should continue applying hook");
                        start();
                    }, this))
            });

            asyncTest('queued events are dropped if before_send_events hook returns null', 4, function() {
                mixpanel.batchtest.set_config({
                    hooks: {
                        before_send_events: function(event_data) {
                            return event_data.event === 'dropme' ? null : event_data;
                        }
                    }
                });
                mixpanel.batchtest.track('dropme', {'hello': 'world'});
                mixpanel.batchtest.track('track me 1');
                mixpanel.batchtest.track('dropme');
                mixpanel.batchtest.track('track me 2');

                this.clock.tickAsync(5000)
                    .then(_.bind(function() {
                        same(this.requests.length, 1);
                        var batch_events = getRequestData(this.requests[0]);
                        same(batch_events.length, 2);
                        var eventNames = _.map(batch_events, function(event) { return event.event; }).sort();
                        same(eventNames[0], 'track me 1');
                        same(eventNames[1], 'track me 2');
                        start();
                    }, this));
            });

            asyncTest('people updates do not send a request immediately', 1, function() {
                mixpanel.batchtest.identify('pat');
                mixpanel.batchtest.people.set('foo', 'bar');
                this.clock.tickAsync(100)
                    .then(_.bind(function() {
                        same(this.requests.length, 0, "people.set should not have sent a request");
                        start();
                    }, this));
            });

            asyncTest('people updates send request after flush interval', 9, function() {
                mixpanel.batchtest.identify('pat');
                
                this.clock.tickAsync(100)
                    .then(_.bind(function() {
                        mixpanel.batchtest.people.set('foo', 'bar');
                        mixpanel.batchtest.people.increment('llamas');
                        return this.clock.tickAsync(7000); // default batch_flush_interval_ms is 5000
                    }, this))
                    .then(_.bind(function() {
                        // first request was to /decide upon identify()
                        var engage_request = _.find(this.requests, function(req) {
                            return req.url.indexOf('/engage/') >= 0;
                        });

                        ok(engage_request, "should have made /engage request");
                        var people_updates = getRequestData(engage_request);
                        same(people_updates.length, 3, "should have sent all updates in batch");
                        isDefined(people_updates[0].$set_once, '$initial_referrer');
                        isDefined(people_updates[0].$set_once, '$initial_referring_domain');
                        ok(contains_obj(people_updates[1].$set, {foo: 'bar'}));
                        ok(contains_obj(people_updates[2].$add, {llamas: 1}));
                        same(people_updates[0].$distinct_id, 'pat');
                        same(people_updates[1].$distinct_id, 'pat');
                        same(people_updates[2].$distinct_id, 'pat');
                        start();
                    }, this))
            });

            asyncTest('group updates do not send a request immediately', 1, function() {
                mixpanel.batchtest.get_group('font', 'Times').set('serif', true);
                return this.clock.tickAsync(100)
                    .then(_.bind(function() {
                        same(this.requests.length, 0, "group.set should not have sent a request");
                        start()
                    }, this))
            });

            asyncTest('group updates send request after flush interval', 5, function() {
                mixpanel.batchtest.get_group('font', 'Times').set('serif', true);
                mixpanel.batchtest.get_group('font', 'Comic Sans').delete();

                // default batch_flush_interval_ms is 5000
                this.clock.tickAsync(7000)
                    .then(_.bind(function() {
                        same(this.requests.length, 1, "group updates should have made request");
    
                        var group_updates = getRequestData(this.requests[0]);
                        same(group_updates.length, 2, "should have sent both updates in batch");
    
                        ok(contains_obj(group_updates[0], {
                            $group_key: 'font',
                            $group_id: 'Times'
                        }));
                        ok(contains_obj(group_updates[0].$set, {serif: true}));
                        ok(contains_obj(group_updates[1], {
                            $group_key: 'font',
                            $group_id: 'Comic Sans',
                            $delete: ''
                        }));
                        start();
                    }, this))
                });
        }

        if (window.sessionStorage) {
            mpmodule("get_tab_id");

            test("get_tab_id returns a string uuid", 2, function() {
                var tab_id = mixpanel.test.get_tab_id();
                ok(typeof(tab_id) === "string", "tab id is a string");
                ok(tab_id.length > 0, "tab id is not empty");
            });

            test("different SDK instances have different tab IDs", 3, function () {
                mixpanel.init('difftoken', {}, `difftest`);
                ok(typeof(mixpanel.test.get_tab_id()) === "string", "tab id is a string");
                ok(typeof(mixpanel.difftest.get_tab_id()) === "string", "tab id is a string");

                ok(mixpanel.test.get_tab_id() !== mixpanel.difftest.get_tab_id(), "tab IDs are different");
            });

            test("retrieves and reuses previous tab ID from sessionStorage", 3, function () {
                var tab_id = mixpanel.test.get_tab_id();

                window.dispatchEvent(new CustomEvent("beforeunload"));
                clearLibInstance(mixpanel.test);

                mixpanel.init(this.token, {
                    batch_requests: false,
                    debug: true
                }, "test");

                ok(typeof(mixpanel.test.get_tab_id()) === "string", "tab id is a string");
                ok(tab_id === mixpanel.test.get_tab_id(), "tab ID is reused for the same tab and sdk instance");

                var manual_tab_id = "asdf-tab-id";
                window.sessionStorage.setItem("mp_tab_id_difftest_difftoken", manual_tab_id);
                mixpanel.init('difftoken', {}, `difftest`);
                ok(mixpanel.difftest.get_tab_id() === manual_tab_id, "manually set tab ID is used");
            });

            test("issues a new tab ID when the flag is present (when sessionStorage is duplicated)", 3, function () {
                var tab_id = mixpanel.test.get_tab_id();
                clearLibInstance(mixpanel.test);

                mixpanel.init(this.token, {
                    batch_requests: false,
                    debug: true
                }, "test");

                ok(typeof(mixpanel.test.get_tab_id()) === "string", "tab id is a string");
                ok(typeof(tab_id) === "string", "tab id is a string");
                ok(tab_id !== mixpanel.test.get_tab_id(), "tab ID has changed since the flag to generate a new tab ID was set");
            });
        }

        if (!window.COOKIE_FAILURE_TEST) { // GDPR functionality cannot operate without cookies

            mpmodule('GDPR', null, function() {
                // module teardown: clean up lib in case there was an exception before individual test cleanup code
                if (mixpanel.gdpr) {
                    clearLibInstance(mixpanel.gdpr);
                }
            });

            function gdprTestMethod(method, args) {
                function gdprTest(description, options) {
                    asyncTest(description, USE_XHR ? 3 : 1, function() {
                        options = _.extend({
                            opt_in: true,               // true=opt-in, false=opt-out
                            assert_user_cleared: false, // assert delete_user and clear_charges are called properly on opt-out
                            config: {},                 // config that will be passed to mixpanel.init
                            pre_init: function() {},    // override to perform custom setup code before init & identify
                            post_init: function() {}    // override to perform custom setup code after init & identify
                        }, options);
                        options.config.batch_requests = false;

                        options.pre_init.call(this);

                        mixpanel.init('gdpr', options.config, 'gdpr');
                        mixpanel.gdpr.identify(this.id); // necessary for certain methods to work properly

                        // run custom setup, record xhr requests to verify clear user data functionality
                        var requests = recordXhrRequests.call(this, options.post_init);

                        var lib = mixpanel.gdpr[method] ? mixpanel.gdpr : mixpanel.gdpr.people;
                        lib[method].apply(lib, args.concat(function(response) {
                            same(
                                response,
                                Number(Boolean(options.opt_in)),
                                method + ' should ' + (options.opt_in ? '' : 'not ') + 'be successful'
                            );

                            if (USE_XHR) {
                                var engage_requests = requests.filter(function(request) {
                                    return request.url.indexOf('/engage/') >= 0;
                                });
                                if (options.assert_user_cleared) {
                                    ok(
                                        getRequestData(engage_requests[0], ['$delete']),
                                        "delete_user request should have been made"
                                    );
                                    same(
                                        getRequestData(engage_requests[1], ['$set', '$transactions']),
                                        [],
                                        "clear_charges request should have been made"
                                    );
                                } else {
                                    notOk(engage_requests.length, "delete_user request should not have been made");
                                    notOk(engage_requests.length, "clear_charges request should not have been made");
                                }
                            }

                            // teardown
                            clearLibInstance(mixpanel.gdpr);
                            mixpanel._.cookie.remove('mp_optout'); // remove if present
                            start();
                        }));
                    });
                }

                var persistence_types = ['cookie'];

                if (window.localStorage) {
                    persistence_types.push('localStorage');
                }

                for (var i = 0; i < persistence_types.length; i++) {
                    var persistence_type = persistence_types[i];

                    gdprTest(method + ' tracking is enabled by opt-in', {
                        config: {opt_out_tracking_persistence_type: persistence_type},
                        post_init: function() {
                            mixpanel.gdpr.opt_in_tracking();
                        }
                    });

                    gdprTest(method + ' tracking is disabled by opt-out', {
                        opt_in: false,
                        assert_user_cleared: true,
                        config: {opt_out_tracking_persistence_type: persistence_type},
                        post_init: function() {
                            mixpanel.gdpr.opt_out_tracking();
                        }
                    });

                    gdprTest(method + ' tracking is disabled by opt-out and clearing user data is disabled properly', {
                        opt_in: false,
                        assert_user_cleared: false, // ensure user data isn't cleared on opt out (as delete_user=false is specified below)
                        config: {opt_out_tracking_persistence_type: persistence_type},
                        post_init: function() {
                            mixpanel.gdpr.opt_out_tracking({delete_user: false});
                        }
                    });

                    gdprTest(method + ' tracking is disabled by opt-in followed by opt-out', {
                        opt_in: false,
                        assert_user_cleared: true,
                        config: {opt_out_tracking_persistence_type: persistence_type},
                        post_init: function() {
                            mixpanel.gdpr.opt_in_tracking();
                            mixpanel.gdpr.opt_out_tracking();
                        }
                    });

                    gdprTest(method + ' tracking is enabled by opt-out followed by opt-in', {
                        assert_user_cleared: true,
                        config: {opt_out_tracking_persistence_type: persistence_type},
                        post_init: function() {
                            mixpanel.gdpr.opt_out_tracking();
                            mixpanel.gdpr.opt_in_tracking();
                        }
                    });

                    gdprTest(method + ' tracking is enabled with opt-in cookie and opt-out default', {
                        config: {
                            opt_out_tracking_by_default: true,
                            opt_out_tracking_persistence_type: persistence_type
                        },
                        pre_init: function() {
                            // Set the opt in cookie to make sure it overrides opt_out_tracking_by_default
                            mixpanel.init('gdpr', {opt_out_tracking_persistence_type: 'cookie'}, 'gdpr');
                            mixpanel.gdpr.opt_in_tracking();
                            clearLibInstance(mixpanel.gdpr, /* clear_opt_in_out */ false);
                        },
                    })

                    gdprTest(method + ' tracking is disabled by opt-out as default', {
                        opt_in: false,
                        config: {
                            opt_out_tracking_by_default: true,
                            opt_out_tracking_persistence_type: persistence_type
                        }
                    });

                    gdprTest(method + ' tracking is enabled by opt-out as default followed by opt-in', {
                        config: {
                            opt_out_tracking_by_default: true,
                            opt_out_tracking_persistence_type: persistence_type
                        },
                        post_init: function() {
                            mixpanel.gdpr.opt_in_tracking();
                        }
                    });

                    gdprTest(method + ' tracking is disabled by mp_optout cookie', {
                        opt_in: false,
                        config: {opt_out_tracking_persistence_type: persistence_type},
                        pre_init: function() {
                            mixpanel._.cookie.set('mp_optout');
                        }
                    });

                    gdprTest(method + ' tracking is enabled by mp_optout followed by opt-in', {
                        config: {opt_out_tracking_persistence_type: persistence_type},
                        pre_init: function() {
                            mixpanel._.cookie.set('mp_optout');
                        },
                        post_init: function() {
                            mixpanel.gdpr.opt_in_tracking();
                        }
                    });

                    // test cases using custom GDPR cookie prefix
                    var prefix = '𝓶𝓶𝓶𝓬𝓸𝓸𝓴𝓲𝓮𝓼';

                    gdprTest(method + ' tracking is enabled by opt-in with custom cookie prefix passed as option', {
                        post_init: function() {
                            mixpanel.gdpr.opt_in_tracking({cookie_prefix: prefix});
                        }
                    });

                    gdprTest(method + ' tracking is not disabled by opt-out with custom cookie prefix passed as option', {
                        opt_in: true,
                        assert_user_cleared: true,
                        config: {opt_out_tracking_persistence_type: persistence_type},
                        post_init: function() {
                            mixpanel.gdpr.opt_out_tracking({cookie_prefix: prefix});
                        }
                    });

                    gdprTest(method + ' tracking is enabled by opt-in with custom cookie prefix in lib configuration', {
                        config: {
                            opt_out_tracking_cookie_prefix: prefix,
                            opt_out_tracking_persistence_type: persistence_type
                        },
                        post_init: function() {
                            mixpanel.gdpr.opt_in_tracking();
                        }
                    });

                    // test cases using browser DoNotTrack (DNT) setting

                    // standard case: navigator.doNotTrack="1" but ignore_dnt=true
                    gdprTest(method + ' tracking is enabled due to ignore_dnt even with the browser DoNotTrack setting (navigator.doNotTrack="1")', {
                        opt_in: true,
                        config: {ignore_dnt: true, window: {navigator: {doNotTrack: '1'}}}
                    });

                    // standard case: navigator.doNotTrack="1"
                    gdprTest(method + ' tracking is disabled by browser DoNotTrack setting (navigator.doNotTrack="1")', {
                        opt_in: false,
                        config: {window: {navigator: {doNotTrack: '1'}}},
                    });

                    // legacy Firefox case: navigator.doNotTrack="yes"
                    gdprTest(method + ' tracking is disabled by browser DoNotTrack setting (navigator.doNotTrack="yes")', {
                        opt_in: false,
                        config: {window: {navigator: {doNotTrack: 'yes'}}},
                    });

                    // legacy Safari case: window.doNotTrack="1"
                    gdprTest(method + ' tracking is disabled by browser DoNotTrack setting (window.doNotTrack="1")', {
                        opt_in: false,
                        config: {window: {doNotTrack: '1'}},
                    });

                    // legacy MSIE/Edge case: navigator.msDoNotTrack="1"
                    gdprTest(method + ' tracking is disabled by browser DoNotTrack setting (navigator.msDoNotTrack="1")', {
                        opt_in: false,
                        config: {window: {navigator: {msDoNotTrack: '1'}}},
                    });
                }

                if (window.localStorage) {
                    gdprTest(method + ' tracking is enabled by opt-out cookie *upgraded* to localStorage', {
                        opt_in: true,
                        config: {opt_out_tracking_persistence_type: 'localStorage'},
                        pre_init: function() {
                            // opt in with 'cookies' as configured persistence type
                            mixpanel.init('gdpr', {opt_out_tracking_persistence_type: 'cookie'}, 'gdpr');
                            mixpanel.gdpr.opt_in_tracking();
                            clearLibInstance(mixpanel.gdpr, /* clear_opt_in_out */ false);
                        }
                    });

                    gdprTest(method + ' tracking is disabled by opt-out cookie *upgraded* to localStorage', {
                        opt_in: false,
                        config: {opt_out_tracking_persistence_type: 'localStorage'},
                        pre_init: function() {
                            // opt out with 'cookies' as configured persistence type
                            mixpanel.init('gdpr', {opt_out_tracking_persistence_type: 'cookie'}, 'gdpr');
                            mixpanel.gdpr.opt_out_tracking();
                            clearLibInstance(mixpanel.gdpr, /* clear_opt_in_out */ false);
                        }
                    });
                }
            }

            gdprTestMethod('track'       , ['event_name', {prop: 'value'}]);
            gdprTestMethod('set'         , ['prop_name' , 'prop_value'   ]);
            gdprTestMethod('set_once'    , ['prop_name' , 'prop_value'   ]);
            gdprTestMethod('increment'   , ['prop_name' , 1              ]);
            gdprTestMethod('append'      , ['prop_name' , 'prop_value'   ]);
            gdprTestMethod('union'       , ['prop_name' , 'prop_value'   ]);
            gdprTestMethod('track_charge', [1           , {prop: 'value'}]);

            test('opt out of cookies', 42, function() {
                var name;

                // test cookie behavior during library init

                // undecided before init:
                mixpanel.init('gdpr', {}, 'gdpr');
                name = mixpanel.gdpr.persistence.name;
                ok(cookie.exists(name), 'cookie should exist');
                clearLibInstance(mixpanel.gdpr);

                // opted-out before init:
                mixpanel.init('gdpr', {}, 'gdpr');
                mixpanel.gdpr.opt_out_tracking();
                clearLibInstance(mixpanel.gdpr, /* clear_opt_in_out */ false);
                mixpanel.init('gdpr', {}, 'gdpr');
                notOk(cookie.exists(name), 'cookie should not exist');
                clearLibInstance(mixpanel.gdpr);

                // opted-in before init:
                mixpanel.init('gdpr', {}, 'gdpr');
                mixpanel.gdpr.opt_in_tracking();
                clearLibInstance(mixpanel.gdpr, /* clear_opt_in_out */ false);
                mixpanel.init('gdpr', {}, 'gdpr');
                ok(cookie.exists(name), 'cookie should exist');
                clearLibInstance(mixpanel.gdpr);

                // test cookie behavior during opt in/out
                mixpanel.init('gdpr', {}, 'gdpr');
                name = mixpanel.gdpr.persistence.name;

                ok(cookie.exists(name), 'cookie should exist');
                mixpanel.gdpr.opt_out_tracking();
                notOk(cookie.exists(name), 'cookie should not exist');
                mixpanel.gdpr.opt_in_tracking();
                ok(cookie.exists(name), 'cookie should exist');

                clearLibInstance(mixpanel.gdpr);

                // test cookie behavior during opt in/out with clear_persistence disabled
                mixpanel.init('gdpr', {}, 'gdpr');
                name = mixpanel.gdpr.persistence.name;

                ok(cookie.exists(name), 'cookie should exist');
                mixpanel.gdpr.opt_out_tracking({clear_persistence: false});
                ok(cookie.exists(name), 'cookie should exist');
                mixpanel.gdpr.opt_in_tracking();
                ok(cookie.exists(name), 'cookie should exist');

                clearLibInstance(mixpanel.gdpr);

                // test cookie behavior during opt in/out with enable_persistence disabled
                mixpanel.init('gdpr', {}, 'gdpr');
                name = mixpanel.gdpr.persistence.name;

                ok(cookie.exists(name), 'cookie should exist');
                mixpanel.gdpr.opt_out_tracking();
                notOk(cookie.exists(name), 'cookie should not exist');
                mixpanel.gdpr.opt_in_tracking({enable_persistence: false});
                notOk(cookie.exists(name), 'cookie should not exist');

                clearLibInstance(mixpanel.gdpr);

                // test cookie behavior with opt-out tracking as default
                // persistence should not be cleared via default opt-out so cookie should initially exist
                mixpanel.init('gdpr', {
                    opt_out_tracking_by_default: true
                }, 'gdpr');
                name = mixpanel.gdpr.persistence.name;

                ok(cookie.exists(name), 'cookie should exist');
                mixpanel.gdpr.opt_in_tracking();
                ok(cookie.exists(name), 'cookie should exist');
                mixpanel.gdpr.opt_out_tracking();
                notOk(cookie.exists(name), 'cookie should not exist');

                clearLibInstance(mixpanel.gdpr);

                // test cookie behavior with opt-out tracking and persistence as default
                mixpanel.init('gdpr', {
                    opt_out_tracking_by_default: true,
                    opt_out_persistence_by_default: true
                }, 'gdpr');
                name = mixpanel.gdpr.persistence.name;

                notOk(cookie.exists(name), 'cookie should not exist');
                mixpanel.gdpr.opt_in_tracking();
                ok(cookie.exists(name), 'cookie should exist');
                mixpanel.gdpr.opt_out_tracking();
                notOk(cookie.exists(name), 'cookie should not exist');

                clearLibInstance(mixpanel.gdpr);

                // test cookie behavior with mp_optout cookie set
                // persistence should not be cleared via default opt-out so cookie should initially exist
                mixpanel._.cookie.set('mp_optout');
                mixpanel.init('gdpr', {}, 'gdpr');
                name = mixpanel.gdpr.persistence.name;

                ok(cookie.exists(name), 'cookie should exist');
                mixpanel.gdpr.opt_in_tracking();
                ok(cookie.exists(name), 'cookie should exist');
                mixpanel.gdpr.opt_out_tracking();
                notOk(cookie.exists(name), 'cookie should not exist');

                mixpanel._.cookie.remove('mp_optout');
                clearLibInstance(mixpanel.gdpr);

                // test cookie behavior during library init with localStorage as persistence type

                // undecided before init:
                mixpanel.init('gdpr', {
                    opt_out_tracking_persistence_type: 'localStorage'
                }, 'gdpr');
                name = mixpanel.gdpr.persistence.name;
                ok(cookie.exists(name), 'cookie should exist');
                clearLibInstance(mixpanel.gdpr);

                // opted-out before init:
                mixpanel.init('gdpr', {
                    opt_out_tracking_persistence_type: 'localStorage'
                }, 'gdpr');
                mixpanel.gdpr.opt_out_tracking();
                clearLibInstance(mixpanel.gdpr, /* clear_opt_in_out */ false);
                mixpanel.init('gdpr', {
                    opt_out_tracking_persistence_type: 'localStorage'
                }, 'gdpr');
                notOk(cookie.exists(name), 'cookie should not exist');
                clearLibInstance(mixpanel.gdpr);

                // opted-in before init:
                mixpanel.init('gdpr', {
                    opt_out_tracking_persistence_type: 'localStorage'
                }, 'gdpr');
                mixpanel.gdpr.opt_in_tracking();
                clearLibInstance(mixpanel.gdpr, /* clear_opt_in_out */ false);
                mixpanel.init('gdpr', {
                    opt_out_tracking_persistence_type: 'localStorage'
                }, 'gdpr');
                ok(cookie.exists(name), 'cookie should exist');
                clearLibInstance(mixpanel.gdpr);

                // test cookie behavior during opt in/out and localStorage as persistence type
                mixpanel.init('gdpr', {
                    opt_out_tracking_persistence_type: 'localStorage'
                }, 'gdpr');
                name = mixpanel.gdpr.persistence.name;

                ok(cookie.exists(name), 'cookie should exist');
                mixpanel.gdpr.opt_out_tracking();
                notOk(cookie.exists(name), 'cookie should not exist');
                mixpanel.gdpr.opt_in_tracking();
                ok(cookie.exists(name), 'cookie should exist');

                clearLibInstance(mixpanel.gdpr);

                // test cookie behavior during opt in/out with localStorage as persistence type and  clear_persistence disabled
                mixpanel.init('gdpr', {
                    opt_out_tracking_persistence_type: 'localStorage'
                }, 'gdpr');
                name = mixpanel.gdpr.persistence.name;

                ok(cookie.exists(name), 'cookie should exist');
                mixpanel.gdpr.opt_out_tracking({clear_persistence: false});
                ok(cookie.exists(name), 'cookie should exist');
                mixpanel.gdpr.opt_in_tracking();
                ok(cookie.exists(name), 'cookie should exist');

                clearLibInstance(mixpanel.gdpr);

                // test cookie behavior during opt in/out with localStorage as persistence type and enable_persistence disabled
                mixpanel.init('gdpr', {
                    opt_out_tracking_persistence_type: 'localStorage'
                }, 'gdpr');
                name = mixpanel.gdpr.persistence.name;

                ok(cookie.exists(name), 'cookie should exist');
                mixpanel.gdpr.opt_out_tracking();
                notOk(cookie.exists(name), 'cookie should not exist');
                mixpanel.gdpr.opt_in_tracking({enable_persistence: false});
                notOk(cookie.exists(name), 'cookie should not exist');

                clearLibInstance(mixpanel.gdpr);

                // test cookie behavior with opt-out as default and localStorage as persistence type
                // persistence should not be cleared via default opt-out so cookie should initially exist
                mixpanel.init('gdpr', {
                    opt_out_tracking_by_default: true,
                    opt_out_tracking_persistence_type: 'localstorage'
                }, 'gdpr');
                name = mixpanel.gdpr.persistence.name;

                ok(cookie.exists(name), 'cookie should exist');
                mixpanel.gdpr.opt_in_tracking();
                ok(cookie.exists(name), 'cookie should exist');
                mixpanel.gdpr.opt_out_tracking();
                notOk(cookie.exists(name), 'cookie should not exist');

                clearLibInstance(mixpanel.gdpr);

                // test cookie behavior with opt-out tracking and persistence as default and localStorage as persistence type
                mixpanel.init('gdpr', {
                    opt_out_tracking_by_default: true,
                    opt_out_persistence_by_default: true,
                    opt_out_tracking_persistence_type: 'localstorage'
                }, 'gdpr');
                name = mixpanel.gdpr.persistence.name;

                notOk(cookie.exists(name), 'cookie should not exist');
                mixpanel.gdpr.opt_in_tracking();
                ok(cookie.exists(name), 'cookie should exist');
                mixpanel.gdpr.opt_out_tracking();
                notOk(cookie.exists(name), 'cookie should not exist');

                clearLibInstance(mixpanel.gdpr);

                // test cookie behavior with mp_optout cookie set and localStorage as persistence type
                // persistence should not be cleared via default opt-out so cookie should initially exist
                mixpanel._.cookie.set('mp_optout');
                mixpanel.init('gdpr', {
                    opt_out_tracking_persistence_type: 'localStorage'
                }, 'gdpr');
                name = mixpanel.gdpr.persistence.name;

                ok(cookie.exists(name), 'cookie should exist');
                mixpanel.gdpr.opt_in_tracking();
                ok(cookie.exists(name), 'cookie should exist');
                mixpanel.gdpr.opt_out_tracking();
                notOk(cookie.exists(name), 'cookie should not exist');

                mixpanel._.cookie.remove('mp_optout');
                clearLibInstance(mixpanel.gdpr);
            });

            if (window.localStorage) {
                test('opt out of localstorage', 42, function() {
                    var name;

                    // test localstorage behavior during library init

                    // undecided before init:
                    mixpanel.init('gdpr', {
                        persistence: 'localStorage'
                    }, 'gdpr');
                    name = mixpanel.gdpr.persistence.name;
                    ok(!!window.localStorage.getItem(name), 'localstorage entry should exist');
                    clearLibInstance(mixpanel.gdpr);

                    // opted-out before init:
                    mixpanel.init('gdpr', {
                        persistence: 'localStorage'
                    }, 'gdpr');
                    mixpanel.gdpr.opt_out_tracking();
                    clearLibInstance(mixpanel.gdpr, /* clear_opt_in_out */ false);
                    mixpanel.init('gdpr', {
                        persistence: 'localStorage'
                    }, 'gdpr');
                    notOk(!!window.localStorage.getItem(name), 'localstorage entry should not exist');
                    clearLibInstance(mixpanel.gdpr);

                    // opted-in before init:
                    mixpanel.init('gdpr', {
                        persistence: 'localStorage'
                    }, 'gdpr');
                    mixpanel.gdpr.opt_in_tracking();
                    clearLibInstance(mixpanel.gdpr, /* clear_opt_in_out */ false);
                    mixpanel.init('gdpr', {
                        persistence: 'localStorage'
                    }, 'gdpr');
                    ok(!!window.localStorage.getItem(name), 'localstorage entry should exist');
                    clearLibInstance(mixpanel.gdpr);

                    // test localstorage behavior during opt in/out
                    mixpanel.init('gdpr', {
                        persistence: 'localStorage'
                    }, 'gdpr');
                    name = mixpanel.gdpr.persistence.name;

                    ok(!!window.localStorage.getItem(name), 'localstorage entry should exist');
                    mixpanel.gdpr.opt_out_tracking();
                    notOk(!!window.localStorage.getItem(name), 'localstorage entry should not exist');
                    mixpanel.gdpr.opt_in_tracking();
                    ok(!!window.localStorage.getItem(name), 'localstorage entry should exist');

                    clearLibInstance(mixpanel.gdpr);

                    // test localstorage behavior during opt in/out with clear_persistence disabled
                    mixpanel.init('gdpr', {
                        persistence: 'localStorage'
                    }, 'gdpr');
                    name = mixpanel.gdpr.persistence.name;

                    ok(!!window.localStorage.getItem(name), 'localstorage entry should exist');
                    mixpanel.gdpr.opt_out_tracking({clear_persistence: false});
                    ok(!!window.localStorage.getItem(name), 'localstorage entry should exist');
                    mixpanel.gdpr.opt_in_tracking();
                    ok(!!window.localStorage.getItem(name), 'localstorage entry should exist');

                    clearLibInstance(mixpanel.gdpr);

                    // test localstorage behavior during opt in/out with enable_persistence disabled
                    mixpanel.init('gdpr', {
                        persistence: 'localStorage'
                    }, 'gdpr');
                    name = mixpanel.gdpr.persistence.name;

                    ok(!!window.localStorage.getItem(name), 'localstorage entry should exist');
                    mixpanel.gdpr.opt_out_tracking();
                    notOk(!!window.localStorage.getItem(name), 'localstorage entry should not exist');
                    mixpanel.gdpr.opt_in_tracking({enable_persistence: false});
                    notOk(!!window.localStorage.getItem(name), 'localstorage entry should not exist');

                    clearLibInstance(mixpanel.gdpr);

                    // test localstorage behavior with opt-out as default
                    // persistence should not be cleared via default opt-out so localstorage entry should initially exist
                    mixpanel.init('gdpr', {
                        persistence: 'localStorage',
                        opt_out_tracking_by_default: true
                    }, 'gdpr');
                    name = mixpanel.gdpr.persistence.name;

                    ok(!!window.localStorage.getItem(name), 'localstorage entry should exist');
                    mixpanel.gdpr.opt_in_tracking();
                    ok(!!window.localStorage.getItem(name), 'localstorage entry should exist');
                    mixpanel.gdpr.opt_out_tracking();
                    notOk(!!window.localStorage.getItem(name), 'localstorage entry should not exist');

                    clearLibInstance(mixpanel.gdpr);

                    // test localstorage behavior with opt-out tracking and persistence as default
                    mixpanel.init('gdpr', {
                        persistence: 'localStorage',
                        opt_out_tracking_by_default: true,
                        opt_out_persistence_by_default: true,
                    }, 'gdpr');
                    name = mixpanel.gdpr.persistence.name;

                    notOk(!!window.localStorage.getItem(name), 'localstorage entry should not exist');
                    mixpanel.gdpr.opt_in_tracking();
                    ok(!!window.localStorage.getItem(name), 'localstorage entry should exist');
                    mixpanel.gdpr.opt_out_tracking();
                    notOk(!!window.localStorage.getItem(name), 'localstorage entry should not exist');

                    clearLibInstance(mixpanel.gdpr);

                    // test localstorage behavior with mp_optout cookie set
                    // persistence should not be cleared via default opt-out so localstorage entry should initially exist
                    mixpanel._.cookie.set('mp_optout');
                    mixpanel.init('gdpr', {
                        persistence: 'localStorage'
                    }, 'gdpr');
                    name = mixpanel.gdpr.persistence.name;

                    ok(!!window.localStorage.getItem(name), 'localstorage entry should exist');
                    mixpanel.gdpr.opt_in_tracking();
                    ok(!!window.localStorage.getItem(name), 'localstorage entry should exist');
                    mixpanel.gdpr.opt_out_tracking();
                    notOk(!!window.localStorage.getItem(name), 'localstorage entry should not exist');

                    mixpanel._.cookie.remove('mp_optout');
                    clearLibInstance(mixpanel.gdpr);

                    // test localstorage behavior during library init with localStorage as persistence type

                    // undecided before init:
                    mixpanel.init('gdpr', {
                        persistence: 'localStorage',
                        opt_out_tracking_persistence_type: 'localStorage'
                    }, 'gdpr');
                    name = mixpanel.gdpr.persistence.name;
                    ok(!!window.localStorage.getItem(name), 'localstorage entry should exist');
                    clearLibInstance(mixpanel.gdpr);

                    // opted-out before init:
                    mixpanel.init('gdpr', {
                        persistence: 'localStorage',
                        opt_out_tracking_persistence_type: 'localStorage'
                    }, 'gdpr');
                    mixpanel.gdpr.opt_out_tracking();
                    clearLibInstance(mixpanel.gdpr, /* clear_opt_in_out */ false);
                    mixpanel.init('gdpr', {
                        persistence: 'localStorage',
                        opt_out_tracking_persistence_type: 'localStorage'
                    }, 'gdpr');
                    notOk(!!window.localStorage.getItem(name), 'localstorage entry should not exist');
                    clearLibInstance(mixpanel.gdpr);

                    // opted-in before init:
                    mixpanel.init('gdpr', {
                        persistence: 'localStorage',
                        opt_out_tracking_persistence_type: 'localStorage'
                    }, 'gdpr');
                    mixpanel.gdpr.opt_in_tracking();
                    clearLibInstance(mixpanel.gdpr, /* clear_opt_in_out */ false);
                    mixpanel.init('gdpr', {
                        persistence: 'localStorage',
                        opt_out_tracking_persistence_type: 'localStorage'
                    }, 'gdpr');
                    ok(!!window.localStorage.getItem(name), 'localstorage entry should exist');
                    clearLibInstance(mixpanel.gdpr);

                    // test localstorage behavior during opt in/out with localStorage as persistence type
                    mixpanel.init('gdpr', {
                        persistence: 'localStorage',
                        opt_out_tracking_persistence_type: 'localStorage'
                    }, 'gdpr');
                    name = mixpanel.gdpr.persistence.name;

                    ok(!!window.localStorage.getItem(name), 'localstorage entry should exist');
                    mixpanel.gdpr.opt_out_tracking();
                    notOk(!!window.localStorage.getItem(name), 'localstorage entry should not exist');
                    mixpanel.gdpr.opt_in_tracking();
                    ok(!!window.localStorage.getItem(name), 'localstorage entry should exist');

                    clearLibInstance(mixpanel.gdpr);

                    // test localstorage behavior during opt in/out with localStorage as persistence type and clear_persistence disabled
                    mixpanel.init('gdpr', {
                        persistence: 'localStorage',
                        opt_out_tracking_persistence_type: 'localStorage'
                    }, 'gdpr');
                    name = mixpanel.gdpr.persistence.name;

                    ok(!!window.localStorage.getItem(name), 'localstorage entry should exist');
                    mixpanel.gdpr.opt_out_tracking({clear_persistence: false});
                    ok(!!window.localStorage.getItem(name), 'localstorage entry should exist');
                    mixpanel.gdpr.opt_in_tracking();
                    ok(!!window.localStorage.getItem(name), 'localstorage entry should exist');

                    clearLibInstance(mixpanel.gdpr);

                    // test localstorage behavior during opt in/out with localStorage as persistence type and enable_persistence disabled
                    mixpanel.init('gdpr', {
                        persistence: 'localStorage',
                        opt_out_tracking_persistence_type: 'localStorage'
                    }, 'gdpr');
                    name = mixpanel.gdpr.persistence.name;

                    ok(!!window.localStorage.getItem(name), 'localstorage entry should exist');
                    mixpanel.gdpr.opt_out_tracking();
                    notOk(!!window.localStorage.getItem(name), 'localstorage entry should not exist');
                    mixpanel.gdpr.opt_in_tracking({enable_persistence: false});
                    notOk(!!window.localStorage.getItem(name), 'localstorage entry should not exist');

                    clearLibInstance(mixpanel.gdpr);

                    // test localstorage behavior with opt-out as default with localStorage as persistence type
                    // persistence should not be cleared via default opt-out so localstorage entry should initially exist
                    mixpanel.init('gdpr', {
                        persistence: 'localStorage',
                        opt_out_tracking_by_default: true,
                        opt_out_tracking_persistence_type: 'localStorage'
                    }, 'gdpr');
                    name = mixpanel.gdpr.persistence.name;

                    ok(!!window.localStorage.getItem(name), 'localstorage entry should exist');
                    mixpanel.gdpr.opt_in_tracking();
                    ok(!!window.localStorage.getItem(name), 'localstorage entry should exist');
                    mixpanel.gdpr.opt_out_tracking();
                    notOk(!!window.localStorage.getItem(name), 'localstorage entry should not exist');

                    clearLibInstance(mixpanel.gdpr);

                    // test localstorage behavior with opt-out tracking and persistence as default and localStorage as persistence type
                    mixpanel.init('gdpr', {
                        persistence: 'localStorage',
                        opt_out_tracking_by_default: true,
                        opt_out_persistence_by_default: true,
                        opt_out_tracking_persistence_type: 'localstorage'
                    }, 'gdpr');
                    name = mixpanel.gdpr.persistence.name;

                    notOk(!!window.localStorage.getItem(name), 'localstorage entry should not exist');
                    mixpanel.gdpr.opt_in_tracking();
                    ok(!!window.localStorage.getItem(name), 'localstorage entry should exist');
                    mixpanel.gdpr.opt_out_tracking();
                    notOk(!!window.localStorage.getItem(name), 'localstorage entry should not exist');

                    clearLibInstance(mixpanel.gdpr);

                    // test localstorage behavior with mp_optout cookie set with localStorage as persistence type
                    // persistence should not be cleared via default opt-out so localstorage entry should initially exist
                    mixpanel._.cookie.set('mp_optout');
                    mixpanel.init('gdpr', {
                        persistence: 'localStorage',
                        opt_out_tracking_persistence_type: 'localStorage'
                    }, 'gdpr');
                    name = mixpanel.gdpr.persistence.name;

                    ok(!!window.localStorage.getItem(name), 'localstorage entry should exist');
                    mixpanel.gdpr.opt_in_tracking();
                    ok(!!window.localStorage.getItem(name), 'localstorage entry should exist');
                    mixpanel.gdpr.opt_out_tracking();
                    notOk(!!window.localStorage.getItem(name), 'localstorage entry should not exist');

                    mixpanel._.cookie.remove('mp_optout');
                    clearLibInstance(mixpanel.gdpr);
                });
            }

            if (document.location.hostname.split('.').length > 1) {
                test("opt in/out cookie cross-subdomain", 28, function() {
                    mixpanel.init('gdpr', {opt_out_tracking_persistence_type: 'cookie'}, 'gdpr');
                    var name = '__mp_opt_in_out_gdpr';

                    function gdprTest(options) {
                        options = _.extend({
                            opt_in: true,                 // true=opt-in, false=opt-out
                            cross_subdomain_cookie: true, // whether the opt in/out cookies are cross-subdomain or not
                        }, options);

                        var cookie_desc = (
                            (options.cross_subdomain_cookie ? 'non-' : '') +
                            'cross-subdomain opt-' +
                            (options.opt_in ? 'in' : 'out') +
                            ' cookie '
                        );

                        mixpanel.gdpr.set_config({cross_subdomain_cookie: options.cross_subdomain_cookie});
                        ok(
                            mixpanel.gdpr.cookie.get_cross_subdomain() == options.cross_subdomain_cookie,
                            cookie_desc + 'should be set to ' + options.cross_subdomain_cookie
                        );

                        mixpanel.gdpr[options.opt_in ? 'opt_in_tracking' : 'opt_out_tracking']();
                        ok(cookie.exists(name), cookie_desc + 'should exist');

                        cookie.remove(name, !options.cross_subdomain_cookie);
                        ok(cookie.exists(name), cookie_desc + 'should still exist after remove');

                        cookie.remove(name, options.cross_subdomain_cookie);
                        notOk(cookie.exists(name), cookie_desc + 'should no longer exist after remove');

                        mixpanel.gdpr[options.opt_in ? 'opt_in_tracking' : 'opt_out_tracking']();
                        ok(cookie.exists(name), cookie_desc + 'should exist');

                        mixpanel.gdpr.clear_opt_in_out_tracking({cross_subdomain_cookie: !options.cross_subdomain_cookie});
                        ok(cookie.exists(name), cookie_desc + 'should still exist after clear');

                        mixpanel.gdpr.clear_opt_in_out_tracking({cross_subdomain_cookie: options.cross_subdomain_cookie});
                        notOk(cookie.exists(name), cookie_desc + 'should no longer exist after clear');
                    }

                    gdprTest({opt_in: false, cross_subdomain_cookie: false});
                    gdprTest({opt_in: false, cross_subdomain_cookie: true});
                    gdprTest({opt_in: true, cross_subdomain_cookie: false});
                    gdprTest({opt_in: true, cross_subdomain_cookie: true});

                    clearLibInstance(mixpanel.gdpr);
                });
            }

            asyncTest("opt out cookie secure http", 1, function() {
                mixpanel.init('gdpr', {opt_out_tracking_persistence_type: 'cookie'}, 'gdpr');
                var cookie_name = '__mp_opt_in_out_gdpr';

                mixpanel.gdpr.clear_opt_in_out_tracking();
                mixpanel.gdpr.set_config({secure_cookie: false});
                mixpanel.gdpr.opt_out_tracking();

                cookie_included(cookie_name, function(resp) {
                    same(resp, 1, "opt-out cookie is included in request to server");
                    clearLibInstance(mixpanel.gdpr);
                    start();
                });
            });

            asyncTest("opt out cookie secure https", 1, function() {
                mixpanel.init('gdpr', {opt_out_tracking_persistence_type: 'cookie'}, 'gdpr');
                var cookie_name = '__mp_opt_in_out_gdpr';

                mixpanel.gdpr.clear_opt_in_out_tracking();
                mixpanel.gdpr.set_config({secure_cookie: true});
                mixpanel.gdpr.opt_out_tracking();

                cookie_included(cookie_name, function(resp) {
                    same(
                        resp,
                        document.location.protocol === "https:" ? 1 : 0,
                        "opt-out cookie is only included in request to server if https"
                    );
                    clearLibInstance(mixpanel.gdpr);
                    start();
                });
            });

            asyncTest("opt in cookie secure http", 1, function() {
                mixpanel.init('gdpr', {opt_out_tracking_persistence_type: 'cookie'}, 'gdpr');
                var cookie_name = '__mp_opt_in_out_gdpr';

                mixpanel.gdpr.clear_opt_in_out_tracking();
                mixpanel.gdpr.set_config({secure_cookie: false});
                mixpanel.gdpr.opt_in_tracking();

                cookie_included(cookie_name, function(resp) {
                    same(resp, 1, "opt-in cookie is included in request to server");
                    clearLibInstance(mixpanel.gdpr);
                    start();
                });
            });

            asyncTest("opt in cookie secure https", 1, function() {
                mixpanel.init('gdpr', {opt_out_tracking_persistence_type: 'cookie'}, 'gdpr');
                var cookie_name = '__mp_opt_in_out_gdpr';

                mixpanel.gdpr.clear_opt_in_out_tracking();
                mixpanel.gdpr.set_config({secure_cookie: true});
                mixpanel.gdpr.opt_in_tracking();

                cookie_included(cookie_name, function(resp) {
                    same(
                        resp,
                        document.location.protocol === "https:" ? 1 : 0,
                        "opt-in cookie is only included in request to server if https"
                    );
                    clearLibInstance(mixpanel.gdpr);
                    start();
                });
            });
        }

        // module tests have the recorder bundled in already, so don't need to test certain things
        const IS_RECORDER_BUNDLED = Boolean(window['__mp_recorder']);
        if (window.MutationObserver) {
            function makeFakeFetchResponse(status, body) {
                body = body || {}
                var response = new Response(JSON.stringify(body), {
                    status: status,
                    headers: {
                        'Content-type': 'application/json'
                    }
                });

                return new Promise(function(resolve) {
                    resolve(response);
                });
            }

            function makeDelayedFetchResponse(status, body, delay) {
                return new Promise(function(resolve) {
                    setTimeout(function() {
                        resolve(makeFakeFetchResponse(status, body));
                    }, delay);
                });
            }

            var recorderSrc = null;
            if (!IS_RECORDER_BUNDLED) {
                recorderSrc = window.MIXPANEL_CUSTOM_LIB_URL.endsWith('.min.js') ?
                    '../build/mixpanel-recorder.min.js':
                    '../build/mixpanel-recorder.js';
            }

            module('recorder', {
                setup: function () {
                    this.token = `RECORDER_TEST_TOKEN`;
                    this.startTime = 1723733423402;
                    this.clock = sinon.useFakeTimers({toFake: [
                        'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval'
                    ]});
                    this.randomStub = sinon.stub(Math, 'random');
                    this.fetchStub = sinon.stub(window, 'fetch');

                    // realistic successful response
                    this.fetchStub.returns(Promise.resolve(new Response(JSON.stringify({code: 200, status: 'OK'}), {
                        status: 200,
                        headers: {
                            'Content-type': 'application/json'
                        }
                    })));

                    this.initMixpanelRecorder = function (extraConfig) {
                        const config = Object.assign({
                            debug: true,
                            record_sessions_percent: 0,
                            recorder_src: recorderSrc
                        }, extraConfig);
                        mixpanel.init(this.token, config, 'recordertest')
                    }

                    this.getRecorderScript = function () {
                        return document.querySelector('script[src="' + recorderSrc + '"]');
                    }

                    this.assertRecorderScript = function (exists) {
                        if (IS_RECORDER_BUNDLED) {
                            ok(true, 'recorder is bundled, so we dont need to check the script')
                        } else if (exists) {
                            ok(this.getRecorderScript() !== null, 'recorder script should exist');
                        } else {
                            same(this.getRecorderScript(), null, 'recorder script should not exist')
                        }
                    }

                    this.waitForFetchCalls = function (numCalls) {
                        return _.bind(function () {
                            return untilDonePromise(_.bind(function () {
                                return this.fetchStub.getCalls().length === numCalls;
                            }, this))
                                .then(function () {
                                    // waits for flush to complete (removing items from the queue after response)
                                    return mixpanel.recordertest.__get_recorder().__flushPromise;
                                });
                        }, this)
                    };

                    this.waitForRecorderEnqueue = function () {
                        // tick to advance the throttle
                        return this.clock.tickAsync(250)
                            .then(function () {
                                // we need to reach in for the __enqueuePromise() instead of just using tickAsync because the enqeueue operation depends on
                                // IndexedDB transactions, so it's not guaranteed to be finished when the fake timer is advanced.
                                return mixpanel.recordertest.__get_recorder().activeRecording.__enqueuePromise;
                            });
                    };

                    this.waitForRecordingStarted = function () {
                        return untilDonePromise(_.bind(function () {
                            return Object.keys(mixpanel.recordertest.get_session_recording_properties()).length > 0;
                        }, this));
                    };

                    this.assertRecorderScript(false);
                    
                    if (IS_RECORDER_BUNDLED) {
                        this.waitForRecorderLoad = function () {
                            this.randomStub.restore();
                            ok(true, 'empty assertion');
                            return this.waitForRecordingStarted();
                        }
                    } else {
                        this.waitForRecorderLoad = function () {
                            return untilDonePromise(_.bind(function () {
                                // the sdk will check IDB if it needs to resume, so we can't synchronously check that the script is there
                                return Boolean(document.querySelector('script[src="' + recorderSrc + '"]'))
                            }, this))
                                .then(_.bind(function () {
                                    this.assertRecorderScript(true);
                                    return new Promise(_.bind(function (resolve) {
                                        this.randomStub.restore();
                                        this.getRecorderScript().addEventListener('load', function() {
                                            resolve();
                                        });
                                    }, this))
                                }, this))
                                .then(_.bind(function () {
                                    return this.waitForRecordingStarted();
                                }, this));
                        };
                    }
                    window.sessionStorage.clear()
                    window.localStorage.clear();
                    clearAllLibInstances();
                    if (window.indexedDB) {
                        this.clearIDB = function () {
                            stop();
                            var allStores = ['mixpanelRecordingEvents', 'mixpanelRecordingRegistry'];
                            // need to increment that version number as our schema changes, maybe set up some consts
                            var openRequest = window.indexedDB.open('mixpanelBrowserDb', 1);
    
                            var isFresh = false;
                            openRequest.onsuccess = function () {
                                if (isFresh) {
                                    start();
                                    return;
                                }

                                var db = openRequest.result;
                                var transaction = db.transaction(allStores, 'readwrite');
                                transaction.oncomplete = function () {
                                    start();
                                }

                                for (var i = 0; i < allStores.length; i++) {
                                    var store = transaction.objectStore(allStores[i]);
                                    store.clear();
                                }
                            }

                            openRequest.onupgradeneeded = function () {
                                isFresh = true; // idb doesn't exist yet, the sdk will make it
                            }
                        };
                    } else {
                        this.clearIDB = function () {};
                    }

                    this.clearIDB();
                },
                teardown: function () {
                    if (mixpanel.recordertest) {
                        mixpanel.recordertest.stop_session_recording();
                        clearLibInstance(mixpanel.recordertest);
                    }

                    this.clearIDB();
                    this.clock.restore();
                    this.randomStub.restore();
                    this.fetchStub.restore();
                    if (this.responseBlobStub) {
                        this.responseBlobStub.restore();
                    }

                    var scriptEl = this.getRecorderScript();
                    if (scriptEl) {
                        scriptEl.parentNode.removeChild(scriptEl);
                    }

                    if (!IS_RECORDER_BUNDLED) {
                        delete window['__mp_recorder'];
                    }
                    window.location.hash = '';
                }
            });

            function validateAndGetUrlParams(fetchStubCall) {
                var calledURL = fetchStubCall.args[0];
                ok(calledURL.startsWith("https://api-js.mixpanel.com/record/"));

                var paramsStr = calledURL.split('?')[1];
                var params = new URLSearchParams(paramsStr);
                same(params.get('distinct_id'), mixpanel.recordertest.get_distinct_id());
                same(params.get('$device_id'), mixpanel.recordertest.get_property('$device_id'));

                return params;
            }

            if (!IS_RECORDER_BUNDLED) {
                asyncTest('adds script tag when sampled', 2, function () {
                    this.randomStub.returns(0.02);
                    this.initMixpanelRecorder({record_sessions_percent: 2});
                    this.waitForRecorderLoad()
                        .then(_.bind(function () {
                            // initial two rrweb captured events: meta and full snapshots
                            return this.waitForRecorderEnqueue();
                        }, this))
                        .then(function() {
                            mixpanel.recordertest.stop_session_recording();
                        })
                        .then(this.waitForFetchCalls(1))
                        .then(function () {
                            // let last flush through so it doesn't leak into next test
                            start();
                        })
                });
    
                asyncTest('does not add script tag when not sampled', 2, function () {
                    this.randomStub.returns(0.02);
                    this.initMixpanelRecorder({record_sessions_percent: 1});

                    realSetTimeout(_.bind(function () {
                        this.assertRecorderScript(false);
                        start();
                    }, this), 100)
                });
            }

            asyncTest('sends recording payload to server', 19, function () {
                // set hash to test $current_url logic without reloading test page
                window.location.hash = 'my-url-1';
                this.randomStub.returns(0.02);
                this.initMixpanelRecorder({record_sessions_percent: 10});

                this.waitForRecorderLoad()
                    .then(_.bind(function () {
                        window.location.hash = 'my-url-2';
                        simulateMouseClick(document.body);
                        return this.waitForRecorderEnqueue();
                    }, this))
                    .then(_.bind(function () {
                        return this.clock.tickAsync(10 * 1000);
                    }, this))
                    .then(this.waitForFetchCalls(1))
                    .then(_.bind(function () {
                        same(this.fetchStub.getCalls().length, 1, 'one batch fetch request made every ten seconds')
                        var fetchCall1 = this.fetchStub.getCall(0);
                        var callArgs = fetchCall1.args;
                        var body = callArgs[1].body;
                        same(body.constructor, Blob, 'request body is a Blob');

                        var urlParams1 = validateAndGetUrlParams(fetchCall1)
                        same(urlParams1.get("seq"), "0")
                        ok(urlParams1.get("$current_url").endsWith('#my-url-1'), 'includes the current url from when we started recording');
                        ok(urlParams1.get("replay_start_url").endsWith('#my-url-1'), 'includes the start url from when we started recording');
                        same(urlParams1.get("mp_lib"), "web");

                        simulateMouseClick(document.body);
                        return this.waitForRecorderEnqueue(1);
                    }, this))
                    .then(_.bind(function () {
                        return this.clock.tickAsync(10 * 1000);
                    }, this))
                    .then(this.waitForFetchCalls(2))
                    .then(_.bind(function () {
                        same(this.fetchStub.getCalls().length, 2, 'one batch fetch request made every ten seconds')
                        var fetchCall2 = this.fetchStub.getCall(1);
                        var callArgs = fetchCall2.args;
                        var body = callArgs[1].body;
                        same(body.constructor, Blob, 'request body is a Blob');
                        
                        var urlParams2 = validateAndGetUrlParams(fetchCall2)
                        same(urlParams2.get("seq"), "1")
                        ok(urlParams2.get("$current_url").endsWith('#my-url-2'), 'url is updated at the start of this batch');
                        ok(urlParams2.get("replay_start_url").endsWith('#my-url-1'), 'start url does not change in later batches');

                        mixpanel.recordertest.stop_session_recording();
                        start();
                    }, this));
            });

            asyncTest('can get replay properties when recording is active', 4, function () {
                this.randomStub.restore();
                this.initMixpanelRecorder();
                same(Object.keys(mixpanel.recordertest.get_session_recording_properties()).length, 0, 'no recording is taking place')
                mixpanel.recordertest.start_session_recording();

                this.waitForRecorderLoad()
                    .then(_.bind(function () {
                        return this.waitForRecorderEnqueue();
                    }, this))
                    .then(_.bind(function () {
                        ok(Boolean(mixpanel.recordertest.get_session_recording_properties()["$mp_replay_id"]), 'replay id is populated in recording properties')
                        mixpanel.recordertest.stop_session_recording();
                        return this.clock.tickAsync(10 * 1000);
                    }, this))
                    .then(this.waitForFetchCalls(1))
                    .then(start)
            });

            asyncTest('can get replay link when recording is active', 8, function () {
                this.randomStub.restore();
                this.initMixpanelRecorder();
                same(mixpanel.recordertest.get_session_replay_url(), null, 'no recording is taking place')

                mixpanel.recordertest.start_session_recording();
                this.waitForRecorderLoad()
                    .then(_.bind(function () {
                        return this.waitForRecorderEnqueue();
                    }, this))
                    .then(_.bind(function () {
                        var replay_url = new URL(mixpanel.recordertest.get_session_replay_url());
                        same(replay_url.hostname, 'mixpanel.com');
                        same(replay_url.pathname, '/projects/replay-redirect');
                        same(replay_url.searchParams.get('token'), this.token)
                        ok(replay_url.searchParams.get('replay_id'))
                        ok(replay_url.searchParams.get('distinct_id'))
                        mixpanel.recordertest.stop_session_recording();
                        return this.clock.tickAsync(10 * 1000);
                    }, this))
                    .then(this.waitForFetchCalls(1))
                    .then(start)
            });

            asyncTest('can manually start a session recording', 6, function () {
                this.randomStub.returns(0.02);
                this.initMixpanelRecorder({record_sessions_percent: 1});
                this.assertRecorderScript(false);
                
                this.clock.tickAsync(20 * 1000)
                    .then(_.bind(function () {
                        same(this.fetchStub.getCalls().length, 0, 'no /record call has been made since the user did not fall into the sample.');
                        mixpanel.recordertest.start_session_recording();
                        return this.waitForRecorderLoad();
                    }, this))
                    .then(_.bind(function () {
                        simulateMouseClick(document.body);
                        return this.waitForRecorderEnqueue();
                    }, this))
                    .then(_.bind(function () {
                        return this.clock.tickAsync(10 * 1000);
                    }, this))
                    .then(this.waitForFetchCalls(1))
                    .then(_.bind(function () {
                        same(this.fetchStub.getCalls().length, 1, 'one batch fetch request made every ten seconds');
                        ok(this.fetchStub.getCall(0).args[0].startsWith("https://api-js.mixpanel.com/record/"));
                        start();
                    }, this));
            });

            asyncTest('can manually stop a session recording', function () {
                this.randomStub.returns(0.02);
                this.initMixpanelRecorder({record_sessions_percent: 10});
                this.waitForRecorderLoad()
                    .then(_.bind(function () {
                        simulateMouseClick(document.body);
                    }, this))
                    .then(_.bind(function () {
                        return this.waitForRecorderEnqueue();
                    }, this))
                    .then(_.bind(function () {
                        return this.clock.tickAsync(10 * 1000);
                    }, this))
                    .then(this.waitForFetchCalls(1))
                    .then(_.bind(function () {
                        var fetchCall1 = this.fetchStub.getCall(0);
                        same(this.fetchStub.getCalls().length, 1, 'one batch fetch request made every ten seconds');
                        ok(fetchCall1.args[0].startsWith("https://api-js.mixpanel.com/record/"));

                        simulateMouseClick(document.body);
                        return this.clock.tickAsync(2 * 1000);
                    }, this))
                    .then(_.bind(function () {
                        return this.waitForRecorderEnqueue();
                    }, this))
                    .then(_.bind(function () {
                        mixpanel.recordertest.stop_session_recording();
                    }, this))
                    .then(this.waitForFetchCalls(2))
                    .then(_.bind(function () {
                        var fetchCall2 = this.fetchStub.getCall(1);
                        if (fetchCall2) {
                            same(this.fetchStub.getCalls().length, 2, 'flushes the events up to the point that the recording was stopped');
                            ok(fetchCall2.args[0].startsWith("https://api-js.mixpanel.com/record/"));

                            simulateMouseClick(document.body);
                            return this.clock.tickAsync(20 * 1000);
                        }
                    }, this))
                    .then(_.bind(function () {
                        realSetTimeout(_.bind(function() {
                            same(this.fetchStub.getCalls().length, 2, 'no more fetch requests after recording is stopped');
                            start();
                        }, this), 2);
                    }, this))
            });

            test('respects tracking opt-out when sampled', 3, function () {
                this.randomStub.returns(0.02);
                this.initMixpanelRecorder({record_sessions_percent: 10, window: {navigator: {doNotTrack: '1'}}});

                this.assertRecorderScript(false);
                same(Object.keys(mixpanel.recordertest.get_session_recording_properties()).length, 0, 'no recording is taking place')
            });

            test('respects tracking opt-out when manually triggered', 4, function () {
                this.randomStub.returns(0.02);
                this.initMixpanelRecorder({record_sessions_percent: 10, window: {navigator: {doNotTrack: '1'}}});

                this.assertRecorderScript(false);
                mixpanel.recordertest.start_session_recording();
                this.assertRecorderScript(false);
                same(Object.keys(mixpanel.recordertest.get_session_recording_properties()).length, 0, 'no recording is taking place')
            });

            asyncTest('respects tracking opt-out after recording started', 5, function () {
                this.randomStub.returns(0.02);
                this.initMixpanelRecorder({record_sessions_percent: 10});

                this.waitForRecorderLoad()
                    .then(_.bind(function () {
                        simulateMouseClick(document.body);
                        return this.waitForRecorderEnqueue();
                    }, this))
                    .then(_.bind(function () {
                        return this.clock.tickAsync(10 * 1000);
                    }, this))
                    .then(this.waitForFetchCalls(1))
                    .then(_.bind(function () {
                        same(this.fetchStub.getCalls().length, 1, 'one batch fetch request made every ten seconds');
                        // queue up more record events, and opt out tracking
                        simulateMouseClick(document.body);
                        return this.clock.tickAsync(2 * 1000);
                    }, this))
                    .then(_.bind(function () {
                        simulateMouseClick(document.body);
                        mixpanel.recordertest.opt_out_tracking();
                        simulateMouseClick(document.body);
                        return this.clock.tickAsync(10 * 1000);
                    }, this))
                    .then(_.bind(function () {
                        return untilDonePromise(function () {
                            return Object.keys(mixpanel.recordertest.get_session_recording_properties()).length === 0;
                        });
                    }, this))
                    .then(_.bind(function () {
                        same(this.fetchStub.getCalls().length, 1, 'no /record calls made after user has opted out.');
                        same(Object.keys(mixpanel.recordertest.get_session_recording_properties()).length, 0, 'no recording is taking place')
                        mixpanel.recordertest.stop_session_recording();
                        start();
                    }, this));
            });
            asyncTest('retries record request after a 500', 17, function () {
                this.randomStub.returns(0.02);
                this.initMixpanelRecorder({record_sessions_percent: 10});
                
                // fake the fetch / response promises since we're testing callback logic
                this.responseBlobStub = sinon.stub(window.Response.prototype, 'blob');
                this.responseBlobStub.returns(Promise.resolve(new Blob()));
                this.fetchStub.onFirstCall()
                    .returns(makeFakeFetchResponse(200))
                    .onSecondCall()
                    .returns(makeFakeFetchResponse(500));

                this.waitForRecorderLoad()
                    .then(_.bind(function () {
                        simulateMouseClick(document.body);
                        return this.waitForRecorderEnqueue();
                    }, this))
                    .then(_.bind(function () {
                        return this.clock.tickAsync(10 * 1000);
                    }, this))
                    .then(this.waitForFetchCalls(1))
                    .then(_.bind(function () {
                        same(this.fetchStub.getCalls().length, 1, 'one batch fetch request made every ten seconds');
                        var urlParams = validateAndGetUrlParams(this.fetchStub.getCall(0));
                        same(urlParams.get("seq"), "0", "sends first sequence");
                        simulateMouseClick(document.body);
                        return this.waitForRecorderEnqueue();
                    }, this))
                    .then(_.bind(function () {
                        return this.clock.tickAsync(10 * 1000);
                    }, this))
                    .then(this.waitForFetchCalls(2))
                    .then(_.bind(function () {
                        same(this.fetchStub.getCalls().length, 2, 'one batch fetch request made every ten seconds');
                        urlParams = validateAndGetUrlParams(this.fetchStub.getCall(1));
                        same(urlParams.get("seq"), "1", "2nd sequence fails");
                        return this.clock.tickAsync(20 * 2000);
                    }, this))
                    .then(this.waitForFetchCalls(3))
                    .then(_.bind(function () {
                        same(this.fetchStub.getCalls().length, 3, 'record request is retried after a 500');
                        validateAndGetUrlParams(this.fetchStub.getCall(2));
                        same(urlParams.get("seq"), "1", "2nd sequence is retried");

                        mixpanel.recordertest.stop_session_recording();
                        start();
                    }, this));
            });

            asyncTest('retries record requests when offline', 12, function () {
                var onlineStub = sinon.stub(window.navigator, 'onLine').value(false);
                // pretend we can't compress so we can compare the events in the fetch request
                var compressionStreamStub = sinon.stub(window, 'CompressionStream').value(undefined);
                
                this.randomStub.returns(0.02);
                this.initMixpanelRecorder({record_sessions_percent: 10});
                
                this.responseBlobStub = sinon.stub(window.Response.prototype, 'blob');
                this.responseBlobStub.returns(Promise.resolve(new Blob()));
                this.fetchStub.onCall(0)
                    .returns(new Promise(function (_resolve, reject) {
                        // simulate offline
                        reject(new TypeError('Failed to fetch'));
                    })) 
                    .onCall(1)
                    .returns(makeFakeFetchResponse(200))


                var fetchBody = null;
                this.waitForRecorderLoad()
                    .then(_.bind(function () {
                        simulateMouseClick(document.body);
                        return this.waitForRecorderEnqueue();
                    }, this))
                    .then(_.bind(function () {
                        return this.clock.tickAsync(10 * 1000);
                    }, this))
                    .then(this.waitForFetchCalls(1))
                    .then(_.bind(function () {
                        same(this.fetchStub.getCalls().length, 1, 'one batch fetch request made every ten seconds');

                        var urlParams = validateAndGetUrlParams(this.fetchStub.getCall(0));
                        same(urlParams.get("seq"), "0", "first sequence fails because we're offline");
                        fetchBody = this.fetchStub.getCall(0).args[1].body;

                        return this.clock.tickAsync(20 * 1000);
                    }, this))
                    .then(this.waitForFetchCalls(2))
                    .then(_.bind(function () {
                        var fetchCall1 = this.fetchStub.getCall(1);
                        urlParams = validateAndGetUrlParams(fetchCall1);
                        same(urlParams.get("seq"), "0", "first sequence is retried with exponential backoff");
                        same(fetchBody, fetchCall1.args[1].body, 'fetch body should be the same as the first request');
                        onlineStub.restore();
                        compressionStreamStub.restore();
                        mixpanel.recordertest.stop_session_recording();

                        start();
                    }, this));
            });

            asyncTest('halves batch size and retries record request after a 413', 25, function () {
                this.randomStub.returns(0.02);
                
                this.blobConstructorSpy = sinon.spy(window, 'Blob')
                this.responseBlobStub = sinon.stub(window.Response.prototype, 'blob');
                this.responseBlobStub.returns(Promise.resolve(new Blob()));

                this.fetchStub.onCall(0)
                    .returns(makeFakeFetchResponse(200))
                    .onCall(1)
                    .returns(makeFakeFetchResponse(413))
                    .onCall(2)
                    .returns(makeFakeFetchResponse(200))
                    .onCall(3)
                    .returns(makeFakeFetchResponse(200))
                
                this.initMixpanelRecorder({record_sessions_percent: 10});

                this.waitForRecorderLoad()
                    .then(_.bind(function () {
                        simulateMouseClick(document.body);
                        return this.waitForRecorderEnqueue();
                    }, this))
                    .then(_.bind(function () {
                        return this.clock.tickAsync(10 * 1000);
                    }, this))
                    .then(this.waitForFetchCalls(1))
                    .then(_.bind(function () {
                        same(this.fetchStub.getCalls().length, 1, 'one batch fetch request made every ten seconds');
                        var urlParams = validateAndGetUrlParams(this.fetchStub.getCall(0));
                        same(urlParams.get("seq"), "0");

                        for  (var _i = 0; _i < 1000; _i++) {
                            simulateMouseClick(document.body);
                        }
                        return this.waitForRecorderEnqueue();
                    }, this))
                    .then(_.bind(function () {
                        return this.clock.tickAsync(10 * 1000);
                    }, this))
                    .then(this.waitForFetchCalls(2))
                    .then(_.bind(function () {
                        same(this.fetchStub.getCalls().length, 2, 'one batch fetch request made every ten seconds');
                        urlParams = validateAndGetUrlParams(this.fetchStub.getCall(1));
                        same(urlParams.get("seq"), "1");

                        var events = JSON.parse(this.blobConstructorSpy.lastCall.args[0][0])
                        same(events.length, 1000);

                        return this.clock.tickAsync(10 * 1000);
                    }, this))
                    .then(this.waitForFetchCalls(4))
                    .then(_.bind(function () {
                        same(this.fetchStub.getCalls().length, 4, 'record request is retried after a 413 and subsequently flushes the rest of events');
                    
                        urlParams = validateAndGetUrlParams(this.fetchStub.getCall(2));
                        same(urlParams.get("seq"), "1");

                        urlParams = validateAndGetUrlParams(this.fetchStub.getCall(3));
                        same(urlParams.get("seq"), "2");

                        var numBlobCalls = this.blobConstructorSpy.getCalls().length
                        // need to look at last 2 calls because rrweb also uses Blob while tracking
                        same(JSON.parse(this.blobConstructorSpy.getCall(numBlobCalls - 2).args[0][0]).length, 500, 'first batch request was halved');
                        same(JSON.parse(this.blobConstructorSpy.getCall(numBlobCalls - 1).args[0][0]).length, 500, 'second batch request was halved');

                        return this.clock.tickAsync(20 * 1000);
                    }, this))
                    .then(_.bind(function () {
                        same(this.fetchStub.getCalls().length, 4, 'all events are flushed, no more requests are made');
                        mixpanel.recordertest.stop_session_recording();
                        this.blobConstructorSpy.restore();
                        start();
                    }, this));
            });

            asyncTest('respects minimum session length setting', function () {
                this.randomStub.returns(0.02);
                this.initMixpanelRecorder({record_sessions_percent: 10, record_min_ms: 8000});

                this.waitForRecorderLoad()
                    .then(_.bind(function () {
                        simulateMouseClick(document.body);
                        return this.waitForRecorderEnqueue();
                    }, this))
                    .then(_.bind(function () {
                        return this.clock.tickAsync(5 * 1000);
                    }, this))
                    .then(_.bind(function () {
                        mixpanel.recordertest.stop_session_recording();
                        return this.clock.tickAsync(5 * 1000);
                    }, this))
                    .then(_.bind(function () {
                        same(this.fetchStub.getCalls().length, 0, 'does not flush events if session is too short');
                        return this.clock.tickAsync(20 * 1000);
                    }, this))
                    .then(_.bind(function () {
                        realSetTimeout(_.bind(function() {
                            same(this.fetchStub.getCalls().length, 0, 'no fetch requests after recording is stopped');
                            start();
                        }, this), 2);
                    }, this));
            });

            asyncTest('continues recording across SDK loads', 15, function () {
                this.randomStub.returns(0.02);
                this.initMixpanelRecorder({record_sessions_percent: 10});

                var replayId;
                this.waitForRecorderLoad()
                    .then(_.bind(function () {
                        mixpanel.recordertest.identify('guy');
                        simulateMouseClick(document.body);
                        return this.waitForRecorderEnqueue();
                    }, this))
                    .then(_.bind(function () {
                        return this.clock.tickAsync(10 * 1000);
                    }, this))
                    .then(this.waitForFetchCalls(1))
                    .then(_.bind(function () {
                        same(this.fetchStub.getCalls().length, 1, 'one batch fetch request made every ten seconds')
                        var fetchCall1 = this.fetchStub.getCall(0);
                        var callArgs = fetchCall1.args;
                        var body = callArgs[1].body;
                        same(body.constructor, Blob, 'request body is a Blob');

                        var urlParams1 = validateAndGetUrlParams(fetchCall1);
                        same(urlParams1.get("seq"), "0");
                        replayId = urlParams1.get("replay_id");

                        // queue up an event that should be flushed on the next load
                        simulateMouseClick(document.body);

                        // simulate a page load: pause recording (it remains as active recording) and clear the SDK
                        mixpanel.recordertest.pause_session_recording();
                        delete mixpanel['recordertest'];
                        window.sessionStorage.removeItem('mp_gen_new_tab_id_recordertest_RECORDER_TEST_TOKEN');

                        if (!IS_RECORDER_BUNDLED) {
                            delete window['__mp_recorder'];
                            document.head.removeChild(document.querySelector('script[src="' + recorderSrc + '"]'))
                        }

                        // some time passes like a page load
                        return this.clock.tickAsync(500);
                    }, this))
                    .then(_.bind(function () {
                        this.initMixpanelRecorder();
                        // don't enable SR this time, it should continue the previous replay
                        return this.waitForRecorderLoad();
                    }, this))
                    .then(_.bind(function () {
                        // we have to wait for the recording registry to get the active recording from IDB
                        return this.waitForRecordingStarted();
                    }, this))
                    .then(_.bind(function () {
                        return this.waitForRecorderEnqueue();
                    }, this))
                    .then(_.bind(function () {
                        return this.clock.tickAsync(10 * 1000);
                    }, this))
                    .then(this.waitForFetchCalls(2))
                    .then(_.bind(function () {
                        same(this.fetchStub.getCalls().length, 2, 'one batch fetch request made every ten seconds')
                        var fetchCall2 = this.fetchStub.getCall(1);
                        
                        var urlParams2 = validateAndGetUrlParams(fetchCall2);
                        same(urlParams2.get("seq"), "1");
                        same(replayId, urlParams2.get("replay_id"));

                        mixpanel.recordertest.stop_session_recording();
                        start();
                    }, this));
            });

            asyncTest('resets after idle timeout', 14, function () {
                this.randomStub.restore();
                this.initMixpanelRecorder({record_idle_timeout_ms: 60 * 1000});
                mixpanel.recordertest.start_session_recording();
                
                // fake the fetch / response promises since we're testing callback logic
                this.responseBlobStub = sinon.stub(window.Response.prototype, 'blob');
                this.responseBlobStub.returns(Promise.resolve(new Blob()));
                this.fetchStub.onFirstCall()
                    .returns(makeFakeFetchResponse(200))
                    .onSecondCall()
                    .returns(makeFakeFetchResponse(200));

                var replayId1 = null;
                this.waitForRecorderLoad()
                    .then(_.bind(function () {
                        return this.waitForRecorderEnqueue();
                    }, this))
                    .then(_.bind(function () {
                        return this.clock.tickAsync(10 * 1000);
                    }, this))
                    .then(this.waitForFetchCalls(1))
                    .then(_.bind(function () {
                        same(this.fetchStub.getCalls().length, 1, 'one batch fetch request made every ten seconds');

                        var urlParams = validateAndGetUrlParams(this.fetchStub.getCall(0));
                        same(urlParams.get('seq'), '0', 'sends first sequence');
                        replayId1 = urlParams.get('replay_id');

                        // long enough to reset due to idle timeout
                        return this.clock.tickAsync(61 * 1000);
                    }, this))
                    .then(_.bind(function () {
                        // a new recording will start after timeout, wait for the first events to enqueue so the next mutation can have the lock
                        return this.waitForRecorderEnqueue();
                    }, this))
                    .then(_.bind(function () {
                        // simulate a mutation event to ensure we don't try sending it until there's a user event
                        document.body.appendChild(document.createElement('div'));
                        return this.waitForRecorderEnqueue();
                    }, this))
                    .then(_.bind(function () {
                        return this.clock.tickAsync(10 * 1000);
                    }, this))
                    .then(_.bind(function () {
                        same(this.fetchStub.getCalls().length, 1, 'still just the one fetch request, mutation is ignored');
                        // mouse click should start flushing a new recording
                        simulateMouseClick(document.body);
                        return this.clock.tickAsync(10 * 1000);
                    }, this))
                    .then(this.waitForFetchCalls(2))
                    .then(_.bind(function () {
                        same(this.fetchStub.getCalls().length, 2, 'starts sending record requests again after user activity');
                        urlParams = validateAndGetUrlParams(this.fetchStub.getCall(1));
                        same(urlParams.get('seq'), '0', 'resets to first sequence');
                        var replayId2 = urlParams.get('replay_id');
                        ok(replayId1 !== replayId2, 'replay id is different after reset');

                        mixpanel.recordertest.stop_session_recording();
                        start();
                    }, this));
            });


            asyncTest('handles race condition where the recording resets while a request is in flight', 16, function () {
                if (!IS_RECORDER_BUNDLED) {
                    this.clock.restore();
                    this.clock = sinon.useFakeTimers(this.startTime, {toFake: [
                        'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval'
                    ]});
                }

                this.randomStub.returns(0.02);

                this.initMixpanelRecorder({record_sessions_percent: 10});
                this.randomStub.restore(); // restore the random stub after script is loaded for batcher uuid dedupe

                this.responseBlobStub = sinon.stub(window.Response.prototype, 'blob');
                this.responseBlobStub.returns(Promise.resolve(new Blob()));
                this.fetchStub.onFirstCall()
                    .returns(makeDelayedFetchResponse(200, {}, 5 * 1000))

                this.fetchStub.callThrough();

                var replayId1;
                this.waitForRecorderLoad()
                    .then(_.bind(function () {
                        return this.waitForRecorderEnqueue();
                    }, this))
                    .then(_.bind(function () {
                        mixpanel.recordertest.stop_session_recording();
                    }, this))
                    .then(this.waitForFetchCalls(1))
                    .then(_.bind(function () {
                        same(this.fetchStub.getCalls().length, 1, 'flushed events after stopping recording');
                        var urlParams = validateAndGetUrlParams(this.fetchStub.getCall(0));
                        same(urlParams.get('seq'), '0', 'sends first sequence');
                        
                        if (!IS_RECORDER_BUNDLED) {
                            same(urlParams.get('replay_start_time'), (this.startTime / 1000).toString(), 'sends the right start time');
                        } else {
                            ok(true, 'cannot test replay_start_time when recorder is bundled, rrweb stores a reference to Date.now at the global level so stubs / fake timers will not work.');
                        }

                        replayId1 = urlParams.get('replay_id');
                        ok(replayId1 !== String(null), "replay id is not null");

                        // start recording again while the first replay's request is in flight
                        mixpanel.recordertest.start_session_recording();
                        return this.waitForRecordingStarted();
                    }, this))
                    .then(_.bind(function () {
                        simulateMouseClick(document.body);
                        return this.waitForRecorderEnqueue();
                    }, this))
                    .then(_.bind(function () {
                        return this.clock.tickAsync(15 * 1000);
                    }, this))
                    .then(this.waitForFetchCalls(2))
                    .then(_.bind(function () {
                        urlParams = validateAndGetUrlParams(this.fetchStub.getCall(1));
                        same(urlParams.get('seq'), '0', 'new replay uses the first sequence');

                        if (!IS_RECORDER_BUNDLED) {
                            var expectedStartTimeMs = this.startTime + 250; // we waited for the first recording to enqueue (250ms throttle) before starting the second one
                            same(urlParams.get('replay_start_time'), (expectedStartTimeMs / 1000).toString(), 'sends the right start time');
                        } else {
                            ok(true, 'cannot test replay_start_time when recorder is bundled, rrweb stores a reference to Date.now at the global level so stubs / fake timers will not work.');
                        }

                        var replayId2 = urlParams.get('replay_id');
                        ok(replayId2 !== String(null), "replay id is not null");
                        ok(replayId1 !== replayId2, 'replay id is different after reset');
                        mixpanel.recordertest.stop_session_recording();
                        start();
                    }, this))
            });
        }
    };
})();
 