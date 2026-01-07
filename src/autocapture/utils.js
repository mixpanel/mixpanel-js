// stateless utils
// mostly from https://github.com/mixpanel/mixpanel-js/blob/989ada50f518edab47b9c4fd9535f9fbd5ec5fc0/src/autotrack-utils.js

import { _, console_with_prefix, document, safewrap } from '../utils'; // eslint-disable-line camelcase
import { window } from '../window';

var EV_CHANGE = 'change';
var EV_CLICK = 'click';
var EV_HASHCHANGE = 'hashchange';
var EV_INPUT = 'input';
var EV_LOAD = 'load';
var EV_MP_LOCATION_CHANGE = 'mp_locationchange';
var EV_POPSTATE = 'popstate';
// TODO scrollend isn't available in Safari: document or polyfill?
var EV_SCROLLEND = 'scrollend';
var EV_SCROLL = 'scroll';
var EV_SELECT = 'select';
var EV_SUBMIT = 'submit';
var EV_TOGGLE = 'toggle';
var EV_VISIBILITYCHANGE = 'visibilitychange';

var CLICK_EVENT_PROPS = [
    'clientX', 'clientY',
    'offsetX', 'offsetY',
    'pageX', 'pageY',
    'screenX', 'screenY',
    'x', 'y'
];
var OPT_IN_CLASSES = ['mp-include'];
var OPT_OUT_CLASSES = ['mp-no-track'];
var SENSITIVE_DATA_CLASSES = OPT_OUT_CLASSES.concat(['mp-sensitive']);
var TRACKED_ATTRS = [
    'aria-label', 'aria-labelledby', 'aria-describedby',
    'href', 'name', 'role', 'title', 'type'
];

var INTERACTIVE_ARIA_ROLES = {
    'button': true,
    'checkbox': true,
    'combobox': true,
    'grid': true,
    'link': true,
    'listbox': true,
    'menu': true,
    'menubar': true,
    'menuitem': true,
    'menuitemcheckbox': true,
    'menuitemradio': true,
    'navigation': true,
    'option': true,
    'radio': true,
    'radiogroup': true,
    'searchbox': true,
    'slider': true,
    'spinbutton': true,
    'switch': true,
    'tab': true,
    'tablist': true,
    'textbox': true,
    'tree': true,
    'treegrid': true,
    'treeitem': true
};

var ALWAYS_NON_INTERACTIVE_TAGS = {
    // Document metadata
    'base': true,
    'head': true,
    'html': true,
    'link': true,
    'meta': true,
    'script': true,
    'style': true,
    'title': true,
    // Text formatting
    'br': true,
    'hr': true,
    'wbr': true,
    // Other
    'noscript': true,
    'picture': true,
    'source': true,
    'template': true,
    'track': true
};

// Common container tags that need additional checks
var TEXT_CONTAINER_TAGS = {
    'article': true,
    'div': true,
    'h1': true,
    'h2': true,
    'h3': true,
    'h4': true,
    'h5': true,
    'h6': true,
    'p': true,
    'section': true,
    'span': true
};

var EVENT_HANDLER_ATTRIBUTES = [
    'onclick', 'onmousedown', 'onmouseup', 'onpointerdown', 'onpointerup', 'ontouchend', 'ontouchstart'
];

var MAX_DEPTH = 5;

var logger = console_with_prefix('autocapture');


function getClasses(el) {
    var classes = {};
    var classList = getClassName(el).split(' ');
    for (var i = 0; i < classList.length; i++) {
        var cls = classList[i];
        if (cls) {
            classes[cls] = true;
        }
    }
    return classes;
}

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

function getPropertiesFromElement(el, ev, blockAttrsSet, extraAttrs, allowElementCallback, allowSelectors) {
    var props = {
        '$classes': getClassName(el).split(' '),
        '$tag_name': el.tagName.toLowerCase()
    };
    var elId = el.id;
    if (elId) {
        props['$id'] = elId;
    }

    if (shouldTrackElementDetails(el, ev, allowElementCallback, allowSelectors)) {
        _.each(TRACKED_ATTRS.concat(extraAttrs), function(attr) {
            if (el.hasAttribute(attr) && !blockAttrsSet[attr]) {
                var attrVal = el.getAttribute(attr);
                if (shouldTrackValue(attrVal)) {
                    props['$attr-' + attr] = attrVal;
                }
            }
        });
    }

    var nthChild = 1;
    var nthOfType = 1;
    var currentElem = el;
    while (currentElem = getPreviousElementSibling(currentElem)) { // eslint-disable-line no-cond-assign
        nthChild++;
        if (currentElem.tagName === el.tagName) {
            nthOfType++;
        }
    }
    props['$nth_child'] = nthChild;
    props['$nth_of_type'] = nthOfType;

    return props;
}

