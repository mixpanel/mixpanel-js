/* eslint camelcase: "off" */
import Config from './config';
import { _, console, userAgent, window, document, navigator, slice } from './utils';
import { FormTracker, LinkTracker } from './dom-trackers';
import { RequestBatcher } from './request-batcher';
import { MixpanelGroup } from './mixpanel-group';
import { MixpanelPeople } from './mixpanel-people';
import {
    MixpanelPersistence,
    PEOPLE_DISTINCT_ID_KEY,
    ALIAS_ID_KEY
} from './mixpanel-persistence';
import {
    optIn,
    optOut,
    hasOptedIn,
    hasOptedOut,
    clearOptInOut,
    addOptOutCheckMixpanelLib
} from './gdpr-utils';

/*
 * Mixpanel JS Library
 *
 * Copyright 2012, Mixpanel, Inc. All Rights Reserved
 * http://mixpanel.com/
 *
 * Includes portions of Underscore.js
 * http://documentcloud.github.com/underscore/
 * (c) 2011 Jeremy Ashkenas, DocumentCloud Inc.
 * Released under the MIT License.
 */

// ==ClosureCompiler==
// @compilation_level ADVANCED_OPTIMIZATIONS
// @output_file_name mixpanel-2.8.min.js
// ==/ClosureCompiler==

/*
SIMPLE STYLE GUIDE:

this.x === public function
this._x === internal - only use within this file
this.__x === private - only use within the class

Globals should be all caps
*/

var init_type;       // MODULE or SNIPPET loader
var mixpanel_master; // main mixpanel instance / object
var INIT_MODULE  = 0;
var INIT_SNIPPET = 1;

var IDENTITY_FUNC = function(x) {return x;};
var NOOP_FUNC = function() {};

/** @const */ var PRIMARY_INSTANCE_NAME = 'mixpanel';
/** @const */ var PAYLOAD_TYPE_BASE64   = 'base64';
/** @const */ var PAYLOAD_TYPE_JSON     = 'json';
/** @const */ var DEVICE_ID_PREFIX      = '$device:';


/*
 * Dynamic... constants? Is that an oxymoron?
 */
// http://hacks.mozilla.org/2009/07/cross-site-xmlhttprequest-with-cors/
// https://developer.mozilla.org/en-US/docs/DOM/XMLHttpRequest#withCredentials
var USE_FETCH = !_.isUndefined(fetch) && typeof(fetch) === 'function';
var USE_XHR = (window.XMLHttpRequest && 'withCredentials' in new XMLHttpRequest());

// IE<10 does not support cross-origin XHR's but script tags
// with defer won't block window.onload; ENQUEUE_REQUESTS
// should only be true for Opera<12
var ENQUEUE_REQUESTS = !USE_XHR && !USE_FETCH && (userAgent.indexOf('MSIE') === -1) && (userAgent.indexOf('Mozilla') === -1);

// save reference to navigator.sendBeacon so it can be minified
var sendBeacon = null;
if (navigator['sendBeacon']) {
    sendBeacon = function() {
        // late reference to navigator.sendBeacon to allow patching/spying
        return navigator['sendBeacon'].apply(navigator, arguments);
    };
}

var DEFAULT_API_ROUTES = {
    'track': 'track/',
    'engage': 'engage/',
    'groups': 'groups/'
};

/*
 * Module-level globals
 */
var DEFAULT_CONFIG = {
    'api_host':                          'https://api-js.mixpanel.com',
    'api_routes':                        DEFAULT_API_ROUTES,
    'api_method':                        'POST',
    'api_transport':                     'XHR',
    'api_payload_format':                PAYLOAD_TYPE_BASE64,
    'app_host':                          'https://mixpanel.com',
    'cdn':                               'https://cdn.mxpnl.com',
    'cross_site_cookie':                 false,
    'cross_subdomain_cookie':            true,
    'error_reporter':                    NOOP_FUNC,
    'persistence':                       'cookie',
    'persistence_name':                  '',
    'cookie_domain':                     '',
    'cookie_name':                       '',
    'loaded':                            NOOP_FUNC,
    'track_marketing':                   true,
    'track_pageview':                    false,
    'skip_first_touch_marketing':        false,
    'store_google':                      true,
    'save_referrer':                     true,
    'test':                              false,
    'verbose':                           false,
    'img':                               false,
    'debug':                             false,
    'track_links_timeout':               300,
    'cookie_expiration':                 365,
    'upgrade':                           false,
    'disable_persistence':               false,
    'disable_cookie':                    false,
    'secure_cookie':                     false,
    'ip':                                true,
    'opt_out_tracking_by_default':       false,
    'opt_out_persistence_by_default':    false,
    'opt_out_tracking_persistence_type': 'localStorage',
    'opt_out_tracking_cookie_prefix':    null,
    'property_blacklist':                [],
    'xhr_headers':                       {}, // { header: value, header2: value }
    'ignore_dnt':                        false,
    'batch_requests':                    true,
    'batch_size':                        50,
    'batch_flush_interval_ms':           5000,
    'batch_request_timeout_ms':          90000,
    'batch_autostart':                   true,
    'hooks':                             {}
};

var DOM_LOADED = false;

/**
 * Mixpanel Library Object
 * @constructor
 */
var MixpanelLib = function() {};


/**
 * create_mplib(token:string, config:object, name:string)
 *
 * This function is used by the init method of MixpanelLib objects
 * as well as the main initializer at the end of the JSLib (that
 * initializes document.mixpanel as well as any additional instances
 * declared before this file has loaded).
 */
var create_mplib = function(token, config, name) {
    var instance,
        target = (name === PRIMARY_INSTANCE_NAME) ? mixpanel_master : mixpanel_master[name];

    if (target && init_type === INIT_MODULE) {
        instance = target;
    } else {
        if (target && !_.isArray(target)) {
            console.error('You have already initialized ' + name);
            return;
        }
        instance = new MixpanelLib();
    }

    instance._cached_groups = {}; // cache groups in a pool

    instance._init(token, config, name);

    instance['people'] = new MixpanelPeople();
    instance['people']._init(instance);

    if (!instance.get_config('skip_first_touch_marketing')) {
        // We need null UTM params in the object because
        // UTM parameters act as a tuple. If any UTM param
        // is present, then we set all UTM params including
        // empty ones together
        var utm_params = _.info.campaignParams(null);
        var initial_utm_params = {};
        var has_utm = false;
        _.each(utm_params, function(utm_value, utm_key) {
            initial_utm_params['initial_' + utm_key] = utm_value;
            if (utm_value) {
                has_utm = true;
            }
        });
        if (has_utm) {
            instance['people'].set_once(initial_utm_params);
        }
    }

    // if any instance on the page has debug = true, we set the
    // global debug to be true
    Config.DEBUG = Config.DEBUG || instance.get_config('debug');

    // if target is not defined, we called init after the lib already
    // loaded, so there won't be an array of things to execute
    if (!_.isUndefined(target) && _.isArray(target)) {
        // Crunch through the people queue first - we queue this data up &
        // flush on identify, so it's better to do all these operations first
        instance._execute_array.call(instance['people'], target['people']);
        instance._execute_array(target);
    }

    return instance;
};

// Initialization methods

/**
 * This function initializes a new instance of the Mixpanel tracking object.
 * All new instances are added to the main mixpanel object as sub properties (such as
 * mixpanel.library_name) and also returned by this function. To define a
 * second instance on the page, you would call:
 *
 *     mixpanel.init('new token', { your: 'config' }, 'library_name');
 *
 * and use it like so:
 *
 *     mixpanel.library_name.track(...);
 *
 * @param {String} token   Your Mixpanel API token
 * @param {Object} [config]  A dictionary of config options to override. <a href="https://github.com/mixpanel/mixpanel-js/blob/v2.46.0/src/mixpanel-core.js#L88-L127">See a list of default config options</a>.
 * @param {String} [name]    The name for the new mixpanel instance that you want created
 */
MixpanelLib.prototype.init = function (token, config, name) {
    if (_.isUndefined(name)) {
        this.report_error('You must name your new library: init(token, config, name)');
        return;
    }
    if (name === PRIMARY_INSTANCE_NAME) {
        this.report_error('You must initialize the main mixpanel object right after you include the Mixpanel js snippet');
        return;
    }

    var instance = create_mplib(token, config, name);
    mixpanel_master[name] = instance;
    instance._loaded();

    return instance;
};

