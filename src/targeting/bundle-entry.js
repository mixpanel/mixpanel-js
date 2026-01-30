// Entry point for targeting bundle - exports to window global for async loading
import { eventMatchesCriteria } from './event-matcher';
import { window } from '../window';

// Store library in temp location for callback to access
// Use bracket notation to prevent minification of property name
var targetingLibrary = {};
targetingLibrary['eventMatchesCriteria'] = eventMatchesCriteria;
window['__mp_targeting_lib'] = targetingLibrary;
