import {_, window} from './utils';
import DomTracker from './dom-tracker';

/**
 * LinkTracker Object
 * @constructor
 * @extends DomTracker
 */
var LinkTracker = function() {
    this.override_event = 'click';
};
_.inherit(LinkTracker, DomTracker);

LinkTracker.prototype.create_properties = function(properties, element) {
    var props = LinkTracker.superclass.create_properties.apply(this, arguments);

    if (element.href) { props['url'] = element.href; }

    return props;
};

LinkTracker.prototype.event_handler = function(evt, element, options) {
    options.new_tab = (
      evt.which === 2 ||
      evt.metaKey ||
      evt.ctrlKey ||
      element.target === '_blank'
    );
    options.href = element.href;

    if (!options.new_tab) {
        evt.preventDefault();
    }
};

LinkTracker.prototype.after_track_handler = function(props, options) {
    if (options.new_tab) { return; }

    setTimeout(function() {
        window.location = options.href;
    }, 0);
};

export default LinkTracker;
