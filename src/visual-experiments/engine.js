/* eslint camelcase: "off" */

import { _, console_with_prefix, safewrapClass } from '../utils'; // eslint-disable-line camelcase
import { window } from '../window';

var logger = console_with_prefix('visual-experiments');

// The supported mutation types: setAttribute, setText, setStyle, setClasses,
// setAttributes, hide. The backend validates persisted variants to this same set,
// so anything outside it never reaches replay; the extension drives the same
// dispatch during authoring. Unknown types are logged and skipped. Text edits go
// through setText (textContent), never innerHTML, so no markup is ever parsed.

// The engine needs a queryable DOM plus MutationObserver, requestAnimationFrame,
// and WeakSet. If any is missing the engine no-ops instead of partially applying.
var minApisSupported = function() {
    return !!(window && window['document'] &&
        typeof window['document'].querySelectorAll === 'function' &&
        typeof window['MutationObserver'] === 'function' &&
        typeof window['requestAnimationFrame'] === 'function' &&
        typeof WeakSet !== 'undefined');
};

var query = function(selector) {
    try {
        return window['document'].querySelectorAll(selector);
    } catch (err) {
        logger.error('Invalid selector: ' + selector, err);
        return [];
    }
};

var schedule = function(fn) {
    window['requestAnimationFrame'](fn);
};

// A mutation only reaches the elements its selector matches when its turn
// comes, and a later mutation in the same set can make an earlier selector
// match (e.g. a class it adds). Each apply therefore runs another pass while
// the previous one reached an element for the first time or wrote a class or
// attribute, up to this cap. The DOM does not change between passes other than
// through those writes, so passes converge; the cap guards anyway.
var MAX_APPLY_PASSES = 3;

// Values whose scheme can execute script when placed in a URL-bearing attribute
// (href, src, formaction, xlink:href, ...). Control chars/whitespace are stripped
// before the test because browsers ignore them within a scheme (e.g. "java\tscript:").
var DANGEROUS_URI_VALUE = /^(?:javascript|vbscript):|^data:text\/html/i;

// Reject attributes that can introduce script/active content when set from a
// persisted or authored value: any inline event handler (on*), iframe srcdoc
// (full HTML injection), and URL-bearing attributes carrying an executable scheme.
// setAttribute and setAttributes (which delegates here) both go through this guard.
var isUnsafeAttribute = function(name, value) {
    if (!name) {
        return true;
    }
    var lower = ('' + name).toLowerCase();
    if (lower.indexOf('on') === 0) {
        return true;
    }
    if (lower === 'srcdoc') {
        return true;
    }
    if (typeof value === 'string' && DANGEROUS_URI_VALUE.test(value.replace(/[\u0000-\u0020]+/g, ''))) {
        return true;
    }
    return false;
};

// Per-mutation "already applied" tracker. A WeakSet lets re-rendered nodes (new
// object identities) be detected as dirty without leaking removed nodes.
var makeTracker = function() {
    return new WeakSet();
};

/**
 * VisualChangeEngine applies typed visual-change mutations to the live DOM,
 * keeps an undo stack so a set can be reverted, and re-applies changes when the
 * page re-renders via a MutationObserver. State is per-instance so two Mixpanel
 * instances on one page do not share an undo stack.
 * @constructor
 */
var VisualChangeEngine = function() {
    this._undoStack = [];
    this._currentMutations = [];
    // Parallel to _currentMutations: a WeakSet of elements already mutated for
    // each mutation, so re-application only touches new/re-rendered nodes.
    this._appliedSets = [];
    // Optional per-set callback, invoked once per mutation index the first time
    // that mutation actually changes an element (possibly later, via the
    // observer). _firstApplyReported is parallel to _currentMutations. Reports are
    // queued in _pendingFirstApply and delivered only after the apply pass ends,
    // so the callback never runs while the engine is mid-mutation.
    this._onFirstApply = null;
    this._firstApplyReported = [];
    this._pendingFirstApply = [];
    this._observer = null;
    this._reapplyScheduled = false;
    // True while a body-not-yet-parsed observer-start retry is queued (at most one).
    this._observerStartPending = false;
};

