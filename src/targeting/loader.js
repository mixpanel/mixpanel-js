import { window } from '../window';

/**
 * Get the promise-based targeting loader
 * @param {Function} loadExtraBundle - Function to load external bundle (callback-based)
 * @param {string} targetingSrc - URL to targeting bundle
 * @returns {Promise} Promise that resolves with targeting library
 */
var getTargetingPromise = function(loadExtraBundle, targetingSrc) {
    // Return existing promise if already initialized
    if (window['__mp_targeting'] && typeof window['__mp_targeting'].then === 'function') {
        return window['__mp_targeting'];
    }

    // Async loading: load script which will set window['__mp_targeting']
    return new Promise(function(resolve, reject) {
        loadExtraBundle(targetingSrc, function() {
            // Bundle has executed and set window['__mp_targeting']
            var targetingPromise = window['__mp_targeting'];
            if (targetingPromise && typeof targetingPromise.then === 'function') {
                // Chain to the Promise set by the bundle
                targetingPromise.then(resolve, reject);
            } else {
                reject(new Error('targeting failed to load'));
            }
        });
    });
};

/**
 * Reset targeting loader state (for testing)
 * Clears all cached state and removes script tags to allow re-initialization.
 */
var resetTargeting = function() {
    // Clear promise global
    if (window['__mp_targeting']) {
        delete window['__mp_targeting'];
    }

    // Remove script tags so they can be re-added and re-executed
    var scripts = document.querySelectorAll('script[src*="mixpanel-targeting"]');
    for (var i = 0; i < scripts.length; i++) {
        scripts[i].remove();
    }
};

export {
    getTargetingPromise,
    resetTargeting
};