// mixpanel._init(token:string, config:object, name:string)
//
// This function sets up the current instance of the mixpanel
// library.  The difference between this method and the init(...)
// method is this one initializes the actual instance, whereas the
// init(...) method sets up a new library and calls _init on it.
//
MixpanelLib.prototype._init = function(token, config, name) {
    config = config || {};

    this['__loaded'] = true;
    this['config'] = {};

    var variable_features = {};

    // default to JSON payload for standard mixpanel.com API hosts
    if (!('api_payload_format' in config)) {
        var api_host = config['api_host'] || DEFAULT_CONFIG['api_host'];
        if (api_host.match(/\.mixpanel\.com/)) {
            variable_features['api_payload_format'] = PAYLOAD_TYPE_JSON;
        }
    }

    this.set_config(_.extend({}, DEFAULT_CONFIG, variable_features, config, {
        'name': name,
        'token': token,
        'callback_fn': ((name === PRIMARY_INSTANCE_NAME) ? name : PRIMARY_INSTANCE_NAME + '.' + name) + '._jsc'
    }));

    this['_jsc'] = NOOP_FUNC;

    this.__dom_loaded_queue = [];
    this.__request_queue = [];
    this.__disabled_events = [];
    this._flags = {
        'disable_all_events': false,
        'identify_called': false
    };

    // set up request queueing/batching
    this.request_batchers = {};
    this._batch_requests = this.get_config('batch_requests');
    if (this._batch_requests) {
        if (!_.localStorage.is_supported(true) || (!USE_XHR && !USE_FETCH)) {
            this._batch_requests = false;
            console.log('Turning off Mixpanel request-queueing; needs XHR and localStorage support');
            _.each(this.get_batcher_configs(), function(batcher_config) {
                console.log('Clearing batch queue ' + batcher_config.queue_key);
                _.localStorage.remove(batcher_config.queue_key);
            });
        } else {
            this.init_batchers();
            if (sendBeacon && window.addEventListener) {
                // Before page closes or hides (user tabs away etc), attempt to flush any events
                // queued up via navigator.sendBeacon. Since sendBeacon doesn't report success/failure,
                // events will not be removed from the persistent store; if the site is loaded again,
                // the events will be flushed again on startup and deduplicated on the Mixpanel server
                // side.
                // There is no reliable way to capture only page close events, so we lean on the
                // visibilitychange and pagehide events as recommended at
                // https://developer.mozilla.org/en-US/docs/Web/API/Window/unload_event#usage_notes.
                // These events fire when the user clicks away from the current page/tab, so will occur
                // more frequently than page unload, but are the only mechanism currently for capturing
                // this scenario somewhat reliably.
                var flush_on_unload = _.bind(function() {
                    if (!this.request_batchers.events.stopped) {
                        this.request_batchers.events.flush({unloading: true});
                    }
                }, this);
                window.addEventListener('pagehide', function(ev) {
                    if (ev['persisted']) {
                        flush_on_unload();
                    }
                });
                window.addEventListener('visibilitychange', function() {
                    if (document['visibilityState'] === 'hidden') {
                        flush_on_unload();
                    }
                });
            }
        }
    }

    this['persistence'] = this['cookie'] = new MixpanelPersistence(this['config']);
    this.unpersisted_superprops = {};
    this._gdpr_init();

    var uuid = _.UUID();
    if (!this.get_distinct_id()) {
        // There is no need to set the distinct id
        // or the device id if something was already stored
        // in the persitence
        this.register_once({
            'distinct_id': DEVICE_ID_PREFIX + uuid,
            '$device_id': uuid
        }, '');
    }

    if (this.get_config('track_pageview')) {
        this.track_pageview();
    }
};

// Private methods

MixpanelLib.prototype._loaded = function() {
    this.get_config('loaded')(this);
    this._set_default_superprops();
};

// update persistence with info on referrer, UTM params, etc
MixpanelLib.prototype._set_default_superprops = function() {
    this['persistence'].update_search_keyword(document.referrer);
    if (this.get_config('store_google')) {
        this.register(_.info.campaignParams());
    }
    if (this.get_config('save_referrer')) {
        this['persistence'].update_referrer_info(document.referrer);
    }
};

MixpanelLib.prototype._dom_loaded = function() {
    _.each(this.__dom_loaded_queue, function(item) {
        this._track_dom.apply(this, item);
    }, this);

    if (!this.has_opted_out_tracking()) {
        _.each(this.__request_queue, function(item) {
            this._send_request.apply(this, item);
        }, this);
    }

    delete this.__dom_loaded_queue;
    delete this.__request_queue;
};

MixpanelLib.prototype._track_dom = function(DomClass, args) {
    if (this.get_config('img')) {
        this.report_error('You can\'t use DOM tracking functions with img = true.');
        return false;
    }

    if (!DOM_LOADED) {
        this.__dom_loaded_queue.push([DomClass, args]);
        return false;
    }

    var dt = new DomClass().init(this);
    return dt.track.apply(dt, args);
};

/**
 * _prepare_callback() should be called by callers of _send_request for use
 * as the callback argument.
 *
 * If there is no callback, this returns null.
 * If we are going to make XHR/XDR requests, this returns a function.
 * If we are going to use script tags, this returns a string to use as the
 * callback GET param.
 */
MixpanelLib.prototype._prepare_callback = function(callback, data) {
    if (_.isUndefined(callback)) {
        return null;
    }

    if (USE_XHR || USE_FETCH) {
        var callback_function = function(response) {
            callback(response, data);
        };
        return callback_function;
    } else {
        // if the user gives us a callback, we store as a random
        // property on this instances jsc function and update our
        // callback string to reflect that.
        var jsc = this['_jsc'];
        var randomized_cb = '' + Math.floor(Math.random() * 100000000);
        var callback_string = this.get_config('callback_fn') + '[' + randomized_cb + ']';
        jsc[randomized_cb] = function(response) {
            delete jsc[randomized_cb];
            callback(response, data);
        };
        return callback_string;
    }
};

MixpanelLib.prototype._send_request = function(url, data, options, callback) {
    var succeeded = true;

    if (ENQUEUE_REQUESTS) {
        this.__request_queue.push(arguments);
        return succeeded;
    }

    var DEFAULT_OPTIONS = {
        method: this.get_config('api_method'),
        transport: this.get_config('api_transport'),
        verbose: this.get_config('verbose')
    };
    var body_data = null;

    if (!callback && (_.isFunction(options) || typeof options === 'string')) {
        callback = options;
        options = null;
    }
    options = _.extend(DEFAULT_OPTIONS, options || {});
    if (!USE_XHR && !USE_FETCH) {
        options.method = 'GET';
    }
    var use_post = options.method === 'POST';
    var use_sendBeacon = sendBeacon && use_post && options.transport.toLowerCase() === 'sendbeacon';

    // needed to correctly format responses
    var verbose_mode = options.verbose;
    if (data['verbose']) { verbose_mode = true; }

    if (this.get_config('test')) { data['test'] = 1; }
    if (verbose_mode) { data['verbose'] = 1; }
    if (this.get_config('img')) { data['img'] = 1; }
    if (!USE_XHR && !USE_FETCH) {
        if (callback) {
            data['callback'] = callback;
        } else if (verbose_mode || this.get_config('test')) {
            // Verbose output (from verbose mode, or an error in test mode) is a json blob,
            // which by itself is not valid javascript. Without a callback, this verbose output will
            // cause an error when returned via jsonp, so we force a no-op callback param.
            // See the ECMA script spec: http://www.ecma-international.org/ecma-262/5.1/#sec-12.4
            data['callback'] = '(function(){})';
        }
    }

    data['ip'] = this.get_config('ip')?1:0;
    data['_'] = new Date().getTime().toString();

    if (use_post) {
        body_data = 'data=' + encodeURIComponent(data['data']);
        delete data['data'];
    }

    url += '?' + _.HTTPBuildQuery(data);

    var lib = this;
    if ('img' in data) {
        var img = document.createElement('img');
        img.src = url;
        document.body.appendChild(img);
    } else if (use_sendBeacon) {
        try {
            succeeded = sendBeacon(url, body_data);
        } catch (e) {
            lib.report_error(e);
            succeeded = false;
        }
        try {
            if (callback) {
                callback(succeeded ? 1 : 0);
            }
        } catch (e) {
            lib.report_error(e);
        }
    } else if (USE_XHR) {
        try {
            var req = new XMLHttpRequest();
            req.open(options.method, url, true);

            var headers = this.get_config('xhr_headers');
            if (use_post) {
                headers['Content-Type'] = 'application/x-www-form-urlencoded';
            }
            _.each(headers, function(headerValue, headerName) {
                req.setRequestHeader(headerName, headerValue);
            });

            if (options.timeout_ms && typeof req.timeout !== 'undefined') {
                req.timeout = options.timeout_ms;
                var start_time = new Date().getTime();
            }

            // send the mp_optout cookie
            // withCredentials cannot be modified until after calling .open on Android and Mobile Safari
            req.withCredentials = true;
            req.onreadystatechange = function () {
                if (req.readyState === 4) { // XMLHttpRequest.DONE == 4, except in safari 4
                    if (req.status === 200) {
                        if (callback) {
                            if (verbose_mode) {
                                var response;
                                try {
                                    response = _.JSONDecode(req.responseText);
                                } catch (e) {
                                    lib.report_error(e);
                                    if (options.ignore_json_errors) {
                                        response = req.responseText;
                                    } else {
                                        return;
                                    }
                                }
                                callback(response);
                            } else {
                                callback(Number(req.responseText));
                            }
                        }
                    } else {
                        var error;
                        if (
                            req.timeout &&
                            !req.status &&
                            new Date().getTime() - start_time >= req.timeout
                        ) {
                            error = 'timeout';
                        } else {
                            error = 'Bad HTTP status: ' + req.status + ' ' + req.statusText;
                        }
                        lib.report_error(error);
                        if (callback) {
                            if (verbose_mode) {
                                callback({status: 0, error: error, xhr_req: req});
                            } else {
                                callback(0);
                            }
                        }
                    }
                }
            };
            req.send(body_data);
        } catch (e) {
            lib.report_error(e);
            succeeded = false;
        }
    } else if (USE_FETCH) {
        try {
            var xhr_headers = this.get_config('xhr_headers');
            if (use_post) {
                xhr_headers['Content-Type'] = 'application/x-www-form-urlencoded';
            }

            var fetchOpts = {
                method: options.method,
                mode: 'cors',
                credentials: 'include',
                headers: xhr_headers,
                body: body_data
            };

            fetch(url, fetchOpts)
                .then(function (response) {
                    return response.text().then(function (body) {
                        return {
                            status: response.status,
                            statusText: response.statusText,
                            headers: response.headers,
                            body: body
                        };
                    });
                })
                .then(function (res) {
                    if (res.status === 200) {
                        if (callback) {
                            var body = res.body;
                            if (verbose_mode) {
                                var response;
                                try {
                                    response = _.JSONDecode(body);
                                } catch (e) {
                                    lib.report_error(e);
                                    if (options.ignore_json_errors) {
                                        response = body;
                                    } else {
                                        return;
                                    }
                                }
                                callback(response);
                            } else {
                                callback(Number(body));
                            }
                        }
                    } else {
                        var error = 'Bad HTTP status: ' + res.status + ' ' + res.statusText;
                        lib.report_error(error);

                        if (callback) {
                            if (verbose_mode) {
                                var xhr_req = { status: res.status, responseHeaders: res.headers };
                                callback({ status: 0, error: error, xhr_req: xhr_req });
                            } else {
                                callback(0);
                            }
                        }
                    }
                });
        } catch (e) {
            lib.report_error(e);
            succeeded = false;
        }
    } else {
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.async = true;
        script.defer = true;
        script.src = url;
        var s = document.getElementsByTagName('script')[0];
        s.parentNode.insertBefore(script, s);
    }

    return succeeded;
};

