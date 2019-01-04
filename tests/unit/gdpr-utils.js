import { expect } from 'chai';
import sinon from 'sinon';

import jsdomSetup from './jsdom-setup';

const TOKENS = [
  `test-token`,
  `y^0M0RJnZq#9WE!Si*1tPZmtdcODB$%c`, // randomly-generated string
  `Ƭ Ө K Σ П`, // unicode string with whitespace
];
const DEFAULT_PERSISTENCE_PREFIX = `__mp_opt_in_out_`;
const CUSTOM_PERSISTENCE_PREFIX = `𝓶𝓶𝓶𝓬𝓸𝓸𝓴𝓲𝓮𝓼`;

function forPersistenceTypes(runTests) {
  [`cookie`, `localStorage`].forEach(function(persistenceType) {
    describe(persistenceType, runTests.bind(null, persistenceType))
  });
}

function assertPersistenceValue(persistenceType, token, value, persistencePrefix=DEFAULT_PERSISTENCE_PREFIX) {
  if (persistenceType === `cookie`) {
    if (value === null) {
      expect(document.cookie).to.not.contain(token);
    } else {
      expect(document.cookie).to.contain(token + `=${value}`);
    }
  } else {
    if (value === null) {
      expect(window.localStorage.getItem(persistencePrefix + token)).to.be.null;
    } else {
      expect(window.localStorage.getItem(persistencePrefix + token)).to.equal(`${value}`);
    }
  }
}

