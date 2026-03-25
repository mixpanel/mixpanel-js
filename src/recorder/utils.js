import { _ } from '../utils';

/**
 * @param {import('./session-recording').SerializedRecording} serializedRecording
 * @returns {boolean}
 */
var isRecordingExpired = function(serializedRecording) {
    var now = Date.now();
    return !serializedRecording || now > serializedRecording['maxExpires'] || now > serializedRecording['idleExpires'];
};


var RECORD_ENQUEUE_THROTTLE_MS = 250;

var validateAllowedOrigins = function(origins, logger) {
    if (!_.isArray(origins)) {
        if (origins) {
            logger.critical('record_allowed_iframe_origins must be an array of origin strings, cross-origin recording will be disabled.');
        }
        return [];
    }
    var valid = [];
    for (var i = 0; i < origins.length; i++) {
        try {
            var origin = new URL(origins[i]).origin;
            if (origin === 'null') {
                logger.critical(origins[i] + ' has an opaque origin. Skipping this entry.');
                continue;
            }
            valid.push(origin);
        } catch (e) {
            logger.critical(origins[i] + ' is not a valid origin URL. Skipping this entry.');
        }
    }
    return valid;
};

export {
    isRecordingExpired,
    RECORD_ENQUEUE_THROTTLE_MS,
    validateAllowedOrigins
};
