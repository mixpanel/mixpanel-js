import { _, console_with_prefix, generateTraceparent, safewrapClass } from '../utils'; // eslint-disable-line camelcase
import { window } from '../window';
import Config from '../config';
import {
    getTargetingPromise
} from '../targeting/loader';

var logger = console_with_prefix('flags');

var FLAGS_CONFIG_KEY = 'flags';

var CONFIG_CONTEXT = 'context';
var CONFIG_DEFAULTS = {};
CONFIG_DEFAULTS[CONFIG_CONTEXT] = {};

/**
 * Generate a unique key for a pending first-time event
 * @param {string} flagKey - The flag key
 * @param {string} firstTimeEventHash - The first_time_event_hash from the pending event definition
 * @returns {string} Composite key in format "flagKey:firstTimeEventHash"
 */
var getPendingEventKey = function(flagKey, firstTimeEventHash) {
    return flagKey + ':' + firstTimeEventHash;
};

/**
 * Extract the flag key from a pending event key
 * @param {string} eventKey - The composite event key in format "flagKey:firstTimeEventHash"
 * @returns {string} The flag key portion
 */
var getFlagKeyFromPendingEventKey = function(eventKey) {
    return eventKey.split(':')[0];
};

/**
 * FeatureFlagManager: support for Mixpanel's feature flagging product
 * @constructor
 */
var FeatureFlagManager = function(initOptions) {
    this.fetch = window['fetch'];
    this.getFullApiRoute = initOptions.getFullApiRoute;
    this.getMpConfig = initOptions.getConfigFunc;
    this.setMpConfig = initOptions.setConfigFunc;
    this.getMpProperty = initOptions.getPropertyFunc;
    this.track = initOptions.trackingFunc;
    this.loadExtraBundle = initOptions.loadExtraBundle || function() {};
};

FeatureFlagManager.prototype.init = function() {
    if (!this.minApisSupported()) {
        logger.critical('Feature Flags unavailable: missing minimum required APIs');
        return;
    }

    this.flags = null;
    this.fetchFlags();

    this.trackedFeatures = new Set();
    this.pendingFirstTimeEvents = {};
    this.activatedFirstTimeEvents = {};
};

FeatureFlagManager.prototype.getFullConfig = function() {
    var ffConfig = this.getMpConfig(FLAGS_CONFIG_KEY);
    if (!ffConfig) {
        // flags are completely off
        return {};
    } else if (_.isObject(ffConfig)) {
        return _.extend({}, CONFIG_DEFAULTS, ffConfig);
    } else {
        // config is non-object truthy value, return default
        return CONFIG_DEFAULTS;
    }
};

FeatureFlagManager.prototype.getConfig = function(key) {
    return this.getFullConfig()[key];
};

FeatureFlagManager.prototype.isSystemEnabled = function() {
    return !!this.getMpConfig(FLAGS_CONFIG_KEY);
};

FeatureFlagManager.prototype.updateContext = function(newContext, options) {
    if (!this.isSystemEnabled()) {
        logger.critical('Feature Flags not enabled, cannot update context');
        return Promise.resolve();
    }

    var ffConfig = this.getMpConfig(FLAGS_CONFIG_KEY);
    if (!_.isObject(ffConfig)) {
        ffConfig = {};
    }
    var oldContext = (options && options['replace']) ? {} : this.getConfig(CONFIG_CONTEXT);
    ffConfig[CONFIG_CONTEXT] = _.extend({}, oldContext, newContext);

    this.setMpConfig(FLAGS_CONFIG_KEY, ffConfig);
    return this.fetchFlags();
};

FeatureFlagManager.prototype.areFlagsReady = function() {
    if (!this.isSystemEnabled()) {
        logger.error('Feature Flags not enabled');
    }
    return !!this.flags;
};

