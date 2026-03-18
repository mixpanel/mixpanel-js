import { _ } from '../utils';
import jsonLogic from 'json-logic-js';

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
            // Use properties as-is for case-sensitive matching
            filtersMatch = jsonLogic.apply(propertyFilters, properties || {});
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
    eventMatchesCriteria
};
