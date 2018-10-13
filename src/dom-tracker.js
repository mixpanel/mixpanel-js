import {_, console, window} from './utils';

/**
 * DomTracker Object
 * @constructor
 */
var DomTracker = function() {};

// interface
DomTracker.prototype.create_properties = function() {};
DomTracker.prototype.event_handler = function() {};
DomTracker.prototype.after_track_handler = function() {};

DomTracker.prototype.init = function(mixpanel_instance) {
    this.mp = mixpanel_instance;
    return this;
};

/**
 * @param {Object|string} query
 * @param {string} event_name
 * @param {Object=} properties
 * @param {function(...[*])=} user_callback
 */
DomTracker.prototype.track = function(query, event_name, properties, user_callback) {
    var that = this;
    var elements = _.dom_query(query);

    if (elements.length === 0) {
        console.error('The DOM query (' + query + ') returned 0 elements');
        return;
    }

    _.each(elements, function(element) {
        _.register_event(element, this.override_event, function(e) {
            var options = {};
            var props = that.create_properties(properties, this);
            var timeout = that.mp.get_config('track_links_timeout');

            that.event_handler(e, this, options);

            // in case the mixpanel servers don't get back to us in time
            window.setTimeout(that.track_callback(user_callback, props, options, true), timeout);

            // fire the tracking event
            that.mp.track(event_name, props, that.track_callback(user_callback, props, options));
        });
    }, this);

    return true;
};

/**
 * @param {function(...[*])} user_callback
 * @param {Object} props
 * @param {Object} options
 * @param {boolean} options.callback_fired
 * @param {boolean=} timeout_occurred
 */
DomTracker.prototype.track_callback = function(user_callback, props, options, timeout_occurred) {
    timeout_occurred = timeout_occurred || false;
    var that = this;

    return function() {
        // options is referenced from both callbacks, so we can have
        // a 'lock' of sorts to ensure only one fires
        if (options.callback_fired) { return; }
        options.callback_fired = true;

        if (user_callback && user_callback(timeout_occurred, props) === false) {
            // user can prevent the default functionality by
            // returning false from their callback
            return;
        }

        that.after_track_handler(props, options, timeout_occurred);
    };
};

DomTracker.prototype.create_properties = function(properties, element) {
    var props;

    if (typeof(properties) === 'function') {
        props = properties(element);
    } else {
        props = _.extend({}, properties);
    }

    return props;
};

export default DomTracker;