FeatureFlagManager.prototype.fetchFlags = function() {
    if (!this.isSystemEnabled()) {
        return Promise.resolve();
    }

    var distinctId = this.getMpProperty('distinct_id');
    var deviceId = this.getMpProperty('$device_id');
    var traceparent = generateTraceparent();
    logger.log('Fetching flags for distinct ID: ' + distinctId);

    var context = _.extend({'distinct_id': distinctId, 'device_id': deviceId}, this.getConfig(CONFIG_CONTEXT));
    var searchParams = new URLSearchParams();
    searchParams.set('context', JSON.stringify(context));
    searchParams.set('token', this.getMpConfig('token'));
    searchParams.set('mp_lib', 'web');
    searchParams.set('$lib_version', Config.LIB_VERSION);
    var url = this.getFullApiRoute() + '?' + searchParams.toString();

    this._fetchInProgressStartTime = Date.now();
    this.fetchPromise = this.fetch.call(window, url, {
        'method': 'GET',
        'headers': {
            'Authorization': 'Basic ' + btoa(this.getMpConfig('token') + ':'),
            'traceparent': traceparent
        }
    }).then(function(response) {
        this.markFetchComplete();
        return response.json().then(function(responseBody) {
            var responseFlags = responseBody['flags'];
            if (!responseFlags) {
                throw new Error('No flags in API response');
            }
            var flags = new Map();
            var pendingFirstTimeEvents = {};

            // Process flags from response
            _.each(responseFlags, function(data, key) {
                // Check if this flag has any activated first-time events this session
                var hasActivatedEvent = false;
                var prefix = key + ':';
                _.each(this.activatedFirstTimeEvents, function(activated, eventKey) {
                    if (eventKey.startsWith(prefix)) {
                        hasActivatedEvent = true;
                    }
                });

                if (hasActivatedEvent) {
                    // Preserve the activated variant, don't overwrite with server's current variant
                    var currentFlag = this.flags && this.flags.get(key);
                    if (currentFlag) {
                        flags.set(key, currentFlag);
                    }
                } else {
                    // Use server's current variant
                    flags.set(key, {
                        'key': data['variant_key'],
                        'value': data['variant_value'],
                        'experiment_id': data['experiment_id'],
                        'is_experiment_active': data['is_experiment_active'],
                        'is_qa_tester': data['is_qa_tester']
                    });
                }
            }, this);

            // Process top-level pending_first_time_events array
            var topLevelDefinitions = responseBody['pending_first_time_events'];
            if (topLevelDefinitions && topLevelDefinitions.length > 0) {
                _.each(topLevelDefinitions, function(def) {
                    var flagKey = def['flag_key'];
                    var eventKey = getPendingEventKey(flagKey, def['first_time_event_hash']);

                    // Skip if this specific event has already been activated this session
                    if (this.activatedFirstTimeEvents[eventKey]) {
                        return;
                    }

                    // Store pending event definition using composite key
                    pendingFirstTimeEvents[eventKey] = {
                        'flag_key': flagKey,
                        'flag_id': def['flag_id'],
                        'project_id': def['project_id'],
                        'first_time_event_hash': def['first_time_event_hash'],
                        'event_name': def['event_name'],
                        'property_filters': def['property_filters'],
                        'pending_variant': def['pending_variant']
                    };
                }, this);
            }

            // Preserve any activated orphaned flags (flags that were activated but are no longer in response)
            if (this.activatedFirstTimeEvents) {
                _.each(this.activatedFirstTimeEvents, function(activated, eventKey) {
                    var flagKey = getFlagKeyFromPendingEventKey(eventKey);
                    if (activated && !flags.has(flagKey) && this.flags && this.flags.has(flagKey)) {
                        // Keep the activated flag even though it's not in the new response
                        flags.set(flagKey, this.flags.get(flagKey));
                    }
                }, this);
            }

            this.flags = flags;
            this.pendingFirstTimeEvents = pendingFirstTimeEvents;
            this._traceparent = traceparent;

            this._loadTargetingIfNeeded();
        }.bind(this)).catch(function(error) {
            this.markFetchComplete();
            logger.error(error);
        }.bind(this));
    }.bind(this)).catch(function(error) {
        this.markFetchComplete();
        logger.error(error);
    }.bind(this));

    return this.fetchPromise;
};

