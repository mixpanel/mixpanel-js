var MIXPANEL_BROWSER_DB_NAME = 'mixpanelBrowserDb';
var RECORDING_EVENTS_STORE_NAME = 'mixpanelRecordingEvents';
var RECORDING_REGISTRY_STORE_NAME = 'mixpanelRecordingRegistry';

// Keeping these two properties closeby, as adding additional stores to a DB in IndexedDB requires a version increment
var RECORDER_VERSION_DATA = {
    version: 1,
    storeNames: [RECORDING_EVENTS_STORE_NAME, RECORDING_REGISTRY_STORE_NAME]
};

export {
    MIXPANEL_BROWSER_DB_NAME,
    RECORDING_EVENTS_STORE_NAME,
    RECORDING_REGISTRY_STORE_NAME,
    RECORDER_VERSION_DATA
};
