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
