/* eslint camelcase: "off" */

import { _, console_with_prefix, NOOP_FUNC, safewrapClass } from '../utils'; // eslint-disable-line camelcase
import { window } from '../window';
import { onLocationChange } from '../navigation';
import { VisualChangeEngine } from './engine';
import { AntiFlickerController } from './anti-flicker';
import { anySelectorPresent, ExposureWatcher } from './exposure-watcher';
import { normalizePathname, urlTargetMatches } from '../url-matching';

var logger = console_with_prefix('visual-experiments');

var CONFIG_ENABLED = 'visual_experiments';
var CONFIG_HIDE_TIMEOUT_MS = 'visual_experiments_hide_timeout_ms';

var EMPTY_VARIANTS = { forEach: NOOP_FUNC };

// Upper bound on the length of JSON.stringify(visualChanges) for one variant
// (or one editor preview), measured in UTF-16 code units. Checked per variant
// so one oversized variant cannot block the valid ones delivered alongside it.
var MAX_PAYLOAD_LENGTH = 32 * 1024;

var payloadTooLarge = function(mutations) {
    try {
        return JSON.stringify(mutations).length > MAX_PAYLOAD_LENGTH;
    } catch (err) {
        // Non-serializable payload (cycles, etc.) is not something the engine
        // should touch.
        return true;
    }
};

// Compare a persisted page url against the current location by origin + pathname
// (query string and hash ignored). Uses a throwaway anchor to parse robustly
// without assuming URL is available. Returns false when parsing is not possible.
var urlMatchesCurrentPage = function(url) {
    if (!url) {
        return false;
    }
    var loc = window && window['location'];
    var doc = window && window['document'];
    if (!loc || !doc || !doc.createElement) {
        return false;
    }
    var a = doc.createElement('a');
    a.href = url;
    if (a.protocol + '//' + a.host !== loc.protocol + '//' + loc.host) {
        return false;
    }
    return normalizePathname(a.pathname) === normalizePathname(loc.pathname);
};

// A variant applies to the current page by its structured Target URL rule
// ($mp.target) when it has one, and otherwise by its persisted page url.
var variantMatchesCurrentPage = function(mp) {
    var target = mp['target'];
    if (target !== undefined && target !== null) {
        return urlTargetMatches(target, window && window['location']);
    }
    return urlMatchesCurrentPage(mp['url']);
};

// A stable key for the current page at the granularity visual-change scoping uses
// (origin + normalized pathname; query/hash ignored). Returns null outside a browser.
var currentPageKey = function() {
    var loc = window && window['location'];
    if (!loc) {
        return null;
    }
    return loc.protocol + '//' + loc.host + normalizePathname(loc.pathname);
};

// The key SPA replay dedupes on: the sorted set of matched variants, each
// identified by flag key and variant key, and whether the editor preview
// applies. Navigating between pages that match the same variants (e.g. /item/1
// to /item/2 under one pattern) leaves the applied set untouched.
var matchedSetKey = function(matchedVariantIds, previewApplies) {
    return (previewApplies ? 'preview;' : '') + matchedVariantIds.slice().sort().join(',');
};

/**
 * VisualExperimentsManager: delivers visual-experiment variants to the page and
 * hosts the editor's preview session. The flags manager hands it each delivered
 * variant set through onFlagsDelivered; it decides which $mp.visualChanges apply
 * to the current page, drives the engine, and reports exposures back.
 * @constructor
 * @param {Object} options
 * @param {function(string)} options.getConfigFunc
 * @param {function(): Object} [options.getVariantsFunc] current delivered variants
 *   (a Map or any object with forEach), used to replay on navigation and editing
 * @param {function(string, Object)} [options.trackExposureFunc] called with the
 *   flag key and variant the first time a variant's page is matched and one of
 *   its $mp.exposureSelectors is present (or it has none), for every arm alike.
 *   The variant is a copy carrying 'matched_url', the page url it matched on.
 * @param {Function} [options.applyVisualChangesFunc] engine override for tests
 * @param {Function} [options.revertVisualChangesFunc] engine override for tests
 * @param {Function} [options.onSettledFunc] anti-flicker override for tests
 */
