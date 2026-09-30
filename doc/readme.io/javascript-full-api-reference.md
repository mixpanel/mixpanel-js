## Classes

<a id="mixpanelgroup"></a>

### MixpanelGroup

Mixpanel Group Object

#### Methods

<a id="delete"></a>

##### delete()

> **delete**(`callback?`): `any`

Permanently delete a group.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `callback?` | `Function` | If provided, the callback will be called after the tracking event |

###### Returns

`any`

###### Example

```js
mixpanel.get_group('company', 'mixpanel').delete();
```

<a id="remove"></a>

##### remove()

> **remove**(`list_name`, `value`, `callback?`): `any`

Remove a property from a group. The value will be ignored if doesn't exist.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `list_name` | `string` | Name of the property. |
| `value` | `Object` | Value to remove from the given group property |
| `callback?` | `Function` | If provided, the callback will be called after the tracking event |

###### Returns

`any`

###### Example

```js
mixpanel.get_group('company', 'mixpanel').remove('Location', 'London');
```

<a id="set"></a>

##### set()

> **set**(`prop`, `to?`, `callback?`): `any`

Set properties on a group.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `prop` | `string` \| `Object` | If a string, this is the name of the property. If an object, this is an associative array of names and values. |
| `to?` | `any` | A value to set on the given property name |
| `callback?` | `Function` | If provided, the callback will be called after the tracking event |

###### Returns

`any`

###### Example

```js
mixpanel.get_group('company', 'mixpanel').set('Location', '405 Howard');

// or set multiple properties at once
mixpanel.get_group('company', 'mixpanel').set({
     'Location': '405 Howard',
     'Founded' : 2009,
});
// properties can be strings, integers, dates, or lists
```

<a id="set_once"></a>

##### set\_once()

> **set\_once**(`prop`, `to?`, `callback?`): `any`

Set properties on a group, only if they do not yet exist.
This will not overwrite previous group property values, unlike
group.set().

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `prop` | `string` \| `Object` | If a string, this is the name of the property. If an object, this is an associative array of names and values. |
| `to?` | `any` | A value to set on the given property name |
| `callback?` | `Function` | If provided, the callback will be called after the tracking event |

###### Returns

`any`

###### Example

```js
mixpanel.get_group('company', 'mixpanel').set_once('Location', '405 Howard');

// or set multiple properties at once
mixpanel.get_group('company', 'mixpanel').set_once({
     'Location': '405 Howard',
     'Founded' : 2009,
});
// properties can be strings, integers, lists or dates
```

<a id="union"></a>

##### union()

> **union**(`list_name`, `values`, `callback?`): `any`

Merge a given list with a list-valued group property, excluding duplicate values.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `list_name` | `string` | Name of the property. |
| `values` | `any`[] | Values to merge with the given property |
| `callback?` | `Function` | If provided, the callback will be called after the tracking event |

###### Returns

`any`

###### Example

```js
// merge a value to a list, creating it if needed
mixpanel.get_group('company', 'mixpanel').union('Location', ['San Francisco', 'London']);
```

<a id="unset"></a>

##### unset()

> **unset**(`prop`, `callback?`): `any`

Unset properties on a group permanently.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `prop` | `string` | The name of the property. |
| `callback?` | `Function` | If provided, the callback will be called after the tracking event |

###### Returns

`any`

###### Example

```js
mixpanel.get_group('company', 'mixpanel').unset('Founded');
```

***

<a id="mixpanellib"></a>

### MixpanelLib

Mixpanel Library Object

#### Methods

<a id="add_group"></a>

##### add\_group()

> **add\_group**(`group_key`, `group_id`, `callback?`): `any`

Add a new group for this user.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `group_key` | `string` | Group key |
| `group_id` | `any` | A valid Mixpanel property type |
| `callback?` | `Function` | If provided, the callback will be called after tracking the event. |

###### Returns

`any`

###### Example

```js
mixpanel.add_group('company', 'mixpanel')
```

<a id="alias"></a>

##### alias()

> **alias**(`alias`, `original?`): `boolean` \| `Object` \| `-1` \| `-2`

The alias method creates an alias which Mixpanel will use to
remap one id to another. Multiple aliases can point to the
same identifier.

The following is a valid use of alias:

    mixpanel.alias('new_id', 'existing_id');
    // You can add multiple id aliases to the existing ID
    mixpanel.alias('newer_id', 'existing_id');

Aliases can also be chained - the following is a valid example:

    mixpanel.alias('new_id', 'existing_id');
    // chain newer_id - new_id - existing_id
    mixpanel.alias('newer_id', 'new_id');

Aliases cannot point to multiple identifiers - the following
example will not work:

    mixpanel.alias('new_id', 'existing_id');
    // this is invalid as 'new_id' already points to 'existing_id'
    mixpanel.alias('new_id', 'newer_id');

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `alias` | `string` | A unique identifier that you want to use for this user in the future. |
| `original?` | `string` | The current identifier being used for this user. |

###### Returns

`boolean` \| `Object` \| `-1` \| `-2`

###### Remarks

If your project does not have
<a href="https://help.mixpanel.com/hc/en-us/articles/360039133851">ID Merge</a>
enabled, the best practice is to call alias once when a unique
ID is first created for a user (e.g., when a user first registers
for an account). Do not use alias multiple times for a single
user without ID Merge enabled.

<a id="clear_opt_in_out_tracking"></a>

##### clear\_opt\_in\_out\_tracking()

> **clear\_opt\_in\_out\_tracking**(`options?`): `void`

Clear the user's opt in/out status of data tracking and cookies/localstorage for this Mixpanel instance

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options?` | \{ `cookie_domain?`: `string`; `cookie_expiration?`: `number`; `cookie_prefix?`: `string`; `cross_site_cookie?`: `boolean`; `cross_subdomain_cookie?`: `boolean`; `enable_persistence?`: `boolean`; `persistence_type?`: `string`; `secure_cookie?`: `boolean`; \} | A dictionary of config options to override |
| `options.cookie_domain?` | `string` | Custom cookie domain (overrides value specified in this Mixpanel instance's config) |
| `options.cookie_expiration?` | `number` | Number of days until the opt-in cookie expires (overrides value specified in this Mixpanel instance's config) |
| `options.cookie_prefix?` | `string` | Custom prefix to be used in the cookie/localstorage name |
| `options.cross_site_cookie?` | `boolean` | Whether the opt-in cookie is set as cross-site-enabled (overrides value specified in this Mixpanel instance's config) |
| `options.cross_subdomain_cookie?` | `boolean` | Whether the opt-in cookie is set as cross-subdomain or not (overrides value specified in this Mixpanel instance's config) |
| `options.enable_persistence?` | `boolean` | If true, will re-enable sdk persistence |
| `options.persistence_type?` | `string` | Persistence mechanism used - cookie or localStorage - falls back to cookie if localStorage is unavailable |
| `options.secure_cookie?` | `boolean` | Whether the opt-in cookie is set as secure or not (overrides value specified in this Mixpanel instance's config) |

###### Returns

`void`

###### Example

```js
// clear user's opt-in/out status
mixpanel.clear_opt_in_out_tracking();

