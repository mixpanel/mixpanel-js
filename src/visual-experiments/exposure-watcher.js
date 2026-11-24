/* eslint camelcase: "off" */

import { console_with_prefix, safewrapClass } from '../utils'; // eslint-disable-line camelcase
import { window } from '../window';

var logger = console_with_prefix('visual-experiments');

var selectorPresent = function(selector) {
    try {
        return !!window['document'].querySelector(selector);
    } catch (err) {
        logger.error('Invalid exposure selector: ' + selector, err);
        return false;
    }
};

var anySelectorPresent = function(selectors) {
    for (var i = 0; i < selectors.length; i++) {
        if (selectorPresent(selectors[i])) {
            return true;
        }
    }
    return false;
};

/**
 * ExposureWatcher waits for a visual-experiment variant's $mp.exposureSelectors
 * to appear in the DOM, the same way the engine waits for the elements it
 * mutates. The caller checks presence on the untouched page with
 * anySelectorPresent() before the engine applies a set, and hands only the
 * variants still missing a selector to watch(). One watcher serves one applied
 * set; stop() discards everything still waiting.
 *
 * The watcher's MutationObserver callback runs in the microtask after a DOM
 * change, while the engine defers its writes to newly added elements to the
 * next animation frame. So a late-arriving element is checked before the
 * engine can change it, and a treatment that removes a selector's class or
 * attribute does not hide the element from the watcher.
 * @constructor
 */
var ExposureWatcher = function() {
    // [{selectors, onPresent}] still waiting for a selector to appear.
    this._pending = [];
    this._observer = null;
    this._stopped = false;
};

/**
 * Call onPresent once a later DOM change makes at least one of the selectors
 * present. Presence at the time of the call is not checked: the caller judged
 * that on the page before the engine changed it. Never runs after stop().
 * @param {Array<string>} selectors
 * @param {function()} onPresent
 */
ExposureWatcher.prototype.watch = function(selectors, onPresent) {
    if (this._stopped) {
        return;
    }
    this._pending.push({selectors: selectors, onPresent: onPresent});
    this._startObserver();
};

ExposureWatcher.prototype._startObserver = function() {
    var doc = window && window['document'];
    if (this._observer || !doc || !doc.documentElement || typeof window['MutationObserver'] !== 'function') {
        return;
    }
    var self = this;
    this._observer = new window['MutationObserver'](function() {
        self._checkPending();
    });
    // documentElement rather than body so the watch can start before <body> is
    // parsed. Attributes too, so a selector matched by a class or attribute set
    // on an existing element counts.
    this._observer.observe(doc.documentElement, {
        childList: true,
        subtree: true,
        attributes: true
    });
};

ExposureWatcher.prototype._checkPending = function() {
    var present = [];
    var stillPending = [];
    for (var i = 0; i < this._pending.length; i++) {
        var entry = this._pending[i];
        (anySelectorPresent(entry.selectors) ? present : stillPending).push(entry);
    }
    this._pending = stillPending;
    if (!stillPending.length) {
        this._disconnect();
    }
    // A callback (exposure tracking, and anything a before_track hook does) may
    // reset or re-apply, which stops this watcher; the remaining entries are stale.
    for (var j = 0; j < present.length && !this._stopped; j++) {
        try {
            present[j].onPresent();
        } catch (err) {
            logger.error('Exposure watcher callback failed', err);
        }
    }
};

ExposureWatcher.prototype._disconnect = function() {
    if (this._observer) {
        this._observer.disconnect();
        this._observer = null;
    }
};

/**
 * Stop watching and drop every pending callback. Idempotent.
 */
ExposureWatcher.prototype.stop = function() {
    this._stopped = true;
    this._pending = [];
    this._disconnect();
};

safewrapClass(ExposureWatcher);

export { anySelectorPresent, ExposureWatcher };
