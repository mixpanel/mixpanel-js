#!/bin/bash

set -e

# building with $DIST=1 also implies $FULL=1
if [ ! -z "$DIST" ]; then
    export FULL=1
    rm -r -f build
    npm install
fi

echo 'Building main bundles'
npx rollup -c rollup.config.mjs

ln -sf mixpanel.globals.js build/mixpanel.js

if [ ! -z "$FULL" ]; then
    echo 'Minifying main build and snippets'
    java -jar vendor/closure-compiler/compiler.jar --js build/mixpanel.js --language_in ECMASCRIPT5 --externs src/externs.js --js_output_file build/mixpanel.min.js --compilation_level ADVANCED_OPTIMIZATIONS --output_wrapper "(function() {
%output%
})();"
    java -jar vendor/closure-compiler/compiler.jar --js src/loaders/mixpanel-jslib-snippet.js --language_in ECMASCRIPT5 --js_output_file build/mixpanel-jslib-snippet.min.js --compilation_level ADVANCED_OPTIMIZATIONS
    java -jar vendor/closure-compiler/compiler.jar --js src/loaders/mixpanel-jslib-snippet.js --language_in ECMASCRIPT5 --js_output_file build/mixpanel-jslib-snippet.min.test.js --compilation_level ADVANCED_OPTIMIZATIONS --define='MIXPANEL_LIB_URL="../build/mixpanel.min.js"'

    echo 'Minifying mixpanel-js-wrapper'
    java -jar vendor/closure-compiler/compiler.jar --js build/mixpanel-js-wrapper.js --js_output_file build/mixpanel-js-wrapper.min.js --compilation_level ADVANCED_OPTIMIZATIONS

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
