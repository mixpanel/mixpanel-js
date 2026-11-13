import { expect } from 'chai';

import { window } from '../../src/window';

import jsdomSetup from './jsdom-setup';
import { AntiFlickerController } from '../../src/visual-experiments/anti-flicker';

const tick = ms => new Promise(resolve => setTimeout(resolve, ms));

describe(`anti-flicker (browser)`, function() {
  let AntiFlicker;
  let controller;

  jsdomSetup({
    reImportModules: [`../../src/window`, `../../src/visual-experiments/anti-flicker`],
    beforeCallback: modules => {
      AntiFlicker = modules[1].AntiFlickerController;
    },
    afterCallback: () => {
      // Cancel any pending failsafe timer before the jsdom instance is torn down.
      if (controller && controller.reveal) {
        controller.reveal();
      }
      controller = undefined;
    },
  });

  const styleEl = () => document.getElementById(`mp-antiflicker-style`);
  const isHidden = () => document.documentElement.classList.contains(`mp-antiflicker-hide`);

  it(`hide() injects a style element and hides <html>`, function() {
    controller = new AntiFlicker(3000);
    controller.hide();
    expect(styleEl()).to.not.equal(null);
    expect(styleEl().textContent).to.contain(`opacity`);
    expect(isHidden()).to.be.true;
  });

  it(`reveal() removes the style element and the class`, function() {
    controller = new AntiFlicker(3000);
    controller.hide();
    controller.reveal();
    expect(styleEl()).to.equal(null);
    expect(isHidden()).to.be.false;
  });

  it(`reveal() is idempotent`, function() {
    controller = new AntiFlicker(3000);
    controller.hide();
    controller.reveal();
    expect(() => controller.reveal()).to.not.throw();
    expect(styleEl()).to.equal(null);
  });

  it(`hide() is idempotent (only one style node)`, function() {
    controller = new AntiFlicker(3000);
    controller.hide();
    controller.hide();
    expect(document.querySelectorAll(`#mp-antiflicker-style`).length).to.equal(1);
  });

  it(`does not hide again after reveal`, function() {
    controller = new AntiFlicker(3000);
    controller.hide();
    controller.reveal();
    controller.hide();
    expect(styleEl()).to.equal(null);
    expect(isHidden()).to.be.false;
  });

  it(`failsafe timer reveals the page after the timeout`, async function() {
    controller = new AntiFlicker(10);
    controller.hide();
    expect(isHidden()).to.be.true;
    await tick(40);
    expect(isHidden()).to.be.false;
    expect(styleEl()).to.equal(null);
  });

  it(`an explicit reveal cancels the failsafe (stays revealed, no throw)`, async function() {
    controller = new AntiFlicker(10);
    controller.hide();
    controller.reveal();
    await tick(40);
    expect(isHidden()).to.be.false;
  });

  describe(`multiple instances (shared hide is reference-counted)`, function() {
    it(`the first instance to reveal leaves the page hidden until the last one reveals`, function() {
      const a = new AntiFlicker(3000);
      const b = new AntiFlicker(3000);
      a.hide();
      b.hide();
      // One shared style node, not one per instance.
      expect(document.querySelectorAll(`#mp-antiflicker-style`).length).to.equal(1);
      expect(isHidden()).to.be.true;

      // First reveal: page stays hidden while b's variant is still pending.
      a.reveal();
      expect(isHidden()).to.be.true;
      expect(styleEl()).to.not.equal(null);

      // Last contributor reveals: shared class and style torn down.
      b.reveal();
      expect(isHidden()).to.be.false;
      expect(styleEl()).to.equal(null);
    });

    it(`teardown works even when the non-injecting instance reveals last`, function() {
      const a = new AntiFlicker(3000); // injects the shared style
      const b = new AntiFlicker(3000); // reuses it
      a.hide();
      b.hide();

      a.reveal(); // injector reveals first; b's reference keeps the page hidden
      expect(isHidden()).to.be.true;

      // b never held a _styleEl reference; teardown finds the node by id.
      b.reveal();
      expect(isHidden()).to.be.false;
      expect(styleEl()).to.equal(null);
    });
  });
});

describe(`anti-flicker (non-browser)`, function() {
  it(`hide()/reveal() no-op without a real document and never throw`, function() {
    // The top-level import binds to the src/window stub: document.createElement
    // returns {} and there is no documentElement, so hide() must bail out.
    expect(window[`document`].documentElement).to.equal(undefined);
    const controller = new AntiFlickerController(3000);
    expect(() => {
      controller.hide();
      controller.reveal();
    }).to.not.throw();
    expect(controller._isHidden()).to.be.false;
  });
});
