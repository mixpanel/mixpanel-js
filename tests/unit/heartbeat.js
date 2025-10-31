import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

chai.use(sinonChai);

import { _, console } from '../../src/utils';
import { clearOptInOut } from '../../src/gdpr-utils';
import mixpanel from '../../src/loaders/loader-module';

// This is a test specifically for the heartbeat method behavior.
// We test by exercising the real implementation through a minimal mock.

describe('Heartbeat', function() {
	let clock, originalTrack, originalReportError;

	beforeEach(function() {
		clock = sinon.useFakeTimers();
		clearOptInOut();

		// Create a named instance for heartbeat testing to avoid polluting main scope
		mixpanel.init('test-token', {
			api_host: 'localhost',
			debug: false,
			persistence: 'localStorage'
		}, 'hb');

		// Clean up any existing heartbeat state on the test instance
		if (mixpanel.hb._heartbeat_intervals) {
			// Clean up intervals using object keys since we're using plain objects now
			Object.keys(mixpanel.hb._heartbeat_intervals).forEach((key) => {
				clearInterval(mixpanel.hb._heartbeat_intervals[key]);
			});
			mixpanel.hb._heartbeat_intervals = {};
		}
		if (mixpanel.hb._heartbeat_timers) {
			// Clean up timers using object keys since we're using plain objects now
			Object.keys(mixpanel.hb._heartbeat_timers).forEach((key) => {
				clearTimeout(mixpanel.hb._heartbeat_timers[key]);
			});
			mixpanel.hb._heartbeat_timers = {};
		}
		if (mixpanel.hb._heartbeat_storage) {
			mixpanel.hb._heartbeat_storage = {};
		}
		if (mixpanel.hb._heartbeat_manual_events) {
			mixpanel.hb._heartbeat_manual_events = {};
		}
		if (mixpanel.hb._heartbeat_managed_events) {
			mixpanel.hb._heartbeat_managed_events = {};
		}
		if (mixpanel.hb._heartbeat_counters) {
			mixpanel.hb._heartbeat_counters = {};
		}

		// Store original methods and stub only the external dependencies on the test instance
		originalTrack = mixpanel.hb.track;
		originalReportError = mixpanel.hb.report_error;
		
		mixpanel.hb.track = sinon.stub();
		mixpanel.hb.report_error = sinon.stub();
	});

	afterEach(function() {
		clock.restore();
		clearOptInOut();
		
		// Restore original methods on the test instance
		mixpanel.hb.track = originalTrack;
		mixpanel.hb.report_error = originalReportError;
		
		// Clean up the named instance
		delete mixpanel.hb;
	});

	describe('Basic functionality', function() {
		it('should exist as a function', function() {
			expect(mixpanel.hb.heartbeat).to.be.a('function');
		});

		it('should require eventName and contentId', function() {
			mixpanel.hb.heartbeat();
			expect(mixpanel.hb.report_error).to.have.been.calledWith('heartbeat: eventName and contentId are required');

			mixpanel.hb.report_error.resetHistory();
			mixpanel.hb.heartbeat('event');
			expect(mixpanel.hb.report_error).to.have.been.calledWith('heartbeat: eventName and contentId are required');
		});

		it('should convert parameters to strings', function() {
			mixpanel.hb.heartbeat(123, 456, { prop: 'value' });
			
			// Verify the conversion by forcing a flush and checking track call
			mixpanel.hb.heartbeat(123, 456, {}, { forceFlush: true });
			
			expect(mixpanel.hb.track).to.have.been.called;
			const trackCall = mixpanel.hb.track.getCall(0);
			expect(trackCall.args[0]).to.equal('123'); // eventName converted to string
			expect(trackCall.args[1]).to.include({ $contentId: '456' }); // contentId converted to string
		});

		it('should handle invalid parameters', function() {
			mixpanel.hb.heartbeat('', 'content');
			expect(mixpanel.hb.report_error).to.have.been.calledWith('heartbeat: eventName and contentId are required');

			mixpanel.hb.report_error.resetHistory();
			mixpanel.hb.heartbeat('event', '');
			expect(mixpanel.hb.report_error).to.have.been.calledWith('heartbeat: eventName and contentId are required');

			mixpanel.hb.report_error.resetHistory();
			mixpanel.hb.heartbeat(null, 'content');
			expect(mixpanel.hb.report_error).to.have.been.calledWith('heartbeat: eventName and contentId are required');
		});

		it('should track events with automatic properties', function() {
			mixpanel.hb.heartbeat('test_event', 'content_123', { custom: 'prop' }, { forceFlush: true });

			expect(mixpanel.hb.track).to.have.been.calledOnce;
			const trackCall = mixpanel.hb.track.getCall(0);
			
			expect(trackCall.args[0]).to.equal('test_event');
			expect(trackCall.args[1]).to.include({
				custom: 'prop',
				$contentId: 'content_123',
				$heartbeats: 1,
				$duration: 0
			});
		});

		it('should auto-flush after timeout', function() {
			mixpanel.hb.heartbeat('test_event', 'content_123', { prop: 'value' });

			// Should not have tracked yet
			expect(mixpanel.hb.track).not.to.have.been.called;

			// Advance time by 30 seconds (default timeout)
			clock.tick(30000);

			// Should have auto-flushed
			expect(mixpanel.hb.track).to.have.been.calledOnce;
			const trackCall = mixpanel.hb.track.getCall(0);
			expect(trackCall.args[0]).to.equal('test_event');
			expect(trackCall.args[1]).to.include({
				prop: 'value',
				$contentId: 'content_123'
			});
		});

		it('should respect custom timeout', function() {
			mixpanel.hb.heartbeat('test_event', 'content_123', { prop: 'value' }, { timeout: 60000 });

			// Should not flush after 30 seconds
			clock.tick(30000);
			expect(mixpanel.hb.track).not.to.have.been.called;

			// Should flush after 60 seconds
			clock.tick(30000);
			expect(mixpanel.hb.track).to.have.been.calledOnce;
		});

		it('should force flush immediately when requested', function() {
			mixpanel.hb.heartbeat('test_event', 'content_123', { prop: 'value' }, { forceFlush: true });

			expect(mixpanel.hb.track).to.have.been.calledOnce;
		});

		it('should return undefined (no chaining)', function() {
			const result = mixpanel.hb.heartbeat('test_event', 'content_123', { prop: 'value' });
			expect(result).to.be.undefined;
		});
	});

	describe('Property aggregation behavior', function() {
		it('should aggregate numbers by using latest value', function() {
			mixpanel.hb.heartbeat('test_event', 'content_123', { currentTime: 10 });
			mixpanel.hb.heartbeat('test_event', 'content_123', { currentTime: 25 }, { forceFlush: true });

			expect(mixpanel.hb.track).to.have.been.calledOnce;
			const trackCall = mixpanel.hb.track.getCall(0);
			expect(trackCall.args[1]).to.include({ currentTime: 25 });
		});

		it('should aggregate strings by using latest value', function() {
			mixpanel.hb.heartbeat('test_event', 'content_123', { status: 'playing' });
			mixpanel.hb.heartbeat('test_event', 'content_123', { status: 'paused' }, { forceFlush: true });

			expect(mixpanel.hb.track).to.have.been.calledOnce;
			const trackCall = mixpanel.hb.track.getCall(0);
			expect(trackCall.args[1]).to.include({ status: 'paused' });
		});

		it('should aggregate arrays by concatenating', function() {
			mixpanel.hb.heartbeat('test_event', 'content_123', { events: ['start'] });
			mixpanel.hb.heartbeat('test_event', 'content_123', { events: ['pause'] }, { forceFlush: true });

			expect(mixpanel.hb.track).to.have.been.calledOnce;
			const trackCall = mixpanel.hb.track.getCall(0);
			expect(trackCall.args[1].events).to.deep.equal(['start', 'pause']);
		});

		it('should aggregate objects by merging', function() {
			mixpanel.hb.heartbeat('test_event', 'content_123', { metadata: { quality: 'HD' } });
			mixpanel.hb.heartbeat('test_event', 'content_123', { metadata: { volume: 0.8 } }, { forceFlush: true });

			expect(mixpanel.hb.track).to.have.been.calledOnce;
			const trackCall = mixpanel.hb.track.getCall(0);
			expect(trackCall.args[1].metadata).to.deep.equal({
				quality: 'HD',
				volume: 0.8
			});
		});

		it('should update heartbeat count and duration', function() {
			mixpanel.hb.heartbeat('test_event', 'content_123', { prop: 'first' });
			
			clock.tick(2000); // Advance 2 seconds
			
			mixpanel.hb.heartbeat('test_event', 'content_123', { prop: 'second' }, { forceFlush: true });

			expect(mixpanel.hb.track).to.have.been.calledOnce;
			const trackCall = mixpanel.hb.track.getCall(0);
			expect(trackCall.args[1]).to.include({
				$heartbeats: 2,
				$duration: 2 // 2 seconds
			});
		});

		it('should handle concurrent heartbeats with same eventName but different contentId', function() {
			// Start heartbeats for two different content items with same event name
			mixpanel.hb.heartbeat('video_watch', 'video_123', { score: 100, platform: 'html5' });
			mixpanel.hb.heartbeat('video_watch', 'video_456', { score: 200, platform: 'youtube' });
			
			clock.tick(1000); // Advance 1 second
			
			// Add more data to each and force flush on the second call
			mixpanel.hb.heartbeat('video_watch', 'video_123', { score: 50, quality: 'HD' }, { forceFlush: true });
			mixpanel.hb.heartbeat('video_watch', 'video_456', { score: 75, quality: '4K' }, { forceFlush: true });

			// Should have called track twice (once for each contentId)
			expect(mixpanel.hb.track).to.have.been.calledTwice;
			
			// Check first event (video_123)
			const firstCall = mixpanel.hb.track.getCall(0);
			expect(firstCall.args[0]).to.equal('video_watch');
			expect(firstCall.args[1]).to.include({
				$contentId: 'video_123',
				score: 50, // Latest value (not 100 + 50)
				platform: 'html5',
				quality: 'HD', // Latest value
				$heartbeats: 2,
				$duration: 1
			});

			// Check second event (video_456) 
			const secondCall = mixpanel.hb.track.getCall(1);
			expect(secondCall.args[0]).to.equal('video_watch');
			expect(secondCall.args[1]).to.include({
				$contentId: 'video_456',
				score: 75, // Latest value (not 200 + 75)
				platform: 'youtube',
				quality: '4K', // Latest value
				$heartbeats: 2,
				$duration: 1
			});
		});
	});

	describe('Storage management', function() {
		it('should handle storage size limit', function() {
			// This test verifies the behavior when hitting the storage limit
			// We'll create many unique events to trigger the limit
			for (let i = 0; i < 501; i++) {
				mixpanel.hb.heartbeat('event', `content_${i}`, { prop: i });
			}

			// Should have auto-flushed at least one event due to storage limit
			expect(mixpanel.hb.track).to.have.been.called;
		});
	});

	describe('Debug configuration', function() {
		it('should handle debug mode configuration changes', function() {
			// Should not throw errors when debug mode is enabled or disabled
			expect(function() {
				mixpanel.hb.set_config({ debug: true });
				mixpanel.hb.heartbeat('test_event', 'content_123', { prop: 'value' });
				
				mixpanel.hb.set_config({ debug: false });
				mixpanel.hb.heartbeat('test_event', 'content_456', { prop: 'value' });
			}).not.to.throw();
		});
	});

	describe('Error handling', function() {
		it('should handle track method failures gracefully', function() {
			mixpanel.hb.track.throws(new Error('Network failure'));
			
			// Should not throw error when flushing
			expect(function() {
				mixpanel.hb.heartbeat('test_event', 'content_123', { prop: 'value' }, { forceFlush: true });
			}).not.to.throw();
			
			// Should report the error
			expect(mixpanel.hb.report_error).to.have.been.calledWith('Error flushing heartbeat event: Network failure');
		});
	});

	describe('API compatibility', function() {
		it('should not expose old sub-methods', function() {
			// Verify that old chaining methods don't exist
			expect(mixpanel.hb.heartbeat.flush).to.be.undefined;
			expect(mixpanel.hb.heartbeat.clear).to.be.undefined;
			expect(mixpanel.hb.heartbeat.getState).to.be.undefined;
			expect(mixpanel.hb.heartbeat.getConfig).to.be.undefined;
			expect(mixpanel.hb.heartbeat.flushByContentId).to.be.undefined;
		});

		it('should expose new start/stop methods', function() {
			// Verify new methods exist
			expect(mixpanel.hb.heartbeat.start).to.be.a('function');
			expect(mixpanel.hb.heartbeat.stop).to.be.a('function');
		});
	});

	describe('Start/Stop API', function() {
		describe('heartbeat.start()', function() {
			it('should exist as a function', function() {
				expect(mixpanel.hb.heartbeat.start).to.be.a('function');
			});

			it('should require eventName and contentId', function() {
				mixpanel.hb.heartbeat.start();
				expect(mixpanel.hb.report_error).to.have.been.calledWith('heartbeat.start: eventName and contentId are required');

				mixpanel.hb.report_error.resetHistory();
				mixpanel.hb.heartbeat.start('event');
				expect(mixpanel.hb.report_error).to.have.been.calledWith('heartbeat.start: eventName and contentId are required');
			});

			it('should convert parameters to strings', function() {
				mixpanel.hb.heartbeat.start(123, 456, { prop: 'value' });
				
				// Advance time to trigger interval
				clock.tick(5000);
				
				// Stop to flush and verify
				mixpanel.hb.heartbeat.stop(123, 456, { forceFlush: true });
				
				expect(mixpanel.hb.track).to.have.been.called;
				const trackCall = mixpanel.hb.track.getCall(0);
				expect(trackCall.args[0]).to.equal('123');
				expect(trackCall.args[1]).to.include({ $contentId: '456' });
			});

			it('should start managed heartbeat with default 5-second interval', function() {
				mixpanel.hb.heartbeat.start('video_watch', 'video_123', { quality: 'HD' });

				// Should not have tracked immediately
				expect(mixpanel.hb.track).not.to.have.been.called;

				// Advance time by 5 seconds - should trigger a heartbeat internally
				clock.tick(5000);

				// Force stop to flush and verify heartbeat was called
				mixpanel.hb.heartbeat.stop('video_watch', 'video_123', { forceFlush: true });
				
				expect(mixpanel.hb.track).to.have.been.called;
				const trackCall = mixpanel.hb.track.getCall(0);
				expect(trackCall.args[0]).to.equal('video_watch');
				expect(trackCall.args[1]).to.include({
					quality: 'HD',
					$heartbeats: 1 // Should have been called once by the interval
				});
			});

			it('should support custom interval', function() {
				mixpanel.hb.heartbeat.start('video_watch', 'video_123', { quality: 'HD' }, { interval: 3000 });

				// Should not track after 2 seconds (no heartbeat interval fired yet)
				clock.tick(2000);
				mixpanel.hb.heartbeat.stop('video_watch', 'video_123', { forceFlush: true });
				mixpanel.hb.track.resetHistory();

				// Start again and wait for 3 seconds
				mixpanel.hb.heartbeat.start('video_watch', 'video_456', { quality: 'HD' }, { interval: 3000 });
				clock.tick(3000);
				
				// Should have heartbeat data after 3 seconds - force flush to verify
				mixpanel.hb.heartbeat.stop('video_watch', 'video_456', { forceFlush: true });
				expect(mixpanel.hb.track).to.have.been.called;
			});

			it('should warn and restart if already started', function() {
				mixpanel.hb.heartbeat.start('video_watch', 'video_123', { quality: 'HD' });
				
				mixpanel.hb.report_error.resetHistory();
				mixpanel.hb.heartbeat.start('video_watch', 'video_123', { quality: '4K' }, { interval: 2000 });

				expect(mixpanel.hb.report_error).to.have.been.calledWith('heartbeat.start: Event already started, restarting with new parameters');
				
				mixpanel.hb.heartbeat.stop('video_watch', 'video_123');
			});

			it('should prevent manual heartbeat() calls on started events', function() {
				mixpanel.hb.heartbeat.start('video_watch', 'video_123');
				
				mixpanel.hb.report_error.resetHistory();
				mixpanel.hb.heartbeat('video_watch', 'video_123', { manual: true });

				expect(mixpanel.hb.report_error).to.have.been.calledWith('heartbeat: Cannot call heartbeat() on an event managed by heartbeat.start(). Use heartbeat.stop() first.');
				
				mixpanel.hb.heartbeat.stop('video_watch', 'video_123');
			});

			it('should prevent starting on manual heartbeat events', function() {
				mixpanel.hb.heartbeat('video_watch', 'video_123', { manual: true });
				
				mixpanel.hb.report_error.resetHistory();
				mixpanel.hb.heartbeat.start('video_watch', 'video_123');

				expect(mixpanel.hb.report_error).to.have.been.calledWith('heartbeat.start: Cannot start managed heartbeat on an event already using manual heartbeat() calls. Stop calling heartbeat() first.');
			});

			it('should return undefined (no chaining)', function() {
				const result = mixpanel.hb.heartbeat.start('video_watch', 'video_123');
				expect(result).to.be.undefined;
				
				mixpanel.hb.heartbeat.stop('video_watch', 'video_123');
			});

			it('should validate interval parameter bounds', function() {
				// Test too small interval
				mixpanel.hb.heartbeat.start('test_event', 'test_content', {}, { interval: 50 });
				expect(mixpanel.hb.report_error).to.have.been.calledWith('heartbeat.start: interval must be a number >= 100ms, using default 5000ms');
				
				mixpanel.hb.report_error.resetHistory();
				
				// Test too large interval
				mixpanel.hb.heartbeat.start('test_event2', 'test_content2', {}, { interval: 400000 });
				expect(mixpanel.hb.report_error).to.have.been.calledWith('heartbeat.start: interval too large, using maximum 300000ms');
				
				mixpanel.hb.report_error.resetHistory();
				
				// Test invalid type
				mixpanel.hb.heartbeat.start('test_event3', 'test_content3', {}, { interval: 'invalid' });
				expect(mixpanel.hb.report_error).to.have.been.calledWith('heartbeat.start: interval must be a number >= 100ms, using default 5000ms');
				
				// Clean up
				mixpanel.hb.heartbeat.stop('test_event', 'test_content');
				mixpanel.hb.heartbeat.stop('test_event2', 'test_content2');
				mixpanel.hb.heartbeat.stop('test_event3', 'test_content3');
			});
		});

		describe('heartbeat.stop()', function() {
			it('should exist as a function', function() {
				expect(mixpanel.hb.heartbeat.stop).to.be.a('function');
			});

			it('should require eventName and contentId', function() {
				mixpanel.hb.heartbeat.stop();
				expect(mixpanel.hb.report_error).to.have.been.calledWith('heartbeat.stop: eventName and contentId are required');

				mixpanel.hb.report_error.resetHistory();
				mixpanel.hb.heartbeat.stop('event');
				expect(mixpanel.hb.report_error).to.have.been.calledWith('heartbeat.stop: eventName and contentId are required');
			});

			it('should NOT immediately flush when stopped (unless forceFlush)', function() {
				mixpanel.hb.heartbeat.start('video_watch', 'video_123', { quality: 'HD' });
				
				// Advance time to trigger some heartbeats
				clock.tick(10000); // 2 heartbeats at 5-second intervals
				
				mixpanel.hb.track.resetHistory();
				mixpanel.hb.heartbeat.stop('video_watch', 'video_123');

				// Should NOT have flushed immediately (new behavior)
				expect(mixpanel.hb.track).to.not.have.been.called;
				
				// But should flush after 30-second inactivity timer
				clock.tick(30000);
				expect(mixpanel.hb.track).to.have.been.calledOnce;
				const trackCall = mixpanel.hb.track.getCall(0);
				expect(trackCall.args[0]).to.equal('video_watch');
				expect(trackCall.args[1]).to.include({
					quality: 'HD',
					$contentId: 'video_123',
					$heartbeats: 2
				});
			});

			it('should flush immediately when stopped with forceFlush: true', function() {
				mixpanel.hb.heartbeat.start('video_watch', 'video_123', { quality: 'HD' });
				
				// Advance time to trigger some heartbeats
				clock.tick(10000); // 2 heartbeats at 5-second intervals
				
				mixpanel.hb.track.resetHistory();
				mixpanel.hb.heartbeat.stop('video_watch', 'video_123', { forceFlush: true });

				// Should have flushed immediately with forceFlush
				expect(mixpanel.hb.track).to.have.been.calledOnce;
				const trackCall = mixpanel.hb.track.getCall(0);
				expect(trackCall.args[0]).to.equal('video_watch');
				expect(trackCall.args[1]).to.include({
					quality: 'HD',
					$contentId: 'video_123',
					$heartbeats: 2
				});
			});

			it('should allow resuming a stopped session with start()', function() {
				// Start initial session
				mixpanel.hb.heartbeat.start('video_watch', 'video_123', { quality: 'HD' });
				clock.tick(10000); // 2 heartbeats
				
				// Stop without force flush (pauses session)
				mixpanel.hb.heartbeat.stop('video_watch', 'video_123');
				expect(mixpanel.hb.track).to.not.have.been.called;
				
				// Resume the session
				mixpanel.hb.track.resetHistory();
				mixpanel.hb.heartbeat.start('video_watch', 'video_123', { quality: '4K' }); // Updated props
				clock.tick(5000); // 1 more heartbeat
				
				// Force flush to check aggregated data
				mixpanel.hb.heartbeat.stop('video_watch', 'video_123', { forceFlush: true });
				
				expect(mixpanel.hb.track).to.have.been.calledOnce;
				const trackCall = mixpanel.hb.track.getCall(0);
				expect(trackCall.args[1]).to.include({
					quality: '4K', // Latest value
					$contentId: 'video_123',
					$heartbeats: 3 // 2 from first session + 1 from resumed session
				});
			});

			it('should stop the interval', function() {
				mixpanel.hb.heartbeat.start('video_watch', 'video_123');
				
				// Stop the heartbeat
				mixpanel.hb.heartbeat.stop('video_watch', 'video_123');
				
				mixpanel.hb.track.resetHistory();
				
				// Advance time - should not trigger more heartbeats
				clock.tick(10000);
				expect(mixpanel.hb.track).not.to.have.been.called;
			});

			it('should handle stopping non-existent heartbeat gracefully', function() {
				expect(function() {
					mixpanel.hb.heartbeat.stop('video_watch', 'nonexistent');
				}).not.to.throw();
			});

			it('should return undefined (no chaining)', function() {
				mixpanel.hb.heartbeat.start('video_watch', 'video_123');
				const result = mixpanel.hb.heartbeat.stop('video_watch', 'video_123');
				expect(result).to.be.undefined;
			});
		});

		describe('Integration scenarios', function() {
			it('should handle multiple concurrent started heartbeats', function() {
				// Reset track history to ensure clean state
				mixpanel.hb.track.resetHistory();
				
				// Start multiple heartbeats
				mixpanel.hb.heartbeat.start('video_watch', 'video_1', { video: 1 });
				mixpanel.hb.heartbeat.start('podcast_listen', 'episode_1', { podcast: 1 });
				mixpanel.hb.heartbeat.start('video_watch', 'video_2', { video: 2 });

				// Advance time to trigger heartbeats
				clock.tick(5000);

				// Stop all with force flush to ensure immediate tracking
				mixpanel.hb.heartbeat.stop('video_watch', 'video_1', { forceFlush: true });
				mixpanel.hb.heartbeat.stop('podcast_listen', 'episode_1', { forceFlush: true });
				mixpanel.hb.heartbeat.stop('video_watch', 'video_2', { forceFlush: true });

				// Should have tracked all three
				expect(mixpanel.hb.track).to.have.callCount(3);
			});

			it('should aggregate properties correctly in managed mode', function() {
				mixpanel.hb.heartbeat.start('game_session', 'level_1', { score: 100, level: 'easy' });

				// Advance time and let some heartbeats fire
				clock.tick(10000); // 2 heartbeats

				// Stop with force flush and check aggregation
				mixpanel.hb.track.resetHistory();
				mixpanel.hb.heartbeat.stop('game_session', 'level_1', { forceFlush: true });

				expect(mixpanel.hb.track).to.have.been.calledOnce;
				const trackCall = mixpanel.hb.track.getCall(0);
				expect(trackCall.args[1]).to.include({
					score: 100, // Latest value (same as each heartbeat since they all send 100)
					level: 'easy', // Latest value
					$heartbeats: 2,
					$contentId: 'level_1'
				});
			});
		});

		describe('Storage management with start/stop', function() {
			it('should respect storage size limit with managed heartbeats', function() {
				// Start many heartbeats and trigger them to fill storage
				for (let i = 0; i < 500; i++) {
					mixpanel.hb.heartbeat.start('event', `content_${i}`, { index: i }, { interval: 1000 });
				}

				// Advance time to trigger all heartbeats and fill storage
				clock.tick(1000);

				// Start one more - should trigger storage limit warning
				mixpanel.hb.report_error.resetHistory();
				mixpanel.hb.heartbeat.start('event', 'content_limit_test', { test: true }, { interval: 1000 });
				clock.tick(1000); // Trigger the new heartbeat

				// Should have reported storage limit reached
				expect(mixpanel.hb.report_error).to.have.been.calledWithMatch('Maximum storage size reached');

				// Clean up ALL to avoid affecting other tests
				for (let i = 0; i < 500; i++) {
					mixpanel.hb.heartbeat.stop('event', `content_${i}`);
				}
				mixpanel.hb.heartbeat.stop('event', 'content_limit_test');
			});
		});
	});
});