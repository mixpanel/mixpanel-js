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
    this.getMpConfig = initOptions.getConfigFunc;
    this.getDistinctId = initOptions.getDistinctIdFunc;
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

FeatureFlagManager.prototype.isEnabled = function() {
    return !!this.getMpConfig(FLAGS_CONFIG_KEY);
};

FeatureFlagManager.prototype.areFeaturesReady = function() {
    if (!this.isEnabled()) {
        logger.error('Feature Flags not enabled');
    }
    return !!this.flags;
};

FeatureFlagManager.prototype.fetchFlags = function() {
    if (!this.isEnabled()) {
        return;
    }

    var distinctId = this.getDistinctId();
    logger.log('Fetching flags for distinct ID: ' + distinctId);
    var reqParams = {
        'context': _.extend({'distinct_id': distinctId}, this.getConfig(CONFIG_CONTEXT))
    };
    this.fetchPromise = window['fetch'](this.getMpConfig('api_host') + '/' + this.getMpConfig('api_routes')['flags'], {
        'method': 'POST',
        'headers': {
            'Authorization': 'Basic ' + btoa(this.getMpConfig('token') + ':'),
            'Content-Type': 'application/octet-stream'
        },
        'body': JSON.stringify(reqParams)
    }).then(function(response) {
        return response.json().then(function(responseBody) {
            var responseFlags = responseBody['flags'];
            if (!responseFlags) {
                throw new Error('No flags in API response');
            }
            var flags = new Map();
            _.each(responseFlags, function(data, key) {
                flags.set(key, {
                    'key': data['variant_key'],
                    'data': data['variant_value']
                });
            });
            this.flags = flags;
        }.bind(this)).catch(function(error) {
            logger.error(error);
        });
    }.bind(this)).catch(function() {});
};

FeatureFlagManager.prototype.getFeature = function(featureName, fallback) {
    if (!this.fetchPromise) {
        return new Promise(function(resolve) {
            logger.critical('Feature Flags not initialized');
            resolve(fallback);
        });
    }

    return this.fetchPromise.then(function() {
        return this.getFeatureSync(featureName, fallback);
    }.bind(this)).catch(function(error) {
        logger.error(error);
        return fallback;
    });
};

FeatureFlagManager.prototype.getFeatureSync = function(featureName, fallback) {
    if (!this.areFeaturesReady()) {
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

FeatureFlagManager.prototype.getFeatureData = function(featureName, fallbackValue) {
    return this.getFeature(featureName, {'data': fallbackValue}).then(function(feature) {
        return feature['data'];
    }).catch(function(error) {
        logger.error(error);
        return fallbackValue;
    });
};

FeatureFlagManager.prototype.getFeatureDataSync = function(featureName, fallbackValue) {
    return this.getFeatureSync(featureName, {'data': fallbackValue})['data'];
};

FeatureFlagManager.prototype.isFeatureEnabled = function(featureName, fallbackValue) {
    return this.getFeatureData(featureName).then(function() {
        return this.isFeatureEnabledSync(featureName, fallbackValue);
    }.bind(this)).catch(function(error) {
        logger.error(error);
        return fallbackValue;
    });
};

FeatureFlagManager.prototype.isFeatureEnabledSync = function(featureName, fallbackValue) {
    fallbackValue = fallbackValue || false;
    var val = this.getFeatureDataSync(featureName, fallbackValue);
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
        '$experiment_type': 'feature_flag'
    });
};

function minApisSupported() {
    return !!fetch &&
      typeof Promise !== 'undefined' &&
      typeof Map !== 'undefined' &&
      typeof Set !== 'undefined';
}

safewrapClass(FeatureFlagManager);

FeatureFlagManager.prototype['are_features_ready'] = FeatureFlagManager.prototype.areFeaturesReady;
FeatureFlagManager.prototype['get_feature'] = FeatureFlagManager.prototype.getFeature;
FeatureFlagManager.prototype['get_feature_data'] = FeatureFlagManager.prototype.getFeatureData;
FeatureFlagManager.prototype['get_feature_data_sync'] = FeatureFlagManager.prototype.getFeatureDataSync;
FeatureFlagManager.prototype['get_feature_sync'] = FeatureFlagManager.prototype.getFeatureSync;
FeatureFlagManager.prototype['is_feature_enabled'] = FeatureFlagManager.prototype.isFeatureEnabled;
FeatureFlagManager.prototype['is_feature_enabled_sync'] = FeatureFlagManager.prototype.isFeatureEnabledSync;

export { FeatureFlagManager };
