import { _, console_with_prefix } from '../utils'; // eslint-disable-line camelcase
import { IDBStorageWrapper } from '../storage/indexed-db';

var logger = console_with_prefix('flags');

var MIXPANEL_FLAGS_DB_NAME = 'mixpanelFlagsDb';
var FLAGS_STORE_NAME = 'mixpanelFlags';

// Keeping these two properties closeby, as adding additional stores to a DB in IndexedDB requires a version increment
var FLAGS_VERSION_DATA = { version: 1, storeNames: [FLAGS_STORE_NAME] };

var PERSISTED_VARIANTS_KEY_PREFIX = 'persisted_variants_for_';
var DEFAULT_TTL_MS = 24 * 60 * 60 * 1000;

var VariantLookupPolicy = Object.freeze({
    NETWORK_ONLY: 'networkOnly',
    NETWORK_FIRST: 'networkFirst',
    PERSISTENCE_UNTIL_NETWORK_SUCCESS: 'persistenceUntilNetworkSuccess'
});

var VALID_POLICIES = [
    VariantLookupPolicy.NETWORK_ONLY,
    VariantLookupPolicy.NETWORK_FIRST,
    VariantLookupPolicy.PERSISTENCE_UNTIL_NETWORK_SUCCESS
];

/**
 * Module for handling the storage and retrieval of persisted feature flag variants.
 */
var FeatureFlagPersistence = function(persistenceConfig, token, isGloballyDisabled) {
    this.idb = new IDBStorageWrapper(MIXPANEL_FLAGS_DB_NAME, FLAGS_STORE_NAME, FLAGS_VERSION_DATA);
    this.persistenceConfig = persistenceConfig;
    this.persistedVariantsKey = PERSISTED_VARIANTS_KEY_PREFIX + token;
    this.isGloballyDisabled = isGloballyDisabled || function() { return false; };
};

FeatureFlagPersistence.prototype.getPolicy = function() {
    if (this.isGloballyDisabled() || !this._isConfigValid()) {
        return VariantLookupPolicy.NETWORK_ONLY;
    }
    return this.persistenceConfig['variantLookupPolicy'];
};

FeatureFlagPersistence.prototype.getTtlMs = function() {
    if (!this._isConfigValid()) {
        return DEFAULT_TTL_MS;
    }
    var configuredTtl = this.persistenceConfig['persistenceTtlMs'];
    return (configuredTtl === undefined || configuredTtl === null) ? DEFAULT_TTL_MS : configuredTtl;
};

FeatureFlagPersistence.prototype._isConfigValid = function() {
    var config = this.persistenceConfig;
    if (!config) {
        return false;
    }

    if (VALID_POLICIES.indexOf(config['variantLookupPolicy']) === -1) {
        logger.error('Invalid variantLookupPolicy:', config['variantLookupPolicy']);
        return false;
    }

    if (config['persistenceTtlMs'] !== undefined &&
        config['persistenceTtlMs'] !== null &&
        config['persistenceTtlMs'] <= 0) {
        logger.error('If provided, persistenceTtlMs must be a positive number. Provided value:', config['persistenceTtlMs']);
        return false;
    }

    return true;
};

FeatureFlagPersistence.prototype.loadFlagsFromStorage = function(context) {
    var clearAndReturnNull = _.bind(function() {
        return this.clear().then(function() { return null; }).catch(function() { return null; });
    }, this);

    if (this.getPolicy() === VariantLookupPolicy.NETWORK_ONLY) {
        return clearAndReturnNull();
    }

    var ttlMs = this.getTtlMs();

    return this.idb.init().then(_.bind(function() {
        return this.idb.getItem(this.persistedVariantsKey);
    }, this)).then(_.bind(function(data) {
        if (!data) {
            logger.log('No persisted variants found in IndexedDB');
            return null;
        }

        if (ttlMs && Date.now() - data['persistedAt'] >= ttlMs) {
            logger.log('Persisted variants are expiring');
            return null;
        }

        if (!context || data['distinctId'] !== context['distinct_id']) {
            logger.log('Persisted variants found, but for a different distinct_id so clearing.');
            return clearAndReturnNull();
        }

        var persistedFlags = new Map();
        _.each(data['flagVariants'], function(variantData, key) {
            persistedFlags.set(key, {
                'key': variantData['variant_key'],
                'value': variantData['variant_value'],
                'experiment_id': variantData['experiment_id'],
                'is_experiment_active': variantData['is_experiment_active'],
                'is_qa_tester': variantData['is_qa_tester'],
                'variant_source': 'persistence',
                'persisted_at_in_ms': data['persistedAt'],
                'ttl_in_ms': ttlMs
            });
        });

        logger.log('Loaded', persistedFlags.size, 'variants from IndexedDB for distinct_id', data['distinctId']);

        return {
            flags: persistedFlags,
            pendingFirstTimeEvents: data['pendingFirstTimeEvents'] || {},
            persistedAtMs: data['persistedAt'],
            ttlMs: ttlMs
        };
    }, this)).catch(_.bind(function(error) {
        logger.error('Failed to load persisted variants from IndexedDB, so clearing', error);
        return clearAndReturnNull();
    }, this));
};

FeatureFlagPersistence.prototype.save = function(context, flagsMap, pendingFirstTimeEvents) {
    if (this.getPolicy() === VariantLookupPolicy.NETWORK_ONLY) {
        return Promise.resolve();
    }

    var flagVariants = {};
    flagsMap.forEach(function(variant, key) {
        flagVariants[key] = {
            'variant_key': variant['key'],
            'variant_value': variant['value'],
            'experiment_id': variant['experiment_id'],
            'is_experiment_active': variant['is_experiment_active'],
            'is_qa_tester': variant['is_qa_tester']
        };
    });

    var data = {
        'persistedAt': Date.now(),
        'distinctId': context && context['distinct_id'],
        'context': context,
        'flagVariants': flagVariants,
        'pendingFirstTimeEvents': pendingFirstTimeEvents || {}
    };

    return this.idb.init().then(_.bind(function() {
        return this.idb.setItem(this.persistedVariantsKey, data);
    }, this)).then(function() {
        logger.log('Saved', flagsMap.size, 'variants to IndexedDB for distinct_id', data['distinctId']);
    }).catch(function(error) {
        logger.error('Failed to persist variants to IndexedDB:', error);
    });
};

FeatureFlagPersistence.prototype.clear = function() {
    if (this.isGloballyDisabled()) {
        return Promise.resolve();
    }
    return this.idb.init().then(_.bind(function() {
        return this.idb.removeItem(this.persistedVariantsKey);
    }, this)).then(function() {
        logger.log('Cleared persisted variants from IndexedDB');
    }).catch(function(error) {
        logger.error('Failed to clear persisted variants from IndexedDB:', error);
    });
};

export { FeatureFlagPersistence, VariantLookupPolicy, FLAGS_STORE_NAME, PERSISTED_VARIANTS_KEY_PREFIX };
