import { _, document, safewrap, safewrapClass } from '../utils';
import { window } from '../window';
import {
    getPropsForDOMEvent, logger, minDOMApisSupported,
    EV_CHANGE, EV_CLICK, EV_HASHCHANGE, EV_MP_LOCATION_CHANGE, EV_POPSTATE,
    EV_SCROLL, EV_SUBMIT
} from './utils';

var AUTOCAPTURE_CONFIG_KEY = 'autocapture';
var LEGACY_PAGEVIEW_CONFIG_KEY = 'track_pageview';

var PAGEVIEW_OPTION_FULL_URL = 'full-url';
var PAGEVIEW_OPTION_URL_WITH_PATH_AND_QUERY_STRING = 'url-with-path-and-query-string';
var PAGEVIEW_OPTION_URL_WITH_PATH = 'url-with-path';

var CONFIG_BLOCK_SELECTORS = 'block_selectors';
var CONFIG_BLOCK_URL_REGEXES = 'block_url_regexes';
var CONFIG_CAPTURE_TEXT_CONTENT = 'capture_text_content';
var CONFIG_TRACK_CLICK = 'click';
var CONFIG_TRACK_INPUT = 'input';
var CONFIG_TRACK_PAGEVIEW = 'pageview';
var CONFIG_TRACK_SCROLL = 'scroll';
var CONFIG_TRACK_SUBMIT = 'submit';

var CONFIG_DEFAULTS = {};
CONFIG_DEFAULTS[CONFIG_CAPTURE_TEXT_CONTENT] = false;
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
    var blockUrlRegexes = this.getConfig(CONFIG_BLOCK_URL_REGEXES) || [];
    if (!blockUrlRegexes || !blockUrlRegexes.length) {
        return false;
    }

    var currentUrl = _.info.currentUrl();
    for (var i = 0; i < blockUrlRegexes.length; i++) {
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

    var props = getPropsForDOMEvent(
        ev,
        this.getConfig(CONFIG_BLOCK_SELECTORS),
        this.getConfig(CONFIG_CAPTURE_TEXT_CONTENT)
    );
    if (props) {
        _.extend(props, DEFAULT_PROPS);
        this.mp.track(mpEventName, props);
    }
};

Autocapture.prototype.initClickTracking = function() {
    window.removeEventListener(EV_CLICK, this.listenerClick);

    if (!this.getConfig(CONFIG_TRACK_CLICK)) {
        return;
    }
    logger.log('Initializing click tracking');

    this.listenerClick = window.addEventListener(EV_CLICK, function(ev) {
        if (!this.getConfig(CONFIG_TRACK_CLICK)) {
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
    var tracked = this.mp.track_pageview(DEFAULT_PROPS);
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
        var currentUrl = _.info.currentUrl();
        var shouldTrack = false;
        var trackPageviewOption = this.pageviewTrackingConfig();
        if (trackPageviewOption === PAGEVIEW_OPTION_FULL_URL) {
            shouldTrack = currentUrl !== previousTrackedUrl;
        } else if (trackPageviewOption === PAGEVIEW_OPTION_URL_WITH_PATH_AND_QUERY_STRING) {
            shouldTrack = currentUrl.split('#')[0] !== previousTrackedUrl.split('#')[0];
        } else if (trackPageviewOption === PAGEVIEW_OPTION_URL_WITH_PATH) {
            shouldTrack = currentUrl.split('#')[0].split('?')[0] !== previousTrackedUrl.split('#')[0].split('?')[0];
        }

        if (shouldTrack) {
            var tracked = this.mp.track_pageview(DEFAULT_PROPS);
            if (tracked) {
                previousTrackedUrl = currentUrl;
            }
        }
    }.bind(this)));
};

Autocapture.prototype.initScrollTracking = function() {
    window.removeEventListener(EV_SCROLL, this.listenerScroll);

    if (!this.getConfig(CONFIG_TRACK_SCROLL)) {
        return;
    }
    logger.log('Initializing scroll tracking');

    this.listenerScroll = window.addEventListener(EV_SCROLL, safewrap(function() {
        if (!this.getConfig(CONFIG_TRACK_SCROLL)) {
            return;
        }
        if (this.currentUrlBlocked()) {
            return;
        }

        var scrollTop = window.scrollY;
        var props = _.extend({'$scroll_top': scrollTop}, DEFAULT_PROPS);
        try {
            var scrollHeight = document.body.scrollHeight;
            var scrollPercentage = Math.round((scrollTop / (scrollHeight - window.innerHeight)) * 100);
            props['$scroll_height'] = scrollHeight;
            props['$scroll_percentage'] = scrollPercentage;
        } catch (err) {
            logger.critical('Error while calculating scroll percentage', err);
        }
        this.mp.track(MP_EV_SCROLL, props);
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

safewrapClass(Autocapture);

export { Autocapture };
