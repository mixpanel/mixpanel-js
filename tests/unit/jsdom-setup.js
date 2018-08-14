import jsdom from 'jsdom-global';

/**
 * Re-import a list of JS modules
 * Important for use with jsdom because modules may need to be re-imported after the
 * jsdom instance is reset so that they can reference the new document and window
 * @param {string[]} paths - list of file paths to JS modules that should be re-imported
 * @returns {Object[]} list of re-imported module objects
 */
function reImport(paths) {
  return (paths || []).map(path => {
    delete require.cache[require.resolve(path)];
    const module = require(path);
    // return module.default directly if possible to emulate es6 import behavior
    return typeof(module.default) !== `undefined` ? module.default : module;
  });
}

/**
 * Initialize a new jsdom instance before each test in a mocha suite, and teardown after each test
 * Must be called within a mocha test suite as it makes the appropriate beforeEach/afterEach calls
 * Accepts callback functions that wil lbe invoked after initializing/destroying jsdom during each
 * test. beforeCallback is passed the list of re-imported modules, which allows patterns like this:
 *
 *   let testModuleA, testModuleB;
 *
 *   jsdomSetup({
 *     reImportModules: [`../testModuleA`, `../testModuleB`],
 *     beforeCallback: modules => {
 *       [testModuleA, testModuleB] = modules;
 *     },
 *   });
 *
 *   // use testModuleA and testModuleB in tests
 *
 * testModuleA and testModuleB will be re-imported before each test and will reference the new
 * jsdom instance's document and window.
 *
 * @param {Object} [options]
 * @param {string[]} [options.reImportModules] - list of file paths to be re-imported before each test
 * @param {function} [options.beforeCallback] - callback to be invoked after initializing jsdom
 * @param {function} [options.afterCallback] - callback to be invoked after tearing down jsdom
 * @param {function} [options.*] - all other options passed directly to jsdom
 */
export default function jsdomSetup(options={}) {
  const jsdomOptions = Object.assign({
    url: `http://localhost`, // default for localStorage - "non-opaque" origin required
  }, options);

  delete jsdomOptions.html;
  delete jsdomOptions.reImportModules;
  delete jsdomOptions.beforeCallback;
  delete jsdomOptions.afterCallback;

  let teardown;

  beforeEach(function() {
    teardown = jsdom(options.html, jsdomOptions);
    const modules = reImport(options.reImportModules);
    if (typeof(options.beforeCallback) === `function`) {
      options.beforeCallback(modules);
    }
  });

  afterEach(function() {
    teardown();
    if (typeof(options.afterCallback) === `function`) {
      options.afterCallback();
    }
  });
}
