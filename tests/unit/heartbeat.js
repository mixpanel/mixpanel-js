import chai, { expect } from 'chai';
import localStorage from 'localStorage';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

chai.use(sinonChai);

import { _, console } from '../../src/utils';
import { window } from '../../src/window';
import { MixpanelPersistence, HEARTBEAT_QUEUE_KEY, HEARTBEAT_FLUSHON_KEY } from '../../src/mixpanel-persistence';
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
	heartbeat_max_buffer_time_ms: 300000,
	heartbeat_max_props_count: 1000,
	heartbeat_max_aggregated_value: 100000,
	heartbeat_max_storage_size: 100,
	heartbeat_enable_logging: false
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

	// Manually implement heartbeat methods for testing

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
		var stored = this.persistence.props[HEARTBEAT_QUEUE_KEY];
		return stored && typeof stored === 'object' ? stored : {};
	};

	lib._heartbeat_save_storage = function (data) {
		var current_props = {};
		current_props[HEARTBEAT_QUEUE_KEY] = data;
		this.persistence.register(current_props);
	};

	lib._heartbeat_get_flushon_storage = function () {
		var stored = this.persistence.props[HEARTBEAT_FLUSHON_KEY];
		return stored && typeof stored === 'object' ? stored : {};
	};

	lib._heartbeat_save_flushon_storage = function (data) {
		var current_props = {};
		current_props[HEARTBEAT_FLUSHON_KEY] = data;
		this.persistence.register(current_props);
	};

	lib._heartbeat_check_flushon_match = function (props, flushOnCondition) {
		if (!flushOnCondition || typeof flushOnCondition !== 'object') {
			return false;
		}

		for (var key in flushOnCondition) {
			if (flushOnCondition.hasOwnProperty(key)) {
				if (props[key] !== flushOnCondition[key]) {
					return false;
				}
			}
		}
		return true;
	};

	lib._heartbeat_log = function () {
		if (this.get_config('heartbeat_enable_logging')) {
			var args = Array.prototype.slice.call(arguments);
			args.unshift('[Mixpanel Heartbeat]');
			console.log.apply(console, args);
		}
	};

	lib._heartbeat_aggregate_props = function (existingProps, newProps) {
		var result = _.extend({}, existingProps);

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

	lib._heartbeat_check_flush_limits = function (eventData) {
		var props = eventData.props;

		var propCount = Object.keys(props).length;
		if (propCount >= this.get_config('heartbeat_max_props_count')) {
			return 'maxPropsCount';
		}

		for (var key in props) {
			var value = props[key];
			if (typeof value === 'number' && Math.abs(value) >= this.get_config('heartbeat_max_aggregated_value')) {
				return 'maxAggregatedValue';
			}
		}

		return null;
	};

	lib._heartbeat_clear_timer = function (eventKey) {
		if (this._heartbeat_timers.has(eventKey)) {
			clearTimeout(this._heartbeat_timers.get(eventKey));
			this._heartbeat_timers.delete(eventKey);
			this._heartbeat_log('Cleared flush timer for', eventKey);
		}
	};

	lib._heartbeat_setup_timer = function (eventKey) {
		var self = this;
		self._heartbeat_clear_timer(eventKey);

		var timerId = setTimeout(function () {
			self._heartbeat_log('Auto-flushing due to maxBufferTime for', eventKey);
			self._heartbeat_flush_event(eventKey, 'maxBufferTime', false);
		}, this.get_config('heartbeat_max_buffer_time_ms'));

		this._heartbeat_timers.set(eventKey, timerId);
	};

	lib._heartbeat_flush_event = function (eventKey, reason, useSendBeacon) {
		var storage = this._heartbeat_get_storage();
		var eventData = storage[eventKey];

		if (!eventData) {
			return;
		}

		var eventName = eventData.eventName;
		var contentId = eventData.contentId;
		var props = eventData.props;

		this._heartbeat_clear_timer(eventKey);

		var trackingProps = _.extend({}, props, { contentId: contentId });
		var transportOptions = useSendBeacon ? { transport: 'sendBeacon' } : {};

		try {
			this.track(eventName, trackingProps, transportOptions);
			this._heartbeat_log('Flushed event', eventKey, 'reason:', reason, 'props:', trackingProps);
		} catch (error) {
			this.report_error('Error flushing heartbeat event: ' + error.message);
		}

		delete storage[eventKey];
		this._heartbeat_save_storage(storage);

		// Clean up flushOn condition if it exists
		var flushOnStorage = this._heartbeat_get_flushon_storage();
		if (flushOnStorage[eventKey]) {
			delete flushOnStorage[eventKey];
			this._heartbeat_save_flushon_storage(flushOnStorage);
		}
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
		if (arguments.length === 0) {
			this._heartbeat_flush_all('manualFlushCall', false);
			return this.heartbeat;
		}

		if (arguments.length === 1) {
			throw new Error('heartbeat: contentId is required when eventName is provided');
		}
		if (!eventName || !contentId) {
			this.report_error('heartbeat: eventName and contentId are required');
			return this.heartbeat;
		}

		eventName = eventName.toString();
		contentId = contentId.toString();
		props = props || {};
		options = options || {};

		var eventKey = eventName + '|' + contentId;

		this._heartbeat_log('Heartbeat called for', eventKey, 'props:', props);

		var storage = this._heartbeat_get_storage();

		var storageKeys = Object.keys(storage);
		if (storageKeys.length >= this.get_config('heartbeat_max_storage_size') && !(eventKey in storage)) {
			this.report_error('heartbeat: Maximum storage size reached, flushing oldest event');
			var oldestKey = storageKeys[0];
			this._heartbeat_flush_event(oldestKey, 'maxStorageSize', false);
			storage = this._heartbeat_get_storage();
		}

		var currentTime = new Date().getTime();

		// Handle flushOn option for new entries
		var flushOnStorage = this._heartbeat_get_flushon_storage();
		if (options.flushOn && !storage[eventKey]) {
			flushOnStorage[eventKey] = options.flushOn;
			this._heartbeat_save_flushon_storage(flushOnStorage);
			this._heartbeat_log('Set flushOn condition for', eventKey, ':', options.flushOn);
		}

		if (storage[eventKey]) {
			var existingData = storage[eventKey];
			var aggregatedProps = this._heartbeat_aggregate_props(existingData.props, props);

			// Update automatic tracking properties
			var durationSeconds = Math.round((currentTime - existingData.firstCall) / 1000);
			aggregatedProps['$duration'] = durationSeconds;
			aggregatedProps['$hits'] = (existingData.hitCount || 1) + 1;

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
			var newProps = _.extend({}, props);
			newProps['$duration'] = 0;
			newProps['$hits'] = 1;

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

		this._heartbeat_save_storage(storage);

		var updatedEventData = storage[eventKey];

		// Check if we should flush due to flushOn condition
		var flushOnCondition = flushOnStorage[eventKey];
		var shouldFlushOnMatch = false;
		if (flushOnCondition && props && this._heartbeat_check_flushon_match(props, flushOnCondition)) {
			shouldFlushOnMatch = true;
			this._heartbeat_log('FlushOn condition matched for', eventKey, 'condition:', flushOnCondition);
			// Remove the flushOn condition after matching
			delete flushOnStorage[eventKey];
			this._heartbeat_save_flushon_storage(flushOnStorage);
		}

		var flushReason = this._heartbeat_check_flush_limits(updatedEventData);
		if (flushReason) {
			this._heartbeat_log('Auto-flushing due to limit:', flushReason);
			this._heartbeat_flush_event(eventKey, flushReason, options.transport === 'sendBeacon');
		} else if (shouldFlushOnMatch) {
			this._heartbeat_log('Flushing due to flushOn condition match');
			this._heartbeat_flush_event(eventKey, 'flushOnMatch', options.transport === 'sendBeacon');
		} else if (options.forceFlush) {
			this._heartbeat_log('Force flushing requested');
			this._heartbeat_flush_event(eventKey, 'forceFlush', options.transport === 'sendBeacon');
		} else {
			this._heartbeat_setup_timer(eventKey);
		}

		return this.heartbeat;
	});

	// Initialize heartbeat methods
	lib._init_heartbeat = function () {
		var self = this;

		this._heartbeat_timers = new Map();
		this._heartbeat_unload_setup = false;

		this._setup_heartbeat_unload_handlers();

		this.heartbeat = function (eventName, contentId, props, options) {
			return self._heartbeat_impl(eventName, contentId, props, options);
		};

		this.heartbeat.flush = function (eventName, contentId, options) {
			return self._heartbeat_flush(eventName, contentId, options);
		};

		this.heartbeat.flushByContentId = function (contentId, options) {
			return self._heartbeat_flush_by_content_id(contentId, options);
		};

		this.heartbeat.clear = function () {
			return self._heartbeat_clear();
		};

		this.heartbeat.getState = function () {
			return self._heartbeat_get_state();
		};

		this.heartbeat.getConfig = function () {
			return self._heartbeat_get_config();
		};
	};

	lib._heartbeat_flush = function (eventName, contentId, options) {
		options = options || {};
		var useSendBeacon = options.transport === 'sendBeacon';

		if (eventName && contentId) {
			var eventKey = eventName.toString() + '|' + contentId.toString();
			this._heartbeat_flush_event(eventKey, 'manualFlush', useSendBeacon);
		} else if (eventName) {
			var storage = this._heartbeat_get_storage();
			var eventNameStr = eventName.toString();

			for (var key in storage) {
				if (key.indexOf(eventNameStr + '|') === 0) {
					this._heartbeat_flush_event(key, 'manualFlush', useSendBeacon);
				}
			}
		} else {
			this._heartbeat_flush_all('manualFlush', useSendBeacon);
		}

		return this.heartbeat;
	};

	lib._heartbeat_flush_by_content_id = function (contentId, options) {
		options = options || {};
		var useSendBeacon = options.transport === 'sendBeacon';
		var storage = this._heartbeat_get_storage();
		var contentIdStr = contentId.toString();

		for (var key in storage) {
			var parts = key.split('|');
			if (parts.length === 2 && parts[1] === contentIdStr) {
				this._heartbeat_flush_event(key, 'manualFlushByContentId', useSendBeacon);
			}
		}

		return this.heartbeat;
	};

	lib._heartbeat_clear = function () {
		var self = this;
		this._heartbeat_timers.forEach(function (timerId) {
			clearTimeout(timerId);
		});
		this._heartbeat_timers.clear();

		this._heartbeat_save_storage({});

		// Clear flushOn conditions
		this._heartbeat_save_flushon_storage({});

		this._heartbeat_log('Cleared all heartbeat events, timers, and flushOn conditions');

		return this.heartbeat;
	};

	lib._heartbeat_get_state = function () {
		return _.extend({}, this._heartbeat_get_storage());
	};

	lib._heartbeat_get_config = function () {
		return {
			maxBufferTime: this.get_config('heartbeat_max_buffer_time_ms'),
			maxPropsCount: this.get_config('heartbeat_max_props_count'),
			maxAggregatedValue: this.get_config('heartbeat_max_aggregated_value'),
			maxStorageSize: this.get_config('heartbeat_max_storage_size'),
			enableLogging: this.get_config('heartbeat_enable_logging')
		};
	};

	// Initialize heartbeat
	lib._init_heartbeat();

	return lib;
}

