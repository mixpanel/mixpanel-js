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
