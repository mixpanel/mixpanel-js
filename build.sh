#!/bin/bash

./node_modules/.bin/rollup -i src/loader-module.js -f amd -o build/mixpanel.amd.js
./node_modules/.bin/rollup -i src/loader-module.js -f cjs -o build/mixpanel.cjs.js
./node_modules/.bin/rollup -i src/loader-module.js -f umd -o build/mixpanel.umd.js -n mixpanel
./node_modules/.bin/rollup -i src/loader-globals.js -f iife -o build/mixpanel.globals.js -n mixpanel

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

pushd examples/commonjs-browserify; npm run build; popd
pushd examples/es2015-babelify; npm run build; popd
pushd examples/umd-webpack; npm run build; popd
