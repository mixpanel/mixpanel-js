/**
 * The consent rules as two tables: CONSENT_MODES maps each mode's decisions to a state, and
 * CONSENT_STATES says what each state allows:
 *   'api_calls'  the public tracking, people, group and replay methods run
 *   'send'       tracking requests go out
 *   'fetch'      feature flags and remote settings are fetched
 *   'store'      the services store data about the visitor
 */

import { console } from './utils';

/** @const */ var CONSENT_MODE_NO_CONSENT_REQUIRED = 'no_consent_required';
/** @const */ var CONSENT_MODE_REQUIRE_CONSENT = 'require_consent';

/** @const */ var CAPABILITIES = ['api_calls', 'send', 'fetch', 'store'];

/** @const */ var DECISION_NONE = 'none';
/** @const */ var DECISION_OPTED_IN = 'opted_in';
/** @const */ var DECISION_OPTED_OUT = 'opted_out';
// Do Not Track counts as an objection
/** @const */ var DECISION_OBJECTED = 'objected';

/** @const */ var STATE_FULL = 'full';
/** @const */ var STATE_API_CALLS_STOPPED = 'api_calls_stopped';
/** @const */ var STATE_BLOCKED = 'blocked';

/** @const */ var CONSENT_STATES = {
    // the SDK works normally, as for a site with no consent rules
    'full':              {'api_calls': true,  'send': true,  'fetch': true,  'store': true},
    // an opt-out under 'no_consent_required': the public calls do nothing, flags keep loading,
    // and persistence follows the opt-out's clear_persistence and enable_persistence options
    'api_calls_stopped': {'api_calls': false, 'send': true,  'fetch': true,  'store': true},
    // nothing runs, is sent or is stored
    'blocked':           {'api_calls': false, 'send': false, 'fetch': false, 'store': false}
};

/**
 * Each mode's state for each decision. 'no_consent_required' keeps its decisions with
 * OptOutFlagDecisions, the other modes with ConsentDecisions.
 */
/** @const */ var CONSENT_MODES = {
    'no_consent_required': {'none': STATE_FULL,    'opted_in': STATE_FULL, 'opted_out': STATE_API_CALLS_STOPPED, 'objected': STATE_API_CALLS_STOPPED},
    'require_consent':     {'none': STATE_BLOCKED, 'opted_in': STATE_FULL, 'opted_out': STATE_BLOCKED,           'objected': STATE_BLOCKED}
};

/**
 * The mode for a consent_mode config value, by default 'no_consent_required'. An unknown value
 * falls back to 'require_consent', so a typo stores and sends nothing before consent.
 * @param {string|null|undefined} configuredMode
 * @returns {string}
 */
function resolveConsentMode(configuredMode) {
    if (!configuredMode) {
        return CONSENT_MODE_NO_CONSENT_REQUIRED;
    }
    if (!CONSENT_MODES.hasOwnProperty(configuredMode)) {
        console.critical('Unknown consent_mode ' + configuredMode + '; using \'' + CONSENT_MODE_REQUIRE_CONSENT + '\'');
        return CONSENT_MODE_REQUIRE_CONSENT;
    }
    return configuredMode;
}

/**
 * The visitor's decision: Do Not Track, then the stored opt-out flag.
 * @param {boolean} doNotTrack whether Do Not Track is on and not ignored
 * @param {string|null} storedFlag '1', '0', or null when there's none
 * @returns {string}
 */
function readDecision(doNotTrack, storedFlag) {
    if (doNotTrack) {
        console.warn('This browser has "Do Not Track" enabled. This will prevent the Mixpanel SDK from sending any data. To ignore the "Do Not Track" browser setting, initialize the Mixpanel instance with the config "ignore_dnt: true"');
        return DECISION_OBJECTED;
    }

    if (storedFlag === '1') {
        return DECISION_OPTED_IN;
    } else if (storedFlag === '0') {
        console.warn('You are opted out of Mixpanel tracking. This will prevent the Mixpanel SDK from sending any data.');
        return DECISION_OPTED_OUT;
    }
    return DECISION_NONE;
}

export {
    CONSENT_MODE_NO_CONSENT_REQUIRED,
    CONSENT_MODE_REQUIRE_CONSENT,
    CAPABILITIES,
    DECISION_NONE,
    DECISION_OPTED_IN,
    DECISION_OPTED_OUT,
    DECISION_OBJECTED,
    CONSENT_STATES,
    CONSENT_MODES,
    resolveConsentMode,
    readDecision
};
