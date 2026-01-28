function _array_like_to_array(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for(var i = 0, arr2 = new Array(len); i < len; i++)arr2[i] = arr[i];
    return arr2;
}
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
    try {
        var info = gen[key](arg);
        var value = info.value;
    } catch (error) {
        reject(error);
        return;
    }
    if (info.done) {
        resolve(value);
    } else {
        Promise.resolve(value).then(_next, _throw);
    }
}
function _async_to_generator(fn) {
    return function() {
        var self = this, args = arguments;
        return new Promise(function(resolve, reject) {
            var gen = fn.apply(self, args);
            function _next(value) {
                asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
            }
            function _throw(err) {
                asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
            }
            _next(undefined);
        });
    };
}
function _construct(Parent, args, Class) {
    if (_is_native_reflect_construct()) {
        _construct = Reflect.construct;
    } else {
        _construct = function construct(Parent, args, Class) {
            var a = [
                null
            ];
            a.push.apply(a, args);
            var Constructor = Function.bind.apply(Parent, a);
            var instance = new Constructor();
            if (Class) _set_prototype_of(instance, Class.prototype);
            return instance;
        };
    }
    return _construct.apply(null, arguments);
}
function _defineProperties(target, props) {
    for(var i = 0; i < props.length; i++){
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
    }
}
function _create_class(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    return Constructor;
}
function _extends() {
    _extends = Object.assign || function(target) {
        for(var i = 1; i < arguments.length; i++){
            var source = arguments[i];
            for(var key in source){
                if (Object.prototype.hasOwnProperty.call(source, key)) {
                    target[key] = source[key];
                }
            }
        }
        return target;
    };
    return _extends.apply(this, arguments);
}
function _get_prototype_of(o) {
    _get_prototype_of = Object.setPrototypeOf ? Object.getPrototypeOf : function getPrototypeOf(o) {
        return o.__proto__ || Object.getPrototypeOf(o);
    };
    return _get_prototype_of(o);
}
function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
        throw new TypeError("Super expression must either be null or a function");
    }
    subClass.prototype = Object.create(superClass && superClass.prototype, {
        constructor: {
            value: subClass,
            writable: true,
            configurable: true
        }
    });
    if (superClass) _set_prototype_of(subClass, superClass);
}
function _instanceof(left, right) {
    if (right != null && typeof Symbol !== "undefined" && right[Symbol.hasInstance]) {
        return !!right[Symbol.hasInstance](left);
    } else {
        return left instanceof right;
    }
}
function _is_native_function(fn) {
    return Function.toString.call(fn).indexOf("[native code]") !== -1;
}
function _object_without_properties_loose(source, excluded) {
    if (source == null) return {};
    var target = {};
    var sourceKeys = Object.keys(source);
    var key, i;
    for(i = 0; i < sourceKeys.length; i++){
        key = sourceKeys[i];
        if (excluded.indexOf(key) >= 0) continue;
        target[key] = source[key];
    }
    return target;
}
function _set_prototype_of(o, p) {
    _set_prototype_of = Object.setPrototypeOf || function setPrototypeOf(o, p) {
        o.__proto__ = p;
        return o;
    };
    return _set_prototype_of(o, p);
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
function _wrap_native_super(Class) {
    var _cache = typeof Map === "function" ? new Map() : undefined;
    _wrap_native_super = function wrapNativeSuper(Class) {
        if (Class === null || !_is_native_function(Class)) return Class;
        if (typeof Class !== "function") {
            throw new TypeError("Super expression must either be null or a function");
        }
        if (typeof _cache !== "undefined") {
            if (_cache.has(Class)) return _cache.get(Class);
            _cache.set(Class, Wrapper);
        }
        function Wrapper() {
            return _construct(Class, arguments, _get_prototype_of(this).constructor);
        }
        Wrapper.prototype = Object.create(Class.prototype, {
            constructor: {
                value: Wrapper,
                enumerable: false,
                writable: true,
                configurable: true
            }
        });
        return _set_prototype_of(Wrapper, Class);
    };
    return _wrap_native_super(Class);
}
function _is_native_reflect_construct() {
    try {
        var result = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {}));
    } catch (_) {}
    return (_is_native_reflect_construct = function() {
        return !!result;
    })();
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
function _ts_generator(thisArg, body) {
    var f, y, t, g, _ = {
        label: 0,
        sent: function() {
            if (t[0] & 1) throw t[1];
            return t[1];
        },
        trys: [],
        ops: []
    };
    return g = {
        next: verb(0),
        "throw": verb(1),
        "return": verb(2)
    }, typeof Symbol === "function" && (g[Symbol.iterator] = function() {
        return this;
    }), g;
    function verb(n) {
        return function(v) {
            return step([
                n,
                v
            ]);
        };
    }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while(_)try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [
                op[0] & 2,
                t.value
            ];
            switch(op[0]){
                case 0:
                case 1:
                    t = op;
                    break;
                case 4:
                    _.label++;
                    return {
                        value: op[1],
                        done: false
                    };
                case 5:
                    _.label++;
                    y = op[1];
                    op = [
                        0
                    ];
                    continue;
                case 7:
                    op = _.ops.pop();
                    _.trys.pop();
                    continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                        _ = 0;
                        continue;
                    }
                    if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
                        _.label = op[1];
                        break;
                    }
                    if (op[0] === 6 && _.label < t[1]) {
                        _.label = t[1];
                        t = op;
                        break;
                    }
                    if (t && _.label < t[2]) {
                        _.label = t[2];
                        _.ops.push(op);
                        break;
                    }
                    if (t[2]) _.ops.pop();
                    _.trys.pop();
                    continue;
            }
            op = body.call(thisArg, _);
        } catch (e) {
            op = [
                6,
                e
            ];
            y = 0;
        } finally{
            f = t = 0;
        }
        if (op[0] & 5) throw op[1];
        return {
            value: op[0] ? op[1] : void 0,
            done: true
        };
    }
}
function _ts_values(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function() {
            if (o && i >= o.length) o = void 0;
            return {
                value: o && o[i++],
                done: !o
            };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
}
var __defProp$1 = Object.defineProperty;
var __defNormalProp$1 = function(obj, key, value) {
    return key in obj ? __defProp$1(obj, key, {
        enumerable: true,
        configurable: true,
        writable: true,
        value: value
    }) : obj[key] = value;
};
var __publicField$1 = function(obj, key, value) {
    return __defNormalProp$1(obj, (typeof key === "undefined" ? "undefined" : _type_of(key)) !== "symbol" ? key + "" : key, value);
};
var _a;
var __defProp$1$1 = Object.defineProperty;
var __defNormalProp$1$1 = function(obj, key, value) {
    return key in obj ? __defProp$1$1(obj, key, {
        enumerable: true,
        configurable: true,
        writable: true,
        value: value
    }) : obj[key] = value;
};
var __publicField$1$1 = function(obj, key, value) {
    return __defNormalProp$1$1(obj, (typeof key === "undefined" ? "undefined" : _type_of(key)) !== "symbol" ? key + "" : key, value);
};
var NodeType$3 = /* @__PURE__ */ function(NodeType2) {
    NodeType2[NodeType2["Document"] = 0] = "Document";
    NodeType2[NodeType2["DocumentType"] = 1] = "DocumentType";
    NodeType2[NodeType2["Element"] = 2] = "Element";
    NodeType2[NodeType2["Text"] = 3] = "Text";
    NodeType2[NodeType2["CDATA"] = 4] = "CDATA";
    NodeType2[NodeType2["Comment"] = 5] = "Comment";
    return NodeType2;
}(NodeType$3 || {});
var testableAccessors$1 = {
    Node: [
        "childNodes",
        "parentNode",
        "parentElement",
        "textContent"
    ],
    ShadowRoot: [
        "host",
        "styleSheets"
    ],
    Element: [
        "shadowRoot",
        "querySelector",
        "querySelectorAll"
    ],
    MutationObserver: []
};
var testableMethods$1 = {
    Node: [
        "contains",
        "getRootNode"
    ],
    ShadowRoot: [
        "getSelection"
    ],
    Element: [],
    MutationObserver: [
        "constructor"
    ]
};
var untaintedBasePrototype$1 = {};
var isAngularZonePresent$1 = function() {
    return !!globalThis.Zone;
};
function getUntaintedPrototype$1(key) {
    if (untaintedBasePrototype$1[key]) return untaintedBasePrototype$1[key];
    var defaultObj = globalThis[key];
    var defaultPrototype = defaultObj.prototype;
    var accessorNames = key in testableAccessors$1 ? testableAccessors$1[key] : void 0;
    var isUntaintedAccessors = Boolean(accessorNames && // @ts-expect-error 2345
    accessorNames.every(function(accessor) {
        var _a2, _b;
        return Boolean((_b = (_a2 = Object.getOwnPropertyDescriptor(defaultPrototype, accessor)) == null ? void 0 : _a2.get) == null ? void 0 : _b.toString().includes("[native code]"));
    }));
    var methodNames = key in testableMethods$1 ? testableMethods$1[key] : void 0;
    var isUntaintedMethods = Boolean(methodNames && methodNames.every(// @ts-expect-error 2345
    function(method) {
        var _a2;
        return typeof defaultPrototype[method] === "function" && ((_a2 = defaultPrototype[method]) == null ? void 0 : _a2.toString().includes("[native code]"));
    }));
    if (isUntaintedAccessors && isUntaintedMethods && !isAngularZonePresent$1()) {
        untaintedBasePrototype$1[key] = defaultObj.prototype;
        return defaultObj.prototype;
    }
    try {
        var iframeEl = document.createElement("iframe");
        document.body.appendChild(iframeEl);
        var win = iframeEl.contentWindow;
        if (!win) return defaultObj.prototype;
        var untaintedObject = win[key].prototype;
        document.body.removeChild(iframeEl);
        if (!untaintedObject) return defaultPrototype;
        return untaintedBasePrototype$1[key] = untaintedObject;
    } catch (e) {
        return defaultPrototype;
    }
}
var untaintedAccessorCache$1 = {};
function getUntaintedAccessor$1(key, instance, accessor) {
    var _a2;
    var cacheKey = key + "." + String(accessor);
    if (untaintedAccessorCache$1[cacheKey]) return untaintedAccessorCache$1[cacheKey].call(instance);
    var untaintedPrototype = getUntaintedPrototype$1(key);
    var untaintedAccessor = (_a2 = Object.getOwnPropertyDescriptor(untaintedPrototype, accessor)) == null ? void 0 : _a2.get;
    if (!untaintedAccessor) return instance[accessor];
    untaintedAccessorCache$1[cacheKey] = untaintedAccessor;
    return untaintedAccessor.call(instance);
}
var untaintedMethodCache$1 = {};
function getUntaintedMethod$1(key, instance, method) {
    var cacheKey = key + "." + String(method);
    if (untaintedMethodCache$1[cacheKey]) return untaintedMethodCache$1[cacheKey].bind(instance);
    var untaintedPrototype = getUntaintedPrototype$1(key);
    var untaintedMethod = untaintedPrototype[method];
    if (typeof untaintedMethod !== "function") return instance[method];
    untaintedMethodCache$1[cacheKey] = untaintedMethod;
    return untaintedMethod.bind(instance);
}
function childNodes$1(n2) {
    return getUntaintedAccessor$1("Node", n2, "childNodes");
}
function parentNode$1(n2) {
    return getUntaintedAccessor$1("Node", n2, "parentNode");
}
function parentElement$1(n2) {
    return getUntaintedAccessor$1("Node", n2, "parentElement");
}
function textContent$1(n2) {
    return getUntaintedAccessor$1("Node", n2, "textContent");
}
function contains$1(n2, other) {
    return getUntaintedMethod$1("Node", n2, "contains")(other);
}
function getRootNode$1(n2) {
    return getUntaintedMethod$1("Node", n2, "getRootNode")();
}
function host$1(n2) {
    if (!n2 || !("host" in n2)) return null;
    return getUntaintedAccessor$1("ShadowRoot", n2, "host");
}
function styleSheets$1(n2) {
    return n2.styleSheets;
}
function shadowRoot$1(n2) {
    if (!n2 || !("shadowRoot" in n2)) return null;
    return getUntaintedAccessor$1("Element", n2, "shadowRoot");
}
function querySelector$1(n2, selectors) {
    return getUntaintedAccessor$1("Element", n2, "querySelector")(selectors);
}
function querySelectorAll$1(n2, selectors) {
    return getUntaintedAccessor$1("Element", n2, "querySelectorAll")(selectors);
}
function mutationObserverCtor$1() {
    return getUntaintedPrototype$1("MutationObserver").constructor;
}
function patch$1$1(source, name, replacement) {
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
var index$1 = {
    childNodes: childNodes$1,
    parentNode: parentNode$1,
    parentElement: parentElement$1,
    textContent: textContent$1,
    contains: contains$1,
    getRootNode: getRootNode$1,
    host: host$1,
    styleSheets: styleSheets$1,
    shadowRoot: shadowRoot$1,
    querySelector: querySelector$1,
    querySelectorAll: querySelectorAll$1,
    mutationObserver: mutationObserverCtor$1,
    patch: patch$1$1
};
function isElement(n2) {
    return n2.nodeType === n2.ELEMENT_NODE;
}
function isShadowRoot(n2) {
    var hostEl = // anchor and textarea elements also have a `host` property
    // but only shadow roots have a `mode` property
    n2 && "host" in n2 && "mode" in n2 && index$1.host(n2) || null;
    return Boolean(hostEl && "shadowRoot" in hostEl && index$1.shadowRoot(hostEl) === n2);
}
function isNativeShadowDom(shadowRoot2) {
    return Object.prototype.toString.call(shadowRoot2) === "[object ShadowRoot]";
}
function fixBrowserCompatibilityIssuesInCSS(cssText) {
    if (cssText.includes(" background-clip: text;") && !cssText.includes(" -webkit-background-clip: text;")) {
        cssText = cssText.replace(/\sbackground-clip:\s*text;/g, " -webkit-background-clip: text; background-clip: text;");
    }
    return cssText;
}
function escapeImportStatement(rule2) {
    var cssText = rule2.cssText;
    if (cssText.split('"').length < 3) return cssText;
    var statement = [
        "@import",
        "url(" + JSON.stringify(rule2.href) + ")"
    ];
    if (rule2.layerName === "") {
        statement.push("layer");
    } else if (rule2.layerName) {
        statement.push("layer(" + rule2.layerName + ")");
    }
    if (rule2.supportsText) {
        statement.push("supports(" + rule2.supportsText + ")");
    }
    if (rule2.media.length) {
        statement.push(rule2.media.mediaText);
    }
    return statement.join(" ") + ";";
}
function stringifyStylesheet(s2) {
    try {
        var rules2 = s2.rules || s2.cssRules;
        if (!rules2) {
            return null;
        }
        var sheetHref = s2.href;
        if (!sheetHref && s2.ownerNode && s2.ownerNode.ownerDocument) {
            sheetHref = s2.ownerNode.ownerDocument.location.href;
        }
        var stringifiedRules = Array.from(rules2, function(rule2) {
            return stringifyRule(rule2, sheetHref);
        }).join("");
        return fixBrowserCompatibilityIssuesInCSS(stringifiedRules);
    } catch (error) {
        return null;
    }
}
function stringifyRule(rule2, sheetHref) {
    if (isCSSImportRule(rule2)) {
        var importStringified;
        try {
            importStringified = // we can access the imported stylesheet rules directly
            stringifyStylesheet(rule2.styleSheet) || // work around browser issues with the raw string `@import url(...)` statement
            escapeImportStatement(rule2);
        } catch (error) {
            importStringified = rule2.cssText;
        }
        if (rule2.styleSheet.href) {
            return absolutifyURLs(importStringified, rule2.styleSheet.href);
        }
        return importStringified;
    } else {
        var ruleStringified = rule2.cssText;
        if (isCSSStyleRule(rule2) && rule2.selectorText.includes(":")) {
            ruleStringified = fixSafariColons(ruleStringified);
        }
        if (sheetHref) {
            return absolutifyURLs(ruleStringified, sheetHref);
        }
        return ruleStringified;
    }
}
function fixSafariColons(cssStringified) {
    var regex = /(\[(?:[\w-]+)[^\\])(:(?:[\w-]+)\])/gm;
    return cssStringified.replace(regex, "$1\\$2");
}
function isCSSImportRule(rule2) {
    return "styleSheet" in rule2;
}
function isCSSStyleRule(rule2) {
    return "selectorText" in rule2;
}
var Mirror = /*#__PURE__*/ function() {
    function Mirror() {
        __publicField$1$1(this, "idNodeMap", /* @__PURE__ */ new Map());
        __publicField$1$1(this, "nodeMetaMap", /* @__PURE__ */ new WeakMap());
    }
    var _proto = Mirror.prototype;
    _proto.getId = function getId(n2) {
        var _a2;
        if (!n2) return -1;
        var id = (_a2 = this.getMeta(n2)) == null ? void 0 : _a2.id;
        return id != null ? id : -1;
    };
    _proto.getNode = function getNode(id) {
        return this.idNodeMap.get(id) || null;
    };
    _proto.getIds = function getIds() {
        return Array.from(this.idNodeMap.keys());
    };
    _proto.getMeta = function getMeta(n2) {
        return this.nodeMetaMap.get(n2) || null;
    };
    // removes the node from idNodeMap
    // doesn't remove the node from nodeMetaMap
    _proto.removeNodeFromMap = function removeNodeFromMap(n2) {
        var _this = this;
        var id = this.getId(n2);
        this.idNodeMap.delete(id);
        if (n2.childNodes) {
            n2.childNodes.forEach(function(childNode) {
                return _this.removeNodeFromMap(childNode);
            });
        }
    };
    _proto.has = function has(id) {
        return this.idNodeMap.has(id);
    };
    _proto.hasNode = function hasNode(node2) {
        return this.nodeMetaMap.has(node2);
    };
    _proto.add = function add(n2, meta) {
        var id = meta.id;
        this.idNodeMap.set(id, n2);
        this.nodeMetaMap.set(n2, meta);
    };
    _proto.replace = function replace(id, n2) {
        var oldNode = this.getNode(id);
        if (oldNode) {
            var meta = this.nodeMetaMap.get(oldNode);
            if (meta) this.nodeMetaMap.set(n2, meta);
        }
        this.idNodeMap.set(id, n2);
    };
    _proto.reset = function reset() {
        this.idNodeMap = /* @__PURE__ */ new Map();
        this.nodeMetaMap = /* @__PURE__ */ new WeakMap();
    };
    return Mirror;
}();
function createMirror$2() {
    return new Mirror();
}
function maskInputValue(param) {
    var element = param.element, maskInputOptions = param.maskInputOptions, tagName = param.tagName, type = param.type, value = param.value, maskInputFn = param.maskInputFn;
    var text = value || "";
    var actualType = type && toLowerCase(type);
    if (maskInputOptions[tagName.toLowerCase()] || actualType && maskInputOptions[actualType]) {
        if (maskInputFn) {
            text = maskInputFn(text, element);
        } else {
            text = "*".repeat(text.length);
        }
    }
    return text;
}
function toLowerCase(str) {
    return str.toLowerCase();
}
var ORIGINAL_ATTRIBUTE_NAME = "__rrweb_original__";
function is2DCanvasBlank(canvas) {
    var ctx = canvas.getContext("2d");
    if (!ctx) return true;
    var chunkSize = 50;
    for(var x2 = 0; x2 < canvas.width; x2 += chunkSize){
        for(var y = 0; y < canvas.height; y += chunkSize){
            var getImageData = ctx.getImageData;
            var originalGetImageData = ORIGINAL_ATTRIBUTE_NAME in getImageData ? getImageData[ORIGINAL_ATTRIBUTE_NAME] : getImageData;
            var pixelBuffer = new Uint32Array(// eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
            originalGetImageData.call(ctx, x2, y, Math.min(chunkSize, canvas.width - x2), Math.min(chunkSize, canvas.height - y)).data.buffer);
            if (pixelBuffer.some(function(pixel) {
                return pixel !== 0;
            })) return false;
        }
    }
    return true;
}
function getInputType(element) {
    var type = element.type;
    return element.hasAttribute("data-rr-is-password") ? "password" : type ? // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    toLowerCase(type) : null;
}
function extractFileExtension(path, baseURL) {
    var url;
    try {
        url = new URL(path, baseURL != null ? baseURL : window.location.href);
    } catch (err) {
        return null;
    }
    var regex = /\.([0-9a-z]+)(?:$)/i;
    var match = url.pathname.match(regex);
    var _ref;
    return (_ref = match == null ? void 0 : match[1]) != null ? _ref : null;
}
function extractOrigin(url) {
    var origin = "";
    if (url.indexOf("//") > -1) {
        origin = url.split("/").slice(0, 3).join("/");
    } else {
        origin = url.split("/")[0];
    }
    origin = origin.split("?")[0];
    return origin;
}
var URL_IN_CSS_REF = /url\((?:(')([^']*)'|(")(.*?)"|([^)]*))\)/gm;
var URL_PROTOCOL_MATCH = /^(?:[a-z+]+:)?\/\//i;
var URL_WWW_MATCH = /^www\..*/i;
var DATA_URI = /^(data:)([^,]*),(.*)/i;
function absolutifyURLs(cssText, href) {
    return (cssText || "").replace(URL_IN_CSS_REF, function(origin, quote1, path1, quote2, path2, path3) {
        var filePath = path1 || path2 || path3;
        var maybeQuote = quote1 || quote2 || "";
        if (!filePath) {
            return origin;
        }
        if (URL_PROTOCOL_MATCH.test(filePath) || URL_WWW_MATCH.test(filePath)) {
            return "url(" + maybeQuote + filePath + maybeQuote + ")";
        }
        if (DATA_URI.test(filePath)) {
            return "url(" + maybeQuote + filePath + maybeQuote + ")";
        }
        if (filePath[0] === "/") {
            return "url(" + maybeQuote + (extractOrigin(href) + filePath) + maybeQuote + ")";
        }
        var stack = href.split("/");
        var parts = filePath.split("/");
        stack.pop();
        for(var _iterator = _create_for_of_iterator_helper_loose(parts), _step; !(_step = _iterator()).done;){
            var part = _step.value;
            if (part === ".") {
                continue;
            } else if (part === "..") {
                stack.pop();
            } else {
                stack.push(part);
            }
        }
        return "url(" + maybeQuote + stack.join("/") + maybeQuote + ")";
    });
}
function normalizeCssString(cssText, _testNoPxNorm) {
    if (_testNoPxNorm === void 0) _testNoPxNorm = false;
    if (_testNoPxNorm) {
        return cssText.replace(/(\/\*[^*]*\*\/)|[\s;]/g, "");
    } else {
        return cssText.replace(/(\/\*[^*]*\*\/)|[\s;]/g, "").replace(/0px/g, "0");
    }
}
function splitCssText(cssText, style, _testNoPxNorm) {
    if (_testNoPxNorm === void 0) _testNoPxNorm = false;
    var childNodes2 = Array.from(style.childNodes);
    var splits = [];
    var iterCount = 0;
    if (childNodes2.length > 1 && cssText && typeof cssText === "string") {
        var cssTextNorm = normalizeCssString(cssText, _testNoPxNorm);
        var normFactor = cssTextNorm.length / cssText.length;
        for(var i2 = 1; i2 < childNodes2.length; i2++){
            if (childNodes2[i2].textContent && typeof childNodes2[i2].textContent === "string") {
                var textContentNorm = normalizeCssString(childNodes2[i2].textContent, _testNoPxNorm);
                var jLimit = 100;
                var j = 3;
                for(; j < textContentNorm.length; j++){
                    if (// keep consuming css identifiers (to get a decent chunk more quickly)
                    textContentNorm[j].match(/[a-zA-Z0-9]/) || // substring needs to be unique to this section
                    textContentNorm.indexOf(textContentNorm.substring(0, j), 1) !== -1) {
                        continue;
                    }
                    break;
                }
                for(; j < textContentNorm.length; j++){
                    var startSubstring = textContentNorm.substring(0, j);
                    var cssNormSplits = cssTextNorm.split(startSubstring);
                    var splitNorm = -1;
                    if (cssNormSplits.length === 2) {
                        splitNorm = cssNormSplits[0].length;
                    } else if (cssNormSplits.length > 2 && cssNormSplits[0] === "" && childNodes2[i2 - 1].textContent !== "") {
                        splitNorm = cssTextNorm.indexOf(startSubstring, 1);
                    } else if (cssNormSplits.length === 1) {
                        startSubstring = startSubstring.substring(0, startSubstring.length - 1);
                        cssNormSplits = cssTextNorm.split(startSubstring);
                        if (cssNormSplits.length <= 1) {
                            splits.push(cssText);
                            return splits;
                        }
                        j = jLimit + 1;
                    } else if (j === textContentNorm.length - 1) {
                        splitNorm = cssTextNorm.indexOf(startSubstring);
                    }
                    if (cssNormSplits.length >= 2 && j > jLimit) {
                        var prevTextContent = childNodes2[i2 - 1].textContent;
                        if (prevTextContent && typeof prevTextContent === "string") {
                            var prevMinLength = normalizeCssString(prevTextContent).length;
                            splitNorm = cssTextNorm.indexOf(startSubstring, prevMinLength);
                        }
                        if (splitNorm === -1) {
                            splitNorm = cssNormSplits[0].length;
                        }
                    }
                    if (splitNorm !== -1) {
                        var k = Math.floor(splitNorm / normFactor);
                        for(; k > 0 && k < cssText.length;){
                            iterCount += 1;
                            if (iterCount > 50 * childNodes2.length) {
                                splits.push(cssText);
                                return splits;
                            }
                            var normPart = normalizeCssString(cssText.substring(0, k), _testNoPxNorm);
                            if (normPart.length === splitNorm) {
                                splits.push(cssText.substring(0, k));
                                cssText = cssText.substring(k);
                                cssTextNorm = cssTextNorm.substring(splitNorm);
                                break;
                            } else if (normPart.length < splitNorm) {
                                k += Math.max(1, Math.floor((splitNorm - normPart.length) / normFactor));
                            } else {
                                k -= Math.max(1, Math.floor((normPart.length - splitNorm) * normFactor));
                            }
                        }
                        break;
                    }
                }
            }
        }
    }
    splits.push(cssText);
    return splits;
}
function markCssSplits(cssText, style) {
    return splitCssText(cssText, style).join("/* rr_split */");
}
var _id = 1;
var tagNameRegex = new RegExp("[^a-z0-9-_:]");
var IGNORED_NODE = -2;
function genId() {
    return _id++;
}
function getValidTagName$1(element) {
    if (_instanceof(element, HTMLFormElement)) {
        return "form";
    }
    var processedTagName = toLowerCase(element.tagName);
    if (tagNameRegex.test(processedTagName)) {
        return "div";
    }
    return processedTagName;
}
var canvasService;
var canvasCtx;
var SRCSET_NOT_SPACES = /^[^ \t\n\r\u000c]+/;
var SRCSET_COMMAS_OR_SPACES = /^[, \t\n\r\u000c]+/;
function getAbsoluteSrcsetString(doc, attributeValue) {
    if (attributeValue.trim() === "") {
        return attributeValue;
    }
    var pos = 0;
    function collectCharacters(regEx) {
        var chars2;
        var match = regEx.exec(attributeValue.substring(pos));
        if (match) {
            chars2 = match[0];
            pos += chars2.length;
            return chars2;
        }
        return "";
    }
    var output = [];
    while(true){
        collectCharacters(SRCSET_COMMAS_OR_SPACES);
        if (pos >= attributeValue.length) {
            break;
        }
        var url = collectCharacters(SRCSET_NOT_SPACES);
        if (url.slice(-1) === ",") {
            url = absoluteToDoc(doc, url.substring(0, url.length - 1));
            output.push(url);
        } else {
            var descriptorsStr = "";
            url = absoluteToDoc(doc, url);
            var inParens = false;
            while(true){
                var c2 = attributeValue.charAt(pos);
                if (c2 === "") {
                    output.push((url + descriptorsStr).trim());
                    break;
                } else if (!inParens) {
                    if (c2 === ",") {
                        pos += 1;
                        output.push((url + descriptorsStr).trim());
                        break;
                    } else if (c2 === "(") {
                        inParens = true;
                    }
                } else {
                    if (c2 === ")") {
                        inParens = false;
                    }
                }
                descriptorsStr += c2;
                pos += 1;
            }
        }
    }
    return output.join(", ");
}
var cachedDocument = /* @__PURE__ */ new WeakMap();
function absoluteToDoc(doc, attributeValue) {
    if (!attributeValue || attributeValue.trim() === "") {
        return attributeValue;
    }
    return getHref(doc, attributeValue);
}
function isSVGElement(el) {
    return Boolean(el.tagName === "svg" || el.ownerSVGElement);
}
function getHref(doc, customHref) {
    var a2 = cachedDocument.get(doc);
    if (!a2) {
        a2 = doc.createElement("a");
        cachedDocument.set(doc, a2);
    }
    if (!customHref) {
        customHref = "";
    } else if (customHref.startsWith("blob:") || customHref.startsWith("data:")) {
        return customHref;
    }
    a2.setAttribute("href", customHref);
    return a2.href;
}
function transformAttribute(doc, tagName, name, value) {
    if (!value) {
        return value;
    }
    if (name === "src" || name === "href" && !(tagName === "use" && value[0] === "#")) {
        return absoluteToDoc(doc, value);
    } else if (name === "xlink:href" && value[0] !== "#") {
        return absoluteToDoc(doc, value);
    } else if (name === "background" && (tagName === "table" || tagName === "td" || tagName === "th")) {
        return absoluteToDoc(doc, value);
    } else if (name === "srcset") {
        return getAbsoluteSrcsetString(doc, value);
    } else if (name === "style") {
        return absolutifyURLs(value, getHref(doc));
    } else if (tagName === "object" && name === "data") {
        return absoluteToDoc(doc, value);
    }
    return value;
}
function ignoreAttribute(tagName, name, _value) {
    return (tagName === "video" || tagName === "audio") && name === "autoplay";
}
function _isBlockedElement(element, blockClass, blockSelector) {
    try {
        if (typeof blockClass === "string") {
            if (element.classList.contains(blockClass)) {
                return true;
            }
        } else {
            for(var eIndex = element.classList.length; eIndex--;){
                var className = element.classList[eIndex];
                if (blockClass.test(className)) {
                    return true;
                }
            }
        }
        if (blockSelector) {
            return element.matches(blockSelector);
        }
    } catch (e2) {}
    return false;
}
function classMatchesRegex$1(node2, regex, checkAncestors) {
    if (!node2) return false;
    if (node2.nodeType !== node2.ELEMENT_NODE) {
        if (!checkAncestors) return false;
        return classMatchesRegex$1(index$1.parentNode(node2), regex, checkAncestors);
    }
    for(var eIndex = node2.classList.length; eIndex--;){
        var className = node2.classList[eIndex];
        if (regex.test(className)) {
            return true;
        }
    }
    if (!checkAncestors) return false;
    return classMatchesRegex$1(index$1.parentNode(node2), regex, checkAncestors);
}
function needMaskingText(node2, maskTextClass, maskTextSelector, checkAncestors) {
    var el;
    if (isElement(node2)) {
        el = node2;
        if (!index$1.childNodes(el).length) {
            return false;
        }
    } else if (index$1.parentElement(node2) === null) {
        return false;
    } else {
        el = index$1.parentElement(node2);
    }
    try {
        if (typeof maskTextClass === "string") {
            if (checkAncestors) {
                if (el.closest("." + maskTextClass)) return true;
            } else {
                if (el.classList.contains(maskTextClass)) return true;
            }
        } else {
            if (classMatchesRegex$1(el, maskTextClass, checkAncestors)) return true;
        }
        if (maskTextSelector) {
            if (checkAncestors) {
                if (el.closest(maskTextSelector)) return true;
            } else {
                if (el.matches(maskTextSelector)) return true;
            }
        }
    } catch (e2) {}
    return false;
}
function onceIframeLoaded(iframeEl, listener, iframeLoadTimeout) {
    var win = iframeEl.contentWindow;
    if (!win) {
        return;
    }
    var fired = false;
    var readyState;
    try {
        readyState = win.document.readyState;
    } catch (error) {
        return;
    }
    if (readyState !== "complete") {
        var timer = setTimeout(function() {
            if (!fired) {
                listener();
                fired = true;
            }
        }, iframeLoadTimeout);
        iframeEl.addEventListener("load", function() {
            clearTimeout(timer);
            fired = true;
            listener();
        });
        return;
    }
    var blankUrl = "about:blank";
    if (win.location.href !== blankUrl || iframeEl.src === blankUrl || iframeEl.src === "") {
        setTimeout(listener, 0);
        return iframeEl.addEventListener("load", listener);
    }
    iframeEl.addEventListener("load", listener);
}
function onceStylesheetLoaded(link, listener, styleSheetLoadTimeout) {
    var fired = false;
    var styleSheetLoaded;
    try {
        styleSheetLoaded = link.sheet;
    } catch (error) {
        return;
    }
    if (styleSheetLoaded) return;
    var timer = setTimeout(function() {
        if (!fired) {
            listener();
            fired = true;
        }
    }, styleSheetLoadTimeout);
    link.addEventListener("load", function() {
        clearTimeout(timer);
        fired = true;
        listener();
    });
}
function serializeNode(n2, options) {
    var doc = options.doc, mirror2 = options.mirror, blockClass = options.blockClass, blockSelector = options.blockSelector, needsMask = options.needsMask, inlineStylesheet = options.inlineStylesheet, _options_maskInputOptions = options.maskInputOptions, maskInputOptions = _options_maskInputOptions === void 0 ? {} : _options_maskInputOptions, maskTextFn = options.maskTextFn, maskInputFn = options.maskInputFn, _options_dataURLOptions = options.dataURLOptions, dataURLOptions = _options_dataURLOptions === void 0 ? {} : _options_dataURLOptions, inlineImages = options.inlineImages, recordCanvas = options.recordCanvas, keepIframeSrcFn = options.keepIframeSrcFn, _options_newlyAddedElement = options.newlyAddedElement, newlyAddedElement = _options_newlyAddedElement === void 0 ? false : _options_newlyAddedElement, _options_cssCaptured = options.cssCaptured, cssCaptured = _options_cssCaptured === void 0 ? false : _options_cssCaptured;
    var rootId = getRootId(doc, mirror2);
    switch(n2.nodeType){
        case n2.DOCUMENT_NODE:
            if (n2.compatMode !== "CSS1Compat") {
                return {
                    type: NodeType$3.Document,
                    childNodes: [],
                    compatMode: n2.compatMode
                };
            } else {
                return {
                    type: NodeType$3.Document,
                    childNodes: []
                };
            }
        case n2.DOCUMENT_TYPE_NODE:
            return {
                type: NodeType$3.DocumentType,
                name: n2.name,
                publicId: n2.publicId,
                systemId: n2.systemId,
                rootId: rootId
            };
        case n2.ELEMENT_NODE:
            return serializeElementNode(n2, {
                doc: doc,
                blockClass: blockClass,
                blockSelector: blockSelector,
                inlineStylesheet: inlineStylesheet,
                maskInputOptions: maskInputOptions,
                maskInputFn: maskInputFn,
                dataURLOptions: dataURLOptions,
                inlineImages: inlineImages,
                recordCanvas: recordCanvas,
                keepIframeSrcFn: keepIframeSrcFn,
                newlyAddedElement: newlyAddedElement,
                rootId: rootId
            });
        case n2.TEXT_NODE:
            return serializeTextNode(n2, {
                doc: doc,
                needsMask: needsMask,
                maskTextFn: maskTextFn,
                rootId: rootId,
                cssCaptured: cssCaptured
            });
        case n2.CDATA_SECTION_NODE:
            return {
                type: NodeType$3.CDATA,
                textContent: "",
                rootId: rootId
            };
        case n2.COMMENT_NODE:
            return {
                type: NodeType$3.Comment,
                textContent: index$1.textContent(n2) || "",
                rootId: rootId
            };
        default:
            return false;
    }
}
function getRootId(doc, mirror2) {
    if (!mirror2.hasNode(doc)) return void 0;
    var docId = mirror2.getId(doc);
    return docId === 1 ? void 0 : docId;
}
function serializeTextNode(n2, options) {
    var needsMask = options.needsMask, maskTextFn = options.maskTextFn, rootId = options.rootId, cssCaptured = options.cssCaptured;
    var parent = index$1.parentNode(n2);
    var parentTagName = parent && parent.tagName;
    var textContent2 = "";
    var isStyle = parentTagName === "STYLE" ? true : void 0;
    var isScript = parentTagName === "SCRIPT" ? true : void 0;
    if (isScript) {
        textContent2 = "SCRIPT_PLACEHOLDER";
    } else if (!cssCaptured) {
        textContent2 = index$1.textContent(n2);
        if (isStyle && textContent2) {
            textContent2 = absolutifyURLs(textContent2, getHref(options.doc));
        }
    }
    if (!isStyle && !isScript && textContent2 && needsMask) {
        textContent2 = maskTextFn ? maskTextFn(textContent2, index$1.parentElement(n2)) : textContent2.replace(/[\S]/g, "*");
    }
    return {
        type: NodeType$3.Text,
        textContent: textContent2 || "",
        rootId: rootId
    };
}
function serializeElementNode(n2, options) {
    var doc = options.doc, blockClass = options.blockClass, blockSelector = options.blockSelector, inlineStylesheet = options.inlineStylesheet, _options_maskInputOptions = options.maskInputOptions, maskInputOptions = _options_maskInputOptions === void 0 ? {} : _options_maskInputOptions, maskInputFn = options.maskInputFn, _options_dataURLOptions = options.dataURLOptions, dataURLOptions = _options_dataURLOptions === void 0 ? {} : _options_dataURLOptions, inlineImages = options.inlineImages, recordCanvas = options.recordCanvas, keepIframeSrcFn = options.keepIframeSrcFn, _options_newlyAddedElement = options.newlyAddedElement, newlyAddedElement = _options_newlyAddedElement === void 0 ? false : _options_newlyAddedElement, rootId = options.rootId;
    var needBlock = _isBlockedElement(n2, blockClass, blockSelector);
    var tagName = getValidTagName$1(n2);
    var attributes = {};
    var len = n2.attributes.length;
    for(var i2 = 0; i2 < len; i2++){
        var attr = n2.attributes[i2];
        if (!ignoreAttribute(tagName, attr.name, attr.value)) {
            attributes[attr.name] = transformAttribute(doc, tagName, toLowerCase(attr.name), attr.value);
        }
    }
    if (tagName === "link" && inlineStylesheet) {
        var stylesheet = Array.from(doc.styleSheets).find(function(s2) {
            return s2.href === n2.href;
        });
        var cssText = null;
        if (stylesheet) {
            cssText = stringifyStylesheet(stylesheet);
        }
        if (cssText) {
            delete attributes.rel;
            delete attributes.href;
            attributes._cssText = cssText;
        }
    }
    if (tagName === "style" && n2.sheet) {
        var cssText1 = stringifyStylesheet(n2.sheet);
        if (cssText1) {
            if (n2.childNodes.length > 1) {
                cssText1 = markCssSplits(cssText1, n2);
            }
            attributes._cssText = cssText1;
        }
    }
    if (tagName === "input" || tagName === "textarea" || tagName === "select") {
        var value = n2.value;
        var checked = n2.checked;
        if (attributes.type !== "radio" && attributes.type !== "checkbox" && attributes.type !== "submit" && attributes.type !== "button" && value) {
            attributes.value = maskInputValue({
                element: n2,
                type: getInputType(n2),
                tagName: tagName,
                value: value,
                maskInputOptions: maskInputOptions,
                maskInputFn: maskInputFn
            });
        } else if (checked) {
            attributes.checked = checked;
        }
    }
    if (tagName === "option") {
        if (n2.selected && !maskInputOptions["select"]) {
            attributes.selected = true;
        } else {
            delete attributes.selected;
        }
    }
    if (tagName === "dialog" && n2.open) {
        attributes.rr_open_mode = n2.matches("dialog:modal") ? "modal" : "non-modal";
    }
    if (tagName === "canvas" && recordCanvas) {
        if (n2.__context === "2d") {
            if (!is2DCanvasBlank(n2)) {
                attributes.rr_dataURL = n2.toDataURL(dataURLOptions.type, dataURLOptions.quality);
            }
        } else if (!("__context" in n2)) {
            var canvasDataURL = n2.toDataURL(dataURLOptions.type, dataURLOptions.quality);
            var blankCanvas = doc.createElement("canvas");
            blankCanvas.width = n2.width;
            blankCanvas.height = n2.height;
            var blankCanvasDataURL = blankCanvas.toDataURL(dataURLOptions.type, dataURLOptions.quality);
            if (canvasDataURL !== blankCanvasDataURL) {
                attributes.rr_dataURL = canvasDataURL;
            }
        }
    }
    if (tagName === "img" && inlineImages) {
        if (!canvasService) {
            canvasService = doc.createElement("canvas");
            canvasCtx = canvasService.getContext("2d");
        }
        var image = n2;
        var imageSrc = image.currentSrc || image.getAttribute("src") || "<unknown-src>";
        var priorCrossOrigin = image.crossOrigin;
        var recordInlineImage = function() {
            image.removeEventListener("load", recordInlineImage);
            try {
                canvasService.width = image.naturalWidth;
                canvasService.height = image.naturalHeight;
                canvasCtx.drawImage(image, 0, 0);
                attributes.rr_dataURL = canvasService.toDataURL(dataURLOptions.type, dataURLOptions.quality);
            } catch (err) {
                if (image.crossOrigin !== "anonymous") {
                    image.crossOrigin = "anonymous";
                    if (image.complete && image.naturalWidth !== 0) recordInlineImage();
                    else image.addEventListener("load", recordInlineImage);
                    return;
                } else {
                    console.warn("Cannot inline img src=" + imageSrc + "! Error: " + err);
                }
            }
            if (image.crossOrigin === "anonymous") {
                priorCrossOrigin ? attributes.crossOrigin = priorCrossOrigin : image.removeAttribute("crossorigin");
            }
        };
        if (image.complete && image.naturalWidth !== 0) recordInlineImage();
        else image.addEventListener("load", recordInlineImage);
    }
    if (tagName === "audio" || tagName === "video") {
        var mediaAttributes = attributes;
        mediaAttributes.rr_mediaState = n2.paused ? "paused" : "played";
        mediaAttributes.rr_mediaCurrentTime = n2.currentTime;
        mediaAttributes.rr_mediaPlaybackRate = n2.playbackRate;
        mediaAttributes.rr_mediaMuted = n2.muted;
        mediaAttributes.rr_mediaLoop = n2.loop;
        mediaAttributes.rr_mediaVolume = n2.volume;
    }
    if (!newlyAddedElement) {
        if (n2.scrollLeft) {
            attributes.rr_scrollLeft = n2.scrollLeft;
        }
        if (n2.scrollTop) {
            attributes.rr_scrollTop = n2.scrollTop;
        }
    }
    if (needBlock) {
        var _n2_getBoundingClientRect = n2.getBoundingClientRect(), width = _n2_getBoundingClientRect.width, height = _n2_getBoundingClientRect.height;
        attributes = {
            class: attributes.class,
            rr_width: "" + width + "px",
            rr_height: "" + height + "px"
        };
    }
    if (tagName === "iframe" && !keepIframeSrcFn(attributes.src)) {
        if (!n2.contentDocument) {
            attributes.rr_src = attributes.src;
        }
        delete attributes.src;
    }
    var isCustomElement;
    try {
        if (customElements.get(tagName)) isCustomElement = true;
    } catch (e2) {}
    return {
        type: NodeType$3.Element,
        tagName: tagName,
        attributes: attributes,
        childNodes: [],
        isSVG: isSVGElement(n2) || void 0,
        needBlock: needBlock,
        rootId: rootId,
        isCustom: isCustomElement
    };
}
function lowerIfExists(maybeAttr) {
    if (maybeAttr === void 0 || maybeAttr === null) {
        return "";
    } else {
        return maybeAttr.toLowerCase();
    }
}
function slimDOMExcluded(sn, slimDOMOptions) {
    if (slimDOMOptions.comment && sn.type === NodeType$3.Comment) {
        return true;
    } else if (sn.type === NodeType$3.Element) {
        if (slimDOMOptions.script && // script tag
        (sn.tagName === "script" || // (module)preload link
        sn.tagName === "link" && (sn.attributes.rel === "preload" && sn.attributes.as === "script" || sn.attributes.rel === "modulepreload") || // prefetch link
        sn.tagName === "link" && sn.attributes.rel === "prefetch" && typeof sn.attributes.href === "string" && extractFileExtension(sn.attributes.href) === "js")) {
            return true;
        } else if (slimDOMOptions.headFavicon && (sn.tagName === "link" && sn.attributes.rel === "shortcut icon" || sn.tagName === "meta" && (lowerIfExists(sn.attributes.name).match(/^msapplication-tile(image|color)$/) || lowerIfExists(sn.attributes.name) === "application-name" || lowerIfExists(sn.attributes.rel) === "icon" || lowerIfExists(sn.attributes.rel) === "apple-touch-icon" || lowerIfExists(sn.attributes.rel) === "shortcut icon"))) {
            return true;
        } else if (sn.tagName === "meta") {
            if (slimDOMOptions.headMetaDescKeywords && lowerIfExists(sn.attributes.name).match(/^description|keywords$/)) {
                return true;
            } else if (slimDOMOptions.headMetaSocial && (lowerIfExists(sn.attributes.property).match(/^(og|twitter|fb):/) || // og = opengraph (facebook)
            lowerIfExists(sn.attributes.name).match(/^(og|twitter):/) || lowerIfExists(sn.attributes.name) === "pinterest")) {
                return true;
            } else if (slimDOMOptions.headMetaRobots && (lowerIfExists(sn.attributes.name) === "robots" || lowerIfExists(sn.attributes.name) === "googlebot" || lowerIfExists(sn.attributes.name) === "bingbot")) {
                return true;
            } else if (slimDOMOptions.headMetaHttpEquiv && sn.attributes["http-equiv"] !== void 0) {
                return true;
            } else if (slimDOMOptions.headMetaAuthorship && (lowerIfExists(sn.attributes.name) === "author" || lowerIfExists(sn.attributes.name) === "generator" || lowerIfExists(sn.attributes.name) === "framework" || lowerIfExists(sn.attributes.name) === "publisher" || lowerIfExists(sn.attributes.name) === "progid" || lowerIfExists(sn.attributes.property).match(/^article:/) || lowerIfExists(sn.attributes.property).match(/^product:/))) {
                return true;
            } else if (slimDOMOptions.headMetaVerification && (lowerIfExists(sn.attributes.name) === "google-site-verification" || lowerIfExists(sn.attributes.name) === "yandex-verification" || lowerIfExists(sn.attributes.name) === "csrf-token" || lowerIfExists(sn.attributes.name) === "p:domain_verify" || lowerIfExists(sn.attributes.name) === "verify-v1" || lowerIfExists(sn.attributes.name) === "verification" || lowerIfExists(sn.attributes.name) === "shopify-checkout-api-token")) {
                return true;
            }
        }
    }
    return false;
}
function serializeNodeWithId(n2, options) {
    var doc = options.doc, mirror2 = options.mirror, blockClass = options.blockClass, blockSelector = options.blockSelector, maskTextClass = options.maskTextClass, maskTextSelector = options.maskTextSelector, _options_skipChild = options.skipChild, skipChild = _options_skipChild === void 0 ? false : _options_skipChild, _options_inlineStylesheet = options.inlineStylesheet, inlineStylesheet = _options_inlineStylesheet === void 0 ? true : _options_inlineStylesheet, _options_maskInputOptions = options.maskInputOptions, maskInputOptions = _options_maskInputOptions === void 0 ? {} : _options_maskInputOptions, maskTextFn = options.maskTextFn, maskInputFn = options.maskInputFn, slimDOMOptions = options.slimDOMOptions, _options_dataURLOptions = options.dataURLOptions, dataURLOptions = _options_dataURLOptions === void 0 ? {} : _options_dataURLOptions, _options_inlineImages = options.inlineImages, inlineImages = _options_inlineImages === void 0 ? false : _options_inlineImages, _options_recordCanvas = options.recordCanvas, recordCanvas = _options_recordCanvas === void 0 ? false : _options_recordCanvas, onSerialize = options.onSerialize, onIframeLoad = options.onIframeLoad, _options_iframeLoadTimeout = options.iframeLoadTimeout, iframeLoadTimeout = _options_iframeLoadTimeout === void 0 ? 5e3 : _options_iframeLoadTimeout, onStylesheetLoad = options.onStylesheetLoad, _options_stylesheetLoadTimeout = options.stylesheetLoadTimeout, stylesheetLoadTimeout = _options_stylesheetLoadTimeout === void 0 ? 5e3 : _options_stylesheetLoadTimeout, _options_keepIframeSrcFn = options.keepIframeSrcFn, keepIframeSrcFn = _options_keepIframeSrcFn === void 0 ? function() {
        return false;
    } : _options_keepIframeSrcFn, _options_newlyAddedElement = options.newlyAddedElement, newlyAddedElement = _options_newlyAddedElement === void 0 ? false : _options_newlyAddedElement, _options_cssCaptured = options.cssCaptured, cssCaptured = _options_cssCaptured === void 0 ? false : _options_cssCaptured;
    var needsMask = options.needsMask;
    var _options_preserveWhiteSpace = options.preserveWhiteSpace, preserveWhiteSpace = _options_preserveWhiteSpace === void 0 ? true : _options_preserveWhiteSpace;
    if (!needsMask) {
        var checkAncestors = needsMask === void 0;
        needsMask = needMaskingText(n2, maskTextClass, maskTextSelector, checkAncestors);
    }
    var _serializedNode = serializeNode(n2, {
        doc: doc,
        mirror: mirror2,
        blockClass: blockClass,
        blockSelector: blockSelector,
        needsMask: needsMask,
        inlineStylesheet: inlineStylesheet,
        maskInputOptions: maskInputOptions,
        maskTextFn: maskTextFn,
        maskInputFn: maskInputFn,
        dataURLOptions: dataURLOptions,
        inlineImages: inlineImages,
        recordCanvas: recordCanvas,
        keepIframeSrcFn: keepIframeSrcFn,
        newlyAddedElement: newlyAddedElement,
        cssCaptured: cssCaptured
    });
    if (!_serializedNode) {
        console.warn(n2, "not serialized");
        return null;
    }
    var id;
    if (mirror2.hasNode(n2)) {
        id = mirror2.getId(n2);
    } else if (slimDOMExcluded(_serializedNode, slimDOMOptions) || !preserveWhiteSpace && _serializedNode.type === NodeType$3.Text && !_serializedNode.textContent.replace(/^\s+|\s+$/gm, "").length) {
        id = IGNORED_NODE;
    } else {
        id = genId();
    }
    var serializedNode = Object.assign(_serializedNode, {
        id: id
    });
    mirror2.add(n2, serializedNode);
    if (id === IGNORED_NODE) {
        return null;
    }
    if (onSerialize) {
        onSerialize(n2);
    }
    var recordChild = !skipChild;
    if (serializedNode.type === NodeType$3.Element) {
        recordChild = recordChild && !serializedNode.needBlock;
        delete serializedNode.needBlock;
        var shadowRootEl = index$1.shadowRoot(n2);
        if (shadowRootEl && isNativeShadowDom(shadowRootEl)) serializedNode.isShadowHost = true;
    }
    if ((serializedNode.type === NodeType$3.Document || serializedNode.type === NodeType$3.Element) && recordChild) {
        if (slimDOMOptions.headWhitespace && serializedNode.type === NodeType$3.Element && serializedNode.tagName === "head") {
            preserveWhiteSpace = false;
        }
        var bypassOptions = {
            doc: doc,
            mirror: mirror2,
            blockClass: blockClass,
            blockSelector: blockSelector,
            needsMask: needsMask,
            maskTextClass: maskTextClass,
            maskTextSelector: maskTextSelector,
            skipChild: skipChild,
            inlineStylesheet: inlineStylesheet,
            maskInputOptions: maskInputOptions,
            maskTextFn: maskTextFn,
            maskInputFn: maskInputFn,
            slimDOMOptions: slimDOMOptions,
            dataURLOptions: dataURLOptions,
            inlineImages: inlineImages,
            recordCanvas: recordCanvas,
            preserveWhiteSpace: preserveWhiteSpace,
            onSerialize: onSerialize,
            onIframeLoad: onIframeLoad,
            iframeLoadTimeout: iframeLoadTimeout,
            onStylesheetLoad: onStylesheetLoad,
            stylesheetLoadTimeout: stylesheetLoadTimeout,
            keepIframeSrcFn: keepIframeSrcFn,
            cssCaptured: false
        };
        if (serializedNode.type === NodeType$3.Element && serializedNode.tagName === "textarea" && serializedNode.attributes.value !== void 0) ;
        else {
            if (serializedNode.type === NodeType$3.Element && serializedNode.attributes._cssText !== void 0 && typeof serializedNode.attributes._cssText === "string") {
                bypassOptions.cssCaptured = true;
            }
            for(var _iterator = _create_for_of_iterator_helper_loose(Array.from(index$1.childNodes(n2))), _step; !(_step = _iterator()).done;){
                var childN = _step.value;
                var serializedChildNode = serializeNodeWithId(childN, bypassOptions);
                if (serializedChildNode) {
                    serializedNode.childNodes.push(serializedChildNode);
                }
            }
        }
        var shadowRootEl1 = null;
        if (isElement(n2) && (shadowRootEl1 = index$1.shadowRoot(n2))) {
            for(var _iterator1 = _create_for_of_iterator_helper_loose(Array.from(index$1.childNodes(shadowRootEl1))), _step1; !(_step1 = _iterator1()).done;){
                var childN1 = _step1.value;
                var serializedChildNode1 = serializeNodeWithId(childN1, bypassOptions);
                if (serializedChildNode1) {
                    isNativeShadowDom(shadowRootEl1) && (serializedChildNode1.isShadow = true);
                    serializedNode.childNodes.push(serializedChildNode1);
                }
            }
        }
    }
    var parent = index$1.parentNode(n2);
    if (parent && isShadowRoot(parent) && isNativeShadowDom(parent)) {
        serializedNode.isShadow = true;
    }
    if (serializedNode.type === NodeType$3.Element && serializedNode.tagName === "iframe") {
        onceIframeLoaded(n2, function() {
            var iframeDoc = n2.contentDocument;
            if (iframeDoc && onIframeLoad) {
                var serializedIframeNode = serializeNodeWithId(iframeDoc, {
                    doc: iframeDoc,
                    mirror: mirror2,
                    blockClass: blockClass,
                    blockSelector: blockSelector,
                    needsMask: needsMask,
                    maskTextClass: maskTextClass,
                    maskTextSelector: maskTextSelector,
                    skipChild: false,
                    inlineStylesheet: inlineStylesheet,
                    maskInputOptions: maskInputOptions,
                    maskTextFn: maskTextFn,
                    maskInputFn: maskInputFn,
                    slimDOMOptions: slimDOMOptions,
                    dataURLOptions: dataURLOptions,
                    inlineImages: inlineImages,
                    recordCanvas: recordCanvas,
                    preserveWhiteSpace: preserveWhiteSpace,
                    onSerialize: onSerialize,
                    onIframeLoad: onIframeLoad,
                    iframeLoadTimeout: iframeLoadTimeout,
                    onStylesheetLoad: onStylesheetLoad,
                    stylesheetLoadTimeout: stylesheetLoadTimeout,
                    keepIframeSrcFn: keepIframeSrcFn
                });
                if (serializedIframeNode) {
                    onIframeLoad(n2, serializedIframeNode);
                }
            }
        }, iframeLoadTimeout);
    }
    if (serializedNode.type === NodeType$3.Element && serializedNode.tagName === "link" && typeof serializedNode.attributes.rel === "string" && (serializedNode.attributes.rel === "stylesheet" || serializedNode.attributes.rel === "preload" && typeof serializedNode.attributes.href === "string" && extractFileExtension(serializedNode.attributes.href) === "css")) {
        onceStylesheetLoaded(n2, function() {
            if (onStylesheetLoad) {
                var serializedLinkNode = serializeNodeWithId(n2, {
                    doc: doc,
                    mirror: mirror2,
                    blockClass: blockClass,
                    blockSelector: blockSelector,
                    needsMask: needsMask,
                    maskTextClass: maskTextClass,
                    maskTextSelector: maskTextSelector,
                    skipChild: false,
                    inlineStylesheet: inlineStylesheet,
                    maskInputOptions: maskInputOptions,
                    maskTextFn: maskTextFn,
                    maskInputFn: maskInputFn,
                    slimDOMOptions: slimDOMOptions,
                    dataURLOptions: dataURLOptions,
                    inlineImages: inlineImages,
                    recordCanvas: recordCanvas,
                    preserveWhiteSpace: preserveWhiteSpace,
                    onSerialize: onSerialize,
                    onIframeLoad: onIframeLoad,
                    iframeLoadTimeout: iframeLoadTimeout,
                    onStylesheetLoad: onStylesheetLoad,
                    stylesheetLoadTimeout: stylesheetLoadTimeout,
                    keepIframeSrcFn: keepIframeSrcFn
                });
                if (serializedLinkNode) {
                    onStylesheetLoad(n2, serializedLinkNode);
                }
            }
        }, stylesheetLoadTimeout);
    }
    return serializedNode;
}
function snapshot(n2, options) {
    var _ref = options || {}, tmp = _ref.mirror, mirror2 = tmp === void 0 ? new Mirror() : tmp, _ref_blockClass = _ref.blockClass, blockClass = _ref_blockClass === void 0 ? "rr-block" : _ref_blockClass, _ref_blockSelector = _ref.blockSelector, blockSelector = _ref_blockSelector === void 0 ? null : _ref_blockSelector, _ref_maskTextClass = _ref.maskTextClass, maskTextClass = _ref_maskTextClass === void 0 ? "rr-mask" : _ref_maskTextClass, _ref_maskTextSelector = _ref.maskTextSelector, maskTextSelector = _ref_maskTextSelector === void 0 ? null : _ref_maskTextSelector, _ref_inlineStylesheet = _ref.inlineStylesheet, inlineStylesheet = _ref_inlineStylesheet === void 0 ? true : _ref_inlineStylesheet, _ref_inlineImages = _ref.inlineImages, inlineImages = _ref_inlineImages === void 0 ? false : _ref_inlineImages, _ref_recordCanvas = _ref.recordCanvas, recordCanvas = _ref_recordCanvas === void 0 ? false : _ref_recordCanvas, _ref_maskAllInputs = _ref.maskAllInputs, maskAllInputs = _ref_maskAllInputs === void 0 ? false : _ref_maskAllInputs, maskTextFn = _ref.maskTextFn, maskInputFn = _ref.maskInputFn, _ref_slimDOM = _ref.slimDOM, slimDOM = _ref_slimDOM === void 0 ? false : _ref_slimDOM, dataURLOptions = _ref.dataURLOptions, preserveWhiteSpace = _ref.preserveWhiteSpace, onSerialize = _ref.onSerialize, onIframeLoad = _ref.onIframeLoad, iframeLoadTimeout = _ref.iframeLoadTimeout, onStylesheetLoad = _ref.onStylesheetLoad, stylesheetLoadTimeout = _ref.stylesheetLoadTimeout, _ref_keepIframeSrcFn = _ref.keepIframeSrcFn, keepIframeSrcFn = _ref_keepIframeSrcFn === void 0 ? function() {
        return false;
    } : _ref_keepIframeSrcFn;
    var maskInputOptions = maskAllInputs === true ? {
        color: true,
        date: true,
        "datetime-local": true,
        email: true,
        month: true,
        number: true,
        range: true,
        search: true,
        tel: true,
        text: true,
        time: true,
        url: true,
        week: true,
        textarea: true,
        select: true,
        password: true,
        hidden: true
    } : maskAllInputs === false ? {
        password: true
    } : maskAllInputs;
    var slimDOMOptions = slimDOM === true || slimDOM === "all" ? // if true: set of sensible options that should not throw away any information
    {
        script: true,
        comment: true,
        headFavicon: true,
        headWhitespace: true,
        headMetaDescKeywords: slimDOM === "all",
        // destructive
        headMetaSocial: true,
        headMetaRobots: true,
        headMetaHttpEquiv: true,
        headMetaAuthorship: true,
        headMetaVerification: true
    } : slimDOM === false ? {} : slimDOM;
    return serializeNodeWithId(n2, {
        doc: n2,
        mirror: mirror2,
        blockClass: blockClass,
        blockSelector: blockSelector,
        maskTextClass: maskTextClass,
        maskTextSelector: maskTextSelector,
        skipChild: false,
        inlineStylesheet: inlineStylesheet,
        maskInputOptions: maskInputOptions,
        maskTextFn: maskTextFn,
        maskInputFn: maskInputFn,
        slimDOMOptions: slimDOMOptions,
        dataURLOptions: dataURLOptions,
        inlineImages: inlineImages,
        recordCanvas: recordCanvas,
        preserveWhiteSpace: preserveWhiteSpace,
        onSerialize: onSerialize,
        onIframeLoad: onIframeLoad,
        iframeLoadTimeout: iframeLoadTimeout,
        onStylesheetLoad: onStylesheetLoad,
        stylesheetLoadTimeout: stylesheetLoadTimeout,
        keepIframeSrcFn: keepIframeSrcFn,
        newlyAddedElement: false
    });
}
function getDefaultExportFromCjs$1(x2) {
    return x2 && x2.__esModule && Object.prototype.hasOwnProperty.call(x2, "default") ? x2["default"] : x2;
}
function getAugmentedNamespace$1(n2) {
    if (n2.__esModule) return n2;
    var f2 = n2.default;
    if (typeof f2 == "function") {
        var a2 = function a22() {
            if (_instanceof(this, a22)) {
                return Reflect.construct(f2, arguments, this.constructor);
            }
            return f2.apply(this, arguments);
        };
        a2.prototype = f2.prototype;
    } else a2 = {};
    Object.defineProperty(a2, "__esModule", {
        value: true
    });
    Object.keys(n2).forEach(function(k) {
        var d = Object.getOwnPropertyDescriptor(n2, k);
        Object.defineProperty(a2, k, d.get ? d : {
            enumerable: true,
            get: function get() {
                return n2[k];
            }
        });
    });
    return a2;
}
var picocolors_browser$1 = {
    exports: {}
};
var x$1 = String;
var create$1 = function create$1() {
    return {
        isColorSupported: false,
        reset: x$1,
        bold: x$1,
        dim: x$1,
        italic: x$1,
        underline: x$1,
        inverse: x$1,
        hidden: x$1,
        strikethrough: x$1,
        black: x$1,
        red: x$1,
        green: x$1,
        yellow: x$1,
        blue: x$1,
        magenta: x$1,
        cyan: x$1,
        white: x$1,
        gray: x$1,
        bgBlack: x$1,
        bgRed: x$1,
        bgGreen: x$1,
        bgYellow: x$1,
        bgBlue: x$1,
        bgMagenta: x$1,
        bgCyan: x$1,
        bgWhite: x$1
    };
};
picocolors_browser$1.exports = create$1();
picocolors_browser$1.exports.createColors = create$1;
var picocolors_browserExports$1 = picocolors_browser$1.exports;
var __viteBrowserExternal$2 = {};
var __viteBrowserExternal$1$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
    __proto__: null,
    default: __viteBrowserExternal$2
}, Symbol.toStringTag, {
    value: "Module"
}));
var require$$2$1 = /* @__PURE__ */ getAugmentedNamespace$1(__viteBrowserExternal$1$1);
var pico$1 = picocolors_browserExports$1;
var terminalHighlight$1$1 = require$$2$1;
var CssSyntaxError$3$1 = /*#__PURE__*/ function(Error1) {
    _inherits(CssSyntaxError, Error1);
    function CssSyntaxError(message, line, column, source, file, plugin22) {
        var _this;
        _this = Error1.call(this, message) || this;
        _this.name = "CssSyntaxError";
        _this.reason = message;
        if (file) {
            _this.file = file;
        }
        if (source) {
            _this.source = source;
        }
        if (plugin22) {
            _this.plugin = plugin22;
        }
        if (typeof line !== "undefined" && typeof column !== "undefined") {
            if (typeof line === "number") {
                _this.line = line;
                _this.column = column;
            } else {
                _this.line = line.line;
                _this.column = line.column;
                _this.endLine = column.line;
                _this.endColumn = column.column;
            }
        }
        _this.setMessage();
        if (Error.captureStackTrace) {
            Error.captureStackTrace(_this, CssSyntaxError);
        }
        return _this;
    }
    var _proto = CssSyntaxError.prototype;
    _proto.setMessage = function setMessage() {
        this.message = this.plugin ? this.plugin + ": " : "";
        this.message += this.file ? this.file : "<css input>";
        if (typeof this.line !== "undefined") {
            this.message += ":" + this.line + ":" + this.column;
        }
        this.message += ": " + this.reason;
    };
    _proto.showSourceCode = function showSourceCode(color) {
        var _this = this;
        if (!this.source) return "";
        var css = this.source;
        if (color == null) color = pico$1.isColorSupported;
        if (terminalHighlight$1$1) {
            if (color) css = terminalHighlight$1$1(css);
        }
        var lines = css.split(/\r?\n/);
        var start = Math.max(this.line - 3, 0);
        var end = Math.min(this.line + 2, lines.length);
        var maxWidth = String(end).length;
        var mark, aside;
        if (color) {
            var _pico$1_createColors = pico$1.createColors(true), bold = _pico$1_createColors.bold, gray = _pico$1_createColors.gray, red = _pico$1_createColors.red;
            mark = function(text) {
                return bold(red(text));
            };
            aside = function(text) {
                return gray(text);
            };
        } else {
            mark = aside = function(str) {
                return str;
            };
        }
        return lines.slice(start, end).map(function(line, index2) {
            var number = start + 1 + index2;
            var gutter = " " + (" " + number).slice(-maxWidth) + " | ";
            if (number === _this.line) {
                var spacing = aside(gutter.replace(/\d/g, " ")) + line.slice(0, _this.column - 1).replace(/[^\t]/g, " ");
                return mark(">") + aside(gutter) + line + "\n " + spacing + mark("^");
            }
            return " " + aside(gutter) + line;
        }).join("\n");
    };
    _proto.toString = function toString() {
        var code = this.showSourceCode();
        if (code) {
            code = "\n\n" + code + "\n";
        }
        return this.name + ": " + this.message + code;
    };
    return CssSyntaxError;
}(_wrap_native_super(Error));
var cssSyntaxError$1 = CssSyntaxError$3$1;
CssSyntaxError$3$1.default = CssSyntaxError$3$1;
var symbols$1 = {};
symbols$1.isClean = Symbol("isClean");
symbols$1.my = Symbol("my");
var DEFAULT_RAW$1 = {
    after: "\n",
    beforeClose: "\n",
    beforeComment: "\n",
    beforeDecl: "\n",
    beforeOpen: " ",
    beforeRule: "\n",
    colon: ": ",
    commentLeft: " ",
    commentRight: " ",
    emptyBody: "",
    indent: "    ",
    semicolon: false
};
function capitalize$1(str) {
    return str[0].toUpperCase() + str.slice(1);
}
var Stringifier$2$1 = /*#__PURE__*/ function() {
    function Stringifier(builder) {
        this.builder = builder;
    }
    var _proto = Stringifier.prototype;
    _proto.atrule = function atrule(node2, semicolon) {
        var name = "@" + node2.name;
        var params = node2.params ? this.rawValue(node2, "params") : "";
        if (typeof node2.raws.afterName !== "undefined") {
            name += node2.raws.afterName;
        } else if (params) {
            name += " ";
        }
        if (node2.nodes) {
            this.block(node2, name + params);
        } else {
            var end = (node2.raws.between || "") + (semicolon ? ";" : "");
            this.builder(name + params + end, node2);
        }
    };
    _proto.beforeAfter = function beforeAfter(node2, detect) {
        var value;
        if (node2.type === "decl") {
            value = this.raw(node2, null, "beforeDecl");
        } else if (node2.type === "comment") {
            value = this.raw(node2, null, "beforeComment");
        } else if (detect === "before") {
            value = this.raw(node2, null, "beforeRule");
        } else {
            value = this.raw(node2, null, "beforeClose");
        }
        var buf = node2.parent;
        var depth = 0;
        while(buf && buf.type !== "root"){
            depth += 1;
            buf = buf.parent;
        }
        if (value.includes("\n")) {
            var indent = this.raw(node2, null, "indent");
            if (indent.length) {
                for(var step = 0; step < depth; step++)value += indent;
            }
        }
        return value;
    };
    _proto.block = function block(node2, start) {
        var between = this.raw(node2, "between", "beforeOpen");
        this.builder(start + between + "{", node2, "start");
        var after;
        if (node2.nodes && node2.nodes.length) {
            this.body(node2);
            after = this.raw(node2, "after");
        } else {
            after = this.raw(node2, "after", "emptyBody");
        }
        if (after) this.builder(after);
        this.builder("}", node2, "end");
    };
    _proto.body = function body(node2) {
        var last = node2.nodes.length - 1;
        while(last > 0){
            if (node2.nodes[last].type !== "comment") break;
            last -= 1;
        }
        var semicolon = this.raw(node2, "semicolon");
        for(var i2 = 0; i2 < node2.nodes.length; i2++){
            var child = node2.nodes[i2];
            var before = this.raw(child, "before");
            if (before) this.builder(before);
            this.stringify(child, last !== i2 || semicolon);
        }
    };
    _proto.comment = function comment(node2) {
        var left = this.raw(node2, "left", "commentLeft");
        var right = this.raw(node2, "right", "commentRight");
        this.builder("/*" + left + node2.text + right + "*/", node2);
    };
    _proto.decl = function decl(node2, semicolon) {
        var between = this.raw(node2, "between", "colon");
        var string = node2.prop + between + this.rawValue(node2, "value");
        if (node2.important) {
            string += node2.raws.important || " !important";
        }
        if (semicolon) string += ";";
        this.builder(string, node2);
    };
    _proto.document = function document1(node2) {
        this.body(node2);
    };
    _proto.raw = function raw(node2, own, detect) {
        var value;
        if (!detect) detect = own;
        if (own) {
            value = node2.raws[own];
            if (typeof value !== "undefined") return value;
        }
        var parent = node2.parent;
        if (detect === "before") {
            if (!parent || parent.type === "root" && parent.first === node2) {
                return "";
            }
            if (parent && parent.type === "document") {
                return "";
            }
        }
        if (!parent) return DEFAULT_RAW$1[detect];
        var root2 = node2.root();
        if (!root2.rawCache) root2.rawCache = {};
        if (typeof root2.rawCache[detect] !== "undefined") {
            return root2.rawCache[detect];
        }
        if (detect === "before" || detect === "after") {
            return this.beforeAfter(node2, detect);
        } else {
            var method = "raw" + capitalize$1(detect);
            if (this[method]) {
                value = this[method](root2, node2);
            } else {
                root2.walk(function(i2) {
                    value = i2.raws[own];
                    if (typeof value !== "undefined") return false;
                });
            }
        }
        if (typeof value === "undefined") value = DEFAULT_RAW$1[detect];
        root2.rawCache[detect] = value;
        return value;
    };
    _proto.rawBeforeClose = function rawBeforeClose(root2) {
        var value;
        root2.walk(function(i2) {
            if (i2.nodes && i2.nodes.length > 0) {
                if (typeof i2.raws.after !== "undefined") {
                    value = i2.raws.after;
                    if (value.includes("\n")) {
                        value = value.replace(/[^\n]+$/, "");
                    }
                    return false;
                }
            }
        });
        if (value) value = value.replace(/\S/g, "");
        return value;
    };
    _proto.rawBeforeComment = function rawBeforeComment(root2, node2) {
        var value;
        root2.walkComments(function(i2) {
            if (typeof i2.raws.before !== "undefined") {
                value = i2.raws.before;
                if (value.includes("\n")) {
                    value = value.replace(/[^\n]+$/, "");
                }
                return false;
            }
        });
        if (typeof value === "undefined") {
            value = this.raw(node2, null, "beforeDecl");
        } else if (value) {
            value = value.replace(/\S/g, "");
        }
        return value;
    };
    _proto.rawBeforeDecl = function rawBeforeDecl(root2, node2) {
        var value;
        root2.walkDecls(function(i2) {
            if (typeof i2.raws.before !== "undefined") {
                value = i2.raws.before;
                if (value.includes("\n")) {
                    value = value.replace(/[^\n]+$/, "");
                }
                return false;
            }
        });
        if (typeof value === "undefined") {
            value = this.raw(node2, null, "beforeRule");
        } else if (value) {
            value = value.replace(/\S/g, "");
        }
        return value;
    };
    _proto.rawBeforeOpen = function rawBeforeOpen(root2) {
        var value;
        root2.walk(function(i2) {
            if (i2.type !== "decl") {
                value = i2.raws.between;
                if (typeof value !== "undefined") return false;
            }
        });
        return value;
    };
    _proto.rawBeforeRule = function rawBeforeRule(root2) {
        var value;
        root2.walk(function(i2) {
            if (i2.nodes && (i2.parent !== root2 || root2.first !== i2)) {
                if (typeof i2.raws.before !== "undefined") {
                    value = i2.raws.before;
                    if (value.includes("\n")) {
                        value = value.replace(/[^\n]+$/, "");
                    }
                    return false;
                }
            }
        });
        if (value) value = value.replace(/\S/g, "");
        return value;
    };
    _proto.rawColon = function rawColon(root2) {
        var value;
        root2.walkDecls(function(i2) {
            if (typeof i2.raws.between !== "undefined") {
                value = i2.raws.between.replace(/[^\s:]/g, "");
                return false;
            }
        });
        return value;
    };
    _proto.rawEmptyBody = function rawEmptyBody(root2) {
        var value;
        root2.walk(function(i2) {
            if (i2.nodes && i2.nodes.length === 0) {
                value = i2.raws.after;
                if (typeof value !== "undefined") return false;
            }
        });
        return value;
    };
    _proto.rawIndent = function rawIndent(root2) {
        if (root2.raws.indent) return root2.raws.indent;
        var value;
        root2.walk(function(i2) {
            var p = i2.parent;
            if (p && p !== root2 && p.parent && p.parent === root2) {
                if (typeof i2.raws.before !== "undefined") {
                    var parts = i2.raws.before.split("\n");
                    value = parts[parts.length - 1];
                    value = value.replace(/\S/g, "");
                    return false;
                }
            }
        });
        return value;
    };
    _proto.rawSemicolon = function rawSemicolon(root2) {
        var value;
        root2.walk(function(i2) {
            if (i2.nodes && i2.nodes.length && i2.last.type === "decl") {
                value = i2.raws.semicolon;
                if (typeof value !== "undefined") return false;
            }
        });
        return value;
    };
    _proto.rawValue = function rawValue(node2, prop) {
        var value = node2[prop];
        var raw = node2.raws[prop];
        if (raw && raw.value === value) {
            return raw.raw;
        }
        return value;
    };
    _proto.root = function root(node2) {
        this.body(node2);
        if (node2.raws.after) this.builder(node2.raws.after);
    };
    _proto.rule = function rule(node2) {
        this.block(node2, this.rawValue(node2, "selector"));
        if (node2.raws.ownSemicolon) {
            this.builder(node2.raws.ownSemicolon, node2, "end");
        }
    };
    _proto.stringify = function stringify(node2, semicolon) {
        if (!this[node2.type]) {
            throw new Error("Unknown AST node type " + node2.type + ". Maybe you need to change PostCSS stringifier.");
        }
        this[node2.type](node2, semicolon);
    };
    return Stringifier;
}();
var stringifier$1 = Stringifier$2$1;
Stringifier$2$1.default = Stringifier$2$1;
var Stringifier$1$1 = stringifier$1;
function stringify$4$1(node2, builder) {
    var str = new Stringifier$1$1(builder);
    str.stringify(node2);
}
var stringify_1$1 = stringify$4$1;
stringify$4$1.default = stringify$4$1;
var isClean$2$1 = symbols$1.isClean, my$2$1 = symbols$1.my;
var CssSyntaxError$2$1 = cssSyntaxError$1;
var Stringifier2$1 = stringifier$1;
var stringify$3$1 = stringify_1$1;
function cloneNode$1(obj, parent) {
    var cloned = new obj.constructor();
    for(var i2 in obj){
        if (!Object.prototype.hasOwnProperty.call(obj, i2)) {
            continue;
        }
        if (i2 === "proxyCache") continue;
        var value = obj[i2];
        var type = typeof value === "undefined" ? "undefined" : _type_of(value);
        if (i2 === "parent" && type === "object") {
            if (parent) cloned[i2] = parent;
        } else if (i2 === "source") {
            cloned[i2] = value;
        } else if (Array.isArray(value)) {
            cloned[i2] = value.map(function(j) {
                return cloneNode$1(j, cloned);
            });
        } else {
            if (type === "object" && value !== null) value = cloneNode$1(value);
            cloned[i2] = value;
        }
    }
    return cloned;
}
var Node$4$1 = /*#__PURE__*/ function() {
    function Node2(defaults) {
        if (defaults === void 0) defaults = {};
        this.raws = {};
        this[isClean$2$1] = false;
        this[my$2$1] = true;
        for(var name in defaults){
            if (name === "nodes") {
                this.nodes = [];
                for(var _iterator = _create_for_of_iterator_helper_loose(defaults[name]), _step; !(_step = _iterator()).done;){
                    var node2 = _step.value;
                    if (typeof node2.clone === "function") {
                        this.append(node2.clone());
                    } else {
                        this.append(node2);
                    }
                }
            } else {
                this[name] = defaults[name];
            }
        }
    }
    var _proto = Node2.prototype;
    _proto.addToError = function addToError(error) {
        error.postcssNode = this;
        if (error.stack && this.source && /\n\s{4}at /.test(error.stack)) {
            var s2 = this.source;
            error.stack = error.stack.replace(/\n\s{4}at /, "$&" + s2.input.from + ":" + s2.start.line + ":" + s2.start.column + "$&");
        }
        return error;
    };
    _proto.after = function after(add) {
        this.parent.insertAfter(this, add);
        return this;
    };
    _proto.assign = function assign(overrides) {
        if (overrides === void 0) overrides = {};
        for(var name in overrides){
            this[name] = overrides[name];
        }
        return this;
    };
    _proto.before = function before(add) {
        this.parent.insertBefore(this, add);
        return this;
    };
    _proto.cleanRaws = function cleanRaws(keepBetween) {
        delete this.raws.before;
        delete this.raws.after;
        if (!keepBetween) delete this.raws.between;
    };
    _proto.clone = function clone(overrides) {
        if (overrides === void 0) overrides = {};
        var cloned = cloneNode$1(this);
        for(var name in overrides){
            cloned[name] = overrides[name];
        }
        return cloned;
    };
    _proto.cloneAfter = function cloneAfter(overrides) {
        if (overrides === void 0) overrides = {};
        var cloned = this.clone(overrides);
        this.parent.insertAfter(this, cloned);
        return cloned;
    };
    _proto.cloneBefore = function cloneBefore(overrides) {
        if (overrides === void 0) overrides = {};
        var cloned = this.clone(overrides);
        this.parent.insertBefore(this, cloned);
        return cloned;
    };
    _proto.error = function error(message, opts) {
        if (opts === void 0) opts = {};
        if (this.source) {
            var _this_rangeBy = this.rangeBy(opts), end = _this_rangeBy.end, start = _this_rangeBy.start;
            return this.source.input.error(message, {
                column: start.column,
                line: start.line
            }, {
                column: end.column,
                line: end.line
            }, opts);
        }
        return new CssSyntaxError$2$1(message);
    };
    _proto.getProxyProcessor = function getProxyProcessor() {
        return {
            get: function get(node2, prop) {
                if (prop === "proxyOf") {
                    return node2;
                } else if (prop === "root") {
                    return function() {
                        return node2.root().toProxy();
                    };
                } else {
                    return node2[prop];
                }
            },
            set: function set(node2, prop, value) {
                if (node2[prop] === value) return true;
                node2[prop] = value;
                if (prop === "prop" || prop === "value" || prop === "name" || prop === "params" || prop === "important" || /* c8 ignore next */ prop === "text") {
                    node2.markDirty();
                }
                return true;
            }
        };
    };
    _proto.markDirty = function markDirty() {
        if (this[isClean$2$1]) {
            this[isClean$2$1] = false;
            var next = this;
            while(next = next.parent){
                next[isClean$2$1] = false;
            }
        }
    };
    _proto.next = function next() {
        if (!this.parent) return void 0;
        var index2 = this.parent.index(this);
        return this.parent.nodes[index2 + 1];
    };
    _proto.positionBy = function positionBy(opts, stringRepresentation) {
        var pos = this.source.start;
        if (opts.index) {
            pos = this.positionInside(opts.index, stringRepresentation);
        } else if (opts.word) {
            stringRepresentation = this.toString();
            var index2 = stringRepresentation.indexOf(opts.word);
            if (index2 !== -1) pos = this.positionInside(index2, stringRepresentation);
        }
        return pos;
    };
    _proto.positionInside = function positionInside(index2, stringRepresentation) {
        var string = stringRepresentation || this.toString();
        var column = this.source.start.column;
        var line = this.source.start.line;
        for(var i2 = 0; i2 < index2; i2++){
            if (string[i2] === "\n") {
                column = 1;
                line += 1;
            } else {
                column += 1;
            }
        }
        return {
            column: column,
            line: line
        };
    };
    _proto.prev = function prev() {
        if (!this.parent) return void 0;
        var index2 = this.parent.index(this);
        return this.parent.nodes[index2 - 1];
    };
    _proto.rangeBy = function rangeBy(opts) {
        var start = {
            column: this.source.start.column,
            line: this.source.start.line
        };
        var end = this.source.end ? {
            column: this.source.end.column + 1,
            line: this.source.end.line
        } : {
            column: start.column + 1,
            line: start.line
        };
        if (opts.word) {
            var stringRepresentation = this.toString();
            var index2 = stringRepresentation.indexOf(opts.word);
            if (index2 !== -1) {
                start = this.positionInside(index2, stringRepresentation);
                end = this.positionInside(index2 + opts.word.length, stringRepresentation);
            }
        } else {
            if (opts.start) {
                start = {
                    column: opts.start.column,
                    line: opts.start.line
                };
            } else if (opts.index) {
                start = this.positionInside(opts.index);
            }
            if (opts.end) {
                end = {
                    column: opts.end.column,
                    line: opts.end.line
                };
            } else if (typeof opts.endIndex === "number") {
                end = this.positionInside(opts.endIndex);
            } else if (opts.index) {
                end = this.positionInside(opts.index + 1);
            }
        }
        if (end.line < start.line || end.line === start.line && end.column <= start.column) {
            end = {
                column: start.column + 1,
                line: start.line
            };
        }
        return {
            end: end,
            start: start
        };
    };
    _proto.raw = function raw(prop, defaultType) {
        var str = new Stringifier2$1();
        return str.raw(this, prop, defaultType);
    };
    _proto.remove = function remove() {
        if (this.parent) {
            this.parent.removeChild(this);
        }
        this.parent = void 0;
        return this;
    };
    _proto.replaceWith = function replaceWith() {
        for(var _len = arguments.length, nodes = new Array(_len), _key = 0; _key < _len; _key++){
            nodes[_key] = arguments[_key];
        }
        if (this.parent) {
            var bookmark = this;
            var foundSelf = false;
            for(var _iterator = _create_for_of_iterator_helper_loose(nodes), _step; !(_step = _iterator()).done;){
                var node2 = _step.value;
                if (node2 === this) {
                    foundSelf = true;
                } else if (foundSelf) {
                    this.parent.insertAfter(bookmark, node2);
                    bookmark = node2;
                } else {
                    this.parent.insertBefore(bookmark, node2);
                }
            }
            if (!foundSelf) {
                this.remove();
            }
        }
        return this;
    };
    _proto.root = function root() {
        var result2 = this;
        while(result2.parent && result2.parent.type !== "document"){
            result2 = result2.parent;
        }
        return result2;
    };
    _proto.toJSON = function toJSON(_, inputs) {
        var fixed = {};
        var emitInputs = inputs == null;
        inputs = inputs || /* @__PURE__ */ new Map();
        var inputsNextIndex = 0;
        for(var name in this){
            if (!Object.prototype.hasOwnProperty.call(this, name)) {
                continue;
            }
            if (name === "parent" || name === "proxyCache") continue;
            var value = this[name];
            if (Array.isArray(value)) {
                fixed[name] = value.map(function(i2) {
                    if ((typeof i2 === "undefined" ? "undefined" : _type_of(i2)) === "object" && i2.toJSON) {
                        return i2.toJSON(null, inputs);
                    } else {
                        return i2;
                    }
                });
            } else if ((typeof value === "undefined" ? "undefined" : _type_of(value)) === "object" && value.toJSON) {
                fixed[name] = value.toJSON(null, inputs);
            } else if (name === "source") {
                var inputId = inputs.get(value.input);
                if (inputId == null) {
                    inputId = inputsNextIndex;
                    inputs.set(value.input, inputsNextIndex);
                    inputsNextIndex++;
                }
                fixed[name] = {
                    end: value.end,
                    inputId: inputId,
                    start: value.start
                };
            } else {
                fixed[name] = value;
            }
        }
        if (emitInputs) {
            fixed.inputs = [].concat(inputs.keys()).map(function(input2) {
                return input2.toJSON();
            });
        }
        return fixed;
    };
    _proto.toProxy = function toProxy() {
        if (!this.proxyCache) {
            this.proxyCache = new Proxy(this, this.getProxyProcessor());
        }
        return this.proxyCache;
    };
    _proto.toString = function toString(stringifier2) {
        if (stringifier2 === void 0) stringifier2 = stringify$3$1;
        if (stringifier2.stringify) stringifier2 = stringifier2.stringify;
        var result2 = "";
        stringifier2(this, function(i2) {
            result2 += i2;
        });
        return result2;
    };
    _proto.warn = function warn(result2, text, opts) {
        var data = {
            node: this
        };
        for(var i2 in opts)data[i2] = opts[i2];
        return result2.warn(text, data);
    };
    _create_class(Node2, [
        {
            key: "proxyOf",
            get: function get() {
                return this;
            }
        }
    ]);
    return Node2;
}();
var node$1 = Node$4$1;
Node$4$1.default = Node$4$1;
var Node$3$1 = node$1;
var Declaration$4$1 = /*#__PURE__*/ function(Node$3$1) {
    _inherits(Declaration, Node$3$1);
    function Declaration(defaults) {
        var _this;
        if (defaults && typeof defaults.value !== "undefined" && typeof defaults.value !== "string") {
            defaults = _extends({}, defaults, {
                value: String(defaults.value)
            });
        }
        _this = Node$3$1.call(this, defaults) || this;
        _this.type = "decl";
        return _this;
    }
    _create_class(Declaration, [
        {
            key: "variable",
            get: function get() {
                return this.prop.startsWith("--") || this.prop[0] === "$";
            }
        }
    ]);
    return Declaration;
}(Node$3$1);
var declaration$1 = Declaration$4$1;
Declaration$4$1.default = Declaration$4$1;
var urlAlphabet$1 = "useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict";
var nanoid$1$1 = function(size) {
    if (size === void 0) size = 21;
    var id = "";
    var i2 = size;
    while(i2--){
        id += urlAlphabet$1[Math.random() * 64 | 0];
    }
    return id;
};
var nonSecure$1 = {
    nanoid: nanoid$1$1
};
var SourceMapConsumer$2$1 = require$$2$1.SourceMapConsumer, SourceMapGenerator$2$1 = require$$2$1.SourceMapGenerator;
var existsSync$1 = require$$2$1.existsSync, readFileSync$1 = require$$2$1.readFileSync;
var dirname$1$1 = require$$2$1.dirname, join$1 = require$$2$1.join;
function fromBase64$1(str) {
    if (Buffer) {
        return Buffer.from(str, "base64").toString();
    } else {
        return window.atob(str);
    }
}
var PreviousMap$2$1 = /*#__PURE__*/ function() {
    function PreviousMap(css, opts) {
        if (opts.map === false) return;
        this.loadAnnotation(css);
        this.inline = this.startWith(this.annotation, "data:");
        var prev = opts.map ? opts.map.prev : void 0;
        var text = this.loadMap(opts.from, prev);
        if (!this.mapFile && opts.from) {
            this.mapFile = opts.from;
        }
        if (this.mapFile) this.root = dirname$1$1(this.mapFile);
        if (text) this.text = text;
    }
    var _proto = PreviousMap.prototype;
    _proto.consumer = function consumer() {
        if (!this.consumerCache) {
            this.consumerCache = new SourceMapConsumer$2$1(this.text);
        }
        return this.consumerCache;
    };
    _proto.decodeInline = function decodeInline(text) {
        var baseCharsetUri = /^data:application\/json;charset=utf-?8;base64,/;
        var baseUri = /^data:application\/json;base64,/;
        var charsetUri = /^data:application\/json;charset=utf-?8,/;
        var uri = /^data:application\/json,/;
        if (charsetUri.test(text) || uri.test(text)) {
            return decodeURIComponent(text.substr(RegExp.lastMatch.length));
        }
        if (baseCharsetUri.test(text) || baseUri.test(text)) {
            return fromBase64$1(text.substr(RegExp.lastMatch.length));
        }
        var encoding = text.match(/data:application\/json;([^,]+),/)[1];
        throw new Error("Unsupported source map encoding " + encoding);
    };
    _proto.getAnnotationURL = function getAnnotationURL(sourceMapString) {
        return sourceMapString.replace(/^\/\*\s*# sourceMappingURL=/, "").trim();
    };
    _proto.isMap = function isMap(map) {
        if ((typeof map === "undefined" ? "undefined" : _type_of(map)) !== "object") return false;
        return typeof map.mappings === "string" || typeof map._mappings === "string" || Array.isArray(map.sections);
    };
    _proto.loadAnnotation = function loadAnnotation(css) {
        var comments = css.match(/\/\*\s*# sourceMappingURL=/gm);
        if (!comments) return;
        var start = css.lastIndexOf(comments.pop());
        var end = css.indexOf("*/", start);
        if (start > -1 && end > -1) {
            this.annotation = this.getAnnotationURL(css.substring(start, end));
        }
    };
    _proto.loadFile = function loadFile(path) {
        this.root = dirname$1$1(path);
        if (existsSync$1(path)) {
            this.mapFile = path;
            return readFileSync$1(path, "utf-8").toString().trim();
        }
    };
    _proto.loadMap = function loadMap(file, prev) {
        if (prev === false) return false;
        if (prev) {
            if (typeof prev === "string") {
                return prev;
            } else if (typeof prev === "function") {
                var prevPath = prev(file);
                if (prevPath) {
                    var map = this.loadFile(prevPath);
                    if (!map) {
                        throw new Error("Unable to load previous source map: " + prevPath.toString());
                    }
                    return map;
                }
            } else if (_instanceof(prev, SourceMapConsumer$2$1)) {
                return SourceMapGenerator$2$1.fromSourceMap(prev).toString();
            } else if (_instanceof(prev, SourceMapGenerator$2$1)) {
                return prev.toString();
            } else if (this.isMap(prev)) {
                return JSON.stringify(prev);
            } else {
                throw new Error("Unsupported previous source map format: " + prev.toString());
            }
        } else if (this.inline) {
            return this.decodeInline(this.annotation);
        } else if (this.annotation) {
            var map1 = this.annotation;
            if (file) map1 = join$1(dirname$1$1(file), map1);
            return this.loadFile(map1);
        }
    };
    _proto.startWith = function startWith(string, start) {
        if (!string) return false;
        return string.substr(0, start.length) === start;
    };
    _proto.withContent = function withContent() {
        return !!(this.consumer().sourcesContent && this.consumer().sourcesContent.length > 0);
    };
    return PreviousMap;
}();
var previousMap$1 = PreviousMap$2$1;
PreviousMap$2$1.default = PreviousMap$2$1;
var SourceMapConsumer$1$1 = require$$2$1.SourceMapConsumer, SourceMapGenerator$1$1 = require$$2$1.SourceMapGenerator;
var fileURLToPath$1 = require$$2$1.fileURLToPath, pathToFileURL$1$1 = require$$2$1.pathToFileURL;
var isAbsolute$1 = require$$2$1.isAbsolute, resolve$1$1 = require$$2$1.resolve;
var nanoid$2 = nonSecure$1.nanoid;
var terminalHighlight$2 = require$$2$1;
var CssSyntaxError$1$1 = cssSyntaxError$1;
var PreviousMap$1$1 = previousMap$1;
var fromOffsetCache$1 = Symbol("fromOffsetCache");
var sourceMapAvailable$1$1 = Boolean(SourceMapConsumer$1$1 && SourceMapGenerator$1$1);
var pathAvailable$1$1 = Boolean(resolve$1$1 && isAbsolute$1);
var Input$4$1 = /*#__PURE__*/ function() {
    function Input(css, opts) {
        if (opts === void 0) opts = {};
        if (css === null || typeof css === "undefined" || (typeof css === "undefined" ? "undefined" : _type_of(css)) === "object" && !css.toString) {
            throw new Error("PostCSS received " + css + " instead of CSS string");
        }
        this.css = css.toString();
        if (this.css[0] === "\uFEFF" || this.css[0] === "￾") {
            this.hasBOM = true;
            this.css = this.css.slice(1);
        } else {
            this.hasBOM = false;
        }
        if (opts.from) {
            if (!pathAvailable$1$1 || /^\w+:\/\//.test(opts.from) || isAbsolute$1(opts.from)) {
                this.file = opts.from;
            } else {
                this.file = resolve$1$1(opts.from);
            }
        }
        if (pathAvailable$1$1 && sourceMapAvailable$1$1) {
            var map = new PreviousMap$1$1(this.css, opts);
            if (map.text) {
                this.map = map;
                var file = map.consumer().file;
                if (!this.file && file) this.file = this.mapResolve(file);
            }
        }
        if (!this.file) {
            this.id = "<input css " + nanoid$2(6) + ">";
        }
        if (this.map) this.map.file = this.from;
    }
    var _proto = Input.prototype;
    _proto.error = function error(message, line, column, opts) {
        if (opts === void 0) opts = {};
        var result2, endLine, endColumn;
        if (line && (typeof line === "undefined" ? "undefined" : _type_of(line)) === "object") {
            var start = line;
            var end = column;
            if (typeof start.offset === "number") {
                var pos = this.fromOffset(start.offset);
                line = pos.line;
                column = pos.col;
            } else {
                line = start.line;
                column = start.column;
            }
            if (typeof end.offset === "number") {
                var pos1 = this.fromOffset(end.offset);
                endLine = pos1.line;
                endColumn = pos1.col;
            } else {
                endLine = end.line;
                endColumn = end.column;
            }
        } else if (!column) {
            var pos2 = this.fromOffset(line);
            line = pos2.line;
            column = pos2.col;
        }
        var origin = this.origin(line, column, endLine, endColumn);
        if (origin) {
            result2 = new CssSyntaxError$1$1(message, origin.endLine === void 0 ? origin.line : {
                column: origin.column,
                line: origin.line
            }, origin.endLine === void 0 ? origin.column : {
                column: origin.endColumn,
                line: origin.endLine
            }, origin.source, origin.file, opts.plugin);
        } else {
            result2 = new CssSyntaxError$1$1(message, endLine === void 0 ? line : {
                column: column,
                line: line
            }, endLine === void 0 ? column : {
                column: endColumn,
                line: endLine
            }, this.css, this.file, opts.plugin);
        }
        result2.input = {
            column: column,
            endColumn: endColumn,
            endLine: endLine,
            line: line,
            source: this.css
        };
        if (this.file) {
            if (pathToFileURL$1$1) {
                result2.input.url = pathToFileURL$1$1(this.file).toString();
            }
            result2.input.file = this.file;
        }
        return result2;
    };
    _proto.fromOffset = function fromOffset(offset) {
        var lastLine, lineToIndex;
        if (!this[fromOffsetCache$1]) {
            var lines = this.css.split("\n");
            lineToIndex = new Array(lines.length);
            var prevIndex = 0;
            for(var i2 = 0, l2 = lines.length; i2 < l2; i2++){
                lineToIndex[i2] = prevIndex;
                prevIndex += lines[i2].length + 1;
            }
            this[fromOffsetCache$1] = lineToIndex;
        } else {
            lineToIndex = this[fromOffsetCache$1];
        }
        lastLine = lineToIndex[lineToIndex.length - 1];
        var min = 0;
        if (offset >= lastLine) {
            min = lineToIndex.length - 1;
        } else {
            var max = lineToIndex.length - 2;
            var mid;
            while(min < max){
                mid = min + (max - min >> 1);
                if (offset < lineToIndex[mid]) {
                    max = mid - 1;
                } else if (offset >= lineToIndex[mid + 1]) {
                    min = mid + 1;
                } else {
                    min = mid;
                    break;
                }
            }
        }
        return {
            col: offset - lineToIndex[min] + 1,
            line: min + 1
        };
    };
    _proto.mapResolve = function mapResolve(file) {
        if (/^\w+:\/\//.test(file)) {
            return file;
        }
        return resolve$1$1(this.map.consumer().sourceRoot || this.map.root || ".", file);
    };
    _proto.origin = function origin(line, column, endLine, endColumn) {
        if (!this.map) return false;
        var consumer = this.map.consumer();
        var from = consumer.originalPositionFor({
            column: column,
            line: line
        });
        if (!from.source) return false;
        var to;
        if (typeof endLine === "number") {
            to = consumer.originalPositionFor({
                column: endColumn,
                line: endLine
            });
        }
        var fromUrl;
        if (isAbsolute$1(from.source)) {
            fromUrl = pathToFileURL$1$1(from.source);
        } else {
            fromUrl = new URL(from.source, this.map.consumer().sourceRoot || pathToFileURL$1$1(this.map.mapFile));
        }
        var result2 = {
            column: from.column,
            endColumn: to && to.column,
            endLine: to && to.line,
            line: from.line,
            url: fromUrl.toString()
        };
        if (fromUrl.protocol === "file:") {
            if (fileURLToPath$1) {
                result2.file = fileURLToPath$1(fromUrl);
            } else {
                throw new Error("file: protocol is not available in this PostCSS build");
            }
        }
        var source = consumer.sourceContentFor(from.source);
        if (source) result2.source = source;
        return result2;
    };
    _proto.toJSON = function toJSON() {
        var json = {};
        for(var _i = 0, _iter = [
            "hasBOM",
            "css",
            "file",
            "id"
        ]; _i < _iter.length; _i++){
            var name = _iter[_i];
            if (this[name] != null) {
                json[name] = this[name];
            }
        }
        if (this.map) {
            json.map = _extends({}, this.map);
            if (json.map.consumerCache) {
                json.map.consumerCache = void 0;
            }
        }
        return json;
    };
    _create_class(Input, [
        {
            key: "from",
            get: function get() {
                return this.file || this.id;
            }
        }
    ]);
    return Input;
}();
var input$1 = Input$4$1;
Input$4$1.default = Input$4$1;
if (terminalHighlight$2 && terminalHighlight$2.registerInput) {
    terminalHighlight$2.registerInput(Input$4$1);
}
var SourceMapConsumer$3 = require$$2$1.SourceMapConsumer, SourceMapGenerator$3 = require$$2$1.SourceMapGenerator;
var dirname$2 = require$$2$1.dirname, relative$1 = require$$2$1.relative, resolve$2 = require$$2$1.resolve, sep$1 = require$$2$1.sep;
var pathToFileURL$2 = require$$2$1.pathToFileURL;
var Input$3$1 = input$1;
var sourceMapAvailable$2 = Boolean(SourceMapConsumer$3 && SourceMapGenerator$3);
var pathAvailable$2 = Boolean(dirname$2 && resolve$2 && relative$1 && sep$1);
var MapGenerator$2$1 = /*#__PURE__*/ function() {
    function MapGenerator(stringify2, root2, opts, cssString) {
        this.stringify = stringify2;
        this.mapOpts = opts.map || {};
        this.root = root2;
        this.opts = opts;
        this.css = cssString;
        this.originalCSS = cssString;
        this.usesFileUrls = !this.mapOpts.from && this.mapOpts.absolute;
        this.memoizedFileURLs = /* @__PURE__ */ new Map();
        this.memoizedPaths = /* @__PURE__ */ new Map();
        this.memoizedURLs = /* @__PURE__ */ new Map();
    }
    var _proto = MapGenerator.prototype;
    _proto.addAnnotation = function addAnnotation() {
        var content;
        if (this.isInline()) {
            content = "data:application/json;base64," + this.toBase64(this.map.toString());
        } else if (typeof this.mapOpts.annotation === "string") {
            content = this.mapOpts.annotation;
        } else if (typeof this.mapOpts.annotation === "function") {
            content = this.mapOpts.annotation(this.opts.to, this.root);
        } else {
            content = this.outputFile() + ".map";
        }
        var eol = "\n";
        if (this.css.includes("\r\n")) eol = "\r\n";
        this.css += eol + "/*# sourceMappingURL=" + content + " */";
    };
    _proto.applyPrevMaps = function applyPrevMaps() {
        for(var _iterator = _create_for_of_iterator_helper_loose(this.previous()), _step; !(_step = _iterator()).done;){
            var prev = _step.value;
            var from = this.toUrl(this.path(prev.file));
            var root2 = prev.root || dirname$2(prev.file);
            var map = void 0;
            if (this.mapOpts.sourcesContent === false) {
                map = new SourceMapConsumer$3(prev.text);
                if (map.sourcesContent) {
                    map.sourcesContent = null;
                }
            } else {
                map = prev.consumer();
            }
            this.map.applySourceMap(map, from, this.toUrl(this.path(root2)));
        }
    };
    _proto.clearAnnotation = function clearAnnotation() {
        if (this.mapOpts.annotation === false) return;
        if (this.root) {
            var node2;
            for(var i2 = this.root.nodes.length - 1; i2 >= 0; i2--){
                node2 = this.root.nodes[i2];
                if (node2.type !== "comment") continue;
                if (node2.text.indexOf("# sourceMappingURL=") === 0) {
                    this.root.removeChild(i2);
                }
            }
        } else if (this.css) {
            this.css = this.css.replace(/\n*?\/\*#[\S\s]*?\*\/$/gm, "");
        }
    };
    _proto.generate = function generate() {
        this.clearAnnotation();
        if (pathAvailable$2 && sourceMapAvailable$2 && this.isMap()) {
            return this.generateMap();
        } else {
            var result2 = "";
            this.stringify(this.root, function(i2) {
                result2 += i2;
            });
            return [
                result2
            ];
        }
    };
    _proto.generateMap = function generateMap() {
        if (this.root) {
            this.generateString();
        } else if (this.previous().length === 1) {
            var prev = this.previous()[0].consumer();
            prev.file = this.outputFile();
            this.map = SourceMapGenerator$3.fromSourceMap(prev, {
                ignoreInvalidMapping: true
            });
        } else {
            this.map = new SourceMapGenerator$3({
                file: this.outputFile(),
                ignoreInvalidMapping: true
            });
            this.map.addMapping({
                generated: {
                    column: 0,
                    line: 1
                },
                original: {
                    column: 0,
                    line: 1
                },
                source: this.opts.from ? this.toUrl(this.path(this.opts.from)) : "<no source>"
            });
        }
        if (this.isSourcesContent()) this.setSourcesContent();
        if (this.root && this.previous().length > 0) this.applyPrevMaps();
        if (this.isAnnotation()) this.addAnnotation();
        if (this.isInline()) {
            return [
                this.css
            ];
        } else {
            return [
                this.css,
                this.map
            ];
        }
    };
    _proto.generateString = function generateString() {
        var _this = this;
        this.css = "";
        this.map = new SourceMapGenerator$3({
            file: this.outputFile(),
            ignoreInvalidMapping: true
        });
        var line = 1;
        var column = 1;
        var noSource = "<no source>";
        var mapping = {
            generated: {
                column: 0,
                line: 0
            },
            original: {
                column: 0,
                line: 0
            },
            source: ""
        };
        var lines, last;
        this.stringify(this.root, function(str, node2, type) {
            _this.css += str;
            if (node2 && type !== "end") {
                mapping.generated.line = line;
                mapping.generated.column = column - 1;
                if (node2.source && node2.source.start) {
                    mapping.source = _this.sourcePath(node2);
                    mapping.original.line = node2.source.start.line;
                    mapping.original.column = node2.source.start.column - 1;
                    _this.map.addMapping(mapping);
                } else {
                    mapping.source = noSource;
                    mapping.original.line = 1;
                    mapping.original.column = 0;
                    _this.map.addMapping(mapping);
                }
            }
            lines = str.match(/\n/g);
            if (lines) {
                line += lines.length;
                last = str.lastIndexOf("\n");
                column = str.length - last;
            } else {
                column += str.length;
            }
            if (node2 && type !== "start") {
                var p = node2.parent || {
                    raws: {}
                };
                var childless = node2.type === "decl" || node2.type === "atrule" && !node2.nodes;
                if (!childless || node2 !== p.last || p.raws.semicolon) {
                    if (node2.source && node2.source.end) {
                        mapping.source = _this.sourcePath(node2);
                        mapping.original.line = node2.source.end.line;
                        mapping.original.column = node2.source.end.column - 1;
                        mapping.generated.line = line;
                        mapping.generated.column = column - 2;
                        _this.map.addMapping(mapping);
                    } else {
                        mapping.source = noSource;
                        mapping.original.line = 1;
                        mapping.original.column = 0;
                        mapping.generated.line = line;
                        mapping.generated.column = column - 1;
                        _this.map.addMapping(mapping);
                    }
                }
            }
        });
    };
    _proto.isAnnotation = function isAnnotation() {
        if (this.isInline()) {
            return true;
        }
        if (typeof this.mapOpts.annotation !== "undefined") {
            return this.mapOpts.annotation;
        }
        if (this.previous().length) {
            return this.previous().some(function(i2) {
                return i2.annotation;
            });
        }
        return true;
    };
    _proto.isInline = function isInline() {
        if (typeof this.mapOpts.inline !== "undefined") {
            return this.mapOpts.inline;
        }
        var annotation = this.mapOpts.annotation;
        if (typeof annotation !== "undefined" && annotation !== true) {
            return false;
        }
        if (this.previous().length) {
            return this.previous().some(function(i2) {
                return i2.inline;
            });
        }
        return true;
    };
    _proto.isMap = function isMap() {
        if (typeof this.opts.map !== "undefined") {
            return !!this.opts.map;
        }
        return this.previous().length > 0;
    };
    _proto.isSourcesContent = function isSourcesContent() {
        if (typeof this.mapOpts.sourcesContent !== "undefined") {
            return this.mapOpts.sourcesContent;
        }
        if (this.previous().length) {
            return this.previous().some(function(i2) {
                return i2.withContent();
            });
        }
        return true;
    };
    _proto.outputFile = function outputFile() {
        if (this.opts.to) {
            return this.path(this.opts.to);
        } else if (this.opts.from) {
            return this.path(this.opts.from);
        } else {
            return "to.css";
        }
    };
    _proto.path = function path(file) {
        if (this.mapOpts.absolute) return file;
        if (file.charCodeAt(0) === 60) return file;
        if (/^\w+:\/\//.test(file)) return file;
        var cached = this.memoizedPaths.get(file);
        if (cached) return cached;
        var from = this.opts.to ? dirname$2(this.opts.to) : ".";
        if (typeof this.mapOpts.annotation === "string") {
            from = dirname$2(resolve$2(from, this.mapOpts.annotation));
        }
        var path = relative$1(from, file);
        this.memoizedPaths.set(file, path);
        return path;
    };
    _proto.previous = function previous() {
        var _this = this;
        if (!this.previousMaps) {
            this.previousMaps = [];
            if (this.root) {
                this.root.walk(function(node2) {
                    if (node2.source && node2.source.input.map) {
                        var map = node2.source.input.map;
                        if (!_this.previousMaps.includes(map)) {
                            _this.previousMaps.push(map);
                        }
                    }
                });
            } else {
                var input2 = new Input$3$1(this.originalCSS, this.opts);
                if (input2.map) this.previousMaps.push(input2.map);
            }
        }
        return this.previousMaps;
    };
    _proto.setSourcesContent = function setSourcesContent() {
        var _this = this;
        var already = {};
        if (this.root) {
            this.root.walk(function(node2) {
                if (node2.source) {
                    var from = node2.source.input.from;
                    if (from && !already[from]) {
                        already[from] = true;
                        var fromUrl = _this.usesFileUrls ? _this.toFileUrl(from) : _this.toUrl(_this.path(from));
                        _this.map.setSourceContent(fromUrl, node2.source.input.css);
                    }
                }
            });
        } else if (this.css) {
            var from = this.opts.from ? this.toUrl(this.path(this.opts.from)) : "<no source>";
            this.map.setSourceContent(from, this.css);
        }
    };
    _proto.sourcePath = function sourcePath(node2) {
        if (this.mapOpts.from) {
            return this.toUrl(this.mapOpts.from);
        } else if (this.usesFileUrls) {
            return this.toFileUrl(node2.source.input.from);
        } else {
            return this.toUrl(this.path(node2.source.input.from));
        }
    };
    _proto.toBase64 = function toBase64(str) {
        if (Buffer) {
            return Buffer.from(str).toString("base64");
        } else {
            return window.btoa(unescape(encodeURIComponent(str)));
        }
    };
    _proto.toFileUrl = function toFileUrl(path) {
        var cached = this.memoizedFileURLs.get(path);
        if (cached) return cached;
        if (pathToFileURL$2) {
            var fileURL = pathToFileURL$2(path).toString();
            this.memoizedFileURLs.set(path, fileURL);
            return fileURL;
        } else {
            throw new Error("`map.absolute` option is not available in this PostCSS build");
        }
    };
    _proto.toUrl = function toUrl(path) {
        var cached = this.memoizedURLs.get(path);
        if (cached) return cached;
        if (sep$1 === "\\") {
            path = path.replace(/\\/g, "/");
        }
        var url = encodeURI(path).replace(/[#?]/g, encodeURIComponent);
        this.memoizedURLs.set(path, url);
        return url;
    };
    return MapGenerator;
}();
var mapGenerator$1 = MapGenerator$2$1;
var Node$2$1 = node$1;
var Comment$4$1 = /*#__PURE__*/ function(Node$2$1) {
    _inherits(Comment, Node$2$1);
    function Comment(defaults) {
        var _this;
        _this = Node$2$1.call(this, defaults) || this;
        _this.type = "comment";
        return _this;
    }
    return Comment;
}(Node$2$1);
var comment$1 = Comment$4$1;
Comment$4$1.default = Comment$4$1;
var isClean$1$1 = symbols$1.isClean, my$1$1 = symbols$1.my;
var Declaration$3$1 = declaration$1;
var Comment$3$1 = comment$1;
var Node$1$1 = node$1;
var parse$4$1, Rule$4$1, AtRule$4$1, Root$6$1;
function cleanSource$1(nodes) {
    return nodes.map(function(i2) {
        if (i2.nodes) i2.nodes = cleanSource$1(i2.nodes);
        delete i2.source;
        return i2;
    });
}
function markDirtyUp$1(node2) {
    node2[isClean$1$1] = false;
    if (node2.proxyOf.nodes) {
        for(var _iterator = _create_for_of_iterator_helper_loose(node2.proxyOf.nodes), _step; !(_step = _iterator()).done;){
            var i2 = _step.value;
            markDirtyUp$1(i2);
        }
    }
}
var Container$7$1 = /*#__PURE__*/ function(Node$1$1) {
    _inherits(Container, Node$1$1);
    function Container() {
        return Node$1$1.apply(this, arguments) || this;
    }
    var _proto = Container.prototype;
    _proto.append = function append() {
        for(var _len = arguments.length, children = new Array(_len), _key = 0; _key < _len; _key++){
            children[_key] = arguments[_key];
        }
        for(var _iterator = _create_for_of_iterator_helper_loose(children), _step; !(_step = _iterator()).done;){
            var child = _step.value;
            var nodes = this.normalize(child, this.last);
            for(var _iterator1 = _create_for_of_iterator_helper_loose(nodes), _step1; !(_step1 = _iterator1()).done;){
                var node2 = _step1.value;
                this.proxyOf.nodes.push(node2);
            }
        }
        this.markDirty();
        return this;
    };
    _proto.cleanRaws = function cleanRaws(keepBetween) {
        Node$1$1.prototype.cleanRaws.call(this, keepBetween);
        if (this.nodes) {
            for(var _iterator = _create_for_of_iterator_helper_loose(this.nodes), _step; !(_step = _iterator()).done;){
                var node2 = _step.value;
                node2.cleanRaws(keepBetween);
            }
        }
    };
    _proto.each = function each(callback) {
        if (!this.proxyOf.nodes) return void 0;
        var iterator = this.getIterator();
        var index2, result2;
        while(this.indexes[iterator] < this.proxyOf.nodes.length){
            index2 = this.indexes[iterator];
            result2 = callback(this.proxyOf.nodes[index2], index2);
            if (result2 === false) break;
            this.indexes[iterator] += 1;
        }
        delete this.indexes[iterator];
        return result2;
    };
    _proto.every = function every(condition) {
        return this.nodes.every(condition);
    };
    _proto.getIterator = function getIterator() {
        if (!this.lastEach) this.lastEach = 0;
        if (!this.indexes) this.indexes = {};
        this.lastEach += 1;
        var iterator = this.lastEach;
        this.indexes[iterator] = 0;
        return iterator;
    };
    _proto.getProxyProcessor = function getProxyProcessor() {
        return {
            get: function get(node2, prop) {
                if (prop === "proxyOf") {
                    return node2;
                } else if (!node2[prop]) {
                    return node2[prop];
                } else if (prop === "each" || typeof prop === "string" && prop.startsWith("walk")) {
                    return function() {
                        for(var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++){
                            args[_key] = arguments[_key];
                        }
                        var _node2;
                        return (_node2 = node2)[prop].apply(_node2, [].concat(args.map(function(i2) {
                            if (typeof i2 === "function") {
                                return function(child, index2) {
                                    return i2(child.toProxy(), index2);
                                };
                            } else {
                                return i2;
                            }
                        })));
                    };
                } else if (prop === "every" || prop === "some") {
                    return function(cb) {
                        return node2[prop](function(child) {
                            for(var _len = arguments.length, other = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++){
                                other[_key - 1] = arguments[_key];
                            }
                            return cb.apply(void 0, [].concat([
                                child.toProxy()
                            ], other));
                        });
                    };
                } else if (prop === "root") {
                    return function() {
                        return node2.root().toProxy();
                    };
                } else if (prop === "nodes") {
                    return node2.nodes.map(function(i2) {
                        return i2.toProxy();
                    });
                } else if (prop === "first" || prop === "last") {
                    return node2[prop].toProxy();
                } else {
                    return node2[prop];
                }
            },
            set: function set(node2, prop, value) {
                if (node2[prop] === value) return true;
                node2[prop] = value;
                if (prop === "name" || prop === "params" || prop === "selector") {
                    node2.markDirty();
                }
                return true;
            }
        };
    };
    _proto.index = function index(child) {
        if (typeof child === "number") return child;
        if (child.proxyOf) child = child.proxyOf;
        return this.proxyOf.nodes.indexOf(child);
    };
    _proto.insertAfter = function insertAfter(exist, add) {
        var existIndex = this.index(exist);
        var nodes = this.normalize(add, this.proxyOf.nodes[existIndex]).reverse();
        existIndex = this.index(exist);
        for(var _iterator = _create_for_of_iterator_helper_loose(nodes), _step; !(_step = _iterator()).done;){
            var node2 = _step.value;
            this.proxyOf.nodes.splice(existIndex + 1, 0, node2);
        }
        var index2;
        for(var id in this.indexes){
            index2 = this.indexes[id];
            if (existIndex < index2) {
                this.indexes[id] = index2 + nodes.length;
            }
        }
        this.markDirty();
        return this;
    };
    _proto.insertBefore = function insertBefore(exist, add) {
        var existIndex = this.index(exist);
        var type = existIndex === 0 ? "prepend" : false;
        var nodes = this.normalize(add, this.proxyOf.nodes[existIndex], type).reverse();
        existIndex = this.index(exist);
        for(var _iterator = _create_for_of_iterator_helper_loose(nodes), _step; !(_step = _iterator()).done;){
            var node2 = _step.value;
            this.proxyOf.nodes.splice(existIndex, 0, node2);
        }
        var index2;
        for(var id in this.indexes){
            index2 = this.indexes[id];
            if (existIndex <= index2) {
                this.indexes[id] = index2 + nodes.length;
            }
        }
        this.markDirty();
        return this;
    };
    _proto.normalize = function normalize(nodes, sample) {
        var _this = this;
        if (typeof nodes === "string") {
            nodes = cleanSource$1(parse$4$1(nodes).nodes);
        } else if (typeof nodes === "undefined") {
            nodes = [];
        } else if (Array.isArray(nodes)) {
            nodes = nodes.slice(0);
            for(var _iterator = _create_for_of_iterator_helper_loose(nodes), _step; !(_step = _iterator()).done;){
                var i2 = _step.value;
                if (i2.parent) i2.parent.removeChild(i2, "ignore");
            }
        } else if (nodes.type === "root" && this.type !== "document") {
            nodes = nodes.nodes.slice(0);
            for(var _iterator1 = _create_for_of_iterator_helper_loose(nodes), _step1; !(_step1 = _iterator1()).done;){
                var i21 = _step1.value;
                if (i21.parent) i21.parent.removeChild(i21, "ignore");
            }
        } else if (nodes.type) {
            nodes = [
                nodes
            ];
        } else if (nodes.prop) {
            if (typeof nodes.value === "undefined") {
                throw new Error("Value field is missed in node creation");
            } else if (typeof nodes.value !== "string") {
                nodes.value = String(nodes.value);
            }
            nodes = [
                new Declaration$3$1(nodes)
            ];
        } else if (nodes.selector) {
            nodes = [
                new Rule$4$1(nodes)
            ];
        } else if (nodes.name) {
            nodes = [
                new AtRule$4$1(nodes)
            ];
        } else if (nodes.text) {
            nodes = [
                new Comment$3$1(nodes)
            ];
        } else {
            throw new Error("Unknown node type in node creation");
        }
        var processed = nodes.map(function(i2) {
            if (!i2[my$1$1]) Container.rebuild(i2);
            i2 = i2.proxyOf;
            if (i2.parent) i2.parent.removeChild(i2);
            if (i2[isClean$1$1]) markDirtyUp$1(i2);
            if (typeof i2.raws.before === "undefined") {
                if (sample && typeof sample.raws.before !== "undefined") {
                    i2.raws.before = sample.raws.before.replace(/\S/g, "");
                }
            }
            i2.parent = _this.proxyOf;
            return i2;
        });
        return processed;
    };
    _proto.prepend = function prepend() {
        for(var _len = arguments.length, children = new Array(_len), _key = 0; _key < _len; _key++){
            children[_key] = arguments[_key];
        }
        children = children.reverse();
        for(var _iterator = _create_for_of_iterator_helper_loose(children), _step; !(_step = _iterator()).done;){
            var child = _step.value;
            var nodes = this.normalize(child, this.first, "prepend").reverse();
            for(var _iterator1 = _create_for_of_iterator_helper_loose(nodes), _step1; !(_step1 = _iterator1()).done;){
                var node2 = _step1.value;
                this.proxyOf.nodes.unshift(node2);
            }
            for(var id in this.indexes){
                this.indexes[id] = this.indexes[id] + nodes.length;
            }
        }
        this.markDirty();
        return this;
    };
    _proto.push = function push(child) {
        child.parent = this;
        this.proxyOf.nodes.push(child);
        return this;
    };
    _proto.removeAll = function removeAll() {
        for(var _iterator = _create_for_of_iterator_helper_loose(this.proxyOf.nodes), _step; !(_step = _iterator()).done;){
            var node2 = _step.value;
            node2.parent = void 0;
        }
        this.proxyOf.nodes = [];
        this.markDirty();
        return this;
    };
    _proto.removeChild = function removeChild(child) {
        child = this.index(child);
        this.proxyOf.nodes[child].parent = void 0;
        this.proxyOf.nodes.splice(child, 1);
        var index2;
        for(var id in this.indexes){
            index2 = this.indexes[id];
            if (index2 >= child) {
                this.indexes[id] = index2 - 1;
            }
        }
        this.markDirty();
        return this;
    };
    _proto.replaceValues = function replaceValues(pattern, opts, callback) {
        if (!callback) {
            callback = opts;
            opts = {};
        }
        this.walkDecls(function(decl) {
            if (opts.props && !opts.props.includes(decl.prop)) return;
            if (opts.fast && !decl.value.includes(opts.fast)) return;
            decl.value = decl.value.replace(pattern, callback);
        });
        this.markDirty();
        return this;
    };
    _proto.some = function some(condition) {
        return this.nodes.some(condition);
    };
    _proto.walk = function walk(callback) {
        return this.each(function(child, i2) {
            var result2;
            try {
                result2 = callback(child, i2);
            } catch (e2) {
                throw child.addToError(e2);
            }
            if (result2 !== false && child.walk) {
                result2 = child.walk(callback);
            }
            return result2;
        });
    };
    _proto.walkAtRules = function walkAtRules(name, callback) {
        if (!callback) {
            callback = name;
            return this.walk(function(child, i2) {
                if (child.type === "atrule") {
                    return callback(child, i2);
                }
            });
        }
        if (_instanceof(name, RegExp)) {
            return this.walk(function(child, i2) {
                if (child.type === "atrule" && name.test(child.name)) {
                    return callback(child, i2);
                }
            });
        }
        return this.walk(function(child, i2) {
            if (child.type === "atrule" && child.name === name) {
                return callback(child, i2);
            }
        });
    };
    _proto.walkComments = function walkComments(callback) {
        return this.walk(function(child, i2) {
            if (child.type === "comment") {
                return callback(child, i2);
            }
        });
    };
    _proto.walkDecls = function walkDecls(prop, callback) {
        if (!callback) {
            callback = prop;
            return this.walk(function(child, i2) {
                if (child.type === "decl") {
                    return callback(child, i2);
                }
            });
        }
        if (_instanceof(prop, RegExp)) {
            return this.walk(function(child, i2) {
                if (child.type === "decl" && prop.test(child.prop)) {
                    return callback(child, i2);
                }
            });
        }
        return this.walk(function(child, i2) {
            if (child.type === "decl" && child.prop === prop) {
                return callback(child, i2);
            }
        });
    };
    _proto.walkRules = function walkRules(selector, callback) {
        if (!callback) {
            callback = selector;
            return this.walk(function(child, i2) {
                if (child.type === "rule") {
                    return callback(child, i2);
                }
            });
        }
        if (_instanceof(selector, RegExp)) {
            return this.walk(function(child, i2) {
                if (child.type === "rule" && selector.test(child.selector)) {
                    return callback(child, i2);
                }
            });
        }
        return this.walk(function(child, i2) {
            if (child.type === "rule" && child.selector === selector) {
                return callback(child, i2);
            }
        });
    };
    _create_class(Container, [
        {
            key: "first",
            get: function get() {
                if (!this.proxyOf.nodes) return void 0;
                return this.proxyOf.nodes[0];
            }
        },
        {
            key: "last",
            get: function get() {
                if (!this.proxyOf.nodes) return void 0;
                return this.proxyOf.nodes[this.proxyOf.nodes.length - 1];
            }
        }
    ]);
    return Container;
}(Node$1$1);
Container$7$1.registerParse = function(dependant) {
    parse$4$1 = dependant;
};
Container$7$1.registerRule = function(dependant) {
    Rule$4$1 = dependant;
};
Container$7$1.registerAtRule = function(dependant) {
    AtRule$4$1 = dependant;
};
Container$7$1.registerRoot = function(dependant) {
    Root$6$1 = dependant;
};
var container$1 = Container$7$1;
Container$7$1.default = Container$7$1;
Container$7$1.rebuild = function(node2) {
    if (node2.type === "atrule") {
        Object.setPrototypeOf(node2, AtRule$4$1.prototype);
    } else if (node2.type === "rule") {
        Object.setPrototypeOf(node2, Rule$4$1.prototype);
    } else if (node2.type === "decl") {
        Object.setPrototypeOf(node2, Declaration$3$1.prototype);
    } else if (node2.type === "comment") {
        Object.setPrototypeOf(node2, Comment$3$1.prototype);
    } else if (node2.type === "root") {
        Object.setPrototypeOf(node2, Root$6$1.prototype);
    }
    node2[my$1$1] = true;
    if (node2.nodes) {
        node2.nodes.forEach(function(child) {
            Container$7$1.rebuild(child);
        });
    }
};
var Container$6$1 = container$1;
var LazyResult$4$1, Processor$3$1;
var Document$3$1 = /*#__PURE__*/ function(Container$6$1) {
    _inherits(Document2, Container$6$1);
    function Document2(defaults) {
        var _this;
        _this = Container$6$1.call(this, _extends({
            type: "document"
        }, defaults)) || this;
        if (!_this.nodes) {
            _this.nodes = [];
        }
        return _this;
    }
    var _proto = Document2.prototype;
    _proto.toResult = function toResult(opts) {
        if (opts === void 0) opts = {};
        var lazy = new LazyResult$4$1(new Processor$3$1(), this, opts);
        return lazy.stringify();
    };
    return Document2;
}(Container$6$1);
Document$3$1.registerLazyResult = function(dependant) {
    LazyResult$4$1 = dependant;
};
Document$3$1.registerProcessor = function(dependant) {
    Processor$3$1 = dependant;
};
var document$1$1 = Document$3$1;
Document$3$1.default = Document$3$1;
var printed$1 = {};
var warnOnce$2$1 = function warnOnce(message) {
    if (printed$1[message]) return;
    printed$1[message] = true;
    if (typeof console !== "undefined" && console.warn) {
        console.warn(message);
    }
};
var Warning$2$1 = /*#__PURE__*/ function() {
    function Warning(text, opts) {
        if (opts === void 0) opts = {};
        this.type = "warning";
        this.text = text;
        if (opts.node && opts.node.source) {
            var range = opts.node.rangeBy(opts);
            this.line = range.start.line;
            this.column = range.start.column;
            this.endLine = range.end.line;
            this.endColumn = range.end.column;
        }
        for(var opt in opts)this[opt] = opts[opt];
    }
    var _proto = Warning.prototype;
    _proto.toString = function toString() {
        if (this.node) {
            return this.node.error(this.text, {
                index: this.index,
                plugin: this.plugin,
                word: this.word
            }).message;
        }
        if (this.plugin) {
            return this.plugin + ": " + this.text;
        }
        return this.text;
    };
    return Warning;
}();
var warning$1 = Warning$2$1;
Warning$2$1.default = Warning$2$1;
var Warning$1$1 = warning$1;
var Result$3$1 = /*#__PURE__*/ function() {
    function Result(processor2, root2, opts) {
        this.processor = processor2;
        this.messages = [];
        this.root = root2;
        this.opts = opts;
        this.css = void 0;
        this.map = void 0;
    }
    var _proto = Result.prototype;
    _proto.toString = function toString() {
        return this.css;
    };
    _proto.warn = function warn(text, opts) {
        if (opts === void 0) opts = {};
        if (!opts.plugin) {
            if (this.lastPlugin && this.lastPlugin.postcssPlugin) {
                opts.plugin = this.lastPlugin.postcssPlugin;
            }
        }
        var warning2 = new Warning$1$1(text, opts);
        this.messages.push(warning2);
        return warning2;
    };
    _proto.warnings = function warnings() {
        return this.messages.filter(function(i2) {
            return i2.type === "warning";
        });
    };
    _create_class(Result, [
        {
            key: "content",
            get: function get() {
                return this.css;
            }
        }
    ]);
    return Result;
}();
var result$1 = Result$3$1;
Result$3$1.default = Result$3$1;
var SINGLE_QUOTE$1 = "'".charCodeAt(0);
var DOUBLE_QUOTE$1 = '"'.charCodeAt(0);
var BACKSLASH$1 = "\\".charCodeAt(0);
var SLASH$1 = "/".charCodeAt(0);
var NEWLINE$1 = "\n".charCodeAt(0);
var SPACE$1 = " ".charCodeAt(0);
var FEED$1 = "\f".charCodeAt(0);
var TAB$1 = "	".charCodeAt(0);
var CR$1 = "\r".charCodeAt(0);
var OPEN_SQUARE$1 = "[".charCodeAt(0);
var CLOSE_SQUARE$1 = "]".charCodeAt(0);
var OPEN_PARENTHESES$1 = "(".charCodeAt(0);
var CLOSE_PARENTHESES$1 = ")".charCodeAt(0);
var OPEN_CURLY$1 = "{".charCodeAt(0);
var CLOSE_CURLY$1 = "}".charCodeAt(0);
var SEMICOLON$1 = ";".charCodeAt(0);
var ASTERISK$1 = "*".charCodeAt(0);
var COLON$1 = ":".charCodeAt(0);
var AT$1 = "@".charCodeAt(0);
var RE_AT_END$1 = /[\t\n\f\r "#'()/;[\\\]{}]/g;
var RE_WORD_END$1 = /[\t\n\f\r !"#'():;@[\\\]{}]|\/(?=\*)/g;
var RE_BAD_BRACKET$1 = /.[\r\n"'(/\\]/;
var RE_HEX_ESCAPE$1 = /[\da-f]/i;
var tokenize$1 = function tokenizer(input2, options) {
    if (options === void 0) options = {};
    var css = input2.css.valueOf();
    var ignore = options.ignoreErrors;
    var code, next, quote, content, escape;
    var escaped, escapePos, prev, n2, currentToken;
    var length = css.length;
    var pos = 0;
    var buffer = [];
    var returned = [];
    function position() {
        return pos;
    }
    function unclosed(what) {
        throw input2.error("Unclosed " + what, pos);
    }
    function endOfFile() {
        return returned.length === 0 && pos >= length;
    }
    function nextToken(opts) {
        if (returned.length) return returned.pop();
        if (pos >= length) return;
        var ignoreUnclosed = opts ? opts.ignoreUnclosed : false;
        code = css.charCodeAt(pos);
        switch(code){
            case NEWLINE$1:
            case SPACE$1:
            case TAB$1:
            case CR$1:
            case FEED$1:
                {
                    next = pos;
                    do {
                        next += 1;
                        code = css.charCodeAt(next);
                    }while (code === SPACE$1 || code === NEWLINE$1 || code === TAB$1 || code === CR$1 || code === FEED$1);
                    currentToken = [
                        "space",
                        css.slice(pos, next)
                    ];
                    pos = next - 1;
                    break;
                }
            case OPEN_SQUARE$1:
            case CLOSE_SQUARE$1:
            case OPEN_CURLY$1:
            case CLOSE_CURLY$1:
            case COLON$1:
            case SEMICOLON$1:
            case CLOSE_PARENTHESES$1:
                {
                    var controlChar = String.fromCharCode(code);
                    currentToken = [
                        controlChar,
                        controlChar,
                        pos
                    ];
                    break;
                }
            case OPEN_PARENTHESES$1:
                {
                    prev = buffer.length ? buffer.pop()[1] : "";
                    n2 = css.charCodeAt(pos + 1);
                    if (prev === "url" && n2 !== SINGLE_QUOTE$1 && n2 !== DOUBLE_QUOTE$1 && n2 !== SPACE$1 && n2 !== NEWLINE$1 && n2 !== TAB$1 && n2 !== FEED$1 && n2 !== CR$1) {
                        next = pos;
                        do {
                            escaped = false;
                            next = css.indexOf(")", next + 1);
                            if (next === -1) {
                                if (ignore || ignoreUnclosed) {
                                    next = pos;
                                    break;
                                } else {
                                    unclosed("bracket");
                                }
                            }
                            escapePos = next;
                            while(css.charCodeAt(escapePos - 1) === BACKSLASH$1){
                                escapePos -= 1;
                                escaped = !escaped;
                            }
                        }while (escaped);
                        currentToken = [
                            "brackets",
                            css.slice(pos, next + 1),
                            pos,
                            next
                        ];
                        pos = next;
                    } else {
                        next = css.indexOf(")", pos + 1);
                        content = css.slice(pos, next + 1);
                        if (next === -1 || RE_BAD_BRACKET$1.test(content)) {
                            currentToken = [
                                "(",
                                "(",
                                pos
                            ];
                        } else {
                            currentToken = [
                                "brackets",
                                content,
                                pos,
                                next
                            ];
                            pos = next;
                        }
                    }
                    break;
                }
            case SINGLE_QUOTE$1:
            case DOUBLE_QUOTE$1:
                {
                    quote = code === SINGLE_QUOTE$1 ? "'" : '"';
                    next = pos;
                    do {
                        escaped = false;
                        next = css.indexOf(quote, next + 1);
                        if (next === -1) {
                            if (ignore || ignoreUnclosed) {
                                next = pos + 1;
                                break;
                            } else {
                                unclosed("string");
                            }
                        }
                        escapePos = next;
                        while(css.charCodeAt(escapePos - 1) === BACKSLASH$1){
                            escapePos -= 1;
                            escaped = !escaped;
                        }
                    }while (escaped);
                    currentToken = [
                        "string",
                        css.slice(pos, next + 1),
                        pos,
                        next
                    ];
                    pos = next;
                    break;
                }
            case AT$1:
                {
                    RE_AT_END$1.lastIndex = pos + 1;
                    RE_AT_END$1.test(css);
                    if (RE_AT_END$1.lastIndex === 0) {
                        next = css.length - 1;
                    } else {
                        next = RE_AT_END$1.lastIndex - 2;
                    }
                    currentToken = [
                        "at-word",
                        css.slice(pos, next + 1),
                        pos,
                        next
                    ];
                    pos = next;
                    break;
                }
            case BACKSLASH$1:
                {
                    next = pos;
                    escape = true;
                    while(css.charCodeAt(next + 1) === BACKSLASH$1){
                        next += 1;
                        escape = !escape;
                    }
                    code = css.charCodeAt(next + 1);
                    if (escape && code !== SLASH$1 && code !== SPACE$1 && code !== NEWLINE$1 && code !== TAB$1 && code !== CR$1 && code !== FEED$1) {
                        next += 1;
                        if (RE_HEX_ESCAPE$1.test(css.charAt(next))) {
                            while(RE_HEX_ESCAPE$1.test(css.charAt(next + 1))){
                                next += 1;
                            }
                            if (css.charCodeAt(next + 1) === SPACE$1) {
                                next += 1;
                            }
                        }
                    }
                    currentToken = [
                        "word",
                        css.slice(pos, next + 1),
                        pos,
                        next
                    ];
                    pos = next;
                    break;
                }
            default:
                {
                    if (code === SLASH$1 && css.charCodeAt(pos + 1) === ASTERISK$1) {
                        next = css.indexOf("*/", pos + 2) + 1;
                        if (next === 0) {
                            if (ignore || ignoreUnclosed) {
                                next = css.length;
                            } else {
                                unclosed("comment");
                            }
                        }
                        currentToken = [
                            "comment",
                            css.slice(pos, next + 1),
                            pos,
                            next
                        ];
                        pos = next;
                    } else {
                        RE_WORD_END$1.lastIndex = pos + 1;
                        RE_WORD_END$1.test(css);
                        if (RE_WORD_END$1.lastIndex === 0) {
                            next = css.length - 1;
                        } else {
                            next = RE_WORD_END$1.lastIndex - 2;
                        }
                        currentToken = [
                            "word",
                            css.slice(pos, next + 1),
                            pos,
                            next
                        ];
                        buffer.push(currentToken);
                        pos = next;
                    }
                    break;
                }
        }
        pos++;
        return currentToken;
    }
    function back(token) {
        returned.push(token);
    }
    return {
        back: back,
        endOfFile: endOfFile,
        nextToken: nextToken,
        position: position
    };
};
var Container$5$1 = container$1;
var AtRule$3$1 = /*#__PURE__*/ function(Container$5$1) {
    _inherits(AtRule, Container$5$1);
    function AtRule(defaults) {
        var _this;
        _this = Container$5$1.call(this, defaults) || this;
        _this.type = "atrule";
        return _this;
    }
    var _proto = AtRule.prototype;
    _proto.append = function append() {
        for(var _len = arguments.length, children = new Array(_len), _key = 0; _key < _len; _key++){
            children[_key] = arguments[_key];
        }
        var _Container$5$1_prototype_append;
        if (!this.proxyOf.nodes) this.nodes = [];
        return (_Container$5$1_prototype_append = Container$5$1.prototype.append).call.apply(_Container$5$1_prototype_append, [].concat([
            this
        ], children));
    };
    _proto.prepend = function prepend() {
        for(var _len = arguments.length, children = new Array(_len), _key = 0; _key < _len; _key++){
            children[_key] = arguments[_key];
        }
        var _Container$5$1_prototype_prepend;
        if (!this.proxyOf.nodes) this.nodes = [];
        return (_Container$5$1_prototype_prepend = Container$5$1.prototype.prepend).call.apply(_Container$5$1_prototype_prepend, [].concat([
            this
        ], children));
    };
    return AtRule;
}(Container$5$1);
var atRule$1 = AtRule$3$1;
AtRule$3$1.default = AtRule$3$1;
Container$5$1.registerAtRule(AtRule$3$1);
var Container$4$1 = container$1;
var LazyResult$3$1, Processor$2$1;
var Root$5$1 = /*#__PURE__*/ function(Container$4$1) {
    _inherits(Root, Container$4$1);
    function Root(defaults) {
        var _this;
        _this = Container$4$1.call(this, defaults) || this;
        _this.type = "root";
        if (!_this.nodes) _this.nodes = [];
        return _this;
    }
    var _proto = Root.prototype;
    _proto.normalize = function normalize(child, sample, type) {
        var nodes = Container$4$1.prototype.normalize.call(this, child);
        if (sample) {
            if (type === "prepend") {
                if (this.nodes.length > 1) {
                    sample.raws.before = this.nodes[1].raws.before;
                } else {
                    delete sample.raws.before;
                }
            } else if (this.first !== sample) {
                for(var _iterator = _create_for_of_iterator_helper_loose(nodes), _step; !(_step = _iterator()).done;){
                    var node2 = _step.value;
                    node2.raws.before = sample.raws.before;
                }
            }
        }
        return nodes;
    };
    _proto.removeChild = function removeChild(child, ignore) {
        var index2 = this.index(child);
        if (!ignore && index2 === 0 && this.nodes.length > 1) {
            this.nodes[1].raws.before = this.nodes[index2].raws.before;
        }
        return Container$4$1.prototype.removeChild.call(this, child);
    };
    _proto.toResult = function toResult(opts) {
        if (opts === void 0) opts = {};
        var lazy = new LazyResult$3$1(new Processor$2$1(), this, opts);
        return lazy.stringify();
    };
    return Root;
}(Container$4$1);
Root$5$1.registerLazyResult = function(dependant) {
    LazyResult$3$1 = dependant;
};
Root$5$1.registerProcessor = function(dependant) {
    Processor$2$1 = dependant;
};
var root$1 = Root$5$1;
Root$5$1.default = Root$5$1;
Container$4$1.registerRoot(Root$5$1);
var list$2$1 = {
    comma: function comma(string) {
        return list$2$1.split(string, [
            ","
        ], true);
    },
    space: function space(string) {
        var spaces = [
            " ",
            "\n",
            "	"
        ];
        return list$2$1.split(string, spaces);
    },
    split: function split(string, separators, last) {
        var array = [];
        var current = "";
        var split = false;
        var func = 0;
        var inQuote = false;
        var prevQuote = "";
        var escape = false;
        for(var _iterator = _create_for_of_iterator_helper_loose(string), _step; !(_step = _iterator()).done;){
            var letter = _step.value;
            if (escape) {
                escape = false;
            } else if (letter === "\\") {
                escape = true;
            } else if (inQuote) {
                if (letter === prevQuote) {
                    inQuote = false;
                }
            } else if (letter === '"' || letter === "'") {
                inQuote = true;
                prevQuote = letter;
            } else if (letter === "(") {
                func += 1;
            } else if (letter === ")") {
                if (func > 0) func -= 1;
            } else if (func === 0) {
                if (separators.includes(letter)) split = true;
            }
            if (split) {
                if (current !== "") array.push(current.trim());
                current = "";
                split = false;
            } else {
                current += letter;
            }
        }
        if (last || current !== "") array.push(current.trim());
        return array;
    }
};
var list_1$1 = list$2$1;
list$2$1.default = list$2$1;
var Container$3$1 = container$1;
var list$1$1 = list_1$1;
var Rule$3$1 = /*#__PURE__*/ function(Container$3$1) {
    _inherits(Rule, Container$3$1);
    function Rule(defaults) {
        var _this;
        _this = Container$3$1.call(this, defaults) || this;
        _this.type = "rule";
        if (!_this.nodes) _this.nodes = [];
        return _this;
    }
    _create_class(Rule, [
        {
            key: "selectors",
            get: function get() {
                return list$1$1.comma(this.selector);
            },
            set: function set(values) {
                var match = this.selector ? this.selector.match(/,\s*/) : null;
                var sep2 = match ? match[0] : "," + this.raw("between", "beforeOpen");
                this.selector = values.join(sep2);
            }
        }
    ]);
    return Rule;
}(Container$3$1);
var rule$1 = Rule$3$1;
Rule$3$1.default = Rule$3$1;
Container$3$1.registerRule(Rule$3$1);
var Declaration$2$1 = declaration$1;
var tokenizer2$1 = tokenize$1;
var Comment$2$1 = comment$1;
var AtRule$2$1 = atRule$1;
var Root$4$1 = root$1;
var Rule$2$1 = rule$1;
var SAFE_COMMENT_NEIGHBOR$1 = {
    empty: true,
    space: true
};
function findLastWithPosition$1(tokens) {
    for(var i2 = tokens.length - 1; i2 >= 0; i2--){
        var token = tokens[i2];
        var pos = token[3] || token[2];
        if (pos) return pos;
    }
}
var Parser$1$1 = /*#__PURE__*/ function() {
    function Parser(input2) {
        this.input = input2;
        this.root = new Root$4$1();
        this.current = this.root;
        this.spaces = "";
        this.semicolon = false;
        this.createTokenizer();
        this.root.source = {
            input: input2,
            start: {
                column: 1,
                line: 1,
                offset: 0
            }
        };
    }
    var _proto = Parser.prototype;
    _proto.atrule = function atrule(token) {
        var node2 = new AtRule$2$1();
        node2.name = token[1].slice(1);
        if (node2.name === "") {
            this.unnamedAtrule(node2, token);
        }
        this.init(node2, token[2]);
        var type;
        var prev;
        var shift;
        var last = false;
        var open = false;
        var params = [];
        var brackets = [];
        while(!this.tokenizer.endOfFile()){
            token = this.tokenizer.nextToken();
            type = token[0];
            if (type === "(" || type === "[") {
                brackets.push(type === "(" ? ")" : "]");
            } else if (type === "{" && brackets.length > 0) {
                brackets.push("}");
            } else if (type === brackets[brackets.length - 1]) {
                brackets.pop();
            }
            if (brackets.length === 0) {
                if (type === ";") {
                    node2.source.end = this.getPosition(token[2]);
                    node2.source.end.offset++;
                    this.semicolon = true;
                    break;
                } else if (type === "{") {
                    open = true;
                    break;
                } else if (type === "}") {
                    if (params.length > 0) {
                        shift = params.length - 1;
                        prev = params[shift];
                        while(prev && prev[0] === "space"){
                            prev = params[--shift];
                        }
                        if (prev) {
                            node2.source.end = this.getPosition(prev[3] || prev[2]);
                            node2.source.end.offset++;
                        }
                    }
                    this.end(token);
                    break;
                } else {
                    params.push(token);
                }
            } else {
                params.push(token);
            }
            if (this.tokenizer.endOfFile()) {
                last = true;
                break;
            }
        }
        node2.raws.between = this.spacesAndCommentsFromEnd(params);
        if (params.length) {
            node2.raws.afterName = this.spacesAndCommentsFromStart(params);
            this.raw(node2, "params", params);
            if (last) {
                token = params[params.length - 1];
                node2.source.end = this.getPosition(token[3] || token[2]);
                node2.source.end.offset++;
                this.spaces = node2.raws.between;
                node2.raws.between = "";
            }
        } else {
            node2.raws.afterName = "";
            node2.params = "";
        }
        if (open) {
            node2.nodes = [];
            this.current = node2;
        }
    };
    _proto.checkMissedSemicolon = function checkMissedSemicolon(tokens) {
        var colon = this.colon(tokens);
        if (colon === false) return;
        var founded = 0;
        var token;
        for(var j = colon - 1; j >= 0; j--){
            token = tokens[j];
            if (token[0] !== "space") {
                founded += 1;
                if (founded === 2) break;
            }
        }
        throw this.input.error("Missed semicolon", token[0] === "word" ? token[3] + 1 : token[2]);
    };
    _proto.colon = function colon(tokens) {
        var brackets = 0;
        var token, type, prev;
        for(var _iterator = _create_for_of_iterator_helper_loose(tokens.entries()), _step; !(_step = _iterator()).done;){
            var _step_value = _step.value, i2 = _step_value[0], element = _step_value[1];
            token = element;
            type = token[0];
            if (type === "(") {
                brackets += 1;
            }
            if (type === ")") {
                brackets -= 1;
            }
            if (brackets === 0 && type === ":") {
                if (!prev) {
                    this.doubleColon(token);
                } else if (prev[0] === "word" && prev[1] === "progid") {
                    continue;
                } else {
                    return i2;
                }
            }
            prev = token;
        }
        return false;
    };
    _proto.comment = function comment(token) {
        var node2 = new Comment$2$1();
        this.init(node2, token[2]);
        node2.source.end = this.getPosition(token[3] || token[2]);
        node2.source.end.offset++;
        var text = token[1].slice(2, -2);
        if (/^\s*$/.test(text)) {
            node2.text = "";
            node2.raws.left = text;
            node2.raws.right = "";
        } else {
            var match = text.match(/^(\s*)([^]*\S)(\s*)$/);
            node2.text = match[2];
            node2.raws.left = match[1];
            node2.raws.right = match[3];
        }
    };
    _proto.createTokenizer = function createTokenizer() {
        this.tokenizer = tokenizer2$1(this.input);
    };
    _proto.decl = function decl(tokens, customProperty) {
        var node2 = new Declaration$2$1();
        this.init(node2, tokens[0][2]);
        var last = tokens[tokens.length - 1];
        if (last[0] === ";") {
            this.semicolon = true;
            tokens.pop();
        }
        node2.source.end = this.getPosition(last[3] || last[2] || findLastWithPosition$1(tokens));
        node2.source.end.offset++;
        while(tokens[0][0] !== "word"){
            if (tokens.length === 1) this.unknownWord(tokens);
            node2.raws.before += tokens.shift()[1];
        }
        node2.source.start = this.getPosition(tokens[0][2]);
        node2.prop = "";
        while(tokens.length){
            var type = tokens[0][0];
            if (type === ":" || type === "space" || type === "comment") {
                break;
            }
            node2.prop += tokens.shift()[1];
        }
        node2.raws.between = "";
        var token;
        while(tokens.length){
            token = tokens.shift();
            if (token[0] === ":") {
                node2.raws.between += token[1];
                break;
            } else {
                if (token[0] === "word" && /\w/.test(token[1])) {
                    this.unknownWord([
                        token
                    ]);
                }
                node2.raws.between += token[1];
            }
        }
        if (node2.prop[0] === "_" || node2.prop[0] === "*") {
            node2.raws.before += node2.prop[0];
            node2.prop = node2.prop.slice(1);
        }
        var firstSpaces = [];
        var next;
        while(tokens.length){
            next = tokens[0][0];
            if (next !== "space" && next !== "comment") break;
            firstSpaces.push(tokens.shift());
        }
        this.precheckMissedSemicolon(tokens);
        for(var i2 = tokens.length - 1; i2 >= 0; i2--){
            token = tokens[i2];
            if (token[1].toLowerCase() === "!important") {
                node2.important = true;
                var string = this.stringFrom(tokens, i2);
                string = this.spacesFromEnd(tokens) + string;
                if (string !== " !important") node2.raws.important = string;
                break;
            } else if (token[1].toLowerCase() === "important") {
                var cache = tokens.slice(0);
                var str = "";
                for(var j = i2; j > 0; j--){
                    var type1 = cache[j][0];
                    if (str.trim().indexOf("!") === 0 && type1 !== "space") {
                        break;
                    }
                    str = cache.pop()[1] + str;
                }
                if (str.trim().indexOf("!") === 0) {
                    node2.important = true;
                    node2.raws.important = str;
                    tokens = cache;
                }
            }
            if (token[0] !== "space" && token[0] !== "comment") {
                break;
            }
        }
        var hasWord = tokens.some(function(i2) {
            return i2[0] !== "space" && i2[0] !== "comment";
        });
        if (hasWord) {
            node2.raws.between += firstSpaces.map(function(i2) {
                return i2[1];
            }).join("");
            firstSpaces = [];
        }
        this.raw(node2, "value", firstSpaces.concat(tokens), customProperty);
        if (node2.value.includes(":") && !customProperty) {
            this.checkMissedSemicolon(tokens);
        }
    };
    _proto.doubleColon = function doubleColon(token) {
        throw this.input.error("Double colon", {
            offset: token[2]
        }, {
            offset: token[2] + token[1].length
        });
    };
    _proto.emptyRule = function emptyRule(token) {
        var node2 = new Rule$2$1();
        this.init(node2, token[2]);
        node2.selector = "";
        node2.raws.between = "";
        this.current = node2;
    };
    _proto.end = function end(token) {
        if (this.current.nodes && this.current.nodes.length) {
            this.current.raws.semicolon = this.semicolon;
        }
        this.semicolon = false;
        this.current.raws.after = (this.current.raws.after || "") + this.spaces;
        this.spaces = "";
        if (this.current.parent) {
            this.current.source.end = this.getPosition(token[2]);
            this.current.source.end.offset++;
            this.current = this.current.parent;
        } else {
            this.unexpectedClose(token);
        }
    };
    _proto.endFile = function endFile() {
        if (this.current.parent) this.unclosedBlock();
        if (this.current.nodes && this.current.nodes.length) {
            this.current.raws.semicolon = this.semicolon;
        }
        this.current.raws.after = (this.current.raws.after || "") + this.spaces;
        this.root.source.end = this.getPosition(this.tokenizer.position());
    };
    _proto.freeSemicolon = function freeSemicolon(token) {
        this.spaces += token[1];
        if (this.current.nodes) {
            var prev = this.current.nodes[this.current.nodes.length - 1];
            if (prev && prev.type === "rule" && !prev.raws.ownSemicolon) {
                prev.raws.ownSemicolon = this.spaces;
                this.spaces = "";
            }
        }
    };
    // Helpers
    _proto.getPosition = function getPosition(offset) {
        var pos = this.input.fromOffset(offset);
        return {
            column: pos.col,
            line: pos.line,
            offset: offset
        };
    };
    _proto.init = function init(node2, offset) {
        this.current.push(node2);
        node2.source = {
            input: this.input,
            start: this.getPosition(offset)
        };
        node2.raws.before = this.spaces;
        this.spaces = "";
        if (node2.type !== "comment") this.semicolon = false;
    };
    _proto.other = function other(start) {
        var end = false;
        var type = null;
        var colon = false;
        var bracket = null;
        var brackets = [];
        var customProperty = start[1].startsWith("--");
        var tokens = [];
        var token = start;
        while(token){
            type = token[0];
            tokens.push(token);
            if (type === "(" || type === "[") {
                if (!bracket) bracket = token;
                brackets.push(type === "(" ? ")" : "]");
            } else if (customProperty && colon && type === "{") {
                if (!bracket) bracket = token;
                brackets.push("}");
            } else if (brackets.length === 0) {
                if (type === ";") {
                    if (colon) {
                        this.decl(tokens, customProperty);
                        return;
                    } else {
                        break;
                    }
                } else if (type === "{") {
                    this.rule(tokens);
                    return;
                } else if (type === "}") {
                    this.tokenizer.back(tokens.pop());
                    end = true;
                    break;
                } else if (type === ":") {
                    colon = true;
                }
            } else if (type === brackets[brackets.length - 1]) {
                brackets.pop();
                if (brackets.length === 0) bracket = null;
            }
            token = this.tokenizer.nextToken();
        }
        if (this.tokenizer.endOfFile()) end = true;
        if (brackets.length > 0) this.unclosedBracket(bracket);
        if (end && colon) {
            if (!customProperty) {
                while(tokens.length){
                    token = tokens[tokens.length - 1][0];
                    if (token !== "space" && token !== "comment") break;
                    this.tokenizer.back(tokens.pop());
                }
            }
            this.decl(tokens, customProperty);
        } else {
            this.unknownWord(tokens);
        }
    };
    _proto.parse = function parse() {
        var token;
        while(!this.tokenizer.endOfFile()){
            token = this.tokenizer.nextToken();
            switch(token[0]){
                case "space":
                    this.spaces += token[1];
                    break;
                case ";":
                    this.freeSemicolon(token);
                    break;
                case "}":
                    this.end(token);
                    break;
                case "comment":
                    this.comment(token);
                    break;
                case "at-word":
                    this.atrule(token);
                    break;
                case "{":
                    this.emptyRule(token);
                    break;
                default:
                    this.other(token);
                    break;
            }
        }
        this.endFile();
    };
    _proto.precheckMissedSemicolon = function precheckMissedSemicolon() {};
    _proto.raw = function raw(node2, prop, tokens, customProperty) {
        var token, type;
        var length = tokens.length;
        var value = "";
        var clean = true;
        var next, prev;
        for(var i2 = 0; i2 < length; i2 += 1){
            token = tokens[i2];
            type = token[0];
            if (type === "space" && i2 === length - 1 && !customProperty) {
                clean = false;
            } else if (type === "comment") {
                prev = tokens[i2 - 1] ? tokens[i2 - 1][0] : "empty";
                next = tokens[i2 + 1] ? tokens[i2 + 1][0] : "empty";
                if (!SAFE_COMMENT_NEIGHBOR$1[prev] && !SAFE_COMMENT_NEIGHBOR$1[next]) {
                    if (value.slice(-1) === ",") {
                        clean = false;
                    } else {
                        value += token[1];
                    }
                } else {
                    clean = false;
                }
            } else {
                value += token[1];
            }
        }
        if (!clean) {
            var raw = tokens.reduce(function(all, i2) {
                return all + i2[1];
            }, "");
            node2.raws[prop] = {
                raw: raw,
                value: value
            };
        }
        node2[prop] = value;
    };
    _proto.rule = function rule(tokens) {
        tokens.pop();
        var node2 = new Rule$2$1();
        this.init(node2, tokens[0][2]);
        node2.raws.between = this.spacesAndCommentsFromEnd(tokens);
        this.raw(node2, "selector", tokens);
        this.current = node2;
    };
    _proto.spacesAndCommentsFromEnd = function spacesAndCommentsFromEnd(tokens) {
        var lastTokenType;
        var spaces = "";
        while(tokens.length){
            lastTokenType = tokens[tokens.length - 1][0];
            if (lastTokenType !== "space" && lastTokenType !== "comment") break;
            spaces = tokens.pop()[1] + spaces;
        }
        return spaces;
    };
    // Errors
    _proto.spacesAndCommentsFromStart = function spacesAndCommentsFromStart(tokens) {
        var next;
        var spaces = "";
        while(tokens.length){
            next = tokens[0][0];
            if (next !== "space" && next !== "comment") break;
            spaces += tokens.shift()[1];
        }
        return spaces;
    };
    _proto.spacesFromEnd = function spacesFromEnd(tokens) {
        var lastTokenType;
        var spaces = "";
        while(tokens.length){
            lastTokenType = tokens[tokens.length - 1][0];
            if (lastTokenType !== "space") break;
            spaces = tokens.pop()[1] + spaces;
        }
        return spaces;
    };
    _proto.stringFrom = function stringFrom(tokens, from) {
        var result2 = "";
        for(var i2 = from; i2 < tokens.length; i2++){
            result2 += tokens[i2][1];
        }
        tokens.splice(from, tokens.length - from);
        return result2;
    };
    _proto.unclosedBlock = function unclosedBlock() {
        var pos = this.current.source.start;
        throw this.input.error("Unclosed block", pos.line, pos.column);
    };
    _proto.unclosedBracket = function unclosedBracket(bracket) {
        throw this.input.error("Unclosed bracket", {
            offset: bracket[2]
        }, {
            offset: bracket[2] + 1
        });
    };
    _proto.unexpectedClose = function unexpectedClose(token) {
        throw this.input.error("Unexpected }", {
            offset: token[2]
        }, {
            offset: token[2] + 1
        });
    };
    _proto.unknownWord = function unknownWord(tokens) {
        throw this.input.error("Unknown word", {
            offset: tokens[0][2]
        }, {
            offset: tokens[0][2] + tokens[0][1].length
        });
    };
    _proto.unnamedAtrule = function unnamedAtrule(node2, token) {
        throw this.input.error("At-rule without name", {
            offset: token[2]
        }, {
            offset: token[2] + token[1].length
        });
    };
    return Parser;
}();
var parser$1 = Parser$1$1;
var Container$2$1 = container$1;
var Parser2$1 = parser$1;
var Input$2$1 = input$1;
function parse$3$1(css, opts) {
    var input2 = new Input$2$1(css, opts);
    var parser2 = new Parser2$1(input2);
    try {
        parser2.parse();
    } catch (e2) {
        if (process.env.NODE_ENV !== "production") {
            if (e2.name === "CssSyntaxError" && opts && opts.from) {
                if (/\.scss$/i.test(opts.from)) {
                    e2.message += "\nYou tried to parse SCSS with the standard CSS parser; try again with the postcss-scss parser";
                } else if (/\.sass/i.test(opts.from)) {
                    e2.message += "\nYou tried to parse Sass with the standard CSS parser; try again with the postcss-sass parser";
                } else if (/\.less$/i.test(opts.from)) {
                    e2.message += "\nYou tried to parse Less with the standard CSS parser; try again with the postcss-less parser";
                }
            }
        }
        throw e2;
    }
    return parser2.root;
}
var parse_1$1 = parse$3$1;
parse$3$1.default = parse$3$1;
Container$2$1.registerParse(parse$3$1);
var isClean$3 = symbols$1.isClean, my$3 = symbols$1.my;
var MapGenerator$1$1 = mapGenerator$1;
var stringify$2$1 = stringify_1$1;
var Container$1$1 = container$1;
var Document$2$1 = document$1$1;
var warnOnce$1$1 = warnOnce$2$1;
var Result$2$1 = result$1;
var parse$2$1 = parse_1$1;
var Root$3$1 = root$1;
var TYPE_TO_CLASS_NAME$1 = {
    atrule: "AtRule",
    comment: "Comment",
    decl: "Declaration",
    document: "Document",
    root: "Root",
    rule: "Rule"
};
var PLUGIN_PROPS$1 = {
    AtRule: true,
    AtRuleExit: true,
    Comment: true,
    CommentExit: true,
    Declaration: true,
    DeclarationExit: true,
    Document: true,
    DocumentExit: true,
    Once: true,
    OnceExit: true,
    postcssPlugin: true,
    prepare: true,
    Root: true,
    RootExit: true,
    Rule: true,
    RuleExit: true
};
var NOT_VISITORS$1 = {
    Once: true,
    postcssPlugin: true,
    prepare: true
};
var CHILDREN$1 = 0;
function isPromise$1(obj) {
    return (typeof obj === "undefined" ? "undefined" : _type_of(obj)) === "object" && typeof obj.then === "function";
}
function getEvents$1(node2) {
    var key = false;
    var type = TYPE_TO_CLASS_NAME$1[node2.type];
    if (node2.type === "decl") {
        key = node2.prop.toLowerCase();
    } else if (node2.type === "atrule") {
        key = node2.name.toLowerCase();
    }
    if (key && node2.append) {
        return [
            type,
            type + "-" + key,
            CHILDREN$1,
            type + "Exit",
            type + "Exit-" + key
        ];
    } else if (key) {
        return [
            type,
            type + "-" + key,
            type + "Exit",
            type + "Exit-" + key
        ];
    } else if (node2.append) {
        return [
            type,
            CHILDREN$1,
            type + "Exit"
        ];
    } else {
        return [
            type,
            type + "Exit"
        ];
    }
}
function toStack$1(node2) {
    var events;
    if (node2.type === "document") {
        events = [
            "Document",
            CHILDREN$1,
            "DocumentExit"
        ];
    } else if (node2.type === "root") {
        events = [
            "Root",
            CHILDREN$1,
            "RootExit"
        ];
    } else {
        events = getEvents$1(node2);
    }
    return {
        eventIndex: 0,
        events: events,
        iterator: 0,
        node: node2,
        visitorIndex: 0,
        visitors: []
    };
}
function cleanMarks$1(node2) {
    node2[isClean$3] = false;
    if (node2.nodes) node2.nodes.forEach(function(i2) {
        return cleanMarks$1(i2);
    });
    return node2;
}
var postcss$2$1 = {};
var LazyResult$2$1 = /*#__PURE__*/ function() {
    function LazyResult(processor2, css, opts) {
        var _this = this;
        this.stringified = false;
        this.processed = false;
        var root2;
        if ((typeof css === "undefined" ? "undefined" : _type_of(css)) === "object" && css !== null && (css.type === "root" || css.type === "document")) {
            root2 = cleanMarks$1(css);
        } else if (_instanceof(css, LazyResult) || _instanceof(css, Result$2$1)) {
            root2 = cleanMarks$1(css.root);
            if (css.map) {
                if (typeof opts.map === "undefined") opts.map = {};
                if (!opts.map.inline) opts.map.inline = false;
                opts.map.prev = css.map;
            }
        } else {
            var parser2 = parse$2$1;
            if (opts.syntax) parser2 = opts.syntax.parse;
            if (opts.parser) parser2 = opts.parser;
            if (parser2.parse) parser2 = parser2.parse;
            try {
                root2 = parser2(css, opts);
            } catch (error) {
                this.processed = true;
                this.error = error;
            }
            if (root2 && !root2[my$3]) {
                Container$1$1.rebuild(root2);
            }
        }
        this.result = new Result$2$1(processor2, root2, opts);
        this.helpers = _extends({}, postcss$2$1, {
            postcss: postcss$2$1,
            result: this.result
        });
        this.plugins = this.processor.plugins.map(function(plugin22) {
            if ((typeof plugin22 === "undefined" ? "undefined" : _type_of(plugin22)) === "object" && plugin22.prepare) {
                return _extends({}, plugin22, plugin22.prepare(_this.result));
            } else {
                return plugin22;
            }
        });
    }
    var _proto = LazyResult.prototype;
    _proto.async = function async() {
        if (this.error) return Promise.reject(this.error);
        if (this.processed) return Promise.resolve(this.result);
        if (!this.processing) {
            this.processing = this.runAsync();
        }
        return this.processing;
    };
    _proto.catch = function _catch(onRejected) {
        return this.async().catch(onRejected);
    };
    _proto.finally = function _finally(onFinally) {
        return this.async().then(onFinally, onFinally);
    };
    _proto.getAsyncError = function getAsyncError() {
        throw new Error("Use process(css).then(cb) to work with async plugins");
    };
    _proto.handleError = function handleError(error, node2) {
        var plugin22 = this.result.lastPlugin;
        try {
            if (node2) node2.addToError(error);
            this.error = error;
            if (error.name === "CssSyntaxError" && !error.plugin) {
                error.plugin = plugin22.postcssPlugin;
                error.setMessage();
            } else if (plugin22.postcssVersion) {
                if (process.env.NODE_ENV !== "production") {
                    var pluginName = plugin22.postcssPlugin;
                    var pluginVer = plugin22.postcssVersion;
                    var runtimeVer = this.result.processor.version;
                    var a2 = pluginVer.split(".");
                    var b = runtimeVer.split(".");
                    if (a2[0] !== b[0] || parseInt(a2[1]) > parseInt(b[1])) {
                        console.error("Unknown error from PostCSS plugin. Your current PostCSS version is " + runtimeVer + ", but " + pluginName + " uses " + pluginVer + ". Perhaps this is the source of the error below.");
                    }
                }
            }
        } catch (err) {
            if (console && console.error) console.error(err);
        }
        return error;
    };
    _proto.prepareVisitors = function prepareVisitors() {
        var _this = this;
        this.listeners = {};
        var add = function(plugin22, type, cb) {
            if (!_this.listeners[type]) _this.listeners[type] = [];
            _this.listeners[type].push([
                plugin22,
                cb
            ]);
        };
        for(var _iterator = _create_for_of_iterator_helper_loose(this.plugins), _step; !(_step = _iterator()).done;){
            var plugin22 = _step.value;
            if ((typeof plugin22 === "undefined" ? "undefined" : _type_of(plugin22)) === "object") {
                for(var event in plugin22){
                    if (!PLUGIN_PROPS$1[event] && /^[A-Z]/.test(event)) {
                        throw new Error("Unknown event " + event + " in " + plugin22.postcssPlugin + ". Try to update PostCSS (" + this.processor.version + " now).");
                    }
                    if (!NOT_VISITORS$1[event]) {
                        if (_type_of(plugin22[event]) === "object") {
                            for(var filter in plugin22[event]){
                                if (filter === "*") {
                                    add(plugin22, event, plugin22[event][filter]);
                                } else {
                                    add(plugin22, event + "-" + filter.toLowerCase(), plugin22[event][filter]);
                                }
                            }
                        } else if (typeof plugin22[event] === "function") {
                            add(plugin22, event, plugin22[event]);
                        }
                    }
                }
            }
        }
        this.hasListener = Object.keys(this.listeners).length > 0;
    };
    _proto.runAsync = function runAsync() {
        var _this = this;
        return _async_to_generator(function() {
            var i2, plugin22, promise, error, root2, stack, promise1, e2, node2, _loop, _iterator, _step;
            return _ts_generator(this, function(_state) {
                switch(_state.label){
                    case 0:
                        _this.plugin = 0;
                        i2 = 0;
                        _state.label = 1;
                    case 1:
                        if (!(i2 < _this.plugins.length)) return [
                            3,
                            6
                        ];
                        plugin22 = _this.plugins[i2];
                        promise = _this.runOnRoot(plugin22);
                        if (!isPromise$1(promise)) return [
                            3,
                            5
                        ];
                        _state.label = 2;
                    case 2:
                        _state.trys.push([
                            2,
                            4,
                            ,
                            5
                        ]);
                        return [
                            4,
                            promise
                        ];
                    case 3:
                        _state.sent();
                        return [
                            3,
                            5
                        ];
                    case 4:
                        error = _state.sent();
                        throw _this.handleError(error);
                    case 5:
                        i2++;
                        return [
                            3,
                            1
                        ];
                    case 6:
                        _this.prepareVisitors();
                        if (!_this.hasListener) return [
                            3,
                            18
                        ];
                        root2 = _this.result.root;
                        _state.label = 7;
                    case 7:
                        if (!!root2[isClean$3]) return [
                            3,
                            14
                        ];
                        root2[isClean$3] = true;
                        stack = [
                            toStack$1(root2)
                        ];
                        _state.label = 8;
                    case 8:
                        if (!(stack.length > 0)) return [
                            3,
                            13
                        ];
                        promise1 = _this.visitTick(stack);
                        if (!isPromise$1(promise1)) return [
                            3,
                            12
                        ];
                        _state.label = 9;
                    case 9:
                        _state.trys.push([
                            9,
                            11,
                            ,
                            12
                        ]);
                        return [
                            4,
                            promise1
                        ];
                    case 10:
                        _state.sent();
                        return [
                            3,
                            12
                        ];
                    case 11:
                        e2 = _state.sent();
                        node2 = stack[stack.length - 1].node;
                        throw _this.handleError(e2, node2);
                    case 12:
                        return [
                            3,
                            8
                        ];
                    case 13:
                        return [
                            3,
                            7
                        ];
                    case 14:
                        if (!_this.listeners.OnceExit) return [
                            3,
                            18
                        ];
                        _loop = function() {
                            var _step_value, plugin22, visitor, roots, e2;
                            return _ts_generator(this, function(_state) {
                                switch(_state.label){
                                    case 0:
                                        _step_value = _step.value, plugin22 = _step_value[0], visitor = _step_value[1];
                                        _this.result.lastPlugin = plugin22;
                                        _state.label = 1;
                                    case 1:
                                        _state.trys.push([
                                            1,
                                            6,
                                            ,
                                            7
                                        ]);
                                        if (!(root2.type === "document")) return [
                                            3,
                                            3
                                        ];
                                        roots = root2.nodes.map(function(subRoot) {
                                            return visitor(subRoot, _this.helpers);
                                        });
                                        return [
                                            4,
                                            Promise.all(roots)
                                        ];
                                    case 2:
                                        _state.sent();
                                        return [
                                            3,
                                            5
                                        ];
                                    case 3:
                                        return [
                                            4,
                                            visitor(root2, _this.helpers)
                                        ];
                                    case 4:
                                        _state.sent();
                                        _state.label = 5;
                                    case 5:
                                        return [
                                            3,
                                            7
                                        ];
                                    case 6:
                                        e2 = _state.sent();
                                        throw _this.handleError(e2);
                                    case 7:
                                        return [
                                            2
                                        ];
                                }
                            });
                        };
                        _iterator = _create_for_of_iterator_helper_loose(_this.listeners.OnceExit);
                        _state.label = 15;
                    case 15:
                        if (!!(_step = _iterator()).done) return [
                            3,
                            18
                        ];
                        return [
                            5,
                            _ts_values(_loop())
                        ];
                    case 16:
                        _state.sent();
                        _state.label = 17;
                    case 17:
                        return [
                            3,
                            15
                        ];
                    case 18:
                        _this.processed = true;
                        return [
                            2,
                            _this.stringify()
                        ];
                }
            });
        })();
    };
    _proto.runOnRoot = function runOnRoot(plugin22) {
        var _this = this;
        this.result.lastPlugin = plugin22;
        try {
            if ((typeof plugin22 === "undefined" ? "undefined" : _type_of(plugin22)) === "object" && plugin22.Once) {
                if (this.result.root.type === "document") {
                    var roots = this.result.root.nodes.map(function(root2) {
                        return plugin22.Once(root2, _this.helpers);
                    });
                    if (isPromise$1(roots[0])) {
                        return Promise.all(roots);
                    }
                    return roots;
                }
                return plugin22.Once(this.result.root, this.helpers);
            } else if (typeof plugin22 === "function") {
                return plugin22(this.result.root, this.result);
            }
        } catch (error) {
            throw this.handleError(error);
        }
    };
    _proto.stringify = function stringify() {
        if (this.error) throw this.error;
        if (this.stringified) return this.result;
        this.stringified = true;
        this.sync();
        var opts = this.result.opts;
        var str = stringify$2$1;
        if (opts.syntax) str = opts.syntax.stringify;
        if (opts.stringifier) str = opts.stringifier;
        if (str.stringify) str = str.stringify;
        var map = new MapGenerator$1$1(str, this.result.root, this.result.opts);
        var data = map.generate();
        this.result.css = data[0];
        this.result.map = data[1];
        return this.result;
    };
    _proto.sync = function sync() {
        if (this.error) throw this.error;
        if (this.processed) return this.result;
        this.processed = true;
        if (this.processing) {
            throw this.getAsyncError();
        }
        for(var _iterator = _create_for_of_iterator_helper_loose(this.plugins), _step; !(_step = _iterator()).done;){
            var plugin22 = _step.value;
            var promise = this.runOnRoot(plugin22);
            if (isPromise$1(promise)) {
                throw this.getAsyncError();
            }
        }
        this.prepareVisitors();
        if (this.hasListener) {
            var root2 = this.result.root;
            while(!root2[isClean$3]){
                root2[isClean$3] = true;
                this.walkSync(root2);
            }
            if (this.listeners.OnceExit) {
                if (root2.type === "document") {
                    for(var _iterator1 = _create_for_of_iterator_helper_loose(root2.nodes), _step1; !(_step1 = _iterator1()).done;){
                        var subRoot = _step1.value;
                        this.visitSync(this.listeners.OnceExit, subRoot);
                    }
                } else {
                    this.visitSync(this.listeners.OnceExit, root2);
                }
            }
        }
        return this.result;
    };
    _proto.then = function then(onFulfilled, onRejected) {
        if (process.env.NODE_ENV !== "production") {
            if (!("from" in this.opts)) {
                warnOnce$1$1("Without `from` option PostCSS could generate wrong source map and will not find Browserslist config. Set it to CSS file path or to `undefined` to prevent this warning.");
            }
        }
        return this.async().then(onFulfilled, onRejected);
    };
    _proto.toString = function toString() {
        return this.css;
    };
    _proto.visitSync = function visitSync(visitors, node2) {
        for(var _iterator = _create_for_of_iterator_helper_loose(visitors), _step; !(_step = _iterator()).done;){
            var _step_value = _step.value, plugin22 = _step_value[0], visitor = _step_value[1];
            this.result.lastPlugin = plugin22;
            var promise = void 0;
            try {
                promise = visitor(node2, this.helpers);
            } catch (e2) {
                throw this.handleError(e2, node2.proxyOf);
            }
            if (node2.type !== "root" && node2.type !== "document" && !node2.parent) {
                return true;
            }
            if (isPromise$1(promise)) {
                throw this.getAsyncError();
            }
        }
    };
    _proto.visitTick = function visitTick(stack) {
        var visit2 = stack[stack.length - 1];
        var node2 = visit2.node, visitors = visit2.visitors;
        if (node2.type !== "root" && node2.type !== "document" && !node2.parent) {
            stack.pop();
            return;
        }
        if (visitors.length > 0 && visit2.visitorIndex < visitors.length) {
            var _visitors_visit2_visitorIndex = visitors[visit2.visitorIndex], plugin22 = _visitors_visit2_visitorIndex[0], visitor = _visitors_visit2_visitorIndex[1];
            visit2.visitorIndex += 1;
            if (visit2.visitorIndex === visitors.length) {
                visit2.visitors = [];
                visit2.visitorIndex = 0;
            }
            this.result.lastPlugin = plugin22;
            try {
                return visitor(node2.toProxy(), this.helpers);
            } catch (e2) {
                throw this.handleError(e2, node2);
            }
        }
        if (visit2.iterator !== 0) {
            var iterator = visit2.iterator;
            var child;
            while(child = node2.nodes[node2.indexes[iterator]]){
                node2.indexes[iterator] += 1;
                if (!child[isClean$3]) {
                    child[isClean$3] = true;
                    stack.push(toStack$1(child));
                    return;
                }
            }
            visit2.iterator = 0;
            delete node2.indexes[iterator];
        }
        var events = visit2.events;
        while(visit2.eventIndex < events.length){
            var event = events[visit2.eventIndex];
            visit2.eventIndex += 1;
            if (event === CHILDREN$1) {
                if (node2.nodes && node2.nodes.length) {
                    node2[isClean$3] = true;
                    visit2.iterator = node2.getIterator();
                }
                return;
            } else if (this.listeners[event]) {
                visit2.visitors = this.listeners[event];
                return;
            }
        }
        stack.pop();
    };
    _proto.walkSync = function walkSync(node2) {
        var _this = this;
        node2[isClean$3] = true;
        var events = getEvents$1(node2);
        for(var _iterator = _create_for_of_iterator_helper_loose(events), _step; !(_step = _iterator()).done;){
            var event = _step.value;
            if (event === CHILDREN$1) {
                if (node2.nodes) {
                    node2.each(function(child) {
                        if (!child[isClean$3]) _this.walkSync(child);
                    });
                }
            } else {
                var visitors = this.listeners[event];
                if (visitors) {
                    if (this.visitSync(visitors, node2.toProxy())) return;
                }
            }
        }
    };
    _proto.warnings = function warnings() {
        return this.sync().warnings();
    };
    _create_class(LazyResult, [
        {
            key: "content",
            get: function get() {
                return this.stringify().content;
            }
        },
        {
            key: "css",
            get: function get() {
                return this.stringify().css;
            }
        },
        {
            key: "map",
            get: function get() {
                return this.stringify().map;
            }
        },
        {
            key: "messages",
            get: function get() {
                return this.sync().messages;
            }
        },
        {
            key: "opts",
            get: function get() {
                return this.result.opts;
            }
        },
        {
            key: "processor",
            get: function get() {
                return this.result.processor;
            }
        },
        {
            key: "root",
            get: function get() {
                return this.sync().root;
            }
        },
        {
            key: Symbol.toStringTag,
            get: function get() {
                return "LazyResult";
            }
        }
    ]);
    return LazyResult;
}();
LazyResult$2$1.registerPostcss = function(dependant) {
    postcss$2$1 = dependant;
};
var lazyResult$1 = LazyResult$2$1;
LazyResult$2$1.default = LazyResult$2$1;
Root$3$1.registerLazyResult(LazyResult$2$1);
Document$2$1.registerLazyResult(LazyResult$2$1);
var MapGenerator2$1 = mapGenerator$1;
var stringify$1$1 = stringify_1$1;
var warnOnce2$1 = warnOnce$2$1;
var parse$1$1 = parse_1$1;
var Result$1$1 = result$1;
var NoWorkResult$1$1 = /*#__PURE__*/ function() {
    function NoWorkResult(processor2, css, opts) {
        css = css.toString();
        this.stringified = false;
        this._processor = processor2;
        this._css = css;
        this._opts = opts;
        this._map = void 0;
        var root2;
        var str = stringify$1$1;
        this.result = new Result$1$1(this._processor, root2, this._opts);
        this.result.css = css;
        var self = this;
        Object.defineProperty(this.result, "root", {
            get: function get() {
                return self.root;
            }
        });
        var map = new MapGenerator2$1(str, root2, this._opts, css);
        if (map.isMap()) {
            var _map_generate = map.generate(), generatedCSS = _map_generate[0], generatedMap = _map_generate[1];
            if (generatedCSS) {
                this.result.css = generatedCSS;
            }
            if (generatedMap) {
                this.result.map = generatedMap;
            }
        } else {
            map.clearAnnotation();
            this.result.css = map.css;
        }
    }
    var _proto = NoWorkResult.prototype;
    _proto.async = function async() {
        if (this.error) return Promise.reject(this.error);
        return Promise.resolve(this.result);
    };
    _proto.catch = function _catch(onRejected) {
        return this.async().catch(onRejected);
    };
    _proto.finally = function _finally(onFinally) {
        return this.async().then(onFinally, onFinally);
    };
    _proto.sync = function sync() {
        if (this.error) throw this.error;
        return this.result;
    };
    _proto.then = function then(onFulfilled, onRejected) {
        if (process.env.NODE_ENV !== "production") {
            if (!("from" in this._opts)) {
                warnOnce2$1("Without `from` option PostCSS could generate wrong source map and will not find Browserslist config. Set it to CSS file path or to `undefined` to prevent this warning.");
            }
        }
        return this.async().then(onFulfilled, onRejected);
    };
    _proto.toString = function toString() {
        return this._css;
    };
    _proto.warnings = function warnings() {
        return [];
    };
    _create_class(NoWorkResult, [
        {
            key: "content",
            get: function get() {
                return this.result.css;
            }
        },
        {
            key: "css",
            get: function get() {
                return this.result.css;
            }
        },
        {
            key: "map",
            get: function get() {
                return this.result.map;
            }
        },
        {
            key: "messages",
            get: function get() {
                return [];
            }
        },
        {
            key: "opts",
            get: function get() {
                return this.result.opts;
            }
        },
        {
            key: "processor",
            get: function get() {
                return this.result.processor;
            }
        },
        {
            key: "root",
            get: function get() {
                if (this._root) {
                    return this._root;
                }
                var root2;
                var parser2 = parse$1$1;
                try {
                    root2 = parser2(this._css, this._opts);
                } catch (error) {
                    this.error = error;
                }
                if (this.error) {
                    throw this.error;
                } else {
                    this._root = root2;
                    return root2;
                }
            }
        },
        {
            key: Symbol.toStringTag,
            get: function get() {
                return "NoWorkResult";
            }
        }
    ]);
    return NoWorkResult;
}();
var noWorkResult$1 = NoWorkResult$1$1;
NoWorkResult$1$1.default = NoWorkResult$1$1;
var NoWorkResult2$1 = noWorkResult$1;
var LazyResult$1$1 = lazyResult$1;
var Document$1$1 = document$1$1;
var Root$2$1 = root$1;
var Processor$1$1 = /*#__PURE__*/ function() {
    function Processor(plugins) {
        if (plugins === void 0) plugins = [];
        this.version = "8.4.38";
        this.plugins = this.normalize(plugins);
    }
    var _proto = Processor.prototype;
    _proto.normalize = function normalize(plugins) {
        var normalized = [];
        for(var _iterator = _create_for_of_iterator_helper_loose(plugins), _step; !(_step = _iterator()).done;){
            var i2 = _step.value;
            if (i2.postcss === true) {
                i2 = i2();
            } else if (i2.postcss) {
                i2 = i2.postcss;
            }
            if ((typeof i2 === "undefined" ? "undefined" : _type_of(i2)) === "object" && Array.isArray(i2.plugins)) {
                normalized = normalized.concat(i2.plugins);
            } else if ((typeof i2 === "undefined" ? "undefined" : _type_of(i2)) === "object" && i2.postcssPlugin) {
                normalized.push(i2);
            } else if (typeof i2 === "function") {
                normalized.push(i2);
            } else if ((typeof i2 === "undefined" ? "undefined" : _type_of(i2)) === "object" && (i2.parse || i2.stringify)) {
                if (process.env.NODE_ENV !== "production") {
                    throw new Error("PostCSS syntaxes cannot be used as plugins. Instead, please use one of the syntax/parser/stringifier options as outlined in your PostCSS runner documentation.");
                }
            } else {
                throw new Error(i2 + " is not a PostCSS plugin");
            }
        }
        return normalized;
    };
    _proto.process = function process1(css, opts) {
        if (opts === void 0) opts = {};
        if (!this.plugins.length && !opts.parser && !opts.stringifier && !opts.syntax) {
            return new NoWorkResult2$1(this, css, opts);
        } else {
            return new LazyResult$1$1(this, css, opts);
        }
    };
    _proto.use = function use(plugin22) {
        this.plugins = this.plugins.concat(this.normalize([
            plugin22
        ]));
        return this;
    };
    return Processor;
}();
var processor$1 = Processor$1$1;
Processor$1$1.default = Processor$1$1;
Root$2$1.registerProcessor(Processor$1$1);
Document$1$1.registerProcessor(Processor$1$1);
var Declaration$1$1 = declaration$1;
var PreviousMap2$1 = previousMap$1;
var Comment$1$1 = comment$1;
var AtRule$1$1 = atRule$1;
var Input$1$1 = input$1;
var Root$1$1 = root$1;
var Rule$1$1 = rule$1;
function fromJSON$1$1(json, inputs) {
    if (Array.isArray(json)) return json.map(function(n2) {
        return fromJSON$1$1(n2);
    });
    var ownInputs = json.inputs, defaults = _object_without_properties_loose(json, [
        "inputs"
    ]);
    if (ownInputs) {
        inputs = [];
        for(var _iterator = _create_for_of_iterator_helper_loose(ownInputs), _step; !(_step = _iterator()).done;){
            var input2 = _step.value;
            var inputHydrated = _extends({}, input2, {
                __proto__: Input$1$1.prototype
            });
            if (inputHydrated.map) {
                inputHydrated.map = _extends({}, inputHydrated.map, {
                    __proto__: PreviousMap2$1.prototype
                });
            }
            inputs.push(inputHydrated);
        }
    }
    if (defaults.nodes) {
        defaults.nodes = json.nodes.map(function(n2) {
            return fromJSON$1$1(n2, inputs);
        });
    }
    if (defaults.source) {
        var _defaults_source = defaults.source, inputId = _defaults_source.inputId, source = _object_without_properties_loose(_defaults_source, [
            "inputId"
        ]);
        defaults.source = source;
        if (inputId != null) {
            defaults.source.input = inputs[inputId];
        }
    }
    if (defaults.type === "root") {
        return new Root$1$1(defaults);
    } else if (defaults.type === "decl") {
        return new Declaration$1$1(defaults);
    } else if (defaults.type === "rule") {
        return new Rule$1$1(defaults);
    } else if (defaults.type === "comment") {
        return new Comment$1$1(defaults);
    } else if (defaults.type === "atrule") {
        return new AtRule$1$1(defaults);
    } else {
        throw new Error("Unknown node type: " + json.type);
    }
}
var fromJSON_1$1 = fromJSON$1$1;
fromJSON$1$1.default = fromJSON$1$1;
var CssSyntaxError2$1 = cssSyntaxError$1;
var Declaration2$1 = declaration$1;
var LazyResult2$1 = lazyResult$1;
var Container2$1 = container$1;
var Processor2$1 = processor$1;
var stringify$5$1 = stringify_1$1;
var fromJSON$2 = fromJSON_1$1;
var Document22 = document$1$1;
var Warning2$1 = warning$1;
var Comment2$1 = comment$1;
var AtRule2$1 = atRule$1;
var Result2$1 = result$1;
var Input2$1 = input$1;
var parse$5 = parse_1$1;
var list$3 = list_1$1;
var Rule2$1 = rule$1;
var Root2$1 = root$1;
var Node2$1 = node$1;
function postcss$3() {
    for(var _len = arguments.length, plugins = new Array(_len), _key = 0; _key < _len; _key++){
        plugins[_key] = arguments[_key];
    }
    if (plugins.length === 1 && Array.isArray(plugins[0])) {
        plugins = plugins[0];
    }
    return new Processor2$1(plugins);
}
postcss$3.plugin = function plugin(name, initializer) {
    var warningPrinted = false;
    function creator() {
        for(var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++){
            args[_key] = arguments[_key];
        }
        if (console && console.warn && !warningPrinted) {
            warningPrinted = true;
            console.warn(name + ": postcss.plugin was deprecated. Migration guide:\nhttps://evilmartians.com/chronicles/postcss-8-plugin-migration");
            if (process.env.LANG && process.env.LANG.startsWith("cn")) {
                console.warn(name + ": 里面 postcss.plugin 被弃用. 迁移指南:\nhttps://www.w3ctech.com/topic/2226");
            }
        }
        var transformer = initializer.apply(void 0, [].concat(args));
        transformer.postcssPlugin = name;
        transformer.postcssVersion = new Processor2$1().version;
        return transformer;
    }
    var cache;
    Object.defineProperty(creator, "postcss", {
        get: function get() {
            if (!cache) cache = creator();
            return cache;
        }
    });
    creator.process = function(css, processOpts, pluginOpts) {
        return postcss$3([
            creator(pluginOpts)
        ]).process(css, processOpts);
    };
    return creator;
};
postcss$3.stringify = stringify$5$1;
postcss$3.parse = parse$5;
postcss$3.fromJSON = fromJSON$2;
postcss$3.list = list$3;
postcss$3.comment = function(defaults) {
    return new Comment2$1(defaults);
};
postcss$3.atRule = function(defaults) {
    return new AtRule2$1(defaults);
};
postcss$3.decl = function(defaults) {
    return new Declaration2$1(defaults);
};
postcss$3.rule = function(defaults) {
    return new Rule2$1(defaults);
};
postcss$3.root = function(defaults) {
    return new Root2$1(defaults);
};
postcss$3.document = function(defaults) {
    return new Document22(defaults);
};
postcss$3.CssSyntaxError = CssSyntaxError2$1;
postcss$3.Declaration = Declaration2$1;
postcss$3.Container = Container2$1;
postcss$3.Processor = Processor2$1;
postcss$3.Document = Document22;
postcss$3.Comment = Comment2$1;
postcss$3.Warning = Warning2$1;
postcss$3.AtRule = AtRule2$1;
postcss$3.Result = Result2$1;
postcss$3.Input = Input2$1;
postcss$3.Rule = Rule2$1;
postcss$3.Root = Root2$1;
postcss$3.Node = Node2$1;
LazyResult2$1.registerPostcss(postcss$3);
var postcss_1$1 = postcss$3;
postcss$3.default = postcss$3;
var postcss$1$1 = /* @__PURE__ */ getDefaultExportFromCjs$1(postcss_1$1);
postcss$1$1.stringify;
postcss$1$1.fromJSON;
postcss$1$1.plugin;
postcss$1$1.parse;
postcss$1$1.list;
postcss$1$1.document;
postcss$1$1.comment;
postcss$1$1.atRule;
postcss$1$1.rule;
postcss$1$1.decl;
postcss$1$1.root;
postcss$1$1.CssSyntaxError;
postcss$1$1.Declaration;
postcss$1$1.Container;
postcss$1$1.Processor;
postcss$1$1.Document;
postcss$1$1.Comment;
postcss$1$1.Warning;
postcss$1$1.AtRule;
postcss$1$1.Result;
postcss$1$1.Input;
postcss$1$1.Rule;
postcss$1$1.Root;
postcss$1$1.Node;
var __defProp2 = Object.defineProperty;
var __defNormalProp2 = function(obj, key, value) {
    return key in obj ? __defProp2(obj, key, {
        enumerable: true,
        configurable: true,
        writable: true,
        value: value
    }) : obj[key] = value;
};
var __publicField2 = function(obj, key, value) {
    return __defNormalProp2(obj, (typeof key === "undefined" ? "undefined" : _type_of(key)) !== "symbol" ? key + "" : key, value);
};
function getDefaultExportFromCjs$2(x2) {
    return x2 && x2.__esModule && Object.prototype.hasOwnProperty.call(x2, "default") ? x2["default"] : x2;
}
function getAugmentedNamespace$2(n2) {
    if (n2.__esModule) return n2;
    var f2 = n2.default;
    if (typeof f2 == "function") {
        var a2 = function a22() {
            if (_instanceof(this, a22)) {
                return Reflect.construct(f2, arguments, this.constructor);
            }
            return f2.apply(this, arguments);
        };
        a2.prototype = f2.prototype;
    } else a2 = {};
    Object.defineProperty(a2, "__esModule", {
        value: true
    });
    Object.keys(n2).forEach(function(k) {
        var d = Object.getOwnPropertyDescriptor(n2, k);
        Object.defineProperty(a2, k, d.get ? d : {
            enumerable: true,
            get: function get() {
                return n2[k];
            }
        });
    });
    return a2;
}
var picocolors_browser$2 = {
    exports: {}
};
var x$2 = String;
var create$2 = function create$2() {
    return {
        isColorSupported: false,
        reset: x$2,
        bold: x$2,
        dim: x$2,
        italic: x$2,
        underline: x$2,
        inverse: x$2,
        hidden: x$2,
        strikethrough: x$2,
        black: x$2,
        red: x$2,
        green: x$2,
        yellow: x$2,
        blue: x$2,
        magenta: x$2,
        cyan: x$2,
        white: x$2,
        gray: x$2,
        bgBlack: x$2,
        bgRed: x$2,
        bgGreen: x$2,
        bgYellow: x$2,
        bgBlue: x$2,
        bgMagenta: x$2,
        bgCyan: x$2,
        bgWhite: x$2
    };
};
picocolors_browser$2.exports = create$2();
picocolors_browser$2.exports.createColors = create$2;
var picocolors_browserExports$2 = picocolors_browser$2.exports;
var __viteBrowserExternal$3 = {};
var __viteBrowserExternal$1$2 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
    __proto__: null,
    default: __viteBrowserExternal$3
}, Symbol.toStringTag, {
    value: "Module"
}));
var require$$2$2 = /* @__PURE__ */ getAugmentedNamespace$2(__viteBrowserExternal$1$2);
var pico$2 = picocolors_browserExports$2;
var terminalHighlight$1$2 = require$$2$2;
var CssSyntaxError$3$2 = /*#__PURE__*/ function(Error1) {
    _inherits(CssSyntaxError2, Error1);
    function CssSyntaxError2(message, line, column, source, file, plugin22) {
        var _this;
        _this = Error1.call(this, message) || this;
        _this.name = "CssSyntaxError";
        _this.reason = message;
        if (file) {
            _this.file = file;
        }
        if (source) {
            _this.source = source;
        }
        if (plugin22) {
            _this.plugin = plugin22;
        }
        if (typeof line !== "undefined" && typeof column !== "undefined") {
            if (typeof line === "number") {
                _this.line = line;
                _this.column = column;
            } else {
                _this.line = line.line;
                _this.column = line.column;
                _this.endLine = column.line;
                _this.endColumn = column.column;
            }
        }
        _this.setMessage();
        if (Error.captureStackTrace) {
            Error.captureStackTrace(_this, CssSyntaxError2);
        }
        return _this;
    }
    var _proto = CssSyntaxError2.prototype;
    _proto.setMessage = function setMessage() {
        this.message = this.plugin ? this.plugin + ": " : "";
        this.message += this.file ? this.file : "<css input>";
        if (typeof this.line !== "undefined") {
            this.message += ":" + this.line + ":" + this.column;
        }
        this.message += ": " + this.reason;
    };
    _proto.showSourceCode = function showSourceCode(color) {
        var _this = this;
        if (!this.source) return "";
        var css = this.source;
        if (color == null) color = pico$2.isColorSupported;
        if (terminalHighlight$1$2) {
            if (color) css = terminalHighlight$1$2(css);
        }
        var lines = css.split(/\r?\n/);
        var start = Math.max(this.line - 3, 0);
        var end = Math.min(this.line + 2, lines.length);
        var maxWidth = String(end).length;
        var mark, aside;
        if (color) {
            var _pico$2_createColors = pico$2.createColors(true), bold = _pico$2_createColors.bold, gray = _pico$2_createColors.gray, red = _pico$2_createColors.red;
            mark = function(text) {
                return bold(red(text));
            };
            aside = function(text) {
                return gray(text);
            };
        } else {
            mark = aside = function(str) {
                return str;
            };
        }
        return lines.slice(start, end).map(function(line, index2) {
            var number = start + 1 + index2;
            var gutter = " " + (" " + number).slice(-maxWidth) + " | ";
            if (number === _this.line) {
                var spacing = aside(gutter.replace(/\d/g, " ")) + line.slice(0, _this.column - 1).replace(/[^\t]/g, " ");
                return mark(">") + aside(gutter) + line + "\n " + spacing + mark("^");
            }
            return " " + aside(gutter) + line;
        }).join("\n");
    };
    _proto.toString = function toString() {
        var code = this.showSourceCode();
        if (code) {
            code = "\n\n" + code + "\n";
        }
        return this.name + ": " + this.message + code;
    };
    return CssSyntaxError2;
}(_wrap_native_super(Error));
var cssSyntaxError$2 = CssSyntaxError$3$2;
CssSyntaxError$3$2.default = CssSyntaxError$3$2;
var symbols$2 = {};
symbols$2.isClean = Symbol("isClean");
symbols$2.my = Symbol("my");
var DEFAULT_RAW$2 = {
    after: "\n",
    beforeClose: "\n",
    beforeComment: "\n",
    beforeDecl: "\n",
    beforeOpen: " ",
    beforeRule: "\n",
    colon: ": ",
    commentLeft: " ",
    commentRight: " ",
    emptyBody: "",
    indent: "    ",
    semicolon: false
};
function capitalize$2(str) {
    return str[0].toUpperCase() + str.slice(1);
}
var Stringifier$2$2 = /*#__PURE__*/ function() {
    function Stringifier2(builder) {
        this.builder = builder;
    }
    var _proto = Stringifier2.prototype;
    _proto.atrule = function atrule(node2, semicolon) {
        var name = "@" + node2.name;
        var params = node2.params ? this.rawValue(node2, "params") : "";
        if (typeof node2.raws.afterName !== "undefined") {
            name += node2.raws.afterName;
        } else if (params) {
            name += " ";
        }
        if (node2.nodes) {
            this.block(node2, name + params);
        } else {
            var end = (node2.raws.between || "") + (semicolon ? ";" : "");
            this.builder(name + params + end, node2);
        }
    };
    _proto.beforeAfter = function beforeAfter(node2, detect) {
        var value;
        if (node2.type === "decl") {
            value = this.raw(node2, null, "beforeDecl");
        } else if (node2.type === "comment") {
            value = this.raw(node2, null, "beforeComment");
        } else if (detect === "before") {
            value = this.raw(node2, null, "beforeRule");
        } else {
            value = this.raw(node2, null, "beforeClose");
        }
        var buf = node2.parent;
        var depth = 0;
        while(buf && buf.type !== "root"){
            depth += 1;
            buf = buf.parent;
        }
        if (value.includes("\n")) {
            var indent = this.raw(node2, null, "indent");
            if (indent.length) {
                for(var step = 0; step < depth; step++)value += indent;
            }
        }
        return value;
    };
    _proto.block = function block(node2, start) {
        var between = this.raw(node2, "between", "beforeOpen");
        this.builder(start + between + "{", node2, "start");
        var after;
        if (node2.nodes && node2.nodes.length) {
            this.body(node2);
            after = this.raw(node2, "after");
        } else {
            after = this.raw(node2, "after", "emptyBody");
        }
        if (after) this.builder(after);
        this.builder("}", node2, "end");
    };
    _proto.body = function body(node2) {
        var last = node2.nodes.length - 1;
        while(last > 0){
            if (node2.nodes[last].type !== "comment") break;
            last -= 1;
        }
        var semicolon = this.raw(node2, "semicolon");
        for(var i2 = 0; i2 < node2.nodes.length; i2++){
            var child = node2.nodes[i2];
            var before = this.raw(child, "before");
            if (before) this.builder(before);
            this.stringify(child, last !== i2 || semicolon);
        }
    };
    _proto.comment = function comment(node2) {
        var left = this.raw(node2, "left", "commentLeft");
        var right = this.raw(node2, "right", "commentRight");
        this.builder("/*" + left + node2.text + right + "*/", node2);
    };
    _proto.decl = function decl(node2, semicolon) {
        var between = this.raw(node2, "between", "colon");
        var string = node2.prop + between + this.rawValue(node2, "value");
        if (node2.important) {
            string += node2.raws.important || " !important";
        }
        if (semicolon) string += ";";
        this.builder(string, node2);
    };
    _proto.document = function document1(node2) {
        this.body(node2);
    };
    _proto.raw = function raw(node2, own, detect) {
        var value;
        if (!detect) detect = own;
        if (own) {
            value = node2.raws[own];
            if (typeof value !== "undefined") return value;
        }
        var parent = node2.parent;
        if (detect === "before") {
            if (!parent || parent.type === "root" && parent.first === node2) {
                return "";
            }
            if (parent && parent.type === "document") {
                return "";
            }
        }
        if (!parent) return DEFAULT_RAW$2[detect];
        var root2 = node2.root();
        if (!root2.rawCache) root2.rawCache = {};
        if (typeof root2.rawCache[detect] !== "undefined") {
            return root2.rawCache[detect];
        }
        if (detect === "before" || detect === "after") {
            return this.beforeAfter(node2, detect);
        } else {
            var method = "raw" + capitalize$2(detect);
            if (this[method]) {
                value = this[method](root2, node2);
            } else {
                root2.walk(function(i2) {
                    value = i2.raws[own];
                    if (typeof value !== "undefined") return false;
                });
            }
        }
        if (typeof value === "undefined") value = DEFAULT_RAW$2[detect];
        root2.rawCache[detect] = value;
        return value;
    };
    _proto.rawBeforeClose = function rawBeforeClose(root2) {
        var value;
        root2.walk(function(i2) {
            if (i2.nodes && i2.nodes.length > 0) {
                if (typeof i2.raws.after !== "undefined") {
                    value = i2.raws.after;
                    if (value.includes("\n")) {
                        value = value.replace(/[^\n]+$/, "");
                    }
                    return false;
                }
            }
        });
        if (value) value = value.replace(/\S/g, "");
        return value;
    };
    _proto.rawBeforeComment = function rawBeforeComment(root2, node2) {
        var value;
        root2.walkComments(function(i2) {
            if (typeof i2.raws.before !== "undefined") {
                value = i2.raws.before;
                if (value.includes("\n")) {
                    value = value.replace(/[^\n]+$/, "");
                }
                return false;
            }
        });
        if (typeof value === "undefined") {
            value = this.raw(node2, null, "beforeDecl");
        } else if (value) {
            value = value.replace(/\S/g, "");
        }
        return value;
    };
    _proto.rawBeforeDecl = function rawBeforeDecl(root2, node2) {
        var value;
        root2.walkDecls(function(i2) {
            if (typeof i2.raws.before !== "undefined") {
                value = i2.raws.before;
                if (value.includes("\n")) {
                    value = value.replace(/[^\n]+$/, "");
                }
                return false;
            }
        });
        if (typeof value === "undefined") {
            value = this.raw(node2, null, "beforeRule");
        } else if (value) {
            value = value.replace(/\S/g, "");
        }
        return value;
    };
    _proto.rawBeforeOpen = function rawBeforeOpen(root2) {
        var value;
        root2.walk(function(i2) {
            if (i2.type !== "decl") {
                value = i2.raws.between;
                if (typeof value !== "undefined") return false;
            }
        });
        return value;
    };
    _proto.rawBeforeRule = function rawBeforeRule(root2) {
        var value;
        root2.walk(function(i2) {
            if (i2.nodes && (i2.parent !== root2 || root2.first !== i2)) {
                if (typeof i2.raws.before !== "undefined") {
                    value = i2.raws.before;
                    if (value.includes("\n")) {
                        value = value.replace(/[^\n]+$/, "");
                    }
                    return false;
                }
            }
        });
        if (value) value = value.replace(/\S/g, "");
        return value;
    };
    _proto.rawColon = function rawColon(root2) {
        var value;
        root2.walkDecls(function(i2) {
            if (typeof i2.raws.between !== "undefined") {
                value = i2.raws.between.replace(/[^\s:]/g, "");
                return false;
            }
        });
        return value;
    };
    _proto.rawEmptyBody = function rawEmptyBody(root2) {
        var value;
        root2.walk(function(i2) {
            if (i2.nodes && i2.nodes.length === 0) {
                value = i2.raws.after;
                if (typeof value !== "undefined") return false;
            }
        });
        return value;
    };
    _proto.rawIndent = function rawIndent(root2) {
        if (root2.raws.indent) return root2.raws.indent;
        var value;
        root2.walk(function(i2) {
            var p = i2.parent;
            if (p && p !== root2 && p.parent && p.parent === root2) {
                if (typeof i2.raws.before !== "undefined") {
                    var parts = i2.raws.before.split("\n");
                    value = parts[parts.length - 1];
                    value = value.replace(/\S/g, "");
                    return false;
                }
            }
        });
        return value;
    };
    _proto.rawSemicolon = function rawSemicolon(root2) {
        var value;
        root2.walk(function(i2) {
            if (i2.nodes && i2.nodes.length && i2.last.type === "decl") {
                value = i2.raws.semicolon;
                if (typeof value !== "undefined") return false;
            }
        });
        return value;
    };
    _proto.rawValue = function rawValue(node2, prop) {
        var value = node2[prop];
        var raw = node2.raws[prop];
        if (raw && raw.value === value) {
            return raw.raw;
        }
        return value;
    };
    _proto.root = function root(node2) {
        this.body(node2);
        if (node2.raws.after) this.builder(node2.raws.after);
    };
    _proto.rule = function rule(node2) {
        this.block(node2, this.rawValue(node2, "selector"));
        if (node2.raws.ownSemicolon) {
            this.builder(node2.raws.ownSemicolon, node2, "end");
        }
    };
    _proto.stringify = function stringify(node2, semicolon) {
        if (!this[node2.type]) {
            throw new Error("Unknown AST node type " + node2.type + ". Maybe you need to change PostCSS stringifier.");
        }
        this[node2.type](node2, semicolon);
    };
    return Stringifier2;
}();
var stringifier$2 = Stringifier$2$2;
Stringifier$2$2.default = Stringifier$2$2;
var Stringifier$1$2 = stringifier$2;
function stringify$4$2(node2, builder) {
    var str = new Stringifier$1$2(builder);
    str.stringify(node2);
}
var stringify_1$2 = stringify$4$2;
stringify$4$2.default = stringify$4$2;
var isClean$2$2 = symbols$2.isClean, my$2$2 = symbols$2.my;
var CssSyntaxError$2$2 = cssSyntaxError$2;
var Stringifier22 = stringifier$2;
var stringify$3$2 = stringify_1$2;
function cloneNode$2(obj, parent) {
    var cloned = new obj.constructor();
    for(var i2 in obj){
        if (!Object.prototype.hasOwnProperty.call(obj, i2)) {
            continue;
        }
        if (i2 === "proxyCache") continue;
        var value = obj[i2];
        var type = typeof value === "undefined" ? "undefined" : _type_of(value);
        if (i2 === "parent" && type === "object") {
            if (parent) cloned[i2] = parent;
        } else if (i2 === "source") {
            cloned[i2] = value;
        } else if (Array.isArray(value)) {
            cloned[i2] = value.map(function(j) {
                return cloneNode$2(j, cloned);
            });
        } else {
            if (type === "object" && value !== null) value = cloneNode$2(value);
            cloned[i2] = value;
        }
    }
    return cloned;
}
var Node$4$2 = /*#__PURE__*/ function() {
    function Node3(defaults) {
        if (defaults === void 0) defaults = {};
        this.raws = {};
        this[isClean$2$2] = false;
        this[my$2$2] = true;
        for(var name in defaults){
            if (name === "nodes") {
                this.nodes = [];
                for(var _iterator = _create_for_of_iterator_helper_loose(defaults[name]), _step; !(_step = _iterator()).done;){
                    var node2 = _step.value;
                    if (typeof node2.clone === "function") {
                        this.append(node2.clone());
                    } else {
                        this.append(node2);
                    }
                }
            } else {
                this[name] = defaults[name];
            }
        }
    }
    var _proto = Node3.prototype;
    _proto.addToError = function addToError(error) {
        error.postcssNode = this;
        if (error.stack && this.source && /\n\s{4}at /.test(error.stack)) {
            var s2 = this.source;
            error.stack = error.stack.replace(/\n\s{4}at /, "$&" + s2.input.from + ":" + s2.start.line + ":" + s2.start.column + "$&");
        }
        return error;
    };
    _proto.after = function after(add) {
        this.parent.insertAfter(this, add);
        return this;
    };
    _proto.assign = function assign(overrides) {
        if (overrides === void 0) overrides = {};
        for(var name in overrides){
            this[name] = overrides[name];
        }
        return this;
    };
    _proto.before = function before(add) {
        this.parent.insertBefore(this, add);
        return this;
    };
    _proto.cleanRaws = function cleanRaws(keepBetween) {
        delete this.raws.before;
        delete this.raws.after;
        if (!keepBetween) delete this.raws.between;
    };
    _proto.clone = function clone(overrides) {
        if (overrides === void 0) overrides = {};
        var cloned = cloneNode$2(this);
        for(var name in overrides){
            cloned[name] = overrides[name];
        }
        return cloned;
    };
    _proto.cloneAfter = function cloneAfter(overrides) {
        if (overrides === void 0) overrides = {};
        var cloned = this.clone(overrides);
        this.parent.insertAfter(this, cloned);
        return cloned;
    };
    _proto.cloneBefore = function cloneBefore(overrides) {
        if (overrides === void 0) overrides = {};
        var cloned = this.clone(overrides);
        this.parent.insertBefore(this, cloned);
        return cloned;
    };
    _proto.error = function error(message, opts) {
        if (opts === void 0) opts = {};
        if (this.source) {
            var _this_rangeBy = this.rangeBy(opts), end = _this_rangeBy.end, start = _this_rangeBy.start;
            return this.source.input.error(message, {
                column: start.column,
                line: start.line
            }, {
                column: end.column,
                line: end.line
            }, opts);
        }
        return new CssSyntaxError$2$2(message);
    };
    _proto.getProxyProcessor = function getProxyProcessor() {
        return {
            get: function get(node2, prop) {
                if (prop === "proxyOf") {
                    return node2;
                } else if (prop === "root") {
                    return function() {
                        return node2.root().toProxy();
                    };
                } else {
                    return node2[prop];
                }
            },
            set: function set(node2, prop, value) {
                if (node2[prop] === value) return true;
                node2[prop] = value;
                if (prop === "prop" || prop === "value" || prop === "name" || prop === "params" || prop === "important" || /* c8 ignore next */ prop === "text") {
                    node2.markDirty();
                }
                return true;
            }
        };
    };
    _proto.markDirty = function markDirty() {
        if (this[isClean$2$2]) {
            this[isClean$2$2] = false;
            var next = this;
            while(next = next.parent){
                next[isClean$2$2] = false;
            }
        }
    };
    _proto.next = function next() {
        if (!this.parent) return void 0;
        var index2 = this.parent.index(this);
        return this.parent.nodes[index2 + 1];
    };
    _proto.positionBy = function positionBy(opts, stringRepresentation) {
        var pos = this.source.start;
        if (opts.index) {
            pos = this.positionInside(opts.index, stringRepresentation);
        } else if (opts.word) {
            stringRepresentation = this.toString();
            var index2 = stringRepresentation.indexOf(opts.word);
            if (index2 !== -1) pos = this.positionInside(index2, stringRepresentation);
        }
        return pos;
    };
    _proto.positionInside = function positionInside(index2, stringRepresentation) {
        var string = stringRepresentation || this.toString();
        var column = this.source.start.column;
        var line = this.source.start.line;
        for(var i2 = 0; i2 < index2; i2++){
            if (string[i2] === "\n") {
                column = 1;
                line += 1;
            } else {
                column += 1;
            }
        }
        return {
            column: column,
            line: line
        };
    };
    _proto.prev = function prev() {
        if (!this.parent) return void 0;
        var index2 = this.parent.index(this);
        return this.parent.nodes[index2 - 1];
    };
    _proto.rangeBy = function rangeBy(opts) {
        var start = {
            column: this.source.start.column,
            line: this.source.start.line
        };
        var end = this.source.end ? {
            column: this.source.end.column + 1,
            line: this.source.end.line
        } : {
            column: start.column + 1,
            line: start.line
        };
        if (opts.word) {
            var stringRepresentation = this.toString();
            var index2 = stringRepresentation.indexOf(opts.word);
            if (index2 !== -1) {
                start = this.positionInside(index2, stringRepresentation);
                end = this.positionInside(index2 + opts.word.length, stringRepresentation);
            }
        } else {
            if (opts.start) {
                start = {
                    column: opts.start.column,
                    line: opts.start.line
                };
            } else if (opts.index) {
                start = this.positionInside(opts.index);
            }
            if (opts.end) {
                end = {
                    column: opts.end.column,
                    line: opts.end.line
                };
            } else if (typeof opts.endIndex === "number") {
                end = this.positionInside(opts.endIndex);
            } else if (opts.index) {
                end = this.positionInside(opts.index + 1);
            }
        }
        if (end.line < start.line || end.line === start.line && end.column <= start.column) {
            end = {
                column: start.column + 1,
                line: start.line
            };
        }
        return {
            end: end,
            start: start
        };
    };
    _proto.raw = function raw(prop, defaultType) {
        var str = new Stringifier22();
        return str.raw(this, prop, defaultType);
    };
    _proto.remove = function remove() {
        if (this.parent) {
            this.parent.removeChild(this);
        }
        this.parent = void 0;
        return this;
    };
    _proto.replaceWith = function replaceWith() {
        for(var _len = arguments.length, nodes = new Array(_len), _key = 0; _key < _len; _key++){
            nodes[_key] = arguments[_key];
        }
        if (this.parent) {
            var bookmark = this;
            var foundSelf = false;
            for(var _iterator = _create_for_of_iterator_helper_loose(nodes), _step; !(_step = _iterator()).done;){
                var node2 = _step.value;
                if (node2 === this) {
                    foundSelf = true;
                } else if (foundSelf) {
                    this.parent.insertAfter(bookmark, node2);
                    bookmark = node2;
                } else {
                    this.parent.insertBefore(bookmark, node2);
                }
            }
            if (!foundSelf) {
                this.remove();
            }
        }
        return this;
    };
    _proto.root = function root() {
        var result2 = this;
        while(result2.parent && result2.parent.type !== "document"){
            result2 = result2.parent;
        }
        return result2;
    };
    _proto.toJSON = function toJSON(_, inputs) {
        var fixed = {};
        var emitInputs = inputs == null;
        inputs = inputs || /* @__PURE__ */ new Map();
        var inputsNextIndex = 0;
        for(var name in this){
            if (!Object.prototype.hasOwnProperty.call(this, name)) {
                continue;
            }
            if (name === "parent" || name === "proxyCache") continue;
            var value = this[name];
            if (Array.isArray(value)) {
                fixed[name] = value.map(function(i2) {
                    if ((typeof i2 === "undefined" ? "undefined" : _type_of(i2)) === "object" && i2.toJSON) {
                        return i2.toJSON(null, inputs);
                    } else {
                        return i2;
                    }
                });
            } else if ((typeof value === "undefined" ? "undefined" : _type_of(value)) === "object" && value.toJSON) {
                fixed[name] = value.toJSON(null, inputs);
            } else if (name === "source") {
                var inputId = inputs.get(value.input);
                if (inputId == null) {
                    inputId = inputsNextIndex;
                    inputs.set(value.input, inputsNextIndex);
                    inputsNextIndex++;
                }
                fixed[name] = {
                    end: value.end,
                    inputId: inputId,
                    start: value.start
                };
            } else {
                fixed[name] = value;
            }
        }
        if (emitInputs) {
            fixed.inputs = [].concat(inputs.keys()).map(function(input2) {
                return input2.toJSON();
            });
        }
        return fixed;
    };
    _proto.toProxy = function toProxy() {
        if (!this.proxyCache) {
            this.proxyCache = new Proxy(this, this.getProxyProcessor());
        }
        return this.proxyCache;
    };
    _proto.toString = function toString(stringifier2) {
        if (stringifier2 === void 0) stringifier2 = stringify$3$2;
        if (stringifier2.stringify) stringifier2 = stringifier2.stringify;
        var result2 = "";
        stringifier2(this, function(i2) {
            result2 += i2;
        });
        return result2;
    };
    _proto.warn = function warn(result2, text, opts) {
        var data = {
            node: this
        };
        for(var i2 in opts)data[i2] = opts[i2];
        return result2.warn(text, data);
    };
    _create_class(Node3, [
        {
            key: "proxyOf",
            get: function get() {
                return this;
            }
        }
    ]);
    return Node3;
}();
var node$2 = Node$4$2;
Node$4$2.default = Node$4$2;
var Node$3$2 = node$2;
var Declaration$4$2 = /*#__PURE__*/ function(Node$3$2) {
    _inherits(Declaration2, Node$3$2);
    function Declaration2(defaults) {
        var _this;
        if (defaults && typeof defaults.value !== "undefined" && typeof defaults.value !== "string") {
            defaults = _extends({}, defaults, {
                value: String(defaults.value)
            });
        }
        _this = Node$3$2.call(this, defaults) || this;
        _this.type = "decl";
        return _this;
    }
    _create_class(Declaration2, [
        {
            key: "variable",
            get: function get() {
                return this.prop.startsWith("--") || this.prop[0] === "$";
            }
        }
    ]);
    return Declaration2;
}(Node$3$2);
var declaration$2 = Declaration$4$2;
Declaration$4$2.default = Declaration$4$2;
var urlAlphabet$2 = "useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict";
var nanoid$1$2 = function(size) {
    if (size === void 0) size = 21;
    var id = "";
    var i2 = size;
    while(i2--){
        id += urlAlphabet$2[Math.random() * 64 | 0];
    }
    return id;
};
var nonSecure$2 = {
    nanoid: nanoid$1$2
};
var SourceMapConsumer$2$2 = require$$2$2.SourceMapConsumer, SourceMapGenerator$2$2 = require$$2$2.SourceMapGenerator;
var existsSync$2 = require$$2$2.existsSync, readFileSync$2 = require$$2$2.readFileSync;
var dirname$1$2 = require$$2$2.dirname, join$2 = require$$2$2.join;
function fromBase64$2(str) {
    if (Buffer) {
        return Buffer.from(str, "base64").toString();
    } else {
        return window.atob(str);
    }
}
var PreviousMap$2$2 = /*#__PURE__*/ function() {
    function PreviousMap2(css, opts) {
        if (opts.map === false) return;
        this.loadAnnotation(css);
        this.inline = this.startWith(this.annotation, "data:");
        var prev = opts.map ? opts.map.prev : void 0;
        var text = this.loadMap(opts.from, prev);
        if (!this.mapFile && opts.from) {
            this.mapFile = opts.from;
        }
        if (this.mapFile) this.root = dirname$1$2(this.mapFile);
        if (text) this.text = text;
    }
    var _proto = PreviousMap2.prototype;
    _proto.consumer = function consumer() {
        if (!this.consumerCache) {
            this.consumerCache = new SourceMapConsumer$2$2(this.text);
        }
        return this.consumerCache;
    };
    _proto.decodeInline = function decodeInline(text) {
        var baseCharsetUri = /^data:application\/json;charset=utf-?8;base64,/;
        var baseUri = /^data:application\/json;base64,/;
        var charsetUri = /^data:application\/json;charset=utf-?8,/;
        var uri = /^data:application\/json,/;
        if (charsetUri.test(text) || uri.test(text)) {
            return decodeURIComponent(text.substr(RegExp.lastMatch.length));
        }
        if (baseCharsetUri.test(text) || baseUri.test(text)) {
            return fromBase64$2(text.substr(RegExp.lastMatch.length));
        }
        var encoding = text.match(/data:application\/json;([^,]+),/)[1];
        throw new Error("Unsupported source map encoding " + encoding);
    };
    _proto.getAnnotationURL = function getAnnotationURL(sourceMapString) {
        return sourceMapString.replace(/^\/\*\s*# sourceMappingURL=/, "").trim();
    };
    _proto.isMap = function isMap(map) {
        if ((typeof map === "undefined" ? "undefined" : _type_of(map)) !== "object") return false;
        return typeof map.mappings === "string" || typeof map._mappings === "string" || Array.isArray(map.sections);
    };
    _proto.loadAnnotation = function loadAnnotation(css) {
        var comments = css.match(/\/\*\s*# sourceMappingURL=/gm);
        if (!comments) return;
        var start = css.lastIndexOf(comments.pop());
        var end = css.indexOf("*/", start);
        if (start > -1 && end > -1) {
            this.annotation = this.getAnnotationURL(css.substring(start, end));
        }
    };
    _proto.loadFile = function loadFile(path) {
        this.root = dirname$1$2(path);
        if (existsSync$2(path)) {
            this.mapFile = path;
            return readFileSync$2(path, "utf-8").toString().trim();
        }
    };
    _proto.loadMap = function loadMap(file, prev) {
        if (prev === false) return false;
        if (prev) {
            if (typeof prev === "string") {
                return prev;
            } else if (typeof prev === "function") {
                var prevPath = prev(file);
                if (prevPath) {
                    var map = this.loadFile(prevPath);
                    if (!map) {
                        throw new Error("Unable to load previous source map: " + prevPath.toString());
                    }
                    return map;
                }
            } else if (_instanceof(prev, SourceMapConsumer$2$2)) {
                return SourceMapGenerator$2$2.fromSourceMap(prev).toString();
            } else if (_instanceof(prev, SourceMapGenerator$2$2)) {
                return prev.toString();
            } else if (this.isMap(prev)) {
                return JSON.stringify(prev);
            } else {
                throw new Error("Unsupported previous source map format: " + prev.toString());
            }
        } else if (this.inline) {
            return this.decodeInline(this.annotation);
        } else if (this.annotation) {
            var map1 = this.annotation;
            if (file) map1 = join$2(dirname$1$2(file), map1);
            return this.loadFile(map1);
        }
    };
    _proto.startWith = function startWith(string, start) {
        if (!string) return false;
        return string.substr(0, start.length) === start;
    };
    _proto.withContent = function withContent() {
        return !!(this.consumer().sourcesContent && this.consumer().sourcesContent.length > 0);
    };
    return PreviousMap2;
}();
var previousMap$2 = PreviousMap$2$2;
PreviousMap$2$2.default = PreviousMap$2$2;
var SourceMapConsumer$1$2 = require$$2$2.SourceMapConsumer, SourceMapGenerator$1$2 = require$$2$2.SourceMapGenerator;
var fileURLToPath$2 = require$$2$2.fileURLToPath, pathToFileURL$1$2 = require$$2$2.pathToFileURL;
var isAbsolute$2 = require$$2$2.isAbsolute, resolve$1$2 = require$$2$2.resolve;
var nanoid$3 = nonSecure$2.nanoid;
var terminalHighlight$3 = require$$2$2;
var CssSyntaxError$1$2 = cssSyntaxError$2;
var PreviousMap$1$2 = previousMap$2;
var fromOffsetCache$2 = Symbol("fromOffsetCache");
var sourceMapAvailable$1$2 = Boolean(SourceMapConsumer$1$2 && SourceMapGenerator$1$2);
var pathAvailable$1$2 = Boolean(resolve$1$2 && isAbsolute$2);
var Input$4$2 = /*#__PURE__*/ function() {
    function Input2(css, opts) {
        if (opts === void 0) opts = {};
        if (css === null || typeof css === "undefined" || (typeof css === "undefined" ? "undefined" : _type_of(css)) === "object" && !css.toString) {
            throw new Error("PostCSS received " + css + " instead of CSS string");
        }
        this.css = css.toString();
        if (this.css[0] === "\uFEFF" || this.css[0] === "￾") {
            this.hasBOM = true;
            this.css = this.css.slice(1);
        } else {
            this.hasBOM = false;
        }
        if (opts.from) {
            if (!pathAvailable$1$2 || /^\w+:\/\//.test(opts.from) || isAbsolute$2(opts.from)) {
                this.file = opts.from;
            } else {
                this.file = resolve$1$2(opts.from);
            }
        }
        if (pathAvailable$1$2 && sourceMapAvailable$1$2) {
            var map = new PreviousMap$1$2(this.css, opts);
            if (map.text) {
                this.map = map;
                var file = map.consumer().file;
                if (!this.file && file) this.file = this.mapResolve(file);
            }
        }
        if (!this.file) {
            this.id = "<input css " + nanoid$3(6) + ">";
        }
        if (this.map) this.map.file = this.from;
    }
    var _proto = Input2.prototype;
    _proto.error = function error(message, line, column, opts) {
        if (opts === void 0) opts = {};
        var result2, endLine, endColumn;
        if (line && (typeof line === "undefined" ? "undefined" : _type_of(line)) === "object") {
            var start = line;
            var end = column;
            if (typeof start.offset === "number") {
                var pos = this.fromOffset(start.offset);
                line = pos.line;
                column = pos.col;
            } else {
                line = start.line;
                column = start.column;
            }
            if (typeof end.offset === "number") {
                var pos1 = this.fromOffset(end.offset);
                endLine = pos1.line;
                endColumn = pos1.col;
            } else {
                endLine = end.line;
                endColumn = end.column;
            }
        } else if (!column) {
            var pos2 = this.fromOffset(line);
            line = pos2.line;
            column = pos2.col;
        }
        var origin = this.origin(line, column, endLine, endColumn);
        if (origin) {
            result2 = new CssSyntaxError$1$2(message, origin.endLine === void 0 ? origin.line : {
                column: origin.column,
                line: origin.line
            }, origin.endLine === void 0 ? origin.column : {
                column: origin.endColumn,
                line: origin.endLine
            }, origin.source, origin.file, opts.plugin);
        } else {
            result2 = new CssSyntaxError$1$2(message, endLine === void 0 ? line : {
                column: column,
                line: line
            }, endLine === void 0 ? column : {
                column: endColumn,
                line: endLine
            }, this.css, this.file, opts.plugin);
        }
        result2.input = {
            column: column,
            endColumn: endColumn,
            endLine: endLine,
            line: line,
            source: this.css
        };
        if (this.file) {
            if (pathToFileURL$1$2) {
                result2.input.url = pathToFileURL$1$2(this.file).toString();
            }
            result2.input.file = this.file;
        }
        return result2;
    };
    _proto.fromOffset = function fromOffset(offset) {
        var lastLine, lineToIndex;
        if (!this[fromOffsetCache$2]) {
            var lines = this.css.split("\n");
            lineToIndex = new Array(lines.length);
            var prevIndex = 0;
            for(var i2 = 0, l2 = lines.length; i2 < l2; i2++){
                lineToIndex[i2] = prevIndex;
                prevIndex += lines[i2].length + 1;
            }
            this[fromOffsetCache$2] = lineToIndex;
        } else {
            lineToIndex = this[fromOffsetCache$2];
        }
        lastLine = lineToIndex[lineToIndex.length - 1];
        var min = 0;
        if (offset >= lastLine) {
            min = lineToIndex.length - 1;
        } else {
            var max = lineToIndex.length - 2;
            var mid;
            while(min < max){
                mid = min + (max - min >> 1);
                if (offset < lineToIndex[mid]) {
                    max = mid - 1;
                } else if (offset >= lineToIndex[mid + 1]) {
                    min = mid + 1;
                } else {
                    min = mid;
                    break;
                }
            }
        }
        return {
            col: offset - lineToIndex[min] + 1,
            line: min + 1
        };
    };
    _proto.mapResolve = function mapResolve(file) {
        if (/^\w+:\/\//.test(file)) {
            return file;
        }
        return resolve$1$2(this.map.consumer().sourceRoot || this.map.root || ".", file);
    };
    _proto.origin = function origin(line, column, endLine, endColumn) {
        if (!this.map) return false;
        var consumer = this.map.consumer();
        var from = consumer.originalPositionFor({
            column: column,
            line: line
        });
        if (!from.source) return false;
        var to;
        if (typeof endLine === "number") {
            to = consumer.originalPositionFor({
                column: endColumn,
                line: endLine
            });
        }
        var fromUrl;
        if (isAbsolute$2(from.source)) {
            fromUrl = pathToFileURL$1$2(from.source);
        } else {
            fromUrl = new URL(from.source, this.map.consumer().sourceRoot || pathToFileURL$1$2(this.map.mapFile));
        }
        var result2 = {
            column: from.column,
            endColumn: to && to.column,
            endLine: to && to.line,
            line: from.line,
            url: fromUrl.toString()
        };
        if (fromUrl.protocol === "file:") {
            if (fileURLToPath$2) {
                result2.file = fileURLToPath$2(fromUrl);
            } else {
                throw new Error("file: protocol is not available in this PostCSS build");
            }
        }
        var source = consumer.sourceContentFor(from.source);
        if (source) result2.source = source;
        return result2;
    };
    _proto.toJSON = function toJSON() {
        var json = {};
        for(var _i = 0, _iter = [
            "hasBOM",
            "css",
            "file",
            "id"
        ]; _i < _iter.length; _i++){
            var name = _iter[_i];
            if (this[name] != null) {
                json[name] = this[name];
            }
        }
        if (this.map) {
            json.map = _extends({}, this.map);
            if (json.map.consumerCache) {
                json.map.consumerCache = void 0;
            }
        }
        return json;
    };
    _create_class(Input2, [
        {
            key: "from",
            get: function get() {
                return this.file || this.id;
            }
        }
    ]);
    return Input2;
}();
var input$2 = Input$4$2;
Input$4$2.default = Input$4$2;
if (terminalHighlight$3 && terminalHighlight$3.registerInput) {
    terminalHighlight$3.registerInput(Input$4$2);
}
var SourceMapConsumer$4 = require$$2$2.SourceMapConsumer, SourceMapGenerator$4 = require$$2$2.SourceMapGenerator;
var dirname$3 = require$$2$2.dirname, relative$2 = require$$2$2.relative, resolve$3 = require$$2$2.resolve, sep$2 = require$$2$2.sep;
var pathToFileURL$3 = require$$2$2.pathToFileURL;
var Input$3$2 = input$2;
var sourceMapAvailable$3 = Boolean(SourceMapConsumer$4 && SourceMapGenerator$4);
var pathAvailable$3 = Boolean(dirname$3 && resolve$3 && relative$2 && sep$2);
var MapGenerator$2$2 = /*#__PURE__*/ function() {
    function MapGenerator2(stringify2, root2, opts, cssString) {
        this.stringify = stringify2;
        this.mapOpts = opts.map || {};
        this.root = root2;
        this.opts = opts;
        this.css = cssString;
        this.originalCSS = cssString;
        this.usesFileUrls = !this.mapOpts.from && this.mapOpts.absolute;
        this.memoizedFileURLs = /* @__PURE__ */ new Map();
        this.memoizedPaths = /* @__PURE__ */ new Map();
        this.memoizedURLs = /* @__PURE__ */ new Map();
    }
    var _proto = MapGenerator2.prototype;
    _proto.addAnnotation = function addAnnotation() {
        var content;
        if (this.isInline()) {
            content = "data:application/json;base64," + this.toBase64(this.map.toString());
        } else if (typeof this.mapOpts.annotation === "string") {
            content = this.mapOpts.annotation;
        } else if (typeof this.mapOpts.annotation === "function") {
            content = this.mapOpts.annotation(this.opts.to, this.root);
        } else {
            content = this.outputFile() + ".map";
        }
        var eol = "\n";
        if (this.css.includes("\r\n")) eol = "\r\n";
        this.css += eol + "/*# sourceMappingURL=" + content + " */";
    };
    _proto.applyPrevMaps = function applyPrevMaps() {
        for(var _iterator = _create_for_of_iterator_helper_loose(this.previous()), _step; !(_step = _iterator()).done;){
            var prev = _step.value;
            var from = this.toUrl(this.path(prev.file));
            var root2 = prev.root || dirname$3(prev.file);
            var map = void 0;
            if (this.mapOpts.sourcesContent === false) {
                map = new SourceMapConsumer$4(prev.text);
                if (map.sourcesContent) {
                    map.sourcesContent = null;
                }
            } else {
                map = prev.consumer();
            }
            this.map.applySourceMap(map, from, this.toUrl(this.path(root2)));
        }
    };
    _proto.clearAnnotation = function clearAnnotation() {
        if (this.mapOpts.annotation === false) return;
        if (this.root) {
            var node2;
            for(var i2 = this.root.nodes.length - 1; i2 >= 0; i2--){
                node2 = this.root.nodes[i2];
                if (node2.type !== "comment") continue;
                if (node2.text.indexOf("# sourceMappingURL=") === 0) {
                    this.root.removeChild(i2);
                }
            }
        } else if (this.css) {
            this.css = this.css.replace(/\n*?\/\*#[\S\s]*?\*\/$/gm, "");
        }
    };
    _proto.generate = function generate() {
        this.clearAnnotation();
        if (pathAvailable$3 && sourceMapAvailable$3 && this.isMap()) {
            return this.generateMap();
        } else {
            var result2 = "";
            this.stringify(this.root, function(i2) {
                result2 += i2;
            });
            return [
                result2
            ];
        }
    };
    _proto.generateMap = function generateMap() {
        if (this.root) {
            this.generateString();
        } else if (this.previous().length === 1) {
            var prev = this.previous()[0].consumer();
            prev.file = this.outputFile();
            this.map = SourceMapGenerator$4.fromSourceMap(prev, {
                ignoreInvalidMapping: true
            });
        } else {
            this.map = new SourceMapGenerator$4({
                file: this.outputFile(),
                ignoreInvalidMapping: true
            });
            this.map.addMapping({
                generated: {
                    column: 0,
                    line: 1
                },
                original: {
                    column: 0,
                    line: 1
                },
                source: this.opts.from ? this.toUrl(this.path(this.opts.from)) : "<no source>"
            });
        }
        if (this.isSourcesContent()) this.setSourcesContent();
        if (this.root && this.previous().length > 0) this.applyPrevMaps();
        if (this.isAnnotation()) this.addAnnotation();
        if (this.isInline()) {
            return [
                this.css
            ];
        } else {
            return [
                this.css,
                this.map
            ];
        }
    };
    _proto.generateString = function generateString() {
        var _this = this;
        this.css = "";
        this.map = new SourceMapGenerator$4({
            file: this.outputFile(),
            ignoreInvalidMapping: true
        });
        var line = 1;
        var column = 1;
        var noSource = "<no source>";
        var mapping = {
            generated: {
                column: 0,
                line: 0
            },
            original: {
                column: 0,
                line: 0
            },
            source: ""
        };
        var lines, last;
        this.stringify(this.root, function(str, node2, type) {
            _this.css += str;
            if (node2 && type !== "end") {
                mapping.generated.line = line;
                mapping.generated.column = column - 1;
                if (node2.source && node2.source.start) {
                    mapping.source = _this.sourcePath(node2);
                    mapping.original.line = node2.source.start.line;
                    mapping.original.column = node2.source.start.column - 1;
                    _this.map.addMapping(mapping);
                } else {
                    mapping.source = noSource;
                    mapping.original.line = 1;
                    mapping.original.column = 0;
                    _this.map.addMapping(mapping);
                }
            }
            lines = str.match(/\n/g);
            if (lines) {
                line += lines.length;
                last = str.lastIndexOf("\n");
                column = str.length - last;
            } else {
                column += str.length;
            }
            if (node2 && type !== "start") {
                var p = node2.parent || {
                    raws: {}
                };
                var childless = node2.type === "decl" || node2.type === "atrule" && !node2.nodes;
                if (!childless || node2 !== p.last || p.raws.semicolon) {
                    if (node2.source && node2.source.end) {
                        mapping.source = _this.sourcePath(node2);
                        mapping.original.line = node2.source.end.line;
                        mapping.original.column = node2.source.end.column - 1;
                        mapping.generated.line = line;
                        mapping.generated.column = column - 2;
                        _this.map.addMapping(mapping);
                    } else {
                        mapping.source = noSource;
                        mapping.original.line = 1;
                        mapping.original.column = 0;
                        mapping.generated.line = line;
                        mapping.generated.column = column - 1;
                        _this.map.addMapping(mapping);
                    }
                }
            }
        });
    };
    _proto.isAnnotation = function isAnnotation() {
        if (this.isInline()) {
            return true;
        }
        if (typeof this.mapOpts.annotation !== "undefined") {
            return this.mapOpts.annotation;
        }
        if (this.previous().length) {
            return this.previous().some(function(i2) {
                return i2.annotation;
            });
        }
        return true;
    };
    _proto.isInline = function isInline() {
        if (typeof this.mapOpts.inline !== "undefined") {
            return this.mapOpts.inline;
        }
        var annotation = this.mapOpts.annotation;
        if (typeof annotation !== "undefined" && annotation !== true) {
            return false;
        }
        if (this.previous().length) {
            return this.previous().some(function(i2) {
                return i2.inline;
            });
        }
        return true;
    };
    _proto.isMap = function isMap() {
        if (typeof this.opts.map !== "undefined") {
            return !!this.opts.map;
        }
        return this.previous().length > 0;
    };
    _proto.isSourcesContent = function isSourcesContent() {
        if (typeof this.mapOpts.sourcesContent !== "undefined") {
            return this.mapOpts.sourcesContent;
        }
        if (this.previous().length) {
            return this.previous().some(function(i2) {
                return i2.withContent();
            });
        }
        return true;
    };
    _proto.outputFile = function outputFile() {
        if (this.opts.to) {
            return this.path(this.opts.to);
        } else if (this.opts.from) {
            return this.path(this.opts.from);
        } else {
            return "to.css";
        }
    };
    _proto.path = function path(file) {
        if (this.mapOpts.absolute) return file;
        if (file.charCodeAt(0) === 60) return file;
        if (/^\w+:\/\//.test(file)) return file;
        var cached = this.memoizedPaths.get(file);
        if (cached) return cached;
        var from = this.opts.to ? dirname$3(this.opts.to) : ".";
        if (typeof this.mapOpts.annotation === "string") {
            from = dirname$3(resolve$3(from, this.mapOpts.annotation));
        }
        var path = relative$2(from, file);
        this.memoizedPaths.set(file, path);
        return path;
    };
    _proto.previous = function previous() {
        var _this = this;
        if (!this.previousMaps) {
            this.previousMaps = [];
            if (this.root) {
                this.root.walk(function(node2) {
                    if (node2.source && node2.source.input.map) {
                        var map = node2.source.input.map;
                        if (!_this.previousMaps.includes(map)) {
                            _this.previousMaps.push(map);
                        }
                    }
                });
            } else {
                var input2 = new Input$3$2(this.originalCSS, this.opts);
                if (input2.map) this.previousMaps.push(input2.map);
            }
        }
        return this.previousMaps;
    };
    _proto.setSourcesContent = function setSourcesContent() {
        var _this = this;
        var already = {};
        if (this.root) {
            this.root.walk(function(node2) {
                if (node2.source) {
                    var from = node2.source.input.from;
                    if (from && !already[from]) {
                        already[from] = true;
                        var fromUrl = _this.usesFileUrls ? _this.toFileUrl(from) : _this.toUrl(_this.path(from));
                        _this.map.setSourceContent(fromUrl, node2.source.input.css);
                    }
                }
            });
        } else if (this.css) {
            var from = this.opts.from ? this.toUrl(this.path(this.opts.from)) : "<no source>";
            this.map.setSourceContent(from, this.css);
        }
    };
    _proto.sourcePath = function sourcePath(node2) {
        if (this.mapOpts.from) {
            return this.toUrl(this.mapOpts.from);
        } else if (this.usesFileUrls) {
            return this.toFileUrl(node2.source.input.from);
        } else {
            return this.toUrl(this.path(node2.source.input.from));
        }
    };
    _proto.toBase64 = function toBase64(str) {
        if (Buffer) {
            return Buffer.from(str).toString("base64");
        } else {
            return window.btoa(unescape(encodeURIComponent(str)));
        }
    };
    _proto.toFileUrl = function toFileUrl(path) {
        var cached = this.memoizedFileURLs.get(path);
        if (cached) return cached;
        if (pathToFileURL$3) {
            var fileURL = pathToFileURL$3(path).toString();
            this.memoizedFileURLs.set(path, fileURL);
            return fileURL;
        } else {
            throw new Error("`map.absolute` option is not available in this PostCSS build");
        }
    };
    _proto.toUrl = function toUrl(path) {
        var cached = this.memoizedURLs.get(path);
        if (cached) return cached;
        if (sep$2 === "\\") {
            path = path.replace(/\\/g, "/");
        }
        var url = encodeURI(path).replace(/[#?]/g, encodeURIComponent);
        this.memoizedURLs.set(path, url);
        return url;
    };
    return MapGenerator2;
}();
var mapGenerator$2 = MapGenerator$2$2;
var Node$2$2 = node$2;
var Comment$4$2 = /*#__PURE__*/ function(Node$2$2) {
    _inherits(Comment2, Node$2$2);
    function Comment2(defaults) {
        var _this;
        _this = Node$2$2.call(this, defaults) || this;
        _this.type = "comment";
        return _this;
    }
    return Comment2;
}(Node$2$2);
var comment$2 = Comment$4$2;
Comment$4$2.default = Comment$4$2;
var isClean$1$2 = symbols$2.isClean, my$1$2 = symbols$2.my;
var Declaration$3$2 = declaration$2;
var Comment$3$2 = comment$2;
var Node$1$2 = node$2;
var parse$4$2, Rule$4$2, AtRule$4$2, Root$6$2;
function cleanSource$2(nodes) {
    return nodes.map(function(i2) {
        if (i2.nodes) i2.nodes = cleanSource$2(i2.nodes);
        delete i2.source;
        return i2;
    });
}
function markDirtyUp$2(node2) {
    node2[isClean$1$2] = false;
    if (node2.proxyOf.nodes) {
        for(var _iterator = _create_for_of_iterator_helper_loose(node2.proxyOf.nodes), _step; !(_step = _iterator()).done;){
            var i2 = _step.value;
            markDirtyUp$2(i2);
        }
    }
}
var Container$7$2 = /*#__PURE__*/ function(Node$1$2) {
    _inherits(Container2, Node$1$2);
    function Container2() {
        return Node$1$2.apply(this, arguments) || this;
    }
    var _proto = Container2.prototype;
    _proto.append = function append() {
        for(var _len = arguments.length, children = new Array(_len), _key = 0; _key < _len; _key++){
            children[_key] = arguments[_key];
        }
        for(var _iterator = _create_for_of_iterator_helper_loose(children), _step; !(_step = _iterator()).done;){
            var child = _step.value;
            var nodes = this.normalize(child, this.last);
            for(var _iterator1 = _create_for_of_iterator_helper_loose(nodes), _step1; !(_step1 = _iterator1()).done;){
                var node2 = _step1.value;
                this.proxyOf.nodes.push(node2);
            }
        }
        this.markDirty();
        return this;
    };
    _proto.cleanRaws = function cleanRaws(keepBetween) {
        Node$1$2.prototype.cleanRaws.call(this, keepBetween);
        if (this.nodes) {
            for(var _iterator = _create_for_of_iterator_helper_loose(this.nodes), _step; !(_step = _iterator()).done;){
                var node2 = _step.value;
                node2.cleanRaws(keepBetween);
            }
        }
    };
    _proto.each = function each(callback) {
        if (!this.proxyOf.nodes) return void 0;
        var iterator = this.getIterator();
        var index2, result2;
        while(this.indexes[iterator] < this.proxyOf.nodes.length){
            index2 = this.indexes[iterator];
            result2 = callback(this.proxyOf.nodes[index2], index2);
            if (result2 === false) break;
            this.indexes[iterator] += 1;
        }
        delete this.indexes[iterator];
        return result2;
    };
    _proto.every = function every(condition) {
        return this.nodes.every(condition);
    };
    _proto.getIterator = function getIterator() {
        if (!this.lastEach) this.lastEach = 0;
        if (!this.indexes) this.indexes = {};
        this.lastEach += 1;
        var iterator = this.lastEach;
        this.indexes[iterator] = 0;
        return iterator;
    };
    _proto.getProxyProcessor = function getProxyProcessor() {
        return {
            get: function get(node2, prop) {
                if (prop === "proxyOf") {
                    return node2;
                } else if (!node2[prop]) {
                    return node2[prop];
                } else if (prop === "each" || typeof prop === "string" && prop.startsWith("walk")) {
                    return function() {
                        for(var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++){
                            args[_key] = arguments[_key];
                        }
                        var _node2;
                        return (_node2 = node2)[prop].apply(_node2, [].concat(args.map(function(i2) {
                            if (typeof i2 === "function") {
                                return function(child, index2) {
                                    return i2(child.toProxy(), index2);
                                };
                            } else {
                                return i2;
                            }
                        })));
                    };
                } else if (prop === "every" || prop === "some") {
                    return function(cb) {
                        return node2[prop](function(child) {
                            for(var _len = arguments.length, other = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++){
                                other[_key - 1] = arguments[_key];
                            }
                            return cb.apply(void 0, [].concat([
                                child.toProxy()
                            ], other));
                        });
                    };
                } else if (prop === "root") {
                    return function() {
                        return node2.root().toProxy();
                    };
                } else if (prop === "nodes") {
                    return node2.nodes.map(function(i2) {
                        return i2.toProxy();
                    });
                } else if (prop === "first" || prop === "last") {
                    return node2[prop].toProxy();
                } else {
                    return node2[prop];
                }
            },
            set: function set(node2, prop, value) {
                if (node2[prop] === value) return true;
                node2[prop] = value;
                if (prop === "name" || prop === "params" || prop === "selector") {
                    node2.markDirty();
                }
                return true;
            }
        };
    };
    _proto.index = function index(child) {
        if (typeof child === "number") return child;
        if (child.proxyOf) child = child.proxyOf;
        return this.proxyOf.nodes.indexOf(child);
    };
    _proto.insertAfter = function insertAfter(exist, add) {
        var existIndex = this.index(exist);
        var nodes = this.normalize(add, this.proxyOf.nodes[existIndex]).reverse();
        existIndex = this.index(exist);
        for(var _iterator = _create_for_of_iterator_helper_loose(nodes), _step; !(_step = _iterator()).done;){
            var node2 = _step.value;
            this.proxyOf.nodes.splice(existIndex + 1, 0, node2);
        }
        var index2;
        for(var id in this.indexes){
            index2 = this.indexes[id];
            if (existIndex < index2) {
                this.indexes[id] = index2 + nodes.length;
            }
        }
        this.markDirty();
        return this;
    };
    _proto.insertBefore = function insertBefore(exist, add) {
        var existIndex = this.index(exist);
        var type = existIndex === 0 ? "prepend" : false;
        var nodes = this.normalize(add, this.proxyOf.nodes[existIndex], type).reverse();
        existIndex = this.index(exist);
        for(var _iterator = _create_for_of_iterator_helper_loose(nodes), _step; !(_step = _iterator()).done;){
            var node2 = _step.value;
            this.proxyOf.nodes.splice(existIndex, 0, node2);
        }
        var index2;
        for(var id in this.indexes){
            index2 = this.indexes[id];
            if (existIndex <= index2) {
                this.indexes[id] = index2 + nodes.length;
            }
        }
        this.markDirty();
        return this;
    };
    _proto.normalize = function normalize(nodes, sample) {
        var _this = this;
        if (typeof nodes === "string") {
            nodes = cleanSource$2(parse$4$2(nodes).nodes);
        } else if (typeof nodes === "undefined") {
            nodes = [];
        } else if (Array.isArray(nodes)) {
            nodes = nodes.slice(0);
            for(var _iterator = _create_for_of_iterator_helper_loose(nodes), _step; !(_step = _iterator()).done;){
                var i2 = _step.value;
                if (i2.parent) i2.parent.removeChild(i2, "ignore");
            }
        } else if (nodes.type === "root" && this.type !== "document") {
            nodes = nodes.nodes.slice(0);
            for(var _iterator1 = _create_for_of_iterator_helper_loose(nodes), _step1; !(_step1 = _iterator1()).done;){
                var i21 = _step1.value;
                if (i21.parent) i21.parent.removeChild(i21, "ignore");
            }
        } else if (nodes.type) {
            nodes = [
                nodes
            ];
        } else if (nodes.prop) {
            if (typeof nodes.value === "undefined") {
                throw new Error("Value field is missed in node creation");
            } else if (typeof nodes.value !== "string") {
                nodes.value = String(nodes.value);
            }
            nodes = [
                new Declaration$3$2(nodes)
            ];
        } else if (nodes.selector) {
            nodes = [
                new Rule$4$2(nodes)
            ];
        } else if (nodes.name) {
            nodes = [
                new AtRule$4$2(nodes)
            ];
        } else if (nodes.text) {
            nodes = [
                new Comment$3$2(nodes)
            ];
        } else {
            throw new Error("Unknown node type in node creation");
        }
        var processed = nodes.map(function(i2) {
            if (!i2[my$1$2]) Container2.rebuild(i2);
            i2 = i2.proxyOf;
            if (i2.parent) i2.parent.removeChild(i2);
            if (i2[isClean$1$2]) markDirtyUp$2(i2);
            if (typeof i2.raws.before === "undefined") {
                if (sample && typeof sample.raws.before !== "undefined") {
                    i2.raws.before = sample.raws.before.replace(/\S/g, "");
                }
            }
            i2.parent = _this.proxyOf;
            return i2;
        });
        return processed;
    };
    _proto.prepend = function prepend() {
        for(var _len = arguments.length, children = new Array(_len), _key = 0; _key < _len; _key++){
            children[_key] = arguments[_key];
        }
        children = children.reverse();
        for(var _iterator = _create_for_of_iterator_helper_loose(children), _step; !(_step = _iterator()).done;){
            var child = _step.value;
            var nodes = this.normalize(child, this.first, "prepend").reverse();
            for(var _iterator1 = _create_for_of_iterator_helper_loose(nodes), _step1; !(_step1 = _iterator1()).done;){
                var node2 = _step1.value;
                this.proxyOf.nodes.unshift(node2);
            }
            for(var id in this.indexes){
                this.indexes[id] = this.indexes[id] + nodes.length;
            }
        }
        this.markDirty();
        return this;
    };
    _proto.push = function push(child) {
        child.parent = this;
        this.proxyOf.nodes.push(child);
        return this;
    };
    _proto.removeAll = function removeAll() {
        for(var _iterator = _create_for_of_iterator_helper_loose(this.proxyOf.nodes), _step; !(_step = _iterator()).done;){
            var node2 = _step.value;
            node2.parent = void 0;
        }
        this.proxyOf.nodes = [];
        this.markDirty();
        return this;
    };
    _proto.removeChild = function removeChild(child) {
        child = this.index(child);
        this.proxyOf.nodes[child].parent = void 0;
        this.proxyOf.nodes.splice(child, 1);
        var index2;
        for(var id in this.indexes){
            index2 = this.indexes[id];
            if (index2 >= child) {
                this.indexes[id] = index2 - 1;
            }
        }
        this.markDirty();
        return this;
    };
    _proto.replaceValues = function replaceValues(pattern, opts, callback) {
        if (!callback) {
            callback = opts;
            opts = {};
        }
        this.walkDecls(function(decl) {
            if (opts.props && !opts.props.includes(decl.prop)) return;
            if (opts.fast && !decl.value.includes(opts.fast)) return;
            decl.value = decl.value.replace(pattern, callback);
        });
        this.markDirty();
        return this;
    };
    _proto.some = function some(condition) {
        return this.nodes.some(condition);
    };
    _proto.walk = function walk(callback) {
        return this.each(function(child, i2) {
            var result2;
            try {
                result2 = callback(child, i2);
            } catch (e2) {
                throw child.addToError(e2);
            }
            if (result2 !== false && child.walk) {
                result2 = child.walk(callback);
            }
            return result2;
        });
    };
    _proto.walkAtRules = function walkAtRules(name, callback) {
        if (!callback) {
            callback = name;
            return this.walk(function(child, i2) {
                if (child.type === "atrule") {
                    return callback(child, i2);
                }
            });
        }
        if (_instanceof(name, RegExp)) {
            return this.walk(function(child, i2) {
                if (child.type === "atrule" && name.test(child.name)) {
                    return callback(child, i2);
                }
            });
        }
        return this.walk(function(child, i2) {
            if (child.type === "atrule" && child.name === name) {
                return callback(child, i2);
            }
        });
    };
    _proto.walkComments = function walkComments(callback) {
        return this.walk(function(child, i2) {
            if (child.type === "comment") {
                return callback(child, i2);
            }
        });
    };
    _proto.walkDecls = function walkDecls(prop, callback) {
        if (!callback) {
            callback = prop;
            return this.walk(function(child, i2) {
                if (child.type === "decl") {
                    return callback(child, i2);
                }
            });
        }
        if (_instanceof(prop, RegExp)) {
            return this.walk(function(child, i2) {
                if (child.type === "decl" && prop.test(child.prop)) {
                    return callback(child, i2);
                }
            });
        }
        return this.walk(function(child, i2) {
            if (child.type === "decl" && child.prop === prop) {
                return callback(child, i2);
            }
        });
    };
    _proto.walkRules = function walkRules(selector, callback) {
        if (!callback) {
            callback = selector;
            return this.walk(function(child, i2) {
                if (child.type === "rule") {
                    return callback(child, i2);
                }
            });
        }
        if (_instanceof(selector, RegExp)) {
            return this.walk(function(child, i2) {
                if (child.type === "rule" && selector.test(child.selector)) {
                    return callback(child, i2);
                }
            });
        }
        return this.walk(function(child, i2) {
            if (child.type === "rule" && child.selector === selector) {
                return callback(child, i2);
            }
        });
    };
    _create_class(Container2, [
        {
            key: "first",
            get: function get() {
                if (!this.proxyOf.nodes) return void 0;
                return this.proxyOf.nodes[0];
            }
        },
        {
            key: "last",
            get: function get() {
                if (!this.proxyOf.nodes) return void 0;
                return this.proxyOf.nodes[this.proxyOf.nodes.length - 1];
            }
        }
    ]);
    return Container2;
}(Node$1$2);
Container$7$2.registerParse = function(dependant) {
    parse$4$2 = dependant;
};
Container$7$2.registerRule = function(dependant) {
    Rule$4$2 = dependant;
};
Container$7$2.registerAtRule = function(dependant) {
    AtRule$4$2 = dependant;
};
Container$7$2.registerRoot = function(dependant) {
    Root$6$2 = dependant;
};
var container$2 = Container$7$2;
Container$7$2.default = Container$7$2;
Container$7$2.rebuild = function(node2) {
    if (node2.type === "atrule") {
        Object.setPrototypeOf(node2, AtRule$4$2.prototype);
    } else if (node2.type === "rule") {
        Object.setPrototypeOf(node2, Rule$4$2.prototype);
    } else if (node2.type === "decl") {
        Object.setPrototypeOf(node2, Declaration$3$2.prototype);
    } else if (node2.type === "comment") {
        Object.setPrototypeOf(node2, Comment$3$2.prototype);
    } else if (node2.type === "root") {
        Object.setPrototypeOf(node2, Root$6$2.prototype);
    }
    node2[my$1$2] = true;
    if (node2.nodes) {
        node2.nodes.forEach(function(child) {
            Container$7$2.rebuild(child);
        });
    }
};
var Container$6$2 = container$2;
var LazyResult$4$2, Processor$3$2;
var Document$3$2 = /*#__PURE__*/ function(Container$6$2) {
    _inherits(Document23, Container$6$2);
    function Document23(defaults) {
        var _this;
        _this = Container$6$2.call(this, _extends({
            type: "document"
        }, defaults)) || this;
        if (!_this.nodes) {
            _this.nodes = [];
        }
        return _this;
    }
    var _proto = Document23.prototype;
    _proto.toResult = function toResult(opts) {
        if (opts === void 0) opts = {};
        var lazy = new LazyResult$4$2(new Processor$3$2(), this, opts);
        return lazy.stringify();
    };
    return Document23;
}(Container$6$2);
Document$3$2.registerLazyResult = function(dependant) {
    LazyResult$4$2 = dependant;
};
Document$3$2.registerProcessor = function(dependant) {
    Processor$3$2 = dependant;
};
var document$1$2 = Document$3$2;
Document$3$2.default = Document$3$2;
var printed$2 = {};
var warnOnce$2$2 = function warnOnce2(message) {
    if (printed$2[message]) return;
    printed$2[message] = true;
    if (typeof console !== "undefined" && console.warn) {
        console.warn(message);
    }
};
var Warning$2$2 = /*#__PURE__*/ function() {
    function Warning2(text, opts) {
        if (opts === void 0) opts = {};
        this.type = "warning";
        this.text = text;
        if (opts.node && opts.node.source) {
            var range = opts.node.rangeBy(opts);
            this.line = range.start.line;
            this.column = range.start.column;
            this.endLine = range.end.line;
            this.endColumn = range.end.column;
        }
        for(var opt in opts)this[opt] = opts[opt];
    }
    var _proto = Warning2.prototype;
    _proto.toString = function toString() {
        if (this.node) {
            return this.node.error(this.text, {
                index: this.index,
                plugin: this.plugin,
                word: this.word
            }).message;
        }
        if (this.plugin) {
            return this.plugin + ": " + this.text;
        }
        return this.text;
    };
    return Warning2;
}();
var warning$2 = Warning$2$2;
Warning$2$2.default = Warning$2$2;
var Warning$1$2 = warning$2;
var Result$3$2 = /*#__PURE__*/ function() {
    function Result2(processor2, root2, opts) {
        this.processor = processor2;
        this.messages = [];
        this.root = root2;
        this.opts = opts;
        this.css = void 0;
        this.map = void 0;
    }
    var _proto = Result2.prototype;
    _proto.toString = function toString() {
        return this.css;
    };
    _proto.warn = function warn(text, opts) {
        if (opts === void 0) opts = {};
        if (!opts.plugin) {
            if (this.lastPlugin && this.lastPlugin.postcssPlugin) {
                opts.plugin = this.lastPlugin.postcssPlugin;
            }
        }
        var warning2 = new Warning$1$2(text, opts);
        this.messages.push(warning2);
        return warning2;
    };
    _proto.warnings = function warnings() {
        return this.messages.filter(function(i2) {
            return i2.type === "warning";
        });
    };
    _create_class(Result2, [
        {
            key: "content",
            get: function get() {
                return this.css;
            }
        }
    ]);
    return Result2;
}();
var result$2 = Result$3$2;
Result$3$2.default = Result$3$2;
var SINGLE_QUOTE$2 = "'".charCodeAt(0);
var DOUBLE_QUOTE$2 = '"'.charCodeAt(0);
var BACKSLASH$2 = "\\".charCodeAt(0);
var SLASH$2 = "/".charCodeAt(0);
var NEWLINE$2 = "\n".charCodeAt(0);
var SPACE$2 = " ".charCodeAt(0);
var FEED$2 = "\f".charCodeAt(0);
var TAB$2 = "	".charCodeAt(0);
var CR$2 = "\r".charCodeAt(0);
var OPEN_SQUARE$2 = "[".charCodeAt(0);
var CLOSE_SQUARE$2 = "]".charCodeAt(0);
var OPEN_PARENTHESES$2 = "(".charCodeAt(0);
var CLOSE_PARENTHESES$2 = ")".charCodeAt(0);
var OPEN_CURLY$2 = "{".charCodeAt(0);
var CLOSE_CURLY$2 = "}".charCodeAt(0);
var SEMICOLON$2 = ";".charCodeAt(0);
var ASTERISK$2 = "*".charCodeAt(0);
var COLON$2 = ":".charCodeAt(0);
var AT$2 = "@".charCodeAt(0);
var RE_AT_END$2 = /[\t\n\f\r "#'()/;[\\\]{}]/g;
var RE_WORD_END$2 = /[\t\n\f\r !"#'():;@[\\\]{}]|\/(?=\*)/g;
var RE_BAD_BRACKET$2 = /.[\r\n"'(/\\]/;
var RE_HEX_ESCAPE$2 = /[\da-f]/i;
var tokenize$2 = function tokenizer2(input2, options) {
    if (options === void 0) options = {};
    var css = input2.css.valueOf();
    var ignore = options.ignoreErrors;
    var code, next, quote, content, escape;
    var escaped, escapePos, prev, n2, currentToken;
    var length = css.length;
    var pos = 0;
    var buffer = [];
    var returned = [];
    function position() {
        return pos;
    }
    function unclosed(what) {
        throw input2.error("Unclosed " + what, pos);
    }
    function endOfFile() {
        return returned.length === 0 && pos >= length;
    }
    function nextToken(opts) {
        if (returned.length) return returned.pop();
        if (pos >= length) return;
        var ignoreUnclosed = opts ? opts.ignoreUnclosed : false;
        code = css.charCodeAt(pos);
        switch(code){
            case NEWLINE$2:
            case SPACE$2:
            case TAB$2:
            case CR$2:
            case FEED$2:
                {
                    next = pos;
                    do {
                        next += 1;
                        code = css.charCodeAt(next);
                    }while (code === SPACE$2 || code === NEWLINE$2 || code === TAB$2 || code === CR$2 || code === FEED$2);
                    currentToken = [
                        "space",
                        css.slice(pos, next)
                    ];
                    pos = next - 1;
                    break;
                }
            case OPEN_SQUARE$2:
            case CLOSE_SQUARE$2:
            case OPEN_CURLY$2:
            case CLOSE_CURLY$2:
            case COLON$2:
            case SEMICOLON$2:
            case CLOSE_PARENTHESES$2:
                {
                    var controlChar = String.fromCharCode(code);
                    currentToken = [
                        controlChar,
                        controlChar,
                        pos
                    ];
                    break;
                }
            case OPEN_PARENTHESES$2:
                {
                    prev = buffer.length ? buffer.pop()[1] : "";
                    n2 = css.charCodeAt(pos + 1);
                    if (prev === "url" && n2 !== SINGLE_QUOTE$2 && n2 !== DOUBLE_QUOTE$2 && n2 !== SPACE$2 && n2 !== NEWLINE$2 && n2 !== TAB$2 && n2 !== FEED$2 && n2 !== CR$2) {
                        next = pos;
                        do {
                            escaped = false;
                            next = css.indexOf(")", next + 1);
                            if (next === -1) {
                                if (ignore || ignoreUnclosed) {
                                    next = pos;
                                    break;
                                } else {
                                    unclosed("bracket");
                                }
                            }
                            escapePos = next;
                            while(css.charCodeAt(escapePos - 1) === BACKSLASH$2){
                                escapePos -= 1;
                                escaped = !escaped;
                            }
                        }while (escaped);
                        currentToken = [
                            "brackets",
                            css.slice(pos, next + 1),
                            pos,
                            next
                        ];
                        pos = next;
                    } else {
                        next = css.indexOf(")", pos + 1);
                        content = css.slice(pos, next + 1);
                        if (next === -1 || RE_BAD_BRACKET$2.test(content)) {
                            currentToken = [
                                "(",
                                "(",
                                pos
                            ];
                        } else {
                            currentToken = [
                                "brackets",
                                content,
                                pos,
                                next
                            ];
                            pos = next;
                        }
                    }
                    break;
                }
            case SINGLE_QUOTE$2:
            case DOUBLE_QUOTE$2:
                {
                    quote = code === SINGLE_QUOTE$2 ? "'" : '"';
                    next = pos;
                    do {
                        escaped = false;
                        next = css.indexOf(quote, next + 1);
                        if (next === -1) {
                            if (ignore || ignoreUnclosed) {
                                next = pos + 1;
                                break;
                            } else {
                                unclosed("string");
                            }
                        }
                        escapePos = next;
                        while(css.charCodeAt(escapePos - 1) === BACKSLASH$2){
                            escapePos -= 1;
                            escaped = !escaped;
                        }
                    }while (escaped);
                    currentToken = [
                        "string",
                        css.slice(pos, next + 1),
                        pos,
                        next
                    ];
                    pos = next;
                    break;
                }
            case AT$2:
                {
                    RE_AT_END$2.lastIndex = pos + 1;
                    RE_AT_END$2.test(css);
                    if (RE_AT_END$2.lastIndex === 0) {
                        next = css.length - 1;
                    } else {
                        next = RE_AT_END$2.lastIndex - 2;
                    }
                    currentToken = [
                        "at-word",
                        css.slice(pos, next + 1),
                        pos,
                        next
                    ];
                    pos = next;
                    break;
                }
            case BACKSLASH$2:
                {
                    next = pos;
                    escape = true;
                    while(css.charCodeAt(next + 1) === BACKSLASH$2){
                        next += 1;
                        escape = !escape;
                    }
                    code = css.charCodeAt(next + 1);
                    if (escape && code !== SLASH$2 && code !== SPACE$2 && code !== NEWLINE$2 && code !== TAB$2 && code !== CR$2 && code !== FEED$2) {
                        next += 1;
                        if (RE_HEX_ESCAPE$2.test(css.charAt(next))) {
                            while(RE_HEX_ESCAPE$2.test(css.charAt(next + 1))){
                                next += 1;
                            }
                            if (css.charCodeAt(next + 1) === SPACE$2) {
                                next += 1;
                            }
                        }
                    }
                    currentToken = [
                        "word",
                        css.slice(pos, next + 1),
                        pos,
                        next
                    ];
                    pos = next;
                    break;
                }
            default:
                {
                    if (code === SLASH$2 && css.charCodeAt(pos + 1) === ASTERISK$2) {
                        next = css.indexOf("*/", pos + 2) + 1;
                        if (next === 0) {
                            if (ignore || ignoreUnclosed) {
                                next = css.length;
                            } else {
                                unclosed("comment");
                            }
                        }
                        currentToken = [
                            "comment",
                            css.slice(pos, next + 1),
                            pos,
                            next
                        ];
                        pos = next;
                    } else {
                        RE_WORD_END$2.lastIndex = pos + 1;
                        RE_WORD_END$2.test(css);
                        if (RE_WORD_END$2.lastIndex === 0) {
                            next = css.length - 1;
                        } else {
                            next = RE_WORD_END$2.lastIndex - 2;
                        }
                        currentToken = [
                            "word",
                            css.slice(pos, next + 1),
                            pos,
                            next
                        ];
                        buffer.push(currentToken);
                        pos = next;
                    }
                    break;
                }
        }
        pos++;
        return currentToken;
    }
    function back(token) {
        returned.push(token);
    }
    return {
        back: back,
        endOfFile: endOfFile,
        nextToken: nextToken,
        position: position
    };
};
var Container$5$2 = container$2;
var AtRule$3$2 = /*#__PURE__*/ function(Container$5$2) {
    _inherits(AtRule2, Container$5$2);
    function AtRule2(defaults) {
        var _this;
        _this = Container$5$2.call(this, defaults) || this;
        _this.type = "atrule";
        return _this;
    }
    var _proto = AtRule2.prototype;
    _proto.append = function append() {
        for(var _len = arguments.length, children = new Array(_len), _key = 0; _key < _len; _key++){
            children[_key] = arguments[_key];
        }
        var _Container$5$2_prototype_append;
        if (!this.proxyOf.nodes) this.nodes = [];
        return (_Container$5$2_prototype_append = Container$5$2.prototype.append).call.apply(_Container$5$2_prototype_append, [].concat([
            this
        ], children));
    };
    _proto.prepend = function prepend() {
        for(var _len = arguments.length, children = new Array(_len), _key = 0; _key < _len; _key++){
            children[_key] = arguments[_key];
        }
        var _Container$5$2_prototype_prepend;
        if (!this.proxyOf.nodes) this.nodes = [];
        return (_Container$5$2_prototype_prepend = Container$5$2.prototype.prepend).call.apply(_Container$5$2_prototype_prepend, [].concat([
            this
        ], children));
    };
    return AtRule2;
}(Container$5$2);
var atRule$2 = AtRule$3$2;
AtRule$3$2.default = AtRule$3$2;
Container$5$2.registerAtRule(AtRule$3$2);
var Container$4$2 = container$2;
var LazyResult$3$2, Processor$2$2;
var Root$5$2 = /*#__PURE__*/ function(Container$4$2) {
    _inherits(Root2, Container$4$2);
    function Root2(defaults) {
        var _this;
        _this = Container$4$2.call(this, defaults) || this;
        _this.type = "root";
        if (!_this.nodes) _this.nodes = [];
        return _this;
    }
    var _proto = Root2.prototype;
    _proto.normalize = function normalize(child, sample, type) {
        var nodes = Container$4$2.prototype.normalize.call(this, child);
        if (sample) {
            if (type === "prepend") {
                if (this.nodes.length > 1) {
                    sample.raws.before = this.nodes[1].raws.before;
                } else {
                    delete sample.raws.before;
                }
            } else if (this.first !== sample) {
                for(var _iterator = _create_for_of_iterator_helper_loose(nodes), _step; !(_step = _iterator()).done;){
                    var node2 = _step.value;
                    node2.raws.before = sample.raws.before;
                }
            }
        }
        return nodes;
    };
    _proto.removeChild = function removeChild(child, ignore) {
        var index2 = this.index(child);
        if (!ignore && index2 === 0 && this.nodes.length > 1) {
            this.nodes[1].raws.before = this.nodes[index2].raws.before;
        }
        return Container$4$2.prototype.removeChild.call(this, child);
    };
    _proto.toResult = function toResult(opts) {
        if (opts === void 0) opts = {};
        var lazy = new LazyResult$3$2(new Processor$2$2(), this, opts);
        return lazy.stringify();
    };
    return Root2;
}(Container$4$2);
Root$5$2.registerLazyResult = function(dependant) {
    LazyResult$3$2 = dependant;
};
Root$5$2.registerProcessor = function(dependant) {
    Processor$2$2 = dependant;
};
var root$2 = Root$5$2;
Root$5$2.default = Root$5$2;
Container$4$2.registerRoot(Root$5$2);
var list$2$2 = {
    comma: function comma(string) {
        return list$2$2.split(string, [
            ","
        ], true);
    },
    space: function space(string) {
        var spaces = [
            " ",
            "\n",
            "	"
        ];
        return list$2$2.split(string, spaces);
    },
    split: function split(string, separators, last) {
        var array = [];
        var current = "";
        var split = false;
        var func = 0;
        var inQuote = false;
        var prevQuote = "";
        var escape = false;
        for(var _iterator = _create_for_of_iterator_helper_loose(string), _step; !(_step = _iterator()).done;){
            var letter = _step.value;
            if (escape) {
                escape = false;
            } else if (letter === "\\") {
                escape = true;
            } else if (inQuote) {
                if (letter === prevQuote) {
                    inQuote = false;
                }
            } else if (letter === '"' || letter === "'") {
                inQuote = true;
                prevQuote = letter;
            } else if (letter === "(") {
                func += 1;
            } else if (letter === ")") {
                if (func > 0) func -= 1;
            } else if (func === 0) {
                if (separators.includes(letter)) split = true;
            }
            if (split) {
                if (current !== "") array.push(current.trim());
                current = "";
                split = false;
            } else {
                current += letter;
            }
        }
        if (last || current !== "") array.push(current.trim());
        return array;
    }
};
var list_1$2 = list$2$2;
list$2$2.default = list$2$2;
var Container$3$2 = container$2;
var list$1$2 = list_1$2;
var Rule$3$2 = /*#__PURE__*/ function(Container$3$2) {
    _inherits(Rule2, Container$3$2);
    function Rule2(defaults) {
        var _this;
        _this = Container$3$2.call(this, defaults) || this;
        _this.type = "rule";
        if (!_this.nodes) _this.nodes = [];
        return _this;
    }
    _create_class(Rule2, [
        {
            key: "selectors",
            get: function get() {
                return list$1$2.comma(this.selector);
            },
            set: function set(values) {
                var match = this.selector ? this.selector.match(/,\s*/) : null;
                var sep2 = match ? match[0] : "," + this.raw("between", "beforeOpen");
                this.selector = values.join(sep2);
            }
        }
    ]);
    return Rule2;
}(Container$3$2);
var rule$2 = Rule$3$2;
Rule$3$2.default = Rule$3$2;
Container$3$2.registerRule(Rule$3$2);
var Declaration$2$2 = declaration$2;
var tokenizer22 = tokenize$2;
var Comment$2$2 = comment$2;
var AtRule$2$2 = atRule$2;
var Root$4$2 = root$2;
var Rule$2$2 = rule$2;
var SAFE_COMMENT_NEIGHBOR$2 = {
    empty: true,
    space: true
};
function findLastWithPosition$2(tokens) {
    for(var i2 = tokens.length - 1; i2 >= 0; i2--){
        var token = tokens[i2];
        var pos = token[3] || token[2];
        if (pos) return pos;
    }
}
var Parser$1$2 = /*#__PURE__*/ function() {
    function Parser2(input2) {
        this.input = input2;
        this.root = new Root$4$2();
        this.current = this.root;
        this.spaces = "";
        this.semicolon = false;
        this.createTokenizer();
        this.root.source = {
            input: input2,
            start: {
                column: 1,
                line: 1,
                offset: 0
            }
        };
    }
    var _proto = Parser2.prototype;
    _proto.atrule = function atrule(token) {
        var node2 = new AtRule$2$2();
        node2.name = token[1].slice(1);
        if (node2.name === "") {
            this.unnamedAtrule(node2, token);
        }
        this.init(node2, token[2]);
        var type;
        var prev;
        var shift;
        var last = false;
        var open = false;
        var params = [];
        var brackets = [];
        while(!this.tokenizer.endOfFile()){
            token = this.tokenizer.nextToken();
            type = token[0];
            if (type === "(" || type === "[") {
                brackets.push(type === "(" ? ")" : "]");
            } else if (type === "{" && brackets.length > 0) {
                brackets.push("}");
            } else if (type === brackets[brackets.length - 1]) {
                brackets.pop();
            }
            if (brackets.length === 0) {
                if (type === ";") {
                    node2.source.end = this.getPosition(token[2]);
                    node2.source.end.offset++;
                    this.semicolon = true;
                    break;
                } else if (type === "{") {
                    open = true;
                    break;
                } else if (type === "}") {
                    if (params.length > 0) {
                        shift = params.length - 1;
                        prev = params[shift];
                        while(prev && prev[0] === "space"){
                            prev = params[--shift];
                        }
                        if (prev) {
                            node2.source.end = this.getPosition(prev[3] || prev[2]);
                            node2.source.end.offset++;
                        }
                    }
                    this.end(token);
                    break;
                } else {
                    params.push(token);
                }
            } else {
                params.push(token);
            }
            if (this.tokenizer.endOfFile()) {
                last = true;
                break;
            }
        }
        node2.raws.between = this.spacesAndCommentsFromEnd(params);
        if (params.length) {
            node2.raws.afterName = this.spacesAndCommentsFromStart(params);
            this.raw(node2, "params", params);
            if (last) {
                token = params[params.length - 1];
                node2.source.end = this.getPosition(token[3] || token[2]);
                node2.source.end.offset++;
                this.spaces = node2.raws.between;
                node2.raws.between = "";
            }
        } else {
            node2.raws.afterName = "";
            node2.params = "";
        }
        if (open) {
            node2.nodes = [];
            this.current = node2;
        }
    };
    _proto.checkMissedSemicolon = function checkMissedSemicolon(tokens) {
        var colon = this.colon(tokens);
        if (colon === false) return;
        var founded = 0;
        var token;
        for(var j = colon - 1; j >= 0; j--){
            token = tokens[j];
            if (token[0] !== "space") {
                founded += 1;
                if (founded === 2) break;
            }
        }
        throw this.input.error("Missed semicolon", token[0] === "word" ? token[3] + 1 : token[2]);
    };
    _proto.colon = function colon(tokens) {
        var brackets = 0;
        var token, type, prev;
        for(var _iterator = _create_for_of_iterator_helper_loose(tokens.entries()), _step; !(_step = _iterator()).done;){
            var _step_value = _step.value, i2 = _step_value[0], element = _step_value[1];
            token = element;
            type = token[0];
            if (type === "(") {
                brackets += 1;
            }
            if (type === ")") {
                brackets -= 1;
            }
            if (brackets === 0 && type === ":") {
                if (!prev) {
                    this.doubleColon(token);
                } else if (prev[0] === "word" && prev[1] === "progid") {
                    continue;
                } else {
                    return i2;
                }
            }
            prev = token;
        }
        return false;
    };
    _proto.comment = function comment(token) {
        var node2 = new Comment$2$2();
        this.init(node2, token[2]);
        node2.source.end = this.getPosition(token[3] || token[2]);
        node2.source.end.offset++;
        var text = token[1].slice(2, -2);
        if (/^\s*$/.test(text)) {
            node2.text = "";
            node2.raws.left = text;
            node2.raws.right = "";
        } else {
            var match = text.match(/^(\s*)([^]*\S)(\s*)$/);
            node2.text = match[2];
            node2.raws.left = match[1];
            node2.raws.right = match[3];
        }
    };
    _proto.createTokenizer = function createTokenizer() {
        this.tokenizer = tokenizer22(this.input);
    };
    _proto.decl = function decl(tokens, customProperty) {
        var node2 = new Declaration$2$2();
        this.init(node2, tokens[0][2]);
        var last = tokens[tokens.length - 1];
        if (last[0] === ";") {
            this.semicolon = true;
            tokens.pop();
        }
        node2.source.end = this.getPosition(last[3] || last[2] || findLastWithPosition$2(tokens));
        node2.source.end.offset++;
        while(tokens[0][0] !== "word"){
            if (tokens.length === 1) this.unknownWord(tokens);
            node2.raws.before += tokens.shift()[1];
        }
        node2.source.start = this.getPosition(tokens[0][2]);
        node2.prop = "";
        while(tokens.length){
            var type = tokens[0][0];
            if (type === ":" || type === "space" || type === "comment") {
                break;
            }
            node2.prop += tokens.shift()[1];
        }
        node2.raws.between = "";
        var token;
        while(tokens.length){
            token = tokens.shift();
            if (token[0] === ":") {
                node2.raws.between += token[1];
                break;
            } else {
                if (token[0] === "word" && /\w/.test(token[1])) {
                    this.unknownWord([
                        token
                    ]);
                }
                node2.raws.between += token[1];
            }
        }
        if (node2.prop[0] === "_" || node2.prop[0] === "*") {
            node2.raws.before += node2.prop[0];
            node2.prop = node2.prop.slice(1);
        }
        var firstSpaces = [];
        var next;
        while(tokens.length){
            next = tokens[0][0];
            if (next !== "space" && next !== "comment") break;
            firstSpaces.push(tokens.shift());
        }
        this.precheckMissedSemicolon(tokens);
        for(var i2 = tokens.length - 1; i2 >= 0; i2--){
            token = tokens[i2];
            if (token[1].toLowerCase() === "!important") {
                node2.important = true;
                var string = this.stringFrom(tokens, i2);
                string = this.spacesFromEnd(tokens) + string;
                if (string !== " !important") node2.raws.important = string;
                break;
            } else if (token[1].toLowerCase() === "important") {
                var cache = tokens.slice(0);
                var str = "";
                for(var j = i2; j > 0; j--){
                    var type1 = cache[j][0];
                    if (str.trim().indexOf("!") === 0 && type1 !== "space") {
                        break;
                    }
                    str = cache.pop()[1] + str;
                }
                if (str.trim().indexOf("!") === 0) {
                    node2.important = true;
                    node2.raws.important = str;
                    tokens = cache;
                }
            }
            if (token[0] !== "space" && token[0] !== "comment") {
                break;
            }
        }
        var hasWord = tokens.some(function(i2) {
            return i2[0] !== "space" && i2[0] !== "comment";
        });
        if (hasWord) {
            node2.raws.between += firstSpaces.map(function(i2) {
                return i2[1];
            }).join("");
            firstSpaces = [];
        }
        this.raw(node2, "value", firstSpaces.concat(tokens), customProperty);
        if (node2.value.includes(":") && !customProperty) {
            this.checkMissedSemicolon(tokens);
        }
    };
    _proto.doubleColon = function doubleColon(token) {
        throw this.input.error("Double colon", {
            offset: token[2]
        }, {
            offset: token[2] + token[1].length
        });
    };
    _proto.emptyRule = function emptyRule(token) {
        var node2 = new Rule$2$2();
        this.init(node2, token[2]);
        node2.selector = "";
        node2.raws.between = "";
        this.current = node2;
    };
    _proto.end = function end(token) {
        if (this.current.nodes && this.current.nodes.length) {
            this.current.raws.semicolon = this.semicolon;
        }
        this.semicolon = false;
        this.current.raws.after = (this.current.raws.after || "") + this.spaces;
        this.spaces = "";
        if (this.current.parent) {
            this.current.source.end = this.getPosition(token[2]);
            this.current.source.end.offset++;
            this.current = this.current.parent;
        } else {
            this.unexpectedClose(token);
        }
    };
    _proto.endFile = function endFile() {
        if (this.current.parent) this.unclosedBlock();
        if (this.current.nodes && this.current.nodes.length) {
            this.current.raws.semicolon = this.semicolon;
        }
        this.current.raws.after = (this.current.raws.after || "") + this.spaces;
        this.root.source.end = this.getPosition(this.tokenizer.position());
    };
    _proto.freeSemicolon = function freeSemicolon(token) {
        this.spaces += token[1];
        if (this.current.nodes) {
            var prev = this.current.nodes[this.current.nodes.length - 1];
            if (prev && prev.type === "rule" && !prev.raws.ownSemicolon) {
                prev.raws.ownSemicolon = this.spaces;
                this.spaces = "";
            }
        }
    };
    // Helpers
    _proto.getPosition = function getPosition(offset) {
        var pos = this.input.fromOffset(offset);
        return {
            column: pos.col,
            line: pos.line,
            offset: offset
        };
    };
    _proto.init = function init(node2, offset) {
        this.current.push(node2);
        node2.source = {
            input: this.input,
            start: this.getPosition(offset)
        };
        node2.raws.before = this.spaces;
        this.spaces = "";
        if (node2.type !== "comment") this.semicolon = false;
    };
    _proto.other = function other(start) {
        var end = false;
        var type = null;
        var colon = false;
        var bracket = null;
        var brackets = [];
        var customProperty = start[1].startsWith("--");
        var tokens = [];
        var token = start;
        while(token){
            type = token[0];
            tokens.push(token);
            if (type === "(" || type === "[") {
                if (!bracket) bracket = token;
                brackets.push(type === "(" ? ")" : "]");
            } else if (customProperty && colon && type === "{") {
                if (!bracket) bracket = token;
                brackets.push("}");
            } else if (brackets.length === 0) {
                if (type === ";") {
                    if (colon) {
                        this.decl(tokens, customProperty);
                        return;
                    } else {
                        break;
                    }
                } else if (type === "{") {
                    this.rule(tokens);
                    return;
                } else if (type === "}") {
                    this.tokenizer.back(tokens.pop());
                    end = true;
                    break;
                } else if (type === ":") {
                    colon = true;
                }
            } else if (type === brackets[brackets.length - 1]) {
                brackets.pop();
                if (brackets.length === 0) bracket = null;
            }
            token = this.tokenizer.nextToken();
        }
        if (this.tokenizer.endOfFile()) end = true;
        if (brackets.length > 0) this.unclosedBracket(bracket);
        if (end && colon) {
            if (!customProperty) {
                while(tokens.length){
                    token = tokens[tokens.length - 1][0];
                    if (token !== "space" && token !== "comment") break;
                    this.tokenizer.back(tokens.pop());
                }
            }
            this.decl(tokens, customProperty);
        } else {
            this.unknownWord(tokens);
        }
    };
    _proto.parse = function parse() {
        var token;
        while(!this.tokenizer.endOfFile()){
            token = this.tokenizer.nextToken();
            switch(token[0]){
                case "space":
                    this.spaces += token[1];
                    break;
                case ";":
                    this.freeSemicolon(token);
                    break;
                case "}":
                    this.end(token);
                    break;
                case "comment":
                    this.comment(token);
                    break;
                case "at-word":
                    this.atrule(token);
                    break;
                case "{":
                    this.emptyRule(token);
                    break;
                default:
                    this.other(token);
                    break;
            }
        }
        this.endFile();
    };
    _proto.precheckMissedSemicolon = function precheckMissedSemicolon() {};
    _proto.raw = function raw(node2, prop, tokens, customProperty) {
        var token, type;
        var length = tokens.length;
        var value = "";
        var clean = true;
        var next, prev;
        for(var i2 = 0; i2 < length; i2 += 1){
            token = tokens[i2];
            type = token[0];
            if (type === "space" && i2 === length - 1 && !customProperty) {
                clean = false;
            } else if (type === "comment") {
                prev = tokens[i2 - 1] ? tokens[i2 - 1][0] : "empty";
                next = tokens[i2 + 1] ? tokens[i2 + 1][0] : "empty";
                if (!SAFE_COMMENT_NEIGHBOR$2[prev] && !SAFE_COMMENT_NEIGHBOR$2[next]) {
                    if (value.slice(-1) === ",") {
                        clean = false;
                    } else {
                        value += token[1];
                    }
                } else {
                    clean = false;
                }
            } else {
                value += token[1];
            }
        }
        if (!clean) {
            var raw = tokens.reduce(function(all, i2) {
                return all + i2[1];
            }, "");
            node2.raws[prop] = {
                raw: raw,
                value: value
            };
        }
        node2[prop] = value;
    };
    _proto.rule = function rule(tokens) {
        tokens.pop();
        var node2 = new Rule$2$2();
        this.init(node2, tokens[0][2]);
        node2.raws.between = this.spacesAndCommentsFromEnd(tokens);
        this.raw(node2, "selector", tokens);
        this.current = node2;
    };
    _proto.spacesAndCommentsFromEnd = function spacesAndCommentsFromEnd(tokens) {
        var lastTokenType;
        var spaces = "";
        while(tokens.length){
            lastTokenType = tokens[tokens.length - 1][0];
            if (lastTokenType !== "space" && lastTokenType !== "comment") break;
            spaces = tokens.pop()[1] + spaces;
        }
        return spaces;
    };
    // Errors
    _proto.spacesAndCommentsFromStart = function spacesAndCommentsFromStart(tokens) {
        var next;
        var spaces = "";
        while(tokens.length){
            next = tokens[0][0];
            if (next !== "space" && next !== "comment") break;
            spaces += tokens.shift()[1];
        }
        return spaces;
    };
    _proto.spacesFromEnd = function spacesFromEnd(tokens) {
        var lastTokenType;
        var spaces = "";
        while(tokens.length){
            lastTokenType = tokens[tokens.length - 1][0];
            if (lastTokenType !== "space") break;
            spaces = tokens.pop()[1] + spaces;
        }
        return spaces;
    };
    _proto.stringFrom = function stringFrom(tokens, from) {
        var result2 = "";
        for(var i2 = from; i2 < tokens.length; i2++){
            result2 += tokens[i2][1];
        }
        tokens.splice(from, tokens.length - from);
        return result2;
    };
    _proto.unclosedBlock = function unclosedBlock() {
        var pos = this.current.source.start;
        throw this.input.error("Unclosed block", pos.line, pos.column);
    };
    _proto.unclosedBracket = function unclosedBracket(bracket) {
        throw this.input.error("Unclosed bracket", {
            offset: bracket[2]
        }, {
            offset: bracket[2] + 1
        });
    };
    _proto.unexpectedClose = function unexpectedClose(token) {
        throw this.input.error("Unexpected }", {
            offset: token[2]
        }, {
            offset: token[2] + 1
        });
    };
    _proto.unknownWord = function unknownWord(tokens) {
        throw this.input.error("Unknown word", {
            offset: tokens[0][2]
        }, {
            offset: tokens[0][2] + tokens[0][1].length
        });
    };
    _proto.unnamedAtrule = function unnamedAtrule(node2, token) {
        throw this.input.error("At-rule without name", {
            offset: token[2]
        }, {
            offset: token[2] + token[1].length
        });
    };
    return Parser2;
}();
var parser$2 = Parser$1$2;
var Container$2$2 = container$2;
var Parser22 = parser$2;
var Input$2$2 = input$2;
function parse$3$2(css, opts) {
    var input2 = new Input$2$2(css, opts);
    var parser2 = new Parser22(input2);
    try {
        parser2.parse();
    } catch (e2) {
        if (process.env.NODE_ENV !== "production") {
            if (e2.name === "CssSyntaxError" && opts && opts.from) {
                if (/\.scss$/i.test(opts.from)) {
                    e2.message += "\nYou tried to parse SCSS with the standard CSS parser; try again with the postcss-scss parser";
                } else if (/\.sass/i.test(opts.from)) {
                    e2.message += "\nYou tried to parse Sass with the standard CSS parser; try again with the postcss-sass parser";
                } else if (/\.less$/i.test(opts.from)) {
                    e2.message += "\nYou tried to parse Less with the standard CSS parser; try again with the postcss-less parser";
                }
            }
        }
        throw e2;
    }
    return parser2.root;
}
var parse_1$2 = parse$3$2;
parse$3$2.default = parse$3$2;
Container$2$2.registerParse(parse$3$2);
var isClean$4 = symbols$2.isClean, my$4 = symbols$2.my;
var MapGenerator$1$2 = mapGenerator$2;
var stringify$2$2 = stringify_1$2;
var Container$1$2 = container$2;
var Document$2$2 = document$1$2;
var warnOnce$1$2 = warnOnce$2$2;
var Result$2$2 = result$2;
var parse$2$2 = parse_1$2;
var Root$3$2 = root$2;
var TYPE_TO_CLASS_NAME$2 = {
    atrule: "AtRule",
    comment: "Comment",
    decl: "Declaration",
    document: "Document",
    root: "Root",
    rule: "Rule"
};
var PLUGIN_PROPS$2 = {
    AtRule: true,
    AtRuleExit: true,
    Comment: true,
    CommentExit: true,
    Declaration: true,
    DeclarationExit: true,
    Document: true,
    DocumentExit: true,
    Once: true,
    OnceExit: true,
    postcssPlugin: true,
    prepare: true,
    Root: true,
    RootExit: true,
    Rule: true,
    RuleExit: true
};
var NOT_VISITORS$2 = {
    Once: true,
    postcssPlugin: true,
    prepare: true
};
var CHILDREN$2 = 0;
function isPromise$2(obj) {
    return (typeof obj === "undefined" ? "undefined" : _type_of(obj)) === "object" && typeof obj.then === "function";
}
function getEvents$2(node2) {
    var key = false;
    var type = TYPE_TO_CLASS_NAME$2[node2.type];
    if (node2.type === "decl") {
        key = node2.prop.toLowerCase();
    } else if (node2.type === "atrule") {
        key = node2.name.toLowerCase();
    }
    if (key && node2.append) {
        return [
            type,
            type + "-" + key,
            CHILDREN$2,
            type + "Exit",
            type + "Exit-" + key
        ];
    } else if (key) {
        return [
            type,
            type + "-" + key,
            type + "Exit",
            type + "Exit-" + key
        ];
    } else if (node2.append) {
        return [
            type,
            CHILDREN$2,
            type + "Exit"
        ];
    } else {
        return [
            type,
            type + "Exit"
        ];
    }
}
function toStack$2(node2) {
    var events;
    if (node2.type === "document") {
        events = [
            "Document",
            CHILDREN$2,
            "DocumentExit"
        ];
    } else if (node2.type === "root") {
        events = [
            "Root",
            CHILDREN$2,
            "RootExit"
        ];
    } else {
        events = getEvents$2(node2);
    }
    return {
        eventIndex: 0,
        events: events,
        iterator: 0,
        node: node2,
        visitorIndex: 0,
        visitors: []
    };
}
function cleanMarks$2(node2) {
    node2[isClean$4] = false;
    if (node2.nodes) node2.nodes.forEach(function(i2) {
        return cleanMarks$2(i2);
    });
    return node2;
}
var postcss$2$2 = {};
var LazyResult$2$2 = /*#__PURE__*/ function() {
    function LazyResult2(processor2, css, opts) {
        var _this = this;
        this.stringified = false;
        this.processed = false;
        var root2;
        if ((typeof css === "undefined" ? "undefined" : _type_of(css)) === "object" && css !== null && (css.type === "root" || css.type === "document")) {
            root2 = cleanMarks$2(css);
        } else if (_instanceof(css, LazyResult2) || _instanceof(css, Result$2$2)) {
            root2 = cleanMarks$2(css.root);
            if (css.map) {
                if (typeof opts.map === "undefined") opts.map = {};
                if (!opts.map.inline) opts.map.inline = false;
                opts.map.prev = css.map;
            }
        } else {
            var parser2 = parse$2$2;
            if (opts.syntax) parser2 = opts.syntax.parse;
            if (opts.parser) parser2 = opts.parser;
            if (parser2.parse) parser2 = parser2.parse;
            try {
                root2 = parser2(css, opts);
            } catch (error) {
                this.processed = true;
                this.error = error;
            }
            if (root2 && !root2[my$4]) {
                Container$1$2.rebuild(root2);
            }
        }
        this.result = new Result$2$2(processor2, root2, opts);
        this.helpers = _extends({}, postcss$2$2, {
            postcss: postcss$2$2,
            result: this.result
        });
        this.plugins = this.processor.plugins.map(function(plugin22) {
            if ((typeof plugin22 === "undefined" ? "undefined" : _type_of(plugin22)) === "object" && plugin22.prepare) {
                return _extends({}, plugin22, plugin22.prepare(_this.result));
            } else {
                return plugin22;
            }
        });
    }
    var _proto = LazyResult2.prototype;
    _proto.async = function async() {
        if (this.error) return Promise.reject(this.error);
        if (this.processed) return Promise.resolve(this.result);
        if (!this.processing) {
            this.processing = this.runAsync();
        }
        return this.processing;
    };
    _proto.catch = function _catch(onRejected) {
        return this.async().catch(onRejected);
    };
    _proto.finally = function _finally(onFinally) {
        return this.async().then(onFinally, onFinally);
    };
    _proto.getAsyncError = function getAsyncError() {
        throw new Error("Use process(css).then(cb) to work with async plugins");
    };
    _proto.handleError = function handleError(error, node2) {
        var plugin22 = this.result.lastPlugin;
        try {
            if (node2) node2.addToError(error);
            this.error = error;
            if (error.name === "CssSyntaxError" && !error.plugin) {
                error.plugin = plugin22.postcssPlugin;
                error.setMessage();
            } else if (plugin22.postcssVersion) {
                if (process.env.NODE_ENV !== "production") {
                    var pluginName = plugin22.postcssPlugin;
                    var pluginVer = plugin22.postcssVersion;
                    var runtimeVer = this.result.processor.version;
                    var a2 = pluginVer.split(".");
                    var b = runtimeVer.split(".");
                    if (a2[0] !== b[0] || parseInt(a2[1]) > parseInt(b[1])) {
                        console.error("Unknown error from PostCSS plugin. Your current PostCSS version is " + runtimeVer + ", but " + pluginName + " uses " + pluginVer + ". Perhaps this is the source of the error below.");
                    }
                }
            }
        } catch (err) {
            if (console && console.error) console.error(err);
        }
        return error;
    };
    _proto.prepareVisitors = function prepareVisitors() {
        var _this = this;
        this.listeners = {};
        var add = function(plugin22, type, cb) {
            if (!_this.listeners[type]) _this.listeners[type] = [];
            _this.listeners[type].push([
                plugin22,
                cb
            ]);
        };
        for(var _iterator = _create_for_of_iterator_helper_loose(this.plugins), _step; !(_step = _iterator()).done;){
            var plugin22 = _step.value;
            if ((typeof plugin22 === "undefined" ? "undefined" : _type_of(plugin22)) === "object") {
                for(var event in plugin22){
                    if (!PLUGIN_PROPS$2[event] && /^[A-Z]/.test(event)) {
                        throw new Error("Unknown event " + event + " in " + plugin22.postcssPlugin + ". Try to update PostCSS (" + this.processor.version + " now).");
                    }
                    if (!NOT_VISITORS$2[event]) {
                        if (_type_of(plugin22[event]) === "object") {
                            for(var filter in plugin22[event]){
                                if (filter === "*") {
                                    add(plugin22, event, plugin22[event][filter]);
                                } else {
                                    add(plugin22, event + "-" + filter.toLowerCase(), plugin22[event][filter]);
                                }
                            }
                        } else if (typeof plugin22[event] === "function") {
                            add(plugin22, event, plugin22[event]);
                        }
                    }
                }
            }
        }
        this.hasListener = Object.keys(this.listeners).length > 0;
    };
    _proto.runAsync = function runAsync() {
        var _this = this;
        return _async_to_generator(function() {
            var i2, plugin22, promise, error, root2, stack, promise1, e2, node2, _loop, _iterator, _step;
            return _ts_generator(this, function(_state) {
                switch(_state.label){
                    case 0:
                        _this.plugin = 0;
                        i2 = 0;
                        _state.label = 1;
                    case 1:
                        if (!(i2 < _this.plugins.length)) return [
                            3,
                            6
                        ];
                        plugin22 = _this.plugins[i2];
                        promise = _this.runOnRoot(plugin22);
                        if (!isPromise$2(promise)) return [
                            3,
                            5
                        ];
                        _state.label = 2;
                    case 2:
                        _state.trys.push([
                            2,
                            4,
                            ,
                            5
                        ]);
                        return [
                            4,
                            promise
                        ];
                    case 3:
                        _state.sent();
                        return [
                            3,
                            5
                        ];
                    case 4:
                        error = _state.sent();
                        throw _this.handleError(error);
                    case 5:
                        i2++;
                        return [
                            3,
                            1
                        ];
                    case 6:
                        _this.prepareVisitors();
                        if (!_this.hasListener) return [
                            3,
                            18
                        ];
                        root2 = _this.result.root;
                        _state.label = 7;
                    case 7:
                        if (!!root2[isClean$4]) return [
                            3,
                            14
                        ];
                        root2[isClean$4] = true;
                        stack = [
                            toStack$2(root2)
                        ];
                        _state.label = 8;
                    case 8:
                        if (!(stack.length > 0)) return [
                            3,
                            13
                        ];
                        promise1 = _this.visitTick(stack);
                        if (!isPromise$2(promise1)) return [
                            3,
                            12
                        ];
                        _state.label = 9;
                    case 9:
                        _state.trys.push([
                            9,
                            11,
                            ,
                            12
                        ]);
                        return [
                            4,
                            promise1
                        ];
                    case 10:
                        _state.sent();
                        return [
                            3,
                            12
                        ];
                    case 11:
                        e2 = _state.sent();
                        node2 = stack[stack.length - 1].node;
                        throw _this.handleError(e2, node2);
                    case 12:
                        return [
                            3,
                            8
                        ];
                    case 13:
                        return [
                            3,
                            7
                        ];
                    case 14:
                        if (!_this.listeners.OnceExit) return [
                            3,
                            18
                        ];
                        _loop = function() {
                            var _step_value, plugin22, visitor, roots, e2;
                            return _ts_generator(this, function(_state) {
                                switch(_state.label){
                                    case 0:
                                        _step_value = _step.value, plugin22 = _step_value[0], visitor = _step_value[1];
                                        _this.result.lastPlugin = plugin22;
                                        _state.label = 1;
                                    case 1:
                                        _state.trys.push([
                                            1,
                                            6,
                                            ,
                                            7
                                        ]);
                                        if (!(root2.type === "document")) return [
                                            3,
                                            3
                                        ];
                                        roots = root2.nodes.map(function(subRoot) {
                                            return visitor(subRoot, _this.helpers);
                                        });
                                        return [
                                            4,
                                            Promise.all(roots)
                                        ];
                                    case 2:
                                        _state.sent();
                                        return [
                                            3,
                                            5
                                        ];
                                    case 3:
                                        return [
                                            4,
                                            visitor(root2, _this.helpers)
                                        ];
                                    case 4:
                                        _state.sent();
                                        _state.label = 5;
                                    case 5:
                                        return [
                                            3,
                                            7
                                        ];
                                    case 6:
                                        e2 = _state.sent();
                                        throw _this.handleError(e2);
                                    case 7:
                                        return [
                                            2
                                        ];
                                }
                            });
                        };
                        _iterator = _create_for_of_iterator_helper_loose(_this.listeners.OnceExit);
                        _state.label = 15;
                    case 15:
                        if (!!(_step = _iterator()).done) return [
                            3,
                            18
                        ];
                        return [
                            5,
                            _ts_values(_loop())
                        ];
                    case 16:
                        _state.sent();
                        _state.label = 17;
                    case 17:
                        return [
                            3,
                            15
                        ];
                    case 18:
                        _this.processed = true;
                        return [
                            2,
                            _this.stringify()
                        ];
                }
            });
        })();
    };
    _proto.runOnRoot = function runOnRoot(plugin22) {
        var _this = this;
        this.result.lastPlugin = plugin22;
        try {
            if ((typeof plugin22 === "undefined" ? "undefined" : _type_of(plugin22)) === "object" && plugin22.Once) {
                if (this.result.root.type === "document") {
                    var roots = this.result.root.nodes.map(function(root2) {
                        return plugin22.Once(root2, _this.helpers);
                    });
                    if (isPromise$2(roots[0])) {
                        return Promise.all(roots);
                    }
                    return roots;
                }
                return plugin22.Once(this.result.root, this.helpers);
            } else if (typeof plugin22 === "function") {
                return plugin22(this.result.root, this.result);
            }
        } catch (error) {
            throw this.handleError(error);
        }
    };
    _proto.stringify = function stringify() {
        if (this.error) throw this.error;
        if (this.stringified) return this.result;
        this.stringified = true;
        this.sync();
        var opts = this.result.opts;
        var str = stringify$2$2;
        if (opts.syntax) str = opts.syntax.stringify;
        if (opts.stringifier) str = opts.stringifier;
        if (str.stringify) str = str.stringify;
        var map = new MapGenerator$1$2(str, this.result.root, this.result.opts);
        var data = map.generate();
        this.result.css = data[0];
        this.result.map = data[1];
        return this.result;
    };
    _proto.sync = function sync() {
        if (this.error) throw this.error;
        if (this.processed) return this.result;
        this.processed = true;
        if (this.processing) {
            throw this.getAsyncError();
        }
        for(var _iterator = _create_for_of_iterator_helper_loose(this.plugins), _step; !(_step = _iterator()).done;){
            var plugin22 = _step.value;
            var promise = this.runOnRoot(plugin22);
            if (isPromise$2(promise)) {
                throw this.getAsyncError();
            }
        }
        this.prepareVisitors();
        if (this.hasListener) {
            var root2 = this.result.root;
            while(!root2[isClean$4]){
                root2[isClean$4] = true;
                this.walkSync(root2);
            }
            if (this.listeners.OnceExit) {
                if (root2.type === "document") {
                    for(var _iterator1 = _create_for_of_iterator_helper_loose(root2.nodes), _step1; !(_step1 = _iterator1()).done;){
                        var subRoot = _step1.value;
                        this.visitSync(this.listeners.OnceExit, subRoot);
                    }
                } else {
                    this.visitSync(this.listeners.OnceExit, root2);
                }
            }
        }
        return this.result;
    };
    _proto.then = function then(onFulfilled, onRejected) {
        if (process.env.NODE_ENV !== "production") {
            if (!("from" in this.opts)) {
                warnOnce$1$2("Without `from` option PostCSS could generate wrong source map and will not find Browserslist config. Set it to CSS file path or to `undefined` to prevent this warning.");
            }
        }
        return this.async().then(onFulfilled, onRejected);
    };
    _proto.toString = function toString() {
        return this.css;
    };
    _proto.visitSync = function visitSync(visitors, node2) {
        for(var _iterator = _create_for_of_iterator_helper_loose(visitors), _step; !(_step = _iterator()).done;){
            var _step_value = _step.value, plugin22 = _step_value[0], visitor = _step_value[1];
            this.result.lastPlugin = plugin22;
            var promise = void 0;
            try {
                promise = visitor(node2, this.helpers);
            } catch (e2) {
                throw this.handleError(e2, node2.proxyOf);
            }
            if (node2.type !== "root" && node2.type !== "document" && !node2.parent) {
                return true;
            }
            if (isPromise$2(promise)) {
                throw this.getAsyncError();
            }
        }
    };
    _proto.visitTick = function visitTick(stack) {
        var visit2 = stack[stack.length - 1];
        var node2 = visit2.node, visitors = visit2.visitors;
        if (node2.type !== "root" && node2.type !== "document" && !node2.parent) {
            stack.pop();
            return;
        }
        if (visitors.length > 0 && visit2.visitorIndex < visitors.length) {
            var _visitors_visit2_visitorIndex = visitors[visit2.visitorIndex], plugin22 = _visitors_visit2_visitorIndex[0], visitor = _visitors_visit2_visitorIndex[1];
            visit2.visitorIndex += 1;
            if (visit2.visitorIndex === visitors.length) {
                visit2.visitors = [];
                visit2.visitorIndex = 0;
            }
            this.result.lastPlugin = plugin22;
            try {
                return visitor(node2.toProxy(), this.helpers);
            } catch (e2) {
                throw this.handleError(e2, node2);
            }
        }
        if (visit2.iterator !== 0) {
            var iterator = visit2.iterator;
            var child;
            while(child = node2.nodes[node2.indexes[iterator]]){
                node2.indexes[iterator] += 1;
                if (!child[isClean$4]) {
                    child[isClean$4] = true;
                    stack.push(toStack$2(child));
                    return;
                }
            }
            visit2.iterator = 0;
            delete node2.indexes[iterator];
        }
        var events = visit2.events;
        while(visit2.eventIndex < events.length){
            var event = events[visit2.eventIndex];
            visit2.eventIndex += 1;
            if (event === CHILDREN$2) {
                if (node2.nodes && node2.nodes.length) {
                    node2[isClean$4] = true;
                    visit2.iterator = node2.getIterator();
                }
                return;
            } else if (this.listeners[event]) {
                visit2.visitors = this.listeners[event];
                return;
            }
        }
        stack.pop();
    };
    _proto.walkSync = function walkSync(node2) {
        var _this = this;
        node2[isClean$4] = true;
        var events = getEvents$2(node2);
        for(var _iterator = _create_for_of_iterator_helper_loose(events), _step; !(_step = _iterator()).done;){
            var event = _step.value;
            if (event === CHILDREN$2) {
                if (node2.nodes) {
                    node2.each(function(child) {
                        if (!child[isClean$4]) _this.walkSync(child);
                    });
                }
            } else {
                var visitors = this.listeners[event];
                if (visitors) {
                    if (this.visitSync(visitors, node2.toProxy())) return;
                }
            }
        }
    };
    _proto.warnings = function warnings() {
        return this.sync().warnings();
    };
    _create_class(LazyResult2, [
        {
            key: "content",
            get: function get() {
                return this.stringify().content;
            }
        },
        {
            key: "css",
            get: function get() {
                return this.stringify().css;
            }
        },
        {
            key: "map",
            get: function get() {
                return this.stringify().map;
            }
        },
        {
            key: "messages",
            get: function get() {
                return this.sync().messages;
            }
        },
        {
            key: "opts",
            get: function get() {
                return this.result.opts;
            }
        },
        {
            key: "processor",
            get: function get() {
                return this.result.processor;
            }
        },
        {
            key: "root",
            get: function get() {
                return this.sync().root;
            }
        },
        {
            key: Symbol.toStringTag,
            get: function get() {
                return "LazyResult";
            }
        }
    ]);
    return LazyResult2;
}();
LazyResult$2$2.registerPostcss = function(dependant) {
    postcss$2$2 = dependant;
};
var lazyResult$2 = LazyResult$2$2;
LazyResult$2$2.default = LazyResult$2$2;
Root$3$2.registerLazyResult(LazyResult$2$2);
Document$2$2.registerLazyResult(LazyResult$2$2);
var MapGenerator22 = mapGenerator$2;
var stringify$1$2 = stringify_1$2;
var warnOnce22 = warnOnce$2$2;
var parse$1$2 = parse_1$2;
var Result$1$2 = result$2;
var NoWorkResult$1$2 = /*#__PURE__*/ function() {
    function NoWorkResult2(processor2, css, opts) {
        css = css.toString();
        this.stringified = false;
        this._processor = processor2;
        this._css = css;
        this._opts = opts;
        this._map = void 0;
        var root2;
        var str = stringify$1$2;
        this.result = new Result$1$2(this._processor, root2, this._opts);
        this.result.css = css;
        var self = this;
        Object.defineProperty(this.result, "root", {
            get: function get() {
                return self.root;
            }
        });
        var map = new MapGenerator22(str, root2, this._opts, css);
        if (map.isMap()) {
            var _map_generate = map.generate(), generatedCSS = _map_generate[0], generatedMap = _map_generate[1];
            if (generatedCSS) {
                this.result.css = generatedCSS;
            }
            if (generatedMap) {
                this.result.map = generatedMap;
            }
        } else {
            map.clearAnnotation();
            this.result.css = map.css;
        }
    }
    var _proto = NoWorkResult2.prototype;
    _proto.async = function async() {
        if (this.error) return Promise.reject(this.error);
        return Promise.resolve(this.result);
    };
    _proto.catch = function _catch(onRejected) {
        return this.async().catch(onRejected);
    };
    _proto.finally = function _finally(onFinally) {
        return this.async().then(onFinally, onFinally);
    };
    _proto.sync = function sync() {
        if (this.error) throw this.error;
        return this.result;
    };
    _proto.then = function then(onFulfilled, onRejected) {
        if (process.env.NODE_ENV !== "production") {
            if (!("from" in this._opts)) {
                warnOnce22("Without `from` option PostCSS could generate wrong source map and will not find Browserslist config. Set it to CSS file path or to `undefined` to prevent this warning.");
            }
        }
        return this.async().then(onFulfilled, onRejected);
    };
    _proto.toString = function toString() {
        return this._css;
    };
    _proto.warnings = function warnings() {
        return [];
    };
    _create_class(NoWorkResult2, [
        {
            key: "content",
            get: function get() {
                return this.result.css;
            }
        },
        {
            key: "css",
            get: function get() {
                return this.result.css;
            }
        },
        {
            key: "map",
            get: function get() {
                return this.result.map;
            }
        },
        {
            key: "messages",
            get: function get() {
                return [];
            }
        },
        {
            key: "opts",
            get: function get() {
                return this.result.opts;
            }
        },
        {
            key: "processor",
            get: function get() {
                return this.result.processor;
            }
        },
        {
            key: "root",
            get: function get() {
                if (this._root) {
                    return this._root;
                }
                var root2;
                var parser2 = parse$1$2;
                try {
                    root2 = parser2(this._css, this._opts);
                } catch (error) {
                    this.error = error;
                }
                if (this.error) {
                    throw this.error;
                } else {
                    this._root = root2;
                    return root2;
                }
            }
        },
        {
            key: Symbol.toStringTag,
            get: function get() {
                return "NoWorkResult";
            }
        }
    ]);
    return NoWorkResult2;
}();
var noWorkResult$2 = NoWorkResult$1$2;
NoWorkResult$1$2.default = NoWorkResult$1$2;
var NoWorkResult22 = noWorkResult$2;
var LazyResult$1$2 = lazyResult$2;
var Document$1$2 = document$1$2;
var Root$2$2 = root$2;
var Processor$1$2 = /*#__PURE__*/ function() {
    function Processor2(plugins) {
        if (plugins === void 0) plugins = [];
        this.version = "8.4.38";
        this.plugins = this.normalize(plugins);
    }
    var _proto = Processor2.prototype;
    _proto.normalize = function normalize(plugins) {
        var normalized = [];
        for(var _iterator = _create_for_of_iterator_helper_loose(plugins), _step; !(_step = _iterator()).done;){
            var i2 = _step.value;
            if (i2.postcss === true) {
                i2 = i2();
            } else if (i2.postcss) {
                i2 = i2.postcss;
            }
            if ((typeof i2 === "undefined" ? "undefined" : _type_of(i2)) === "object" && Array.isArray(i2.plugins)) {
                normalized = normalized.concat(i2.plugins);
            } else if ((typeof i2 === "undefined" ? "undefined" : _type_of(i2)) === "object" && i2.postcssPlugin) {
                normalized.push(i2);
            } else if (typeof i2 === "function") {
                normalized.push(i2);
            } else if ((typeof i2 === "undefined" ? "undefined" : _type_of(i2)) === "object" && (i2.parse || i2.stringify)) {
                if (process.env.NODE_ENV !== "production") {
                    throw new Error("PostCSS syntaxes cannot be used as plugins. Instead, please use one of the syntax/parser/stringifier options as outlined in your PostCSS runner documentation.");
                }
            } else {
                throw new Error(i2 + " is not a PostCSS plugin");
            }
        }
        return normalized;
    };
    _proto.process = function process1(css, opts) {
        if (opts === void 0) opts = {};
        if (!this.plugins.length && !opts.parser && !opts.stringifier && !opts.syntax) {
            return new NoWorkResult22(this, css, opts);
        } else {
            return new LazyResult$1$2(this, css, opts);
        }
    };
    _proto.use = function use(plugin22) {
        this.plugins = this.plugins.concat(this.normalize([
            plugin22
        ]));
        return this;
    };
    return Processor2;
}();
var processor$2 = Processor$1$2;
Processor$1$2.default = Processor$1$2;
Root$2$2.registerProcessor(Processor$1$2);
Document$1$2.registerProcessor(Processor$1$2);
var Declaration$1$2 = declaration$2;
var PreviousMap22 = previousMap$2;
var Comment$1$2 = comment$2;
var AtRule$1$2 = atRule$2;
var Input$1$2 = input$2;
var Root$1$2 = root$2;
var Rule$1$2 = rule$2;
function fromJSON$1$2(json, inputs) {
    if (Array.isArray(json)) return json.map(function(n2) {
        return fromJSON$1$2(n2);
    });
    var ownInputs = json.inputs, defaults = _object_without_properties_loose(json, [
        "inputs"
    ]);
    if (ownInputs) {
        inputs = [];
        for(var _iterator = _create_for_of_iterator_helper_loose(ownInputs), _step; !(_step = _iterator()).done;){
            var input2 = _step.value;
            var inputHydrated = _extends({}, input2, {
                __proto__: Input$1$2.prototype
            });
            if (inputHydrated.map) {
                inputHydrated.map = _extends({}, inputHydrated.map, {
                    __proto__: PreviousMap22.prototype
                });
            }
            inputs.push(inputHydrated);
        }
    }
    if (defaults.nodes) {
        defaults.nodes = json.nodes.map(function(n2) {
            return fromJSON$1$2(n2, inputs);
        });
    }
    if (defaults.source) {
        var _defaults_source = defaults.source, inputId = _defaults_source.inputId, source = _object_without_properties_loose(_defaults_source, [
            "inputId"
        ]);
        defaults.source = source;
        if (inputId != null) {
            defaults.source.input = inputs[inputId];
        }
    }
    if (defaults.type === "root") {
        return new Root$1$2(defaults);
    } else if (defaults.type === "decl") {
        return new Declaration$1$2(defaults);
    } else if (defaults.type === "rule") {
        return new Rule$1$2(defaults);
    } else if (defaults.type === "comment") {
        return new Comment$1$2(defaults);
    } else if (defaults.type === "atrule") {
        return new AtRule$1$2(defaults);
    } else {
        throw new Error("Unknown node type: " + json.type);
    }
}
var fromJSON_1$2 = fromJSON$1$2;
fromJSON$1$2.default = fromJSON$1$2;
var CssSyntaxError22 = cssSyntaxError$2;
var Declaration22 = declaration$2;
var LazyResult22 = lazyResult$2;
var Container22 = container$2;
var Processor22 = processor$2;
var stringify$6 = stringify_1$2;
var fromJSON$3 = fromJSON_1$2;
var Document222 = document$1$2;
var Warning22 = warning$2;
var Comment22 = comment$2;
var AtRule22 = atRule$2;
var Result22 = result$2;
var Input22 = input$2;
var parse$6 = parse_1$2;
var list$4 = list_1$2;
var Rule22 = rule$2;
var Root22 = root$2;
var Node22 = node$2;
function postcss$4() {
    for(var _len = arguments.length, plugins = new Array(_len), _key = 0; _key < _len; _key++){
        plugins[_key] = arguments[_key];
    }
    if (plugins.length === 1 && Array.isArray(plugins[0])) {
        plugins = plugins[0];
    }
    return new Processor22(plugins);
}
postcss$4.plugin = function plugin2(name, initializer) {
    var warningPrinted = false;
    function creator() {
        for(var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++){
            args[_key] = arguments[_key];
        }
        if (console && console.warn && !warningPrinted) {
            warningPrinted = true;
            console.warn(name + ": postcss.plugin was deprecated. Migration guide:\nhttps://evilmartians.com/chronicles/postcss-8-plugin-migration");
            if (process.env.LANG && process.env.LANG.startsWith("cn")) {
                console.warn(name + ": 里面 postcss.plugin 被弃用. 迁移指南:\nhttps://www.w3ctech.com/topic/2226");
            }
        }
        var transformer = initializer.apply(void 0, [].concat(args));
        transformer.postcssPlugin = name;
        transformer.postcssVersion = new Processor22().version;
        return transformer;
    }
    var cache;
    Object.defineProperty(creator, "postcss", {
        get: function get() {
            if (!cache) cache = creator();
            return cache;
        }
    });
    creator.process = function(css, processOpts, pluginOpts) {
        return postcss$4([
            creator(pluginOpts)
        ]).process(css, processOpts);
    };
    return creator;
};
postcss$4.stringify = stringify$6;
postcss$4.parse = parse$6;
postcss$4.fromJSON = fromJSON$3;
postcss$4.list = list$4;
postcss$4.comment = function(defaults) {
    return new Comment22(defaults);
};
postcss$4.atRule = function(defaults) {
    return new AtRule22(defaults);
};
postcss$4.decl = function(defaults) {
    return new Declaration22(defaults);
};
postcss$4.rule = function(defaults) {
    return new Rule22(defaults);
};
postcss$4.root = function(defaults) {
    return new Root22(defaults);
};
postcss$4.document = function(defaults) {
    return new Document222(defaults);
};
postcss$4.CssSyntaxError = CssSyntaxError22;
postcss$4.Declaration = Declaration22;
postcss$4.Container = Container22;
postcss$4.Processor = Processor22;
postcss$4.Document = Document222;
postcss$4.Comment = Comment22;
postcss$4.Warning = Warning22;
postcss$4.AtRule = AtRule22;
postcss$4.Result = Result22;
postcss$4.Input = Input22;
postcss$4.Rule = Rule22;
postcss$4.Root = Root22;
postcss$4.Node = Node22;
LazyResult22.registerPostcss(postcss$4);
var postcss_1$2 = postcss$4;
postcss$4.default = postcss$4;
var postcss$1$2 = /* @__PURE__ */ getDefaultExportFromCjs$2(postcss_1$2);
postcss$1$2.stringify;
postcss$1$2.fromJSON;
postcss$1$2.plugin;
postcss$1$2.parse;
postcss$1$2.list;
postcss$1$2.document;
postcss$1$2.comment;
postcss$1$2.atRule;
postcss$1$2.rule;
postcss$1$2.decl;
postcss$1$2.root;
postcss$1$2.CssSyntaxError;
postcss$1$2.Declaration;
postcss$1$2.Container;
postcss$1$2.Processor;
postcss$1$2.Document;
postcss$1$2.Comment;
postcss$1$2.Warning;
postcss$1$2.AtRule;
postcss$1$2.Result;
postcss$1$2.Input;
postcss$1$2.Rule;
postcss$1$2.Root;
postcss$1$2.Node;
var BaseRRNode = /*#__PURE__*/ function() {
    function BaseRRNode() {
        for(var _len = arguments.length, _args = new Array(_len), _key = 0; _key < _len; _key++){
            _args[_key] = arguments[_key];
        }
        __publicField2(this, "parentElement", null);
        __publicField2(this, "parentNode", null);
        __publicField2(this, "ownerDocument");
        __publicField2(this, "firstChild", null);
        __publicField2(this, "lastChild", null);
        __publicField2(this, "previousSibling", null);
        __publicField2(this, "nextSibling", null);
        __publicField2(this, "ELEMENT_NODE", 1);
        __publicField2(this, "TEXT_NODE", 3);
        __publicField2(this, "nodeType");
        __publicField2(this, "nodeName");
        __publicField2(this, "RRNodeType");
    }
    var _proto = BaseRRNode.prototype;
    _proto.contains = function contains(node2) {
        if (!_instanceof(node2, BaseRRNode)) return false;
        else if (node2.ownerDocument !== this.ownerDocument) return false;
        else if (node2 === this) return true;
        while(node2.parentNode){
            if (node2.parentNode === this) return true;
            node2 = node2.parentNode;
        }
        return false;
    };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _proto.appendChild = function appendChild(_newChild) {
        throw new Error("RRDomException: Failed to execute 'appendChild' on 'RRNode': This RRNode type does not support this method.");
    };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _proto.insertBefore = function insertBefore(_newChild, _refChild) {
        throw new Error("RRDomException: Failed to execute 'insertBefore' on 'RRNode': This RRNode type does not support this method.");
    };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _proto.removeChild = function removeChild(_node) {
        throw new Error("RRDomException: Failed to execute 'removeChild' on 'RRNode': This RRNode type does not support this method.");
    };
    _proto.toString = function toString() {
        return "RRNode";
    };
    _create_class(BaseRRNode, [
        {
            key: "childNodes",
            get: function get() {
                var childNodes2 = [];
                var childIterator = this.firstChild;
                while(childIterator){
                    childNodes2.push(childIterator);
                    childIterator = childIterator.nextSibling;
                }
                return childNodes2;
            }
        }
    ]);
    return BaseRRNode;
}();
var testableAccessors$2 = {
    Node: [
        "childNodes",
        "parentNode",
        "parentElement",
        "textContent"
    ],
    ShadowRoot: [
        "host",
        "styleSheets"
    ],
    Element: [
        "shadowRoot",
        "querySelector",
        "querySelectorAll"
    ],
    MutationObserver: []
};
var testableMethods$2 = {
    Node: [
        "contains",
        "getRootNode"
    ],
    ShadowRoot: [
        "getSelection"
    ],
    Element: [],
    MutationObserver: [
        "constructor"
    ]
};
var untaintedBasePrototype$2 = {};
var isAngularZonePresent$2 = function() {
    return !!globalThis.Zone;
};
function getUntaintedPrototype$2(key) {
    if (untaintedBasePrototype$2[key]) return untaintedBasePrototype$2[key];
    var defaultObj = globalThis[key];
    var defaultPrototype = defaultObj.prototype;
    var accessorNames = key in testableAccessors$2 ? testableAccessors$2[key] : void 0;
    var isUntaintedAccessors = Boolean(accessorNames && // @ts-expect-error 2345
    accessorNames.every(function(accessor) {
        var _a2, _b;
        return Boolean((_b = (_a2 = Object.getOwnPropertyDescriptor(defaultPrototype, accessor)) == null ? void 0 : _a2.get) == null ? void 0 : _b.toString().includes("[native code]"));
    }));
    var methodNames = key in testableMethods$2 ? testableMethods$2[key] : void 0;
    var isUntaintedMethods = Boolean(methodNames && methodNames.every(// @ts-expect-error 2345
    function(method) {
        var _a2;
        return typeof defaultPrototype[method] === "function" && ((_a2 = defaultPrototype[method]) == null ? void 0 : _a2.toString().includes("[native code]"));
    }));
    if (isUntaintedAccessors && isUntaintedMethods && !isAngularZonePresent$2()) {
        untaintedBasePrototype$2[key] = defaultObj.prototype;
        return defaultObj.prototype;
    }
    try {
        var iframeEl = document.createElement("iframe");
        document.body.appendChild(iframeEl);
        var win = iframeEl.contentWindow;
        if (!win) return defaultObj.prototype;
        var untaintedObject = win[key].prototype;
        document.body.removeChild(iframeEl);
        if (!untaintedObject) return defaultPrototype;
        return untaintedBasePrototype$2[key] = untaintedObject;
    } catch (e) {
        return defaultPrototype;
    }
}
var untaintedAccessorCache$2 = {};
function getUntaintedAccessor$2(key, instance, accessor) {
    var _a2;
    var cacheKey = key + "." + String(accessor);
    if (untaintedAccessorCache$2[cacheKey]) return untaintedAccessorCache$2[cacheKey].call(instance);
    var untaintedPrototype = getUntaintedPrototype$2(key);
    var untaintedAccessor = (_a2 = Object.getOwnPropertyDescriptor(untaintedPrototype, accessor)) == null ? void 0 : _a2.get;
    if (!untaintedAccessor) return instance[accessor];
    untaintedAccessorCache$2[cacheKey] = untaintedAccessor;
    return untaintedAccessor.call(instance);
}
var untaintedMethodCache$2 = {};
function getUntaintedMethod$2(key, instance, method) {
    var cacheKey = key + "." + String(method);
    if (untaintedMethodCache$2[cacheKey]) return untaintedMethodCache$2[cacheKey].bind(instance);
    var untaintedPrototype = getUntaintedPrototype$2(key);
    var untaintedMethod = untaintedPrototype[method];
    if (typeof untaintedMethod !== "function") return instance[method];
    untaintedMethodCache$2[cacheKey] = untaintedMethod;
    return untaintedMethod.bind(instance);
}
function childNodes$2(n2) {
    return getUntaintedAccessor$2("Node", n2, "childNodes");
}
function parentNode$2(n2) {
    return getUntaintedAccessor$2("Node", n2, "parentNode");
}
function parentElement$2(n2) {
    return getUntaintedAccessor$2("Node", n2, "parentElement");
}
function textContent$2(n2) {
    return getUntaintedAccessor$2("Node", n2, "textContent");
}
function contains$2(n2, other) {
    return getUntaintedMethod$2("Node", n2, "contains")(other);
}
function getRootNode$2(n2) {
    return getUntaintedMethod$2("Node", n2, "getRootNode")();
}
function host$2(n2) {
    if (!n2 || !("host" in n2)) return null;
    return getUntaintedAccessor$2("ShadowRoot", n2, "host");
}
function styleSheets$2(n2) {
    return n2.styleSheets;
}
function shadowRoot$2(n2) {
    if (!n2 || !("shadowRoot" in n2)) return null;
    return getUntaintedAccessor$2("Element", n2, "shadowRoot");
}
function querySelector$2(n2, selectors) {
    return getUntaintedAccessor$2("Element", n2, "querySelector")(selectors);
}
function querySelectorAll$2(n2, selectors) {
    return getUntaintedAccessor$2("Element", n2, "querySelectorAll")(selectors);
}
function mutationObserverCtor$2() {
    return getUntaintedPrototype$2("MutationObserver").constructor;
}
function patch$2(source, name, replacement) {
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
var index$2 = {
    childNodes: childNodes$2,
    parentNode: parentNode$2,
    parentElement: parentElement$2,
    textContent: textContent$2,
    contains: contains$2,
    getRootNode: getRootNode$2,
    host: host$2,
    styleSheets: styleSheets$2,
    shadowRoot: shadowRoot$2,
    querySelector: querySelector$2,
    querySelectorAll: querySelectorAll$2,
    mutationObserver: mutationObserverCtor$2,
    patch: patch$2
};
function on(type, fn, target) {
    if (target === void 0) target = document;
    var options = {
        capture: true,
        passive: true
    };
    target.addEventListener(type, fn, options);
    return function() {
        return target.removeEventListener(type, fn, options);
    };
}
var DEPARTED_MIRROR_ACCESS_WARNING = "Please stop import mirror directly. Instead of that,\r\nnow you can use replayer.getMirror() to access the mirror instance of a replayer,\r\nor you can use record.mirror to access the mirror instance during recording.";
var _mirror = {
    map: {},
    getId: function getId() {
        console.error(DEPARTED_MIRROR_ACCESS_WARNING);
        return -1;
    },
    getNode: function getNode() {
        console.error(DEPARTED_MIRROR_ACCESS_WARNING);
        return null;
    },
    removeNodeFromMap: function removeNodeFromMap() {
        console.error(DEPARTED_MIRROR_ACCESS_WARNING);
    },
    has: function has() {
        console.error(DEPARTED_MIRROR_ACCESS_WARNING);
        return false;
    },
    reset: function reset() {
        console.error(DEPARTED_MIRROR_ACCESS_WARNING);
    }
};
if (typeof window !== "undefined" && window.Proxy && window.Reflect) {
    _mirror = new Proxy(_mirror, {
        get: function get(target, prop, receiver) {
            if (prop === "map") {
                console.error(DEPARTED_MIRROR_ACCESS_WARNING);
            }
            return Reflect.get(target, prop, receiver);
        }
    });
}
function throttle(func, wait, options) {
    if (options === void 0) options = {};
    var timeout = null;
    var previous = 0;
    return function() {
        for(var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++){
            args[_key] = arguments[_key];
        }
        var now = Date.now();
        if (!previous && options.leading === false) {
            previous = now;
        }
        var remaining = wait - (now - previous);
        var context = this;
        if (remaining <= 0 || remaining > wait) {
            if (timeout) {
                clearTimeout(timeout);
                timeout = null;
            }
            previous = now;
            func.apply(context, args);
        } else if (!timeout && options.trailing !== false) {
            timeout = setTimeout(function() {
                previous = options.leading === false ? 0 : Date.now();
                timeout = null;
                func.apply(context, args);
            }, remaining);
        }
    };
}
function hookSetter(target, key, d, isRevoked, win) {
    if (win === void 0) win = window;
    var original = win.Object.getOwnPropertyDescriptor(target, key);
    win.Object.defineProperty(target, key, isRevoked ? d : {
        set: function set(value) {
            var _this = this;
            setTimeout(function() {
                d.set.call(_this, value);
            }, 0);
            if (original && original.set) {
                original.set.call(this, value);
            }
        }
    });
    return function() {
        return hookSetter(target, key, original || {}, true);
    };
}
var nowTimestamp = Date.now;
if (!/* @__PURE__ */ /[1-9][0-9]{12}/.test(Date.now().toString())) {
    nowTimestamp = function() {
        return /* @__PURE__ */ new Date().getTime();
    };
}
function getWindowScroll(win) {
    var _a2, _b, _c, _d;
    var doc = win.document;
    return {
        left: doc.scrollingElement ? doc.scrollingElement.scrollLeft : win.pageXOffset !== void 0 ? win.pageXOffset : doc.documentElement.scrollLeft || (doc == null ? void 0 : doc.body) && ((_a2 = index$2.parentElement(doc.body)) == null ? void 0 : _a2.scrollLeft) || ((_b = doc == null ? void 0 : doc.body) == null ? void 0 : _b.scrollLeft) || 0,
        top: doc.scrollingElement ? doc.scrollingElement.scrollTop : win.pageYOffset !== void 0 ? win.pageYOffset : (doc == null ? void 0 : doc.documentElement.scrollTop) || (doc == null ? void 0 : doc.body) && ((_c = index$2.parentElement(doc.body)) == null ? void 0 : _c.scrollTop) || ((_d = doc == null ? void 0 : doc.body) == null ? void 0 : _d.scrollTop) || 0
    };
}
function getWindowHeight() {
    return window.innerHeight || document.documentElement && document.documentElement.clientHeight || document.body && document.body.clientHeight;
}
function getWindowWidth() {
    return window.innerWidth || document.documentElement && document.documentElement.clientWidth || document.body && document.body.clientWidth;
}
function closestElementOfNode(node2) {
    if (!node2) {
        return null;
    }
    var el = node2.nodeType === node2.ELEMENT_NODE ? node2 : index$2.parentElement(node2);
    return el;
}
function isBlocked(node2, blockClass, blockSelector, checkAncestors) {
    if (!node2) {
        return false;
    }
    var el = closestElementOfNode(node2);
    if (!el) {
        return false;
    }
    try {
        if (typeof blockClass === "string") {
            if (el.classList.contains(blockClass)) return true;
            if (checkAncestors && el.closest("." + blockClass) !== null) return true;
        } else {
            if (classMatchesRegex$1(el, blockClass, checkAncestors)) return true;
        }
    } catch (e2) {}
    if (blockSelector) {
        if (el.matches(blockSelector)) return true;
        if (checkAncestors && el.closest(blockSelector) !== null) return true;
    }
    return false;
}
function isSerialized(n2, mirror2) {
    return mirror2.getId(n2) !== -1;
}
function isIgnored(n2, mirror2, slimDOMOptions) {
    if (n2.tagName === "TITLE" && slimDOMOptions.headTitleMutations) {
        return true;
    }
    return mirror2.getId(n2) === IGNORED_NODE;
}
function isAncestorRemoved(target, mirror2) {
    if (isShadowRoot(target)) {
        return false;
    }
    var id = mirror2.getId(target);
    if (!mirror2.has(id)) {
        return true;
    }
    var parent = index$2.parentNode(target);
    if (parent && parent.nodeType === target.DOCUMENT_NODE) {
        return false;
    }
    if (!parent) {
        return true;
    }
    return isAncestorRemoved(parent, mirror2);
}
function legacy_isTouchEvent(event) {
    return Boolean(event.changedTouches);
}
function polyfill$1(win) {
    if (win === void 0) win = window;
    if ("NodeList" in win && !win.NodeList.prototype.forEach) {
        win.NodeList.prototype.forEach = Array.prototype.forEach;
    }
    if ("DOMTokenList" in win && !win.DOMTokenList.prototype.forEach) {
        win.DOMTokenList.prototype.forEach = Array.prototype.forEach;
    }
}
function isSerializedIframe(n2, mirror2) {
    return Boolean(n2.nodeName === "IFRAME" && mirror2.getMeta(n2));
}
function isSerializedStylesheet(n2, mirror2) {
    return Boolean(n2.nodeName === "LINK" && n2.nodeType === n2.ELEMENT_NODE && n2.getAttribute && n2.getAttribute("rel") === "stylesheet" && mirror2.getMeta(n2));
}
function hasShadowRoot(n2) {
    if (!n2) return false;
    if (_instanceof(n2, BaseRRNode) && "shadowRoot" in n2) {
        return Boolean(n2.shadowRoot);
    }
    return Boolean(index$2.shadowRoot(n2));
}
var StyleSheetMirror = /*#__PURE__*/ function() {
    function StyleSheetMirror() {
        __publicField$1(this, "id", 1);
        __publicField$1(this, "styleIDMap", /* @__PURE__ */ new WeakMap());
        __publicField$1(this, "idStyleMap", /* @__PURE__ */ new Map());
    }
    var _proto = StyleSheetMirror.prototype;
    _proto.getId = function getId(stylesheet) {
        var _this_styleIDMap_get;
        return (_this_styleIDMap_get = this.styleIDMap.get(stylesheet)) != null ? _this_styleIDMap_get : -1;
    };
    _proto.has = function has(stylesheet) {
        return this.styleIDMap.has(stylesheet);
    };
    /**
   * @returns If the stylesheet is in the mirror, returns the id of the stylesheet. If not, return the new assigned id.
   */ _proto.add = function add(stylesheet, id) {
        if (this.has(stylesheet)) return this.getId(stylesheet);
        var newId;
        if (id === void 0) {
            newId = this.id++;
        } else newId = id;
        this.styleIDMap.set(stylesheet, newId);
        this.idStyleMap.set(newId, stylesheet);
        return newId;
    };
    _proto.getStyle = function getStyle(id) {
        return this.idStyleMap.get(id) || null;
    };
    _proto.reset = function reset() {
        this.styleIDMap = /* @__PURE__ */ new WeakMap();
        this.idStyleMap = /* @__PURE__ */ new Map();
        this.id = 1;
    };
    _proto.generateId = function generateId() {
        return this.id++;
    };
    return StyleSheetMirror;
}();
function getShadowHost(n2) {
    var _a2;
    var shadowHost = null;
    if ("getRootNode" in n2 && ((_a2 = index$2.getRootNode(n2)) == null ? void 0 : _a2.nodeType) === Node.DOCUMENT_FRAGMENT_NODE && index$2.host(index$2.getRootNode(n2))) shadowHost = index$2.host(index$2.getRootNode(n2));
    return shadowHost;
}
function getRootShadowHost(n2) {
    var rootShadowHost = n2;
    var shadowHost;
    while(shadowHost = getShadowHost(rootShadowHost))rootShadowHost = shadowHost;
    return rootShadowHost;
}
function shadowHostInDom(n2) {
    var doc = n2.ownerDocument;
    if (!doc) return false;
    var shadowHost = getRootShadowHost(n2);
    return index$2.contains(doc, shadowHost);
}
function inDom(n2) {
    var doc = n2.ownerDocument;
    if (!doc) return false;
    return index$2.contains(doc, n2) || shadowHostInDom(n2);
}
var EventType = /* @__PURE__ */ function(EventType2) {
    EventType2[EventType2["DomContentLoaded"] = 0] = "DomContentLoaded";
    EventType2[EventType2["Load"] = 1] = "Load";
    EventType2[EventType2["FullSnapshot"] = 2] = "FullSnapshot";
    EventType2[EventType2["IncrementalSnapshot"] = 3] = "IncrementalSnapshot";
    EventType2[EventType2["Meta"] = 4] = "Meta";
    EventType2[EventType2["Custom"] = 5] = "Custom";
    EventType2[EventType2["Plugin"] = 6] = "Plugin";
    return EventType2;
}(EventType || {});
var IncrementalSource = /* @__PURE__ */ function(IncrementalSource2) {
    IncrementalSource2[IncrementalSource2["Mutation"] = 0] = "Mutation";
    IncrementalSource2[IncrementalSource2["MouseMove"] = 1] = "MouseMove";
    IncrementalSource2[IncrementalSource2["MouseInteraction"] = 2] = "MouseInteraction";
    IncrementalSource2[IncrementalSource2["Scroll"] = 3] = "Scroll";
    IncrementalSource2[IncrementalSource2["ViewportResize"] = 4] = "ViewportResize";
    IncrementalSource2[IncrementalSource2["Input"] = 5] = "Input";
    IncrementalSource2[IncrementalSource2["TouchMove"] = 6] = "TouchMove";
    IncrementalSource2[IncrementalSource2["MediaInteraction"] = 7] = "MediaInteraction";
    IncrementalSource2[IncrementalSource2["StyleSheetRule"] = 8] = "StyleSheetRule";
    IncrementalSource2[IncrementalSource2["CanvasMutation"] = 9] = "CanvasMutation";
    IncrementalSource2[IncrementalSource2["Font"] = 10] = "Font";
    IncrementalSource2[IncrementalSource2["Log"] = 11] = "Log";
    IncrementalSource2[IncrementalSource2["Drag"] = 12] = "Drag";
    IncrementalSource2[IncrementalSource2["StyleDeclaration"] = 13] = "StyleDeclaration";
    IncrementalSource2[IncrementalSource2["Selection"] = 14] = "Selection";
    IncrementalSource2[IncrementalSource2["AdoptedStyleSheet"] = 15] = "AdoptedStyleSheet";
    IncrementalSource2[IncrementalSource2["CustomElement"] = 16] = "CustomElement";
    return IncrementalSource2;
}(IncrementalSource || {});
var MouseInteractions = /* @__PURE__ */ function(MouseInteractions2) {
    MouseInteractions2[MouseInteractions2["MouseUp"] = 0] = "MouseUp";
    MouseInteractions2[MouseInteractions2["MouseDown"] = 1] = "MouseDown";
    MouseInteractions2[MouseInteractions2["Click"] = 2] = "Click";
    MouseInteractions2[MouseInteractions2["ContextMenu"] = 3] = "ContextMenu";
    MouseInteractions2[MouseInteractions2["DblClick"] = 4] = "DblClick";
    MouseInteractions2[MouseInteractions2["Focus"] = 5] = "Focus";
    MouseInteractions2[MouseInteractions2["Blur"] = 6] = "Blur";
    MouseInteractions2[MouseInteractions2["TouchStart"] = 7] = "TouchStart";
    MouseInteractions2[MouseInteractions2["TouchMove_Departed"] = 8] = "TouchMove_Departed";
    MouseInteractions2[MouseInteractions2["TouchEnd"] = 9] = "TouchEnd";
    MouseInteractions2[MouseInteractions2["TouchCancel"] = 10] = "TouchCancel";
    return MouseInteractions2;
}(MouseInteractions || {});
var PointerTypes = /* @__PURE__ */ function(PointerTypes2) {
    PointerTypes2[PointerTypes2["Mouse"] = 0] = "Mouse";
    PointerTypes2[PointerTypes2["Pen"] = 1] = "Pen";
    PointerTypes2[PointerTypes2["Touch"] = 2] = "Touch";
    return PointerTypes2;
}(PointerTypes || {});
var CanvasContext = /* @__PURE__ */ function(CanvasContext2) {
    CanvasContext2[CanvasContext2["2D"] = 0] = "2D";
    CanvasContext2[CanvasContext2["WebGL"] = 1] = "WebGL";
    CanvasContext2[CanvasContext2["WebGL2"] = 2] = "WebGL2";
    return CanvasContext2;
}(CanvasContext || {});
var MediaInteractions = /* @__PURE__ */ function(MediaInteractions2) {
    MediaInteractions2[MediaInteractions2["Play"] = 0] = "Play";
    MediaInteractions2[MediaInteractions2["Pause"] = 1] = "Pause";
    MediaInteractions2[MediaInteractions2["Seeked"] = 2] = "Seeked";
    MediaInteractions2[MediaInteractions2["VolumeChange"] = 3] = "VolumeChange";
    MediaInteractions2[MediaInteractions2["RateChange"] = 4] = "RateChange";
    return MediaInteractions2;
}(MediaInteractions || {});
var NodeType = /* @__PURE__ */ function(NodeType2) {
    NodeType2[NodeType2["Document"] = 0] = "Document";
    NodeType2[NodeType2["DocumentType"] = 1] = "DocumentType";
    NodeType2[NodeType2["Element"] = 2] = "Element";
    NodeType2[NodeType2["Text"] = 3] = "Text";
    NodeType2[NodeType2["CDATA"] = 4] = "CDATA";
    NodeType2[NodeType2["Comment"] = 5] = "Comment";
    return NodeType2;
}(NodeType || {});
function isNodeInLinkedList(n2) {
    return "__ln" in n2;
}
var DoubleLinkedList = /*#__PURE__*/ function() {
    function DoubleLinkedList() {
        __publicField$1(this, "length", 0);
        __publicField$1(this, "head", null);
        __publicField$1(this, "tail", null);
    }
    var _proto = DoubleLinkedList.prototype;
    _proto.get = function get(position) {
        if (position >= this.length) {
            throw new Error("Position outside of list range");
        }
        var current = this.head;
        for(var index2 = 0; index2 < position; index2++){
            current = (current == null ? void 0 : current.next) || null;
        }
        return current;
    };
    _proto.addNode = function addNode(n2) {
        var node2 = {
            value: n2,
            previous: null,
            next: null
        };
        n2.__ln = node2;
        if (n2.previousSibling && isNodeInLinkedList(n2.previousSibling)) {
            var current = n2.previousSibling.__ln.next;
            node2.next = current;
            node2.previous = n2.previousSibling.__ln;
            n2.previousSibling.__ln.next = node2;
            if (current) {
                current.previous = node2;
            }
        } else if (n2.nextSibling && isNodeInLinkedList(n2.nextSibling) && n2.nextSibling.__ln.previous) {
            var current1 = n2.nextSibling.__ln.previous;
            node2.previous = current1;
            node2.next = n2.nextSibling.__ln;
            n2.nextSibling.__ln.previous = node2;
            if (current1) {
                current1.next = node2;
            }
        } else {
            if (this.head) {
                this.head.previous = node2;
            }
            node2.next = this.head;
            this.head = node2;
        }
        if (node2.next === null) {
            this.tail = node2;
        }
        this.length++;
    };
    _proto.removeNode = function removeNode(n2) {
        var current = n2.__ln;
        if (!this.head) {
            return;
        }
        if (!current.previous) {
            this.head = current.next;
            if (this.head) {
                this.head.previous = null;
            } else {
                this.tail = null;
            }
        } else {
            current.previous.next = current.next;
            if (current.next) {
                current.next.previous = current.previous;
            } else {
                this.tail = current.previous;
            }
        }
        if (n2.__ln) {
            delete n2.__ln;
        }
        this.length--;
    };
    return DoubleLinkedList;
}();
var moveKey = function(id, parentId) {
    return id + "@" + parentId;
};
var MutationBuffer = /*#__PURE__*/ function() {
    function MutationBuffer() {
        var _this = this;
        __publicField$1(this, "frozen", false);
        __publicField$1(this, "locked", false);
        __publicField$1(this, "texts", []);
        __publicField$1(this, "attributes", []);
        __publicField$1(this, "attributeMap", /* @__PURE__ */ new WeakMap());
        __publicField$1(this, "removes", []);
        __publicField$1(this, "mapRemoves", []);
        __publicField$1(this, "movedMap", {});
        /**
     * the browser MutationObserver emits multiple mutations after
     * a delay for performance reasons, making tracing added nodes hard
     * in our `processMutations` callback function.
     * For example, if we append an element el_1 into body, and then append
     * another element el_2 into el_1, these two mutations may be passed to the
     * callback function together when the two operations were done.
     * Generally we need to trace child nodes of newly added nodes, but in this
     * case if we count el_2 as el_1's child node in the first mutation record,
     * then we will count el_2 again in the second mutation record which was
     * duplicated.
     * To avoid of duplicate counting added nodes, we use a Set to store
     * added nodes and its child nodes during iterate mutation records. Then
     * collect added nodes from the Set which have no duplicate copy. But
     * this also causes newly added nodes will not be serialized with id ASAP,
     * which means all the id related calculation should be lazy too.
     */ __publicField$1(this, "addedSet", /* @__PURE__ */ new Set());
        __publicField$1(this, "movedSet", /* @__PURE__ */ new Set());
        __publicField$1(this, "droppedSet", /* @__PURE__ */ new Set());
        __publicField$1(this, "removesSubTreeCache", /* @__PURE__ */ new Set());
        __publicField$1(this, "mutationCb");
        __publicField$1(this, "blockClass");
        __publicField$1(this, "blockSelector");
        __publicField$1(this, "maskTextClass");
        __publicField$1(this, "maskTextSelector");
        __publicField$1(this, "inlineStylesheet");
        __publicField$1(this, "maskInputOptions");
        __publicField$1(this, "maskTextFn");
        __publicField$1(this, "maskInputFn");
        __publicField$1(this, "keepIframeSrcFn");
        __publicField$1(this, "recordCanvas");
        __publicField$1(this, "inlineImages");
        __publicField$1(this, "slimDOMOptions");
        __publicField$1(this, "dataURLOptions");
        __publicField$1(this, "doc");
        __publicField$1(this, "mirror");
        __publicField$1(this, "iframeManager");
        __publicField$1(this, "stylesheetManager");
        __publicField$1(this, "shadowDomManager");
        __publicField$1(this, "canvasManager");
        __publicField$1(this, "processedNodeManager");
        __publicField$1(this, "unattachedDoc");
        __publicField$1(this, "processMutations", function(mutations) {
            mutations.forEach(_this.processMutation);
            _this.emit();
        });
        __publicField$1(this, "emit", function() {
            if (_this.frozen || _this.locked) {
                return;
            }
            var adds = [];
            var addedIds = /* @__PURE__ */ new Set();
            var addList = new DoubleLinkedList();
            var getNextId = function(n2) {
                var ns = n2;
                var nextId = IGNORED_NODE;
                while(nextId === IGNORED_NODE){
                    ns = ns && ns.nextSibling;
                    nextId = ns && _this.mirror.getId(ns);
                }
                return nextId;
            };
            var pushAdd = function(n2) {
                var parent = index$2.parentNode(n2);
                if (!parent || !inDom(n2)) {
                    return;
                }
                var cssCaptured = false;
                if (n2.nodeType === Node.TEXT_NODE) {
                    var parentTag = parent.tagName;
                    if (parentTag === "TEXTAREA") {
                        return;
                    } else if (parentTag === "STYLE" && _this.addedSet.has(parent)) {
                        cssCaptured = true;
                    }
                }
                var parentId = isShadowRoot(parent) ? _this.mirror.getId(getShadowHost(n2)) : _this.mirror.getId(parent);
                var nextId = getNextId(n2);
                if (parentId === -1 || nextId === -1) {
                    return addList.addNode(n2);
                }
                var sn = serializeNodeWithId(n2, {
                    doc: _this.doc,
                    mirror: _this.mirror,
                    blockClass: _this.blockClass,
                    blockSelector: _this.blockSelector,
                    maskTextClass: _this.maskTextClass,
                    maskTextSelector: _this.maskTextSelector,
                    skipChild: true,
                    newlyAddedElement: true,
                    inlineStylesheet: _this.inlineStylesheet,
                    maskInputOptions: _this.maskInputOptions,
                    maskTextFn: _this.maskTextFn,
                    maskInputFn: _this.maskInputFn,
                    slimDOMOptions: _this.slimDOMOptions,
                    dataURLOptions: _this.dataURLOptions,
                    recordCanvas: _this.recordCanvas,
                    inlineImages: _this.inlineImages,
                    onSerialize: function(currentN) {
                        if (isSerializedIframe(currentN, _this.mirror)) {
                            _this.iframeManager.addIframe(currentN);
                        }
                        if (isSerializedStylesheet(currentN, _this.mirror)) {
                            _this.stylesheetManager.trackLinkElement(currentN);
                        }
                        if (hasShadowRoot(n2)) {
                            _this.shadowDomManager.addShadowRoot(index$2.shadowRoot(n2), _this.doc);
                        }
                    },
                    onIframeLoad: function(iframe, childSn) {
                        _this.iframeManager.attachIframe(iframe, childSn);
                        _this.shadowDomManager.observeAttachShadow(iframe);
                    },
                    onStylesheetLoad: function(link, childSn) {
                        _this.stylesheetManager.attachLinkElement(link, childSn);
                    },
                    cssCaptured: cssCaptured
                });
                if (sn) {
                    adds.push({
                        parentId: parentId,
                        nextId: nextId,
                        node: sn
                    });
                    addedIds.add(sn.id);
                }
            };
            while(_this.mapRemoves.length){
                _this.mirror.removeNodeFromMap(_this.mapRemoves.shift());
            }
            for(var _iterator = _create_for_of_iterator_helper_loose(_this.movedSet), _step; !(_step = _iterator()).done;){
                var n2 = _step.value;
                if (isParentRemoved(_this.removesSubTreeCache, n2, _this.mirror) && !_this.movedSet.has(index$2.parentNode(n2))) {
                    continue;
                }
                pushAdd(n2);
            }
            for(var _iterator1 = _create_for_of_iterator_helper_loose(_this.addedSet), _step1; !(_step1 = _iterator1()).done;){
                var n21 = _step1.value;
                if (!isAncestorInSet(_this.droppedSet, n21) && !isParentRemoved(_this.removesSubTreeCache, n21, _this.mirror)) {
                    pushAdd(n21);
                } else if (isAncestorInSet(_this.movedSet, n21)) {
                    pushAdd(n21);
                } else {
                    _this.droppedSet.add(n21);
                }
            }
            var candidate = null;
            while(addList.length){
                var node2 = null;
                if (candidate) {
                    var parentId = _this.mirror.getId(index$2.parentNode(candidate.value));
                    var nextId = getNextId(candidate.value);
                    if (parentId !== -1 && nextId !== -1) {
                        node2 = candidate;
                    }
                }
                if (!node2) {
                    var tailNode = addList.tail;
                    while(tailNode){
                        var _node = tailNode;
                        tailNode = tailNode.previous;
                        if (_node) {
                            var parentId1 = _this.mirror.getId(index$2.parentNode(_node.value));
                            var nextId1 = getNextId(_node.value);
                            if (nextId1 === -1) continue;
                            else if (parentId1 !== -1) {
                                node2 = _node;
                                break;
                            } else {
                                var unhandledNode = _node.value;
                                var parent = index$2.parentNode(unhandledNode);
                                if (parent && parent.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
                                    var shadowHost = index$2.host(parent);
                                    var parentId2 = _this.mirror.getId(shadowHost);
                                    if (parentId2 !== -1) {
                                        node2 = _node;
                                        break;
                                    }
                                }
                            }
                        }
                    }
                }
                if (!node2) {
                    while(addList.head){
                        addList.removeNode(addList.head.value);
                    }
                    break;
                }
                candidate = node2.previous;
                addList.removeNode(node2.value);
                pushAdd(node2.value);
            }
            var payload = {
                texts: _this.texts.map(function(text) {
                    var n2 = text.node;
                    var parent = index$2.parentNode(n2);
                    if (parent && parent.tagName === "TEXTAREA") {
                        _this.genTextAreaValueMutation(parent);
                    }
                    return {
                        id: _this.mirror.getId(n2),
                        value: text.value
                    };
                }).filter(function(text) {
                    return !addedIds.has(text.id);
                }).filter(function(text) {
                    return _this.mirror.has(text.id);
                }),
                attributes: _this.attributes.map(function(attribute) {
                    var attributes = attribute.attributes;
                    if (typeof attributes.style === "string") {
                        var diffAsStr = JSON.stringify(attribute.styleDiff);
                        var unchangedAsStr = JSON.stringify(attribute._unchangedStyles);
                        if (diffAsStr.length < attributes.style.length) {
                            if ((diffAsStr + unchangedAsStr).split("var(").length === attributes.style.split("var(").length) {
                                attributes.style = attribute.styleDiff;
                            }
                        }
                    }
                    return {
                        id: _this.mirror.getId(attribute.node),
                        attributes: attributes
                    };
                }).filter(function(attribute) {
                    return !addedIds.has(attribute.id);
                }).filter(function(attribute) {
                    return _this.mirror.has(attribute.id);
                }),
                removes: _this.removes,
                adds: adds
            };
            if (!payload.texts.length && !payload.attributes.length && !payload.removes.length && !payload.adds.length) {
                return;
            }
            _this.texts = [];
            _this.attributes = [];
            _this.attributeMap = /* @__PURE__ */ new WeakMap();
            _this.removes = [];
            _this.addedSet = /* @__PURE__ */ new Set();
            _this.movedSet = /* @__PURE__ */ new Set();
            _this.droppedSet = /* @__PURE__ */ new Set();
            _this.removesSubTreeCache = /* @__PURE__ */ new Set();
            _this.movedMap = {};
            _this.mutationCb(payload);
        });
        __publicField$1(this, "genTextAreaValueMutation", function(textarea) {
            var item = _this.attributeMap.get(textarea);
            if (!item) {
                item = {
                    node: textarea,
                    attributes: {},
                    styleDiff: {},
                    _unchangedStyles: {}
                };
                _this.attributes.push(item);
                _this.attributeMap.set(textarea, item);
            }
            var value = Array.from(index$2.childNodes(textarea), function(cn) {
                return index$2.textContent(cn) || "";
            }).join("");
            item.attributes.value = maskInputValue({
                element: textarea,
                maskInputOptions: _this.maskInputOptions,
                tagName: textarea.tagName,
                type: getInputType(textarea),
                value: value,
                maskInputFn: _this.maskInputFn
            });
        });
        __publicField$1(this, "processMutation", function(m) {
            if (isIgnored(m.target, _this.mirror, _this.slimDOMOptions)) {
                return;
            }
            switch(m.type){
                case "characterData":
                    {
                        var value = index$2.textContent(m.target);
                        if (!isBlocked(m.target, _this.blockClass, _this.blockSelector, false) && value !== m.oldValue) {
                            _this.texts.push({
                                value: needMaskingText(m.target, _this.maskTextClass, _this.maskTextSelector, true) && value ? _this.maskTextFn ? _this.maskTextFn(value, closestElementOfNode(m.target)) : value.replace(/[\S]/g, "*") : value,
                                node: m.target
                            });
                        }
                        break;
                    }
                case "attributes":
                    {
                        var target = m.target;
                        var attributeName = m.attributeName;
                        var value1 = m.target.getAttribute(attributeName);
                        if (attributeName === "value") {
                            var type = getInputType(target);
                            value1 = maskInputValue({
                                element: target,
                                maskInputOptions: _this.maskInputOptions,
                                tagName: target.tagName,
                                type: type,
                                value: value1,
                                maskInputFn: _this.maskInputFn
                            });
                        }
                        if (isBlocked(m.target, _this.blockClass, _this.blockSelector, false) || value1 === m.oldValue) {
                            return;
                        }
                        var item = _this.attributeMap.get(m.target);
                        if (target.tagName === "IFRAME" && attributeName === "src" && !_this.keepIframeSrcFn(value1)) {
                            if (!target.contentDocument) {
                                attributeName = "rr_src";
                            } else {
                                return;
                            }
                        }
                        if (!item) {
                            item = {
                                node: m.target,
                                attributes: {},
                                styleDiff: {},
                                _unchangedStyles: {}
                            };
                            _this.attributes.push(item);
                            _this.attributeMap.set(m.target, item);
                        }
                        if (attributeName === "type" && target.tagName === "INPUT" && (m.oldValue || "").toLowerCase() === "password") {
                            target.setAttribute("data-rr-is-password", "true");
                        }
                        if (!ignoreAttribute(target.tagName, attributeName)) {
                            item.attributes[attributeName] = transformAttribute(_this.doc, toLowerCase(target.tagName), toLowerCase(attributeName), value1);
                            if (attributeName === "style") {
                                if (!_this.unattachedDoc) {
                                    try {
                                        _this.unattachedDoc = document.implementation.createHTMLDocument();
                                    } catch (e2) {
                                        _this.unattachedDoc = _this.doc;
                                    }
                                }
                                var old = _this.unattachedDoc.createElement("span");
                                if (m.oldValue) {
                                    old.setAttribute("style", m.oldValue);
                                }
                                for(var _iterator = _create_for_of_iterator_helper_loose(Array.from(target.style)), _step; !(_step = _iterator()).done;){
                                    var pname = _step.value;
                                    var newValue = target.style.getPropertyValue(pname);
                                    var newPriority = target.style.getPropertyPriority(pname);
                                    if (newValue !== old.style.getPropertyValue(pname) || newPriority !== old.style.getPropertyPriority(pname)) {
                                        if (newPriority === "") {
                                            item.styleDiff[pname] = newValue;
                                        } else {
                                            item.styleDiff[pname] = [
                                                newValue,
                                                newPriority
                                            ];
                                        }
                                    } else {
                                        item._unchangedStyles[pname] = [
                                            newValue,
                                            newPriority
                                        ];
                                    }
                                }
                                for(var _iterator1 = _create_for_of_iterator_helper_loose(Array.from(old.style)), _step1; !(_step1 = _iterator1()).done;){
                                    var pname1 = _step1.value;
                                    if (target.style.getPropertyValue(pname1) === "") {
                                        item.styleDiff[pname1] = false;
                                    }
                                }
                            } else if (attributeName === "open" && target.tagName === "DIALOG") {
                                if (target.matches("dialog:modal")) {
                                    item.attributes["rr_open_mode"] = "modal";
                                } else {
                                    item.attributes["rr_open_mode"] = "non-modal";
                                }
                            }
                        }
                        break;
                    }
                case "childList":
                    {
                        if (isBlocked(m.target, _this.blockClass, _this.blockSelector, true)) return;
                        if (m.target.tagName === "TEXTAREA") {
                            _this.genTextAreaValueMutation(m.target);
                            return;
                        }
                        m.addedNodes.forEach(function(n2) {
                            return _this.genAdds(n2, m.target);
                        });
                        m.removedNodes.forEach(function(n2) {
                            var nodeId = _this.mirror.getId(n2);
                            var parentId = isShadowRoot(m.target) ? _this.mirror.getId(index$2.host(m.target)) : _this.mirror.getId(m.target);
                            if (isBlocked(m.target, _this.blockClass, _this.blockSelector, false) || isIgnored(n2, _this.mirror, _this.slimDOMOptions) || !isSerialized(n2, _this.mirror)) {
                                return;
                            }
                            if (_this.addedSet.has(n2)) {
                                deepDelete(_this.addedSet, n2);
                                _this.droppedSet.add(n2);
                            } else if (_this.addedSet.has(m.target) && nodeId === -1) ;
                            else if (isAncestorRemoved(m.target, _this.mirror)) ;
                            else if (_this.movedSet.has(n2) && _this.movedMap[moveKey(nodeId, parentId)]) {
                                deepDelete(_this.movedSet, n2);
                            } else {
                                _this.removes.push({
                                    parentId: parentId,
                                    id: nodeId,
                                    isShadow: isShadowRoot(m.target) && isNativeShadowDom(m.target) ? true : void 0
                                });
                                processRemoves(n2, _this.removesSubTreeCache);
                            }
                            _this.mapRemoves.push(n2);
                        });
                        break;
                    }
            }
        });
        /**
     * Make sure you check if `n`'s parent is blocked before calling this function
     * */ __publicField$1(this, "genAdds", function(n2, target) {
            if (_this.processedNodeManager.inOtherBuffer(n2, _this)) return;
            if (_this.addedSet.has(n2) || _this.movedSet.has(n2)) return;
            if (_this.mirror.hasNode(n2)) {
                if (isIgnored(n2, _this.mirror, _this.slimDOMOptions)) {
                    return;
                }
                _this.movedSet.add(n2);
                var targetId = null;
                if (target && _this.mirror.hasNode(target)) {
                    targetId = _this.mirror.getId(target);
                }
                if (targetId && targetId !== -1) {
                    _this.movedMap[moveKey(_this.mirror.getId(n2), targetId)] = true;
                }
            } else {
                _this.addedSet.add(n2);
                _this.droppedSet.delete(n2);
            }
            if (!isBlocked(n2, _this.blockClass, _this.blockSelector, false)) {
                index$2.childNodes(n2).forEach(function(childN) {
                    return _this.genAdds(childN);
                });
                if (hasShadowRoot(n2)) {
                    index$2.childNodes(index$2.shadowRoot(n2)).forEach(function(childN) {
                        _this.processedNodeManager.add(childN, _this);
                        _this.genAdds(childN, n2);
                    });
                }
            }
        });
    }
    var _proto = MutationBuffer.prototype;
    _proto.init = function init(options) {
        var _this = this;
        [
            "mutationCb",
            "blockClass",
            "blockSelector",
            "maskTextClass",
            "maskTextSelector",
            "inlineStylesheet",
            "maskInputOptions",
            "maskTextFn",
            "maskInputFn",
            "keepIframeSrcFn",
            "recordCanvas",
            "inlineImages",
            "slimDOMOptions",
            "dataURLOptions",
            "doc",
            "mirror",
            "iframeManager",
            "stylesheetManager",
            "shadowDomManager",
            "canvasManager",
            "processedNodeManager"
        ].forEach(function(key) {
            _this[key] = options[key];
        });
    };
    _proto.freeze = function freeze() {
        this.frozen = true;
        this.canvasManager.freeze();
    };
    _proto.unfreeze = function unfreeze() {
        this.frozen = false;
        this.canvasManager.unfreeze();
        this.emit();
    };
    _proto.isFrozen = function isFrozen() {
        return this.frozen;
    };
    _proto.lock = function lock() {
        this.locked = true;
        this.canvasManager.lock();
    };
    _proto.unlock = function unlock() {
        this.locked = false;
        this.canvasManager.unlock();
        this.emit();
    };
    _proto.reset = function reset() {
        this.shadowDomManager.reset();
        this.canvasManager.reset();
    };
    return MutationBuffer;
}();
function deepDelete(addsSet, n2) {
    addsSet.delete(n2);
    index$2.childNodes(n2).forEach(function(childN) {
        return deepDelete(addsSet, childN);
    });
}
function processRemoves(n2, cache) {
    var queue = [
        n2
    ];
    while(queue.length){
        var next = queue.pop();
        if (cache.has(next)) continue;
        cache.add(next);
        index$2.childNodes(next).forEach(function(n22) {
            return queue.push(n22);
        });
    }
    return;
}
function isParentRemoved(removes, n2, mirror2) {
    if (removes.size === 0) return false;
    return _isParentRemoved(removes, n2);
}
function _isParentRemoved(removes, n2, _mirror2) {
    var node2 = index$2.parentNode(n2);
    if (!node2) return false;
    return removes.has(node2);
}
function isAncestorInSet(set, n2) {
    if (set.size === 0) return false;
    return _isAncestorInSet(set, n2);
}
function _isAncestorInSet(set, n2) {
    var parent = index$2.parentNode(n2);
    if (!parent) {
        return false;
    }
    if (set.has(parent)) {
        return true;
    }
    return _isAncestorInSet(set, parent);
}
var errorHandler;
function registerErrorHandler(handler) {
    errorHandler = handler;
}
function unregisterErrorHandler() {
    errorHandler = void 0;
}
var callbackWrapper = function(cb) {
    if (!errorHandler) {
        return cb;
    }
    var rrwebWrapped = function() {
        for(var _len = arguments.length, rest = new Array(_len), _key = 0; _key < _len; _key++){
            rest[_key] = arguments[_key];
        }
        try {
            return cb.apply(void 0, [].concat(rest));
        } catch (error) {
            if (errorHandler && errorHandler(error) === true) {
                return;
            }
            throw error;
        }
    };
    return rrwebWrapped;
};
var mutationBuffers = [];
function getEventTarget(event) {
    try {
        if ("composedPath" in event) {
            var path = event.composedPath();
            if (path.length) {
                return path[0];
            }
        } else if ("path" in event && event.path.length) {
            return event.path[0];
        }
    } catch (e) {}
    return event && event.target;
}
function initMutationObserver(options, rootEl) {
    var mutationBuffer = new MutationBuffer();
    mutationBuffers.push(mutationBuffer);
    mutationBuffer.init(options);
    var observer = new (mutationObserverCtor$2())(callbackWrapper(mutationBuffer.processMutations.bind(mutationBuffer)));
    observer.observe(rootEl, {
        attributes: true,
        attributeOldValue: true,
        characterData: true,
        characterDataOldValue: true,
        childList: true,
        subtree: true
    });
    return observer;
}
function initMoveObserver(param) {
    var mousemoveCb = param.mousemoveCb, sampling = param.sampling, doc = param.doc, mirror2 = param.mirror;
    if (sampling.mousemove === false) {
        return function() {};
    }
    var threshold = typeof sampling.mousemove === "number" ? sampling.mousemove : 50;
    var callbackThreshold = typeof sampling.mousemoveCallback === "number" ? sampling.mousemoveCallback : 500;
    var positions = [];
    var timeBaseline;
    var wrappedCb = throttle(callbackWrapper(function(source) {
        var totalOffset = Date.now() - timeBaseline;
        mousemoveCb(positions.map(function(p) {
            p.timeOffset -= totalOffset;
            return p;
        }), source);
        positions = [];
        timeBaseline = null;
    }), callbackThreshold);
    var updatePosition = callbackWrapper(throttle(callbackWrapper(function(evt) {
        var target = getEventTarget(evt);
        var _ref = legacy_isTouchEvent(evt) ? evt.changedTouches[0] : evt, clientX = _ref.clientX, clientY = _ref.clientY;
        if (!timeBaseline) {
            timeBaseline = nowTimestamp();
        }
        positions.push({
            x: clientX,
            y: clientY,
            id: mirror2.getId(target),
            timeOffset: nowTimestamp() - timeBaseline
        });
        wrappedCb(typeof DragEvent !== "undefined" && _instanceof(evt, DragEvent) ? IncrementalSource.Drag : _instanceof(evt, MouseEvent) ? IncrementalSource.MouseMove : IncrementalSource.TouchMove);
    }), threshold, {
        trailing: false
    }));
    var handlers = [
        on("mousemove", updatePosition, doc),
        on("touchmove", updatePosition, doc),
        on("drag", updatePosition, doc)
    ];
    return callbackWrapper(function() {
        handlers.forEach(function(h) {
            return h();
        });
    });
}
function initMouseInteractionObserver(param) {
    var mouseInteractionCb = param.mouseInteractionCb, doc = param.doc, mirror2 = param.mirror, blockClass = param.blockClass, blockSelector = param.blockSelector, sampling = param.sampling;
    if (sampling.mouseInteraction === false) {
        return function() {};
    }
    var disableMap = sampling.mouseInteraction === true || sampling.mouseInteraction === void 0 ? {} : sampling.mouseInteraction;
    var handlers = [];
    var currentPointerType = null;
    var getHandler = function(eventKey) {
        return function(event) {
            var target = getEventTarget(event);
            if (isBlocked(target, blockClass, blockSelector, true)) {
                return;
            }
            var pointerType = null;
            var thisEventKey = eventKey;
            if ("pointerType" in event) {
                switch(event.pointerType){
                    case "mouse":
                        pointerType = PointerTypes.Mouse;
                        break;
                    case "touch":
                        pointerType = PointerTypes.Touch;
                        break;
                    case "pen":
                        pointerType = PointerTypes.Pen;
                        break;
                }
                if (pointerType === PointerTypes.Touch) {
                    if (MouseInteractions[eventKey] === MouseInteractions.MouseDown) {
                        thisEventKey = "TouchStart";
                    } else if (MouseInteractions[eventKey] === MouseInteractions.MouseUp) {
                        thisEventKey = "TouchEnd";
                    }
                } else if (pointerType === PointerTypes.Pen) ;
            } else if (legacy_isTouchEvent(event)) {
                pointerType = PointerTypes.Touch;
            }
            if (pointerType !== null) {
                currentPointerType = pointerType;
                if (thisEventKey.startsWith("Touch") && pointerType === PointerTypes.Touch || thisEventKey.startsWith("Mouse") && pointerType === PointerTypes.Mouse) {
                    pointerType = null;
                }
            } else if (MouseInteractions[eventKey] === MouseInteractions.Click) {
                pointerType = currentPointerType;
                currentPointerType = null;
            }
            var e2 = legacy_isTouchEvent(event) ? event.changedTouches[0] : event;
            if (!e2) {
                return;
            }
            var id = mirror2.getId(target);
            var clientX = e2.clientX, clientY = e2.clientY;
            callbackWrapper(mouseInteractionCb)(_extends({
                type: MouseInteractions[thisEventKey],
                id: id,
                x: clientX,
                y: clientY
            }, pointerType !== null && {
                pointerType: pointerType
            }));
        };
    };
    Object.keys(MouseInteractions).filter(function(key) {
        return Number.isNaN(Number(key)) && !key.endsWith("_Departed") && disableMap[key] !== false;
    }).forEach(function(eventKey) {
        var eventName = toLowerCase(eventKey);
        var handler = getHandler(eventKey);
        if (window.PointerEvent) {
            switch(MouseInteractions[eventKey]){
                case MouseInteractions.MouseDown:
                case MouseInteractions.MouseUp:
                    eventName = eventName.replace("mouse", "pointer");
                    break;
                case MouseInteractions.TouchStart:
                case MouseInteractions.TouchEnd:
                    return;
            }
        }
        handlers.push(on(eventName, handler, doc));
    });
    return callbackWrapper(function() {
        handlers.forEach(function(h) {
            return h();
        });
    });
}
function initScrollObserver(param) {
    var scrollCb = param.scrollCb, doc = param.doc, mirror2 = param.mirror, blockClass = param.blockClass, blockSelector = param.blockSelector, sampling = param.sampling;
    var updatePosition = callbackWrapper(throttle(callbackWrapper(function(evt) {
        var target = getEventTarget(evt);
        if (!target || isBlocked(target, blockClass, blockSelector, true)) {
            return;
        }
        var id = mirror2.getId(target);
        if (target === doc && doc.defaultView) {
            var scrollLeftTop = getWindowScroll(doc.defaultView);
            scrollCb({
                id: id,
                x: scrollLeftTop.left,
                y: scrollLeftTop.top
            });
        } else {
            scrollCb({
                id: id,
                x: target.scrollLeft,
                y: target.scrollTop
            });
        }
    }), sampling.scroll || 100));
    return on("scroll", updatePosition, doc);
}
function initViewportResizeObserver(param, param1) {
    var viewportResizeCb = param.viewportResizeCb;
    var win = param1.win;
    var lastH = -1;
    var lastW = -1;
    var updateDimension = callbackWrapper(throttle(callbackWrapper(function() {
        var height = getWindowHeight();
        var width = getWindowWidth();
        if (lastH !== height || lastW !== width) {
            viewportResizeCb({
                width: Number(width),
                height: Number(height)
            });
            lastH = height;
            lastW = width;
        }
    }), 200));
    return on("resize", updateDimension, win);
}
var INPUT_TAGS = [
    "INPUT",
    "TEXTAREA",
    "SELECT"
];
var lastInputValueMap = /* @__PURE__ */ new WeakMap();
function initInputObserver(param) {
    var inputCb = param.inputCb, doc = param.doc, mirror2 = param.mirror, blockClass = param.blockClass, blockSelector = param.blockSelector, ignoreClass = param.ignoreClass, ignoreSelector = param.ignoreSelector, maskInputOptions = param.maskInputOptions, maskInputFn = param.maskInputFn, sampling = param.sampling, userTriggeredOnInput = param.userTriggeredOnInput;
    function eventHandler(event) {
        var target = getEventTarget(event);
        var userTriggered = event.isTrusted;
        var tagName = target && target.tagName;
        if (target && tagName === "OPTION") {
            target = index$2.parentElement(target);
        }
        if (!target || !tagName || INPUT_TAGS.indexOf(tagName) < 0 || isBlocked(target, blockClass, blockSelector, true)) {
            return;
        }
        if (target.classList.contains(ignoreClass) || ignoreSelector && target.matches(ignoreSelector)) {
            return;
        }
        var text = target.value;
        var isChecked = false;
        var type = getInputType(target) || "";
        if (type === "radio" || type === "checkbox") {
            isChecked = target.checked;
        } else if (maskInputOptions[tagName.toLowerCase()] || maskInputOptions[type]) {
            text = maskInputValue({
                element: target,
                maskInputOptions: maskInputOptions,
                tagName: tagName,
                type: type,
                value: text,
                maskInputFn: maskInputFn
            });
        }
        cbWithDedup(target, userTriggeredOnInput ? {
            text: text,
            isChecked: isChecked,
            userTriggered: userTriggered
        } : {
            text: text,
            isChecked: isChecked
        });
        var name = target.name;
        if (type === "radio" && name && isChecked) {
            doc.querySelectorAll('input[type="radio"][name="' + name + '"]').forEach(function(el) {
                if (el !== target) {
                    var text2 = el.value;
                    cbWithDedup(el, userTriggeredOnInput ? {
                        text: text2,
                        isChecked: !isChecked,
                        userTriggered: false
                    } : {
                        text: text2,
                        isChecked: !isChecked
                    });
                }
            });
        }
    }
    function cbWithDedup(target, v2) {
        var lastInputValue = lastInputValueMap.get(target);
        if (!lastInputValue || lastInputValue.text !== v2.text || lastInputValue.isChecked !== v2.isChecked) {
            lastInputValueMap.set(target, v2);
            var id = mirror2.getId(target);
            callbackWrapper(inputCb)(_extends({}, v2, {
                id: id
            }));
        }
    }
    var events = sampling.input === "last" ? [
        "change"
    ] : [
        "input",
        "change"
    ];
    var handlers = events.map(function(eventName) {
        return on(eventName, callbackWrapper(eventHandler), doc);
    });
    var currentWindow = doc.defaultView;
    if (!currentWindow) {
        return function() {
            handlers.forEach(function(h) {
                return h();
            });
        };
    }
    var propertyDescriptor = currentWindow.Object.getOwnPropertyDescriptor(currentWindow.HTMLInputElement.prototype, "value");
    var hookProperties = [
        [
            currentWindow.HTMLInputElement.prototype,
            "value"
        ],
        [
            currentWindow.HTMLInputElement.prototype,
            "checked"
        ],
        [
            currentWindow.HTMLSelectElement.prototype,
            "value"
        ],
        [
            currentWindow.HTMLTextAreaElement.prototype,
            "value"
        ],
        // Some UI library use selectedIndex to set select value
        [
            currentWindow.HTMLSelectElement.prototype,
            "selectedIndex"
        ],
        [
            currentWindow.HTMLOptionElement.prototype,
            "selected"
        ]
    ];
    if (propertyDescriptor && propertyDescriptor.set) {
        var _handlers;
        (_handlers = handlers).push.apply(_handlers, [].concat(hookProperties.map(function(p) {
            return hookSetter(p[0], p[1], {
                set: function set() {
                    callbackWrapper(eventHandler)({
                        target: this,
                        isTrusted: false
                    });
                }
            }, false, currentWindow);
        })));
    }
    return callbackWrapper(function() {
        handlers.forEach(function(h) {
            return h();
        });
    });
}
function getNestedCSSRulePositions(rule2) {
    var positions = [];
    function recurse(childRule, pos) {
        if (hasNestedCSSRule("CSSGroupingRule") && _instanceof(childRule.parentRule, CSSGroupingRule) || hasNestedCSSRule("CSSMediaRule") && _instanceof(childRule.parentRule, CSSMediaRule) || hasNestedCSSRule("CSSSupportsRule") && _instanceof(childRule.parentRule, CSSSupportsRule) || hasNestedCSSRule("CSSConditionRule") && _instanceof(childRule.parentRule, CSSConditionRule)) {
            var rules2 = Array.from(childRule.parentRule.cssRules);
            var index2 = rules2.indexOf(childRule);
            pos.unshift(index2);
        } else if (childRule.parentStyleSheet) {
            var rules21 = Array.from(childRule.parentStyleSheet.cssRules);
            var index21 = rules21.indexOf(childRule);
            pos.unshift(index21);
        }
        return pos;
    }
    return recurse(rule2, positions);
}
function getIdAndStyleId(sheet, mirror2, styleMirror) {
    var id, styleId;
    if (!sheet) return {};
    if (sheet.ownerNode) id = mirror2.getId(sheet.ownerNode);
    else styleId = styleMirror.getId(sheet);
    return {
        styleId: styleId,
        id: id
    };
}
function initStyleSheetObserver(param, param1) {
    var styleSheetRuleCb = param.styleSheetRuleCb, mirror2 = param.mirror, stylesheetManager = param.stylesheetManager;
    var win = param1.win;
    if (!win.CSSStyleSheet || !win.CSSStyleSheet.prototype) {
        return function() {};
    }
    var insertRule = win.CSSStyleSheet.prototype.insertRule;
    win.CSSStyleSheet.prototype.insertRule = new Proxy(insertRule, {
        apply: callbackWrapper(function(target, thisArg, argumentsList) {
            var rule2 = argumentsList[0], index2 = argumentsList[1];
            var _getIdAndStyleId = getIdAndStyleId(thisArg, mirror2, stylesheetManager.styleMirror), id = _getIdAndStyleId.id, styleId = _getIdAndStyleId.styleId;
            if (id && id !== -1 || styleId && styleId !== -1) {
                styleSheetRuleCb({
                    id: id,
                    styleId: styleId,
                    adds: [
                        {
                            rule: rule2,
                            index: index2
                        }
                    ]
                });
            }
            return target.apply(thisArg, argumentsList);
        })
    });
    win.CSSStyleSheet.prototype.addRule = function(selector, styleBlock, index2) {
        if (index2 === void 0) index2 = this.cssRules.length;
        var rule2 = selector + " { " + styleBlock + " }";
        return win.CSSStyleSheet.prototype.insertRule.apply(this, [
            rule2,
            index2
        ]);
    };
    var deleteRule = win.CSSStyleSheet.prototype.deleteRule;
    win.CSSStyleSheet.prototype.deleteRule = new Proxy(deleteRule, {
        apply: callbackWrapper(function(target, thisArg, argumentsList) {
            var index2 = argumentsList[0];
            var _getIdAndStyleId = getIdAndStyleId(thisArg, mirror2, stylesheetManager.styleMirror), id = _getIdAndStyleId.id, styleId = _getIdAndStyleId.styleId;
            if (id && id !== -1 || styleId && styleId !== -1) {
                styleSheetRuleCb({
                    id: id,
                    styleId: styleId,
                    removes: [
                        {
                            index: index2
                        }
                    ]
                });
            }
            return target.apply(thisArg, argumentsList);
        })
    });
    win.CSSStyleSheet.prototype.removeRule = function(index2) {
        return win.CSSStyleSheet.prototype.deleteRule.apply(this, [
            index2
        ]);
    };
    var replace;
    if (win.CSSStyleSheet.prototype.replace) {
        replace = win.CSSStyleSheet.prototype.replace;
        win.CSSStyleSheet.prototype.replace = new Proxy(replace, {
            apply: callbackWrapper(function(target, thisArg, argumentsList) {
                var text = argumentsList[0];
                var _getIdAndStyleId = getIdAndStyleId(thisArg, mirror2, stylesheetManager.styleMirror), id = _getIdAndStyleId.id, styleId = _getIdAndStyleId.styleId;
                if (id && id !== -1 || styleId && styleId !== -1) {
                    styleSheetRuleCb({
                        id: id,
                        styleId: styleId,
                        replace: text
                    });
                }
                return target.apply(thisArg, argumentsList);
            })
        });
    }
    var replaceSync;
    if (win.CSSStyleSheet.prototype.replaceSync) {
        replaceSync = win.CSSStyleSheet.prototype.replaceSync;
        win.CSSStyleSheet.prototype.replaceSync = new Proxy(replaceSync, {
            apply: callbackWrapper(function(target, thisArg, argumentsList) {
                var text = argumentsList[0];
                var _getIdAndStyleId = getIdAndStyleId(thisArg, mirror2, stylesheetManager.styleMirror), id = _getIdAndStyleId.id, styleId = _getIdAndStyleId.styleId;
                if (id && id !== -1 || styleId && styleId !== -1) {
                    styleSheetRuleCb({
                        id: id,
                        styleId: styleId,
                        replaceSync: text
                    });
                }
                return target.apply(thisArg, argumentsList);
            })
        });
    }
    var supportedNestedCSSRuleTypes = {};
    if (canMonkeyPatchNestedCSSRule("CSSGroupingRule")) {
        supportedNestedCSSRuleTypes.CSSGroupingRule = win.CSSGroupingRule;
    } else {
        if (canMonkeyPatchNestedCSSRule("CSSMediaRule")) {
            supportedNestedCSSRuleTypes.CSSMediaRule = win.CSSMediaRule;
        }
        if (canMonkeyPatchNestedCSSRule("CSSConditionRule")) {
            supportedNestedCSSRuleTypes.CSSConditionRule = win.CSSConditionRule;
        }
        if (canMonkeyPatchNestedCSSRule("CSSSupportsRule")) {
            supportedNestedCSSRuleTypes.CSSSupportsRule = win.CSSSupportsRule;
        }
    }
    var unmodifiedFunctions = {};
    Object.entries(supportedNestedCSSRuleTypes).forEach(function(param) {
        var typeKey = param[0], type = param[1];
        unmodifiedFunctions[typeKey] = {
            // eslint-disable-next-line @typescript-eslint/unbound-method
            insertRule: type.prototype.insertRule,
            // eslint-disable-next-line @typescript-eslint/unbound-method
            deleteRule: type.prototype.deleteRule
        };
        type.prototype.insertRule = new Proxy(unmodifiedFunctions[typeKey].insertRule, {
            apply: callbackWrapper(function(target, thisArg, argumentsList) {
                var rule2 = argumentsList[0], index2 = argumentsList[1];
                var _getIdAndStyleId = getIdAndStyleId(thisArg.parentStyleSheet, mirror2, stylesheetManager.styleMirror), id = _getIdAndStyleId.id, styleId = _getIdAndStyleId.styleId;
                if (id && id !== -1 || styleId && styleId !== -1) {
                    styleSheetRuleCb({
                        id: id,
                        styleId: styleId,
                        adds: [
                            {
                                rule: rule2,
                                index: [].concat(getNestedCSSRulePositions(thisArg), [
                                    index2 || 0
                                ])
                            }
                        ]
                    });
                }
                return target.apply(thisArg, argumentsList);
            })
        });
        type.prototype.deleteRule = new Proxy(unmodifiedFunctions[typeKey].deleteRule, {
            apply: callbackWrapper(function(target, thisArg, argumentsList) {
                var index2 = argumentsList[0];
                var _getIdAndStyleId = getIdAndStyleId(thisArg.parentStyleSheet, mirror2, stylesheetManager.styleMirror), id = _getIdAndStyleId.id, styleId = _getIdAndStyleId.styleId;
                if (id && id !== -1 || styleId && styleId !== -1) {
                    styleSheetRuleCb({
                        id: id,
                        styleId: styleId,
                        removes: [
                            {
                                index: [].concat(getNestedCSSRulePositions(thisArg), [
                                    index2
                                ])
                            }
                        ]
                    });
                }
                return target.apply(thisArg, argumentsList);
            })
        });
    });
    return callbackWrapper(function() {
        win.CSSStyleSheet.prototype.insertRule = insertRule;
        win.CSSStyleSheet.prototype.deleteRule = deleteRule;
        replace && (win.CSSStyleSheet.prototype.replace = replace);
        replaceSync && (win.CSSStyleSheet.prototype.replaceSync = replaceSync);
        Object.entries(supportedNestedCSSRuleTypes).forEach(function(param) {
            var typeKey = param[0], type = param[1];
            type.prototype.insertRule = unmodifiedFunctions[typeKey].insertRule;
            type.prototype.deleteRule = unmodifiedFunctions[typeKey].deleteRule;
        });
    });
}
function initAdoptedStyleSheetObserver(param, host2) {
    var mirror2 = param.mirror, stylesheetManager = param.stylesheetManager;
    var _a2, _b, _c;
    var hostId = null;
    if (host2.nodeName === "#document") hostId = mirror2.getId(host2);
    else hostId = mirror2.getId(index$2.host(host2));
    var patchTarget = host2.nodeName === "#document" ? (_a2 = host2.defaultView) == null ? void 0 : _a2.Document : (_c = (_b = host2.ownerDocument) == null ? void 0 : _b.defaultView) == null ? void 0 : _c.ShadowRoot;
    var originalPropertyDescriptor = (patchTarget == null ? void 0 : patchTarget.prototype) ? Object.getOwnPropertyDescriptor(patchTarget == null ? void 0 : patchTarget.prototype, "adoptedStyleSheets") : void 0;
    if (hostId === null || hostId === -1 || !patchTarget || !originalPropertyDescriptor) return function() {};
    Object.defineProperty(host2, "adoptedStyleSheets", {
        configurable: originalPropertyDescriptor.configurable,
        enumerable: originalPropertyDescriptor.enumerable,
        get: function get() {
            var _a3;
            return (_a3 = originalPropertyDescriptor.get) == null ? void 0 : _a3.call(this);
        },
        set: function set(sheets) {
            var _a3;
            var result2 = (_a3 = originalPropertyDescriptor.set) == null ? void 0 : _a3.call(this, sheets);
            if (hostId !== null && hostId !== -1) {
                try {
                    stylesheetManager.adoptStyleSheets(sheets, hostId);
                } catch (e2) {}
            }
            return result2;
        }
    });
    return callbackWrapper(function() {
        Object.defineProperty(host2, "adoptedStyleSheets", {
            configurable: originalPropertyDescriptor.configurable,
            enumerable: originalPropertyDescriptor.enumerable,
            // eslint-disable-next-line @typescript-eslint/unbound-method
            get: originalPropertyDescriptor.get,
            // eslint-disable-next-line @typescript-eslint/unbound-method
            set: originalPropertyDescriptor.set
        });
    });
}
function initStyleDeclarationObserver(param, param1) {
    var styleDeclarationCb = param.styleDeclarationCb, mirror2 = param.mirror, ignoreCSSAttributes = param.ignoreCSSAttributes, stylesheetManager = param.stylesheetManager;
    var win = param1.win;
    var setProperty = win.CSSStyleDeclaration.prototype.setProperty;
    win.CSSStyleDeclaration.prototype.setProperty = new Proxy(setProperty, {
        apply: callbackWrapper(function(target, thisArg, argumentsList) {
            var _a2;
            var property = argumentsList[0], value = argumentsList[1], priority = argumentsList[2];
            if (ignoreCSSAttributes.has(property)) {
                return setProperty.apply(thisArg, [
                    property,
                    value,
                    priority
                ]);
            }
            var _getIdAndStyleId = getIdAndStyleId((_a2 = thisArg.parentRule) == null ? void 0 : _a2.parentStyleSheet, mirror2, stylesheetManager.styleMirror), id = _getIdAndStyleId.id, styleId = _getIdAndStyleId.styleId;
            if (id && id !== -1 || styleId && styleId !== -1) {
                styleDeclarationCb({
                    id: id,
                    styleId: styleId,
                    set: {
                        property: property,
                        value: value,
                        priority: priority
                    },
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    index: getNestedCSSRulePositions(thisArg.parentRule)
                });
            }
            return target.apply(thisArg, argumentsList);
        })
    });
    var removeProperty = win.CSSStyleDeclaration.prototype.removeProperty;
    win.CSSStyleDeclaration.prototype.removeProperty = new Proxy(removeProperty, {
        apply: callbackWrapper(function(target, thisArg, argumentsList) {
            var _a2;
            var property = argumentsList[0];
            if (ignoreCSSAttributes.has(property)) {
                return removeProperty.apply(thisArg, [
                    property
                ]);
            }
            var _getIdAndStyleId = getIdAndStyleId((_a2 = thisArg.parentRule) == null ? void 0 : _a2.parentStyleSheet, mirror2, stylesheetManager.styleMirror), id = _getIdAndStyleId.id, styleId = _getIdAndStyleId.styleId;
            if (id && id !== -1 || styleId && styleId !== -1) {
                styleDeclarationCb({
                    id: id,
                    styleId: styleId,
                    remove: {
                        property: property
                    },
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    index: getNestedCSSRulePositions(thisArg.parentRule)
                });
            }
            return target.apply(thisArg, argumentsList);
        })
    });
    return callbackWrapper(function() {
        win.CSSStyleDeclaration.prototype.setProperty = setProperty;
        win.CSSStyleDeclaration.prototype.removeProperty = removeProperty;
    });
}
function initMediaInteractionObserver(param) {
    var mediaInteractionCb = param.mediaInteractionCb, blockClass = param.blockClass, blockSelector = param.blockSelector, mirror2 = param.mirror, sampling = param.sampling, doc = param.doc;
    var handler = callbackWrapper(function(type) {
        return throttle(callbackWrapper(function(event) {
            var target = getEventTarget(event);
            if (!target || isBlocked(target, blockClass, blockSelector, true)) {
                return;
            }
            var currentTime = target.currentTime, volume = target.volume, muted = target.muted, playbackRate = target.playbackRate, loop = target.loop;
            mediaInteractionCb({
                type: type,
                id: mirror2.getId(target),
                currentTime: currentTime,
                volume: volume,
                muted: muted,
                playbackRate: playbackRate,
                loop: loop
            });
        }), sampling.media || 500);
    });
    var handlers = [
        on("play", handler(MediaInteractions.Play), doc),
        on("pause", handler(MediaInteractions.Pause), doc),
        on("seeked", handler(MediaInteractions.Seeked), doc),
        on("volumechange", handler(MediaInteractions.VolumeChange), doc),
        on("ratechange", handler(MediaInteractions.RateChange), doc)
    ];
    return callbackWrapper(function() {
        handlers.forEach(function(h) {
            return h();
        });
    });
}
function initFontObserver(param) {
    var fontCb = param.fontCb, doc = param.doc;
    var win = doc.defaultView;
    if (!win) {
        return function() {};
    }
    var handlers = [];
    var fontMap = /* @__PURE__ */ new WeakMap();
    var originalFontFace = win.FontFace;
    win.FontFace = function FontFace2(family, source, descriptors) {
        var fontFace = new originalFontFace(family, source, descriptors);
        fontMap.set(fontFace, {
            family: family,
            buffer: typeof source !== "string",
            descriptors: descriptors,
            fontSource: typeof source === "string" ? source : JSON.stringify(Array.from(new Uint8Array(source)))
        });
        return fontFace;
    };
    var restoreHandler = patch$2(doc.fonts, "add", function(original) {
        return function(fontFace) {
            setTimeout(callbackWrapper(function() {
                var p = fontMap.get(fontFace);
                if (p) {
                    fontCb(p);
                    fontMap.delete(fontFace);
                }
            }), 0);
            return original.apply(this, [
                fontFace
            ]);
        };
    });
    handlers.push(function() {
        win.FontFace = originalFontFace;
    });
    handlers.push(restoreHandler);
    return callbackWrapper(function() {
        handlers.forEach(function(h) {
            return h();
        });
    });
}
function initSelectionObserver(param) {
    var doc = param.doc, mirror2 = param.mirror, blockClass = param.blockClass, blockSelector = param.blockSelector, selectionCb = param.selectionCb;
    var collapsed = true;
    var updateSelection = callbackWrapper(function() {
        var selection = doc.getSelection();
        if (!selection || collapsed && (selection == null ? void 0 : selection.isCollapsed)) return;
        collapsed = selection.isCollapsed || false;
        var ranges = [];
        var count = selection.rangeCount || 0;
        for(var i2 = 0; i2 < count; i2++){
            var range = selection.getRangeAt(i2);
            var startContainer = range.startContainer, startOffset = range.startOffset, endContainer = range.endContainer, endOffset = range.endOffset;
            var blocked = isBlocked(startContainer, blockClass, blockSelector, true) || isBlocked(endContainer, blockClass, blockSelector, true);
            if (blocked) continue;
            ranges.push({
                start: mirror2.getId(startContainer),
                startOffset: startOffset,
                end: mirror2.getId(endContainer),
                endOffset: endOffset
            });
        }
        selectionCb({
            ranges: ranges
        });
    });
    updateSelection();
    return on("selectionchange", updateSelection);
}
function initCustomElementObserver(param) {
    var doc = param.doc, customElementCb = param.customElementCb;
    var win = doc.defaultView;
    if (!win || !win.customElements) return function() {};
    var restoreHandler = patch$2(win.customElements, "define", function(original) {
        return function(name, constructor, options) {
            try {
                customElementCb({
                    define: {
                        name: name
                    }
                });
            } catch (e2) {
                console.warn("Custom element callback failed for " + name);
            }
            return original.apply(this, [
                name,
                constructor,
                options
            ]);
        };
    });
    return restoreHandler;
}
function mergeHooks(o2, hooks) {
    var mutationCb = o2.mutationCb, mousemoveCb = o2.mousemoveCb, mouseInteractionCb = o2.mouseInteractionCb, scrollCb = o2.scrollCb, viewportResizeCb = o2.viewportResizeCb, inputCb = o2.inputCb, mediaInteractionCb = o2.mediaInteractionCb, styleSheetRuleCb = o2.styleSheetRuleCb, styleDeclarationCb = o2.styleDeclarationCb, canvasMutationCb = o2.canvasMutationCb, fontCb = o2.fontCb, selectionCb = o2.selectionCb, customElementCb = o2.customElementCb;
    o2.mutationCb = function() {
        for(var _len = arguments.length, p = new Array(_len), _key = 0; _key < _len; _key++){
            p[_key] = arguments[_key];
        }
        if (hooks.mutation) {
            var _hooks;
            (_hooks = hooks).mutation.apply(_hooks, [].concat(p));
        }
        mutationCb.apply(void 0, [].concat(p));
    };
    o2.mousemoveCb = function() {
        for(var _len = arguments.length, p = new Array(_len), _key = 0; _key < _len; _key++){
            p[_key] = arguments[_key];
        }
        if (hooks.mousemove) {
            var _hooks;
            (_hooks = hooks).mousemove.apply(_hooks, [].concat(p));
        }
        mousemoveCb.apply(void 0, [].concat(p));
    };
    o2.mouseInteractionCb = function() {
        for(var _len = arguments.length, p = new Array(_len), _key = 0; _key < _len; _key++){
            p[_key] = arguments[_key];
        }
        if (hooks.mouseInteraction) {
            var _hooks;
            (_hooks = hooks).mouseInteraction.apply(_hooks, [].concat(p));
        }
        mouseInteractionCb.apply(void 0, [].concat(p));
    };
    o2.scrollCb = function() {
        for(var _len = arguments.length, p = new Array(_len), _key = 0; _key < _len; _key++){
            p[_key] = arguments[_key];
        }
        if (hooks.scroll) {
            var _hooks;
            (_hooks = hooks).scroll.apply(_hooks, [].concat(p));
        }
        scrollCb.apply(void 0, [].concat(p));
    };
    o2.viewportResizeCb = function() {
        for(var _len = arguments.length, p = new Array(_len), _key = 0; _key < _len; _key++){
            p[_key] = arguments[_key];
        }
        if (hooks.viewportResize) {
            var _hooks;
            (_hooks = hooks).viewportResize.apply(_hooks, [].concat(p));
        }
        viewportResizeCb.apply(void 0, [].concat(p));
    };
    o2.inputCb = function() {
        for(var _len = arguments.length, p = new Array(_len), _key = 0; _key < _len; _key++){
            p[_key] = arguments[_key];
        }
        if (hooks.input) {
            var _hooks;
            (_hooks = hooks).input.apply(_hooks, [].concat(p));
        }
        inputCb.apply(void 0, [].concat(p));
    };
    o2.mediaInteractionCb = function() {
        for(var _len = arguments.length, p = new Array(_len), _key = 0; _key < _len; _key++){
            p[_key] = arguments[_key];
        }
        if (hooks.mediaInteaction) {
            var _hooks;
            (_hooks = hooks).mediaInteaction.apply(_hooks, [].concat(p));
        }
        mediaInteractionCb.apply(void 0, [].concat(p));
    };
    o2.styleSheetRuleCb = function() {
        for(var _len = arguments.length, p = new Array(_len), _key = 0; _key < _len; _key++){
            p[_key] = arguments[_key];
        }
        if (hooks.styleSheetRule) {
            var _hooks;
            (_hooks = hooks).styleSheetRule.apply(_hooks, [].concat(p));
        }
        styleSheetRuleCb.apply(void 0, [].concat(p));
    };
    o2.styleDeclarationCb = function() {
        for(var _len = arguments.length, p = new Array(_len), _key = 0; _key < _len; _key++){
            p[_key] = arguments[_key];
        }
        if (hooks.styleDeclaration) {
            var _hooks;
            (_hooks = hooks).styleDeclaration.apply(_hooks, [].concat(p));
        }
        styleDeclarationCb.apply(void 0, [].concat(p));
    };
    o2.canvasMutationCb = function() {
        for(var _len = arguments.length, p = new Array(_len), _key = 0; _key < _len; _key++){
            p[_key] = arguments[_key];
        }
        if (hooks.canvasMutation) {
            var _hooks;
            (_hooks = hooks).canvasMutation.apply(_hooks, [].concat(p));
        }
        canvasMutationCb.apply(void 0, [].concat(p));
    };
    o2.fontCb = function() {
        for(var _len = arguments.length, p = new Array(_len), _key = 0; _key < _len; _key++){
            p[_key] = arguments[_key];
        }
        if (hooks.font) {
            var _hooks;
            (_hooks = hooks).font.apply(_hooks, [].concat(p));
        }
        fontCb.apply(void 0, [].concat(p));
    };
    o2.selectionCb = function() {
        for(var _len = arguments.length, p = new Array(_len), _key = 0; _key < _len; _key++){
            p[_key] = arguments[_key];
        }
        if (hooks.selection) {
            var _hooks;
            (_hooks = hooks).selection.apply(_hooks, [].concat(p));
        }
        selectionCb.apply(void 0, [].concat(p));
    };
    o2.customElementCb = function() {
        for(var _len = arguments.length, c2 = new Array(_len), _key = 0; _key < _len; _key++){
            c2[_key] = arguments[_key];
        }
        if (hooks.customElement) {
            var _hooks;
            (_hooks = hooks).customElement.apply(_hooks, [].concat(c2));
        }
        customElementCb.apply(void 0, [].concat(c2));
    };
}
function initObservers(o2, hooks) {
    if (hooks === void 0) hooks = {};
    var currentWindow = o2.doc.defaultView;
    if (!currentWindow) {
        return function() {};
    }
    mergeHooks(o2, hooks);
    var mutationObserver;
    if (o2.recordDOM) {
        mutationObserver = initMutationObserver(o2, o2.doc);
    }
    var mousemoveHandler = initMoveObserver(o2);
    var mouseInteractionHandler = initMouseInteractionObserver(o2);
    var scrollHandler = initScrollObserver(o2);
    var viewportResizeHandler = initViewportResizeObserver(o2, {
        win: currentWindow
    });
    var inputHandler = initInputObserver(o2);
    var mediaInteractionHandler = initMediaInteractionObserver(o2);
    var styleSheetObserver = function() {};
    var adoptedStyleSheetObserver = function() {};
    var styleDeclarationObserver = function() {};
    var fontObserver = function() {};
    if (o2.recordDOM) {
        styleSheetObserver = initStyleSheetObserver(o2, {
            win: currentWindow
        });
        adoptedStyleSheetObserver = initAdoptedStyleSheetObserver(o2, o2.doc);
        styleDeclarationObserver = initStyleDeclarationObserver(o2, {
            win: currentWindow
        });
        if (o2.collectFonts) {
            fontObserver = initFontObserver(o2);
        }
    }
    var selectionObserver = initSelectionObserver(o2);
    var customElementObserver = initCustomElementObserver(o2);
    var pluginHandlers = [];
    for(var _iterator = _create_for_of_iterator_helper_loose(o2.plugins), _step; !(_step = _iterator()).done;){
        var plugin3 = _step.value;
        pluginHandlers.push(plugin3.observer(plugin3.callback, currentWindow, plugin3.options));
    }
    return callbackWrapper(function() {
        mutationBuffers.forEach(function(b) {
            return b.reset();
        });
        mutationObserver == null ? void 0 : mutationObserver.disconnect();
        mousemoveHandler();
        mouseInteractionHandler();
        scrollHandler();
        viewportResizeHandler();
        inputHandler();
        mediaInteractionHandler();
        styleSheetObserver();
        adoptedStyleSheetObserver();
        styleDeclarationObserver();
        fontObserver();
        selectionObserver();
        customElementObserver();
        pluginHandlers.forEach(function(h) {
            return h();
        });
    });
}
function hasNestedCSSRule(prop) {
    return typeof window[prop] !== "undefined";
}
function canMonkeyPatchNestedCSSRule(prop) {
    return Boolean(typeof window[prop] !== "undefined" && // Note: Generally, this check _shouldn't_ be necessary
    // However, in some scenarios (e.g. jsdom) this can sometimes fail, so we check for it here
    window[prop].prototype && "insertRule" in window[prop].prototype && "deleteRule" in window[prop].prototype);
}
var CrossOriginIframeMirror = /*#__PURE__*/ function() {
    function CrossOriginIframeMirror(generateIdFn) {
        __publicField$1(this, "iframeIdToRemoteIdMap", /* @__PURE__ */ new WeakMap());
        __publicField$1(this, "iframeRemoteIdToIdMap", /* @__PURE__ */ new WeakMap());
        this.generateIdFn = generateIdFn;
    }
    var _proto = CrossOriginIframeMirror.prototype;
    _proto.getId = function getId(iframe, remoteId, idToRemoteMap, remoteToIdMap) {
        var idToRemoteIdMap = idToRemoteMap || this.getIdToRemoteIdMap(iframe);
        var remoteIdToIdMap = remoteToIdMap || this.getRemoteIdToIdMap(iframe);
        var id = idToRemoteIdMap.get(remoteId);
        if (!id) {
            id = this.generateIdFn();
            idToRemoteIdMap.set(remoteId, id);
            remoteIdToIdMap.set(id, remoteId);
        }
        return id;
    };
    _proto.getIds = function getIds(iframe, remoteId) {
        var _this = this;
        var idToRemoteIdMap = this.getIdToRemoteIdMap(iframe);
        var remoteIdToIdMap = this.getRemoteIdToIdMap(iframe);
        return remoteId.map(function(id) {
            return _this.getId(iframe, id, idToRemoteIdMap, remoteIdToIdMap);
        });
    };
    _proto.getRemoteId = function getRemoteId(iframe, id, map) {
        var remoteIdToIdMap = map || this.getRemoteIdToIdMap(iframe);
        if (typeof id !== "number") return id;
        var remoteId = remoteIdToIdMap.get(id);
        if (!remoteId) return -1;
        return remoteId;
    };
    _proto.getRemoteIds = function getRemoteIds(iframe, ids) {
        var _this = this;
        var remoteIdToIdMap = this.getRemoteIdToIdMap(iframe);
        return ids.map(function(id) {
            return _this.getRemoteId(iframe, id, remoteIdToIdMap);
        });
    };
    _proto.reset = function reset(iframe) {
        if (!iframe) {
            this.iframeIdToRemoteIdMap = /* @__PURE__ */ new WeakMap();
            this.iframeRemoteIdToIdMap = /* @__PURE__ */ new WeakMap();
            return;
        }
        this.iframeIdToRemoteIdMap.delete(iframe);
        this.iframeRemoteIdToIdMap.delete(iframe);
    };
    _proto.getIdToRemoteIdMap = function getIdToRemoteIdMap(iframe) {
        var idToRemoteIdMap = this.iframeIdToRemoteIdMap.get(iframe);
        if (!idToRemoteIdMap) {
            idToRemoteIdMap = /* @__PURE__ */ new Map();
            this.iframeIdToRemoteIdMap.set(iframe, idToRemoteIdMap);
        }
        return idToRemoteIdMap;
    };
    _proto.getRemoteIdToIdMap = function getRemoteIdToIdMap(iframe) {
        var remoteIdToIdMap = this.iframeRemoteIdToIdMap.get(iframe);
        if (!remoteIdToIdMap) {
            remoteIdToIdMap = /* @__PURE__ */ new Map();
            this.iframeRemoteIdToIdMap.set(iframe, remoteIdToIdMap);
        }
        return remoteIdToIdMap;
    };
    return CrossOriginIframeMirror;
}();
var IframeManager = /*#__PURE__*/ function() {
    function IframeManager(options) {
        __publicField$1(this, "iframes", /* @__PURE__ */ new WeakMap());
        __publicField$1(this, "crossOriginIframeMap", /* @__PURE__ */ new WeakMap());
        __publicField$1(this, "crossOriginIframeMirror", new CrossOriginIframeMirror(genId));
        __publicField$1(this, "crossOriginIframeStyleMirror");
        __publicField$1(this, "crossOriginIframeRootIdMap", /* @__PURE__ */ new WeakMap());
        __publicField$1(this, "mirror");
        __publicField$1(this, "mutationCb");
        __publicField$1(this, "wrappedEmit");
        __publicField$1(this, "loadListener");
        __publicField$1(this, "stylesheetManager");
        __publicField$1(this, "recordCrossOriginIframes");
        this.mutationCb = options.mutationCb;
        this.wrappedEmit = options.wrappedEmit;
        this.stylesheetManager = options.stylesheetManager;
        this.recordCrossOriginIframes = options.recordCrossOriginIframes;
        this.crossOriginIframeStyleMirror = new CrossOriginIframeMirror(this.stylesheetManager.styleMirror.generateId.bind(this.stylesheetManager.styleMirror));
        this.mirror = options.mirror;
        if (this.recordCrossOriginIframes) {
            window.addEventListener("message", this.handleMessage.bind(this));
        }
    }
    var _proto = IframeManager.prototype;
    _proto.addIframe = function addIframe(iframeEl) {
        this.iframes.set(iframeEl, true);
        if (iframeEl.contentWindow) this.crossOriginIframeMap.set(iframeEl.contentWindow, iframeEl);
    };
    _proto.addLoadListener = function addLoadListener(cb) {
        this.loadListener = cb;
    };
    _proto.attachIframe = function attachIframe(iframeEl, childSn) {
        var _a2, _b;
        this.mutationCb({
            adds: [
                {
                    parentId: this.mirror.getId(iframeEl),
                    nextId: null,
                    node: childSn
                }
            ],
            removes: [],
            texts: [],
            attributes: [],
            isAttachIframe: true
        });
        if (this.recordCrossOriginIframes) (_a2 = iframeEl.contentWindow) == null ? void 0 : _a2.addEventListener("message", this.handleMessage.bind(this));
        (_b = this.loadListener) == null ? void 0 : _b.call(this, iframeEl);
        if (iframeEl.contentDocument && iframeEl.contentDocument.adoptedStyleSheets && iframeEl.contentDocument.adoptedStyleSheets.length > 0) this.stylesheetManager.adoptStyleSheets(iframeEl.contentDocument.adoptedStyleSheets, this.mirror.getId(iframeEl.contentDocument));
    };
    _proto.handleMessage = function handleMessage(message) {
        var crossOriginMessageEvent = message;
        if (crossOriginMessageEvent.data.type !== "rrweb" || // To filter out the rrweb messages which are forwarded by some sites.
        crossOriginMessageEvent.origin !== crossOriginMessageEvent.data.origin) return;
        var iframeSourceWindow = message.source;
        if (!iframeSourceWindow) return;
        var iframeEl = this.crossOriginIframeMap.get(message.source);
        if (!iframeEl) return;
        var transformedEvent = this.transformCrossOriginEvent(iframeEl, crossOriginMessageEvent.data.event);
        if (transformedEvent) this.wrappedEmit(transformedEvent, crossOriginMessageEvent.data.isCheckout);
    };
    _proto.transformCrossOriginEvent = function transformCrossOriginEvent(iframeEl, e2) {
        var _this = this;
        var _a2;
        switch(e2.type){
            case EventType.FullSnapshot:
                {
                    this.crossOriginIframeMirror.reset(iframeEl);
                    this.crossOriginIframeStyleMirror.reset(iframeEl);
                    this.replaceIdOnNode(e2.data.node, iframeEl);
                    var rootId = e2.data.node.id;
                    this.crossOriginIframeRootIdMap.set(iframeEl, rootId);
                    this.patchRootIdOnNode(e2.data.node, rootId);
                    return {
                        timestamp: e2.timestamp,
                        type: EventType.IncrementalSnapshot,
                        data: {
                            source: IncrementalSource.Mutation,
                            adds: [
                                {
                                    parentId: this.mirror.getId(iframeEl),
                                    nextId: null,
                                    node: e2.data.node
                                }
                            ],
                            removes: [],
                            texts: [],
                            attributes: [],
                            isAttachIframe: true
                        }
                    };
                }
            case EventType.Meta:
            case EventType.Load:
            case EventType.DomContentLoaded:
                {
                    return false;
                }
            case EventType.Plugin:
                {
                    return e2;
                }
            case EventType.Custom:
                {
                    this.replaceIds(e2.data.payload, iframeEl, [
                        "id",
                        "parentId",
                        "previousId",
                        "nextId"
                    ]);
                    return e2;
                }
            case EventType.IncrementalSnapshot:
                {
                    switch(e2.data.source){
                        case IncrementalSource.Mutation:
                            {
                                e2.data.adds.forEach(function(n2) {
                                    _this.replaceIds(n2, iframeEl, [
                                        "parentId",
                                        "nextId",
                                        "previousId"
                                    ]);
                                    _this.replaceIdOnNode(n2.node, iframeEl);
                                    var rootId = _this.crossOriginIframeRootIdMap.get(iframeEl);
                                    rootId && _this.patchRootIdOnNode(n2.node, rootId);
                                });
                                e2.data.removes.forEach(function(n2) {
                                    _this.replaceIds(n2, iframeEl, [
                                        "parentId",
                                        "id"
                                    ]);
                                });
                                e2.data.attributes.forEach(function(n2) {
                                    _this.replaceIds(n2, iframeEl, [
                                        "id"
                                    ]);
                                });
                                e2.data.texts.forEach(function(n2) {
                                    _this.replaceIds(n2, iframeEl, [
                                        "id"
                                    ]);
                                });
                                return e2;
                            }
                        case IncrementalSource.Drag:
                        case IncrementalSource.TouchMove:
                        case IncrementalSource.MouseMove:
                            {
                                e2.data.positions.forEach(function(p) {
                                    _this.replaceIds(p, iframeEl, [
                                        "id"
                                    ]);
                                });
                                return e2;
                            }
                        case IncrementalSource.ViewportResize:
                            {
                                return false;
                            }
                        case IncrementalSource.MediaInteraction:
                        case IncrementalSource.MouseInteraction:
                        case IncrementalSource.Scroll:
                        case IncrementalSource.CanvasMutation:
                        case IncrementalSource.Input:
                            {
                                this.replaceIds(e2.data, iframeEl, [
                                    "id"
                                ]);
                                return e2;
                            }
                        case IncrementalSource.StyleSheetRule:
                        case IncrementalSource.StyleDeclaration:
                            {
                                this.replaceIds(e2.data, iframeEl, [
                                    "id"
                                ]);
                                this.replaceStyleIds(e2.data, iframeEl, [
                                    "styleId"
                                ]);
                                return e2;
                            }
                        case IncrementalSource.Font:
                            {
                                return e2;
                            }
                        case IncrementalSource.Selection:
                            {
                                e2.data.ranges.forEach(function(range) {
                                    _this.replaceIds(range, iframeEl, [
                                        "start",
                                        "end"
                                    ]);
                                });
                                return e2;
                            }
                        case IncrementalSource.AdoptedStyleSheet:
                            {
                                this.replaceIds(e2.data, iframeEl, [
                                    "id"
                                ]);
                                this.replaceStyleIds(e2.data, iframeEl, [
                                    "styleIds"
                                ]);
                                (_a2 = e2.data.styles) == null ? void 0 : _a2.forEach(function(style) {
                                    _this.replaceStyleIds(style, iframeEl, [
                                        "styleId"
                                    ]);
                                });
                                return e2;
                            }
                    }
                }
        }
        return false;
    };
    _proto.replace = function replace(iframeMirror, obj, iframeEl, keys) {
        for(var _iterator = _create_for_of_iterator_helper_loose(keys), _step; !(_step = _iterator()).done;){
            var key = _step.value;
            if (!Array.isArray(obj[key]) && typeof obj[key] !== "number") continue;
            if (Array.isArray(obj[key])) {
                obj[key] = iframeMirror.getIds(iframeEl, obj[key]);
            } else {
                obj[key] = iframeMirror.getId(iframeEl, obj[key]);
            }
        }
        return obj;
    };
    _proto.replaceIds = function replaceIds(obj, iframeEl, keys) {
        return this.replace(this.crossOriginIframeMirror, obj, iframeEl, keys);
    };
    _proto.replaceStyleIds = function replaceStyleIds(obj, iframeEl, keys) {
        return this.replace(this.crossOriginIframeStyleMirror, obj, iframeEl, keys);
    };
    _proto.replaceIdOnNode = function replaceIdOnNode(node2, iframeEl) {
        var _this = this;
        this.replaceIds(node2, iframeEl, [
            "id",
            "rootId"
        ]);
        if ("childNodes" in node2) {
            node2.childNodes.forEach(function(child) {
                _this.replaceIdOnNode(child, iframeEl);
            });
        }
    };
    _proto.patchRootIdOnNode = function patchRootIdOnNode(node2, rootId) {
        var _this = this;
        if (node2.type !== NodeType.Document && !node2.rootId) node2.rootId = rootId;
        if ("childNodes" in node2) {
            node2.childNodes.forEach(function(child) {
                _this.patchRootIdOnNode(child, rootId);
            });
        }
    };
    return IframeManager;
}();
var ShadowDomManager = /*#__PURE__*/ function() {
    function ShadowDomManager(options) {
        __publicField$1(this, "shadowDoms", /* @__PURE__ */ new WeakSet());
        __publicField$1(this, "mutationCb");
        __publicField$1(this, "scrollCb");
        __publicField$1(this, "bypassOptions");
        __publicField$1(this, "mirror");
        __publicField$1(this, "restoreHandlers", []);
        this.mutationCb = options.mutationCb;
        this.scrollCb = options.scrollCb;
        this.bypassOptions = options.bypassOptions;
        this.mirror = options.mirror;
        this.init();
    }
    var _proto = ShadowDomManager.prototype;
    _proto.init = function init() {
        this.reset();
        this.patchAttachShadow(Element, document);
    };
    _proto.addShadowRoot = function addShadowRoot(shadowRoot2, doc) {
        var _this = this;
        if (!isNativeShadowDom(shadowRoot2)) return;
        if (this.shadowDoms.has(shadowRoot2)) return;
        this.shadowDoms.add(shadowRoot2);
        var observer = initMutationObserver(_extends({}, this.bypassOptions, {
            doc: doc,
            mutationCb: this.mutationCb,
            mirror: this.mirror,
            shadowDomManager: this
        }), shadowRoot2);
        this.restoreHandlers.push(function() {
            return observer.disconnect();
        });
        this.restoreHandlers.push(initScrollObserver(_extends({}, this.bypassOptions, {
            scrollCb: this.scrollCb,
            // https://gist.github.com/praveenpuglia/0832da687ed5a5d7a0907046c9ef1813
            // scroll is not allowed to pass the boundary, so we need to listen the shadow document
            doc: shadowRoot2,
            mirror: this.mirror
        })));
        setTimeout(function() {
            if (shadowRoot2.adoptedStyleSheets && shadowRoot2.adoptedStyleSheets.length > 0) _this.bypassOptions.stylesheetManager.adoptStyleSheets(shadowRoot2.adoptedStyleSheets, _this.mirror.getId(index$2.host(shadowRoot2)));
            _this.restoreHandlers.push(initAdoptedStyleSheetObserver({
                mirror: _this.mirror,
                stylesheetManager: _this.bypassOptions.stylesheetManager
            }, shadowRoot2));
        }, 0);
    };
    /**
   * Monkey patch 'attachShadow' of an IFrameElement to observe newly added shadow doms.
   */ _proto.observeAttachShadow = function observeAttachShadow(iframeElement) {
        if (!iframeElement.contentWindow || !iframeElement.contentDocument) return;
        this.patchAttachShadow(iframeElement.contentWindow.Element, iframeElement.contentDocument);
    };
    /**
   * Patch 'attachShadow' to observe newly added shadow doms.
   */ _proto.patchAttachShadow = function patchAttachShadow(element, doc) {
        var manager = this;
        this.restoreHandlers.push(patch$2(element.prototype, "attachShadow", function(original) {
            return function(option) {
                var sRoot = original.call(this, option);
                var shadowRootEl = index$2.shadowRoot(this);
                if (shadowRootEl && inDom(this)) manager.addShadowRoot(shadowRootEl, doc);
                return sRoot;
            };
        }));
    };
    _proto.reset = function reset() {
        this.restoreHandlers.forEach(function(handler) {
            try {
                handler();
            } catch (e2) {}
        });
        this.restoreHandlers = [];
        this.shadowDoms = /* @__PURE__ */ new WeakSet();
    };
    return ShadowDomManager;
}();
var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
var lookup = typeof Uint8Array === "undefined" ? [] : new Uint8Array(256);
for(var i$1 = 0; i$1 < chars.length; i$1++){
    lookup[chars.charCodeAt(i$1)] = i$1;
}
var encode = function encode(arraybuffer) {
    var bytes = new Uint8Array(arraybuffer), i2, len = bytes.length, base64 = "";
    for(i2 = 0; i2 < len; i2 += 3){
        base64 += chars[bytes[i2] >> 2];
        base64 += chars[(bytes[i2] & 3) << 4 | bytes[i2 + 1] >> 4];
        base64 += chars[(bytes[i2 + 1] & 15) << 2 | bytes[i2 + 2] >> 6];
        base64 += chars[bytes[i2 + 2] & 63];
    }
    if (len % 3 === 2) {
        base64 = base64.substring(0, base64.length - 1) + "=";
    } else if (len % 3 === 1) {
        base64 = base64.substring(0, base64.length - 2) + "==";
    }
    return base64;
};
var canvasVarMap = /* @__PURE__ */ new Map();
function variableListFor$1(ctx, ctor) {
    var contextMap = canvasVarMap.get(ctx);
    if (!contextMap) {
        contextMap = /* @__PURE__ */ new Map();
        canvasVarMap.set(ctx, contextMap);
    }
    if (!contextMap.has(ctor)) {
        contextMap.set(ctor, []);
    }
    return contextMap.get(ctor);
}
var saveWebGLVar = function(value, win, ctx) {
    if (!value || !(isInstanceOfWebGLObject(value, win) || (typeof value === "undefined" ? "undefined" : _type_of(value)) === "object")) return;
    var name = value.constructor.name;
    var list2 = variableListFor$1(ctx, name);
    var index2 = list2.indexOf(value);
    if (index2 === -1) {
        index2 = list2.length;
        list2.push(value);
    }
    return index2;
};
function serializeArg(value, win, ctx) {
    if (_instanceof(value, Array)) {
        return value.map(function(arg) {
            return serializeArg(arg, win, ctx);
        });
    } else if (value === null) {
        return value;
    } else if (_instanceof(value, Float32Array) || _instanceof(value, Float64Array) || _instanceof(value, Int32Array) || _instanceof(value, Uint32Array) || _instanceof(value, Uint8Array) || _instanceof(value, Uint16Array) || _instanceof(value, Int16Array) || _instanceof(value, Int8Array) || _instanceof(value, Uint8ClampedArray)) {
        var name = value.constructor.name;
        return {
            rr_type: name,
            args: [
                Object.values(value)
            ]
        };
    } else if (// SharedArrayBuffer disabled on most browsers due to spectre.
    // More info: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer/SharedArrayBuffer
    // value instanceof SharedArrayBuffer ||
    _instanceof(value, ArrayBuffer)) {
        var name1 = value.constructor.name;
        var base64 = encode(value);
        return {
            rr_type: name1,
            base64: base64
        };
    } else if (_instanceof(value, DataView)) {
        var name2 = value.constructor.name;
        return {
            rr_type: name2,
            args: [
                serializeArg(value.buffer, win, ctx),
                value.byteOffset,
                value.byteLength
            ]
        };
    } else if (_instanceof(value, HTMLImageElement)) {
        var name3 = value.constructor.name;
        var src = value.src;
        return {
            rr_type: name3,
            src: src
        };
    } else if (_instanceof(value, HTMLCanvasElement)) {
        var name4 = "HTMLImageElement";
        var src1 = value.toDataURL();
        return {
            rr_type: name4,
            src: src1
        };
    } else if (_instanceof(value, ImageData)) {
        var name5 = value.constructor.name;
        return {
            rr_type: name5,
            args: [
                serializeArg(value.data, win, ctx),
                value.width,
                value.height
            ]
        };
    } else if (isInstanceOfWebGLObject(value, win) || (typeof value === "undefined" ? "undefined" : _type_of(value)) === "object") {
        var name6 = value.constructor.name;
        var index2 = saveWebGLVar(value, win, ctx);
        return {
            rr_type: name6,
            index: index2
        };
    }
    return value;
}
var serializeArgs = function(args, win, ctx) {
    return args.map(function(arg) {
        return serializeArg(arg, win, ctx);
    });
};
var isInstanceOfWebGLObject = function(value, win) {
    var webGLConstructorNames = [
        "WebGLActiveInfo",
        "WebGLBuffer",
        "WebGLFramebuffer",
        "WebGLProgram",
        "WebGLRenderbuffer",
        "WebGLShader",
        "WebGLShaderPrecisionFormat",
        "WebGLTexture",
        "WebGLUniformLocation",
        "WebGLVertexArrayObject",
        // In old Chrome versions, value won't be an instanceof WebGLVertexArrayObject.
        "WebGLVertexArrayObjectOES"
    ];
    var supportedWebGLConstructorNames = webGLConstructorNames.filter(function(name) {
        return typeof win[name] === "function";
    });
    return Boolean(supportedWebGLConstructorNames.find(function(name) {
        return _instanceof(value, win[name]);
    }));
};
function initCanvas2DMutationObserver(cb, win, blockClass, blockSelector) {
    var _loop = function() {
        var prop = _step.value;
        try {
            if (typeof win.CanvasRenderingContext2D.prototype[prop] !== "function") {
                return "continue";
            }
            var restoreHandler = patch$2(win.CanvasRenderingContext2D.prototype, prop, function(original) {
                return function() {
                    var _this = this;
                    for(var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++){
                        args[_key] = arguments[_key];
                    }
                    if (!isBlocked(this.canvas, blockClass, blockSelector, true)) {
                        setTimeout(function() {
                            var recordArgs = serializeArgs(args, win, _this);
                            cb(_this.canvas, {
                                type: CanvasContext["2D"],
                                property: prop,
                                args: recordArgs
                            });
                        }, 0);
                    }
                    return original.apply(this, args);
                };
            });
            handlers.push(restoreHandler);
        } catch (e) {
            var hookHandler = hookSetter(win.CanvasRenderingContext2D.prototype, prop, {
                set: function set(v2) {
                    cb(this.canvas, {
                        type: CanvasContext["2D"],
                        property: prop,
                        args: [
                            v2
                        ],
                        setter: true
                    });
                }
            });
            handlers.push(hookHandler);
        }
    };
    var handlers = [];
    var props2D = Object.getOwnPropertyNames(win.CanvasRenderingContext2D.prototype);
    for(var _iterator = _create_for_of_iterator_helper_loose(props2D), _step; !(_step = _iterator()).done;)_loop();
    return function() {
        handlers.forEach(function(h) {
            return h();
        });
    };
}
function getNormalizedContextName(contextType) {
    return contextType === "experimental-webgl" ? "webgl" : contextType;
}
function initCanvasContextObserver(win, blockClass, blockSelector, setPreserveDrawingBufferToTrue) {
    var handlers = [];
    try {
        var restoreHandler = patch$2(win.HTMLCanvasElement.prototype, "getContext", function(original) {
            return function(contextType) {
                for(var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++){
                    args[_key - 1] = arguments[_key];
                }
                if (!isBlocked(this, blockClass, blockSelector, true)) {
                    var ctxName = getNormalizedContextName(contextType);
                    if (!("__context" in this)) this.__context = ctxName;
                    if (setPreserveDrawingBufferToTrue && [
                        "webgl",
                        "webgl2"
                    ].includes(ctxName)) {
                        if (args[0] && _type_of(args[0]) === "object") {
                            var contextAttributes = args[0];
                            if (!contextAttributes.preserveDrawingBuffer) {
                                contextAttributes.preserveDrawingBuffer = true;
                            }
                        } else {
                            args.splice(0, 1, {
                                preserveDrawingBuffer: true
                            });
                        }
                    }
                }
                return original.apply(this, [].concat([
                    contextType
                ], args));
            };
        });
        handlers.push(restoreHandler);
    } catch (e) {
        console.error("failed to patch HTMLCanvasElement.prototype.getContext");
    }
    return function() {
        handlers.forEach(function(h) {
            return h();
        });
    };
}
function patchGLPrototype(prototype, type, cb, blockClass, blockSelector, win) {
    var _loop = function() {
        var prop = _step.value;
        if (//prop.startsWith('get') ||  // e.g. getProgramParameter, but too risky
        [
            "isContextLost",
            "canvas",
            "drawingBufferWidth",
            "drawingBufferHeight"
        ].includes(prop)) {
            return "continue";
        }
        try {
            if (typeof prototype[prop] !== "function") {
                return "continue";
            }
            var restoreHandler = patch$2(prototype, prop, function(original) {
                return function() {
                    for(var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++){
                        args[_key] = arguments[_key];
                    }
                    var result2 = original.apply(this, args);
                    saveWebGLVar(result2, win, this);
                    if ("tagName" in this.canvas && !isBlocked(this.canvas, blockClass, blockSelector, true)) {
                        var recordArgs = serializeArgs(args, win, this);
                        var mutation = {
                            type: type,
                            property: prop,
                            args: recordArgs
                        };
                        cb(this.canvas, mutation);
                    }
                    return result2;
                };
            });
            handlers.push(restoreHandler);
        } catch (e) {
            var hookHandler = hookSetter(prototype, prop, {
                set: function set(v2) {
                    cb(this.canvas, {
                        type: type,
                        property: prop,
                        args: [
                            v2
                        ],
                        setter: true
                    });
                }
            });
            handlers.push(hookHandler);
        }
    };
    var handlers = [];
    var props = Object.getOwnPropertyNames(prototype);
    for(var _iterator = _create_for_of_iterator_helper_loose(props), _step; !(_step = _iterator()).done;)_loop();
    return handlers;
}
function initCanvasWebGLMutationObserver(cb, win, blockClass, blockSelector) {
    var _handlers;
    var handlers = [];
    (_handlers = handlers).push.apply(_handlers, [].concat(patchGLPrototype(win.WebGLRenderingContext.prototype, CanvasContext.WebGL, cb, blockClass, blockSelector, win)));
    if (typeof win.WebGL2RenderingContext !== "undefined") {
        var _handlers1;
        (_handlers1 = handlers).push.apply(_handlers1, [].concat(patchGLPrototype(win.WebGL2RenderingContext.prototype, CanvasContext.WebGL2, cb, blockClass, blockSelector, win)));
    }
    return function() {
        handlers.forEach(function(h) {
            return h();
        });
    };
}
var encodedJs = "KGZ1bmN0aW9uKCkgewogICJ1c2Ugc3RyaWN0IjsKICB2YXIgY2hhcnMgPSAiQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVphYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ejAxMjM0NTY3ODkrLyI7CiAgdmFyIGxvb2t1cCA9IHR5cGVvZiBVaW50OEFycmF5ID09PSAidW5kZWZpbmVkIiA/IFtdIDogbmV3IFVpbnQ4QXJyYXkoMjU2KTsKICBmb3IgKHZhciBpID0gMDsgaSA8IGNoYXJzLmxlbmd0aDsgaSsrKSB7CiAgICBsb29rdXBbY2hhcnMuY2hhckNvZGVBdChpKV0gPSBpOwogIH0KICB2YXIgZW5jb2RlID0gZnVuY3Rpb24oYXJyYXlidWZmZXIpIHsKICAgIHZhciBieXRlcyA9IG5ldyBVaW50OEFycmF5KGFycmF5YnVmZmVyKSwgaTIsIGxlbiA9IGJ5dGVzLmxlbmd0aCwgYmFzZTY0ID0gIiI7CiAgICBmb3IgKGkyID0gMDsgaTIgPCBsZW47IGkyICs9IDMpIHsKICAgICAgYmFzZTY0ICs9IGNoYXJzW2J5dGVzW2kyXSA+PiAyXTsKICAgICAgYmFzZTY0ICs9IGNoYXJzWyhieXRlc1tpMl0gJiAzKSA8PCA0IHwgYnl0ZXNbaTIgKyAxXSA+PiA0XTsKICAgICAgYmFzZTY0ICs9IGNoYXJzWyhieXRlc1tpMiArIDFdICYgMTUpIDw8IDIgfCBieXRlc1tpMiArIDJdID4+IDZdOwogICAgICBiYXNlNjQgKz0gY2hhcnNbYnl0ZXNbaTIgKyAyXSAmIDYzXTsKICAgIH0KICAgIGlmIChsZW4gJSAzID09PSAyKSB7CiAgICAgIGJhc2U2NCA9IGJhc2U2NC5zdWJzdHJpbmcoMCwgYmFzZTY0Lmxlbmd0aCAtIDEpICsgIj0iOwogICAgfSBlbHNlIGlmIChsZW4gJSAzID09PSAxKSB7CiAgICAgIGJhc2U2NCA9IGJhc2U2NC5zdWJzdHJpbmcoMCwgYmFzZTY0Lmxlbmd0aCAtIDIpICsgIj09IjsKICAgIH0KICAgIHJldHVybiBiYXNlNjQ7CiAgfTsKICBjb25zdCBsYXN0QmxvYk1hcCA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCk7CiAgY29uc3QgdHJhbnNwYXJlbnRCbG9iTWFwID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKTsKICBhc3luYyBmdW5jdGlvbiBnZXRUcmFuc3BhcmVudEJsb2JGb3Iod2lkdGgsIGhlaWdodCwgZGF0YVVSTE9wdGlvbnMpIHsKICAgIGNvbnN0IGlkID0gYCR7d2lkdGh9LSR7aGVpZ2h0fWA7CiAgICBpZiAoIk9mZnNjcmVlbkNhbnZhcyIgaW4gZ2xvYmFsVGhpcykgewogICAgICBpZiAodHJhbnNwYXJlbnRCbG9iTWFwLmhhcyhpZCkpIHJldHVybiB0cmFuc3BhcmVudEJsb2JNYXAuZ2V0KGlkKTsKICAgICAgY29uc3Qgb2Zmc2NyZWVuID0gbmV3IE9mZnNjcmVlbkNhbnZhcyh3aWR0aCwgaGVpZ2h0KTsKICAgICAgb2Zmc2NyZWVuLmdldENvbnRleHQoIjJkIik7CiAgICAgIGNvbnN0IGJsb2IgPSBhd2FpdCBvZmZzY3JlZW4uY29udmVydFRvQmxvYihkYXRhVVJMT3B0aW9ucyk7CiAgICAgIGNvbnN0IGFycmF5QnVmZmVyID0gYXdhaXQgYmxvYi5hcnJheUJ1ZmZlcigpOwogICAgICBjb25zdCBiYXNlNjQgPSBlbmNvZGUoYXJyYXlCdWZmZXIpOwogICAgICB0cmFuc3BhcmVudEJsb2JNYXAuc2V0KGlkLCBiYXNlNjQpOwogICAgICByZXR1cm4gYmFzZTY0OwogICAgfSBlbHNlIHsKICAgICAgcmV0dXJuICIiOwogICAgfQogIH0KICBjb25zdCB3b3JrZXIgPSBzZWxmOwogIHdvcmtlci5vbm1lc3NhZ2UgPSBhc3luYyBmdW5jdGlvbihlKSB7CiAgICBpZiAoIk9mZnNjcmVlbkNhbnZhcyIgaW4gZ2xvYmFsVGhpcykgewogICAgICBjb25zdCB7IGlkLCBiaXRtYXAsIHdpZHRoLCBoZWlnaHQsIGRhdGFVUkxPcHRpb25zIH0gPSBlLmRhdGE7CiAgICAgIGNvbnN0IHRyYW5zcGFyZW50QmFzZTY0ID0gZ2V0VHJhbnNwYXJlbnRCbG9iRm9yKAogICAgICAgIHdpZHRoLAogICAgICAgIGhlaWdodCwKICAgICAgICBkYXRhVVJMT3B0aW9ucwogICAgICApOwogICAgICBjb25zdCBvZmZzY3JlZW4gPSBuZXcgT2Zmc2NyZWVuQ2FudmFzKHdpZHRoLCBoZWlnaHQpOwogICAgICBjb25zdCBjdHggPSBvZmZzY3JlZW4uZ2V0Q29udGV4dCgiMmQiKTsKICAgICAgY3R4LmRyYXdJbWFnZShiaXRtYXAsIDAsIDApOwogICAgICBiaXRtYXAuY2xvc2UoKTsKICAgICAgY29uc3QgYmxvYiA9IGF3YWl0IG9mZnNjcmVlbi5jb252ZXJ0VG9CbG9iKGRhdGFVUkxPcHRpb25zKTsKICAgICAgY29uc3QgdHlwZSA9IGJsb2IudHlwZTsKICAgICAgY29uc3QgYXJyYXlCdWZmZXIgPSBhd2FpdCBibG9iLmFycmF5QnVmZmVyKCk7CiAgICAgIGNvbnN0IGJhc2U2NCA9IGVuY29kZShhcnJheUJ1ZmZlcik7CiAgICAgIGlmICghbGFzdEJsb2JNYXAuaGFzKGlkKSAmJiBhd2FpdCB0cmFuc3BhcmVudEJhc2U2NCA9PT0gYmFzZTY0KSB7CiAgICAgICAgbGFzdEJsb2JNYXAuc2V0KGlkLCBiYXNlNjQpOwogICAgICAgIHJldHVybiB3b3JrZXIucG9zdE1lc3NhZ2UoeyBpZCB9KTsKICAgICAgfQogICAgICBpZiAobGFzdEJsb2JNYXAuZ2V0KGlkKSA9PT0gYmFzZTY0KSByZXR1cm4gd29ya2VyLnBvc3RNZXNzYWdlKHsgaWQgfSk7CiAgICAgIHdvcmtlci5wb3N0TWVzc2FnZSh7CiAgICAgICAgaWQsCiAgICAgICAgdHlwZSwKICAgICAgICBiYXNlNjQsCiAgICAgICAgd2lkdGgsCiAgICAgICAgaGVpZ2h0CiAgICAgIH0pOwogICAgICBsYXN0QmxvYk1hcC5zZXQoaWQsIGJhc2U2NCk7CiAgICB9IGVsc2UgewogICAgICByZXR1cm4gd29ya2VyLnBvc3RNZXNzYWdlKHsgaWQ6IGUuZGF0YS5pZCB9KTsKICAgIH0KICB9Owp9KSgpOwovLyMgc291cmNlTWFwcGluZ1VSTD1pbWFnZS1iaXRtYXAtZGF0YS11cmwtd29ya2VyLUlKcEM3Z19iLmpzLm1hcAo=";
var decodeBase64 = function(base64) {
    return Uint8Array.from(atob(base64), function(c2) {
        return c2.charCodeAt(0);
    });
};
var blob = typeof window !== "undefined" && window.Blob && new Blob([
    decodeBase64(encodedJs)
], {
    type: "text/javascript;charset=utf-8"
});
function WorkerWrapper(options) {
    var objURL;
    try {
        objURL = blob && (window.URL || window.webkitURL).createObjectURL(blob);
        if (!objURL) throw "";
        var worker = new Worker(objURL, {
            name: options == null ? void 0 : options.name
        });
        worker.addEventListener("error", function() {
            (window.URL || window.webkitURL).revokeObjectURL(objURL);
        });
        return worker;
    } catch (e2) {
        return new Worker("data:text/javascript;base64," + encodedJs, {
            name: options == null ? void 0 : options.name
        });
    } finally{
        objURL && (window.URL || window.webkitURL).revokeObjectURL(objURL);
    }
}
var CanvasManager = /*#__PURE__*/ function() {
    function CanvasManager(options) {
        var _this = this;
        __publicField$1(this, "pendingCanvasMutations", /* @__PURE__ */ new Map());
        __publicField$1(this, "rafStamps", {
            latestId: 0,
            invokeId: null
        });
        __publicField$1(this, "mirror");
        __publicField$1(this, "mutationCb");
        __publicField$1(this, "resetObservers");
        __publicField$1(this, "frozen", false);
        __publicField$1(this, "locked", false);
        __publicField$1(this, "processMutation", function(target, mutation) {
            var newFrame = _this.rafStamps.invokeId && _this.rafStamps.latestId !== _this.rafStamps.invokeId;
            if (newFrame || !_this.rafStamps.invokeId) _this.rafStamps.invokeId = _this.rafStamps.latestId;
            if (!_this.pendingCanvasMutations.has(target)) {
                _this.pendingCanvasMutations.set(target, []);
            }
            _this.pendingCanvasMutations.get(target).push(mutation);
        });
        var _options_sampling = options.sampling, sampling = _options_sampling === void 0 ? "all" : _options_sampling, win = options.win, blockClass = options.blockClass, blockSelector = options.blockSelector, recordCanvas = options.recordCanvas, dataURLOptions = options.dataURLOptions;
        this.mutationCb = options.mutationCb;
        this.mirror = options.mirror;
        if (recordCanvas && sampling === "all") this.initCanvasMutationObserver(win, blockClass, blockSelector);
        if (recordCanvas && typeof sampling === "number") this.initCanvasFPSObserver(sampling, win, blockClass, blockSelector, {
            dataURLOptions: dataURLOptions
        });
    }
    var _proto = CanvasManager.prototype;
    _proto.reset = function reset() {
        this.pendingCanvasMutations.clear();
        this.resetObservers && this.resetObservers();
    };
    _proto.freeze = function freeze() {
        this.frozen = true;
    };
    _proto.unfreeze = function unfreeze() {
        this.frozen = false;
    };
    _proto.lock = function lock() {
        this.locked = true;
    };
    _proto.unlock = function unlock() {
        this.locked = false;
    };
    _proto.initCanvasFPSObserver = function initCanvasFPSObserver(fps, win, blockClass, blockSelector, options) {
        var _this = this;
        var canvasContextReset = initCanvasContextObserver(win, blockClass, blockSelector, true);
        var snapshotInProgressMap = /* @__PURE__ */ new Map();
        var worker = new WorkerWrapper();
        worker.onmessage = function(e2) {
            var id = e2.data.id;
            snapshotInProgressMap.set(id, false);
            if (!("base64" in e2.data)) return;
            var _e2_data = e2.data, base64 = _e2_data.base64, type = _e2_data.type, width = _e2_data.width, height = _e2_data.height;
            _this.mutationCb({
                id: id,
                type: CanvasContext["2D"],
                commands: [
                    {
                        property: "clearRect",
                        // wipe canvas
                        args: [
                            0,
                            0,
                            width,
                            height
                        ]
                    },
                    {
                        property: "drawImage",
                        // draws (semi-transparent) image
                        args: [
                            {
                                rr_type: "ImageBitmap",
                                args: [
                                    {
                                        rr_type: "Blob",
                                        data: [
                                            {
                                                rr_type: "ArrayBuffer",
                                                base64: base64
                                            }
                                        ],
                                        type: type
                                    }
                                ]
                            },
                            0,
                            0
                        ]
                    }
                ]
            });
        };
        var timeBetweenSnapshots = 1e3 / fps;
        var lastSnapshotTime = 0;
        var rafId;
        var getCanvas = function() {
            var matchedCanvas = [];
            win.document.querySelectorAll("canvas").forEach(function(canvas) {
                if (!isBlocked(canvas, blockClass, blockSelector, true)) {
                    matchedCanvas.push(canvas);
                }
            });
            return matchedCanvas;
        };
        var takeCanvasSnapshots = function(timestamp) {
            if (lastSnapshotTime && timestamp - lastSnapshotTime < timeBetweenSnapshots) {
                rafId = requestAnimationFrame(takeCanvasSnapshots);
                return;
            }
            lastSnapshotTime = timestamp;
            var _this1 = _this;
            getCanvas().forEach(/*#__PURE__*/ _async_to_generator(function(canvas) {
                var _a2, id, context, bitmap;
                return _ts_generator(this, function(_state) {
                    switch(_state.label){
                        case 0:
                            id = _this1.mirror.getId(canvas);
                            if (snapshotInProgressMap.get(id)) return [
                                2
                            ];
                            if (canvas.width === 0 || canvas.height === 0) return [
                                2
                            ];
                            snapshotInProgressMap.set(id, true);
                            if ([
                                "webgl",
                                "webgl2"
                            ].includes(canvas.__context)) {
                                context = canvas.getContext(canvas.__context);
                                if (((_a2 = context == null ? void 0 : context.getContextAttributes()) == null ? void 0 : _a2.preserveDrawingBuffer) === false) {
                                    context.clear(context.COLOR_BUFFER_BIT);
                                }
                            }
                            return [
                                4,
                                createImageBitmap(canvas)
                            ];
                        case 1:
                            bitmap = _state.sent();
                            worker.postMessage({
                                id: id,
                                bitmap: bitmap,
                                width: canvas.width,
                                height: canvas.height,
                                dataURLOptions: options.dataURLOptions
                            }, [
                                bitmap
                            ]);
                            return [
                                2
                            ];
                    }
                });
            }));
            rafId = requestAnimationFrame(takeCanvasSnapshots);
        };
        rafId = requestAnimationFrame(takeCanvasSnapshots);
        this.resetObservers = function() {
            canvasContextReset();
            cancelAnimationFrame(rafId);
        };
    };
    _proto.initCanvasMutationObserver = function initCanvasMutationObserver(win, blockClass, blockSelector) {
        this.startRAFTimestamping();
        this.startPendingCanvasMutationFlusher();
        var canvasContextReset = initCanvasContextObserver(win, blockClass, blockSelector, false);
        var canvas2DReset = initCanvas2DMutationObserver(this.processMutation.bind(this), win, blockClass, blockSelector);
        var canvasWebGL1and2Reset = initCanvasWebGLMutationObserver(this.processMutation.bind(this), win, blockClass, blockSelector);
        this.resetObservers = function() {
            canvasContextReset();
            canvas2DReset();
            canvasWebGL1and2Reset();
        };
    };
    _proto.startPendingCanvasMutationFlusher = function startPendingCanvasMutationFlusher() {
        var _this = this;
        requestAnimationFrame(function() {
            return _this.flushPendingCanvasMutations();
        });
    };
    _proto.startRAFTimestamping = function startRAFTimestamping() {
        var _this = this;
        var setLatestRAFTimestamp = function(timestamp) {
            _this.rafStamps.latestId = timestamp;
            requestAnimationFrame(setLatestRAFTimestamp);
        };
        requestAnimationFrame(setLatestRAFTimestamp);
    };
    _proto.flushPendingCanvasMutations = function flushPendingCanvasMutations() {
        var _this = this;
        this.pendingCanvasMutations.forEach(function(_values, canvas) {
            var id = _this.mirror.getId(canvas);
            _this.flushPendingCanvasMutationFor(canvas, id);
        });
        requestAnimationFrame(function() {
            return _this.flushPendingCanvasMutations();
        });
    };
    _proto.flushPendingCanvasMutationFor = function flushPendingCanvasMutationFor(canvas, id) {
        if (this.frozen || this.locked) {
            return;
        }
        var valuesWithType = this.pendingCanvasMutations.get(canvas);
        if (!valuesWithType || id === -1) return;
        var values = valuesWithType.map(function(value) {
            value.type; var rest = _object_without_properties_loose(value, [
                "type"
            ]);
            return rest;
        });
        var type = valuesWithType[0].type;
        this.mutationCb({
            id: id,
            type: type,
            commands: values
        });
        this.pendingCanvasMutations.delete(canvas);
    };
    return CanvasManager;
}();
var StylesheetManager = /*#__PURE__*/ function() {
    function StylesheetManager(options) {
        __publicField$1(this, "trackedLinkElements", /* @__PURE__ */ new WeakSet());
        __publicField$1(this, "mutationCb");
        __publicField$1(this, "adoptedStyleSheetCb");
        __publicField$1(this, "styleMirror", new StyleSheetMirror());
        this.mutationCb = options.mutationCb;
        this.adoptedStyleSheetCb = options.adoptedStyleSheetCb;
    }
    var _proto = StylesheetManager.prototype;
    _proto.attachLinkElement = function attachLinkElement(linkEl, childSn) {
        if ("_cssText" in childSn.attributes) this.mutationCb({
            adds: [],
            removes: [],
            texts: [],
            attributes: [
                {
                    id: childSn.id,
                    attributes: childSn.attributes
                }
            ]
        });
        this.trackLinkElement(linkEl);
    };
    _proto.trackLinkElement = function trackLinkElement(linkEl) {
        if (this.trackedLinkElements.has(linkEl)) return;
        this.trackedLinkElements.add(linkEl);
        this.trackStylesheetInLinkElement(linkEl);
    };
    _proto.adoptStyleSheets = function adoptStyleSheets(sheets, hostId) {
        var _this, _loop = function() {
            var sheet = _step.value;
            var styleId = void 0;
            if (!_this.styleMirror.has(sheet)) {
                styleId = _this.styleMirror.add(sheet);
                styles.push({
                    styleId: styleId,
                    rules: Array.from(sheet.rules || CSSRule, function(r2, index2) {
                        return {
                            rule: stringifyRule(r2, sheet.href),
                            index: index2
                        };
                    })
                });
            } else styleId = _this.styleMirror.getId(sheet);
            adoptedStyleSheetData.styleIds.push(styleId);
        };
        if (sheets.length === 0) return;
        var adoptedStyleSheetData = {
            id: hostId,
            styleIds: []
        };
        var styles = [];
        for(var _iterator = _create_for_of_iterator_helper_loose(sheets), _step; !(_step = _iterator()).done;)_this = this, _loop();
        if (styles.length > 0) adoptedStyleSheetData.styles = styles;
        this.adoptedStyleSheetCb(adoptedStyleSheetData);
    };
    _proto.reset = function reset() {
        this.styleMirror.reset();
        this.trackedLinkElements = /* @__PURE__ */ new WeakSet();
    };
    // TODO: take snapshot on stylesheet reload by applying event listener
    _proto.trackStylesheetInLinkElement = function trackStylesheetInLinkElement(_linkEl) {};
    return StylesheetManager;
}();
var ProcessedNodeManager = /*#__PURE__*/ function() {
    function ProcessedNodeManager() {
        __publicField$1(this, "nodeMap", /* @__PURE__ */ new WeakMap());
        __publicField$1(this, "active", false);
    }
    var _proto = ProcessedNodeManager.prototype;
    _proto.inOtherBuffer = function inOtherBuffer(node2, thisBuffer) {
        var buffers = this.nodeMap.get(node2);
        return buffers && Array.from(buffers).some(function(buffer) {
            return buffer !== thisBuffer;
        });
    };
    _proto.add = function add(node2, buffer) {
        var _this = this;
        if (!this.active) {
            this.active = true;
            requestAnimationFrame(function() {
                _this.nodeMap = /* @__PURE__ */ new WeakMap();
                _this.active = false;
            });
        }
        this.nodeMap.set(node2, (this.nodeMap.get(node2) || /* @__PURE__ */ new Set()).add(buffer));
    };
    _proto.destroy = function destroy() {};
    return ProcessedNodeManager;
}();
var wrappedEmit;
var takeFullSnapshot$1;
var canvasManager;
var recording = false;
try {
    if (Array.from([
        1
    ], function(x2) {
        return x2 * 2;
    })[0] !== 2) {
        var cleanFrame = document.createElement("iframe");
        document.body.appendChild(cleanFrame);
        Array.from = ((_a = cleanFrame.contentWindow) == null ? void 0 : _a.Array.from) || Array.from;
        document.body.removeChild(cleanFrame);
    }
} catch (err) {
    console.debug("Unable to override Array.from", err);
}
var mirror = createMirror$2();
function record(options) {
    if (options === void 0) options = {};
    var emit = options.emit, checkoutEveryNms = options.checkoutEveryNms, checkoutEveryNth = options.checkoutEveryNth, _options_blockClass = options.blockClass, blockClass = _options_blockClass === void 0 ? "rr-block" : _options_blockClass, _options_blockSelector = options.blockSelector, blockSelector = _options_blockSelector === void 0 ? null : _options_blockSelector, _options_ignoreClass = options.ignoreClass, ignoreClass = _options_ignoreClass === void 0 ? "rr-ignore" : _options_ignoreClass, _options_ignoreSelector = options.ignoreSelector, ignoreSelector = _options_ignoreSelector === void 0 ? null : _options_ignoreSelector, _options_maskTextClass = options.maskTextClass, maskTextClass = _options_maskTextClass === void 0 ? "rr-mask" : _options_maskTextClass, _options_maskTextSelector = options.maskTextSelector, maskTextSelector = _options_maskTextSelector === void 0 ? null : _options_maskTextSelector, _options_inlineStylesheet = options.inlineStylesheet, inlineStylesheet = _options_inlineStylesheet === void 0 ? true : _options_inlineStylesheet, maskAllInputs = options.maskAllInputs, _maskInputOptions = options.maskInputOptions, _slimDOMOptions = options.slimDOMOptions, maskInputFn = options.maskInputFn, maskTextFn = options.maskTextFn, hooks = options.hooks, packFn = options.packFn, _options_sampling = options.sampling, sampling = _options_sampling === void 0 ? {} : _options_sampling, _options_dataURLOptions = options.dataURLOptions, dataURLOptions = _options_dataURLOptions === void 0 ? {} : _options_dataURLOptions, mousemoveWait = options.mousemoveWait, _options_recordDOM = options.recordDOM, recordDOM = _options_recordDOM === void 0 ? true : _options_recordDOM, _options_recordCanvas = options.recordCanvas, recordCanvas = _options_recordCanvas === void 0 ? false : _options_recordCanvas, _options_recordCrossOriginIframes = options.recordCrossOriginIframes, recordCrossOriginIframes = _options_recordCrossOriginIframes === void 0 ? false : _options_recordCrossOriginIframes, _options_recordAfter = options.recordAfter, recordAfter = _options_recordAfter === void 0 ? options.recordAfter === "DOMContentLoaded" ? options.recordAfter : "load" : _options_recordAfter, _options_userTriggeredOnInput = options.userTriggeredOnInput, userTriggeredOnInput = _options_userTriggeredOnInput === void 0 ? false : _options_userTriggeredOnInput, _options_collectFonts = options.collectFonts, collectFonts = _options_collectFonts === void 0 ? false : _options_collectFonts, _options_inlineImages = options.inlineImages, inlineImages = _options_inlineImages === void 0 ? false : _options_inlineImages, plugins = options.plugins, _options_keepIframeSrcFn = options.keepIframeSrcFn, keepIframeSrcFn = _options_keepIframeSrcFn === void 0 ? function() {
        return false;
    } : _options_keepIframeSrcFn, _options_ignoreCSSAttributes = options.ignoreCSSAttributes, ignoreCSSAttributes = _options_ignoreCSSAttributes === void 0 ? /* @__PURE__ */ new Set([]) : _options_ignoreCSSAttributes, errorHandler2 = options.errorHandler;
    registerErrorHandler(errorHandler2);
    var inEmittingFrame = recordCrossOriginIframes ? window.parent === window : true;
    var passEmitsToParent = false;
    if (!inEmittingFrame) {
        try {
            if (window.parent.document) {
                passEmitsToParent = false;
            }
        } catch (e2) {
            passEmitsToParent = true;
        }
    }
    if (inEmittingFrame && !emit) {
        throw new Error("emit function is required");
    }
    if (!inEmittingFrame && !passEmitsToParent) {
        return function() {};
    }
    if (mousemoveWait !== void 0 && sampling.mousemove === void 0) {
        sampling.mousemove = mousemoveWait;
    }
    mirror.reset();
    var maskInputOptions = maskAllInputs === true ? {
        color: true,
        date: true,
        "datetime-local": true,
        email: true,
        month: true,
        number: true,
        range: true,
        search: true,
        tel: true,
        text: true,
        time: true,
        url: true,
        week: true,
        textarea: true,
        select: true,
        password: true,
        hidden: true
    } : _maskInputOptions !== void 0 ? _maskInputOptions : {
        password: true
    };
    var slimDOMOptions = _slimDOMOptions === true || _slimDOMOptions === "all" ? {
        script: true,
        comment: true,
        headFavicon: true,
        headWhitespace: true,
        headMetaSocial: true,
        headMetaRobots: true,
        headMetaHttpEquiv: true,
        headMetaVerification: true,
        // the following are off for slimDOMOptions === true,
        // as they destroy some (hidden) info:
        headMetaAuthorship: _slimDOMOptions === "all",
        headMetaDescKeywords: _slimDOMOptions === "all",
        headTitleMutations: _slimDOMOptions === "all"
    } : _slimDOMOptions ? _slimDOMOptions : {};
    polyfill$1();
    var lastFullSnapshotEvent;
    var incrementalSnapshotCount = 0;
    var eventProcessor = function(e2) {
        for(var _iterator = _create_for_of_iterator_helper_loose(plugins || []), _step; !(_step = _iterator()).done;){
            var plugin3 = _step.value;
            if (plugin3.eventProcessor) {
                e2 = plugin3.eventProcessor(e2);
            }
        }
        if (packFn && // Disable packing events which will be emitted to parent frames.
        !passEmitsToParent) {
            e2 = packFn(e2);
        }
        return e2;
    };
    wrappedEmit = function(r2, isCheckout) {
        var _a2;
        var e2 = r2;
        e2.timestamp = nowTimestamp();
        if (((_a2 = mutationBuffers[0]) == null ? void 0 : _a2.isFrozen()) && e2.type !== EventType.FullSnapshot && !(e2.type === EventType.IncrementalSnapshot && e2.data.source === IncrementalSource.Mutation)) {
            mutationBuffers.forEach(function(buf) {
                return buf.unfreeze();
            });
        }
        if (inEmittingFrame) {
            emit == null ? void 0 : emit(eventProcessor(e2), isCheckout);
        } else if (passEmitsToParent) {
            var message = {
                type: "rrweb",
                event: eventProcessor(e2),
                origin: window.location.origin,
                isCheckout: isCheckout
            };
            window.parent.postMessage(message, "*");
        }
        if (e2.type === EventType.FullSnapshot) {
            lastFullSnapshotEvent = e2;
            incrementalSnapshotCount = 0;
        } else if (e2.type === EventType.IncrementalSnapshot) {
            if (e2.data.source === IncrementalSource.Mutation && e2.data.isAttachIframe) {
                return;
            }
            incrementalSnapshotCount++;
            var exceedCount = checkoutEveryNth && incrementalSnapshotCount >= checkoutEveryNth;
            var exceedTime = checkoutEveryNms && e2.timestamp - lastFullSnapshotEvent.timestamp > checkoutEveryNms;
            if (exceedCount || exceedTime) {
                takeFullSnapshot$1(true);
            }
        }
    };
    var wrappedMutationEmit = function(m) {
        wrappedEmit({
            type: EventType.IncrementalSnapshot,
            data: _extends({
                source: IncrementalSource.Mutation
            }, m)
        });
    };
    var wrappedScrollEmit = function(p) {
        return wrappedEmit({
            type: EventType.IncrementalSnapshot,
            data: _extends({
                source: IncrementalSource.Scroll
            }, p)
        });
    };
    var wrappedCanvasMutationEmit = function(p) {
        return wrappedEmit({
            type: EventType.IncrementalSnapshot,
            data: _extends({
                source: IncrementalSource.CanvasMutation
            }, p)
        });
    };
    var wrappedAdoptedStyleSheetEmit = function(a2) {
        return wrappedEmit({
            type: EventType.IncrementalSnapshot,
            data: _extends({
                source: IncrementalSource.AdoptedStyleSheet
            }, a2)
        });
    };
    var stylesheetManager = new StylesheetManager({
        mutationCb: wrappedMutationEmit,
        adoptedStyleSheetCb: wrappedAdoptedStyleSheetEmit
    });
    var iframeManager = new IframeManager({
        mirror: mirror,
        mutationCb: wrappedMutationEmit,
        stylesheetManager: stylesheetManager,
        recordCrossOriginIframes: recordCrossOriginIframes,
        wrappedEmit: wrappedEmit
    });
    for(var _iterator = _create_for_of_iterator_helper_loose(plugins || []), _step; !(_step = _iterator()).done;){
        var plugin3 = _step.value;
        if (plugin3.getMirror) plugin3.getMirror({
            nodeMirror: mirror,
            crossOriginIframeMirror: iframeManager.crossOriginIframeMirror,
            crossOriginIframeStyleMirror: iframeManager.crossOriginIframeStyleMirror
        });
    }
    var processedNodeManager = new ProcessedNodeManager();
    canvasManager = new CanvasManager({
        recordCanvas: recordCanvas,
        mutationCb: wrappedCanvasMutationEmit,
        win: window,
        blockClass: blockClass,
        blockSelector: blockSelector,
        mirror: mirror,
        sampling: sampling.canvas,
        dataURLOptions: dataURLOptions
    });
    var shadowDomManager = new ShadowDomManager({
        mutationCb: wrappedMutationEmit,
        scrollCb: wrappedScrollEmit,
        bypassOptions: {
            blockClass: blockClass,
            blockSelector: blockSelector,
            maskTextClass: maskTextClass,
            maskTextSelector: maskTextSelector,
            inlineStylesheet: inlineStylesheet,
            maskInputOptions: maskInputOptions,
            dataURLOptions: dataURLOptions,
            maskTextFn: maskTextFn,
            maskInputFn: maskInputFn,
            recordCanvas: recordCanvas,
            inlineImages: inlineImages,
            sampling: sampling,
            slimDOMOptions: slimDOMOptions,
            iframeManager: iframeManager,
            stylesheetManager: stylesheetManager,
            canvasManager: canvasManager,
            keepIframeSrcFn: keepIframeSrcFn,
            processedNodeManager: processedNodeManager
        },
        mirror: mirror
    });
    takeFullSnapshot$1 = function(isCheckout) {
        if (isCheckout === void 0) isCheckout = false;
        if (!recordDOM) {
            return;
        }
        wrappedEmit({
            type: EventType.Meta,
            data: {
                href: window.location.href,
                width: getWindowWidth(),
                height: getWindowHeight()
            }
        }, isCheckout);
        stylesheetManager.reset();
        shadowDomManager.init();
        mutationBuffers.forEach(function(buf) {
            return buf.lock();
        });
        var node2 = snapshot(document, {
            mirror: mirror,
            blockClass: blockClass,
            blockSelector: blockSelector,
            maskTextClass: maskTextClass,
            maskTextSelector: maskTextSelector,
            inlineStylesheet: inlineStylesheet,
            maskAllInputs: maskInputOptions,
            maskTextFn: maskTextFn,
            maskInputFn: maskInputFn,
            slimDOM: slimDOMOptions,
            dataURLOptions: dataURLOptions,
            recordCanvas: recordCanvas,
            inlineImages: inlineImages,
            onSerialize: function(n2) {
                if (isSerializedIframe(n2, mirror)) {
                    iframeManager.addIframe(n2);
                }
                if (isSerializedStylesheet(n2, mirror)) {
                    stylesheetManager.trackLinkElement(n2);
                }
                if (hasShadowRoot(n2)) {
                    shadowDomManager.addShadowRoot(index$2.shadowRoot(n2), document);
                }
            },
            onIframeLoad: function(iframe, childSn) {
                iframeManager.attachIframe(iframe, childSn);
                shadowDomManager.observeAttachShadow(iframe);
            },
            onStylesheetLoad: function(linkEl, childSn) {
                stylesheetManager.attachLinkElement(linkEl, childSn);
            },
            keepIframeSrcFn: keepIframeSrcFn
        });
        if (!node2) {
            return console.warn("Failed to snapshot the document");
        }
        wrappedEmit({
            type: EventType.FullSnapshot,
            data: {
                node: node2,
                initialOffset: getWindowScroll(window)
            }
        }, isCheckout);
        mutationBuffers.forEach(function(buf) {
            return buf.unlock();
        });
        if (document.adoptedStyleSheets && document.adoptedStyleSheets.length > 0) stylesheetManager.adoptStyleSheets(document.adoptedStyleSheets, mirror.getId(document));
    };
    try {
        var handlers = [];
        var observe = function(doc) {
            var _a2;
            return callbackWrapper(initObservers)({
                mutationCb: wrappedMutationEmit,
                mousemoveCb: function(positions, source) {
                    return wrappedEmit({
                        type: EventType.IncrementalSnapshot,
                        data: {
                            source: source,
                            positions: positions
                        }
                    });
                },
                mouseInteractionCb: function(d) {
                    return wrappedEmit({
                        type: EventType.IncrementalSnapshot,
                        data: _extends({
                            source: IncrementalSource.MouseInteraction
                        }, d)
                    });
                },
                scrollCb: wrappedScrollEmit,
                viewportResizeCb: function(d) {
                    return wrappedEmit({
                        type: EventType.IncrementalSnapshot,
                        data: _extends({
                            source: IncrementalSource.ViewportResize
                        }, d)
                    });
                },
                inputCb: function(v2) {
                    return wrappedEmit({
                        type: EventType.IncrementalSnapshot,
                        data: _extends({
                            source: IncrementalSource.Input
                        }, v2)
                    });
                },
                mediaInteractionCb: function(p) {
                    return wrappedEmit({
                        type: EventType.IncrementalSnapshot,
                        data: _extends({
                            source: IncrementalSource.MediaInteraction
                        }, p)
                    });
                },
                styleSheetRuleCb: function(r2) {
                    return wrappedEmit({
                        type: EventType.IncrementalSnapshot,
                        data: _extends({
                            source: IncrementalSource.StyleSheetRule
                        }, r2)
                    });
                },
                styleDeclarationCb: function(r2) {
                    return wrappedEmit({
                        type: EventType.IncrementalSnapshot,
                        data: _extends({
                            source: IncrementalSource.StyleDeclaration
                        }, r2)
                    });
                },
                canvasMutationCb: wrappedCanvasMutationEmit,
                fontCb: function(p) {
                    return wrappedEmit({
                        type: EventType.IncrementalSnapshot,
                        data: _extends({
                            source: IncrementalSource.Font
                        }, p)
                    });
                },
                selectionCb: function(p) {
                    wrappedEmit({
                        type: EventType.IncrementalSnapshot,
                        data: _extends({
                            source: IncrementalSource.Selection
                        }, p)
                    });
                },
                customElementCb: function(c2) {
                    wrappedEmit({
                        type: EventType.IncrementalSnapshot,
                        data: _extends({
                            source: IncrementalSource.CustomElement
                        }, c2)
                    });
                },
                blockClass: blockClass,
                ignoreClass: ignoreClass,
                ignoreSelector: ignoreSelector,
                maskTextClass: maskTextClass,
                maskTextSelector: maskTextSelector,
                maskInputOptions: maskInputOptions,
                inlineStylesheet: inlineStylesheet,
                sampling: sampling,
                recordDOM: recordDOM,
                recordCanvas: recordCanvas,
                inlineImages: inlineImages,
                userTriggeredOnInput: userTriggeredOnInput,
                collectFonts: collectFonts,
                doc: doc,
                maskInputFn: maskInputFn,
                maskTextFn: maskTextFn,
                keepIframeSrcFn: keepIframeSrcFn,
                blockSelector: blockSelector,
                slimDOMOptions: slimDOMOptions,
                dataURLOptions: dataURLOptions,
                mirror: mirror,
                iframeManager: iframeManager,
                stylesheetManager: stylesheetManager,
                shadowDomManager: shadowDomManager,
                processedNodeManager: processedNodeManager,
                canvasManager: canvasManager,
                ignoreCSSAttributes: ignoreCSSAttributes,
                plugins: ((_a2 = plugins == null ? void 0 : plugins.filter(function(p) {
                    return p.observer;
                })) == null ? void 0 : _a2.map(function(p) {
                    return {
                        observer: p.observer,
                        options: p.options,
                        callback: function(payload) {
                            return wrappedEmit({
                                type: EventType.Plugin,
                                data: {
                                    plugin: p.name,
                                    payload: payload
                                }
                            });
                        }
                    };
                })) || []
            }, hooks);
        };
        iframeManager.addLoadListener(function(iframeEl) {
            try {
                handlers.push(observe(iframeEl.contentDocument));
            } catch (error) {
                console.warn(error);
            }
        });
        var init = function() {
            takeFullSnapshot$1();
            handlers.push(observe(document));
            recording = true;
        };
        if (document.readyState === "interactive" || document.readyState === "complete") {
            init();
        } else {
            handlers.push(on("DOMContentLoaded", function() {
                wrappedEmit({
                    type: EventType.DomContentLoaded,
                    data: {}
                });
                if (recordAfter === "DOMContentLoaded") init();
            }));
            handlers.push(on("load", function() {
                wrappedEmit({
                    type: EventType.Load,
                    data: {}
                });
                if (recordAfter === "load") init();
            }, window));
        }
        return function() {
            handlers.forEach(function(handler) {
                try {
                    handler();
                } catch (error) {
                    var msg = String(error).toLowerCase();
                    if (!msg.includes("cross-origin")) {
                        console.warn(error);
                    }
                }
            });
            processedNodeManager.destroy();
            recording = false;
            unregisterErrorHandler();
        };
    } catch (error) {
        console.warn(error);
    }
}
record.addCustomEvent = function(tag, payload) {
    if (!recording) {
        throw new Error("please add custom event after start recording");
    }
    wrappedEmit({
        type: EventType.Custom,
        data: {
            tag: tag,
            payload: payload
        }
    });
};
record.freezePage = function() {
    mutationBuffers.forEach(function(buf) {
        return buf.freeze();
    });
};
record.takeFullSnapshot = function(isCheckout) {
    if (!recording) {
        throw new Error("please take full snapshot after start recording");
    }
    takeFullSnapshot$1(isCheckout);
};
record.mirror = mirror;
var n;
!function(t2) {
    t2[t2.NotStarted = 0] = "NotStarted", t2[t2.Running = 1] = "Running", t2[t2.Stopped = 2] = "Stopped";
}(n || (n = {}));
record.addCustomEvent;
record.freezePage;
record.takeFullSnapshot;
var testableAccessors = {
    Node: [
        "childNodes",
        "parentNode",
        "parentElement",
        "textContent"
    ],
    ShadowRoot: [
        "host",
        "styleSheets"
    ],
    Element: [
        "shadowRoot",
        "querySelector",
        "querySelectorAll"
    ],
    MutationObserver: []
};
var testableMethods = {
    Node: [
        "contains",
        "getRootNode"
    ],
    ShadowRoot: [
        "getSelection"
    ],
    Element: [],
    MutationObserver: [
        "constructor"
    ]
};
var untaintedBasePrototype = {};
var isAngularZonePresent = function() {
    return !!globalThis.Zone;
};
function getUntaintedPrototype(key) {
    if (untaintedBasePrototype[key]) return untaintedBasePrototype[key];
    var defaultObj = globalThis[key];
    var defaultPrototype = defaultObj.prototype;
    var accessorNames = key in testableAccessors ? testableAccessors[key] : void 0;
    var isUntaintedAccessors = Boolean(accessorNames && // @ts-expect-error 2345
    accessorNames.every(function(accessor) {
        var _a, _b;
        return Boolean((_b = (_a = Object.getOwnPropertyDescriptor(defaultPrototype, accessor)) == null ? void 0 : _a.get) == null ? void 0 : _b.toString().includes("[native code]"));
    }));
    var methodNames = key in testableMethods ? testableMethods[key] : void 0;
    var isUntaintedMethods = Boolean(methodNames && methodNames.every(// @ts-expect-error 2345
    function(method) {
        var _a;
        return typeof defaultPrototype[method] === "function" && ((_a = defaultPrototype[method]) == null ? void 0 : _a.toString().includes("[native code]"));
    }));
    if (isUntaintedAccessors && isUntaintedMethods && !isAngularZonePresent()) {
        untaintedBasePrototype[key] = defaultObj.prototype;
        return defaultObj.prototype;
    }
    try {
        var iframeEl = document.createElement("iframe");
        document.body.appendChild(iframeEl);
        var win = iframeEl.contentWindow;
        if (!win) return defaultObj.prototype;
        var untaintedObject = win[key].prototype;
        document.body.removeChild(iframeEl);
        if (!untaintedObject) return defaultPrototype;
        return untaintedBasePrototype[key] = untaintedObject;
    } catch (e) {
        return defaultPrototype;
    }
}
var untaintedAccessorCache = {};
function getUntaintedAccessor(key, instance, accessor) {
    var _a;
    var cacheKey = key + "." + String(accessor);
    if (untaintedAccessorCache[cacheKey]) return untaintedAccessorCache[cacheKey].call(instance);
    var untaintedPrototype = getUntaintedPrototype(key);
    var untaintedAccessor = (_a = Object.getOwnPropertyDescriptor(untaintedPrototype, accessor)) == null ? void 0 : _a.get;
    if (!untaintedAccessor) return instance[accessor];
    untaintedAccessorCache[cacheKey] = untaintedAccessor;
    return untaintedAccessor.call(instance);
}
var untaintedMethodCache = {};
function getUntaintedMethod(key, instance, method) {
    var cacheKey = key + "." + String(method);
    if (untaintedMethodCache[cacheKey]) return untaintedMethodCache[cacheKey].bind(instance);
    var untaintedPrototype = getUntaintedPrototype(key);
    var untaintedMethod = untaintedPrototype[method];
    if (typeof untaintedMethod !== "function") return instance[method];
    untaintedMethodCache[cacheKey] = untaintedMethod;
    return untaintedMethod.bind(instance);
}
function childNodes(n) {
    return getUntaintedAccessor("Node", n, "childNodes");
}
function parentNode(n) {
    return getUntaintedAccessor("Node", n, "parentNode");
}
function parentElement(n) {
    return getUntaintedAccessor("Node", n, "parentElement");
}
function textContent(n) {
    return getUntaintedAccessor("Node", n, "textContent");
}
function contains(n, other) {
    return getUntaintedMethod("Node", n, "contains")(other);
}
function getRootNode(n) {
    return getUntaintedMethod("Node", n, "getRootNode")();
}
function host(n) {
    if (!n || !("host" in n)) return null;
    return getUntaintedAccessor("ShadowRoot", n, "host");
}
function styleSheets(n) {
    return n.styleSheets;
}
function shadowRoot(n) {
    if (!n || !("shadowRoot" in n)) return null;
    return getUntaintedAccessor("Element", n, "shadowRoot");
}
function querySelector(n, selectors) {
    return getUntaintedAccessor("Element", n, "querySelector")(selectors);
}
function querySelectorAll(n, selectors) {
    return getUntaintedAccessor("Element", n, "querySelectorAll")(selectors);
}
function mutationObserverCtor() {
    return getUntaintedPrototype("MutationObserver").constructor;
}
function patch$1(source, name, replacement) {
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
var index = {
    childNodes: childNodes,
    parentNode: parentNode,
    parentElement: parentElement,
    textContent: textContent,
    contains: contains,
    getRootNode: getRootNode,
    host: host,
    styleSheets: styleSheets,
    shadowRoot: shadowRoot,
    querySelector: querySelector,
    querySelectorAll: querySelectorAll,
    mutationObserver: mutationObserverCtor,
    patch: patch$1
};
function classMatchesRegex(node2, regex, checkAncestors) {
    if (!node2) return false;
    if (node2.nodeType !== node2.ELEMENT_NODE) {
        if (!checkAncestors) return false;
        return classMatchesRegex(index.parentNode(node2), regex, checkAncestors);
    }
    for(var eIndex = node2.classList.length; eIndex--;){
        var className = node2.classList[eIndex];
        if (regex.test(className)) {
            return true;
        }
    }
    if (!checkAncestors) return false;
    return classMatchesRegex(index.parentNode(node2), regex, checkAncestors);
}
function getDefaultExportFromCjs(x2) {
    return x2 && x2.__esModule && Object.prototype.hasOwnProperty.call(x2, "default") ? x2["default"] : x2;
}
function getAugmentedNamespace(n) {
    if (n.__esModule) return n;
    var f = n.default;
    if (typeof f == "function") {
        var a = function a2() {
            if (_instanceof(this, a2)) {
                return Reflect.construct(f, arguments, this.constructor);
            }
            return f.apply(this, arguments);
        };
        a.prototype = f.prototype;
    } else a = {};
    Object.defineProperty(a, "__esModule", {
        value: true
    });
    Object.keys(n).forEach(function(k) {
        var d = Object.getOwnPropertyDescriptor(n, k);
        Object.defineProperty(a, k, d.get ? d : {
            enumerable: true,
            get: function get() {
                return n[k];
            }
        });
    });
    return a;
}
var picocolors_browser = {
    exports: {}
};
var x = String;
var create = function create() {
    return {
        isColorSupported: false,
        reset: x,
        bold: x,
        dim: x,
        italic: x,
        underline: x,
        inverse: x,
        hidden: x,
        strikethrough: x,
        black: x,
        red: x,
        green: x,
        yellow: x,
        blue: x,
        magenta: x,
        cyan: x,
        white: x,
        gray: x,
        bgBlack: x,
        bgRed: x,
        bgGreen: x,
        bgYellow: x,
        bgBlue: x,
        bgMagenta: x,
        bgCyan: x,
        bgWhite: x
    };
};
picocolors_browser.exports = create();
picocolors_browser.exports.createColors = create;
var picocolors_browserExports = picocolors_browser.exports;
var __viteBrowserExternal = {};
var __viteBrowserExternal$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
    __proto__: null,
    default: __viteBrowserExternal
}, Symbol.toStringTag, {
    value: "Module"
}));
var require$$2 = /* @__PURE__ */ getAugmentedNamespace(__viteBrowserExternal$1);
var pico = picocolors_browserExports;
var terminalHighlight$1 = require$$2;
var CssSyntaxError$3 = /*#__PURE__*/ function(Error1) {
    _inherits(CssSyntaxError, Error1);
    function CssSyntaxError(message, line, column, source, file, plugin2) {
        var _this;
        _this = Error1.call(this, message) || this;
        _this.name = "CssSyntaxError";
        _this.reason = message;
        if (file) {
            _this.file = file;
        }
        if (source) {
            _this.source = source;
        }
        if (plugin2) {
            _this.plugin = plugin2;
        }
        if (typeof line !== "undefined" && typeof column !== "undefined") {
            if (typeof line === "number") {
                _this.line = line;
                _this.column = column;
            } else {
                _this.line = line.line;
                _this.column = line.column;
                _this.endLine = column.line;
                _this.endColumn = column.column;
            }
        }
        _this.setMessage();
        if (Error.captureStackTrace) {
            Error.captureStackTrace(_this, CssSyntaxError);
        }
        return _this;
    }
    var _proto = CssSyntaxError.prototype;
    _proto.setMessage = function setMessage() {
        this.message = this.plugin ? this.plugin + ": " : "";
        this.message += this.file ? this.file : "<css input>";
        if (typeof this.line !== "undefined") {
            this.message += ":" + this.line + ":" + this.column;
        }
        this.message += ": " + this.reason;
    };
    _proto.showSourceCode = function showSourceCode(color) {
        var _this = this;
        if (!this.source) return "";
        var css = this.source;
        if (color == null) color = pico.isColorSupported;
        if (terminalHighlight$1) {
            if (color) css = terminalHighlight$1(css);
        }
        var lines = css.split(/\r?\n/);
        var start = Math.max(this.line - 3, 0);
        var end = Math.min(this.line + 2, lines.length);
        var maxWidth = String(end).length;
        var mark, aside;
        if (color) {
            var _pico_createColors = pico.createColors(true), bold = _pico_createColors.bold, gray = _pico_createColors.gray, red = _pico_createColors.red;
            mark = function(text) {
                return bold(red(text));
            };
            aside = function(text) {
                return gray(text);
            };
        } else {
            mark = aside = function(str) {
                return str;
            };
        }
        return lines.slice(start, end).map(function(line, index2) {
            var number = start + 1 + index2;
            var gutter = " " + (" " + number).slice(-maxWidth) + " | ";
            if (number === _this.line) {
                var spacing = aside(gutter.replace(/\d/g, " ")) + line.slice(0, _this.column - 1).replace(/[^\t]/g, " ");
                return mark(">") + aside(gutter) + line + "\n " + spacing + mark("^");
            }
            return " " + aside(gutter) + line;
        }).join("\n");
    };
    _proto.toString = function toString() {
        var code = this.showSourceCode();
        if (code) {
            code = "\n\n" + code + "\n";
        }
        return this.name + ": " + this.message + code;
    };
    return CssSyntaxError;
}(_wrap_native_super(Error));
var cssSyntaxError = CssSyntaxError$3;
CssSyntaxError$3.default = CssSyntaxError$3;
var symbols = {};
symbols.isClean = Symbol("isClean");
symbols.my = Symbol("my");
var DEFAULT_RAW = {
    after: "\n",
    beforeClose: "\n",
    beforeComment: "\n",
    beforeDecl: "\n",
    beforeOpen: " ",
    beforeRule: "\n",
    colon: ": ",
    commentLeft: " ",
    commentRight: " ",
    emptyBody: "",
    indent: "    ",
    semicolon: false
};
function capitalize(str) {
    return str[0].toUpperCase() + str.slice(1);
}
var Stringifier$2 = /*#__PURE__*/ function() {
    function Stringifier(builder) {
        this.builder = builder;
    }
    var _proto = Stringifier.prototype;
    _proto.atrule = function atrule(node2, semicolon) {
        var name = "@" + node2.name;
        var params = node2.params ? this.rawValue(node2, "params") : "";
        if (typeof node2.raws.afterName !== "undefined") {
            name += node2.raws.afterName;
        } else if (params) {
            name += " ";
        }
        if (node2.nodes) {
            this.block(node2, name + params);
        } else {
            var end = (node2.raws.between || "") + (semicolon ? ";" : "");
            this.builder(name + params + end, node2);
        }
    };
    _proto.beforeAfter = function beforeAfter(node2, detect) {
        var value;
        if (node2.type === "decl") {
            value = this.raw(node2, null, "beforeDecl");
        } else if (node2.type === "comment") {
            value = this.raw(node2, null, "beforeComment");
        } else if (detect === "before") {
            value = this.raw(node2, null, "beforeRule");
        } else {
            value = this.raw(node2, null, "beforeClose");
        }
        var buf = node2.parent;
        var depth = 0;
        while(buf && buf.type !== "root"){
            depth += 1;
            buf = buf.parent;
        }
        if (value.includes("\n")) {
            var indent = this.raw(node2, null, "indent");
            if (indent.length) {
                for(var step = 0; step < depth; step++)value += indent;
            }
        }
        return value;
    };
    _proto.block = function block(node2, start) {
        var between = this.raw(node2, "between", "beforeOpen");
        this.builder(start + between + "{", node2, "start");
        var after;
        if (node2.nodes && node2.nodes.length) {
            this.body(node2);
            after = this.raw(node2, "after");
        } else {
            after = this.raw(node2, "after", "emptyBody");
        }
        if (after) this.builder(after);
        this.builder("}", node2, "end");
    };
    _proto.body = function body(node2) {
        var last = node2.nodes.length - 1;
        while(last > 0){
            if (node2.nodes[last].type !== "comment") break;
            last -= 1;
        }
        var semicolon = this.raw(node2, "semicolon");
        for(var i = 0; i < node2.nodes.length; i++){
            var child = node2.nodes[i];
            var before = this.raw(child, "before");
            if (before) this.builder(before);
            this.stringify(child, last !== i || semicolon);
        }
    };
    _proto.comment = function comment(node2) {
        var left = this.raw(node2, "left", "commentLeft");
        var right = this.raw(node2, "right", "commentRight");
        this.builder("/*" + left + node2.text + right + "*/", node2);
    };
    _proto.decl = function decl(node2, semicolon) {
        var between = this.raw(node2, "between", "colon");
        var string = node2.prop + between + this.rawValue(node2, "value");
        if (node2.important) {
            string += node2.raws.important || " !important";
        }
        if (semicolon) string += ";";
        this.builder(string, node2);
    };
    _proto.document = function document1(node2) {
        this.body(node2);
    };
    _proto.raw = function raw(node2, own, detect) {
        var value;
        if (!detect) detect = own;
        if (own) {
            value = node2.raws[own];
            if (typeof value !== "undefined") return value;
        }
        var parent = node2.parent;
        if (detect === "before") {
            if (!parent || parent.type === "root" && parent.first === node2) {
                return "";
            }
            if (parent && parent.type === "document") {
                return "";
            }
        }
        if (!parent) return DEFAULT_RAW[detect];
        var root2 = node2.root();
        if (!root2.rawCache) root2.rawCache = {};
        if (typeof root2.rawCache[detect] !== "undefined") {
            return root2.rawCache[detect];
        }
        if (detect === "before" || detect === "after") {
            return this.beforeAfter(node2, detect);
        } else {
            var method = "raw" + capitalize(detect);
            if (this[method]) {
                value = this[method](root2, node2);
            } else {
                root2.walk(function(i) {
                    value = i.raws[own];
                    if (typeof value !== "undefined") return false;
                });
            }
        }
        if (typeof value === "undefined") value = DEFAULT_RAW[detect];
        root2.rawCache[detect] = value;
        return value;
    };
    _proto.rawBeforeClose = function rawBeforeClose(root2) {
        var value;
        root2.walk(function(i) {
            if (i.nodes && i.nodes.length > 0) {
                if (typeof i.raws.after !== "undefined") {
                    value = i.raws.after;
                    if (value.includes("\n")) {
                        value = value.replace(/[^\n]+$/, "");
                    }
                    return false;
                }
            }
        });
        if (value) value = value.replace(/\S/g, "");
        return value;
    };
    _proto.rawBeforeComment = function rawBeforeComment(root2, node2) {
        var value;
        root2.walkComments(function(i) {
            if (typeof i.raws.before !== "undefined") {
                value = i.raws.before;
                if (value.includes("\n")) {
                    value = value.replace(/[^\n]+$/, "");
                }
                return false;
            }
        });
        if (typeof value === "undefined") {
            value = this.raw(node2, null, "beforeDecl");
        } else if (value) {
            value = value.replace(/\S/g, "");
        }
        return value;
    };
    _proto.rawBeforeDecl = function rawBeforeDecl(root2, node2) {
        var value;
        root2.walkDecls(function(i) {
            if (typeof i.raws.before !== "undefined") {
                value = i.raws.before;
                if (value.includes("\n")) {
                    value = value.replace(/[^\n]+$/, "");
                }
                return false;
            }
        });
        if (typeof value === "undefined") {
            value = this.raw(node2, null, "beforeRule");
        } else if (value) {
            value = value.replace(/\S/g, "");
        }
        return value;
    };
    _proto.rawBeforeOpen = function rawBeforeOpen(root2) {
        var value;
        root2.walk(function(i) {
            if (i.type !== "decl") {
                value = i.raws.between;
                if (typeof value !== "undefined") return false;
            }
        });
        return value;
    };
    _proto.rawBeforeRule = function rawBeforeRule(root2) {
        var value;
        root2.walk(function(i) {
            if (i.nodes && (i.parent !== root2 || root2.first !== i)) {
                if (typeof i.raws.before !== "undefined") {
                    value = i.raws.before;
                    if (value.includes("\n")) {
                        value = value.replace(/[^\n]+$/, "");
                    }
                    return false;
                }
            }
        });
        if (value) value = value.replace(/\S/g, "");
        return value;
    };
    _proto.rawColon = function rawColon(root2) {
        var value;
        root2.walkDecls(function(i) {
            if (typeof i.raws.between !== "undefined") {
                value = i.raws.between.replace(/[^\s:]/g, "");
                return false;
            }
        });
        return value;
    };
    _proto.rawEmptyBody = function rawEmptyBody(root2) {
        var value;
        root2.walk(function(i) {
            if (i.nodes && i.nodes.length === 0) {
                value = i.raws.after;
                if (typeof value !== "undefined") return false;
            }
        });
        return value;
    };
    _proto.rawIndent = function rawIndent(root2) {
        if (root2.raws.indent) return root2.raws.indent;
        var value;
        root2.walk(function(i) {
            var p = i.parent;
            if (p && p !== root2 && p.parent && p.parent === root2) {
                if (typeof i.raws.before !== "undefined") {
                    var parts = i.raws.before.split("\n");
                    value = parts[parts.length - 1];
                    value = value.replace(/\S/g, "");
                    return false;
                }
            }
        });
        return value;
    };
    _proto.rawSemicolon = function rawSemicolon(root2) {
        var value;
        root2.walk(function(i) {
            if (i.nodes && i.nodes.length && i.last.type === "decl") {
                value = i.raws.semicolon;
                if (typeof value !== "undefined") return false;
            }
        });
        return value;
    };
    _proto.rawValue = function rawValue(node2, prop) {
        var value = node2[prop];
        var raw = node2.raws[prop];
        if (raw && raw.value === value) {
            return raw.raw;
        }
        return value;
    };
    _proto.root = function root(node2) {
        this.body(node2);
        if (node2.raws.after) this.builder(node2.raws.after);
    };
    _proto.rule = function rule(node2) {
        this.block(node2, this.rawValue(node2, "selector"));
        if (node2.raws.ownSemicolon) {
            this.builder(node2.raws.ownSemicolon, node2, "end");
        }
    };
    _proto.stringify = function stringify(node2, semicolon) {
        if (!this[node2.type]) {
            throw new Error("Unknown AST node type " + node2.type + ". Maybe you need to change PostCSS stringifier.");
        }
        this[node2.type](node2, semicolon);
    };
    return Stringifier;
}();
var stringifier = Stringifier$2;
Stringifier$2.default = Stringifier$2;
var Stringifier$1 = stringifier;
function stringify$4(node2, builder) {
    var str = new Stringifier$1(builder);
    str.stringify(node2);
}
var stringify_1 = stringify$4;
stringify$4.default = stringify$4;
var isClean$2 = symbols.isClean, my$2 = symbols.my;
var CssSyntaxError$2 = cssSyntaxError;
var Stringifier2 = stringifier;
var stringify$3 = stringify_1;
function cloneNode(obj, parent) {
    var cloned = new obj.constructor();
    for(var i in obj){
        if (!Object.prototype.hasOwnProperty.call(obj, i)) {
            continue;
        }
        if (i === "proxyCache") continue;
        var value = obj[i];
        var type = typeof value === "undefined" ? "undefined" : _type_of(value);
        if (i === "parent" && type === "object") {
            if (parent) cloned[i] = parent;
        } else if (i === "source") {
            cloned[i] = value;
        } else if (Array.isArray(value)) {
            cloned[i] = value.map(function(j) {
                return cloneNode(j, cloned);
            });
        } else {
            if (type === "object" && value !== null) value = cloneNode(value);
            cloned[i] = value;
        }
    }
    return cloned;
}
var Node$4 = /*#__PURE__*/ function() {
    function Node1(defaults) {
        if (defaults === void 0) defaults = {};
        this.raws = {};
        this[isClean$2] = false;
        this[my$2] = true;
        for(var name in defaults){
            if (name === "nodes") {
                this.nodes = [];
                for(var _iterator = _create_for_of_iterator_helper_loose(defaults[name]), _step; !(_step = _iterator()).done;){
                    var node2 = _step.value;
                    if (typeof node2.clone === "function") {
                        this.append(node2.clone());
                    } else {
                        this.append(node2);
                    }
                }
            } else {
                this[name] = defaults[name];
            }
        }
    }
    var _proto = Node1.prototype;
    _proto.addToError = function addToError(error) {
        error.postcssNode = this;
        if (error.stack && this.source && /\n\s{4}at /.test(error.stack)) {
            var s = this.source;
            error.stack = error.stack.replace(/\n\s{4}at /, "$&" + s.input.from + ":" + s.start.line + ":" + s.start.column + "$&");
        }
        return error;
    };
    _proto.after = function after(add) {
        this.parent.insertAfter(this, add);
        return this;
    };
    _proto.assign = function assign(overrides) {
        if (overrides === void 0) overrides = {};
        for(var name in overrides){
            this[name] = overrides[name];
        }
        return this;
    };
    _proto.before = function before(add) {
        this.parent.insertBefore(this, add);
        return this;
    };
    _proto.cleanRaws = function cleanRaws(keepBetween) {
        delete this.raws.before;
        delete this.raws.after;
        if (!keepBetween) delete this.raws.between;
    };
    _proto.clone = function clone(overrides) {
        if (overrides === void 0) overrides = {};
        var cloned = cloneNode(this);
        for(var name in overrides){
            cloned[name] = overrides[name];
        }
        return cloned;
    };
    _proto.cloneAfter = function cloneAfter(overrides) {
        if (overrides === void 0) overrides = {};
        var cloned = this.clone(overrides);
        this.parent.insertAfter(this, cloned);
        return cloned;
    };
    _proto.cloneBefore = function cloneBefore(overrides) {
        if (overrides === void 0) overrides = {};
        var cloned = this.clone(overrides);
        this.parent.insertBefore(this, cloned);
        return cloned;
    };
    _proto.error = function error(message, opts) {
        if (opts === void 0) opts = {};
        if (this.source) {
            var _this_rangeBy = this.rangeBy(opts), end = _this_rangeBy.end, start = _this_rangeBy.start;
            return this.source.input.error(message, {
                column: start.column,
                line: start.line
            }, {
                column: end.column,
                line: end.line
            }, opts);
        }
        return new CssSyntaxError$2(message);
    };
    _proto.getProxyProcessor = function getProxyProcessor() {
        return {
            get: function get(node2, prop) {
                if (prop === "proxyOf") {
                    return node2;
                } else if (prop === "root") {
                    return function() {
                        return node2.root().toProxy();
                    };
                } else {
                    return node2[prop];
                }
            },
            set: function set(node2, prop, value) {
                if (node2[prop] === value) return true;
                node2[prop] = value;
                if (prop === "prop" || prop === "value" || prop === "name" || prop === "params" || prop === "important" || /* c8 ignore next */ prop === "text") {
                    node2.markDirty();
                }
                return true;
            }
        };
    };
    _proto.markDirty = function markDirty() {
        if (this[isClean$2]) {
            this[isClean$2] = false;
            var next = this;
            while(next = next.parent){
                next[isClean$2] = false;
            }
        }
    };
    _proto.next = function next() {
        if (!this.parent) return void 0;
        var index2 = this.parent.index(this);
        return this.parent.nodes[index2 + 1];
    };
    _proto.positionBy = function positionBy(opts, stringRepresentation) {
        var pos = this.source.start;
        if (opts.index) {
            pos = this.positionInside(opts.index, stringRepresentation);
        } else if (opts.word) {
            stringRepresentation = this.toString();
            var index2 = stringRepresentation.indexOf(opts.word);
            if (index2 !== -1) pos = this.positionInside(index2, stringRepresentation);
        }
        return pos;
    };
    _proto.positionInside = function positionInside(index2, stringRepresentation) {
        var string = stringRepresentation || this.toString();
        var column = this.source.start.column;
        var line = this.source.start.line;
        for(var i = 0; i < index2; i++){
            if (string[i] === "\n") {
                column = 1;
                line += 1;
            } else {
                column += 1;
            }
        }
        return {
            column: column,
            line: line
        };
    };
    _proto.prev = function prev() {
        if (!this.parent) return void 0;
        var index2 = this.parent.index(this);
        return this.parent.nodes[index2 - 1];
    };
    _proto.rangeBy = function rangeBy(opts) {
        var start = {
            column: this.source.start.column,
            line: this.source.start.line
        };
        var end = this.source.end ? {
            column: this.source.end.column + 1,
            line: this.source.end.line
        } : {
            column: start.column + 1,
            line: start.line
        };
        if (opts.word) {
            var stringRepresentation = this.toString();
            var index2 = stringRepresentation.indexOf(opts.word);
            if (index2 !== -1) {
                start = this.positionInside(index2, stringRepresentation);
                end = this.positionInside(index2 + opts.word.length, stringRepresentation);
            }
        } else {
            if (opts.start) {
                start = {
                    column: opts.start.column,
                    line: opts.start.line
                };
            } else if (opts.index) {
                start = this.positionInside(opts.index);
            }
            if (opts.end) {
                end = {
                    column: opts.end.column,
                    line: opts.end.line
                };
            } else if (typeof opts.endIndex === "number") {
                end = this.positionInside(opts.endIndex);
            } else if (opts.index) {
                end = this.positionInside(opts.index + 1);
            }
        }
        if (end.line < start.line || end.line === start.line && end.column <= start.column) {
            end = {
                column: start.column + 1,
                line: start.line
            };
        }
        return {
            end: end,
            start: start
        };
    };
    _proto.raw = function raw(prop, defaultType) {
        var str = new Stringifier2();
        return str.raw(this, prop, defaultType);
    };
    _proto.remove = function remove() {
        if (this.parent) {
            this.parent.removeChild(this);
        }
        this.parent = void 0;
        return this;
    };
    _proto.replaceWith = function replaceWith() {
        for(var _len = arguments.length, nodes = new Array(_len), _key = 0; _key < _len; _key++){
            nodes[_key] = arguments[_key];
        }
        if (this.parent) {
            var bookmark = this;
            var foundSelf = false;
            for(var _iterator = _create_for_of_iterator_helper_loose(nodes), _step; !(_step = _iterator()).done;){
                var node2 = _step.value;
                if (node2 === this) {
                    foundSelf = true;
                } else if (foundSelf) {
                    this.parent.insertAfter(bookmark, node2);
                    bookmark = node2;
                } else {
                    this.parent.insertBefore(bookmark, node2);
                }
            }
            if (!foundSelf) {
                this.remove();
            }
        }
        return this;
    };
    _proto.root = function root() {
        var result2 = this;
        while(result2.parent && result2.parent.type !== "document"){
            result2 = result2.parent;
        }
        return result2;
    };
    _proto.toJSON = function toJSON(_, inputs) {
        var fixed = {};
        var emitInputs = inputs == null;
        inputs = inputs || /* @__PURE__ */ new Map();
        var inputsNextIndex = 0;
        for(var name in this){
            if (!Object.prototype.hasOwnProperty.call(this, name)) {
                continue;
            }
            if (name === "parent" || name === "proxyCache") continue;
            var value = this[name];
            if (Array.isArray(value)) {
                fixed[name] = value.map(function(i) {
                    if ((typeof i === "undefined" ? "undefined" : _type_of(i)) === "object" && i.toJSON) {
                        return i.toJSON(null, inputs);
                    } else {
                        return i;
                    }
                });
            } else if ((typeof value === "undefined" ? "undefined" : _type_of(value)) === "object" && value.toJSON) {
                fixed[name] = value.toJSON(null, inputs);
            } else if (name === "source") {
                var inputId = inputs.get(value.input);
                if (inputId == null) {
                    inputId = inputsNextIndex;
                    inputs.set(value.input, inputsNextIndex);
                    inputsNextIndex++;
                }
                fixed[name] = {
                    end: value.end,
                    inputId: inputId,
                    start: value.start
                };
            } else {
                fixed[name] = value;
            }
        }
        if (emitInputs) {
            fixed.inputs = [].concat(inputs.keys()).map(function(input2) {
                return input2.toJSON();
            });
        }
        return fixed;
    };
    _proto.toProxy = function toProxy() {
        if (!this.proxyCache) {
            this.proxyCache = new Proxy(this, this.getProxyProcessor());
        }
        return this.proxyCache;
    };
    _proto.toString = function toString(stringifier2) {
        if (stringifier2 === void 0) stringifier2 = stringify$3;
        if (stringifier2.stringify) stringifier2 = stringifier2.stringify;
        var result2 = "";
        stringifier2(this, function(i) {
            result2 += i;
        });
        return result2;
    };
    _proto.warn = function warn(result2, text, opts) {
        var data = {
            node: this
        };
        for(var i in opts)data[i] = opts[i];
        return result2.warn(text, data);
    };
    _create_class(Node1, [
        {
            key: "proxyOf",
            get: function get() {
                return this;
            }
        }
    ]);
    return Node1;
}();
var node = Node$4;
Node$4.default = Node$4;
var Node$3 = node;
var Declaration$4 = /*#__PURE__*/ function(Node$3) {
    _inherits(Declaration, Node$3);
    function Declaration(defaults) {
        var _this;
        if (defaults && typeof defaults.value !== "undefined" && typeof defaults.value !== "string") {
            defaults = _extends({}, defaults, {
                value: String(defaults.value)
            });
        }
        _this = Node$3.call(this, defaults) || this;
        _this.type = "decl";
        return _this;
    }
    _create_class(Declaration, [
        {
            key: "variable",
            get: function get() {
                return this.prop.startsWith("--") || this.prop[0] === "$";
            }
        }
    ]);
    return Declaration;
}(Node$3);
var declaration = Declaration$4;
Declaration$4.default = Declaration$4;
var urlAlphabet = "useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict";
var nanoid$1 = function(size) {
    if (size === void 0) size = 21;
    var id = "";
    var i = size;
    while(i--){
        id += urlAlphabet[Math.random() * 64 | 0];
    }
    return id;
};
var nonSecure = {
    nanoid: nanoid$1
};
var SourceMapConsumer$2 = require$$2.SourceMapConsumer, SourceMapGenerator$2 = require$$2.SourceMapGenerator;
var existsSync = require$$2.existsSync, readFileSync = require$$2.readFileSync;
var dirname$1 = require$$2.dirname, join = require$$2.join;
function fromBase64(str) {
    if (Buffer) {
        return Buffer.from(str, "base64").toString();
    } else {
        return window.atob(str);
    }
}
var PreviousMap$2 = /*#__PURE__*/ function() {
    function PreviousMap(css, opts) {
        if (opts.map === false) return;
        this.loadAnnotation(css);
        this.inline = this.startWith(this.annotation, "data:");
        var prev = opts.map ? opts.map.prev : void 0;
        var text = this.loadMap(opts.from, prev);
        if (!this.mapFile && opts.from) {
            this.mapFile = opts.from;
        }
        if (this.mapFile) this.root = dirname$1(this.mapFile);
        if (text) this.text = text;
    }
    var _proto = PreviousMap.prototype;
    _proto.consumer = function consumer() {
        if (!this.consumerCache) {
            this.consumerCache = new SourceMapConsumer$2(this.text);
        }
        return this.consumerCache;
    };
    _proto.decodeInline = function decodeInline(text) {
        var baseCharsetUri = /^data:application\/json;charset=utf-?8;base64,/;
        var baseUri = /^data:application\/json;base64,/;
        var charsetUri = /^data:application\/json;charset=utf-?8,/;
        var uri = /^data:application\/json,/;
        if (charsetUri.test(text) || uri.test(text)) {
            return decodeURIComponent(text.substr(RegExp.lastMatch.length));
        }
        if (baseCharsetUri.test(text) || baseUri.test(text)) {
            return fromBase64(text.substr(RegExp.lastMatch.length));
        }
        var encoding = text.match(/data:application\/json;([^,]+),/)[1];
        throw new Error("Unsupported source map encoding " + encoding);
    };
    _proto.getAnnotationURL = function getAnnotationURL(sourceMapString) {
        return sourceMapString.replace(/^\/\*\s*# sourceMappingURL=/, "").trim();
    };
    _proto.isMap = function isMap(map) {
        if ((typeof map === "undefined" ? "undefined" : _type_of(map)) !== "object") return false;
        return typeof map.mappings === "string" || typeof map._mappings === "string" || Array.isArray(map.sections);
    };
    _proto.loadAnnotation = function loadAnnotation(css) {
        var comments = css.match(/\/\*\s*# sourceMappingURL=/gm);
        if (!comments) return;
        var start = css.lastIndexOf(comments.pop());
        var end = css.indexOf("*/", start);
        if (start > -1 && end > -1) {
            this.annotation = this.getAnnotationURL(css.substring(start, end));
        }
    };
    _proto.loadFile = function loadFile(path) {
        this.root = dirname$1(path);
        if (existsSync(path)) {
            this.mapFile = path;
            return readFileSync(path, "utf-8").toString().trim();
        }
    };
    _proto.loadMap = function loadMap(file, prev) {
        if (prev === false) return false;
        if (prev) {
            if (typeof prev === "string") {
                return prev;
            } else if (typeof prev === "function") {
                var prevPath = prev(file);
                if (prevPath) {
                    var map = this.loadFile(prevPath);
                    if (!map) {
                        throw new Error("Unable to load previous source map: " + prevPath.toString());
                    }
                    return map;
                }
            } else if (_instanceof(prev, SourceMapConsumer$2)) {
                return SourceMapGenerator$2.fromSourceMap(prev).toString();
            } else if (_instanceof(prev, SourceMapGenerator$2)) {
                return prev.toString();
            } else if (this.isMap(prev)) {
                return JSON.stringify(prev);
            } else {
                throw new Error("Unsupported previous source map format: " + prev.toString());
            }
        } else if (this.inline) {
            return this.decodeInline(this.annotation);
        } else if (this.annotation) {
            var map1 = this.annotation;
            if (file) map1 = join(dirname$1(file), map1);
            return this.loadFile(map1);
        }
    };
    _proto.startWith = function startWith(string, start) {
        if (!string) return false;
        return string.substr(0, start.length) === start;
    };
    _proto.withContent = function withContent() {
        return !!(this.consumer().sourcesContent && this.consumer().sourcesContent.length > 0);
    };
    return PreviousMap;
}();
var previousMap = PreviousMap$2;
PreviousMap$2.default = PreviousMap$2;
var SourceMapConsumer$1 = require$$2.SourceMapConsumer, SourceMapGenerator$1 = require$$2.SourceMapGenerator;
var fileURLToPath = require$$2.fileURLToPath, pathToFileURL$1 = require$$2.pathToFileURL;
var isAbsolute = require$$2.isAbsolute, resolve$1 = require$$2.resolve;
var nanoid = nonSecure.nanoid;
var terminalHighlight = require$$2;
var CssSyntaxError$1 = cssSyntaxError;
var PreviousMap$1 = previousMap;
var fromOffsetCache = Symbol("fromOffsetCache");
var sourceMapAvailable$1 = Boolean(SourceMapConsumer$1 && SourceMapGenerator$1);
var pathAvailable$1 = Boolean(resolve$1 && isAbsolute);
var Input$4 = /*#__PURE__*/ function() {
    function Input(css, opts) {
        if (opts === void 0) opts = {};
        if (css === null || typeof css === "undefined" || (typeof css === "undefined" ? "undefined" : _type_of(css)) === "object" && !css.toString) {
            throw new Error("PostCSS received " + css + " instead of CSS string");
        }
        this.css = css.toString();
        if (this.css[0] === "\uFEFF" || this.css[0] === "￾") {
            this.hasBOM = true;
            this.css = this.css.slice(1);
        } else {
            this.hasBOM = false;
        }
        if (opts.from) {
            if (!pathAvailable$1 || /^\w+:\/\//.test(opts.from) || isAbsolute(opts.from)) {
                this.file = opts.from;
            } else {
                this.file = resolve$1(opts.from);
            }
        }
        if (pathAvailable$1 && sourceMapAvailable$1) {
            var map = new PreviousMap$1(this.css, opts);
            if (map.text) {
                this.map = map;
                var file = map.consumer().file;
                if (!this.file && file) this.file = this.mapResolve(file);
            }
        }
        if (!this.file) {
            this.id = "<input css " + nanoid(6) + ">";
        }
        if (this.map) this.map.file = this.from;
    }
    var _proto = Input.prototype;
    _proto.error = function error(message, line, column, opts) {
        if (opts === void 0) opts = {};
        var result2, endLine, endColumn;
        if (line && (typeof line === "undefined" ? "undefined" : _type_of(line)) === "object") {
            var start = line;
            var end = column;
            if (typeof start.offset === "number") {
                var pos = this.fromOffset(start.offset);
                line = pos.line;
                column = pos.col;
            } else {
                line = start.line;
                column = start.column;
            }
            if (typeof end.offset === "number") {
                var pos1 = this.fromOffset(end.offset);
                endLine = pos1.line;
                endColumn = pos1.col;
            } else {
                endLine = end.line;
                endColumn = end.column;
            }
        } else if (!column) {
            var pos2 = this.fromOffset(line);
            line = pos2.line;
            column = pos2.col;
        }
        var origin = this.origin(line, column, endLine, endColumn);
        if (origin) {
            result2 = new CssSyntaxError$1(message, origin.endLine === void 0 ? origin.line : {
                column: origin.column,
                line: origin.line
            }, origin.endLine === void 0 ? origin.column : {
                column: origin.endColumn,
                line: origin.endLine
            }, origin.source, origin.file, opts.plugin);
        } else {
            result2 = new CssSyntaxError$1(message, endLine === void 0 ? line : {
                column: column,
                line: line
            }, endLine === void 0 ? column : {
                column: endColumn,
                line: endLine
            }, this.css, this.file, opts.plugin);
        }
        result2.input = {
            column: column,
            endColumn: endColumn,
            endLine: endLine,
            line: line,
            source: this.css
        };
        if (this.file) {
            if (pathToFileURL$1) {
                result2.input.url = pathToFileURL$1(this.file).toString();
            }
            result2.input.file = this.file;
        }
        return result2;
    };
    _proto.fromOffset = function fromOffset(offset) {
        var lastLine, lineToIndex;
        if (!this[fromOffsetCache]) {
            var lines = this.css.split("\n");
            lineToIndex = new Array(lines.length);
            var prevIndex = 0;
            for(var i = 0, l = lines.length; i < l; i++){
                lineToIndex[i] = prevIndex;
                prevIndex += lines[i].length + 1;
            }
            this[fromOffsetCache] = lineToIndex;
        } else {
            lineToIndex = this[fromOffsetCache];
        }
        lastLine = lineToIndex[lineToIndex.length - 1];
        var min = 0;
        if (offset >= lastLine) {
            min = lineToIndex.length - 1;
        } else {
            var max = lineToIndex.length - 2;
            var mid;
            while(min < max){
                mid = min + (max - min >> 1);
                if (offset < lineToIndex[mid]) {
                    max = mid - 1;
                } else if (offset >= lineToIndex[mid + 1]) {
                    min = mid + 1;
                } else {
                    min = mid;
                    break;
                }
            }
        }
        return {
            col: offset - lineToIndex[min] + 1,
            line: min + 1
        };
    };
    _proto.mapResolve = function mapResolve(file) {
        if (/^\w+:\/\//.test(file)) {
            return file;
        }
        return resolve$1(this.map.consumer().sourceRoot || this.map.root || ".", file);
    };
    _proto.origin = function origin(line, column, endLine, endColumn) {
        if (!this.map) return false;
        var consumer = this.map.consumer();
        var from = consumer.originalPositionFor({
            column: column,
            line: line
        });
        if (!from.source) return false;
        var to;
        if (typeof endLine === "number") {
            to = consumer.originalPositionFor({
                column: endColumn,
                line: endLine
            });
        }
        var fromUrl;
        if (isAbsolute(from.source)) {
            fromUrl = pathToFileURL$1(from.source);
        } else {
            fromUrl = new URL(from.source, this.map.consumer().sourceRoot || pathToFileURL$1(this.map.mapFile));
        }
        var result2 = {
            column: from.column,
            endColumn: to && to.column,
            endLine: to && to.line,
            line: from.line,
            url: fromUrl.toString()
        };
        if (fromUrl.protocol === "file:") {
            if (fileURLToPath) {
                result2.file = fileURLToPath(fromUrl);
            } else {
                throw new Error("file: protocol is not available in this PostCSS build");
            }
        }
        var source = consumer.sourceContentFor(from.source);
        if (source) result2.source = source;
        return result2;
    };
    _proto.toJSON = function toJSON() {
        var json = {};
        for(var _i = 0, _iter = [
            "hasBOM",
            "css",
            "file",
            "id"
        ]; _i < _iter.length; _i++){
            var name = _iter[_i];
            if (this[name] != null) {
                json[name] = this[name];
            }
        }
        if (this.map) {
            json.map = _extends({}, this.map);
            if (json.map.consumerCache) {
                json.map.consumerCache = void 0;
            }
        }
        return json;
    };
    _create_class(Input, [
        {
            key: "from",
            get: function get() {
                return this.file || this.id;
            }
        }
    ]);
    return Input;
}();
var input = Input$4;
Input$4.default = Input$4;
if (terminalHighlight && terminalHighlight.registerInput) {
    terminalHighlight.registerInput(Input$4);
}
var SourceMapConsumer = require$$2.SourceMapConsumer, SourceMapGenerator = require$$2.SourceMapGenerator;
var dirname = require$$2.dirname, relative = require$$2.relative, resolve = require$$2.resolve, sep = require$$2.sep;
var pathToFileURL = require$$2.pathToFileURL;
var Input$3 = input;
var sourceMapAvailable = Boolean(SourceMapConsumer && SourceMapGenerator);
var pathAvailable = Boolean(dirname && resolve && relative && sep);
var MapGenerator$2 = /*#__PURE__*/ function() {
    function MapGenerator(stringify2, root2, opts, cssString) {
        this.stringify = stringify2;
        this.mapOpts = opts.map || {};
        this.root = root2;
        this.opts = opts;
        this.css = cssString;
        this.originalCSS = cssString;
        this.usesFileUrls = !this.mapOpts.from && this.mapOpts.absolute;
        this.memoizedFileURLs = /* @__PURE__ */ new Map();
        this.memoizedPaths = /* @__PURE__ */ new Map();
        this.memoizedURLs = /* @__PURE__ */ new Map();
    }
    var _proto = MapGenerator.prototype;
    _proto.addAnnotation = function addAnnotation() {
        var content;
        if (this.isInline()) {
            content = "data:application/json;base64," + this.toBase64(this.map.toString());
        } else if (typeof this.mapOpts.annotation === "string") {
            content = this.mapOpts.annotation;
        } else if (typeof this.mapOpts.annotation === "function") {
            content = this.mapOpts.annotation(this.opts.to, this.root);
        } else {
            content = this.outputFile() + ".map";
        }
        var eol = "\n";
        if (this.css.includes("\r\n")) eol = "\r\n";
        this.css += eol + "/*# sourceMappingURL=" + content + " */";
    };
    _proto.applyPrevMaps = function applyPrevMaps() {
        for(var _iterator = _create_for_of_iterator_helper_loose(this.previous()), _step; !(_step = _iterator()).done;){
            var prev = _step.value;
            var from = this.toUrl(this.path(prev.file));
            var root2 = prev.root || dirname(prev.file);
            var map = void 0;
            if (this.mapOpts.sourcesContent === false) {
                map = new SourceMapConsumer(prev.text);
                if (map.sourcesContent) {
                    map.sourcesContent = null;
                }
            } else {
                map = prev.consumer();
            }
            this.map.applySourceMap(map, from, this.toUrl(this.path(root2)));
        }
    };
    _proto.clearAnnotation = function clearAnnotation() {
        if (this.mapOpts.annotation === false) return;
        if (this.root) {
            var node2;
            for(var i = this.root.nodes.length - 1; i >= 0; i--){
                node2 = this.root.nodes[i];
                if (node2.type !== "comment") continue;
                if (node2.text.indexOf("# sourceMappingURL=") === 0) {
                    this.root.removeChild(i);
                }
            }
        } else if (this.css) {
            this.css = this.css.replace(/\n*?\/\*#[\S\s]*?\*\/$/gm, "");
        }
    };
    _proto.generate = function generate() {
        this.clearAnnotation();
        if (pathAvailable && sourceMapAvailable && this.isMap()) {
            return this.generateMap();
        } else {
            var result2 = "";
            this.stringify(this.root, function(i) {
                result2 += i;
            });
            return [
                result2
            ];
        }
    };
    _proto.generateMap = function generateMap() {
        if (this.root) {
            this.generateString();
        } else if (this.previous().length === 1) {
            var prev = this.previous()[0].consumer();
            prev.file = this.outputFile();
            this.map = SourceMapGenerator.fromSourceMap(prev, {
                ignoreInvalidMapping: true
            });
        } else {
            this.map = new SourceMapGenerator({
                file: this.outputFile(),
                ignoreInvalidMapping: true
            });
            this.map.addMapping({
                generated: {
                    column: 0,
                    line: 1
                },
                original: {
                    column: 0,
                    line: 1
                },
                source: this.opts.from ? this.toUrl(this.path(this.opts.from)) : "<no source>"
            });
        }
        if (this.isSourcesContent()) this.setSourcesContent();
        if (this.root && this.previous().length > 0) this.applyPrevMaps();
        if (this.isAnnotation()) this.addAnnotation();
        if (this.isInline()) {
            return [
                this.css
            ];
        } else {
            return [
                this.css,
                this.map
            ];
        }
    };
    _proto.generateString = function generateString() {
        var _this = this;
        this.css = "";
        this.map = new SourceMapGenerator({
            file: this.outputFile(),
            ignoreInvalidMapping: true
        });
        var line = 1;
        var column = 1;
        var noSource = "<no source>";
        var mapping = {
            generated: {
                column: 0,
                line: 0
            },
            original: {
                column: 0,
                line: 0
            },
            source: ""
        };
        var lines, last;
        this.stringify(this.root, function(str, node2, type) {
            _this.css += str;
            if (node2 && type !== "end") {
                mapping.generated.line = line;
                mapping.generated.column = column - 1;
                if (node2.source && node2.source.start) {
                    mapping.source = _this.sourcePath(node2);
                    mapping.original.line = node2.source.start.line;
                    mapping.original.column = node2.source.start.column - 1;
                    _this.map.addMapping(mapping);
                } else {
                    mapping.source = noSource;
                    mapping.original.line = 1;
                    mapping.original.column = 0;
                    _this.map.addMapping(mapping);
                }
            }
            lines = str.match(/\n/g);
            if (lines) {
                line += lines.length;
                last = str.lastIndexOf("\n");
                column = str.length - last;
            } else {
                column += str.length;
            }
            if (node2 && type !== "start") {
                var p = node2.parent || {
                    raws: {}
                };
                var childless = node2.type === "decl" || node2.type === "atrule" && !node2.nodes;
                if (!childless || node2 !== p.last || p.raws.semicolon) {
                    if (node2.source && node2.source.end) {
                        mapping.source = _this.sourcePath(node2);
                        mapping.original.line = node2.source.end.line;
                        mapping.original.column = node2.source.end.column - 1;
                        mapping.generated.line = line;
                        mapping.generated.column = column - 2;
                        _this.map.addMapping(mapping);
                    } else {
                        mapping.source = noSource;
                        mapping.original.line = 1;
                        mapping.original.column = 0;
                        mapping.generated.line = line;
                        mapping.generated.column = column - 1;
                        _this.map.addMapping(mapping);
                    }
                }
            }
        });
    };
    _proto.isAnnotation = function isAnnotation() {
        if (this.isInline()) {
            return true;
        }
        if (typeof this.mapOpts.annotation !== "undefined") {
            return this.mapOpts.annotation;
        }
        if (this.previous().length) {
            return this.previous().some(function(i) {
                return i.annotation;
            });
        }
        return true;
    };
    _proto.isInline = function isInline() {
        if (typeof this.mapOpts.inline !== "undefined") {
            return this.mapOpts.inline;
        }
        var annotation = this.mapOpts.annotation;
        if (typeof annotation !== "undefined" && annotation !== true) {
            return false;
        }
        if (this.previous().length) {
            return this.previous().some(function(i) {
                return i.inline;
            });
        }
        return true;
    };
    _proto.isMap = function isMap() {
        if (typeof this.opts.map !== "undefined") {
            return !!this.opts.map;
        }
        return this.previous().length > 0;
    };
    _proto.isSourcesContent = function isSourcesContent() {
        if (typeof this.mapOpts.sourcesContent !== "undefined") {
            return this.mapOpts.sourcesContent;
        }
        if (this.previous().length) {
            return this.previous().some(function(i) {
                return i.withContent();
            });
        }
        return true;
    };
    _proto.outputFile = function outputFile() {
        if (this.opts.to) {
            return this.path(this.opts.to);
        } else if (this.opts.from) {
            return this.path(this.opts.from);
        } else {
            return "to.css";
        }
    };
    _proto.path = function path(file) {
        if (this.mapOpts.absolute) return file;
        if (file.charCodeAt(0) === 60) return file;
        if (/^\w+:\/\//.test(file)) return file;
        var cached = this.memoizedPaths.get(file);
        if (cached) return cached;
        var from = this.opts.to ? dirname(this.opts.to) : ".";
        if (typeof this.mapOpts.annotation === "string") {
            from = dirname(resolve(from, this.mapOpts.annotation));
        }
        var path = relative(from, file);
        this.memoizedPaths.set(file, path);
        return path;
    };
    _proto.previous = function previous() {
        var _this = this;
        if (!this.previousMaps) {
            this.previousMaps = [];
            if (this.root) {
                this.root.walk(function(node2) {
                    if (node2.source && node2.source.input.map) {
                        var map = node2.source.input.map;
                        if (!_this.previousMaps.includes(map)) {
                            _this.previousMaps.push(map);
                        }
                    }
                });
            } else {
                var input2 = new Input$3(this.originalCSS, this.opts);
                if (input2.map) this.previousMaps.push(input2.map);
            }
        }
        return this.previousMaps;
    };
    _proto.setSourcesContent = function setSourcesContent() {
        var _this = this;
        var already = {};
        if (this.root) {
            this.root.walk(function(node2) {
                if (node2.source) {
                    var from = node2.source.input.from;
                    if (from && !already[from]) {
                        already[from] = true;
                        var fromUrl = _this.usesFileUrls ? _this.toFileUrl(from) : _this.toUrl(_this.path(from));
                        _this.map.setSourceContent(fromUrl, node2.source.input.css);
                    }
                }
            });
        } else if (this.css) {
            var from = this.opts.from ? this.toUrl(this.path(this.opts.from)) : "<no source>";
            this.map.setSourceContent(from, this.css);
        }
    };
    _proto.sourcePath = function sourcePath(node2) {
        if (this.mapOpts.from) {
            return this.toUrl(this.mapOpts.from);
        } else if (this.usesFileUrls) {
            return this.toFileUrl(node2.source.input.from);
        } else {
            return this.toUrl(this.path(node2.source.input.from));
        }
    };
    _proto.toBase64 = function toBase64(str) {
        if (Buffer) {
            return Buffer.from(str).toString("base64");
        } else {
            return window.btoa(unescape(encodeURIComponent(str)));
        }
    };
    _proto.toFileUrl = function toFileUrl(path) {
        var cached = this.memoizedFileURLs.get(path);
        if (cached) return cached;
        if (pathToFileURL) {
            var fileURL = pathToFileURL(path).toString();
            this.memoizedFileURLs.set(path, fileURL);
            return fileURL;
        } else {
            throw new Error("`map.absolute` option is not available in this PostCSS build");
        }
    };
    _proto.toUrl = function toUrl(path) {
        var cached = this.memoizedURLs.get(path);
        if (cached) return cached;
        if (sep === "\\") {
            path = path.replace(/\\/g, "/");
        }
        var url = encodeURI(path).replace(/[#?]/g, encodeURIComponent);
        this.memoizedURLs.set(path, url);
        return url;
    };
    return MapGenerator;
}();
var mapGenerator = MapGenerator$2;
var Node$2 = node;
var Comment$4 = /*#__PURE__*/ function(Node$2) {
    _inherits(Comment, Node$2);
    function Comment(defaults) {
        var _this;
        _this = Node$2.call(this, defaults) || this;
        _this.type = "comment";
        return _this;
    }
    return Comment;
}(Node$2);
var comment = Comment$4;
Comment$4.default = Comment$4;
var isClean$1 = symbols.isClean, my$1 = symbols.my;
var Declaration$3 = declaration;
var Comment$3 = comment;
var Node$1 = node;
var parse$4, Rule$4, AtRule$4, Root$6;
function cleanSource(nodes) {
    return nodes.map(function(i) {
        if (i.nodes) i.nodes = cleanSource(i.nodes);
        delete i.source;
        return i;
    });
}
function markDirtyUp(node2) {
    node2[isClean$1] = false;
    if (node2.proxyOf.nodes) {
        for(var _iterator = _create_for_of_iterator_helper_loose(node2.proxyOf.nodes), _step; !(_step = _iterator()).done;){
            var i = _step.value;
            markDirtyUp(i);
        }
    }
}
var Container$7 = /*#__PURE__*/ function(Node$1) {
    _inherits(Container, Node$1);
    function Container() {
        return Node$1.apply(this, arguments) || this;
    }
    var _proto = Container.prototype;
    _proto.append = function append() {
        for(var _len = arguments.length, children = new Array(_len), _key = 0; _key < _len; _key++){
            children[_key] = arguments[_key];
        }
        for(var _iterator = _create_for_of_iterator_helper_loose(children), _step; !(_step = _iterator()).done;){
            var child = _step.value;
            var nodes = this.normalize(child, this.last);
            for(var _iterator1 = _create_for_of_iterator_helper_loose(nodes), _step1; !(_step1 = _iterator1()).done;){
                var node2 = _step1.value;
                this.proxyOf.nodes.push(node2);
            }
        }
        this.markDirty();
        return this;
    };
    _proto.cleanRaws = function cleanRaws(keepBetween) {
        Node$1.prototype.cleanRaws.call(this, keepBetween);
        if (this.nodes) {
            for(var _iterator = _create_for_of_iterator_helper_loose(this.nodes), _step; !(_step = _iterator()).done;){
                var node2 = _step.value;
                node2.cleanRaws(keepBetween);
            }
        }
    };
    _proto.each = function each(callback) {
        if (!this.proxyOf.nodes) return void 0;
        var iterator = this.getIterator();
        var index2, result2;
        while(this.indexes[iterator] < this.proxyOf.nodes.length){
            index2 = this.indexes[iterator];
            result2 = callback(this.proxyOf.nodes[index2], index2);
            if (result2 === false) break;
            this.indexes[iterator] += 1;
        }
        delete this.indexes[iterator];
        return result2;
    };
    _proto.every = function every(condition) {
        return this.nodes.every(condition);
    };
    _proto.getIterator = function getIterator() {
        if (!this.lastEach) this.lastEach = 0;
        if (!this.indexes) this.indexes = {};
        this.lastEach += 1;
        var iterator = this.lastEach;
        this.indexes[iterator] = 0;
        return iterator;
    };
    _proto.getProxyProcessor = function getProxyProcessor() {
        return {
            get: function get(node2, prop) {
                if (prop === "proxyOf") {
                    return node2;
                } else if (!node2[prop]) {
                    return node2[prop];
                } else if (prop === "each" || typeof prop === "string" && prop.startsWith("walk")) {
                    return function() {
                        for(var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++){
                            args[_key] = arguments[_key];
                        }
                        var _node2;
                        return (_node2 = node2)[prop].apply(_node2, [].concat(args.map(function(i) {
                            if (typeof i === "function") {
                                return function(child, index2) {
                                    return i(child.toProxy(), index2);
                                };
                            } else {
                                return i;
                            }
                        })));
                    };
                } else if (prop === "every" || prop === "some") {
                    return function(cb) {
                        return node2[prop](function(child) {
                            for(var _len = arguments.length, other = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++){
                                other[_key - 1] = arguments[_key];
                            }
                            return cb.apply(void 0, [].concat([
                                child.toProxy()
                            ], other));
                        });
                    };
                } else if (prop === "root") {
                    return function() {
                        return node2.root().toProxy();
                    };
                } else if (prop === "nodes") {
                    return node2.nodes.map(function(i) {
                        return i.toProxy();
                    });
                } else if (prop === "first" || prop === "last") {
                    return node2[prop].toProxy();
                } else {
                    return node2[prop];
                }
            },
            set: function set(node2, prop, value) {
                if (node2[prop] === value) return true;
                node2[prop] = value;
                if (prop === "name" || prop === "params" || prop === "selector") {
                    node2.markDirty();
                }
                return true;
            }
        };
    };
    _proto.index = function index(child) {
        if (typeof child === "number") return child;
        if (child.proxyOf) child = child.proxyOf;
        return this.proxyOf.nodes.indexOf(child);
    };
    _proto.insertAfter = function insertAfter(exist, add) {
        var existIndex = this.index(exist);
        var nodes = this.normalize(add, this.proxyOf.nodes[existIndex]).reverse();
        existIndex = this.index(exist);
        for(var _iterator = _create_for_of_iterator_helper_loose(nodes), _step; !(_step = _iterator()).done;){
            var node2 = _step.value;
            this.proxyOf.nodes.splice(existIndex + 1, 0, node2);
        }
        var index2;
        for(var id in this.indexes){
            index2 = this.indexes[id];
            if (existIndex < index2) {
                this.indexes[id] = index2 + nodes.length;
            }
        }
        this.markDirty();
        return this;
    };
    _proto.insertBefore = function insertBefore(exist, add) {
        var existIndex = this.index(exist);
        var type = existIndex === 0 ? "prepend" : false;
        var nodes = this.normalize(add, this.proxyOf.nodes[existIndex], type).reverse();
        existIndex = this.index(exist);
        for(var _iterator = _create_for_of_iterator_helper_loose(nodes), _step; !(_step = _iterator()).done;){
            var node2 = _step.value;
            this.proxyOf.nodes.splice(existIndex, 0, node2);
        }
        var index2;
        for(var id in this.indexes){
            index2 = this.indexes[id];
            if (existIndex <= index2) {
                this.indexes[id] = index2 + nodes.length;
            }
        }
        this.markDirty();
        return this;
    };
    _proto.normalize = function normalize(nodes, sample) {
        var _this = this;
        if (typeof nodes === "string") {
            nodes = cleanSource(parse$4(nodes).nodes);
        } else if (typeof nodes === "undefined") {
            nodes = [];
        } else if (Array.isArray(nodes)) {
            nodes = nodes.slice(0);
            for(var _iterator = _create_for_of_iterator_helper_loose(nodes), _step; !(_step = _iterator()).done;){
                var i = _step.value;
                if (i.parent) i.parent.removeChild(i, "ignore");
            }
        } else if (nodes.type === "root" && this.type !== "document") {
            nodes = nodes.nodes.slice(0);
            for(var _iterator1 = _create_for_of_iterator_helper_loose(nodes), _step1; !(_step1 = _iterator1()).done;){
                var i1 = _step1.value;
                if (i1.parent) i1.parent.removeChild(i1, "ignore");
            }
        } else if (nodes.type) {
            nodes = [
                nodes
            ];
        } else if (nodes.prop) {
            if (typeof nodes.value === "undefined") {
                throw new Error("Value field is missed in node creation");
            } else if (typeof nodes.value !== "string") {
                nodes.value = String(nodes.value);
            }
            nodes = [
                new Declaration$3(nodes)
            ];
        } else if (nodes.selector) {
            nodes = [
                new Rule$4(nodes)
            ];
        } else if (nodes.name) {
            nodes = [
                new AtRule$4(nodes)
            ];
        } else if (nodes.text) {
            nodes = [
                new Comment$3(nodes)
            ];
        } else {
            throw new Error("Unknown node type in node creation");
        }
        var processed = nodes.map(function(i) {
            if (!i[my$1]) Container.rebuild(i);
            i = i.proxyOf;
            if (i.parent) i.parent.removeChild(i);
            if (i[isClean$1]) markDirtyUp(i);
            if (typeof i.raws.before === "undefined") {
                if (sample && typeof sample.raws.before !== "undefined") {
                    i.raws.before = sample.raws.before.replace(/\S/g, "");
                }
            }
            i.parent = _this.proxyOf;
            return i;
        });
        return processed;
    };
    _proto.prepend = function prepend() {
        for(var _len = arguments.length, children = new Array(_len), _key = 0; _key < _len; _key++){
            children[_key] = arguments[_key];
        }
        children = children.reverse();
        for(var _iterator = _create_for_of_iterator_helper_loose(children), _step; !(_step = _iterator()).done;){
            var child = _step.value;
            var nodes = this.normalize(child, this.first, "prepend").reverse();
            for(var _iterator1 = _create_for_of_iterator_helper_loose(nodes), _step1; !(_step1 = _iterator1()).done;){
                var node2 = _step1.value;
                this.proxyOf.nodes.unshift(node2);
            }
            for(var id in this.indexes){
                this.indexes[id] = this.indexes[id] + nodes.length;
            }
        }
        this.markDirty();
        return this;
    };
    _proto.push = function push(child) {
        child.parent = this;
        this.proxyOf.nodes.push(child);
        return this;
    };
    _proto.removeAll = function removeAll() {
        for(var _iterator = _create_for_of_iterator_helper_loose(this.proxyOf.nodes), _step; !(_step = _iterator()).done;){
            var node2 = _step.value;
            node2.parent = void 0;
        }
        this.proxyOf.nodes = [];
        this.markDirty();
        return this;
    };
    _proto.removeChild = function removeChild(child) {
        child = this.index(child);
        this.proxyOf.nodes[child].parent = void 0;
        this.proxyOf.nodes.splice(child, 1);
        var index2;
        for(var id in this.indexes){
            index2 = this.indexes[id];
            if (index2 >= child) {
                this.indexes[id] = index2 - 1;
            }
        }
        this.markDirty();
        return this;
    };
    _proto.replaceValues = function replaceValues(pattern, opts, callback) {
        if (!callback) {
            callback = opts;
            opts = {};
        }
        this.walkDecls(function(decl) {
            if (opts.props && !opts.props.includes(decl.prop)) return;
            if (opts.fast && !decl.value.includes(opts.fast)) return;
            decl.value = decl.value.replace(pattern, callback);
        });
        this.markDirty();
        return this;
    };
    _proto.some = function some(condition) {
        return this.nodes.some(condition);
    };
    _proto.walk = function walk(callback) {
        return this.each(function(child, i) {
            var result2;
            try {
                result2 = callback(child, i);
            } catch (e) {
                throw child.addToError(e);
            }
            if (result2 !== false && child.walk) {
                result2 = child.walk(callback);
            }
            return result2;
        });
    };
    _proto.walkAtRules = function walkAtRules(name, callback) {
        if (!callback) {
            callback = name;
            return this.walk(function(child, i) {
                if (child.type === "atrule") {
                    return callback(child, i);
                }
            });
        }
        if (_instanceof(name, RegExp)) {
            return this.walk(function(child, i) {
                if (child.type === "atrule" && name.test(child.name)) {
                    return callback(child, i);
                }
            });
        }
        return this.walk(function(child, i) {
            if (child.type === "atrule" && child.name === name) {
                return callback(child, i);
            }
        });
    };
    _proto.walkComments = function walkComments(callback) {
        return this.walk(function(child, i) {
            if (child.type === "comment") {
                return callback(child, i);
            }
        });
    };
    _proto.walkDecls = function walkDecls(prop, callback) {
        if (!callback) {
            callback = prop;
            return this.walk(function(child, i) {
                if (child.type === "decl") {
                    return callback(child, i);
                }
            });
        }
        if (_instanceof(prop, RegExp)) {
            return this.walk(function(child, i) {
                if (child.type === "decl" && prop.test(child.prop)) {
                    return callback(child, i);
                }
            });
        }
        return this.walk(function(child, i) {
            if (child.type === "decl" && child.prop === prop) {
                return callback(child, i);
            }
        });
    };
    _proto.walkRules = function walkRules(selector, callback) {
        if (!callback) {
            callback = selector;
            return this.walk(function(child, i) {
                if (child.type === "rule") {
                    return callback(child, i);
                }
            });
        }
        if (_instanceof(selector, RegExp)) {
            return this.walk(function(child, i) {
                if (child.type === "rule" && selector.test(child.selector)) {
                    return callback(child, i);
                }
            });
        }
        return this.walk(function(child, i) {
            if (child.type === "rule" && child.selector === selector) {
                return callback(child, i);
            }
        });
    };
    _create_class(Container, [
        {
            key: "first",
            get: function get() {
                if (!this.proxyOf.nodes) return void 0;
                return this.proxyOf.nodes[0];
            }
        },
        {
            key: "last",
            get: function get() {
                if (!this.proxyOf.nodes) return void 0;
                return this.proxyOf.nodes[this.proxyOf.nodes.length - 1];
            }
        }
    ]);
    return Container;
}(Node$1);
Container$7.registerParse = function(dependant) {
    parse$4 = dependant;
};
Container$7.registerRule = function(dependant) {
    Rule$4 = dependant;
};
Container$7.registerAtRule = function(dependant) {
    AtRule$4 = dependant;
};
Container$7.registerRoot = function(dependant) {
    Root$6 = dependant;
};
var container = Container$7;
Container$7.default = Container$7;
Container$7.rebuild = function(node2) {
    if (node2.type === "atrule") {
        Object.setPrototypeOf(node2, AtRule$4.prototype);
    } else if (node2.type === "rule") {
        Object.setPrototypeOf(node2, Rule$4.prototype);
    } else if (node2.type === "decl") {
        Object.setPrototypeOf(node2, Declaration$3.prototype);
    } else if (node2.type === "comment") {
        Object.setPrototypeOf(node2, Comment$3.prototype);
    } else if (node2.type === "root") {
        Object.setPrototypeOf(node2, Root$6.prototype);
    }
    node2[my$1] = true;
    if (node2.nodes) {
        node2.nodes.forEach(function(child) {
            Container$7.rebuild(child);
        });
    }
};
var Container$6 = container;
var LazyResult$4, Processor$3;
var Document$3 = /*#__PURE__*/ function(Container$6) {
    _inherits(Document, Container$6);
    function Document(defaults) {
        var _this;
        _this = Container$6.call(this, _extends({
            type: "document"
        }, defaults)) || this;
        if (!_this.nodes) {
            _this.nodes = [];
        }
        return _this;
    }
    var _proto = Document.prototype;
    _proto.toResult = function toResult(opts) {
        if (opts === void 0) opts = {};
        var lazy = new LazyResult$4(new Processor$3(), this, opts);
        return lazy.stringify();
    };
    return Document;
}(Container$6);
Document$3.registerLazyResult = function(dependant) {
    LazyResult$4 = dependant;
};
Document$3.registerProcessor = function(dependant) {
    Processor$3 = dependant;
};
var document$1 = Document$3;
Document$3.default = Document$3;
var printed = {};
var warnOnce$2 = function warnOnce(message) {
    if (printed[message]) return;
    printed[message] = true;
    if (typeof console !== "undefined" && console.warn) {
        console.warn(message);
    }
};
var Warning$2 = /*#__PURE__*/ function() {
    function Warning(text, opts) {
        if (opts === void 0) opts = {};
        this.type = "warning";
        this.text = text;
        if (opts.node && opts.node.source) {
            var range = opts.node.rangeBy(opts);
            this.line = range.start.line;
            this.column = range.start.column;
            this.endLine = range.end.line;
            this.endColumn = range.end.column;
        }
        for(var opt in opts)this[opt] = opts[opt];
    }
    var _proto = Warning.prototype;
    _proto.toString = function toString() {
        if (this.node) {
            return this.node.error(this.text, {
                index: this.index,
                plugin: this.plugin,
                word: this.word
            }).message;
        }
        if (this.plugin) {
            return this.plugin + ": " + this.text;
        }
        return this.text;
    };
    return Warning;
}();
var warning = Warning$2;
Warning$2.default = Warning$2;
var Warning$1 = warning;
var Result$3 = /*#__PURE__*/ function() {
    function Result(processor2, root2, opts) {
        this.processor = processor2;
        this.messages = [];
        this.root = root2;
        this.opts = opts;
        this.css = void 0;
        this.map = void 0;
    }
    var _proto = Result.prototype;
    _proto.toString = function toString() {
        return this.css;
    };
    _proto.warn = function warn(text, opts) {
        if (opts === void 0) opts = {};
        if (!opts.plugin) {
            if (this.lastPlugin && this.lastPlugin.postcssPlugin) {
                opts.plugin = this.lastPlugin.postcssPlugin;
            }
        }
        var warning2 = new Warning$1(text, opts);
        this.messages.push(warning2);
        return warning2;
    };
    _proto.warnings = function warnings() {
        return this.messages.filter(function(i) {
            return i.type === "warning";
        });
    };
    _create_class(Result, [
        {
            key: "content",
            get: function get() {
                return this.css;
            }
        }
    ]);
    return Result;
}();
var result = Result$3;
Result$3.default = Result$3;
var SINGLE_QUOTE = "'".charCodeAt(0);
var DOUBLE_QUOTE = '"'.charCodeAt(0);
var BACKSLASH = "\\".charCodeAt(0);
var SLASH = "/".charCodeAt(0);
var NEWLINE = "\n".charCodeAt(0);
var SPACE = " ".charCodeAt(0);
var FEED = "\f".charCodeAt(0);
var TAB = "	".charCodeAt(0);
var CR = "\r".charCodeAt(0);
var OPEN_SQUARE = "[".charCodeAt(0);
var CLOSE_SQUARE = "]".charCodeAt(0);
var OPEN_PARENTHESES = "(".charCodeAt(0);
var CLOSE_PARENTHESES = ")".charCodeAt(0);
var OPEN_CURLY = "{".charCodeAt(0);
var CLOSE_CURLY = "}".charCodeAt(0);
var SEMICOLON = ";".charCodeAt(0);
var ASTERISK = "*".charCodeAt(0);
var COLON = ":".charCodeAt(0);
var AT = "@".charCodeAt(0);
var RE_AT_END = /[\t\n\f\r "#'()/;[\\\]{}]/g;
var RE_WORD_END = /[\t\n\f\r !"#'():;@[\\\]{}]|\/(?=\*)/g;
var RE_BAD_BRACKET = /.[\r\n"'(/\\]/;
var RE_HEX_ESCAPE = /[\da-f]/i;
var tokenize = function tokenizer(input2, options) {
    if (options === void 0) options = {};
    var css = input2.css.valueOf();
    var ignore = options.ignoreErrors;
    var code, next, quote, content, escape;
    var escaped, escapePos, prev, n, currentToken;
    var length = css.length;
    var pos = 0;
    var buffer = [];
    var returned = [];
    function position() {
        return pos;
    }
    function unclosed(what) {
        throw input2.error("Unclosed " + what, pos);
    }
    function endOfFile() {
        return returned.length === 0 && pos >= length;
    }
    function nextToken(opts) {
        if (returned.length) return returned.pop();
        if (pos >= length) return;
        var ignoreUnclosed = opts ? opts.ignoreUnclosed : false;
        code = css.charCodeAt(pos);
        switch(code){
            case NEWLINE:
            case SPACE:
            case TAB:
            case CR:
            case FEED:
                {
                    next = pos;
                    do {
                        next += 1;
                        code = css.charCodeAt(next);
                    }while (code === SPACE || code === NEWLINE || code === TAB || code === CR || code === FEED);
                    currentToken = [
                        "space",
                        css.slice(pos, next)
                    ];
                    pos = next - 1;
                    break;
                }
            case OPEN_SQUARE:
            case CLOSE_SQUARE:
            case OPEN_CURLY:
            case CLOSE_CURLY:
            case COLON:
            case SEMICOLON:
            case CLOSE_PARENTHESES:
                {
                    var controlChar = String.fromCharCode(code);
                    currentToken = [
                        controlChar,
                        controlChar,
                        pos
                    ];
                    break;
                }
            case OPEN_PARENTHESES:
                {
                    prev = buffer.length ? buffer.pop()[1] : "";
                    n = css.charCodeAt(pos + 1);
                    if (prev === "url" && n !== SINGLE_QUOTE && n !== DOUBLE_QUOTE && n !== SPACE && n !== NEWLINE && n !== TAB && n !== FEED && n !== CR) {
                        next = pos;
                        do {
                            escaped = false;
                            next = css.indexOf(")", next + 1);
                            if (next === -1) {
                                if (ignore || ignoreUnclosed) {
                                    next = pos;
                                    break;
                                } else {
                                    unclosed("bracket");
                                }
                            }
                            escapePos = next;
                            while(css.charCodeAt(escapePos - 1) === BACKSLASH){
                                escapePos -= 1;
                                escaped = !escaped;
                            }
                        }while (escaped);
                        currentToken = [
                            "brackets",
                            css.slice(pos, next + 1),
                            pos,
                            next
                        ];
                        pos = next;
                    } else {
                        next = css.indexOf(")", pos + 1);
                        content = css.slice(pos, next + 1);
                        if (next === -1 || RE_BAD_BRACKET.test(content)) {
                            currentToken = [
                                "(",
                                "(",
                                pos
                            ];
                        } else {
                            currentToken = [
                                "brackets",
                                content,
                                pos,
                                next
                            ];
                            pos = next;
                        }
                    }
                    break;
                }
            case SINGLE_QUOTE:
            case DOUBLE_QUOTE:
                {
                    quote = code === SINGLE_QUOTE ? "'" : '"';
                    next = pos;
                    do {
                        escaped = false;
                        next = css.indexOf(quote, next + 1);
                        if (next === -1) {
                            if (ignore || ignoreUnclosed) {
                                next = pos + 1;
                                break;
                            } else {
                                unclosed("string");
                            }
                        }
                        escapePos = next;
                        while(css.charCodeAt(escapePos - 1) === BACKSLASH){
                            escapePos -= 1;
                            escaped = !escaped;
                        }
                    }while (escaped);
                    currentToken = [
                        "string",
                        css.slice(pos, next + 1),
                        pos,
                        next
                    ];
                    pos = next;
                    break;
                }
            case AT:
                {
                    RE_AT_END.lastIndex = pos + 1;
                    RE_AT_END.test(css);
                    if (RE_AT_END.lastIndex === 0) {
                        next = css.length - 1;
                    } else {
                        next = RE_AT_END.lastIndex - 2;
                    }
                    currentToken = [
                        "at-word",
                        css.slice(pos, next + 1),
                        pos,
                        next
                    ];
                    pos = next;
                    break;
                }
            case BACKSLASH:
                {
                    next = pos;
                    escape = true;
                    while(css.charCodeAt(next + 1) === BACKSLASH){
                        next += 1;
                        escape = !escape;
                    }
                    code = css.charCodeAt(next + 1);
                    if (escape && code !== SLASH && code !== SPACE && code !== NEWLINE && code !== TAB && code !== CR && code !== FEED) {
                        next += 1;
                        if (RE_HEX_ESCAPE.test(css.charAt(next))) {
                            while(RE_HEX_ESCAPE.test(css.charAt(next + 1))){
                                next += 1;
                            }
                            if (css.charCodeAt(next + 1) === SPACE) {
                                next += 1;
                            }
                        }
                    }
                    currentToken = [
                        "word",
                        css.slice(pos, next + 1),
                        pos,
                        next
                    ];
                    pos = next;
                    break;
                }
            default:
                {
                    if (code === SLASH && css.charCodeAt(pos + 1) === ASTERISK) {
                        next = css.indexOf("*/", pos + 2) + 1;
                        if (next === 0) {
                            if (ignore || ignoreUnclosed) {
                                next = css.length;
                            } else {
                                unclosed("comment");
                            }
                        }
                        currentToken = [
                            "comment",
                            css.slice(pos, next + 1),
                            pos,
                            next
                        ];
                        pos = next;
                    } else {
                        RE_WORD_END.lastIndex = pos + 1;
                        RE_WORD_END.test(css);
                        if (RE_WORD_END.lastIndex === 0) {
                            next = css.length - 1;
                        } else {
                            next = RE_WORD_END.lastIndex - 2;
                        }
                        currentToken = [
                            "word",
                            css.slice(pos, next + 1),
                            pos,
                            next
                        ];
                        buffer.push(currentToken);
                        pos = next;
                    }
                    break;
                }
        }
        pos++;
        return currentToken;
    }
    function back(token) {
        returned.push(token);
    }
    return {
        back: back,
        endOfFile: endOfFile,
        nextToken: nextToken,
        position: position
    };
};
var Container$5 = container;
var AtRule$3 = /*#__PURE__*/ function(Container$5) {
    _inherits(AtRule, Container$5);
    function AtRule(defaults) {
        var _this;
        _this = Container$5.call(this, defaults) || this;
        _this.type = "atrule";
        return _this;
    }
    var _proto = AtRule.prototype;
    _proto.append = function append() {
        for(var _len = arguments.length, children = new Array(_len), _key = 0; _key < _len; _key++){
            children[_key] = arguments[_key];
        }
        var _Container$5_prototype_append;
        if (!this.proxyOf.nodes) this.nodes = [];
        return (_Container$5_prototype_append = Container$5.prototype.append).call.apply(_Container$5_prototype_append, [].concat([
            this
        ], children));
    };
    _proto.prepend = function prepend() {
        for(var _len = arguments.length, children = new Array(_len), _key = 0; _key < _len; _key++){
            children[_key] = arguments[_key];
        }
        var _Container$5_prototype_prepend;
        if (!this.proxyOf.nodes) this.nodes = [];
        return (_Container$5_prototype_prepend = Container$5.prototype.prepend).call.apply(_Container$5_prototype_prepend, [].concat([
            this
        ], children));
    };
    return AtRule;
}(Container$5);
var atRule = AtRule$3;
AtRule$3.default = AtRule$3;
Container$5.registerAtRule(AtRule$3);
var Container$4 = container;
var LazyResult$3, Processor$2;
var Root$5 = /*#__PURE__*/ function(Container$4) {
    _inherits(Root, Container$4);
    function Root(defaults) {
        var _this;
        _this = Container$4.call(this, defaults) || this;
        _this.type = "root";
        if (!_this.nodes) _this.nodes = [];
        return _this;
    }
    var _proto = Root.prototype;
    _proto.normalize = function normalize(child, sample, type) {
        var nodes = Container$4.prototype.normalize.call(this, child);
        if (sample) {
            if (type === "prepend") {
                if (this.nodes.length > 1) {
                    sample.raws.before = this.nodes[1].raws.before;
                } else {
                    delete sample.raws.before;
                }
            } else if (this.first !== sample) {
                for(var _iterator = _create_for_of_iterator_helper_loose(nodes), _step; !(_step = _iterator()).done;){
                    var node2 = _step.value;
                    node2.raws.before = sample.raws.before;
                }
            }
        }
        return nodes;
    };
    _proto.removeChild = function removeChild(child, ignore) {
        var index2 = this.index(child);
        if (!ignore && index2 === 0 && this.nodes.length > 1) {
            this.nodes[1].raws.before = this.nodes[index2].raws.before;
        }
        return Container$4.prototype.removeChild.call(this, child);
    };
    _proto.toResult = function toResult(opts) {
        if (opts === void 0) opts = {};
        var lazy = new LazyResult$3(new Processor$2(), this, opts);
        return lazy.stringify();
    };
    return Root;
}(Container$4);
Root$5.registerLazyResult = function(dependant) {
    LazyResult$3 = dependant;
};
Root$5.registerProcessor = function(dependant) {
    Processor$2 = dependant;
};
var root = Root$5;
Root$5.default = Root$5;
Container$4.registerRoot(Root$5);
var list$2 = {
    comma: function comma(string) {
        return list$2.split(string, [
            ","
        ], true);
    },
    space: function space(string) {
        var spaces = [
            " ",
            "\n",
            "	"
        ];
        return list$2.split(string, spaces);
    },
    split: function split(string, separators, last) {
        var array = [];
        var current = "";
        var split = false;
        var func = 0;
        var inQuote = false;
        var prevQuote = "";
        var escape = false;
        for(var _iterator = _create_for_of_iterator_helper_loose(string), _step; !(_step = _iterator()).done;){
            var letter = _step.value;
            if (escape) {
                escape = false;
            } else if (letter === "\\") {
                escape = true;
            } else if (inQuote) {
                if (letter === prevQuote) {
                    inQuote = false;
                }
            } else if (letter === '"' || letter === "'") {
                inQuote = true;
                prevQuote = letter;
            } else if (letter === "(") {
                func += 1;
            } else if (letter === ")") {
                if (func > 0) func -= 1;
            } else if (func === 0) {
                if (separators.includes(letter)) split = true;
            }
            if (split) {
                if (current !== "") array.push(current.trim());
                current = "";
                split = false;
            } else {
                current += letter;
            }
        }
        if (last || current !== "") array.push(current.trim());
        return array;
    }
};
var list_1 = list$2;
list$2.default = list$2;
var Container$3 = container;
var list$1 = list_1;
var Rule$3 = /*#__PURE__*/ function(Container$3) {
    _inherits(Rule, Container$3);
    function Rule(defaults) {
        var _this;
        _this = Container$3.call(this, defaults) || this;
        _this.type = "rule";
        if (!_this.nodes) _this.nodes = [];
        return _this;
    }
    _create_class(Rule, [
        {
            key: "selectors",
            get: function get() {
                return list$1.comma(this.selector);
            },
            set: function set(values) {
                var match = this.selector ? this.selector.match(/,\s*/) : null;
                var sep2 = match ? match[0] : "," + this.raw("between", "beforeOpen");
                this.selector = values.join(sep2);
            }
        }
    ]);
    return Rule;
}(Container$3);
var rule = Rule$3;
Rule$3.default = Rule$3;
Container$3.registerRule(Rule$3);
var Declaration$2 = declaration;
var tokenizer2 = tokenize;
var Comment$2 = comment;
var AtRule$2 = atRule;
var Root$4 = root;
var Rule$2 = rule;
var SAFE_COMMENT_NEIGHBOR = {
    empty: true,
    space: true
};
function findLastWithPosition(tokens) {
    for(var i = tokens.length - 1; i >= 0; i--){
        var token = tokens[i];
        var pos = token[3] || token[2];
        if (pos) return pos;
    }
}
var Parser$1 = /*#__PURE__*/ function() {
    function Parser(input2) {
        this.input = input2;
        this.root = new Root$4();
        this.current = this.root;
        this.spaces = "";
        this.semicolon = false;
        this.createTokenizer();
        this.root.source = {
            input: input2,
            start: {
                column: 1,
                line: 1,
                offset: 0
            }
        };
    }
    var _proto = Parser.prototype;
    _proto.atrule = function atrule(token) {
        var node2 = new AtRule$2();
        node2.name = token[1].slice(1);
        if (node2.name === "") {
            this.unnamedAtrule(node2, token);
        }
        this.init(node2, token[2]);
        var type;
        var prev;
        var shift;
        var last = false;
        var open = false;
        var params = [];
        var brackets = [];
        while(!this.tokenizer.endOfFile()){
            token = this.tokenizer.nextToken();
            type = token[0];
            if (type === "(" || type === "[") {
                brackets.push(type === "(" ? ")" : "]");
            } else if (type === "{" && brackets.length > 0) {
                brackets.push("}");
            } else if (type === brackets[brackets.length - 1]) {
                brackets.pop();
            }
            if (brackets.length === 0) {
                if (type === ";") {
                    node2.source.end = this.getPosition(token[2]);
                    node2.source.end.offset++;
                    this.semicolon = true;
                    break;
                } else if (type === "{") {
                    open = true;
                    break;
                } else if (type === "}") {
                    if (params.length > 0) {
                        shift = params.length - 1;
                        prev = params[shift];
                        while(prev && prev[0] === "space"){
                            prev = params[--shift];
                        }
                        if (prev) {
                            node2.source.end = this.getPosition(prev[3] || prev[2]);
                            node2.source.end.offset++;
                        }
                    }
                    this.end(token);
                    break;
                } else {
                    params.push(token);
                }
            } else {
                params.push(token);
            }
            if (this.tokenizer.endOfFile()) {
                last = true;
                break;
            }
        }
        node2.raws.between = this.spacesAndCommentsFromEnd(params);
        if (params.length) {
            node2.raws.afterName = this.spacesAndCommentsFromStart(params);
            this.raw(node2, "params", params);
            if (last) {
                token = params[params.length - 1];
                node2.source.end = this.getPosition(token[3] || token[2]);
                node2.source.end.offset++;
                this.spaces = node2.raws.between;
                node2.raws.between = "";
            }
        } else {
            node2.raws.afterName = "";
            node2.params = "";
        }
        if (open) {
            node2.nodes = [];
            this.current = node2;
        }
    };
    _proto.checkMissedSemicolon = function checkMissedSemicolon(tokens) {
        var colon = this.colon(tokens);
        if (colon === false) return;
        var founded = 0;
        var token;
        for(var j = colon - 1; j >= 0; j--){
            token = tokens[j];
            if (token[0] !== "space") {
                founded += 1;
                if (founded === 2) break;
            }
        }
        throw this.input.error("Missed semicolon", token[0] === "word" ? token[3] + 1 : token[2]);
    };
    _proto.colon = function colon(tokens) {
        var brackets = 0;
        var token, type, prev;
        for(var _iterator = _create_for_of_iterator_helper_loose(tokens.entries()), _step; !(_step = _iterator()).done;){
            var _step_value = _step.value, i = _step_value[0], element = _step_value[1];
            token = element;
            type = token[0];
            if (type === "(") {
                brackets += 1;
            }
            if (type === ")") {
                brackets -= 1;
            }
            if (brackets === 0 && type === ":") {
                if (!prev) {
                    this.doubleColon(token);
                } else if (prev[0] === "word" && prev[1] === "progid") {
                    continue;
                } else {
                    return i;
                }
            }
            prev = token;
        }
        return false;
    };
    _proto.comment = function comment(token) {
        var node2 = new Comment$2();
        this.init(node2, token[2]);
        node2.source.end = this.getPosition(token[3] || token[2]);
        node2.source.end.offset++;
        var text = token[1].slice(2, -2);
        if (/^\s*$/.test(text)) {
            node2.text = "";
            node2.raws.left = text;
            node2.raws.right = "";
        } else {
            var match = text.match(/^(\s*)([^]*\S)(\s*)$/);
            node2.text = match[2];
            node2.raws.left = match[1];
            node2.raws.right = match[3];
        }
    };
    _proto.createTokenizer = function createTokenizer() {
        this.tokenizer = tokenizer2(this.input);
    };
    _proto.decl = function decl(tokens, customProperty) {
        var node2 = new Declaration$2();
        this.init(node2, tokens[0][2]);
        var last = tokens[tokens.length - 1];
        if (last[0] === ";") {
            this.semicolon = true;
            tokens.pop();
        }
        node2.source.end = this.getPosition(last[3] || last[2] || findLastWithPosition(tokens));
        node2.source.end.offset++;
        while(tokens[0][0] !== "word"){
            if (tokens.length === 1) this.unknownWord(tokens);
            node2.raws.before += tokens.shift()[1];
        }
        node2.source.start = this.getPosition(tokens[0][2]);
        node2.prop = "";
        while(tokens.length){
            var type = tokens[0][0];
            if (type === ":" || type === "space" || type === "comment") {
                break;
            }
            node2.prop += tokens.shift()[1];
        }
        node2.raws.between = "";
        var token;
        while(tokens.length){
            token = tokens.shift();
            if (token[0] === ":") {
                node2.raws.between += token[1];
                break;
            } else {
                if (token[0] === "word" && /\w/.test(token[1])) {
                    this.unknownWord([
                        token
                    ]);
                }
                node2.raws.between += token[1];
            }
        }
        if (node2.prop[0] === "_" || node2.prop[0] === "*") {
            node2.raws.before += node2.prop[0];
            node2.prop = node2.prop.slice(1);
        }
        var firstSpaces = [];
        var next;
        while(tokens.length){
            next = tokens[0][0];
            if (next !== "space" && next !== "comment") break;
            firstSpaces.push(tokens.shift());
        }
        this.precheckMissedSemicolon(tokens);
        for(var i = tokens.length - 1; i >= 0; i--){
            token = tokens[i];
            if (token[1].toLowerCase() === "!important") {
                node2.important = true;
                var string = this.stringFrom(tokens, i);
                string = this.spacesFromEnd(tokens) + string;
                if (string !== " !important") node2.raws.important = string;
                break;
            } else if (token[1].toLowerCase() === "important") {
                var cache = tokens.slice(0);
                var str = "";
                for(var j = i; j > 0; j--){
                    var type1 = cache[j][0];
                    if (str.trim().indexOf("!") === 0 && type1 !== "space") {
                        break;
                    }
                    str = cache.pop()[1] + str;
                }
                if (str.trim().indexOf("!") === 0) {
                    node2.important = true;
                    node2.raws.important = str;
                    tokens = cache;
                }
            }
            if (token[0] !== "space" && token[0] !== "comment") {
                break;
            }
        }
        var hasWord = tokens.some(function(i) {
            return i[0] !== "space" && i[0] !== "comment";
        });
        if (hasWord) {
            node2.raws.between += firstSpaces.map(function(i) {
                return i[1];
            }).join("");
            firstSpaces = [];
        }
        this.raw(node2, "value", firstSpaces.concat(tokens), customProperty);
        if (node2.value.includes(":") && !customProperty) {
            this.checkMissedSemicolon(tokens);
        }
    };
    _proto.doubleColon = function doubleColon(token) {
        throw this.input.error("Double colon", {
            offset: token[2]
        }, {
            offset: token[2] + token[1].length
        });
    };
    _proto.emptyRule = function emptyRule(token) {
        var node2 = new Rule$2();
        this.init(node2, token[2]);
        node2.selector = "";
        node2.raws.between = "";
        this.current = node2;
    };
    _proto.end = function end(token) {
        if (this.current.nodes && this.current.nodes.length) {
            this.current.raws.semicolon = this.semicolon;
        }
        this.semicolon = false;
        this.current.raws.after = (this.current.raws.after || "") + this.spaces;
        this.spaces = "";
        if (this.current.parent) {
            this.current.source.end = this.getPosition(token[2]);
            this.current.source.end.offset++;
            this.current = this.current.parent;
        } else {
            this.unexpectedClose(token);
        }
    };
    _proto.endFile = function endFile() {
        if (this.current.parent) this.unclosedBlock();
        if (this.current.nodes && this.current.nodes.length) {
            this.current.raws.semicolon = this.semicolon;
        }
        this.current.raws.after = (this.current.raws.after || "") + this.spaces;
        this.root.source.end = this.getPosition(this.tokenizer.position());
    };
    _proto.freeSemicolon = function freeSemicolon(token) {
        this.spaces += token[1];
        if (this.current.nodes) {
            var prev = this.current.nodes[this.current.nodes.length - 1];
            if (prev && prev.type === "rule" && !prev.raws.ownSemicolon) {
                prev.raws.ownSemicolon = this.spaces;
                this.spaces = "";
            }
        }
    };
    // Helpers
    _proto.getPosition = function getPosition(offset) {
        var pos = this.input.fromOffset(offset);
        return {
            column: pos.col,
            line: pos.line,
            offset: offset
        };
    };
    _proto.init = function init(node2, offset) {
        this.current.push(node2);
        node2.source = {
            input: this.input,
            start: this.getPosition(offset)
        };
        node2.raws.before = this.spaces;
        this.spaces = "";
        if (node2.type !== "comment") this.semicolon = false;
    };
    _proto.other = function other(start) {
        var end = false;
        var type = null;
        var colon = false;
        var bracket = null;
        var brackets = [];
        var customProperty = start[1].startsWith("--");
        var tokens = [];
        var token = start;
        while(token){
            type = token[0];
            tokens.push(token);
            if (type === "(" || type === "[") {
                if (!bracket) bracket = token;
                brackets.push(type === "(" ? ")" : "]");
            } else if (customProperty && colon && type === "{") {
                if (!bracket) bracket = token;
                brackets.push("}");
            } else if (brackets.length === 0) {
                if (type === ";") {
                    if (colon) {
                        this.decl(tokens, customProperty);
                        return;
                    } else {
                        break;
                    }
                } else if (type === "{") {
                    this.rule(tokens);
                    return;
                } else if (type === "}") {
                    this.tokenizer.back(tokens.pop());
                    end = true;
                    break;
                } else if (type === ":") {
                    colon = true;
                }
            } else if (type === brackets[brackets.length - 1]) {
                brackets.pop();
                if (brackets.length === 0) bracket = null;
            }
            token = this.tokenizer.nextToken();
        }
        if (this.tokenizer.endOfFile()) end = true;
        if (brackets.length > 0) this.unclosedBracket(bracket);
        if (end && colon) {
            if (!customProperty) {
                while(tokens.length){
                    token = tokens[tokens.length - 1][0];
                    if (token !== "space" && token !== "comment") break;
                    this.tokenizer.back(tokens.pop());
                }
            }
            this.decl(tokens, customProperty);
        } else {
            this.unknownWord(tokens);
        }
    };
    _proto.parse = function parse() {
        var token;
        while(!this.tokenizer.endOfFile()){
            token = this.tokenizer.nextToken();
            switch(token[0]){
                case "space":
                    this.spaces += token[1];
                    break;
                case ";":
                    this.freeSemicolon(token);
                    break;
                case "}":
                    this.end(token);
                    break;
                case "comment":
                    this.comment(token);
                    break;
                case "at-word":
                    this.atrule(token);
                    break;
                case "{":
                    this.emptyRule(token);
                    break;
                default:
                    this.other(token);
                    break;
            }
        }
        this.endFile();
    };
    _proto.precheckMissedSemicolon = function precheckMissedSemicolon() {};
    _proto.raw = function raw(node2, prop, tokens, customProperty) {
        var token, type;
        var length = tokens.length;
        var value = "";
        var clean = true;
        var next, prev;
        for(var i = 0; i < length; i += 1){
            token = tokens[i];
            type = token[0];
            if (type === "space" && i === length - 1 && !customProperty) {
                clean = false;
            } else if (type === "comment") {
                prev = tokens[i - 1] ? tokens[i - 1][0] : "empty";
                next = tokens[i + 1] ? tokens[i + 1][0] : "empty";
                if (!SAFE_COMMENT_NEIGHBOR[prev] && !SAFE_COMMENT_NEIGHBOR[next]) {
                    if (value.slice(-1) === ",") {
                        clean = false;
                    } else {
                        value += token[1];
                    }
                } else {
                    clean = false;
                }
            } else {
                value += token[1];
            }
        }
        if (!clean) {
            var raw = tokens.reduce(function(all, i) {
                return all + i[1];
            }, "");
            node2.raws[prop] = {
                raw: raw,
                value: value
            };
        }
        node2[prop] = value;
    };
    _proto.rule = function rule(tokens) {
        tokens.pop();
        var node2 = new Rule$2();
        this.init(node2, tokens[0][2]);
        node2.raws.between = this.spacesAndCommentsFromEnd(tokens);
        this.raw(node2, "selector", tokens);
        this.current = node2;
    };
    _proto.spacesAndCommentsFromEnd = function spacesAndCommentsFromEnd(tokens) {
        var lastTokenType;
        var spaces = "";
        while(tokens.length){
            lastTokenType = tokens[tokens.length - 1][0];
            if (lastTokenType !== "space" && lastTokenType !== "comment") break;
            spaces = tokens.pop()[1] + spaces;
        }
        return spaces;
    };
    // Errors
    _proto.spacesAndCommentsFromStart = function spacesAndCommentsFromStart(tokens) {
        var next;
        var spaces = "";
        while(tokens.length){
            next = tokens[0][0];
            if (next !== "space" && next !== "comment") break;
            spaces += tokens.shift()[1];
        }
        return spaces;
    };
    _proto.spacesFromEnd = function spacesFromEnd(tokens) {
        var lastTokenType;
        var spaces = "";
        while(tokens.length){
            lastTokenType = tokens[tokens.length - 1][0];
            if (lastTokenType !== "space") break;
            spaces = tokens.pop()[1] + spaces;
        }
        return spaces;
    };
    _proto.stringFrom = function stringFrom(tokens, from) {
        var result2 = "";
        for(var i = from; i < tokens.length; i++){
            result2 += tokens[i][1];
        }
        tokens.splice(from, tokens.length - from);
        return result2;
    };
    _proto.unclosedBlock = function unclosedBlock() {
        var pos = this.current.source.start;
        throw this.input.error("Unclosed block", pos.line, pos.column);
    };
    _proto.unclosedBracket = function unclosedBracket(bracket) {
        throw this.input.error("Unclosed bracket", {
            offset: bracket[2]
        }, {
            offset: bracket[2] + 1
        });
    };
    _proto.unexpectedClose = function unexpectedClose(token) {
        throw this.input.error("Unexpected }", {
            offset: token[2]
        }, {
            offset: token[2] + 1
        });
    };
    _proto.unknownWord = function unknownWord(tokens) {
        throw this.input.error("Unknown word", {
            offset: tokens[0][2]
        }, {
            offset: tokens[0][2] + tokens[0][1].length
        });
    };
    _proto.unnamedAtrule = function unnamedAtrule(node2, token) {
        throw this.input.error("At-rule without name", {
            offset: token[2]
        }, {
            offset: token[2] + token[1].length
        });
    };
    return Parser;
}();
var parser = Parser$1;
var Container$2 = container;
var Parser2 = parser;
var Input$2 = input;
function parse$3(css, opts) {
    var input2 = new Input$2(css, opts);
    var parser2 = new Parser2(input2);
    try {
        parser2.parse();
    } catch (e) {
        if (process.env.NODE_ENV !== "production") {
            if (e.name === "CssSyntaxError" && opts && opts.from) {
                if (/\.scss$/i.test(opts.from)) {
                    e.message += "\nYou tried to parse SCSS with the standard CSS parser; try again with the postcss-scss parser";
                } else if (/\.sass/i.test(opts.from)) {
                    e.message += "\nYou tried to parse Sass with the standard CSS parser; try again with the postcss-sass parser";
                } else if (/\.less$/i.test(opts.from)) {
                    e.message += "\nYou tried to parse Less with the standard CSS parser; try again with the postcss-less parser";
                }
            }
        }
        throw e;
    }
    return parser2.root;
}
var parse_1 = parse$3;
parse$3.default = parse$3;
Container$2.registerParse(parse$3);
var isClean = symbols.isClean, my = symbols.my;
var MapGenerator$1 = mapGenerator;
var stringify$2 = stringify_1;
var Container$1 = container;
var Document$2 = document$1;
var warnOnce$1 = warnOnce$2;
var Result$2 = result;
var parse$2 = parse_1;
var Root$3 = root;
var TYPE_TO_CLASS_NAME = {
    atrule: "AtRule",
    comment: "Comment",
    decl: "Declaration",
    document: "Document",
    root: "Root",
    rule: "Rule"
};
var PLUGIN_PROPS = {
    AtRule: true,
    AtRuleExit: true,
    Comment: true,
    CommentExit: true,
    Declaration: true,
    DeclarationExit: true,
    Document: true,
    DocumentExit: true,
    Once: true,
    OnceExit: true,
    postcssPlugin: true,
    prepare: true,
    Root: true,
    RootExit: true,
    Rule: true,
    RuleExit: true
};
var NOT_VISITORS = {
    Once: true,
    postcssPlugin: true,
    prepare: true
};
var CHILDREN = 0;
function isPromise(obj) {
    return (typeof obj === "undefined" ? "undefined" : _type_of(obj)) === "object" && typeof obj.then === "function";
}
function getEvents(node2) {
    var key = false;
    var type = TYPE_TO_CLASS_NAME[node2.type];
    if (node2.type === "decl") {
        key = node2.prop.toLowerCase();
    } else if (node2.type === "atrule") {
        key = node2.name.toLowerCase();
    }
    if (key && node2.append) {
        return [
            type,
            type + "-" + key,
            CHILDREN,
            type + "Exit",
            type + "Exit-" + key
        ];
    } else if (key) {
        return [
            type,
            type + "-" + key,
            type + "Exit",
            type + "Exit-" + key
        ];
    } else if (node2.append) {
        return [
            type,
            CHILDREN,
            type + "Exit"
        ];
    } else {
        return [
            type,
            type + "Exit"
        ];
    }
}
function toStack(node2) {
    var events;
    if (node2.type === "document") {
        events = [
            "Document",
            CHILDREN,
            "DocumentExit"
        ];
    } else if (node2.type === "root") {
        events = [
            "Root",
            CHILDREN,
            "RootExit"
        ];
    } else {
        events = getEvents(node2);
    }
    return {
        eventIndex: 0,
        events: events,
        iterator: 0,
        node: node2,
        visitorIndex: 0,
        visitors: []
    };
}
function cleanMarks(node2) {
    node2[isClean] = false;
    if (node2.nodes) node2.nodes.forEach(function(i) {
        return cleanMarks(i);
    });
    return node2;
}
var postcss$2 = {};
var LazyResult$2 = /*#__PURE__*/ function() {
    function LazyResult(processor2, css, opts) {
        var _this = this;
        this.stringified = false;
        this.processed = false;
        var root2;
        if ((typeof css === "undefined" ? "undefined" : _type_of(css)) === "object" && css !== null && (css.type === "root" || css.type === "document")) {
            root2 = cleanMarks(css);
        } else if (_instanceof(css, LazyResult) || _instanceof(css, Result$2)) {
            root2 = cleanMarks(css.root);
            if (css.map) {
                if (typeof opts.map === "undefined") opts.map = {};
                if (!opts.map.inline) opts.map.inline = false;
                opts.map.prev = css.map;
            }
        } else {
            var parser2 = parse$2;
            if (opts.syntax) parser2 = opts.syntax.parse;
            if (opts.parser) parser2 = opts.parser;
            if (parser2.parse) parser2 = parser2.parse;
            try {
                root2 = parser2(css, opts);
            } catch (error) {
                this.processed = true;
                this.error = error;
            }
            if (root2 && !root2[my]) {
                Container$1.rebuild(root2);
            }
        }
        this.result = new Result$2(processor2, root2, opts);
        this.helpers = _extends({}, postcss$2, {
            postcss: postcss$2,
            result: this.result
        });
        this.plugins = this.processor.plugins.map(function(plugin2) {
            if ((typeof plugin2 === "undefined" ? "undefined" : _type_of(plugin2)) === "object" && plugin2.prepare) {
                return _extends({}, plugin2, plugin2.prepare(_this.result));
            } else {
                return plugin2;
            }
        });
    }
    var _proto = LazyResult.prototype;
    _proto.async = function async() {
        if (this.error) return Promise.reject(this.error);
        if (this.processed) return Promise.resolve(this.result);
        if (!this.processing) {
            this.processing = this.runAsync();
        }
        return this.processing;
    };
    _proto.catch = function _catch(onRejected) {
        return this.async().catch(onRejected);
    };
    _proto.finally = function _finally(onFinally) {
        return this.async().then(onFinally, onFinally);
    };
    _proto.getAsyncError = function getAsyncError() {
        throw new Error("Use process(css).then(cb) to work with async plugins");
    };
    _proto.handleError = function handleError(error, node2) {
        var plugin2 = this.result.lastPlugin;
        try {
            if (node2) node2.addToError(error);
            this.error = error;
            if (error.name === "CssSyntaxError" && !error.plugin) {
                error.plugin = plugin2.postcssPlugin;
                error.setMessage();
            } else if (plugin2.postcssVersion) {
                if (process.env.NODE_ENV !== "production") {
                    var pluginName = plugin2.postcssPlugin;
                    var pluginVer = plugin2.postcssVersion;
                    var runtimeVer = this.result.processor.version;
                    var a = pluginVer.split(".");
                    var b = runtimeVer.split(".");
                    if (a[0] !== b[0] || parseInt(a[1]) > parseInt(b[1])) {
                        console.error("Unknown error from PostCSS plugin. Your current PostCSS version is " + runtimeVer + ", but " + pluginName + " uses " + pluginVer + ". Perhaps this is the source of the error below.");
                    }
                }
            }
        } catch (err) {
            if (console && console.error) console.error(err);
        }
        return error;
    };
    _proto.prepareVisitors = function prepareVisitors() {
        var _this = this;
        this.listeners = {};
        var add = function(plugin2, type, cb) {
            if (!_this.listeners[type]) _this.listeners[type] = [];
            _this.listeners[type].push([
                plugin2,
                cb
            ]);
        };
        for(var _iterator = _create_for_of_iterator_helper_loose(this.plugins), _step; !(_step = _iterator()).done;){
            var plugin2 = _step.value;
            if ((typeof plugin2 === "undefined" ? "undefined" : _type_of(plugin2)) === "object") {
                for(var event in plugin2){
                    if (!PLUGIN_PROPS[event] && /^[A-Z]/.test(event)) {
                        throw new Error("Unknown event " + event + " in " + plugin2.postcssPlugin + ". Try to update PostCSS (" + this.processor.version + " now).");
                    }
                    if (!NOT_VISITORS[event]) {
                        if (_type_of(plugin2[event]) === "object") {
                            for(var filter in plugin2[event]){
                                if (filter === "*") {
                                    add(plugin2, event, plugin2[event][filter]);
                                } else {
                                    add(plugin2, event + "-" + filter.toLowerCase(), plugin2[event][filter]);
                                }
                            }
                        } else if (typeof plugin2[event] === "function") {
                            add(plugin2, event, plugin2[event]);
                        }
                    }
                }
            }
        }
        this.hasListener = Object.keys(this.listeners).length > 0;
    };
    _proto.runAsync = function runAsync() {
        var _this = this;
        return _async_to_generator(function() {
            var i, plugin2, promise, error, root2, stack, promise1, e, node2, _loop, _iterator, _step;
            return _ts_generator(this, function(_state) {
                switch(_state.label){
                    case 0:
                        _this.plugin = 0;
                        i = 0;
                        _state.label = 1;
                    case 1:
                        if (!(i < _this.plugins.length)) return [
                            3,
                            6
                        ];
                        plugin2 = _this.plugins[i];
                        promise = _this.runOnRoot(plugin2);
                        if (!isPromise(promise)) return [
                            3,
                            5
                        ];
                        _state.label = 2;
                    case 2:
                        _state.trys.push([
                            2,
                            4,
                            ,
                            5
                        ]);
                        return [
                            4,
                            promise
                        ];
                    case 3:
                        _state.sent();
                        return [
                            3,
                            5
                        ];
                    case 4:
                        error = _state.sent();
                        throw _this.handleError(error);
                    case 5:
                        i++;
                        return [
                            3,
                            1
                        ];
                    case 6:
                        _this.prepareVisitors();
                        if (!_this.hasListener) return [
                            3,
                            18
                        ];
                        root2 = _this.result.root;
                        _state.label = 7;
                    case 7:
                        if (!!root2[isClean]) return [
                            3,
                            14
                        ];
                        root2[isClean] = true;
                        stack = [
                            toStack(root2)
                        ];
                        _state.label = 8;
                    case 8:
                        if (!(stack.length > 0)) return [
                            3,
                            13
                        ];
                        promise1 = _this.visitTick(stack);
                        if (!isPromise(promise1)) return [
                            3,
                            12
                        ];
                        _state.label = 9;
                    case 9:
                        _state.trys.push([
                            9,
                            11,
                            ,
                            12
                        ]);
                        return [
                            4,
                            promise1
                        ];
                    case 10:
                        _state.sent();
                        return [
                            3,
                            12
                        ];
                    case 11:
                        e = _state.sent();
                        node2 = stack[stack.length - 1].node;
                        throw _this.handleError(e, node2);
                    case 12:
                        return [
                            3,
                            8
                        ];
                    case 13:
                        return [
                            3,
                            7
                        ];
                    case 14:
                        if (!_this.listeners.OnceExit) return [
                            3,
                            18
                        ];
                        _loop = function() {
                            var _step_value, plugin2, visitor, roots, e;
                            return _ts_generator(this, function(_state) {
                                switch(_state.label){
                                    case 0:
                                        _step_value = _step.value, plugin2 = _step_value[0], visitor = _step_value[1];
                                        _this.result.lastPlugin = plugin2;
                                        _state.label = 1;
                                    case 1:
                                        _state.trys.push([
                                            1,
                                            6,
                                            ,
                                            7
                                        ]);
                                        if (!(root2.type === "document")) return [
                                            3,
                                            3
                                        ];
                                        roots = root2.nodes.map(function(subRoot) {
                                            return visitor(subRoot, _this.helpers);
                                        });
                                        return [
                                            4,
                                            Promise.all(roots)
                                        ];
                                    case 2:
                                        _state.sent();
                                        return [
                                            3,
                                            5
                                        ];
                                    case 3:
                                        return [
                                            4,
                                            visitor(root2, _this.helpers)
                                        ];
                                    case 4:
                                        _state.sent();
                                        _state.label = 5;
                                    case 5:
                                        return [
                                            3,
                                            7
                                        ];
                                    case 6:
                                        e = _state.sent();
                                        throw _this.handleError(e);
                                    case 7:
                                        return [
                                            2
                                        ];
                                }
                            });
                        };
                        _iterator = _create_for_of_iterator_helper_loose(_this.listeners.OnceExit);
                        _state.label = 15;
                    case 15:
                        if (!!(_step = _iterator()).done) return [
                            3,
                            18
                        ];
                        return [
                            5,
                            _ts_values(_loop())
                        ];
                    case 16:
                        _state.sent();
                        _state.label = 17;
                    case 17:
                        return [
                            3,
                            15
                        ];
                    case 18:
                        _this.processed = true;
                        return [
                            2,
                            _this.stringify()
                        ];
                }
            });
        })();
    };
    _proto.runOnRoot = function runOnRoot(plugin2) {
        var _this = this;
        this.result.lastPlugin = plugin2;
        try {
            if ((typeof plugin2 === "undefined" ? "undefined" : _type_of(plugin2)) === "object" && plugin2.Once) {
                if (this.result.root.type === "document") {
                    var roots = this.result.root.nodes.map(function(root2) {
                        return plugin2.Once(root2, _this.helpers);
                    });
                    if (isPromise(roots[0])) {
                        return Promise.all(roots);
                    }
                    return roots;
                }
                return plugin2.Once(this.result.root, this.helpers);
            } else if (typeof plugin2 === "function") {
                return plugin2(this.result.root, this.result);
            }
        } catch (error) {
            throw this.handleError(error);
        }
    };
    _proto.stringify = function stringify() {
        if (this.error) throw this.error;
        if (this.stringified) return this.result;
        this.stringified = true;
        this.sync();
        var opts = this.result.opts;
        var str = stringify$2;
        if (opts.syntax) str = opts.syntax.stringify;
        if (opts.stringifier) str = opts.stringifier;
        if (str.stringify) str = str.stringify;
        var map = new MapGenerator$1(str, this.result.root, this.result.opts);
        var data = map.generate();
        this.result.css = data[0];
        this.result.map = data[1];
        return this.result;
    };
    _proto.sync = function sync() {
        if (this.error) throw this.error;
        if (this.processed) return this.result;
        this.processed = true;
        if (this.processing) {
            throw this.getAsyncError();
        }
        for(var _iterator = _create_for_of_iterator_helper_loose(this.plugins), _step; !(_step = _iterator()).done;){
            var plugin2 = _step.value;
            var promise = this.runOnRoot(plugin2);
            if (isPromise(promise)) {
                throw this.getAsyncError();
            }
        }
        this.prepareVisitors();
        if (this.hasListener) {
            var root2 = this.result.root;
            while(!root2[isClean]){
                root2[isClean] = true;
                this.walkSync(root2);
            }
            if (this.listeners.OnceExit) {
                if (root2.type === "document") {
                    for(var _iterator1 = _create_for_of_iterator_helper_loose(root2.nodes), _step1; !(_step1 = _iterator1()).done;){
                        var subRoot = _step1.value;
                        this.visitSync(this.listeners.OnceExit, subRoot);
                    }
                } else {
                    this.visitSync(this.listeners.OnceExit, root2);
                }
            }
        }
        return this.result;
    };
    _proto.then = function then(onFulfilled, onRejected) {
        if (process.env.NODE_ENV !== "production") {
            if (!("from" in this.opts)) {
                warnOnce$1("Without `from` option PostCSS could generate wrong source map and will not find Browserslist config. Set it to CSS file path or to `undefined` to prevent this warning.");
            }
        }
        return this.async().then(onFulfilled, onRejected);
    };
    _proto.toString = function toString() {
        return this.css;
    };
    _proto.visitSync = function visitSync(visitors, node2) {
        for(var _iterator = _create_for_of_iterator_helper_loose(visitors), _step; !(_step = _iterator()).done;){
            var _step_value = _step.value, plugin2 = _step_value[0], visitor = _step_value[1];
            this.result.lastPlugin = plugin2;
            var promise = void 0;
            try {
                promise = visitor(node2, this.helpers);
            } catch (e) {
                throw this.handleError(e, node2.proxyOf);
            }
            if (node2.type !== "root" && node2.type !== "document" && !node2.parent) {
                return true;
            }
            if (isPromise(promise)) {
                throw this.getAsyncError();
            }
        }
    };
    _proto.visitTick = function visitTick(stack) {
        var visit2 = stack[stack.length - 1];
        var node2 = visit2.node, visitors = visit2.visitors;
        if (node2.type !== "root" && node2.type !== "document" && !node2.parent) {
            stack.pop();
            return;
        }
        if (visitors.length > 0 && visit2.visitorIndex < visitors.length) {
            var _visitors_visit2_visitorIndex = visitors[visit2.visitorIndex], plugin2 = _visitors_visit2_visitorIndex[0], visitor = _visitors_visit2_visitorIndex[1];
            visit2.visitorIndex += 1;
            if (visit2.visitorIndex === visitors.length) {
                visit2.visitors = [];
                visit2.visitorIndex = 0;
            }
            this.result.lastPlugin = plugin2;
            try {
                return visitor(node2.toProxy(), this.helpers);
            } catch (e) {
                throw this.handleError(e, node2);
            }
        }
        if (visit2.iterator !== 0) {
            var iterator = visit2.iterator;
            var child;
            while(child = node2.nodes[node2.indexes[iterator]]){
                node2.indexes[iterator] += 1;
                if (!child[isClean]) {
                    child[isClean] = true;
                    stack.push(toStack(child));
                    return;
                }
            }
            visit2.iterator = 0;
            delete node2.indexes[iterator];
        }
        var events = visit2.events;
        while(visit2.eventIndex < events.length){
            var event = events[visit2.eventIndex];
            visit2.eventIndex += 1;
            if (event === CHILDREN) {
                if (node2.nodes && node2.nodes.length) {
                    node2[isClean] = true;
                    visit2.iterator = node2.getIterator();
                }
                return;
            } else if (this.listeners[event]) {
                visit2.visitors = this.listeners[event];
                return;
            }
        }
        stack.pop();
    };
    _proto.walkSync = function walkSync(node2) {
        var _this = this;
        node2[isClean] = true;
        var events = getEvents(node2);
        for(var _iterator = _create_for_of_iterator_helper_loose(events), _step; !(_step = _iterator()).done;){
            var event = _step.value;
            if (event === CHILDREN) {
                if (node2.nodes) {
                    node2.each(function(child) {
                        if (!child[isClean]) _this.walkSync(child);
                    });
                }
            } else {
                var visitors = this.listeners[event];
                if (visitors) {
                    if (this.visitSync(visitors, node2.toProxy())) return;
                }
            }
        }
    };
    _proto.warnings = function warnings() {
        return this.sync().warnings();
    };
    _create_class(LazyResult, [
        {
            key: "content",
            get: function get() {
                return this.stringify().content;
            }
        },
        {
            key: "css",
            get: function get() {
                return this.stringify().css;
            }
        },
        {
            key: "map",
            get: function get() {
                return this.stringify().map;
            }
        },
        {
            key: "messages",
            get: function get() {
                return this.sync().messages;
            }
        },
        {
            key: "opts",
            get: function get() {
                return this.result.opts;
            }
        },
        {
            key: "processor",
            get: function get() {
                return this.result.processor;
            }
        },
        {
            key: "root",
            get: function get() {
                return this.sync().root;
            }
        },
        {
            key: Symbol.toStringTag,
            get: function get() {
                return "LazyResult";
            }
        }
    ]);
    return LazyResult;
}();
LazyResult$2.registerPostcss = function(dependant) {
    postcss$2 = dependant;
};
var lazyResult = LazyResult$2;
LazyResult$2.default = LazyResult$2;
Root$3.registerLazyResult(LazyResult$2);
Document$2.registerLazyResult(LazyResult$2);
var MapGenerator2 = mapGenerator;
var stringify$1 = stringify_1;
var warnOnce2 = warnOnce$2;
var parse$1 = parse_1;
var Result$1 = result;
var NoWorkResult$1 = /*#__PURE__*/ function() {
    function NoWorkResult(processor2, css, opts) {
        css = css.toString();
        this.stringified = false;
        this._processor = processor2;
        this._css = css;
        this._opts = opts;
        this._map = void 0;
        var root2;
        var str = stringify$1;
        this.result = new Result$1(this._processor, root2, this._opts);
        this.result.css = css;
        var self = this;
        Object.defineProperty(this.result, "root", {
            get: function get() {
                return self.root;
            }
        });
        var map = new MapGenerator2(str, root2, this._opts, css);
        if (map.isMap()) {
            var _map_generate = map.generate(), generatedCSS = _map_generate[0], generatedMap = _map_generate[1];
            if (generatedCSS) {
                this.result.css = generatedCSS;
            }
            if (generatedMap) {
                this.result.map = generatedMap;
            }
        } else {
            map.clearAnnotation();
            this.result.css = map.css;
        }
    }
    var _proto = NoWorkResult.prototype;
    _proto.async = function async() {
        if (this.error) return Promise.reject(this.error);
        return Promise.resolve(this.result);
    };
    _proto.catch = function _catch(onRejected) {
        return this.async().catch(onRejected);
    };
    _proto.finally = function _finally(onFinally) {
        return this.async().then(onFinally, onFinally);
    };
    _proto.sync = function sync() {
        if (this.error) throw this.error;
        return this.result;
    };
    _proto.then = function then(onFulfilled, onRejected) {
        if (process.env.NODE_ENV !== "production") {
            if (!("from" in this._opts)) {
                warnOnce2("Without `from` option PostCSS could generate wrong source map and will not find Browserslist config. Set it to CSS file path or to `undefined` to prevent this warning.");
            }
        }
        return this.async().then(onFulfilled, onRejected);
    };
    _proto.toString = function toString() {
        return this._css;
    };
    _proto.warnings = function warnings() {
        return [];
    };
    _create_class(NoWorkResult, [
        {
            key: "content",
            get: function get() {
                return this.result.css;
            }
        },
        {
            key: "css",
            get: function get() {
                return this.result.css;
            }
        },
        {
            key: "map",
            get: function get() {
                return this.result.map;
            }
        },
        {
            key: "messages",
            get: function get() {
                return [];
            }
        },
        {
            key: "opts",
            get: function get() {
                return this.result.opts;
            }
        },
        {
            key: "processor",
            get: function get() {
                return this.result.processor;
            }
        },
        {
            key: "root",
            get: function get() {
                if (this._root) {
                    return this._root;
                }
                var root2;
                var parser2 = parse$1;
                try {
                    root2 = parser2(this._css, this._opts);
                } catch (error) {
                    this.error = error;
                }
                if (this.error) {
                    throw this.error;
                } else {
                    this._root = root2;
                    return root2;
                }
            }
        },
        {
            key: Symbol.toStringTag,
            get: function get() {
                return "NoWorkResult";
            }
        }
    ]);
    return NoWorkResult;
}();
var noWorkResult = NoWorkResult$1;
NoWorkResult$1.default = NoWorkResult$1;
var NoWorkResult2 = noWorkResult;
var LazyResult$1 = lazyResult;
var Document$1 = document$1;
var Root$2 = root;
var Processor$1 = /*#__PURE__*/ function() {
    function Processor(plugins) {
        if (plugins === void 0) plugins = [];
        this.version = "8.4.38";
        this.plugins = this.normalize(plugins);
    }
    var _proto = Processor.prototype;
    _proto.normalize = function normalize(plugins) {
        var normalized = [];
        for(var _iterator = _create_for_of_iterator_helper_loose(plugins), _step; !(_step = _iterator()).done;){
            var i = _step.value;
            if (i.postcss === true) {
                i = i();
            } else if (i.postcss) {
                i = i.postcss;
            }
            if ((typeof i === "undefined" ? "undefined" : _type_of(i)) === "object" && Array.isArray(i.plugins)) {
                normalized = normalized.concat(i.plugins);
            } else if ((typeof i === "undefined" ? "undefined" : _type_of(i)) === "object" && i.postcssPlugin) {
                normalized.push(i);
            } else if (typeof i === "function") {
                normalized.push(i);
            } else if ((typeof i === "undefined" ? "undefined" : _type_of(i)) === "object" && (i.parse || i.stringify)) {
                if (process.env.NODE_ENV !== "production") {
                    throw new Error("PostCSS syntaxes cannot be used as plugins. Instead, please use one of the syntax/parser/stringifier options as outlined in your PostCSS runner documentation.");
                }
            } else {
                throw new Error(i + " is not a PostCSS plugin");
            }
        }
        return normalized;
    };
    _proto.process = function process1(css, opts) {
        if (opts === void 0) opts = {};
        if (!this.plugins.length && !opts.parser && !opts.stringifier && !opts.syntax) {
            return new NoWorkResult2(this, css, opts);
        } else {
            return new LazyResult$1(this, css, opts);
        }
    };
    _proto.use = function use(plugin2) {
        this.plugins = this.plugins.concat(this.normalize([
            plugin2
        ]));
        return this;
    };
    return Processor;
}();
var processor = Processor$1;
Processor$1.default = Processor$1;
Root$2.registerProcessor(Processor$1);
Document$1.registerProcessor(Processor$1);
var Declaration$1 = declaration;
var PreviousMap2 = previousMap;
var Comment$1 = comment;
var AtRule$1 = atRule;
var Input$1 = input;
var Root$1 = root;
var Rule$1 = rule;
function fromJSON$1(json, inputs) {
    if (Array.isArray(json)) return json.map(function(n) {
        return fromJSON$1(n);
    });
    var ownInputs = json.inputs, defaults = _object_without_properties_loose(json, [
        "inputs"
    ]);
    if (ownInputs) {
        inputs = [];
        for(var _iterator = _create_for_of_iterator_helper_loose(ownInputs), _step; !(_step = _iterator()).done;){
            var input2 = _step.value;
            var inputHydrated = _extends({}, input2, {
                __proto__: Input$1.prototype
            });
            if (inputHydrated.map) {
                inputHydrated.map = _extends({}, inputHydrated.map, {
                    __proto__: PreviousMap2.prototype
                });
            }
            inputs.push(inputHydrated);
        }
    }
    if (defaults.nodes) {
        defaults.nodes = json.nodes.map(function(n) {
            return fromJSON$1(n, inputs);
        });
    }
    if (defaults.source) {
        var _defaults_source = defaults.source, inputId = _defaults_source.inputId, source = _object_without_properties_loose(_defaults_source, [
            "inputId"
        ]);
        defaults.source = source;
        if (inputId != null) {
            defaults.source.input = inputs[inputId];
        }
    }
    if (defaults.type === "root") {
        return new Root$1(defaults);
    } else if (defaults.type === "decl") {
        return new Declaration$1(defaults);
    } else if (defaults.type === "rule") {
        return new Rule$1(defaults);
    } else if (defaults.type === "comment") {
        return new Comment$1(defaults);
    } else if (defaults.type === "atrule") {
        return new AtRule$1(defaults);
    } else {
        throw new Error("Unknown node type: " + json.type);
    }
}
var fromJSON_1 = fromJSON$1;
fromJSON$1.default = fromJSON$1;
var CssSyntaxError2 = cssSyntaxError;
var Declaration2 = declaration;
var LazyResult2 = lazyResult;
var Container2 = container;
var Processor2 = processor;
var stringify$5 = stringify_1;
var fromJSON = fromJSON_1;
var Document2 = document$1;
var Warning2 = warning;
var Comment2 = comment;
var AtRule2 = atRule;
var Result2 = result;
var Input2 = input;
var parse = parse_1;
var list = list_1;
var Rule2 = rule;
var Root2 = root;
var Node2 = node;
function postcss() {
    for(var _len = arguments.length, plugins = new Array(_len), _key = 0; _key < _len; _key++){
        plugins[_key] = arguments[_key];
    }
    if (plugins.length === 1 && Array.isArray(plugins[0])) {
        plugins = plugins[0];
    }
    return new Processor2(plugins);
}
postcss.plugin = function plugin(name, initializer) {
    var warningPrinted = false;
    function creator() {
        for(var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++){
            args[_key] = arguments[_key];
        }
        if (console && console.warn && !warningPrinted) {
            warningPrinted = true;
            console.warn(name + ": postcss.plugin was deprecated. Migration guide:\nhttps://evilmartians.com/chronicles/postcss-8-plugin-migration");
            if (process.env.LANG && process.env.LANG.startsWith("cn")) {
                console.warn(name + ": 里面 postcss.plugin 被弃用. 迁移指南:\nhttps://www.w3ctech.com/topic/2226");
            }
        }
        var transformer = initializer.apply(void 0, [].concat(args));
        transformer.postcssPlugin = name;
        transformer.postcssVersion = new Processor2().version;
        return transformer;
    }
    var cache;
    Object.defineProperty(creator, "postcss", {
        get: function get() {
            if (!cache) cache = creator();
            return cache;
        }
    });
    creator.process = function(css, processOpts, pluginOpts) {
        return postcss([
            creator(pluginOpts)
        ]).process(css, processOpts);
    };
    return creator;
};
postcss.stringify = stringify$5;
postcss.parse = parse;
postcss.fromJSON = fromJSON;
postcss.list = list;
postcss.comment = function(defaults) {
    return new Comment2(defaults);
};
postcss.atRule = function(defaults) {
    return new AtRule2(defaults);
};
postcss.decl = function(defaults) {
    return new Declaration2(defaults);
};
postcss.rule = function(defaults) {
    return new Rule2(defaults);
};
postcss.root = function(defaults) {
    return new Root2(defaults);
};
postcss.document = function(defaults) {
    return new Document2(defaults);
};
postcss.CssSyntaxError = CssSyntaxError2;
postcss.Declaration = Declaration2;
postcss.Container = Container2;
postcss.Processor = Processor2;
postcss.Document = Document2;
postcss.Comment = Comment2;
postcss.Warning = Warning2;
postcss.AtRule = AtRule2;
postcss.Result = Result2;
postcss.Input = Input2;
postcss.Rule = Rule2;
postcss.Root = Root2;
postcss.Node = Node2;
LazyResult2.registerPostcss(postcss);
var postcss_1 = postcss;
postcss.default = postcss;
var postcss$1 = /* @__PURE__ */ getDefaultExportFromCjs(postcss_1);
postcss$1.stringify;
postcss$1.fromJSON;
postcss$1.plugin;
postcss$1.parse;
postcss$1.list;
postcss$1.document;
postcss$1.comment;
postcss$1.atRule;
postcss$1.rule;
postcss$1.decl;
postcss$1.root;
postcss$1.CssSyntaxError;
postcss$1.Declaration;
postcss$1.Container;
postcss$1.Processor;
postcss$1.Document;
postcss$1.Comment;
postcss$1.Warning;
postcss$1.AtRule;
postcss$1.Result;
postcss$1.Input;
postcss$1.Rule;
postcss$1.Root;
postcss$1.Node;
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

export { EventType, IncrementalSource, classMatchesRegex, getRecordConsolePlugin, record };
