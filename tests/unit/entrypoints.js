import { expect } from 'chai';
import fs from 'fs';
import path from 'path';

// Arbitrary import triggers babel-core/register to transpile this file
import './jsdom-setup';

import { RECORDER_FILENAME, TARGETING_FILENAME } from '../../src/config';

const ROOT = path.resolve(__dirname, `../..`);
const readJSON = (file) => JSON.parse(fs.readFileSync(path.join(ROOT, file), `utf8`));
const rollupConfig = fs.readFileSync(path.join(ROOT, `rollup.config.mjs`), `utf8`);

describe(`npm subpath entrypoints`, function() {
  const pkg = readJSON(`package.json`);

  [
    {dir: `core`, loader: `loader-module-core.js`},
    {dir: `async-modules`, loader: `loader-module-with-async-modules.js`},
  ].forEach(({dir, loader}) => {
    describe(`mixpanel-browser/${dir}`, function() {
      const entry = readJSON(`${dir}/package.json`);

      it(`is published`, function() {
        expect(pkg.files).to.include(dir);
      });

      it(`points main, module and types at dist/ bundles that the build produces`, function() {
        const builtFiles = [entry.main, entry.module].map((file) => {
          const resolved = path.relative(ROOT, path.join(ROOT, dir, file));
          expect(resolved.startsWith(`dist/`), resolved).to.equal(true);
          return path.basename(resolved);
        });
        expect(builtFiles[0]).to.match(/\.cjs\.js$/);
        expect(builtFiles[1]).to.match(/\.module\.js$/);

        // both bundles come from the same loader in rollup.config.mjs
        const buildBlock = rollupConfig.split(`input: \`src/loaders/${loader}\``)[1].split(`input:`)[0];
        builtFiles.forEach((file) => {
          expect(buildBlock).to.contain(`build/${file}`);
        });
        expect(buildBlock.split(`format: \`cjs\``).length).to.be.greaterThan(1);
        expect(buildBlock).to.contain(`format: \`es\``);

        // copyTypes() writes a .d.ts next to every output of the build
        expect(buildBlock).to.contain(`copyTypes()`);
        expect(entry.types).to.equal(entry.module.replace(/\.js$/, `.d.ts`));
      });

      it(`loads the built bundle when it exists`, function() {
        const main = path.join(ROOT, dir, entry.main);
        if (!fs.existsSync(main)) {
          this.skip();
        }
        const mixpanel = require(main);
        expect(mixpanel.init).to.be.a(`function`);
        expect(mixpanel.track).to.be.a(`function`);
      });
    });
  });
});

describe(`async module filenames`, function() {
  it(`fall back to the unhashed CDN bundles when the SDK is bundled from src/`, function() {
    // The build replaces the __MP_*_FILENAME__ placeholders with hashed filenames.
    // Importing straight from src/ skips that step.
    expect(RECORDER_FILENAME).to.equal(`mixpanel-recorder.min.js`);
    expect(TARGETING_FILENAME).to.equal(`mixpanel-targeting.min.js`);
  });
});