FeatureFlagManager.prototype.markFetchComplete = function() {
    if (!this._fetchInProgressStartTime) {
        logger.error('Fetch in progress started time not set, cannot mark fetch complete');
        return;
    }
    this._fetchStartTime = this._fetchInProgressStartTime;
    this._fetchCompleteTime = Date.now();
    this._fetchLatency = this._fetchCompleteTime - this._fetchStartTime;
    this._fetchInProgressStartTime = null;
};

/**
 * Proactively load targeting bundle if any pending events have property filters
 */
FeatureFlagManager.prototype._loadTargetingIfNeeded = function() {
    var hasPropertyFilters = false;
    _.each(this.pendingFirstTimeEvents, function(evt) {
        if (evt.property_filters && !_.isEmptyObject(evt.property_filters)) {
            hasPropertyFilters = true;
        }
    });

    if (hasPropertyFilters) {
        getTargetingPromise(
            this.loadExtraBundle.bind(this),
            this.getMpConfig('targeting_src')
        ).then(function() {
            logger.log('targeting loaded for property filter evaluation');
        }).catch(function(error) {
            logger.error('Failed to load targeting: ' + error);
        });
    }
};

/**
 * Get the targeting library (initializes if not already loaded)
 * This method is primarily for testing - production code should rely on automatic loading
 * @returns {Promise} Promise that resolves with targeting library
 */
FeatureFlagManager.prototype.getTargeting = function() {
    return getTargetingPromise(
        this.loadExtraBundle.bind(this),
        this.getMpConfig('targeting_src')
    );
};

/**
 * Check if a tracked event matches any pending first-time events and activate the corresponding flag variant
 * @param {string} eventName - The name of the event being tracked
 * @param {Object} properties - Event properties to evaluate against property filters
 *
 * When a match is found (event name matches and property filters pass), this method:
 * - Switches the flag to the pending variant
 * - Marks the event as activated for this session
 * - Records the activation via the API (fire-and-forget)
 */
FeatureFlagManager.prototype.checkFirstTimeEvents = function(eventName, properties) {
    if (!this.pendingFirstTimeEvents || _.isEmptyObject(this.pendingFirstTimeEvents)) {
        return;
    }

    // Check if targeting promise exists (either bundled or async loaded)
    if (window['__mp_targeting'] && typeof window['__mp_targeting'].then === 'function') {
        window['__mp_targeting'].then(function(library) {
            this._processFirstTimeEventCheck(eventName, properties, library);
        }.bind(this)).catch(function() {
            // If targeting failed to load, process with null
            // Events without property filters will still match
            this._processFirstTimeEventCheck(eventName, properties, null);
        }.bind(this));
    } else {
        // No targeting available, process with null
        // Events without property filters will still match
        this._processFirstTimeEventCheck(eventName, properties, null);
    }
};

/**
 * Internal method to process first-time event checks with loaded targeting library
 * @param {string} eventName - The name of the event being tracked
 * @param {Object} properties - Event properties to evaluate against property filters
 * @param {Object} targeting - The loaded targeting library
 */
