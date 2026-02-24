(function () {
    'use strict';

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

    /**
     * Shared global window property names used across modules
     */

    // Targeting library global (used by flags and targeting modules)
    var TARGETING_GLOBAL_NAME = '__mp_targeting';

    var Config = {
        LIB_VERSION: '2.75.0-rc3'
    };

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

    function schedule(fn,self) {
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
                schedule(function(){
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
                    schedule(notify,self);
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
            schedule(notify,self);
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
                schedule(notify,def);
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
    if (typeof Promise !== 'undefined' && Promise.toString().indexOf('[native code]') !== -1) ;

    /* eslint camelcase: "off", eqeqeq: "off" */

    /*
     * Saved references to long variable names, so that closure compiler can
     * minimize file size.
     */

    var ArrayProto = Array.prototype,
        FuncProto = Function.prototype,
        ObjProto = Object.prototype,
        slice = ArrayProto.slice,
        toString = ObjProto.toString,
        hasOwnProperty = ObjProto.hasOwnProperty;
        win.console;
        var navigator = win.navigator,
        document = win.document,
        windowOpera = win.opera,
        screen = win.screen,
        userAgent = navigator.userAgent;

    var nativeBind = FuncProto.bind,
        nativeForEach = ArrayProto.forEach,
        nativeIndexOf = ArrayProto.indexOf,
        nativeMap = ArrayProto.map,
        nativeIsArray = Array.isArray,
        breaker = {};

    var _ = {
        trim: function(str) {
            // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/Trim#Polyfill
            return str.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
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

    _.getQueryParam = function(url, param) {
        // Expects a raw URL

        param = param.replace(/[[]/g, '\\[').replace(/[\]]/g, '\\]');
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
            }
            return result.replace(/\+/g, ' ');
        }
    };


    // _.cookie
    // Methods partially borrowed from quirksmode.org/js/cookies.html
    _.cookie = {
        get: function(name) {
            var nameEQ = name + '=';
            var ca = document.cookie.split(';');
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
                var domain = extract_domain(document.location.hostname);
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

            document.cookie = name + '=' + encodeURIComponent(value) + expires + '; path=/' + cdomain + secure;
        },

        set: function(name, value, days, is_cross_subdomain, is_secure, is_cross_site, domain_override) {
            var cdomain = '', expires = '', secure = '';

            if (domain_override) {
                cdomain = '; domain=' + domain_override;
            } else if (is_cross_subdomain) {
                var domain = extract_domain(document.location.hostname);
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
            document.cookie = new_cookie_val;
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
        return _localStorageSupported = _testStorageSupported(storage || win.localStorage);
    };

    var _sessionStorageSupported = null;
    var sessionStorageSupported = function(storage, forceCheck) {
        if (_sessionStorageSupported !== null && !forceCheck) {
            return _sessionStorageSupported;
        }
        return _sessionStorageSupported = _testStorageSupported(storage || win.sessionStorage);
    };

    function _storageWrapper(storage, name, is_supported_fn) {
        var log_error = function(msg) {
        };

        return {
            is_supported: function(forceCheck) {
                var supported = is_supported_fn(storage, forceCheck);
                return supported;
            },
            error: log_error,
            get: function(key) {
                try {
                    return storage.getItem(key);
                } catch (err) {
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
                }
            },
            remove: function(key) {
                try {
                    storage.removeItem(key);
                } catch (err) {
                }
            }
        };
    }

    // Safari errors out accessing localStorage/sessionStorage when cookies are disabled,
    // so create dummy storage wrappers that silently fail as a fallback.
    var windowLocalStorage = null, windowSessionStorage = null;
    try {
        windowLocalStorage = win.localStorage;
        windowSessionStorage = win.sessionStorage;
        // eslint-disable-next-line no-empty
    } catch (_err) {}

    _.localStorage = _storageWrapper(windowLocalStorage, 'localStorage', localStorageSupported);
    _.sessionStorage = _storageWrapper(windowSessionStorage, 'sessionStorage', sessionStorageSupported);

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
            if (!document.getElementsByTagName) {
                return [];
            }
            // Split selector in to tokens
            var tokens = selector.split(' ');
            var token, bits, tagName, found, foundCount, i, j, k, elements, currentContextIndex;
            var currentContext = [document];
            for (i = 0; i < tokens.length; i++) {
                token = tokens[i].replace(/^\s+/, '').replace(/\s+$/, '');
                if (token.indexOf('#') > -1) {
                    // Token is an ID selector
                    bits = token.split('#');
                    tagName = bits[0];
                    var id = bits[1];
                    var element = document.getElementById(id);
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
                kw = _.getQueryParam(document.URL, kwkey);
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
                id = _.getQueryParam(document.URL, idkey);
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
                'Android Mobile': /android\s(\d+(\.\d+)?)/,
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
            return win.location.href;
        },

        properties: function(extra_props) {
            if (typeof extra_props !== 'object') {
                extra_props = {};
            }
            return _.extend(_.strip_empty_properties({
                '$os': _.info.os(),
                '$browser': _.info.browser(userAgent, navigator.vendor, windowOpera),
                '$referrer': document.referrer,
                '$referring_domain': _.info.referringDomain(document.referrer),
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
                'current_page_title': document.title,
                'current_domain': win.location.hostname,
                'current_url_path': win.location.pathname,
                'current_url_protocol': win.location.protocol,
                'current_url_search': win.location.search
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

    function getDefaultExportFromCjs (x) {
    	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
    }

    var logic$1 = {exports: {}};

    /* globals define,module */
    var logic = logic$1.exports;

    var hasRequiredLogic;

    function requireLogic () {
    	if (hasRequiredLogic) return logic$1.exports;
    	hasRequiredLogic = 1;
    	(function (module, exports) {
    (function(root, factory) {
    		  {
    		    module.exports = factory();
    		  }
    		}(logic, function() {
    		  /* globals console:false */

    		  if ( ! Array.isArray) {
    		    Array.isArray = function(arg) {
    		      return Object.prototype.toString.call(arg) === "[object Array]";
    		    };
    		  }

    		  /**
    		   * Return an array that contains no duplicates (original not modified)
    		   * @param  {array} array   Original reference array
    		   * @return {array}         New array with no duplicates
    		   */
    		  function arrayUnique(array) {
    		    var a = [];
    		    for (var i=0, l=array.length; i<l; i++) {
    		      if (a.indexOf(array[i]) === -1) {
    		        a.push(array[i]);
    		      }
    		    }
    		    return a;
    		  }

    		  var jsonLogic = {};
    		  var operations = {
    		    "==": function(a, b) {
    		      return a == b;
    		    },
    		    "===": function(a, b) {
    		      return a === b;
    		    },
    		    "!=": function(a, b) {
    		      return a != b;
    		    },
    		    "!==": function(a, b) {
    		      return a !== b;
    		    },
    		    ">": function(a, b) {
    		      return a > b;
    		    },
    		    ">=": function(a, b) {
    		      return a >= b;
    		    },
    		    "<": function(a, b, c) {
    		      return (c === undefined) ? a < b : (a < b) && (b < c);
    		    },
    		    "<=": function(a, b, c) {
    		      return (c === undefined) ? a <= b : (a <= b) && (b <= c);
    		    },
    		    "!!": function(a) {
    		      return jsonLogic.truthy(a);
    		    },
    		    "!": function(a) {
    		      return !jsonLogic.truthy(a);
    		    },
    		    "%": function(a, b) {
    		      return a % b;
    		    },
    		    "log": function(a) {
    		      console.log(a); return a;
    		    },
    		    "in": function(a, b) {
    		      if (!b || typeof b.indexOf === "undefined") return false;
    		      return (b.indexOf(a) !== -1);
    		    },
    		    "cat": function() {
    		      return Array.prototype.join.call(arguments, "");
    		    },
    		    "substr": function(source, start, end) {
    		      if (end < 0) {
    		        // JavaScript doesn't support negative end, this emulates PHP behavior
    		        var temp = String(source).substr(start);
    		        return temp.substr(0, temp.length + end);
    		      }
    		      return String(source).substr(start, end);
    		    },
    		    "+": function() {
    		      return Array.prototype.reduce.call(arguments, function(a, b) {
    		        return parseFloat(a, 10) + parseFloat(b, 10);
    		      }, 0);
    		    },
    		    "*": function() {
    		      return Array.prototype.reduce.call(arguments, function(a, b) {
    		        return parseFloat(a, 10) * parseFloat(b, 10);
    		      });
    		    },
    		    "-": function(a, b) {
    		      if (b === undefined) {
    		        return -a;
    		      } else {
    		        return a - b;
    		      }
    		    },
    		    "/": function(a, b) {
    		      return a / b;
    		    },
    		    "min": function() {
    		      return Math.min.apply(this, arguments);
    		    },
    		    "max": function() {
    		      return Math.max.apply(this, arguments);
    		    },
    		    "merge": function() {
    		      return Array.prototype.reduce.call(arguments, function(a, b) {
    		        return a.concat(b);
    		      }, []);
    		    },
    		    "var": function(a, b) {
    		      var not_found = (b === undefined) ? null : b;
    		      var data = this;
    		      if (typeof a === "undefined" || a==="" || a===null) {
    		        return data;
    		      }
    		      var sub_props = String(a).split(".");
    		      for (var i = 0; i < sub_props.length; i++) {
    		        if (data === null || data === undefined) {
    		          return not_found;
    		        }
    		        // Descending into data
    		        data = data[sub_props[i]];
    		        if (data === undefined) {
    		          return not_found;
    		        }
    		      }
    		      return data;
    		    },
    		    "missing": function() {
    		      /*
    		      Missing can receive many keys as many arguments, like {"missing:[1,2]}
    		      Missing can also receive *one* argument that is an array of keys,
    		      which typically happens if it's actually acting on the output of another command
    		      (like 'if' or 'merge')
    		      */

    		      var missing = [];
    		      var keys = Array.isArray(arguments[0]) ? arguments[0] : arguments;

    		      for (var i = 0; i < keys.length; i++) {
    		        var key = keys[i];
    		        var value = jsonLogic.apply({"var": key}, this);
    		        if (value === null || value === "") {
    		          missing.push(key);
    		        }
    		      }

    		      return missing;
    		    },
    		    "missing_some": function(need_count, options) {
    		      // missing_some takes two arguments, how many (minimum) items must be present, and an array of keys (just like 'missing') to check for presence.
    		      var are_missing = jsonLogic.apply({"missing": options}, this);

    		      if (options.length - are_missing.length >= need_count) {
    		        return [];
    		      } else {
    		        return are_missing;
    		      }
    		    },
    		  };

    		  jsonLogic.is_logic = function(logic) {
    		    return (
    		      typeof logic === "object" && // An object
    		      logic !== null && // but not null
    		      ! Array.isArray(logic) && // and not an array
    		      Object.keys(logic).length === 1 // with exactly one key
    		    );
    		  };

    		  /*
    		  This helper will defer to the JsonLogic spec as a tie-breaker when different language interpreters define different behavior for the truthiness of primitives.  E.g., PHP considers empty arrays to be falsy, but Javascript considers them to be truthy. JsonLogic, as an ecosystem, needs one consistent answer.

    		  Spec and rationale here: http://jsonlogic.com/truthy
    		  */
    		  jsonLogic.truthy = function(value) {
    		    if (Array.isArray(value) && value.length === 0) {
    		      return false;
    		    }
    		    return !! value;
    		  };


    		  jsonLogic.get_operator = function(logic) {
    		    return Object.keys(logic)[0];
    		  };

    		  jsonLogic.get_values = function(logic) {
    		    return logic[jsonLogic.get_operator(logic)];
    		  };

    		  jsonLogic.apply = function(logic, data) {
    		    // Does this array contain logic? Only one way to find out.
    		    if (Array.isArray(logic)) {
    		      return logic.map(function(l) {
    		        return jsonLogic.apply(l, data);
    		      });
    		    }
    		    // You've recursed to a primitive, stop!
    		    if ( ! jsonLogic.is_logic(logic) ) {
    		      return logic;
    		    }

    		    var op = jsonLogic.get_operator(logic);
    		    var values = logic[op];
    		    var i;
    		    var current;
    		    var scopedLogic;
    		    var scopedData;
    		    var initial;

    		    // easy syntax for unary operators, like {"var" : "x"} instead of strict {"var" : ["x"]}
    		    if ( ! Array.isArray(values)) {
    		      values = [values];
    		    }

    		    // 'if', 'and', and 'or' violate the normal rule of depth-first calculating consequents, let each manage recursion as needed.
    		    if (op === "if" || op == "?:") {
    		      /* 'if' should be called with a odd number of parameters, 3 or greater
    		      This works on the pattern:
    		      if( 0 ){ 1 }else{ 2 };
    		      if( 0 ){ 1 }else if( 2 ){ 3 }else{ 4 };
    		      if( 0 ){ 1 }else if( 2 ){ 3 }else if( 4 ){ 5 }else{ 6 };

    		      The implementation is:
    		      For pairs of values (0,1 then 2,3 then 4,5 etc)
    		      If the first evaluates truthy, evaluate and return the second
    		      If the first evaluates falsy, jump to the next pair (e.g, 0,1 to 2,3)
    		      given one parameter, evaluate and return it. (it's an Else and all the If/ElseIf were false)
    		      given 0 parameters, return NULL (not great practice, but there was no Else)
    		      */
    		      for (i = 0; i < values.length - 1; i += 2) {
    		        if ( jsonLogic.truthy( jsonLogic.apply(values[i], data) ) ) {
    		          return jsonLogic.apply(values[i+1], data);
    		        }
    		      }
    		      if (values.length === i+1) {
    		        return jsonLogic.apply(values[i], data);
    		      }
    		      return null;
    		    } else if (op === "and") { // Return first falsy, or last
    		      for (i=0; i < values.length; i+=1) {
    		        current = jsonLogic.apply(values[i], data);
    		        if ( ! jsonLogic.truthy(current)) {
    		          return current;
    		        }
    		      }
    		      return current; // Last
    		    } else if (op === "or") {// Return first truthy, or last
    		      for (i=0; i < values.length; i+=1) {
    		        current = jsonLogic.apply(values[i], data);
    		        if ( jsonLogic.truthy(current) ) {
    		          return current;
    		        }
    		      }
    		      return current; // Last
    		    } else if (op === "filter") {
    		      scopedData = jsonLogic.apply(values[0], data);
    		      scopedLogic = values[1];

    		      if ( ! Array.isArray(scopedData)) {
    		        return [];
    		      }
    		      // Return only the elements from the array in the first argument,
    		      // that return truthy when passed to the logic in the second argument.
    		      // For parity with JavaScript, reindex the returned array
    		      return scopedData.filter(function(datum) {
    		        return jsonLogic.truthy( jsonLogic.apply(scopedLogic, datum));
    		      });
    		    } else if (op === "map") {
    		      scopedData = jsonLogic.apply(values[0], data);
    		      scopedLogic = values[1];

    		      if ( ! Array.isArray(scopedData)) {
    		        return [];
    		      }

    		      return scopedData.map(function(datum) {
    		        return jsonLogic.apply(scopedLogic, datum);
    		      });
    		    } else if (op === "reduce") {
    		      scopedData = jsonLogic.apply(values[0], data);
    		      scopedLogic = values[1];
    		      initial = typeof values[2] !== "undefined" ? jsonLogic.apply(values[2], data) : null;

    		      if ( ! Array.isArray(scopedData)) {
    		        return initial;
    		      }

    		      return scopedData.reduce(
    		        function(accumulator, current) {
    		          return jsonLogic.apply(
    		            scopedLogic,
    		            {current: current, accumulator: accumulator}
    		          );
    		        },
    		        initial
    		      );
    		    } else if (op === "all") {
    		      scopedData = jsonLogic.apply(values[0], data);
    		      scopedLogic = values[1];
    		      // All of an empty set is false. Note, some and none have correct fallback after the for loop
    		      if ( ! Array.isArray(scopedData) || ! scopedData.length) {
    		        return false;
    		      }
    		      for (i=0; i < scopedData.length; i+=1) {
    		        if ( ! jsonLogic.truthy( jsonLogic.apply(scopedLogic, scopedData[i]) )) {
    		          return false; // First falsy, short circuit
    		        }
    		      }
    		      return true; // All were truthy
    		    } else if (op === "none") {
    		      scopedData = jsonLogic.apply(values[0], data);
    		      scopedLogic = values[1];

    		      if ( ! Array.isArray(scopedData) || ! scopedData.length) {
    		        return true;
    		      }
    		      for (i=0; i < scopedData.length; i+=1) {
    		        if ( jsonLogic.truthy( jsonLogic.apply(scopedLogic, scopedData[i]) )) {
    		          return false; // First truthy, short circuit
    		        }
    		      }
    		      return true; // None were truthy
    		    } else if (op === "some") {
    		      scopedData = jsonLogic.apply(values[0], data);
    		      scopedLogic = values[1];

    		      if ( ! Array.isArray(scopedData) || ! scopedData.length) {
    		        return false;
    		      }
    		      for (i=0; i < scopedData.length; i+=1) {
    		        if ( jsonLogic.truthy( jsonLogic.apply(scopedLogic, scopedData[i]) )) {
    		          return true; // First truthy, short circuit
    		        }
    		      }
    		      return false; // None were truthy
    		    }

    		    // Everyone else gets immediate depth-first recursion
    		    values = values.map(function(val) {
    		      return jsonLogic.apply(val, data);
    		    });


    		    // The operation is called with "data" bound to its "this" and "values" passed as arguments.
    		    // Structured commands like % or > can name formal arguments while flexible commands (like missing or merge) can operate on the pseudo-array arguments
    		    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/arguments
    		    if (operations.hasOwnProperty(op) && typeof operations[op] === "function") {
    		      return operations[op].apply(data, values);
    		    } else if (op.indexOf(".") > 0) { // Contains a dot, and not in the 0th position
    		      var sub_ops = String(op).split(".");
    		      var operation = operations;
    		      for (i = 0; i < sub_ops.length; i++) {
    		        if (!operation.hasOwnProperty(sub_ops[i])) {
    		          throw new Error("Unrecognized operation " + op +
    		            " (failed at " + sub_ops.slice(0, i+1).join(".") + ")");
    		        }
    		        // Descending into operations
    		        operation = operation[sub_ops[i]];
    		      }

    		      return operation.apply(data, values);
    		    }

    		    throw new Error("Unrecognized operation " + op );
    		  };

    		  jsonLogic.uses_data = function(logic) {
    		    var collection = [];

    		    if (jsonLogic.is_logic(logic)) {
    		      var op = jsonLogic.get_operator(logic);
    		      var values = logic[op];

    		      if ( ! Array.isArray(values)) {
    		        values = [values];
    		      }

    		      if (op === "var") {
    		        // This doesn't cover the case where the arg to var is itself a rule.
    		        collection.push(values[0]);
    		      } else {
    		        // Recursion!
    		        values.forEach(function(val) {
    		          collection.push.apply(collection, jsonLogic.uses_data(val) );
    		        });
    		      }
    		    }

    		    return arrayUnique(collection);
    		  };

    		  jsonLogic.add_operation = function(name, code) {
    		    operations[name] = code;
    		  };

    		  jsonLogic.rm_operation = function(name) {
    		    delete operations[name];
    		  };

    		  jsonLogic.rule_like = function(rule, pattern) {
    		    // console.log("Is ". JSON.stringify(rule) . " like " . JSON.stringify(pattern) . "?");
    		    if (pattern === rule) {
    		      return true;
    		    } // TODO : Deep object equivalency?
    		    if (pattern === "@") {
    		      return true;
    		    } // Wildcard!
    		    if (pattern === "number") {
    		      return (typeof rule === "number");
    		    }
    		    if (pattern === "string") {
    		      return (typeof rule === "string");
    		    }
    		    if (pattern === "array") {
    		      // !logic test might be superfluous in JavaScript
    		      return Array.isArray(rule) && ! jsonLogic.is_logic(rule);
    		    }

    		    if (jsonLogic.is_logic(pattern)) {
    		      if (jsonLogic.is_logic(rule)) {
    		        var pattern_op = jsonLogic.get_operator(pattern);
    		        var rule_op = jsonLogic.get_operator(rule);

    		        if (pattern_op === "@" || pattern_op === rule_op) {
    		          // echo "\nOperators match, go deeper\n";
    		          return jsonLogic.rule_like(
    		            jsonLogic.get_values(rule, false),
    		            jsonLogic.get_values(pattern, false)
    		          );
    		        }
    		      }
    		      return false; // pattern is logic, rule isn't, can't be eq
    		    }

    		    if (Array.isArray(pattern)) {
    		      if (Array.isArray(rule)) {
    		        if (pattern.length !== rule.length) {
    		          return false;
    		        }
    		        /*
    		          Note, array order MATTERS, because we're using this array test logic to consider arguments, where order can matter. (e.g., + is commutative, but '-' or 'if' or 'var' are NOT)
    		        */
    		        for (var i = 0; i < pattern.length; i += 1) {
    		          // If any fail, we fail
    		          if ( ! jsonLogic.rule_like(rule[i], pattern[i])) {
    		            return false;
    		          }
    		        }
    		        return true; // If they *all* passed, we pass
    		      } else {
    		        return false; // Pattern is array, rule isn't
    		      }
    		    }

    		    // Not logic, not array, not a === match for rule.
    		    return false;
    		  };

    		  return jsonLogic;
    		})); 
    	} (logic$1));
    	return logic$1.exports;
    }

    var logicExports = requireLogic();
    var jsonLogic = /*@__PURE__*/getDefaultExportFromCjs(logicExports);

    /**
     * Shared helper to recursively lowercase strings in nested structures
     * @param {*} obj - Value to process
     * @param {boolean} lowercaseKeys - Whether to lowercase object keys
     * @returns {*} Processed value with lowercased strings
     */
    var lowercaseJson = function(obj, lowercaseKeys) {
        if (obj === null || obj === undefined) {
            return obj;
        } else if (typeof obj === 'string') {
            return obj.toLowerCase();
        } else if (Array.isArray(obj)) {
            return obj.map(function(item) {
                return lowercaseJson(item, lowercaseKeys);
            });
        } else if (obj === Object(obj)) {
            var result = {};
            for (var key in obj) {
                if (obj.hasOwnProperty(key)) {
                    var newKey = lowercaseKeys && typeof key === 'string' ? key.toLowerCase() : key;
                    result[newKey] = lowercaseJson(obj[key], lowercaseKeys);
                }
            }
            return result;
        } else {
            return obj;
        }
    };

    /**
     * Lowercase all string keys and values in a nested structure
     * @param {*} val - Value to process
     * @returns {*} Processed value with lowercased strings
     */
    var lowercaseKeysAndValues = function(val) {
        return lowercaseJson(val, true);
    };

    /**
     * Lowercase only leaf node string values in a nested structure (keys unchanged)
     * @param {*} val - Value to process
     * @returns {*} Processed value with lowercased leaf strings
     */
    var lowercaseOnlyLeafNodes = function(val) {
        return lowercaseJson(val, false);
    };

    /**
     * Check if an event matches the given criteria
     * @param {string} eventName - The name of the event being checked
     * @param {Object} properties - Event properties to evaluate against property filters
     * @param {Object} criteria - Criteria to match against, with:
     *   - event_name: string - Required event name (case-sensitive match)
     *   - property_filters: Object - Optional JsonLogic filters for properties
     * @returns {Object} Result object with:
     *   - matches: boolean - Whether the event matches the criteria
     *   - error: string|undefined - Error message if evaluation failed
     */
    var eventMatchesCriteria = function(eventName, properties, criteria) {
        // Check exact event name match (case-sensitive)
        if (eventName !== criteria.event_name) {
            return { matches: false };
        }

        // Evaluate property filters using JsonLogic
        var propertyFilters = criteria.property_filters;
        var filtersMatch = true; // default to true if no filters

        if (propertyFilters && !_.isEmptyObject(propertyFilters)) {
            try {
                // Lowercase all keys and values in event properties for case-insensitive matching
                var lowercasedProperties = lowercaseKeysAndValues(properties || {});

                // Lowercase only leaf nodes in JsonLogic filters (keep operators intact)
                var lowercasedFilters = lowercaseOnlyLeafNodes(propertyFilters);

                filtersMatch = jsonLogic.apply(lowercasedFilters, lowercasedProperties);
            } catch (error) {
                return {
                    matches: false,
                    error: error.toString()
                };
            }
        }

        return { matches: filtersMatch };
    };

    // Create targeting library object
    var targetingLibrary = {};
    targetingLibrary['eventMatchesCriteria'] = eventMatchesCriteria;

    // Set global Promise (use bracket notation to prevent minification)
    // This is the ONE AND ONLY global - matches recorder pattern
    win[TARGETING_GLOBAL_NAME] = Promise.resolve(targetingLibrary);

})();
