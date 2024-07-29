---
category: 62ec0192a94ae90a45602b13
title: JavaScript Full API Reference
---


# mixpanel


___
## mixpanel.add_group
Add a new group for this user.


### Usage:

```javascript
 mixpanel.add_group('company', 'mixpanel')
```



| Argument | Type | Description |
| ------------- | ------------- | ----- |
| **group_key** | <span class="mp-arg-type">String</span></br></span><span class="mp-arg-required">required</span> | Group key |
| **group_id** | <span class="mp-arg-type">any</span></br></span><span class="mp-arg-required">required</span> | A valid Mixpanel property type |
| **callback** | <span class="mp-arg-type">Function</span></br></span><span class="mp-arg-optional">optional</span> | If provided, the callback will be called after tracking the event. |


___
## mixpanel.alias
The alias method creates an alias which Mixpanel will use to  remap one id to another. Multiple aliases can point to the  same identifier.

The following is a valid use of alias:


```javascript
mixpanel.alias('new_id', 'existing_id');
// You can add multiple id aliases to the existing ID
mixpanel.alias('newer_id', 'existing_id');

```

Aliases can also be chained - the following is a valid example:


```javascript
mixpanel.alias('new_id', 'existing_id');
// chain newer_id - new_id - existing_id
mixpanel.alias('newer_id', 'new_id');

```

Aliases cannot point to multiple identifiers - the following  example will not work:


```javascript
mixpanel.alias('new_id', 'existing_id');
// this is invalid as 'new_id' already points to 'existing_id'
mixpanel.alias('new_id', 'newer_id');

```



### Notes:
If your project does not have  <a href="https://help.mixpanel.com/hc/en-us/articles/360039133851">ID Merge</a>  enabled, the best practice is to call alias once when a unique  ID is first created for a user (e.g., when a user first registers  for an account). Do not use alias multiple times for a single  user without ID Merge enabled.


| Argument | Type | Description |
| ------------- | ------------- | ----- |
| **alias** | <span class="mp-arg-type">String</span></br></span><span class="mp-arg-required">required</span> | A unique identifier that you want to use for this user in the future. |
| **original** | <span class="mp-arg-type">String</span></br></span><span class="mp-arg-optional">optional</span> | The current identifier being used for this user. |


___
## mixpanel.clear_opt_in_out_tracking
Clear the user's opt in/out status of data tracking and cookies/localstorage for this Mixpanel instance


### Usage:

```javascript
// clear user's opt-in/out status
mixpanel.clear_opt_in_out_tracking();

// clear user's opt-in/out status with specific cookie configuration - should match
// configuration used when opt_in_tracking/opt_out_tracking methods were called.
mixpanel.clear_opt_in_out_tracking({
    cookie_expiration: 30,
    secure_cookie: true
});
```