FeatureFlagManager.prototype._processFirstTimeEventCheck = function(eventName, properties, targeting) {
    _.each(this.pendingFirstTimeEvents, function(pendingEvent, eventKey) {
        if (this.activatedFirstTimeEvents[eventKey]) {
            return;
        }

        var flagKey = pendingEvent['flag_key'];

        // Use targeting module to check if event matches
        var matchResult;

        // If no targeting library and event has property filters, skip it
        if (!targeting && pendingEvent['property_filters'] && !_.isEmptyObject(pendingEvent['property_filters'])) {
            logger.warn('Skipping event check for "' + flagKey + '" - property filters require targeting library');
            return;
        }

        // For simple events (no property filters), just check event name
        if (!targeting) {
            matchResult = {
                matches: eventName === pendingEvent['event_name'],
                error: null
            };
        } else {
            var criteria = {
                'event_name': pendingEvent['event_name'],
                'property_filters': pendingEvent['property_filters']
            };
            matchResult = targeting['eventMatchesCriteria'](
                eventName,
                properties,
                criteria
            );
        }

        if (matchResult.error) {
            logger.error('Error checking first-time event for flag "' + flagKey + '": ' + matchResult.error);
            return;
        }

        if (!matchResult.matches) {
            return;
        }

        logger.log('First-time event matched for flag "' + flagKey + '": ' + eventName);

        var newVariant = {
            'key': pendingEvent['pending_variant']['variant_key'],
            'value': pendingEvent['pending_variant']['variant_value'],
            'experiment_id': pendingEvent['pending_variant']['experiment_id'],
            'is_experiment_active': pendingEvent['pending_variant']['is_experiment_active']
        };

        this.flags.set(flagKey, newVariant);
        this.activatedFirstTimeEvents[eventKey] = true;

        this.recordFirstTimeEvent(
            pendingEvent['flag_id'],
            pendingEvent['project_id'],
            pendingEvent['first_time_event_hash']
        );
    }, this);
};

FeatureFlagManager.prototype.getFirstTimeEventApiRoute = function(flagId) {
    // Construct URL: {api_host}/flags/{flagId}/first-time-events
    return this.getFullApiRoute() + '/' + flagId + '/first-time-events';
};

FeatureFlagManager.prototype.recordFirstTimeEvent = function(flagId, projectId, firstTimeEventHash) {
    var distinctId = this.getMpProperty('distinct_id');
    var traceparent = generateTraceparent();

    // Build URL with query string parameters
    var searchParams = new URLSearchParams();
    searchParams.set('mp_lib', 'web');
    searchParams.set('$lib_version', Config.LIB_VERSION);
    var url = this.getFirstTimeEventApiRoute(flagId) + '?' + searchParams.toString();

    var payload = {
        'distinct_id': distinctId,
        'project_id': projectId,
        'first_time_event_hash': firstTimeEventHash
    };

    logger.log('Recording first-time event for flag: ' + flagId);

    // Fire-and-forget POST request
    this.fetch.call(window, url, {
        'method': 'POST',
        'headers': {
            'Content-Type': 'application/json',
            'Authorization': 'Basic ' + btoa(this.getMpConfig('token') + ':'),
            'traceparent': traceparent
        },
        'body': JSON.stringify(payload)
    }).catch(function(error) {
        // Silent failure - cohort sync will catch up
        logger.error('Failed to record first-time event for flag ' + flagId + ': ' + error);
    });
};

FeatureFlagManager.prototype.getVariant = function(featureName, fallback) {
    if (!this.fetchPromise) {
        return new Promise(function(resolve) {
            logger.critical('Feature Flags not initialized');
            resolve(fallback);
        });
    }

    return this.fetchPromise.then(function() {
        return this.getVariantSync(featureName, fallback);
    }.bind(this)).catch(function(error) {
        logger.error(error);
        return fallback;
    });
};

FeatureFlagManager.prototype.getVariantSync = function(featureName, fallback) {
    if (!this.areFlagsReady()) {
        logger.log('Flags not loaded yet');
        return fallback;
    }
    var feature = this.flags.get(featureName);
    if (!feature) {
        logger.log('No flag found: "' + featureName + '"');
        return fallback;
    }
    this.trackFeatureCheck(featureName, feature);
    return feature;
};

FeatureFlagManager.prototype.getVariantValue = function(featureName, fallbackValue) {
    return this.getVariant(featureName, {'value': fallbackValue}).then(function(feature) {
        return feature['value'];
    }).catch(function(error) {
        logger.error(error);
        return fallbackValue;
    });
};

