'use strict';

var Config = {
    DEBUG: false,
    LIB_VERSION: '2.47.0'
};

// since es6 imports are static and we run unit tests from the console, window won't be defined when importing this file
var window$1;
if (typeof(window) === 'undefined') {
    var loc = {
        hostname: ''
    };
    window$1 = {
        navigator: { userAgent: '' },
        document: {
            location: loc,
            referrer: ''
        },
        screen: { width: 0, height: 0 },
        location: loc
    };
} else {
    window$1 = window;
}

/*
 * Saved references to long variable names, so that closure compiler can
 * minimize file size.
 */

var ArrayProto = Array.prototype;
var FuncProto = Function.prototype;
var ObjProto = Object.prototype;
var slice = ArrayProto.slice;
var toString = ObjProto.toString;
var hasOwnProperty = ObjProto.hasOwnProperty;
var windowConsole = window$1.console;
var navigator = window$1.navigator;
var document$1 = window$1.document;
var windowOpera = window$1.opera;
var screen = window$1.screen;
var userAgent = navigator.userAgent;
var nativeBind = FuncProto.bind;
var nativeForEach = ArrayProto.forEach;
var nativeIndexOf = ArrayProto.indexOf;
var nativeMap = ArrayProto.map;
var nativeIsArray = Array.isArray;
var breaker = {};
var _ = {
    trim: function(str) {
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/Trim#Polyfill
        return str.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
    }
};

// Console override
var console = {
    /** @type {function(...*)} */
    log: function() {
        if (Config.DEBUG && !_.isUndefined(windowConsole) && windowConsole) {
            try {
                windowConsole.log.apply(windowConsole, arguments);
            } catch (err) {
                _.each(arguments, function(arg) {
                    windowConsole.log(arg);
                });
            }
        }
    },
    /** @type {function(...*)} */
    warn: function() {
        if (Config.DEBUG && !_.isUndefined(windowConsole) && windowConsole) {
            var args = ['Mixpanel warning:'].concat(_.toArray(arguments));
            try {
                windowConsole.warn.apply(windowConsole, args);
            } catch (err) {
                _.each(args, function(arg) {
                    windowConsole.warn(arg);
                });
            }
        }
    },
    /** @type {function(...*)} */
    error: function() {
        if (Config.DEBUG && !_.isUndefined(windowConsole) && windowConsole) {
            var args = ['Mixpanel error:'].concat(_.toArray(arguments));
            try {
                windowConsole.error.apply(windowConsole, args);
            } catch (err) {
                _.each(args, function(arg) {
                    windowConsole.error(arg);
                });
            }
        }
    },
    /** @type {function(...*)} */
    critical: function() {
        if (!_.isUndefined(windowConsole) && windowConsole) {
            var args = ['Mixpanel error:'].concat(_.toArray(arguments));
            try {
                windowConsole.error.apply(windowConsole, args);
            } catch (err) {
                _.each(args, function(arg) {
                    windowConsole.error(arg);
                });
            }
        }
    }
};

var log_func_with_prefix = function(func, prefix) {
    return function() {
        arguments[0] = '[' + prefix + '] ' + arguments[0];
        return func.apply(console, arguments);
    };
};
var console_with_prefix = function(prefix) {
    return {
        log: log_func_with_prefix(console.log, prefix),
        error: log_func_with_prefix(console.error, prefix),
        critical: log_func_with_prefix(console.critical, prefix)
    };
};


// UNDERSCORE
// Embed part of the Underscore Library
_.bind = function(func, context) {
    var args, bound;
    if (nativeBind && func.bind === nativeBind) {
        return nativeBind.apply(func, slice.call(arguments, 1));
    }
    if (!_.isFunction(func)) {
        throw new TypeError();
    }
    args = slice.call(arguments, 2);
    bound = function() {
        if (!(this instanceof bound)) {
            return func.apply(context, args.concat(slice.call(arguments)));
        }
        var ctor = {};
        ctor.prototype = func.prototype;
        var self = new ctor();
        ctor.prototype = null;
        var result = func.apply(self, args.concat(slice.call(arguments)));
        if (Object(result) === result) {
            return result;
        }
        return self;
    };
    return bound;
};

/**
 * @param {*=} obj
 * @param {function(...*)=} iterator
 * @param {Object=} context
 */
_.each = function(obj, iterator, context) {
    if (obj === null || obj === undefined) {
        return;
    }
    if (nativeForEach && obj.forEach === nativeForEach) {
        obj.forEach(iterator, context);
    } else if (obj.length === +obj.length) {
        for (var i = 0, l = obj.length; i < l; i++) {
            if (i in obj && iterator.call(context, obj[i], i, obj) === breaker) {
                return;
            }
        }
    } else {
        for (var key in obj) {
            if (hasOwnProperty.call(obj, key)) {
                if (iterator.call(context, obj[key], key, obj) === breaker) {
                    return;
                }
            }
        }
    }
};

_.extend = function(obj) {
    _.each(slice.call(arguments, 1), function(source) {
        for (var prop in source) {
            if (source[prop] !== void 0) {
                obj[prop] = source[prop];
            }
        }
    });
    return obj;
};

_.isArray = nativeIsArray || function(obj) {
    return toString.call(obj) === '[object Array]';
};

// from a comment on http://dbj.org/dbj/?p=286
// fails on only one very rare and deliberate custom object:
// var bomb = { toString : undefined, valueOf: function(o) { return "function BOMBA!"; }};
_.isFunction = function(f) {
    try {
        return /^\s*\bfunction\b/.test(f);
    } catch (x) {
        return false;
    }
};

_.isArguments = function(obj) {
    return !!(obj && hasOwnProperty.call(obj, 'callee'));
};

_.toArray = function(iterable) {
    if (!iterable) {
        return [];
    }
    if (iterable.toArray) {
        return iterable.toArray();
    }
    if (_.isArray(iterable)) {
        return slice.call(iterable);
    }
    if (_.isArguments(iterable)) {
        return slice.call(iterable);
    }
    return _.values(iterable);
};

_.map = function(arr, callback, context) {
    if (nativeMap && arr.map === nativeMap) {
        return arr.map(callback, context);
    } else {
        var results = [];
        _.each(arr, function(item) {
            results.push(callback.call(context, item));
        });
        return results;
    }
};

_.keys = function(obj) {
    var results = [];
    if (obj === null) {
        return results;
    }
    _.each(obj, function(value, key) {
        results[results.length] = key;
    });
    return results;
};

_.values = function(obj) {
    var results = [];
    if (obj === null) {
        return results;
    }
    _.each(obj, function(value) {
        results[results.length] = value;
    });
    return results;
};

_.include = function(obj, target) {
    var found = false;
    if (obj === null) {
        return found;
    }
    if (nativeIndexOf && obj.indexOf === nativeIndexOf) {
        return obj.indexOf(target) != -1;
    }
    _.each(obj, function(value) {
        if (found || (found = (value === target))) {
            return breaker;
        }
    });
    return found;
};

_.includes = function(str, needle) {
    return str.indexOf(needle) !== -1;
};

// Underscore Addons
_.inherit = function(subclass, superclass) {
    subclass.prototype = new superclass();
    subclass.prototype.constructor = subclass;
    subclass.superclass = superclass.prototype;
    return subclass;
};

_.isObject = function(obj) {
    return (obj === Object(obj) && !_.isArray(obj));
};

_.isEmptyObject = function(obj) {
    if (_.isObject(obj)) {
        for (var key in obj) {
            if (hasOwnProperty.call(obj, key)) {
                return false;
            }
        }
        return true;
    }
    return false;
};

_.isUndefined = function(obj) {
    return obj === void 0;
};

_.isString = function(obj) {
    return toString.call(obj) == '[object String]';
};

_.isDate = function(obj) {
    return toString.call(obj) == '[object Date]';
};

_.isNumber = function(obj) {
    return toString.call(obj) == '[object Number]';
};

_.isElement = function(obj) {
    return !!(obj && obj.nodeType === 1);
};

_.encodeDates = function(obj) {
    _.each(obj, function(v, k) {
        if (_.isDate(v)) {
            obj[k] = _.formatDate(v);
        } else if (_.isObject(v)) {
            obj[k] = _.encodeDates(v); // recurse
        }
    });
    return obj;
};

_.timestamp = function() {
    Date.now = Date.now || function() {
        return +new Date;
    };
    return Date.now();
};

_.formatDate = function(d) {
    // YYYY-MM-DDTHH:MM:SS in UTC
    function pad(n) {
        return n < 10 ? '0' + n : n;
    }
    return d.getUTCFullYear() + '-' +
        pad(d.getUTCMonth() + 1) + '-' +
        pad(d.getUTCDate()) + 'T' +
        pad(d.getUTCHours()) + ':' +
        pad(d.getUTCMinutes()) + ':' +
        pad(d.getUTCSeconds());
};

_.strip_empty_properties = function(p) {
    var ret = {};
    _.each(p, function(v, k) {
        if (_.isString(v) && v.length > 0) {
            ret[k] = v;
        }
    });
    return ret;
};

/*
 * this function returns a copy of object after truncating it.  If
 * passed an Array or Object it will iterate through obj and
 * truncate all the values recursively.
 */
_.truncate = function(obj, length) {
    var ret;

    if (typeof(obj) === 'string') {
        ret = obj.slice(0, length);
    } else if (_.isArray(obj)) {
        ret = [];
        _.each(obj, function(val) {
            ret.push(_.truncate(val, length));
        });
    } else if (_.isObject(obj)) {
        ret = {};
        _.each(obj, function(val, key) {
            ret[key] = _.truncate(val, length);
        });
    } else {
        ret = obj;
    }

    return ret;
};

