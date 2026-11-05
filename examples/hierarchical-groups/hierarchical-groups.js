/* eslint camelcase: "off" */
(function() {
    // Hierarchical groups is an init-time option, so this page uses its own named instance
    // ("hg") and project rather than the default mixpanel instance.
    var MIXPANEL_HG_PROJECT_TOKEN = 'YOUR_HG_PROJECT_TOKEN';

    // Filter the browser console on "HGDemo" to see each button's header line. With debug on, the
    // library logs its own warnings and dropped calls right after it.
    var LOG_PREFIX = 'HGDemo';

    function log() {
        console.log.apply(console, [LOG_PREFIX].concat(Array.prototype.slice.call(arguments)));
    }

    function value(id) {
        return document.getElementById(id).value;
    }
    function userId() { return value('user-id'); }
    function companyId() { return value('company-id'); }
    function teamId() { return value('team-id'); }

    // The same group profile operations, for the company and for the custom team_id group
    function groupActions(label, group) {
        // get_company() returns null when there is no company to update
        function update(action) {
            var target = group();
            if (target) {
                action(target);
            } else {
                log('No ' + label + ' to update');
            }
        }

        return [
            [label + ': Set Property', function() {
                log('Setting a ' + label + ' property');
                update(function(g) { g.set('tier', 'enterprise'); });
            }],
            [label + ': Set Properties (Map)', function() {
                log('Setting multiple ' + label + ' properties');
                update(function(g) { g.set({size: 12, region: 'us'}); });
            }],
            [label + ': Set Property Once', function() {
                log('Setting a ' + label + ' property once');
                update(function(g) { g.set_once('created', '2026-10-27'); });
            }],
            [label + ': Union Property', function() {
                log('Union ' + label + ' property');
                update(function(g) { g.union('tags', ['js']); });
            }],
            [label + ': Remove Property', function() {
                log('Removing from ' + label + ' property');
                update(function(g) { g.remove('tags', 'js'); });
            }],
            [label + ': Unset Property', function() {
                log('Unsetting a ' + label + ' property');
                update(function(g) { g.unset('tier'); });
            }],
            [label + ': Delete Group', function() {
                log('Deleting ' + label + ' group');
                update(function(g) { g['delete'](); });
            }]
        ];
    }

    function buildSections(mp) {
        return [
            ['Identity', [
                ['Identify', function() {
                    log('Identifying ' + userId() + ' at ' + companyId());
                    mp.identify({user_id: userId(), company_id: companyId()});
                }],
                ['Invalid: Identify Without Company', function() {
                    log('Identifying ' + userId() + ' without a company');
                    mp.identify({user_id: userId()});
                }],
                ['Invalid: Identify With Distinct ID', function() {
                    log('Identifying ' + userId() + ' with identify(string)');
                    mp.identify(userId());
                }],
                ['Invalid: Alias', function() {
                    log('Aliasing new_alias');
                    mp.alias('new_alias');
                }],
                ['Show Identity', function() {
                    log('identity=', mp.get_identity(),
                        'optedOut=', mp.has_opted_out_tracking(),
                        'superProperties=', mp['persistence'].properties());
                }]
            ]],
            ['Opt out and in', [
                ['Opt Out', function() {
                    log('Opting out');
                    mp.opt_out_tracking();
                }],
                ['Opt In', function() {
                    log('Opting in anonymously');
                    mp.opt_in_tracking();
                }],
                ['Opt In With Identity', function() {
                    log('Opting in as ' + userId() + ' at ' + companyId());
                    mp.opt_in_tracking({identity: {user_id: userId(), company_id: companyId()}});
                }],
                ['Invalid: Opt In With Distinct ID', function() {
                    log('Opting in as ' + userId() + ' with a string identity');
                    mp.opt_in_tracking({identity: userId()});
                }]
            ]],
            ['Events', [
                ['Track Event', function() {
                    log('Tracking HG event');
                    mp.track('HG Event!', {source: 'hierarchical_groups_page'});
                }],
                ['Set Team Group', function() {
                    log('Setting team_id to ' + teamId());
                    mp.set_group('team_id', teamId());
                }],
                ['Invalid: Set Team Groups (List)', function() {
                    log('Setting team_id to a list of ' + teamId());
                    mp.set_group('team_id', [teamId()]);
                }],
                ['Invalid: Add Team Group', function() {
                    log('Adding team_id ' + teamId());
                    mp.add_group('team_id', teamId());
                }],
                ['Remove Team Group', function() {
                    log('Removing team_id ' + teamId());
                    mp.remove_group('team_id', teamId());
                }],
                ['Track With Team Group', function() {
                    log('Tracking HG event with team_id ' + teamId());
                    mp.track_with_groups('HG Team Event!', {}, {team_id: teamId()});
                }]
            ]],
            ['User profile', [
                ['User: Set Property', function() {
                    log('Setting a user property');
                    mp.people.set('plan', 'enterprise');
                }],
                ['User: Set Properties (Map)', function() {
                    log('Setting multiple user properties');
                    mp.people.set({role: 'admin', seats: 5});
                }],
                ['User: Set Property Once', function() {
                    log('Setting a user property once');
                    mp.people.set_once('first_seen', '2026-10-27');
                }],
                ['User: Union Property', function() {
                    log('Union user property');
                    mp.people.union('devices', ['web', 'js']);
                }],
                ['User: Remove Property', function() {
                    log('Removing from user property');
                    mp.people.remove('devices', 'js');
                }],
                ['User: Unset Property', function() {
                    log('Unsetting a user property');
                    mp.people.unset('plan');
                }],
                ['Invalid: User Clear Charges', function() {
                    log('Clearing charges');
                    mp.people.clear_charges();
                }],
                ['User: Delete User', function() {
                    log('Deleting user');
                    mp.people.delete_user();
                }],
                ['Invalid: User Increment', function() {
                    log('Incrementing a user property');
                    mp.people.increment('logins', 1);
                }],
                ['Invalid: User Increment (Map)', function() {
                    log('Incrementing multiple user properties');
                    mp.people.increment({logins: 1, sessions: 2});
                }],
                ['Invalid: User Append', function() {
                    log('Appending to a user property');
                    mp.people.append('history', 'opened_hg_page');
                }],
                ['Invalid: User Track Charge', function() {
                    log('Tracking a charge');
                    mp.people.track_charge(9.99);
                }]
            ]],
            ['Company', groupActions('Company', function() {
                return mp.get_company();
            })],
            ['Team', groupActions('Team', function() {
                return mp.get_group('team_id', teamId());
            })],
            ['Reset', [
                ['Reset', function() {
                    log('Resetting');
                    mp.reset();
                }]
            ]]
        ];
    }

    function render(mp) {
        var container = document.getElementById('actions');
        buildSections(mp).forEach(function(section) {
            var heading = document.createElement('h2');
            heading.textContent = section[0];
            container.appendChild(heading);
            section[1].forEach(function(action) {
                var title = action[0];
                var button = document.createElement('button');
                button.type = 'button';
                button.textContent = title;
                button.addEventListener('click', function() {
                    log('===== ' + title + ' =====');
                    action[1]();
                    document.getElementById('status').textContent = 'Ran: ' + title;
                });
                container.appendChild(button);
            });
        });
        document.getElementById('status').textContent = 'Ready. Open the browser console to see each call.';
    }

    window.mixpanel.init(MIXPANEL_HG_PROJECT_TOKEN, {
        hierarchical_groups: true,
        debug: true,
        track_pageview: false,
        autocapture: false,
        // Send every call as its own request as soon as it is made, so each button's requests
        // show up on their own
        batch_requests: false,
        loaded: render
    }, 'hg');
})();
