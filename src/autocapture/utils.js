// stateless utils
// mostly from https://github.com/mixpanel/mixpanel-js/blob/989ada50f518edab47b9c4fd9535f9fbd5ec5fc0/src/autotrack-utils.js

import { _, console_with_prefix, document } from '../utils'; // eslint-disable-line camelcase
import { window } from '../window';

var EV_CHANGE = 'change';
var EV_CLICK = 'click';
var EV_HASHCHANGE = 'hashchange';
var EV_MP_LOCATION_CHANGE = 'mp_locationchange';
var EV_POPSTATE = 'popstate';
// TODO scrollend isn't available in Safari: document or polyfill?
var EV_SCROLLEND = 'scrollend';
var EV_SUBMIT = 'submit';

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
                '$viewportWidth': Math.max(docElement['clientWidth'], window['innerWidth'] || 0)
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

export {
    getPropsForDOMEvent,
    getSafeText,
    logger,
    minDOMApisSupported,
    shouldTrackDomEvent, shouldTrackElementDetails, shouldTrackValue,
    EV_CHANGE, EV_CLICK, EV_HASHCHANGE, EV_MP_LOCATION_CHANGE, EV_POPSTATE,
    EV_SCROLLEND, EV_SUBMIT
};
