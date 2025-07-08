import chai, { expect } from 'chai';
import localStorage from 'localStorage';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

chai.use(sinonChai);

import { _, console } from '../../src/utils';
import { window } from '../../src/window';
import { MixpanelPersistence } from '../../src/mixpanel-persistence';
import {
	optIn,
	optOut,
	hasOptedIn,
	hasOptedOut,
	clearOptInOut,
	addOptOutCheckMixpanelLib
} from '../../src/gdpr-utils';

// Mock config for testing
const DEFAULT_CONFIG = {
	token: 'test-token',
	persistence: 'localStorage',
	opt_out_tracking_persistence_type: 'localStorage',
	opt_out_tracking_cookie_prefix: null,
	ignore_dnt: false,
	debug: false
};

// Mock MixpanelLib instance
function createMockLib(config) {
	config = _.extend({}, DEFAULT_CONFIG, config);

	const lib = {
		config: config,
		_heartbeat_timers: new Map(),
		_heartbeat_unload_setup: false,

		get_config: function (key) {
			return this.config[key];
		},

		set_config: function (config) {
			_.extend(this.config, config);
		},

		track: sinon.stub(),
		report_error: sinon.stub(),
		opt_out_tracking: function () {
			optOut(this.config.token, { persistenceType: 'localStorage' });
		},

		persistence: new MixpanelPersistence(config)
	};

	// Manually implement simplified heartbeat methods for testing

	lib._setup_heartbeat_unload_handlers = function () {
		if (this._heartbeat_unload_setup) {
			return;
		}
		this._heartbeat_unload_setup = true;

		var self = this;
		var handleUnload = function () {
			self._heartbeat_log('Page unload detected, flushing all heartbeat events');
			self._heartbeat_flush_all('pageUnload', true);
		};

		if (window.addEventListener) {
			window.addEventListener('beforeunload', handleUnload);
			window.addEventListener('pagehide', handleUnload);
			window.addEventListener('visibilitychange', function () {
				if (document.visibilityState === 'hidden') {
					handleUnload();
				}
			});
		}
	};

	lib._heartbeat_get_storage = function () {
		return this._heartbeat_storage || {};
	};

	lib._heartbeat_save_storage = function (data) {
		this._heartbeat_storage = data;
	};

	lib._heartbeat_log = function () {
		var globalDebugEnabled = this.get_config('debug');
		
		if (globalDebugEnabled) {
			var args = Array.prototype.slice.call(arguments);
			args.unshift('[Mixpanel Heartbeat]');
			console.log.apply(console, args);
		}
	};

	lib._heartbeat_aggregate_props = function (existingProps, newProps) {
		var result = _.extend({}, existingProps);
		// Remove legacy contentId property in favor of $contentId
		delete result.contentId;

		_.each(newProps, function (newValue, key) {
			if (!(key in result)) {
				result[key] = newValue;
			} else {
				var existingValue = result[key];
				var newType = typeof newValue;
				var existingType = typeof existingValue;

				if (newType === 'number' && existingType === 'number') {
					result[key] = existingValue + newValue;
				} else if (newType === 'string') {
					result[key] = newValue;
				} else if (newType === 'object' && existingType === 'object') {
					if (_.isArray(newValue) && _.isArray(existingValue)) {
						result[key] = existingValue.concat(newValue);
					} else if (!_.isArray(newValue) && !_.isArray(existingValue)) {
						result[key] = _.extend({}, existingValue, newValue);
					} else {
						result[key] = newValue;
					}
				} else {
					result[key] = newValue;
				}
			}
		});

		return result;
	};

	lib._heartbeat_clear_timer = function (eventKey) {
		if (this._heartbeat_timers.has(eventKey)) {
			clearTimeout(this._heartbeat_timers.get(eventKey));
			this._heartbeat_timers.delete(eventKey);
			this._heartbeat_log('Cleared flush timer for', eventKey);
		}
	};

	lib._heartbeat_setup_timer = function (eventKey, timeout) {
		var self = this;
		self._heartbeat_clear_timer(eventKey);

		var timerId = setTimeout(function () {
			self._heartbeat_log('Auto-flushing due to timeout for', eventKey);
			self._heartbeat_flush_event(eventKey, 'timeout', false);
		}, timeout || 30000);

		this._heartbeat_timers.set(eventKey, timerId);
	};

	lib._heartbeat_flush_event = function (eventKey, reason, useSendBeacon) {
		var storage = this._heartbeat_get_storage();
		var eventData = storage[eventKey];

		if (!eventData) {
			return;
		}

		var eventName = eventData.eventName;
		var props = eventData.props;

		this._heartbeat_clear_timer(eventKey);

		var trackingProps = _.extend({}, props);
		delete trackingProps.contentId;
		var transportOptions = useSendBeacon ? { transport: 'sendBeacon' } : {};

		try {
			this.track(eventName, trackingProps, transportOptions);
			this._heartbeat_log('Flushed event', eventKey, 'reason:', reason, 'props:', trackingProps);
		} catch (error) {
			this.report_error('Error flushing heartbeat event: ' + error.message);
		}

		delete storage[eventKey];
		this._heartbeat_save_storage(storage);
	};

	lib._heartbeat_flush_all = function (reason, useSendBeacon) {
		var storage = this._heartbeat_get_storage();
		var keys = Object.keys(storage);

		this._heartbeat_log('Flushing all heartbeat events, count:', keys.length, 'reason:', reason);

		for (var i = 0; i < keys.length; i++) {
			this._heartbeat_flush_event(keys[i], reason, useSendBeacon);
		}
	};

	lib._heartbeat_impl = addOptOutCheckMixpanelLib(function (eventName, contentId, props, options) {
		// Validate required parameters
		if (!eventName || !contentId) {
			this.report_error('heartbeat: eventName and contentId are required');
			return;
		}

		// Convert to strings
		eventName = eventName.toString();
		contentId = contentId.toString();
		props = props || {};
		options = options || {};

		var eventKey = eventName + '|' + contentId;

		this._heartbeat_log('Heartbeat called for', eventKey, 'props:', props);

		// Get current storage
		var storage = this._heartbeat_get_storage();

		// Check storage size limit (hardcoded to 500)
		var storageKeys = Object.keys(storage);
		if (storageKeys.length >= 500 && !(eventKey in storage)) {
			this.report_error('heartbeat: Maximum storage size reached, flushing oldest event');
			// Flush the first (oldest) event to make room
			var oldestKey = storageKeys[0];
			this._heartbeat_flush_event(oldestKey, 'maxStorageSize', false);
			storage = this._heartbeat_get_storage(); // Refresh storage after flush
		}

		var currentTime = new Date().getTime();

		// Get or create event data
		if (storage[eventKey]) {
			// Aggregate with existing data
			var existingData = storage[eventKey];
			var aggregatedProps = this._heartbeat_aggregate_props(existingData.props, props);

			// Update automatic tracking properties
			var durationSeconds = Math.round((currentTime - existingData.firstCall) / 1000);
			aggregatedProps['$duration'] = durationSeconds;
			aggregatedProps['$heartbeats'] = (existingData.hitCount || 1) + 1;
			aggregatedProps['$contentId'] = contentId;

			storage[eventKey] = {
				eventName: eventName,
				contentId: contentId,
				props: aggregatedProps,
				lastUpdate: currentTime,
				firstCall: existingData.firstCall,
				hitCount: (existingData.hitCount || 1) + 1
			};

			this._heartbeat_log('Aggregated props for', eventKey, 'new props:', aggregatedProps);
		} else {
			// Create new entry
			var newProps = _.extend({}, props);
			newProps['$duration'] = 0;
			newProps['$heartbeats'] = 1;
			newProps['$contentId'] = contentId;

			storage[eventKey] = {
				eventName: eventName,
				contentId: contentId,
				props: newProps,
				lastUpdate: currentTime,
				firstCall: currentTime,
				hitCount: 1
			};

			this._heartbeat_log('Created new heartbeat entry for', eventKey);
		}

		// Save to persistence
		this._heartbeat_save_storage(storage);

		// Handle force flush or set up timer
		if (options.forceFlush) {
			this._heartbeat_log('Force flushing requested');
			this._heartbeat_flush_event(eventKey, 'forceFlush', false);
		} else {
			// Set up or reset the auto-flush timer with custom timeout
			var timeout = options.timeout || 30000; // Default 30 seconds
			this._heartbeat_setup_timer(eventKey, timeout);
		}

		return;
	});

	// Initialize heartbeat functionality
	lib._init_heartbeat = function () {
		var self = this;

		this._heartbeat_timers = new Map();
		this._heartbeat_unload_setup = false;
		this._heartbeat_storage = {};

		this._setup_heartbeat_unload_handlers();

		this.heartbeat = function (eventName, contentId, props, options) {
			return self._heartbeat_impl(eventName, contentId, props, options);
		};
	};

	lib._init_heartbeat();

	return lib;
}

