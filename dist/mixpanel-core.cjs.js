'use strict';

var Config = {
    DEBUG: false,
    LIB_VERSION: '2.86.0'
};

// Window global names for async modules
var TARGETING_GLOBAL_NAME = '__mp_targeting';
var RECORDER_GLOBAL_NAME = '__mp_recorder';

// Constants that are injected at build-time for the names of async modules.
var RECORDER_FILENAME = '__MP_RECORDER_FILENAME__';
var TARGETING_FILENAME = '__MP_TARGETING_FILENAME__';

// since es6 imports are static and we run unit tests from the console, window won't be defined when importing this file
var win;
if (typeof(window) === 'undefined') {
    var loc = {
        hostname: ''
    };
    win = {
        crypto: {randomUUID: function() {throw Error('unsupported');}},
        navigator: { userAgent: '', onLine: true },
        document: {
            createElement: function() { return {}; },
            location: loc,
            referrer: ''
        },
        screen: { width: 0, height: 0 },
        location: loc,
        addEventListener: function() {},
        removeEventListener: function() {},
        dispatchEvent: function() {},
        CustomEvent: function () {}
    };
} else {
    win = window;
}

var setImmediate = win['setImmediate'];
var builtInProp, cycle, schedulingQueue,
    ToString = Object.prototype.toString,
    timer = (typeof setImmediate !== 'undefined') ?
        function timer(fn) { return setImmediate(fn); } :
        setTimeout;

// dammit, IE8.
try {
    Object.defineProperty({},'x',{});
    builtInProp = function builtInProp(obj,name,val,config) {
        return Object.defineProperty(obj,name,{
            value: val,
            writable: true,
            configurable: config !== false
        });
    };
}
catch (err) {
    builtInProp = function builtInProp(obj,name,val) {
        obj[name] = val;
        return obj;
    };
}

// Note: using a queue instead of array for efficiency
schedulingQueue = (function Queue() {
    var first, last, item;

    function Item(fn,self) {
        this.fn = fn;
        this.self = self;
        this.next = void 0;
    }

    return {
        add: function add(fn,self) {
            item = new Item(fn,self);
            if (last) {
                last.next = item;
            }
            else {
                first = item;
            }
            last = item;
            item = void 0;
        },
        drain: function drain() {
            var f = first;
            first = last = cycle = void 0;

            while (f) {
                f.fn.call(f.self);
                f = f.next;
            }
        }
    };
})();

function schedule$1(fn,self) {
    schedulingQueue.add(fn,self);
    if (!cycle) {
        cycle = timer(schedulingQueue.drain);
    }
}

// promise duck typing
function isThenable(o) {
    var _then, oType = typeof o;

    if (o !== null && (oType === 'object' || oType === 'function')) {
        _then = o.then;
    }
    return typeof _then === 'function' ? _then : false;
}

function notify() {
    for (var i=0; i<this.chain.length; i++) {
        notifyIsolated(
            this,
            (this.state === 1) ? this.chain[i].success : this.chain[i].failure,
            this.chain[i]
        );
    }
    this.chain.length = 0;
}

// NOTE: This is a separate function to isolate
// the `try..catch` so that other code can be
// optimized better
function notifyIsolated(self,cb,chain) {
    var ret, _then;
    try {
        if (cb === false) {
            chain.reject(self.msg);
        }
        else {
            if (cb === true) {
                ret = self.msg;
            }
            else {
                ret = cb.call(void 0,self.msg);
            }

            if (ret === chain.promise) {
                chain.reject(TypeError('Promise-chain cycle'));
            }
            // eslint-disable-next-line no-cond-assign
            else if (_then = isThenable(ret)) {
                _then.call(ret,chain.resolve,chain.reject);
            }
            else {
                chain.resolve(ret);
            }
        }
    }
    catch (err) {
        chain.reject(err);
    }
}

function resolve(msg) {
    var _then, self = this;

    // already triggered?
    if (self.triggered) { return; }

    self.triggered = true;

    // unwrap
    if (self.def) {
        self = self.def;
    }

    try {
        // eslint-disable-next-line no-cond-assign
        if (_then = isThenable(msg)) {
            schedule$1(function(){
                var defWrapper = new MakeDefWrapper(self);
                try {
                    _then.call(msg,
                        function $resolve$(){ resolve.apply(defWrapper,arguments); },
                        function $reject$(){ reject.apply(defWrapper,arguments); }
                    );
                }
                catch (err) {
                    reject.call(defWrapper,err);
                }
            });
        }
        else {
            self.msg = msg;
            self.state = 1;
            if (self.chain.length > 0) {
                schedule$1(notify,self);
            }
        }
    }
    catch (err) {
        reject.call(new MakeDefWrapper(self),err);
    }
}

function reject(msg) {
    var self = this;

    // already triggered?
    if (self.triggered) { return; }

    self.triggered = true;

    // unwrap
    if (self.def) {
        self = self.def;
    }

    self.msg = msg;
    self.state = 2;
    if (self.chain.length > 0) {
        schedule$1(notify,self);
    }
}

function iteratePromises(Constructor,arr,resolver,rejecter) {
    for (var idx=0; idx<arr.length; idx++) {
        (function IIFE(idx){
            Constructor.resolve(arr[idx])
                .then(
                    function $resolver$(msg){
                        resolver(idx,msg);
                    },
                    rejecter
                );
        })(idx);
    }
}

function MakeDefWrapper(self) {
    this.def = self;
    this.triggered = false;
}

function MakeDef(self) {
    this.promise = self;
    this.state = 0;
    this.triggered = false;
    this.chain = [];
    this.msg = void 0;
}

function NpoPromise(executor) {
    if (typeof executor !== 'function') {
        throw TypeError('Not a function');
    }

    if (this['__NPO__'] !== 0) {
        throw TypeError('Not a promise');
    }

    // instance shadowing the inherited "brand"
    // to signal an already "initialized" promise
    this['__NPO__'] = 1;

    var def = new MakeDef(this);

    this['then'] = function then(success,failure) {
        var o = {
            success: typeof success === 'function' ? success : true,
            failure: typeof failure === 'function' ? failure : false
        };
            // Note: `then(..)` itself can be borrowed to be used against
            // a different promise constructor for making the chained promise,
            // by substituting a different `this` binding.
        o.promise = new this.constructor(function extractChain(resolve,reject) {
            if (typeof resolve !== 'function' || typeof reject !== 'function') {
                throw TypeError('Not a function');
            }

            o.resolve = resolve;
            o.reject = reject;
        });
        def.chain.push(o);

        if (def.state !== 0) {
            schedule$1(notify,def);
        }

        return o.promise;
    };
    this['catch'] = function $catch$(failure) {
        return this.then(void 0,failure);
    };

    try {
        executor.call(
            void 0,
            function publicResolve(msg){
                resolve.call(def,msg);
            },
            function publicReject(msg) {
                reject.call(def,msg);
            }
        );
    }
    catch (err) {
        reject.call(def,err);
    }
}

var PromisePrototype = builtInProp({},'constructor',NpoPromise,
    /*configurable=*/false
);

    // Note: Android 4 cannot use `Object.defineProperty(..)` here
NpoPromise.prototype = PromisePrototype;

// built-in "brand" to signal an "uninitialized" promise
builtInProp(PromisePrototype,'__NPO__',0,
    /*configurable=*/false
);

builtInProp(NpoPromise,'resolve',function Promise$resolve(msg) {
    var Constructor = this;

    // spec mandated checks
    // note: best "isPromise" check that's practical for now
    if (msg && typeof msg === 'object' && msg['__NPO__'] === 1) {
        return msg;
    }

    return new Constructor(function executor(resolve,reject){
        if (typeof resolve !== 'function' || typeof reject !== 'function') {
            throw TypeError('Not a function');
        }

        resolve(msg);
    });
});

builtInProp(NpoPromise,'reject',function Promise$reject(msg) {
    return new this(function executor(resolve,reject){
        if (typeof resolve !== 'function' || typeof reject !== 'function') {
            throw TypeError('Not a function');
        }

        reject(msg);
    });
});

builtInProp(NpoPromise,'all',function Promise$all(arr) {
    var Constructor = this;

    // spec mandated checks
    if (ToString.call(arr) !== '[object Array]') {
        return Constructor.reject(TypeError('Not an array'));
    }
    if (arr.length === 0) {
        return Constructor.resolve([]);
    }

    return new Constructor(function executor(resolve,reject){
        if (typeof resolve !== 'function' || typeof reject !== 'function') {
            throw TypeError('Not a function');
        }

        var len = arr.length, msgs = Array(len), count = 0;

        iteratePromises(Constructor,arr,function resolver(idx,msg) {
            msgs[idx] = msg;
            if (++count === len) {
                resolve(msgs);
            }
        },reject);
    });
});

builtInProp(NpoPromise,'race',function Promise$race(arr) {
    var Constructor = this;

    // spec mandated checks
    if (ToString.call(arr) !== '[object Array]') {
        return Constructor.reject(TypeError('Not an array'));
    }

    return new Constructor(function executor(resolve,reject){
        if (typeof resolve !== 'function' || typeof reject !== 'function') {
            throw TypeError('Not a function');
        }

        iteratePromises(Constructor,arr,function resolver(idx,msg){
            resolve(msg);
        },reject);
    });
});

var PromisePolyfill;
if (typeof Promise !== 'undefined' && Promise.toString().indexOf('[native code]') !== -1) {
    PromisePolyfill = Promise;
} else {
    PromisePolyfill = NpoPromise;
}

/* eslint camelcase: "off", eqeqeq: "off" */

// Maximum allowed session recording length
var MAX_RECORDING_MS = 24 * 60 * 60 * 1000; // 24 hours

var EV_HASHCHANGE = 'hashchange';
var EV_MP_LOCATION_CHANGE = 'mp_locationchange';
var EV_POPSTATE = 'popstate';

/*
 * Saved references to long variable names, so that closure compiler can
 * minimize file size.
 */

var ArrayProto = Array.prototype,
    FuncProto = Function.prototype,
    ObjProto = Object.prototype,
    slice = ArrayProto.slice,
    toString = ObjProto.toString,
    hasOwnProperty = ObjProto.hasOwnProperty,
    windowConsole = win.console,
    navigator = win.navigator,
    document$1 = win.document,
    windowOpera = win.opera,
    screen = win.screen,
    userAgent = navigator.userAgent;

var nativeBind = FuncProto.bind,
    nativeForEach = ArrayProto.forEach,
    nativeIndexOf = ArrayProto.indexOf,
    nativeMap = ArrayProto.map,
    nativeIsArray = Array.isArray,
    breaker = {};

var _ = {};

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
        warn: log_func_with_prefix(console.warn, prefix),
        error: log_func_with_prefix(console.error, prefix),
        critical: log_func_with_prefix(console.critical, prefix)
    };
};


var safewrap = function(f) {
    return function() {
        try {
            return f.apply(this, arguments);
        } catch (e) {
            console.critical('Implementation error. Please turn on debug and contact support@mixpanel.com.');
            if (Config.DEBUG){
                console.critical(e);
            }
        }
    };
};

var safewrapClass = function(klass) {
    var proto = klass.prototype;
    for (var func in proto) {
        if (typeof(proto[func]) === 'function') {
            proto[func] = safewrap(proto[func]);
        }
    }
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

_.isFunction = function(f) {
    return typeof f === 'function';
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
    // build a copy so the caller's object (and any nested objects) are not mutated
    var encoded = _.isArray(obj) ? [] : {};
    _.each(obj, function(v, k) {
        if (_.isDate(v)) {
            encoded[k] = _.formatDate(v);
        } else if (_.isObject(v)) {
            encoded[k] = _.encodeDates(v); // recurse
        } else {
            encoded[k] = v;
        }
    });
    return encoded;
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

_.UUID = function() {
    try {
        // use native Crypto API when available
        return win['crypto']['randomUUID']();
    } catch (err) {
        // fall back to generating our own UUID
        // based on https://gist.github.com/scwood/3bff42cc005cc20ab7ec98f0d8e1d59d
        var uuid = new Array(36);
        for (var i = 0; i < 36; i++) {
            uuid[i] = Math.floor(Math.random() * 16);
        }
        uuid[14] = 4; // set bits 12-15 of time-high-and-version to 0100
        uuid[19] = uuid[19] &= -5; // set bit 6 of clock-seq-and-reserved to zero
        uuid[19] = uuid[19] |= (1 << 3); // set bit 7 of clock-seq-and-reserved to one
        uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';

        return _.map(uuid, function(x) {
            return x.toString(16);
        }).join('');
    }
};

// _.isBlockedUA()
// This is to block various web spiders from executing our JS and
// sending false tracking data
var BLOCKED_UA_STRS = [
    'ahrefsbot',
    'ahrefssiteaudit',
    'amazonbot',
    'baiduspider',
    'bingbot',
    'bingpreview',
    'chrome-lighthouse',
    'facebookexternal',
    'petalbot',
    'pinterest',
    'screaming frog',
    'yahoo! slurp',
    'yandex',

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

var PREVIEW_TOKEN_PARAM = 'mp_preview_token';

_.getPreviewToken = function() {
    try {
        return new URLSearchParams((win.location && win.location.search) || '').get(PREVIEW_TOKEN_PARAM) || '';
    } catch (err) {
        return '';
    }
};

// Keep parameter names for diagnostics, but redact credentials from telemetry.
var SENSITIVE_URL_PARAMS = [PREVIEW_TOKEN_PARAM];
_.sanitizeUrl = function(url) {
    try {
        if (!url || typeof url !== 'string') {
            return url;
        }
        // Process query strings in both the URL and hash routes, preserving the rest.
        return url.replace(/\?[^#]*/g, function(query) {
            return '?' + query.slice(1).split('&').map(function(pair) {
                var separatorIndex = pair.indexOf('=');
                var encodedKey = separatorIndex === -1 ? pair : pair.slice(0, separatorIndex);
                var key = new URLSearchParams(encodedKey + '=').keys().next().value;
                return SENSITIVE_URL_PARAMS.indexOf(key) !== -1 ? encodedKey + '=REDACTED' : pair;
            }).join('&');
        });
    } catch (err) {
        // Best effort: sanitization must not prevent telemetry from being sent.
        return url;
    }
};

_.getQueryParam = function(url, param) {
    // Expects a raw URL

    // Escape the RegExp metacharacters the param name may contain before
    // interpolating it into `regexS`. Backslash is escaped in the same pass as
    // the brackets (a single character class), so a param name is never able to
    // introduce an unintended escape sequence (CodeQL js/incomplete-sanitization).
    param = param.replace(/[[\]\\]/g, '\\$&');
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

var _testStorageSupported = function (storage) {
    var supported = true;
    try {
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
    return supported;
};

var _localStorageSupported = null;
var localStorageSupported = function(storage, forceCheck) {
    if (_localStorageSupported !== null && !forceCheck) {
        return _localStorageSupported;
    }

    return _localStorageSupported = _testStorageSupported(storage);
};

var _sessionStorageSupported = null;
var sessionStorageSupported = function(storage, forceCheck) {
    if (_sessionStorageSupported !== null && !forceCheck) {
        return _sessionStorageSupported;
    }

    return _sessionStorageSupported = _testStorageSupported(storage);
};

function _storageWrapper(storage, name, is_supported_fn) {
    var log_error = function(msg) {
        console.error(name + ' error: ' + msg);
    };

    return {
        is_supported: function(forceCheck) {
            var supported = is_supported_fn(storage, forceCheck);
            if (!supported) {
                console.error(name + ' unsupported');
            }
            return supported;
        },
        error: log_error,
        get: function(key) {
            try {
                return storage.getItem(key);
            } catch (err) {
                log_error(err);
            }
            return null;
        },
        parse: function(key) {
            try {
                return _.JSONDecode(storage.getItem(key)) || {};
            } catch (err) {
                // noop
            }
            return null;
        },
        set: function(key, value) {
            try {
                storage.setItem(key, value);
            } catch (err) {
                log_error(err);
            }
        },
        remove: function(key) {
            try {
                storage.removeItem(key);
            } catch (err) {
                log_error(err);
            }
        }
    };
}

// Safari and other browsers may error out accessing localStorage/sessionStorage
// when cookies are disabled, so wrap access in a try-catch.
var getLocalStorage = function() {
    try {
        return win.localStorage; // eslint-disable-line no-restricted-properties
    } catch (_err) {
        return null;
    }
};

var getSessionStorage = function() {
    try {
        return win.sessionStorage; // eslint-disable-line no-restricted-properties
    } catch (_err) {
        return null;
    }
};

_.localStorage = _storageWrapper(getLocalStorage(), 'localStorage', localStorageSupported);
_.sessionStorage = _storageWrapper(getSessionStorage(), 'sessionStorage', sessionStorageSupported);

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
            event = event || fixEvent(win.event);

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

var CAMPAIGN_KEYWORDS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'utm_id', 'utm_source_platform','utm_campaign_id', 'utm_creative_format', 'utm_marketing_tactic'];
var CLICK_IDS = ['dclid', 'fbclid', 'gclid', 'ko_click_id', 'li_fat_id', 'msclkid', 'sccid', 'ttclid', 'twclid', 'wbraid'];

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
        } else if (_.includes(user_agent, 'Whale/')) {
            // https://user-agents.net/browsers/whale-browser
            return 'Whale Browser';
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
            'Android Mobile': /Android\s(\d+(\.\d+)?)/,
            'Samsung Internet': /SamsungBrowser\/(\d+(\.\d+)?)/,
            'Internet Explorer': /(rv:|MSIE )(\d+(\.\d+)?)/,
            'Mozilla': /rv:(\d+(\.\d+)?)/,
            'Whale Browser': /Whale\/(\d+(\.\d+)?)/
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

    currentUrl: function() {
        return _.sanitizeUrl(win.location.href);
    },

    properties: function(extra_props) {
        if (typeof extra_props !== 'object') {
            extra_props = {};
        }
        return _.extend(_.strip_empty_properties({
            '$os': _.info.os(),
            '$browser': _.info.browser(userAgent, navigator.vendor, windowOpera),
            '$referrer': _.sanitizeUrl(document$1.referrer),
            '$referring_domain': _.info.referringDomain(document$1.referrer),
            '$device': _.info.device(userAgent)
        }), {
            '$current_url': _.info.currentUrl(),
            '$browser_version': _.info.browserVersion(userAgent, navigator.vendor, windowOpera),
            '$screen_height': screen.height,
            '$screen_width': screen.width,
            'mp_lib': 'web',
            '$lib_version': Config.LIB_VERSION,
            '$insert_id': cheap_guid(),
            'time': _.timestamp() / 1000 // epoch time in seconds
        }, _.strip_empty_properties(extra_props));
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
            'current_domain': win.location.hostname,
            'current_url_path': win.location.pathname,
            'current_url_protocol': win.location.protocol,
            'current_url_search': _.sanitizeUrl(win.location.search)
        });
    }
};

/**
 * Returns a throttled function that will only run at most every `waitMs` and returns a promise that resolves with the next invocation.
 * Throttled calls will build up a batch of args and invoke the callback with all args since the last invocation.
 */
var batchedThrottle = function (fn, waitMs) {
    var timeoutPromise = null;
    var throttledItems = [];
    return function (item) {
        var self = this;
        throttledItems.push(item);

        if (!timeoutPromise) {
            timeoutPromise = new PromisePolyfill(function (resolve) {
                setTimeout(function () {
                    var returnValue = fn.apply(self, [throttledItems]);
                    timeoutPromise = null;
                    throttledItems = [];
                    resolve(returnValue);
                }, waitMs);
            });
        }
        return timeoutPromise;
    };
};

var cheap_guid = function(maxlen) {
    var guid = Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
    return maxlen ? guid.substring(0, maxlen) : guid;
};

/**
 * Generates a W3C traceparent header for easy interop with distributed tracing systems i.e Open Telemetry
 * https://www.w3.org/TR/trace-context/#traceparent-header
*/
var generateTraceparent = function() {
    var traceID = _.UUID().replace(/-/g, '');
    var parentID = _.UUID().replace(/-/g, '').substring(0, 16);

    // Sampled trace
    var traceFlags = '01';

    return '00-' + traceID + '-' + parentID + '-' + traceFlags;
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

/**
 * Check whether we have network connection. default to true for browsers that don't support navigator.onLine (IE)
 * @returns {boolean}
 */
var isOnline = function() {
    var onLine = win.navigator['onLine'];
    return _.isUndefined(onLine) || onLine;
};

var NOOP_FUNC = function () {};

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

var JSONStringify = null, JSONParse = null;
if (typeof JSON !== 'undefined') {
    JSONStringify = JSON.stringify;
    JSONParse = JSON.parse;
}
JSONStringify = JSONStringify || _.JSONEncode;
JSONParse = JSONParse || _.JSONDecode;

// UNMINIFIED EXPORTS (for closure compiler)
_['info']                   = _.info;
_['info']['browser']        = _.info.browser;
_['info']['browserVersion'] = _.info.browserVersion;
_['info']['device']         = _.info.device;
_['info']['properties']     = _.info.properties;
_['isBlockedUA']            = _.isBlockedUA;
_['isEmptyObject']          = _.isEmptyObject;
_['isObject']               = _.isObject;
_['JSONDecode']             = _.JSONDecode;
_['JSONEncode']             = _.JSONEncode;
_['toArray']                = _.toArray;
_['NPO']                    = NpoPromise;

// stateless utils
// mostly from https://github.com/mixpanel/mixpanel-js/blob/989ada50f518edab47b9c4fd9535f9fbd5ec5fc0/src/autotrack-utils.js


var EV_CHANGE = 'change';
var EV_CLICK = 'click';
var EV_INPUT = 'input';
var EV_LOAD = 'load';
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

var logger$9 = console_with_prefix('autocapture');


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
            var docElement = document$1['documentElement'];
            props = {
                '$event_type': ev.type,
                '$host': win.location.host,
                '$pathname': win.location.pathname,
                '$elements':  elementsJson,
                '$el_attr__href': href,
                '$viewportHeight': Math.max(docElement['clientHeight'], win['innerHeight'] || 0),
                '$viewportWidth': Math.max(docElement['clientWidth'], win['innerWidth'] || 0),
                '$pageHeight': document$1['body']['offsetHeight'] || 0,
                '$pageWidth': document$1['body']['offsetWidth'] || 0,
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
                elText += child.textContent.trim()
                    // scrub potentially sensitive values
                    .split(/(\s+)/).filter(shouldTrackValue).join('')
                    // normalize whitespace
                    .replace(/[\r\n]/g, ' ').replace(/[ ]+/g, ' ')
                    // truncate
                    .substring(0, 255);
            }
        });
    }

    return elText.trim();
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
            logger$9.critical('Error while checking element in allowElementCallback', err);
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
            logger$9.critical('Error while checking selector: ' + sel, err);
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
            logger$9.critical('Error while checking element in blockElementCallback', err);
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
                logger$9.critical('Error while checking selector: ' + sel, err);
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
        var testEl = document$1.createElement('div');
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
        value = value.trim();

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
    var supportsScrollEnd = 'onscrollend' in win;
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

        if (parent.getRootNode && parent.getRootNode() !== document$1) {
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

/* eslint camelcase: "off" */


// Shared SPA location-change detector. Normalizes the four ways a single-page app
// can change the URL without a full reload — history.pushState, history.replaceState,
// popstate (back/forward), hashchange — into a single synthetic window event,
// EV_MP_LOCATION_CHANGE. Both autocapture (pageview / page-leave tracking) and
// visual experiments consume this event; keeping the detection here means the
// History API is patched exactly once regardless of how many features need it.

var inBrowser = function() {
    return typeof win !== 'undefined' && !!win['document'];
};

// Guard so the History API is patched and the popstate/hashchange listeners are
// added at most once per page, even if multiple features (and multiple Mixpanel
// instances) call ensureLocationChangeListeners.
var installed = false;

var dispatchLocationChange = function() {
    win.dispatchEvent(new Event(EV_MP_LOCATION_CHANGE));
};

/**
 * Idempotently install the SPA location-change detector. Patches
 * history.pushState / history.replaceState and listens for popstate / hashchange,
 * each dispatching a single EV_MP_LOCATION_CHANGE window event. Safe to call
 * repeatedly and safe outside a browser (no-op).
 */
function ensureLocationChangeListeners() {
    if (installed || !inBrowser()) {
        return;
    }
    installed = true;

    win.addEventListener(EV_POPSTATE, dispatchLocationChange);
    win.addEventListener(EV_HASHCHANGE, dispatchLocationChange);

    var history = win['history'];
    if (history) {
        var nativePushState = history.pushState;
        if (typeof nativePushState === 'function') {
            history.pushState = function(state, unused, url) {
                nativePushState.call(history, state, unused, url);
                dispatchLocationChange();
            };
        }
        var nativeReplaceState = history.replaceState;
        if (typeof nativeReplaceState === 'function') {
            history.replaceState = function(state, unused, url) {
                nativeReplaceState.call(history, state, unused, url);
                dispatchLocationChange();
            };
        }
    }
}

/**
 * Subscribe to SPA location changes. Ensures the detector is installed, then adds
 * the handler for EV_MP_LOCATION_CHANGE. Returns a teardown that removes it.
 * @param {Function} handler
 * @returns {Function} unsubscribe
 */
function onLocationChange(handler) {
    if (!inBrowser() || typeof handler !== 'function') {
        return function() {};
    }
    ensureLocationChangeListeners();
    win.addEventListener(EV_MP_LOCATION_CHANGE, handler);
    return function() {
        win.removeEventListener(EV_MP_LOCATION_CHANGE, handler);
    };
}

/** @const */ var DEFAULT_RAGE_CLICK_THRESHOLD_PX = 30;
/** @const */ var DEFAULT_RAGE_CLICK_TIMEOUT_MS = 1000;
/** @const */ var DEFAULT_RAGE_CLICK_CLICK_COUNT = 4;
/** @const */ var DEFAULT_RAGE_CLICK_INTERACTIVE_ELEMENTS_ONLY = false;

function RageClickTracker() {
    this.clicks = [];
}

/**
 * Determines if a click event is part of a rage click sequence.
 * @param {Event} event - the original click event.
 * @param {import('../index.d.ts').RageClickConfig} options - configuration options for rage click detection.
 * @returns {boolean} - true if the click is considered a rage click, false otherwise.
 */
RageClickTracker.prototype.isRageClick = function(event, options) {
    options = options || {};
    var thresholdPx = options['threshold_px'] || DEFAULT_RAGE_CLICK_THRESHOLD_PX;
    var timeoutMs = options['timeout_ms'] || DEFAULT_RAGE_CLICK_TIMEOUT_MS;
    var clickCount = options['click_count'] || DEFAULT_RAGE_CLICK_CLICK_COUNT;
    var interactiveElementsOnly = options['interactive_elements_only'] || DEFAULT_RAGE_CLICK_INTERACTIVE_ELEMENTS_ONLY;

    if (interactiveElementsOnly) {
        var target = getClickEventTargetElement(event);
        if (!target || isDefinitelyNonInteractive(target)) {
            return false;
        }
    }

    var timestamp = Date.now();
    var x = event['pageX'], y = event['pageY'];

    var lastClick = this.clicks[this.clicks.length - 1];
    if (
        lastClick &&
        timestamp - lastClick.timestamp < timeoutMs &&
        Math.sqrt(Math.pow(x - lastClick.x, 2) + Math.pow(y - lastClick.y, 2)) < thresholdPx
    ) {
        this.clicks.push({ x: x, y: y, timestamp: timestamp });
        if (this.clicks.length >= clickCount) {
            this.clicks = [];
            return true;
        }
    } else {
        this.clicks = [{ x: x, y: y, timestamp: timestamp }];
    }
    return false;
};

function ShadowDOMObserver(changeCallback, observerConfig) {
    this.changeCallback = changeCallback || function() {};
    this.observerConfig = observerConfig;

    this.observedShadowRoots = null;
    this.shadowObservers = [];
}

ShadowDOMObserver.prototype.getEventTarget = function(event) {
    if (!this.observedShadowRoots) {
        return;
    }

    return getClickEventTargetElement(event);
};

ShadowDOMObserver.prototype.observeFromEvent = function(event) {
    if (!this.observedShadowRoots) {
        return;
    }

    var path = getClickEventComposedPath(event);

    // Check each element in path for shadow roots
    for (var i = 0; i < path.length; i++) {
        var element = path[i];

        if (element && element.shadowRoot) {
            this.observeShadowRoot(element.shadowRoot);
        }
    }
};


ShadowDOMObserver.prototype.observeShadowRoot = function(shadowRoot) {
    if (!this.observedShadowRoots || this.observedShadowRoots.has(shadowRoot)) {
        return;
    }

    var self = this;

    try {
        this.observedShadowRoots.add(shadowRoot);

        var observer = new window.MutationObserver(function() {
            self.changeCallback();
        });

        observer.observe(shadowRoot, this.observerConfig);
        this.shadowObservers.push(observer);
    } catch (e) {
        logger$9.critical('Error while observing shadow root', e);
    }
};


ShadowDOMObserver.prototype.start = function() {
    if (this.observedShadowRoots) {
        return;
    }

    if (!weakSetSupported()) {
        logger$9.critical('Shadow DOM observation unavailable: WeakSet not supported');
        return;
    }

    this.observedShadowRoots = new WeakSet();
};

ShadowDOMObserver.prototype.stop = function() {
    if (!this.observedShadowRoots) {
        return;
    }

    for (var i = 0; i < this.shadowObservers.length; i++) {
        try {
            this.shadowObservers[i].disconnect();
        } catch (e) {
            logger$9.critical('Error while disconnecting shadow DOM observer', e);
        }
    }
    this.shadowObservers = [];
    this.observedShadowRoots = null;
};

/** @const */ var DEFAULT_DEAD_CLICK_TIMEOUT_MS = 500;
/** @const */ var INTERACTION_EVENTS = [EV_CHANGE, EV_INPUT, EV_SUBMIT, EV_SELECT, EV_TOGGLE];
/** @const */ var LAYOUT_EVENTS = [EV_SCROLLEND];
/** @const */ var NAVIGATION_EVENTS = [EV_HASHCHANGE];
/** @const */ var MUTATION_OBSERVER_CONFIG = {
    characterData: true,
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['style', 'class', 'hidden', 'checked', 'selected', 'value', 'display', 'visibility']
};


function DeadClickTracker(onDeadClickCallback) {
    this.eventListeners = [];
    this.mutationObserver = null;
    this.shadowDOMObserver = null;

    this.isTracking = false;
    this.lastChangeEventTimestamp = 0;
    this.pendingClicks = [];
    this.onDeadClickCallback = onDeadClickCallback;
    this.processingActive = false;
    this.processingTimeout = null;
}


DeadClickTracker.prototype.addClick = function(event) {
    var element = this.shadowDOMObserver && this.shadowDOMObserver.getEventTarget(event);

    if (!element) {
        element = event['target'] || event['srcElement'];
    }

    if (!element || isDefinitelyNonInteractive(element)) {
        return false;
    }

    if (this.shadowDOMObserver) {
        this.shadowDOMObserver.observeFromEvent(event);
    }
    this.pendingClicks.push({
        element: element,
        event: event,
        timestamp: Date.now()
    });
    return true;
};

DeadClickTracker.prototype.trackClick = function(event, config) {
    if (!this.isTracking) {
        return false;
    }

    var added = this.addClick(event);
    if (added) {
        this.triggerProcessing(config);
    }
    return added;
};

DeadClickTracker.prototype.getDeadClicks = function(config) {
    if (this.pendingClicks.length === 0) {
        return [];
    }

    var timeoutMs = config['timeout_ms'];
    var now = Date.now();
    var clicksToEvaluate = this.pendingClicks.slice(); // Copy array
    this.pendingClicks = []; // Clear original

    var deadClicks = [];

    for (var i = 0; i < clicksToEvaluate.length; i++) {
        var click = clicksToEvaluate[i];

        if (now - click.timestamp >= timeoutMs) {
            // Click has exceeded timeout, check if it's dead by looking for changes after this specific click
            if (!this.hasChangesAfter(click.timestamp)) {
                deadClicks.push(click);
            }
        } else {
            // Still pending - add back
            this.pendingClicks.push(click);
        }
    }

    return deadClicks;
};

DeadClickTracker.prototype.hasChangesAfter = function(timestamp) {
    // 100ms tolerance for race condition between when we record the click and the change event
    return this.lastChangeEventTimestamp >= (timestamp - 100);
};

DeadClickTracker.prototype.recordChangeEvent = function() {
    this.lastChangeEventTimestamp = Date.now();
};

DeadClickTracker.prototype.triggerProcessing = function(config) {
    // Prevent multiple concurrent processing chains
    if (this.processingActive) {
        return;
    }
    this.processingActive = true;
    this.processRecursively(config);
};

DeadClickTracker.prototype.processRecursively = function(config) {
    if (!this.isTracking || !this.onDeadClickCallback) {
        this.processingActive = false;
        return;
    }

    var timeoutMs = config['timeout_ms'];
    var self = this;

    this.processingTimeout = setTimeout(function() {
        if (!self.processingActive) {
            return;
        }

        var deadClicks = self.getDeadClicks(config);

        for (var i = 0; i < deadClicks.length; i++) {
            self.onDeadClickCallback(deadClicks[i].event);
        }

        if (self.pendingClicks.length > 0) {
            self.processRecursively(config);
        } else {
            self.processingActive = false;
        }
    }, timeoutMs);
};

DeadClickTracker.prototype.startTracking = function() {
    if (this.isTracking) {
        return;
    }

    this.isTracking = true;

    var self = this;

    INTERACTION_EVENTS.forEach(function(event) {
        var handler = function() {
            self.recordChangeEvent();
        };
        document.addEventListener(event, handler, { capture: true, passive: true });
        self.eventListeners.push({ target: document, event: event, handler: handler, options: { capture: true, passive: true } });
    });
    NAVIGATION_EVENTS.forEach(function(event) {
        var handler = function() {
            self.recordChangeEvent();
        };
        window.addEventListener(event, handler);
        self.eventListeners.push({ target: window, event: event, handler: handler });
    });
    LAYOUT_EVENTS.forEach(function(event) {
        var handler = function() {
            self.recordChangeEvent();
        };
        window.addEventListener(event, handler, { passive: true });
        self.eventListeners.push({ target: window, event: event, handler: handler, options: { passive: true } });
    });
    var selectionHandler = function() {
        self.recordChangeEvent();
    };
    document.addEventListener('selectionchange', selectionHandler);
    self.eventListeners.push({ target: document, event: 'selectionchange', handler: selectionHandler });

    // Set up MutationObserver
    if (window.MutationObserver) {
        try {
            this.mutationObserver = new window.MutationObserver(function() {
                self.recordChangeEvent();
            });

            this.mutationObserver.observe(document.body || document.documentElement, MUTATION_OBSERVER_CONFIG);
        } catch (e) {
            logger$9.critical('Error while setting up mutation observer', e);
        }
    }

    // Set up Shadow DOM observer
    if (window.customElements) {
        try {
            this.shadowDOMObserver = new ShadowDOMObserver(
                function() {
                    self.recordChangeEvent();
                },
                MUTATION_OBSERVER_CONFIG
            );
            this.shadowDOMObserver.start();
        } catch (e) {
            logger$9.critical('Error while setting up shadow DOM observer', e);
            this.shadowDOMObserver = null;
        }
    }
};

DeadClickTracker.prototype.stopTracking = function() {
    if (!this.isTracking) {
        return;
    }

    this.isTracking = false;
    this.pendingClicks = [];
    this.lastChangeEventTimestamp = 0;
    this.processingActive = false;

    if (this.processingTimeout) {
        clearTimeout(this.processingTimeout);
        this.processingTimeout = null;
    }

    // Remove all event listeners
    for (var i = 0; i < this.eventListeners.length; i++) {
        var listener = this.eventListeners[i];
        try {
            listener.target.removeEventListener(listener.event, listener.handler, listener.options);
        } catch (e) {
            logger$9.critical('Error while removing event listener', e);
        }
    }
    this.eventListeners = [];

    if (this.mutationObserver) {
        try {
            this.mutationObserver.disconnect();
        } catch (e) {
            logger$9.critical('Error while disconnecting mutation observer', e);
        }
        this.mutationObserver = null;
    }

    if (this.shadowDOMObserver) {
        try {
            this.shadowDOMObserver.stop();
        } catch (e) {
            logger$9.critical('Error while stopping shadow DOM observer', e);
        }
        this.shadowDOMObserver = null;
    }
};

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

var CONFIG_DEFAULTS$1 = {};
CONFIG_DEFAULTS$1[CONFIG_ALLOW_SELECTORS] = [];
CONFIG_DEFAULTS$1[CONFIG_ALLOW_URL_REGEXES] = [];
CONFIG_DEFAULTS$1[CONFIG_BLOCK_ATTRS] = [];
CONFIG_DEFAULTS$1[CONFIG_BLOCK_ELEMENT_CALLBACK] = null;
CONFIG_DEFAULTS$1[CONFIG_BLOCK_SELECTORS] = [];
CONFIG_DEFAULTS$1[CONFIG_BLOCK_URL_REGEXES] = [];
CONFIG_DEFAULTS$1[CONFIG_CAPTURE_EXTRA_ATTRS] = [];
CONFIG_DEFAULTS$1[CONFIG_CAPTURE_TEXT_CONTENT] = false;
CONFIG_DEFAULTS$1[CONFIG_SCROLL_CAPTURE_ALL] = false;
CONFIG_DEFAULTS$1[CONFIG_SCROLL_CHECKPOINTS] = [25, 50, 75, 100];
CONFIG_DEFAULTS$1[CONFIG_TRACK_CLICK] = true;
CONFIG_DEFAULTS$1[CONFIG_TRACK_DEAD_CLICK] = true;
CONFIG_DEFAULTS$1[CONFIG_TRACK_INPUT] = true;
CONFIG_DEFAULTS$1[CONFIG_TRACK_PAGEVIEW] = PAGEVIEW_OPTION_FULL_URL;
CONFIG_DEFAULTS$1[CONFIG_TRACK_RAGE_CLICK] = true;
CONFIG_DEFAULTS$1[CONFIG_TRACK_SCROLL] = true;
CONFIG_DEFAULTS$1[CONFIG_TRACK_PAGE_LEAVE] = false;
CONFIG_DEFAULTS$1[CONFIG_TRACK_SUBMIT] = true;

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
        logger$9.critical('Autocapture unavailable: missing required DOM APIs');
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
        return _.extend({}, CONFIG_DEFAULTS$1, autocaptureConfig);
    } else {
        // Autocapture config is non-object truthy value, return default
        return CONFIG_DEFAULTS$1;
    }
};

