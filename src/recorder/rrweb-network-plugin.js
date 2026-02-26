/**
 * This is a port of the open rrweb network plugin in this PR https://github.com/rrweb-io/rrweb/pull/1105
 * the hope is that eventually this can be replaced with the official plugin once it's published (and we sync the mixpanel rrweb fork)
 *
 * This plugin incorporates some important fixes for fetch/XHR body recording that are not yet in the main rrweb repo, as well as makes
 * header and body recording more restrictive by requiring an allowlist instead of content type / blocklist.
 *
 */
import { urlMatchesRegexList, console_with_prefix, _ } from '../utils'; // eslint-disable-line camelcase

var logger = console_with_prefix('network-plugin');

/**
 * Get the time origin for converting performance timestamps to absolute timestamps.
 * Uses Date.now() - performance.now() instead of performance.timeOrigin because
 * browsers can report timeOrigin values that are skewed from actual time, and some
 * browsers (notably older Safari versions) don't implement timeOrigin at all.
 * See: https://github.com/getsentry/sentry-javascript/blob/e856e40b6e71a73252e788cd42b5260f81c9c88e/packages/utils/src/time.ts#L49-L70
 * @param {Window} win
 * @returns {number}
 */
function getTimeOrigin(win) {
    return Math.round(Date.now() - win.performance.now());
}

/**
 * @typedef {import('../index.d.ts').InitiatorType} InitiatorType
 * @typedef {import('../index.d.ts').NetworkRequest} NetworkRequest
 * @typedef {import('../index.d.ts').NetworkRecordOptions} NetworkRecordOptions
 * @typedef {import('../index.d.ts').NetworkData} NetworkData
 */

/**
 * @typedef {Record<string, string>} Headers
 */

/**
 * @typedef {string | Document | Blob | ArrayBufferView | ArrayBuffer | FormData | URLSearchParams | ReadableStream<Uint8Array> | null} Body
 */

/**
 * @callback networkCallback
 * @param {NetworkData} data
 * @returns {void}
 */

/**
 * @callback listenerHandler
 * @returns {void}
 */

/**
 * @typedef {(PerformanceNavigationTiming | PerformanceResourceTiming) & { responseStatus?: number }} ObservedPerformanceEntry
 */

/**
 * @typedef {Object} RecordPlugin
 * @property {string} name
 * @property {(callback: networkCallback, win: Window, options: NetworkRecordOptions) => listenerHandler} observer
 * @property {NetworkRecordOptions} [options]
 */

/** @type {Required<NetworkRecordOptions>} */
var defaultNetworkOptions = {
    initiatorTypes: [
        'audio',
        'beacon',
        'body',
        'css',
        'early-hint',
        'embed',
        'fetch',
        'frame',
        'iframe',
        'icon',
        'image',
        'img',
        'input',
        'link',
        'navigation',
        'object',
        'ping',
        'script',
        'track',
        'video',
        'xmlhttprequest',
    ],
    ignoreRequestFn: function() { return false; },
    recordHeaders: {
        request: [],
        response: [],
    },
    recordBodyUrls: {
        request: [],
        response: [],
    },
    recordInitialRequests: false,
};

/**
 * @param {PerformanceEntry} entry
 * @returns {entry is PerformanceNavigationTiming}
 */
function isNavigationTiming(entry) {
    return entry.entryType === 'navigation';
}

/**
 * @param {PerformanceEntry} entry
 * @returns {entry is PerformanceResourceTiming}
 */
function isResourceTiming (entry) {
    return entry.entryType === 'resource';
}

export function findLast(array, predicate) {
    var length = array.length;
    for (var i = length - 1; i >= 0; i -= 1) {
        if (predicate(array[i])) {
            return array[i];
        }
    }
}

/**
 * Monkey-patches a method on an object with a wrapped version, returning a function that restores the original.
 * Adapted from Sentry's `fill` utility:
 * https://github.com/getsentry/sentry-javascript/blob/de5c5cbe177b4334386e747857225eec36a91ea1/packages/core/src/utils/object.ts#L67-L95
 *
 * @param {object} source - The object containing the method to patch
 * @param {string} name - The method name to patch
 * @param {function} replacementFactory - A function that receives the original method and returns the replacement
 * @returns {function} A function that restores the original method
 */
