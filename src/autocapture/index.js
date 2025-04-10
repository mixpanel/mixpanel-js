import { _, document, safewrap, safewrapClass } from '../utils';
import { window } from '../window';
import {
    getPropsForDOMEvent, logger, minDOMApisSupported,
    EV_CHANGE, EV_CLICK, EV_HASHCHANGE, EV_MP_LOCATION_CHANGE, EV_POPSTATE,
    EV_SCROLLEND, EV_SUBMIT
} from './utils';

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
var CONFIG_TRACK_INPUT = 'input';
var CONFIG_TRACK_PAGEVIEW = 'pageview';
var CONFIG_TRACK_SCROLL = 'scroll';
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
CONFIG_DEFAULTS[CONFIG_TRACK_INPUT] = true;
CONFIG_DEFAULTS[CONFIG_TRACK_PAGEVIEW] = PAGEVIEW_OPTION_FULL_URL;
CONFIG_DEFAULTS[CONFIG_TRACK_SCROLL] = true;
CONFIG_DEFAULTS[CONFIG_TRACK_SUBMIT] = true;

var DEFAULT_PROPS = {
    '$mp_autocapture': true
};

var MP_EV_CLICK = '$mp_click';
var MP_EV_INPUT = '$mp_input_change';
var MP_EV_SCROLL = '$mp_scroll';
var MP_EV_SUBMIT = '$mp_submit';

/**
 * Autocapture: manages automatic event tracking
 * @constructor
 */
var Autocapture = function(mp) {
    this.mp = mp;
};

Autocapture.prototype.init = function() {
    if (!minDOMApisSupported()) {
        logger.critical('Autocapture unavailable: missing required DOM APIs');
        return;
    }

    this.initPageviewTracking();
    this.initClickTracking();
    this.initInputTracking();
    this.initScrollTracking();
    this.initSubmitTracking();
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

    var props = getPropsForDOMEvent(ev, {
        allowElementCallback: this.getConfig(CONFIG_ALLOW_ELEMENT_CALLBACK),
        allowSelectors: this.getConfig(CONFIG_ALLOW_SELECTORS),
        blockAttrs: this.getConfig(CONFIG_BLOCK_ATTRS),
        blockElementCallback: this.getConfig(CONFIG_BLOCK_ELEMENT_CALLBACK),
        blockSelectors: this.getConfig(CONFIG_BLOCK_SELECTORS),
        captureExtraAttrs: this.getConfig(CONFIG_CAPTURE_EXTRA_ATTRS),
        captureTextContent: this.getConfig(CONFIG_CAPTURE_TEXT_CONTENT),
        capturedForHeatMap: mpEventName === MP_EV_CLICK && !this.getConfig(CONFIG_TRACK_CLICK) && this.mp.is_recording_heatmap_data(),
    });
    if (props) {
        _.extend(props, DEFAULT_PROPS);
        this.mp.track(mpEventName, props);
    }
};

Autocapture.prototype.initClickTracking = function() {
    window.removeEventListener(EV_CLICK, this.listenerClick);

    if (!this.getConfig(CONFIG_TRACK_CLICK) && !this.mp.get_config('record_heatmap_data')) {
        return;
    }
    logger.log('Initializing click tracking');

    this.listenerClick = window.addEventListener(EV_CLICK, function(ev) {
        if (!this.getConfig(CONFIG_TRACK_CLICK) && !this.mp.is_recording_heatmap_data()) {
            return;
        }
        this.trackDomEvent(ev, MP_EV_CLICK);
    }.bind(this));
};

Autocapture.prototype.initInputTracking = function() {
    window.removeEventListener(EV_CHANGE, this.listenerChange);

    if (!this.getConfig(CONFIG_TRACK_INPUT)) {
        return;
    }
    logger.log('Initializing input tracking');

    this.listenerChange = window.addEventListener(EV_CHANGE, function(ev) {
        if (!this.getConfig(CONFIG_TRACK_INPUT)) {
            return;
        }
        this.trackDomEvent(ev, MP_EV_INPUT);
    }.bind(this));
};

Autocapture.prototype.initPageviewTracking = function() {
    window.removeEventListener(EV_POPSTATE, this.listenerPopstate);
    window.removeEventListener(EV_HASHCHANGE, this.listenerHashchange);
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

    this.listenerPopstate = window.addEventListener(EV_POPSTATE, function() {
        window.dispatchEvent(new Event(EV_MP_LOCATION_CHANGE));
    });
    this.listenerHashchange = window.addEventListener(EV_HASHCHANGE, function() {
        window.dispatchEvent(new Event(EV_MP_LOCATION_CHANGE));
    });
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
    this.listenerLocationchange = window.addEventListener(EV_MP_LOCATION_CHANGE, safewrap(function() {
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
    }.bind(this)));
};

Autocapture.prototype.initScrollTracking = function() {
    window.removeEventListener(EV_SCROLLEND, this.listenerScroll);

    if (!this.getConfig(CONFIG_TRACK_SCROLL)) {
        return;
    }
    logger.log('Initializing scroll tracking');
    this.lastScrollCheckpoint = 0;

    this.listenerScroll = window.addEventListener(EV_SCROLLEND, safewrap(function() {
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
    }.bind(this)));
};

Autocapture.prototype.initSubmitTracking = function() {
    window.removeEventListener(EV_SUBMIT, this.listenerSubmit);

    if (!this.getConfig(CONFIG_TRACK_SUBMIT)) {
        return;
    }
    logger.log('Initializing submit tracking');

    this.listenerSubmit = window.addEventListener(EV_SUBMIT, function(ev) {
        if (!this.getConfig(CONFIG_TRACK_SUBMIT)) {
            return;
        }
        this.trackDomEvent(ev, MP_EV_SUBMIT);
    }.bind(this));
};

// TODO integrate error_reporter from mixpanel instance
safewrapClass(Autocapture);

export { Autocapture };