var VisualExperimentsManager = function(options) {
    options = options || {};
    this.getMpConfig = options.getConfigFunc || NOOP_FUNC;
    this.getVariants = options.getVariantsFunc || NOOP_FUNC;
    this.trackExposure = options.trackExposureFunc || NOOP_FUNC;
    this.applyVisualChangesFunc = options.applyVisualChangesFunc || NOOP_FUNC;
    this.revertVisualChangesFunc = options.revertVisualChangesFunc || NOOP_FUNC;
    this.onSettledFunc = options.onSettledFunc || NOOP_FUNC;
    this._settled = false;
    // matchedSetKey of the set last (re)applied, so an SPA navigation that does
    // not change which variants match is a cheap no-op.
    this._lastAppliedMatchedSetKey = null;
    // experiment_ids whose delivered changes are withheld because an editor
    // session is authoring them; the live preview is the sole driver.
    this._suppressedExperiments = {};
    // Editor state is separate from delivered flags. The preview is composed
    // with unrelated experiments on every delivery and navigation.
    this._editorSession = null;
    this._editorPreview = null;
    // Bumped by every apply and by onReset. An apply whose generation is no
    // longer current has been replaced (a re-apply, navigation, or a reset of
    // the visitor), so its remaining exposures and replay state are stale.
    this._applyGeneration = 0;
    // Waits for the exposure selectors of the last applied set.
    this._exposureWatcher = null;
    // Whether the engine holds an applied set that has not been reverted.
    this._visualChangesApplied = false;
};

VisualExperimentsManager.prototype.isEnabled = function() {
    return !!this.getMpConfig(CONFIG_ENABLED);
};

/**
 * Set up the engine, hide the page for anti-flicker, and expose the editor API.
 * No-op unless the visual_experiments init option is enabled. Must run before
 * flag delivery starts so the hide precedes any variant application.
 */
VisualExperimentsManager.prototype.init = function() {
    if (!this.isEnabled() || this._engine) {
        return;
    }
    var engine = this._engine = new VisualChangeEngine();
    this._antiFlicker = new AntiFlickerController(this.getMpConfig(CONFIG_HIDE_TIMEOUT_MS));

    if (this.applyVisualChangesFunc === NOOP_FUNC) {
        this.applyVisualChangesFunc = _.bind(engine.applyVisualChanges, engine);
    }
    if (this.revertVisualChangesFunc === NOOP_FUNC) {
        this.revertVisualChangesFunc = _.bind(engine.revertVisualChanges, engine);
    }
    if (this.onSettledFunc === NOOP_FUNC) {
        this.onSettledFunc = _.bind(this._antiFlicker.reveal, this._antiFlicker);
    }

    // The extension calls this API through its MAIN-world bridge. Quoted keys
    // preserve the public mixpanel.experiments contract through minification.
    this._experimentsApi = {
        'applyVisualChanges': _.bind(this._applyEditorPreview, this),
        'revertVisualChanges': _.bind(this._revertEditorPreview, this),
        'startEditorSession': _.bind(this._startEditorSession, this),
        'endEditorSession': _.bind(this._endEditorSession, this)
    };

    this._antiFlicker.hide();
    this._navTeardown = onLocationChange(_.bind(this.applyForCurrentPage, this));
};

VisualExperimentsManager.prototype.getExperimentsApi = function() {
    return this._experimentsApi;
};

/**
 * A variant set has been delivered (from persistence or the network). Applies the
 * matching visual changes for the current page and reports exposures.
 * @param {Object} flagsMap Map of flag key to variant
 */
VisualExperimentsManager.prototype.onFlagsDelivered = function(flagsMap) {
    if (!flagsMap || !flagsMap.forEach) {
        return;
    }
    this._applyForFlags(flagsMap);
};

/**
 * Flag delivery has finished for this page load, with or without variants.
 * Reveals the page once; later calls are no-ops.
 */
VisualExperimentsManager.prototype.onDeliverySettled = function() {
    if (this._settled) {
        return;
    }
    this._settled = true;
    this.onSettledFunc();
};

/**
 * The visitor identity was reset. Exposure reports still pending from the
 * previous identity's set are discarded, and that identity's changes are
 * cleared rather than left in place until the next delivery arrives.
 */
VisualExperimentsManager.prototype.onReset = function() {
    this._applyGeneration++;
    this._refresh();
};

VisualExperimentsManager.prototype._stopExposureWatcher = function() {
    if (this._exposureWatcher) {
        this._exposureWatcher.stop();
        this._exposureWatcher = null;
    }
};

// Re-run page-scoped matching against the already-delivered variants, without
// a fetch, on every navigation. Deduped so a navigation that does not change
// the matched set is a no-op.
VisualExperimentsManager.prototype.applyForCurrentPage = function() {
    var flagsMap = this._currentVariants();
    var matched = this._matchCurrentPage(flagsMap);
    if (matched.key === this._lastAppliedMatchedSetKey) {
        return;
    }
    this._applyForFlags(flagsMap, matched);
};

