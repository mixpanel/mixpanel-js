#!/bin/bash

set -e

# building with $DIST=1 also implies $FULL=1
if [ ! -z "$DIST" ]; then
    export FULL=1
fi

echo 'Building main bundles'
npx rollup -i src/loaders/loader-globals.js -f iife -o build/mixpanel.globals.js -n mixpanel -c rollup.config.js
npx rollup -i src/recorder/index.js -f iife -n mixpanel -c src/recorder/rollup.config.js
ln -sf mixpanel.globals.js build/mixpanel.js

if [ ! -z "$FULL" ]; then
    echo 'Minifying main build and snippets'
    java -jar vendor/closure-compiler/compiler.jar --js build/mixpanel.js --js_output_file build/mixpanel.min.js --compilation_level ADVANCED_OPTIMIZATIONS --output_wrapper "(function() {
%output%
})();"
    java -jar vendor/closure-compiler/compiler.jar --js src/loaders/mixpanel-jslib-snippet.js --js_output_file build/mixpanel-jslib-snippet.min.js --compilation_level ADVANCED_OPTIMIZATIONS
    java -jar vendor/closure-compiler/compiler.jar --js src/loaders/mixpanel-jslib-snippet.js --js_output_file build/mixpanel-jslib-snippet.min.test.js --compilation_level ADVANCED_OPTIMIZATIONS --define='MIXPANEL_LIB_URL="../build/mixpanel.min.js"'

    echo 'Building mixpanel-js-wrapper'
    npx rollup src/loaders/mixpanel-js-wrapper.js -o build/mixpanel-js-wrapper.js -c rollup.config.js
    java -jar vendor/closure-compiler/compiler.jar --js build/mixpanel-js-wrapper.js --js_output_file build/mixpanel-js-wrapper.min.js --compilation_level ADVANCED_OPTIMIZATIONS

    echo 'Building module bundles'
    npx rollup -i src/loaders/loader-module.js -f amd -o build/mixpanel.amd.js -c rollup.config.js
    npx rollup -i src/loaders/loader-module.js -f cjs -o build/mixpanel.cjs.js -c rollup.config.js
    npx rollup -i src/loaders/loader-module.js -f es -o build/mixpanel.module.js -c rollup.config.js
    npx rollup -i src/loaders/loader-module-core.js -f cjs -o build/mixpanel-core.cjs.js -c rollup.config.js
    npx rollup -i src/loaders/loader-module-with-async-recorder.js -f cjs -o build/mixpanel-with-async-recorder.cjs.js -c rollup.config.js
    npx rollup -i src/loaders/loader-module.js -f umd -o build/mixpanel.umd.js -n mixpanel -c rollup.config.js

    echo 'Bundling module-loader test runners'
    npx webpack tests/module-cjs.js tests/module-cjs.bundle.js
    npx browserify tests/module-es2015.js -t [ babelify --compact false ] --outfile tests/module-es2015.bundle.js

    echo 'Bundling module-loader examples'
    pushd examples/commonjs-browserify; npm install && npm run build; popd
    pushd examples/es2015-babelify; npm install && npm run build; popd
    pushd examples/umd-webpack; npm install && npm run build; popd
fi

if [ ! -z "$DIST" ]; then
    echo 'Copying to dist/'
    rm -r dist
    cp -r build dist
fi
