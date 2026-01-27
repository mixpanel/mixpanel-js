/*
 * Test that module import of SDK does not error out in certain scenarios,
 * e.g. accessing window.localStorage
 */
import { expect } from 'chai';
import jsdom from 'jsdom-global';

// Arbitrary import triggers babel-core/register to transpile this file
// Without it, mocha 11 loads the file as native ESM which breaks chai imports
import './jsdom-setup';

describe(`Module import with localStorage error`, function() {
  let mixpanel;
  let teardown;

  beforeEach(function() {
    teardown = jsdom(``, {url: `http://localhost`});

    Object.defineProperty(window, `localStorage`, {
      get: function() {
        throw new Error(`localStorage not available`);
      },
      configurable: true
    });

    // Forcefully re-import all modules to ensure the module-level code is executed after the stub.
    // Basically what ./jsdom-setup.js does to reset global references
    Object.keys(require.cache).forEach(key => {
      if (key.includes(`/src/`)) {
        delete require.cache[key];
      }
    });
    mixpanel = require(`../../src/loaders/loader-module`).default;
  });

  afterEach(function() {
    teardown();
  });

  it(`can import when localStorage throws`, function() {
    // If we get here without throwing, the import succeeded
    expect(mixpanel).to.exist;
  });
});