// Withhold a single experiment's delivered changes while an editor session is
// authoring it, and re-apply the rest at once.
VisualExperimentsManager.prototype.suppressExperiment = function(experimentId) {
    if (!experimentId || this._suppressedExperiments[experimentId]) {
        return;
    }
    this._suppressedExperiments[experimentId] = true;
    this._refresh();
};

VisualExperimentsManager.prototype.unsuppressExperiment = function(experimentId) {
    if (experimentId) {
        delete this._suppressedExperiments[experimentId];
    }
};

VisualExperimentsManager.prototype._applyEditorPreview = function(mutations) {
    if (!_.isArray(mutations)) {
        return;
    }
    this._editorPreview = {
        pageKey: this._editorSession ? this._editorSession.pageKey : currentPageKey(),
        mutations: mutations.slice()
    };
    this._refresh();
};

VisualExperimentsManager.prototype._revertEditorPreview = function() {
    this._editorPreview = null;
    this._refresh();
};

VisualExperimentsManager.prototype._startEditorSession = function(experimentId) {
    var pageKey = currentPageKey();
    // Repeated starts preserve edits while authoring the same page or any page
    // the preview applies to.
    if (!experimentId || (this._editorSession && this._editorSession.experimentId === experimentId &&
        (this._editorSession.pageKey === pageKey || this._editorPreviewMatchesCurrentPage(this._currentVariants())))) {
        return;
    }
    if (this._editorSession) {
        this.unsuppressExperiment(this._editorSession.experimentId);
    }
    this._editorSession = { experimentId: experimentId, pageKey: pageKey };
    this._editorPreview = null;
    this.suppressExperiment(experimentId);
};

VisualExperimentsManager.prototype._endEditorSession = function(experimentId) {
    if (!this._editorSession || this._editorSession.experimentId !== experimentId) {
        return;
    }
    this._editorSession = null;
    this._editorPreview = null;
    this.unsuppressExperiment(experimentId);
    this._refresh();
};

// Re-apply against the current delivered variants. Works before any delivery
// (and without the flag-fetch APIs) so the editor is usable standalone.
VisualExperimentsManager.prototype._refresh = function() {
    this._applyForFlags(this._currentVariants());
};

VisualExperimentsManager.prototype._currentVariants = function() {
    var variants = this.getVariants();
    return (variants && variants.forEach) ? variants : EMPTY_VARIANTS;
};

// The delivered variants that apply to the current page ($mp.target, or $mp.url
// when there is no target), skipping experiments withheld for the editor, as
// [flagKey, variant, $mp] entries, whether the editor preview applies, and the
// matchedSetKey over both.
VisualExperimentsManager.prototype._matchCurrentPage = function(flagsMap) {
    var self = this;
    var matches = [];
    var matchedVariantIds = [];
    flagsMap.forEach(function(variant, flagKey) {
        if (variant && self._suppressedExperiments[variant['experiment_id']]) {
            return;
        }
        var value = variant && variant['value'];
        var mp = value && value['$mp'];
        if (!mp || !variantMatchesCurrentPage(mp)) {
            return;
        }
        matches.push([flagKey, variant, mp]);
        matchedVariantIds.push(JSON.stringify([flagKey, variant['key']]));
    });
    var previewApplies = this._editorPreviewMatchesCurrentPage(flagsMap);
    return {
        matches: matches,
        previewApplies: previewApplies,
        key: matchedSetKey(matchedVariantIds, previewApplies)
    };
};

// The editor preview applies on the page where it was authored and on any page
// a delivered variant of the experiment being authored matches ($mp.target, or
// $mp.url without one), so it follows the experiment's target across navigation.
VisualExperimentsManager.prototype._editorPreviewMatchesCurrentPage = function(flagsMap) {
    if (!this._editorPreview) {
        return false;
    }
    if (this._editorPreview.pageKey === currentPageKey()) {
        return true;
    }
    var session = this._editorSession;
    var editedVariantMatches = false;
    if (session) {
        flagsMap.forEach(function(variant) {
            var value = variant && variant['experiment_id'] === session.experimentId && variant['value'];
            var mp = value && value['$mp'];
            editedVariantMatches = editedVariantMatches || (!!mp && variantMatchesCurrentPage(mp));
        });
    }
    return editedVariantMatches;
};

