/**
 * Decisions under 'require_consent'. The decision is stored with the persistence, so a subdomain
 * sharing the identity cookie shares it. The state is read once, when the instance is built, and
 * then changed only by this page's decisions; storage opens and closes when it changes, and without
 * consent to store, everything stored about the visitor but the decision is deleted.
 *
 * The constructor reads the stored decision and writes nothing, so the instance can ask allows()
 * while it builds persistence and the services. init() runs once they exist and makes the writes.
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
    // read from storage the first time it's asked for
    this.appliedState = null;
};

// delete what an earlier page stored without consent
ConsentDecisions.prototype.init = function() {
    this._reconcile();
};

/**
 * @returns {string}
 */
ConsentDecisions.prototype.state = function() {
    if (this.appliedState === null) {
        this.appliedState = CONSENT_MODES[this.mode][this._readDecision()];
    }
    return this.appliedState;
};

/**
 * @returns {boolean}
 */
ConsentDecisions.prototype.hasOptedIn = function() {
    return this._readFlag() === '1';
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

ConsentDecisions.prototype.optOut = function() {
    this._decide(DECISION_OPTED_OUT);
};

ConsentDecisions.prototype.clear = function() {
    this._decide(DECISION_NONE);
};

/**
 * Store a decision, move this page's state to match it, and open or close storage when that
 * changes whether storage is allowed.
 * @param {string} decision
 * @param {Object} [options] opt_in_tracking() options
 */
ConsentDecisions.prototype._decide = function(decision, options) {
    options = options || {};
    var wasStoring = this._allowsStore();
    this._writeDecision(decision);

    // the state changes before the services start or stop, because they ask it. It follows the
    // decision even if storing it failed; Do Not Track still wins.
    this.appliedState = CONSENT_MODES[this.mode][doNotTrackApplies(this.getConfig) ? DECISION_OBJECTED : decision];
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
 * Store a decision as the opt-out flag ('1' for an opt-in, '0' for an opt-out), removed at every
 * cookie scope first so a copy an earlier config left can't shadow it.
 * @param {string} decision
 */
ConsentDecisions.prototype._writeDecision = function(decision) {
    var flag = null;
    if (decision === DECISION_OPTED_IN) {
        flag = '1';
    } else if (decision === DECISION_OPTED_OUT) {
        flag = '0';
    }
    // a decision that's already stored isn't written again
    if (this._readFlag() === flag) {
        return;
    }
    this._writeDecisionKey(this._decisionKey(), flag);
};

/**
 * @param {string} key
 * @param {string|null} value null to remove it
 */
ConsentDecisions.prototype._writeDecisionKey = function(key, value) {
    var getConfig = this.getConfig;
    var cookieDomain = getConfig('cookie_domain');
    _.cookie.remove(key);
    _.cookie.remove(key, true);
    if (cookieDomain) {
        _.cookie.remove(key, false, cookieDomain);
    }
    if (this._decisionInLocalStorage()) {
        if (value === null) {
            _.localStorage.remove(key);
        } else {
            _.localStorage.set(key, value);
        }
    } else if (value !== null) {
        _.cookie.set(
            key,
            value,
            getConfig('cookie_expiration'),
            getConfig('cross_subdomain_cookie'),
            getConfig('secure_cookie'),
            getConfig('cross_site_cookie'),
            cookieDomain
        );
    }
};

// the store the persistence uses, chosen without the localStorage support probe, which writes a key
ConsentDecisions.prototype._decisionInLocalStorage = function() {
    return this.getConfig('persistence') === 'localStorage' && !!getLocalStorage();
};

ConsentDecisions.prototype._decisionStore = function() {
    return this._decisionInLocalStorage() ? _.localStorage : _.cookie;
};

ConsentDecisions.prototype._decisionKey = function() {
    return (this.getConfig('opt_out_tracking_cookie_prefix') || OPT_IN_OUT_FLAG_PREFIX) + this.getConfig('token');
};

/**
 * @param {Object} [options] a call's ignore_dnt option
 * @returns {string}
 */
ConsentDecisions.prototype._readDecision = function(options) {
    return readDecision(doNotTrackApplies(this.getConfig, options), this._readFlag());
};

/**
 * @returns {string|null} the stored opt-out flag: '1', '0', or null when there's none
 */
ConsentDecisions.prototype._readFlag = function() {
    return this._decisionStore().get(this._decisionKey());
};

export { ConsentDecisions };
