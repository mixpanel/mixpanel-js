import { expect } from 'chai';
import jsdom from 'mocha-jsdom';
import sinon from 'sinon';

import { DISABLE_COOKIE, ce } from '../../src/ce';
import { _ } from '../../src/utils';

jsdom({
  url: 'https://mixpanel.com/about/?query=param'
});

let clock = sinon.useFakeTimers();

const triggerMouseEvent = function(node, eventType) {
  node.dispatchEvent(new MouseEvent(eventType, {
    bubbles: true,
    cancelable: true,
  }));
}

const simulateClick = function(el) {
  triggerMouseEvent(el, "click");
}

describe('Collect Everything system', function() {
  describe('_shouldTrackDomEvent', function() {
    const _shouldTrackDomEvent = ce._shouldTrackDomEvent;

    it('should track "submit" on forms', function() {
      expect(_shouldTrackDomEvent(document.createElement('form'), {
        type: 'submit',
      })).to.equal(true);
    });

    ['input', 'select', 'textarea'].forEach(tagName => {
      it('should track "change" on ' + tagName, function() {
        expect(_shouldTrackDomEvent(document.createElement(tagName), {
          type: 'change',
        })).to.equal(true);
      });
    });

    ['div', 'sPan', 'A', 'strong', 'table'].forEach(tagName => {
      it('should track "click" on ' + tagName.toLowerCase() + 's', function() {
        expect(_shouldTrackDomEvent(document.createElement(tagName), {
          type: 'click',
        })).to.equal(true);
      });
    });

    it('should track "click" on buttons', function() {
      const button1 = document.createElement('button');
      const button2 = document.createElement('input');
      button2.setAttribute('type', 'button');
      const button3 = document.createElement('input');
      button3.setAttribute('type', 'submit');
      [button1, button2, button3].forEach(button => {
        expect(_shouldTrackDomEvent(button, {
          type: 'click',
        })).to.equal(true);
      });
    });
    it('should protect against bad inputs', function() {
      expect(_shouldTrackDomEvent(null, {
        type: 'click',
      })).to.equal(false);
      expect(_shouldTrackDomEvent(undefined, {
        type: 'click',
      })).to.equal(false);
      expect(_shouldTrackDomEvent("div", {
        type: 'click',
      })).to.equal(false);
    });

    it('should NOT track click on forms', function() {
      expect(_shouldTrackDomEvent(document.createElement('form'), {
        type: 'click',
      })).to.equal(false);
    });

    ['input', 'select', 'textarea'].forEach(tagName => {
      it('should NOT track click on ' + tagName, function() {
        expect(_shouldTrackDomEvent(document.createElement(tagName), {
          type: 'click',
        })).to.equal(false);
      });
    });
  });

  describe('_getPropertiesFromElement', function() {
    let div, div2, input, hidden, password;
    before(function() {
      div = document.createElement('div');
      div.className = 'class1 class2 class3'
      div.innerHTML = 'my <span>sweet <i>inner</i></span> text';

      input = document.createElement('input');
      input.value = 'test val';

      hidden = document.createElement('input');
      hidden.setAttribute('type', 'hidden');
      hidden.value = 'hidden val';

      password = document.createElement('input');
      password.setAttribute('type', 'password');
      password.value = 'password val';

      const divSibling = document.createElement('div');
      const divSibling2 = document.createElement('span');

      div2 = document.createElement('div');
      div2.className = 'parent';
      div2.appendChild(divSibling);
      div2.appendChild(divSibling2);
      div2.appendChild(div);
      div2.appendChild(input);
      div2.appendChild(hidden);
      div2.appendChild(password);
    });

    it('should contain the proper tag name', function() {
      const props = ce._getPropertiesFromElement(div, true);
      expect(props['tag_name']).to.equal('DIV');
    });

    it('should contain class list', function() {
      const props = ce._getPropertiesFromElement(div, true);
      expect(props['classes']).to.deep.equal(['class1', 'class2', 'class3']);
    });

    it('should contain element text when includeTextContent is true', function() {
      const props = ce._getPropertiesFromElement(div, true);
      expect(props['text']).to.equal('my sweet inner text');
    });

    it('should NOT contain element text when includeTextContent is false', function() {
      const props = ce._getPropertiesFromElement(div, false);
      expect(props['text']).to.equal(undefined);
    });

    it('should contain input value', function() {
      const props = ce._getPropertiesFromElement(input, true);
      expect(props['value']).to.equal('test val');
    });

    it('should strip hidden input value', function() {
      const props = ce._getPropertiesFromElement(hidden, true);
      expect(props['value']).to.equal('[stripped]');
    });

    it('should strip password input value', function() {
      const props = ce._getPropertiesFromElement(password, true);
      expect(props['value']).to.equal('[stripped]');
    });

    it('should contain nth-of-type', function() {
      const props = ce._getPropertiesFromElement(div, true);
      expect(props['nth_of_type']).to.equal(2);
    });

    it('should contain nth-child', function() {
      const props = ce._getPropertiesFromElement(password, true);
      expect(props['nth_child']).to.equal(6);
    });
  });

  describe('_getInputValue', function() {
    it('should return the value of an input text field', function() {
      const input = document.createElement('input');
      input.setAttribute('type', 'text');
      input.value = 'text val';
      const val = ce._getInputValue(input);
      expect(val).to.equal('text val');
    });

    it('should return the value of an input checkbox field only if it is checked', function() {
      const input = document.createElement('input');
      input.setAttribute('type', 'checkbox');
      input.value = 'checkbox val';
      expect(ce._getInputValue(input)).to.equal(undefined);
      input.checked = true;
      expect(ce._getInputValue(input)).to.deep.equal(['checkbox val']);
    });

    it('should return the value of an input radio button if it is checked', function() {
      const input = document.createElement('input');
      input.setAttribute('type', 'radio');
      input.value = 'radio val';
      expect(ce._getInputValue(input)).to.equal(undefined);
      input.checked = true;
      expect(ce._getInputValue(input)).to.equal('radio val');
    });
  });

  describe('_getSelectValue', function() {
    it('should return the selected value of a select menu', function() {
      const select = document.createElement('select');
      const option1 = document.createElement('option');
      const option2 = document.createElement('option');
      option1.value = '1';
      option2.value = '2';
      select.appendChild(option1);
      select.appendChild(option2);
      expect(ce._getSelectValue(select)).to.equal('1');
      option2.setAttribute('selected', true);
      expect(ce._getSelectValue(select)).to.equal('2');
    });

    it('should return a list of selected values when multiple is enabled', function() {
      const select = document.createElement('select');
      const option1 = document.createElement('option');
      const option2 = document.createElement('option');
      select.setAttribute('multiple', true);
      option1.value = '1';
      option2.value = '2';
      select.appendChild(option1);
      select.appendChild(option2);
      expect(ce._getSelectValue(select)).to.deep.equal([]);
      option1.setAttribute('selected', true);
      expect(ce._getSelectValue(select)).to.deep.equal(['1']);
      option2.setAttribute('selected', true);
      expect(ce._getSelectValue(select)).to.deep.equal(['1', '2']);
    });
  });

  describe('_sanitizeInputValue', function() {
    let input;

    beforeEach(function() {
      input = document.createElement('input');
    });

    it('should never sanitize inputs with class "mp-never-strip-value"', function() {
      input.type = 'password';
      input.className = 'test1 mp-never-strip-value test2';
      input.value = 'force included password';
      expect(ce._sanitizeInputValue(input, input.value)).to.equal('force included password');
    });

    it('should sanitize inputs with class "mp-always-strip-value"', function() {
      input.type = 'text';
      input.className = 'test1 mp-always-strip-value test2';
      input.value = 'force sanitized';
      expect(ce._sanitizeInputValue(input, input.value)).to.equal('[stripped]');
    });

    it('should sanitize hidden fields', function() {
      input.type = 'hidden';
      input.value = 'hidden val';
      expect(ce._sanitizeInputValue(input, input.value)).to.equal('[stripped]');
    });

    it('should sanitize password fields', function() {
      input.type = 'password';
      input.value = 'password val';
      expect(ce._sanitizeInputValue(input, input.value)).to.equal('[stripped]');
    });

    it('should sanitize fields with sensitive names', function() {
      const sensitiveNames = [
        'cc_name',
        'card-num',
        'ccnum',
        'credit-card_number',
        'credit_card[number]',
        'csc num',
        'CVC',
        'Expiration',
        'password',
        'security code',
        'seccode',
        'security number',
        'social sec',
        'SsN',
      ];
      input.type = 'text';
      input.value = 'should be strippedl';
      sensitiveNames.forEach(name => {
        input.name = name;
        expect(ce._sanitizeInputValue(input, input.value)).to.equal('[stripped]');
      });
    });

    it('should strip numbers that look like valid credit cards', function() {
      input.type = 'text';
      // one for each type on http://www.getcreditcardnumbers.com/
      const validCCNumbers = ['3419-881002-84912', '30148420855976', '5183792099737678', '6011-5100-8788-7057', '180035601937848', '180072512946394', '4556617778508'];
      validCCNumbers.forEach(num => {
        expect(ce._sanitizeInputValue(input, num)).to.equal('[stripped]');
      });
    });

    it('should strip social security numbers', function() {
      input.type = 'text';
      input.value = '123-45-6789';
      expect(ce._sanitizeInputValue(input, input.value)).to.equal('[stripped]');
    });

    it('should return the original value for non-sensitive inputs', function() {
      input.type = 'text';
      input.value = 'Josh';
      expect(ce._sanitizeInputValue(input, input.value)).to.equal('Josh');
    });

    it('should return the original value for multi selects', function() {
      const select = document.createElement('select');
      const option1 = document.createElement('option');
      const option2 = document.createElement('option');
      select.setAttribute('multiple', true);
      option1.value = '1';
      option2.value = '2';
      select.appendChild(option1);
      select.appendChild(option2);
      option1.setAttribute('selected', true);
      option2.setAttribute('selected', true);
      expect(ce._sanitizeInputValue(input, ce._getSelectValue(select))).to.deep.equal(['1', '2']);
    });
  });

  describe('_getFormFieldProperties', function() {
    it('should return a property for each form field', function() {
      const formHtml = `
        <input type="text" name="name" placeholder="your name" value="Test name"/>
        <input type="radio" name="color" value="red" checked/> red <input type="radio" name="color" value="blue" /> blue
        <input type="checkbox" name="contact" value="phone" checked/> phone <input type="checkbox" name="contact" value="email" checked/> email
        <select name="city">
            <option value="ft-worth">Fort Worth</option>
            <option value="dallas" selected>Dallas</option>
        </select>
        <select name="cities-visited" multiple>
            <option value="ft-worth" selected>Fort Worth</option>
            <option value="dallas">Dallas</option>
            <option value="sf" selected>San Francisco</option>
            <option value="nyc">New York City</option>
        </select>
        <textarea id="myTextArea">I have questions</textarea>
        <input type="submit" value="Submit">
      `;
      const form = document.createElement('form');
      form.innerHTML = formHtml;
      const formFieldProps = ce._getFormFieldProperties(form);
      expect(formFieldProps).to.deep.equal({
        '$form_field__name': 'Test name',
        '$form_field__color': 'red',
        '$form_field__contact': [ 'phone', 'email' ],
        '$form_field__city': 'dallas',
        '$form_field__cities-visited': [ 'ft-worth', 'sf' ],
        '$form_field__myTextArea': 'I have questions',
      });
    });
  });

  describe('isBrowserSupported', function() {
    let orig;
    beforeEach(function() {
      orig = document.querySelectorAll;
    });

    afterEach(function() {
      document.querySelectorAll = orig;
    });

    it('should return true if document.querySelectorAll is a function', function() {
      document.querySelectorAll = function() {};
      expect(ce.isBrowserSupported()).to.equal(true);
    });

    it('should return false if document.querySelectorAll is not a function', function() {
      document.querySelectorAll = undefined;
      expect(ce.isBrowserSupported()).to.equal(false);
    });
  });

  describe('enabledForProject', function() {
    it('should enable ce for the project with token "d" when 5 buckets are enabled out of 10', function() {
      expect(ce.enabledForProject('d', 10, 5)).to.equal(true);
    });
    it('should NOT enable ce for the project with token "a" when 5 buckets are enabled out of 10', function() {
      expect(ce.enabledForProject('a', 10, 5)).to.equal(false);
    });
  });

  describe('_previousElementSibling', function() {
    it('should return the adjacent sibling', function() {
      const div = document.createElement('div');
      const sibling = document.createElement('div');
      const child = document.createElement('div');
      div.appendChild(sibling);
      div.appendChild(child);
      expect(ce._previousElementSibling(child)).to.equal(sibling);
    });

    it('should return the first child and not the immediately previous sibling (text)', function() {
      const div = document.createElement('div');
      const sibling = document.createElement('div');
      const child = document.createElement('div');
      div.appendChild(sibling);
      div.appendChild(document.createTextNode('some text'));
      div.appendChild(child);
      expect(ce._previousElementSibling(child)).to.equal(sibling);
    });

    it('should return null when the previous sibling is a text node', function() {
      const div = document.createElement('div');
      const child = document.createElement('div');
      div.appendChild(document.createTextNode('some text'));
      div.appendChild(child);
      expect(ce._previousElementSibling(child)).to.equal(null);
    });
  });

  describe('_loadScript', function() {
    beforeEach(function() {
      document.body.innerHTML = '';
    });

    it('should insert the given script before the one already on the page', function() {
      document.body.appendChild(document.createElement('script'));
      const callback = _ => _;
      ce._loadScript('https://fake_url', callback);
      const scripts = document.getElementsByTagName('script');
      const new_script = scripts[0];

      expect(scripts.length).to.equal(2);
      expect(new_script.type).to.equal('text/javascript');
      expect(new_script.src).to.equal('https://fake_url/');
      expect(new_script.onload).to.equal(callback);
    });

    it('should add the script to the page when there aren\'t any preexisting scripts on the page', function() {
      const callback = _ => _;
      ce._loadScript('https://fake_url', callback);
      const scripts = document.getElementsByTagName('script');
      const new_script = scripts[0];

      expect(scripts.length).to.equal(1);
      expect(new_script.type).to.equal('text/javascript');
      expect(new_script.src).to.equal('https://fake_url/');
      expect(new_script.onload).to.equal(callback);
    });
  });

  describe('_getDefaultProperties', function() {
    it('should return the default properties', function() {
      expect(ce._getDefaultProperties('test')).to.deep.equal({
        '$event_type': 'test',
        '$ce_version': 1,
        '$host': 'mixpanel.com',
        '$pathname': '/about/',
      });
    });
  });


  describe('_getCustomProperties', function() {
    let customProps;
    let noCustomProps;
    let trackedElem;
    let trackedElemChild;
    let untrackedElem;
    before(function() {
      trackedElem = document.createElement('div');
      trackedElem.className = 'ce_event';

      trackedElemChild = document.createElement('span');
      trackedElem.appendChild(trackedElemChild);

      untrackedElem = document.createElement('div');
      untrackedElem.className = 'untracked_event';

      const prop1 = document.createElement('div');
      prop1.className = '_mp_test_property_1';
      prop1.innerHTML = 'Test prop 1';

      const prop2 = document.createElement('div');
      prop2.className = '_mp_test_property_2';
      prop2.innerHTML = 'Test prop 2';

      document.body.appendChild(untrackedElem);
      document.body.appendChild(trackedElem);
      document.body.appendChild(prop1);
      document.body.appendChild(prop2);

      ce._customProperties = [
        {
          name: 'Custom Property 1',
          css_selector: 'div._mp_test_property_1',
          event_selectors: ['.ce_event'],
        },
        {
          name: 'Custom Property 2',
          css_selector: 'div._mp_test_property_2',
          event_selectors: ['.event_with_no_element'],
        },
      ];
    });

    it('should return custom properties for only matching element selectors', function() {
      customProps = ce._getCustomProperties([trackedElem]);
      expect(customProps).to.deep.equal({
        'Custom Property 1': 'Test prop 1'
      });
    });

    it('should return no custom properties for elements that do not match an event selector', function() {
      noCustomProps = ce._getCustomProperties([untrackedElem]);
      expect(noCustomProps).to.deep.equal({});
    });
  });

  describe('_trackEvent', function() {
    let lib, sandbox;

    beforeEach(function() {
      sandbox = sinon.sandbox.create();
      sandbox.spy(ce, '_getFormFieldProperties');
      lib = {
        _ceElementTextProperties: [],
        track: sandbox.spy(),
      };
    });

    afterEach(function() {
      sandbox.restore();
    });

    it('should track a click event with parent and grandparent els', function() {
      const elTarget = document.createElement('a');
      const elParent = document.createElement('span');
      elParent.appendChild(elTarget);
      const elGrandparent = document.createElement('div');
      elGrandparent.appendChild(elParent);
      const elGreatGrandparent = document.createElement('table');
      elGreatGrandparent.appendChild(elGrandparent);
      const e = {
        target: elTarget,
        type: 'click',
      }
      ce._trackEvent(e, lib);
      expect(ce._getFormFieldProperties.callCount).to.equal(0);
      expect(lib.track.calledOnce).to.equal(true);
      const trackArgs = lib.track.args[0];
      const event = trackArgs[0];
      const props = trackArgs[1];
      expect(event).to.equal('$web_event');
      expect(props['$event_type']).to.equal('click');
      expect(props).to.have.property('$host', 'mixpanel.com');
      expect(props).to.have.property('$el_tag_name', 'A');
      expect(props['$elements'][1]).to.have.property('tag_name', 'SPAN');
      expect(props['$elements'][2]).to.have.property('tag_name', 'DIV');
    });

    it('should track a submit event with form field props', function() {
      const e = {
        target: document.createElement('form'),
        type: 'submit',
      }
      ce._trackEvent(e, lib);
      expect(ce._getFormFieldProperties.calledOnce).to.equal(true);
      expect(lib.track.calledOnce).to.equal(true);
      const trackArgs = lib.track.args[0];
      const props = trackArgs[1];
      expect(props['$event_type']).to.equal('submit');
    });

    it('should never track an element with `mp-no-track` class', function() {
      const a = document.createElement('a');
      const span = document.createElement('span');
      a.appendChild(span);
      ce._trackEvent({target: a, type: 'click'}, lib);
      expect(lib.track.calledOnce).to.equal(true);
      lib.track.reset();

      ce._trackEvent({target: span, type: 'click'}, lib);
      expect(lib.track.calledOnce).to.equal(true);
      lib.track.reset();

      a.className = 'test1 mp-no-track test2';
      ce._trackEvent({target: a, type: 'click'}, lib);
      expect(lib.track.callCount).to.equal(0);

      ce._trackEvent({target: span, type: 'click'}, lib);
      expect(lib.track.callCount).to.equal(0);
    });
  });

  describe('_addDomEventHandlers', function() {
    const lib = {
      track: sinon.spy()
    };
    before(function() {
      document.title = 'test page';
      ce._addDomEventHandlers(lib);
    });

    it('should track click events', function() {
      const div = document.createElement('div');
      document.body.appendChild(div);
      simulateClick(div);
      simulateClick(div);
      expect(true).to.equal(lib.track.calledTwice);
      const trackArgs1 = lib.track.args[0];
      const trackArgs2 = lib.track.args[1];
      const eventType1 = trackArgs1[1]['$event_type'];
      const eventType2 = trackArgs2[1]['$event_type'];
      expect(eventType1).to.equal('click');
      expect(eventType2).to.equal('click');
      lib.track.reset();
    });
  });

  describe('init', function() {
    let lib, sandbox, _maybeLoadEditorStub;
    beforeEach(function() {
      sandbox = sinon.sandbox.create();
      sandbox.spy(ce, '_addDomEventHandlers');
      _maybeLoadEditorStub = sandbox.stub(ce, '_maybeLoadEditor').returns(false);
      lib = {
        _prepare_callback: sandbox.spy(callback => callback),
        _send_request: sandbox.spy((url, params, callback) => callback({config: {enable_collect_everything: true}})),
        get_config: sandbox.spy(function(key) {
          switch (key) {
            case 'decide_host':
              return 'https://test.com';
            case 'token':
              return 'testtoken';
          }
        }),
        token: 'testtoken',
        track: sandbox.spy(),
      };
    });

    afterEach(function() {
      sandbox.restore();
    });

    it('should call _addDomEventHandlders', function() {
      ce.init(lib);
      expect(ce._addDomEventHandlers.calledOnce).to.equal(true);
    });

    it('should NOT call _addDomEventHandlders if the decide request fails', function() {
      lib._send_request = sandbox.spy((url, params, callback) => callback({status: 0, error: "Bad HTTP status: 400 Bad Request"}));
      ce.init(lib);
      expect(ce._addDomEventHandlers.called).to.equal(false);
    });

    it('should NOT call _addDomEventHandlders when loading editor', function() {
      _maybeLoadEditorStub.returns(true);
      ce.init(lib);
      expect(ce._addDomEventHandlers.calledOnce).to.equal(false);
    });

    it('should NOT call _addDomEventHandlders when enable_collect_everything is "false"', function() {
      lib._send_request = sandbox.spy((url, params, callback) => callback({config: {enable_collect_everything: false}}));
      ce.init(lib);
      expect(ce._addDomEventHandlers.calledOnce).to.equal(false);
    });

    it('should call instance._send_request', function() {
      ce.init(lib);
      expect(lib._send_request.calledOnce).to.equal(true);
      expect(lib._send_request.calledWith('https://test.com/decide/', {
        'verbose': true,
        'version': '1',
        'lib': 'web',
        'token': 'testtoken',
      })).to.equal(true);
    });

    it('should track pageview event', function() {
      ce.init(lib);
      expect(lib.track.calledOnce).to.equal(true);
      const trackArgs = lib.track.args[0];
      const event = trackArgs[0];
      const props = trackArgs[1];
      expect(event).to.equal('$web_event');
      expect(props).to.deep.equal({
        '$event_type': 'pageview',
        '$ce_version': 1,
        '$title': 'test page',
        '$host': 'mixpanel.com',
        '$pathname': '/about/',
      });
    });

    it('should check whether to load the editor', function() {
      ce.init(lib);
      expect(ce._maybeLoadEditor.calledOnce).to.equal(true);
      expect(ce._maybeLoadEditor.calledWith(lib)).to.equal(true);
    });
  });

  describe('_maybeLoadEditor', function() {
    let _window, hash, editorParams, sandbox, lib = {};
    beforeEach(function() {
      _window = window;
      const _storage = {};
      window = {
        location: {
          hash: '',
        },
        sessionStorage: {
          setItem: function(k, v) {
            _storage[k] = v;
          },
          getItem: function(k) {
            if (_storage.hasOwnProperty(k)) {
              return _storage[k];
            } else {
              return null;
            }
          },
        },
      };
      sandbox = sinon.sandbox.create();
      sandbox.stub(ce, '_loadEditor');
      sandbox.spy(window.sessionStorage, 'setItem');
      sandbox.spy(window.sessionStorage, 'getItem');

      lib.get_config = sandbox.stub();
      lib.get_config.withArgs('token').returns('test_token');
      lib.get_config.withArgs('app_host').returns('test_app_host');

      const userFlags = {
        flag_1: 0,
        flag_2: 1,
      }
      const state = {
        action: 'mpeditor',
        desiredHash: '#myhash',
        projectId: 3,
        token: 'test_token',
        userFlags,
        userId: 12345,
      };
      const hashParams = {
        access_token: 'test_access_token',
        state: encodeURIComponent(JSON.stringify(state)),
        expires_in: 3600,
      };
      editorParams = {
        accessToken: 'test_access_token',
        accessTokenExpiresAt: 3600000,
        appHost: 'test_app_host',
        bookmarkletMode: false,
        projectId: 3,
        projectToken: 'test_token',
        userFlags,
        userId: 12345,
      };

      hash = Object.keys(hashParams).map(k => `${k}=${hashParams[k]}`).join('&');
    });

    afterEach(function() {
      window = _window;
      sandbox.restore();
    });

    it('should initialize the visual editor when the hash state contains action "mpeditor"', function() {
      window.location.href = 'https://mixpanel.com/';
      window.location.hash = `#${hash}`;
      ce._maybeLoadEditor(lib);
      expect(ce._loadEditor.calledOnce).to.equal(true);
      expect(ce._loadEditor.calledWith(lib, editorParams)).to.equal(true);
      expect(window.sessionStorage.setItem.callCount).to.equal(1);
      expect(window.sessionStorage.setItem.calledWith('editorParams', JSON.stringify(editorParams))).to.equal(true);
    });

    it('should initialize the visual editor when the hash was parsed by the snippet', function() {
      window.location.href = 'https://mixpanel.com/';
      window.sessionStorage.setItem('_mpcehash', `#${hash}`);
      ce._maybeLoadEditor(lib);
      expect(ce._loadEditor.calledOnce).to.equal(true);
      expect(ce._loadEditor.calledWith(lib, editorParams)).to.equal(true);
      expect(window.sessionStorage.setItem.callCount).to.equal(2);
      expect(window.sessionStorage.setItem.calledWith('editorParams', JSON.stringify(editorParams))).to.equal(true);
    });

    it('should NOT initialize the visual editor when the activation query param does not exist', function() {
      window.location.href = 'https://mixpanel.com/';
      ce._maybeLoadEditor(lib);
      expect(ce._loadEditor.calledOnce).to.equal(false);
    });
  });

  describe('load and close editor', function() {
    const lib = {};
    let sandbox;

    beforeEach(function() {
      ce._editorLoaded = false;
      sandbox = sinon.sandbox.create();
      sandbox.stub(ce, '_loadScript', (path, callback) => callback());
      lib.get_config = sandbox.stub();
      lib.get_config.withArgs('app_host').returns('mixpanel.com');
      lib.get_config.withArgs('token').returns('token');
      window = {
        location: {
          reload: sinon.spy(),
        },
        mp_load_editor: sandbox.spy(),
        sessionStorage: {
          setItem: sinon.spy(),
        },
      };
    });

    afterEach(function() {
      sandbox.restore();
    });

    it('should load if not previously loaded', function() {
      const editorParams = {
        accessToken: 'accessToken',
        expiresAt: 'expiresAt',
        apiKey: 'apiKey',
      };
      const loaded = ce._loadEditor(lib, editorParams);
      expect(window.mp_load_editor.calledOnce).to.equal(true);
      expect(window.mp_load_editor.calledWithExactly(editorParams)).to.equal(true);
      expect(loaded).to.equal(true);
    });

    it('should NOT load if previously loaded', function() {
      ce._loadEditor(lib, 'accessToken');
      const loaded = ce._loadEditor(lib, 'accessToken');
      expect(loaded).to.equal(false);
    });
  });

  describe('track backoff', function() {
    beforeEach(function() {
      clock = sinon.useFakeTimers();
    });

    it('should not track when the cookie is set', function() {
      const cookie = {};
      _.cookie.set = sinon.spy((cookieKey, val, expireySeconds, cross_subdomain) => {
        cookie[cookieKey] = val;
        setTimeout(() => delete cookie[cookieKey], expireySeconds * 1000);
      });
      _.cookie.parse = sinon.spy(cookieKey => JSON.parse(cookie[cookieKey] || null));
      sinon.spy(ce, '_trackEvent');

      ce._addDomEventHandlers({});
      ce.checkForBackoff({getResponseHeader: () => 1});

      expect(_.cookie.set.calledWith(DISABLE_COOKIE, true, 1, true)).to.equal(true);

      // test immediatelya after
      expect(_.cookie.parse(DISABLE_COOKIE)).to.equal(true);
      simulateClick(document.body);
      expect(ce._trackEvent.called).to.equal(false);

      // test 1 millisecond before expiration
      clock.tick(999);
      expect(_.cookie.parse(DISABLE_COOKIE)).to.equal(true);
      simulateClick(document.body);
      expect(ce._trackEvent.called).to.equal(false);

      // test at expiration
      clock.tick(1);
      expect(_.cookie.parse(DISABLE_COOKIE)).to.equal(null);
      simulateClick(document.body);
      expect(ce._trackEvent.called).to.equal(true);
    });
  });
});
