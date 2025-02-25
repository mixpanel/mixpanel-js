/**
 * Storage abstraction layer to support sync/async browser storage mechanisms.
 * This file only exists for the jsdoc type definition.
 */

/**
 * @typedef {Object} StorageWrapper
 * @property {function():Promise<void>} init - Initializes the wrapper, async storage like IDB needs to create a table and upgrade if needed.
 * @property {function(string, any):Promise<void>} setItem - Sets an item in storage.
 * @property {function(string):Promise<any>} getItem - Retrieves an item from storage.
 * @property {function(string):Promise<void>} removeItem - Removes an item from storage.
 */

export { };
