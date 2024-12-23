# Mixpanel JavaScript SDK wrapper for Google Tag Manager
The purpose of this wrapper is to provide a JavaScript interface for interacting with the `window.mixpanel` interface.

The wrapper has been designed with [Google Tag Manager](https://tagmanager.google.com) in mind. GTM's [custom templates](https://developers.google.com/tag-manager/templates) offer a way to deploy custom JavaScript without having to resort to Custom HTML tags and with the ability to craft a user interface for the scripts within Google Tag Manager.

However, one of the defining features of custom templates is their [sandboxed JavaScript API](https://developers.google.com/tag-manager/templates/sandboxed-javascript) inventory, which severely restricts what type of browser JavaScript can be executed in the template code.

Mixpanel's [JavaScript SDK](https://developer.mixpanel.com/docs/javascript-full-api-reference) makes use of JavaScript features which are not permitted by the sandbox of GTM's custom templates (e.g. object instances initiated with the `new` keyword, `this` and `prototype`, etc.).

Thus, in order to interact with Mixpanel's JavaScript SDK via Google Tag Manager's custom templates (or any other context where the aforementioned JavaScript features cannot be used), this wrapper is required. [The template loads this wrapper](https://github.com/mixpanel/mixpanel-gtm-template/blob/2f577d826acc7d96d138367db339035b8f9df359/src/template.tpl#L1383) in the sandboxed template code.

# Deployment
The wrapper is served by the Mixpanel CDN at https://cdn.mxpnl.com/libs/mixpanel-js-wrapper.js

# How it works
When the wrapper JavaScript is loaded in the browser, the global method `window._mixpanel()` is created for interacting with the wrapper.

This namespace includes all the methods supported by the [JavaScript SDK](https://developer.mixpanel.com/docs/javascript-full-api-reference) with some exceptions (see below). Each method can be invoked by passing the command name as the first argument of the call to `window._mixpanel()`.

If this command name is prefixed with `<string>.`, then `<string>` will be used as the [library name](https://developer.mixpanel.com/docs/javascript-full-api-reference#mixpanelinit). After the command, all additional arguments are processed as arguments to the command method itself.

For example, to dispatch an event named `Add To Cart` using a custom library name, you could use this command:

```
window._mixpanel(
    'myTracker.track', // Run the track command and utilize the library name "myTracker"
    'Add To Cart', // Event name is the first argument to the track command
    {product_id: 'shirt123'} // (optional) Event parameters are the second argument to the track command
);
```

## `group`
[Link to specification](https://developer.mixpanel.com/docs/javascript-full-api-reference#mixpanelgroup)

Use this command to interact with group properties.

Syntax:

`window._mixpanel('<library_name.>group.<group_command>', ['<group_key>', '<group_id>'], <parameters>)`

Example:
```
// Union a property for a group
window._mixpanel(
    'group.union',
    ['my_group_key', 'my_group_id'],
    'location',
    ['San Francisco', 'London']
);
```

| Parameter name | Description |
|----------------|-------------|
| `library_name` | (Optional) target a specific library/instance name with this command |
| `group_command` | (Required) one of `set`, `set_once`, `remove`, `union`, `unset` |
| `parameters` | All the parameters you want to submit to the `group` command. |

## `people`
[Link to specification](https://developer.mixpanel.com/docs/javascript-full-api-reference#mixpanelpeople)

Interact with the people analytics property.

Syntax:

`window._mixpanel('<library_name.>people.<people_command>', <parameters>)`

Example:
```
// Set the "gender" property "n/a"
window._mixpanel(
    'people.set',
    'gender',
    'n/a'
);
```

| Parameter name | Description |
|----------------|-------------|
| `library_name` | (Optional) target a specific library/instance name with this command |
| `people_command` | (Required) one of `append`, `clear_charge`, `delete_user`, `increment`, `remove`, `set`, `set_once`, `track_charge`, `union`, `unset` |
| `parameters` | All the parameters you want to submit to the `people` command. |

## Other commands

All other commands can be sent to the `_mixpanel` interface like this:

`window._mixpanel('<library_name.><command_name>', <parameters>)`

Example:

```
window._mixpanel(
    'my_mixpanel.register',
    {'Account Type': 'Free'}
);
```

## Exceptions

Because the wrapper only pipes commands to the actual `window.mixpanel` interface, the wrapper cannot be used for get-methods. So the following commands **are not** supported by the wrapper:

`get_config`
`get_distinct_id`
`get_group`
`get_property`
`has_opted_in_tracking`
`has_opted_out_tracking`

The following commands are also disabled due to not being relevant with the wrapper:

`push`
`init`

Initialization is done with the `window.mixpanel` interface directly, and `push` is already used by the wrapper to forward calls to the main interface.