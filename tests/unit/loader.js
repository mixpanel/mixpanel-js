/*
 * Test that basic SDK usage (init, track, etc) does not
 * blow up in non-browser (node.js) envs. These are not
 * tests of server-side tracking functionality (which is
 * currently not supported in the browser lib).
 */

import mixpanel from '../../src/loaders/loader-module';

describe(`Module-based loader in Node env`, function() {
  it(`supports init() with options`, function(done) {
    mixpanel.init(`test-token`, {
      debug: true,
      persistence: `localStorage`,
      api_host: `https://test.com`,
      loaded: function() {
        done();
      },
    });
  });

  it(`supports init() with options twice`, async function(done) {
    try {
      await new Promise((resolve, reject) => {
        mixpanel.init(`test-token`, {
          debug: true,
          persistence: `localStorage`,
          api_host: `https://test.com`,
          loaded: function() {
            resolve();
          },
          error_reporter: reject
        });
      });
    } catch (e) {
      console.log(e);
    }

    done();
  });

  it(`supports identify()`, function() {
    mixpanel.identify(`Pat`);
  });

  it(`supports track()`, function() {
    mixpanel.track(`Did stuff`);
  });
});