export function patch(source, name, replacementFactory) {
    if (!(name in source) || typeof source[name] !== 'function') {
        return function() {};
    }
    var original = source[name];
    var wrapped = replacementFactory(original);
    source[name] = wrapped;
    return function() {
        source[name] = original;
    };
}


/**
 * Maximum body size to record (1MB)
 */
var MAX_BODY_SIZE = 1024 * 1024;

/**
 * Truncate string if it exceeds max size
 * @param {string} str
 * @returns {string}
 */
export function truncateBody(str) {
    if (!str || typeof str !== 'string') {
        return str;
    }
    if (str.length > MAX_BODY_SIZE) {
        logger.error('Body truncated from ' + str.length + ' to ' + MAX_BODY_SIZE + ' characters');
        return str.substring(0, MAX_BODY_SIZE) + '... [truncated]';
    }
    return str;
}

/**
 * @param {networkCallback} cb
 * @param {Window} win
 * @param {Required<NetworkRecordOptions>} options
 * @returns {listenerHandler}
 */
function initPerformanceObserver(cb, win, options) {
    if (!win.PerformanceObserver) {
        logger.error('PerformanceObserver not supported');
        return function() {
            //
        };
    }
    if (options.recordInitialRequests) {
        var initialPerformanceEntries = win.performance
            .getEntries()
            .filter(function(entry) {
                return isNavigationTiming(entry) ||
          (isResourceTiming(entry) &&
            options.initiatorTypes.includes(entry.initiatorType));
            });
        cb({
            requests: initialPerformanceEntries.map(function(entry) {
                return {
                    url: entry.name,
                    initiatorType: /** @type {InitiatorType} */ (entry.initiatorType),
                    status: 'responseStatus' in entry ? entry.responseStatus : undefined,
                    startTime: Math.round(entry.startTime),
                    endTime: Math.round(entry.responseEnd),
                    timeOrigin: getTimeOrigin(win),
                };
            }),
            isInitial: true,
        });
    }
    var observer = new win.PerformanceObserver(function(entries) {
        var performanceEntries = entries
            .getEntries()
            .filter(function(entry) {
                return isResourceTiming(entry) &&
                    options.initiatorTypes.includes(entry.initiatorType) &&
                    entry.initiatorType !== 'xmlhttprequest' &&
                    entry.initiatorType !== 'fetch';
            });
        cb({
            requests: performanceEntries.map(function(entry) {
                return {
                    url: entry.name,
                    initiatorType: /** @type {InitiatorType} */ (entry.initiatorType),
                    status: 'responseStatus' in entry ? entry.responseStatus : undefined,
                    startTime: Math.round(entry.startTime),
                    endTime: Math.round(entry.responseEnd),
                    timeOrigin: getTimeOrigin(win),
                };
            }),
        });
    });
    observer.observe({ entryTypes: ['navigation', 'resource'] });
    return function() {
        observer.disconnect();
    };
}

/**
 * Variation of the original rrweb function that requires an allowlist for headers instead of supporting boolean options
 * @param {'request' | 'response'} type
 * @param {NetworkRecordOptions['recordHeaders']} recordHeaders
 * @param {string} headerName
 * @returns {boolean}
 */
export function shouldRecordHeader(type, recordHeaders, headerName) {
    if (!recordHeaders[type] || recordHeaders[type].length === 0) {
        return false;
    }

    return recordHeaders[type].includes(headerName.toLowerCase());
}

/**
 * Variation of the original rrweb function that requires an allowlist for URLs instead of supporting boolean options or by content type
 * @param {'request' | 'response'} type
 * @param {NetworkRecordOptions['recordBodyUrls']} recordBodyUrls
 * @param {string} url
 * @returns {boolean}
 */
export function shouldRecordBody(type, recordBodyUrls, url) {
    if (!recordBodyUrls[type] || recordBodyUrls[type].length === 0) {
        return false;
    }

    return urlMatchesRegexList(url, recordBodyUrls[type]);
}

