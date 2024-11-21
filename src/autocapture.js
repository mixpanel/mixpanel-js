import { _, window } from './utils';

var AUTOCAPTURE_CONFIG_KEY = 'autocapture';
var LEGACY_PAGEVIEW_CONFIG_KEY = 'track_pageview';

var CONFIG_TRACK_CLICK = 'click';
var CONFIG_TRACK_PAGEVIEW = 'pageview';

var EV_CHANGE = 'change';
var EV_CLICK = 'click';
var EV_MP_LOCATION_CHANGE = 'mp_locationchange';
var EV_SUBMIT = 'submit';

var CLICK_EVENT_PROPS = [
    'clientX', 'clientY',
    'offsetX', 'offsetY',
    'pageX', 'pageY',
    'screenX', 'screenY',
    'x', 'y'
];

/**
 * Autocapture: manages automatic event tracking
 * @constructor
 */
var Autocapture = function(mp) {
    this.mp = mp;
};

Autocapture.prototype.init = function() {
    // TODO feature detect and eject early if not supported

    this.initPageviewTracking();
    this.initClickTracking();
};

Autocapture.prototype.getConfig = function(key) {
    var autocaptureConfig = this.mp.get_config(AUTOCAPTURE_CONFIG_KEY);
    return autocaptureConfig[key];
};

Autocapture.prototype.pageviewTrackingConfig = function() {
    // supports both autocapture config and old track_pageview config
    var autocaptureConfig = this.mp.get_config(AUTOCAPTURE_CONFIG_KEY);
    if (CONFIG_TRACK_PAGEVIEW in autocaptureConfig) {
        return autocaptureConfig[CONFIG_TRACK_PAGEVIEW];
    } else {
        return this.mp.get_config(LEGACY_PAGEVIEW_CONFIG_KEY);
    }
};

Autocapture.prototype.initClickTracking = function() {
    window.removeEventListener(EV_CLICK, this.listenerClick);

    if (!this.getConfig(CONFIG_TRACK_CLICK)) {
        return;
    }

    // TODO try/catch
    this.listenerClick = window.addEventListener(EV_CLICK, function(ev) {
        var props = getPropsForDOMEvent(ev);
        if (props) {
            _.each(CLICK_EVENT_PROPS, function(prop) {
                if (prop in ev) {
                    props['$' + prop] = ev[prop];
                }
            });
            // TODO actually track the event
            window.console.log('$mp_click', ev, props);
        }
    }.bind(this));
};

