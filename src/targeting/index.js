import { window } from '../window';
import { eventMatchesCriteria } from './event-matcher';

// Create the targeting library object
var targetingLibrary = {};
targetingLibrary['eventMatchesCriteria'] = eventMatchesCriteria;

// Set temporary global for loader to read
// Loader will immediately delete this and store the promise instead
window['__mp_targeting_lib'] = targetingLibrary;

// If this is bundled (loader hasn't run yet), also set the promise
// so it's ready when loader is called
if (!window['__mp_targeting']) {
    window['__mp_targeting'] = Promise.resolve(targetingLibrary);
}