function tryReadXHRBody(body) {
    if (body === null || body === undefined) {
        return null;
    }

    var result;
    if (typeof body === 'string') {
        result = body;
    } else if (body instanceof Document) {
        result = body.textContent;
    } else if (body instanceof FormData) {
        result = _.HTTPBuildQuery(body);
    } else if (_.isObject(body)) {
        try {
            result = JSON.stringify(body);
        } catch (e) {
            return 'Failed to stringify response object';
        }
    } else {
        return 'Cannot read body of type ' + typeof body;
    }

    return truncateBody(result);
}

/**
 * @param {Request | Response} r
 * @returns {Promise<string>}
 */
function tryReadFetchBody(r) {
    return new Promise(function(resolve) {
        var timeout = setTimeout(function() {
            resolve('Timeout while trying to read body');
        }, 500);
        try {
            r.clone()
                .text()
                .then(
                    function(txt) {
                        clearTimeout(timeout);
                        resolve(truncateBody(txt));
                    },
                    function(reason) {
                        clearTimeout(timeout);
                        resolve('Failed to read body: ' + String(reason));
                    }
                );
        } catch (e) {
            clearTimeout(timeout);
            resolve('Failed to read body: ' + String(e));
        }
    });
}

/**
 * @param {Window} win
 * @param {string} initiatorType
 * @param {string} url
 * @param {number} [after]
 * @param {number} [before]
 * @param {number} [attempt]
 * @returns {Promise<PerformanceResourceTiming>}
 */
function getRequestPerformanceEntry(win, initiatorType, url, after, before, attempt) {
    if (attempt === undefined) {
        attempt = 0;
    }
    if (attempt > 10) {
        logger.error('Cannot find performance entry');
        return Promise.resolve(null);
    }
    var urlPerformanceEntries = /** @type {PerformanceResourceTiming[]} */ (
        win.performance.getEntriesByName(url)
    );
    var performanceEntry = findLast(
        urlPerformanceEntries,
        function(entry) {
            return isResourceTiming(entry) &&
        entry.initiatorType === initiatorType &&
        (!after || entry.startTime >= after) &&
        (!before || entry.startTime <= before);
        }
    );
    if (!performanceEntry) {
        return new Promise(function(resolve) {
            setTimeout(resolve, 50 * attempt);
        }).then(function() {
            return getRequestPerformanceEntry(
                win,
                initiatorType,
                url,
                after,
                before,
                attempt + 1
            );
        });
    }
    return Promise.resolve(performanceEntry);
}

/**
 * @param {networkCallback} cb
 * @param {Window} win
 * @param {Required<NetworkRecordOptions>} options
 * @returns {listenerHandler}
 */
