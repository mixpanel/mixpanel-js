(function () {
    'use strict';

    var NodeType;
    (function (NodeType) {
        NodeType[NodeType["Document"] = 0] = "Document";
        NodeType[NodeType["DocumentType"] = 1] = "DocumentType";
        NodeType[NodeType["Element"] = 2] = "Element";
        NodeType[NodeType["Text"] = 3] = "Text";
        NodeType[NodeType["CDATA"] = 4] = "CDATA";
        NodeType[NodeType["Comment"] = 5] = "Comment";
    })(NodeType || (NodeType = {}));

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
    function createMirror() {
        return new Mirror();
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
    const ORIGINAL_ATTRIBUTE_NAME = '__rrweb_original__';
    function is2DCanvasBlank(canvas) {
        const ctx = canvas.getContext('2d');
        if (!ctx)
            return true;
        const chunkSize = 50;
        for (let x = 0; x < canvas.width; x += chunkSize) {
            for (let y = 0; y < canvas.height; y += chunkSize) {
                const getImageData = ctx.getImageData;
                const originalGetImageData = ORIGINAL_ATTRIBUTE_NAME in getImageData
                    ? getImageData[ORIGINAL_ATTRIBUTE_NAME]
                    : getImageData;
                const pixelBuffer = new Uint32Array(originalGetImageData.call(ctx, x, y, Math.min(chunkSize, canvas.width - x), Math.min(chunkSize, canvas.height - y)).data.buffer);
                if (pixelBuffer.some((pixel) => pixel !== 0))
                    return false;
            }
        }
        return true;
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
    function getValidTagName(element) {
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
                        type: NodeType.Document,
                        childNodes: [],
                        compatMode: n.compatMode,
                    };
                }
                else {
                    return {
                        type: NodeType.Document,
                        childNodes: [],
                    };
                }
            case n.DOCUMENT_TYPE_NODE:
                return {
                    type: NodeType.DocumentType,
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
                    type: NodeType.CDATA,
                    textContent: '',
                    rootId,
                };
            case n.COMMENT_NODE:
                return {
                    type: NodeType.Comment,
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
            type: NodeType.Text,
            textContent: textContent || '',
            isStyle,
            rootId,
        };
    }
    function serializeElementNode(n, options) {
        const { doc, blockClass, blockSelector, inlineStylesheet, maskInputOptions = {}, maskInputFn, dataURLOptions = {}, inlineImages, recordCanvas, keepIframeSrcFn, newlyAddedElement = false, rootId, } = options;
        const needBlock = _isBlockedElement(n, blockClass, blockSelector);
        const tagName = getValidTagName(n);
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
            type: NodeType.Element,
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
        if (slimDOMOptions.comment && sn.type === NodeType.Comment) {
            return true;
        }
        else if (sn.type === NodeType.Element) {
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
                _serializedNode.type === NodeType.Text &&
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
        if (serializedNode.type === NodeType.Element) {
            recordChild = recordChild && !serializedNode.needBlock;
            delete serializedNode.needBlock;
            const shadowRoot = n.shadowRoot;
            if (shadowRoot && isNativeShadowDom(shadowRoot))
                serializedNode.isShadowHost = true;
        }
        if ((serializedNode.type === NodeType.Document ||
            serializedNode.type === NodeType.Element) &&
            recordChild) {
            if (slimDOMOptions.headWhitespace &&
                serializedNode.type === NodeType.Element &&
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
            if (serializedNode.type === NodeType.Element &&
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
        if (serializedNode.type === NodeType.Element &&
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
        if (serializedNode.type === NodeType.Element &&
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
        const { mirror = new Mirror(), blockClass = 'rr-block', blockSelector = null, maskTextClass = 'rr-mask', maskTextSelector = null, inlineStylesheet = true, inlineImages = false, recordCanvas = false, maskAllInputs = false, maskTextFn, maskInputFn, slimDOM = false, dataURLOptions, preserveWhiteSpace, onSerialize, onIframeLoad, iframeLoadTimeout, onStylesheetLoad, stylesheetLoadTimeout, keepIframeSrcFn = () => false, } = options || {};
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
    let _mirror = {
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
        _mirror = new Proxy(_mirror, {
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
    function polyfill(win = window) {
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
    function hasShadowRoot(n) {
        return Boolean(n === null || n === void 0 ? void 0 : n.shadowRoot);
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

    var EventType$1 = /* @__PURE__ */ ((EventType2) => {
      EventType2[EventType2["DomContentLoaded"] = 0] = "DomContentLoaded";
      EventType2[EventType2["Load"] = 1] = "Load";
      EventType2[EventType2["FullSnapshot"] = 2] = "FullSnapshot";
      EventType2[EventType2["IncrementalSnapshot"] = 3] = "IncrementalSnapshot";
      EventType2[EventType2["Meta"] = 4] = "Meta";
      EventType2[EventType2["Custom"] = 5] = "Custom";
      EventType2[EventType2["Plugin"] = 6] = "Plugin";
      return EventType2;
    })(EventType$1 || {});
    var IncrementalSource$1 = /* @__PURE__ */ ((IncrementalSource2) => {
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
    })(IncrementalSource$1 || {});
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
                ? IncrementalSource$1.Drag
                : evt instanceof MouseEvent
                    ? IncrementalSource$1.MouseMove
                    : IncrementalSource$1.TouchMove);
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
                case EventType$1.FullSnapshot: {
                    this.crossOriginIframeMirror.reset(iframeEl);
                    this.crossOriginIframeStyleMirror.reset(iframeEl);
                    this.replaceIdOnNode(e.data.node, iframeEl);
                    const rootId = e.data.node.id;
                    this.crossOriginIframeRootIdMap.set(iframeEl, rootId);
                    this.patchRootIdOnNode(e.data.node, rootId);
                    return {
                        timestamp: e.timestamp,
                        type: EventType$1.IncrementalSnapshot,
                        data: {
                            source: IncrementalSource$1.Mutation,
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
                case EventType$1.Meta:
                case EventType$1.Load:
                case EventType$1.DomContentLoaded: {
                    return false;
                }
                case EventType$1.Plugin: {
                    return e;
                }
                case EventType$1.Custom: {
                    this.replaceIds(e.data.payload, iframeEl, ['id', 'parentId', 'previousId', 'nextId']);
                    return e;
                }
                case EventType$1.IncrementalSnapshot: {
                    switch (e.data.source) {
                        case IncrementalSource$1.Mutation: {
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
                        case IncrementalSource$1.Drag:
                        case IncrementalSource$1.TouchMove:
                        case IncrementalSource$1.MouseMove: {
                            e.data.positions.forEach((p) => {
                                this.replaceIds(p, iframeEl, ['id']);
                            });
                            return e;
                        }
                        case IncrementalSource$1.ViewportResize: {
                            return false;
                        }
                        case IncrementalSource$1.MediaInteraction:
                        case IncrementalSource$1.MouseInteraction:
                        case IncrementalSource$1.Scroll:
                        case IncrementalSource$1.CanvasMutation:
                        case IncrementalSource$1.Input: {
                            this.replaceIds(e.data, iframeEl, ['id']);
                            return e;
                        }
                        case IncrementalSource$1.StyleSheetRule:
                        case IncrementalSource$1.StyleDeclaration: {
                            this.replaceIds(e.data, iframeEl, ['id']);
                            this.replaceStyleIds(e.data, iframeEl, ['styleId']);
                            return e;
                        }
                        case IncrementalSource$1.Font: {
                            return e;
                        }
                        case IncrementalSource$1.Selection: {
                            e.data.ranges.forEach((range) => {
                                this.replaceIds(range, iframeEl, ['start', 'end']);
                            });
                            return e;
                        }
                        case IncrementalSource$1.AdoptedStyleSheet: {
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
            if (node.type !== NodeType.Document && !node.rootId)
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

    const canvasVarMap = new Map();
    function variableListFor(ctx, ctor) {
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
        const list = variableListFor(ctx, name);
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
    const mirror = createMirror();
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
        polyfill();
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
                e.type !== EventType$1.FullSnapshot &&
                !(e.type === EventType$1.IncrementalSnapshot &&
                    e.data.source === IncrementalSource$1.Mutation)) {
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
            if (e.type === EventType$1.FullSnapshot) {
                lastFullSnapshotEvent = e;
                incrementalSnapshotCount = 0;
            }
            else if (e.type === EventType$1.IncrementalSnapshot) {
                if (e.data.source === IncrementalSource$1.Mutation &&
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
                type: EventType$1.IncrementalSnapshot,
                data: Object.assign({ source: IncrementalSource$1.Mutation }, m),
            }));
        };
        const wrappedScrollEmit = (p) => wrappedEmit(wrapEvent({
            type: EventType$1.IncrementalSnapshot,
            data: Object.assign({ source: IncrementalSource$1.Scroll }, p),
        }));
        const wrappedCanvasMutationEmit = (p) => wrappedEmit(wrapEvent({
            type: EventType$1.IncrementalSnapshot,
            data: Object.assign({ source: IncrementalSource$1.CanvasMutation }, p),
        }));
        const wrappedAdoptedStyleSheetEmit = (a) => wrappedEmit(wrapEvent({
            type: EventType$1.IncrementalSnapshot,
            data: Object.assign({ source: IncrementalSource$1.AdoptedStyleSheet }, a),
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
                type: EventType$1.Meta,
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
                type: EventType$1.FullSnapshot,
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
                        type: EventType$1.IncrementalSnapshot,
                        data: {
                            source,
                            positions,
                        },
                    })),
                    mouseInteractionCb: (d) => wrappedEmit(wrapEvent({
                        type: EventType$1.IncrementalSnapshot,
                        data: Object.assign({ source: IncrementalSource$1.MouseInteraction }, d),
                    })),
                    scrollCb: wrappedScrollEmit,
                    viewportResizeCb: (d) => wrappedEmit(wrapEvent({
                        type: EventType$1.IncrementalSnapshot,
                        data: Object.assign({ source: IncrementalSource$1.ViewportResize }, d),
                    })),
                    inputCb: (v) => wrappedEmit(wrapEvent({
                        type: EventType$1.IncrementalSnapshot,
                        data: Object.assign({ source: IncrementalSource$1.Input }, v),
                    })),
                    mediaInteractionCb: (p) => wrappedEmit(wrapEvent({
                        type: EventType$1.IncrementalSnapshot,
                        data: Object.assign({ source: IncrementalSource$1.MediaInteraction }, p),
                    })),
                    styleSheetRuleCb: (r) => wrappedEmit(wrapEvent({
                        type: EventType$1.IncrementalSnapshot,
                        data: Object.assign({ source: IncrementalSource$1.StyleSheetRule }, r),
                    })),
                    styleDeclarationCb: (r) => wrappedEmit(wrapEvent({
                        type: EventType$1.IncrementalSnapshot,
                        data: Object.assign({ source: IncrementalSource$1.StyleDeclaration }, r),
                    })),
                    canvasMutationCb: wrappedCanvasMutationEmit,
                    fontCb: (p) => wrappedEmit(wrapEvent({
                        type: EventType$1.IncrementalSnapshot,
                        data: Object.assign({ source: IncrementalSource$1.Font }, p),
                    })),
                    selectionCb: (p) => {
                        wrappedEmit(wrapEvent({
                            type: EventType$1.IncrementalSnapshot,
                            data: Object.assign({ source: IncrementalSource$1.Selection }, p),
                        }));
                    },
                    customElementCb: (c) => {
                        wrappedEmit(wrapEvent({
                            type: EventType$1.IncrementalSnapshot,
                            data: Object.assign({ source: IncrementalSource$1.CustomElement }, c),
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
                            type: EventType$1.Plugin,
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
                        type: EventType$1.DomContentLoaded,
                        data: {},
                    }));
                    if (recordAfter === 'DOMContentLoaded')
                        init();
                }));
                handlers.push(on('load', () => {
                    wrappedEmit(wrapEvent({
                        type: EventType$1.Load,
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
            type: EventType$1.Custom,
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

    var Config = {
        DEBUG: false,
        LIB_VERSION: '2.55.1'
    };

    /* eslint camelcase: "off", eqeqeq: "off" */

    // since es6 imports are static and we run unit tests from the console, window won't be defined when importing this file
    var win;
    if (typeof(window) === 'undefined') {
        var loc = {
            hostname: ''
        };
        win = {
            navigator: { userAgent: '', onLine: true },
            document: {
                location: loc,
                referrer: ''
            },
            screen: { width: 0, height: 0 },
            location: loc
        };
    } else {
        win = window;
    }

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

    var _ = {
        trim: function(str) {
            // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/Trim#Polyfill
            return str.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
        }
    };

    // Console override
    var console$1 = {
        /** @type {function(...*)} */
        log: function() {
        },
        /** @type {function(...*)} */
        warn: function() {
        },
        /** @type {function(...*)} */
        error: function() {
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
            return func.apply(console$1, arguments);
        };
    };
    var console_with_prefix = function(prefix) {
        return {
            log: log_func_with_prefix(console$1.log, prefix),
            error: log_func_with_prefix(console$1.error, prefix),
            critical: log_func_with_prefix(console$1.critical, prefix)
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
            if (win.performance && win.performance.now) {
                ticks = win.performance.now();
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
        'ahrefssiteaudit',
        'baiduspider',
        'bingbot',
        'bingpreview',
        'chrome-lighthouse',
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
                console$1.error('Skipping decoding for malformed query param: ' + result);
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
                console$1.error('localStorage unsupported; falling back to cookie store');
            }
            return supported;
        },

        error: function(msg) {
            console$1.error('localStorage error: ' + msg);
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
                console$1.error('No valid element provided to register_event');
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
                '$referrer': document$1.referrer,
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

    /**
     * Check whether we have network connection. default to true for browsers that don't support navigator.onLine (IE)
     * @returns {boolean}
     */
    var isOnline = function() {
        var onLine = win.navigator['onLine'];
        return _.isUndefined(onLine) || onLine;
    };

    var JSONStringify = null, JSONParse = null;
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

    var GDPR_DEFAULT_PERSISTENCE_PREFIX = '__mp_opt_in_out_';

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
            console$1.warn('This browser has "Do Not Track" enabled. This will prevent the Mixpanel SDK from sending any data. To ignore the "Do Not Track" browser setting, initialize the Mixpanel instance with the config "ignore_dnt: true"');
            return true;
        }
        var optedOut = _getStorageValue(token, options) === '0';
        if (optedOut) {
            console$1.warn('You are opted out of Mixpanel tracking. This will prevent the Mixpanel SDK from sending any data.');
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
                console$1.error('Unexpected error when checking tracking opt-out status: ' + err);
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

    var logger$3 = console_with_prefix('lock');

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
                logger$3.error('Timeout waiting for mutex on ' + key + '; clearing lock. [' + i + ']');
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

    var logger$2 = console_with_prefix('batch');

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
        this.reportError = options.errorReporter || _.bind(logger$2.error, logger$2);
        this.lock = new SharedLock(storageKey, {storage: this.storage});

        this.usePersistence = options.usePersistence;
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

        if (!this.usePersistence) {
            this.memQueue.push(queueEntry);
            if (cb) {
                cb(true);
            }
        } else {
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
        }
    };

    /**
     * Read out the given number of queue entries. If this.memQueue
     * has fewer than batchSize items, then look for "orphaned" items
     * in the persisted queue (items where the 'flushAfter' time has
     * already passed).
     */
    RequestQueue.prototype.fillBatch = function(batchSize) {
        var batch = this.memQueue.slice(0, batchSize);
        if (this.usePersistence && batch.length < batchSize) {
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
        if (!this.usePersistence) {
            if (cb) {
                cb(true);
            }
        } else {
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
        }

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
        if (!this.usePersistence) {
            if (cb) {
                cb(true);
            }
        } else {
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
        }

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

        if (this.usePersistence) {
            this.storage.removeItem(this.storageKey);
        }
    };

    // maximum interval between request retries after exponential backoff
    var MAX_RETRY_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes

    var logger$1 = console_with_prefix('batch');

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
            storage: options.storage,
            usePersistence: options.usePersistence
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
            this.timeoutID = setTimeout(_.bind(function() {
                if (!this.stopped) {
                    this.flush();
                }
            }, this), this.flushInterval);
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
                logger$1.log('Flush: Request already in progress');
                return;
            }

            options = options || {};
            var timeoutMS = this.libConfig['batch_request_timeout_ms'];
            var startTime = new Date().getTime();
            var currentBatchSize = this.batchSize;
            var batch = this.queue.fillBatch(currentBatchSize);
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
                    } else if (_.isObject(res) && res.httpStatusCode === 413) {
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
                                    if (this.flushOnlyOnInterval && !attemptSecondaryFlush) {
                                        this.resetFlush(); // schedule next batch with a delay
                                    } else {
                                        this.flush(); // handle next batch if the queue isn't empty
                                    }
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
            logger$1.log('MIXPANEL REQUEST:', dataForRequest);
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
        logger$1.error.apply(logger$1.error, arguments);
        if (this.errorReporter) {
            try {
                if (!(err instanceof Error)) {
                    err = new Error(msg);
                }
                this.errorReporter(msg, err);
            } catch(err) {
                logger$1.error(err);
            }
        }
    };

    var logger = console_with_prefix('recorder');
    var CompressionStream = win['CompressionStream'];

    var RECORDER_BATCHER_LIB_CONFIG = {
        'batch_size': 1000,
        'batch_flush_interval_ms': 10 * 1000,
        'batch_request_timeout_ms': 90 * 1000,
        'batch_autostart': true
    };

    var ACTIVE_SOURCES = new Set([
        IncrementalSource.MouseMove,
        IncrementalSource.MouseInteraction,
        IncrementalSource.Scroll,
        IncrementalSource.ViewportResize,
        IncrementalSource.Input,
        IncrementalSource.TouchMove,
        IncrementalSource.MediaInteraction,
        IncrementalSource.Drag,
        IncrementalSource.Selection,
    ]);

    function isUserEvent(ev) {
        return ev.type === EventType.IncrementalSnapshot && ACTIVE_SOURCES.has(ev.data.source);
    }

    var MixpanelRecorder = function(mixpanelInstance) {
        this._mixpanel = mixpanelInstance;

        // internal rrweb stopRecording function
        this._stopRecording = null;

        this.recEvents = [];
        this.seqNo = 0;
        this.replayId = null;
        this.replayStartTime = null;
        this.sendBatchId = null;

        this.idleTimeoutId = null;
        this.maxTimeoutId = null;

        this.recordMaxMs = MAX_RECORDING_MS;
        this.recordMinMs = 0;
        this._initBatcher();
    };


    MixpanelRecorder.prototype._initBatcher = function () {
        this.batcher = new RequestBatcher('__mprec', {
            libConfig: RECORDER_BATCHER_LIB_CONFIG,
            sendRequestFunc: _.bind(this.flushEventsWithOptOut, this),
            errorReporter: _.bind(this.reportError, this),
            flushOnlyOnInterval: true,
            usePersistence: false
        });
    };

    // eslint-disable-next-line camelcase
    MixpanelRecorder.prototype.get_config = function(configVar) {
        return this._mixpanel.get_config(configVar);
    };

    MixpanelRecorder.prototype.startRecording = function (shouldStopBatcher) {
        if (this._stopRecording !== null) {
            logger.log('Recording already in progress, skipping startRecording.');
            return;
        }

        this.recordMaxMs = this.get_config('record_max_ms');
        if (this.recordMaxMs > MAX_RECORDING_MS) {
            this.recordMaxMs = MAX_RECORDING_MS;
            logger.critical('record_max_ms cannot be greater than ' + MAX_RECORDING_MS + 'ms. Capping value.');
        }

        this.recordMinMs = this.get_config('record_min_ms');
        if (this.recordMinMs > MAX_VALUE_FOR_MIN_RECORDING_MS) {
            this.recordMinMs = MAX_VALUE_FOR_MIN_RECORDING_MS;
            logger.critical('record_min_ms cannot be greater than ' + MAX_VALUE_FOR_MIN_RECORDING_MS + 'ms. Capping value.');
        }

        this.recEvents = [];
        this.seqNo = 0;
        this.replayStartTime = new Date().getTime();

        this.replayId = _.UUID();

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

        var resetIdleTimeout = _.bind(function () {
            clearTimeout(this.idleTimeoutId);
            this.idleTimeoutId = setTimeout(_.bind(function () {
                logger.log('Idle timeout reached, restarting recording.');
                this.resetRecording();
            }, this), this.get_config('record_idle_timeout_ms'));
        }, this);

        var blockSelector = this.get_config('record_block_selector');
        if (blockSelector === '' || blockSelector === null) {
            blockSelector = undefined;
        }

        this._stopRecording = record({
            'emit': _.bind(function (ev) {
                this.batcher.enqueue(ev);
                if (isUserEvent(ev)) {
                    if (this.batcher.stopped && new Date().getTime() - this.replayStartTime >= this.recordMinMs) {
                        // start flushing again after user activity
                        this.batcher.start();
                    }
                    resetIdleTimeout();
                }
            }, this),
            'blockClass': this.get_config('record_block_class'),
            'blockSelector': blockSelector,
            'collectFonts': this.get_config('record_collect_fonts'),
            'inlineImages': this.get_config('record_inline_images'),
            'maskAllInputs': true,
            'maskTextClass': this.get_config('record_mask_text_class'),
            'maskTextSelector': this.get_config('record_mask_text_selector')
        });

        resetIdleTimeout();

        this.maxTimeoutId = setTimeout(_.bind(this.resetRecording, this), this.recordMaxMs);
    };

    MixpanelRecorder.prototype.resetRecording = function () {
        this.stopRecording();
        this.startRecording(true);
    };

    MixpanelRecorder.prototype.stopRecording = function () {
        if (this._stopRecording !== null) {
            this._stopRecording();
            this._stopRecording = null;
        }

        if (this.batcher.stopped) {
            // never got user activity to flush after reset, so just clear the batcher
            this.batcher.clear();
        } else {
            // flush any remaining events from running batcher
            this.batcher.flush();
            this.batcher.stop();
        }
        this.replayId = null;

        clearTimeout(this.idleTimeoutId);
        clearTimeout(this.maxTimeoutId);
    };

    /**
     * Flushes the current batch of events to the server, but passes an opt-out callback to make sure
     * we stop recording and dump any queued events if the user has opted out.
     */
    MixpanelRecorder.prototype.flushEventsWithOptOut = function (data, options, cb) {
        this._flushEvents(data, options, cb, _.bind(this._onOptOut, this));
    };

    MixpanelRecorder.prototype._onOptOut = function (code) {
        // addOptOutCheckMixpanelLib invokes this function with code=0 when the user has opted out
        if (code === 0) {
            this.recEvents = [];
            this.stopRecording();
        }
    };

    MixpanelRecorder.prototype._sendRequest = function(currentReplayId, reqParams, reqBody, callback) {
        var onSuccess = _.bind(function (response, responseBody) {
            // Increment sequence counter only if the request was successful to guarantee ordering.
            // RequestBatcher will always flush the next batch after the previous one succeeds.
            // extra check to see if the replay ID has changed so that we don't increment the seqNo on the wrong replay
            if (response.status === 200 && this.replayId === currentReplayId) {
                this.seqNo++;
            }
            callback({
                status: 0,
                httpStatusCode: response.status,
                responseBody: responseBody,
                retryAfter: response.headers.get('Retry-After')
            });
        }, this);

        win['fetch'](this.get_config('api_host') + '/' + this.get_config('api_routes')['record'] + '?' + new URLSearchParams(reqParams), {
            'method': 'POST',
            'headers': {
                'Authorization': 'Basic ' + btoa(this.get_config('token') + ':'),
                'Content-Type': 'application/octet-stream'
            },
            'body': reqBody,
        }).then(function (response) {
            response.json().then(function (responseBody) {
                onSuccess(response, responseBody);
            }).catch(function (error) {
                callback({error: error});
            });
        }).catch(function (error) {
            callback({error: error, httpStatusCode: 0});
        });
    };

    MixpanelRecorder.prototype._flushEvents = addOptOutCheckMixpanelLib(function (data, options, callback) {
        const numEvents = data.length;

        if (numEvents > 0) {
            var replayId = this.replayId;
            // each rrweb event has a timestamp - leverage those to get time properties
            var batchStartTime = data[0].timestamp;
            if (this.seqNo === 0 || !this.replayStartTime) {
                // extra safety net so that we don't send a null replay start time
                if (this.seqNo !== 0) {
                    this.reportError('Replay start time not set but seqNo is not 0. Using current batch start time as a fallback.');
                }

                this.replayStartTime = batchStartTime;
            }
            var replayLengthMs = data[numEvents - 1].timestamp - this.replayStartTime;

            var reqParams = {
                'distinct_id': String(this._mixpanel.get_distinct_id()),
                'seq': this.seqNo,
                'batch_start_time': batchStartTime / 1000,
                'replay_id': replayId,
                'replay_length_ms': replayLengthMs,
                'replay_start_time': this.replayStartTime / 1000
            };
            var eventsJson = _.JSONEncode(data);

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
                var jsonStream = new Blob([eventsJson], {type: 'application/json'}).stream();
                var gzipStream = jsonStream.pipeThrough(new CompressionStream('gzip'));
                new Response(gzipStream)
                    .blob()
                    .then(_.bind(function(compressedBlob) {
                        reqParams['format'] = 'gzip';
                        this._sendRequest(replayId, reqParams, compressedBlob, callback);
                    }, this));
            } else {
                reqParams['format'] = 'body';
                this._sendRequest(replayId, reqParams, eventsJson, callback);
            }
        }
    });


    MixpanelRecorder.prototype.reportError = function(msg, err) {
        logger.error.apply(logger.error, arguments);
        try {
            if (!err && !(msg instanceof Error)) {
                msg = new Error(msg);
            }
            this.get_config('error_reporter')(msg, err);
        } catch(err) {
            logger.error(err);
        }
    };


    win['__mp_recorder'] = MixpanelRecorder;

})();
