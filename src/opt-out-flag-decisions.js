/**
 * Decisions under 'no_consent_required', which is what the opt_out_* configs have always done. The
 * decision is the opt-out flag in opt_out_tracking_persistence_type, read at every check so another
 * tab's decision applies at once. A decision's clear_persistence and enable_persistence options
 * turn the instance's persistence off or on, and opt_out_tracking_by_default stores an opt-out at
 * init when nothing is stored.
 */

import { _ } from './utils';
import {
    optIn,
    optOut,
    clearOptInOut,
    readOptInOutFlag,
    getOptOutCheckPersistenceType,
    doNotTrackApplies
} from './opt-out-flag';
import { CONSENT_MODES, DECISION_OPTED_OUT, DECISION_OBJECTED, readDecision } from './consent-modes';

/**
 * @constructor
 * @param {string} mode
 * @param {Object} options
 * @param {function} options.getConfigFunc the instance's get_config
 * @param {function} options.trackFunc the instance's track, for the $opt_in event
 * @param {function(boolean)} options.setPersistenceDisabledFunc turn the instance's persistence,
 * batching and recording off (true) or back on (false)
 * @param {function} options.deleteUserFunc delete the identified user's profile and charges
 */
var OptOutFlagDecisions = function(mode, options) {
    this.mode = mode;
    this.getConfig = options.getConfigFunc;
    this.track = options.trackFunc;
    this.setPersistenceDisabled = options.setPersistenceDisabledFunc;
    this.deleteUser = options.deleteUserFunc;
};

/**
 * Move a cookie flag to localStorage if that's the configured store, then apply a stored opt-out,
 * or opt out when nothing is stored and the configs say to.
 */
OptOutFlagDecisions.prototype.init = function() {
    var localStorageRequested = this.getConfig('opt_out_tracking_persistence_type') === 'localStorage';
    if (localStorageRequested && _.localStorage.is_supported()) {
        if (!this.hasOptedIn({'persistence_type': 'localStorage'}) && this.hasOptedIn({'persistence_type': 'cookie'})) {
            this.optIn({'enable_persistence': false});
        }
        if (!this.hasOptedOut({'persistence_type': 'localStorage'}) && this.hasOptedOut({'persistence_type': 'cookie'})) {
            this.optOut({'clear_persistence': false});
        }
        this.clear({
            'persistence_type': 'cookie',
            'enable_persistence': false
        });
    }

    if (this.hasOptedOut()) {
        this._updatePersistence({'clear_persistence': true});
    // persistence isn't cleared here by default, since the opt-out default is often an initial
    // state while consent is being collected
    } else if (!this.hasOptedIn() && (this._optsOutByDefault() || _.cookie.get('mp_optout'))) {
        _.cookie.remove('mp_optout');
        this.optOut({
            'clear_persistence': this.getConfig('opt_out_persistence_by_default')
        });
    }
};

// opt_out_tracking_by_default applies only without consent_mode, which replaces it
OptOutFlagDecisions.prototype._optsOutByDefault = function() {
    return !this.getConfig('consent_mode') && !!this.getConfig('opt_out_tracking_by_default');
};

/**
 * @returns {string}
 */
OptOutFlagDecisions.prototype.state = function() {
    return CONSENT_MODES[this.mode][this._readDecision()];
};

/**
 * @param {Object} [options] persistence_type and cookie_prefix to read
 * @returns {boolean}
 */
OptOutFlagDecisions.prototype.hasOptedIn = function(options) {
    return this._readFlag(options) === '1';
};

/**
 * @param {Object} [options] persistence_type, cookie_prefix and ignore_dnt to read with
 * @returns {boolean}
 */
OptOutFlagDecisions.prototype.hasOptedOut = function(options) {
    var decision = this._readDecision(options);
    return decision === DECISION_OPTED_OUT || decision === DECISION_OBJECTED;
};

/**
 * @param {Object} [options] opt_in_tracking() options
 */
