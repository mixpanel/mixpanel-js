/**
 * @param {import('./session-recording').SerializedRecording} serializedRecording
 * @returns {boolean}
 */
var isRecordingExpired = function(serializedRecording) {
    var now = Date.now();
    return !serializedRecording || now > serializedRecording['maxExpires'] || now > serializedRecording['idleExpires'];
};

var RECORD_ENQUEUE_THROTTLE_MS = 250;

export { isRecordingExpired, RECORD_ENQUEUE_THROTTLE_MS};
