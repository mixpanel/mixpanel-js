(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _srcLoadersLoaderModule = require('../../src/loaders/loader-module');

var _srcLoadersLoaderModule2 = _interopRequireDefault(_srcLoadersLoaderModule);

_srcLoadersLoaderModule2['default'].init("FAKE_TOKEN", {
    debug: true,
    loaded: function loaded() {
        _srcLoadersLoaderModule2['default'].track('loaded() callback works but is unnecessary');
        alert("Mixpanel loaded successfully via ES2015 Modules/Babelify");
    }
});

_srcLoadersLoaderModule2['default'].track('Tracking after mixpanel.init');

},{"../../src/loaders/loader-module":11}],2:[function(require,module,exports){
(function(global, factory) {
  typeof exports === "object" && typeof module !== "undefined" ? factory(exports) : typeof define === "function" && define.amd ? define(["exports"], factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, factory(global.rrwebTypes = {}));
})(this, function(exports2) {
  "use strict";
  var EventType = /* @__PURE__ */ ((EventType2) => {
    EventType2[EventType2["DomContentLoaded"] = 0] = "DomContentLoaded";
    EventType2[EventType2["Load"] = 1] = "Load";
    EventType2[EventType2["FullSnapshot"] = 2] = "FullSnapshot";
    EventType2[EventType2["IncrementalSnapshot"] = 3] = "IncrementalSnapshot";
    EventType2[EventType2["Meta"] = 4] = "Meta";
    EventType2[EventType2["Custom"] = 5] = "Custom";
    EventType2[EventType2["Plugin"] = 6] = "Plugin";
    return EventType2;
  })(EventType || {});
  var IncrementalSource = /* @__PURE__ */ ((IncrementalSource2) => {
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
  })(IncrementalSource || {});
  var MouseInteractions = /* @__PURE__ */ ((MouseInteractions2) => {
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
  })(MouseInteractions || {});
  var PointerTypes = /* @__PURE__ */ ((PointerTypes2) => {
    PointerTypes2[PointerTypes2["Mouse"] = 0] = "Mouse";
    PointerTypes2[PointerTypes2["Pen"] = 1] = "Pen";
    PointerTypes2[PointerTypes2["Touch"] = 2] = "Touch";
    return PointerTypes2;
  })(PointerTypes || {});
  var CanvasContext = /* @__PURE__ */ ((CanvasContext2) => {
    CanvasContext2[CanvasContext2["2D"] = 0] = "2D";
    CanvasContext2[CanvasContext2["WebGL"] = 1] = "WebGL";
    CanvasContext2[CanvasContext2["WebGL2"] = 2] = "WebGL2";
    return CanvasContext2;
  })(CanvasContext || {});
  var MediaInteractions = /* @__PURE__ */ ((MediaInteractions2) => {
    MediaInteractions2[MediaInteractions2["Play"] = 0] = "Play";
    MediaInteractions2[MediaInteractions2["Pause"] = 1] = "Pause";
    MediaInteractions2[MediaInteractions2["Seeked"] = 2] = "Seeked";
    MediaInteractions2[MediaInteractions2["VolumeChange"] = 3] = "VolumeChange";
    MediaInteractions2[MediaInteractions2["RateChange"] = 4] = "RateChange";
    return MediaInteractions2;
  })(MediaInteractions || {});
  var ReplayerEvents = /* @__PURE__ */ ((ReplayerEvents2) => {
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
  })(ReplayerEvents || {});
  exports2.CanvasContext = CanvasContext;
  exports2.EventType = EventType;
  exports2.IncrementalSource = IncrementalSource;
  exports2.MediaInteractions = MediaInteractions;
  exports2.MouseInteractions = MouseInteractions;
  exports2.PointerTypes = PointerTypes;
  exports2.ReplayerEvents = ReplayerEvents;
  Object.defineProperties(exports2, { __esModule: { value: true }, [Symbol.toStringTag]: { value: "Module" } });
});


},{}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var NodeType$2;
(function (NodeType) {
    NodeType[NodeType["Document"] = 0] = "Document";
    NodeType[NodeType["DocumentType"] = 1] = "DocumentType";
    NodeType[NodeType["Element"] = 2] = "Element";
    NodeType[NodeType["Text"] = 3] = "Text";
    NodeType[NodeType["CDATA"] = 4] = "CDATA";
    NodeType[NodeType["Comment"] = 5] = "Comment";
})(NodeType$2 || (NodeType$2 = {}));

function isElement(n) {
    return n.nodeType === n.ELEMENT_NODE;
}
function isShadowRoot(n) {
    const host = n === null || n === void 0 ? void 0 : n.host;
    return Boolean((host === null || host === void 0 ? void 0 : host.shadowRoot) === n);
}
function isNativeShadowDom(shadowRoot) {
    return Object.prototype.toString.call(shadowRoot) === '[object ShadowRoot]';
}
function fixBrowserCompatibilityIssuesInCSS(cssText) {
    if (cssText.includes(' background-clip: text;') &&
        !cssText.includes(' -webkit-background-clip: text;')) {
        cssText = cssText.replace(' background-clip: text;', ' -webkit-background-clip: text; background-clip: text;');
    }
    return cssText;
}
function escapeImportStatement(rule) {
    const { cssText } = rule;
    if (cssText.split('"').length < 3)
        return cssText;
    const statement = ['@import', `url(${JSON.stringify(rule.href)})`];
    if (rule.layerName === '') {
        statement.push(`layer`);
    }
    else if (rule.layerName) {
        statement.push(`layer(${rule.layerName})`);
    }
    if (rule.supportsText) {
        statement.push(`supports(${rule.supportsText})`);
    }
    if (rule.media.length) {
        statement.push(rule.media.mediaText);
    }
    return statement.join(' ') + ';';
}
function stringifyStylesheet(s) {
    try {
        const rules = s.rules || s.cssRules;
        return rules
            ? fixBrowserCompatibilityIssuesInCSS(Array.from(rules, stringifyRule).join(''))
            : null;
    }
    catch (error) {
        return null;
    }
}
function stringifyRule(rule) {
    let importStringified;
    if (isCSSImportRule(rule)) {
        try {
            importStringified =
                stringifyStylesheet(rule.styleSheet) ||
                    escapeImportStatement(rule);
        }
        catch (error) {
        }
    }
    else if (isCSSStyleRule(rule) && rule.selectorText.includes(':')) {
        return fixSafariColons(rule.cssText);
    }
    return importStringified || rule.cssText;
}
function fixSafariColons(cssStringified) {
    const regex = /(\[(?:[\w-]+)[^\\])(:(?:[\w-]+)\])/gm;
    return cssStringified.replace(regex, '$1\\$2');
}
function isCSSImportRule(rule) {
    return 'styleSheet' in rule;
}
function isCSSStyleRule(rule) {
    return 'selectorText' in rule;
}
class Mirror$2 {
    constructor() {
        this.idNodeMap = new Map();
        this.nodeMetaMap = new WeakMap();
    }
    getId(n) {
        var _a;
        if (!n)
            return -1;
        const id = (_a = this.getMeta(n)) === null || _a === void 0 ? void 0 : _a.id;
        return id !== null && id !== void 0 ? id : -1;
    }
    getNode(id) {
        return this.idNodeMap.get(id) || null;
    }
    getIds() {
        return Array.from(this.idNodeMap.keys());
    }
    getMeta(n) {
        return this.nodeMetaMap.get(n) || null;
    }
    removeNodeFromMap(n) {
        const id = this.getId(n);
        this.idNodeMap.delete(id);
        if (n.childNodes) {
            n.childNodes.forEach((childNode) => this.removeNodeFromMap(childNode));
        }
    }
    has(id) {
        return this.idNodeMap.has(id);
    }
    hasNode(node) {
        return this.nodeMetaMap.has(node);
    }
    add(n, meta) {
        const id = meta.id;
        this.idNodeMap.set(id, n);
        this.nodeMetaMap.set(n, meta);
    }
    replace(id, n) {
        const oldNode = this.getNode(id);
        if (oldNode) {
            const meta = this.nodeMetaMap.get(oldNode);
            if (meta)
                this.nodeMetaMap.set(n, meta);
        }
        this.idNodeMap.set(id, n);
    }
    reset() {
        this.idNodeMap = new Map();
        this.nodeMetaMap = new WeakMap();
    }
}
function createMirror$2() {
    return new Mirror$2();
}
function maskInputValue({ element, maskInputOptions, tagName, type, value, maskInputFn, }) {
    let text = value || '';
    const actualType = type && toLowerCase(type);
    if (maskInputOptions[tagName.toLowerCase()] ||
        (actualType && maskInputOptions[actualType])) {
        if (maskInputFn) {
            text = maskInputFn(text, element);
        }
        else {
            text = '*'.repeat(text.length);
        }
    }
    return text;
}
function toLowerCase(str) {
    return str.toLowerCase();
}
const ORIGINAL_ATTRIBUTE_NAME$1 = '__rrweb_original__';
function is2DCanvasBlank(canvas) {
    const ctx = canvas.getContext('2d');
    if (!ctx)
        return true;
    const chunkSize = 50;
    for (let x = 0; x < canvas.width; x += chunkSize) {
        for (let y = 0; y < canvas.height; y += chunkSize) {
            const getImageData = ctx.getImageData;
            const originalGetImageData = ORIGINAL_ATTRIBUTE_NAME$1 in getImageData
                ? getImageData[ORIGINAL_ATTRIBUTE_NAME$1]
                : getImageData;
            const pixelBuffer = new Uint32Array(originalGetImageData.call(ctx, x, y, Math.min(chunkSize, canvas.width - x), Math.min(chunkSize, canvas.height - y)).data.buffer);
            if (pixelBuffer.some((pixel) => pixel !== 0))
                return false;
        }
    }
    return true;
}
function isNodeMetaEqual(a, b) {
    if (!a || !b || a.type !== b.type)
        return false;
    if (a.type === NodeType$2.Document)
        return a.compatMode === b.compatMode;
    else if (a.type === NodeType$2.DocumentType)
        return (a.name === b.name &&
            a.publicId === b.publicId &&
            a.systemId === b.systemId);
    else if (a.type === NodeType$2.Comment ||
        a.type === NodeType$2.Text ||
        a.type === NodeType$2.CDATA)
        return a.textContent === b.textContent;
    else if (a.type === NodeType$2.Element)
        return (a.tagName === b.tagName &&
            JSON.stringify(a.attributes) ===
                JSON.stringify(b.attributes) &&
            a.isSVG === b.isSVG &&
            a.needBlock === b.needBlock);
    return false;
}
function getInputType(element) {
    const type = element.type;
    return element.hasAttribute('data-rr-is-password')
        ? 'password'
        : type
            ?
                toLowerCase(type)
            : null;
}
function extractFileExtension(path, baseURL) {
    var _a;
    let url;
    try {
        url = new URL(path, baseURL !== null && baseURL !== void 0 ? baseURL : window.location.href);
    }
    catch (err) {
        return null;
    }
    const regex = /\.([0-9a-z]+)(?:$)/i;
    const match = url.pathname.match(regex);
    return (_a = match === null || match === void 0 ? void 0 : match[1]) !== null && _a !== void 0 ? _a : null;
}

let _id = 1;
const tagNameRegex = new RegExp('[^a-z0-9-_:]');
const IGNORED_NODE = -2;
function genId() {
    return _id++;
}
function getValidTagName$1(element) {
    if (element instanceof HTMLFormElement) {
        return 'form';
    }
    const processedTagName = toLowerCase(element.tagName);
    if (tagNameRegex.test(processedTagName)) {
        return 'div';
    }
    return processedTagName;
}
function extractOrigin(url) {
    let origin = '';
    if (url.indexOf('//') > -1) {
        origin = url.split('/').slice(0, 3).join('/');
    }
    else {
        origin = url.split('/')[0];
    }
    origin = origin.split('?')[0];
    return origin;
}
let canvasService;
let canvasCtx;
const URL_IN_CSS_REF = /url\((?:(')([^']*)'|(")(.*?)"|([^)]*))\)/gm;
const URL_PROTOCOL_MATCH = /^(?:[a-z+]+:)?\/\//i;
const URL_WWW_MATCH = /^www\..*/i;
const DATA_URI = /^(data:)([^,]*),(.*)/i;
function absoluteToStylesheet(cssText, href) {
    return (cssText || '').replace(URL_IN_CSS_REF, (origin, quote1, path1, quote2, path2, path3) => {
        const filePath = path1 || path2 || path3;
        const maybeQuote = quote1 || quote2 || '';
        if (!filePath) {
            return origin;
        }
        if (URL_PROTOCOL_MATCH.test(filePath) || URL_WWW_MATCH.test(filePath)) {
            return `url(${maybeQuote}${filePath}${maybeQuote})`;
        }
        if (DATA_URI.test(filePath)) {
            return `url(${maybeQuote}${filePath}${maybeQuote})`;
        }
        if (filePath[0] === '/') {
            return `url(${maybeQuote}${extractOrigin(href) + filePath}${maybeQuote})`;
        }
        const stack = href.split('/');
        const parts = filePath.split('/');
        stack.pop();
        for (const part of parts) {
            if (part === '.') {
                continue;
            }
            else if (part === '..') {
                stack.pop();
            }
            else {
                stack.push(part);
            }
        }
        return `url(${maybeQuote}${stack.join('/')}${maybeQuote})`;
    });
}
const SRCSET_NOT_SPACES = /^[^ \t\n\r\u000c]+/;
const SRCSET_COMMAS_OR_SPACES = /^[, \t\n\r\u000c]+/;
function getAbsoluteSrcsetString(doc, attributeValue) {
    if (attributeValue.trim() === '') {
        return attributeValue;
    }
    let pos = 0;
    function collectCharacters(regEx) {
        let chars;
        const match = regEx.exec(attributeValue.substring(pos));
        if (match) {
            chars = match[0];
            pos += chars.length;
            return chars;
        }
        return '';
    }
    const output = [];
    while (true) {
        collectCharacters(SRCSET_COMMAS_OR_SPACES);
        if (pos >= attributeValue.length) {
            break;
        }
        let url = collectCharacters(SRCSET_NOT_SPACES);
        if (url.slice(-1) === ',') {
            url = absoluteToDoc(doc, url.substring(0, url.length - 1));
            output.push(url);
        }
        else {
            let descriptorsStr = '';
            url = absoluteToDoc(doc, url);
            let inParens = false;
            while (true) {
                const c = attributeValue.charAt(pos);
                if (c === '') {
                    output.push((url + descriptorsStr).trim());
                    break;
                }
                else if (!inParens) {
                    if (c === ',') {
                        pos += 1;
                        output.push((url + descriptorsStr).trim());
                        break;
                    }
                    else if (c === '(') {
                        inParens = true;
                    }
                }
                else {
                    if (c === ')') {
                        inParens = false;
                    }
                }
                descriptorsStr += c;
                pos += 1;
            }
        }
    }
    return output.join(', ');
}
function absoluteToDoc(doc, attributeValue) {
    if (!attributeValue || attributeValue.trim() === '') {
        return attributeValue;
    }
    const a = doc.createElement('a');
    a.href = attributeValue;
    return a.href;
}
function isSVGElement(el) {
    return Boolean(el.tagName === 'svg' || el.ownerSVGElement);
}
function getHref() {
    const a = document.createElement('a');
    a.href = '';
    return a.href;
}
function transformAttribute(doc, tagName, name, value) {
    if (!value) {
        return value;
    }
    if (name === 'src' ||
        (name === 'href' && !(tagName === 'use' && value[0] === '#'))) {
        return absoluteToDoc(doc, value);
    }
    else if (name === 'xlink:href' && value[0] !== '#') {
        return absoluteToDoc(doc, value);
    }
    else if (name === 'background' &&
        (tagName === 'table' || tagName === 'td' || tagName === 'th')) {
        return absoluteToDoc(doc, value);
    }
    else if (name === 'srcset') {
        return getAbsoluteSrcsetString(doc, value);
    }
    else if (name === 'style') {
        return absoluteToStylesheet(value, getHref());
    }
    else if (tagName === 'object' && name === 'data') {
        return absoluteToDoc(doc, value);
    }
    return value;
}
function ignoreAttribute(tagName, name, _value) {
    return (tagName === 'video' || tagName === 'audio') && name === 'autoplay';
}
function _isBlockedElement(element, blockClass, blockSelector) {
    try {
        if (typeof blockClass === 'string') {
            if (element.classList.contains(blockClass)) {
                return true;
            }
        }
        else {
            for (let eIndex = element.classList.length; eIndex--;) {
                const className = element.classList[eIndex];
                if (blockClass.test(className)) {
                    return true;
                }
            }
        }
        if (blockSelector) {
            return element.matches(blockSelector);
        }
    }
    catch (e) {
    }
    return false;
}
function classMatchesRegex(node, regex, checkAncestors) {
    if (!node)
        return false;
    if (node.nodeType !== node.ELEMENT_NODE) {
        if (!checkAncestors)
            return false;
        return classMatchesRegex(node.parentNode, regex, checkAncestors);
    }
    for (let eIndex = node.classList.length; eIndex--;) {
        const className = node.classList[eIndex];
        if (regex.test(className)) {
            return true;
        }
    }
    if (!checkAncestors)
        return false;
    return classMatchesRegex(node.parentNode, regex, checkAncestors);
}
function needMaskingText(node, maskTextClass, maskTextSelector, checkAncestors) {
    try {
        const el = node.nodeType === node.ELEMENT_NODE
            ? node
            : node.parentElement;
        if (el === null)
            return false;
        if (typeof maskTextClass === 'string') {
            if (checkAncestors) {
                if (el.closest(`.${maskTextClass}`))
                    return true;
            }
            else {
                if (el.classList.contains(maskTextClass))
                    return true;
            }
        }
        else {
            if (classMatchesRegex(el, maskTextClass, checkAncestors))
                return true;
        }
        if (maskTextSelector) {
            if (checkAncestors) {
                if (el.closest(maskTextSelector))
                    return true;
            }
            else {
                if (el.matches(maskTextSelector))
                    return true;
            }
        }
    }
    catch (e) {
    }
    return false;
}
function onceIframeLoaded(iframeEl, listener, iframeLoadTimeout) {
    const win = iframeEl.contentWindow;
    if (!win) {
        return;
    }
    let fired = false;
    let readyState;
    try {
        readyState = win.document.readyState;
    }
    catch (error) {
        return;
    }
    if (readyState !== 'complete') {
        const timer = setTimeout(() => {
            if (!fired) {
                listener();
                fired = true;
            }
        }, iframeLoadTimeout);
        iframeEl.addEventListener('load', () => {
            clearTimeout(timer);
            fired = true;
            listener();
        });
        return;
    }
    const blankUrl = 'about:blank';
    if (win.location.href !== blankUrl ||
        iframeEl.src === blankUrl ||
        iframeEl.src === '') {
        setTimeout(listener, 0);
        return iframeEl.addEventListener('load', listener);
    }
    iframeEl.addEventListener('load', listener);
}
function onceStylesheetLoaded(link, listener, styleSheetLoadTimeout) {
    let fired = false;
    let styleSheetLoaded;
    try {
        styleSheetLoaded = link.sheet;
    }
    catch (error) {
        return;
    }
    if (styleSheetLoaded)
        return;
    const timer = setTimeout(() => {
        if (!fired) {
            listener();
            fired = true;
        }
    }, styleSheetLoadTimeout);
    link.addEventListener('load', () => {
        clearTimeout(timer);
        fired = true;
        listener();
    });
}
function serializeNode(n, options) {
    const { doc, mirror, blockClass, blockSelector, needsMask, inlineStylesheet, maskInputOptions = {}, maskTextFn, maskInputFn, dataURLOptions = {}, inlineImages, recordCanvas, keepIframeSrcFn, newlyAddedElement = false, } = options;
    const rootId = getRootId(doc, mirror);
    switch (n.nodeType) {
        case n.DOCUMENT_NODE:
            if (n.compatMode !== 'CSS1Compat') {
                return {
                    type: NodeType$2.Document,
                    childNodes: [],
                    compatMode: n.compatMode,
                };
            }
            else {
                return {
                    type: NodeType$2.Document,
                    childNodes: [],
                };
            }
        case n.DOCUMENT_TYPE_NODE:
            return {
                type: NodeType$2.DocumentType,
                name: n.name,
                publicId: n.publicId,
                systemId: n.systemId,
                rootId,
            };
        case n.ELEMENT_NODE:
            return serializeElementNode(n, {
                doc,
                blockClass,
                blockSelector,
                inlineStylesheet,
                maskInputOptions,
                maskInputFn,
                dataURLOptions,
                inlineImages,
                recordCanvas,
                keepIframeSrcFn,
                newlyAddedElement,
                rootId,
            });
        case n.TEXT_NODE:
            return serializeTextNode(n, {
                needsMask,
                maskTextFn,
                rootId,
            });
        case n.CDATA_SECTION_NODE:
            return {
                type: NodeType$2.CDATA,
                textContent: '',
                rootId,
            };
        case n.COMMENT_NODE:
            return {
                type: NodeType$2.Comment,
                textContent: n.textContent || '',
                rootId,
            };
        default:
            return false;
    }
}
function getRootId(doc, mirror) {
    if (!mirror.hasNode(doc))
        return undefined;
    const docId = mirror.getId(doc);
    return docId === 1 ? undefined : docId;
}
function serializeTextNode(n, options) {
    var _a;
    const { needsMask, maskTextFn, rootId } = options;
    const parentTagName = n.parentNode && n.parentNode.tagName;
    let textContent = n.textContent;
    const isStyle = parentTagName === 'STYLE' ? true : undefined;
    const isScript = parentTagName === 'SCRIPT' ? true : undefined;
    if (isStyle && textContent) {
        try {
            if (n.nextSibling || n.previousSibling) {
            }
            else if ((_a = n.parentNode.sheet) === null || _a === void 0 ? void 0 : _a.cssRules) {
                textContent = stringifyStylesheet(n.parentNode.sheet);
            }
        }
        catch (err) {
            console.warn(`Cannot get CSS styles from text's parentNode. Error: ${err}`, n);
        }
        textContent = absoluteToStylesheet(textContent, getHref());
    }
    if (isScript) {
        textContent = 'SCRIPT_PLACEHOLDER';
    }
    if (!isStyle && !isScript && textContent && needsMask) {
        textContent = maskTextFn
            ? maskTextFn(textContent, n.parentElement)
            : textContent.replace(/[\S]/g, '*');
    }
    return {
        type: NodeType$2.Text,
        textContent: textContent || '',
        isStyle,
        rootId,
    };
}
function serializeElementNode(n, options) {
    const { doc, blockClass, blockSelector, inlineStylesheet, maskInputOptions = {}, maskInputFn, dataURLOptions = {}, inlineImages, recordCanvas, keepIframeSrcFn, newlyAddedElement = false, rootId, } = options;
    const needBlock = _isBlockedElement(n, blockClass, blockSelector);
    const tagName = getValidTagName$1(n);
    let attributes = {};
    const len = n.attributes.length;
    for (let i = 0; i < len; i++) {
        const attr = n.attributes[i];
        if (!ignoreAttribute(tagName, attr.name, attr.value)) {
            attributes[attr.name] = transformAttribute(doc, tagName, toLowerCase(attr.name), attr.value);
        }
    }
    if (tagName === 'link' && inlineStylesheet) {
        const stylesheet = Array.from(doc.styleSheets).find((s) => {
            return s.href === n.href;
        });
        let cssText = null;
        if (stylesheet) {
            cssText = stringifyStylesheet(stylesheet);
        }
        if (cssText) {
            delete attributes.rel;
            delete attributes.href;
            attributes._cssText = absoluteToStylesheet(cssText, stylesheet.href);
        }
    }
    if (tagName === 'style' &&
        n.sheet &&
        !(n.innerText || n.textContent || '').trim().length) {
        const cssText = stringifyStylesheet(n.sheet);
        if (cssText) {
            attributes._cssText = absoluteToStylesheet(cssText, getHref());
        }
    }
    if (tagName === 'input' || tagName === 'textarea' || tagName === 'select') {
        const value = n.value;
        const checked = n.checked;
        if (attributes.type !== 'radio' &&
            attributes.type !== 'checkbox' &&
            attributes.type !== 'submit' &&
            attributes.type !== 'button' &&
            value) {
            attributes.value = maskInputValue({
                element: n,
                type: getInputType(n),
                tagName,
                value,
                maskInputOptions,
                maskInputFn,
            });
        }
        else if (checked) {
            attributes.checked = checked;
        }
    }
    if (tagName === 'option') {
        if (n.selected && !maskInputOptions['select']) {
            attributes.selected = true;
        }
        else {
            delete attributes.selected;
        }
    }
    if (tagName === 'canvas' && recordCanvas) {
        if (n.__context === '2d') {
            if (!is2DCanvasBlank(n)) {
                attributes.rr_dataURL = n.toDataURL(dataURLOptions.type, dataURLOptions.quality);
            }
        }
        else if (!('__context' in n)) {
            const canvasDataURL = n.toDataURL(dataURLOptions.type, dataURLOptions.quality);
            const blankCanvas = document.createElement('canvas');
            blankCanvas.width = n.width;
            blankCanvas.height = n.height;
            const blankCanvasDataURL = blankCanvas.toDataURL(dataURLOptions.type, dataURLOptions.quality);
            if (canvasDataURL !== blankCanvasDataURL) {
                attributes.rr_dataURL = canvasDataURL;
            }
        }
    }
    if (tagName === 'img' && inlineImages) {
        if (!canvasService) {
            canvasService = doc.createElement('canvas');
            canvasCtx = canvasService.getContext('2d');
        }
        const image = n;
        const oldValue = image.crossOrigin;
        image.crossOrigin = 'anonymous';
        const recordInlineImage = () => {
            image.removeEventListener('load', recordInlineImage);
            try {
                canvasService.width = image.naturalWidth;
                canvasService.height = image.naturalHeight;
                canvasCtx.drawImage(image, 0, 0);
                attributes.rr_dataURL = canvasService.toDataURL(dataURLOptions.type, dataURLOptions.quality);
            }
            catch (err) {
                console.warn(`Cannot inline img src=${image.currentSrc}! Error: ${err}`);
            }
            oldValue
                ? (attributes.crossOrigin = oldValue)
                : image.removeAttribute('crossorigin');
        };
        if (image.complete && image.naturalWidth !== 0)
            recordInlineImage();
        else
            image.addEventListener('load', recordInlineImage);
    }
    if (tagName === 'audio' || tagName === 'video') {
        const mediaAttributes = attributes;
        mediaAttributes.rr_mediaState = n.paused
            ? 'paused'
            : 'played';
        mediaAttributes.rr_mediaCurrentTime = n.currentTime;
        mediaAttributes.rr_mediaPlaybackRate = n.playbackRate;
        mediaAttributes.rr_mediaMuted = n.muted;
        mediaAttributes.rr_mediaLoop = n.loop;
        mediaAttributes.rr_mediaVolume = n.volume;
    }
    if (!newlyAddedElement) {
        if (n.scrollLeft) {
            attributes.rr_scrollLeft = n.scrollLeft;
        }
        if (n.scrollTop) {
            attributes.rr_scrollTop = n.scrollTop;
        }
    }
    if (needBlock) {
        const { width, height } = n.getBoundingClientRect();
        attributes = {
            class: attributes.class,
            rr_width: `${width}px`,
            rr_height: `${height}px`,
        };
    }
    if (tagName === 'iframe' && !keepIframeSrcFn(attributes.src)) {
        if (!n.contentDocument) {
            attributes.rr_src = attributes.src;
        }
        delete attributes.src;
    }
    let isCustomElement;
    try {
        if (customElements.get(tagName))
            isCustomElement = true;
    }
    catch (e) {
    }
    return {
        type: NodeType$2.Element,
        tagName,
        attributes,
        childNodes: [],
        isSVG: isSVGElement(n) || undefined,
        needBlock,
        rootId,
        isCustom: isCustomElement,
    };
}
function lowerIfExists(maybeAttr) {
    if (maybeAttr === undefined || maybeAttr === null) {
        return '';
    }
    else {
        return maybeAttr.toLowerCase();
    }
}
function slimDOMExcluded(sn, slimDOMOptions) {
    if (slimDOMOptions.comment && sn.type === NodeType$2.Comment) {
        return true;
    }
    else if (sn.type === NodeType$2.Element) {
        if (slimDOMOptions.script &&
            (sn.tagName === 'script' ||
                (sn.tagName === 'link' &&
                    (sn.attributes.rel === 'preload' ||
                        sn.attributes.rel === 'modulepreload') &&
                    sn.attributes.as === 'script') ||
                (sn.tagName === 'link' &&
                    sn.attributes.rel === 'prefetch' &&
                    typeof sn.attributes.href === 'string' &&
                    extractFileExtension(sn.attributes.href) === 'js'))) {
            return true;
        }
        else if (slimDOMOptions.headFavicon &&
            ((sn.tagName === 'link' && sn.attributes.rel === 'shortcut icon') ||
                (sn.tagName === 'meta' &&
                    (lowerIfExists(sn.attributes.name).match(/^msapplication-tile(image|color)$/) ||
                        lowerIfExists(sn.attributes.name) === 'application-name' ||
                        lowerIfExists(sn.attributes.rel) === 'icon' ||
                        lowerIfExists(sn.attributes.rel) === 'apple-touch-icon' ||
                        lowerIfExists(sn.attributes.rel) === 'shortcut icon')))) {
            return true;
        }
        else if (sn.tagName === 'meta') {
            if (slimDOMOptions.headMetaDescKeywords &&
                lowerIfExists(sn.attributes.name).match(/^description|keywords$/)) {
                return true;
            }
            else if (slimDOMOptions.headMetaSocial &&
                (lowerIfExists(sn.attributes.property).match(/^(og|twitter|fb):/) ||
                    lowerIfExists(sn.attributes.name).match(/^(og|twitter):/) ||
                    lowerIfExists(sn.attributes.name) === 'pinterest')) {
                return true;
            }
            else if (slimDOMOptions.headMetaRobots &&
                (lowerIfExists(sn.attributes.name) === 'robots' ||
                    lowerIfExists(sn.attributes.name) === 'googlebot' ||
                    lowerIfExists(sn.attributes.name) === 'bingbot')) {
                return true;
            }
            else if (slimDOMOptions.headMetaHttpEquiv &&
                sn.attributes['http-equiv'] !== undefined) {
                return true;
            }
            else if (slimDOMOptions.headMetaAuthorship &&
                (lowerIfExists(sn.attributes.name) === 'author' ||
                    lowerIfExists(sn.attributes.name) === 'generator' ||
                    lowerIfExists(sn.attributes.name) === 'framework' ||
                    lowerIfExists(sn.attributes.name) === 'publisher' ||
                    lowerIfExists(sn.attributes.name) === 'progid' ||
                    lowerIfExists(sn.attributes.property).match(/^article:/) ||
                    lowerIfExists(sn.attributes.property).match(/^product:/))) {
                return true;
            }
            else if (slimDOMOptions.headMetaVerification &&
                (lowerIfExists(sn.attributes.name) === 'google-site-verification' ||
                    lowerIfExists(sn.attributes.name) === 'yandex-verification' ||
                    lowerIfExists(sn.attributes.name) === 'csrf-token' ||
                    lowerIfExists(sn.attributes.name) === 'p:domain_verify' ||
                    lowerIfExists(sn.attributes.name) === 'verify-v1' ||
                    lowerIfExists(sn.attributes.name) === 'verification' ||
                    lowerIfExists(sn.attributes.name) === 'shopify-checkout-api-token')) {
                return true;
            }
        }
    }
    return false;
}
function serializeNodeWithId(n, options) {
    const { doc, mirror, blockClass, blockSelector, maskTextClass, maskTextSelector, skipChild = false, inlineStylesheet = true, maskInputOptions = {}, maskTextFn, maskInputFn, slimDOMOptions, dataURLOptions = {}, inlineImages = false, recordCanvas = false, onSerialize, onIframeLoad, iframeLoadTimeout = 5000, onStylesheetLoad, stylesheetLoadTimeout = 5000, keepIframeSrcFn = () => false, newlyAddedElement = false, } = options;
    let { needsMask } = options;
    let { preserveWhiteSpace = true } = options;
    if (!needsMask &&
        n.childNodes) {
        const checkAncestors = needsMask === undefined;
        needsMask = needMaskingText(n, maskTextClass, maskTextSelector, checkAncestors);
    }
    const _serializedNode = serializeNode(n, {
        doc,
        mirror,
        blockClass,
        blockSelector,
        needsMask,
        inlineStylesheet,
        maskInputOptions,
        maskTextFn,
        maskInputFn,
        dataURLOptions,
        inlineImages,
        recordCanvas,
        keepIframeSrcFn,
        newlyAddedElement,
    });
    if (!_serializedNode) {
        console.warn(n, 'not serialized');
        return null;
    }
    let id;
    if (mirror.hasNode(n)) {
        id = mirror.getId(n);
    }
    else if (slimDOMExcluded(_serializedNode, slimDOMOptions) ||
        (!preserveWhiteSpace &&
            _serializedNode.type === NodeType$2.Text &&
            !_serializedNode.isStyle &&
            !_serializedNode.textContent.replace(/^\s+|\s+$/gm, '').length)) {
        id = IGNORED_NODE;
    }
    else {
        id = genId();
    }
    const serializedNode = Object.assign(_serializedNode, { id });
    mirror.add(n, serializedNode);
    if (id === IGNORED_NODE) {
        return null;
    }
    if (onSerialize) {
        onSerialize(n);
    }
    let recordChild = !skipChild;
    if (serializedNode.type === NodeType$2.Element) {
        recordChild = recordChild && !serializedNode.needBlock;
        delete serializedNode.needBlock;
        const shadowRoot = n.shadowRoot;
        if (shadowRoot && isNativeShadowDom(shadowRoot))
            serializedNode.isShadowHost = true;
    }
    if ((serializedNode.type === NodeType$2.Document ||
        serializedNode.type === NodeType$2.Element) &&
        recordChild) {
        if (slimDOMOptions.headWhitespace &&
            serializedNode.type === NodeType$2.Element &&
            serializedNode.tagName === 'head') {
            preserveWhiteSpace = false;
        }
        const bypassOptions = {
            doc,
            mirror,
            blockClass,
            blockSelector,
            needsMask,
            maskTextClass,
            maskTextSelector,
            skipChild,
            inlineStylesheet,
            maskInputOptions,
            maskTextFn,
            maskInputFn,
            slimDOMOptions,
            dataURLOptions,
            inlineImages,
            recordCanvas,
            preserveWhiteSpace,
            onSerialize,
            onIframeLoad,
            iframeLoadTimeout,
            onStylesheetLoad,
            stylesheetLoadTimeout,
            keepIframeSrcFn,
        };
        if (serializedNode.type === NodeType$2.Element &&
            serializedNode.tagName === 'textarea' &&
            serializedNode.attributes.value !== undefined) ;
        else {
            for (const childN of Array.from(n.childNodes)) {
                const serializedChildNode = serializeNodeWithId(childN, bypassOptions);
                if (serializedChildNode) {
                    serializedNode.childNodes.push(serializedChildNode);
                }
            }
        }
        if (isElement(n) && n.shadowRoot) {
            for (const childN of Array.from(n.shadowRoot.childNodes)) {
                const serializedChildNode = serializeNodeWithId(childN, bypassOptions);
                if (serializedChildNode) {
                    isNativeShadowDom(n.shadowRoot) &&
                        (serializedChildNode.isShadow = true);
                    serializedNode.childNodes.push(serializedChildNode);
                }
            }
        }
    }
    if (n.parentNode &&
        isShadowRoot(n.parentNode) &&
        isNativeShadowDom(n.parentNode)) {
        serializedNode.isShadow = true;
    }
    if (serializedNode.type === NodeType$2.Element &&
        serializedNode.tagName === 'iframe') {
        onceIframeLoaded(n, () => {
            const iframeDoc = n.contentDocument;
            if (iframeDoc && onIframeLoad) {
                const serializedIframeNode = serializeNodeWithId(iframeDoc, {
                    doc: iframeDoc,
                    mirror,
                    blockClass,
                    blockSelector,
                    needsMask,
                    maskTextClass,
                    maskTextSelector,
                    skipChild: false,
                    inlineStylesheet,
                    maskInputOptions,
                    maskTextFn,
                    maskInputFn,
                    slimDOMOptions,
                    dataURLOptions,
                    inlineImages,
                    recordCanvas,
                    preserveWhiteSpace,
                    onSerialize,
                    onIframeLoad,
                    iframeLoadTimeout,
                    onStylesheetLoad,
                    stylesheetLoadTimeout,
                    keepIframeSrcFn,
                });
                if (serializedIframeNode) {
                    onIframeLoad(n, serializedIframeNode);
                }
            }
        }, iframeLoadTimeout);
    }
    if (serializedNode.type === NodeType$2.Element &&
        serializedNode.tagName === 'link' &&
        typeof serializedNode.attributes.rel === 'string' &&
        (serializedNode.attributes.rel === 'stylesheet' ||
            (serializedNode.attributes.rel === 'preload' &&
                typeof serializedNode.attributes.href === 'string' &&
                extractFileExtension(serializedNode.attributes.href) === 'css'))) {
        onceStylesheetLoaded(n, () => {
            if (onStylesheetLoad) {
                const serializedLinkNode = serializeNodeWithId(n, {
                    doc,
                    mirror,
                    blockClass,
                    blockSelector,
                    needsMask,
                    maskTextClass,
                    maskTextSelector,
                    skipChild: false,
                    inlineStylesheet,
                    maskInputOptions,
                    maskTextFn,
                    maskInputFn,
                    slimDOMOptions,
                    dataURLOptions,
                    inlineImages,
                    recordCanvas,
                    preserveWhiteSpace,
                    onSerialize,
                    onIframeLoad,
                    iframeLoadTimeout,
                    onStylesheetLoad,
                    stylesheetLoadTimeout,
                    keepIframeSrcFn,
                });
                if (serializedLinkNode) {
                    onStylesheetLoad(n, serializedLinkNode);
                }
            }
        }, stylesheetLoadTimeout);
    }
    return serializedNode;
}
function snapshot(n, options) {
    const { mirror = new Mirror$2(), blockClass = 'rr-block', blockSelector = null, maskTextClass = 'rr-mask', maskTextSelector = null, inlineStylesheet = true, inlineImages = false, recordCanvas = false, maskAllInputs = false, maskTextFn, maskInputFn, slimDOM = false, dataURLOptions, preserveWhiteSpace, onSerialize, onIframeLoad, iframeLoadTimeout, onStylesheetLoad, stylesheetLoadTimeout, keepIframeSrcFn = () => false, } = options || {};
    const maskInputOptions = maskAllInputs === true
        ? {
            color: true,
            date: true,
            'datetime-local': true,
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
        }
        : maskAllInputs === false
            ? {
                password: true,
            }
            : maskAllInputs;
    const slimDOMOptions = slimDOM === true || slimDOM === 'all'
        ?
            {
                script: true,
                comment: true,
                headFavicon: true,
                headWhitespace: true,
                headMetaDescKeywords: slimDOM === 'all',
                headMetaSocial: true,
                headMetaRobots: true,
                headMetaHttpEquiv: true,
                headMetaAuthorship: true,
                headMetaVerification: true,
            }
        : slimDOM === false
            ? {}
            : slimDOM;
    return serializeNodeWithId(n, {
        doc: n,
        mirror,
        blockClass,
        blockSelector,
        maskTextClass,
        maskTextSelector,
        skipChild: false,
        inlineStylesheet,
        maskInputOptions,
        maskTextFn,
        maskInputFn,
        slimDOMOptions,
        dataURLOptions,
        inlineImages,
        recordCanvas,
        preserveWhiteSpace,
        onSerialize,
        onIframeLoad,
        iframeLoadTimeout,
        onStylesheetLoad,
        stylesheetLoadTimeout,
        keepIframeSrcFn,
        newlyAddedElement: false,
    });
}

const commentre = /\/\*[^*]*\*+([^/*][^*]*\*+)*\//g;
function parse(css, options = {}) {
    let lineno = 1;
    let column = 1;
    function updatePosition(str) {
        const lines = str.match(/\n/g);
        if (lines) {
            lineno += lines.length;
        }
        const i = str.lastIndexOf('\n');
        column = i === -1 ? column + str.length : str.length - i;
    }
    function position() {
        const start = { line: lineno, column };
        return (node) => {
            node.position = new Position(start);
            whitespace();
            return node;
        };
    }
    class Position {
        constructor(start) {
            this.start = start;
            this.end = { line: lineno, column };
            this.source = options.source;
        }
    }
    Position.prototype.content = css;
    const errorsList = [];
    function error(msg) {
        const err = new Error(`${options.source || ''}:${lineno}:${column}: ${msg}`);
        err.reason = msg;
        err.filename = options.source;
        err.line = lineno;
        err.column = column;
        err.source = css;
        if (options.silent) {
            errorsList.push(err);
        }
        else {
            throw err;
        }
    }
    function stylesheet() {
        const rulesList = rules();
        return {
            type: 'stylesheet',
            stylesheet: {
                source: options.source,
                rules: rulesList,
                parsingErrors: errorsList,
            },
        };
    }
    function open() {
        return match(/^{\s*/);
    }
    function close() {
        return match(/^}/);
    }
    function rules() {
        let node;
        const rules = [];
        whitespace();
        comments(rules);
        while (css.length && css.charAt(0) !== '}' && (node = atrule() || rule())) {
            if (node) {
                rules.push(node);
                comments(rules);
            }
        }
        return rules;
    }
    function match(re) {
        const m = re.exec(css);
        if (!m) {
            return;
        }
        const str = m[0];
        updatePosition(str);
        css = css.slice(str.length);
        return m;
    }
    function whitespace() {
        match(/^\s*/);
    }
    function comments(rules = []) {
        let c;
        while ((c = comment())) {
            if (c) {
                rules.push(c);
            }
            c = comment();
        }
        return rules;
    }
    function comment() {
        const pos = position();
        if ('/' !== css.charAt(0) || '*' !== css.charAt(1)) {
            return;
        }
        let i = 2;
        while ('' !== css.charAt(i) &&
            ('*' !== css.charAt(i) || '/' !== css.charAt(i + 1))) {
            ++i;
        }
        i += 2;
        if ('' === css.charAt(i - 1)) {
            return error('End of comment missing');
        }
        const str = css.slice(2, i - 2);
        column += 2;
        updatePosition(str);
        css = css.slice(i);
        column += 2;
        return pos({
            type: 'comment',
            comment: str,
        });
    }
    function selector() {
        whitespace();
        while (css[0] == '}') {
            error('extra closing bracket');
            css = css.slice(1);
            whitespace();
        }
        const m = match(/^(("(?:\\"|[^"])*"|'(?:\\'|[^'])*'|[^{])+)/);
        if (!m) {
            return;
        }
        const cleanedInput = m[0]
            .trim()
            .replace(/\/\*([^*]|[\r\n]|(\*+([^*/]|[\r\n])))*\*\/+/g, '')
            .replace(/"(?:\\"|[^"])*"|'(?:\\'|[^'])*'/g, (m) => {
            return m.replace(/,/g, '\u200C');
        });
        return customSplit(cleanedInput).map((s) => s.replace(/\u200C/g, ',').trim());
    }
    function customSplit(input) {
        const result = [];
        let currentSegment = '';
        let depthParentheses = 0;
        let depthBrackets = 0;
        for (const char of input) {
            if (char === '(') {
                depthParentheses++;
            }
            else if (char === ')') {
                depthParentheses--;
            }
            else if (char === '[') {
                depthBrackets++;
            }
            else if (char === ']') {
                depthBrackets--;
            }
            if (char === ',' && depthParentheses === 0 && depthBrackets === 0) {
                result.push(currentSegment);
                currentSegment = '';
            }
            else {
                currentSegment += char;
            }
        }
        if (currentSegment) {
            result.push(currentSegment);
        }
        return result;
    }
    function declaration() {
        const pos = position();
        const propMatch = match(/^(\*?[-#\/\*\\\w]+(\[[0-9a-z_-]+\])?)\s*/);
        if (!propMatch) {
            return;
        }
        const prop = trim(propMatch[0]);
        if (!match(/^:\s*/)) {
            return error(`property missing ':'`);
        }
        const val = match(/^((?:'(?:\\'|.)*?'|"(?:\\"|.)*?"|\([^\)]*?\)|[^};])+)/);
        const ret = pos({
            type: 'declaration',
            property: prop.replace(commentre, ''),
            value: val ? trim(val[0]).replace(commentre, '') : '',
        });
        match(/^[;\s]*/);
        return ret;
    }
    function declarations() {
        const decls = [];
        if (!open()) {
            return error(`missing '{'`);
        }
        comments(decls);
        let decl;
        while ((decl = declaration())) {
            if (decl !== false) {
                decls.push(decl);
                comments(decls);
            }
            decl = declaration();
        }
        if (!close()) {
            return error(`missing '}'`);
        }
        return decls;
    }
    function keyframe() {
        let m;
        const vals = [];
        const pos = position();
        while ((m = match(/^((\d+\.\d+|\.\d+|\d+)%?|[a-z]+)\s*/))) {
            vals.push(m[1]);
            match(/^,\s*/);
        }
        if (!vals.length) {
            return;
        }
        return pos({
            type: 'keyframe',
            values: vals,
            declarations: declarations(),
        });
    }
    function atkeyframes() {
        const pos = position();
        let m = match(/^@([-\w]+)?keyframes\s*/);
        if (!m) {
            return;
        }
        const vendor = m[1];
        m = match(/^([-\w]+)\s*/);
        if (!m) {
            return error('@keyframes missing name');
        }
        const name = m[1];
        if (!open()) {
            return error(`@keyframes missing '{'`);
        }
        let frame;
        let frames = comments();
        while ((frame = keyframe())) {
            frames.push(frame);
            frames = frames.concat(comments());
        }
        if (!close()) {
            return error(`@keyframes missing '}'`);
        }
        return pos({
            type: 'keyframes',
            name,
            vendor,
            keyframes: frames,
        });
    }
    function atsupports() {
        const pos = position();
        const m = match(/^@supports *([^{]+)/);
        if (!m) {
            return;
        }
        const supports = trim(m[1]);
        if (!open()) {
            return error(`@supports missing '{'`);
        }
        const style = comments().concat(rules());
        if (!close()) {
            return error(`@supports missing '}'`);
        }
        return pos({
            type: 'supports',
            supports,
            rules: style,
        });
    }
    function athost() {
        const pos = position();
        const m = match(/^@host\s*/);
        if (!m) {
            return;
        }
        if (!open()) {
            return error(`@host missing '{'`);
        }
        const style = comments().concat(rules());
        if (!close()) {
            return error(`@host missing '}'`);
        }
        return pos({
            type: 'host',
            rules: style,
        });
    }
    function atmedia() {
        const pos = position();
        const m = match(/^@media *([^{]+)/);
        if (!m) {
            return;
        }
        const media = trim(m[1]);
        if (!open()) {
            return error(`@media missing '{'`);
        }
        const style = comments().concat(rules());
        if (!close()) {
            return error(`@media missing '}'`);
        }
        return pos({
            type: 'media',
            media,
            rules: style,
        });
    }
    function atcustommedia() {
        const pos = position();
        const m = match(/^@custom-media\s+(--[^\s]+)\s*([^{;]+);/);
        if (!m) {
            return;
        }
        return pos({
            type: 'custom-media',
            name: trim(m[1]),
            media: trim(m[2]),
        });
    }
    function atpage() {
        const pos = position();
        const m = match(/^@page */);
        if (!m) {
            return;
        }
        const sel = selector() || [];
        if (!open()) {
            return error(`@page missing '{'`);
        }
        let decls = comments();
        let decl;
        while ((decl = declaration())) {
            decls.push(decl);
            decls = decls.concat(comments());
        }
        if (!close()) {
            return error(`@page missing '}'`);
        }
        return pos({
            type: 'page',
            selectors: sel,
            declarations: decls,
        });
    }
    function atdocument() {
        const pos = position();
        const m = match(/^@([-\w]+)?document *([^{]+)/);
        if (!m) {
            return;
        }
        const vendor = trim(m[1]);
        const doc = trim(m[2]);
        if (!open()) {
            return error(`@document missing '{'`);
        }
        const style = comments().concat(rules());
        if (!close()) {
            return error(`@document missing '}'`);
        }
        return pos({
            type: 'document',
            document: doc,
            vendor,
            rules: style,
        });
    }
    function atfontface() {
        const pos = position();
        const m = match(/^@font-face\s*/);
        if (!m) {
            return;
        }
        if (!open()) {
            return error(`@font-face missing '{'`);
        }
        let decls = comments();
        let decl;
        while ((decl = declaration())) {
            decls.push(decl);
            decls = decls.concat(comments());
        }
        if (!close()) {
            return error(`@font-face missing '}'`);
        }
        return pos({
            type: 'font-face',
            declarations: decls,
        });
    }
    const atimport = _compileAtrule('import');
    const atcharset = _compileAtrule('charset');
    const atnamespace = _compileAtrule('namespace');
    function _compileAtrule(name) {
        const re = new RegExp('^@' + name + '\\s*([^;]+);');
        return () => {
            const pos = position();
            const m = match(re);
            if (!m) {
                return;
            }
            const ret = { type: name };
            ret[name] = m[1].trim();
            return pos(ret);
        };
    }
    function atrule() {
        if (css[0] !== '@') {
            return;
        }
        return (atkeyframes() ||
            atmedia() ||
            atcustommedia() ||
            atsupports() ||
            atimport() ||
            atcharset() ||
            atnamespace() ||
            atdocument() ||
            atpage() ||
            athost() ||
            atfontface());
    }
    function rule() {
        const pos = position();
        const sel = selector();
        if (!sel) {
            return error('selector missing');
        }
        comments();
        return pos({
            type: 'rule',
            selectors: sel,
            declarations: declarations(),
        });
    }
    return addParent(stylesheet());
}
function trim(str) {
    return str ? str.replace(/^\s+|\s+$/g, '') : '';
}
function addParent(obj, parent) {
    const isNode = obj && typeof obj.type === 'string';
    const childParent = isNode ? obj : parent;
    for (const k of Object.keys(obj)) {
        const value = obj[k];
        if (Array.isArray(value)) {
            value.forEach((v) => {
                addParent(v, childParent);
            });
        }
        else if (value && typeof value === 'object') {
            addParent(value, childParent);
        }
    }
    if (isNode) {
        Object.defineProperty(obj, 'parent', {
            configurable: true,
            writable: true,
            enumerable: false,
            value: parent || null,
        });
    }
    return obj;
}

const tagMap = {
    script: 'noscript',
    altglyph: 'altGlyph',
    altglyphdef: 'altGlyphDef',
    altglyphitem: 'altGlyphItem',
    animatecolor: 'animateColor',
    animatemotion: 'animateMotion',
    animatetransform: 'animateTransform',
    clippath: 'clipPath',
    feblend: 'feBlend',
    fecolormatrix: 'feColorMatrix',
    fecomponenttransfer: 'feComponentTransfer',
    fecomposite: 'feComposite',
    feconvolvematrix: 'feConvolveMatrix',
    fediffuselighting: 'feDiffuseLighting',
    fedisplacementmap: 'feDisplacementMap',
    fedistantlight: 'feDistantLight',
    fedropshadow: 'feDropShadow',
    feflood: 'feFlood',
    fefunca: 'feFuncA',
    fefuncb: 'feFuncB',
    fefuncg: 'feFuncG',
    fefuncr: 'feFuncR',
    fegaussianblur: 'feGaussianBlur',
    feimage: 'feImage',
    femerge: 'feMerge',
    femergenode: 'feMergeNode',
    femorphology: 'feMorphology',
    feoffset: 'feOffset',
    fepointlight: 'fePointLight',
    fespecularlighting: 'feSpecularLighting',
    fespotlight: 'feSpotLight',
    fetile: 'feTile',
    feturbulence: 'feTurbulence',
    foreignobject: 'foreignObject',
    glyphref: 'glyphRef',
    lineargradient: 'linearGradient',
    radialgradient: 'radialGradient',
};
function getTagName(n) {
    let tagName = tagMap[n.tagName] ? tagMap[n.tagName] : n.tagName;
    if (tagName === 'link' && n.attributes._cssText) {
        tagName = 'style';
    }
    return tagName;
}
function escapeRegExp(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
const MEDIA_SELECTOR = /(max|min)-device-(width|height)/;
const MEDIA_SELECTOR_GLOBAL = new RegExp(MEDIA_SELECTOR.source, 'g');
const HOVER_SELECTOR = /([^\\]):hover/;
const HOVER_SELECTOR_GLOBAL = new RegExp(HOVER_SELECTOR.source, 'g');
function adaptCssForReplay(cssText, cache) {
    const cachedStyle = cache === null || cache === void 0 ? void 0 : cache.stylesWithHoverClass.get(cssText);
    if (cachedStyle)
        return cachedStyle;
    const ast = parse(cssText, {
        silent: true,
    });
    if (!ast.stylesheet) {
        return cssText;
    }
    const selectors = [];
    const medias = [];
    function getSelectors(rule) {
        if ('selectors' in rule && rule.selectors) {
            rule.selectors.forEach((selector) => {
                if (HOVER_SELECTOR.test(selector)) {
                    selectors.push(selector);
                }
            });
        }
        if ('media' in rule && rule.media && MEDIA_SELECTOR.test(rule.media)) {
            medias.push(rule.media);
        }
        if ('rules' in rule && rule.rules) {
            rule.rules.forEach(getSelectors);
        }
    }
    getSelectors(ast.stylesheet);
    let result = cssText;
    if (selectors.length > 0) {
        const selectorMatcher = new RegExp(selectors
            .filter((selector, index) => selectors.indexOf(selector) === index)
            .sort((a, b) => b.length - a.length)
            .map((selector) => {
            return escapeRegExp(selector);
        })
            .join('|'), 'g');
        result = result.replace(selectorMatcher, (selector) => {
            const newSelector = selector.replace(HOVER_SELECTOR_GLOBAL, '$1.\\:hover');
            return `${selector}, ${newSelector}`;
        });
    }
    if (medias.length > 0) {
        const mediaMatcher = new RegExp(medias
            .filter((media, index) => medias.indexOf(media) === index)
            .sort((a, b) => b.length - a.length)
            .map((media) => {
            return escapeRegExp(media);
        })
            .join('|'), 'g');
        result = result.replace(mediaMatcher, (media) => {
            return media.replace(MEDIA_SELECTOR_GLOBAL, '$1-$2');
        });
    }
    cache === null || cache === void 0 ? void 0 : cache.stylesWithHoverClass.set(cssText, result);
    return result;
}
function createCache() {
    const stylesWithHoverClass = new Map();
    return {
        stylesWithHoverClass,
    };
}
function buildNode(n, options) {
    var _a;
    const { doc, hackCss, cache } = options;
    switch (n.type) {
        case NodeType$2.Document:
            return doc.implementation.createDocument(null, '', null);
        case NodeType$2.DocumentType:
            return doc.implementation.createDocumentType(n.name || 'html', n.publicId, n.systemId);
        case NodeType$2.Element: {
            const tagName = getTagName(n);
            let node;
            if (n.isSVG) {
                node = doc.createElementNS('http://www.w3.org/2000/svg', tagName);
            }
            else {
                if (n.isCustom &&
                    ((_a = doc.defaultView) === null || _a === void 0 ? void 0 : _a.customElements) &&
                    !doc.defaultView.customElements.get(n.tagName))
                    doc.defaultView.customElements.define(n.tagName, class extends doc.defaultView.HTMLElement {
                    });
                node = doc.createElement(tagName);
            }
            const specialAttributes = {};
            for (const name in n.attributes) {
                if (!Object.prototype.hasOwnProperty.call(n.attributes, name)) {
                    continue;
                }
                let value = n.attributes[name];
                if (tagName === 'option' &&
                    name === 'selected' &&
                    value === false) {
                    continue;
                }
                if (value === null) {
                    continue;
                }
                if (value === true)
                    value = '';
                if (name.startsWith('rr_')) {
                    specialAttributes[name] = value;
                    continue;
                }
                const isTextarea = tagName === 'textarea' && name === 'value';
                const isRemoteOrDynamicCss = tagName === 'style' && name === '_cssText';
                if (isRemoteOrDynamicCss && hackCss && typeof value === 'string') {
                    value = adaptCssForReplay(value, cache);
                }
                if ((isTextarea || isRemoteOrDynamicCss) && typeof value === 'string') {
                    node.appendChild(doc.createTextNode(value));
                    n.childNodes = [];
                    continue;
                }
                try {
                    if (n.isSVG && name === 'xlink:href') {
                        node.setAttributeNS('http://www.w3.org/1999/xlink', name, value.toString());
                    }
                    else if (name === 'onload' ||
                        name === 'onclick' ||
                        name.substring(0, 7) === 'onmouse') {
                        node.setAttribute('_' + name, value.toString());
                    }
                    else if (tagName === 'meta' &&
                        n.attributes['http-equiv'] === 'Content-Security-Policy' &&
                        name === 'content') {
                        node.setAttribute('csp-content', value.toString());
                        continue;
                    }
                    else if (tagName === 'link' &&
                        (n.attributes.rel === 'preload' ||
                            n.attributes.rel === 'modulepreload') &&
                        n.attributes.as === 'script') {
                    }
                    else if (tagName === 'link' &&
                        n.attributes.rel === 'prefetch' &&
                        typeof n.attributes.href === 'string' &&
                        n.attributes.href.endsWith('.js')) {
                    }
                    else if (tagName === 'img' &&
                        n.attributes.srcset &&
                        n.attributes.rr_dataURL) {
                        node.setAttribute('rrweb-original-srcset', n.attributes.srcset);
                    }
                    else {
                        node.setAttribute(name, value.toString());
                    }
                }
                catch (error) {
                }
            }
            for (const name in specialAttributes) {
                const value = specialAttributes[name];
                if (tagName === 'canvas' && name === 'rr_dataURL') {
                    const image = document.createElement('img');
                    image.onload = () => {
                        const ctx = node.getContext('2d');
                        if (ctx) {
                            ctx.drawImage(image, 0, 0, image.width, image.height);
                        }
                    };
                    image.src = value.toString();
                    if (node.RRNodeType)
                        node.rr_dataURL = value.toString();
                }
                else if (tagName === 'img' && name === 'rr_dataURL') {
                    const image = node;
                    if (!image.currentSrc.startsWith('data:')) {
                        image.setAttribute('rrweb-original-src', n.attributes.src);
                        image.src = value.toString();
                    }
                }
                if (name === 'rr_width') {
                    node.style.width = value.toString();
                }
                else if (name === 'rr_height') {
                    node.style.height = value.toString();
                }
                else if (name === 'rr_mediaCurrentTime' &&
                    typeof value === 'number') {
                    node.currentTime = value;
                }
                else if (name === 'rr_mediaState') {
                    switch (value) {
                        case 'played':
                            node
                                .play()
                                .catch((e) => console.warn('media playback error', e));
                            break;
                        case 'paused':
                            node.pause();
                            break;
                    }
                }
                else if (name === 'rr_mediaPlaybackRate' &&
                    typeof value === 'number') {
                    node.playbackRate = value;
                }
                else if (name === 'rr_mediaMuted' && typeof value === 'boolean') {
                    node.muted = value;
                }
                else if (name === 'rr_mediaLoop' && typeof value === 'boolean') {
                    node.loop = value;
                }
                else if (name === 'rr_mediaVolume' && typeof value === 'number') {
                    node.volume = value;
                }
            }
            if (n.isShadowHost) {
                if (!node.shadowRoot) {
                    node.attachShadow({ mode: 'open' });
                }
                else {
                    while (node.shadowRoot.firstChild) {
                        node.shadowRoot.removeChild(node.shadowRoot.firstChild);
                    }
                }
            }
            return node;
        }
        case NodeType$2.Text:
            return doc.createTextNode(n.isStyle && hackCss
                ? adaptCssForReplay(n.textContent, cache)
                : n.textContent);
        case NodeType$2.CDATA:
            return doc.createCDATASection(n.textContent);
        case NodeType$2.Comment:
            return doc.createComment(n.textContent);
        default:
            return null;
    }
}
function buildNodeWithSN(n, options) {
    const { doc, mirror, skipChild = false, hackCss = true, afterAppend, cache, } = options;
    if (mirror.has(n.id)) {
        const nodeInMirror = mirror.getNode(n.id);
        const meta = mirror.getMeta(nodeInMirror);
        if (isNodeMetaEqual(meta, n))
            return mirror.getNode(n.id);
    }
    let node = buildNode(n, { doc, hackCss, cache });
    if (!node) {
        return null;
    }
    if (n.rootId && mirror.getNode(n.rootId) !== doc) {
        mirror.replace(n.rootId, doc);
    }
    if (n.type === NodeType$2.Document) {
        doc.close();
        doc.open();
        if (n.compatMode === 'BackCompat' &&
            n.childNodes &&
            n.childNodes[0].type !== NodeType$2.DocumentType) {
            if (n.childNodes[0].type === NodeType$2.Element &&
                'xmlns' in n.childNodes[0].attributes &&
                n.childNodes[0].attributes.xmlns === 'http://www.w3.org/1999/xhtml') {
                doc.write('<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "">');
            }
            else {
                doc.write('<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN" "">');
            }
        }
        node = doc;
    }
    mirror.add(node, n);
    if ((n.type === NodeType$2.Document || n.type === NodeType$2.Element) &&
        !skipChild) {
        for (const childN of n.childNodes) {
            const childNode = buildNodeWithSN(childN, {
                doc,
                mirror,
                skipChild: false,
                hackCss,
                afterAppend,
                cache,
            });
            if (!childNode) {
                console.warn('Failed to rebuild', childN);
                continue;
            }
            if (childN.isShadow && isElement(node) && node.shadowRoot) {
                node.shadowRoot.appendChild(childNode);
            }
            else if (n.type === NodeType$2.Document &&
                childN.type == NodeType$2.Element) {
                const htmlElement = childNode;
                let body = null;
                htmlElement.childNodes.forEach((child) => {
                    if (child.nodeName === 'BODY')
                        body = child;
                });
                if (body) {
                    htmlElement.removeChild(body);
                    node.appendChild(childNode);
                    htmlElement.appendChild(body);
                }
                else {
                    node.appendChild(childNode);
                }
            }
            else {
                node.appendChild(childNode);
            }
            if (afterAppend) {
                afterAppend(childNode, childN.id);
            }
        }
    }
    return node;
}
function visit(mirror, onVisit) {
    function walk(node) {
        onVisit(node);
    }
    for (const id of mirror.getIds()) {
        if (mirror.has(id)) {
            walk(mirror.getNode(id));
        }
    }
}
function handleScroll(node, mirror) {
    const n = mirror.getMeta(node);
    if ((n === null || n === void 0 ? void 0 : n.type) !== NodeType$2.Element) {
        return;
    }
    const el = node;
    for (const name in n.attributes) {
        if (!(Object.prototype.hasOwnProperty.call(n.attributes, name) &&
            name.startsWith('rr_'))) {
            continue;
        }
        const value = n.attributes[name];
        if (name === 'rr_scrollLeft') {
            el.scrollLeft = value;
        }
        if (name === 'rr_scrollTop') {
            el.scrollTop = value;
        }
    }
}
function rebuild(n, options) {
    const { doc, onVisit, hackCss = true, afterAppend, cache, mirror = new Mirror$2(), } = options;
    const node = buildNodeWithSN(n, {
        doc,
        mirror,
        skipChild: false,
        hackCss,
        afterAppend,
        cache,
    });
    visit(mirror, (visitedNode) => {
        if (onVisit) {
            onVisit(visitedNode);
        }
        handleScroll(visitedNode, mirror);
    });
    return node;
}

function on(type, fn, target = document) {
    const options = { capture: true, passive: true };
    target.addEventListener(type, fn, options);
    return () => target.removeEventListener(type, fn, options);
}
const DEPARTED_MIRROR_ACCESS_WARNING = 'Please stop import mirror directly. Instead of that,' +
    '\r\n' +
    'now you can use replayer.getMirror() to access the mirror instance of a replayer,' +
    '\r\n' +
    'or you can use record.mirror to access the mirror instance during recording.';
exports.mirror = {
    map: {},
    getId() {
        console.error(DEPARTED_MIRROR_ACCESS_WARNING);
        return -1;
    },
    getNode() {
        console.error(DEPARTED_MIRROR_ACCESS_WARNING);
        return null;
    },
    removeNodeFromMap() {
        console.error(DEPARTED_MIRROR_ACCESS_WARNING);
    },
    has() {
        console.error(DEPARTED_MIRROR_ACCESS_WARNING);
        return false;
    },
    reset() {
        console.error(DEPARTED_MIRROR_ACCESS_WARNING);
    },
};
if (typeof window !== 'undefined' && window.Proxy && window.Reflect) {
    exports.mirror = new Proxy(exports.mirror, {
        get(target, prop, receiver) {
            if (prop === 'map') {
                console.error(DEPARTED_MIRROR_ACCESS_WARNING);
            }
            return Reflect.get(target, prop, receiver);
        },
    });
}
function throttle(func, wait, options = {}) {
    let timeout = null;
    let previous = 0;
    return function (...args) {
        const now = Date.now();
        if (!previous && options.leading === false) {
            previous = now;
        }
        const remaining = wait - (now - previous);
        const context = this;
        if (remaining <= 0 || remaining > wait) {
            if (timeout) {
                clearTimeout(timeout);
                timeout = null;
            }
            previous = now;
            func.apply(context, args);
        }
        else if (!timeout && options.trailing !== false) {
            timeout = setTimeout(() => {
                previous = options.leading === false ? 0 : Date.now();
                timeout = null;
                func.apply(context, args);
            }, remaining);
        }
    };
}
function hookSetter(target, key, d, isRevoked, win = window) {
    const original = win.Object.getOwnPropertyDescriptor(target, key);
    win.Object.defineProperty(target, key, isRevoked
        ? d
        : {
            set(value) {
                setTimeout(() => {
                    d.set.call(this, value);
                }, 0);
                if (original && original.set) {
                    original.set.call(this, value);
                }
            },
        });
    return () => hookSetter(target, key, original || {}, true);
}
function patch(source, name, replacement) {
    try {
        if (!(name in source)) {
            return () => {
            };
        }
        const original = source[name];
        const wrapped = replacement(original);
        if (typeof wrapped === 'function') {
            wrapped.prototype = wrapped.prototype || {};
            Object.defineProperties(wrapped, {
                __rrweb_original__: {
                    enumerable: false,
                    value: original,
                },
            });
        }
        source[name] = wrapped;
        return () => {
            source[name] = original;
        };
    }
    catch (_a) {
        return () => {
        };
    }
}
let nowTimestamp = Date.now;
if (!(/[1-9][0-9]{12}/.test(Date.now().toString()))) {
    nowTimestamp = () => new Date().getTime();
}
function getWindowScroll(win) {
    var _a, _b, _c, _d, _e, _f;
    const doc = win.document;
    return {
        left: doc.scrollingElement
            ? doc.scrollingElement.scrollLeft
            : win.pageXOffset !== undefined
                ? win.pageXOffset
                : (doc === null || doc === void 0 ? void 0 : doc.documentElement.scrollLeft) ||
                    ((_b = (_a = doc === null || doc === void 0 ? void 0 : doc.body) === null || _a === void 0 ? void 0 : _a.parentElement) === null || _b === void 0 ? void 0 : _b.scrollLeft) ||
                    ((_c = doc === null || doc === void 0 ? void 0 : doc.body) === null || _c === void 0 ? void 0 : _c.scrollLeft) ||
                    0,
        top: doc.scrollingElement
            ? doc.scrollingElement.scrollTop
            : win.pageYOffset !== undefined
                ? win.pageYOffset
                : (doc === null || doc === void 0 ? void 0 : doc.documentElement.scrollTop) ||
                    ((_e = (_d = doc === null || doc === void 0 ? void 0 : doc.body) === null || _d === void 0 ? void 0 : _d.parentElement) === null || _e === void 0 ? void 0 : _e.scrollTop) ||
                    ((_f = doc === null || doc === void 0 ? void 0 : doc.body) === null || _f === void 0 ? void 0 : _f.scrollTop) ||
                    0,
    };
}
function getWindowHeight() {
    return (window.innerHeight ||
        (document.documentElement && document.documentElement.clientHeight) ||
        (document.body && document.body.clientHeight));
}
function getWindowWidth() {
    return (window.innerWidth ||
        (document.documentElement && document.documentElement.clientWidth) ||
        (document.body && document.body.clientWidth));
}
function closestElementOfNode(node) {
    if (!node) {
        return null;
    }
    const el = node.nodeType === node.ELEMENT_NODE
        ? node
        : node.parentElement;
    return el;
}
function isBlocked(node, blockClass, blockSelector, checkAncestors) {
    if (!node) {
        return false;
    }
    const el = closestElementOfNode(node);
    if (!el) {
        return false;
    }
    try {
        if (typeof blockClass === 'string') {
            if (el.classList.contains(blockClass))
                return true;
            if (checkAncestors && el.closest('.' + blockClass) !== null)
                return true;
        }
        else {
            if (classMatchesRegex(el, blockClass, checkAncestors))
                return true;
        }
    }
    catch (e) {
    }
    if (blockSelector) {
        if (el.matches(blockSelector))
            return true;
        if (checkAncestors && el.closest(blockSelector) !== null)
            return true;
    }
    return false;
}
function isSerialized(n, mirror) {
    return mirror.getId(n) !== -1;
}
function isIgnored(n, mirror) {
    return mirror.getId(n) === IGNORED_NODE;
}
function isAncestorRemoved(target, mirror) {
    if (isShadowRoot(target)) {
        return false;
    }
    const id = mirror.getId(target);
    if (!mirror.has(id)) {
        return true;
    }
    if (target.parentNode &&
        target.parentNode.nodeType === target.DOCUMENT_NODE) {
        return false;
    }
    if (!target.parentNode) {
        return true;
    }
    return isAncestorRemoved(target.parentNode, mirror);
}
function legacy_isTouchEvent(event) {
    return Boolean(event.changedTouches);
}
function polyfill$1(win = window) {
    if ('NodeList' in win && !win.NodeList.prototype.forEach) {
        win.NodeList.prototype.forEach = Array.prototype
            .forEach;
    }
    if ('DOMTokenList' in win && !win.DOMTokenList.prototype.forEach) {
        win.DOMTokenList.prototype.forEach = Array.prototype
            .forEach;
    }
    if (!Node.prototype.contains) {
        Node.prototype.contains = (...args) => {
            let node = args[0];
            if (!(0 in args)) {
                throw new TypeError('1 argument is required');
            }
            do {
                if (this === node) {
                    return true;
                }
            } while ((node = node && node.parentNode));
            return false;
        };
    }
}
function queueToResolveTrees(queue) {
    const queueNodeMap = {};
    const putIntoMap = (m, parent) => {
        const nodeInTree = {
            value: m,
            parent,
            children: [],
        };
        queueNodeMap[m.node.id] = nodeInTree;
        return nodeInTree;
    };
    const queueNodeTrees = [];
    for (const mutation of queue) {
        const { nextId, parentId } = mutation;
        if (nextId && nextId in queueNodeMap) {
            const nextInTree = queueNodeMap[nextId];
            if (nextInTree.parent) {
                const idx = nextInTree.parent.children.indexOf(nextInTree);
                nextInTree.parent.children.splice(idx, 0, putIntoMap(mutation, nextInTree.parent));
            }
            else {
                const idx = queueNodeTrees.indexOf(nextInTree);
                queueNodeTrees.splice(idx, 0, putIntoMap(mutation, null));
            }
            continue;
        }
        if (parentId in queueNodeMap) {
            const parentInTree = queueNodeMap[parentId];
            parentInTree.children.push(putIntoMap(mutation, parentInTree));
            continue;
        }
        queueNodeTrees.push(putIntoMap(mutation, null));
    }
    return queueNodeTrees;
}
function iterateResolveTree(tree, cb) {
    cb(tree.value);
    for (let i = tree.children.length - 1; i >= 0; i--) {
        iterateResolveTree(tree.children[i], cb);
    }
}
function isSerializedIframe(n, mirror) {
    return Boolean(n.nodeName === 'IFRAME' && mirror.getMeta(n));
}
function isSerializedStylesheet(n, mirror) {
    return Boolean(n.nodeName === 'LINK' &&
        n.nodeType === n.ELEMENT_NODE &&
        n.getAttribute &&
        n.getAttribute('rel') === 'stylesheet' &&
        mirror.getMeta(n));
}
function getBaseDimension(node, rootIframe) {
    var _a, _b;
    const frameElement = (_b = (_a = node.ownerDocument) === null || _a === void 0 ? void 0 : _a.defaultView) === null || _b === void 0 ? void 0 : _b.frameElement;
    if (!frameElement || frameElement === rootIframe) {
        return {
            x: 0,
            y: 0,
            relativeScale: 1,
            absoluteScale: 1,
        };
    }
    const frameDimension = frameElement.getBoundingClientRect();
    const frameBaseDimension = getBaseDimension(frameElement, rootIframe);
    const relativeScale = frameDimension.height / frameElement.clientHeight;
    return {
        x: frameDimension.x * frameBaseDimension.relativeScale +
            frameBaseDimension.x,
        y: frameDimension.y * frameBaseDimension.relativeScale +
            frameBaseDimension.y,
        relativeScale,
        absoluteScale: frameBaseDimension.absoluteScale * relativeScale,
    };
}
function hasShadowRoot(n) {
    return Boolean(n === null || n === void 0 ? void 0 : n.shadowRoot);
}
function getNestedRule(rules, position) {
    const rule = rules[position[0]];
    if (position.length === 1) {
        return rule;
    }
    else {
        return getNestedRule(rule.cssRules[position[1]].cssRules, position.slice(2));
    }
}
function getPositionsAndIndex(nestedIndex) {
    const positions = [...nestedIndex];
    const index = positions.pop();
    return { positions, index };
}
function uniqueTextMutations(mutations) {
    const idSet = new Set();
    const uniqueMutations = [];
    for (let i = mutations.length; i--;) {
        const mutation = mutations[i];
        if (!idSet.has(mutation.id)) {
            uniqueMutations.push(mutation);
            idSet.add(mutation.id);
        }
    }
    return uniqueMutations;
}
class StyleSheetMirror {
    constructor() {
        this.id = 1;
        this.styleIDMap = new WeakMap();
        this.idStyleMap = new Map();
    }
    getId(stylesheet) {
        var _a;
        return (_a = this.styleIDMap.get(stylesheet)) !== null && _a !== void 0 ? _a : -1;
    }
    has(stylesheet) {
        return this.styleIDMap.has(stylesheet);
    }
    add(stylesheet, id) {
        if (this.has(stylesheet))
            return this.getId(stylesheet);
        let newId;
        if (id === undefined) {
            newId = this.id++;
        }
        else
            newId = id;
        this.styleIDMap.set(stylesheet, newId);
        this.idStyleMap.set(newId, stylesheet);
        return newId;
    }
    getStyle(id) {
        return this.idStyleMap.get(id) || null;
    }
    reset() {
        this.styleIDMap = new WeakMap();
        this.idStyleMap = new Map();
        this.id = 1;
    }
    generateId() {
        return this.id++;
    }
}
function getShadowHost(n) {
    var _a, _b;
    let shadowHost = null;
    if (((_b = (_a = n.getRootNode) === null || _a === void 0 ? void 0 : _a.call(n)) === null || _b === void 0 ? void 0 : _b.nodeType) === Node.DOCUMENT_FRAGMENT_NODE &&
        n.getRootNode().host)
        shadowHost = n.getRootNode().host;
    return shadowHost;
}
function getRootShadowHost(n) {
    let rootShadowHost = n;
    let shadowHost;
    while ((shadowHost = getShadowHost(rootShadowHost)))
        rootShadowHost = shadowHost;
    return rootShadowHost;
}
function shadowHostInDom(n) {
    const doc = n.ownerDocument;
    if (!doc)
        return false;
    const shadowHost = getRootShadowHost(n);
    return doc.contains(shadowHost);
}
function inDom(n) {
    const doc = n.ownerDocument;
    if (!doc)
        return false;
    return doc.contains(n) || shadowHostInDom(n);
}

var utils = /*#__PURE__*/Object.freeze({
    __proto__: null,
    on: on,
    get _mirror () { return exports.mirror; },
    throttle: throttle,
    hookSetter: hookSetter,
    patch: patch,
    get nowTimestamp () { return nowTimestamp; },
    getWindowScroll: getWindowScroll,
    getWindowHeight: getWindowHeight,
    getWindowWidth: getWindowWidth,
    closestElementOfNode: closestElementOfNode,
    isBlocked: isBlocked,
    isSerialized: isSerialized,
    isIgnored: isIgnored,
    isAncestorRemoved: isAncestorRemoved,
    legacy_isTouchEvent: legacy_isTouchEvent,
    polyfill: polyfill$1,
    queueToResolveTrees: queueToResolveTrees,
    iterateResolveTree: iterateResolveTree,
    isSerializedIframe: isSerializedIframe,
    isSerializedStylesheet: isSerializedStylesheet,
    getBaseDimension: getBaseDimension,
    hasShadowRoot: hasShadowRoot,
    getNestedRule: getNestedRule,
    getPositionsAndIndex: getPositionsAndIndex,
    uniqueTextMutations: uniqueTextMutations,
    StyleSheetMirror: StyleSheetMirror,
    getShadowHost: getShadowHost,
    getRootShadowHost: getRootShadowHost,
    shadowHostInDom: shadowHostInDom,
    inDom: inDom
});

var EventType = /* @__PURE__ */ ((EventType2) => {
  EventType2[EventType2["DomContentLoaded"] = 0] = "DomContentLoaded";
  EventType2[EventType2["Load"] = 1] = "Load";
  EventType2[EventType2["FullSnapshot"] = 2] = "FullSnapshot";
  EventType2[EventType2["IncrementalSnapshot"] = 3] = "IncrementalSnapshot";
  EventType2[EventType2["Meta"] = 4] = "Meta";
  EventType2[EventType2["Custom"] = 5] = "Custom";
  EventType2[EventType2["Plugin"] = 6] = "Plugin";
  return EventType2;
})(EventType || {});
var IncrementalSource = /* @__PURE__ */ ((IncrementalSource2) => {
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
})(IncrementalSource || {});
var MouseInteractions = /* @__PURE__ */ ((MouseInteractions2) => {
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
})(MouseInteractions || {});
var PointerTypes = /* @__PURE__ */ ((PointerTypes2) => {
  PointerTypes2[PointerTypes2["Mouse"] = 0] = "Mouse";
  PointerTypes2[PointerTypes2["Pen"] = 1] = "Pen";
  PointerTypes2[PointerTypes2["Touch"] = 2] = "Touch";
  return PointerTypes2;
})(PointerTypes || {});
var CanvasContext = /* @__PURE__ */ ((CanvasContext2) => {
  CanvasContext2[CanvasContext2["2D"] = 0] = "2D";
  CanvasContext2[CanvasContext2["WebGL"] = 1] = "WebGL";
  CanvasContext2[CanvasContext2["WebGL2"] = 2] = "WebGL2";
  return CanvasContext2;
})(CanvasContext || {});
var ReplayerEvents = /* @__PURE__ */ ((ReplayerEvents2) => {
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
})(ReplayerEvents || {});

function isNodeInLinkedList(n) {
    return '__ln' in n;
}
class DoubleLinkedList {
    constructor() {
        this.length = 0;
        this.head = null;
        this.tail = null;
    }
    get(position) {
        if (position >= this.length) {
            throw new Error('Position outside of list range');
        }
        let current = this.head;
        for (let index = 0; index < position; index++) {
            current = (current === null || current === void 0 ? void 0 : current.next) || null;
        }
        return current;
    }
    addNode(n) {
        const node = {
            value: n,
            previous: null,
            next: null,
        };
        n.__ln = node;
        if (n.previousSibling && isNodeInLinkedList(n.previousSibling)) {
            const current = n.previousSibling.__ln.next;
            node.next = current;
            node.previous = n.previousSibling.__ln;
            n.previousSibling.__ln.next = node;
            if (current) {
                current.previous = node;
            }
        }
        else if (n.nextSibling &&
            isNodeInLinkedList(n.nextSibling) &&
            n.nextSibling.__ln.previous) {
            const current = n.nextSibling.__ln.previous;
            node.previous = current;
            node.next = n.nextSibling.__ln;
            n.nextSibling.__ln.previous = node;
            if (current) {
                current.next = node;
            }
        }
        else {
            if (this.head) {
                this.head.previous = node;
            }
            node.next = this.head;
            this.head = node;
        }
        if (node.next === null) {
            this.tail = node;
        }
        this.length++;
    }
    removeNode(n) {
        const current = n.__ln;
        if (!this.head) {
            return;
        }
        if (!current.previous) {
            this.head = current.next;
            if (this.head) {
                this.head.previous = null;
            }
            else {
                this.tail = null;
            }
        }
        else {
            current.previous.next = current.next;
            if (current.next) {
                current.next.previous = current.previous;
            }
            else {
                this.tail = current.previous;
            }
        }
        if (n.__ln) {
            delete n.__ln;
        }
        this.length--;
    }
}
const moveKey = (id, parentId) => `${id}@${parentId}`;
class MutationBuffer {
    constructor() {
        this.frozen = false;
        this.locked = false;
        this.texts = [];
        this.attributes = [];
        this.attributeMap = new WeakMap();
        this.removes = [];
        this.mapRemoves = [];
        this.movedMap = {};
        this.addedSet = new Set();
        this.movedSet = new Set();
        this.droppedSet = new Set();
        this.processMutations = (mutations) => {
            mutations.forEach(this.processMutation);
            this.emit();
        };
        this.emit = () => {
            if (this.frozen || this.locked) {
                return;
            }
            const adds = [];
            const addedIds = new Set();
            const addList = new DoubleLinkedList();
            const getNextId = (n) => {
                let ns = n;
                let nextId = IGNORED_NODE;
                while (nextId === IGNORED_NODE) {
                    ns = ns && ns.nextSibling;
                    nextId = ns && this.mirror.getId(ns);
                }
                return nextId;
            };
            const pushAdd = (n) => {
                if (!n.parentNode ||
                    !inDom(n) ||
                    n.parentNode.tagName === 'TEXTAREA') {
                    return;
                }
                const parentId = isShadowRoot(n.parentNode)
                    ? this.mirror.getId(getShadowHost(n))
                    : this.mirror.getId(n.parentNode);
                const nextId = getNextId(n);
                if (parentId === -1 || nextId === -1) {
                    return addList.addNode(n);
                }
                const sn = serializeNodeWithId(n, {
                    doc: this.doc,
                    mirror: this.mirror,
                    blockClass: this.blockClass,
                    blockSelector: this.blockSelector,
                    maskTextClass: this.maskTextClass,
                    maskTextSelector: this.maskTextSelector,
                    skipChild: true,
                    newlyAddedElement: true,
                    inlineStylesheet: this.inlineStylesheet,
                    maskInputOptions: this.maskInputOptions,
                    maskTextFn: this.maskTextFn,
                    maskInputFn: this.maskInputFn,
                    slimDOMOptions: this.slimDOMOptions,
                    dataURLOptions: this.dataURLOptions,
                    recordCanvas: this.recordCanvas,
                    inlineImages: this.inlineImages,
                    onSerialize: (currentN) => {
                        if (isSerializedIframe(currentN, this.mirror)) {
                            this.iframeManager.addIframe(currentN);
                        }
                        if (isSerializedStylesheet(currentN, this.mirror)) {
                            this.stylesheetManager.trackLinkElement(currentN);
                        }
                        if (hasShadowRoot(n)) {
                            this.shadowDomManager.addShadowRoot(n.shadowRoot, this.doc);
                        }
                    },
                    onIframeLoad: (iframe, childSn) => {
                        this.iframeManager.attachIframe(iframe, childSn);
                        this.shadowDomManager.observeAttachShadow(iframe);
                    },
                    onStylesheetLoad: (link, childSn) => {
                        this.stylesheetManager.attachLinkElement(link, childSn);
                    },
                });
                if (sn) {
                    adds.push({
                        parentId,
                        nextId,
                        node: sn,
                    });
                    addedIds.add(sn.id);
                }
            };
            while (this.mapRemoves.length) {
                this.mirror.removeNodeFromMap(this.mapRemoves.shift());
            }
            for (const n of this.movedSet) {
                if (isParentRemoved(this.removes, n, this.mirror) &&
                    !this.movedSet.has(n.parentNode)) {
                    continue;
                }
                pushAdd(n);
            }
            for (const n of this.addedSet) {
                if (!isAncestorInSet(this.droppedSet, n) &&
                    !isParentRemoved(this.removes, n, this.mirror)) {
                    pushAdd(n);
                }
                else if (isAncestorInSet(this.movedSet, n)) {
                    pushAdd(n);
                }
                else {
                    this.droppedSet.add(n);
                }
            }
            let candidate = null;
            while (addList.length) {
                let node = null;
                if (candidate) {
                    const parentId = this.mirror.getId(candidate.value.parentNode);
                    const nextId = getNextId(candidate.value);
                    if (parentId !== -1 && nextId !== -1) {
                        node = candidate;
                    }
                }
                if (!node) {
                    let tailNode = addList.tail;
                    while (tailNode) {
                        const _node = tailNode;
                        tailNode = tailNode.previous;
                        if (_node) {
                            const parentId = this.mirror.getId(_node.value.parentNode);
                            const nextId = getNextId(_node.value);
                            if (nextId === -1)
                                continue;
                            else if (parentId !== -1) {
                                node = _node;
                                break;
                            }
                            else {
                                const unhandledNode = _node.value;
                                if (unhandledNode.parentNode &&
                                    unhandledNode.parentNode.nodeType ===
                                        Node.DOCUMENT_FRAGMENT_NODE) {
                                    const shadowHost = unhandledNode.parentNode
                                        .host;
                                    const parentId = this.mirror.getId(shadowHost);
                                    if (parentId !== -1) {
                                        node = _node;
                                        break;
                                    }
                                }
                            }
                        }
                    }
                }
                if (!node) {
                    while (addList.head) {
                        addList.removeNode(addList.head.value);
                    }
                    break;
                }
                candidate = node.previous;
                addList.removeNode(node.value);
                pushAdd(node.value);
            }
            const payload = {
                texts: this.texts
                    .map((text) => {
                    const n = text.node;
                    if (n.parentNode &&
                        n.parentNode.tagName === 'TEXTAREA') {
                        this.genTextAreaValueMutation(n.parentNode);
                    }
                    return {
                        id: this.mirror.getId(n),
                        value: text.value,
                    };
                })
                    .filter((text) => !addedIds.has(text.id))
                    .filter((text) => this.mirror.has(text.id)),
                attributes: this.attributes
                    .map((attribute) => {
                    const { attributes } = attribute;
                    if (typeof attributes.style === 'string') {
                        const diffAsStr = JSON.stringify(attribute.styleDiff);
                        const unchangedAsStr = JSON.stringify(attribute._unchangedStyles);
                        if (diffAsStr.length < attributes.style.length) {
                            if ((diffAsStr + unchangedAsStr).split('var(').length ===
                                attributes.style.split('var(').length) {
                                attributes.style = attribute.styleDiff;
                            }
                        }
                    }
                    return {
                        id: this.mirror.getId(attribute.node),
                        attributes: attributes,
                    };
                })
                    .filter((attribute) => !addedIds.has(attribute.id))
                    .filter((attribute) => this.mirror.has(attribute.id)),
                removes: this.removes,
                adds,
            };
            if (!payload.texts.length &&
                !payload.attributes.length &&
                !payload.removes.length &&
                !payload.adds.length) {
                return;
            }
            this.texts = [];
            this.attributes = [];
            this.attributeMap = new WeakMap();
            this.removes = [];
            this.addedSet = new Set();
            this.movedSet = new Set();
            this.droppedSet = new Set();
            this.movedMap = {};
            this.mutationCb(payload);
        };
        this.genTextAreaValueMutation = (textarea) => {
            let item = this.attributeMap.get(textarea);
            if (!item) {
                item = {
                    node: textarea,
                    attributes: {},
                    styleDiff: {},
                    _unchangedStyles: {},
                };
                this.attributes.push(item);
                this.attributeMap.set(textarea, item);
            }
            item.attributes.value = Array.from(textarea.childNodes, (cn) => cn.textContent || '').join('');
        };
        this.processMutation = (m) => {
            if (isIgnored(m.target, this.mirror)) {
                return;
            }
            switch (m.type) {
                case 'characterData': {
                    const value = m.target.textContent;
                    if (!isBlocked(m.target, this.blockClass, this.blockSelector, false) &&
                        value !== m.oldValue) {
                        this.texts.push({
                            value: needMaskingText(m.target, this.maskTextClass, this.maskTextSelector, true) && value
                                ? this.maskTextFn
                                    ? this.maskTextFn(value, closestElementOfNode(m.target))
                                    : value.replace(/[\S]/g, '*')
                                : value,
                            node: m.target,
                        });
                    }
                    break;
                }
                case 'attributes': {
                    const target = m.target;
                    let attributeName = m.attributeName;
                    let value = m.target.getAttribute(attributeName);
                    if (attributeName === 'value') {
                        const type = getInputType(target);
                        value = maskInputValue({
                            element: target,
                            maskInputOptions: this.maskInputOptions,
                            tagName: target.tagName,
                            type,
                            value,
                            maskInputFn: this.maskInputFn,
                        });
                    }
                    if (isBlocked(m.target, this.blockClass, this.blockSelector, false) ||
                        value === m.oldValue) {
                        return;
                    }
                    let item = this.attributeMap.get(m.target);
                    if (target.tagName === 'IFRAME' &&
                        attributeName === 'src' &&
                        !this.keepIframeSrcFn(value)) {
                        if (!target.contentDocument) {
                            attributeName = 'rr_src';
                        }
                        else {
                            return;
                        }
                    }
                    if (!item) {
                        item = {
                            node: m.target,
                            attributes: {},
                            styleDiff: {},
                            _unchangedStyles: {},
                        };
                        this.attributes.push(item);
                        this.attributeMap.set(m.target, item);
                    }
                    if (attributeName === 'type' &&
                        target.tagName === 'INPUT' &&
                        (m.oldValue || '').toLowerCase() === 'password') {
                        target.setAttribute('data-rr-is-password', 'true');
                    }
                    if (!ignoreAttribute(target.tagName, attributeName)) {
                        item.attributes[attributeName] = transformAttribute(this.doc, toLowerCase(target.tagName), toLowerCase(attributeName), value);
                        if (attributeName === 'style') {
                            if (!this.unattachedDoc) {
                                try {
                                    this.unattachedDoc =
                                        document.implementation.createHTMLDocument();
                                }
                                catch (e) {
                                    this.unattachedDoc = this.doc;
                                }
                            }
                            const old = this.unattachedDoc.createElement('span');
                            if (m.oldValue) {
                                old.setAttribute('style', m.oldValue);
                            }
                            for (const pname of Array.from(target.style)) {
                                const newValue = target.style.getPropertyValue(pname);
                                const newPriority = target.style.getPropertyPriority(pname);
                                if (newValue !== old.style.getPropertyValue(pname) ||
                                    newPriority !== old.style.getPropertyPriority(pname)) {
                                    if (newPriority === '') {
                                        item.styleDiff[pname] = newValue;
                                    }
                                    else {
                                        item.styleDiff[pname] = [newValue, newPriority];
                                    }
                                }
                                else {
                                    item._unchangedStyles[pname] = [newValue, newPriority];
                                }
                            }
                            for (const pname of Array.from(old.style)) {
                                if (target.style.getPropertyValue(pname) === '') {
                                    item.styleDiff[pname] = false;
                                }
                            }
                        }
                    }
                    break;
                }
                case 'childList': {
                    if (isBlocked(m.target, this.blockClass, this.blockSelector, true))
                        return;
                    if (m.target.tagName === 'TEXTAREA') {
                        this.genTextAreaValueMutation(m.target);
                        return;
                    }
                    m.addedNodes.forEach((n) => this.genAdds(n, m.target));
                    m.removedNodes.forEach((n) => {
                        const nodeId = this.mirror.getId(n);
                        const parentId = isShadowRoot(m.target)
                            ? this.mirror.getId(m.target.host)
                            : this.mirror.getId(m.target);
                        if (isBlocked(m.target, this.blockClass, this.blockSelector, false) ||
                            isIgnored(n, this.mirror) ||
                            !isSerialized(n, this.mirror)) {
                            return;
                        }
                        if (this.addedSet.has(n)) {
                            deepDelete(this.addedSet, n);
                            this.droppedSet.add(n);
                        }
                        else if (this.addedSet.has(m.target) && nodeId === -1) ;
                        else if (isAncestorRemoved(m.target, this.mirror)) ;
                        else if (this.movedSet.has(n) &&
                            this.movedMap[moveKey(nodeId, parentId)]) {
                            deepDelete(this.movedSet, n);
                        }
                        else {
                            this.removes.push({
                                parentId,
                                id: nodeId,
                                isShadow: isShadowRoot(m.target) && isNativeShadowDom(m.target)
                                    ? true
                                    : undefined,
                            });
                        }
                        this.mapRemoves.push(n);
                    });
                    break;
                }
            }
        };
        this.genAdds = (n, target) => {
            if (this.processedNodeManager.inOtherBuffer(n, this))
                return;
            if (this.addedSet.has(n) || this.movedSet.has(n))
                return;
            if (this.mirror.hasNode(n)) {
                if (isIgnored(n, this.mirror)) {
                    return;
                }
                this.movedSet.add(n);
                let targetId = null;
                if (target && this.mirror.hasNode(target)) {
                    targetId = this.mirror.getId(target);
                }
                if (targetId && targetId !== -1) {
                    this.movedMap[moveKey(this.mirror.getId(n), targetId)] = true;
                }
            }
            else {
                this.addedSet.add(n);
                this.droppedSet.delete(n);
            }
            if (!isBlocked(n, this.blockClass, this.blockSelector, false)) {
                n.childNodes.forEach((childN) => this.genAdds(childN));
                if (hasShadowRoot(n)) {
                    n.shadowRoot.childNodes.forEach((childN) => {
                        this.processedNodeManager.add(childN, this);
                        this.genAdds(childN, n);
                    });
                }
            }
        };
    }
    init(options) {
        [
            'mutationCb',
            'blockClass',
            'blockSelector',
            'maskTextClass',
            'maskTextSelector',
            'inlineStylesheet',
            'maskInputOptions',
            'maskTextFn',
            'maskInputFn',
            'keepIframeSrcFn',
            'recordCanvas',
            'inlineImages',
            'slimDOMOptions',
            'dataURLOptions',
            'doc',
            'mirror',
            'iframeManager',
            'stylesheetManager',
            'shadowDomManager',
            'canvasManager',
            'processedNodeManager',
        ].forEach((key) => {
            this[key] = options[key];
        });
    }
    freeze() {
        this.frozen = true;
        this.canvasManager.freeze();
    }
    unfreeze() {
        this.frozen = false;
        this.canvasManager.unfreeze();
        this.emit();
    }
    isFrozen() {
        return this.frozen;
    }
    lock() {
        this.locked = true;
        this.canvasManager.lock();
    }
    unlock() {
        this.locked = false;
        this.canvasManager.unlock();
        this.emit();
    }
    reset() {
        this.shadowDomManager.reset();
        this.canvasManager.reset();
    }
}
function deepDelete(addsSet, n) {
    addsSet.delete(n);
    n.childNodes.forEach((childN) => deepDelete(addsSet, childN));
}
function isParentRemoved(removes, n, mirror) {
    if (removes.length === 0)
        return false;
    return _isParentRemoved(removes, n, mirror);
}
function _isParentRemoved(removes, n, mirror) {
    const { parentNode } = n;
    if (!parentNode) {
        return false;
    }
    const parentId = mirror.getId(parentNode);
    if (removes.some((r) => r.id === parentId)) {
        return true;
    }
    return _isParentRemoved(removes, parentNode, mirror);
}
function isAncestorInSet(set, n) {
    if (set.size === 0)
        return false;
    return _isAncestorInSet(set, n);
}
function _isAncestorInSet(set, n) {
    const { parentNode } = n;
    if (!parentNode) {
        return false;
    }
    if (set.has(parentNode)) {
        return true;
    }
    return _isAncestorInSet(set, parentNode);
}

let errorHandler;
function registerErrorHandler(handler) {
    errorHandler = handler;
}
function unregisterErrorHandler() {
    errorHandler = undefined;
}
const callbackWrapper = (cb) => {
    if (!errorHandler) {
        return cb;
    }
    const rrwebWrapped = ((...rest) => {
        try {
            return cb(...rest);
        }
        catch (error) {
            if (errorHandler && errorHandler(error) === true) {
                return;
            }
            throw error;
        }
    });
    return rrwebWrapped;
};

const mutationBuffers = [];
function getEventTarget(event) {
    try {
        if ('composedPath' in event) {
            const path = event.composedPath();
            if (path.length) {
                return path[0];
            }
        }
        else if ('path' in event && event.path.length) {
            return event.path[0];
        }
    }
    catch (_a) {
    }
    return event && event.target;
}
function initMutationObserver(options, rootEl) {
    var _a, _b;
    const mutationBuffer = new MutationBuffer();
    mutationBuffers.push(mutationBuffer);
    mutationBuffer.init(options);
    let mutationObserverCtor = window.MutationObserver ||
        window.__rrMutationObserver;
    const angularZoneSymbol = (_b = (_a = window === null || window === void 0 ? void 0 : window.Zone) === null || _a === void 0 ? void 0 : _a.__symbol__) === null || _b === void 0 ? void 0 : _b.call(_a, 'MutationObserver');
    if (angularZoneSymbol &&
        window[angularZoneSymbol]) {
        mutationObserverCtor = window[angularZoneSymbol];
    }
    const observer = new mutationObserverCtor(callbackWrapper(mutationBuffer.processMutations.bind(mutationBuffer)));
    observer.observe(rootEl, {
        attributes: true,
        attributeOldValue: true,
        characterData: true,
        characterDataOldValue: true,
        childList: true,
        subtree: true,
    });
    return observer;
}
function initMoveObserver({ mousemoveCb, sampling, doc, mirror, }) {
    if (sampling.mousemove === false) {
        return () => {
        };
    }
    const threshold = typeof sampling.mousemove === 'number' ? sampling.mousemove : 50;
    const callbackThreshold = typeof sampling.mousemoveCallback === 'number'
        ? sampling.mousemoveCallback
        : 500;
    let positions = [];
    let timeBaseline;
    const wrappedCb = throttle(callbackWrapper((source) => {
        const totalOffset = Date.now() - timeBaseline;
        mousemoveCb(positions.map((p) => {
            p.timeOffset -= totalOffset;
            return p;
        }), source);
        positions = [];
        timeBaseline = null;
    }), callbackThreshold);
    const updatePosition = callbackWrapper(throttle(callbackWrapper((evt) => {
        const target = getEventTarget(evt);
        const { clientX, clientY } = legacy_isTouchEvent(evt)
            ? evt.changedTouches[0]
            : evt;
        if (!timeBaseline) {
            timeBaseline = nowTimestamp();
        }
        positions.push({
            x: clientX,
            y: clientY,
            id: mirror.getId(target),
            timeOffset: nowTimestamp() - timeBaseline,
        });
        wrappedCb(typeof DragEvent !== 'undefined' && evt instanceof DragEvent
            ? IncrementalSource.Drag
            : evt instanceof MouseEvent
                ? IncrementalSource.MouseMove
                : IncrementalSource.TouchMove);
    }), threshold, {
        trailing: false,
    }));
    const handlers = [
        on('mousemove', updatePosition, doc),
        on('touchmove', updatePosition, doc),
        on('drag', updatePosition, doc),
    ];
    return callbackWrapper(() => {
        handlers.forEach((h) => h());
    });
}
function initMouseInteractionObserver({ mouseInteractionCb, doc, mirror, blockClass, blockSelector, sampling, }) {
    if (sampling.mouseInteraction === false) {
        return () => {
        };
    }
    const disableMap = sampling.mouseInteraction === true ||
        sampling.mouseInteraction === undefined
        ? {}
        : sampling.mouseInteraction;
    const handlers = [];
    let currentPointerType = null;
    const getHandler = (eventKey) => {
        return (event) => {
            const target = getEventTarget(event);
            if (isBlocked(target, blockClass, blockSelector, true)) {
                return;
            }
            let pointerType = null;
            let thisEventKey = eventKey;
            if ('pointerType' in event) {
                switch (event.pointerType) {
                    case 'mouse':
                        pointerType = PointerTypes.Mouse;
                        break;
                    case 'touch':
                        pointerType = PointerTypes.Touch;
                        break;
                    case 'pen':
                        pointerType = PointerTypes.Pen;
                        break;
                }
                if (pointerType === PointerTypes.Touch) {
                    if (MouseInteractions[eventKey] === MouseInteractions.MouseDown) {
                        thisEventKey = 'TouchStart';
                    }
                    else if (MouseInteractions[eventKey] === MouseInteractions.MouseUp) {
                        thisEventKey = 'TouchEnd';
                    }
                }
                else if (pointerType === PointerTypes.Pen) ;
            }
            else if (legacy_isTouchEvent(event)) {
                pointerType = PointerTypes.Touch;
            }
            if (pointerType !== null) {
                currentPointerType = pointerType;
                if ((thisEventKey.startsWith('Touch') &&
                    pointerType === PointerTypes.Touch) ||
                    (thisEventKey.startsWith('Mouse') &&
                        pointerType === PointerTypes.Mouse)) {
                    pointerType = null;
                }
            }
            else if (MouseInteractions[eventKey] === MouseInteractions.Click) {
                pointerType = currentPointerType;
                currentPointerType = null;
            }
            const e = legacy_isTouchEvent(event) ? event.changedTouches[0] : event;
            if (!e) {
                return;
            }
            const id = mirror.getId(target);
            const { clientX, clientY } = e;
            callbackWrapper(mouseInteractionCb)(Object.assign({ type: MouseInteractions[thisEventKey], id, x: clientX, y: clientY }, (pointerType !== null && { pointerType })));
        };
    };
    Object.keys(MouseInteractions)
        .filter((key) => Number.isNaN(Number(key)) &&
        !key.endsWith('_Departed') &&
        disableMap[key] !== false)
        .forEach((eventKey) => {
        let eventName = toLowerCase(eventKey);
        const handler = getHandler(eventKey);
        if (window.PointerEvent) {
            switch (MouseInteractions[eventKey]) {
                case MouseInteractions.MouseDown:
                case MouseInteractions.MouseUp:
                    eventName = eventName.replace('mouse', 'pointer');
                    break;
                case MouseInteractions.TouchStart:
                case MouseInteractions.TouchEnd:
                    return;
            }
        }
        handlers.push(on(eventName, handler, doc));
    });
    return callbackWrapper(() => {
        handlers.forEach((h) => h());
    });
}
function initScrollObserver({ scrollCb, doc, mirror, blockClass, blockSelector, sampling, }) {
    const updatePosition = callbackWrapper(throttle(callbackWrapper((evt) => {
        const target = getEventTarget(evt);
        if (!target ||
            isBlocked(target, blockClass, blockSelector, true)) {
            return;
        }
        const id = mirror.getId(target);
        if (target === doc && doc.defaultView) {
            const scrollLeftTop = getWindowScroll(doc.defaultView);
            scrollCb({
                id,
                x: scrollLeftTop.left,
                y: scrollLeftTop.top,
            });
        }
        else {
            scrollCb({
                id,
                x: target.scrollLeft,
                y: target.scrollTop,
            });
        }
    }), sampling.scroll || 100));
    return on('scroll', updatePosition, doc);
}
function initViewportResizeObserver({ viewportResizeCb }, { win }) {
    let lastH = -1;
    let lastW = -1;
    const updateDimension = callbackWrapper(throttle(callbackWrapper(() => {
        const height = getWindowHeight();
        const width = getWindowWidth();
        if (lastH !== height || lastW !== width) {
            viewportResizeCb({
                width: Number(width),
                height: Number(height),
            });
            lastH = height;
            lastW = width;
        }
    }), 200));
    return on('resize', updateDimension, win);
}
const INPUT_TAGS = ['INPUT', 'TEXTAREA', 'SELECT'];
const lastInputValueMap = new WeakMap();
function initInputObserver({ inputCb, doc, mirror, blockClass, blockSelector, ignoreClass, ignoreSelector, maskInputOptions, maskInputFn, sampling, userTriggeredOnInput, }) {
    function eventHandler(event) {
        let target = getEventTarget(event);
        const userTriggered = event.isTrusted;
        const tagName = target && target.tagName;
        if (target && tagName === 'OPTION') {
            target = target.parentElement;
        }
        if (!target ||
            !tagName ||
            INPUT_TAGS.indexOf(tagName) < 0 ||
            isBlocked(target, blockClass, blockSelector, true)) {
            return;
        }
        if (target.classList.contains(ignoreClass) ||
            (ignoreSelector && target.matches(ignoreSelector))) {
            return;
        }
        let text = target.value;
        let isChecked = false;
        const type = getInputType(target) || '';
        if (type === 'radio' || type === 'checkbox') {
            isChecked = target.checked;
        }
        else if (maskInputOptions[tagName.toLowerCase()] ||
            maskInputOptions[type]) {
            text = maskInputValue({
                element: target,
                maskInputOptions,
                tagName,
                type,
                value: text,
                maskInputFn,
            });
        }
        cbWithDedup(target, userTriggeredOnInput
            ? { text, isChecked, userTriggered }
            : { text, isChecked });
        const name = target.name;
        if (type === 'radio' && name && isChecked) {
            doc
                .querySelectorAll(`input[type="radio"][name="${name}"]`)
                .forEach((el) => {
                if (el !== target) {
                    const text = el.value;
                    cbWithDedup(el, userTriggeredOnInput
                        ? { text, isChecked: !isChecked, userTriggered: false }
                        : { text, isChecked: !isChecked });
                }
            });
        }
    }
    function cbWithDedup(target, v) {
        const lastInputValue = lastInputValueMap.get(target);
        if (!lastInputValue ||
            lastInputValue.text !== v.text ||
            lastInputValue.isChecked !== v.isChecked) {
            lastInputValueMap.set(target, v);
            const id = mirror.getId(target);
            callbackWrapper(inputCb)(Object.assign(Object.assign({}, v), { id }));
        }
    }
    const events = sampling.input === 'last' ? ['change'] : ['input', 'change'];
    const handlers = events.map((eventName) => on(eventName, callbackWrapper(eventHandler), doc));
    const currentWindow = doc.defaultView;
    if (!currentWindow) {
        return () => {
            handlers.forEach((h) => h());
        };
    }
    const propertyDescriptor = currentWindow.Object.getOwnPropertyDescriptor(currentWindow.HTMLInputElement.prototype, 'value');
    const hookProperties = [
        [currentWindow.HTMLInputElement.prototype, 'value'],
        [currentWindow.HTMLInputElement.prototype, 'checked'],
        [currentWindow.HTMLSelectElement.prototype, 'value'],
        [currentWindow.HTMLTextAreaElement.prototype, 'value'],
        [currentWindow.HTMLSelectElement.prototype, 'selectedIndex'],
        [currentWindow.HTMLOptionElement.prototype, 'selected'],
    ];
    if (propertyDescriptor && propertyDescriptor.set) {
        handlers.push(...hookProperties.map((p) => hookSetter(p[0], p[1], {
            set() {
                callbackWrapper(eventHandler)({
                    target: this,
                    isTrusted: false,
                });
            },
        }, false, currentWindow)));
    }
    return callbackWrapper(() => {
        handlers.forEach((h) => h());
    });
}
function getNestedCSSRulePositions(rule) {
    const positions = [];
    function recurse(childRule, pos) {
        if ((hasNestedCSSRule('CSSGroupingRule') &&
            childRule.parentRule instanceof CSSGroupingRule) ||
            (hasNestedCSSRule('CSSMediaRule') &&
                childRule.parentRule instanceof CSSMediaRule) ||
            (hasNestedCSSRule('CSSSupportsRule') &&
                childRule.parentRule instanceof CSSSupportsRule) ||
            (hasNestedCSSRule('CSSConditionRule') &&
                childRule.parentRule instanceof CSSConditionRule)) {
            const rules = Array.from(childRule.parentRule.cssRules);
            const index = rules.indexOf(childRule);
            pos.unshift(index);
        }
        else if (childRule.parentStyleSheet) {
            const rules = Array.from(childRule.parentStyleSheet.cssRules);
            const index = rules.indexOf(childRule);
            pos.unshift(index);
        }
        return pos;
    }
    return recurse(rule, positions);
}
function getIdAndStyleId(sheet, mirror, styleMirror) {
    let id, styleId;
    if (!sheet)
        return {};
    if (sheet.ownerNode)
        id = mirror.getId(sheet.ownerNode);
    else
        styleId = styleMirror.getId(sheet);
    return {
        styleId,
        id,
    };
}
function initStyleSheetObserver({ styleSheetRuleCb, mirror, stylesheetManager }, { win }) {
    if (!win.CSSStyleSheet || !win.CSSStyleSheet.prototype) {
        return () => {
        };
    }
    const insertRule = win.CSSStyleSheet.prototype.insertRule;
    win.CSSStyleSheet.prototype.insertRule = new Proxy(insertRule, {
        apply: callbackWrapper((target, thisArg, argumentsList) => {
            const [rule, index] = argumentsList;
            const { id, styleId } = getIdAndStyleId(thisArg, mirror, stylesheetManager.styleMirror);
            if ((id && id !== -1) || (styleId && styleId !== -1)) {
                styleSheetRuleCb({
                    id,
                    styleId,
                    adds: [{ rule, index }],
                });
            }
            return target.apply(thisArg, argumentsList);
        }),
    });
    const deleteRule = win.CSSStyleSheet.prototype.deleteRule;
    win.CSSStyleSheet.prototype.deleteRule = new Proxy(deleteRule, {
        apply: callbackWrapper((target, thisArg, argumentsList) => {
            const [index] = argumentsList;
            const { id, styleId } = getIdAndStyleId(thisArg, mirror, stylesheetManager.styleMirror);
            if ((id && id !== -1) || (styleId && styleId !== -1)) {
                styleSheetRuleCb({
                    id,
                    styleId,
                    removes: [{ index }],
                });
            }
            return target.apply(thisArg, argumentsList);
        }),
    });
    let replace;
    if (win.CSSStyleSheet.prototype.replace) {
        replace = win.CSSStyleSheet.prototype.replace;
        win.CSSStyleSheet.prototype.replace = new Proxy(replace, {
            apply: callbackWrapper((target, thisArg, argumentsList) => {
                const [text] = argumentsList;
                const { id, styleId } = getIdAndStyleId(thisArg, mirror, stylesheetManager.styleMirror);
                if ((id && id !== -1) || (styleId && styleId !== -1)) {
                    styleSheetRuleCb({
                        id,
                        styleId,
                        replace: text,
                    });
                }
                return target.apply(thisArg, argumentsList);
            }),
        });
    }
    let replaceSync;
    if (win.CSSStyleSheet.prototype.replaceSync) {
        replaceSync = win.CSSStyleSheet.prototype.replaceSync;
        win.CSSStyleSheet.prototype.replaceSync = new Proxy(replaceSync, {
            apply: callbackWrapper((target, thisArg, argumentsList) => {
                const [text] = argumentsList;
                const { id, styleId } = getIdAndStyleId(thisArg, mirror, stylesheetManager.styleMirror);
                if ((id && id !== -1) || (styleId && styleId !== -1)) {
                    styleSheetRuleCb({
                        id,
                        styleId,
                        replaceSync: text,
                    });
                }
                return target.apply(thisArg, argumentsList);
            }),
        });
    }
    const supportedNestedCSSRuleTypes = {};
    if (canMonkeyPatchNestedCSSRule('CSSGroupingRule')) {
        supportedNestedCSSRuleTypes.CSSGroupingRule = win.CSSGroupingRule;
    }
    else {
        if (canMonkeyPatchNestedCSSRule('CSSMediaRule')) {
            supportedNestedCSSRuleTypes.CSSMediaRule = win.CSSMediaRule;
        }
        if (canMonkeyPatchNestedCSSRule('CSSConditionRule')) {
            supportedNestedCSSRuleTypes.CSSConditionRule = win.CSSConditionRule;
        }
        if (canMonkeyPatchNestedCSSRule('CSSSupportsRule')) {
            supportedNestedCSSRuleTypes.CSSSupportsRule = win.CSSSupportsRule;
        }
    }
    const unmodifiedFunctions = {};
    Object.entries(supportedNestedCSSRuleTypes).forEach(([typeKey, type]) => {
        unmodifiedFunctions[typeKey] = {
            insertRule: type.prototype.insertRule,
            deleteRule: type.prototype.deleteRule,
        };
        type.prototype.insertRule = new Proxy(unmodifiedFunctions[typeKey].insertRule, {
            apply: callbackWrapper((target, thisArg, argumentsList) => {
                const [rule, index] = argumentsList;
                const { id, styleId } = getIdAndStyleId(thisArg.parentStyleSheet, mirror, stylesheetManager.styleMirror);
                if ((id && id !== -1) || (styleId && styleId !== -1)) {
                    styleSheetRuleCb({
                        id,
                        styleId,
                        adds: [
                            {
                                rule,
                                index: [
                                    ...getNestedCSSRulePositions(thisArg),
                                    index || 0,
                                ],
                            },
                        ],
                    });
                }
                return target.apply(thisArg, argumentsList);
            }),
        });
        type.prototype.deleteRule = new Proxy(unmodifiedFunctions[typeKey].deleteRule, {
            apply: callbackWrapper((target, thisArg, argumentsList) => {
                const [index] = argumentsList;
                const { id, styleId } = getIdAndStyleId(thisArg.parentStyleSheet, mirror, stylesheetManager.styleMirror);
                if ((id && id !== -1) || (styleId && styleId !== -1)) {
                    styleSheetRuleCb({
                        id,
                        styleId,
                        removes: [
                            { index: [...getNestedCSSRulePositions(thisArg), index] },
                        ],
                    });
                }
                return target.apply(thisArg, argumentsList);
            }),
        });
    });
    return callbackWrapper(() => {
        win.CSSStyleSheet.prototype.insertRule = insertRule;
        win.CSSStyleSheet.prototype.deleteRule = deleteRule;
        replace && (win.CSSStyleSheet.prototype.replace = replace);
        replaceSync && (win.CSSStyleSheet.prototype.replaceSync = replaceSync);
        Object.entries(supportedNestedCSSRuleTypes).forEach(([typeKey, type]) => {
            type.prototype.insertRule = unmodifiedFunctions[typeKey].insertRule;
            type.prototype.deleteRule = unmodifiedFunctions[typeKey].deleteRule;
        });
    });
}
function initAdoptedStyleSheetObserver({ mirror, stylesheetManager, }, host) {
    var _a, _b, _c;
    let hostId = null;
    if (host.nodeName === '#document')
        hostId = mirror.getId(host);
    else
        hostId = mirror.getId(host.host);
    const patchTarget = host.nodeName === '#document'
        ? (_a = host.defaultView) === null || _a === void 0 ? void 0 : _a.Document
        : (_c = (_b = host.ownerDocument) === null || _b === void 0 ? void 0 : _b.defaultView) === null || _c === void 0 ? void 0 : _c.ShadowRoot;
    const originalPropertyDescriptor = (patchTarget === null || patchTarget === void 0 ? void 0 : patchTarget.prototype)
        ? Object.getOwnPropertyDescriptor(patchTarget === null || patchTarget === void 0 ? void 0 : patchTarget.prototype, 'adoptedStyleSheets')
        : undefined;
    if (hostId === null ||
        hostId === -1 ||
        !patchTarget ||
        !originalPropertyDescriptor)
        return () => {
        };
    Object.defineProperty(host, 'adoptedStyleSheets', {
        configurable: originalPropertyDescriptor.configurable,
        enumerable: originalPropertyDescriptor.enumerable,
        get() {
            var _a;
            return (_a = originalPropertyDescriptor.get) === null || _a === void 0 ? void 0 : _a.call(this);
        },
        set(sheets) {
            var _a;
            const result = (_a = originalPropertyDescriptor.set) === null || _a === void 0 ? void 0 : _a.call(this, sheets);
            if (hostId !== null && hostId !== -1) {
                try {
                    stylesheetManager.adoptStyleSheets(sheets, hostId);
                }
                catch (e) {
                }
            }
            return result;
        },
    });
    return callbackWrapper(() => {
        Object.defineProperty(host, 'adoptedStyleSheets', {
            configurable: originalPropertyDescriptor.configurable,
            enumerable: originalPropertyDescriptor.enumerable,
            get: originalPropertyDescriptor.get,
            set: originalPropertyDescriptor.set,
        });
    });
}
function initStyleDeclarationObserver({ styleDeclarationCb, mirror, ignoreCSSAttributes, stylesheetManager, }, { win }) {
    const setProperty = win.CSSStyleDeclaration.prototype.setProperty;
    win.CSSStyleDeclaration.prototype.setProperty = new Proxy(setProperty, {
        apply: callbackWrapper((target, thisArg, argumentsList) => {
            var _a;
            const [property, value, priority] = argumentsList;
            if (ignoreCSSAttributes.has(property)) {
                return setProperty.apply(thisArg, [property, value, priority]);
            }
            const { id, styleId } = getIdAndStyleId((_a = thisArg.parentRule) === null || _a === void 0 ? void 0 : _a.parentStyleSheet, mirror, stylesheetManager.styleMirror);
            if ((id && id !== -1) || (styleId && styleId !== -1)) {
                styleDeclarationCb({
                    id,
                    styleId,
                    set: {
                        property,
                        value,
                        priority,
                    },
                    index: getNestedCSSRulePositions(thisArg.parentRule),
                });
            }
            return target.apply(thisArg, argumentsList);
        }),
    });
    const removeProperty = win.CSSStyleDeclaration.prototype.removeProperty;
    win.CSSStyleDeclaration.prototype.removeProperty = new Proxy(removeProperty, {
        apply: callbackWrapper((target, thisArg, argumentsList) => {
            var _a;
            const [property] = argumentsList;
            if (ignoreCSSAttributes.has(property)) {
                return removeProperty.apply(thisArg, [property]);
            }
            const { id, styleId } = getIdAndStyleId((_a = thisArg.parentRule) === null || _a === void 0 ? void 0 : _a.parentStyleSheet, mirror, stylesheetManager.styleMirror);
            if ((id && id !== -1) || (styleId && styleId !== -1)) {
                styleDeclarationCb({
                    id,
                    styleId,
                    remove: {
                        property,
                    },
                    index: getNestedCSSRulePositions(thisArg.parentRule),
                });
            }
            return target.apply(thisArg, argumentsList);
        }),
    });
    return callbackWrapper(() => {
        win.CSSStyleDeclaration.prototype.setProperty = setProperty;
        win.CSSStyleDeclaration.prototype.removeProperty = removeProperty;
    });
}
function initMediaInteractionObserver({ mediaInteractionCb, blockClass, blockSelector, mirror, sampling, doc, }) {
    const handler = callbackWrapper((type) => throttle(callbackWrapper((event) => {
        const target = getEventTarget(event);
        if (!target ||
            isBlocked(target, blockClass, blockSelector, true)) {
            return;
        }
        const { currentTime, volume, muted, playbackRate, loop } = target;
        mediaInteractionCb({
            type,
            id: mirror.getId(target),
            currentTime,
            volume,
            muted,
            playbackRate,
            loop,
        });
    }), sampling.media || 500));
    const handlers = [
        on('play', handler(0), doc),
        on('pause', handler(1), doc),
        on('seeked', handler(2), doc),
        on('volumechange', handler(3), doc),
        on('ratechange', handler(4), doc),
    ];
    return callbackWrapper(() => {
        handlers.forEach((h) => h());
    });
}
function initFontObserver({ fontCb, doc }) {
    const win = doc.defaultView;
    if (!win) {
        return () => {
        };
    }
    const handlers = [];
    const fontMap = new WeakMap();
    const originalFontFace = win.FontFace;
    win.FontFace = function FontFace(family, source, descriptors) {
        const fontFace = new originalFontFace(family, source, descriptors);
        fontMap.set(fontFace, {
            family,
            buffer: typeof source !== 'string',
            descriptors,
            fontSource: typeof source === 'string'
                ? source
                : JSON.stringify(Array.from(new Uint8Array(source))),
        });
        return fontFace;
    };
    const restoreHandler = patch(doc.fonts, 'add', function (original) {
        return function (fontFace) {
            setTimeout(callbackWrapper(() => {
                const p = fontMap.get(fontFace);
                if (p) {
                    fontCb(p);
                    fontMap.delete(fontFace);
                }
            }), 0);
            return original.apply(this, [fontFace]);
        };
    });
    handlers.push(() => {
        win.FontFace = originalFontFace;
    });
    handlers.push(restoreHandler);
    return callbackWrapper(() => {
        handlers.forEach((h) => h());
    });
}
function initSelectionObserver(param) {
    const { doc, mirror, blockClass, blockSelector, selectionCb } = param;
    let collapsed = true;
    const updateSelection = callbackWrapper(() => {
        const selection = doc.getSelection();
        if (!selection || (collapsed && (selection === null || selection === void 0 ? void 0 : selection.isCollapsed)))
            return;
        collapsed = selection.isCollapsed || false;
        const ranges = [];
        const count = selection.rangeCount || 0;
        for (let i = 0; i < count; i++) {
            const range = selection.getRangeAt(i);
            const { startContainer, startOffset, endContainer, endOffset } = range;
            const blocked = isBlocked(startContainer, blockClass, blockSelector, true) ||
                isBlocked(endContainer, blockClass, blockSelector, true);
            if (blocked)
                continue;
            ranges.push({
                start: mirror.getId(startContainer),
                startOffset,
                end: mirror.getId(endContainer),
                endOffset,
            });
        }
        selectionCb({ ranges });
    });
    updateSelection();
    return on('selectionchange', updateSelection);
}
function initCustomElementObserver({ doc, customElementCb, }) {
    const win = doc.defaultView;
    if (!win || !win.customElements)
        return () => { };
    const restoreHandler = patch(win.customElements, 'define', function (original) {
        return function (name, constructor, options) {
            try {
                customElementCb({
                    define: {
                        name,
                    },
                });
            }
            catch (e) {
                console.warn(`Custom element callback failed for ${name}`);
            }
            return original.apply(this, [name, constructor, options]);
        };
    });
    return restoreHandler;
}
function mergeHooks(o, hooks) {
    const { mutationCb, mousemoveCb, mouseInteractionCb, scrollCb, viewportResizeCb, inputCb, mediaInteractionCb, styleSheetRuleCb, styleDeclarationCb, canvasMutationCb, fontCb, selectionCb, customElementCb, } = o;
    o.mutationCb = (...p) => {
        if (hooks.mutation) {
            hooks.mutation(...p);
        }
        mutationCb(...p);
    };
    o.mousemoveCb = (...p) => {
        if (hooks.mousemove) {
            hooks.mousemove(...p);
        }
        mousemoveCb(...p);
    };
    o.mouseInteractionCb = (...p) => {
        if (hooks.mouseInteraction) {
            hooks.mouseInteraction(...p);
        }
        mouseInteractionCb(...p);
    };
    o.scrollCb = (...p) => {
        if (hooks.scroll) {
            hooks.scroll(...p);
        }
        scrollCb(...p);
    };
    o.viewportResizeCb = (...p) => {
        if (hooks.viewportResize) {
            hooks.viewportResize(...p);
        }
        viewportResizeCb(...p);
    };
    o.inputCb = (...p) => {
        if (hooks.input) {
            hooks.input(...p);
        }
        inputCb(...p);
    };
    o.mediaInteractionCb = (...p) => {
        if (hooks.mediaInteaction) {
            hooks.mediaInteaction(...p);
        }
        mediaInteractionCb(...p);
    };
    o.styleSheetRuleCb = (...p) => {
        if (hooks.styleSheetRule) {
            hooks.styleSheetRule(...p);
        }
        styleSheetRuleCb(...p);
    };
    o.styleDeclarationCb = (...p) => {
        if (hooks.styleDeclaration) {
            hooks.styleDeclaration(...p);
        }
        styleDeclarationCb(...p);
    };
    o.canvasMutationCb = (...p) => {
        if (hooks.canvasMutation) {
            hooks.canvasMutation(...p);
        }
        canvasMutationCb(...p);
    };
    o.fontCb = (...p) => {
        if (hooks.font) {
            hooks.font(...p);
        }
        fontCb(...p);
    };
    o.selectionCb = (...p) => {
        if (hooks.selection) {
            hooks.selection(...p);
        }
        selectionCb(...p);
    };
    o.customElementCb = (...c) => {
        if (hooks.customElement) {
            hooks.customElement(...c);
        }
        customElementCb(...c);
    };
}
function initObservers(o, hooks = {}) {
    const currentWindow = o.doc.defaultView;
    if (!currentWindow) {
        return () => {
        };
    }
    mergeHooks(o, hooks);
    let mutationObserver;
    if (o.recordDOM) {
        mutationObserver = initMutationObserver(o, o.doc);
    }
    const mousemoveHandler = initMoveObserver(o);
    const mouseInteractionHandler = initMouseInteractionObserver(o);
    const scrollHandler = initScrollObserver(o);
    const viewportResizeHandler = initViewportResizeObserver(o, {
        win: currentWindow,
    });
    const inputHandler = initInputObserver(o);
    const mediaInteractionHandler = initMediaInteractionObserver(o);
    let styleSheetObserver = () => { };
    let adoptedStyleSheetObserver = () => { };
    let styleDeclarationObserver = () => { };
    let fontObserver = () => { };
    if (o.recordDOM) {
        styleSheetObserver = initStyleSheetObserver(o, { win: currentWindow });
        adoptedStyleSheetObserver = initAdoptedStyleSheetObserver(o, o.doc);
        styleDeclarationObserver = initStyleDeclarationObserver(o, {
            win: currentWindow,
        });
        if (o.collectFonts) {
            fontObserver = initFontObserver(o);
        }
    }
    const selectionObserver = initSelectionObserver(o);
    const customElementObserver = initCustomElementObserver(o);
    const pluginHandlers = [];
    for (const plugin of o.plugins) {
        pluginHandlers.push(plugin.observer(plugin.callback, currentWindow, plugin.options));
    }
    return callbackWrapper(() => {
        mutationBuffers.forEach((b) => b.reset());
        mutationObserver === null || mutationObserver === void 0 ? void 0 : mutationObserver.disconnect();
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
        pluginHandlers.forEach((h) => h());
    });
}
function hasNestedCSSRule(prop) {
    return typeof window[prop] !== 'undefined';
}
function canMonkeyPatchNestedCSSRule(prop) {
    return Boolean(typeof window[prop] !== 'undefined' &&
        window[prop].prototype &&
        'insertRule' in window[prop].prototype &&
        'deleteRule' in window[prop].prototype);
}

class CrossOriginIframeMirror {
    constructor(generateIdFn) {
        this.generateIdFn = generateIdFn;
        this.iframeIdToRemoteIdMap = new WeakMap();
        this.iframeRemoteIdToIdMap = new WeakMap();
    }
    getId(iframe, remoteId, idToRemoteMap, remoteToIdMap) {
        const idToRemoteIdMap = idToRemoteMap || this.getIdToRemoteIdMap(iframe);
        const remoteIdToIdMap = remoteToIdMap || this.getRemoteIdToIdMap(iframe);
        let id = idToRemoteIdMap.get(remoteId);
        if (!id) {
            id = this.generateIdFn();
            idToRemoteIdMap.set(remoteId, id);
            remoteIdToIdMap.set(id, remoteId);
        }
        return id;
    }
    getIds(iframe, remoteId) {
        const idToRemoteIdMap = this.getIdToRemoteIdMap(iframe);
        const remoteIdToIdMap = this.getRemoteIdToIdMap(iframe);
        return remoteId.map((id) => this.getId(iframe, id, idToRemoteIdMap, remoteIdToIdMap));
    }
    getRemoteId(iframe, id, map) {
        const remoteIdToIdMap = map || this.getRemoteIdToIdMap(iframe);
        if (typeof id !== 'number')
            return id;
        const remoteId = remoteIdToIdMap.get(id);
        if (!remoteId)
            return -1;
        return remoteId;
    }
    getRemoteIds(iframe, ids) {
        const remoteIdToIdMap = this.getRemoteIdToIdMap(iframe);
        return ids.map((id) => this.getRemoteId(iframe, id, remoteIdToIdMap));
    }
    reset(iframe) {
        if (!iframe) {
            this.iframeIdToRemoteIdMap = new WeakMap();
            this.iframeRemoteIdToIdMap = new WeakMap();
            return;
        }
        this.iframeIdToRemoteIdMap.delete(iframe);
        this.iframeRemoteIdToIdMap.delete(iframe);
    }
    getIdToRemoteIdMap(iframe) {
        let idToRemoteIdMap = this.iframeIdToRemoteIdMap.get(iframe);
        if (!idToRemoteIdMap) {
            idToRemoteIdMap = new Map();
            this.iframeIdToRemoteIdMap.set(iframe, idToRemoteIdMap);
        }
        return idToRemoteIdMap;
    }
    getRemoteIdToIdMap(iframe) {
        let remoteIdToIdMap = this.iframeRemoteIdToIdMap.get(iframe);
        if (!remoteIdToIdMap) {
            remoteIdToIdMap = new Map();
            this.iframeRemoteIdToIdMap.set(iframe, remoteIdToIdMap);
        }
        return remoteIdToIdMap;
    }
}

class IframeManager {
    constructor(options) {
        this.iframes = new WeakMap();
        this.crossOriginIframeMap = new WeakMap();
        this.crossOriginIframeMirror = new CrossOriginIframeMirror(genId);
        this.crossOriginIframeRootIdMap = new WeakMap();
        this.mutationCb = options.mutationCb;
        this.wrappedEmit = options.wrappedEmit;
        this.stylesheetManager = options.stylesheetManager;
        this.recordCrossOriginIframes = options.recordCrossOriginIframes;
        this.crossOriginIframeStyleMirror = new CrossOriginIframeMirror(this.stylesheetManager.styleMirror.generateId.bind(this.stylesheetManager.styleMirror));
        this.mirror = options.mirror;
        if (this.recordCrossOriginIframes) {
            window.addEventListener('message', this.handleMessage.bind(this));
        }
    }
    addIframe(iframeEl) {
        this.iframes.set(iframeEl, true);
        if (iframeEl.contentWindow)
            this.crossOriginIframeMap.set(iframeEl.contentWindow, iframeEl);
    }
    addLoadListener(cb) {
        this.loadListener = cb;
    }
    attachIframe(iframeEl, childSn) {
        var _a;
        this.mutationCb({
            adds: [
                {
                    parentId: this.mirror.getId(iframeEl),
                    nextId: null,
                    node: childSn,
                },
            ],
            removes: [],
            texts: [],
            attributes: [],
            isAttachIframe: true,
        });
        (_a = this.loadListener) === null || _a === void 0 ? void 0 : _a.call(this, iframeEl);
        if (iframeEl.contentDocument &&
            iframeEl.contentDocument.adoptedStyleSheets &&
            iframeEl.contentDocument.adoptedStyleSheets.length > 0)
            this.stylesheetManager.adoptStyleSheets(iframeEl.contentDocument.adoptedStyleSheets, this.mirror.getId(iframeEl.contentDocument));
    }
    handleMessage(message) {
        const crossOriginMessageEvent = message;
        if (crossOriginMessageEvent.data.type !== 'rrweb' ||
            crossOriginMessageEvent.origin !== crossOriginMessageEvent.data.origin)
            return;
        const iframeSourceWindow = message.source;
        if (!iframeSourceWindow)
            return;
        const iframeEl = this.crossOriginIframeMap.get(message.source);
        if (!iframeEl)
            return;
        const transformedEvent = this.transformCrossOriginEvent(iframeEl, crossOriginMessageEvent.data.event);
        if (transformedEvent)
            this.wrappedEmit(transformedEvent, crossOriginMessageEvent.data.isCheckout);
    }
    transformCrossOriginEvent(iframeEl, e) {
        var _a;
        switch (e.type) {
            case EventType.FullSnapshot: {
                this.crossOriginIframeMirror.reset(iframeEl);
                this.crossOriginIframeStyleMirror.reset(iframeEl);
                this.replaceIdOnNode(e.data.node, iframeEl);
                const rootId = e.data.node.id;
                this.crossOriginIframeRootIdMap.set(iframeEl, rootId);
                this.patchRootIdOnNode(e.data.node, rootId);
                return {
                    timestamp: e.timestamp,
                    type: EventType.IncrementalSnapshot,
                    data: {
                        source: IncrementalSource.Mutation,
                        adds: [
                            {
                                parentId: this.mirror.getId(iframeEl),
                                nextId: null,
                                node: e.data.node,
                            },
                        ],
                        removes: [],
                        texts: [],
                        attributes: [],
                        isAttachIframe: true,
                    },
                };
            }
            case EventType.Meta:
            case EventType.Load:
            case EventType.DomContentLoaded: {
                return false;
            }
            case EventType.Plugin: {
                return e;
            }
            case EventType.Custom: {
                this.replaceIds(e.data.payload, iframeEl, ['id', 'parentId', 'previousId', 'nextId']);
                return e;
            }
            case EventType.IncrementalSnapshot: {
                switch (e.data.source) {
                    case IncrementalSource.Mutation: {
                        e.data.adds.forEach((n) => {
                            this.replaceIds(n, iframeEl, [
                                'parentId',
                                'nextId',
                                'previousId',
                            ]);
                            this.replaceIdOnNode(n.node, iframeEl);
                            const rootId = this.crossOriginIframeRootIdMap.get(iframeEl);
                            rootId && this.patchRootIdOnNode(n.node, rootId);
                        });
                        e.data.removes.forEach((n) => {
                            this.replaceIds(n, iframeEl, ['parentId', 'id']);
                        });
                        e.data.attributes.forEach((n) => {
                            this.replaceIds(n, iframeEl, ['id']);
                        });
                        e.data.texts.forEach((n) => {
                            this.replaceIds(n, iframeEl, ['id']);
                        });
                        return e;
                    }
                    case IncrementalSource.Drag:
                    case IncrementalSource.TouchMove:
                    case IncrementalSource.MouseMove: {
                        e.data.positions.forEach((p) => {
                            this.replaceIds(p, iframeEl, ['id']);
                        });
                        return e;
                    }
                    case IncrementalSource.ViewportResize: {
                        return false;
                    }
                    case IncrementalSource.MediaInteraction:
                    case IncrementalSource.MouseInteraction:
                    case IncrementalSource.Scroll:
                    case IncrementalSource.CanvasMutation:
                    case IncrementalSource.Input: {
                        this.replaceIds(e.data, iframeEl, ['id']);
                        return e;
                    }
                    case IncrementalSource.StyleSheetRule:
                    case IncrementalSource.StyleDeclaration: {
                        this.replaceIds(e.data, iframeEl, ['id']);
                        this.replaceStyleIds(e.data, iframeEl, ['styleId']);
                        return e;
                    }
                    case IncrementalSource.Font: {
                        return e;
                    }
                    case IncrementalSource.Selection: {
                        e.data.ranges.forEach((range) => {
                            this.replaceIds(range, iframeEl, ['start', 'end']);
                        });
                        return e;
                    }
                    case IncrementalSource.AdoptedStyleSheet: {
                        this.replaceIds(e.data, iframeEl, ['id']);
                        this.replaceStyleIds(e.data, iframeEl, ['styleIds']);
                        (_a = e.data.styles) === null || _a === void 0 ? void 0 : _a.forEach((style) => {
                            this.replaceStyleIds(style, iframeEl, ['styleId']);
                        });
                        return e;
                    }
                }
            }
        }
        return false;
    }
    replace(iframeMirror, obj, iframeEl, keys) {
        for (const key of keys) {
            if (!Array.isArray(obj[key]) && typeof obj[key] !== 'number')
                continue;
            if (Array.isArray(obj[key])) {
                obj[key] = iframeMirror.getIds(iframeEl, obj[key]);
            }
            else {
                obj[key] = iframeMirror.getId(iframeEl, obj[key]);
            }
        }
        return obj;
    }
    replaceIds(obj, iframeEl, keys) {
        return this.replace(this.crossOriginIframeMirror, obj, iframeEl, keys);
    }
    replaceStyleIds(obj, iframeEl, keys) {
        return this.replace(this.crossOriginIframeStyleMirror, obj, iframeEl, keys);
    }
    replaceIdOnNode(node, iframeEl) {
        this.replaceIds(node, iframeEl, ['id', 'rootId']);
        if ('childNodes' in node) {
            node.childNodes.forEach((child) => {
                this.replaceIdOnNode(child, iframeEl);
            });
        }
    }
    patchRootIdOnNode(node, rootId) {
        if (node.type !== NodeType$2.Document && !node.rootId)
            node.rootId = rootId;
        if ('childNodes' in node) {
            node.childNodes.forEach((child) => {
                this.patchRootIdOnNode(child, rootId);
            });
        }
    }
}

class ShadowDomManager {
    constructor(options) {
        this.shadowDoms = new WeakSet();
        this.restoreHandlers = [];
        this.mutationCb = options.mutationCb;
        this.scrollCb = options.scrollCb;
        this.bypassOptions = options.bypassOptions;
        this.mirror = options.mirror;
        this.init();
    }
    init() {
        this.reset();
        this.patchAttachShadow(Element, document);
    }
    addShadowRoot(shadowRoot, doc) {
        if (!isNativeShadowDom(shadowRoot))
            return;
        if (this.shadowDoms.has(shadowRoot))
            return;
        this.shadowDoms.add(shadowRoot);
        const observer = initMutationObserver(Object.assign(Object.assign({}, this.bypassOptions), { doc, mutationCb: this.mutationCb, mirror: this.mirror, shadowDomManager: this }), shadowRoot);
        this.restoreHandlers.push(() => observer.disconnect());
        this.restoreHandlers.push(initScrollObserver(Object.assign(Object.assign({}, this.bypassOptions), { scrollCb: this.scrollCb, doc: shadowRoot, mirror: this.mirror })));
        setTimeout(() => {
            if (shadowRoot.adoptedStyleSheets &&
                shadowRoot.adoptedStyleSheets.length > 0)
                this.bypassOptions.stylesheetManager.adoptStyleSheets(shadowRoot.adoptedStyleSheets, this.mirror.getId(shadowRoot.host));
            this.restoreHandlers.push(initAdoptedStyleSheetObserver({
                mirror: this.mirror,
                stylesheetManager: this.bypassOptions.stylesheetManager,
            }, shadowRoot));
        }, 0);
    }
    observeAttachShadow(iframeElement) {
        if (!iframeElement.contentWindow || !iframeElement.contentDocument)
            return;
        this.patchAttachShadow(iframeElement.contentWindow.Element, iframeElement.contentDocument);
    }
    patchAttachShadow(element, doc) {
        const manager = this;
        this.restoreHandlers.push(patch(element.prototype, 'attachShadow', function (original) {
            return function (option) {
                const shadowRoot = original.call(this, option);
                if (this.shadowRoot && inDom(this))
                    manager.addShadowRoot(this.shadowRoot, doc);
                return shadowRoot;
            };
        }));
    }
    reset() {
        this.restoreHandlers.forEach((handler) => {
            try {
                handler();
            }
            catch (e) {
            }
        });
        this.restoreHandlers = [];
        this.shadowDoms = new WeakSet();
    }
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
***************************************************************************** */

function __rest(s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
}

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

/*
 * base64-arraybuffer 1.0.1 <https://github.com/niklasvh/base64-arraybuffer>
 * Copyright (c) 2021 Niklas von Hertzen <https://hertzen.com>
 * Released under MIT License
 */
var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
// Use a lookup table to find the index.
var lookup = typeof Uint8Array === 'undefined' ? [] : new Uint8Array(256);
for (var i$2 = 0; i$2 < chars.length; i$2++) {
    lookup[chars.charCodeAt(i$2)] = i$2;
}
var encode = function (arraybuffer) {
    var bytes = new Uint8Array(arraybuffer), i, len = bytes.length, base64 = '';
    for (i = 0; i < len; i += 3) {
        base64 += chars[bytes[i] >> 2];
        base64 += chars[((bytes[i] & 3) << 4) | (bytes[i + 1] >> 4)];
        base64 += chars[((bytes[i + 1] & 15) << 2) | (bytes[i + 2] >> 6)];
        base64 += chars[bytes[i + 2] & 63];
    }
    if (len % 3 === 2) {
        base64 = base64.substring(0, base64.length - 1) + '=';
    }
    else if (len % 3 === 1) {
        base64 = base64.substring(0, base64.length - 2) + '==';
    }
    return base64;
};
var decode = function (base64) {
    var bufferLength = base64.length * 0.75, len = base64.length, i, p = 0, encoded1, encoded2, encoded3, encoded4;
    if (base64[base64.length - 1] === '=') {
        bufferLength--;
        if (base64[base64.length - 2] === '=') {
            bufferLength--;
        }
    }
    var arraybuffer = new ArrayBuffer(bufferLength), bytes = new Uint8Array(arraybuffer);
    for (i = 0; i < len; i += 4) {
        encoded1 = lookup[base64.charCodeAt(i)];
        encoded2 = lookup[base64.charCodeAt(i + 1)];
        encoded3 = lookup[base64.charCodeAt(i + 2)];
        encoded4 = lookup[base64.charCodeAt(i + 3)];
        bytes[p++] = (encoded1 << 2) | (encoded2 >> 4);
        bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
        bytes[p++] = ((encoded3 & 3) << 6) | (encoded4 & 63);
    }
    return arraybuffer;
};

const canvasVarMap = new Map();
function variableListFor$1(ctx, ctor) {
    let contextMap = canvasVarMap.get(ctx);
    if (!contextMap) {
        contextMap = new Map();
        canvasVarMap.set(ctx, contextMap);
    }
    if (!contextMap.has(ctor)) {
        contextMap.set(ctor, []);
    }
    return contextMap.get(ctor);
}
const saveWebGLVar = (value, win, ctx) => {
    if (!value ||
        !(isInstanceOfWebGLObject(value, win) || typeof value === 'object'))
        return;
    const name = value.constructor.name;
    const list = variableListFor$1(ctx, name);
    let index = list.indexOf(value);
    if (index === -1) {
        index = list.length;
        list.push(value);
    }
    return index;
};
function serializeArg(value, win, ctx) {
    if (value instanceof Array) {
        return value.map((arg) => serializeArg(arg, win, ctx));
    }
    else if (value === null) {
        return value;
    }
    else if (value instanceof Float32Array ||
        value instanceof Float64Array ||
        value instanceof Int32Array ||
        value instanceof Uint32Array ||
        value instanceof Uint8Array ||
        value instanceof Uint16Array ||
        value instanceof Int16Array ||
        value instanceof Int8Array ||
        value instanceof Uint8ClampedArray) {
        const name = value.constructor.name;
        return {
            rr_type: name,
            args: [Object.values(value)],
        };
    }
    else if (value instanceof ArrayBuffer) {
        const name = value.constructor.name;
        const base64 = encode(value);
        return {
            rr_type: name,
            base64,
        };
    }
    else if (value instanceof DataView) {
        const name = value.constructor.name;
        return {
            rr_type: name,
            args: [
                serializeArg(value.buffer, win, ctx),
                value.byteOffset,
                value.byteLength,
            ],
        };
    }
    else if (value instanceof HTMLImageElement) {
        const name = value.constructor.name;
        const { src } = value;
        return {
            rr_type: name,
            src,
        };
    }
    else if (value instanceof HTMLCanvasElement) {
        const name = 'HTMLImageElement';
        const src = value.toDataURL();
        return {
            rr_type: name,
            src,
        };
    }
    else if (value instanceof ImageData) {
        const name = value.constructor.name;
        return {
            rr_type: name,
            args: [serializeArg(value.data, win, ctx), value.width, value.height],
        };
    }
    else if (isInstanceOfWebGLObject(value, win) || typeof value === 'object') {
        const name = value.constructor.name;
        const index = saveWebGLVar(value, win, ctx);
        return {
            rr_type: name,
            index: index,
        };
    }
    return value;
}
const serializeArgs = (args, win, ctx) => {
    return args.map((arg) => serializeArg(arg, win, ctx));
};
const isInstanceOfWebGLObject = (value, win) => {
    const webGLConstructorNames = [
        'WebGLActiveInfo',
        'WebGLBuffer',
        'WebGLFramebuffer',
        'WebGLProgram',
        'WebGLRenderbuffer',
        'WebGLShader',
        'WebGLShaderPrecisionFormat',
        'WebGLTexture',
        'WebGLUniformLocation',
        'WebGLVertexArrayObject',
        'WebGLVertexArrayObjectOES',
    ];
    const supportedWebGLConstructorNames = webGLConstructorNames.filter((name) => typeof win[name] === 'function');
    return Boolean(supportedWebGLConstructorNames.find((name) => value instanceof win[name]));
};

function initCanvas2DMutationObserver(cb, win, blockClass, blockSelector) {
    const handlers = [];
    const props2D = Object.getOwnPropertyNames(win.CanvasRenderingContext2D.prototype);
    for (const prop of props2D) {
        try {
            if (typeof win.CanvasRenderingContext2D.prototype[prop] !== 'function') {
                continue;
            }
            const restoreHandler = patch(win.CanvasRenderingContext2D.prototype, prop, function (original) {
                return function (...args) {
                    if (!isBlocked(this.canvas, blockClass, blockSelector, true)) {
                        setTimeout(() => {
                            const recordArgs = serializeArgs(args, win, this);
                            cb(this.canvas, {
                                type: CanvasContext['2D'],
                                property: prop,
                                args: recordArgs,
                            });
                        }, 0);
                    }
                    return original.apply(this, args);
                };
            });
            handlers.push(restoreHandler);
        }
        catch (_a) {
            const hookHandler = hookSetter(win.CanvasRenderingContext2D.prototype, prop, {
                set(v) {
                    cb(this.canvas, {
                        type: CanvasContext['2D'],
                        property: prop,
                        args: [v],
                        setter: true,
                    });
                },
            });
            handlers.push(hookHandler);
        }
    }
    return () => {
        handlers.forEach((h) => h());
    };
}

function getNormalizedContextName(contextType) {
    return contextType === 'experimental-webgl' ? 'webgl' : contextType;
}
function initCanvasContextObserver(win, blockClass, blockSelector, setPreserveDrawingBufferToTrue) {
    const handlers = [];
    try {
        const restoreHandler = patch(win.HTMLCanvasElement.prototype, 'getContext', function (original) {
            return function (contextType, ...args) {
                if (!isBlocked(this, blockClass, blockSelector, true)) {
                    const ctxName = getNormalizedContextName(contextType);
                    if (!('__context' in this))
                        this.__context = ctxName;
                    if (setPreserveDrawingBufferToTrue &&
                        ['webgl', 'webgl2'].includes(ctxName)) {
                        if (args[0] && typeof args[0] === 'object') {
                            const contextAttributes = args[0];
                            if (!contextAttributes.preserveDrawingBuffer) {
                                contextAttributes.preserveDrawingBuffer = true;
                            }
                        }
                        else {
                            args.splice(0, 1, {
                                preserveDrawingBuffer: true,
                            });
                        }
                    }
                }
                return original.apply(this, [contextType, ...args]);
            };
        });
        handlers.push(restoreHandler);
    }
    catch (_a) {
        console.error('failed to patch HTMLCanvasElement.prototype.getContext');
    }
    return () => {
        handlers.forEach((h) => h());
    };
}

function patchGLPrototype(prototype, type, cb, blockClass, blockSelector, mirror, win) {
    const handlers = [];
    const props = Object.getOwnPropertyNames(prototype);
    for (const prop of props) {
        if ([
            'isContextLost',
            'canvas',
            'drawingBufferWidth',
            'drawingBufferHeight',
        ].includes(prop)) {
            continue;
        }
        try {
            if (typeof prototype[prop] !== 'function') {
                continue;
            }
            const restoreHandler = patch(prototype, prop, function (original) {
                return function (...args) {
                    const result = original.apply(this, args);
                    saveWebGLVar(result, win, this);
                    if ('tagName' in this.canvas &&
                        !isBlocked(this.canvas, blockClass, blockSelector, true)) {
                        const recordArgs = serializeArgs(args, win, this);
                        const mutation = {
                            type,
                            property: prop,
                            args: recordArgs,
                        };
                        cb(this.canvas, mutation);
                    }
                    return result;
                };
            });
            handlers.push(restoreHandler);
        }
        catch (_a) {
            const hookHandler = hookSetter(prototype, prop, {
                set(v) {
                    cb(this.canvas, {
                        type,
                        property: prop,
                        args: [v],
                        setter: true,
                    });
                },
            });
            handlers.push(hookHandler);
        }
    }
    return handlers;
}
function initCanvasWebGLMutationObserver(cb, win, blockClass, blockSelector, mirror) {
    const handlers = [];
    handlers.push(...patchGLPrototype(win.WebGLRenderingContext.prototype, CanvasContext.WebGL, cb, blockClass, blockSelector, mirror, win));
    if (typeof win.WebGL2RenderingContext !== 'undefined') {
        handlers.push(...patchGLPrototype(win.WebGL2RenderingContext.prototype, CanvasContext.WebGL2, cb, blockClass, blockSelector, mirror, win));
    }
    return () => {
        handlers.forEach((h) => h());
    };
}

function funcToSource(fn, sourcemapArg) {
    var sourcemap = sourcemapArg === undefined ? null : sourcemapArg;
    var source = fn.toString();
    var lines = source.split('\n');
    lines.pop();
    lines.shift();
    var blankPrefixLength = lines[0].search(/\S/);
    var regex = /(['"])__worker_loader_strict__(['"])/g;
    for (var i = 0, n = lines.length; i < n; ++i) {
        lines[i] = lines[i].substring(blankPrefixLength).replace(regex, '$1use strict$2') + '\n';
    }
    if (sourcemap) {
        lines.push('\/\/# sourceMappingURL=' + sourcemap + '\n');
    }
    return lines;
}

function createURL(fn, sourcemapArg) {
    var lines = funcToSource(fn, sourcemapArg);
    var blob = new Blob(lines, { type: 'application/javascript' });
    return URL.createObjectURL(blob);
}

function createInlineWorkerFactory(fn, sourcemapArg) {
    var url;
    return function WorkerFactory(options) {
        url = url || createURL(fn, sourcemapArg);
        return new Worker(url, options);
    };
}

var WorkerFactory = createInlineWorkerFactory(/* rollup-plugin-web-worker-loader */function () {
(function () {
    '__worker_loader_strict__';

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
    ***************************************************************************** */

    function __awaiter(thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }

    /*
     * base64-arraybuffer 1.0.1 <https://github.com/niklasvh/base64-arraybuffer>
     * Copyright (c) 2021 Niklas von Hertzen <https://hertzen.com>
     * Released under MIT License
     */
    var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    // Use a lookup table to find the index.
    var lookup = typeof Uint8Array === 'undefined' ? [] : new Uint8Array(256);
    for (var i = 0; i < chars.length; i++) {
        lookup[chars.charCodeAt(i)] = i;
    }
    var encode = function (arraybuffer) {
        var bytes = new Uint8Array(arraybuffer), i, len = bytes.length, base64 = '';
        for (i = 0; i < len; i += 3) {
            base64 += chars[bytes[i] >> 2];
            base64 += chars[((bytes[i] & 3) << 4) | (bytes[i + 1] >> 4)];
            base64 += chars[((bytes[i + 1] & 15) << 2) | (bytes[i + 2] >> 6)];
            base64 += chars[bytes[i + 2] & 63];
        }
        if (len % 3 === 2) {
            base64 = base64.substring(0, base64.length - 1) + '=';
        }
        else if (len % 3 === 1) {
            base64 = base64.substring(0, base64.length - 2) + '==';
        }
        return base64;
    };

    const lastBlobMap = new Map();
    const transparentBlobMap = new Map();
    function getTransparentBlobFor(width, height, dataURLOptions) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = `${width}-${height}`;
            if ('OffscreenCanvas' in globalThis) {
                if (transparentBlobMap.has(id))
                    return transparentBlobMap.get(id);
                const offscreen = new OffscreenCanvas(width, height);
                offscreen.getContext('2d');
                const blob = yield offscreen.convertToBlob(dataURLOptions);
                const arrayBuffer = yield blob.arrayBuffer();
                const base64 = encode(arrayBuffer);
                transparentBlobMap.set(id, base64);
                return base64;
            }
            else {
                return '';
            }
        });
    }
    const worker = self;
    worker.onmessage = function (e) {
        return __awaiter(this, void 0, void 0, function* () {
            if ('OffscreenCanvas' in globalThis) {
                const { id, bitmap, width, height, dataURLOptions } = e.data;
                const transparentBase64 = getTransparentBlobFor(width, height, dataURLOptions);
                const offscreen = new OffscreenCanvas(width, height);
                const ctx = offscreen.getContext('2d');
                ctx.drawImage(bitmap, 0, 0);
                bitmap.close();
                const blob = yield offscreen.convertToBlob(dataURLOptions);
                const type = blob.type;
                const arrayBuffer = yield blob.arrayBuffer();
                const base64 = encode(arrayBuffer);
                if (!lastBlobMap.has(id) && (yield transparentBase64) === base64) {
                    lastBlobMap.set(id, base64);
                    return worker.postMessage({ id });
                }
                if (lastBlobMap.get(id) === base64)
                    return worker.postMessage({ id });
                worker.postMessage({
                    id,
                    type,
                    base64,
                    width,
                    height,
                });
                lastBlobMap.set(id, base64);
            }
            else {
                return worker.postMessage({ id: e.data.id });
            }
        });
    };

})();
}, null);
/* eslint-enable */

class CanvasManager {
    reset() {
        this.pendingCanvasMutations.clear();
        this.resetObservers && this.resetObservers();
    }
    freeze() {
        this.frozen = true;
    }
    unfreeze() {
        this.frozen = false;
    }
    lock() {
        this.locked = true;
    }
    unlock() {
        this.locked = false;
    }
    constructor(options) {
        this.pendingCanvasMutations = new Map();
        this.rafStamps = { latestId: 0, invokeId: null };
        this.frozen = false;
        this.locked = false;
        this.processMutation = (target, mutation) => {
            const newFrame = this.rafStamps.invokeId &&
                this.rafStamps.latestId !== this.rafStamps.invokeId;
            if (newFrame || !this.rafStamps.invokeId)
                this.rafStamps.invokeId = this.rafStamps.latestId;
            if (!this.pendingCanvasMutations.has(target)) {
                this.pendingCanvasMutations.set(target, []);
            }
            this.pendingCanvasMutations.get(target).push(mutation);
        };
        const { sampling = 'all', win, blockClass, blockSelector, recordCanvas, dataURLOptions, } = options;
        this.mutationCb = options.mutationCb;
        this.mirror = options.mirror;
        if (recordCanvas && sampling === 'all')
            this.initCanvasMutationObserver(win, blockClass, blockSelector);
        if (recordCanvas && typeof sampling === 'number')
            this.initCanvasFPSObserver(sampling, win, blockClass, blockSelector, {
                dataURLOptions,
            });
    }
    initCanvasFPSObserver(fps, win, blockClass, blockSelector, options) {
        const canvasContextReset = initCanvasContextObserver(win, blockClass, blockSelector, true);
        const snapshotInProgressMap = new Map();
        const worker = new WorkerFactory();
        worker.onmessage = (e) => {
            const { id } = e.data;
            snapshotInProgressMap.set(id, false);
            if (!('base64' in e.data))
                return;
            const { base64, type, width, height } = e.data;
            this.mutationCb({
                id,
                type: CanvasContext['2D'],
                commands: [
                    {
                        property: 'clearRect',
                        args: [0, 0, width, height],
                    },
                    {
                        property: 'drawImage',
                        args: [
                            {
                                rr_type: 'ImageBitmap',
                                args: [
                                    {
                                        rr_type: 'Blob',
                                        data: [{ rr_type: 'ArrayBuffer', base64 }],
                                        type,
                                    },
                                ],
                            },
                            0,
                            0,
                        ],
                    },
                ],
            });
        };
        const timeBetweenSnapshots = 1000 / fps;
        let lastSnapshotTime = 0;
        let rafId;
        const getCanvas = () => {
            const matchedCanvas = [];
            win.document.querySelectorAll('canvas').forEach((canvas) => {
                if (!isBlocked(canvas, blockClass, blockSelector, true)) {
                    matchedCanvas.push(canvas);
                }
            });
            return matchedCanvas;
        };
        const takeCanvasSnapshots = (timestamp) => {
            if (lastSnapshotTime &&
                timestamp - lastSnapshotTime < timeBetweenSnapshots) {
                rafId = requestAnimationFrame(takeCanvasSnapshots);
                return;
            }
            lastSnapshotTime = timestamp;
            getCanvas()
                .forEach((canvas) => __awaiter(this, void 0, void 0, function* () {
                var _a;
                const id = this.mirror.getId(canvas);
                if (snapshotInProgressMap.get(id))
                    return;
                if (canvas.width === 0 || canvas.height === 0)
                    return;
                snapshotInProgressMap.set(id, true);
                if (['webgl', 'webgl2'].includes(canvas.__context)) {
                    const context = canvas.getContext(canvas.__context);
                    if (((_a = context === null || context === void 0 ? void 0 : context.getContextAttributes()) === null || _a === void 0 ? void 0 : _a.preserveDrawingBuffer) === false) {
                        context.clear(context.COLOR_BUFFER_BIT);
                    }
                }
                const bitmap = yield createImageBitmap(canvas);
                worker.postMessage({
                    id,
                    bitmap,
                    width: canvas.width,
                    height: canvas.height,
                    dataURLOptions: options.dataURLOptions,
                }, [bitmap]);
            }));
            rafId = requestAnimationFrame(takeCanvasSnapshots);
        };
        rafId = requestAnimationFrame(takeCanvasSnapshots);
        this.resetObservers = () => {
            canvasContextReset();
            cancelAnimationFrame(rafId);
        };
    }
    initCanvasMutationObserver(win, blockClass, blockSelector) {
        this.startRAFTimestamping();
        this.startPendingCanvasMutationFlusher();
        const canvasContextReset = initCanvasContextObserver(win, blockClass, blockSelector, false);
        const canvas2DReset = initCanvas2DMutationObserver(this.processMutation.bind(this), win, blockClass, blockSelector);
        const canvasWebGL1and2Reset = initCanvasWebGLMutationObserver(this.processMutation.bind(this), win, blockClass, blockSelector, this.mirror);
        this.resetObservers = () => {
            canvasContextReset();
            canvas2DReset();
            canvasWebGL1and2Reset();
        };
    }
    startPendingCanvasMutationFlusher() {
        requestAnimationFrame(() => this.flushPendingCanvasMutations());
    }
    startRAFTimestamping() {
        const setLatestRAFTimestamp = (timestamp) => {
            this.rafStamps.latestId = timestamp;
            requestAnimationFrame(setLatestRAFTimestamp);
        };
        requestAnimationFrame(setLatestRAFTimestamp);
    }
    flushPendingCanvasMutations() {
        this.pendingCanvasMutations.forEach((values, canvas) => {
            const id = this.mirror.getId(canvas);
            this.flushPendingCanvasMutationFor(canvas, id);
        });
        requestAnimationFrame(() => this.flushPendingCanvasMutations());
    }
    flushPendingCanvasMutationFor(canvas, id) {
        if (this.frozen || this.locked) {
            return;
        }
        const valuesWithType = this.pendingCanvasMutations.get(canvas);
        if (!valuesWithType || id === -1)
            return;
        const values = valuesWithType.map((value) => {
            const rest = __rest(value, ["type"]);
            return rest;
        });
        const { type } = valuesWithType[0];
        this.mutationCb({ id, type, commands: values });
        this.pendingCanvasMutations.delete(canvas);
    }
}

class StylesheetManager {
    constructor(options) {
        this.trackedLinkElements = new WeakSet();
        this.styleMirror = new StyleSheetMirror();
        this.mutationCb = options.mutationCb;
        this.adoptedStyleSheetCb = options.adoptedStyleSheetCb;
    }
    attachLinkElement(linkEl, childSn) {
        if ('_cssText' in childSn.attributes)
            this.mutationCb({
                adds: [],
                removes: [],
                texts: [],
                attributes: [
                    {
                        id: childSn.id,
                        attributes: childSn
                            .attributes,
                    },
                ],
            });
        this.trackLinkElement(linkEl);
    }
    trackLinkElement(linkEl) {
        if (this.trackedLinkElements.has(linkEl))
            return;
        this.trackedLinkElements.add(linkEl);
        this.trackStylesheetInLinkElement(linkEl);
    }
    adoptStyleSheets(sheets, hostId) {
        if (sheets.length === 0)
            return;
        const adoptedStyleSheetData = {
            id: hostId,
            styleIds: [],
        };
        const styles = [];
        for (const sheet of sheets) {
            let styleId;
            if (!this.styleMirror.has(sheet)) {
                styleId = this.styleMirror.add(sheet);
                styles.push({
                    styleId,
                    rules: Array.from(sheet.rules || CSSRule, (r, index) => ({
                        rule: stringifyRule(r),
                        index,
                    })),
                });
            }
            else
                styleId = this.styleMirror.getId(sheet);
            adoptedStyleSheetData.styleIds.push(styleId);
        }
        if (styles.length > 0)
            adoptedStyleSheetData.styles = styles;
        this.adoptedStyleSheetCb(adoptedStyleSheetData);
    }
    reset() {
        this.styleMirror.reset();
        this.trackedLinkElements = new WeakSet();
    }
    trackStylesheetInLinkElement(linkEl) {
    }
}

class ProcessedNodeManager {
    constructor() {
        this.nodeMap = new WeakMap();
        this.loop = true;
        this.periodicallyClear();
    }
    periodicallyClear() {
        requestAnimationFrame(() => {
            this.clear();
            if (this.loop)
                this.periodicallyClear();
        });
    }
    inOtherBuffer(node, thisBuffer) {
        const buffers = this.nodeMap.get(node);
        return (buffers && Array.from(buffers).some((buffer) => buffer !== thisBuffer));
    }
    add(node, buffer) {
        this.nodeMap.set(node, (this.nodeMap.get(node) || new Set()).add(buffer));
    }
    clear() {
        this.nodeMap = new WeakMap();
    }
    destroy() {
        this.loop = false;
    }
}

function wrapEvent(e) {
    return Object.assign(Object.assign({}, e), { timestamp: nowTimestamp() });
}
let wrappedEmit;
let takeFullSnapshot;
let canvasManager;
let recording = false;
const mirror = createMirror$2();
function record(options = {}) {
    const { emit, checkoutEveryNms, checkoutEveryNth, blockClass = 'rr-block', blockSelector = null, ignoreClass = 'rr-ignore', ignoreSelector = null, maskTextClass = 'rr-mask', maskTextSelector = null, inlineStylesheet = true, maskAllInputs, maskInputOptions: _maskInputOptions, slimDOMOptions: _slimDOMOptions, maskInputFn, maskTextFn, hooks, packFn, sampling = {}, dataURLOptions = {}, mousemoveWait, recordDOM = true, recordCanvas = false, recordCrossOriginIframes = false, recordAfter = options.recordAfter === 'DOMContentLoaded'
        ? options.recordAfter
        : 'load', userTriggeredOnInput = false, collectFonts = false, inlineImages = false, plugins, keepIframeSrcFn = () => false, ignoreCSSAttributes = new Set([]), errorHandler, } = options;
    registerErrorHandler(errorHandler);
    const inEmittingFrame = recordCrossOriginIframes
        ? window.parent === window
        : true;
    let passEmitsToParent = false;
    if (!inEmittingFrame) {
        try {
            if (window.parent.document) {
                passEmitsToParent = false;
            }
        }
        catch (e) {
            passEmitsToParent = true;
        }
    }
    if (inEmittingFrame && !emit) {
        throw new Error('emit function is required');
    }
    if (mousemoveWait !== undefined && sampling.mousemove === undefined) {
        sampling.mousemove = mousemoveWait;
    }
    mirror.reset();
    const maskInputOptions = maskAllInputs === true
        ? {
            color: true,
            date: true,
            'datetime-local': true,
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
        }
        : _maskInputOptions !== undefined
            ? _maskInputOptions
            : { password: true };
    const slimDOMOptions = _slimDOMOptions === true || _slimDOMOptions === 'all'
        ? {
            script: true,
            comment: true,
            headFavicon: true,
            headWhitespace: true,
            headMetaSocial: true,
            headMetaRobots: true,
            headMetaHttpEquiv: true,
            headMetaVerification: true,
            headMetaAuthorship: _slimDOMOptions === 'all',
            headMetaDescKeywords: _slimDOMOptions === 'all',
        }
        : _slimDOMOptions
            ? _slimDOMOptions
            : {};
    polyfill$1();
    let lastFullSnapshotEvent;
    let incrementalSnapshotCount = 0;
    const eventProcessor = (e) => {
        for (const plugin of plugins || []) {
            if (plugin.eventProcessor) {
                e = plugin.eventProcessor(e);
            }
        }
        if (packFn &&
            !passEmitsToParent) {
            e = packFn(e);
        }
        return e;
    };
    wrappedEmit = (e, isCheckout) => {
        var _a;
        if (((_a = mutationBuffers[0]) === null || _a === void 0 ? void 0 : _a.isFrozen()) &&
            e.type !== EventType.FullSnapshot &&
            !(e.type === EventType.IncrementalSnapshot &&
                e.data.source === IncrementalSource.Mutation)) {
            mutationBuffers.forEach((buf) => buf.unfreeze());
        }
        if (inEmittingFrame) {
            emit === null || emit === void 0 ? void 0 : emit(eventProcessor(e), isCheckout);
        }
        else if (passEmitsToParent) {
            const message = {
                type: 'rrweb',
                event: eventProcessor(e),
                origin: window.location.origin,
                isCheckout,
            };
            window.parent.postMessage(message, '*');
        }
        if (e.type === EventType.FullSnapshot) {
            lastFullSnapshotEvent = e;
            incrementalSnapshotCount = 0;
        }
        else if (e.type === EventType.IncrementalSnapshot) {
            if (e.data.source === IncrementalSource.Mutation &&
                e.data.isAttachIframe) {
                return;
            }
            incrementalSnapshotCount++;
            const exceedCount = checkoutEveryNth && incrementalSnapshotCount >= checkoutEveryNth;
            const exceedTime = checkoutEveryNms &&
                e.timestamp - lastFullSnapshotEvent.timestamp > checkoutEveryNms;
            if (exceedCount || exceedTime) {
                takeFullSnapshot(true);
            }
        }
    };
    const wrappedMutationEmit = (m) => {
        wrappedEmit(wrapEvent({
            type: EventType.IncrementalSnapshot,
            data: Object.assign({ source: IncrementalSource.Mutation }, m),
        }));
    };
    const wrappedScrollEmit = (p) => wrappedEmit(wrapEvent({
        type: EventType.IncrementalSnapshot,
        data: Object.assign({ source: IncrementalSource.Scroll }, p),
    }));
    const wrappedCanvasMutationEmit = (p) => wrappedEmit(wrapEvent({
        type: EventType.IncrementalSnapshot,
        data: Object.assign({ source: IncrementalSource.CanvasMutation }, p),
    }));
    const wrappedAdoptedStyleSheetEmit = (a) => wrappedEmit(wrapEvent({
        type: EventType.IncrementalSnapshot,
        data: Object.assign({ source: IncrementalSource.AdoptedStyleSheet }, a),
    }));
    const stylesheetManager = new StylesheetManager({
        mutationCb: wrappedMutationEmit,
        adoptedStyleSheetCb: wrappedAdoptedStyleSheetEmit,
    });
    const iframeManager = new IframeManager({
        mirror,
        mutationCb: wrappedMutationEmit,
        stylesheetManager: stylesheetManager,
        recordCrossOriginIframes,
        wrappedEmit,
    });
    for (const plugin of plugins || []) {
        if (plugin.getMirror)
            plugin.getMirror({
                nodeMirror: mirror,
                crossOriginIframeMirror: iframeManager.crossOriginIframeMirror,
                crossOriginIframeStyleMirror: iframeManager.crossOriginIframeStyleMirror,
            });
    }
    const processedNodeManager = new ProcessedNodeManager();
    canvasManager = new CanvasManager({
        recordCanvas,
        mutationCb: wrappedCanvasMutationEmit,
        win: window,
        blockClass,
        blockSelector,
        mirror,
        sampling: sampling.canvas,
        dataURLOptions,
    });
    const shadowDomManager = new ShadowDomManager({
        mutationCb: wrappedMutationEmit,
        scrollCb: wrappedScrollEmit,
        bypassOptions: {
            blockClass,
            blockSelector,
            maskTextClass,
            maskTextSelector,
            inlineStylesheet,
            maskInputOptions,
            dataURLOptions,
            maskTextFn,
            maskInputFn,
            recordCanvas,
            inlineImages,
            sampling,
            slimDOMOptions,
            iframeManager,
            stylesheetManager,
            canvasManager,
            keepIframeSrcFn,
            processedNodeManager,
        },
        mirror,
    });
    takeFullSnapshot = (isCheckout = false) => {
        if (!recordDOM) {
            return;
        }
        wrappedEmit(wrapEvent({
            type: EventType.Meta,
            data: {
                href: window.location.href,
                width: getWindowWidth(),
                height: getWindowHeight(),
            },
        }), isCheckout);
        stylesheetManager.reset();
        shadowDomManager.init();
        mutationBuffers.forEach((buf) => buf.lock());
        const node = snapshot(document, {
            mirror,
            blockClass,
            blockSelector,
            maskTextClass,
            maskTextSelector,
            inlineStylesheet,
            maskAllInputs: maskInputOptions,
            maskTextFn,
            slimDOM: slimDOMOptions,
            dataURLOptions,
            recordCanvas,
            inlineImages,
            onSerialize: (n) => {
                if (isSerializedIframe(n, mirror)) {
                    iframeManager.addIframe(n);
                }
                if (isSerializedStylesheet(n, mirror)) {
                    stylesheetManager.trackLinkElement(n);
                }
                if (hasShadowRoot(n)) {
                    shadowDomManager.addShadowRoot(n.shadowRoot, document);
                }
            },
            onIframeLoad: (iframe, childSn) => {
                iframeManager.attachIframe(iframe, childSn);
                shadowDomManager.observeAttachShadow(iframe);
            },
            onStylesheetLoad: (linkEl, childSn) => {
                stylesheetManager.attachLinkElement(linkEl, childSn);
            },
            keepIframeSrcFn,
        });
        if (!node) {
            return console.warn('Failed to snapshot the document');
        }
        wrappedEmit(wrapEvent({
            type: EventType.FullSnapshot,
            data: {
                node,
                initialOffset: getWindowScroll(window),
            },
        }), isCheckout);
        mutationBuffers.forEach((buf) => buf.unlock());
        if (document.adoptedStyleSheets && document.adoptedStyleSheets.length > 0)
            stylesheetManager.adoptStyleSheets(document.adoptedStyleSheets, mirror.getId(document));
    };
    try {
        const handlers = [];
        const observe = (doc) => {
            var _a;
            return callbackWrapper(initObservers)({
                mutationCb: wrappedMutationEmit,
                mousemoveCb: (positions, source) => wrappedEmit(wrapEvent({
                    type: EventType.IncrementalSnapshot,
                    data: {
                        source,
                        positions,
                    },
                })),
                mouseInteractionCb: (d) => wrappedEmit(wrapEvent({
                    type: EventType.IncrementalSnapshot,
                    data: Object.assign({ source: IncrementalSource.MouseInteraction }, d),
                })),
                scrollCb: wrappedScrollEmit,
                viewportResizeCb: (d) => wrappedEmit(wrapEvent({
                    type: EventType.IncrementalSnapshot,
                    data: Object.assign({ source: IncrementalSource.ViewportResize }, d),
                })),
                inputCb: (v) => wrappedEmit(wrapEvent({
                    type: EventType.IncrementalSnapshot,
                    data: Object.assign({ source: IncrementalSource.Input }, v),
                })),
                mediaInteractionCb: (p) => wrappedEmit(wrapEvent({
                    type: EventType.IncrementalSnapshot,
                    data: Object.assign({ source: IncrementalSource.MediaInteraction }, p),
                })),
                styleSheetRuleCb: (r) => wrappedEmit(wrapEvent({
                    type: EventType.IncrementalSnapshot,
                    data: Object.assign({ source: IncrementalSource.StyleSheetRule }, r),
                })),
                styleDeclarationCb: (r) => wrappedEmit(wrapEvent({
                    type: EventType.IncrementalSnapshot,
                    data: Object.assign({ source: IncrementalSource.StyleDeclaration }, r),
                })),
                canvasMutationCb: wrappedCanvasMutationEmit,
                fontCb: (p) => wrappedEmit(wrapEvent({
                    type: EventType.IncrementalSnapshot,
                    data: Object.assign({ source: IncrementalSource.Font }, p),
                })),
                selectionCb: (p) => {
                    wrappedEmit(wrapEvent({
                        type: EventType.IncrementalSnapshot,
                        data: Object.assign({ source: IncrementalSource.Selection }, p),
                    }));
                },
                customElementCb: (c) => {
                    wrappedEmit(wrapEvent({
                        type: EventType.IncrementalSnapshot,
                        data: Object.assign({ source: IncrementalSource.CustomElement }, c),
                    }));
                },
                blockClass,
                ignoreClass,
                ignoreSelector,
                maskTextClass,
                maskTextSelector,
                maskInputOptions,
                inlineStylesheet,
                sampling,
                recordDOM,
                recordCanvas,
                inlineImages,
                userTriggeredOnInput,
                collectFonts,
                doc,
                maskInputFn,
                maskTextFn,
                keepIframeSrcFn,
                blockSelector,
                slimDOMOptions,
                dataURLOptions,
                mirror,
                iframeManager,
                stylesheetManager,
                shadowDomManager,
                processedNodeManager,
                canvasManager,
                ignoreCSSAttributes,
                plugins: ((_a = plugins === null || plugins === void 0 ? void 0 : plugins.filter((p) => p.observer)) === null || _a === void 0 ? void 0 : _a.map((p) => ({
                    observer: p.observer,
                    options: p.options,
                    callback: (payload) => wrappedEmit(wrapEvent({
                        type: EventType.Plugin,
                        data: {
                            plugin: p.name,
                            payload,
                        },
                    })),
                }))) || [],
            }, hooks);
        };
        iframeManager.addLoadListener((iframeEl) => {
            try {
                handlers.push(observe(iframeEl.contentDocument));
            }
            catch (error) {
                console.warn(error);
            }
        });
        const init = () => {
            takeFullSnapshot();
            handlers.push(observe(document));
            recording = true;
        };
        if (document.readyState === 'interactive' ||
            document.readyState === 'complete') {
            init();
        }
        else {
            handlers.push(on('DOMContentLoaded', () => {
                wrappedEmit(wrapEvent({
                    type: EventType.DomContentLoaded,
                    data: {},
                }));
                if (recordAfter === 'DOMContentLoaded')
                    init();
            }));
            handlers.push(on('load', () => {
                wrappedEmit(wrapEvent({
                    type: EventType.Load,
                    data: {},
                }));
                if (recordAfter === 'load')
                    init();
            }, window));
        }
        return () => {
            handlers.forEach((h) => h());
            processedNodeManager.destroy();
            recording = false;
            unregisterErrorHandler();
        };
    }
    catch (error) {
        console.warn(error);
    }
}
record.addCustomEvent = (tag, payload) => {
    if (!recording) {
        throw new Error('please add custom event after start recording');
    }
    wrappedEmit(wrapEvent({
        type: EventType.Custom,
        data: {
            tag,
            payload,
        },
    }));
};
record.freezePage = () => {
    mutationBuffers.forEach((buf) => buf.freeze());
};
record.takeFullSnapshot = (isCheckout) => {
    if (!recording) {
        throw new Error('please take full snapshot after start recording');
    }
    takeFullSnapshot(isCheckout);
};
record.mirror = mirror;

var NodeType$1;
(function (NodeType) {
    NodeType[NodeType["Document"] = 0] = "Document";
    NodeType[NodeType["DocumentType"] = 1] = "DocumentType";
    NodeType[NodeType["Element"] = 2] = "Element";
    NodeType[NodeType["Text"] = 3] = "Text";
    NodeType[NodeType["CDATA"] = 4] = "CDATA";
    NodeType[NodeType["Comment"] = 5] = "Comment";
})(NodeType$1 || (NodeType$1 = {}));
class Mirror$1 {
    constructor() {
        this.idNodeMap = new Map();
        this.nodeMetaMap = new WeakMap();
    }
    getId(n) {
        var _a;
        if (!n)
            return -1;
        const id = (_a = this.getMeta(n)) === null || _a === void 0 ? void 0 : _a.id;
        return id !== null && id !== void 0 ? id : -1;
    }
    getNode(id) {
        return this.idNodeMap.get(id) || null;
    }
    getIds() {
        return Array.from(this.idNodeMap.keys());
    }
    getMeta(n) {
        return this.nodeMetaMap.get(n) || null;
    }
    removeNodeFromMap(n) {
        const id = this.getId(n);
        this.idNodeMap.delete(id);
        if (n.childNodes) {
            n.childNodes.forEach((childNode) => this.removeNodeFromMap(childNode));
        }
    }
    has(id) {
        return this.idNodeMap.has(id);
    }
    hasNode(node) {
        return this.nodeMetaMap.has(node);
    }
    add(n, meta) {
        const id = meta.id;
        this.idNodeMap.set(id, n);
        this.nodeMetaMap.set(n, meta);
    }
    replace(id, n) {
        const oldNode = this.getNode(id);
        if (oldNode) {
            const meta = this.nodeMetaMap.get(oldNode);
            if (meta)
                this.nodeMetaMap.set(n, meta);
        }
        this.idNodeMap.set(id, n);
    }
    reset() {
        this.idNodeMap = new Map();
        this.nodeMetaMap = new WeakMap();
    }
}
function createMirror$1() {
    return new Mirror$1();
}

function parseCSSText(cssText) {
    const res = {};
    const listDelimiter = /;(?![^(]*\))/g;
    const propertyDelimiter = /:(.+)/;
    const comment = /\/\*.*?\*\//g;
    cssText
        .replace(comment, '')
        .split(listDelimiter)
        .forEach(function (item) {
        if (item) {
            const tmp = item.split(propertyDelimiter);
            tmp.length > 1 && (res[camelize(tmp[0].trim())] = tmp[1].trim());
        }
    });
    return res;
}
function toCSSText(style) {
    const properties = [];
    for (const name in style) {
        const value = style[name];
        if (typeof value !== 'string')
            continue;
        const normalizedName = hyphenate(name);
        properties.push(`${normalizedName}: ${value};`);
    }
    return properties.join(' ');
}
const camelizeRE = /-([a-z])/g;
const CUSTOM_PROPERTY_REGEX = /^--[a-zA-Z0-9-]+$/;
const camelize = (str) => {
    if (CUSTOM_PROPERTY_REGEX.test(str))
        return str;
    return str.replace(camelizeRE, (_, c) => (c ? c.toUpperCase() : ''));
};
const hyphenateRE = /\B([A-Z])/g;
const hyphenate = (str) => {
    return str.replace(hyphenateRE, '-$1').toLowerCase();
};

class BaseRRNode {
    constructor(..._args) {
        this.parentElement = null;
        this.parentNode = null;
        this.firstChild = null;
        this.lastChild = null;
        this.previousSibling = null;
        this.nextSibling = null;
        this.ELEMENT_NODE = NodeType.ELEMENT_NODE;
        this.TEXT_NODE = NodeType.TEXT_NODE;
    }
    get childNodes() {
        const childNodes = [];
        let childIterator = this.firstChild;
        while (childIterator) {
            childNodes.push(childIterator);
            childIterator = childIterator.nextSibling;
        }
        return childNodes;
    }
    contains(node) {
        if (!(node instanceof BaseRRNode))
            return false;
        else if (node.ownerDocument !== this.ownerDocument)
            return false;
        else if (node === this)
            return true;
        while (node.parentNode) {
            if (node.parentNode === this)
                return true;
            node = node.parentNode;
        }
        return false;
    }
    appendChild(_newChild) {
        throw new Error(`RRDomException: Failed to execute 'appendChild' on 'RRNode': This RRNode type does not support this method.`);
    }
    insertBefore(_newChild, _refChild) {
        throw new Error(`RRDomException: Failed to execute 'insertBefore' on 'RRNode': This RRNode type does not support this method.`);
    }
    removeChild(_node) {
        throw new Error(`RRDomException: Failed to execute 'removeChild' on 'RRNode': This RRNode type does not support this method.`);
    }
    toString() {
        return 'RRNode';
    }
}
function BaseRRDocumentImpl(RRNodeClass) {
    return class BaseRRDocument extends RRNodeClass {
        constructor(...args) {
            super(args);
            this.nodeType = NodeType.DOCUMENT_NODE;
            this.nodeName = '#document';
            this.compatMode = 'CSS1Compat';
            this.RRNodeType = NodeType$1.Document;
            this.textContent = null;
            this.ownerDocument = this;
        }
        get documentElement() {
            return (this.childNodes.find((node) => node.RRNodeType === NodeType$1.Element &&
                node.tagName === 'HTML') || null);
        }
        get body() {
            var _a;
            return (((_a = this.documentElement) === null || _a === void 0 ? void 0 : _a.childNodes.find((node) => node.RRNodeType === NodeType$1.Element &&
                node.tagName === 'BODY')) || null);
        }
        get head() {
            var _a;
            return (((_a = this.documentElement) === null || _a === void 0 ? void 0 : _a.childNodes.find((node) => node.RRNodeType === NodeType$1.Element &&
                node.tagName === 'HEAD')) || null);
        }
        get implementation() {
            return this;
        }
        get firstElementChild() {
            return this.documentElement;
        }
        appendChild(newChild) {
            const nodeType = newChild.RRNodeType;
            if (nodeType === NodeType$1.Element ||
                nodeType === NodeType$1.DocumentType) {
                if (this.childNodes.some((s) => s.RRNodeType === nodeType)) {
                    throw new Error(`RRDomException: Failed to execute 'appendChild' on 'RRNode': Only one ${nodeType === NodeType$1.Element ? 'RRElement' : 'RRDoctype'} on RRDocument allowed.`);
                }
            }
            const child = appendChild(this, newChild);
            child.parentElement = null;
            return child;
        }
        insertBefore(newChild, refChild) {
            const nodeType = newChild.RRNodeType;
            if (nodeType === NodeType$1.Element ||
                nodeType === NodeType$1.DocumentType) {
                if (this.childNodes.some((s) => s.RRNodeType === nodeType)) {
                    throw new Error(`RRDomException: Failed to execute 'insertBefore' on 'RRNode': Only one ${nodeType === NodeType$1.Element ? 'RRElement' : 'RRDoctype'} on RRDocument allowed.`);
                }
            }
            const child = insertBefore(this, newChild, refChild);
            child.parentElement = null;
            return child;
        }
        removeChild(node) {
            return removeChild(this, node);
        }
        open() {
            this.firstChild = null;
            this.lastChild = null;
        }
        close() {
        }
        write(content) {
            let publicId;
            if (content ===
                '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "">')
                publicId = '-//W3C//DTD XHTML 1.0 Transitional//EN';
            else if (content ===
                '<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN" "">')
                publicId = '-//W3C//DTD HTML 4.0 Transitional//EN';
            if (publicId) {
                const doctype = this.createDocumentType('html', publicId, '');
                this.open();
                this.appendChild(doctype);
            }
        }
        createDocument(_namespace, _qualifiedName, _doctype) {
            return new BaseRRDocument();
        }
        createDocumentType(qualifiedName, publicId, systemId) {
            const doctype = new (BaseRRDocumentTypeImpl(BaseRRNode))(qualifiedName, publicId, systemId);
            doctype.ownerDocument = this;
            return doctype;
        }
        createElement(tagName) {
            const element = new (BaseRRElementImpl(BaseRRNode))(tagName);
            element.ownerDocument = this;
            return element;
        }
        createElementNS(_namespaceURI, qualifiedName) {
            return this.createElement(qualifiedName);
        }
        createTextNode(data) {
            const text = new (BaseRRTextImpl(BaseRRNode))(data);
            text.ownerDocument = this;
            return text;
        }
        createComment(data) {
            const comment = new (BaseRRCommentImpl(BaseRRNode))(data);
            comment.ownerDocument = this;
            return comment;
        }
        createCDATASection(data) {
            const CDATASection = new (BaseRRCDATASectionImpl(BaseRRNode))(data);
            CDATASection.ownerDocument = this;
            return CDATASection;
        }
        toString() {
            return 'RRDocument';
        }
    };
}
function BaseRRDocumentTypeImpl(RRNodeClass) {
    return class BaseRRDocumentType extends RRNodeClass {
        constructor(qualifiedName, publicId, systemId) {
            super();
            this.nodeType = NodeType.DOCUMENT_TYPE_NODE;
            this.RRNodeType = NodeType$1.DocumentType;
            this.name = qualifiedName;
            this.publicId = publicId;
            this.systemId = systemId;
            this.nodeName = qualifiedName;
            this.textContent = null;
        }
        toString() {
            return 'RRDocumentType';
        }
    };
}
function BaseRRElementImpl(RRNodeClass) {
    return class BaseRRElement extends RRNodeClass {
        constructor(tagName) {
            super();
            this.nodeType = NodeType.ELEMENT_NODE;
            this.RRNodeType = NodeType$1.Element;
            this.attributes = {};
            this.shadowRoot = null;
            this.tagName = tagName.toUpperCase();
            this.nodeName = tagName.toUpperCase();
        }
        get textContent() {
            let result = '';
            this.childNodes.forEach((node) => (result += node.textContent));
            return result;
        }
        set textContent(textContent) {
            this.firstChild = null;
            this.lastChild = null;
            this.appendChild(this.ownerDocument.createTextNode(textContent));
        }
        get classList() {
            return new ClassList(this.attributes.class, (newClassName) => {
                this.attributes.class = newClassName;
            });
        }
        get id() {
            return this.attributes.id || '';
        }
        get className() {
            return this.attributes.class || '';
        }
        get style() {
            const style = (this.attributes.style ? parseCSSText(this.attributes.style) : {});
            const hyphenateRE = /\B([A-Z])/g;
            style.setProperty = (name, value, priority) => {
                if (hyphenateRE.test(name))
                    return;
                const normalizedName = camelize(name);
                if (!value)
                    delete style[normalizedName];
                else
                    style[normalizedName] = value;
                if (priority === 'important')
                    style[normalizedName] += ' !important';
                this.attributes.style = toCSSText(style);
            };
            style.removeProperty = (name) => {
                if (hyphenateRE.test(name))
                    return '';
                const normalizedName = camelize(name);
                const value = style[normalizedName] || '';
                delete style[normalizedName];
                this.attributes.style = toCSSText(style);
                return value;
            };
            return style;
        }
        getAttribute(name) {
            return this.attributes[name] || null;
        }
        setAttribute(name, attribute) {
            this.attributes[name] = attribute;
        }
        setAttributeNS(_namespace, qualifiedName, value) {
            this.setAttribute(qualifiedName, value);
        }
        removeAttribute(name) {
            delete this.attributes[name];
        }
        appendChild(newChild) {
            return appendChild(this, newChild);
        }
        insertBefore(newChild, refChild) {
            return insertBefore(this, newChild, refChild);
        }
        removeChild(node) {
            return removeChild(this, node);
        }
        attachShadow(_init) {
            const shadowRoot = this.ownerDocument.createElement('SHADOWROOT');
            this.shadowRoot = shadowRoot;
            return shadowRoot;
        }
        dispatchEvent(_event) {
            return true;
        }
        toString() {
            let attributeString = '';
            for (const attribute in this.attributes) {
                attributeString += `${attribute}="${this.attributes[attribute]}" `;
            }
            return `${this.tagName} ${attributeString}`;
        }
    };
}
function BaseRRMediaElementImpl(RRElementClass) {
    return class BaseRRMediaElement extends RRElementClass {
        attachShadow(_init) {
            throw new Error(`RRDomException: Failed to execute 'attachShadow' on 'RRElement': This RRElement does not support attachShadow`);
        }
        play() {
            this.paused = false;
        }
        pause() {
            this.paused = true;
        }
    };
}
function BaseRRTextImpl(RRNodeClass) {
    return class BaseRRText extends RRNodeClass {
        constructor(data) {
            super();
            this.nodeType = NodeType.TEXT_NODE;
            this.nodeName = '#text';
            this.RRNodeType = NodeType$1.Text;
            this.data = data;
        }
        get textContent() {
            return this.data;
        }
        set textContent(textContent) {
            this.data = textContent;
        }
        toString() {
            return `RRText text=${JSON.stringify(this.data)}`;
        }
    };
}
function BaseRRCommentImpl(RRNodeClass) {
    return class BaseRRComment extends RRNodeClass {
        constructor(data) {
            super();
            this.nodeType = NodeType.COMMENT_NODE;
            this.nodeName = '#comment';
            this.RRNodeType = NodeType$1.Comment;
            this.data = data;
        }
        get textContent() {
            return this.data;
        }
        set textContent(textContent) {
            this.data = textContent;
        }
        toString() {
            return `RRComment text=${JSON.stringify(this.data)}`;
        }
    };
}
function BaseRRCDATASectionImpl(RRNodeClass) {
    return class BaseRRCDATASection extends RRNodeClass {
        constructor(data) {
            super();
            this.nodeName = '#cdata-section';
            this.nodeType = NodeType.CDATA_SECTION_NODE;
            this.RRNodeType = NodeType$1.CDATA;
            this.data = data;
        }
        get textContent() {
            return this.data;
        }
        set textContent(textContent) {
            this.data = textContent;
        }
        toString() {
            return `RRCDATASection data=${JSON.stringify(this.data)}`;
        }
    };
}
class ClassList {
    constructor(classText, onChange) {
        this.classes = [];
        this.add = (...classNames) => {
            for (const item of classNames) {
                const className = String(item);
                if (this.classes.indexOf(className) >= 0)
                    continue;
                this.classes.push(className);
            }
            this.onChange && this.onChange(this.classes.join(' '));
        };
        this.remove = (...classNames) => {
            this.classes = this.classes.filter((item) => classNames.indexOf(item) === -1);
            this.onChange && this.onChange(this.classes.join(' '));
        };
        if (classText) {
            const classes = classText.trim().split(/\s+/);
            this.classes.push(...classes);
        }
        this.onChange = onChange;
    }
}
function appendChild(parent, newChild) {
    if (newChild.parentNode)
        newChild.parentNode.removeChild(newChild);
    if (parent.lastChild) {
        parent.lastChild.nextSibling = newChild;
        newChild.previousSibling = parent.lastChild;
    }
    else {
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
    if (!refChild)
        return appendChild(parent, newChild);
    if (refChild.parentNode !== parent)
        throw new Error("Failed to execute 'insertBefore' on 'RRNode': The RRNode before which the new node is to be inserted is not a child of this RRNode.");
    if (newChild === refChild)
        return newChild;
    if (newChild.parentNode)
        newChild.parentNode.removeChild(newChild);
    newChild.previousSibling = refChild.previousSibling;
    refChild.previousSibling = newChild;
    newChild.nextSibling = refChild;
    if (newChild.previousSibling)
        newChild.previousSibling.nextSibling = newChild;
    else
        parent.firstChild = newChild;
    newChild.parentElement = parent;
    newChild.parentNode = parent;
    newChild.ownerDocument = parent.ownerDocument;
    return newChild;
}
function removeChild(parent, child) {
    if (child.parentNode !== parent)
        throw new Error("Failed to execute 'removeChild' on 'RRNode': The RRNode to be removed is not a child of this RRNode.");
    if (child.previousSibling)
        child.previousSibling.nextSibling = child.nextSibling;
    else
        parent.firstChild = child.nextSibling;
    if (child.nextSibling)
        child.nextSibling.previousSibling = child.previousSibling;
    else
        parent.lastChild = child.previousSibling;
    child.previousSibling = null;
    child.nextSibling = null;
    child.parentElement = null;
    child.parentNode = null;
    return child;
}
var NodeType;
(function (NodeType) {
    NodeType[NodeType["PLACEHOLDER"] = 0] = "PLACEHOLDER";
    NodeType[NodeType["ELEMENT_NODE"] = 1] = "ELEMENT_NODE";
    NodeType[NodeType["ATTRIBUTE_NODE"] = 2] = "ATTRIBUTE_NODE";
    NodeType[NodeType["TEXT_NODE"] = 3] = "TEXT_NODE";
    NodeType[NodeType["CDATA_SECTION_NODE"] = 4] = "CDATA_SECTION_NODE";
    NodeType[NodeType["ENTITY_REFERENCE_NODE"] = 5] = "ENTITY_REFERENCE_NODE";
    NodeType[NodeType["ENTITY_NODE"] = 6] = "ENTITY_NODE";
    NodeType[NodeType["PROCESSING_INSTRUCTION_NODE"] = 7] = "PROCESSING_INSTRUCTION_NODE";
    NodeType[NodeType["COMMENT_NODE"] = 8] = "COMMENT_NODE";
    NodeType[NodeType["DOCUMENT_NODE"] = 9] = "DOCUMENT_NODE";
    NodeType[NodeType["DOCUMENT_TYPE_NODE"] = 10] = "DOCUMENT_TYPE_NODE";
    NodeType[NodeType["DOCUMENT_FRAGMENT_NODE"] = 11] = "DOCUMENT_FRAGMENT_NODE";
})(NodeType || (NodeType = {}));

const NAMESPACES = {
    svg: 'http://www.w3.org/2000/svg',
    'xlink:href': 'http://www.w3.org/1999/xlink',
    xmlns: 'http://www.w3.org/2000/xmlns/',
};
const SVGTagMap = {
    altglyph: 'altGlyph',
    altglyphdef: 'altGlyphDef',
    altglyphitem: 'altGlyphItem',
    animatecolor: 'animateColor',
    animatemotion: 'animateMotion',
    animatetransform: 'animateTransform',
    clippath: 'clipPath',
    feblend: 'feBlend',
    fecolormatrix: 'feColorMatrix',
    fecomponenttransfer: 'feComponentTransfer',
    fecomposite: 'feComposite',
    feconvolvematrix: 'feConvolveMatrix',
    fediffuselighting: 'feDiffuseLighting',
    fedisplacementmap: 'feDisplacementMap',
    fedistantlight: 'feDistantLight',
    fedropshadow: 'feDropShadow',
    feflood: 'feFlood',
    fefunca: 'feFuncA',
    fefuncb: 'feFuncB',
    fefuncg: 'feFuncG',
    fefuncr: 'feFuncR',
    fegaussianblur: 'feGaussianBlur',
    feimage: 'feImage',
    femerge: 'feMerge',
    femergenode: 'feMergeNode',
    femorphology: 'feMorphology',
    feoffset: 'feOffset',
    fepointlight: 'fePointLight',
    fespecularlighting: 'feSpecularLighting',
    fespotlight: 'feSpotLight',
    fetile: 'feTile',
    feturbulence: 'feTurbulence',
    foreignobject: 'foreignObject',
    glyphref: 'glyphRef',
    lineargradient: 'linearGradient',
    radialgradient: 'radialGradient',
};
let createdNodeSet = null;
function diff(oldTree, newTree, replayer, rrnodeMirror = newTree.mirror ||
    newTree.ownerDocument.mirror) {
    oldTree = diffBeforeUpdatingChildren(oldTree, newTree, replayer, rrnodeMirror);
    diffChildren(oldTree, newTree, replayer, rrnodeMirror);
    diffAfterUpdatingChildren(oldTree, newTree, replayer);
}
function diffBeforeUpdatingChildren(oldTree, newTree, replayer, rrnodeMirror) {
    var _a;
    if (replayer.afterAppend && !createdNodeSet) {
        createdNodeSet = new WeakSet();
        setTimeout(() => {
            createdNodeSet = null;
        }, 0);
    }
    if (!sameNodeType(oldTree, newTree)) {
        const calibratedOldTree = createOrGetNode(newTree, replayer.mirror, rrnodeMirror);
        (_a = oldTree.parentNode) === null || _a === void 0 ? void 0 : _a.replaceChild(calibratedOldTree, oldTree);
        oldTree = calibratedOldTree;
    }
    switch (newTree.RRNodeType) {
        case NodeType$1.Document: {
            if (!nodeMatching(oldTree, newTree, replayer.mirror, rrnodeMirror)) {
                const newMeta = rrnodeMirror.getMeta(newTree);
                if (newMeta) {
                    replayer.mirror.removeNodeFromMap(oldTree);
                    oldTree.close();
                    oldTree.open();
                    replayer.mirror.add(oldTree, newMeta);
                    createdNodeSet === null || createdNodeSet === void 0 ? void 0 : createdNodeSet.add(oldTree);
                }
            }
            break;
        }
        case NodeType$1.Element: {
            const oldElement = oldTree;
            const newRRElement = newTree;
            switch (newRRElement.tagName) {
                case 'IFRAME': {
                    const oldContentDocument = oldTree
                        .contentDocument;
                    if (!oldContentDocument)
                        break;
                    diff(oldContentDocument, newTree.contentDocument, replayer, rrnodeMirror);
                    break;
                }
            }
            if (newRRElement.shadowRoot) {
                if (!oldElement.shadowRoot)
                    oldElement.attachShadow({ mode: 'open' });
                diffChildren(oldElement.shadowRoot, newRRElement.shadowRoot, replayer, rrnodeMirror);
            }
            diffProps(oldElement, newRRElement, rrnodeMirror);
            break;
        }
    }
    return oldTree;
}
function diffAfterUpdatingChildren(oldTree, newTree, replayer) {
    var _a;
    switch (newTree.RRNodeType) {
        case NodeType$1.Document: {
            const scrollData = newTree.scrollData;
            scrollData && replayer.applyScroll(scrollData, true);
            break;
        }
        case NodeType$1.Element: {
            const oldElement = oldTree;
            const newRRElement = newTree;
            newRRElement.scrollData &&
                replayer.applyScroll(newRRElement.scrollData, true);
            newRRElement.inputData && replayer.applyInput(newRRElement.inputData);
            switch (newRRElement.tagName) {
                case 'AUDIO':
                case 'VIDEO': {
                    const oldMediaElement = oldTree;
                    const newMediaRRElement = newRRElement;
                    if (newMediaRRElement.paused !== undefined)
                        newMediaRRElement.paused
                            ? void oldMediaElement.pause()
                            : void oldMediaElement.play();
                    if (newMediaRRElement.muted !== undefined)
                        oldMediaElement.muted = newMediaRRElement.muted;
                    if (newMediaRRElement.volume !== undefined)
                        oldMediaElement.volume = newMediaRRElement.volume;
                    if (newMediaRRElement.currentTime !== undefined)
                        oldMediaElement.currentTime = newMediaRRElement.currentTime;
                    if (newMediaRRElement.playbackRate !== undefined)
                        oldMediaElement.playbackRate = newMediaRRElement.playbackRate;
                    if (newMediaRRElement.loop !== undefined)
                        oldMediaElement.loop = newMediaRRElement.loop;
                    break;
                }
                case 'CANVAS': {
                    const rrCanvasElement = newTree;
                    if (rrCanvasElement.rr_dataURL !== null) {
                        const image = document.createElement('img');
                        image.onload = () => {
                            const ctx = oldElement.getContext('2d');
                            if (ctx) {
                                ctx.drawImage(image, 0, 0, image.width, image.height);
                            }
                        };
                        image.src = rrCanvasElement.rr_dataURL;
                    }
                    rrCanvasElement.canvasMutations.forEach((canvasMutation) => replayer.applyCanvas(canvasMutation.event, canvasMutation.mutation, oldTree));
                    break;
                }
                case 'STYLE': {
                    const styleSheet = oldElement.sheet;
                    styleSheet &&
                        newTree.rules.forEach((data) => replayer.applyStyleSheetMutation(data, styleSheet));
                    break;
                }
            }
            break;
        }
        case NodeType$1.Text:
        case NodeType$1.Comment:
        case NodeType$1.CDATA: {
            if (oldTree.textContent !==
                newTree.data)
                oldTree.textContent = newTree.data;
            break;
        }
    }
    if (createdNodeSet === null || createdNodeSet === void 0 ? void 0 : createdNodeSet.has(oldTree)) {
        createdNodeSet.delete(oldTree);
        (_a = replayer.afterAppend) === null || _a === void 0 ? void 0 : _a.call(replayer, oldTree, replayer.mirror.getId(oldTree));
    }
}
function diffProps(oldTree, newTree, rrnodeMirror) {
    const oldAttributes = oldTree.attributes;
    const newAttributes = newTree.attributes;
    for (const name in newAttributes) {
        const newValue = newAttributes[name];
        const sn = rrnodeMirror.getMeta(newTree);
        if ((sn === null || sn === void 0 ? void 0 : sn.isSVG) && NAMESPACES[name])
            oldTree.setAttributeNS(NAMESPACES[name], name, newValue);
        else if (newTree.tagName === 'CANVAS' && name === 'rr_dataURL') {
            const image = document.createElement('img');
            image.src = newValue;
            image.onload = () => {
                const ctx = oldTree.getContext('2d');
                if (ctx) {
                    ctx.drawImage(image, 0, 0, image.width, image.height);
                }
            };
        }
        else if (newTree.tagName === 'IFRAME' && name === 'srcdoc')
            continue;
        else
            oldTree.setAttribute(name, newValue);
    }
    for (const { name } of Array.from(oldAttributes))
        if (!(name in newAttributes))
            oldTree.removeAttribute(name);
    newTree.scrollLeft && (oldTree.scrollLeft = newTree.scrollLeft);
    newTree.scrollTop && (oldTree.scrollTop = newTree.scrollTop);
}
function diffChildren(oldTree, newTree, replayer, rrnodeMirror) {
    const oldChildren = Array.from(oldTree.childNodes);
    const newChildren = newTree.childNodes;
    if (oldChildren.length === 0 && newChildren.length === 0)
        return;
    let oldStartIndex = 0, oldEndIndex = oldChildren.length - 1, newStartIndex = 0, newEndIndex = newChildren.length - 1;
    let oldStartNode = oldChildren[oldStartIndex], oldEndNode = oldChildren[oldEndIndex], newStartNode = newChildren[newStartIndex], newEndNode = newChildren[newEndIndex];
    let oldIdToIndex = undefined, indexInOld = undefined;
    while (oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {
        if (oldStartNode === undefined) {
            oldStartNode = oldChildren[++oldStartIndex];
        }
        else if (oldEndNode === undefined) {
            oldEndNode = oldChildren[--oldEndIndex];
        }
        else if (nodeMatching(oldStartNode, newStartNode, replayer.mirror, rrnodeMirror)) {
            oldStartNode = oldChildren[++oldStartIndex];
            newStartNode = newChildren[++newStartIndex];
        }
        else if (nodeMatching(oldEndNode, newEndNode, replayer.mirror, rrnodeMirror)) {
            oldEndNode = oldChildren[--oldEndIndex];
            newEndNode = newChildren[--newEndIndex];
        }
        else if (nodeMatching(oldStartNode, newEndNode, replayer.mirror, rrnodeMirror)) {
            try {
                oldTree.insertBefore(oldStartNode, oldEndNode.nextSibling);
            }
            catch (e) {
                console.warn(e);
            }
            oldStartNode = oldChildren[++oldStartIndex];
            newEndNode = newChildren[--newEndIndex];
        }
        else if (nodeMatching(oldEndNode, newStartNode, replayer.mirror, rrnodeMirror)) {
            try {
                oldTree.insertBefore(oldEndNode, oldStartNode);
            }
            catch (e) {
                console.warn(e);
            }
            oldEndNode = oldChildren[--oldEndIndex];
            newStartNode = newChildren[++newStartIndex];
        }
        else {
            if (!oldIdToIndex) {
                oldIdToIndex = {};
                for (let i = oldStartIndex; i <= oldEndIndex; i++) {
                    const oldChild = oldChildren[i];
                    if (oldChild && replayer.mirror.hasNode(oldChild))
                        oldIdToIndex[replayer.mirror.getId(oldChild)] = i;
                }
            }
            indexInOld = oldIdToIndex[rrnodeMirror.getId(newStartNode)];
            const nodeToMove = oldChildren[indexInOld];
            if (indexInOld !== undefined &&
                nodeToMove &&
                nodeMatching(nodeToMove, newStartNode, replayer.mirror, rrnodeMirror)) {
                try {
                    oldTree.insertBefore(nodeToMove, oldStartNode);
                }
                catch (e) {
                    console.warn(e);
                }
                oldChildren[indexInOld] = undefined;
            }
            else {
                const newNode = createOrGetNode(newStartNode, replayer.mirror, rrnodeMirror);
                if (oldTree.nodeName === '#document' &&
                    oldStartNode &&
                    ((newNode.nodeType === newNode.DOCUMENT_TYPE_NODE &&
                        oldStartNode.nodeType === oldStartNode.DOCUMENT_TYPE_NODE) ||
                        (newNode.nodeType === newNode.ELEMENT_NODE &&
                            oldStartNode.nodeType === oldStartNode.ELEMENT_NODE))) {
                    oldTree.removeChild(oldStartNode);
                    replayer.mirror.removeNodeFromMap(oldStartNode);
                    oldStartNode = oldChildren[++oldStartIndex];
                }
                try {
                    oldTree.insertBefore(newNode, oldStartNode || null);
                }
                catch (e) {
                    console.warn(e);
                }
            }
            newStartNode = newChildren[++newStartIndex];
        }
    }
    if (oldStartIndex > oldEndIndex) {
        const referenceRRNode = newChildren[newEndIndex + 1];
        let referenceNode = null;
        if (referenceRRNode)
            referenceNode = replayer.mirror.getNode(rrnodeMirror.getId(referenceRRNode));
        for (; newStartIndex <= newEndIndex; ++newStartIndex) {
            const newNode = createOrGetNode(newChildren[newStartIndex], replayer.mirror, rrnodeMirror);
            try {
                oldTree.insertBefore(newNode, referenceNode);
            }
            catch (e) {
                console.warn(e);
            }
        }
    }
    else if (newStartIndex > newEndIndex) {
        for (; oldStartIndex <= oldEndIndex; oldStartIndex++) {
            const node = oldChildren[oldStartIndex];
            if (!node || node.parentNode !== oldTree)
                continue;
            try {
                oldTree.removeChild(node);
                replayer.mirror.removeNodeFromMap(node);
            }
            catch (e) {
                console.warn(e);
            }
        }
    }
    let oldChild = oldTree.firstChild;
    let newChild = newTree.firstChild;
    while (oldChild !== null && newChild !== null) {
        diff(oldChild, newChild, replayer, rrnodeMirror);
        oldChild = oldChild.nextSibling;
        newChild = newChild.nextSibling;
    }
}
function createOrGetNode(rrNode, domMirror, rrnodeMirror) {
    const nodeId = rrnodeMirror.getId(rrNode);
    const sn = rrnodeMirror.getMeta(rrNode);
    let node = null;
    if (nodeId > -1)
        node = domMirror.getNode(nodeId);
    if (node !== null && sameNodeType(node, rrNode))
        return node;
    switch (rrNode.RRNodeType) {
        case NodeType$1.Document:
            node = new Document();
            break;
        case NodeType$1.DocumentType:
            node = document.implementation.createDocumentType(rrNode.name, rrNode.publicId, rrNode.systemId);
            break;
        case NodeType$1.Element: {
            let tagName = rrNode.tagName.toLowerCase();
            tagName = SVGTagMap[tagName] || tagName;
            if (sn && 'isSVG' in sn && (sn === null || sn === void 0 ? void 0 : sn.isSVG)) {
                node = document.createElementNS(NAMESPACES['svg'], tagName);
            }
            else
                node = document.createElement(rrNode.tagName);
            break;
        }
        case NodeType$1.Text:
            node = document.createTextNode(rrNode.data);
            break;
        case NodeType$1.Comment:
            node = document.createComment(rrNode.data);
            break;
        case NodeType$1.CDATA:
            node = document.createCDATASection(rrNode.data);
            break;
    }
    if (sn)
        domMirror.add(node, Object.assign({}, sn));
    try {
        createdNodeSet === null || createdNodeSet === void 0 ? void 0 : createdNodeSet.add(node);
    }
    catch (e) {
    }
    return node;
}
function sameNodeType(node1, node2) {
    if (node1.nodeType !== node2.nodeType)
        return false;
    return (node1.nodeType !== node1.ELEMENT_NODE ||
        node1.tagName.toUpperCase() ===
            node2.tagName);
}
function nodeMatching(node1, node2, domMirror, rrdomMirror) {
    const node1Id = domMirror.getId(node1);
    const node2Id = rrdomMirror.getId(node2);
    if (node1Id === -1 || node1Id !== node2Id)
        return false;
    return sameNodeType(node1, node2);
}

class RRDocument extends BaseRRDocumentImpl(BaseRRNode) {
    get unserializedId() {
        return this._unserializedId--;
    }
    constructor(mirror) {
        super();
        this.UNSERIALIZED_STARTING_ID = -2;
        this._unserializedId = this.UNSERIALIZED_STARTING_ID;
        this.mirror = createMirror();
        this.scrollData = null;
        if (mirror) {
            this.mirror = mirror;
        }
    }
    createDocument(_namespace, _qualifiedName, _doctype) {
        return new RRDocument();
    }
    createDocumentType(qualifiedName, publicId, systemId) {
        const documentTypeNode = new RRDocumentType(qualifiedName, publicId, systemId);
        documentTypeNode.ownerDocument = this;
        return documentTypeNode;
    }
    createElement(tagName) {
        const upperTagName = tagName.toUpperCase();
        let element;
        switch (upperTagName) {
            case 'AUDIO':
            case 'VIDEO':
                element = new RRMediaElement(upperTagName);
                break;
            case 'IFRAME':
                element = new RRIFrameElement(upperTagName, this.mirror);
                break;
            case 'CANVAS':
                element = new RRCanvasElement(upperTagName);
                break;
            case 'STYLE':
                element = new RRStyleElement(upperTagName);
                break;
            default:
                element = new RRElement(upperTagName);
                break;
        }
        element.ownerDocument = this;
        return element;
    }
    createComment(data) {
        const commentNode = new RRComment(data);
        commentNode.ownerDocument = this;
        return commentNode;
    }
    createCDATASection(data) {
        const sectionNode = new RRCDATASection(data);
        sectionNode.ownerDocument = this;
        return sectionNode;
    }
    createTextNode(data) {
        const textNode = new RRText(data);
        textNode.ownerDocument = this;
        return textNode;
    }
    destroyTree() {
        this.firstChild = null;
        this.lastChild = null;
        this.mirror.reset();
    }
    open() {
        super.open();
        this._unserializedId = this.UNSERIALIZED_STARTING_ID;
    }
}
const RRDocumentType = BaseRRDocumentTypeImpl(BaseRRNode);
class RRElement extends BaseRRElementImpl(BaseRRNode) {
    constructor() {
        super(...arguments);
        this.inputData = null;
        this.scrollData = null;
    }
}
class RRMediaElement extends BaseRRMediaElementImpl(RRElement) {
}
class RRCanvasElement extends RRElement {
    constructor() {
        super(...arguments);
        this.rr_dataURL = null;
        this.canvasMutations = [];
    }
    getContext() {
        return null;
    }
}
class RRStyleElement extends RRElement {
    constructor() {
        super(...arguments);
        this.rules = [];
    }
}
class RRIFrameElement extends RRElement {
    constructor(upperTagName, mirror) {
        super(upperTagName);
        this.contentDocument = new RRDocument();
        this.contentDocument.mirror = mirror;
    }
}
const RRText = BaseRRTextImpl(BaseRRNode);
const RRComment = BaseRRCommentImpl(BaseRRNode);
const RRCDATASection = BaseRRCDATASectionImpl(BaseRRNode);
function getValidTagName(element) {
    if (element instanceof HTMLFormElement) {
        return 'FORM';
    }
    return element.tagName.toUpperCase();
}
function buildFromNode(node, rrdom, domMirror, parentRRNode) {
    let rrNode;
    switch (node.nodeType) {
        case NodeType.DOCUMENT_NODE:
            if (parentRRNode && parentRRNode.nodeName === 'IFRAME')
                rrNode = parentRRNode.contentDocument;
            else {
                rrNode = rrdom;
                rrNode.compatMode = node.compatMode;
            }
            break;
        case NodeType.DOCUMENT_TYPE_NODE: {
            const documentType = node;
            rrNode = rrdom.createDocumentType(documentType.name, documentType.publicId, documentType.systemId);
            break;
        }
        case NodeType.ELEMENT_NODE: {
            const elementNode = node;
            const tagName = getValidTagName(elementNode);
            rrNode = rrdom.createElement(tagName);
            const rrElement = rrNode;
            for (const { name, value } of Array.from(elementNode.attributes)) {
                rrElement.attributes[name] = value;
            }
            elementNode.scrollLeft && (rrElement.scrollLeft = elementNode.scrollLeft);
            elementNode.scrollTop && (rrElement.scrollTop = elementNode.scrollTop);
            break;
        }
        case NodeType.TEXT_NODE:
            rrNode = rrdom.createTextNode(node.textContent || '');
            break;
        case NodeType.CDATA_SECTION_NODE:
            rrNode = rrdom.createCDATASection(node.data);
            break;
        case NodeType.COMMENT_NODE:
            rrNode = rrdom.createComment(node.textContent || '');
            break;
        case NodeType.DOCUMENT_FRAGMENT_NODE:
            rrNode = parentRRNode.attachShadow({ mode: 'open' });
            break;
        default:
            return null;
    }
    let sn = domMirror.getMeta(node);
    if (rrdom instanceof RRDocument) {
        if (!sn) {
            sn = getDefaultSN(rrNode, rrdom.unserializedId);
            domMirror.add(node, sn);
        }
        rrdom.mirror.add(rrNode, Object.assign({}, sn));
    }
    return rrNode;
}
function buildFromDom(dom, domMirror = createMirror$1(), rrdom = new RRDocument()) {
    function walk(node, parentRRNode) {
        const rrNode = buildFromNode(node, rrdom, domMirror, parentRRNode);
        if (rrNode === null)
            return;
        if ((parentRRNode === null || parentRRNode === void 0 ? void 0 : parentRRNode.nodeName) !== 'IFRAME' &&
            node.nodeType !== NodeType.DOCUMENT_FRAGMENT_NODE) {
            parentRRNode === null || parentRRNode === void 0 ? void 0 : parentRRNode.appendChild(rrNode);
            rrNode.parentNode = parentRRNode;
            rrNode.parentElement = parentRRNode;
        }
        if (node.nodeName === 'IFRAME') {
            const iframeDoc = node.contentDocument;
            iframeDoc && walk(iframeDoc, rrNode);
        }
        else if (node.nodeType === NodeType.DOCUMENT_NODE ||
            node.nodeType === NodeType.ELEMENT_NODE ||
            node.nodeType === NodeType.DOCUMENT_FRAGMENT_NODE) {
            if (node.nodeType === NodeType.ELEMENT_NODE &&
                node.shadowRoot)
                walk(node.shadowRoot, rrNode);
            node.childNodes.forEach((childNode) => walk(childNode, rrNode));
        }
    }
    walk(dom, null);
    return rrdom;
}
function createMirror() {
    return new Mirror();
}
class Mirror {
    constructor() {
        this.idNodeMap = new Map();
        this.nodeMetaMap = new WeakMap();
    }
    getId(n) {
        var _a;
        if (!n)
            return -1;
        const id = (_a = this.getMeta(n)) === null || _a === void 0 ? void 0 : _a.id;
        return id !== null && id !== void 0 ? id : -1;
    }
    getNode(id) {
        return this.idNodeMap.get(id) || null;
    }
    getIds() {
        return Array.from(this.idNodeMap.keys());
    }
    getMeta(n) {
        return this.nodeMetaMap.get(n) || null;
    }
    removeNodeFromMap(n) {
        const id = this.getId(n);
        this.idNodeMap.delete(id);
        if (n.childNodes) {
            n.childNodes.forEach((childNode) => this.removeNodeFromMap(childNode));
        }
    }
    has(id) {
        return this.idNodeMap.has(id);
    }
    hasNode(node) {
        return this.nodeMetaMap.has(node);
    }
    add(n, meta) {
        const id = meta.id;
        this.idNodeMap.set(id, n);
        this.nodeMetaMap.set(n, meta);
    }
    replace(id, n) {
        const oldNode = this.getNode(id);
        if (oldNode) {
            const meta = this.nodeMetaMap.get(oldNode);
            if (meta)
                this.nodeMetaMap.set(n, meta);
        }
        this.idNodeMap.set(id, n);
    }
    reset() {
        this.idNodeMap = new Map();
        this.nodeMetaMap = new WeakMap();
    }
}
function getDefaultSN(node, id) {
    switch (node.RRNodeType) {
        case NodeType$1.Document:
            return {
                id,
                type: node.RRNodeType,
                childNodes: [],
            };
        case NodeType$1.DocumentType: {
            const doctype = node;
            return {
                id,
                type: node.RRNodeType,
                name: doctype.name,
                publicId: doctype.publicId,
                systemId: doctype.systemId,
            };
        }
        case NodeType$1.Element:
            return {
                id,
                type: node.RRNodeType,
                tagName: node.tagName.toLowerCase(),
                attributes: {},
                childNodes: [],
            };
        case NodeType$1.Text:
            return {
                id,
                type: node.RRNodeType,
                textContent: node.textContent || '',
            };
        case NodeType$1.Comment:
            return {
                id,
                type: node.RRNodeType,
                textContent: node.textContent || '',
            };
        case NodeType$1.CDATA:
            return {
                id,
                type: node.RRNodeType,
                textContent: '',
            };
    }
}

function mitt$1(n){return {all:n=n||new Map,on:function(t,e){var i=n.get(t);i?i.push(e):n.set(t,[e]);},off:function(t,e){var i=n.get(t);i&&(e?i.splice(i.indexOf(e)>>>0,1):n.set(t,[]));},emit:function(t,e){var i=n.get(t);i&&i.slice().map(function(n){n(e);}),(i=n.get("*"))&&i.slice().map(function(n){n(t,e);});}}}

var mittProxy = /*#__PURE__*/Object.freeze({
    __proto__: null,
    'default': mitt$1
});

function polyfill(w = window, d = document) {
    if ('scrollBehavior' in d.documentElement.style &&
        w.__forceSmoothScrollPolyfill__ !== true) {
        return;
    }
    const Element = w.HTMLElement || w.Element;
    const SCROLL_TIME = 468;
    const original = {
        scroll: w.scroll || w.scrollTo,
        scrollBy: w.scrollBy,
        elementScroll: Element.prototype.scroll || scrollElement,
        scrollIntoView: Element.prototype.scrollIntoView,
    };
    const now = w.performance && w.performance.now
        ? w.performance.now.bind(w.performance)
        : Date.now;
    function isMicrosoftBrowser(userAgent) {
        const userAgentPatterns = ['MSIE ', 'Trident/', 'Edge/'];
        return new RegExp(userAgentPatterns.join('|')).test(userAgent);
    }
    const ROUNDING_TOLERANCE = isMicrosoftBrowser(w.navigator.userAgent) ? 1 : 0;
    function scrollElement(x, y) {
        this.scrollLeft = x;
        this.scrollTop = y;
    }
    function ease(k) {
        return 0.5 * (1 - Math.cos(Math.PI * k));
    }
    function shouldBailOut(firstArg) {
        if (firstArg === null ||
            typeof firstArg !== 'object' ||
            firstArg.behavior === undefined ||
            firstArg.behavior === 'auto' ||
            firstArg.behavior === 'instant') {
            return true;
        }
        if (typeof firstArg === 'object' && firstArg.behavior === 'smooth') {
            return false;
        }
        throw new TypeError('behavior member of ScrollOptions ' +
            firstArg.behavior +
            ' is not a valid value for enumeration ScrollBehavior.');
    }
    function hasScrollableSpace(el, axis) {
        if (axis === 'Y') {
            return el.clientHeight + ROUNDING_TOLERANCE < el.scrollHeight;
        }
        if (axis === 'X') {
            return el.clientWidth + ROUNDING_TOLERANCE < el.scrollWidth;
        }
    }
    function canOverflow(el, axis) {
        const overflowValue = w.getComputedStyle(el, null)['overflow' + axis];
        return overflowValue === 'auto' || overflowValue === 'scroll';
    }
    function isScrollable(el) {
        const isScrollableY = hasScrollableSpace(el, 'Y') && canOverflow(el, 'Y');
        const isScrollableX = hasScrollableSpace(el, 'X') && canOverflow(el, 'X');
        return isScrollableY || isScrollableX;
    }
    function findScrollableParent(el) {
        while (el !== d.body && isScrollable(el) === false) {
            el = el.parentNode || el.host;
        }
        return el;
    }
    function step(context) {
        const time = now();
        let value;
        let currentX;
        let currentY;
        let elapsed = (time - context.startTime) / SCROLL_TIME;
        elapsed = elapsed > 1 ? 1 : elapsed;
        value = ease(elapsed);
        currentX = context.startX + (context.x - context.startX) * value;
        currentY = context.startY + (context.y - context.startY) * value;
        context.method.call(context.scrollable, currentX, currentY);
        if (currentX !== context.x || currentY !== context.y) {
            w.requestAnimationFrame(step.bind(w, context));
        }
    }
    function smoothScroll(el, x, y) {
        let scrollable;
        let startX;
        let startY;
        let method;
        const startTime = now();
        if (el === d.body) {
            scrollable = w;
            startX = w.scrollX || w.pageXOffset;
            startY = w.scrollY || w.pageYOffset;
            method = original.scroll;
        }
        else {
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
            x: x,
            y: y,
        });
    }
    w.scroll = w.scrollTo = function () {
        if (arguments[0] === undefined) {
            return;
        }
        if (shouldBailOut(arguments[0]) === true) {
            original.scroll.call(w, arguments[0].left !== undefined
                ? arguments[0].left
                : typeof arguments[0] !== 'object'
                    ? arguments[0]
                    : w.scrollX || w.pageXOffset, arguments[0].top !== undefined
                ? arguments[0].top
                : arguments[1] !== undefined
                    ? arguments[1]
                    : w.scrollY || w.pageYOffset);
            return;
        }
        smoothScroll.call(w, d.body, arguments[0].left !== undefined
            ? ~~arguments[0].left
            : w.scrollX || w.pageXOffset, arguments[0].top !== undefined
            ? ~~arguments[0].top
            : w.scrollY || w.pageYOffset);
    };
    w.scrollBy = function () {
        if (arguments[0] === undefined) {
            return;
        }
        if (shouldBailOut(arguments[0])) {
            original.scrollBy.call(w, arguments[0].left !== undefined
                ? arguments[0].left
                : typeof arguments[0] !== 'object'
                    ? arguments[0]
                    : 0, arguments[0].top !== undefined
                ? arguments[0].top
                : arguments[1] !== undefined
                    ? arguments[1]
                    : 0);
            return;
        }
        smoothScroll.call(w, d.body, ~~arguments[0].left + (w.scrollX || w.pageXOffset), ~~arguments[0].top + (w.scrollY || w.pageYOffset));
    };
    Element.prototype.scroll = Element.prototype.scrollTo = function () {
        if (arguments[0] === undefined) {
            return;
        }
        if (shouldBailOut(arguments[0]) === true) {
            if (typeof arguments[0] === 'number' && arguments[1] === undefined) {
                throw new SyntaxError('Value could not be converted');
            }
            original.elementScroll.call(this, arguments[0].left !== undefined
                ? ~~arguments[0].left
                : typeof arguments[0] !== 'object'
                    ? ~~arguments[0]
                    : this.scrollLeft, arguments[0].top !== undefined
                ? ~~arguments[0].top
                : arguments[1] !== undefined
                    ? ~~arguments[1]
                    : this.scrollTop);
            return;
        }
        const left = arguments[0].left;
        const top = arguments[0].top;
        smoothScroll.call(this, this, typeof left === 'undefined' ? this.scrollLeft : ~~left, typeof top === 'undefined' ? this.scrollTop : ~~top);
    };
    Element.prototype.scrollBy = function () {
        if (arguments[0] === undefined) {
            return;
        }
        if (shouldBailOut(arguments[0]) === true) {
            original.elementScroll.call(this, arguments[0].left !== undefined
                ? ~~arguments[0].left + this.scrollLeft
                : ~~arguments[0] + this.scrollLeft, arguments[0].top !== undefined
                ? ~~arguments[0].top + this.scrollTop
                : ~~arguments[1] + this.scrollTop);
            return;
        }
        this.scroll({
            left: ~~arguments[0].left + this.scrollLeft,
            top: ~~arguments[0].top + this.scrollTop,
            behavior: arguments[0].behavior,
        });
    };
    Element.prototype.scrollIntoView = function () {
        if (shouldBailOut(arguments[0]) === true) {
            original.scrollIntoView.call(this, arguments[0] === undefined ? true : arguments[0]);
            return;
        }
        const scrollableParent = findScrollableParent(this);
        const parentRects = scrollableParent.getBoundingClientRect();
        const clientRects = this.getBoundingClientRect();
        if (scrollableParent !== d.body) {
            smoothScroll.call(this, scrollableParent, scrollableParent.scrollLeft + clientRects.left - parentRects.left, scrollableParent.scrollTop + clientRects.top - parentRects.top);
            if (w.getComputedStyle(scrollableParent).position !== 'fixed') {
                w.scrollBy({
                    left: parentRects.left,
                    top: parentRects.top,
                    behavior: 'smooth',
                });
            }
        }
        else {
            w.scrollBy({
                left: clientRects.left,
                top: clientRects.top,
                behavior: 'smooth',
            });
        }
    };
}

class Timer {
    constructor(actions = [], config) {
        this.timeOffset = 0;
        this.raf = null;
        this.actions = actions;
        this.speed = config.speed;
    }
    addAction(action) {
        const rafWasActive = this.raf === true;
        if (!this.actions.length ||
            this.actions[this.actions.length - 1].delay <= action.delay) {
            this.actions.push(action);
        }
        else {
            const index = this.findActionIndex(action);
            this.actions.splice(index, 0, action);
        }
        if (rafWasActive) {
            this.raf = requestAnimationFrame(this.rafCheck.bind(this));
        }
    }
    start() {
        this.timeOffset = 0;
        this.lastTimestamp = performance.now();
        this.raf = requestAnimationFrame(this.rafCheck.bind(this));
    }
    rafCheck() {
        const time = performance.now();
        this.timeOffset += (time - this.lastTimestamp) * this.speed;
        this.lastTimestamp = time;
        while (this.actions.length) {
            const action = this.actions[0];
            if (this.timeOffset >= action.delay) {
                this.actions.shift();
                action.doAction();
            }
            else {
                break;
            }
        }
        if (this.actions.length > 0) {
            this.raf = requestAnimationFrame(this.rafCheck.bind(this));
        }
        else {
            this.raf = true;
        }
    }
    clear() {
        if (this.raf) {
            if (this.raf !== true) {
                cancelAnimationFrame(this.raf);
            }
            this.raf = null;
        }
        this.actions.length = 0;
    }
    setSpeed(speed) {
        this.speed = speed;
    }
    isActive() {
        return this.raf !== null;
    }
    findActionIndex(action) {
        let start = 0;
        let end = this.actions.length - 1;
        while (start <= end) {
            const mid = Math.floor((start + end) / 2);
            if (this.actions[mid].delay < action.delay) {
                start = mid + 1;
            }
            else if (this.actions[mid].delay > action.delay) {
                end = mid - 1;
            }
            else {
                return mid + 1;
            }
        }
        return start;
    }
}
function addDelay(event, baselineTime) {
    if (event.type === EventType.IncrementalSnapshot &&
        event.data.source === IncrementalSource.MouseMove &&
        event.data.positions &&
        event.data.positions.length) {
        const firstOffset = event.data.positions[0].timeOffset;
        const firstTimestamp = event.timestamp + firstOffset;
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
***************************************************************************** */
function t(t,n){var e="function"==typeof Symbol&&t[Symbol.iterator];if(!e)return t;var r,o,i=e.call(t),a=[];try{for(;(void 0===n||n-- >0)&&!(r=i.next()).done;)a.push(r.value);}catch(t){o={error:t};}finally{try{r&&!r.done&&(e=i.return)&&e.call(i);}finally{if(o)throw o.error}}return a}var n;!function(t){t[t.NotStarted=0]="NotStarted",t[t.Running=1]="Running",t[t.Stopped=2]="Stopped";}(n||(n={}));var e={type:"xstate.init"};function r(t){return void 0===t?[]:[].concat(t)}function o(t){return {type:"xstate.assign",assignment:t}}function i$1(t,n){return "string"==typeof(t="string"==typeof t&&n&&n[t]?n[t]:t)?{type:t}:"function"==typeof t?{type:t.name,exec:t}:t}function a(t){return function(n){return t===n}}function u(t){return "string"==typeof t?{type:t}:t}function c(t,n){return {value:t,context:n,actions:[],changed:!1,matches:a(t)}}function f(t,n,e){var r=n,o=!1;return [t.filter((function(t){if("xstate.assign"===t.type){o=!0;var n=Object.assign({},r);return "function"==typeof t.assignment?n=t.assignment(r,e):Object.keys(t.assignment).forEach((function(o){n[o]="function"==typeof t.assignment[o]?t.assignment[o](r,e):t.assignment[o];})),r=n,!1}return !0})),r,o]}function s(n,o){void 0===o&&(o={});var s=t(f(r(n.states[n.initial].entry).map((function(t){return i$1(t,o.actions)})),n.context,e),2),l=s[0],v=s[1],y={config:n,_options:o,initialState:{value:n.initial,actions:l,context:v,matches:a(n.initial)},transition:function(e,o){var s,l,v="string"==typeof e?{value:e,context:n.context}:e,p=v.value,g=v.context,d=u(o),x=n.states[p];if(x.on){var m=r(x.on[d.type]);try{for(var h=function(t){var n="function"==typeof Symbol&&Symbol.iterator,e=n&&t[n],r=0;if(e)return e.call(t);if(t&&"number"==typeof t.length)return {next:function(){return t&&r>=t.length&&(t=void 0),{value:t&&t[r++],done:!t}}};throw new TypeError(n?"Object is not iterable.":"Symbol.iterator is not defined.")}(m),b=h.next();!b.done;b=h.next()){var S=b.value;if(void 0===S)return c(p,g);var w="string"==typeof S?{target:S}:S,j=w.target,E=w.actions,R=void 0===E?[]:E,N=w.cond,O=void 0===N?function(){return !0}:N,_=void 0===j,k=null!=j?j:p,T=n.states[k];if(O(g,d)){var q=t(f((_?r(R):[].concat(x.exit,R,T.entry).filter((function(t){return t}))).map((function(t){return i$1(t,y._options.actions)})),g,d),3),z=q[0],A=q[1],B=q[2],C=null!=j?j:p;return {value:C,context:A,actions:z,changed:j!==p||z.length>0||B,matches:a(C)}}}}catch(t){s={error:t};}finally{try{b&&!b.done&&(l=h.return)&&l.call(h);}finally{if(s)throw s.error}}}return c(p,g)}};return y}var l=function(t,n){return t.actions.forEach((function(e){var r=e.exec;return r&&r(t.context,n)}))};function v(t){var r=t.initialState,o=n.NotStarted,i=new Set,c={_machine:t,send:function(e){o===n.Running&&(r=t.transition(r,e),l(r,u(e)),i.forEach((function(t){return t(r)})));},subscribe:function(t){return i.add(t),t(r),{unsubscribe:function(){return i.delete(t)}}},start:function(i){if(i){var u="object"==typeof i?i:{context:t.config.context,value:i};r={value:u.value,actions:[],context:u.context,matches:a(u.value)};}return o=n.Running,l(r,e),c},stop:function(){return o=n.Stopped,i.clear(),c},get state(){return r},get status(){return o}};return c}

function discardPriorSnapshots(events, baselineTime) {
    for (let idx = events.length - 1; idx >= 0; idx--) {
        const event = events[idx];
        if (event.type === EventType.Meta) {
            if (event.timestamp <= baselineTime) {
                return events.slice(idx);
            }
        }
    }
    return events;
}
function createPlayerService(context, { getCastFn, applyEventsSynchronously, emitter }) {
    const playerMachine = s({
        id: 'player',
        context,
        initial: 'paused',
        states: {
            playing: {
                on: {
                    PAUSE: {
                        target: 'paused',
                        actions: ['pause'],
                    },
                    CAST_EVENT: {
                        target: 'playing',
                        actions: 'castEvent',
                    },
                    END: {
                        target: 'paused',
                        actions: ['resetLastPlayedEvent', 'pause'],
                    },
                    ADD_EVENT: {
                        target: 'playing',
                        actions: ['addEvent'],
                    },
                },
            },
            paused: {
                on: {
                    PLAY: {
                        target: 'playing',
                        actions: ['recordTimeOffset', 'play'],
                    },
                    CAST_EVENT: {
                        target: 'paused',
                        actions: 'castEvent',
                    },
                    TO_LIVE: {
                        target: 'live',
                        actions: ['startLive'],
                    },
                    ADD_EVENT: {
                        target: 'paused',
                        actions: ['addEvent'],
                    },
                },
            },
            live: {
                on: {
                    ADD_EVENT: {
                        target: 'live',
                        actions: ['addEvent'],
                    },
                    CAST_EVENT: {
                        target: 'live',
                        actions: ['castEvent'],
                    },
                },
            },
        },
    }, {
        actions: {
            castEvent: o({
                lastPlayedEvent: (ctx, event) => {
                    if (event.type === 'CAST_EVENT') {
                        return event.payload.event;
                    }
                    return ctx.lastPlayedEvent;
                },
            }),
            recordTimeOffset: o((ctx, event) => {
                let timeOffset = ctx.timeOffset;
                if ('payload' in event && 'timeOffset' in event.payload) {
                    timeOffset = event.payload.timeOffset;
                }
                return Object.assign(Object.assign({}, ctx), { timeOffset, baselineTime: ctx.events[0].timestamp + timeOffset });
            }),
            play(ctx) {
                var _a;
                const { timer, events, baselineTime, lastPlayedEvent } = ctx;
                timer.clear();
                for (const event of events) {
                    addDelay(event, baselineTime);
                }
                const neededEvents = discardPriorSnapshots(events, baselineTime);
                let lastPlayedTimestamp = lastPlayedEvent === null || lastPlayedEvent === void 0 ? void 0 : lastPlayedEvent.timestamp;
                if ((lastPlayedEvent === null || lastPlayedEvent === void 0 ? void 0 : lastPlayedEvent.type) === EventType.IncrementalSnapshot &&
                    lastPlayedEvent.data.source === IncrementalSource.MouseMove) {
                    lastPlayedTimestamp =
                        lastPlayedEvent.timestamp +
                            ((_a = lastPlayedEvent.data.positions[0]) === null || _a === void 0 ? void 0 : _a.timeOffset);
                }
                if (baselineTime < (lastPlayedTimestamp || 0)) {
                    emitter.emit(ReplayerEvents.PlayBack);
                }
                const syncEvents = new Array();
                for (const event of neededEvents) {
                    if (lastPlayedTimestamp &&
                        lastPlayedTimestamp < baselineTime &&
                        (event.timestamp <= lastPlayedTimestamp ||
                            event === lastPlayedEvent)) {
                        continue;
                    }
                    if (event.timestamp < baselineTime) {
                        syncEvents.push(event);
                    }
                    else {
                        const castFn = getCastFn(event, false);
                        timer.addAction({
                            doAction: () => {
                                castFn();
                            },
                            delay: event.delay,
                        });
                    }
                }
                applyEventsSynchronously(syncEvents);
                emitter.emit(ReplayerEvents.Flush);
                timer.start();
            },
            pause(ctx) {
                ctx.timer.clear();
            },
            resetLastPlayedEvent: o((ctx) => {
                return Object.assign(Object.assign({}, ctx), { lastPlayedEvent: null });
            }),
            startLive: o({
                baselineTime: (ctx, event) => {
                    ctx.timer.start();
                    if (event.type === 'TO_LIVE' && event.payload.baselineTime) {
                        return event.payload.baselineTime;
                    }
                    return Date.now();
                },
            }),
            addEvent: o((ctx, machineEvent) => {
                const { baselineTime, timer, events } = ctx;
                if (machineEvent.type === 'ADD_EVENT') {
                    const { event } = machineEvent.payload;
                    addDelay(event, baselineTime);
                    let end = events.length - 1;
                    if (!events[end] || events[end].timestamp <= event.timestamp) {
                        events.push(event);
                    }
                    else {
                        let insertionIndex = -1;
                        let start = 0;
                        while (start <= end) {
                            const mid = Math.floor((start + end) / 2);
                            if (events[mid].timestamp <= event.timestamp) {
                                start = mid + 1;
                            }
                            else {
                                end = mid - 1;
                            }
                        }
                        if (insertionIndex === -1) {
                            insertionIndex = start;
                        }
                        events.splice(insertionIndex, 0, event);
                    }
                    const isSync = event.timestamp < baselineTime;
                    const castFn = getCastFn(event, isSync);
                    if (isSync) {
                        castFn();
                    }
                    else if (timer.isActive()) {
                        timer.addAction({
                            doAction: () => {
                                castFn();
                            },
                            delay: event.delay,
                        });
                    }
                }
                return Object.assign(Object.assign({}, ctx), { events });
            }),
        },
    });
    return v(playerMachine);
}
function createSpeedService(context) {
    const speedMachine = s({
        id: 'speed',
        context,
        initial: 'normal',
        states: {
            normal: {
                on: {
                    FAST_FORWARD: {
                        target: 'skipping',
                        actions: ['recordSpeed', 'setSpeed'],
                    },
                    SET_SPEED: {
                        target: 'normal',
                        actions: ['setSpeed'],
                    },
                },
            },
            skipping: {
                on: {
                    BACK_TO_NORMAL: {
                        target: 'normal',
                        actions: ['restoreSpeed'],
                    },
                    SET_SPEED: {
                        target: 'normal',
                        actions: ['setSpeed'],
                    },
                },
            },
        },
    }, {
        actions: {
            setSpeed: (ctx, event) => {
                if ('payload' in event) {
                    ctx.timer.setSpeed(event.payload.speed);
                }
            },
            recordSpeed: o({
                normalSpeed: (ctx) => ctx.timer.speed,
            }),
            restoreSpeed: (ctx) => {
                ctx.timer.setSpeed(ctx.normalSpeed);
            },
        },
    });
    return v(speedMachine);
}

const rules = (blockClass) => [
    `.${blockClass} { background: currentColor }`,
    'noscript { display: none !important; }',
];

const webGLVarMap = new Map();
function variableListFor(ctx, ctor) {
    let contextMap = webGLVarMap.get(ctx);
    if (!contextMap) {
        contextMap = new Map();
        webGLVarMap.set(ctx, contextMap);
    }
    if (!contextMap.has(ctor)) {
        contextMap.set(ctor, []);
    }
    return contextMap.get(ctor);
}
function deserializeArg(imageMap, ctx, preload) {
    return (arg) => __awaiter(this, void 0, void 0, function* () {
        if (arg && typeof arg === 'object' && 'rr_type' in arg) {
            if (preload)
                preload.isUnchanged = false;
            if (arg.rr_type === 'ImageBitmap' && 'args' in arg) {
                const args = yield deserializeArg(imageMap, ctx, preload)(arg.args);
                return yield createImageBitmap.apply(null, args);
            }
            else if ('index' in arg) {
                if (preload || ctx === null)
                    return arg;
                const { rr_type: name, index } = arg;
                return variableListFor(ctx, name)[index];
            }
            else if ('args' in arg) {
                const { rr_type: name, args } = arg;
                const ctor = window[name];
                return new ctor(...(yield Promise.all(args.map(deserializeArg(imageMap, ctx, preload)))));
            }
            else if ('base64' in arg) {
                return decode(arg.base64);
            }
            else if ('src' in arg) {
                const image = imageMap.get(arg.src);
                if (image) {
                    return image;
                }
                else {
                    const image = new Image();
                    image.src = arg.src;
                    imageMap.set(arg.src, image);
                    return image;
                }
            }
            else if ('data' in arg && arg.rr_type === 'Blob') {
                const blobContents = yield Promise.all(arg.data.map(deserializeArg(imageMap, ctx, preload)));
                const blob = new Blob(blobContents, {
                    type: arg.type,
                });
                return blob;
            }
        }
        else if (Array.isArray(arg)) {
            const result = yield Promise.all(arg.map(deserializeArg(imageMap, ctx, preload)));
            return result;
        }
        return arg;
    });
}

function getContext(target, type) {
    try {
        if (type === CanvasContext.WebGL) {
            return (target.getContext('webgl') || target.getContext('experimental-webgl'));
        }
        return target.getContext('webgl2');
    }
    catch (e) {
        return null;
    }
}
const WebGLVariableConstructorsNames = [
    'WebGLActiveInfo',
    'WebGLBuffer',
    'WebGLFramebuffer',
    'WebGLProgram',
    'WebGLRenderbuffer',
    'WebGLShader',
    'WebGLShaderPrecisionFormat',
    'WebGLTexture',
    'WebGLUniformLocation',
    'WebGLVertexArrayObject',
];
function saveToWebGLVarMap(ctx, result) {
    if (!(result === null || result === void 0 ? void 0 : result.constructor))
        return;
    const { name } = result.constructor;
    if (!WebGLVariableConstructorsNames.includes(name))
        return;
    const variables = variableListFor(ctx, name);
    if (!variables.includes(result))
        variables.push(result);
}
function webglMutation({ mutation, target, type, imageMap, errorHandler, }) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const ctx = getContext(target, type);
            if (!ctx)
                return;
            if (mutation.setter) {
                ctx[mutation.property] = mutation.args[0];
                return;
            }
            const original = ctx[mutation.property];
            const args = yield Promise.all(mutation.args.map(deserializeArg(imageMap, ctx)));
            const result = original.apply(ctx, args);
            saveToWebGLVarMap(ctx, result);
            const debugMode = false;
            if (debugMode) ;
        }
        catch (error) {
            errorHandler(mutation, error);
        }
    });
}

function canvasMutation$1({ event, mutations, target, imageMap, errorHandler, }) {
    return __awaiter(this, void 0, void 0, function* () {
        const ctx = target.getContext('2d');
        if (!ctx) {
            errorHandler(mutations[0], new Error('Canvas context is null'));
            return;
        }
        const mutationArgsPromises = mutations.map((mutation) => __awaiter(this, void 0, void 0, function* () {
            return Promise.all(mutation.args.map(deserializeArg(imageMap, ctx)));
        }));
        const args = yield Promise.all(mutationArgsPromises);
        args.forEach((args, index) => {
            const mutation = mutations[index];
            try {
                if (mutation.setter) {
                    ctx[mutation.property] =
                        mutation.args[0];
                    return;
                }
                const original = ctx[mutation.property];
                if (mutation.property === 'drawImage' &&
                    typeof mutation.args[0] === 'string') {
                    imageMap.get(event);
                    original.apply(ctx, mutation.args);
                }
                else {
                    original.apply(ctx, args);
                }
            }
            catch (error) {
                errorHandler(mutation, error);
            }
            return;
        });
    });
}

function canvasMutation({ event, mutation, target, imageMap, canvasEventMap, errorHandler, }) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const precomputedMutation = canvasEventMap.get(event) || mutation;
            const commands = 'commands' in precomputedMutation
                ? precomputedMutation.commands
                : [precomputedMutation];
            if ([CanvasContext.WebGL, CanvasContext.WebGL2].includes(mutation.type)) {
                for (let i = 0; i < commands.length; i++) {
                    const command = commands[i];
                    yield webglMutation({
                        mutation: command,
                        type: mutation.type,
                        target,
                        imageMap,
                        errorHandler,
                    });
                }
                return;
            }
            yield canvasMutation$1({
                event,
                mutations: commands,
                target,
                imageMap,
                errorHandler,
            });
        }
        catch (error) {
            errorHandler(mutation, error);
        }
    });
}

class MediaManager {
    constructor(options) {
        this.mediaMap = new Map();
        this.metadataCallbackMap = new Map();
        this.warn = options.warn;
        this.service = options.service;
        this.speedService = options.speedService;
        this.emitter = options.emitter;
        this.getCurrentTime = options.getCurrentTime;
        this.emitter.on(ReplayerEvents.Start, this.start.bind(this));
        this.emitter.on(ReplayerEvents.SkipStart, this.start.bind(this));
        this.emitter.on(ReplayerEvents.Pause, this.pause.bind(this));
        this.emitter.on(ReplayerEvents.Finish, this.pause.bind(this));
        this.speedService.subscribe(() => {
            this.syncAllMediaElements();
        });
    }
    syncAllMediaElements(options = { pause: false }) {
        this.mediaMap.forEach((mediaState, target) => {
            this.syncTargetWithState(target);
            if (options.pause) {
                target.pause();
            }
        });
    }
    start() {
        this.syncAllMediaElements();
    }
    pause() {
        this.syncAllMediaElements({ pause: true });
    }
    seekTo({ time, target, mediaState, }) {
        if (mediaState.isPlaying) {
            const differenceBetweenCurrentTimeAndMediaMutationTimestamp = time - mediaState.lastInteractionTimeOffset;
            const mediaPlaybackOffset = (differenceBetweenCurrentTimeAndMediaMutationTimestamp / 1000) *
                mediaState.playbackRate;
            const duration = 'duration' in target && target.duration;
            if (Number.isNaN(duration)) {
                this.waitForMetadata(target);
                return;
            }
            let seekToTime = mediaState.currentTimeAtLastInteraction + mediaPlaybackOffset;
            if (target.loop &&
                duration !== false) {
                seekToTime = seekToTime % duration;
            }
            target.currentTime = seekToTime;
        }
        else {
            target.pause();
            target.currentTime = mediaState.currentTimeAtLastInteraction;
        }
    }
    waitForMetadata(target) {
        if (this.metadataCallbackMap.has(target))
            return;
        if (!('addEventListener' in target))
            return;
        const onLoadedMetadata = () => {
            this.metadataCallbackMap.delete(target);
            const mediaState = this.mediaMap.get(target);
            if (!mediaState)
                return;
            this.seekTo({
                time: this.getCurrentTime(),
                target,
                mediaState,
            });
        };
        this.metadataCallbackMap.set(target, onLoadedMetadata);
        target.addEventListener('loadedmetadata', onLoadedMetadata, {
            once: true,
        });
    }
    getMediaStateFromMutation({ target, timeOffset, mutation, }) {
        var _a, _b, _c, _d, _e;
        const lastState = this.mediaMap.get(target);
        const { type, playbackRate, currentTime, muted, volume, loop } = mutation;
        const isPlaying = type === 0 ||
            (type !== 1 &&
                ((lastState === null || lastState === void 0 ? void 0 : lastState.isPlaying) || target.getAttribute('autoplay') !== null));
        const mediaState = {
            isPlaying,
            currentTimeAtLastInteraction: (_a = currentTime !== null && currentTime !== void 0 ? currentTime : lastState === null || lastState === void 0 ? void 0 : lastState.currentTimeAtLastInteraction) !== null && _a !== void 0 ? _a : 0,
            lastInteractionTimeOffset: timeOffset,
            playbackRate: (_b = playbackRate !== null && playbackRate !== void 0 ? playbackRate : lastState === null || lastState === void 0 ? void 0 : lastState.playbackRate) !== null && _b !== void 0 ? _b : 1,
            volume: (_c = volume !== null && volume !== void 0 ? volume : lastState === null || lastState === void 0 ? void 0 : lastState.volume) !== null && _c !== void 0 ? _c : 1,
            muted: (_d = muted !== null && muted !== void 0 ? muted : lastState === null || lastState === void 0 ? void 0 : lastState.muted) !== null && _d !== void 0 ? _d : target.getAttribute('muted') === null,
            loop: (_e = loop !== null && loop !== void 0 ? loop : lastState === null || lastState === void 0 ? void 0 : lastState.loop) !== null && _e !== void 0 ? _e : target.getAttribute('loop') === null,
        };
        return mediaState;
    }
    syncTargetWithState(target) {
        const mediaState = this.mediaMap.get(target);
        if (!mediaState)
            return;
        const { muted, loop, volume, isPlaying } = mediaState;
        const playerIsPaused = this.service.state.matches('paused');
        const playbackRate = mediaState.playbackRate * this.speedService.state.context.timer.speed;
        try {
            this.seekTo({
                time: this.getCurrentTime(),
                target,
                mediaState,
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
            }
            else {
                target.pause();
            }
        }
        catch (error) {
            this.warn(`Failed to replay media interactions: ${error.message || error}`);
        }
    }
    addMediaElements(node, timeOffset, mirror) {
        if (!['AUDIO', 'VIDEO'].includes(node.nodeName))
            return;
        const target = node;
        const serializedNode = mirror.getMeta(target);
        if (!serializedNode || !('attributes' in serializedNode))
            return;
        const playerIsPaused = this.service.state.matches('paused');
        const mediaAttributes = serializedNode.attributes;
        let isPlaying = false;
        if (mediaAttributes.rr_mediaState) {
            isPlaying = mediaAttributes.rr_mediaState === 'played';
        }
        else {
            isPlaying = target.getAttribute('autoplay') !== null;
        }
        if (isPlaying && playerIsPaused)
            target.pause();
        let playbackRate = 1;
        if (typeof mediaAttributes.rr_mediaPlaybackRate === 'number') {
            playbackRate = mediaAttributes.rr_mediaPlaybackRate;
        }
        let muted = false;
        if (typeof mediaAttributes.rr_mediaMuted === 'boolean') {
            muted = mediaAttributes.rr_mediaMuted;
        }
        else {
            muted = target.getAttribute('muted') !== null;
        }
        let loop = false;
        if (typeof mediaAttributes.rr_mediaLoop === 'boolean') {
            loop = mediaAttributes.rr_mediaLoop;
        }
        else {
            loop = target.getAttribute('loop') !== null;
        }
        let volume = 1;
        if (typeof mediaAttributes.rr_mediaVolume === 'number') {
            volume = mediaAttributes.rr_mediaVolume;
        }
        let currentTimeAtLastInteraction = 0;
        if (typeof mediaAttributes.rr_mediaCurrentTime === 'number') {
            currentTimeAtLastInteraction = mediaAttributes.rr_mediaCurrentTime;
        }
        this.mediaMap.set(target, {
            isPlaying,
            currentTimeAtLastInteraction,
            lastInteractionTimeOffset: timeOffset,
            playbackRate,
            volume,
            muted,
            loop,
        });
        this.syncTargetWithState(target);
    }
    mediaMutation({ target, timeOffset, mutation, }) {
        this.mediaMap.set(target, this.getMediaStateFromMutation({
            target,
            timeOffset,
            mutation,
        }));
        this.syncTargetWithState(target);
    }
    isSupportedMediaElement(node) {
        return ['AUDIO', 'VIDEO'].includes(node.nodeName);
    }
    reset() {
        this.mediaMap.clear();
    }
}

const SKIP_TIME_INTERVAL = 5 * 1000;
const mitt = mitt$1 || mittProxy;
const REPLAY_CONSOLE_PREFIX = '[replayer]';
const defaultMouseTailConfig = {
    duration: 500,
    lineCap: 'round',
    lineWidth: 3,
    strokeStyle: 'red',
};
function indicatesTouchDevice(e) {
    return (e.type == EventType.IncrementalSnapshot &&
        (e.data.source == IncrementalSource.TouchMove ||
            (e.data.source == IncrementalSource.MouseInteraction &&
                e.data.type == MouseInteractions.TouchStart)));
}
class Replayer {
    get timer() {
        return this.service.state.context.timer;
    }
    constructor(events, config) {
        this.usingVirtualDom = false;
        this.virtualDom = new RRDocument();
        this.mouseTail = null;
        this.tailPositions = [];
        this.emitter = mitt();
        this.legacy_missingNodeRetryMap = {};
        this.cache = createCache();
        this.imageMap = new Map();
        this.canvasEventMap = new Map();
        this.mirror = createMirror$2();
        this.styleMirror = new StyleSheetMirror();
        this.firstFullSnapshot = null;
        this.newDocumentQueue = [];
        this.mousePos = null;
        this.touchActive = null;
        this.lastMouseDownEvent = null;
        this.lastSelectionData = null;
        this.constructedStyleMutations = [];
        this.adoptedStyleSheets = [];
        this.handleResize = (dimension) => {
            this.iframe.style.display = 'inherit';
            for (const el of [this.mouseTail, this.iframe]) {
                if (!el) {
                    continue;
                }
                el.setAttribute('width', String(dimension.width));
                el.setAttribute('height', String(dimension.height));
            }
        };
        this.applyEventsSynchronously = (events) => {
            for (const event of events) {
                switch (event.type) {
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
                const castFn = this.getCastFn(event, true);
                castFn();
            }
        };
        this.getCastFn = (event, isSync = false) => {
            let castFn;
            switch (event.type) {
                case EventType.DomContentLoaded:
                case EventType.Load:
                    break;
                case EventType.Custom:
                    castFn = () => {
                        this.emitter.emit(ReplayerEvents.CustomEvent, event);
                    };
                    break;
                case EventType.Meta:
                    castFn = () => this.emitter.emit(ReplayerEvents.Resize, {
                        width: event.data.width,
                        height: event.data.height,
                    });
                    break;
                case EventType.FullSnapshot:
                    castFn = () => {
                        var _a;
                        if (this.firstFullSnapshot) {
                            if (this.firstFullSnapshot === event) {
                                this.firstFullSnapshot = true;
                                return;
                            }
                        }
                        else {
                            this.firstFullSnapshot = true;
                        }
                        this.mediaManager.reset();
                        this.styleMirror.reset();
                        this.rebuildFullSnapshot(event, isSync);
                        (_a = this.iframe.contentWindow) === null || _a === void 0 ? void 0 : _a.scrollTo(event.data.initialOffset);
                    };
                    break;
                case EventType.IncrementalSnapshot:
                    castFn = () => {
                        this.applyIncremental(event, isSync);
                        if (isSync) {
                            return;
                        }
                        if (event === this.nextUserInteractionEvent) {
                            this.nextUserInteractionEvent = null;
                            this.backToNormal();
                        }
                        if (this.config.skipInactive && !this.nextUserInteractionEvent) {
                            for (const _event of this.service.state.context.events) {
                                if (_event.timestamp <= event.timestamp) {
                                    continue;
                                }
                                if (this.isUserInteraction(_event)) {
                                    if (_event.delay - event.delay >
                                        this.config.inactivePeriodThreshold *
                                            this.speedService.state.context.timer.speed) {
                                        this.nextUserInteractionEvent = _event;
                                    }
                                    break;
                                }
                            }
                            if (this.nextUserInteractionEvent) {
                                const skipTime = this.nextUserInteractionEvent.delay - event.delay;
                                const payload = {
                                    speed: Math.min(Math.round(skipTime / SKIP_TIME_INTERVAL), this.config.maxSpeed),
                                };
                                this.speedService.send({ type: 'FAST_FORWARD', payload });
                                this.emitter.emit(ReplayerEvents.SkipStart, payload);
                            }
                        }
                    };
                    break;
            }
            const wrappedCastFn = () => {
                if (castFn) {
                    castFn();
                }
                for (const plugin of this.config.plugins || []) {
                    if (plugin.handler)
                        plugin.handler(event, isSync, { replayer: this });
                }
                this.service.send({ type: 'CAST_EVENT', payload: { event } });
                const last_index = this.service.state.context.events.length - 1;
                if (!this.config.liveMode &&
                    event === this.service.state.context.events[last_index]) {
                    const finish = () => {
                        if (last_index < this.service.state.context.events.length - 1) {
                            return;
                        }
                        this.backToNormal();
                        this.service.send('END');
                        this.emitter.emit(ReplayerEvents.Finish);
                    };
                    let finish_buffer = 50;
                    if (event.type === EventType.IncrementalSnapshot &&
                        event.data.source === IncrementalSource.MouseMove &&
                        event.data.positions.length) {
                        finish_buffer += Math.max(0, -event.data.positions[0].timeOffset);
                    }
                    setTimeout(finish, finish_buffer);
                }
                this.emitter.emit(ReplayerEvents.EventCast, event);
            };
            return wrappedCastFn;
        };
        if (!(config === null || config === void 0 ? void 0 : config.liveMode) && events.length < 2) {
            throw new Error('Replayer need at least 2 events.');
        }
        const defaultConfig = {
            speed: 1,
            maxSpeed: 360,
            root: document.body,
            loadTimeout: 0,
            skipInactive: false,
            inactivePeriodThreshold: 10 * 1000,
            showWarning: true,
            showDebug: false,
            blockClass: 'rr-block',
            liveMode: false,
            insertStyleRules: [],
            triggerFocus: true,
            UNSAFE_replayCanvas: false,
            pauseAnimation: true,
            mouseTail: defaultMouseTailConfig,
            useVirtualDom: true,
            logger: console,
        };
        this.config = Object.assign({}, defaultConfig, config);
        this.handleResize = this.handleResize.bind(this);
        this.getCastFn = this.getCastFn.bind(this);
        this.applyEventsSynchronously = this.applyEventsSynchronously.bind(this);
        this.emitter.on(ReplayerEvents.Resize, this.handleResize);
        this.setupDom();
        for (const plugin of this.config.plugins || []) {
            if (plugin.getMirror)
                plugin.getMirror({ nodeMirror: this.mirror });
        }
        this.emitter.on(ReplayerEvents.Flush, () => {
            if (this.usingVirtualDom) {
                const replayerHandler = {
                    mirror: this.mirror,
                    applyCanvas: (canvasEvent, canvasMutationData, target) => {
                        void canvasMutation({
                            event: canvasEvent,
                            mutation: canvasMutationData,
                            target,
                            imageMap: this.imageMap,
                            canvasEventMap: this.canvasEventMap,
                            errorHandler: this.warnCanvasMutationFailed.bind(this),
                        });
                    },
                    applyInput: this.applyInput.bind(this),
                    applyScroll: this.applyScroll.bind(this),
                    applyStyleSheetMutation: (data, styleSheet) => {
                        if (data.source === IncrementalSource.StyleSheetRule)
                            this.applyStyleSheetRule(data, styleSheet);
                        else if (data.source === IncrementalSource.StyleDeclaration)
                            this.applyStyleDeclaration(data, styleSheet);
                    },
                    afterAppend: (node, id) => {
                        for (const plugin of this.config.plugins || []) {
                            if (plugin.onBuild)
                                plugin.onBuild(node, { id, replayer: this });
                        }
                    },
                };
                if (this.iframe.contentDocument)
                    try {
                        diff(this.iframe.contentDocument, this.virtualDom, replayerHandler, this.virtualDom.mirror);
                    }
                    catch (e) {
                        console.warn(e);
                    }
                this.virtualDom.destroyTree();
                this.usingVirtualDom = false;
                if (Object.keys(this.legacy_missingNodeRetryMap).length) {
                    for (const key in this.legacy_missingNodeRetryMap) {
                        try {
                            const value = this.legacy_missingNodeRetryMap[key];
                            const realNode = createOrGetNode(value.node, this.mirror, this.virtualDom.mirror);
                            diff(realNode, value.node, replayerHandler, this.virtualDom.mirror);
                            value.node = realNode;
                        }
                        catch (error) {
                            this.warn(error);
                        }
                    }
                }
                this.constructedStyleMutations.forEach((data) => {
                    this.applyStyleSheetMutation(data);
                });
                this.constructedStyleMutations = [];
                this.adoptedStyleSheets.forEach((data) => {
                    this.applyAdoptedStyleSheet(data);
                });
                this.adoptedStyleSheets = [];
            }
            if (this.mousePos) {
                this.moveAndHover(this.mousePos.x, this.mousePos.y, this.mousePos.id, true, this.mousePos.debugData);
                this.mousePos = null;
            }
            if (this.touchActive === true) {
                this.mouse.classList.add('touch-active');
            }
            else if (this.touchActive === false) {
                this.mouse.classList.remove('touch-active');
            }
            this.touchActive = null;
            if (this.lastMouseDownEvent) {
                const [target, event] = this.lastMouseDownEvent;
                target.dispatchEvent(event);
            }
            this.lastMouseDownEvent = null;
            if (this.lastSelectionData) {
                this.applySelection(this.lastSelectionData);
                this.lastSelectionData = null;
            }
        });
        this.emitter.on(ReplayerEvents.PlayBack, () => {
            this.firstFullSnapshot = null;
            this.mirror.reset();
            this.styleMirror.reset();
            this.mediaManager.reset();
        });
        const timer = new Timer([], {
            speed: this.config.speed,
        });
        this.service = createPlayerService({
            events: events
                .map((e) => {
                if (config && config.unpackFn) {
                    return config.unpackFn(e);
                }
                return e;
            })
                .sort((a1, a2) => a1.timestamp - a2.timestamp),
            timer,
            timeOffset: 0,
            baselineTime: 0,
            lastPlayedEvent: null,
        }, {
            getCastFn: this.getCastFn,
            applyEventsSynchronously: this.applyEventsSynchronously,
            emitter: this.emitter,
        });
        this.service.start();
        this.service.subscribe((state) => {
            this.emitter.emit(ReplayerEvents.StateChange, {
                player: state,
            });
        });
        this.speedService = createSpeedService({
            normalSpeed: -1,
            timer,
        });
        this.speedService.start();
        this.speedService.subscribe((state) => {
            this.emitter.emit(ReplayerEvents.StateChange, {
                speed: state,
            });
        });
        this.mediaManager = new MediaManager({
            warn: this.warn.bind(this),
            service: this.service,
            speedService: this.speedService,
            emitter: this.emitter,
            getCurrentTime: this.getCurrentTime.bind(this),
        });
        const firstMeta = this.service.state.context.events.find((e) => e.type === EventType.Meta);
        const firstFullsnapshot = this.service.state.context.events.find((e) => e.type === EventType.FullSnapshot);
        if (firstMeta) {
            const { width, height } = firstMeta.data;
            setTimeout(() => {
                this.emitter.emit(ReplayerEvents.Resize, {
                    width,
                    height,
                });
            }, 0);
        }
        if (firstFullsnapshot) {
            setTimeout(() => {
                var _a;
                if (this.firstFullSnapshot) {
                    return;
                }
                this.firstFullSnapshot = firstFullsnapshot;
                this.rebuildFullSnapshot(firstFullsnapshot);
                (_a = this.iframe.contentWindow) === null || _a === void 0 ? void 0 : _a.scrollTo(firstFullsnapshot.data.initialOffset);
            }, 1);
        }
        if (this.service.state.context.events.find(indicatesTouchDevice)) {
            this.mouse.classList.add('touch-device');
        }
    }
    on(event, handler) {
        this.emitter.on(event, handler);
        return this;
    }
    off(event, handler) {
        this.emitter.off(event, handler);
        return this;
    }
    setConfig(config) {
        Object.keys(config).forEach((key) => {
            config[key];
            this.config[key] = config[key];
        });
        if (!this.config.skipInactive) {
            this.backToNormal();
        }
        if (typeof config.speed !== 'undefined') {
            this.speedService.send({
                type: 'SET_SPEED',
                payload: {
                    speed: config.speed,
                },
            });
        }
        if (typeof config.mouseTail !== 'undefined') {
            if (config.mouseTail === false) {
                if (this.mouseTail) {
                    this.mouseTail.style.display = 'none';
                }
            }
            else {
                if (!this.mouseTail) {
                    this.mouseTail = document.createElement('canvas');
                    this.mouseTail.width = Number.parseFloat(this.iframe.width);
                    this.mouseTail.height = Number.parseFloat(this.iframe.height);
                    this.mouseTail.classList.add('replayer-mouse-tail');
                    this.wrapper.insertBefore(this.mouseTail, this.iframe);
                }
                this.mouseTail.style.display = 'inherit';
            }
        }
    }
    getMetaData() {
        const firstEvent = this.service.state.context.events[0];
        const lastEvent = this.service.state.context.events[this.service.state.context.events.length - 1];
        return {
            startTime: firstEvent.timestamp,
            endTime: lastEvent.timestamp,
            totalTime: lastEvent.timestamp - firstEvent.timestamp,
        };
    }
    getCurrentTime() {
        return this.timer.timeOffset + this.getTimeOffset();
    }
    getTimeOffset() {
        const { baselineTime, events } = this.service.state.context;
        return baselineTime - events[0].timestamp;
    }
    getMirror() {
        return this.mirror;
    }
    play(timeOffset = 0) {
        var _a, _b;
        if (this.service.state.matches('paused')) {
            this.service.send({ type: 'PLAY', payload: { timeOffset } });
        }
        else {
            this.service.send({ type: 'PAUSE' });
            this.service.send({ type: 'PLAY', payload: { timeOffset } });
        }
        (_b = (_a = this.iframe.contentDocument) === null || _a === void 0 ? void 0 : _a.getElementsByTagName('html')[0]) === null || _b === void 0 ? void 0 : _b.classList.remove('rrweb-paused');
        this.emitter.emit(ReplayerEvents.Start);
    }
    pause(timeOffset) {
        var _a, _b;
        if (timeOffset === undefined && this.service.state.matches('playing')) {
            this.service.send({ type: 'PAUSE' });
        }
        if (typeof timeOffset === 'number') {
            this.play(timeOffset);
            this.service.send({ type: 'PAUSE' });
        }
        (_b = (_a = this.iframe.contentDocument) === null || _a === void 0 ? void 0 : _a.getElementsByTagName('html')[0]) === null || _b === void 0 ? void 0 : _b.classList.add('rrweb-paused');
        this.emitter.emit(ReplayerEvents.Pause);
    }
    resume(timeOffset = 0) {
        this.warn(`The 'resume' was deprecated in 1.0. Please use 'play' method which has the same interface.`);
        this.play(timeOffset);
        this.emitter.emit(ReplayerEvents.Resume);
    }
    destroy() {
        this.pause();
        this.mirror.reset();
        this.styleMirror.reset();
        this.mediaManager.reset();
        this.config.root.removeChild(this.wrapper);
        this.emitter.emit(ReplayerEvents.Destroy);
    }
    startLive(baselineTime) {
        this.service.send({ type: 'TO_LIVE', payload: { baselineTime } });
    }
    addEvent(rawEvent) {
        const event = this.config.unpackFn
            ? this.config.unpackFn(rawEvent)
            : rawEvent;
        if (indicatesTouchDevice(event)) {
            this.mouse.classList.add('touch-device');
        }
        void Promise.resolve().then(() => this.service.send({ type: 'ADD_EVENT', payload: { event } }));
    }
    enableInteract() {
        this.iframe.setAttribute('scrolling', 'auto');
        this.iframe.style.pointerEvents = 'auto';
    }
    disableInteract() {
        this.iframe.setAttribute('scrolling', 'no');
        this.iframe.style.pointerEvents = 'none';
    }
    resetCache() {
        this.cache = createCache();
    }
    setupDom() {
        this.wrapper = document.createElement('div');
        this.wrapper.classList.add('replayer-wrapper');
        this.config.root.appendChild(this.wrapper);
        this.mouse = document.createElement('div');
        this.mouse.classList.add('replayer-mouse');
        this.wrapper.appendChild(this.mouse);
        if (this.config.mouseTail !== false) {
            this.mouseTail = document.createElement('canvas');
            this.mouseTail.classList.add('replayer-mouse-tail');
            this.mouseTail.style.display = 'inherit';
            this.wrapper.appendChild(this.mouseTail);
        }
        this.iframe = document.createElement('iframe');
        const attributes = ['allow-same-origin'];
        if (this.config.UNSAFE_replayCanvas) {
            attributes.push('allow-scripts');
        }
        this.iframe.style.display = 'none';
        this.iframe.setAttribute('sandbox', attributes.join(' '));
        this.disableInteract();
        this.wrapper.appendChild(this.iframe);
        if (this.iframe.contentWindow && this.iframe.contentDocument) {
            polyfill(this.iframe.contentWindow, this.iframe.contentDocument);
            polyfill$1(this.iframe.contentWindow);
        }
    }
    rebuildFullSnapshot(event, isSync = false) {
        if (!this.iframe.contentDocument) {
            return this.warn('Looks like your replayer has been destroyed.');
        }
        if (Object.keys(this.legacy_missingNodeRetryMap).length) {
            this.warn('Found unresolved missing node map', this.legacy_missingNodeRetryMap);
        }
        this.legacy_missingNodeRetryMap = {};
        const collected = [];
        const afterAppend = (builtNode, id) => {
            this.collectIframeAndAttachDocument(collected, builtNode);
            if (this.mediaManager.isSupportedMediaElement(builtNode)) {
                const { events } = this.service.state.context;
                this.mediaManager.addMediaElements(builtNode, event.timestamp - events[0].timestamp, this.mirror);
            }
            for (const plugin of this.config.plugins || []) {
                if (plugin.onBuild)
                    plugin.onBuild(builtNode, {
                        id,
                        replayer: this,
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
            afterAppend,
            cache: this.cache,
            mirror: this.mirror,
        });
        afterAppend(this.iframe.contentDocument, event.data.node.id);
        for (const { mutationInQueue, builtNode } of collected) {
            this.attachDocumentToIframe(mutationInQueue, builtNode);
            this.newDocumentQueue = this.newDocumentQueue.filter((m) => m !== mutationInQueue);
        }
        const { documentElement, head } = this.iframe.contentDocument;
        this.insertStyleRules(documentElement, head);
        if (!this.service.state.matches('playing')) {
            this.iframe.contentDocument
                .getElementsByTagName('html')[0]
                .classList.add('rrweb-paused');
        }
        this.emitter.emit(ReplayerEvents.FullsnapshotRebuilded, event);
        if (!isSync) {
            this.waitForStylesheetLoad();
        }
        if (this.config.UNSAFE_replayCanvas) {
            void this.preloadAllImages();
        }
    }
    insertStyleRules(documentElement, head) {
        var _a;
        const injectStylesRules = rules(this.config.blockClass).concat(this.config.insertStyleRules);
        if (this.config.pauseAnimation) {
            injectStylesRules.push('html.rrweb-paused *, html.rrweb-paused *:before, html.rrweb-paused *:after { animation-play-state: paused !important; }');
        }
        if (this.usingVirtualDom) {
            const styleEl = this.virtualDom.createElement('style');
            this.virtualDom.mirror.add(styleEl, getDefaultSN(styleEl, this.virtualDom.unserializedId));
            documentElement.insertBefore(styleEl, head);
            styleEl.rules.push({
                source: IncrementalSource.StyleSheetRule,
                adds: injectStylesRules.map((cssText, index) => ({
                    rule: cssText,
                    index,
                })),
            });
        }
        else {
            const styleEl = document.createElement('style');
            documentElement.insertBefore(styleEl, head);
            for (let idx = 0; idx < injectStylesRules.length; idx++) {
                (_a = styleEl.sheet) === null || _a === void 0 ? void 0 : _a.insertRule(injectStylesRules[idx], idx);
            }
        }
    }
    attachDocumentToIframe(mutation, iframeEl) {
        const mirror = this.usingVirtualDom
            ? this.virtualDom.mirror
            : this.mirror;
        const collected = [];
        const afterAppend = (builtNode, id) => {
            this.collectIframeAndAttachDocument(collected, builtNode);
            const sn = mirror.getMeta(builtNode);
            if ((sn === null || sn === void 0 ? void 0 : sn.type) === NodeType$2.Element &&
                (sn === null || sn === void 0 ? void 0 : sn.tagName.toUpperCase()) === 'HTML') {
                const { documentElement, head } = iframeEl.contentDocument;
                this.insertStyleRules(documentElement, head);
            }
            if (this.usingVirtualDom)
                return;
            for (const plugin of this.config.plugins || []) {
                if (plugin.onBuild)
                    plugin.onBuild(builtNode, {
                        id,
                        replayer: this,
                    });
            }
        };
        buildNodeWithSN(mutation.node, {
            doc: iframeEl.contentDocument,
            mirror: mirror,
            hackCss: true,
            skipChild: false,
            afterAppend,
            cache: this.cache,
        });
        afterAppend(iframeEl.contentDocument, mutation.node.id);
        for (const { mutationInQueue, builtNode } of collected) {
            this.attachDocumentToIframe(mutationInQueue, builtNode);
            this.newDocumentQueue = this.newDocumentQueue.filter((m) => m !== mutationInQueue);
        }
    }
    collectIframeAndAttachDocument(collected, builtNode) {
        if (isSerializedIframe(builtNode, this.mirror)) {
            const mutationInQueue = this.newDocumentQueue.find((m) => m.parentId === this.mirror.getId(builtNode));
            if (mutationInQueue) {
                collected.push({
                    mutationInQueue,
                    builtNode: builtNode,
                });
            }
        }
    }
    waitForStylesheetLoad() {
        var _a;
        const head = (_a = this.iframe.contentDocument) === null || _a === void 0 ? void 0 : _a.head;
        if (head) {
            const unloadSheets = new Set();
            let timer;
            let beforeLoadState = this.service.state;
            const stateHandler = () => {
                beforeLoadState = this.service.state;
            };
            this.emitter.on(ReplayerEvents.Start, stateHandler);
            this.emitter.on(ReplayerEvents.Pause, stateHandler);
            const unsubscribe = () => {
                this.emitter.off(ReplayerEvents.Start, stateHandler);
                this.emitter.off(ReplayerEvents.Pause, stateHandler);
            };
            head
                .querySelectorAll('link[rel="stylesheet"]')
                .forEach((css) => {
                if (!css.sheet) {
                    unloadSheets.add(css);
                    css.addEventListener('load', () => {
                        unloadSheets.delete(css);
                        if (unloadSheets.size === 0 && timer !== -1) {
                            if (beforeLoadState.matches('playing')) {
                                this.play(this.getCurrentTime());
                            }
                            this.emitter.emit(ReplayerEvents.LoadStylesheetEnd);
                            if (timer) {
                                clearTimeout(timer);
                            }
                            unsubscribe();
                        }
                    });
                }
            });
            if (unloadSheets.size > 0) {
                this.service.send({ type: 'PAUSE' });
                this.emitter.emit(ReplayerEvents.LoadStylesheetStart);
                timer = setTimeout(() => {
                    if (beforeLoadState.matches('playing')) {
                        this.play(this.getCurrentTime());
                    }
                    timer = -1;
                    unsubscribe();
                }, this.config.loadTimeout);
            }
        }
    }
    preloadAllImages() {
        return __awaiter(this, void 0, void 0, function* () {
            this.service.state;
            const stateHandler = () => {
                this.service.state;
            };
            this.emitter.on(ReplayerEvents.Start, stateHandler);
            this.emitter.on(ReplayerEvents.Pause, stateHandler);
            const promises = [];
            for (const event of this.service.state.context.events) {
                if (event.type === EventType.IncrementalSnapshot &&
                    event.data.source === IncrementalSource.CanvasMutation) {
                    promises.push(this.deserializeAndPreloadCanvasEvents(event.data, event));
                    const commands = 'commands' in event.data ? event.data.commands : [event.data];
                    commands.forEach((c) => {
                        this.preloadImages(c, event);
                    });
                }
            }
            return Promise.all(promises);
        });
    }
    preloadImages(data, event) {
        if (data.property === 'drawImage' &&
            typeof data.args[0] === 'string' &&
            !this.imageMap.has(event)) {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const imgd = ctx === null || ctx === void 0 ? void 0 : ctx.createImageData(canvas.width, canvas.height);
            imgd === null || imgd === void 0 ? void 0 : imgd.data;
            JSON.parse(data.args[0]);
            ctx === null || ctx === void 0 ? void 0 : ctx.putImageData(imgd, 0, 0);
        }
    }
    deserializeAndPreloadCanvasEvents(data, event) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.canvasEventMap.has(event)) {
                const status = {
                    isUnchanged: true,
                };
                if ('commands' in data) {
                    const commands = yield Promise.all(data.commands.map((c) => __awaiter(this, void 0, void 0, function* () {
                        const args = yield Promise.all(c.args.map(deserializeArg(this.imageMap, null, status)));
                        return Object.assign(Object.assign({}, c), { args });
                    })));
                    if (status.isUnchanged === false)
                        this.canvasEventMap.set(event, Object.assign(Object.assign({}, data), { commands }));
                }
                else {
                    const args = yield Promise.all(data.args.map(deserializeArg(this.imageMap, null, status)));
                    if (status.isUnchanged === false)
                        this.canvasEventMap.set(event, Object.assign(Object.assign({}, data), { args }));
                }
            }
        });
    }
    applyIncremental(e, isSync) {
        var _a, _b, _c;
        const { data: d } = e;
        switch (d.source) {
            case IncrementalSource.Mutation: {
                try {
                    this.applyMutation(d, isSync);
                }
                catch (error) {
                    this.warn(`Exception in mutation ${error.message || error}`, d);
                }
                break;
            }
            case IncrementalSource.Drag:
            case IncrementalSource.TouchMove:
            case IncrementalSource.MouseMove:
                if (isSync) {
                    const lastPosition = d.positions[d.positions.length - 1];
                    this.mousePos = {
                        x: lastPosition.x,
                        y: lastPosition.y,
                        id: lastPosition.id,
                        debugData: d,
                    };
                }
                else {
                    d.positions.forEach((p) => {
                        const action = {
                            doAction: () => {
                                this.moveAndHover(p.x, p.y, p.id, isSync, d);
                            },
                            delay: p.timeOffset +
                                e.timestamp -
                                this.service.state.context.baselineTime,
                        };
                        this.timer.addAction(action);
                    });
                    this.timer.addAction({
                        doAction() {
                        },
                        delay: e.delay - ((_a = d.positions[0]) === null || _a === void 0 ? void 0 : _a.timeOffset),
                    });
                }
                break;
            case IncrementalSource.MouseInteraction: {
                if (d.id === -1) {
                    break;
                }
                const event = new Event(toLowerCase(MouseInteractions[d.type]));
                const target = this.mirror.getNode(d.id);
                if (!target) {
                    return this.debugNodeNotFound(d, d.id);
                }
                this.emitter.emit(ReplayerEvents.MouseInteraction, {
                    type: d.type,
                    target,
                });
                const { triggerFocus } = this.config;
                switch (d.type) {
                    case MouseInteractions.Blur:
                        if ('blur' in target) {
                            target.blur();
                        }
                        break;
                    case MouseInteractions.Focus:
                        if (triggerFocus && target.focus) {
                            target.focus({
                                preventScroll: true,
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
                            }
                            else if (d.type === MouseInteractions.TouchEnd) {
                                this.touchActive = false;
                            }
                            if (d.type === MouseInteractions.MouseDown) {
                                this.lastMouseDownEvent = [target, event];
                            }
                            else if (d.type === MouseInteractions.MouseUp) {
                                this.lastMouseDownEvent = null;
                            }
                            this.mousePos = {
                                x: d.x || 0,
                                y: d.y || 0,
                                id: d.id,
                                debugData: d,
                            };
                        }
                        else {
                            if (d.type === MouseInteractions.TouchStart) {
                                this.tailPositions.length = 0;
                            }
                            this.moveAndHover(d.x || 0, d.y || 0, d.id, isSync, d);
                            if (d.type === MouseInteractions.Click) {
                                this.mouse.classList.remove('active');
                                void this.mouse.offsetWidth;
                                this.mouse.classList.add('active');
                            }
                            else if (d.type === MouseInteractions.TouchStart) {
                                void this.mouse.offsetWidth;
                                this.mouse.classList.add('touch-active');
                            }
                            else if (d.type === MouseInteractions.TouchEnd) {
                                this.mouse.classList.remove('touch-active');
                            }
                            else {
                                target.dispatchEvent(event);
                            }
                        }
                        break;
                    case MouseInteractions.TouchCancel:
                        if (isSync) {
                            this.touchActive = false;
                        }
                        else {
                            this.mouse.classList.remove('touch-active');
                        }
                        break;
                    default:
                        target.dispatchEvent(event);
                }
                break;
            }
            case IncrementalSource.Scroll: {
                if (d.id === -1) {
                    break;
                }
                if (this.usingVirtualDom) {
                    const target = this.virtualDom.mirror.getNode(d.id);
                    if (!target) {
                        return this.debugNodeNotFound(d, d.id);
                    }
                    target.scrollData = d;
                    break;
                }
                this.applyScroll(d, isSync);
                break;
            }
            case IncrementalSource.ViewportResize:
                this.emitter.emit(ReplayerEvents.Resize, {
                    width: d.width,
                    height: d.height,
                });
                break;
            case IncrementalSource.Input: {
                if (d.id === -1) {
                    break;
                }
                if (this.usingVirtualDom) {
                    const target = this.virtualDom.mirror.getNode(d.id);
                    if (!target) {
                        return this.debugNodeNotFound(d, d.id);
                    }
                    target.inputData = d;
                    break;
                }
                this.applyInput(d);
                break;
            }
            case IncrementalSource.MediaInteraction: {
                const target = this.usingVirtualDom
                    ? this.virtualDom.mirror.getNode(d.id)
                    : this.mirror.getNode(d.id);
                if (!target) {
                    return this.debugNodeNotFound(d, d.id);
                }
                const mediaEl = target;
                const { events } = this.service.state.context;
                this.mediaManager.mediaMutation({
                    target: mediaEl,
                    timeOffset: e.timestamp - events[0].timestamp,
                    mutation: d,
                });
                break;
            }
            case IncrementalSource.StyleSheetRule:
            case IncrementalSource.StyleDeclaration: {
                if (this.usingVirtualDom) {
                    if (d.styleId)
                        this.constructedStyleMutations.push(d);
                    else if (d.id)
                        (_b = this.virtualDom.mirror.getNode(d.id)) === null || _b === void 0 ? void 0 : _b.rules.push(d);
                }
                else
                    this.applyStyleSheetMutation(d);
                break;
            }
            case IncrementalSource.CanvasMutation: {
                if (!this.config.UNSAFE_replayCanvas) {
                    return;
                }
                if (this.usingVirtualDom) {
                    const target = this.virtualDom.mirror.getNode(d.id);
                    if (!target) {
                        return this.debugNodeNotFound(d, d.id);
                    }
                    target.canvasMutations.push({
                        event: e,
                        mutation: d,
                    });
                }
                else {
                    const target = this.mirror.getNode(d.id);
                    if (!target) {
                        return this.debugNodeNotFound(d, d.id);
                    }
                    void canvasMutation({
                        event: e,
                        mutation: d,
                        target: target,
                        imageMap: this.imageMap,
                        canvasEventMap: this.canvasEventMap,
                        errorHandler: this.warnCanvasMutationFailed.bind(this),
                    });
                }
                break;
            }
            case IncrementalSource.Font: {
                try {
                    const fontFace = new FontFace(d.family, d.buffer
                        ? new Uint8Array(JSON.parse(d.fontSource))
                        : d.fontSource, d.descriptors);
                    (_c = this.iframe.contentDocument) === null || _c === void 0 ? void 0 : _c.fonts.add(fontFace);
                }
                catch (error) {
                    this.warn(error);
                }
                break;
            }
            case IncrementalSource.Selection: {
                if (isSync) {
                    this.lastSelectionData = d;
                    break;
                }
                this.applySelection(d);
                break;
            }
            case IncrementalSource.AdoptedStyleSheet: {
                if (this.usingVirtualDom)
                    this.adoptedStyleSheets.push(d);
                else
                    this.applyAdoptedStyleSheet(d);
                break;
            }
        }
    }
    applyMutation(d, isSync) {
        if (this.config.useVirtualDom && !this.usingVirtualDom && isSync) {
            this.usingVirtualDom = true;
            buildFromDom(this.iframe.contentDocument, this.mirror, this.virtualDom);
            if (Object.keys(this.legacy_missingNodeRetryMap).length) {
                for (const key in this.legacy_missingNodeRetryMap) {
                    try {
                        const value = this.legacy_missingNodeRetryMap[key];
                        const virtualNode = buildFromNode(value.node, this.virtualDom, this.mirror);
                        if (virtualNode)
                            value.node = virtualNode;
                    }
                    catch (error) {
                        this.warn(error);
                    }
                }
            }
        }
        const mirror = this.usingVirtualDom ? this.virtualDom.mirror : this.mirror;
        d.removes = d.removes.filter((mutation) => {
            if (!mirror.getNode(mutation.id)) {
                this.warnNodeNotFound(d, mutation.id);
                return false;
            }
            return true;
        });
        d.removes.forEach((mutation) => {
            var _a;
            const target = mirror.getNode(mutation.id);
            if (!target) {
                return;
            }
            let parent = mirror.getNode(mutation.parentId);
            if (!parent) {
                return this.warnNodeNotFound(d, mutation.parentId);
            }
            if (mutation.isShadow && hasShadowRoot(parent)) {
                parent = parent.shadowRoot;
            }
            mirror.removeNodeFromMap(target);
            if (parent)
                try {
                    parent.removeChild(target);
                    if (this.usingVirtualDom &&
                        target.nodeName === '#text' &&
                        parent.nodeName === 'STYLE' &&
                        ((_a = parent.rules) === null || _a === void 0 ? void 0 : _a.length) > 0)
                        parent.rules = [];
                }
                catch (error) {
                    if (error instanceof DOMException) {
                        this.warn('parent could not remove child in mutation', parent, target, d);
                    }
                    else {
                        throw error;
                    }
                }
        });
        const legacy_missingNodeMap = Object.assign({}, this.legacy_missingNodeRetryMap);
        const queue = [];
        const nextNotInDOM = (mutation) => {
            let next = null;
            if (mutation.nextId) {
                next = mirror.getNode(mutation.nextId);
            }
            if (mutation.nextId !== null &&
                mutation.nextId !== undefined &&
                mutation.nextId !== -1 &&
                !next) {
                return true;
            }
            return false;
        };
        const appendNode = (mutation) => {
            var _a, _b;
            if (!this.iframe.contentDocument) {
                return this.warn('Looks like your replayer has been destroyed.');
            }
            let parent = mirror.getNode(mutation.parentId);
            if (!parent) {
                if (mutation.node.type === NodeType$2.Document) {
                    return this.newDocumentQueue.push(mutation);
                }
                return queue.push(mutation);
            }
            if (mutation.node.isShadow) {
                if (!hasShadowRoot(parent)) {
                    parent.attachShadow({ mode: 'open' });
                    parent = parent.shadowRoot;
                }
                else
                    parent = parent.shadowRoot;
            }
            let previous = null;
            let next = null;
            if (mutation.previousId) {
                previous = mirror.getNode(mutation.previousId);
            }
            if (mutation.nextId) {
                next = mirror.getNode(mutation.nextId);
            }
            if (nextNotInDOM(mutation)) {
                return queue.push(mutation);
            }
            if (mutation.node.rootId && !mirror.getNode(mutation.node.rootId)) {
                return;
            }
            const targetDoc = mutation.node.rootId
                ? mirror.getNode(mutation.node.rootId)
                : this.usingVirtualDom
                    ? this.virtualDom
                    : this.iframe.contentDocument;
            if (isSerializedIframe(parent, mirror)) {
                this.attachDocumentToIframe(mutation, parent);
                return;
            }
            const afterAppend = (node, id) => {
                if (this.usingVirtualDom)
                    return;
                for (const plugin of this.config.plugins || []) {
                    if (plugin.onBuild)
                        plugin.onBuild(node, { id, replayer: this });
                }
            };
            const target = buildNodeWithSN(mutation.node, {
                doc: targetDoc,
                mirror: mirror,
                skipChild: true,
                hackCss: true,
                cache: this.cache,
                afterAppend,
            });
            if (mutation.previousId === -1 || mutation.nextId === -1) {
                legacy_missingNodeMap[mutation.node.id] = {
                    node: target,
                    mutation,
                };
                return;
            }
            const parentSn = mirror.getMeta(parent);
            if (parentSn &&
                parentSn.type === NodeType$2.Element &&
                parentSn.tagName === 'textarea' &&
                mutation.node.type === NodeType$2.Text) {
                const childNodeArray = Array.isArray(parent.childNodes)
                    ? parent.childNodes
                    : Array.from(parent.childNodes);
                for (const c of childNodeArray) {
                    if (c.nodeType === parent.TEXT_NODE) {
                        parent.removeChild(c);
                    }
                }
            }
            else if ((parentSn === null || parentSn === void 0 ? void 0 : parentSn.type) === NodeType$2.Document) {
                const parentDoc = parent;
                if (mutation.node.type === NodeType$2.DocumentType &&
                    ((_a = parentDoc.childNodes[0]) === null || _a === void 0 ? void 0 : _a.nodeType) === Node.DOCUMENT_TYPE_NODE)
                    parentDoc.removeChild(parentDoc.childNodes[0]);
                if (target.nodeName === 'HTML' && parentDoc.documentElement)
                    parentDoc.removeChild(parentDoc.documentElement);
            }
            if (previous && previous.nextSibling && previous.nextSibling.parentNode) {
                parent.insertBefore(target, previous.nextSibling);
            }
            else if (next && next.parentNode) {
                parent.contains(next)
                    ? parent.insertBefore(target, next)
                    : parent.insertBefore(target, null);
            }
            else {
                parent.appendChild(target);
            }
            afterAppend(target, mutation.node.id);
            if (this.usingVirtualDom &&
                target.nodeName === '#text' &&
                parent.nodeName === 'STYLE' &&
                ((_b = parent.rules) === null || _b === void 0 ? void 0 : _b.length) > 0)
                parent.rules = [];
            if (isSerializedIframe(target, this.mirror)) {
                const targetId = this.mirror.getId(target);
                const mutationInQueue = this.newDocumentQueue.find((m) => m.parentId === targetId);
                if (mutationInQueue) {
                    this.attachDocumentToIframe(mutationInQueue, target);
                    this.newDocumentQueue = this.newDocumentQueue.filter((m) => m !== mutationInQueue);
                }
            }
            if (mutation.previousId || mutation.nextId) {
                this.legacy_resolveMissingNode(legacy_missingNodeMap, parent, target, mutation);
            }
        };
        d.adds.forEach((mutation) => {
            appendNode(mutation);
        });
        const startTime = Date.now();
        while (queue.length) {
            const resolveTrees = queueToResolveTrees(queue);
            queue.length = 0;
            if (Date.now() - startTime > 500) {
                this.warn('Timeout in the loop, please check the resolve tree data:', resolveTrees);
                break;
            }
            for (const tree of resolveTrees) {
                const parent = mirror.getNode(tree.value.parentId);
                if (!parent) {
                    this.debug('Drop resolve tree since there is no parent for the root node.', tree);
                }
                else {
                    iterateResolveTree(tree, (mutation) => {
                        appendNode(mutation);
                    });
                }
            }
        }
        if (Object.keys(legacy_missingNodeMap).length) {
            Object.assign(this.legacy_missingNodeRetryMap, legacy_missingNodeMap);
        }
        uniqueTextMutations(d.texts).forEach((mutation) => {
            var _a;
            const target = mirror.getNode(mutation.id);
            if (!target) {
                if (d.removes.find((r) => r.id === mutation.id)) {
                    return;
                }
                return this.warnNodeNotFound(d, mutation.id);
            }
            target.textContent = mutation.value;
            if (this.usingVirtualDom) {
                const parent = target.parentNode;
                if (((_a = parent === null || parent === void 0 ? void 0 : parent.rules) === null || _a === void 0 ? void 0 : _a.length) > 0)
                    parent.rules = [];
            }
        });
        d.attributes.forEach((mutation) => {
            var _a;
            const target = mirror.getNode(mutation.id);
            if (!target) {
                if (d.removes.find((r) => r.id === mutation.id)) {
                    return;
                }
                return this.warnNodeNotFound(d, mutation.id);
            }
            for (const attributeName in mutation.attributes) {
                if (typeof attributeName === 'string') {
                    const value = mutation.attributes[attributeName];
                    if (value === null) {
                        target.removeAttribute(attributeName);
                    }
                    else if (typeof value === 'string') {
                        try {
                            if (attributeName === '_cssText' &&
                                (target.nodeName === 'LINK' || target.nodeName === 'STYLE')) {
                                try {
                                    const newSn = mirror.getMeta(target);
                                    Object.assign(newSn.attributes, mutation.attributes);
                                    const newNode = buildNodeWithSN(newSn, {
                                        doc: target.ownerDocument,
                                        mirror: mirror,
                                        skipChild: true,
                                        hackCss: true,
                                        cache: this.cache,
                                    });
                                    const siblingNode = target.nextSibling;
                                    const parentNode = target.parentNode;
                                    if (newNode && parentNode) {
                                        parentNode.removeChild(target);
                                        parentNode.insertBefore(newNode, siblingNode);
                                        mirror.replace(mutation.id, newNode);
                                        break;
                                    }
                                }
                                catch (e) {
                                }
                            }
                            if (attributeName === 'value' && target.nodeName === 'TEXTAREA') {
                                const textarea = target;
                                textarea.childNodes.forEach((c) => textarea.removeChild(c));
                                const tn = (_a = target.ownerDocument) === null || _a === void 0 ? void 0 : _a.createTextNode(value);
                                if (tn) {
                                    textarea.appendChild(tn);
                                }
                            }
                            else {
                                target.setAttribute(attributeName, value);
                            }
                        }
                        catch (error) {
                            this.warn('An error occurred may due to the checkout feature.', error);
                        }
                    }
                    else if (attributeName === 'style') {
                        const styleValues = value;
                        const targetEl = target;
                        for (const s in styleValues) {
                            if (styleValues[s] === false) {
                                targetEl.style.removeProperty(s);
                            }
                            else if (styleValues[s] instanceof Array) {
                                const svp = styleValues[s];
                                targetEl.style.setProperty(s, svp[0], svp[1]);
                            }
                            else {
                                const svs = styleValues[s];
                                targetEl.style.setProperty(s, svs);
                            }
                        }
                    }
                }
            }
        });
    }
    applyScroll(d, isSync) {
        var _a, _b;
        const target = this.mirror.getNode(d.id);
        if (!target) {
            return this.debugNodeNotFound(d, d.id);
        }
        const sn = this.mirror.getMeta(target);
        if (target === this.iframe.contentDocument) {
            (_a = this.iframe.contentWindow) === null || _a === void 0 ? void 0 : _a.scrollTo({
                top: d.y,
                left: d.x,
                behavior: isSync ? 'auto' : 'smooth',
            });
        }
        else if ((sn === null || sn === void 0 ? void 0 : sn.type) === NodeType$2.Document) {
            (_b = target.defaultView) === null || _b === void 0 ? void 0 : _b.scrollTo({
                top: d.y,
                left: d.x,
                behavior: isSync ? 'auto' : 'smooth',
            });
        }
        else {
            try {
                target.scrollTo({
                    top: d.y,
                    left: d.x,
                    behavior: isSync ? 'auto' : 'smooth',
                });
            }
            catch (error) {
            }
        }
    }
    applyInput(d) {
        const target = this.mirror.getNode(d.id);
        if (!target) {
            return this.debugNodeNotFound(d, d.id);
        }
        try {
            target.checked = d.isChecked;
            target.value = d.text;
        }
        catch (error) {
        }
    }
    applySelection(d) {
        try {
            const selectionSet = new Set();
            const ranges = d.ranges.map(({ start, startOffset, end, endOffset }) => {
                const startContainer = this.mirror.getNode(start);
                const endContainer = this.mirror.getNode(end);
                if (!startContainer || !endContainer)
                    return;
                const result = new Range();
                result.setStart(startContainer, startOffset);
                result.setEnd(endContainer, endOffset);
                const doc = startContainer.ownerDocument;
                const selection = doc === null || doc === void 0 ? void 0 : doc.getSelection();
                selection && selectionSet.add(selection);
                return {
                    range: result,
                    selection,
                };
            });
            selectionSet.forEach((s) => s.removeAllRanges());
            ranges.forEach((r) => { var _a; return r && ((_a = r.selection) === null || _a === void 0 ? void 0 : _a.addRange(r.range)); });
        }
        catch (error) {
        }
    }
    applyStyleSheetMutation(data) {
        var _a;
        let styleSheet = null;
        if (data.styleId)
            styleSheet = this.styleMirror.getStyle(data.styleId);
        else if (data.id)
            styleSheet =
                ((_a = this.mirror.getNode(data.id)) === null || _a === void 0 ? void 0 : _a.sheet) || null;
        if (!styleSheet)
            return;
        if (data.source === IncrementalSource.StyleSheetRule)
            this.applyStyleSheetRule(data, styleSheet);
        else if (data.source === IncrementalSource.StyleDeclaration)
            this.applyStyleDeclaration(data, styleSheet);
    }
    applyStyleSheetRule(data, styleSheet) {
        var _a, _b, _c, _d;
        (_a = data.adds) === null || _a === void 0 ? void 0 : _a.forEach(({ rule, index: nestedIndex }) => {
            try {
                if (Array.isArray(nestedIndex)) {
                    const { positions, index } = getPositionsAndIndex(nestedIndex);
                    const nestedRule = getNestedRule(styleSheet.cssRules, positions);
                    nestedRule.insertRule(rule, index);
                }
                else {
                    const index = nestedIndex === undefined
                        ? undefined
                        : Math.min(nestedIndex, styleSheet.cssRules.length);
                    styleSheet === null || styleSheet === void 0 ? void 0 : styleSheet.insertRule(rule, index);
                }
            }
            catch (e) {
            }
        });
        (_b = data.removes) === null || _b === void 0 ? void 0 : _b.forEach(({ index: nestedIndex }) => {
            try {
                if (Array.isArray(nestedIndex)) {
                    const { positions, index } = getPositionsAndIndex(nestedIndex);
                    const nestedRule = getNestedRule(styleSheet.cssRules, positions);
                    nestedRule.deleteRule(index || 0);
                }
                else {
                    styleSheet === null || styleSheet === void 0 ? void 0 : styleSheet.deleteRule(nestedIndex);
                }
            }
            catch (e) {
            }
        });
        if (data.replace)
            try {
                void ((_c = styleSheet.replace) === null || _c === void 0 ? void 0 : _c.call(styleSheet, data.replace));
            }
            catch (e) {
            }
        if (data.replaceSync)
            try {
                (_d = styleSheet.replaceSync) === null || _d === void 0 ? void 0 : _d.call(styleSheet, data.replaceSync);
            }
            catch (e) {
            }
    }
    applyStyleDeclaration(data, styleSheet) {
        if (data.set) {
            const rule = getNestedRule(styleSheet.rules, data.index);
            rule.style.setProperty(data.set.property, data.set.value, data.set.priority);
        }
        if (data.remove) {
            const rule = getNestedRule(styleSheet.rules, data.index);
            rule.style.removeProperty(data.remove.property);
        }
    }
    applyAdoptedStyleSheet(data) {
        var _a;
        const targetHost = this.mirror.getNode(data.id);
        if (!targetHost)
            return;
        (_a = data.styles) === null || _a === void 0 ? void 0 : _a.forEach((style) => {
            var _a;
            let newStyleSheet = null;
            let hostWindow = null;
            if (hasShadowRoot(targetHost))
                hostWindow = ((_a = targetHost.ownerDocument) === null || _a === void 0 ? void 0 : _a.defaultView) || null;
            else if (targetHost.nodeName === '#document')
                hostWindow = targetHost.defaultView;
            if (!hostWindow)
                return;
            try {
                newStyleSheet = new hostWindow.CSSStyleSheet();
                this.styleMirror.add(newStyleSheet, style.styleId);
                this.applyStyleSheetRule({
                    source: IncrementalSource.StyleSheetRule,
                    adds: style.rules,
                }, newStyleSheet);
            }
            catch (e) {
            }
        });
        const MAX_RETRY_TIME = 10;
        let count = 0;
        const adoptStyleSheets = (targetHost, styleIds) => {
            const stylesToAdopt = styleIds
                .map((styleId) => this.styleMirror.getStyle(styleId))
                .filter((style) => style !== null);
            if (hasShadowRoot(targetHost))
                targetHost.shadowRoot.adoptedStyleSheets =
                    stylesToAdopt;
            else if (targetHost.nodeName === '#document')
                targetHost.adoptedStyleSheets = stylesToAdopt;
            if (stylesToAdopt.length !== styleIds.length && count < MAX_RETRY_TIME) {
                setTimeout(() => adoptStyleSheets(targetHost, styleIds), 0 + 100 * count);
                count++;
            }
        };
        adoptStyleSheets(targetHost, data.styleIds);
    }
    legacy_resolveMissingNode(map, parent, target, targetMutation) {
        const { previousId, nextId } = targetMutation;
        const previousInMap = previousId && map[previousId];
        const nextInMap = nextId && map[nextId];
        if (previousInMap) {
            const { node, mutation } = previousInMap;
            parent.insertBefore(node, target);
            delete map[mutation.node.id];
            delete this.legacy_missingNodeRetryMap[mutation.node.id];
            if (mutation.previousId || mutation.nextId) {
                this.legacy_resolveMissingNode(map, parent, node, mutation);
            }
        }
        if (nextInMap) {
            const { node, mutation } = nextInMap;
            parent.insertBefore(node, target.nextSibling);
            delete map[mutation.node.id];
            delete this.legacy_missingNodeRetryMap[mutation.node.id];
            if (mutation.previousId || mutation.nextId) {
                this.legacy_resolveMissingNode(map, parent, node, mutation);
            }
        }
    }
    moveAndHover(x, y, id, isSync, debugData) {
        const target = this.mirror.getNode(id);
        if (!target) {
            return this.debugNodeNotFound(debugData, id);
        }
        const base = getBaseDimension(target, this.iframe);
        const _x = x * base.absoluteScale + base.x;
        const _y = y * base.absoluteScale + base.y;
        this.mouse.style.left = `${_x}px`;
        this.mouse.style.top = `${_y}px`;
        if (!isSync) {
            this.drawMouseTail({ x: _x, y: _y });
        }
        this.hoverElements(target);
    }
    drawMouseTail(position) {
        if (!this.mouseTail) {
            return;
        }
        const { lineCap, lineWidth, strokeStyle, duration } = this.config.mouseTail === true
            ? defaultMouseTailConfig
            : Object.assign({}, defaultMouseTailConfig, this.config.mouseTail);
        const draw = () => {
            if (!this.mouseTail) {
                return;
            }
            const ctx = this.mouseTail.getContext('2d');
            if (!ctx || !this.tailPositions.length) {
                return;
            }
            ctx.clearRect(0, 0, this.mouseTail.width, this.mouseTail.height);
            ctx.beginPath();
            ctx.lineWidth = lineWidth;
            ctx.lineCap = lineCap;
            ctx.strokeStyle = strokeStyle;
            ctx.moveTo(this.tailPositions[0].x, this.tailPositions[0].y);
            this.tailPositions.forEach((p) => ctx.lineTo(p.x, p.y));
            ctx.stroke();
        };
        this.tailPositions.push(position);
        draw();
        setTimeout(() => {
            this.tailPositions = this.tailPositions.filter((p) => p !== position);
            draw();
        }, duration / this.speedService.state.context.timer.speed);
    }
    hoverElements(el) {
        var _a;
        (_a = (this.lastHoveredRootNode || this.iframe.contentDocument)) === null || _a === void 0 ? void 0 : _a.querySelectorAll('.\\:hover').forEach((hoveredEl) => {
            hoveredEl.classList.remove(':hover');
        });
        this.lastHoveredRootNode = el.getRootNode();
        let currentEl = el;
        while (currentEl) {
            if (currentEl.classList) {
                currentEl.classList.add(':hover');
            }
            currentEl = currentEl.parentElement;
        }
    }
    isUserInteraction(event) {
        if (event.type !== EventType.IncrementalSnapshot) {
            return false;
        }
        return (event.data.source > IncrementalSource.Mutation &&
            event.data.source <= IncrementalSource.Input);
    }
    backToNormal() {
        this.nextUserInteractionEvent = null;
        if (this.speedService.state.matches('normal')) {
            return;
        }
        this.speedService.send({ type: 'BACK_TO_NORMAL' });
        this.emitter.emit(ReplayerEvents.SkipEnd, {
            speed: this.speedService.state.context.normalSpeed,
        });
    }
    warnNodeNotFound(d, id) {
        this.warn(`Node with id '${id}' not found. `, d);
    }
    warnCanvasMutationFailed(d, error) {
        this.warn(`Has error on canvas update`, error, 'canvas mutation:', d);
    }
    debugNodeNotFound(d, id) {
        this.debug(`Node with id '${id}' not found. `, d);
    }
    warn(...args) {
        if (!this.config.showWarning) {
            return;
        }
        this.config.logger.warn(REPLAY_CONSOLE_PREFIX, ...args);
    }
    debug(...args) {
        if (!this.config.showDebug) {
            return;
        }
        this.config.logger.log(REPLAY_CONSOLE_PREFIX, ...args);
    }
}

const { addCustomEvent } = record;
const { freezePage } = record;

// DEFLATE is a complex format; to read this code, you should probably check the RFC first:

// aliases for shorter compressed code (most minifers don't do this)
var u8 = Uint8Array, u16 = Uint16Array, u32 = Uint32Array;
// fixed length extra bits
var fleb = new u8([0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0, /* unused */ 0, 0, /* impossible */ 0]);
// fixed distance extra bits
// see fleb note
var fdeb = new u8([0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13, /* unused */ 0, 0]);
// code length index map
var clim = new u8([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]);
// get base, reverse index map from extra bits
var freb = function (eb, start) {
    var b = new u16(31);
    for (var i = 0; i < 31; ++i) {
        b[i] = start += 1 << eb[i - 1];
    }
    // numbers here are at max 18 bits
    var r = new u32(b[30]);
    for (var i = 1; i < 30; ++i) {
        for (var j = b[i]; j < b[i + 1]; ++j) {
            r[j] = ((j - b[i]) << 5) | i;
        }
    }
    return [b, r];
};
var _a = freb(fleb, 2), fl = _a[0], revfl = _a[1];
// we can ignore the fact that the other numbers are wrong; they never happen anyway
fl[28] = 258, revfl[258] = 28;
var _b = freb(fdeb, 0), fd = _b[0], revfd = _b[1];
// map of value to reverse (assuming 16 bits)
var rev = new u16(32768);
for (var i = 0; i < 32768; ++i) {
    // reverse table algorithm from SO
    var x = ((i & 0xAAAA) >>> 1) | ((i & 0x5555) << 1);
    x = ((x & 0xCCCC) >>> 2) | ((x & 0x3333) << 2);
    x = ((x & 0xF0F0) >>> 4) | ((x & 0x0F0F) << 4);
    rev[i] = (((x & 0xFF00) >>> 8) | ((x & 0x00FF) << 8)) >>> 1;
}
// create huffman tree from u8 "map": index -> code length for code index
// mb (max bits) must be at most 15
// TODO: optimize/split up?
var hMap = (function (cd, mb, r) {
    var s = cd.length;
    // index
    var i = 0;
    // u16 "map": index -> # of codes with bit length = index
    var l = new u16(mb);
    // length of cd must be 288 (total # of codes)
    for (; i < s; ++i)
        ++l[cd[i] - 1];
    // u16 "map": index -> minimum code for bit length = index
    var le = new u16(mb);
    for (i = 0; i < mb; ++i) {
        le[i] = (le[i - 1] + l[i - 1]) << 1;
    }
    var co;
    if (r) {
        // u16 "map": index -> number of actual bits, symbol for code
        co = new u16(1 << mb);
        // bits to remove for reverser
        var rvb = 15 - mb;
        for (i = 0; i < s; ++i) {
            // ignore 0 lengths
            if (cd[i]) {
                // num encoding both symbol and bits read
                var sv = (i << 4) | cd[i];
                // free bits
                var r_1 = mb - cd[i];
                // start value
                var v = le[cd[i] - 1]++ << r_1;
                // m is end value
                for (var m = v | ((1 << r_1) - 1); v <= m; ++v) {
                    // every 16 bit value starting with the code yields the same result
                    co[rev[v] >>> rvb] = sv;
                }
            }
        }
    }
    else {
        co = new u16(s);
        for (i = 0; i < s; ++i)
            co[i] = rev[le[cd[i] - 1]++] >>> (15 - cd[i]);
    }
    return co;
});
// fixed length tree
var flt = new u8(288);
for (var i = 0; i < 144; ++i)
    flt[i] = 8;
for (var i = 144; i < 256; ++i)
    flt[i] = 9;
for (var i = 256; i < 280; ++i)
    flt[i] = 7;
for (var i = 280; i < 288; ++i)
    flt[i] = 8;
// fixed distance tree
var fdt = new u8(32);
for (var i = 0; i < 32; ++i)
    fdt[i] = 5;
// fixed length map
var flm = /*#__PURE__*/ hMap(flt, 9, 0), flrm = /*#__PURE__*/ hMap(flt, 9, 1);
// fixed distance map
var fdm = /*#__PURE__*/ hMap(fdt, 5, 0), fdrm = /*#__PURE__*/ hMap(fdt, 5, 1);
// find max of array
var max = function (a) {
    var m = a[0];
    for (var i = 1; i < a.length; ++i) {
        if (a[i] > m)
            m = a[i];
    }
    return m;
};
// read d, starting at bit p and mask with m
var bits = function (d, p, m) {
    var o = (p / 8) >> 0;
    return ((d[o] | (d[o + 1] << 8)) >>> (p & 7)) & m;
};
// read d, starting at bit p continuing for at least 16 bits
var bits16 = function (d, p) {
    var o = (p / 8) >> 0;
    return ((d[o] | (d[o + 1] << 8) | (d[o + 2] << 16)) >>> (p & 7));
};
// get end of byte
var shft = function (p) { return ((p / 8) >> 0) + (p & 7 && 1); };
// typed array slice - allows garbage collector to free original reference,
// while being more compatible than .slice
var slc = function (v, s, e) {
    if (s == null || s < 0)
        s = 0;
    if (e == null || e > v.length)
        e = v.length;
    // can't use .constructor in case user-supplied
    var n = new (v instanceof u16 ? u16 : v instanceof u32 ? u32 : u8)(e - s);
    n.set(v.subarray(s, e));
    return n;
};
// expands raw DEFLATE data
var inflt = function (dat, buf, st) {
    // source length
    var sl = dat.length;
    // have to estimate size
    var noBuf = !buf || st;
    // no state
    var noSt = !st || st.i;
    if (!st)
        st = {};
    // Assumes roughly 33% compression ratio average
    if (!buf)
        buf = new u8(sl * 3);
    // ensure buffer can fit at least l elements
    var cbuf = function (l) {
        var bl = buf.length;
        // need to increase size to fit
        if (l > bl) {
            // Double or set to necessary, whichever is greater
            var nbuf = new u8(Math.max(bl * 2, l));
            nbuf.set(buf);
            buf = nbuf;
        }
    };
    //  last chunk         bitpos           bytes
    var final = st.f || 0, pos = st.p || 0, bt = st.b || 0, lm = st.l, dm = st.d, lbt = st.m, dbt = st.n;
    // total bits
    var tbts = sl * 8;
    do {
        if (!lm) {
            // BFINAL - this is only 1 when last chunk is next
            st.f = final = bits(dat, pos, 1);
            // type: 0 = no compression, 1 = fixed huffman, 2 = dynamic huffman
            var type = bits(dat, pos + 1, 3);
            pos += 3;
            if (!type) {
                // go to end of byte boundary
                var s = shft(pos) + 4, l = dat[s - 4] | (dat[s - 3] << 8), t = s + l;
                if (t > sl) {
                    if (noSt)
                        throw 'unexpected EOF';
                    break;
                }
                // ensure size
                if (noBuf)
                    cbuf(bt + l);
                // Copy over uncompressed data
                buf.set(dat.subarray(s, t), bt);
                // Get new bitpos, update byte count
                st.b = bt += l, st.p = pos = t * 8;
                continue;
            }
            else if (type == 1)
                lm = flrm, dm = fdrm, lbt = 9, dbt = 5;
            else if (type == 2) {
                //  literal                            lengths
                var hLit = bits(dat, pos, 31) + 257, hcLen = bits(dat, pos + 10, 15) + 4;
                var tl = hLit + bits(dat, pos + 5, 31) + 1;
                pos += 14;
                // length+distance tree
                var ldt = new u8(tl);
                // code length tree
                var clt = new u8(19);
                for (var i = 0; i < hcLen; ++i) {
                    // use index map to get real code
                    clt[clim[i]] = bits(dat, pos + i * 3, 7);
                }
                pos += hcLen * 3;
                // code lengths bits
                var clb = max(clt), clbmsk = (1 << clb) - 1;
                if (!noSt && pos + tl * (clb + 7) > tbts)
                    break;
                // code lengths map
                var clm = hMap(clt, clb, 1);
                for (var i = 0; i < tl;) {
                    var r = clm[bits(dat, pos, clbmsk)];
                    // bits read
                    pos += r & 15;
                    // symbol
                    var s = r >>> 4;
                    // code length to copy
                    if (s < 16) {
                        ldt[i++] = s;
                    }
                    else {
                        //  copy   count
                        var c = 0, n = 0;
                        if (s == 16)
                            n = 3 + bits(dat, pos, 3), pos += 2, c = ldt[i - 1];
                        else if (s == 17)
                            n = 3 + bits(dat, pos, 7), pos += 3;
                        else if (s == 18)
                            n = 11 + bits(dat, pos, 127), pos += 7;
                        while (n--)
                            ldt[i++] = c;
                    }
                }
                //    length tree                 distance tree
                var lt = ldt.subarray(0, hLit), dt = ldt.subarray(hLit);
                // max length bits
                lbt = max(lt);
                // max dist bits
                dbt = max(dt);
                lm = hMap(lt, lbt, 1);
                dm = hMap(dt, dbt, 1);
            }
            else
                throw 'invalid block type';
            if (pos > tbts)
                throw 'unexpected EOF';
        }
        // Make sure the buffer can hold this + the largest possible addition
        // Maximum chunk size (practically, theoretically infinite) is 2^17;
        if (noBuf)
            cbuf(bt + 131072);
        var lms = (1 << lbt) - 1, dms = (1 << dbt) - 1;
        var mxa = lbt + dbt + 18;
        while (noSt || pos + mxa < tbts) {
            // bits read, code
            var c = lm[bits16(dat, pos) & lms], sym = c >>> 4;
            pos += c & 15;
            if (pos > tbts)
                throw 'unexpected EOF';
            if (!c)
                throw 'invalid length/literal';
            if (sym < 256)
                buf[bt++] = sym;
            else if (sym == 256) {
                lm = null;
                break;
            }
            else {
                var add = sym - 254;
                // no extra bits needed if less
                if (sym > 264) {
                    // index
                    var i = sym - 257, b = fleb[i];
                    add = bits(dat, pos, (1 << b) - 1) + fl[i];
                    pos += b;
                }
                // dist
                var d = dm[bits16(dat, pos) & dms], dsym = d >>> 4;
                if (!d)
                    throw 'invalid distance';
                pos += d & 15;
                var dt = fd[dsym];
                if (dsym > 3) {
                    var b = fdeb[dsym];
                    dt += bits16(dat, pos) & ((1 << b) - 1), pos += b;
                }
                if (pos > tbts)
                    throw 'unexpected EOF';
                if (noBuf)
                    cbuf(bt + 131072);
                var end = bt + add;
                for (; bt < end; bt += 4) {
                    buf[bt] = buf[bt - dt];
                    buf[bt + 1] = buf[bt + 1 - dt];
                    buf[bt + 2] = buf[bt + 2 - dt];
                    buf[bt + 3] = buf[bt + 3 - dt];
                }
                bt = end;
            }
        }
        st.l = lm, st.p = pos, st.b = bt;
        if (lm)
            final = 1, st.m = lbt, st.d = dm, st.n = dbt;
    } while (!final);
    return bt == buf.length ? buf : slc(buf, 0, bt);
};
// starting at p, write the minimum number of bits that can hold v to d
var wbits = function (d, p, v) {
    v <<= p & 7;
    var o = (p / 8) >> 0;
    d[o] |= v;
    d[o + 1] |= v >>> 8;
};
// starting at p, write the minimum number of bits (>8) that can hold v to d
var wbits16 = function (d, p, v) {
    v <<= p & 7;
    var o = (p / 8) >> 0;
    d[o] |= v;
    d[o + 1] |= v >>> 8;
    d[o + 2] |= v >>> 16;
};
// creates code lengths from a frequency table
var hTree = function (d, mb) {
    // Need extra info to make a tree
    var t = [];
    for (var i = 0; i < d.length; ++i) {
        if (d[i])
            t.push({ s: i, f: d[i] });
    }
    var s = t.length;
    var t2 = t.slice();
    if (!s)
        return [new u8(0), 0];
    if (s == 1) {
        var v = new u8(t[0].s + 1);
        v[t[0].s] = 1;
        return [v, 1];
    }
    t.sort(function (a, b) { return a.f - b.f; });
    // after i2 reaches last ind, will be stopped
    // freq must be greater than largest possible number of symbols
    t.push({ s: -1, f: 25001 });
    var l = t[0], r = t[1], i0 = 0, i1 = 1, i2 = 2;
    t[0] = { s: -1, f: l.f + r.f, l: l, r: r };
    // efficient algorithm from UZIP.js
    // i0 is lookbehind, i2 is lookahead - after processing two low-freq
    // symbols that combined have high freq, will start processing i2 (high-freq,
    // non-composite) symbols instead
    // see https://reddit.com/r/photopea/comments/ikekht/uzipjs_questions/
    while (i1 != s - 1) {
        l = t[t[i0].f < t[i2].f ? i0++ : i2++];
        r = t[i0 != i1 && t[i0].f < t[i2].f ? i0++ : i2++];
        t[i1++] = { s: -1, f: l.f + r.f, l: l, r: r };
    }
    var maxSym = t2[0].s;
    for (var i = 1; i < s; ++i) {
        if (t2[i].s > maxSym)
            maxSym = t2[i].s;
    }
    // code lengths
    var tr = new u16(maxSym + 1);
    // max bits in tree
    var mbt = ln(t[i1 - 1], tr, 0);
    if (mbt > mb) {
        // more algorithms from UZIP.js
        // TODO: find out how this code works (debt)
        //  ind    debt
        var i = 0, dt = 0;
        //    left            cost
        var lft = mbt - mb, cst = 1 << lft;
        t2.sort(function (a, b) { return tr[b.s] - tr[a.s] || a.f - b.f; });
        for (; i < s; ++i) {
            var i2_1 = t2[i].s;
            if (tr[i2_1] > mb) {
                dt += cst - (1 << (mbt - tr[i2_1]));
                tr[i2_1] = mb;
            }
            else
                break;
        }
        dt >>>= lft;
        while (dt > 0) {
            var i2_2 = t2[i].s;
            if (tr[i2_2] < mb)
                dt -= 1 << (mb - tr[i2_2]++ - 1);
            else
                ++i;
        }
        for (; i >= 0 && dt; --i) {
            var i2_3 = t2[i].s;
            if (tr[i2_3] == mb) {
                --tr[i2_3];
                ++dt;
            }
        }
        mbt = mb;
    }
    return [new u8(tr), mbt];
};
// get the max length and assign length codes
var ln = function (n, l, d) {
    return n.s == -1
        ? Math.max(ln(n.l, l, d + 1), ln(n.r, l, d + 1))
        : (l[n.s] = d);
};
// length codes generation
var lc = function (c) {
    var s = c.length;
    // Note that the semicolon was intentional
    while (s && !c[--s])
        ;
    var cl = new u16(++s);
    //  ind      num         streak
    var cli = 0, cln = c[0], cls = 1;
    var w = function (v) { cl[cli++] = v; };
    for (var i = 1; i <= s; ++i) {
        if (c[i] == cln && i != s)
            ++cls;
        else {
            if (!cln && cls > 2) {
                for (; cls > 138; cls -= 138)
                    w(32754);
                if (cls > 2) {
                    w(cls > 10 ? ((cls - 11) << 5) | 28690 : ((cls - 3) << 5) | 12305);
                    cls = 0;
                }
            }
            else if (cls > 3) {
                w(cln), --cls;
                for (; cls > 6; cls -= 6)
                    w(8304);
                if (cls > 2)
                    w(((cls - 3) << 5) | 8208), cls = 0;
            }
            while (cls--)
                w(cln);
            cls = 1;
            cln = c[i];
        }
    }
    return [cl.subarray(0, cli), s];
};
// calculate the length of output from tree, code lengths
var clen = function (cf, cl) {
    var l = 0;
    for (var i = 0; i < cl.length; ++i)
        l += cf[i] * cl[i];
    return l;
};
// writes a fixed block
// returns the new bit pos
var wfblk = function (out, pos, dat) {
    // no need to write 00 as type: TypedArray defaults to 0
    var s = dat.length;
    var o = shft(pos + 2);
    out[o] = s & 255;
    out[o + 1] = s >>> 8;
    out[o + 2] = out[o] ^ 255;
    out[o + 3] = out[o + 1] ^ 255;
    for (var i = 0; i < s; ++i)
        out[o + i + 4] = dat[i];
    return (o + 4 + s) * 8;
};
// writes a block
var wblk = function (dat, out, final, syms, lf, df, eb, li, bs, bl, p) {
    wbits(out, p++, final);
    ++lf[256];
    var _a = hTree(lf, 15), dlt = _a[0], mlb = _a[1];
    var _b = hTree(df, 15), ddt = _b[0], mdb = _b[1];
    var _c = lc(dlt), lclt = _c[0], nlc = _c[1];
    var _d = lc(ddt), lcdt = _d[0], ndc = _d[1];
    var lcfreq = new u16(19);
    for (var i = 0; i < lclt.length; ++i)
        lcfreq[lclt[i] & 31]++;
    for (var i = 0; i < lcdt.length; ++i)
        lcfreq[lcdt[i] & 31]++;
    var _e = hTree(lcfreq, 7), lct = _e[0], mlcb = _e[1];
    var nlcc = 19;
    for (; nlcc > 4 && !lct[clim[nlcc - 1]]; --nlcc)
        ;
    var flen = (bl + 5) << 3;
    var ftlen = clen(lf, flt) + clen(df, fdt) + eb;
    var dtlen = clen(lf, dlt) + clen(df, ddt) + eb + 14 + 3 * nlcc + clen(lcfreq, lct) + (2 * lcfreq[16] + 3 * lcfreq[17] + 7 * lcfreq[18]);
    if (flen <= ftlen && flen <= dtlen)
        return wfblk(out, p, dat.subarray(bs, bs + bl));
    var lm, ll, dm, dl;
    wbits(out, p, 1 + (dtlen < ftlen)), p += 2;
    if (dtlen < ftlen) {
        lm = hMap(dlt, mlb, 0), ll = dlt, dm = hMap(ddt, mdb, 0), dl = ddt;
        var llm = hMap(lct, mlcb, 0);
        wbits(out, p, nlc - 257);
        wbits(out, p + 5, ndc - 1);
        wbits(out, p + 10, nlcc - 4);
        p += 14;
        for (var i = 0; i < nlcc; ++i)
            wbits(out, p + 3 * i, lct[clim[i]]);
        p += 3 * nlcc;
        var lcts = [lclt, lcdt];
        for (var it = 0; it < 2; ++it) {
            var clct = lcts[it];
            for (var i = 0; i < clct.length; ++i) {
                var len = clct[i] & 31;
                wbits(out, p, llm[len]), p += lct[len];
                if (len > 15)
                    wbits(out, p, (clct[i] >>> 5) & 127), p += clct[i] >>> 12;
            }
        }
    }
    else {
        lm = flm, ll = flt, dm = fdm, dl = fdt;
    }
    for (var i = 0; i < li; ++i) {
        if (syms[i] > 255) {
            var len = (syms[i] >>> 18) & 31;
            wbits16(out, p, lm[len + 257]), p += ll[len + 257];
            if (len > 7)
                wbits(out, p, (syms[i] >>> 23) & 31), p += fleb[len];
            var dst = syms[i] & 31;
            wbits16(out, p, dm[dst]), p += dl[dst];
            if (dst > 3)
                wbits16(out, p, (syms[i] >>> 5) & 8191), p += fdeb[dst];
        }
        else {
            wbits16(out, p, lm[syms[i]]), p += ll[syms[i]];
        }
    }
    wbits16(out, p, lm[256]);
    return p + ll[256];
};
// deflate options (nice << 13) | chain
var deo = /*#__PURE__*/ new u32([65540, 131080, 131088, 131104, 262176, 1048704, 1048832, 2114560, 2117632]);
// empty
var et = /*#__PURE__*/ new u8(0);
// compresses data into a raw DEFLATE buffer
var dflt = function (dat, lvl, plvl, pre, post, lst) {
    var s = dat.length;
    var o = new u8(pre + s + 5 * (1 + Math.floor(s / 7000)) + post);
    // writing to this writes to the output buffer
    var w = o.subarray(pre, o.length - post);
    var pos = 0;
    if (!lvl || s < 8) {
        for (var i = 0; i <= s; i += 65535) {
            // end
            var e = i + 65535;
            if (e < s) {
                // write full block
                pos = wfblk(w, pos, dat.subarray(i, e));
            }
            else {
                // write final block
                w[i] = lst;
                pos = wfblk(w, pos, dat.subarray(i, s));
            }
        }
    }
    else {
        var opt = deo[lvl - 1];
        var n = opt >>> 13, c = opt & 8191;
        var msk_1 = (1 << plvl) - 1;
        //    prev 2-byte val map    curr 2-byte val map
        var prev = new u16(32768), head = new u16(msk_1 + 1);
        var bs1_1 = Math.ceil(plvl / 3), bs2_1 = 2 * bs1_1;
        var hsh = function (i) { return (dat[i] ^ (dat[i + 1] << bs1_1) ^ (dat[i + 2] << bs2_1)) & msk_1; };
        // 24576 is an arbitrary number of maximum symbols per block
        // 424 buffer for last block
        var syms = new u32(25000);
        // length/literal freq   distance freq
        var lf = new u16(288), df = new u16(32);
        //  l/lcnt  exbits  index  l/lind  waitdx  bitpos
        var lc_1 = 0, eb = 0, i = 0, li = 0, wi = 0, bs = 0;
        for (; i < s; ++i) {
            // hash value
            var hv = hsh(i);
            // index mod 32768
            var imod = i & 32767;
            // previous index with this value
            var pimod = head[hv];
            prev[imod] = pimod;
            head[hv] = imod;
            // We always should modify head and prev, but only add symbols if
            // this data is not yet processed ("wait" for wait index)
            if (wi <= i) {
                // bytes remaining
                var rem = s - i;
                if ((lc_1 > 7000 || li > 24576) && rem > 423) {
                    pos = wblk(dat, w, 0, syms, lf, df, eb, li, bs, i - bs, pos);
                    li = lc_1 = eb = 0, bs = i;
                    for (var j = 0; j < 286; ++j)
                        lf[j] = 0;
                    for (var j = 0; j < 30; ++j)
                        df[j] = 0;
                }
                //  len    dist   chain
                var l = 2, d = 0, ch_1 = c, dif = (imod - pimod) & 32767;
                if (rem > 2 && hv == hsh(i - dif)) {
                    var maxn = Math.min(n, rem) - 1;
                    var maxd = Math.min(32767, i);
                    // max possible length
                    // not capped at dif because decompressors implement "rolling" index population
                    var ml = Math.min(258, rem);
                    while (dif <= maxd && --ch_1 && imod != pimod) {
                        if (dat[i + l] == dat[i + l - dif]) {
                            var nl = 0;
                            for (; nl < ml && dat[i + nl] == dat[i + nl - dif]; ++nl)
                                ;
                            if (nl > l) {
                                l = nl, d = dif;
                                // break out early when we reach "nice" (we are satisfied enough)
                                if (nl > maxn)
                                    break;
                                // now, find the rarest 2-byte sequence within this
                                // length of literals and search for that instead.
                                // Much faster than just using the start
                                var mmd = Math.min(dif, nl - 2);
                                var md = 0;
                                for (var j = 0; j < mmd; ++j) {
                                    var ti = (i - dif + j + 32768) & 32767;
                                    var pti = prev[ti];
                                    var cd = (ti - pti + 32768) & 32767;
                                    if (cd > md)
                                        md = cd, pimod = ti;
                                }
                            }
                        }
                        // check the previous match
                        imod = pimod, pimod = prev[imod];
                        dif += (imod - pimod + 32768) & 32767;
                    }
                }
                // d will be nonzero only when a match was found
                if (d) {
                    // store both dist and len data in one Uint32
                    // Make sure this is recognized as a len/dist with 28th bit (2^28)
                    syms[li++] = 268435456 | (revfl[l] << 18) | revfd[d];
                    var lin = revfl[l] & 31, din = revfd[d] & 31;
                    eb += fleb[lin] + fdeb[din];
                    ++lf[257 + lin];
                    ++df[din];
                    wi = i + l;
                    ++lc_1;
                }
                else {
                    syms[li++] = dat[i];
                    ++lf[dat[i]];
                }
            }
        }
        pos = wblk(dat, w, lst, syms, lf, df, eb, li, bs, i - bs, pos);
        // this is the easiest way to avoid needing to maintain state
        if (!lst)
            pos = wfblk(w, pos, et);
    }
    return slc(o, 0, pre + shft(pos) + post);
};
// Alder32
var adler = function () {
    var a = 1, b = 0;
    return {
        p: function (d) {
            // closures have awful performance
            var n = a, m = b;
            var l = d.length;
            for (var i = 0; i != l;) {
                var e = Math.min(i + 5552, l);
                for (; i < e; ++i)
                    n += d[i], m += n;
                n %= 65521, m %= 65521;
            }
            a = n, b = m;
        },
        d: function () { return ((a >>> 8) << 16 | (b & 255) << 8 | (b >>> 8)) + ((a & 255) << 23) * 2; }
    };
};
// deflate with opts
var dopt = function (dat, opt, pre, post, st) {
    return dflt(dat, opt.level == null ? 6 : opt.level, opt.mem == null ? Math.ceil(Math.max(8, Math.min(13, Math.log(dat.length))) * 1.5) : (12 + opt.mem), pre, post, !st);
};
// write bytes
var wbytes = function (d, b, v) {
    for (; v; ++b)
        d[b] = v, v >>>= 8;
};
// zlib header
var zlh = function (c, o) {
    var lv = o.level, fl = lv == 0 ? 0 : lv < 6 ? 1 : lv == 9 ? 3 : 2;
    c[0] = 120, c[1] = (fl << 6) | (fl ? (32 - 2 * fl) : 1);
};
// zlib valid
var zlv = function (d) {
    if ((d[0] & 15) != 8 || (d[0] >>> 4) > 7 || ((d[0] << 8 | d[1]) % 31))
        throw 'invalid zlib data';
    if (d[1] & 32)
        throw 'invalid zlib data: preset dictionaries not supported';
};
/**
 * Compress data with Zlib
 * @param data The data to compress
 * @param opts The compression options
 * @returns The zlib-compressed version of the data
 */
function zlibSync(data, opts) {
    if (opts === void 0) { opts = {}; }
    var a = adler();
    a.p(data);
    var d = dopt(data, opts, 2, 4);
    return zlh(d, opts), wbytes(d, d.length - 4, a.d()), d;
}
/**
 * Expands Zlib data
 * @param data The data to decompress
 * @param out Where to write the data. Saves memory if you know the decompressed size and provide an output buffer of that length.
 * @returns The decompressed version of the data
 */
function unzlibSync(data, out) {
    return inflt((zlv(data), data.subarray(2, -4)), out);
}
/**
 * Converts a string into a Uint8Array for use with compression/decompression methods
 * @param str The string to encode
 * @param latin1 Whether or not to interpret the data as Latin-1. This should
 *               not need to be true unless decoding a binary string.
 * @returns The string encoded in UTF-8/Latin-1 binary
 */
function strToU8(str, latin1) {
    var l = str.length;
    if (!latin1 && typeof TextEncoder != 'undefined')
        return new TextEncoder().encode(str);
    var ar = new u8(str.length + (str.length >>> 1));
    var ai = 0;
    var w = function (v) { ar[ai++] = v; };
    for (var i = 0; i < l; ++i) {
        if (ai + 5 > ar.length) {
            var n = new u8(ai + 8 + ((l - i) << 1));
            n.set(ar);
            ar = n;
        }
        var c = str.charCodeAt(i);
        if (c < 128 || latin1)
            w(c);
        else if (c < 2048)
            w(192 | (c >>> 6)), w(128 | (c & 63));
        else if (c > 55295 && c < 57344)
            c = 65536 + (c & 1023 << 10) | (str.charCodeAt(++i) & 1023),
                w(240 | (c >>> 18)), w(128 | ((c >>> 12) & 63)), w(128 | ((c >>> 6) & 63)), w(128 | (c & 63));
        else
            w(224 | (c >>> 12)), w(128 | ((c >>> 6) & 63)), w(128 | (c & 63));
    }
    return slc(ar, 0, ai);
}
/**
 * Converts a Uint8Array to a string
 * @param dat The data to decode to string
 * @param latin1 Whether or not to interpret the data as Latin-1. This should
 *               not need to be true unless encoding to binary string.
 * @returns The original UTF-8/Latin-1 string
 */
function strFromU8(dat, latin1) {
    var r = '';
    if (!latin1 && typeof TextDecoder != 'undefined')
        return new TextDecoder().decode(dat);
    for (var i = 0; i < dat.length;) {
        var c = dat[i++];
        if (c < 128 || latin1)
            r += String.fromCharCode(c);
        else if (c < 224)
            r += String.fromCharCode((c & 31) << 6 | (dat[i++] & 63));
        else if (c < 240)
            r += String.fromCharCode((c & 15) << 12 | (dat[i++] & 63) << 6 | (dat[i++] & 63));
        else
            c = ((c & 15) << 18 | (dat[i++] & 63) << 12 | (dat[i++] & 63) << 6 | (dat[i++] & 63)) - 65536,
                r += String.fromCharCode(55296 | (c >> 10), 56320 | (c & 1023));
    }
    return r;
}

const MARK = 'v1';

const pack = (event) => {
    const _e = Object.assign(Object.assign({}, event), { v: MARK });
    return strFromU8(zlibSync(strToU8(JSON.stringify(_e))), true);
};

const unpack = (raw) => {
    if (typeof raw !== 'string') {
        return raw;
    }
    try {
        const e = JSON.parse(raw);
        if (e.timestamp) {
            return e;
        }
    }
    catch (error) {
    }
    try {
        const e = JSON.parse(strFromU8(unzlibSync(strToU8(raw, true))));
        if (e.v === MARK) {
            return e;
        }
        throw new Error(`These events were packed with packer ${e.v} which is incompatible with current packer ${MARK}.`);
    }
    catch (error) {
        console.error(error);
        throw new Error('Unknown data format.');
    }
};

class StackFrame {
    constructor(obj) {
        this.fileName = obj.fileName || '';
        this.functionName = obj.functionName || '';
        this.lineNumber = obj.lineNumber;
        this.columnNumber = obj.columnNumber;
    }
    toString() {
        const lineNumber = this.lineNumber || '';
        const columnNumber = this.columnNumber || '';
        if (this.functionName)
            return `${this.functionName} (${this.fileName}:${lineNumber}:${columnNumber})`;
        return `${this.fileName}:${lineNumber}:${columnNumber}`;
    }
}
const FIREFOX_SAFARI_STACK_REGEXP = /(^|@)\S+:\d+/;
const CHROME_IE_STACK_REGEXP = /^\s*at .*(\S+:\d+|\(native\))/m;
const SAFARI_NATIVE_CODE_REGEXP = /^(eval@)?(\[native code])?$/;
const ErrorStackParser = {
    parse: function (error) {
        if (!error) {
            return [];
        }
        if (typeof error.stacktrace !== 'undefined' ||
            typeof error['opera#sourceloc'] !== 'undefined') {
            return this.parseOpera(error);
        }
        else if (error.stack && error.stack.match(CHROME_IE_STACK_REGEXP)) {
            return this.parseV8OrIE(error);
        }
        else if (error.stack) {
            return this.parseFFOrSafari(error);
        }
        else {
            console.warn('[console-record-plugin]: Failed to parse error object:', error);
            return [];
        }
    },
    extractLocation: function (urlLike) {
        if (urlLike.indexOf(':') === -1) {
            return [urlLike];
        }
        const regExp = /(.+?)(?::(\d+))?(?::(\d+))?$/;
        const parts = regExp.exec(urlLike.replace(/[()]/g, ''));
        if (!parts)
            throw new Error(`Cannot parse given url: ${urlLike}`);
        return [parts[1], parts[2] || undefined, parts[3] || undefined];
    },
    parseV8OrIE: function (error) {
        const filtered = error.stack.split('\n').filter(function (line) {
            return !!line.match(CHROME_IE_STACK_REGEXP);
        }, this);
        return filtered.map(function (line) {
            if (line.indexOf('(eval ') > -1) {
                line = line
                    .replace(/eval code/g, 'eval')
                    .replace(/(\(eval at [^()]*)|(\),.*$)/g, '');
            }
            let sanitizedLine = line.replace(/^\s+/, '').replace(/\(eval code/g, '(');
            const location = sanitizedLine.match(/ (\((.+):(\d+):(\d+)\)$)/);
            sanitizedLine = location
                ? sanitizedLine.replace(location[0], '')
                : sanitizedLine;
            const tokens = sanitizedLine.split(/\s+/).slice(1);
            const locationParts = this.extractLocation(location ? location[1] : tokens.pop());
            const functionName = tokens.join(' ') || undefined;
            const fileName = ['eval', '<anonymous>'].indexOf(locationParts[0]) > -1
                ? undefined
                : locationParts[0];
            return new StackFrame({
                functionName,
                fileName,
                lineNumber: locationParts[1],
                columnNumber: locationParts[2],
            });
        }, this);
    },
    parseFFOrSafari: function (error) {
        const filtered = error.stack.split('\n').filter(function (line) {
            return !line.match(SAFARI_NATIVE_CODE_REGEXP);
        }, this);
        return filtered.map(function (line) {
            if (line.indexOf(' > eval') > -1) {
                line = line.replace(/ line (\d+)(?: > eval line \d+)* > eval:\d+:\d+/g, ':$1');
            }
            if (line.indexOf('@') === -1 && line.indexOf(':') === -1) {
                return new StackFrame({
                    functionName: line,
                });
            }
            else {
                const functionNameRegex = /((.*".+"[^@]*)?[^@]*)(?:@)/;
                const matches = line.match(functionNameRegex);
                const functionName = matches && matches[1] ? matches[1] : undefined;
                const locationParts = this.extractLocation(line.replace(functionNameRegex, ''));
                return new StackFrame({
                    functionName,
                    fileName: locationParts[0],
                    lineNumber: locationParts[1],
                    columnNumber: locationParts[2],
                });
            }
        }, this);
    },
    parseOpera: function (e) {
        if (!e.stacktrace ||
            (e.message.indexOf('\n') > -1 &&
                e.message.split('\n').length > e.stacktrace.split('\n').length)) {
            return this.parseOpera9(e);
        }
        else if (!e.stack) {
            return this.parseOpera10(e);
        }
        else {
            return this.parseOpera11(e);
        }
    },
    parseOpera9: function (e) {
        const lineRE = /Line (\d+).*script (?:in )?(\S+)/i;
        const lines = e.message.split('\n');
        const result = [];
        for (let i = 2, len = lines.length; i < len; i += 2) {
            const match = lineRE.exec(lines[i]);
            if (match) {
                result.push(new StackFrame({
                    fileName: match[2],
                    lineNumber: parseFloat(match[1]),
                }));
            }
        }
        return result;
    },
    parseOpera10: function (e) {
        const lineRE = /Line (\d+).*script (?:in )?(\S+)(?:: In function (\S+))?$/i;
        const lines = e.stacktrace.split('\n');
        const result = [];
        for (let i = 0, len = lines.length; i < len; i += 2) {
            const match = lineRE.exec(lines[i]);
            if (match) {
                result.push(new StackFrame({
                    functionName: match[3] || undefined,
                    fileName: match[2],
                    lineNumber: parseFloat(match[1]),
                }));
            }
        }
        return result;
    },
    parseOpera11: function (error) {
        const filtered = error.stack.split('\n').filter(function (line) {
            return (!!line.match(FIREFOX_SAFARI_STACK_REGEXP) &&
                !line.match(/^Error created at/));
        }, this);
        return filtered.map(function (line) {
            const tokens = line.split('@');
            const locationParts = this.extractLocation(tokens.pop());
            const functionCall = tokens.shift() || '';
            const functionName = functionCall
                .replace(/<anonymous function(: (\w+))?>/, '$2')
                .replace(/\([^)]*\)/g, '') || undefined;
            return new StackFrame({
                functionName,
                fileName: locationParts[0],
                lineNumber: locationParts[1],
                columnNumber: locationParts[2],
            });
        }, this);
    },
};

function pathToSelector(node) {
    if (!node || !node.outerHTML) {
        return '';
    }
    let path = '';
    while (node.parentElement) {
        let name = node.localName;
        if (!name) {
            break;
        }
        name = name.toLowerCase();
        const parent = node.parentElement;
        const domSiblings = [];
        if (parent.children && parent.children.length > 0) {
            for (let i = 0; i < parent.children.length; i++) {
                const sibling = parent.children[i];
                if (sibling.localName && sibling.localName.toLowerCase) {
                    if (sibling.localName.toLowerCase() === name) {
                        domSiblings.push(sibling);
                    }
                }
            }
        }
        if (domSiblings.length > 1) {
            name += `:eq(${domSiblings.indexOf(node)})`;
        }
        path = name + (path ? '>' + path : '');
        node = parent;
    }
    return path;
}
function isObject(obj) {
    return Object.prototype.toString.call(obj) === '[object Object]';
}
function isObjTooDeep(obj, limit) {
    if (limit === 0) {
        return true;
    }
    const keys = Object.keys(obj);
    for (const key of keys) {
        if (isObject(obj[key]) &&
            isObjTooDeep(obj[key], limit - 1)) {
            return true;
        }
    }
    return false;
}
function stringify(obj, stringifyOptions) {
    const options = {
        numOfKeysLimit: 50,
        depthOfLimit: 4,
    };
    Object.assign(options, stringifyOptions);
    const stack = [];
    const keys = [];
    return JSON.stringify(obj, function (key, value) {
        if (stack.length > 0) {
            const thisPos = stack.indexOf(this);
            ~thisPos ? stack.splice(thisPos + 1) : stack.push(this);
            ~thisPos ? keys.splice(thisPos, Infinity, key) : keys.push(key);
            if (~stack.indexOf(value)) {
                if (stack[0] === value) {
                    value = '[Circular ~]';
                }
                else {
                    value =
                        '[Circular ~.' +
                            keys.slice(0, stack.indexOf(value)).join('.') +
                            ']';
                }
            }
        }
        else {
            stack.push(value);
        }
        if (value === null)
            return value;
        if (value === undefined)
            return 'undefined';
        if (shouldIgnore(value)) {
            return toString(value);
        }
        if (typeof value === 'bigint') {
            return value.toString() + 'n';
        }
        if (value instanceof Event) {
            const eventResult = {};
            for (const eventKey in value) {
                const eventValue = value[eventKey];
                if (Array.isArray(eventValue)) {
                    eventResult[eventKey] = pathToSelector((eventValue.length ? eventValue[0] : null));
                }
                else {
                    eventResult[eventKey] = eventValue;
                }
            }
            return eventResult;
        }
        else if (value instanceof Node) {
            if (value instanceof HTMLElement) {
                return value ? value.outerHTML : '';
            }
            return value.nodeName;
        }
        else if (value instanceof Error) {
            return value.stack
                ? value.stack + '\nEnd of stack for Error object'
                : value.name + ': ' + value.message;
        }
        return value;
    });
    function shouldIgnore(_obj) {
        if (isObject(_obj) && Object.keys(_obj).length > options.numOfKeysLimit) {
            return true;
        }
        if (typeof _obj === 'function') {
            return true;
        }
        if (isObject(_obj) &&
            isObjTooDeep(_obj, options.depthOfLimit)) {
            return true;
        }
        return false;
    }
    function toString(_obj) {
        let str = _obj.toString();
        if (options.stringLengthLimit && str.length > options.stringLengthLimit) {
            str = `${str.slice(0, options.stringLengthLimit)}...`;
        }
        return str;
    }
}

const defaultLogOptions = {
    level: [
        'assert',
        'clear',
        'count',
        'countReset',
        'debug',
        'dir',
        'dirxml',
        'error',
        'group',
        'groupCollapsed',
        'groupEnd',
        'info',
        'log',
        'table',
        'time',
        'timeEnd',
        'timeLog',
        'trace',
        'warn',
    ],
    lengthThreshold: 1000,
    logger: 'console',
};
function initLogObserver(cb, win, options) {
    const logOptions = (options ? Object.assign({}, defaultLogOptions, options) : defaultLogOptions);
    const loggerType = logOptions.logger;
    if (!loggerType) {
        return () => {
        };
    }
    let logger;
    if (typeof loggerType === 'string') {
        logger = win[loggerType];
    }
    else {
        logger = loggerType;
    }
    let logCount = 0;
    let inStack = false;
    const cancelHandlers = [];
    if (logOptions.level.includes('error')) {
        const errorHandler = (event) => {
            const message = event.message, error = event.error;
            const trace = ErrorStackParser.parse(error).map((stackFrame) => stackFrame.toString());
            const payload = [stringify(message, logOptions.stringifyOptions)];
            cb({
                level: 'error',
                trace,
                payload,
            });
        };
        win.addEventListener('error', errorHandler);
        cancelHandlers.push(() => {
            win.removeEventListener('error', errorHandler);
        });
        const unhandledrejectionHandler = (event) => {
            let error;
            let payload;
            if (event.reason instanceof Error) {
                error = event.reason;
                payload = [
                    stringify(`Uncaught (in promise) ${error.name}: ${error.message}`, logOptions.stringifyOptions),
                ];
            }
            else {
                error = new Error();
                payload = [
                    stringify('Uncaught (in promise)', logOptions.stringifyOptions),
                    stringify(event.reason, logOptions.stringifyOptions),
                ];
            }
            const trace = ErrorStackParser.parse(error).map((stackFrame) => stackFrame.toString());
            cb({
                level: 'error',
                trace,
                payload,
            });
        };
        win.addEventListener('unhandledrejection', unhandledrejectionHandler);
        cancelHandlers.push(() => {
            win.removeEventListener('unhandledrejection', unhandledrejectionHandler);
        });
    }
    for (const levelType of logOptions.level) {
        cancelHandlers.push(replace(logger, levelType));
    }
    return () => {
        cancelHandlers.forEach((h) => h());
    };
    function replace(_logger, level) {
        if (!_logger[level]) {
            return () => {
            };
        }
        return patch(_logger, level, (original) => {
            return (...args) => {
                original.apply(this, args);
                if (inStack) {
                    return;
                }
                inStack = true;
                try {
                    const trace = ErrorStackParser.parse(new Error())
                        .map((stackFrame) => stackFrame.toString())
                        .splice(1);
                    const payload = args.map((s) => stringify(s, logOptions.stringifyOptions));
                    logCount++;
                    if (logCount < logOptions.lengthThreshold) {
                        cb({
                            level,
                            trace,
                            payload,
                        });
                    }
                    else if (logCount === logOptions.lengthThreshold) {
                        cb({
                            level: 'warn',
                            trace: [],
                            payload: [
                                stringify('The number of log records reached the threshold.'),
                            ],
                        });
                    }
                }
                catch (error) {
                    original('rrweb logger error:', error, ...args);
                }
                finally {
                    inStack = false;
                }
            };
        });
    }
}
const PLUGIN_NAME = 'rrweb/console@1';
const getRecordConsolePlugin = (options) => ({
    name: PLUGIN_NAME,
    observer: initLogObserver,
    options: options,
});

const ORIGINAL_ATTRIBUTE_NAME = '__rrweb_original__';
const defaultLogConfig = {
    level: [
        'assert',
        'clear',
        'count',
        'countReset',
        'debug',
        'dir',
        'dirxml',
        'error',
        'group',
        'groupCollapsed',
        'groupEnd',
        'info',
        'log',
        'table',
        'time',
        'timeEnd',
        'timeLog',
        'trace',
        'warn',
    ],
    replayLogger: undefined,
};
class LogReplayPlugin {
    constructor(config) {
        this.config = Object.assign(defaultLogConfig, config);
    }
    getConsoleLogger() {
        const replayLogger = {};
        for (const level of this.config.level) {
            if (level === 'trace') {
                replayLogger[level] = (data) => {
                    const logger = console.log[ORIGINAL_ATTRIBUTE_NAME]
                        ? console.log[ORIGINAL_ATTRIBUTE_NAME]
                        : console.log;
                    logger(...data.payload.map((s) => JSON.parse(s)), this.formatMessage(data));
                };
            }
            else {
                replayLogger[level] = (data) => {
                    const logger = console[level][ORIGINAL_ATTRIBUTE_NAME]
                        ? console[level][ORIGINAL_ATTRIBUTE_NAME]
                        : console[level];
                    logger(...data.payload.map((s) => JSON.parse(s)), this.formatMessage(data));
                };
            }
        }
        return replayLogger;
    }
    formatMessage(data) {
        if (data.trace.length === 0) {
            return '';
        }
        const stackPrefix = '\n\tat ';
        let result = stackPrefix;
        result += data.trace.join(stackPrefix);
        return result;
    }
}
const getReplayConsolePlugin = (options) => {
    const replayLogger = (options === null || options === void 0 ? void 0 : options.replayLogger) || new LogReplayPlugin(options).getConsoleLogger();
    return {
        handler(event, _isSync, context) {
            let logData = null;
            if (event.type === EventType.IncrementalSnapshot &&
                event.data.source === IncrementalSource.Log) {
                logData = event.data;
            }
            else if (event.type === EventType.Plugin &&
                event.data.plugin === PLUGIN_NAME) {
                logData = event.data.payload;
            }
            if (logData) {
                try {
                    if (typeof replayLogger[logData.level] === 'function') {
                        replayLogger[logData.level](logData);
                    }
                }
                catch (error) {
                    if (context.replayer.config.showWarning) {
                        console.warn(error);
                    }
                }
            }
        },
    };
};

exports.EventType = EventType;
exports.IncrementalSource = IncrementalSource;
exports.MouseInteractions = MouseInteractions;
exports.PLUGIN_NAME = PLUGIN_NAME;
exports.Replayer = Replayer;
exports.ReplayerEvents = ReplayerEvents;
exports.addCustomEvent = addCustomEvent;
exports.canvasMutation = canvasMutation;
exports.freezePage = freezePage;
exports.getRecordConsolePlugin = getRecordConsolePlugin;
exports.getReplayConsolePlugin = getReplayConsolePlugin;
exports.pack = pack;
exports.record = record;
exports.unpack = unpack;
exports.utils = utils;

},{}],4:[function(require,module,exports){
/* eslint camelcase: "off" */

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _utils = require('./utils');

/** @const */var SET_ACTION = '$set';
/** @const */var SET_ONCE_ACTION = '$set_once';
/** @const */var UNSET_ACTION = '$unset';
/** @const */var ADD_ACTION = '$add';
/** @const */var APPEND_ACTION = '$append';
/** @const */var UNION_ACTION = '$union';
/** @const */var REMOVE_ACTION = '$remove';
/** @const */var DELETE_ACTION = '$delete';

// Common internal methods for mixpanel.people and mixpanel.group APIs.
// These methods shouldn't involve network I/O.
var apiActions = {
    set_action: function set_action(prop, to) {
        var data = {};
        var $set = {};
        if (_utils._.isObject(prop)) {
            _utils._.each(prop, function (v, k) {
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

    unset_action: function unset_action(prop) {
        var data = {};
        var $unset = [];
        if (!_utils._.isArray(prop)) {
            prop = [prop];
        }

        _utils._.each(prop, function (k) {
            if (!this._is_reserved_property(k)) {
                $unset.push(k);
            }
        }, this);

        data[UNSET_ACTION] = $unset;
        return data;
    },

    set_once_action: function set_once_action(prop, to) {
        var data = {};
        var $set_once = {};
        if (_utils._.isObject(prop)) {
            _utils._.each(prop, function (v, k) {
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

    union_action: function union_action(list_name, values) {
        var data = {};
        var $union = {};
        if (_utils._.isObject(list_name)) {
            _utils._.each(list_name, function (v, k) {
                if (!this._is_reserved_property(k)) {
                    $union[k] = _utils._.isArray(v) ? v : [v];
                }
            }, this);
        } else {
            $union[list_name] = _utils._.isArray(values) ? values : [values];
        }
        data[UNION_ACTION] = $union;
        return data;
    },

    append_action: function append_action(list_name, value) {
        var data = {};
        var $append = {};
        if (_utils._.isObject(list_name)) {
            _utils._.each(list_name, function (v, k) {
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

    remove_action: function remove_action(list_name, value) {
        var data = {};
        var $remove = {};
        if (_utils._.isObject(list_name)) {
            _utils._.each(list_name, function (v, k) {
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

    delete_action: function delete_action() {
        var data = {};
        data[DELETE_ACTION] = '';
        return data;
    }
};

exports.SET_ACTION = SET_ACTION;
exports.SET_ONCE_ACTION = SET_ONCE_ACTION;
exports.UNSET_ACTION = UNSET_ACTION;
exports.ADD_ACTION = ADD_ACTION;
exports.APPEND_ACTION = APPEND_ACTION;
exports.UNION_ACTION = UNION_ACTION;
exports.REMOVE_ACTION = REMOVE_ACTION;
exports.DELETE_ACTION = DELETE_ACTION;
exports.apiActions = apiActions;

},{"./utils":27}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _utils = require('../utils');

var _window = require('../window');

var _utils2 = require('./utils');

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
var CONFIG_TRACK_INPUT = 'input';
var CONFIG_TRACK_PAGEVIEW = 'pageview';
var CONFIG_TRACK_SCROLL = 'scroll';
var CONFIG_TRACK_SUBMIT = 'submit';

var CONFIG_DEFAULTS = {};
CONFIG_DEFAULTS[CONFIG_ALLOW_SELECTORS] = [];
CONFIG_DEFAULTS[CONFIG_ALLOW_URL_REGEXES] = [];
CONFIG_DEFAULTS[CONFIG_BLOCK_ATTRS] = [];
CONFIG_DEFAULTS[CONFIG_BLOCK_ELEMENT_CALLBACK] = null;
CONFIG_DEFAULTS[CONFIG_BLOCK_SELECTORS] = [];
CONFIG_DEFAULTS[CONFIG_BLOCK_URL_REGEXES] = [];
CONFIG_DEFAULTS[CONFIG_CAPTURE_EXTRA_ATTRS] = [];
CONFIG_DEFAULTS[CONFIG_CAPTURE_TEXT_CONTENT] = false;
CONFIG_DEFAULTS[CONFIG_SCROLL_CAPTURE_ALL] = false;
CONFIG_DEFAULTS[CONFIG_SCROLL_CHECKPOINTS] = [25, 50, 75, 100];
CONFIG_DEFAULTS[CONFIG_TRACK_CLICK] = true;
CONFIG_DEFAULTS[CONFIG_TRACK_INPUT] = true;
CONFIG_DEFAULTS[CONFIG_TRACK_PAGEVIEW] = PAGEVIEW_OPTION_FULL_URL;
CONFIG_DEFAULTS[CONFIG_TRACK_SCROLL] = true;
CONFIG_DEFAULTS[CONFIG_TRACK_SUBMIT] = true;

var DEFAULT_PROPS = {
    '$mp_autocapture': true
};

var MP_EV_CLICK = '$mp_click';
var MP_EV_INPUT = '$mp_input_change';
var MP_EV_SCROLL = '$mp_scroll';
var MP_EV_SUBMIT = '$mp_submit';

/**
 * Autocapture: manages automatic event tracking
 * @constructor
 */
var Autocapture = function Autocapture(mp) {
    this.mp = mp;
};

Autocapture.prototype.init = function () {
    if (!(0, _utils2.minDOMApisSupported)()) {
        _utils2.logger.critical('Autocapture unavailable: missing required DOM APIs');
        return;
    }

    this.initPageviewTracking();
    this.initClickTracking();
    this.initInputTracking();
    this.initScrollTracking();
    this.initSubmitTracking();
};

Autocapture.prototype.getFullConfig = function () {
    var autocaptureConfig = this.mp.get_config(AUTOCAPTURE_CONFIG_KEY);
    if (!autocaptureConfig) {
        // Autocapture is completely off
        return {};
    } else if (_utils._.isObject(autocaptureConfig)) {
        return _utils._.extend({}, CONFIG_DEFAULTS, autocaptureConfig);
    } else {
        // Autocapture config is non-object truthy value, return default
        return CONFIG_DEFAULTS;
    }
};

Autocapture.prototype.getConfig = function (key) {
    return this.getFullConfig()[key];
};

Autocapture.prototype.currentUrlBlocked = function () {
    var i;
    var currentUrl = _utils._.info.currentUrl();

    var allowUrlRegexes = this.getConfig(CONFIG_ALLOW_URL_REGEXES) || [];
    if (allowUrlRegexes.length) {
        // we're using an allowlist, only track if current URL matches
        var allowed = false;
        for (i = 0; i < allowUrlRegexes.length; i++) {
            var allowRegex = allowUrlRegexes[i];
            try {
                if (currentUrl.match(allowRegex)) {
                    allowed = true;
                    break;
                }
            } catch (err) {
                _utils2.logger.critical('Error while checking block URL regex: ' + allowRegex, err);
                return true;
            }
        }
        if (!allowed) {
            // wasn't allowed by any regex
            return true;
        }
    }

    var blockUrlRegexes = this.getConfig(CONFIG_BLOCK_URL_REGEXES) || [];
    if (!blockUrlRegexes || !blockUrlRegexes.length) {
        return false;
    }

    for (i = 0; i < blockUrlRegexes.length; i++) {
        try {
            if (currentUrl.match(blockUrlRegexes[i])) {
                return true;
            }
        } catch (err) {
            _utils2.logger.critical('Error while checking block URL regex: ' + blockUrlRegexes[i], err);
            return true;
        }
    }
    return false;
};

Autocapture.prototype.pageviewTrackingConfig = function () {
    // supports both autocapture config and old track_pageview config
    if (this.mp.get_config(AUTOCAPTURE_CONFIG_KEY)) {
        return this.getConfig(CONFIG_TRACK_PAGEVIEW);
    } else {
        return this.mp.get_config(LEGACY_PAGEVIEW_CONFIG_KEY);
    }
};

// helper for event handlers
Autocapture.prototype.trackDomEvent = function (ev, mpEventName) {
    if (this.currentUrlBlocked()) {
        return;
    }

    var props = (0, _utils2.getPropsForDOMEvent)(ev, {
        allowElementCallback: this.getConfig(CONFIG_ALLOW_ELEMENT_CALLBACK),
        allowSelectors: this.getConfig(CONFIG_ALLOW_SELECTORS),
        blockAttrs: this.getConfig(CONFIG_BLOCK_ATTRS),
        blockElementCallback: this.getConfig(CONFIG_BLOCK_ELEMENT_CALLBACK),
        blockSelectors: this.getConfig(CONFIG_BLOCK_SELECTORS),
        captureExtraAttrs: this.getConfig(CONFIG_CAPTURE_EXTRA_ATTRS),
        captureTextContent: this.getConfig(CONFIG_CAPTURE_TEXT_CONTENT)
    });
    if (props) {
        _utils._.extend(props, DEFAULT_PROPS);
        this.mp.track(mpEventName, props);
    }
};

Autocapture.prototype.initClickTracking = function () {
    _window.window.removeEventListener(_utils2.EV_CLICK, this.listenerClick);

    if (!this.getConfig(CONFIG_TRACK_CLICK)) {
        return;
    }
    _utils2.logger.log('Initializing click tracking');

    this.listenerClick = _window.window.addEventListener(_utils2.EV_CLICK, (function (ev) {
        if (!this.getConfig(CONFIG_TRACK_CLICK)) {
            return;
        }
        this.trackDomEvent(ev, MP_EV_CLICK);
    }).bind(this));
};

Autocapture.prototype.initInputTracking = function () {
    _window.window.removeEventListener(_utils2.EV_CHANGE, this.listenerChange);

    if (!this.getConfig(CONFIG_TRACK_INPUT)) {
        return;
    }
    _utils2.logger.log('Initializing input tracking');

    this.listenerChange = _window.window.addEventListener(_utils2.EV_CHANGE, (function (ev) {
        if (!this.getConfig(CONFIG_TRACK_INPUT)) {
            return;
        }
        this.trackDomEvent(ev, MP_EV_INPUT);
    }).bind(this));
};

Autocapture.prototype.initPageviewTracking = function () {
    _window.window.removeEventListener(_utils2.EV_POPSTATE, this.listenerPopstate);
    _window.window.removeEventListener(_utils2.EV_HASHCHANGE, this.listenerHashchange);
    _window.window.removeEventListener(_utils2.EV_MP_LOCATION_CHANGE, this.listenerLocationchange);

    if (!this.pageviewTrackingConfig()) {
        return;
    }
    _utils2.logger.log('Initializing pageview tracking');

    var previousTrackedUrl = '';
    var tracked = false;
    if (!this.currentUrlBlocked()) {
        tracked = this.mp.track_pageview(DEFAULT_PROPS);
    }
    if (tracked) {
        previousTrackedUrl = _utils._.info.currentUrl();
    }

    this.listenerPopstate = _window.window.addEventListener(_utils2.EV_POPSTATE, function () {
        _window.window.dispatchEvent(new Event(_utils2.EV_MP_LOCATION_CHANGE));
    });
    this.listenerHashchange = _window.window.addEventListener(_utils2.EV_HASHCHANGE, function () {
        _window.window.dispatchEvent(new Event(_utils2.EV_MP_LOCATION_CHANGE));
    });
    var nativePushState = _window.window.history.pushState;
    if (typeof nativePushState === 'function') {
        _window.window.history.pushState = function (state, unused, url) {
            nativePushState.call(_window.window.history, state, unused, url);
            _window.window.dispatchEvent(new Event(_utils2.EV_MP_LOCATION_CHANGE));
        };
    }
    var nativeReplaceState = _window.window.history.replaceState;
    if (typeof nativeReplaceState === 'function') {
        _window.window.history.replaceState = function (state, unused, url) {
            nativeReplaceState.call(_window.window.history, state, unused, url);
            _window.window.dispatchEvent(new Event(_utils2.EV_MP_LOCATION_CHANGE));
        };
    }
    this.listenerLocationchange = _window.window.addEventListener(_utils2.EV_MP_LOCATION_CHANGE, (0, _utils.safewrap)((function () {
        if (this.currentUrlBlocked()) {
            return;
        }

        var currentUrl = _utils._.info.currentUrl();
        var shouldTrack = false;
        var didPathChange = currentUrl.split('#')[0].split('?')[0] !== previousTrackedUrl.split('#')[0].split('?')[0];
        var trackPageviewOption = this.pageviewTrackingConfig();
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
                _utils2.logger.log('Path change: re-initializing scroll depth checkpoints');
            }
        }
    }).bind(this)));
};

Autocapture.prototype.initScrollTracking = function () {
    _window.window.removeEventListener(_utils2.EV_SCROLLEND, this.listenerScroll);

    if (!this.getConfig(CONFIG_TRACK_SCROLL)) {
        return;
    }
    _utils2.logger.log('Initializing scroll tracking');
    this.lastScrollCheckpoint = 0;

    this.listenerScroll = _window.window.addEventListener(_utils2.EV_SCROLLEND, (0, _utils.safewrap)((function () {
        if (!this.getConfig(CONFIG_TRACK_SCROLL)) {
            return;
        }
        if (this.currentUrlBlocked()) {
            return;
        }

        var shouldTrack = this.getConfig(CONFIG_SCROLL_CAPTURE_ALL);
        var scrollCheckpoints = (this.getConfig(CONFIG_SCROLL_CHECKPOINTS) || []).slice().sort(function (a, b) {
            return a - b;
        });

        var scrollTop = _window.window.scrollY;
        var props = _utils._.extend({ '$scroll_top': scrollTop }, DEFAULT_PROPS);
        try {
            var scrollHeight = _utils.document.body.scrollHeight;
            var scrollPercentage = Math.round(scrollTop / (scrollHeight - _window.window.innerHeight) * 100);
            props['$scroll_height'] = scrollHeight;
            props['$scroll_percentage'] = scrollPercentage;
            if (scrollPercentage > this.lastScrollCheckpoint) {
                for (var i = 0; i < scrollCheckpoints.length; i++) {
                    var checkpoint = scrollCheckpoints[i];
                    if (scrollPercentage >= checkpoint && this.lastScrollCheckpoint < checkpoint) {
                        props['$scroll_checkpoint'] = checkpoint;
                        this.lastScrollCheckpoint = checkpoint;
                        shouldTrack = true;
                    }
                }
            }
        } catch (err) {
            _utils2.logger.critical('Error while calculating scroll percentage', err);
        }
        if (shouldTrack) {
            this.mp.track(MP_EV_SCROLL, props);
        }
    }).bind(this)));
};

Autocapture.prototype.initSubmitTracking = function () {
    _window.window.removeEventListener(_utils2.EV_SUBMIT, this.listenerSubmit);

    if (!this.getConfig(CONFIG_TRACK_SUBMIT)) {
        return;
    }
    _utils2.logger.log('Initializing submit tracking');

    this.listenerSubmit = _window.window.addEventListener(_utils2.EV_SUBMIT, (function (ev) {
        if (!this.getConfig(CONFIG_TRACK_SUBMIT)) {
            return;
        }
        this.trackDomEvent(ev, MP_EV_SUBMIT);
    }).bind(this));
};

// TODO integrate error_reporter from mixpanel instance
(0, _utils.safewrapClass)(Autocapture);

exports.Autocapture = Autocapture;

},{"../utils":27,"../window":28,"./utils":6}],6:[function(require,module,exports){
// stateless utils
// mostly from https://github.com/mixpanel/mixpanel-js/blob/989ada50f518edab47b9c4fd9535f9fbd5ec5fc0/src/autotrack-utils.js

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _utils = require('../utils');

// eslint-disable-line camelcase

var _window = require('../window');

var EV_CHANGE = 'change';
var EV_CLICK = 'click';
var EV_HASHCHANGE = 'hashchange';
var EV_MP_LOCATION_CHANGE = 'mp_locationchange';
var EV_POPSTATE = 'popstate';
// TODO scrollend isn't available in Safari: document or polyfill?
var EV_SCROLLEND = 'scrollend';
var EV_SUBMIT = 'submit';

var CLICK_EVENT_PROPS = ['clientX', 'clientY', 'offsetX', 'offsetY', 'pageX', 'pageY', 'screenX', 'screenY', 'x', 'y'];
var OPT_IN_CLASSES = ['mp-include'];
var OPT_OUT_CLASSES = ['mp-no-track'];
var SENSITIVE_DATA_CLASSES = OPT_OUT_CLASSES.concat(['mp-sensitive']);
var TRACKED_ATTRS = ['aria-label', 'aria-labelledby', 'aria-describedby', 'href', 'name', 'role', 'title', 'type'];

var logger = (0, _utils.console_with_prefix)('autocapture');

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
    switch (typeof el.className) {
        case 'string':
            return el.className;
        case 'object':
            // handle cases where className might be SVGAnimatedString or some other type
            return el.className.baseVal || el.getAttribute('class') || '';
        default:
            // future proof
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
        _utils._.each(TRACKED_ATTRS.concat(extraAttrs), function (attr) {
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
    while (currentElem = getPreviousElementSibling(currentElem)) {
        // eslint-disable-line no-cond-assign
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

    // convert array to set every time, as the config may have changed
    var blockAttrsSet = {};
    _utils._.each(blockAttrs, function (attr) {
        blockAttrsSet[attr] = true;
    });

    var props = null;

    var target = typeof ev.target === 'undefined' ? ev.srcElement : ev.target;
    if (isTextNode(target)) {
        // defeat Safari bug (see: http://www.quirksmode.org/js/events_properties.html)
        target = target.parentNode;
    }

    if (shouldTrackDomEvent(target, ev) && isElementAllowed(target, ev, allowElementCallback, allowSelectors) && !isElementBlocked(target, ev, blockElementCallback, blockSelectors)) {
        var targetElementList = [target];
        var curEl = target;
        while (curEl.parentNode && !isTag(curEl, 'body')) {
            targetElementList.push(curEl.parentNode);
            curEl = curEl.parentNode;
        }

        var elementsJson = [];
        var href,
            explicitNoTrack = false;
        _utils._.each(targetElementList, function (el) {
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
            var docElement = _utils.document['documentElement'];
            props = {
                '$event_type': ev.type,
                '$host': _window.window.location.host,
                '$pathname': _window.window.location.pathname,
                '$elements': elementsJson,
                '$el_attr__href': href,
                '$viewportHeight': Math.max(docElement['clientHeight'], _window.window['innerHeight'] || 0),
                '$viewportWidth': Math.max(docElement['clientWidth'], _window.window['innerWidth'] || 0)
            };
            _utils._.each(captureExtraAttrs, function (attr) {
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
                _utils._.each(CLICK_EVENT_PROPS, function (prop) {
                    if (prop in ev) {
                        props['$' + prop] = ev[prop];
                    }
                });
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
                if (!isElementAllowed(target, ev, allowElementCallback, allowSelectors) || isElementBlocked(target, ev, blockElementCallback, blockSelectors)) {
                    return null;
                }

                var targetProps = getPropertiesFromElement(target, ev, blockAttrsSet, captureExtraAttrs, allowElementCallback, allowSelectors);
                props['$target'] = targetProps;
                // pull up more props onto main event props
                props['$el_classes'] = targetProps['$classes'];
                _utils._.extend(props, _utils._.strip_empty_properties({
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
        _utils._.each(el.childNodes, function (child) {
            if (isTextNode(child) && child.textContent) {
                elText += _utils._.trim(child.textContent)
                // scrub potentially sensitive values
                .split(/(\s+)/).filter(shouldTrackValue).join('')
                // normalize whitespace
                .replace(/[\r\n]/g, ' ').replace(/[ ]+/g, ' ')
                // truncate
                .substring(0, 255);
            }
        });
    }

    return _utils._.trim(elText);
}

function guessRealClickTarget(ev) {
    var target = ev.target;
    var composedPath = ev['composedPath']();
    for (var i = 0; i < composedPath.length; i++) {
        var node = composedPath[i];
        if (isTag(node, 'a') || isTag(node, 'button') || isTag(node, 'input') || isTag(node, 'select') || node.getAttribute && node.getAttribute('role') === 'button') {
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
        var testEl = _utils.document.createElement('div');
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
    if (isTag(el, 'input') || isTag(el, 'select') || isTag(el, 'textarea') || el.getAttribute('contenteditable') === 'true') {
        return false;
    }

    // don't include hidden or password fields
    var type = el.type || '';
    if (typeof type === 'string') {
        // it's possible for el.type to be a DOM element if el is a form with a child input[name="type"]
        switch (type.toLowerCase()) {
            case 'hidden':
                return false;
            case 'password':
                return false;
        }
    }

    // filter out data from fields that look like sensitive fields
    var name = el.name || el.id || '';
    if (typeof name === 'string') {
        // it's possible for el.name or el.id to be a DOM element if el is a form with a child input[name="name"]
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
    if (value === null || _utils._.isUndefined(value)) {
        return false;
    }

    if (typeof value === 'string') {
        value = _utils._.trim(value);

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

exports.getPropsForDOMEvent = getPropsForDOMEvent;
exports.getSafeText = getSafeText;
exports.logger = logger;
exports.minDOMApisSupported = minDOMApisSupported;
exports.shouldTrackDomEvent = shouldTrackDomEvent;
exports.shouldTrackElementDetails = shouldTrackElementDetails;
exports.shouldTrackValue = shouldTrackValue;
exports.EV_CHANGE = EV_CHANGE;
exports.EV_CLICK = EV_CLICK;
exports.EV_HASHCHANGE = EV_HASHCHANGE;
exports.EV_MP_LOCATION_CHANGE = EV_MP_LOCATION_CHANGE;
exports.EV_POPSTATE = EV_POPSTATE;
exports.EV_SCROLLEND = EV_SCROLLEND;
exports.EV_SUBMIT = EV_SUBMIT;

},{"../utils":27,"../window":28}],7:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
var Config = {
    DEBUG: false,
    LIB_VERSION: '2.61.1'
};

exports['default'] = Config;
module.exports = exports['default'];

},{}],8:[function(require,module,exports){
/* eslint camelcase: "off" */

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _utils = require('./utils');

/**
 * DomTracker Object
 * @constructor
 */
var DomTracker = function DomTracker() {};

// interface
DomTracker.prototype.create_properties = function () {};
DomTracker.prototype.event_handler = function () {};
DomTracker.prototype.after_track_handler = function () {};

DomTracker.prototype.init = function (mixpanel_instance) {
    this.mp = mixpanel_instance;
    return this;
};

/**
 * @param {Object|string} query
 * @param {string} event_name
 * @param {Object=} properties
 * @param {function=} user_callback
 */
DomTracker.prototype.track = function (query, event_name, properties, user_callback) {
    var that = this;
    var elements = _utils._.dom_query(query);

    if (elements.length === 0) {
        _utils.console.error('The DOM query (' + query + ') returned 0 elements');
        return;
    }

    _utils._.each(elements, function (element) {
        _utils._.register_event(element, this.override_event, function (e) {
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
DomTracker.prototype.track_callback = function (user_callback, props, options, timeout_occured) {
    timeout_occured = timeout_occured || false;
    var that = this;

    return function () {
        // options is referenced from both callbacks, so we can have
        // a 'lock' of sorts to ensure only one fires
        if (options.callback_fired) {
            return;
        }
        options.callback_fired = true;

        if (user_callback && user_callback(timeout_occured, props) === false) {
            // user can prevent the default functionality by
            // returning false from their callback
            return;
        }

        that.after_track_handler(props, options, timeout_occured);
    };
};

DomTracker.prototype.create_properties = function (properties, element) {
    var props;

    if (typeof properties === 'function') {
        props = properties(element);
    } else {
        props = _utils._.extend({}, properties);
    }

    return props;
};

/**
 * LinkTracker Object
 * @constructor
 * @extends DomTracker
 */
var LinkTracker = function LinkTracker() {
    this.override_event = 'click';
};
_utils._.inherit(LinkTracker, DomTracker);

LinkTracker.prototype.create_properties = function (properties, element) {
    var props = LinkTracker.superclass.create_properties.apply(this, arguments);

    if (element.href) {
        props['url'] = element.href;
    }

    return props;
};

LinkTracker.prototype.event_handler = function (evt, element, options) {
    options.new_tab = evt.which === 2 || evt.metaKey || evt.ctrlKey || element.target === '_blank';
    options.href = element.href;

    if (!options.new_tab) {
        evt.preventDefault();
    }
};

LinkTracker.prototype.after_track_handler = function (props, options) {
    if (options.new_tab) {
        return;
    }

    setTimeout(function () {
        window.location = options.href;
    }, 0);
};

/**
 * FormTracker Object
 * @constructor
 * @extends DomTracker
 */
var FormTracker = function FormTracker() {
    this.override_event = 'submit';
};
_utils._.inherit(FormTracker, DomTracker);

FormTracker.prototype.event_handler = function (evt, element, options) {
    options.element = element;
    evt.preventDefault();
};

FormTracker.prototype.after_track_handler = function (props, options) {
    setTimeout(function () {
        options.element.submit();
    }, 0);
};

exports.FormTracker = FormTracker;
exports.LinkTracker = LinkTracker;

},{"./utils":27}],9:[function(require,module,exports){
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

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
exports.optIn = optIn;
exports.optOut = optOut;
exports.hasOptedIn = hasOptedIn;
exports.hasOptedOut = hasOptedOut;
exports.addOptOutCheckMixpanelLib = addOptOutCheckMixpanelLib;
exports.addOptOutCheckMixpanelPeople = addOptOutCheckMixpanelPeople;
exports.addOptOutCheckMixpanelGroup = addOptOutCheckMixpanelGroup;
exports.clearOptInOut = clearOptInOut;

var _utils = require('./utils');

var _window = require('./window');

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
        _utils.console.warn('This browser has "Do Not Track" enabled. This will prevent the Mixpanel SDK from sending any data. To ignore the "Do Not Track" browser setting, initialize the Mixpanel instance with the config "ignore_dnt: true"');
        return true;
    }
    var optedOut = _getStorageValue(token, options) === '0';
    if (optedOut) {
        _utils.console.warn('You are opted out of Mixpanel tracking. This will prevent the Mixpanel SDK from sending any data.');
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
    return _addOptOutCheck(method, function (name) {
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
    return _addOptOutCheck(method, function (name) {
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
    return _addOptOutCheck(method, function (name) {
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
    _getStorage(options).remove(_getStorageKey(token, options), !!options.crossSubdomainCookie, options.cookieDomain);
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
    return options.persistenceType === 'localStorage' ? _utils._.localStorage : _utils._.cookie;
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
    var win = options && options.window || _window.window;
    var nav = win['navigator'] || {};
    var hasDntOn = false;

    _utils._.each([nav['doNotTrack'], // standard
    nav['msDoNotTrack'], win['doNotTrack']], function (dntValue) {
        if (_utils._.includes([true, 1, '1', 'yes'], dntValue)) {
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
    if (!_utils._.isString(token) || !token.length) {
        _utils.console.error('gdpr.' + (optValue ? 'optIn' : 'optOut') + ' called with an invalid token');
        return;
    }

    options = options || {};

    _getStorage(options).set(_getStorageKey(token, options), optValue ? 1 : 0, _utils._.isNumber(options.cookieExpiration) ? options.cookieExpiration : null, !!options.crossSubdomainCookie, !!options.secureCookie, !!options.crossSiteCookie, options.cookieDomain);

    if (options.track && optValue) {
        // only track event if opting in (optValue=true)
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
    return function () {
        var optedOut = false;

        try {
            var token = getConfigValue.call(this, 'token');
            var ignoreDnt = getConfigValue.call(this, 'ignore_dnt');
            var persistenceType = getConfigValue.call(this, 'opt_out_tracking_persistence_type');
            var persistencePrefix = getConfigValue.call(this, 'opt_out_tracking_cookie_prefix');
            var win = getConfigValue.call(this, 'window'); // used to override window during browser tests

            if (token) {
                // if there was an issue getting the token, continue method execution as normal
                optedOut = hasOptedOut(token, {
                    ignoreDnt: ignoreDnt,
                    persistenceType: persistenceType,
                    persistencePrefix: persistencePrefix,
                    window: win
                });
            }
        } catch (err) {
            _utils.console.error('Unexpected error when checking tracking opt-out status: ' + err);
        }

        if (!optedOut) {
            return method.apply(this, arguments);
        }

        var callback = arguments[arguments.length - 1];
        if (typeof callback === 'function') {
            callback(0);
        }

        return;
    };
}

},{"./utils":27,"./window":28}],10:[function(require,module,exports){
// For loading separate bundles asynchronously via script tag
// so that we don't load them until they are needed at runtime.
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
exports.loadAsync = loadAsync;
exports.loadNoop = loadNoop;
exports.loadThrowError = loadThrowError;

function loadAsync(src, onload) {
    var scriptEl = document.createElement('script');
    scriptEl.type = 'text/javascript';
    scriptEl.async = true;
    scriptEl.onload = onload;
    scriptEl.src = src;
    document.head.appendChild(scriptEl);
}

// For builds that have everything in one bundle, no extra work.

function loadNoop(_src, onload) {
    onload();
}

// For builds that do NOT want any extra bundles (e.g. session recorder)
// and just the main SDK, throw an error when trying to load a separate bundle.
// eslint-disable-next-line no-unused-vars

function loadThrowError(src, _onload) {
    throw new Error('This build of Mixpanel only includes core SDK functionality, could not load ' + src);
}

},{}],11:[function(require,module,exports){
/* eslint camelcase: "off" */
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

require('../recorder');

var _mixpanelCore = require('../mixpanel-core');

var _bundleLoaders = require('./bundle-loaders');

var mixpanel = (0, _mixpanelCore.init_as_module)(_bundleLoaders.loadNoop);

exports['default'] = mixpanel;
module.exports = exports['default'];

},{"../mixpanel-core":12,"../recorder":17,"./bundle-loaders":10}],12:[function(require,module,exports){
/* eslint camelcase: "off" */
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
exports.init_from_snippet = init_from_snippet;
exports.init_as_module = init_as_module;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

var _utils = require('./utils');

var _recorderUtils = require('./recorder/utils');

var _window = require('./window');

var _autocapture = require('./autocapture');

var _domTrackers = require('./dom-trackers');

var _requestBatcher = require('./request-batcher');

var _mixpanelGroup = require('./mixpanel-group');

var _mixpanelPeople = require('./mixpanel-people');

var _mixpanelPersistence = require('./mixpanel-persistence');

var _gdprUtils = require('./gdpr-utils');

var _storageIndexedDb = require('./storage/indexed-db');

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

var init_type; // MODULE or SNIPPET loader
// allow bundlers to specify how extra code (recorder bundle) should be loaded
// eslint-disable-next-line no-unused-vars
var load_extra_bundle = function load_extra_bundle(src, _onload) {
    throw new Error(src + ' not available in this build.');
};

var mixpanel_master; // main mixpanel instance / object
var INIT_MODULE = 0;
var INIT_SNIPPET = 1;

var IDENTITY_FUNC = function IDENTITY_FUNC(x) {
    return x;
};

/** @const */var PRIMARY_INSTANCE_NAME = 'mixpanel';
/** @const */var PAYLOAD_TYPE_BASE64 = 'base64';
/** @const */var PAYLOAD_TYPE_JSON = 'json';
/** @const */var DEVICE_ID_PREFIX = '$device:';

/*
 * Dynamic... constants? Is that an oxymoron?
 */
// http://hacks.mozilla.org/2009/07/cross-site-xmlhttprequest-with-cors/
// https://developer.mozilla.org/en-US/docs/DOM/XMLHttpRequest#withCredentials
var USE_XHR = _window.window.XMLHttpRequest && 'withCredentials' in new XMLHttpRequest();

// IE<10 does not support cross-origin XHR's but script tags
// with defer won't block window.onload; ENQUEUE_REQUESTS
// should only be true for Opera<12
var ENQUEUE_REQUESTS = !USE_XHR && _utils.userAgent.indexOf('MSIE') === -1 && _utils.userAgent.indexOf('Mozilla') === -1;

// save reference to navigator.sendBeacon so it can be minified
var sendBeacon = null;
if (_utils.navigator['sendBeacon']) {
    sendBeacon = function () {
        // late reference to navigator.sendBeacon to allow patching/spying
        return _utils.navigator['sendBeacon'].apply(_utils.navigator, arguments);
    };
}

var DEFAULT_API_ROUTES = {
    'track': 'track/',
    'engage': 'engage/',
    'groups': 'groups/',
    'record': 'record/'
};

/*
 * Module-level globals
 */
var DEFAULT_CONFIG = {
    'api_host': 'https://api-js.mixpanel.com',
    'api_routes': DEFAULT_API_ROUTES,
    'api_method': 'POST',
    'api_transport': 'XHR',
    'api_payload_format': PAYLOAD_TYPE_BASE64,
    'app_host': 'https://mixpanel.com',
    'autocapture': false,
    'cdn': 'https://cdn.mxpnl.com',
    'cross_site_cookie': false,
    'cross_subdomain_cookie': true,
    'error_reporter': _utils.NOOP_FUNC,
    'persistence': 'cookie',
    'persistence_name': '',
    'cookie_domain': '',
    'cookie_name': '',
    'loaded': _utils.NOOP_FUNC,
    'mp_loader': null,
    'track_marketing': true,
    'track_pageview': false,
    'skip_first_touch_marketing': false,
    'store_google': true,
    'stop_utm_persistence': false,
    'save_referrer': true,
    'test': false,
    'verbose': false,
    'img': false,
    'debug': false,
    'track_links_timeout': 300,
    'cookie_expiration': 365,
    'upgrade': false,
    'disable_persistence': false,
    'disable_cookie': false,
    'secure_cookie': false,
    'ip': true,
    'opt_out_tracking_by_default': false,
    'opt_out_persistence_by_default': false,
    'opt_out_tracking_persistence_type': 'localStorage',
    'opt_out_tracking_cookie_prefix': null,
    'property_blacklist': [],
    'xhr_headers': {}, // { header: value, header2: value }
    'ignore_dnt': false,
    'batch_requests': true,
    'batch_size': 50,
    'batch_flush_interval_ms': 5000,
    'batch_request_timeout_ms': 90000,
    'batch_autostart': true,
    'hooks': {},
    'record_block_class': new RegExp('^(mp-block|fs-exclude|amp-block|rr-block|ph-no-capture)$'),
    'record_block_selector': 'img, video',
    'record_canvas': false,
    'record_collect_fonts': false,
    'record_idle_timeout_ms': 30 * 60 * 1000, // 30 minutes
    'record_mask_text_class': new RegExp('^(mp-mask|fs-mask|amp-mask|rr-mask|ph-mask)$'),
    'record_mask_text_selector': '*',
    'record_max_ms': _utils.MAX_RECORDING_MS,
    'record_min_ms': 0,
    'record_sessions_percent': 0,
    'recorder_src': 'https://cdn.mxpnl.com/libs/mixpanel-recorder.min.js'
};

var DOM_LOADED = false;

/**
 * Mixpanel Library Object
 * @constructor
 */
var MixpanelLib = function MixpanelLib() {};

/**
 * create_mplib(token:string, config:object, name:string)
 *
 * This function is used by the init method of MixpanelLib objects
 * as well as the main initializer at the end of the JSLib (that
 * initializes document.mixpanel as well as any additional instances
 * declared before this file has loaded).
 */
var create_mplib = function create_mplib(token, config, name) {
    var instance,
        target = name === PRIMARY_INSTANCE_NAME ? mixpanel_master : mixpanel_master[name];

    if (target && init_type === INIT_MODULE) {
        instance = target;
    } else {
        if (target && !_utils._.isArray(target)) {
            _utils.console.error('You have already initialized ' + name);
            return;
        }
        instance = new MixpanelLib();
    }

    instance._cached_groups = {}; // cache groups in a pool

    instance._init(token, config, name);

    instance['people'] = new _mixpanelPeople.MixpanelPeople();
    instance['people']._init(instance);

    if (!instance.get_config('skip_first_touch_marketing')) {
        // We need null UTM params in the object because
        // UTM parameters act as a tuple. If any UTM param
        // is present, then we set all UTM params including
        // empty ones together
        var utm_params = _utils._.info.campaignParams(null);
        var initial_utm_params = {};
        var has_utm = false;
        _utils._.each(utm_params, function (utm_value, utm_key) {
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
    _config2['default'].DEBUG = _config2['default'].DEBUG || instance.get_config('debug');

    // if target is not defined, we called init after the lib already
    // loaded, so there won't be an array of things to execute
    if (!_utils._.isUndefined(target) && _utils._.isArray(target)) {
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
    if (_utils._.isUndefined(name)) {
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
MixpanelLib.prototype._init = function (token, config, name) {
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

    this.set_config(_utils._.extend({}, DEFAULT_CONFIG, variable_features, config, {
        'name': name,
        'token': token,
        'callback_fn': (name === PRIMARY_INSTANCE_NAME ? name : PRIMARY_INSTANCE_NAME + '.' + name) + '._jsc'
    }));

    this['_jsc'] = _utils.NOOP_FUNC;

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
        if (!_utils._.localStorage.is_supported(true) || !USE_XHR) {
            this._batch_requests = false;
            _utils.console.log('Turning off Mixpanel request-queueing; needs XHR and localStorage support');
            _utils._.each(this.get_batcher_configs(), function (batcher_config) {
                _utils.console.log('Clearing batch queue ' + batcher_config.queue_key);
                _utils._.localStorage.remove(batcher_config.queue_key);
            });
        } else {
            this.init_batchers();
            if (sendBeacon && _window.window.addEventListener) {
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
                var flush_on_unload = _utils._.bind(function () {
                    if (!this.request_batchers.events.stopped) {
                        this.request_batchers.events.flush({ unloading: true });
                    }
                }, this);
                _window.window.addEventListener('pagehide', function (ev) {
                    if (ev['persisted']) {
                        flush_on_unload();
                    }
                });
                _window.window.addEventListener('visibilitychange', function () {
                    if (_utils.document['visibilityState'] === 'hidden') {
                        flush_on_unload();
                    }
                });
            }
        }
    }

    this['persistence'] = this['cookie'] = new _mixpanelPersistence.MixpanelPersistence(this['config']);
    this.unpersisted_superprops = {};
    this._gdpr_init();

    var uuid = _utils._.UUID();
    if (!this.get_distinct_id()) {
        // There is no need to set the distinct id
        // or the device id if something was already stored
        // in the persitence
        this.register_once({
            'distinct_id': DEVICE_ID_PREFIX + uuid,
            '$device_id': uuid
        }, '');
    }

    this.autocapture = new _autocapture.Autocapture(this);
    this.autocapture.init();

    this._init_tab_id();
    this._check_and_start_session_recording();
};

/**
 * Assigns a unique UUID to this tab / window by leveraging sessionStorage.
 * This is primarily used for session recording, where data must be isolated to the current tab.
 */
MixpanelLib.prototype._init_tab_id = function () {
    if (_utils._.sessionStorage.is_supported()) {
        try {
            var key_suffix = this.get_config('name') + '_' + this.get_config('token');
            var tab_id_key = 'mp_tab_id_' + key_suffix;

            // A flag is used to determine if sessionStorage is copied over and we need to generate a new tab ID.
            // This enforces a unique ID in the cases like duplicated tab, window.open(...)
            var should_generate_new_tab_id_key = 'mp_gen_new_tab_id_' + key_suffix;
            if (_utils._.sessionStorage.get(should_generate_new_tab_id_key) || !_utils._.sessionStorage.get(tab_id_key)) {
                _utils._.sessionStorage.set(tab_id_key, '$tab-' + _utils._.UUID());
            }

            _utils._.sessionStorage.set(should_generate_new_tab_id_key, '1');
            this.tab_id = _utils._.sessionStorage.get(tab_id_key);

            // Remove the flag when the tab is unloaded to indicate the stored tab ID can be reused. This event is not reliable to detect all page unloads,
            // but reliable in cases where the user remains in the tab e.g. a refresh or href navigation.
            // If the flag is absent, this indicates to the next SDK instance that we can reuse the stored tab_id.
            _window.window.addEventListener('beforeunload', function () {
                _utils._.sessionStorage.remove(should_generate_new_tab_id_key);
            });
        } catch (err) {
            this.report_error('Error initializing tab id', err);
        }
    } else {
        this.report_error('Session storage is not supported, cannot keep track of unique tab ID.');
    }
};

MixpanelLib.prototype.get_tab_id = function () {
    return this.tab_id || null;
};

MixpanelLib.prototype._should_load_recorder = function () {
    var recording_registry_idb = new _storageIndexedDb.IDBStorageWrapper(_storageIndexedDb.RECORDING_REGISTRY_STORE_NAME);
    var tab_id = this.get_tab_id();
    return recording_registry_idb.init().then(function () {
        return recording_registry_idb.getAll();
    }).then(function (recordings) {
        for (var i = 0; i < recordings.length; i++) {
            // if there are expired recordings in the registry, we should load the recorder to flush them
            // if there's a recording for this tab id, we should load the recorder to continue the recording
            if ((0, _recorderUtils.isRecordingExpired)(recordings[i]) || recordings[i]['tabId'] === tab_id) {
                return true;
            }
        }
        return false;
    })['catch'](_utils._.bind(function (err) {
        this.report_error('Error checking recording registry', err);
    }, this));
};

MixpanelLib.prototype._check_and_start_session_recording = (0, _gdprUtils.addOptOutCheckMixpanelLib)(function (force_start) {
    if (!_window.window['MutationObserver']) {
        _utils.console.critical('Browser does not support MutationObserver; skipping session recording');
        return;
    }

    var loadRecorder = _utils._.bind(function (startNewIfInactive) {
        var handleLoadedRecorder = _utils._.bind(function () {
            this._recorder = this._recorder || new _window.window['__mp_recorder'](this);
            this._recorder['resumeRecording'](startNewIfInactive);
        }, this);

        if (_utils._.isUndefined(_window.window['__mp_recorder'])) {
            load_extra_bundle(this.get_config('recorder_src'), handleLoadedRecorder);
        } else {
            handleLoadedRecorder();
        }
    }, this);

    /**
     * If the user is sampled or start_session_recording is called, we always load the recorder since it's guaranteed a recording should start.
     * Otherwise, if the recording registry has any records then it's likely there's a recording in progress or orphaned data that needs to be flushed.
     */
    var is_sampled = this.get_config('record_sessions_percent') > 0 && Math.random() * 100 <= this.get_config('record_sessions_percent');
    if (force_start || is_sampled) {
        loadRecorder(true);
    } else {
        this._should_load_recorder().then(function (shouldLoad) {
            if (shouldLoad) {
                loadRecorder(false);
            }
        });
    }
});

MixpanelLib.prototype.start_session_recording = function () {
    this._check_and_start_session_recording(true);
};

MixpanelLib.prototype.stop_session_recording = function () {
    if (this._recorder) {
        this._recorder['stopRecording']();
    }
};

MixpanelLib.prototype.pause_session_recording = function () {
    if (this._recorder) {
        this._recorder['pauseRecording']();
    }
};

MixpanelLib.prototype.resume_session_recording = function () {
    if (this._recorder) {
        this._recorder['resumeRecording']();
    }
};

MixpanelLib.prototype.get_session_recording_properties = function () {
    var props = {};
    var replay_id = this._get_session_replay_id();
    if (replay_id) {
        props['$mp_replay_id'] = replay_id;
    }
    return props;
};

MixpanelLib.prototype.get_session_replay_url = function () {
    var replay_url = null;
    var replay_id = this._get_session_replay_id();
    if (replay_id) {
        var query_params = _utils._.HTTPBuildQuery({
            'replay_id': replay_id,
            'distinct_id': this.get_distinct_id(),
            'token': this.get_config('token')
        });
        replay_url = 'https://mixpanel.com/projects/replay-redirect?' + query_params;
    }
    return replay_url;
};

MixpanelLib.prototype._get_session_replay_id = function () {
    var replay_id = null;
    if (this._recorder) {
        replay_id = this._recorder['replayId'];
    }
    return replay_id || null;
};

// "private" public method to reach into the recorder in test cases
MixpanelLib.prototype.__get_recorder = function () {
    return this._recorder;
};

// Private methods

MixpanelLib.prototype._loaded = function () {
    this.get_config('loaded')(this);
    this._set_default_superprops();
    this['people'].set_once(this['persistence'].get_referrer_info());

    // `store_google` is now deprecated and previously stored UTM parameters are cleared
    // from persistence by default.
    if (this.get_config('store_google') && this.get_config('stop_utm_persistence')) {
        var utm_params = _utils._.info.campaignParams(null);
        _utils._.each(utm_params, (function (_utm_value, utm_key) {
            // We need to unregister persisted UTM parameters so old values
            // are not mixed with the new UTM parameters
            this.unregister(utm_key);
        }).bind(this));
    }
};

// update persistence with info on referrer, UTM params, etc
MixpanelLib.prototype._set_default_superprops = function () {
    this['persistence'].update_search_keyword(_utils.document.referrer);
    // Registering super properties for UTM persistence by 'store_google' is deprecated.
    if (this.get_config('store_google') && !this.get_config('stop_utm_persistence')) {
        this.register(_utils._.info.campaignParams());
    }
    if (this.get_config('save_referrer')) {
        this['persistence'].update_referrer_info(_utils.document.referrer);
    }
};

MixpanelLib.prototype._dom_loaded = function () {
    _utils._.each(this.__dom_loaded_queue, function (item) {
        this._track_dom.apply(this, item);
    }, this);

    if (!this.has_opted_out_tracking()) {
        _utils._.each(this.__request_queue, function (item) {
            this._send_request.apply(this, item);
        }, this);
    }

    delete this.__dom_loaded_queue;
    delete this.__request_queue;
};

MixpanelLib.prototype._track_dom = function (DomClass, args) {
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
MixpanelLib.prototype._prepare_callback = function (callback, data) {
    if (_utils._.isUndefined(callback)) {
        return null;
    }

    if (USE_XHR) {
        var callback_function = function callback_function(response) {
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
        jsc[randomized_cb] = function (response) {
            delete jsc[randomized_cb];
            callback(response, data);
        };
        return callback_string;
    }
};

MixpanelLib.prototype._send_request = function (url, data, options, callback) {
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

    if (!callback && (_utils._.isFunction(options) || typeof options === 'string')) {
        callback = options;
        options = null;
    }
    options = _utils._.extend(DEFAULT_OPTIONS, options || {});
    if (!USE_XHR) {
        options.method = 'GET';
    }
    var use_post = options.method === 'POST';
    var use_sendBeacon = sendBeacon && use_post && options.transport.toLowerCase() === 'sendbeacon';

    // needed to correctly format responses
    var verbose_mode = options.verbose;
    if (data['verbose']) {
        verbose_mode = true;
    }

    if (this.get_config('test')) {
        data['test'] = 1;
    }
    if (verbose_mode) {
        data['verbose'] = 1;
    }
    if (this.get_config('img')) {
        data['img'] = 1;
    }
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

    data['ip'] = this.get_config('ip') ? 1 : 0;
    data['_'] = new Date().getTime().toString();

    if (use_post) {
        body_data = 'data=' + encodeURIComponent(data['data']);
        delete data['data'];
    }

    url += '?' + _utils._.HTTPBuildQuery(data);

    var lib = this;
    if ('img' in data) {
        var img = _utils.document.createElement('img');
        img.src = url;
        _utils.document.body.appendChild(img);
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
            _utils._.each(headers, function (headerValue, headerName) {
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
                if (req.readyState === 4) {
                    // XMLHttpRequest.DONE == 4, except in safari 4
                    if (req.status === 200) {
                        if (callback) {
                            if (verbose_mode) {
                                var response;
                                try {
                                    response = _utils._.JSONDecode(req.responseText);
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
                        if (req.timeout && !req.status && new Date().getTime() - start_time >= req.timeout) {
                            error = 'timeout';
                        } else {
                            error = 'Bad HTTP status: ' + req.status + ' ' + req.statusText;
                        }
                        lib.report_error(error);
                        if (callback) {
                            if (verbose_mode) {
                                var response_headers = req['responseHeaders'] || {};
                                callback({ status: 0, httpStatusCode: req['status'], error: error, retryAfter: response_headers['Retry-After'] });
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
        var script = _utils.document.createElement('script');
        script.type = 'text/javascript';
        script.async = true;
        script.defer = true;
        script.src = url;
        var s = _utils.document.getElementsByTagName('script')[0];
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
MixpanelLib.prototype._execute_array = function (array) {
    var fn_name,
        alias_calls = [],
        other_calls = [],
        tracking_calls = [];
    _utils._.each(array, function (item) {
        if (item) {
            fn_name = item[0];
            if (_utils._.isArray(fn_name)) {
                tracking_calls.push(item); // chained call e.g. mixpanel.get_group().set()
            } else if (typeof item === 'function') {
                    item.call(this);
                } else if (_utils._.isArray(item) && fn_name === 'alias') {
                    alias_calls.push(item);
                } else if (_utils._.isArray(item) && fn_name.indexOf('track') !== -1 && typeof this[fn_name] === 'function') {
                    tracking_calls.push(item);
                } else {
                    other_calls.push(item);
                }
        }
    }, this);

    var execute = function execute(calls, context) {
        _utils._.each(calls, function (item) {
            if (_utils._.isArray(item[0])) {
                // chained call
                var caller = context;
                _utils._.each(item, function (call) {
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

MixpanelLib.prototype.are_batchers_initialized = function () {
    return !!this.request_batchers.events;
};

MixpanelLib.prototype.get_batcher_configs = function () {
    var queue_prefix = '__mpq_' + this.get_config('token');
    var api_routes = this.get_config('api_routes');
    this._batcher_configs = this._batcher_configs || {
        events: { type: 'events', endpoint: '/' + api_routes['track'], queue_key: queue_prefix + '_ev' },
        people: { type: 'people', endpoint: '/' + api_routes['engage'], queue_key: queue_prefix + '_pp' },
        groups: { type: 'groups', endpoint: '/' + api_routes['groups'], queue_key: queue_prefix + '_gr' }
    };
    return this._batcher_configs;
};

MixpanelLib.prototype.init_batchers = function () {
    if (!this.are_batchers_initialized()) {
        var batcher_for = _utils._.bind(function (attrs) {
            return new _requestBatcher.RequestBatcher(attrs.queue_key, {
                libConfig: this['config'],
                errorReporter: this.get_config('error_reporter'),
                sendRequestFunc: _utils._.bind(function (data, options, cb) {
                    this._send_request(this.get_config('api_host') + attrs.endpoint, this._encode_data_for_request(data), options, this._prepare_callback(cb, data));
                }, this),
                beforeSendHook: _utils._.bind(function (item) {
                    return this._run_hook('before_send_' + attrs.type, item);
                }, this),
                stopAllBatchingFunc: _utils._.bind(this.stop_batch_senders, this),
                usePersistence: true,
                enqueueThrottleMs: 10
            });
        }, this);
        var batcher_configs = this.get_batcher_configs();
        this.request_batchers = {
            events: batcher_for(batcher_configs.events),
            people: batcher_for(batcher_configs.people),
            groups: batcher_for(batcher_configs.groups)
        };
    }
    if (this.get_config('batch_autostart')) {
        this.start_batch_senders();
    }
};

MixpanelLib.prototype.start_batch_senders = function () {
    this._batchers_were_started = true;
    if (this.are_batchers_initialized()) {
        this._batch_requests = true;
        _utils._.each(this.request_batchers, function (batcher) {
            batcher.start();
        });
    }
};

MixpanelLib.prototype.stop_batch_senders = function () {
    this._batch_requests = false;
    _utils._.each(this.request_batchers, function (batcher) {
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
MixpanelLib.prototype.push = function (item) {
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
MixpanelLib.prototype.disable = function (events) {
    if (typeof events === 'undefined') {
        this._flags.disable_all_events = true;
    } else {
        this.__disabled_events = this.__disabled_events.concat(events);
    }
};

MixpanelLib.prototype._encode_data_for_request = function (data) {
    var encoded_data = _utils._.JSONEncode(data);
    if (this.get_config('api_payload_format') === PAYLOAD_TYPE_BASE64) {
        encoded_data = _utils._.base64Encode(encoded_data);
    }
    return { 'data': encoded_data };
};

// internal method for handling track vs batch-enqueue logic
MixpanelLib.prototype._track_or_batch = function (options, callback) {
    var truncated_data = _utils._.truncate(options.data, 255);
    var endpoint = options.endpoint;
    var batcher = options.batcher;
    var should_send_immediately = options.should_send_immediately;
    var send_request_options = options.send_request_options || {};
    callback = callback || _utils.NOOP_FUNC;

    var request_enqueued_or_initiated = true;
    var send_request_immediately = _utils._.bind(function () {
        if (!send_request_options.skip_hooks) {
            truncated_data = this._run_hook('before_send_' + options.type, truncated_data);
        }
        if (truncated_data) {
            _utils.console.log('MIXPANEL REQUEST:');
            _utils.console.log(truncated_data);
            return this._send_request(endpoint, this._encode_data_for_request(truncated_data), send_request_options, this._prepare_callback(callback, truncated_data));
        } else {
            return null;
        }
    }, this);

    if (this._batch_requests && !should_send_immediately) {
        batcher.enqueue(truncated_data).then(function (succeeded) {
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
MixpanelLib.prototype.track = (0, _gdprUtils.addOptOutCheckMixpanelLib)(function (event_name, properties, options, callback) {
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
        callback = _utils.NOOP_FUNC;
    }

    if (_utils._.isUndefined(event_name)) {
        this.report_error('No event name provided to mixpanel.track');
        return;
    }

    if (this._event_is_disabled(event_name)) {
        callback(0);
        return;
    }

    // set defaults
    properties = _utils._.extend({}, properties);
    properties['token'] = this.get_config('token');

    // set $duration if time_event was previously called for this event
    var start_timestamp = this['persistence'].remove_event_timer(event_name);
    if (!_utils._.isUndefined(start_timestamp)) {
        var duration_in_ms = new Date().getTime() - start_timestamp;
        properties['$duration'] = parseFloat((duration_in_ms / 1000).toFixed(3));
    }

    this._set_default_superprops();

    var marketing_properties = this.get_config('track_marketing') ? _utils._.info.marketingParams() : {};

    // note: extend writes to the first object, so lets make sure we
    // don't write to the persistence properties object and info
    // properties object by passing in a new object

    // update properties with pageview info and super-properties
    properties = _utils._.extend({}, _utils._.info.properties({ 'mp_loader': this.get_config('mp_loader') }), marketing_properties, this['persistence'].properties(), this.unpersisted_superprops, this.get_session_recording_properties(), properties);

    var property_blacklist = this.get_config('property_blacklist');
    if (_utils._.isArray(property_blacklist)) {
        _utils._.each(property_blacklist, function (blacklisted_prop) {
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
        endpoint: this.get_config('api_host') + '/' + this.get_config('api_routes')['track'],
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
MixpanelLib.prototype.set_group = (0, _gdprUtils.addOptOutCheckMixpanelLib)(function (group_key, group_ids, callback) {
    if (!_utils._.isArray(group_ids)) {
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
MixpanelLib.prototype.add_group = (0, _gdprUtils.addOptOutCheckMixpanelLib)(function (group_key, group_id, callback) {
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
MixpanelLib.prototype.remove_group = (0, _gdprUtils.addOptOutCheckMixpanelLib)(function (group_key, group_id, callback) {
    var old_value = this.get_property(group_key);
    // if the value doesn't exist, the persistent store is unchanged
    if (old_value !== undefined) {
        var idx = old_value.indexOf(group_id);
        if (idx > -1) {
            old_value.splice(idx, 1);
            this.register({ group_key: old_value });
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
MixpanelLib.prototype.track_with_groups = (0, _gdprUtils.addOptOutCheckMixpanelLib)(function (event_name, properties, groups, callback) {
    var tracking_props = _utils._.extend({}, properties || {});
    _utils._.each(groups, function (v, k) {
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
        group = new _mixpanelGroup.MixpanelGroup();
        group._init(this, group_key, group_id);
        this._cached_groups[map_key] = group;
    }
    return group;
};

/**
 * Track a default Mixpanel page view event, which includes extra default event properties to
 * improve page view data.
 *
 * ### Usage:
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
 * ### Notes:
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
MixpanelLib.prototype.track_pageview = (0, _gdprUtils.addOptOutCheckMixpanelLib)(function (properties, options) {
    if (typeof properties !== 'object') {
        properties = {};
    }
    options = options || {};
    var event_name = options['event_name'] || '$mp_web_page_view';

    var default_page_properties = _utils._.extend(_utils._.info.mpPageViewProperties(), _utils._.info.campaignParams(), _utils._.info.clickParams());

    var event_properties = _utils._.extend({}, default_page_properties, properties);

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
MixpanelLib.prototype.track_links = function () {
    return this._track_dom.call(this, _domTrackers.LinkTracker, arguments);
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
MixpanelLib.prototype.track_forms = function () {
    return this._track_dom.call(this, _domTrackers.FormTracker, arguments);
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
MixpanelLib.prototype.time_event = function (event_name) {
    if (_utils._.isUndefined(event_name)) {
        this.report_error('No event name provided to mixpanel.time_event');
        return;
    }

    if (this._event_is_disabled(event_name)) {
        return;
    }

    this['persistence'].set_event_timer(event_name, new Date().getTime());
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
var options_for_register = function options_for_register(days_or_options) {
    var options;
    if (_utils._.isObject(days_or_options)) {
        options = days_or_options;
    } else if (!_utils._.isUndefined(days_or_options)) {
        options = { 'days': days_or_options };
    } else {
        options = {};
    }
    return _utils._.extend({}, REGISTER_DEFAULTS, options);
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
MixpanelLib.prototype.register = function (props, days_or_options) {
    var options = options_for_register(days_or_options);
    if (options['persistent']) {
        this['persistence'].register(props, options['days']);
    } else {
        _utils._.extend(this.unpersisted_superprops, props);
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
MixpanelLib.prototype.register_once = function (props, default_value, days_or_options) {
    var options = options_for_register(days_or_options);
    if (options['persistent']) {
        this['persistence'].register_once(props, default_value, options['days']);
    } else {
        if (typeof default_value === 'undefined') {
            default_value = 'None';
        }
        _utils._.each(props, function (val, prop) {
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
MixpanelLib.prototype.unregister = function (property, options) {
    options = options_for_register(options);
    if (options['persistent']) {
        this['persistence'].unregister(property);
    } else {
        delete this.unpersisted_superprops[property];
    }
};

MixpanelLib.prototype._register_single = function (prop, value) {
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
MixpanelLib.prototype.identify = function (new_distinct_id, _set_callback, _add_callback, _append_callback, _set_once_callback, _union_callback, _unset_callback, _remove_callback) {
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
        this.register({ '$user_id': new_distinct_id });
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
    if (new_distinct_id !== previous_distinct_id && new_distinct_id !== this.get_property(_mixpanelPersistence.ALIAS_ID_KEY)) {
        this.unregister(_mixpanelPersistence.ALIAS_ID_KEY);
        this.register({ 'distinct_id': new_distinct_id });
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
        }, { skip_hooks: true });
    }
};

/**
 * Clears super properties and generates a new random distinct_id for this instance.
 * Useful for clearing data when a user logs out.
 */
MixpanelLib.prototype.reset = function () {
    this['persistence'].clear();
    this._flags.identify_called = false;
    var uuid = _utils._.UUID();
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
MixpanelLib.prototype.get_distinct_id = function () {
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
MixpanelLib.prototype.alias = function (alias, original) {
    // If the $people_distinct_id key exists in persistence, there has been a previous
    // mixpanel.people.identify() call made for this user. It is VERY BAD to make an alias with
    // this ID, as it will duplicate users.
    if (alias === this.get_property(_mixpanelPersistence.PEOPLE_DISTINCT_ID_KEY)) {
        this.report_error('Attempting to create alias for existing People user - aborting.');
        return -2;
    }

    var _this = this;
    if (_utils._.isUndefined(original)) {
        original = this.get_distinct_id();
    }
    if (alias !== original) {
        this._register_single(_mixpanelPersistence.ALIAS_ID_KEY, alias);
        return this.track('$create_alias', {
            'alias': alias,
            'distinct_id': original
        }, {
            skip_hooks: true
        }, function () {
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
MixpanelLib.prototype.name_tag = function (name_tag) {
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
MixpanelLib.prototype.set_config = function (config) {
    if (_utils._.isObject(config)) {
        _utils._.extend(this['config'], config);

        var new_batch_size = config['batch_size'];
        if (new_batch_size) {
            _utils._.each(this.request_batchers, function (batcher) {
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
        _config2['default'].DEBUG = _config2['default'].DEBUG || this.get_config('debug');

        if ('autocapture' in config && this.autocapture) {
            this.autocapture.init();
        }
    }
};

/**
 * returns the current config object for the library.
 */
MixpanelLib.prototype.get_config = function (prop_name) {
    return this['config'][prop_name];
};

/**
 * Fetch a hook function from config, with safe default, and run it
 * against the given arguments
 * @param {string} hook_name which hook to retrieve
 * @returns {any|null} return value of user-provided hook, or null if nothing was returned
 */
MixpanelLib.prototype._run_hook = function (hook_name) {
    var ret = (this['config']['hooks'][hook_name] || IDENTITY_FUNC).apply(this, _utils.slice.call(arguments, 1));
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
MixpanelLib.prototype.get_property = function (property_name) {
    return this['persistence'].load_prop([property_name]);
};

MixpanelLib.prototype.toString = function () {
    var name = this.get_config('name');
    if (name !== PRIMARY_INSTANCE_NAME) {
        name = PRIMARY_INSTANCE_NAME + '.' + name;
    }
    return name;
};

MixpanelLib.prototype._event_is_disabled = function (event_name) {
    return _utils._.isBlockedUA(_utils.userAgent) || this._flags.disable_all_events || _utils._.include(this.__disabled_events, event_name);
};

// perform some housekeeping around GDPR opt-in/out state
MixpanelLib.prototype._gdpr_init = function () {
    var is_localStorage_requested = this.get_config('opt_out_tracking_persistence_type') === 'localStorage';

    // try to convert opt-in/out cookies to localStorage if possible
    if (is_localStorage_requested && _utils._.localStorage.is_supported()) {
        if (!this.has_opted_in_tracking() && this.has_opted_in_tracking({ 'persistence_type': 'cookie' })) {
            this.opt_in_tracking({ 'enable_persistence': false });
        }
        if (!this.has_opted_out_tracking() && this.has_opted_out_tracking({ 'persistence_type': 'cookie' })) {
            this.opt_out_tracking({ 'clear_persistence': false });
        }
        this.clear_opt_in_out_tracking({
            'persistence_type': 'cookie',
            'enable_persistence': false
        });
    }

    // check whether the user has already opted out - if so, clear & disable persistence
    if (this.has_opted_out_tracking()) {
        this._gdpr_update_persistence({ 'clear_persistence': true });

        // check whether we should opt out by default
        // note: we don't clear persistence here by default since opt-out default state is often
        //       used as an initial state while GDPR information is being collected
    } else if (!this.has_opted_in_tracking() && (this.get_config('opt_out_tracking_by_default') || _utils._.cookie.get('mp_optout'))) {
            _utils._.cookie.remove('mp_optout');
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
MixpanelLib.prototype._gdpr_update_persistence = function (options) {
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
        this.stop_batch_senders();
        this.stop_session_recording();
    } else {
        // only start batchers after opt-in if they have previously been started
        // in order to avoid unintentionally starting up batching for the first time
        if (this._batchers_were_started) {
            this.start_batch_senders();
        }
    }
};

// call a base gdpr function after constructing the appropriate token and options args
MixpanelLib.prototype._gdpr_call_func = function (func, options) {
    options = _utils._.extend({
        'track': _utils._.bind(this.track, this),
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
    if (!_utils._.localStorage.is_supported()) {
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
 * ### Usage:
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
MixpanelLib.prototype.opt_in_tracking = function (options) {
    options = _utils._.extend({
        'enable_persistence': true
    }, options);

    this._gdpr_call_func(_gdprUtils.optIn, options);
    this._gdpr_update_persistence(options);
};

/**
 * Opt the user out of data tracking and cookies/localstorage for this Mixpanel instance
 *
 * ### Usage:
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
MixpanelLib.prototype.opt_out_tracking = function (options) {
    options = _utils._.extend({
        'clear_persistence': true,
        'delete_user': true
    }, options);

    // delete user and clear charges since these methods may be disabled by opt-out
    if (options['delete_user'] && this['people'] && this['people']._identify_called()) {
        this['people'].delete_user();
        this['people'].clear_charges();
    }

    this._gdpr_call_func(_gdprUtils.optOut, options);
    this._gdpr_update_persistence(options);
};

/**
 * Check whether the user has opted in to data tracking and cookies/localstorage for this Mixpanel instance
 *
 * ### Usage:
 *
 *     var has_opted_in = mixpanel.has_opted_in_tracking();
 *     // use has_opted_in value
 *
 * @param {Object} [options] A dictionary of config options to override
 * @param {string} [options.persistence_type=localStorage] Persistence mechanism used - cookie or localStorage - falls back to cookie if localStorage is unavailable
 * @param {string} [options.cookie_prefix=__mp_opt_in_out] Custom prefix to be used in the cookie/localstorage name
 * @returns {boolean} current opt-in status
 */
MixpanelLib.prototype.has_opted_in_tracking = function (options) {
    return this._gdpr_call_func(_gdprUtils.hasOptedIn, options);
};

/**
 * Check whether the user has opted out of data tracking and cookies/localstorage for this Mixpanel instance
 *
 * ### Usage:
 *
 *     var has_opted_out = mixpanel.has_opted_out_tracking();
 *     // use has_opted_out value
 *
 * @param {Object} [options] A dictionary of config options to override
 * @param {string} [options.persistence_type=localStorage] Persistence mechanism used - cookie or localStorage - falls back to cookie if localStorage is unavailable
 * @param {string} [options.cookie_prefix=__mp_opt_in_out] Custom prefix to be used in the cookie/localstorage name
 * @returns {boolean} current opt-out status
 */
MixpanelLib.prototype.has_opted_out_tracking = function (options) {
    return this._gdpr_call_func(_gdprUtils.hasOptedOut, options);
};

/**
 * Clear the user's opt in/out status of data tracking and cookies/localstorage for this Mixpanel instance
 *
 * ### Usage:
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
MixpanelLib.prototype.clear_opt_in_out_tracking = function (options) {
    options = _utils._.extend({
        'enable_persistence': true
    }, options);

    this._gdpr_call_func(_gdprUtils.clearOptInOut, options);
    this._gdpr_update_persistence(options);
};

MixpanelLib.prototype.report_error = function (msg, err) {
    _utils.console.error.apply(_utils.console.error, arguments);
    try {
        if (!err && !(msg instanceof Error)) {
            msg = new Error(msg);
        }
        this.get_config('error_reporter')(msg, err);
    } catch (err) {
        _utils.console.error(err);
    }
};

// EXPORTS (for closure compiler)

// MixpanelLib Exports
MixpanelLib.prototype['init'] = MixpanelLib.prototype.init;
MixpanelLib.prototype['reset'] = MixpanelLib.prototype.reset;
MixpanelLib.prototype['disable'] = MixpanelLib.prototype.disable;
MixpanelLib.prototype['time_event'] = MixpanelLib.prototype.time_event;
MixpanelLib.prototype['track'] = MixpanelLib.prototype.track;
MixpanelLib.prototype['track_links'] = MixpanelLib.prototype.track_links;
MixpanelLib.prototype['track_forms'] = MixpanelLib.prototype.track_forms;
MixpanelLib.prototype['track_pageview'] = MixpanelLib.prototype.track_pageview;
MixpanelLib.prototype['register'] = MixpanelLib.prototype.register;
MixpanelLib.prototype['register_once'] = MixpanelLib.prototype.register_once;
MixpanelLib.prototype['unregister'] = MixpanelLib.prototype.unregister;
MixpanelLib.prototype['identify'] = MixpanelLib.prototype.identify;
MixpanelLib.prototype['alias'] = MixpanelLib.prototype.alias;
MixpanelLib.prototype['name_tag'] = MixpanelLib.prototype.name_tag;
MixpanelLib.prototype['set_config'] = MixpanelLib.prototype.set_config;
MixpanelLib.prototype['get_config'] = MixpanelLib.prototype.get_config;
MixpanelLib.prototype['get_property'] = MixpanelLib.prototype.get_property;
MixpanelLib.prototype['get_distinct_id'] = MixpanelLib.prototype.get_distinct_id;
MixpanelLib.prototype['toString'] = MixpanelLib.prototype.toString;
MixpanelLib.prototype['opt_out_tracking'] = MixpanelLib.prototype.opt_out_tracking;
MixpanelLib.prototype['opt_in_tracking'] = MixpanelLib.prototype.opt_in_tracking;
MixpanelLib.prototype['has_opted_out_tracking'] = MixpanelLib.prototype.has_opted_out_tracking;
MixpanelLib.prototype['has_opted_in_tracking'] = MixpanelLib.prototype.has_opted_in_tracking;
MixpanelLib.prototype['clear_opt_in_out_tracking'] = MixpanelLib.prototype.clear_opt_in_out_tracking;
MixpanelLib.prototype['get_group'] = MixpanelLib.prototype.get_group;
MixpanelLib.prototype['set_group'] = MixpanelLib.prototype.set_group;
MixpanelLib.prototype['add_group'] = MixpanelLib.prototype.add_group;
MixpanelLib.prototype['remove_group'] = MixpanelLib.prototype.remove_group;
MixpanelLib.prototype['track_with_groups'] = MixpanelLib.prototype.track_with_groups;
MixpanelLib.prototype['start_batch_senders'] = MixpanelLib.prototype.start_batch_senders;
MixpanelLib.prototype['stop_batch_senders'] = MixpanelLib.prototype.stop_batch_senders;
MixpanelLib.prototype['start_session_recording'] = MixpanelLib.prototype.start_session_recording;
MixpanelLib.prototype['stop_session_recording'] = MixpanelLib.prototype.stop_session_recording;
MixpanelLib.prototype['pause_session_recording'] = MixpanelLib.prototype.pause_session_recording;
MixpanelLib.prototype['resume_session_recording'] = MixpanelLib.prototype.resume_session_recording;
MixpanelLib.prototype['get_session_recording_properties'] = MixpanelLib.prototype.get_session_recording_properties;
MixpanelLib.prototype['get_session_replay_url'] = MixpanelLib.prototype.get_session_replay_url;
MixpanelLib.prototype['get_tab_id'] = MixpanelLib.prototype.get_tab_id;
MixpanelLib.prototype['DEFAULT_API_ROUTES'] = DEFAULT_API_ROUTES;

// Exports intended only for testing
MixpanelLib.prototype['__get_recorder'] = MixpanelLib.prototype.__get_recorder;

// MixpanelPersistence Exports
_mixpanelPersistence.MixpanelPersistence.prototype['properties'] = _mixpanelPersistence.MixpanelPersistence.prototype.properties;
_mixpanelPersistence.MixpanelPersistence.prototype['update_search_keyword'] = _mixpanelPersistence.MixpanelPersistence.prototype.update_search_keyword;
_mixpanelPersistence.MixpanelPersistence.prototype['update_referrer_info'] = _mixpanelPersistence.MixpanelPersistence.prototype.update_referrer_info;
_mixpanelPersistence.MixpanelPersistence.prototype['get_cross_subdomain'] = _mixpanelPersistence.MixpanelPersistence.prototype.get_cross_subdomain;
_mixpanelPersistence.MixpanelPersistence.prototype['clear'] = _mixpanelPersistence.MixpanelPersistence.prototype.clear;

var instances = {};
var extend_mp = function extend_mp() {
    // add all the sub mixpanel instances
    _utils._.each(instances, function (instance, name) {
        if (name !== PRIMARY_INSTANCE_NAME) {
            mixpanel_master[name] = instance;
        }
    });

    // add private functions as _
    mixpanel_master['_'] = _utils._;
};

var override_mp_init_func = function override_mp_init_func() {
    // we override the snippets init function to handle the case where a
    // user initializes the mixpanel library after the script loads & runs
    mixpanel_master['init'] = function (token, config, name) {
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
                _window.window[PRIMARY_INSTANCE_NAME] = mixpanel_master;
            }
            extend_mp();
        }
    };
};

var add_dom_loaded_handler = function add_dom_loaded_handler() {
    // Cross browser DOM Loaded support
    function dom_loaded_handler() {
        // function flag since we only want to execute this once
        if (dom_loaded_handler.done) {
            return;
        }
        dom_loaded_handler.done = true;

        DOM_LOADED = true;
        ENQUEUE_REQUESTS = false;

        _utils._.each(instances, function (inst) {
            inst._dom_loaded();
        });
    }

    function do_scroll_check() {
        try {
            _utils.document.documentElement.doScroll('left');
        } catch (e) {
            setTimeout(do_scroll_check, 1);
            return;
        }

        dom_loaded_handler();
    }

    if (_utils.document.addEventListener) {
        if (_utils.document.readyState === 'complete') {
            // safari 4 can fire the DOMContentLoaded event before loading all
            // external JS (including this file). you will see some copypasta
            // on the internet that checks for 'complete' and 'loaded', but
            // 'loaded' is an IE thing
            dom_loaded_handler();
        } else {
            _utils.document.addEventListener('DOMContentLoaded', dom_loaded_handler, false);
        }
    } else if (_utils.document.attachEvent) {
        // IE
        _utils.document.attachEvent('onreadystatechange', dom_loaded_handler);

        // check to make sure we arn't in a frame
        var toplevel = false;
        try {
            toplevel = _window.window.frameElement === null;
        } catch (e) {
            // noop
        }

        if (_utils.document.documentElement.doScroll && toplevel) {
            do_scroll_check();
        }
    }

    // fallback handler, always will work
    _utils._.register_event(_window.window, 'load', dom_loaded_handler, true);
};

function init_from_snippet(bundle_loader) {
    load_extra_bundle = bundle_loader;
    init_type = INIT_SNIPPET;
    mixpanel_master = _window.window[PRIMARY_INSTANCE_NAME];

    // Initialization
    if (_utils._.isUndefined(mixpanel_master)) {
        // mixpanel wasn't initialized properly, report error and quit
        _utils.console.critical('"mixpanel" object not initialized. Ensure you are using the latest version of the Mixpanel JS Library along with the snippet we provide.');
        return;
    }
    if (mixpanel_master['__loaded'] || mixpanel_master['config'] && mixpanel_master['persistence']) {
        // lib has already been loaded at least once; we don't want to override the global object this time so bomb early
        _utils.console.critical('The Mixpanel library has already been downloaded at least once. Ensure that the Mixpanel code snippet only appears once on the page (and is not double-loaded by a tag manager) in order to avoid errors.');
        return;
    }
    var snippet_version = mixpanel_master['__SV'] || 0;
    if (snippet_version < 1.1) {
        // mixpanel wasn't initialized properly, report error and quit
        _utils.console.critical('Version mismatch; please ensure you\'re using the latest version of the Mixpanel code snippet.');
        return;
    }

    // Load instances of the Mixpanel Library
    _utils._.each(mixpanel_master['_i'], function (item) {
        if (item && _utils._.isArray(item)) {
            instances[item[item.length - 1]] = create_mplib.apply(this, item);
        }
    });

    override_mp_init_func();
    mixpanel_master['init']();

    // Fire loaded events after updating the window's mixpanel object
    _utils._.each(instances, function (instance) {
        instance._loaded();
    });

    add_dom_loaded_handler();
}

function init_as_module(bundle_loader) {
    load_extra_bundle = bundle_loader;
    init_type = INIT_MODULE;
    mixpanel_master = new MixpanelLib();

    override_mp_init_func();
    mixpanel_master['init']();
    add_dom_loaded_handler();

    return mixpanel_master;
}

},{"./autocapture":5,"./config":7,"./dom-trackers":8,"./gdpr-utils":9,"./mixpanel-group":13,"./mixpanel-people":14,"./mixpanel-persistence":15,"./recorder/utils":21,"./request-batcher":22,"./storage/indexed-db":25,"./utils":27,"./window":28}],13:[function(require,module,exports){
/* eslint camelcase: "off" */
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _gdprUtils = require('./gdpr-utils');

var _apiActions = require('./api-actions');

var _utils = require('./utils');

/**
 * Mixpanel Group Object
 * @constructor
 */
var MixpanelGroup = function MixpanelGroup() {};

_utils._.extend(MixpanelGroup.prototype, _apiActions.apiActions);

MixpanelGroup.prototype._init = function (mixpanel_instance, group_key, group_id) {
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
MixpanelGroup.prototype.set = (0, _gdprUtils.addOptOutCheckMixpanelGroup)(function (prop, to, callback) {
    var data = this.set_action(prop, to);
    if (_utils._.isObject(prop)) {
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
MixpanelGroup.prototype.set_once = (0, _gdprUtils.addOptOutCheckMixpanelGroup)(function (prop, to, callback) {
    var data = this.set_once_action(prop, to);
    if (_utils._.isObject(prop)) {
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
MixpanelGroup.prototype.unset = (0, _gdprUtils.addOptOutCheckMixpanelGroup)(function (prop, callback) {
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
MixpanelGroup.prototype.union = (0, _gdprUtils.addOptOutCheckMixpanelGroup)(function (list_name, values, callback) {
    if (_utils._.isObject(list_name)) {
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
MixpanelGroup.prototype['delete'] = (0, _gdprUtils.addOptOutCheckMixpanelGroup)(function (callback) {
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
MixpanelGroup.prototype.remove = (0, _gdprUtils.addOptOutCheckMixpanelGroup)(function (list_name, value, callback) {
    var data = this.remove_action(list_name, value);
    return this._send_request(data, callback);
});

MixpanelGroup.prototype._send_request = function (data, callback) {
    data['$group_key'] = this._group_key;
    data['$group_id'] = this._group_id;
    data['$token'] = this._get_config('token');

    var date_encoded_data = _utils._.encodeDates(data);
    return this._mixpanel._track_or_batch({
        type: 'groups',
        data: date_encoded_data,
        endpoint: this._get_config('api_host') + '/' + this._get_config('api_routes')['groups'],
        batcher: this._mixpanel.request_batchers.groups
    }, callback);
};

MixpanelGroup.prototype._is_reserved_property = function (prop) {
    return prop === '$group_key' || prop === '$group_id';
};

MixpanelGroup.prototype._get_config = function (conf) {
    return this._mixpanel.get_config(conf);
};

MixpanelGroup.prototype.toString = function () {
    return this._mixpanel.toString() + '.group.' + this._group_key + '.' + this._group_id;
};

// MixpanelGroup Exports
MixpanelGroup.prototype['remove'] = MixpanelGroup.prototype.remove;
MixpanelGroup.prototype['set'] = MixpanelGroup.prototype.set;
MixpanelGroup.prototype['set_once'] = MixpanelGroup.prototype.set_once;
MixpanelGroup.prototype['union'] = MixpanelGroup.prototype.union;
MixpanelGroup.prototype['unset'] = MixpanelGroup.prototype.unset;
MixpanelGroup.prototype['toString'] = MixpanelGroup.prototype.toString;

exports.MixpanelGroup = MixpanelGroup;

},{"./api-actions":4,"./gdpr-utils":9,"./utils":27}],14:[function(require,module,exports){
/* eslint camelcase: "off" */
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _gdprUtils = require('./gdpr-utils');

var _apiActions = require('./api-actions');

var _utils = require('./utils');

/**
 * Mixpanel People Object
 * @constructor
 */
var MixpanelPeople = function MixpanelPeople() {};

_utils._.extend(MixpanelPeople.prototype, _apiActions.apiActions);

MixpanelPeople.prototype._init = function (mixpanel_instance) {
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
MixpanelPeople.prototype.set = (0, _gdprUtils.addOptOutCheckMixpanelPeople)(function (prop, to, callback) {
    var data = this.set_action(prop, to);
    if (_utils._.isObject(prop)) {
        callback = to;
    }
    // make sure that the referrer info has been updated and saved
    if (this._get_config('save_referrer')) {
        this._mixpanel['persistence'].update_referrer_info(document.referrer);
    }

    // update $set object with default people properties
    data[_apiActions.SET_ACTION] = _utils._.extend({}, _utils._.info.people_properties(), data[_apiActions.SET_ACTION]);
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
MixpanelPeople.prototype.set_once = (0, _gdprUtils.addOptOutCheckMixpanelPeople)(function (prop, to, callback) {
    var data = this.set_once_action(prop, to);
    if (_utils._.isObject(prop)) {
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
MixpanelPeople.prototype.unset = (0, _gdprUtils.addOptOutCheckMixpanelPeople)(function (prop, callback) {
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
MixpanelPeople.prototype.increment = (0, _gdprUtils.addOptOutCheckMixpanelPeople)(function (prop, by, callback) {
    var data = {};
    var $add = {};
    if (_utils._.isObject(prop)) {
        _utils._.each(prop, function (v, k) {
            if (!this._is_reserved_property(k)) {
                if (isNaN(parseFloat(v))) {
                    _utils.console.error('Invalid increment value passed to mixpanel.people.increment - must be a number');
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
        if (_utils._.isUndefined(by)) {
            by = 1;
        }
        $add[prop] = by;
    }
    data[_apiActions.ADD_ACTION] = $add;

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
MixpanelPeople.prototype.append = (0, _gdprUtils.addOptOutCheckMixpanelPeople)(function (list_name, value, callback) {
    if (_utils._.isObject(list_name)) {
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
MixpanelPeople.prototype.remove = (0, _gdprUtils.addOptOutCheckMixpanelPeople)(function (list_name, value, callback) {
    if (_utils._.isObject(list_name)) {
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
MixpanelPeople.prototype.union = (0, _gdprUtils.addOptOutCheckMixpanelPeople)(function (list_name, values, callback) {
    if (_utils._.isObject(list_name)) {
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
MixpanelPeople.prototype.track_charge = (0, _gdprUtils.addOptOutCheckMixpanelPeople)(function (amount, properties, callback) {
    if (!_utils._.isNumber(amount)) {
        amount = parseFloat(amount);
        if (isNaN(amount)) {
            _utils.console.error('Invalid value passed to mixpanel.people.track_charge - must be a number');
            return;
        }
    }

    return this.append('$transactions', _utils._.extend({
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
MixpanelPeople.prototype.clear_charges = function (callback) {
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
MixpanelPeople.prototype.delete_user = function () {
    if (!this._identify_called()) {
        _utils.console.error('mixpanel.people.delete_user() requires you to call identify() first');
        return;
    }
    var data = { '$delete': this._mixpanel.get_distinct_id() };
    return this._send_request(data);
};

MixpanelPeople.prototype.toString = function () {
    return this._mixpanel.toString() + '.people';
};

MixpanelPeople.prototype._send_request = function (data, callback) {
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

    var date_encoded_data = _utils._.encodeDates(data);

    if (!this._identify_called()) {
        this._enqueue(data);
        if (!_utils._.isUndefined(callback)) {
            if (this._get_config('verbose')) {
                callback({ status: -1, error: null });
            } else {
                callback(-1);
            }
        }
        return _utils._.truncate(date_encoded_data, 255);
    }

    return this._mixpanel._track_or_batch({
        type: 'people',
        data: date_encoded_data,
        endpoint: this._get_config('api_host') + '/' + this._get_config('api_routes')['engage'],
        batcher: this._mixpanel.request_batchers.people
    }, callback);
};

MixpanelPeople.prototype._get_config = function (conf_var) {
    return this._mixpanel.get_config(conf_var);
};

MixpanelPeople.prototype._identify_called = function () {
    return this._mixpanel._flags.identify_called === true;
};

// Queue up engage operations if identify hasn't been called yet.
MixpanelPeople.prototype._enqueue = function (data) {
    if (_apiActions.SET_ACTION in data) {
        this._mixpanel['persistence']._add_to_people_queue(_apiActions.SET_ACTION, data);
    } else if (_apiActions.SET_ONCE_ACTION in data) {
        this._mixpanel['persistence']._add_to_people_queue(_apiActions.SET_ONCE_ACTION, data);
    } else if (_apiActions.UNSET_ACTION in data) {
        this._mixpanel['persistence']._add_to_people_queue(_apiActions.UNSET_ACTION, data);
    } else if (_apiActions.ADD_ACTION in data) {
        this._mixpanel['persistence']._add_to_people_queue(_apiActions.ADD_ACTION, data);
    } else if (_apiActions.APPEND_ACTION in data) {
        this._mixpanel['persistence']._add_to_people_queue(_apiActions.APPEND_ACTION, data);
    } else if (_apiActions.REMOVE_ACTION in data) {
        this._mixpanel['persistence']._add_to_people_queue(_apiActions.REMOVE_ACTION, data);
    } else if (_apiActions.UNION_ACTION in data) {
        this._mixpanel['persistence']._add_to_people_queue(_apiActions.UNION_ACTION, data);
    } else {
        _utils.console.error('Invalid call to _enqueue():', data);
    }
};

MixpanelPeople.prototype._flush_one_queue = function (action, action_method, callback, queue_to_params_fn) {
    var _this = this;
    var queued_data = _utils._.extend({}, this._mixpanel['persistence'].load_queue(action));
    var action_params = queued_data;

    if (!_utils._.isUndefined(queued_data) && _utils._.isObject(queued_data) && !_utils._.isEmptyObject(queued_data)) {
        _this._mixpanel['persistence']._pop_from_people_queue(action, queued_data);
        _this._mixpanel['persistence'].save();
        if (queue_to_params_fn) {
            action_params = queue_to_params_fn(queued_data);
        }
        action_method.call(_this, action_params, function (response, data) {
            // on bad response, we want to add it back to the queue
            if (response === 0) {
                _this._mixpanel['persistence']._add_to_people_queue(action, queued_data);
            }
            if (!_utils._.isUndefined(callback)) {
                callback(response, data);
            }
        });
    }
};

// Flush queued engage operations - order does not matter,
// and there are network level race conditions anyway
MixpanelPeople.prototype._flush = function (_set_callback, _add_callback, _append_callback, _set_once_callback, _union_callback, _unset_callback, _remove_callback) {
    var _this = this;

    this._flush_one_queue(_apiActions.SET_ACTION, this.set, _set_callback);
    this._flush_one_queue(_apiActions.SET_ONCE_ACTION, this.set_once, _set_once_callback);
    this._flush_one_queue(_apiActions.UNSET_ACTION, this.unset, _unset_callback, function (queue) {
        return _utils._.keys(queue);
    });
    this._flush_one_queue(_apiActions.ADD_ACTION, this.increment, _add_callback);
    this._flush_one_queue(_apiActions.UNION_ACTION, this.union, _union_callback);

    // we have to fire off each $append individually since there is
    // no concat method server side
    var $append_queue = this._mixpanel['persistence'].load_queue(_apiActions.APPEND_ACTION);
    if (!_utils._.isUndefined($append_queue) && _utils._.isArray($append_queue) && $append_queue.length) {
        var $append_item;
        var append_callback = function append_callback(response, data) {
            if (response === 0) {
                _this._mixpanel['persistence']._add_to_people_queue(_apiActions.APPEND_ACTION, $append_item);
            }
            if (!_utils._.isUndefined(_append_callback)) {
                _append_callback(response, data);
            }
        };
        for (var i = $append_queue.length - 1; i >= 0; i--) {
            $append_queue = this._mixpanel['persistence'].load_queue(_apiActions.APPEND_ACTION);
            $append_item = $append_queue.pop();
            _this._mixpanel['persistence'].save();
            if (!_utils._.isEmptyObject($append_item)) {
                _this.append($append_item, append_callback);
            }
        }
    }

    // same for $remove
    var $remove_queue = this._mixpanel['persistence'].load_queue(_apiActions.REMOVE_ACTION);
    if (!_utils._.isUndefined($remove_queue) && _utils._.isArray($remove_queue) && $remove_queue.length) {
        var $remove_item;
        var remove_callback = function remove_callback(response, data) {
            if (response === 0) {
                _this._mixpanel['persistence']._add_to_people_queue(_apiActions.REMOVE_ACTION, $remove_item);
            }
            if (!_utils._.isUndefined(_remove_callback)) {
                _remove_callback(response, data);
            }
        };
        for (var j = $remove_queue.length - 1; j >= 0; j--) {
            $remove_queue = this._mixpanel['persistence'].load_queue(_apiActions.REMOVE_ACTION);
            $remove_item = $remove_queue.pop();
            _this._mixpanel['persistence'].save();
            if (!_utils._.isEmptyObject($remove_item)) {
                _this.remove($remove_item, remove_callback);
            }
        }
    }
};

MixpanelPeople.prototype._is_reserved_property = function (prop) {
    return prop === '$distinct_id' || prop === '$token' || prop === '$device_id' || prop === '$user_id' || prop === '$had_persisted_distinct_id';
};

// MixpanelPeople Exports
MixpanelPeople.prototype['set'] = MixpanelPeople.prototype.set;
MixpanelPeople.prototype['set_once'] = MixpanelPeople.prototype.set_once;
MixpanelPeople.prototype['unset'] = MixpanelPeople.prototype.unset;
MixpanelPeople.prototype['increment'] = MixpanelPeople.prototype.increment;
MixpanelPeople.prototype['append'] = MixpanelPeople.prototype.append;
MixpanelPeople.prototype['remove'] = MixpanelPeople.prototype.remove;
MixpanelPeople.prototype['union'] = MixpanelPeople.prototype.union;
MixpanelPeople.prototype['track_charge'] = MixpanelPeople.prototype.track_charge;
MixpanelPeople.prototype['clear_charges'] = MixpanelPeople.prototype.clear_charges;
MixpanelPeople.prototype['delete_user'] = MixpanelPeople.prototype.delete_user;
MixpanelPeople.prototype['toString'] = MixpanelPeople.prototype.toString;

exports.MixpanelPeople = MixpanelPeople;

},{"./api-actions":4,"./gdpr-utils":9,"./utils":27}],15:[function(require,module,exports){
/* eslint camelcase: "off" */

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _apiActions = require('./api-actions');

var _utils = require('./utils');

/*
 * Constants
 */
/** @const */var SET_QUEUE_KEY = '__mps';
/** @const */var SET_ONCE_QUEUE_KEY = '__mpso';
/** @const */var UNSET_QUEUE_KEY = '__mpus';
/** @const */var ADD_QUEUE_KEY = '__mpa';
/** @const */var APPEND_QUEUE_KEY = '__mpap';
/** @const */var REMOVE_QUEUE_KEY = '__mpr';
/** @const */var UNION_QUEUE_KEY = '__mpu';
// This key is deprecated, but we want to check for it to see whether aliasing is allowed.
/** @const */var PEOPLE_DISTINCT_ID_KEY = '$people_distinct_id';
/** @const */var ALIAS_ID_KEY = '__alias';
/** @const */var EVENT_TIMERS_KEY = '__timers';
/** @const */var RESERVED_PROPERTIES = [SET_QUEUE_KEY, SET_ONCE_QUEUE_KEY, UNSET_QUEUE_KEY, ADD_QUEUE_KEY, APPEND_QUEUE_KEY, REMOVE_QUEUE_KEY, UNION_QUEUE_KEY, PEOPLE_DISTINCT_ID_KEY, ALIAS_ID_KEY, EVENT_TIMERS_KEY];

/**
 * Mixpanel Persistence Object
 * @constructor
 */
var MixpanelPersistence = function MixpanelPersistence(config) {
    this['props'] = {};
    this.campaign_params_saved = false;

    if (config['persistence_name']) {
        this.name = 'mp_' + config['persistence_name'];
    } else {
        this.name = 'mp_' + config['token'] + '_mixpanel';
    }

    var storage_type = config['persistence'];
    if (storage_type !== 'cookie' && storage_type !== 'localStorage') {
        _utils.console.critical('Unknown persistence type ' + storage_type + '; falling back to cookie');
        storage_type = config['persistence'] = 'cookie';
    }

    if (storage_type === 'localStorage' && _utils._.localStorage.is_supported()) {
        this.storage = _utils._.localStorage;
    } else {
        this.storage = _utils._.cookie;
    }

    this.load();
    this.update_config(config);
    this.upgrade();
    this.save();
};

MixpanelPersistence.prototype.properties = function () {
    var p = {};

    this.load();

    // Filter out reserved properties
    _utils._.each(this['props'], function (v, k) {
        if (!_utils._.include(RESERVED_PROPERTIES, k)) {
            p[k] = v;
        }
    });
    return p;
};

MixpanelPersistence.prototype.load = function () {
    if (this.disabled) {
        return;
    }

    var entry = this.storage.parse(this.name);

    if (entry) {
        this['props'] = _utils._.extend({}, entry);
    }
};

MixpanelPersistence.prototype.upgrade = function () {
    var old_cookie, old_localstorage;

    // if transferring from cookie to localStorage or vice-versa, copy existing
    // super properties over to new storage mode
    if (this.storage === _utils._.localStorage) {
        old_cookie = _utils._.cookie.parse(this.name);

        _utils._.cookie.remove(this.name);
        _utils._.cookie.remove(this.name, true);

        if (old_cookie) {
            this.register_once(old_cookie);
        }
    } else if (this.storage === _utils._.cookie) {
        old_localstorage = _utils._.localStorage.parse(this.name);

        _utils._.localStorage.remove(this.name);

        if (old_localstorage) {
            this.register_once(old_localstorage);
        }
    }
};

MixpanelPersistence.prototype.save = function () {
    if (this.disabled) {
        return;
    }

    this.storage.set(this.name, _utils._.JSONEncode(this['props']), this.expire_days, this.cross_subdomain, this.secure, this.cross_site, this.cookie_domain);
};

MixpanelPersistence.prototype.load_prop = function (key) {
    this.load();
    return this['props'][key];
};

MixpanelPersistence.prototype.remove = function () {
    // remove both domain and subdomain cookies
    this.storage.remove(this.name, false, this.cookie_domain);
    this.storage.remove(this.name, true, this.cookie_domain);
};

// removes the storage entry and deletes all loaded data
// forced name for tests
MixpanelPersistence.prototype.clear = function () {
    this.remove();
    this['props'] = {};
};

/**
* @param {Object} props
* @param {*=} default_value
* @param {number=} days
*/
MixpanelPersistence.prototype.register_once = function (props, default_value, days) {
    if (_utils._.isObject(props)) {
        if (typeof default_value === 'undefined') {
            default_value = 'None';
        }
        this.expire_days = typeof days === 'undefined' ? this.default_expiry : days;

        this.load();

        _utils._.each(props, function (val, prop) {
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
MixpanelPersistence.prototype.register = function (props, days) {
    if (_utils._.isObject(props)) {
        this.expire_days = typeof days === 'undefined' ? this.default_expiry : days;

        this.load();
        _utils._.extend(this['props'], props);
        this.save();

        return true;
    }
    return false;
};

MixpanelPersistence.prototype.unregister = function (prop) {
    this.load();
    if (prop in this['props']) {
        delete this['props'][prop];
        this.save();
    }
};

MixpanelPersistence.prototype.update_search_keyword = function (referrer) {
    this.register(_utils._.info.searchInfo(referrer));
};

// EXPORTED METHOD, we test this directly.
MixpanelPersistence.prototype.update_referrer_info = function (referrer) {
    // If referrer doesn't exist, we want to note the fact that it was type-in traffic.
    this.register_once({
        '$initial_referrer': referrer || '$direct',
        '$initial_referring_domain': _utils._.info.referringDomain(referrer) || '$direct'
    }, '');
};

MixpanelPersistence.prototype.get_referrer_info = function () {
    return _utils._.strip_empty_properties({
        '$initial_referrer': this['props']['$initial_referrer'],
        '$initial_referring_domain': this['props']['$initial_referring_domain']
    });
};

MixpanelPersistence.prototype.update_config = function (config) {
    this.default_expiry = this.expire_days = config['cookie_expiration'];
    this.set_disabled(config['disable_persistence']);
    this.set_cookie_domain(config['cookie_domain']);
    this.set_cross_site(config['cross_site_cookie']);
    this.set_cross_subdomain(config['cross_subdomain_cookie']);
    this.set_secure(config['secure_cookie']);
};

MixpanelPersistence.prototype.set_disabled = function (disabled) {
    this.disabled = disabled;
    if (this.disabled) {
        this.remove();
    } else {
        this.save();
    }
};

MixpanelPersistence.prototype.set_cookie_domain = function (cookie_domain) {
    if (cookie_domain !== this.cookie_domain) {
        this.remove();
        this.cookie_domain = cookie_domain;
        this.save();
    }
};

MixpanelPersistence.prototype.set_cross_site = function (cross_site) {
    if (cross_site !== this.cross_site) {
        this.cross_site = cross_site;
        this.remove();
        this.save();
    }
};

MixpanelPersistence.prototype.set_cross_subdomain = function (cross_subdomain) {
    if (cross_subdomain !== this.cross_subdomain) {
        this.cross_subdomain = cross_subdomain;
        this.remove();
        this.save();
    }
};

MixpanelPersistence.prototype.get_cross_subdomain = function () {
    return this.cross_subdomain;
};

MixpanelPersistence.prototype.set_secure = function (secure) {
    if (secure !== this.secure) {
        this.secure = secure ? true : false;
        this.remove();
        this.save();
    }
};

MixpanelPersistence.prototype._add_to_people_queue = function (queue, data) {
    var q_key = this._get_queue_key(queue),
        q_data = data[queue],
        set_q = this._get_or_create_queue(_apiActions.SET_ACTION),
        set_once_q = this._get_or_create_queue(_apiActions.SET_ONCE_ACTION),
        unset_q = this._get_or_create_queue(_apiActions.UNSET_ACTION),
        add_q = this._get_or_create_queue(_apiActions.ADD_ACTION),
        union_q = this._get_or_create_queue(_apiActions.UNION_ACTION),
        remove_q = this._get_or_create_queue(_apiActions.REMOVE_ACTION, []),
        append_q = this._get_or_create_queue(_apiActions.APPEND_ACTION, []);

    if (q_key === SET_QUEUE_KEY) {
        // Update the set queue - we can override any existing values
        _utils._.extend(set_q, q_data);
        // if there was a pending increment, override it
        // with the set.
        this._pop_from_people_queue(_apiActions.ADD_ACTION, q_data);
        // if there was a pending union, override it
        // with the set.
        this._pop_from_people_queue(_apiActions.UNION_ACTION, q_data);
        this._pop_from_people_queue(_apiActions.UNSET_ACTION, q_data);
    } else if (q_key === SET_ONCE_QUEUE_KEY) {
        // only queue the data if there is not already a set_once call for it.
        _utils._.each(q_data, function (v, k) {
            if (!(k in set_once_q)) {
                set_once_q[k] = v;
            }
        });
        this._pop_from_people_queue(_apiActions.UNSET_ACTION, q_data);
    } else if (q_key === UNSET_QUEUE_KEY) {
        _utils._.each(q_data, function (prop) {

            // undo previously-queued actions on this key
            _utils._.each([set_q, set_once_q, add_q, union_q], function (enqueued_obj) {
                if (prop in enqueued_obj) {
                    delete enqueued_obj[prop];
                }
            });
            _utils._.each(append_q, function (append_obj) {
                if (prop in append_obj) {
                    delete append_obj[prop];
                }
            });

            unset_q[prop] = true;
        });
    } else if (q_key === ADD_QUEUE_KEY) {
        _utils._.each(q_data, function (v, k) {
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
        this._pop_from_people_queue(_apiActions.UNSET_ACTION, q_data);
    } else if (q_key === UNION_QUEUE_KEY) {
        _utils._.each(q_data, function (v, k) {
            if (_utils._.isArray(v)) {
                if (!(k in union_q)) {
                    union_q[k] = [];
                }
                // Prevent duplicate values
                _utils._.each(v, function (item) {
                    if (!_utils._.include(union_q[k], item)) {
                        union_q[k].push(item);
                    }
                });
            }
        });
        this._pop_from_people_queue(_apiActions.UNSET_ACTION, q_data);
    } else if (q_key === REMOVE_QUEUE_KEY) {
        remove_q.push(q_data);
        this._pop_from_people_queue(_apiActions.APPEND_ACTION, q_data);
    } else if (q_key === APPEND_QUEUE_KEY) {
        append_q.push(q_data);
        this._pop_from_people_queue(_apiActions.UNSET_ACTION, q_data);
    }

    _utils.console.log('MIXPANEL PEOPLE REQUEST (QUEUED, PENDING IDENTIFY):');
    _utils.console.log(data);

    this.save();
};

MixpanelPersistence.prototype._pop_from_people_queue = function (queue, data) {
    var q = this['props'][this._get_queue_key(queue)];
    if (!_utils._.isUndefined(q)) {
        _utils._.each(data, function (v, k) {
            if (queue === _apiActions.APPEND_ACTION || queue === _apiActions.REMOVE_ACTION) {
                // list actions: only remove if both k+v match
                // e.g. remove should not override append in a case like
                // append({foo: 'bar'}); remove({foo: 'qux'})
                _utils._.each(q, function (queued_action) {
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

MixpanelPersistence.prototype.load_queue = function (queue) {
    return this.load_prop(this._get_queue_key(queue));
};

MixpanelPersistence.prototype._get_queue_key = function (queue) {
    if (queue === _apiActions.SET_ACTION) {
        return SET_QUEUE_KEY;
    } else if (queue === _apiActions.SET_ONCE_ACTION) {
        return SET_ONCE_QUEUE_KEY;
    } else if (queue === _apiActions.UNSET_ACTION) {
        return UNSET_QUEUE_KEY;
    } else if (queue === _apiActions.ADD_ACTION) {
        return ADD_QUEUE_KEY;
    } else if (queue === _apiActions.APPEND_ACTION) {
        return APPEND_QUEUE_KEY;
    } else if (queue === _apiActions.REMOVE_ACTION) {
        return REMOVE_QUEUE_KEY;
    } else if (queue === _apiActions.UNION_ACTION) {
        return UNION_QUEUE_KEY;
    } else {
        _utils.console.error('Invalid queue:', queue);
    }
};

MixpanelPersistence.prototype._get_or_create_queue = function (queue, default_val) {
    var key = this._get_queue_key(queue);
    default_val = _utils._.isUndefined(default_val) ? {} : default_val;
    return this['props'][key] || (this['props'][key] = default_val);
};

MixpanelPersistence.prototype.set_event_timer = function (event_name, timestamp) {
    var timers = this.load_prop(EVENT_TIMERS_KEY) || {};
    timers[event_name] = timestamp;
    this['props'][EVENT_TIMERS_KEY] = timers;
    this.save();
};

MixpanelPersistence.prototype.remove_event_timer = function (event_name) {
    var timers = this.load_prop(EVENT_TIMERS_KEY) || {};
    var timestamp = timers[event_name];
    if (!_utils._.isUndefined(timestamp)) {
        delete this['props'][EVENT_TIMERS_KEY][event_name];
        this.save();
    }
    return timestamp;
};

exports.MixpanelPersistence = MixpanelPersistence;
exports.SET_QUEUE_KEY = SET_QUEUE_KEY;
exports.SET_ONCE_QUEUE_KEY = SET_ONCE_QUEUE_KEY;
exports.UNSET_QUEUE_KEY = UNSET_QUEUE_KEY;
exports.ADD_QUEUE_KEY = ADD_QUEUE_KEY;
exports.APPEND_QUEUE_KEY = APPEND_QUEUE_KEY;
exports.REMOVE_QUEUE_KEY = REMOVE_QUEUE_KEY;
exports.UNION_QUEUE_KEY = UNION_QUEUE_KEY;
exports.PEOPLE_DISTINCT_ID_KEY = PEOPLE_DISTINCT_ID_KEY;
exports.ALIAS_ID_KEY = ALIAS_ID_KEY;
exports.EVENT_TIMERS_KEY = EVENT_TIMERS_KEY;

},{"./api-actions":4,"./utils":27}],16:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _window = require('./window');

/**
 * Promise polyfill sourced from https://github.com/getify/native-promise-only.
 * Modified to
 *  - remove UMD wrapper and export as an object, so that we don't globally polyfill Promise.
 *  - rename access notation for dynamically referenced props to avoid minification, e.g. this.__NPO__ -> this['__NPO__']
*/

/*! Native Promise Only
    v0.8.1 (c) Kyle Simpson
    MIT License: http://getify.mit-license.org
*/

/*jshint validthis:true */
'use strict';

var setImmediate = _window.window['setImmediate'];
var builtInProp,
    cycle,
    schedulingQueue,
    ToString = Object.prototype.toString,
    timer = typeof setImmediate !== 'undefined' ? function timer(fn) {
    return setImmediate(fn);
} : setTimeout;

// dammit, IE8.
try {
    Object.defineProperty({}, 'x', {});
    builtInProp = function builtInProp(obj, name, val, config) {
        return Object.defineProperty(obj, name, {
            value: val,
            writable: true,
            configurable: config !== false
        });
    };
} catch (err) {
    builtInProp = function builtInProp(obj, name, val) {
        obj[name] = val;
        return obj;
    };
}

// Note: using a queue instead of array for efficiency
schedulingQueue = (function Queue() {
    var first, last, item;

    function Item(fn, self) {
        this.fn = fn;
        this.self = self;
        this.next = void 0;
    }

    return {
        add: function add(fn, self) {
            item = new Item(fn, self);
            if (last) {
                last.next = item;
            } else {
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

function schedule(fn, self) {
    schedulingQueue.add(fn, self);
    if (!cycle) {
        cycle = timer(schedulingQueue.drain);
    }
}

// promise duck typing
function isThenable(o) {
    var _then,
        oType = typeof o;

    if (o !== null && (oType === 'object' || oType === 'function')) {
        _then = o.then;
    }
    return typeof _then === 'function' ? _then : false;
}

function notify() {
    for (var i = 0; i < this.chain.length; i++) {
        notifyIsolated(this, this.state === 1 ? this.chain[i].success : this.chain[i].failure, this.chain[i]);
    }
    this.chain.length = 0;
}

// NOTE: This is a separate function to isolate
// the `try..catch` so that other code can be
// optimized better
function notifyIsolated(self, cb, chain) {
    var ret, _then;
    try {
        if (cb === false) {
            chain.reject(self.msg);
        } else {
            if (cb === true) {
                ret = self.msg;
            } else {
                ret = cb.call(void 0, self.msg);
            }

            if (ret === chain.promise) {
                chain.reject(TypeError('Promise-chain cycle'));
            }
            // eslint-disable-next-line no-cond-assign
            else if (_then = isThenable(ret)) {
                    _then.call(ret, chain.resolve, chain.reject);
                } else {
                    chain.resolve(ret);
                }
        }
    } catch (err) {
        chain.reject(err);
    }
}

function resolve(msg) {
    var _then,
        self = this;

    // already triggered?
    if (self.triggered) {
        return;
    }

    self.triggered = true;

    // unwrap
    if (self.def) {
        self = self.def;
    }

    try {
        // eslint-disable-next-line no-cond-assign
        if (_then = isThenable(msg)) {
            schedule(function () {
                var defWrapper = new MakeDefWrapper(self);
                try {
                    _then.call(msg, function $resolve$() {
                        resolve.apply(defWrapper, arguments);
                    }, function $reject$() {
                        reject.apply(defWrapper, arguments);
                    });
                } catch (err) {
                    reject.call(defWrapper, err);
                }
            });
        } else {
            self.msg = msg;
            self.state = 1;
            if (self.chain.length > 0) {
                schedule(notify, self);
            }
        }
    } catch (err) {
        reject.call(new MakeDefWrapper(self), err);
    }
}

function reject(msg) {
    var self = this;

    // already triggered?
    if (self.triggered) {
        return;
    }

    self.triggered = true;

    // unwrap
    if (self.def) {
        self = self.def;
    }

    self.msg = msg;
    self.state = 2;
    if (self.chain.length > 0) {
        schedule(notify, self);
    }
}

function iteratePromises(Constructor, arr, resolver, rejecter) {
    for (var idx = 0; idx < arr.length; idx++) {
        (function IIFE(idx) {
            Constructor.resolve(arr[idx]).then(function $resolver$(msg) {
                resolver(idx, msg);
            }, rejecter);
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

    this['then'] = function then(success, failure) {
        var o = {
            success: typeof success === 'function' ? success : true,
            failure: typeof failure === 'function' ? failure : false
        };
        // Note: `then(..)` itself can be borrowed to be used against
        // a different promise constructor for making the chained promise,
        // by substituting a different `this` binding.
        o.promise = new this.constructor(function extractChain(resolve, reject) {
            if (typeof resolve !== 'function' || typeof reject !== 'function') {
                throw TypeError('Not a function');
            }

            o.resolve = resolve;
            o.reject = reject;
        });
        def.chain.push(o);

        if (def.state !== 0) {
            schedule(notify, def);
        }

        return o.promise;
    };
    this['catch'] = function $catch$(failure) {
        return this.then(void 0, failure);
    };

    try {
        executor.call(void 0, function publicResolve(msg) {
            resolve.call(def, msg);
        }, function publicReject(msg) {
            reject.call(def, msg);
        });
    } catch (err) {
        reject.call(def, err);
    }
}

var PromisePrototype = builtInProp({}, 'constructor', NpoPromise,
/*configurable=*/false);

// Note: Android 4 cannot use `Object.defineProperty(..)` here
NpoPromise.prototype = PromisePrototype;

// built-in "brand" to signal an "uninitialized" promise
builtInProp(PromisePrototype, '__NPO__', 0,
/*configurable=*/false);

builtInProp(NpoPromise, 'resolve', function Promise$resolve(msg) {
    var Constructor = this;

    // spec mandated checks
    // note: best "isPromise" check that's practical for now
    if (msg && typeof msg === 'object' && msg['__NPO__'] === 1) {
        return msg;
    }

    return new Constructor(function executor(resolve, reject) {
        if (typeof resolve !== 'function' || typeof reject !== 'function') {
            throw TypeError('Not a function');
        }

        resolve(msg);
    });
});

builtInProp(NpoPromise, 'reject', function Promise$reject(msg) {
    return new this(function executor(resolve, reject) {
        if (typeof resolve !== 'function' || typeof reject !== 'function') {
            throw TypeError('Not a function');
        }

        reject(msg);
    });
});

builtInProp(NpoPromise, 'all', function Promise$all(arr) {
    var Constructor = this;

    // spec mandated checks
    if (ToString.call(arr) !== '[object Array]') {
        return Constructor.reject(TypeError('Not an array'));
    }
    if (arr.length === 0) {
        return Constructor.resolve([]);
    }

    return new Constructor(function executor(resolve, reject) {
        if (typeof resolve !== 'function' || typeof reject !== 'function') {
            throw TypeError('Not a function');
        }

        var len = arr.length,
            msgs = Array(len),
            count = 0;

        iteratePromises(Constructor, arr, function resolver(idx, msg) {
            msgs[idx] = msg;
            if (++count === len) {
                resolve(msgs);
            }
        }, reject);
    });
});

builtInProp(NpoPromise, 'race', function Promise$race(arr) {
    var Constructor = this;

    // spec mandated checks
    if (ToString.call(arr) !== '[object Array]') {
        return Constructor.reject(TypeError('Not an array'));
    }

    return new Constructor(function executor(resolve, reject) {
        if (typeof resolve !== 'function' || typeof reject !== 'function') {
            throw TypeError('Not a function');
        }

        iteratePromises(Constructor, arr, function resolver(idx, msg) {
            resolve(msg);
        }, reject);
    });
});

var PromisePolyfill;
if (typeof Promise !== 'undefined' && Promise.toString().indexOf('[native code]') !== -1) {
    exports.Promise = PromisePolyfill = Promise;
} else {
    exports.Promise = PromisePolyfill = NpoPromise;
}

exports.Promise = PromisePolyfill;
exports.NpoPromise = NpoPromise;

},{"./window":28}],17:[function(require,module,exports){
'use strict';

var _window = require('../window');

var _recorder = require('./recorder');

_window.window['__mp_recorder'] = _recorder.MixpanelRecorder;

},{"../window":28,"./recorder":18}],18:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _rrweb = require('rrweb');

var _promisePolyfill = require('../promise-polyfill');

var _sessionRecording = require('./session-recording');

var _recordingRegistry = require('./recording-registry');

var _utils = require('../utils');

// eslint-disable-line camelcase

var logger = (0, _utils.console_with_prefix)('recorder');

/**
 * Recorder API: bundles rrweb and and exposes methods to start and stop recordings.
 * @param {Object} [options.mixpanelInstance] - reference to the core MixpanelLib
*/
var MixpanelRecorder = function MixpanelRecorder(mixpanelInstance, rrwebRecord, sharedLockStorage) {
    this.mixpanelInstance = mixpanelInstance;
    this.rrwebRecord = rrwebRecord || _rrweb.record;
    this.sharedLockStorage = sharedLockStorage;

    /**
     * @member {import('./registry').RecordingRegistry}
     */
    this.recordingRegistry = new _recordingRegistry.RecordingRegistry({
        mixpanelInstance: this.mixpanelInstance,
        errorReporter: logger.error,
        sharedLockStorage: sharedLockStorage
    });
    this._flushInactivePromise = this.recordingRegistry.flushInactiveRecordings();

    this.activeRecording = null;
};

MixpanelRecorder.prototype.startRecording = function (options) {
    options = options || {};
    if (this.activeRecording && !this.activeRecording.isRrwebStopped()) {
        logger.log('Recording already in progress, skipping startRecording.');
        return;
    }

    var onIdleTimeout = (function () {
        logger.log('Idle timeout reached, restarting recording.');
        this.resetRecording();
    }).bind(this);

    var onMaxLengthReached = (function () {
        logger.log('Max recording length reached, stopping recording.');
        this.resetRecording();
    }).bind(this);

    var onBatchSent = (function () {
        this.recordingRegistry.setActiveRecording(this.activeRecording.serialize());
        this['__flushPromise'] = this.activeRecording.batcher._flushPromise;
    }).bind(this);

    /**
     * @type {import('./session-recording').SessionRecordingOptions}
     */
    var sessionRecordingOptions = {
        mixpanelInstance: this.mixpanelInstance,
        onBatchSent: onBatchSent,
        onIdleTimeout: onIdleTimeout,
        onMaxLengthReached: onMaxLengthReached,
        replayId: _utils._.UUID(),
        rrwebRecord: this.rrwebRecord,
        sharedLockStorage: this.sharedLockStorage
    };

    if (options.activeSerializedRecording) {
        this.activeRecording = _sessionRecording.SessionRecording.deserialize(options.activeSerializedRecording, sessionRecordingOptions);
    } else {
        this.activeRecording = new _sessionRecording.SessionRecording(sessionRecordingOptions);
    }

    this.activeRecording.startRecording(options.shouldStopBatcher);
    return this.recordingRegistry.setActiveRecording(this.activeRecording.serialize());
};

MixpanelRecorder.prototype.stopRecording = function () {
    var stopPromise = this._stopCurrentRecording(false);
    this.recordingRegistry.clearActiveRecording();
    this.activeRecording = null;
    return stopPromise;
};

MixpanelRecorder.prototype.pauseRecording = function () {
    return this._stopCurrentRecording(false);
};

MixpanelRecorder.prototype._stopCurrentRecording = function (skipFlush) {
    if (this.activeRecording) {
        return this.activeRecording.stopRecording(skipFlush);
    }
    return _promisePolyfill.Promise.resolve();
};

MixpanelRecorder.prototype.resumeRecording = function (startNewIfInactive) {
    if (this.activeRecording && this.activeRecording.isRrwebStopped()) {
        this.activeRecording.startRecording(false);
        return _promisePolyfill.Promise.resolve(null);
    }

    return this.recordingRegistry.getActiveRecording().then((function (activeSerializedRecording) {
        if (activeSerializedRecording) {
            return this.startRecording({ activeSerializedRecording: activeSerializedRecording });
        } else if (startNewIfInactive) {
            return this.startRecording({ shouldStopBatcher: false });
        } else {
            logger.log('No resumable recording found.');
            return null;
        }
    }).bind(this));
};

MixpanelRecorder.prototype.resetRecording = function () {
    this.stopRecording();
    this.startRecording({ shouldStopBatcher: true });
};

MixpanelRecorder.prototype.getActiveReplayId = function () {
    if (this.activeRecording && !this.activeRecording.isRrwebStopped()) {
        return this.activeRecording.replayId;
    } else {
        return null;
    }
};

// getter so that older mixpanel-core versions can still retrieve the replay ID
// when pulling the latest recorder bundle from the CDN
Object.defineProperty(MixpanelRecorder.prototype, 'replayId', {
    get: function get() {
        return this.getActiveReplayId();
    }
});

exports.MixpanelRecorder = MixpanelRecorder;

},{"../promise-polyfill":16,"../utils":27,"./recording-registry":19,"./session-recording":20,"rrweb":3}],19:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _promisePolyfill = require('../promise-polyfill');

var _storageIndexedDb = require('../storage/indexed-db');

var _sessionRecording = require('./session-recording');

var _utils = require('./utils');

/**
 * Module for handling the storage and retrieval of recording metadata as well as any active recordings.
 * Makes sure that only one tab can be recording at a time.
 */
var RecordingRegistry = function RecordingRegistry(options) {
    this.idb = new _storageIndexedDb.IDBStorageWrapper(_storageIndexedDb.RECORDING_REGISTRY_STORE_NAME);
    this.errorReporter = options.errorReporter;
    this.mixpanelInstance = options.mixpanelInstance;
    this.sharedLockStorage = options.sharedLockStorage;
};

RecordingRegistry.prototype.handleError = function (err) {
    this.errorReporter('IndexedDB error: ', err);
};

/**
 * @param {import('./session-recording').SerializedRecording} serializedRecording
 */
RecordingRegistry.prototype.setActiveRecording = function (serializedRecording) {
    var tabId = serializedRecording['tabId'];
    if (!tabId) {
        console.warn('No tab ID is set, cannot persist recording metadata.');
        return _promisePolyfill.Promise.resolve();
    }

    return this.idb.init().then((function () {
        return this.idb.setItem(tabId, serializedRecording);
    }).bind(this))['catch'](this.handleError.bind(this));
};

/**
 * @returns {Promise<import('./session-recording').SerializedRecording>}
 */
RecordingRegistry.prototype.getActiveRecording = function () {
    return this.idb.init().then((function () {
        return this.idb.getItem(this.mixpanelInstance.get_tab_id());
    }).bind(this)).then((function (serializedRecording) {
        return (0, _utils.isRecordingExpired)(serializedRecording) ? null : serializedRecording;
    }).bind(this))['catch'](this.handleError.bind(this));
};

RecordingRegistry.prototype.clearActiveRecording = function () {
    // mark recording as expired instead of deleting it in case the page unloads mid-flush and doesn't make it to ingestion.
    // this will ensure the next pageload will flush the remaining events, but not try to continue the recording.
    return this.getActiveRecording().then((function (serializedRecording) {
        if (serializedRecording) {
            serializedRecording['maxExpires'] = 0;
            return this.setActiveRecording(serializedRecording);
        }
    }).bind(this))['catch'](this.handleError.bind(this));
};

/**
 * Flush any inactive recordings from the registry to minimize data loss.
 * The main idea here is that we can flush remaining rrweb events on the next page load if a tab is closed mid-batch.
 */
RecordingRegistry.prototype.flushInactiveRecordings = function () {
    return this.idb.init().then((function () {
        return this.idb.getAll();
    }).bind(this)).then((function (serializedRecordings) {
        // clean up any expired recordings from the registry, non-expired ones may be active in other tabs
        var unloadPromises = serializedRecordings.filter(function (serializedRecording) {
            return (0, _utils.isRecordingExpired)(serializedRecording);
        }).map((function (serializedRecording) {
            var sessionRecording = _sessionRecording.SessionRecording.deserialize(serializedRecording, {
                mixpanelInstance: this.mixpanelInstance,
                sharedLockStorage: this.sharedLockStorage
            });
            return sessionRecording.unloadPersistedData().then((function () {
                // expired recording was successfully flushed, we can clean it up from the registry
                return this.idb.removeItem(serializedRecording['tabId']);
            }).bind(this))['catch'](this.handleError.bind(this));
        }).bind(this));

        return _promisePolyfill.Promise.all(unloadPromises);
    }).bind(this))['catch'](this.handleError.bind(this));
};

exports.RecordingRegistry = RecordingRegistry;

},{"../promise-polyfill":16,"../storage/indexed-db":25,"./session-recording":20,"./utils":21}],20:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _window = require('../window');

var _rrwebTypes = require('@rrweb/types');

var _utils = require('../utils');

// eslint-disable-line camelcase

var _storageIndexedDb = require('../storage/indexed-db');

var _gdprUtils = require('../gdpr-utils');

var _requestBatcher = require('../request-batcher');

var _config = require('../config');

var _config2 = _interopRequireDefault(_config);

var _utils2 = require('./utils');

var logger = (0, _utils.console_with_prefix)('recorder');
var CompressionStream = _window.window['CompressionStream'];

var RECORDER_BATCHER_LIB_CONFIG = {
    'batch_size': 1000,
    'batch_flush_interval_ms': 10 * 1000,
    'batch_request_timeout_ms': 90 * 1000,
    'batch_autostart': true
};

var ACTIVE_SOURCES = new Set([_rrwebTypes.IncrementalSource.MouseMove, _rrwebTypes.IncrementalSource.MouseInteraction, _rrwebTypes.IncrementalSource.Scroll, _rrwebTypes.IncrementalSource.ViewportResize, _rrwebTypes.IncrementalSource.Input, _rrwebTypes.IncrementalSource.TouchMove, _rrwebTypes.IncrementalSource.MediaInteraction, _rrwebTypes.IncrementalSource.Drag, _rrwebTypes.IncrementalSource.Selection]);

function isUserEvent(ev) {
    return ev.type === _rrwebTypes.EventType.IncrementalSnapshot && ACTIVE_SOURCES.has(ev.data.source);
}

/**
 * @typedef {Object} SerializedRecording
 * @property {number} idleExpires
 * @property {number} maxExpires
 * @property {number} replayStartTime
 * @property {number} seqNo
 * @property {string} batchStartUrl
 * @property {string} replayId
 * @property {string} tabId
 * @property {string} replayStartUrl
 */

/**
 * @typedef {Object} SessionRecordingOptions
 * @property {Object} [options.mixpanelInstance] - reference to the core MixpanelLib
 * @property {String} [options.replayId] - unique uuid for a single replay
 * @property {Function} [options.onIdleTimeout] - callback when a recording reaches idle timeout
 * @property {Function} [options.onMaxLengthReached] - callback when a recording reaches its maximum length
 * @property {Function} [options.rrwebRecord] - rrweb's `record` function
 * @property {Function} [options.onBatchSent] - callback when a batch of events is sent to the server
 * @property {Storage} [options.sharedLockStorage] - optional storage for shared lock, used for test dependency injection
 * optional properties for deserialization:
 * @property {number} idleExpires
 * @property {number} maxExpires
 * @property {number} replayStartTime
 * @property {number} seqNo
 * @property {string} batchStartUrl
 * @property {string} replayStartUrl
 */

/**
 * This class encapsulates a single session recording and its lifecycle.
 * @param {SessionRecordingOptions} options
 */
var SessionRecording = function SessionRecording(options) {
    this._mixpanel = options.mixpanelInstance;
    this._onIdleTimeout = options.onIdleTimeout || _utils.NOOP_FUNC;
    this._onMaxLengthReached = options.onMaxLengthReached || _utils.NOOP_FUNC;
    this._onBatchSent = options.onBatchSent || _utils.NOOP_FUNC;
    this._rrwebRecord = options.rrwebRecord || null;

    // internal rrweb stopRecording function
    this._stopRecording = null;
    this.replayId = options.replayId;

    this.batchStartUrl = options.batchStartUrl || null;
    this.replayStartUrl = options.replayStartUrl || null;
    this.idleExpires = options.idleExpires || null;
    this.maxExpires = options.maxExpires || null;
    this.replayStartTime = options.replayStartTime || null;
    this.seqNo = options.seqNo || 0;

    this.idleTimeoutId = null;
    this.maxTimeoutId = null;

    this.recordMaxMs = _utils.MAX_RECORDING_MS;
    this.recordMinMs = 0;

    // disable persistence if localStorage is not supported
    // request-queue will automatically disable persistence if indexedDB fails to initialize
    var usePersistence = (0, _utils.localStorageSupported)(options.sharedLockStorage, true);

    // each replay has its own batcher key to avoid conflicts between rrweb events of different recordings
    // this will be important when persistence is introduced
    this.batcherKey = '__mprec_' + this.getConfig('name') + '_' + this.getConfig('token') + '_' + this.replayId;
    this.queueStorage = new _storageIndexedDb.IDBStorageWrapper(_storageIndexedDb.RECORDING_EVENTS_STORE_NAME);
    this.batcher = new _requestBatcher.RequestBatcher(this.batcherKey, {
        errorReporter: this.reportError.bind(this),
        flushOnlyOnInterval: true,
        libConfig: RECORDER_BATCHER_LIB_CONFIG,
        sendRequestFunc: this.flushEventsWithOptOut.bind(this),
        queueStorage: this.queueStorage,
        sharedLockStorage: options.sharedLockStorage,
        usePersistence: usePersistence,
        stopAllBatchingFunc: this.stopRecording.bind(this),

        // increased throttle and shared lock timeout because recording events are very high frequency.
        // this will minimize the amount of lock contention between enqueued events.
        // for session recordings there is a lock for each tab anyway, so there's no risk of deadlock between tabs.
        enqueueThrottleMs: _utils2.RECORD_ENQUEUE_THROTTLE_MS,
        sharedLockTimeoutMS: 10 * 1000
    });
};

SessionRecording.prototype.unloadPersistedData = function () {
    this.batcher.stop();
    return this.batcher.flush().then((function () {
        return this.queueStorage.removeItem(this.batcherKey);
    }).bind(this));
};

SessionRecording.prototype.getConfig = function (configVar) {
    return this._mixpanel.get_config(configVar);
};

// Alias for getConfig, used by the common addOptOutCheckMixpanelLib function which
// reaches into this class instance and expects the snake case version of the function.
// eslint-disable-next-line camelcase
SessionRecording.prototype.get_config = function (configVar) {
    return this.getConfig(configVar);
};

SessionRecording.prototype.startRecording = function (shouldStopBatcher) {
    if (this._rrwebRecord === null) {
        this.reportError('rrweb record function not provided. ');
        return;
    }

    if (this._stopRecording !== null) {
        logger.log('Recording already in progress, skipping startRecording.');
        return;
    }

    this.recordMaxMs = this.getConfig('record_max_ms');
    if (this.recordMaxMs > _utils.MAX_RECORDING_MS) {
        this.recordMaxMs = _utils.MAX_RECORDING_MS;
        logger.critical('record_max_ms cannot be greater than ' + _utils.MAX_RECORDING_MS + 'ms. Capping value.');
    }

    if (!this.maxExpires) {
        this.maxExpires = new Date().getTime() + this.recordMaxMs;
    }

    this.recordMinMs = this.getConfig('record_min_ms');
    if (this.recordMinMs > _utils.MAX_VALUE_FOR_MIN_RECORDING_MS) {
        this.recordMinMs = _utils.MAX_VALUE_FOR_MIN_RECORDING_MS;
        logger.critical('record_min_ms cannot be greater than ' + _utils.MAX_VALUE_FOR_MIN_RECORDING_MS + 'ms. Capping value.');
    }

    if (!this.replayStartTime) {
        this.replayStartTime = new Date().getTime();
        this.batchStartUrl = _utils._.info.currentUrl();
        this.replayStartUrl = _utils._.info.currentUrl();
    }

    if (shouldStopBatcher || this.recordMinMs > 0) {
        // the primary case for shouldStopBatcher is when we're starting recording after a reset
        // and don't want to send anything over the network until there's
        // actual user activity
        // this also applies if the minimum recording length has not been hit yet
        // so that we don't send data until we know the recording will be long enough
        this.batcher.stop();
    } else {
        this.batcher.start();
    }

    var resetIdleTimeout = (function () {
        clearTimeout(this.idleTimeoutId);
        var idleTimeoutMs = this.getConfig('record_idle_timeout_ms');
        this.idleTimeoutId = setTimeout(this._onIdleTimeout, idleTimeoutMs);
        this.idleExpires = new Date().getTime() + idleTimeoutMs;
    }).bind(this);

    var blockSelector = this.getConfig('record_block_selector');
    if (blockSelector === '' || blockSelector === null) {
        blockSelector = undefined;
    }

    try {
        this._stopRecording = this._rrwebRecord({
            'emit': (function (ev) {
                if (isUserEvent(ev)) {
                    if (this.batcher.stopped && new Date().getTime() - this.replayStartTime >= this.recordMinMs) {
                        // start flushing again after user activity
                        this.batcher.start();
                    }
                    resetIdleTimeout();
                }
                // promise only used to await during tests
                this.__enqueuePromise = this.batcher.enqueue(ev);
            }).bind(this),
            'blockClass': this.getConfig('record_block_class'),
            'blockSelector': blockSelector,
            'collectFonts': this.getConfig('record_collect_fonts'),
            'dataURLOptions': { // canvas image options (https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toDataURL)
                'type': 'image/webp',
                'quality': 0.6
            },
            'maskAllInputs': true,
            'maskTextClass': this.getConfig('record_mask_text_class'),
            'maskTextSelector': this.getConfig('record_mask_text_selector'),
            'recordCanvas': this.getConfig('record_canvas'),
            'sampling': {
                'canvas': 15
            }
        });
    } catch (err) {
        this.reportError('Unexpected error when starting rrweb recording.', err);
    }

    if (typeof this._stopRecording !== 'function') {
        this.reportError('rrweb failed to start, skipping this recording.');
        this._stopRecording = null;
        this.stopRecording(); // stop batcher looping and any timeouts
        return;
    }

    resetIdleTimeout();

    var maxTimeoutMs = this.maxExpires - new Date().getTime();
    this.maxTimeoutId = setTimeout(this._onMaxLengthReached.bind(this), maxTimeoutMs);
};

SessionRecording.prototype.stopRecording = function (skipFlush) {
    if (!this.isRrwebStopped()) {
        try {
            this._stopRecording();
        } catch (err) {
            this.reportError('Error with rrweb stopRecording', err);
        }
        this._stopRecording = null;
    }

    var flushPromise;
    if (this.batcher.stopped) {
        // never got user activity to flush after reset, so just clear the batcher
        flushPromise = this.batcher.clear();
    } else if (!skipFlush) {
        // flush any remaining events from running batcher
        flushPromise = this.batcher.flush();
    }
    this.batcher.stop();

    clearTimeout(this.idleTimeoutId);
    clearTimeout(this.maxTimeoutId);
    return flushPromise;
};

SessionRecording.prototype.isRrwebStopped = function () {
    return this._stopRecording === null;
};

/**
 * Flushes the current batch of events to the server, but passes an opt-out callback to make sure
 * we stop recording and dump any queued events if the user has opted out.
 */
SessionRecording.prototype.flushEventsWithOptOut = function (data, options, cb) {
    var onOptOut = (function (code) {
        // addOptOutCheckMixpanelLib invokes this function with code=0 when the user has opted out
        if (code === 0) {
            this.stopRecording();
            cb({ error: 'Tracking has been opted out, stopping recording.' });
        }
    }).bind(this);

    this._flushEvents(data, options, cb, onOptOut);
};

/**
 * @returns {SerializedRecording}
 */
SessionRecording.prototype.serialize = function () {
    // don't break if mixpanel instance was destroyed at some point
    var tabId;
    try {
        tabId = this._mixpanel.get_tab_id();
    } catch (e) {
        this.reportError('Error getting tab ID for serialization ', e);
        tabId = null;
    }

    return {
        'replayId': this.replayId,
        'seqNo': this.seqNo,
        'replayStartTime': this.replayStartTime,
        'batchStartUrl': this.batchStartUrl,
        'replayStartUrl': this.replayStartUrl,
        'idleExpires': this.idleExpires,
        'maxExpires': this.maxExpires,
        'tabId': tabId
    };
};

/**
 * @static
 * @param {SerializedRecording} serializedRecording
 * @param {SessionRecordingOptions} options
 * @returns {SessionRecording}
 */
SessionRecording.deserialize = function (serializedRecording, options) {
    var recording = new SessionRecording(_utils._.extend({}, options, {
        replayId: serializedRecording['replayId'],
        batchStartUrl: serializedRecording['batchStartUrl'],
        replayStartUrl: serializedRecording['replayStartUrl'],
        idleExpires: serializedRecording['idleExpires'],
        maxExpires: serializedRecording['maxExpires'],
        replayStartTime: serializedRecording['replayStartTime'],
        seqNo: serializedRecording['seqNo'],
        sharedLockStorage: options.sharedLockStorage
    }));

    return recording;
};

SessionRecording.prototype._sendRequest = function (currentReplayId, reqParams, reqBody, callback) {
    var onSuccess = (function (response, responseBody) {
        // Update batch specific props only if the request was successful to guarantee ordering.
        // RequestBatcher will always flush the next batch after the previous one succeeds.
        // extra check to see if the replay ID has changed so that we don't increment the seqNo on the wrong replay
        if (response.status === 200 && this.replayId === currentReplayId) {
            this.seqNo++;
            this.batchStartUrl = _utils._.info.currentUrl();
        }

        this._onBatchSent();
        callback({
            status: 0,
            httpStatusCode: response.status,
            responseBody: responseBody,
            retryAfter: response.headers.get('Retry-After')
        });
    }).bind(this);

    _window.window['fetch'](this.getConfig('api_host') + '/' + this.getConfig('api_routes')['record'] + '?' + new URLSearchParams(reqParams), {
        'method': 'POST',
        'headers': {
            'Authorization': 'Basic ' + btoa(this.getConfig('token') + ':'),
            'Content-Type': 'application/octet-stream'
        },
        'body': reqBody
    }).then(function (response) {
        response.json().then(function (responseBody) {
            onSuccess(response, responseBody);
        })['catch'](function (error) {
            callback({ error: error });
        });
    })['catch'](function (error) {
        callback({ error: error, httpStatusCode: 0 });
    });
};

SessionRecording.prototype._flushEvents = (0, _gdprUtils.addOptOutCheckMixpanelLib)(function (data, options, callback) {
    var numEvents = data.length;

    if (numEvents > 0) {
        var replayId = this.replayId;

        // each rrweb event has a timestamp - leverage those to get time properties
        var batchStartTime = Infinity;
        var batchEndTime = -Infinity;
        var hasFullSnapshot = false;
        for (var i = 0; i < numEvents; i++) {
            batchStartTime = Math.min(batchStartTime, data[i].timestamp);
            batchEndTime = Math.max(batchEndTime, data[i].timestamp);
            if (data[i].type === _rrwebTypes.EventType.FullSnapshot) {
                hasFullSnapshot = true;
            }
        }

        if (this.seqNo === 0) {
            if (!hasFullSnapshot) {
                callback({ error: 'First batch does not contain a full snapshot. Aborting recording.' });
                this.stopRecording(true);
                return;
            }
            this.replayStartTime = batchStartTime;
        } else if (!this.replayStartTime) {
            this.reportError('Replay start time not set but seqNo is not 0. Using current batch start time as a fallback.');
            this.replayStartTime = batchStartTime;
        }

        var replayLengthMs = batchEndTime - this.replayStartTime;

        var reqParams = {
            '$current_url': this.batchStartUrl,
            '$lib_version': _config2['default'].LIB_VERSION,
            'batch_start_time': batchStartTime / 1000,
            'distinct_id': String(this._mixpanel.get_distinct_id()),
            'mp_lib': 'web',
            'replay_id': replayId,
            'replay_length_ms': replayLengthMs,
            'replay_start_time': this.replayStartTime / 1000,
            'replay_start_url': this.replayStartUrl,
            'seq': this.seqNo
        };
        var eventsJson = _utils._.JSONEncode(data);

        // send ID management props if they exist
        var deviceId = this._mixpanel.get_property('$device_id');
        if (deviceId) {
            reqParams['$device_id'] = deviceId;
        }
        var userId = this._mixpanel.get_property('$user_id');
        if (userId) {
            reqParams['$user_id'] = userId;
        }

        if (CompressionStream) {
            var jsonStream = new Blob([eventsJson], { type: 'application/json' }).stream();
            var gzipStream = jsonStream.pipeThrough(new CompressionStream('gzip'));
            new Response(gzipStream).blob().then((function (compressedBlob) {
                reqParams['format'] = 'gzip';
                this._sendRequest(replayId, reqParams, compressedBlob, callback);
            }).bind(this));
        } else {
            reqParams['format'] = 'body';
            this._sendRequest(replayId, reqParams, eventsJson, callback);
        }
    }
});

SessionRecording.prototype.reportError = function (msg, err) {
    logger.error.apply(logger.error, arguments);
    try {
        if (!err && !(msg instanceof Error)) {
            msg = new Error(msg);
        }
        this.getConfig('error_reporter')(msg, err);
    } catch (err) {
        logger.error(err);
    }
};

exports.SessionRecording = SessionRecording;

},{"../config":7,"../gdpr-utils":9,"../request-batcher":22,"../storage/indexed-db":25,"../utils":27,"../window":28,"./utils":21,"@rrweb/types":2}],21:[function(require,module,exports){
/**
 * @param {import('./session-recording').SerializedRecording} serializedRecording
 * @returns {boolean}
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
var isRecordingExpired = function isRecordingExpired(serializedRecording) {
  var now = Date.now();
  return !serializedRecording || now > serializedRecording['maxExpires'] || now > serializedRecording['idleExpires'];
};

var RECORD_ENQUEUE_THROTTLE_MS = 250;

exports.isRecordingExpired = isRecordingExpired;
exports.RECORD_ENQUEUE_THROTTLE_MS = RECORD_ENQUEUE_THROTTLE_MS;

},{}],22:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

var _promisePolyfill = require('./promise-polyfill');

var _requestQueue = require('./request-queue');

var _utils = require('./utils');

// eslint-disable-line camelcase

// maximum interval between request retries after exponential backoff
var MAX_RETRY_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes

var logger = (0, _utils.console_with_prefix)('batch');

/**
 * RequestBatcher: manages the queueing, flushing, retry etc of requests of one
 * type (events, people, groups).
 * Uses RequestQueue to manage the backing store.
 * @constructor
 */
var RequestBatcher = function RequestBatcher(storageKey, options) {
    this.errorReporter = options.errorReporter;
    this.queue = new _requestQueue.RequestQueue(storageKey, {
        errorReporter: _utils._.bind(this.reportError, this),
        queueStorage: options.queueStorage,
        sharedLockStorage: options.sharedLockStorage,
        sharedLockTimeoutMS: options.sharedLockTimeoutMS,
        usePersistence: options.usePersistence,
        enqueueThrottleMs: options.enqueueThrottleMs
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
RequestBatcher.prototype.enqueue = function (item) {
    return this.queue.enqueue(item, this.flushInterval);
};

/**
 * Start flushing batches at the configured time interval. Must call
 * this method upon SDK init in order to send anything over the network.
 */
RequestBatcher.prototype.start = function () {
    this.stopped = false;
    this.consecutiveRemovalFailures = 0;
    return this.flush();
};

/**
 * Stop flushing batches. Can be restarted by calling start().
 */
RequestBatcher.prototype.stop = function () {
    this.stopped = true;
    if (this.timeoutID) {
        clearTimeout(this.timeoutID);
        this.timeoutID = null;
    }
};

/**
 * Clear out queue.
 */
RequestBatcher.prototype.clear = function () {
    return this.queue.clear();
};

/**
 * Restore batch size configuration to whatever is set in the main SDK.
 */
RequestBatcher.prototype.resetBatchSize = function () {
    this.batchSize = this.libConfig['batch_size'];
};

/**
 * Restore flush interval time configuration to whatever is set in the main SDK.
 */
RequestBatcher.prototype.resetFlush = function () {
    this.scheduleFlush(this.libConfig['batch_flush_interval_ms']);
};

/**
 * Schedule the next flush in the given number of milliseconds.
 */
RequestBatcher.prototype.scheduleFlush = function (flushMS) {
    this.flushInterval = flushMS;
    if (!this.stopped) {
        // don't schedule anymore if batching has been stopped
        this.timeoutID = setTimeout(_utils._.bind(function () {
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
RequestBatcher.prototype.sendRequestPromise = function (data, options) {
    return new _promisePolyfill.Promise(_utils._.bind(function (resolve) {
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
RequestBatcher.prototype.flush = function (options) {
    if (this.requestInProgress) {
        logger.log('Flush: Request already in progress');
        return _promisePolyfill.Promise.resolve();
    }

    this.requestInProgress = true;

    options = options || {};
    var timeoutMS = this.libConfig['batch_request_timeout_ms'];
    var startTime = new Date().getTime();
    var currentBatchSize = this.batchSize;

    return this.queue.fillBatch(currentBatchSize).then(_utils._.bind(function (batch) {

        // if there's more items in the queue than the batch size, attempt
        // to flush again after the current batch is done.
        var attemptSecondaryFlush = batch.length === currentBatchSize;
        var dataForRequest = [];
        var transformedItems = {};
        _utils._.each(batch, function (item) {
            var payload = item['payload'];
            if (this.beforeSendHook && !item.orphaned) {
                payload = this.beforeSendHook(payload);
            }
            if (payload) {
                // mp_sent_by_lib_version prop captures which lib version actually
                // sends each event (regardless of which version originally queued
                // it for sending)
                if (payload['event'] && payload['properties']) {
                    payload['properties'] = _utils._.extend({}, payload['properties'], { 'mp_sent_by_lib_version': _config2['default'].LIB_VERSION });
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
                    this.reportError('[dupe] found item with no ID', { item: item });
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
            return _promisePolyfill.Promise.resolve(); // nothing to do
        }

        var removeItemsFromQueue = _utils._.bind(function () {
            return this.queue.removeItemsByID(_utils._.map(batch, function (item) {
                return item['id'];
            })).then(_utils._.bind(function (succeeded) {
                // client-side dedupe
                _utils._.each(batch, _utils._.bind(function (item) {
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
                        this.reportError('[dupe] found item with no ID while removing', { item: item });
                    }
                }, this));

                if (succeeded) {
                    this.consecutiveRemovalFailures = 0;
                    if (this.flushOnlyOnInterval && !attemptSecondaryFlush) {
                        this.resetFlush(); // schedule next batch with a delay
                        return _promisePolyfill.Promise.resolve();
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
                        return _promisePolyfill.Promise.resolve();
                    }
            }, this));
        }, this);

        var batchSendCallback = _utils._.bind(function (res) {
            this.requestInProgress = false;

            try {

                // handle API response in a try-catch to make sure we can reset the
                // flush operation if something goes wrong

                if (options.unloading) {
                    // update persisted data to include hook transformations
                    return this.queue.updatePayloads(transformedItems);
                } else if (_utils._.isObject(res) && res.error === 'timeout' && new Date().getTime() - startTime >= timeoutMS) {
                    this.reportError('Network timeout; retrying');
                    return this.flush();
                } else if (_utils._.isObject(res) && (res.httpStatusCode >= 500 || res.httpStatusCode === 429 || res.httpStatusCode <= 0 && !(0, _utils.isOnline)() || res.error === 'timeout')) {
                    // network or API error, or 429 Too Many Requests, retry
                    var retryMS = this.flushInterval * 2;
                    if (res.retryAfter) {
                        retryMS = parseInt(res.retryAfter, 10) * 1000 || retryMS;
                    }
                    retryMS = Math.min(MAX_RETRY_INTERVAL_MS, retryMS);
                    this.reportError('Error; retry in ' + retryMS + ' ms');
                    this.scheduleFlush(retryMS);
                    return _promisePolyfill.Promise.resolve();
                } else if (_utils._.isObject(res) && res.httpStatusCode === 413) {
                    // 413 Payload Too Large
                    if (batch.length > 1) {
                        var halvedBatchSize = Math.max(1, Math.floor(currentBatchSize / 2));
                        this.batchSize = Math.min(this.batchSize, halvedBatchSize, batch.length - 1);
                        this.reportError('413 response; reducing batch size to ' + this.batchSize);
                        this.resetFlush();
                        return _promisePolyfill.Promise.resolve();
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
            } catch (err) {
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
    }, this))['catch'](_utils._.bind(function (err) {
        this.reportError('Error flushing request queue', err);
        this.resetFlush();
    }, this));
};

/**
 * Log error to global logger and optional user-defined logger.
 */
RequestBatcher.prototype.reportError = function (msg, err) {
    logger.error.apply(logger.error, arguments);
    if (this.errorReporter) {
        try {
            if (!(err instanceof Error)) {
                err = new Error(msg);
            }
            this.errorReporter(msg, err);
        } catch (err) {
            logger.error(err);
        }
    }
};

exports.RequestBatcher = RequestBatcher;

},{"./config":7,"./promise-polyfill":16,"./request-queue":23,"./utils":27}],23:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _sharedLock = require('./shared-lock');

var _utils = require('./utils');

// eslint-disable-line camelcase

var _window = require('./window');

var _storageLocalStorage = require('./storage/local-storage');

var _promisePolyfill = require('./promise-polyfill');

var logger = (0, _utils.console_with_prefix)('batch');

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
var RequestQueue = function RequestQueue(storageKey, options) {
    options = options || {};
    this.storageKey = storageKey;
    this.usePersistence = options.usePersistence;
    if (this.usePersistence) {
        this.queueStorage = options.queueStorage || new _storageLocalStorage.LocalStorageWrapper();
        this.lock = new _sharedLock.SharedLock(storageKey, {
            storage: options.sharedLockStorage || _window.window.localStorage,
            timeoutMS: options.sharedLockTimeoutMS
        });
    }
    this.reportError = options.errorReporter || _utils._.bind(logger.error, logger);

    this.pid = options.pid || null; // pass pid to test out storage lock contention scenarios

    this.memQueue = [];
    this.initialized = false;

    if (options.enqueueThrottleMs) {
        this.enqueuePersisted = (0, _utils.batchedThrottle)(_utils._.bind(this._enqueuePersisted, this), options.enqueueThrottleMs);
    } else {
        this.enqueuePersisted = _utils._.bind(function (queueEntry) {
            return this._enqueuePersisted([queueEntry]);
        }, this);
    }
};

RequestQueue.prototype.ensureInit = function () {
    if (this.initialized) {
        return _promisePolyfill.Promise.resolve();
    }

    return this.queueStorage.init().then(_utils._.bind(function () {
        this.initialized = true;
    }, this))['catch'](_utils._.bind(function (err) {
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
        'id': (0, _utils.cheap_guid)(),
        'flushAfter': new Date().getTime() + flushInterval * 2,
        'payload': item
    };

    if (!this.usePersistence) {
        this.memQueue.push(queueEntry);
        return _promisePolyfill.Promise.resolve(true);
    } else {
        return this.enqueuePersisted(queueEntry);
    }
};

RequestQueue.prototype._enqueuePersisted = function (queueEntries) {
    var enqueueItem = _utils._.bind(function () {
        return this.ensureInit().then(_utils._.bind(function () {
            return this.readFromStorage();
        }, this)).then(_utils._.bind(function (storedQueue) {
            return this.saveToStorage(storedQueue.concat(queueEntries));
        }, this)).then(_utils._.bind(function (succeeded) {
            // only add to in-memory queue when storage succeeds
            if (succeeded) {
                this.memQueue = this.memQueue.concat(queueEntries);
            }

            return succeeded;
        }, this))['catch'](_utils._.bind(function (err) {
            this.reportError('Error enqueueing items', err, queueEntries);
            return false;
        }, this));
    }, this);

    return this.lock.withLock(enqueueItem, this.pid)['catch'](_utils._.bind(function (err) {
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
        return this.ensureInit().then(_utils._.bind(function () {
            return this.readFromStorage();
        }, this)).then(_utils._.bind(function (storedQueue) {
            if (storedQueue.length) {
                // item IDs already in batch; don't duplicate out of storage
                var idsInBatch = {}; // poor man's Set
                _utils._.each(batch, function (item) {
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
        return _promisePolyfill.Promise.resolve(batch);
    }
};

/**
 * Remove items with matching 'id' from array (immutably)
 * also remove any item without a valid id (e.g., malformed
 * storage entries).
 */
var filterOutIDsAndInvalid = function filterOutIDsAndInvalid(items, idSet) {
    var filteredItems = [];
    _utils._.each(items, function (item) {
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
    _utils._.each(ids, function (id) {
        idSet[id] = true;
    });

    this.memQueue = filterOutIDsAndInvalid(this.memQueue, idSet);
    if (!this.usePersistence) {
        return _promisePolyfill.Promise.resolve(true);
    } else {
        var removeFromStorage = _utils._.bind(function () {
            return this.ensureInit().then(_utils._.bind(function () {
                return this.readFromStorage();
            }, this)).then(_utils._.bind(function (storedQueue) {
                storedQueue = filterOutIDsAndInvalid(storedQueue, idSet);
                return this.saveToStorage(storedQueue);
            }, this)).then(_utils._.bind(function () {
                return this.readFromStorage();
            }, this)).then(_utils._.bind(function (storedQueue) {
                // an extra check: did storage report success but somehow
                // the items are still there?
                for (var i = 0; i < storedQueue.length; i++) {
                    var item = storedQueue[i];
                    if (item['id'] && !!idSet[item['id']]) {
                        throw new Error('Item not removed from storage');
                    }
                }
                return true;
            }, this))['catch'](_utils._.bind(function (err) {
                this.reportError('Error removing items', err, ids);
                return false;
            }, this));
        }, this);

        return this.lock.withLock(removeFromStorage, this.pid)['catch'](_utils._.bind(function (err) {
            this.reportError('Error acquiring storage lock', err);
            if (!(0, _utils.localStorageSupported)(this.lock.storage, true)) {
                // Looks like localStorage writes have stopped working sometime after
                // initialization (probably full), and so nobody can acquire locks
                // anymore. Consider it temporarily safe to remove items without the
                // lock, since nobody's writing successfully anyway.
                return removeFromStorage().then(_utils._.bind(function (success) {
                    if (!success) {
                        // OK, we couldn't even write out the smaller queue. Try clearing it
                        // entirely.
                        return this.queueStorage.removeItem(this.storageKey).then(function () {
                            return success;
                        });
                    }
                    return success;
                }, this))['catch'](_utils._.bind(function (err) {
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
var updatePayloads = function updatePayloads(existingItems, itemsToUpdate) {
    var newItems = [];
    _utils._.each(existingItems, function (item) {
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
    if (!this.usePersistence) {
        return _promisePolyfill.Promise.resolve(true);
    } else {
        return this.lock.withLock(_utils._.bind(function lockAcquired() {
            return this.ensureInit().then(_utils._.bind(function () {
                return this.readFromStorage();
            }, this)).then(_utils._.bind(function (storedQueue) {
                storedQueue = updatePayloads(storedQueue, itemsToUpdate);
                return this.saveToStorage(storedQueue);
            }, this))['catch'](_utils._.bind(function (err) {
                this.reportError('Error updating items', itemsToUpdate, err);
                return false;
            }, this));
        }, this), this.pid)['catch'](_utils._.bind(function (err) {
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
    return this.ensureInit().then(_utils._.bind(function () {
        return this.queueStorage.getItem(this.storageKey);
    }, this)).then(_utils._.bind(function (storageEntry) {
        if (storageEntry) {
            if (!_utils._.isArray(storageEntry)) {
                this.reportError('Invalid storage entry:', storageEntry);
                storageEntry = null;
            }
        }
        return storageEntry || [];
    }, this))['catch'](_utils._.bind(function (err) {
        this.reportError('Error retrieving queue', err);
        return [];
    }, this));
};

/**
 * Serialize the given items array to localStorage.
 */
RequestQueue.prototype.saveToStorage = function (queue) {
    return this.ensureInit().then(_utils._.bind(function () {
        return this.queueStorage.setItem(this.storageKey, queue);
    }, this)).then(function () {
        return true;
    })['catch'](_utils._.bind(function (err) {
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
        return this.ensureInit().then(_utils._.bind(function () {
            return this.queueStorage.removeItem(this.storageKey);
        }, this));
    } else {
        return _promisePolyfill.Promise.resolve();
    }
};

exports.RequestQueue = RequestQueue;

},{"./promise-polyfill":16,"./shared-lock":24,"./storage/local-storage":26,"./utils":27,"./window":28}],24:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _promisePolyfill = require('./promise-polyfill');

var _utils = require('./utils');

// eslint-disable-line camelcase

var _window = require('./window');

var logger = (0, _utils.console_with_prefix)('lock');

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
var SharedLock = function SharedLock(key, options) {
    options = options || {};

    this.storageKey = key;
    this.storage = options.storage || _window.window.localStorage;
    this.pollIntervalMS = options.pollIntervalMS || 100;
    this.timeoutMS = options.timeoutMS || 2000;

    // dependency-inject promise implementation for testing purposes
    this.promiseImpl = options.promiseImpl || _promisePolyfill.Promise;
};

// pass in a specific pid to test contention scenarios; otherwise
// it is chosen randomly for each acquisition attempt
SharedLock.prototype.withLock = function (lockedCB, pid) {
    var Promise = this.promiseImpl;
    return new Promise(_utils._.bind(function (resolve, reject) {
        var i = pid || new Date().getTime() + '|' + Math.random();
        var startTime = new Date().getTime();
        var key = this.storageKey;
        var pollIntervalMS = this.pollIntervalMS;
        var timeoutMS = this.timeoutMS;
        var storage = this.storage;

        var keyX = key + ':X';
        var keyY = key + ':Y';
        var keyZ = key + ':Z';

        var delay = function delay(cb) {
            if (new Date().getTime() - startTime > timeoutMS) {
                logger.error('Timeout waiting for mutex on ' + key + '; clearing lock. [' + i + ']');
                storage.removeItem(keyZ);
                storage.removeItem(keyY);
                loop();
                return;
            }
            setTimeout(function () {
                try {
                    cb();
                } catch (err) {
                    reject(err);
                }
            }, pollIntervalMS * (Math.random() + 0.1));
        };

        var waitFor = function waitFor(predicate, cb) {
            if (predicate()) {
                cb();
            } else {
                delay(function () {
                    waitFor(predicate, cb);
                });
            }
        };

        var getSetY = function getSetY() {
            var valY = storage.getItem(keyY);
            if (valY && valY !== i) {
                // if Y == i then this process already has the lock (useful for test cases)
                return false;
            } else {
                storage.setItem(keyY, i);
                if (storage.getItem(keyY) === i) {
                    return true;
                } else {
                    if (!(0, _utils.localStorageSupported)(storage, true)) {
                        reject(new Error('localStorage support dropped while acquiring lock'));
                    }
                    return false;
                }
            }
        };

        var loop = function loop() {
            storage.setItem(keyX, i);

            waitFor(getSetY, function () {
                if (storage.getItem(keyX) === i) {
                    criticalSection();
                    return;
                }

                delay(function () {
                    if (storage.getItem(keyY) !== i) {
                        loop();
                        return;
                    }
                    waitFor(function () {
                        return !storage.getItem(keyZ);
                    }, criticalSection);
                });
            });
        };

        var criticalSection = function criticalSection() {
            storage.setItem(keyZ, '1');
            var removeLock = function removeLock() {
                storage.removeItem(keyZ);
                if (storage.getItem(keyY) === i) {
                    storage.removeItem(keyY);
                }
                if (storage.getItem(keyX) === i) {
                    storage.removeItem(keyX);
                }
            };

            lockedCB().then(function (ret) {
                removeLock();
                resolve(ret);
            })['catch'](function (err) {
                removeLock();
                reject(err);
            });
        };

        try {
            if ((0, _utils.localStorageSupported)(storage, true)) {
                loop();
            } else {
                throw new Error('localStorage support check failed');
            }
        } catch (err) {
            reject(err);
        }
    }, this));
};

exports.SharedLock = SharedLock;

},{"./promise-polyfill":16,"./utils":27,"./window":28}],25:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _promisePolyfill = require('../promise-polyfill');

var _window = require('../window');

var MIXPANEL_DB_NAME = 'mixpanelBrowserDb';

var RECORDING_EVENTS_STORE_NAME = 'mixpanelRecordingEvents';
var RECORDING_REGISTRY_STORE_NAME = 'mixpanelRecordingRegistry';

// note: increment the version number when adding new object stores
var DB_VERSION = 1;
var OBJECT_STORES = [RECORDING_EVENTS_STORE_NAME, RECORDING_REGISTRY_STORE_NAME];

/**
 * @type {import('./wrapper').StorageWrapper}
 */
var IDBStorageWrapper = function IDBStorageWrapper(storeName) {
    /**
     * @type {Promise<IDBDatabase>|null}
     */
    this.dbPromise = null;
    this.storeName = storeName;
};

IDBStorageWrapper.prototype._openDb = function () {
    return new _promisePolyfill.Promise(function (resolve, reject) {
        var openRequest = _window.window.indexedDB.open(MIXPANEL_DB_NAME, DB_VERSION);
        openRequest['onerror'] = function () {
            reject(openRequest.error);
        };

        openRequest['onsuccess'] = function () {
            resolve(openRequest.result);
        };

        openRequest['onupgradeneeded'] = function (ev) {
            var db = ev.target.result;

            OBJECT_STORES.forEach(function (storeName) {
                db.createObjectStore(storeName);
            });
        };
    });
};

IDBStorageWrapper.prototype.init = function () {
    if (!_window.window.indexedDB) {
        return _promisePolyfill.Promise.reject('indexedDB is not supported in this browser');
    }

    if (!this.dbPromise) {
        this.dbPromise = this._openDb();
    }

    return this.dbPromise.then(function (dbOrError) {
        if (dbOrError instanceof _window.window['IDBDatabase']) {
            return _promisePolyfill.Promise.resolve();
        } else {
            return _promisePolyfill.Promise.reject(dbOrError);
        }
    });
};

/**
 * @param {IDBTransactionMode} mode
 * @param {function(IDBObjectStore): void} storeCb
 */
IDBStorageWrapper.prototype.makeTransaction = function (mode, storeCb) {
    var storeName = this.storeName;
    var doTransaction = function doTransaction(db) {
        return new _promisePolyfill.Promise(function (resolve, reject) {
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

    return this.dbPromise.then(doTransaction)['catch']((function (err) {
        if (err && err['name'] === 'InvalidStateError') {
            // try reopening the DB if the connection is closed
            this.dbPromise = this._openDb();
            return this.dbPromise.then(doTransaction);
        } else {
            return _promisePolyfill.Promise.reject(err);
        }
    }).bind(this));
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
        objectStore['delete'](key);
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

exports.IDBStorageWrapper = IDBStorageWrapper;
exports.RECORDING_EVENTS_STORE_NAME = RECORDING_EVENTS_STORE_NAME;
exports.RECORDING_REGISTRY_STORE_NAME = RECORDING_REGISTRY_STORE_NAME;

},{"../promise-polyfill":16,"../window":28}],26:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _promisePolyfill = require('../promise-polyfill');

var _utils = require('../utils');

// eslint-disable-line camelcase

/**
 * @type {import('./wrapper').StorageWrapper}
 */
var LocalStorageWrapper = function LocalStorageWrapper(storageOverride) {
    this.storage = storageOverride || localStorage;
};

LocalStorageWrapper.prototype.init = function () {
    return _promisePolyfill.Promise.resolve();
};

LocalStorageWrapper.prototype.setItem = function (key, value) {
    return new _promisePolyfill.Promise(_utils._.bind(function (resolve, reject) {
        try {
            this.storage.setItem(key, (0, _utils.JSONStringify)(value));
        } catch (e) {
            reject(e);
        }
        resolve();
    }, this));
};

LocalStorageWrapper.prototype.getItem = function (key) {
    return new _promisePolyfill.Promise(_utils._.bind(function (resolve, reject) {
        var item;
        try {
            item = (0, _utils.JSONParse)(this.storage.getItem(key));
        } catch (e) {
            reject(e);
        }
        resolve(item);
    }, this));
};

LocalStorageWrapper.prototype.removeItem = function (key) {
    return new _promisePolyfill.Promise(_utils._.bind(function (resolve, reject) {
        try {
            this.storage.removeItem(key);
        } catch (e) {
            reject(e);
        }
        resolve();
    }, this));
};

exports.LocalStorageWrapper = LocalStorageWrapper;

},{"../promise-polyfill":16,"../utils":27}],27:[function(require,module,exports){
/* eslint camelcase: "off", eqeqeq: "off" */
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

var _promisePolyfill = require('./promise-polyfill');

var _window = require('./window');

// Maximum allowed session recording length
var MAX_RECORDING_MS = 24 * 60 * 60 * 1000; // 24 hours
// Maximum allowed value for minimum session recording length
var MAX_VALUE_FOR_MIN_RECORDING_MS = 8 * 1000; // 8 seconds

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
    windowConsole = _window.window.console,
    navigator = _window.window.navigator,
    document = _window.window.document,
    windowOpera = _window.window.opera,
    screen = _window.window.screen,
    userAgent = navigator.userAgent;

var nativeBind = FuncProto.bind,
    nativeForEach = ArrayProto.forEach,
    nativeIndexOf = ArrayProto.indexOf,
    nativeMap = ArrayProto.map,
    nativeIsArray = Array.isArray,
    breaker = {};

var _ = {
    trim: function trim(str) {
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/Trim#Polyfill
        return str.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
    }
};

// Console override
var console = {
    /** @type {function(...*)} */
    log: function log() {
        if (_config2['default'].DEBUG && !_.isUndefined(windowConsole) && windowConsole) {
            try {
                windowConsole.log.apply(windowConsole, arguments);
            } catch (err) {
                _.each(arguments, function (arg) {
                    windowConsole.log(arg);
                });
            }
        }
    },
    /** @type {function(...*)} */
    warn: function warn() {
        if (_config2['default'].DEBUG && !_.isUndefined(windowConsole) && windowConsole) {
            var args = ['Mixpanel warning:'].concat(_.toArray(arguments));
            try {
                windowConsole.warn.apply(windowConsole, args);
            } catch (err) {
                _.each(args, function (arg) {
                    windowConsole.warn(arg);
                });
            }
        }
    },
    /** @type {function(...*)} */
    error: function error() {
        if (_config2['default'].DEBUG && !_.isUndefined(windowConsole) && windowConsole) {
            var args = ['Mixpanel error:'].concat(_.toArray(arguments));
            try {
                windowConsole.error.apply(windowConsole, args);
            } catch (err) {
                _.each(args, function (arg) {
                    windowConsole.error(arg);
                });
            }
        }
    },
    /** @type {function(...*)} */
    critical: function critical() {
        if (!_.isUndefined(windowConsole) && windowConsole) {
            var args = ['Mixpanel error:'].concat(_.toArray(arguments));
            try {
                windowConsole.error.apply(windowConsole, args);
            } catch (err) {
                _.each(args, function (arg) {
                    windowConsole.error(arg);
                });
            }
        }
    }
};

var log_func_with_prefix = function log_func_with_prefix(func, prefix) {
    return function () {
        arguments[0] = '[' + prefix + '] ' + arguments[0];
        return func.apply(console, arguments);
    };
};
var console_with_prefix = function console_with_prefix(prefix) {
    return {
        log: log_func_with_prefix(console.log, prefix),
        error: log_func_with_prefix(console.error, prefix),
        critical: log_func_with_prefix(console.critical, prefix)
    };
};

var safewrap = function safewrap(f) {
    return function () {
        try {
            return f.apply(this, arguments);
        } catch (e) {
            console.critical('Implementation error. Please turn on debug and contact support@mixpanel.com.');
            if (_config2['default'].DEBUG) {
                console.critical(e);
            }
        }
    };
};

var safewrapClass = function safewrapClass(klass) {
    var proto = klass.prototype;
    for (var func in proto) {
        if (typeof proto[func] === 'function') {
            proto[func] = safewrap(proto[func]);
        }
    }
};

// UNDERSCORE
// Embed part of the Underscore Library
_.bind = function (func, context) {
    var args, bound;
    if (nativeBind && func.bind === nativeBind) {
        return nativeBind.apply(func, slice.call(arguments, 1));
    }
    if (!_.isFunction(func)) {
        throw new TypeError();
    }
    args = slice.call(arguments, 2);
    bound = function () {
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
_.each = function (obj, iterator, context) {
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

_.extend = function (obj) {
    _.each(slice.call(arguments, 1), function (source) {
        for (var prop in source) {
            if (source[prop] !== void 0) {
                obj[prop] = source[prop];
            }
        }
    });
    return obj;
};

_.isArray = nativeIsArray || function (obj) {
    return toString.call(obj) === '[object Array]';
};

// from a comment on http://dbj.org/dbj/?p=286
// fails on only one very rare and deliberate custom object:
// var bomb = { toString : undefined, valueOf: function(o) { return "function BOMBA!"; }};
_.isFunction = function (f) {
    try {
        return (/^\s*\bfunction\b/.test(f)
        );
    } catch (x) {
        return false;
    }
};

_.isArguments = function (obj) {
    return !!(obj && hasOwnProperty.call(obj, 'callee'));
};

_.toArray = function (iterable) {
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

_.map = function (arr, callback, context) {
    if (nativeMap && arr.map === nativeMap) {
        return arr.map(callback, context);
    } else {
        var results = [];
        _.each(arr, function (item) {
            results.push(callback.call(context, item));
        });
        return results;
    }
};

_.keys = function (obj) {
    var results = [];
    if (obj === null) {
        return results;
    }
    _.each(obj, function (value, key) {
        results[results.length] = key;
    });
    return results;
};

_.values = function (obj) {
    var results = [];
    if (obj === null) {
        return results;
    }
    _.each(obj, function (value) {
        results[results.length] = value;
    });
    return results;
};

_.include = function (obj, target) {
    var found = false;
    if (obj === null) {
        return found;
    }
    if (nativeIndexOf && obj.indexOf === nativeIndexOf) {
        return obj.indexOf(target) != -1;
    }
    _.each(obj, function (value) {
        if (found || (found = value === target)) {
            return breaker;
        }
    });
    return found;
};

_.includes = function (str, needle) {
    return str.indexOf(needle) !== -1;
};

// Underscore Addons
_.inherit = function (subclass, superclass) {
    subclass.prototype = new superclass();
    subclass.prototype.constructor = subclass;
    subclass.superclass = superclass.prototype;
    return subclass;
};

_.isObject = function (obj) {
    return obj === Object(obj) && !_.isArray(obj);
};

_.isEmptyObject = function (obj) {
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

_.isUndefined = function (obj) {
    return obj === void 0;
};

_.isString = function (obj) {
    return toString.call(obj) == '[object String]';
};

_.isDate = function (obj) {
    return toString.call(obj) == '[object Date]';
};

_.isNumber = function (obj) {
    return toString.call(obj) == '[object Number]';
};

_.isElement = function (obj) {
    return !!(obj && obj.nodeType === 1);
};

_.encodeDates = function (obj) {
    _.each(obj, function (v, k) {
        if (_.isDate(v)) {
            obj[k] = _.formatDate(v);
        } else if (_.isObject(v)) {
            obj[k] = _.encodeDates(v); // recurse
        }
    });
    return obj;
};

_.timestamp = function () {
    Date.now = Date.now || function () {
        return +new Date();
    };
    return Date.now();
};

_.formatDate = function (d) {
    // YYYY-MM-DDTHH:MM:SS in UTC
    function pad(n) {
        return n < 10 ? '0' + n : n;
    }
    return d.getUTCFullYear() + '-' + pad(d.getUTCMonth() + 1) + '-' + pad(d.getUTCDate()) + 'T' + pad(d.getUTCHours()) + ':' + pad(d.getUTCMinutes()) + ':' + pad(d.getUTCSeconds());
};

_.strip_empty_properties = function (p) {
    var ret = {};
    _.each(p, function (v, k) {
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
_.truncate = function (obj, length) {
    var ret;

    if (typeof obj === 'string') {
        ret = obj.slice(0, length);
    } else if (_.isArray(obj)) {
        ret = [];
        _.each(obj, function (val) {
            ret.push(_.truncate(val, length));
        });
    } else if (_.isObject(obj)) {
        ret = {};
        _.each(obj, function (val, key) {
            ret[key] = _.truncate(val, length);
        });
    } else {
        ret = obj;
    }

    return ret;
};

_.JSONEncode = (function () {
    return function (mixed_val) {
        var value = mixed_val;
        var quote = function quote(string) {
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
            return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
                var c = meta[a];
                return typeof c === 'string' ? c : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
            }) + '"' : '"' + string + '"';
        };

        var str = function str(key, holder) {
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
            if (value && typeof value === 'object' && typeof value.toJSON === 'function') {
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
                        v = partial.length === 0 ? '[]' : gap ? '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']' : '[' + partial.join(',') + ']';
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
                    v = partial.length === 0 ? '{}' : gap ? '{' + partial.join(',') + '' + mind + '}' : '{' + partial.join(',') + '}';
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
_.JSONDecode = (function () {
    var at,
        // The index of the current character
    ch,
        // The current character
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
        error = function error(m) {
        var e = new SyntaxError(m);
        e.at = at;
        e.text = text;
        throw e;
    },
        next = function next(c) {
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
        number = function number() {
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
        string = function string() {
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
        white = function white() {
        // Skip whitespace.
        while (ch && ch <= ' ') {
            next();
        }
    },
        word = function word() {
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
        value,
        // Placeholder for the value function.
    array = function array() {
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
        object = function object() {
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

    value = function () {
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
    return function (source) {
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

_.base64Encode = function (data) {
    var b64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    var o1,
        o2,
        o3,
        h1,
        h2,
        h3,
        h4,
        bits,
        i = 0,
        ac = 0,
        enc = '',
        tmp_arr = [];

    if (!data) {
        return data;
    }

    data = _.utf8Encode(data);

    do {
        // pack three octets into four hexets
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

_.utf8Encode = function (string) {
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
        } else if (c1 > 127 && c1 < 2048) {
            enc = String.fromCharCode(c1 >> 6 | 192, c1 & 63 | 128);
        } else {
            enc = String.fromCharCode(c1 >> 12 | 224, c1 >> 6 & 63 | 128, c1 & 63 | 128);
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

_.UUID = (function () {

    // Time-based entropy
    var T = function T() {
        var time = 1 * new Date(); // cross-browser version of Date.now()
        var ticks;
        if (_window.window.performance && _window.window.performance.now) {
            ticks = _window.window.performance.now();
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
    var R = function R() {
        return Math.random().toString(16).replace('.', '');
    };

    // User agent entropy
    // This function takes the user agent string, and then xors
    // together each sequence of 8 bytes.  This produces a final
    // sequence of 8 bytes which it returns as hex.
    var UA = function UA() {
        var ua = userAgent,
            i,
            ch,
            buffer = [],
            ret = 0;

        function xor(result, byte_array) {
            var j,
                tmp = 0;
            for (j = 0; j < byte_array.length; j++) {
                tmp |= buffer[j] << j * 8;
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

    return function () {
        var se = (screen.height * screen.width).toString(16);
        return T() + '-' + R() + '-' + UA() + '-' + se + '-' + T();
    };
})();

// _.isBlockedUA()
// This is to block various web spiders from executing our JS and
// sending false tracking data
var BLOCKED_UA_STRS = ['ahrefsbot', 'ahrefssiteaudit', 'amazonbot', 'baiduspider', 'bingbot', 'bingpreview', 'chrome-lighthouse', 'facebookexternal', 'petalbot', 'pinterest', 'screaming frog', 'yahoo! slurp', 'yandex',

// a whole bunch of goog-specific crawlers
// https://developers.google.com/search/docs/advanced/crawling/overview-google-crawlers
'adsbot-google', 'apis-google', 'duplexweb-google', 'feedfetcher-google', 'google favicon', 'google web preview', 'google-read-aloud', 'googlebot', 'googleweblight', 'mediapartners-google', 'storebot-google'];
_.isBlockedUA = function (ua) {
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
_.HTTPBuildQuery = function (formdata, arg_separator) {
    var use_val,
        use_key,
        tmp_arr = [];

    if (_.isUndefined(arg_separator)) {
        arg_separator = '&';
    }

    _.each(formdata, function (val, key) {
        use_val = encodeURIComponent(val.toString());
        use_key = encodeURIComponent(key);
        tmp_arr[tmp_arr.length] = use_key + '=' + use_val;
    });

    return tmp_arr.join(arg_separator);
};

_.getQueryParam = function (url, param) {
    // Expects a raw URL

    param = param.replace(/[[]/g, '\\[').replace(/[\]]/g, '\\]');
    var regexS = '[\\?&]' + param + '=([^&#]*)',
        regex = new RegExp(regexS),
        results = regex.exec(url);
    if (results === null || results && typeof results[1] !== 'string' && results[1].length) {
        return '';
    } else {
        var result = results[1];
        try {
            result = decodeURIComponent(result);
        } catch (err) {
            console.error('Skipping decoding for malformed query param: ' + result);
        }
        return result.replace(/\+/g, ' ');
    }
};

// _.cookie
// Methods partially borrowed from quirksmode.org/js/cookies.html
_.cookie = {
    get: function get(name) {
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

    parse: function parse(name) {
        var cookie;
        try {
            cookie = _.JSONDecode(_.cookie.get(name)) || {};
        } catch (err) {
            // noop
        }
        return cookie;
    },

    set_seconds: function set_seconds(name, value, seconds, is_cross_subdomain, is_secure, is_cross_site, domain_override) {
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
            date.setTime(date.getTime() + seconds * 1000);
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

    set: function set(name, value, days, is_cross_subdomain, is_secure, is_cross_site, domain_override) {
        var cdomain = '',
            expires = '',
            secure = '';

        if (domain_override) {
            cdomain = '; domain=' + domain_override;
        } else if (is_cross_subdomain) {
            var domain = extract_domain(document.location.hostname);
            cdomain = domain ? '; domain=.' + domain : '';
        }

        if (days) {
            var date = new Date();
            date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
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

    remove: function remove(name, is_cross_subdomain, domain_override) {
        _.cookie.set(name, '', -1, is_cross_subdomain, false, false, domain_override);
    }
};

var _testStorageSupported = function _testStorageSupported(storage) {
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
var localStorageSupported = function localStorageSupported(storage, forceCheck) {
    if (_localStorageSupported !== null && !forceCheck) {
        return _localStorageSupported;
    }
    return _localStorageSupported = _testStorageSupported(storage || _window.window.localStorage);
};

var _sessionStorageSupported = null;
var sessionStorageSupported = function sessionStorageSupported(storage, forceCheck) {
    if (_sessionStorageSupported !== null && !forceCheck) {
        return _sessionStorageSupported;
    }
    return _sessionStorageSupported = _testStorageSupported(storage || _window.window.sessionStorage);
};

function _storageWrapper(storage, name, is_supported_fn) {
    var log_error = function log_error(msg) {
        console.error(name + ' error: ' + msg);
    };

    return {
        is_supported: function is_supported(forceCheck) {
            var supported = is_supported_fn(storage, forceCheck);
            if (!supported) {
                console.error(name + ' unsupported');
            }
            return supported;
        },
        error: log_error,
        get: function get(key) {
            try {
                return storage.getItem(key);
            } catch (err) {
                log_error(err);
            }
            return null;
        },
        parse: function parse(key) {
            try {
                return _.JSONDecode(storage.getItem(key)) || {};
            } catch (err) {
                // noop
            }
            return null;
        },
        set: function set(key, value) {
            try {
                storage.setItem(key, value);
            } catch (err) {
                log_error(err);
            }
        },
        remove: function remove(key) {
            try {
                storage.removeItem(key);
            } catch (err) {
                log_error(err);
            }
        }
    };
}

_.localStorage = _storageWrapper(_window.window.localStorage, 'localStorage', localStorageSupported);
_.sessionStorage = _storageWrapper(_window.window.sessionStorage, 'sessionStorage', sessionStorageSupported);

_.register_event = (function () {
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
    var register_event = function register_event(element, type, handler, oldSchool, useCapture) {
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
        var handler = function handler(event) {
            event = event || fixEvent(_window.window.event);

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

            if (false === old_result || false === new_result) {
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
    fixEvent.preventDefault = function () {
        this.returnValue = false;
    };
    fixEvent.stopPropagation = function () {
        this.cancelBubble = true;
    };

    return register_event;
})();

var TOKEN_MATCH_REGEX = new RegExp('^(\\w*)\\[(\\w+)([=~\\|\\^\\$\\*]?)=?"?([^\\]"]*)"?\\]$');

_.dom_query = (function () {
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
        return (' ' + elem.className + ' ').replace(bad_whitespace, ' ').indexOf(className) >= 0;
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
                if (!element || tagName && element.nodeName.toLowerCase() != tagName) {
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
                    if (found[j].className && _.isString(found[j].className) && // some SVG elements have classNames which are not strings
                    hasClass(found[j], className)) {
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
                    case '=':
                        // Equality
                        checkFunction = function (e) {
                            return e.getAttribute(attrName) == attrValue;
                        };
                        break;
                    case '~':
                        // Match one of space seperated words
                        checkFunction = function (e) {
                            return e.getAttribute(attrName).match(new RegExp('\\b' + attrValue + '\\b'));
                        };
                        break;
                    case '|':
                        // Match start with value followed by optional hyphen
                        checkFunction = function (e) {
                            return e.getAttribute(attrName).match(new RegExp('^' + attrValue + '-?'));
                        };
                        break;
                    case '^':
                        // Match starts with value
                        checkFunction = function (e) {
                            return e.getAttribute(attrName).indexOf(attrValue) === 0;
                        };
                        break;
                    case '$':
                        // Match ends with value - fails with "Warning" in Opera 7
                        checkFunction = function (e) {
                            return e.getAttribute(attrName).lastIndexOf(attrValue) == e.getAttribute(attrName).length - attrValue.length;
                        };
                        break;
                    case '*':
                        // Match ends with value
                        checkFunction = function (e) {
                            return e.getAttribute(attrName).indexOf(attrValue) > -1;
                        };
                        break;
                    default:
                        // Just test for existence of attribute
                        checkFunction = function (e) {
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

    return function (query) {
        if (_.isElement(query)) {
            return [query];
        } else if (_.isObject(query) && !_.isUndefined(query.length)) {
            return query;
        } else {
            return getElementsBySelector.call(this, query);
        }
    };
})();

var CAMPAIGN_KEYWORDS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'utm_id', 'utm_source_platform', 'utm_campaign_id', 'utm_creative_format', 'utm_marketing_tactic'];
var CLICK_IDS = ['dclid', 'fbclid', 'gclid', 'ko_click_id', 'li_fat_id', 'msclkid', 'sccid', 'ttclid', 'twclid', 'wbraid'];

_.info = {
    campaignParams: function campaignParams(default_value) {
        var kw = '',
            params = {};
        _.each(CAMPAIGN_KEYWORDS, function (kwkey) {
            kw = _.getQueryParam(document.URL, kwkey);
            if (kw.length) {
                params[kwkey] = kw;
            } else if (default_value !== undefined) {
                params[kwkey] = default_value;
            }
        });

        return params;
    },

    clickParams: function clickParams() {
        var id = '',
            params = {};
        _.each(CLICK_IDS, function (idkey) {
            id = _.getQueryParam(document.URL, idkey);
            if (id.length) {
                params[idkey] = id;
            }
        });

        return params;
    },

    marketingParams: function marketingParams() {
        return _.extend(_.info.campaignParams(), _.info.clickParams());
    },

    searchEngine: function searchEngine(referrer) {
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

    searchInfo: function searchInfo(referrer) {
        var search = _.info.searchEngine(referrer),
            param = search != 'yahoo' ? 'q' : 'p',
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
    browser: function browser(user_agent, vendor, opera) {
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
    browserVersion: function browserVersion(userAgent, vendor, opera) {
        var browser = _.info.browser(userAgent, vendor, opera);
        var versionRegexs = {
            'Internet Explorer Mobile': /rv:(\d+(\.\d+)?)/,
            'Microsoft Edge': /Edge?\/(\d+(\.\d+)?)/,
            'Chrome': /Chrome\/(\d+(\.\d+)?)/,
            'Chrome iOS': /CriOS\/(\d+(\.\d+)?)/,
            'UC Browser': /(UCBrowser|UCWEB)\/(\d+(\.\d+)?)/,
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

    os: function os() {
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

    device: function device(user_agent) {
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

    referringDomain: function referringDomain(referrer) {
        var split = referrer.split('/');
        if (split.length >= 3) {
            return split[2];
        }
        return '';
    },

    currentUrl: function currentUrl() {
        return _window.window.location.href;
    },

    properties: function properties(extra_props) {
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
            '$lib_version': _config2['default'].LIB_VERSION,
            '$insert_id': cheap_guid(),
            'time': _.timestamp() / 1000 // epoch time in seconds
        }, _.strip_empty_properties(extra_props));
    },

    people_properties: function people_properties() {
        return _.extend(_.strip_empty_properties({
            '$os': _.info.os(),
            '$browser': _.info.browser(userAgent, navigator.vendor, windowOpera)
        }), {
            '$browser_version': _.info.browserVersion(userAgent, navigator.vendor, windowOpera)
        });
    },

    mpPageViewProperties: function mpPageViewProperties() {
        return _.strip_empty_properties({
            'current_page_title': document.title,
            'current_domain': _window.window.location.hostname,
            'current_url_path': _window.window.location.pathname,
            'current_url_protocol': _window.window.location.protocol,
            'current_url_search': _window.window.location.search
        });
    }
};

/**
 * Returns a throttled function that will only run at most every `waitMs` and returns a promise that resolves with the next invocation.
 * Throttled calls will build up a batch of args and invoke the callback with all args since the last invocation.
 */
var batchedThrottle = function batchedThrottle(fn, waitMs) {
    var timeoutPromise = null;
    var throttledItems = [];
    return function (item) {
        var self = this;
        throttledItems.push(item);

        if (!timeoutPromise) {
            timeoutPromise = new _promisePolyfill.Promise(function (resolve) {
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

var cheap_guid = function cheap_guid(maxlen) {
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
var extract_domain = function extract_domain(hostname) {
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
var isOnline = function isOnline() {
    var onLine = _window.window.navigator['onLine'];
    return _.isUndefined(onLine) || onLine;
};

var NOOP_FUNC = function NOOP_FUNC() {};

var JSONStringify = null,
    JSONParse = null;
if (typeof JSON !== 'undefined') {
    exports.JSONStringify = JSONStringify = JSON.stringify;
    exports.JSONParse = JSONParse = JSON.parse;
}
exports.JSONStringify = JSONStringify = JSONStringify || _.JSONEncode;
exports.JSONParse = JSONParse = JSONParse || _.JSONDecode;

// UNMINIFIED EXPORTS (for closure compiler)
_['info'] = _.info;
_['info']['browser'] = _.info.browser;
_['info']['browserVersion'] = _.info.browserVersion;
_['info']['device'] = _.info.device;
_['info']['properties'] = _.info.properties;
_['isBlockedUA'] = _.isBlockedUA;
_['isEmptyObject'] = _.isEmptyObject;
_['isObject'] = _.isObject;
_['JSONDecode'] = _.JSONDecode;
_['JSONEncode'] = _.JSONEncode;
_['toArray'] = _.toArray;
_['NPO'] = _promisePolyfill.NpoPromise;

exports._ = _;
exports.batchedThrottle = batchedThrottle;
exports.cheap_guid = cheap_guid;
exports.console_with_prefix = console_with_prefix;
exports.console = console;
exports.document = document;
exports.extract_domain = extract_domain;
exports.JSONParse = JSONParse;
exports.JSONStringify = JSONStringify;
exports.isOnline = isOnline;
exports.localStorageSupported = localStorageSupported;
exports.MAX_RECORDING_MS = MAX_RECORDING_MS;
exports.MAX_VALUE_FOR_MIN_RECORDING_MS = MAX_VALUE_FOR_MIN_RECORDING_MS;
exports.navigator = navigator;
exports.NOOP_FUNC = NOOP_FUNC;
exports.safewrap = safewrap;
exports.safewrapClass = safewrapClass;
exports.slice = slice;
exports.userAgent = userAgent;

},{"./config":7,"./promise-polyfill":16,"./window":28}],28:[function(require,module,exports){
// since es6 imports are static and we run unit tests from the console, window won't be defined when importing this file
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
var win;
if (typeof window === 'undefined') {
    var loc = {
        hostname: ''
    };
    exports.window = win = {
        navigator: { userAgent: '', onLine: true },
        document: {
            createElement: function createElement() {
                return {};
            },
            location: loc,
            referrer: ''
        },
        screen: { width: 0, height: 0 },
        location: loc,
        addEventListener: function addEventListener() {},
        removeEventListener: function removeEventListener() {}
    };
} else {
    exports.window = win = window;
}

exports.window = win;

},{}]},{},[1]);
