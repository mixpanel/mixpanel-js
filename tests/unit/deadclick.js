import { expect } from 'chai';
import sinon from 'sinon';

import {
  DeadClickTracker,
  DEFAULT_DEAD_CLICK_TIMEOUT_MS,
} from '../../src/autocapture/deadclick';

import jsdomSetup from './jsdom-setup';

describe(`DeadClickTracker`, function() {
  jsdomSetup();

  let deadClickTrackerInstance;
  let clock;
  let mockElement;
  let mockEvent;
  let mockCallback;
  let testConfig;

  beforeEach(function() {
    clock = sinon.useFakeTimers();
    mockCallback = sinon.spy();
    deadClickTrackerInstance = new DeadClickTracker(mockCallback);

    // Default test config with timeout_ms
    testConfig = {
      'timeout_ms': DEFAULT_DEAD_CLICK_TIMEOUT_MS
    };

    // Mock DOM element
    mockElement = {
      tagName: `BUTTON`,
      getAttribute: sinon.stub().returns(null),
      hasAttribute: sinon.stub().returns(false),
      textContent: ``,
      isContentEditable: false,
    };

    // Mock event
    mockEvent = {
      'type': `click`,
      'target': mockElement,
      'pageX': 100,
      'pageY': 200,
      'clientX': 50,
      'clientY': 100,
    };
  });

  afterEach(function() {
    clock.restore();
    deadClickTrackerInstance.stopTracking();
    sinon.restore();
  });


  describe(`addClick is handled correctly based on element interactive properties`, function() {
    it(`adds click for interactive elements`, function() {
      const result = deadClickTrackerInstance.addClick(mockEvent);
      expect(result).to.be.true;
      expect(deadClickTrackerInstance.pendingClicks).to.have.length(1);
      expect(deadClickTrackerInstance.pendingClicks[0].element).to.equal(mockElement);
    });

    it(`does not add click for non-interactive elements`, function() {
      const textElement = {
        tagName: `HTML`,
        textContent: `This is HTML content`,
        getAttribute: sinon.stub().returns(null),
        hasAttribute: sinon.stub().returns(false),
        isContentEditable: false,
      };
      const textEvent = {
        'type': `click`,
        'target': textElement,
        'pageX': 100,
        'pageY': 200,
        'clientX': 50,
        'clientY': 100,
      };
      const result = deadClickTrackerInstance.addClick(textEvent);
      expect(result).to.be.false;
      expect(deadClickTrackerInstance.pendingClicks).to.have.length(0);
    });

  });

  describe(`trackClick`, function() {
    beforeEach(function() {
      deadClickTrackerInstance.startTracking();
    });

    it(`adds click and triggers processing for interactive elements`, function() {
      const result = deadClickTrackerInstance.trackClick(mockEvent, testConfig);
      expect(result).to.be.true;
      expect(deadClickTrackerInstance.pendingClicks).to.have.length(1);
      expect(deadClickTrackerInstance.processingActive).to.be.true;
    });

    it(`does not add click for non-interactive elements`, function() {
      const textElement = {
        tagName: `HTML`,
        textContent: `This is HTML content`,
        getAttribute: sinon.stub().returns(null),
        hasAttribute: sinon.stub().returns(false),
        isContentEditable: false,
      };
      const textEvent = {
        'type': `click`,
        'target': textElement,
        'pageX': 100,
        'pageY': 200,
        'clientX': 50,
        'clientY': 100,
      };
      const result = deadClickTrackerInstance.trackClick(textEvent, testConfig);
      expect(result).to.be.false;
      expect(deadClickTrackerInstance.pendingClicks).to.have.length(0);
      expect(deadClickTrackerInstance.processingActive).to.be.false;
    });

    it(`returns false when not tracking`, function() {
      deadClickTrackerInstance.stopTracking();
      const result = deadClickTrackerInstance.trackClick(mockEvent, testConfig);
      expect(result).to.be.false;
      expect(deadClickTrackerInstance.pendingClicks).to.have.length(0);
    });

    it(`calls callback when dead clicks are detected`, function() {
      clock.tick(110);
      deadClickTrackerInstance.trackClick(mockEvent, testConfig);

      clock.tick(DEFAULT_DEAD_CLICK_TIMEOUT_MS + 1);

      expect(mockCallback.calledOnce).to.be.true;
      expect(mockCallback.calledWith(mockEvent)).to.be.true;
    });
  });

  describe(`getDeadClicks`, function() {
    beforeEach(function() {
      clock.tick(110);
      deadClickTrackerInstance.addClick(mockEvent);
    });

    it(`does not return dead clicks before timeout`, function() {
      clock.tick(DEFAULT_DEAD_CLICK_TIMEOUT_MS - 100);
      const deadClicks = deadClickTrackerInstance.getDeadClicks(testConfig);
      expect(deadClicks).to.have.length(0);
      expect(deadClickTrackerInstance.pendingClicks).to.have.length(1);
    });

    it(`returns dead clicks after timeout with no changes`, function() {
      clock.tick(DEFAULT_DEAD_CLICK_TIMEOUT_MS + 100);
      var deadClicks = deadClickTrackerInstance.getDeadClicks(testConfig);
      expect(deadClicks).to.have.length(1);
      expect(deadClicks[0].element).to.equal(mockElement);
      expect(deadClickTrackerInstance.pendingClicks).to.have.length(0);
    });

    it(`does not return dead clicks after timeout if there were changes`, function() {
      // Record a change event after the click
      clock.tick(100);
      deadClickTrackerInstance.recordChangeEvent();
      clock.tick(DEFAULT_DEAD_CLICK_TIMEOUT_MS);
      const deadClicks = deadClickTrackerInstance.getDeadClicks(testConfig);
      expect(deadClicks).to.have.length(0);
      expect(deadClickTrackerInstance.pendingClicks).to.have.length(0);
    });

    it(`updates last change event timestamp`, function() {
      var initialTimestamp = deadClickTrackerInstance.lastChangeEventTimestamp;
      expect(initialTimestamp).to.equal(0);

      clock.tick(100);
      deadClickTrackerInstance.recordChangeEvent();

      expect(deadClickTrackerInstance.lastChangeEventTimestamp).to.be.greaterThan(initialTimestamp);
    });
  });

  describe(`recordChangeEvent`, function() {
    it(`updates last change event timestamp`, function() {
      var startTime = Date.now();
      deadClickTrackerInstance.recordChangeEvent();

      expect(deadClickTrackerInstance.lastChangeEventTimestamp).to.be.at.least(startTime);
    });

    it(`updates timestamp on multiple events`, function() {
      deadClickTrackerInstance.recordChangeEvent();
      var firstTimestamp = deadClickTrackerInstance.lastChangeEventTimestamp;

      clock.tick(100);
      deadClickTrackerInstance.recordChangeEvent();
      var secondTimestamp = deadClickTrackerInstance.lastChangeEventTimestamp;

      expect(secondTimestamp).to.be.greaterThan(firstTimestamp);
    });
  });

  describe(`hasChangesAfter`, function() {
    it(`returns false when no changes after timestamp`, function() {
      clock.tick(110); // Advance past the 100ms timing window
      var timestamp = Date.now();
      expect(deadClickTrackerInstance.hasChangesAfter(timestamp)).to.be.false;
    });

    it(`returns true when changes exist after timestamp`, function() {
      var timestamp = Date.now();
      clock.tick(100);
      deadClickTrackerInstance.recordChangeEvent();

      expect(deadClickTrackerInstance.hasChangesAfter(timestamp)).to.be.true;
    });

    it(`returns false when changes exist before timestamp`, function() {
      deadClickTrackerInstance.recordChangeEvent();
      clock.tick(110);
      var timestamp = Date.now();

      expect(deadClickTrackerInstance.hasChangesAfter(timestamp)).to.be.false;
    });

    it(`returns true when last change is after timestamp`, function() {
      deadClickTrackerInstance.recordChangeEvent();
      clock.tick(100);
      var timestamp = Date.now();
      clock.tick(100);
      deadClickTrackerInstance.recordChangeEvent();

      expect(deadClickTrackerInstance.hasChangesAfter(timestamp)).to.be.true;
    });
  });

  describe(`startTracking and stopTracking`, function() {
    it(`sets isTracking to true when startTracking is called`, function() {
      deadClickTrackerInstance.startTracking();
      expect(deadClickTrackerInstance.isTracking).to.be.true;
    });

    it(`sets isTracking to false when stopTracking is called`, function() {
      deadClickTrackerInstance.startTracking();
      deadClickTrackerInstance.stopTracking();
      expect(deadClickTrackerInstance.isTracking).to.be.false;
    });

    it(`clears pendingClicks when stopTracking is called`, function() {
      deadClickTrackerInstance.startTracking();
      deadClickTrackerInstance.addClick(mockEvent);
      expect(deadClickTrackerInstance.pendingClicks).to.have.length(1);
      deadClickTrackerInstance.stopTracking();
      expect(deadClickTrackerInstance.pendingClicks).to.have.length(0);
    });

    it(`resets last change event timestamp when stopTracking is called`, function() {
      deadClickTrackerInstance.startTracking();
      clock.tick(100); // Advance time to ensure timestamp > 0
      deadClickTrackerInstance.recordChangeEvent();
      expect(deadClickTrackerInstance.lastChangeEventTimestamp).to.be.greaterThan(0);
      deadClickTrackerInstance.stopTracking();
      expect(deadClickTrackerInstance.lastChangeEventTimestamp).to.equal(0);
    });

    it(`does not start tracking twice`, function() {
      deadClickTrackerInstance.startTracking();
      deadClickTrackerInstance.startTracking();
      expect(deadClickTrackerInstance.isTracking).to.be.true;
    });
  });

  describe(`hasChangesAfter behavior validation`, function() {
    it(`correctly identifies when no changes occurred after click timestamp`, function() {
      clock.tick(110);
      deadClickTrackerInstance.addClick(mockEvent);
      var storedClick = deadClickTrackerInstance.pendingClicks[0];
      expect(deadClickTrackerInstance.hasChangesAfter(storedClick.timestamp)).to.be.false;
    });

    it(`correctly identifies when changes occurred before click`, function() {
      clock.tick(100);
      deadClickTrackerInstance.recordChangeEvent();

      clock.tick(110);
      deadClickTrackerInstance.addClick(mockEvent);
      var storedClick = deadClickTrackerInstance.pendingClicks[0];

      expect(deadClickTrackerInstance.hasChangesAfter(storedClick.timestamp)).to.be.false;
    });

    it(`correctly identifies when changes occurred after click`, function() {
      clock.tick(100);
      deadClickTrackerInstance.addClick(mockEvent);
      var storedClick = deadClickTrackerInstance.pendingClicks[0];
      clock.tick(100);
      deadClickTrackerInstance.recordChangeEvent();

      expect(deadClickTrackerInstance.hasChangesAfter(storedClick.timestamp)).to.be.true;
    });
  });

  describe(`cleanup scenarios`, function() {

    it(`clears pending clicks after timeout`, function() {
      deadClickTrackerInstance.startTracking();
      // Add 100 clicks
      for (var i = 0; i < 100; i++) {
        var event = {
          'type': `click`,
          'target': mockElement,
          'pageX': 100 + i,
          'pageY': 200 + i,
          'clientX': 50 + i,
          'clientY': 100 + i
        };
        deadClickTrackerInstance.addClick(event);
      }
      expect(deadClickTrackerInstance.pendingClicks).to.have.length(100);
      // Let them all expire
      clock.tick(600);
      deadClickTrackerInstance.getDeadClicks(testConfig);
      // All clicks should be removed from pending clicks
      expect(deadClickTrackerInstance.pendingClicks).to.have.length(0);
    });

    it(`properly cleans up timeout when stopTracking during processing`, function() {
      deadClickTrackerInstance.startTracking();
      deadClickTrackerInstance.addClick(mockEvent);
      deadClickTrackerInstance.triggerProcessing(testConfig);

      // Processing should be active
      expect(deadClickTrackerInstance.processingActive).to.be.true;
      expect(deadClickTrackerInstance.processingTimeout).to.not.be.null;

      // Stop tracking while processing
      deadClickTrackerInstance.stopTracking();

      // Should clean up processing state
      expect(deadClickTrackerInstance.processingActive).to.be.false;
      expect(deadClickTrackerInstance.processingTimeout).to.be.null;
    });

    it(`prevents multiple concurrent processing chains`, function() {
      deadClickTrackerInstance.startTracking();
      deadClickTrackerInstance.addClick(mockEvent);

      // Trigger processing multiple times
      deadClickTrackerInstance.triggerProcessing(testConfig);
      var firstTimeout = deadClickTrackerInstance.processingTimeout;

      deadClickTrackerInstance.triggerProcessing(testConfig);
      var secondTimeout = deadClickTrackerInstance.processingTimeout;

      // Should be the same timeout (no new processing chain)
      expect(firstTimeout).to.equal(secondTimeout);
      expect(deadClickTrackerInstance.processingActive).to.be.true;
    });

    it(`stops processing when tracker is stopped`, function() {
      deadClickTrackerInstance.startTracking();
      deadClickTrackerInstance.addClick(mockEvent);
      deadClickTrackerInstance.triggerProcessing(testConfig);

      // Stop tracking
      deadClickTrackerInstance.stopTracking();

      // Advance time - processing should not continue
      clock.tick(600);

      expect(deadClickTrackerInstance.processingActive).to.be.false;
      expect(deadClickTrackerInstance.pendingClicks).to.have.length(0);
    });
  });

});
