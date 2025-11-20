import { expect } from 'chai';
import sinon from 'sinon';

import {
  RageClickTracker,
  DEFAULT_RAGE_CLICK_THRESHOLD_PX,
  DEFAULT_RAGE_CLICK_TIMEOUT_MS,
  DEFAULT_RAGE_CLICK_CLICK_COUNT,
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

  /**
   * Helper for triggering isRageClick at specific coordinates.
   * @param {number} pageX - The X coordinate of the click event
   * @param {number} pageY - The Y coordinate of the click event
   * @param {import('../../src').RageClickConfig} options - Configuration options for the rage click detection
   * @returns {boolean} - True if the click is a rage click, false otherwise
   */
  function isRageClickAtPosition(pageX, pageY, options) {
    const event = {
      pageX,
      pageY,
      target: document.createElement(`button`), // default to an interactive element
    };

    return rageClickTrackerInstance.isRageClick(event, options);
  }

  describe(`isRageClick correctly identifies rage clicks`, function() {
    it(`should return false for first click`, function() {
      const result = isRageClickAtPosition(100, 100);
      expect(result).to.be.false;
      expect(rageClickTrackerInstance.clicks).to.have.length(1);
    });

    it(`should return false for second click within threshold`, function() {
      isRageClickAtPosition(100, 100);
      clock.tick(100);
      const result = isRageClickAtPosition(105, 105);
      expect(result).to.be.false;
      expect(rageClickTrackerInstance.clicks).to.have.length(2);
    });

    it(`should return false for third click within threshold`, function() {
      isRageClickAtPosition(100, 100);
      clock.tick(100);
      isRageClickAtPosition(105, 105);
      clock.tick(100);
      const result = isRageClickAtPosition(110, 110);
      expect(result).to.be.false;
      expect(rageClickTrackerInstance.clicks).to.have.length(3);
    });

    it(`should return true for fourth click within threshold and timeout`, function() {
      isRageClickAtPosition(100, 100);
      clock.tick(100);
      isRageClickAtPosition(105, 105);
      clock.tick(100);
      isRageClickAtPosition(110, 110);
      clock.tick(100);
      const result = isRageClickAtPosition(115, 115);
      expect(result).to.be.true;
      expect(rageClickTrackerInstance.clicks).to.have.length(0); // should reset after rage click
    });

    it(`should reset clicks array when click is outside threshold`, function() {
      isRageClickAtPosition(100, 100);
      clock.tick(100);
      isRageClickAtPosition(105, 105);
      clock.tick(100);
      // Click far away (outside threshold)
      const result = isRageClickAtPosition(200, 200);
      expect(result).to.be.false;
      expect(rageClickTrackerInstance.clicks).to.have.length(1);
      expect(rageClickTrackerInstance.clicks[0].x).to.equal(200);
      expect(rageClickTrackerInstance.clicks[0].y).to.equal(200);
    });

    it(`should reset clicks array when click is outside timeout`, function() {
      isRageClickAtPosition(100, 100);
      clock.tick(100);
      isRageClickAtPosition(105, 105);
      clock.tick(1500); // Exceed timeout
      // Click after timeout
      const result = isRageClickAtPosition(110, 110);
      expect(result).to.be.false;
      expect(rageClickTrackerInstance.clicks).to.have.length(1);
    });

    it(`should handle clicks exactly at threshold boundary`, function() {
      isRageClickAtPosition(100, 100);
      clock.tick(100);
      // Click exactly at threshold distance (Euclidean distance = DEFAULT_RAGE_CLICK_THRESHOLD_PX - 1)
      const result = isRageClickAtPosition(100 + DEFAULT_RAGE_CLICK_THRESHOLD_PX - 1, 100);
      expect(result).to.be.false;
      expect(rageClickTrackerInstance.clicks).to.have.length(2);
    });

    it(`should reject clicks at threshold distance`, function() {
      isRageClickAtPosition(100, 100);
      clock.tick(100);
      // Click exactly at threshold distance (Euclidean distance = DEFAULT_RAGE_CLICK_THRESHOLD_PX)
      const result = isRageClickAtPosition(100 + DEFAULT_RAGE_CLICK_THRESHOLD_PX, 100);
      expect(result).to.be.false;
      expect(rageClickTrackerInstance.clicks).to.have.length(1);
      expect(rageClickTrackerInstance.clicks[0].x).to.equal(100 + DEFAULT_RAGE_CLICK_THRESHOLD_PX);
    });

    it(`should handle clicks exactly at timeout boundary`, function() {
      isRageClickAtPosition(100, 100);
      clock.tick(DEFAULT_RAGE_CLICK_TIMEOUT_MS - 1);
      const result = isRageClickAtPosition(105, 105);
      expect(result).to.be.false;
      expect(rageClickTrackerInstance.clicks).to.have.length(2);
    });

    it(`should reject clicks at timeout boundary`, function() {
      isRageClickAtPosition(100, 100);
      clock.tick(DEFAULT_RAGE_CLICK_TIMEOUT_MS);
      // Click exactly at timeout
      const result = isRageClickAtPosition(105, 105);
      expect(result).to.be.false;
      expect(rageClickTrackerInstance.clicks).to.have.length(1);
    });

    it(`should calculate Euclidean distance correctly`, function() {
      isRageClickAtPosition(100, 100);
      clock.tick(100);
      const result = isRageClickAtPosition(110, 115);
      expect(result).to.be.false;
      expect(rageClickTrackerInstance.clicks).to.have.length(2);
    });

    it(`should handle negative coordinates`, function() {
      isRageClickAtPosition(-100, -100);
      clock.tick(100);
      const result = isRageClickAtPosition(-105, -105);
      expect(result).to.be.false;
      expect(rageClickTrackerInstance.clicks).to.have.length(2);
    });

    it(`should handle zero coordinates`, function() {
      isRageClickAtPosition(0, 0);
      clock.tick(100);
      const result = isRageClickAtPosition(5, 5);
      expect(result).to.be.false;
      expect(rageClickTrackerInstance.clicks).to.have.length(2);
    });

    it(`should reset when Euclidean distance exceeds threshold`, function() {
      isRageClickAtPosition(100, 100);
      clock.tick(100);
      const result = isRageClickAtPosition(122, 122);
      expect(result).to.be.false;
      expect(rageClickTrackerInstance.clicks).to.have.length(1); // Should reset due to distance > threshold
      expect(rageClickTrackerInstance.clicks[0].x).to.equal(122);
      expect(rageClickTrackerInstance.clicks[0].y).to.equal(122);
    });

    it(`should continue tracking after a rage click is detected`, function() {
      // First rage click sequence
      var result = false;
      result = isRageClickAtPosition(100, 100);
      expect(result).to.be.false;
      clock.tick(100);
      result = isRageClickAtPosition(105, 105);
      expect(result).to.be.false;
      clock.tick(100);
      result = isRageClickAtPosition(110, 110);
      expect(result).to.be.false;
      clock.tick(100);
      result = isRageClickAtPosition(115, 115);
      expect(result).to.be.true;

      // Start new sequence
      clock.tick(800);
      result = isRageClickAtPosition(200, 200);
      expect(result).to.be.false;
      clock.tick(100);
      result = isRageClickAtPosition(205, 205);
      expect(result).to.be.false;
      clock.tick(100);
      result = isRageClickAtPosition(210, 210);
      expect(result).to.be.false;
      clock.tick(100);
      result = isRageClickAtPosition(215, 215);
      expect(result).to.be.true;
    });

    it(`should detect rage click with negative and zero coordinates`, function() {
      // Start with negative coordinates
      isRageClickAtPosition(-50, -50);
      clock.tick(100);
      isRageClickAtPosition(-45, -47);
      clock.tick(100);
      isRageClickAtPosition(-42, -44);
      clock.tick(100);
      const result = isRageClickAtPosition(-40, -41);
      expect(result).to.be.true;
      expect(rageClickTrackerInstance.clicks).to.have.length(0); // should reset after rage click
    });

    it(`should detect rage click starting from zero coordinates`, function() {
      // Start at origin
      isRageClickAtPosition(0, 0);
      clock.tick(100);
      isRageClickAtPosition(3, 4); // Distance = 5px
      clock.tick(100);
      isRageClickAtPosition(6, 8); // Distance from origin = 10px
      clock.tick(100);
      const result = isRageClickAtPosition(9, 12); // Distance from origin = 15px
      expect(result).to.be.true;
      expect(rageClickTrackerInstance.clicks).to.have.length(0); // should reset after rage click
    });

    it(`should detect rage click with mixed negative/positive coordinates`, function() {
      // Start negative, move towards positive
      isRageClickAtPosition(-10, -10);
      clock.tick(100);
      isRageClickAtPosition(-5, -5); // Distance ≈ 7.07px
      clock.tick(100);
      isRageClickAtPosition(0, 0); // Distance ≈ 7.07px from (-5,-5)
      clock.tick(100);
      const result = isRageClickAtPosition(5, 5); // Distance ≈ 7.07px from (0,0)
      expect(result).to.be.true;
      expect(rageClickTrackerInstance.clicks).to.have.length(0); // should reset after rage click
    });
  });

  describe(`configurable rage click parameters`, function() {
    it(`should use custom threshold_px`, function() {
      const customOptions = { threshold_px: 50 }; // eslint-disable-line camelcase

      isRageClickAtPosition(100, 100, customOptions);
      clock.tick(100);
      isRageClickAtPosition(135, 135, customOptions);
      clock.tick(100);
      isRageClickAtPosition(140, 140, customOptions);
      clock.tick(100);
      const result = isRageClickAtPosition(145, 145, customOptions);
      expect(result).to.be.true;
    });

    it(`should use custom timeout_ms`, function() {
      const customOptions = { timeout_ms: 2000 }; // eslint-disable-line camelcase

      isRageClickAtPosition(100, 100, customOptions);
      clock.tick(1500); // 1.5 seconds later, within 2 second threshold
      isRageClickAtPosition(105, 105, customOptions);
      clock.tick(400);
      isRageClickAtPosition(110, 110, customOptions);
      clock.tick(100);
      const result = isRageClickAtPosition(115, 115, customOptions);
      expect(result).to.be.true;
    });

    it(`should use custom click_count`, function() {
      const customOptions = { click_count: 5 }; // eslint-disable-line camelcase

      isRageClickAtPosition(100, 100, customOptions);
      clock.tick(100);
      isRageClickAtPosition(105, 105, customOptions);
      clock.tick(100);
      let result = isRageClickAtPosition(110, 110, customOptions);
      expect(result).to.be.false; // should not trigger yet

      clock.tick(100);
      isRageClickAtPosition(115, 115, customOptions);
      clock.tick(100);
      result = isRageClickAtPosition(120, 120, customOptions);
      expect(result).to.be.true; // should trigger on 5th click
    });

    it(`should use defaults when options object is empty`, function() {
      isRageClickAtPosition(100, 100);
      clock.tick(100);
      isRageClickAtPosition(105, 105);
      clock.tick(100);
      isRageClickAtPosition(110, 110);
      clock.tick(100);
      const result = isRageClickAtPosition(115, 115);
      expect(result).to.be.true;
    });

    describe(`interactive_elements_only option`, function() {
      function simulateRageClicking(event) {
        const options = { interactive_elements_only: true }; // eslint-disable-line camelcase

        for (let i = 0; i < DEFAULT_RAGE_CLICK_CLICK_COUNT - 1; i++) {
          rageClickTrackerInstance.isRageClick(event, options);
          clock.tick(100);
        }

        return rageClickTrackerInstance.isRageClick(event, options);
      }

      it(`should ignore clicks on non-interactive elements when enabled`, function() {
        // Simulate a click event on a non-interactive element
        const nonInteractiveEvent = {
          pageX: 100,
          pageY: 100,
          target: document.createElement(`div`), // div is non-interactive
        };

        const result = simulateRageClicking(nonInteractiveEvent);
        expect(result).to.be.false;
        expect(rageClickTrackerInstance.clicks).to.have.length(0); // should not have recorded any clicks
      });

      it(`should track clicks on interactive elements when enabled`, function() {
        // Simulate a click event on an interactive element
        const interactiveEvent = {
          pageX: 100,
          pageY: 100,
          target: document.createElement(`button`), // button is interactive
        };

        const result = simulateRageClicking(interactiveEvent);
        expect(result).to.be.true;
      });

      for (const { element, expectedResult } of [{ element: `a`, expectedResult: true}, { element: `div`, expectedResult: false}]) {
        it(`should properly determine if a click on a "${element}" element in the shadow DOM is interactive`, function() {
          // Create a shadow DOM with an interactive element
          const hostElement = document.createElement(`div`);
          const shadowRoot = hostElement.attachShadow({ mode: `open` });
          const actualTarget = document.createElement(element);
          shadowRoot.appendChild(actualTarget);

          const shadowEvent = {
            pageX: 100,
            pageY: 100,
            target: hostElement,
            composedPath: () => [actualTarget]
          };

          const result = simulateRageClicking(shadowEvent);
          expect(result).to.equal(expectedResult);
        });
      }
    });
  });
});