// firstApply=false is a re-apply onto a node whose value a re-render clobbered:
// re-write only when diverged and never record undo (the baseline was captured
// on first apply). Returns true when a class or attribute was written, since
// those writes can change what other selectors in the set match.
VisualChangeEngine.prototype._applyOneToElement = function(mutation, el, firstApply) {
    var type = mutation['type'];
    if (type === 'setAttribute') {
        var attr = mutation['attribute'];
        if (isUnsafeAttribute(attr, mutation['value'])) {
            logger.warn('Ignoring unsafe attribute mutation: ' + attr);
            return false;
        }
        if (!firstApply) {
            if (el.getAttribute(attr) === mutation['value']) {
                return false;
            }
            el.setAttribute(attr, mutation['value']);
            return true;
        }
        var hadAttr = el.hasAttribute(attr);
        var prev = hadAttr ? el.getAttribute(attr) : null;
        el.setAttribute(attr, mutation['value']);
        this._undoStack.push(function() {
            if (hadAttr) {
                el.setAttribute(attr, prev);
            } else {
                el.removeAttribute(attr);
            }
        });
        return true;
    } else if (type === 'setText') {
        // Replaces the element's text via textContent, not innerHTML: the value is
        // treated as plain text (no markup is parsed, no scripts/handlers run), so
        // this is safe to apply from persisted variants. Covers the editor's
        // text-editing use case without the innerHTML XSS surface.
        if (!firstApply) {
            if (el.textContent !== mutation['value']) {
                el.textContent = mutation['value'];
            }
            return;
        }
        // Retain the actual nodes so undo restores nested elements, their state,
        // and event listeners rather than recreating flattened text or markup.
        var prevChildren = [];
        for (var child = el.firstChild; child; child = child.nextSibling) {
            prevChildren.push(child);
        }
        el.textContent = mutation['value'];
        this._undoStack.push(function() {
            el.textContent = '';
            for (var i = 0; i < prevChildren.length; i++) {
                el.appendChild(prevChildren[i]);
            }
        });
    } else if (type === 'setAttributes') {
        var attrs = mutation['attributes'] || {};
        var wroteAttr = false;
        _.each(attrs, function(value, attrKey) {
            if (this._applyOneToElement({
                'type': 'setAttribute',
                'attribute': attrKey,
                'value': value,
                'selector': mutation['selector']
            }, el, firstApply)) {
                wroteAttr = true;
            }
        }, this);
        return wroteAttr;
    } else if (type === 'setStyle') {
        var prop = mutation['property'];
        if (!firstApply) {
            if (el.style.getPropertyValue(prop) !== mutation['value']) {
                el.style.setProperty(prop, mutation['value']);
            }
            return;
        }
        var prevValue = el.style.getPropertyValue(prop);
        var prevPriority = el.style.getPropertyPriority(prop);
        el.style.setProperty(prop, mutation['value']);
        this._undoStack.push(function() {
            if (prevValue) {
                el.style.setProperty(prop, prevValue, prevPriority);
            } else {
                el.style.removeProperty(prop);
            }
        });
    } else if (type === 'setClasses') {
        var toAdd = mutation['add'] || [];
        var toRemove = mutation['remove'] || [];
        var added = [];
        var removed = [];
        for (var a = 0; a < toAdd.length; a++) {
            if (!el.classList.contains(toAdd[a])) {
                el.classList.add(toAdd[a]);
                added.push(toAdd[a]);
            }
        }
        for (var r = 0; r < toRemove.length; r++) {
            if (el.classList.contains(toRemove[r])) {
                el.classList.remove(toRemove[r]);
                removed.push(toRemove[r]);
            }
        }
        // add/remove above is idempotent (contains-guarded); only record undo once.
        if (firstApply) {
            this._undoStack.push(function() {
                for (var i = 0; i < added.length; i++) {
                    el.classList.remove(added[i]);
                }
                for (var j = 0; j < removed.length; j++) {
                    el.classList.add(removed[j]);
                }
            });
        }
        return added.length > 0 || removed.length > 0;
    } else if (type === 'hide') {
        this._applyOneToElement({
            'type': 'setStyle',
            'property': 'display',
            'value': 'none',
            'selector': mutation['selector']
        }, el, firstApply);
    } else {
        logger.warn('Ignoring unsupported mutation type: ' + type);
    }
    return false;
};

