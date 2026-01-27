import {sharedConfig} from './wdio.shared.mjs';

const VALID_BROWSERS = [`chrome-latest`, `edge-latest`, `safari-latest`, `firefox-latest`, `ios-safari-sim`, `android-chrome-sim`];

if (!process.env.SAUCE_USERNAME || !process.env.SAUCE_ACCESS_KEY) {
  console.error(`\nMissing Sauce Labs credentials. Please set:\n  SAUCE_USERNAME=your-username\n  SAUCE_ACCESS_KEY=your-access-key\n`);
  process.exit(1);
}

if (!process.env.BROWSER || !VALID_BROWSERS.includes(process.env.BROWSER)) {
  console.error(`\nMissing or invalid BROWSER environment variable.\nValid options: ${VALID_BROWSERS.join(`, `)}\n\nExample:\n  BROWSER=chrome-latest npm run integration-test:sauce\n`);
  process.exit(1);
}

// default to a generated tunnel name for local runs
const TUNNEL_NAME = process.env.SAUCE_TUNNEL_NAME || `tunnel-${process.env.SAUCE_USERNAME}-${Date.now().toString()}`;

const COMMON_SAUCE_OPTIONS = {
  build: `mixpanel-js ${process.env.GITHUB_REF || `local`} build ${process.env.GITHUB_RUN_NUMBER || ``}`,
};

const BROWSER_TO_CAPABILITIES = {
  'chrome-latest': {
    browserName: `chrome`,
    browserVersion: `latest`,
    platformName: `Windows 11`,
    'sauce:options': COMMON_SAUCE_OPTIONS,
  },
  'edge-latest': {
    browserName: `MicrosoftEdge`,
    browserVersion: `latest`,
    platformName: `Windows 11`,
    'sauce:options': COMMON_SAUCE_OPTIONS,
  },
  'safari-latest': {
    browserVersion: `latest`,
    browserName: `safari`,
    platformName: `macOS 15`,
    'sauce:options': {
      armRequired: true,
      ...COMMON_SAUCE_OPTIONS,
    }
  },
  'firefox-latest': {
    browserName: `firefox`,
    browserVersion: `latest`,
    platformName: `Windows 11`,
    'sauce:options': COMMON_SAUCE_OPTIONS,
  },
  'ios-safari-sim': {
    platformName: `iOS`,
    browserName: `Safari`,
    'appium:deviceName': `iPhone Simulator`,
    'appium:platformVersion': `current_major`,
    'appium:automationName': `XCUITest`,
    'sauce:options': {
      ...COMMON_SAUCE_OPTIONS,
      armRequired: true,
      deviceOrientation: `PORTRAIT`,
      idleTimeout: 300,
      maxDuration: 3600,
      newCommandTimeout: 300
    },
  },
  'android-chrome-sim': {
    platformName: `Android`,
    browserName: `Chrome`,
    'appium:deviceName': `Android GoogleAPI Emulator`,
    'appium:platformVersion': `current_major`,
    'appium:automationName': `UiAutomator2`,
    'sauce:options': {
      ...COMMON_SAUCE_OPTIONS,
      deviceOrientation: `PORTRAIT`,
      'idleTimeout': 180,
    },
  },
};

const sauceHost = process.env.SAUCE_HOST || `localhost`;

export const config = {
  ...sharedConfig,
  baseUrl: `http://${sauceHost}:3001`,
  user: process.env.SAUCE_USERNAME,
  key: process.env.SAUCE_ACCESS_KEY,

  services: [
    [`sauce`, {
      sauceConnect: true,
      sauceConnectOpts: {
        tunnelName: TUNNEL_NAME,
        region: `us`,
        proxyLocalhost: `allow`,
      },
    }],
  ],

  capabilities: [BROWSER_TO_CAPABILITIES[process.env.BROWSER]],
};
