/* eslint camelcase: "off" */
/*
 * The hierarchical groups scenarios from the Notion testing doc, one test per section and in the
 * same order.
 *
 * Each test asserts the endpoint a call hits and the request it sends, or that nothing is sent.
 * Edge cases beyond the doc live in hierarchical-groups.js.
 */

import { expect } from 'chai';
import sinon from 'sinon';

import jsdomGlobal from 'jsdom-global';

const TRACK = `/track/`;
const ENGAGE = `/engage/`;
const GROUPS = `/groups/`;

const USER_ID = `my_user_id`;
const COMPANY_ID = `my_company_id`;
const TEAM_ID = `my_team_id`;

// Every /groups write has these top-level keys beside its one operation
const GROUP_MESSAGE_KEYS = [`$token`, `$group_key`, `$group_id`, `$company_id`];

let mixpanel;
let instanceCount = 0;
let instance;
// Each request the library sent, with the endpoint path it went to
let sent;

function newInstance() {
  instanceCount++;
  instance = mixpanel.init(`hg-scenarios-token-${instanceCount}`, {
    persistence: `localStorage`,
    batch_requests: false,
    hierarchical_groups: true,
    error_reporter: () => {},
  }, `hg_scenarios_${instanceCount}`);
  sent = [];
  instance._track_or_batch = (options, callback) => {
    sent.push({endpoint: new URL(options.endpoint).pathname, data: options.data});
    if (callback) {
      callback(1);
    }
  };
}

function identify() {
  instance.identify({user_id: USER_ID, company_id: COMPANY_ID});
}

// Starts a scenario from what the steps before it set up, so it asserts only its own requests
function clearSent() {
  sent = [];
}

function assertNothingSent() {
  expect(sent, `expected no requests`).to.be.empty;
}

function onlySent(endpoint) {
  expect(sent, `expected exactly one request`).to.have.length(1);
  expect(sent[0].endpoint).to.equal(endpoint);
  return sent[0].data;
}

function onlyEvent(eventName) {
  const data = onlySent(TRACK);
  expect(data.event).to.equal(eventName);
  return data.properties;
}

function deviceId() {
  return instance.get_property(`$device_id`);
}

function assertAnonymous(props) {
  expect(props.distinct_id).to.equal(`$device:${deviceId()}`);
  expect(props.$device_id).to.equal(deviceId());
  expect(props).to.not.have.property(`$user_id`);
  expect(props).to.not.have.property(`$company_id`);
}

function assertIdentified(props) {
  expect(props).to.not.have.property(`distinct_id`);
  expect(props.$user_id).to.equal(USER_ID);
  expect(props.$company_id).to.equal(COMPANY_ID);
  expect(props.$device_id).to.equal(deviceId());
}

// Asserts the single /groups request and returns the value of its operation
function onlyGroupsUpdate(groupKey, groupId, operation) {
  const message = onlySent(GROUPS);
  expect(Object.keys(message)).to.have.members(GROUP_MESSAGE_KEYS.concat([operation]));
  expect(message.$group_key).to.equal(groupKey);
  expect(message.$group_id).to.equal(groupId);
  expect(message.$company_id).to.equal(COMPANY_ID);
  return message[operation];
}

function onlyUserUpdate(operation) {
  return onlyGroupsUpdate(`$user_id`, USER_ID, operation);
}

