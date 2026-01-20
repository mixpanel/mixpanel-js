import {sharedConfig} from './wdio.shared.mjs';

// inspecting can lead to issues with running multiple spec files back-to-back,
// so don't expose the remote debugger by default
const chromeArgs = [`--headless`, `--no-sandbox`];
if (process.env.INSPECT) {
  chromeArgs.push(`--remote-debugging-port=9222`);
}

export const config = {
  ...sharedConfig,
  maxInstances: 1,
  capabilities: [
    {
      browserName: `chrome`,
      browserVersion: `latest`,
      'goog:chromeOptions': {
        args: chromeArgs,
      },
      'goog:loggingPrefs': {
        browser: `ALL`,
      }
    }
  ],

  // // Watch mode is currently broken for non-spec files https://github.com/webdriverio/webdriverio/issues/14685
  // but once this gets fixed it'll be nice to have auto reloading on code / browser test changes
  // filesToWatch: [
  //   './build/**/*.js',
  // ],

  logLevels: {
    webdriver: `silent`,
  }
  // logLevel: `error`,
};
