/* eslint camelcase: "off" */
/*
 * Hierarchical groups is fixed by the hierarchical_groups init option. These tests cover what
 * changes when it is on, and that nothing changes when it is off.
 */

import { expect } from 'chai';
import sinon from 'sinon';

import jsdomGlobal from 'jsdom-global';
import { SessionRecording } from '../../src/recorder/session-recording';
import { MockMixpanelLib } from './test-utils/mock-mixpanel-lib';

let mixpanel;
let instanceCount = 0;
// Messages passed to error_reporter, which report_error calls for every dropped call
let reportedErrors = [];

function reported(message) {
  return reportedErrors.some(error => error.includes(message));
}

function newInstance(config) {
  instanceCount++;
  const instance = mixpanel.init(`hg-token-${instanceCount}`, Object.assign({
    persistence: `localStorage`,
    batch_requests: false,
    error_reporter: error => reportedErrors.push(error.message),
  }, config), `hg_${instanceCount}`);
  const sent = [];
  instance._track_or_batch = (options, callback) => {
    sent.push(options);
    if (callback) {
      callback(1);
    }
  };
  return {instance, sent};
}

function events(sent, name) {
  return sent.filter(o => o.type === `events` && o.data.event === name).map(o => o.data.properties);
}

function lastEvent(sent, name) {
  const matching = events(sent, name);
  expect(matching, `no ${name} event was tracked`).to.not.be.empty;
  return matching[matching.length - 1];
}

// init() queues the initial referrer as a people set_once, which the first identify flushes
function isInitialReferrer(message) {
  return Boolean(message.$set_once) && `$initial_referrer` in message.$set_once;
}

function groupMessages(sent) {
  return sent.filter(o => o.type === `groups`).map(o => o.data).filter(m => !isInitialReferrer(m));
}

function peopleMessages(sent) {
  return sent.filter(o => o.type === `people`).map(o => o.data).filter(m => !isInitialReferrer(m));
}

