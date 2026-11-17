/* eslint camelcase: "off" */

import { _ } from './utils'; // eslint-disable-line camelcase
import { window } from './window';

// URL matching shared across the SDK. It holds two matchers with different
// contracts:
//
// - urlMatchesRegexList: unanchored. A URL matches when url.match(entry)
//   succeeds for any entry, where an entry is a RegExp or a regex string. Used
//   by autocapture's allow/block URL lists and session recording's network
//   URL lists.
// - urlTargetMatches: the structured Target URL rule ($mp.target) carried by a
//   visual-experiment variant. Its regexes are anchored as ^(?:value)$.
//
// Target URL payload property names are quoted so they survive minification.
//
// The main URL is matched against origin + trailing-slash-normalized pathname
// only; the query string and hash are matched by their own rule fields. The
// behavior is pinned by shared test vectors, kept identical across every
// implementation of this rule (tests/unit/test-data/visual-url-target-vectors.json).

/**
 * A key/value pair in a Target URL query or hash params rule. A raw * in the
 * value is a wildcard.
 * @typedef {Object} TargetUrlParam
 * @property {string} key
 * @property {string} value
 */

/**
 * The main URL of a Target URL rule, matched against the page's origin and
 * normalized pathname.
 * @typedef {Object} TargetUrlMainUrl
 * @property {'pattern'|'regex'} type - 'pattern' is an absolute http(s) URL
 *   whose path may use *, ** and :name segments; 'regex' is anchored
 * @property {string} value
 */

/**
 * @typedef {Object} TargetUrlQuery
 * @property {Array<TargetUrlParam>} params - the page's query keys, apart from
 *   ignored keys, must equal these keys
 */

/**
 * A hash rule. A null route or null params leaves that part unconstrained; a
 * null route with an empty params list requires the page to have no hash.
 * @typedef {Object} TargetUrlHash
 * @property {?string} route - a path pattern compared with the page's hash route
 * @property {?Array<TargetUrlParam>} params
 */

/**
 * A structured Target URL rule ($mp.target), version 1.
 * @typedef {Object} TargetUrlRule
 * @property {number} version - must be 1
 * @property {TargetUrlMainUrl} url
 * @property {?TargetUrlQuery} query - null leaves the query string unconstrained
 * @property {?TargetUrlHash} hash - null leaves the hash unconstrained
 * @property {Array<string>} ignoredParamKeys - query and hash param keys that
 *   may appear on the page without a rule entry; a trailing * makes an entry a
 *   key prefix
 */

/**
 * A decoded key/value pair parsed from a page's query string or hash.
 * @typedef {Object} UrlParam
 * @property {string} key
 * @property {string} value
 */

/**
 * The parts of a page location the Target URL matcher reads, such as
 * window.location or a parsed anchor element.
 * @typedef {Object} UrlLocation
 * @property {string} protocol
 * @property {string} host
 * @property {string} pathname
 * @property {string} [search]
 * @property {string} [hash]
 */

var TARGET_VERSION = 1;

var PATH_PARAM_SEGMENT = /^:[A-Za-z0-9_]+$/;
var HTTP_URL_PREFIX = /^https?:\/\//i;

/**
 * @param {Object} obj
 * @param {string} key
 * @returns {boolean}
 */
var hasOwn = function(obj, key) {
    return Object.prototype.hasOwnProperty.call(obj, key);
};

/**
 * Ensure a leading slash and drop a single trailing slash (keeping root "/") so
 * "/foo" and "/foo/" are treated as equal.
 * @param {string} pathname
 * @returns {string}
 */
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

/**
 * @param {string} text
 * @returns {string} text with regex metacharacters escaped
 */
var escapeRegExp = function(text) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * @param {string} source
 * @returns {?RegExp} ^(?:source)$, or null when source is not a valid regex
 */
var anchoredRegExp = function(source) {
    try {
        return new RegExp('^(?:' + source + ')$');
    } catch (err) {
        return null;
    }
};

/**
 * @param {string} source - regex source, anchored before matching
 * @param {string} text
 * @returns {boolean} false when source is not a valid regex
 */
var regExpMatches = function(source, text) {
    var regExp = anchoredRegExp(source);
    return !!regExp && regExp.test(text);
};

