#!/bin/bash

set -e

# make locally installed CLIs (rollup, webpack, browserify) available even when
# this script is run directly rather than via `npm run`
export PATH="$(cd "$(dirname "$0")" && pwd)/node_modules/.bin:$PATH"

# building with $DIST=1 also implies $FULL=1
if [ ! -z "$DIST" ]; then
    export FULL=1
    rm -r -f build
    npm ci
fi

echo 'Building main bundles'
rollup -c rollup.config.mjs

ln -sf mixpanel.globals.js build/mixpanel.js

if [ ! -z "$DIST" ]; then
    echo 'Copying to dist/'
    rm -r dist
    rsync -av --exclude='test' build/ dist/

    # CycloneDX SBOM for the production dependency tree, shipped inside dist/ so
    # it travels with the immutable distributed source and the npm tarball.
    echo 'Generating CycloneDX SBOM'
    npm run sbom

    # typescript examples require dist files
    echo 'Building TypeScript examples'
    pushd examples/typescript; npm ci && npm run build; popd
fi

if [ ! -z "$FULL" ]; then
    echo 'Bundling module-loader test runners'
    webpack tests/module-cjs.js tests/module-cjs.bundle.js
    browserify tests/module-es2015.js -t [ babelify --compact false ] --outfile tests/module-es2015.bundle.js
fi