/**
 * _execute_array() deals with processing any mixpanel function
 * calls that were called before the Mixpanel library were loaded
 * (and are thus stored in an array so they can be called later)
 *
 * Note: we fire off all the mixpanel function calls && user defined
 * functions BEFORE we fire off mixpanel tracking calls. This is so
 * identify/register/set_config calls can properly modify early
 * tracking calls.
 *
 * @param {Array} array
 */
MixpanelLib.prototype._execute_array = function(array) {
    var fn_name, alias_calls = [], other_calls = [], tracking_calls = [];
    _.each(array, function(item) {
        if (item) {
            fn_name = item[0];
            if (_.isArray(fn_name)) {
                tracking_calls.push(item); // chained call e.g. mixpanel.get_group().set()
            } else if (typeof(item) === 'function') {
                item.call(this);
            } else if (_.isArray(item) && fn_name === 'alias') {
                alias_calls.push(item);
            } else if (_.isArray(item) && fn_name.indexOf('track') !== -1 && typeof(this[fn_name]) === 'function') {
                tracking_calls.push(item);
            } else {
                other_calls.push(item);
            }
        }
    }, this);

    var execute = function(calls, context) {
        _.each(calls, function(item) {
            if (_.isArray(item[0])) {
                // chained call
                var caller = context;
                _.each(item, function(call) {
                    caller = caller[call[0]].apply(caller, call.slice(1));
                });
            } else {
                this[item[0]].apply(this, item.slice(1));
            }
        }, context);
    };

    execute(alias_calls, this);
    execute(other_calls, this);
    execute(tracking_calls, this);
};

// request queueing utils

MixpanelLib.prototype.are_batchers_initialized = function() {
    return !!this.request_batchers.events;
};

MixpanelLib.prototype.get_batcher_configs = function() {
    var queue_prefix = '__mpq_' + this.get_config('token');
    var api_routes = this.get_config('api_routes');
    this._batcher_configs = this._batcher_configs || {
        events: {type: 'events', endpoint: '/' + api_routes['track'], queue_key: queue_prefix + '_ev'},
        people: {type: 'people', endpoint: '/' + api_routes['engage'], queue_key: queue_prefix + '_pp'},
        groups: {type: 'groups', endpoint: '/' + api_routes['groups'], queue_key: queue_prefix + '_gr'}
    };
    return this._batcher_configs;
};

MixpanelLib.prototype.init_batchers = function() {
    if (!this.are_batchers_initialized()) {
        var batcher_for = _.bind(function(attrs) {
            return new RequestBatcher(
                attrs.queue_key,
                {
                    libConfig: this['config'],
                    sendRequestFunc: _.bind(function(data, options, cb) {
                        this._send_request(
                            this.get_config('api_host') + attrs.endpoint,
                            this._encode_data_for_request(data),
                            options,
                            this._prepare_callback(cb, data)
                        );
                    }, this),
                    beforeSendHook: _.bind(function(item) {
                        return this._run_hook('before_send_' + attrs.type, item);
                    }, this),
                    errorReporter: this.get_config('error_reporter'),
                    stopAllBatchingFunc: _.bind(this.stop_batch_senders, this)
                }
            );
        }, this);
        var batcher_configs = this.get_batcher_configs();
        this.request_batchers = {
            events: batcher_for(batcher_configs.events),
            people: batcher_for(batcher_configs.people),
            groups: batcher_for(batcher_configs.groups)
        };
    }
    if (this.get_config('batch_autostart')) {
        this.start_batch_senders();
    }
};

MixpanelLib.prototype.start_batch_senders = function() {
    this._batchers_were_started = true;
    if (this.are_batchers_initialized()) {
        this._batch_requests = true;
        _.each(this.request_batchers, function(batcher) {
            batcher.start();
        });
    }
};

MixpanelLib.prototype.stop_batch_senders = function() {
    this._batch_requests = false;
    _.each(this.request_batchers, function(batcher) {
        batcher.stop();
        batcher.clear();
    });
};

/**
 * push() keeps the standard async-array-push
 * behavior around after the lib is loaded.
 * This is only useful for external integrations that
 * do not wish to rely on our convenience methods
 * (created in the snippet).
 *
 * ### Usage:
 *     mixpanel.push(['register', { a: 'b' }]);
 *
 * @param {Array} item A [function_name, args...] array to be executed
 */
MixpanelLib.prototype.push = function(item) {
    this._execute_array([item]);
};

/**
 * Disable events on the Mixpanel object. If passed no arguments,
 * this function disables tracking of any event. If passed an
 * array of event names, those events will be disabled, but other
 * events will continue to be tracked.
 *
 * Note: this function does not stop other mixpanel functions from
 * firing, such as register() or people.set().
 *
 * @param {Array} [events] An array of event names to disable
 */
MixpanelLib.prototype.disable = function(events) {
    if (typeof(events) === 'undefined') {
        this._flags.disable_all_events = true;
    } else {
        this.__disabled_events = this.__disabled_events.concat(events);
    }
};

MixpanelLib.prototype._encode_data_for_request = function(data) {
    var encoded_data = _.JSONEncode(data);
    if (this.get_config('api_payload_format') === PAYLOAD_TYPE_BASE64) {
        encoded_data = _.base64Encode(encoded_data);
    }
    return {'data': encoded_data};
};

// internal method for handling track vs batch-enqueue logic
MixpanelLib.prototype._track_or_batch = function(options, callback) {
    var truncated_data = _.truncate(options.data, 255);
    var endpoint = options.endpoint;
    var batcher = options.batcher;
    var should_send_immediately = options.should_send_immediately;
    var send_request_options = options.send_request_options || {};
    callback = callback || NOOP_FUNC;

    var request_enqueued_or_initiated = true;
    var send_request_immediately = _.bind(function() {
        if (!send_request_options.skip_hooks) {
            truncated_data = this._run_hook('before_send_' + options.type, truncated_data);
        }
        if (truncated_data) {
            console.log('MIXPANEL REQUEST:');
            console.log(truncated_data);
            return this._send_request(
                endpoint,
                this._encode_data_for_request(truncated_data),
                send_request_options,
                this._prepare_callback(callback, truncated_data)
            );
        } else {
            return null;
        }
    }, this);

    if (this._batch_requests && !should_send_immediately) {
        batcher.enqueue(truncated_data, function(succeeded) {
            if (succeeded) {
                callback(1, truncated_data);
            } else {
                send_request_immediately();
            }
        });
    } else {
        request_enqueued_or_initiated = send_request_immediately();
    }

    return request_enqueued_or_initiated && truncated_data;
};

/**
 * Track an event. This is the most important and
 * frequently used Mixpanel function.
 *
 * ### Usage:
 *
 *     // track an event named 'Registered'
 *     mixpanel.track('Registered', {'Gender': 'Male', 'Age': 21});
 *
 *     // track an event using navigator.sendBeacon
 *     mixpanel.track('Left page', {'duration_seconds': 35}, {transport: 'sendBeacon'});
 *
 * To track link clicks or form submissions, see track_links() or track_forms().
 *
 * @param {String} event_name The name of the event. This can be anything the user does - 'Button Click', 'Sign Up', 'Item Purchased', etc.
 * @param {Object} [properties] A set of properties to include with the event you're sending. These describe the user who did the event or details about the event itself.
 * @param {Object} [options] Optional configuration for this track request.
 * @param {String} [options.transport] Transport method for network request ('xhr' or 'sendBeacon').
 * @param {Boolean} [options.send_immediately] Whether to bypass batching/queueing and send track request immediately.
 * @param {Function} [callback] If provided, the callback function will be called after tracking the event.
 * @returns {Boolean|Object} If the tracking request was successfully initiated/queued, an object
 * with the tracking payload sent to the API server is returned; otherwise false.
 */
MixpanelLib.prototype.track = addOptOutCheckMixpanelLib(function(event_name, properties, options, callback) {
    if (!callback && typeof options === 'function') {
        callback = options;
        options = null;
    }
    options = options || {};
    var transport = options['transport']; // external API, don't minify 'transport' prop
    if (transport) {
        options.transport = transport; // 'transport' prop name can be minified internally
    }
    var should_send_immediately = options['send_immediately'];
    if (typeof callback !== 'function') {
        callback = NOOP_FUNC;
    }

    if (_.isUndefined(event_name)) {
        this.report_error('No event name provided to mixpanel.track');
        return;
    }

    if (this._event_is_disabled(event_name)) {
        callback(0);
        return;
    }

    // set defaults
    properties = _.extend({}, properties);
    properties['token'] = this.get_config('token');

    // set $duration if time_event was previously called for this event
    var start_timestamp = this['persistence'].remove_event_timer(event_name);
    if (!_.isUndefined(start_timestamp)) {
        var duration_in_ms = new Date().getTime() - start_timestamp;
        properties['$duration'] = parseFloat((duration_in_ms / 1000).toFixed(3));
    }

    this._set_default_superprops();

    var marketing_properties = this.get_config('track_marketing')
        ? _.info.marketingParams()
        : {};

    // note: extend writes to the first object, so lets make sure we
    // don't write to the persistence properties object and info
    // properties object by passing in a new object

    // update properties with pageview info and super-properties
    properties = _.extend(
        {},
        _.info.properties(),
        marketing_properties,
        this['persistence'].properties(),
        this.unpersisted_superprops,
        properties
    );

    var property_blacklist = this.get_config('property_blacklist');
    if (_.isArray(property_blacklist)) {
        _.each(property_blacklist, function(blacklisted_prop) {
            delete properties[blacklisted_prop];
        });
    } else {
        this.report_error('Invalid value for property_blacklist config: ' + property_blacklist);
    }

    var data = {
        'event': event_name,
        'properties': properties
    };
    var ret = this._track_or_batch({
        type: 'events',
        data: data,
        endpoint: this.get_config('api_host') + '/' + this.get_config('api_routes')['track'],
        batcher: this.request_batchers.events,
        should_send_immediately: should_send_immediately,
        send_request_options: options
    }, callback);

    return ret;
});