_.JSONEncode = (function() {
    return function(mixed_val) {
        var value = mixed_val;
        var quote = function(string) {
            var escapable = /[\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g; // eslint-disable-line no-control-regex
            var meta = { // table of character substitutions
                '\b': '\\b',
                '\t': '\\t',
                '\n': '\\n',
                '\f': '\\f',
                '\r': '\\r',
                '"': '\\"',
                '\\': '\\\\'
            };

            escapable.lastIndex = 0;
            return escapable.test(string) ?
                '"' + string.replace(escapable, function(a) {
                    var c = meta[a];
                    return typeof c === 'string' ? c :
                        '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                }) + '"' :
                '"' + string + '"';
        };

        var str = function(key, holder) {
            var gap = '';
            var indent = '    ';
            var i = 0; // The loop counter.
            var k = ''; // The member key.
            var v = ''; // The member value.
            var length = 0;
            var mind = gap;
            var partial = [];
            var value = holder[key];

            // If the value has a toJSON method, call it to obtain a replacement value.
            if (value && typeof value === 'object' &&
                typeof value.toJSON === 'function') {
                value = value.toJSON(key);
            }

            // What happens next depends on the value's type.
            switch (typeof value) {
                case 'string':
                    return quote(value);

                case 'number':
                    // JSON numbers must be finite. Encode non-finite numbers as null.
                    return isFinite(value) ? String(value) : 'null';

                case 'boolean':
                case 'null':
                    // If the value is a boolean or null, convert it to a string. Note:
                    // typeof null does not produce 'null'. The case is included here in
                    // the remote chance that this gets fixed someday.

                    return String(value);

                case 'object':
                    // If the type is 'object', we might be dealing with an object or an array or
                    // null.
                    // Due to a specification blunder in ECMAScript, typeof null is 'object',
                    // so watch out for that case.
                    if (!value) {
                        return 'null';
                    }

                    // Make an array to hold the partial results of stringifying this object value.
                    gap += indent;
                    partial = [];

                    // Is the value an array?
                    if (toString.apply(value) === '[object Array]') {
                        // The value is an array. Stringify every element. Use null as a placeholder
                        // for non-JSON values.

                        length = value.length;
                        for (i = 0; i < length; i += 1) {
                            partial[i] = str(i, value) || 'null';
                        }

                        // Join all of the elements together, separated with commas, and wrap them in
                        // brackets.
                        v = partial.length === 0 ? '[]' :
                            gap ? '[\n' + gap +
                            partial.join(',\n' + gap) + '\n' +
                            mind + ']' :
                                '[' + partial.join(',') + ']';
                        gap = mind;
                        return v;
                    }

                    // Iterate through all of the keys in the object.
                    for (k in value) {
                        if (hasOwnProperty.call(value, k)) {
                            v = str(k, value);
                            if (v) {
                                partial.push(quote(k) + (gap ? ': ' : ':') + v);
                            }
                        }
                    }

                    // Join all of the member texts together, separated with commas,
                    // and wrap them in braces.
                    v = partial.length === 0 ? '{}' :
                        gap ? '{' + partial.join(',') + '' +
                        mind + '}' : '{' + partial.join(',') + '}';
                    gap = mind;
                    return v;
            }
        };

        // Make a fake root object containing our value under the key of ''.
        // Return the result of stringifying the value.
        return str('', {
            '': value
        });
    };
})();

/**
 * From https://github.com/douglascrockford/JSON-js/blob/master/json_parse.js
 * Slightly modified to throw a real Error rather than a POJO
 */
_.JSONDecode = (function() {
    var at, // The index of the current character
        ch, // The current character
        escapee = {
            '"': '"',
            '\\': '\\',
            '/': '/',
            'b': '\b',
            'f': '\f',
            'n': '\n',
            'r': '\r',
            't': '\t'
        },
        text,
        error = function(m) {
            var e = new SyntaxError(m);
            e.at = at;
            e.text = text;
            throw e;
        },
        next = function(c) {
            // If a c parameter is provided, verify that it matches the current character.
            if (c && c !== ch) {
                error('Expected \'' + c + '\' instead of \'' + ch + '\'');
            }
            // Get the next character. When there are no more characters,
            // return the empty string.
            ch = text.charAt(at);
            at += 1;
            return ch;
        },
        number = function() {
            // Parse a number value.
            var number,
                string = '';

            if (ch === '-') {
                string = '-';
                next('-');
            }
            while (ch >= '0' && ch <= '9') {
                string += ch;
                next();
            }
            if (ch === '.') {
                string += '.';
                while (next() && ch >= '0' && ch <= '9') {
                    string += ch;
                }
            }
            if (ch === 'e' || ch === 'E') {
                string += ch;
                next();
                if (ch === '-' || ch === '+') {
                    string += ch;
                    next();
                }
                while (ch >= '0' && ch <= '9') {
                    string += ch;
                    next();
                }
            }
            number = +string;
            if (!isFinite(number)) {
                error('Bad number');
            } else {
                return number;
            }
        },

        string = function() {
            // Parse a string value.
            var hex,
                i,
                string = '',
                uffff;
            // When parsing for string values, we must look for " and \ characters.
            if (ch === '"') {
                while (next()) {
                    if (ch === '"') {
                        next();
                        return string;
                    }
                    if (ch === '\\') {
                        next();
                        if (ch === 'u') {
                            uffff = 0;
                            for (i = 0; i < 4; i += 1) {
                                hex = parseInt(next(), 16);
                                if (!isFinite(hex)) {
                                    break;
                                }
                                uffff = uffff * 16 + hex;
                            }
                            string += String.fromCharCode(uffff);
                        } else if (typeof escapee[ch] === 'string') {
                            string += escapee[ch];
                        } else {
                            break;
                        }
                    } else {
                        string += ch;
                    }
                }
            }
            error('Bad string');
        },
        white = function() {
            // Skip whitespace.
            while (ch && ch <= ' ') {
                next();
            }
        },
        word = function() {
            // true, false, or null.
            switch (ch) {
                case 't':
                    next('t');
                    next('r');
                    next('u');
                    next('e');
                    return true;
                case 'f':
                    next('f');
                    next('a');
                    next('l');
                    next('s');
                    next('e');
                    return false;
                case 'n':
                    next('n');
                    next('u');
                    next('l');
                    next('l');
                    return null;
            }
            error('Unexpected "' + ch + '"');
        },
        value, // Placeholder for the value function.
        array = function() {
            // Parse an array value.
            var array = [];

            if (ch === '[') {
                next('[');
                white();
                if (ch === ']') {
                    next(']');
                    return array; // empty array
                }
                while (ch) {
                    array.push(value());
                    white();
                    if (ch === ']') {
                        next(']');
                        return array;
                    }
                    next(',');
                    white();
                }
            }
            error('Bad array');
        },
        object = function() {
            // Parse an object value.
            var key,
                object = {};

            if (ch === '{') {
                next('{');
                white();
                if (ch === '}') {
                    next('}');
                    return object; // empty object
                }
                while (ch) {
                    key = string();
                    white();
                    next(':');
                    if (Object.hasOwnProperty.call(object, key)) {
                        error('Duplicate key "' + key + '"');
                    }
                    object[key] = value();
                    white();
                    if (ch === '}') {
                        next('}');
                        return object;
                    }
                    next(',');
                    white();
                }
            }
            error('Bad object');
        };

    value = function() {
        // Parse a JSON value. It could be an object, an array, a string,
        // a number, or a word.
        white();
        switch (ch) {
            case '{':
                return object();
            case '[':
                return array();
            case '"':
                return string();
            case '-':
                return number();
            default:
                return ch >= '0' && ch <= '9' ? number() : word();
        }
    };

    // Return the json_parse function. It will have access to all of the
    // above functions and variables.
    return function(source) {
        var result;

        text = source;
        at = 0;
        ch = ' ';
        result = value();
        white();
        if (ch) {
            error('Syntax error');
        }

        return result;
    };
})();

_.base64Encode = function(data) {
    var b64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    var o1, o2, o3, h1, h2, h3, h4, bits, i = 0,
        ac = 0,
        enc = '',
        tmp_arr = [];

    if (!data) {
        return data;
    }

    data = _.utf8Encode(data);

    do { // pack three octets into four hexets
        o1 = data.charCodeAt(i++);
        o2 = data.charCodeAt(i++);
        o3 = data.charCodeAt(i++);

        bits = o1 << 16 | o2 << 8 | o3;

        h1 = bits >> 18 & 0x3f;
        h2 = bits >> 12 & 0x3f;
        h3 = bits >> 6 & 0x3f;
        h4 = bits & 0x3f;

        // use hexets to index into b64, and append result to encoded string
        tmp_arr[ac++] = b64.charAt(h1) + b64.charAt(h2) + b64.charAt(h3) + b64.charAt(h4);
    } while (i < data.length);

    enc = tmp_arr.join('');

    switch (data.length % 3) {
        case 1:
            enc = enc.slice(0, -2) + '==';
            break;
        case 2:
            enc = enc.slice(0, -1) + '=';
            break;
    }

    return enc;
};

_.utf8Encode = function(string) {
    string = (string + '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    var utftext = '',
        start,
        end;
    var stringl = 0,
        n;

    start = end = 0;
    stringl = string.length;

    for (n = 0; n < stringl; n++) {
        var c1 = string.charCodeAt(n);
        var enc = null;

        if (c1 < 128) {
            end++;
        } else if ((c1 > 127) && (c1 < 2048)) {
            enc = String.fromCharCode((c1 >> 6) | 192, (c1 & 63) | 128);
        } else {
            enc = String.fromCharCode((c1 >> 12) | 224, ((c1 >> 6) & 63) | 128, (c1 & 63) | 128);
        }
        if (enc !== null) {
            if (end > start) {
                utftext += string.substring(start, end);
            }
            utftext += enc;
            start = end = n + 1;
        }
    }

    if (end > start) {
        utftext += string.substring(start, string.length);
    }

    return utftext;
};

_.UUID = (function() {

    // Time-based entropy
    var T = function() {
        var time = 1 * new Date(); // cross-browser version of Date.now()
        var ticks;
        if (window$1.performance && window$1.performance.now) {
            ticks = window$1.performance.now();
        } else {
            // fall back to busy loop
            ticks = 0;

            // this while loop figures how many browser ticks go by
            // before 1*new Date() returns a new number, ie the amount
            // of ticks that go by per millisecond
            while (time == 1 * new Date()) {
                ticks++;
            }
        }
        return time.toString(16) + Math.floor(ticks).toString(16);
    };

    // Math.Random entropy
    var R = function() {
        return Math.random().toString(16).replace('.', '');
    };

    // User agent entropy
    // This function takes the user agent string, and then xors
    // together each sequence of 8 bytes.  This produces a final
    // sequence of 8 bytes which it returns as hex.
    var UA = function() {
        var ua = userAgent,
            i, ch, buffer = [],
            ret = 0;

        function xor(result, byte_array) {
            var j, tmp = 0;
            for (j = 0; j < byte_array.length; j++) {
                tmp |= (buffer[j] << j * 8);
            }
            return result ^ tmp;
        }

        for (i = 0; i < ua.length; i++) {
            ch = ua.charCodeAt(i);
            buffer.unshift(ch & 0xFF);
            if (buffer.length >= 4) {
                ret = xor(ret, buffer);
                buffer = [];
            }
        }

        if (buffer.length > 0) {
            ret = xor(ret, buffer);
        }

        return ret.toString(16);
    };

    return function() {
        var se = (screen.height * screen.width).toString(16);
        return (T() + '-' + R() + '-' + UA() + '-' + se + '-' + T());
    };
})();

// _.isBlockedUA()
// This is to block various web spiders from executing our JS and
// sending false tracking data
var BLOCKED_UA_STRS = [
    'ahrefsbot',
    'baiduspider',
    'bingbot',
    'bingpreview',
    'facebookexternal',
    'petalbot',
    'pinterest',
    'screaming frog',
    'yahoo! slurp',
    'yandexbot',

    // a whole bunch of goog-specific crawlers
    // https://developers.google.com/search/docs/advanced/crawling/overview-google-crawlers
    'adsbot-google',
    'apis-google',
    'duplexweb-google',
    'feedfetcher-google',
    'google favicon',
    'google web preview',
    'google-read-aloud',
    'googlebot',
    'googleweblight',
    'mediapartners-google',
    'storebot-google'
];
_.isBlockedUA = function(ua) {
    var i;
    ua = ua.toLowerCase();
    for (i = 0; i < BLOCKED_UA_STRS.length; i++) {
        if (ua.indexOf(BLOCKED_UA_STRS[i]) !== -1) {
            return true;
        }
    }
    return false;
};

/**
 * @param {Object=} formdata
 * @param {string=} arg_separator
 */
_.HTTPBuildQuery = function(formdata, arg_separator) {
    var use_val, use_key, tmp_arr = [];

    if (_.isUndefined(arg_separator)) {
        arg_separator = '&';
    }

    _.each(formdata, function(val, key) {
        use_val = encodeURIComponent(val.toString());
        use_key = encodeURIComponent(key);
        tmp_arr[tmp_arr.length] = use_key + '=' + use_val;
    });

    return tmp_arr.join(arg_separator);
};

_.getQueryParam = function(url, param) {
    // Expects a raw URL

    param = param.replace(/[[]/, '\\[').replace(/[\]]/, '\\]');
    var regexS = '[\\?&]' + param + '=([^&#]*)',
        regex = new RegExp(regexS),
        results = regex.exec(url);
    if (results === null || (results && typeof(results[1]) !== 'string' && results[1].length)) {
        return '';
    } else {
        var result = results[1];
        try {
            result = decodeURIComponent(result);
        } catch(err) {
            console.error('Skipping decoding for malformed query param: ' + result);
        }
        return result.replace(/\+/g, ' ');
    }
};


// _.cookie
// Methods partially borrowed from quirksmode.org/js/cookies.html
_.cookie = {
    get: function(name) {
        var nameEQ = name + '=';
        var ca = document$1.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') {
                c = c.substring(1, c.length);
            }
            if (c.indexOf(nameEQ) === 0) {
                return decodeURIComponent(c.substring(nameEQ.length, c.length));
            }
        }
        return null;
    },

    parse: function(name) {
        var cookie;
        try {
            cookie = _.JSONDecode(_.cookie.get(name)) || {};
        } catch (err) {
            // noop
        }
        return cookie;
    },

    set_seconds: function(name, value, seconds, is_cross_subdomain, is_secure, is_cross_site, domain_override) {
        var cdomain = '',
            expires = '',
            secure = '';

        if (domain_override) {
            cdomain = '; domain=' + domain_override;
        } else if (is_cross_subdomain) {
            var domain = extract_domain(document$1.location.hostname);
            cdomain = domain ? '; domain=.' + domain : '';
        }

        if (seconds) {
            var date = new Date();
            date.setTime(date.getTime() + (seconds * 1000));
            expires = '; expires=' + date.toGMTString();
        }

        if (is_cross_site) {
            is_secure = true;
            secure = '; SameSite=None';
        }
        if (is_secure) {
            secure += '; secure';
        }

        document$1.cookie = name + '=' + encodeURIComponent(value) + expires + '; path=/' + cdomain + secure;
    },

    set: function(name, value, days, is_cross_subdomain, is_secure, is_cross_site, domain_override) {
        var cdomain = '', expires = '', secure = '';

        if (domain_override) {
            cdomain = '; domain=' + domain_override;
        } else if (is_cross_subdomain) {
            var domain = extract_domain(document$1.location.hostname);
            cdomain = domain ? '; domain=.' + domain : '';
        }

        if (days) {
            var date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = '; expires=' + date.toGMTString();
        }

        if (is_cross_site) {
            is_secure = true;
            secure = '; SameSite=None';
        }
        if (is_secure) {
            secure += '; secure';
        }

        var new_cookie_val = name + '=' + encodeURIComponent(value) + expires + '; path=/' + cdomain + secure;
        document$1.cookie = new_cookie_val;
        return new_cookie_val;
    },

    remove: function(name, is_cross_subdomain, domain_override) {
        _.cookie.set(name, '', -1, is_cross_subdomain, false, false, domain_override);
    }
};

var _localStorageSupported = null;
var localStorageSupported = function(storage, forceCheck) {
    if (_localStorageSupported !== null && !forceCheck) {
        return _localStorageSupported;
    }

    var supported = true;
    try {
        storage = storage || window.localStorage;
        var key = '__mplss_' + cheap_guid(8),
            val = 'xyz';
        storage.setItem(key, val);
        if (storage.getItem(key) !== val) {
            supported = false;
        }
        storage.removeItem(key);
    } catch (err) {
        supported = false;
    }

    _localStorageSupported = supported;
    return supported;
};

// _.localStorage
_.localStorage = {
    is_supported: function(force_check) {
        var supported = localStorageSupported(null, force_check);
        if (!supported) {
            console.error('localStorage unsupported; falling back to cookie store');
        }
        return supported;
    },

    error: function(msg) {
        console.error('localStorage error: ' + msg);
    },

    get: function(name) {
        try {
            return window.localStorage.getItem(name);
        } catch (err) {
            _.localStorage.error(err);
        }
        return null;
    },

    parse: function(name) {
        try {
            return _.JSONDecode(_.localStorage.get(name)) || {};
        } catch (err) {
            // noop
        }
        return null;
    },

    set: function(name, value) {
        try {
            window.localStorage.setItem(name, value);
        } catch (err) {
            _.localStorage.error(err);
        }
    },

    remove: function(name) {
        try {
            window.localStorage.removeItem(name);
        } catch (err) {
            _.localStorage.error(err);
        }
    }
};

_.register_event = (function() {
    // written by Dean Edwards, 2005
    // with input from Tino Zijdel - crisp@xs4all.nl
    // with input from Carl Sverre - mail@carlsverre.com
    // with input from Mixpanel
    // http://dean.edwards.name/weblog/2005/10/add-event/
    // https://gist.github.com/1930440

    /**
     * @param {Object} element
     * @param {string} type
     * @param {function(...*)} handler
     * @param {boolean=} oldSchool
     * @param {boolean=} useCapture
     */
    var register_event = function(element, type, handler, oldSchool, useCapture) {
        if (!element) {
            console.error('No valid element provided to register_event');
            return;
        }

        if (element.addEventListener && !oldSchool) {
            element.addEventListener(type, handler, !!useCapture);
        } else {
            var ontype = 'on' + type;
            var old_handler = element[ontype]; // can be undefined
            element[ontype] = makeHandler(element, handler, old_handler);
        }
    };

    function makeHandler(element, new_handler, old_handlers) {
        var handler = function(event) {
            event = event || fixEvent(window.event);

            // this basically happens in firefox whenever another script
            // overwrites the onload callback and doesn't pass the event
            // object to previously defined callbacks.  All the browsers
            // that don't define window.event implement addEventListener
            // so the dom_loaded handler will still be fired as usual.
            if (!event) {
                return undefined;
            }

            var ret = true;
            var old_result, new_result;

            if (_.isFunction(old_handlers)) {
                old_result = old_handlers(event);
            }
            new_result = new_handler.call(element, event);

            if ((false === old_result) || (false === new_result)) {
                ret = false;
            }

            return ret;
        };

        return handler;
    }

    function fixEvent(event) {
        if (event) {
            event.preventDefault = fixEvent.preventDefault;
            event.stopPropagation = fixEvent.stopPropagation;
        }
        return event;
    }
    fixEvent.preventDefault = function() {
        this.returnValue = false;
    };
    fixEvent.stopPropagation = function() {
        this.cancelBubble = true;
    };

    return register_event;
})();


var TOKEN_MATCH_REGEX = new RegExp('^(\\w*)\\[(\\w+)([=~\\|\\^\\$\\*]?)=?"?([^\\]"]*)"?\\]$');

_.dom_query = (function() {
    /* document.getElementsBySelector(selector)
    - returns an array of element objects from the current document
    matching the CSS selector. Selectors can contain element names,
    class names and ids and can be nested. For example:

    elements = document.getElementsBySelector('div#main p a.external')

    Will return an array of all 'a' elements with 'external' in their
    class attribute that are contained inside 'p' elements that are
    contained inside the 'div' element which has id="main"

    New in version 0.4: Support for CSS2 and CSS3 attribute selectors:
    See http://www.w3.org/TR/css3-selectors/#attribute-selectors

    Version 0.4 - Simon Willison, March 25th 2003
    -- Works in Phoenix 0.5, Mozilla 1.3, Opera 7, Internet Explorer 6, Internet Explorer 5 on Windows
    -- Opera 7 fails

    Version 0.5 - Carl Sverre, Jan 7th 2013
    -- Now uses jQuery-esque `hasClass` for testing class name
    equality.  This fixes a bug related to '-' characters being
    considered not part of a 'word' in regex.
    */

    function getAllChildren(e) {
        // Returns all children of element. Workaround required for IE5/Windows. Ugh.
        return e.all ? e.all : e.getElementsByTagName('*');
    }

    var bad_whitespace = /[\t\r\n]/g;

    function hasClass(elem, selector) {
        var className = ' ' + selector + ' ';
        return ((' ' + elem.className + ' ').replace(bad_whitespace, ' ').indexOf(className) >= 0);
    }

    function getElementsBySelector(selector) {
        // Attempt to fail gracefully in lesser browsers
        if (!document$1.getElementsByTagName) {
            return [];
        }
        // Split selector in to tokens
        var tokens = selector.split(' ');
        var token, bits, tagName, found, foundCount, i, j, k, elements, currentContextIndex;
        var currentContext = [document$1];
        for (i = 0; i < tokens.length; i++) {
            token = tokens[i].replace(/^\s+/, '').replace(/\s+$/, '');
            if (token.indexOf('#') > -1) {
                // Token is an ID selector
                bits = token.split('#');
                tagName = bits[0];
                var id = bits[1];
                var element = document$1.getElementById(id);
                if (!element || (tagName && element.nodeName.toLowerCase() != tagName)) {
                    // element not found or tag with that ID not found, return false
                    return [];
                }
                // Set currentContext to contain just this element
                currentContext = [element];
                continue; // Skip to next token
            }
            if (token.indexOf('.') > -1) {
                // Token contains a class selector
                bits = token.split('.');
                tagName = bits[0];
                var className = bits[1];
                if (!tagName) {
                    tagName = '*';
                }
                // Get elements matching tag, filter them for class selector
                found = [];
                foundCount = 0;
                for (j = 0; j < currentContext.length; j++) {
                    if (tagName == '*') {
                        elements = getAllChildren(currentContext[j]);
                    } else {
                        elements = currentContext[j].getElementsByTagName(tagName);
                    }
                    for (k = 0; k < elements.length; k++) {
                        found[foundCount++] = elements[k];
                    }
                }
                currentContext = [];
                currentContextIndex = 0;
                for (j = 0; j < found.length; j++) {
                    if (found[j].className &&
                        _.isString(found[j].className) && // some SVG elements have classNames which are not strings
                        hasClass(found[j], className)
                    ) {
                        currentContext[currentContextIndex++] = found[j];
                    }
                }
                continue; // Skip to next token
            }
            // Code to deal with attribute selectors
            var token_match = token.match(TOKEN_MATCH_REGEX);
            if (token_match) {
                tagName = token_match[1];
                var attrName = token_match[2];
                var attrOperator = token_match[3];
                var attrValue = token_match[4];
                if (!tagName) {
                    tagName = '*';
                }
                // Grab all of the tagName elements within current context
                found = [];
                foundCount = 0;
                for (j = 0; j < currentContext.length; j++) {
                    if (tagName == '*') {
                        elements = getAllChildren(currentContext[j]);
                    } else {
                        elements = currentContext[j].getElementsByTagName(tagName);
                    }
                    for (k = 0; k < elements.length; k++) {
                        found[foundCount++] = elements[k];
                    }
                }
                currentContext = [];
                currentContextIndex = 0;
                var checkFunction; // This function will be used to filter the elements
                switch (attrOperator) {
                    case '=': // Equality
                        checkFunction = function(e) {
                            return (e.getAttribute(attrName) == attrValue);
                        };
                        break;
                    case '~': // Match one of space seperated words
                        checkFunction = function(e) {
                            return (e.getAttribute(attrName).match(new RegExp('\\b' + attrValue + '\\b')));
                        };
                        break;
                    case '|': // Match start with value followed by optional hyphen
                        checkFunction = function(e) {
                            return (e.getAttribute(attrName).match(new RegExp('^' + attrValue + '-?')));
                        };
                        break;
                    case '^': // Match starts with value
                        checkFunction = function(e) {
                            return (e.getAttribute(attrName).indexOf(attrValue) === 0);
                        };
                        break;
                    case '$': // Match ends with value - fails with "Warning" in Opera 7
                        checkFunction = function(e) {
                            return (e.getAttribute(attrName).lastIndexOf(attrValue) == e.getAttribute(attrName).length - attrValue.length);
                        };
                        break;
                    case '*': // Match ends with value
                        checkFunction = function(e) {
                            return (e.getAttribute(attrName).indexOf(attrValue) > -1);
                        };
                        break;
                    default:
                        // Just test for existence of attribute
                        checkFunction = function(e) {
                            return e.getAttribute(attrName);
                        };
                }
                currentContext = [];
                currentContextIndex = 0;
                for (j = 0; j < found.length; j++) {
                    if (checkFunction(found[j])) {
                        currentContext[currentContextIndex++] = found[j];
                    }
                }
                // alert('Attribute Selector: '+tagName+' '+attrName+' '+attrOperator+' '+attrValue);
                continue; // Skip to next token
            }
            // If we get here, token is JUST an element (not a class or ID selector)
            tagName = token;
            found = [];
            foundCount = 0;
            for (j = 0; j < currentContext.length; j++) {
                elements = currentContext[j].getElementsByTagName(tagName);
                for (k = 0; k < elements.length; k++) {
                    found[foundCount++] = elements[k];
                }
            }
            currentContext = found;
        }
        return currentContext;
    }

    return function(query) {
        if (_.isElement(query)) {
            return [query];
        } else if (_.isObject(query) && !_.isUndefined(query.length)) {
            return query;
        } else {
            return getElementsBySelector.call(this, query);
        }
    };
})();

var CAMPAIGN_KEYWORDS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
var CLICK_IDS = ['dclid', 'fbclid', 'gclid', 'ko_click_id', 'li_fat_id', 'msclkid', 'ttclid', 'twclid', 'wbraid'];

_.info = {
    campaignParams: function(default_value) {
        var kw = '',
            params = {};
        _.each(CAMPAIGN_KEYWORDS, function(kwkey) {
            kw = _.getQueryParam(document$1.URL, kwkey);
            if (kw.length) {
                params[kwkey] = kw;
            } else if (default_value !== undefined) {
                params[kwkey] = default_value;
            }
        });

        return params;
    },

    clickParams: function() {
        var id = '',
            params = {};
        _.each(CLICK_IDS, function(idkey) {
            id = _.getQueryParam(document$1.URL, idkey);
            if (id.length) {
                params[idkey] = id;
            }
        });

        return params;
    },

    marketingParams: function() {
        return _.extend(_.info.campaignParams(), _.info.clickParams());
    },

    searchEngine: function(referrer) {
        if (referrer.search('https?://(.*)google.([^/?]*)') === 0) {
            return 'google';
        } else if (referrer.search('https?://(.*)bing.com') === 0) {
            return 'bing';
        } else if (referrer.search('https?://(.*)yahoo.com') === 0) {
            return 'yahoo';
        } else if (referrer.search('https?://(.*)duckduckgo.com') === 0) {
            return 'duckduckgo';
        } else {
            return null;
        }
    },

    searchInfo: function(referrer) {
        var search = _.info.searchEngine(referrer),
            param = (search != 'yahoo') ? 'q' : 'p',
            ret = {};

        if (search !== null) {
            ret['$search_engine'] = search;

            var keyword = _.getQueryParam(referrer, param);
            if (keyword.length) {
                ret['mp_keyword'] = keyword;
            }
        }

        return ret;
    },

    /**
     * This function detects which browser is running this script.
     * The order of the checks are important since many user agents
     * include key words used in later checks.
     */
    browser: function(user_agent, vendor, opera) {
        vendor = vendor || ''; // vendor is undefined for at least IE9
        if (opera || _.includes(user_agent, ' OPR/')) {
            if (_.includes(user_agent, 'Mini')) {
                return 'Opera Mini';
            }
            return 'Opera';
        } else if (/(BlackBerry|PlayBook|BB10)/i.test(user_agent)) {
            return 'BlackBerry';
        } else if (_.includes(user_agent, 'IEMobile') || _.includes(user_agent, 'WPDesktop')) {
            return 'Internet Explorer Mobile';
        } else if (_.includes(user_agent, 'SamsungBrowser/')) {
            // https://developer.samsung.com/internet/user-agent-string-format
            return 'Samsung Internet';
        } else if (_.includes(user_agent, 'Edge') || _.includes(user_agent, 'Edg/')) {
            return 'Microsoft Edge';
        } else if (_.includes(user_agent, 'FBIOS')) {
            return 'Facebook Mobile';
        } else if (_.includes(user_agent, 'Chrome')) {
            return 'Chrome';
        } else if (_.includes(user_agent, 'CriOS')) {
            return 'Chrome iOS';
        } else if (_.includes(user_agent, 'UCWEB') || _.includes(user_agent, 'UCBrowser')) {
            return 'UC Browser';
        } else if (_.includes(user_agent, 'FxiOS')) {
            return 'Firefox iOS';
        } else if (_.includes(vendor, 'Apple')) {
            if (_.includes(user_agent, 'Mobile')) {
                return 'Mobile Safari';
            }
            return 'Safari';
        } else if (_.includes(user_agent, 'Android')) {
            return 'Android Mobile';
        } else if (_.includes(user_agent, 'Konqueror')) {
            return 'Konqueror';
        } else if (_.includes(user_agent, 'Firefox')) {
            return 'Firefox';
        } else if (_.includes(user_agent, 'MSIE') || _.includes(user_agent, 'Trident/')) {
            return 'Internet Explorer';
        } else if (_.includes(user_agent, 'Gecko')) {
            return 'Mozilla';
        } else {
            return '';
        }
    },

    /**
     * This function detects which browser version is running this script,
     * parsing major and minor version (e.g., 42.1). User agent strings from:
     * http://www.useragentstring.com/pages/useragentstring.php
     */
    browserVersion: function(userAgent, vendor, opera) {
        var browser = _.info.browser(userAgent, vendor, opera);
        var versionRegexs = {
            'Internet Explorer Mobile': /rv:(\d+(\.\d+)?)/,
            'Microsoft Edge': /Edge?\/(\d+(\.\d+)?)/,
            'Chrome': /Chrome\/(\d+(\.\d+)?)/,
            'Chrome iOS': /CriOS\/(\d+(\.\d+)?)/,
            'UC Browser' : /(UCBrowser|UCWEB)\/(\d+(\.\d+)?)/,
            'Safari': /Version\/(\d+(\.\d+)?)/,
            'Mobile Safari': /Version\/(\d+(\.\d+)?)/,
            'Opera': /(Opera|OPR)\/(\d+(\.\d+)?)/,
            'Firefox': /Firefox\/(\d+(\.\d+)?)/,
            'Firefox iOS': /FxiOS\/(\d+(\.\d+)?)/,
            'Konqueror': /Konqueror:(\d+(\.\d+)?)/,
            'BlackBerry': /BlackBerry (\d+(\.\d+)?)/,
            'Android Mobile': /android\s(\d+(\.\d+)?)/,
            'Samsung Internet': /SamsungBrowser\/(\d+(\.\d+)?)/,
            'Internet Explorer': /(rv:|MSIE )(\d+(\.\d+)?)/,
            'Mozilla': /rv:(\d+(\.\d+)?)/
        };
        var regex = versionRegexs[browser];
        if (regex === undefined) {
            return null;
        }
        var matches = userAgent.match(regex);
        if (!matches) {
            return null;
        }
        return parseFloat(matches[matches.length - 2]);
    },

    os: function() {
        var a = userAgent;
        if (/Windows/i.test(a)) {
            if (/Phone/.test(a) || /WPDesktop/.test(a)) {
                return 'Windows Phone';
            }
            return 'Windows';
        } else if (/(iPhone|iPad|iPod)/.test(a)) {
            return 'iOS';
        } else if (/Android/.test(a)) {
            return 'Android';
        } else if (/(BlackBerry|PlayBook|BB10)/i.test(a)) {
            return 'BlackBerry';
        } else if (/Mac/i.test(a)) {
            return 'Mac OS X';
        } else if (/Linux/.test(a)) {
            return 'Linux';
        } else if (/CrOS/.test(a)) {
            return 'Chrome OS';
        } else {
            return '';
        }
    },

    device: function(user_agent) {
        if (/Windows Phone/i.test(user_agent) || /WPDesktop/.test(user_agent)) {
            return 'Windows Phone';
        } else if (/iPad/.test(user_agent)) {
            return 'iPad';
        } else if (/iPod/.test(user_agent)) {
            return 'iPod Touch';
        } else if (/iPhone/.test(user_agent)) {
            return 'iPhone';
        } else if (/(BlackBerry|PlayBook|BB10)/i.test(user_agent)) {
            return 'BlackBerry';
        } else if (/Android/.test(user_agent)) {
            return 'Android';
        } else {
            return '';
        }
    },

    referringDomain: function(referrer) {
        var split = referrer.split('/');
        if (split.length >= 3) {
            return split[2];
        }
        return '';
    },

    properties: function() {
        return _.extend(_.strip_empty_properties({
            '$os': _.info.os(),
            '$browser': _.info.browser(userAgent, navigator.vendor, windowOpera),
            '$referrer': document$1.referrer,
            '$referring_domain': _.info.referringDomain(document$1.referrer),
            '$device': _.info.device(userAgent)
        }), {
            '$current_url': window$1.location.href,
            '$browser_version': _.info.browserVersion(userAgent, navigator.vendor, windowOpera),
            '$screen_height': screen.height,
            '$screen_width': screen.width,
            'mp_lib': 'web',
            '$lib_version': Config.LIB_VERSION,
            '$insert_id': cheap_guid(),
            'time': _.timestamp() / 1000 // epoch time in seconds
        });
    },

    people_properties: function() {
        return _.extend(_.strip_empty_properties({
            '$os': _.info.os(),
            '$browser': _.info.browser(userAgent, navigator.vendor, windowOpera)
        }), {
            '$browser_version': _.info.browserVersion(userAgent, navigator.vendor, windowOpera)
        });
    },

    mpPageViewProperties: function() {
        return _.strip_empty_properties({
            'current_page_title': document$1.title,
            'current_domain': window$1.location.hostname,
            'current_url_path': window$1.location.pathname,
            'current_url_protocol': window$1.location.protocol,
            'current_url_search': window$1.location.search
        });
    }
};

var cheap_guid = function(maxlen) {
    var guid = Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
    return maxlen ? guid.substring(0, maxlen) : guid;
};

// naive way to extract domain name (example.com) from full hostname (my.sub.example.com)
var SIMPLE_DOMAIN_MATCH_REGEX = /[a-z0-9][a-z0-9-]*\.[a-z]+$/i;
// this next one attempts to account for some ccSLDs, e.g. extracting oxford.ac.uk from www.oxford.ac.uk
var DOMAIN_MATCH_REGEX = /[a-z0-9][a-z0-9-]+\.[a-z.]{2,6}$/i;
/**
 * Attempts to extract main domain name from full hostname, using a few blunt heuristics. For
 * common TLDs like .com/.org that always have a simple SLD.TLD structure (example.com), we
 * simply extract the last two .-separated parts of the hostname (SIMPLE_DOMAIN_MATCH_REGEX).
 * For others, we attempt to account for short ccSLD+TLD combos (.ac.uk) with the legacy
 * DOMAIN_MATCH_REGEX (kept to maintain backwards compatibility with existing Mixpanel
 * integrations). The only _reliable_ way to extract domain from hostname is with an up-to-date
 * list like at https://publicsuffix.org/ so for cases that this helper fails at, the SDK
 * offers the 'cookie_domain' config option to set it explicitly.
 * @example
 * extract_domain('my.sub.example.com')
 * // 'example.com'
 */
var extract_domain = function(hostname) {
    var domain_regex = DOMAIN_MATCH_REGEX;
    var parts = hostname.split('.');
    var tld = parts[parts.length - 1];
    if (tld.length > 4 || tld === 'com' || tld === 'org') {
        domain_regex = SIMPLE_DOMAIN_MATCH_REGEX;
    }
    var matches = hostname.match(domain_regex);
    return matches ? matches[0] : '';
};

var JSONStringify = null;
var JSONParse = null;
if (typeof JSON !== 'undefined') {
    JSONStringify = JSON.stringify;
    JSONParse = JSON.parse;
}
JSONStringify = JSONStringify || _.JSONEncode;
JSONParse = JSONParse || _.JSONDecode;

// EXPORTS (for closure compiler)
_['toArray']                = _.toArray;
_['isObject']               = _.isObject;
_['JSONEncode']             = _.JSONEncode;
_['JSONDecode']             = _.JSONDecode;
_['isBlockedUA']            = _.isBlockedUA;
_['isEmptyObject']          = _.isEmptyObject;
_['info']                   = _.info;
_['info']['device']         = _.info.device;
_['info']['browser']        = _.info.browser;
_['info']['browserVersion'] = _.info.browserVersion;
_['info']['properties']     = _.info.properties;

/**
 * DomTracker Object
 * @constructor
 */
var DomTracker = function() {};


// interface
DomTracker.prototype.create_properties = function() {};
DomTracker.prototype.event_handler = function() {};
DomTracker.prototype.after_track_handler = function() {};

DomTracker.prototype.init = function(mixpanel_instance) {
    this.mp = mixpanel_instance;
    return this;
};

/**
 * @param {Object|string} query
 * @param {string} event_name
 * @param {Object=} properties
 * @param {function=} user_callback
 */
DomTracker.prototype.track = function(query, event_name, properties, user_callback) {
    var that = this;
    var elements = _.dom_query(query);

    if (elements.length === 0) {
        console.error('The DOM query (' + query + ') returned 0 elements');
        return;
    }

    _.each(elements, function(element) {
        _.register_event(element, this.override_event, function(e) {
            var options = {};
            var props = that.create_properties(properties, this);
            var timeout = that.mp.get_config('track_links_timeout');

            that.event_handler(e, this, options);

            // in case the mixpanel servers don't get back to us in time
            window.setTimeout(that.track_callback(user_callback, props, options, true), timeout);

            // fire the tracking event
            that.mp.track(event_name, props, that.track_callback(user_callback, props, options));
        });
    }, this);

    return true;
};

/**
 * @param {function} user_callback
 * @param {Object} props
 * @param {boolean=} timeout_occured
 */
DomTracker.prototype.track_callback = function(user_callback, props, options, timeout_occured) {
    timeout_occured = timeout_occured || false;
    var that = this;

    return function() {
        // options is referenced from both callbacks, so we can have
        // a 'lock' of sorts to ensure only one fires
        if (options.callback_fired) { return; }
        options.callback_fired = true;

        if (user_callback && user_callback(timeout_occured, props) === false) {
            // user can prevent the default functionality by
            // returning false from their callback
            return;
        }

        that.after_track_handler(props, options, timeout_occured);
    };
};

DomTracker.prototype.create_properties = function(properties, element) {
    var props;

    if (typeof(properties) === 'function') {
        props = properties(element);
    } else {
        props = _.extend({}, properties);
    }

    return props;
};

/**
 * LinkTracker Object
 * @constructor
 * @extends DomTracker
 */
var LinkTracker = function() {
    this.override_event = 'click';
};
_.inherit(LinkTracker, DomTracker);

LinkTracker.prototype.create_properties = function(properties, element) {
    var props = LinkTracker.superclass.create_properties.apply(this, arguments);

    if (element.href) { props['url'] = element.href; }

    return props;
};

LinkTracker.prototype.event_handler = function(evt, element, options) {
    options.new_tab = (
        evt.which === 2 ||
        evt.metaKey ||
        evt.ctrlKey ||
        element.target === '_blank'
    );
    options.href = element.href;

    if (!options.new_tab) {
        evt.preventDefault();
    }
};

LinkTracker.prototype.after_track_handler = function(props, options) {
    if (options.new_tab) { return; }

    setTimeout(function() {
        window.location = options.href;
    }, 0);
};

/**
 * FormTracker Object
 * @constructor
 * @extends DomTracker
 */
var FormTracker = function() {
    this.override_event = 'submit';
};
_.inherit(FormTracker, DomTracker);

FormTracker.prototype.event_handler = function(evt, element, options) {
    options.element = element;
    evt.preventDefault();
};

FormTracker.prototype.after_track_handler = function(props, options) {
    setTimeout(function() {
        options.element.submit();
    }, 0);
};

// eslint-disable-line camelcase

var logger$2 = console_with_prefix('lock');

/**
 * SharedLock: a mutex built on HTML5 localStorage, to ensure that only one browser
 * window/tab at a time will be able to access shared resources.
 *
 * Based on the Alur and Taubenfeld fast lock
 * (http://www.cs.rochester.edu/research/synchronization/pseudocode/fastlock.html)
 * with an added timeout to ensure there will be eventual progress in the event
 * that a window is closed in the middle of the callback.
 *
 * Implementation based on the original version by David Wolever (https://github.com/wolever)
 * at https://gist.github.com/wolever/5fd7573d1ef6166e8f8c4af286a69432.
 *
 * @example
 * const myLock = new SharedLock('some-key');
 * myLock.withLock(function() {
 *   console.log('I hold the mutex!');
 * });
 *
 * @constructor
 */
var SharedLock = function(key, options) {
    options = options || {};

    this.storageKey = key;
    this.storage = options.storage || window.localStorage;
    this.pollIntervalMS = options.pollIntervalMS || 100;
    this.timeoutMS = options.timeoutMS || 2000;
};

// pass in a specific pid to test contention scenarios; otherwise
// it is chosen randomly for each acquisition attempt
SharedLock.prototype.withLock = function(lockedCB, errorCB, pid) {
    if (!pid && typeof errorCB !== 'function') {
        pid = errorCB;
        errorCB = null;
    }

    var i = pid || (new Date().getTime() + '|' + Math.random());
    var startTime = new Date().getTime();

    var key = this.storageKey;
    var pollIntervalMS = this.pollIntervalMS;
    var timeoutMS = this.timeoutMS;
    var storage = this.storage;

    var keyX = key + ':X';
    var keyY = key + ':Y';
    var keyZ = key + ':Z';

    var reportError = function(err) {
        errorCB && errorCB(err);
    };

    var delay = function(cb) {
        if (new Date().getTime() - startTime > timeoutMS) {
            logger$2.error('Timeout waiting for mutex on ' + key + '; clearing lock. [' + i + ']');
            storage.removeItem(keyZ);
            storage.removeItem(keyY);
            loop();
            return;
        }
        setTimeout(function() {
            try {
                cb();
            } catch(err) {
                reportError(err);
            }
        }, pollIntervalMS * (Math.random() + 0.1));
    };

    var waitFor = function(predicate, cb) {
        if (predicate()) {
            cb();
        } else {
            delay(function() {
                waitFor(predicate, cb);
            });
        }
    };

    var getSetY = function() {
        var valY = storage.getItem(keyY);
        if (valY && valY !== i) { // if Y == i then this process already has the lock (useful for test cases)
            return false;
        } else {
            storage.setItem(keyY, i);
            if (storage.getItem(keyY) === i) {
                return true;
            } else {
                if (!localStorageSupported(storage, true)) {
                    throw new Error('localStorage support dropped while acquiring lock');
                }
                return false;
            }
        }
    };

    var loop = function() {
        storage.setItem(keyX, i);

        waitFor(getSetY, function() {
            if (storage.getItem(keyX) === i) {
                criticalSection();
                return;
            }

            delay(function() {
                if (storage.getItem(keyY) !== i) {
                    loop();
                    return;
                }
                waitFor(function() {
                    return !storage.getItem(keyZ);
                }, criticalSection);
            });
        });
    };

    var criticalSection = function() {
        storage.setItem(keyZ, '1');
        try {
            lockedCB();
        } finally {
            storage.removeItem(keyZ);
            if (storage.getItem(keyY) === i) {
                storage.removeItem(keyY);
            }
            if (storage.getItem(keyX) === i) {
                storage.removeItem(keyX);
            }
        }
    };

    try {
        if (localStorageSupported(storage, true)) {
            loop();
        } else {
            throw new Error('localStorage support check failed');
        }
    } catch(err) {
        reportError(err);
    }
};

// eslint-disable-line camelcase

var logger$1 = console_with_prefix('batch');

/**
 * RequestQueue: queue for batching API requests with localStorage backup for retries.
 * Maintains an in-memory queue which represents the source of truth for the current
 * page, but also writes all items out to a copy in the browser's localStorage, which
 * can be read on subsequent pageloads and retried. For batchability, all the request
 * items in the queue should be of the same type (events, people updates, group updates)
 * so they can be sent in a single request to the same API endpoint.
 *
 * LocalStorage keying and locking: In order for reloads and subsequent pageloads of
 * the same site to access the same persisted data, they must share the same localStorage
 * key (for instance based on project token and queue type). Therefore access to the
 * localStorage entry is guarded by an asynchronous mutex (SharedLock) to prevent
 * simultaneously open windows/tabs from overwriting each other's data (which would lead
 * to data loss in some situations).
 * @constructor
 */
var RequestQueue = function(storageKey, options) {
    options = options || {};
    this.storageKey = storageKey;
    this.storage = options.storage || window.localStorage;
    this.reportError = options.errorReporter || _.bind(logger$1.error, logger$1);
    this.lock = new SharedLock(storageKey, {storage: this.storage});

    this.pid = options.pid || null; // pass pid to test out storage lock contention scenarios

    this.memQueue = [];
};

/**
 * Add one item to queues (memory and localStorage). The queued entry includes
 * the given item along with an auto-generated ID and a "flush-after" timestamp.
 * It is expected that the item will be sent over the network and dequeued
 * before the flush-after time; if this doesn't happen it is considered orphaned
 * (e.g., the original tab where it was enqueued got closed before it could be
 * sent) and the item can be sent by any tab that finds it in localStorage.
 *
 * The final callback param is called with a param indicating success or
 * failure of the enqueue operation; it is asynchronous because the localStorage
 * lock is asynchronous.
 */
RequestQueue.prototype.enqueue = function(item, flushInterval, cb) {
    var queueEntry = {
        'id': cheap_guid(),
        'flushAfter': new Date().getTime() + flushInterval * 2,
        'payload': item
    };

    this.lock.withLock(_.bind(function lockAcquired() {
        var succeeded;
        try {
            var storedQueue = this.readFromStorage();
            storedQueue.push(queueEntry);
            succeeded = this.saveToStorage(storedQueue);
            if (succeeded) {
                // only add to in-memory queue when storage succeeds
                this.memQueue.push(queueEntry);
            }
        } catch(err) {
            this.reportError('Error enqueueing item', item);
            succeeded = false;
        }
        if (cb) {
            cb(succeeded);
        }
    }, this), _.bind(function lockFailure(err) {
        this.reportError('Error acquiring storage lock', err);
        if (cb) {
            cb(false);
        }
    }, this), this.pid);
};

/**
 * Read out the given number of queue entries. If this.memQueue
 * has fewer than batchSize items, then look for "orphaned" items
 * in the persisted queue (items where the 'flushAfter' time has
 * already passed).
 */
RequestQueue.prototype.fillBatch = function(batchSize) {
    var batch = this.memQueue.slice(0, batchSize);
    if (batch.length < batchSize) {
        // don't need lock just to read events; localStorage is thread-safe
        // and the worst that could happen is a duplicate send of some
        // orphaned events, which will be deduplicated on the server side
        var storedQueue = this.readFromStorage();
        if (storedQueue.length) {
            // item IDs already in batch; don't duplicate out of storage
            var idsInBatch = {}; // poor man's Set
            _.each(batch, function(item) { idsInBatch[item['id']] = true; });

            for (var i = 0; i < storedQueue.length; i++) {
                var item = storedQueue[i];
                if (new Date().getTime() > item['flushAfter'] && !idsInBatch[item['id']]) {
                    item.orphaned = true;
                    batch.push(item);
                    if (batch.length >= batchSize) {
                        break;
                    }
                }
            }
        }
    }
    return batch;
};

/**
 * Remove items with matching 'id' from array (immutably)
 * also remove any item without a valid id (e.g., malformed
 * storage entries).
 */
var filterOutIDsAndInvalid = function(items, idSet) {
    var filteredItems = [];
    _.each(items, function(item) {
        if (item['id'] && !idSet[item['id']]) {
            filteredItems.push(item);
        }
    });
    return filteredItems;
};

/**
 * Remove items with matching IDs from both in-memory queue
 * and persisted queue
 */
RequestQueue.prototype.removeItemsByID = function(ids, cb) {
    var idSet = {}; // poor man's Set
    _.each(ids, function(id) { idSet[id] = true; });

    this.memQueue = filterOutIDsAndInvalid(this.memQueue, idSet);

    var removeFromStorage = _.bind(function() {
        var succeeded;
        try {
            var storedQueue = this.readFromStorage();
            storedQueue = filterOutIDsAndInvalid(storedQueue, idSet);
            succeeded = this.saveToStorage(storedQueue);

            // an extra check: did storage report success but somehow
            // the items are still there?
            if (succeeded) {
                storedQueue = this.readFromStorage();
                for (var i = 0; i < storedQueue.length; i++) {
                    var item = storedQueue[i];
                    if (item['id'] && !!idSet[item['id']]) {
                        this.reportError('Item not removed from storage');
                        return false;
                    }
                }
            }
        } catch(err) {
            this.reportError('Error removing items', ids);
            succeeded = false;
        }
        return succeeded;
    }, this);

    this.lock.withLock(function lockAcquired() {
        var succeeded = removeFromStorage();
        if (cb) {
            cb(succeeded);
        }
    }, _.bind(function lockFailure(err) {
        var succeeded = false;
        this.reportError('Error acquiring storage lock', err);
        if (!localStorageSupported(this.storage, true)) {
            // Looks like localStorage writes have stopped working sometime after
            // initialization (probably full), and so nobody can acquire locks
            // anymore. Consider it temporarily safe to remove items without the
            // lock, since nobody's writing successfully anyway.
            succeeded = removeFromStorage();
            if (!succeeded) {
                // OK, we couldn't even write out the smaller queue. Try clearing it
                // entirely.
                try {
                    this.storage.removeItem(this.storageKey);
                } catch(err) {
                    this.reportError('Error clearing queue', err);
                }
            }
        }
        if (cb) {
            cb(succeeded);
        }
    }, this), this.pid);
};

// internal helper for RequestQueue.updatePayloads
var updatePayloads = function(existingItems, itemsToUpdate) {
    var newItems = [];
    _.each(existingItems, function(item) {
        var id = item['id'];
        if (id in itemsToUpdate) {
            var newPayload = itemsToUpdate[id];
            if (newPayload !== null) {
                item['payload'] = newPayload;
                newItems.push(item);
            }
        } else {
            // no update
            newItems.push(item);
        }
    });
    return newItems;
};

/**
 * Update payloads of given items in both in-memory queue and
 * persisted queue. Items set to null are removed from queues.
 */
RequestQueue.prototype.updatePayloads = function(itemsToUpdate, cb) {
    this.memQueue = updatePayloads(this.memQueue, itemsToUpdate);
    this.lock.withLock(_.bind(function lockAcquired() {
        var succeeded;
        try {
            var storedQueue = this.readFromStorage();
            storedQueue = updatePayloads(storedQueue, itemsToUpdate);
            succeeded = this.saveToStorage(storedQueue);
        } catch(err) {
            this.reportError('Error updating items', itemsToUpdate);
            succeeded = false;
        }
        if (cb) {
            cb(succeeded);
        }
    }, this), _.bind(function lockFailure(err) {
        this.reportError('Error acquiring storage lock', err);
        if (cb) {
            cb(false);
        }
    }, this), this.pid);
};

/**
 * Read and parse items array from localStorage entry, handling
 * malformed/missing data if necessary.
 */
RequestQueue.prototype.readFromStorage = function() {
    var storageEntry;
    try {
        storageEntry = this.storage.getItem(this.storageKey);
        if (storageEntry) {
            storageEntry = JSONParse(storageEntry);
            if (!_.isArray(storageEntry)) {
                this.reportError('Invalid storage entry:', storageEntry);
                storageEntry = null;
            }
        }
    } catch (err) {
        this.reportError('Error retrieving queue', err);
        storageEntry = null;
    }
    return storageEntry || [];
};

/**
 * Serialize the given items array to localStorage.
 */
RequestQueue.prototype.saveToStorage = function(queue) {
    try {
        this.storage.setItem(this.storageKey, JSONStringify(queue));
        return true;
    } catch (err) {
        this.reportError('Error saving queue', err);
        return false;
    }
};

/**
 * Clear out queues (memory and localStorage).
 */
RequestQueue.prototype.clear = function() {
    this.memQueue = [];
    this.storage.removeItem(this.storageKey);
};

// eslint-disable-line camelcase

// maximum interval between request retries after exponential backoff
var MAX_RETRY_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes

var logger = console_with_prefix('batch');

/**
 * RequestBatcher: manages the queueing, flushing, retry etc of requests of one
 * type (events, people, groups).
 * Uses RequestQueue to manage the backing store.
 * @constructor
 */
var RequestBatcher = function(storageKey, options) {
    this.errorReporter = options.errorReporter;
    this.queue = new RequestQueue(storageKey, {
        errorReporter: _.bind(this.reportError, this),
        storage: options.storage
    });

    this.libConfig = options.libConfig;
    this.sendRequest = options.sendRequestFunc;
    this.beforeSendHook = options.beforeSendHook;
    this.stopAllBatching = options.stopAllBatchingFunc;

    // seed variable batch size + flush interval with configured values
    this.batchSize = this.libConfig['batch_size'];
    this.flushInterval = this.libConfig['batch_flush_interval_ms'];

    this.stopped = !this.libConfig['batch_autostart'];
    this.consecutiveRemovalFailures = 0;

    // extra client-side dedupe
    this.itemIdsSentSuccessfully = {};
};

/**
 * Add one item to queue.
 */
RequestBatcher.prototype.enqueue = function(item, cb) {
    this.queue.enqueue(item, this.flushInterval, cb);
};

/**
 * Start flushing batches at the configured time interval. Must call
 * this method upon SDK init in order to send anything over the network.
 */
RequestBatcher.prototype.start = function() {
    this.stopped = false;
    this.consecutiveRemovalFailures = 0;
    this.flush();
};

/**
 * Stop flushing batches. Can be restarted by calling start().
 */
RequestBatcher.prototype.stop = function() {
    this.stopped = true;
    if (this.timeoutID) {
        clearTimeout(this.timeoutID);
        this.timeoutID = null;
    }
};

/**
 * Clear out queue.
 */
RequestBatcher.prototype.clear = function() {
    this.queue.clear();
};

/**
 * Restore batch size configuration to whatever is set in the main SDK.
 */
RequestBatcher.prototype.resetBatchSize = function() {
    this.batchSize = this.libConfig['batch_size'];
};

/**
 * Restore flush interval time configuration to whatever is set in the main SDK.
 */
RequestBatcher.prototype.resetFlush = function() {
    this.scheduleFlush(this.libConfig['batch_flush_interval_ms']);
};

/**
 * Schedule the next flush in the given number of milliseconds.
 */
RequestBatcher.prototype.scheduleFlush = function(flushMS) {
    this.flushInterval = flushMS;
    if (!this.stopped) { // don't schedule anymore if batching has been stopped
        this.timeoutID = setTimeout(_.bind(this.flush, this), this.flushInterval);
    }
};

/**
 * Flush one batch to network. Depending on success/failure modes, it will either
 * remove the batch from the queue or leave it in for retry, and schedule the next
 * flush. In cases of most network or API failures, it will back off exponentially
 * when retrying.
 * @param {Object} [options]
 * @param {boolean} [options.sendBeacon] - whether to send batch with
 * navigator.sendBeacon (only useful for sending batches before page unloads, as
 * sendBeacon offers no callbacks or status indications)
 */
RequestBatcher.prototype.flush = function(options) {
    try {

        if (this.requestInProgress) {
            logger.log('Flush: Request already in progress');
            return;
        }

        options = options || {};
        var timeoutMS = this.libConfig['batch_request_timeout_ms'];
        var startTime = new Date().getTime();
        var currentBatchSize = this.batchSize;
        var batch = this.queue.fillBatch(currentBatchSize);
        var dataForRequest = [];
        var transformedItems = {};
        _.each(batch, function(item) {
            var payload = item['payload'];
            if (this.beforeSendHook && !item.orphaned) {
                payload = this.beforeSendHook(payload);
            }
            if (payload) {
                // mp_sent_by_lib_version prop captures which lib version actually
                // sends each event (regardless of which version originally queued
                // it for sending)
                if (payload['event'] && payload['properties']) {
                    payload['properties'] = _.extend(
                        {},
                        payload['properties'],
                        {'mp_sent_by_lib_version': Config.LIB_VERSION}
                    );
                }
                var addPayload = true;
                var itemId = item['id'];
                if (itemId) {
                    if ((this.itemIdsSentSuccessfully[itemId] || 0) > 5) {
                        this.reportError('[dupe] item ID sent too many times, not sending', {
                            item: item,
                            batchSize: batch.length,
                            timesSent: this.itemIdsSentSuccessfully[itemId]
                        });
                        addPayload = false;
                    }
                } else {
                    this.reportError('[dupe] found item with no ID', {item: item});
                }

                if (addPayload) {
                    dataForRequest.push(payload);
                }
            }
            transformedItems[item['id']] = payload;
        }, this);
        if (dataForRequest.length < 1) {
            this.resetFlush();
            return; // nothing to do
        }

        this.requestInProgress = true;

        var batchSendCallback = _.bind(function(res) {
            this.requestInProgress = false;

            try {

                // handle API response in a try-catch to make sure we can reset the
                // flush operation if something goes wrong

                var removeItemsFromQueue = false;
                if (options.unloading) {
                    // update persisted data to include hook transformations
                    this.queue.updatePayloads(transformedItems);
                } else if (
                    _.isObject(res) &&
                    res.error === 'timeout' &&
                    new Date().getTime() - startTime >= timeoutMS
                ) {
                    this.reportError('Network timeout; retrying');
                    this.flush();
                } else if (
                    _.isObject(res) &&
                    res.xhr_req &&
                    (res.xhr_req['status'] >= 500 || res.xhr_req['status'] === 429 || res.error === 'timeout')
                ) {
                    // network or API error, or 429 Too Many Requests, retry
                    var retryMS = this.flushInterval * 2;
                    var headers = res.xhr_req['responseHeaders'];
                    if (headers) {
                        var retryAfter = headers['Retry-After'];
                        if (retryAfter) {
                            retryMS = (parseInt(retryAfter, 10) * 1000) || retryMS;
                        }
                    }
                    retryMS = Math.min(MAX_RETRY_INTERVAL_MS, retryMS);
                    this.reportError('Error; retry in ' + retryMS + ' ms');
                    this.scheduleFlush(retryMS);
                } else if (_.isObject(res) && res.xhr_req && res.xhr_req['status'] === 413) {
                    // 413 Payload Too Large
                    if (batch.length > 1) {
                        var halvedBatchSize = Math.max(1, Math.floor(currentBatchSize / 2));
                        this.batchSize = Math.min(this.batchSize, halvedBatchSize, batch.length - 1);
                        this.reportError('413 response; reducing batch size to ' + this.batchSize);
                        this.resetFlush();
                    } else {
                        this.reportError('Single-event request too large; dropping', batch);
                        this.resetBatchSize();
                        removeItemsFromQueue = true;
                    }
                } else {
                    // successful network request+response; remove each item in batch from queue
                    // (even if it was e.g. a 400, in which case retrying won't help)
                    removeItemsFromQueue = true;
                }

                if (removeItemsFromQueue) {
                    this.queue.removeItemsByID(
                        _.map(batch, function(item) { return item['id']; }),
                        _.bind(function(succeeded) {
                            if (succeeded) {
                                this.consecutiveRemovalFailures = 0;
                                this.flush(); // handle next batch if the queue isn't empty
                            } else {
                                this.reportError('Failed to remove items from queue');
                                if (++this.consecutiveRemovalFailures > 5) {
                                    this.reportError('Too many queue failures; disabling batching system.');
                                    this.stopAllBatching();
                                } else {
                                    this.resetFlush();
                                }
                            }
                        }, this)
                    );

                    // client-side dedupe
                    _.each(batch, _.bind(function(item) {
                        var itemId = item['id'];
                        if (itemId) {
                            this.itemIdsSentSuccessfully[itemId] = this.itemIdsSentSuccessfully[itemId] || 0;
                            this.itemIdsSentSuccessfully[itemId]++;
                            if (this.itemIdsSentSuccessfully[itemId] > 5) {
                                this.reportError('[dupe] item ID sent too many times', {
                                    item: item,
                                    batchSize: batch.length,
                                    timesSent: this.itemIdsSentSuccessfully[itemId]
                                });
                            }
                        } else {
                            this.reportError('[dupe] found item with no ID while removing', {item: item});
                        }
                    }, this));
                }

            } catch(err) {
                this.reportError('Error handling API response', err);
                this.resetFlush();
            }
        }, this);
        var requestOptions = {
            method: 'POST',
            verbose: true,
            ignore_json_errors: true, // eslint-disable-line camelcase
            timeout_ms: timeoutMS // eslint-disable-line camelcase
        };
        if (options.unloading) {
            requestOptions.transport = 'sendBeacon';
        }
        logger.log('MIXPANEL REQUEST:', dataForRequest);
        this.sendRequest(dataForRequest, requestOptions, batchSendCallback);

    } catch(err) {
        this.reportError('Error flushing request queue', err);
        this.resetFlush();
    }
};

/**
 * Log error to global logger and optional user-defined logger.
 */
RequestBatcher.prototype.reportError = function(msg, err) {
    logger.error.apply(logger.error, arguments);
    if (this.errorReporter) {
        try {
            if (!(err instanceof Error)) {
                err = new Error(msg);
            }
            this.errorReporter(msg, err);
        } catch(err) {
            logger.error(err);
        }
    }
};

/**
 * A function used to track a Mixpanel event (e.g. MixpanelLib.track)
 * @callback trackFunction
 * @param {String} event_name The name of the event. This can be anything the user does - 'Button Click', 'Sign Up', 'Item Purchased', etc.
 * @param {Object} [properties] A set of properties to include with the event you're sending. These describe the user who did the event or details about the event itself.
 * @param {Function} [callback] If provided, the callback function will be called after tracking the event.
 */

/** Public **/

var GDPR_DEFAULT_PERSISTENCE_PREFIX = '__mp_opt_in_out_';

/**
 * Opt the user in to data tracking and cookies/localstorage for the given token
 * @param {string} token - Mixpanel project tracking token
 * @param {Object} [options]
 * @param {trackFunction} [options.track] - function used for tracking a Mixpanel event to record the opt-in action
 * @param {string} [options.trackEventName] - event name to be used for tracking the opt-in action
 * @param {Object} [options.trackProperties] - set of properties to be tracked along with the opt-in action
 * @param {string} [options.persistenceType] Persistence mechanism used - cookie or localStorage
 * @param {string} [options.persistencePrefix=__mp_opt_in_out] - custom prefix to be used in the cookie/localstorage name
 * @param {Number} [options.cookieExpiration] - number of days until the opt-in cookie expires
 * @param {string} [options.cookieDomain] - custom cookie domain
 * @param {boolean} [options.crossSiteCookie] - whether the opt-in cookie is set as cross-site-enabled
 * @param {boolean} [options.crossSubdomainCookie] - whether the opt-in cookie is set as cross-subdomain or not
 * @param {boolean} [options.secureCookie] - whether the opt-in cookie is set as secure or not
 */
function optIn(token, options) {
    _optInOut(true, token, options);
}

/**
 * Opt the user out of data tracking and cookies/localstorage for the given token
 * @param {string} token - Mixpanel project tracking token
 * @param {Object} [options]
 * @param {string} [options.persistenceType] Persistence mechanism used - cookie or localStorage
 * @param {string} [options.persistencePrefix=__mp_opt_in_out] - custom prefix to be used in the cookie/localstorage name
 * @param {Number} [options.cookieExpiration] - number of days until the opt-out cookie expires
 * @param {string} [options.cookieDomain] - custom cookie domain
 * @param {boolean} [options.crossSiteCookie] - whether the opt-in cookie is set as cross-site-enabled
 * @param {boolean} [options.crossSubdomainCookie] - whether the opt-out cookie is set as cross-subdomain or not
 * @param {boolean} [options.secureCookie] - whether the opt-out cookie is set as secure or not
 */
function optOut(token, options) {
    _optInOut(false, token, options);
}

/**
 * Check whether the user has opted in to data tracking and cookies/localstorage for the given token
 * @param {string} token - Mixpanel project tracking token
 * @param {Object} [options]
 * @param {string} [options.persistenceType] Persistence mechanism used - cookie or localStorage
 * @param {string} [options.persistencePrefix=__mp_opt_in_out] - custom prefix to be used in the cookie/localstorage name
 * @returns {boolean} whether the user has opted in to the given opt type
 */
function hasOptedIn(token, options) {
    return _getStorageValue(token, options) === '1';
}

/**
 * Check whether the user has opted out of data tracking and cookies/localstorage for the given token
 * @param {string} token - Mixpanel project tracking token
 * @param {Object} [options]
 * @param {string} [options.persistenceType] Persistence mechanism used - cookie or localStorage
 * @param {string} [options.persistencePrefix=__mp_opt_in_out] - custom prefix to be used in the cookie/localstorage name
 * @param {boolean} [options.ignoreDnt] - flag to ignore browser DNT settings and always return false
 * @returns {boolean} whether the user has opted out of the given opt type
 */
function hasOptedOut(token, options) {
    if (_hasDoNotTrackFlagOn(options)) {
        console.warn('This browser has "Do Not Track" enabled. This will prevent the Mixpanel SDK from sending any data. To ignore the "Do Not Track" browser setting, initialize the Mixpanel instance with the config "ignore_dnt: true"');
        return true;
    }
    var optedOut = _getStorageValue(token, options) === '0';
    if (optedOut) {
        console.warn('You are opted out of Mixpanel tracking. This will prevent the Mixpanel SDK from sending any data.');
    }
    return optedOut;
}

/**
 * Wrap a MixpanelLib method with a check for whether the user is opted out of data tracking and cookies/localstorage for the given token
 * If the user has opted out, return early instead of executing the method.
 * If a callback argument was provided, execute it passing the 0 error code.
 * @param {function} method - wrapped method to be executed if the user has not opted out
 * @returns {*} the result of executing method OR undefined if the user has opted out
 */
function addOptOutCheckMixpanelLib(method) {
    return _addOptOutCheck(method, function(name) {
        return this.get_config(name);
    });
}

/**
 * Wrap a MixpanelPeople method with a check for whether the user is opted out of data tracking and cookies/localstorage for the given token
 * If the user has opted out, return early instead of executing the method.
 * If a callback argument was provided, execute it passing the 0 error code.
 * @param {function} method - wrapped method to be executed if the user has not opted out
 * @returns {*} the result of executing method OR undefined if the user has opted out
 */
function addOptOutCheckMixpanelPeople(method) {
    return _addOptOutCheck(method, function(name) {
        return this._get_config(name);
    });
}

/**
 * Wrap a MixpanelGroup method with a check for whether the user is opted out of data tracking and cookies/localstorage for the given token
 * If the user has opted out, return early instead of executing the method.
 * If a callback argument was provided, execute it passing the 0 error code.
 * @param {function} method - wrapped method to be executed if the user has not opted out
 * @returns {*} the result of executing method OR undefined if the user has opted out
 */
function addOptOutCheckMixpanelGroup(method) {
    return _addOptOutCheck(method, function(name) {
        return this._get_config(name);
    });
}

/**
 * Clear the user's opt in/out status of data tracking and cookies/localstorage for the given token
 * @param {string} token - Mixpanel project tracking token
 * @param {Object} [options]
 * @param {string} [options.persistenceType] Persistence mechanism used - cookie or localStorage
 * @param {string} [options.persistencePrefix=__mp_opt_in_out] - custom prefix to be used in the cookie/localstorage name
 * @param {Number} [options.cookieExpiration] - number of days until the opt-in cookie expires
 * @param {string} [options.cookieDomain] - custom cookie domain
 * @param {boolean} [options.crossSiteCookie] - whether the opt-in cookie is set as cross-site-enabled
 * @param {boolean} [options.crossSubdomainCookie] - whether the opt-in cookie is set as cross-subdomain or not
 * @param {boolean} [options.secureCookie] - whether the opt-in cookie is set as secure or not
 */
function clearOptInOut(token, options) {
    options = options || {};
    _getStorage(options).remove(
        _getStorageKey(token, options), !!options.crossSubdomainCookie, options.cookieDomain
    );
}

/** Private **/

/**
 * Get storage util
 * @param {Object} [options]
 * @param {string} [options.persistenceType]
 * @returns {object} either _.cookie or _.localstorage
 */
function _getStorage(options) {
    options = options || {};
    return options.persistenceType === 'localStorage' ? _.localStorage : _.cookie;
}

/**
 * Get the name of the cookie that is used for the given opt type (tracking, cookie, etc.)
 * @param {string} token - Mixpanel project tracking token
 * @param {Object} [options]
 * @param {string} [options.persistencePrefix=__mp_opt_in_out] - custom prefix to be used in the cookie/localstorage name
 * @returns {string} the name of the cookie for the given opt type
 */
function _getStorageKey(token, options) {
    options = options || {};
    return (options.persistencePrefix || GDPR_DEFAULT_PERSISTENCE_PREFIX) + token;
}

/**
 * Get the value of the cookie that is used for the given opt type (tracking, cookie, etc.)
 * @param {string} token - Mixpanel project tracking token
 * @param {Object} [options]
 * @param {string} [options.persistencePrefix=__mp_opt_in_out] - custom prefix to be used in the cookie/localstorage name
 * @returns {string} the value of the cookie for the given opt type
 */
function _getStorageValue(token, options) {
    return _getStorage(options).get(_getStorageKey(token, options));
}

/**
 * Check whether the user has set the DNT/doNotTrack setting to true in their browser
 * @param {Object} [options]
 * @param {string} [options.window] - alternate window object to check; used to force various DNT settings in browser tests
 * @param {boolean} [options.ignoreDnt] - flag to ignore browser DNT settings and always return false
 * @returns {boolean} whether the DNT setting is true
 */
function _hasDoNotTrackFlagOn(options) {
    if (options && options.ignoreDnt) {
        return false;
    }
    var win = (options && options.window) || window$1;
    var nav = win['navigator'] || {};
    var hasDntOn = false;

    _.each([
        nav['doNotTrack'], // standard
        nav['msDoNotTrack'],
        win['doNotTrack']
    ], function(dntValue) {
        if (_.includes([true, 1, '1', 'yes'], dntValue)) {
            hasDntOn = true;
        }
    });

    return hasDntOn;
}

/**
 * Set cookie/localstorage for the user indicating that they are opted in or out for the given opt type
 * @param {boolean} optValue - whether to opt the user in or out for the given opt type
 * @param {string} token - Mixpanel project tracking token
 * @param {Object} [options]
 * @param {trackFunction} [options.track] - function used for tracking a Mixpanel event to record the opt-in action
 * @param {string} [options.trackEventName] - event name to be used for tracking the opt-in action
 * @param {Object} [options.trackProperties] - set of properties to be tracked along with the opt-in action
 * @param {string} [options.persistencePrefix=__mp_opt_in_out] - custom prefix to be used in the cookie/localstorage name
 * @param {Number} [options.cookieExpiration] - number of days until the opt-in cookie expires
 * @param {string} [options.cookieDomain] - custom cookie domain
 * @param {boolean} [options.crossSiteCookie] - whether the opt-in cookie is set as cross-site-enabled
 * @param {boolean} [options.crossSubdomainCookie] - whether the opt-in cookie is set as cross-subdomain or not
 * @param {boolean} [options.secureCookie] - whether the opt-in cookie is set as secure or not
 */
function _optInOut(optValue, token, options) {
    if (!_.isString(token) || !token.length) {
        console.error('gdpr.' + (optValue ? 'optIn' : 'optOut') + ' called with an invalid token');
        return;
    }

    options = options || {};

    _getStorage(options).set(
        _getStorageKey(token, options),
        optValue ? 1 : 0,
        _.isNumber(options.cookieExpiration) ? options.cookieExpiration : null,
        !!options.crossSubdomainCookie,
        !!options.secureCookie,
        !!options.crossSiteCookie,
        options.cookieDomain
    );

    if (options.track && optValue) { // only track event if opting in (optValue=true)
        options.track(options.trackEventName || '$opt_in', options.trackProperties, {
            'send_immediately': true
        });
    }
}

/**
 * Wrap a method with a check for whether the user is opted out of data tracking and cookies/localstorage for the given token
 * If the user has opted out, return early instead of executing the method.
 * If a callback argument was provided, execute it passing the 0 error code.
 * @param {function} method - wrapped method to be executed if the user has not opted out
 * @param {function} getConfigValue - getter function for the Mixpanel API token and other options to be used with opt-out check
 * @returns {*} the result of executing method OR undefined if the user has opted out
 */
function _addOptOutCheck(method, getConfigValue) {
    return function() {
        var optedOut = false;

        try {
            var token = getConfigValue.call(this, 'token');
            var ignoreDnt = getConfigValue.call(this, 'ignore_dnt');
            var persistenceType = getConfigValue.call(this, 'opt_out_tracking_persistence_type');
            var persistencePrefix = getConfigValue.call(this, 'opt_out_tracking_cookie_prefix');
            var win = getConfigValue.call(this, 'window'); // used to override window during browser tests

            if (token) { // if there was an issue getting the token, continue method execution as normal
                optedOut = hasOptedOut(token, {
                    ignoreDnt: ignoreDnt,
                    persistenceType: persistenceType,
                    persistencePrefix: persistencePrefix,
                    window: win
                });
            }
        } catch(err) {
            console.error('Unexpected error when checking tracking opt-out status: ' + err);
        }

        if (!optedOut) {
            return method.apply(this, arguments);
        }

        var callback = arguments[arguments.length - 1];
        if (typeof(callback) === 'function') {
            callback(0);
        }

        return;
    };
}

/** @const */ var SET_ACTION      = '$set';
/** @const */ var SET_ONCE_ACTION = '$set_once';
/** @const */ var UNSET_ACTION    = '$unset';
/** @const */ var ADD_ACTION      = '$add';
/** @const */ var APPEND_ACTION   = '$append';
/** @const */ var UNION_ACTION    = '$union';
/** @const */ var REMOVE_ACTION   = '$remove';
/** @const */ var DELETE_ACTION   = '$delete';

// Common internal methods for mixpanel.people and mixpanel.group APIs.
// These methods shouldn't involve network I/O.
var apiActions = {
    set_action: function(prop, to) {
        var data = {};
        var $set = {};
        if (_.isObject(prop)) {
            _.each(prop, function(v, k) {
                if (!this._is_reserved_property(k)) {
                    $set[k] = v;
                }
            }, this);
        } else {
            $set[prop] = to;
        }

        data[SET_ACTION] = $set;
        return data;
    },

    unset_action: function(prop) {
        var data = {};
        var $unset = [];
        if (!_.isArray(prop)) {
            prop = [prop];
        }

        _.each(prop, function(k) {
            if (!this._is_reserved_property(k)) {
                $unset.push(k);
            }
        }, this);

        data[UNSET_ACTION] = $unset;
        return data;
    },

    set_once_action: function(prop, to) {
        var data = {};
        var $set_once = {};
        if (_.isObject(prop)) {
            _.each(prop, function(v, k) {
                if (!this._is_reserved_property(k)) {
                    $set_once[k] = v;
                }
            }, this);
        } else {
            $set_once[prop] = to;
        }
        data[SET_ONCE_ACTION] = $set_once;
        return data;
    },

    union_action: function(list_name, values) {
        var data = {};
        var $union = {};
        if (_.isObject(list_name)) {
            _.each(list_name, function(v, k) {
                if (!this._is_reserved_property(k)) {
                    $union[k] = _.isArray(v) ? v : [v];
                }
            }, this);
        } else {
            $union[list_name] = _.isArray(values) ? values : [values];
        }
        data[UNION_ACTION] = $union;
        return data;
    },

    append_action: function(list_name, value) {
        var data = {};
        var $append = {};
        if (_.isObject(list_name)) {
            _.each(list_name, function(v, k) {
                if (!this._is_reserved_property(k)) {
                    $append[k] = v;
                }
            }, this);
        } else {
            $append[list_name] = value;
        }
        data[APPEND_ACTION] = $append;
        return data;
    },

    remove_action: function(list_name, value) {
        var data = {};
        var $remove = {};
        if (_.isObject(list_name)) {
            _.each(list_name, function(v, k) {
                if (!this._is_reserved_property(k)) {
                    $remove[k] = v;
                }
            }, this);
        } else {
            $remove[list_name] = value;
        }
        data[REMOVE_ACTION] = $remove;
        return data;
    },

    delete_action: function() {
        var data = {};
        data[DELETE_ACTION] = '';
        return data;
    }
};

/**
 * Mixpanel Group Object
 * @constructor
 */
var MixpanelGroup = function() {};

_.extend(MixpanelGroup.prototype, apiActions);

MixpanelGroup.prototype._init = function(mixpanel_instance, group_key, group_id) {
    this._mixpanel = mixpanel_instance;
    this._group_key = group_key;
    this._group_id = group_id;
};

/**
 * Set properties on a group.
 *
 * ### Usage:
 *
 *     mixpanel.get_group('company', 'mixpanel').set('Location', '405 Howard');
 *
 *     // or set multiple properties at once
 *     mixpanel.get_group('company', 'mixpanel').set({
 *          'Location': '405 Howard',
 *          'Founded' : 2009,
 *     });
 *     // properties can be strings, integers, dates, or lists
 *
 * @param {Object|String} prop If a string, this is the name of the property. If an object, this is an associative array of names and values.
 * @param {*} [to] A value to set on the given property name
 * @param {Function} [callback] If provided, the callback will be called after the tracking event
 */
MixpanelGroup.prototype.set = addOptOutCheckMixpanelGroup(function(prop, to, callback) {
    var data = this.set_action(prop, to);
    if (_.isObject(prop)) {
        callback = to;
    }
    return this._send_request(data, callback);
});

/**
 * Set properties on a group, only if they do not yet exist.
 * This will not overwrite previous group property values, unlike
 * group.set().
 *
 * ### Usage:
 *
 *     mixpanel.get_group('company', 'mixpanel').set_once('Location', '405 Howard');
 *
 *     // or set multiple properties at once
 *     mixpanel.get_group('company', 'mixpanel').set_once({
 *          'Location': '405 Howard',
 *          'Founded' : 2009,
 *     });
 *     // properties can be strings, integers, lists or dates
 *
 * @param {Object|String} prop If a string, this is the name of the property. If an object, this is an associative array of names and values.
 * @param {*} [to] A value to set on the given property name
 * @param {Function} [callback] If provided, the callback will be called after the tracking event
 */
MixpanelGroup.prototype.set_once = addOptOutCheckMixpanelGroup(function(prop, to, callback) {
    var data = this.set_once_action(prop, to);
    if (_.isObject(prop)) {
        callback = to;
    }
    return this._send_request(data, callback);
});

/**
 * Unset properties on a group permanently.
 *
 * ### Usage:
 *
 *     mixpanel.get_group('company', 'mixpanel').unset('Founded');
 *
 * @param {String} prop The name of the property.
 * @param {Function} [callback] If provided, the callback will be called after the tracking event
 */
MixpanelGroup.prototype.unset = addOptOutCheckMixpanelGroup(function(prop, callback) {
    var data = this.unset_action(prop);
    return this._send_request(data, callback);
});

/**
 * Merge a given list with a list-valued group property, excluding duplicate values.
 *
 * ### Usage:
 *
 *     // merge a value to a list, creating it if needed
 *     mixpanel.get_group('company', 'mixpanel').union('Location', ['San Francisco', 'London']);
 *
 * @param {String} list_name Name of the property.
 * @param {Array} values Values to merge with the given property
 * @param {Function} [callback] If provided, the callback will be called after the tracking event
 */
MixpanelGroup.prototype.union = addOptOutCheckMixpanelGroup(function(list_name, values, callback) {
    if (_.isObject(list_name)) {
        callback = values;
    }
    var data = this.union_action(list_name, values);
    return this._send_request(data, callback);
});

/**
 * Permanently delete a group.
 *
 * ### Usage:
 *
 *     mixpanel.get_group('company', 'mixpanel').delete();
 *
 * @param {Function} [callback] If provided, the callback will be called after the tracking event
 */
MixpanelGroup.prototype['delete'] = addOptOutCheckMixpanelGroup(function(callback) {
    // bracket notation above prevents a minification error related to reserved words
    var data = this.delete_action();
    return this._send_request(data, callback);
});

/**
 * Remove a property from a group. The value will be ignored if doesn't exist.
 *
 * ### Usage:
 *
 *     mixpanel.get_group('company', 'mixpanel').remove('Location', 'London');
 *
 * @param {String} list_name Name of the property.
 * @param {Object} value Value to remove from the given group property
 * @param {Function} [callback] If provided, the callback will be called after the tracking event
 */
MixpanelGroup.prototype.remove = addOptOutCheckMixpanelGroup(function(list_name, value, callback) {
    var data = this.remove_action(list_name, value);
    return this._send_request(data, callback);
});

MixpanelGroup.prototype._send_request = function(data, callback) {
    data['$group_key'] = this._group_key;
    data['$group_id'] = this._group_id;
    data['$token'] = this._get_config('token');

    var date_encoded_data = _.encodeDates(data);
    return this._mixpanel._track_or_batch({
        type: 'groups',
        data: date_encoded_data,
        endpoint: this._get_config('api_host') + '/groups/',
        batcher: this._mixpanel.request_batchers.groups
    }, callback);
};

MixpanelGroup.prototype._is_reserved_property = function(prop) {
    return prop === '$group_key' || prop === '$group_id';
};

MixpanelGroup.prototype._get_config = function(conf) {
    return this._mixpanel.get_config(conf);
};

MixpanelGroup.prototype.toString = function() {
    return this._mixpanel.toString() + '.group.' + this._group_key + '.' + this._group_id;
};

// MixpanelGroup Exports
MixpanelGroup.prototype['remove']   = MixpanelGroup.prototype.remove;
MixpanelGroup.prototype['set']      = MixpanelGroup.prototype.set;
MixpanelGroup.prototype['set_once'] = MixpanelGroup.prototype.set_once;
MixpanelGroup.prototype['union']    = MixpanelGroup.prototype.union;
MixpanelGroup.prototype['unset']    = MixpanelGroup.prototype.unset;
MixpanelGroup.prototype['toString'] = MixpanelGroup.prototype.toString;

/**
 * Mixpanel People Object
 * @constructor
 */
var MixpanelPeople = function() {};

_.extend(MixpanelPeople.prototype, apiActions);

MixpanelPeople.prototype._init = function(mixpanel_instance) {
    this._mixpanel = mixpanel_instance;
};

/*
* Set properties on a user record.
*
* ### Usage:
*
*     mixpanel.people.set('gender', 'm');
*
*     // or set multiple properties at once
*     mixpanel.people.set({
*         'Company': 'Acme',
*         'Plan': 'Premium',
*         'Upgrade date': new Date()
*     });
*     // properties can be strings, integers, dates, or lists
*
* @param {Object|String} prop If a string, this is the name of the property. If an object, this is an associative array of names and values.
* @param {*} [to] A value to set on the given property name
* @param {Function} [callback] If provided, the callback will be called after tracking the event.
*/
MixpanelPeople.prototype.set = addOptOutCheckMixpanelPeople(function(prop, to, callback) {
    var data = this.set_action(prop, to);
    if (_.isObject(prop)) {
        callback = to;
    }
    // make sure that the referrer info has been updated and saved
    if (this._get_config('save_referrer')) {
        this._mixpanel['persistence'].update_referrer_info(document.referrer);
    }

    // update $set object with default people properties
    data[SET_ACTION] = _.extend(
        {},
        _.info.people_properties(),
        this._mixpanel['persistence'].get_referrer_info(),
        data[SET_ACTION]
    );
    return this._send_request(data, callback);
});

/*
* Set properties on a user record, only if they do not yet exist.
* This will not overwrite previous people property values, unlike
* people.set().
*
* ### Usage:
*
*     mixpanel.people.set_once('First Login Date', new Date());
*
*     // or set multiple properties at once
*     mixpanel.people.set_once({
*         'First Login Date': new Date(),
*         'Starting Plan': 'Premium'
*     });
*
*     // properties can be strings, integers or dates
*
* @param {Object|String} prop If a string, this is the name of the property. If an object, this is an associative array of names and values.
* @param {*} [to] A value to set on the given property name
* @param {Function} [callback] If provided, the callback will be called after tracking the event.
*/
MixpanelPeople.prototype.set_once = addOptOutCheckMixpanelPeople(function(prop, to, callback) {
    var data = this.set_once_action(prop, to);
    if (_.isObject(prop)) {
        callback = to;
    }
    return this._send_request(data, callback);
});

/*
* Unset properties on a user record (permanently removes the properties and their values from a profile).
*
* ### Usage:
*
*     mixpanel.people.unset('gender');
*
*     // or unset multiple properties at once
*     mixpanel.people.unset(['gender', 'Company']);
*
* @param {Array|String} prop If a string, this is the name of the property. If an array, this is a list of property names.
* @param {Function} [callback] If provided, the callback will be called after tracking the event.
*/
MixpanelPeople.prototype.unset = addOptOutCheckMixpanelPeople(function(prop, callback) {
    var data = this.unset_action(prop);
    return this._send_request(data, callback);
});

/*
* Increment/decrement numeric people analytics properties.
*
* ### Usage:
*
*     mixpanel.people.increment('page_views', 1);
*
*     // or, for convenience, if you're just incrementing a counter by
*     // 1, you can simply do
*     mixpanel.people.increment('page_views');
*
*     // to decrement a counter, pass a negative number
*     mixpanel.people.increment('credits_left', -1);
*
*     // like mixpanel.people.set(), you can increment multiple
*     // properties at once:
*     mixpanel.people.increment({
*         counter1: 1,
*         counter2: 6
*     });
*
* @param {Object|String} prop If a string, this is the name of the property. If an object, this is an associative array of names and numeric values.
* @param {Number} [by] An amount to increment the given property
* @param {Function} [callback] If provided, the callback will be called after tracking the event.
*/
MixpanelPeople.prototype.increment = addOptOutCheckMixpanelPeople(function(prop, by, callback) {
    var data = {};
    var $add = {};
    if (_.isObject(prop)) {
        _.each(prop, function(v, k) {
            if (!this._is_reserved_property(k)) {
                if (isNaN(parseFloat(v))) {
                    console.error('Invalid increment value passed to mixpanel.people.increment - must be a number');
                    return;
                } else {
                    $add[k] = v;
                }
            }
        }, this);
        callback = by;
    } else {
        // convenience: mixpanel.people.increment('property'); will
        // increment 'property' by 1
        if (_.isUndefined(by)) {
            by = 1;
        }
        $add[prop] = by;
    }
    data[ADD_ACTION] = $add;

    return this._send_request(data, callback);
});

/*
* Append a value to a list-valued people analytics property.
*
* ### Usage:
*
*     // append a value to a list, creating it if needed
*     mixpanel.people.append('pages_visited', 'homepage');
*
*     // like mixpanel.people.set(), you can append multiple
*     // properties at once:
*     mixpanel.people.append({
*         list1: 'bob',
*         list2: 123
*     });
*
* @param {Object|String} list_name If a string, this is the name of the property. If an object, this is an associative array of names and values.
* @param {*} [value] value An item to append to the list
* @param {Function} [callback] If provided, the callback will be called after tracking the event.
*/
MixpanelPeople.prototype.append = addOptOutCheckMixpanelPeople(function(list_name, value, callback) {
    if (_.isObject(list_name)) {
        callback = value;
    }
    var data = this.append_action(list_name, value);
    return this._send_request(data, callback);
});

/*
* Remove a value from a list-valued people analytics property.
*
* ### Usage:
*
*     mixpanel.people.remove('School', 'UCB');
*
* @param {Object|String} list_name If a string, this is the name of the property. If an object, this is an associative array of names and values.
* @param {*} [value] value Item to remove from the list
* @param {Function} [callback] If provided, the callback will be called after tracking the event.
*/
MixpanelPeople.prototype.remove = addOptOutCheckMixpanelPeople(function(list_name, value, callback) {
    if (_.isObject(list_name)) {
        callback = value;
    }
    var data = this.remove_action(list_name, value);
    return this._send_request(data, callback);
});

/*
* Merge a given list with a list-valued people analytics property,
* excluding duplicate values.
*
* ### Usage:
*
*     // merge a value to a list, creating it if needed
*     mixpanel.people.union('pages_visited', 'homepage');
*
*     // like mixpanel.people.set(), you can append multiple
*     // properties at once:
*     mixpanel.people.union({
*         list1: 'bob',
*         list2: 123
*     });
*
*     // like mixpanel.people.append(), you can append multiple
*     // values to the same list:
*     mixpanel.people.union({
*         list1: ['bob', 'billy']
*     });
*
* @param {Object|String} list_name If a string, this is the name of the property. If an object, this is an associative array of names and values.
* @param {*} [value] Value / values to merge with the given property
* @param {Function} [callback] If provided, the callback will be called after tracking the event.
*/
MixpanelPeople.prototype.union = addOptOutCheckMixpanelPeople(function(list_name, values, callback) {
    if (_.isObject(list_name)) {
        callback = values;
    }
    var data = this.union_action(list_name, values);
    return this._send_request(data, callback);
});

/*
 * Record that you have charged the current user a certain amount
 * of money. Charges recorded with track_charge() will appear in the
 * Mixpanel revenue report.
 *
 * ### Usage:
 *
 *     // charge a user $50
 *     mixpanel.people.track_charge(50);
 *
 *     // charge a user $30.50 on the 2nd of january
 *     mixpanel.people.track_charge(30.50, {
 *         '$time': new Date('jan 1 2012')
 *     });
 *
 * @param {Number} amount The amount of money charged to the current user
 * @param {Object} [properties] An associative array of properties associated with the charge
 * @param {Function} [callback] If provided, the callback will be called when the server responds
 * @deprecated
 */
MixpanelPeople.prototype.track_charge = addOptOutCheckMixpanelPeople(function(amount, properties, callback) {
    if (!_.isNumber(amount)) {
        amount = parseFloat(amount);
        if (isNaN(amount)) {
            console.error('Invalid value passed to mixpanel.people.track_charge - must be a number');
            return;
        }
    }

    return this.append('$transactions', _.extend({
        '$amount': amount
    }, properties), callback);
});

/*
 * Permanently clear all revenue report transactions from the
 * current user's people analytics profile.
 *
 * ### Usage:
 *
 *     mixpanel.people.clear_charges();
 *
 * @param {Function} [callback] If provided, the callback will be called after tracking the event.
 * @deprecated
 */
MixpanelPeople.prototype.clear_charges = function(callback) {
    return this.set('$transactions', [], callback);
};

/*
* Permanently deletes the current people analytics profile from
* Mixpanel (using the current distinct_id).
*
* ### Usage:
*
*     // remove the all data you have stored about the current user
*     mixpanel.people.delete_user();
*
*/
MixpanelPeople.prototype.delete_user = function() {
    if (!this._identify_called()) {
        console.error('mixpanel.people.delete_user() requires you to call identify() first');
        return;
    }
    var data = {'$delete': this._mixpanel.get_distinct_id()};
    return this._send_request(data);
};

MixpanelPeople.prototype.toString = function() {
    return this._mixpanel.toString() + '.people';
};

MixpanelPeople.prototype._send_request = function(data, callback) {
    data['$token'] = this._get_config('token');
    data['$distinct_id'] = this._mixpanel.get_distinct_id();
    var device_id = this._mixpanel.get_property('$device_id');
    var user_id = this._mixpanel.get_property('$user_id');
    var had_persisted_distinct_id = this._mixpanel.get_property('$had_persisted_distinct_id');
    if (device_id) {
        data['$device_id'] = device_id;
    }
    if (user_id) {
        data['$user_id'] = user_id;
    }
    if (had_persisted_distinct_id) {
        data['$had_persisted_distinct_id'] = had_persisted_distinct_id;
    }

    var date_encoded_data = _.encodeDates(data);

    if (!this._identify_called()) {
        this._enqueue(data);
        if (!_.isUndefined(callback)) {
            if (this._get_config('verbose')) {
                callback({status: -1, error: null});
            } else {
                callback(-1);
            }
        }
        return _.truncate(date_encoded_data, 255);
    }

    return this._mixpanel._track_or_batch({
        type: 'people',
        data: date_encoded_data,
        endpoint: this._get_config('api_host') + '/engage/',
        batcher: this._mixpanel.request_batchers.people
    }, callback);
};

MixpanelPeople.prototype._get_config = function(conf_var) {
    return this._mixpanel.get_config(conf_var);
};

MixpanelPeople.prototype._identify_called = function() {
    return this._mixpanel._flags.identify_called === true;
};

// Queue up engage operations if identify hasn't been called yet.
MixpanelPeople.prototype._enqueue = function(data) {
    if (SET_ACTION in data) {
        this._mixpanel['persistence']._add_to_people_queue(SET_ACTION, data);
    } else if (SET_ONCE_ACTION in data) {
        this._mixpanel['persistence']._add_to_people_queue(SET_ONCE_ACTION, data);
    } else if (UNSET_ACTION in data) {
        this._mixpanel['persistence']._add_to_people_queue(UNSET_ACTION, data);
    } else if (ADD_ACTION in data) {
        this._mixpanel['persistence']._add_to_people_queue(ADD_ACTION, data);
    } else if (APPEND_ACTION in data) {
        this._mixpanel['persistence']._add_to_people_queue(APPEND_ACTION, data);
    } else if (REMOVE_ACTION in data) {
        this._mixpanel['persistence']._add_to_people_queue(REMOVE_ACTION, data);
    } else if (UNION_ACTION in data) {
        this._mixpanel['persistence']._add_to_people_queue(UNION_ACTION, data);
    } else {
        console.error('Invalid call to _enqueue():', data);
    }
};

MixpanelPeople.prototype._flush_one_queue = function(action, action_method, callback, queue_to_params_fn) {
    var _this = this;
    var queued_data = _.extend({}, this._mixpanel['persistence']._get_queue(action));
    var action_params = queued_data;

    if (!_.isUndefined(queued_data) && _.isObject(queued_data) && !_.isEmptyObject(queued_data)) {
        _this._mixpanel['persistence']._pop_from_people_queue(action, queued_data);
        if (queue_to_params_fn) {
            action_params = queue_to_params_fn(queued_data);
        }
        action_method.call(_this, action_params, function(response, data) {
            // on bad response, we want to add it back to the queue
            if (response === 0) {
                _this._mixpanel['persistence']._add_to_people_queue(action, queued_data);
            }
            if (!_.isUndefined(callback)) {
                callback(response, data);
            }
        });
    }
};

// Flush queued engage operations - order does not matter,
// and there are network level race conditions anyway
MixpanelPeople.prototype._flush = function(
    _set_callback, _add_callback, _append_callback, _set_once_callback, _union_callback, _unset_callback, _remove_callback
) {
    var _this = this;
    var $append_queue = this._mixpanel['persistence']._get_queue(APPEND_ACTION);
    var $remove_queue = this._mixpanel['persistence']._get_queue(REMOVE_ACTION);

    this._flush_one_queue(SET_ACTION, this.set, _set_callback);
    this._flush_one_queue(SET_ONCE_ACTION, this.set_once, _set_once_callback);
    this._flush_one_queue(UNSET_ACTION, this.unset, _unset_callback, function(queue) { return _.keys(queue); });
    this._flush_one_queue(ADD_ACTION, this.increment, _add_callback);
    this._flush_one_queue(UNION_ACTION, this.union, _union_callback);

    // we have to fire off each $append individually since there is
    // no concat method server side
    if (!_.isUndefined($append_queue) && _.isArray($append_queue) && $append_queue.length) {
        var $append_item;
        var append_callback = function(response, data) {
            if (response === 0) {
                _this._mixpanel['persistence']._add_to_people_queue(APPEND_ACTION, $append_item);
            }
            if (!_.isUndefined(_append_callback)) {
                _append_callback(response, data);
            }
        };
        for (var i = $append_queue.length - 1; i >= 0; i--) {
            $append_item = $append_queue.pop();
            if (!_.isEmptyObject($append_item)) {
                _this.append($append_item, append_callback);
            }
        }
        // Save the shortened append queue
        _this._mixpanel['persistence'].save();
    }

    // same for $remove
    if (!_.isUndefined($remove_queue) && _.isArray($remove_queue) && $remove_queue.length) {
        var $remove_item;
        var remove_callback = function(response, data) {
            if (response === 0) {
                _this._mixpanel['persistence']._add_to_people_queue(REMOVE_ACTION, $remove_item);
            }
            if (!_.isUndefined(_remove_callback)) {
                _remove_callback(response, data);
            }
        };
        for (var j = $remove_queue.length - 1; j >= 0; j--) {
            $remove_item = $remove_queue.pop();
            if (!_.isEmptyObject($remove_item)) {
                _this.remove($remove_item, remove_callback);
            }
        }
        _this._mixpanel['persistence'].save();
    }
};

MixpanelPeople.prototype._is_reserved_property = function(prop) {
    return prop === '$distinct_id' || prop === '$token' || prop === '$device_id' || prop === '$user_id' || prop === '$had_persisted_distinct_id';
};

// MixpanelPeople Exports
MixpanelPeople.prototype['set']           = MixpanelPeople.prototype.set;
MixpanelPeople.prototype['set_once']      = MixpanelPeople.prototype.set_once;
MixpanelPeople.prototype['unset']         = MixpanelPeople.prototype.unset;
MixpanelPeople.prototype['increment']     = MixpanelPeople.prototype.increment;
MixpanelPeople.prototype['append']        = MixpanelPeople.prototype.append;
MixpanelPeople.prototype['remove']        = MixpanelPeople.prototype.remove;
MixpanelPeople.prototype['union']         = MixpanelPeople.prototype.union;
MixpanelPeople.prototype['track_charge']  = MixpanelPeople.prototype.track_charge;
MixpanelPeople.prototype['clear_charges'] = MixpanelPeople.prototype.clear_charges;
MixpanelPeople.prototype['delete_user']   = MixpanelPeople.prototype.delete_user;
MixpanelPeople.prototype['toString']      = MixpanelPeople.prototype.toString;

/*
 * Constants
 */
/** @const */ var SET_QUEUE_KEY          = '__mps';
/** @const */ var SET_ONCE_QUEUE_KEY     = '__mpso';
/** @const */ var UNSET_QUEUE_KEY        = '__mpus';
/** @const */ var ADD_QUEUE_KEY          = '__mpa';
/** @const */ var APPEND_QUEUE_KEY       = '__mpap';
/** @const */ var REMOVE_QUEUE_KEY       = '__mpr';
/** @const */ var UNION_QUEUE_KEY        = '__mpu';
// This key is deprecated, but we want to check for it to see whether aliasing is allowed.
/** @const */ var PEOPLE_DISTINCT_ID_KEY = '$people_distinct_id';
/** @const */ var ALIAS_ID_KEY           = '__alias';
/** @const */ var EVENT_TIMERS_KEY       = '__timers';
/** @const */ var RESERVED_PROPERTIES = [
    SET_QUEUE_KEY,
    SET_ONCE_QUEUE_KEY,
    UNSET_QUEUE_KEY,
    ADD_QUEUE_KEY,
    APPEND_QUEUE_KEY,
    REMOVE_QUEUE_KEY,
    UNION_QUEUE_KEY,
    PEOPLE_DISTINCT_ID_KEY,
    ALIAS_ID_KEY,
    EVENT_TIMERS_KEY
];

/**
 * Mixpanel Persistence Object
 * @constructor
 */
var MixpanelPersistence = function(config) {
    this['props'] = {};
    this.campaign_params_saved = false;

    if (config['persistence_name']) {
        this.name = 'mp_' + config['persistence_name'];
    } else {
        this.name = 'mp_' + config['token'] + '_mixpanel';
    }

    var storage_type = config['persistence'];
    if (storage_type !== 'cookie' && storage_type !== 'localStorage') {
        console.critical('Unknown persistence type ' + storage_type + '; falling back to cookie');
        storage_type = config['persistence'] = 'cookie';
    }

    if (storage_type === 'localStorage' && _.localStorage.is_supported()) {
        this.storage = _.localStorage;
    } else {
        this.storage = _.cookie;
    }

    this.load();
    this.update_config(config);
    this.upgrade(config);
    this.save();
};

MixpanelPersistence.prototype.properties = function() {
    var p = {};
    // Filter out reserved properties
    _.each(this['props'], function(v, k) {
        if (!_.include(RESERVED_PROPERTIES, k)) {
            p[k] = v;
        }
    });
    return p;
};

MixpanelPersistence.prototype.load = function() {
    if (this.disabled) { return; }

    var entry = this.storage.parse(this.name);

    if (entry) {
        this['props'] = _.extend({}, entry);
    }
};

MixpanelPersistence.prototype.upgrade = function(config) {
    var upgrade_from_old_lib = config['upgrade'],
        old_cookie_name,
        old_cookie;

    if (upgrade_from_old_lib) {
        old_cookie_name = 'mp_super_properties';
        // Case where they had a custom cookie name before.
        if (typeof(upgrade_from_old_lib) === 'string') {
            old_cookie_name = upgrade_from_old_lib;
        }

        old_cookie = this.storage.parse(old_cookie_name);

        // remove the cookie
        this.storage.remove(old_cookie_name);
        this.storage.remove(old_cookie_name, true);

        if (old_cookie) {
            this['props'] = _.extend(
                this['props'],
                old_cookie['all'],
                old_cookie['events']
            );
        }
    }

    if (!config['cookie_name'] && config['name'] !== 'mixpanel') {
        // special case to handle people with cookies of the form
        // mp_TOKEN_INSTANCENAME from the first release of this library
        old_cookie_name = 'mp_' + config['token'] + '_' + config['name'];
        old_cookie = this.storage.parse(old_cookie_name);

        if (old_cookie) {
            this.storage.remove(old_cookie_name);
            this.storage.remove(old_cookie_name, true);

            // Save the prop values that were in the cookie from before -
            // this should only happen once as we delete the old one.
            this.register_once(old_cookie);
        }
    }

    if (this.storage === _.localStorage) {
        old_cookie = _.cookie.parse(this.name);

        _.cookie.remove(this.name);
        _.cookie.remove(this.name, true);

        if (old_cookie) {
            this.register_once(old_cookie);
        }
    }
};

MixpanelPersistence.prototype.save = function() {
    if (this.disabled) { return; }
    this.storage.set(
        this.name,
        _.JSONEncode(this['props']),
        this.expire_days,
        this.cross_subdomain,
        this.secure,
        this.cross_site,
        this.cookie_domain
    );
};

MixpanelPersistence.prototype.remove = function() {
    // remove both domain and subdomain cookies
    this.storage.remove(this.name, false, this.cookie_domain);
    this.storage.remove(this.name, true, this.cookie_domain);
};

// removes the storage entry and deletes all loaded data
// forced name for tests
MixpanelPersistence.prototype.clear = function() {
    this.remove();
    this['props'] = {};
};

/**
* @param {Object} props
* @param {*=} default_value
* @param {number=} days
*/
MixpanelPersistence.prototype.register_once = function(props, default_value, days) {
    if (_.isObject(props)) {
        if (typeof(default_value) === 'undefined') { default_value = 'None'; }
        this.expire_days = (typeof(days) === 'undefined') ? this.default_expiry : days;

        _.each(props, function(val, prop) {
            if (!this['props'].hasOwnProperty(prop) || this['props'][prop] === default_value) {
                this['props'][prop] = val;
            }
        }, this);

        this.save();

        return true;
    }
    return false;
};

/**
* @param {Object} props
* @param {number=} days
*/
MixpanelPersistence.prototype.register = function(props, days) {
    if (_.isObject(props)) {
        this.expire_days = (typeof(days) === 'undefined') ? this.default_expiry : days;

        _.extend(this['props'], props);

        this.save();

        return true;
    }
    return false;
};

MixpanelPersistence.prototype.unregister = function(prop) {
    if (prop in this['props']) {
        delete this['props'][prop];
        this.save();
    }
};

MixpanelPersistence.prototype.update_search_keyword = function(referrer) {
    this.register(_.info.searchInfo(referrer));
};

// EXPORTED METHOD, we test this directly.
MixpanelPersistence.prototype.update_referrer_info = function(referrer) {
    // If referrer doesn't exist, we want to note the fact that it was type-in traffic.
    this.register_once({
        '$initial_referrer': referrer || '$direct',
        '$initial_referring_domain': _.info.referringDomain(referrer) || '$direct'
    }, '');
};

MixpanelPersistence.prototype.get_referrer_info = function() {
    return _.strip_empty_properties({
        '$initial_referrer': this['props']['$initial_referrer'],
        '$initial_referring_domain': this['props']['$initial_referring_domain']
    });
};

// safely fills the passed in object with stored properties,
// does not override any properties defined in both
// returns the passed in object
MixpanelPersistence.prototype.safe_merge = function(props) {
    _.each(this['props'], function(val, prop) {
        if (!(prop in props)) {
            props[prop] = val;
        }
    });

    return props;
};

MixpanelPersistence.prototype.update_config = function(config) {
    this.default_expiry = this.expire_days = config['cookie_expiration'];
    this.set_disabled(config['disable_persistence']);
    this.set_cookie_domain(config['cookie_domain']);
    this.set_cross_site(config['cross_site_cookie']);
    this.set_cross_subdomain(config['cross_subdomain_cookie']);
    this.set_secure(config['secure_cookie']);
};

MixpanelPersistence.prototype.set_disabled = function(disabled) {
    this.disabled = disabled;
    if (this.disabled) {
        this.remove();
    } else {
        this.save();
    }
};

MixpanelPersistence.prototype.set_cookie_domain = function(cookie_domain) {
    if (cookie_domain !== this.cookie_domain) {
        this.remove();
        this.cookie_domain = cookie_domain;
        this.save();
    }
};

MixpanelPersistence.prototype.set_cross_site = function(cross_site) {
    if (cross_site !== this.cross_site) {
        this.cross_site = cross_site;
        this.remove();
        this.save();
    }
};

MixpanelPersistence.prototype.set_cross_subdomain = function(cross_subdomain) {
    if (cross_subdomain !== this.cross_subdomain) {
        this.cross_subdomain = cross_subdomain;
        this.remove();
        this.save();
    }
};

MixpanelPersistence.prototype.get_cross_subdomain = function() {
    return this.cross_subdomain;
};

MixpanelPersistence.prototype.set_secure = function(secure) {
    if (secure !== this.secure) {
        this.secure = secure ? true : false;
        this.remove();
        this.save();
    }
};

MixpanelPersistence.prototype._add_to_people_queue = function(queue, data) {
    var q_key = this._get_queue_key(queue),
        q_data = data[queue],
        set_q = this._get_or_create_queue(SET_ACTION),
        set_once_q = this._get_or_create_queue(SET_ONCE_ACTION),
        unset_q = this._get_or_create_queue(UNSET_ACTION),
        add_q = this._get_or_create_queue(ADD_ACTION),
        union_q = this._get_or_create_queue(UNION_ACTION),
        remove_q = this._get_or_create_queue(REMOVE_ACTION, []),
        append_q = this._get_or_create_queue(APPEND_ACTION, []);

    if (q_key === SET_QUEUE_KEY) {
        // Update the set queue - we can override any existing values
        _.extend(set_q, q_data);
        // if there was a pending increment, override it
        // with the set.
        this._pop_from_people_queue(ADD_ACTION, q_data);
        // if there was a pending union, override it
        // with the set.
        this._pop_from_people_queue(UNION_ACTION, q_data);
        this._pop_from_people_queue(UNSET_ACTION, q_data);
    } else if (q_key === SET_ONCE_QUEUE_KEY) {
        // only queue the data if there is not already a set_once call for it.
        _.each(q_data, function(v, k) {
            if (!(k in set_once_q)) {
                set_once_q[k] = v;
            }
        });
        this._pop_from_people_queue(UNSET_ACTION, q_data);
    } else if (q_key === UNSET_QUEUE_KEY) {
        _.each(q_data, function(prop) {

            // undo previously-queued actions on this key
            _.each([set_q, set_once_q, add_q, union_q], function(enqueued_obj) {
                if (prop in enqueued_obj) {
                    delete enqueued_obj[prop];
                }
            });
            _.each(append_q, function(append_obj) {
                if (prop in append_obj) {
                    delete append_obj[prop];
                }
            });

            unset_q[prop] = true;

        });
    } else if (q_key === ADD_QUEUE_KEY) {
        _.each(q_data, function(v, k) {
            // If it exists in the set queue, increment
            // the value
            if (k in set_q) {
                set_q[k] += v;
            } else {
                // If it doesn't exist, update the add
                // queue
                if (!(k in add_q)) {
                    add_q[k] = 0;
                }
                add_q[k] += v;
            }
        }, this);
        this._pop_from_people_queue(UNSET_ACTION, q_data);
    } else if (q_key === UNION_QUEUE_KEY) {
        _.each(q_data, function(v, k) {
            if (_.isArray(v)) {
                if (!(k in union_q)) {
                    union_q[k] = [];
                }
                // We may send duplicates, the server will dedup them.
                union_q[k] = union_q[k].concat(v);
            }
        });
        this._pop_from_people_queue(UNSET_ACTION, q_data);
    } else if (q_key === REMOVE_QUEUE_KEY) {
        remove_q.push(q_data);
        this._pop_from_people_queue(APPEND_ACTION, q_data);
    } else if (q_key === APPEND_QUEUE_KEY) {
        append_q.push(q_data);
        this._pop_from_people_queue(UNSET_ACTION, q_data);
    }

    console.log('MIXPANEL PEOPLE REQUEST (QUEUED, PENDING IDENTIFY):');
    console.log(data);

    this.save();
};

MixpanelPersistence.prototype._pop_from_people_queue = function(queue, data) {
    var q = this._get_queue(queue);
    if (!_.isUndefined(q)) {
        _.each(data, function(v, k) {
            if (queue === APPEND_ACTION || queue === REMOVE_ACTION) {
                // list actions: only remove if both k+v match
                // e.g. remove should not override append in a case like
                // append({foo: 'bar'}); remove({foo: 'qux'})
                _.each(q, function(queued_action) {
                    if (queued_action[k] === v) {
                        delete queued_action[k];
                    }
                });
            } else {
                delete q[k];
            }
        }, this);

        this.save();
    }
};

MixpanelPersistence.prototype._get_queue_key = function(queue) {
    if (queue === SET_ACTION) {
        return SET_QUEUE_KEY;
    } else if (queue === SET_ONCE_ACTION) {
        return SET_ONCE_QUEUE_KEY;
    } else if (queue === UNSET_ACTION) {
        return UNSET_QUEUE_KEY;
    } else if (queue === ADD_ACTION) {
        return ADD_QUEUE_KEY;
    } else if (queue === APPEND_ACTION) {
        return APPEND_QUEUE_KEY;
    } else if (queue === REMOVE_ACTION) {
        return REMOVE_QUEUE_KEY;
    } else if (queue === UNION_ACTION) {
        return UNION_QUEUE_KEY;
    } else {
        console.error('Invalid queue:', queue);
    }
};

MixpanelPersistence.prototype._get_queue = function(queue) {
    return this['props'][this._get_queue_key(queue)];
};
MixpanelPersistence.prototype._get_or_create_queue = function(queue, default_val) {
    var key = this._get_queue_key(queue);
    default_val = _.isUndefined(default_val) ? {} : default_val;

    return this['props'][key] || (this['props'][key] = default_val);
};

MixpanelPersistence.prototype.set_event_timer = function(event_name, timestamp) {
    var timers = this['props'][EVENT_TIMERS_KEY] || {};
    timers[event_name] = timestamp;
    this['props'][EVENT_TIMERS_KEY] = timers;
    this.save();
};

MixpanelPersistence.prototype.remove_event_timer = function(event_name) {
    var timers = this['props'][EVENT_TIMERS_KEY] || {};
    var timestamp = timers[event_name];
    if (!_.isUndefined(timestamp)) {
        delete this['props'][EVENT_TIMERS_KEY][event_name];
        this.save();
    }
    return timestamp;
};

/*
 * Mixpanel JS Library
 *
 * Copyright 2012, Mixpanel, Inc. All Rights Reserved
 * http://mixpanel.com/
 *
 * Includes portions of Underscore.js
 * http://documentcloud.github.com/underscore/
 * (c) 2011 Jeremy Ashkenas, DocumentCloud Inc.
 * Released under the MIT License.
 */

// ==ClosureCompiler==
// @compilation_level ADVANCED_OPTIMIZATIONS
// @output_file_name mixpanel-2.8.min.js
// ==/ClosureCompiler==

/*
SIMPLE STYLE GUIDE:

this.x === public function
this._x === internal - only use within this file
this.__x === private - only use within the class

Globals should be all caps
*/

var init_type;       // MODULE or SNIPPET loader
var mixpanel_master; // main mixpanel instance / object
var INIT_MODULE  = 0;
var INIT_SNIPPET = 1;

var IDENTITY_FUNC = function(x) {return x;};
var NOOP_FUNC = function() {};

/** @const */ var PRIMARY_INSTANCE_NAME = 'mixpanel';
/** @const */ var PAYLOAD_TYPE_BASE64   = 'base64';
/** @const */ var PAYLOAD_TYPE_JSON     = 'json';
/** @const */ var DEVICE_ID_PREFIX      = '$device:';


/*
 * Dynamic... constants? Is that an oxymoron?
 */
// http://hacks.mozilla.org/2009/07/cross-site-xmlhttprequest-with-cors/
// https://developer.mozilla.org/en-US/docs/DOM/XMLHttpRequest#withCredentials
var USE_XHR = (window$1.XMLHttpRequest && 'withCredentials' in new XMLHttpRequest());

// IE<10 does not support cross-origin XHR's but script tags
// with defer won't block window.onload; ENQUEUE_REQUESTS
// should only be true for Opera<12
var ENQUEUE_REQUESTS = !USE_XHR && (userAgent.indexOf('MSIE') === -1) && (userAgent.indexOf('Mozilla') === -1);

// save reference to navigator.sendBeacon so it can be minified
var sendBeacon = null;
if (navigator['sendBeacon']) {
    sendBeacon = function() {
        // late reference to navigator.sendBeacon to allow patching/spying
        return navigator['sendBeacon'].apply(navigator, arguments);
    };
}

/*
 * Module-level globals
 */
var DEFAULT_CONFIG = {
    'api_host':                          'https://api-js.mixpanel.com',
    'api_method':                        'POST',
    'api_transport':                     'XHR',
    'api_payload_format':                PAYLOAD_TYPE_BASE64,
    'app_host':                          'https://mixpanel.com',
    'cdn':                               'https://cdn.mxpnl.com',
    'cross_site_cookie':                 false,
    'cross_subdomain_cookie':            true,
    'error_reporter':                    NOOP_FUNC,
    'persistence':                       'cookie',
    'persistence_name':                  '',
    'cookie_domain':                     '',
    'cookie_name':                       '',
    'loaded':                            NOOP_FUNC,
    'track_marketing':                   true,
    'track_pageview':                    false,
    'skip_first_touch_marketing':        false,
    'store_google':                      true,
    'save_referrer':                     true,
    'test':                              false,
    'verbose':                           false,
    'img':                               false,
    'debug':                             false,
    'track_links_timeout':               300,
    'cookie_expiration':                 365,
    'upgrade':                           false,
    'disable_persistence':               false,
    'disable_cookie':                    false,
    'secure_cookie':                     false,
    'ip':                                true,
    'opt_out_tracking_by_default':       false,
    'opt_out_persistence_by_default':    false,
    'opt_out_tracking_persistence_type': 'localStorage',
    'opt_out_tracking_cookie_prefix':    null,
    'property_blacklist':                [],
    'xhr_headers':                       {}, // { header: value, header2: value }
    'ignore_dnt':                        false,
    'batch_requests':                    true,
    'batch_size':                        50,
    'batch_flush_interval_ms':           5000,
    'batch_request_timeout_ms':          90000,
    'batch_autostart':                   true,
    'hooks':                             {}
};

var DOM_LOADED = false;

/**
 * Mixpanel Library Object
 * @constructor
 */
var MixpanelLib = function() {};


/**
 * create_mplib(token:string, config:object, name:string)
 *
 * This function is used by the init method of MixpanelLib objects
 * as well as the main initializer at the end of the JSLib (that
 * initializes document.mixpanel as well as any additional instances
 * declared before this file has loaded).
 */
var create_mplib = function(token, config, name) {
    var instance,
        target = (name === PRIMARY_INSTANCE_NAME) ? mixpanel_master : mixpanel_master[name];

    if (target && init_type === INIT_MODULE) {
        instance = target;
    } else {
        if (target && !_.isArray(target)) {
            console.error('You have already initialized ' + name);
            return;
        }
        instance = new MixpanelLib();
    }

    instance._cached_groups = {}; // cache groups in a pool

    instance._init(token, config, name);

    instance['people'] = new MixpanelPeople();
    instance['people']._init(instance);

    if (!instance.get_config('skip_first_touch_marketing')) {
        // We need null UTM params in the object because
        // UTM parameters act as a tuple. If any UTM param
        // is present, then we set all UTM params including
        // empty ones together
        var utm_params = _.info.campaignParams(null);
        var initial_utm_params = {};
        var has_utm = false;
        _.each(utm_params, function(utm_value, utm_key) {
            initial_utm_params['initial_' + utm_key] = utm_value;
            if (utm_value) {
                has_utm = true;
            }
        });
        if (has_utm) {
            instance['people'].set_once(initial_utm_params);
        }
    }

    // if any instance on the page has debug = true, we set the
    // global debug to be true
    Config.DEBUG = Config.DEBUG || instance.get_config('debug');

    // if target is not defined, we called init after the lib already
    // loaded, so there won't be an array of things to execute
    if (!_.isUndefined(target) && _.isArray(target)) {
        // Crunch through the people queue first - we queue this data up &
        // flush on identify, so it's better to do all these operations first
        instance._execute_array.call(instance['people'], target['people']);
        instance._execute_array(target);
    }

    return instance;
};

// Initialization methods

/**
 * This function initializes a new instance of the Mixpanel tracking object.
 * All new instances are added to the main mixpanel object as sub properties (such as
 * mixpanel.library_name) and also returned by this function. To define a
 * second instance on the page, you would call:
 *
 *     mixpanel.init('new token', { your: 'config' }, 'library_name');
 *
 * and use it like so:
 *
 *     mixpanel.library_name.track(...);
 *
 * @param {String} token   Your Mixpanel API token
 * @param {Object} [config]  A dictionary of config options to override. <a href="https://github.com/mixpanel/mixpanel-js/blob/v2.46.0/src/mixpanel-core.js#L88-L127">See a list of default config options</a>.
 * @param {String} [name]    The name for the new mixpanel instance that you want created
 */
MixpanelLib.prototype.init = function (token, config, name) {
    if (_.isUndefined(name)) {
        this.report_error('You must name your new library: init(token, config, name)');
        return;
    }
    if (name === PRIMARY_INSTANCE_NAME) {
        this.report_error('You must initialize the main mixpanel object right after you include the Mixpanel js snippet');
        return;
    }

    var instance = create_mplib(token, config, name);
    mixpanel_master[name] = instance;
    instance._loaded();

    return instance;
};

// mixpanel._init(token:string, config:object, name:string)
//
// This function sets up the current instance of the mixpanel
// library.  The difference between this method and the init(...)
// method is this one initializes the actual instance, whereas the
// init(...) method sets up a new library and calls _init on it.
//
MixpanelLib.prototype._init = function(token, config, name) {
    config = config || {};

    this['__loaded'] = true;
    this['config'] = {};

    var variable_features = {};

    // default to JSON payload for standard mixpanel.com API hosts
    if (!('api_payload_format' in config)) {
        var api_host = config['api_host'] || DEFAULT_CONFIG['api_host'];
        if (api_host.match(/\.mixpanel\.com/)) {
            variable_features['api_payload_format'] = PAYLOAD_TYPE_JSON;
        }
    }

    this.set_config(_.extend({}, DEFAULT_CONFIG, variable_features, config, {
        'name': name,
        'token': token,
        'callback_fn': ((name === PRIMARY_INSTANCE_NAME) ? name : PRIMARY_INSTANCE_NAME + '.' + name) + '._jsc'
    }));

    this['_jsc'] = NOOP_FUNC;

    this.__dom_loaded_queue = [];
    this.__request_queue = [];
    this.__disabled_events = [];
    this._flags = {
        'disable_all_events': false,
        'identify_called': false
    };

    // set up request queueing/batching
    this.request_batchers = {};
    this._batch_requests = this.get_config('batch_requests');
    if (this._batch_requests) {
        if (!_.localStorage.is_supported(true) || !USE_XHR) {
            this._batch_requests = false;
            console.log('Turning off Mixpanel request-queueing; needs XHR and localStorage support');
        } else {
            this.init_batchers();
            if (sendBeacon && window$1.addEventListener) {
                // Before page closes or hides (user tabs away etc), attempt to flush any events
                // queued up via navigator.sendBeacon. Since sendBeacon doesn't report success/failure,
                // events will not be removed from the persistent store; if the site is loaded again,
                // the events will be flushed again on startup and deduplicated on the Mixpanel server
                // side.
                // There is no reliable way to capture only page close events, so we lean on the
                // visibilitychange and pagehide events as recommended at
                // https://developer.mozilla.org/en-US/docs/Web/API/Window/unload_event#usage_notes.
                // These events fire when the user clicks away from the current page/tab, so will occur
                // more frequently than page unload, but are the only mechanism currently for capturing
                // this scenario somewhat reliably.
                var flush_on_unload = _.bind(function() {
                    if (!this.request_batchers.events.stopped) {
                        this.request_batchers.events.flush({unloading: true});
                    }
                }, this);
                window$1.addEventListener('pagehide', function(ev) {
                    if (ev['persisted']) {
                        flush_on_unload();
                    }
                });
                window$1.addEventListener('visibilitychange', function() {
                    if (document$1['visibilityState'] === 'hidden') {
                        flush_on_unload();
                    }
                });
            }
        }
    }

    this['persistence'] = this['cookie'] = new MixpanelPersistence(this['config']);
    this.unpersisted_superprops = {};
    this._gdpr_init();

    var uuid = _.UUID();
    if (!this.get_distinct_id()) {
        // There is no need to set the distinct id
        // or the device id if something was already stored
        // in the persitence
        this.register_once({
            'distinct_id': DEVICE_ID_PREFIX + uuid,
            '$device_id': uuid
        }, '');
    }

    if (this.get_config('track_pageview')) {
        this.track_pageview();
    }
};

// Private methods

MixpanelLib.prototype._loaded = function() {
    this.get_config('loaded')(this);
    this._set_default_superprops();
};

// update persistence with info on referrer, UTM params, etc
MixpanelLib.prototype._set_default_superprops = function() {
    this['persistence'].update_search_keyword(document$1.referrer);
    if (this.get_config('store_google')) {
        this.register(_.info.campaignParams(), {persistent: false});
    }
    if (this.get_config('save_referrer')) {
        this['persistence'].update_referrer_info(document$1.referrer);
    }
};

MixpanelLib.prototype._dom_loaded = function() {
    _.each(this.__dom_loaded_queue, function(item) {
        this._track_dom.apply(this, item);
    }, this);

    if (!this.has_opted_out_tracking()) {
        _.each(this.__request_queue, function(item) {
            this._send_request.apply(this, item);
        }, this);
    }

    delete this.__dom_loaded_queue;
    delete this.__request_queue;
};

MixpanelLib.prototype._track_dom = function(DomClass, args) {
    if (this.get_config('img')) {
        this.report_error('You can\'t use DOM tracking functions with img = true.');
        return false;
    }

    if (!DOM_LOADED) {
        this.__dom_loaded_queue.push([DomClass, args]);
        return false;
    }

    var dt = new DomClass().init(this);
    return dt.track.apply(dt, args);
};

/**
 * _prepare_callback() should be called by callers of _send_request for use
 * as the callback argument.
 *
 * If there is no callback, this returns null.
 * If we are going to make XHR/XDR requests, this returns a function.
 * If we are going to use script tags, this returns a string to use as the
 * callback GET param.
 */
MixpanelLib.prototype._prepare_callback = function(callback, data) {
    if (_.isUndefined(callback)) {
        return null;
    }

    if (USE_XHR) {
        var callback_function = function(response) {
            callback(response, data);
        };
        return callback_function;
    } else {
        // if the user gives us a callback, we store as a random
        // property on this instances jsc function and update our
        // callback string to reflect that.
        var jsc = this['_jsc'];
        var randomized_cb = '' + Math.floor(Math.random() * 100000000);
        var callback_string = this.get_config('callback_fn') + '[' + randomized_cb + ']';
        jsc[randomized_cb] = function(response) {
            delete jsc[randomized_cb];
            callback(response, data);
        };
        return callback_string;
    }
};

MixpanelLib.prototype._send_request = function(url, data, options, callback) {
    var succeeded = true;

    if (ENQUEUE_REQUESTS) {
        this.__request_queue.push(arguments);
        return succeeded;
    }

    var DEFAULT_OPTIONS = {
        method: this.get_config('api_method'),
        transport: this.get_config('api_transport'),
        verbose: this.get_config('verbose')
    };
    var body_data = null;

    if (!callback && (_.isFunction(options) || typeof options === 'string')) {
        callback = options;
        options = null;
    }
    options = _.extend(DEFAULT_OPTIONS, options || {});
    if (!USE_XHR) {
        options.method = 'GET';
    }
    var use_post = options.method === 'POST';
    var use_sendBeacon = sendBeacon && use_post && options.transport.toLowerCase() === 'sendbeacon';

    // needed to correctly format responses
    var verbose_mode = options.verbose;
    if (data['verbose']) { verbose_mode = true; }

    if (this.get_config('test')) { data['test'] = 1; }
    if (verbose_mode) { data['verbose'] = 1; }
    if (this.get_config('img')) { data['img'] = 1; }
    if (!USE_XHR) {
        if (callback) {
            data['callback'] = callback;
        } else if (verbose_mode || this.get_config('test')) {
            // Verbose output (from verbose mode, or an error in test mode) is a json blob,
            // which by itself is not valid javascript. Without a callback, this verbose output will
            // cause an error when returned via jsonp, so we force a no-op callback param.
            // See the ECMA script spec: http://www.ecma-international.org/ecma-262/5.1/#sec-12.4
            data['callback'] = '(function(){})';
        }
    }

    data['ip'] = this.get_config('ip')?1:0;
    data['_'] = new Date().getTime().toString();

    if (use_post) {
        body_data = 'data=' + encodeURIComponent(data['data']);
        delete data['data'];
    }

    url += '?' + _.HTTPBuildQuery(data);

    var lib = this;
    if ('img' in data) {
        var img = document$1.createElement('img');
        img.src = url;
        document$1.body.appendChild(img);
    } else if (use_sendBeacon) {
        try {
            succeeded = sendBeacon(url, body_data);
        } catch (e) {
            lib.report_error(e);
            succeeded = false;
        }
        try {
            if (callback) {
                callback(succeeded ? 1 : 0);
            }
        } catch (e) {
            lib.report_error(e);
        }
    } else if (USE_XHR) {
        try {
            var req = new XMLHttpRequest();
            req.open(options.method, url, true);

            var headers = this.get_config('xhr_headers');
            if (use_post) {
                headers['Content-Type'] = 'application/x-www-form-urlencoded';
            }
            _.each(headers, function(headerValue, headerName) {
                req.setRequestHeader(headerName, headerValue);
            });

            if (options.timeout_ms && typeof req.timeout !== 'undefined') {
                req.timeout = options.timeout_ms;
                var start_time = new Date().getTime();
            }

            // send the mp_optout cookie
            // withCredentials cannot be modified until after calling .open on Android and Mobile Safari
            req.withCredentials = true;
            req.onreadystatechange = function () {
                if (req.readyState === 4) { // XMLHttpRequest.DONE == 4, except in safari 4
                    if (req.status === 200) {
                        if (callback) {
                            if (verbose_mode) {
                                var response;
                                try {
                                    response = _.JSONDecode(req.responseText);
                                } catch (e) {
                                    lib.report_error(e);
                                    if (options.ignore_json_errors) {
                                        response = req.responseText;
                                    } else {
                                        return;
                                    }
                                }
                                callback(response);
                            } else {
                                callback(Number(req.responseText));
                            }
                        }
                    } else {
                        var error;
                        if (
                            req.timeout &&
                            !req.status &&
                            new Date().getTime() - start_time >= req.timeout
                        ) {
                            error = 'timeout';
                        } else {
                            error = 'Bad HTTP status: ' + req.status + ' ' + req.statusText;
                        }
                        lib.report_error(error);
                        if (callback) {
                            if (verbose_mode) {
                                callback({status: 0, error: error, xhr_req: req});
                            } else {
                                callback(0);
                            }
                        }
                    }
                }
            };
            req.send(body_data);
        } catch (e) {
            lib.report_error(e);
            succeeded = false;
        }
    } else {
        var script = document$1.createElement('script');
        script.type = 'text/javascript';
        script.async = true;
        script.defer = true;
        script.src = url;
        var s = document$1.getElementsByTagName('script')[0];
        s.parentNode.insertBefore(script, s);
    }

    return succeeded;
};

/**
 * _execute_array() deals with processing any mixpanel function
 * calls that were called before the Mixpanel library were loaded
 * (and are thus stored in an array so they can be called later)
 *
 * Note: we fire off all the mixpanel function calls && user defined
 * functions BEFORE we fire off mixpanel tracking calls. This is so
 * identify/register/set_config calls can properly modify early
 * tracking calls.
 *
 * @param {Array} array
 */
MixpanelLib.prototype._execute_array = function(array) {
    var fn_name, alias_calls = [], other_calls = [], tracking_calls = [];
    _.each(array, function(item) {
        if (item) {
            fn_name = item[0];
            if (_.isArray(fn_name)) {
                tracking_calls.push(item); // chained call e.g. mixpanel.get_group().set()
            } else if (typeof(item) === 'function') {
                item.call(this);
            } else if (_.isArray(item) && fn_name === 'alias') {
                alias_calls.push(item);
            } else if (_.isArray(item) && fn_name.indexOf('track') !== -1 && typeof(this[fn_name]) === 'function') {
                tracking_calls.push(item);
            } else {
                other_calls.push(item);
            }
        }
    }, this);

    var execute = function(calls, context) {
        _.each(calls, function(item) {
            if (_.isArray(item[0])) {
                // chained call
                var caller = context;
                _.each(item, function(call) {
                    caller = caller[call[0]].apply(caller, call.slice(1));
                });
            } else {
                this[item[0]].apply(this, item.slice(1));
            }
        }, context);
    };

    execute(alias_calls, this);
    execute(other_calls, this);
    execute(tracking_calls, this);
};

// request queueing utils

MixpanelLib.prototype.are_batchers_initialized = function() {
    return !!this.request_batchers.events;
};

MixpanelLib.prototype.init_batchers = function() {
    var token = this.get_config('token');
    if (!this.are_batchers_initialized()) {
        var batcher_for = _.bind(function(attrs) {
            return new RequestBatcher(
                '__mpq_' + token + attrs.queue_suffix,
                {
                    libConfig: this['config'],
                    sendRequestFunc: _.bind(function(data, options, cb) {
                        this._send_request(
                            this.get_config('api_host') + attrs.endpoint,
                            this._encode_data_for_request(data),
                            options,
                            this._prepare_callback(cb, data)
                        );
                    }, this),
                    beforeSendHook: _.bind(function(item) {
                        return this._run_hook('before_send_' + attrs.type, item);
                    }, this),
                    errorReporter: this.get_config('error_reporter'),
                    stopAllBatchingFunc: _.bind(this.stop_batch_senders, this)
                }
            );
        }, this);
        this.request_batchers = {
            events: batcher_for({type: 'events', endpoint: '/track/', queue_suffix: '_ev'}),
            people: batcher_for({type: 'people', endpoint: '/engage/', queue_suffix: '_pp'}),
            groups: batcher_for({type: 'groups', endpoint: '/groups/', queue_suffix: '_gr'})
        };
    }
    if (this.get_config('batch_autostart')) {
        this.start_batch_senders();
    }
};

MixpanelLib.prototype.start_batch_senders = function() {
    if (this.are_batchers_initialized()) {
        this._batch_requests = true;
        _.each(this.request_batchers, function(batcher) {
            batcher.start();
        });
    }
};

MixpanelLib.prototype.stop_batch_senders = function() {
    this._batch_requests = false;
    _.each(this.request_batchers, function(batcher) {
        batcher.stop();
        batcher.clear();
    });
};

/**
 * push() keeps the standard async-array-push
 * behavior around after the lib is loaded.
 * This is only useful for external integrations that
 * do not wish to rely on our convenience methods
 * (created in the snippet).
 *
 * ### Usage:
 *     mixpanel.push(['register', { a: 'b' }]);
 *
 * @param {Array} item A [function_name, args...] array to be executed
 */
MixpanelLib.prototype.push = function(item) {
    this._execute_array([item]);
};

/**
 * Disable events on the Mixpanel object. If passed no arguments,
 * this function disables tracking of any event. If passed an
 * array of event names, those events will be disabled, but other
 * events will continue to be tracked.
 *
 * Note: this function does not stop other mixpanel functions from
 * firing, such as register() or people.set().
 *
 * @param {Array} [events] An array of event names to disable
 */
MixpanelLib.prototype.disable = function(events) {
    if (typeof(events) === 'undefined') {
        this._flags.disable_all_events = true;
    } else {
        this.__disabled_events = this.__disabled_events.concat(events);
    }
};

MixpanelLib.prototype._encode_data_for_request = function(data) {
    var encoded_data = _.JSONEncode(data);
    if (this.get_config('api_payload_format') === PAYLOAD_TYPE_BASE64) {
        encoded_data = _.base64Encode(encoded_data);
    }
    return {'data': encoded_data};
};

// internal method for handling track vs batch-enqueue logic
MixpanelLib.prototype._track_or_batch = function(options, callback) {
    var truncated_data = _.truncate(options.data, 255);
    var endpoint = options.endpoint;
    var batcher = options.batcher;
    var should_send_immediately = options.should_send_immediately;
    var send_request_options = options.send_request_options || {};
    callback = callback || NOOP_FUNC;

    var request_enqueued_or_initiated = true;
    var send_request_immediately = _.bind(function() {
        if (!send_request_options.skip_hooks) {
            truncated_data = this._run_hook('before_send_' + options.type, truncated_data);
        }
        if (truncated_data) {
            console.log('MIXPANEL REQUEST:');
            console.log(truncated_data);
            return this._send_request(
                endpoint,
                this._encode_data_for_request(truncated_data),
                send_request_options,
                this._prepare_callback(callback, truncated_data)
            );
        } else {
            return null;
        }
    }, this);

    if (this._batch_requests && !should_send_immediately) {
        batcher.enqueue(truncated_data, function(succeeded) {
            if (succeeded) {
                callback(1, truncated_data);
            } else {
                send_request_immediately();
            }
        });
    } else {
        request_enqueued_or_initiated = send_request_immediately();
    }

    return request_enqueued_or_initiated && truncated_data;
};

/**
 * Track an event. This is the most important and
 * frequently used Mixpanel function.
 *
 * ### Usage:
 *
 *     // track an event named 'Registered'
 *     mixpanel.track('Registered', {'Gender': 'Male', 'Age': 21});
 *
 *     // track an event using navigator.sendBeacon
 *     mixpanel.track('Left page', {'duration_seconds': 35}, {transport: 'sendBeacon'});
 *
 * To track link clicks or form submissions, see track_links() or track_forms().
 *
 * @param {String} event_name The name of the event. This can be anything the user does - 'Button Click', 'Sign Up', 'Item Purchased', etc.
 * @param {Object} [properties] A set of properties to include with the event you're sending. These describe the user who did the event or details about the event itself.
 * @param {Object} [options] Optional configuration for this track request.
 * @param {String} [options.transport] Transport method for network request ('xhr' or 'sendBeacon').
 * @param {Boolean} [options.send_immediately] Whether to bypass batching/queueing and send track request immediately.
 * @param {Function} [callback] If provided, the callback function will be called after tracking the event.
 * @returns {Boolean|Object} If the tracking request was successfully initiated/queued, an object
 * with the tracking payload sent to the API server is returned; otherwise false.
 */
MixpanelLib.prototype.track = addOptOutCheckMixpanelLib(function(event_name, properties, options, callback) {
    if (!callback && typeof options === 'function') {
        callback = options;
        options = null;
    }
    options = options || {};
    var transport = options['transport']; // external API, don't minify 'transport' prop
    if (transport) {
        options.transport = transport; // 'transport' prop name can be minified internally
    }
    var should_send_immediately = options['send_immediately'];
    if (typeof callback !== 'function') {
        callback = NOOP_FUNC;
    }

    if (_.isUndefined(event_name)) {
        this.report_error('No event name provided to mixpanel.track');
        return;
    }

    if (this._event_is_disabled(event_name)) {
        callback(0);
        return;
    }

    // set defaults
    properties = properties || {};
    properties['token'] = this.get_config('token');

    // set $duration if time_event was previously called for this event
    var start_timestamp = this['persistence'].remove_event_timer(event_name);
    if (!_.isUndefined(start_timestamp)) {
        var duration_in_ms = new Date().getTime() - start_timestamp;
        properties['$duration'] = parseFloat((duration_in_ms / 1000).toFixed(3));
    }

    this._set_default_superprops();

    var marketing_properties = this.get_config('track_marketing')
        ? _.info.marketingParams()
        : {};

    // note: extend writes to the first object, so lets make sure we
    // don't write to the persistence properties object and info
    // properties object by passing in a new object

    // update properties with pageview info and super-properties
    properties = _.extend(
        {},
        _.info.properties(),
        marketing_properties,
        this['persistence'].properties(),
        this.unpersisted_superprops,
        properties
    );

    var property_blacklist = this.get_config('property_blacklist');
    if (_.isArray(property_blacklist)) {
        _.each(property_blacklist, function(blacklisted_prop) {
            delete properties[blacklisted_prop];
        });
    } else {
        this.report_error('Invalid value for property_blacklist config: ' + property_blacklist);
    }

    var data = {
        'event': event_name,
        'properties': properties
    };
    var ret = this._track_or_batch({
        type: 'events',
        data: data,
        endpoint: this.get_config('api_host') + '/track/',
        batcher: this.request_batchers.events,
        should_send_immediately: should_send_immediately,
        send_request_options: options
    }, callback);

    return ret;
});

/**
 * Register the current user into one/many groups.
 *
 * ### Usage:
 *
 *      mixpanel.set_group('company', ['mixpanel', 'google']) // an array of IDs
 *      mixpanel.set_group('company', 'mixpanel')
 *      mixpanel.set_group('company', 128746312)
 *
 * @param {String} group_key Group key
 * @param {Array|String|Number} group_ids An array of group IDs, or a singular group ID
 * @param {Function} [callback] If provided, the callback will be called after tracking the event.
 *
 */
MixpanelLib.prototype.set_group = addOptOutCheckMixpanelLib(function(group_key, group_ids, callback) {
    if (!_.isArray(group_ids)) {
        group_ids = [group_ids];
    }
    var prop = {};
    prop[group_key] = group_ids;
    this.register(prop);
    return this['people'].set(group_key, group_ids, callback);
});

/**
 * Add a new group for this user.
 *
 * ### Usage:
 *
 *      mixpanel.add_group('company', 'mixpanel')
 *
 * @param {String} group_key Group key
 * @param {*} group_id A valid Mixpanel property type
 * @param {Function} [callback] If provided, the callback will be called after tracking the event.
 */
MixpanelLib.prototype.add_group = addOptOutCheckMixpanelLib(function(group_key, group_id, callback) {
    var old_values = this.get_property(group_key);
    if (old_values === undefined) {
        var prop = {};
        prop[group_key] = [group_id];
        this.register(prop);
    } else {
        if (old_values.indexOf(group_id) === -1) {
            old_values.push(group_id);
            this.register(prop);
        }
    }
    return this['people'].union(group_key, group_id, callback);
});

/**
 * Remove a group from this user.
 *
 * ### Usage:
 *
 *      mixpanel.remove_group('company', 'mixpanel')
 *
 * @param {String} group_key Group key
 * @param {*} group_id A valid Mixpanel property type
 * @param {Function} [callback] If provided, the callback will be called after tracking the event.
 */
MixpanelLib.prototype.remove_group = addOptOutCheckMixpanelLib(function(group_key, group_id, callback) {
    var old_value = this.get_property(group_key);
    // if the value doesn't exist, the persistent store is unchanged
    if (old_value !== undefined) {
        var idx = old_value.indexOf(group_id);
        if (idx > -1) {
            old_value.splice(idx, 1);
            this.register({group_key: old_value});
        }
        if (old_value.length === 0) {
            this.unregister(group_key);
        }
    }
    return this['people'].remove(group_key, group_id, callback);
});

/**
 * Track an event with specific groups.
 *
 * ### Usage:
 *
 *      mixpanel.track_with_groups('purchase', {'product': 'iphone'}, {'University': ['UCB', 'UCLA']})
 *
 * @param {String} event_name The name of the event (see `mixpanel.track()`)
 * @param {Object=} properties A set of properties to include with the event you're sending (see `mixpanel.track()`)
 * @param {Object=} groups An object mapping group name keys to one or more values
 * @param {Function} [callback] If provided, the callback will be called after tracking the event.
 */
MixpanelLib.prototype.track_with_groups = addOptOutCheckMixpanelLib(function(event_name, properties, groups, callback) {
    var tracking_props = _.extend({}, properties || {});
    _.each(groups, function(v, k) {
        if (v !== null && v !== undefined) {
            tracking_props[k] = v;
        }
    });
    return this.track(event_name, tracking_props, callback);
});

MixpanelLib.prototype._create_map_key = function (group_key, group_id) {
    return group_key + '_' + JSON.stringify(group_id);
};

MixpanelLib.prototype._remove_group_from_cache = function (group_key, group_id) {
    delete this._cached_groups[this._create_map_key(group_key, group_id)];
};

/**
 * Look up reference to a Mixpanel group
 *
 * ### Usage:
 *
 *       mixpanel.get_group(group_key, group_id)
 *
 * @param {String} group_key Group key
 * @param {Object} group_id A valid Mixpanel property type
 * @returns {Object} A MixpanelGroup identifier
 */
MixpanelLib.prototype.get_group = function (group_key, group_id) {
    var map_key = this._create_map_key(group_key, group_id);
    var group = this._cached_groups[map_key];
    if (group === undefined || group._group_key !== group_key || group._group_id !== group_id) {
        group = new MixpanelGroup();
        group._init(this, group_key, group_id);
        this._cached_groups[map_key] = group;
    }
    return group;
};

/**
 * Track a default Mixpanel page view event, which includes extra default event properties to
 * improve page view data. The `config.track_pageview` option for <a href="#mixpanelinit">mixpanel.init()</a>
 * may be turned on for tracking page loads automatically.
 *
 * ### Usage
 *
 *     // track a default $mp_web_page_view event
 *     mixpanel.track_pageview();
 *
 *     // track a page view event with additional event properties
 *     mixpanel.track_pageview({'ab_test_variant': 'card-layout-b'});
 *
 *     // example approach to track page views on different page types as event properties
 *     mixpanel.track_pageview({'page': 'pricing'});
 *     mixpanel.track_pageview({'page': 'homepage'});
 *
 *     // UNCOMMON: Tracking a page view event with a custom event_name option. NOT expected to be used for
 *     // individual pages on the same site or product. Use cases for custom event_name may be page
 *     // views on different products or internal applications that are considered completely separate
 *     mixpanel.track_pageview({'page': 'customer-search'}, {'event_name': '[internal] Admin Page View'});
 *
 * @param {Object} [properties] An optional set of additional properties to send with the page view event
 * @param {Object} [options] Page view tracking options
 * @param {String} [options.event_name] - Alternate name for the tracking event
 * @returns {Boolean|Object} If the tracking request was successfully initiated/queued, an object
 * with the tracking payload sent to the API server is returned; otherwise false.
 */
MixpanelLib.prototype.track_pageview = addOptOutCheckMixpanelLib(function(properties, options) {
    if (typeof properties !== 'object') {
        properties = {};
    }
    options = options || {};
    var event_name = options['event_name'] || '$mp_web_page_view';

    var default_page_properties = _.extend(
        _.info.mpPageViewProperties(),
        _.info.campaignParams(),
        _.info.clickParams()
    );

    var event_properties = _.extend(
        {},
        default_page_properties,
        properties
    );

    return this.track(event_name, event_properties);
});

/**
 * Track clicks on a set of document elements. Selector must be a
 * valid query. Elements must exist on the page at the time track_links is called.
 *
 * ### Usage:
 *
 *     // track click for link id #nav
 *     mixpanel.track_links('#nav', 'Clicked Nav Link');
 *
 * ### Notes:
 *
 * This function will wait up to 300 ms for the Mixpanel
 * servers to respond. If they have not responded by that time
 * it will head to the link without ensuring that your event
 * has been tracked.  To configure this timeout please see the
 * set_config() documentation below.
 *
 * If you pass a function in as the properties argument, the
 * function will receive the DOMElement that triggered the
 * event as an argument.  You are expected to return an object
 * from the function; any properties defined on this object
 * will be sent to mixpanel as event properties.
 *
 * @type {Function}
 * @param {Object|String} query A valid DOM query, element or jQuery-esque list
 * @param {String} event_name The name of the event to track
 * @param {Object|Function} [properties] A properties object or function that returns a dictionary of properties when passed a DOMElement
 */
MixpanelLib.prototype.track_links = function() {
    return this._track_dom.call(this, LinkTracker, arguments);
};

/**
 * Track form submissions. Selector must be a valid query.
 *
 * ### Usage:
 *
 *     // track submission for form id 'register'
 *     mixpanel.track_forms('#register', 'Created Account');
 *
 * ### Notes:
 *
 * This function will wait up to 300 ms for the mixpanel
 * servers to respond, if they have not responded by that time
 * it will head to the link without ensuring that your event
 * has been tracked.  To configure this timeout please see the
 * set_config() documentation below.
 *
 * If you pass a function in as the properties argument, the
 * function will receive the DOMElement that triggered the
 * event as an argument.  You are expected to return an object
 * from the function; any properties defined on this object
 * will be sent to mixpanel as event properties.
 *
 * @type {Function}
 * @param {Object|String} query A valid DOM query, element or jQuery-esque list
 * @param {String} event_name The name of the event to track
 * @param {Object|Function} [properties] This can be a set of properties, or a function that returns a set of properties after being passed a DOMElement
 */
MixpanelLib.prototype.track_forms = function() {
    return this._track_dom.call(this, FormTracker, arguments);
};

/**
 * Time an event by including the time between this call and a
 * later 'track' call for the same event in the properties sent
 * with the event.
 *
 * ### Usage:
 *
 *     // time an event named 'Registered'
 *     mixpanel.time_event('Registered');
 *     mixpanel.track('Registered', {'Gender': 'Male', 'Age': 21});
 *
 * When called for a particular event name, the next track call for that event
 * name will include the elapsed time between the 'time_event' and 'track'
 * calls. This value is stored as seconds in the '$duration' property.
 *
 * @param {String} event_name The name of the event.
 */
MixpanelLib.prototype.time_event = function(event_name) {
    if (_.isUndefined(event_name)) {
        this.report_error('No event name provided to mixpanel.time_event');
        return;
    }

    if (this._event_is_disabled(event_name)) {
        return;
    }

    this['persistence'].set_event_timer(event_name,  new Date().getTime());
};

var REGISTER_DEFAULTS = {
    'persistent': true
};
/**
 * Helper to parse options param for register methods, maintaining
 * legacy support for plain "days" param instead of options object
 * @param {Number|Object} [days_or_options] 'days' option (Number), or Options object for register methods
 * @returns {Object} options object
 */
var options_for_register = function(days_or_options) {
    var options;
    if (_.isObject(days_or_options)) {
        options = days_or_options;
    } else if (!_.isUndefined(days_or_options)) {
        options = {'days': days_or_options};
    } else {
        options = {};
    }
    return _.extend({}, REGISTER_DEFAULTS, options);
};

/**
 * Register a set of super properties, which are included with all
 * events. This will overwrite previous super property values.
 *
 * ### Usage:
 *
 *     // register 'Gender' as a super property
 *     mixpanel.register({'Gender': 'Female'});
 *
 *     // register several super properties when a user signs up
 *     mixpanel.register({
 *         'Email': 'jdoe@example.com',
 *         'Account Type': 'Free'
 *     });
 *
 *     // register only for the current pageload
 *     mixpanel.register({'Name': 'Pat'}, {persistent: false});
 *
 * @param {Object} properties An associative array of properties to store about the user
 * @param {Number|Object} [days_or_options] Options object or number of days since the user's last visit to store the super properties (only valid for persisted props)
 * @param {boolean} [days_or_options.days] - number of days since the user's last visit to store the super properties (only valid for persisted props)
 * @param {boolean} [days_or_options.persistent=true] - whether to put in persistent storage (cookie/localStorage)
 */
MixpanelLib.prototype.register = function(props, days_or_options) {
    var options = options_for_register(days_or_options);
    if (options['persistent']) {
        this['persistence'].register(props, options['days']);
    } else {
        _.extend(this.unpersisted_superprops, props);
    }
};

/**
 * Register a set of super properties only once. This will not
 * overwrite previous super property values, unlike register().
 *
 * ### Usage:
 *
 *     // register a super property for the first time only
 *     mixpanel.register_once({
 *         'First Login Date': new Date().toISOString()
 *     });
 *
 *     // register once, only for the current pageload
 *     mixpanel.register_once({
 *         'First interaction time': new Date().toISOString()
 *     }, 'None', {persistent: false});
 *
 * ### Notes:
 *
 * If default_value is specified, current super properties
 * with that value will be overwritten.
 *
 * @param {Object} properties An associative array of properties to store about the user
 * @param {*} [default_value] Value to override if already set in super properties (ex: 'False') Default: 'None'
 * @param {Number|Object} [days_or_options] Options object or number of days since the user's last visit to store the super properties (only valid for persisted props)
 * @param {boolean} [days_or_options.days] - number of days since the user's last visit to store the super properties (only valid for persisted props)
 * @param {boolean} [days_or_options.persistent=true] - whether to put in persistent storage (cookie/localStorage)
 */
MixpanelLib.prototype.register_once = function(props, default_value, days_or_options) {
    var options = options_for_register(days_or_options);
    if (options['persistent']) {
        this['persistence'].register_once(props, default_value, options['days']);
    } else {
        if (typeof(default_value) === 'undefined') {
            default_value = 'None';
        }
        _.each(props, function(val, prop) {
            if (!this.unpersisted_superprops.hasOwnProperty(prop) || this.unpersisted_superprops[prop] === default_value) {
                this.unpersisted_superprops[prop] = val;
            }
        }, this);
    }
};

/**
 * Delete a super property stored with the current user.
 *
 * @param {String} property The name of the super property to remove
 * @param {Object} [options]
 * @param {boolean} [options.persistent=true] - whether to look in persistent storage (cookie/localStorage)
 */
MixpanelLib.prototype.unregister = function(property, options) {
    options = options_for_register(options);
    if (options['persistent']) {
        this['persistence'].unregister(property);
    } else {
        delete this.unpersisted_superprops[property];
    }
};

MixpanelLib.prototype._register_single = function(prop, value) {
    var props = {};
    props[prop] = value;
    this.register(props);
};

/**
 * Identify a user with a unique ID to track user activity across
 * devices, tie a user to their events, and create a user profile.
 * If you never call this method, unique visitors are tracked using
 * a UUID generated the first time they visit the site.
 *
 * Call identify when you know the identity of the current user,
 * typically after login or signup. We recommend against using
 * identify for anonymous visitors to your site.
 *
 * ### Notes:
 * If your project has
 * <a href="https://help.mixpanel.com/hc/en-us/articles/360039133851">ID Merge</a>
 * enabled, the identify method will connect pre- and
 * post-authentication events when appropriate.
 *
 * If your project does not have ID Merge enabled, identify will
 * change the user's local distinct_id to the unique ID you pass.
 * Events tracked prior to authentication will not be connected
 * to the same user identity. If ID Merge is disabled, alias can
 * be used to connect pre- and post-registration events.
 *
 * @param {String} [unique_id] A string that uniquely identifies a user. If not provided, the distinct_id currently in the persistent store (cookie or localStorage) will be used.
 */
MixpanelLib.prototype.identify = function(
    new_distinct_id, _set_callback, _add_callback, _append_callback, _set_once_callback, _union_callback, _unset_callback, _remove_callback
) {
    // Optional Parameters
    //  _set_callback:function  A callback to be run if and when the People set queue is flushed
    //  _add_callback:function  A callback to be run if and when the People add queue is flushed
    //  _append_callback:function  A callback to be run if and when the People append queue is flushed
    //  _set_once_callback:function  A callback to be run if and when the People set_once queue is flushed
    //  _union_callback:function  A callback to be run if and when the People union queue is flushed
    //  _unset_callback:function  A callback to be run if and when the People unset queue is flushed

    var previous_distinct_id = this.get_distinct_id();
    if (new_distinct_id && previous_distinct_id !== new_distinct_id) {
        // we allow the following condition if previous distinct_id is same as new_distinct_id
        // so that you can force flush people updates for anonymous profiles.
        if (typeof new_distinct_id === 'string' && new_distinct_id.indexOf(DEVICE_ID_PREFIX) === 0) {
            this.report_error('distinct_id cannot have $device: prefix');
            return -1;
        }
        this.register({'$user_id': new_distinct_id});
    }

    if (!this.get_property('$device_id')) {
        // The persisted distinct id might not actually be a device id at all
        // it might be a distinct id of the user from before
        var device_id = previous_distinct_id;
        this.register_once({
            '$had_persisted_distinct_id': true,
            '$device_id': device_id
        }, '');
    }

    // identify only changes the distinct id if it doesn't match either the existing or the alias;
    // if it's new, blow away the alias as well.
    if (new_distinct_id !== previous_distinct_id && new_distinct_id !== this.get_property(ALIAS_ID_KEY)) {
        this.unregister(ALIAS_ID_KEY);
        this.register({'distinct_id': new_distinct_id});
    }
    this._flags.identify_called = true;
    // Flush any queued up people requests
    this['people']._flush(_set_callback, _add_callback, _append_callback, _set_once_callback, _union_callback, _unset_callback, _remove_callback);

    // send an $identify event any time the distinct_id is changing - logic on the server
    // will determine whether or not to do anything with it.
    if (new_distinct_id !== previous_distinct_id) {
        this.track('$identify', {
            'distinct_id': new_distinct_id,
            '$anon_distinct_id': previous_distinct_id
        }, {skip_hooks: true});
    }
};

/**
 * Clears super properties and generates a new random distinct_id for this instance.
 * Useful for clearing data when a user logs out.
 */
MixpanelLib.prototype.reset = function() {
    this['persistence'].clear();
    this._flags.identify_called = false;
    var uuid = _.UUID();
    this.register_once({
        'distinct_id': DEVICE_ID_PREFIX + uuid,
        '$device_id': uuid
    }, '');
};

/**
 * Returns the current distinct id of the user. This is either the id automatically
 * generated by the library or the id that has been passed by a call to identify().
 *
 * ### Notes:
 *
 * get_distinct_id() can only be called after the Mixpanel library has finished loading.
 * init() has a loaded function available to handle this automatically. For example:
 *
 *     // set distinct_id after the mixpanel library has loaded
 *     mixpanel.init('YOUR PROJECT TOKEN', {
 *         loaded: function(mixpanel) {
 *             distinct_id = mixpanel.get_distinct_id();
 *         }
 *     });
 */
MixpanelLib.prototype.get_distinct_id = function() {
    return this.get_property('distinct_id');
};

/**
 * The alias method creates an alias which Mixpanel will use to
 * remap one id to another. Multiple aliases can point to the
 * same identifier.
 *
 * The following is a valid use of alias:
 *
 *     mixpanel.alias('new_id', 'existing_id');
 *     // You can add multiple id aliases to the existing ID
 *     mixpanel.alias('newer_id', 'existing_id');
 *
 * Aliases can also be chained - the following is a valid example:
 *
 *     mixpanel.alias('new_id', 'existing_id');
 *     // chain newer_id - new_id - existing_id
 *     mixpanel.alias('newer_id', 'new_id');
 *
 * Aliases cannot point to multiple identifiers - the following
 * example will not work:
 *
 *     mixpanel.alias('new_id', 'existing_id');
 *     // this is invalid as 'new_id' already points to 'existing_id'
 *     mixpanel.alias('new_id', 'newer_id');
 *
 * ### Notes:
 *
 * If your project does not have
 * <a href="https://help.mixpanel.com/hc/en-us/articles/360039133851">ID Merge</a>
 * enabled, the best practice is to call alias once when a unique
 * ID is first created for a user (e.g., when a user first registers
 * for an account). Do not use alias multiple times for a single
 * user without ID Merge enabled.
 *
 * @param {String} alias A unique identifier that you want to use for this user in the future.
 * @param {String} [original] The current identifier being used for this user.
 */
MixpanelLib.prototype.alias = function(alias, original) {
    // If the $people_distinct_id key exists in persistence, there has been a previous
    // mixpanel.people.identify() call made for this user. It is VERY BAD to make an alias with
    // this ID, as it will duplicate users.
    if (alias === this.get_property(PEOPLE_DISTINCT_ID_KEY)) {
        this.report_error('Attempting to create alias for existing People user - aborting.');
        return -2;
    }

    var _this = this;
    if (_.isUndefined(original)) {
        original = this.get_distinct_id();
    }
    if (alias !== original) {
        this._register_single(ALIAS_ID_KEY, alias);
        return this.track('$create_alias', {
            'alias': alias,
            'distinct_id': original
        }, {
            skip_hooks: true
        }, function() {
            // Flush the people queue
            _this.identify(alias);
        });
    } else {
        this.report_error('alias matches current distinct_id - skipping api call.');
        this.identify(alias);
        return -1;
    }
};

/**
 * Provide a string to recognize the user by. The string passed to
 * this method will appear in the Mixpanel Streams product rather
 * than an automatically generated name. Name tags do not have to
 * be unique.
 *
 * This value will only be included in Streams data.
 *
 * @param {String} name_tag A human readable name for the user
 * @deprecated
 */
MixpanelLib.prototype.name_tag = function(name_tag) {
    this._register_single('mp_name_tag', name_tag);
};

/**
 * Update the configuration of a mixpanel library instance.
 *
 * The default config is:
 *
 *     {
 *       // HTTP method for tracking requests
 *       api_method: 'POST'
 *
 *       // transport for sending requests ('XHR' or 'sendBeacon')
 *       // NB: sendBeacon should only be used for scenarios such as
 *       // page unload where a "best-effort" attempt to send is
 *       // acceptable; the sendBeacon API does not support callbacks
 *       // or any way to know the result of the request. Mixpanel
 *       // tracking via sendBeacon will not support any event-
 *       // batching or retry mechanisms.
 *       api_transport: 'XHR'
 *
 *       // request-batching/queueing/retry
 *       batch_requests: true,
 *
 *       // maximum number of events/updates to send in a single
 *       // network request
 *       batch_size: 50,
 *
 *       // milliseconds to wait between sending batch requests
 *       batch_flush_interval_ms: 5000,
 *
 *       // milliseconds to wait for network responses to batch requests
 *       // before they are considered timed-out and retried
 *       batch_request_timeout_ms: 90000,
 *
 *       // override value for cookie domain, only useful for ensuring
 *       // correct cross-subdomain cookies on unusual domains like
 *       // subdomain.mainsite.avocat.fr; NB this cannot be used to
 *       // set cookies on a different domain than the current origin
 *       cookie_domain: ''
 *
 *       // super properties cookie expiration (in days)
 *       cookie_expiration: 365
 *
 *       // if true, cookie will be set with SameSite=None; Secure
 *       // this is only useful in special situations, like embedded
 *       // 3rd-party iframes that set up a Mixpanel instance
 *       cross_site_cookie: false
 *
 *       // super properties span subdomains
 *       cross_subdomain_cookie: true
 *
 *       // debug mode
 *       debug: false
 *
 *       // if this is true, the mixpanel cookie or localStorage entry
 *       // will be deleted, and no user persistence will take place
 *       disable_persistence: false
 *
 *       // if this is true, Mixpanel will automatically determine
 *       // City, Region and Country data using the IP address of
 *       //the client
 *       ip: true
 *
 *       // opt users out of tracking by this Mixpanel instance by default
 *       opt_out_tracking_by_default: false
 *
 *       // opt users out of browser data storage by this Mixpanel instance by default
 *       opt_out_persistence_by_default: false
 *
 *       // persistence mechanism used by opt-in/opt-out methods - cookie
 *       // or localStorage - falls back to cookie if localStorage is unavailable
 *       opt_out_tracking_persistence_type: 'localStorage'
 *
 *       // customize the name of cookie/localStorage set by opt-in/opt-out methods
 *       opt_out_tracking_cookie_prefix: null
 *
 *       // type of persistent store for super properties (cookie/
 *       // localStorage) if set to 'localStorage', any existing
 *       // mixpanel cookie value with the same persistence_name
 *       // will be transferred to localStorage and deleted
 *       persistence: 'cookie'
 *
 *       // name for super properties persistent store
 *       persistence_name: ''
 *
 *       // names of properties/superproperties which should never
 *       // be sent with track() calls
 *       property_blacklist: []
 *
 *       // if this is true, mixpanel cookies will be marked as
 *       // secure, meaning they will only be transmitted over https
 *       secure_cookie: false
 *
 *       // disables enriching user profiles with first touch marketing data
 *       skip_first_touch_marketing: false
 *
 *       // the amount of time track_links will
 *       // wait for Mixpanel's servers to respond
 *       track_links_timeout: 300
 *
 *       // adds any UTM parameters and click IDs present on the page to any events fired
 *       track_marketing: true
 *
 *       // enables automatic page view tracking using default page view events through
 *       // the track_pageview() method
 *       track_pageview: false
 *
 *       // if you set upgrade to be true, the library will check for
 *       // a cookie from our old js library and import super
 *       // properties from it, then the old cookie is deleted
 *       // The upgrade config option only works in the initialization,
 *       // so make sure you set it when you create the library.
 *       upgrade: false
 *
 *       // extra HTTP request headers to set for each API request, in
 *       // the format {'Header-Name': value}
 *       xhr_headers: {}
 *
 *       // whether to ignore or respect the web browser's Do Not Track setting
 *       ignore_dnt: false
 *     }
 *
 *
 * @param {Object} config A dictionary of new configuration values to update
 */
MixpanelLib.prototype.set_config = function(config) {
    if (_.isObject(config)) {
        _.extend(this['config'], config);

        var new_batch_size = config['batch_size'];
        if (new_batch_size) {
            _.each(this.request_batchers, function(batcher) {
                batcher.resetBatchSize();
            });
        }

        if (!this.get_config('persistence_name')) {
            this['config']['persistence_name'] = this['config']['cookie_name'];
        }
        if (!this.get_config('disable_persistence')) {
            this['config']['disable_persistence'] = this['config']['disable_cookie'];
        }

        if (this['persistence']) {
            this['persistence'].update_config(this['config']);
        }
        Config.DEBUG = Config.DEBUG || this.get_config('debug');
    }
};

/**
 * returns the current config object for the library.
 */
MixpanelLib.prototype.get_config = function(prop_name) {
    return this['config'][prop_name];
};

/**
 * Fetch a hook function from config, with safe default, and run it
 * against the given arguments
 * @param {string} hook_name which hook to retrieve
 * @returns {any|null} return value of user-provided hook, or null if nothing was returned
 */
MixpanelLib.prototype._run_hook = function(hook_name) {
    var ret = (this['config']['hooks'][hook_name] || IDENTITY_FUNC).apply(this, slice.call(arguments, 1));
    if (typeof ret === 'undefined') {
        this.report_error(hook_name + ' hook did not return a value');
        ret = null;
    }
    return ret;
};

/**
 * Returns the value of the super property named property_name. If no such
 * property is set, get_property() will return the undefined value.
 *
 * ### Notes:
 *
 * get_property() can only be called after the Mixpanel library has finished loading.
 * init() has a loaded function available to handle this automatically. For example:
 *
 *     // grab value for 'user_id' after the mixpanel library has loaded
 *     mixpanel.init('YOUR PROJECT TOKEN', {
 *         loaded: function(mixpanel) {
 *             user_id = mixpanel.get_property('user_id');
 *         }
 *     });
 *
 * @param {String} property_name The name of the super property you want to retrieve
 */
MixpanelLib.prototype.get_property = function(property_name) {
    return this['persistence']['props'][property_name];
};

MixpanelLib.prototype.toString = function() {
    var name = this.get_config('name');
    if (name !== PRIMARY_INSTANCE_NAME) {
        name = PRIMARY_INSTANCE_NAME + '.' + name;
    }
    return name;
};

MixpanelLib.prototype._event_is_disabled = function(event_name) {
    return _.isBlockedUA(userAgent) ||
        this._flags.disable_all_events ||
        _.include(this.__disabled_events, event_name);
};

// perform some housekeeping around GDPR opt-in/out state
MixpanelLib.prototype._gdpr_init = function() {
    var is_localStorage_requested = this.get_config('opt_out_tracking_persistence_type') === 'localStorage';

    // try to convert opt-in/out cookies to localStorage if possible
    if (is_localStorage_requested && _.localStorage.is_supported()) {
        if (!this.has_opted_in_tracking() && this.has_opted_in_tracking({'persistence_type': 'cookie'})) {
            this.opt_in_tracking({'enable_persistence': false});
        }
        if (!this.has_opted_out_tracking() && this.has_opted_out_tracking({'persistence_type': 'cookie'})) {
            this.opt_out_tracking({'clear_persistence': false});
        }
        this.clear_opt_in_out_tracking({
            'persistence_type': 'cookie',
            'enable_persistence': false
        });
    }

    // check whether the user has already opted out - if so, clear & disable persistence
    if (this.has_opted_out_tracking()) {
        this._gdpr_update_persistence({'clear_persistence': true});

    // check whether we should opt out by default
    // note: we don't clear persistence here by default since opt-out default state is often
    //       used as an initial state while GDPR information is being collected
    } else if (!this.has_opted_in_tracking() && (
        this.get_config('opt_out_tracking_by_default') || _.cookie.get('mp_optout')
    )) {
        _.cookie.remove('mp_optout');
        this.opt_out_tracking({
            'clear_persistence': this.get_config('opt_out_persistence_by_default')
        });
    }
};

/**
 * Enable or disable persistence based on options
 * only enable/disable if persistence is not already in this state
 * @param {boolean} [options.clear_persistence] If true, will delete all data stored by the sdk in persistence and disable it
 * @param {boolean} [options.enable_persistence] If true, will re-enable sdk persistence
 */
MixpanelLib.prototype._gdpr_update_persistence = function(options) {
    var disabled;
    if (options && options['clear_persistence']) {
        disabled = true;
    } else if (options && options['enable_persistence']) {
        disabled = false;
    } else {
        return;
    }

    if (!this.get_config('disable_persistence') && this['persistence'].disabled !== disabled) {
        this['persistence'].set_disabled(disabled);
    }

    if (disabled) {
        _.each(this.request_batchers, function(batcher) {
            batcher.clear();
        });
    }
};

// call a base gdpr function after constructing the appropriate token and options args
MixpanelLib.prototype._gdpr_call_func = function(func, options) {
    options = _.extend({
        'track': _.bind(this.track, this),
        'persistence_type': this.get_config('opt_out_tracking_persistence_type'),
        'cookie_prefix': this.get_config('opt_out_tracking_cookie_prefix'),
        'cookie_expiration': this.get_config('cookie_expiration'),
        'cross_site_cookie': this.get_config('cross_site_cookie'),
        'cross_subdomain_cookie': this.get_config('cross_subdomain_cookie'),
        'cookie_domain': this.get_config('cookie_domain'),
        'secure_cookie': this.get_config('secure_cookie'),
        'ignore_dnt': this.get_config('ignore_dnt')
    }, options);

    // check if localStorage can be used for recording opt out status, fall back to cookie if not
    if (!_.localStorage.is_supported()) {
        options['persistence_type'] = 'cookie';
    }

    return func(this.get_config('token'), {
        track: options['track'],
        trackEventName: options['track_event_name'],
        trackProperties: options['track_properties'],
        persistenceType: options['persistence_type'],
        persistencePrefix: options['cookie_prefix'],
        cookieDomain: options['cookie_domain'],
        cookieExpiration: options['cookie_expiration'],
        crossSiteCookie: options['cross_site_cookie'],
        crossSubdomainCookie: options['cross_subdomain_cookie'],
        secureCookie: options['secure_cookie'],
        ignoreDnt: options['ignore_dnt']
    });
};

/**
 * Opt the user in to data tracking and cookies/localstorage for this Mixpanel instance
 *
 * ### Usage
 *
 *     // opt user in
 *     mixpanel.opt_in_tracking();
 *
 *     // opt user in with specific event name, properties, cookie configuration
 *     mixpanel.opt_in_tracking({
 *         track_event_name: 'User opted in',
 *         track_event_properties: {
 *             'Email': 'jdoe@example.com'
 *         },
 *         cookie_expiration: 30,
 *         secure_cookie: true
 *     });
 *
 * @param {Object} [options] A dictionary of config options to override
 * @param {function} [options.track] Function used for tracking a Mixpanel event to record the opt-in action (default is this Mixpanel instance's track method)
 * @param {string} [options.track_event_name=$opt_in] Event name to be used for tracking the opt-in action
 * @param {Object} [options.track_properties] Set of properties to be tracked along with the opt-in action
 * @param {boolean} [options.enable_persistence=true] If true, will re-enable sdk persistence
 * @param {string} [options.persistence_type=localStorage] Persistence mechanism used - cookie or localStorage - falls back to cookie if localStorage is unavailable
 * @param {string} [options.cookie_prefix=__mp_opt_in_out] Custom prefix to be used in the cookie/localstorage name
 * @param {Number} [options.cookie_expiration] Number of days until the opt-in cookie expires (overrides value specified in this Mixpanel instance's config)
 * @param {string} [options.cookie_domain] Custom cookie domain (overrides value specified in this Mixpanel instance's config)
 * @param {boolean} [options.cross_site_cookie] Whether the opt-in cookie is set as cross-site-enabled (overrides value specified in this Mixpanel instance's config)
 * @param {boolean} [options.cross_subdomain_cookie] Whether the opt-in cookie is set as cross-subdomain or not (overrides value specified in this Mixpanel instance's config)
 * @param {boolean} [options.secure_cookie] Whether the opt-in cookie is set as secure or not (overrides value specified in this Mixpanel instance's config)
 */
MixpanelLib.prototype.opt_in_tracking = function(options) {
    options = _.extend({
        'enable_persistence': true
    }, options);

    this._gdpr_call_func(optIn, options);
    this._gdpr_update_persistence(options);
};

/**
 * Opt the user out of data tracking and cookies/localstorage for this Mixpanel instance
 *
 * ### Usage
 *
 *     // opt user out
 *     mixpanel.opt_out_tracking();
 *
 *     // opt user out with different cookie configuration from Mixpanel instance
 *     mixpanel.opt_out_tracking({
 *         cookie_expiration: 30,
 *         secure_cookie: true
 *     });
 *
 * @param {Object} [options] A dictionary of config options to override
 * @param {boolean} [options.delete_user=true] If true, will delete the currently identified user's profile and clear all charges after opting the user out
 * @param {boolean} [options.clear_persistence=true] If true, will delete all data stored by the sdk in persistence
 * @param {string} [options.persistence_type=localStorage] Persistence mechanism used - cookie or localStorage - falls back to cookie if localStorage is unavailable
 * @param {string} [options.cookie_prefix=__mp_opt_in_out] Custom prefix to be used in the cookie/localstorage name
 * @param {Number} [options.cookie_expiration] Number of days until the opt-in cookie expires (overrides value specified in this Mixpanel instance's config)
 * @param {string} [options.cookie_domain] Custom cookie domain (overrides value specified in this Mixpanel instance's config)
 * @param {boolean} [options.cross_site_cookie] Whether the opt-in cookie is set as cross-site-enabled (overrides value specified in this Mixpanel instance's config)
 * @param {boolean} [options.cross_subdomain_cookie] Whether the opt-in cookie is set as cross-subdomain or not (overrides value specified in this Mixpanel instance's config)
 * @param {boolean} [options.secure_cookie] Whether the opt-in cookie is set as secure or not (overrides value specified in this Mixpanel instance's config)
 */
MixpanelLib.prototype.opt_out_tracking = function(options) {
    options = _.extend({
        'clear_persistence': true,
        'delete_user': true
    }, options);

    // delete user and clear charges since these methods may be disabled by opt-out
    if (options['delete_user'] && this['people'] && this['people']._identify_called()) {
        this['people'].delete_user();
        this['people'].clear_charges();
    }

    this._gdpr_call_func(optOut, options);
    this._gdpr_update_persistence(options);
};

/**
 * Check whether the user has opted in to data tracking and cookies/localstorage for this Mixpanel instance
 *
 * ### Usage
 *
 *     var has_opted_in = mixpanel.has_opted_in_tracking();
 *     // use has_opted_in value
 *
 * @param {Object} [options] A dictionary of config options to override
 * @param {string} [options.persistence_type=localStorage] Persistence mechanism used - cookie or localStorage - falls back to cookie if localStorage is unavailable
 * @param {string} [options.cookie_prefix=__mp_opt_in_out] Custom prefix to be used in the cookie/localstorage name
 * @returns {boolean} current opt-in status
 */
MixpanelLib.prototype.has_opted_in_tracking = function(options) {
    return this._gdpr_call_func(hasOptedIn, options);
};

/**
 * Check whether the user has opted out of data tracking and cookies/localstorage for this Mixpanel instance
 *
 * ### Usage
 *
 *     var has_opted_out = mixpanel.has_opted_out_tracking();
 *     // use has_opted_out value
 *
 * @param {Object} [options] A dictionary of config options to override
 * @param {string} [options.persistence_type=localStorage] Persistence mechanism used - cookie or localStorage - falls back to cookie if localStorage is unavailable
 * @param {string} [options.cookie_prefix=__mp_opt_in_out] Custom prefix to be used in the cookie/localstorage name
 * @returns {boolean} current opt-out status
 */
MixpanelLib.prototype.has_opted_out_tracking = function(options) {
    return this._gdpr_call_func(hasOptedOut, options);
};

/**
 * Clear the user's opt in/out status of data tracking and cookies/localstorage for this Mixpanel instance
 *
 * ### Usage
 *
 *     // clear user's opt-in/out status
 *     mixpanel.clear_opt_in_out_tracking();
 *
 *     // clear user's opt-in/out status with specific cookie configuration - should match
 *     // configuration used when opt_in_tracking/opt_out_tracking methods were called.
 *     mixpanel.clear_opt_in_out_tracking({
 *         cookie_expiration: 30,
 *         secure_cookie: true
 *     });
 *
 * @param {Object} [options] A dictionary of config options to override
 * @param {boolean} [options.enable_persistence=true] If true, will re-enable sdk persistence
 * @param {string} [options.persistence_type=localStorage] Persistence mechanism used - cookie or localStorage - falls back to cookie if localStorage is unavailable
 * @param {string} [options.cookie_prefix=__mp_opt_in_out] Custom prefix to be used in the cookie/localstorage name
 * @param {Number} [options.cookie_expiration] Number of days until the opt-in cookie expires (overrides value specified in this Mixpanel instance's config)
 * @param {string} [options.cookie_domain] Custom cookie domain (overrides value specified in this Mixpanel instance's config)
 * @param {boolean} [options.cross_site_cookie] Whether the opt-in cookie is set as cross-site-enabled (overrides value specified in this Mixpanel instance's config)
 * @param {boolean} [options.cross_subdomain_cookie] Whether the opt-in cookie is set as cross-subdomain or not (overrides value specified in this Mixpanel instance's config)
 * @param {boolean} [options.secure_cookie] Whether the opt-in cookie is set as secure or not (overrides value specified in this Mixpanel instance's config)
 */
MixpanelLib.prototype.clear_opt_in_out_tracking = function(options) {
    options = _.extend({
        'enable_persistence': true
    }, options);

    this._gdpr_call_func(clearOptInOut, options);
    this._gdpr_update_persistence(options);
};

MixpanelLib.prototype.report_error = function(msg, err) {
    console.error.apply(console.error, arguments);
    try {
        if (!err && !(msg instanceof Error)) {
            msg = new Error(msg);
        }
        this.get_config('error_reporter')(msg, err);
    } catch(err) {
        console.error(err);
    }
};

// EXPORTS (for closure compiler)

// MixpanelLib Exports
MixpanelLib.prototype['init']                               = MixpanelLib.prototype.init;
MixpanelLib.prototype['reset']                              = MixpanelLib.prototype.reset;
MixpanelLib.prototype['disable']                            = MixpanelLib.prototype.disable;
MixpanelLib.prototype['time_event']                         = MixpanelLib.prototype.time_event;
MixpanelLib.prototype['track']                              = MixpanelLib.prototype.track;
MixpanelLib.prototype['track_links']                        = MixpanelLib.prototype.track_links;
MixpanelLib.prototype['track_forms']                        = MixpanelLib.prototype.track_forms;
MixpanelLib.prototype['track_pageview']                     = MixpanelLib.prototype.track_pageview;
MixpanelLib.prototype['register']                           = MixpanelLib.prototype.register;
MixpanelLib.prototype['register_once']                      = MixpanelLib.prototype.register_once;
MixpanelLib.prototype['unregister']                         = MixpanelLib.prototype.unregister;
MixpanelLib.prototype['identify']                           = MixpanelLib.prototype.identify;
MixpanelLib.prototype['alias']                              = MixpanelLib.prototype.alias;
MixpanelLib.prototype['name_tag']                           = MixpanelLib.prototype.name_tag;
MixpanelLib.prototype['set_config']                         = MixpanelLib.prototype.set_config;
MixpanelLib.prototype['get_config']                         = MixpanelLib.prototype.get_config;
MixpanelLib.prototype['get_property']                       = MixpanelLib.prototype.get_property;
MixpanelLib.prototype['get_distinct_id']                    = MixpanelLib.prototype.get_distinct_id;
MixpanelLib.prototype['toString']                           = MixpanelLib.prototype.toString;
MixpanelLib.prototype['opt_out_tracking']                   = MixpanelLib.prototype.opt_out_tracking;
MixpanelLib.prototype['opt_in_tracking']                    = MixpanelLib.prototype.opt_in_tracking;
MixpanelLib.prototype['has_opted_out_tracking']             = MixpanelLib.prototype.has_opted_out_tracking;
MixpanelLib.prototype['has_opted_in_tracking']              = MixpanelLib.prototype.has_opted_in_tracking;
MixpanelLib.prototype['clear_opt_in_out_tracking']          = MixpanelLib.prototype.clear_opt_in_out_tracking;
MixpanelLib.prototype['get_group']                          = MixpanelLib.prototype.get_group;
MixpanelLib.prototype['set_group']                          = MixpanelLib.prototype.set_group;
MixpanelLib.prototype['add_group']                          = MixpanelLib.prototype.add_group;
MixpanelLib.prototype['remove_group']                       = MixpanelLib.prototype.remove_group;
MixpanelLib.prototype['track_with_groups']                  = MixpanelLib.prototype.track_with_groups;
MixpanelLib.prototype['start_batch_senders']                = MixpanelLib.prototype.start_batch_senders;
MixpanelLib.prototype['stop_batch_senders']                 = MixpanelLib.prototype.stop_batch_senders;

// MixpanelPersistence Exports
MixpanelPersistence.prototype['properties']            = MixpanelPersistence.prototype.properties;
MixpanelPersistence.prototype['update_search_keyword'] = MixpanelPersistence.prototype.update_search_keyword;
MixpanelPersistence.prototype['update_referrer_info']  = MixpanelPersistence.prototype.update_referrer_info;
MixpanelPersistence.prototype['get_cross_subdomain']   = MixpanelPersistence.prototype.get_cross_subdomain;
MixpanelPersistence.prototype['clear']                 = MixpanelPersistence.prototype.clear;


var instances = {};
var extend_mp = function() {
    // add all the sub mixpanel instances
    _.each(instances, function(instance, name) {
        if (name !== PRIMARY_INSTANCE_NAME) { mixpanel_master[name] = instance; }
    });

    // add private functions as _
    mixpanel_master['_'] = _;
};

var override_mp_init_func = function() {
    // we override the snippets init function to handle the case where a
    // user initializes the mixpanel library after the script loads & runs
    mixpanel_master['init'] = function(token, config, name) {
        if (name) {
            // initialize a sub library
            if (!mixpanel_master[name]) {
                mixpanel_master[name] = instances[name] = create_mplib(token, config, name);
                mixpanel_master[name]._loaded();
            }
            return mixpanel_master[name];
        } else {
            var instance = mixpanel_master;

            if (instances[PRIMARY_INSTANCE_NAME]) {
                // main mixpanel lib already initialized
                instance = instances[PRIMARY_INSTANCE_NAME];
            } else if (token) {
                // intialize the main mixpanel lib
                instance = create_mplib(token, config, PRIMARY_INSTANCE_NAME);
                instance._loaded();
                instances[PRIMARY_INSTANCE_NAME] = instance;
            }

            mixpanel_master = instance;
            if (init_type === INIT_SNIPPET) {
                window$1[PRIMARY_INSTANCE_NAME] = mixpanel_master;
            }
            extend_mp();
        }
    };
};

var add_dom_loaded_handler = function() {
    // Cross browser DOM Loaded support
    function dom_loaded_handler() {
        // function flag since we only want to execute this once
        if (dom_loaded_handler.done) { return; }
        dom_loaded_handler.done = true;

        DOM_LOADED = true;
        ENQUEUE_REQUESTS = false;

        _.each(instances, function(inst) {
            inst._dom_loaded();
        });
    }

    function do_scroll_check() {
        try {
            document$1.documentElement.doScroll('left');
        } catch(e) {
            setTimeout(do_scroll_check, 1);
            return;
        }

        dom_loaded_handler();
    }

    if (document$1.addEventListener) {
        if (document$1.readyState === 'complete') {
            // safari 4 can fire the DOMContentLoaded event before loading all
            // external JS (including this file). you will see some copypasta
            // on the internet that checks for 'complete' and 'loaded', but
            // 'loaded' is an IE thing
            dom_loaded_handler();
        } else {
            document$1.addEventListener('DOMContentLoaded', dom_loaded_handler, false);
        }
    } else if (document$1.attachEvent) {
        // IE
        document$1.attachEvent('onreadystatechange', dom_loaded_handler);

        // check to make sure we arn't in a frame
        var toplevel = false;
        try {
            toplevel = window$1.frameElement === null;
        } catch(e) {
            // noop
        }

        if (document$1.documentElement.doScroll && toplevel) {
            do_scroll_check();
        }
    }

    // fallback handler, always will work
    _.register_event(window$1, 'load', dom_loaded_handler, true);
};

function init_as_module() {
    init_type = INIT_MODULE;
    mixpanel_master = new MixpanelLib();

    override_mp_init_func();
    mixpanel_master['init']();
    add_dom_loaded_handler();

    return mixpanel_master;
}

var mixpanel = init_as_module();

module.exports = mixpanel;