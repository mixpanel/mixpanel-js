import { _, document, safewrap, safewrapClass } from '../utils';
import { window } from '../window';
import {
    getPolyfillScrollEndFunction, getPropsForDOMEvent, logger, minDOMApisSupported,
    EV_CHANGE, EV_CLICK, EV_HASHCHANGE, EV_MP_LOCATION_CHANGE, EV_LOAD,
    EV_POPSTATE, EV_SCROLL, EV_SCROLLEND, EV_SUBMIT, EV_VISIBILITYCHANGE
} from './utils';
import { RageClickTracker } from './rageclick';
import { DeadClickTracker, DEFAULT_DEAD_CLICK_TIMEOUT_MS } from './deadclick';

var AUTOCAPTURE_CONFIG_KEY = 'autocapture';
var LEGACY_PAGEVIEW_CONFIG_KEY = 'track_pageview';

var PAGEVIEW_OPTION_FULL_URL = 'full-url';
var PAGEVIEW_OPTION_URL_WITH_PATH_AND_QUERY_STRING = 'url-with-path-and-query-string';
var PAGEVIEW_OPTION_URL_WITH_PATH = 'url-with-path';

var CONFIG_ALLOW_ELEMENT_CALLBACK = 'allow_element_callback';
var CONFIG_ALLOW_SELECTORS = 'allow_selectors';
var CONFIG_ALLOW_URL_REGEXES = 'allow_url_regexes';
var CONFIG_BLOCK_ATTRS = 'block_attrs';
var CONFIG_BLOCK_ELEMENT_CALLBACK = 'block_element_callback';
var CONFIG_BLOCK_SELECTORS = 'block_selectors';
var CONFIG_BLOCK_URL_REGEXES = 'block_url_regexes';
var CONFIG_CAPTURE_EXTRA_ATTRS = 'capture_extra_attrs';
var CONFIG_CAPTURE_TEXT_CONTENT = 'capture_text_content';
var CONFIG_SCROLL_CAPTURE_ALL = 'scroll_capture_all';
var CONFIG_SCROLL_CHECKPOINTS = 'scroll_depth_percent_checkpoints';
var CONFIG_TRACK_CLICK = 'click';
var CONFIG_TRACK_DEAD_CLICK = 'dead_click';
var CONFIG_TRACK_INPUT = 'input';
var CONFIG_TRACK_PAGEVIEW = 'pageview';
var CONFIG_TRACK_RAGE_CLICK = 'rage_click';
var CONFIG_TRACK_SCROLL = 'scroll';
var CONFIG_TRACK_PAGE_LEAVE = 'page_leave';
var CONFIG_TRACK_SUBMIT = 'submit';

var CONFIG_DEFAULTS = {};
CONFIG_DEFAULTS[CONFIG_ALLOW_SELECTORS] = [];
CONFIG_DEFAULTS[CONFIG_ALLOW_URL_REGEXES] = [];
CONFIG_DEFAULTS[CONFIG_BLOCK_ATTRS] = [];
CONFIG_DEFAULTS[CONFIG_BLOCK_ELEMENT_CALLBACK] = null;
CONFIG_DEFAULTS[CONFIG_BLOCK_SELECTORS] = [];
CONFIG_DEFAULTS[CONFIG_BLOCK_URL_REGEXES] = [];
CONFIG_DEFAULTS[CONFIG_CAPTURE_EXTRA_ATTRS] = [];
CONFIG_DEFAULTS[CONFIG_CAPTURE_TEXT_CONTENT] = false;
CONFIG_DEFAULTS[CONFIG_SCROLL_CAPTURE_ALL] = false;
CONFIG_DEFAULTS[CONFIG_SCROLL_CHECKPOINTS] = [25, 50, 75, 100];
CONFIG_DEFAULTS[CONFIG_TRACK_CLICK] = true;
CONFIG_DEFAULTS[CONFIG_TRACK_DEAD_CLICK] = true;
CONFIG_DEFAULTS[CONFIG_TRACK_INPUT] = true;
CONFIG_DEFAULTS[CONFIG_TRACK_PAGEVIEW] = PAGEVIEW_OPTION_FULL_URL;
CONFIG_DEFAULTS[CONFIG_TRACK_RAGE_CLICK] = true;
CONFIG_DEFAULTS[CONFIG_TRACK_SCROLL] = true;
CONFIG_DEFAULTS[CONFIG_TRACK_PAGE_LEAVE] = false;
CONFIG_DEFAULTS[CONFIG_TRACK_SUBMIT] = true;