Autocapture.prototype.getConfig = function(key) {
    return this.getFullConfig()[key];
};

Autocapture.prototype.currentUrlBlocked = function() {
    var currentUrl = _.info.currentUrl();

    var allowUrlRegexes = this.getConfig(CONFIG_ALLOW_URL_REGEXES) || [];
    if (allowUrlRegexes.length) {
        // we're using an allowlist, only track if current URL matches
        try {
            return !urlMatchesRegexList(currentUrl, allowUrlRegexes);
        } catch (err) {
            logger$9.critical('Error while checking block URL regexes: ', err);
            return true;
        }
    }

    var blockUrlRegexes = this.getConfig(CONFIG_BLOCK_URL_REGEXES) || [];
    if (!blockUrlRegexes || !blockUrlRegexes.length) {
        return false;
    }

    try {
        return urlMatchesRegexList(currentUrl, blockUrlRegexes);
    } catch (err) {
        logger$9.critical('Error while checking block URL regexes: ', err);
        return true;
    }
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
    if (!this.pageviewTrackingConfig() && !this.getConfig(CONFIG_TRACK_PAGE_LEAVE) && !this.mp.get_config('record_heatmap_data')) {
        // These are all the configs that use the location-change signal.
        return;
    }

    ensureLocationChangeListeners();
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
    var viewportHeight = Math.max(document$1.documentElement.clientHeight, win.innerHeight || 0);
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
        '$viewportWidth':  Math.max(document$1.documentElement.clientWidth, win.innerWidth || 0),
        '$captured_for_heatmap': this.mp.is_recording_heatmap_data()
    }, DEFAULT_PROPS);

    // Send with beacon transport to ensure event is sent before unload
    this.mp.track(MP_EV_PAGE_LEAVE, props, {transport: 'sendBeacon'});
};

Autocapture.prototype._initScrollDepthTracking = function() {
    win.removeEventListener(EV_SCROLL, this.listenerScrollDepth);
    win.removeEventListener(EV_SCROLLEND, this.listenerScrollDepth);

    if (!this.mp.get_config('record_heatmap_data')) {
        return;
    }

    logger$9.log('Initializing scroll depth tracking');

    this.maxScrollViewDepth = Math.max(document$1.documentElement.clientHeight, win.innerHeight || 0);

    var updateScrollDepth = function() {
        if (this.currentUrlBlocked()) {
            return;
        }
        var scrollViewHeight = Math.max(document$1.documentElement.clientHeight, win.innerHeight || 0) + win.scrollY;
        if (scrollViewHeight > this.maxScrollViewDepth) {
            this.maxScrollViewDepth = scrollViewHeight;
        }
        this.previousScrollHeight = document$1.body.scrollHeight;
    }.bind(this);

    var scrollEndPolyfill = getPolyfillScrollEndFunction(updateScrollDepth);
    this.listenerScrollDepth = scrollEndPolyfill.listener;
    win.addEventListener(scrollEndPolyfill.eventType, this.listenerScrollDepth);
};

Autocapture.prototype.initClickTracking = function() {
    win.removeEventListener(EV_CLICK, this.listenerClick, true);

    if (!this.getConfig(CONFIG_TRACK_CLICK) && !this.mp.get_config('record_heatmap_data')) {
        return;
    }
    logger$9.log('Initializing click tracking');

    this.listenerClick = function(ev) {
        if (!this.getConfig(CONFIG_TRACK_CLICK) && !this.mp.is_recording_heatmap_data()) {
            return;
        }
        this.trackDomEvent(ev, MP_EV_CLICK);
    }.bind(this);
    win.addEventListener(EV_CLICK, this.listenerClick, true);
};

Autocapture.prototype.initDeadClickTracking = function() {
    var deadClickConfig = this._getClickTrackingConfig(CONFIG_TRACK_DEAD_CLICK);

    if (!deadClickConfig && !this.mp.get_config('record_heatmap_data')) {
        this.stopDeadClickTracking();
        return;
    }

    logger$9.log('Initializing dead click tracking');
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
        win.addEventListener(EV_CLICK, this.listenerDeadClick, true);
    }
};

Autocapture.prototype.initInputTracking = function() {
    win.removeEventListener(EV_CHANGE, this.listenerChange, true);

    if (!this.getConfig(CONFIG_TRACK_INPUT)) {
        return;
    }
    logger$9.log('Initializing input tracking');

    this.listenerChange = function(ev) {
        if (!this.getConfig(CONFIG_TRACK_INPUT)) {
            return;
        }
        this.trackDomEvent(ev, MP_EV_INPUT);
    }.bind(this);
    win.addEventListener(EV_CHANGE, this.listenerChange, true);
};

Autocapture.prototype.initPageviewTracking = function() {
    win.removeEventListener(EV_MP_LOCATION_CHANGE, this.listenerLocationchange);

    if (!this.pageviewTrackingConfig() && !this.mp.get_config('record_heatmap_data')) {
        return;
    }
    logger$9.log('Initializing pageview tracking');

    var previousTrackedUrl = '';
    var tracked = false;
    // Track initial pageview if pageview tracking enabled OR heatmap recording is active
    if ((this.pageviewTrackingConfig() || this.mp.is_recording_heatmap_data()) && !this.currentUrlBlocked()) {
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
        if (!trackPageviewOption && this.mp.is_recording_heatmap_data()) {
            trackPageviewOption = PAGEVIEW_OPTION_FULL_URL;
        }

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
                logger$9.log('Path change: re-initializing scroll depth checkpoints');
            }
        }
    }.bind(this));
    win.addEventListener(EV_MP_LOCATION_CHANGE, this.listenerLocationchange);
};

Autocapture.prototype.initRageClickTracking = function() {
    win.removeEventListener(EV_CLICK, this.listenerRageClick, true);

    var rageClickConfig = this._getClickTrackingConfig(CONFIG_TRACK_RAGE_CLICK);
    if (!rageClickConfig && !this.mp.get_config('record_heatmap_data')) {
        return;
    }

    logger$9.log('Initializing rage click tracking');
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
    win.addEventListener(EV_CLICK, this.listenerRageClick, true);
};

Autocapture.prototype.initScrollTracking = function() {
    win.removeEventListener(EV_SCROLLEND, this.listenerScroll);
    win.removeEventListener(EV_SCROLL, this.listenerScroll);


    if (!this.getConfig(CONFIG_TRACK_SCROLL)) {
        return;
    }
    logger$9.log('Initializing scroll tracking');
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

        var scrollTop = win.scrollY;
        var props = _.extend({'$scroll_top': scrollTop}, DEFAULT_PROPS);
        try {
            var scrollHeight = document$1.body.scrollHeight;
            var scrollPercentage = Math.round((scrollTop / (scrollHeight - win.innerHeight)) * 100);
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
            logger$9.critical('Error while calculating scroll percentage', err);
        }
        if (shouldTrack) {
            this.mp.track(MP_EV_SCROLL, props);
        }
    }.bind(this);

    var scrollEndPolyfill = getPolyfillScrollEndFunction(scrollTrackFunction);
    this.listenerScroll = scrollEndPolyfill.listener;
    win.addEventListener(scrollEndPolyfill.eventType, this.listenerScroll);
};

Autocapture.prototype.initSubmitTracking = function() {
    win.removeEventListener(EV_SUBMIT, this.listenerSubmit, true);

    if (!this.getConfig(CONFIG_TRACK_SUBMIT)) {
        return;
    }
    logger$9.log('Initializing submit tracking');

    this.listenerSubmit = function(ev) {
        if (!this.getConfig(CONFIG_TRACK_SUBMIT)) {
            return;
        }
        this.trackDomEvent(ev, MP_EV_SUBMIT);
    }.bind(this);
    win.addEventListener(EV_SUBMIT, this.listenerSubmit, true);
};

Autocapture.prototype.initPageLeaveTracking = function() {
    // Capture page_leave both when the user navigates away from the page (visibilitychange) as well
    // as when they navigate to a different page within the SPA (popstate/pushstate/hashchange).
    document$1.removeEventListener(EV_VISIBILITYCHANGE, this.listenerPageLeaveVisibilitychange);
    win.removeEventListener(EV_MP_LOCATION_CHANGE, this.listenerPageLeaveLocationchange);
    win.removeEventListener(EV_LOAD, this.listenerPageLoad);

    if (!this.getConfig(CONFIG_TRACK_PAGE_LEAVE) && !this.mp.get_config('record_heatmap_data')) {
        return;
    }

    logger$9.log('Initializing page visibility tracking.');
    this._initScrollDepthTracking();
    var previousTrackedUrl = _.info.currentUrl();

    // Initialize previousScrollHeight on `load` which handles async loading
    // https://developer.mozilla.org/en-US/docs/Web/API/Window/load_event
    this.listenerPageLoad = function() {
        this.previousScrollHeight = document$1.body.scrollHeight;
    }.bind(this);
    win.addEventListener(EV_LOAD, this.listenerPageLoad);

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
            this.maxScrollViewDepth = Math.max(document$1.documentElement.clientHeight, win.innerHeight || 0);
            this.previousScrollHeight = document$1.body.scrollHeight;
            this.hasTrackedScrollSession = false;
        }
    }.bind(this));
    win.addEventListener(EV_MP_LOCATION_CHANGE, this.listenerPageLeaveLocationchange);

    this.listenerPageLeaveVisibilitychange = function(ev) {
        if (document$1.hidden) {
            this._trackPageLeave(ev, previousTrackedUrl, this.previousScrollHeight);
        }
    }.bind(this);
    document$1.addEventListener(EV_VISIBILITYCHANGE, this.listenerPageLeaveVisibilitychange);
};

Autocapture.prototype.stopDeadClickTracking = function() {
    if (this.listenerDeadClick) {
        win.removeEventListener(EV_CLICK, this.listenerDeadClick, true);
        this.listenerDeadClick = null;
    }

    if (this._deadClickTracker) {
        this._deadClickTracker.stopTracking();
        this._deadClickTracker = null;
    }
};

// TODO integrate error_reporter from mixpanel instance
safewrapClass(Autocapture);

/**
 * Get the promise-based targeting loader
 * @param {Function} loadExtraBundle - Function to load external bundle (callback-based)
 * @param {string} targetingSrc - URL to targeting bundle
 * @returns {Promise} Promise that resolves with targeting library
 */
var getTargetingPromise = function(loadExtraBundle, targetingSrc) {
    // Return existing promise if already initialized or loading
    if (win[TARGETING_GLOBAL_NAME] && typeof win[TARGETING_GLOBAL_NAME].then === 'function') {
        return win[TARGETING_GLOBAL_NAME];
    }

    // Create loading promise and set it as the global immediately
    // This makes minified build behavior consistent with dev/CJS builds
    win[TARGETING_GLOBAL_NAME] = new Promise(function (resolve) {
        loadExtraBundle(targetingSrc, resolve);
    }).then(function () {
        var p = win[TARGETING_GLOBAL_NAME];
        if (p && typeof p.then === 'function') {
            return p;
        }
        throw new Error('targeting failed to load');
    }).catch(function (err) {
        delete win[TARGETING_GLOBAL_NAME];
        throw err;
    });

    return win[TARGETING_GLOBAL_NAME];
};

/**
 * @type {import('./wrapper').StorageWrapper}
 */
var IDBStorageWrapper = function (dbName, storeName, versionData, options) {
    this.dbName = dbName;
    this.storeName = storeName;
    this.version = versionData.version;
    this.storeNamesInDb = versionData.storeNames;
    // false to only open a database the device already has, for cleanup that mustn't create one
    this.createIfMissing = !options || options.createIfMissing !== false;
    /**
     * @type {Promise<IDBDatabase>|null}
     */
    this.dbPromise = null;
};

IDBStorageWrapper.prototype._openDb = function () {
    var dbName = this.dbName;
    var version = this.version;
    var storeNamesInDb = this.storeNamesInDb;
    var createIfMissing = this.createIfMissing;
    var open = function () {
        return new PromisePolyfill(function (resolve, reject) {
            var openRequest = win.indexedDB.open(dbName, version);
            openRequest['onerror'] = function () {
                reject(openRequest.error);
            };

            openRequest['onsuccess'] = function () {
                resolve(openRequest.result);
            };

            openRequest['onupgradeneeded'] = function (ev) {
                if (!createIfMissing && ev['oldVersion'] === 0) {
                    // aborting fails the open; the new database stays at version 0, which
                    // databases() doesn't list
                    openRequest['transaction']['abort']();
                    return;
                }
                var db = ev.target.result;

                storeNamesInDb.forEach(function (storeName) {
                    if (!db.objectStoreNames.contains(storeName)) {
                        db.createObjectStore(storeName);
                    }
                });
            };
        });
    };

    // where the browser lists its databases, a missing one isn't even opened
    if (createIfMissing || !win.indexedDB['databases']) {
        return open();
    }
    return win.indexedDB['databases']().then(function (databases) {
        for (var i = 0; i < databases.length; i++) {
            if (databases[i]['name'] === dbName) {
                return open();
            }
        }
        return PromisePolyfill.reject(dbName + ' does not exist');
    });
};

IDBStorageWrapper.prototype.init = function () {
    if (!win.indexedDB) {
        return PromisePolyfill.reject('indexedDB is not supported in this browser');
    }

    if (!this.dbPromise) {
        this.dbPromise = this._openDb();
    }

    return this.dbPromise
        .then(function (dbOrError) {
            if (dbOrError instanceof win['IDBDatabase']) {
                return PromisePolyfill.resolve();
            } else {
                return PromisePolyfill.reject(dbOrError);
            }
        });
};

IDBStorageWrapper.prototype.isInitialized = function () {
    return !!this.dbPromise;
};

/**
 * @param {IDBTransactionMode} mode
 * @param {function(IDBObjectStore): void} storeCb
 */
IDBStorageWrapper.prototype.makeTransaction = function (mode, storeCb) {
    var storeName = this.storeName;
    var doTransaction = function (db) {
        return new PromisePolyfill(function (resolve, reject) {
            var transaction = db.transaction(storeName, mode);
            transaction.oncomplete = function () {
                resolve(transaction);
            };
            transaction.onabort = transaction.onerror = function () {
                reject(transaction.error);
            };

            storeCb(transaction.objectStore(storeName));
        });
    };

    return this.dbPromise
        .then(doTransaction)
        .catch(function (err) {
            if (err && err['name'] === 'InvalidStateError') {
                // try reopening the DB if the connection is closed
                this.dbPromise = this._openDb();
                return this.dbPromise.then(doTransaction);
            } else {
                return PromisePolyfill.reject(err);
            }
        }.bind(this));
};

IDBStorageWrapper.prototype.setItem = function (key, value) {
    return this.makeTransaction('readwrite', function (objectStore) {
        objectStore.put(value, key);
    });
};

IDBStorageWrapper.prototype.getItem = function (key) {
    var req;
    return this.makeTransaction('readonly', function (objectStore) {
        req = objectStore.get(key);
    }).then(function () {
        return req.result;
    });
};

IDBStorageWrapper.prototype.removeItem = function (key) {
    return this.makeTransaction('readwrite', function (objectStore) {
        objectStore.delete(key);
    });
};

IDBStorageWrapper.prototype.getAll = function () {
    var req;
    return this.makeTransaction('readonly', function (objectStore) {
        req = objectStore.getAll();
    }).then(function () {
        return req.result;
    });
};

var logger$8 = console_with_prefix('flags');

var MIXPANEL_FLAGS_DB_NAME = 'mixpanelFlagsDb';
var FLAGS_STORE_NAME = 'mixpanelFlags';

// Keeping these two properties closeby, as adding additional stores to a DB in IndexedDB requires a version increment
var FLAGS_VERSION_DATA = { version: 1, storeNames: [FLAGS_STORE_NAME] };

var PERSISTED_VARIANTS_KEY_PREFIX = 'persisted_variants_for_';
var DEFAULT_TTL_MS = 24 * 60 * 60 * 1000;

var VariantLookupPolicy = Object.freeze({
    NETWORK_ONLY: 'networkOnly',
    NETWORK_FIRST: 'networkFirst',
    PERSISTENCE_UNTIL_NETWORK_SUCCESS: 'persistenceUntilNetworkSuccess'
});

var VALID_POLICIES = [
    VariantLookupPolicy.NETWORK_ONLY,
    VariantLookupPolicy.NETWORK_FIRST,
    VariantLookupPolicy.PERSISTENCE_UNTIL_NETWORK_SUCCESS
];

/**
 * Module for handling the storage and retrieval of persisted feature flag variants.
 */
var FeatureFlagPersistence = function(persistenceConfig, token, isGloballyDisabled) {
    this.idb = new IDBStorageWrapper(MIXPANEL_FLAGS_DB_NAME, FLAGS_STORE_NAME, FLAGS_VERSION_DATA);
    this.persistenceConfig = persistenceConfig;
    this.persistedVariantsKey = PERSISTED_VARIANTS_KEY_PREFIX + token;
    this.isGloballyDisabled = isGloballyDisabled || function() { return false; };
};

FeatureFlagPersistence.prototype.getPolicy = function() {
    if (this.isGloballyDisabled() || !this._isConfigValid()) {
        return VariantLookupPolicy.NETWORK_ONLY;
    }
    return this.persistenceConfig['variantLookupPolicy'];
};

FeatureFlagPersistence.prototype.getTtlMs = function() {
    if (!this._isConfigValid()) {
        return DEFAULT_TTL_MS;
    }
    var configuredTtl = this.persistenceConfig['persistenceTtlMs'];
    return (configuredTtl === undefined || configuredTtl === null) ? DEFAULT_TTL_MS : configuredTtl;
};

FeatureFlagPersistence.prototype._isConfigValid = function() {
    var config = this.persistenceConfig;
    if (!config) {
        return false;
    }

    if (VALID_POLICIES.indexOf(config['variantLookupPolicy']) === -1) {
        logger$8.error('Invalid variantLookupPolicy:', config['variantLookupPolicy']);
        return false;
    }

    if (config['persistenceTtlMs'] !== undefined &&
        config['persistenceTtlMs'] !== null &&
        config['persistenceTtlMs'] <= 0) {
        logger$8.error('If provided, persistenceTtlMs must be a positive number. Provided value:', config['persistenceTtlMs']);
        return false;
    }

    return true;
};

FeatureFlagPersistence.prototype.loadFlagsFromStorage = function(context) {
    var clearAndReturnNull = _.bind(function() {
        return this.clear().then(function() { return null; }).catch(function() { return null; });
    }, this);

    if (this.getPolicy() === VariantLookupPolicy.NETWORK_ONLY) {
        return clearAndReturnNull();
    }

    var ttlMs = this.getTtlMs();

    return this.idb.init().then(_.bind(function() {
        return this.idb.getItem(this.persistedVariantsKey);
    }, this)).then(_.bind(function(data) {
        if (!data) {
            logger$8.log('No persisted variants found in IndexedDB');
            return null;
        }

        if (ttlMs && Date.now() - data['persistedAt'] >= ttlMs) {
            logger$8.log('Persisted variants are expiring');
            return null;
        }

        if (!context || data['distinctId'] !== context['distinct_id']) {
            logger$8.log('Persisted variants found, but for a different distinct_id so clearing.');
            return clearAndReturnNull();
        }

        var persistedFlags = new Map();
        _.each(data['flagVariants'], function(variantData, key) {
            persistedFlags.set(key, {
                'key': variantData['variant_key'],
                'value': variantData['variant_value'],
                'experiment_id': variantData['experiment_id'],
                'is_experiment_active': variantData['is_experiment_active'],
                'is_qa_tester': variantData['is_qa_tester'],
                'variant_source': 'persistence',
                'persisted_at_in_ms': data['persistedAt'],
                'ttl_in_ms': ttlMs
            });
        });

        logger$8.log('Loaded', persistedFlags.size, 'variants from IndexedDB for distinct_id', data['distinctId']);

        return {
            flags: persistedFlags,
            pendingFirstTimeEvents: data['pendingFirstTimeEvents'] || {},
            persistedAtMs: data['persistedAt'],
            ttlMs: ttlMs
        };
    }, this)).catch(_.bind(function(error) {
        logger$8.error('Failed to load persisted variants from IndexedDB, so clearing', error);
        return clearAndReturnNull();
    }, this));
};

FeatureFlagPersistence.prototype.save = function(context, flagsMap, pendingFirstTimeEvents) {
    if (this.getPolicy() === VariantLookupPolicy.NETWORK_ONLY) {
        return Promise.resolve();
    }

    var flagVariants = {};
    flagsMap.forEach(function(variant, key) {
        if (variant['is_preview'] === true) {
            return;
        }
        flagVariants[key] = {
            'variant_key': variant['key'],
            'variant_value': variant['value'],
            'experiment_id': variant['experiment_id'],
            'is_experiment_active': variant['is_experiment_active'],
            'is_qa_tester': variant['is_qa_tester']
        };
    });

    var persistedPendingEvents = {};
    _.each(pendingFirstTimeEvents || {}, function(event, key) {
        var flag = flagsMap.get(event['flag_key']);
        if (!flag || flag['is_preview'] !== true) {
            persistedPendingEvents[key] = event;
        }
    });

    var data = {
        'persistedAt': Date.now(),
        'distinctId': context && context['distinct_id'],
        'context': context,
        'flagVariants': flagVariants,
        'pendingFirstTimeEvents': persistedPendingEvents
    };

    return this.idb.init().then(_.bind(function() {
        return this.idb.setItem(this.persistedVariantsKey, data);
    }, this)).then(function() {
        logger$8.log('Saved', flagsMap.size, 'variants to IndexedDB for distinct_id', data['distinctId']);
    }).catch(function(error) {
        logger$8.error('Failed to persist variants to IndexedDB:', error);
    });
};

/**
 * Remove the persisted variants, without creating the database.
 * @returns {Promise}
 */
FeatureFlagPersistence.prototype.clear = function() {
    if (this.isGloballyDisabled()) {
        return Promise.resolve();
    }
    var variantsKey = this.persistedVariantsKey;
    var existingIdb = new IDBStorageWrapper(MIXPANEL_FLAGS_DB_NAME, FLAGS_STORE_NAME, FLAGS_VERSION_DATA, {createIfMissing: false});
    return existingIdb.init().then(function() {
        return existingIdb.removeItem(variantsKey);
    }).then(function() {
        logger$8.log('Cleared persisted variants from IndexedDB');
    }).catch(function(error) {
        // usually the device has no database, so there's nothing to clear
        logger$8.log('No persisted variants cleared from IndexedDB:', error);
    });
};

var logger$7 = console_with_prefix('flags');
var FLAGS_CONFIG_KEY = 'flags';

var CONFIG_CONTEXT = 'context';
var CONFIG_PERSISTENCE = 'persistence';
var CONFIG_DEFAULTS = {};
CONFIG_DEFAULTS[CONFIG_CONTEXT] = {};

/**
 * Generate a unique key for a pending first-time event
 * @param {string} flagKey - The flag key
 * @param {string} firstTimeEventHash - The first_time_event_hash from the pending event definition
 * @returns {string} Composite key in format "flagKey:firstTimeEventHash"
 */
var getPendingEventKey = function(flagKey, firstTimeEventHash) {
    return flagKey + ':' + firstTimeEventHash;
};

/**
 * Extract the flag key from a pending event key
 * @param {string} eventKey - The composite event key in format "flagKey:firstTimeEventHash"
 * @returns {string} The flag key portion
 */
var getFlagKeyFromPendingEventKey = function(eventKey) {
    return eventKey.split(':')[0];
};

// Fallback reasons surfaced via a NEW `fallback_reason` field on the returned
// variant. `variant_source` stays as the coarse 'network' | 'persistence' |
// 'fallback' values shipped in 2.80.0 — adding a sibling field rather than
// extending the existing one keeps every consumer of the published type
// working unchanged. Values match mixpanel-php so the OpenFeature wrapper
// dispatch is consistent across SDKs.
var FALLBACK_REASON_FLAG_NOT_FOUND = 'FLAG_NOT_FOUND';
var FALLBACK_REASON_NOT_READY = 'NOT_READY';
var FALLBACK_REASON_BACKEND_ERROR = 'BACKEND_ERROR';

// $experiment_type values on $experiment_started
var EXPERIMENT_TYPE_FEATURE_FLAG = 'feature_flag';
var EXPERIMENT_TYPE_VISUAL = 'visual';

var NOOP_VISUAL_EXPERIMENTS = {
    onFlagsDelivered: NOOP_FUNC,
    onDeliverySettled: NOOP_FUNC,
    onReset: NOOP_FUNC
};

var withFallbackSource = function(fallback, reason) {
    var extras = {'variant_source': 'fallback'};
    if (reason) {
        extras['fallback_reason'] = reason;
    }
    if (_.isObject(fallback)) {
        return _.extend({}, fallback, extras);
    }
    return _.extend({'value': fallback}, extras);
};

/**
 * FeatureFlagManager: support for Mixpanel's feature flagging product
 * @constructor
 */
var FeatureFlagManager = function(initOptions) {
    this.fetch = win['fetch'];
    this.getFullApiRoute = initOptions.getFullApiRoute;
    this.getMpConfig = initOptions.getConfigFunc;
    this.setMpConfig = initOptions.setConfigFunc;
    this.getMpProperty = initOptions.getPropertyFunc;
    this.track = initOptions.trackingFunc;
    this.consentGate = initOptions.consentGate;
    this.loadExtraBundle = initOptions.loadExtraBundle || function() {};
    this.targetingSrc = initOptions.targetingSrc || '';
    this.visualExperiments = initOptions.visualExperiments || NOOP_VISUAL_EXPERIMENTS;
};