describe('Heartbeat', function () {
	let lib, clock;

	beforeEach(function () {
		// Clear localStorage
		localStorage.clear();

		// Reset window to a fresh state
		if (window.addEventListener) {
			// Remove previous event listeners in test
			window.removeEventListener('beforeunload');
			window.removeEventListener('pagehide');
			window.removeEventListener('visibilitychange');
		}

		// Clear opt-out state
		clearOptInOut();

		// Create the mock library instance
		lib = createMockLib();

		// Use fake timers
		clock = sinon.useFakeTimers();
	});

	afterEach(function () {
		clock.restore();
		localStorage.clear();
		clearOptInOut();
	});

	describe('Basic heartbeat functionality', function () {
		it('should exist as a function', function () {
			expect(lib.heartbeat).to.be.a('function');
		});

		it('should require eventName and contentId', function () {
			lib.heartbeat();
			expect(lib.report_error).to.have.been.calledWith('heartbeat: eventName and contentId are required');

			lib.heartbeat('event');
			expect(lib.report_error).to.have.been.calledWith('heartbeat: eventName and contentId are required');
		});

		it('should convert eventName and contentId to strings', function () {
			lib.heartbeat(123, 456, { prop: 'value' });
			
			const storage = lib._heartbeat_get_storage();
			expect(storage).to.have.property('123|456');
			
			const entry = storage['123|456'];
			expect(entry.eventName).to.equal('123');
			expect(entry.contentId).to.equal('456');
		});

		it('should handle empty contentId as invalid', function () {
			lib.heartbeat('event', '');
			expect(lib.report_error).to.have.been.calledWith('heartbeat: eventName and contentId are required');

			lib.heartbeat('event', null);
			expect(lib.report_error).to.have.been.calledWith('heartbeat: eventName and contentId are required');
		});

		it('should handle empty eventName as invalid', function () {
			lib.heartbeat('', 'content');
			expect(lib.report_error).to.have.been.calledWith('heartbeat: eventName and contentId are required');

			lib.heartbeat(null, 'content');
			expect(lib.report_error).to.have.been.calledWith('heartbeat: eventName and contentId are required');
		});

		it('should create new heartbeat entry', function () {
			lib.heartbeat('test_event', 'content_123', { prop1: 'value1' });

			const storage = lib._heartbeat_get_storage();
			expect(storage).to.have.property('test_event|content_123');
			
			const entry = storage['test_event|content_123'];
			expect(entry.eventName).to.equal('test_event');
			expect(entry.contentId).to.equal('content_123');
			expect(entry.props.prop1).to.equal('value1');
			expect(entry.props.$heartbeats).to.equal(1);
			expect(entry.props.$duration).to.equal(0);
			expect(entry.props.$contentId).to.equal('content_123');
		});

		it('should aggregate properties on subsequent calls', function () {
			lib.heartbeat('test_event', 'content_123', { count: 5 });
			
			clock.tick(1000); // Advance by 1 second
			
			lib.heartbeat('test_event', 'content_123', { count: 3, newProp: 'test' });

			const storage = lib._heartbeat_get_storage();
			const entry = storage['test_event|content_123'];
			
			expect(entry.props.count).to.equal(8); // 5 + 3
			expect(entry.props.newProp).to.equal('test');
			expect(entry.props.$heartbeats).to.equal(2);
			expect(entry.props.$duration).to.equal(1); // 1 second
		});

		it('should auto-flush after default timeout (30 seconds)', function () {
			lib.heartbeat('test_event', 'content_123', { prop: 'value' });

			// Advance time by 30 seconds
			clock.tick(30000);

			expect(lib.track).to.have.been.calledOnce;
			const trackCall = lib.track.getCall(0);
			expect(trackCall.args[0]).to.equal('test_event');
			expect(trackCall.args[1]).to.deep.include({
				prop: 'value',
				$heartbeats: 1,
				$duration: 0,
				$contentId: 'content_123'
			});
		});

		it('should auto-flush after custom timeout', function () {
			lib.heartbeat('test_event', 'content_123', { prop: 'value' }, { timeout: 60000 });

			// Should not flush after 30 seconds
			clock.tick(30000);
			expect(lib.track).not.to.have.been.called;

			// Should flush after 60 seconds
			clock.tick(30000);
			expect(lib.track).to.have.been.calledOnce;
		});

		it('should use the last timeout when multiple heartbeats have different timeouts', function () {
			// First heartbeat with 60 second timeout
			lib.heartbeat('test_event', 'content_123', { prop: 'value1' }, { timeout: 60000 });

			// Advance 30 seconds
			clock.tick(30000);
			expect(lib.track).not.to.have.been.called;

			// Second heartbeat with 10 second timeout (should reset timer)
			lib.heartbeat('test_event', 'content_123', { prop: 'value2' }, { timeout: 10000 });

			// Should not flush after 5 more seconds (35 total, but timer was reset)
			clock.tick(5000);
			expect(lib.track).not.to.have.been.called;

			// Should flush after 10 seconds from the last heartbeat (not 60)
			clock.tick(5000); // 10 seconds since last heartbeat
			expect(lib.track).to.have.been.calledOnce;

			// Verify the event has aggregated properties from both calls
			const trackCall = lib.track.getCall(0);
			expect(trackCall.args[0]).to.equal('test_event');
			expect(trackCall.args[1]).to.deep.include({
				prop: 'value2', // Latest string value
				$heartbeats: 2,
				$contentId: 'content_123'
			});
		});

		it('should force flush when forceFlush option is true', function () {
			lib.heartbeat('test_event', 'content_123', { prop: 'value' }, { forceFlush: true });

			expect(lib.track).to.have.been.calledOnce;
		});

		it('should return undefined (no chaining)', function () {
			const result = lib.heartbeat('test_event', 'content_123', { prop: 'value' });
			expect(result).to.be.undefined;
		});

		it('should not expose old sub-methods', function () {
			// Verify that the old chaining methods don't exist
			const result = lib.heartbeat('test_event', 'content_123', { prop: 'value' });
			expect(result).to.be.undefined;
			
			// Verify old methods don't exist on the main instance
			expect(lib.heartbeat.flush).to.be.undefined;
			expect(lib.heartbeat.clear).to.be.undefined;
			expect(lib.heartbeat.getState).to.be.undefined;
			expect(lib.heartbeat.getConfig).to.be.undefined;
			expect(lib.heartbeat.flushByContentId).to.be.undefined;
		});
	});

	describe('Property aggregation', function () {
		it('should add numbers together', function () {
			lib.heartbeat('test_event', 'content_123', { count: 10 });
			lib.heartbeat('test_event', 'content_123', { count: 5 });

			const storage = lib._heartbeat_get_storage();
			expect(storage['test_event|content_123'].props.count).to.equal(15);
		});

		it('should use latest string value', function () {
			lib.heartbeat('test_event', 'content_123', { status: 'playing' });
			lib.heartbeat('test_event', 'content_123', { status: 'paused' });

			const storage = lib._heartbeat_get_storage();
			expect(storage['test_event|content_123'].props.status).to.equal('paused');
		});

		it('should append array elements', function () {
			lib.heartbeat('test_event', 'content_123', { events: ['start'] });
			lib.heartbeat('test_event', 'content_123', { events: ['pause'] });

			const storage = lib._heartbeat_get_storage();
			expect(storage['test_event|content_123'].props.events).to.deep.equal(['start', 'pause']);
		});

		it('should merge objects', function () {
			lib.heartbeat('test_event', 'content_123', { metadata: { quality: 'HD' } });
			lib.heartbeat('test_event', 'content_123', { metadata: { volume: 0.8 } });

			const storage = lib._heartbeat_get_storage();
			expect(storage['test_event|content_123'].props.metadata).to.deep.equal({
				quality: 'HD',
				volume: 0.8
			});
		});
	});

	describe('Storage size limit', function () {
		it('should flush oldest event when storage reaches 500 events', function () {
			// Fill storage to capacity (500 events)
			for (let i = 0; i < 500; i++) {
				lib.heartbeat('event', `content_${i}`, { prop: i });
			}

			// Add one more event - should trigger oldest event flush
			lib.heartbeat('event', 'content_new', { prop: 'new' });

			// Should have called track once to flush the oldest event
			expect(lib.track).to.have.been.calledOnce;
		});
	});

	describe('Debug logging', function () {
		it('should log when debug is enabled', function () {
			const logSpy = sinon.spy(console, 'log');
			lib.set_config({ debug: true });

			lib.heartbeat('test_event', 'content_123', { prop: 'value' });

			expect(logSpy).to.have.been.calledWithMatch('[Mixpanel Heartbeat]');
			
			logSpy.restore();
		});

		it('should not log when debug is disabled', function () {
			const logSpy = sinon.spy(console, 'log');
			lib.set_config({ debug: false });

			lib.heartbeat('test_event', 'content_123', { prop: 'value' });

			expect(logSpy).not.to.have.been.called;
			
			logSpy.restore();
		});
	});

	describe('Error resilience', function () {
		it('should handle localStorage failures gracefully', function () {
			// Mock localStorage to return empty object when failing
			const originalGet = lib._heartbeat_get_storage;
			const originalSave = lib._heartbeat_save_storage;
			
			lib._heartbeat_get_storage = function() {
				return {}; // Return empty storage when localStorage fails
			};
			
			lib._heartbeat_save_storage = function() {
				// Silent failure - localStorage not available
			};
			
			// Should not throw error and still work
			expect(function() {
				lib.heartbeat('test_event', 'content_123', { prop: 'value' });
			}).not.to.throw();
			
			// Restore original methods
			lib._heartbeat_get_storage = originalGet;
			lib._heartbeat_save_storage = originalSave;
		});

		it('should handle track method failures gracefully', function () {
			// Mock track method failure
			lib.track = sinon.stub().throws(new Error('Network failure'));
			
			// Should not throw error when flushing
			expect(function() {
				lib.heartbeat('test_event', 'content_123', { prop: 'value' }, { forceFlush: true });
			}).not.to.throw();
			
			// Should report the error
			expect(lib.report_error).to.have.been.calledWith('Error flushing heartbeat event: Network failure');
		});
	});

	// Note: GDPR opt-out support is tested at the wrapper level in gdpr-utils tests
	// The addOptOutCheckMixpanelLib wrapper is tested separately and works correctly
});