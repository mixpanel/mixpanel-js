import { expect } from 'chai';
import sinon from 'sinon';

import {
  RageClickTracker,
  DEFAULT_RAGE_CLICK_THRESHOLD_PX,
  DEFAULT_RAGE_CLICK_TIMEOUT_MS,
} from '../../src/autocapture/rageclick';

import jsdomSetup from './jsdom-setup';

describe(`RageClickTracker`, function() {
  jsdomSetup();

  let rageClickTrackerInstance;
  let clock;

  beforeEach(function() {
    clock = sinon.useFakeTimers();
    rageClickTrackerInstance = new RageClickTracker();
  });

  afterEach(function() {
    clock.restore();
  });

  describe(`isRageClick correctly identifies rage clicks`, function() {
    it(`should return false for first click`, function() {
      const result = rageClickTrackerInstance.isRageClick(100, 100, {});
      expect(result).to.be.false;
      expect(rageClickTrackerInstance.clicks).to.have.length(1);
    });

    it(`should return false for second click within threshold`, function() {
      rageClickTrackerInstance.isRageClick(100, 100, {});
      clock.tick(100);
      const result = rageClickTrackerInstance.isRageClick(105, 105, {});
      expect(result).to.be.false;
      expect(rageClickTrackerInstance.clicks).to.have.length(2);
    });

    it(`should return true for third click within threshold and timeout`, function() {
      rageClickTrackerInstance.isRageClick(100, 100, {});
      clock.tick(100);
      rageClickTrackerInstance.isRageClick(105, 105, {});
      clock.tick(100);
      const result = rageClickTrackerInstance.isRageClick(110, 110, {});
      expect(result).to.be.true;
      expect(rageClickTrackerInstance.clicks).to.have.length(0); // should reset after rage click
    });

    it(`should reset clicks array when click is outside threshold`, function() {
      rageClickTrackerInstance.isRageClick(100, 100, {});
      clock.tick(100);
      rageClickTrackerInstance.isRageClick(105, 105, {});
      clock.tick(100);
      // Click far away (outside threshold)
      const result = rageClickTrackerInstance.isRageClick(200, 200, {});
      expect(result).to.be.false;
      expect(rageClickTrackerInstance.clicks).to.have.length(1);
      expect(rageClickTrackerInstance.clicks[0].x).to.equal(200);
      expect(rageClickTrackerInstance.clicks[0].y).to.equal(200);
    });

    it(`should reset clicks array when click is outside timeout`, function() {
      rageClickTrackerInstance.isRageClick(100, 100, {});
      clock.tick(100);
      rageClickTrackerInstance.isRageClick(105, 105, {});
      clock.tick(1500); // Exceed timeout
      // Click after timeout
      const result = rageClickTrackerInstance.isRageClick(110, 110, {});
      expect(result).to.be.false;
      expect(rageClickTrackerInstance.clicks).to.have.length(1);
    });

    it(`should handle clicks exactly at threshold boundary`, function() {
      rageClickTrackerInstance.isRageClick(100, 100, {});
      clock.tick(100);
      // Click exactly at threshold distance (Euclidean distance = DEFAULT_RAGE_CLICK_THRESHOLD_PX - 1)
      const result = rageClickTrackerInstance.isRageClick(100 + DEFAULT_RAGE_CLICK_THRESHOLD_PX - 1, 100, {});
      expect(result).to.be.false;
      expect(rageClickTrackerInstance.clicks).to.have.length(2);
    });

    it(`should reject clicks at threshold distance`, function() {
      rageClickTrackerInstance.isRageClick(100, 100, {});
      clock.tick(100);
      // Click exactly at threshold distance (Euclidean distance = DEFAULT_RAGE_CLICK_THRESHOLD_PX)
      const result = rageClickTrackerInstance.isRageClick(100 + DEFAULT_RAGE_CLICK_THRESHOLD_PX, 100, {});
      expect(result).to.be.false;
      expect(rageClickTrackerInstance.clicks).to.have.length(1);
      expect(rageClickTrackerInstance.clicks[0].x).to.equal(100 + DEFAULT_RAGE_CLICK_THRESHOLD_PX);
    });

    it(`should handle clicks exactly at timeout boundary`, function() {
      rageClickTrackerInstance.isRageClick(100, 100, {});
      clock.tick(DEFAULT_RAGE_CLICK_TIMEOUT_MS - 1);
      // Click exactly at timeout boundary
      const result = rageClickTrackerInstance.isRageClick(105, 105, {});
      expect(result).to.be.false;
      expect(rageClickTrackerInstance.clicks).to.have.length(2);
    });

    it(`should reject clicks at timeout boundary`, function() {
      rageClickTrackerInstance.isRageClick(100, 100, {});
      clock.tick(DEFAULT_RAGE_CLICK_TIMEOUT_MS);
      // Click exactly at timeout
      const result = rageClickTrackerInstance.isRageClick(105, 105, {});
      expect(result).to.be.false;
      expect(rageClickTrackerInstance.clicks).to.have.length(1);
    });

    it(`should calculate Euclidean distance correctly`, function() {
      rageClickTrackerInstance.isRageClick(100, 100, {});
      clock.tick(100);
      const result = rageClickTrackerInstance.isRageClick(110, 115, {});
      expect(result).to.be.false;
      expect(rageClickTrackerInstance.clicks).to.have.length(2);
    });

    it(`should handle negative coordinates`, function() {
      rageClickTrackerInstance.isRageClick(-100, -100, {});
      clock.tick(100);
      const result = rageClickTrackerInstance.isRageClick(-105, -105, {});
      expect(result).to.be.false;
      expect(rageClickTrackerInstance.clicks).to.have.length(2);
    });

    it(`should handle zero coordinates`, function() {
      rageClickTrackerInstance.isRageClick(0, 0, {});
      clock.tick(100);
      const result = rageClickTrackerInstance.isRageClick(5, 5, {});
      expect(result).to.be.false;
      expect(rageClickTrackerInstance.clicks).to.have.length(2);
    });

    it(`should reset when Euclidean distance exceeds threshold`, function() {
      rageClickTrackerInstance.isRageClick(100, 100, {});
      clock.tick(100);
      const result = rageClickTrackerInstance.isRageClick(122, 122, {});
      expect(result).to.be.false;
      expect(rageClickTrackerInstance.clicks).to.have.length(1); // Should reset due to distance > threshold
      expect(rageClickTrackerInstance.clicks[0].x).to.equal(122);
      expect(rageClickTrackerInstance.clicks[0].y).to.equal(122);
    });

    it(`should continue tracking after a rage click is detected`, function() {
      // First rage click sequence
      var isRageClick = false;
      isRageClick = rageClickTrackerInstance.isRageClick(100, 100, {});
      clock.tick(100);
      isRageClick = rageClickTrackerInstance.isRageClick(105, 105, {});
      expect(isRageClick).to.be.false;
      clock.tick(100);
      isRageClick = rageClickTrackerInstance.isRageClick(110, 110, {});
      expect(isRageClick).to.be.true;

      // Start new sequence
      clock.tick(800);
      isRageClick = rageClickTrackerInstance.isRageClick(200, 200, {});
      expect(isRageClick).to.be.false;
      clock.tick(100);
      isRageClick = rageClickTrackerInstance.isRageClick(205, 205, {});
      clock.tick(100);
      isRageClick = rageClickTrackerInstance.isRageClick(210, 210, {});
      expect(isRageClick).to.be.true;
    });

    it(`should detect rage click with negative and zero coordinates`, function() {
      // Start with negative coordinates
      rageClickTrackerInstance.isRageClick(-50, -50, {});
      clock.tick(100);
      rageClickTrackerInstance.isRageClick(-45, -47, {});
      clock.tick(100);
      const result = rageClickTrackerInstance.isRageClick(-42, -44, {});
      expect(result).to.be.true;
      expect(rageClickTrackerInstance.clicks).to.have.length(0); // should reset after rage click
    });

    it(`should detect rage click starting from zero coordinates`, function() {
      // Start at origin
      rageClickTrackerInstance.isRageClick(0, 0, {});
      clock.tick(100);
      rageClickTrackerInstance.isRageClick(3, 4, {}); // Distance = 5px
      clock.tick(100);
      const result = rageClickTrackerInstance.isRageClick(6, 8, {}); // Distance from origin = 10px
      expect(result).to.be.true;
      expect(rageClickTrackerInstance.clicks).to.have.length(0); // should reset after rage click
    });

    it(`should detect rage click with mixed negative/positive coordinates`, function() {
      // Start negative, move towards positive
      rageClickTrackerInstance.isRageClick(-10, -10, {});
      clock.tick(100);
      rageClickTrackerInstance.isRageClick(-5, -5, {}); // Distance ≈ 7.07px
      clock.tick(100);
      const result = rageClickTrackerInstance.isRageClick(0, 0, {}); // Distance ≈ 7.07px from (-5,-5)
      expect(result).to.be.true;
      expect(rageClickTrackerInstance.clicks).to.have.length(0); // should reset after rage click
    });
  });

  describe(`configurable rage click parameters`, function() {
    it(`should use custom threshold_px`, function() {
      const customOptions = { threshold_px: 50 }; // eslint-disable-line camelcase

      rageClickTrackerInstance.isRageClick(100, 100, customOptions);
      clock.tick(100);
      rageClickTrackerInstance.isRageClick(135, 135, customOptions);
      clock.tick(100);
      const result = rageClickTrackerInstance.isRageClick(140, 140, customOptions);
      expect(result).to.be.true;
    });

    it(`should use custom timeout_ms`, function() {
      const customOptions = { timeout_ms: 2000 }; // eslint-disable-line camelcase

      rageClickTrackerInstance.isRageClick(100, 100, customOptions);
      clock.tick(1500); // 1.5 seconds later, within 2 second threshold
      rageClickTrackerInstance.isRageClick(105, 105, customOptions);
      clock.tick(500);
      const result = rageClickTrackerInstance.isRageClick(110, 110, customOptions);
      expect(result).to.be.true;
    });

    it(`should use custom click_count`, function() {
      const customOptions = { click_count: 5 }; // eslint-disable-line camelcase

      rageClickTrackerInstance.isRageClick(100, 100, customOptions);
      clock.tick(100);
      rageClickTrackerInstance.isRageClick(105, 105, customOptions);
      clock.tick(100);
      let result = rageClickTrackerInstance.isRageClick(110, 110, customOptions);
      expect(result).to.be.false; // should not trigger yet

      clock.tick(100);
      rageClickTrackerInstance.isRageClick(115, 115, customOptions);
      clock.tick(100);
      result = rageClickTrackerInstance.isRageClick(120, 120, customOptions);
      expect(result).to.be.true; // should trigger on 5th click
    });

    it(`should use defaults when options object is empty`, function() {
      rageClickTrackerInstance.isRageClick(100, 100, {});
      clock.tick(100);
      rageClickTrackerInstance.isRageClick(105, 105, {});
      clock.tick(100);
      const result = rageClickTrackerInstance.isRageClick(110, 110, {});
      expect(result).to.be.true;
    });
  });
});
