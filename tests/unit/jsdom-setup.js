import jsdom from 'jsdom-global';

function rerequire(paths) {
  return (paths || []).map(path => {
    delete require.cache[require.resolve(path)];
    return require(path);
  });
}

export default function jsdomSetup(options={}) {
  let teardown, modules;
  const {dependencies, beforeCallback, afterCallback} = options;

  beforeEach(function() {
    teardown = jsdom(undefined, options.jsdom);
    modules = rerequire(dependencies);
    if (typeof(beforeCallback) === `function`) {
      beforeCallback(modules);
    }
  });

  afterEach(function() {
    teardown();
    if (typeof(afterCallback) === `function`) {
      afterCallback();
    }
  });
}
