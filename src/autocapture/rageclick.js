// RageClickTracker: Detects rage clicks (rapid, clustered clicks)
// Criteria: 3 clicks within 600ms, within 20px Manhattan distance

const RAGE_CLICK_THRESHOLD_PX = 20;
const RAGE_CLICK_TIMEOUT_MS = 600;
const RAGE_CLICK_CLICK_COUNT = 3;

class RageClickTracker {
    constructor() {
        this.clicks = [];
    }

    isRageClick(x, y, timestamp) {
        const lastClick = this.clicks[this.clicks.length - 1];
        if (
            lastClick &&
            Math.abs(x - lastClick.x) + Math.abs(y - lastClick.y) < RAGE_CLICK_THRESHOLD_PX &&
            timestamp - lastClick.timestamp < RAGE_CLICK_TIMEOUT_MS
        ) {
            this.clicks.push({ x, y, timestamp });
            if (this.clicks.length === RAGE_CLICK_CLICK_COUNT) {
                this.clicks = [];
                return true;
            }
        } else {
            this.clicks = [{ x, y, timestamp }];
        }
        return false;
    }
}

export { RageClickTracker, RAGE_CLICK_THRESHOLD_PX, RAGE_CLICK_TIMEOUT_MS, RAGE_CLICK_CLICK_COUNT };
