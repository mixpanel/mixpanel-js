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

		// Initialize the global mixpanel instance for testing
		mixpanel.init('test-token', {
			api_host: 'localhost',
			debug: false,
			persistence: 'localStorage'
		});

		// Store original methods and stub only the external dependencies
		originalTrack = mixpanel.track;
		originalReportError = mixpanel.report_error;
		
		mixpanel.track = sinon.stub();
		mixpanel.report_error = sinon.stub();
	});

	afterEach(function() {
		clock.restore();
		clearOptInOut();
		
		// Restore original methods
		mixpanel.track = originalTrack;
		mixpanel.report_error = originalReportError;
	});

	describe('Basic functionality', function() {
		it('should exist as a function', function() {
			expect(mixpanel.heartbeat).to.be.a('function');
		});

		it('should require eventName and contentId', function() {
			mixpanel.heartbeat();
			expect(mixpanel.report_error).to.have.been.calledWith('heartbeat: eventName and contentId are required');

			mixpanel.report_error.resetHistory();
			mixpanel.heartbeat('event');
			expect(mixpanel.report_error).to.have.been.calledWith('heartbeat: eventName and contentId are required');
		});

		it('should convert parameters to strings', function() {
			mixpanel.heartbeat(123, 456, { prop: 'value' });
			
			// Verify the conversion by forcing a flush and checking track call
			mixpanel.heartbeat(123, 456, {}, { forceFlush: true });
			
			expect(mixpanel.track).to.have.been.called;
			const trackCall = mixpanel.track.getCall(0);
			expect(trackCall.args[0]).to.equal('123'); // eventName converted to string
			expect(trackCall.args[1]).to.include({ $contentId: '456' }); // contentId converted to string
		});

		it('should handle invalid parameters', function() {
			mixpanel.heartbeat('', 'content');
			expect(mixpanel.report_error).to.have.been.calledWith('heartbeat: eventName and contentId are required');

			mixpanel.report_error.resetHistory();
			mixpanel.heartbeat('event', '');
			expect(mixpanel.report_error).to.have.been.calledWith('heartbeat: eventName and contentId are required');

			mixpanel.report_error.resetHistory();
			mixpanel.heartbeat(null, 'content');
			expect(mixpanel.report_error).to.have.been.calledWith('heartbeat: eventName and contentId are required');
		});

		it('should track events with automatic properties', function() {
			mixpanel.heartbeat('test_event', 'content_123', { custom: 'prop' }, { forceFlush: true });

			expect(mixpanel.track).to.have.been.calledOnce;
			const trackCall = mixpanel.track.getCall(0);
			
			expect(trackCall.args[0]).to.equal('test_event');
			expect(trackCall.args[1]).to.include({
				custom: 'prop',
				$contentId: 'content_123',
				$heartbeats: 1,
				$duration: 0
			});
		});

		it('should auto-flush after timeout', function() {
			mixpanel.heartbeat('test_event', 'content_123', { prop: 'value' });

			// Should not have tracked yet
			expect(mixpanel.track).not.to.have.been.called;

			// Advance time by 30 seconds (default timeout)
			clock.tick(30000);

			// Should have auto-flushed
			expect(mixpanel.track).to.have.been.calledOnce;
			const trackCall = mixpanel.track.getCall(0);
			expect(trackCall.args[0]).to.equal('test_event');
			expect(trackCall.args[1]).to.include({
				prop: 'value',
				$contentId: 'content_123'
			});
		});

		it('should respect custom timeout', function() {
			mixpanel.heartbeat('test_event', 'content_123', { prop: 'value' }, { timeout: 60000 });

			// Should not flush after 30 seconds
			clock.tick(30000);
			expect(mixpanel.track).not.to.have.been.called;

			// Should flush after 60 seconds
			clock.tick(30000);
			expect(mixpanel.track).to.have.been.calledOnce;
		});

		it('should force flush immediately when requested', function() {
			mixpanel.heartbeat('test_event', 'content_123', { prop: 'value' }, { forceFlush: true });

			expect(mixpanel.track).to.have.been.calledOnce;
		});

		it('should return undefined (no chaining)', function() {
			const result = mixpanel.heartbeat('test_event', 'content_123', { prop: 'value' });
			expect(result).to.be.undefined;
		});
	});

	describe('Property aggregation behavior', function() {
		it('should aggregate numbers by adding', function() {
			mixpanel.heartbeat('test_event', 'content_123', { count: 10 });
			mixpanel.heartbeat('test_event', 'content_123', { count: 5 }, { forceFlush: true });

			expect(mixpanel.track).to.have.been.calledOnce;
			const trackCall = mixpanel.track.getCall(0);
			expect(trackCall.args[1]).to.include({ count: 15 });
		});

		it('should aggregate strings by using latest value', function() {
			mixpanel.heartbeat('test_event', 'content_123', { status: 'playing' });
			mixpanel.heartbeat('test_event', 'content_123', { status: 'paused' }, { forceFlush: true });

			expect(mixpanel.track).to.have.been.calledOnce;
			const trackCall = mixpanel.track.getCall(0);
			expect(trackCall.args[1]).to.include({ status: 'paused' });
		});

		it('should aggregate arrays by concatenating', function() {
			mixpanel.heartbeat('test_event', 'content_123', { events: ['start'] });
			mixpanel.heartbeat('test_event', 'content_123', { events: ['pause'] }, { forceFlush: true });

			expect(mixpanel.track).to.have.been.calledOnce;
			const trackCall = mixpanel.track.getCall(0);
			expect(trackCall.args[1].events).to.deep.equal(['start', 'pause']);
		});

		it('should aggregate objects by merging', function() {
			mixpanel.heartbeat('test_event', 'content_123', { metadata: { quality: 'HD' } });
			mixpanel.heartbeat('test_event', 'content_123', { metadata: { volume: 0.8 } }, { forceFlush: true });

			expect(mixpanel.track).to.have.been.calledOnce;
			const trackCall = mixpanel.track.getCall(0);
			expect(trackCall.args[1].metadata).to.deep.equal({
				quality: 'HD',
				volume: 0.8
			});
		});

		it('should update heartbeat count and duration', function() {
			mixpanel.heartbeat('test_event', 'content_123', { prop: 'first' });
			
			clock.tick(2000); // Advance 2 seconds
			
			mixpanel.heartbeat('test_event', 'content_123', { prop: 'second' }, { forceFlush: true });

			expect(mixpanel.track).to.have.been.calledOnce;
			const trackCall = mixpanel.track.getCall(0);
			expect(trackCall.args[1]).to.include({
				$heartbeats: 2,
				$duration: 2 // 2 seconds
			});
		});
	});

	describe('Storage management', function() {
		it('should handle storage size limit', function() {
			// This test verifies the behavior when hitting the storage limit
			// We'll create many unique events to trigger the limit
			for (let i = 0; i < 501; i++) {
				mixpanel.heartbeat('event', `content_${i}`, { prop: i });
			}

			// Should have auto-flushed at least one event due to storage limit
			expect(mixpanel.track).to.have.been.called;
		});
	});

	describe('Debug configuration', function() {
		it('should handle debug mode configuration changes', function() {
			// Should not throw errors when debug mode is enabled or disabled
			expect(function() {
				mixpanel.set_config({ debug: true });
				mixpanel.heartbeat('test_event', 'content_123', { prop: 'value' });
				
				mixpanel.set_config({ debug: false });
				mixpanel.heartbeat('test_event', 'content_456', { prop: 'value' });
			}).not.to.throw();
		});
	});

	describe('Error handling', function() {
		it('should handle track method failures gracefully', function() {
			mixpanel.track.throws(new Error('Network failure'));
			
			// Should not throw error when flushing
			expect(function() {
				mixpanel.heartbeat('test_event', 'content_123', { prop: 'value' }, { forceFlush: true });
			}).not.to.throw();
			
			// Should report the error
			expect(mixpanel.report_error).to.have.been.calledWith('Error flushing heartbeat event: Network failure');
		});
	});

	describe('API compatibility', function() {
		it('should not expose old sub-methods', function() {
			// Verify that old chaining methods don't exist
			expect(mixpanel.heartbeat.flush).to.be.undefined;
			expect(mixpanel.heartbeat.clear).to.be.undefined;
			expect(mixpanel.heartbeat.getState).to.be.undefined;
			expect(mixpanel.heartbeat.getConfig).to.be.undefined;
			expect(mixpanel.heartbeat.flushByContentId).to.be.undefined;
		});
	});
});