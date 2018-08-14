import { expect } from 'chai';
import jsdom from 'jsdom-global';
import sinon from 'sinon';

import { _ } from '../../src/utils';
import { autotrack } from '../../src/autotrack';

import jsdomSetup from './jsdom-setup';

const triggerMouseEvent = function(node, eventType) {
  node.dispatchEvent(new MouseEvent(eventType, {
    bubbles: true,
    cancelable: true,
  }));
}

const simulateClick = function(el) {
  triggerMouseEvent(el, "click");
}


describe('Autotrack system', function() {
  jsdomSetup({
    url: 'https://example.com/about/?query=param',
  });

  describe('_getPropertiesFromElement', function() {
    let div, div2, input, sensitiveInput, hidden, password;
    beforeEach(function() {
      div = document.createElement('div');
      div.className = 'class1 class2 class3'
      div.innerHTML = 'my <span>sweet <i>inner</i></span> text';

      input = document.createElement('input');
      input.value = 'test val';

      sensitiveInput = document.createElement('input');
      sensitiveInput.value = 'test val';
      sensitiveInput.className = 'mp-sensitive';

      hidden = document.createElement('div');
      hidden.setAttribute('type', 'hidden');
      hidden.value = 'hidden val';

      password = document.createElement('div');
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
      div2.appendChild(sensitiveInput);
      div2.appendChild(hidden);
      div2.appendChild(password);
    });

    it('should contain the proper tag name', function() {
      const props = autotrack._getPropertiesFromElement(div);
      expect(props['tag_name']).to.equal('div');
    });

    it('should contain class list', function() {
      const props = autotrack._getPropertiesFromElement(div);
      expect(props['classes']).to.deep.equal(['class1', 'class2', 'class3']);
    });

    it('should not collect input value', function() {
      const props = autotrack._getPropertiesFromElement(input);
      expect(props['value']).to.equal(undefined);
    });

    it('should strip element value with class "mp-sensitive"', function() {
      const props = autotrack._getPropertiesFromElement(sensitiveInput);
      expect(props['value']).to.equal(undefined);
    });

    it('should strip hidden element value', function() {
      const props = autotrack._getPropertiesFromElement(hidden);
      expect(props['value']).to.equal(undefined);
    });

    it('should strip password element value', function() {
      const props = autotrack._getPropertiesFromElement(password);
      expect(props['value']).to.equal(undefined);
    });

    it('should contain nth-of-type', function() {
      const props = autotrack._getPropertiesFromElement(div);
      expect(props['nth_of_type']).to.equal(2);
    });

    it('should contain nth-child', function() {
      const props = autotrack._getPropertiesFromElement(password);
      expect(props['nth_child']).to.equal(7);
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
      expect(autotrack.isBrowserSupported()).to.equal(true);
    });

    it('should return false if document.querySelectorAll is not a function', function() {
      document.querySelectorAll = undefined;
      expect(autotrack.isBrowserSupported()).to.equal(false);
    });
  });

  describe('enabledForProject', function() {
    it('should enable ce for the project with token "d" when 5 buckets are enabled out of 10', function() {
      expect(autotrack.enabledForProject('d', 10, 5)).to.equal(true);
    });
    it('should NOT enable ce for the project with token "a" when 5 buckets are enabled out of 10', function() {
      expect(autotrack.enabledForProject('a', 10, 5)).to.equal(false);
    });
  });

  describe('_previousElementSibling', function() {
    it('should return the adjacent sibling', function() {
      const div = document.createElement('div');
      const sibling = document.createElement('div');
      const child = document.createElement('div');
      div.appendChild(sibling);
      div.appendChild(child);
      expect(autotrack._previousElementSibling(child)).to.equal(sibling);
    });

    it('should return the first child and not the immediately previous sibling (text)', function() {
      const div = document.createElement('div');
      const sibling = document.createElement('div');
      const child = document.createElement('div');
      div.appendChild(sibling);
      div.appendChild(document.createTextNode('some text'));
      div.appendChild(child);
      expect(autotrack._previousElementSibling(child)).to.equal(sibling);
    });

    it('should return null when the previous sibling is a text node', function() {
      const div = document.createElement('div');
      const child = document.createElement('div');
      div.appendChild(document.createTextNode('some text'));
      div.appendChild(child);
      expect(autotrack._previousElementSibling(child)).to.equal(null);
    });
  });

  describe('_loadScript', function() {
    it('should insert the given script before the one already on the page', function() {
      document.body.appendChild(document.createElement('script'));
      const callback = _ => _;
      autotrack._loadScript('https://fake_url', callback);
      const scripts = document.getElementsByTagName('script');
      const new_script = scripts[0];

      expect(scripts.length).to.equal(2);
      expect(new_script.type).to.equal('text/javascript');
      expect(new_script.src).to.equal('https://fake_url/');
      expect(new_script.onload).to.equal(callback);
    });

    it('should add the script to the page when there aren\'t any preexisting scripts on the page', function() {
      const callback = _ => _;
      autotrack._loadScript('https://fake_url', callback);
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
      expect(autotrack._getDefaultProperties('test')).to.deep.equal({
        '$event_type': 'test',
        '$ce_version': 1,
        '$host': 'example.com',
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
    let sensitiveInput;
    let sensitiveDiv;
    let prop1;
    let prop2;
    let prop3;

    beforeEach(function() {
      trackedElem = document.createElement('div');
      trackedElem.className = 'ce_event';

      trackedElemChild = document.createElement('span');
      trackedElem.appendChild(trackedElemChild);

      untrackedElem = document.createElement('div');
      untrackedElem.className = 'untracked_event';

      sensitiveInput = document.createElement('input');
      sensitiveInput.className = 'sensitive_event';

      sensitiveDiv = document.createElement('div');
      sensitiveDiv.className = 'sensitive_event';

      prop1 = document.createElement('div');
      prop1.className = '_mp_test_property_1';
      prop1.innerHTML = 'Test prop 1';

      prop2 = document.createElement('div');
      prop2.className = '_mp_test_property_2';
      prop2.innerHTML = 'Test prop 2';

      prop3 = document.createElement('div');
      prop3.className = '_mp_test_property_3';
      prop3.innerHTML = 'Test prop 3';

      document.body.appendChild(untrackedElem);
      document.body.appendChild(trackedElem);
      document.body.appendChild(sensitiveInput);
      document.body.appendChild(sensitiveDiv);
      document.body.appendChild(prop1);
      document.body.appendChild(prop2);
      document.body.appendChild(prop3);

      autotrack._customProperties = [
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
        {
          name: 'Custom Property 3',
          css_selector: 'div._mp_test_property_3',
          event_selectors: ['.sensitive_event'],
        },
      ];
    });

    it('should return custom properties for only matching element selectors', function() {
      customProps = autotrack._getCustomProperties([trackedElem]);
      expect(customProps).to.deep.equal({
        'Custom Property 1': 'Test prop 1'
      });
    });

    it('should return no custom properties for elements that do not match an event selector', function() {
      noCustomProps = autotrack._getCustomProperties([untrackedElem]);
      expect(noCustomProps).to.deep.equal({});
    });

    it('should return no custom properties for sensitive elements', function() {
      // test password field
      sensitiveInput.setAttribute('type', 'password');
      noCustomProps = autotrack._getCustomProperties([sensitiveInput]);
      expect(noCustomProps).to.deep.equal({});
      // verify that tracking the sensitive element along with another element only collects
      // the non-sensitive element's custom properties
      customProps = autotrack._getCustomProperties([trackedElem, sensitiveInput]);
      expect(customProps).to.deep.equal({'Custom Property 1': 'Test prop 1'});

      // test hidden field
      sensitiveInput.setAttribute('type', 'hidden');
      noCustomProps = autotrack._getCustomProperties([sensitiveInput]);
      expect(noCustomProps).to.deep.equal({});
      customProps = autotrack._getCustomProperties([trackedElem, sensitiveInput]);
      expect(customProps).to.deep.equal({'Custom Property 1': 'Test prop 1'});

      // test field with sensitive-looking name
      sensitiveInput.setAttribute('type', '');
      sensitiveInput.setAttribute('name', 'cc'); // cc assumed to indicate credit card field
      noCustomProps = autotrack._getCustomProperties([sensitiveInput]);
      expect(noCustomProps).to.deep.equal({});
      customProps = autotrack._getCustomProperties([trackedElem, sensitiveInput]);
      expect(customProps).to.deep.equal({'Custom Property 1': 'Test prop 1'});

      // test field with sensitive-looking id
      sensitiveInput.setAttribute('name', '');
      sensitiveInput.setAttribute('id', 'cc'); // cc assumed to indicate credit card field
      noCustomProps = autotrack._getCustomProperties([sensitiveInput]);
      expect(noCustomProps).to.deep.equal({});
      customProps = autotrack._getCustomProperties([trackedElem, sensitiveInput]);
      expect(customProps).to.deep.equal({'Custom Property 1': 'Test prop 1'});

      // clean up
      sensitiveInput.setAttribute('type', '');
      sensitiveInput.setAttribute('name', '');
      sensitiveInput.setAttribute('id', '');
    });

    it('should return no custom properties for element with sensitive values', function() {
      // verify the base case DOES track the custom property
      customProps = autotrack._getCustomProperties([sensitiveDiv]);
      expect(customProps).to.deep.equal({'Custom Property 3': 'Test prop 3'});
      customProps = autotrack._getCustomProperties([trackedElem, sensitiveDiv]);
      expect(customProps).to.deep.equal({
        'Custom Property 1': 'Test prop 1',
        'Custom Property 3': 'Test prop 3',
      });

      // test values that look like credit card numbers
      prop3.innerHTML = '4111111111111111'; // valid credit card number
      noCustomProps = autotrack._getCustomProperties([sensitiveDiv]);
      expect(noCustomProps).to.deep.equal({'Custom Property 3': ''});
      customProps = autotrack._getCustomProperties([trackedElem, sensitiveDiv]);
      expect(customProps).to.deep.equal({
        'Custom Property 1': 'Test prop 1',
        'Custom Property 3': '',
      });
      prop3.innerHTML = '5105-1051-0510-5100'; // valid credit card number
      noCustomProps = autotrack._getCustomProperties([sensitiveDiv]);
      expect(noCustomProps).to.deep.equal({'Custom Property 3': ''});
      customProps = autotrack._getCustomProperties([trackedElem, sensitiveDiv]);
      expect(customProps).to.deep.equal({
        'Custom Property 1': 'Test prop 1',
        'Custom Property 3': '',
      });
      prop3.innerHTML = '1235-8132-1345-5891'; // invalid credit card number
      noCustomProps = autotrack._getCustomProperties([sensitiveDiv]);
      expect(noCustomProps).to.deep.equal({'Custom Property 3': '1235-8132-1345-5891'});
      customProps = autotrack._getCustomProperties([trackedElem, sensitiveDiv]);
      expect(customProps).to.deep.equal({
        'Custom Property 1': 'Test prop 1',
        'Custom Property 3': '1235-8132-1345-5891',
      });

      // test values that look like social-security numbers
      prop3.innerHTML = '123-58-1321'; // valid SSN
      noCustomProps = autotrack._getCustomProperties([sensitiveDiv]);
      expect(noCustomProps).to.deep.equal({'Custom Property 3': ''});
      customProps = autotrack._getCustomProperties([trackedElem, sensitiveDiv]);
      expect(customProps).to.deep.equal({
        'Custom Property 1': 'Test prop 1',
        'Custom Property 3': '',
      });
      prop3.innerHTML = '1235-81-321'; // invalid SSN
      noCustomProps = autotrack._getCustomProperties([sensitiveDiv]);
      expect(noCustomProps).to.deep.equal({'Custom Property 3': '1235-81-321'});
      customProps = autotrack._getCustomProperties([trackedElem, sensitiveDiv]);
      expect(customProps).to.deep.equal({
        'Custom Property 1': 'Test prop 1',
        'Custom Property 3': '1235-81-321',
      });

      // clean up
      prop3.innerHTML = 'Test prop 3';
    });
  });

  describe('_trackEvent', function() {
    let lib, sandbox;

    const getTrackedProps = function(trackSpy) {
      const trackArgs = trackSpy.args[0];
      const event = trackArgs[0];
      const props = trackArgs[1];
      return props;
    };

    beforeEach(function() {
      sandbox = sinon.sandbox.create();
      lib = {
        _ceElementTextProperties: [],
        track: sandbox.spy(),
      };
    });

    afterEach(function() {
      sandbox.restore();
    });

    it('should add the custom property when an element matching any of the event selectors is clicked', function() {
      lib = {
        _send_request: sandbox.spy((url, params, callback) => callback({
          config: {
            enable_collect_everything: true
          },
          custom_properties: [{event_selectors: ['.event-element-1', '.event-element-2'], css_selector: '.property-element', name: 'my property name'}]
        })),
        _prepare_callback: sandbox.spy(callback => callback),
        get_config: sandbox.spy(function(key) {
          switch (key) {
            case 'api_host':
              return 'https://test.com';
            case 'token':
              return 'testtoken';
          }
        }),
        token: 'testtoken',
        track: sandbox.spy()
      };
      autotrack.init(lib);

      const eventElement1 = document.createElement('div');
      const eventElement2 = document.createElement('div');
      const propertyElement = document.createElement('div');
      eventElement1.className = 'event-element-1';
      eventElement2.className = 'event-element-2';
      propertyElement.className = 'property-element';
      propertyElement.textContent = 'my property value';
      document.body.appendChild(eventElement1);
      document.body.appendChild(eventElement2);
      document.body.appendChild(propertyElement);

      simulateClick(eventElement1);
      simulateClick(eventElement2);
      expect(lib.track.callCount).to.equal(3); // 2 + 1 for the pageview event
      const trackArgs1 = lib.track.args[1];
      const trackArgs2 = lib.track.args[2];
      const eventType1 = trackArgs1[1]['my property name'];
      const eventType2 = trackArgs2[1]['my property name'];
      expect(eventType1).to.equal('my property value');
      expect(eventType2).to.equal('my property value');
      lib.track.resetHistory();
    });

    it('includes necessary metadata as properties when tracking an event', function() {
      const elTarget = document.createElement('a');
      elTarget.setAttribute('href', 'http://test.com');
      const elParent = document.createElement('span');
      elParent.appendChild(elTarget);
      const elGrandparent = document.createElement('div');
      elGrandparent.appendChild(elParent);
      const elGreatGrandparent = document.createElement('table');
      elGreatGrandparent.appendChild(elGrandparent);
      document.body.appendChild(elGreatGrandparent);
      const e = {
        target: elTarget,
        type: 'click',
      }
      autotrack._trackEvent(e, lib);
      expect(lib.track.calledOnce).to.equal(true);
      const trackArgs = lib.track.args[0];
      const event = trackArgs[0];
      const props = trackArgs[1];
      expect(event).to.equal('$web_event');
      expect(props['$event_type']).to.equal('click');
      expect(props).to.have.property('$host', 'example.com');
      expect(props).to.have.property('$el_attr__href', 'http://test.com');
      expect(props['$elements'][1]).to.have.property('tag_name', 'span');
      expect(props['$elements'][2]).to.have.property('tag_name', 'div');
      expect(props['$elements'][props['$elements'].length - 1]).to.have.property('tag_name', 'body');
    });

    it('gets the href attribute from parent anchor tags', function() {
      const elTarget = document.createElement('span');
      const elParent = document.createElement('span');
      elParent.appendChild(elTarget);
      const elGrandparent = document.createElement('a');
      elGrandparent.setAttribute('href', 'http://test.com');
      elGrandparent.appendChild(elParent);
      autotrack._trackEvent({
        target: elTarget,
        type: 'click',
      }, lib);
      expect(getTrackedProps(lib.track)).to.have.property('$el_attr__href', 'http://test.com');
    });

    it('does not track href attribute values from password elements', function() {
      const elTarget = document.createElement('span');
      const elParent = document.createElement('span');
      elParent.appendChild(elTarget);
      const elGrandparent = document.createElement('a');
      elGrandparent.appendChild(elParent);
      elGrandparent.setAttribute('type', 'password');
      autotrack._trackEvent({
        target: elTarget,
        type: 'click',
      }, lib);
      expect(getTrackedProps(lib.track)).to.have.property('$el_attr__href', false);
    });

    it('does not track href attribute values from hidden elements', function() {
      const elTarget = document.createElement('span');
      const elParent = document.createElement('span');
      elParent.appendChild(elTarget);
      const elGrandparent = document.createElement('a');
      elGrandparent.appendChild(elParent);
      elGrandparent.setAttribute('type', 'hidden');
      autotrack._trackEvent({
        target: elTarget,
        type: 'click',
      }, lib);
      expect(getTrackedProps(lib.track)).to.have.property('$el_attr__href', false);
    });

    it('does not track href attribute values that look like credit card numbers', function() {
      const elTarget = document.createElement('span');
      const elParent = document.createElement('span');
      elParent.appendChild(elTarget);
      const elGrandparent = document.createElement('a');
      elGrandparent.appendChild(elParent);
      elGrandparent.setAttribute('href', '4111111111111111');
      autotrack._trackEvent({
        target: elTarget,
        type: 'click',
      }, lib);
      expect(getTrackedProps(lib.track)).to.have.property('$el_attr__href', false);
    });

    it('does not track href attribute values that look like social-security numbers', function() {
      const elTarget = document.createElement('span');
      const elParent = document.createElement('span');
      elParent.appendChild(elTarget);
      const elGrandparent = document.createElement('a');
      elGrandparent.appendChild(elParent);
      elGrandparent.setAttribute('href', '123-58-1321');
      autotrack._trackEvent({
        target: elTarget,
        type: 'click',
      }, lib);
      expect(getTrackedProps(lib.track)).to.have.property('$el_attr__href', false);
    });

    it('correctly identifies and formats text content', function() {
      const dom = `
      <div>
        <span id='span1'>Some text</span>
        <div>
          <div>
            <div>
              <img src='' id='img1'/>
              <div>
                <img src='' id='img2'/>
              </div>
            </div>
          </div>
        </div>
      </div>
      <span id='span2'>
        Some super duper really long
        Text with new lines that we'll strip out
        and also we will want to make this text
        shorter since it's not likely people really care
        about text content that's super long and it
        also takes up more space and bandwidth.
        Some super duper really long
        Text with new lines that we'll strip out
        and also we will want to make this text
        shorter since it's not likely people really care
        about text content that's super long and it
        also takes up more space and bandwidth.
      </span>

      `;
      document.body.innerHTML = dom;
      const span1 = document.getElementById('span1');
      const span2 = document.getElementById('span2');
      const img1 = document.getElementById('img1');
      const img2 = document.getElementById('img2');

      const e1 = {
        target: span2,
        type: 'click',
      }
      autotrack._trackEvent(e1, lib);
      const props1 = getTrackedProps(lib.track);
      expect(props1).to.have.property('$el_text', 'Some super duper really long Text with new lines that we\'ll strip out and also we will want to make this text shorter since it\'s not likely people really care about text content that\'s super long and it also takes up more space and bandwidth. Some super d');
      lib.track.resetHistory();

      const e2 = {
        target: span1,
        type: 'click',
      }
      autotrack._trackEvent(e2, lib);
      const props2 = getTrackedProps(lib.track);
      expect(props2).to.have.property('$el_text', 'Some text');
      lib.track.resetHistory();

      const e3 = {
        target: img2,
        type: 'click',
      }
      autotrack._trackEvent(e3, lib);
      const props3 = getTrackedProps(lib.track);
      expect(props3).to.not.have.property('$el_text');
    });

    it('does not track sensitive text content', function() {
      const dom = `
      <div>
        <span id='span1'> Why 123-58-1321 hello there</span>
      </div>
      <span id='span2'>
        4111111111111111
        Why hello there
      </span>
      <span id='span3'>
        Why hello there
        5105-1051-0510-5100
      </span>
      `; // ^ valid credit card and social security numbers

      document.body.innerHTML = dom;
      const span1 = document.getElementById('span1');
      const span2 = document.getElementById('span2');
      const span3 = document.getElementById('span3');

      const e1 = {
        target: span1,
        type: 'click',
      }
      autotrack._trackEvent(e1, lib);
      const props1 = getTrackedProps(lib.track);
      expect(props1).to.have.property('$el_text');
      expect(props1['$el_text']).to.match(/Why\s+hello\s+there/);
      lib.track.resetHistory();

      const e2 = {
        target: span2,
        type: 'click',
      }
      autotrack._trackEvent(e2, lib);
      const props2 = getTrackedProps(lib.track);
      expect(props2).to.have.property('$el_text');
      expect(props2['$el_text']).to.match(/Why\s+hello\s+there/);
      lib.track.resetHistory();

      const e3 = {
        target: span3,
        type: 'click',
      }
      autotrack._trackEvent(e3, lib);
      const props3 = getTrackedProps(lib.track);
      expect(props3).to.have.property('$el_text');
      expect(props3['$el_text']).to.match(/Why\s+hello\s+there/);
    });

    it('should track a submit event with form field props', function() {
      const e = {
        target: document.createElement('form'),
        type: 'submit',
      }
      autotrack._trackEvent(e, lib);
      expect(lib.track.calledOnce).to.equal(true);
      const props = getTrackedProps(lib.track);
      expect(props['$event_type']).to.equal('submit');
    });

    it('should track a click event inside a form with form field props', function() {
      var form = document.createElement('form');
      var link = document.createElement('a');
      var input = document.createElement('input');
      input.name = 'test input';
      input.value = 'test val';
      form.appendChild(link);
      form.appendChild(input);
      const e = {
        target: link,
        type: 'click',
      }
      autotrack._trackEvent(e, lib);
      expect(lib.track.calledOnce).to.equal(true);
      const props = getTrackedProps(lib.track);
      expect(props['$event_type']).to.equal('click');
    });

    it('should never track an element with `mp-no-track` class', function() {
      const a = document.createElement('a');
      const span = document.createElement('span');
      a.appendChild(span);
      autotrack._trackEvent({target: a, type: 'click'}, lib);
      expect(lib.track.calledOnce).to.equal(true);
      lib.track.resetHistory();

      autotrack._trackEvent({target: span, type: 'click'}, lib);
      expect(lib.track.calledOnce).to.equal(true);
      lib.track.resetHistory();

      a.className = 'test1 mp-no-track test2';
      autotrack._trackEvent({target: a, type: 'click'}, lib);
      expect(lib.track.callCount).to.equal(0);

      autotrack._trackEvent({target: span, type: 'click'}, lib);
      expect(lib.track.callCount).to.equal(0);
    });
  });

  describe('_addDomEventHandlers', function() {
    const lib = {
      track: sinon.spy()
    };

    let navigateSpy;

    beforeEach(function() {
      document.title = 'test page';
      autotrack._addDomEventHandlers(lib);
      navigateSpy = sinon.spy(autotrack, '_navigate');
      lib.track.resetHistory();
    });

    after(function() {
      navigateSpy.restore();
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
      lib.track.resetHistory();
    });

  });

  describe('init', function() {
    let lib, sandbox, _maybeLoadEditorStub;

    beforeEach(function() {
      document.title = 'test page';
      sandbox = sinon.sandbox.create();
      sandbox.spy(autotrack, '_addDomEventHandlers');
      autotrack._initializedTokens = [];
      _maybeLoadEditorStub = sandbox.stub(autotrack, '_maybeLoadEditor').returns(false);
      lib = {
        _prepare_callback: sandbox.spy(callback => callback),
        _send_request: sandbox.spy((url, params, callback) => callback({config: {enable_collect_everything: true}})),
        get_config: sandbox.spy(function(key) {
          switch (key) {
            case 'api_host':
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
      autotrack.init(lib);
      expect(autotrack._addDomEventHandlers.calledOnce).to.equal(true);
    });

    it('should NOT call _addDomEventHandlders if the decide request fails', function() {
      lib._send_request = sandbox.spy((url, params, callback) => callback({status: 0, error: "Bad HTTP status: 400 Bad Request"}));
      autotrack.init(lib);
      expect(autotrack._addDomEventHandlers.called).to.equal(false);
    });

    it('should NOT call _addDomEventHandlders when loading editor', function() {
      _maybeLoadEditorStub.returns(true);
      autotrack.init(lib);
      expect(autotrack._addDomEventHandlers.calledOnce).to.equal(false);
    });

    it('should NOT call _addDomEventHandlders when enable_collect_everything is "false"', function() {
      lib._send_request = sandbox.spy((url, params, callback) => callback({config: {enable_collect_everything: false}}));
      autotrack.init(lib);
      expect(autotrack._addDomEventHandlers.calledOnce).to.equal(false);
    });

    it('should NOT call _addDomEventHandlders when the token has already been initialized', function() {
      var lib2 = Object.assign({}, lib);
      var lib3 = Object.assign({token: 'anotherproject'}, lib);
      lib3.get_config = sandbox.spy(function(key) {
          switch (key) {
            case 'api_host':
              return 'https://test.com';
            case 'token':
              return 'anotherproject';
          }
        }),
      autotrack.init(lib);
      expect(autotrack._addDomEventHandlers.callCount).to.equal(1);
      autotrack.init(lib2);
      expect(autotrack._addDomEventHandlers.callCount).to.equal(1);
      autotrack.init(lib3);
      expect(autotrack._addDomEventHandlers.callCount).to.equal(2);
    });

    it('should call instance._send_request', function() {
      autotrack.init(lib);
      expect(lib._send_request.calledOnce).to.equal(true);
      expect(lib._send_request.calledWith('https://test.com/decide/', {
        'verbose': true,
        'version': '1',
        'lib': 'web',
        'token': 'testtoken',
      })).to.equal(true);
    });

    it('should track pageview event', function() {
      autotrack.init(lib);
      expect(lib.track.calledOnce).to.equal(true);
      const trackArgs = lib.track.args[0];
      const event = trackArgs[0];
      const props = trackArgs[1];
      expect(event).to.equal('$web_event');
      expect(props).to.deep.equal({
        '$event_type': 'pageview',
        '$ce_version': 1,
        '$title': 'test page',
        '$host': 'example.com',
        '$pathname': '/about/',
      });
    });

    it('should check whether to load the editor', function() {
      autotrack.init(lib);
      expect(autotrack._maybeLoadEditor.calledOnce).to.equal(true);
      expect(autotrack._maybeLoadEditor.calledWith(lib)).to.equal(true);
    });
  });

  describe('_maybeLoadEditor', function() {
    let hash, editorParams, sandbox, lib = {};

    beforeEach(function() {
      window.sessionStorage.clear();

      this.clock = sinon.useFakeTimers();

      sandbox = sinon.sandbox.create();
      sandbox.stub(autotrack, '_loadEditor');
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
        projectOwnerId: 722725,
        readOnly: false,
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
        bookmarkletMode: false,
        projectId: 3,
        projectOwnerId: 722725,
        projectToken: 'test_token',
        readOnly: false,
        userFlags,
        userId: 12345,
      };

      hash = Object.keys(hashParams).map(k => `${k}=${hashParams[k]}`).join('&');
    });

    afterEach(function() {
      sandbox.restore();
      this.clock.restore();
    });

    it('should initialize the visual editor when the hash state contains action "mpeditor"', function() {
      window.location.hash = `#${hash}`;
      autotrack._maybeLoadEditor(lib);
      expect(autotrack._loadEditor.calledOnce).to.equal(true);
      expect(autotrack._loadEditor.calledWith(lib, editorParams)).to.equal(true);
      expect(JSON.parse(window.sessionStorage.getItem('editorParams'))).to.deep.equal(editorParams);
    });

    it('should initialize the visual editor when the hash was parsed by the snippet', function() {
      window.sessionStorage.setItem('_mpcehash', `#${hash}`);
      autotrack._maybeLoadEditor(lib);
      expect(autotrack._loadEditor.calledOnce).to.equal(true);
      expect(autotrack._loadEditor.calledWith(lib, editorParams)).to.equal(true);
      expect(JSON.parse(window.sessionStorage.getItem('editorParams'))).to.deep.equal(editorParams);
    });

    it('should NOT initialize the visual editor when the activation query param does not exist', function() {
      autotrack._maybeLoadEditor(lib);
      expect(autotrack._loadEditor.calledOnce).to.equal(false);
    });

    it('should return false when parsing invalid JSON from fragment state', function() {
      const hashParams = {
        access_token: 'test_access_token',
        state: "literally",
        expires_in: 3600,
      };
      hash = Object.keys(hashParams).map(k => `${k}=${hashParams[k]}`).join('&');
      window.location.hash = `#${hash}`;
      var spy = sinon.spy(autotrack, "_maybeLoadEditor");
      spy(lib);
      expect(spy.returned(false)).to.equal(true);
    });
  });

  describe('load and close editor', function() {
    const lib = {};
    let sandbox;

    beforeEach(function() {
      autotrack._editorLoaded = false;
      sandbox = sinon.sandbox.create();
      sandbox.stub(autotrack, '_loadScript').callsFake((path, callback) => callback());
      lib.get_config = sandbox.stub();
      lib.get_config.withArgs('app_host').returns('example.com');
      lib.get_config.withArgs('token').returns('token');
      window.mp_load_editor = sandbox.spy();
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
      const loaded = autotrack._loadEditor(lib, editorParams);
      expect(window.mp_load_editor.calledOnce).to.equal(true);
      expect(window.mp_load_editor.calledWithExactly(editorParams)).to.equal(true);
      expect(loaded).to.equal(true);
    });

    it('should NOT load if previously loaded', function() {
      autotrack._loadEditor(lib, 'accessToken');
      const loaded = autotrack._loadEditor(lib, 'accessToken');
      expect(loaded).to.equal(false);
    });
  });
});
