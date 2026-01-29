import { window } from '../window';
import { eventMatchesCriteria } from './event-matcher';

// Create the targeting library object
var targetingLibrary = {
    eventMatchesCriteria: eventMatchesCriteria
};

// Export to global for consistency with async loading
window['__mp_targeting_lib'] = targetingLibrary;

// Export as resolved promise for consistent promise-based API
window['__mp_targeting'] = Promise.resolve(targetingLibrary);
