import './mixpanel-jslib-snippet';

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