describe(`Hierarchical groups scenarios`, function() {
  // The library binds window and document at import, so load it fresh inside one jsdom
  let teardownJsdom;
  before(function() {
    teardownJsdom = jsdomGlobal(undefined, {url: `http://localhost`});
    Object.keys(require.cache)
      .filter(path => path.includes(`/src/`))
      .forEach(path => delete require.cache[path]);
    mixpanel = require(`../../src/loaders/loader-module`).default;
  });

  after(function() {
    teardownJsdom();
  });

  beforeEach(function() {
    sinon.stub(console, `error`);
    newInstance();
  });

  afterEach(function() {
    sinon.restore();
  });

  it(`Track (Anonymous)`, function() {
    instance.track(`HG Event!`, {source: `hierarchical_groups_page`});

    const props = onlyEvent(`HG Event!`);
    assertAnonymous(props);
    expect(props.source).to.equal(`hierarchical_groups_page`);
  });

  it(`Identify`, function() {
    identify();

    // The first identify also writes the initial referrer, which init() queues as a set_once
    const referrer = sent.filter(s => s.endpoint === GROUPS);
    expect(referrer).to.have.length(1);
    expect(referrer[0].data.$set_once).to.have.property(`$initial_referrer`);
    expect(referrer[0].data.$group_key).to.equal(`$user_id`);
    expect(referrer[0].data.$company_id).to.equal(COMPANY_ID);

    // No $identify: the next event's identity keys tie the device to the user
    expect(sent.filter(s => s.endpoint === TRACK)).to.be.empty;
  });

  it(`Track (Identified)`, function() {
    identify();
    clearSent();
    instance.track(`HG Event!`, {source: `hierarchical_groups_page`});

    const props = onlyEvent(`HG Event!`);
    assertIdentified(props);
    expect(props.source).to.equal(`hierarchical_groups_page`);
  });

  it(`Set User Property`, function() {
    identify();
    clearSent();
    instance.people.set(`plan`, `enterprise`);

    expect(onlyUserUpdate(`$set`).plan).to.equal(`enterprise`);
  });

  it(`Set User Properties`, function() {
    identify();
    clearSent();
    instance.people.set({role: `admin`, seats: 5});

    const set = onlyUserUpdate(`$set`);
    expect(set.role).to.equal(`admin`);
    expect(set.seats).to.equal(5);
  });

  it(`Set Once User Property`, function() {
    identify();
    clearSent();
    instance.people.set_once(`first_seen`, `2026-10-27`);

    expect(onlyUserUpdate(`$set_once`)).to.deep.equal({first_seen: `2026-10-27`});
  });

  it(`Union User Property`, function() {
    identify();
    clearSent();
    instance.people.union(`devices`, [`android`]);

    expect(onlyUserUpdate(`$union`)).to.deep.equal({devices: [`android`]});
  });

  it(`Remove User Property`, function() {
    identify();
    clearSent();
    instance.people.remove(`devices`, `android`);

    expect(onlyUserUpdate(`$remove`)).to.deep.equal({devices: `android`});
  });

  it(`Unset User Property`, function() {
    identify();
    clearSent();
    instance.people.unset(`plan`);

    expect(onlyUserUpdate(`$unset`)).to.deep.equal([`plan`]);
  });

  it(`Delete User`, function() {
    identify();
    clearSent();
    instance.people.delete_user();

    expect(onlyUserUpdate(`$delete`)).to.equal(``);
  });

  it(`Clear Charges (Unsupported)`, function() {
    identify();
    clearSent();
    instance.people.clear_charges();

    assertNothingSent();
  });

  it(`Increment User Property (Unsupported)`, function() {
    identify();
    clearSent();
    instance.people.increment(`logins`, 1);
    instance.people.increment({logins: 1, sessions: 2});

    assertNothingSent();
  });

  it(`Append User Property (Unsupported)`, function() {
    identify();
    clearSent();
    instance.people.append(`history`, `opened_hg_page`);

    assertNothingSent();
  });

  it(`Track Charge (Unsupported)`, function() {
    identify();
    clearSent();
    instance.people.track_charge(9.99);

    assertNothingSent();
  });

  it(`Set Company Property`, function() {
    identify();
    clearSent();
    instance.get_company().set(`tier`, `enterprise`);

    expect(onlyGroupsUpdate(`$company_id`, COMPANY_ID, `$set`)).to.deep.equal({tier: `enterprise`});
  });

  it(`Set Company Property through get_group`, function() {
    identify();
    clearSent();
    instance.get_group(`$company_id`, COMPANY_ID).set(`tier`, `enterprise`);

    expect(onlyGroupsUpdate(`$company_id`, COMPANY_ID, `$set`)).to.deep.equal({tier: `enterprise`});
  });

  it(`Set Company Properties`, function() {
    identify();
    clearSent();
    instance.get_company().set({size: 12, region: `us`});

    expect(onlyGroupsUpdate(`$company_id`, COMPANY_ID, `$set`)).to.deep.equal({size: 12, region: `us`});
  });

  it(`Set Once Company Property`, function() {
    identify();
    clearSent();
    instance.get_company().set_once(`created`, `2026-10-27`);

    expect(onlyGroupsUpdate(`$company_id`, COMPANY_ID, `$set_once`)).to.deep.equal({created: `2026-10-27`});
  });

  it(`Union Company Property`, function() {
    identify();
    clearSent();
    instance.get_company().union(`tags`, [`android`]);

    expect(onlyGroupsUpdate(`$company_id`, COMPANY_ID, `$union`)).to.deep.equal({tags: [`android`]});
  });

  it(`Remove Company Property`, function() {
    identify();
    clearSent();
    instance.get_company().remove(`tags`, `android`);

    expect(onlyGroupsUpdate(`$company_id`, COMPANY_ID, `$remove`)).to.deep.equal({tags: `android`});
  });

  it(`Unset Company Property`, function() {
    identify();
    clearSent();
    instance.get_company().unset(`tier`);

    expect(onlyGroupsUpdate(`$company_id`, COMPANY_ID, `$unset`)).to.deep.equal([`tier`]);
  });

  it(`Set User's Custom Group (set_group)`, function() {
    identify();
    clearSent();
    instance.set_group(`team_id`, TEAM_ID);

    expect(onlyUserUpdate(`$set`).team_id).to.equal(TEAM_ID);
  });

  it(`Track with Custom Group (track_with_groups)`, function() {
    identify();
    clearSent();
    instance.track_with_groups(`HG Team Event!`, null, {team_id: TEAM_ID});

    const props = onlyEvent(`HG Team Event!`);
    assertIdentified(props);
    expect(props.team_id).to.equal(TEAM_ID);
  });

  it(`Track (After set_group)`, function() {
    identify();
    instance.set_group(`team_id`, TEAM_ID);
    clearSent();
    instance.track(`HG Event!`, {source: `hierarchical_groups_page`});

    const props = onlyEvent(`HG Event!`);
    assertIdentified(props);
    // A single value, not a list: hierarchical groups would read ["my_team_id"] as one group
    expect(props.team_id).to.equal(TEAM_ID);
    expect(props.source).to.equal(`hierarchical_groups_page`);
  });

  it(`Remove User's Custom Group (remove_group)`, function() {
    identify();
    instance.set_group(`team_id`, TEAM_ID);
    clearSent();
    instance.remove_group(`team_id`, TEAM_ID);

    expect(onlyUserUpdate(`$unset`)).to.deep.equal([`team_id`]);
    expect(instance.get_property(`team_id`)).to.be.undefined;
  });

  it(`Set Custom Group Property`, function() {
    identify();
    clearSent();
    instance.get_group(`team_id`, TEAM_ID).set(`tier`, `enterprise`);

    expect(onlyGroupsUpdate(`team_id`, TEAM_ID, `$set`)).to.deep.equal({tier: `enterprise`});
  });

  it(`Set Custom Group Properties`, function() {
    identify();
    clearSent();
    instance.get_group(`team_id`, TEAM_ID).set({size: 12, region: `us`});

    expect(onlyGroupsUpdate(`team_id`, TEAM_ID, `$set`)).to.deep.equal({size: 12, region: `us`});
  });

  it(`Set Once Custom Group Property`, function() {
    identify();
    clearSent();
    instance.get_group(`team_id`, TEAM_ID).set_once(`created`, `2026-10-27`);

    expect(onlyGroupsUpdate(`team_id`, TEAM_ID, `$set_once`)).to.deep.equal({created: `2026-10-27`});
  });

  it(`Union Custom Group Property`, function() {
    identify();
    clearSent();
    instance.get_group(`team_id`, TEAM_ID).union(`tags`, [`android`]);

    expect(onlyGroupsUpdate(`team_id`, TEAM_ID, `$union`)).to.deep.equal({tags: [`android`]});
  });

  it(`Remove Custom Group Property`, function() {
    identify();
    clearSent();
    instance.get_group(`team_id`, TEAM_ID).remove(`tags`, `android`);

    expect(onlyGroupsUpdate(`team_id`, TEAM_ID, `$remove`)).to.deep.equal({tags: `android`});
  });

  it(`Unset Custom Group Property`, function() {
    identify();
    clearSent();
    instance.get_group(`team_id`, TEAM_ID).unset(`tier`);

    expect(onlyGroupsUpdate(`team_id`, TEAM_ID, `$unset`)).to.deep.equal([`tier`]);
  });

  it(`Delete Company`, function() {
    identify();
    clearSent();
    instance.get_company()[`delete`]();

    expect(onlyGroupsUpdate(`$company_id`, COMPANY_ID, `$delete`)).to.equal(``);
  });

  it(`Delete Custom Group`, function() {
    identify();
    clearSent();
    instance.get_group(`team_id`, TEAM_ID)[`delete`]();

    expect(onlyGroupsUpdate(`team_id`, TEAM_ID, `$delete`)).to.equal(``);
  });

  it(`Reset`, function() {
    identify();
    instance.set_group(`team_id`, TEAM_ID);
    const oldDeviceId = deviceId();
    clearSent();
    instance.reset();

    assertNothingSent();
    const identity = instance.get_identity();
    expect(identity.user_id).to.be.null;
    expect(identity.company_id).to.be.null;
    expect(identity.device_id).to.not.equal(oldDeviceId);
    expect(instance.get_property(`team_id`)).to.be.undefined;
    expect(instance.has_opted_out_tracking()).to.be.false;
  });

  it(`Track (After Reset)`, function() {
    identify();
    instance.set_group(`team_id`, TEAM_ID);
    instance.reset();
    clearSent();
    instance.track(`HG Event!`, {source: `hierarchical_groups_page`});

    const props = onlyEvent(`HG Event!`);
    assertAnonymous(props);
    expect(props).to.not.have.property(`team_id`);
  });

  it(`Opt Out (Identified)`, function() {
    identify();
    const oldDeviceId = deviceId();
    clearSent();
    instance.opt_out_tracking();

    // The user's profile is deleted; there is no clear_charges $unset of $transactions
    expect(onlyUserUpdate(`$delete`)).to.equal(``);
    expect(instance.has_opted_out_tracking()).to.be.true;
    const identity = instance.get_identity();
    expect(identity.user_id).to.equal(USER_ID);
    expect(identity.company_id).to.equal(COMPANY_ID);
    expect(identity.device_id).to.equal(oldDeviceId);
  });

  it(`Opt Out (Anonymous)`, function() {
    const oldDeviceId = deviceId();
    instance.opt_out_tracking();

    assertNothingSent();
    expect(instance.has_opted_out_tracking()).to.be.true;
    expect(deviceId()).to.equal(oldDeviceId);
  });

  it(`Track (Opted Out)`, function() {
    instance.opt_out_tracking();
    clearSent();
    instance.track(`HG Event!`, {source: `hierarchical_groups_page`});

    assertNothingSent();
  });

  it(`Opt In (Anonymous)`, function() {
    instance.opt_out_tracking();
    clearSent();
    instance.opt_in_tracking();

    assertAnonymous(onlyEvent(`$opt_in`));
    expect(instance.has_opted_out_tracking()).to.be.false;
  });

  it(`Opt In With Identity`, function() {
    instance.opt_out_tracking();
    clearSent();
    instance.opt_in_tracking({identity: {user_id: USER_ID, company_id: COMPANY_ID}});

    // Only $opt_in, carrying the user and company
    const events = sent.filter(s => s.endpoint === TRACK);
    expect(events.map(s => s.data.event)).to.deep.equal([`$opt_in`]);
    events.forEach(s => assertIdentified(s.data.properties));
    expect(sent.filter(s => s.endpoint === ENGAGE)).to.be.empty;
    expect(instance.has_opted_out_tracking()).to.be.false;
  });

  it(`Identify Without Company (Unsupported)`, function() {
    const before = instance.get_identity();
    expect(instance.identify({user_id: USER_ID})).to.equal(-1);

    assertNothingSent();
    expect(instance.get_identity()).to.deep.equal(before);
  });

  it(`Identify With Distinct ID (Unsupported)`, function() {
    const before = instance.get_identity();
    expect(instance.identify(USER_ID)).to.equal(-1);

    assertNothingSent();
    expect(instance.get_identity()).to.deep.equal(before);
  });

  it(`Alias (Unsupported)`, function() {
    identify();
    clearSent();
    expect(instance.alias(`new_alias`)).to.equal(-1);

    assertNothingSent();
    expect(instance.get_identity().user_id).to.equal(USER_ID);
  });

  it(`Opt In With Distinct ID (Unsupported)`, function() {
    instance.opt_out_tracking();
    instance.opt_in_tracking();
    clearSent();
    expect(instance.identify(USER_ID)).to.equal(-1);

    assertNothingSent();
    expect(instance.get_identity().user_id).to.be.null;
  });

  it(`Set User's Custom Groups With a List (Unsupported)`, function() {
    identify();
    clearSent();
    instance.set_group(`team_id`, [TEAM_ID]);

    assertNothingSent();
    expect(instance.get_property(`team_id`)).to.be.undefined;
  });

  it(`Add User's Custom Group (Unsupported)`, function() {
    identify();
    clearSent();
    instance.add_group(`team_id`, TEAM_ID);

    assertNothingSent();
    expect(instance.get_property(`team_id`)).to.be.undefined;
  });

  it(`Set User Property Before Identify`, function() {
    instance.people.set(`plan`, `enterprise`);

    assertNothingSent();
    identify();
    const updates = sent.filter(s => s.endpoint === GROUPS && s.data.$set);
    expect(updates).to.have.length(1);
    expect(updates[0].data.$set.plan).to.equal(`enterprise`);
    expect(updates[0].data.$group_key).to.equal(`$user_id`);
    expect(updates[0].data.$company_id).to.equal(COMPANY_ID);
  });

  it(`Set Company Property Before Identify (Unsupported)`, function() {
    expect(instance.get_company()).to.be.null;

    assertNothingSent();
  });

  it(`Set Custom Group Property Before Identify (Unsupported)`, function() {
    instance.get_group(`team_id`, TEAM_ID).set(`tier`, `enterprise`);

    assertNothingSent();
  });
});