var DEFAULT_PROPS = {
    '$mp_autocapture': true
};

var MP_EV_CLICK = '$mp_click';
var MP_EV_DEAD_CLICK = '$mp_dead_click';
var MP_EV_INPUT = '$mp_input_change';
var MP_EV_RAGE_CLICK = '$mp_rage_click';
var MP_EV_SCROLL = '$mp_scroll';
var MP_EV_SUBMIT = '$mp_submit';
var MP_EV_PAGE_LEAVE = '$mp_page_leave';

/**
 * Autocapture: manages automatic event tracking
 * @constructor
 */
var Autocapture = function(mp) {
    this.mp = mp;
    this.maxScrollViewDepth = 0;
    this.hasTrackedScrollSession = false;
    this.previousScrollHeight = 0;
};

Autocapture.prototype.init = function() {
    if (!minDOMApisSupported()) {
        logger.critical('Autocapture unavailable: missing required DOM APIs');
        return;
    }
    this.initPageListeners();
    this.initPageviewTracking();
    this.initClickTracking();
    this.initDeadClickTracking();
    this.initInputTracking();
    this.initScrollTracking();
    this.initSubmitTracking();
    this.initRageClickTracking();
    this.initPageLeaveTracking();
};

Autocapture.prototype.getFullConfig = function() {
    var autocaptureConfig = this.mp.get_config(AUTOCAPTURE_CONFIG_KEY);
    if (!autocaptureConfig) {
        // Autocapture is completely off
        return {};
    } else if (_.isObject(autocaptureConfig)) {
        return _.extend({}, CONFIG_DEFAULTS, autocaptureConfig);
    } else {
        // Autocapture config is non-object truthy value, return default
        return CONFIG_DEFAULTS;
    }
};

Autocapture.prototype.getConfig = function(key) {
    return this.getFullConfig()[key];
};

Autocapture.prototype.currentUrlBlocked = function() {
    var i;
    var currentUrl = _.info.currentUrl();

    var allowUrlRegexes = this.getConfig(CONFIG_ALLOW_URL_REGEXES) || [];
    if (allowUrlRegexes.length) {
        // we're using an allowlist, only track if current URL matches
        var allowed = false;
        for (i = 0; i < allowUrlRegexes.length; i++) {
            var allowRegex = allowUrlRegexes[i];
            try {
                if (currentUrl.match(allowRegex)) {
                    allowed = true;
                    break;
                }
            } catch (err) {
                logger.critical('Error while checking block URL regex: ' + allowRegex, err);
                return true;
            }
        }
        if (!allowed) {
            // wasn't allowed by any regex
            return true;
        }
    }

    var blockUrlRegexes = this.getConfig(CONFIG_BLOCK_URL_REGEXES) || [];
    if (!blockUrlRegexes || !blockUrlRegexes.length) {
        return false;
    }

    for (i = 0; i < blockUrlRegexes.length; i++) {
        try {
            if (currentUrl.match(blockUrlRegexes[i])) {
                return true;
            }
        } catch (err) {
            logger.critical('Error while checking block URL regex: ' + blockUrlRegexes[i], err);
            return true;
        }
    }
    return false;
};

Autocapture.prototype.pageviewTrackingConfig = function() {
    // supports both autocapture config and old track_pageview config
    if (this.mp.get_config(AUTOCAPTURE_CONFIG_KEY)) {
        return this.getConfig(CONFIG_TRACK_PAGEVIEW);
    } else {
        return this.mp.get_config(LEGACY_PAGEVIEW_CONFIG_KEY);
    }
};