describe(`GDPR utils`, function() {
  // these imports must be re-required before each test
  // so that they reference the correct jsdom document
  let _, gdpr;

  jsdomSetup({
    reImportModules: [`../../src/utils`, `../../src/gdpr-utils`],
    beforeCallback: modules => {
      [_, gdpr] = modules;
      window.localStorage.clear();
    },
  });

  describe(`optIn`, function() {
    forPersistenceTypes(function(persistenceType) {
      it(`should set a cookie marking the user as opted-in for a given token`, function() {
        TOKENS.forEach(token => {
          gdpr.optIn(token, {persistenceType});
          assertPersistenceValue(persistenceType, token, 1);
        });
      });

      it(`shouldn't set cookies for any other tokens`, function() {
        const token = TOKENS[0];
        gdpr.optIn(token, {persistenceType});

        TOKENS.filter(otherToken => otherToken !== token).forEach(otherToken => {
          assertPersistenceValue(persistenceType, otherToken, null);
        });
      });

      it(`should track an event recording the opt-in action`, function() {
        let track;

        TOKENS.forEach(token => {
          track = sinon.spy();
          gdpr.optIn(token, {track, persistenceType});
          expect(track.calledOnceWith(`$opt_in`)).to.be.true;

          track = sinon.spy();
          const trackEventName = `єνєηт`;
          const trackProperties = {'𝖕𝖗𝖔𝖕𝖊𝖗𝖙𝖞': `𝓿𝓪𝓵𝓾𝓮`};
          gdpr.optIn(token, {track, trackEventName, trackProperties, persistenceType});
          expect(track.calledOnceWith(trackEventName, trackProperties)).to.be.true;
        });
      });

      it(`shouldn't track an event if the user has opted out`, function() {
        TOKENS.forEach(token => {
          let track = sinon.spy();
          gdpr.optOut(token, {persistenceType});
          gdpr.optOut(token, {track, persistenceType});
          expect(track.notCalled).to.be.true;
        });
      });

      it(`should track an event if the user has opted in`, function() {
        TOKENS.forEach(token => {
          let track = sinon.spy();
          gdpr.optOut(token, {persistenceType});
          gdpr.optIn(token, {persistenceType});
          gdpr.optIn(token, {track, persistenceType});
          expect(track.calledOnce).to.be.true;
        });
      });

      it(`should track an event if the user is switching opt from out to in`, function() {
        TOKENS.forEach(token => {
          let track = sinon.spy();
          gdpr.optOut(token, {persistenceType});
          gdpr.optIn(token, {track, persistenceType});
          expect(track.calledOnce).to.be.true;
        });
      });

      it(`should allow use of a custom "persistence prefix" string (with correct default behavior)`, function() {
        TOKENS.forEach(token => {
          gdpr.optOut(token, {persistenceType});
          gdpr.optIn(token, {persistencePrefix: CUSTOM_PERSISTENCE_PREFIX, persistenceType});

          assertPersistenceValue(persistenceType, token, 0);
          assertPersistenceValue(persistenceType, token, 1, CUSTOM_PERSISTENCE_PREFIX);

          gdpr.optIn(token, {persistenceType});

          assertPersistenceValue(persistenceType, token, 1);
          assertPersistenceValue(persistenceType, token, 1, CUSTOM_PERSISTENCE_PREFIX);

          gdpr.optOut(token, {persistenceType});

          assertPersistenceValue(persistenceType, token, 0);
          assertPersistenceValue(persistenceType, token, 1, CUSTOM_PERSISTENCE_PREFIX);
        });
      });
    });
  });

  describe(`optOut`, function() {
    forPersistenceTypes(function(persistenceType) {
      it(`should set a cookie marking the user as opted-out for a given token`, function() {
        TOKENS.forEach(token => {
          gdpr.optOut(token, {persistenceType});
          assertPersistenceValue(persistenceType, token, 0);
        });
      });

      it(`shouldn't set cookies for any other tokens`, function() {
        const token = TOKENS[0];
        gdpr.optOut(token, {persistenceType});

        TOKENS.filter(otherToken => otherToken !== token).forEach(otherToken => {
          assertPersistenceValue(persistenceType, otherToken, null);
        });
      });

      it(`shouldn't track an event recording the opt-out action`, function() {
        TOKENS.forEach(token => {
          const track = sinon.spy();
          gdpr.optOut(token, {track, persistenceType});
          expect(track.notCalled).to.be.true;
        });
      });

      it(`shouldn't track an event if the user is switching opt from in to out`, function() {
        TOKENS.forEach(token => {
          let track = sinon.spy();
          gdpr.optIn(token);
          gdpr.optOut(token, {track, persistenceType});
          expect(track.calledOnce).to.be.false;
        });
      });

      it(`should allow use of a custom "persistence prefix" string (with correct default behavior)`, function() {
        TOKENS.forEach(token => {
          gdpr.optIn(token, {persistenceType});
          gdpr.optOut(token, {persistencePrefix: CUSTOM_PERSISTENCE_PREFIX, persistenceType});

          assertPersistenceValue(persistenceType, token, 1);
          assertPersistenceValue(persistenceType, token, 0, CUSTOM_PERSISTENCE_PREFIX,);

          gdpr.optOut(token, {persistenceType});

          assertPersistenceValue(persistenceType, token, 0);
          assertPersistenceValue(persistenceType, token, 0, CUSTOM_PERSISTENCE_PREFIX,);

          gdpr.optIn(token, {persistenceType});

          assertPersistenceValue(persistenceType, token, 1);
          assertPersistenceValue(persistenceType, token, 0, CUSTOM_PERSISTENCE_PREFIX,);
        });
      });
    });
  });

  describe(`hasOptedIn`, function() {
    forPersistenceTypes(function(persistenceType) {
      it(`should return 'false' if the user hasn't opted in for a given token`, function() {
        TOKENS.forEach(token => {
          expect(gdpr.hasOptedIn(token, {persistenceType})).to.be.false;
        });
      });

      it(`should return 'true' if the user opts in for a given token`, function() {
        TOKENS.forEach(token => {
          gdpr.optIn(token, {persistenceType});
          expect(gdpr.hasOptedIn(token, {persistenceType})).to.be.true;
        });
      });

      it(`should return 'false' if the user opts in for any other token`, function() {
        const token = TOKENS[0];
        gdpr.optIn(token);

        TOKENS.filter(otherToken => otherToken !== token).forEach(otherToken => {
          expect(gdpr.hasOptedIn(otherToken, {persistenceType})).to.be.false;
        });
      });

      it(`should return 'false' if the user opts out`, function() {
        TOKENS.forEach(token => {
          gdpr.optOut(token, {persistenceType});
          expect(gdpr.hasOptedIn(token, {persistenceType})).to.be.false;
        });
      });

      it(`should return 'true' if the user opts out then opts in`, function() {
        TOKENS.forEach(token => {
          gdpr.optOut(token, {persistenceType});
          gdpr.optIn(token, {persistenceType});
          expect(gdpr.hasOptedIn(token, {persistenceType})).to.be.true;
        });
      });

      it(`should return 'false' if the user opts in then opts out`, function() {
        TOKENS.forEach(token => {
          gdpr.optIn(token, {persistenceType});
          gdpr.optOut(token, {persistenceType});
          expect(gdpr.hasOptedIn(token, {persistenceType})).to.be.false;
        });
      });

      it(`should return 'false' if the user opts in then clears their opt status`, function() {
        TOKENS.forEach(token => {
          gdpr.optIn(token, {persistenceType});
          gdpr.clearOptInOut(token, {persistenceType});
          expect(gdpr.hasOptedIn(token, {persistenceType})).to.be.false;
        });
      });

      it(`should return 'true' if the user clears their opt status then opts in`, function() {
        TOKENS.forEach(token => {
          gdpr.clearOptInOut(token, {persistenceType});
          gdpr.optIn(token, {persistenceType});
          expect(gdpr.hasOptedIn(token, {persistenceType})).to.be.true;
        });
      });

      it(`should allow use of a custom "persistence prefix" string`, function() {
        TOKENS.forEach(token => {
          gdpr.optIn(token, {persistencePrefix: CUSTOM_PERSISTENCE_PREFIX, persistenceType});
          expect(gdpr.hasOptedIn(token, {persistenceType})).to.be.false;
          expect(gdpr.hasOptedIn(token, {persistencePrefix: CUSTOM_PERSISTENCE_PREFIX, persistenceType})).to.be.true;
          gdpr.optOut(token);
          expect(gdpr.hasOptedIn(token, {persistencePrefix: CUSTOM_PERSISTENCE_PREFIX, persistenceType})).to.be.true;
          gdpr.optOut(token, {persistencePrefix: CUSTOM_PERSISTENCE_PREFIX, persistenceType});
          expect(gdpr.hasOptedIn(token, {persistencePrefix: CUSTOM_PERSISTENCE_PREFIX, persistenceType})).to.be.false;
        });
      });
    });
  });

  describe(`hasOptedOut`, function() {
    forPersistenceTypes(function(persistenceType) {
      it(`should return 'false' if the user hasn't opted out for a given token`, function() {
        TOKENS.forEach(token => {
          expect(gdpr.hasOptedOut(token, {persistenceType})).to.be.false;
        });
      });

      it(`should return 'true' if the user opts out for a given token`, function() {
        TOKENS.forEach(token => {
          gdpr.optOut(token, {persistenceType});
          expect(gdpr.hasOptedOut(token, {persistenceType})).to.be.true;
        });
      });

      it(`should return 'false' if the user opts out for any other token`, function() {
        const token = TOKENS[0];
        gdpr.optIn(token, {persistenceType});

        TOKENS.filter(otherToken => otherToken !== token).forEach(otherToken => {
          expect(gdpr.hasOptedIn(otherToken, {persistenceType})).to.be.false;
        });
      });

      it(`should return 'false' if the user opts in`, function() {
        TOKENS.forEach(token => {
          gdpr.optIn(token, {persistenceType});
          expect(gdpr.hasOptedOut(token, {persistenceType})).to.be.false;
        });
      });

      it(`should return 'true' if the user opts in then opts out`, function() {
        TOKENS.forEach(token => {
          gdpr.optIn(token, {persistenceType});
          gdpr.optOut(token, {persistenceType});
          expect(gdpr.hasOptedOut(token, {persistenceType})).to.be.true;
        });
      });

      it(`should return 'false' if the user opts out then opts in`, function() {
        TOKENS.forEach(token => {
          gdpr.optOut(token, {persistenceType});
          gdpr.optIn(token, {persistenceType});
          expect(gdpr.hasOptedOut(token, {persistenceType})).to.be.false;
        });
      });

      it(`should return 'false' if the user opts out then clears their opt status`, function() {
        TOKENS.forEach(token => {
          gdpr.optOut(token, {persistenceType});
          gdpr.clearOptInOut(token, {persistenceType});
          expect(gdpr.hasOptedOut(token, {persistenceType})).to.be.false;
        });
      });

      it(`should return 'true' if the user clears their opt status then opts out`, function() {
        TOKENS.forEach(token => {
          gdpr.clearOptInOut(token, {persistenceType});
          gdpr.optOut(token, {persistenceType});
          expect(gdpr.hasOptedOut(token, {persistenceType})).to.be.true;
        });
      });

      it(`should allow use of a custom "persistence prefix" string`, function() {
        TOKENS.forEach(token => {
          gdpr.optOut(token, {persistencePrefix: CUSTOM_PERSISTENCE_PREFIX, persistenceType});
          expect(gdpr.hasOptedOut(token, {persistenceType})).to.be.false;
          expect(gdpr.hasOptedOut(token, {persistencePrefix: CUSTOM_PERSISTENCE_PREFIX, persistenceType})).to.be.true;
          gdpr.optIn(token, {persistenceType});
          expect(gdpr.hasOptedOut(token, {persistencePrefix: CUSTOM_PERSISTENCE_PREFIX, persistenceType})).to.be.true;
          gdpr.optIn(token, {persistencePrefix: CUSTOM_PERSISTENCE_PREFIX, persistenceType});
          expect(gdpr.hasOptedOut(token, {persistencePrefix: CUSTOM_PERSISTENCE_PREFIX, persistenceType})).to.be.false;
        });
      });

      it(`should return 'true' if the user has navigator.doNotTrack flag set`, function() {
        const falseyValues = [false, 0, `0`, `no`, `unspecified`];
        const truthyValues = [true, 1, `1`, `yes`];
        const setters = [
          value => navigator.doNotTrack = value,
          value => navigator.msDoNotTrack = value,
          value => window.doNotTrack = value,
        ];

        TOKENS.forEach(token => {
          gdpr.optIn(token, {persistenceType});
          expect(gdpr.hasOptedOut(token, {persistenceType})).to.be.false;

          falseyValues.forEach(value =>
            setters.forEach(set => {
              set(value);
              expect(gdpr.hasOptedOut(token, {persistenceType})).to.be.false;
            })
          );

          truthyValues.forEach(value =>
            setters.forEach(set => {
              set(value);
              expect(gdpr.hasOptedOut(token, {persistenceType})).to.be.true;
            })
          );

          // cleanup
          delete navigator.doNotTrack;
          delete navigator.msDoNotTrack;
          delete window.doNotTrack;
        });
      });
    });
  });

  describe(`clearOptInOut`, function() {
    forPersistenceTypes(function(persistenceType) {
      it(`should delete any opt cookies for a given token`, function() {
        [gdpr.optIn, gdpr.optOut].forEach(optFunc => {
          TOKENS.forEach(token => {
            optFunc(token, {persistenceType});
            assertPersistenceValue(persistenceType, token, optFunc === gdpr.optIn ? 1 : 0);
          });

          TOKENS.forEach(token => {
            gdpr.clearOptInOut(token, {persistenceType});
            assertPersistenceValue(persistenceType, token, null);
          });
        });
      });

      it(`shouldn't delete opt cookies for any other token`, function() {
        const token = TOKENS[0];

        [gdpr.optIn, gdpr.optOut].forEach(optFunc => {
          optFunc(token, {persistenceType});
          assertPersistenceValue(persistenceType, token, optFunc === gdpr.optIn ? 1 : 0);

          TOKENS.filter(otherToken => otherToken !== token).forEach(otherToken => {
            gdpr.clearOptInOut(otherToken, {persistenceType});
            assertPersistenceValue(persistenceType, token, optFunc === gdpr.optIn ? 1 : 0);
          });
        });
      });

      it(`should cause hasOptedIn to switch from returning 'true' to returning 'false'`, function() {
        TOKENS.forEach(token => {
          gdpr.optIn(token, {persistenceType});
          expect(gdpr.hasOptedIn(token, {persistenceType})).to.be.true;
          gdpr.clearOptInOut(token, {persistenceType});
          expect(gdpr.hasOptedIn(token, {persistenceType})).to.be.false;
        });
      });

      it(`should cause hasOptedOut to switch from returning 'true' to returning 'false'`, function() {
        TOKENS.forEach(token => {
          gdpr.optOut(token, {persistenceType});
          expect(gdpr.hasOptedOut(token, {persistenceType})).to.be.true;
          gdpr.clearOptInOut(token, {persistenceType});
          expect(gdpr.hasOptedIn(token, {persistenceType})).to.be.false;
        });
      });

      it(`should allow use of a custom "persistence prefix" string`, function() {
        TOKENS.forEach(token => {
          gdpr.optIn(token, {
            persistenceType,
            persistencePrefix: CUSTOM_PERSISTENCE_PREFIX,
          });
          expect(gdpr.hasOptedIn(token, {
            persistenceType,
            persistencePrefix: CUSTOM_PERSISTENCE_PREFIX,
          })).to.be.true;
          gdpr.clearOptInOut(token, {persistenceType});
          expect(gdpr.hasOptedIn(token, {
            persistenceType,
            persistencePrefix: CUSTOM_PERSISTENCE_PREFIX,
          })).to.be.true;
          gdpr.clearOptInOut(token, {
            persistenceType,
            persistencePrefix: CUSTOM_PERSISTENCE_PREFIX,
          });
          expect(gdpr.hasOptedIn(token, {
            persistenceType,
            persistencePrefix: CUSTOM_PERSISTENCE_PREFIX,
          })).to.be.false;
          gdpr.optOut(token, {
            persistenceType,
            persistencePrefix: CUSTOM_PERSISTENCE_PREFIX,
          });
          expect(gdpr.hasOptedOut(token, {
            persistenceType,
            persistencePrefix: CUSTOM_PERSISTENCE_PREFIX,
          })).to.be.true;
          gdpr.clearOptInOut(token);
          expect(gdpr.hasOptedOut(token, {
            persistenceType,
            persistencePrefix: CUSTOM_PERSISTENCE_PREFIX,
          })).to.be.true;
          gdpr.clearOptInOut(token, {
            persistenceType,
            persistencePrefix: CUSTOM_PERSISTENCE_PREFIX,
          });
          expect(gdpr.hasOptedOut(token, {
            persistenceType,
            persistencePrefix: CUSTOM_PERSISTENCE_PREFIX,
          })).to.be.false;
        });
      });
    });
  });

  describe(`addOptOutCheckMixpanelLib`, function() {
    const trackEventName = `єνєηт`;
    const trackProperties = {'𝖕𝖗𝖔𝖕𝖊𝖗𝖙𝖞': `𝓿𝓪𝓵𝓾𝓮`};
    let getConfig, track, mixpanelLib;

    function setupMocks(getConfigFunc, options) {
      getConfig = sinon.spy(name => getConfigFunc()[name]);
      track = sinon.spy();
      mixpanelLib = {
        get_config: getConfig,
        track: gdpr.addOptOutCheckMixpanelLib(track, options),
      };
    }

    forPersistenceTypes(function(persistenceType) {
      it(`should call the wrapped method if the user is neither opted in or opted out`, function() {
        TOKENS.forEach(token => {
          setupMocks(() => ({token, opt_out_tracking_persistence_type: persistenceType}));

          mixpanelLib.track(trackEventName, trackProperties);

          expect(track.calledOnceWith(trackEventName, trackProperties)).to.be.true;
        });
      });

      it(`should call the wrapped method if the user is opted in`, function() {
        TOKENS.forEach(token => {
          setupMocks(() => ({token, opt_out_tracking_persistence_type: persistenceType}));

          gdpr.optIn(token, {persistenceType});
          mixpanelLib.track(trackEventName, trackProperties);

          expect(track.calledOnceWith(trackEventName, trackProperties)).to.be.true;
        });
      });

      it(`should not call the wrapped method if the user is opted out`, function() {
        TOKENS.forEach(token => {
          setupMocks(() => ({token, opt_out_tracking_persistence_type: persistenceType}));

          gdpr.optOut(token, {persistenceType});
          mixpanelLib.track(trackEventName, trackProperties);

          expect(track.notCalled).to.be.true;
        });
      });

      it(`should not invoke the callback directly if the user is neither opted in or opted out`, function() {
        TOKENS.forEach(token => {
          setupMocks(() => ({token, opt_out_tracking_persistence_type: persistenceType}));
          const callback = sinon.spy();

          mixpanelLib.track(trackEventName, trackProperties, callback);

          expect(callback.notCalled).to.be.true;
        });
      });

      it(`should not invoke the callback directly if the user is opted in`, function() {
        TOKENS.forEach(token => {
          setupMocks(() => ({token, opt_out_tracking_persistence_type: persistenceType}));
          const callback = sinon.spy();

          gdpr.optIn(token, {persistenceType});
          mixpanelLib.track(trackEventName, trackProperties, callback);

          expect(callback.notCalled).to.be.true;
        });
      });

      it(`should invoke the callback directly if the user is opted out`, function() {
        TOKENS.forEach(token => {
          setupMocks(() => ({token, opt_out_tracking_persistence_type: persistenceType}));
          const callback = sinon.spy();

          gdpr.optOut(token, {persistenceType});
          mixpanelLib.track(trackEventName, trackProperties, callback);

          expect(callback.calledOnceWith(0)).to.be.true;
        });
      });

      it(`should call the wrapped method if there is no token available`, function() {
        TOKENS.forEach(token => {
          setupMocks(() => ({token: null, opt_out_tracking_persistence_type: persistenceType}));

          gdpr.optIn(token, {persistenceType});
          mixpanelLib.track(trackEventName, trackProperties);

          expect(track.calledOnceWith(trackEventName, trackProperties)).to.be.true;
        });
      });

      it(`should call the wrapped method if an unexpected error occurs`, function() {
        TOKENS.forEach(token => {
          setupMocks(() => {
            throw new Error(`Unexpected error!`);
          });

          gdpr.optIn(token, {persistenceType});
          mixpanelLib.track(trackEventName, trackProperties);

          expect(track.calledOnceWith(trackEventName, trackProperties)).to.be.true;
        });
      });

      it(`should allow use of a custom "persistence prefix" string`, function() {
        TOKENS.forEach(token => {
          setupMocks(() => ({
            token,
            opt_out_tracking_persistence_type: persistenceType,
            opt_out_tracking_cookie_prefix: CUSTOM_PERSISTENCE_PREFIX,
          }));

          gdpr.optOut(token, {persistenceType, persistencePrefix: CUSTOM_PERSISTENCE_PREFIX});
          mixpanelLib.track(trackEventName, trackProperties);

          expect(track.notCalled).to.be.true;

          gdpr.optIn(token, {persistenceType});
          mixpanelLib.track(trackEventName, trackProperties);

          expect(track.notCalled).to.be.true;

          gdpr.optIn(token, {persistenceType, persistencePrefix: CUSTOM_PERSISTENCE_PREFIX});
          mixpanelLib.track(trackEventName, trackProperties);

          expect(track.calledOnceWith(trackEventName, trackProperties)).to.be.true;
        });
      });
    });
  });

  describe(`addOptOutCheckMixpanelPeople`, function() {
    const setPropertyName = '𝖕𝖗𝖔𝖕𝖊𝖗𝖙𝖞';
    const setPropertyValue = `𝓿𝓪𝓵𝓾𝓮`;
    let getConfig, set, mixpanelPeople;

    function setupMocks(getConfigFunc, options) {
      getConfig = sinon.spy(name => getConfigFunc()[name]);
      set = sinon.spy();
      mixpanelPeople = {
        _get_config: getConfig,
        set: gdpr.addOptOutCheckMixpanelPeople(set, options),
      };
    }

    forPersistenceTypes(function(persistenceType) {
      it(`should call the wrapped method if the user is neither opted in or opted out`, function() {
        TOKENS.forEach(token => {
          setupMocks(() => ({token, opt_out_tracking_persistence_type: persistenceType}));

          mixpanelPeople.set(setPropertyName, setPropertyValue);

          expect(set.calledOnceWith(setPropertyName, setPropertyValue)).to.be.true;
        });
      });

      it(`should call the wrapped method if the user is opted in`, function() {
        TOKENS.forEach(token => {
          setupMocks(() => ({token, opt_out_tracking_persistence_type: persistenceType}));

          gdpr.optIn(token, {persistenceType});
          mixpanelPeople.set(setPropertyName, setPropertyValue);

          expect(set.calledOnceWith(setPropertyName, setPropertyValue)).to.be.true;
        });
      });

      it(`should not call the wrapped method if the user is opted out`, function() {
        TOKENS.forEach(token => {
          setupMocks(() => ({token, opt_out_tracking_persistence_type: persistenceType}));

          gdpr.optOut(token, {persistenceType});
          mixpanelPeople.set(setPropertyName, setPropertyValue);

          expect(set.notCalled).to.be.true;
        });
      });

      it(`should not invoke the callback directly if the user is neither opted in or opted out`, function() {
        TOKENS.forEach(token => {
          setupMocks(() => ({token, opt_out_tracking_persistence_type: persistenceType}));
          const callback = sinon.spy();

          mixpanelPeople.set(setPropertyName, setPropertyValue, callback);

          expect(callback.notCalled).to.be.true;
        });
      });

      it(`should not invoke the callback directly if the user is opted in`, function() {
        TOKENS.forEach(token => {
          setupMocks(() => ({token, opt_out_tracking_persistence_type: persistenceType}));
          const callback = sinon.spy();

          gdpr.optIn(token, {persistenceType});
          mixpanelPeople.set(setPropertyName, setPropertyValue, callback);

          expect(callback.notCalled).to.be.true;
        });
      });

      it(`should invoke the callback directly if the user is opted out`, function() {
        TOKENS.forEach(token => {
          setupMocks(() => ({token, opt_out_tracking_persistence_type: persistenceType}));
          const callback = sinon.spy();

          gdpr.optOut(token, {persistenceType});
          mixpanelPeople.set(setPropertyName, setPropertyValue, callback);

          expect(callback.calledOnceWith(0)).to.be.true;
        });
      });

      it(`should call the wrapped method if there is no token available`, function() {
        TOKENS.forEach(token => {
          setupMocks(() => ({token: null, opt_out_tracking_persistence_type: persistenceType}));

          gdpr.optIn(token, {persistenceType});
          mixpanelPeople.set(setPropertyName, setPropertyValue);

          expect(set.calledOnceWith(setPropertyName, setPropertyValue)).to.be.true;
        });
      });

      it(`should call the wrapped method if an unexpected error occurs`, function() {
        TOKENS.forEach(token => {
          setupMocks(() => {
            throw new Error(`Unexpected error!`);
          });

          gdpr.optIn(token, {persistenceType});
          mixpanelPeople.set(setPropertyName, setPropertyValue);

          expect(set.calledOnceWith(setPropertyName, setPropertyValue)).to.be.true;
        });
      });

      it(`should allow use of a custom "persistence prefix" string`, function() {
        TOKENS.forEach(token => {
          setupMocks(() => ({
            token,
            opt_out_tracking_persistence_type: persistenceType,
            opt_out_tracking_cookie_prefix: CUSTOM_PERSISTENCE_PREFIX,
          }));

          gdpr.optOut(token, {persistenceType, persistencePrefix: CUSTOM_PERSISTENCE_PREFIX});
          mixpanelPeople.set(setPropertyName, setPropertyValue);

          expect(set.notCalled).to.be.true;

          gdpr.optIn(token, {persistenceType});
          mixpanelPeople.set(setPropertyName, setPropertyValue);

          expect(set.notCalled).to.be.true;

          gdpr.optIn(token, {persistenceType, persistencePrefix: CUSTOM_PERSISTENCE_PREFIX});
          mixpanelPeople.set(setPropertyName, setPropertyValue);

          expect(set.calledOnceWith(setPropertyName, setPropertyValue)).to.be.true;
        });
      });
    });
  });
});
