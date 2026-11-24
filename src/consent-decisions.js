/**
 * Decisions under 'require_consent' and 'exempt', stored with the persistence; an objection has its
 * own key. Without consent to store, everything about the visitor but the decision is deleted.
 *
 * The decision is kept three ways:
 * - stored (_readDecision): read from storage on each call, so has_opted_out_tracking() sees
 *   another tab's decision
 * - this page's (_pageDecision): read once, then set by this page's calls, so a decision applies
 *   here even if storing it failed
 * - applied state (state()): this page's decision through the mode table, with Do Not Track read
 *   only then, so the state changes only at a decision
 *
 * Reading writes nothing, so allows() works while the instance is built; init() makes the writes.
 */

import { _, getLocalStorage } from './utils';
import { OPT_IN_OUT_FLAG_PREFIX, doNotTrackApplies } from './opt-out-flag';
import {
    CONSENT_MODES,
    CONSENT_STATES,
    DECISION_NONE,
    DECISION_OPTED_IN,
    DECISION_OPTED_OUT,
    DECISION_OBJECTED,
    readDecision
} from './consent-modes';

/** @const */ var OBJECTION_PREFIX = '__mp_objection_';

/**
 * @constructor
 * @param {string} mode
 * @param {Object} options
 * @param {function} options.getConfigFunc the instance's get_config
 * @param {function} options.trackFunc the instance's track, for the $opt_in event
 * @param {function} options.startTrackingFunc open storage and start the services when the state
 * starts allowing storage
 * @param {function} options.stopTrackingFunc stop the services and close storage when it stops
 * @param {function} options.purgeIdentifiersFunc delete everything stored about the visitor except
 * the decision
 */
var ConsentDecisions = function(mode, options) {
    this.mode = mode;
    this.getConfig = options.getConfigFunc;
    this.track = options.trackFunc;
    this.startTracking = options.startTrackingFunc;
    this.stopTracking = options.stopTrackingFunc;
    this.purgeIdentifiers = options.purgeIdentifiersFunc;
    // read once, so a set_config() change can't move where the decision is kept
    this.storageConfig = decisionStorageConfig(this.getConfig);
    this.store = decisionStore(this.storageConfig);
    // read from storage the first time they're asked for
    this.decision = null;
    this.appliedState = null;
};

// delete what an earlier page stored without consent
ConsentDecisions.prototype.init = function() {
    this._reconcile();
};

/**
 * @returns {ConsentState}
 */
ConsentDecisions.prototype.state = function() {
    if (this.appliedState === null) {
        this.appliedState = this._stateFor(this._pageDecision());
    }
    return this.appliedState;
};

/**
 * @returns {boolean}
 */
ConsentDecisions.prototype.hasOptedIn = function() {
    return this._readFlag() === '1' && !this._readObjection();
};

/**
 * @param {Object} [options] a call's ignore_dnt option
 * @returns {boolean}
 */
ConsentDecisions.prototype.hasOptedOut = function(options) {
    var decision = this._readDecision(options);
    return decision === DECISION_OPTED_OUT || decision === DECISION_OBJECTED;
};

/**
 * @param {Object} [options] opt_in_tracking() options; only the track options apply
 */
ConsentDecisions.prototype.optIn = function(options) {
    this._decide(DECISION_OPTED_IN, options);
};

// an opt-out doesn't lift an objection, this page's or one another tab stored; only an opt-in or
// a clear does
ConsentDecisions.prototype.optOut = function() {
    var objected = this._pageDecision() === DECISION_OBJECTED || this._readObjection();
    this._decide(objected ? DECISION_OBJECTED : DECISION_OPTED_OUT);
};

// only 'exempt' treats an objection apart from an opt-out
ConsentDecisions.prototype.objectTo = function() {
    this._decide(DECISION_OBJECTED);
};

ConsentDecisions.prototype.clear = function() {
    this._decide(DECISION_NONE);
};

/**
 * Store a decision, move this page's state to match it, and open or close storage when that
 * changes whether storage is allowed.
 * @param {ConsentDecision} decision
 * @param {Object} [options] opt_in_tracking() options
 */
ConsentDecisions.prototype._decide = function(decision, options) {
    options = options || {};
    var wasStoring = this._allowsStore();
    this._writeDecision(decision);

    // the state changes before the services start or stop, because they ask it. The page follows
    // the decision even if storing it failed; Do Not Track still wins.
    this.decision = decision;
    this.appliedState = this._stateFor(decision);
    var storing = this._allowsStore();

    if (wasStoring && !storing) {
        this.stopTracking();
    }
    this._reconcile();
    if (!wasStoring && storing) {
        this.startTracking();
    }

    // after the services start, so it carries the visitor's ID and a recording it triggers finds
    // replay set up
    var track = _.isUndefined(options['track']) ? this.track : options['track'];
    if (decision === DECISION_OPTED_IN && storing && track) {
        track(options['track_event_name'] || '$opt_in', options['track_properties'], {'send_immediately': true});
    }
};

/**
 * @param {ConsentDecision} decision
 * @returns {ConsentState}
 */
ConsentDecisions.prototype._stateFor = function(decision) {
    return CONSENT_MODES[this.mode][doNotTrackApplies(this.getConfig) ? DECISION_OBJECTED : decision];
};

ConsentDecisions.prototype._allowsStore = function() {
    return CONSENT_STATES[this.state()]['store'] === true;
};

