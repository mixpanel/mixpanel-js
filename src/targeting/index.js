import { window } from '../window';
import { eventMatchesCriteria } from './event-matcher';

// Create targeting library object
var targetingLibrary = {};
targetingLibrary['eventMatchesCriteria'] = eventMatchesCriteria;

// Set global Promise (use bracket notation to prevent minification)
// This is the ONE AND ONLY global - matches recorder pattern
window['__mp_targeting'] = Promise.resolve(targetingLibrary);
