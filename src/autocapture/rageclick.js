/** @const */ var DEFAULT_RAGE_CLICK_THRESHOLD_PX = 30;
/** @const */ var DEFAULT_RAGE_CLICK_TIMEOUT_MS = 1000;
/** @const */ var DEFAULT_RAGE_CLICK_CLICK_COUNT = 4;

function RageClickTracker() {
    this.clicks = [];
}

RageClickTracker.prototype.isRageClick = function(x, y, options) {
    options = options || {};
    var thresholdPx = options['threshold_px'] || DEFAULT_RAGE_CLICK_THRESHOLD_PX;
    var timeoutMs = options['timeout_ms'] || DEFAULT_RAGE_CLICK_TIMEOUT_MS;
    var clickCount = options['click_count'] || DEFAULT_RAGE_CLICK_CLICK_COUNT;
    var timestamp = Date.now();

    var lastClick = this.clicks[this.clicks.length - 1];
    if (
        lastClick &&
        timestamp - lastClick.timestamp < timeoutMs &&
        Math.sqrt(Math.pow(x - lastClick.x, 2) + Math.pow(y - lastClick.y, 2)) < thresholdPx
    ) {
        this.clicks.push({ x: x, y: y, timestamp: timestamp });
        if (this.clicks.length >= clickCount) {
            this.clicks = [];
            return true;
        }
    } else {
        this.clicks = [{ x: x, y: y, timestamp: timestamp }];
    }
    return false;
};

export {
    RageClickTracker,
    DEFAULT_RAGE_CLICK_THRESHOLD_PX,
    DEFAULT_RAGE_CLICK_TIMEOUT_MS,
    DEFAULT_RAGE_CLICK_CLICK_COUNT
};