describe(`Hierarchical groups`, function() {
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
    reportedErrors = [];
    sinon.stub(console, `error`);
  });

  afterEach(function() {
    sinon.restore();
  });

  describe(`events`, function() {
    it(`carry user, company and device after identify`, function() {
      const {instance, sent} = newInstance({hierarchical_groups: true});
      instance.identify({user_id: `user_123`, company_id: `acme`});
      instance.track(`Viewed Report`);

      const props = lastEvent(sent, `Viewed Report`);
      expect(props.$user_id).to.equal(`user_123`);
      expect(props.$company_id).to.equal(`acme`);
      expect(props.$device_id).to.equal(instance.get_property(`$device_id`));
      // No distinct_id; ingestion resolves the user from the identity keys
      expect(props).to.not.have.property(`distinct_id`);
    });

    it(`carry the new company on $identify`, function() {
      const {instance, sent} = newInstance({hierarchical_groups: true});
      instance.identify({user_id: `user_123`, company_id: `acme`});

      const props = lastEvent(sent, `$identify`);
      expect(props.$company_id).to.equal(`acme`);
      expect(props.$user_id).to.equal(`user_123`);
    });

    it(`carry no company while anonymous`, function() {
      const {instance, sent} = newInstance({hierarchical_groups: true});
      instance.track(`Opened`);

      const props = lastEvent(sent, `Opened`);
      expect(props).to.not.have.property(`$company_id`);
      expect(props).to.not.have.property(`$user_id`);
      expect(props).to.have.property(`$device_id`);
    });
  });

  describe(`identify`, function() {
    it(`treats a company change as an identity change`, function() {
      const {instance, sent} = newInstance({hierarchical_groups: true});
      instance.identify({user_id: `user_123`, company_id: `acme`});
      instance.identify({user_id: `user_123`, company_id: `acme`});
      expect(events(sent, `$identify`)).to.have.length(1);

      instance.identify({user_id: `user_123`, company_id: `globex`});
      expect(events(sent, `$identify`)).to.have.length(2);

      instance.track(`Viewed Report`);
      expect(lastEvent(sent, `Viewed Report`).$company_id).to.equal(`globex`);
    });

    it(`rejects a distinct id`, function() {
      const {instance, sent} = newInstance({hierarchical_groups: true});
      const anonymous = instance.get_distinct_id();
      expect(instance.identify(`user_123`)).to.equal(-1);
      expect(instance.identify()).to.equal(-1);

      expect(instance.get_distinct_id()).to.equal(anonymous);
      expect(instance.get_identity().user_id).to.be.null;
      expect(events(sent, `$identify`)).to.be.empty;
      expect(reported(`identify(string) is not supported for hierarchical groups projects`)).to.be.true;
    });

    it(`keeps the current identity when given a distinct id`, function() {
      const {instance, sent} = newInstance({hierarchical_groups: true});
      instance.identify({user_id: `user_123`, company_id: `acme`});
      instance.identify(`user_456`);
      instance.track(`Viewed Report`);

      expect(instance.get_identity().user_id).to.equal(`user_123`);
      expect(instance.get_identity().company_id).to.equal(`acme`);
      expect(lastEvent(sent, `Viewed Report`).$company_id).to.equal(`acme`);
      expect(events(sent, `$identify`)).to.have.length(1);
    });

    it(`rejects an identity without a company`, function() {
      const {instance, sent} = newInstance({hierarchical_groups: true});
      const anonymous = instance.get_distinct_id();
      expect(instance.identify({user_id: `user_123`})).to.equal(-1);

      expect(instance.get_distinct_id()).to.equal(anonymous);
      expect(instance.get_identity().user_id).to.be.null;
      expect(events(sent, `$identify`)).to.be.empty;
      expect(reported(`Can't identify {"user_id":"user_123"}: hierarchical groups projects ` +
        `identify a user by company and user id, so both are required. Nothing was identified.`)).to.be.true;
    });

    it(`keeps the current identity when given one without a company`, function() {
      const {instance, sent} = newInstance({hierarchical_groups: true});
      instance.identify({user_id: `user_123`, company_id: `acme`});
      instance.identify({user_id: `user_456`});

      expect(instance.get_identity().user_id).to.equal(`user_123`);
      expect(instance.get_identity().company_id).to.equal(`acme`);
      expect(events(sent, `$identify`)).to.have.length(1);
    });

    it(`ignores invalid identities`, function() {
      const {instance, sent} = newInstance({hierarchical_groups: true});
      const anonymous = instance.get_distinct_id();
      expect(instance.identify({company_id: `acme`})).to.equal(-1);
      expect(instance.identify({user_id: null, company_id: `acme`})).to.equal(-1);
      expect(instance.identify({user_id: ``, company_id: `acme`})).to.equal(-1);
      expect(instance.identify({user_id: `user_123`, company_id: ``})).to.equal(-1);
      expect(instance.identify({user_id: `user_123`, company_id: null})).to.equal(-1);

      expect(instance.get_distinct_id()).to.equal(anonymous);
      expect(instance.get_identity().company_id).to.be.null;
      expect(events(sent, `$identify`)).to.be.empty;
    });

    it(`lets the company override a stale super property`, function() {
      const {instance, sent} = newInstance({hierarchical_groups: true});
      instance.register({'$company_id': `stale`});
      instance.identify({user_id: `user_123`, company_id: `acme`});
      instance.track(`Viewed Report`);

      expect(lastEvent(sent, `Viewed Report`).$company_id).to.equal(`acme`);
    });

    it(`does nothing while opted out`, function() {
      const {instance, sent} = newInstance({hierarchical_groups: true});
      instance.opt_out_tracking();
      expect(instance.identify({user_id: `user_123`, company_id: `acme`})).to.equal(-1);

      expect(instance.get_identity().company_id).to.be.null;
      expect(events(sent, `$identify`)).to.be.empty;
    });

    it(`ignores a device_id on the identity`, function() {
      const {instance, sent} = newInstance({hierarchical_groups: true});
      const deviceId = instance.get_property(`$device_id`);
      instance.identify({user_id: `user_123`, company_id: `acme`, device_id: `another-device`});
      instance.track(`Viewed Report`);

      expect(instance.get_property(`$device_id`)).to.equal(deviceId);
      expect(lastEvent(sent, `Viewed Report`).$device_id).to.equal(deviceId);
    });

    it(`clears the company on reset`, function() {
      const {instance, sent} = newInstance({hierarchical_groups: true});
      instance.identify({user_id: `user_123`, company_id: `acme`});
      instance.set_group(`team`, `finance`);
      instance.reset();
      instance.track(`Opened`);

      expect(instance.get_identity().user_id).to.be.null;
      expect(instance.get_identity().company_id).to.be.null;
      const props = lastEvent(sent, `Opened`);
      expect(props).to.not.have.property(`$company_id`);
      expect(props).to.not.have.property(`team`);
    });

    it(`can identify again after reset`, function() {
      const {instance, sent} = newInstance({hierarchical_groups: true});
      instance.identify({user_id: `user_123`, company_id: `acme`});
      instance.reset();
      instance.identify({user_id: `user_456`, company_id: `globex`});
      instance.track(`Viewed Report`);

      const props = lastEvent(sent, `Viewed Report`);
      expect(props.$user_id).to.equal(`user_456`);
      expect(props.$company_id).to.equal(`globex`);
      expect(events(sent, `$identify`)).to.have.length(2);
    });
  });

  describe(`alias`, function() {
    it(`is dropped`, function() {
      const {instance, sent} = newInstance({hierarchical_groups: true});
      instance.identify({user_id: `user_123`, company_id: `acme`});
      expect(instance.alias(`new_id`)).to.equal(-1);

      expect(events(sent, `$create_alias`)).to.be.empty;
      expect(instance.get_identity().user_id).to.equal(`user_123`);
      expect(reported(`alias is not supported for hierarchical groups projects`)).to.be.true;
    });

    it(`still works when disabled`, function() {
      const {instance, sent} = newInstance();
      instance.identify(`user_123`);
      instance.alias(`new_id`);

      expect(events(sent, `$create_alias`)).to.have.length(1);
    });
  });

  describe(`get_identity and get_distinct_id`, function() {
    it(`report user, company and device`, function() {
      const {instance} = newInstance({hierarchical_groups: true});
      const deviceId = instance.get_property(`$device_id`);
      expect(instance.get_identity()).to.deep.equal({user_id: null, company_id: null, device_id: deviceId});

      instance.identify({user_id: `user_123`, company_id: `acme`});
      expect(instance.get_identity()).to.deep.equal({user_id: `user_123`, company_id: `acme`, device_id: deviceId});
    });

    it(`accepts back what get_identity reports without an identity change`, function() {
      const {instance, sent} = newInstance({hierarchical_groups: true});
      instance.identify({user_id: `user_123`, company_id: `acme`});
      instance.identify(instance.get_identity());

      expect(events(sent, `$identify`)).to.have.length(1);
    });

    it(`returns the device form before identify`, function() {
      const {instance} = newInstance({hierarchical_groups: true});
      expect(instance.get_distinct_id()).to.equal(`$device:` + instance.get_property(`$device_id`));
    });

    it(`combines company and user once both are known`, function() {
      const {instance} = newInstance({hierarchical_groups: true});
      instance.identify({user_id: `user_123`, company_id: `acme`});
      expect(instance.get_distinct_id()).to.equal(`$company:acme|$user:user_123`);
    });

    it(`stays on the device until a company is known`, function() {
      const {instance} = newInstance({hierarchical_groups: true});
      instance.identify(`user_123`);
      expect(instance.get_distinct_id()).to.equal(`$device:` + instance.get_property(`$device_id`));
    });

    it(`stays on the device for a user identified before hierarchical groups was enabled`, function() {
      const {instance} = newInstance({hierarchical_groups: true});
      instance.register({'$user_id': `user_123`, 'distinct_id': `user_123`});
      expect(instance.get_distinct_id()).to.equal(`$device:` + instance.get_property(`$device_id`));
    });

    it(`returns to the device form on reset`, function() {
      const {instance} = newInstance({hierarchical_groups: true});
      instance.identify({user_id: `user_123`, company_id: `acme`});
      instance.reset();
      expect(instance.get_distinct_id()).to.equal(`$device:` + instance.get_property(`$device_id`));
    });

    it(`report no company when disabled`, function() {
      const {instance} = newInstance();
      instance.identify(`user_123`);
      expect(instance.get_identity()).to.deep.equal({
        user_id: `user_123`, company_id: null, device_id: instance.get_property(`$device_id`),
      });
      expect(instance.get_distinct_id()).to.equal(`user_123`);
    });
  });

  describe(`user profiles`, function() {
    it(`are written to /groups as the $user_id group profile`, function() {
      const {instance, sent} = newInstance({hierarchical_groups: true});
      instance.identify({user_id: `user_123`, company_id: `acme`});
      instance.people.set(`plan`, `pro`);
      instance.people.set_once(`first_seen`, `today`);
      instance.people.union(`roles`, [`admin`]);
      instance.people.remove(`roles`, `viewer`);
      instance.people.unset(`legacy`);
      instance.people.delete_user();

      expect(peopleMessages(sent)).to.be.empty;
      const messages = groupMessages(sent);
      expect(messages.map(m => Object.keys(m).find(k => [`$set`, `$set_once`, `$union`, `$remove`, `$unset`, `$delete`].includes(k))))
        .to.deep.equal([`$set`, `$set_once`, `$union`, `$remove`, `$unset`, `$delete`]);
      messages.forEach(m => {
        expect(m.$group_key).to.equal(`$user_id`);
        expect(m.$group_id).to.equal(`user_123`);
        expect(m.$company_id).to.equal(`acme`);
        expect(m).to.not.have.property(`$distinct_id`);
      });
      expect(messages[0].$set.plan).to.equal(`pro`);
      expect(messages[5].$delete).to.equal(``);
    });

    it(`receive the initial referrer that init() queues`, function() {
      const {instance, sent} = newInstance({hierarchical_groups: true});
      instance.identify({user_id: `user_123`, company_id: `acme`});

      const initial = sent.filter(o => o.type === `groups`).map(o => o.data).filter(isInitialReferrer);
      expect(initial).to.have.length(1);
      expect(initial[0].$group_key).to.equal(`$user_id`);
      expect(initial[0].$company_id).to.equal(`acme`);
    });

    it(`drops operations /groups does not support`, function() {
      const {instance, sent} = newInstance({hierarchical_groups: true});
      instance.identify({user_id: `user_123`, company_id: `acme`});
      const callback = sinon.spy();
      instance.people.increment(`logins`, 1, callback);
      instance.people.append(`history`, `a`);
      instance.people.track_charge(9.99);
      instance.people.clear_charges();

      expect(groupMessages(sent)).to.be.empty;
      expect(peopleMessages(sent)).to.be.empty;
      expect(callback.calledOnceWith(0)).to.be.true;
      expect(reported(`$add is not supported for hierarchical groups projects, whose user ` +
        `profiles are group profiles keyed by $user_id. Supported operations are [$set, $set_once, $unset, ` +
        `$union, $remove, $delete]`)).to.be.true;
      expect(reported(`clear_charges is not supported for hierarchical groups projects`)).to.be.true;
    });

    it(`drops unsupported operations made before identify instead of queueing them`, function() {
      const {instance, sent} = newInstance({hierarchical_groups: true});
      instance.people.increment(`logins`, 1);
      instance.people.append(`history`, `a`);
      instance.identify({user_id: `user_123`, company_id: `acme`});

      expect(groupMessages(sent)).to.be.empty;
      expect(peopleMessages(sent)).to.be.empty;
    });

    it(`queues updates made before identify and writes them to /groups after`, function() {
      const {instance, sent} = newInstance({hierarchical_groups: true});
      instance.people.set(`plan`, `pro`);
      expect(groupMessages(sent)).to.be.empty;

      instance.identify({user_id: `user_123`, company_id: `acme`});
      const messages = groupMessages(sent);
      expect(messages).to.have.length(1);
      expect(messages[0].$set.plan).to.equal(`pro`);
      expect(messages[0].$company_id).to.equal(`acme`);
    });

    it(`stay queued while only a distinct id was given`, function() {
      const {instance, sent} = newInstance({hierarchical_groups: true});
      instance.identify(`user_123`);
      instance.people.set(`plan`, `pro`);

      expect(groupMessages(sent)).to.be.empty;
      expect(peopleMessages(sent)).to.be.empty;
    });

    it(`delete the user on opt-out without clearing charges`, function() {
      const {instance, sent} = newInstance({hierarchical_groups: true});
      instance.identify({user_id: `user_123`, company_id: `acme`});
      instance.opt_out_tracking();

      const messages = groupMessages(sent);
      expect(messages).to.have.length(1);
      expect(messages[0]).to.have.property(`$delete`);
      expect(messages[0].$group_key).to.equal(`$user_id`);
      expect(messages[0].$group_id).to.equal(`user_123`);
      expect(messages[0].$company_id).to.equal(`acme`);
      expect(peopleMessages(sent)).to.be.empty;
    });

    it(`are written through set_group too`, function() {
      const {instance, sent} = newInstance({hierarchical_groups: true});
      instance.identify({user_id: `user_123`, company_id: `acme`});
      instance.set_group(`team`, `finance`);

      const messages = groupMessages(sent);
      expect(messages).to.have.length(1);
      expect(messages[0].$group_key).to.equal(`$user_id`);
      expect(messages[0].$set.team).to.equal(`finance`);
      expect(peopleMessages(sent)).to.be.empty;
    });
  });

  describe(`custom group membership`, function() {
    function identified() {
      const created = newInstance({hierarchical_groups: true});
      created.instance.identify({user_id: `user_123`, company_id: `acme`});
      return created;
    }

    it(`sends a single value on events`, function() {
      const {instance, sent} = identified();
      instance.set_group(`team`, `finance`);
      instance.track(`Viewed Report`);

      expect(lastEvent(sent, `Viewed Report`).team).to.equal(`finance`);
      expect(instance.get_property(`team`)).to.equal(`finance`);
    });

    it(`drops set_group with a list`, function() {
      const {instance, sent} = identified();
      const callback = sinon.spy();
      instance.set_group(`team`, [`finance`], callback);
      instance.set_group(`team`, [`finance`, `sales`]);
      instance.track(`Viewed Report`);

      expect(lastEvent(sent, `Viewed Report`)).to.not.have.property(`team`);
      expect(groupMessages(sent)).to.be.empty;
      expect(callback.calledOnceWith(0)).to.be.true;
      expect(reported(`set_group with a list is not supported for hierarchical groups ` +
        `projects, which allow one team per user. Use set_group(group_key, group_id). The update was dropped.`)).to.be.true;
    });

    it(`drops add_group`, function() {
      const {instance, sent} = identified();
      instance.add_group(`team`, `finance`);
      instance.track(`Viewed Report`);

      expect(lastEvent(sent, `Viewed Report`)).to.not.have.property(`team`);
      expect(groupMessages(sent)).to.be.empty;
      expect(reported(`add_group is not supported for hierarchical groups projects`)).to.be.true;
    });

    it(`drops add_group to a second group`, function() {
      const {instance, sent} = identified();
      instance.set_group(`team`, `finance`);
      instance.add_group(`team`, `sales`);
      instance.track(`Viewed Report`);

      expect(lastEvent(sent, `Viewed Report`).team).to.equal(`finance`);
      expect(groupMessages(sent)).to.have.length(1);
    });

    it(`clears the group on remove_group`, function() {
      const {instance, sent} = identified();
      instance.set_group(`team`, `finance`);
      instance.remove_group(`team`, `finance`);
      instance.track(`Viewed Report`);

      expect(lastEvent(sent, `Viewed Report`)).to.not.have.property(`team`);
      const messages = groupMessages(sent);
      expect(messages).to.have.length(2);
      expect(messages[1].$unset).to.deep.equal([`team`]);
      expect(messages[1].$group_key).to.equal(`$user_id`);
    });

    it(`does nothing on remove_group of another group`, function() {
      const {instance, sent} = identified();
      instance.set_group(`team`, `finance`);
      instance.remove_group(`team`, `sales`);
      instance.remove_group(`region`, `emea`);
      instance.track(`Viewed Report`);

      expect(lastEvent(sent, `Viewed Report`).team).to.equal(`finance`);
      expect(groupMessages(sent)).to.have.length(1);
    });

    it(`clears a list stored before hierarchical groups on remove_group`, function() {
      const {instance, sent} = identified();
      instance.register({team: [`finance`]});
      instance.remove_group(`team`, `finance`);
      instance.track(`Viewed Report`);

      expect(lastEvent(sent, `Viewed Report`)).to.not.have.property(`team`);
      expect(groupMessages(sent)[0].$unset).to.deep.equal([`team`]);
    });

    it(`tracks track_with_groups with a single value`, function() {
      const {instance, sent} = identified();
      instance.track_with_groups(`Viewed Report`, {}, {team: `finance`});

      expect(lastEvent(sent, `Viewed Report`).team).to.equal(`finance`);
    });

    it(`drops track_with_groups with a list`, function() {
      const {instance, sent} = identified();
      const callback = sinon.spy();
      instance.track_with_groups(`Viewed Report`, {}, {region: `emea`, team: [`finance`]}, callback);
      instance.track_with_groups(`Viewed Report`, {}, {team: [`finance`, `sales`]});

      expect(events(sent, `Viewed Report`)).to.be.empty;
      expect(callback.calledOnceWith(0)).to.be.true;
      expect(reported(`track_with_groups with a list is not supported for hierarchical groups ` +
        `projects, which allow one team per user. Use one group id per key. The event was dropped.`)).to.be.true;
    });

    it(`passes a list through track_with_groups when disabled`, function() {
      const {instance, sent} = newInstance();
      instance.track_with_groups(`Viewed Report`, {}, {team: [`finance`, `sales`]});

      expect(lastEvent(sent, `Viewed Report`).team).to.deep.equal([`finance`, `sales`]);
      expect(reportedErrors).to.be.empty;
    });

    it(`stays a list when disabled`, function() {
      const {instance, sent} = newInstance();
      instance.set_group(`team`, `finance`);
      instance.add_group(`team`, `sales`);
      instance.track(`Viewed Report`);

      expect(lastEvent(sent, `Viewed Report`).team).to.deep.equal([`finance`, `sales`]);
    });
  });

  describe(`group profiles`, function() {
    it(`carry the company, including the company's own profile`, function() {
      const {instance, sent} = newInstance({hierarchical_groups: true});
      instance.identify({user_id: `user_123`, company_id: `acme`});
      instance.get_group(`$company_id`, `acme`).set(`tier`, `enterprise`);
      instance.get_group(`team`, `finance`).set(`size`, 12);

      const messages = groupMessages(sent);
      expect(messages).to.have.length(2);
      expect(messages[0].$group_key).to.equal(`$company_id`);
      expect(messages[0].$company_id).to.equal(`acme`);
      expect(messages[0].$set).to.not.have.property(`$company_id`);
      expect(messages[1].$group_key).to.equal(`team`);
      expect(messages[1].$company_id).to.equal(`acme`);
    });

    it(`are dropped until a company is known`, function() {
      const {instance, sent} = newInstance({hierarchical_groups: true});
      instance.get_group(`team`, `finance`).set(`size`, 12);

      expect(groupMessages(sent)).to.be.empty;
      expect(reported(`Group profile updates for hierarchical groups projects require a ` +
        `company. Call identify({user_id: user_id, company_id: company_id}) first. The update to team=finance ` +
        `was dropped.`)).to.be.true;
    });
  });

  describe(`get_company`, function() {
    it(`updates the identified company`, function() {
      const {instance, sent} = newInstance({hierarchical_groups: true});
      instance.identify({user_id: `user_123`, company_id: `acme`});
      instance.get_company().set(`tier`, `enterprise`);

      const messages = groupMessages(sent);
      expect(messages).to.have.length(1);
      expect(messages[0].$group_key).to.equal(`$company_id`);
      expect(messages[0].$group_id).to.equal(`acme`);
      expect(messages[0].$company_id).to.equal(`acme`);
      expect(messages[0].$set.tier).to.equal(`enterprise`);
      expect(instance.get_company()).to.equal(instance.get_group(`$company_id`, `acme`));
    });

    it(`returns null before identify`, function() {
      const {instance} = newInstance({hierarchical_groups: true});

      expect(instance.get_company()).to.be.null;
      expect(reportedErrors.filter(error => error.includes(`get_company()`))).to.have.length(1);
      expect(reported(`get_company() needs a company. Call identify({user_id: user_id, ` +
        `company_id: company_id}) first.`)).to.be.true;
      expect(reported(`The update was dropped.`)).to.be.false;
    });

    it(`returns null when disabled`, function() {
      const {instance} = newInstance();

      expect(instance.get_company()).to.be.null;
      expect(reportedErrors.filter(error => error.includes(`get_company()`))).to.have.length(1);
      expect(reported(`get_company() is only for hierarchical groups projects, enabled ` +
        `with the hierarchical_groups init option.`)).to.be.true;
      expect(reported(`The update was dropped.`)).to.be.false;
    });

    it(`keeps the company it was called with`, function() {
      const {instance, sent} = newInstance({hierarchical_groups: true});
      instance.identify({user_id: `user_123`, company_id: `acme`});
      const company = instance.get_company();
      instance.identify({user_id: `user_123`, company_id: `globex`});
      company.set(`tier`, `enterprise`);

      expect(groupMessages(sent)[0].$group_id).to.equal(`acme`);
    });
  });

  describe(`opt in and out`, function() {
    it(`opts in with an identity`, function() {
      const {instance, sent} = newInstance({hierarchical_groups: true});
      instance.identify({user_id: `user_123`, company_id: `acme`});
      instance.opt_out_tracking();
      instance.reset();
      instance.opt_in_tracking({identity: {user_id: `user_123`, company_id: `acme`}});

      expect(instance.has_opted_out_tracking()).to.be.false;
      const props = lastEvent(sent, `$opt_in`);
      expect(props.$user_id).to.equal(`user_123`);
      expect(props.$company_id).to.equal(`acme`);
      expect(instance.get_identity().company_id).to.equal(`acme`);
      expect(events(sent, `$identify`)).to.have.length(2);
    });

    it(`stays opted out for a string identity`, function() {
      const {instance, sent} = newInstance({hierarchical_groups: true});
      instance.opt_out_tracking();
      instance.opt_in_tracking({identity: `user_123`});

      expect(instance.has_opted_out_tracking()).to.be.true;
      expect(events(sent, `$opt_in`)).to.be.empty;
      expect(reported(`identify(string) is not supported`)).to.be.true;
      expect(reported(`The user is still opted out.`)).to.be.true;
    });

    it(`stays opted out for an identity without a company`, function() {
      const {instance, sent} = newInstance({hierarchical_groups: true});
      instance.opt_out_tracking();
      instance.opt_in_tracking({identity: {user_id: `user_123`}});

      expect(instance.has_opted_out_tracking()).to.be.true;
      expect(events(sent, `$opt_in`)).to.be.empty;
      expect(reported(`so both are required. The user is still opted out.`)).to.be.true;
    });

    it(`opts in with an identity and properties`, function() {
      const {instance, sent} = newInstance({hierarchical_groups: true});
      instance.opt_out_tracking();
      instance.opt_in_tracking({
        identity: {user_id: `user_123`, company_id: `acme`},
        track_properties: {source: `settings`},
      });

      const props = lastEvent(sent, `$opt_in`);
      expect(props.source).to.equal(`settings`);
      expect(props.$company_id).to.equal(`acme`);
    });

    it(`identifies even when the opt-in event is not tracked`, function() {
      const {instance, sent} = newInstance({hierarchical_groups: true});
      instance.opt_out_tracking();
      instance.opt_in_tracking({identity: {user_id: `user_123`, company_id: `acme`}, track: null});

      expect(events(sent, `$opt_in`)).to.be.empty;
      expect(instance.get_identity().company_id).to.equal(`acme`);
    });

    it(`still opts in without arguments`, function() {
      const {instance, sent} = newInstance({hierarchical_groups: true});
      instance.opt_out_tracking();
      instance.opt_in_tracking();

      expect(instance.has_opted_out_tracking()).to.be.false;
      expect(events(sent, `$opt_in`)).to.have.length(1);
    });

    it(`opts in anonymously after reset without an identity`, function() {
      const {instance, sent} = newInstance({hierarchical_groups: true});
      instance.identify({user_id: `user_123`, company_id: `acme`});
      instance.opt_out_tracking();
      instance.reset();
      instance.opt_in_tracking({identity: null, track_properties: {source: `settings`}});

      const props = lastEvent(sent, `$opt_in`);
      expect(props.source).to.equal(`settings`);
      expect(props).to.not.have.property(`$company_id`);
      expect(props).to.not.have.property(`$user_id`);
    });

    it(`opts in with an identity naming only a user when disabled`, function() {
      const {instance, sent} = newInstance();
      instance.opt_out_tracking();
      instance.opt_in_tracking({identity: {user_id: `user_123`}});

      expect(lastEvent(sent, `$opt_in`).$user_id).to.equal(`user_123`);
    });

    it(`stays opted out for an identity naming a company when disabled`, function() {
      const {instance, sent} = newInstance();
      instance.opt_out_tracking();
      instance.opt_in_tracking({identity: {user_id: `user_123`, company_id: `acme`}});

      expect(instance.has_opted_out_tracking()).to.be.true;
      expect(events(sent, `$opt_in`)).to.be.empty;
      expect(reported(`a company requires the hierarchical_groups init option`)).to.be.true;
    });

    it(`still clears charges on opt-out when disabled`, function() {
      const {instance, sent} = newInstance();
      instance.identify(`user_123`);
      instance.opt_out_tracking();

      const people = peopleMessages(sent);
      expect(people.map(m => Object.keys(m).find(k => k === `$delete` || k === `$set`))).to.deep.equal([`$delete`, `$set`]);
      expect(people[1].$set.$transactions).to.deep.equal([]);
    });
  });

  describe(`when disabled`, function() {
    it(`ignores an identity naming a company`, function() {
      const {instance, sent} = newInstance();
      const anonymous = instance.get_distinct_id();
      expect(instance.identify({user_id: `user_123`, company_id: `acme`})).to.equal(-1);

      expect(instance.get_distinct_id()).to.equal(anonymous);
      expect(events(sent, `$identify`)).to.be.empty;
    });

    it(`accepts an identity without a company`, function() {
      const {instance, sent} = newInstance();
      instance.identify({user_id: `user_123`});
      expect(instance.get_distinct_id()).to.equal(`user_123`);
      expect(events(sent, `$identify`)).to.have.length(1);
    });

    it(`rejects an identity without a user`, function() {
      const {instance} = newInstance();
      expect(instance.identify({company_id: null})).to.equal(-1);
      expect(reported(`without a user_id. Nothing was identified.`)).to.be.true;
    });

    it(`sends people updates to /engage and groups without a company`, function() {
      const {instance, sent} = newInstance();
      instance.identify(`user_123`);
      instance.people.set(`plan`, `pro`);
      instance.people.increment(`logins`, 1);
      instance.get_group(`team`, `finance`).set(`size`, 12);
      instance.track(`Viewed Report`);

      const people = peopleMessages(sent);
      expect(people).to.have.length(2);
      expect(people[0].$distinct_id).to.equal(`user_123`);
      expect(groupMessages(sent)[0]).to.not.have.property(`$company_id`);
      expect(lastEvent(sent, `Viewed Report`)).to.not.have.property(`$company_id`);
      expect(instance.get_identity().company_id).to.be.null;
    });
  });

  describe(`config`, function() {
    it(`is read once in init`, function() {
      const {instance} = newInstance({hierarchical_groups: true});
      instance.set_config({hierarchical_groups: false});

      instance.identify({user_id: `user_123`, company_id: `acme`});
      expect(instance.get_identity().company_id).to.equal(`acme`);
    });

    it(`keeps reporting the init value after set_config`, function() {
      const {instance: enabled} = newInstance({hierarchical_groups: true});
      enabled.set_config({hierarchical_groups: false});
      expect(enabled.get_config(`hierarchical_groups`)).to.equal(true);

      // a remote setting or set_config can't turn session recording's checks on for a legacy project
      const {instance: disabled} = newInstance();
      disabled.set_config({hierarchical_groups: true});
      expect(disabled.get_config(`hierarchical_groups`)).to.equal(false);
    });
  });

  describe(`flags`, function() {
    let fetch;

    beforeEach(function() {
      fetch = sinon.stub().callsFake(() => Promise.resolve({
        json: () => Promise.resolve({
          flags: {
            checkout_flow: {
              variant_key: `treatment`,
              variant_value: true,
              experiment_id: `exp_1`,
              is_experiment_active: true,
            },
          },
          pending_first_time_events: [{
            flag_key: `checkout_flow`,
            flag_id: `flag_1`,
            project_id: 123,
            first_time_event_hash: `HASH`,
            event_name: `Signed Up`,
            pending_variant: {variant_key: `pending`, variant_value: `pending`},
          }],
        }),
      }));
      window.fetch = fetch;
    });

    afterEach(function() {
      delete window.fetch;
    });

    // Waits for the fetch init() starts, so later fetches are the ones under test
    async function newFlagsInstance(config) {
      const result = newInstance(Object.assign({flags: true}, config));
      await result.instance.flags.persistenceLoadedPromise;
      await result.instance.flags.fetchPromise;
      return result;
    }

    function flagsRequests() {
      return fetch.getCalls().filter(call => call.args[1].method === `GET`);
    }

    function lastFlagsContext() {
      const requests = flagsRequests();
      const url = new URL(requests[requests.length - 1].args[0]);
      return JSON.parse(url.searchParams.get(`context`));
    }

    it(`send the user and company in the context after identify`, async function() {
      const {instance} = await newFlagsInstance({hierarchical_groups: true});
      instance.identify({user_id: `user_123`, company_id: `company_123`});
      await instance.flags.fetchPromise;

      expect(lastFlagsContext()).to.deep.equal({
        distinct_id: `user_123`,
        device_id: instance.get_property(`$device_id`),
        $user_id: `user_123`,
        $company_id: `company_123`,
      });
    });

    it(`send no user or company in the context before identify`, async function() {
      const {instance} = await newFlagsInstance({hierarchical_groups: true});

      expect(flagsRequests()).to.have.length(1);
      expect(JSON.stringify(lastFlagsContext())).to.equal(JSON.stringify({
        distinct_id: instance.get_property(`distinct_id`),
        device_id: instance.get_property(`$device_id`),
      }));
    });

    it(`refetch with the new company when it changes`, async function() {
      const {instance} = await newFlagsInstance({hierarchical_groups: true});
      instance.identify({user_id: `user_123`, company_id: `company_123`});
      instance.identify({user_id: `user_123`, company_id: `company_456`});
      await instance.flags.fetchPromise;

      expect(flagsRequests()).to.have.length(3);
      expect(lastFlagsContext().$company_id).to.equal(`company_456`);
      expect(lastFlagsContext().distinct_id).to.equal(`user_123`);
    });

    it(`let the configured context override the user and company`, async function() {
      const {instance} = await newFlagsInstance({
        hierarchical_groups: true,
        flags: {context: {$company_id: `configured`}},
      });
      instance.identify({user_id: `user_123`, company_id: `company_123`});
      await instance.flags.fetchPromise;

      expect(lastFlagsContext().$company_id).to.equal(`configured`);
      expect(lastFlagsContext().$user_id).to.equal(`user_123`);
    });

    it(`send the context unchanged when disabled`, async function() {
      const {instance} = await newFlagsInstance({});
      instance.identify(`user_123`);
      await instance.flags.fetchPromise;

      // $user_id is a super property after identify, but only hierarchical groups sends it
      expect(instance.get_property(`$user_id`)).to.equal(`user_123`);
      expect(JSON.stringify(lastFlagsContext())).to.equal(JSON.stringify({
        distinct_id: `user_123`,
        device_id: instance.get_property(`$device_id`),
      }));
    });

    function firstTimeEventBody() {
      const posts = fetch.getCalls().filter(call => call.args[1].method === `POST`);
      expect(posts).to.have.length(1);
      expect(posts[0].args[0]).to.include(`/flag_1/first-time-events`);
      return posts[0].args[1].body;
    }

    it(`send the user and company when recording a first-time event`, async function() {
      const {instance} = await newFlagsInstance({hierarchical_groups: true});
      instance.identify({user_id: `user_123`, company_id: `company_123`});
      await instance.flags.fetchPromise;
      instance.track(`Signed Up`);
      // The match waits on the bundled targeting library's promise
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(firstTimeEventBody()).to.equal(JSON.stringify({
        project_id: 123,
        first_time_event_hash: `HASH`,
        $user_id: `user_123`,
        $company_id: `company_123`,
      }));
    });

    it(`record a first-time event unchanged when disabled`, async function() {
      const {instance} = await newFlagsInstance({});
      instance.identify(`user_123`);
      await instance.flags.fetchPromise;
      instance.track(`Signed Up`);
      // The match waits on the bundled targeting library's promise
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(firstTimeEventBody()).to.equal(JSON.stringify({
        distinct_id: `user_123`,
        project_id: 123,
        first_time_event_hash: `HASH`,
      }));
    });

    it(`track $experiment_started with the user and company`, async function() {
      const {instance, sent} = await newFlagsInstance({hierarchical_groups: true});
      instance.identify({user_id: `user_123`, company_id: `company_123`});
      await instance.flags.fetchPromise;
      instance.flags.get_variant_sync(`checkout_flow`, null);

      const props = lastEvent(sent, `$experiment_started`);
      expect(props[`Experiment name`]).to.equal(`checkout_flow`);
      expect(props.$user_id).to.equal(`user_123`);
      expect(props.$company_id).to.equal(`company_123`);
      expect(props).to.not.have.property(`distinct_id`);
    });
  });

  describe(`session recording`, function() {
    function userIdInfo(config, properties) {
      const mock = new MockMixpanelLib(config);
      const base = mock.get_property.bind(mock);
      mock.get_property = prop => (prop in properties ? properties[prop] : base(prop));
      const recording = new SessionRecording({mixpanelInstance: mock, replayId: `replay`});
      return recording.getUserIdInfo();
    }

    it(`sends the company with each batch`, function() {
      const info = userIdInfo({hierarchical_groups: true}, {'distinct_id': `user_123`, '$company_id': `acme`});
      expect(info).to.deep.equal({
        distinct_id: `user_123`,
        $device_id: `test-device-id`,
        $user_id: `test-user-id`,
        $company_id: `acme`,
      });
    });

    it(`never sends a company when disabled`, function() {
      const info = userIdInfo({}, {'$company_id': `acme`});
      expect(info).to.not.have.property(`$company_id`);
    });
  });
});