function initXhrObserver(cb, win, options) {
    if (!options.initiatorTypes.includes('xmlhttprequest')) {
        return function() {
            //
        };
    }
    var restorePatch = patch(
        win.XMLHttpRequest.prototype,
        'open',
        function(/** @type {typeof XMLHttpRequest.prototype.open} */ originalOpen) {
            return function(
                /** @type {string} */ method,
                /** @type {string | URL} */ url,
                /** @type {boolean} */ async,
                username, password
            ) {
                if (async === undefined) {
                    async = true;
                }
                var xhr = /** @type {XMLHttpRequest} */ (this);
                var req = new Request(url, { method: method });
                /** @type {Partial<NetworkRequest>} */
                var networkRequest = {};
                /** @type {number | undefined} */
                var after;
                /** @type {number | undefined} */
                var before;

                /** @type {Headers} */
                var requestHeaders = {};
                var originalSetRequestHeader = xhr.setRequestHeader.bind(xhr);
                xhr.setRequestHeader = function(/** @type {string} */ header, /** @type {string} */ value) {
                    if (shouldRecordHeader('request', options.recordHeaders, header)) {
                        requestHeaders[header] = value;
                    }
                    return originalSetRequestHeader(header, value);
                };
                networkRequest.requestHeaders = requestHeaders;

                var originalSend = xhr.send.bind(xhr);
                xhr.send = function(/** @type {Body} */ body) {
                    if (shouldRecordBody('request', options.recordBodyUrls, req.url)) {
                        networkRequest.requestBody = tryReadXHRBody(body);
                    }
                    after = win.performance.now();
                    return originalSend(body);
                };
                xhr.addEventListener('readystatechange', function() {
                    if (xhr.readyState !== xhr.DONE) {
                        return;
                    }
                    before = win.performance.now();
                    /** @type {Headers} */
                    var responseHeaders = {};
                    var rawHeaders = xhr.getAllResponseHeaders();
                    if (rawHeaders) {
                        var headers = rawHeaders.trim().split(/[\r\n]+/);
                        headers.forEach(function(line) {
                            if (!line) return;
                            var colonIndex = line.indexOf(': ');
                            if (colonIndex === -1) return;
                            var header = line.substring(0, colonIndex);
                            var value = line.substring(colonIndex + 2);
                            if (header && shouldRecordHeader('response', options.recordHeaders, header)) {
                                responseHeaders[header] = value;
                            }
                        });
                    }
                    networkRequest.responseHeaders = responseHeaders;
                    if (
                        shouldRecordBody('response', options.recordBodyUrls, req.url)
                    ) {
                        networkRequest.responseBody = tryReadXHRBody(xhr.response);
                    }
                    getRequestPerformanceEntry(
                        win,
                        'xmlhttprequest',
                        req.url,
                        after,
                        before
                    )
                        .then(function(entry) {
                            if (!entry) {
                                logger.error('Failed to get performance entry for XHR request to ' + req.url);
                                return;
                            }
                            /** @type {NetworkRequest} */
                            var request = {
                                url: entry.name,
                                method: req.method,
                                initiatorType: /** @type {InitiatorType} */ (entry.initiatorType),
                                status: xhr.status,
                                startTime: Math.round(entry.startTime),
                                endTime: Math.round(entry.responseEnd),
                                timeOrigin: getTimeOrigin(win),
                                requestHeaders: networkRequest.requestHeaders,
                                requestBody: networkRequest.requestBody,
                                responseHeaders: networkRequest.responseHeaders,
                                responseBody: networkRequest.responseBody,
                            };
                            cb({ requests: [request] });
                        })
                        .catch(function(e) {
                            logger.error('Error recording XHR request to ' + req.url + ': ' + String(e));
                        });
                });

                originalOpen.call(xhr, method, url, async, username, password);
            };
        }
    );
    return function() {
        restorePatch();
    };
}

/**
 * @param {networkCallback} cb
 * @param {Window} win
 * @param {Required<NetworkRecordOptions>} options
 * @returns {listenerHandler}
 */