// helper for event handlers
Autocapture.prototype.trackDomEvent = function(ev, mpEventName) {
    if (this.currentUrlBlocked()) {
        return;
    }

    var isCapturedForHeatMap = this.mp.is_recording_heatmap_data() && (
        (mpEventName === MP_EV_CLICK && !this.getConfig(CONFIG_TRACK_CLICK)) ||
        (mpEventName === MP_EV_RAGE_CLICK && !this._getClickTrackingConfig(CONFIG_TRACK_RAGE_CLICK)) ||
        (mpEventName === MP_EV_DEAD_CLICK && !this._getClickTrackingConfig(CONFIG_TRACK_DEAD_CLICK))
    );

    var props = getPropsForDOMEvent(ev, {
        allowElementCallback: this.getConfig(CONFIG_ALLOW_ELEMENT_CALLBACK),
        allowSelectors: this.getConfig(CONFIG_ALLOW_SELECTORS),
        blockAttrs: this.getConfig(CONFIG_BLOCK_ATTRS),
        blockElementCallback: this.getConfig(CONFIG_BLOCK_ELEMENT_CALLBACK),
        blockSelectors: this.getConfig(CONFIG_BLOCK_SELECTORS),
        captureExtraAttrs: this.getConfig(CONFIG_CAPTURE_EXTRA_ATTRS),
        captureTextContent: this.getConfig(CONFIG_CAPTURE_TEXT_CONTENT),
        capturedForHeatMap: isCapturedForHeatMap,
    });
    if (props) {
        _.extend(props, DEFAULT_PROPS);
        this.mp.track(mpEventName, props);
    }
};

Autocapture.prototype.initPageListeners = function() {
    window.removeEventListener(EV_POPSTATE, this.listenerPopstate);
    window.removeEventListener(EV_HASHCHANGE, this.listenerHashchange);

    if (!this.pageviewTrackingConfig() && !this.getConfig(CONFIG_TRACK_PAGE_LEAVE) && !this.mp.get_config('record_heatmap_data')) {
        // These are all the configs that use these listeners
        return;
    }

    this.listenerPopstate = function() {
        window.dispatchEvent(new Event(EV_MP_LOCATION_CHANGE));
    };
    this.listenerHashchange = function() {
        window.dispatchEvent(new Event(EV_MP_LOCATION_CHANGE));
    };

    window.addEventListener(EV_POPSTATE, this.listenerPopstate);
    window.addEventListener(EV_HASHCHANGE, this.listenerHashchange);
    var nativePushState = window.history.pushState;
    if (typeof nativePushState === 'function') {
        window.history.pushState = function(state, unused, url) {
            nativePushState.call(window.history, state, unused, url);
            window.dispatchEvent(new Event(EV_MP_LOCATION_CHANGE));
        };
    }
    var nativeReplaceState = window.history.replaceState;
    if (typeof nativeReplaceState === 'function') {
        window.history.replaceState = function(state, unused, url) {
            nativeReplaceState.call(window.history, state, unused, url);
            window.dispatchEvent(new Event(EV_MP_LOCATION_CHANGE));
        };
    }
};

Autocapture.prototype._getClickTrackingConfig = function(configKey) {
    var config = this.getConfig(configKey);

    if (!config) {
        return null; // click tracking disabled
    }

    if (config === true) {
        return {}; // use defaults
    }

    if (typeof config === 'object') {
        return config; // use custom configuration
    }

    return {}; // fallback to defaults for any other truthy value
};

Autocapture.prototype._trackPageLeave = function(ev, currentUrl, currentScrollHeight) {
    if (this.hasTrackedScrollSession) {
        // User has navigated away already ending their impression.
        return;
    }

    if (!this.getConfig(CONFIG_TRACK_PAGE_LEAVE) && !this.mp.is_recording_heatmap_data()) {
        return;
    }

    this.hasTrackedScrollSession = true;
    var viewportHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    var scrollPercentage = Math.round(Math.max(this.maxScrollViewDepth - viewportHeight, 0) / (currentScrollHeight - viewportHeight) * 100);
    var foldLinePercentage = Math.round((viewportHeight / currentScrollHeight) * 100);
    if (currentScrollHeight <= viewportHeight) {
        // If the content fits within the viewport, consider it fully scrolled
        scrollPercentage = 100;
        foldLinePercentage = 100;
    }

    var props = _.extend({
        '$max_scroll_view_depth': this.maxScrollViewDepth,
        '$max_scroll_percentage': scrollPercentage,
        '$fold_line_percentage': foldLinePercentage,
        '$scroll_height':  currentScrollHeight,
        '$event_type': ev.type,
        '$current_url': currentUrl || _.info.currentUrl(),
        '$viewportHeight': viewportHeight, // This is the fold line
        '$viewportWidth':  Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
        '$captured_for_heatmap': this.mp.is_recording_heatmap_data()
    }, DEFAULT_PROPS);

    // Send with beacon transport to ensure event is sent before unload
    this.mp.track(MP_EV_PAGE_LEAVE, props, {transport: 'sendBeacon'});
};

