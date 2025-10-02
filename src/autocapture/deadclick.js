import { EV_CHANGE, EV_HASHCHANGE, EV_INPUT, EV_SCROLLEND, EV_SELECT, EV_SUBMIT, EV_TOGGLE, isDefinitelyNonInteractive, logger } from './utils';
import { ShadowDOMObserver } from './shadow-dom-observer';

/** @const */ var DEFAULT_DEAD_CLICK_TIMEOUT_MS = 500;
/** @const */ var INTERACTION_EVENTS = [EV_CHANGE, EV_INPUT, EV_SUBMIT, EV_SELECT, EV_TOGGLE];
/** @const */ var LAYOUT_EVENTS = [EV_SCROLLEND];
/** @const */ var NAVIGATION_EVENTS = [EV_HASHCHANGE];
/** @const */ var MUTATION_OBSERVER_CONFIG = {
    characterData: true,
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['style', 'class', 'hidden', 'checked', 'selected', 'value', 'display', 'visibility']
};


function DeadClickTracker(onDeadClickCallback) {
    this.eventListeners = [];
    this.mutationObserver = null;
    this.shadowDOMObserver = null;

    this.isTracking = false;
    this.lastChangeEventTimestamp = 0;
    this.pendingClicks = [];
    this.onDeadClickCallback = onDeadClickCallback;
    this.processingActive = false;
    this.processingTimeout = null;
}


DeadClickTracker.prototype.addClick = function(event) {
    var element = this.shadowDOMObserver && this.shadowDOMObserver.getEventTarget(event);

    if (!element) {
        element = event['target'] || event['srcElement'];
    }

    if (!element || isDefinitelyNonInteractive(element)) {
        return false;
    }

    if (this.shadowDOMObserver) {
        this.shadowDOMObserver.observeFromEvent(event);
    }
    this.pendingClicks.push({
        element: element,
        event: event,
        timestamp: Date.now()
    });
    return true;
};

DeadClickTracker.prototype.trackClick = function(event, config) {
    if (!this.isTracking) {
        return false;
    }

    var added = this.addClick(event);
    if (added) {
        this.triggerProcessing(config);
    }
    return added;
};

DeadClickTracker.prototype.getDeadClicks = function(config) {
    if (this.pendingClicks.length === 0) {
        return [];
    }

    var timeoutMs = config['timeout_ms'];
    var now = Date.now();
    var clicksToEvaluate = this.pendingClicks.slice(); // Copy array
    this.pendingClicks = []; // Clear original

    var deadClicks = [];

    for (var i = 0; i < clicksToEvaluate.length; i++) {
        var click = clicksToEvaluate[i];

        if (now - click.timestamp >= timeoutMs) {
            // Click has exceeded timeout, check if it's dead by looking for changes after this specific click
            if (!this.hasChangesAfter(click.timestamp)) {
                deadClicks.push(click);
            }
        } else {
            // Still pending - add back
            this.pendingClicks.push(click);
        }
    }

    return deadClicks;
};

DeadClickTracker.prototype.hasChangesAfter = function(timestamp) {
    // 100ms tolerance for race condition between when we record the click and the change event
    return this.lastChangeEventTimestamp >= (timestamp - 100);
};

DeadClickTracker.prototype.recordChangeEvent = function() {
    this.lastChangeEventTimestamp = Date.now();
};

DeadClickTracker.prototype.triggerProcessing = function(config) {
    // Prevent multiple concurrent processing chains
    if (this.processingActive) {
        return;
    }
    this.processingActive = true;
    this.processRecursively(config);
};

DeadClickTracker.prototype.processRecursively = function(config) {
    if (!this.isTracking || !this.onDeadClickCallback) {
        this.processingActive = false;
        return;
    }

    var timeoutMs = config['timeout_ms'];
    var self = this;

    this.processingTimeout = setTimeout(function() {
        if (!self.processingActive) {
            return;
        }

        var deadClicks = self.getDeadClicks(config);

        for (var i = 0; i < deadClicks.length; i++) {
            self.onDeadClickCallback(deadClicks[i].event);
        }

        if (self.pendingClicks.length > 0) {
            self.processRecursively(config);
        } else {
            self.processingActive = false;
        }
    }, timeoutMs);
};

DeadClickTracker.prototype.startTracking = function() {
    if (this.isTracking) {
        return;
    }

    this.isTracking = true;

    var self = this;

    INTERACTION_EVENTS.forEach(function(event) {
        var handler = function() {
            self.recordChangeEvent();
        };
        document.addEventListener(event, handler, { capture: true, passive: true });
        self.eventListeners.push({ target: document, event: event, handler: handler, options: { capture: true, passive: true } });
    });
    NAVIGATION_EVENTS.forEach(function(event) {
        var handler = function() {
            self.recordChangeEvent();
        };
        window.addEventListener(event, handler);
        self.eventListeners.push({ target: window, event: event, handler: handler });
    });
    LAYOUT_EVENTS.forEach(function(event) {
        var handler = function() {
            self.recordChangeEvent();
        };
        window.addEventListener(event, handler, { passive: true });
        self.eventListeners.push({ target: window, event: event, handler: handler, options: { passive: true } });
    });
    var selectionHandler = function() {
        self.recordChangeEvent();
    };
    document.addEventListener('selectionchange', selectionHandler);
    self.eventListeners.push({ target: document, event: 'selectionchange', handler: selectionHandler });

    // Set up MutationObserver
    if (window.MutationObserver) {
        try {
            this.mutationObserver = new window.MutationObserver(function() {
                self.recordChangeEvent();
            });

            this.mutationObserver.observe(document.body || document.documentElement, MUTATION_OBSERVER_CONFIG);
        } catch (e) {
            logger.critical('Error while setting up mutation observer', e);
        }
    }

    // Set up Shadow DOM observer
    if (window.customElements) {
        try {
            this.shadowDOMObserver = new ShadowDOMObserver(
                function() {
                    self.recordChangeEvent();
                },
                MUTATION_OBSERVER_CONFIG
            );
            this.shadowDOMObserver.start();
        } catch (e) {
            logger.critical('Error while setting up shadow DOM observer', e);
            this.shadowDOMObserver = null;
        }
    }
};

DeadClickTracker.prototype.stopTracking = function() {
    if (!this.isTracking) {
        return;
    }

    this.isTracking = false;
    this.pendingClicks = [];
    this.lastChangeEventTimestamp = 0;
    this.processingActive = false;

    if (this.processingTimeout) {
        clearTimeout(this.processingTimeout);
        this.processingTimeout = null;
    }

    // Remove all event listeners
    for (var i = 0; i < this.eventListeners.length; i++) {
        var listener = this.eventListeners[i];
        try {
            listener.target.removeEventListener(listener.event, listener.handler, listener.options);
        } catch (e) {
            logger.critical('Error while removing event listener', e);
        }
    }
    this.eventListeners = [];

    if (this.mutationObserver) {
        try {
            this.mutationObserver.disconnect();
        } catch (e) {
            logger.critical('Error while disconnecting mutation observer', e);
        }
        this.mutationObserver = null;
    }

    if (this.shadowDOMObserver) {
        try {
            this.shadowDOMObserver.stop();
        } catch (e) {
            logger.critical('Error while stopping shadow DOM observer', e);
        }
        this.shadowDOMObserver = null;
    }
};

export {
    DeadClickTracker,
    DEFAULT_DEAD_CLICK_TIMEOUT_MS
};