function initFetchObserver(cb, win, options) {
    if (!options.initiatorTypes.includes('fetch')) {
        return function() {
            //
        };
    }

    var restorePatch = patch(win, 'fetch', function(/** @type {typeof fetch} */ originalFetch) {
        return function() {
            var req = new Request(arguments[0], arguments[1]);
            /** @type {Response | undefined} */
            var res;
            /** @type {Partial<NetworkRequest>} */
            var networkRequest = {};
            /** @type {number | undefined} */
            var after;
            /** @type {number | undefined} */
            var before;

            var originalFetchPromise;
            var requestBodyPromise = Promise.resolve(undefined);
            var responseBodyPromise = Promise.resolve(undefined);
            try {
                /** @type {Headers} */
                var requestHeaders = {};
                req.headers.forEach(function(value, header) {
                    if (shouldRecordHeader('request', options.recordHeaders, header)) {
                        requestHeaders[header] = value;
                    }
                });
                networkRequest.requestHeaders = requestHeaders;

                if (shouldRecordBody('request', options.recordBodyUrls, req.url)) {
                    requestBodyPromise = tryReadFetchBody(req)
                        .then(function(body) {
                            networkRequest.requestBody = body;
                        });
                }

                after = win.performance.now();
                originalFetchPromise = originalFetch.apply(win, arguments).then(function(response) {
                    res = response;
                    before = win.performance.now();

                    /** @type {Headers} */
                    var responseHeaders = {};
                    res.headers.forEach(function(value, header) {
                        if (shouldRecordHeader('response', options.recordHeaders, header)) {
                            responseHeaders[header] = value;
                        }
                    });
                    networkRequest.responseHeaders = responseHeaders;

                    if (shouldRecordBody('response', options.recordBodyUrls, req.url)) {
                        responseBodyPromise = tryReadFetchBody(res)
                            .then(function(body) {
                                networkRequest.responseBody = body;
                            });
                    }

                    return res;
                });
            } catch (e) {
                originalFetchPromise = Promise.reject(e);
            }

            // await concurrently so we don't delay the fetch response
            Promise.all([requestBodyPromise, responseBodyPromise, originalFetchPromise])
                .then(function () {
                    return getRequestPerformanceEntry(win, 'fetch', req.url, after, before);
                })
                .then(function(entry) {
                    if (!entry) {
                        logger.error('Failed to get performance entry for fetch request to ' + req.url);
                        return;
                    }
                    /** @type {NetworkRequest} */
                    var request = {
                        url: entry.name,
                        method: req.method,
                        initiatorType: /** @type {InitiatorType} */ (entry.initiatorType),
                        status: res ? res.status : undefined,
                        startTime: Math.round(entry.startTime),
                        endTime: Math.round(entry.responseEnd),
                        timeOrigin: getTimeOrigin(win),
                        requestHeaders: networkRequest.requestHeaders,
                        requestBody: networkRequest.requestBody,
                        responseHeaders: networkRequest.responseHeaders,
                        responseBody: networkRequest.responseBody,
                    };
                    cb({ requests: [request] });
                })
                .catch(function (e) {
                    logger.error('Error recording fetch request to ' + req.url + ': ' + String(e));
                });

            return originalFetchPromise;
        };
    });
    return function() {
        restorePatch();
    };
}

/**
 * @param {networkCallback} callback
 * @param {Window} win
 * @param {NetworkRecordOptions} options
 * @returns {listenerHandler}
 */
function initNetworkObserver(callback, win, options) {
    if (!('performance' in win)) {
        return function() {
            //
        };
    }

    var recordHeaders = Object.assign({}, defaultNetworkOptions.recordHeaders, options.recordHeaders || {});
    var recordBodyUrls = Object.assign({}, defaultNetworkOptions.recordBodyUrls, options.recordBodyUrls || {});
    options = Object.assign({}, options, {
        recordHeaders: recordHeaders,
        recordBodyUrls: recordBodyUrls,
    });
    var networkOptions = /** @type {Required<NetworkRecordOptions>} */ Object.assign({}, defaultNetworkOptions, options);

    /** @type {networkCallback} */
    var cb = function(data) {
        var requests = data.requests.filter(function(request) {
            var shouldIgnoreUrl = urlMatchesRegexList(request.url, networkOptions.ignoreRequestUrls || []);
            return !shouldIgnoreUrl && !networkOptions.ignoreRequestFn(request);
        });
        if (requests.length > 0 || data.isInitial) {
            callback(Object.assign({}, data, { requests: requests }));
        }
    };
    var performanceObserver = initPerformanceObserver(cb, win, networkOptions);
    var xhrObserver = initXhrObserver(cb, win, networkOptions);
    var fetchObserver = initFetchObserver(cb, win, networkOptions);
    return function() {
        performanceObserver();
        xhrObserver();
        fetchObserver();
    };
}

// arbitrary .mp suffix in case rrweb does publish this plugin later and we use it but need to handle
// a changed format in the mixpanel product.
export var NETWORK_PLUGIN_NAME = 'rrweb/network@1.mp';

/**
 * @param {NetworkRecordOptions} [options]
 * @returns {RecordPlugin}
 */
export var getRecordNetworkPlugin = function(options) {
    return {
        name: NETWORK_PLUGIN_NAME,
        observer: initNetworkObserver,
        options: options,
    };
};
