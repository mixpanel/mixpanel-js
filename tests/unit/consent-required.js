import { expect } from 'chai';
import path from 'path';
import sinon from 'sinon';

import jsdomSetup from './jsdom-setup';

const TOKEN = `consent-required-token`;
const SRC_DIR = path.resolve(__dirname, `../../src`);
const OPT_IN_OUT_KEY = `__mp_opt_in_out_${TOKEN}`;
const OBJECTION_KEY = `__mp_objection_${TOKEN}`;
const PERSISTENCE_KEY = `mp_${TOKEN}_mixpanel`;
const EVENT_QUEUE_KEY = `__mpq_${TOKEN}_ev`;
const TAB_ID_KEY = name => `mp_tab_id_${name}_${TOKEN}`;
const REAL_CONFIG = {
  persistence: `localStorage`,
  batch_requests: true,
  autocapture: true,
  track_pageview: true,
  record_sessions_percent: 100,
  flags: {context: {}},
};

// the modes that store and send nothing identifying before consent
const CONSENT_REQUIRED_MODES = [`require_consent`, `exempt`];

CONSENT_REQUIRED_MODES.forEach(mode => describe(`consent_mode: '${mode}'`, function() {
  const SENDS_EXEMPT_EVENTS = mode === `exempt`;
  let mixpanel, loadExtraBundle;

  // registered before jsdomSetup so it runs before the jsdom window is torn down
  afterEach(function() {
    sinon.restore();
  });

  jsdomSetup({
    beforeCallback: () => {
      // every src module must bind to this test's jsdom window and start with a fresh localStorage probe
      Object.keys(require.cache)
        .filter(modulePath => modulePath.startsWith(SRC_DIR))
        .forEach(modulePath => delete require.cache[modulePath]);
      const {init_as_module} = require(`../../src/mixpanel-core`);
      loadExtraBundle = sinon.spy();
      mixpanel = init_as_module(loadExtraBundle);
      window.localStorage.clear();
    },
  });

  function initInstance(config, name = `consent_required`) {
    const instance = mixpanel.init(TOKEN, Object.assign({
      consent_mode: mode,
      opt_out_tracking_by_default: true,
      batch_requests: false,
    }, config), name);
    sinon.stub(instance, `_send_request`);
    return instance;
  }

  function sentEvents(instance) {
    return instance._send_request.getCalls().map(call => JSON.parse(call.args[1].data));
  }

  function isBlocked(instance) {
    const callback = sinon.spy();
    instance.track(`consent check`, {}, callback);
    return callback.calledWith(0);
  }

  describe(`before consent`, function() {
    it(`should write no cookie, localStorage or sessionStorage and send nothing`, function() {
      const setItem = sinon.spy(window.Storage.prototype, `setItem`);
      const instance = initInstance({persistence: `localStorage`});
      const callback = sinon.spy();

      instance.register({plan: `pro`});
      instance.identify(`user-1`);
      instance.alias(`user-1-alias`);
      instance.people.set({name: `visitor`});
      instance.track(`page`, {}, callback);
      instance.reset();

      expect(setItem.called).to.equal(false);
      expect(document.cookie).to.equal(``);
      expect(instance._send_request.called).to.equal(false);
      expect(callback.calledWith(0)).to.equal(true);
      expect(instance.get_distinct_id()).to.equal(undefined);
      expect(instance.get_tab_id()).to.equal(null);
    });

    it(`should open no storage and send ${SENDS_EXEMPT_EVENTS ? `only exempt events` : `nothing`} with autocapture, replay and flags on`, async function() {
      const setItem = sinon.spy(window.Storage.prototype, `setItem`);
      window.indexedDB = {open: sinon.spy(), databases: () => Promise.resolve([])};
      window.fetch = sinon.spy(() => new Promise(() => {}));
      const instance = initInstance(REAL_CONFIG);

      document.body.innerHTML = `<button id="buy">Buy</button>`;
      document.getElementById(`buy`).click();
      instance.track_pageview();
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(setItem.called).to.equal(false);
      expect(document.cookie).to.equal(``);
      expect(window.indexedDB.open.called).to.equal(false);
      expect(window.fetch.called).to.equal(false);
      expect(loadExtraBundle.called).to.equal(false);
      const sent = sentEvents(instance);
      if (SENDS_EXEMPT_EVENTS) {
        expect(sent.map(event => event.event)).to.include(`$mp_web_page_view`);
        sent.forEach(event => {
          expect([`$mp_web_page_view`, `$mp_click`]).to.include(event.event);
          expect(event.properties.$mp_exempt).to.equal(true);
          expect(event.properties).to.not.have.property(`distinct_id`);
        });
      } else {
        expect(sent).to.deep.equal([]);
      }
      expect(instance.are_batchers_initialized()).to.equal(false);
    });

    it(`should delete identifiers a page load before consent mode left behind`, function() {
      window.localStorage.setItem(PERSISTENCE_KEY, JSON.stringify({distinct_id: `stored-id`, $device_id: `stored-device`}));
      window.localStorage.setItem(EVENT_QUEUE_KEY, JSON.stringify([{id: `queued`, payload: {event: `old`}}]));
      window.sessionStorage.setItem(TAB_ID_KEY(`consent_required`), `$tab-stored`);

      const instance = initInstance({persistence: `localStorage`});

      expect(window.localStorage.getItem(PERSISTENCE_KEY)).to.equal(null);
      expect(window.localStorage.getItem(EVENT_QUEUE_KEY)).to.equal(null);
      expect(window.sessionStorage.length).to.equal(0);
      expect(instance.get_distinct_id()).to.equal(undefined);
    });

    it(`should report a stored refusal as opted out, and no decision as neither`, function() {
      const undecided = initInstance({}, `consent_required_undecided`);
      expect(undecided.has_opted_out_tracking()).to.equal(false);
      expect(undecided.has_opted_in_tracking()).to.equal(false);

      window.localStorage.setItem(OPT_IN_OUT_KEY, `0`);
      const instance = initInstance({persistence: `localStorage`});

      expect(instance.has_opted_in_tracking()).to.equal(false);
      expect(instance.has_opted_out_tracking()).to.equal(true);
      expect(isBlocked(instance)).to.equal(true);
    });

    it(`should store nothing on Do Not Track, even with a stored or new opt-in`, function() {
      window.localStorage.setItem(OPT_IN_OUT_KEY, `1`);
      const setItem = sinon.spy(window.Storage.prototype, `setItem`);
      const instance = initInstance({persistence: `localStorage`, window: {navigator: {doNotTrack: `1`}}});

      instance.register({plan: `pro`});
      instance.opt_in_tracking();

      expect(setItem.called).to.equal(false);
      expect(instance.get_distinct_id()).to.equal(undefined);
      expect(instance.has_opted_out_tracking()).to.equal(true);
      expect(isBlocked(instance)).to.equal(true);
    });

    it(`should track a visitor who opted in, and send no $opt_in at init`, function() {
      document.cookie = `${OPT_IN_OUT_KEY}=1`;
      const sendRequest = sinon.stub(Object.getPrototypeOf(mixpanel), `_send_request`);
      const instance = mixpanel.init(TOKEN, {consent_mode: mode, batch_requests: false}, `consent_required`);

      expect(instance.get_distinct_id()).to.match(/^\$device:/);
      expect(instance.has_opted_in_tracking()).to.equal(true);
      expect(sendRequest.called).to.equal(false);
      expect(isBlocked(instance)).to.equal(false);
    });
  });

  if (SENDS_EXEMPT_EVENTS) {
    describe(`exempt events`, function() {
      it(`should send an allowed event alone, with only the allowed properties`, function() {
        const instance = initInstance({persistence: `localStorage`});
        instance.register({plan: `pro`});

        instance.track(`$mp_click`, {
          $el_attr__href: `https://example.com/pricing?ref=nav#plans`,
          $el_text: `Pricing`,
          $current_url: `https://example.com/home?utm_source=ad`,
          $browser_version: 120.5,
          utm_source: `ad`,
        });

        const [event] = sentEvents(instance);
        expect(instance._send_request.callCount).to.equal(1);
        expect(instance._send_request.firstCall.args[2].exempt_measurement).to.equal(true);
        expect(event.event).to.equal(`$mp_click`);
        expect(event.properties).to.include({
          token: TOKEN,
          $mp_exempt: true,
          $el_attr__href: `https://example.com/pricing`,
          $current_url: `https://example.com/home`,
          $browser_version: 120,
        });
        expect(event.properties.time % 3600).to.equal(0);
        [`$el_text`, `utm_source`, `plan`, `distinct_id`, `$device_id`, `$referrer`, `$screen_width`].forEach(
          property => expect(event.properties).to.not.have.property(property)
        );
      });

      it(`should drop what on_track adds that isn't allowed, and skip before_send_events`, function() {
        const beforeSendEvents = sinon.spy(data => data);
        const instance = initInstance({
          hooks: {
            on_track: (eventName, properties) => [eventName, Object.assign({}, properties, {
              plan: `pro`,
              distinct_id: `account-1`,
              $current_url: `https://example.com/home?email=a@b.c`,
            })],
            before_send_events: beforeSendEvents,
          },
        });

        instance.track(`$mp_click`, {});

        const [event] = sentEvents(instance);
        expect(event.properties.$mp_exempt).to.equal(true);
        expect(event.properties.$current_url).to.equal(`https://example.com/home`);
        expect(event.properties).to.not.have.property(`distinct_id`);
        expect(event.properties).to.not.have.property(`plan`);
        expect(beforeSendEvents.called).to.equal(false);
      });

      it(`should remove credentials from a URL longer than the truncation length`, function() {
        const instance = initInstance();

        instance.track(`$mp_click`, {$el_attr__href: `https://user:${`x`.repeat(300)}@example.com/docs`});

        const [event] = sentEvents(instance);
        expect(event.properties.$el_attr__href).to.equal(`https://example.com/docs`);
      });

      it(`should drop other events, and people and group calls`, function() {
        const instance = initInstance();
        const callback = sinon.spy();

        instance.track(`Purchase`, {}, callback);
        instance.people.set({name: `visitor`});
        instance.get_group(`company`, `mixpanel`).set({plan: `pro`});

        expect(callback.calledWith(0)).to.equal(true);
        expect(instance._send_request.called).to.equal(false);
      });

      it(`should send the events and properties consent_exempt_allowlist adds`, function() {
        const instance = initInstance({consent_exempt_allowlist: {events: [`Signup Viewed`], properties: [`step`]}});

        instance.track(`Signup Viewed`, {step: 2, plan: `pro`});

        const [event] = sentEvents(instance);
        expect(event.event).to.equal(`Signup Viewed`);
        expect(event.properties.step).to.equal(2);
        expect(event.properties).to.not.have.property(`plan`);
      });

      it(`should send exempt events again after a withdrawal, and none after an objection`, function() {
        const withdrawn = initInstance({}, `consent_required_withdrawn`);
        withdrawn.opt_in_tracking({track: null});
        withdrawn.opt_out_tracking();
        withdrawn._send_request.resetHistory();
        withdrawn.track_pageview();

        const objected = initInstance({}, `consent_required_objected`);
        objected.object_to_tracking();
        objected.track_pageview();

        const [event] = sentEvents(withdrawn);
        expect(event.event).to.equal(`$mp_web_page_view`);
        expect(event.properties.$mp_exempt).to.equal(true);
        expect(event.properties).to.not.have.property(`distinct_id`);
        expect(objected._send_request.called).to.equal(false);
      });

      it(`should drop a request not marked exempt, and a marked one after an objection`, function() {
        const exemptInstance = initInstance({}, `consent_required_exempt`);
        const objected = initInstance({}, `consent_required_objected`);
        objected.object_to_tracking();
        [exemptInstance, objected].forEach(instance => instance._send_request.restore());
        const xhrSend = sinon.spy(window.XMLHttpRequest.prototype, `send`);
        const callback = sinon.spy();
        const url = `https://api-js.mixpanel.com/track/`;

        expect(exemptInstance._send_request(url, {data: `e30=`}, {}, callback)).to.equal(false);
        expect(objected._send_request(url, {data: `e30=`}, {exempt_measurement: true}, callback)).to.equal(false);

        expect(callback.alwaysCalledWith(0)).to.equal(true);
        expect(xhrSend.called).to.equal(false);
      });
    });
  }

  describe(`opt-in`, function() {
    it(`should store a new device ID and send $opt_in and later events with it`, function() {
      const instance = initInstance({persistence: `localStorage`});
      instance.register({plan: `pro`, tags: [`new`]});
      instance.people.set({name: `visitor`});
      instance.people.increment({visits: 2});

      instance.opt_in_tracking();
      instance.track(`after consent`);

      const distinctId = instance.get_distinct_id();
      const stored = JSON.parse(window.localStorage.getItem(PERSISTENCE_KEY));
      expect(distinctId).to.match(/^\$device:/);
      expect(stored.distinct_id).to.equal(distinctId);
      expect(stored.plan).to.equal(`pro`);
      expect(stored.tags).to.deep.equal([`new`]);
      expect(stored.__mps || {}).to.not.have.property(`name`);
      expect(stored.__mpa || {}).to.not.have.property(`visits`);
      expect(window.localStorage.getItem(OPT_IN_OUT_KEY)).to.equal(`1`);
      expect(sentEvents(instance).map(event => [event.event, event.properties.distinct_id])).to.deep.equal([
        [`$opt_in`, distinctId],
        [`after consent`, distinctId],
      ]);
    });

    it(`should start batching, flags and replay`, async function() {
      window.indexedDB = {open: sinon.spy(), databases: () => Promise.resolve([])};
      window.fetch = sinon.spy(() => new Promise(() => {}));
      const instance = initInstance(REAL_CONFIG);

      try {
        instance.opt_in_tracking();
        await new Promise(resolve => setTimeout(resolve, 0));

        expect(instance.are_batchers_initialized()).to.equal(true);
        expect(window.fetch.called).to.equal(true);
        expect(loadExtraBundle.calledWithMatch(/recorder/i)).to.equal(true);
        expect(instance.get_tab_id()).to.match(/^\$tab-/);
      } finally {
        instance.stop_batch_senders();
      }
    });

    it(`should fetch remote settings once, ${SENDS_EXEMPT_EVENTS ? `before` : `only after`} consent`, async function() {
      window.fetch = sinon.spy(() => new Promise(() => {}));
      const instance = initInstance({remote_settings_mode: `strict`});
      const settingsFetches = () => window.fetch.getCalls().filter(call => /settings/.test(call.args[0]));

      await new Promise(resolve => setTimeout(resolve, 0));
      // exempt events take their autocapture config from remote settings
      expect(settingsFetches()).to.have.length(SENDS_EXEMPT_EVENTS ? 1 : 0);

      instance.opt_in_tracking();
      await new Promise(resolve => setTimeout(resolve, 0));
      expect(settingsFetches()).to.have.length(1);
    });

    it(`should start a new identity after reset() before consent`, function() {
      window.localStorage.setItem(PERSISTENCE_KEY, JSON.stringify({
        distinct_id: `stored-id`,
        $device_id: `stored-device`,
        $user_id: `stored-user`,
      }));
      const instance = initInstance({persistence: `localStorage`});

      instance.reset();
      instance.register({plan: `pro`});
      instance.opt_in_tracking();

      const stored = JSON.parse(window.localStorage.getItem(PERSISTENCE_KEY));
      expect(stored.distinct_id).to.match(/^\$device:/);
      expect(stored.$device_id).to.not.equal(`stored-device`);
      expect(stored).to.not.have.property(`$user_id`);
      expect(stored.plan).to.equal(`pro`);
    });

    it(`should start replay from a recording trigger on $opt_in`, async function() {
      const instance = initInstance({record_sessions_percent: 0, recording_event_triggers: {$opt_in: {percentage: 100}}});

      instance.opt_in_tracking();
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(loadExtraBundle.calledWithMatch(/recorder/i)).to.equal(true);
    });

    it(`should not start collecting when another tab opts in`, function() {
      const instance = initInstance({persistence: `localStorage`});
      const otherTab = initInstance({persistence: `localStorage`}, `consent_required_other_tab`);

      otherTab.opt_in_tracking({track: null});

      expect(isBlocked(instance)).to.equal(true);
      expect(instance.get_distinct_id()).to.equal(undefined);
      expect(instance._send_request.called).to.equal(false);
    });

    it(`should apply the latest identify() made before consent at opt-in, and drop alias()`, function() {
      const instance = initInstance({persistence: `localStorage`});
      instance.identify(`user-0`);
      instance.identify(`user-1`);
      instance.alias(`alias-1`);
      expect(instance._send_request.called).to.equal(false);

      instance.opt_in_tracking();

      expect(instance.get_distinct_id()).to.equal(`user-1`);
      expect(JSON.parse(window.localStorage.getItem(PERSISTENCE_KEY)).$user_id).to.equal(`user-1`);
      const events = sentEvents(instance).filter(event => event.event);
      expect(events.map(event => [event.event, event.properties.distinct_id])).to.deep.equal([
        [`$identify`, `user-1`],
        [`$opt_in`, `user-1`],
      ]);
    });

    it(`should discard an identify() held before consent on reset()`, function() {
      const instance = initInstance();
      instance.identify(`user-1`);
      instance.reset();

      instance.opt_in_tracking({track: null});

      expect(instance.get_distinct_id()).to.match(/^\$device:/);
    });

    it(`should discard an identify() held before consent on an objection`, function() {
      const instance = initInstance();
      instance.identify(`user-1`);
      instance.object_to_tracking();

      instance.opt_in_tracking({track: null});

      expect(instance.get_distinct_id()).to.match(/^\$device:/);
    });

    it(`should send $opt_in with its options on a repeated opt-in, and none with track: null`, function() {
      const instance = initInstance();
      instance.opt_in_tracking({track: null});
      expect(instance._send_request.called).to.equal(false);

      instance.opt_in_tracking({track_event_name: `Accepted again`, track_properties: {source: `banner`}});

      const events = sentEvents(instance);
      expect(events.map(event => event.event)).to.deep.equal([`Accepted again`]);
      expect(events[0].properties.source).to.equal(`banner`);
    });

    it(`should start the batch senders a page started before consent`, function() {
      const instance = initInstance({batch_requests: true, batch_autostart: false});
      instance.start_batch_senders();

      try {
        instance.opt_in_tracking({track: null});

        expect(instance.request_batchers.events.stopped).to.equal(false);
      } finally {
        instance.stop_batch_senders();
      }
    });

    it(`should reuse the identity stored under an earlier consent`, function() {
      const first = initInstance({persistence: `localStorage`});
      first.opt_in_tracking({track: null});
      const consented_id = first.get_distinct_id();

      const reloaded = initInstance({persistence: `localStorage`}, `consent_required_reloaded`);

      expect(reloaded.get_distinct_id()).to.equal(consented_id);
    });

    it(`should clear an objection`, function() {
      window.localStorage.setItem(OBJECTION_KEY, `1`);
      const instance = initInstance({persistence: `localStorage`});

      instance.opt_in_tracking();

      expect(window.localStorage.getItem(OBJECTION_KEY)).to.equal(null);
      expect(instance.has_opted_out_tracking()).to.equal(false);
      expect(sentEvents(instance).map(event => event.event)).to.deep.equal([`$opt_in`]);
    });

  });

  describe(`opt-out`, function() {
    it(`should store the refusal and keep tracking off`, function() {
      const instance = initInstance();

      instance.opt_out_tracking();

      expect(document.cookie).to.contain(`${OPT_IN_OUT_KEY}=0`);
      expect(instance.has_opted_out_tracking()).to.equal(true);
      expect(isBlocked(initInstance({}, `consent_required_reloaded`))).to.equal(true);
    });
  });

  describe(`objection`, function() {
    it(`should store the objection under its own key and block across page loads`, function() {
      const instance = initInstance();

      instance.object_to_tracking();

      expect(document.cookie).to.contain(`${OBJECTION_KEY}=1`);
      expect(document.cookie).to.contain(`${OPT_IN_OUT_KEY}=0`);
      expect(instance.has_opted_out_tracking()).to.equal(true);

      const reloaded = initInstance({}, `consent_required_reloaded`);
      const callback = sinon.spy();
      reloaded.track(`page`, {}, callback);

      expect(reloaded.has_opted_out_tracking()).to.equal(true);
      expect(callback.calledWith(0)).to.equal(true);
      expect(reloaded._send_request.called).to.equal(false);
    });

    it(`should go back to no decision when the objection is cleared`, function() {
      const instance = initInstance();
      instance.object_to_tracking();

      instance.clear_opt_in_out_tracking();

      expect(window.localStorage.getItem(OBJECTION_KEY)).to.equal(null);
      expect(window.localStorage.getItem(OPT_IN_OUT_KEY)).to.equal(null);
      expect(instance.has_opted_out_tracking()).to.equal(false);
      expect(instance.has_opted_in_tracking()).to.equal(false);

      instance.opt_in_tracking();

      expect(isBlocked(instance)).to.equal(false);
    });

    it(`should store nothing and start no flags, replay or remote settings after an objection`, async function() {
      window.localStorage.setItem(OPT_IN_OUT_KEY, `1`);
      window.localStorage.setItem(OBJECTION_KEY, `1`);
      const setItem = sinon.spy(window.Storage.prototype, `setItem`);
      window.indexedDB = {open: sinon.spy(), databases: () => Promise.resolve([])};
      window.fetch = sinon.spy(() => new Promise(() => {}));
      const instance = initInstance(Object.assign({}, REAL_CONFIG, {remote_settings_mode: `strict`}));

      instance.track_pageview();
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(instance.has_opted_out_tracking()).to.equal(true);
      expect(setItem.called).to.equal(false);
      expect(window.indexedDB.open.called).to.equal(false);
      expect(window.fetch.called).to.equal(false);
      expect(loadExtraBundle.called).to.equal(false);
      expect(instance._send_request.called).to.equal(false);
    });
  });

  describe(`withdrawal after opt-in`, function() {
    it(`should not start replay when consent is withdrawn while the recorder bundle loads`, async function() {
      const instance = initInstance({record_sessions_percent: 100});
      instance.opt_in_tracking();
      await new Promise(resolve => setTimeout(resolve, 0));
      const recorderBundleLoaded = loadExtraBundle.getCalls().find(call => /recorder/i.test(call.args[0])).args[1];

      instance.opt_out_tracking();
      window.__mp_recorder = sinon.spy();
      recorderBundleLoaded();

      expect(window.__mp_recorder.called).to.equal(false);
    });

    it(`should stop storing and sending on opt-out`, async function() {
      const instance = initInstance({persistence: `localStorage`});
      instance.opt_in_tracking();
      instance._send_request.resetHistory();

      instance.opt_out_tracking({clear_persistence: false});
      const setItem = sinon.spy(window.Storage.prototype, `setItem`);
      instance.register({plan: `pro`});
      // late remote settings call set_config() too
      instance.set_config({});
      const callback = sinon.spy();
      instance.track(`after refusal`, {}, callback);

      expect(instance.has_opted_in_tracking()).to.equal(false);
      expect(window.localStorage.getItem(PERSISTENCE_KEY)).to.equal(null);
      expect(setItem.called).to.equal(false);
      await new Promise(resolve => setTimeout(resolve, 0));
      expect(instance.get_tab_id()).to.equal(null);
      expect(window.sessionStorage.length).to.equal(0);
      expect(callback.calledWith(0)).to.equal(true);
      expect(instance._send_request.called).to.equal(false);
    });

    it(`should stop storing and sending and delete the stored identity on clear_opt_in_out_tracking()`, async function() {
      const instance = initInstance({persistence: `localStorage`});
      instance.opt_in_tracking();
      expect(window.localStorage.getItem(PERSISTENCE_KEY)).to.not.equal(null);
      instance._send_request.resetHistory();

      instance.clear_opt_in_out_tracking();
      const callback = sinon.spy();
      instance.track(`after clear`, {}, callback);

      expect(instance.has_opted_in_tracking()).to.equal(false);
      expect(instance.has_opted_out_tracking()).to.equal(false);
      expect(window.localStorage.getItem(OPT_IN_OUT_KEY)).to.equal(null);
      expect(window.localStorage.getItem(PERSISTENCE_KEY)).to.equal(null);
      await new Promise(resolve => setTimeout(resolve, 0));
      expect(window.sessionStorage.length).to.equal(0);
      expect(callback.calledWith(0)).to.equal(true);
      expect(instance._send_request.called).to.equal(false);
    });

    it(`should start tracking again with the same identity when consent is given again on the same page`, function() {
      const instance = initInstance();
      instance.opt_in_tracking({track: null});
      const firstId = instance.get_distinct_id();
      instance.opt_out_tracking();
      instance._send_request.resetHistory();

      instance.opt_in_tracking();
      instance.track(`page`);

      expect(sentEvents(instance).map(event => event.event)).to.deep.equal([`$opt_in`, `page`]);
      expect(instance.has_opted_in_tracking()).to.equal(true);
      expect(isBlocked(instance)).to.equal(false);
      expect(instance.get_distinct_id()).to.equal(firstId);
      expect(document.cookie).to.contain(PERSISTENCE_KEY);
    });

    it(`should send nothing through a direct request once tracking stops`, function() {
      const instance = initInstance();
      instance.opt_in_tracking({track: null});
      instance.opt_out_tracking();
      instance._send_request.restore();
      const xhrSend = sinon.spy(window.XMLHttpRequest.prototype, `send`);
      window.fetch = sinon.spy();
      const callback = sinon.spy();

      const sent = instance._send_request(`https://api-js.mixpanel.com/track/`, {data: `e30=`}, {}, callback);

      expect(sent).to.equal(false);
      expect(callback.calledWith(0)).to.equal(true);
      expect(xhrSend.called).to.equal(false);
      expect(window.fetch.called).to.equal(false);
    });
  });

  describe(`consent state`, function() {
    it(`should store the opt-in under the configured key whatever cookie_prefix the call passes`, function() {
      const instance = initInstance();

      instance.opt_in_tracking({cookie_prefix: `my_consent_`});

      expect(document.cookie).to.contain(`${OPT_IN_OUT_KEY}=1`);
      expect(isBlocked(initInstance({}, `consent_required_reloaded`))).to.equal(false);
    });

    it(`should track and store as before without consent_mode`, function() {
      const instance = mixpanel.init(TOKEN, {batch_requests: false}, `no_consent_mode`);
      sinon.stub(instance, `_send_request`);

      instance.track(`page`);

      expect(instance._consent.mode).to.equal(`no_consent_required`);
      expect(instance.get_config(`consent_mode`)).to.equal(null);
      expect(instance.get_distinct_id()).to.match(/^\$device:/);
      expect(document.cookie).to.contain(PERSISTENCE_KEY);
      expect(sentEvents(instance).map(event => event.event)).to.deep.equal([`page`]);

      instance.opt_out_tracking();

      expect(isBlocked(instance)).to.equal(true);
    });

    it(`should store and send nothing before consent under consent_mode 'require_consent', then track`, function() {
      const instance = initInstance({consent_mode: `require_consent`, persistence: `localStorage`});
      const callback = sinon.spy();

      instance.track(`page`, {}, callback);

      expect(callback.calledWith(0)).to.equal(true);
      expect(instance._consent.state()).to.equal(`blocked`);
      expect(window.localStorage.getItem(PERSISTENCE_KEY)).to.equal(null);
      expect(document.cookie).not.to.contain(TOKEN);
      expect(instance._send_request.called).to.equal(false);

      instance.opt_in_tracking();
      instance.track(`page`);

      expect(sentEvents(instance).map(event => event.event)).to.deep.equal([`$opt_in`, `page`]);
      expect(window.localStorage.getItem(PERSISTENCE_KEY)).to.not.equal(null);
    });

    it(`should keep the old opt_out_tracking_by_default behaviour without consent_mode`, function() {
      const instance = mixpanel.init(TOKEN, {opt_out_tracking_by_default: true, batch_requests: false}, `opt_out_by_default`);

      expect(instance._consent.mode).to.equal(`no_consent_required`);
      expect(isBlocked(instance)).to.equal(true);
      expect(instance.get_distinct_id()).to.match(/^\$device:/);
    });

    it(`should treat an unknown consent_mode as 'require_consent'`, function() {
      const instance = initInstance({consent_mode: `requireConsent`});
      const callback = sinon.spy();

      instance.track(`page`, {}, callback);

      expect(callback.calledWith(0)).to.equal(true);
      expect(instance._consent.mode).to.equal(`require_consent`);
      expect(instance._send_request.called).to.equal(false);
    });

    it(`should ignore consent_mode changes after init`, function() {
      const instance = initInstance();

      instance.set_config({consent_mode: null});
      instance.opt_in_tracking();

      expect(instance.get_config(`consent_mode`)).to.equal(mode);
      expect(instance.has_opted_in_tracking()).to.equal(true);
    });

    it(`should keep finding the decision after set_config() changes persistence`, function() {
      const instance = initInstance({persistence: `cookie`});
      instance.opt_in_tracking();

      instance.set_config({persistence: `localStorage`});

      expect(instance.has_opted_in_tracking()).to.equal(true);
    });
  });
}));
