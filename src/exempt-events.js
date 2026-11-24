/**
 * The anonymous audience events consent_mode 'exempt' sends before consent: page views, clicks,
 * scrolls and page exits, with properties that can't identify the visitor.
 */
import { _ } from './utils';

var EXEMPT_EVENTS = ['$mp_web_page_view', '$mp_click', '$mp_scroll', '$mp_page_leave'];

var EXEMPT_PROPERTIES = [
    'token',
    'time',
    'mp_lib',
    '$lib_version',
    '$insert_id',
    '$mp_autocapture',
    '$os',
    '$browser',
    '$browser_version',
    '$device',
    '$referring_domain',
    '$current_url',
    'current_page_title',
    'current_domain',
    'current_url_path',
    'current_url_protocol',
    '$el_attr__href',
    '$scroll_percentage',
    '$scroll_checkpoint',
    '$max_scroll_percentage'
];

// sent as origin and path
var URL_PROPERTIES = ['$current_url', '$el_attr__href'];

// what browsers drop before parsing an href: leading and trailing spaces and control characters
// (everything below '!'), and any tab or newline
var URL_IGNORED_CHARACTERS = /^[^!-\uffff]+|[^!-\uffff]+$|[\t\n\r]/g;
// scheme, credentials (up to the last @, as browsers split them), host, path
var ABSOLUTE_HTTP_URL = /^(https?:\/\/)(?:[^/?#]*@)?([^/?#]*)([^?#]*)/i;
// a relative URL: no scheme and not protocol-relative, which browsers also read from \\ and /\
var RELATIVE_URL = /^(?![a-z][a-z0-9+.-]*:|[\\/]{2})([^?#]*)/i;

var SECONDS_PER_HOUR = 3600;

/**
 * The properties to send for an event before consent, or null if the event isn't sent.
 * @param {string} eventName
 * @param {Object} properties the event's properties after property_blacklist
 * @param {{events: Array<string>|undefined, properties: Array<string>|undefined}} extraAllowed
 *     the consent_exempt_allowlist config, which adds events and properties to the defaults
 * @returns {Object|null}
 */
export function exemptEventProperties(eventName, properties, extraAllowed) {
    var allowedEvents = EXEMPT_EVENTS.concat(extraAllowed['events'] || []);
    if (!_.include(allowedEvents, eventName)) {
        return null;
    }

    var allowedProperties = EXEMPT_PROPERTIES.concat(extraAllowed['properties'] || []);
    var exemptProperties = {};
    _.each(allowedProperties, function(property) {
        if (Object.prototype.hasOwnProperty.call(properties, property)) {
            exemptProperties[property] = properties[property];
        }
    });

    _.each(URL_PROPERTIES, function(property) {
        if (property in exemptProperties) {
            var originAndPath = urlOriginAndPath(exemptProperties[property]);
            if (originAndPath === null) {
                delete exemptProperties[property];
            } else {
                exemptProperties[property] = originAndPath;
            }
        }
    });
    if (_.isNumber(exemptProperties['$browser_version'])) {
        exemptProperties['$browser_version'] = Math.floor(exemptProperties['$browser_version']);
    }
    if (_.isNumber(exemptProperties['time'])) {
        exemptProperties['time'] = Math.floor(exemptProperties['time'] / SECONDS_PER_HOUR) * SECONDS_PER_HOUR;
    }
    exemptProperties['$mp_exempt'] = true;
    return exemptProperties;
}

/**
 * An http(s) or relative URL without credentials, query string or fragment; null for any other URL,
 * such as mailto: or tel: links.
 * @param {*} url
 * @returns {string|null}
 */
function urlOriginAndPath(url) {
    if (!_.isString(url)) {
        return null;
    }
    url = url.replace(URL_IGNORED_CHARACTERS, '');
    var absolute = ABSOLUTE_HTTP_URL.exec(url);
    if (absolute) {
        return absolute[1] + absolute[2] + absolute[3];
    }
    var relative = RELATIVE_URL.exec(url);
    return relative ? relative[1] : null;
}
