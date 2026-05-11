import { expect } from 'chai';
import localStorage from 'localStorage';

import { LocalStorageWrapper } from '../../src/storage/local-storage';

describe(`LocalStorageWrapper`, function() {
  beforeEach(function() {
    localStorage.clear();
  });

  describe(`init`, function() {
    it(`resolves when storage is available`, async function() {
      const wrapper = new LocalStorageWrapper(localStorage);
      await wrapper.init();
    });

    it(`rejects when storage is null`, async function() {
      const wrapper = new LocalStorageWrapper(null);
      try {
        await wrapper.init();
        expect.fail(`should have rejected`);
      } catch (err) {
        expect(err.message).to.equal(`localStorage is not available`);
      }
    });
  });

  describe(`setItem / getItem`, function() {
    it(`stores and retrieves a value`, async function() {
      const wrapper = new LocalStorageWrapper(localStorage);
      await wrapper.init();
      await wrapper.setItem(`test-key`, {foo: `bar`});
      const value = await wrapper.getItem(`test-key`);
      expect(value).to.eql({foo: `bar`});
    });

    it(`returns null for a missing key`, async function() {
      const wrapper = new LocalStorageWrapper(localStorage);
      await wrapper.init();
      const value = await wrapper.getItem(`nonexistent`);
      expect(value).to.be.null;
    });
  });

  describe(`removeItem`, function() {
    it(`removes a stored value`, async function() {
      const wrapper = new LocalStorageWrapper(localStorage);
      await wrapper.init();
      await wrapper.setItem(`test-key`, {foo: `bar`});
      await wrapper.removeItem(`test-key`);
      const value = await wrapper.getItem(`test-key`);
      expect(value).to.be.null;
    });
  });

  describe(`when storage throws`, function() {
    it(`setItem rejects on error`, async function() {
      const brokenStorage = {
        setItem: function() { throw new Error(`Access is denied`); },
        getItem: function() { return null; },
        removeItem: function() { return null; },
      };
      const wrapper = new LocalStorageWrapper(brokenStorage);
      try {
        await wrapper.setItem(`key`, `value`);
        expect.fail(`should have rejected`);
      } catch (err) {
        expect(err.message).to.equal(`Access is denied`);
      }
    });

    it(`getItem rejects on error`, async function() {
      const brokenStorage = {
        setItem: function() { return null; },
        getItem: function() { throw new Error(`Access is denied`); },
        removeItem: function() { return null; },
      };
      const wrapper = new LocalStorageWrapper(brokenStorage);
      try {
        await wrapper.getItem(`key`);
        expect.fail(`should have rejected`);
      } catch (err) {
        expect(err.message).to.equal(`Access is denied`);
      }
    });
  });
});