FeatureFlagManager.prototype.init = function() {
    if (!this.consentGate.allowsFetching()) {
        return;
    }
    if (!this.minApisSupported()) {
        logger$7.critical('Feature Flags unavailable: missing minimum required APIs');
        this.visualExperiments.onDeliverySettled();
        return;
    }

    this._previewToken = this._getPreviewToken();
    this.flags = null;
    this.trackedFeatures = new Set();
    this.trackedVisualExposures = new Set();
    this.pendingFirstTimeEvents = {};
    this.activatedFirstTimeEvents = {};
    this._loadedPersistedAtMs = null;
    this._loadedTtlMs = null;

    this.persistence = new FeatureFlagPersistence(
        this.getConfig(CONFIG_PERSISTENCE),
        this.getMpConfig('token'),
        _.bind(function() { return !this.consentGate.allowsPersistence(); }, this)
    );

    // Preview links must await the server-selected variant before any cached
    // assignment can apply visual changes or report an exposure.
    this.persistenceLoadedPromise = (this._previewToken ? Promise.resolve(null) :
        this.persistence.loadFlagsFromStorage(this._buildContext()))
        .then(_.bind(function(loaded) {
            if (loaded) {
                this.flags = loaded.flags;
                this.pendingFirstTimeEvents = loaded.pendingFirstTimeEvents;
                this._loadedPersistedAtMs = loaded.persistedAtMs;
                this._loadedTtlMs = loaded.ttlMs;
                this.visualExperiments.onFlagsDelivered(this.flags);
            }
        }, this));

    var initPromise = this.persistenceLoadedPromise
        .then(_.bind(function() {
            return this.fetchFlags();
        }, this))
        .catch(function() {
            logger$7.error('Error initializing feature flags');
        });

    // Settle even when initialization completes without delivering variants
    // (flags disabled, no variants, or a failed request).
    var settled = _.bind(this.visualExperiments.onDeliverySettled, this.visualExperiments);
    initPromise.then(settled, settled);
    return initPromise;
};

FeatureFlagManager.prototype._getPreviewToken = function() {
    return _.getPreviewToken();
};

FeatureFlagManager.prototype._buildContext = function() {
    return _.extend(
        {'distinct_id': this.getMpProperty('distinct_id'), 'device_id': this.getMpProperty('$device_id')},
        this.getConfig(CONFIG_CONTEXT)
    );
};

FeatureFlagManager.prototype.reset = function() {
    if (!this.persistence) {
        return Promise.resolve();
    }

    this.flags = null;
    this.pendingFirstTimeEvents = {};
    this.activatedFirstTimeEvents = {};
    this.trackedFeatures = new Set();
    this.trackedVisualExposures = new Set();
    this.visualExperiments.onReset();
    this.fetchPromise = null;
    this._fetchInProgressStartTime = null;
    this._loadedPersistedAtMs = null;
    this._loadedTtlMs = null;

    return this.persistence.clear().then(_.bind(function() {
        return this.fetchFlags();
    }, this)).catch(function() {
        logger$7.error('Error during flags reset');
    });
};

FeatureFlagManager.prototype.getFullConfig = function() {
    var ffConfig = this.getMpConfig(FLAGS_CONFIG_KEY);
    if (!ffConfig) {
        // flags are completely off
        return {};
    } else if (_.isObject(ffConfig)) {
        return _.extend({}, CONFIG_DEFAULTS, ffConfig);
    } else {
        // config is non-object truthy value, return default
        return CONFIG_DEFAULTS;
    }
};

FeatureFlagManager.prototype.getConfig = function(key) {
    return this.getFullConfig()[key];
};

FeatureFlagManager.prototype.isSystemEnabled = function() {
    return !!this.getMpConfig(FLAGS_CONFIG_KEY) && this.consentGate.allowsFetching();
};

FeatureFlagManager.prototype.updateContext = function(newContext, options) {
    if (!this.isSystemEnabled()) {
        logger$7.critical('Feature Flags not enabled, cannot update context');
        return Promise.resolve();
    }

    var ffConfig = this.getMpConfig(FLAGS_CONFIG_KEY);
    if (!_.isObject(ffConfig)) {
        ffConfig = {};
    }
    var oldContext = (options && options['replace']) ? {} : this.getConfig(CONFIG_CONTEXT);
    ffConfig[CONFIG_CONTEXT] = _.extend({}, oldContext, newContext);

    var configUpdate = {};
    configUpdate[FLAGS_CONFIG_KEY] = ffConfig;
    this.setMpConfig(configUpdate);
    return this.fetchFlags().catch(function() {
        logger$7.error('Error fetching flags during updateContext');
    });
};

FeatureFlagManager.prototype.areFlagsReady = function() {
    if (!this.isSystemEnabled()) {
        logger$7.error('Feature Flags not enabled');
    }
    return !!this.flags;
};

/**
 * Delete this token's persisted variants, also before init() and when persistence isn't allowed.
 * @returns {Promise}
 */
FeatureFlagManager.prototype.clearPersistedVariants = function() {
    return new FeatureFlagPersistence(null, this.getMpConfig('token')).clear();
};

FeatureFlagManager.prototype.fetchFlags = function() {
    if (!this.isSystemEnabled()) {
        return Promise.resolve();
    }

    var context = this._buildContext();
    var distinctId = context['distinct_id'];
    var traceparent = generateTraceparent();
    logger$7.log('Fetching flags for distinct ID: ' + distinctId);

    var searchParams = new URLSearchParams();
    searchParams.set('context', JSON.stringify(context));
    searchParams.set('token', this.getMpConfig('token'));
    searchParams.set('mp_lib', 'web');
    searchParams.set('$lib_version', Config.LIB_VERSION);
    this._previewToken = this._getPreviewToken();
    if (this._previewToken) {
        searchParams.set('mp_preview_token', this._previewToken);
    }
    var url = this.getFullApiRoute() + '?' + searchParams.toString();

    this._fetchInProgressStartTime = Date.now();
    var fetchOptions = {
        'method': 'GET',
        'headers': {
            'Authorization': 'Basic ' + btoa(this.getMpConfig('token') + ':'),
            'traceparent': traceparent
        }
    };
    if (this._previewToken) {
        fetchOptions['referrerPolicy'] = 'no-referrer';
    }
    this.fetchPromise = this.fetch.call(win, url, fetchOptions).then(function(response) {
        this.markFetchComplete();
        return response.json();
    }.bind(this)).then(function(responseBody) {
        if (responseBody['preview_error']) {
            var previewErrorCode = responseBody['preview_error']['code'];
            // Only log the API's known diagnostic codes, never arbitrary response
            // contents that could include the preview credential.
            if (previewErrorCode !== 'invalid_preview_token' && previewErrorCode !== 'preview_unavailable') {
                previewErrorCode = 'unknown_preview_error';
            }
            logger$7.warn('Shared preview unavailable (' + previewErrorCode + '); using normal flags');
        }
        var responseFlags = responseBody['flags'];
        if (!responseFlags) {
            throw new Error('No flags in API response');
        }
        var flags = new Map();
        var pendingFirstTimeEvents = {};

        // Process flags from response
        _.each(responseFlags, function(data, key) {
            // Check if this flag has any activated first-time events this session
            var hasActivatedEvent = false;
            var prefix = key + ':';
            if (data['is_preview'] === true) {
                // A preview takes precedence over first-time-event stickiness.
                _.each(this.activatedFirstTimeEvents, function(activated, eventKey) {
                    if (eventKey.startsWith(prefix)) {
                        delete this.activatedFirstTimeEvents[eventKey];
                    }
                }, this);
            } else {
                _.each(this.activatedFirstTimeEvents, function(activated, eventKey) {
                    if (eventKey.startsWith(prefix)) {
                        hasActivatedEvent = true;
                    }
                });
            }

            if (hasActivatedEvent) {
                // Preserve the activated variant, don't overwrite with server's current variant
                var currentFlag = this.flags && this.flags.get(key);
                if (currentFlag) {
                    flags.set(key, currentFlag);
                }
            } else {
                // Use server's current variant
                var variant = {
                    'key': data['variant_key'],
                    'value': data['variant_value'],
                    'experiment_id': data['experiment_id'],
                    'is_experiment_active': data['is_experiment_active'],
                    'is_qa_tester': data['is_qa_tester'],
                    'variant_source': 'network'
                };
                if (data['is_preview'] === true) {
                    variant['is_preview'] = true;
                }
                flags.set(key, variant);
            }
        }, this);

        // Process top-level pending_first_time_events array
        var topLevelDefinitions = responseBody['pending_first_time_events'];
        if (topLevelDefinitions && topLevelDefinitions.length > 0) {
            _.each(topLevelDefinitions, function(def) {
                var flagKey = def['flag_key'];
                if (flags.has(flagKey) && flags.get(flagKey)['is_preview']) {
                    return;
                }
                var eventKey = getPendingEventKey(flagKey, def['first_time_event_hash']);

                // Skip if this specific event has already been activated this session
                if (this.activatedFirstTimeEvents[eventKey]) {
                    return;
                }

                // Store pending event definition using composite key
                pendingFirstTimeEvents[eventKey] = {
                    'flag_key': flagKey,
                    'flag_id': def['flag_id'],
                    'project_id': def['project_id'],
                    'first_time_event_hash': def['first_time_event_hash'],
                    'event_name': def['event_name'],
                    'property_filters': def['property_filters'],
                    'pending_variant': def['pending_variant']
                };
            }, this);
        }

        // Preserve any activated orphaned flags (flags that were activated but are no longer in response)
        if (this.activatedFirstTimeEvents) {
            _.each(this.activatedFirstTimeEvents, function(activated, eventKey) {
                var flagKey = getFlagKeyFromPendingEventKey(eventKey);
                if (activated && !flags.has(flagKey) && this.flags && this.flags.has(flagKey)) {
                    // Keep the activated flag even though it's not in the new response
                    flags.set(flagKey, this.flags.get(flagKey));
                }
            }, this);
        }

        this.flags = flags;
        this.trackedFeatures = new Set();
        this.trackedVisualExposures = new Set();
        this.pendingFirstTimeEvents = pendingFirstTimeEvents;
        this._loadedPersistedAtMs = null;
        this._loadedTtlMs = null;
        this._traceparent = traceparent;
        this.visualExperiments.onFlagsDelivered(this.flags);

        this._loadTargetingIfNeeded();

        this.persistence.save(context, this.flags, this.pendingFirstTimeEvents);
    }.bind(this)).catch(function(error) {
        if (this._fetchInProgressStartTime) {
            this.markFetchComplete();
        }
        // Fetch implementations can include the request URL in their errors.
        if (this._previewToken) {
            error = new Error('Error fetching preview flags');
        }
        logger$7.error(error);
        throw error;
    }.bind(this));

    return this.fetchPromise;
};

FeatureFlagManager.prototype.loadFlags = function() {
    if (!this.isSystemEnabled()) {
        return Promise.resolve();
    }
    if (!this.trackedFeatures) {
        logger$7.error('loadFlags called before init');
        return Promise.resolve();
    }
    if (this._fetchInProgressStartTime) {
        return this.fetchPromise;
    }
    return this.fetchFlags();
};

FeatureFlagManager.prototype.markFetchComplete = function() {
    if (!this._fetchInProgressStartTime) {
        logger$7.error('Fetch in progress started time not set, cannot mark fetch complete');
        return;
    }
    this._fetchStartTime = this._fetchInProgressStartTime;
    this._fetchCompleteTime = Date.now();
    this._fetchLatency = this._fetchCompleteTime - this._fetchStartTime;
    this._fetchInProgressStartTime = null;
};

/**
 * Proactively load targeting bundle if any pending events have property filters
 */
FeatureFlagManager.prototype._loadTargetingIfNeeded = function() {
    var hasPropertyFilters = false;
    _.each(this.pendingFirstTimeEvents, function(evt) {
        if (evt['property_filters'] && !_.isEmptyObject(evt['property_filters'])) {
            hasPropertyFilters = true;
        }
    });

    if (hasPropertyFilters) {
        this.getTargeting().then(function() {
            logger$7.log('targeting loaded for property filter evaluation');
        });
    }
};

/**
 * Get the targeting library (initializes if not already loaded)
 * This method is primarily for testing - production code should rely on automatic loading
 * @returns {Promise} Promise that resolves with targeting library
 */
FeatureFlagManager.prototype.getTargeting = function() {
    return getTargetingPromise(
        this.loadExtraBundle.bind(this),
        this.targetingSrc
    ).catch(function(error) {
        logger$7.error('Failed to load targeting: ' + error);
    }.bind(this));
};

/**
 * Check if a tracked event matches any pending first-time events and activate the corresponding flag variant
 * @param {string} eventName - The name of the event being tracked
 * @param {Object} properties - Event properties to evaluate against property filters
 *
 * When a match is found (event name matches and property filters pass), this method:
 * - Switches the flag to the pending variant
 * - Marks the event as activated for this session
 * - Records the activation via the API
 *
 * @returns {Promise} Resolves once the pending events have been processed and their recording
 * requests have settled. The promise never rejects, so callers that ignore it cannot produce an
 * unhandled rejection.
 */
FeatureFlagManager.prototype.checkFirstTimeEvents = function(eventName, properties) {
    if (!this.pendingFirstTimeEvents || _.isEmptyObject(this.pendingFirstTimeEvents)) {
        return Promise.resolve();
    }

    // Check if targeting promise exists (either bundled or async loaded)
    if (win[TARGETING_GLOBAL_NAME] && _.isFunction(win[TARGETING_GLOBAL_NAME].then)) {
        // The catch is part of the returned chain so the promise handed back always resolves.
        return win[TARGETING_GLOBAL_NAME].then(function(library) {
            return this._processFirstTimeEventCheck(eventName, properties, library);
        }.bind(this)).catch(function() {
            // If targeting failed to load, process with null
            // Events without property filters will still match
            return this._processFirstTimeEventCheck(eventName, properties, null);
        }.bind(this));
    } else {
        // No targeting available, process with null
        // Events without property filters will still match
        return this._processFirstTimeEventCheck(eventName, properties, null);
    }
};

/**
 * Internal method to process first-time event checks with loaded targeting library
 * @param {string} eventName - The name of the event being tracked
 * @param {Object} properties - Event properties to evaluate against property filters
 * @param {Object} targeting - The loaded targeting library
 * @returns {Promise} Resolves once every recording request started here has settled.
 */
FeatureFlagManager.prototype._processFirstTimeEventCheck = function(eventName, properties, targeting) {
    var recordings = [];
    var activated = false;
    _.each(this.pendingFirstTimeEvents, function(pendingEvent, eventKey) {
        if (this.activatedFirstTimeEvents[eventKey]) {
            return;
        }

        var flagKey = pendingEvent['flag_key'];
        if (this.flags && this.flags.has(flagKey) && this.flags.get(flagKey)['is_preview']) {
            return;
        }

        // Use targeting module to check if event matches
        var matchResult;

        // If no targeting library and event has property filters, skip it
        if (!targeting && pendingEvent['property_filters'] && !_.isEmptyObject(pendingEvent['property_filters'])) {
            logger$7.warn('Skipping event check for "' + flagKey + '" - property filters require targeting library');
            return;
        }

        // For simple events (no property filters), just check event name
        if (!targeting) {
            matchResult = {
                matches: eventName === pendingEvent['event_name'],
                error: null
            };
        } else {
            var criteria = {
                'event_name': pendingEvent['event_name'],
                'property_filters': pendingEvent['property_filters']
            };
            matchResult = targeting['eventMatchesCriteria'](
                eventName,
                properties,
                criteria
            );
        }

        if (matchResult.error) {
            logger$7.error('Error checking first-time event for flag "' + flagKey + '": ' + matchResult.error);
            return;
        }

        if (!matchResult.matches) {
            return;
        }

        logger$7.log('First-time event matched for flag "' + flagKey + '": ' + eventName);

        var newVariant = {
            'key': pendingEvent['pending_variant']['variant_key'],
            'value': pendingEvent['pending_variant']['variant_value'],
            'experiment_id': pendingEvent['pending_variant']['experiment_id'],
            'is_experiment_active': pendingEvent['pending_variant']['is_experiment_active']
        };

        this.flags.set(flagKey, newVariant);
        this.trackedFeatures.delete(flagKey);
        this.trackedVisualExposures.delete(flagKey);
        this.activatedFirstTimeEvents[eventKey] = true;
        activated = true;

        recordings.push(this.recordFirstTimeEvent(
            pendingEvent['flag_id'],
            pendingEvent['project_id'],
            pendingEvent['first_time_event_hash']
        ));
    }, this);
    if (activated) {
        this.visualExperiments.onFlagsDelivered(this.flags);
    }
    return Promise.all(recordings);
};

FeatureFlagManager.prototype.getFirstTimeEventApiRoute = function(flagId) {
    var base = this.getFullApiRoute().replace(/\/$/, '');
    return base + '/' + flagId + '/first-time-events';
};

FeatureFlagManager.prototype.recordFirstTimeEvent = function(flagId, projectId, firstTimeEventHash) {
    if (!this.consentGate.allowsFetching()) {
        return Promise.resolve();
    }
    var distinctId = this.getMpProperty('distinct_id');
    var traceparent = generateTraceparent();

    // Build URL with query string parameters
    var searchParams = new URLSearchParams();
    searchParams.set('mp_lib', 'web');
    searchParams.set('$lib_version', Config.LIB_VERSION);
    var url = this.getFirstTimeEventApiRoute(flagId) + '?' + searchParams.toString();

    var payload = {
        'distinct_id': distinctId,
        'project_id': projectId,
        'first_time_event_hash': firstTimeEventHash
    };

    logger$7.log('Recording first-time event for flag: ' + flagId);

    // The caller chains this so it can wait for the recording to settle. The catch below keeps the
    // returned promise resolved on failure, so a dropped request never rejects the chain.
    return this.fetch.call(win, url, {
        'method': 'POST',
        'headers': {
            'Content-Type': 'application/json',
            'Authorization': 'Basic ' + btoa(this.getMpConfig('token') + ':'),
            'traceparent': traceparent
        },
        'body': JSON.stringify(payload)
    }).catch(function(error) {
        // Silent failure - cohort sync will catch up
        logger$7.error('Failed to record first-time event for flag ' + flagId + ': ' + error);
    });
};

FeatureFlagManager.prototype.getVariant = function(featureName, fallback) {
    if (!this.persistenceLoadedPromise) {
        return new Promise(function(resolve) {
            logger$7.critical('Feature Flags not initialized');
            resolve(withFallbackSource(fallback, FALLBACK_REASON_NOT_READY));
        });
    }

    var policy = this.persistence.getPolicy();

    return this.persistenceLoadedPromise.then(_.bind(function() {
        // Serve from persistence until the network completes a successful fetch. If a non-expired cached value is available, return it without waiting on the in-flight fetch.
        if (policy === VariantLookupPolicy.PERSISTENCE_UNTIL_NETWORK_SUCCESS) {
            if (this.areFlagsReady() && !this._loadedPersistenceIsStale()) {
                return this.getVariantSync(featureName, fallback);
            }
            if (!this.fetchPromise) {
                return withFallbackSource(fallback, FALLBACK_REASON_NOT_READY);
            }
            return this.fetchPromise.then(_.bind(function() {
                return this.getVariantSync(featureName, fallback);
            }, this)).catch(function(error) {
                logger$7.error(error);
                return withFallbackSource(fallback, FALLBACK_REASON_BACKEND_ERROR);
            });
        }

        var serve = _.bind(function() { return this.getVariantSync(featureName, fallback); }, this);
        if (!this.fetchPromise) {
            return withFallbackSource(fallback, FALLBACK_REASON_NOT_READY);
        }
        return this.fetchPromise.then(serve).catch(_.bind(function(error) {
            logger$7.error(error);
            // If the fetch failure still left usable state (e.g. persistence hit under
            // a different policy config), serve from cache. Otherwise stamp
            // BACKEND_ERROR so callers can distinguish "backend is down" from
            // "flags never loaded". Mirrors the PUNS branch above.
            return this.areFlagsReady()
                ? serve()
                : withFallbackSource(fallback, FALLBACK_REASON_BACKEND_ERROR);
        }, this));
    }, this));
};

FeatureFlagManager.prototype._loadedPersistenceIsStale = function() {
    if (!this._loadedPersistedAtMs || !this._loadedTtlMs) {
        return false;
    }
    return Date.now() - this._loadedPersistedAtMs >= this._loadedTtlMs;
};

FeatureFlagManager.prototype.getVariantSync = function(featureName, fallback) {
    if (this._loadedPersistenceIsStale()) {
        logger$7.log('Loaded persisted variants are past TTL so returning fallback for "' + featureName + '"');
        return withFallbackSource(fallback, FALLBACK_REASON_NOT_READY);
    }
    if (!this.areFlagsReady()) {
        logger$7.log('Flags not loaded yet');
        return withFallbackSource(fallback, FALLBACK_REASON_NOT_READY);
    }
    var feature = this.flags.get(featureName);
    if (!feature) {
        logger$7.log('No flag found: "' + featureName + '"');
        return withFallbackSource(fallback, FALLBACK_REASON_FLAG_NOT_FOUND);
    }
    this.trackFeatureCheck(featureName, feature);
    return feature;
};

FeatureFlagManager.prototype.getAllVariants = function() {
    if (!this.persistenceLoadedPromise) {
        logger$7.critical('Feature Flags not initialized');
        return Promise.resolve(new Map());
    }

    var policy = this.persistence.getPolicy();

    return this.persistenceLoadedPromise.then(_.bind(function() {
        // Serve from persistence until the network completes a successful fetch. If a non-expired cached value is available, return it without waiting on the in-flight fetch.
        if (policy === VariantLookupPolicy.PERSISTENCE_UNTIL_NETWORK_SUCCESS) {
            if (this.areFlagsReady() && !this._loadedPersistenceIsStale()) {
                return this.getAllVariantsSync();
            }
            if (!this.fetchPromise) {
                return new Map();
            }
            return this.fetchPromise.then(_.bind(function() {
                return this.getAllVariantsSync();
            }, this)).catch(function(error) {
                logger$7.error(error);
                return new Map();
            });
        }

        var serve = _.bind(this.getAllVariantsSync, this);
        if (!this.fetchPromise) {
            return new Map();
        }
        return this.fetchPromise.then(serve).catch(serve);
    }, this));
};

FeatureFlagManager.prototype.getAllVariantsSync = function() {
    if (this._loadedPersistenceIsStale()) {
        logger$7.log('Loaded persisted variants are past TTL so returning empty Map');
        return new Map();
    }
    return this.flags || new Map();
};

FeatureFlagManager.prototype.getVariantValue = function(featureName, fallbackValue) {
    return this.getVariant(featureName, {'value': fallbackValue}).then(function(feature) {
        return feature['value'];
    }).catch(function(error) {
        logger$7.error(error);
        return fallbackValue;
    });
};

// TODO remove deprecated method
FeatureFlagManager.prototype.getFeatureData = function(featureName, fallbackValue) {
    logger$7.critical('mixpanel.flags.get_feature_data() is deprecated and will be removed in a future release. Use mixpanel.flags.get_variant_value() instead.');
    return this.getVariantValue(featureName, fallbackValue);
};

FeatureFlagManager.prototype.getVariantValueSync = function(featureName, fallbackValue) {
    return this.getVariantSync(featureName, {'value': fallbackValue})['value'];
};

FeatureFlagManager.prototype.isEnabled = function(featureName, fallbackValue) {
    return this.getVariantValue(featureName).then(function() {
        return this.isEnabledSync(featureName, fallbackValue);
    }.bind(this)).catch(function(error) {
        logger$7.error(error);
        return fallbackValue;
    });
};

FeatureFlagManager.prototype.isEnabledSync = function(featureName, fallbackValue) {
    fallbackValue = fallbackValue || false;
    var val = this.getVariantValueSync(featureName, fallbackValue);
    if (val !== true && val !== false) {
        logger$7.error('Feature flag "' + featureName + '" value: ' + val + ' is not a boolean; returning fallback value: ' + fallbackValue);
        val = fallbackValue;
    }
    return val;
};

function isPresent(v) {
    return v !== undefined && v !== null;
}

FeatureFlagManager.prototype.trackFeatureCheck = function(featureName, feature, experimentType) {
    if (feature['is_preview'] === true) {
        return;
    }
    // Code reads and visual applies dedupe independently so each exposure type
    // is recorded (and distinguishable) even when the other happened first.
    var tracked = experimentType === EXPERIMENT_TYPE_VISUAL ? this.trackedVisualExposures : this.trackedFeatures;
    if (tracked.has(featureName)) {
        return;
    }
    tracked.add(featureName);

    var trackingProperties = {
        'Experiment name': featureName,
        'Variant name': feature['key'],
        '$experiment_type': experimentType || EXPERIMENT_TYPE_FEATURE_FLAG,
        'Variant fetch start time': isPresent(this._fetchStartTime) ? new Date(this._fetchStartTime).toISOString() : null,
        'Variant fetch complete time': isPresent(this._fetchCompleteTime) ? new Date(this._fetchCompleteTime).toISOString() : null,
        'Variant fetch latency (ms)': this._fetchLatency,
        'Variant fetch traceparent': this._traceparent,
    };

    if (isPresent(feature['experiment_id'])) {
        trackingProperties['$experiment_id'] = feature['experiment_id'];
    }
    if (isPresent(feature['is_experiment_active'])) {
        trackingProperties['$is_experiment_active'] = feature['is_experiment_active'];
    }
    if (isPresent(feature['is_qa_tester'])) {
        trackingProperties['$is_qa_tester'] = feature['is_qa_tester'];
    }
    if (isPresent(feature['variant_source'])) {
        trackingProperties['$variant_source'] = feature['variant_source'];
    }
    if (isPresent(feature['persisted_at_in_ms'])) {
        trackingProperties['$persisted_at_in_ms'] = feature['persisted_at_in_ms'];
    }
    if (isPresent(feature['ttl_in_ms'])) {
        trackingProperties['$ttl_in_ms'] = feature['ttl_in_ms'];
    }

    this.track('$experiment_started', trackingProperties);
};

FeatureFlagManager.prototype.trackVisualExposure = function(featureName, feature) {
    this.trackFeatureCheck(featureName, feature, EXPERIMENT_TYPE_VISUAL);
};

FeatureFlagManager.prototype.whenReady = function() {
    if (this.fetchPromise) {
        return this.fetchPromise;
    }
    return Promise.resolve();
};

FeatureFlagManager.prototype.minApisSupported = function() {
    return !!this.fetch &&
      typeof Promise !== 'undefined' &&
      typeof Map !== 'undefined' &&
      typeof Set !== 'undefined';
};

safewrapClass(FeatureFlagManager);

FeatureFlagManager.prototype['are_flags_ready'] = FeatureFlagManager.prototype.areFlagsReady;
FeatureFlagManager.prototype['get_variant'] = FeatureFlagManager.prototype.getVariant;
FeatureFlagManager.prototype['get_variant_sync'] = FeatureFlagManager.prototype.getVariantSync;
FeatureFlagManager.prototype['get_all_variants'] = FeatureFlagManager.prototype.getAllVariants;
FeatureFlagManager.prototype['get_all_variants_sync'] = FeatureFlagManager.prototype.getAllVariantsSync;
FeatureFlagManager.prototype['get_variant_value'] = FeatureFlagManager.prototype.getVariantValue;
FeatureFlagManager.prototype['get_variant_value_sync'] = FeatureFlagManager.prototype.getVariantValueSync;
FeatureFlagManager.prototype['is_enabled'] = FeatureFlagManager.prototype.isEnabled;
FeatureFlagManager.prototype['is_enabled_sync'] = FeatureFlagManager.prototype.isEnabledSync;
FeatureFlagManager.prototype['load_flags'] = FeatureFlagManager.prototype.loadFlags;
FeatureFlagManager.prototype['update_context'] = FeatureFlagManager.prototype.updateContext;
FeatureFlagManager.prototype['when_ready'] = FeatureFlagManager.prototype.whenReady;

// Deprecated method
FeatureFlagManager.prototype['get_feature_data'] = FeatureFlagManager.prototype.getFeatureData;

// Exports intended only for testing
FeatureFlagManager.prototype['getTargeting'] = FeatureFlagManager.prototype.getTargeting;

/* eslint camelcase: "off" */


var logger$6 = console_with_prefix('visual-experiments');

// The supported mutation types: setAttribute, setText, setStyle, setClasses,
// setAttributes, hide. The backend validates persisted variants to this same set,
// so anything outside it never reaches replay; the extension drives the same
// dispatch during authoring. Unknown types are logged and skipped. Text edits go
// through setText (textContent), never innerHTML, so no markup is ever parsed.

// The engine needs a queryable DOM plus MutationObserver, requestAnimationFrame,
// and WeakSet. If any is missing the engine no-ops instead of partially applying.
var minApisSupported = function() {
    return !!(win && win['document'] &&
        typeof win['document'].querySelectorAll === 'function' &&
        typeof win['MutationObserver'] === 'function' &&
        typeof win['requestAnimationFrame'] === 'function' &&
        typeof WeakSet !== 'undefined');
};

var query = function(selector) {
    try {
        return win['document'].querySelectorAll(selector);
    } catch (err) {
        logger$6.error('Invalid selector: ' + selector, err);
        return [];
    }
};

var schedule = function(fn) {
    win['requestAnimationFrame'](fn);
};

// A mutation only reaches the elements its selector matches when its turn
// comes, and a later mutation in the same set can make an earlier selector
// match (e.g. a class it adds). Each apply therefore runs another pass while
// the previous one reached an element for the first time or wrote a class or
// attribute, up to this cap. The DOM does not change between passes other than
// through those writes, so passes converge; the cap guards anyway.
var MAX_APPLY_PASSES = 3;

// Values whose scheme can execute script when placed in a URL-bearing attribute
// (href, src, formaction, xlink:href, ...). Control chars/whitespace are stripped
// before the test because browsers ignore them within a scheme (e.g. "java\tscript:").
var DANGEROUS_URI_VALUE = /^(?:javascript|vbscript):|^data:text\/html/i;

// Reject attributes that can introduce script/active content when set from a
// persisted or authored value: any inline event handler (on*), iframe srcdoc
// (full HTML injection), and URL-bearing attributes carrying an executable scheme.
// setAttribute and setAttributes (which delegates here) both go through this guard.
var isUnsafeAttribute = function(name, value) {
    if (!name) {
        return true;
    }
    var lower = ('' + name).toLowerCase();
    if (lower.indexOf('on') === 0) {
        return true;
    }
    if (lower === 'srcdoc') {
        return true;
    }
    if (typeof value === 'string' && DANGEROUS_URI_VALUE.test(value.replace(/[\u0000-\u0020]+/g, ''))) {
        return true;
    }
    return false;
};

// Per-mutation "already applied" tracker. A WeakSet lets re-rendered nodes (new
// object identities) be detected as dirty without leaking removed nodes.
var makeTracker = function() {
    return new WeakSet();
};

/**
 * VisualChangeEngine applies typed visual-change mutations to the live DOM,
 * keeps an undo stack so a set can be reverted, and re-applies changes when the
 * page re-renders via a MutationObserver. State is per-instance so two Mixpanel
 * instances on one page do not share an undo stack.
 * @constructor
 */
var VisualChangeEngine = function() {
    this._undoStack = [];
    this._currentMutations = [];
    // Parallel to _currentMutations: a WeakSet of elements already mutated for
    // each mutation, so re-application only touches new/re-rendered nodes.
    this._appliedSets = [];
    // Optional per-set callback, invoked once per mutation index the first time
    // that mutation actually changes an element (possibly later, via the
    // observer). _firstApplyReported is parallel to _currentMutations. Reports are
    // queued in _pendingFirstApply and delivered only after the apply pass ends,
    // so the callback never runs while the engine is mid-mutation.
    this._onFirstApply = null;
    this._firstApplyReported = [];
    this._pendingFirstApply = [];
    this._observer = null;
    this._reapplyScheduled = false;
    // True while a body-not-yet-parsed observer-start retry is queued (at most one).
    this._observerStartPending = false;
};