// clear user's opt-in/out status with specific cookie configuration - should match
// configuration used when opt_in_tracking/opt_out_tracking methods were called.
mixpanel.clear_opt_in_out_tracking({
    cookie_expiration: 30,
    secure_cookie: true
});
```

<a id="disable"></a>

##### disable()

> **disable**(`events?`): `void`

Disable events on the Mixpanel object. If passed no arguments,
this function disables tracking of any event. If passed an
array of event names, those events will be disabled, but other
events will continue to be tracked.

Note: this function does not stop other mixpanel functions from
firing, such as register() or people.set().

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `events?` | `any`[] | An array of event names to disable |

###### Returns

`void`

<a id="enable"></a>

##### enable()

> **enable**(`events?`): `void`

Enables events on the Mixpanel object. If passed no arguments,
this function enable tracking of all events. If passed an
array of event names, those events will be enabled, but other
existing disabled events will continue to be not tracked.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `events?` | `any`[] | An array of event names to enable |

###### Returns

`void`

<a id="get_api_host"></a>

##### get\_api\_host()

> **get\_api\_host**(`endpoint_type`): `string`

Get the API host for a specific endpoint type, falling back to the default api_host if not specified

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `endpoint_type` | `string` | The type of endpoint (e.g., "events", "people", "groups") |

###### Returns

`string`

The API host to use for this endpoint

<a id="get_config"></a>

##### get\_config()

> **get\_config**(`prop_name`): `any`

returns the current config object for the library.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `prop_name` | `any` |

###### Returns

`any`

<a id="get_distinct_id"></a>

##### get\_distinct\_id()

> **get\_distinct\_id**(): `any`

Returns the current distinct id of the user. This is either the id automatically
generated by the library or the id that has been passed by a call to identify().

###### Returns

`any`

###### Remarks

get_distinct_id() can only be called after the Mixpanel library has finished loading.
init() has a loaded function available to handle this automatically. For example:

    // set distinct_id after the mixpanel library has loaded
    mixpanel.init('YOUR PROJECT TOKEN', {
        loaded: function(mixpanel) {
            distinct_id = mixpanel.get_distinct_id();
        }
    });

<a id="get_group"></a>

##### get\_group()

> **get\_group**(`group_key`, `group_id`): `Object`

Look up reference to a Mixpanel group

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `group_key` | `string` | Group key |
| `group_id` | `Object` | A valid Mixpanel property type |

###### Returns

`Object`

A MixpanelGroup identifier

###### Example

```js
mixpanel.get_group(group_key, group_id)
```

<a id="get_property"></a>

##### get\_property()

> **get\_property**(`property_name`): `any`

Returns the value of the super property named property_name. If no such
property is set, get_property() will return the undefined value.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `property_name` | `string` | The name of the super property you want to retrieve |

###### Returns

`any`

###### Remarks

get_property() can only be called after the Mixpanel library has finished loading.
init() has a loaded function available to handle this automatically. For example:

    // grab value for 'user_id' after the mixpanel library has loaded
    mixpanel.init('YOUR PROJECT TOKEN', {
        loaded: function(mixpanel) {
            user_id = mixpanel.get_property('user_id');
        }
    });

<a id="has_opted_in_tracking"></a>

##### has\_opted\_in\_tracking()

> **has\_opted\_in\_tracking**(`options?`): `boolean`

Check whether the user has opted in to data tracking and cookies/localstorage for this Mixpanel instance

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options?` | \{ `cookie_prefix?`: `string`; `persistence_type?`: `string`; \} | A dictionary of config options to override |
| `options.cookie_prefix?` | `string` | Custom prefix to be used in the cookie/localstorage name |
| `options.persistence_type?` | `string` | Persistence mechanism used - cookie or localStorage - falls back to cookie if localStorage is unavailable |

###### Returns

`boolean`

current opt-in status

###### Example

```js
var has_opted_in = mixpanel.has_opted_in_tracking();
// use has_opted_in value
```

<a id="has_opted_out_tracking"></a>

##### has\_opted\_out\_tracking()

> **has\_opted\_out\_tracking**(`options?`): `boolean`

