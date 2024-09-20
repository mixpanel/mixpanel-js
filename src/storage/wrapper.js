/**
 * Storage abstraction layer to support sync/async browser storage mechanisms.
 * This file only exists for the jsdoc type definition.
 */

/**
 * @typedef {Object} StorageWrapper
 * @property {function():Promise<void>} init - Initializes the wrapper and invokes the callback with a boolean indicating success.
 * @property {function(string, string):Promise<void>} setItem - Sets an item in storage and invokes the callback with a boolean indicating success.
 * @property {function(string):Promise<string>} getItem - Retrieves an item from storage and invokes the callback with the item or null if an error occurs.
 * @property {function(string, string):Promise<void>} removeItem - Removes an item from storage and invokes the callback with a boolean indicating success.
 */

export { };