// firstApply=false is a re-apply onto a node whose value a re-render clobbered:
// re-write only when diverged and never record undo (the baseline was captured
// on first apply). Returns true when a class or attribute was written, since
// those writes can change what other selectors in the set match.
VisualChangeEngine.prototype._applyOneToElement = function(mutation, el, firstApply) {
    var type = mutation['type'];
    if (type === 'setAttribute') {
        var attr = mutation['attribute'];
        if (isUnsafeAttribute(attr, mutation['value'])) {
            logger$6.warn('Ignoring unsafe attribute mutation: ' + attr);
            return false;
        }
        if (!firstApply) {
            if (el.getAttribute(attr) === mutation['value']) {
                return false;
            }
            el.setAttribute(attr, mutation['value']);
            return true;
        }
        var hadAttr = el.hasAttribute(attr);
        var prev = hadAttr ? el.getAttribute(attr) : null;
        el.setAttribute(attr, mutation['value']);
        this._undoStack.push(function() {
            if (hadAttr) {
                el.setAttribute(attr, prev);
            } else {
                el.removeAttribute(attr);
            }
        });
        return true;
    } else if (type === 'setText') {
        // Replaces the element's text via textContent, not innerHTML: the value is
        // treated as plain text (no markup is parsed, no scripts/handlers run), so
        // this is safe to apply from persisted variants. Covers the editor's
        // text-editing use case without the innerHTML XSS surface.
        if (!firstApply) {
            if (el.textContent !== mutation['value']) {
                el.textContent = mutation['value'];
            }
            return;
        }
        // Retain the actual nodes so undo restores nested elements, their state,
        // and event listeners rather than recreating flattened text or markup.
        var prevChildren = [];
        for (var child = el.firstChild; child; child = child.nextSibling) {
            prevChildren.push(child);
        }
        el.textContent = mutation['value'];
        this._undoStack.push(function() {
            el.textContent = '';
            for (var i = 0; i < prevChildren.length; i++) {
                el.appendChild(prevChildren[i]);
            }
        });
    } else if (type === 'setAttributes') {
        var attrs = mutation['attributes'] || {};
        var wroteAttr = false;
        _.each(attrs, function(value, attrKey) {
            if (this._applyOneToElement({
                'type': 'setAttribute',
                'attribute': attrKey,
                'value': value,
                'selector': mutation['selector']
            }, el, firstApply)) {
                wroteAttr = true;
            }
        }, this);
        return wroteAttr;
    } else if (type === 'setStyle') {
        var prop = mutation['property'];
        if (!firstApply) {
            if (el.style.getPropertyValue(prop) !== mutation['value']) {
                el.style.setProperty(prop, mutation['value']);
            }
            return;
        }
        var prevValue = el.style.getPropertyValue(prop);
        var prevPriority = el.style.getPropertyPriority(prop);
        el.style.setProperty(prop, mutation['value']);
        this._undoStack.push(function() {
            if (prevValue) {
                el.style.setProperty(prop, prevValue, prevPriority);
            } else {
                el.style.removeProperty(prop);
            }
        });
    } else if (type === 'setClasses') {
        var toAdd = mutation['add'] || [];
        var toRemove = mutation['remove'] || [];
        var added = [];
        var removed = [];
        for (var a = 0; a < toAdd.length; a++) {
            if (!el.classList.contains(toAdd[a])) {
                el.classList.add(toAdd[a]);
                added.push(toAdd[a]);
            }
        }
        for (var r = 0; r < toRemove.length; r++) {
            if (el.classList.contains(toRemove[r])) {
                el.classList.remove(toRemove[r]);
                removed.push(toRemove[r]);
            }
        }
        // add/remove above is idempotent (contains-guarded); only record undo once.
        if (firstApply) {
            this._undoStack.push(function() {
                for (var i = 0; i < added.length; i++) {
                    el.classList.remove(added[i]);
                }
                for (var j = 0; j < removed.length; j++) {
                    el.classList.add(removed[j]);
                }
            });
        }
        return added.length > 0 || removed.length > 0;
    } else if (type === 'hide') {
        this._applyOneToElement({
            'type': 'setStyle',
            'property': 'display',
            'value': 'none',
            'selector': mutation['selector']
        }, el, firstApply);
    } else {
        logger$6.warn('Ignoring unsupported mutation type: ' + type);
    }
    return false;
};

// Apply the mutation at the given index to every matched element. New nodes are
// applied for the first time (captured on the undo stack); already-tracked nodes
// are re-applied idempotently so an in-place re-render can't lose the variant.
// Returns whether another pass may now match more (see MAX_APPLY_PASSES).
VisualChangeEngine.prototype._applyOne = function(index) {
    var mutation = this._currentMutations[index];
    if (!mutation || !mutation['type'] || !mutation['selector']) {
        logger$6.warn('Skipping malformed mutation', mutation);
        return false;
    }
    var applied = this._appliedSets[index];
    var els = query(mutation['selector']);
    if (!els || !els.length) {
        return false;
    }
    var passAgain = false;
    for (var i = 0; i < els.length; i++) {
        var el = els[i];
        var firstApply = !applied.has(el);
        if (firstApply) {
            applied.add(el);
            passAgain = true;
        }
        // A first apply that changed the element records an undo entry; skipped
        // (unsafe/unsupported) mutations do not.
        var undoDepth = this._undoStack.length;
        try {
            if (this._applyOneToElement(mutation, el, firstApply)) {
                passAgain = true;
            }
        } catch (err) {
            logger$6.error('Mutation failed for selector ' + mutation['selector'], err);
        }
        if (firstApply && this._undoStack.length > undoDepth) {
            this._queueFirstApply(index);
        }
    }
    return passAgain;
};

VisualChangeEngine.prototype._applyAll = function() {
    for (var pass = 0; pass < MAX_APPLY_PASSES; pass++) {
        var passAgain = false;
        for (var i = 0; i < this._currentMutations.length; i++) {
            if (this._applyOne(i)) {
                passAgain = true;
            }
        }
        if (!passAgain) {
            return;
        }
    }
};

VisualChangeEngine.prototype._queueFirstApply = function(index) {
    if (!this._onFirstApply || this._firstApplyReported[index]) {
        return;
    }
    this._firstApplyReported[index] = true;
    this._pendingFirstApply.push(index);
};

// Deliver queued first-apply reports. Runs after an apply pass completes; the
// callback (exposure tracking, and anything a before_track hook does) may
// revert or replace the set, in which case the remaining reports are stale and
// dropped.
VisualChangeEngine.prototype._flushFirstApply = function() {
    var callback = this._onFirstApply;
    var pending = this._pendingFirstApply;
    this._pendingFirstApply = [];
    for (var i = 0; i < pending.length; i++) {
        if (this._onFirstApply !== callback) {
            return;
        }
        try {
            callback(pending[i]);
        } catch (err) {
            logger$6.error('Visual changes onFirstApply callback failed', err);
        }
    }
};

VisualChangeEngine.prototype._startObserverIfNeeded = function() {
    if (!this._currentMutations.length) {
        return;
    }
    // Flags can settle before <body> exists. Retry on the next frame until it
    // appears, then attach and re-apply; one retry at a time, dropped if reverted.
    if (!win['document'].body) {
        if (this._observerStartPending) {
            return;
        }
        this._observerStartPending = true;
        var pendingSelf = this;
        schedule(function() {
            pendingSelf._observerStartPending = false;
            if (!pendingSelf._currentMutations.length) {
                return;
            }
            pendingSelf._startObserverIfNeeded();
            if (pendingSelf._observer) {
                pendingSelf._reapplyDirty();
            }
        });
        return;
    }
    if (!this._observer) {
        var self = this;
        this._observer = new win['MutationObserver'](function() {
            if (self._reapplyScheduled || !self._currentMutations.length) {
                return;
            }
            self._reapplyScheduled = true;
            schedule(function() {
                self._reapplyScheduled = false;
                self._reapplyDirty();
            });
        });
    }
    // attributes/characterData (not just childList) so an in-place overwrite of a
    // matched node triggers a re-apply. Reconnect after each engine write pass.
    this._observer.observe(win['document'].body, {
        childList: true,
        subtree: true,
        attributes: true,
        characterData: true
    });
};

VisualChangeEngine.prototype._pauseObserver = function() {
    if (this._observer) {
        // Observer notifications arrive asynchronously, so a synchronous
        // "currently mutating" flag cannot filter our writes. Disconnect before
        // writing instead. Pending records can be discarded because apply and
        // reapply query the current DOM for every mutation.
        this._observer.disconnect();
    }
};

VisualChangeEngine.prototype._stopObserverIfIdle = function() {
    if (this._observer && !this._currentMutations.length) {
        this._observer.disconnect();
        this._observer = null;
    }
};

// Re-apply the current set to only the elements that are newly dirty (added or
// re-rendered). No full revert/reapply cycle.
VisualChangeEngine.prototype._reapplyDirty = function() {
    if (!this._currentMutations.length) {
        return;
    }
    this._pauseObserver();
    try {
        this._applyAll();
    } finally {
        this._startObserverIfNeeded();
    }
    this._flushFirstApply();
};

/**
 * Apply an array of typed visual-change mutations to the live DOM. Replaces any
 * prior set: reverts the previous undo stack first, then applies the new list.
 * Safe to call repeatedly; bad selectors are logged and skipped, never thrown.
 * @param {Array<Object>} mutations
 * @param {function(number)} [onFirstApply] called once per mutation index the
 *   first time that mutation changes an element, including later re-applies
 *   triggered by the observer. Not called for mutations that never apply.
 *   Invoked after the apply pass completes, never mid-mutation.
 */
VisualChangeEngine.prototype.applyVisualChanges = function(mutations, onFirstApply) {
    if (!minApisSupported() || !mutations || !mutations.length) {
        return;
    }
    this._pauseObserver();
    try {
        if (this._undoStack.length) {
            this._revertInternal();
        }
        this._currentMutations = mutations.slice();
        this._onFirstApply = onFirstApply || null;
        this._firstApplyReported = [];
        this._pendingFirstApply = [];
        this._appliedSets = [];
        for (var i = 0; i < this._currentMutations.length; i++) {
            this._appliedSets.push(makeTracker());
        }
        this._applyAll();
    } finally {
        this._startObserverIfNeeded();
    }
    this._flushFirstApply();
};

VisualChangeEngine.prototype._revertInternal = function() {
    while (this._undoStack.length) {
        var undoFn = this._undoStack.pop();
        try {
            undoFn();
        } catch (err) {
            logger$6.error('Revert failed', err);
        }
    }
    this._appliedSets = [];
};

/**
 * Undo the last-applied set of visual changes. Idempotent.
 */
VisualChangeEngine.prototype.revertVisualChanges = function() {
    if (!minApisSupported()) {
        return;
    }
    this._pauseObserver();
    try {
        this._revertInternal();
        this._currentMutations = [];
        this._onFirstApply = null;
        this._firstApplyReported = [];
        this._pendingFirstApply = [];
    } finally {
        this._stopObserverIfIdle();
        this._startObserverIfNeeded();
    }
};

safewrapClass(VisualChangeEngine);

/* eslint camelcase: "off" */


var logger$5 = console_with_prefix('visual-experiments');

// Injected once to hide the page while a visual-experiment variant loads. Hiding
// <html> (rather than <body>) works even when the snippet runs before the body
// is parsed, and opacity preserves layout so the reveal is a clean fade-in.
var STYLE_ID = 'mp-antiflicker-style';
var HIDE_CLASS = 'mp-antiflicker-hide';
var HIDE_CSS = 'html.' + HIDE_CLASS + '{opacity:0 !important}';

// Failsafe ceiling on how long the page may stay hidden. Kept short so a slow or
// failed flag delivery never leaves the user staring at a blank page; the real
// reveal normally fires much sooner, as soon as flags settle.
var DEFAULT_TIMEOUT_MS = 2000;

// The hide (one HIDE_CLASS + one <style>) is shared DOM state; named instances
// each own a controller but share it. Reference-count contributors so the last
// one to reveal tears it down — otherwise the first to settle unhides while
// another variant is still pending.
var activeHideCount = 0;

/**
 * Anti-flicker controller for visual experiments. hide() synchronously hides the
 * page (via an injected <style> + a class on <html>) and arms a failsafe timer;
 * reveal() removes the style and class. Both are idempotent and safe outside a
 * browser. State is per-instance so one Mixpanel instance's reveal cannot race
 * another's.
 * @constructor
 * @param {number} [timeoutMs] Failsafe: max time the page stays hidden before an
 *   automatic reveal. Falls back to 2000ms when not a positive number.
 */
var AntiFlickerController = function(timeoutMs) {
    this._timeoutMs = (typeof timeoutMs === 'number' && timeoutMs > 0) ? timeoutMs : DEFAULT_TIMEOUT_MS;
    this._timer = null;
    this._styleEl = null;
    // Whether the page is hidden is derived from the DOM (see _isHidden); only the
    // one-way "revealed" latch — which cannot be read back from the DOM once the
    // class is removed — is tracked as a flag, so we never re-hide after revealing.
    this._revealed = false;
    // Whether this instance currently counts toward activeHideCount.
    this._contributingToHide = false;
};

// Hidden state is a function of the live DOM, not a cached flag.
AntiFlickerController.prototype._isHidden = function() {
    return !!win['document'].documentElement &&
        !!win['document'].documentElement.classList &&
        win['document'].documentElement.classList.contains(HIDE_CLASS);
};

/**
 * Hide the page content. No-op if already hidden/revealed or outside a browser.
 * Starts a failsafe timer that reveals the page even if no variant ever applies.
 */
AntiFlickerController.prototype.hide = function() {
    // Guard on this instance's own state, not _isHidden(): a later instance must
    // still register even when an earlier one already added the class.
    if (!win['document'].documentElement || this._revealed || this._contributingToHide) {
        return;
    }
    var doc = win['document'];
    try {
        // First contributor injects the shared style + class; later ones reuse it.
        if (activeHideCount === 0 && !this._isHidden()) {
            var styleEl = doc.createElement('style');
            styleEl.type = 'text/css';
            styleEl.id = STYLE_ID;
            styleEl.appendChild(doc.createTextNode(HIDE_CSS));
            (doc.head || doc.documentElement).appendChild(styleEl);
            doc.documentElement.classList.add(HIDE_CLASS);
            this._styleEl = styleEl;
        }
        activeHideCount++;
        this._contributingToHide = true;

        var self = this;
        this._timer = win['setTimeout'](function() {
            logger$5.log('Anti-flicker failsafe reached; revealing page');
            self.reveal();
        }, this._timeoutMs);
    } catch (err) {
        logger$5.error('Anti-flicker hide failed', err);
        // Never leave the page hidden because of a failure here.
        this.reveal();
    }
};

/**
 * Reveal the page content (remove the injected style + class) and cancel the
 * failsafe timer. Idempotent and safe to call before hide().
 */
AntiFlickerController.prototype.reveal = function() {
    if (this._revealed) {
        return;
    }
    // Cancel the failsafe first so its callback cannot re-enter reveal mid-run.
    if (this._timer) {
        clearTimeout(this._timer);
        this._timer = null;
    }
    if (!win['document'].documentElement) {
        if (this._contributingToHide) {
            this._contributingToHide = false;
            if (activeHideCount > 0) {
                activeHideCount--;
            }
        }
        this._revealed = true;
        return;
    }
    try {
        // Release this instance's hold; only the last contributor tears down.
        if (this._contributingToHide) {
            this._contributingToHide = false;
            if (activeHideCount > 0) {
                activeHideCount--;
            }
        }
        this._styleEl = null;
        if (activeHideCount === 0) {
            var docEl = win['document'].documentElement;
            if (docEl && docEl.classList) {
                docEl.classList.remove(HIDE_CLASS);
            }
            // By id, not this._styleEl: the last to reveal may not be the injector.
            var styleEl = win['document'].getElementById(STYLE_ID);
            if (styleEl && styleEl.parentNode) {
                styleEl.parentNode.removeChild(styleEl);
            }
        }
        // Latch only once the page is actually shown: if the removal above threw,
        // we leave _revealed false so a later reveal() can retry rather than
        // believing we revealed while the page is still hidden.
        this._revealed = true;
    } catch (err) {
        logger$5.error('Anti-flicker reveal failed', err);
    }
};

safewrapClass(AntiFlickerController);

/* eslint camelcase: "off" */


var logger$4 = console_with_prefix('visual-experiments');

var CONFIG_ENABLED = 'visual_experiments';
var CONFIG_HIDE_TIMEOUT_MS = 'visual_experiments_hide_timeout_ms';

var EMPTY_VARIANTS = { forEach: NOOP_FUNC };

// Upper bound on the length of JSON.stringify(visualChanges) for one variant
// (or one editor preview), measured in UTF-16 code units. Checked per variant
// so one oversized variant cannot block the valid ones delivered alongside it.
var MAX_PAYLOAD_LENGTH = 32 * 1024;

var payloadTooLarge = function(mutations) {
    try {
        return JSON.stringify(mutations).length > MAX_PAYLOAD_LENGTH;
    } catch (err) {
        // Non-serializable payload (cycles, etc.) is not something the engine
        // should touch.
        return true;
    }
};

// Normalize a pathname for comparison: ensure a leading slash and drop a single
// trailing slash (keeping root "/") so "/foo" and "/foo/" are treated as equal.
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

// Compare a persisted page url against the current location by origin + pathname
// (query string and hash ignored). Uses a throwaway anchor to parse robustly
// without assuming URL is available. Returns false when parsing is not possible.
var urlMatchesCurrentPage = function(url) {
    if (!url) {
        return false;
    }
    var loc = win && win['location'];
    var doc = win && win['document'];
    if (!loc || !doc || !doc.createElement) {
        return false;
    }
    var a = doc.createElement('a');
    a.href = url;
    if (a.protocol + '//' + a.host !== loc.protocol + '//' + loc.host) {
        return false;
    }
    return normalizePathname(a.pathname) === normalizePathname(loc.pathname);
};

// A stable key for the current page at the granularity visual-change scoping uses
// (origin + normalized pathname; query/hash ignored). Returns null outside a browser.
var currentPageKey = function() {
    var loc = win && win['location'];
    if (!loc) {
        return null;
    }
    return loc.protocol + '//' + loc.host + normalizePathname(loc.pathname);
};

/**
 * VisualExperimentsManager: delivers visual-experiment variants to the page and
 * hosts the editor's preview session. The flags manager hands it each delivered
 * variant set through onFlagsDelivered; it decides which $mp.visualChanges apply
 * to the current page, drives the engine, and reports exposures back.
 * @constructor
 * @param {Object} options
 * @param {function(string)} options.getConfigFunc
 * @param {function(): Object} [options.getVariantsFunc] current delivered variants
 *   (a Map or any object with forEach), used to replay on navigation and editing
 * @param {function(string, Object)} [options.trackExposureFunc] called with the
 *   flag key and variant the first time a variant is visible on the page
 * @param {Function} [options.applyVisualChangesFunc] engine override for tests
 * @param {Function} [options.revertVisualChangesFunc] engine override for tests
 * @param {Function} [options.onSettledFunc] anti-flicker override for tests
 */
var VisualExperimentsManager = function(options) {
    options = options || {};
    this.getMpConfig = options.getConfigFunc || NOOP_FUNC;
    this.getVariants = options.getVariantsFunc || NOOP_FUNC;
    this.trackExposure = options.trackExposureFunc || NOOP_FUNC;
    this.applyVisualChangesFunc = options.applyVisualChangesFunc || NOOP_FUNC;
    this.revertVisualChangesFunc = options.revertVisualChangesFunc || NOOP_FUNC;
    this.onSettledFunc = options.onSettledFunc || NOOP_FUNC;
    this._settled = false;
    // origin+pathname the set was last (re)applied for, so an SPA navigation that
    // does not change the matched page is a cheap no-op.
    this._lastReplayedPageKey = null;
    // experiment_ids whose delivered changes are withheld because an editor
    // session is authoring them; the live preview is the sole driver.
    this._suppressedExperiments = {};
    // Editor state is separate from delivered flags. The preview is composed
    // with unrelated experiments on every delivery and navigation.
    this._editorSession = null;
    this._editorPreview = null;
    // Bumped by onReset so an engine first-apply report for a set applied under
    // the previous identity is not tracked as the new identity's exposure.
    this._applyGeneration = 0;
};

VisualExperimentsManager.prototype.isEnabled = function() {
    return !!this.getMpConfig(CONFIG_ENABLED);
};

/**
 * Set up the engine, hide the page for anti-flicker, and expose the editor API.
 * No-op unless the visual_experiments init option is enabled. Must run before
 * flag delivery starts so the hide precedes any variant application.
 */
VisualExperimentsManager.prototype.init = function() {
    if (!this.isEnabled() || this._engine) {
        return;
    }
    var engine = this._engine = new VisualChangeEngine();
    this._antiFlicker = new AntiFlickerController(this.getMpConfig(CONFIG_HIDE_TIMEOUT_MS));

    if (this.applyVisualChangesFunc === NOOP_FUNC) {
        this.applyVisualChangesFunc = _.bind(engine.applyVisualChanges, engine);
    }
    if (this.revertVisualChangesFunc === NOOP_FUNC) {
        this.revertVisualChangesFunc = _.bind(engine.revertVisualChanges, engine);
    }
    if (this.onSettledFunc === NOOP_FUNC) {
        this.onSettledFunc = _.bind(this._antiFlicker.reveal, this._antiFlicker);
    }

    // The extension calls this API through its MAIN-world bridge. Quoted keys
    // preserve the public mixpanel.experiments contract through minification.
    this._experimentsApi = {
        'applyVisualChanges': _.bind(this._applyEditorPreview, this),
        'revertVisualChanges': _.bind(this._revertEditorPreview, this),
        'startEditorSession': _.bind(this._startEditorSession, this),
        'endEditorSession': _.bind(this._endEditorSession, this)
    };

    this._antiFlicker.hide();
    this._navTeardown = onLocationChange(_.bind(this.applyForCurrentPage, this));
};

VisualExperimentsManager.prototype.getExperimentsApi = function() {
    return this._experimentsApi;
};

/**
 * A variant set has been delivered (from persistence or the network). Applies the
 * matching visual changes for the current page and reports exposures.
 * @param {Object} flagsMap Map of flag key to variant
 */
VisualExperimentsManager.prototype.onFlagsDelivered = function(flagsMap) {
    if (!flagsMap || !flagsMap.forEach) {
        return;
    }
    this._applyForFlags(flagsMap);
};

/**
 * Flag delivery has finished for this page load, with or without variants.
 * Reveals the page once; later calls are no-ops.
 */
VisualExperimentsManager.prototype.onDeliverySettled = function() {
    if (this._settled) {
        return;
    }
    this._settled = true;
    this.onSettledFunc();
};

/**
 * The visitor identity was reset. Exposure reports still pending from the
 * previous identity's set are discarded, and that identity's changes are
 * cleared rather than left in place until the next delivery arrives.
 */
VisualExperimentsManager.prototype.onReset = function() {
    this._applyGeneration++;
    this._refresh();
};

// Re-run page-scoped replay against the already-delivered variants, without a
// fetch. Deduped so navigating without changing the matched page is a no-op.
VisualExperimentsManager.prototype.applyForCurrentPage = function() {
    var key = currentPageKey();
    if (key !== null && key === this._lastReplayedPageKey) {
        return;
    }
    this._refresh();
};

// Withhold a single experiment's delivered changes while an editor session is
// authoring it, and re-apply the rest at once.
VisualExperimentsManager.prototype.suppressExperiment = function(experimentId) {
    if (!experimentId || this._suppressedExperiments[experimentId]) {
        return;
    }
    this._suppressedExperiments[experimentId] = true;
    this._refresh();
};

VisualExperimentsManager.prototype.unsuppressExperiment = function(experimentId) {
    if (experimentId) {
        delete this._suppressedExperiments[experimentId];
    }
};

VisualExperimentsManager.prototype._applyEditorPreview = function(mutations) {
    if (!_.isArray(mutations)) {
        return;
    }
    this._editorPreview = {
        pageKey: this._editorSession ? this._editorSession.pageKey : currentPageKey(),
        mutations: mutations.slice()
    };
    this._refresh();
};

VisualExperimentsManager.prototype._revertEditorPreview = function() {
    this._editorPreview = null;
    this._refresh();
};

VisualExperimentsManager.prototype._startEditorSession = function(experimentId) {
    var pageKey = currentPageKey();
    // Repeated starts preserve edits only while authoring the same page.
    if (!experimentId || (this._editorSession && this._editorSession.experimentId === experimentId &&
        this._editorSession.pageKey === pageKey)) {
        return;
    }
    if (this._editorSession) {
        this.unsuppressExperiment(this._editorSession.experimentId);
    }
    this._editorSession = { experimentId: experimentId, pageKey: pageKey };
    this._editorPreview = null;
    this.suppressExperiment(experimentId);
};

VisualExperimentsManager.prototype._endEditorSession = function(experimentId) {
    if (!this._editorSession || this._editorSession.experimentId !== experimentId) {
        return;
    }
    this._editorSession = null;
    this._editorPreview = null;
    this.unsuppressExperiment(experimentId);
    this._refresh();
};

// Re-apply against the current delivered variants. Works before any delivery
// (and without the flag-fetch APIs) so the editor is usable standalone.
VisualExperimentsManager.prototype._refresh = function() {
    var variants = this.getVariants();
    this._applyForFlags((variants && variants.forEach) ? variants : EMPTY_VARIANTS);
};

// Aggregate $mp.visualChanges across every variant whose $mp.url matches the
// current page, compose the editor preview, and apply them in a single call.
// Applying per-variant would let the engine's auto-revert wipe an earlier
// variant's changes when a later one has its own set.
VisualExperimentsManager.prototype._applyForFlags = function(flagsMap) {
    var self = this;
    var generation = this._applyGeneration;
    var allVisualChanges = [];
    // Parallel to allVisualChanges: the [flagKey, variant] each mutation came from.
    var mutationSources = [];
    // [flagKey, variant] for variants on this page that carry no mutations: a
    // control arm (or an unedited variant) is exposed by reaching the page.
    var pageExposures = [];
    flagsMap.forEach(function(variant, flagKey) {
        if (variant && self._suppressedExperiments[variant['experiment_id']]) {
            return;
        }
        var value = variant && variant['value'];
        var mp = value && value['$mp'];
        if (!mp) {
            return;
        }
        if (!urlMatchesCurrentPage(mp['url'])) {
            return;
        }
        var visualChanges = mp['visualChanges'];
        if (!visualChanges || !visualChanges.length) {
            // Controls bypass the engine, so check the setting explicitly here.
            // The disabled engine already prevents treatment exposure callbacks.
            if (self.isEnabled()) {
                pageExposures.push([flagKey, variant]);
            }
            return;
        }
        if (payloadTooLarge(visualChanges)) {
            logger$4.error('Ignoring visual changes for ' + flagKey + ' exceeding ' + MAX_PAYLOAD_LENGTH + ' characters');
            return;
        }
        allVisualChanges = allVisualChanges.concat(visualChanges);
        for (var i = 0; i < visualChanges.length; i++) {
            mutationSources.push([flagKey, variant]);
        }
    });
    var preview = this._editorPreview;
    if (preview && preview.pageKey === currentPageKey()) {
        if (payloadTooLarge(preview.mutations)) {
            logger$4.error('Ignoring editor preview exceeding ' + MAX_PAYLOAD_LENGTH + ' characters');
        } else {
            // Preview wins any conflicts with live changes. It has no source entries,
            // so the first-apply callback cannot report preview mutations as exposures.
            allVisualChanges = allVisualChanges.concat(preview.mutations);
        }
    }
    // Each variant is reported once per applied set, however many of its
    // mutations land.
    var reported = [];
    var report = function(source) {
        if (!source || generation !== self._applyGeneration || _.include(reported, source[0])) {
            return;
        }
        reported.push(source[0]);
        try {
            self.trackExposure(source[0], source[1]);
        } catch (err) {
            logger$4.error('Visual exposure tracking failed', err);
        }
    };
    if (allVisualChanges.length) {
        // The engine reports each mutation the first time it actually changes an
        // element (which may be later, once the target renders), so a variant is
        // only counted as exposed once the user can see it.
        this.applyVisualChangesFunc(allVisualChanges, function(mutationIndex) {
            report(mutationSources[mutationIndex]);
        });
    } else {
        // No matching live changes or preview, including an empty control preview:
        // clear the previous set rather than leaving it applied.
        this.revertVisualChangesFunc();
    }
    // A variant with nothing to apply has no first-apply report, so it is tracked
    // as soon as the page is matched. A tracking hook may reset the visitor, which
    // discards that visitor's remaining exposures.
    for (var k = 0; k < pageExposures.length; k++) {
        report(pageExposures[k]);
    }
    this._lastReplayedPageKey = currentPageKey();
    this.onDeliverySettled();
};

safewrapClass(VisualExperimentsManager);

var MIXPANEL_BROWSER_DB_NAME = 'mixpanelBrowserDb';
var RECORDING_EVENTS_STORE_NAME = 'mixpanelRecordingEvents';
var RECORDING_REGISTRY_STORE_NAME = 'mixpanelRecordingRegistry';

// Keeping these two properties closeby, as adding additional stores to a DB in IndexedDB requires a version increment
var RECORDER_VERSION_DATA = {
    version: 1,
    storeNames: [RECORDING_EVENTS_STORE_NAME, RECORDING_REGISTRY_STORE_NAME]
};

/**
 * @param {import('./session-recording').SerializedRecording} serializedRecording
 * @returns {boolean}
 */
var isRecordingExpired = function(serializedRecording) {
    var now = Date.now();
    return !serializedRecording || now > serializedRecording['maxExpires'] || now > serializedRecording['idleExpires'];
};

var validateAllowedOrigins = function(origins, logger) {
    if (!_.isArray(origins)) {
        if (origins) {
            logger.critical('record_allowed_iframe_origins must be an array of origin strings, cross-origin recording will be disabled.');
        }
        return [];
    }
    var valid = [];
    for (var i = 0; i < origins.length; i++) {
        try {
            var origin = new URL(origins[i]).origin;
            if (origin === 'null') {
                logger.critical(origins[i] + ' has an opaque origin. Skipping this entry.');
                continue;
            }
            valid.push(origin);
        } catch (e) {
            logger.critical(origins[i] + ' is not a valid origin URL. Skipping this entry.');
        }
    }
    return valid;
};

/* eslint camelcase: "off" */


var logger$3 = console_with_prefix('recorder');

var IFRAME_HANDSHAKE_REQUEST  = 'mp_iframe_handshake_request';
var IFRAME_HANDSHAKE_RESPONSE = 'mp_iframe_handshake_response';


/**
 * RecorderManager: manages session recording initialization, lifecycle and state
 * @constructor
 */
var RecorderManager = function(initOptions) {
    // TODO - Passing in mixpanel instance as it is still needed for recorder creation
    // but ideally we should be able to remove this dependency.
    this.mixpanelInstance = initOptions.mixpanelInstance;

    this.getMpConfig = initOptions.getConfigFunc;
    this.getTabId = initOptions.getTabIdFunc;
    this.reportError = initOptions.reportErrorFunc;
    this.getDistinctId = initOptions.getDistinctIdFunc;
    // recording stores the session before it sends it
    this.consentGate = initOptions.consentGate;
    this.loadExtraBundle = initOptions.loadExtraBundle;
    this.recorderSrc = initOptions.recorderSrc;
    this.targetingSrc = initOptions.targetingSrc;
    this.libBasePath = initOptions.libBasePath;

    this._recorder = null;
    this._parentReplayId = null;
    this._parentFrameRetryInterval = null;
};

RecorderManager.prototype.shouldLoadRecorder = function() {
    if (!this.consentGate.allowsPersistence()) {
        console.log('Load recorder check skipped without persistence');
        return PromisePolyfill.resolve(false);
    }

    var recording_registry_idb = new IDBStorageWrapper(MIXPANEL_BROWSER_DB_NAME, RECORDING_REGISTRY_STORE_NAME, RECORDER_VERSION_DATA);
    var tab_id = this.getTabId();
    return recording_registry_idb.init()
        .then(function () {
            return recording_registry_idb.getAll();
        })
        .then(function (recordings) {
            for (var i = 0; i < recordings.length; i++) {
                // if there are expired recordings in the registry, we should load the recorder to flush them
                // if there's a recording for this tab id, we should load the recorder to continue the recording
                if (isRecordingExpired(recordings[i]) || recordings[i]['tabId'] === tab_id) {
                    return true;
                }
            }
            return false;
        })
        .catch(_.bind(function (err) {
            this.reportError('Error checking recording registry', err);
            return false;
        }, this));
};

