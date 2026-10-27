import { expect } from 'chai';
import path from 'path';
import sinon from 'sinon';

import jsdomSetup from './jsdom-setup';

const TOKEN = `consent-manager-token`;
const SRC_DIR = path.resolve(__dirname, `../../src`);

describe(`consent manager`, function() {
  let ConsentManager, resolveConsentMode, readDecision, utils, setPersistenceDisabled, deleteUser, startTracking, stopTracking, purgeIdentifiers;

  jsdomSetup({
    url: `https://www.example.com/`,
    beforeCallback: () => {
      // utils binds document at import, so every src module is re-imported against this jsdom
      Object.keys(require.cache)
        .filter(modulePath => modulePath.startsWith(SRC_DIR))
        .forEach(modulePath => delete require.cache[modulePath]);
      ({ConsentManager} = require(`../../src/consent-manager`));
      ({resolveConsentMode, readDecision} = require(`../../src/consent-modes`));
      utils = require(`../../src/utils`);
      window.localStorage.clear();
      setPersistenceDisabled = sinon.spy();
      deleteUser = sinon.spy();
      startTracking = sinon.spy();
      stopTracking = sinon.spy();
      purgeIdentifiers = sinon.spy();
    },
  });

  function newManager(config = {}, trackFunc = () => {}) {
    const fullConfig = Object.assign({
      token: TOKEN,
      opt_out_tracking_by_default: false,
      opt_out_persistence_by_default: false,
      opt_out_tracking_persistence_type: `localStorage`,
      ignore_dnt: false,
      window: {navigator: {}},
    }, config);
    return new ConsentManager({
      getConfigFunc: key => fullConfig[key],
      trackFunc,
      setPersistenceDisabledFunc: setPersistenceDisabled,
      deleteUserFunc: deleteUser,
      startTrackingFunc: startTracking,
      stopTrackingFunc: stopTracking,
      purgeIdentifiersFunc: purgeIdentifiers,
    });
  }

  describe(`resolveConsentMode`, function() {
    it(`is 'no_consent_required' without consent_mode`, function() {
      expect(resolveConsentMode(undefined)).to.equal(`no_consent_required`);
      expect(resolveConsentMode(null)).to.equal(`no_consent_required`);
    });

    it(`is consent_mode when it's a known mode`, function() {
      expect(resolveConsentMode(`no_consent_required`)).to.equal(`no_consent_required`);
      expect(resolveConsentMode(`require_consent`)).to.equal(`require_consent`);
    });

    it(`is 'require_consent' for an unknown consent_mode`, function() {
      expect(resolveConsentMode(`opt_in`)).to.equal(`require_consent`);
      expect(resolveConsentMode(`hasOwnProperty`)).to.equal(`require_consent`);
    });
  });

  describe(`readDecision`, function() {
    it(`is the stored flag's decision`, function() {
      expect(readDecision(false, `1`)).to.equal(`opted_in`);
      expect(readDecision(false, `0`)).to.equal(`opted_out`);
      expect(readDecision(false, null)).to.equal(`none`);
    });

    it(`is 'objected' under Do Not Track, whatever the stored flag`, function() {
      expect(readDecision(true, `1`)).to.equal(`objected`);
    });
  });

  describe(`mode`, function() {
    it(`is 'no_consent_required' without consent_mode, whatever opt_out_tracking_by_default says`, function() {
      expect(newManager({opt_out_tracking_by_default: true}).mode).to.equal(`no_consent_required`);
      expect(newManager().mode).to.equal(`no_consent_required`);
    });

    it(`is consent_mode when set, whatever opt_out_tracking_by_default says`, function() {
      expect(newManager({consent_mode: `no_consent_required`, opt_out_tracking_by_default: true}).mode).to.equal(`no_consent_required`);
      expect(newManager({consent_mode: `require_consent`}).mode).to.equal(`require_consent`);
    });

    it(`falls back to 'require_consent' for an unknown consent_mode`, function() {
      expect(newManager({consent_mode: `opt_in`}).mode).to.equal(`require_consent`);
    });
  });

  describe(`allows`, function() {
    it(`allows everything without a decision under 'no_consent_required'`, function() {
      const manager = newManager();

      [`api_calls`, `send`, `fetch`, `store`].forEach(capability => {
        expect(manager.allows(capability)).to.equal(true);
      });
    });

    it(`stops only the calls after an opt-out`, function() {
      const manager = newManager();

      manager.optOut();

      expect(manager.state()).to.equal(`api_calls_stopped`);
      expect(manager.allows(`api_calls`)).to.equal(false);
      [`send`, `fetch`, `store`].forEach(capability => {
        expect(manager.allows(capability)).to.equal(true);
      });
    });

    it(`answers the consent gate's questions from the same state`, function() {
      const manager = newManager();

      manager.optOut();

      expect(manager.allowsApiCalls()).to.equal(false);
      expect(manager.allowsSending()).to.equal(true);
      expect(manager.allowsFetching()).to.equal(true);
      expect(manager.allowsStoring()).to.equal(true);
    });

    it(`answers send, fetch and store without reading the decision`, function() {
      const manager = newManager();
      const readDecision = sinon.spy(manager.decisions, `_readDecision`);

      [`send`, `fetch`, `store`].forEach(capability => manager.allows(capability));
      expect(readDecision.called).to.equal(false);

      manager.allows(`api_calls`);
      expect(readDecision.calledOnce).to.equal(true);
    });

    it(`allows calls again after an opt-in`, function() {
      const manager = newManager();
      manager.optOut();

      manager.optIn();

      expect(manager.state()).to.equal(`full`);
      expect(manager.allows(`api_calls`)).to.equal(true);
    });
  });

  describe(`allowsPersistence`, function() {
    it(`allows persistence when consent allows storing`, function() {
      expect(newManager().allowsPersistence()).to.equal(true);
    });

    it(`doesn't allow persistence with disable_persistence, while consent still allows storing`, function() {
      const manager = newManager({disable_persistence: true});

      expect(manager.allows(`store`)).to.equal(true);
      expect(manager.allowsPersistence()).to.equal(false);
    });

    it(`doesn't allow persistence without consent to store`, function() {
      expect(newManager({consent_mode: `require_consent`}).allowsPersistence()).to.equal(false);
    });
  });

  describe(`init`, function() {
    it(`opts out with opt_out_tracking_by_default when nothing is stored, without clearing persistence`, function() {
      const manager = newManager({opt_out_tracking_by_default: true});

      manager.init();

      expect(manager.hasOptedOut()).to.equal(true);
      expect(manager.allows(`api_calls`)).to.equal(false);
      expect(setPersistenceDisabled.called).to.equal(false);
    });

    it(`clears persistence for the default opt-out with opt_out_persistence_by_default`, function() {
      newManager({opt_out_tracking_by_default: true, opt_out_persistence_by_default: true}).init();

      expect(setPersistenceDisabled.calledOnceWith(true)).to.equal(true);
    });

    it(`leaves a stored opt-in alone with opt_out_tracking_by_default`, function() {
      newManager().optIn();
      setPersistenceDisabled.resetHistory();

      const manager = newManager({opt_out_tracking_by_default: true});
      manager.init();

      expect(manager.allows(`api_calls`)).to.equal(true);
      expect(setPersistenceDisabled.called).to.equal(false);
    });

    it(`ignores opt_out_tracking_by_default with consent_mode 'no_consent_required'`, function() {
      const manager = newManager({consent_mode: `no_consent_required`, opt_out_tracking_by_default: true});

      manager.init();

      expect(manager.hasOptedOut()).to.equal(false);
      expect(manager.allows(`api_calls`)).to.equal(true);
    });

    it(`doesn't opt out under 'no_consent_required'`, function() {
      const manager = newManager({});

      manager.init();

      expect(manager.allows(`api_calls`)).to.equal(true);
    });

    it(`turns persistence off for a stored opt-out`, function() {
      newManager().optOut();
      setPersistenceDisabled.resetHistory();

      newManager().init();

      expect(setPersistenceDisabled.calledOnceWith(true)).to.equal(true);
    });

    it(`moves a cookie flag to localStorage`, function() {
      newManager({opt_out_tracking_persistence_type: `cookie`}).optIn();

      newManager().init();

      expect(window.localStorage.getItem(`__mp_opt_in_out_${TOKEN}`)).to.equal(`1`);
      expect(document.cookie).not.to.contain(`__mp_opt_in_out_${TOKEN}`);
    });
  });

  describe(`decisions`, function() {
    it(`sends $opt_in and turns persistence back on at an opt-in`, function() {
      const track = sinon.spy();
      const manager = newManager({}, track);

      manager.optIn({track_event_name: `Opted in`});

      expect(track.calledOnceWith(`Opted in`)).to.equal(true);
      expect(setPersistenceDisabled.calledOnceWith(false)).to.equal(true);
      expect(manager.hasOptedIn()).to.equal(true);
    });

    it(`deletes the user and turns persistence off at an opt-out`, function() {
      const manager = newManager();

      manager.optOut();

      expect(deleteUser.calledOnce).to.equal(true);
      expect(setPersistenceDisabled.calledOnceWith(true)).to.equal(true);
      expect(manager.allows(`api_calls`)).to.equal(false);
    });

    it(`follows an opt-out's delete_user and clear_persistence options`, function() {
      newManager().optOut({delete_user: false, clear_persistence: false});

      expect(deleteUser.called).to.equal(false);
      expect(setPersistenceDisabled.called).to.equal(false);
    });

    it(`clears the flag and turns persistence back on`, function() {
      const manager = newManager();
      manager.optOut();
      setPersistenceDisabled.resetHistory();

      manager.clear();

      expect(manager.hasOptedOut()).to.equal(false);
      expect(manager.hasOptedIn()).to.equal(false);
      expect(setPersistenceDisabled.calledOnceWith(false)).to.equal(true);
    });

    it(`sees a decision another tab stores`, function() {
      const manager = newManager();

      newManager().optOut();

      expect(manager.allows(`api_calls`)).to.equal(false);
    });

    it(`reads an opt-in under Do Not Track, which still blocks calls`, function() {
      newManager().optIn();

      const manager = newManager({window: {navigator: {doNotTrack: `1`}}});

      expect(manager.hasOptedIn()).to.equal(true);
      expect(manager.hasOptedOut()).to.equal(true);
      expect(manager.allows(`api_calls`)).to.equal(false);
    });

    it(`blocks calls under Do Not Track`, function() {
      expect(newManager({window: {navigator: {doNotTrack: `1`}}}).allows(`api_calls`)).to.equal(false);
      expect(newManager({window: {navigator: {doNotTrack: `1`}}, ignore_dnt: true}).allows(`api_calls`)).to.equal(true);
    });
  });

  describe(`consent_mode: 'require_consent'`, function() {
    const COOKIE_FLAG = `__mp_opt_in_out_${TOKEN}`;
    const requireConsent = (config = {}, trackFunc = () => {}) =>
      newManager(Object.assign({consent_mode: `require_consent`, persistence: `cookie`}, config), trackFunc);

    afterEach(function() {
      sinon.restore();
    });

    it(`allows nothing and deletes stored identifiers without a decision`, function() {
      const manager = requireConsent();

      manager.init();

      expect(manager.state()).to.equal(`blocked`);
      [`api_calls`, `send`, `fetch`, `store`].forEach(capability => {
        expect(manager.allows(capability)).to.equal(false);
      });
      expect(purgeIdentifiers.calledOnce).to.equal(true);
    });

    it(`starts tracking at an opt-in, then sends $opt_in`, function() {
      const track = sinon.spy();
      const manager = requireConsent({}, track);

      manager.optIn({track_event_name: `Opted in`});

      expect(manager.state()).to.equal(`full`);
      expect(startTracking.calledOnce).to.equal(true);
      expect(track.calledOnceWith(`Opted in`)).to.equal(true);
      expect(startTracking.calledBefore(track)).to.equal(true);
      expect(document.cookie).to.contain(`${COOKIE_FLAG}=1`);
      expect(requireConsent().state()).to.equal(`full`);
    });

    it(`stops tracking and deletes identifiers at a withdrawal`, function() {
      const manager = requireConsent();
      manager.optIn();
      purgeIdentifiers.resetHistory();

      manager.optOut();

      expect(stopTracking.calledOnce).to.equal(true);
      expect(purgeIdentifiers.calledOnce).to.equal(true);
      expect(manager.state()).to.equal(`blocked`);
      expect(manager.hasOptedOut()).to.equal(true);
      expect(deleteUser.called).to.equal(false);
    });

    it(`applies a withdrawal on the page even when storing it fails`, function() {
      const manager = requireConsent();
      manager.optIn();
      sinon.stub(manager.decisions, `_writeDecisionKey`);

      manager.optOut();

      expect(document.cookie).to.contain(`${COOKIE_FLAG}=1`);
      expect(manager.allows(`store`)).to.equal(false);
      expect(stopTracking.called).to.equal(true);
    });

    it(`goes back to no decision on clear`, function() {
      const manager = requireConsent();
      manager.optOut();

      manager.clear();

      expect(manager.hasOptedOut()).to.equal(false);
      expect(document.cookie).not.to.contain(COOKIE_FLAG);
    });

    it(`stays blocked under Do Not Track, even after an opt-in`, function() {
      const manager = requireConsent({window: {navigator: {doNotTrack: `1`}}});

      manager.optIn();

      expect(manager.state()).to.equal(`blocked`);
      expect(startTracking.called).to.equal(false);
    });

    it(`keeps this page's state when another tab decides`, function() {
      const manager = requireConsent();
      expect(manager.state()).to.equal(`blocked`);

      requireConsent().optIn();

      expect(manager.state()).to.equal(`blocked`);
      expect(manager.allows(`store`)).to.equal(false);
    });

    it(`removes the decision cookie at every scope before storing it`, function() {
      const remove = sinon.spy(utils._.cookie, `remove`);
      const manager = requireConsent({cookie_domain: `.example.com`});

      manager.optOut();

      expect(remove.calledWith(COOKIE_FLAG)).to.equal(true);
      expect(remove.calledWith(COOKIE_FLAG, true)).to.equal(true);
      expect(remove.calledWith(COOKIE_FLAG, false, `.example.com`)).to.equal(true);
    });

    it(`keeps an identify() until it's taken`, function() {
      const manager = requireConsent();

      manager.holdIdentify([`user-1`]);

      expect(manager.takeHeldIdentify()).to.deep.equal([`user-1`]);
      expect(manager.takeHeldIdentify()).to.equal(null);
    });
  });
});