/**
 * Register the current user into one/many groups.
 *
 * ### Usage:
 *
 *      mixpanel.set_group('company', ['mixpanel', 'google']) // an array of IDs
 *      mixpanel.set_group('company', 'mixpanel')
 *      mixpanel.set_group('company', 128746312)
 *
 * @param {String} group_key Group key
 * @param {Array|String|Number} group_ids An array of group IDs, or a singular group ID
 * @param {Function} [callback] If provided, the callback will be called after tracking the event.
 *
 */
MixpanelLib.prototype.set_group = addOptOutCheckMixpanelLib(function(group_key, group_ids, callback) {
    if (!_.isArray(group_ids)) {
        group_ids = [group_ids];
    }
    var prop = {};
    prop[group_key] = group_ids;
    this.register(prop);
    return this['people'].set(group_key, group_ids, callback);
});

/**
 * Add a new group for this user.
 *
 * ### Usage:
 *
 *      mixpanel.add_group('company', 'mixpanel')
 *
 * @param {String} group_key Group key
 * @param {*} group_id A valid Mixpanel property type
 * @param {Function} [callback] If provided, the callback will be called after tracking the event.
 */
MixpanelLib.prototype.add_group = addOptOutCheckMixpanelLib(function(group_key, group_id, callback) {
    var old_values = this.get_property(group_key);
    var prop = {};
    if (old_values === undefined) {
        prop[group_key] = [group_id];
        this.register(prop);
    } else {
        if (old_values.indexOf(group_id) === -1) {
            old_values.push(group_id);
            prop[group_key] = old_values;
            this.register(prop);
        }
    }
    return this['people'].union(group_key, group_id, callback);
});

/**
 * Remove a group from this user.
 *
 * ### Usage:
 *
 *      mixpanel.remove_group('company', 'mixpanel')
 *
 * @param {String} group_key Group key
 * @param {*} group_id A valid Mixpanel property type
 * @param {Function} [callback] If provided, the callback will be called after tracking the event.
 */
MixpanelLib.prototype.remove_group = addOptOutCheckMixpanelLib(function(group_key, group_id, callback) {
    var old_value = this.get_property(group_key);
    // if the value doesn't exist, the persistent store is unchanged
    if (old_value !== undefined) {
        var idx = old_value.indexOf(group_id);
        if (idx > -1) {
            old_value.splice(idx, 1);
            this.register({group_key: old_value});
        }
        if (old_value.length === 0) {
            this.unregister(group_key);
        }
    }
    return this['people'].remove(group_key, group_id, callback);
});

/**
 * Track an event with specific groups.
 *
 * ### Usage:
 *
 *      mixpanel.track_with_groups('purchase', {'product': 'iphone'}, {'University': ['UCB', 'UCLA']})
 *
 * @param {String} event_name The name of the event (see `mixpanel.track()`)
 * @param {Object=} properties A set of properties to include with the event you're sending (see `mixpanel.track()`)
 * @param {Object=} groups An object mapping group name keys to one or more values
 * @param {Function} [callback] If provided, the callback will be called after tracking the event.
 */
MixpanelLib.prototype.track_with_groups = addOptOutCheckMixpanelLib(function(event_name, properties, groups, callback) {
    var tracking_props = _.extend({}, properties || {});
    _.each(groups, function(v, k) {
        if (v !== null && v !== undefined) {
            tracking_props[k] = v;
        }
    });
    return this.track(event_name, tracking_props, callback);
});

MixpanelLib.prototype._create_map_key = function (group_key, group_id) {
    return group_key + '_' + JSON.stringify(group_id);
};

MixpanelLib.prototype._remove_group_from_cache = function (group_key, group_id) {
    delete this._cached_groups[this._create_map_key(group_key, group_id)];
};

/**
 * Look up reference to a Mixpanel group
 *
 * ### Usage:
 *
 *       mixpanel.get_group(group_key, group_id)
 *
 * @param {String} group_key Group key
 * @param {Object} group_id A valid Mixpanel property type
 * @returns {Object} A MixpanelGroup identifier
 */
MixpanelLib.prototype.get_group = function (group_key, group_id) {
    var map_key = this._create_map_key(group_key, group_id);
    var group = this._cached_groups[map_key];
    if (group === undefined || group._group_key !== group_key || group._group_id !== group_id) {
        group = new MixpanelGroup();
        group._init(this, group_key, group_id);
        this._cached_groups[map_key] = group;
    }
    return group;
};

/**
 * Track a default Mixpanel page view event, which includes extra default event properties to
 * improve page view data. The `config.track_pageview` option for <a href="#mixpanelinit">mixpanel.init()</a>
 * may be turned on for tracking page loads automatically.
 *
 * ### Usage
 *
 *     // track a default $mp_web_page_view event
 *     mixpanel.track_pageview();
 *
 *     // track a page view event with additional event properties
 *     mixpanel.track_pageview({'ab_test_variant': 'card-layout-b'});
 *
 *     // example approach to track page views on different page types as event properties
 *     mixpanel.track_pageview({'page': 'pricing'});
 *     mixpanel.track_pageview({'page': 'homepage'});
 *
 *     // UNCOMMON: Tracking a page view event with a custom event_name option. NOT expected to be used for
 *     // individual pages on the same site or product. Use cases for custom event_name may be page
 *     // views on different products or internal applications that are considered completely separate
 *     mixpanel.track_pageview({'page': 'customer-search'}, {'event_name': '[internal] Admin Page View'});
 *
 * @param {Object} [properties] An optional set of additional properties to send with the page view event
 * @param {Object} [options] Page view tracking options
 * @param {String} [options.event_name] - Alternate name for the tracking event
 * @returns {Boolean|Object} If the tracking request was successfully initiated/queued, an object
 * with the tracking payload sent to the API server is returned; otherwise false.
 */
MixpanelLib.prototype.track_pageview = addOptOutCheckMixpanelLib(function(properties, options) {
    if (typeof properties !== 'object') {
        properties = {};
    }
    options = options || {};
    var event_name = options['event_name'] || '$mp_web_page_view';

    var default_page_properties = _.extend(
        _.info.mpPageViewProperties(),
        _.info.campaignParams(),
        _.info.clickParams()
    );

    var event_properties = _.extend(
        {},
        default_page_properties,
        properties
    );

    return this.track(event_name, event_properties);
});

/**
 * Track clicks on a set of document elements. Selector must be a
 * valid query. Elements must exist on the page at the time track_links is called.
 *
 * ### Usage:
 *
 *     // track click for link id #nav
 *     mixpanel.track_links('#nav', 'Clicked Nav Link');
 *
 * ### Notes:
 *
 * This function will wait up to 300 ms for the Mixpanel
 * servers to respond. If they have not responded by that time
 * it will head to the link without ensuring that your event
 * has been tracked.  To configure this timeout please see the
 * set_config() documentation below.
 *
 * If you pass a function in as the properties argument, the
 * function will receive the DOMElement that triggered the
 * event as an argument.  You are expected to return an object
 * from the function; any properties defined on this object
 * will be sent to mixpanel as event properties.
 *
 * @type {Function}
 * @param {Object|String} query A valid DOM query, element or jQuery-esque list
 * @param {String} event_name The name of the event to track
 * @param {Object|Function} [properties] A properties object or function that returns a dictionary of properties when passed a DOMElement
 */
MixpanelLib.prototype.track_links = function() {
    return this._track_dom.call(this, LinkTracker, arguments);
};

/**
 * Track form submissions. Selector must be a valid query.
 *
 * ### Usage:
 *
 *     // track submission for form id 'register'
 *     mixpanel.track_forms('#register', 'Created Account');
 *
 * ### Notes:
 *
 * This function will wait up to 300 ms for the mixpanel
 * servers to respond, if they have not responded by that time
 * it will head to the link without ensuring that your event
 * has been tracked.  To configure this timeout please see the
 * set_config() documentation below.
 *
 * If you pass a function in as the properties argument, the
 * function will receive the DOMElement that triggered the
 * event as an argument.  You are expected to return an object
 * from the function; any properties defined on this object
 * will be sent to mixpanel as event properties.
 *
 * @type {Function}
 * @param {Object|String} query A valid DOM query, element or jQuery-esque list
 * @param {String} event_name The name of the event to track
 * @param {Object|Function} [properties] This can be a set of properties, or a function that returns a set of properties after being passed a DOMElement
 */
MixpanelLib.prototype.track_forms = function() {
    return this._track_dom.call(this, FormTracker, arguments);
};

/**
 * Time an event by including the time between this call and a
 * later 'track' call for the same event in the properties sent
 * with the event.
 *
 * ### Usage:
 *
 *     // time an event named 'Registered'
 *     mixpanel.time_event('Registered');
 *     mixpanel.track('Registered', {'Gender': 'Male', 'Age': 21});
 *
 * When called for a particular event name, the next track call for that event
 * name will include the elapsed time between the 'time_event' and 'track'
 * calls. This value is stored as seconds in the '$duration' property.
 *
 * @param {String} event_name The name of the event.
 */
