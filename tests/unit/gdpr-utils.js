import os from 'os';
import { expect } from 'chai';
import sinon from 'sinon';
import nodeLocalStorage from 'node-localstorage';

import jsdomSetup from './jsdom-setup';

const TOKENS = [
  `test-token`,
  `y^0M0RJnZq#9WE!Si*1tPZmtdcODB$%c`, // randomly-generated string
  `Ƭ Ө K Σ П`, // unicode string with whitespace
];

describe(`GDPR utils`, function() {
  // these imports must be re-required before each test
  // so that they reference the correct jsdom document
  let _, gdpr;
  jsdomSetup({
    dependencies: [`../../src/utils`, `../../src/gdpr-utils`],
    beforeCallback: dependencies => {
      [_, gdpr] = dependencies;
    },
  });

  describe(`optIn`, function() {
    it(`should set a cookie marking the user as opted-in for a given token`, function() {
      TOKENS.forEach(token => {
        gdpr.optIn(token);
        expect(document.cookie).to.contain(token + `=1`);
      });
    });

    it(`shouldn't set cookies for any other tokens`, function() {
      const token = TOKENS[0];
      gdpr.optIn(token);

      TOKENS.filter(otherToken => otherToken !== token).forEach(otherToken => {
        expect(document.cookie).to.not.contain(otherToken);
      });
    });

    it(`should track an event recording the opt-in action`, function() {
      let track;

      TOKENS.forEach(token => {
        track = sinon.spy();
        gdpr.optIn(token, {track});
        expect(track.calledOnceWith(`$opt_in`)).to.be.true;

        track = sinon.spy();
        const trackEventName = `єνєηт`;
        const trackProperties = {'𝖕𝖗𝖔𝖕𝖊𝖗𝖙𝖞': `𝓿𝓪𝓵𝓾𝓮`};
        gdpr.optIn(token, {track, trackEventName, trackProperties});
        expect(track.calledOnceWith(trackEventName, trackProperties)).to.be.true;
      });
    });

    it(`shouldn't track an event if the user has opted out`, function() {
      TOKENS.forEach(token => {
        let track = sinon.spy();
        gdpr.optOut(token);
        gdpr.optOut(token, {track});
        expect(track.notCalled).to.be.true;
      });
    });

    it(`should track an event if the user has opted in`, function() {
      TOKENS.forEach(token => {
        let track = sinon.spy();
        gdpr.optOut(token);
        gdpr.optIn(token);
        gdpr.optIn(token, {track});
        expect(track.calledOnce).to.be.true;
      });
    });

    it(`should track an event if the user is switching opt from out to in`, function() {
      TOKENS.forEach(token => {
        let track = sinon.spy();
        gdpr.optOut(token);
        gdpr.optIn(token, {track});
        expect(track.calledOnce).to.be.true;
      });
    });
  });

  describe(`optOut`, function() {
    it(`should set a cookie marking the user as opted-out for a given token`, function() {
      TOKENS.forEach(token => {
        gdpr.optOut(token);
        expect(document.cookie).to.contain(token + `=0`);
      });
    });

    it(`shouldn't set cookies for any other tokens`, function() {
      const token = TOKENS[0];
      gdpr.optOut(token);

      TOKENS.filter(otherToken => otherToken !== token).forEach(otherToken => {
        expect(document.cookie).to.not.contain(otherToken);
      });
    });

    it(`shouldn't track an event recording the opt-out action`, function() {
      TOKENS.forEach(token => {
        const track = sinon.spy();
        gdpr.optOut(token, {track});
        expect(track.notCalled).to.be.true;
      });
    });

    it(`shouldn't track an event if the user is switching opt from in to out`, function() {
      TOKENS.forEach(token => {
        let track = sinon.spy();
        gdpr.optIn(token);
        gdpr.optOut(token, {track});
        expect(track.calledOnce).to.be.false;
      });
    });
  });

  describe(`hasOptedIn`, function() {
    it(`should return 'false' if the user hasn't opted in for a given token`, function() {
      TOKENS.forEach(token => {
        expect(gdpr.hasOptedIn(token)).to.be.false;
      });
    });

    it(`should return 'true' if the user opts in for a given token`, function() {
      TOKENS.forEach(token => {
        gdpr.optIn(token);
        expect(gdpr.hasOptedIn(token)).to.be.true;
      });
    });

    it(`should return 'false' if the user opts in for any other token`, function() {
      const token = TOKENS[0];
      gdpr.optIn(token);

      TOKENS.filter(otherToken => otherToken !== token).forEach(otherToken => {
        expect(gdpr.hasOptedIn(otherToken)).to.be.false;
      });
    });

    it(`should return 'false' if the user opts out`, function() {
      TOKENS.forEach(token => {
        gdpr.optOut(token);
        expect(gdpr.hasOptedIn(token)).to.be.false;
      });
    });

    it(`should return 'true' if the user opts out then opts in`, function() {
      TOKENS.forEach(token => {
        gdpr.optOut(token);
        gdpr.optIn(token);
        expect(gdpr.hasOptedIn(token)).to.be.true;
      });
    });

    it(`should return 'false' if the user opts in then opts out`, function() {
      TOKENS.forEach(token => {
        gdpr.optIn(token);
        gdpr.optOut(token);
        expect(gdpr.hasOptedIn(token)).to.be.false;
      });
    });

    it(`should return 'false' if the user opts in then clears their opt status`, function() {
      TOKENS.forEach(token => {
        gdpr.optIn(token);
        gdpr.clearOptInOut(token);
        expect(gdpr.hasOptedIn(token)).to.be.false;
      });
    });

    it(`should return 'true' if the user clears their opt status then opts in`, function() {
      TOKENS.forEach(token => {
        gdpr.clearOptInOut(token);
        gdpr.optIn(token);
        expect(gdpr.hasOptedIn(token)).to.be.true;
      });
    });
  });

  describe(`hasOptedOut`, function() {
    it(`should return 'false' if the user hasn't opted out for a given token`, function() {
      TOKENS.forEach(token => {
        expect(gdpr.hasOptedOut(token)).to.be.false;
      });
    });

    it(`should return 'true' if the user opts out for a given token`, function() {
      TOKENS.forEach(token => {
        gdpr.optOut(token);
        expect(gdpr.hasOptedOut(token)).to.be.true;
      });
    });

    it(`should return 'false' if the user opts out for any other token`, function() {
      const token = TOKENS[0];
      gdpr.optIn(token);

      TOKENS.filter(otherToken => otherToken !== token).forEach(otherToken => {
        expect(gdpr.hasOptedIn(otherToken)).to.be.false;
      });
    });

    it(`should return 'false' if the user opts in`, function() {
      TOKENS.forEach(token => {
        gdpr.optIn(token);
        expect(gdpr.hasOptedOut(token)).to.be.false;
      });
    });

    it(`should return 'true' if the user opts in then opts out`, function() {
      TOKENS.forEach(token => {
        gdpr.optIn(token);
        gdpr.optOut(token);
        expect(gdpr.hasOptedOut(token)).to.be.true;
      });
    });

    it(`should return 'false' if the user opts out then opts in`, function() {
      TOKENS.forEach(token => {
        gdpr.optOut(token);
        gdpr.optIn(token);
        expect(gdpr.hasOptedOut(token)).to.be.false;
      });
    });

    it(`should return 'false' if the user opts out then clears their opt status`, function() {
      TOKENS.forEach(token => {
        gdpr.optOut(token);
        gdpr.clearOptInOut(token);
        expect(gdpr.hasOptedOut(token)).to.be.false;
      });
    });

    it(`should return 'true' if the user clears their opt status then opts out`, function() {
      TOKENS.forEach(token => {
        gdpr.clearOptInOut(token);
        gdpr.optOut(token);
        expect(gdpr.hasOptedOut(token)).to.be.true;
      });
    });

    it(`should return 'true' if the user has navigator.doNotTrack flag set`, function() {
      TOKENS.forEach(token => {
        gdpr.optIn(token);
        expect(gdpr.hasOptedOut(token)).to.be.false;

        navigator.doNotTrack = `0`;
        expect(gdpr.hasOptedOut(token)).to.be.false;

        navigator.doNotTrack = `1`;
        expect(gdpr.hasOptedOut(token)).to.be.true;

        // cleanup
        delete navigator.doNotTrack;
      });
    });
  });

  describe(`clearOptInOut`, function() {
    it(`should delete any opt cookies for a given token`, function() {
      [gdpr.optIn, gdpr.optOut].forEach(optFunc => {
        TOKENS.forEach(token => {
          optFunc(token);
          expect(document.cookie).to.contain(token);
        });

        TOKENS.forEach(token => {
          gdpr.clearOptInOut(token);
          expect(document.cookie).to.not.contain(token);
        });
      });
    });

    it(`shouldn't delete opt cookies for any other token`, function() {
      const token = TOKENS[0];

      [gdpr.optIn, gdpr.optOut].forEach(optFunc => {
        optFunc(token);
        expect(document.cookie).to.contain(token);

        TOKENS.filter(otherToken => otherToken !== token).forEach(otherToken => {
          gdpr.clearOptInOut(otherToken);
          expect(document.cookie).to.contain(token);
        });
      });
    });

    it(`should cause hasOptedIn to switch from returning 'true' to returning 'false'`, function() {
      TOKENS.forEach(token => {
        gdpr.optIn(token);
        expect(gdpr.hasOptedIn(token)).to.be.true;
        gdpr.clearOptInOut(token);
        expect(gdpr.hasOptedIn(token)).to.be.false;
      });
    });

    it(`should cause hasOptedOut to switch from returning 'true' to returning 'false'`, function() {
      TOKENS.forEach(token => {
        gdpr.optOut(token);
        expect(gdpr.hasOptedOut(token)).to.be.true;
        gdpr.clearOptInOut(token);
        expect(gdpr.hasOptedIn(token)).to.be.false;
      });
    });
  });

  describe(`addOptOutCheckMixpanelLib`, function() {
    const trackEventName = `єνєηт`;
    const trackProperties = {'𝖕𝖗𝖔𝖕𝖊𝖗𝖙𝖞': `𝓿𝓪𝓵𝓾𝓮`};
    let getConfig, track, mixpanelLib;

    function setupMocks(getConfigFunc) {
      getConfig = sinon.spy(getConfigFunc);
      track = sinon.spy();
      mixpanelLib = {
        get_config: getConfig,
        track: gdpr.addOptOutCheckMixpanelLib(track),
      };
    }

    it(`should call the wrapped method if the user is neither opted in or opted out`, function() {
      TOKENS.forEach(token => {
        setupMocks(() => token);

        mixpanelLib.track(trackEventName, trackProperties);

        expect(getConfig.calledOnceWith(`token`)).to.be.true;
        expect(track.calledOnceWith(trackEventName, trackProperties)).to.be.true;
      });
    });

    it(`should call the wrapped method if the user is opted in`, function() {
      TOKENS.forEach(token => {
        setupMocks(() => token);

        gdpr.optIn(token);
        mixpanelLib.track(trackEventName, trackProperties);

        expect(getConfig.calledOnceWith(`token`)).to.be.true;
        expect(track.calledOnceWith(trackEventName, trackProperties)).to.be.true;
      });
    });

    it(`should not call the wrapped method if the user is opted out`, function() {
      TOKENS.forEach(token => {
        setupMocks(() => token);

        gdpr.optOut(token);
        mixpanelLib.track(trackEventName, trackProperties);

        expect(getConfig.calledOnceWith(`token`)).to.be.true;
        expect(track.notCalled).to.be.true;
      });
    });

    it(`should not invoke the callback directly if the user is neither opted in or opted out`, function() {
      TOKENS.forEach(token => {
        setupMocks(() => token);
        const callback = sinon.spy();

        mixpanelLib.track(trackEventName, trackProperties, callback);

        expect(callback.notCalled).to.be.true;
      });
    });

    it(`should not invoke the callback directly if the user is opted in`, function() {
      TOKENS.forEach(token => {
        setupMocks(() => token);
        const callback = sinon.spy();

        gdpr.optIn(token);
        mixpanelLib.track(trackEventName, trackProperties, callback);

        expect(callback.notCalled).to.be.true;
      });
    });

    it(`should invoke the callback directly if the user is opted out`, function() {
      TOKENS.forEach(token => {
        setupMocks(() => token);
        const callback = sinon.spy();

        gdpr.optOut(token);
        mixpanelLib.track(trackEventName, trackProperties, callback);

        expect(callback.calledOnceWith(0)).to.be.true;
      });
    });

    it(`should call the wrapped method if there is no token available`, function() {
      TOKENS.forEach(token => {
        setupMocks(() => null);

        gdpr.optIn(token);
        mixpanelLib.track(trackEventName, trackProperties);

        expect(getConfig.calledOnceWith(`token`)).to.be.true;
        expect(track.calledOnceWith(trackEventName, trackProperties)).to.be.true;
      });
    });

    it(`should call the wrapped method if an unexpected error occurs`, function() {
      TOKENS.forEach(token => {
        setupMocks(() => {
          throw new Error(`Unexpected error!`);
        });

        gdpr.optIn(token);
        mixpanelLib.track(trackEventName, trackProperties);

        expect(getConfig.calledOnceWith(`token`)).to.be.true;
        expect(track.calledOnceWith(trackEventName, trackProperties)).to.be.true;
      });
    });
  });

  describe(`addOptOutCheckMixpanelPeople`, function() {
    const setPropertyName = '𝖕𝖗𝖔𝖕𝖊𝖗𝖙𝖞';
    const setPropertyValue = `𝓿𝓪𝓵𝓾𝓮`;
    let getConfig, set, mixpanelPeople;

    function setupMocks(getConfigFunc) {
      getConfig = sinon.spy(getConfigFunc);
      set = sinon.spy();
      mixpanelPeople = {
        _get_config: getConfig,
        set: gdpr.addOptOutCheckMixpanelPeople(set),
      };
    }

    it(`should call the wrapped method if the user is neither opted in or opted out`, function() {
      TOKENS.forEach(token => {
        setupMocks(() => token);

        mixpanelPeople.set(setPropertyName, setPropertyValue);

        expect(getConfig.calledOnceWith(`token`)).to.be.true;
        expect(set.calledOnceWith(setPropertyName, setPropertyValue)).to.be.true;
      });
    });

    it(`should call the wrapped method if the user is opted in`, function() {
      TOKENS.forEach(token => {
        setupMocks(() => token);

        gdpr.optIn(token);
        mixpanelPeople.set(setPropertyName, setPropertyValue);

        expect(getConfig.calledOnceWith(`token`)).to.be.true;
        expect(set.calledOnceWith(setPropertyName, setPropertyValue)).to.be.true;
      });
    });

    it(`should not call the wrapped method if the user is opted out`, function() {
      TOKENS.forEach(token => {
        setupMocks(() => token);

        gdpr.optOut(token);
        mixpanelPeople.set(setPropertyName, setPropertyValue);

        expect(getConfig.calledOnceWith(`token`)).to.be.true;
        expect(set.notCalled).to.be.true;
      });
    });

    it(`should not invoke the callback directly if the user is neither opted in or opted out`, function() {
      TOKENS.forEach(token => {
        setupMocks(() => token);
        const callback = sinon.spy();

        mixpanelPeople.set(setPropertyName, setPropertyValue, callback);

        expect(callback.notCalled).to.be.true;
      });
    });

    it(`should not invoke the callback directly if the user is opted in`, function() {
      TOKENS.forEach(token => {
        setupMocks(() => token);
        const callback = sinon.spy();

        gdpr.optIn(token);
        mixpanelPeople.set(setPropertyName, setPropertyValue, callback);

        expect(callback.notCalled).to.be.true;
      });
    });

    it(`should invoke the callback directly if the user is opted out`, function() {
      TOKENS.forEach(token => {
        setupMocks(() => token);
        const callback = sinon.spy();

        gdpr.optOut(token);
        mixpanelPeople.set(setPropertyName, setPropertyValue, callback);

        expect(callback.calledOnceWith(0)).to.be.true;
      });
    });

    it(`should call the wrapped method if there is no token available`, function() {
      TOKENS.forEach(token => {
        setupMocks(() => null);

        gdpr.optIn(token);
        mixpanelPeople.set(setPropertyName, setPropertyValue);

        expect(getConfig.calledOnceWith(`token`)).to.be.true;
        expect(set.calledOnceWith(setPropertyName, setPropertyValue)).to.be.true;
      });
    });

    it(`should call the wrapped method if an unexpected error occurs`, function() {
      TOKENS.forEach(token => {
        setupMocks(() => {
          throw new Error(`Unexpected error!`);
        });

        gdpr.optIn(token);
        mixpanelPeople.set(setPropertyName, setPropertyValue);

        expect(getConfig.calledOnceWith(`token`)).to.be.true;
        expect(set.calledOnceWith(setPropertyName, setPropertyValue)).to.be.true;
      });
    });
  });
});
