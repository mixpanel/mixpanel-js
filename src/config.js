export var Config = {
    DEBUG: false,
    LIB_VERSION: '2.84.0'
};

// Window global names for async modules
export var TARGETING_GLOBAL_NAME = '__mp_targeting';
export var RECORDER_GLOBAL_NAME = '__mp_recorder';

// Constants that are injected at build-time for the names of async modules.
// When the SDK is bundled straight from src/ (e.g. by importing
// src/loaders/loader-module-with-async-modules.js), nothing replaces these
// placeholders, so fall back to the unhashed bundles on the CDN instead of
// requesting a file named after the placeholder.
export var RECORDER_FILENAME = injectedOr('__MP_RECORDER_FILENAME__', 'mixpanel-recorder.min.js');
export var TARGETING_FILENAME = injectedOr('__MP_TARGETING_FILENAME__', 'mixpanel-targeting.min.js');

function injectedOr(filename, fallback) {
    return filename.indexOf('__MP_') === 0 ? fallback : filename;
}