/**
 * Make what's stored match the state, whatever an earlier page, SDK version or decision left:
 * without consent to store, delete everything about the visitor but the decision.
 */
ConsentDecisions.prototype._reconcile = function() {
    if (!this._allowsStore()) {
        this.purgeIdentifiers();
    }
};

/**
 * Store a decision as the opt-out flag ('1' for an opt-in, '0' for an opt-out or an objection)
 * and the objection, each removed at every cookie scope first so a copy an earlier config left
 * can't shadow it. What's already stored isn't written again.
 * @param {ConsentDecision} decision
 */
ConsentDecisions.prototype._writeDecision = function(decision) {
    var flag = null;
    if (decision === DECISION_OPTED_IN) {
        flag = '1';
    } else if (decision === DECISION_OPTED_OUT || decision === DECISION_OBJECTED) {
        flag = '0';
    }
    if (this._readFlag() !== flag) {
        this._writeDecisionKey(this._decisionKey(), flag);
    }
    var objected = decision === DECISION_OBJECTED;
    if (this._readObjection() !== objected) {
        this._writeDecisionKey(objectionKey(this.getConfig('token')), objected ? '1' : null);
    }
};

/**
 * @param {string} key
 * @param {string|null} value null to remove it
 */
ConsentDecisions.prototype._writeDecisionKey = function(key, value) {
    writeDecisionKey(this.storageConfig, key, value);
};

ConsentDecisions.prototype._decisionKey = function() {
    return (this.getConfig('opt_out_tracking_cookie_prefix') || OPT_IN_OUT_FLAG_PREFIX) + this.getConfig('token');
};

/**
 * @returns {ConsentDecision} this page's decision, without Do Not Track
 */
ConsentDecisions.prototype._pageDecision = function() {
    if (this.decision === null) {
        this.decision = readDecision(false, this._readFlag(), this._readObjection());
    }
    return this.decision;
};

/**
 * @param {Object} [options] a call's ignore_dnt option
 * @returns {ConsentDecision} the stored decision, with Do Not Track
 */
ConsentDecisions.prototype._readDecision = function(options) {
    return readDecision(doNotTrackApplies(this.getConfig, options), this._readFlag(), this._readObjection());
};

/**
 * @returns {string|null} the stored opt-out flag: '1', '0', or null when there's none
 */
ConsentDecisions.prototype._readFlag = function() {
    return this.store.get(this._decisionKey());
};

/**
 * @returns {boolean} whether an objection is stored
 */
ConsentDecisions.prototype._readObjection = function() {
    return this.store.get(objectionKey(this.getConfig('token'))) !== null;
};

/**
 * Where and how the decision is stored: the store and cookie config the persistence uses.
 * localStorage is chosen without the support probe, which writes a key.
 * @typedef {{inLocalStorage: boolean, cookieDomain: string, cookieExpiration: number,
 *     crossSubdomain: boolean, secure: boolean, crossSite: boolean}} DecisionStorageConfig
 * @param {function} getConfig the instance's get_config
 * @returns {DecisionStorageConfig}
 */
function decisionStorageConfig(getConfig) {
    return {
        inLocalStorage: getConfig('persistence') === 'localStorage' && !!getLocalStorage(),
        cookieDomain: getConfig('cookie_domain'),
        cookieExpiration: getConfig('cookie_expiration'),
        crossSubdomain: getConfig('cross_subdomain_cookie'),
        secure: getConfig('secure_cookie'),
        crossSite: getConfig('cross_site_cookie')
    };
}

/**
 * @param {DecisionStorageConfig} storageConfig
 */
function decisionStore(storageConfig) {
    return storageConfig.inLocalStorage ? _.localStorage : _.cookie;
}

/**
 * Remove a key at every cookie scope, so a copy an earlier config left can't shadow it, then write it.
 * @param {DecisionStorageConfig} storageConfig
 * @param {string} key
 * @param {string|null} value null to remove it
 */
function writeDecisionKey(storageConfig, key, value) {
    _.cookie.remove(key);
    _.cookie.remove(key, true);
    if (storageConfig.cookieDomain) {
        _.cookie.remove(key, false, storageConfig.cookieDomain);
    }
    if (storageConfig.inLocalStorage) {
        if (value === null) {
            _.localStorage.remove(key);
        } else {
            _.localStorage.set(key, value);
        }
    } else if (value !== null) {
        _.cookie.set(
            key,
            value,
            storageConfig.cookieExpiration,
            storageConfig.crossSubdomain,
            storageConfig.secure,
            storageConfig.crossSite,
            storageConfig.cookieDomain
        );
    }
}

/**
 * @param {string} token
 */
function objectionKey(token) {
    return OBJECTION_PREFIX + token;
}

/**
 * @param {DecisionStorageConfig} storageConfig
 * @param {string} token
 * @returns {boolean} whether an objection is stored
 */
function objectionStored(storageConfig, token) {
    return decisionStore(storageConfig).get(objectionKey(token)) !== null;
}

/**
 * Store or remove the objection where 'require_consent' and 'exempt' read it, so it holds when a
 * site switches to one of them.
 * @param {DecisionStorageConfig} storageConfig
 * @param {string} token
 * @param {boolean} objected
 */
function storeObjection(storageConfig, token, objected) {
    if (objectionStored(storageConfig, token) !== objected) {
        writeDecisionKey(storageConfig, objectionKey(token), objected ? '1' : null);
    }
}

export { ConsentDecisions, decisionStorageConfig, storeObjection };
