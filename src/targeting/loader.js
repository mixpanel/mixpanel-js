import { window } from '../window';

/**
 * Get the promise-based targeting loader
 * @param {Function} loadExtraBundle - Function to load external bundle (callback-based)
 * @param {string} targetingSrc - URL to targeting bundle
 * @returns {Promise} Promise that resolves with targeting library
 */
var getTargetingPromise = function(loadExtraBundle, targetingSrc) {
    // Return existing promise if already initialized or loading
    if (window['__mp_targeting'] && typeof window['__mp_targeting'].then === 'function') {
        return window['__mp_targeting'];
    }

    // Create loading promise and set it as the global immediately
    // This makes minified build behavior consistent with dev/CJS builds
    window['__mp_targeting'] = new Promise(function(resolve, reject) {
        loadExtraBundle(targetingSrc, function() {
            // Bundle has executed and set window['__mp_targeting']
            var targetingPromise = window['__mp_targeting'];
            if (targetingPromise && typeof targetingPromise.then === 'function') {
                // Chain to the Promise set by the bundle
                targetingPromise.then(function(lib) {
                    resolve(lib);
                }, function(err) {
                    delete window['__mp_targeting']; // Clear global on error to allow retry
                    reject(err);
                });
            } else {
                delete window['__mp_targeting']; // Clear global on error to allow retry
                reject(new Error('targeting failed to load'));
            }
        });
    });

    return window['__mp_targeting'];
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
