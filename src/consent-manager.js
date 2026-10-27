/**
 * Consent for one instance, and the instance's ConsentGate: the rest of the SDK asks its
 * allowsApiCalls(), allowsSending() and so on, and never reads the mode. The mode picks a row of
 * CONSENT_MODES (consent-modes.js), which maps the visitor's decision to a state, and
 * CONSENT_STATES says what that state allows. Where the decision is stored, and what changes when
 * the visitor decides, is up to OptOutFlagDecisions under 'no_consent_required' and
 * ConsentDecisions under the other modes.
 */

import { _ } from './utils';
import {
    CAPABILITIES,
    CONSENT_MODES,
    CONSENT_STATES,
    CONSENT_MODE_NO_CONSENT_REQUIRED,
    resolveConsentMode
} from './consent-modes';
import { buildConsentGate } from './consent-gate';
import { OptOutFlagDecisions } from './opt-out-flag-decisions';
import { ConsentDecisions } from './consent-decisions';

/**
 * The answers that are the same in every state a mode can reach, which allows() gives without
 * reading the decision.
 * @param {string} mode
 * @returns {Object<string, boolean>}
 */
function fixedAnswers(mode) {
    var states = _.values(CONSENT_MODES[mode]);
    var answers = {};
    _.each(CAPABILITIES, function(capability) {
        var answer = CONSENT_STATES[states[0]][capability];
        var same = true;
        _.each(states, function(state) {
            same = same && CONSENT_STATES[state][capability] === answer;
        });
        if (same) {
            answers[capability] = answer;
        }
    });
    return answers;
}

/**
 * @constructor
 * @param {Object} options the options of OptOutFlagDecisions and ConsentDecisions; each uses its
 * own
 */
var ConsentManager = function(options) {
    this.getConfig = options.getConfigFunc;
    this.mode = resolveConsentMode(options.getConfigFunc('consent_mode'));
    this.fixedAnswers = fixedAnswers(this.mode);
    this.decisions = this.mode === CONSENT_MODE_NO_CONSENT_REQUIRED ?
        new OptOutFlagDecisions(this.mode, options) :
        new ConsentDecisions(this.mode, options);
    _.extend(this, buildConsentGate(_.bind(this.allows, this), this.getConfig));
    // the arguments of the latest identify() made while storage isn't allowed
    this.heldIdentify = null;
};

/**
 * Whether the visitor's current state allows something. The rest of the SDK asks the ConsentGate
 * methods built on this.
 * @param {string} capability 'api_calls', 'send', 'fetch' or 'store'
 * @returns {boolean}
 */
ConsentManager.prototype.allows = function(capability) {
    if (this.fixedAnswers.hasOwnProperty(capability)) {
        return this.fixedAnswers[capability];
    }
    return CONSENT_STATES[this.state()][capability];
};

/**
 * @returns {string}
 */
ConsentManager.prototype.state = function() {
    return this.decisions.state();
};

/**
 * Keep an identify() made while storage isn't allowed, to apply if the visitor opts in on this page.
 * @param {Array} identifyArgs
 */
ConsentManager.prototype.holdIdentify = function(identifyArgs) {
    this.heldIdentify = identifyArgs;
};

/**
 * @returns {Array|null} the held identify() arguments, which are then no longer held
 */
ConsentManager.prototype.takeHeldIdentify = function() {
    var identifyArgs = this.heldIdentify;
    this.heldIdentify = null;
    return identifyArgs;
};

/**
 * Make the writes the stored decision calls for, once the instance has built the persistence and
 * services they touch. allows() already answers before this.
 */
ConsentManager.prototype.init = function() {
    this.decisions.init();
};

/**
 * @param {Object} [options] has_opted_in_tracking() options
 * @returns {boolean}
 */
ConsentManager.prototype.hasOptedIn = function(options) {
    return this.decisions.hasOptedIn(options);
};

/**
 * @param {Object} [options] has_opted_out_tracking() options
 * @returns {boolean}
 */
ConsentManager.prototype.hasOptedOut = function(options) {
    return this.decisions.hasOptedOut(options);
};

/**
 * @param {Object} [options] opt_in_tracking() options
 */
ConsentManager.prototype.optIn = function(options) {
    this.decisions.optIn(options);
};

/**
 * @param {Object} [options] opt_out_tracking() options
 */
ConsentManager.prototype.optOut = function(options) {
    this.decisions.optOut(options);
};

/**
 * @param {Object} [options] clear_opt_in_out_tracking() options
 */
ConsentManager.prototype.clear = function(options) {
    this.decisions.clear(options);
};

export { ConsentManager };