Autocapture.prototype._initScrollDepthTracking = function() {
    window.removeEventListener(EV_SCROLL, this.listenerScrollDepth);
    window.removeEventListener(EV_SCROLLEND, this.listenerScrollDepth);

    if (!this.mp.get_config('record_heatmap_data')) {
        return;
    }

    logger.log('Initializing scroll depth tracking');

    this.maxScrollViewDepth = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

    var updateScrollDepth = function() {
        if (this.currentUrlBlocked()) {
            return;
        }
        var scrollViewHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0) + window.scrollY;
        if (scrollViewHeight > this.maxScrollViewDepth) {
            this.maxScrollViewDepth = scrollViewHeight;
        }
        this.previousScrollHeight = document.body.scrollHeight;
    }.bind(this);

    var scrollEndPolyfill = getPolyfillScrollEndFunction(updateScrollDepth);
    this.listenerScrollDepth = scrollEndPolyfill.listener;
    window.addEventListener(scrollEndPolyfill.eventType, this.listenerScrollDepth);
};

Autocapture.prototype.initClickTracking = function() {
    window.removeEventListener(EV_CLICK, this.listenerClick);

    if (!this.getConfig(CONFIG_TRACK_CLICK) && !this.mp.get_config('record_heatmap_data')) {
        return;
    }
    logger.log('Initializing click tracking');

    this.listenerClick = function(ev) {
        if (!this.getConfig(CONFIG_TRACK_CLICK) && !this.mp.is_recording_heatmap_data()) {
            return;
        }
        this.trackDomEvent(ev, MP_EV_CLICK);
    }.bind(this);
    window.addEventListener(EV_CLICK, this.listenerClick);
};

Autocapture.prototype.initDeadClickTracking = function() {
    var deadClickConfig = this._getClickTrackingConfig(CONFIG_TRACK_DEAD_CLICK);

    if (!deadClickConfig && !this.mp.get_config('record_heatmap_data')) {
        this.stopDeadClickTracking();
        return;
    }

    logger.log('Initializing dead click tracking');
    if (!this._deadClickTracker) {
        this._deadClickTracker = new DeadClickTracker(function(deadClickEvent) {
            this.trackDomEvent(deadClickEvent, MP_EV_DEAD_CLICK);
        }.bind(this));
        this._deadClickTracker.startTracking();
    }

    if (!this.listenerDeadClick) {
        this.listenerDeadClick = function(ev) {
            var currentDeadClickConfig = this._getClickTrackingConfig(CONFIG_TRACK_DEAD_CLICK);
            if (!currentDeadClickConfig && !this.mp.is_recording_heatmap_data()) {
                return;
            }
            if (this.currentUrlBlocked()) {
                return;
            }
            // Normalize config to ensure timeout_ms is always set
            var normalizedConfig = currentDeadClickConfig || {};
            if (!normalizedConfig['timeout_ms']) {
                normalizedConfig['timeout_ms'] = DEFAULT_DEAD_CLICK_TIMEOUT_MS;
            }
            this._deadClickTracker.trackClick(ev, normalizedConfig);
        }.bind(this);
        window.addEventListener(EV_CLICK, this.listenerDeadClick);
    }
};

Autocapture.prototype.initInputTracking = function() {
    window.removeEventListener(EV_CHANGE, this.listenerChange);

    if (!this.getConfig(CONFIG_TRACK_INPUT)) {
        return;
    }
    logger.log('Initializing input tracking');

    this.listenerChange = function(ev) {
        if (!this.getConfig(CONFIG_TRACK_INPUT)) {
            return;
        }
        this.trackDomEvent(ev, MP_EV_INPUT);
    }.bind(this);
    window.addEventListener(EV_CHANGE, this.listenerChange);
};

