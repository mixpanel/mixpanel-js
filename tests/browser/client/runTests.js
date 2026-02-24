import { ALL_TESTS } from ".";
// copied from mocha source, but modified to add a file name to the test results and remove some node-specific stuff
/**
   * Constructs a new `JSON` reporter instance.
   *
   * @public
   * @class JSON
   * @memberof Mocha.reporters
   * @extends Mocha.reporters.Base
   * @param {Runner} runner - Instance triggers reporter actions.
   * @param {Object} [options] - runner options
   */
function JSONReporter(runner, options = {}) {
  window.Mocha.reporters.Base.call(this, runner, options);

  var self = this;
  var tests = [];
  var pending = [];
  var failures = [];
  var passes = [];

  runner.on(`test end`, function (test) {
    tests.push(test);
  });

  runner.on(`pass`, function (test) {
    passes.push(test);
    console.log(`[MOCHA] ${test.fullTitle()} PASSED ✅`);
  });

  runner.on(`fail`, function (test) {
    failures.push(test);
    console.log(`[MOCHA] ${test.fullTitle()} FAILED ❌\n${test.err.message}\n${test.err.stack}`);
  });

  runner.on(`pending`, function (test) {
    pending.push(test);
    console.log(`[MOCHA] ${test.fullTitle()} PENDING ⏳`);
  });

  runner.once(`end`, function () {
    var obj = {
      stats: self.stats,
      tests: tests.map(clean),
      pending: pending.map(clean),
      failures: failures.map(clean),
      passes: passes.map(clean)
    };

    runner.testResults = obj;
  });
}

/**
   * Return a plain-object representation of `test`
   * free of cyclic properties etc.
   *
   * @private
   * @param {Object} test
   * @return {Object}
   */
function clean(test) {
  var err = test.err || {};
  if (err instanceof Error) {
    err = errorJSON(err);
  }

  return {
    title: test.title,
    fullTitle: test.fullTitle(),
    file: getTopLevelSuiteName(test),
    duration: test.duration,
    currentRetry: test.currentRetry(),
    speed: test.speed,
    err: cleanCycles(err)
  };
}

/**
   * Replaces any circular references inside `obj` with '[object Object]'
   *
   * @private
   * @param {Object} obj
   * @return {Object}
   */
function cleanCycles(obj) {
  var cache = [];
  return JSON.parse(
    JSON.stringify(obj, function (key, value) {
      if (typeof value === `object` && value !== null) {
        if (cache.indexOf(value) !== -1) {
          // Instead of going in a circle, we'll print [object Object]
          return `` + value;
        }
        cache.push(value);
      }

      return value;
    })
  );
}

/**
   * Transform an Error object into a JSON object.
   *
   * @private
   * @param {Error} err
   * @return {Object}
   */
function errorJSON(err) {
  var res = {};
  Object.getOwnPropertyNames(err).forEach(function (key) {
    res[key] = err[key];
  }, err);
  return res;
}




// mocha doesn't support multiple reporters for some reason...
// this is a workaround to get a nice visual report while developing, but also a JSON report for CI
class MultiReporter {
  constructor(runner, options) {
    this.htmlReporter = new window.Mocha.reporters.html(runner, options);
    this.jsonReporter = new JSONReporter(runner, options);
    this.specReporter = new window.Mocha.reporters.spec(runner, options);
  }
}

function getTopLevelSuiteName(testInstance) {
  let suite = testInstance;
  while (!suite.parent.root) {
    suite = suite.parent;
  }
  return suite.title;
}

// Of course getting logs doesn't work in each browser on the selenium / wdio side,
// but we can monkey patch it here to work everywhere
function monkeyPatchBrowserLogs() {
  window.consoleLogs = [];
  const originalLog = console.log;
  const originalError = console.error;
  const originalWarn = console.warn;

  window.addEventListener(`unhandledrejection`, function(event) {
    window.consoleLogs.push({
      level: `ERROR`,
      message: `Unhandled promise rejection: ${event.reason}`,
      timestamp: Date.now()
    });
  });

  window.addEventListener(`error`, function(event) {
    window.consoleLogs.push({
      level: `ERROR`,
      message: `Unhandled error: ${event.message}`,
      timestamp: Date.now()
    });
  });

  console.log = function(...args) {
    window.consoleLogs.push({level: `INFO`, message: args.join(` `), timestamp: Date.now()});
    originalLog.apply(console, args);
  };

  console.error = function(...args) {
    window.consoleLogs.push({level: `ERROR`, message: args.join(` `), timestamp: Date.now()});
    originalError.apply(console, args);
  };

  console.warn = function(...args) {
    window.consoleLogs.push({level: `WARNING`, message: args.join(` `), timestamp: Date.now()});
    originalWarn.apply(console, args);
  };

  window._getConsoleLogs = function() {
    return window.consoleLogs;
  };
}

/**
 * Work around Safari 14 IndexedDB open bug.
 *
 * Safari has a horrible bug where IDB requests can hang while the browser is starting up. https://bugs.webkit.org/show_bug.cgi?id=226547
 * The only solution is to keep nudging it until it's awake.
 */
export default function idbReady() {
  const isSafari =
    !navigator.userAgentData &&
    /Safari\//.test(navigator.userAgent) &&
    !/Chrom(e|ium)\//.test(navigator.userAgent);

  // No point putting other browsers or older versions of Safari through this mess.
  if (!isSafari || !indexedDB.databases) return Promise.resolve();
  let intervalId;
  return new Promise((resolve) => {
    const tryIdb = () => indexedDB.databases().finally(resolve);
    intervalId = setInterval(tryIdb, 100);
    tryIdb();
  }).finally(() => clearInterval(intervalId));
}

export function testMixpanel(mixpanel) {
  monkeyPatchBrowserLogs();

  mocha.setup({ui: `bdd`, reporter: MultiReporter, timeout: 2500});
  console.log(`Mocha setup done`);

  before(async () => {
    await idbReady(); // if this works we need to put it in the sdk
  });

  afterEach(() => {
    // scroll down so that we can see what's running in the sauce recording
    window.scrollTo(0, document.body.scrollHeight);
  });

  ALL_TESTS.forEach((specFn) => {
    specFn(mixpanel);
  });

  // callback because that's what we need for executeAsyncScript comptibility in webdriver
  window.runTests = (resultCb) => {
    console.log(`Running tests...`);
    const runner = mocha.run(() => {
      window.results = runner.testResults;
      resultCb && resultCb(JSON.stringify(window.results));
      console.log(`Tests finished, results:`, window.results);
    });
  };

  // automated tests will run the test suite manuallly to pass a callback
  if (!window.location.search.includes(`nostart`)) {
    window.runTests();
  }
}
