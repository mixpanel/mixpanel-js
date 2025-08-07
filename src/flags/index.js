import { _, console_with_prefix, safewrapClass } from '../utils'; // eslint-disable-line camelcase
import { window } from '../window';

var fetch = window['fetch'];
var logger = console_with_prefix('flags');

var FLAGS_CONFIG_KEY = 'flags';

var CONFIG_CONTEXT = 'context';
var CONFIG_DEFAULTS = {};
CONFIG_DEFAULTS[CONFIG_CONTEXT] = {};

/**
 * FeatureFlagManager: support for Mixpanel's feature flagging product
 * @constructor
 */
var FeatureFlagManager = function(initOptions) {
    this.getFullApiRoute = initOptions.getFullApiRoute;
    this.getMpConfig = initOptions.getConfigFunc;
    this.setMpConfig = initOptions.setConfigFunc;
    this.getMpProperty = initOptions.getPropertyFunc;
    this.track = initOptions.trackingFunc;
};

FeatureFlagManager.prototype.init = function() {
    if (!minApisSupported()) {
        logger.critical('Feature Flags unavailable: missing minimum required APIs');
        return;
    }

    this.flags = null;
    this.fetchFlags();

    this.trackedFeatures = new Set();
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
    logger.log('Fetching flags for distinct ID: ' + distinctId);
    var reqParams = {
        'context': _.extend({'distinct_id': distinctId, 'device_id': deviceId}, this.getConfig(CONFIG_CONTEXT))
    };
    this._fetchInProgressStartTime = Date.now();
    this.fetchPromise = window['fetch'](this.getFullApiRoute(), {
        'method': 'POST',
        'headers': {
            'Authorization': 'Basic ' + btoa(this.getMpConfig('token') + ':'),
            'Content-Type': 'application/octet-stream'
        },
        'body': JSON.stringify(reqParams)
    }).then(function(response) {
        this.markFetchComplete();
        return response.json().then(function(responseBody) {
            var responseFlags = responseBody['flags'];
            if (!responseFlags) {
                throw new Error('No flags in API response');
            }
            var flags = new Map();
            _.each(responseFlags, function(data, key) {
                flags.set(key, {
                    'key': data['variant_key'],
                    'value': data['variant_value']
                });
            });
            this.flags = flags;
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
    this.track('$experiment_started', {
        'Experiment name': featureName,
        'Variant name': feature['key'],
        '$experiment_type': 'feature_flag',
        'Variant fetch start time': new Date(this._fetchStartTime).toISOString(),
        'Variant fetch complete time': new Date(this._fetchCompleteTime).toISOString(),
        'Variant fetch latency (ms)': this._fetchLatency
    });
};

function minApisSupported() {
    return !!fetch &&
      typeof Promise !== 'undefined' &&
      typeof Map !== 'undefined' &&
      typeof Set !== 'undefined';
}

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

export { FeatureFlagManager };
