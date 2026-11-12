import { expect } from 'chai';

import jsdomSetup from './jsdom-setup';

let VisualChangeEngine;
let engine;

const tick = () => new Promise(resolve => setTimeout(resolve, 20));

describe(`visual-experiments engine`, function() {
  jsdomSetup({
    // requestAnimationFrame is only present in jsdom under pretendToBeVisual, and
    // the engine now requires it (see VisualChangeEngine supported()).
    pretendToBeVisual: true,
    reImportModules: [`../../src/window`, `../../src/visual-experiments/engine`],
    beforeCallback: modules => {
      VisualChangeEngine = modules[1].VisualChangeEngine;
      engine = new VisualChangeEngine();
      document.body.innerHTML = ``;
    },
    afterCallback: () => {
      // Disconnect any observer attached to the now-torn-down jsdom before the
      // next test replaces the window/document.
      if (engine && engine.revertVisualChanges) {
        engine.revertVisualChanges();
      }
    },
  });

  describe(`mutation types`, function() {
    it(`setAttribute writes the attribute on every matching element`, function() {
      document.body.innerHTML = `<button class="cta">a</button><button class="cta">b</button>`;
      engine.applyVisualChanges([
        { type: `setAttribute`, selector: `.cta`, attribute: `data-variant`, value: `B` },
      ]);
      const btns = document.querySelectorAll(`.cta`);
      expect(btns[0].getAttribute(`data-variant`)).to.equal(`B`);
      expect(btns[1].getAttribute(`data-variant`)).to.equal(`B`);
    });

    it(`setAttributes writes every key in the attributes map`, function() {
      document.body.innerHTML = `<a id="link">x</a>`;
      engine.applyVisualChanges([
        { type: `setAttributes`, selector: `#link`, attributes: { href: `https://x.test`, rel: `nofollow` } },
      ]);
      const a = document.getElementById(`link`);
      expect(a.getAttribute(`href`)).to.equal(`https://x.test`);
      expect(a.getAttribute(`rel`)).to.equal(`nofollow`);
    });

    it(`setStyle applies an inline style property`, function() {
      document.body.innerHTML = `<div id="box">x</div>`;
      engine.applyVisualChanges([
        { type: `setStyle`, selector: `#box`, property: `color`, value: `red` },
      ]);
      expect(document.getElementById(`box`).style.color).to.equal(`red`);
    });

    it(`setClasses adds and removes classes`, function() {
      document.body.innerHTML = `<div id="box" class="old"></div>`;
      engine.applyVisualChanges([
        { type: `setClasses`, selector: `#box`, add: [`new`], remove: [`old`] },
      ]);
      const el = document.getElementById(`box`);
      expect(el.classList.contains(`new`)).to.be.true;
      expect(el.classList.contains(`old`)).to.be.false;
    });

    it(`setText replaces the element's text via textContent`, function() {
      document.body.innerHTML = `<button data-testid="checkout">Checkout</button>`;
      engine.applyVisualChanges([
        { type: `setText`, selector: `[data-testid="checkout"]`, value: `Checkout · $34.94 (Sale 2!)` },
      ]);
      const btn = document.querySelector(`[data-testid="checkout"]`);
      expect(btn.textContent).to.equal(`Checkout · $34.94 (Sale 2!)`);
    });

    it(`setText treats its value as plain text, not markup (no HTML parsing)`, function() {
      document.body.innerHTML = `<button data-testid="checkout">Checkout</button>`;
      engine.applyVisualChanges([
        { type: `setText`, selector: `[data-testid="checkout"]`, value: `<img src=x onerror="1">` },
      ]);
      const btn = document.querySelector(`[data-testid="checkout"]`);
      // The value is rendered literally; no <img> element is created.
      expect(btn.textContent).to.equal(`<img src=x onerror="1">`);
      expect(btn.querySelector(`img`)).to.equal(null);
      expect(btn.children.length).to.equal(0);
    });

    it(`reverting a setText restores the original text`, function() {
      document.body.innerHTML = `<button data-testid="checkout">Checkout</button>`;
      engine.applyVisualChanges([
        { type: `setText`, selector: `[data-testid="checkout"]`, value: `Changed` },
      ]);
      engine.revertVisualChanges();
      expect(document.querySelector(`[data-testid="checkout"]`).textContent).to.equal(`Checkout`);
    });

    it(`restores the original child nodes, their state, and event listeners after text edits`, function() {
      document.body.innerHTML = `<div id="target">Before <button><span>Icon</span> Buy</button><input value="initial"></div>`;
      const target = document.getElementById(`target`);
      const children = Array.from(target.childNodes);
      const button = target.querySelector(`button`);
      const icon = button.firstChild;
      const input = target.querySelector(`input`);
      input.value = `User input`;
      let clicks = 0;
      button.addEventListener(`click`, () => clicks++);

      engine.applyVisualChanges([{ type: `setText`, selector: `#target`, value: `First preview` }]);
      expect(target.children.length).to.equal(0);
      engine.applyVisualChanges([{ type: `setText`, selector: `#target`, value: `Second preview` }]);
      engine.revertVisualChanges();

      expect(Array.from(target.childNodes)).to.deep.equal(children);
      expect(target.querySelector(`button`)).to.equal(button);
      expect(button.firstChild).to.equal(icon);
      expect(target.querySelector(`input`)).to.equal(input);
      expect(input.value).to.equal(`User input`);
      button.click();
      expect(clicks).to.equal(1);
    });

    it(`restores nested content after the page overwrites an active text edit`, async function() {
      document.body.innerHTML = `<div id="target"><a href="/original">Original link</a></div>`;
      const target = document.getElementById(`target`);
      const link = target.firstChild;
      engine.applyVisualChanges([{ type: `setText`, selector: `#target`, value: `Preview` }]);
      target.textContent = `Page rerender`;

      await tick();

      expect(target.textContent).to.equal(`Preview`);
      engine.revertVisualChanges();
      expect(target.firstChild).to.equal(link);
      expect(link.getAttribute(`href`)).to.equal(`/original`);
    });

    it(`hide sets display:none`, function() {
      document.body.innerHTML = `<div id="box">x</div>`;
      engine.applyVisualChanges([
        { type: `hide`, selector: `#box` },
      ]);
      expect(document.getElementById(`box`).style.display).to.equal(`none`);
    });

    it(`ignores an unsupported mutation type but still applies the supported ones`, function() {
      document.body.innerHTML = `<div id="box">x</div>`;
      expect(() => {
        engine.applyVisualChanges([
          { type: `insertHTML`, selector: `#box`, value: `<span>injected</span>` },
          { type: `moveElement`, selector: `#box`, target: `body` },
          { type: `setAttribute`, selector: `#box`, attribute: `data-ok`, value: `1` },
        ]);
      }).to.not.throw();
      const el = document.getElementById(`box`);
      // Unsupported types are no-ops; the supported one still applied.
      expect(el.getAttribute(`data-ok`)).to.equal(`1`);
      expect(el.querySelector(`span`)).to.equal(null);
    });
  });

  describe(`attribute safety guard`, function() {
    it(`refuses inline event-handler attributes (onclick)`, function() {
      document.body.innerHTML = `<button id="b">x</button>`;
      engine.applyVisualChanges([
        { type: `setAttribute`, selector: `#b`, attribute: `onclick`, value: `alert(1)` },
      ]);
      expect(document.getElementById(`b`).hasAttribute(`onclick`)).to.be.false;
    });

    it(`is case-insensitive for event handlers (OnError)`, function() {
      document.body.innerHTML = `<img id="i">`;
      engine.applyVisualChanges([
        { type: `setAttribute`, selector: `#i`, attribute: `OnError`, value: `alert(1)` },
      ]);
      expect(document.getElementById(`i`).hasAttribute(`OnError`)).to.be.false;
    });

    it(`refuses a javascript: URL value (href)`, function() {
      document.body.innerHTML = `<a id="a" href="/original">x</a>`;
      engine.applyVisualChanges([
        { type: `setAttribute`, selector: `#a`, attribute: `href`, value: `javascript:alert(1)` },
      ]);
      expect(document.getElementById(`a`).getAttribute(`href`)).to.equal(`/original`);
    });

    it(`refuses a javascript: value obfuscated with whitespace/control chars`, function() {
      document.body.innerHTML = `<a id="a" href="/original">x</a>`;
      engine.applyVisualChanges([
        { type: `setAttribute`, selector: `#a`, attribute: `href`, value: `  java\tscript:alert(1)` },
      ]);
      expect(document.getElementById(`a`).getAttribute(`href`)).to.equal(`/original`);
    });

    it(`refuses srcdoc and data:text/html`, function() {
      document.body.innerHTML = `<iframe id="f"></iframe>`;
      engine.applyVisualChanges([
        { type: `setAttribute`, selector: `#f`, attribute: `srcdoc`, value: `<script>1</script>` },
        { type: `setAttribute`, selector: `#f`, attribute: `src`, value: `data:text/html,<script>1</script>` },
      ]);
      const f = document.getElementById(`f`);
      expect(f.hasAttribute(`srcdoc`)).to.be.false;
      expect(f.hasAttribute(`src`)).to.be.false;
    });

    it(`still allows safe attributes and URLs`, function() {
      document.body.innerHTML = `<a id="a"><img id="i"></a>`;
      engine.applyVisualChanges([
        { type: `setAttribute`, selector: `#a`, attribute: `href`, value: `/safe/path` },
        { type: `setAttribute`, selector: `#a`, attribute: `data-x`, value: `1` },
        { type: `setAttribute`, selector: `#i`, attribute: `src`, value: `data:image/png;base64,AAAA` },
      ]);
      expect(document.getElementById(`a`).getAttribute(`href`)).to.equal(`/safe/path`);
      expect(document.getElementById(`a`).getAttribute(`data-x`)).to.equal(`1`);
      expect(document.getElementById(`i`).getAttribute(`src`)).to.equal(`data:image/png;base64,AAAA`);
    });

    it(`setAttributes skips a dangerous key but applies the safe ones`, function() {
      document.body.innerHTML = `<a id="a">x</a>`;
      engine.applyVisualChanges([
        { type: `setAttributes`, selector: `#a`, attributes: { href: `/safe`, onclick: `evil()`, rel: `nofollow` } },
      ]);
      const a = document.getElementById(`a`);
      expect(a.getAttribute(`href`)).to.equal(`/safe`);
      expect(a.getAttribute(`rel`)).to.equal(`nofollow`);
      expect(a.hasAttribute(`onclick`)).to.be.false;
    });
  });

  describe(`error handling`, function() {
    it(`logs and skips a malformed selector without throwing`, function() {
      document.body.innerHTML = `<div id="box">x</div>`;
      expect(() => {
        engine.applyVisualChanges([
          { type: `setAttribute`, selector: `>>invalid<<`, attribute: `data-x`, value: `1` },
          { type: `setAttribute`, selector: `#box`, attribute: `data-x`, value: `1` },
        ]);
      }).to.not.throw();
      expect(document.getElementById(`box`).getAttribute(`data-x`)).to.equal(`1`);
    });

    it(`skips a missing selector silently`, function() {
      document.body.innerHTML = `<div id="present"></div>`;
      expect(() => {
        engine.applyVisualChanges([
          { type: `setAttribute`, selector: `#not-here`, attribute: `data-x`, value: `1` },
        ]);
      }).to.not.throw();
    });

    it(`skips a malformed mutation entry without throwing`, function() {
      expect(() => {
        engine.applyVisualChanges([
          null,
          { selector: `#x` },
          { type: `setAttribute` },
        ]);
      }).to.not.throw();
    });
  });

  describe(`selectors that depend on an earlier mutation`, function() {
    // The style targets a class that a later mutation in the same set adds.
    const dependent = [
      { type: `setStyle`, selector: `.new`, property: `color`, value: `red` },
      { type: `setClasses`, selector: `#box`, add: [`new`] },
    ];

    it(`applies a mutation whose target only matches after a later mutation`, function() {
      document.body.innerHTML = `<div id="box">x</div>`;
      const reported = [];
      engine.applyVisualChanges(dependent, index => reported.push(index));
      expect(document.getElementById(`box`).style.color).to.equal(`red`);
      expect(reported).to.deep.equal([1, 0]);
    });

    it(`restores both after a page update removes the class and the style`, async function() {
      const frames = [];
      global.window.requestAnimationFrame = callback => frames.push(callback);
      document.body.innerHTML = `<div id="box">x</div>`;
      engine.applyVisualChanges(dependent);
      await Promise.resolve();
      expect(frames).to.have.length(0);

      const box = document.getElementById(`box`);
      box.className = ``;
      box.style.color = `green`;
      await Promise.resolve();
      expect(frames).to.have.length(1);
      frames.shift()();
      await Promise.resolve();
      expect(box.classList.contains(`new`)).to.be.true;
      expect(box.style.color).to.equal(`red`);
      expect(frames).to.have.length(0);
    });

    it(`reverts the dependent mutation too`, function() {
      document.body.innerHTML = `<div id="box">x</div>`;
      engine.applyVisualChanges(dependent);
      engine.revertVisualChanges();
      const box = document.getElementById(`box`);
      expect(box.classList.contains(`new`)).to.be.false;
      expect(box.style.color).to.equal(``);
    });

    it(`stops after the pass cap even when every pass reaches a new element`, function() {
      document.body.innerHTML = `<div id="box">x</div>`;
      const applyOne = engine._applyOne;
      let calls = 0;
      engine._applyOne = function() { calls++; return true; };
      engine.applyVisualChanges([{ type: `setAttribute`, selector: `#box`, attribute: `data-x`, value: `1` }]);
      engine._applyOne = applyOne;
      expect(calls).to.equal(3);
    });
  });

  describe(`revertVisualChanges`, function() {
    it(`restores a prior attribute value when one existed`, function() {
      document.body.innerHTML = `<a id="link" href="/original">x</a>`;
      engine.applyVisualChanges([
        { type: `setAttribute`, selector: `#link`, attribute: `href`, value: `/changed` },
      ]);
      expect(document.getElementById(`link`).getAttribute(`href`)).to.equal(`/changed`);
      engine.revertVisualChanges();
      expect(document.getElementById(`link`).getAttribute(`href`)).to.equal(`/original`);
    });

    it(`removes the attribute when none existed before`, function() {
      document.body.innerHTML = `<div id="box"></div>`;
      engine.applyVisualChanges([
        { type: `setAttribute`, selector: `#box`, attribute: `data-x`, value: `1` },
      ]);
      engine.revertVisualChanges();
      expect(document.getElementById(`box`).hasAttribute(`data-x`)).to.be.false;
    });

    it(`restores prior inline style`, function() {
      document.body.innerHTML = `<div id="box" style="color: blue"></div>`;
      engine.applyVisualChanges([
        { type: `setStyle`, selector: `#box`, property: `color`, value: `red` },
      ]);
      engine.revertVisualChanges();
      expect(document.getElementById(`box`).style.color).to.equal(`blue`);
    });

    it(`removes style property when none was set before`, function() {
      document.body.innerHTML = `<div id="box"></div>`;
      engine.applyVisualChanges([
        { type: `setStyle`, selector: `#box`, property: `color`, value: `red` },
      ]);
      engine.revertVisualChanges();
      expect(document.getElementById(`box`).style.color).to.equal(``);
    });

    it(`undoes class add/remove`, function() {
      document.body.innerHTML = `<div id="box" class="a"></div>`;
      engine.applyVisualChanges([
        { type: `setClasses`, selector: `#box`, add: [`b`], remove: [`a`] },
      ]);
      engine.revertVisualChanges();
      const cls = document.getElementById(`box`).classList;
      expect(cls.contains(`a`)).to.be.true;
      expect(cls.contains(`b`)).to.be.false;
    });

    it(`unhides an element`, function() {
      document.body.innerHTML = `<div id="box">x</div>`;
      engine.applyVisualChanges([{ type: `hide`, selector: `#box` }]);
      engine.revertVisualChanges();
      expect(document.getElementById(`box`).style.display).to.equal(``);
    });

    it(`apply-then-apply leaves the DOM matching the second set only`, function() {
      document.body.innerHTML = `<div id="box" class="old">x</div>`;
      engine.applyVisualChanges([
        { type: `setAttribute`, selector: `#box`, attribute: `data-a`, value: `1` },
        { type: `setClasses`, selector: `#box`, add: [`from-a`], remove: [`old`] },
      ]);
      engine.applyVisualChanges([
        { type: `setAttribute`, selector: `#box`, attribute: `data-b`, value: `2` },
      ]);
      const el = document.getElementById(`box`);
      // First set fully reverted: data-a gone, original class restored.
      expect(el.hasAttribute(`data-a`)).to.be.false;
      expect(el.classList.contains(`old`)).to.be.true;
      expect(el.classList.contains(`from-a`)).to.be.false;
      // Second set applied.
      expect(el.getAttribute(`data-b`)).to.equal(`2`);
    });
  });

  describe(`MutationObserver re-application (dirty tracking)`, function() {
    [
      {
        name: `styles`,
        mutations: [
          { type: `setStyle`, selector: `#box`, property: `color`, value: `red` },
          { type: `setStyle`, selector: `#box`, property: `color`, value: `blue` },
        ],
        overwrite: el => { el.style.color = `green`; },
        read: el => el.style.color,
        expected: `blue`,
      },
      {
        name: `text`,
        mutations: [
          { type: `setText`, selector: `#box`, value: `First` },
          { type: `setText`, selector: `#box`, value: `Last` },
        ],
        overwrite: el => { el.textContent = `Page update`; },
        read: el => el.textContent,
        expected: `Last`,
      },
    ].forEach(({ name, mutations, overwrite, read, expected }) => {
      it(`settles competing ${name} changes while still observing later page updates`, async function() {
        const frames = [];
        global.window.requestAnimationFrame = callback => frames.push(callback);
        document.body.innerHTML = `<div id="box">Original</div>`;
        const box = document.getElementById(`box`);
        engine.applyVisualChanges(mutations);
        await Promise.resolve();
        expect(read(box)).to.equal(expected);
        expect(frames).to.have.length(0);

        // Each real page update needs one pass, with no self-scheduled follow-up.
        for (let i = 0; i < 2; i++) {
          overwrite(box);
          await Promise.resolve();
          expect(frames).to.have.length(1);
          frames.shift()();
          await Promise.resolve();
          expect(read(box)).to.equal(expected);
          expect(frames).to.have.length(0);
        }

        // Replacing the set also undoes and writes DOM while observation is paused.
        engine.applyVisualChanges(mutations);
        await Promise.resolve();
        expect(read(box)).to.equal(expected);
        expect(frames).to.have.length(0);
        engine.revertVisualChanges();
        await Promise.resolve();
        expect(box.textContent).to.equal(`Original`);
        expect(box.style.color).to.equal(``);
        expect(frames).to.have.length(0);
      });
    });

    it(`resumes observation if an apply pass throws`, async function() {
      const frames = [];
      global.window.requestAnimationFrame = callback => frames.push(callback);
      document.body.innerHTML = `<div id="box"></div>`;
      const applyOne = engine._applyOne;
      engine._applyOne = () => { throw new Error(`Unexpected apply error`); };
      engine.applyVisualChanges([
        { type: `setAttribute`, selector: `#box`, attribute: `data-variant`, value: `B` },
      ]);
      engine._applyOne = applyOne;

      document.getElementById(`box`).textContent = `Page update`;
      await Promise.resolve();
      expect(frames).to.have.length(1);
      frames.shift()();
      await Promise.resolve();
      expect(document.getElementById(`box`).getAttribute(`data-variant`)).to.equal(`B`);
      expect(frames).to.have.length(0);
    });

    it(`observes page changes made by first-apply callbacks after observation resumes`, async function() {
      const frames = [];
      global.window.requestAnimationFrame = callback => frames.push(callback);
      document.body.innerHTML = `<div class="target"></div>`;
      engine.applyVisualChanges([
        { type: `setAttribute`, selector: `.target`, attribute: `data-variant`, value: `B` },
      ], () => {
        const late = document.createElement(`div`);
        late.className = `target`;
        document.body.appendChild(late);
      });

      await Promise.resolve();
      expect(frames).to.have.length(1);
      frames.shift()();
      await Promise.resolve();
      expect(document.querySelectorAll(`.target[data-variant="B"]`)).to.have.length(2);
      expect(frames).to.have.length(0);
    });

    it(`re-applies mutations after the targeted element is replaced`, async function() {
      document.body.innerHTML = `<div id="box">v1</div>`;
      engine.applyVisualChanges([
        { type: `setAttribute`, selector: `#box`, attribute: `data-variant`, value: `B` },
      ]);
      expect(document.getElementById(`box`).getAttribute(`data-variant`)).to.equal(`B`);

      // Simulate a framework re-render that replaces the element.
      document.body.innerHTML = `<div id="box">v2</div>`;
      expect(document.getElementById(`box`).hasAttribute(`data-variant`)).to.be.false;

      await tick();

      expect(document.getElementById(`box`).getAttribute(`data-variant`)).to.equal(`B`);
    });

    it(`re-applies setText after the SAME node's text is overwritten in place`, async function() {
      document.body.innerHTML = `<button data-testid="cta">Buy</button>`;
      engine.applyVisualChanges([
        { type: `setText`, selector: `[data-testid="cta"]`, value: `Buy now` },
      ]);
      const btn = document.querySelector(`[data-testid="cta"]`);
      expect(btn.textContent).to.equal(`Buy now`);
      const undoLenAfterApply = engine._undoStack.length;

      // Same node re-rendered in place (identity preserved), clobbering our text.
      btn.textContent = `Buy`;
      expect(document.querySelector(`[data-testid="cta"]`)).to.equal(btn);

      await tick();

      expect(btn.textContent).to.equal(`Buy now`);
      // No duplicate undo entry: baseline is still the original.
      expect(engine._undoStack.length).to.equal(undoLenAfterApply);
      engine.revertVisualChanges();
      expect(btn.textContent).to.equal(`Buy`);
    });

    it(`re-applies setAttribute after the SAME node's attribute is overwritten in place`, async function() {
      document.body.innerHTML = `<a id="link" href="/orig">x</a>`;
      engine.applyVisualChanges([
        { type: `setAttribute`, selector: `#link`, attribute: `href`, value: `/variant` },
      ]);
      const a = document.getElementById(`link`);
      expect(a.getAttribute(`href`)).to.equal(`/variant`);

      a.setAttribute(`href`, `/orig`); // app overwrites, same node


      await tick();

      expect(document.getElementById(`link`)).to.equal(a);
      expect(a.getAttribute(`href`)).to.equal(`/variant`);
    });

    it(`applies to a newly added matching element without disturbing existing ones`, async function() {
      document.body.innerHTML = `<ul id="list"><li class="item">a</li></ul>`;
      engine.applyVisualChanges([
        { type: `setAttribute`, selector: `.item`, attribute: `data-variant`, value: `B` },
      ]);
      expect(document.querySelectorAll(`.item`)[0].getAttribute(`data-variant`)).to.equal(`B`);

      // A new matching node is inserted after initial apply.
      const li = document.createElement(`li`);
      li.className = `item`;
      li.textContent = `b`;
      document.getElementById(`list`).appendChild(li);

      await tick();

      const items = document.querySelectorAll(`.item`);
      expect(items[0].getAttribute(`data-variant`)).to.equal(`B`);
      expect(items[1].getAttribute(`data-variant`)).to.equal(`B`);
    });
  });

  describe(`pre-body initialization`, function() {
    it(`applies to elements parsed after flags settle when body did not yet exist`, async function() {
      // Flags settle before <body> is parsed: document.body is null.
      document.documentElement.removeChild(document.body);
      expect(document.body).to.equal(null);

      engine.applyVisualChanges([
        { type: `setAttribute`, selector: `#late`, attribute: `data-variant`, value: `B` },
      ]);
      expect(engine._observer).to.equal(null);

      // Body parsed later, carrying a matching element.
      const newBody = document.createElement(`body`);
      newBody.innerHTML = `<div id="late">x</div>`;
      document.documentElement.appendChild(newBody);

      await tick();

      expect(engine._observer).to.not.equal(null);
      expect(document.getElementById(`late`).getAttribute(`data-variant`)).to.equal(`B`);
    });
  });

  describe(`onFirstApply callback`, function() {
    it(`reports each mutation index once when it changes an element`, function() {
      document.body.innerHTML = `<div id="a"></div><div id="b"></div><div id="c"></div>`;
      const reported = [];
      engine.applyVisualChanges([
        { type: `setAttribute`, selector: `#a`, attribute: `data-x`, value: `1` },
        { type: `setAttribute`, selector: `#missing`, attribute: `data-x`, value: `1` },
        { type: `hide`, selector: `#b, #c` },
      ], index => reported.push(index));
      // Index 1 matched nothing; index 2 matched two elements but reports once.
      expect(reported).to.deep.equal([0, 2]);
    });

    it(`reports later, once the target element renders`, async function() {
      const reported = [];
      engine.applyVisualChanges([
        { type: `setAttribute`, selector: `#late`, attribute: `data-variant`, value: `B` },
      ], index => reported.push(index));
      expect(reported).to.deep.equal([]);

      const late = document.createElement(`div`);
      late.id = `late`;
      document.body.appendChild(late);
      await tick();

      expect(reported).to.deep.equal([0]);
    });

    it(`does not re-report when a re-render forces a re-apply`, async function() {
      document.body.innerHTML = `<div id="box">v1</div>`;
      const reported = [];
      engine.applyVisualChanges([
        { type: `setAttribute`, selector: `#box`, attribute: `data-variant`, value: `B` },
      ], index => reported.push(index));

      document.body.innerHTML = `<div id="box">v2</div>`;
      await tick();

      expect(document.getElementById(`box`).getAttribute(`data-variant`)).to.equal(`B`);
      expect(reported).to.deep.equal([0]);
    });

    it(`does not report a mutation the safety guard skips`, function() {
      document.body.innerHTML = `<a id="link"></a>`;
      const reported = [];
      engine.applyVisualChanges([
        { type: `setAttribute`, selector: `#link`, attribute: `onclick`, value: `alert(1)` },
      ], index => reported.push(index));
      expect(reported).to.deep.equal([]);
    });

    it(`keeps applying when the callback throws`, function() {
      document.body.innerHTML = `<div id="a"></div><div id="b"></div>`;
      engine.applyVisualChanges([
        { type: `setAttribute`, selector: `#a`, attribute: `data-x`, value: `1` },
        { type: `setAttribute`, selector: `#b`, attribute: `data-x`, value: `2` },
      ], () => { throw new Error(`boom`); });
      expect(document.getElementById(`a`).getAttribute(`data-x`)).to.equal(`1`);
      expect(document.getElementById(`b`).getAttribute(`data-x`)).to.equal(`2`);
    });

    it(`reports only after the apply pass has finished mutating`, function() {
      document.body.innerHTML = `<div class="x"></div><div class="x"></div><div id="y"></div>`;
      const seenAtReport = [];
      engine.applyVisualChanges([
        { type: `setAttribute`, selector: `.x`, attribute: `data-x`, value: `1` },
        { type: `setAttribute`, selector: `#y`, attribute: `data-y`, value: `1` },
      ], () => {
        seenAtReport.push(document.querySelectorAll(`[data-x], [data-y]`).length);
      });
      // Every element was already mutated by the time the first report ran.
      expect(seenAtReport).to.deep.equal([3, 3]);
    });

    it(`leaves nothing applied when the callback reverts the set`, function() {
      document.body.innerHTML = `<div class="x"></div><div class="x"></div><div id="y"></div>`;
      const reported = [];
      engine.applyVisualChanges([
        { type: `setAttribute`, selector: `.x`, attribute: `data-x`, value: `1` },
        { type: `setAttribute`, selector: `#y`, attribute: `data-y`, value: `1` },
      ], index => {
        reported.push(index);
        // e.g. a before_track hook that suppresses the experiment.
        engine.revertVisualChanges();
      });
      expect(reported).to.deep.equal([0]);
      expect(document.querySelectorAll(`[data-x], [data-y]`)).to.have.length(0);
    });

    it(`drops stale reports when the callback replaces the set`, function() {
      document.body.innerHTML = `<div id="a"></div><div id="b"></div>`;
      const stale = [];
      const fresh = [];
      engine.applyVisualChanges([
        { type: `setAttribute`, selector: `#a`, attribute: `data-x`, value: `1` },
        { type: `setAttribute`, selector: `#b`, attribute: `data-x`, value: `1` },
      ], index => {
        stale.push(index);
        engine.applyVisualChanges([
          { type: `setAttribute`, selector: `#b`, attribute: `data-y`, value: `2` },
        ], i => fresh.push(i));
      });
      expect(stale).to.deep.equal([0]);
      expect(fresh).to.deep.equal([0]);
      expect(document.getElementById(`a`).hasAttribute(`data-x`)).to.be.false;
      expect(document.getElementById(`b`).getAttribute(`data-y`)).to.equal(`2`);
    });

    it(`stops reporting after revert`, async function() {
      const reported = [];
      engine.applyVisualChanges([
        { type: `setAttribute`, selector: `#late`, attribute: `data-x`, value: `1` },
      ], index => reported.push(index));
      engine.revertVisualChanges();

      const late = document.createElement(`div`);
      late.id = `late`;
      document.body.appendChild(late);
      await tick();

      expect(reported).to.deep.equal([]);
    });
  });

  describe(`per-instance state`, function() {
    it(`two engines maintain independent undo stacks`, function() {
      document.body.innerHTML = `<div id="a" href="/a"></div><div id="b"></div>`;
      const engineA = new VisualChangeEngine();
      const engineB = new VisualChangeEngine();

      engineA.applyVisualChanges([
        { type: `setAttribute`, selector: `#a`, attribute: `data-x`, value: `1` },
      ]);
      engineB.applyVisualChanges([
        { type: `setAttribute`, selector: `#b`, attribute: `data-y`, value: `2` },
      ]);

      // Reverting engineA leaves engineB's change intact.
      engineA.revertVisualChanges();
      expect(document.getElementById(`a`).hasAttribute(`data-x`)).to.be.false;
      expect(document.getElementById(`b`).getAttribute(`data-y`)).to.equal(`2`);

      engineB.revertVisualChanges();
    });
  });
});
