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
