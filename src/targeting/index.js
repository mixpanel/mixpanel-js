import { window } from '../window';
import { TARGETING_GLOBAL_NAME } from '../globals';
import { eventMatchesCriteria } from './event-matcher';

// Create targeting library object
var targetingLibrary = {};
targetingLibrary['eventMatchesCriteria'] = eventMatchesCriteria;

// Set global Promise (use bracket notation to prevent minification)
// This is the ONE AND ONLY global - matches recorder pattern
window[TARGETING_GLOBAL_NAME] = Promise.resolve(targetingLibrary);
