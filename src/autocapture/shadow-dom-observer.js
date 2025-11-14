import { getClickEventComposedPath, getClickEventTargetElement, logger, weakSetSupported } from './utils';

function ShadowDOMObserver(changeCallback, observerConfig) {
    this.changeCallback = changeCallback || function() {};
    this.observerConfig = observerConfig;

    this.observedShadowRoots = null;
    this.shadowObservers = [];
}

ShadowDOMObserver.prototype.getEventTarget = function(event) {
    if (!this.observedShadowRoots) {
        return;
    }

    return getClickEventTargetElement(event);
};

ShadowDOMObserver.prototype.observeFromEvent = function(event) {
    if (!this.observedShadowRoots) {
        return;
    }

    var path = getClickEventComposedPath(event);

    // Check each element in path for shadow roots
    for (var i = 0; i < path.length; i++) {
        var element = path[i];

        if (element && element.shadowRoot) {
            this.observeShadowRoot(element.shadowRoot);
        }
    }
};


ShadowDOMObserver.prototype.observeShadowRoot = function(shadowRoot) {
    if (!this.observedShadowRoots || this.observedShadowRoots.has(shadowRoot)) {
        return;
    }

    var self = this;

    try {
        this.observedShadowRoots.add(shadowRoot);

        var observer = new window.MutationObserver(function() {
            self.changeCallback();
        });

        observer.observe(shadowRoot, this.observerConfig);
        this.shadowObservers.push(observer);
    } catch (e) {
        logger.critical('Error while observing shadow root', e);
    }
};


ShadowDOMObserver.prototype.start = function() {
    if (this.observedShadowRoots) {
        return;
    }

    if (!weakSetSupported()) {
        logger.critical('Shadow DOM observation unavailable: WeakSet not supported');
        return;
    }

    this.observedShadowRoots = new WeakSet();
};

ShadowDOMObserver.prototype.stop = function() {
    if (!this.observedShadowRoots) {
        return;
    }

    for (var i = 0; i < this.shadowObservers.length; i++) {
        try {
            this.shadowObservers[i].disconnect();
        } catch (e) {
            logger.critical('Error while disconnecting shadow DOM observer', e);
        }
    }
    this.shadowObservers = [];
    this.observedShadowRoots = null;
};

export { ShadowDOMObserver };
