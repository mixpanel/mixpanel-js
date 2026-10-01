import { expect } from 'chai';
import jsdom from 'jsdom-global';

// Arbitrary import triggers babel-core/register to transpile this file
import './jsdom-setup';

describe(`MixpanelPeople`, function() {
  let mixpanel;
  let teardown;

  beforeEach(function() {
    teardown = jsdom(``, {url: `http://localhost`});
    Object.keys(require.cache).forEach(key => {
      if (key.includes(`/src/`)) {
        delete require.cache[key];
      }
    });
    const lib = require(`../../src/loaders/loader-module`).default;
    mixpanel = lib.init(`test-token`, {persistence: `localStorage`}, `people_test`);
  });

  afterEach(function() {
    teardown();
  });

  describe(`set before identify`, function() {
    it(`queues dates in the encoded format and leaves the caller's object alone`, function() {
      const created = new Date(Date.UTC(2020, 0, 2, 3, 4, 5));
      const props = {created};

      mixpanel.people.set(props);

      expect(mixpanel.persistence.load_queue(`$set`).created).to.equal(`2020-01-02T03:04:05`);
      expect(props.created).to.equal(created);
    });
  });
});
