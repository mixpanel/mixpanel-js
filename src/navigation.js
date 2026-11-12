/* eslint camelcase: "off" */

import { EV_HASHCHANGE, EV_MP_LOCATION_CHANGE, EV_POPSTATE } from './utils';
import { window } from './window';

// Shared SPA location-change detector. Normalizes the four ways a single-page app
// can change the URL without a full reload — history.pushState, history.replaceState,
// popstate (back/forward), hashchange — into a single synthetic window event,
// EV_MP_LOCATION_CHANGE. Both autocapture (pageview / page-leave tracking) and
// visual experiments consume this event; keeping the detection here means the
// History API is patched exactly once regardless of how many features need it.

var inBrowser = function() {
    return typeof window !== 'undefined' && !!window['document'];
};

// Guard so the History API is patched and the popstate/hashchange listeners are
// added at most once per page, even if multiple features (and multiple Mixpanel
// instances) call ensureLocationChangeListeners.
var installed = false;

var dispatchLocationChange = function() {
    window.dispatchEvent(new Event(EV_MP_LOCATION_CHANGE));
};

/**
 * Idempotently install the SPA location-change detector. Patches
 * history.pushState / history.replaceState and listens for popstate / hashchange,
 * each dispatching a single EV_MP_LOCATION_CHANGE window event. Safe to call
 * repeatedly and safe outside a browser (no-op).
 */
function ensureLocationChangeListeners() {
    if (installed || !inBrowser()) {
        return;
    }
    installed = true;

    window.addEventListener(EV_POPSTATE, dispatchLocationChange);
    window.addEventListener(EV_HASHCHANGE, dispatchLocationChange);

    var history = window['history'];
    if (history) {
        var nativePushState = history.pushState;
        if (typeof nativePushState === 'function') {
            history.pushState = function(state, unused, url) {
                nativePushState.call(history, state, unused, url);
                dispatchLocationChange();
            };
        }
        var nativeReplaceState = history.replaceState;
        if (typeof nativeReplaceState === 'function') {
            history.replaceState = function(state, unused, url) {
                nativeReplaceState.call(history, state, unused, url);
                dispatchLocationChange();
            };
        }
    }
}

/**
 * Subscribe to SPA location changes. Ensures the detector is installed, then adds
 * the handler for EV_MP_LOCATION_CHANGE. Returns a teardown that removes it.
 * @param {Function} handler
 * @returns {Function} unsubscribe
 */
function onLocationChange(handler) {
    if (!inBrowser() || typeof handler !== 'function') {
        return function() {};
    }
    ensureLocationChangeListeners();
    window.addEventListener(EV_MP_LOCATION_CHANGE, handler);
    return function() {
        window.removeEventListener(EV_MP_LOCATION_CHANGE, handler);
    };
}

export { EV_MP_LOCATION_CHANGE, ensureLocationChangeListeners, onLocationChange };
