import { console_with_prefix, safewrapClass } from '../utils'; // eslint-disable-line camelcase
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
  return !!this.flags;
};

FeatureFlagManager.prototype.fetchFlags = function() {
  if (!this.getConfig('flags')) {
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
      var flags = responseBody['flags'];
      if (!flags) {
        throw new Error('No flags in API response');
      }
      this.flags = flags;
    }.bind(this)).catch(function(error) {
      logger.error(error);
    });
  }.bind(this)).catch(function(error) {});
};

FeatureFlagManager.prototype.getFeature = function(featureName) {
  return this.fetchPromise.then(function() {
    return this.flags[featureName];
  }.bind(this)).catch(function(error) {
    logger.error(error);
  });
};

FeatureFlagManager.prototype.getFeatureData = function(featureName) {
  return this.getFeature(featureName).then(function(flag) {
    return flag['data'];
  }.bind(this)).catch(function(error) {
    logger.error(error);
  });
};

FeatureFlagManager.prototype.getFeatureDataSync = function(featureName) {
  if (!this.areFeaturesReady()) {
    logger.log('Flags not loaded yet');
    return null;
  }
  return this.flags[featureName]['data'];
};

function minApisSupported() {
  return !!fetch;
}

safewrapClass(FeatureFlagManager);

FeatureFlagManager.prototype['are_features_ready'] = FeatureFlagManager.prototype['areFeaturesReady'] = FeatureFlagManager.prototype.areFeaturesReady;
FeatureFlagManager.prototype['get_feature_data'] = FeatureFlagManager.prototype['getFeatureData'] = FeatureFlagManager.prototype.getFeatureData;
FeatureFlagManager.prototype['get_feature_data_sync'] = FeatureFlagManager.prototype['getFeatureDataSync'] = FeatureFlagManager.prototype.getFeatureDataSync;

export { FeatureFlagManager };
