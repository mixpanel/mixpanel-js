import { window } from '../window';
import { TARGETING_GLOBAL_NAME } from '../globals';

/**
 * Get the promise-based targeting loader
 * @param {Function} loadExtraBundle - Function to load external bundle (callback-based)
 * @param {string} targetingSrc - URL to targeting bundle
 * @returns {Promise} Promise that resolves with targeting library
 */
var getTargetingPromise = function(loadExtraBundle, targetingSrc) {
    // Return existing promise if already initialized or loading
    if (window[TARGETING_GLOBAL_NAME] && typeof window[TARGETING_GLOBAL_NAME].then === 'function') {
        return window[TARGETING_GLOBAL_NAME];
    }

    // Create loading promise and set it as the global immediately
    // This makes minified build behavior consistent with dev/CJS builds
    window[TARGETING_GLOBAL_NAME] = new Promise(function (resolve) {
        loadExtraBundle(targetingSrc, resolve);
    }).then(function () {
        var p = window[TARGETING_GLOBAL_NAME];
        if (p && typeof p.then === 'function') {
            return p;
        }
        throw new Error('targeting failed to load');
    }).catch(function (err) {
        delete window[TARGETING_GLOBAL_NAME];
        throw err;
    });

    return window[TARGETING_GLOBAL_NAME];
};

export {
    getTargetingPromise
};