/**
 * Regex source (unanchored) for a path or hash-route pattern: ** crosses
 * segments, * stays within one segment, and a segment that is exactly :name
 * matches one non-empty segment. Everything else is literal.
 * @param {string} pattern
 * @returns {string}
 */
var pathPatternRegExpSource = function(pattern) {
    var segments = pattern.split('/');
    for (var i = 0; i < segments.length; i++) {
        var segment = segments[i];
        if (PATH_PARAM_SEGMENT.test(segment)) {
            segments[i] = '[^/]+';
            continue;
        }
        var doubleStarParts = segment.split('**');
        for (var j = 0; j < doubleStarParts.length; j++) {
            var starParts = doubleStarParts[j].split('*');
            for (var k = 0; k < starParts.length; k++) {
                starParts[k] = escapeRegExp(starParts[k]);
            }
            doubleStarParts[j] = starParts.join('[^/]*');
        }
        segments[i] = doubleStarParts.join('.*');
    }
    return segments.join('/');
};

/**
 * Decode a URL component with + as a space, keeping the raw text when it is
 * malformed.
 * @param {string} text
 * @returns {string}
 */
var decodeUrlComponent = function(text) {
    var withSpaces = text.replace(/\+/g, ' ');
    try {
        return decodeURIComponent(withSpaces);
    } catch (err) {
        return withSpaces;
    }
};

/**
 * Parse "a=1&b&c=" into decoded key/value pairs; a bare key has an empty value.
 * @param {string} paramString
 * @returns {Array<UrlParam>}
 */
var parseParamString = function(paramString) {
    var params = [];
    var pairs = paramString.split('&');
    for (var i = 0; i < pairs.length; i++) {
        var pair = pairs[i];
        if (!pair) {
            continue;
        }
        var separatorIndex = pair.indexOf('=');
        var rawKey = separatorIndex === -1 ? pair : pair.slice(0, separatorIndex);
        var rawValue = separatorIndex === -1 ? '' : pair.slice(separatorIndex + 1);
        params.push({key: decodeUrlComponent(rawKey), value: decodeUrlComponent(rawValue)});
    }
    return params;
};

/**
 * @param {string} key
 * @param {Array<string>} ignoredParamKeys - a trailing * makes an entry a key prefix
 * @returns {boolean}
 */
var isIgnoredParamKey = function(key, ignoredParamKeys) {
    for (var i = 0; i < ignoredParamKeys.length; i++) {
        var ignoredKey = ignoredParamKeys[i];
        if (ignoredKey.charAt(ignoredKey.length - 1) === '*') {
            if (key.indexOf(ignoredKey.slice(0, -1)) === 0) {
                return true;
            }
        } else if (key === ignoredKey) {
            return true;
        }
    }
    return false;
};

/**
 * A raw * in a rule value is a wildcard; %2A decodes to a literal *.
 * @param {string} rawRuleValue
 * @param {string} pageValue - already decoded
 * @returns {boolean}
 */
var ruleValueMatches = function(rawRuleValue, pageValue) {
    var parts = rawRuleValue.split('*');
    for (var i = 0; i < parts.length; i++) {
        parts[i] = escapeRegExp(decodeUrlComponent(parts[i]));
    }
    return regExpMatches(parts.join('[\\s\\S]*'), pageValue);
};

/**
 * The page's keys, apart from ignored keys, must equal the rule's keys, and
 * every occurrence of a repeated page key must match the rule's value. A rule
 * that repeats a key never matches. Keys are prefixed in the lookup object so
 * names like "__proto__" are safe.
 * @param {Array<TargetUrlParam>} ruleParams
 * @param {Array<UrlParam>} pageParams
 * @param {Array<string>} ignoredParamKeys
 * @returns {boolean}
 */
var paramsMatch = function(ruleParams, pageParams, ignoredParamKeys) {
    var ruleValueByKey = {};
    var ruleKeyCount = 0;
    var i;
    for (i = 0; i < ruleParams.length; i++) {
        var ruleLookupKey = '$' + ruleParams[i]['key'];
        if (hasOwn(ruleValueByKey, ruleLookupKey)) {
            return false;
        }
        ruleValueByKey[ruleLookupKey] = ruleParams[i]['value'];
        ruleKeyCount++;
    }

    var seenRuleKeys = {};
    var seenRuleKeyCount = 0;
    for (i = 0; i < pageParams.length; i++) {
        var pageKey = pageParams[i].key;
        var pageLookupKey = '$' + pageKey;
        if (!hasOwn(ruleValueByKey, pageLookupKey)) {
            if (isIgnoredParamKey(pageKey, ignoredParamKeys)) {
                continue;
            }
            return false;
        }
        if (!ruleValueMatches(ruleValueByKey[pageLookupKey], pageParams[i].value)) {
            return false;
        }
        if (!hasOwn(seenRuleKeys, pageLookupKey)) {
            seenRuleKeys[pageLookupKey] = true;
            seenRuleKeyCount++;
        }
    }
    return seenRuleKeyCount === ruleKeyCount;
};