OptOutFlagDecisions.prototype.optIn = function(options) {
    options = _.extend({'enable_persistence': true}, options);
    this._writeFlag(optIn, options);
    this._updatePersistence(options);
};

/**
 * @param {Object} [options] opt_out_tracking() options
 */
OptOutFlagDecisions.prototype.optOut = function(options) {
    options = _.extend({
        'clear_persistence': true,
        'delete_user': true
    }, options);

    // before the opt-out, which blocks the people calls this makes
    if (options['delete_user']) {
        this.deleteUser();
    }

    this._writeFlag(optOut, options);
    this._updatePersistence(options);
};

/**
 * @param {Object} [options] clear_opt_in_out_tracking() options
 */
OptOutFlagDecisions.prototype.clear = function(options) {
    options = _.extend({'enable_persistence': true}, options);
    this._writeFlag(clearOptInOut, options);
    this._updatePersistence(options);
};

/**
 * @param {Object} options a decision's clear_persistence or enable_persistence option
 */
OptOutFlagDecisions.prototype._updatePersistence = function(options) {
    if (options['clear_persistence']) {
        this.setPersistenceDisabled(true);
    } else if (options['enable_persistence']) {
        this.setPersistenceDisabled(false);
    }
};

/**
 * Call an opt-out-flag write with the instance's opt-out flag and cookie config, overridden by the
 * call's options.
 * @param {function} func optIn, optOut or clearOptInOut
 * @param {Object} options
 */
OptOutFlagDecisions.prototype._writeFlag = function(func, options) {
    var getConfig = this.getConfig;
    options = _.extend({
        'track': this.track,
        'persistence_type': getConfig('opt_out_tracking_persistence_type'),
        'cookie_prefix': getConfig('opt_out_tracking_cookie_prefix'),
        'cookie_expiration': getConfig('cookie_expiration'),
        'cross_site_cookie': getConfig('cross_site_cookie'),
        'cross_subdomain_cookie': getConfig('cross_subdomain_cookie'),
        'cookie_domain': getConfig('cookie_domain'),
        'secure_cookie': getConfig('secure_cookie')
    }, options);

    // check if localStorage can be used for recording opt out status, fall back to cookie if not
    if (!_.localStorage.is_supported()) {
        options['persistence_type'] = 'cookie';
    }

    func(getConfig('token'), {
        track: options['track'],
        trackEventName: options['track_event_name'],
        trackProperties: options['track_properties'],
        persistenceType: options['persistence_type'],
        persistencePrefix: options['cookie_prefix'],
        cookieDomain: options['cookie_domain'],
        cookieExpiration: options['cookie_expiration'],
        crossSiteCookie: options['cross_site_cookie'],
        crossSubdomainCookie: options['cross_subdomain_cookie'],
        secureCookie: options['secure_cookie']
    });
};

/**
 * @param {Object} [options] persistence_type, cookie_prefix and ignore_dnt to read with
 * @returns {string}
 */
OptOutFlagDecisions.prototype._readDecision = function(options) {
    return readDecision(doNotTrackApplies(this.getConfig, options), this._readFlag(options));
};

/**
 * The opt-out flag, from the store that holds it unless options name one.
 * @param {Object} [options] persistence_type and cookie_prefix to read
 * @returns {string|null} '1', '0', or null when there's none
 */
OptOutFlagDecisions.prototype._readFlag = function(options) {
    options = _.extend({
        'cookie_prefix': this.getConfig('opt_out_tracking_cookie_prefix')
    }, options);

    var token = this.getConfig('token');
    var persistenceType = options['persistence_type'];
    if (!persistenceType) {
        persistenceType = getOptOutCheckPersistenceType(
            token, this.getConfig('opt_out_tracking_persistence_type'), options['cookie_prefix']
        );
    } else if (!_.localStorage.is_supported()) {
        persistenceType = 'cookie';
    }

    return readOptInOutFlag(token, {
        persistenceType: persistenceType,
        persistencePrefix: options['cookie_prefix']
    });
};

export { OptOutFlagDecisions };
