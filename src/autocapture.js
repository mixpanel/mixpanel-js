import { _ } from './utils';

var CONFIG_TRACK_PAGEVIEW = 'track_pageview';

/**
 * Autocapture: manages automatic event tracking
 * @constructor
 */
var Autocapture = function(mp) {
    this.mp = mp;
};

Autocapture.prototype.init = function() {
    this.initPageviewTracking();
};

Autocapture.prototype.getConfig = function(key) {
    return this.mp.get_config(key);
};

Autocapture.prototype.initPageviewTracking = function() {
    // TODO remove any existing listeners before initializing

    if (!this.getConfig(CONFIG_TRACK_PAGEVIEW)) {
        return;
    }

    var previousTrackedUrl = '';
    var tracked = this.mp.track_pageview();
    if (tracked) {
        previousTrackedUrl = _.info.currentUrl();
    }

    window.addEventListener('popstate', function() {
        window.dispatchEvent(new Event('mp_locationchange'));
    });
    window.addEventListener('hashchange', function() {
        window.dispatchEvent(new Event('mp_locationchange'));
    });
    var nativePushState = window.history.pushState;
    if (typeof nativePushState === 'function') {
        window.history.pushState = function(state, unused, url) {
            nativePushState.call(window.history, state, unused, url);
            window.dispatchEvent(new Event('mp_locationchange'));
        };
    }
    var nativeReplaceState = window.history.replaceState;
    if (typeof nativeReplaceState === 'function') {
        window.history.replaceState = function(state, unused, url) {
            nativeReplaceState.call(window.history, state, unused, url);
            window.dispatchEvent(new Event('mp_locationchange'));
        };
    }
    window.addEventListener('mp_locationchange', function() {
        var currentUrl = _.info.currentUrl();
        var shouldTrack = false;
        var trackPageviewOption = this.getConfig(CONFIG_TRACK_PAGEVIEW);
        if (trackPageviewOption === 'full-url') {
            shouldTrack = currentUrl !== previousTrackedUrl;
        } else if (trackPageviewOption === 'url-with-path-and-query-string') {
            shouldTrack = currentUrl.split('#')[0] !== previousTrackedUrl.split('#')[0];
        } else if (trackPageviewOption === 'url-with-path') {
            shouldTrack = currentUrl.split('#')[0].split('?')[0] !== previousTrackedUrl.split('#')[0].split('?')[0];
        }

        if (shouldTrack) {
            var tracked = this.mp.track_pageview();
            if (tracked) {
                previousTrackedUrl = currentUrl;
            }
        }
    }.bind(this));
};

export { Autocapture };