// TODO remove deprecated method
FeatureFlagManager.prototype.getFeatureData = function(featureName, fallbackValue) {
    logger.critical('mixpanel.flags.get_feature_data() is deprecated and will be removed in a future release. Use mixpanel.flags.get_variant_value() instead.');
    return this.getVariantValue(featureName, fallbackValue);
};

FeatureFlagManager.prototype.getVariantValueSync = function(featureName, fallbackValue) {
    return this.getVariantSync(featureName, {'value': fallbackValue})['value'];
};

FeatureFlagManager.prototype.isEnabled = function(featureName, fallbackValue) {
    return this.getVariantValue(featureName).then(function() {
        return this.isEnabledSync(featureName, fallbackValue);
    }.bind(this)).catch(function(error) {
        logger.error(error);
        return fallbackValue;
    });
};

FeatureFlagManager.prototype.isEnabledSync = function(featureName, fallbackValue) {
    fallbackValue = fallbackValue || false;
    var val = this.getVariantValueSync(featureName, fallbackValue);
    if (val !== true && val !== false) {
        logger.error('Feature flag "' + featureName + '" value: ' + val + ' is not a boolean; returning fallback value: ' + fallbackValue);
        val = fallbackValue;
    }
    return val;
};

FeatureFlagManager.prototype.trackFeatureCheck = function(featureName, feature) {
    if (this.trackedFeatures.has(featureName)) {
        return;
    }
    this.trackedFeatures.add(featureName);

    var trackingProperties = {
        'Experiment name': featureName,
        'Variant name': feature['key'],
        '$experiment_type': 'feature_flag',
        'Variant fetch start time': new Date(this._fetchStartTime).toISOString(),
        'Variant fetch complete time': new Date(this._fetchCompleteTime).toISOString(),
        'Variant fetch latency (ms)': this._fetchLatency,
        'Variant fetch traceparent': this._traceparent,
    };

    if (feature['experiment_id'] !== 'undefined') {
        trackingProperties['$experiment_id'] = feature['experiment_id'];
    }
    if (feature['is_experiment_active'] !== 'undefined') {
        trackingProperties['$is_experiment_active'] = feature['is_experiment_active'];
    }
    if (feature['is_qa_tester'] !== 'undefined') {
        trackingProperties['$is_qa_tester'] = feature['is_qa_tester'];
    }

    this.track('$experiment_started', trackingProperties);
};

FeatureFlagManager.prototype.minApisSupported = function() {
    return !!this.fetch &&
      typeof Promise !== 'undefined' &&
      typeof Map !== 'undefined' &&
      typeof Set !== 'undefined';
};

safewrapClass(FeatureFlagManager);

FeatureFlagManager.prototype['are_flags_ready'] = FeatureFlagManager.prototype.areFlagsReady;
FeatureFlagManager.prototype['get_variant'] = FeatureFlagManager.prototype.getVariant;
FeatureFlagManager.prototype['get_variant_sync'] = FeatureFlagManager.prototype.getVariantSync;
FeatureFlagManager.prototype['get_variant_value'] = FeatureFlagManager.prototype.getVariantValue;
FeatureFlagManager.prototype['get_variant_value_sync'] = FeatureFlagManager.prototype.getVariantValueSync;
FeatureFlagManager.prototype['is_enabled'] = FeatureFlagManager.prototype.isEnabled;
FeatureFlagManager.prototype['is_enabled_sync'] = FeatureFlagManager.prototype.isEnabledSync;
FeatureFlagManager.prototype['update_context'] = FeatureFlagManager.prototype.updateContext;

// Deprecated method
FeatureFlagManager.prototype['get_feature_data'] = FeatureFlagManager.prototype.getFeatureData;

// Exports intended only for testing
FeatureFlagManager.prototype['getTargeting'] = FeatureFlagManager.prototype.getTargeting;

export { FeatureFlagManager };