Autocapture.prototype.initPageviewTracking = function() {
    window.removeEventListener(EV_MP_LOCATION_CHANGE, this.listenerLocationchange);

    if (!this.pageviewTrackingConfig()) {
        return;
    }
    logger.log('Initializing pageview tracking');

    var previousTrackedUrl = '';
    var tracked = false;
    if (!this.currentUrlBlocked()) {
        tracked = this.mp.track_pageview(DEFAULT_PROPS);
    }
    if (tracked) {
        previousTrackedUrl = _.info.currentUrl();
    }

    this.listenerLocationchange = safewrap(function() {
        if (this.currentUrlBlocked()) {
            return;
        }

        var currentUrl = _.info.currentUrl();
        var shouldTrack = false;
        var didPathChange = currentUrl.split('#')[0].split('?')[0] !== previousTrackedUrl.split('#')[0].split('?')[0];
        var trackPageviewOption = this.pageviewTrackingConfig();
        if (trackPageviewOption === PAGEVIEW_OPTION_FULL_URL) {
            shouldTrack = currentUrl !== previousTrackedUrl;
        } else if (trackPageviewOption === PAGEVIEW_OPTION_URL_WITH_PATH_AND_QUERY_STRING) {
            shouldTrack = currentUrl.split('#')[0] !== previousTrackedUrl.split('#')[0];
        } else if (trackPageviewOption === PAGEVIEW_OPTION_URL_WITH_PATH) {
            shouldTrack = didPathChange;
        }

        if (shouldTrack) {
            var tracked = this.mp.track_pageview(DEFAULT_PROPS);
            if (tracked) {
                previousTrackedUrl = currentUrl;
            }
            if (didPathChange) {
                this.lastScrollCheckpoint = 0;
                logger.log('Path change: re-initializing scroll depth checkpoints');
            }
        }
    }.bind(this));
    window.addEventListener(EV_MP_LOCATION_CHANGE, this.listenerLocationchange);
};

Autocapture.prototype.initRageClickTracking = function() {
    window.removeEventListener(EV_CLICK, this.listenerRageClick);

    var rageClickConfig = this._getClickTrackingConfig(CONFIG_TRACK_RAGE_CLICK);
    if (!rageClickConfig && !this.mp.get_config('record_heatmap_data')) {
        return;
    }

    logger.log('Initializing rage click tracking');
    if (!this._rageClickTracker) {
        this._rageClickTracker = new RageClickTracker();
    }

    this.listenerRageClick = function(ev) {
        var currentRageClickConfig = this._getClickTrackingConfig(CONFIG_TRACK_RAGE_CLICK);
        if (!currentRageClickConfig && !this.mp.is_recording_heatmap_data()) {
            return;
        }

        if (this.currentUrlBlocked()) {
            return;
        }

        if (this._rageClickTracker.isRageClick(ev, currentRageClickConfig)) {
            this.trackDomEvent(ev, MP_EV_RAGE_CLICK);
        }
    }.bind(this);
    window.addEventListener(EV_CLICK, this.listenerRageClick);
};

Autocapture.prototype.initScrollTracking = function() {
    window.removeEventListener(EV_SCROLLEND, this.listenerScroll);
    window.removeEventListener(EV_SCROLL, this.listenerScroll);


    if (!this.getConfig(CONFIG_TRACK_SCROLL)) {
        return;
    }
    logger.log('Initializing scroll tracking');
    this.lastScrollCheckpoint = 0;

    var scrollTrackFunction = function() {
        if (!this.getConfig(CONFIG_TRACK_SCROLL)) {
            return;
        }
        if (this.currentUrlBlocked()) {
            return;
        }

        var shouldTrack = this.getConfig(CONFIG_SCROLL_CAPTURE_ALL);
        var scrollCheckpoints = (this.getConfig(CONFIG_SCROLL_CHECKPOINTS) || [])
            .slice()
            .sort(function(a, b) { return a - b; });

        var scrollTop = window.scrollY;
        var props = _.extend({'$scroll_top': scrollTop}, DEFAULT_PROPS);
        try {
            var scrollHeight = document.body.scrollHeight;
            var scrollPercentage = Math.round((scrollTop / (scrollHeight - window.innerHeight)) * 100);
            props['$scroll_height'] = scrollHeight;
            props['$scroll_percentage'] = scrollPercentage;
            if (scrollPercentage > this.lastScrollCheckpoint) {
                for (var i = 0; i < scrollCheckpoints.length; i++) {
                    var checkpoint = scrollCheckpoints[i];
                    if (
                        scrollPercentage >= checkpoint &&
                        this.lastScrollCheckpoint < checkpoint
                    ) {
                        props['$scroll_checkpoint'] = checkpoint;
                        this.lastScrollCheckpoint = checkpoint;
                        shouldTrack = true;
                    }
                }
            }
        } catch (err) {
            logger.critical('Error while calculating scroll percentage', err);
        }
        if (shouldTrack) {
            this.mp.track(MP_EV_SCROLL, props);
        }
    }.bind(this);

    var scrollEndPolyfill = getPolyfillScrollEndFunction(scrollTrackFunction);
    this.listenerScroll = scrollEndPolyfill.listener;
    window.addEventListener(scrollEndPolyfill.eventType, this.listenerScroll);
};