Autocapture.prototype.initPageviewTracking = function() {
    // TODO remove any existing listeners before initializing

    if (!this.pageviewTrackingConfig()) {
        return;
    }

    var previousTrackedUrl = '';
    var tracked = this.mp.track_pageview();
    if (tracked) {
        previousTrackedUrl = _.info.currentUrl();
    }

    window.addEventListener('popstate', function() {
        window.dispatchEvent(new Event(EV_MP_LOCATION_CHANGE));
    });
    window.addEventListener('hashchange', function() {
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
    window.addEventListener(EV_MP_LOCATION_CHANGE, function() {
        var currentUrl = _.info.currentUrl();
        var shouldTrack = false;
        var trackPageviewOption = this.pageviewTrackingConfig();
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

// stateless utils
// mostly from https://github.com/mixpanel/mixpanel-js/blob/989ada50f518edab47b9c4fd9535f9fbd5ec5fc0/src/autotrack-utils.js

/*
 * Get the className of an element, accounting for edge cases where element.className is an object
 * @param {Element} el - element to get the className of
 * @returns {string} the element's class
 */
function getClassName(el) {
    switch(typeof el.className) {
        case 'string':
            return el.className;
        case 'object': // handle cases where className might be SVGAnimatedString or some other type
            return el.className.baseVal || el.getAttribute('class') || '';
        default: // future proof
            return '';
    }
}

function getPreviousElementSibling(el) {
    if (el.previousElementSibling) {
        return el.previousElementSibling;
    } else {
        do {
            el = el.previousSibling;
        } while (el && !isElementNode(el));
        return el;
    }
}

function getPropertiesFromElement(el) {
    var props = {
        'classes': getClassName(el).split(' '),
        'tag_name': el.tagName.toLowerCase()
    };

    // NOT TRACKING ANY ARBITRARY ATTRIBUTES
    // if (shouldTrackElement(el)) {
    //     _.each(el.attributes, function(attr) {
    //         if (shouldTrackValue(attr.value)) {
    //             props['attr__' + attr.name] = attr.value;
    //         }
    //     });
    // }

    var nthChild = 1;
    var nthOfType = 1;
    var currentElem = el;
    while (currentElem = getPreviousElementSibling(currentElem)) { // eslint-disable-line no-cond-assign
        nthChild++;
        if (currentElem.tagName === el.tagName) {
            nthOfType++;
        }
    }
    props['nth_child'] = nthChild;
    props['nth_of_type'] = nthOfType;

    return props;
}

function getPropsForDOMEvent(ev) {
    var props = null;

    var target = typeof ev.target === 'undefined' ? ev.srcElement : ev.target;
    if (isTextNode(target)) { // defeat Safari bug (see: http://www.quirksmode.org/js/events_properties.html)
        target = target.parentNode;
    }

    if (shouldTrackDomEvent(target, ev)) {
        var targetElementList = [target];
        var curEl = target;
        while (curEl.parentNode && !isTag(curEl, 'body')) {
            targetElementList.push(curEl.parentNode);
            curEl = curEl.parentNode;
        }

        var elementsJson = [];
        var href, explicitNoTrack = false;
        _.each(targetElementList, function(el) {
            var shouldTrackEl = shouldTrackElement(el);

            // if the element or a parent element is an anchor tag
            // include the href as a property
            if (el.tagName.toLowerCase() === 'a') {
                href = el.getAttribute('href');
                href = shouldTrackEl && shouldTrackValue(href) && href;
            }

            // allow users to programmatically prevent tracking of elements by adding class 'mp-no-track'
            var classes = getClassName(el).split(' ');
            if (_.includes(classes, 'mp-no-track')) {
                explicitNoTrack = true;
            }

            elementsJson.push(getPropertiesFromElement(el));
        }, this);

        if (!explicitNoTrack) {
            props = {
                '$event_type': ev.type,
                '$host': window.location.host,
                '$pathname': window.location.pathname,
                '$elements':  elementsJson,
                '$el_attr__href': href
                // TODO add target props
            };
            if (ev.type === EV_CLICK) {
                var realTarget = guessRealClickTarget(ev).tagName;
                if (realTarget) {
                    props['$click_target'] = realTarget.toLowerCase();
                }
            }
        }
    }

    return props;
}

function guessRealClickTarget(ev) {
    var target = ev.target;
    var composedPath = ev.composedPath();
    for (var i = 0; i < composedPath.length; i++) {
        var node = composedPath[i];
        var tagName = node.tagName && node.tagName.toLowerCase();
        if (
            tagName === 'a' ||
            tagName === 'button' ||
            tagName === 'input' ||
            tagName === 'select' ||
            (node.getAttribute && node.getAttribute('role') === 'button')
        ) {
            target = node;
            break;
        }
        if (node === target) {
            break;
        }
    }
    return target;
}

/*
 * Check whether an element has nodeType Node.ELEMENT_NODE
 * @param {Element} el - element to check
 * @returns {boolean} whether el is of the correct nodeType
 */
function isElementNode(el) {
    return el && el.nodeType === 1; // Node.ELEMENT_NODE - use integer constant for browser portability
}

/*
 * Check whether an element is of a given tag type.
 * Due to potential reference discrepancies (such as the webcomponents.js polyfill),
 * we want to match tagNames instead of specific references because something like
 * element === document.body won't always work because element might not be a native
 * element.
 * @param {Element} el - element to check
 * @param {string} tag - tag name (e.g., "div")
 * @returns {boolean} whether el is of the given tag type
 */
function isTag(el, tag) {
    return el && el.tagName && el.tagName.toLowerCase() === tag.toLowerCase();
}

/*
 * Check whether an element has nodeType Node.TEXT_NODE
 * @param {Element} el - element to check
 * @returns {boolean} whether el is of the correct nodeType
 */
function isTextNode(el) {
    return el && el.nodeType === 3; // Node.TEXT_NODE - use integer constant for browser portability
}

/*
 * Check whether a DOM event should be "tracked" or if it may contain sentitive data
 * using a variety of heuristics.
 * @param {Element} el - element to check
 * @param {Event} ev - event to check
 * @returns {boolean} whether the event should be tracked
 */
function shouldTrackDomEvent(el, ev) {
    if (!el || isTag(el, 'html') || !isElementNode(el)) {
        return false;
    }
    var tag = el.tagName.toLowerCase();
    switch (tag) {
        case 'form':
            return ev.type === EV_SUBMIT;
        case 'input':
            if (['button', 'submit'].indexOf(el.getAttribute('type')) === -1) {
                return ev.type === EV_CHANGE;
            } else {
                return ev.type === EV_CLICK;
            }
        case 'select':
        case 'textarea':
            return ev.type === EV_CHANGE;
        default:
            return ev.type === EV_CLICK;
    }
}

/*
 * Check whether a DOM element should be "tracked" or if it may contain sentitive data
 * using a variety of heuristics.
 * @param {Element} el - element to check
 * @returns {boolean} whether the element should be tracked
 */
function shouldTrackElement(el) {
    for (var curEl = el; curEl.parentNode && !isTag(curEl, 'body'); curEl = curEl.parentNode) {
        var classes = getClassName(curEl).split(' ');
        if (_.includes(classes, 'mp-sensitive') || _.includes(classes, 'mp-no-track')) {
            return false;
        }
    }

    if (_.includes(getClassName(el).split(' '), 'mp-include')) {
        return true;
    }

    // don't send data from inputs or similar elements since there will always be
    // a risk of clientside javascript placing sensitive data in attributes
    if (
        isTag(el, 'input') ||
        isTag(el, 'select') ||
        isTag(el, 'textarea') ||
        el.getAttribute('contenteditable') === 'true'
    ) {
        return false;
    }

    // don't include hidden or password fields
    var type = el.type || '';
    if (typeof type === 'string') { // it's possible for el.type to be a DOM element if el is a form with a child input[name="type"]
        switch(type.toLowerCase()) {
            case 'hidden':
                return false;
            case 'password':
                return false;
        }
    }

    // filter out data from fields that look like sensitive fields
    var name = el.name || el.id || '';
    if (typeof name === 'string') { // it's possible for el.name or el.id to be a DOM element if el is a form with a child input[name="name"]
        var sensitiveNameRegex = /^cc|cardnum|ccnum|creditcard|csc|cvc|cvv|exp|pass|pwd|routing|seccode|securitycode|securitynum|socialsec|socsec|ssn/i;
        if (sensitiveNameRegex.test(name.replace(/[^a-zA-Z0-9]/g, ''))) {
            return false;
        }
    }

    return true;
}


/*
 * Check whether a string value should be "tracked" or if it may contain sentitive data
 * using a variety of heuristics.
 * @param {string} value - string value to check
 * @returns {boolean} whether the element should be tracked
 */
function shouldTrackValue(value) {
    if (value === null || _.isUndefined(value)) {
        return false;
    }

    if (typeof value === 'string') {
        value = _.trim(value);

        // check to see if input value looks like a credit card number
        // see: https://www.safaribooksonline.com/library/view/regular-expressions-cookbook/9781449327453/ch04s20.html
        var ccRegex = /^(?:(4[0-9]{12}(?:[0-9]{3})?)|(5[1-5][0-9]{14})|(6(?:011|5[0-9]{2})[0-9]{12})|(3[47][0-9]{13})|(3(?:0[0-5]|[68][0-9])[0-9]{11})|((?:2131|1800|35[0-9]{3})[0-9]{11}))$/;
        if (ccRegex.test((value || '').replace(/[- ]/g, ''))) {
            return false;
        }

        // check to see if input value looks like a social security number
        var ssnRegex = /(^\d{3}-?\d{2}-?\d{4}$)/;
        if (ssnRegex.test(value)) {
            return false;
        }
    }

    return true;
}

export { Autocapture };
