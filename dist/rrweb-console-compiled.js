function _array_like_to_array(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for(var i = 0, arr2 = new Array(len); i < len; i++)arr2[i] = arr[i];
    return arr2;
}
function _instanceof(left, right) {
    if (right != null && typeof Symbol !== "undefined" && right[Symbol.hasInstance]) {
        return !!right[Symbol.hasInstance](left);
    } else {
        return left instanceof right;
    }
}
function _type_of(obj) {
    "@swc/helpers - typeof";
    return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj;
}
function _unsupported_iterable_to_array(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _array_like_to_array(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(n);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _array_like_to_array(o, minLen);
}
function _create_for_of_iterator_helper_loose(o, allowArrayLike) {
    var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"];
    if (it) return (it = it.call(o)).next.bind(it);
    if (Array.isArray(o) || (it = _unsupported_iterable_to_array(o)) || allowArrayLike) {
        if (it) o = it;
        var i = 0;
        return function() {
            if (i >= o.length) {
                return {
                    done: true
                };
            }
            return {
                done: false,
                value: o[i++]
            };
        };
    }
    throw new TypeError("Invalid attempt to iterate non-iterable instance.\\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
var __defProp = Object.defineProperty;
var __defNormalProp = function(obj, key, value) {
    return key in obj ? __defProp(obj, key, {
        enumerable: true,
        configurable: true,
        writable: true,
        value: value
    }) : obj[key] = value;
};
var __publicField = function(obj, key, value) {
    return __defNormalProp(obj, (typeof key === "undefined" ? "undefined" : _type_of(key)) !== "symbol" ? key + "" : key, value);
};
function patch(source, name, replacement) {
    try {
        if (!(name in source)) {
            return function() {};
        }
        var original = source[name];
        var wrapped = replacement(original);
        if (typeof wrapped === "function") {
            wrapped.prototype = wrapped.prototype || {};
            Object.defineProperties(wrapped, {
                __rrweb_original__: {
                    enumerable: false,
                    value: original
                }
            });
        }
        source[name] = wrapped;
        return function() {
            source[name] = original;
        };
    } catch (e) {
        return function() {};
    }
}
var StackFrame = /*#__PURE__*/ function() {
    function StackFrame(obj) {
        __publicField(this, "fileName");
        __publicField(this, "functionName");
        __publicField(this, "lineNumber");
        __publicField(this, "columnNumber");
        this.fileName = obj.fileName || "";
        this.functionName = obj.functionName || "";
        this.lineNumber = obj.lineNumber;
        this.columnNumber = obj.columnNumber;
    }
    var _proto = StackFrame.prototype;
    _proto.toString = function toString() {
        var lineNumber = this.lineNumber || "";
        var columnNumber = this.columnNumber || "";
        if (this.functionName) return this.functionName + " (" + this.fileName + ":" + lineNumber + ":" + columnNumber + ")";
        return this.fileName + ":" + lineNumber + ":" + columnNumber;
    };
    return StackFrame;
}();
var FIREFOX_SAFARI_STACK_REGEXP = /(^|@)\S+:\d+/;
var CHROME_IE_STACK_REGEXP = /^\s*at .*(\S+:\d+|\(native\))/m;
var SAFARI_NATIVE_CODE_REGEXP = /^(eval@)?(\[native code])?$/;
var ErrorStackParser = {
    /**
   * Given an Error object, extract the most information from it.
   */ parse: function parse(error) {
        if (!error) {
            return [];
        }
        if (// eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        typeof error.stacktrace !== "undefined" || // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        typeof error["opera#sourceloc"] !== "undefined") {
            return this.parseOpera(error);
        } else if (error.stack && error.stack.match(CHROME_IE_STACK_REGEXP)) {
            return this.parseV8OrIE(error);
        } else if (error.stack) {
            return this.parseFFOrSafari(error);
        } else {
            console.warn("[console-record-plugin]: Failed to parse error object:", error);
            return [];
        }
    },
    // Separate line and column numbers from a string of the form: (URI:Line:Column)
    extractLocation: function extractLocation(urlLike) {
        if (urlLike.indexOf(":") === -1) {
            return [
                urlLike
            ];
        }
        var regExp = /(.+?)(?::(\d+))?(?::(\d+))?$/;
        var parts = regExp.exec(urlLike.replace(/[()]/g, ""));
        if (!parts) throw new Error("Cannot parse given url: " + urlLike);
        return [
            parts[1],
            parts[2] || void 0,
            parts[3] || void 0
        ];
    },
    parseV8OrIE: function parseV8OrIE(error) {
        var filtered = error.stack.split("\n").filter(function(line) {
            return !!line.match(CHROME_IE_STACK_REGEXP);
        }, this);
        return filtered.map(function(line) {
            if (line.indexOf("(eval ") > -1) {
                line = line.replace(/eval code/g, "eval").replace(/(\(eval at [^()]*)|(\),.*$)/g, "");
            }
            var sanitizedLine = line.replace(/^\s+/, "").replace(/\(eval code/g, "(");
            var location = sanitizedLine.match(/ (\((.+):(\d+):(\d+)\)$)/);
            sanitizedLine = location ? sanitizedLine.replace(location[0], "") : sanitizedLine;
            var tokens = sanitizedLine.split(/\s+/).slice(1);
            var locationParts = this.extractLocation(location ? location[1] : tokens.pop());
            var functionName = tokens.join(" ") || void 0;
            var fileName = [
                "eval",
                "<anonymous>"
            ].indexOf(locationParts[0]) > -1 ? void 0 : locationParts[0];
            return new StackFrame({
                functionName: functionName,
                fileName: fileName,
                lineNumber: locationParts[1],
                columnNumber: locationParts[2]
            });
        }, this);
    },
    parseFFOrSafari: function parseFFOrSafari(error) {
        var filtered = error.stack.split("\n").filter(function(line) {
            return !line.match(SAFARI_NATIVE_CODE_REGEXP);
        }, this);
        return filtered.map(function(line) {
            if (line.indexOf(" > eval") > -1) {
                line = line.replace(/ line (\d+)(?: > eval line \d+)* > eval:\d+:\d+/g, ":$1");
            }
            if (line.indexOf("@") === -1 && line.indexOf(":") === -1) {
                return new StackFrame({
                    functionName: line
                });
            } else {
                var functionNameRegex = /((.*".+"[^@]*)?[^@]*)(?:@)/;
                var matches = line.match(functionNameRegex);
                var functionName = matches && matches[1] ? matches[1] : void 0;
                var locationParts = this.extractLocation(line.replace(functionNameRegex, ""));
                return new StackFrame({
                    functionName: functionName,
                    fileName: locationParts[0],
                    lineNumber: locationParts[1],
                    columnNumber: locationParts[2]
                });
            }
        }, this);
    },
    parseOpera: function parseOpera(e) {
        if (!e.stacktrace || e.message.indexOf("\n") > -1 && e.message.split("\n").length > e.stacktrace.split("\n").length) {
            return this.parseOpera9(e);
        } else if (!e.stack) {
            return this.parseOpera10(e);
        } else {
            return this.parseOpera11(e);
        }
    },
    parseOpera9: function parseOpera9(e) {
        var lineRE = /Line (\d+).*script (?:in )?(\S+)/i;
        var lines = e.message.split("\n");
        var result = [];
        for(var i = 2, len = lines.length; i < len; i += 2){
            var match = lineRE.exec(lines[i]);
            if (match) {
                result.push(new StackFrame({
                    fileName: match[2],
                    lineNumber: parseFloat(match[1])
                }));
            }
        }
        return result;
    },
    parseOpera10: function parseOpera10(e) {
        var lineRE = /Line (\d+).*script (?:in )?(\S+)(?:: In function (\S+))?$/i;
        var lines = e.stacktrace.split("\n");
        var result = [];
        for(var i = 0, len = lines.length; i < len; i += 2){
            var match = lineRE.exec(lines[i]);
            if (match) {
                result.push(new StackFrame({
                    functionName: match[3] || void 0,
                    fileName: match[2],
                    lineNumber: parseFloat(match[1])
                }));
            }
        }
        return result;
    },
    // Opera 10.65+ Error.stack very similar to FF/Safari
    parseOpera11: function parseOpera11(error) {
        var filtered = error.stack.split("\n").filter(function(line) {
            return !!line.match(FIREFOX_SAFARI_STACK_REGEXP) && !line.match(/^Error created at/);
        }, this);
        return filtered.map(function(line) {
            var tokens = line.split("@");
            var locationParts = this.extractLocation(tokens.pop());
            var functionCall = tokens.shift() || "";
            var functionName = functionCall.replace(/<anonymous function(: (\w+))?>/, "$2").replace(/\([^)]*\)/g, "") || void 0;
            return new StackFrame({
                functionName: functionName,
                fileName: locationParts[0],
                lineNumber: locationParts[1],
                columnNumber: locationParts[2]
            });
        }, this);
    }
};
function pathToSelector(node) {
    if (!node || !node.outerHTML) {
        return "";
    }
    var path = "";
    while(node.parentElement){
        var name = node.localName;
        if (!name) {
            break;
        }
        name = name.toLowerCase();
        var parent = node.parentElement;
        var domSiblings = [];
        if (parent.children && parent.children.length > 0) {
            for(var i = 0; i < parent.children.length; i++){
                var sibling = parent.children[i];
                if (sibling.localName && sibling.localName.toLowerCase) {
                    if (sibling.localName.toLowerCase() === name) {
                        domSiblings.push(sibling);
                    }
                }
            }
        }
        if (domSiblings.length > 1) {
            name += ":eq(" + domSiblings.indexOf(node) + ")";
        }
        path = name + (path ? ">" + path : "");
        node = parent;
    }
    return path;
}
function isObject(obj) {
    return Object.prototype.toString.call(obj) === "[object Object]";
}
function isObjTooDeep(obj, limit) {
    if (limit === 0) {
        return true;
    }
    var keys = Object.keys(obj);
    for(var _iterator = _create_for_of_iterator_helper_loose(keys), _step; !(_step = _iterator()).done;){
        var key = _step.value;
        if (isObject(obj[key]) && isObjTooDeep(obj[key], limit - 1)) {
            return true;
        }
    }
    return false;
}
function stringify(obj, stringifyOptions) {
    var options = {
        numOfKeysLimit: 50,
        depthOfLimit: 4
    };
    Object.assign(options, stringifyOptions);
    var stack = [];
    var keys = [];
    return JSON.stringify(obj, function(key, value) {
        if (stack.length > 0) {
            var thisPos = stack.indexOf(this);
            ~thisPos ? stack.splice(thisPos + 1) : stack.push(this);
            ~thisPos ? keys.splice(thisPos, Infinity, key) : keys.push(key);
            if (~stack.indexOf(value)) {
                if (stack[0] === value) {
                    value = "[Circular ~]";
                } else {
                    value = "[Circular ~." + keys.slice(0, stack.indexOf(value)).join(".") + "]";
                }
            }
        } else {
            stack.push(value);
        }
        if (value === null) return value;
        if (value === void 0) return "undefined";
        if (shouldIgnore(value)) {
            return toString(value);
        }
        if ((typeof value === "undefined" ? "undefined" : _type_of(value)) === "bigint") {
            return value.toString() + "n";
        }
        if (_instanceof(value, Event)) {
            var eventResult = {};
            for(var eventKey in value){
                var eventValue = value[eventKey];
                if (Array.isArray(eventValue)) {
                    eventResult[eventKey] = pathToSelector(eventValue.length ? eventValue[0] : null);
                } else {
                    eventResult[eventKey] = eventValue;
                }
            }
            return eventResult;
        } else if (_instanceof(value, Node)) {
            if (_instanceof(value, HTMLElement)) {
                return value ? value.outerHTML : "";
            }
            return value.nodeName;
        } else if (_instanceof(value, Error)) {
            return value.stack ? value.stack + "\nEnd of stack for Error object" : value.name + ": " + value.message;
        }
        return value;
    });
    function shouldIgnore(_obj) {
        if (isObject(_obj) && Object.keys(_obj).length > options.numOfKeysLimit) {
            return true;
        }
        if (typeof _obj === "function") {
            return true;
        }
        if (isObject(_obj) && isObjTooDeep(_obj, options.depthOfLimit)) {
            return true;
        }
        return false;
    }
    function toString(_obj) {
        var str = _obj.toString();
        if (options.stringLengthLimit && str.length > options.stringLengthLimit) {
            str = "" + str.slice(0, options.stringLengthLimit) + "...";
        }
        return str;
    }
}
var defaultLogOptions = {
    level: [
        "assert",
        "clear",
        "count",
        "countReset",
        "debug",
        "dir",
        "dirxml",
        "error",
        "group",
        "groupCollapsed",
        "groupEnd",
        "info",
        "log",
        "table",
        "time",
        "timeEnd",
        "timeLog",
        "trace",
        "warn"
    ],
    lengthThreshold: 1e3,
    logger: "console"
};
function initLogObserver(cb, win, options) {
    var logOptions = options ? Object.assign({}, defaultLogOptions, options) : defaultLogOptions;
    var loggerType = logOptions.logger;
    if (!loggerType) {
        return function() {};
    }
    var logger;
    if (typeof loggerType === "string") {
        logger = win[loggerType];
    } else {
        logger = loggerType;
    }
    var logCount = 0;
    var inStack = false;
    var cancelHandlers = [];
    if (logOptions.level.includes("error")) {
        var errorHandler = function(event) {
            var message = event.message, error = event.error;
            var trace = ErrorStackParser.parse(error).map(function(stackFrame) {
                return stackFrame.toString();
            });
            var payload = [
                stringify(message, logOptions.stringifyOptions)
            ];
            cb({
                level: "error",
                trace: trace,
                payload: payload
            });
        };
        win.addEventListener("error", errorHandler);
        cancelHandlers.push(function() {
            win.removeEventListener("error", errorHandler);
        });
        var unhandledrejectionHandler = function(event) {
            var error;
            var payload;
            if (_instanceof(event.reason, Error)) {
                error = event.reason;
                payload = [
                    stringify("Uncaught (in promise) " + error.name + ": " + error.message, logOptions.stringifyOptions)
                ];
            } else {
                error = new Error();
                payload = [
                    stringify("Uncaught (in promise)", logOptions.stringifyOptions),
                    stringify(event.reason, logOptions.stringifyOptions)
                ];
            }
            var trace = ErrorStackParser.parse(error).map(function(stackFrame) {
                return stackFrame.toString();
            });
            cb({
                level: "error",
                trace: trace,
                payload: payload
            });
        };
        win.addEventListener("unhandledrejection", unhandledrejectionHandler);
        cancelHandlers.push(function() {
            win.removeEventListener("unhandledrejection", unhandledrejectionHandler);
        });
    }
    for(var _iterator = _create_for_of_iterator_helper_loose(logOptions.level), _step; !(_step = _iterator()).done;){
        var levelType = _step.value;
        cancelHandlers.push(replace(logger, levelType));
    }
    return function() {
        cancelHandlers.forEach(function(h) {
            return h();
        });
    };
    function replace(_logger, level) {
        var _this = this;
        if (!_logger[level]) {
            return function() {};
        }
        return patch(_logger, level, function(original) {
            var _this1 = _this;
            return function() {
                for(var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++){
                    args[_key] = arguments[_key];
                }
                original.apply(_this1, args);
                if (level === "assert" && !!args[0]) {
                    return;
                }
                if (inStack) {
                    return;
                }
                inStack = true;
                try {
                    var trace = ErrorStackParser.parse(new Error()).map(function(stackFrame) {
                        return stackFrame.toString();
                    }).splice(1);
                    var argsForPayload = level === "assert" ? args.slice(1) : args;
                    var payload = argsForPayload.map(function(s) {
                        return stringify(s, logOptions.stringifyOptions);
                    });
                    logCount++;
                    if (logCount < logOptions.lengthThreshold) {
                        cb({
                            level: level,
                            trace: trace,
                            payload: payload
                        });
                    } else if (logCount === logOptions.lengthThreshold) {
                        cb({
                            level: "warn",
                            trace: [],
                            payload: [
                                stringify("The number of log records reached the threshold.")
                            ]
                        });
                    }
                } catch (error) {
                    original.apply(void 0, [].concat([
                        "rrweb logger error:",
                        error
                    ], args));
                } finally{
                    inStack = false;
                }
            };
        });
    }
}
var PLUGIN_NAME = "rrweb/console@1";
var getRecordConsolePlugin = function(options) {
    return {
        name: PLUGIN_NAME,
        observer: initLogObserver,
        options: options
    };
};

export { PLUGIN_NAME, getRecordConsolePlugin };