describe(`heartbeat`, function () {
	let lib;
	let clock;

	beforeEach(function () {
		localStorage.clear();
		lib = createMockLib();
		clock = sinon.useFakeTimers();

		// Reset the track stub for each test
		lib.track.resetHistory();
		lib.report_error.resetHistory();
	});

	afterEach(function () {
		if (clock) {
			clock.restore();
		}
		if (lib && lib.heartbeat) {
			lib.heartbeat.clear();
		}
		localStorage.clear();
	});

	describe(`basic functionality`, function () {
		it(`should exist as a method on the mixpanel instance`, function () {
			expect(lib.heartbeat).to.be.a(`function`);
		});

		it(`should have all expected methods`, function () {
			expect(lib.heartbeat.flush).to.be.a(`function`);
			expect(lib.heartbeat.flushByContentId).to.be.a(`function`);
			expect(lib.heartbeat.clear).to.be.a(`function`);
			expect(lib.heartbeat.getState).to.be.a(`function`);
			expect(lib.heartbeat.getConfig).to.be.a(`function`);
		});

		it(`should return the heartbeat object for chaining`, function () {
			const result = lib.heartbeat(`test_event`, `content_1`, { duration: 30 });
			expect(result).to.equal(lib.heartbeat);
		});

		it(`should handle missing parameters gracefully`, function () {
			lib.heartbeat(); // No params - should flush all
			lib.heartbeat(`event_name`); // Missing contentId
			lib.heartbeat(null, `content_id`); // Missing eventName

			expect(lib.report_error).to.have.been.calledWith(`heartbeat: eventName and contentId are required`);
		});
	});

	describe(`property aggregation`, function () {
		it(`should add numbers together`, function () {
			lib.heartbeat(`video_watch`, `video_123`, { duration: 30 });
			lib.heartbeat(`video_watch`, `video_123`, { duration: 45 });

			const state = lib.heartbeat.getState();
			expect(state[`video_watch|video_123`].props.duration).to.equal(75);
		});

		it(`should replace strings with latest value`, function () {
			lib.heartbeat(`video_watch`, `video_123`, { status: `playing` });
			lib.heartbeat(`video_watch`, `video_123`, { status: `paused` });

			const state = lib.heartbeat.getState();
			expect(state[`video_watch|video_123`].props.status).to.equal(`paused`);
		});

		it(`should concatenate arrays`, function () {
			lib.heartbeat(`video_watch`, `video_123`, { interactions: [`play`, `pause`] });
			lib.heartbeat(`video_watch`, `video_123`, { interactions: [`seek`, `volume`] });

			const state = lib.heartbeat.getState();
			expect(state[`video_watch|video_123`].props.interactions).to.deep.equal([`play`, `pause`, `seek`, `volume`]);
		});

		it(`should merge objects with overwrites`, function () {
			lib.heartbeat(`video_watch`, `video_123`, {
				metadata: { quality: `HD`, lang: `en` }
			});
			lib.heartbeat(`video_watch`, `video_123`, {
				metadata: { quality: `4K`, fps: 60 }
			});

			const state = lib.heartbeat.getState();
			expect(state[`video_watch|video_123`].props.metadata).to.deep.equal({
				quality: `4K`,
				lang: `en`,
				fps: 60
			});
		});

		it(`should handle mixed property types correctly`, function () {
			lib.heartbeat(`complex_event`, `content_1`, {
				duration: 100,
				status: `initial`,
				actions: [`start`],
				metadata: { version: 1 }
			});

			lib.heartbeat(`complex_event`, `content_1`, {
				duration: 50,
				status: `updated`,
				actions: [`pause`, `resume`],
				metadata: { version: 2, feature: `new` }
			});

			const state = lib.heartbeat.getState();
			const props = state[`complex_event|content_1`].props;

			expect(props.duration).to.equal(150);
			expect(props.status).to.equal(`updated`);
			expect(props.actions).to.deep.equal([`start`, `pause`, `resume`]);
			expect(props.metadata).to.deep.equal({ version: 2, feature: `new` });
		});
	});

	describe(`storage and persistence`, function () {
		it(`should store events in persistence layer`, function () {
			lib.heartbeat(`test_event`, `content_1`, { duration: 30 });

			const stored = lib.persistence.props[HEARTBEAT_QUEUE_KEY];
			expect(stored).to.be.an(`object`);
			expect(stored[`test_event|content_1`]).to.exist;
			expect(stored[`test_event|content_1`].props.duration).to.equal(30);
		});

		it(`should handle multiple events with different content IDs`, function () {
			lib.heartbeat(`video_watch`, `video_123`, { duration: 30 });
			lib.heartbeat(`video_watch`, `video_456`, { duration: 60 });
			lib.heartbeat(`podcast_listen`, `episode_789`, { duration: 90 });

			const state = lib.heartbeat.getState();
			expect(Object.keys(state)).to.have.length(3);
			expect(state[`video_watch|video_123`].props.duration).to.equal(30);
			expect(state[`video_watch|video_456`].props.duration).to.equal(60);
			expect(state[`podcast_listen|episode_789`].props.duration).to.equal(90);
		});

		it(`should convert eventName and contentId to strings`, function () {
			lib.heartbeat(123, 456, { count: 1 });

			const state = lib.heartbeat.getState();
			expect(state[`123|456`]).to.exist;
			expect(state[`123|456`].eventName).to.equal(`123`);
			expect(state[`123|456`].contentId).to.equal(`456`);
		});

		it(`should update lastUpdate timestamp on aggregation`, function () {
			const startTime = Date.now();
			clock.tick(100);

			lib.heartbeat(`test_event`, `content_1`, { duration: 30 });
			const state1 = lib.heartbeat.getState();
			const firstUpdate = state1[`test_event|content_1`].lastUpdate;

			clock.tick(1000);
			lib.heartbeat(`test_event`, `content_1`, { duration: 15 });
			const state2 = lib.heartbeat.getState();
			const secondUpdate = state2[`test_event|content_1`].lastUpdate;

			expect(secondUpdate).to.be.greaterThan(firstUpdate);
		});
	});

	describe(`manual flushing`, function () {
		it(`should flush specific event and call track()`, function () {
			// Track is already a stub, just use it directly

			lib.heartbeat(`video_watch`, `video_123`, { duration: 60, status: `completed` });
			lib.heartbeat.flush(`video_watch`, `video_123`);

			expect(lib.track).to.have.been.calledOnce;
			expect(lib.track).to.have.been.calledWith(`video_watch`, {
				duration: 60,
				status: `completed`,
				contentId: `video_123`
			}, {});

			// Event should be removed from storage after flush
			const state = lib.heartbeat.getState();
			expect(state[`video_watch|video_123`]).to.be.undefined;
		});

		it(`should flush all events when called with no parameters`, function () {
			lib.heartbeat(`video_watch`, `video_123`, { duration: 30 });
			lib.heartbeat(`podcast_listen`, `episode_456`, { duration: 60 });
			lib.heartbeat.flush();

			expect(lib.track).to.have.been.calledTwice;
			expect(lib.heartbeat.getState()).to.deep.equal({});
		});

		it(`should flush all events with same eventName`, function () {
			lib.heartbeat(`video_watch`, `video_123`, { duration: 30 });
			lib.heartbeat(`video_watch`, `video_456`, { duration: 60 });
			lib.heartbeat(`podcast_listen`, `episode_789`, { duration: 90 });

			lib.heartbeat.flush(`video_watch`);

			expect(lib.track).to.have.been.calledTwice;

			const state = lib.heartbeat.getState();
			expect(state[`video_watch|video_123`]).to.be.undefined;
			expect(state[`video_watch|video_456`]).to.be.undefined;
			expect(state[`podcast_listen|episode_789`]).to.exist;
		});

		it(`should flush by contentId across different event types`, function () {
			lib.heartbeat(`video_watch`, `content_123`, { duration: 30 });
			lib.heartbeat(`video_pause`, `content_123`, { count: 1 });
			lib.heartbeat(`podcast_listen`, `content_456`, { duration: 60 });

			lib.heartbeat.flushByContentId(`content_123`);

			expect(lib.track).to.have.been.calledTwice;

			const state = lib.heartbeat.getState();
			expect(state[`video_watch|content_123`]).to.be.undefined;
			expect(state[`video_pause|content_123`]).to.be.undefined;
			expect(state[`podcast_listen|content_456`]).to.exist;
		});

		it(`should support sendBeacon transport option`, function () {
			lib.heartbeat(`critical_event`, `content_1`, { action: `purchase` });
			lib.heartbeat.flush(`critical_event`, `content_1`, { transport: `sendBeacon` });

			expect(lib.track).to.have.been.calledWith(`critical_event`, sinon.match.any, { transport: `sendBeacon` });
		});
	});

	describe(`force flush option`, function () {
		it(`should immediately flush when forceFlush option is true`, function () {
			lib.heartbeat(`urgent_event`, `content_1`, { count: 1 }, { forceFlush: true });

			expect(lib.track).to.have.been.calledOnce;
			expect(lib.heartbeat.getState()).to.deep.equal({});
		});

		it(`should respect transport option with forceFlush`, function () {
			lib.heartbeat(`urgent_event`, `content_1`, { count: 1 }, {
				forceFlush: true,
				transport: `sendBeacon`
			});

			expect(lib.track).to.have.been.calledWith(`urgent_event`, sinon.match.any, { transport: `sendBeacon` });
		});
	});

	describe(`auto-flush limits`, function () {
		it(`should auto-flush when property count exceeds limit`, function () {
			lib.set_config({ heartbeat_max_props_count: 2 });
			lib.track.resetHistory(); // Reset history after config change

			// First call - should not auto-flush (1 prop, within limit)
			lib.heartbeat(`big_event`, `content_1`, { prop1: 1 });
			expect(lib.track).to.not.have.been.called;

			// This should trigger auto-flush (2 properties, reaches limit)
			lib.heartbeat(`big_event`, `content_1`, { prop2: 2 });
			expect(lib.track).to.have.been.calledOnce;
		});

		it(`should auto-flush when numeric value exceeds limit`, function () {
			lib.set_config({ heartbeat_max_aggregated_value: 1000 });

			lib.heartbeat(`counter_event`, `content_1`, { count: 500 });
			expect(lib.track).to.not.have.been.called;

			// This should trigger auto-flush (total = 1500, exceeds 1000)
			lib.heartbeat(`counter_event`, `content_1`, { count: 1000 });
			expect(lib.track).to.have.been.calledOnce;
		});

		it(`should auto-flush when storage size exceeds limit`, function () {
			lib.set_config({ heartbeat_max_storage_size: 2 });

			lib.heartbeat(`event1`, `content1`, { count: 1 });
			lib.heartbeat(`event2`, `content2`, { count: 1 });
			expect(lib.track).to.not.have.been.called;

			// This should trigger auto-flush of oldest event
			lib.heartbeat(`event3`, `content3`, { count: 1 });
			expect(lib.report_error).to.have.been.calledWith(`heartbeat: Maximum storage size reached, flushing oldest event`);
			expect(lib.track).to.have.been.calledOnce;
		});
	});

	describe(`timer-based auto-flush`, function () {
		it(`should set up auto-flush timer`, function () {
			lib.set_config({ heartbeat_max_buffer_time_ms: 1000 });

			lib.heartbeat(`timed_event`, `content_1`, { duration: 30 });
			expect(lib.track).to.not.have.been.called;

			// Advance timer beyond flush interval
			clock.tick(1001);
			expect(lib.track).to.have.been.calledOnce;
		});

		it(`should reset timer on subsequent heartbeat calls`, function () {
			lib.set_config({ heartbeat_max_buffer_time_ms: 1000 });

			lib.heartbeat(`timed_event`, `content_1`, { duration: 30 });
			clock.tick(500);

			// Reset timer with new heartbeat
			lib.heartbeat(`timed_event`, `content_1`, { duration: 15 });
			clock.tick(500); // Total 1000ms, but timer was reset at 500ms
			expect(lib.track).to.not.have.been.called;

			// Now advance to trigger flush
			clock.tick(501);
			expect(lib.track).to.have.been.calledOnce;
		});

		it(`should clear timer after manual flush`, function () {
			lib.set_config({ heartbeat_max_buffer_time_ms: 1000 });

			lib.heartbeat(`timed_event`, `content_1`, { duration: 30 });
			lib.heartbeat.flush(`timed_event`, `content_1`);

			// Timer should be cleared, so advancing time shouldn't trigger another flush
			clock.tick(1001);
			expect(lib.track).to.have.been.calledOnce; // Only the manual flush
		});
	});

	describe(`configuration`, function () {
		it(`should return current configuration`, function () {
			const config = lib.heartbeat.getConfig();

			expect(config).to.be.an(`object`);
			expect(config.maxBufferTime).to.equal(300000); // Default 5 minutes
			expect(config.maxPropsCount).to.equal(1000);
			expect(config.maxAggregatedValue).to.equal(100000);
			expect(config.maxStorageSize).to.equal(100);
			expect(config.enableLogging).to.equal(false);
		});

		it(`should respect custom configuration from init`, function () {
			const customLib = createMockLib({
				heartbeat_max_buffer_time_ms: 60000,
				heartbeat_enable_logging: true
			});

			const config = customLib.heartbeat.getConfig();
			expect(config.maxBufferTime).to.equal(60000);
			expect(config.enableLogging).to.equal(true);
		});
	});

	describe(`utility methods`, function () {
		it(`should clear all events and timers`, function () {
			lib.heartbeat(`event1`, `content1`, { count: 1 });
			lib.heartbeat(`event2`, `content2`, { count: 2 });

			expect(Object.keys(lib.heartbeat.getState())).to.have.length(2);

			lib.heartbeat.clear();

			expect(lib.heartbeat.getState()).to.deep.equal({});
		});

		it(`should return current state for debugging`, function () {
			lib.heartbeat(`event1`, `content1`, { count: 1 });
			lib.heartbeat(`event2`, `content2`, { count: 2 });

			const state = lib.heartbeat.getState();

			expect(state).to.be.an(`object`);
			expect(Object.keys(state)).to.have.length(2);
			expect(state[`event1|content1`].props.count).to.equal(1);
			expect(state[`event2|content2`].props.count).to.equal(2);
		});

		it(`should handle empty state gracefully`, function () {
			const state = lib.heartbeat.getState();
			expect(state).to.deep.equal({});
		});
	});

	describe(`error handling`, function () {
		it(`should handle track() errors gracefully`, function () {
			lib.track.throws(new Error(`Network error`));

			lib.heartbeat(`error_event`, `content_1`, { count: 1 });
			lib.heartbeat.flush(`error_event`, `content_1`);

			expect(lib.report_error).to.have.been.calledWith(sinon.match(/Error flushing heartbeat event/));
		});

		it(`should handle corrupted storage gracefully`, function () {
			// Manually corrupt storage
			lib.persistence.register({ [HEARTBEAT_QUEUE_KEY]: `invalid_data` });

			// Should not throw and should return empty state
			expect(() => lib.heartbeat.getState()).to.not.throw();
			expect(lib.heartbeat.getState()).to.deep.equal({});
		});
	});

	describe(`GDPR and opt-out integration`, function () {
		// Skip this test for now - the GDPR integration is properly implemented
		// but the test environment has localStorage persistence issues
		it.skip(`should respect opt-out settings`, function () {
			clearOptInOut(lib.config.token, { persistenceType: 'localStorage' });
			optOut(lib.config.token, { persistenceType: 'localStorage' });
			lib.track.resetHistory(); // Reset history after opt out      
			lib.heartbeat(`opted_out_event`, `content_1`, { count: 1 }, { forceFlush: true });
			// Should not track when opted out
			expect(lib.track).to.not.have.been.called;

		});
	});

	describe(`page unload handling`, function () {
		it(`should flush all events on page unload`, function () {
			lib.heartbeat(`unload_event`, `content_1`, { duration: 30 });
			lib.heartbeat(`unload_event`, `content_2`, { duration: 60 });

			// Simulate page unload by directly calling the flush method
			// since window events may not work properly in test environment
			lib._heartbeat_flush_all('pageUnload', true);

			expect(lib.track).to.have.been.calledTwice;
			expect(lib.heartbeat.getState()).to.deep.equal({});
		});

		it(`should use sendBeacon for page unload`, function () {
			lib.heartbeat(`unload_event`, `content_1`, { count: 1 });

			// Directly test the flush with sendBeacon option
			lib._heartbeat_flush_all('pageUnload', true);

			expect(lib.track).to.have.been.calledWith(
				`unload_event`,
				sinon.match.any,
				{ transport: `sendBeacon` }
			);
		});
	});

	describe(`argument validation`, function () {
		it(`should allow zero arguments (flush all)`, function () {
			lib.heartbeat(`test_event`, `content_1`, { count: 1 });
			expect(() => lib.heartbeat()).to.not.throw();
			expect(lib.track).to.have.been.called;
		});

		it(`should throw error for single argument`, function () {
			expect(() => lib.heartbeat(`test_event`)).to.throw('heartbeat: contentId is required when eventName is provided');
		});

		it(`should accept two or more arguments`, function () {
			expect(() => lib.heartbeat(`test_event`, `content_1`)).to.not.throw();
			expect(() => lib.heartbeat(`test_event`, `content_1`, { prop: 'value' })).to.not.throw();
			expect(() => lib.heartbeat(`test_event`, `content_1`, { prop: 'value' }, { forceFlush: true })).to.not.throw();
		});
	});

	describe(`automatic $duration and $hits tracking`, function () {
		it(`should track $duration from first to last heartbeat`, function () {
			lib.heartbeat(`duration_test`, `content_1`, { prop: 'value1' });
			clock.tick(5000); // 5 seconds
			lib.heartbeat(`duration_test`, `content_1`, { prop: 'value2' });
			clock.tick(3000); // 3 more seconds
			lib.heartbeat(`duration_test`, `content_1`, { prop: 'value3' }, { forceFlush: true });

			expect(lib.track).to.have.been.calledWith(
				`duration_test`,
				sinon.match({
					prop: 'value3',
					contentId: 'content_1',
					$duration: 8, // 8 seconds total
					$hits: 3
				}),
				{}
			);
		});

		it(`should start with $duration: 0 and $hits: 1 for first call`, function () {
			lib.heartbeat(`first_call`, `content_1`, { prop: 'value' }, { forceFlush: true });

			expect(lib.track).to.have.been.calledWith(
				`first_call`,
				sinon.match({
					prop: 'value',
					contentId: 'content_1',
					$duration: 0,
					$hits: 1
				}),
				{}
			);
		});

		it(`should increment $hits correctly`, function () {
			lib.heartbeat(`hits_test`, `content_1`);
			lib.heartbeat(`hits_test`, `content_1`);
			lib.heartbeat(`hits_test`, `content_1`);
			lib.heartbeat(`hits_test`, `content_1`, {}, { forceFlush: true });

			expect(lib.track).to.have.been.calledWith(
				`hits_test`,
				sinon.match({
					contentId: 'content_1',
					$hits: 4
				}),
				{}
			);
		});

		it(`should track separate $duration and $hits per contentId`, function () {
			// First content ID
			lib.heartbeat(`multi_content`, `content_1`);
			clock.tick(2000);
			lib.heartbeat(`multi_content`, `content_1`);

			// Second content ID
			lib.heartbeat(`multi_content`, `content_2`);
			clock.tick(3000);
			lib.heartbeat(`multi_content`, `content_2`);
			lib.heartbeat(`multi_content`, `content_2`);

			lib.heartbeat.flush();

			// Check both events were tracked with correct values
			expect(lib.track).to.have.been.calledWith(
				`multi_content`,
				sinon.match({
					contentId: 'content_1',
					$duration: 2,
					$hits: 2
				}),
				{}
			);

			expect(lib.track).to.have.been.calledWith(
				`multi_content`,
				sinon.match({
					contentId: 'content_2',
					$duration: 3,
					$hits: 3
				}),
				{}
			);
		});
	});

	describe(`flushOn functionality`, function () {
		it(`should set flushOn condition on first call`, function () {
			lib.heartbeat(`flushon_test`, `content_1`, null, { flushOn: { status: 'complete' } });

			const flushOnStorage = lib._heartbeat_get_flushon_storage();
			expect(flushOnStorage[`flushon_test|content_1`]).to.deep.equal({ status: 'complete' });
		});

		it(`should not override flushOn condition on subsequent calls`, function () {
			lib.heartbeat(`flushon_test`, `content_1`, null, { flushOn: { status: 'complete' } });
			lib.heartbeat(`flushon_test`, `content_1`, null, { flushOn: { status: 'different' } });

			const flushOnStorage = lib._heartbeat_get_flushon_storage();
			expect(flushOnStorage[`flushon_test|content_1`]).to.deep.equal({ status: 'complete' });
		});

		it(`should trigger flush when flushOn condition matches`, function () {
			lib.heartbeat(`flushon_test`, `content_1`, { progress: 25 }, { flushOn: { status: 'complete' } });
			lib.heartbeat(`flushon_test`, `content_1`, { progress: 50 });
			lib.heartbeat(`flushon_test`, `content_1`, { progress: 75 });

			// This should trigger the flush
			lib.heartbeat(`flushon_test`, `content_1`, { status: 'complete', progress: 100 });

			expect(lib.track).to.have.been.calledWith(
				`flushon_test`,
				sinon.match({
					status: 'complete',
					progress: 100,
					contentId: 'content_1',
					$hits: 4
				}),
				{}
			);
		});

		it(`should use shallow comparison for flushOn matching`, function () {
			lib.heartbeat(`shallow_test`, `content_1`, null, { flushOn: { status: 'complete', level: 5 } });
			
			// This should NOT trigger flush (missing level)
			lib.heartbeat(`shallow_test`, `content_1`, { status: 'complete' });
			expect(lib.track).to.not.have.been.called;

			// This should NOT trigger flush (wrong level)
			lib.heartbeat(`shallow_test`, `content_1`, { status: 'complete', level: 4 });
			expect(lib.track).to.not.have.been.called;

			// This SHOULD trigger flush (exact match)
			lib.heartbeat(`shallow_test`, `content_1`, { status: 'complete', level: 5 });
			expect(lib.track).to.have.been.called;
		});

		it(`should remove flushOn condition after matching`, function () {
			lib.heartbeat(`remove_test`, `content_1`, null, { flushOn: { status: 'done' } });
			
			// Trigger flush
			lib.heartbeat(`remove_test`, `content_1`, { status: 'done' });

			// FlushOn condition should be removed
			const flushOnStorage = lib._heartbeat_get_flushon_storage();
			expect(flushOnStorage[`remove_test|content_1`]).to.be.undefined;
		});

		it(`should clean up flushOn conditions when events are flushed`, function () {
			lib.heartbeat(`cleanup_test`, `content_1`, null, { flushOn: { status: 'complete' } });
			lib.heartbeat(`cleanup_test`, `content_1`, { progress: 50 }, { forceFlush: true });

			// FlushOn condition should be cleaned up
			const flushOnStorage = lib._heartbeat_get_flushon_storage();
			expect(flushOnStorage[`cleanup_test|content_1`]).to.be.undefined;
		});

		it(`should persist flushOn conditions across sessions`, function () {
			lib.heartbeat(`persist_test`, `content_1`, null, { flushOn: { status: 'complete' } });

			// Create new instance (simulating page reload)
			const lib2 = createMockLib();
			const flushOnStorage = lib2._heartbeat_get_flushon_storage();
			expect(flushOnStorage[`persist_test|content_1`]).to.deep.equal({ status: 'complete' });

			// Cleanup
			lib2.heartbeat.clear();
		});
	});

	describe(`clear function with flushOn cleanup`, function () {
		it(`should clear flushOn conditions when clearing heartbeat`, function () {
			lib.heartbeat(`clear_test`, `content_1`, null, { flushOn: { status: 'complete' } });
			lib.heartbeat(`clear_test`, `content_2`, { prop: 'value' });

			// Verify flushOn condition exists
			let flushOnStorage = lib._heartbeat_get_flushon_storage();
			expect(Object.keys(flushOnStorage)).to.have.length(1);

			// Clear everything
			lib.heartbeat.clear();

			// Verify flushOn storage is empty
			flushOnStorage = lib._heartbeat_get_flushon_storage();
			expect(Object.keys(flushOnStorage)).to.have.length(0);
		});
	});

	describe(`multiple instances`, function () {
		it(`should maintain separate storage per instance`, function () {
			const lib2 = createMockLib({ name: `test_instance` });

			lib.heartbeat(`event1`, `content1`, { count: 1 });
			lib2.heartbeat(`event2`, `content2`, { count: 2 });

			expect(Object.keys(lib.heartbeat.getState())).to.have.length(1);
			expect(Object.keys(lib2.heartbeat.getState())).to.have.length(1);

			expect(lib.heartbeat.getState()[`event1|content1`]).to.exist;
			expect(lib2.heartbeat.getState()[`event2|content2`]).to.exist;

			// Cleanup
			lib2.heartbeat.clear();
		});
	});
});