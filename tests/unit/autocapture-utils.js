import { expect } from 'chai';
import sinon from 'sinon';

import { _ } from '../../src/utils';
import {
    getSafeText,
    shouldTrackDomEvent,
    shouldTrackElementDetails,
    shouldTrackValue,
} from '../../src/autocapture/utils';

import jsdomSetup from './jsdom-setup';

describe(`Autotrack utility functions`, function() {
  jsdomSetup();

  describe(`getSafeText`, function() {
    it(`should collect and normalize text from elements`, function() {
      const el = document.createElement(`div`);

      el.innerHTML = `  Why  hello  there  `;
      expect(getSafeText(el, null, null, [])).to.equal(`Why hello there`);

      el.innerHTML = `
          Why
          hello
          there
      `;
      expect(getSafeText(el, null, null, [])).to.equal(`Why hello there`);

      el.innerHTML = `
          Why
          <p>not</p>
          hello
          <p>not</p>
          there
      `;
      expect(getSafeText(el, null, null, [])).to.equal(`Whyhellothere`);
    });

    it(`shouldn't collect text from element children`, function() {
      const el = document.createElement(`div`);
      let safeText;

      el.innerHTML = `<div>sensitive</div>`;
      safeText = getSafeText(el, null, null, []);
      expect(safeText).to.not.contain(`sensitive`);
      expect(safeText).to.equal(``);

      el.innerHTML = `
          Why
          <p>sensitive</p>
          hello
          <p>sensitive</p>
          there
      `;
      safeText = getSafeText(el, null, null, []);
      expect(safeText).to.not.contain(`sensitive`);
      expect(safeText).to.equal(`Whyhellothere`);
    });

    it(`shouldn't collect text from potentially sensitive elements`, function() {
      let el;

      el = document.createElement(`input`);
      el.innerHTML = `Why hello there`;
      expect(getSafeText(el, null, null, [])).to.equal(``);

      el = document.createElement(`textarea`);
      el.innerHTML = `Why hello there`;
      expect(getSafeText(el, null, null, [])).to.equal(``);

      el = document.createElement(`select`);
      el.innerHTML = `Why hello there`;
      expect(getSafeText(el, null, null, [])).to.equal(``);

      el = document.createElement(`div`);
      el.setAttribute(`contenteditable`, `true`);
      el.innerHTML = `Why hello there`;
      expect(getSafeText(el, null, null, [])).to.equal(``);
    });

    it(`shouldn't collect sensitive values`, function() {
      const el = document.createElement(`div`);

      el.innerHTML = `Why 123-58-1321 hello there`;
      expect(getSafeText(el, null, null, [])).to.equal(`Why hello there`);

      el.innerHTML = `
        4111111111111111
        Why hello there
      `;
      expect(getSafeText(el, null, null, [])).to.equal(`Why hello there`);

      el.innerHTML = `
        Why hello there
        5105-1051-0510-5100
      `;
      expect(getSafeText(el, null, null, [])).to.equal(`Why hello there`);
    });

    it(`supports a selector allowlist`, function() {
      const el = document.createElement(`div`);
      el.innerHTML = `Benign text`;
      expect(getSafeText(el, null, null, [])).to.equal(`Benign text`);
      expect(getSafeText(el, null, null, [`.foobar`])).to.equal(``);

      el.className = `foobar`;
      expect(getSafeText(el, null, null, [])).to.equal(`Benign text`);
      expect(getSafeText(el, null, null, [`.foobar`])).to.equal(`Benign text`);
      expect(getSafeText(el, null, null, [`.baz`])).to.equal(``);
    });

    it(`supports an allow callback`, function() {
      const el = document.createElement(`div`);
      el.innerHTML = `Benign text`;
      expect(getSafeText(el, null, null, [])).to.equal(`Benign text`);
      expect(getSafeText(el, null, el => el.innerHTML.startsWith(`Benign`), [])).to.equal(`Benign text`);
      expect(getSafeText(el, null, el => el.innerHTML.startsWith(`foo`), [])).to.equal(``);
    });
  });

  describe(`shouldTrackDomEvent`, function() {
    it(`should track "submit" events on <form> elements`, function() {
      expect(shouldTrackDomEvent(document.createElement(`form`), {
        type: `submit`,
      })).to.equal(true);
    });

    [`input`, `SELECT`, `textarea`].forEach(tagName => {
      it(`should track "change" events on <` + tagName.toLowerCase() + `> elements`, function() {
        expect(shouldTrackDomEvent(document.createElement(tagName), {
          type: `change`,
        })).to.equal(true);
      });
    });

    [`div`, `sPan`, `A`, `strong`, `table`].forEach(tagName => {
      it(`should track "click" events on <` + tagName.toLowerCase() + `> elements`, function() {
        expect(shouldTrackDomEvent(document.createElement(tagName), {
          type: `click`,
        })).to.equal(true);
      });
    });

    it(`should track "click" events on <button> elements`, function() {
      const button1 = document.createElement(`button`);
      const button2 = document.createElement(`input`);
      button2.setAttribute(`type`, `button`);
      const button3 = document.createElement(`input`);
      button3.setAttribute(`type`, `submit`);
      [button1, button2, button3].forEach(button => {
        expect(shouldTrackDomEvent(button, {
          type: `click`,
        })).to.equal(true);
      });
    });

    it(`should protect against bad inputs`, function() {
      expect(shouldTrackDomEvent(null, {
        type: `click`,
      })).to.equal(false);
      expect(shouldTrackDomEvent(undefined, {
        type: `click`,
      })).to.equal(false);
      expect(shouldTrackDomEvent(`div`, {
        type: `click`,
      })).to.equal(false);
    });

    it(`should NOT track "click" events on <form> elements`, function() {
      expect(shouldTrackDomEvent(document.createElement(`form`), {
        type: `click`,
      })).to.equal(false);
    });

    [`html`, `Input`, `select`, `TEXTAREA`].forEach(tagName => {
      it(`should NOT track "click" events on <` + tagName.toLowerCase() + `> elements`, function() {
        expect(shouldTrackDomEvent(document.createElement(tagName), {
          type: `click`,
        })).to.equal(false);
      });
    });
  });

  describe(`shouldTrackElementDetails`, function() {
    let el, input, parent1, parent2;

    beforeEach(function() {
      el = document.createElement(`div`);
      input = document.createElement(`input`);
      parent1 = document.createElement(`div`);
      parent2 = document.createElement(`div`);
      parent1.appendChild(el);
      parent1.appendChild(input);
      parent2.appendChild(parent1);
      document.body.appendChild(parent2);
    });

    it(`should not include input elements`, function() {
      expect(shouldTrackElementDetails(document.createElement(`input`), null, null, [])).to.equal(false);
    });

    it(`should not include select elements`, function() {
      expect(shouldTrackElementDetails(document.createElement(`select`), null, null, [])).to.equal(false);
    });

    it(`should not include textarea elements`, function() {
      expect(shouldTrackElementDetails(document.createElement(`textarea`), null, null, [])).to.equal(false);
    });

    it(`should not include elements where contenteditable="true"`, function() {
      const editable = document.createElement(`div`);
      const noneditable = document.createElement(`div`);

      editable.setAttribute(`contenteditable`, `true`);
      noneditable.setAttribute(`contenteditable`, `false`);

      expect(shouldTrackElementDetails(editable, null, null, [])).to.equal(false);
      expect(shouldTrackElementDetails(noneditable, null, null, [])).to.equal(true);
    });

    it(`should include sensitive elements with class "mp-include"`, function() {
      el.className = `test1 mp-include test2`;
      expect(shouldTrackElementDetails(el, null, null, [])).to.equal(true);
    });

    it(`should never include inputs with class "mp-sensitive"`, function() {
      el.className = `test1 mp-include mp-sensitive test2`;
      expect(shouldTrackElementDetails(el, null, null, [])).to.equal(false);
    });

    it(`should not include elements with class "mp-no-track" as properties`, function() {
      el.className = `test1 mp-no-track test2`;
      expect(shouldTrackElementDetails(el, null, null, [])).to.equal(false);
    });

    it(`should not include elements with a parent that have class "mp-no-track" as properties`, function() {
      parent2.className = `mp-no-track`;
      el.type = `text`;
      expect(shouldTrackElementDetails(el, null, null, [])).to.equal(false);
    });

    it(`should not include hidden fields`, function() {
      input.type = `hidden`;
      expect(shouldTrackElementDetails(input, null, null, [])).to.equal(false);
    });

    it(`should not include password fields`, function() {
      input.type = `password`;
      expect(shouldTrackElementDetails(input, null, null, [])).to.equal(false);
    });

    it(`should not include fields with sensitive names`, function() {
      const sensitiveNames = [
        `cc_name`,
        `card-num`,
        `ccnum`,
        `credit-card_number`,
        `credit_card[number]`,
        `csc num`,
        `CVC`,
        `Expiration`,
        `password`,
        `pwd`,
        `routing`,
        `routing-number`,
        `security code`,
        `seccode`,
        `security number`,
        `social sec`,
        `SsN`,
      ];
      sensitiveNames.forEach(name => {
        el.name = name;
        expect(shouldTrackElementDetails(el, null, null, [])).to.equal(false);
      });
    });

    it(`supports a selector allowlist`, function() {
      expect(shouldTrackElementDetails(el, null, null, [])).to.equal(true);
      expect(shouldTrackElementDetails(el, null, null, [`.foobar`])).to.equal(false);

      el.className = `foobar`;
      expect(shouldTrackElementDetails(el, null, null, [])).to.equal(true);
      expect(shouldTrackElementDetails(el, null, null, [`.foobar`])).to.equal(true);
      expect(shouldTrackElementDetails(el, null, null, [`.baz`])).to.equal(false);
    });

    it(`supports an allow callback`, function() {
      const el = document.createElement(`div`);
      el.innerHTML = `Benign text`;
      expect(shouldTrackElementDetails(el, null, null, [])).to.equal(true);
      expect(shouldTrackElementDetails(el, null, el => el.innerHTML.startsWith(`Benign`), [])).to.equal(true);
      expect(shouldTrackElementDetails(el, null, el => el.innerHTML.startsWith(`foo`), [])).to.equal(false);
    });

    // See https://github.com/mixpanel/mixpanel-js/issues/165
    // Under specific circumstances a bug caused .replace to be called on a DOM element
    // instead of a string, removing the element from the page. Ensure this issue is mitigated.
    it(`shouldn't inadvertently replace DOM nodes`, function() {
      // setup
      el.replace = sinon.spy();

      // test
      parent1.name = el;
      shouldTrackElementDetails(parent1, null, null, []); // previously this would cause el.replace to be called
      expect(el.replace.called).to.equal(false);
      parent1.name = undefined;

      parent1.id = el;
      shouldTrackElementDetails(parent2, null, null, []); // previously this would cause el.replace to be called
      expect(el.replace.called).to.equal(false);
      parent1.id = undefined;

      parent1.type = el;
      shouldTrackElementDetails(parent2, null, null, []); // previously this would cause el.replace to be called
      expect(el.replace.called).to.equal(false);
      parent1.type = undefined;

      // cleanup
      el.replace = undefined;
    });
  });

  describe(`shouldTrackValue`, function() {
    it(`should return false when the value is null`, function() {
      expect(shouldTrackValue(null)).to.equal(false);
    });

    it(`should not include numbers that look like valid credit cards`, function() {
      // one for each type on http://www.getcreditcardnumbers.com/
      const validCCNumbers = [`3419-881002-84912`, `30148420855976`, `5183792099737678`, `6011-5100-8788-7057`, `180035601937848`, `180072512946394`, `4556617778508`];
      validCCNumbers.forEach(num => {
        expect(shouldTrackValue(num)).to.equal(false);
      });
    });

    it(`should not include values that look like social security numbers`, function() {
      expect(shouldTrackValue(`123-45-6789`)).to.equal(false);
    });
  });
});