Autocapture.prototype.initSubmitTracking = function() {
    window.removeEventListener(EV_SUBMIT, this.listenerSubmit);

    if (!this.getConfig(CONFIG_TRACK_SUBMIT)) {
        return;
    }
    logger.log('Initializing submit tracking');

    this.listenerSubmit = function(ev) {
        if (!this.getConfig(CONFIG_TRACK_SUBMIT)) {
            return;
        }
        this.trackDomEvent(ev, MP_EV_SUBMIT);
    }.bind(this);
    window.addEventListener(EV_SUBMIT, this.listenerSubmit);
};

Autocapture.prototype.initPageLeaveTracking = function() {
    // Capture page_leave both when the user navigates away from the page (visibilitychange) as well
    // as when they navigate to a different page within the SPA (popstate/pushstate/hashchange).
    document.removeEventListener(EV_VISIBILITYCHANGE, this.listenerPageLeaveVisibilitychange);
    window.removeEventListener(EV_MP_LOCATION_CHANGE, this.listenerPageLeaveLocationchange);
    window.removeEventListener(EV_LOAD, this.listenerPageLoad);

    if (!this.getConfig(CONFIG_TRACK_PAGE_LEAVE) && !this.mp.get_config('record_heatmap_data')) {
        return;
    }

    logger.log('Initializing page visibility tracking.');
    this._initScrollDepthTracking();
    var previousTrackedUrl = _.info.currentUrl();

    // Initialize previousScrollHeight on `load` which handles async loading
    // https://developer.mozilla.org/en-US/docs/Web/API/Window/load_event
    this.listenerPageLoad = function() {
        this.previousScrollHeight = document.body.scrollHeight;
    }.bind(this);
    window.addEventListener(EV_LOAD, this.listenerPageLoad);

    // Track page navigation events similar to how initPageviewTracking does it
    this.listenerPageLeaveLocationchange = safewrap(function(ev) {
        if (this.currentUrlBlocked()) {
            return;
        }

        var currentUrl = _.info.currentUrl();
        // Track all URL changes including query string or fragment changes as separate scroll sessions
        var shouldTrack = currentUrl !== previousTrackedUrl;

        if (shouldTrack) {
            this._trackPageLeave(ev, previousTrackedUrl, this.previousScrollHeight);
            previousTrackedUrl = currentUrl;
            // Fragment navigation should call scroll(end) and trigger listener, don't add window.scrollY here.
            this.maxScrollViewDepth = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
            this.previousScrollHeight = document.body.scrollHeight;
            this.hasTrackedScrollSession = false;
        }
    }.bind(this));
    window.addEventListener(EV_MP_LOCATION_CHANGE, this.listenerPageLeaveLocationchange);

    this.listenerPageLeaveVisibilitychange = function(ev) {
        if (document.hidden) {
            this._trackPageLeave(ev, previousTrackedUrl, this.previousScrollHeight);
        }
    }.bind(this);
    document.addEventListener(EV_VISIBILITYCHANGE, this.listenerPageLeaveVisibilitychange);
};

Autocapture.prototype.stopDeadClickTracking = function() {
    if (this.listenerDeadClick) {
        window.removeEventListener(EV_CLICK, this.listenerDeadClick);
        this.listenerDeadClick = null;
    }

    if (this._deadClickTracker) {
        this._deadClickTracker.stopTracking();
        this._deadClickTracker = null;
    }
};

// TODO integrate error_reporter from mixpanel instance
safewrapClass(Autocapture);

export { Autocapture };