MixpanelLib.prototype.time_event = function(event_name) {
    if (_.isUndefined(event_name)) {
        this.report_error('No event name provided to mixpanel.time_event');
        return;
    }

    if (this._event_is_disabled(event_name)) {
        return;
    }

    this['persistence'].set_event_timer(event_name,  new Date().getTime());
};

var REGISTER_DEFAULTS = {
    'persistent': true
};
/**
 * Helper to parse options param for register methods, maintaining
 * legacy support for plain "days" param instead of options object
 * @param {Number|Object} [days_or_options] 'days' option (Number), or Options object for register methods
 * @returns {Object} options object
 */
var options_for_register = function(days_or_options) {
    var options;
    if (_.isObject(days_or_options)) {
        options = days_or_options;
    } else if (!_.isUndefined(days_or_options)) {
        options = {'days': days_or_options};
    } else {
        options = {};
    }
    return _.extend({}, REGISTER_DEFAULTS, options);
};

/**
 * Register a set of super properties, which are included with all
 * events. This will overwrite previous super property values.
 *
 * ### Usage:
 *
 *     // register 'Gender' as a super property
 *     mixpanel.register({'Gender': 'Female'});
 *
 *     // register several super properties when a user signs up
 *     mixpanel.register({
 *         'Email': 'jdoe@example.com',
 *         'Account Type': 'Free'
 *     });
 *
 *     // register only for the current pageload
 *     mixpanel.register({'Name': 'Pat'}, {persistent: false});
 *
 * @param {Object} properties An associative array of properties to store about the user
 * @param {Number|Object} [days_or_options] Options object or number of days since the user's last visit to store the super properties (only valid for persisted props)
 * @param {boolean} [days_or_options.days] - number of days since the user's last visit to store the super properties (only valid for persisted props)
 * @param {boolean} [days_or_options.persistent=true] - whether to put in persistent storage (cookie/localStorage)
 */
MixpanelLib.prototype.register = function(props, days_or_options) {
    var options = options_for_register(days_or_options);
    if (options['persistent']) {
        this['persistence'].register(props, options['days']);
    } else {
        _.extend(this.unpersisted_superprops, props);
    }
};

/**
 * Register a set of super properties only once. This will not
 * overwrite previous super property values, unlike register().
 *
 * ### Usage:
 *
 *     // register a super property for the first time only
 *     mixpanel.register_once({
 *         'First Login Date': new Date().toISOString()
 *     });
 *
 *     // register once, only for the current pageload
 *     mixpanel.register_once({
 *         'First interaction time': new Date().toISOString()
 *     }, 'None', {persistent: false});
 *
 * ### Notes:
 *
 * If default_value is specified, current super properties
 * with that value will be overwritten.
 *
 * @param {Object} properties An associative array of properties to store about the user
 * @param {*} [default_value] Value to override if already set in super properties (ex: 'False') Default: 'None'
 * @param {Number|Object} [days_or_options] Options object or number of days since the user's last visit to store the super properties (only valid for persisted props)
 * @param {boolean} [days_or_options.days] - number of days since the user's last visit to store the super properties (only valid for persisted props)
 * @param {boolean} [days_or_options.persistent=true] - whether to put in persistent storage (cookie/localStorage)
 */
MixpanelLib.prototype.register_once = function(props, default_value, days_or_options) {
    var options = options_for_register(days_or_options);
    if (options['persistent']) {
        this['persistence'].register_once(props, default_value, options['days']);
    } else {
        if (typeof(default_value) === 'undefined') {
            default_value = 'None';
        }
        _.each(props, function(val, prop) {
            if (!this.unpersisted_superprops.hasOwnProperty(prop) || this.unpersisted_superprops[prop] === default_value) {
                this.unpersisted_superprops[prop] = val;
            }
        }, this);
    }
};

/**
 * Delete a super property stored with the current user.
 *
 * @param {String} property The name of the super property to remove
 * @param {Object} [options]
 * @param {boolean} [options.persistent=true] - whether to look in persistent storage (cookie/localStorage)
 */
MixpanelLib.prototype.unregister = function(property, options) {
    options = options_for_register(options);
    if (options['persistent']) {
        this['persistence'].unregister(property);
    } else {
        delete this.unpersisted_superprops[property];
    }
};

MixpanelLib.prototype._register_single = function(prop, value) {
    var props = {};
    props[prop] = value;
    this.register(props);
};

/**
 * Identify a user with a unique ID to track user activity across
 * devices, tie a user to their events, and create a user profile.
 * If you never call this method, unique visitors are tracked using
 * a UUID generated the first time they visit the site.
 *
 * Call identify when you know the identity of the current user,
 * typically after login or signup. We recommend against using
 * identify for anonymous visitors to your site.
 *
 * ### Notes:
 * If your project has
 * <a href="https://help.mixpanel.com/hc/en-us/articles/360039133851">ID Merge</a>
 * enabled, the identify method will connect pre- and
 * post-authentication events when appropriate.
 *
 * If your project does not have ID Merge enabled, identify will
 * change the user's local distinct_id to the unique ID you pass.
 * Events tracked prior to authentication will not be connected
 * to the same user identity. If ID Merge is disabled, alias can
 * be used to connect pre- and post-registration events.
 *
 * @param {String} [unique_id] A string that uniquely identifies a user. If not provided, the distinct_id currently in the persistent store (cookie or localStorage) will be used.
 */
MixpanelLib.prototype.identify = function(
    new_distinct_id, _set_callback, _add_callback, _append_callback, _set_once_callback, _union_callback, _unset_callback, _remove_callback
) {
    // Optional Parameters
    //  _set_callback:function  A callback to be run if and when the People set queue is flushed
    //  _add_callback:function  A callback to be run if and when the People add queue is flushed
    //  _append_callback:function  A callback to be run if and when the People append queue is flushed
    //  _set_once_callback:function  A callback to be run if and when the People set_once queue is flushed
    //  _union_callback:function  A callback to be run if and when the People union queue is flushed
    //  _unset_callback:function  A callback to be run if and when the People unset queue is flushed

    var previous_distinct_id = this.get_distinct_id();
    if (new_distinct_id && previous_distinct_id !== new_distinct_id) {
        // we allow the following condition if previous distinct_id is same as new_distinct_id
        // so that you can force flush people updates for anonymous profiles.
        if (typeof new_distinct_id === 'string' && new_distinct_id.indexOf(DEVICE_ID_PREFIX) === 0) {
            this.report_error('distinct_id cannot have $device: prefix');
            return -1;
        }
        this.register({'$user_id': new_distinct_id});
    }

    if (!this.get_property('$device_id')) {
        // The persisted distinct id might not actually be a device id at all
        // it might be a distinct id of the user from before
        var device_id = previous_distinct_id;
        this.register_once({
            '$had_persisted_distinct_id': true,
            '$device_id': device_id
        }, '');
    }

    // identify only changes the distinct id if it doesn't match either the existing or the alias;
    // if it's new, blow away the alias as well.
    if (new_distinct_id !== previous_distinct_id && new_distinct_id !== this.get_property(ALIAS_ID_KEY)) {
        this.unregister(ALIAS_ID_KEY);
        this.register({'distinct_id': new_distinct_id});
    }
    this._flags.identify_called = true;
    // Flush any queued up people requests
    this['people']._flush(_set_callback, _add_callback, _append_callback, _set_once_callback, _union_callback, _unset_callback, _remove_callback);

    // send an $identify event any time the distinct_id is changing - logic on the server
    // will determine whether or not to do anything with it.
    if (new_distinct_id !== previous_distinct_id) {
        this.track('$identify', {
            'distinct_id': new_distinct_id,
            '$anon_distinct_id': previous_distinct_id
        }, {skip_hooks: true});
    }
};

/**
 * Clears super properties and generates a new random distinct_id for this instance.
 * Useful for clearing data when a user logs out.
 */
MixpanelLib.prototype.reset = function() {
    this['persistence'].clear();
    this._flags.identify_called = false;
    var uuid = _.UUID();
    this.register_once({
        'distinct_id': DEVICE_ID_PREFIX + uuid,
        '$device_id': uuid
    }, '');
};

/**
 * Returns the current distinct id of the user. This is either the id automatically
 * generated by the library or the id that has been passed by a call to identify().
 *
 * ### Notes:
 *
 * get_distinct_id() can only be called after the Mixpanel library has finished loading.
 * init() has a loaded function available to handle this automatically. For example:
 *
 *     // set distinct_id after the mixpanel library has loaded
 *     mixpanel.init('YOUR PROJECT TOKEN', {
 *         loaded: function(mixpanel) {
 *             distinct_id = mixpanel.get_distinct_id();
 *         }
 *     });
 */
MixpanelLib.prototype.get_distinct_id = function() {
    return this.get_property('distinct_id');
};

/**
 * The alias method creates an alias which Mixpanel will use to
 * remap one id to another. Multiple aliases can point to the
 * same identifier.
 *
 * The following is a valid use of alias:
 *
 *     mixpanel.alias('new_id', 'existing_id');
 *     // You can add multiple id aliases to the existing ID
 *     mixpanel.alias('newer_id', 'existing_id');
 *
 * Aliases can also be chained - the following is a valid example:
 *
 *     mixpanel.alias('new_id', 'existing_id');
 *     // chain newer_id - new_id - existing_id
 *     mixpanel.alias('newer_id', 'new_id');
 *
 * Aliases cannot point to multiple identifiers - the following
 * example will not work:
 *
 *     mixpanel.alias('new_id', 'existing_id');
 *     // this is invalid as 'new_id' already points to 'existing_id'
 *     mixpanel.alias('new_id', 'newer_id');
 *
 * ### Notes:
 *
 * If your project does not have
 * <a href="https://help.mixpanel.com/hc/en-us/articles/360039133851">ID Merge</a>
 * enabled, the best practice is to call alias once when a unique
 * ID is first created for a user (e.g., when a user first registers
 * for an account). Do not use alias multiple times for a single
 * user without ID Merge enabled.
 *
 * @param {String} alias A unique identifier that you want to use for this user in the future.
 * @param {String} [original] The current identifier being used for this user.
 */
