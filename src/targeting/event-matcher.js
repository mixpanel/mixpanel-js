import { _ } from '../utils';
import jsonLogic from 'json-logic-js';

/**
 * Shared helper to recursively lowercase strings in nested structures
 * @param {*} obj - Value to process
 * @param {boolean} lowercaseKeys - Whether to lowercase object keys
 * @returns {*} Processed value with lowercased strings
 */
var lowercaseJson = function(obj, lowercaseKeys) {
    if (obj === null || obj === undefined) {
        return obj;
    } else if (typeof obj === 'string') {
        return obj.toLowerCase();
    } else if (Array.isArray(obj)) {
        return obj.map(function(item) {
            return lowercaseJson(item, lowercaseKeys);
        });
    } else if (obj === Object(obj)) {
        var result = {};
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                var newKey = lowercaseKeys && typeof key === 'string' ? key.toLowerCase() : key;
                result[newKey] = lowercaseJson(obj[key], lowercaseKeys);
            }
        }
        return result;
    } else {
        return obj;
    }
};

/**
 * Lowercase all string keys and values in a nested structure
 * @param {*} val - Value to process
 * @returns {*} Processed value with lowercased strings
 */
var lowercaseKeysAndValues = function(val) {
    return lowercaseJson(val, true);
};

/**
 * Lowercase only leaf node string values in a nested structure (keys unchanged)
 * @param {*} val - Value to process
 * @returns {*} Processed value with lowercased leaf strings
 */
var lowercaseOnlyLeafNodes = function(val) {
    return lowercaseJson(val, false);
};

/**
 * Check if an event matches the given criteria
 * @param {string} eventName - The name of the event being checked
 * @param {Object} properties - Event properties to evaluate against property filters
 * @param {Object} criteria - Criteria to match against, with:
 *   - event_name: string - Required event name (case-sensitive match)
 *   - property_filters: Object - Optional JsonLogic filters for properties
 * @returns {Object} Result object with:
 *   - matches: boolean - Whether the event matches the criteria
 *   - error: string|undefined - Error message if evaluation failed
 */
var eventMatchesCriteria = function(eventName, properties, criteria) {
    // Check exact event name match (case-sensitive)
    if (eventName !== criteria.event_name) {
        return { matches: false };
    }

    // Evaluate property filters using JsonLogic
    var propertyFilters = criteria.property_filters;
    var filtersMatch = true; // default to true if no filters

    if (propertyFilters && !_.isEmptyObject(propertyFilters)) {
        try {
            // Lowercase all keys and values in event properties for case-insensitive matching
            var lowercasedProperties = lowercaseKeysAndValues(properties || {});

            // Lowercase only leaf nodes in JsonLogic filters (keep operators intact)
            var lowercasedFilters = lowercaseOnlyLeafNodes(propertyFilters);

            // Prepare data for JsonLogic evaluation
            var data = {'properties': lowercasedProperties};
            filtersMatch = jsonLogic.apply(lowercasedFilters, data);
        } catch (error) {
            return {
                matches: false,
                error: error.toString()
            };
        }
    }

    return { matches: filtersMatch };
};

export {
    lowercaseJson,
    lowercaseKeysAndValues,
    lowercaseOnlyLeafNodes,
    eventMatchesCriteria
};