// Apply the mutation at the given index to every matched element. New nodes are
// applied for the first time (captured on the undo stack); already-tracked nodes
// are re-applied idempotently so an in-place re-render can't lose the variant.
// Returns whether another pass may now match more (see MAX_APPLY_PASSES).
VisualChangeEngine.prototype._applyOne = function(index) {
    var mutation = this._currentMutations[index];
    if (!mutation || !mutation['type'] || !mutation['selector']) {
        logger.warn('Skipping malformed mutation', mutation);
        return false;
    }
    var applied = this._appliedSets[index];
    var els = query(mutation['selector']);
    if (!els || !els.length) {
        return false;
    }
    var passAgain = false;
    for (var i = 0; i < els.length; i++) {
        var el = els[i];
        var firstApply = !applied.has(el);
        if (firstApply) {
            applied.add(el);
            passAgain = true;
        }
        // A first apply that changed the element records an undo entry; skipped
        // (unsafe/unsupported) mutations do not.
        var undoDepth = this._undoStack.length;
        try {
            if (this._applyOneToElement(mutation, el, firstApply)) {
                passAgain = true;
            }
        } catch (err) {
            logger.error('Mutation failed for selector ' + mutation['selector'], err);
        }
        if (firstApply && this._undoStack.length > undoDepth) {
            this._queueFirstApply(index);
        }
    }
    return passAgain;
};

VisualChangeEngine.prototype._applyAll = function() {
    for (var pass = 0; pass < MAX_APPLY_PASSES; pass++) {
        var passAgain = false;
        for (var i = 0; i < this._currentMutations.length; i++) {
            if (this._applyOne(i)) {
                passAgain = true;
            }
        }
        if (!passAgain) {
            return;
        }
    }
};

VisualChangeEngine.prototype._queueFirstApply = function(index) {
    if (!this._onFirstApply || this._firstApplyReported[index]) {
        return;
    }
    this._firstApplyReported[index] = true;
    this._pendingFirstApply.push(index);
};

// Deliver queued first-apply reports. Runs after an apply pass completes; the
// callback (exposure tracking, and anything a before_track hook does) may
// revert or replace the set, in which case the remaining reports are stale and
// dropped.
VisualChangeEngine.prototype._flushFirstApply = function() {
    var callback = this._onFirstApply;
    var pending = this._pendingFirstApply;
    this._pendingFirstApply = [];
    for (var i = 0; i < pending.length; i++) {
        if (this._onFirstApply !== callback) {
            return;
        }
        try {
            callback(pending[i]);
        } catch (err) {
            logger.error('Visual changes onFirstApply callback failed', err);
        }
    }
};