MixpanelLib.prototype.alias = function(alias, original) {
    // If the $people_distinct_id key exists in persistence, there has been a previous
    // mixpanel.people.identify() call made for this user. It is VERY BAD to make an alias with
    // this ID, as it will duplicate users.
    if (alias === this.get_property(PEOPLE_DISTINCT_ID_KEY)) {
        this.report_error('Attempting to create alias for existing People user - aborting.');
        return -2;
    }

    var _this = this;
    if (_.isUndefined(original)) {
        original = this.get_distinct_id();
    }
    if (alias !== original) {
        this._register_single(ALIAS_ID_KEY, alias);
        return this.track('$create_alias', {
            'alias': alias,
            'distinct_id': original
        }, {
            skip_hooks: true
        }, function() {
            // Flush the people queue
            _this.identify(alias);
        });
    } else {
        this.report_error('alias matches current distinct_id - skipping api call.');
        this.identify(alias);
        return -1;
    }
};

/**
 * Provide a string to recognize the user by. The string passed to
 * this method will appear in the Mixpanel Streams product rather
 * than an automatically generated name. Name tags do not have to
 * be unique.
 *
 * This value will only be included in Streams data.
 *
 * @param {String} name_tag A human readable name for the user
 * @deprecated
 */
MixpanelLib.prototype.name_tag = function(name_tag) {
    this._register_single('mp_name_tag', name_tag);
};

/**
 * Update the configuration of a mixpanel library instance.
 *
 * The default config is:
 *
 *     {
 *       // host for requests (customizable for e.g. a local proxy)
 *       api_host: 'https://api-js.mixpanel.com',
 *
 *       // endpoints for different types of requests
 *       api_routes: {
 *         track: 'track/',
 *         engage: 'engage/',
 *         groups: 'groups/',
 *       }
 *
 *       // HTTP method for tracking requests
 *       api_method: 'POST'
 *
 *       // transport for sending requests ('XHR' or 'sendBeacon')
 *       // NB: sendBeacon should only be used for scenarios such as
 *       // page unload where a "best-effort" attempt to send is
 *       // acceptable; the sendBeacon API does not support callbacks
 *       // or any way to know the result of the request. Mixpanel
 *       // tracking via sendBeacon will not support any event-
 *       // batching or retry mechanisms.
 *       api_transport: 'XHR'
 *
 *       // request-batching/queueing/retry
 *       batch_requests: true,
 *
 *       // maximum number of events/updates to send in a single
 *       // network request
 *       batch_size: 50,
 *
 *       // milliseconds to wait between sending batch requests
 *       batch_flush_interval_ms: 5000,
 *
 *       // milliseconds to wait for network responses to batch requests
 *       // before they are considered timed-out and retried
 *       batch_request_timeout_ms: 90000,
 *
 *       // override value for cookie domain, only useful for ensuring
 *       // correct cross-subdomain cookies on unusual domains like
 *       // subdomain.mainsite.avocat.fr; NB this cannot be used to
 *       // set cookies on a different domain than the current origin
 *       cookie_domain: ''
 *
 *       // super properties cookie expiration (in days)
 *       cookie_expiration: 365
 *
 *       // if true, cookie will be set with SameSite=None; Secure
 *       // this is only useful in special situations, like embedded
 *       // 3rd-party iframes that set up a Mixpanel instance
 *       cross_site_cookie: false
 *
 *       // super properties span subdomains
 *       cross_subdomain_cookie: true
 *
 *       // debug mode
 *       debug: false
 *
 *       // if this is true, the mixpanel cookie or localStorage entry
 *       // will be deleted, and no user persistence will take place
 *       disable_persistence: false
 *
 *       // if this is true, Mixpanel will automatically determine
 *       // City, Region and Country data using the IP address of
 *       //the client
 *       ip: true
 *
 *       // opt users out of tracking by this Mixpanel instance by default
 *       opt_out_tracking_by_default: false
 *
 *       // opt users out of browser data storage by this Mixpanel instance by default
 *       opt_out_persistence_by_default: false
 *
 *       // persistence mechanism used by opt-in/opt-out methods - cookie
 *       // or localStorage - falls back to cookie if localStorage is unavailable
 *       opt_out_tracking_persistence_type: 'localStorage'
 *
 *       // customize the name of cookie/localStorage set by opt-in/opt-out methods
 *       opt_out_tracking_cookie_prefix: null
 *
 *       // type of persistent store for super properties (cookie/
 *       // localStorage) if set to 'localStorage', any existing
 *       // mixpanel cookie value with the same persistence_name
 *       // will be transferred to localStorage and deleted
 *       persistence: 'cookie'
 *
 *       // name for super properties persistent store
 *       persistence_name: ''
 *
 *       // names of properties/superproperties which should never
 *       // be sent with track() calls
 *       property_blacklist: []
 *
 *       // if this is true, mixpanel cookies will be marked as
 *       // secure, meaning they will only be transmitted over https
 *       secure_cookie: false
 *
 *       // disables enriching user profiles with first touch marketing data
 *       skip_first_touch_marketing: false
 *
 *       // the amount of time track_links will
 *       // wait for Mixpanel's servers to respond
 *       track_links_timeout: 300
 *
 *       // adds any UTM parameters and click IDs present on the page to any events fired
 *       track_marketing: true
 *
 *       // enables automatic page view tracking using default page view events through
 *       // the track_pageview() method
 *       track_pageview: false
 *
 *       // if you set upgrade to be true, the library will check for
 *       // a cookie from our old js library and import super
 *       // properties from it, then the old cookie is deleted
 *       // The upgrade config option only works in the initialization,
 *       // so make sure you set it when you create the library.
 *       upgrade: false
 *
 *       // extra HTTP request headers to set for each API request, in
 *       // the format {'Header-Name': value}
 *       xhr_headers: {}
 *
 *       // whether to ignore or respect the web browser's Do Not Track setting
 *       ignore_dnt: false
 *     }
 *
 *
 * @param {Object} config A dictionary of new configuration values to update
 */
MixpanelLib.prototype.set_config = function(config) {
    if (_.isObject(config)) {
        _.extend(this['config'], config);

        var new_batch_size = config['batch_size'];
        if (new_batch_size) {
            _.each(this.request_batchers, function(batcher) {
                batcher.resetBatchSize();
            });
        }

        if (!this.get_config('persistence_name')) {
            this['config']['persistence_name'] = this['config']['cookie_name'];
        }
        if (!this.get_config('disable_persistence')) {
            this['config']['disable_persistence'] = this['config']['disable_cookie'];
        }

        if (this['persistence']) {
            this['persistence'].update_config(this['config']);
        }
        Config.DEBUG = Config.DEBUG || this.get_config('debug');
    }
};

/**
 * returns the current config object for the library.
 */
MixpanelLib.prototype.get_config = function(prop_name) {
    return this['config'][prop_name];
};

/**
 * Fetch a hook function from config, with safe default, and run it
 * against the given arguments
 * @param {string} hook_name which hook to retrieve
 * @returns {any|null} return value of user-provided hook, or null if nothing was returned
 */
MixpanelLib.prototype._run_hook = function(hook_name) {
    var ret = (this['config']['hooks'][hook_name] || IDENTITY_FUNC).apply(this, slice.call(arguments, 1));
    if (typeof ret === 'undefined') {
        this.report_error(hook_name + ' hook did not return a value');
        ret = null;
    }
    return ret;
};

/**
 * Returns the value of the super property named property_name. If no such
 * property is set, get_property() will return the undefined value.
 *
 * ### Notes:
 *
 * get_property() can only be called after the Mixpanel library has finished loading.
 * init() has a loaded function available to handle this automatically. For example:
 *
 *     // grab value for 'user_id' after the mixpanel library has loaded
 *     mixpanel.init('YOUR PROJECT TOKEN', {
 *         loaded: function(mixpanel) {
 *             user_id = mixpanel.get_property('user_id');
 *         }
 *     });
 *
 * @param {String} property_name The name of the super property you want to retrieve
 */
MixpanelLib.prototype.get_property = function(property_name) {
    return this['persistence'].load_prop([property_name]);
};

MixpanelLib.prototype.toString = function() {
    var name = this.get_config('name');
    if (name !== PRIMARY_INSTANCE_NAME) {
        name = PRIMARY_INSTANCE_NAME + '.' + name;
    }
    return name;
};

MixpanelLib.prototype._event_is_disabled = function(event_name) {
    return _.isBlockedUA(userAgent) ||
        this._flags.disable_all_events ||
        _.include(this.__disabled_events, event_name);
};

// perform some housekeeping around GDPR opt-in/out state
MixpanelLib.prototype._gdpr_init = function() {
    var is_localStorage_requested = this.get_config('opt_out_tracking_persistence_type') === 'localStorage';

    // try to convert opt-in/out cookies to localStorage if possible
    if (is_localStorage_requested && _.localStorage.is_supported()) {
        if (!this.has_opted_in_tracking() && this.has_opted_in_tracking({'persistence_type': 'cookie'})) {
            this.opt_in_tracking({'enable_persistence': false});
        }
        if (!this.has_opted_out_tracking() && this.has_opted_out_tracking({'persistence_type': 'cookie'})) {
            this.opt_out_tracking({'clear_persistence': false});
        }
        this.clear_opt_in_out_tracking({
            'persistence_type': 'cookie',
            'enable_persistence': false
        });
    }

    // check whether the user has already opted out - if so, clear & disable persistence
    if (this.has_opted_out_tracking()) {
        this._gdpr_update_persistence({'clear_persistence': true});

    // check whether we should opt out by default
    // note: we don't clear persistence here by default since opt-out default state is often
    //       used as an initial state while GDPR information is being collected
    } else if (!this.has_opted_in_tracking() && (
        this.get_config('opt_out_tracking_by_default') || _.cookie.get('mp_optout')
    )) {
        _.cookie.remove('mp_optout');
        this.opt_out_tracking({
            'clear_persistence': this.get_config('opt_out_persistence_by_default')
        });
    }
};

