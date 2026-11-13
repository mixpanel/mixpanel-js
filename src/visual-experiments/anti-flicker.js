/* eslint camelcase: "off" */

import { console_with_prefix, safewrapClass } from '../utils'; // eslint-disable-line camelcase
import { window } from '../window';

var logger = console_with_prefix('visual-experiments');

// Injected once to hide the page while a visual-experiment variant loads. Hiding
// <html> (rather than <body>) works even when the snippet runs before the body
// is parsed, and opacity preserves layout so the reveal is a clean fade-in.
var STYLE_ID = 'mp-antiflicker-style';
var HIDE_CLASS = 'mp-antiflicker-hide';
var HIDE_CSS = 'html.' + HIDE_CLASS + '{opacity:0 !important}';

// Failsafe ceiling on how long the page may stay hidden. Kept short so a slow or
// failed flag delivery never leaves the user staring at a blank page; the real
// reveal normally fires much sooner, as soon as flags settle.
var DEFAULT_TIMEOUT_MS = 2000;

// The hide (one HIDE_CLASS + one <style>) is shared DOM state; named instances
// each own a controller but share it. Reference-count contributors so the last
// one to reveal tears it down — otherwise the first to settle unhides while
// another variant is still pending.
var activeHideCount = 0;

/**
 * Anti-flicker controller for visual experiments. hide() synchronously hides the
 * page (via an injected <style> + a class on <html>) and arms a failsafe timer;
 * reveal() removes the style and class. Both are idempotent and safe outside a
 * browser. State is per-instance so one Mixpanel instance's reveal cannot race
 * another's.
 * @constructor
 * @param {number} [timeoutMs] Failsafe: max time the page stays hidden before an
 *   automatic reveal. Falls back to 2000ms when not a positive number.
 */
var AntiFlickerController = function(timeoutMs) {
    this._timeoutMs = (typeof timeoutMs === 'number' && timeoutMs > 0) ? timeoutMs : DEFAULT_TIMEOUT_MS;
    this._timer = null;
    this._styleEl = null;
    // Whether the page is hidden is derived from the DOM (see _isHidden); only the
    // one-way "revealed" latch — which cannot be read back from the DOM once the
    // class is removed — is tracked as a flag, so we never re-hide after revealing.
    this._revealed = false;
    // Whether this instance currently counts toward activeHideCount.
    this._contributingToHide = false;
};

// Hidden state is a function of the live DOM, not a cached flag.
AntiFlickerController.prototype._isHidden = function() {
    return !!window['document'].documentElement &&
        !!window['document'].documentElement.classList &&
        window['document'].documentElement.classList.contains(HIDE_CLASS);
};

/**
 * Hide the page content. No-op if already hidden/revealed or outside a browser.
 * Starts a failsafe timer that reveals the page even if no variant ever applies.
 */
AntiFlickerController.prototype.hide = function() {
    // Guard on this instance's own state, not _isHidden(): a later instance must
    // still register even when an earlier one already added the class.
    if (!window['document'].documentElement || this._revealed || this._contributingToHide) {
        return;
    }
    var doc = window['document'];
    try {
        // First contributor injects the shared style + class; later ones reuse it.
        if (activeHideCount === 0 && !this._isHidden()) {
            var styleEl = doc.createElement('style');
            styleEl.type = 'text/css';
            styleEl.id = STYLE_ID;
            styleEl.appendChild(doc.createTextNode(HIDE_CSS));
            (doc.head || doc.documentElement).appendChild(styleEl);
            doc.documentElement.classList.add(HIDE_CLASS);
            this._styleEl = styleEl;
        }
        activeHideCount++;
        this._contributingToHide = true;

        var self = this;
        this._timer = window['setTimeout'](function() {
            logger.log('Anti-flicker failsafe reached; revealing page');
            self.reveal();
        }, this._timeoutMs);
    } catch (err) {
        logger.error('Anti-flicker hide failed', err);
        // Never leave the page hidden because of a failure here.
        this.reveal();
    }
};

/**
 * Reveal the page content (remove the injected style + class) and cancel the
 * failsafe timer. Idempotent and safe to call before hide().
 */
AntiFlickerController.prototype.reveal = function() {
    if (this._revealed) {
        return;
    }
    // Cancel the failsafe first so its callback cannot re-enter reveal mid-run.
    if (this._timer) {
        clearTimeout(this._timer);
        this._timer = null;
    }
    if (!window['document'].documentElement) {
        if (this._contributingToHide) {
            this._contributingToHide = false;
            if (activeHideCount > 0) {
                activeHideCount--;
            }
        }
        this._revealed = true;
        return;
    }
    try {
        // Release this instance's hold; only the last contributor tears down.
        if (this._contributingToHide) {
            this._contributingToHide = false;
            if (activeHideCount > 0) {
                activeHideCount--;
            }
        }
        this._styleEl = null;
        if (activeHideCount === 0) {
            var docEl = window['document'].documentElement;
            if (docEl && docEl.classList) {
                docEl.classList.remove(HIDE_CLASS);
            }
            // By id, not this._styleEl: the last to reveal may not be the injector.
            var styleEl = window['document'].getElementById(STYLE_ID);
            if (styleEl && styleEl.parentNode) {
                styleEl.parentNode.removeChild(styleEl);
            }
        }
        // Latch only once the page is actually shown: if the removal above threw,
        // we leave _revealed false so a later reveal() can retry rather than
        // believing we revealed while the page is still hidden.
        this._revealed = true;
    } catch (err) {
        logger.error('Anti-flicker reveal failed', err);
    }
};

safewrapClass(AntiFlickerController);

export { AntiFlickerController };