Check whether the user has opted out of data tracking and cookies/localstorage for this Mixpanel instance

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options?` | \{ `cookie_prefix?`: `string`; `persistence_type?`: `string`; \} | A dictionary of config options to override |
| `options.cookie_prefix?` | `string` | Custom prefix to be used in the cookie/localstorage name |
| `options.persistence_type?` | `string` | Persistence mechanism used - cookie or localStorage - falls back to cookie if localStorage is unavailable |

###### Returns

`boolean`

current opt-out status

###### Example

```js
var has_opted_out = mixpanel.has_opted_out_tracking();
// use has_opted_out value
```

<a id="identify"></a>

##### identify()

> **identify**(`new_distinct_id?`): `-1` \| `undefined`

Identify a user with a unique ID to track user activity across
devices, tie a user to their events, and create a user profile.
If you never call this method, unique visitors are tracked using
a UUID generated the first time they visit the site.

Call identify when you know the identity of the current user,
typically after login or signup. We recommend against using
identify for anonymous visitors to your site.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `new_distinct_id?` | `string` | A string that uniquely identifies a user. If not provided, the distinct_id currently in the persistent store (cookie or localStorage) will be used. |

###### Returns

`-1` \| `undefined`

###### Remarks

If your project has
<a href="https://help.mixpanel.com/hc/en-us/articles/360039133851">ID Merge</a>
enabled, the identify method will connect pre- and
post-authentication events when appropriate.

If your project does not have ID Merge enabled, identify will
change the user's local distinct_id to the unique ID you pass.
Events tracked prior to authentication will not be connected
to the same user identity. If ID Merge is disabled, alias can
be used to connect pre- and post-registration events.

<a id="init"></a>

##### init()

> **init**(`token`, `config?`, `name?`): `any`

This function initializes a new instance of the Mixpanel tracking object.
All new instances are added to the main mixpanel object as sub properties (such as
mixpanel.library_name) and also returned by this function. To define a
second instance on the page, you would call:

    mixpanel.init('new token', { your: 'config' }, 'library_name');

and use it like so:

    mixpanel.library_name.track(...);

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `token` | `string` | Your Mixpanel API token |
| `config?` | `Partial`\<[`Config`](#config)\> | A dictionary of config options to override; see the Config type for the available options and their defaults. |
| `name?` | `string` | The name for the new mixpanel instance that you want created |

###### Returns

`any`

<a id="name_tag"></a>

##### ~~name\_tag()~~

> **name\_tag**(`name_tag`): `void`

Provide a string to recognize the user by. The string passed to
this method will appear in the Mixpanel Streams product rather
than an automatically generated name. Name tags do not have to
be unique.

This value will only be included in Streams data.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `name_tag` | `string` | A human readable name for the user |

###### Returns

`void`

###### Deprecated

<a id="opt_in_tracking"></a>

##### opt\_in\_tracking()

> **opt\_in\_tracking**(`options?`): `void`

Opt the user in to data tracking and cookies/localstorage for this Mixpanel instance

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options?` | \{ `cookie_domain?`: `string`; `cookie_expiration?`: `number`; `cookie_prefix?`: `string`; `cross_site_cookie?`: `boolean`; `cross_subdomain_cookie?`: `boolean`; `enable_persistence?`: `boolean`; `persistence_type?`: `string`; `secure_cookie?`: `boolean`; `track?`: `Function`; `track_event_name?`: `string`; `track_properties?`: `Object`; \} | A dictionary of config options to override |
| `options.cookie_domain?` | `string` | Custom cookie domain (overrides value specified in this Mixpanel instance's config) |
| `options.cookie_expiration?` | `number` | Number of days until the opt-in cookie expires (overrides value specified in this Mixpanel instance's config) |
| `options.cookie_prefix?` | `string` | Custom prefix to be used in the cookie/localstorage name |
| `options.cross_site_cookie?` | `boolean` | Whether the opt-in cookie is set as cross-site-enabled (overrides value specified in this Mixpanel instance's config) |
| `options.cross_subdomain_cookie?` | `boolean` | Whether the opt-in cookie is set as cross-subdomain or not (overrides value specified in this Mixpanel instance's config) |
| `options.enable_persistence?` | `boolean` | If true, will re-enable sdk persistence |
| `options.persistence_type?` | `string` | Persistence mechanism used - cookie or localStorage - falls back to cookie if localStorage is unavailable |
| `options.secure_cookie?` | `boolean` | Whether the opt-in cookie is set as secure or not (overrides value specified in this Mixpanel instance's config) |
| `options.track?` | `Function` | Function used for tracking a Mixpanel event to record the opt-in action (default is this Mixpanel instance's track method) |
| `options.track_event_name?` | `string` | Event name to be used for tracking the opt-in action |
| `options.track_properties?` | `Object` | Set of properties to be tracked along with the opt-in action |

###### Returns

`void`

###### Example

```js
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

<a id="opt_out_tracking"></a>

##### opt\_out\_tracking()

> **opt\_out\_tracking**(`options?`): `void`

Opt the user out of data tracking and cookies/localstorage for this Mixpanel instance

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options?` | \{ `clear_persistence?`: `boolean`; `cookie_domain?`: `string`; `cookie_expiration?`: `number`; `cookie_prefix?`: `string`; `cross_site_cookie?`: `boolean`; `cross_subdomain_cookie?`: `boolean`; `delete_user?`: `boolean`; `persistence_type?`: `string`; `secure_cookie?`: `boolean`; \} | A dictionary of config options to override |
| `options.clear_persistence?` | `boolean` | If true, will delete all data stored by the sdk in persistence |
| `options.cookie_domain?` | `string` | Custom cookie domain (overrides value specified in this Mixpanel instance's config) |
| `options.cookie_expiration?` | `number` | Number of days until the opt-in cookie expires (overrides value specified in this Mixpanel instance's config) |
| `options.cookie_prefix?` | `string` | Custom prefix to be used in the cookie/localstorage name |
| `options.cross_site_cookie?` | `boolean` | Whether the opt-in cookie is set as cross-site-enabled (overrides value specified in this Mixpanel instance's config) |
| `options.cross_subdomain_cookie?` | `boolean` | Whether the opt-in cookie is set as cross-subdomain or not (overrides value specified in this Mixpanel instance's config) |
| `options.delete_user?` | `boolean` | If true, will delete the currently identified user's profile and clear all charges after opting the user out |
| `options.persistence_type?` | `string` | Persistence mechanism used - cookie or localStorage - falls back to cookie if localStorage is unavailable |
| `options.secure_cookie?` | `boolean` | Whether the opt-in cookie is set as secure or not (overrides value specified in this Mixpanel instance's config) |

###### Returns

`void`

###### Example

```js
// opt user out
mixpanel.opt_out_tracking();

// opt user out with different cookie configuration from Mixpanel instance
mixpanel.opt_out_tracking({
    cookie_expiration: 30,
    secure_cookie: true
});
```

<a id="push"></a>

##### push()

> **push**(`item`): `void`

push() keeps the standard async-array-push
behavior around after the lib is loaded.
This is only useful for external integrations that
do not wish to rely on our convenience methods
(created in the snippet).

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `item` | `any`[] | A [function_name, args...] array to be executed |

###### Returns

`void`

###### Example

```js
mixpanel.push(['register', { a: 'b' }]);
```

<a id="register"></a>

##### register()

> **register**(`props`, `days_or_options?`): `void`

Register a set of super properties, which are included with all
events. This will overwrite previous super property values.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `props` | `Object` | An associative array of properties to store about the user |
| `days_or_options?` | `number` \| `Object` | Options object or number of days since the user's last visit to store the super properties (only valid for persisted props) |

###### Returns

`void`

###### Example

```js
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

<a id="register_once"></a>

##### register\_once()

> **register\_once**(`props`, `default_value?`, `days_or_options?`): `void`

Register a set of super properties only once. This will not
overwrite previous super property values, unlike register().

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `props` | `Object` | An associative array of properties to store about the user |
| `default_value?` | `any` | Value to override if already set in super properties (ex: 'False') Default: 'None' |
| `days_or_options?` | `number` \| `Object` | Options object or number of days since the user's last visit to store the super properties (only valid for persisted props) |

###### Returns

`void`

###### Example

```js
// register a super property for the first time only
mixpanel.register_once({
    'First Login Date': new Date().toISOString()
});

// register once, only for the current pageload
mixpanel.register_once({
    'First interaction time': new Date().toISOString()
}, 'None', {persistent: false});
```

###### Remarks

If default_value is specified, current super properties
with that value will be overwritten.

<a id="remove_group"></a>

##### remove\_group()

> **remove\_group**(`group_key`, `group_id`, `callback?`): `any`

Remove a group from this user.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `group_key` | `string` | Group key |
| `group_id` | `any` | A valid Mixpanel property type |
| `callback?` | `Function` | If provided, the callback will be called after tracking the event. |

###### Returns

`any`

###### Example

```js
mixpanel.remove_group('company', 'mixpanel')
```

<a id="reset"></a>

##### reset()

> **reset**(): `void`

Clears super properties and generates a new random distinct_id for this instance.
Useful for clearing data when a user logs out.

###### Returns

`void`

<a id="set_config"></a>

##### set\_config()

> **set\_config**(`config`): `void`

Update the configuration of a mixpanel library instance.

The default config is:

    {
      // host for requests (customizable for e.g. a local proxy)
      api_host: 'https://api-js.mixpanel.com',

      // endpoints for different types of requests
      api_routes: {
        track: 'track/',
        engage: 'engage/',
        groups: 'groups/',
      }

      // HTTP method for tracking requests
      api_method: 'POST'

      // transport for sending requests ('XHR' or 'sendBeacon')
      // NB: sendBeacon should only be used for scenarios such as
      // page unload where a "best-effort" attempt to send is
      // acceptable; the sendBeacon API does not support callbacks
      // or any way to know the result of the request. Mixpanel
      // tracking via sendBeacon will not support any event-
      // batching or retry mechanisms.
      api_transport: 'XHR'

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
      cookie_domain: ''

      // super properties cookie expiration (in days)
      cookie_expiration: 365

      // if true, cookie will be set with SameSite=None; Secure
      // this is only useful in special situations, like embedded
      // 3rd-party iframes that set up a Mixpanel instance
      cross_site_cookie: false

      // super properties span subdomains
      cross_subdomain_cookie: true

      // debug mode
      debug: false

      // if this is true, the mixpanel cookie or localStorage entry
      // will be deleted, and no user persistence will take place
      disable_persistence: false

      // if this is true, Mixpanel will automatically determine
      // City, Region and Country data using the IP address of
      //the client
      ip: true

      // opt users out of tracking by this Mixpanel instance by default
      opt_out_tracking_by_default: false

      // opt users out of browser data storage by this Mixpanel instance by default
      opt_out_persistence_by_default: false

      // persistence mechanism used by opt-in/opt-out methods - cookie
      // or localStorage - falls back to cookie if localStorage is unavailable
      opt_out_tracking_persistence_type: 'localStorage'

      // customize the name of cookie/localStorage set by opt-in/opt-out methods
      opt_out_tracking_cookie_prefix: null

      // type of persistent store for super properties (cookie/
      // localStorage) if set to 'localStorage', any existing
      // mixpanel cookie value with the same persistence_name
      // will be transferred to localStorage and deleted
      persistence: 'cookie'

      // name for super properties persistent store
      persistence_name: ''

      // names of properties/superproperties which should never
      // be sent with track() calls
      property_blacklist: []

      // if this is true, mixpanel cookies will be marked as
      // secure, meaning they will only be transmitted over https
      secure_cookie: false

      // disables enriching user profiles with first touch marketing data
      skip_first_touch_marketing: false

      // the amount of time track_links will
      // wait for Mixpanel's servers to respond
      track_links_timeout: 300

      // adds any UTM parameters and click IDs present on the page to any events fired
      track_marketing: true

      // enables automatic page view tracking using default page view events through
      // the track_pageview() method
      track_pageview: false

      // if you set upgrade to be true, the library will check for
      // a cookie from our old js library and import super
      // properties from it, then the old cookie is deleted
      // The upgrade config option only works in the initialization,
      // so make sure you set it when you create the library.
      upgrade: false

      // extra HTTP request headers to set for each API request, in
      // the format {'Header-Name': value}
      xhr_headers: {}

      // whether to ignore or respect the web browser's Do Not Track setting
      ignore_dnt: false
    }

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `config` | `Partial`\<[`Config`](#config)\> | A dictionary of new configuration values to update; see the Config type for the available options. |

###### Returns

`void`

<a id="set_group"></a>

##### set\_group()

> **set\_group**(`group_key`, `group_ids`, `callback?`): `any`

Register the current user into one/many groups.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `group_key` | `string` | Group key |
| `group_ids` | `string` \| `number` \| `any`[] | An array of group IDs, or a singular group ID |
| `callback?` | `Function` | If provided, the callback will be called after tracking the event. |

###### Returns

`any`

###### Example

```js
mixpanel.set_group('company', ['mixpanel', 'google']) // an array of IDs
mixpanel.set_group('company', 'mixpanel')
mixpanel.set_group('company', 128746312)
```

<a id="time_event"></a>

##### time\_event()

> **time\_event**(`event_name`): `void`

Time an event by including the time between this call and a
later 'track' call for the same event in the properties sent
with the event.

When called for a particular event name, the next track call for that event
name will include the elapsed time between the 'time_event' and 'track'
calls. This value is stored as seconds in the '$duration' property.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `event_name` | `string` | The name of the event. |

###### Returns

`void`

###### Example

```js
// time an event named 'Registered'
mixpanel.time_event('Registered');
mixpanel.track('Registered', {'Gender': 'Male', 'Age': 21});
```

<a id="track"></a>

##### track()

> **track**(`event_name`, `properties?`, `options?`, `callback?`): `boolean` \| `Object`

Track an event. This is the most important and
frequently used Mixpanel function.

To track link clicks or form submissions, see track_links() or track_forms().

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `event_name` | `string` | The name of the event. This can be anything the user does - 'Button Click', 'Sign Up', 'Item Purchased', etc. |
| `properties?` | `Object` | A set of properties to include with the event you're sending. These describe the user who did the event or details about the event itself. |
| `options?` | \{ `send_immediately?`: `boolean`; `transport?`: `string`; \} | Optional configuration for this track request. |
| `options.send_immediately?` | `boolean` | Whether to bypass batching/queueing and send track request immediately. |
| `options.transport?` | `string` | Transport method for network request ('xhr' or 'sendBeacon'). |
| `callback?` | `Function` | If provided, the callback function will be called after tracking the event. |

###### Returns

`boolean` \| `Object`

If the tracking request was successfully initiated/queued, an object
with the tracking payload sent to the API server is returned; otherwise false.

###### Example

```js
// track an event named 'Registered'
mixpanel.track('Registered', {'Gender': 'Male', 'Age': 21});

// track an event using navigator.sendBeacon
mixpanel.track('Left page', {'duration_seconds': 35}, {transport: 'sendBeacon'});
```

<a id="track_forms"></a>

##### track\_forms()

> **track\_forms**(`query`, `event_name`, `properties?`, ...`args`): `any`

Track form submissions. Selector must be a valid query.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `query` | `string` \| `Object` | A valid DOM query, element or jQuery-esque list |
| `event_name` | `string` | The name of the event to track |
| `properties?` | `Object` \| `Function` | This can be a set of properties, or a function that returns a set of properties after being passed a DOMElement |
| ...`args?` | `any`[] | - |

###### Returns

`any`

###### Example

```js
// track submission for form id 'register'
mixpanel.track_forms('#register', 'Created Account');
```

###### Remarks

This function will wait up to 300 ms for the mixpanel
servers to respond, if they have not responded by that time
it will head to the link without ensuring that your event
has been tracked.  To configure this timeout please see the
set_config() documentation below.

If you pass a function in as the properties argument, the
function will receive the DOMElement that triggered the
event as an argument.  You are expected to return an object
from the function; any properties defined on this object
will be sent to mixpanel as event properties.

<a id="track_links"></a>

##### track\_links()

> **track\_links**(`query`, `event_name`, `properties?`, ...`args`): `any`

Track clicks on a set of document elements. Selector must be a
valid query. Elements must exist on the page at the time track_links is called.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `query` | `string` \| `Object` | A valid DOM query, element or jQuery-esque list |
| `event_name` | `string` | The name of the event to track |
| `properties?` | `Object` \| `Function` | A properties object or function that returns a dictionary of properties when passed a DOMElement |
| ...`args?` | `any`[] | - |

###### Returns

`any`

###### Example

```js
// track click for link id #nav
mixpanel.track_links('#nav', 'Clicked Nav Link');
```

###### Remarks

This function will wait up to 300 ms for the Mixpanel
servers to respond. If they have not responded by that time
it will head to the link without ensuring that your event
has been tracked.  To configure this timeout please see the
set_config() documentation below.

If you pass a function in as the properties argument, the
function will receive the DOMElement that triggered the
event as an argument.  You are expected to return an object
from the function; any properties defined on this object
will be sent to mixpanel as event properties.

<a id="track_pageview"></a>

##### track\_pageview()

> **track\_pageview**(`properties?`, `options?`): `boolean` \| `Object`

Track a default Mixpanel page view event, which includes extra default event properties to
improve page view data.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `properties?` | `Object` | An optional set of additional properties to send with the page view event |
| `options?` | \{ `event_name?`: `string`; \} | Page view tracking options |
| `options.event_name?` | `string` | Alternate name for the tracking event |

###### Returns

`boolean` \| `Object`

If the tracking request was successfully initiated/queued, an object
with the tracking payload sent to the API server is returned; otherwise false.

###### Example

```js
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

###### Remarks

The `config.track_pageview` option for <a href="#mixpanelinit">mixpanel.init()</a>
may be turned on for tracking page loads automatically.

    // track only page loads
    mixpanel.init(PROJECT_TOKEN, {track_pageview: true});

    // track when the URL changes in any manner
    mixpanel.init(PROJECT_TOKEN, {track_pageview: 'full-url'});

    // track when the URL changes, ignoring any changes in the hash part
    mixpanel.init(PROJECT_TOKEN, {track_pageview: 'url-with-path-and-query-string'});

    // track when the path changes, ignoring any query parameter or hash changes
    mixpanel.init(PROJECT_TOKEN, {track_pageview: 'url-with-path'});

<a id="track_with_groups"></a>

##### track\_with\_groups()

> **track\_with\_groups**(`event_name`, `properties`, `groups`, `callback?`): `any`

Track an event with specific groups.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `event_name` | `string` | The name of the event (see `mixpanel.track()`) |
| `properties` | `Object` \| `undefined` | A set of properties to include with the event you're sending (see `mixpanel.track()`) |
| `groups` | `Object` \| `undefined` | An object mapping group name keys to one or more values |
| `callback?` | `Function` | If provided, the callback will be called after tracking the event. |

###### Returns

`any`

###### Example

```js
mixpanel.track_with_groups('purchase', {'product': 'iphone'}, {'University': ['UCB', 'UCLA']})
```

<a id="unregister"></a>

##### unregister()

> **unregister**(`property`, `options?`): `void`

Delete a super property stored with the current user.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `property` | `string` | The name of the super property to remove |
| `options?` | \{ `persistent?`: `boolean`; \} | - |
| `options.persistent?` | `boolean` | whether to look in persistent storage (cookie/localStorage) |

###### Returns

`void`

***

<a id="mixpanelpeople"></a>

### MixpanelPeople

Mixpanel People Object

#### Methods

<a id="append"></a>

##### append()

> **append**(`list_name`, `value?`, `callback?`): `any`

Append a value to a list-valued people analytics property.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `list_name` | `string` \| `Object` | If a string, this is the name of the property. If an object, this is an associative array of names and values. |
| `value?` | `any` | value An item to append to the list |
| `callback?` | `Function` | If provided, the callback will be called after tracking the event. |

###### Returns

`any`

###### Example

```js
// append a value to a list, creating it if needed
mixpanel.people.append('pages_visited', 'homepage');

// like mixpanel.people.set(), you can append multiple
// properties at once:
mixpanel.people.append({
    list1: 'bob',
    list2: 123
});
```

<a id="clear_charges"></a>

##### ~~clear\_charges()~~

> **clear\_charges**(`callback?`): `any`

Permanently clear all revenue report transactions from the
current user's people analytics profile.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `callback?` | `Function` | If provided, the callback will be called after tracking the event. |

###### Returns

`any`

###### Example

```js
mixpanel.people.clear_charges();
```

###### Deprecated

<a id="delete_user"></a>

##### delete\_user()

> **delete\_user**(): `any`

Permanently deletes the current people analytics profile from
Mixpanel (using the current distinct_id).

###### Returns

`any`

###### Example

```js
// remove the all data you have stored about the current user
mixpanel.people.delete_user();
```

<a id="increment"></a>

##### increment()

> **increment**(`prop`, `by?`, `callback?`): `any`

Increment/decrement numeric people analytics properties.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `prop` | `string` \| `Object` | If a string, this is the name of the property. If an object, this is an associative array of names and numeric values. |
| `by?` | `number` | An amount to increment the given property |
| `callback?` | `Function` | If provided, the callback will be called after tracking the event. |

###### Returns

`any`

###### Example

```js
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

<a id="remove-1"></a>

##### remove()

> **remove**(`list_name`, `value?`, `callback?`): `any`

Remove a value from a list-valued people analytics property.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `list_name` | `string` \| `Object` | If a string, this is the name of the property. If an object, this is an associative array of names and values. |
| `value?` | `any` | value Item to remove from the list |
| `callback?` | `Function` | If provided, the callback will be called after tracking the event. |

###### Returns

`any`

###### Example

```js
mixpanel.people.remove('School', 'UCB');
```

<a id="set-1"></a>

##### set()

> **set**(`prop`, `to?`, `callback?`): `any`

Set properties on a user record.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `prop` | `string` \| `Object` | If a string, this is the name of the property. If an object, this is an associative array of names and values. |
| `to?` | `any` | A value to set on the given property name |
| `callback?` | `Function` | If provided, the callback will be called after tracking the event. |

###### Returns

`any`

###### Example

```js
mixpanel.people.set('gender', 'm');

// or set multiple properties at once
mixpanel.people.set({
    'Company': 'Acme',
    'Plan': 'Premium',
    'Upgrade date': new Date()
});
// properties can be strings, integers, dates, or lists
```

<a id="set_once-1"></a>

##### set\_once()

> **set\_once**(`prop`, `to?`, `callback?`): `any`

Set properties on a user record, only if they do not yet exist.
This will not overwrite previous people property values, unlike
people.set().

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `prop` | `string` \| `Object` | If a string, this is the name of the property. If an object, this is an associative array of names and values. |
| `to?` | `any` | A value to set on the given property name |
| `callback?` | `Function` | If provided, the callback will be called after tracking the event. |

###### Returns

`any`

###### Example

```js
mixpanel.people.set_once('First Login Date', new Date());

// or set multiple properties at once
mixpanel.people.set_once({
    'First Login Date': new Date(),
    'Starting Plan': 'Premium'
});

// properties can be strings, integers or dates
```

<a id="track_charge"></a>

##### ~~track\_charge()~~

> **track\_charge**(`amount`, `properties?`, `callback?`): `void`

Record that you have charged the current user a certain amount
of money. Charges recorded with track_charge() will appear in the
Mixpanel revenue report.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `amount` | `number` | The amount of money charged to the current user |
| `properties?` | `Object` | An associative array of properties associated with the charge |
| `callback?` | `Function` | If provided, the callback will be called when the server responds |

###### Returns

`void`

###### Example

```js
// charge a user $50
mixpanel.people.track_charge(50);

// charge a user $30.50 on the 2nd of january
mixpanel.people.track_charge(30.50, {
    '$time': new Date('jan 1 2012')
});
```

###### Deprecated

<a id="union-1"></a>

##### union()

> **union**(`list_name`, `values?`, `callback?`): `any`

Merge a given list with a list-valued people analytics property,
excluding duplicate values.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `list_name` | `string` \| `Object` | If a string, this is the name of the property. If an object, this is an associative array of names and values. |
| `values?` | `any` | Value / values to merge with the given property |
| `callback?` | `Function` | If provided, the callback will be called after tracking the event. |

###### Returns

`any`

###### Example

```js
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

<a id="unset-1"></a>

##### unset()

> **unset**(`prop`, `callback?`): `any`

Unset properties on a user record (permanently removes the properties and their values from a profile).

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `prop` | `string` \| `any`[] | If a string, this is the name of the property. If an array, this is a list of property names. |
| `callback?` | `Function` | If provided, the callback will be called after tracking the event. |

###### Returns

`any`

###### Example

```js
mixpanel.people.unset('gender');

// or unset multiple properties at once
mixpanel.people.unset(['gender', 'Company']);
```

## Interfaces

<a id="autocaptureconfig"></a>

### AutocaptureConfig

#### Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="property-allow_element_callback"></a> `allow_element_callback?` | (`element`, `event`) => `boolean` | A user-provided function that determines whether a specific element should be tracked via Autocapture or not. The function receives the element as its first argument, and the DOM event as its second argument, and should return `true` if the element should be tracked (otherwise the element will NOT be tracked). |
| <a id="property-allow_selectors"></a> `allow_selectors?` | `string`[] | Opts in specific classes to Autocapture. |
| <a id="property-allow_url_regexes"></a> `allow_url_regexes?` | `RegExp`[] | Opts in specific pages to Autocapture. |
| <a id="property-block_attrs"></a> `block_attrs?` | `string`[] | Opts out specific attributes from Autocapture. |
| <a id="property-block_element_callback"></a> `block_element_callback?` | (`element`, `event`) => `boolean` | A user-provided function that determines whether a specific element should be blocked from tracking via Autocapture or not. The function receives the element as its first argument, and the DOM event as its second argument, and should return `true` if the element should be blocked. |
| <a id="property-block_selectors"></a> `block_selectors?` | `string`[] | Opts out specific classes from Autocapture. |
| <a id="property-block_url_regexes"></a> `block_url_regexes?` | `RegExp`[] | Opts out specific pages from Autocapture. |
| <a id="property-capture_extra_attrs"></a> `capture_extra_attrs?` | `string`[] | Enables specification of additional attributes to track. |
| <a id="property-capture_text_content"></a> `capture_text_content?` | `boolean` | When set to `true`, Mixpanel will capture the textContent of any element. **Default** `false` |
| <a id="property-click"></a> `click?` | `boolean` | When set to `true`, Mixpanel will track element clicks. It will not track textContent unless `capture_text_content` is also set to `true`. **Default** `true` |
| <a id="property-dead_click"></a> `dead_click?` | [`DeadClickConfig`](#deadclickconfig) | When set to `true`, Mixpanel will track dead clicks (clicks that produce no response). Can also be configured as an object to customize dead click detection parameters. **Default** `true` |
| <a id="property-input"></a> `input?` | `boolean` | When set to `true`, Mixpanel will track when an input is provided. It will not capture input content. **Default** `true` |
| <a id="property-pageview"></a> `pageview?` | [`TrackPageView`](#trackpageview) | When set, Mixpanel will collect pageviews when some components of the URL change — including UTM parameters. **Default** `'full-url'` |
| <a id="property-rage_click"></a> `rage_click?` | [`RageClickConfig`](#rageclickconfig) | When set to `true`, Mixpanel will track rage clicks (multiple clicks in a short time on the same element). Can also be configured as an object to customize rage click detection parameters. **Default** `true` |
| <a id="property-scroll"></a> `scroll?` | `boolean` | When set, Mixpanel will collect page scrolls at specified scroll intervals. **Default** `true` |
| <a id="property-scroll_capture_all"></a> `scroll_capture_all?` | `boolean` | When set to true, overrides `scroll_depth_percentage_checkpoints` and captures all scroll events. **Default** `false` |
| <a id="property-scroll_depth_percent_checkpoints"></a> `scroll_depth_percent_checkpoints?` | `number`[] | Establishes the scroll depth intervals which trigger `Page Scroll` event. **Default** `[25, 50, 75, 100]` |
| <a id="property-submit"></a> `submit?` | `boolean` | When set to `true`, Mixpanel will track form submissions (but not submission content). **Default** `true` |

***

<a id="beforesendhookpayload"></a>

### BeforeSendHookPayload

#### Properties

| Property | Type |
| ------ | ------ |
| <a id="property-event"></a> `event` | `string` |
| <a id="property-properties"></a> `properties` | `Record`\<`string`, `any`\> |

***

<a id="clearoptoutinoutoptions"></a>

### ClearOptOutInOutOptions

#### Extends

- [`HasOptedInOutOptions`](#hasoptedinoutoptions)

#### Extended by

- [`InTrackingOptions`](#intrackingoptions)
- [`OutTrackingOptions`](#outtrackingoptions)

#### Properties

| Property | Type | Inherited from |
| ------ | ------ | ------ |
| <a id="property-cookie_expiration"></a> `cookie_expiration` | `number` | - |
| <a id="property-cookie_prefix"></a> `cookie_prefix` | `string` | [`HasOptedInOutOptions`](#hasoptedinoutoptions).[`cookie_prefix`](#property-cookie_prefix-1) |
| <a id="property-cross_subdomain_cookie"></a> `cross_subdomain_cookie` | `boolean` | - |
| <a id="property-persistence_type"></a> `persistence_type` | [`Persistence`](#persistence) | [`HasOptedInOutOptions`](#hasoptedinoutoptions).[`persistence_type`](#property-persistence_type-1) |
| <a id="property-secure_cookie"></a> `secure_cookie` | `boolean` | - |

***

<a id="config"></a>

### Config

#### Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="property-api_host"></a> `api_host` | `string` | - |
| <a id="property-api_method"></a> `api_method` | `string` | - |
| <a id="property-api_payload_format"></a> `api_payload_format` | [`ApiPayloadFormat`](#apipayloadformat) | - |
| <a id="property-api_routes"></a> `api_routes` | `object` | - |
| `api_routes.engage?` | `string` | - |
| `api_routes.flags?` | `string` | - |
| `api_routes.groups?` | `string` | - |
| `api_routes.record?` | `string` | - |
| `api_routes.track?` | `string` | - |
| <a id="property-api_transport"></a> `api_transport` | `string` | - |
| <a id="property-app_host"></a> `app_host` | `string` | - |
| <a id="property-autocapture"></a> `autocapture` | `boolean` \| [`AutocaptureConfig`](#autocaptureconfig) | - |
| <a id="property-autotrack"></a> `autotrack` | `boolean` | - |
| <a id="property-batch_autostart"></a> `batch_autostart` | `boolean` | - |
| <a id="property-batch_flush_interval_ms"></a> `batch_flush_interval_ms` | `number` | - |
| <a id="property-batch_request_timeout_ms"></a> `batch_request_timeout_ms` | `number` | - |
| <a id="property-batch_requests"></a> `batch_requests` | `boolean` | - |
| <a id="property-batch_size"></a> `batch_size` | `number` | - |
| <a id="property-cdn"></a> `cdn` | `string` | - |
| <a id="property-cookie_domain"></a> `cookie_domain` | `string` | - |
| <a id="property-cookie_expiration-1"></a> `cookie_expiration` | `number` | - |
| <a id="property-cookie_name"></a> `cookie_name` | `string` | - |
| <a id="property-cross_site_cookie"></a> `cross_site_cookie` | `boolean` | - |
| <a id="property-cross_subdomain_cookie-1"></a> `cross_subdomain_cookie` | `boolean` | - |
| <a id="property-debug"></a> `debug` | `boolean` | **Default** `false` **See** https://github.com/mixpanel/mixpanel-js/blob/master/doc/readme.io/javascript-full-api-reference.md#mixpanelset_config |
| <a id="property-disable_cookie"></a> `disable_cookie` | `boolean` | - |
| <a id="property-disable_notifications"></a> `disable_notifications` | `boolean` | - |
| <a id="property-disable_persistence"></a> `disable_persistence` | `boolean` | - |
| <a id="property-error_reporter"></a> `error_reporter` | (`msg`, `err?`) => `void` | - |
| <a id="property-flags"></a> `flags` | `boolean` \| [`FlagsConfig`](#flagsconfig) | - |
| <a id="property-hooks"></a> `hooks` | `object` | - |
| `hooks.before_identify?` | (`new_distinct_id`) => `string` \| `null` | - |
| `hooks.before_register?` | (`props`, `days_or_options?`) => [`Dict`](#dict) \| (`number` \| [`Dict`](#dict) \| `Partial`\<[`RegisterOptions`](#registeroptions)\>)[] \| `null` | - |
| `hooks.before_register_once?` | (`props`, `default_value?`, `days_or_options?`) => `any`[] \| [`Dict`](#dict) \| `null` | - |
| `hooks.before_send_events?` | (`event`) => [`BeforeSendHookPayload`](#beforesendhookpayload) \| `null` | - |
| `hooks.before_track?` | (`event_name`, `properties`) => `string` \| (`string` \| [`Dict`](#dict))[] \| `null` | - |
| `hooks.before_unregister?` | (`property`, `options?`) => `string` \| `Partial`\<[`RegisterOptions`](#registeroptions)\> \| `null` | - |
| <a id="property-ignore_dnt"></a> `ignore_dnt` | `boolean` | - |
| <a id="property-img"></a> `img` | `boolean` | - |
| <a id="property-inapp_link_new_window"></a> `inapp_link_new_window` | `boolean` | - |
| <a id="property-inapp_protocol"></a> `inapp_protocol` | `string` | - |
| <a id="property-ip"></a> `ip` | `boolean` | - |
| <a id="property-loaded"></a> `loaded` | (`mixpanel`) => `void` | - |
| <a id="property-opt_out_persistence_by_default"></a> `opt_out_persistence_by_default` | `boolean` | - |
| <a id="property-opt_out_tracking_by_default"></a> `opt_out_tracking_by_default` | `boolean` | - |
| <a id="property-opt_out_tracking_cookie_prefix"></a> `opt_out_tracking_cookie_prefix` | `string` | - |
| <a id="property-opt_out_tracking_persistence_type"></a> `opt_out_tracking_persistence_type` | [`Persistence`](#persistence) | - |
| <a id="property-persistence"></a> `persistence` | [`Persistence`](#persistence) | - |
| <a id="property-persistence_name"></a> `persistence_name` | `string` | - |
| <a id="property-property_blacklist"></a> `property_blacklist` | `string`[] | - |
| <a id="property-record_allowed_iframe_origins"></a> `record_allowed_iframe_origins` | `string`[] | - |
| <a id="property-record_block_class"></a> `record_block_class` | `string` \| `RegExp` | - |
| <a id="property-record_block_selector"></a> `record_block_selector` | `string` | - |
| <a id="property-record_canvas"></a> `record_canvas` | `boolean` | - |
| <a id="property-record_collect_fonts"></a> `record_collect_fonts` | `boolean` | - |
| <a id="property-record_console"></a> `record_console` | `boolean` | - |
| <a id="property-record_heatmap_data"></a> `record_heatmap_data` | `boolean` | - |
| <a id="property-record_idle_timeout_ms"></a> `record_idle_timeout_ms` | `number` | - |
| <a id="property-record_inline_images"></a> `record_inline_images` | `boolean` | - |
| <a id="property-record_mask_all_inputs"></a> `record_mask_all_inputs` | `boolean` | - |
| <a id="property-record_mask_all_text"></a> `record_mask_all_text` | `boolean` | - |
| <a id="property-record_mask_input_selector"></a> `record_mask_input_selector` | `string` \| `string`[] | - |
| <a id="property-record_mask_text_class"></a> `record_mask_text_class` | `string` \| `RegExp` | - |
| <a id="property-record_mask_text_selector"></a> `record_mask_text_selector` | `string` \| `string`[] | - |
| <a id="property-record_max_ms"></a> `record_max_ms` | `number` | - |
| <a id="property-record_min_ms"></a> `record_min_ms` | `number` | - |
| <a id="property-record_network"></a> `record_network` | `boolean` | - |
| <a id="property-record_network_options"></a> `record_network_options` | [`NetworkRecordOptions`](#networkrecordoptions) | - |
| <a id="property-record_sessions_percent"></a> `record_sessions_percent` | `number` | - |
| <a id="property-record_unmask_input_selector"></a> `record_unmask_input_selector` | `string` \| `string`[] | - |
| <a id="property-record_unmask_text_selector"></a> `record_unmask_text_selector` | `string` \| `string`[] | - |
| <a id="property-recorder_src"></a> `recorder_src` | `string` | - |
| <a id="property-recording_event_triggers"></a> `recording_event_triggers` | [`RecordingEventTriggers`](#recordingeventtriggers) | - |
| <a id="property-remote_settings_mode"></a> `remote_settings_mode` | [`RemoteSettingType`](#remotesettingtype) | - |
| <a id="property-save_referrer"></a> `save_referrer` | `boolean` | - |
| <a id="property-secure_cookie-1"></a> `secure_cookie` | `boolean` | - |
| <a id="property-skip_first_touch_marketing"></a> `skip_first_touch_marketing` | `boolean` | - |
| <a id="property-stop_utm_persistence"></a> `stop_utm_persistence` | `boolean` | - |
| <a id="property-store_google"></a> `store_google` | `boolean` | - |
| <a id="property-test"></a> `test` | `boolean` | - |
| <a id="property-track_links_timeout"></a> `track_links_timeout` | `number` | - |
| <a id="property-track_pageview"></a> `track_pageview` | [`TrackPageView`](#trackpageview) | - |
| <a id="property-upgrade"></a> `upgrade` | `boolean` | - |
| <a id="property-verbose"></a> `verbose` | `boolean` | - |
| <a id="property-xhr_headers"></a> `xhr_headers` | [`XhrHeadersDef`](#xhrheadersdef) | - |

***

<a id="dict"></a>

### Dict

#### Indexable

> \[`key`: `string`\]: `any`

***

<a id="eventtriggerprops"></a>

### EventTriggerProps

#### Properties

| Property | Type |
| ------ | ------ |
| <a id="property-percentage"></a> `percentage` | `number` |
| <a id="property-property_filters"></a> `property_filters?` | `RulesLogic` |

***

<a id="flagsconfig"></a>

### FlagsConfig

#### Properties

| Property | Type |
| ------ | ------ |
| <a id="property-context"></a> `context?` | [`Dict`](#dict) |
| <a id="property-persistence-1"></a> `persistence?` | [`FlagsPersistencePolicy`](#flagspersistencepolicy) |

***

<a id="flagsmanager"></a>

### FlagsManager

#### Methods

<a id="are_flags_ready"></a>

##### are\_flags\_ready()

> **are\_flags\_ready**(): `boolean`

###### Returns

`boolean`

<a id="get_all_variants"></a>

##### get\_all\_variants()

> **get\_all\_variants**(): `Promise`\<`Map`\<`string`, [`FlagsVariant`](#flagsvariant)\>\>

###### Returns

`Promise`\<`Map`\<`string`, [`FlagsVariant`](#flagsvariant)\>\>

<a id="get_all_variants_sync"></a>

##### get\_all\_variants\_sync()

> **get\_all\_variants\_sync**(): `Map`\<`string`, [`FlagsVariant`](#flagsvariant)\>

###### Returns

`Map`\<`string`, [`FlagsVariant`](#flagsvariant)\>

<a id="get_variant"></a>

##### get\_variant()

> **get\_variant**(`featureName`, `fallback`): `Promise`\<[`FlagsVariant`](#flagsvariant)\>

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `featureName` | `string` |
| `fallback` | [`FlagsVariant`](#flagsvariant) |

###### Returns

`Promise`\<[`FlagsVariant`](#flagsvariant)\>

<a id="get_variant_sync"></a>

##### get\_variant\_sync()

> **get\_variant\_sync**(`featureName`, `fallback`): [`FlagsVariant`](#flagsvariant)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `featureName` | `string` |
| `fallback` | [`FlagsVariant`](#flagsvariant) |

###### Returns

[`FlagsVariant`](#flagsvariant)

<a id="get_variant_value"></a>

##### get\_variant\_value()

> **get\_variant\_value**(`featureName`, `fallbackValue`): `Promise`\<`any`\>

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `featureName` | `string` |
| `fallbackValue` | `any` |

###### Returns

`Promise`\<`any`\>

<a id="get_variant_value_sync"></a>

##### get\_variant\_value\_sync()

> **get\_variant\_value\_sync**(`featureName`, `fallbackValue`): `any`

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `featureName` | `string` |
| `fallbackValue` | `any` |

###### Returns

`any`

<a id="is_enabled"></a>

##### is\_enabled()

> **is\_enabled**(`featureName`, `fallbackValue?`): `Promise`\<`boolean`\>

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `featureName` | `string` |
| `fallbackValue?` | `boolean` |

###### Returns

`Promise`\<`boolean`\>

<a id="is_enabled_sync"></a>

##### is\_enabled\_sync()

> **is\_enabled\_sync**(`featureName`, `fallbackValue?`): `boolean`

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `featureName` | `string` |
| `fallbackValue?` | `boolean` |

###### Returns

`boolean`

<a id="load_flags"></a>

##### load\_flags()

> **load\_flags**(): `Promise`\<`void`\>

###### Returns

`Promise`\<`void`\>

<a id="update_context"></a>

##### update\_context()

> **update\_context**(`context`, `options?`): `Promise`\<`void`\>

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `context` | [`Dict`](#dict) |
| `options?` | [`FlagsUpdateContextOptions`](#flagsupdatecontextoptions) |

###### Returns

`Promise`\<`void`\>

<a id="when_ready"></a>

##### when\_ready()

> **when\_ready**(): `Promise`\<`void`\>

###### Returns

`Promise`\<`void`\>

***

<a id="flagsupdatecontextoptions"></a>

### FlagsUpdateContextOptions

#### Properties

| Property | Type |
| ------ | ------ |
| <a id="property-replace"></a> `replace?` | `boolean` |

***

<a id="flagsvariant"></a>

### FlagsVariant

#### Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="property-experiment_id"></a> `experiment_id?` | `string` | - |
| <a id="property-fallback_reason"></a> `fallback_reason?` | [`FlagsFallbackReason`](#flagsfallbackreason) | Undefined on success; set when `variant_source === 'fallback'`. |
| <a id="property-is_experiment_active"></a> `is_experiment_active?` | `boolean` | - |
| <a id="property-is_qa_tester"></a> `is_qa_tester?` | `boolean` | - |
| <a id="property-key"></a> `key` | `string` | - |
| <a id="property-persisted_at_in_ms"></a> `persisted_at_in_ms?` | `number` | - |
| <a id="property-value"></a> `value` | `any` | - |
| <a id="property-variant_source"></a> `variant_source?` | [`FlagsVariantSource`](#flagsvariantsource) | - |

***

<a id="hasoptedinoutoptions"></a>

### HasOptedInOutOptions

#### Extended by

- [`ClearOptOutInOutOptions`](#clearoptoutinoutoptions)

#### Properties

| Property | Type |
| ------ | ------ |
| <a id="property-cookie_prefix-1"></a> `cookie_prefix` | `string` |
| <a id="property-persistence_type-1"></a> `persistence_type` | [`Persistence`](#persistence) |

***

<a id="intrackingoptions"></a>

### InTrackingOptions

#### Extends

- [`ClearOptOutInOutOptions`](#clearoptoutinoutoptions)

#### Properties

| Property | Type | Inherited from |
| ------ | ------ | ------ |
| <a id="property-cookie_expiration-2"></a> `cookie_expiration` | `number` | [`ClearOptOutInOutOptions`](#clearoptoutinoutoptions).[`cookie_expiration`](#property-cookie_expiration) |
| <a id="property-cookie_prefix-2"></a> `cookie_prefix` | `string` | [`ClearOptOutInOutOptions`](#clearoptoutinoutoptions).[`cookie_prefix`](#property-cookie_prefix) |
| <a id="property-cross_subdomain_cookie-2"></a> `cross_subdomain_cookie` | `boolean` | [`ClearOptOutInOutOptions`](#clearoptoutinoutoptions).[`cross_subdomain_cookie`](#property-cross_subdomain_cookie) |
| <a id="property-persistence_type-2"></a> `persistence_type` | [`Persistence`](#persistence) | [`ClearOptOutInOutOptions`](#clearoptoutinoutoptions).[`persistence_type`](#property-persistence_type) |
| <a id="property-secure_cookie-2"></a> `secure_cookie` | `boolean` | [`ClearOptOutInOutOptions`](#clearoptoutinoutoptions).[`secure_cookie`](#property-secure_cookie) |
| <a id="property-track"></a> `track` | () => `void` | - |
| <a id="property-track_event_name"></a> `track_event_name` | `string` | - |
| <a id="property-track_properties"></a> `track_properties` | [`Dict`](#dict) | - |

***

<a id="networkdata"></a>

### NetworkData

#### Properties

| Property | Type |
| ------ | ------ |
| <a id="property-isinitial"></a> `isInitial?` | `boolean` |
| <a id="property-requests"></a> `requests` | [`NetworkRequest`](#networkrequest)[] |

***

<a id="networkfirstflagspolicy"></a>

### NetworkFirstFlagsPolicy

Network-first variant lookup - prioritizes freshness.
Attempts network fetch first, falls back to persisted variants on failure.

#### Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="property-persistencettlms"></a> `persistenceTtlMs?` | `number` | Time-to-live in milliseconds. Persisted variants older than this are discarded. Defaults to 24 hours. |
| <a id="property-variantlookuppolicy"></a> `variantLookupPolicy` | `"networkFirst"` | - |

***

<a id="networkonlyflagspolicy"></a>

### NetworkOnlyFlagsPolicy

Network-only variant lookup - no persistence. Default behavior.

#### Properties

| Property | Type |
| ------ | ------ |
| <a id="property-variantlookuppolicy-1"></a> `variantLookupPolicy` | `"networkOnly"` |

***

<a id="networkrecordoptions"></a>

### NetworkRecordOptions

#### Properties

| Property | Type |
| ------ | ------ |
| <a id="property-ignorerequestfn"></a> `ignoreRequestFn?` | (`data`) => `boolean` |
| <a id="property-ignorerequesturls"></a> `ignoreRequestUrls?` | `string`[] |
| <a id="property-initiatortypes"></a> `initiatorTypes?` | [`InitiatorType`](#initiatortype)[] |
| <a id="property-recordbodyurls"></a> `recordBodyUrls?` | `object` |
| `recordBodyUrls.request` | `string`[] |
| `recordBodyUrls.response` | `string`[] |
| <a id="property-recordheaders"></a> `recordHeaders?` | `object` |
| `recordHeaders.request` | `string`[] |
| `recordHeaders.response` | `string`[] |
| <a id="property-recordinitialrequests"></a> `recordInitialRequests?` | `boolean` |

***

<a id="networkrequest"></a>

### NetworkRequest

#### Properties

| Property | Type |
| ------ | ------ |
| <a id="property-endtime"></a> `endTime` | `number` |
| <a id="property-initiatortype"></a> `initiatorType` | [`InitiatorType`](#initiatortype) |
| <a id="property-method"></a> `method?` | `string` |
| <a id="property-requestbody"></a> `requestBody?` | `string` |
| <a id="property-requestheaders"></a> `requestHeaders?` | `Record`\<`string`, `string`\> |
| <a id="property-responsebody"></a> `responseBody?` | `string` |
| <a id="property-responseheaders"></a> `responseHeaders?` | `Record`\<`string`, `string`\> |
| <a id="property-starttime"></a> `startTime` | `number` |
| <a id="property-status"></a> `status?` | `number` |
| <a id="property-timeorigin"></a> `timeOrigin` | `number` |
| <a id="property-url"></a> `url` | `string` |

***

<a id="outtrackingoptions"></a>

### OutTrackingOptions

#### Extends

- [`ClearOptOutInOutOptions`](#clearoptoutinoutoptions)

#### Properties

| Property | Type | Inherited from |
| ------ | ------ | ------ |
| <a id="property-cookie_expiration-3"></a> `cookie_expiration` | `number` | [`ClearOptOutInOutOptions`](#clearoptoutinoutoptions).[`cookie_expiration`](#property-cookie_expiration) |
| <a id="property-cookie_prefix-3"></a> `cookie_prefix` | `string` | [`ClearOptOutInOutOptions`](#clearoptoutinoutoptions).[`cookie_prefix`](#property-cookie_prefix) |
| <a id="property-cross_subdomain_cookie-3"></a> `cross_subdomain_cookie` | `boolean` | [`ClearOptOutInOutOptions`](#clearoptoutinoutoptions).[`cross_subdomain_cookie`](#property-cross_subdomain_cookie) |
| <a id="property-delete_user"></a> `delete_user` | `boolean` | - |
| <a id="property-persistence_type-3"></a> `persistence_type` | [`Persistence`](#persistence) | [`ClearOptOutInOutOptions`](#clearoptoutinoutoptions).[`persistence_type`](#property-persistence_type) |
| <a id="property-secure_cookie-3"></a> `secure_cookie` | `boolean` | [`ClearOptOutInOutOptions`](#clearoptoutinoutoptions).[`secure_cookie`](#property-secure_cookie) |

***

<a id="persistenceuntilnetworksuccessflagspolicy"></a>

### PersistenceUntilNetworkSuccessFlagsPolicy

Serves persisted variants immediately while a network fetch runs in the background.
Once the fetch succeeds, its result replaces the cached variants for the rest of the session.

#### Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="property-persistencettlms-1"></a> `persistenceTtlMs?` | `number` | Time-to-live in milliseconds. Persisted variants older than this are discarded. Defaults to 24 hours. |
| <a id="property-variantlookuppolicy-2"></a> `variantLookupPolicy` | `"persistenceUntilNetworkSuccess"` | - |

***

<a id="recordingeventtriggers"></a>

### RecordingEventTriggers

#### Indexable

> \[`eventName`: `string`\]: [`EventTriggerProps`](#eventtriggerprops)

***

<a id="registeroptions"></a>

### RegisterOptions

#### Properties

| Property | Type |
| ------ | ------ |
| <a id="property-persistent"></a> `persistent` | `boolean` |

***

<a id="requestoptions"></a>

### RequestOptions

#### Properties

| Property | Type |
| ------ | ------ |
| <a id="property-send_immediately"></a> `send_immediately?` | `boolean` |
| <a id="property-transport"></a> `transport?` | `"sendBeacon"` \| `"xhr"` |

***

<a id="xhrheadersdef"></a>

### XhrHeadersDef

#### Indexable

> \[`header`: `string`\]: `any`

## Type Aliases

<a id="apipayloadformat"></a>

### ApiPayloadFormat

> **ApiPayloadFormat** = `"base64"` \| `"json"`

***

<a id="callback"></a>

### Callback

> **Callback** = (`response`) => `void`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `response` | [`Response`](#response) |

#### Returns

`void`

***

<a id="deadclickconfig"></a>

### DeadClickConfig

> **DeadClickConfig** = `boolean` \| \{ `timeout_ms?`: `number`; \}

#### Union Members

`boolean`

***

##### Type Literal

\{ `timeout_ms?`: `number`; \}

| Name | Type | Description |
| ------ | ------ | ------ |
| `timeout_ms?` | `number` | Time in milliseconds to wait after a click before qualifying it as dead (default: 500) |

***

<a id="flagsfallbackreason"></a>

### FlagsFallbackReason

> **FlagsFallbackReason** = `"FLAG_NOT_FOUND"` \| `"NOT_READY"` \| `"BACKEND_ERROR"`

Why the SDK returned the developer fallback. Only meaningful when
`variant_source === 'fallback'`. Matches the constant set used by
mixpanel-php so the OpenFeature wrapper can map each reason to the
spec-correct error code.

***

<a id="flagspersistencepolicy"></a>

### FlagsPersistencePolicy

> **FlagsPersistencePolicy** = [`NetworkOnlyFlagsPolicy`](#networkonlyflagspolicy) \| [`NetworkFirstFlagsPolicy`](#networkfirstflagspolicy) \| [`PersistenceUntilNetworkSuccessFlagsPolicy`](#persistenceuntilnetworksuccessflagspolicy)

***

<a id="flagsvariantsource"></a>

### FlagsVariantSource

> **FlagsVariantSource** = `"network"` \| `"persistence"` \| `"fallback"`

Where a variant came from. Coarse-grained — see [FlagsFallbackReason](#flagsfallbackreason)
for the specific reason behind a fallback.

***

<a id="initiatortype"></a>

### InitiatorType

> **InitiatorType** = `"audio"` \| `"beacon"` \| `"body"` \| `"css"` \| `"early-hint"` \| `"embed"` \| `"fetch"` \| `"frame"` \| `"iframe"` \| `"icon"` \| `"image"` \| `"img"` \| `"input"` \| `"link"` \| `"navigation"` \| `"object"` \| `"ping"` \| `"script"` \| `"track"` \| `"video"` \| `"xmlhttprequest"`

***

<a id="normalresponse"></a>

### NormalResponse

> **NormalResponse** = `1` \| `0`

***

<a id="persistence"></a>

### Persistence

> **Persistence** = `"cookie"` \| `"localStorage"`

***

<a id="pushitem"></a>

### PushItem

> **PushItem** = (`string` \| [`Dict`](#dict) \| ((`this`) => `void`))[]

***

<a id="query"></a>

### Query

> **Query** = `string` \| `Element` \| `Element`[]

***

<a id="rageclickconfig"></a>

### RageClickConfig

> **RageClickConfig** = `boolean` \| \{ `click_count?`: `number`; `interactive_elements_only?`: `boolean`; `threshold_px?`: `number`; `timeout_ms?`: `number`; \}

#### Union Members

`boolean`

***

##### Type Literal

\{ `click_count?`: `number`; `interactive_elements_only?`: `boolean`; `threshold_px?`: `number`; `timeout_ms?`: `number`; \}

| Name | Type | Description |
| ------ | ------ | ------ |
| `click_count?` | `number` | Number of clicks required to trigger a rage click event (default: 3) |
| `interactive_elements_only?` | `boolean` | Whether to only track rage clicks on interactive elements like buttons, links, inputs (default: false) |
| `threshold_px?` | `number` | Distance threshold in pixels for clicks to be considered within the same area (default: 30) |
| `timeout_ms?` | `number` | Time window in milliseconds for clicks to be considered rapid (default: 1000) |

***

<a id="remotesettingtype"></a>

### RemoteSettingType

> **RemoteSettingType** = `"disabled"` \| `"fallback"` \| `"strict"`

***

<a id="response"></a>

### Response

> **Response** = [`VerboseResponse`](#verboseresponse) \| [`NormalResponse`](#normalresponse)

***

<a id="trackpageview"></a>

### TrackPageView

> **TrackPageView** = `boolean` \| `"url-with-path"` \| `"url-with-path-and-query-string"` \| `"full-url"`

***

<a id="verboseresponse"></a>

### VerboseResponse

> **VerboseResponse** = \{ `error`: `null`; `status`: `1`; \} \| \{ `error`: `string`; `status`: `0`; \}