/**
 * Enable or disable persistence based on options
 * only enable/disable if persistence is not already in this state
 * @param {boolean} [options.clear_persistence] If true, will delete all data stored by the sdk in persistence and disable it
 * @param {boolean} [options.enable_persistence] If true, will re-enable sdk persistence
 */
MixpanelLib.prototype._gdpr_update_persistence = function(options) {
    var disabled;
    if (options && options['clear_persistence']) {
        disabled = true;
    } else if (options && options['enable_persistence']) {
        disabled = false;
    } else {
        return;
    }

    if (!this.get_config('disable_persistence') && this['persistence'].disabled !== disabled) {
        this['persistence'].set_disabled(disabled);
    }

    if (disabled) {
        this.stop_batch_senders();
    } else {
        // only start batchers after opt-in if they have previously been started
        // in order to avoid unintentionally starting up batching for the first time
        if (this._batchers_were_started) {
            this.start_batch_senders();
        }
    }
};

// call a base gdpr function after constructing the appropriate token and options args
MixpanelLib.prototype._gdpr_call_func = function(func, options) {
    options = _.extend({
        'track': _.bind(this.track, this),
        'persistence_type': this.get_config('opt_out_tracking_persistence_type'),
        'cookie_prefix': this.get_config('opt_out_tracking_cookie_prefix'),
        'cookie_expiration': this.get_config('cookie_expiration'),
        'cross_site_cookie': this.get_config('cross_site_cookie'),
        'cross_subdomain_cookie': this.get_config('cross_subdomain_cookie'),
        'cookie_domain': this.get_config('cookie_domain'),
        'secure_cookie': this.get_config('secure_cookie'),
        'ignore_dnt': this.get_config('ignore_dnt')
    }, options);

    // check if localStorage can be used for recording opt out status, fall back to cookie if not
    if (!_.localStorage.is_supported()) {
        options['persistence_type'] = 'cookie';
    }

    return func(this.get_config('token'), {
        track: options['track'],
        trackEventName: options['track_event_name'],
        trackProperties: options['track_properties'],
        persistenceType: options['persistence_type'],
        persistencePrefix: options['cookie_prefix'],
        cookieDomain: options['cookie_domain'],
        cookieExpiration: options['cookie_expiration'],
        crossSiteCookie: options['cross_site_cookie'],
        crossSubdomainCookie: options['cross_subdomain_cookie'],
        secureCookie: options['secure_cookie'],
        ignoreDnt: options['ignore_dnt']
    });
};

/**
 * Opt the user in to data tracking and cookies/localstorage for this Mixpanel instance
 *
 * ### Usage
 *
 *     // opt user in
 *     mixpanel.opt_in_tracking();
 *
 *     // opt user in with specific event name, properties, cookie configuration
 *     mixpanel.opt_in_tracking({
 *         track_event_name: 'User opted in',
 *         track_event_properties: {
 *             'Email': 'jdoe@example.com'
 *         },
 *         cookie_expiration: 30,
 *         secure_cookie: true
 *     });
 *
 * @param {Object} [options] A dictionary of config options to override
 * @param {function} [options.track] Function used for tracking a Mixpanel event to record the opt-in action (default is this Mixpanel instance's track method)
 * @param {string} [options.track_event_name=$opt_in] Event name to be used for tracking the opt-in action
 * @param {Object} [options.track_properties] Set of properties to be tracked along with the opt-in action
 * @param {boolean} [options.enable_persistence=true] If true, will re-enable sdk persistence
 * @param {string} [options.persistence_type=localStorage] Persistence mechanism used - cookie or localStorage - falls back to cookie if localStorage is unavailable
 * @param {string} [options.cookie_prefix=__mp_opt_in_out] Custom prefix to be used in the cookie/localstorage name
 * @param {Number} [options.cookie_expiration] Number of days until the opt-in cookie expires (overrides value specified in this Mixpanel instance's config)
 * @param {string} [options.cookie_domain] Custom cookie domain (overrides value specified in this Mixpanel instance's config)
 * @param {boolean} [options.cross_site_cookie] Whether the opt-in cookie is set as cross-site-enabled (overrides value specified in this Mixpanel instance's config)
 * @param {boolean} [options.cross_subdomain_cookie] Whether the opt-in cookie is set as cross-subdomain or not (overrides value specified in this Mixpanel instance's config)
 * @param {boolean} [options.secure_cookie] Whether the opt-in cookie is set as secure or not (overrides value specified in this Mixpanel instance's config)
 */
MixpanelLib.prototype.opt_in_tracking = function(options) {
    options = _.extend({
        'enable_persistence': true
    }, options);

    this._gdpr_call_func(optIn, options);
    this._gdpr_update_persistence(options);
};

/**
 * Opt the user out of data tracking and cookies/localstorage for this Mixpanel instance
 *
 * ### Usage
 *
 *     // opt user out
 *     mixpanel.opt_out_tracking();
 *
 *     // opt user out with different cookie configuration from Mixpanel instance
 *     mixpanel.opt_out_tracking({
 *         cookie_expiration: 30,
 *         secure_cookie: true
 *     });
 *
 * @param {Object} [options] A dictionary of config options to override
 * @param {boolean} [options.delete_user=true] If true, will delete the currently identified user's profile and clear all charges after opting the user out
 * @param {boolean} [options.clear_persistence=true] If true, will delete all data stored by the sdk in persistence
 * @param {string} [options.persistence_type=localStorage] Persistence mechanism used - cookie or localStorage - falls back to cookie if localStorage is unavailable
 * @param {string} [options.cookie_prefix=__mp_opt_in_out] Custom prefix to be used in the cookie/localstorage name
 * @param {Number} [options.cookie_expiration] Number of days until the opt-in cookie expires (overrides value specified in this Mixpanel instance's config)
 * @param {string} [options.cookie_domain] Custom cookie domain (overrides value specified in this Mixpanel instance's config)
 * @param {boolean} [options.cross_site_cookie] Whether the opt-in cookie is set as cross-site-enabled (overrides value specified in this Mixpanel instance's config)
 * @param {boolean} [options.cross_subdomain_cookie] Whether the opt-in cookie is set as cross-subdomain or not (overrides value specified in this Mixpanel instance's config)
 * @param {boolean} [options.secure_cookie] Whether the opt-in cookie is set as secure or not (overrides value specified in this Mixpanel instance's config)
 */
MixpanelLib.prototype.opt_out_tracking = function(options) {
    options = _.extend({
        'clear_persistence': true,
        'delete_user': true
    }, options);

    // delete user and clear charges since these methods may be disabled by opt-out
    if (options['delete_user'] && this['people'] && this['people']._identify_called()) {
        this['people'].delete_user();
        this['people'].clear_charges();
    }

    this._gdpr_call_func(optOut, options);
    this._gdpr_update_persistence(options);
};

/**
 * Check whether the user has opted in to data tracking and cookies/localstorage for this Mixpanel instance
 *
 * ### Usage
 *
 *     var has_opted_in = mixpanel.has_opted_in_tracking();
 *     // use has_opted_in value
 *
 * @param {Object} [options] A dictionary of config options to override
 * @param {string} [options.persistence_type=localStorage] Persistence mechanism used - cookie or localStorage - falls back to cookie if localStorage is unavailable
 * @param {string} [options.cookie_prefix=__mp_opt_in_out] Custom prefix to be used in the cookie/localstorage name
 * @returns {boolean} current opt-in status
 */
MixpanelLib.prototype.has_opted_in_tracking = function(options) {
    return this._gdpr_call_func(hasOptedIn, options);
};

/**
 * Check whether the user has opted out of data tracking and cookies/localstorage for this Mixpanel instance
 *
 * ### Usage
 *
 *     var has_opted_out = mixpanel.has_opted_out_tracking();
 *     // use has_opted_out value
 *
 * @param {Object} [options] A dictionary of config options to override
 * @param {string} [options.persistence_type=localStorage] Persistence mechanism used - cookie or localStorage - falls back to cookie if localStorage is unavailable
 * @param {string} [options.cookie_prefix=__mp_opt_in_out] Custom prefix to be used in the cookie/localstorage name
 * @returns {boolean} current opt-out status
 */
MixpanelLib.prototype.has_opted_out_tracking = function(options) {
    return this._gdpr_call_func(hasOptedOut, options);
};

