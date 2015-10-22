# Mixpanel JavaScript Library
The Mixpanel JavaScript Library is a set of methods attached to a global `mixpanel` object
intended to be used by websites wishing to send data to Mixpanel projects. A full reference
is available [here](https://mixpanel.com/help/reference/javascript).

## Alternative installation via Bower
`mixpanel-js` is also available via front-end package manager [Bower](http://bower.io/). After installing Bower, fetch into your project's `bower_components` dir with:
```sh
bower install mixpanel
```

### Using Bower to load the snippet
You can then load the lib via the embed code (snippet) with a script reference:
```html
<script src="bower_components/mixpanel/mixpanel-jslib-snippet.min.js"></script>
```
which loads the _latest_ library version from the Mixpanel CDN ([http://cdn.mxpnl.com/libs/mixpanel-2-latest.min.js](http://cdn.mxpnl.com/libs/mixpanel-2-latest.min.js)).

### Using Bower to load the entire library
If you wish to load the specific version downloaded in your Bower package, there are two options.

1) Override the CDN library location with the global `MIXPANEL_CUSTOM_LIB_URL` var:
```html
<script>
  window.MIXPANEL_CUSTOM_LIB_URL = 'bower_components/mixpanel/mixpanel.js';
</script>
<script src="bower_components/mixpanel/mixpanel-jslib-snippet.min.js"></script>
```
or

2) Recompile the snippet with a custom `MIXPANEL_LIB_URL` using [Closure Compiler](https://developers.google.com/closure/compiler/):
```sh
java -jar compiler.jar --js mixpanel-jslib-snippet.js --js_output_file mixpanel-jslib-snippet.min.js --compilation_level ADVANCED_OPTIMIZATIONS --define='MIXPANEL_LIB_URL="bower_components/mixpanel/mixpanel.js"'
```
or

3) Include the library manually (for instance, if your build tools are injecting `mixpanel.min.js` or bundling it up with other dependencies):
```html
<script>
  window.MIXPANEL_DISABLE_LIB_INJECTION = true;
</script>
<script src="bower_components/mixpanel/mixpanel-jslib-snippet.min.js"></script>
<!-- include mixpanel.min.js manually any time after this script is loaded -->
```

### Upgrading from mixpanel-bower v2.2.0 or v2.0.0
If you originally installed Mixpanel via Bower at its previous home ([https://github.com/drubin/mixpanel-bower](https://github.com/drubin/mixpanel-bower)), the two old versions have remained functionally unchanged. To upgrade to v2.3.6 or later (the first Bower version in the official repo) from a previous Bower install, note the changed filenames: previous references to `mixpanel.js` should become `mixpanel-jslib-snippet.min.js` (the minified embed code), and previous references to `mixpanel.dev.js` should become `mixpanel.js` (the library source) or `mixpanel.min.js` (the minified library for production use).

## Running tests
- Install development dependencies: `npm install`
- Start test server: `npm start`
- Browse to [http://localhost:3000/tests/](http://localhost:3000/tests/) and choose a scenario to run

In the future we plan to automate the last step with a headless browser to streamline development (although
Mixpanel production releases are tested against a large matrix of browsers and operating systems).

## Thanks
For patches and support: @dehau, @drubin, @mogstad, @pfhayes, @sandorfr, @D1plo1d, @bohanyang
