// ==ClosureCompiler==
// @compilation_level SIMPLE_OPTIMIZATIONS
// @output_file_name mixpanel-jslib-2.2-snippet.min.js
// ==/ClosureCompiler==

/** @define {string} */
var MIXPANEL_LIB_URL = '//cdn.mxpnl.com/libs/mixpanel-2-latest.min.js';

(function(document, mixpanel) {
    // Only stub out if this is the first time running the snippet.
    if (!mixpanel['__SV']) {
        var script, first_script, functions, i, lib_name = "mixpanel";
        window[lib_name] = mixpanel;

        mixpanel['_i'] = [];

        mixpanel['init'] = function (token, config, name) {
            // support multiple mixpanel instances
            var target = mixpanel;
            if (typeof(name) !== 'undefined') {
                target = mixpanel[name] = [];
            } else {
                name = lib_name;
            }

            // Pass in current people object if it exists
            target['people'] = target['people'] || [];
            target['toString'] = function(no_stub) {
                var str = lib_name;
                if (name !== lib_name) {
                    str += "." + name;
                }
                if (!no_stub) {
                    str += " (stub)";
                }
                return str;
            };
            target['people']['toString'] = function() {
                // 1 instead of true for minifying
                return target.toString(1) + ".people (stub)";
            };

            function _set_and_defer(target, fn) {
                var split = fn.split(".");
                if (split.length == 2) {
                    target = target[split[0]];
                    fn = split[1];
                }
                target[fn] = function() {
                    target.push([fn].concat(Array.prototype.slice.call(arguments, 0)));
                };
            }

            // create shallow clone of the public mixpanel interface
            // Note: only supports 1 additional level atm, e.g. mixpanel.people.set, not mixpanel.people.set.do_something_else.
            functions = "disable time_event track track_pageview track_links track_forms track_with_groups add_group set_group remove_group register register_once alias unregister identify name_tag set_config reset opt_in_tracking opt_out_tracking has_opted_in_tracking has_opted_out_tracking clear_opt_in_out_tracking start_batch_senders start_session_recording stop_session_recording people.set people.set_once people.unset people.increment people.append people.union people.track_charge people.clear_charges people.delete_user people.remove".split(' ');
            for (i = 0; i < functions.length; i++) {
                _set_and_defer(target, functions[i]);
            }

            // special case for get_group(): chain method calls like mixpanel.get_group('foo', 'bar').unset('baz')
            var group_functions = "set set_once union unset remove delete".split(' ');
            target['get_group'] = function() {
                var mock_group = {};

                var call1_args = arguments;
                var call1 = ['get_group'].concat(Array.prototype.slice.call(call1_args, 0));

                function _set_and_defer_chained(fn_name) {
                    mock_group[fn_name] = function() {
                        var call2_args = arguments;
                        var call2 = [fn_name].concat(Array.prototype.slice.call(call2_args, 0));
                        target.push([call1, call2]);
                    };
                }
                for (var i = 0; i < group_functions.length; i++) {
                    _set_and_defer_chained(group_functions[i]);
                }
                return mock_group;
            };

            // register mixpanel instance
            mixpanel['_i'].push([token, config, name]);
        };

        // Snippet version, used to fail on new features w/ old snippet
        mixpanel['__SV'] = 1.2;

        script = document.createElement("script");
        script.type = "text/javascript";
        script.async = true;

        if (typeof MIXPANEL_CUSTOM_LIB_URL !== 'undefined') {
            script.src = MIXPANEL_CUSTOM_LIB_URL;
        } else if (document.location.protocol === 'file:' && MIXPANEL_LIB_URL.match(/^\/\//)) {
            script.src = 'https:' + MIXPANEL_LIB_URL;
        } else {
            script.src = MIXPANEL_LIB_URL;
        }

        first_script = document.getElementsByTagName("script")[0];
        first_script.parentNode.insertBefore(script, first_script);
    }
// Pass in current Mixpanel object if it exists (for ppl like Optimizely)
})(document, window['mixpanel'] || []);

/*
 * @see src/loaders/mixpanel-js-wrapper.md
 */
(function (win, wrapper) {

    // If window.mixpanel doesn't exist, return
    if (!win['mixpanel'] || typeof win['mixpanel']['init'] !== 'function') return;

    // Enumerate available commands
    var commandEnum = [
        'add_group',
        'alias',
        'clear_opt_in_out_tracking',
        'disable',
        /* Ignore getters
        'get_config',
        'get_distinct_id',
        'get_group',
        'get_property',
        'has_opted_in_tracking',
        'has_opted_out_tracking',
        */
        /* Ignore init
        'init'
        */
        'identify',
        'opt_in_tracking',
        'opt_out_tracking',
        /* Ignore push
        'push',
        */
        'register',
        'register_once',
        'remove_group',
        'reset',
        'set_config',
        'set_group',
        'start_session_recording',
        'stop_session_recording',
        'time_event',
        'track',
        'track_forms',
        'track_links',
        'track_pageview',
        'track_with_groups',
        'unregister',
        'people.append',
        'people.clear_charges',
        'people.delete_user',
        'people.increment',
        'people.remove',
        'people.set',
        'people.set_once',
        'people.track_charge',
        'people.union',
        'people.unset',
        'group.remove',
        'group.set',
        'group.set_once',
        'group.union',
        'group.unset'
    ];

    /* The people API can't be used with the .push() interface, so it requires its
     * own helper method. To interact with it, simply use the _mixpanel interface
     * as before.
     *
     * window._mixpanel('<libraryName.>people.set', 'gender', 'm');
     *
     */
    var people = function (mp, cmd, args) {
        // Extract the command
        var peopleCmd = cmd.split('.').pop();

        // Call the respective mixpanel method
        mp['people'][peopleCmd].apply(mp['people'], args);
    };

    /* To utilize the group API, the command must include the group key and ID as
     * an array in the second argument.
     *
     * window._mixpanel('<libraryName.>.group.set', ['group_key', 'group_id'], {
     *   someGroupProperty: 'someGroupValue'
     * });
     *
     */
    var group = function (mp, cmd, args) {
        // Extract the command
        var groupCmd = cmd.split('.').pop();

        // Extract the group info
        var groupInfo = args.shift();

        // Validate the group array
        if (!Array.isArray(groupInfo) || groupInfo.length !== 2) return;

        // Get group reference
        var group = mp['get_group'].apply(mp, groupInfo);

        // Call the respective group method
        group[groupCmd].apply(group, args);

    };

    // Build the command wrapper logic
    win[wrapper] = win[wrapper] || function () {

        // Build array out of arguments
        var args = [].slice.call(arguments, 0);

        // Pick the first argument as the command
        var cmd = args.shift();

        /* Commands can be passed to different namespaces with syntax:
         * window._mixpanel('libraryName.command', arguments)
         */
        var libraryName = null;
        var cmdParts = cmd.match(/^([^.]+)\.(.+)$/);
        if (cmdParts && cmdParts.length === 3 && !/people|group/.test(cmdParts[1])) {
            libraryName = cmdParts[1];
            cmd = cmdParts[2];
        }

        // If libraryName is set, use that as the mixpanel interface
        var mp = libraryName ? window['mixpanel'][libraryName] : window['mixpanel'];

        // Return if namespace not found
        if (!mp) return;

        // If cmd is not one of the available ones, return
        if (commandEnum.indexOf(cmd) === -1) return;

        // Handle people command
        if (/^people\./.test(cmd)) return people(mp, cmd, args);

        // Handle group command
        if (/^group\./.test(cmd)) return group(mp, cmd, args);

        // Push the command to mixpanel
        return mp.push.apply(mp, [[cmd].concat(args)]);

    };
})(window, '_mixpanel');
