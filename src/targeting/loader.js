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
    window['__mp_targeting'] = new Promise(function (resolve, reject) {
        loadExtraBundle(targetingSrc, resolve);
    }).then(function () {
        var p = window['__mp_targeting'];
        if (p && typeof p.then === 'function') {
            return p;
        }
        throw new Error('targeting failed to load');
    }).catch(function (err) {
        delete window['__mp_targeting'];
        throw err;
    });

    return window['__mp_targeting'];
};

export {
    getTargetingPromise
};
