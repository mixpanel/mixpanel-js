**2.22.4** (1 Jun 2018)
- Ensure GDPR cookies are always cleared when possible

**2.22.3** (25 May 2018)
- Bugfix for previous patch

**2.22.2** (25 May 2018)
- Allow GDPR utils to use localStorage instead of cookies

**2.22.1** (22 May 2018)
- Add `xhr_headers` config option for sending extra headers with each request (thanks @austince)

**2.22.0** (3 May 2018)
- Add `cookie_prefix` option to GDPR opt-out utils, allowing customization of cookie name
- Automatically delete user profile and charge data on GDPR opt-out (if specified)

**2.21.0** (20 Apr 2018)
- Add set of opt in/out utility methods in preparation for GDPR
  See https://mixpanel.com/help/reference/javascript-full-api-reference for details

**2.20.0** (6 Apr 2018)
- Remove obsolete autotrack event count metrics

**2.19.0** (21 Mar 2018)
- Clean up handling of JSONDecode errors (thanks @pkaminski)
- Expand server-side `window` polyfill for loading the lib without errors in Node.js

**2.18.0** (27 Feb 2018)
- Prevent Autotrack collecting attrs from input, textarea, select, contenteditable elements
- Change Autotrack $el_text property to not contain text of the target element's children

**2.17.0** (2 Feb 2018)
- Bug fix for Autotrack inadvertently removing form.inputs in certain cases

**2.16.0** (1 Feb 2018)
- Prevent Autotrack collecting attrs from password or hidden fields

**2.15.0** (17 Jan 2018)
- Always track over HTTPS.

**2.14.0** (10 Nov 2017)
- Add `people.unset()`
- Identify Chrome OS (for $os property)
- Bugfix: `register_once()` no longer overwrites previously-registered but falsey values
- Stub parts of DOM API when loading in non-browser environments (thanks @gfx)
- Log full "Implementation error" exceptions when DEBUG mode is on

**2.13.0** (25 Jul 2017)
- Update autotrack editor js path to reflect asset restructuring

**2.12.0** (17 Apr 2017)
- Remove "decide_host" config option
- Bug fix for autotrack editor path

**2.11.1** (14 Apr 2017)
- Autotrack bug fixes

**2.11.0** (16 Feb 2017)
- Remove autotrack backoff functionality

**2.10.0** (19 Jan 2017)
- Identify UC Browser automatically

**2.9.17** (8 Dec 2016)
- In-app notifications now fetch pre-sanitized/url-encoded URLs from the Mixpanel API

**2.9.16** (5 Oct 2016)
Autotrack:
- Bugfix: Check tagNames instead of element references

**2.9.15** (28 Sep 2016)
Autotrack:
- Bugfix: Handle SVG class names properly, remove appHost param

**2.9.14** (23 Aug 2016)
Autotrack:
- Bugfix: Pass appHost from the editor entry so the editor always uses the right appHost

**2.9.13** (23 Aug 2016)
Autotrack:
- Bugfix: Only allow one instance of autotrack to be enabled per project token

**2.9.11/12** (20 Aug 2016)
Autotrack:
- Bugfix: Revert delay navigation changes introduced in 2.9.6

**2.9.10** (16 Aug 2016)
Autotrack:
- Bugfix: use indexOf instead of startsWith

**2.9.9** (16 Aug 2016)
Autotrack:
- Do not delay navigation when the href is just a hash

**2.9.8** (15 Aug 2016)
Autotrack:
- Properly handle getting class names from SVGs
- Add readOnly parameter for Autotrack editor
- Reconstruct Autotrack editor URL to avoid build issue
- More tests

**2.9.7** (11 Aug 2016)
Autotrack:
- Don't attach property keys of stripped values to events
- Tests

**2.9.6** (8 Aug 2016)
Autotrack:
- Delay navigation on link clicks for better tracking

**2.9.5** (27 Jul 2016)
- Autotrack: remove dependency on nearestInteractiveElement and fix a few autotrack edge cases

**2.9.4** (22 Jul 2016)
- Cookie setting fix: return cookie setting function to its previous functionality of using days instead of seconds

**2.9.3** (19 Jul 2016)
- Autotrack: small tweaks

**2.9.2** (19 Jul 2016)
- Autotrack: enabled by default for 100% of projects (still no automatic data collection however)

**2.9.1** (19 Jul 2016)
- Autotrack: enabled by default for 25% of projects (still no automatic data collection however)

**2.9.0** (19 Jul 2016)
- Autotrack: easy and automatic data collection (disabled by default)

**2.8.2** (12 Jul 2016)
- reduce internal stats collection

**2.8.1** (7 Jun 2016)
- make `people` methods queue again between `reset()` and `identify()`

**2.8.0** (6 Jun 2016)
- Collect everything dev
- `track_links()` and `track_forms()` can now take raw elements or element lists in addition to query selectors
- add `reset()` method to handle logout flow (thanks @stefansedich)
- catch exceptions during `_send_request()` (thanks @feychenie)
- fix user agent detection/reporting for Chrome iOS and Firefox iOS

**2.7.3 - 2.7.9** (9 Mar 2016)
- collect stats for internal capacity planning

**2.7.2** (4 Dec 2015)
- full support for NPM installation

**2.7.1** (9 Oct 2015)
- `property_blacklist` config option to prevent sending specified props in `track()`

**2.7.0** (2 Oct 2015)
- support for snippetless synchronous loading via Browserify/Webpack/RequireJS/etc.

**2.6.3** (11 Sep 2015)
- better Windows Phone detection
- enable JS strict mode

**2.6.2** (11 Aug 2015)
- fix relative URL handling in snippet loader

**2.6.1** (7 Aug 2015)
- improve browser/OS detection for MS Edge and IE Mobile (thanks @bohanyang) and Opera
- handle relative URLs better in snippet loader

**2.6.0** (5 Aug 2015)
- add `time_event` method
- update snippet to load mixpanel correctly from cdn when file is opened locally

**2.5.2** (7 Jul 2015)
- automatically track current url
- expose info.properties

**2.5.1** (11 May 2015)
- automatically track browser version (thanks @D1plo1d)

**2.5.0** (5 May 2015)
- add support for localStorage alternative to cookie store (thanks to @sandorfr for initial PR)
- automatically upgrade from existing cookies when localStorage is used

**2.4.2** (23 Mar 2015)
- remove (undocumented) `token` property override in `track()`

**2.4.1** (12 Mar 2015)
- fix for minification issue in `track()` colliding `token` and `ad`

**2.4.0** (10 Mar 2015)
- add `people.union()` (thanks @mogstad)
- remove refs to global RegExp object

**2.3.6** (20 Feb 2015)
- Bower support (thanks @dehau)

**2.3.5** (18 Feb 2015)
- notification caching fix

**2.3.4** (17 Feb 2015)
- ensure notification-tracking on dismissal

**2.3.3** (17 Feb 2015)
- fix Control-click with `track_links()` on Windows/Linux (thanks @pfhayes, [https://github.com/mixpanel/mixpanel-js/issues/20](https://github.com/mixpanel/mixpanel-js/issues/20))

**2.3.2** (9 Dec 2014)
- add `resource_type` to notification-tracking

**2.3.1** (24 Nov 2014)
- fix error when calling `identify()` with no `distinct_id`

**2.3.0** (13 Nov 2014)
- web notifications support