/**
 * Split a page hash (without #) into its route and its param string: on the
 * first ? when present, otherwise the whole hash is params when it contains =
 * (after an optional leading !), and a route when it doesn't.
 * @param {string} hash
 * @returns {{route: string, paramString: string}}
 */
var splitPageHash = function(hash) {
    var questionMarkIndex = hash.indexOf('?');
    if (questionMarkIndex !== -1) {
        return {route: hash.slice(0, questionMarkIndex), paramString: hash.slice(questionMarkIndex + 1)};
    }
    if (hash.indexOf('=') !== -1) {
        return {route: '', paramString: hash.charAt(0) === '!' ? hash.slice(1) : hash};
    }
    return {route: hash, paramString: ''};
};

/**
 * A page hash with no params rule is all route up to the first ?, even when it
 * contains =.
 * @param {string} hash - without the leading #
 * @returns {string}
 */
var pageHashRouteOnly = function(hash) {
    var questionMarkIndex = hash.indexOf('?');
    return questionMarkIndex === -1 ? hash : hash.slice(0, questionMarkIndex);
};

/**
 * Strip one leading ! so hashbang routes (#!/cart) compare as plain routes, then
 * one trailing / unless the route is exactly /. No leading / is added, since
 * anchor routes such as #reviews have none.
 * @param {string} route
 * @returns {string}
 */
var normalizeHashRoute = function(route) {
    var withoutBang = route.charAt(0) === '!' ? route.slice(1) : route;
    if (withoutBang.length > 1 && withoutBang.charAt(withoutBang.length - 1) === '/') {
        return withoutBang.slice(0, -1);
    }
    return withoutBang;
};

/**
 * @param {string} pageRoute
 * @returns {string} the percent-decoded route, or pageRoute when it is malformed
 */
var decodePageHashRoute = function(pageRoute) {
    try {
        return decodeURIComponent(pageRoute);
    } catch (err) {
        return pageRoute;
    }
};

/**
 * The page's hash route is percent-decoded before comparison; the rule route is
 * compared as typed.
 * @param {string} ruleRoute
 * @param {string} pageRoute
 * @returns {boolean}
 */
var hashRouteMatches = function(ruleRoute, pageRoute) {
    return regExpMatches(
        pathPatternRegExpSource(normalizeHashRoute(ruleRoute)),
        normalizeHashRoute(decodePageHashRoute(pageRoute))
    );
};

/**
 * @param {TargetUrlRule} target
 * @param {string} pageHash - without the leading #
 * @returns {boolean}
 */
var hashMatches = function(target, pageHash) {
    var hash = target['hash'];
    if (!hash) {
        return true;
    }
    var route = hash['route'];
    var params = hash['params'];
    if (route === null && params !== null && params.length === 0) {
        // "Must have no hash".
        return pageHash === '';
    }
    if (params === null) {
        return route === null || hashRouteMatches(route, pageHashRouteOnly(pageHash));
    }
    var pageHashParts = splitPageHash(pageHash);
    if (route !== null && !hashRouteMatches(route, pageHashParts.route)) {
        return false;
    }
    return paramsMatch(params, parseParamString(pageHashParts.paramString), target['ignoredParamKeys']);
};

/**
 * Parse an absolute http(s) URL. Uses a throwaway anchor so URL support is not
 * assumed; relative input is rejected up front because an anchor would resolve
 * it against the current page.
 * @param {string} url
 * @returns {?{origin: string, pathname: string}} null when url is not an
 *   absolute http(s) URL
 */
