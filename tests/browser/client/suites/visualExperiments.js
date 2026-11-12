/* global chai, sinon */
import {clearAllLibInstances, clearAllStorage, makeDelayedFetchResponse, realSetTimeout, untilDone} from '../utils';

const {expect} = chai;

const HIDE_CLASS = `mp-antiflicker-hide`;
const STYLE_ID = `mp-antiflicker-style`;
const EXPERIMENT_ID = `visual-experiment`;
const FLAG_KEY = `visual`;

export function visualExperimentsTests(mixpanel) {
  describe(`visual experiments`, function() {
    this.timeout(10000);
    let originalUrl, fixture, fetchStub, token, events, response, flagsDelay, holdFlags, releaseFlags;

    function pageUrl() {
      return window.location.origin + window.location.pathname;
    }

    function variant(visualChanges) {
      return {
        variant_key: `treatment`,
        experiment_id: EXPERIMENT_ID,
        is_experiment_active: true,
        variant_value: {$mp: {url: pageUrl(), visualChanges}},
      };
    }

    function textChange(value) {
      return {type: `setText`, selector: `#ve-text`, value};
    }

    function exposures() {
      return events.filter(event => event.event === `$experiment_started`);
    }

    function flagRequests() {
      return fetchStub.getCalls().filter(call => String(call.args[0]).includes(`/flags`));
    }

    function isHidden() {
      return document.documentElement.classList.contains(HIDE_CLASS);
    }

    function text() {
      return document.getElementById(`ve-text`).textContent;
    }

    function initialize(config = {}) {
      return new Promise(resolve => mixpanel.init(token, {
        flags: true,
        visual_experiments: true,
        autocapture: false,
        track_pageview: false,
        batch_requests: false,
        record_sessions_percent: 0,
        api_host: window.location.origin,
        hooks: {before_send_events: event => { events.push(event); return event; }},
        loaded: () => resolve(mixpanel.visualExp),
        ...config,
      }, `visualExp`));
    }

    async function initializeAndSettle(config) {
      const sdk = await initialize(config);
      await sdk.flags.when_ready();
      return sdk;
    }

    beforeEach(async function() {
      await clearAllLibInstances(mixpanel);
      await clearAllStorage();
      originalUrl = window.location.href;
      token = `VISUAL_EXPERIMENTS_${Math.random()}`;
      events = [];
      flagsDelay = 0;
      holdFlags = false;
      releaseFlags = null;
      fixture = document.createElement(`div`);
      fixture.id = `ve-root`;
      fixture.innerHTML = [
        `<p id="ve-text">Original <b>bold</b></p>`,
        `<a id="ve-link" href="#one" class="keep old">Link</a>`,
        `<span id="ve-style" style="color: rgb(0, 0, 255);">Styled</span>`,
        `<div id="ve-hide">Hidden</div>`,
      ].join(``);
      document.body.appendChild(fixture);
      response = {flags: {[FLAG_KEY]: variant([textChange(`Variant text`)])}};
      fetchStub = sinon.stub(window, `fetch`).callsFake(url => {
        if (!String(url).includes(`/flags`)) {
          return makeDelayedFetchResponse(200, 1, 0);
        }
        if (holdFlags) {
          return new Promise(resolve => {
            releaseFlags = () => resolve(makeDelayedFetchResponse(200, response, 0));
          });
        }
        return makeDelayedFetchResponse(200, response, flagsDelay);
      });
    });

    afterEach(async function() {
      try {
        if (mixpanel.visualExp) {
          // Clear delivered variants so a discarded instance cannot keep observing
          // and reapplying changes to the next test's fixture.
          holdFlags = false;
          flagsDelay = 0;
          response = {flags: {}};
          if (releaseFlags) {
            releaseFlags();
          }
          await mixpanel.visualExp.flags.load_flags();
          mixpanel.visualExp.experiments.revertVisualChanges();
        }
        await clearAllLibInstances(mixpanel);
      } finally {
        sinon.restore();
        fixture.remove();
        window.history.replaceState(null, ``, originalUrl);
      }
    });

    it(`hides the page until flags settle, then reveals it`, async function() {
      flagsDelay = 200;
      const ready = initialize();
      expect(isHidden()).to.equal(true);
      expect(document.getElementById(STYLE_ID)).to.be.ok;
      expect(getComputedStyle(document.documentElement).opacity).to.equal(`0`);

      const sdk = await ready;
      expect(isHidden()).to.equal(true);
      await sdk.flags.when_ready();
      await untilDone(() => !isHidden());
      expect(document.getElementById(STYLE_ID)).to.equal(null);
      expect(getComputedStyle(document.documentElement).opacity).to.equal(`1`);
      expect(text()).to.equal(`Variant text`);
    });

    it(`reveals the page by the failsafe timeout when flags are late`, async function() {
      holdFlags = true;
      const sdk = await initialize({visual_experiments_hide_timeout_ms: 300});
      expect(isHidden()).to.equal(true);
      const start = Date.now();
      await untilDone(() => !isHidden());
      expect(Date.now() - start).to.be.at.least(250);
      expect(document.getElementById(STYLE_ID)).to.equal(null);
      expect(text()).to.equal(`Original bold`);

      // A late response still applies, and the page stays revealed.
      releaseFlags();
      await sdk.flags.when_ready();
      await untilDone(() => text() === `Variant text`);
      expect(isHidden()).to.equal(false);
    });

    it(`applies every mutation type, skips unsafe attributes, and reverts on delivery of an empty set`, async function() {
      response = {flags: {[FLAG_KEY]: variant([
        textChange(`Variant text`),
        {type: `setAttribute`, selector: `#ve-link`, attribute: `title`, value: `Variant title`},
        {type: `setAttribute`, selector: `#ve-link`, attribute: `onclick`, value: `alert(1)`},
        {type: `setAttributes`, selector: `#ve-link`, attributes: {'data-variant': `yes`, 'aria-label': `Variant`}},
        {type: `setStyle`, selector: `#ve-style`, property: `color`, value: `rgb(255, 0, 0)`},
        {type: `setClasses`, selector: `#ve-link`, add: [`new`], remove: [`old`]},
        {type: `hide`, selector: `#ve-hide`},
      ])}};
      const sdk = await initializeAndSettle();
      await untilDone(() => text() === `Variant text`);

      const link = document.getElementById(`ve-link`);
      const styled = document.getElementById(`ve-style`);
      const hidden = document.getElementById(`ve-hide`);
      expect(document.querySelector(`#ve-text b`)).to.equal(null);
      expect(link.getAttribute(`title`)).to.equal(`Variant title`);
      expect(link.hasAttribute(`onclick`)).to.equal(false);
      expect(link.getAttribute(`data-variant`)).to.equal(`yes`);
      expect(link.getAttribute(`aria-label`)).to.equal(`Variant`);
      expect(getComputedStyle(styled).color).to.equal(`rgb(255, 0, 0)`);
      expect(link.className).to.equal(`keep new`);
      expect(getComputedStyle(hidden).display).to.equal(`none`);
      expect(exposures()).to.have.length(1);
      expect(exposures()[0].properties[`Experiment name`]).to.equal(FLAG_KEY);

      response = {flags: {}};
      await sdk.flags.load_flags();
      await untilDone(() => text() === `Original bold`);
      expect(document.querySelector(`#ve-text b`)).to.be.ok;
      expect(link.hasAttribute(`title`)).to.equal(false);
      expect(link.hasAttribute(`data-variant`)).to.equal(false);
      expect(link.hasAttribute(`aria-label`)).to.equal(false);
      expect(getComputedStyle(styled).color).to.equal(`rgb(0, 0, 255)`);
      expect(link.className).to.equal(`keep old`);
      expect(getComputedStyle(hidden).display).to.equal(`block`);
      expect(exposures()).to.have.length(1);
    });

    it(`re-applies changes after the page re-renders or replaces the target`, async function() {
      await initializeAndSettle();
      await untilDone(() => text() === `Variant text`);

      document.getElementById(`ve-text`).textContent = `Framework render`;
      await untilDone(() => text() === `Variant text`);

      const fresh = document.createElement(`p`);
      fresh.id = `ve-text`;
      fresh.textContent = `Fresh node`;
      document.getElementById(`ve-text`).replaceWith(fresh);
      await untilDone(() => fresh.textContent === `Variant text`);
      expect(exposures()).to.have.length(1);
    });

    it(`clears changes on SPA navigation away and restores them on return without a fetch`, async function() {
      await initializeAndSettle();
      await untilDone(() => text() === `Variant text`);
      const requestCount = flagRequests().length;
      const originalPath = window.location.pathname;

      window.history.pushState(null, ``, originalPath + `/elsewhere`);
      await untilDone(() => text() === `Original bold`);

      window.history.pushState(null, ``, originalPath);
      await untilDone(() => text() === `Variant text`);

      window.location.hash = `section`;
      await new Promise(resolve => realSetTimeout(resolve, 100));
      expect(text()).to.equal(`Variant text`);
      expect(flagRequests()).to.have.length(requestCount);
      expect(exposures()).to.have.length(1);
    });

    it(`suppresses the live variant during an editor session and restores it afterwards`, async function() {
      const sdk = await initializeAndSettle();
      await untilDone(() => text() === `Variant text`);
      const api = sdk.experiments;

      api.startEditorSession(EXPERIMENT_ID);
      await untilDone(() => text() === `Original bold`);

      api.applyVisualChanges([textChange(`Draft text`)]);
      await untilDone(() => text() === `Draft text`);

      api.revertVisualChanges();
      await untilDone(() => text() === `Original bold`);

      api.applyVisualChanges([textChange(`Second draft`)]);
      await untilDone(() => text() === `Second draft`);

      api.endEditorSession(EXPERIMENT_ID);
      await untilDone(() => text() === `Variant text`);
      expect(exposures()).to.have.length(1);
    });
  });
}
