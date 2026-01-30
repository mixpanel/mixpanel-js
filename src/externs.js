/**
 * @fileoverview Externs for Promise polyfill so that closure compiler does not try to rename methods.
 * https://developers.google.com/closure/compiler/docs/externs-and-exports
 * @externs
 */
var Promise = {};

Promise.resolve = function() {};
Promise.reject = function() {};
Promise.race = function() {};
Promise.all = function() {};

Promise.prototype.then = function() {};
Promise.prototype.catch = function() {};

/**
 * Targeting loader window globals
 * These are set by the targeting bundle and accessed by the main bundle
 * @type {Promise|undefined}
 */
window['__mp_targeting'];

/**
 * The loaded targeting library object
 * Set by the targeting bundle, read by the main bundle
 * @type {Object|undefined}
 */
window['__mp_targeting_lib'];

/**
 * Criteria object properties used for first-time event targeting
 * These properties are passed from the main bundle to the targeting bundle
 * and must not be renamed by Closure Compiler
 */
var TargetingCriteria = {};
/**
 * @type {string}
 */
TargetingCriteria.event_name;
/**
 * @type {Object|undefined}
 */
TargetingCriteria.property_filters;
