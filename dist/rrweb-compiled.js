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
var _a;
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
    mutationObserver: mutationObserverCtor$1
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
        __publicField$1(this, "idNodeMap", /* @__PURE__ */ new Map());
        __publicField$1(this, "nodeMetaMap", /* @__PURE__ */ new WeakMap());
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
function isNodeMetaEqual(a2, b) {
    if (!a2 || !b || a2.type !== b.type) return false;
    if (a2.type === NodeType$3.Document) return a2.compatMode === b.compatMode;
    else if (a2.type === NodeType$3.DocumentType) return a2.name === b.name && a2.publicId === b.publicId && a2.systemId === b.systemId;
    else if (a2.type === NodeType$3.Comment || a2.type === NodeType$3.Text || a2.type === NodeType$3.CDATA) return a2.textContent === b.textContent;
    else if (a2.type === NodeType$3.Element) return a2.tagName === b.tagName && JSON.stringify(a2.attributes) === JSON.stringify(b.attributes) && a2.isSVG === b.isSVG && a2.needBlock === b.needBlock;
    return false;
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
function normalizeCssString(cssText) {
    return cssText.replace(/(\/\*[^*]*\*\/)|[\s;]/g, "");
}
function splitCssText(cssText, style) {
    var childNodes2 = Array.from(style.childNodes);
    var splits = [];
    if (childNodes2.length > 1 && cssText && typeof cssText === "string") {
        var cssTextNorm = normalizeCssString(cssText);
        for(var i2 = 1; i2 < childNodes2.length; i2++){
            if (childNodes2[i2].textContent && typeof childNodes2[i2].textContent === "string") {
                var textContentNorm = normalizeCssString(childNodes2[i2].textContent);
                for(var j = 3; j < textContentNorm.length; j++){
                    var bit = textContentNorm.substring(0, j);
                    if (cssTextNorm.split(bit).length === 2) {
                        var splitNorm = cssTextNorm.indexOf(bit);
                        for(var k = splitNorm; k < cssText.length; k++){
                            if (normalizeCssString(cssText.substring(0, k)).length === splitNorm) {
                                splits.push(cssText.substring(0, k));
                                cssText = cssText.substring(k);
                                break;
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
function classMatchesRegex(node2, regex, checkAncestors) {
    if (!node2) return false;
    if (node2.nodeType !== node2.ELEMENT_NODE) {
        if (!checkAncestors) return false;
        return classMatchesRegex(index$1.parentNode(node2), regex, checkAncestors);
    }
    for(var eIndex = node2.classList.length; eIndex--;){
        var className = node2.classList[eIndex];
        if (regex.test(className)) {
            return true;
        }
    }
    if (!checkAncestors) return false;
    return classMatchesRegex(index$1.parentNode(node2), regex, checkAncestors);
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
            if (classMatchesRegex(el, maskTextClass, checkAncestors)) return true;
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
        sn.tagName === "link" && (sn.attributes.rel === "preload" || sn.attributes.rel === "modulepreload") && sn.attributes.as === "script" || // prefetch link
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
        password: true
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
var MEDIA_SELECTOR = /(max|min)-device-(width|height)/;
var MEDIA_SELECTOR_GLOBAL = new RegExp(MEDIA_SELECTOR.source, "g");
var mediaSelectorPlugin = {
    postcssPlugin: "postcss-custom-selectors",
    prepare: function prepare() {
        return {
            postcssPlugin: "postcss-custom-selectors",
            AtRule: function AtRule(atrule) {
                if (atrule.params.match(MEDIA_SELECTOR_GLOBAL)) {
                    atrule.params = atrule.params.replace(MEDIA_SELECTOR_GLOBAL, "$1-$2");
                }
            }
        };
    }
};
var pseudoClassPlugin = {
    postcssPlugin: "postcss-hover-classes",
    prepare: function prepare() {
        var fixed = [];
        return {
            Rule: function Rule(rule2) {
                if (fixed.indexOf(rule2) !== -1) {
                    return;
                }
                fixed.push(rule2);
                rule2.selectors.forEach(function(selector) {
                    if (selector.includes(":hover")) {
                        rule2.selector += ",\n" + selector.replace(/:hover/g, ".\\:hover");
                    }
                });
            }
        };
    }
};
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
    nanoid: nanoid$1$1};
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
var stringify$5 = stringify_1$1;
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
postcss$3.stringify = stringify$5;
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
var tagMap = {
    script: "noscript",
    // camel case svg element tag names
    altglyph: "altGlyph",
    altglyphdef: "altGlyphDef",
    altglyphitem: "altGlyphItem",
    animatecolor: "animateColor",
    animatemotion: "animateMotion",
    animatetransform: "animateTransform",
    clippath: "clipPath",
    feblend: "feBlend",
    fecolormatrix: "feColorMatrix",
    fecomponenttransfer: "feComponentTransfer",
    fecomposite: "feComposite",
    feconvolvematrix: "feConvolveMatrix",
    fediffuselighting: "feDiffuseLighting",
    fedisplacementmap: "feDisplacementMap",
    fedistantlight: "feDistantLight",
    fedropshadow: "feDropShadow",
    feflood: "feFlood",
    fefunca: "feFuncA",
    fefuncb: "feFuncB",
    fefuncg: "feFuncG",
    fefuncr: "feFuncR",
    fegaussianblur: "feGaussianBlur",
    feimage: "feImage",
    femerge: "feMerge",
    femergenode: "feMergeNode",
    femorphology: "feMorphology",
    feoffset: "feOffset",
    fepointlight: "fePointLight",
    fespecularlighting: "feSpecularLighting",
    fespotlight: "feSpotLight",
    fetile: "feTile",
    feturbulence: "feTurbulence",
    foreignobject: "foreignObject",
    glyphref: "glyphRef",
    lineargradient: "linearGradient",
    radialgradient: "radialGradient"
};
function getTagName(n2) {
    var tagName = tagMap[n2.tagName] ? tagMap[n2.tagName] : n2.tagName;
    if (tagName === "link" && n2.attributes._cssText) {
        tagName = "style";
    }
    return tagName;
}
function adaptCssForReplay(cssText, cache) {
    var cachedStyle = cache == null ? void 0 : cache.stylesWithHoverClass.get(cssText);
    if (cachedStyle) return cachedStyle;
    var ast = postcss$1$1([
        mediaSelectorPlugin,
        pseudoClassPlugin
    ]).process(cssText);
    var result2 = ast.css;
    cache == null ? void 0 : cache.stylesWithHoverClass.set(cssText, result2);
    return result2;
}
function createCache() {
    var stylesWithHoverClass = /* @__PURE__ */ new Map();
    return {
        stylesWithHoverClass: stylesWithHoverClass
    };
}
function applyCssSplits(n2, cssText, hackCss, cache) {
    var childTextNodes = [];
    for(var _iterator = _create_for_of_iterator_helper_loose(n2.childNodes), _step; !(_step = _iterator()).done;){
        var scn = _step.value;
        if (scn.type === NodeType$3.Text) {
            childTextNodes.push(scn);
        }
    }
    var cssTextSplits = cssText.split("/* rr_split */");
    while(cssTextSplits.length > 1 && cssTextSplits.length > childTextNodes.length){
        cssTextSplits.splice(-2, 2, cssTextSplits.slice(-2).join(""));
    }
    for(var i2 = 0; i2 < childTextNodes.length; i2++){
        var childTextNode = childTextNodes[i2];
        var cssTextSection = cssTextSplits[i2];
        if (childTextNode && cssTextSection) {
            childTextNode.textContent = hackCss ? adaptCssForReplay(cssTextSection, cache) : cssTextSection;
        }
    }
}
function buildStyleNode(n2, styleEl, cssText, options) {
    var doc = options.doc, hackCss = options.hackCss, cache = options.cache;
    if (n2.childNodes.length) {
        applyCssSplits(n2, cssText, hackCss, cache);
    } else {
        if (hackCss) {
            cssText = adaptCssForReplay(cssText, cache);
        }
        styleEl.appendChild(doc.createTextNode(cssText));
    }
}
function buildNode(n2, options) {
    var _a2;
    var doc = options.doc, hackCss = options.hackCss, cache = options.cache;
    switch(n2.type){
        case NodeType$3.Document:
            return doc.implementation.createDocument(null, "", null);
        case NodeType$3.DocumentType:
            return doc.implementation.createDocumentType(n2.name || "html", n2.publicId, n2.systemId);
        case NodeType$3.Element:
            {
                var _loop = function(name1) {
                    var value = specialAttributes[name1];
                    if (tagName === "canvas" && name1 === "rr_dataURL") {
                        var image = doc.createElement("img");
                        image.onload = function() {
                            var ctx = node2.getContext("2d");
                            if (ctx) {
                                ctx.drawImage(image, 0, 0, image.width, image.height);
                            }
                        };
                        image.src = value.toString();
                        if (node2.RRNodeType) node2.rr_dataURL = value.toString();
                    } else if (tagName === "img" && name1 === "rr_dataURL") {
                        var image1 = node2;
                        if (!image1.currentSrc.startsWith("data:")) {
                            image1.setAttribute("rrweb-original-src", n2.attributes.src);
                            image1.src = value.toString();
                        }
                    }
                    if (name1 === "rr_width") {
                        node2.style.setProperty("width", value.toString());
                    } else if (name1 === "rr_height") {
                        node2.style.setProperty("height", value.toString());
                    } else if (name1 === "rr_mediaCurrentTime" && typeof value === "number") {
                        node2.currentTime = value;
                    } else if (name1 === "rr_mediaState") {
                        switch(value){
                            case "played":
                                node2.play().catch(function(e2) {
                                    return console.warn("media playback error", e2);
                                });
                                break;
                            case "paused":
                                node2.pause();
                                break;
                        }
                    } else if (name1 === "rr_mediaPlaybackRate" && typeof value === "number") {
                        node2.playbackRate = value;
                    } else if (name1 === "rr_mediaMuted" && typeof value === "boolean") {
                        node2.muted = value;
                    } else if (name1 === "rr_mediaLoop" && typeof value === "boolean") {
                        node2.loop = value;
                    } else if (name1 === "rr_mediaVolume" && typeof value === "number") {
                        node2.volume = value;
                    } else if (name1 === "rr_open_mode") {
                        node2.setAttribute("rr_open_mode", value);
                    }
                };
                var tagName = getTagName(n2);
                var node2;
                if (n2.isSVG) {
                    node2 = doc.createElementNS("http://www.w3.org/2000/svg", tagName);
                } else {
                    if (// If the tag name is a custom element name
                    n2.isCustom && // If the browser supports custom elements
                    ((_a2 = doc.defaultView) == null ? void 0 : _a2.customElements) && // If the custom element hasn't been defined yet
                    !doc.defaultView.customElements.get(n2.tagName)) doc.defaultView.customElements.define(n2.tagName, /*#__PURE__*/ function(_doc_defaultView_HTMLElement) {
                        _inherits(_class, _doc_defaultView_HTMLElement);
                        function _class() {
                            return _doc_defaultView_HTMLElement.apply(this, arguments) || this;
                        }
                        return _class;
                    }(doc.defaultView.HTMLElement));
                    node2 = doc.createElement(tagName);
                }
                var specialAttributes = {};
                for(var name in n2.attributes){
                    if (!Object.prototype.hasOwnProperty.call(n2.attributes, name)) {
                        continue;
                    }
                    var value = n2.attributes[name];
                    if (tagName === "option" && name === "selected" && value === false) {
                        continue;
                    }
                    if (value === null) {
                        continue;
                    }
                    if (value === true) value = "";
                    if (name.startsWith("rr_")) {
                        specialAttributes[name] = value;
                        continue;
                    }
                    if (typeof value !== "string") ;
                    else if (tagName === "style" && name === "_cssText") {
                        buildStyleNode(n2, node2, value, options);
                        continue;
                    } else if (tagName === "textarea" && name === "value") {
                        node2.appendChild(doc.createTextNode(value));
                        n2.childNodes = [];
                        continue;
                    }
                    try {
                        if (n2.isSVG && name === "xlink:href") {
                            node2.setAttributeNS("http://www.w3.org/1999/xlink", name, value.toString());
                        } else if (name === "onload" || name === "onclick" || name.substring(0, 7) === "onmouse") {
                            node2.setAttribute("_" + name, value.toString());
                        } else if (tagName === "meta" && n2.attributes["http-equiv"] === "Content-Security-Policy" && name === "content") {
                            node2.setAttribute("csp-content", value.toString());
                            continue;
                        } else if (tagName === "link" && (n2.attributes.rel === "preload" || n2.attributes.rel === "modulepreload") && n2.attributes.as === "script") {} else if (tagName === "link" && n2.attributes.rel === "prefetch" && typeof n2.attributes.href === "string" && n2.attributes.href.endsWith(".js")) {} else if (tagName === "img" && n2.attributes.srcset && n2.attributes.rr_dataURL) {
                            node2.setAttribute("rrweb-original-srcset", n2.attributes.srcset);
                        } else {
                            node2.setAttribute(name, value.toString());
                        }
                    } catch (error) {}
                }
                for(var name1 in specialAttributes)_loop(name1);
                if (n2.isShadowHost) {
                    if (!node2.shadowRoot) {
                        node2.attachShadow({
                            mode: "open"
                        });
                    } else {
                        while(node2.shadowRoot.firstChild){
                            node2.shadowRoot.removeChild(node2.shadowRoot.firstChild);
                        }
                    }
                }
                return node2;
            }
        case NodeType$3.Text:
            if (n2.isStyle && hackCss) {
                return doc.createTextNode(adaptCssForReplay(n2.textContent, cache));
            }
            return doc.createTextNode(n2.textContent);
        case NodeType$3.CDATA:
            return doc.createCDATASection(n2.textContent);
        case NodeType$3.Comment:
            return doc.createComment(n2.textContent);
        default:
            return null;
    }
}
function buildNodeWithSN(n2, options) {
    var doc = options.doc, mirror2 = options.mirror, _options_skipChild = options.skipChild, skipChild = _options_skipChild === void 0 ? false : _options_skipChild, _options_hackCss = options.hackCss, hackCss = _options_hackCss === void 0 ? true : _options_hackCss, afterAppend = options.afterAppend, cache = options.cache;
    if (mirror2.has(n2.id)) {
        var nodeInMirror = mirror2.getNode(n2.id);
        var meta = mirror2.getMeta(nodeInMirror);
        if (isNodeMetaEqual(meta, n2)) return mirror2.getNode(n2.id);
    }
    var node2 = buildNode(n2, {
        doc: doc,
        hackCss: hackCss,
        cache: cache
    });
    if (!node2) {
        return null;
    }
    if (n2.rootId && mirror2.getNode(n2.rootId) !== doc) {
        mirror2.replace(n2.rootId, doc);
    }
    if (n2.type === NodeType$3.Document) {
        doc.close();
        doc.open();
        if (n2.compatMode === "BackCompat" && n2.childNodes && n2.childNodes[0].type !== NodeType$3.DocumentType) {
            if (n2.childNodes[0].type === NodeType$3.Element && "xmlns" in n2.childNodes[0].attributes && n2.childNodes[0].attributes.xmlns === "http://www.w3.org/1999/xhtml") {
                doc.write('<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "">');
            } else {
                doc.write('<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN" "">');
            }
        }
        node2 = doc;
    }
    mirror2.add(node2, n2);
    if ((n2.type === NodeType$3.Document || n2.type === NodeType$3.Element) && !skipChild) {
        var _loop = function() {
            var childN = _step.value;
            var childNode = buildNodeWithSN(childN, {
                doc: doc,
                mirror: mirror2,
                skipChild: false,
                hackCss: hackCss,
                afterAppend: afterAppend,
                cache: cache
            });
            if (!childNode) {
                console.warn("Failed to rebuild", childN);
                return "continue";
            }
            if (childN.isShadow && isElement(node2) && node2.shadowRoot) {
                node2.shadowRoot.appendChild(childNode);
            } else if (n2.type === NodeType$3.Document && childN.type == NodeType$3.Element) {
                var htmlElement = childNode;
                var body = null;
                htmlElement.childNodes.forEach(function(child) {
                    if (child.nodeName === "BODY") body = child;
                });
                if (body) {
                    htmlElement.removeChild(body);
                    node2.appendChild(childNode);
                    htmlElement.appendChild(body);
                } else {
                    node2.appendChild(childNode);
                }
            } else {
                node2.appendChild(childNode);
            }
            if (afterAppend) {
                afterAppend(childNode, childN.id);
            }
        };
        for(var _iterator = _create_for_of_iterator_helper_loose(n2.childNodes), _step; !(_step = _iterator()).done;)_loop();
    }
    return node2;
}
function visit(mirror2, onVisit) {
    function walk(node2) {
        onVisit(node2);
    }
    for(var _iterator = _create_for_of_iterator_helper_loose(mirror2.getIds()), _step; !(_step = _iterator()).done;){
        var id = _step.value;
        if (mirror2.has(id)) {
            walk(mirror2.getNode(id));
        }
    }
}
function handleScroll(node2, mirror2) {
    var n2 = mirror2.getMeta(node2);
    if ((n2 == null ? void 0 : n2.type) !== NodeType$3.Element) {
        return;
    }
    var el = node2;
    for(var name in n2.attributes){
        if (!(Object.prototype.hasOwnProperty.call(n2.attributes, name) && name.startsWith("rr_"))) {
            continue;
        }
        var value = n2.attributes[name];
        if (name === "rr_scrollLeft") {
            el.scrollLeft = value;
        }
        if (name === "rr_scrollTop") {
            el.scrollTop = value;
        }
    }
}
function rebuild(n2, options) {
    var doc = options.doc, onVisit = options.onVisit, _options_hackCss = options.hackCss, hackCss = _options_hackCss === void 0 ? true : _options_hackCss, afterAppend = options.afterAppend, cache = options.cache, tmp = options.mirror, mirror2 = tmp === void 0 ? new Mirror() : tmp;
    var node2 = buildNodeWithSN(n2, {
        doc: doc,
        mirror: mirror2,
        skipChild: false,
        hackCss: hackCss,
        afterAppend: afterAppend,
        cache: cache
    });
    visit(mirror2, function(visitedNode) {
        if (onVisit) {
            onVisit(visitedNode);
        }
        handleScroll(visitedNode, mirror2);
    });
    return node2;
}
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
var __defProp22 = Object.defineProperty;
var __defNormalProp22 = function(obj, key, value) {
    return key in obj ? __defProp22(obj, key, {
        enumerable: true,
        configurable: true,
        writable: true,
        value: value
    }) : obj[key] = value;
};
var __publicField22 = function(obj, key, value) {
    return __defNormalProp22(obj, (typeof key === "undefined" ? "undefined" : _type_of(key)) !== "symbol" ? key + "" : key, value);
};
var Mirror$1 = /*#__PURE__*/ function() {
    function Mirror2() {
        __publicField22(this, "idNodeMap", /* @__PURE__ */ new Map());
        __publicField22(this, "nodeMetaMap", /* @__PURE__ */ new WeakMap());
    }
    var _proto = Mirror2.prototype;
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
    return Mirror2;
}();
function createMirror$1() {
    return new Mirror$1();
}
function getDefaultExportFromCjs(x2) {
    return x2 && x2.__esModule && Object.prototype.hasOwnProperty.call(x2, "default") ? x2["default"] : x2;
}
function getAugmentedNamespace(n2) {
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
    return CssSyntaxError2;
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
                root2.walk(function(i2) {
                    value = i2.raws[own];
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
var Stringifier22 = stringifier;
var stringify$3 = stringify_1;
function cloneNode(obj, parent) {
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
                return cloneNode(j, cloned);
            });
        } else {
            if (type === "object" && value !== null) value = cloneNode(value);
            cloned[i2] = value;
        }
    }
    return cloned;
}
var Node$4 = /*#__PURE__*/ function() {
    function Node3(defaults) {
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
        if (stringifier2 === void 0) stringifier2 = stringify$3;
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
var node = Node$4;
Node$4.default = Node$4;
var Node$3 = node;
var Declaration$4 = /*#__PURE__*/ function(Node$3) {
    _inherits(Declaration2, Node$3);
    function Declaration2(defaults) {
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
    _create_class(Declaration2, [
        {
            key: "variable",
            get: function get() {
                return this.prop.startsWith("--") || this.prop[0] === "$";
            }
        }
    ]);
    return Declaration2;
}(Node$3);
var declaration = Declaration$4;
Declaration$4.default = Declaration$4;
var urlAlphabet = "useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict";
var nanoid$1 = function(size) {
    if (size === void 0) size = 21;
    var id = "";
    var i2 = size;
    while(i2--){
        id += urlAlphabet[Math.random() * 64 | 0];
    }
    return id;
};
var nonSecure = {
    nanoid: nanoid$1};
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
    function PreviousMap2(css, opts) {
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
    var _proto = PreviousMap2.prototype;
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
    return PreviousMap2;
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
            for(var i2 = 0, l2 = lines.length; i2 < l2; i2++){
                lineToIndex[i2] = prevIndex;
                prevIndex += lines[i2].length + 1;
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
        if (pathAvailable && sourceMapAvailable && this.isMap()) {
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
    return MapGenerator2;
}();
var mapGenerator = MapGenerator$2;
var Node$2 = node;
var Comment$4 = /*#__PURE__*/ function(Node$2) {
    _inherits(Comment2, Node$2);
    function Comment2(defaults) {
        var _this;
        _this = Node$2.call(this, defaults) || this;
        _this.type = "comment";
        return _this;
    }
    return Comment2;
}(Node$2);
var comment = Comment$4;
Comment$4.default = Comment$4;
var isClean$1 = symbols.isClean, my$1 = symbols.my;
var Declaration$3 = declaration;
var Comment$3 = comment;
var Node$1 = node;
var parse$4, Rule$4, AtRule$4, Root$6;
function cleanSource(nodes) {
    return nodes.map(function(i2) {
        if (i2.nodes) i2.nodes = cleanSource(i2.nodes);
        delete i2.source;
        return i2;
    });
}
function markDirtyUp(node2) {
    node2[isClean$1] = false;
    if (node2.proxyOf.nodes) {
        for(var _iterator = _create_for_of_iterator_helper_loose(node2.proxyOf.nodes), _step; !(_step = _iterator()).done;){
            var i2 = _step.value;
            markDirtyUp(i2);
        }
    }
}
var Container$7 = /*#__PURE__*/ function(Node$1) {
    _inherits(Container2, Node$1);
    function Container2() {
        return Node$1.apply(this, arguments) || this;
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
            nodes = cleanSource(parse$4(nodes).nodes);
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
        var processed = nodes.map(function(i2) {
            if (!i2[my$1]) Container2.rebuild(i2);
            i2 = i2.proxyOf;
            if (i2.parent) i2.parent.removeChild(i2);
            if (i2[isClean$1]) markDirtyUp(i2);
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
    _inherits(Document23, Container$6);
    function Document23(defaults) {
        var _this;
        _this = Container$6.call(this, _extends({
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
        var lazy = new LazyResult$4(new Processor$3(), this, opts);
        return lazy.stringify();
    };
    return Document23;
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
var warnOnce$2 = function warnOnce2(message) {
    if (printed[message]) return;
    printed[message] = true;
    if (typeof console !== "undefined" && console.warn) {
        console.warn(message);
    }
};
var Warning$2 = /*#__PURE__*/ function() {
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
var warning = Warning$2;
Warning$2.default = Warning$2;
var Warning$1 = warning;
var Result$3 = /*#__PURE__*/ function() {
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
        var warning2 = new Warning$1(text, opts);
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
var tokenize = function tokenizer2(input2, options) {
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
                    n2 = css.charCodeAt(pos + 1);
                    if (prev === "url" && n2 !== SINGLE_QUOTE && n2 !== DOUBLE_QUOTE && n2 !== SPACE && n2 !== NEWLINE && n2 !== TAB && n2 !== FEED && n2 !== CR) {
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
    _inherits(AtRule2, Container$5);
    function AtRule2(defaults) {
        var _this;
        _this = Container$5.call(this, defaults) || this;
        _this.type = "atrule";
        return _this;
    }
    var _proto = AtRule2.prototype;
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
    return AtRule2;
}(Container$5);
var atRule = AtRule$3;
AtRule$3.default = AtRule$3;
Container$5.registerAtRule(AtRule$3);
var Container$4 = container;
var LazyResult$3, Processor$2;
var Root$5 = /*#__PURE__*/ function(Container$4) {
    _inherits(Root2, Container$4);
    function Root2(defaults) {
        var _this;
        _this = Container$4.call(this, defaults) || this;
        _this.type = "root";
        if (!_this.nodes) _this.nodes = [];
        return _this;
    }
    var _proto = Root2.prototype;
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
    return Root2;
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
    _inherits(Rule2, Container$3);
    function Rule2(defaults) {
        var _this;
        _this = Container$3.call(this, defaults) || this;
        _this.type = "rule";
        if (!_this.nodes) _this.nodes = [];
        return _this;
    }
    _create_class(Rule2, [
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
    return Rule2;
}(Container$3);
var rule = Rule$3;
Rule$3.default = Rule$3;
Container$3.registerRule(Rule$3);
var Declaration$2 = declaration;
var tokenizer22 = tokenize;
var Comment$2 = comment;
var AtRule$2 = atRule;
var Root$4 = root;
var Rule$2 = rule;
var SAFE_COMMENT_NEIGHBOR = {
    empty: true,
    space: true
};
function findLastWithPosition(tokens) {
    for(var i2 = tokens.length - 1; i2 >= 0; i2--){
        var token = tokens[i2];
        var pos = token[3] || token[2];
        if (pos) return pos;
    }
}
var Parser$1 = /*#__PURE__*/ function() {
    function Parser2(input2) {
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
    var _proto = Parser2.prototype;
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
        this.tokenizer = tokenizer22(this.input);
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
        for(var i2 = 0; i2 < length; i2 += 1){
            token = tokens[i2];
            type = token[0];
            if (type === "space" && i2 === length - 1 && !customProperty) {
                clean = false;
            } else if (type === "comment") {
                prev = tokens[i2 - 1] ? tokens[i2 - 1][0] : "empty";
                next = tokens[i2 + 1] ? tokens[i2 + 1][0] : "empty";
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
var parser = Parser$1;
var Container$2 = container;
var Parser22 = parser;
var Input$2 = input;
function parse$3(css, opts) {
    var input2 = new Input$2(css, opts);
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
    if (node2.nodes) node2.nodes.forEach(function(i2) {
        return cleanMarks(i2);
    });
    return node2;
}
var postcss$2 = {};
var LazyResult$2 = /*#__PURE__*/ function() {
    function LazyResult2(processor2, css, opts) {
        var _this = this;
        this.stringified = false;
        this.processed = false;
        var root2;
        if ((typeof css === "undefined" ? "undefined" : _type_of(css)) === "object" && css !== null && (css.type === "root" || css.type === "document")) {
            root2 = cleanMarks(css);
        } else if (_instanceof(css, LazyResult2) || _instanceof(css, Result$2)) {
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
                    if (!PLUGIN_PROPS[event] && /^[A-Z]/.test(event)) {
                        throw new Error("Unknown event " + event + " in " + plugin22.postcssPlugin + ". Try to update PostCSS (" + this.processor.version + " now).");
                    }
                    if (!NOT_VISITORS[event]) {
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
                    if (isPromise(roots[0])) {
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
            var plugin22 = _step.value;
            var promise = this.runOnRoot(plugin22);
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
LazyResult$2.registerPostcss = function(dependant) {
    postcss$2 = dependant;
};
var lazyResult = LazyResult$2;
LazyResult$2.default = LazyResult$2;
Root$3.registerLazyResult(LazyResult$2);
Document$2.registerLazyResult(LazyResult$2);
var MapGenerator22 = mapGenerator;
var stringify$1 = stringify_1;
var warnOnce22 = warnOnce$2;
var parse$1 = parse_1;
var Result$1 = result;
var NoWorkResult$1 = /*#__PURE__*/ function() {
    function NoWorkResult2(processor2, css, opts) {
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
    return NoWorkResult2;
}();
var noWorkResult = NoWorkResult$1;
NoWorkResult$1.default = NoWorkResult$1;
var NoWorkResult22 = noWorkResult;
var LazyResult$1 = lazyResult;
var Document$1 = document$1;
var Root$2 = root;
var Processor$1 = /*#__PURE__*/ function() {
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
            return new LazyResult$1(this, css, opts);
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
var processor = Processor$1;
Processor$1.default = Processor$1;
Root$2.registerProcessor(Processor$1);
Document$1.registerProcessor(Processor$1);
var Declaration$1 = declaration;
var PreviousMap22 = previousMap;
var Comment$1 = comment;
var AtRule$1 = atRule;
var Input$1 = input;
var Root$1 = root;
var Rule$1 = rule;
function fromJSON$1(json, inputs) {
    if (Array.isArray(json)) return json.map(function(n2) {
        return fromJSON$1(n2);
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
                    __proto__: PreviousMap22.prototype
                });
            }
            inputs.push(inputHydrated);
        }
    }
    if (defaults.nodes) {
        defaults.nodes = json.nodes.map(function(n2) {
            return fromJSON$1(n2, inputs);
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
var CssSyntaxError22 = cssSyntaxError;
var Declaration22 = declaration;
var LazyResult22 = lazyResult;
var Container22 = container;
var Processor22 = processor;
var stringify = stringify_1;
var fromJSON = fromJSON_1;
var Document222 = document$1;
var Warning22 = warning;
var Comment22 = comment;
var AtRule22 = atRule;
var Result22 = result;
var Input22 = input;
var parse = parse_1;
var list = list_1;
var Rule22 = rule;
var Root22 = root;
var Node22 = node;
function postcss() {
    for(var _len = arguments.length, plugins = new Array(_len), _key = 0; _key < _len; _key++){
        plugins[_key] = arguments[_key];
    }
    if (plugins.length === 1 && Array.isArray(plugins[0])) {
        plugins = plugins[0];
    }
    return new Processor22(plugins);
}
postcss.plugin = function plugin2(name, initializer) {
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
        return postcss([
            creator(pluginOpts)
        ]).process(css, processOpts);
    };
    return creator;
};
postcss.stringify = stringify;
postcss.parse = parse;
postcss.fromJSON = fromJSON;
postcss.list = list;
postcss.comment = function(defaults) {
    return new Comment22(defaults);
};
postcss.atRule = function(defaults) {
    return new AtRule22(defaults);
};
postcss.decl = function(defaults) {
    return new Declaration22(defaults);
};
postcss.rule = function(defaults) {
    return new Rule22(defaults);
};
postcss.root = function(defaults) {
    return new Root22(defaults);
};
postcss.document = function(defaults) {
    return new Document222(defaults);
};
postcss.CssSyntaxError = CssSyntaxError22;
postcss.Declaration = Declaration22;
postcss.Container = Container22;
postcss.Processor = Processor22;
postcss.Document = Document222;
postcss.Comment = Comment22;
postcss.Warning = Warning22;
postcss.AtRule = AtRule22;
postcss.Result = Result22;
postcss.Input = Input22;
postcss.Rule = Rule22;
postcss.Root = Root22;
postcss.Node = Node22;
LazyResult22.registerPostcss(postcss);
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
var NodeType$1 = /* @__PURE__ */ function(NodeType2) {
    NodeType2[NodeType2["Document"] = 0] = "Document";
    NodeType2[NodeType2["DocumentType"] = 1] = "DocumentType";
    NodeType2[NodeType2["Element"] = 2] = "Element";
    NodeType2[NodeType2["Text"] = 3] = "Text";
    NodeType2[NodeType2["CDATA"] = 4] = "CDATA";
    NodeType2[NodeType2["Comment"] = 5] = "Comment";
    return NodeType2;
}(NodeType$1 || {});
function parseCSSText(cssText) {
    var res = {};
    var listDelimiter = /;(?![^(]*\))/g;
    var propertyDelimiter = /:(.+)/;
    var comment2 = /\/\*.*?\*\//g;
    cssText.replace(comment2, "").split(listDelimiter).forEach(function(item) {
        if (item) {
            var tmp = item.split(propertyDelimiter);
            tmp.length > 1 && (res[camelize(tmp[0].trim())] = tmp[1].trim());
        }
    });
    return res;
}
function toCSSText(style) {
    var properties = [];
    for(var name in style){
        var value = style[name];
        if (typeof value !== "string") continue;
        var normalizedName = hyphenate(name);
        properties.push(normalizedName + ": " + value + ";");
    }
    return properties.join(" ");
}
var camelizeRE = /-([a-z])/g;
var CUSTOM_PROPERTY_REGEX = /^--[a-zA-Z0-9-]+$/;
var camelize = function(str) {
    if (CUSTOM_PROPERTY_REGEX.test(str)) return str;
    return str.replace(camelizeRE, function(_, c2) {
        return c2 ? c2.toUpperCase() : "";
    });
};
var hyphenateRE = /\B([A-Z])/g;
var hyphenate = function(str) {
    return str.replace(hyphenateRE, "-$1").toLowerCase();
};
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
var BaseRRDocument = /*#__PURE__*/ function(BaseRRNode) {
    _inherits(BaseRRDocument, BaseRRNode);
    function BaseRRDocument() {
        for(var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++){
            args[_key] = arguments[_key];
        }
        var _this;
        _this = BaseRRNode.call(this, args) || this;
        __publicField2(_this, "nodeType", 9);
        __publicField2(_this, "nodeName", "#document");
        __publicField2(_this, "compatMode", "CSS1Compat");
        __publicField2(_this, "RRNodeType", NodeType$1.Document);
        __publicField2(_this, "textContent", null);
        _this.ownerDocument = _this;
        return _this;
    }
    var _proto = BaseRRDocument.prototype;
    _proto.appendChild = function appendChild1(newChild) {
        var nodeType = newChild.RRNodeType;
        if (nodeType === NodeType$1.Element || nodeType === NodeType$1.DocumentType) {
            if (this.childNodes.some(function(s2) {
                return s2.RRNodeType === nodeType;
            })) {
                throw new Error("RRDomException: Failed to execute 'appendChild' on 'RRNode': Only one " + (nodeType === NodeType$1.Element ? "RRElement" : "RRDoctype") + " on RRDocument allowed.");
            }
        }
        var child = appendChild(this, newChild);
        child.parentElement = null;
        return child;
    };
    _proto.insertBefore = function insertBefore1(newChild, refChild) {
        var nodeType = newChild.RRNodeType;
        if (nodeType === NodeType$1.Element || nodeType === NodeType$1.DocumentType) {
            if (this.childNodes.some(function(s2) {
                return s2.RRNodeType === nodeType;
            })) {
                throw new Error("RRDomException: Failed to execute 'insertBefore' on 'RRNode': Only one " + (nodeType === NodeType$1.Element ? "RRElement" : "RRDoctype") + " on RRDocument allowed.");
            }
        }
        var child = insertBefore(this, newChild, refChild);
        child.parentElement = null;
        return child;
    };
    _proto.removeChild = function removeChild1(node2) {
        return removeChild(this, node2);
    };
    _proto.open = function open() {
        this.firstChild = null;
        this.lastChild = null;
    };
    _proto.close = function close() {};
    /**
   * Adhoc implementation for setting xhtml namespace in rebuilt.ts (rrweb-snapshot).
   * There are two lines used this function:
   * 1. doc.write('\<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" ""\>')
   * 2. doc.write('\<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN" ""\>')
   */ _proto.write = function write(content) {
        var publicId;
        if (content === '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "">') publicId = "-//W3C//DTD XHTML 1.0 Transitional//EN";
        else if (content === '<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN" "">') publicId = "-//W3C//DTD HTML 4.0 Transitional//EN";
        if (publicId) {
            var doctype = this.createDocumentType("html", publicId, "");
            this.open();
            this.appendChild(doctype);
        }
    };
    _proto.createDocument = function createDocument(_namespace, _qualifiedName, _doctype) {
        return new BaseRRDocument();
    };
    _proto.createDocumentType = function createDocumentType(qualifiedName, publicId, systemId) {
        var doctype = new BaseRRDocumentType(qualifiedName, publicId, systemId);
        doctype.ownerDocument = this;
        return doctype;
    };
    _proto.createElement = function createElement(tagName) {
        var element = new BaseRRElement(tagName);
        element.ownerDocument = this;
        return element;
    };
    _proto.createElementNS = function createElementNS(_namespaceURI, qualifiedName) {
        return this.createElement(qualifiedName);
    };
    _proto.createTextNode = function createTextNode(data) {
        var text = new BaseRRText(data);
        text.ownerDocument = this;
        return text;
    };
    _proto.createComment = function createComment(data) {
        var comment2 = new BaseRRComment(data);
        comment2.ownerDocument = this;
        return comment2;
    };
    _proto.createCDATASection = function createCDATASection(data) {
        var CDATASection = new BaseRRCDATASection(data);
        CDATASection.ownerDocument = this;
        return CDATASection;
    };
    _proto.toString = function toString() {
        return "RRDocument";
    };
    _create_class(BaseRRDocument, [
        {
            key: "documentElement",
            get: function get() {
                return this.childNodes.find(function(node2) {
                    return node2.RRNodeType === NodeType$1.Element && node2.tagName === "HTML";
                }) || null;
            }
        },
        {
            key: "body",
            get: function get() {
                var _a2;
                return ((_a2 = this.documentElement) == null ? void 0 : _a2.childNodes.find(function(node2) {
                    return node2.RRNodeType === NodeType$1.Element && node2.tagName === "BODY";
                })) || null;
            }
        },
        {
            key: "head",
            get: function get() {
                var _a2;
                return ((_a2 = this.documentElement) == null ? void 0 : _a2.childNodes.find(function(node2) {
                    return node2.RRNodeType === NodeType$1.Element && node2.tagName === "HEAD";
                })) || null;
            }
        },
        {
            key: "implementation",
            get: function get() {
                return this;
            }
        },
        {
            key: "firstElementChild",
            get: function get() {
                return this.documentElement;
            }
        }
    ]);
    return BaseRRDocument;
}(BaseRRNode);
var BaseRRDocumentType = /*#__PURE__*/ function(BaseRRNode) {
    _inherits(BaseRRDocumentType, BaseRRNode);
    function BaseRRDocumentType(qualifiedName, publicId, systemId) {
        var _this;
        _this = BaseRRNode.call(this) || this;
        __publicField2(_this, "nodeType", 10);
        __publicField2(_this, "RRNodeType", NodeType$1.DocumentType);
        __publicField2(_this, "name");
        __publicField2(_this, "publicId");
        __publicField2(_this, "systemId");
        __publicField2(_this, "textContent", null);
        _this.name = qualifiedName;
        _this.publicId = publicId;
        _this.systemId = systemId;
        _this.nodeName = qualifiedName;
        return _this;
    }
    var _proto = BaseRRDocumentType.prototype;
    _proto.toString = function toString() {
        return "RRDocumentType";
    };
    return BaseRRDocumentType;
}(BaseRRNode);
var BaseRRElement = /*#__PURE__*/ function(BaseRRNode) {
    _inherits(BaseRRElement, BaseRRNode);
    function BaseRRElement(tagName) {
        var _this;
        _this = BaseRRNode.call(this) || this;
        __publicField2(_this, "nodeType", 1);
        __publicField2(_this, "RRNodeType", NodeType$1.Element);
        __publicField2(_this, "tagName");
        __publicField2(_this, "attributes", {});
        __publicField2(_this, "shadowRoot", null);
        __publicField2(_this, "scrollLeft");
        __publicField2(_this, "scrollTop");
        _this.tagName = tagName.toUpperCase();
        _this.nodeName = tagName.toUpperCase();
        return _this;
    }
    var _proto = BaseRRElement.prototype;
    _proto.getAttribute = function getAttribute(name) {
        if (this.attributes[name] === void 0) return null;
        return this.attributes[name];
    };
    _proto.setAttribute = function setAttribute(name, attribute) {
        this.attributes[name] = attribute;
    };
    _proto.setAttributeNS = function setAttributeNS(_namespace, qualifiedName, value) {
        this.setAttribute(qualifiedName, value);
    };
    _proto.removeAttribute = function removeAttribute(name) {
        delete this.attributes[name];
    };
    _proto.appendChild = function appendChild1(newChild) {
        return appendChild(this, newChild);
    };
    _proto.insertBefore = function insertBefore1(newChild, refChild) {
        return insertBefore(this, newChild, refChild);
    };
    _proto.removeChild = function removeChild1(node2) {
        return removeChild(this, node2);
    };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _proto.attachShadow = function attachShadow(_init) {
        var shadowRoot2 = this.ownerDocument.createElement("SHADOWROOT");
        this.shadowRoot = shadowRoot2;
        return shadowRoot2;
    };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _proto.dispatchEvent = function dispatchEvent(_event) {
        return true;
    };
    _proto.toString = function toString() {
        var attributeString = "";
        for(var attribute in this.attributes){
            attributeString += attribute + '="' + this.attributes[attribute] + '" ';
        }
        return this.tagName + " " + attributeString;
    };
    _create_class(BaseRRElement, [
        {
            key: "textContent",
            get: function get() {
                var result2 = "";
                this.childNodes.forEach(function(node2) {
                    return result2 += node2.textContent;
                });
                return result2;
            },
            set: function set(textContent2) {
                this.firstChild = null;
                this.lastChild = null;
                this.appendChild(this.ownerDocument.createTextNode(textContent2));
            }
        },
        {
            key: "classList",
            get: function get() {
                var _this = this;
                return new ClassList(this.attributes.class, function(newClassName) {
                    _this.attributes.class = newClassName;
                });
            }
        },
        {
            key: "id",
            get: function get() {
                return this.attributes.id || "";
            }
        },
        {
            key: "className",
            get: function get() {
                return this.attributes.class || "";
            }
        },
        {
            key: "style",
            get: function get() {
                var _this = this;
                var style = this.attributes.style ? parseCSSText(this.attributes.style) : {};
                var hyphenateRE2 = /\B([A-Z])/g;
                style.setProperty = function(name, value, priority) {
                    if (hyphenateRE2.test(name)) return;
                    var normalizedName = camelize(name);
                    if (!value) delete style[normalizedName];
                    else style[normalizedName] = value;
                    if (priority === "important") style[normalizedName] += " !important";
                    _this.attributes.style = toCSSText(style);
                };
                style.removeProperty = function(name) {
                    if (hyphenateRE2.test(name)) return "";
                    var normalizedName = camelize(name);
                    var value = style[normalizedName] || "";
                    delete style[normalizedName];
                    _this.attributes.style = toCSSText(style);
                    return value;
                };
                return style;
            }
        }
    ]);
    return BaseRRElement;
}(BaseRRNode);
var BaseRRMediaElement = /*#__PURE__*/ function(BaseRRElement) {
    _inherits(BaseRRMediaElement, BaseRRElement);
    function BaseRRMediaElement() {
        var _this;
        _this = BaseRRElement.apply(this, arguments) || this;
        __publicField2(_this, "currentTime");
        __publicField2(_this, "volume");
        __publicField2(_this, "paused");
        __publicField2(_this, "muted");
        __publicField2(_this, "playbackRate");
        __publicField2(_this, "loop");
        return _this;
    }
    var _proto = BaseRRMediaElement.prototype;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _proto.attachShadow = function attachShadow(_init) {
        throw new Error("RRDomException: Failed to execute 'attachShadow' on 'RRElement': This RRElement does not support attachShadow");
    };
    _proto.play = function play() {
        this.paused = false;
    };
    _proto.pause = function pause() {
        this.paused = true;
    };
    return BaseRRMediaElement;
}(BaseRRElement);
var BaseRRDialogElement = /*#__PURE__*/ function(BaseRRElement) {
    _inherits(BaseRRDialogElement, BaseRRElement);
    function BaseRRDialogElement() {
        var _this;
        _this = BaseRRElement.apply(this, arguments) || this;
        __publicField2(_this, "tagName", "DIALOG");
        __publicField2(_this, "nodeName", "DIALOG");
        return _this;
    }
    var _proto = BaseRRDialogElement.prototype;
    _proto.close = function close() {
        this.removeAttribute("open");
        this.removeAttribute("rr_open_mode");
    };
    _proto.show = function show() {
        this.setAttribute("open", "");
        this.setAttribute("rr_open_mode", "non-modal");
    };
    _proto.showModal = function showModal() {
        this.setAttribute("open", "");
        this.setAttribute("rr_open_mode", "modal");
    };
    _create_class(BaseRRDialogElement, [
        {
            key: "isModal",
            get: function get() {
                return this.getAttribute("rr_open_mode") === "modal";
            }
        },
        {
            key: "open",
            get: function get() {
                return this.getAttribute("open") !== null;
            }
        }
    ]);
    return BaseRRDialogElement;
}(BaseRRElement);
var BaseRRText = /*#__PURE__*/ function(BaseRRNode) {
    _inherits(BaseRRText, BaseRRNode);
    function BaseRRText(data) {
        var _this;
        _this = BaseRRNode.call(this) || this;
        __publicField2(_this, "nodeType", 3);
        __publicField2(_this, "nodeName", "#text");
        __publicField2(_this, "RRNodeType", NodeType$1.Text);
        __publicField2(_this, "data");
        _this.data = data;
        return _this;
    }
    var _proto = BaseRRText.prototype;
    _proto.toString = function toString() {
        return "RRText text=" + JSON.stringify(this.data);
    };
    _create_class(BaseRRText, [
        {
            key: "textContent",
            get: function get() {
                return this.data;
            },
            set: function set(textContent2) {
                this.data = textContent2;
            }
        }
    ]);
    return BaseRRText;
}(BaseRRNode);
var BaseRRComment = /*#__PURE__*/ function(BaseRRNode) {
    _inherits(BaseRRComment, BaseRRNode);
    function BaseRRComment(data) {
        var _this;
        _this = BaseRRNode.call(this) || this;
        __publicField2(_this, "nodeType", 8);
        __publicField2(_this, "nodeName", "#comment");
        __publicField2(_this, "RRNodeType", NodeType$1.Comment);
        __publicField2(_this, "data");
        _this.data = data;
        return _this;
    }
    var _proto = BaseRRComment.prototype;
    _proto.toString = function toString() {
        return "RRComment text=" + JSON.stringify(this.data);
    };
    _create_class(BaseRRComment, [
        {
            key: "textContent",
            get: function get() {
                return this.data;
            },
            set: function set(textContent2) {
                this.data = textContent2;
            }
        }
    ]);
    return BaseRRComment;
}(BaseRRNode);
var BaseRRCDATASection = /*#__PURE__*/ function(BaseRRNode) {
    _inherits(BaseRRCDATASection, BaseRRNode);
    function BaseRRCDATASection(data) {
        var _this;
        _this = BaseRRNode.call(this) || this;
        __publicField2(_this, "nodeName", "#cdata-section");
        __publicField2(_this, "nodeType", 4);
        __publicField2(_this, "RRNodeType", NodeType$1.CDATA);
        __publicField2(_this, "data");
        _this.data = data;
        return _this;
    }
    var _proto = BaseRRCDATASection.prototype;
    _proto.toString = function toString() {
        return "RRCDATASection data=" + JSON.stringify(this.data);
    };
    _create_class(BaseRRCDATASection, [
        {
            key: "textContent",
            get: function get() {
                return this.data;
            },
            set: function set(textContent2) {
                this.data = textContent2;
            }
        }
    ]);
    return BaseRRCDATASection;
}(BaseRRNode);
var ClassList = function ClassList(classText, onChange) {
    var _this = this;
    __publicField2(this, "onChange");
    __publicField2(this, "classes", []);
    __publicField2(this, "add", function() {
        for(var _len = arguments.length, classNames = new Array(_len), _key = 0; _key < _len; _key++){
            classNames[_key] = arguments[_key];
        }
        for(var _iterator = _create_for_of_iterator_helper_loose(classNames), _step; !(_step = _iterator()).done;){
            var item = _step.value;
            var className = String(item);
            if (_this.classes.indexOf(className) >= 0) continue;
            _this.classes.push(className);
        }
        _this.onChange && _this.onChange(_this.classes.join(" "));
    });
    __publicField2(this, "remove", function() {
        for(var _len = arguments.length, classNames = new Array(_len), _key = 0; _key < _len; _key++){
            classNames[_key] = arguments[_key];
        }
        _this.classes = _this.classes.filter(function(item) {
            return classNames.indexOf(item) === -1;
        });
        _this.onChange && _this.onChange(_this.classes.join(" "));
    });
    if (classText) {
        var _this_classes;
        var classes = classText.trim().split(/\s+/);
        (_this_classes = this.classes).push.apply(_this_classes, [].concat(classes));
    }
    this.onChange = onChange;
};
function appendChild(parent, newChild) {
    if (newChild.parentNode) newChild.parentNode.removeChild(newChild);
    if (parent.lastChild) {
        parent.lastChild.nextSibling = newChild;
        newChild.previousSibling = parent.lastChild;
    } else {
        parent.firstChild = newChild;
        newChild.previousSibling = null;
    }
    parent.lastChild = newChild;
    newChild.nextSibling = null;
    newChild.parentNode = parent;
    newChild.parentElement = parent;
    newChild.ownerDocument = parent.ownerDocument;
    return newChild;
}
function insertBefore(parent, newChild, refChild) {
    if (!refChild) return appendChild(parent, newChild);
    if (refChild.parentNode !== parent) throw new Error("Failed to execute 'insertBefore' on 'RRNode': The RRNode before which the new node is to be inserted is not a child of this RRNode.");
    if (newChild === refChild) return newChild;
    if (newChild.parentNode) newChild.parentNode.removeChild(newChild);
    newChild.previousSibling = refChild.previousSibling;
    refChild.previousSibling = newChild;
    newChild.nextSibling = refChild;
    if (newChild.previousSibling) newChild.previousSibling.nextSibling = newChild;
    else parent.firstChild = newChild;
    newChild.parentElement = parent;
    newChild.parentNode = parent;
    newChild.ownerDocument = parent.ownerDocument;
    return newChild;
}
function removeChild(parent, child) {
    if (child.parentNode !== parent) throw new Error("Failed to execute 'removeChild' on 'RRNode': The RRNode to be removed is not a child of this RRNode.");
    if (child.previousSibling) child.previousSibling.nextSibling = child.nextSibling;
    else parent.firstChild = child.nextSibling;
    if (child.nextSibling) child.nextSibling.previousSibling = child.previousSibling;
    else parent.lastChild = child.previousSibling;
    child.previousSibling = null;
    child.nextSibling = null;
    child.parentElement = null;
    child.parentNode = null;
    return child;
}
var NodeType$2 = /* @__PURE__ */ function(NodeType2) {
    NodeType2[NodeType2["PLACEHOLDER"] = 0] = "PLACEHOLDER";
    NodeType2[NodeType2["ELEMENT_NODE"] = 1] = "ELEMENT_NODE";
    NodeType2[NodeType2["ATTRIBUTE_NODE"] = 2] = "ATTRIBUTE_NODE";
    NodeType2[NodeType2["TEXT_NODE"] = 3] = "TEXT_NODE";
    NodeType2[NodeType2["CDATA_SECTION_NODE"] = 4] = "CDATA_SECTION_NODE";
    NodeType2[NodeType2["ENTITY_REFERENCE_NODE"] = 5] = "ENTITY_REFERENCE_NODE";
    NodeType2[NodeType2["ENTITY_NODE"] = 6] = "ENTITY_NODE";
    NodeType2[NodeType2["PROCESSING_INSTRUCTION_NODE"] = 7] = "PROCESSING_INSTRUCTION_NODE";
    NodeType2[NodeType2["COMMENT_NODE"] = 8] = "COMMENT_NODE";
    NodeType2[NodeType2["DOCUMENT_NODE"] = 9] = "DOCUMENT_NODE";
    NodeType2[NodeType2["DOCUMENT_TYPE_NODE"] = 10] = "DOCUMENT_TYPE_NODE";
    NodeType2[NodeType2["DOCUMENT_FRAGMENT_NODE"] = 11] = "DOCUMENT_FRAGMENT_NODE";
    return NodeType2;
}(NodeType$2 || {});
var NAMESPACES = {
    svg: "http://www.w3.org/2000/svg",
    "xlink:href": "http://www.w3.org/1999/xlink",
    xmlns: "http://www.w3.org/2000/xmlns/"
};
var SVGTagMap = {
    altglyph: "altGlyph",
    altglyphdef: "altGlyphDef",
    altglyphitem: "altGlyphItem",
    animatecolor: "animateColor",
    animatemotion: "animateMotion",
    animatetransform: "animateTransform",
    clippath: "clipPath",
    feblend: "feBlend",
    fecolormatrix: "feColorMatrix",
    fecomponenttransfer: "feComponentTransfer",
    fecomposite: "feComposite",
    feconvolvematrix: "feConvolveMatrix",
    fediffuselighting: "feDiffuseLighting",
    fedisplacementmap: "feDisplacementMap",
    fedistantlight: "feDistantLight",
    fedropshadow: "feDropShadow",
    feflood: "feFlood",
    fefunca: "feFuncA",
    fefuncb: "feFuncB",
    fefuncg: "feFuncG",
    fefuncr: "feFuncR",
    fegaussianblur: "feGaussianBlur",
    feimage: "feImage",
    femerge: "feMerge",
    femergenode: "feMergeNode",
    femorphology: "feMorphology",
    feoffset: "feOffset",
    fepointlight: "fePointLight",
    fespecularlighting: "feSpecularLighting",
    fespotlight: "feSpotLight",
    fetile: "feTile",
    feturbulence: "feTurbulence",
    foreignobject: "foreignObject",
    glyphref: "glyphRef",
    lineargradient: "linearGradient",
    radialgradient: "radialGradient"
};
var createdNodeSet = null;
function diff(oldTree, newTree, replayer, rrnodeMirror) {
    if (rrnodeMirror === void 0) rrnodeMirror = newTree.mirror || newTree.ownerDocument.mirror;
    oldTree = diffBeforeUpdatingChildren(oldTree, newTree, replayer, rrnodeMirror);
    diffChildren(oldTree, newTree, replayer, rrnodeMirror);
    diffAfterUpdatingChildren(oldTree, newTree, replayer);
}
function diffBeforeUpdatingChildren(oldTree, newTree, replayer, rrnodeMirror) {
    var _a2;
    if (replayer.afterAppend && !createdNodeSet) {
        createdNodeSet = /* @__PURE__ */ new WeakSet();
        setTimeout(function() {
            createdNodeSet = null;
        }, 0);
    }
    if (!sameNodeType(oldTree, newTree)) {
        var calibratedOldTree = createOrGetNode(newTree, replayer.mirror, rrnodeMirror);
        (_a2 = oldTree.parentNode) == null ? void 0 : _a2.replaceChild(calibratedOldTree, oldTree);
        oldTree = calibratedOldTree;
    }
    switch(newTree.RRNodeType){
        case NodeType$1.Document:
            {
                if (!nodeMatching(oldTree, newTree, replayer.mirror, rrnodeMirror)) {
                    var newMeta = rrnodeMirror.getMeta(newTree);
                    if (newMeta) {
                        replayer.mirror.removeNodeFromMap(oldTree);
                        oldTree.close();
                        oldTree.open();
                        replayer.mirror.add(oldTree, newMeta);
                        createdNodeSet == null ? void 0 : createdNodeSet.add(oldTree);
                    }
                }
                break;
            }
        case NodeType$1.Element:
            {
                var oldElement = oldTree;
                var newRRElement = newTree;
                switch(newRRElement.tagName){
                    case "IFRAME":
                        {
                            var oldContentDocument = oldTree.contentDocument;
                            if (!oldContentDocument) break;
                            diff(oldContentDocument, newTree.contentDocument, replayer, rrnodeMirror);
                            break;
                        }
                }
                if (newRRElement.shadowRoot) {
                    if (!oldElement.shadowRoot) oldElement.attachShadow({
                        mode: "open"
                    });
                    diffChildren(// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    oldElement.shadowRoot, newRRElement.shadowRoot, replayer, rrnodeMirror);
                }
                diffProps(oldElement, newRRElement, rrnodeMirror);
                break;
            }
    }
    return oldTree;
}
function diffAfterUpdatingChildren(oldTree, newTree, replayer) {
    var _a2;
    switch(newTree.RRNodeType){
        case NodeType$1.Document:
            {
                var scrollData = newTree.scrollData;
                scrollData && replayer.applyScroll(scrollData, true);
                break;
            }
        case NodeType$1.Element:
            {
                var oldElement = oldTree;
                var newRRElement = newTree;
                newRRElement.scrollData && replayer.applyScroll(newRRElement.scrollData, true);
                newRRElement.inputData && replayer.applyInput(newRRElement.inputData);
                switch(newRRElement.tagName){
                    case "AUDIO":
                    case "VIDEO":
                        {
                            var oldMediaElement = oldTree;
                            var newMediaRRElement = newRRElement;
                            if (newMediaRRElement.paused !== void 0) newMediaRRElement.paused ? void oldMediaElement.pause() : void oldMediaElement.play();
                            if (newMediaRRElement.muted !== void 0) oldMediaElement.muted = newMediaRRElement.muted;
                            if (newMediaRRElement.volume !== void 0) oldMediaElement.volume = newMediaRRElement.volume;
                            if (newMediaRRElement.currentTime !== void 0) oldMediaElement.currentTime = newMediaRRElement.currentTime;
                            if (newMediaRRElement.playbackRate !== void 0) oldMediaElement.playbackRate = newMediaRRElement.playbackRate;
                            if (newMediaRRElement.loop !== void 0) oldMediaElement.loop = newMediaRRElement.loop;
                            break;
                        }
                    case "CANVAS":
                        {
                            var rrCanvasElement = newTree;
                            if (rrCanvasElement.rr_dataURL !== null) {
                                var image = document.createElement("img");
                                image.onload = function() {
                                    var ctx = oldElement.getContext("2d");
                                    if (ctx) {
                                        ctx.drawImage(image, 0, 0, image.width, image.height);
                                    }
                                };
                                image.src = rrCanvasElement.rr_dataURL;
                            }
                            rrCanvasElement.canvasMutations.forEach(function(canvasMutation2) {
                                return replayer.applyCanvas(canvasMutation2.event, canvasMutation2.mutation, oldTree);
                            });
                            break;
                        }
                    case "STYLE":
                        {
                            var styleSheet = oldElement.sheet;
                            styleSheet && newTree.rules.forEach(function(data) {
                                return replayer.applyStyleSheetMutation(data, styleSheet);
                            });
                            break;
                        }
                    case "DIALOG":
                        {
                            var dialog = oldElement;
                            var rrDialog = newRRElement;
                            var wasOpen = dialog.open;
                            var wasModal = dialog.matches("dialog:modal");
                            var shouldBeOpen = rrDialog.open;
                            var shouldBeModal = rrDialog.isModal;
                            var modalChanged = wasModal !== shouldBeModal;
                            var openChanged = wasOpen !== shouldBeOpen;
                            if (modalChanged || wasOpen && openChanged) dialog.close();
                            if (shouldBeOpen && (openChanged || modalChanged)) {
                                try {
                                    if (shouldBeModal) dialog.showModal();
                                    else dialog.show();
                                } catch (e2) {
                                    console.warn(e2);
                                }
                            }
                            break;
                        }
                }
                break;
            }
        case NodeType$1.Text:
        case NodeType$1.Comment:
        case NodeType$1.CDATA:
            {
                if (oldTree.textContent !== newTree.data) oldTree.textContent = newTree.data;
                break;
            }
    }
    if (createdNodeSet == null ? void 0 : createdNodeSet.has(oldTree)) {
        createdNodeSet.delete(oldTree);
        (_a2 = replayer.afterAppend) == null ? void 0 : _a2.call(replayer, oldTree, replayer.mirror.getId(oldTree));
    }
}
function diffProps(oldTree, newTree, rrnodeMirror) {
    var _loop = function(name) {
        var newValue = newAttributes[name];
        var sn = rrnodeMirror.getMeta(newTree);
        if ((sn == null ? void 0 : sn.isSVG) && NAMESPACES[name]) oldTree.setAttributeNS(NAMESPACES[name], name, newValue);
        else if (newTree.tagName === "CANVAS" && name === "rr_dataURL") {
            var image = document.createElement("img");
            image.src = newValue;
            image.onload = function() {
                var ctx = oldTree.getContext("2d");
                if (ctx) {
                    ctx.drawImage(image, 0, 0, image.width, image.height);
                }
            };
        } else if (newTree.tagName === "IFRAME" && name === "srcdoc") return "continue";
        else {
            try {
                oldTree.setAttribute(name, newValue);
            } catch (err) {
                console.warn(err);
            }
        }
    };
    var oldAttributes = oldTree.attributes;
    var newAttributes = newTree.attributes;
    for(var name in newAttributes)_loop(name);
    for(var _iterator = _create_for_of_iterator_helper_loose(Array.from(oldAttributes)), _step; !(_step = _iterator()).done;){
        var name1 = _step.value.name;
        if (!(name1 in newAttributes)) oldTree.removeAttribute(name1);
    }
    newTree.scrollLeft && (oldTree.scrollLeft = newTree.scrollLeft);
    newTree.scrollTop && (oldTree.scrollTop = newTree.scrollTop);
}
function diffChildren(oldTree, newTree, replayer, rrnodeMirror) {
    var oldChildren = Array.from(oldTree.childNodes);
    var newChildren = newTree.childNodes;
    if (oldChildren.length === 0 && newChildren.length === 0) return;
    var oldStartIndex = 0, oldEndIndex = oldChildren.length - 1, newStartIndex = 0, newEndIndex = newChildren.length - 1;
    var oldStartNode = oldChildren[oldStartIndex], oldEndNode = oldChildren[oldEndIndex], newStartNode = newChildren[newStartIndex], newEndNode = newChildren[newEndIndex];
    var oldIdToIndex = void 0, indexInOld = void 0;
    while(oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex){
        if (oldStartNode === void 0) {
            oldStartNode = oldChildren[++oldStartIndex];
        } else if (oldEndNode === void 0) {
            oldEndNode = oldChildren[--oldEndIndex];
        } else if (// same first node?
        nodeMatching(oldStartNode, newStartNode, replayer.mirror, rrnodeMirror)) {
            oldStartNode = oldChildren[++oldStartIndex];
            newStartNode = newChildren[++newStartIndex];
        } else if (// same last node?
        nodeMatching(oldEndNode, newEndNode, replayer.mirror, rrnodeMirror)) {
            oldEndNode = oldChildren[--oldEndIndex];
            newEndNode = newChildren[--newEndIndex];
        } else if (// is the first old node the same as the last new node?
        nodeMatching(oldStartNode, newEndNode, replayer.mirror, rrnodeMirror)) {
            try {
                oldTree.insertBefore(oldStartNode, oldEndNode.nextSibling);
            } catch (e2) {
                console.warn(e2);
            }
            oldStartNode = oldChildren[++oldStartIndex];
            newEndNode = newChildren[--newEndIndex];
        } else if (// is the last old node the same as the first new node?
        nodeMatching(oldEndNode, newStartNode, replayer.mirror, rrnodeMirror)) {
            try {
                oldTree.insertBefore(oldEndNode, oldStartNode);
            } catch (e2) {
                console.warn(e2);
            }
            oldEndNode = oldChildren[--oldEndIndex];
            newStartNode = newChildren[++newStartIndex];
        } else {
            if (!oldIdToIndex) {
                oldIdToIndex = {};
                for(var i2 = oldStartIndex; i2 <= oldEndIndex; i2++){
                    var oldChild2 = oldChildren[i2];
                    if (oldChild2 && replayer.mirror.hasNode(oldChild2)) oldIdToIndex[replayer.mirror.getId(oldChild2)] = i2;
                }
            }
            indexInOld = oldIdToIndex[rrnodeMirror.getId(newStartNode)];
            var nodeToMove = oldChildren[indexInOld];
            if (indexInOld !== void 0 && nodeToMove && nodeMatching(nodeToMove, newStartNode, replayer.mirror, rrnodeMirror)) {
                try {
                    oldTree.insertBefore(nodeToMove, oldStartNode);
                } catch (e2) {
                    console.warn(e2);
                }
                oldChildren[indexInOld] = void 0;
            } else {
                var newNode = createOrGetNode(newStartNode, replayer.mirror, rrnodeMirror);
                if (oldTree.nodeName === "#document" && oldStartNode && /**
        * Special case 1: one document isn't allowed to have two doctype nodes at the same time, so we need to remove the old one first before inserting the new one.
        * How this case happens: A parent document in the old tree already has a doctype node with an id e.g. #1. A new full snapshot rebuilds the replayer with a new doctype node with another id #2. According to the algorithm, the new doctype node will be inserted before the old one, which is not allowed by the Document standard.
        */ (newNode.nodeType === newNode.DOCUMENT_TYPE_NODE && oldStartNode.nodeType === oldStartNode.DOCUMENT_TYPE_NODE || /**
        * Special case 2: one document isn't allowed to have two HTMLElements at the same time, so we need to remove the old one first before inserting the new one.
        * How this case happens: A mounted iframe element has an automatically created HTML element. We should delete it before inserting a serialized one. Otherwise, an error 'Only one element on document allowed' will be thrown.
        */ newNode.nodeType === newNode.ELEMENT_NODE && oldStartNode.nodeType === oldStartNode.ELEMENT_NODE)) {
                    oldTree.removeChild(oldStartNode);
                    replayer.mirror.removeNodeFromMap(oldStartNode);
                    oldStartNode = oldChildren[++oldStartIndex];
                }
                try {
                    oldTree.insertBefore(newNode, oldStartNode || null);
                } catch (e2) {
                    console.warn(e2);
                }
            }
            newStartNode = newChildren[++newStartIndex];
        }
    }
    if (oldStartIndex > oldEndIndex) {
        var referenceRRNode = newChildren[newEndIndex + 1];
        var referenceNode = null;
        if (referenceRRNode) referenceNode = replayer.mirror.getNode(rrnodeMirror.getId(referenceRRNode));
        for(; newStartIndex <= newEndIndex; ++newStartIndex){
            var newNode1 = createOrGetNode(newChildren[newStartIndex], replayer.mirror, rrnodeMirror);
            try {
                oldTree.insertBefore(newNode1, referenceNode);
            } catch (e2) {
                console.warn(e2);
            }
        }
    } else if (newStartIndex > newEndIndex) {
        for(; oldStartIndex <= oldEndIndex; oldStartIndex++){
            var node2 = oldChildren[oldStartIndex];
            if (!node2 || node2.parentNode !== oldTree) continue;
            try {
                oldTree.removeChild(node2);
                replayer.mirror.removeNodeFromMap(node2);
            } catch (e2) {
                console.warn(e2);
            }
        }
    }
    var oldChild = oldTree.firstChild;
    var newChild = newTree.firstChild;
    while(oldChild !== null && newChild !== null){
        diff(oldChild, newChild, replayer, rrnodeMirror);
        oldChild = oldChild.nextSibling;
        newChild = newChild.nextSibling;
    }
}
function createOrGetNode(rrNode, domMirror, rrnodeMirror) {
    var nodeId = rrnodeMirror.getId(rrNode);
    var sn = rrnodeMirror.getMeta(rrNode);
    var node2 = null;
    if (nodeId > -1) node2 = domMirror.getNode(nodeId);
    if (node2 !== null && sameNodeType(node2, rrNode)) return node2;
    switch(rrNode.RRNodeType){
        case NodeType$1.Document:
            node2 = new Document();
            break;
        case NodeType$1.DocumentType:
            node2 = document.implementation.createDocumentType(rrNode.name, rrNode.publicId, rrNode.systemId);
            break;
        case NodeType$1.Element:
            {
                var tagName = rrNode.tagName.toLowerCase();
                tagName = SVGTagMap[tagName] || tagName;
                if (sn && "isSVG" in sn && (sn == null ? void 0 : sn.isSVG)) {
                    node2 = document.createElementNS(NAMESPACES["svg"], tagName);
                } else node2 = document.createElement(rrNode.tagName);
                break;
            }
        case NodeType$1.Text:
            node2 = document.createTextNode(rrNode.data);
            break;
        case NodeType$1.Comment:
            node2 = document.createComment(rrNode.data);
            break;
        case NodeType$1.CDATA:
            node2 = document.createCDATASection(rrNode.data);
            break;
    }
    if (sn) domMirror.add(node2, _extends({}, sn));
    try {
        createdNodeSet == null ? void 0 : createdNodeSet.add(node2);
    } catch (e2) {}
    return node2;
}
function sameNodeType(node1, node2) {
    if (node1.nodeType !== node2.nodeType) return false;
    return node1.nodeType !== node1.ELEMENT_NODE || node1.tagName.toUpperCase() === node2.tagName;
}
function nodeMatching(node1, node2, domMirror, rrdomMirror) {
    var node1Id = domMirror.getId(node1);
    var node2Id = rrdomMirror.getId(node2);
    if (node1Id === -1 || node1Id !== node2Id) return false;
    return sameNodeType(node1, node2);
}
var RRDocument = /*#__PURE__*/ function(BaseRRDocument) {
    _inherits(RRDocument, BaseRRDocument);
    function RRDocument(mirror2) {
        var _this;
        _this = BaseRRDocument.call(this) || this;
        __publicField2(_this, "UNSERIALIZED_STARTING_ID", -2);
        __publicField2(_this, "_unserializedId", _this.UNSERIALIZED_STARTING_ID);
        __publicField2(_this, "mirror", createMirror());
        __publicField2(_this, "scrollData", null);
        if (mirror2) {
            _this.mirror = mirror2;
        }
        return _this;
    }
    var _proto = RRDocument.prototype;
    _proto.createDocument = function createDocument(_namespace, _qualifiedName, _doctype) {
        return new RRDocument();
    };
    _proto.createDocumentType = function createDocumentType(qualifiedName, publicId, systemId) {
        var documentTypeNode = new RRDocumentType(qualifiedName, publicId, systemId);
        documentTypeNode.ownerDocument = this;
        return documentTypeNode;
    };
    _proto.createElement = function createElement(tagName) {
        var upperTagName = tagName.toUpperCase();
        var element;
        switch(upperTagName){
            case "AUDIO":
            case "VIDEO":
                element = new RRMediaElement(upperTagName);
                break;
            case "IFRAME":
                element = new RRIFrameElement(upperTagName, this.mirror);
                break;
            case "CANVAS":
                element = new RRCanvasElement(upperTagName);
                break;
            case "STYLE":
                element = new RRStyleElement(upperTagName);
                break;
            case "DIALOG":
                element = new RRDialogElement(upperTagName);
                break;
            default:
                element = new RRElement(upperTagName);
                break;
        }
        element.ownerDocument = this;
        return element;
    };
    _proto.createComment = function createComment(data) {
        var commentNode = new RRComment(data);
        commentNode.ownerDocument = this;
        return commentNode;
    };
    _proto.createCDATASection = function createCDATASection(data) {
        var sectionNode = new RRCDATASection(data);
        sectionNode.ownerDocument = this;
        return sectionNode;
    };
    _proto.createTextNode = function createTextNode(data) {
        var textNode = new RRText(data);
        textNode.ownerDocument = this;
        return textNode;
    };
    _proto.destroyTree = function destroyTree() {
        this.firstChild = null;
        this.lastChild = null;
        this.mirror.reset();
    };
    _proto.open = function open() {
        BaseRRDocument.prototype.open.call(this);
        this._unserializedId = this.UNSERIALIZED_STARTING_ID;
    };
    _create_class(RRDocument, [
        {
            key: "unserializedId",
            get: /**
   * Every time the id is used, it will minus 1 automatically to avoid collisions.
   */ function get() {
                return this._unserializedId--;
            }
        }
    ]);
    return RRDocument;
}(BaseRRDocument);
var RRDocumentType = BaseRRDocumentType;
var RRElement = /*#__PURE__*/ function(BaseRRElement) {
    _inherits(RRElement, BaseRRElement);
    function RRElement() {
        var _this;
        _this = BaseRRElement.apply(this, arguments) || this;
        __publicField2(_this, "inputData", null);
        __publicField2(_this, "scrollData", null);
        return _this;
    }
    return RRElement;
}(BaseRRElement);
var RRMediaElement = /*#__PURE__*/ function(BaseRRMediaElement) {
    _inherits(RRMediaElement, BaseRRMediaElement);
    function RRMediaElement() {
        return BaseRRMediaElement.apply(this, arguments) || this;
    }
    return RRMediaElement;
}(BaseRRMediaElement);
var RRDialogElement = /*#__PURE__*/ function(BaseRRDialogElement) {
    _inherits(RRDialogElement, BaseRRDialogElement);
    function RRDialogElement() {
        return BaseRRDialogElement.apply(this, arguments) || this;
    }
    return RRDialogElement;
}(BaseRRDialogElement);
var RRCanvasElement = /*#__PURE__*/ function(RRElement) {
    _inherits(RRCanvasElement, RRElement);
    function RRCanvasElement() {
        var _this;
        _this = RRElement.apply(this, arguments) || this;
        __publicField2(_this, "rr_dataURL", null);
        __publicField2(_this, "canvasMutations", []);
        return _this;
    }
    var _proto = RRCanvasElement.prototype;
    /**
   * This is a dummy implementation to distinguish RRCanvasElement from real HTMLCanvasElement.
   */ _proto.getContext = function getContext() {
        return null;
    };
    return RRCanvasElement;
}(RRElement);
var RRStyleElement = /*#__PURE__*/ function(RRElement) {
    _inherits(RRStyleElement, RRElement);
    function RRStyleElement() {
        var _this;
        _this = RRElement.apply(this, arguments) || this;
        __publicField2(_this, "rules", []);
        return _this;
    }
    return RRStyleElement;
}(RRElement);
var RRIFrameElement = /*#__PURE__*/ function(RRElement) {
    _inherits(RRIFrameElement, RRElement);
    function RRIFrameElement(upperTagName, mirror2) {
        var _this;
        _this = RRElement.call(this, upperTagName) || this;
        __publicField2(_this, "contentDocument", new RRDocument());
        _this.contentDocument.mirror = mirror2;
        return _this;
    }
    return RRIFrameElement;
}(RRElement);
var RRText = BaseRRText;
var RRComment = BaseRRComment;
var RRCDATASection = BaseRRCDATASection;
function getValidTagName(element) {
    if (_instanceof(element, HTMLFormElement)) {
        return "FORM";
    }
    return element.tagName.toUpperCase();
}
function buildFromNode(node2, rrdom, domMirror, parentRRNode) {
    var rrNode;
    switch(node2.nodeType){
        case NodeType$2.DOCUMENT_NODE:
            if (parentRRNode && parentRRNode.nodeName === "IFRAME") rrNode = parentRRNode.contentDocument;
            else {
                rrNode = rrdom;
                rrNode.compatMode = node2.compatMode;
            }
            break;
        case NodeType$2.DOCUMENT_TYPE_NODE:
            {
                var documentType = node2;
                rrNode = rrdom.createDocumentType(documentType.name, documentType.publicId, documentType.systemId);
                break;
            }
        case NodeType$2.ELEMENT_NODE:
            {
                var elementNode = node2;
                var tagName = getValidTagName(elementNode);
                rrNode = rrdom.createElement(tagName);
                var rrElement = rrNode;
                for(var _iterator = _create_for_of_iterator_helper_loose(Array.from(elementNode.attributes)), _step; !(_step = _iterator()).done;){
                    var _step_value = _step.value, name = _step_value.name, value = _step_value.value;
                    rrElement.attributes[name] = value;
                }
                elementNode.scrollLeft && (rrElement.scrollLeft = elementNode.scrollLeft);
                elementNode.scrollTop && (rrElement.scrollTop = elementNode.scrollTop);
                break;
            }
        case NodeType$2.TEXT_NODE:
            rrNode = rrdom.createTextNode(node2.textContent || "");
            break;
        case NodeType$2.CDATA_SECTION_NODE:
            rrNode = rrdom.createCDATASection(node2.data);
            break;
        case NodeType$2.COMMENT_NODE:
            rrNode = rrdom.createComment(node2.textContent || "");
            break;
        case NodeType$2.DOCUMENT_FRAGMENT_NODE:
            rrNode = parentRRNode.attachShadow({
                mode: "open"
            });
            break;
        default:
            return null;
    }
    var sn = domMirror.getMeta(node2);
    if (_instanceof(rrdom, RRDocument)) {
        if (!sn) {
            sn = getDefaultSN(rrNode, rrdom.unserializedId);
            domMirror.add(node2, sn);
        }
        rrdom.mirror.add(rrNode, _extends({}, sn));
    }
    return rrNode;
}
function buildFromDom(dom, domMirror, rrdom) {
    if (domMirror === void 0) domMirror = createMirror$1();
    if (rrdom === void 0) rrdom = new RRDocument();
    function walk2(node2, parentRRNode) {
        var rrNode = buildFromNode(node2, rrdom, domMirror, parentRRNode);
        if (rrNode === null) return;
        if (// if the parentRRNode isn't a RRIFrameElement
        (parentRRNode == null ? void 0 : parentRRNode.nodeName) !== "IFRAME" && // if node isn't a shadow root
        node2.nodeType !== NodeType$2.DOCUMENT_FRAGMENT_NODE) {
            parentRRNode == null ? void 0 : parentRRNode.appendChild(rrNode);
            rrNode.parentNode = parentRRNode;
            rrNode.parentElement = parentRRNode;
        }
        if (node2.nodeName === "IFRAME") {
            var iframeDoc = node2.contentDocument;
            iframeDoc && walk2(iframeDoc, rrNode);
        } else if (node2.nodeType === NodeType$2.DOCUMENT_NODE || node2.nodeType === NodeType$2.ELEMENT_NODE || node2.nodeType === NodeType$2.DOCUMENT_FRAGMENT_NODE) {
            if (node2.nodeType === NodeType$2.ELEMENT_NODE && node2.shadowRoot) walk2(node2.shadowRoot, rrNode);
            node2.childNodes.forEach(function(childNode) {
                return walk2(childNode, rrNode);
            });
        }
    }
    walk2(dom, null);
    return rrdom;
}
function createMirror() {
    return new Mirror22();
}
var Mirror22 = /*#__PURE__*/ function() {
    function Mirror22() {
        __publicField2(this, "idNodeMap", /* @__PURE__ */ new Map());
        __publicField2(this, "nodeMetaMap", /* @__PURE__ */ new WeakMap());
    }
    var _proto = Mirror22.prototype;
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
    return Mirror22;
}();
function getDefaultSN(node2, id) {
    switch(node2.RRNodeType){
        case NodeType$1.Document:
            return {
                id: id,
                type: node2.RRNodeType,
                childNodes: []
            };
        case NodeType$1.DocumentType:
            {
                var doctype = node2;
                return {
                    id: id,
                    type: node2.RRNodeType,
                    name: doctype.name,
                    publicId: doctype.publicId,
                    systemId: doctype.systemId
                };
            }
        case NodeType$1.Element:
            return {
                id: id,
                type: node2.RRNodeType,
                tagName: node2.tagName.toLowerCase(),
                // In rrweb data, all tagNames are lowercase.
                attributes: {},
                childNodes: []
            };
        case NodeType$1.Text:
            return {
                id: id,
                type: node2.RRNodeType,
                textContent: node2.textContent || ""
            };
        case NodeType$1.Comment:
            return {
                id: id,
                type: node2.RRNodeType,
                textContent: node2.textContent || ""
            };
        case NodeType$1.CDATA:
            return {
                id: id,
                type: node2.RRNodeType,
                textContent: ""
            };
    }
}
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
        var _a2, _b;
        return Boolean((_b = (_a2 = Object.getOwnPropertyDescriptor(defaultPrototype, accessor)) == null ? void 0 : _a2.get) == null ? void 0 : _b.toString().includes("[native code]"));
    }));
    var methodNames = key in testableMethods ? testableMethods[key] : void 0;
    var isUntaintedMethods = Boolean(methodNames && methodNames.every(// @ts-expect-error 2345
    function(method) {
        var _a2;
        return typeof defaultPrototype[method] === "function" && ((_a2 = defaultPrototype[method]) == null ? void 0 : _a2.toString().includes("[native code]"));
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
    var _a2;
    var cacheKey = key + "." + String(accessor);
    if (untaintedAccessorCache[cacheKey]) return untaintedAccessorCache[cacheKey].call(instance);
    var untaintedPrototype = getUntaintedPrototype(key);
    var untaintedAccessor = (_a2 = Object.getOwnPropertyDescriptor(untaintedPrototype, accessor)) == null ? void 0 : _a2.get;
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
function childNodes(n2) {
    return getUntaintedAccessor("Node", n2, "childNodes");
}
function parentNode(n2) {
    return getUntaintedAccessor("Node", n2, "parentNode");
}
function parentElement(n2) {
    return getUntaintedAccessor("Node", n2, "parentElement");
}
function textContent(n2) {
    return getUntaintedAccessor("Node", n2, "textContent");
}
function contains(n2, other) {
    return getUntaintedMethod("Node", n2, "contains")(other);
}
function getRootNode(n2) {
    return getUntaintedMethod("Node", n2, "getRootNode")();
}
function host(n2) {
    if (!n2 || !("host" in n2)) return null;
    return getUntaintedAccessor("ShadowRoot", n2, "host");
}
function styleSheets(n2) {
    return n2.styleSheets;
}
function shadowRoot(n2) {
    if (!n2 || !("shadowRoot" in n2)) return null;
    return getUntaintedAccessor("Element", n2, "shadowRoot");
}
function querySelector(n2, selectors) {
    return getUntaintedAccessor("Element", n2, "querySelector")(selectors);
}
function querySelectorAll(n2, selectors) {
    return getUntaintedAccessor("Element", n2, "querySelectorAll")(selectors);
}
function mutationObserverCtor() {
    return getUntaintedPrototype("MutationObserver").constructor;
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
    mutationObserver: mutationObserverCtor
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
        left: doc.scrollingElement ? doc.scrollingElement.scrollLeft : win.pageXOffset !== void 0 ? win.pageXOffset : doc.documentElement.scrollLeft || (doc == null ? void 0 : doc.body) && ((_a2 = index.parentElement(doc.body)) == null ? void 0 : _a2.scrollLeft) || ((_b = doc == null ? void 0 : doc.body) == null ? void 0 : _b.scrollLeft) || 0,
        top: doc.scrollingElement ? doc.scrollingElement.scrollTop : win.pageYOffset !== void 0 ? win.pageYOffset : (doc == null ? void 0 : doc.documentElement.scrollTop) || (doc == null ? void 0 : doc.body) && ((_c = index.parentElement(doc.body)) == null ? void 0 : _c.scrollTop) || ((_d = doc == null ? void 0 : doc.body) == null ? void 0 : _d.scrollTop) || 0
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
    var el = node2.nodeType === node2.ELEMENT_NODE ? node2 : index.parentElement(node2);
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
            if (classMatchesRegex(el, blockClass, checkAncestors)) return true;
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
    var parent = index.parentNode(target);
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
function queueToResolveTrees(queue) {
    var queueNodeMap = {};
    var putIntoMap = function(m, parent) {
        var nodeInTree = {
            value: m,
            parent: parent,
            children: []
        };
        queueNodeMap[m.node.id] = nodeInTree;
        return nodeInTree;
    };
    var queueNodeTrees = [];
    for(var _iterator = _create_for_of_iterator_helper_loose(queue), _step; !(_step = _iterator()).done;){
        var mutation = _step.value;
        var nextId = mutation.nextId, parentId = mutation.parentId;
        if (nextId && nextId in queueNodeMap) {
            var nextInTree = queueNodeMap[nextId];
            if (nextInTree.parent) {
                var idx = nextInTree.parent.children.indexOf(nextInTree);
                nextInTree.parent.children.splice(idx, 0, putIntoMap(mutation, nextInTree.parent));
            } else {
                var idx1 = queueNodeTrees.indexOf(nextInTree);
                queueNodeTrees.splice(idx1, 0, putIntoMap(mutation, null));
            }
            continue;
        }
        if (parentId in queueNodeMap) {
            var parentInTree = queueNodeMap[parentId];
            parentInTree.children.push(putIntoMap(mutation, parentInTree));
            continue;
        }
        queueNodeTrees.push(putIntoMap(mutation, null));
    }
    return queueNodeTrees;
}
function iterateResolveTree(tree, cb) {
    cb(tree.value);
    for(var i2 = tree.children.length - 1; i2 >= 0; i2--){
        iterateResolveTree(tree.children[i2], cb);
    }
}
function isSerializedIframe(n2, mirror2) {
    return Boolean(n2.nodeName === "IFRAME" && mirror2.getMeta(n2));
}
function isSerializedStylesheet(n2, mirror2) {
    return Boolean(n2.nodeName === "LINK" && n2.nodeType === n2.ELEMENT_NODE && n2.getAttribute && n2.getAttribute("rel") === "stylesheet" && mirror2.getMeta(n2));
}
function getBaseDimension(node2, rootIframe) {
    var _a2, _b;
    var frameElement = (_b = (_a2 = node2.ownerDocument) == null ? void 0 : _a2.defaultView) == null ? void 0 : _b.frameElement;
    if (!frameElement || frameElement === rootIframe) {
        return {
            x: 0,
            y: 0,
            relativeScale: 1,
            absoluteScale: 1
        };
    }
    var frameDimension = frameElement.getBoundingClientRect();
    var frameBaseDimension = getBaseDimension(frameElement, rootIframe);
    var relativeScale = frameDimension.height / frameElement.clientHeight;
    return {
        x: frameDimension.x * frameBaseDimension.relativeScale + frameBaseDimension.x,
        y: frameDimension.y * frameBaseDimension.relativeScale + frameBaseDimension.y,
        relativeScale: relativeScale,
        absoluteScale: frameBaseDimension.absoluteScale * relativeScale
    };
}
function hasShadowRoot(n2) {
    if (!n2) return false;
    if (_instanceof(n2, BaseRRNode) && "shadowRoot" in n2) {
        return Boolean(n2.shadowRoot);
    }
    return Boolean(index.shadowRoot(n2));
}
function getNestedRule(rules2, position) {
    var rule2 = rules2[position[0]];
    if (position.length === 1) {
        return rule2;
    } else {
        return getNestedRule(rule2.cssRules[position[1]].cssRules, position.slice(2));
    }
}
function getPositionsAndIndex(nestedIndex) {
    var positions = [].concat(nestedIndex);
    var index2 = positions.pop();
    return {
        positions: positions,
        index: index2
    };
}
function uniqueTextMutations(mutations) {
    var idSet = /* @__PURE__ */ new Set();
    var uniqueMutations = [];
    for(var i2 = mutations.length; i2--;){
        var mutation = mutations[i2];
        if (!idSet.has(mutation.id)) {
            uniqueMutations.push(mutation);
            idSet.add(mutation.id);
        }
    }
    return uniqueMutations;
}
var StyleSheetMirror = /*#__PURE__*/ function() {
    function StyleSheetMirror() {
        __publicField(this, "id", 1);
        __publicField(this, "styleIDMap", /* @__PURE__ */ new WeakMap());
        __publicField(this, "idStyleMap", /* @__PURE__ */ new Map());
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
    if ("getRootNode" in n2 && ((_a2 = index.getRootNode(n2)) == null ? void 0 : _a2.nodeType) === Node.DOCUMENT_FRAGMENT_NODE && index.host(index.getRootNode(n2))) shadowHost = index.host(index.getRootNode(n2));
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
    return index.contains(doc, shadowHost);
}
function inDom(n2) {
    var doc = n2.ownerDocument;
    if (!doc) return false;
    return index.contains(doc, n2) || shadowHostInDom(n2);
}
var utils = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
    __proto__: null,
    StyleSheetMirror: StyleSheetMirror,
    get _mirror () {
        return _mirror;
    },
    closestElementOfNode: closestElementOfNode,
    getBaseDimension: getBaseDimension,
    getNestedRule: getNestedRule,
    getPositionsAndIndex: getPositionsAndIndex,
    getRootShadowHost: getRootShadowHost,
    getShadowHost: getShadowHost,
    getWindowHeight: getWindowHeight,
    getWindowScroll: getWindowScroll,
    getWindowWidth: getWindowWidth,
    hasShadowRoot: hasShadowRoot,
    hookSetter: hookSetter,
    inDom: inDom,
    isAncestorRemoved: isAncestorRemoved,
    isBlocked: isBlocked,
    isIgnored: isIgnored,
    isSerialized: isSerialized,
    isSerializedIframe: isSerializedIframe,
    isSerializedStylesheet: isSerializedStylesheet,
    iterateResolveTree: iterateResolveTree,
    legacy_isTouchEvent: legacy_isTouchEvent,
    get nowTimestamp () {
        return nowTimestamp;
    },
    on: on,
    patch: patch,
    polyfill: polyfill$1,
    queueToResolveTrees: queueToResolveTrees,
    shadowHostInDom: shadowHostInDom,
    throttle: throttle,
    uniqueTextMutations: uniqueTextMutations
}, Symbol.toStringTag, {
    value: "Module"
}));
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
var ReplayerEvents = /* @__PURE__ */ function(ReplayerEvents2) {
    ReplayerEvents2["Start"] = "start";
    ReplayerEvents2["Pause"] = "pause";
    ReplayerEvents2["Resume"] = "resume";
    ReplayerEvents2["Resize"] = "resize";
    ReplayerEvents2["Finish"] = "finish";
    ReplayerEvents2["FullsnapshotRebuilded"] = "fullsnapshot-rebuilded";
    ReplayerEvents2["LoadStylesheetStart"] = "load-stylesheet-start";
    ReplayerEvents2["LoadStylesheetEnd"] = "load-stylesheet-end";
    ReplayerEvents2["SkipStart"] = "skip-start";
    ReplayerEvents2["SkipEnd"] = "skip-end";
    ReplayerEvents2["MouseInteraction"] = "mouse-interaction";
    ReplayerEvents2["EventCast"] = "event-cast";
    ReplayerEvents2["CustomEvent"] = "custom-event";
    ReplayerEvents2["Flush"] = "flush";
    ReplayerEvents2["StateChange"] = "state-change";
    ReplayerEvents2["PlayBack"] = "play-back";
    ReplayerEvents2["Destroy"] = "destroy";
    return ReplayerEvents2;
}(ReplayerEvents || {});
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
        __publicField(this, "length", 0);
        __publicField(this, "head", null);
        __publicField(this, "tail", null);
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
        __publicField(this, "frozen", false);
        __publicField(this, "locked", false);
        __publicField(this, "texts", []);
        __publicField(this, "attributes", []);
        __publicField(this, "attributeMap", /* @__PURE__ */ new WeakMap());
        __publicField(this, "removes", []);
        __publicField(this, "mapRemoves", []);
        __publicField(this, "movedMap", {});
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
     */ __publicField(this, "addedSet", /* @__PURE__ */ new Set());
        __publicField(this, "movedSet", /* @__PURE__ */ new Set());
        __publicField(this, "droppedSet", /* @__PURE__ */ new Set());
        __publicField(this, "removesSubTreeCache", /* @__PURE__ */ new Set());
        __publicField(this, "mutationCb");
        __publicField(this, "blockClass");
        __publicField(this, "blockSelector");
        __publicField(this, "maskTextClass");
        __publicField(this, "maskTextSelector");
        __publicField(this, "inlineStylesheet");
        __publicField(this, "maskInputOptions");
        __publicField(this, "maskTextFn");
        __publicField(this, "maskInputFn");
        __publicField(this, "keepIframeSrcFn");
        __publicField(this, "recordCanvas");
        __publicField(this, "inlineImages");
        __publicField(this, "slimDOMOptions");
        __publicField(this, "dataURLOptions");
        __publicField(this, "doc");
        __publicField(this, "mirror");
        __publicField(this, "iframeManager");
        __publicField(this, "stylesheetManager");
        __publicField(this, "shadowDomManager");
        __publicField(this, "canvasManager");
        __publicField(this, "processedNodeManager");
        __publicField(this, "unattachedDoc");
        __publicField(this, "processMutations", function(mutations) {
            mutations.forEach(_this.processMutation);
            _this.emit();
        });
        __publicField(this, "emit", function() {
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
                var parent = index.parentNode(n2);
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
                            _this.shadowDomManager.addShadowRoot(index.shadowRoot(n2), _this.doc);
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
                if (isParentRemoved(_this.removesSubTreeCache, n2, _this.mirror) && !_this.movedSet.has(index.parentNode(n2))) {
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
                    var parentId = _this.mirror.getId(index.parentNode(candidate.value));
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
                            var parentId1 = _this.mirror.getId(index.parentNode(_node.value));
                            var nextId1 = getNextId(_node.value);
                            if (nextId1 === -1) continue;
                            else if (parentId1 !== -1) {
                                node2 = _node;
                                break;
                            } else {
                                var unhandledNode = _node.value;
                                var parent = index.parentNode(unhandledNode);
                                if (parent && parent.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
                                    var shadowHost = index.host(parent);
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
                    var parent = index.parentNode(n2);
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
        __publicField(this, "genTextAreaValueMutation", function(textarea) {
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
            item.attributes.value = Array.from(index.childNodes(textarea), function(cn) {
                return index.textContent(cn) || "";
            }).join("");
        });
        __publicField(this, "processMutation", function(m) {
            if (isIgnored(m.target, _this.mirror, _this.slimDOMOptions)) {
                return;
            }
            switch(m.type){
                case "characterData":
                    {
                        var value = index.textContent(m.target);
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
                            var parentId = isShadowRoot(m.target) ? _this.mirror.getId(index.host(m.target)) : _this.mirror.getId(m.target);
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
     * */ __publicField(this, "genAdds", function(n2, target) {
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
                index.childNodes(n2).forEach(function(childN) {
                    return _this.genAdds(childN);
                });
                if (hasShadowRoot(n2)) {
                    index.childNodes(index.shadowRoot(n2)).forEach(function(childN) {
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
    index.childNodes(n2).forEach(function(childN) {
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
        index.childNodes(next).forEach(function(n22) {
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
    var node2 = index.parentNode(n2);
    if (!node2) return false;
    return removes.has(node2);
}
function isAncestorInSet(set, n2) {
    if (set.size === 0) return false;
    return _isAncestorInSet(set, n2);
}
function _isAncestorInSet(set, n2) {
    var parent = index.parentNode(n2);
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
    var observer = new (mutationObserverCtor())(callbackWrapper(mutationBuffer.processMutations.bind(mutationBuffer)));
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
            target = index.parentElement(target);
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
    else hostId = mirror2.getId(index.host(host2));
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
    var restoreHandler = patch(doc.fonts, "add", function(original) {
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
    var restoreHandler = patch(win.customElements, "define", function(original) {
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
        __publicField(this, "iframeIdToRemoteIdMap", /* @__PURE__ */ new WeakMap());
        __publicField(this, "iframeRemoteIdToIdMap", /* @__PURE__ */ new WeakMap());
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
        __publicField(this, "iframes", /* @__PURE__ */ new WeakMap());
        __publicField(this, "crossOriginIframeMap", /* @__PURE__ */ new WeakMap());
        __publicField(this, "crossOriginIframeMirror", new CrossOriginIframeMirror(genId));
        __publicField(this, "crossOriginIframeStyleMirror");
        __publicField(this, "crossOriginIframeRootIdMap", /* @__PURE__ */ new WeakMap());
        __publicField(this, "mirror");
        __publicField(this, "mutationCb");
        __publicField(this, "wrappedEmit");
        __publicField(this, "loadListener");
        __publicField(this, "stylesheetManager");
        __publicField(this, "recordCrossOriginIframes");
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
        __publicField(this, "shadowDoms", /* @__PURE__ */ new WeakSet());
        __publicField(this, "mutationCb");
        __publicField(this, "scrollCb");
        __publicField(this, "bypassOptions");
        __publicField(this, "mirror");
        __publicField(this, "restoreHandlers", []);
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
            if (shadowRoot2.adoptedStyleSheets && shadowRoot2.adoptedStyleSheets.length > 0) _this.bypassOptions.stylesheetManager.adoptStyleSheets(shadowRoot2.adoptedStyleSheets, _this.mirror.getId(index.host(shadowRoot2)));
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
        this.restoreHandlers.push(patch(element.prototype, "attachShadow", function(original) {
            return function(option) {
                var sRoot = original.call(this, option);
                var shadowRootEl = index.shadowRoot(this);
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
var decode = function decode(base64) {
    var bufferLength = base64.length * 0.75, len = base64.length, i2, p = 0, encoded1, encoded2, encoded3, encoded4;
    if (base64[base64.length - 1] === "=") {
        bufferLength--;
        if (base64[base64.length - 2] === "=") {
            bufferLength--;
        }
    }
    var arraybuffer = new ArrayBuffer(bufferLength), bytes = new Uint8Array(arraybuffer);
    for(i2 = 0; i2 < len; i2 += 4){
        encoded1 = lookup[base64.charCodeAt(i2)];
        encoded2 = lookup[base64.charCodeAt(i2 + 1)];
        encoded3 = lookup[base64.charCodeAt(i2 + 2)];
        encoded4 = lookup[base64.charCodeAt(i2 + 3)];
        bytes[p++] = encoded1 << 2 | encoded2 >> 4;
        bytes[p++] = (encoded2 & 15) << 4 | encoded3 >> 2;
        bytes[p++] = (encoded3 & 3) << 6 | encoded4 & 63;
    }
    return arraybuffer;
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
            var restoreHandler = patch(win.CanvasRenderingContext2D.prototype, prop, function(original) {
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
        var restoreHandler = patch(win.HTMLCanvasElement.prototype, "getContext", function(original) {
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
            var restoreHandler = patch(prototype, prop, function(original) {
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
        __publicField(this, "pendingCanvasMutations", /* @__PURE__ */ new Map());
        __publicField(this, "rafStamps", {
            latestId: 0,
            invokeId: null
        });
        __publicField(this, "mirror");
        __publicField(this, "mutationCb");
        __publicField(this, "resetObservers");
        __publicField(this, "frozen", false);
        __publicField(this, "locked", false);
        __publicField(this, "processMutation", function(target, mutation) {
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
        __publicField(this, "trackedLinkElements", /* @__PURE__ */ new WeakSet());
        __publicField(this, "mutationCb");
        __publicField(this, "adoptedStyleSheetCb");
        __publicField(this, "styleMirror", new StyleSheetMirror());
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
        __publicField(this, "nodeMap", /* @__PURE__ */ new WeakMap());
        __publicField(this, "active", false);
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
        password: true
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
                    shadowDomManager.addShadowRoot(index.shadowRoot(n2), document);
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
            handlers.forEach(function(h) {
                return h();
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
function mitt$1(n2) {
    return {
        all: n2 = n2 || /* @__PURE__ */ new Map(),
        on: function on(t2, e2) {
            var i2 = n2.get(t2);
            i2 ? i2.push(e2) : n2.set(t2, [
                e2
            ]);
        },
        off: function off(t2, e2) {
            var i2 = n2.get(t2);
            i2 && (e2 ? i2.splice(i2.indexOf(e2) >>> 0, 1) : n2.set(t2, []));
        },
        emit: function emit(t2, e2) {
            var i2 = n2.get(t2);
            i2 && i2.slice().map(function(n3) {
                n3(e2);
            }), (i2 = n2.get("*")) && i2.slice().map(function(n3) {
                n3(t2, e2);
            });
        }
    };
}
var mittProxy = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
    __proto__: null,
    default: mitt$1
}, Symbol.toStringTag, {
    value: "Module"
}));
function polyfill(w, d) {
    if (w === void 0) w = window;
    if (d === void 0) d = document;
    if ("scrollBehavior" in d.documentElement.style && w.__forceSmoothScrollPolyfill__ !== true) {
        return;
    }
    var Element2 = w.HTMLElement || w.Element;
    var SCROLL_TIME = 468;
    var original = {
        scroll: w.scroll || w.scrollTo,
        scrollBy: w.scrollBy,
        elementScroll: Element2.prototype.scroll || scrollElement,
        scrollIntoView: Element2.prototype.scrollIntoView
    };
    var now = w.performance && w.performance.now ? w.performance.now.bind(w.performance) : Date.now;
    function isMicrosoftBrowser(userAgent) {
        var userAgentPatterns = [
            "MSIE ",
            "Trident/",
            "Edge/"
        ];
        return new RegExp(userAgentPatterns.join("|")).test(userAgent);
    }
    var ROUNDING_TOLERANCE = isMicrosoftBrowser(w.navigator.userAgent) ? 1 : 0;
    function scrollElement(x2, y) {
        this.scrollLeft = x2;
        this.scrollTop = y;
    }
    function ease(k) {
        return 0.5 * (1 - Math.cos(Math.PI * k));
    }
    function shouldBailOut(firstArg) {
        if (firstArg === null || (typeof firstArg === "undefined" ? "undefined" : _type_of(firstArg)) !== "object" || firstArg.behavior === void 0 || firstArg.behavior === "auto" || firstArg.behavior === "instant") {
            return true;
        }
        if ((typeof firstArg === "undefined" ? "undefined" : _type_of(firstArg)) === "object" && firstArg.behavior === "smooth") {
            return false;
        }
        throw new TypeError("behavior member of ScrollOptions " + firstArg.behavior + " is not a valid value for enumeration ScrollBehavior.");
    }
    function hasScrollableSpace(el, axis) {
        if (axis === "Y") {
            return el.clientHeight + ROUNDING_TOLERANCE < el.scrollHeight;
        }
        if (axis === "X") {
            return el.clientWidth + ROUNDING_TOLERANCE < el.scrollWidth;
        }
    }
    function canOverflow(el, axis) {
        var overflowValue = w.getComputedStyle(el, null)["overflow" + axis];
        return overflowValue === "auto" || overflowValue === "scroll";
    }
    function isScrollable(el) {
        var isScrollableY = hasScrollableSpace(el, "Y") && canOverflow(el, "Y");
        var isScrollableX = hasScrollableSpace(el, "X") && canOverflow(el, "X");
        return isScrollableY || isScrollableX;
    }
    function findScrollableParent(el) {
        while(el !== d.body && isScrollable(el) === false){
            el = el.parentNode || el.host;
        }
        return el;
    }
    function step(context) {
        var time = now();
        var value;
        var currentX;
        var currentY;
        var elapsed = (time - context.startTime) / SCROLL_TIME;
        elapsed = elapsed > 1 ? 1 : elapsed;
        value = ease(elapsed);
        currentX = context.startX + (context.x - context.startX) * value;
        currentY = context.startY + (context.y - context.startY) * value;
        context.method.call(context.scrollable, currentX, currentY);
        if (currentX !== context.x || currentY !== context.y) {
            w.requestAnimationFrame(step.bind(w, context));
        }
    }
    function smoothScroll(el, x2, y) {
        var scrollable;
        var startX;
        var startY;
        var method;
        var startTime = now();
        if (el === d.body) {
            scrollable = w;
            startX = w.scrollX || w.pageXOffset;
            startY = w.scrollY || w.pageYOffset;
            method = original.scroll;
        } else {
            scrollable = el;
            startX = el.scrollLeft;
            startY = el.scrollTop;
            method = scrollElement;
        }
        step({
            scrollable: scrollable,
            method: method,
            startTime: startTime,
            startX: startX,
            startY: startY,
            x: x2,
            y: y
        });
    }
    w.scroll = w.scrollTo = function() {
        if (arguments[0] === void 0) {
            return;
        }
        if (shouldBailOut(arguments[0]) === true) {
            original.scroll.call(w, arguments[0].left !== void 0 ? arguments[0].left : _type_of(arguments[0]) !== "object" ? arguments[0] : w.scrollX || w.pageXOffset, // use top prop, second argument if present or fallback to scrollY
            arguments[0].top !== void 0 ? arguments[0].top : arguments[1] !== void 0 ? arguments[1] : w.scrollY || w.pageYOffset);
            return;
        }
        smoothScroll.call(w, d.body, arguments[0].left !== void 0 ? ~~arguments[0].left : w.scrollX || w.pageXOffset, arguments[0].top !== void 0 ? ~~arguments[0].top : w.scrollY || w.pageYOffset);
    };
    w.scrollBy = function() {
        if (arguments[0] === void 0) {
            return;
        }
        if (shouldBailOut(arguments[0])) {
            original.scrollBy.call(w, arguments[0].left !== void 0 ? arguments[0].left : _type_of(arguments[0]) !== "object" ? arguments[0] : 0, arguments[0].top !== void 0 ? arguments[0].top : arguments[1] !== void 0 ? arguments[1] : 0);
            return;
        }
        smoothScroll.call(w, d.body, ~~arguments[0].left + (w.scrollX || w.pageXOffset), ~~arguments[0].top + (w.scrollY || w.pageYOffset));
    };
    Element2.prototype.scroll = Element2.prototype.scrollTo = function() {
        if (arguments[0] === void 0) {
            return;
        }
        if (shouldBailOut(arguments[0]) === true) {
            if (typeof arguments[0] === "number" && arguments[1] === void 0) {
                throw new SyntaxError("Value could not be converted");
            }
            original.elementScroll.call(this, // use left prop, first number argument or fallback to scrollLeft
            arguments[0].left !== void 0 ? ~~arguments[0].left : _type_of(arguments[0]) !== "object" ? ~~arguments[0] : this.scrollLeft, // use top prop, second argument or fallback to scrollTop
            arguments[0].top !== void 0 ? ~~arguments[0].top : arguments[1] !== void 0 ? ~~arguments[1] : this.scrollTop);
            return;
        }
        var left = arguments[0].left;
        var top = arguments[0].top;
        smoothScroll.call(this, this, typeof left === "undefined" ? this.scrollLeft : ~~left, typeof top === "undefined" ? this.scrollTop : ~~top);
    };
    Element2.prototype.scrollBy = function() {
        if (arguments[0] === void 0) {
            return;
        }
        if (shouldBailOut(arguments[0]) === true) {
            original.elementScroll.call(this, arguments[0].left !== void 0 ? ~~arguments[0].left + this.scrollLeft : ~~arguments[0] + this.scrollLeft, arguments[0].top !== void 0 ? ~~arguments[0].top + this.scrollTop : ~~arguments[1] + this.scrollTop);
            return;
        }
        this.scroll({
            left: ~~arguments[0].left + this.scrollLeft,
            top: ~~arguments[0].top + this.scrollTop,
            behavior: arguments[0].behavior
        });
    };
    Element2.prototype.scrollIntoView = function() {
        if (shouldBailOut(arguments[0]) === true) {
            original.scrollIntoView.call(this, arguments[0] === void 0 ? true : arguments[0]);
            return;
        }
        var scrollableParent = findScrollableParent(this);
        var parentRects = scrollableParent.getBoundingClientRect();
        var clientRects = this.getBoundingClientRect();
        if (scrollableParent !== d.body) {
            smoothScroll.call(this, scrollableParent, scrollableParent.scrollLeft + clientRects.left - parentRects.left, scrollableParent.scrollTop + clientRects.top - parentRects.top);
            if (w.getComputedStyle(scrollableParent).position !== "fixed") {
                w.scrollBy({
                    left: parentRects.left,
                    top: parentRects.top,
                    behavior: "smooth"
                });
            }
        } else {
            w.scrollBy({
                left: clientRects.left,
                top: clientRects.top,
                behavior: "smooth"
            });
        }
    };
}
var Timer = /*#__PURE__*/ function() {
    function Timer(actions, config) {
        if (actions === void 0) actions = [];
        __publicField(this, "timeOffset", 0);
        __publicField(this, "speed");
        __publicField(this, "actions");
        __publicField(this, "raf", null);
        __publicField(this, "lastTimestamp");
        this.actions = actions;
        this.speed = config.speed;
    }
    var _proto = Timer.prototype;
    /**
   * Add an action, possibly after the timer starts.
   */ _proto.addAction = function addAction(action) {
        var rafWasActive = this.raf === true;
        if (!this.actions.length || this.actions[this.actions.length - 1].delay <= action.delay) {
            this.actions.push(action);
        } else {
            var index2 = this.findActionIndex(action);
            this.actions.splice(index2, 0, action);
        }
        if (rafWasActive) {
            this.raf = requestAnimationFrame(this.rafCheck.bind(this));
        }
    };
    _proto.start = function start() {
        this.timeOffset = 0;
        this.lastTimestamp = performance.now();
        this.raf = requestAnimationFrame(this.rafCheck.bind(this));
    };
    _proto.rafCheck = function rafCheck() {
        var time = performance.now();
        this.timeOffset += (time - this.lastTimestamp) * this.speed;
        this.lastTimestamp = time;
        while(this.actions.length){
            var action = this.actions[0];
            if (this.timeOffset >= action.delay) {
                this.actions.shift();
                action.doAction();
            } else {
                break;
            }
        }
        if (this.actions.length > 0) {
            this.raf = requestAnimationFrame(this.rafCheck.bind(this));
        } else {
            this.raf = true;
        }
    };
    _proto.clear = function clear() {
        if (this.raf) {
            if (this.raf !== true) {
                cancelAnimationFrame(this.raf);
            }
            this.raf = null;
        }
        this.actions.length = 0;
    };
    _proto.setSpeed = function setSpeed(speed) {
        this.speed = speed;
    };
    _proto.isActive = function isActive() {
        return this.raf !== null;
    };
    _proto.findActionIndex = function findActionIndex(action) {
        var start = 0;
        var end = this.actions.length - 1;
        while(start <= end){
            var mid = Math.floor((start + end) / 2);
            if (this.actions[mid].delay < action.delay) {
                start = mid + 1;
            } else if (this.actions[mid].delay > action.delay) {
                end = mid - 1;
            } else {
                return mid + 1;
            }
        }
        return start;
    };
    return Timer;
}();
function addDelay(event, baselineTime) {
    if (event.type === EventType.IncrementalSnapshot && event.data.source === IncrementalSource.MouseMove && event.data.positions && event.data.positions.length) {
        var firstOffset = event.data.positions[0].timeOffset;
        var firstTimestamp = event.timestamp + firstOffset;
        event.delay = firstTimestamp - baselineTime;
        return firstTimestamp - baselineTime;
    }
    event.delay = event.timestamp - baselineTime;
    return event.delay;
}
/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */ function t(t2, n2) {
    var e2 = "function" == typeof Symbol && t2[Symbol.iterator];
    if (!e2) return t2;
    var r2, o2, i2 = e2.call(t2), a2 = [];
    try {
        for(; (void 0 === n2 || n2-- > 0) && !(r2 = i2.next()).done;)a2.push(r2.value);
    } catch (t3) {
        o2 = {
            error: t3
        };
    } finally{
        try {
            r2 && !r2.done && (e2 = i2.return) && e2.call(i2);
        } finally{
            if (o2) throw o2.error;
        }
    }
    return a2;
}
var n;
!function(t2) {
    t2[t2.NotStarted = 0] = "NotStarted", t2[t2.Running = 1] = "Running", t2[t2.Stopped = 2] = "Stopped";
}(n || (n = {}));
var e = {
    type: "xstate.init"
};
function r(t2) {
    return void 0 === t2 ? [] : [].concat(t2);
}
function o(t2) {
    return {
        type: "xstate.assign",
        assignment: t2
    };
}
function i(t2, n2) {
    return "string" == typeof (t2 = "string" == typeof t2 && n2 && n2[t2] ? n2[t2] : t2) ? {
        type: t2
    } : "function" == typeof t2 ? {
        type: t2.name,
        exec: t2
    } : t2;
}
function a(t2) {
    return function(n2) {
        return t2 === n2;
    };
}
function u(t2) {
    return "string" == typeof t2 ? {
        type: t2
    } : t2;
}
function c(t2, n2) {
    return {
        value: t2,
        context: n2,
        actions: [],
        changed: false,
        matches: a(t2)
    };
}
function f(t2, n2, e2) {
    var r2 = n2, o2 = false;
    return [
        t2.filter(function(t3) {
            if ("xstate.assign" === t3.type) {
                o2 = true;
                var n3 = Object.assign({}, r2);
                return "function" == typeof t3.assignment ? n3 = t3.assignment(r2, e2) : Object.keys(t3.assignment).forEach(function(o3) {
                    n3[o3] = "function" == typeof t3.assignment[o3] ? t3.assignment[o3](r2, e2) : t3.assignment[o3];
                }), r2 = n3, false;
            }
            return true;
        }),
        r2,
        o2
    ];
}
function s(n2, o2) {
    void 0 === o2 && (o2 = {});
    var s2 = t(f(r(n2.states[n2.initial].entry).map(function(t2) {
        return i(t2, o2.actions);
    }), n2.context, e), 2), l2 = s2[0], v2 = s2[1], y = {
        config: n2,
        _options: o2,
        initialState: {
            value: n2.initial,
            actions: l2,
            context: v2,
            matches: a(n2.initial)
        },
        transition: function transition(e2, o3) {
            var s3, l3, v3 = "string" == typeof e2 ? {
                value: e2,
                context: n2.context
            } : e2, p = v3.value, g = v3.context, d = u(o3), x2 = n2.states[p];
            if (x2.on) {
                var m = r(x2.on[d.type]);
                try {
                    for(var h = function(t2) {
                        var n3 = "function" == typeof Symbol && Symbol.iterator, e3 = n3 && t2[n3], r2 = 0;
                        if (e3) return e3.call(t2);
                        if (t2 && "number" == typeof t2.length) return {
                            next: function next() {
                                return t2 && r2 >= t2.length && (t2 = void 0), {
                                    value: t2 && t2[r2++],
                                    done: !t2
                                };
                            }
                        };
                        throw new TypeError(n3 ? "Object is not iterable." : "Symbol.iterator is not defined.");
                    }(m), b = h.next(); !b.done; b = h.next()){
                        var S = b.value;
                        if (void 0 === S) return c(p, g);
                        var w = "string" == typeof S ? {
                            target: S
                        } : S, j = w.target, E = w.actions, R = void 0 === E ? [] : E, N = w.cond, O = void 0 === N ? function O() {
                            return true;
                        } : N, _ = void 0 === j, k = null != j ? j : p, T = n2.states[k];
                        if (O(g, d)) {
                            var q = t(f((_ ? r(R) : [].concat(x2.exit, R, T.entry).filter(function(t2) {
                                return t2;
                            })).map(function(t2) {
                                return i(t2, y._options.actions);
                            }), g, d), 3), z = q[0], A = q[1], B = q[2], C = null != j ? j : p;
                            return {
                                value: C,
                                context: A,
                                actions: z,
                                changed: j !== p || z.length > 0 || B,
                                matches: a(C)
                            };
                        }
                    }
                } catch (t2) {
                    s3 = {
                        error: t2
                    };
                } finally{
                    try {
                        b && !b.done && (l3 = h.return) && l3.call(h);
                    } finally{
                        if (s3) throw s3.error;
                    }
                }
            }
            return c(p, g);
        }
    };
    return y;
}
var l = function l(t2, n2) {
    return t2.actions.forEach(function(e2) {
        var r2 = e2.exec;
        return r2 && r2(t2.context, n2);
    });
};
function v(t2) {
    var r2 = t2.initialState, o2 = n.NotStarted, i2 = /* @__PURE__ */ new Set(), c2 = {
        _machine: t2,
        send: function send(e2) {
            o2 === n.Running && (r2 = t2.transition(r2, e2), l(r2, u(e2)), i2.forEach(function(t3) {
                return t3(r2);
            }));
        },
        subscribe: function subscribe(t3) {
            return i2.add(t3), t3(r2), {
                unsubscribe: function unsubscribe() {
                    return i2.delete(t3);
                }
            };
        },
        start: function start(i3) {
            if (i3) {
                var u2 = "object" == (typeof i3 === "undefined" ? "undefined" : _type_of(i3)) ? i3 : {
                    context: t2.config.context,
                    value: i3
                };
                r2 = {
                    value: u2.value,
                    actions: [],
                    context: u2.context,
                    matches: a(u2.value)
                };
            }
            return o2 = n.Running, l(r2, e), c2;
        },
        stop: function stop() {
            return o2 = n.Stopped, i2.clear(), c2;
        },
        get state () {
            return r2;
        },
        get status () {
            return o2;
        }
    };
    return c2;
}
function discardPriorSnapshots(events, baselineTime) {
    for(var idx = events.length - 1; idx >= 0; idx--){
        var event = events[idx];
        if (event.type === EventType.Meta) {
            if (event.timestamp <= baselineTime) {
                return events.slice(idx);
            }
        }
    }
    return events;
}
function createPlayerService(context, param) {
    var getCastFn = param.getCastFn, applyEventsSynchronously = param.applyEventsSynchronously, emitter = param.emitter;
    var playerMachine = s({
        id: "player",
        context: context,
        initial: "paused",
        states: {
            playing: {
                on: {
                    PAUSE: {
                        target: "paused",
                        actions: [
                            "pause"
                        ]
                    },
                    CAST_EVENT: {
                        target: "playing",
                        actions: "castEvent"
                    },
                    END: {
                        target: "paused",
                        actions: [
                            "resetLastPlayedEvent",
                            "pause"
                        ]
                    },
                    ADD_EVENT: {
                        target: "playing",
                        actions: [
                            "addEvent"
                        ]
                    }
                }
            },
            paused: {
                on: {
                    PLAY: {
                        target: "playing",
                        actions: [
                            "recordTimeOffset",
                            "play"
                        ]
                    },
                    CAST_EVENT: {
                        target: "paused",
                        actions: "castEvent"
                    },
                    TO_LIVE: {
                        target: "live",
                        actions: [
                            "startLive"
                        ]
                    },
                    ADD_EVENT: {
                        target: "paused",
                        actions: [
                            "addEvent"
                        ]
                    }
                }
            },
            live: {
                on: {
                    ADD_EVENT: {
                        target: "live",
                        actions: [
                            "addEvent"
                        ]
                    },
                    CAST_EVENT: {
                        target: "live",
                        actions: [
                            "castEvent"
                        ]
                    }
                }
            }
        }
    }, {
        actions: {
            castEvent: o({
                lastPlayedEvent: function(ctx, event) {
                    if (event.type === "CAST_EVENT") {
                        return event.payload.event;
                    }
                    return ctx.lastPlayedEvent;
                }
            }),
            recordTimeOffset: o(function(ctx, event) {
                var timeOffset = ctx.timeOffset;
                if ("payload" in event && "timeOffset" in event.payload) {
                    timeOffset = event.payload.timeOffset;
                }
                return _extends({}, ctx, {
                    timeOffset: timeOffset,
                    baselineTime: ctx.events[0].timestamp + timeOffset
                });
            }),
            play: function play(ctx) {
                var _loop = function() {
                    var event = _step1.value;
                    if (lastPlayedTimestamp && lastPlayedTimestamp < baselineTime && (event.timestamp <= lastPlayedTimestamp || event === lastPlayedEvent)) {
                        return "continue";
                    }
                    if (event.timestamp < baselineTime) {
                        syncEvents.push(event);
                    } else {
                        var castFn = getCastFn(event, false);
                        timer.addAction({
                            doAction: function() {
                                castFn();
                            },
                            delay: event.delay
                        });
                    }
                };
                var _a2;
                var timer = ctx.timer, events = ctx.events, baselineTime = ctx.baselineTime, lastPlayedEvent = ctx.lastPlayedEvent;
                timer.clear();
                for(var _iterator = _create_for_of_iterator_helper_loose(events), _step; !(_step = _iterator()).done;){
                    var event = _step.value;
                    addDelay(event, baselineTime);
                }
                var neededEvents = discardPriorSnapshots(events, baselineTime);
                var lastPlayedTimestamp = lastPlayedEvent == null ? void 0 : lastPlayedEvent.timestamp;
                if ((lastPlayedEvent == null ? void 0 : lastPlayedEvent.type) === EventType.IncrementalSnapshot && lastPlayedEvent.data.source === IncrementalSource.MouseMove) {
                    lastPlayedTimestamp = lastPlayedEvent.timestamp + ((_a2 = lastPlayedEvent.data.positions[0]) == null ? void 0 : _a2.timeOffset);
                }
                if (baselineTime < (lastPlayedTimestamp || 0)) {
                    emitter.emit(ReplayerEvents.PlayBack);
                }
                var syncEvents = new Array();
                for(var _iterator1 = _create_for_of_iterator_helper_loose(neededEvents), _step1; !(_step1 = _iterator1()).done;)_loop();
                applyEventsSynchronously(syncEvents);
                emitter.emit(ReplayerEvents.Flush);
                timer.start();
            },
            pause: function pause(ctx) {
                ctx.timer.clear();
            },
            resetLastPlayedEvent: o(function(ctx) {
                return _extends({}, ctx, {
                    lastPlayedEvent: null
                });
            }),
            startLive: o({
                baselineTime: function(ctx, event) {
                    ctx.timer.start();
                    if (event.type === "TO_LIVE" && event.payload.baselineTime) {
                        return event.payload.baselineTime;
                    }
                    return Date.now();
                }
            }),
            addEvent: o(function(ctx, machineEvent) {
                var baselineTime = ctx.baselineTime, timer = ctx.timer, events = ctx.events;
                if (machineEvent.type === "ADD_EVENT") {
                    var event = machineEvent.payload.event;
                    addDelay(event, baselineTime);
                    var end = events.length - 1;
                    if (!events[end] || events[end].timestamp <= event.timestamp) {
                        events.push(event);
                    } else {
                        var insertionIndex = -1;
                        var start = 0;
                        while(start <= end){
                            var mid = Math.floor((start + end) / 2);
                            if (events[mid].timestamp <= event.timestamp) {
                                start = mid + 1;
                            } else {
                                end = mid - 1;
                            }
                        }
                        if (insertionIndex === -1) {
                            insertionIndex = start;
                        }
                        events.splice(insertionIndex, 0, event);
                    }
                    var isSync = event.timestamp < baselineTime;
                    var castFn = getCastFn(event, isSync);
                    if (isSync) {
                        castFn();
                    } else if (timer.isActive()) {
                        timer.addAction({
                            doAction: function() {
                                castFn();
                            },
                            delay: event.delay
                        });
                    }
                }
                return _extends({}, ctx, {
                    events: events
                });
            })
        }
    });
    return v(playerMachine);
}
function createSpeedService(context) {
    var speedMachine = s({
        id: "speed",
        context: context,
        initial: "normal",
        states: {
            normal: {
                on: {
                    FAST_FORWARD: {
                        target: "skipping",
                        actions: [
                            "recordSpeed",
                            "setSpeed"
                        ]
                    },
                    SET_SPEED: {
                        target: "normal",
                        actions: [
                            "setSpeed"
                        ]
                    }
                }
            },
            skipping: {
                on: {
                    BACK_TO_NORMAL: {
                        target: "normal",
                        actions: [
                            "restoreSpeed"
                        ]
                    },
                    SET_SPEED: {
                        target: "normal",
                        actions: [
                            "setSpeed"
                        ]
                    }
                }
            }
        }
    }, {
        actions: {
            setSpeed: function(ctx, event) {
                if ("payload" in event) {
                    ctx.timer.setSpeed(event.payload.speed);
                }
            },
            recordSpeed: o({
                normalSpeed: function(ctx) {
                    return ctx.timer.speed;
                }
            }),
            restoreSpeed: function(ctx) {
                ctx.timer.setSpeed(ctx.normalSpeed);
            }
        }
    });
    return v(speedMachine);
}
var rules = function(blockClass) {
    return [
        "." + blockClass + " { background: currentColor }",
        "noscript { display: none !important; }"
    ];
};
var webGLVarMap = /* @__PURE__ */ new Map();
function variableListFor(ctx, ctor) {
    var contextMap = webGLVarMap.get(ctx);
    if (!contextMap) {
        contextMap = /* @__PURE__ */ new Map();
        webGLVarMap.set(ctx, contextMap);
    }
    if (!contextMap.has(ctor)) {
        contextMap.set(ctor, []);
    }
    return contextMap.get(ctor);
}
function deserializeArg(imageMap, ctx, preload) {
    return /*#__PURE__*/ _async_to_generator(function(arg) {
        var args, name, index2, name1, args1, ctor, _tmp, _, _1, image, image2, blobContents, blob2, result2;
        return _ts_generator(this, function(_state) {
            switch(_state.label){
                case 0:
                    if (!(arg && (typeof arg === "undefined" ? "undefined" : _type_of(arg)) === "object" && "rr_type" in arg)) return [
                        3,
                        11
                    ];
                    if (preload) preload.isUnchanged = false;
                    if (!(arg.rr_type === "ImageBitmap" && "args" in arg)) return [
                        3,
                        3
                    ];
                    return [
                        4,
                        deserializeArg(imageMap, ctx, preload)(arg.args)
                    ];
                case 1:
                    args = _state.sent();
                    return [
                        4,
                        createImageBitmap.apply(null, args)
                    ];
                case 2:
                    return [
                        2,
                        _state.sent()
                    ];
                case 3:
                    if (!("index" in arg)) return [
                        3,
                        4
                    ];
                    if (preload || ctx === null) return [
                        2,
                        arg
                    ];
                    name = arg.rr_type, index2 = arg.index;
                    return [
                        2,
                        variableListFor(ctx, name)[index2]
                    ];
                case 4:
                    if (!("args" in arg)) return [
                        3,
                        6
                    ];
                    name1 = arg.rr_type, args1 = arg.args;
                    ctor = window[name1];
                    _tmp = [
                        ctor
                    ];
                    _1 = (_ = []).concat;
                    return [
                        4,
                        Promise.all(args1.map(deserializeArg(imageMap, ctx, preload)))
                    ];
                case 5:
                    return [
                        2,
                        _construct.apply(void 0, _tmp.concat([
                            _1.apply(_, [
                                _state.sent()
                            ])
                        ]))
                    ];
                case 6:
                    if (!("base64" in arg)) return [
                        3,
                        7
                    ];
                    return [
                        2,
                        decode(arg.base64)
                    ];
                case 7:
                    if (!("src" in arg)) return [
                        3,
                        8
                    ];
                    image = imageMap.get(arg.src);
                    if (image) {
                        return [
                            2,
                            image
                        ];
                    } else {
                        image2 = new Image();
                        image2.src = arg.src;
                        imageMap.set(arg.src, image2);
                        return [
                            2,
                            image2
                        ];
                    }
                case 8:
                    if (!("data" in arg && arg.rr_type === "Blob")) return [
                        3,
                        10
                    ];
                    return [
                        4,
                        Promise.all(arg.data.map(deserializeArg(imageMap, ctx, preload)))
                    ];
                case 9:
                    blobContents = _state.sent();
                    blob2 = new Blob(blobContents, {
                        type: arg.type
                    });
                    return [
                        2,
                        blob2
                    ];
                case 10:
                    return [
                        3,
                        13
                    ];
                case 11:
                    if (!Array.isArray(arg)) return [
                        3,
                        13
                    ];
                    return [
                        4,
                        Promise.all(arg.map(deserializeArg(imageMap, ctx, preload)))
                    ];
                case 12:
                    result2 = _state.sent();
                    return [
                        2,
                        result2
                    ];
                case 13:
                    return [
                        2,
                        arg
                    ];
            }
        });
    });
}
function getContext(target, type) {
    try {
        if (type === CanvasContext.WebGL) {
            return target.getContext("webgl") || target.getContext("experimental-webgl");
        }
        return target.getContext("webgl2");
    } catch (e2) {
        return null;
    }
}
var WebGLVariableConstructorsNames = [
    "WebGLActiveInfo",
    "WebGLBuffer",
    "WebGLFramebuffer",
    "WebGLProgram",
    "WebGLRenderbuffer",
    "WebGLShader",
    "WebGLShaderPrecisionFormat",
    "WebGLTexture",
    "WebGLUniformLocation",
    "WebGLVertexArrayObject"
];
function saveToWebGLVarMap(ctx, result2) {
    if (!(result2 == null ? void 0 : result2.constructor)) return;
    var name = result2.constructor.name;
    if (!WebGLVariableConstructorsNames.includes(name)) return;
    var variables = variableListFor(ctx, name);
    if (!variables.includes(result2)) variables.push(result2);
}
function webglMutation(_) {
    return _webglMutation.apply(this, arguments);
}
function _webglMutation() {
    _webglMutation = _async_to_generator(function(param) {
        var mutation, target, type, imageMap, errorHandler2, ctx, original, args, result2, error;
        return _ts_generator(this, function(_state) {
            switch(_state.label){
                case 0:
                    mutation = param.mutation, target = param.target, type = param.type, imageMap = param.imageMap, errorHandler2 = param.errorHandler;
                    _state.label = 1;
                case 1:
                    _state.trys.push([
                        1,
                        3,
                        ,
                        4
                    ]);
                    ctx = getContext(target, type);
                    if (!ctx) return [
                        2
                    ];
                    if (mutation.setter) {
                        ctx[mutation.property] = mutation.args[0];
                        return [
                            2
                        ];
                    }
                    original = ctx[mutation.property];
                    return [
                        4,
                        Promise.all(mutation.args.map(deserializeArg(imageMap, ctx)))
                    ];
                case 2:
                    args = _state.sent();
                    result2 = original.apply(ctx, args);
                    saveToWebGLVarMap(ctx, result2);
                    return [
                        3,
                        4
                    ];
                case 3:
                    error = _state.sent();
                    errorHandler2(mutation, error);
                    return [
                        3,
                        4
                    ];
                case 4:
                    return [
                        2
                    ];
            }
        });
    });
    return _webglMutation.apply(this, arguments);
}
function canvasMutation$1(_) {
    return _canvasMutation$1.apply(this, arguments);
}
function _canvasMutation$1() {
    _canvasMutation$1 = _async_to_generator(function(param) {
        var event, mutations, target, imageMap, errorHandler2, ctx, mutationArgsPromises, args;
        return _ts_generator(this, function(_state) {
            switch(_state.label){
                case 0:
                    event = param.event, mutations = param.mutations, target = param.target, imageMap = param.imageMap, errorHandler2 = param.errorHandler;
                    ctx = target.getContext("2d");
                    if (!ctx) {
                        errorHandler2(mutations[0], new Error("Canvas context is null"));
                        return [
                            2
                        ];
                    }
                    mutationArgsPromises = mutations.map(/*#__PURE__*/ _async_to_generator(function(mutation) {
                        return _ts_generator(this, function(_state) {
                            return [
                                2,
                                Promise.all(mutation.args.map(deserializeArg(imageMap, ctx)))
                            ];
                        });
                    }));
                    return [
                        4,
                        Promise.all(mutationArgsPromises)
                    ];
                case 1:
                    args = _state.sent();
                    args.forEach(function(args2, index2) {
                        var mutation = mutations[index2];
                        try {
                            if (mutation.setter) {
                                ctx[mutation.property] = mutation.args[0];
                                return;
                            }
                            var original = ctx[mutation.property];
                            if (mutation.property === "drawImage" && typeof mutation.args[0] === "string") {
                                imageMap.get(event);
                                original.apply(ctx, mutation.args);
                            } else {
                                original.apply(ctx, args2);
                            }
                        } catch (error) {
                            errorHandler2(mutation, error);
                        }
                        return;
                    });
                    return [
                        2
                    ];
            }
        });
    });
    return _canvasMutation$1.apply(this, arguments);
}
function canvasMutation(_) {
    return _canvasMutation.apply(this, arguments);
}
function _canvasMutation() {
    _canvasMutation = _async_to_generator(function(param) {
        var event, mutation, target, imageMap, canvasEventMap, errorHandler2, precomputedMutation, commands, i2, command, error;
        return _ts_generator(this, function(_state) {
            switch(_state.label){
                case 0:
                    event = param.event, mutation = param.mutation, target = param.target, imageMap = param.imageMap, canvasEventMap = param.canvasEventMap, errorHandler2 = param.errorHandler;
                    _state.label = 1;
                case 1:
                    _state.trys.push([
                        1,
                        8,
                        ,
                        9
                    ]);
                    precomputedMutation = canvasEventMap.get(event) || mutation;
                    commands = "commands" in precomputedMutation ? precomputedMutation.commands : [
                        precomputedMutation
                    ];
                    if (![
                        CanvasContext.WebGL,
                        CanvasContext.WebGL2
                    ].includes(mutation.type)) return [
                        3,
                        6
                    ];
                    i2 = 0;
                    _state.label = 2;
                case 2:
                    if (!(i2 < commands.length)) return [
                        3,
                        5
                    ];
                    command = commands[i2];
                    return [
                        4,
                        webglMutation({
                            mutation: command,
                            type: mutation.type,
                            target: target,
                            imageMap: imageMap,
                            errorHandler: errorHandler2
                        })
                    ];
                case 3:
                    _state.sent();
                    _state.label = 4;
                case 4:
                    i2++;
                    return [
                        3,
                        2
                    ];
                case 5:
                    return [
                        2
                    ];
                case 6:
                    return [
                        4,
                        canvasMutation$1({
                            event: event,
                            mutations: commands,
                            target: target,
                            imageMap: imageMap,
                            errorHandler: errorHandler2
                        })
                    ];
                case 7:
                    _state.sent();
                    return [
                        3,
                        9
                    ];
                case 8:
                    error = _state.sent();
                    errorHandler2(mutation, error);
                    return [
                        3,
                        9
                    ];
                case 9:
                    return [
                        2
                    ];
            }
        });
    });
    return _canvasMutation.apply(this, arguments);
}
var MediaManager = /*#__PURE__*/ function() {
    function MediaManager(options) {
        var _this = this;
        __publicField(this, "mediaMap", /* @__PURE__ */ new Map());
        __publicField(this, "warn");
        __publicField(this, "service");
        __publicField(this, "speedService");
        __publicField(this, "emitter");
        __publicField(this, "getCurrentTime");
        __publicField(this, "metadataCallbackMap", /* @__PURE__ */ new Map());
        this.warn = options.warn;
        this.service = options.service;
        this.speedService = options.speedService;
        this.emitter = options.emitter;
        this.getCurrentTime = options.getCurrentTime;
        this.emitter.on(ReplayerEvents.Start, this.start.bind(this));
        this.emitter.on(ReplayerEvents.SkipStart, this.start.bind(this));
        this.emitter.on(ReplayerEvents.Pause, this.pause.bind(this));
        this.emitter.on(ReplayerEvents.Finish, this.pause.bind(this));
        this.speedService.subscribe(function() {
            _this.syncAllMediaElements();
        });
    }
    var _proto = MediaManager.prototype;
    _proto.syncAllMediaElements = function syncAllMediaElements(options) {
        var _this = this;
        if (options === void 0) options = {
            pause: false
        };
        this.mediaMap.forEach(function(_mediaState, target) {
            _this.syncTargetWithState(target);
            if (options.pause) {
                target.pause();
            }
        });
    };
    _proto.start = function start() {
        this.syncAllMediaElements();
    };
    _proto.pause = function pause() {
        this.syncAllMediaElements({
            pause: true
        });
    };
    _proto.seekTo = function seekTo(param) {
        var time = param.time, target = param.target, mediaState = param.mediaState;
        if (mediaState.isPlaying) {
            var differenceBetweenCurrentTimeAndMediaMutationTimestamp = time - mediaState.lastInteractionTimeOffset;
            var mediaPlaybackOffset = differenceBetweenCurrentTimeAndMediaMutationTimestamp / 1e3 * mediaState.playbackRate;
            var duration = "duration" in target && target.duration;
            if (Number.isNaN(duration)) {
                this.waitForMetadata(target);
                return;
            }
            var seekToTime = mediaState.currentTimeAtLastInteraction + mediaPlaybackOffset;
            if (target.loop && // RRMediaElement doesn't have a duration property
            duration !== false) {
                seekToTime = seekToTime % duration;
            }
            target.currentTime = seekToTime;
        } else {
            target.pause();
            target.currentTime = mediaState.currentTimeAtLastInteraction;
        }
    };
    _proto.waitForMetadata = function waitForMetadata(target) {
        var _this = this;
        if (this.metadataCallbackMap.has(target)) return;
        if (!("addEventListener" in target)) return;
        var onLoadedMetadata = function() {
            _this.metadataCallbackMap.delete(target);
            var mediaState = _this.mediaMap.get(target);
            if (!mediaState) return;
            _this.seekTo({
                time: _this.getCurrentTime(),
                target: target,
                mediaState: mediaState
            });
        };
        this.metadataCallbackMap.set(target, onLoadedMetadata);
        target.addEventListener("loadedmetadata", onLoadedMetadata, {
            once: true
        });
    };
    _proto.getMediaStateFromMutation = function getMediaStateFromMutation(param) {
        var target = param.target, timeOffset = param.timeOffset, mutation = param.mutation;
        var lastState = this.mediaMap.get(target);
        var type = mutation.type, playbackRate = mutation.playbackRate, currentTime = mutation.currentTime, muted = mutation.muted, volume = mutation.volume, loop = mutation.loop;
        var isPlaying = type === MediaInteractions.Play || type !== MediaInteractions.Pause && ((lastState == null ? void 0 : lastState.isPlaying) || target.getAttribute("autoplay") !== null);
        var _ref, _ref1, _ref2, _ref3, _ref4;
        var mediaState = {
            isPlaying: isPlaying,
            currentTimeAtLastInteraction: (_ref = currentTime != null ? currentTime : lastState == null ? void 0 : lastState.currentTimeAtLastInteraction) != null ? _ref : 0,
            lastInteractionTimeOffset: timeOffset,
            playbackRate: (_ref1 = playbackRate != null ? playbackRate : lastState == null ? void 0 : lastState.playbackRate) != null ? _ref1 : 1,
            volume: (_ref2 = volume != null ? volume : lastState == null ? void 0 : lastState.volume) != null ? _ref2 : 1,
            muted: (_ref3 = muted != null ? muted : lastState == null ? void 0 : lastState.muted) != null ? _ref3 : target.getAttribute("muted") === null,
            loop: (_ref4 = loop != null ? loop : lastState == null ? void 0 : lastState.loop) != null ? _ref4 : target.getAttribute("loop") === null
        };
        return mediaState;
    };
    _proto.syncTargetWithState = function syncTargetWithState(target) {
        var mediaState = this.mediaMap.get(target);
        if (!mediaState) return;
        var muted = mediaState.muted, loop = mediaState.loop, volume = mediaState.volume, isPlaying = mediaState.isPlaying;
        var playerIsPaused = this.service.state.matches("paused");
        var playbackRate = mediaState.playbackRate * this.speedService.state.context.timer.speed;
        try {
            this.seekTo({
                time: this.getCurrentTime(),
                target: target,
                mediaState: mediaState
            });
            if (target.volume !== volume) {
                target.volume = volume;
            }
            target.muted = muted;
            target.loop = loop;
            if (target.playbackRate !== playbackRate) {
                target.playbackRate = playbackRate;
            }
            if (isPlaying && !playerIsPaused) {
                void target.play();
            } else {
                target.pause();
            }
        } catch (error) {
            this.warn(// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/restrict-template-expressions
            "Failed to replay media interactions: " + (error.message || error));
        }
    };
    _proto.addMediaElements = function addMediaElements(node2, timeOffset, mirror2) {
        if (![
            "AUDIO",
            "VIDEO"
        ].includes(node2.nodeName)) return;
        var target = node2;
        var serializedNode = mirror2.getMeta(target);
        if (!serializedNode || !("attributes" in serializedNode)) return;
        var playerIsPaused = this.service.state.matches("paused");
        var mediaAttributes = serializedNode.attributes;
        var isPlaying = false;
        if (mediaAttributes.rr_mediaState) {
            isPlaying = mediaAttributes.rr_mediaState === "played";
        } else {
            isPlaying = target.getAttribute("autoplay") !== null;
        }
        if (isPlaying && playerIsPaused) target.pause();
        var playbackRate = 1;
        if (typeof mediaAttributes.rr_mediaPlaybackRate === "number") {
            playbackRate = mediaAttributes.rr_mediaPlaybackRate;
        }
        var muted = false;
        if (typeof mediaAttributes.rr_mediaMuted === "boolean") {
            muted = mediaAttributes.rr_mediaMuted;
        } else {
            muted = target.getAttribute("muted") !== null;
        }
        var loop = false;
        if (typeof mediaAttributes.rr_mediaLoop === "boolean") {
            loop = mediaAttributes.rr_mediaLoop;
        } else {
            loop = target.getAttribute("loop") !== null;
        }
        var volume = 1;
        if (typeof mediaAttributes.rr_mediaVolume === "number") {
            volume = mediaAttributes.rr_mediaVolume;
        }
        var currentTimeAtLastInteraction = 0;
        if (typeof mediaAttributes.rr_mediaCurrentTime === "number") {
            currentTimeAtLastInteraction = mediaAttributes.rr_mediaCurrentTime;
        }
        this.mediaMap.set(target, {
            isPlaying: isPlaying,
            currentTimeAtLastInteraction: currentTimeAtLastInteraction,
            lastInteractionTimeOffset: timeOffset,
            playbackRate: playbackRate,
            volume: volume,
            muted: muted,
            loop: loop
        });
        this.syncTargetWithState(target);
    };
    _proto.mediaMutation = function mediaMutation(param) {
        var target = param.target, timeOffset = param.timeOffset, mutation = param.mutation;
        this.mediaMap.set(target, this.getMediaStateFromMutation({
            target: target,
            timeOffset: timeOffset,
            mutation: mutation
        }));
        this.syncTargetWithState(target);
    };
    _proto.isSupportedMediaElement = function isSupportedMediaElement(node2) {
        return [
            "AUDIO",
            "VIDEO"
        ].includes(node2.nodeName);
    };
    _proto.reset = function reset() {
        this.mediaMap.clear();
    };
    return MediaManager;
}();
function applyDialogToTopLevel(node2, attributeMutation) {
    if (node2.nodeName !== "DIALOG" || _instanceof(node2, BaseRRNode)) return;
    var dialog = node2;
    var oldIsOpen = dialog.open;
    var oldIsModalState = oldIsOpen && dialog.matches("dialog:modal");
    var rrOpenMode = dialog.getAttribute("rr_open_mode");
    var newIsOpen = typeof (attributeMutation == null ? void 0 : attributeMutation.attributes.open) === "string" || typeof dialog.getAttribute("open") === "string";
    var newIsModalState = rrOpenMode === "modal";
    var newIsNonModalState = rrOpenMode === "non-modal";
    var modalStateChanged = oldIsModalState && newIsNonModalState || !oldIsModalState && newIsModalState;
    if (oldIsOpen && !modalStateChanged) return;
    if (!dialog.isConnected) {
        console.warn("dialog is not attached to the dom", dialog);
        return;
    }
    if (oldIsOpen) dialog.close();
    if (!newIsOpen) return;
    if (newIsModalState) dialog.showModal();
    else dialog.show();
}
function removeDialogFromTopLevel(node2, attributeMutation) {
    if (node2.nodeName !== "DIALOG" || _instanceof(node2, BaseRRNode)) return;
    var dialog = node2;
    if (!dialog.isConnected) {
        console.warn("dialog is not attached to the dom", dialog);
        return;
    }
    if (attributeMutation.attributes.open === null) {
        dialog.removeAttribute("open");
        dialog.removeAttribute("rr_open_mode");
    }
}
var SKIP_TIME_INTERVAL = 5 * 1e3;
var mitt = mitt$1 || mittProxy;
var REPLAY_CONSOLE_PREFIX = "[replayer]";
var defaultMouseTailConfig = {
    duration: 500,
    lineCap: "round",
    lineWidth: 3,
    strokeStyle: "red"
};
function indicatesTouchDevice(e2) {
    return e2.type == EventType.IncrementalSnapshot && (e2.data.source == IncrementalSource.TouchMove || e2.data.source == IncrementalSource.MouseInteraction && e2.data.type == MouseInteractions.TouchStart);
}
var Replayer = /*#__PURE__*/ function() {
    function Replayer(events, config) {
        var _this = this;
        __publicField(this, "wrapper");
        __publicField(this, "iframe");
        __publicField(this, "service");
        __publicField(this, "speedService");
        __publicField(this, "config");
        // In the fast-forward process, if the virtual-dom optimization is used, this flag value is true.
        __publicField(this, "usingVirtualDom", false);
        __publicField(this, "virtualDom", new RRDocument());
        __publicField(this, "mouse");
        __publicField(this, "mouseTail", null);
        __publicField(this, "tailPositions", []);
        __publicField(this, "emitter", mitt());
        __publicField(this, "nextUserInteractionEvent");
        __publicField(this, "legacy_missingNodeRetryMap", {});
        // The replayer uses the cache to speed up replay and scrubbing.
        __publicField(this, "cache", createCache());
        __publicField(this, "imageMap", /* @__PURE__ */ new Map());
        __publicField(this, "canvasEventMap", /* @__PURE__ */ new Map());
        __publicField(this, "mirror", createMirror$2());
        // Used to track StyleSheetObjects adopted on multiple document hosts.
        __publicField(this, "styleMirror", new StyleSheetMirror());
        // Used to track video & audio elements, and keep them in sync with general playback.
        __publicField(this, "mediaManager");
        __publicField(this, "firstFullSnapshot", null);
        __publicField(this, "newDocumentQueue", []);
        __publicField(this, "mousePos", null);
        __publicField(this, "touchActive", null);
        __publicField(this, "lastMouseDownEvent", null);
        // Keep the rootNode of the last hovered element. So  when hovering a new element, we can remove the last hovered element's :hover style.
        __publicField(this, "lastHoveredRootNode");
        // In the fast-forward mode, only the last selection data needs to be applied.
        __publicField(this, "lastSelectionData", null);
        // In the fast-forward mode using VirtualDom optimization, all stylesheetRule, and styleDeclaration events on constructed StyleSheets will be delayed to get applied until the flush stage.
        __publicField(this, "constructedStyleMutations", []);
        // Similar to the reason for constructedStyleMutations.
        __publicField(this, "adoptedStyleSheets", []);
        __publicField(this, "handleResize", function(dimension) {
            _this.iframe.style.display = "inherit";
            for(var _i = 0, _iter = [
                _this.mouseTail,
                _this.iframe
            ]; _i < _iter.length; _i++){
                var el = _iter[_i];
                if (!el) {
                    continue;
                }
                el.setAttribute("width", String(dimension.width));
                el.setAttribute("height", String(dimension.height));
            }
        });
        __publicField(this, "applyEventsSynchronously", function(events) {
            for(var _iterator = _create_for_of_iterator_helper_loose(events), _step; !(_step = _iterator()).done;){
                var event = _step.value;
                switch(event.type){
                    case EventType.DomContentLoaded:
                    case EventType.Load:
                    case EventType.Custom:
                        continue;
                    case EventType.FullSnapshot:
                    case EventType.Meta:
                    case EventType.Plugin:
                    case EventType.IncrementalSnapshot:
                        break;
                }
                var castFn = _this.getCastFn(event, true);
                castFn();
            }
        });
        __publicField(this, "getCastFn", function(event, isSync) {
            if (isSync === void 0) isSync = false;
            var castFn;
            switch(event.type){
                case EventType.DomContentLoaded:
                case EventType.Load:
                    break;
                case EventType.Custom:
                    castFn = function() {
                        _this.emitter.emit(ReplayerEvents.CustomEvent, event);
                    };
                    break;
                case EventType.Meta:
                    castFn = function() {
                        return _this.emitter.emit(ReplayerEvents.Resize, {
                            width: event.data.width,
                            height: event.data.height
                        });
                    };
                    break;
                case EventType.FullSnapshot:
                    castFn = function() {
                        var _a2;
                        if (_this.firstFullSnapshot) {
                            if (_this.firstFullSnapshot === event) {
                                _this.firstFullSnapshot = true;
                                return;
                            }
                        } else {
                            _this.firstFullSnapshot = true;
                        }
                        _this.mediaManager.reset();
                        _this.styleMirror.reset();
                        _this.rebuildFullSnapshot(event, isSync);
                        (_a2 = _this.iframe.contentWindow) == null ? void 0 : _a2.scrollTo(event.data.initialOffset);
                    };
                    break;
                case EventType.IncrementalSnapshot:
                    castFn = function() {
                        _this.applyIncremental(event, isSync);
                        if (isSync) {
                            return;
                        }
                        if (event === _this.nextUserInteractionEvent) {
                            _this.nextUserInteractionEvent = null;
                            _this.backToNormal();
                        }
                        if (_this.config.skipInactive && !_this.nextUserInteractionEvent) {
                            for(var _iterator = _create_for_of_iterator_helper_loose(_this.service.state.context.events), _step; !(_step = _iterator()).done;){
                                var _event = _step.value;
                                if (_event.timestamp <= event.timestamp) {
                                    continue;
                                }
                                if (_this.isUserInteraction(_event)) {
                                    if (// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                                    _event.delay - event.delay > _this.config.inactivePeriodThreshold * _this.speedService.state.context.timer.speed) {
                                        _this.nextUserInteractionEvent = _event;
                                    }
                                    break;
                                }
                            }
                            if (_this.nextUserInteractionEvent) {
                                var skipTime = // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                                _this.nextUserInteractionEvent.delay - event.delay;
                                var payload = {
                                    speed: Math.min(Math.round(skipTime / SKIP_TIME_INTERVAL), _this.config.maxSpeed)
                                };
                                _this.speedService.send({
                                    type: "FAST_FORWARD",
                                    payload: payload
                                });
                                _this.emitter.emit(ReplayerEvents.SkipStart, payload);
                            }
                        }
                    };
                    break;
            }
            var wrappedCastFn = function() {
                if (castFn) {
                    castFn();
                }
                for(var _iterator = _create_for_of_iterator_helper_loose(_this.config.plugins || []), _step; !(_step = _iterator()).done;){
                    var plugin3 = _step.value;
                    if (plugin3.handler) plugin3.handler(event, isSync, {
                        replayer: _this
                    });
                }
                _this.service.send({
                    type: "CAST_EVENT",
                    payload: {
                        event: event
                    }
                });
                var last_index = _this.service.state.context.events.length - 1;
                if (!_this.config.liveMode && event === _this.service.state.context.events[last_index]) {
                    var finish = function() {
                        if (last_index < _this.service.state.context.events.length - 1) {
                            return;
                        }
                        _this.backToNormal();
                        _this.service.send("END");
                        _this.emitter.emit(ReplayerEvents.Finish);
                    };
                    var finish_buffer = 50;
                    if (event.type === EventType.IncrementalSnapshot && event.data.source === IncrementalSource.MouseMove && event.data.positions.length) {
                        finish_buffer += Math.max(0, -event.data.positions[0].timeOffset);
                    }
                    setTimeout(finish, finish_buffer);
                }
                _this.emitter.emit(ReplayerEvents.EventCast, event);
            };
            return wrappedCastFn;
        });
        if (!(config == null ? void 0 : config.liveMode) && events.length < 2) {
            throw new Error("Replayer need at least 2 events.");
        }
        var defaultConfig = {
            speed: 1,
            maxSpeed: 360,
            root: document.body,
            loadTimeout: 0,
            skipInactive: false,
            inactivePeriodThreshold: 10 * 1e3,
            showWarning: true,
            showDebug: false,
            blockClass: "rr-block",
            liveMode: false,
            insertStyleRules: [],
            triggerFocus: true,
            UNSAFE_replayCanvas: false,
            pauseAnimation: true,
            mouseTail: defaultMouseTailConfig,
            useVirtualDom: true,
            // Virtual-dom optimization is enabled by default.
            logger: console
        };
        this.config = Object.assign({}, defaultConfig, config);
        this.handleResize = this.handleResize.bind(this);
        this.getCastFn = this.getCastFn.bind(this);
        this.applyEventsSynchronously = this.applyEventsSynchronously.bind(this);
        this.emitter.on(ReplayerEvents.Resize, this.handleResize);
        this.setupDom();
        for(var _iterator = _create_for_of_iterator_helper_loose(this.config.plugins || []), _step; !(_step = _iterator()).done;){
            var plugin3 = _step.value;
            if (plugin3.getMirror) plugin3.getMirror({
                nodeMirror: this.mirror
            });
        }
        this.emitter.on(ReplayerEvents.Flush, function() {
            if (_this.usingVirtualDom) {
                var replayerHandler = {
                    mirror: _this.mirror,
                    applyCanvas: function(canvasEvent, canvasMutationData, target) {
                        void canvasMutation({
                            event: canvasEvent,
                            mutation: canvasMutationData,
                            target: target,
                            imageMap: _this.imageMap,
                            canvasEventMap: _this.canvasEventMap,
                            errorHandler: _this.warnCanvasMutationFailed.bind(_this)
                        });
                    },
                    applyInput: _this.applyInput.bind(_this),
                    applyScroll: _this.applyScroll.bind(_this),
                    applyStyleSheetMutation: function(data, styleSheet) {
                        if (data.source === IncrementalSource.StyleSheetRule) _this.applyStyleSheetRule(data, styleSheet);
                        else if (data.source === IncrementalSource.StyleDeclaration) _this.applyStyleDeclaration(data, styleSheet);
                    },
                    afterAppend: function(node2, id) {
                        for(var _iterator = _create_for_of_iterator_helper_loose(_this.config.plugins || []), _step; !(_step = _iterator()).done;){
                            var plugin3 = _step.value;
                            if (plugin3.onBuild) plugin3.onBuild(node2, {
                                id: id,
                                replayer: _this
                            });
                        }
                    }
                };
                if (_this.iframe.contentDocument) try {
                    diff(_this.iframe.contentDocument, _this.virtualDom, replayerHandler, _this.virtualDom.mirror);
                } catch (e2) {
                    console.warn(e2);
                }
                _this.virtualDom.destroyTree();
                _this.usingVirtualDom = false;
                if (Object.keys(_this.legacy_missingNodeRetryMap).length) {
                    for(var key in _this.legacy_missingNodeRetryMap){
                        try {
                            var value = _this.legacy_missingNodeRetryMap[key];
                            var realNode = createOrGetNode(value.node, _this.mirror, _this.virtualDom.mirror);
                            diff(realNode, value.node, replayerHandler, _this.virtualDom.mirror);
                            value.node = realNode;
                        } catch (error) {
                            _this.warn(error);
                        }
                    }
                }
                _this.constructedStyleMutations.forEach(function(data) {
                    _this.applyStyleSheetMutation(data);
                });
                _this.constructedStyleMutations = [];
                _this.adoptedStyleSheets.forEach(function(data) {
                    _this.applyAdoptedStyleSheet(data);
                });
                _this.adoptedStyleSheets = [];
            }
            if (_this.mousePos) {
                _this.moveAndHover(_this.mousePos.x, _this.mousePos.y, _this.mousePos.id, true, _this.mousePos.debugData);
                _this.mousePos = null;
            }
            if (_this.touchActive === true) {
                _this.mouse.classList.add("touch-active");
            } else if (_this.touchActive === false) {
                _this.mouse.classList.remove("touch-active");
            }
            _this.touchActive = null;
            if (_this.lastMouseDownEvent) {
                var _this_lastMouseDownEvent = _this.lastMouseDownEvent, target = _this_lastMouseDownEvent[0], event = _this_lastMouseDownEvent[1];
                target.dispatchEvent(event);
            }
            _this.lastMouseDownEvent = null;
            if (_this.lastSelectionData) {
                _this.applySelection(_this.lastSelectionData);
                _this.lastSelectionData = null;
            }
        });
        this.emitter.on(ReplayerEvents.PlayBack, function() {
            _this.firstFullSnapshot = null;
            _this.mirror.reset();
            _this.styleMirror.reset();
            _this.mediaManager.reset();
        });
        var timer = new Timer([], {
            speed: this.config.speed
        });
        this.service = createPlayerService({
            events: events.map(function(e2) {
                if (config && config.unpackFn) {
                    return config.unpackFn(e2);
                }
                return e2;
            }).sort(function(a1, a2) {
                return a1.timestamp - a2.timestamp;
            }),
            timer: timer,
            timeOffset: 0,
            baselineTime: 0,
            lastPlayedEvent: null
        }, {
            getCastFn: this.getCastFn,
            applyEventsSynchronously: this.applyEventsSynchronously,
            emitter: this.emitter
        });
        this.service.start();
        this.service.subscribe(function(state) {
            _this.emitter.emit(ReplayerEvents.StateChange, {
                player: state
            });
        });
        this.speedService = createSpeedService({
            normalSpeed: -1,
            timer: timer
        });
        this.speedService.start();
        this.speedService.subscribe(function(state) {
            _this.emitter.emit(ReplayerEvents.StateChange, {
                speed: state
            });
        });
        this.mediaManager = new MediaManager({
            warn: this.warn.bind(this),
            service: this.service,
            speedService: this.speedService,
            emitter: this.emitter,
            getCurrentTime: this.getCurrentTime.bind(this)
        });
        var firstMeta = this.service.state.context.events.find(function(e2) {
            return e2.type === EventType.Meta;
        });
        var firstFullsnapshot = this.service.state.context.events.find(function(e2) {
            return e2.type === EventType.FullSnapshot;
        });
        if (firstMeta) {
            var _firstMeta_data = firstMeta.data, width = _firstMeta_data.width, height = _firstMeta_data.height;
            setTimeout(function() {
                _this.emitter.emit(ReplayerEvents.Resize, {
                    width: width,
                    height: height
                });
            }, 0);
        }
        if (firstFullsnapshot) {
            setTimeout(function() {
                var _a2;
                if (_this.firstFullSnapshot) {
                    return;
                }
                _this.firstFullSnapshot = firstFullsnapshot;
                _this.rebuildFullSnapshot(firstFullsnapshot);
                (_a2 = _this.iframe.contentWindow) == null ? void 0 : _a2.scrollTo(firstFullsnapshot.data.initialOffset);
            }, 1);
        }
        if (this.service.state.context.events.find(indicatesTouchDevice)) {
            this.mouse.classList.add("touch-device");
        }
    }
    var _proto = Replayer.prototype;
    _proto.on = function on(event, handler) {
        this.emitter.on(event, handler);
        return this;
    };
    _proto.off = function off(event, handler) {
        this.emitter.off(event, handler);
        return this;
    };
    _proto.setConfig = function setConfig(config) {
        var _this = this;
        Object.keys(config).forEach(function(key) {
            config[key];
            _this.config[key] = config[key];
        });
        if (!this.config.skipInactive) {
            this.backToNormal();
        }
        if (typeof config.speed !== "undefined") {
            this.speedService.send({
                type: "SET_SPEED",
                payload: {
                    speed: config.speed
                }
            });
        }
        if (typeof config.mouseTail !== "undefined") {
            if (config.mouseTail === false) {
                if (this.mouseTail) {
                    this.mouseTail.style.display = "none";
                }
            } else {
                if (!this.mouseTail) {
                    this.mouseTail = document.createElement("canvas");
                    this.mouseTail.width = Number.parseFloat(this.iframe.width);
                    this.mouseTail.height = Number.parseFloat(this.iframe.height);
                    this.mouseTail.classList.add("replayer-mouse-tail");
                    this.wrapper.insertBefore(this.mouseTail, this.iframe);
                }
                this.mouseTail.style.display = "inherit";
            }
        }
    };
    _proto.getMetaData = function getMetaData() {
        var firstEvent = this.service.state.context.events[0];
        var lastEvent = this.service.state.context.events[this.service.state.context.events.length - 1];
        return {
            startTime: firstEvent.timestamp,
            endTime: lastEvent.timestamp,
            totalTime: lastEvent.timestamp - firstEvent.timestamp
        };
    };
    /**
   * Get the actual time offset the player is at now compared to the first event.
   */ _proto.getCurrentTime = function getCurrentTime() {
        return this.timer.timeOffset + this.getTimeOffset();
    };
    /**
   * Get the time offset the player is at now compared to the first event, but without regard for the timer.
   */ _proto.getTimeOffset = function getTimeOffset() {
        var _this_service_state_context = this.service.state.context, baselineTime = _this_service_state_context.baselineTime, events = _this_service_state_context.events;
        return baselineTime - events[0].timestamp;
    };
    _proto.getMirror = function getMirror() {
        return this.mirror;
    };
    /**
   * This API was designed to be used as play at any time offset.
   * Since we minimized the data collected from recorder, we do not
   * have the ability of undo an event.
   * So the implementation of play at any time offset will always iterate
   * all of the events, cast event before the offset synchronously
   * and cast event after the offset asynchronously with timer.
   * @param timeOffset - number
   */ _proto.play = function play(timeOffset) {
        if (timeOffset === void 0) timeOffset = 0;
        var _a2, _b;
        if (this.service.state.matches("paused")) {
            this.service.send({
                type: "PLAY",
                payload: {
                    timeOffset: timeOffset
                }
            });
        } else {
            this.service.send({
                type: "PAUSE"
            });
            this.service.send({
                type: "PLAY",
                payload: {
                    timeOffset: timeOffset
                }
            });
        }
        (_b = (_a2 = this.iframe.contentDocument) == null ? void 0 : _a2.getElementsByTagName("html")[0]) == null ? void 0 : _b.classList.remove("rrweb-paused");
        this.emitter.emit(ReplayerEvents.Start);
    };
    _proto.pause = function pause(timeOffset) {
        var _a2, _b;
        if (timeOffset === void 0 && this.service.state.matches("playing")) {
            this.service.send({
                type: "PAUSE"
            });
        }
        if (typeof timeOffset === "number") {
            this.play(timeOffset);
            this.service.send({
                type: "PAUSE"
            });
        }
        (_b = (_a2 = this.iframe.contentDocument) == null ? void 0 : _a2.getElementsByTagName("html")[0]) == null ? void 0 : _b.classList.add("rrweb-paused");
        this.emitter.emit(ReplayerEvents.Pause);
    };
    _proto.resume = function resume(timeOffset) {
        if (timeOffset === void 0) timeOffset = 0;
        this.warn("The 'resume' was deprecated in 1.0. Please use 'play' method which has the same interface.");
        this.play(timeOffset);
        this.emitter.emit(ReplayerEvents.Resume);
    };
    /**
   * Totally destroy this replayer and please be careful that this operation is irreversible.
   * Memory occupation can be released by removing all references to this replayer.
   */ _proto.destroy = function destroy() {
        this.pause();
        this.mirror.reset();
        this.styleMirror.reset();
        this.mediaManager.reset();
        this.config.root.removeChild(this.wrapper);
        this.emitter.emit(ReplayerEvents.Destroy);
    };
    _proto.startLive = function startLive(baselineTime) {
        this.service.send({
            type: "TO_LIVE",
            payload: {
                baselineTime: baselineTime
            }
        });
    };
    _proto.addEvent = function addEvent(rawEvent) {
        var _this = this;
        var event = this.config.unpackFn ? this.config.unpackFn(rawEvent) : rawEvent;
        if (indicatesTouchDevice(event)) {
            this.mouse.classList.add("touch-device");
        }
        void Promise.resolve().then(function() {
            return _this.service.send({
                type: "ADD_EVENT",
                payload: {
                    event: event
                }
            });
        });
    };
    _proto.enableInteract = function enableInteract() {
        this.iframe.setAttribute("scrolling", "auto");
        this.iframe.style.pointerEvents = "auto";
    };
    _proto.disableInteract = function disableInteract() {
        this.iframe.setAttribute("scrolling", "no");
        this.iframe.style.pointerEvents = "none";
    };
    /**
   * Empties the replayer's cache and reclaims memory.
   * The replayer will use this cache to speed up the playback.
   */ _proto.resetCache = function resetCache() {
        this.cache = createCache();
    };
    _proto.setupDom = function setupDom() {
        this.wrapper = document.createElement("div");
        this.wrapper.classList.add("replayer-wrapper");
        this.config.root.appendChild(this.wrapper);
        this.mouse = document.createElement("div");
        this.mouse.classList.add("replayer-mouse");
        this.wrapper.appendChild(this.mouse);
        if (this.config.mouseTail !== false) {
            this.mouseTail = document.createElement("canvas");
            this.mouseTail.classList.add("replayer-mouse-tail");
            this.mouseTail.style.display = "inherit";
            this.wrapper.appendChild(this.mouseTail);
        }
        this.iframe = document.createElement("iframe");
        var attributes = [
            "allow-same-origin"
        ];
        if (this.config.UNSAFE_replayCanvas) {
            attributes.push("allow-scripts");
        }
        this.iframe.style.display = "none";
        this.iframe.setAttribute("sandbox", attributes.join(" "));
        this.disableInteract();
        this.wrapper.appendChild(this.iframe);
        if (this.iframe.contentWindow && this.iframe.contentDocument) {
            polyfill(this.iframe.contentWindow, this.iframe.contentDocument);
            polyfill$1(this.iframe.contentWindow);
        }
    };
    _proto.rebuildFullSnapshot = function rebuildFullSnapshot(event, isSync) {
        var _this, _loop = function() {
            var _step_value = _step.value, mutationInQueue = _step_value.mutationInQueue, builtNode = _step_value.builtNode;
            _this.attachDocumentToIframe(mutationInQueue, builtNode);
            _this.newDocumentQueue = _this.newDocumentQueue.filter(function(m) {
                return m !== mutationInQueue;
            });
        };
        var _this1 = this;
        if (isSync === void 0) isSync = false;
        if (!this.iframe.contentDocument) {
            return this.warn("Looks like your replayer has been destroyed.");
        }
        if (Object.keys(this.legacy_missingNodeRetryMap).length) {
            this.warn("Found unresolved missing node map", this.legacy_missingNodeRetryMap);
        }
        this.legacy_missingNodeRetryMap = {};
        var collectedIframes = [];
        var collectedDialogs = /* @__PURE__ */ new Set();
        var afterAppend = function(builtNode, id) {
            if (builtNode.nodeName === "DIALOG") collectedDialogs.add(builtNode);
            _this1.collectIframeAndAttachDocument(collectedIframes, builtNode);
            if (_this1.mediaManager.isSupportedMediaElement(builtNode)) {
                var events = _this1.service.state.context.events;
                _this1.mediaManager.addMediaElements(builtNode, event.timestamp - events[0].timestamp, _this1.mirror);
            }
            for(var _iterator = _create_for_of_iterator_helper_loose(_this1.config.plugins || []), _step; !(_step = _iterator()).done;){
                var plugin3 = _step.value;
                if (plugin3.onBuild) plugin3.onBuild(builtNode, {
                    id: id,
                    replayer: _this1
                });
            }
        };
        if (this.usingVirtualDom) {
            this.virtualDom.destroyTree();
            this.usingVirtualDom = false;
        }
        this.mirror.reset();
        rebuild(event.data.node, {
            doc: this.iframe.contentDocument,
            afterAppend: afterAppend,
            cache: this.cache,
            mirror: this.mirror
        });
        afterAppend(this.iframe.contentDocument, event.data.node.id);
        for(var _iterator = _create_for_of_iterator_helper_loose(collectedIframes), _step; !(_step = _iterator()).done;)_this = this, _loop();
        var _this_iframe_contentDocument = this.iframe.contentDocument, documentElement = _this_iframe_contentDocument.documentElement, head = _this_iframe_contentDocument.head;
        this.insertStyleRules(documentElement, head);
        collectedDialogs.forEach(function(d) {
            return applyDialogToTopLevel(d);
        });
        if (!this.service.state.matches("playing")) {
            this.iframe.contentDocument.getElementsByTagName("html")[0].classList.add("rrweb-paused");
        }
        this.emitter.emit(ReplayerEvents.FullsnapshotRebuilded, event);
        if (!isSync) {
            this.waitForStylesheetLoad();
        }
        if (this.config.UNSAFE_replayCanvas) {
            void this.preloadAllImages();
        }
    };
    _proto.insertStyleRules = function insertStyleRules(documentElement, head) {
        var _a2;
        var injectStylesRules = rules(this.config.blockClass).concat(this.config.insertStyleRules);
        if (this.config.pauseAnimation) {
            injectStylesRules.push("html.rrweb-paused *, html.rrweb-paused *:before, html.rrweb-paused *:after { animation-play-state: paused !important; }");
        }
        if (!injectStylesRules.length) {
            return;
        }
        if (this.usingVirtualDom) {
            var styleEl = this.virtualDom.createElement("style");
            this.virtualDom.mirror.add(styleEl, getDefaultSN(styleEl, this.virtualDom.unserializedId));
            documentElement.insertBefore(styleEl, head);
            styleEl.rules.push({
                source: IncrementalSource.StyleSheetRule,
                adds: injectStylesRules.map(function(cssText, index2) {
                    return {
                        rule: cssText,
                        index: index2
                    };
                })
            });
        } else {
            var styleEl1 = document.createElement("style");
            documentElement.insertBefore(styleEl1, head);
            for(var idx = 0; idx < injectStylesRules.length; idx++){
                (_a2 = styleEl1.sheet) == null ? void 0 : _a2.insertRule(injectStylesRules[idx], idx);
            }
        }
    };
    _proto.attachDocumentToIframe = function attachDocumentToIframe(mutation, iframeEl) {
        var _this, _loop = function() {
            var _step_value = _step.value, mutationInQueue = _step_value.mutationInQueue, builtNode = _step_value.builtNode;
            _this.attachDocumentToIframe(mutationInQueue, builtNode);
            _this.newDocumentQueue = _this.newDocumentQueue.filter(function(m) {
                return m !== mutationInQueue;
            });
        };
        var _this1 = this;
        var mirror2 = this.usingVirtualDom ? this.virtualDom.mirror : this.mirror;
        var collectedIframes = [];
        var collectedDialogs = /* @__PURE__ */ new Set();
        var afterAppend = function(builtNode, id) {
            if (builtNode.nodeName === "DIALOG") collectedDialogs.add(builtNode);
            _this1.collectIframeAndAttachDocument(collectedIframes, builtNode);
            var sn = mirror2.getMeta(builtNode);
            if ((sn == null ? void 0 : sn.type) === NodeType.Element && (sn == null ? void 0 : sn.tagName.toUpperCase()) === "HTML") {
                var _iframeEl_contentDocument = iframeEl.contentDocument, documentElement = _iframeEl_contentDocument.documentElement, head = _iframeEl_contentDocument.head;
                _this1.insertStyleRules(documentElement, head);
            }
            if (_this1.usingVirtualDom) return;
            for(var _iterator = _create_for_of_iterator_helper_loose(_this1.config.plugins || []), _step; !(_step = _iterator()).done;){
                var plugin3 = _step.value;
                if (plugin3.onBuild) plugin3.onBuild(builtNode, {
                    id: id,
                    replayer: _this1
                });
            }
        };
        buildNodeWithSN(mutation.node, {
            doc: iframeEl.contentDocument,
            mirror: mirror2,
            hackCss: true,
            skipChild: false,
            afterAppend: afterAppend,
            cache: this.cache
        });
        afterAppend(iframeEl.contentDocument, mutation.node.id);
        for(var _iterator = _create_for_of_iterator_helper_loose(collectedIframes), _step; !(_step = _iterator()).done;)_this = this, _loop();
        collectedDialogs.forEach(function(d) {
            return applyDialogToTopLevel(d);
        });
    };
    _proto.collectIframeAndAttachDocument = function collectIframeAndAttachDocument(collected, builtNode) {
        var _this = this;
        if (isSerializedIframe(builtNode, this.mirror)) {
            var mutationInQueue = this.newDocumentQueue.find(function(m) {
                return m.parentId === _this.mirror.getId(builtNode);
            });
            if (mutationInQueue) {
                collected.push({
                    mutationInQueue: mutationInQueue,
                    builtNode: builtNode
                });
            }
        }
    };
    /**
   * pause when loading style sheet, resume when loaded all timeout exceed
   */ _proto.waitForStylesheetLoad = function waitForStylesheetLoad() {
        var _this = this;
        var _a2;
        var head = (_a2 = this.iframe.contentDocument) == null ? void 0 : _a2.head;
        if (head) {
            var unloadSheets = /* @__PURE__ */ new Set();
            var timer;
            var beforeLoadState = this.service.state;
            var stateHandler = function() {
                beforeLoadState = _this.service.state;
            };
            this.emitter.on(ReplayerEvents.Start, stateHandler);
            this.emitter.on(ReplayerEvents.Pause, stateHandler);
            var unsubscribe = function() {
                _this.emitter.off(ReplayerEvents.Start, stateHandler);
                _this.emitter.off(ReplayerEvents.Pause, stateHandler);
            };
            head.querySelectorAll('link[rel="stylesheet"]').forEach(function(css) {
                if (!css.sheet) {
                    unloadSheets.add(css);
                    css.addEventListener("load", function() {
                        unloadSheets.delete(css);
                        if (unloadSheets.size === 0 && timer !== -1) {
                            if (beforeLoadState.matches("playing")) {
                                _this.play(_this.getCurrentTime());
                            }
                            _this.emitter.emit(ReplayerEvents.LoadStylesheetEnd);
                            if (timer) {
                                clearTimeout(timer);
                            }
                            unsubscribe();
                        }
                    });
                }
            });
            if (unloadSheets.size > 0) {
                this.service.send({
                    type: "PAUSE"
                });
                this.emitter.emit(ReplayerEvents.LoadStylesheetStart);
                timer = setTimeout(function() {
                    if (beforeLoadState.matches("playing")) {
                        _this.play(_this.getCurrentTime());
                    }
                    timer = -1;
                    unsubscribe();
                }, this.config.loadTimeout);
            }
        }
    };
    /**
   * pause when there are some canvas drawImage args need to be loaded
   */ _proto.preloadAllImages = function preloadAllImages() {
        var _this = this;
        return _async_to_generator(function() {
            var _loop, promises, _iterator, _step;
            return _ts_generator(this, function(_state) {
                _loop = function() {
                    var event = _step.value;
                    if (event.type === EventType.IncrementalSnapshot && event.data.source === IncrementalSource.CanvasMutation) {
                        promises.push(_this.deserializeAndPreloadCanvasEvents(event.data, event));
                        var commands = "commands" in event.data ? event.data.commands : [
                            event.data
                        ];
                        commands.forEach(function(c2) {
                            _this.preloadImages(c2, event);
                        });
                    }
                };
                promises = [];
                for(_iterator = _create_for_of_iterator_helper_loose(_this.service.state.context.events); !(_step = _iterator()).done;)_loop();
                return [
                    2,
                    Promise.all(promises)
                ];
            });
        })();
    };
    _proto.preloadImages = function preloadImages(data, event) {
        if (data.property === "drawImage" && typeof data.args[0] === "string" && !this.imageMap.has(event)) {
            var canvas = document.createElement("canvas");
            var ctx = canvas.getContext("2d");
            var imgd = ctx == null ? void 0 : ctx.createImageData(canvas.width, canvas.height);
            ctx == null ? void 0 : ctx.putImageData(imgd, 0, 0);
        }
    };
    _proto.deserializeAndPreloadCanvasEvents = function deserializeAndPreloadCanvasEvents(data, event) {
        var _this = this;
        return _async_to_generator(function() {
            var status, commands, args;
            return _ts_generator(this, function(_state) {
                switch(_state.label){
                    case 0:
                        if (!!_this.canvasEventMap.has(event)) return [
                            3,
                            4
                        ];
                        status = {
                            isUnchanged: true
                        };
                        if (!("commands" in data)) return [
                            3,
                            2
                        ];
                        return [
                            4,
                            Promise.all(data.commands.map(/*#__PURE__*/ _async_to_generator(function(c2) {
                                var args;
                                return _ts_generator(this, function(_state) {
                                    switch(_state.label){
                                        case 0:
                                            return [
                                                4,
                                                Promise.all(c2.args.map(deserializeArg(_this.imageMap, null, status)))
                                            ];
                                        case 1:
                                            args = _state.sent();
                                            return [
                                                2,
                                                _extends({}, c2, {
                                                    args: args
                                                })
                                            ];
                                    }
                                });
                            })))
                        ];
                    case 1:
                        commands = _state.sent();
                        if (status.isUnchanged === false) _this.canvasEventMap.set(event, _extends({}, data, {
                            commands: commands
                        }));
                        return [
                            3,
                            4
                        ];
                    case 2:
                        return [
                            4,
                            Promise.all(data.args.map(deserializeArg(_this.imageMap, null, status)))
                        ];
                    case 3:
                        args = _state.sent();
                        if (status.isUnchanged === false) _this.canvasEventMap.set(event, _extends({}, data, {
                            args: args
                        }));
                        _state.label = 4;
                    case 4:
                        return [
                            2
                        ];
                }
            });
        })();
    };
    _proto.applyIncremental = function applyIncremental(e2, isSync) {
        var _this = this;
        var _a2, _b, _c;
        var d = e2.data;
        switch(d.source){
            case IncrementalSource.Mutation:
                {
                    try {
                        this.applyMutation(d, isSync);
                    } catch (error) {
                        this.warn("Exception in mutation " + (error.message || error), d);
                    }
                    break;
                }
            case IncrementalSource.Drag:
            case IncrementalSource.TouchMove:
            case IncrementalSource.MouseMove:
                if (isSync) {
                    var lastPosition = d.positions[d.positions.length - 1];
                    this.mousePos = {
                        x: lastPosition.x,
                        y: lastPosition.y,
                        id: lastPosition.id,
                        debugData: d
                    };
                } else {
                    d.positions.forEach(function(p) {
                        var action = {
                            doAction: function() {
                                _this.moveAndHover(p.x, p.y, p.id, isSync, d);
                            },
                            delay: p.timeOffset + e2.timestamp - _this.service.state.context.baselineTime
                        };
                        _this.timer.addAction(action);
                    });
                    this.timer.addAction({
                        doAction: function doAction() {},
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        delay: e2.delay - ((_a2 = d.positions[0]) == null ? void 0 : _a2.timeOffset)
                    });
                }
                break;
            case IncrementalSource.MouseInteraction:
                {
                    if (d.id === -1) {
                        break;
                    }
                    var event = new Event(toLowerCase(MouseInteractions[d.type]));
                    var target = this.mirror.getNode(d.id);
                    if (!target) {
                        return this.debugNodeNotFound(d, d.id);
                    }
                    this.emitter.emit(ReplayerEvents.MouseInteraction, {
                        type: d.type,
                        target: target
                    });
                    var triggerFocus = this.config.triggerFocus;
                    switch(d.type){
                        case MouseInteractions.Blur:
                            if ("blur" in target) {
                                target.blur();
                            }
                            break;
                        case MouseInteractions.Focus:
                            if (triggerFocus && target.focus) {
                                target.focus({
                                    preventScroll: true
                                });
                            }
                            break;
                        case MouseInteractions.Click:
                        case MouseInteractions.TouchStart:
                        case MouseInteractions.TouchEnd:
                        case MouseInteractions.MouseDown:
                        case MouseInteractions.MouseUp:
                            if (isSync) {
                                if (d.type === MouseInteractions.TouchStart) {
                                    this.touchActive = true;
                                } else if (d.type === MouseInteractions.TouchEnd) {
                                    this.touchActive = false;
                                }
                                if (d.type === MouseInteractions.MouseDown) {
                                    this.lastMouseDownEvent = [
                                        target,
                                        event
                                    ];
                                } else if (d.type === MouseInteractions.MouseUp) {
                                    this.lastMouseDownEvent = null;
                                }
                                this.mousePos = {
                                    x: d.x || 0,
                                    y: d.y || 0,
                                    id: d.id,
                                    debugData: d
                                };
                            } else {
                                if (d.type === MouseInteractions.TouchStart) {
                                    this.tailPositions.length = 0;
                                }
                                this.moveAndHover(d.x || 0, d.y || 0, d.id, isSync, d);
                                if (d.type === MouseInteractions.Click) {
                                    this.mouse.classList.remove("active");
                                    void this.mouse.offsetWidth;
                                    this.mouse.classList.add("active");
                                } else if (d.type === MouseInteractions.TouchStart) {
                                    void this.mouse.offsetWidth;
                                    this.mouse.classList.add("touch-active");
                                } else if (d.type === MouseInteractions.TouchEnd) {
                                    this.mouse.classList.remove("touch-active");
                                } else {
                                    target.dispatchEvent(event);
                                }
                            }
                            break;
                        case MouseInteractions.TouchCancel:
                            if (isSync) {
                                this.touchActive = false;
                            } else {
                                this.mouse.classList.remove("touch-active");
                            }
                            break;
                        default:
                            target.dispatchEvent(event);
                    }
                    break;
                }
            case IncrementalSource.Scroll:
                {
                    if (d.id === -1) {
                        break;
                    }
                    if (this.usingVirtualDom) {
                        var target1 = this.virtualDom.mirror.getNode(d.id);
                        if (!target1) {
                            return this.debugNodeNotFound(d, d.id);
                        }
                        target1.scrollData = d;
                        break;
                    }
                    this.applyScroll(d, isSync);
                    break;
                }
            case IncrementalSource.ViewportResize:
                this.emitter.emit(ReplayerEvents.Resize, {
                    width: d.width,
                    height: d.height
                });
                break;
            case IncrementalSource.Input:
                {
                    if (d.id === -1) {
                        break;
                    }
                    if (this.usingVirtualDom) {
                        var target2 = this.virtualDom.mirror.getNode(d.id);
                        if (!target2) {
                            return this.debugNodeNotFound(d, d.id);
                        }
                        target2.inputData = d;
                        break;
                    }
                    this.applyInput(d);
                    break;
                }
            case IncrementalSource.MediaInteraction:
                {
                    var target3 = this.usingVirtualDom ? this.virtualDom.mirror.getNode(d.id) : this.mirror.getNode(d.id);
                    if (!target3) {
                        return this.debugNodeNotFound(d, d.id);
                    }
                    var mediaEl = target3;
                    var events = this.service.state.context.events;
                    this.mediaManager.mediaMutation({
                        target: mediaEl,
                        timeOffset: e2.timestamp - events[0].timestamp,
                        mutation: d
                    });
                    break;
                }
            case IncrementalSource.StyleSheetRule:
            case IncrementalSource.StyleDeclaration:
                {
                    if (this.usingVirtualDom) {
                        if (d.styleId) this.constructedStyleMutations.push(d);
                        else if (d.id) (_b = this.virtualDom.mirror.getNode(d.id)) == null ? void 0 : _b.rules.push(d);
                    } else this.applyStyleSheetMutation(d);
                    break;
                }
            case IncrementalSource.CanvasMutation:
                {
                    if (!this.config.UNSAFE_replayCanvas) {
                        return;
                    }
                    if (this.usingVirtualDom) {
                        var target4 = this.virtualDom.mirror.getNode(d.id);
                        if (!target4) {
                            return this.debugNodeNotFound(d, d.id);
                        }
                        target4.canvasMutations.push({
                            event: e2,
                            mutation: d
                        });
                    } else {
                        var target5 = this.mirror.getNode(d.id);
                        if (!target5) {
                            return this.debugNodeNotFound(d, d.id);
                        }
                        void canvasMutation({
                            event: e2,
                            mutation: d,
                            target: target5,
                            imageMap: this.imageMap,
                            canvasEventMap: this.canvasEventMap,
                            errorHandler: this.warnCanvasMutationFailed.bind(this)
                        });
                    }
                    break;
                }
            case IncrementalSource.Font:
                {
                    try {
                        var fontFace = new FontFace(d.family, d.buffer ? new Uint8Array(JSON.parse(d.fontSource)) : d.fontSource, d.descriptors);
                        (_c = this.iframe.contentDocument) == null ? void 0 : _c.fonts.add(fontFace);
                    } catch (error) {
                        this.warn(error);
                    }
                    break;
                }
            case IncrementalSource.Selection:
                {
                    if (isSync) {
                        this.lastSelectionData = d;
                        break;
                    }
                    this.applySelection(d);
                    break;
                }
            case IncrementalSource.AdoptedStyleSheet:
                {
                    if (this.usingVirtualDom) this.adoptedStyleSheets.push(d);
                    else this.applyAdoptedStyleSheet(d);
                    break;
                }
        }
    };
    /**
   * Apply the mutation to the virtual dom or the real dom.
   * @param d - The mutation data.
   * @param isSync - Whether the mutation should be applied synchronously (while fast-forwarding).
   */ _proto.applyMutation = function applyMutation(d, isSync) {
        var _this = this;
        if (this.config.useVirtualDom && !this.usingVirtualDom && isSync) {
            this.usingVirtualDom = true;
            buildFromDom(this.iframe.contentDocument, this.mirror, this.virtualDom);
            if (Object.keys(this.legacy_missingNodeRetryMap).length) {
                for(var key in this.legacy_missingNodeRetryMap){
                    try {
                        var value = this.legacy_missingNodeRetryMap[key];
                        var virtualNode = buildFromNode(value.node, this.virtualDom, this.mirror);
                        if (virtualNode) value.node = virtualNode;
                    } catch (error) {
                        this.warn(error);
                    }
                }
            }
        }
        var mirror2 = this.usingVirtualDom ? this.virtualDom.mirror : this.mirror;
        d.removes = d.removes.filter(function(mutation) {
            if (!mirror2.getNode(mutation.id)) {
                _this.warnNodeNotFound(d, mutation.id);
                return false;
            }
            return true;
        });
        d.removes.forEach(function(mutation) {
            var _a2;
            var target = mirror2.getNode(mutation.id);
            if (!target) {
                return;
            }
            var parent = mirror2.getNode(mutation.parentId);
            if (!parent) {
                return _this.warnNodeNotFound(d, mutation.parentId);
            }
            if (mutation.isShadow && hasShadowRoot(parent)) {
                parent = parent.shadowRoot;
            }
            mirror2.removeNodeFromMap(target);
            if (parent) try {
                parent.removeChild(target);
                if (_this.usingVirtualDom && target.nodeName === "#text" && parent.nodeName === "STYLE" && ((_a2 = parent.rules) == null ? void 0 : _a2.length) > 0) parent.rules = [];
            } catch (error) {
                if (_instanceof(error, DOMException)) {
                    _this.warn("parent could not remove child in mutation", parent, target, d);
                } else {
                    throw error;
                }
            }
        });
        var legacy_missingNodeMap = _extends({}, this.legacy_missingNodeRetryMap);
        var queue = [];
        var nextNotInDOM = function(mutation) {
            var next = null;
            if (mutation.nextId) {
                next = mirror2.getNode(mutation.nextId);
            }
            if (mutation.nextId !== null && mutation.nextId !== void 0 && mutation.nextId !== -1 && !next) {
                return true;
            }
            return false;
        };
        var appendNode = function(mutation) {
            var _a2, _b;
            if (!_this.iframe.contentDocument) {
                return _this.warn("Looks like your replayer has been destroyed.");
            }
            var parent = mirror2.getNode(mutation.parentId);
            if (!parent) {
                if (mutation.node.type === NodeType.Document) {
                    return _this.newDocumentQueue.push(mutation);
                }
                return queue.push(mutation);
            }
            if (mutation.node.isShadow) {
                if (!hasShadowRoot(parent)) {
                    parent.attachShadow({
                        mode: "open"
                    });
                    parent = parent.shadowRoot;
                } else parent = parent.shadowRoot;
            }
            var previous = null;
            var next = null;
            if (mutation.previousId) {
                previous = mirror2.getNode(mutation.previousId);
            }
            if (mutation.nextId) {
                next = mirror2.getNode(mutation.nextId);
            }
            if (nextNotInDOM(mutation)) {
                return queue.push(mutation);
            }
            if (mutation.node.rootId && !mirror2.getNode(mutation.node.rootId)) {
                return;
            }
            var targetDoc = mutation.node.rootId ? mirror2.getNode(mutation.node.rootId) : _this.usingVirtualDom ? _this.virtualDom : _this.iframe.contentDocument;
            if (isSerializedIframe(parent, mirror2)) {
                _this.attachDocumentToIframe(mutation, parent);
                return;
            }
            var afterAppend = function(node2, id) {
                if (_this.usingVirtualDom) return;
                applyDialogToTopLevel(node2);
                for(var _iterator = _create_for_of_iterator_helper_loose(_this.config.plugins || []), _step; !(_step = _iterator()).done;){
                    var plugin3 = _step.value;
                    if (plugin3.onBuild) plugin3.onBuild(node2, {
                        id: id,
                        replayer: _this
                    });
                }
            };
            var target = buildNodeWithSN(mutation.node, {
                doc: targetDoc,
                // can be Document or RRDocument
                mirror: mirror2,
                // can be this.mirror or virtualDom.mirror
                skipChild: true,
                hackCss: true,
                cache: _this.cache,
                /**
         * caveat: `afterAppend` only gets called on child nodes of target
         * we have to call it again below when this target was added to the DOM
         */ afterAppend: afterAppend
            });
            if (mutation.previousId === -1 || mutation.nextId === -1) {
                legacy_missingNodeMap[mutation.node.id] = {
                    node: target,
                    mutation: mutation
                };
                return;
            }
            var parentSn = mirror2.getMeta(parent);
            if (parentSn && parentSn.type === NodeType.Element && mutation.node.type === NodeType.Text) {
                var prospectiveSiblings = Array.isArray(parent.childNodes) ? parent.childNodes : Array.from(parent.childNodes);
                if (parentSn.tagName === "textarea") {
                    for(var _iterator = _create_for_of_iterator_helper_loose(prospectiveSiblings), _step; !(_step = _iterator()).done;){
                        var c2 = _step.value;
                        if (c2.nodeType === parent.TEXT_NODE) {
                            parent.removeChild(c2);
                        }
                    }
                } else if (parentSn.tagName === "style" && prospectiveSiblings.length === 1) {
                    for(var _iterator1 = _create_for_of_iterator_helper_loose(prospectiveSiblings), _step1; !(_step1 = _iterator1()).done;){
                        var cssText = _step1.value;
                        if (cssText.nodeType === parent.TEXT_NODE && !mirror2.hasNode(cssText)) {
                            target.textContent = cssText.textContent;
                            parent.removeChild(cssText);
                        }
                    }
                }
            } else if ((parentSn == null ? void 0 : parentSn.type) === NodeType.Document) {
                var parentDoc = parent;
                if (mutation.node.type === NodeType.DocumentType && ((_a2 = parentDoc.childNodes[0]) == null ? void 0 : _a2.nodeType) === Node.DOCUMENT_TYPE_NODE) parentDoc.removeChild(parentDoc.childNodes[0]);
                if (target.nodeName === "HTML" && parentDoc.documentElement) parentDoc.removeChild(parentDoc.documentElement);
            }
            if (previous && previous.nextSibling && previous.nextSibling.parentNode) {
                parent.insertBefore(target, previous.nextSibling);
            } else if (next && next.parentNode) {
                parent.contains(next) ? parent.insertBefore(target, next) : parent.insertBefore(target, null);
            } else {
                parent.appendChild(target);
            }
            afterAppend(target, mutation.node.id);
            if (_this.usingVirtualDom && target.nodeName === "#text" && parent.nodeName === "STYLE" && ((_b = parent.rules) == null ? void 0 : _b.length) > 0) parent.rules = [];
            if (isSerializedIframe(target, _this.mirror)) {
                var targetId = _this.mirror.getId(target);
                var mutationInQueue = _this.newDocumentQueue.find(function(m) {
                    return m.parentId === targetId;
                });
                if (mutationInQueue) {
                    _this.attachDocumentToIframe(mutationInQueue, target);
                    _this.newDocumentQueue = _this.newDocumentQueue.filter(function(m) {
                        return m !== mutationInQueue;
                    });
                }
            }
            if (mutation.previousId || mutation.nextId) {
                _this.legacy_resolveMissingNode(legacy_missingNodeMap, parent, target, mutation);
            }
        };
        d.adds.forEach(function(mutation) {
            appendNode(mutation);
        });
        var startTime = Date.now();
        while(queue.length){
            var resolveTrees = queueToResolveTrees(queue);
            queue.length = 0;
            if (Date.now() - startTime > 500) {
                this.warn("Timeout in the loop, please check the resolve tree data:", resolveTrees);
                break;
            }
            for(var _iterator = _create_for_of_iterator_helper_loose(resolveTrees), _step; !(_step = _iterator()).done;){
                var tree = _step.value;
                var parent = mirror2.getNode(tree.value.parentId);
                if (!parent) {
                    this.debug("Drop resolve tree since there is no parent for the root node.", tree);
                } else {
                    iterateResolveTree(tree, function(mutation) {
                        appendNode(mutation);
                    });
                }
            }
        }
        if (Object.keys(legacy_missingNodeMap).length) {
            Object.assign(this.legacy_missingNodeRetryMap, legacy_missingNodeMap);
        }
        uniqueTextMutations(d.texts).forEach(function(mutation) {
            var _a2;
            var target = mirror2.getNode(mutation.id);
            if (!target) {
                if (d.removes.find(function(r2) {
                    return r2.id === mutation.id;
                })) {
                    return;
                }
                return _this.warnNodeNotFound(d, mutation.id);
            }
            var parentEl = target.parentElement;
            if (mutation.value && parentEl && parentEl.tagName === "STYLE") {
                target.textContent = adaptCssForReplay(mutation.value, _this.cache);
            } else {
                target.textContent = mutation.value;
            }
            if (_this.usingVirtualDom) {
                var parent = target.parentNode;
                if (((_a2 = parent == null ? void 0 : parent.rules) == null ? void 0 : _a2.length) > 0) parent.rules = [];
            }
        });
        d.attributes.forEach(function(mutation) {
            var _loop = function(attributeName) {
                if (typeof attributeName === "string") {
                    var value = mutation.attributes[attributeName];
                    if (value === null) {
                        target.removeAttribute(attributeName);
                        if (attributeName === "open") removeDialogFromTopLevel(target, mutation);
                    } else if (typeof value === "string") {
                        try {
                            if (attributeName === "_cssText" && (target.nodeName === "LINK" || target.nodeName === "STYLE")) {
                                try {
                                    var newSn = mirror2.getMeta(target);
                                    Object.assign(newSn.attributes, mutation.attributes);
                                    var newNode = buildNodeWithSN(newSn, {
                                        doc: target.ownerDocument,
                                        // can be Document or RRDocument
                                        mirror: mirror2,
                                        skipChild: true,
                                        hackCss: true,
                                        cache: _this.cache
                                    });
                                    var siblingNode = target.nextSibling;
                                    var parentNode2 = target.parentNode;
                                    if (newNode && parentNode2) {
                                        parentNode2.removeChild(target);
                                        parentNode2.insertBefore(newNode, siblingNode);
                                        mirror2.replace(mutation.id, newNode);
                                        return "break";
                                    }
                                } catch (e2) {}
                            }
                            if (attributeName === "value" && target.nodeName === "TEXTAREA") {
                                var textarea = target;
                                textarea.childNodes.forEach(function(c2) {
                                    return textarea.removeChild(c2);
                                });
                                var tn = (_a2 = target.ownerDocument) == null ? void 0 : _a2.createTextNode(value);
                                if (tn) {
                                    textarea.appendChild(tn);
                                }
                            } else {
                                target.setAttribute(attributeName, value);
                            }
                            if (attributeName === "rr_open_mode" && target.nodeName === "DIALOG") {
                                applyDialogToTopLevel(target, mutation);
                            }
                        } catch (error) {
                            _this.warn("An error occurred may due to the checkout feature.", error);
                        }
                    } else if (attributeName === "style") {
                        var styleValues = value;
                        var targetEl = target;
                        for(var s2 in styleValues){
                            if (styleValues[s2] === false) {
                                targetEl.style.removeProperty(s2);
                            } else if (_instanceof(styleValues[s2], Array)) {
                                var svp = styleValues[s2];
                                targetEl.style.setProperty(s2, svp[0], svp[1]);
                            } else {
                                var svs = styleValues[s2];
                                targetEl.style.setProperty(s2, svs);
                            }
                        }
                    }
                }
            };
            var _a2;
            var target = mirror2.getNode(mutation.id);
            if (!target) {
                if (d.removes.find(function(r2) {
                    return r2.id === mutation.id;
                })) {
                    return;
                }
                return _this.warnNodeNotFound(d, mutation.id);
            }
            for(var attributeName in mutation.attributes){
                var _ret = _loop(attributeName);
                if (_ret === "break") break;
            }
        });
    };
    /**
   * Apply the scroll data on real elements.
   * If the replayer is in sync mode, smooth scroll behavior should be disabled.
   * @param d - the scroll data
   * @param isSync - whether the replayer is in sync mode(fast-forward)
   */ _proto.applyScroll = function applyScroll(d, isSync) {
        var _a2, _b;
        var target = this.mirror.getNode(d.id);
        if (!target) {
            return this.debugNodeNotFound(d, d.id);
        }
        var sn = this.mirror.getMeta(target);
        if (target === this.iframe.contentDocument) {
            (_a2 = this.iframe.contentWindow) == null ? void 0 : _a2.scrollTo({
                top: d.y,
                left: d.x,
                behavior: isSync ? "auto" : "smooth"
            });
        } else if ((sn == null ? void 0 : sn.type) === NodeType.Document) {
            (_b = target.defaultView) == null ? void 0 : _b.scrollTo({
                top: d.y,
                left: d.x,
                behavior: isSync ? "auto" : "smooth"
            });
        } else {
            try {
                target.scrollTo({
                    top: d.y,
                    left: d.x,
                    behavior: isSync ? "auto" : "smooth"
                });
            } catch (error) {}
        }
    };
    _proto.applyInput = function applyInput(d) {
        var target = this.mirror.getNode(d.id);
        if (!target) {
            return this.debugNodeNotFound(d, d.id);
        }
        try {
            target.checked = d.isChecked;
            target.value = d.text;
        } catch (error) {}
    };
    _proto.applySelection = function applySelection(d) {
        var _this = this;
        try {
            var selectionSet = /* @__PURE__ */ new Set();
            var ranges = d.ranges.map(function(param) {
                var start = param.start, startOffset = param.startOffset, end = param.end, endOffset = param.endOffset;
                var startContainer = _this.mirror.getNode(start);
                var endContainer = _this.mirror.getNode(end);
                if (!startContainer || !endContainer) return;
                var result2 = new Range();
                result2.setStart(startContainer, startOffset);
                result2.setEnd(endContainer, endOffset);
                var doc = startContainer.ownerDocument;
                var selection = doc == null ? void 0 : doc.getSelection();
                selection && selectionSet.add(selection);
                return {
                    range: result2,
                    selection: selection
                };
            });
            selectionSet.forEach(function(s2) {
                return s2.removeAllRanges();
            });
            ranges.forEach(function(r2) {
                var _a2;
                return r2 && ((_a2 = r2.selection) == null ? void 0 : _a2.addRange(r2.range));
            });
        } catch (error) {}
    };
    _proto.applyStyleSheetMutation = function applyStyleSheetMutation(data) {
        var _a2;
        var styleSheet = null;
        if (data.styleId) styleSheet = this.styleMirror.getStyle(data.styleId);
        else if (data.id) styleSheet = ((_a2 = this.mirror.getNode(data.id)) == null ? void 0 : _a2.sheet) || null;
        if (!styleSheet) return;
        if (data.source === IncrementalSource.StyleSheetRule) this.applyStyleSheetRule(data, styleSheet);
        else if (data.source === IncrementalSource.StyleDeclaration) this.applyStyleDeclaration(data, styleSheet);
    };
    _proto.applyStyleSheetRule = function applyStyleSheetRule(data, styleSheet) {
        var _a2, _b, _c, _d;
        (_a2 = data.adds) == null ? void 0 : _a2.forEach(function(param) {
            var rule2 = param.rule, nestedIndex = param.index;
            try {
                if (Array.isArray(nestedIndex)) {
                    var _getPositionsAndIndex = getPositionsAndIndex(nestedIndex), positions = _getPositionsAndIndex.positions, index2 = _getPositionsAndIndex.index;
                    var nestedRule = getNestedRule(styleSheet.cssRules, positions);
                    nestedRule.insertRule(rule2, index2);
                } else {
                    var index21 = nestedIndex === void 0 ? void 0 : Math.min(nestedIndex, styleSheet.cssRules.length);
                    styleSheet == null ? void 0 : styleSheet.insertRule(rule2, index21);
                }
            } catch (e2) {}
        });
        (_b = data.removes) == null ? void 0 : _b.forEach(function(param) {
            var nestedIndex = param.index;
            try {
                if (Array.isArray(nestedIndex)) {
                    var _getPositionsAndIndex = getPositionsAndIndex(nestedIndex), positions = _getPositionsAndIndex.positions, index2 = _getPositionsAndIndex.index;
                    var nestedRule = getNestedRule(styleSheet.cssRules, positions);
                    nestedRule.deleteRule(index2 || 0);
                } else {
                    styleSheet == null ? void 0 : styleSheet.deleteRule(nestedIndex);
                }
            } catch (e2) {}
        });
        if (data.replace) try {
            void ((_c = styleSheet.replace) == null ? void 0 : _c.call(styleSheet, data.replace));
        } catch (e2) {}
        if (data.replaceSync) try {
            (_d = styleSheet.replaceSync) == null ? void 0 : _d.call(styleSheet, data.replaceSync);
        } catch (e2) {}
    };
    _proto.applyStyleDeclaration = function applyStyleDeclaration(data, styleSheet) {
        if (data.set) {
            var rule2 = getNestedRule(styleSheet.rules, data.index);
            rule2.style.setProperty(data.set.property, data.set.value, data.set.priority);
        }
        if (data.remove) {
            var rule21 = getNestedRule(styleSheet.rules, data.index);
            rule21.style.removeProperty(data.remove.property);
        }
    };
    _proto.applyAdoptedStyleSheet = function applyAdoptedStyleSheet(data) {
        var _this = this;
        var _a2;
        var targetHost = this.mirror.getNode(data.id);
        if (!targetHost) return;
        (_a2 = data.styles) == null ? void 0 : _a2.forEach(function(style) {
            var _a3;
            var newStyleSheet = null;
            var hostWindow = null;
            if (hasShadowRoot(targetHost)) hostWindow = ((_a3 = targetHost.ownerDocument) == null ? void 0 : _a3.defaultView) || null;
            else if (targetHost.nodeName === "#document") hostWindow = targetHost.defaultView;
            if (!hostWindow) return;
            try {
                newStyleSheet = new hostWindow.CSSStyleSheet();
                _this.styleMirror.add(newStyleSheet, style.styleId);
                _this.applyStyleSheetRule({
                    source: IncrementalSource.StyleSheetRule,
                    adds: style.rules
                }, newStyleSheet);
            } catch (e2) {}
        });
        var MAX_RETRY_TIME = 10;
        var count = 0;
        var adoptStyleSheets = function(targetHost2, styleIds) {
            var stylesToAdopt = styleIds.map(function(styleId) {
                return _this.styleMirror.getStyle(styleId);
            }).filter(function(style) {
                return style !== null;
            });
            if (hasShadowRoot(targetHost2)) targetHost2.shadowRoot.adoptedStyleSheets = stylesToAdopt;
            else if (targetHost2.nodeName === "#document") targetHost2.adoptedStyleSheets = stylesToAdopt;
            if (stylesToAdopt.length !== styleIds.length && count < MAX_RETRY_TIME) {
                setTimeout(function() {
                    return adoptStyleSheets(targetHost2, styleIds);
                }, 0 + 100 * count);
                count++;
            }
        };
        adoptStyleSheets(targetHost, data.styleIds);
    };
    _proto.legacy_resolveMissingNode = function legacy_resolveMissingNode(map, parent, target, targetMutation) {
        var previousId = targetMutation.previousId, nextId = targetMutation.nextId;
        var previousInMap = previousId && map[previousId];
        var nextInMap = nextId && map[nextId];
        if (previousInMap) {
            var node2 = previousInMap.node, mutation = previousInMap.mutation;
            parent.insertBefore(node2, target);
            delete map[mutation.node.id];
            delete this.legacy_missingNodeRetryMap[mutation.node.id];
            if (mutation.previousId || mutation.nextId) {
                this.legacy_resolveMissingNode(map, parent, node2, mutation);
            }
        }
        if (nextInMap) {
            var node21 = nextInMap.node, mutation1 = nextInMap.mutation;
            parent.insertBefore(node21, target.nextSibling);
            delete map[mutation1.node.id];
            delete this.legacy_missingNodeRetryMap[mutation1.node.id];
            if (mutation1.previousId || mutation1.nextId) {
                this.legacy_resolveMissingNode(map, parent, node21, mutation1);
            }
        }
    };
    _proto.moveAndHover = function moveAndHover(x2, y, id, isSync, debugData) {
        var target = this.mirror.getNode(id);
        if (!target) {
            return this.debugNodeNotFound(debugData, id);
        }
        var base = getBaseDimension(target, this.iframe);
        var _x = x2 * base.absoluteScale + base.x;
        var _y = y * base.absoluteScale + base.y;
        this.mouse.style.left = "" + _x + "px";
        this.mouse.style.top = "" + _y + "px";
        if (!isSync) {
            this.drawMouseTail({
                x: _x,
                y: _y
            });
        }
        this.hoverElements(target);
    };
    _proto.drawMouseTail = function drawMouseTail(position) {
        var _this = this;
        if (!this.mouseTail) {
            return;
        }
        var _ref = this.config.mouseTail === true ? defaultMouseTailConfig : Object.assign({}, defaultMouseTailConfig, this.config.mouseTail), lineCap = _ref.lineCap, lineWidth = _ref.lineWidth, strokeStyle = _ref.strokeStyle, duration = _ref.duration;
        var draw = function() {
            if (!_this.mouseTail) {
                return;
            }
            var ctx = _this.mouseTail.getContext("2d");
            if (!ctx || !_this.tailPositions.length) {
                return;
            }
            ctx.clearRect(0, 0, _this.mouseTail.width, _this.mouseTail.height);
            ctx.beginPath();
            ctx.lineWidth = lineWidth;
            ctx.lineCap = lineCap;
            ctx.strokeStyle = strokeStyle;
            ctx.moveTo(_this.tailPositions[0].x, _this.tailPositions[0].y);
            _this.tailPositions.forEach(function(p) {
                return ctx.lineTo(p.x, p.y);
            });
            ctx.stroke();
        };
        this.tailPositions.push(position);
        draw();
        setTimeout(function() {
            _this.tailPositions = _this.tailPositions.filter(function(p) {
                return p !== position;
            });
            draw();
        }, duration / this.speedService.state.context.timer.speed);
    };
    _proto.hoverElements = function hoverElements(el) {
        var _a2;
        (_a2 = this.lastHoveredRootNode || this.iframe.contentDocument) == null ? void 0 : _a2.querySelectorAll(".\\:hover").forEach(function(hoveredEl) {
            hoveredEl.classList.remove(":hover");
        });
        this.lastHoveredRootNode = el.getRootNode();
        var currentEl = el;
        while(currentEl){
            if (currentEl.classList) {
                currentEl.classList.add(":hover");
            }
            currentEl = currentEl.parentElement;
        }
    };
    _proto.isUserInteraction = function isUserInteraction(event) {
        if (event.type !== EventType.IncrementalSnapshot) {
            return false;
        }
        return event.data.source > IncrementalSource.Mutation && event.data.source <= IncrementalSource.Input;
    };
    _proto.backToNormal = function backToNormal() {
        this.nextUserInteractionEvent = null;
        if (this.speedService.state.matches("normal")) {
            return;
        }
        this.speedService.send({
            type: "BACK_TO_NORMAL"
        });
        this.emitter.emit(ReplayerEvents.SkipEnd, {
            speed: this.speedService.state.context.normalSpeed
        });
    };
    _proto.warnNodeNotFound = function warnNodeNotFound(d, id) {
        this.warn("Node with id '" + id + "' not found. ", d);
    };
    _proto.warnCanvasMutationFailed = function warnCanvasMutationFailed(d, error) {
        this.warn("Has error on canvas update", error, "canvas mutation:", d);
    };
    _proto.debugNodeNotFound = function debugNodeNotFound(d, id) {
        this.debug("Node with id '" + id + "' not found. ", d);
    };
    _proto.warn = function warn() {
        for(var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++){
            args[_key] = arguments[_key];
        }
        var _this_config_logger;
        if (!this.config.showWarning) {
            return;
        }
        (_this_config_logger = this.config.logger).warn.apply(_this_config_logger, [].concat([
            REPLAY_CONSOLE_PREFIX
        ], args));
    };
    _proto.debug = function debug() {
        for(var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++){
            args[_key] = arguments[_key];
        }
        var _this_config_logger;
        if (!this.config.showDebug) {
            return;
        }
        (_this_config_logger = this.config.logger).log.apply(_this_config_logger, [].concat([
            REPLAY_CONSOLE_PREFIX
        ], args));
    };
    _create_class(Replayer, [
        {
            key: "timer",
            get: function get() {
                return this.service.state.context.timer;
            }
        }
    ]);
    return Replayer;
}();
var addCustomEvent = record.addCustomEvent;
var freezePage = record.freezePage;
var takeFullSnapshot = record.takeFullSnapshot;

export { EventType, IncrementalSource, MouseInteractions, Replayer, ReplayerEvents, addCustomEvent, canvasMutation, freezePage, _mirror as mirror, record, takeFullSnapshot, utils };
