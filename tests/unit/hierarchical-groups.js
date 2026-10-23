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

function newInstance(config) {
  instanceCount++;
  const instance = mixpanel.init(`hg-token-${instanceCount}`, Object.assign({
    persistence: `localStorage`,
    batch_requests: false,
    error_reporter: () => {},
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
      // The stored id; ingestion resolves the user from the identity keys
      expect(props.distinct_id).to.equal(`user_123`);
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

    it(`keeps the company when the same user identifies without one`, function() {
      const {instance} = newInstance({hierarchical_groups: true});
      instance.identify({user_id: `user_123`, company_id: `acme`});
      instance.identify(`user_123`);

      expect(instance.get_identity().company_id).to.equal(`acme`);
    });

    it(`clears the company when a new user identifies without one`, function() {
      const {instance, sent} = newInstance({hierarchical_groups: true});
      instance.identify({user_id: `user_123`, company_id: `acme`});
      instance.identify(`user_456`);
      instance.track(`Viewed Report`);

      expect(instance.get_identity().company_id).to.be.null;
      const props = lastEvent(sent, `Viewed Report`);
      expect(props.$user_id).to.equal(`user_456`);
      expect(props).to.not.have.property(`$company_id`);
    });

    it(`treats an identity without a company as identify(user_id)`, function() {
      const {instance, sent} = newInstance({hierarchical_groups: true});
      instance.identify({user_id: `user_123`});

      expect(instance.get_identity().user_id).to.equal(`user_123`);
      expect(events(sent, `$identify`)).to.have.length(1);
    });

    it(`ignores invalid identities`, function() {
      const {instance, sent} = newInstance({hierarchical_groups: true});
      const anonymous = instance.get_distinct_id();
      expect(instance.identify({company_id: `acme`})).to.equal(-1);
      expect(instance.identify({user_id: ``, company_id: `acme`})).to.equal(-1);
      expect(instance.identify({user_id: `user_123`, company_id: ``})).to.equal(-1);

      expect(instance.get_distinct_id()).to.equal(anonymous);
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
      instance.reset();
      instance.track(`Opened`);

      expect(instance.get_identity().company_id).to.be.null;
      expect(lastEvent(sent, `Opened`)).to.not.have.property(`$company_id`);
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

      expect(groupMessages(sent)).to.be.empty;
      expect(peopleMessages(sent)).to.be.empty;
      expect(callback.calledOnceWith(0)).to.be.true;
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

    it(`drops updates for a user with no company`, function() {
      const {instance, sent} = newInstance({hierarchical_groups: true});
      instance.identify(`user_123`);
      instance.people.set(`plan`, `pro`);

      expect(groupMessages(sent)).to.be.empty;
      expect(peopleMessages(sent)).to.be.empty;
    });

    it(`are written through set_group too`, function() {
      const {instance, sent} = newInstance({hierarchical_groups: true});
      instance.identify({user_id: `user_123`, company_id: `acme`});
      instance.set_group(`team`, `finance`);

      const messages = groupMessages(sent);
      expect(messages).to.have.length(1);
      expect(messages[0].$group_key).to.equal(`$user_id`);
      expect(messages[0].$set.team).to.deep.equal([`finance`]);
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
      const {instance} = newInstance();
      instance.identify({user_id: `user_123`});
      expect(instance.get_distinct_id()).to.equal(`user_123`);
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
    it(`cannot be changed after init`, function() {
      const {instance} = newInstance({hierarchical_groups: true});
      instance.set_config({hierarchical_groups: false});

      expect(instance.get_config(`hierarchical_groups`)).to.be.true;
      instance.identify({user_id: `user_123`, company_id: `acme`});
      expect(instance.get_identity().company_id).to.equal(`acme`);
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
