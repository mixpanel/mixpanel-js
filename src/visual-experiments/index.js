/* eslint camelcase: "off" */

import { _, console_with_prefix, NOOP_FUNC, safewrapClass } from '../utils'; // eslint-disable-line camelcase
import { window } from '../window';
import { onLocationChange } from '../navigation';
import { VisualChangeEngine } from './engine';
import { AntiFlickerController } from './anti-flicker';

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

// Normalize a pathname for comparison: ensure a leading slash and drop a single
// trailing slash (keeping root "/") so "/foo" and "/foo/" are treated as equal.
var normalizePathname = function(pathname) {
    if (!pathname) {
        return '/';
    }
    if (pathname.charAt(0) !== '/') {
        pathname = '/' + pathname;
    }
    if (pathname.length > 1 && pathname.charAt(pathname.length - 1) === '/') {
        pathname = pathname.slice(0, -1);
    }
    return pathname;
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

// A stable key for the current page at the granularity visual-change scoping uses
// (origin + normalized pathname; query/hash ignored). Returns null outside a browser.
var currentPageKey = function() {
    var loc = window && window['location'];
    if (!loc) {
        return null;
    }
    return loc.protocol + '//' + loc.host + normalizePathname(loc.pathname);
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
 *   flag key and variant the first time a variant is visible on the page
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
    // origin+pathname the set was last (re)applied for, so an SPA navigation that
    // does not change the matched page is a cheap no-op.
    this._lastReplayedPageKey = null;
    // experiment_ids whose delivered changes are withheld because an editor
    // session is authoring them; the live preview is the sole driver.
    this._suppressedExperiments = {};
    // Editor state is separate from delivered flags. The preview is composed
    // with unrelated experiments on every delivery and navigation.
    this._editorSession = null;
    this._editorPreview = null;
    // Bumped by onReset so an engine first-apply report for a set applied under
    // the previous identity is not tracked as the new identity's exposure.
    this._applyGeneration = 0;
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

// Re-run page-scoped replay against the already-delivered variants, without a
// fetch. Deduped so navigating without changing the matched page is a no-op.
VisualExperimentsManager.prototype.applyForCurrentPage = function() {
    var key = currentPageKey();
    if (key !== null && key === this._lastReplayedPageKey) {
        return;
    }
    this._refresh();
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
    // Repeated starts preserve edits only while authoring the same page.
    if (!experimentId || (this._editorSession && this._editorSession.experimentId === experimentId &&
        this._editorSession.pageKey === pageKey)) {
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
    var variants = this.getVariants();
    this._applyForFlags((variants && variants.forEach) ? variants : EMPTY_VARIANTS);
};

// Aggregate $mp.visualChanges across every variant whose $mp.url matches the
// current page, compose the editor preview, and apply them in a single call.
// Applying per-variant would let the engine's auto-revert wipe an earlier
// variant's changes when a later one has its own set.
VisualExperimentsManager.prototype._applyForFlags = function(flagsMap) {
    var self = this;
    var generation = this._applyGeneration;
    var allVisualChanges = [];
    // Parallel to allVisualChanges: the [flagKey, variant] each mutation came from.
    var mutationSources = [];
    // [flagKey, variant] for variants on this page that carry no mutations: a
    // control arm (or an unedited variant) is exposed by reaching the page.
    var pageExposures = [];
    flagsMap.forEach(function(variant, flagKey) {
        if (variant && self._suppressedExperiments[variant['experiment_id']]) {
            return;
        }
        var value = variant && variant['value'];
        var mp = value && value['$mp'];
        if (!mp) {
            return;
        }
        if (!urlMatchesCurrentPage(mp['url'])) {
            return;
        }
        var visualChanges = mp['visualChanges'];
        if (!visualChanges || !visualChanges.length) {
            // Controls bypass the engine, so check the setting explicitly here.
            // The disabled engine already prevents treatment exposure callbacks.
            if (self.isEnabled()) {
                pageExposures.push([flagKey, variant]);
            }
            return;
        }
        if (payloadTooLarge(visualChanges)) {
            logger.error('Ignoring visual changes for ' + flagKey + ' exceeding ' + MAX_PAYLOAD_LENGTH + ' characters');
            return;
        }
        allVisualChanges = allVisualChanges.concat(visualChanges);
        for (var i = 0; i < visualChanges.length; i++) {
            mutationSources.push([flagKey, variant]);
        }
    });
    var preview = this._editorPreview;
    if (preview && preview.pageKey === currentPageKey()) {
        if (payloadTooLarge(preview.mutations)) {
            logger.error('Ignoring editor preview exceeding ' + MAX_PAYLOAD_LENGTH + ' characters');
        } else {
            // Preview wins any conflicts with live changes. It has no source entries,
            // so the first-apply callback cannot report preview mutations as exposures.
            allVisualChanges = allVisualChanges.concat(preview.mutations);
        }
    }
    // Each variant is reported once per applied set, however many of its
    // mutations land.
    var reported = [];
    var report = function(source) {
        if (!source || generation !== self._applyGeneration || _.include(reported, source[0])) {
            return;
        }
        reported.push(source[0]);
        try {
            self.trackExposure(source[0], source[1]);
        } catch (err) {
            logger.error('Visual exposure tracking failed', err);
        }
    };
    if (allVisualChanges.length) {
        // The engine reports each mutation the first time it actually changes an
        // element (which may be later, once the target renders), so a variant is
        // only counted as exposed once the user can see it.
        this.applyVisualChangesFunc(allVisualChanges, function(mutationIndex) {
            report(mutationSources[mutationIndex]);
        });
    } else {
        // No matching live changes or preview, including an empty control preview:
        // clear the previous set rather than leaving it applied.
        this.revertVisualChangesFunc();
    }
    // A variant with nothing to apply has no first-apply report, so it is tracked
    // as soon as the page is matched. A tracking hook may reset the visitor, which
    // discards that visitor's remaining exposures.
    for (var k = 0; k < pageExposures.length; k++) {
        report(pageExposures[k]);
    }
    this._lastReplayedPageKey = currentPageKey();
    this.onDeliverySettled();
};

safewrapClass(VisualExperimentsManager);

export { VisualExperimentsManager };