VisualChangeEngine.prototype._startObserverIfNeeded = function() {
    if (!this._currentMutations.length) {
        return;
    }
    // Flags can settle before <body> exists. Retry on the next frame until it
    // appears, then attach and re-apply; one retry at a time, dropped if reverted.
    if (!window['document'].body) {
        if (this._observerStartPending) {
            return;
        }
        this._observerStartPending = true;
        var pendingSelf = this;
        schedule(function() {
            pendingSelf._observerStartPending = false;
            if (!pendingSelf._currentMutations.length) {
                return;
            }
            pendingSelf._startObserverIfNeeded();
            if (pendingSelf._observer) {
                pendingSelf._reapplyDirty();
            }
        });
        return;
    }
    if (!this._observer) {
        var self = this;
        this._observer = new window['MutationObserver'](function() {
            if (self._reapplyScheduled || !self._currentMutations.length) {
                return;
            }
            self._reapplyScheduled = true;
            schedule(function() {
                self._reapplyScheduled = false;
                self._reapplyDirty();
            });
        });
    }
    // attributes/characterData (not just childList) so an in-place overwrite of a
    // matched node triggers a re-apply. Reconnect after each engine write pass.
    this._observer.observe(window['document'].body, {
        childList: true,
        subtree: true,
        attributes: true,
        characterData: true
    });
};

VisualChangeEngine.prototype._pauseObserver = function() {
    if (this._observer) {
        // Observer notifications arrive asynchronously, so a synchronous
        // "currently mutating" flag cannot filter our writes. Disconnect before
        // writing instead. Pending records can be discarded because apply and
        // reapply query the current DOM for every mutation.
        this._observer.disconnect();
    }
};

VisualChangeEngine.prototype._stopObserverIfIdle = function() {
    if (this._observer && !this._currentMutations.length) {
        this._observer.disconnect();
        this._observer = null;
    }
};

// Re-apply the current set to only the elements that are newly dirty (added or
// re-rendered). No full revert/reapply cycle.
VisualChangeEngine.prototype._reapplyDirty = function() {
    if (!this._currentMutations.length) {
        return;
    }
    this._pauseObserver();
    try {
        this._applyAll();
    } finally {
        this._startObserverIfNeeded();
    }
    this._flushFirstApply();
};

/**
 * Apply an array of typed visual-change mutations to the live DOM. Replaces any
 * prior set: reverts the previous undo stack first, then applies the new list.
 * Safe to call repeatedly; bad selectors are logged and skipped, never thrown.
 * @param {Array<Object>} mutations
 * @param {function(number)} [onFirstApply] called once per mutation index the
 *   first time that mutation changes an element, including later re-applies
 *   triggered by the observer. Not called for mutations that never apply.
 *   Invoked after the apply pass completes, never mid-mutation.
 */
VisualChangeEngine.prototype.applyVisualChanges = function(mutations, onFirstApply) {
    if (!minApisSupported() || !mutations || !mutations.length) {
        return;
    }
    this._pauseObserver();
    try {
        if (this._undoStack.length) {
            this._revertInternal();
        }
        this._currentMutations = mutations.slice();
        this._onFirstApply = onFirstApply || null;
        this._firstApplyReported = [];
        this._pendingFirstApply = [];
        this._appliedSets = [];
        for (var i = 0; i < this._currentMutations.length; i++) {
            this._appliedSets.push(makeTracker());
        }
        this._applyAll();
    } finally {
        this._startObserverIfNeeded();
    }
    this._flushFirstApply();
};

VisualChangeEngine.prototype._revertInternal = function() {
    while (this._undoStack.length) {
        var undoFn = this._undoStack.pop();
        try {
            undoFn();
        } catch (err) {
            logger.error('Revert failed', err);
        }
    }
    this._appliedSets = [];
};

/**
 * Undo the last-applied set of visual changes. Idempotent.
 */
VisualChangeEngine.prototype.revertVisualChanges = function() {
    if (!minApisSupported()) {
        return;
    }
    this._pauseObserver();
    try {
        this._revertInternal();
        this._currentMutations = [];
        this._onFirstApply = null;
        this._firstApplyReported = [];
        this._pendingFirstApply = [];
    } finally {
        this._stopObserverIfIdle();
        this._startObserverIfNeeded();
    }
};

safewrapClass(VisualChangeEngine);

export { VisualChangeEngine };
