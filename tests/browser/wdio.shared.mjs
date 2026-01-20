import { spawn } from 'child_process';
import waitOn from 'wait-on';

let testServer;

const DEV = process.env.DEV;
const specs = DEV
  ? [`./dev.spec.ts`]
  : [`./dev.spec.ts`, `./minified.spec.ts`, `./module_cjs.spec.ts`];

export const sharedConfig = {
  runner: `local`,
  region: `us`,
  specs,
  maxInstances: 10,
  logLevel: `info`,
  bail: 0,
  baseUrl: `http://localhost:3001`,
  waitforTimeout: 10000,
  connectionRetryTimeout: 5 * 60 * 1000,
  connectionRetryCount: 3,
  framework: `mocha`,
  reporters: [`spec`],
  mochaOpts: {
    ui: `bdd`,
    timeout: 20 * 10 * 1000,
  },
  specFileRetries: 3,

  onPrepare: async function (config, capabilities) {
    console.log(`Starting test server...`);
    console.log(`Navigate to http://localhost:3001 to see the test runner UI.`);

    // Spawn the test server from the project root
    testServer = spawn(`node`, [`testServer.js`], {
      cwd: process.cwd(),
      stdio: `inherit`,
    });

    // Wait for server to be ready
    try {
      await waitOn({
        resources: [`http://localhost:3001/tests/new`],
        timeout: 10000,
      });
      console.log(`Test server is ready!`);
    } catch (err) {
      console.error(`Failed to start test server:`, err);
      throw err;
    }
  },

  onComplete: function (exitCode, config, capabilities, results) {
    if (testServer) {
      console.log(`Shutting down test server...`);
      testServer.kill();
    }
  },
};
