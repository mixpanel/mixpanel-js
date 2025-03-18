
# Mixpanel JavaScript Library
![Build Status](https://github.com/mixpanel/mixpanel-js/actions/workflows/tests.yml/badge.svg)
[![](http://img.badgesize.io/https://unpkg.com/mixpanel-browser/dist/mixpanel.min.js?compression=gzip)](https://unpkg.com/mixpanel-browser/dist/mixpanel.min.js)

The Mixpanel JavaScript Library is a set of methods attached to a global `mixpanel` object
intended to be used by websites wishing to send data to Mixpanel projects. A full reference
is available [here](https://developer.mixpanel.com/docs/javascript-full-api-reference).

## Alternative installation via NPM
This library is available as a [package on NPM](https://www.npmjs.com/package/mixpanel-browser) (named `mixpanel-browser` to distinguish it from Mixpanel's server-side Node.js library, available on NPM as `mixpanel`). To install into a project using NPM with a front-end packager such as [Vite](https://vitejs.dev/) or [Webpack](https://webpack.github.io/):

```sh
npm install --save mixpanel-browser
```

You can then import the lib:

```javascript
import mixpanel from 'mixpanel-browser';

mixpanel.init("YOUR_TOKEN", {autocapture: true});
mixpanel.track("An event");
```

NOTE: the default `mixpanel-browser` bundle includes a bundled `mixpanel-recorder` SDK. We provide the following options to exclude `mixpanel-recorder` if you do not intend to use session replay or want to reduce bundle size:

To load the core SDK with no option of session recording:
```javascript
import mixpanel from 'mixpanel-browser/src/loaders/loader-module-core';
```

To load the core SDK and optionally load session recording bundle asynchronously (via script tag):
```javascript
import mixpanel from 'mixpanel-browser/src/loaders/loader-module-with-async-recorder';
```

## Use as a browser JavaScript module

If you are leveraging [browser JavaScript modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules), you can use [`importmap`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script/type/importmap) to pull in this library.

```html
<script type="importmap">
{
  "imports": {
    "mixpanel-browser": "https://cdn.mxpnl.com/libs/mixpanel-js/dist/mixpanel.module.js"
  }
}
</script>
<script type="module" src="main.js"></script>
```

Then you are free to import `mixpanel-browser` in your javascript modules.

```js
// main.js
import mixpanel from 'mixpanel-browser';

mixpanel.init('YOUR_TOKEN', {autocapture: true, debug: true, persistence: 'localStorage'});
```

## Building bundles for release
- Install development dependencies: `npm install`
- Build: `npm run build-dist`

## Running tests
- Install development dependencies: `npm install`
- Run unit tests: `npm test`
- Start test server for browser tests: `npm run integration_test`
- Browse to [http://localhost:3000/tests/](http://localhost:3000/tests/) and choose a scenario to run

In the future we plan to automate the last step with a headless browser to streamline development (although
Mixpanel production releases are tested against a large matrix of browsers and operating systems).

## Generating and publishing documentation
- Create bundled source build: `npm run build-dist`
- Generate Markdown: `npm run dox` (result is at `doc/readme.io/javascript-full-api-reference.md`)
- Publish to readme.io via the [rdme](https://www.npmjs.com/package/rdme) util: `RDME_API_KEY=<API_KEY> RDME_DOC_VERSION=<version> npm run dox-publish`

## Thanks
For patches and support: @bohanyang, @dehau, @drubin, @D1plo1d, @feychenie, @mogstad, @pfhayes, @sandorfr, @stefansedich, @gfx, @pkaminski, @austince, @danielbaker, @mkdai, @wolever, @dpraul, @chriszamierowski, @JoaoGomesTW, @@aliyalcinkaya, @chrisdeely