RecorderManager.prototype.checkAndStartSessionRecording = function(force_start, rate) {
    if (!this.consentGate.allowsStoring()) {
        console.log('Session recording skipped without consent');
        return PromisePolyfill.resolve();
    }
    if (!win['MutationObserver']) {
        console.critical('Browser does not support MutationObserver; skipping session recording');
        return PromisePolyfill.resolve();
    }
    if (_.getPreviewToken()) {
        console.log('Session recording skipped on a visual experiment preview page');
        return PromisePolyfill.resolve();
    }

    var loadRecorder = _.bind(function(startNewIfInactive) {
        return new PromisePolyfill(_.bind(function(resolve) {
            var handleLoadedRecorder = safewrap(_.bind(function() {
                // consent can be withdrawn while the bundle loads
                if (!this.consentGate.allowsStoring()) {
                    resolve();
                    return;
                }
                this._recorder = this._recorder || new win[RECORDER_GLOBAL_NAME](this.mixpanelInstance);
                this._recorder['resumeRecording'](startNewIfInactive);
                resolve();
            }, this));

            if (_.isUndefined(win[RECORDER_GLOBAL_NAME])) {
                var recorderSrc = this.recorderSrc || (this.libBasePath + RECORDER_FILENAME);
                this.loadExtraBundle(recorderSrc, handleLoadedRecorder);
            } else {
                handleLoadedRecorder();
            }
        }, this));
    }, this);

    // Cross-origin iframe handling
    var allowedOrigins = validateAllowedOrigins(this.getMpConfig('record_allowed_iframe_origins'), logger$3);
    var isCrossOriginRecordingEnabled = allowedOrigins.length > 0;

    if (isCrossOriginRecordingEnabled) {
        // listen for handshake requests from their own child iframes (including nested)
        this._setupParentFrameListener(allowedOrigins);

        if (win.parent !== win) {
            // also wait for parent's replay ID
            this._setupChildFrameListener(allowedOrigins, loadRecorder);
            this._sendParentFrameRequestWithRetry(allowedOrigins);
            return PromisePolyfill.resolve();
        }
    }

    /**
     * If the user is sampled or start_session_recording is called, we always load the recorder since it's guaranteed a recording should start.
     * Otherwise, if the recording registry has any records then it's likely there's a recording in progress or orphaned data that needs to be flushed.
     */
    var effective_rate = _.isUndefined(rate) ? this.getMpConfig('record_sessions_percent') : rate;
    var is_sampled = effective_rate > 0 && Math.random() * 100 <= effective_rate;
    if (force_start || is_sampled) {
        return loadRecorder(true);
    } else {
        return this.shouldLoadRecorder()
            .then(_.bind(function (shouldLoad) {
                if (shouldLoad) {
                    return loadRecorder(false);
                }
                return PromisePolyfill.resolve();
            }, this));
    }
};

RecorderManager.prototype.isRecording = function() {
    // Safety check: ensure isRecording method exists (older CDN builds may not have it)
    if (!this._recorder || !_.isFunction(this._recorder['isRecording'])) {
        return false;
    }
    try {
        return this._recorder['isRecording']();
    } catch (e) {
        this.reportError('Error checking if recording is active', e);
        return false;
    }
};

RecorderManager.prototype.startRecordingOnEvent = function(event_name, properties) {
    var isRecording = this.isRecording();
    var recordingTriggerEvents = this.getMpConfig('recording_event_triggers');

    if (!isRecording && recordingTriggerEvents) {
        var trigger = recordingTriggerEvents[event_name];
        if (trigger && typeof trigger['percentage'] === 'number') {
            var newRate = trigger['percentage'];
            var propertyFilters = trigger['property_filters'];
            if (propertyFilters && !_.isEmptyObject(propertyFilters)) {
                var targetingSrc = this.targetingSrc || (this.libBasePath + TARGETING_FILENAME);
                getTargetingPromise(this.loadExtraBundle, targetingSrc)
                    .then(function(targeting) {
                        try {
                            var result = targeting['eventMatchesCriteria'](
                                event_name,
                                properties,
                                {
                                    'event_name': event_name,
                                    'property_filters': propertyFilters
                                }
                            );
                            if (result['matches']) {
                                this.checkAndStartSessionRecording(false, newRate);
                            }
                        } catch (err) {
                            console.critical('Could not parse recording event trigger properties logic:', err);
                        }
                    }.bind(this)).catch(function(err) {
                        console.critical('Failed to load targeting library:', err);
                    });
            } else {
                this.checkAndStartSessionRecording(false, newRate);
            }
        }
    }
};

RecorderManager.prototype.stopSessionRecording = function() {
    if (this._recorder) {
        return this._recorder['stopRecording']();
    }
    return PromisePolyfill.resolve();
};

RecorderManager.prototype.pauseSessionRecording = function() {
    if (this._recorder) {
        return this._recorder['pauseRecording']();
    }
    return PromisePolyfill.resolve();
};

RecorderManager.prototype.resumeSessionRecording = function() {
    if (this._recorder) {
        return this._recorder['resumeRecording']();
    }
    return PromisePolyfill.resolve();
};

RecorderManager.prototype.isRecordingHeatmapData = function() {
    return this.getSessionReplayId() && this.getMpConfig('record_heatmap_data');
};

RecorderManager.prototype.getSessionRecordingProperties = function() {
    var props = {};
    var replay_id = this.getSessionReplayId();
    if (replay_id) {
        props['$mp_replay_id'] = replay_id;
    }
    return props;
};

RecorderManager.prototype.getSessionReplayUrl = function() {
    var replay_url = null;
    var replay_id = this.getSessionReplayId();
    if (replay_id) {
        var query_params = _.HTTPBuildQuery({
            'replay_id': replay_id,
            'distinct_id': this.getDistinctId(),
            'token': this.getMpConfig('token')
        });
        replay_url = 'https://mixpanel.com/projects/replay-redirect?' + query_params;
    }
    return replay_url;
};

RecorderManager.prototype.getSessionReplayId = function() {
    // Child iframe uses parent's replay ID
    if (this._parentReplayId) {
        return this._parentReplayId;
    }
    var replay_id = null;
    if (this._recorder) {
        replay_id = this._recorder['replayId'];
    }
    return replay_id || null;
};

// "private" public method to reach into the recorder in test cases
RecorderManager.prototype.getRecorder = function() {
    return this._recorder;
};

RecorderManager.prototype._setupChildFrameListener = function(allowedOrigins, loadRecorder) {
    if (this._childFrameMessageHandler) {
        return;
    }
    var self = this;
    this._childFrameMessageHandler = function(event) {
        if (allowedOrigins.indexOf(event.origin) === -1) return;
        var data = event.data;
        if (data && data['type'] === IFRAME_HANDSHAKE_RESPONSE && data['token'] === self.getMpConfig('token') && data['replayId']) {
            self._parentReplayId = data['replayId'];
            if (data['distinctId']) {
                self.mixpanelInstance['identify'](data['distinctId']);
            }
            self._parentFrameRetryActive = false;
            win.removeEventListener('message', self._childFrameMessageHandler);
            self._childFrameMessageHandler = null;
            loadRecorder(true);
        }
    };
    win.addEventListener('message', this._childFrameMessageHandler);
};

RecorderManager.prototype._sendParentFrameRequest = function(allowedOrigins) {
    var message = {};
    message['type'] = IFRAME_HANDSHAKE_REQUEST;
    message['token'] = this.getMpConfig('token');
    for (var i = 0; i < allowedOrigins.length; i++) {
        try {
            win.parent.postMessage(message, allowedOrigins[i]);
        } catch (e) {
            // origin mismatch - ignore
        }
    }
};

RecorderManager.prototype._sendParentFrameRequestWithRetry = function(allowedOrigins) {
    var self = this;
    var maxRetries = 10;
    var retryCount = 0;
    var delay = 50;
    this._parentFrameRetryActive = true;

    this._sendParentFrameRequest(allowedOrigins);

    function scheduleRetry() {
        setTimeout(function() {
            if (!self._parentFrameRetryActive || self._parentReplayId || ++retryCount >= maxRetries) {
                return;
            }
            self._sendParentFrameRequest(allowedOrigins);
            delay *= 2;
            scheduleRetry();
        }, delay);
    }
    scheduleRetry();
};

RecorderManager.prototype._setupParentFrameListener = function(allowedOrigins) {
    if (this._parentFrameMessageHandler) {
        return;
    }
    var self = this;
    this._parentFrameMessageHandler = function(event) {
        if (allowedOrigins.indexOf(event.origin) === -1) return;
        var data = event.data;
        if (data && data['type'] === IFRAME_HANDSHAKE_REQUEST && data['token'] === self.getMpConfig('token')) {
            var replayId = self.getSessionReplayId();
            if (replayId) {
                var response = {};
                response['type'] = IFRAME_HANDSHAKE_RESPONSE;
                response['token'] = self.getMpConfig('token');
                response['replayId'] = replayId;
                response['distinctId'] = self.getDistinctId();
                event.source.postMessage(response, event.origin);
            }
        }
    };
    win.addEventListener('message', this._parentFrameMessageHandler);
};

safewrapClass(RecorderManager);

/* eslint camelcase: "off" */


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
            win.setTimeout(that.track_callback(user_callback, props, options, true), timeout);

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
    if (options.new_tab || !options.href) { return; }

    setTimeout(function() {
        win.location = options.href;
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
    this.storage = options.storage || getLocalStorage();
    this.pollIntervalMS = options.pollIntervalMS || 100;
    this.timeoutMS = options.timeoutMS || 2000;

    // dependency-inject promise implementation for testing purposes
    this.promiseImpl = options.promiseImpl || PromisePolyfill;
};

// pass in a specific pid to test contention scenarios; otherwise
// it is chosen randomly for each acquisition attempt
SharedLock.prototype.withLock = function(lockedCB, pid) {
    var Promise = this.promiseImpl;
    return new Promise(_.bind(function (resolve, reject) {
        var i = pid || (new Date().getTime() + '|' + Math.random());
        var startTime = new Date().getTime();
        var key = this.storageKey;
        var pollIntervalMS = this.pollIntervalMS;
        var timeoutMS = this.timeoutMS;
        var storage = this.storage;

        var keyX = key + ':X';
        var keyY = key + ':Y';
        var keyZ = key + ':Z';

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
                    reject(err);
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
                        reject(new Error('localStorage support dropped while acquiring lock'));
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
            var removeLock = function () {
                storage.removeItem(keyZ);
                if (storage.getItem(keyY) === i) {
                    storage.removeItem(keyY);
                }
                if (storage.getItem(keyX) === i) {
                    storage.removeItem(keyX);
                }
            };

            lockedCB()
                .then(function (ret) {
                    removeLock();
                    resolve(ret);
                })
                .catch(function (err) {
                    removeLock();
                    reject(err);
                });
        };

        try {
            if (localStorageSupported(storage, true)) {
                loop();
            } else {
                throw new Error('localStorage support check failed');
            }
        } catch(err) {
            reject(err);
        }
    }, this));
};

/**
 * @type {import('./wrapper').StorageWrapper}
 */
var LocalStorageWrapper = function (storageOverride) {
    this.storage = storageOverride || getLocalStorage();
};

LocalStorageWrapper.prototype.init = function () {
    if (!this.storage) {
        return PromisePolyfill.reject(new Error('localStorage is not available'));
    }
    return PromisePolyfill.resolve();
};

LocalStorageWrapper.prototype.isInitialized = function () {
    return true;
};

LocalStorageWrapper.prototype.setItem = function (key, value) {
    return new PromisePolyfill(_.bind(function (resolve, reject) {
        try {
            this.storage.setItem(key, JSONStringify(value));
        } catch (e) {
            reject(e);
        }
        resolve();
    }, this));
};

LocalStorageWrapper.prototype.getItem = function (key) {
    return new PromisePolyfill(_.bind(function (resolve, reject) {
        var item;
        try {
            item = JSONParse(this.storage.getItem(key));
        } catch (e) {
            reject(e);
        }
        resolve(item);
    }, this));
};

LocalStorageWrapper.prototype.removeItem = function (key) {
    return new PromisePolyfill(_.bind(function (resolve, reject) {
        try {
            this.storage.removeItem(key);
        } catch (e) {
            reject(e);
        }
        resolve();
    }, this));
};

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
var RequestQueue = function (storageKey, options) {
    options = options || {};
    this.storageKey = storageKey;
    this.usePersistence = options.usePersistence;
    if (this.usePersistence) {
        this.queueStorage = options.queueStorage || new LocalStorageWrapper();
        this.lock = new SharedLock(storageKey, {
            storage: options.sharedLockStorage,
            timeoutMS: options.sharedLockTimeoutMS,
        });
    }
    this.reportError = options.errorReporter || _.bind(logger$1.error, logger$1);
    this.consentGate = options.consentGate;

    this.pid = options.pid || null; // pass pid to test out storage lock contention scenarios

    this.memQueue = [];
    this.initialized = false;

    if (options.enqueueThrottleMs) {
        this.enqueuePersisted = batchedThrottle(_.bind(this._enqueuePersisted, this), options.enqueueThrottleMs);
    } else {
        this.enqueuePersisted = _.bind(function (queueEntry) {
            return this._enqueuePersisted([queueEntry]);
        }, this);
    }
};