var parseHttpUrl = function(url) {
    var doc = window && window['document'];
    if (!url || !HTTP_URL_PREFIX.test(url) || !doc || !doc.createElement) {
        return null;
    }
    var anchor = doc.createElement('a');
    anchor.href = url;
    if (anchor.protocol !== 'http:' && anchor.protocol !== 'https:') {
        return null;
    }
    return {origin: anchor.protocol + '//' + anchor.host, pathname: anchor.pathname};
};

/**
 * @param {TargetUrlRule} target
 * @param {string} pageOrigin - protocol + '//' + host
 * @param {string} pagePathname - already normalized
 * @returns {boolean}
 */
var mainUrlMatches = function(target, pageOrigin, pagePathname) {
    var url = target['url'];
    if (url['type'] === 'regex') {
        return regExpMatches(url['value'], pageOrigin + pagePathname);
    }
    var pattern = parseHttpUrl(url['value']);
    if (!pattern || pattern.origin !== pageOrigin) {
        return false;
    }
    return regExpMatches(pathPatternRegExpSource(normalizePathname(pattern.pathname)), pagePathname);
};

/**
 * @param {*} value
 * @returns {boolean} whether value is a non-null, non-array object
 */
var isPlainObject = function(value) {
    return typeof value === 'object' && value !== null && !_.isArray(value);
};

/**
 * @param {*} value
 * @returns {boolean} whether value is an Array<TargetUrlParam>
 */
var isParamList = function(value) {
    if (!_.isArray(value)) {
        return false;
    }
    for (var i = 0; i < value.length; i++) {
        if (!isPlainObject(value[i]) || typeof value[i]['key'] !== 'string' ||
            typeof value[i]['value'] !== 'string') {
            return false;
        }
    }
    return true;
};

/**
 * @param {*} value
 * @returns {boolean} whether value is an Array<string>
 */
var isStringList = function(value) {
    if (!_.isArray(value)) {
        return false;
    }
    for (var i = 0; i < value.length; i++) {
        if (typeof value[i] !== 'string') {
            return false;
        }
    }
    return true;
};

/**
 * @param {*} target
 * @returns {boolean} whether target is a well-formed TargetUrlRule
 */
var isValidTarget = function(target) {
    if (!isPlainObject(target) || target['version'] !== TARGET_VERSION) {
        return false;
    }
    var url = target['url'];
    if (!isPlainObject(url) || (url['type'] !== 'pattern' && url['type'] !== 'regex') ||
        typeof url['value'] !== 'string') {
        return false;
    }
    var query = target['query'];
    if (query !== null && !(isPlainObject(query) && isParamList(query['params']))) {
        return false;
    }
    var hash = target['hash'];
    if (hash !== null && !(isPlainObject(hash) &&
        (hash['route'] === null || typeof hash['route'] === 'string') &&
        (hash['params'] === null || isParamList(hash['params'])))) {
        return false;
    }
    return isStringList(target['ignoredParamKeys']);
};

/**
 * Whether a URL matches any entry of a regex list. Matching is unanchored
 * (url.match(entry)), unlike the anchored Target URL matcher.
 * @param {string} url
 * @param {Array<RegExp|string>} regexList
 * @returns {boolean}
 */
var urlMatchesRegexList = function (url, regexList) {
    var matches = false;
    for (var i = 0; i < regexList.length; i++) {
        if (url.match(regexList[i])) {
            matches = true;
            break;
        }
    }
    return matches;
};

/**
 * Whether a structured Target URL rule matches a page location. A malformed
 * rule, or one with any version other than 1, never matches.
 * @param {TargetUrlRule} target - the variant's $mp.target rule
 * @param {?UrlLocation} location - window.location or a parsed anchor
 * @returns {boolean}
 */
var urlTargetMatches = function(target, location) {
    if (!isValidTarget(target) || !location) {
        return false;
    }
    var protocol = location.protocol;
    if (protocol !== 'http:' && protocol !== 'https:') {
        return false;
    }
    var pageOrigin = protocol + '//' + location.host;
    var pagePathname = normalizePathname(location.pathname);
    if (!mainUrlMatches(target, pageOrigin, pagePathname)) {
        return false;
    }
    var query = target['query'];
    if (query && !paramsMatch(query['params'], parseParamString((location.search || '').slice(1)),
        target['ignoredParamKeys'])) {
        return false;
    }
    return hashMatches(target, (location.hash || '').slice(1));
};

export { normalizePathname, urlMatchesRegexList, urlTargetMatches };