// Aggregate $mp.visualChanges across every variant that matches the current
// page ($mp.target, or $mp.url when there is no target), compose the editor
// preview, and apply them in a single call.
// Applying per-variant would let the engine's auto-revert wipe an earlier
// variant's changes when a later one has its own set.
// Every matching variant, control or treatment, is exposed by the same rule:
// the page matched and one of its $mp.exposureSelectors is present (at once or
// later), or it has none. Whether the engine changed an element is irrelevant,
// so both arms count the same visitors.
// matched is the _matchCurrentPage result for flagsMap when the caller already
// computed it.
VisualExperimentsManager.prototype._applyForFlags = function(flagsMap, matched) {
    var self = this;
    var generation = ++this._applyGeneration;
    var loc = window && window['location'];
    var matchedUrl = loc ? _.sanitizeUrl(loc.href) : null;
    var allVisualChanges = [];
    // [flagKey, variant, exposureSelectors] for every variant on this page.
    var pageExposures = [];
    matched = matched || this._matchCurrentPage(flagsMap);
    // Recorded before any exposure callback runs: a before_track hook may
    // navigate, and the nested apply's key must not be overwritten by this one.
    this._lastAppliedMatchedSetKey = matched.key;
    for (var m = 0; m < matched.matches.length; m++) {
        var flagKey = matched.matches[m][0];
        var variant = matched.matches[m][1];
        var mp = matched.matches[m][2];
        var visualChanges = mp['visualChanges'];
        var hasVisualChanges = visualChanges && visualChanges.length;
        if (hasVisualChanges && payloadTooLarge(visualChanges)) {
            logger.error('Ignoring visual changes for ' + flagKey + ' exceeding ' + MAX_PAYLOAD_LENGTH + ' characters');
            continue;
        }
        if (self.isEnabled()) {
            pageExposures.push([flagKey, variant, mp['exposureSelectors']]);
        }
        if (hasVisualChanges) {
            allVisualChanges = allVisualChanges.concat(visualChanges);
        }
    }
    // Exposures still waiting on a previous set's page are dropped.
    this._stopExposureWatcher();
    // Exposure is judged on the page as it was before any treatment changed it,
    // so a treatment that removes a selector's class or attribute still counts.
    // A previously applied set is reverted before selectors are checked; the
    // revert and the apply below run in one task, so no frame shows the page
    // between them.
    var checksSelectors = false;
    _.each(pageExposures, function(source) {
        if (source[2] && source[2].length) {
            checksSelectors = true;
        }
    });
    var revertedPreviousSet = false;
    if (checksSelectors && this._visualChangesApplied) {
        this.revertVisualChangesFunc();
        this._visualChangesApplied = false;
        revertedPreviousSet = true;
    }
    var presentBeforeChanges = _.map(pageExposures, function(source) {
        var selectors = source[2];
        return !selectors || !selectors.length || anySelectorPresent(selectors);
    });
    if (matched.previewApplies) {
        if (payloadTooLarge(this._editorPreview.mutations)) {
            logger.error('Ignoring editor preview exceeding ' + MAX_PAYLOAD_LENGTH + ' characters');
        } else {
            // Preview wins any conflicts with live changes. Preview mutations belong
            // to no delivered variant, so they are never reported as exposures.
            allVisualChanges = allVisualChanges.concat(this._editorPreview.mutations);
        }
    }
    if (allVisualChanges.length) {
        this.applyVisualChangesFunc(allVisualChanges);
        this._visualChangesApplied = true;
    } else if (!revertedPreviousSet) {
        // No matching live changes or preview, including an empty control preview:
        // clear the previous set rather than leaving it applied.
        this.revertVisualChangesFunc();
        this._visualChangesApplied = false;
    }
    var watcher = this._exposureWatcher = new ExposureWatcher();
    // Each variant is reported once per applied set. A tracking hook may reset
    // the visitor or navigate, which re-applies; either way this set's
    // remaining exposures are discarded.
    var reported = [];
    var report = function(source) {
        if (generation !== self._applyGeneration || _.include(reported, source[0])) {
            return;
        }
        reported.push(source[0]);
        try {
            self.trackExposure(source[0], _.extend({}, source[1], {'matched_url': matchedUrl}));
        } catch (err) {
            logger.error('Visual exposure tracking failed', err);
        }
    };
    // Every watch is registered before any immediate report, so an element a
    // tracking hook inserts while reporting one variant is seen by the others.
    _.each(pageExposures, function(source, index) {
        if (!presentBeforeChanges[index]) {
            watcher.watch(source[2], function() {
                report(source);
            });
        }
    });
    _.each(pageExposures, function(source, index) {
        if (presentBeforeChanges[index]) {
            report(source);
        }
    });
    if (generation !== this._applyGeneration) {
        return;
    }
    this.onDeliverySettled();
};

safewrapClass(VisualExperimentsManager);

export { VisualExperimentsManager };
