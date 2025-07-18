import { expect } from 'chai';

import {
    RageClickTracker,
    RAGE_CLICK_THRESHOLD_PX,
    RAGE_CLICK_TIMEOUT_MS, 
} from '../../src/autocapture/rageclick';

import jsdomSetup from './jsdom-setup';

describe('RageClickTracker', function() {
    jsdomSetup();

    let rageClickTrackerInstance;
    let fakeTime;
    let timeProvider;

    beforeEach(function() {
        fakeTime = 1000;
        timeProvider = function() { return fakeTime; };
        rageClickTrackerInstance = new RageClickTracker(timeProvider);
    });

    describe('isRageClick correctly identifies rage clicks', function() {
        it('should return false for first click', function() {
            const result = rageClickTrackerInstance.isRageClick(100, 100);
            expect(result).to.be.false;
            expect(rageClickTrackerInstance.clicks).to.have.length(1);
        });

        it('should return false for second click within threshold', function() {
            rageClickTrackerInstance.isRageClick(100, 100);
            fakeTime = 1100;
            const result = rageClickTrackerInstance.isRageClick(105, 105);
            expect(result).to.be.false;
            expect(rageClickTrackerInstance.clicks).to.have.length(2);
        });

        it('should return true for third click within threshold and timeout', function() {
            rageClickTrackerInstance.isRageClick(100, 100);
            fakeTime = 1100;
            rageClickTrackerInstance.isRageClick(105, 105);
            fakeTime = 1200;
            const result = rageClickTrackerInstance.isRageClick(110, 110);
            expect(result).to.be.true;
            expect(rageClickTrackerInstance.clicks).to.have.length(0); // should reset after rage click
        });

        it('should reset clicks array when click is outside threshold', function() {
            rageClickTrackerInstance.isRageClick(100, 100);
            fakeTime = 1100;
            rageClickTrackerInstance.isRageClick(105, 105);
            fakeTime = 1200;
            // Click far away (outside threshold)
            const result = rageClickTrackerInstance.isRageClick(200, 200);
            expect(result).to.be.false;
            expect(rageClickTrackerInstance.clicks).to.have.length(1);
            expect(rageClickTrackerInstance.clicks[0].x).to.equal(200);
            expect(rageClickTrackerInstance.clicks[0].y).to.equal(200);
        });

        it('should reset clicks array when click is outside timeout', function() {
            rageClickTrackerInstance.isRageClick(100, 100);
            fakeTime = 1100;
            rageClickTrackerInstance.isRageClick(105, 105);
            fakeTime = 2500;
            // Click after timeout
            const result = rageClickTrackerInstance.isRageClick(110, 110);
            expect(result).to.be.false;
            expect(rageClickTrackerInstance.clicks).to.have.length(1);
            expect(rageClickTrackerInstance.clicks[0].timestamp).to.equal(2500);
        });

        it('should handle clicks exactly at threshold boundary', function() {
            rageClickTrackerInstance.isRageClick(100, 100);
            fakeTime = 1100;
            // Click exactly at threshold distance (Euclidean distance = RAGE_CLICK_THRESHOLD_PX - 1)
            const result = rageClickTrackerInstance.isRageClick(100 + RAGE_CLICK_THRESHOLD_PX - 1, 100);
            expect(result).to.be.false;
            expect(rageClickTrackerInstance.clicks).to.have.length(2);
        });

        it('should reject clicks at threshold distance', function() {
            rageClickTrackerInstance.isRageClick(100, 100);
            fakeTime = 1100;
            // Click exactly at threshold distance (Euclidean distance = RAGE_CLICK_THRESHOLD_PX)
            const result = rageClickTrackerInstance.isRageClick(100 + RAGE_CLICK_THRESHOLD_PX, 100);
            expect(result).to.be.false;
            expect(rageClickTrackerInstance.clicks).to.have.length(1);
            expect(rageClickTrackerInstance.clicks[0].x).to.equal(100 + RAGE_CLICK_THRESHOLD_PX);
        });

        it('should handle clicks exactly at timeout boundary', function() {
            rageClickTrackerInstance.isRageClick(100, 100);
            fakeTime = 1000 + RAGE_CLICK_TIMEOUT_MS - 1;
            // Click exactly at timeout boundary
            const result = rageClickTrackerInstance.isRageClick(105, 105);
            expect(result).to.be.false;
            expect(rageClickTrackerInstance.clicks).to.have.length(2);
        });

        it('should reject clicks at timeout boundary', function() {
            rageClickTrackerInstance.isRageClick(100, 100);
            fakeTime = 1000 + RAGE_CLICK_TIMEOUT_MS;
            // Click exactly at timeout
            const result = rageClickTrackerInstance.isRageClick(105, 105);
            expect(result).to.be.false;
            expect(rageClickTrackerInstance.clicks).to.have.length(1);
            expect(rageClickTrackerInstance.clicks[0].timestamp).to.equal(1000 + RAGE_CLICK_TIMEOUT_MS);
        });

        it('should calculate Euclidean distance correctly', function() {
            rageClickTrackerInstance.isRageClick(100, 100);
            fakeTime = 1100;
            const result = rageClickTrackerInstance.isRageClick(110, 115);
            expect(result).to.be.false;
            expect(rageClickTrackerInstance.clicks).to.have.length(2);
        });

        it('should handle negative coordinates', function() {
            rageClickTrackerInstance.isRageClick(-100, -100);
            fakeTime = 1100;
            const result = rageClickTrackerInstance.isRageClick(-105, -105);
            expect(result).to.be.false;
            expect(rageClickTrackerInstance.clicks).to.have.length(2);
        });

        it('should handle zero coordinates', function() {
            rageClickTrackerInstance.isRageClick(0, 0);
            fakeTime = 1100;
            const result = rageClickTrackerInstance.isRageClick(5, 5);
            expect(result).to.be.false;
            expect(rageClickTrackerInstance.clicks).to.have.length(2);
        });
        
        it('should reset when Euclidean distance exceeds threshold', function() {
            rageClickTrackerInstance.isRageClick(100, 100);
            fakeTime = 1100;
            const result = rageClickTrackerInstance.isRageClick(122, 122);
            expect(result).to.be.false;
            expect(rageClickTrackerInstance.clicks).to.have.length(1); // Should reset due to distance > threshold
            expect(rageClickTrackerInstance.clicks[0].x).to.equal(122);
            expect(rageClickTrackerInstance.clicks[0].y).to.equal(122);
        });

        it('should continue tracking after a rage click is detected', function() {
            // First rage click sequence
            var isRageClick = false;
            isRageClick = rageClickTrackerInstance.isRageClick(100, 100);
            fakeTime = 1100;
            isRageClick = rageClickTrackerInstance.isRageClick(105, 105);
            expect(isRageClick).to.be.false;
            fakeTime = 1200;
            isRageClick = rageClickTrackerInstance.isRageClick(110, 110);
            expect(isRageClick).to.be.true;

            // Start new sequence
            fakeTime = 2000;
            isRageClick = rageClickTrackerInstance.isRageClick(200, 200);
            expect(isRageClick).to.be.false;
            fakeTime = 2100;
            isRageClick = rageClickTrackerInstance.isRageClick(205, 205);
            fakeTime = 2200;
            isRageClick = rageClickTrackerInstance.isRageClick(210, 210);
            expect(isRageClick).to.be.true;
        });

        it('should detect rage click with negative and zero coordinates', function() {
            // Start with negative coordinates
            rageClickTrackerInstance.isRageClick(-50, -50);
            fakeTime = 1100;
            rageClickTrackerInstance.isRageClick(-45, -47);
            fakeTime = 1200;
            const result = rageClickTrackerInstance.isRageClick(-42, -44);
            expect(result).to.be.true;
            expect(rageClickTrackerInstance.clicks).to.have.length(0); // should reset after rage click
        });

        it('should detect rage click starting from zero coordinates', function() {
            // Start at origin
            rageClickTrackerInstance.isRageClick(0, 0);
            fakeTime = 1100;
            rageClickTrackerInstance.isRageClick(3, 4); // Distance = 5px
            fakeTime = 1200;
            const result = rageClickTrackerInstance.isRageClick(6, 8); // Distance from origin = 10px
            expect(result).to.be.true;
            expect(rageClickTrackerInstance.clicks).to.have.length(0); // should reset after rage click
        });

        it('should detect rage click with mixed negative/positive coordinates', function() {
            // Start negative, move towards positive
            rageClickTrackerInstance.isRageClick(-10, -10);
            fakeTime = 1100;
            rageClickTrackerInstance.isRageClick(-5, -5); // Distance ≈ 7.07px
            fakeTime = 1200;
            const result = rageClickTrackerInstance.isRageClick(0, 0); // Distance ≈ 7.07px from (-5,-5)
            expect(result).to.be.true;
            expect(rageClickTrackerInstance.clicks).to.have.length(0); // should reset after rage click
        });
    });
});
