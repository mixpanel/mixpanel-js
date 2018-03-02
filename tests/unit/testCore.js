import os from 'os';
import { expect } from 'chai';
import sinon from 'sinon';
import nodeLocalStorage from 'node-localstorage';
import { conditionAsync } from '../test-utils';

import mixpanel from '../../src/loader-module';

describe('Core', function() {
  before(function() {
  });

  beforeEach(function() {
  });

  describe('init', function() {
    let lib, sandbox, _maybeLoadEditorStub;
    beforeEach(function() {
      sandbox = sinon.sandbox.create();
    });

    afterEach(function() {
      sandbox.restore();
    });

    it('initializes, tracks, and identifies without exception', async function() {
      var isFinished = false;
      mixpanel.init(`test-token`, {
          debug: true,
          persistence: `localStorage`,
          api_host: `https://test.com`,
          loaded: function() {
            mixpanel.track(`test-event`);
            mixpanel.identify(`test-id`);
            isFinished = true;
          },
      });

      await conditionAsync(() => isFinished);
    });
  });
});