function getPropsForDOMEvent(ev, config) {
    var allowElementCallback = config.allowElementCallback;
    var allowSelectors = config.allowSelectors || [];
    var blockAttrs = config.blockAttrs || [];
    var blockElementCallback = config.blockElementCallback;
    var blockSelectors = config.blockSelectors || [];
    var captureTextContent = config.captureTextContent || false;
    var captureExtraAttrs = config.captureExtraAttrs || [];
    var capturedForHeatMap = config.capturedForHeatMap || false;

    // convert array to set every time, as the config may have changed
    var blockAttrsSet = {};
    _.each(blockAttrs, function(attr) {
        blockAttrsSet[attr] = true;
    });

    var props = null;

    var target = typeof ev.target === 'undefined' ? ev.srcElement : ev.target;
    if (isTextNode(target)) { // defeat Safari bug (see: http://www.quirksmode.org/js/events_properties.html)
        target = target.parentNode;
    }

    if (
        shouldTrackDomEvent(target, ev) &&
        isElementAllowed(target, ev, allowElementCallback, allowSelectors) &&
        !isElementBlocked(target, ev, blockElementCallback, blockSelectors)
    ) {
        var targetElementList = [target];
        var curEl = target;
        while (curEl.parentNode && !isTag(curEl, 'body')) {
            targetElementList.push(curEl.parentNode);
            curEl = curEl.parentNode;
        }

        var elementsJson = [];
        var href, explicitNoTrack = false;
        _.each(targetElementList, function(el) {
            var shouldTrackDetails = shouldTrackElementDetails(el, ev, allowElementCallback, allowSelectors);

            // if the element or a parent element is an anchor tag
            // include the href as a property
            if (!blockAttrsSet['href'] && el.tagName.toLowerCase() === 'a') {
                href = el.getAttribute('href');
                href = shouldTrackDetails && shouldTrackValue(href) && href;
            }

            if (isElementBlocked(el, ev, blockElementCallback, blockSelectors)) {
                explicitNoTrack = true;
            }

            elementsJson.push(getPropertiesFromElement(el, ev, blockAttrsSet, captureExtraAttrs, allowElementCallback, allowSelectors));
        }, this);

        if (!explicitNoTrack) {
            var docElement = document['documentElement'];
            props = {
                '$event_type': ev.type,
                '$host': window.location.host,
                '$pathname': window.location.pathname,
                '$elements':  elementsJson,
                '$el_attr__href': href,
                '$viewportHeight': Math.max(docElement['clientHeight'], window['innerHeight'] || 0),
                '$viewportWidth': Math.max(docElement['clientWidth'], window['innerWidth'] || 0),
                '$pageHeight': document['body']['offsetHeight'] || 0,
                '$pageWidth': document['body']['offsetWidth'] || 0,
            };
            _.each(captureExtraAttrs, function(attr) {
                if (!blockAttrsSet[attr] && target.hasAttribute(attr)) {
                    var attrVal = target.getAttribute(attr);
                    if (shouldTrackValue(attrVal)) {
                        props['$el_attr__' + attr] = attrVal;
                    }
                }
            });

            if (captureTextContent) {
                elementText = getSafeText(target, ev, allowElementCallback, allowSelectors);
                if (elementText && elementText.length) {
                    props['$el_text'] = elementText;
                }
            }

            if (ev.type === EV_CLICK) {
                _.each(CLICK_EVENT_PROPS, function(prop) {
                    if (prop in ev) {
                        props['$' + prop] = ev[prop];
                    }
                });
                if (capturedForHeatMap) {
                    props['$captured_for_heatmap'] = true;
                }
                target = guessRealClickTarget(ev);
            }
            // prioritize text content from "real" click target if different from original target
            if (captureTextContent) {
                var elementText = getSafeText(target, ev, allowElementCallback, allowSelectors);
                if (elementText && elementText.length) {
                    props['$el_text'] = elementText;
                }
            }

            if (target) {
                // target may have been recalculated; check allowlists and blocklists again
                if (
                    !isElementAllowed(target, ev, allowElementCallback, allowSelectors) ||
                    isElementBlocked(target, ev, blockElementCallback, blockSelectors)
                ) {
                    return null;
                }

                var targetProps = getPropertiesFromElement(target, ev, blockAttrsSet, captureExtraAttrs, allowElementCallback, allowSelectors);
                props['$target'] = targetProps;
                // pull up more props onto main event props
                props['$el_classes'] = targetProps['$classes'];
                _.extend(props, _.strip_empty_properties({
                    '$el_id': targetProps['$id'],
                    '$el_tag_name': targetProps['$tag_name']
                }));
            }
        }
    }

    return props;
}


