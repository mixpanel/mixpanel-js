var RAGE_CLICK_THRESHOLD_PX = 30;
var RAGE_CLICK_TIMEOUT_MS = 1000;
var RAGE_CLICK_CLICK_COUNT = 3;

function RageClickTracker() {
    this.clicks = [];
}

RageClickTracker.prototype.isRageClick = function(x, y, timestamp) {
    var lastClick = this.clicks[this.clicks.length - 1];
    if (
        lastClick &&
        Math.abs(x - lastClick.x) + Math.abs(y - lastClick.y) < RAGE_CLICK_THRESHOLD_PX &&
        timestamp - lastClick.timestamp < RAGE_CLICK_TIMEOUT_MS
    ) {
        this.clicks.push({ x: x, y: y, timestamp: timestamp });
        if (this.clicks.length === RAGE_CLICK_CLICK_COUNT) {
            this.clicks = [];
            return true;
        }
    } else {
        this.clicks = [{ x: x, y: y, timestamp: timestamp }];
    }
    return false;
};

export { RageClickTracker, RAGE_CLICK_THRESHOLD_PX, RAGE_CLICK_TIMEOUT_MS, RAGE_CLICK_CLICK_COUNT };
