import { window } from '../window';

// Internal reference to loaded library (for sync access)
var targetingLibrary = null;

/**
 * Initialize the promise-based targeting loader
 * @param {Function} loadExtraBundle - Function to load external bundle (callback-based)
 * @param {string} targetingSrc - URL to targeting bundle
 * @returns {Promise} Promise that resolves with targeting library
 */
var initTargetingPromise = function(loadExtraBundle, targetingSrc) {
    // Return existing promise if already initialized
    if (window['__mp_targeting'] && typeof window['__mp_targeting'].then === 'function') {
        return window['__mp_targeting'];
    }

    // If window global is undefined/null, clear the cache (for test cleanup)
    if (!window['__mp_targeting']) {
        targetingLibrary = null;
    }

    // Create promise and store atomically to prevent race conditions
    var promise;
    window['__mp_targeting'] = promise = new Promise(function(resolve, reject) {
        loadExtraBundle(targetingSrc, function() {
            // Callback fires after bundle loads
            var library = window['__mp_targeting_lib'];
            if (library) {
                targetingLibrary = library; // Store for sync access
                resolve(library);
            } else {
                reject(new Error('targeting failed to load'));
            }
        });
    });

    return promise;
};

/**
 * Get the targeting library as a promise
 * @returns {Promise} Promise that resolves with targeting library
 */
var getTargeting = function() {
    // Check if it's a promise
    if (window['__mp_targeting'] && typeof window['__mp_targeting'].then === 'function') {
        return window['__mp_targeting'];
    }

    // If library already loaded in our internal cache, wrap in resolved promise
    if (targetingLibrary) {
        return Promise.resolve(targetingLibrary);
    }

    // Not initialized yet - return rejected promise
    return Promise.reject(new Error('targeting not initialized'));
};

/**
 * Reset targeting loader state (for testing)
 * Clears the cached promise and internal library reference.
 * Note: Does NOT delete window['__mp_targeting_lib'] as the script has already
 * loaded and won't re-execute. Deleting it would prevent reinitialization.
 */
var resetTargeting = function() {
    targetingLibrary = null;
    if (window['__mp_targeting']) {
        delete window['__mp_targeting'];
    }
    // Do NOT delete window['__mp_targeting_lib'] - script won't reload
};

export {
    initTargetingPromise,
    getTargeting,
    resetTargeting
};
