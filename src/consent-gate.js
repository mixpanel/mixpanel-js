/**
 * What the services ask before they store or send on their own. A ConsentManager is one; a new
 * storage write or network send must ask it too.
 * @typedef {Object} ConsentGate
 * @property {function(): boolean} allowsApiCalls whether the public tracking, people, group and
 * replay methods run
 * @property {function(): boolean} allowsSending whether tracking requests go out
 * @property {function(): boolean} allowsFetching whether feature flags and remote settings are
 * fetched
 * @property {function(): boolean} allowsStoring whether consent allows storing data about the
 * visitor; identify() and alias() ask this, since disable_persistence doesn't stop them
 * @property {function(): boolean} allowsPersistence whether the services may write to browser
 * storage: consent allows storing, and disable_persistence is off. Without it they keep their data
 * in memory.
 * @property {function(): boolean} allowsExemptMeasurement whether 'exempt' events go out and remote
 * settings are fetched before consent
 */

import { console } from './utils';

/**
 * @param {function(string): boolean} allowsFunc whether consent allows 'api_calls', 'send',
 * 'fetch', 'store' or 'exempt_measurement' now
 * @param {function(string): *} getConfigFunc
 * @returns {ConsentGate}
 */
function buildConsentGate(allowsFunc, getConfigFunc) {
    var gate = {
        // if asking throws, the call runs
        allowsApiCalls: function() {
            try {
                return allowsFunc('api_calls');
            } catch (err) {
                console.error('Unexpected error when checking tracking opt-out status: ' + err);
                return true;
            }
        },
        allowsSending: function() {
            return allowsFunc('send');
        },
        allowsFetching: function() {
            return allowsFunc('fetch');
        },
        allowsStoring: function() {
            return allowsFunc('store');
        },
        allowsPersistence: function() {
            return gate.allowsStoring() && !getConfigFunc('disable_persistence');
        },
        allowsExemptMeasurement: function() {
            return allowsFunc('exempt_measurement');
        }
    };
    return gate;
}

/**
 * The consent gate the recorder bundle builds when it starts, and hands to its services. The core
 * passes the bundle only its instance, so this asks the core's _consent_allows by its quoted name,
 * the bundle being built separately. A core without it only knows the opt-out, through
 * has_opted_out_tracking(), and has no exempt mode.
 * @param {Object} mixpanelInstance
 * @returns {ConsentGate}
 */
function consentGateFor(mixpanelInstance) {
    return buildConsentGate(
        function(capability) {
            var consentAllows = mixpanelInstance['_consent_allows'];
            if (typeof consentAllows === 'function') {
                return !!consentAllows.call(mixpanelInstance, capability);
            }
            if (capability === 'exempt_measurement') {
                return false;
            }
            return capability !== 'api_calls' || !mixpanelInstance.has_opted_out_tracking();
        },
        function(key) {
            return mixpanelInstance.get_config(key);
        }
    );
}

export { buildConsentGate, consentGateFor };
