import { _, console_with_prefix, safewrapClass } from '../utils'; // eslint-disable-line camelcase
import { window } from '../window';

var fetch = window['fetch'];
var logger = console_with_prefix('flags');

/**
 * FeatureFlagManager: support for Mixpanel's feature flagging product
 * @constructor
 */
var FeatureFlagManager = function(initOptions) {
    this.getConfig = initOptions.get_config_func;
    this.getDistinctId = initOptions.get_distinct_id_func;
};

FeatureFlagManager.prototype.init = function() {
    if (!minApisSupported()) {
        logger.critical('Feature Flags unavailable: missing minimum required APIs');
        return;
    }

    this.flags = null;
    this.fetchFlags();
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
        'distinct_id': distinctId
    };
    this.fetchPromise = window['fetch'](this.getConfig('api_host') + '/' + this.getConfig('api_routes')['flags'] + '?' + new URLSearchParams(reqParams), {
        'method': 'GET',
        'headers': {
            'Authorization': 'Basic ' + btoa(this.getConfig('token') + ':'),
            'Content-Type': 'application/octet-stream'
        },
    }).then(function(response) {
        return response.json().then(function(responseBody) {
            var responseFlags = responseBody['flags'];
            if (!responseFlags) {
                throw new Error('No flags in API response');
            }
            var flags = {};
            _.each(responseFlags, function(data, key) {
                flags[key] = {
                    'key': data['variant_key'],
                    'data': data['variant_value']
                };
            });
            this.flags = flags;
        }.bind(this)).catch(function(error) {
            logger.error(error);
        });
    }.bind(this)).catch(function() {});
};

FeatureFlagManager.prototype.getFeature = function(featureName, fallback) {
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
    var feature = this.flags[featureName];
    if (!feature) {
        logger.log('No flag found: "' + featureName + '"');
        return fallback;
    }
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

FeatureFlagManager.prototype.isEnabled = function() {
    return !!this.getConfig('flags');
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

function minApisSupported() {
    return !!fetch;
}

safewrapClass(FeatureFlagManager);

FeatureFlagManager.prototype['are_features_ready'] = FeatureFlagManager.prototype['areFeaturesReady'] = FeatureFlagManager.prototype.areFeaturesReady;
FeatureFlagManager.prototype['get_feature'] = FeatureFlagManager.prototype['getFeature'] = FeatureFlagManager.prototype.getFeature;
FeatureFlagManager.prototype['get_feature_data'] = FeatureFlagManager.prototype['getFeatureData'] = FeatureFlagManager.prototype.getFeatureData;
FeatureFlagManager.prototype['get_feature_data_sync'] = FeatureFlagManager.prototype['getFeatureDataSync'] = FeatureFlagManager.prototype.getFeatureDataSync;
FeatureFlagManager.prototype['get_feature_sync'] = FeatureFlagManager.prototype['getFeatureSync'] = FeatureFlagManager.prototype.getFeatureSync;
FeatureFlagManager.prototype['is_feature_enabled'] = FeatureFlagManager.prototype['isFeatureEnabled'] = FeatureFlagManager.prototype.isFeatureEnabled;
FeatureFlagManager.prototype['is_feature_enabled_sync'] = FeatureFlagManager.prototype['isFeatureEnabledSync'] = FeatureFlagManager.prototype.isFeatureEnabledSync;

export { FeatureFlagManager };
