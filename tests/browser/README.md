# Browser Integration Tests

This directory contains the browser integration testing suite for mixpanel-js, built with WebdriverIO and Mocha for cross-browser compatibility testing.

## Quick Start

### Automated Headless Testing

Run the dev integration tests in headless Chrome with watch mode:

```bash
npm run integration-test
```

This command will:
1. Automatically start the test server
2. Run the dev test suite in headless Chrome using WebdriverIO
3. Keep running until you exit (Ctrl+C)

To run the full test suite (dev, minified, and CommonJS module tests):

```bash
npm run integration-test:full
```

For a single test run without watch mode:

```bash
npm run integration-test:local
```

#### Debugging Headless Tests

You can also debug the headless WebdriverIO tests with Chrome DevTools:

1. Run the headless tests:
   ```bash
   INSPECT=1 npm run integration-test
   ```

2. Open Chrome and navigate to `chrome://inspect`

3. Click "inspect" on the remote target to open DevTools for the headless browser instance (you might need to click "inspect fallback" depending on your chrome version)

This allows you to set breakpoints, inspect the DOM, and debug test execution in real-time even while running in headless mode.

### Running on Sauce Labs

To run tests against real browsers in the cloud via Sauce Labs:

```bash
SAUCE_USERNAME=your-username SAUCE_ACCESS_KEY=your-key BROWSER=chrome-latest npm run integration-test:sauce
```

**Available browsers:**
- `chrome-latest` - Chrome on Windows 11
- `edge-latest` - Edge on Windows 11
- `safari-latest` - Safari on macOS 15
- `firefox-latest` - Firefox on Windows 11
- `ios-safari-sim` - Safari on iOS Simulator
- `android-chrome-sim` - Chrome on Android Emulator

The `@wdio/sauce-service` automatically handles Sauce Connect tunneling, so your local test server is accessible to the Sauce Labs VMs.

### Manual Browser Testing

For debugging and development, you can run tests manually in your browser:

1. Start the test server:
   ```bash
   npm run test-server:background
   ```

2. Navigate to one of the test suites in your browser:
   - **Development build**: http://localhost:3001/tests/new/dev
   - **Minified build**: http://localhost:3001/tests/new/minified  
   - **CommonJS module**: http://localhost:3001/tests/new/module-cjs

This gives you full debugging capabilities with browser dev tools and real-time test execution.

## Development Workflow

### Recommended Dev Loop

For the fastest development experience, use dev mode which skips minification:

```bash
npm run build-watch        # Fast builds (no minification)
npm run integration-test   # Dev tests only
```

### Full Build Mode

To build all variants including minified bundles and run the complete test suite:

```bash
npm run build-watch:full      # Full builds (includes minification)
npm run integration-test:full # All test suites (dev, minified, module-cjs)
```

### Alternative: Watch Test Bundles Only

If you only need to watch test file changes:

```bash
npm run build-browser-tests
```

## Architecture

### WebdriverIO
Handles browser automation and cross-browser testing capabilities. Spins up and controls browser instances, executes tests, and reports results. Adheres to the W3C WebDriver specification for maximum browser compatibility.

**Configuration files:**
- `wdio.local.mjs` - Local Chrome headless testing
- `wdio.sauce.mjs` - Sauce Labs cloud testing
- `wdio.shared.mjs` - Shared configuration

### Mocha Browser
Executes the actual test suites within the browser context. Unlike Node.js testing frameworks that mock DOM APIs, this runs real tests in real browsers with actual DOM, IndexedDB, and other Web APIs.

**Test bundles:**
- `snippet-test.js` - Tests for the mixpanel snippet and main library
- `module-cjs-test.js` - Tests for CommonJS module usage

### Rollup
Bundles the Mocha browser tests, allowing us to split tests across multiple files instead of one monolithic test file. Handles transpilation and bundling for different browser targets.

### Express Test Server
Serves test pages and static assets. The integration test routes (`/tests/new/*`) render Pug templates with different configurations:

- `/tests/new/dev` - Development build with unminified library
- `/tests/new/minified` - Production build with minified library  
- `/tests/new/module-cjs` - CommonJS module testing

## Available Commands

| Command | Description |
|---------|-------------|
| `npm run integration-test` | Run dev test suite (fast) |
| `npm run integration-test:full` | Run all test suites (dev, minified, module-cjs) |
| `npm run integration-test:local` | Single test run without watch mode |
| `npm run integration-test:sauce` | Run tests on Sauce Labs |
| `npm run test-server` | Start test server in foreground |
| `npm run test-server:background` | Start test server in background |
| `npm run build-watch` | Watch and rebuild (fast, no minification) |
| `npm run build-watch:full` | Watch and rebuild all files (includes minification) |
| `npm run build-browser-tests` | Watch and rebuild test bundles only |

## Testing Different Builds

The test suite validates multiple build configurations:

1. **Development Build** (`/build/mixpanel.js`) - Unminified for debugging
2. **Minified Build** (`/build/mixpanel.min.js`) - Production (closure compiled)
3. **CommonJS Module** (`/build/mixpanel.cjs.js`) - Node.js compatible

Each build type has its own test route and can be tested independently.

## Browser Support

Tests run on:
- **Local**: Chrome (latest, headless)
- **Sauce Labs**: Multiple browsers and versions across desktop and mobile

The WebdriverIO configuration handles browser-specific capabilities and ensures consistent test execution across different environments.
