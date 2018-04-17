#!/bin/bash

echo 'Building module and globals bundles'
npx rollup -i src/loader-module.js -f amd -o build/mixpanel.amd.js -c rollup.config.js
npx rollup -i src/loader-module.js -f cjs -o build/mixpanel.cjs.js -c rollup.config.js
npx rollup -i src/loader-module.js -f umd -o build/mixpanel.umd.js -n mixpanel -c rollup.config.js
npx rollup -i src/loader-globals.js -f iife -o build/mixpanel.globals.js -n mixpanel -c rollup.config.js

echo 'Minifying globals build and snippets'
if [ -z "$1" ]; then
    COMPILER=vendor/closure-compiler/compiler.jar
else
    COMPILER=$1
fi
java -jar $COMPILER --js mixpanel.js --js_output_file mixpanel.min.js --compilation_level ADVANCED_OPTIMIZATIONS --output_wrapper "(function() {
%output%
})();"
java -jar $COMPILER --js mixpanel-jslib-snippet.js --js_output_file mixpanel-jslib-snippet.min.js --compilation_level ADVANCED_OPTIMIZATIONS
java -jar $COMPILER --js mixpanel-jslib-snippet.js --js_output_file mixpanel-jslib-snippet.min.test.js --compilation_level ADVANCED_OPTIMIZATIONS --define='MIXPANEL_LIB_URL="../mixpanel.min.js"'

echo 'Bundling module-loader test runners'
npx webpack tests/module-cjs.js tests/module-cjs.bundle.js
npx browserify tests/module-es2015.js -t [ babelify --compact false ] --outfile tests/module-es2015.bundle.js

echo 'Bundling module-loader examples'
pushd examples/commonjs-browserify; npm install && npm run build; popd
pushd examples/es2015-babelify; npm install && npm run build; popd
pushd examples/umd-webpack; npm install && npm run build; popd
