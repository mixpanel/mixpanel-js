# Mixpanel JavaScript Library
[![Build Status](https://travis-ci.org/mixpanel/mixpanel-js.svg?branch=master)](https://travis-ci.org/mixpanel/mixpanel-js)

The Mixpanel JavaScript Library is a set of methods attached to a global `mixpanel` object
intended to be used by websites wishing to send data to Mixpanel projects. A full reference
is available [here](https://mixpanel.com/help/reference/javascript).

## Extra features provided by this fork
- Ability to add HTTP headers to every XHR request

## Preferred usage method
Require the lib like a standard Node.js module:

```javascript
const mixpanel = require('@fintechstudios/mixpanel-browser');

mixpanel.init("YOUR_TOKEN");
mixpanel.track("An event");
```

## Building bundles for release
- Install development dependencies: `npm install`
- Build: `npm run build`

## Running tests
- Install development dependencies: `npm install`
- Run unit tests: `npm test`
- Start test server for browser tests: `npm run integration_test`
- Browse to [http://localhost:3000/tests/](http://localhost:3000/tests/) and choose a scenario to run

In the future we plan to automate the last step with a headless browser to streamline development (although
Mixpanel production releases are tested against a large matrix of browsers and operating systems).

## Developing Notes
- Commits are pre-checked with a series of verifications
    - if `npm run validate` fails, try `npm install --force` 

## Thanks
For patches and support: @bohanyang, @dehau, @drubin, @D1plo1d, @feychenie, @mogstad, @pfhayes, @sandorfr, @stefansedich, @gfx, @pkaminski
