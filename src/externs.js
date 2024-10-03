/**
 * @fileoverview Externs for Promise polyfill so that closure compiler does not try to rename methods.
 * https://developers.google.com/closure/compiler/docs/externs-and-exports
 * @externs
 */
var PromisePolyfill = {};

PromisePolyfill.resolve = function() {};
PromisePolyfill.reject = function() {};
PromisePolyfill.race = function() {};
PromisePolyfill.all = function() {};

PromisePolyfill.prototype.then = function() {};
PromisePolyfill.prototype.catch = function() {};