| Argument | Type | Description |
| ------------- | ------------- | ----- |
| **options** | <span class="mp-arg-type">Object</span></br></span><span class="mp-arg-optional">optional</span> | A dictionary of config options to override |
| **options.enable_persistence=true** | <span class="mp-arg-type">boolean</span></br></span><span class="mp-arg-optional">optional</span> | If true, will re-enable sdk persistence |
| **options.persistence_type=localStorage** | <span class="mp-arg-type">string</span></br></span><span class="mp-arg-optional">optional</span> | Persistence mechanism used - cookie or localStorage - falls back to cookie if localStorage is unavailable |
| **options.cookie_prefix=__mp_opt_in_out** | <span class="mp-arg-type">string</span></br></span><span class="mp-arg-optional">optional</span> | Custom prefix to be used in the cookie/localstorage name |
| **options.cookie_expiration** | <span class="mp-arg-type">Number</span></br></span><span class="mp-arg-optional">optional</span> | Number of days until the opt-in cookie expires (overrides value specified in this Mixpanel instance's config) |
| **options.cookie_domain** | <span class="mp-arg-type">string</span></br></span><span class="mp-arg-optional">optional</span> | Custom cookie domain (overrides value specified in this Mixpanel instance's config) |
| **options.cross_site_cookie** | <span class="mp-arg-type">boolean</span></br></span><span class="mp-arg-optional">optional</span> | Whether the opt-in cookie is set as cross-site-enabled (overrides value specified in this Mixpanel instance's config) |
| **options.cross_subdomain_cookie** | <span class="mp-arg-type">boolean</span></br></span><span class="mp-arg-optional">optional</span> | Whether the opt-in cookie is set as cross-subdomain or not (overrides value specified in this Mixpanel instance's config) |
| **options.secure_cookie** | <span class="mp-arg-type">boolean</span></br></span><span class="mp-arg-optional">optional</span> | Whether the opt-in cookie is set as secure or not (overrides value specified in this Mixpanel instance's config) |


___
## mixpanel.disable
Disable events on the Mixpanel object. If passed no arguments,  this function disables tracking of any event. If passed an  array of event names, those events will be disabled, but other  events will continue to be tracked.

Note: this function does not stop other mixpanel functions from  firing, such as register() or people.set().




| Argument | Type | Description |
| ------------- | ------------- | ----- |
| **events** | <span class="mp-arg-type">Array</span></br></span><span class="mp-arg-optional">optional</span> | An array of event names to disable |


___
## mixpanel.get_config
returns the current config object for the library.





___
## mixpanel.get_distinct_id
Returns the current distinct id of the user. This is either the id automatically  generated by the library or the id that has been passed by a call to identify().



### Notes:
get_distinct_id() can only be called after the Mixpanel library has finished loading.  init() has a loaded function available to handle this automatically. For example:


```javascript
// set distinct_id after the mixpanel library has loaded
mixpanel.init('YOUR PROJECT TOKEN', {
    loaded: function(mixpanel) {
        distinct_id = mixpanel.get_distinct_id();
    }
});
```



___
## mixpanel.get_group
Look up reference to a Mixpanel group


### Usage:

```javascript
  mixpanel.get_group(group_key, group_id)
```



| Argument | Type | Description |
| ------------- | ------------- | ----- |
| **group_key** | <span class="mp-arg-type">String</span></br></span><span class="mp-arg-required">required</span> | Group key |
| **group_id** | <span class="mp-arg-type">Object</span></br></span><span class="mp-arg-required">required</span> | A valid Mixpanel property type |
#### Returns:
| Type | Description |
| ----- | ------------- |
| <span class="mp-arg-type">Object</span> | A MixpanelGroup identifier |


___
## mixpanel.get_property
Returns the value of the super property named property_name. If no such  property is set, get_property() will return the undefined value.



### Notes:
get_property() can only be called after the Mixpanel library has finished loading.  init() has a loaded function available to handle this automatically. For example:


```javascript
// grab value for 'user_id' after the mixpanel library has loaded
mixpanel.init('YOUR PROJECT TOKEN', {
    loaded: function(mixpanel) {
        user_id = mixpanel.get_property('user_id');
    }
});
```


| Argument | Type | Description |
| ------------- | ------------- | ----- |
| **property_name** | <span class="mp-arg-type">String</span></br></span><span class="mp-arg-required">required</span> | The name of the super property you want to retrieve |


___
## mixpanel.has_opted_in_tracking
Check whether the user has opted in to data tracking and cookies/localstorage for this Mixpanel instance


### Usage:

```javascript
var has_opted_in = mixpanel.has_opted_in_tracking();
// use has_opted_in value
```



| Argument | Type | Description |
| ------------- | ------------- | ----- |
| **options** | <span class="mp-arg-type">Object</span></br></span><span class="mp-arg-optional">optional</span> | A dictionary of config options to override |
| **options.persistence_type=localStorage** | <span class="mp-arg-type">string</span></br></span><span class="mp-arg-optional">optional</span> | Persistence mechanism used - cookie or localStorage - falls back to cookie if localStorage is unavailable |
| **options.cookie_prefix=__mp_opt_in_out** | <span class="mp-arg-type">string</span></br></span><span class="mp-arg-optional">optional</span> | Custom prefix to be used in the cookie/localstorage name |
#### Returns:
| Type | Description |
| ----- | ------------- |
| <span class="mp-arg-type">boolean</span> | current opt-in status |


___
## mixpanel.has_opted_out_tracking
Check whether the user has opted out of data tracking and cookies/localstorage for this Mixpanel instance


### Usage:

```javascript
var has_opted_out = mixpanel.has_opted_out_tracking();
// use has_opted_out value
```



| Argument | Type | Description |
| ------------- | ------------- | ----- |
| **options** | <span class="mp-arg-type">Object</span></br></span><span class="mp-arg-optional">optional</span> | A dictionary of config options to override |
| **options.persistence_type=localStorage** | <span class="mp-arg-type">string</span></br></span><span class="mp-arg-optional">optional</span> | Persistence mechanism used - cookie or localStorage - falls back to cookie if localStorage is unavailable |
| **options.cookie_prefix=__mp_opt_in_out** | <span class="mp-arg-type">string</span></br></span><span class="mp-arg-optional">optional</span> | Custom prefix to be used in the cookie/localstorage name |
#### Returns:
| Type | Description |
| ----- | ------------- |
| <span class="mp-arg-type">boolean</span> | current opt-out status |


___
## mixpanel.identify
Identify a user with a unique ID to track user activity across  devices, tie a user to their events, and create a user profile.  If you never call this method, unique visitors are tracked using  a UUID generated the first time they visit the site.

Call identify when you know the identity of the current user,  typically after login or signup. We recommend against using  identify for anonymous visitors to your site.



### Notes:
If your project has  <a href="https://help.mixpanel.com/hc/en-us/articles/360039133851">ID Merge</a>  enabled, the identify method will connect pre- and  post-authentication events when appropriate.

If your project does not have ID Merge enabled, identify will  change the user's local distinct_id to the unique ID you pass.  Events tracked prior to authentication will not be connected  to the same user identity. If ID Merge is disabled, alias can  be used to connect pre- and post-registration events.


| Argument | Type | Description |
| ------------- | ------------- | ----- |
| **unique_id** | <span class="mp-arg-type">String</span></br></span><span class="mp-arg-optional">optional</span> | A string that uniquely identifies a user. If not provided, the distinct_id currently in the persistent store (cookie or localStorage) will be used. |


___
## mixpanel.init
This function initializes a new instance of the Mixpanel tracking object.  All new instances are added to the main mixpanel object as sub properties (such as  mixpanel.library_name) and also returned by this function. To define a  second instance on the page, you would call:


```javascript
mixpanel.init('new token', { your: 'config' }, 'library_name');

```

and use it like so:


```javascript
mixpanel.library_name.track(...);
```




| Argument | Type | Description |
| ------------- | ------------- | ----- |
| **token** | <span class="mp-arg-type">String</span></br></span><span class="mp-arg-required">required</span> | Your Mixpanel API token |
| **config** | <span class="mp-arg-type">Object</span></br></span><span class="mp-arg-optional">optional</span> | A dictionary of config options to override. <a href="https://github.com/mixpanel/mixpanel-js/blob/v2.46.0/src/mixpanel-core.js#L88-L127">See a list of default config options</a>. |
| **name** | <span class="mp-arg-type">String</span></br></span><span class="mp-arg-optional">optional</span> | The name for the new mixpanel instance that you want created |


___
## mixpanel.opt_in_tracking
Opt the user in to data tracking and cookies/localstorage for this Mixpanel instance


### Usage:

```javascript
// opt user in
mixpanel.opt_in_tracking();

// opt user in with specific event name, properties, cookie configuration
mixpanel.opt_in_tracking({
    track_event_name: 'User opted in',
    track_event_properties: {
        'Email': 'jdoe@example.com'
    },
    cookie_expiration: 30,
    secure_cookie: true
});
```



| Argument | Type | Description |
| ------------- | ------------- | ----- |
| **options** | <span class="mp-arg-type">Object</span></br></span><span class="mp-arg-optional">optional</span> | A dictionary of config options to override |
| **options.track** | <span class="mp-arg-type">function</span></br></span><span class="mp-arg-optional">optional</span> | Function used for tracking a Mixpanel event to record the opt-in action (default is this Mixpanel instance's track method) |
| **options.track_event_name=$opt_in** | <span class="mp-arg-type">string</span></br></span><span class="mp-arg-optional">optional</span> | Event name to be used for tracking the opt-in action |
| **options.track_properties** | <span class="mp-arg-type">Object</span></br></span><span class="mp-arg-optional">optional</span> | Set of properties to be tracked along with the opt-in action |
| **options.enable_persistence=true** | <span class="mp-arg-type">boolean</span></br></span><span class="mp-arg-optional">optional</span> | If true, will re-enable sdk persistence |
| **options.persistence_type=localStorage** | <span class="mp-arg-type">string</span></br></span><span class="mp-arg-optional">optional</span> | Persistence mechanism used - cookie or localStorage - falls back to cookie if localStorage is unavailable |
| **options.cookie_prefix=__mp_opt_in_out** | <span class="mp-arg-type">string</span></br></span><span class="mp-arg-optional">optional</span> | Custom prefix to be used in the cookie/localstorage name |
| **options.cookie_expiration** | <span class="mp-arg-type">Number</span></br></span><span class="mp-arg-optional">optional</span> | Number of days until the opt-in cookie expires (overrides value specified in this Mixpanel instance's config) |
| **options.cookie_domain** | <span class="mp-arg-type">string</span></br></span><span class="mp-arg-optional">optional</span> | Custom cookie domain (overrides value specified in this Mixpanel instance's config) |
| **options.cross_site_cookie** | <span class="mp-arg-type">boolean</span></br></span><span class="mp-arg-optional">optional</span> | Whether the opt-in cookie is set as cross-site-enabled (overrides value specified in this Mixpanel instance's config) |
| **options.cross_subdomain_cookie** | <span class="mp-arg-type">boolean</span></br></span><span class="mp-arg-optional">optional</span> | Whether the opt-in cookie is set as cross-subdomain or not (overrides value specified in this Mixpanel instance's config) |
| **options.secure_cookie** | <span class="mp-arg-type">boolean</span></br></span><span class="mp-arg-optional">optional</span> | Whether the opt-in cookie is set as secure or not (overrides value specified in this Mixpanel instance's config) |


___
## mixpanel.opt_out_tracking
Opt the user out of data tracking and cookies/localstorage for this Mixpanel instance


### Usage:

```javascript
// opt user out
mixpanel.opt_out_tracking();

// opt user out with different cookie configuration from Mixpanel instance
mixpanel.opt_out_tracking({
    cookie_expiration: 30,
    secure_cookie: true
});
```



| Argument | Type | Description |
| ------------- | ------------- | ----- |
| **options** | <span class="mp-arg-type">Object</span></br></span><span class="mp-arg-optional">optional</span> | A dictionary of config options to override |
| **options.delete_user=true** | <span class="mp-arg-type">boolean</span></br></span><span class="mp-arg-optional">optional</span> | If true, will delete the currently identified user's profile and clear all charges after opting the user out |
| **options.clear_persistence=true** | <span class="mp-arg-type">boolean</span></br></span><span class="mp-arg-optional">optional</span> | If true, will delete all data stored by the sdk in persistence |
| **options.persistence_type=localStorage** | <span class="mp-arg-type">string</span></br></span><span class="mp-arg-optional">optional</span> | Persistence mechanism used - cookie or localStorage - falls back to cookie if localStorage is unavailable |
| **options.cookie_prefix=__mp_opt_in_out** | <span class="mp-arg-type">string</span></br></span><span class="mp-arg-optional">optional</span> | Custom prefix to be used in the cookie/localstorage name |
| **options.cookie_expiration** | <span class="mp-arg-type">Number</span></br></span><span class="mp-arg-optional">optional</span> | Number of days until the opt-in cookie expires (overrides value specified in this Mixpanel instance's config) |
| **options.cookie_domain** | <span class="mp-arg-type">string</span></br></span><span class="mp-arg-optional">optional</span> | Custom cookie domain (overrides value specified in this Mixpanel instance's config) |
| **options.cross_site_cookie** | <span class="mp-arg-type">boolean</span></br></span><span class="mp-arg-optional">optional</span> | Whether the opt-in cookie is set as cross-site-enabled (overrides value specified in this Mixpanel instance's config) |
| **options.cross_subdomain_cookie** | <span class="mp-arg-type">boolean</span></br></span><span class="mp-arg-optional">optional</span> | Whether the opt-in cookie is set as cross-subdomain or not (overrides value specified in this Mixpanel instance's config) |
| **options.secure_cookie** | <span class="mp-arg-type">boolean</span></br></span><span class="mp-arg-optional">optional</span> | Whether the opt-in cookie is set as secure or not (overrides value specified in this Mixpanel instance's config) |


___
## mixpanel.push
push() keeps the standard async-array-push  behavior around after the lib is loaded.  This is only useful for external integrations that  do not wish to rely on our convenience methods  (created in the snippet).


### Usage:

```javascript
mixpanel.push(['register', { a: 'b' }]);
```



| Argument | Type | Description |
| ------------- | ------------- | ----- |
| **item** | <span class="mp-arg-type">Array</span></br></span><span class="mp-arg-required">required</span> | A [function_name, args...] array to be executed |


___
## mixpanel.register
Register a set of super properties, which are included with all  events. This will overwrite previous super property values.


### Usage:

```javascript
// register 'Gender' as a super property
mixpanel.register({'Gender': 'Female'});

// register several super properties when a user signs up
mixpanel.register({
    'Email': 'jdoe@example.com',
    'Account Type': 'Free'
});

// register only for the current pageload
mixpanel.register({'Name': 'Pat'}, {persistent: false});
```



| Argument | Type | Description |
| ------------- | ------------- | ----- |
| **properties** | <span class="mp-arg-type">Object</span></br></span><span class="mp-arg-required">required</span> | An associative array of properties to store about the user |
| **days_or_options** | <span class="mp-arg-type">Number or Object</span></br></span><span class="mp-arg-optional">optional</span> | Options object or number of days since the user's last visit to store the super properties (only valid for persisted props) |
| **days_or_options.days** | <span class="mp-arg-type">boolean</span></br></span><span class="mp-arg-optional">optional</span> | <ul>
<li>number of days since the user's last visit to store the super properties (only valid for persisted props)</li>
</ul> |
| **days_or_options.persistent=true** | <span class="mp-arg-type">boolean</span></br></span><span class="mp-arg-optional">optional</span> | <ul>
<li>whether to put in persistent storage (cookie/localStorage)</li>
</ul> |


___
## mixpanel.register_once
Register a set of super properties only once. This will not  overwrite previous super property values, unlike register().


### Usage:

```javascript
// register a super property for the first time only
mixpanel.register_once({
    'First Login Date': new Date().toISOString()
});

// register once, only for the current pageload
mixpanel.register_once({
    'First interaction time': new Date().toISOString()
}, 'None', {persistent: false});

```


### Notes:
If default_value is specified, current super properties  with that value will be overwritten.


| Argument | Type | Description |
| ------------- | ------------- | ----- |
| **properties** | <span class="mp-arg-type">Object</span></br></span><span class="mp-arg-required">required</span> | An associative array of properties to store about the user |
| **default_value** | <span class="mp-arg-type">any</span></br></span><span class="mp-arg-optional">optional</span> | Value to override if already set in super properties (ex: 'False') Default: 'None' |
| **days_or_options** | <span class="mp-arg-type">Number or Object</span></br></span><span class="mp-arg-optional">optional</span> | Options object or number of days since the user's last visit to store the super properties (only valid for persisted props) |
| **days_or_options.days** | <span class="mp-arg-type">boolean</span></br></span><span class="mp-arg-optional">optional</span> | <ul>
<li>number of days since the user's last visit to store the super properties (only valid for persisted props)</li>
</ul> |
| **days_or_options.persistent=true** | <span class="mp-arg-type">boolean</span></br></span><span class="mp-arg-optional">optional</span> | <ul>
<li>whether to put in persistent storage (cookie/localStorage)</li>
</ul> |


___
## mixpanel.remove_group
Remove a group from this user.


### Usage:

```javascript
 mixpanel.remove_group('company', 'mixpanel')
```



| Argument | Type | Description |
| ------------- | ------------- | ----- |
| **group_key** | <span class="mp-arg-type">String</span></br></span><span class="mp-arg-required">required</span> | Group key |
| **group_id** | <span class="mp-arg-type">any</span></br></span><span class="mp-arg-required">required</span> | A valid Mixpanel property type |
| **callback** | <span class="mp-arg-type">Function</span></br></span><span class="mp-arg-optional">optional</span> | If provided, the callback will be called after tracking the event. |


___
## mixpanel.reset
Clears super properties and generates a new random distinct_id for this instance.  Useful for clearing data when a user logs out.





___
## mixpanel.set_config
Update the configuration of a mixpanel library instance.

The default config is:


```javascript
{
  // host for requests (customizable for e.g. a local proxy)
  api_host: 'https://api-js.mixpanel.com',

  // endpoints for different types of requests
  api_routes: {
    track: 'track/',
    engage: 'engage/',
    groups: 'groups/',
  },

  // HTTP method for tracking requests
  api_method: 'POST',

  // transport for sending requests ('XHR' or 'sendBeacon')
  // NB: sendBeacon should only be used for scenarios such as
  // page unload where a &quot;best-effort&quot; attempt to send is
  // acceptable; the sendBeacon API does not support callbacks
  // or any way to know the result of the request. Mixpanel
  // tracking via sendBeacon will not support any event-
  // batching or retry mechanisms.
  api_transport: 'XHR',

  // request-batching/queueing/retry
  batch_requests: true,

  // maximum number of events/updates to send in a single
  // network request
  batch_size: 50,

  // milliseconds to wait between sending batch requests
  batch_flush_interval_ms: 5000,

  // milliseconds to wait for network responses to batch requests
  // before they are considered timed-out and retried
  batch_request_timeout_ms: 90000,

  // override value for cookie domain, only useful for ensuring
  // correct cross-subdomain cookies on unusual domains like
  // subdomain.mainsite.avocat.fr; NB this cannot be used to
  // set cookies on a different domain than the current origin
  cookie_domain: '',

  // super properties cookie expiration (in days)
  cookie_expiration: 365,

  // if true, cookie will be set with SameSite=None; Secure
  // this is only useful in special situations, like embedded
  // 3rd-party iframes that set up a Mixpanel instance
  cross_site_cookie: false,

  // super properties span subdomains
  cross_subdomain_cookie: true,

  // debug mode
  debug: false,

  // if this is true, the mixpanel cookie or localStorage entry
  // will be deleted, and no user persistence will take place
  disable_persistence: false,

  // if this is true, Mixpanel will automatically determine
  // City, Region and Country data using the IP address of
  // the client
  ip: true,

  // opt users out of tracking by this Mixpanel instance by default
  opt_out_tracking_by_default: false,

  // opt users out of browser data storage by this Mixpanel instance by default
  opt_out_persistence_by_default: false,

  // persistence mechanism used by opt-in/opt-out methods - cookie
  // or localStorage - falls back to cookie if localStorage is unavailable
  opt_out_tracking_persistence_type: 'localStorage',

  // customize the name of cookie/localStorage set by opt-in/opt-out methods
  opt_out_tracking_cookie_prefix: null,

  // type of persistent store for super properties (cookie/
  // localStorage) if set to 'localStorage', any existing
  // mixpanel cookie value with the same persistence_name
  // will be transferred to localStorage and deleted
  persistence: 'cookie',

  // name for super properties persistent store
  persistence_name: '',

  // names of properties/superproperties which should never
  // be sent with track() calls
  property_blacklist: [],

  // if this is true, mixpanel cookies will be marked as
  // secure, meaning they will only be transmitted over https
  secure_cookie: false,

  // disables enriching user profiles with first touch marketing data
  skip_first_touch_marketing: false,

  // the amount of time track_links will
  // wait for Mixpanel's servers to respond
  track_links_timeout: 300,

  // adds any UTM parameters and click IDs present on the page to any events fired
  track_marketing: true,

  // enables automatic page view tracking using default page view events through
  // the track_pageview() method
  track_pageview: false,

  // if you set upgrade to be true, the library will check for
  // a cookie from our old js library and import super
  // properties from it, then the old cookie is deleted
  // The upgrade config option only works in the initialization,
  // so make sure you set it when you create the library.
  upgrade: false,

  // extra HTTP request headers to set for each API request, in
  // the format {'Header-Name': value}
  xhr_headers: {},

  // whether to ignore or respect the web browser's Do Not Track setting
  ignore_dnt: false
}
```




| Argument | Type | Description |
| ------------- | ------------- | ----- |
| **config** | <span class="mp-arg-type">Object</span></br></span><span class="mp-arg-required">required</span> | A dictionary of new configuration values to update |


___
## mixpanel.set_group
Register the current user into one/many groups.


### Usage:

```javascript
 mixpanel.set_group('company', ['mixpanel', 'google']) // an array of IDs
 mixpanel.set_group('company', 'mixpanel')
 mixpanel.set_group('company', 128746312)
```



| Argument | Type | Description |
| ------------- | ------------- | ----- |
| **group_key** | <span class="mp-arg-type">String</span></br></span><span class="mp-arg-required">required</span> | Group key |
| **group_ids** | <span class="mp-arg-type">Array or String or Number</span></br></span><span class="mp-arg-required">required</span> | An array of group IDs, or a singular group ID |
| **callback** | <span class="mp-arg-type">Function</span></br></span><span class="mp-arg-optional">optional</span> | If provided, the callback will be called after tracking the event. |


___
## mixpanel.time_event
Time an event by including the time between this call and a  later 'track' call for the same event in the properties sent  with the event.


### Usage:

```javascript
// time an event named 'Registered'
mixpanel.time_event('Registered');
mixpanel.track('Registered', {'Gender': 'Male', 'Age': 21});

```

When called for a particular event name, the next track call for that event  name will include the elapsed time between the 'time_event' and 'track'  calls. This value is stored as seconds in the '$duration' property.



| Argument | Type | Description |
| ------------- | ------------- | ----- |
| **event_name** | <span class="mp-arg-type">String</span></br></span><span class="mp-arg-required">required</span> | The name of the event. |


___
## mixpanel.track
Track an event. This is the most important and  frequently used Mixpanel function.


### Usage:

```javascript
// track an event named 'Registered'
mixpanel.track('Registered', {'Gender': 'Male', 'Age': 21});

// track an event using navigator.sendBeacon
mixpanel.track('Left page', {'duration_seconds': 35}, {transport: 'sendBeacon'});

```

To track link clicks or form submissions, see track_links() or track_forms().



| Argument | Type | Description |
| ------------- | ------------- | ----- |
| **event_name** | <span class="mp-arg-type">String</span></br></span><span class="mp-arg-required">required</span> | The name of the event. This can be anything the user does - 'Button Click', 'Sign Up', 'Item Purchased', etc. |
| **properties** | <span class="mp-arg-type">Object</span></br></span><span class="mp-arg-optional">optional</span> | A set of properties to include with the event you're sending. These describe the user who did the event or details about the event itself. |
| **options** | <span class="mp-arg-type">Object</span></br></span><span class="mp-arg-optional">optional</span> | Optional configuration for this track request. |
| **options.transport** | <span class="mp-arg-type">String</span></br></span><span class="mp-arg-optional">optional</span> | Transport method for network request ('xhr' or 'sendBeacon'). |
| **options.send_immediately** | <span class="mp-arg-type">Boolean</span></br></span><span class="mp-arg-optional">optional</span> | Whether to bypass batching/queueing and send track request immediately. |
| **callback** | <span class="mp-arg-type">Function</span></br></span><span class="mp-arg-optional">optional</span> | If provided, the callback function will be called after tracking the event. |
#### Returns:
| Type | Description |
| ----- | ------------- |
| <span class="mp-arg-type">Boolean or Object</span> | If the tracking request was successfully initiated/queued, an object with the tracking payload sent to the API server is returned; otherwise false. |


___
## mixpanel.track_forms
Track form submissions. Selector must be a valid query.


### Usage:

```javascript
// track submission for form id 'register'
mixpanel.track_forms('#register', 'Created Account');

```


### Notes:
This function will wait up to 300 ms for the mixpanel  servers to respond, if they have not responded by that time  it will head to the link without ensuring that your event  has been tracked.  To configure this timeout please see the  set_config() documentation below.

If you pass a function in as the properties argument, the  function will receive the DOMElement that triggered the  event as an argument.  You are expected to return an object  from the function; any properties defined on this object  will be sent to mixpanel as event properties.


| Argument | Type | Description |
| ------------- | ------------- | ----- |
| **query** | <span class="mp-arg-type">Object or String</span></br></span><span class="mp-arg-required">required</span> | A valid DOM query, element or jQuery-esque list |
| **event_name** | <span class="mp-arg-type">String</span></br></span><span class="mp-arg-required">required</span> | The name of the event to track |
| **properties** | <span class="mp-arg-type">Object or Function</span></br></span><span class="mp-arg-optional">optional</span> | This can be a set of properties, or a function that returns a set of properties after being passed a DOMElement |


___
## mixpanel.track_links
Track clicks on a set of document elements. Selector must be a  valid query. Elements must exist on the page at the time track_links is called.


### Usage:

```javascript
// track click for link id #nav
mixpanel.track_links('#nav', 'Clicked Nav Link');

```


### Notes:
This function will wait up to 300 ms for the Mixpanel  servers to respond. If they have not responded by that time  it will head to the link without ensuring that your event  has been tracked.  To configure this timeout please see the  set_config() documentation below.

If you pass a function in as the properties argument, the  function will receive the DOMElement that triggered the  event as an argument.  You are expected to return an object  from the function; any properties defined on this object  will be sent to mixpanel as event properties.


| Argument | Type | Description |
| ------------- | ------------- | ----- |
| **query** | <span class="mp-arg-type">Object or String</span></br></span><span class="mp-arg-required">required</span> | A valid DOM query, element or jQuery-esque list |
| **event_name** | <span class="mp-arg-type">String</span></br></span><span class="mp-arg-required">required</span> | The name of the event to track |
| **properties** | <span class="mp-arg-type">Object or Function</span></br></span><span class="mp-arg-optional">optional</span> | A properties object or function that returns a dictionary of properties when passed a DOMElement |


___
## mixpanel.track_pageview
Track a default Mixpanel page view event, which includes extra default event properties to  improve page view data.


### Usage:

```javascript
// track a default $mp_web_page_view event
mixpanel.track_pageview();

// track a page view event with additional event properties
mixpanel.track_pageview({'ab_test_variant': 'card-layout-b'});

// example approach to track page views on different page types as event properties
mixpanel.track_pageview({'page': 'pricing'});
mixpanel.track_pageview({'page': 'homepage'});

// UNCOMMON: Tracking a page view event with a custom event_name option. NOT expected to be used for
// individual pages on the same site or product. Use cases for custom event_name may be page
// views on different products or internal applications that are considered completely separate
mixpanel.track_pageview({'page': 'customer-search'}, {'event_name': '[internal] Admin Page View'});

```


### Notes:
The <code>config.track_pageview</code> option for <a href="#mixpanelinit">mixpanel.init()</a>  may be turned on for tracking page loads automatically.


```javascript
// track only page loads
mixpanel.init(PROJECT_TOKEN, {track_pageview: true});

// track when the URL changes in any manner
mixpanel.init(PROJECT_TOKEN, {track_pageview: 'full-url'});

// track when the URL changes, ignoring any changes in the hash part
mixpanel.init(PROJECT_TOKEN, {track_pageview: 'url-with-path-and-query-string'});

// track when the path changes, ignoring any query parameter or hash changes
mixpanel.init(PROJECT_TOKEN, {track_pageview: 'url-with-path'});
```


| Argument | Type | Description |
| ------------- | ------------- | ----- |
| **properties** | <span class="mp-arg-type">Object</span></br></span><span class="mp-arg-optional">optional</span> | An optional set of additional properties to send with the page view event |
| **options** | <span class="mp-arg-type">Object</span></br></span><span class="mp-arg-optional">optional</span> | Page view tracking options |
| **options.event_name** | <span class="mp-arg-type">String</span></br></span><span class="mp-arg-optional">optional</span> | <ul>
<li>Alternate name for the tracking event</li>
</ul> |
#### Returns:
| Type | Description |
| ----- | ------------- |
| <span class="mp-arg-type">Boolean or Object</span> | If the tracking request was successfully initiated/queued, an object with the tracking payload sent to the API server is returned; otherwise false. |


___
## mixpanel.track_with_groups
Track an event with specific groups.


### Usage:

```javascript
 mixpanel.track_with_groups('purchase', {'product': 'iphone'}, {'University': ['UCB', 'UCLA']})
```



| Argument | Type | Description |
| ------------- | ------------- | ----- |
| **event_name** | <span class="mp-arg-type">String</span></br></span><span class="mp-arg-required">required</span> | The name of the event (see <code>mixpanel.track()</code>) |
| **properties** | <span class="mp-arg-type">Object</span></br></span><span class="mp-arg-required">required</span> | A set of properties to include with the event you're sending (see <code>mixpanel.track()</code>) |
| **groups** | <span class="mp-arg-type">Object</span></br></span><span class="mp-arg-required">required</span> | An object mapping group name keys to one or more values |
| **callback** | <span class="mp-arg-type">Function</span></br></span><span class="mp-arg-optional">optional</span> | If provided, the callback will be called after tracking the event. |


___
## mixpanel.unregister
Delete a super property stored with the current user.




| Argument | Type | Description |
| ------------- | ------------- | ----- |
| **property** | <span class="mp-arg-type">String</span></br></span><span class="mp-arg-required">required</span> | The name of the super property to remove |
| **options** | <span class="mp-arg-type">Object</span></br></span><span class="mp-arg-optional">optional</span> |  |
| **options.persistent=true** | <span class="mp-arg-type">boolean</span></br></span><span class="mp-arg-optional">optional</span> | <ul>
<li>whether to look in persistent storage (cookie/localStorage)</li>
</ul> |



# mixpanel.people


___
## mixpanel.people.append
Append a value to a list-valued people analytics property.


### Usage:

```javascript
// append a value to a list, creating it if needed
mixpanel.people.append('pages_visited', 'homepage');

// like mixpanel.people.set(), you can append multiple
// properties at once:
mixpanel.people.append({
    list1: 'bob',
    list2: 123
});
```



| Argument | Type | Description |
| ------------- | ------------- | ----- |
| **list_name** | <span class="mp-arg-type">Object or String</span></br></span><span class="mp-arg-required">required</span> | If a string, this is the name of the property. If an object, this is an associative array of names and values. |
| **value** | <span class="mp-arg-type">any</span></br></span><span class="mp-arg-optional">optional</span> | value An item to append to the list |
| **callback** | <span class="mp-arg-type">Function</span></br></span><span class="mp-arg-optional">optional</span> | If provided, the callback will be called after tracking the event. |


___
## mixpanel.people.delete_user
Permanently deletes the current people analytics profile from  Mixpanel (using the current distinct_id).


### Usage:

```javascript
// remove the all data you have stored about the current user
mixpanel.people.delete_user();
```




___
## mixpanel.people.increment
Increment/decrement numeric people analytics properties.


### Usage:

```javascript
mixpanel.people.increment('page_views', 1);

// or, for convenience, if you're just incrementing a counter by
// 1, you can simply do
mixpanel.people.increment('page_views');

// to decrement a counter, pass a negative number
mixpanel.people.increment('credits_left', -1);

// like mixpanel.people.set(), you can increment multiple
// properties at once:
mixpanel.people.increment({
    counter1: 1,
    counter2: 6
});
```



| Argument | Type | Description |
| ------------- | ------------- | ----- |
| **prop** | <span class="mp-arg-type">Object or String</span></br></span><span class="mp-arg-required">required</span> | If a string, this is the name of the property. If an object, this is an associative array of names and numeric values. |
| **by** | <span class="mp-arg-type">Number</span></br></span><span class="mp-arg-optional">optional</span> | An amount to increment the given property |
| **callback** | <span class="mp-arg-type">Function</span></br></span><span class="mp-arg-optional">optional</span> | If provided, the callback will be called after tracking the event. |


___
## mixpanel.people.remove
Remove a value from a list-valued people analytics property.


### Usage:

```javascript
mixpanel.people.remove('School', 'UCB');
```



| Argument | Type | Description |
| ------------- | ------------- | ----- |
| **list_name** | <span class="mp-arg-type">Object or String</span></br></span><span class="mp-arg-required">required</span> | If a string, this is the name of the property. If an object, this is an associative array of names and values. |
| **value** | <span class="mp-arg-type">any</span></br></span><span class="mp-arg-optional">optional</span> | value Item to remove from the list |
| **callback** | <span class="mp-arg-type">Function</span></br></span><span class="mp-arg-optional">optional</span> | If provided, the callback will be called after tracking the event. |


___
## mixpanel.people.set
Set properties on a user record.


### Usage:

```javascript
mixpanel.people.set('gender', 'm');

// or set multiple properties at once
mixpanel.people.set({
    'Company': 'Acme',
    'Plan': 'Premium',
    'Upgrade date': new Date()
});
// properties can be strings, integers, dates, or lists
```



| Argument | Type | Description |
| ------------- | ------------- | ----- |
| **prop** | <span class="mp-arg-type">Object or String</span></br></span><span class="mp-arg-required">required</span> | If a string, this is the name of the property. If an object, this is an associative array of names and values. |
| **to** | <span class="mp-arg-type">any</span></br></span><span class="mp-arg-optional">optional</span> | A value to set on the given property name |
| **callback** | <span class="mp-arg-type">Function</span></br></span><span class="mp-arg-optional">optional</span> | If provided, the callback will be called after tracking the event. |


___
## mixpanel.people.set_once
Set properties on a user record, only if they do not yet exist.  This will not overwrite previous people property values, unlike  people.set().


### Usage:

```javascript
mixpanel.people.set_once('First Login Date', new Date());

// or set multiple properties at once
mixpanel.people.set_once({
    'First Login Date': new Date(),
    'Starting Plan': 'Premium'
});

// properties can be strings, integers or dates
```



| Argument | Type | Description |
| ------------- | ------------- | ----- |
| **prop** | <span class="mp-arg-type">Object or String</span></br></span><span class="mp-arg-required">required</span> | If a string, this is the name of the property. If an object, this is an associative array of names and values. |
| **to** | <span class="mp-arg-type">any</span></br></span><span class="mp-arg-optional">optional</span> | A value to set on the given property name |
| **callback** | <span class="mp-arg-type">Function</span></br></span><span class="mp-arg-optional">optional</span> | If provided, the callback will be called after tracking the event. |


___
## mixpanel.people.union
Merge a given list with a list-valued people analytics property,  excluding duplicate values.


### Usage:

```javascript
// merge a value to a list, creating it if needed
mixpanel.people.union('pages_visited', 'homepage');

// like mixpanel.people.set(), you can append multiple
// properties at once:
mixpanel.people.union({
    list1: 'bob',
    list2: 123
});

// like mixpanel.people.append(), you can append multiple
// values to the same list:
mixpanel.people.union({
    list1: ['bob', 'billy']
});
```



| Argument | Type | Description |
| ------------- | ------------- | ----- |
| **list_name** | <span class="mp-arg-type">Object or String</span></br></span><span class="mp-arg-required">required</span> | If a string, this is the name of the property. If an object, this is an associative array of names and values. |
| **value** | <span class="mp-arg-type">any</span></br></span><span class="mp-arg-optional">optional</span> | Value / values to merge with the given property |
| **callback** | <span class="mp-arg-type">Function</span></br></span><span class="mp-arg-optional">optional</span> | If provided, the callback will be called after tracking the event. |


___
## mixpanel.people.unset
Unset properties on a user record (permanently removes the properties and their values from a profile).


### Usage:

```javascript
mixpanel.people.unset('gender');

// or unset multiple properties at once
mixpanel.people.unset(['gender', 'Company']);
```



| Argument | Type | Description |
| ------------- | ------------- | ----- |
| **prop** | <span class="mp-arg-type">Array or String</span></br></span><span class="mp-arg-required">required</span> | If a string, this is the name of the property. If an array, this is a list of property names. |
| **callback** | <span class="mp-arg-type">Function</span></br></span><span class="mp-arg-optional">optional</span> | If provided, the callback will be called after tracking the event. |



# mixpanel.group


___
## mixpanel.group.delete
Permanently delete a group.


### Usage:

```javascript
mixpanel.get_group('company', 'mixpanel').delete();
```



| Argument | Type | Description |
| ------------- | ------------- | ----- |
| **callback** | <span class="mp-arg-type">Function</span></br></span><span class="mp-arg-optional">optional</span> | If provided, the callback will be called after the tracking event |


___
## mixpanel.group.remove
Remove a property from a group. The value will be ignored if doesn't exist.


### Usage:

```javascript
mixpanel.get_group('company', 'mixpanel').remove('Location', 'London');
```



| Argument | Type | Description |
| ------------- | ------------- | ----- |
| **list_name** | <span class="mp-arg-type">String</span></br></span><span class="mp-arg-required">required</span> | Name of the property. |
| **value** | <span class="mp-arg-type">Object</span></br></span><span class="mp-arg-required">required</span> | Value to remove from the given group property |
| **callback** | <span class="mp-arg-type">Function</span></br></span><span class="mp-arg-optional">optional</span> | If provided, the callback will be called after the tracking event |


___
## mixpanel.group.set
Set properties on a group.


### Usage:

```javascript
mixpanel.get_group('company', 'mixpanel').set('Location', '405 Howard');

// or set multiple properties at once
mixpanel.get_group('company', 'mixpanel').set({
     'Location': '405 Howard',
     'Founded' : 2009,
});
// properties can be strings, integers, dates, or lists
```



| Argument | Type | Description |
| ------------- | ------------- | ----- |
| **prop** | <span class="mp-arg-type">Object or String</span></br></span><span class="mp-arg-required">required</span> | If a string, this is the name of the property. If an object, this is an associative array of names and values. |
| **to** | <span class="mp-arg-type">any</span></br></span><span class="mp-arg-optional">optional</span> | A value to set on the given property name |
| **callback** | <span class="mp-arg-type">Function</span></br></span><span class="mp-arg-optional">optional</span> | If provided, the callback will be called after the tracking event |


___
## mixpanel.group.set_once
Set properties on a group, only if they do not yet exist.  This will not overwrite previous group property values, unlike  group.set().


### Usage:

```javascript
mixpanel.get_group('company', 'mixpanel').set_once('Location', '405 Howard');

// or set multiple properties at once
mixpanel.get_group('company', 'mixpanel').set_once({
     'Location': '405 Howard',
     'Founded' : 2009,
});
// properties can be strings, integers, lists or dates
```



| Argument | Type | Description |
| ------------- | ------------- | ----- |
| **prop** | <span class="mp-arg-type">Object or String</span></br></span><span class="mp-arg-required">required</span> | If a string, this is the name of the property. If an object, this is an associative array of names and values. |
| **to** | <span class="mp-arg-type">any</span></br></span><span class="mp-arg-optional">optional</span> | A value to set on the given property name |
| **callback** | <span class="mp-arg-type">Function</span></br></span><span class="mp-arg-optional">optional</span> | If provided, the callback will be called after the tracking event |


___
## mixpanel.group.union
Merge a given list with a list-valued group property, excluding duplicate values.


### Usage:

```javascript
// merge a value to a list, creating it if needed
mixpanel.get_group('company', 'mixpanel').union('Location', ['San Francisco', 'London']);
```



| Argument | Type | Description |
| ------------- | ------------- | ----- |
| **list_name** | <span class="mp-arg-type">String</span></br></span><span class="mp-arg-required">required</span> | Name of the property. |
| **values** | <span class="mp-arg-type">Array</span></br></span><span class="mp-arg-required">required</span> | Values to merge with the given property |
| **callback** | <span class="mp-arg-type">Function</span></br></span><span class="mp-arg-optional">optional</span> | If provided, the callback will be called after the tracking event |


___
## mixpanel.group.unset
Unset properties on a group permanently.


### Usage:

```javascript
mixpanel.get_group('company', 'mixpanel').unset('Founded');
```



| Argument | Type | Description |
| ------------- | ------------- | ----- |
| **prop** | <span class="mp-arg-type">String</span></br></span><span class="mp-arg-required">required</span> | The name of the property. |
| **callback** | <span class="mp-arg-type">Function</span></br></span><span class="mp-arg-optional">optional</span> | If provided, the callback will be called after the tracking event |