RequestQueue.prototype.ensureInit = function () {
    if (this.initialized || !this.usePersistence) {
        return PromisePolyfill.resolve();
    }

    return this.queueStorage
        .init()
        .then(_.bind(function () {
            this.initialized = true;
        }, this))
        .catch(_.bind(function (err) {
            this.reportError('Error initializing queue persistence. Disabling persistence', err);
            this.initialized = true;
            this.usePersistence = false;
        }, this));
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
RequestQueue.prototype.enqueue = function (item, flushInterval) {
    var queueEntry = {
        'id': cheap_guid(),
        'flushAfter': new Date().getTime() + flushInterval * 2,
        'payload': item
    };

    if (!this._persists()) {
        this.memQueue.push(queueEntry);
        return PromisePolyfill.resolve(true);
    } else {
        return this.enqueuePersisted(queueEntry);
    }
};

/**
 * Whether the queue is kept in storage now: with persistence, and while consent allows storing.
 * The lock writes storage keys too, so nothing that takes it runs without this.
 * @returns {boolean}
 */
RequestQueue.prototype._persists = function () {
    return this.usePersistence && this.consentGate.allowsStoring();
};

RequestQueue.prototype._enqueuePersisted = function (queueEntries) {
    // a throttled enqueue can run after consent stops storage; its items are dropped
    if (!this._persists()) {
        return PromisePolyfill.resolve(false);
    }
    var enqueueItem = _.bind(function () {
        return this.ensureInit()
            .then(_.bind(function () {
                return this.readFromStorage();
            }, this))
            .then(_.bind(function (storedQueue) {
                return this.saveToStorage(storedQueue.concat(queueEntries));
            }, this))
            .then(_.bind(function (succeeded) {
                // only add to in-memory queue when storage succeeds
                if (succeeded) {
                    this.memQueue = this.memQueue.concat(queueEntries);
                }

                return succeeded;
            }, this))
            .catch(_.bind(function (err) {
                this.reportError('Error enqueueing items', err, queueEntries);
                return false;
            }, this));
    }, this);

    return this.lock
        .withLock(enqueueItem, this.pid)
        .catch(_.bind(function (err) {
            this.reportError('Error acquiring storage lock', err);
            return false;
        }, this));
};

/**
 * Read out the given number of queue entries. If this.memQueue
 * has fewer than batchSize items, then look for "orphaned" items
 * in the persisted queue (items where the 'flushAfter' time has
 * already passed).
 */
RequestQueue.prototype.fillBatch = function (batchSize) {
    var batch = this.memQueue.slice(0, batchSize);
    if (this.usePersistence && batch.length < batchSize) {
        // don't need lock just to read events; localStorage is thread-safe
        // and the worst that could happen is a duplicate send of some
        // orphaned events, which will be deduplicated on the server side
        return this.ensureInit()
            .then(_.bind(function () {
                return this.readFromStorage();
            }, this))
            .then(_.bind(function (storedQueue) {
                if (storedQueue.length) {
                    // item IDs already in batch; don't duplicate out of storage
                    var idsInBatch = {}; // poor man's Set
                    _.each(batch, function (item) {
                        idsInBatch[item['id']] = true;
                    });

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

                return batch;
            }, this));
    } else {
        return PromisePolyfill.resolve(batch);
    }
};

/**
 * Remove items with matching 'id' from array (immutably)
 * also remove any item without a valid id (e.g., malformed
 * storage entries).
 */
var filterOutIDsAndInvalid = function (items, idSet) {
    var filteredItems = [];
    _.each(items, function (item) {
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
RequestQueue.prototype.removeItemsByID = function (ids) {
    var idSet = {}; // poor man's Set
    _.each(ids, function (id) {
        idSet[id] = true;
    });

    this.memQueue = filterOutIDsAndInvalid(this.memQueue, idSet);
    if (!this._persists()) {
        return PromisePolyfill.resolve(true);
    } else {
        var removeFromStorage = _.bind(function () {
            return this.ensureInit()
                .then(_.bind(function () {
                    return this.readFromStorage();
                }, this))
                .then(_.bind(function (storedQueue) {
                    storedQueue = filterOutIDsAndInvalid(storedQueue, idSet);
                    return this.saveToStorage(storedQueue);
                }, this))
                .then(_.bind(function () {
                    return this.readFromStorage();
                }, this))
                .then(_.bind(function (storedQueue) {
                    // an extra check: did storage report success but somehow
                    // the items are still there?
                    for (var i = 0; i < storedQueue.length; i++) {
                        var item = storedQueue[i];
                        if (item['id'] && !!idSet[item['id']]) {
                            throw new Error('Item not removed from storage');
                        }
                    }
                    return true;
                }, this))
                .catch(_.bind(function (err) {
                    this.reportError('Error removing items', err, ids);
                    return false;
                }, this));
        }, this);

        return this.lock
            .withLock(removeFromStorage, this.pid)
            .catch(_.bind(function (err) {
                this.reportError('Error acquiring storage lock', err);
                if (!localStorageSupported(this.lock.storage, true)) {
                    // Looks like localStorage writes have stopped working sometime after
                    // initialization (probably full), and so nobody can acquire locks
                    // anymore. Consider it temporarily safe to remove items without the
                    // lock, since nobody's writing successfully anyway.
                    return removeFromStorage()
                        .then(_.bind(function (success) {
                            if (!success) {
                                // OK, we couldn't even write out the smaller queue. Try clearing it
                                // entirely.
                                return this.queueStorage.removeItem(this.storageKey).then(function () {
                                    return success;
                                });
                            }
                            return success;
                        }, this))
                        .catch(_.bind(function (err) {
                            this.reportError('Error clearing queue', err);
                            return false;
                        }, this));
                } else {
                    return false;
                }
            }, this));
    }
};

// internal helper for RequestQueue.updatePayloads
var updatePayloads = function (existingItems, itemsToUpdate) {
    var newItems = [];
    _.each(existingItems, function (item) {
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
RequestQueue.prototype.updatePayloads = function (itemsToUpdate) {
    this.memQueue = updatePayloads(this.memQueue, itemsToUpdate);
    if (!this._persists()) {
        return PromisePolyfill.resolve(true);
    } else {
        return this.lock
            .withLock(_.bind(function lockAcquired() {
                return this.ensureInit()
                    .then(_.bind(function () {
                        return this.readFromStorage();
                    }, this))
                    .then(_.bind(function (storedQueue) {
                        storedQueue = updatePayloads(storedQueue, itemsToUpdate);
                        return this.saveToStorage(storedQueue);
                    }, this))
                    .catch(_.bind(function (err) {
                        this.reportError('Error updating items', itemsToUpdate, err);
                        return false;
                    }, this));
            }, this), this.pid)
            .catch(_.bind(function (err) {
                this.reportError('Error acquiring storage lock', err);
                return false;
            }, this));
    }
};

/**
 * Read and parse items array from localStorage entry, handling
 * malformed/missing data if necessary.
 */
RequestQueue.prototype.readFromStorage = function () {
    return this.ensureInit()
        .then(_.bind(function () {
            return this.queueStorage.getItem(this.storageKey);
        }, this))
        .then(_.bind(function (storageEntry) {
            if (storageEntry) {
                if (!_.isArray(storageEntry)) {
                    this.reportError('Invalid storage entry:', storageEntry);
                    storageEntry = null;
                }
            }
            return storageEntry || [];
        }, this))
        .catch(_.bind(function (err) {
            this.reportError('Error retrieving queue', err);
            return [];
        }, this));
};

/**
 * Serialize the given items array to localStorage.
 */
RequestQueue.prototype.saveToStorage = function (queue) {
    return this.ensureInit()
        .then(_.bind(function () {
            // a save that started before consent stopped storage writes nothing
            if (!this._persists()) {
                return false;
            }
            return this.queueStorage.setItem(this.storageKey, queue).then(function () {
                return true;
            });
        }, this))
        .catch(_.bind(function (err) {
            this.reportError('Error saving queue', err);
            return false;
        }, this));
};

/**
 * Clear out queues (memory and localStorage).
 */
RequestQueue.prototype.clear = function () {
    this.memQueue = [];

    if (this.usePersistence) {
        return this.ensureInit()
            .then(_.bind(function () {
                return this.queueStorage.removeItem(this.storageKey);
            }, this))
            .catch(_.bind(function (err) {
                this.reportError('Error clearing queue', err);
            }, this));
    } else {
        return PromisePolyfill.resolve();
    }
};

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
        queueStorage: options.queueStorage,
        sharedLockStorage: options.sharedLockStorage,
        sharedLockTimeoutMS: options.sharedLockTimeoutMS,
        usePersistence: options.usePersistence,
        enqueueThrottleMs: options.enqueueThrottleMs,
        consentGate: options.consentGate
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

    // Make the flush occur at the interval specified by flushIntervalMs, default behavior will attempt consecutive flushes
    // as long as the queue is not empty. This is useful for high-frequency events like Session Replay where we might end up
    // in a request loop and get ratelimited by the server.
    this.flushOnlyOnInterval = options.flushOnlyOnInterval || false;

    this._flushPromise = null;
};

/**
 * Add one item to queue.
 */
RequestBatcher.prototype.enqueue = function(item) {
    return this.queue.enqueue(item, this.flushInterval);
};

/**
 * Start flushing batches at the configured time interval. Must call
 * this method upon SDK init in order to send anything over the network.
 */
RequestBatcher.prototype.start = function() {
    this.stopped = false;
    this.consecutiveRemovalFailures = 0;
    return this.flush();
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
    return this.queue.clear();
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
        this.timeoutID = setTimeout(_.bind(function() {
            if (!this.stopped) {
                this._flushPromise = this.flush();
            }
        }, this), this.flushInterval);
    }
};

/**
 * Send a request using the sendRequest callback, but promisified.
 * TODO: sendRequest should be promisified in the first place.
 */
RequestBatcher.prototype.sendRequestPromise = function(data, options) {
    return new PromisePolyfill(_.bind(function(resolve) {
        this.sendRequest(data, options, resolve);
    }, this));
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
    if (this.requestInProgress) {
        logger.log('Flush: Request already in progress');
        return PromisePolyfill.resolve();
    }

    this.requestInProgress = true;

    options = options || {};
    var timeoutMS = this.libConfig['batch_request_timeout_ms'];
    var startTime = new Date().getTime();
    var currentBatchSize = this.batchSize;

    return this.queue.fillBatch(currentBatchSize)
        .then(_.bind(function(batch) {

            // if there's more items in the queue than the batch size, attempt
            // to flush again after the current batch is done.
            var attemptSecondaryFlush = batch.length === currentBatchSize;
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
                this.requestInProgress = false;
                this.resetFlush();
                return PromisePolyfill.resolve(); // nothing to do
            }

            var removeItemsFromQueue = _.bind(function () {
                return this.queue
                    .removeItemsByID(
                        _.map(batch, function (item) {
                            return item['id'];
                        })
                    )
                    .then(_.bind(function (succeeded) {
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

                        if (succeeded) {
                            this.consecutiveRemovalFailures = 0;
                            if (this.flushOnlyOnInterval && !attemptSecondaryFlush) {
                                this.resetFlush(); // schedule next batch with a delay
                                return PromisePolyfill.resolve();
                            } else {
                                return this.flush(); // handle next batch if the queue isn't empty
                            }
                        } else {
                            if (++this.consecutiveRemovalFailures > 5) {
                                this.reportError('Too many queue failures; disabling batching system.');
                                this.stopAllBatching();
                            } else {
                                this.resetFlush();
                            }
                            return PromisePolyfill.resolve();
                        }
                    }, this));
            }, this);

            var batchSendCallback = _.bind(function(res) {
                this.requestInProgress = false;

                try {

                    // handle API response in a try-catch to make sure we can reset the
                    // flush operation if something goes wrong

                    if (options.unloading) {
                        // update persisted data to include hook transformations
                        return this.queue.updatePayloads(transformedItems);
                    } else if (
                        _.isObject(res) &&
                            res.error === 'timeout' &&
                            new Date().getTime() - startTime >= timeoutMS
                    ) {
                        this.reportError('Network timeout; retrying');
                        return this.flush();
                    } else if (
                        _.isObject(res) &&
                            (
                                res.httpStatusCode >= 500
                                || res.httpStatusCode === 429
                                || (res.httpStatusCode <= 0 && !isOnline())
                                || res.error === 'timeout'
                            )
                    ) {
                        // network or API error, or 429 Too Many Requests, retry
                        var retryMS = this.flushInterval * 2;
                        if (res.retryAfter) {
                            retryMS = (parseInt(res.retryAfter, 10) * 1000) || retryMS;
                        }
                        retryMS = Math.min(MAX_RETRY_INTERVAL_MS, retryMS);
                        this.reportError('Error; retry in ' + retryMS + ' ms');
                        this.scheduleFlush(retryMS);
                        return PromisePolyfill.resolve();
                    } else if (_.isObject(res) && res.httpStatusCode === 413) {
                        // 413 Payload Too Large
                        if (batch.length > 1) {
                            var halvedBatchSize = Math.max(1, Math.floor(currentBatchSize / 2));
                            this.batchSize = Math.min(this.batchSize, halvedBatchSize, batch.length - 1);
                            this.reportError('413 response; reducing batch size to ' + this.batchSize);
                            this.resetFlush();
                            return PromisePolyfill.resolve();
                        } else {
                            this.reportError('Single-event request too large; dropping', batch);
                            this.resetBatchSize();
                            return removeItemsFromQueue();
                        }
                    } else {
                        // successful network request+response; remove each item in batch from queue
                        // (even if it was e.g. a 400, in which case retrying won't help)
                        return removeItemsFromQueue();
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
            return this.sendRequestPromise(dataForRequest, requestOptions).then(batchSendCallback);
        }, this))
        .catch(_.bind(function(err) {
            this.reportError('Error flushing request queue', err);
            this.resetFlush();
        }, this));
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

/* eslint camelcase: "off" */


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

/* eslint camelcase: "off" */

/**
 * Mixpanel Group Object
 * @class
 */
function MixpanelGroup() {}

_.extend(MixpanelGroup.prototype, apiActions);

/**
 * @param {Object} mixpanel_instance
 * @param {string} group_key
 * @param {*} group_id
 * @param {import('./consent-gate').ConsentGate} consentGate
 */
MixpanelGroup.prototype._init = function(mixpanel_instance, group_key, group_id, consentGate) {
    this._mixpanel = mixpanel_instance;
    this._group_key = group_key;
    this._group_id = group_id;
    this.consentGate = consentGate;
};

/**
 * Set properties on a group.
 *
 * @example
 * ```js
 * mixpanel.get_group('company', 'mixpanel').set('Location', '405 Howard');
 *
 * // or set multiple properties at once
 * mixpanel.get_group('company', 'mixpanel').set({
 *      'Location': '405 Howard',
 *      'Founded' : 2009,
 * });
 * // properties can be strings, integers, dates, or lists
 * ```
 *
 * @param {Object|String} prop If a string, this is the name of the property. If an object, this is an associative array of names and values.
 * @param {*} [to] A value to set on the given property name
 * @param {Function} [callback] If provided, the callback will be called after the tracking event
 */
MixpanelGroup.prototype.set = function(prop, to, callback) {
    if (_.isObject(prop)) {
        callback = to;
    }
    if (!this.consentGate.allowsApiCalls()) {
        if (_.isFunction(callback)) {
            callback(0);
        }
        return;
    }
    var data = this.set_action(prop, to);
    return this._send_request(data, callback);
};

/**
 * Set properties on a group, only if they do not yet exist.
 * This will not overwrite previous group property values, unlike
 * group.set().
 *
 * @example
 * ```js
 * mixpanel.get_group('company', 'mixpanel').set_once('Location', '405 Howard');
 *
 * // or set multiple properties at once
 * mixpanel.get_group('company', 'mixpanel').set_once({
 *      'Location': '405 Howard',
 *      'Founded' : 2009,
 * });
 * // properties can be strings, integers, lists or dates
 * ```
 *
 * @param {Object|String} prop If a string, this is the name of the property. If an object, this is an associative array of names and values.
 * @param {*} [to] A value to set on the given property name
 * @param {Function} [callback] If provided, the callback will be called after the tracking event
 */
MixpanelGroup.prototype.set_once = function(prop, to, callback) {
    if (_.isObject(prop)) {
        callback = to;
    }
    if (!this.consentGate.allowsApiCalls()) {
        if (_.isFunction(callback)) {
            callback(0);
        }
        return;
    }
    var data = this.set_once_action(prop, to);
    return this._send_request(data, callback);
};

/**
 * Unset properties on a group permanently.
 *
 * @example
 * ```js
 * mixpanel.get_group('company', 'mixpanel').unset('Founded');
 * ```
 *
 * @param {String} prop The name of the property.
 * @param {Function} [callback] If provided, the callback will be called after the tracking event
 */
MixpanelGroup.prototype.unset = function(prop, callback) {
    if (!this.consentGate.allowsApiCalls()) {
        if (_.isFunction(callback)) {
            callback(0);
        }
        return;
    }
    var data = this.unset_action(prop);
    return this._send_request(data, callback);
};

/**
 * Merge a given list with a list-valued group property, excluding duplicate values.
 *
 * @example
 * ```js
 * // merge a value to a list, creating it if needed
 * mixpanel.get_group('company', 'mixpanel').union('Location', ['San Francisco', 'London']);
 * ```
 *
 * @param {String} list_name Name of the property.
 * @param {Array} values Values to merge with the given property
 * @param {Function} [callback] If provided, the callback will be called after the tracking event
 */
MixpanelGroup.prototype.union = function(list_name, values, callback) {
    if (_.isObject(list_name)) {
        callback = values;
    }
    if (!this.consentGate.allowsApiCalls()) {
        if (_.isFunction(callback)) {
            callback(0);
        }
        return;
    }
    var data = this.union_action(list_name, values);
    return this._send_request(data, callback);
};

/**
 * Permanently delete a group.
 *
 * @example
 * ```js
 * mixpanel.get_group('company', 'mixpanel').delete();
 * ```
 *
 * @param {Function} [callback] If provided, the callback will be called after the tracking event
 */
MixpanelGroup.prototype['delete'] = function(callback) {
    if (!this.consentGate.allowsApiCalls()) {
        if (_.isFunction(callback)) {
            callback(0);
        }
        return;
    }
    // bracket notation above prevents a minification error related to reserved words
    var data = this.delete_action();
    return this._send_request(data, callback);
};

/**
 * Remove a property from a group. The value will be ignored if doesn't exist.
 *
 * @example
 * ```js
 * mixpanel.get_group('company', 'mixpanel').remove('Location', 'London');
 * ```
 *
 * @param {String} list_name Name of the property.
 * @param {Object} value Value to remove from the given group property
 * @param {Function} [callback] If provided, the callback will be called after the tracking event
 */
MixpanelGroup.prototype.remove = function(list_name, value, callback) {
    if (!this.consentGate.allowsApiCalls()) {
        if (_.isFunction(callback)) {
            callback(0);
        }
        return;
    }
    var data = this.remove_action(list_name, value);
    return this._send_request(data, callback);
};

MixpanelGroup.prototype._send_request = function(data, callback) {
    data['$group_key'] = this._group_key;
    data['$group_id'] = this._group_id;
    data['$token'] = this._get_config('token');

    var date_encoded_data = _.encodeDates(data);
    return this._mixpanel._track_or_batch({
        type: 'groups',
        data: date_encoded_data,
        endpoint: this._mixpanel.get_api_host('groups') + '/' +  this._get_config('api_routes')['groups'],
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
// (assigned through an alias: a second `MixpanelGroup.prototype[...]` declaration of each method would
// make TypeScript type them as `any`, which breaks the generated API docs)
var MixpanelGroupProto = MixpanelGroup.prototype;
MixpanelGroupProto['remove']   = MixpanelGroupProto.remove;
MixpanelGroupProto['set']      = MixpanelGroupProto.set;
MixpanelGroupProto['set_once'] = MixpanelGroupProto.set_once;
MixpanelGroupProto['union']    = MixpanelGroupProto.union;
MixpanelGroupProto['unset']    = MixpanelGroupProto.unset;
MixpanelGroup.prototype['toString'] = MixpanelGroup.prototype.toString;

/* eslint camelcase: "off" */

/**
 * Mixpanel People Object
 * @class
 */
function MixpanelPeople() {}

_.extend(MixpanelPeople.prototype, apiActions);

/**
 * @param {Object} mixpanel_instance
 * @param {import('./consent-gate').ConsentGate} consentGate
 */
MixpanelPeople.prototype._init = function(mixpanel_instance, consentGate) {
    this._mixpanel = mixpanel_instance;
    this.consentGate = consentGate;
};

/**
* Set properties on a user record.
*
* @example
* ```js
* mixpanel.people.set('gender', 'm');
*
* // or set multiple properties at once
* mixpanel.people.set({
*     'Company': 'Acme',
*     'Plan': 'Premium',
*     'Upgrade date': new Date()
* });
* // properties can be strings, integers, dates, or lists
* ```
*
* @param {Object|String} prop If a string, this is the name of the property. If an object, this is an associative array of names and values.
* @param {*} [to] A value to set on the given property name
* @param {Function} [callback] If provided, the callback will be called after tracking the event.
*/
MixpanelPeople.prototype.set = function(prop, to, callback) {
    if (_.isObject(prop)) {
        callback = to;
    }
    if (!this.consentGate.allowsApiCalls()) {
        if (_.isFunction(callback)) {
            callback(0);
        }
        return;
    }
    var data = this.set_action(prop, to);
    // make sure that the referrer info has been updated and saved
    if (this._get_config('save_referrer')) {
        this._mixpanel['persistence'].update_referrer_info(document.referrer);
    }

    // update $set object with default people properties
    data[SET_ACTION] = _.extend(
        {},
        _.info.people_properties(),
        data[SET_ACTION]
    );
    return this._send_request(data, callback);
};

/**
* Set properties on a user record, only if they do not yet exist.
* This will not overwrite previous people property values, unlike
* people.set().
*
* @example
* ```js
* mixpanel.people.set_once('First Login Date', new Date());
*
* // or set multiple properties at once
* mixpanel.people.set_once({
*     'First Login Date': new Date(),
*     'Starting Plan': 'Premium'
* });
*
* // properties can be strings, integers or dates
* ```
*
* @param {Object|String} prop If a string, this is the name of the property. If an object, this is an associative array of names and values.
* @param {*} [to] A value to set on the given property name
* @param {Function} [callback] If provided, the callback will be called after tracking the event.
*/
MixpanelPeople.prototype.set_once = function(prop, to, callback) {
    if (_.isObject(prop)) {
        callback = to;
    }
    if (!this.consentGate.allowsApiCalls()) {
        if (_.isFunction(callback)) {
            callback(0);
        }
        return;
    }
    var data = this.set_once_action(prop, to);
    return this._send_request(data, callback);
};

/**
* Unset properties on a user record (permanently removes the properties and their values from a profile).
*
* @example
* ```js
* mixpanel.people.unset('gender');
*
* // or unset multiple properties at once
* mixpanel.people.unset(['gender', 'Company']);
* ```
*
* @param {Array|String} prop If a string, this is the name of the property. If an array, this is a list of property names.
* @param {Function} [callback] If provided, the callback will be called after tracking the event.
*/
MixpanelPeople.prototype.unset = function(prop, callback) {
    if (!this.consentGate.allowsApiCalls()) {
        if (_.isFunction(callback)) {
            callback(0);
        }
        return;
    }
    var data = this.unset_action(prop);
    return this._send_request(data, callback);
};

/**
* Increment/decrement numeric people analytics properties.
*
* @example
* ```js
* mixpanel.people.increment('page_views', 1);
*
* // or, for convenience, if you're just incrementing a counter by
* // 1, you can simply do
* mixpanel.people.increment('page_views');
*
* // to decrement a counter, pass a negative number
* mixpanel.people.increment('credits_left', -1);
*
* // like mixpanel.people.set(), you can increment multiple
* // properties at once:
* mixpanel.people.increment({
*     counter1: 1,
*     counter2: 6
* });
* ```
*
* @param {Object|String} prop If a string, this is the name of the property. If an object, this is an associative array of names and numeric values.
* @param {Number} [by] An amount to increment the given property
* @param {Function} [callback] If provided, the callback will be called after tracking the event.
*/
MixpanelPeople.prototype.increment = function(prop, by, callback) {
    if (_.isObject(prop)) {
        callback = by;
    }
    if (!this.consentGate.allowsApiCalls()) {
        if (_.isFunction(callback)) {
            callback(0);
        }
        return;
    }
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
};

/**
* Append a value to a list-valued people analytics property.
*
* @example
* ```js
* // append a value to a list, creating it if needed
* mixpanel.people.append('pages_visited', 'homepage');
*
* // like mixpanel.people.set(), you can append multiple
* // properties at once:
* mixpanel.people.append({
*     list1: 'bob',
*     list2: 123
* });
* ```
*
* @param {Object|String} list_name If a string, this is the name of the property. If an object, this is an associative array of names and values.
* @param {*} [value] value An item to append to the list
* @param {Function} [callback] If provided, the callback will be called after tracking the event.
*/
MixpanelPeople.prototype.append = function(list_name, value, callback) {
    if (_.isObject(list_name)) {
        callback = value;
    }
    if (!this.consentGate.allowsApiCalls()) {
        if (_.isFunction(callback)) {
            callback(0);
        }
        return;
    }
    var data = this.append_action(list_name, value);
    return this._send_request(data, callback);
};

/**
* Remove a value from a list-valued people analytics property.
*
* @example
* ```js
* mixpanel.people.remove('School', 'UCB');
* ```
*
* @param {Object|String} list_name If a string, this is the name of the property. If an object, this is an associative array of names and values.
* @param {*} [value] value Item to remove from the list
* @param {Function} [callback] If provided, the callback will be called after tracking the event.
*/
MixpanelPeople.prototype.remove = function(list_name, value, callback) {
    if (_.isObject(list_name)) {
        callback = value;
    }
    if (!this.consentGate.allowsApiCalls()) {
        if (_.isFunction(callback)) {
            callback(0);
        }
        return;
    }
    var data = this.remove_action(list_name, value);
    return this._send_request(data, callback);
};

/**
* Merge a given list with a list-valued people analytics property,
* excluding duplicate values.
*
* @example
* ```js
* // merge a value to a list, creating it if needed
* mixpanel.people.union('pages_visited', 'homepage');
*
* // like mixpanel.people.set(), you can append multiple
* // properties at once:
* mixpanel.people.union({
*     list1: 'bob',
*     list2: 123
* });
*
* // like mixpanel.people.append(), you can append multiple
* // values to the same list:
* mixpanel.people.union({
*     list1: ['bob', 'billy']
* });
* ```
*
* @param {Object|String} list_name If a string, this is the name of the property. If an object, this is an associative array of names and values.
* @param {*} [values] Value / values to merge with the given property
* @param {Function} [callback] If provided, the callback will be called after tracking the event.
*/
MixpanelPeople.prototype.union = function(list_name, values, callback) {
    if (_.isObject(list_name)) {
        callback = values;
    }
    if (!this.consentGate.allowsApiCalls()) {
        if (_.isFunction(callback)) {
            callback(0);
        }
        return;
    }
    var data = this.union_action(list_name, values);
    return this._send_request(data, callback);
};

/**
 * Record that you have charged the current user a certain amount
 * of money. Charges recorded with track_charge() will appear in the
 * Mixpanel revenue report.
 *
 * @example
 * ```js
 * // charge a user $50
 * mixpanel.people.track_charge(50);
 *
 * // charge a user $30.50 on the 2nd of january
 * mixpanel.people.track_charge(30.50, {
 *     '$time': new Date('jan 1 2012')
 * });
 * ```
 *
 * @param {Number} amount The amount of money charged to the current user
 * @param {Object} [properties] An associative array of properties associated with the charge
 * @param {Function} [callback] If provided, the callback will be called when the server responds
 * @deprecated
 */
MixpanelPeople.prototype.track_charge = function(amount, properties, callback) { // eslint-disable-line no-unused-vars
    if (!this.consentGate.allowsApiCalls()) {
        if (_.isFunction(callback)) {
            callback(0);
        }
        return;
    }
    console.error('mixpanel.people.track_charge() is deprecated and no longer has any effect.');
};

/**
 * Permanently clear all revenue report transactions from the
 * current user's people analytics profile.
 *
 * @example
 * ```js
 * mixpanel.people.clear_charges();
 * ```
 *
 * @param {Function} [callback] If provided, the callback will be called after tracking the event.
 * @deprecated
 */
MixpanelPeople.prototype.clear_charges = function(callback) {
    return this.set('$transactions', [], callback);
};

/**
* Permanently deletes the current people analytics profile from
* Mixpanel (using the current distinct_id).
*
* @example
* ```js
* // remove the all data you have stored about the current user
* mixpanel.people.delete_user();
* ```
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
        this._enqueue(date_encoded_data);
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
        endpoint: this._mixpanel.get_api_host('people') + '/' +  this._get_config('api_routes')['engage'],
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
    var queued_data = _.extend({}, this._mixpanel['persistence'].load_queue(action));
    var action_params = queued_data;

    if (!_.isUndefined(queued_data) && _.isObject(queued_data) && !_.isEmptyObject(queued_data)) {
        _this._mixpanel['persistence']._pop_from_people_queue(action, queued_data);
        _this._mixpanel['persistence'].save();
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

    this._flush_one_queue(SET_ACTION, this.set, _set_callback);
    this._flush_one_queue(SET_ONCE_ACTION, this.set_once, _set_once_callback);
    this._flush_one_queue(UNSET_ACTION, this.unset, _unset_callback, function(queue) { return _.keys(queue); });
    this._flush_one_queue(ADD_ACTION, this.increment, _add_callback);
    this._flush_one_queue(UNION_ACTION, this.union, _union_callback);

    // we have to fire off each $append individually since there is
    // no concat method server side
    var $append_queue = this._mixpanel['persistence'].load_queue(APPEND_ACTION);
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
            $append_queue = this._mixpanel['persistence'].load_queue(APPEND_ACTION);
            $append_item = $append_queue.pop();
            _this._mixpanel['persistence'].save();
            if (!_.isEmptyObject($append_item)) {
                _this.append($append_item, append_callback);
            }
        }
    }

    // same for $remove
    var $remove_queue = this._mixpanel['persistence'].load_queue(REMOVE_ACTION);
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
            $remove_queue = this._mixpanel['persistence'].load_queue(REMOVE_ACTION);
            $remove_item = $remove_queue.pop();
            _this._mixpanel['persistence'].save();
            if (!_.isEmptyObject($remove_item)) {
                _this.remove($remove_item, remove_callback);
            }
        }
    }
};

MixpanelPeople.prototype._is_reserved_property = function(prop) {
    return prop === '$distinct_id' || prop === '$token' || prop === '$device_id' || prop === '$user_id' || prop === '$had_persisted_distinct_id';
};

// MixpanelPeople Exports
// (assigned through an alias: a second `MixpanelPeople.prototype[...]` declaration of each method would
// make TypeScript type them as `any`, which breaks the generated API docs)
var MixpanelPeopleProto = MixpanelPeople.prototype;
MixpanelPeopleProto['set']           = MixpanelPeopleProto.set;
MixpanelPeopleProto['set_once']      = MixpanelPeopleProto.set_once;
MixpanelPeopleProto['unset']         = MixpanelPeopleProto.unset;
MixpanelPeopleProto['increment']     = MixpanelPeopleProto.increment;
MixpanelPeopleProto['append']        = MixpanelPeopleProto.append;
MixpanelPeopleProto['remove']        = MixpanelPeopleProto.remove;
MixpanelPeopleProto['union']         = MixpanelPeopleProto.union;
MixpanelPeopleProto['track_charge']  = MixpanelPeopleProto.track_charge;
MixpanelPeopleProto['clear_charges'] = MixpanelPeopleProto.clear_charges;
MixpanelPeopleProto['delete_user']   = MixpanelPeopleProto.delete_user;
MixpanelPeople.prototype['toString']      = MixpanelPeople.prototype.toString;

/* eslint camelcase: "off" */


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

// the store while persistence is off: nothing is read or written
/** @const */ var NULL_STORAGE = {
    parse: function() { return null; },
    set: function() {}
};

/**
 * Mixpanel Persistence Object
 * @constructor
 * @param {Object} config
 * @param {Object} [options]
 * @param {boolean} [options.closed] start closed, keeping props in memory without reading, writing
 * or probing storage until open()
 */
var MixpanelPersistence = function(config, options) {
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
        config['persistence'] = 'cookie';
    }
    this.storage_type = config['persistence'];

    this.closed = true;
    this.storage = NULL_STORAGE;
    this.update_config(config);
    if (!(options && options.closed)) {
        this.open();
    }
};

MixpanelPersistence.prototype._choose_backend = function() {
    if (this.storage_type === 'localStorage' && _.localStorage.is_supported()) {
        this.backend = _.localStorage;
    } else {
        this.backend = _.cookie;
    }
    this.storage = this.backend;
};

MixpanelPersistence.prototype.properties = function() {
    var p = {};

    this.load();

    // Filter out reserved properties
    _.each(this['props'], function(v, k) {
        if (!_.include(RESERVED_PROPERTIES, k)) {
            p[k] = v;
        }
    });
    return p;
};

MixpanelPersistence.prototype.load = function() {
    var entry = this.storage.parse(this.name);

    if (entry) {
        this['props'] = _.extend({}, entry);
    }
};

MixpanelPersistence.prototype.upgrade = function() {
    var old_cookie,
        old_localstorage;

    // if transferring from cookie to localStorage or vice-versa, copy existing
    // super properties over to new storage mode
    if (this.backend === _.localStorage) {
        old_cookie = _.cookie.parse(this.name);

        _.cookie.remove(this.name);
        _.cookie.remove(this.name, true);

        if (old_cookie) {
            this.register_once(old_cookie);
        }
    } else if (this.backend === _.cookie) {
        old_localstorage = _.localStorage.parse(this.name);

        _.localStorage.remove(this.name);

        if (old_localstorage) {
            this.register_once(old_localstorage);
        }
    }
};

MixpanelPersistence.prototype.save = function() {
    this.storage.set(
        this.name,
        JSONStringify(this['props']),
        this.expire_days,
        this.cross_subdomain,
        this.secure,
        this.cross_site,
        this.cookie_domain
    );
};

MixpanelPersistence.prototype.load_prop = function(key) {
    this.load();
    return this['props'][key];
};

MixpanelPersistence.prototype.remove = function() {
    // persistence that started closed has no backend until it opens
    if (!this.backend) { return; }
    // remove both domain and subdomain cookies
    this.backend.remove(this.name, false, this.cookie_domain);
    this.backend.remove(this.name, true, this.cookie_domain);
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

        this.load();

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

        this.load();
        _.extend(this['props'], props);
        this.save();

        return true;
    }
    return false;
};

MixpanelPersistence.prototype.unregister = function(prop) {
    this.load();
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
    referrer = _.sanitizeUrl(referrer);
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

MixpanelPersistence.prototype.update_config = function(config) {
    this.default_expiry = this.expire_days = config['cookie_expiration'];
    this.set_disabled(config['disable_persistence']);
    this.set_cookie_domain(config['cookie_domain']);
    this.set_cross_site(config['cross_site_cookie']);
    this.set_cross_subdomain(config['cross_subdomain_cookie']);
    this.set_secure(config['secure_cookie']);
};

/**
 * Turn persistence off or on for the disable_persistence config. Consent closes it separately, so a
 * config change doesn't reopen what consent closed.
 * @param {boolean} disabled
 */
MixpanelPersistence.prototype.set_disabled = function(disabled) {
    this.disabled = disabled;
    this._update_storage();
};

/**
 * Stop reading and writing storage, and remove the stored entry. The props stay in memory.
 */
MixpanelPersistence.prototype.close = function() {
    if (this.closed) { return; }
    this.closed = true;
    this._update_storage();
};

/**
 * Read and write storage again, saving the props in memory to it.
 */
MixpanelPersistence.prototype.open = function() {
    if (!this.closed) { return; }
    this.closed = false;
    if (!this.backend) {
        // what the page set while closed goes on top of what's stored
        var memory_props = this['props'];
        this['props'] = {};
        this._choose_backend();
        this.load();
        _.extend(this['props'], memory_props);
        // nothing is written until _update_storage, which writes nothing while persistence is
        // disabled
        this.storage = NULL_STORAGE;
        this.upgrade();
        // remove any copy an earlier config left at another cookie scope or in the other store
        this.remove_stored_entry();
    }
    this._update_storage();
};

/**
 * Delete the stored entry from both backends at every cookie scope, whether or not storage is
 * open: an earlier page load or config may have left one anywhere.
 */
MixpanelPersistence.prototype.remove_stored_entry = function() {
    _.cookie.remove(this.name);
    _.cookie.remove(this.name, true);
    if (this.cookie_domain) {
        _.cookie.remove(this.name, false, this.cookie_domain);
    }
    _.localStorage.remove(this.name);
};

MixpanelPersistence.prototype._update_storage = function() {
    if (this.disabled || this.closed) {
        this.storage = NULL_STORAGE;
        this.remove();
    } else {
        this.storage = this.backend;
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
                // Prevent duplicate values
                _.each(v, function(item) {
                    if (!_.include(union_q[k], item)) {
                        union_q[k].push(item);
                    }
                });
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
    var q = this['props'][this._get_queue_key(queue)];
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
    }
};

MixpanelPersistence.prototype.load_queue = function(queue) {
    return this.load_prop(this._get_queue_key(queue));
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

MixpanelPersistence.prototype._get_or_create_queue = function(queue, default_val) {
    var key = this._get_queue_key(queue);
    default_val = _.isUndefined(default_val) ? {} : default_val;
    return this['props'][key] || (this['props'][key] = default_val);
};

MixpanelPersistence.prototype.set_event_timer = function(event_name, timestamp) {
    var timers = this.load_prop(EVENT_TIMERS_KEY) || {};
    timers[event_name] = timestamp;
    this['props'][EVENT_TIMERS_KEY] = timers;
    this.save();
};

MixpanelPersistence.prototype.remove_event_timer = function(event_name) {
    var timers = this.load_prop(EVENT_TIMERS_KEY) || {};
    var timestamp = timers[event_name];
    if (!_.isUndefined(timestamp)) {
        delete this['props'][EVENT_TIMERS_KEY][event_name];
        this.save();
    }
    return timestamp;
};

/**
 * The consent rules as two tables: CONSENT_MODES maps each mode's decisions to a state, and
 * CONSENT_STATES says what each state allows:
 *   'api_calls'  the public tracking, people, group and replay methods run
 *   'send'       tracking requests go out
 *   'fetch'      feature flags and remote settings are fetched
 *   'store'      the services store data about the visitor
 */


/** @const */ var CONSENT_MODE_NO_CONSENT_REQUIRED = 'no_consent_required';
/** @const */ var CONSENT_MODE_REQUIRE_CONSENT = 'require_consent';

/** @const */ var CAPABILITIES = ['api_calls', 'send', 'fetch', 'store'];

/** @const */ var DECISION_NONE = 'none';
/** @const */ var DECISION_OPTED_IN = 'opted_in';
/** @const */ var DECISION_OPTED_OUT = 'opted_out';
// Do Not Track counts as an objection
/** @const */ var DECISION_OBJECTED = 'objected';

/** @const */ var STATE_FULL = 'full';
/** @const */ var STATE_API_CALLS_STOPPED = 'api_calls_stopped';
/** @const */ var STATE_BLOCKED = 'blocked';

/** @const */ var CONSENT_STATES = {
    // the SDK works normally, as for a site with no consent rules
    'full':              {'api_calls': true,  'send': true,  'fetch': true,  'store': true},
    // an opt-out under 'no_consent_required': the public calls do nothing, flags keep loading,
    // and persistence follows the opt-out's clear_persistence and enable_persistence options
    'api_calls_stopped': {'api_calls': false, 'send': true,  'fetch': true,  'store': true},
    // nothing runs, is sent or is stored
    'blocked':           {'api_calls': false, 'send': false, 'fetch': false, 'store': false}
};

/**
 * Each mode's state for each decision. 'no_consent_required' keeps its decisions with
 * OptOutFlagDecisions, the other modes with ConsentDecisions.
 */
/** @const */ var CONSENT_MODES = {
    'no_consent_required': {'none': STATE_FULL,    'opted_in': STATE_FULL, 'opted_out': STATE_API_CALLS_STOPPED, 'objected': STATE_API_CALLS_STOPPED},
    'require_consent':     {'none': STATE_BLOCKED, 'opted_in': STATE_FULL, 'opted_out': STATE_BLOCKED,           'objected': STATE_BLOCKED}
};

/**
 * The mode for a consent_mode config value, by default 'no_consent_required'. An unknown value
 * falls back to 'require_consent', so a typo stores and sends nothing before consent.
 * @param {string|null|undefined} configuredMode
 * @returns {string}
 */
function resolveConsentMode(configuredMode) {
    if (!configuredMode) {
        return CONSENT_MODE_NO_CONSENT_REQUIRED;
    }
    if (!CONSENT_MODES.hasOwnProperty(configuredMode)) {
        console.critical('Unknown consent_mode ' + configuredMode + '; using \'' + CONSENT_MODE_REQUIRE_CONSENT + '\'');
        return CONSENT_MODE_REQUIRE_CONSENT;
    }
    return configuredMode;
}

/**
 * The visitor's decision: Do Not Track, then the stored opt-out flag.
 * @param {boolean} doNotTrack whether Do Not Track is on and not ignored
 * @param {string|null} storedFlag '1', '0', or null when there's none
 * @returns {string}
 */
function readDecision(doNotTrack, storedFlag) {
    if (doNotTrack) {
        console.warn('This browser has "Do Not Track" enabled. This will prevent the Mixpanel SDK from sending any data. To ignore the "Do Not Track" browser setting, initialize the Mixpanel instance with the config "ignore_dnt: true"');
        return DECISION_OBJECTED;
    }

    if (storedFlag === '1') {
        return DECISION_OPTED_IN;
    } else if (storedFlag === '0') {
        console.warn('You are opted out of Mixpanel tracking. This will prevent the Mixpanel SDK from sending any data.');
        return DECISION_OPTED_OUT;
    }
    return DECISION_NONE;
}

/**
 * What the services ask before they store or send on their own. A ConsentManager is one; a new
 * storage write or network send must ask it too.
 * @typedef {Object} ConsentGate
 * @property {function(): boolean} allowsApiCalls whether the public tracking, people, group and
 * replay methods run
 * @property {function(): boolean} allowsSending whether tracking requests go out
 * @property {function(): boolean} allowsFetching whether feature flags and remote settings are
 * fetched
 * @property {function(): boolean} allowsStoring whether consent allows storing data about the
 * visitor; identify() and alias() ask this, since disable_persistence doesn't stop them
 * @property {function(): boolean} allowsPersistence whether the services may write to browser
 * storage: consent allows storing, and disable_persistence is off. Without it they keep their data
 * in memory.
 */


/**
 * @param {function(string): boolean} allowsFunc whether consent allows 'api_calls', 'send',
 * 'fetch' or 'store' now
 * @param {function(string): *} getConfigFunc
 * @returns {ConsentGate}
 */
function buildConsentGate(allowsFunc, getConfigFunc) {
    var gate = {
        // if asking throws, the call runs
        allowsApiCalls: function() {
            try {
                return allowsFunc('api_calls');
            } catch (err) {
                console.error('Unexpected error when checking tracking opt-out status: ' + err);
                return true;
            }
        },
        allowsSending: function() {
            return allowsFunc('send');
        },
        allowsFetching: function() {
            return allowsFunc('fetch');
        },
        allowsStoring: function() {
            return allowsFunc('store');
        },
        allowsPersistence: function() {
            return gate.allowsStoring() && !getConfigFunc('disable_persistence');
        }
    };
    return gate;
}

/**
 * GDPR utils
 *
 * The General Data Protection Regulation (GDPR) is a regulation in EU law on data protection
 * and privacy for all individuals within the European Union. It addresses the export of personal
 * data outside the EU. The GDPR aims primarily to give control back to citizens and residents
 * over their personal data and to simplify the regulatory environment for international business
 * by unifying the regulation within the EU.
 *
 * This set of utilities is intended to enable opt in/out functionality in the Mixpanel JS SDK.
 * These functions are used internally by the SDK and are not intended to be publicly exposed.
 */


/**
 * A function used to track a Mixpanel event (e.g. MixpanelLib.track)
 * @callback trackFunction
 * @param {String} event_name The name of the event. This can be anything the user does - 'Button Click', 'Sign Up', 'Item Purchased', etc.
 * @param {Object} [properties] A set of properties to include with the event you're sending. These describe the user who did the event or details about the event itself.
 * @param {Function} [callback] If provided, the callback function will be called after tracking the event.
 */

/** Public **/

var OPT_IN_OUT_FLAG_PREFIX = '__mp_opt_in_out_';

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
 * Get the persistence type to read the opt-in/out flag from. OptOutFlagDecisions writes
 * the flag to localStorage if it passes the localStorageSupported probe, otherwise to a cookie.
 * Read that store first, and the other one if no flag is there.
 * @param {string} token - Mixpanel project tracking token
 * @param {string} persistenceType - configured persistence type
 * @param {string} [persistencePrefix] - custom prefix used in the cookie/localstorage name
 * @returns {string} the persistence type to read
 */
function getOptOutCheckPersistenceType(token, persistenceType, persistencePrefix) {
    if (persistenceType !== 'localStorage') {
        return persistenceType;
    }
    var writtenTo = localStorageSupported(getLocalStorage()) ? 'localStorage' : 'cookie';
    var hasFlag = readOptInOutFlag(token, {persistenceType: writtenTo, persistencePrefix: persistencePrefix}) !== null;
    if (hasFlag) {
        return writtenTo;
    }
    return writtenTo === 'localStorage' ? 'cookie' : 'localStorage';
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
    return (options.persistencePrefix || OPT_IN_OUT_FLAG_PREFIX) + token;
}

/**
 * Get the value of the cookie that is used for the given opt type (tracking, cookie, etc.)
 * @param {string} token - Mixpanel project tracking token
 * @param {Object} [options]
 * @param {string} [options.persistencePrefix=__mp_opt_in_out] - custom prefix to be used in the cookie/localstorage name
 * @returns {string} the value of the cookie for the given opt type
 */
function readOptInOutFlag(token, options) {
    return _getStorage(options).get(_getStorageKey(token, options));
}

/**
 * Whether Do Not Track is on for an instance, unless its config or a call's options ignore it.
 * @param {function(string): *} getConfigFunc the instance's get_config
 * @param {Object} [options] a call's ignore_dnt option, which overrides the config's
 * @returns {boolean}
 */
function doNotTrackApplies(getConfigFunc, options) {
    options = _.extend({'ignore_dnt': getConfigFunc('ignore_dnt')}, options);
    return hasDoNotTrackFlagOn({
        ignoreDnt: options['ignore_dnt'],
        window: getConfigFunc('window') // used to override window during browser tests
    });
}

/**
 * Check whether the user has set the DNT/doNotTrack setting to true in their browser
 * @param {Object} [options]
 * @param {string} [options.window] - alternate window object to check; used to force various DNT settings in browser tests
 * @param {boolean} [options.ignoreDnt] - flag to ignore browser DNT settings and always return false
 * @returns {boolean} whether the DNT setting is true
 */
function hasDoNotTrackFlagOn(options) {
    if (options && options.ignoreDnt) {
        return false;
    }
    var win$1 = (options && options.window) || win;
    var nav = win$1['navigator'] || {};
    var hasDntOn = false;

    _.each([
        nav['doNotTrack'], // standard
        nav['msDoNotTrack'],
        win$1['doNotTrack']
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
 * Decisions under 'no_consent_required', which is what the opt_out_* configs have always done. The
 * decision is the opt-out flag in opt_out_tracking_persistence_type, read at every check so another
 * tab's decision applies at once. A decision's clear_persistence and enable_persistence options
 * turn the instance's persistence off or on, and opt_out_tracking_by_default stores an opt-out at
 * init when nothing is stored.
 */


/**
 * @constructor
 * @param {string} mode
 * @param {Object} options
 * @param {function} options.getConfigFunc the instance's get_config
 * @param {function} options.trackFunc the instance's track, for the $opt_in event
 * @param {function(boolean)} options.setPersistenceDisabledFunc turn the instance's persistence,
 * batching and recording off (true) or back on (false)
 * @param {function} options.deleteUserFunc delete the identified user's profile and charges
 */
var OptOutFlagDecisions = function(mode, options) {
    this.mode = mode;
    this.getConfig = options.getConfigFunc;
    this.track = options.trackFunc;
    this.setPersistenceDisabled = options.setPersistenceDisabledFunc;
    this.deleteUser = options.deleteUserFunc;
};

/**
 * Move a cookie flag to localStorage if that's the configured store, then apply a stored opt-out,
 * or opt out when nothing is stored and the configs say to.
 */
OptOutFlagDecisions.prototype.init = function() {
    var localStorageRequested = this.getConfig('opt_out_tracking_persistence_type') === 'localStorage';
    if (localStorageRequested && _.localStorage.is_supported()) {
        if (!this.hasOptedIn({'persistence_type': 'localStorage'}) && this.hasOptedIn({'persistence_type': 'cookie'})) {
            this.optIn({'enable_persistence': false});
        }
        if (!this.hasOptedOut({'persistence_type': 'localStorage'}) && this.hasOptedOut({'persistence_type': 'cookie'})) {
            this.optOut({'clear_persistence': false});
        }
        this.clear({
            'persistence_type': 'cookie',
            'enable_persistence': false
        });
    }

    if (this.hasOptedOut()) {
        this._updatePersistence({'clear_persistence': true});
    // persistence isn't cleared here by default, since the opt-out default is often an initial
    // state while consent is being collected
    } else if (!this.hasOptedIn() && (this._optsOutByDefault() || _.cookie.get('mp_optout'))) {
        _.cookie.remove('mp_optout');
        this.optOut({
            'clear_persistence': this.getConfig('opt_out_persistence_by_default')
        });
    }
};

// opt_out_tracking_by_default applies only without consent_mode, which replaces it
OptOutFlagDecisions.prototype._optsOutByDefault = function() {
    return !this.getConfig('consent_mode') && !!this.getConfig('opt_out_tracking_by_default');
};

/**
 * @returns {string}
 */
OptOutFlagDecisions.prototype.state = function() {
    return CONSENT_MODES[this.mode][this._readDecision()];
};

/**
 * @param {Object} [options] persistence_type and cookie_prefix to read
 * @returns {boolean}
 */
OptOutFlagDecisions.prototype.hasOptedIn = function(options) {
    return this._readFlag(options) === '1';
};

/**
 * @param {Object} [options] persistence_type, cookie_prefix and ignore_dnt to read with
 * @returns {boolean}
 */
OptOutFlagDecisions.prototype.hasOptedOut = function(options) {
    var decision = this._readDecision(options);
    return decision === DECISION_OPTED_OUT || decision === DECISION_OBJECTED;
};

/**
 * @param {Object} [options] opt_in_tracking() options
 */
OptOutFlagDecisions.prototype.optIn = function(options) {
    options = _.extend({'enable_persistence': true}, options);
    this._writeFlag(optIn, options);
    this._updatePersistence(options);
};

/**
 * @param {Object} [options] opt_out_tracking() options
 */
OptOutFlagDecisions.prototype.optOut = function(options) {
    options = _.extend({
        'clear_persistence': true,
        'delete_user': true
    }, options);

    // before the opt-out, which blocks the people calls this makes
    if (options['delete_user']) {
        this.deleteUser();
    }

    this._writeFlag(optOut, options);
    this._updatePersistence(options);
};

/**
 * @param {Object} [options] clear_opt_in_out_tracking() options
 */
OptOutFlagDecisions.prototype.clear = function(options) {
    options = _.extend({'enable_persistence': true}, options);
    this._writeFlag(clearOptInOut, options);
    this._updatePersistence(options);
};

/**
 * @param {Object} options a decision's clear_persistence or enable_persistence option
 */
OptOutFlagDecisions.prototype._updatePersistence = function(options) {
    if (options['clear_persistence']) {
        this.setPersistenceDisabled(true);
    } else if (options['enable_persistence']) {
        this.setPersistenceDisabled(false);
    }
};

/**
 * Call an opt-out-flag write with the instance's opt-out flag and cookie config, overridden by the
 * call's options.
 * @param {function} func optIn, optOut or clearOptInOut
 * @param {Object} options
 */
OptOutFlagDecisions.prototype._writeFlag = function(func, options) {
    var getConfig = this.getConfig;
    options = _.extend({
        'track': this.track,
        'persistence_type': getConfig('opt_out_tracking_persistence_type'),
        'cookie_prefix': getConfig('opt_out_tracking_cookie_prefix'),
        'cookie_expiration': getConfig('cookie_expiration'),
        'cross_site_cookie': getConfig('cross_site_cookie'),
        'cross_subdomain_cookie': getConfig('cross_subdomain_cookie'),
        'cookie_domain': getConfig('cookie_domain'),
        'secure_cookie': getConfig('secure_cookie')
    }, options);

    // check if localStorage can be used for recording opt out status, fall back to cookie if not
    if (!_.localStorage.is_supported()) {
        options['persistence_type'] = 'cookie';
    }

    func(getConfig('token'), {
        track: options['track'],
        trackEventName: options['track_event_name'],
        trackProperties: options['track_properties'],
        persistenceType: options['persistence_type'],
        persistencePrefix: options['cookie_prefix'],
        cookieDomain: options['cookie_domain'],
        cookieExpiration: options['cookie_expiration'],
        crossSiteCookie: options['cross_site_cookie'],
        crossSubdomainCookie: options['cross_subdomain_cookie'],
        secureCookie: options['secure_cookie']
    });
};

/**
 * @param {Object} [options] persistence_type, cookie_prefix and ignore_dnt to read with
 * @returns {string}
 */
OptOutFlagDecisions.prototype._readDecision = function(options) {
    return readDecision(doNotTrackApplies(this.getConfig, options), this._readFlag(options));
};

/**
 * The opt-out flag, from the store that holds it unless options name one.
 * @param {Object} [options] persistence_type and cookie_prefix to read
 * @returns {string|null} '1', '0', or null when there's none
 */
OptOutFlagDecisions.prototype._readFlag = function(options) {
    options = _.extend({
        'cookie_prefix': this.getConfig('opt_out_tracking_cookie_prefix')
    }, options);

    var token = this.getConfig('token');
    var persistenceType = options['persistence_type'];
    if (!persistenceType) {
        persistenceType = getOptOutCheckPersistenceType(
            token, this.getConfig('opt_out_tracking_persistence_type'), options['cookie_prefix']
        );
    } else if (!_.localStorage.is_supported()) {
        persistenceType = 'cookie';
    }

    return readOptInOutFlag(token, {
        persistenceType: persistenceType,
        persistencePrefix: options['cookie_prefix']
    });
};

/**
 * Decisions under 'require_consent'. The decision is stored with the persistence, so a subdomain
 * sharing the identity cookie shares it. The state is read once, when the instance is built, and
 * then changed only by this page's decisions; storage opens and closes when it changes, and without
 * consent to store, everything stored about the visitor but the decision is deleted.
 *
 * The constructor reads the stored decision and writes nothing, so the instance can ask allows()
 * while it builds persistence and the services. init() runs once they exist and makes the writes.
 */


/**
 * @constructor
 * @param {string} mode
 * @param {Object} options
 * @param {function} options.getConfigFunc the instance's get_config
 * @param {function} options.trackFunc the instance's track, for the $opt_in event
 * @param {function} options.startTrackingFunc open storage and start the services when the state
 * starts allowing storage
 * @param {function} options.stopTrackingFunc stop the services and close storage when it stops
 * @param {function} options.purgeIdentifiersFunc delete everything stored about the visitor except
 * the decision
 */
var ConsentDecisions = function(mode, options) {
    this.mode = mode;
    this.getConfig = options.getConfigFunc;
    this.track = options.trackFunc;
    this.startTracking = options.startTrackingFunc;
    this.stopTracking = options.stopTrackingFunc;
    this.purgeIdentifiers = options.purgeIdentifiersFunc;
    // read from storage the first time it's asked for
    this.appliedState = null;
};

// delete what an earlier page stored without consent
ConsentDecisions.prototype.init = function() {
    this._reconcile();
};

/**
 * @returns {string}
 */
ConsentDecisions.prototype.state = function() {
    if (this.appliedState === null) {
        this.appliedState = CONSENT_MODES[this.mode][this._readDecision()];
    }
    return this.appliedState;
};

/**
 * @returns {boolean}
 */
ConsentDecisions.prototype.hasOptedIn = function() {
    return this._readFlag() === '1';
};

/**
 * @param {Object} [options] a call's ignore_dnt option
 * @returns {boolean}
 */
ConsentDecisions.prototype.hasOptedOut = function(options) {
    var decision = this._readDecision(options);
    return decision === DECISION_OPTED_OUT || decision === DECISION_OBJECTED;
};

/**
 * @param {Object} [options] opt_in_tracking() options; only the track options apply
 */
ConsentDecisions.prototype.optIn = function(options) {
    this._decide(DECISION_OPTED_IN, options);
};

ConsentDecisions.prototype.optOut = function() {
    this._decide(DECISION_OPTED_OUT);
};

ConsentDecisions.prototype.clear = function() {
    this._decide(DECISION_NONE);
};

/**
 * Store a decision, move this page's state to match it, and open or close storage when that
 * changes whether storage is allowed.
 * @param {string} decision
 * @param {Object} [options] opt_in_tracking() options
 */
ConsentDecisions.prototype._decide = function(decision, options) {
    options = options || {};
    var wasStoring = this._allowsStore();
    this._writeDecision(decision);

    // the state changes before the services start or stop, because they ask it. It follows the
    // decision even if storing it failed; Do Not Track still wins.
    this.appliedState = CONSENT_MODES[this.mode][doNotTrackApplies(this.getConfig) ? DECISION_OBJECTED : decision];
    var storing = this._allowsStore();

    if (wasStoring && !storing) {
        this.stopTracking();
    }
    this._reconcile();
    if (!wasStoring && storing) {
        this.startTracking();
    }

    // after the services start, so it carries the visitor's ID and a recording it triggers finds
    // replay set up
    var track = _.isUndefined(options['track']) ? this.track : options['track'];
    if (decision === DECISION_OPTED_IN && storing && track) {
        track(options['track_event_name'] || '$opt_in', options['track_properties'], {'send_immediately': true});
    }
};

ConsentDecisions.prototype._allowsStore = function() {
    return CONSENT_STATES[this.state()]['store'] === true;
};

/**
 * Make what's stored match the state, whatever an earlier page, SDK version or decision left:
 * without consent to store, delete everything about the visitor but the decision.
 */
ConsentDecisions.prototype._reconcile = function() {
    if (!this._allowsStore()) {
        this.purgeIdentifiers();
    }
};

/**
 * Store a decision as the opt-out flag ('1' for an opt-in, '0' for an opt-out), removed at every
 * cookie scope first so a copy an earlier config left can't shadow it.
 * @param {string} decision
 */
ConsentDecisions.prototype._writeDecision = function(decision) {
    var flag = null;
    if (decision === DECISION_OPTED_IN) {
        flag = '1';
    } else if (decision === DECISION_OPTED_OUT) {
        flag = '0';
    }
    // a decision that's already stored isn't written again
    if (this._readFlag() === flag) {
        return;
    }
    this._writeDecisionKey(this._decisionKey(), flag);
};

/**
 * @param {string} key
 * @param {string|null} value null to remove it
 */
ConsentDecisions.prototype._writeDecisionKey = function(key, value) {
    var getConfig = this.getConfig;
    var cookieDomain = getConfig('cookie_domain');
    _.cookie.remove(key);
    _.cookie.remove(key, true);
    if (cookieDomain) {
        _.cookie.remove(key, false, cookieDomain);
    }
    if (this._decisionInLocalStorage()) {
        if (value === null) {
            _.localStorage.remove(key);
        } else {
            _.localStorage.set(key, value);
        }
    } else if (value !== null) {
        _.cookie.set(
            key,
            value,
            getConfig('cookie_expiration'),
            getConfig('cross_subdomain_cookie'),
            getConfig('secure_cookie'),
            getConfig('cross_site_cookie'),
            cookieDomain
        );
    }
};

// the store the persistence uses, chosen without the localStorage support probe, which writes a key
ConsentDecisions.prototype._decisionInLocalStorage = function() {
    return this.getConfig('persistence') === 'localStorage' && !!getLocalStorage();
};

ConsentDecisions.prototype._decisionStore = function() {
    return this._decisionInLocalStorage() ? _.localStorage : _.cookie;
};

ConsentDecisions.prototype._decisionKey = function() {
    return (this.getConfig('opt_out_tracking_cookie_prefix') || OPT_IN_OUT_FLAG_PREFIX) + this.getConfig('token');
};

/**
 * @param {Object} [options] a call's ignore_dnt option
 * @returns {string}
 */
ConsentDecisions.prototype._readDecision = function(options) {
    return readDecision(doNotTrackApplies(this.getConfig, options), this._readFlag());
};

/**
 * @returns {string|null} the stored opt-out flag: '1', '0', or null when there's none
 */
ConsentDecisions.prototype._readFlag = function() {
    return this._decisionStore().get(this._decisionKey());
};

/**
 * Consent for one instance, and the instance's ConsentGate: the rest of the SDK asks its
 * allowsApiCalls(), allowsSending() and so on, and never reads the mode. The mode picks a row of
 * CONSENT_MODES (consent-modes.js), which maps the visitor's decision to a state, and
 * CONSENT_STATES says what that state allows. Where the decision is stored, and what changes when
 * the visitor decides, is up to OptOutFlagDecisions under 'no_consent_required' and
 * ConsentDecisions under the other modes.
 */


/**
 * The answers that are the same in every state a mode can reach, which allows() gives without
 * reading the decision.
 * @param {string} mode
 * @returns {Object<string, boolean>}
 */
function fixedAnswers(mode) {
    var states = _.values(CONSENT_MODES[mode]);
    var answers = {};
    _.each(CAPABILITIES, function(capability) {
        var answer = CONSENT_STATES[states[0]][capability];
        var same = true;
        _.each(states, function(state) {
            same = same && CONSENT_STATES[state][capability] === answer;
        });
        if (same) {
            answers[capability] = answer;
        }
    });
    return answers;
}

/**
 * @constructor
 * @param {Object} options the options of OptOutFlagDecisions and ConsentDecisions; each uses its
 * own
 */
var ConsentManager = function(options) {
    this.getConfig = options.getConfigFunc;
    this.mode = resolveConsentMode(options.getConfigFunc('consent_mode'));
    this.fixedAnswers = fixedAnswers(this.mode);
    this.decisions = this.mode === CONSENT_MODE_NO_CONSENT_REQUIRED ?
        new OptOutFlagDecisions(this.mode, options) :
        new ConsentDecisions(this.mode, options);
    _.extend(this, buildConsentGate(_.bind(this.allows, this), this.getConfig));
    // the arguments of the latest identify() made while storage isn't allowed
    this.heldIdentify = null;
};

/**
 * Whether the visitor's current state allows something. The rest of the SDK asks the ConsentGate
 * methods built on this.
 * @param {string} capability 'api_calls', 'send', 'fetch' or 'store'
 * @returns {boolean}
 */
ConsentManager.prototype.allows = function(capability) {
    if (this.fixedAnswers.hasOwnProperty(capability)) {
        return this.fixedAnswers[capability];
    }
    return CONSENT_STATES[this.state()][capability];
};

/**
 * @returns {string}
 */
ConsentManager.prototype.state = function() {
    return this.decisions.state();
};

/**
 * Keep an identify() made while storage isn't allowed, to apply if the visitor opts in on this page.
 * @param {Array} identifyArgs
 */
ConsentManager.prototype.holdIdentify = function(identifyArgs) {
    this.heldIdentify = identifyArgs;
};

/**
 * @returns {Array|null} the held identify() arguments, which are then no longer held
 */
ConsentManager.prototype.takeHeldIdentify = function() {
    var identifyArgs = this.heldIdentify;
    this.heldIdentify = null;
    return identifyArgs;
};

/**
 * Make the writes the stored decision calls for, once the instance has built the persistence and
 * services they touch. allows() already answers before this.
 */
ConsentManager.prototype.init = function() {
    this.decisions.init();
};

/**
 * @param {Object} [options] has_opted_in_tracking() options
 * @returns {boolean}
 */
ConsentManager.prototype.hasOptedIn = function(options) {
    return this.decisions.hasOptedIn(options);
};

/**
 * @param {Object} [options] has_opted_out_tracking() options
 * @returns {boolean}
 */
ConsentManager.prototype.hasOptedOut = function(options) {
    return this.decisions.hasOptedOut(options);
};

/**
 * @param {Object} [options] opt_in_tracking() options
 */
ConsentManager.prototype.optIn = function(options) {
    this.decisions.optIn(options);
};

/**
 * @param {Object} [options] opt_out_tracking() options
 */
ConsentManager.prototype.optOut = function(options) {
    this.decisions.optOut(options);
};

/**
 * @param {Object} [options] clear_opt_in_out_tracking() options
 */
ConsentManager.prototype.clear = function(options) {
    this.decisions.clear(options);
};

/* eslint camelcase: "off" */

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

/*
SIMPLE STYLE GUIDE:

this.x === public function
this._x === internal - only use within this file
this.__x === private - only use within the class

Globals should be all caps
*/

var init_type;       // MODULE or SNIPPET loader
// allow bundlers to specify how extra code (recorder bundle) should be loaded
// eslint-disable-next-line no-unused-vars
var load_extra_bundle = function(src, _onload) {
    throw new Error(src + ' not available in this build.');
};

var mixpanel_master; // main mixpanel instance / object
var INIT_MODULE  = 0;
var INIT_SNIPPET = 1;

/** @const */ var PRIMARY_INSTANCE_NAME = 'mixpanel';
/** @const */ var PAYLOAD_TYPE_BASE64   = 'base64';
/** @const */ var PAYLOAD_TYPE_JSON     = 'json';
/** @const */ var DEVICE_ID_PREFIX      = '$device:';
/** @const */ var SETTING_STRICT        = 'strict';
/** @const */ var SETTING_FALLBACK      = 'fallback';
/** @const */ var SETTING_DISABLED      = 'disabled';

/*
 * Dynamic... constants? Is that an oxymoron?
 */
// http://hacks.mozilla.org/2009/07/cross-site-xmlhttprequest-with-cors/
// https://developer.mozilla.org/en-US/docs/DOM/XMLHttpRequest#withCredentials
var USE_XHR = (win.XMLHttpRequest && 'withCredentials' in new XMLHttpRequest());

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

var DEFAULT_API_ROUTES = {
    'track':  'track/',
    'engage': 'engage/',
    'groups': 'groups/',
    'record': 'record/',
    'flags':  'flags/',
    'settings': 'settings/'
};

/*
 * Module-level globals
 */
var DEFAULT_CONFIG = {
    'api_host':                          'https://api-js.mixpanel.com',
    'api_hosts':                         {},
    'api_routes':                        DEFAULT_API_ROUTES,
    'api_extra_query_params':            {},
    'api_method':                        'POST',
    'api_transport':                     'XHR',
    'api_payload_format':                PAYLOAD_TYPE_BASE64,
    'app_host':                          'https://mixpanel.com',
    'autocapture':                       false,
    'cdn':                               'https://cdn.mxpnl.com',
    'cross_site_cookie':                 false,
    'cross_subdomain_cookie':            true,
    'error_reporter':                    NOOP_FUNC,
    'flags':                             false,
    'persistence':                       'cookie',
    'persistence_name':                  '',
    'cookie_domain':                     '',
    'cookie_name':                       '',
    'loaded':                            NOOP_FUNC,
    'mp_loader':                         null,
    'track_marketing':                   true,
    'track_pageview':                    false,
    'skip_first_touch_marketing':        false,
    'store_google':                      true,
    'stop_utm_persistence':              false,
    'save_referrer':                     true,
    'test':                              false,
    'verbose':                           false,
    'visual_experiments':                false,
    'visual_experiments_hide_timeout_ms': 2000,
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
    'consent_mode':                      null,
    'property_blacklist':                [],
    'xhr_headers':                       {}, // { header: value, header2: value }
    'ignore_dnt':                        false,
    'batch_requests':                    true,
    'batch_size':                        50,
    'batch_flush_interval_ms':           5000,
    'batch_request_timeout_ms':          90000,
    'batch_autostart':                   true,
    'hooks':                             {},
    'record_allowed_iframe_origins':     [],
    'record_block_class':                new RegExp('^(mp-block|fs-exclude|amp-block|rr-block|ph-no-capture)$'),
    'record_block_selector':             'img, video, audio',
    'record_canvas':                     false,
    'record_collect_fonts':              false,
    'record_console':                    true,
    'record_heatmap_data':               false,
    'recording_event_triggers':          {},
    'record_idle_timeout_ms':            30 * 60 * 1000, // 30 minutes
    'record_mask_inputs':                true,
    'record_max_ms':                     MAX_RECORDING_MS,
    'record_min_ms':                     0,
    'record_network':                    false,
    'record_network_options':            {},
    'record_sessions_percent':           0,
    'recorder_src':                      null,
    'targeting_src':                     null,
    'lib_base_path':                     'https://cdn.mxpnl.com/libs/',
    'remote_settings_mode':              SETTING_DISABLED // 'strict', 'fallback', 'disabled'
};

var DOM_LOADED = false;

/**
 * Mixpanel Library Object
 * @class
 */
function MixpanelLib() {}


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
    instance['people']._init(instance, instance._consent);

    instance._set_first_touch_people_properties();

    // if any instance on the page has debug = true, we set the
    // global debug to be true
    Config.DEBUG = Config.DEBUG || instance.get_config('debug');

    var source = init_type === INIT_MODULE ? 'module' : 'snippet';
    win.dispatchEvent(new win.CustomEvent('$mp_sdk_to_extension_event', {
        'detail': {
            'instance': instance,
            'source': source,
            'token': token,
            'name': name,
            'info': _.info
        }
    }));

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
 * @param {Partial<import('./index.d.ts').Config>} [config] A dictionary of config options to override; see the Config type for the available options and their defaults.
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

    this.hooks = {};

    this.set_config(_.extend({}, DEFAULT_CONFIG, variable_features, config, {
        'name': name,
        'token': token,
        'callback_fn': ((name === PRIMARY_INSTANCE_NAME) ? name : PRIMARY_INSTANCE_NAME + '.' + name) + '._jsc'
    }));

    this._consent = new ConsentManager({
        getConfigFunc: _.bind(this.get_config, this),
        // looks track up at each call, so a wrapper added after init sees it
        trackFunc: _.bind(function() {
            return this.track.apply(this, arguments);
        }, this),
        setPersistenceDisabledFunc: _.bind(this._set_persistence_disabled, this),
        deleteUserFunc: _.bind(this._delete_user_for_opt_out, this),
        startTrackingFunc: _.bind(this._start_tracking, this),
        stopTrackingFunc: _.bind(this._stop_tracking, this),
        purgeIdentifiersFunc: _.bind(this._purge_stored_identifiers, this)
    });

    this.recorderManager = new RecorderManager({
        mixpanelInstance: this,
        getConfigFunc: _.bind(this.get_config, this),
        setConfigFunc: _.bind(this.set_config, this),
        getTabIdFunc: _.bind(this.get_tab_id, this),
        reportErrorFunc: _.bind(this.report_error, this),
        getDistinctIdFunc: _.bind(this.get_distinct_id, this),
        consentGate: this._consent,
        recorderSrc: this.get_config('recorder_src'),
        targetingSrc: this.get_config('targeting_src'),
        libBasePath: this.get_config('lib_base_path'),
        loadExtraBundle: load_extra_bundle
    });

    this['_jsc'] = NOOP_FUNC;

    this.__dom_loaded_queue = [];
    this.__request_queue = [];
    this.__disabled_events = [];
    this._flags = {
        'disable_all_events': false,
        'identify_called': false
    };
    this._remote_settings_strict_disabled = false;

    this.request_batchers = {};
    // without consent to store, the props stay in memory, and batching and the services wait for
    // _start_tracking()
    var allows_storage = this._consent.allowsStoring();
    if (allows_storage) {
        this._init_batching();
    }

    this['persistence'] = this['cookie'] = new MixpanelPersistence(this['config'], {closed: !allows_storage});
    this.unpersisted_superprops = {};

    this.visualExperiments = new VisualExperimentsManager({
        getConfigFunc: _.bind(this.get_config, this),
        getVariantsFunc: _.bind(function() {
            return this.flags.getAllVariantsSync();
        }, this),
        trackExposureFunc: _.bind(function(featureName, feature) {
            this.flags.trackVisualExposure(featureName, feature);
        }, this)
    });
    this.visualExperiments.init();
    this.flags = new FeatureFlagManager({
        getFullApiRoute: _.bind(function() {
            return this.get_api_host('flags') + '/' + this.get_config('api_routes')['flags'];
        }, this),
        getConfigFunc: _.bind(this.get_config, this),
        setConfigFunc: _.bind(this.set_config, this),
        getPropertyFunc: _.bind(this.get_property, this),
        trackingFunc: _.bind(this.track, this),
        consentGate: this._consent,
        loadExtraBundle: load_extra_bundle,
        targetingSrc: this.get_config('targeting_src') || (this.get_config('lib_base_path') + TARGETING_FILENAME),
        visualExperiments: this.visualExperiments
    });
    this['flags'] = this.flags;
    var experimentsApi = this.visualExperiments.getExperimentsApi();
    if (experimentsApi) {
        this['experiments'] = experimentsApi;
    }

    this._consent.init();
    if (allows_storage) {
        this._start_services();
    }

    this.autocapture = new Autocapture(this);
    this.autocapture.init();
};

MixpanelLib.prototype._set_first_touch_people_properties = function() {
    if (this.get_config('skip_first_touch_marketing')) {
        return;
    }
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
        this['people'].set_once(initial_utm_params);
    }
};

// the services that store or send on their own; at init, and again on an opt-in under 'require_consent'
MixpanelLib.prototype._start_services = function() {
    // There is no need to set the distinct id
    // or the device id if something was already stored
    // in the persistence
    if (!this.get_distinct_id()) {
        this._init_device_id();
    }
    this.flags.init();
    this._init_tab_id();

    // Based on remote_settings_mode, fetch remote settings and then start session recording if applicable
    var mode = this.get_config('remote_settings_mode');
    if (mode === SETTING_STRICT || mode === SETTING_FALLBACK) {
        this.__session_recording_init_promise = this._fetch_remote_settings(mode).then(_.bind(function() {
            return this._check_and_start_session_recording();
        }, this));
    } else {
        this.__session_recording_init_promise = this._check_and_start_session_recording();
    }
};

/**
 * Start tracking when consent starts allowing storage: batching, storage and the services, then
 * what the page did before consent.
 */
MixpanelLib.prototype._start_tracking = function() {
    if (!this._batch_requests) {
        this._init_batching();
    }
    this['persistence'].open();
    this._start_services();

    // an identify() held from before consent goes first, so the people updates below go to that user
    var held_identify = this._consent.takeHeldIdentify();
    if (held_identify) {
        this.identify.apply(this, held_identify);
    }
    // first-touch and referrer properties were dropped before consent; an init with consent sends
    // them from create_mplib and _loaded instead
    this._set_first_touch_people_properties();
    this['people'].set_once(this['persistence'].get_referrer_info());
};

/**
 * Stop tracking when consent stops allowing storage: stop sending, recording and storing. The
 * props stay in memory, so an opt-in later on the page keeps the visitor's ID.
 */
MixpanelLib.prototype._stop_tracking = function() {
    this.stop_batch_senders();
    this.flags.reset();
    this['persistence'].close();
    this.recorderManager.stopSessionRecording();
};

/**
 * Delete everything stored about the visitor except the decision itself and unsent replay: the
 * persistence entry, queued requests, the tab ID and flag variants. Unsent replay stays on the
 * device; the recorder only loads, and so only uploads it, once consent allows storage again. Run
 * whenever consent doesn't allow storage, at init and after each decision.
 */
MixpanelLib.prototype._purge_stored_identifiers = function() {
    this['persistence'].remove_stored_entry();
    _.each(this.get_batcher_configs(), function(batcher_config) {
        _.localStorage.remove(batcher_config.queue_key);
    });
    this._remove_tab_id();
    this.flags.clearPersistedVariants();
};

MixpanelLib.prototype._remove_tab_id = function() {
    this.tab_id = null;
    // the support check probes storage by writing a key, which isn't allowed here; removing a key
    // the browser doesn't have costs nothing and is handled where storage isn't there at all
    var key_suffix = this._tab_id_key_suffix();
    _.sessionStorage.remove('mp_tab_id_' + key_suffix);
    _.sessionStorage.remove('mp_gen_new_tab_id_' + key_suffix);
};

MixpanelLib.prototype._init_batching = function() {
    this._batch_requests = this.get_config('batch_requests');
    if (!this._batch_requests) {
        return;
    }
    if (!_.localStorage.is_supported(true) || !USE_XHR) {
        this._batch_requests = false;
        console.log('Turning off Mixpanel request-queueing; needs XHR and localStorage support');
        _.each(this.get_batcher_configs(), function(batcher_config) {
            console.log('Clearing batch queue ' + batcher_config.queue_key);
            _.localStorage.remove(batcher_config.queue_key);
        });
        return;
    }

    if (!this.are_batchers_initialized()) {
        var batcher_for = _.bind(function(attrs) {
            return new RequestBatcher(
                attrs.queue_key,
                {
                    libConfig: this['config'],
                    errorReporter: this.get_config('error_reporter'),
                    sendRequestFunc: _.bind(function(data, options, cb) {
                        var api_routes = this.get_config('api_routes');
                        this._send_request(
                            this.get_api_host(attrs.api_name) + '/' + api_routes[attrs.api_name],
                            this._encode_data_for_request(data),
                            options,
                            this._prepare_callback(cb, data)
                        );
                    }, this),
                    beforeSendHook: _.bind(function(item) {
                        var ret = this._run_hook('before_send_' + attrs.type, item);
                        if (ret) {
                            return ret[0];
                        } else {
                            return null;
                        }
                    }, this),
                    stopAllBatchingFunc: _.bind(this.stop_batch_senders, this),
                    usePersistence: true,
                    consentGate: this._consent,
                }
            );
        }, this);
        var batcher_configs = this.get_batcher_configs();
        this.request_batchers = {
            events: batcher_for(batcher_configs.events),
            people: batcher_for(batcher_configs.people),
            groups: batcher_for(batcher_configs.groups)
        };

        if (sendBeacon && win.addEventListener) {
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
            win.addEventListener('pagehide', function(ev) {
                if (ev['persisted']) {
                    flush_on_unload();
                }
            });
            win.addEventListener('visibilitychange', function() {
                if (document$1['visibilityState'] === 'hidden') {
                    flush_on_unload();
                }
            });
        }
    }
    // a page that started the senders before consent expects them running once it's given
    if (this.get_config('batch_autostart') || this._batchers_were_started) {
        this.start_batch_senders();
    }
};

MixpanelLib.prototype._init_device_id = function() {
    var uuid = _.UUID();
    this.register_once({
        'distinct_id': DEVICE_ID_PREFIX + uuid,
        '$device_id': uuid
    }, '');
};

/**
 * Assigns a unique UUID to this tab / window by leveraging sessionStorage.
 * This is primarily used for session recording, where data must be isolated to the current tab.
 */
MixpanelLib.prototype._tab_id_key_suffix = function() {
    return this.get_config('name') + '_' + this.get_config('token');
};

MixpanelLib.prototype._init_tab_id = function() {
    if (!this._consent.allowsPersistence()) {
        console.log('Tab ID initialization skipped without persistence');
    } else if (_.sessionStorage.is_supported()) {
        try {
            var key_suffix = this._tab_id_key_suffix();
            var tab_id_key = 'mp_tab_id_' + key_suffix;

            // A flag is used to determine if sessionStorage is copied over and we need to generate a new tab ID.
            // This enforces a unique ID in the cases like duplicated tab, window.open(...)
            var should_generate_new_tab_id_key = 'mp_gen_new_tab_id_' + key_suffix;
            if (_.sessionStorage.get(should_generate_new_tab_id_key) || !_.sessionStorage.get(tab_id_key)) {
                _.sessionStorage.set(tab_id_key, '$tab-' + _.UUID());
            }

            _.sessionStorage.set(should_generate_new_tab_id_key, '1');
            this.tab_id = _.sessionStorage.get(tab_id_key);

            // Remove the flag when the tab is unloaded to indicate the stored tab ID can be reused. This event is not reliable to detect all page unloads,
            // but reliable in cases where the user remains in the tab e.g. a refresh or href navigation.
            // If the flag is absent, this indicates to the next SDK instance that we can reuse the stored tab_id.
            win.addEventListener('beforeunload', function () {
                _.sessionStorage.remove(should_generate_new_tab_id_key);
            });
        } catch(err) {
            this.report_error('Error initializing tab id', err);
        }
    } else {
        this.report_error('Session storage is not supported, cannot keep track of unique tab ID.');
    }
};

MixpanelLib.prototype.get_tab_id = function () {
    return this.tab_id || null;
};

MixpanelLib.prototype._check_and_start_session_recording = function(force_start) {
    if (!this._consent.allowsApiCalls()) {
        return;
    }
    return this.recorderManager.checkAndStartSessionRecording(force_start);
};

MixpanelLib.prototype._start_recording_on_event = safewrap(function(event_name, properties) {
    // Wait for recording init to complete before evaluating event triggers.
    // This ensures recording_event_triggers config is fully loaded when remote settings are used.
    if (this.__session_recording_init_promise) {
        this.__session_recording_init_promise.then(_.bind(function() {
            // In strict mode, skip recording if remote settings failed
            if (this._remote_settings_strict_disabled) {
                return;
            }
            return this.recorderManager.startRecordingOnEvent(event_name, properties);
        }, this));
    }
});

MixpanelLib.prototype.start_session_recording = function () {
    return this._check_and_start_session_recording(true);
};

MixpanelLib.prototype.stop_session_recording = function () {
    return this.recorderManager.stopSessionRecording();
};

MixpanelLib.prototype.pause_session_recording = function () {
    return this.recorderManager.pauseSessionRecording();
};

MixpanelLib.prototype.resume_session_recording = function () {
    return this.recorderManager.resumeSessionRecording();
};

MixpanelLib.prototype.is_recording_heatmap_data = function () {
    return this.recorderManager.isRecordingHeatmapData();
};

MixpanelLib.prototype.get_session_recording_properties = function () {
    return this.recorderManager.getSessionRecordingProperties();
};

MixpanelLib.prototype.get_session_replay_url = function () {
    return this.recorderManager.getSessionReplayUrl();
};

// "private" public method to reach into the recorder in test cases
MixpanelLib.prototype.__get_recorder = function () {
    return this.recorderManager.getRecorder();
};

// "private" public method to get session recording init promise in test cases
MixpanelLib.prototype.__get_recording_init_promise = function () {
    return this.__session_recording_init_promise;
};

// Private methods

MixpanelLib.prototype._loaded = function() {
    this.get_config('loaded')(this);
    this._set_default_superprops();
    this['people'].set_once(this['persistence'].get_referrer_info());

    // `store_google` is now deprecated and previously stored UTM parameters are cleared
    // from persistence by default.
    if (this.get_config('store_google') && this.get_config('stop_utm_persistence')) {
        var utm_params = _.info.campaignParams(null);
        _.each(utm_params, function(_utm_value, utm_key) {
            // We need to unregister persisted UTM parameters so old values
            // are not mixed with the new UTM parameters
            this.unregister(utm_key);
        }.bind(this));
    }
};

// update persistence with info on referrer, UTM params, etc
MixpanelLib.prototype._set_default_superprops = function() {
    this['persistence'].update_search_keyword(document$1.referrer);
    // Registering super properties for UTM persistence by 'store_google' is deprecated.
    if (this.get_config('store_google') && !this.get_config('stop_utm_persistence')) {
        this.register(_.info.campaignParams());
    }
    if (this.get_config('save_referrer')) {
        this['persistence'].update_referrer_info(document$1.referrer);
    }
};

MixpanelLib.prototype._dom_loaded = function() {
    _.each(this.__dom_loaded_queue, function(item) {
        this._track_dom.apply(this, item);
    }, this);

    if (this._consent.allowsApiCalls()) {
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

    // event, people and group requests all pass here; flags and replay ask the gate themselves
    if (!this._consent.allowsSending()) {
        console.log('Request dropped without consent');
        if (_.isFunction(callback)) {
            callback(0);
        }
        return false;
    }

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

    _.extend(data, this.get_config('api_extra_query_params'));

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
                                var response_headers = req['responseHeaders'] || {};
                                callback({status: 0, httpStatusCode: req['status'], error: error, retryAfter: response_headers['Retry-After']});
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

MixpanelLib.prototype._fetch_remote_settings = function(mode) {
    if (!this._consent.allowsFetching()) {
        return Promise.resolve();
    }

    var self = this;
    var disableRecordingIfStrict = function() {
        if (mode === 'strict') {
            self.set_config({'record_sessions_percent': 0});
            self._remote_settings_strict_disabled = true;
        }
    };

    if (!win['AbortController']) {
        console.critical('Remote settings unavailable: missing minimum required APIs');
        disableRecordingIfStrict();
        return Promise.resolve();
    }

    var settings_endpoint = this.get_api_host('settings') + '/' + this.get_config('api_routes')['settings'];
    var request_params = {
        '$lib_version': Config.LIB_VERSION,
        'mp_lib': 'web',
        'sdk_config': '1',
    };
    var query_string = _.HTTPBuildQuery(request_params);
    var full_url = settings_endpoint + '?' + query_string;

    var abortController = new AbortController();
    var timeout_id = setTimeout(function() {
        abortController.abort();
    }, 500);
    var fetchOptions = {
        'method': 'GET',
        'headers': {
            'Authorization': 'Basic ' + btoa(self.get_config('token') + ':'),
        },
        'signal': abortController.signal
    };

    return win['fetch'](full_url, fetchOptions).then(function(response) {
        clearTimeout(timeout_id);
        if (!response['ok']) {
            console.critical('Network response was not ok');
            disableRecordingIfStrict();
            return;
        }
        return response.json();
    }).then(function(result) {
        if (result && result['sdk_config'] && result['sdk_config']['config']) {
            var remote_config = result['sdk_config']['config'];

            // Verify that remote config contains only valid keys from DEFAULT_CONFIG
            var valid_config = {};
            _.each(remote_config, function(value, key) {
                if (DEFAULT_CONFIG.hasOwnProperty(key)) {
                    valid_config[key] = value;
                }
            });

            if (_.isEmptyObject(valid_config)) {
                console.critical('No valid config keys found in remote settings.');
                disableRecordingIfStrict();
            } else {
                self.set_config(valid_config);
            }
        } else {
            disableRecordingIfStrict();
        }
    }).catch(function(err) {
        clearTimeout(timeout_id);
        console.critical('Failed to fetch remote settings', err);
        disableRecordingIfStrict();
    });
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

MixpanelLib.prototype.get_batcher_configs = function() {
    var queue_prefix = '__mpq_' + this.get_config('token');
    this._batcher_configs = this._batcher_configs || {
        events: {type: 'events', api_name: 'track', queue_key: queue_prefix + '_ev'},
        people: {type: 'people', api_name: 'engage', queue_key: queue_prefix + '_pp'},
        groups: {type: 'groups', api_name: 'groups', queue_key: queue_prefix + '_gr'}
    };
    return this._batcher_configs;
};

MixpanelLib.prototype.start_batch_senders = function() {
    this._batchers_were_started = true;
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
 * @example
 * ```js
 * mixpanel.push(['register', { a: 'b' }]);
 * ```
 *
 * @param {Array} item A [function_name, args...] array to be executed
 */
MixpanelLib.prototype.push = function(item) {
    this._execute_array([item]);
};

/**
 * Enables events on the Mixpanel object. If passed no arguments,
 * this function enable tracking of all events. If passed an
 * array of event names, those events will be enabled, but other
 * existing disabled events will continue to be not tracked.
 *
 * @param {Array} [events] An array of event names to enable
 */
MixpanelLib.prototype.enable = function(events) {
    var keys, new_disabled_events, i, j;

    if (typeof(events) === 'undefined') {
        this._flags.disable_all_events = false;
    } else {
        keys = {};
        new_disabled_events = [];
        for (i = 0; i < events.length; i++) {
            keys[events[i]] = true;
        }
        for (j = 0; j < this.__disabled_events.length; j++) {
            if (!keys[this.__disabled_events[j]]) {
                new_disabled_events.push(this.__disabled_events[j]);
            }
        }
        this.__disabled_events = new_disabled_events;
    }
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
    var encoded_data = JSONStringify(data);
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
            if (truncated_data) {
                truncated_data = truncated_data[0];
            }
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
        batcher.enqueue(truncated_data).then(function(succeeded) {
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
 * To track link clicks or form submissions, see track_links() or track_forms().
 *
 * @example
 * ```js
 * // track an event named 'Registered'
 * mixpanel.track('Registered', {'Gender': 'Male', 'Age': 21});
 *
 * // track an event using navigator.sendBeacon
 * mixpanel.track('Left page', {'duration_seconds': 35}, {transport: 'sendBeacon'});
 * ```
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
MixpanelLib.prototype.track = function(event_name, properties, options, callback) {
    if (!callback && typeof options === 'function') {
        callback = options;
        options = null;
    }
    if (!this._consent.allowsApiCalls()) {
        if (_.isFunction(callback)) {
            callback(0);
        }
        return;
    }
    var ret;
    if (!(options && options.skip_hooks)) {
        ret = this._run_hook('before_track', event_name, properties);
        if (ret === null) {
            return;
        } else {
            event_name = ret[0];
            properties = ret[1];
        }
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
    properties = _.extend({}, properties);
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
        _.info.properties({'mp_loader': this.get_config('mp_loader')}),
        marketing_properties,
        this['persistence'].properties(),
        this.unpersisted_superprops,
        this.get_session_recording_properties(),
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

    // Intentionally not checking skip_hooks here. on_track is intended to fire for all events
    ret = this._run_hook('on_track', event_name, properties);
    if (ret === null) {
        return;
    }
    event_name = ret[0];
    properties = ret[1];

    this._start_recording_on_event(event_name, properties);

    var data = {
        'event': event_name,
        'properties': properties
    };
    ret = this._track_or_batch({
        type: 'events',
        data: data,
        endpoint: this.get_api_host('events') + '/' + this.get_config('api_routes')['track'],
        batcher: this.request_batchers.events,
        should_send_immediately: should_send_immediately,
        send_request_options: options
    }, callback);

    // Check for first-time event matches
    if (this.flags && this.flags.checkFirstTimeEvents) {
        this.flags.checkFirstTimeEvents(event_name, properties);
    }

    return ret;
};

/**
 * Register the current user into one/many groups.
 *
 * @example
 * ```js
 * mixpanel.set_group('company', ['mixpanel', 'google']) // an array of IDs
 * mixpanel.set_group('company', 'mixpanel')
 * mixpanel.set_group('company', 128746312)
 * ```
 *
 * @param {String} group_key Group key
 * @param {Array|String|Number} group_ids An array of group IDs, or a singular group ID
 * @param {Function} [callback] If provided, the callback will be called after tracking the event.
 *
 */
MixpanelLib.prototype.set_group = function(group_key, group_ids, callback) {
    if (!this._consent.allowsApiCalls()) {
        if (_.isFunction(callback)) {
            callback(0);
        }
        return;
    }
    if (!_.isArray(group_ids)) {
        group_ids = [group_ids];
    }
    var prop = {};
    prop[group_key] = group_ids;
    this.register(prop);
    return this['people'].set(group_key, group_ids, callback);
};

/**
 * Add a new group for this user.
 *
 * @example
 * ```js
 * mixpanel.add_group('company', 'mixpanel')
 * ```
 *
 * @param {String} group_key Group key
 * @param {*} group_id A valid Mixpanel property type
 * @param {Function} [callback] If provided, the callback will be called after tracking the event.
 */
MixpanelLib.prototype.add_group = function(group_key, group_id, callback) {
    if (!this._consent.allowsApiCalls()) {
        if (_.isFunction(callback)) {
            callback(0);
        }
        return;
    }
    var old_values = this.get_property(group_key);
    var prop = {};
    if (old_values === undefined) {
        prop[group_key] = [group_id];
        this.register(prop);
    } else {
        if (old_values.indexOf(group_id) === -1) {
            old_values.push(group_id);
            prop[group_key] = old_values;
            this.register(prop);
        }
    }
    return this['people'].union(group_key, group_id, callback);
};

/**
 * Remove a group from this user.
 *
 * @example
 * ```js
 * mixpanel.remove_group('company', 'mixpanel')
 * ```
 *
 * @param {String} group_key Group key
 * @param {*} group_id A valid Mixpanel property type
 * @param {Function} [callback] If provided, the callback will be called after tracking the event.
 */
MixpanelLib.prototype.remove_group = function(group_key, group_id, callback) {
    if (!this._consent.allowsApiCalls()) {
        if (_.isFunction(callback)) {
            callback(0);
        }
        return;
    }
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
};

/**
 * Track an event with specific groups.
 *
 * @example
 * ```js
 * mixpanel.track_with_groups('purchase', {'product': 'iphone'}, {'University': ['UCB', 'UCLA']})
 * ```
 *
 * @param {String} event_name The name of the event (see `mixpanel.track()`)
 * @param {Object=} properties A set of properties to include with the event you're sending (see `mixpanel.track()`)
 * @param {Object=} groups An object mapping group name keys to one or more values
 * @param {Function} [callback] If provided, the callback will be called after tracking the event.
 */
MixpanelLib.prototype.track_with_groups = function(event_name, properties, groups, callback) {
    var tracking_props = _.extend({}, properties || {});
    _.each(groups, function(v, k) {
        if (v !== null && v !== undefined) {
            tracking_props[k] = v;
        }
    });
    return this.track(event_name, tracking_props, callback);
};

MixpanelLib.prototype._create_map_key = function (group_key, group_id) {
    return group_key + '_' + JSON.stringify(group_id);
};

MixpanelLib.prototype._remove_group_from_cache = function (group_key, group_id) {
    delete this._cached_groups[this._create_map_key(group_key, group_id)];
};

/**
 * Look up reference to a Mixpanel group
 *
 * @example
 * ```js
 * mixpanel.get_group(group_key, group_id)
 * ```
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
        group._init(this, group_key, group_id, this._consent);
        this._cached_groups[map_key] = group;
    }
    return group;
};

/**
 * Track a default Mixpanel page view event, which includes extra default event properties to
 * improve page view data.
 *
 * @example
 * ```js
 * // track a default $mp_web_page_view event
 * mixpanel.track_pageview();
 *
 * // track a page view event with additional event properties
 * mixpanel.track_pageview({'ab_test_variant': 'card-layout-b'});
 *
 * // example approach to track page views on different page types as event properties
 * mixpanel.track_pageview({'page': 'pricing'});
 * mixpanel.track_pageview({'page': 'homepage'});
 *
 * // UNCOMMON: Tracking a page view event with a custom event_name option. NOT expected to be used for
 * // individual pages on the same site or product. Use cases for custom event_name may be page
 * // views on different products or internal applications that are considered completely separate
 * mixpanel.track_pageview({'page': 'customer-search'}, {'event_name': '[internal] Admin Page View'});
 * ```
 *
 * @remarks
 *
 * The `config.track_pageview` option for <a href="#mixpanelinit">mixpanel.init()</a>
 * may be turned on for tracking page loads automatically.
 *
 *     // track only page loads
 *     mixpanel.init(PROJECT_TOKEN, {track_pageview: true});
 *
 *     // track when the URL changes in any manner
 *     mixpanel.init(PROJECT_TOKEN, {track_pageview: 'full-url'});
 *
 *     // track when the URL changes, ignoring any changes in the hash part
 *     mixpanel.init(PROJECT_TOKEN, {track_pageview: 'url-with-path-and-query-string'});
 *
 *     // track when the path changes, ignoring any query parameter or hash changes
 *     mixpanel.init(PROJECT_TOKEN, {track_pageview: 'url-with-path'});
 *
 * @param {Object} [properties] An optional set of additional properties to send with the page view event
 * @param {Object} [options] Page view tracking options
 * @param {String} [options.event_name] - Alternate name for the tracking event
 * @returns {Boolean|Object} If the tracking request was successfully initiated/queued, an object
 * with the tracking payload sent to the API server is returned; otherwise false.
 */
MixpanelLib.prototype.track_pageview = function(properties, options) {
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

    if (this.is_recording_heatmap_data()) {
        event_properties['$captured_for_heatmap'] = true;
    }

    return this.track(event_name, event_properties);
};

/**
 * Track clicks on a set of document elements. Selector must be a
 * valid query. Elements must exist on the page at the time track_links is called.
 *
 * @example
 * ```js
 * // track click for link id #nav
 * mixpanel.track_links('#nav', 'Clicked Nav Link');
 * ```
 *
 * @remarks
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
 * @param {Object|String} query A valid DOM query, element or jQuery-esque list
 * @param {String} event_name The name of the event to track
 * @param {Object|Function} [properties] A properties object or function that returns a dictionary of properties when passed a DOMElement
 */
MixpanelLib.prototype.track_links = function(query, event_name, properties) { // eslint-disable-line no-unused-vars
    return this._track_dom.call(this, LinkTracker, arguments);
};

/**
 * Track form submissions. Selector must be a valid query.
 *
 * @example
 * ```js
 * // track submission for form id 'register'
 * mixpanel.track_forms('#register', 'Created Account');
 * ```
 *
 * @remarks
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
 * @param {Object|String} query A valid DOM query, element or jQuery-esque list
 * @param {String} event_name The name of the event to track
 * @param {Object|Function} [properties] This can be a set of properties, or a function that returns a set of properties after being passed a DOMElement
 */
MixpanelLib.prototype.track_forms = function(query, event_name, properties) { // eslint-disable-line no-unused-vars
    return this._track_dom.call(this, FormTracker, arguments);
};

/**
 * Time an event by including the time between this call and a
 * later 'track' call for the same event in the properties sent
 * with the event.
 *
 * When called for a particular event name, the next track call for that event
 * name will include the elapsed time between the 'time_event' and 'track'
 * calls. This value is stored as seconds in the '$duration' property.
 *
 * @example
 * ```js
 * // time an event named 'Registered'
 * mixpanel.time_event('Registered');
 * mixpanel.track('Registered', {'Gender': 'Male', 'Age': 21});
 * ```
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
 * @example
 * ```js
 * // register 'Gender' as a super property
 * mixpanel.register({'Gender': 'Female'});
 *
 * // register several super properties when a user signs up
 * mixpanel.register({
 *     'Email': 'jdoe@example.com',
 *     'Account Type': 'Free'
 * });
 *
 * // register only for the current pageload
 * mixpanel.register({'Name': 'Pat'}, {persistent: false});
 * ```
 *
 * @param {Object} props An associative array of properties to store about the user
 * @param {Number|Object} [days_or_options] Options object or number of days since the user's last visit to store the super properties (only valid for persisted props)
 * @param {boolean} [days_or_options.days] - number of days since the user's last visit to store the super properties (only valid for persisted props)
 * @param {boolean} [days_or_options.persistent=true] - whether to put in persistent storage (cookie/localStorage)
 */
MixpanelLib.prototype.register = function(props, days_or_options) {
    var ret = this._run_hook('before_register', props, days_or_options);
    if (ret === null) {
        return;
    } else {
        props = ret[0];
        days_or_options = ret[1];
    }

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
 * @example
 * ```js
 * // register a super property for the first time only
 * mixpanel.register_once({
 *     'First Login Date': new Date().toISOString()
 * });
 *
 * // register once, only for the current pageload
 * mixpanel.register_once({
 *     'First interaction time': new Date().toISOString()
 * }, 'None', {persistent: false});
 * ```
 *
 * @remarks
 *
 * If default_value is specified, current super properties
 * with that value will be overwritten.
 *
 * @param {Object} props An associative array of properties to store about the user
 * @param {*} [default_value] Value to override if already set in super properties (ex: 'False') Default: 'None'
 * @param {Number|Object} [days_or_options] Options object or number of days since the user's last visit to store the super properties (only valid for persisted props)
 * @param {boolean} [days_or_options.days] - number of days since the user's last visit to store the super properties (only valid for persisted props)
 * @param {boolean} [days_or_options.persistent=true] - whether to put in persistent storage (cookie/localStorage)
 */
MixpanelLib.prototype.register_once = function(props, default_value, days_or_options) {
    var ret = this._run_hook('before_register_once', props, default_value, days_or_options);
    if (ret === null) {
        return;
    } else {
        props = ret[0];
        default_value = ret[1];
        days_or_options = ret[2];
    }

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
    var ret = this._run_hook('before_unregister', property, options);
    if (ret === null) {
        return;
    } else {
        property = ret[0];
        options = ret[1];
    }

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
 * @remarks
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
 * With consent_mode 'require_consent', the latest call made before the visitor consents is held in
 * memory, without storing or sending anything, and applied if they opt in on the same page. reset()
 * discards it.
 *
 * @param {String} [new_distinct_id] A string that uniquely identifies a user. If not provided, the distinct_id currently in the persistent store (cookie or localStorage) will be used.
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
    if (!this._consent.allowsStoring()) {
        this._consent.holdIdentify(Array.prototype.slice.call(arguments));
        console.log('identify() held until consent');
        return;
    }

    var ret = this._run_hook('before_identify', new_distinct_id);

    if (ret === null) {
        return -1;
    } else {
        new_distinct_id = ret[0];
    }

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

    // check feature flags again if distinct id has changed
    if (new_distinct_id !== previous_distinct_id) {
        this.flags.fetchFlags().catch(function() {
            console.error('[flags] Error fetching flags during identify');
        });
    }
};

/**
 * Clears super properties and generates a new random distinct_id for this instance.
 * Useful for clearing data when a user logs out.
 */
MixpanelLib.prototype.reset = function() {
    this.stop_session_recording();
    this['persistence'].clear();
    this._flags.identify_called = false;
    this._consent.takeHeldIdentify();
    // before consent the device ID is minted on opt-in instead
    if (this._consent.allowsStoring()) {
        this._init_device_id();
    }
    this._check_and_start_session_recording();
    this.flags.reset();
};

/**
 * Returns the current distinct id of the user. This is either the id automatically
 * generated by the library or the id that has been passed by a call to identify().
 *
 * @remarks
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
 * @remarks
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
    if (!this._consent.allowsStoring()) {
        console.log('alias() dropped without consent');
        return;
    }

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
 *       // host for requests (customizable for e.g. a local proxy)
 *       api_host: 'https://api-js.mixpanel.com',
 *
 *       // endpoints for different types of requests
 *       api_routes: {
 *         track: 'track/',
 *         engage: 'engage/',
 *         groups: 'groups/',
 *       }
 *
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
 *       // what happens before the visitor decides: 'no_consent_required' (unset) or
 *       // 'require_consent'. opt_out_tracking_by_default applies only when it's unset.
 *       // Fixed at init.
 *       consent_mode: null
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
 * @param {Partial<import('./index.d.ts').Config>} config A dictionary of new configuration values to update; see the Config type for the available options.
 */
MixpanelLib.prototype.set_config = function(config) {
    if (_.isObject(config)) {
        if (this._consent && 'consent_mode' in config && config['consent_mode'] !== this.get_config('consent_mode')) {
            console.critical('consent_mode can only be set at init; ignoring the change');
            config = _.extend({}, config);
            delete config['consent_mode'];
        }
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

        if (('autocapture' in config || 'record_heatmap_data' in config) && this.autocapture) {
            this.autocapture.init();
        }

        if (_.isObject(config['hooks'])) {
            this.hooks = {};
            _.each(config['hooks'], function(hook_value, hook_name) {
                if (_.isFunction(hook_value)) {
                    this.hooks[hook_name] = [hook_value];
                } else if (_.isArray(hook_value)) {
                    this.hooks[hook_name] = [];
                    for (var i = 0; i < hook_value.length; i++) {
                        if (!_.isFunction(hook_value[i])) {
                            console.critical('Invalid hook added. Hook is not a function');
                        }
                        this.hooks[hook_name].push(hook_value[i]);
                    }
                } else {
                    console.critical('Invalid hooks added. Ensure that the hook values passed into config.hooks are functions or arrays of functions.');
                }
            }, this);
        }
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
    var hook_data = slice.call(arguments, 1);
    _.each(this.hooks[hook_name], function(hook) {
        if (hook_data === null) {
            return null;
        }

        var ret = hook.apply(this, hook_data);

        if (typeof ret === 'undefined') {
            this.report_error(hook_name + ' hook did not return a valid value');
            hook_data = null;
        } else {
            if (!_.isArray(ret)) {
                ret = [ret];
            }
            hook_data.splice.apply(hook_data, [0, ret.length].concat(ret));
        }
    }, this);

    return hook_data;
};

/**
 * Returns the value of the super property named property_name. If no such
 * property is set, get_property() will return the undefined value.
 *
 * @remarks
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
    return this['persistence'].load_prop([property_name]);
};

/**
 * Get the API host for a specific endpoint type, falling back to the default api_host if not specified
 *
 * @param {String} endpoint_type The type of endpoint (e.g., "events", "people", "groups")
 * @returns {String} The API host to use for this endpoint
 */
MixpanelLib.prototype.get_api_host = function(endpoint_type) {
    return this.get_config('api_hosts')[endpoint_type] || this.get_config('api_host');
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

/**
 * Whether consent allows something now; see ConsentManager.allows. The separately built recorder
 * bundle calls this by its quoted name.
 * @param {string} capability
 * @returns {boolean}
 */
MixpanelLib.prototype._consent_allows = function(capability) {
    return this._consent.allows(capability);
};

/**
 * Turn persistence, batching and recording off, or back on after an opt-in. Batching only restarts
 * if it was running before, so an opt-in doesn't start it for the first time.
 * @param {boolean} disabled
 */
MixpanelLib.prototype._set_persistence_disabled = function(disabled) {
    if (disabled) {
        this['persistence'].close();
    } else {
        this['persistence'].open();
    }

    if (disabled) {
        this.stop_batch_senders();
        this.stop_session_recording();
    } else if (this._batchers_were_started) {
        this.start_batch_senders();
    }
};

// delete the identified user's profile and charges, which the opt-out about to happen would block
MixpanelLib.prototype._delete_user_for_opt_out = function() {
    if (this['people'] && this['people']._identify_called()) {
        this['people'].delete_user();
        this['people'].clear_charges();
    }
};

/**
 * Opt the user in to data tracking and cookies/localstorage for this Mixpanel instance
 *
 * @example
 * ```js
 * // opt user in
 * mixpanel.opt_in_tracking();
 *
 * // opt user in with specific event name, properties, cookie configuration
 * mixpanel.opt_in_tracking({
 *     track_event_name: 'User opted in',
 *     track_event_properties: {
 *         'Email': 'jdoe@example.com'
 *     },
 *     cookie_expiration: 30,
 *     secure_cookie: true
 * });
 * ```
 *
 * With consent_mode 'require_consent', the decision is stored with the instance's persistence and
 * cookie config: the storage options and enable_persistence below don't apply, and the track
 * options do.
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
    this._consent.optIn(options);
};

/**
 * Opt the user out of data tracking and cookies/localstorage for this Mixpanel instance
 *
 * @example
 * ```js
 * // opt user out
 * mixpanel.opt_out_tracking();
 *
 * // opt user out with different cookie configuration from Mixpanel instance
 * mixpanel.opt_out_tracking({
 *     cookie_expiration: 30,
 *     secure_cookie: true
 * });
 * ```
 *
 * With consent_mode 'require_consent', the decision is stored with the instance's persistence and
 * cookie config: the storage options, clear_persistence and delete_user below don't apply. The
 * stored identifiers are deleted instead, and no $delete is sent.
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
    this._consent.optOut(options);
};

/**
 * Check whether the user has opted in to data tracking and cookies/localstorage for this Mixpanel instance
 *
 * @example
 * ```js
 * var has_opted_in = mixpanel.has_opted_in_tracking();
 * // use has_opted_in value
 * ```
 *
 * With consent_mode 'require_consent' the options don't apply.
 *
 * @param {Object} [options] A dictionary of config options to override
 * @param {string} [options.persistence_type] Persistence mechanism to read - cookie or localStorage - falls back to cookie if localStorage is unavailable. Defaults to opt_out_tracking_persistence_type; for localStorage, whichever store holds the flag
 * @param {string} [options.cookie_prefix=__mp_opt_in_out] Custom prefix to be used in the cookie/localstorage name
 * @returns {boolean} current opt-in status
 */
MixpanelLib.prototype.has_opted_in_tracking = function(options) {
    return this._consent.hasOptedIn(options);
};

/**
 * Check whether the user has opted out of data tracking and cookies/localstorage for this Mixpanel instance
 *
 * @example
 * ```js
 * var has_opted_out = mixpanel.has_opted_out_tracking();
 * // use has_opted_out value
 * ```
 *
 * With consent_mode 'require_consent' the options don't apply, and a stored refusal or Do Not Track
 * counts as opted out.
 *
 * @param {Object} [options] A dictionary of config options to override
 * @param {string} [options.persistence_type] Persistence mechanism to read - cookie or localStorage - falls back to cookie if localStorage is unavailable. Defaults to opt_out_tracking_persistence_type; for localStorage, whichever store holds the flag
 * @param {string} [options.cookie_prefix=__mp_opt_in_out] Custom prefix to be used in the cookie/localstorage name
 * @returns {boolean} current opt-out status
 */
MixpanelLib.prototype.has_opted_out_tracking = function(options) {
    return this._consent.hasOptedOut(options);
};

/**
 * Clear the user's opt in/out status of data tracking and cookies/localstorage for this Mixpanel instance
 *
 * @example
 * ```js
 * // clear user's opt-in/out status
 * mixpanel.clear_opt_in_out_tracking();
 *
 * // clear user's opt-in/out status with specific cookie configuration - should match
 * // configuration used when opt_in_tracking/opt_out_tracking methods were called.
 * mixpanel.clear_opt_in_out_tracking({
 *     cookie_expiration: 30,
 *     secure_cookie: true
 * });
 * ```
 *
 * With consent_mode 'require_consent', the decision is stored with the instance's persistence and
 * cookie config: the storage options and enable_persistence below don't apply. Clearing also
 * deletes the device's stored identifiers, and on a page tracking after an opt-in it stops
 * tracking.
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
    this._consent.clear(options);
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

MixpanelLib.prototype.add_hook = function(hook_name, hook_fn) {
    if (!this.hooks[hook_name]) {
        this.hooks[hook_name] = [];
    }
    this.hooks[hook_name].push(hook_fn);
};

MixpanelLib.prototype.remove_hook = function(hook_name, hook_fn) {
    var fn_index;
    if (this.hooks[hook_name]) {
        fn_index = this.hooks[hook_name].indexOf(hook_fn);
        if (fn_index !== -1) {
            this.hooks[hook_name].splice(fn_index, 1);
        } else {
            console.log('remove_hook failed. Matching hook was not found');
        }
    }
};

// EXPORTS (for closure compiler)

// MixpanelLib Exports
// (assigned through an alias: a second `MixpanelLib.prototype[...]` declaration of each method would
// make TypeScript type them as `any`, which breaks the generated API docs)
var MixpanelLibProto = MixpanelLib.prototype;
MixpanelLibProto['init']                               = MixpanelLibProto.init;
MixpanelLibProto['reset']                              = MixpanelLibProto.reset;
MixpanelLibProto['enable']                             = MixpanelLibProto.enable;
MixpanelLibProto['disable']                            = MixpanelLibProto.disable;
MixpanelLibProto['time_event']                         = MixpanelLibProto.time_event;
MixpanelLibProto['track']                              = MixpanelLibProto.track;
MixpanelLibProto['track_links']                        = MixpanelLibProto.track_links;
MixpanelLibProto['track_forms']                        = MixpanelLibProto.track_forms;
MixpanelLibProto['track_pageview']                     = MixpanelLibProto.track_pageview;
MixpanelLibProto['register']                           = MixpanelLibProto.register;
MixpanelLibProto['register_once']                      = MixpanelLibProto.register_once;
MixpanelLibProto['unregister']                         = MixpanelLibProto.unregister;
MixpanelLibProto['identify']                           = MixpanelLibProto.identify;
MixpanelLibProto['alias']                              = MixpanelLibProto.alias;
MixpanelLibProto['name_tag']                           = MixpanelLibProto.name_tag;
MixpanelLibProto['set_config']                         = MixpanelLibProto.set_config;
MixpanelLibProto['get_config']                         = MixpanelLibProto.get_config;
MixpanelLibProto['get_api_host']                       = MixpanelLibProto.get_api_host;
MixpanelLibProto['get_property']                       = MixpanelLibProto.get_property;
MixpanelLibProto['get_distinct_id']                    = MixpanelLibProto.get_distinct_id;
MixpanelLibProto['toString']                           = MixpanelLibProto.toString;
MixpanelLibProto['opt_out_tracking']                   = MixpanelLibProto.opt_out_tracking;
MixpanelLibProto['opt_in_tracking']                    = MixpanelLibProto.opt_in_tracking;
MixpanelLibProto['has_opted_out_tracking']             = MixpanelLibProto.has_opted_out_tracking;
MixpanelLibProto['_consent_allows']                    = MixpanelLibProto._consent_allows;
MixpanelLibProto['has_opted_in_tracking']              = MixpanelLibProto.has_opted_in_tracking;
MixpanelLibProto['clear_opt_in_out_tracking']          = MixpanelLibProto.clear_opt_in_out_tracking;
MixpanelLibProto['get_group']                          = MixpanelLibProto.get_group;
MixpanelLibProto['set_group']                          = MixpanelLibProto.set_group;
MixpanelLibProto['add_group']                          = MixpanelLibProto.add_group;
MixpanelLibProto['remove_group']                       = MixpanelLibProto.remove_group;
MixpanelLibProto['add_hook']                           = MixpanelLibProto.add_hook;
MixpanelLibProto['remove_hook']                        = MixpanelLibProto.remove_hook;
MixpanelLibProto['track_with_groups']                  = MixpanelLibProto.track_with_groups;
MixpanelLibProto['start_batch_senders']                = MixpanelLibProto.start_batch_senders;
MixpanelLibProto['stop_batch_senders']                 = MixpanelLibProto.stop_batch_senders;
MixpanelLibProto['start_session_recording']            = MixpanelLibProto.start_session_recording;
MixpanelLibProto['stop_session_recording']             = MixpanelLibProto.stop_session_recording;
MixpanelLibProto['pause_session_recording']            = MixpanelLibProto.pause_session_recording;
MixpanelLibProto['resume_session_recording']           = MixpanelLibProto.resume_session_recording;
MixpanelLibProto['get_session_recording_properties']   = MixpanelLibProto.get_session_recording_properties;
MixpanelLibProto['get_session_replay_url']             = MixpanelLibProto.get_session_replay_url;
MixpanelLibProto['get_tab_id']                         = MixpanelLibProto.get_tab_id;
MixpanelLibProto['DEFAULT_API_ROUTES']                 = DEFAULT_API_ROUTES;
MixpanelLibProto['SDK_VERSION']                        = Config.LIB_VERSION;

// Exports intended only for testing
MixpanelLibProto['__get_recorder']                     = MixpanelLibProto.__get_recorder;
MixpanelLibProto['__get_recording_init_promise']       = MixpanelLibProto.__get_recording_init_promise;

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
                win[PRIMARY_INSTANCE_NAME] = mixpanel_master;
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
            toplevel = win.frameElement === null;
        } catch(e) {
            // noop
        }

        if (document$1.documentElement.doScroll && toplevel) {
            do_scroll_check();
        }
    }

    // fallback handler, always will work
    _.register_event(win, 'load', dom_loaded_handler, true);
};

function init_as_module(bundle_loader) {
    load_extra_bundle = bundle_loader;
    init_type = INIT_MODULE;
    mixpanel_master = new MixpanelLib();

    override_mp_init_func();
    mixpanel_master['init']();
    add_dom_loaded_handler();

    return mixpanel_master;
}

// For loading separate bundles asynchronously via script tag
// so that we don't load them until they are needed at runtime.

// For builds that do NOT want any extra bundles (e.g. session recorder)
// and just the main SDK, throw an error when trying to load a separate bundle.
// eslint-disable-next-line no-unused-vars
function loadThrowError (src, _onload) {
    throw new Error('This build of Mixpanel only includes core SDK functionality, could not load ' + src);
}

/* eslint camelcase: "off" */

var mixpanel = init_as_module(loadThrowError);

module.exports = mixpanel;
