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

    // Check if library already loaded (bundled scenario)
    if (window['__mp_targeting_lib']) {
        var library = window['__mp_targeting_lib'];
        delete window['__mp_targeting_lib']; // Clean up immediately
        window['__mp_targeting'] = Promise.resolve(library);
        return window['__mp_targeting'];
    }

    // Async loading: create promise and load script
    var promise = new Promise(function(resolve, reject) {
        loadExtraBundle(targetingSrc, function() {
            // Read library from temporary global set by bundle
            var library = window['__mp_targeting_lib'];
            if (library) {
                delete window['__mp_targeting_lib']; // Clean up immediately
                resolve(library);
            } else {
                reject(new Error('targeting failed to load'));
            }
        });
    });

    window['__mp_targeting'] = promise;
    return promise;
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

    // Clear library global (should already be deleted by loader, but just in case)
    if (window['__mp_targeting_lib']) {
        delete window['__mp_targeting_lib'];
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
