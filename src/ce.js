import Config from './config';
import { _ } from './utils';

var DISABLE_COOKIE = '__mpced';

// specifying these locally here since some websites override the global Node var
// ex: https://www.codingame.com/
var ELEMENT_NODE = 1;
var TEXT_NODE = 3;

var ce = {
    _previousElementSibling: function(el) {
        if (el.previousElementSibling) {
            return el.previousElementSibling;
        } else {
            do {
                el = el.previousSibling;
            } while (el && el.nodeType !== 1);
            return el;
        }
    },

    _loadScript: function(scriptUrlToLoad, callback) {
        var scriptTag = document.createElement('script');
        scriptTag.type = 'text/javascript';
        scriptTag.src = scriptUrlToLoad;
        scriptTag.onload = callback;

        var scripts = document.getElementsByTagName('script');
        if (scripts.length > 0) {
            scripts[0].parentNode.insertBefore(scriptTag, scripts[0]);
        } else {
            document.body.appendChild(scriptTag);
        }
    },

    _getPropertiesFromElement: function(elem) {
        var props = {
            'classes': elem.className.split(' '),
            'tag_name': elem.tagName
        };

        if (_.includes(['input', 'select', 'textarea'], elem.tagName.toLowerCase())) {
            var formFieldValue = this._getFormFieldValue(elem);
            if (this._includeProperty(elem, formFieldValue)) {
                props['value'] = formFieldValue;
            }
        }

        _.each(elem.attributes, function(attr) {
            props['attr__' + attr.name] = attr.value;
        });

        var nthChild = 1;
        var nthOfType = 1;
        var currentElem = elem;
        while (currentElem = this._previousElementSibling(currentElem)) { // eslint-disable-line no-cond-assign
            nthChild++;
            if (currentElem.tagName === elem.tagName) {
                nthOfType++;
            }
        }
        props['nth_child'] = nthChild;
        props['nth_of_type'] = nthOfType;

        return props;
    },

    _shouldTrackDomEvent: function(element, event) {
        if (!element || element === document || element === document.body || element.nodeType !== ELEMENT_NODE) {
            return false;
        }
        var tag = element.tagName.toLowerCase();
        switch (tag) {
            case 'html':
            case 'body':
                return false;
            case 'form':
                return event.type === 'submit';
            case 'input':
                if (['button', 'submit'].indexOf(element.getAttribute('type')) === -1) {
                    return event.type === 'change';
                } else {
                    return event.type === 'click';
                }
            case 'select':
            case 'textarea':
                return event.type === 'change';
            default:
                return event.type === 'click';
        }
    },

    _getDefaultProperties: function(eventType) {
        return {
            '$event_type': eventType,
            '$ce_version': 1,
            '$host': window.location.host,
            '$pathname': window.location.pathname
        };
    },

    _getInputValue: function(input) {
        var value = null;
        var type = input.type.toLowerCase();
        switch(type) {
            case 'checkbox':
                if (input.checked) {
                    value = [input.value];
                }
                break;
            case 'radio':
                if (input.checked) {
                    value = input.value;
                }
                break;
            default:
                value = input.value;
                break;
        }
        return value;
    },

    _getSelectValue: function(select) {
        var value;
        if (select.multiple) {
            var values = [];
            _.each(select.querySelectorAll('[selected]'), function(option) {
                values.push(option.value);
            });
            value = values;
        } else {
            value = select.value;
        }
        return value;
    },

    _includeProperty: function(input, value) {
        var classes = (input.className || '').split(' ');
        if (_.includes(classes, 'mp-always-include-value')) {
            return true;
        }

        if (_.includes(classes, 'mp-always-strip-value')) {
            return false;
        }

        if (value === null) {
            return false;
        }

        // don't include hidden or password fields
        var type = input.type || '';
        switch(type.toLowerCase()) {
            case 'hidden':
                return false;
            case 'password':
                return false;
        }

        // filter out data from fields that look like sensitive fields
        var name = input.name || input.id || '';
        var sensitiveNameRegex = /^cc|cardnum|ccnum|creditcard|csc|cvc|cvv|exp|pass|seccode|securitycode|securitynum|socialsec|socsec|ssn/i;
        if (sensitiveNameRegex.test(name.replace(/[^a-zA-Z0-9]/g, ''))) {
            return false;
        }

        if (typeof value === 'string') {
            // check to see if input value looks like a credit card number
            // see: https://www.safaribooksonline.com/library/view/regular-expressions-cookbook/9781449327453/ch04s20.html
            var ccRegex = /^(?:(4[0-9]{12}(?:[0-9]{3})?)|(5[1-5][0-9]{14})|(6(?:011|5[0-9]{2})[0-9]{12})|(3[47][0-9]{13})|(3(?:0[0-5]|[68][0-9])[0-9]{11})|((?:2131|1800|35[0-9]{3})[0-9]{11}))$/;
            if (ccRegex.test((value || '').replace(/[\- ]/g, ''))) {
                return false;
            }

            // check to see if input value looks like a social security number
            var ssnRegex = /(^\d{3}-?\d{2}-?\d{4}$)/;
            if (ssnRegex.test(value)) {
                return false;
            }
        }

        return true;
    },

    _getFormFieldValue: function(field) {
        var val;
        switch(field.tagName.toLowerCase()) {
            case 'input':
                val = this._getInputValue(field);
                break;
            case 'select':
                val = this._getSelectValue(field);
                break;
            default:
                val = field.value || field.textContent;
                break;
        }
        return this._includeProperty(field, val) ? val : null;
    },

    _getFormFieldProperties: function(form) {
        var formFieldProps = {};
        _.each(form.elements, function(field) {
            var name = field.getAttribute('name') || field.getAttribute('id');
            if (name !== null) {
                name = '$form_field__' + name;
                var val = this._getFormFieldValue(field);
                if (this._includeProperty(field, val)) {
                    var prevFieldVal = formFieldProps[name];
                    if (prevFieldVal !== undefined) { // combine values for inputs of same name
                        formFieldProps[name] = [].concat(prevFieldVal, val);
                    } else {
                        formFieldProps[name] = val;
                    }
                }
            }
        }, this);
        return formFieldProps;
    },

    _extractCustomPropertyValue: function(customProperty) {
        var propValues = [];
        _.each(document.querySelectorAll(customProperty['css_selector']), function(matchedElem) {
            if (['input', 'select'].indexOf(matchedElem.tagName.toLowerCase()) > -1) {
                propValues.push(matchedElem['value']);
            } else if (matchedElem['textContent']) {
                propValues.push(matchedElem['textContent']);
            }
        });
        return propValues.join(', ');
    },

    _getCustomProperties: function(targetElementList) {
        var props = {};
        _.each(this._customProperties, function(customProperty) {
            _.each(customProperty['event_selectors'], function(eventSelector) {
                var eventElements = document.querySelectorAll(eventSelector);
                _.each(eventElements, function(eventElement) {
                    if (_.includes(targetElementList, eventElement)) {
                        props[customProperty['name']] = this._extractCustomPropertyValue(customProperty);
                    }
                }, this);
            }, this);
        }, this);
        return props;
    },

    checkForBackoff: function(resp) {
        // temporarily stop CE for X seconds if the 'X-MP-CE-Backoff' header says to
        var secondsToDisable = parseInt(resp.getResponseHeader('X-MP-CE-Backoff'));
        if (!isNaN(secondsToDisable) && secondsToDisable > 0) {
            var disableUntil = _.timestamp() + (secondsToDisable * 1000);
            console.log('disabling CE for ' + secondsToDisable + ' seconds (from ' + _.timestamp() + ' until ' + disableUntil + ')');
            _.cookie.set_seconds(DISABLE_COOKIE, true, secondsToDisable, true);
        }
    },

    _getEventTarget: function(e) {
        // https://developer.mozilla.org/en-US/docs/Web/API/Event/target#Compatibility_notes
        if (typeof e.target === 'undefined') {
            return e.srcElement;
        } else {
            return e.target;
        }
    },

    _trackEvent: function(e, instance, callback) {
        /*** Don't mess with this code without running IE8 tests on it ***/
        var target = this._getEventTarget(e);
        if (target.nodeType === TEXT_NODE) { // defeat Safari bug (see: http://www.quirksmode.org/js/events_properties.html)
            target = target.parentNode;
        }

        if (this._shouldTrackDomEvent(target, e)) {
            var targetElementList = [target];
            var curEl = target;
            while (curEl.parentNode && curEl.parentNode !== document.body) {
                targetElementList.push(curEl.parentNode);
                curEl = curEl.parentNode;
            }

            var elementsJson = [];
            var href, elementText, form, explicitNoTrack = false;
            _.each(targetElementList, function(el, idx) {
                // if the element or a parent element is an anchor tag
                // include the href as a property
                if (el.tagName.toLowerCase() === 'a') {
                    href = el.getAttribute('href');
                } else if (el.tagName.toLowerCase() === 'form') {
                    form = el;
                }
                // crawl up to max of 5 nodes to populate text content
                if (!elementText && idx < 5 && el.textContent) {
                    var textContent = _.trim(el.textContent);
                    if (textContent) {
                        elementText = textContent.replace(/[\r\n]/g, ' ').replace(/[ ]+/g, ' ').substring(0, 255);
                    }
                }

                // allow users to programatically prevent tracking of elements by adding class 'mp-no-track'
                var classes = (el.className || '').split(' ');
                if (_.includes(classes, 'mp-no-track')) {
                    explicitNoTrack = true;
                }

                elementsJson.push(this._getPropertiesFromElement(el));
            }, this);

            if (explicitNoTrack) {
                return false;
            }

            var props = _.extend(
                this._getDefaultProperties(e.type),
                {
                    '$elements':  elementsJson,
                    '$el_attr__href': href,
                    '$el_text': elementText
                },
                this._getCustomProperties(targetElementList)
            );

            if (form && (e.type === 'submit' || e.type === 'click')) {
                _.extend(props, this._getFormFieldProperties(form));
            }
            instance.track('$web_event', props, callback);
            return true;
        }
    },

    // only reason is to stub for unit tests
    // since you can't override window.location props
    _navigate: function(href) {
        window.location.href = href;
    },

    _addDomEventHandlers: function(instance) {
        var handler = _.bind(function(e) {
            if (_.cookie.parse(DISABLE_COOKIE) !== true) {
                e = e || window.event;
                var callback = function(){};

                // special case anchor tags to wait for mixpanel track to complete
                var element = this._getEventTarget(e);
                if (!e.defaultPrevented && element.tagName.toLowerCase() === 'a' && element.href) {
                    if (!(e.which === 2 || e.metaKey || e.ctrlKey || element.target === '_blank')) { // if not opening in a new tab
                        e.preventDefault();

                        // allow other handlers to preventDefault
                        e.preventDefault = function() {
                            e.defaultPreventedAfterMixpanelHandler = true;
                        };

                        // setup a callback to navigate to the anchor's href after
                        // track is complete OR 300ms whichever comes first.
                        var that = this;
                        callback = (function(evt) {
                            var href = evt.target.href;
                            return function() {
                                if (!evt.defaultPreventedAfterMixpanelHandler) {
                                    that._navigate(href);
                                }
                            };
                        }(e));

                        // fallback in case track is too slow
                        setTimeout(function() {
                            callback();
                        }, 300);
                    }
                }

                this._trackEvent(e, instance, callback);
            }
        }, this);
        _.register_event(document, 'submit', handler, false, true);
        _.register_event(document, 'change', handler, false, true);
        _.register_event(document, 'click', handler, false, true);
    },

    _customProperties: {},
    init: function(instance) {
        if (!(document && document.body)) {
            console.log('document not ready yet, trying again in 500 milliseconds...');
            var that = this;
            setTimeout(function() { that.init(instance); }, 500);
            return;
        }

        if (!this._maybeLoadEditor(instance)) { // don't collect everything  when the editor is enabled
            var parseDecideResponse = _.bind(function(response) {
                if (response && response['config'] && response['config']['enable_collect_everything'] === true) {
                    if (response['custom_properties']) {
                        this._customProperties = response['custom_properties'];
                    }

                    instance.track('$web_event', _.extend({
                        '$title': document.title
                    }, this._getDefaultProperties('pageview')));

                    this._addDomEventHandlers(instance);
                } else {
                    instance['__autotrack_enabled'] = false;
                }
            }, this);

            instance._send_request(
                instance.get_config('decide_host') + '/decide/', {
                    'verbose': true,
                    'version': '1',
                    'lib': 'web',
                    'token': instance.get_config('token')
                },
                instance._prepare_callback(parseDecideResponse)
            );
        }
    },

    _editorParamsFromHash: function(instance, hash) {
        var editorParams;
        try {
            var state = _.getHashParam(hash, 'state');
            state = JSON.parse(decodeURIComponent(state));
            var expiresInSeconds = _.getHashParam(hash, 'expires_in');
            editorParams = {
                'accessToken': _.getHashParam(hash, 'access_token'),
                'accessTokenExpiresAt': (new Date()).getTime() + (Number(expiresInSeconds) * 1000),
                'appHost': instance.get_config('app_host'),
                'bookmarkletMode': !!state['bookmarkletMode'],
                'projectId': state['projectId'],
                'projectToken': state['token'],
                'userFlags': state['userFlags'],
                'userId': state['userId']
            };
            window.sessionStorage.setItem('editorParams', JSON.stringify(editorParams));

            if (state['desiredHash']) {
                window.location.hash = state['desiredHash'];
            } else if (window.history) {
                history.replaceState('', document.title, window.location.pathname + window.location.search); // completely remove hash
            } else {
                window.location.hash = ''; // clear hash (but leaves # unfortunately)
            }
        } catch (e) {
            console.error('Unable to parse data from hash', e);
        }
        return editorParams;
    },

    /**
     * To load the visual editor, we need an access token and other state. That state comes from one of three places:
     * 1. In the URL hash params if the customer is using an old snippet
     * 2. From session storage under the key `_mpcehash` if the snippet already parsed the hash
     * 3. From session storage under the key `editorParams` if the editor was initialized on a previous page
     */
    _maybeLoadEditor: function(instance) {
        var parseFromUrl = false;
        if (_.getHashParam(window.location.hash, 'state')) {
            var state = _.getHashParam(window.location.hash, 'state');
            state = JSON.parse(decodeURIComponent(state));
            parseFromUrl = state['action'] === 'mpeditor';
        }
        var parseFromStorage = !!window.sessionStorage.getItem('_mpcehash');
        var editorParams;

        if (parseFromUrl) { // happens if they are initializing the editor using an old snippet
            editorParams = this._editorParamsFromHash(instance, window.location.hash);
        } else if (parseFromStorage) { // happens if they are initialized the editor and using the new snippet
            editorParams = this._editorParamsFromHash(instance, window.sessionStorage.getItem('_mpcehash'));
            window.sessionStorage.removeItem('_mpcehash');
        } else { // get credentials from sessionStorage from a previous initialzation
            editorParams = JSON.parse(window.sessionStorage.getItem('editorParams') || '{}');
        }

        if (editorParams['projectToken'] && instance.get_config('token') === editorParams['projectToken']) {
            this._loadEditor(instance, editorParams);
            return true;
        } else {
            return false;
        }
    },

    // only load the codeless event editor once, even if there are multiple instances of MixpanelLib
    _editorLoaded: false,
    _loadEditor: function(instance, editorParams) {
        if (!this._editorLoaded) {
            this._editorLoaded = true;
            var editorUrl;
            var cacheBuster = '?_ts=' + (new Date()).getTime();
            if (Config.DEBUG) {
                editorUrl = instance.get_config('app_host') + '/site_media/compiled/reports/collect-everything/editor.js' + cacheBuster;
            } else {
                editorUrl = instance.get_config('app_host') + '/site_media/bundle-webpack/reports/collect-everything/editor.min.js' + cacheBuster;
            }
            this._loadScript(editorUrl, function() {
                window['mp_load_editor'](editorParams);
            });
            return true;
        }
        return false;
    },

    // this is a mechanism to ramp up CE with no server-side interaction.
    // when CE is active, every page load results in a decide request. we
    // need to gently ramp this up so we don't overload decide. this decides
    // deterministically if CE is enabled for this project by modding the char
    // value of the project token.
    enabledForProject: function(token, numBuckets, numEnabledBuckets) {
        numBuckets = !_.isUndefined(numBuckets) ? numBuckets : 10;
        numEnabledBuckets = !_.isUndefined(numEnabledBuckets) ? numEnabledBuckets : 10;
        var charCodeSum = 0;
        for (var i = 0; i < token.length; i++) {
            charCodeSum += token.charCodeAt(i);
        }
        return (charCodeSum % numBuckets) < numEnabledBuckets;
    },

    isBrowserSupported: function() {
        return _.isFunction(document.querySelectorAll);
    }
};

_.bind_instance_methods(ce);
_.safewrap_instance_methods(ce);

export { DISABLE_COOKIE, ce };