/**
 * Clear the user's opt in/out status of data tracking and cookies/localstorage for this Mixpanel instance
 *
 * ### Usage
 *
 *     // clear user's opt-in/out status
 *     mixpanel.clear_opt_in_out_tracking();
 *
 *     // clear user's opt-in/out status with specific cookie configuration - should match
 *     // configuration used when opt_in_tracking/opt_out_tracking methods were called.
 *     mixpanel.clear_opt_in_out_tracking({
 *         cookie_expiration: 30,
 *         secure_cookie: true
 *     });
 *
 * @param {Object} [options] A dictionary of config options to override
 * @param {boolean} [options.enable_persistence=true] If true, will re-enable sdk persistence
 * @param {string} [options.persistence_type=localStorage] Persistence mechanism used - cookie or localStorage - falls back to cookie if localStorage is unavailable
 * @param {string} [options.cookie_prefix=__mp_opt_in_out] Custom prefix to be used in the cookie/localstorage name
 * @param {Number} [options.cookie_expiration] Number of days until the opt-in cookie expires (overrides value specified in this Mixpanel instance's config)
 * @param {string} [options.cookie_domain] Custom cookie domain (overrides value specified in this Mixpanel instance's config)
 * @param {boolean} [options.cross_site_cookie] Whether the opt-in cookie is set as cross-site-enabled (overrides value specified in this Mixpanel instance's config)
 * @param {boolean} [options.cross_subdomain_cookie] Whether the opt-in cookie is set as cross-subdomain or not (overrides value specified in this Mixpanel instance's config)
 * @param {boolean} [options.secure_cookie] Whether the opt-in cookie is set as secure or not (overrides value specified in this Mixpanel instance's config)
 */
MixpanelLib.prototype.clear_opt_in_out_tracking = function(options) {
    options = _.extend({
        'enable_persistence': true
    }, options);

    this._gdpr_call_func(clearOptInOut, options);
    this._gdpr_update_persistence(options);
};

MixpanelLib.prototype.report_error = function(msg, err) {
    console.error.apply(console.error, arguments);
    try {
        if (!err && !(msg instanceof Error)) {
            msg = new Error(msg);
        }
        this.get_config('error_reporter')(msg, err);
    } catch(err) {
        console.error(err);
    }
};

// EXPORTS (for closure compiler)

// MixpanelLib Exports
MixpanelLib.prototype['init']                      = MixpanelLib.prototype.init;
MixpanelLib.prototype['reset']                     = MixpanelLib.prototype.reset;
MixpanelLib.prototype['disable']                   = MixpanelLib.prototype.disable;
MixpanelLib.prototype['time_event']                = MixpanelLib.prototype.time_event;
MixpanelLib.prototype['track']                     = MixpanelLib.prototype.track;
MixpanelLib.prototype['track_links']               = MixpanelLib.prototype.track_links;
MixpanelLib.prototype['track_forms']               = MixpanelLib.prototype.track_forms;
MixpanelLib.prototype['track_pageview']            = MixpanelLib.prototype.track_pageview;
MixpanelLib.prototype['register']                  = MixpanelLib.prototype.register;
MixpanelLib.prototype['register_once']             = MixpanelLib.prototype.register_once;
MixpanelLib.prototype['unregister']                = MixpanelLib.prototype.unregister;
MixpanelLib.prototype['identify']                  = MixpanelLib.prototype.identify;
MixpanelLib.prototype['alias']                     = MixpanelLib.prototype.alias;
MixpanelLib.prototype['name_tag']                  = MixpanelLib.prototype.name_tag;
MixpanelLib.prototype['set_config']                = MixpanelLib.prototype.set_config;
MixpanelLib.prototype['get_config']                = MixpanelLib.prototype.get_config;
MixpanelLib.prototype['get_property']              = MixpanelLib.prototype.get_property;
MixpanelLib.prototype['get_distinct_id']           = MixpanelLib.prototype.get_distinct_id;
MixpanelLib.prototype['toString']                  = MixpanelLib.prototype.toString;
MixpanelLib.prototype['opt_out_tracking']          = MixpanelLib.prototype.opt_out_tracking;
MixpanelLib.prototype['opt_in_tracking']           = MixpanelLib.prototype.opt_in_tracking;
MixpanelLib.prototype['has_opted_out_tracking']    = MixpanelLib.prototype.has_opted_out_tracking;
MixpanelLib.prototype['has_opted_in_tracking']     = MixpanelLib.prototype.has_opted_in_tracking;
MixpanelLib.prototype['clear_opt_in_out_tracking'] = MixpanelLib.prototype.clear_opt_in_out_tracking;
MixpanelLib.prototype['get_group']                 = MixpanelLib.prototype.get_group;
MixpanelLib.prototype['set_group']                 = MixpanelLib.prototype.set_group;
MixpanelLib.prototype['add_group']                 = MixpanelLib.prototype.add_group;
MixpanelLib.prototype['remove_group']              = MixpanelLib.prototype.remove_group;
MixpanelLib.prototype['track_with_groups']         = MixpanelLib.prototype.track_with_groups;
MixpanelLib.prototype['start_batch_senders']       = MixpanelLib.prototype.start_batch_senders;
MixpanelLib.prototype['stop_batch_senders']        = MixpanelLib.prototype.stop_batch_senders;
MixpanelLib.prototype['DEFAULT_API_ROUTES']        = DEFAULT_API_ROUTES;

// MixpanelPersistence Exports
MixpanelPersistence.prototype['properties']            = MixpanelPersistence.prototype.properties;
MixpanelPersistence.prototype['update_search_keyword'] = MixpanelPersistence.prototype.update_search_keyword;
MixpanelPersistence.prototype['update_referrer_info']  = MixpanelPersistence.prototype.update_referrer_info;
MixpanelPersistence.prototype['get_cross_subdomain']   = MixpanelPersistence.prototype.get_cross_subdomain;
MixpanelPersistence.prototype['clear']                 = MixpanelPersistence.prototype.clear;


var instances = {};
var extend_mp = function() {
    // add all the sub mixpanel instances
    _.each(instances, function(instance, name) {
        if (name !== PRIMARY_INSTANCE_NAME) { mixpanel_master[name] = instance; }
    });

    // add private functions as _
    mixpanel_master['_'] = _;
};

var override_mp_init_func = function() {
    // we override the snippets init function to handle the case where a
    // user initializes the mixpanel library after the script loads & runs
    mixpanel_master['init'] = function(token, config, name) {
        if (name) {
            // initialize a sub library
            if (!mixpanel_master[name]) {
                mixpanel_master[name] = instances[name] = create_mplib(token, config, name);
                mixpanel_master[name]._loaded();
            }
            return mixpanel_master[name];
        } else {
            var instance = mixpanel_master;

            if (instances[PRIMARY_INSTANCE_NAME]) {
                // main mixpanel lib already initialized
                instance = instances[PRIMARY_INSTANCE_NAME];
            } else if (token) {
                // intialize the main mixpanel lib
                instance = create_mplib(token, config, PRIMARY_INSTANCE_NAME);
                instance._loaded();
                instances[PRIMARY_INSTANCE_NAME] = instance;
            }

            mixpanel_master = instance;
            if (init_type === INIT_SNIPPET) {
                window[PRIMARY_INSTANCE_NAME] = mixpanel_master;
            }
            extend_mp();
        }
    };
};

var add_dom_loaded_handler = function() {
    // Cross browser DOM Loaded support
    function dom_loaded_handler() {
        // function flag since we only want to execute this once
        if (dom_loaded_handler.done) { return; }
        dom_loaded_handler.done = true;

        DOM_LOADED = true;
        ENQUEUE_REQUESTS = false;

        _.each(instances, function(inst) {
            inst._dom_loaded();
        });
    }

    function do_scroll_check() {
        try {
            document.documentElement.doScroll('left');
        } catch(e) {
            setTimeout(do_scroll_check, 1);
            return;
        }

        dom_loaded_handler();
    }

    if (document.addEventListener) {
        if (document.readyState === 'complete') {
            // safari 4 can fire the DOMContentLoaded event before loading all
            // external JS (including this file). you will see some copypasta
            // on the internet that checks for 'complete' and 'loaded', but
            // 'loaded' is an IE thing
            dom_loaded_handler();
        } else {
            document.addEventListener('DOMContentLoaded', dom_loaded_handler, false);
        }
    } else if (document.attachEvent) {
        // IE
        document.attachEvent('onreadystatechange', dom_loaded_handler);

        // check to make sure we arn't in a frame
        var toplevel = false;
        try {
            toplevel = window.frameElement === null;
        } catch(e) {
            // noop
        }

        if (document.documentElement.doScroll && toplevel) {
            do_scroll_check();
        }
    }

    // fallback handler, always will work
    _.register_event(window, 'load', dom_loaded_handler, true);
};

export function init_from_snippet() {
    init_type = INIT_SNIPPET;
    mixpanel_master = window[PRIMARY_INSTANCE_NAME];

    // Initialization
    if (_.isUndefined(mixpanel_master)) {
        // mixpanel wasn't initialized properly, report error and quit
        console.critical('"mixpanel" object not initialized. Ensure you are using the latest version of the Mixpanel JS Library along with the snippet we provide.');
        return;
    }
    if (mixpanel_master['__loaded'] || (mixpanel_master['config'] && mixpanel_master['persistence'])) {
        // lib has already been loaded at least once; we don't want to override the global object this time so bomb early
        console.critical('The Mixpanel library has already been downloaded at least once. Ensure that the Mixpanel code snippet only appears once on the page (and is not double-loaded by a tag manager) in order to avoid errors.');
        return;
    }
    var snippet_version = mixpanel_master['__SV'] || 0;
    if (snippet_version < 1.1) {
        // mixpanel wasn't initialized properly, report error and quit
        console.critical('Version mismatch; please ensure you\'re using the latest version of the Mixpanel code snippet.');
        return;
    }

    // Load instances of the Mixpanel Library
    _.each(mixpanel_master['_i'], function(item) {
        if (item && _.isArray(item)) {
            instances[item[item.length-1]] = create_mplib.apply(this, item);
        }
    });

    override_mp_init_func();
    mixpanel_master['init']();

    // Fire loaded events after updating the window's mixpanel object
    _.each(instances, function(instance) {
        instance._loaded();
    });

    add_dom_loaded_handler();
}

export function init_as_module() {
    init_type = INIT_MODULE;
    mixpanel_master = new MixpanelLib();

    override_mp_init_func();
    mixpanel_master['init']();
    add_dom_loaded_handler();

    return mixpanel_master;
}