/**
 * Get the direct text content of an element, protecting against sensitive data collection.
 * Concats textContent of each of the element's text node children; this avoids potential
 * collection of sensitive data that could happen if we used element.textContent and the
 * element had sensitive child elements, since element.textContent includes child content.
 * Scrubs values that look like they could be sensitive (i.e. cc or ssn number).
 * @param {Element} el - element to get the text of
 * @param {Array<string>} allowSelectors - CSS selectors for elements that should be included
 * @returns {string} the element's direct text content
 */
function getSafeText(el, ev, allowElementCallback, allowSelectors) {
    var elText = '';

    if (shouldTrackElementDetails(el, ev, allowElementCallback, allowSelectors) && el.childNodes && el.childNodes.length) {
        _.each(el.childNodes, function(child) {
            if (isTextNode(child) && child.textContent) {
                elText += _.trim(child.textContent)
                    // scrub potentially sensitive values
                    .split(/(\s+)/).filter(shouldTrackValue).join('')
                    // normalize whitespace
                    .replace(/[\r\n]/g, ' ').replace(/[ ]+/g, ' ')
                    // truncate
                    .substring(0, 255);
            }
        });
    }

    return _.trim(elText);
}

function guessRealClickTarget(ev) {
    var target = ev.target;
    var composedPath = ev['composedPath']();
    for (var i = 0; i < composedPath.length; i++) {
        var node = composedPath[i];
        if (
            isTag(node, 'a') ||
            isTag(node, 'button') ||
            isTag(node, 'input') ||
            isTag(node, 'select') ||
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

function isElementAllowed(el, ev, allowElementCallback, allowSelectors) {
    if (allowElementCallback) {
        try {
            if (!allowElementCallback(el, ev)) {
                return false;
            }
        } catch (err) {
            logger.critical('Error while checking element in allowElementCallback', err);
            return false;
        }
    }

    if (!allowSelectors.length) {
        // no allowlist; all elements are fair game
        return true;
    }

    for (var i = 0; i < allowSelectors.length; i++) {
        var sel = allowSelectors[i];
        try {
            if (el['matches'](sel)) {
                return true;
            }
        } catch (err) {
            logger.critical('Error while checking selector: ' + sel, err);
        }
    }
    return false;
}

function isElementBlocked(el, ev, blockElementCallback, blockSelectors) {
    var i;

    if (blockElementCallback) {
        try {
            if (blockElementCallback(el, ev)) {
                return true;
            }
        } catch (err) {
            logger.critical('Error while checking element in blockElementCallback', err);
            return true;
        }
    }

    if (blockSelectors && blockSelectors.length) {
        // programmatically prevent tracking of elements that match CSS selectors
        for (i = 0; i < blockSelectors.length; i++) {
            var sel = blockSelectors[i];
            try {
                if (el['matches'](sel)) {
                    return true;
                }
            } catch (err) {
                logger.critical('Error while checking selector: ' + sel, err);
            }
        }
    }

    // allow users to programmatically prevent tracking of elements by adding default classes such as 'mp-no-track'
    var classes = getClasses(el);
    for (i = 0; i < OPT_OUT_CLASSES.length; i++) {
        if (classes[OPT_OUT_CLASSES[i]]) {
            return true;
        }
    }

    return false;
}

/*
 * Check whether a DOM node has nodeType Node.ELEMENT_NODE
 * @param {Node} node - node to check
 * @returns {boolean} whether node is of the correct nodeType
 */
function isElementNode(node) {
    return node && node.nodeType === 1; // Node.ELEMENT_NODE - use integer constant for browser portability
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
 * Check whether a DOM node is a TEXT_NODE
 * @param {Node} node - node to check
 * @returns {boolean} whether node is of type Node.TEXT_NODE
 */
function isTextNode(node) {
    return node && node.nodeType === 3; // Node.TEXT_NODE - use integer constant for browser portability
}

function minDOMApisSupported() {
    try {
        var testEl = document.createElement('div');
        return !!testEl['matches'];
    } catch (err) {
        return false;
    }
}

function weakSetSupported() {
    return typeof WeakSet !== 'undefined';
}

/*
 * Check whether a DOM event should be "tracked" or if it may contain sensitive data
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

function elementLooksSensitive(el) {
    var name = (el.name || el.id || '').toString().toLowerCase();
    if (typeof name === 'string') { // it's possible for el.name or el.id to be a DOM element if el is a form with a child input[name="name"]
        var sensitiveNameRegex = /^cc|cardnum|ccnum|creditcard|csc|cvc|cvv|exp|pass|pwd|routing|seccode|securitycode|securitynum|socialsec|socsec|ssn/i;
        if (sensitiveNameRegex.test(name.replace(/[^a-zA-Z0-9]/g, ''))) {
            return true;
        }
    }

    return false;
}

/*
 * Check whether a DOM element should be "tracked" or if it may contain sensitive data
 * using a variety of heuristics.
 * @param {Element} el - element to check
 * @param {Array<string>} allowSelectors - CSS selectors for elements that should be included
 * @returns {boolean} whether the element should be tracked
 */
function shouldTrackElementDetails(el, ev, allowElementCallback, allowSelectors) {
    var i;

    if (!isElementAllowed(el, ev, allowElementCallback, allowSelectors)) {
        return false;
    }

    for (var curEl = el; curEl.parentNode && !isTag(curEl, 'body'); curEl = curEl.parentNode) {
        var classes = getClasses(curEl);
        for (i = 0; i < SENSITIVE_DATA_CLASSES.length; i++) {
            if (classes[SENSITIVE_DATA_CLASSES[i]]) {
                return false;
            }
        }
    }

    var elClasses = getClasses(el);
    for (i = 0; i < OPT_IN_CLASSES.length; i++) {
        if (elClasses[OPT_IN_CLASSES[i]]) {
            return true;
        }
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

    if (elementLooksSensitive(el)) {
        return false;
    }

    return true;
}


/*
 * Check whether a string value should be "tracked" or if it may contain sensitive data
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

/**
 * Creates a cross-browser compatible scroll end function with appropriate event listener.
 * For browsers that support scrollend, returns the original function with scrollend event.
 * For browsers without scrollend support, returns a debounced function that triggers
 * 100ms after the last scroll event to simulate scrollend behavior.
 * @param {Function} originalFunction - The function to call when scrolling ends
 * @returns {Object} Object containing listener function and eventType string
 * @returns {Function} returns.listener - The wrapped function to use as event listener
 * @returns {string} returns.eventType - The event type to listen for ('scrollend' or 'scroll')
 */
function getPolyfillScrollEndFunction(originalFunction) {
    var supportsScrollEnd = 'onscrollend' in window;
    var polyfillFunction = safewrap(originalFunction);
    var polyfillEvent = EV_SCROLLEND;
    if (!supportsScrollEnd) {
        // Polyfill for browsers without scrollend support: wait 100ms after the last scroll event
        // https://developer.chrome.com/blog/scrollend-a-new-javascript-event
        var scrollTimer = null;
        var scrollDelayMs = 100;

        polyfillFunction = safewrap(function() {
            clearTimeout(scrollTimer);
            scrollTimer = setTimeout(originalFunction, scrollDelayMs);
        });

        polyfillEvent = EV_SCROLL;
    }

    return {
        listener: polyfillFunction,
        eventType: polyfillEvent
    };
}

function hasInlineEventHandlers(element) {
    for (var i = 0; i < EVENT_HANDLER_ATTRIBUTES.length; i++) {
        if (element.hasAttribute(EVENT_HANDLER_ATTRIBUTES[i])) {
            return true;
        }
    }
    return false;
}

function hasInteractiveAriaRole(element) {
    var role = element.getAttribute('role');
    if (!role) return false;

    // Handle invalid markup where multiple roles might be specified
    // Only the first token is recognized per ARIA spec
    var primaryRole = role.trim().split(/\s+/)[0].toLowerCase();

    return INTERACTIVE_ARIA_ROLES[primaryRole];
}

function hasAnyInteractivityIndicators(element) {
    var tagName = element.tagName.toLowerCase();

    // Check for interactive HTML elements
    if (tagName === 'button' ||
        tagName === 'input' ||
        tagName === 'select' ||
        tagName === 'textarea' ||
        tagName === 'details' ||
        tagName === 'dialog') {
        return true;
    }

    if (element.isContentEditable) {
        return true;
    }

    if (element.onclick || element.onmousedown || element.onmouseup || element.ontouchstart || element.ontouchend) {
        return true;
    }

    if (hasInlineEventHandlers(element)) {
        return true;
    }

    if (hasInteractiveAriaRole(element)) {
        return true;
    }

    if (tagName === 'a' && element.hasAttribute('href')) {
        return true;
    }

    if (element.hasAttribute('tabindex')) {
        return true;
    }

    return false;
}


function isDefinitelyNonInteractive(element) {
    if (!element || !element.tagName) {
        return true;
    }

    var tagName = element.tagName.toLowerCase();

    // These tags are definitely non-interactive
    if (ALWAYS_NON_INTERACTIVE_TAGS[tagName]) {
        return true;
    }

    // For all other elements, we can only be certain they're non-interactive if they lack ALL indicators of interactivity
    // Check for any signs of interactivity
    if (hasAnyInteractivityIndicators(element)) {
        return false;
    }

    // Check parent chain for interactive context
    var parent = element.parentElement;
    var depth = 0;

    while (parent && depth < MAX_DEPTH) {
        if (hasAnyInteractivityIndicators(parent)) {
            return false; // Element is inside an interactive parent
        }

        if (parent.getRootNode && parent.getRootNode() !== document) {
            var root = parent.getRootNode();
            if (root.host && hasAnyInteractivityIndicators(root.host)) {
                return false; // Inside an interactive shadow host
            }
        }

        parent = parent.parentElement;
        depth++;
    }

    // Pure text containers without any interactive context
    if (TEXT_CONTAINER_TAGS[tagName]) {
        // These are non-interactive ONLY if they have no interactive indicators (already checked as part of hasAnyInteractivityIndicators)
        return true;
    }

    // Default: we can't be certain it's non-interactive
    return false;
}

/**
 * Get the composed path of a click event for elements embedded in shadow DOM.
 * @param {Event} event - event to get the composed path from
 * @returns {Array} the composed path of the click event
*/
function getClickEventComposedPath(event) {
    if ('composedPath' in event) {
        return event['composedPath']();
    }

    return [];
}

/**
 * Get the element from a click event, accounting for elements embedded in shadow DOM.
 * @param {Event} event - event to get the target from
 * @returns {Element | null} the element that was the target of the click event
 */
function getClickEventTargetElement(event) {
    var path = getClickEventComposedPath(event);

    if (path && path.length > 0) {
        return path[0];
    }

    return event['target'] || event['srcElement'];
}

export {
    EV_CHANGE, EV_CLICK, EV_HASHCHANGE, EV_INPUT, EV_LOAD,EV_MP_LOCATION_CHANGE, EV_POPSTATE,
    EV_SCROLL, EV_SCROLLEND, EV_SELECT, EV_SUBMIT, EV_TOGGLE, EV_VISIBILITYCHANGE,
    elementLooksSensitive,
    getClickEventComposedPath,
    getClickEventTargetElement,
    getPolyfillScrollEndFunction,
    getPropsForDOMEvent,
    getSafeText,
    isDefinitelyNonInteractive,
    logger,
    minDOMApisSupported,
    shouldTrackDomEvent, shouldTrackElementDetails, shouldTrackValue,
    weakSetSupported
};
