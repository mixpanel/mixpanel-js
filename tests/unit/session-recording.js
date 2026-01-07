/*
 * Unit tests for the SessionRecording module, excluding the rrweb dependency.
 */

import { expect } from 'chai';
import { SessionRecording } from '../../src/recorder/session-recording';
import { IncrementalSource, EventType } from '@mixpanel/rrweb-types';

import sinon from 'sinon';
import { window } from '../../src/window';
import localStorage from 'localStorage';
import { setupFakeIDB, idbGetItem, idbSetItem, idbCreateDatabase } from './test-utils/indexed-db';
import { MockMixpanelLib } from './test-utils/mock-mixpanel-lib';
import { setupRrwebMock } from './test-utils/mock-rrweb';
import { RECORD_ENQUEUE_THROTTLE_MS } from '../../src/recorder/utils';
import { _ } from '../../src/utils';

describe(`SessionRecording`, function() {
  let replayId,
    onIdleTimeoutSpy,
    onMaxLengthReachedSpy,
    sessionRecording,
    flushSpy,
    mockRrweb,
    fetchStub,
    clock,
    batcherKey,
    mockMixpanelInstance;

  const NOW_MS = 1737999877508;

  setupFakeIDB();

  beforeEach(function() {
    localStorage.clear();
    clock = sinon.useFakeTimers({now: NOW_MS, toFake: [`Date`, `setTimeout`, `clearTimeout`, `setInterval`, `clearInterval`]});

    mockMixpanelInstance = new MockMixpanelLib();
    replayId = `test-replay-id`;
    batcherKey = `__mprec_mp_test_test-token_${replayId}`;

    onIdleTimeoutSpy = sinon.spy();
    onMaxLengthReachedSpy = sinon.spy();

    mockRrweb = setupRrwebMock();

    sessionRecording = new SessionRecording({
      mixpanelInstance: mockMixpanelInstance,
      replayId: replayId,
      onIdleTimeout: onIdleTimeoutSpy,
      onMaxLengthReached: onMaxLengthReachedSpy,
      rrwebRecord: mockRrweb.recordStub,
      sharedLockStorage: localStorage,
    });
    flushSpy = sinon.spy(sessionRecording.batcher, `flush`);

    fetchStub = sinon.stub().returns(Promise.resolve(new Response(JSON.stringify({code: 200, status: `OK`}))));
    window.fetch = fetchStub;
  });

  afterEach(async function () {
    sessionRecording.stopRecording();
    clock.restore();
    delete window.fetch;
    sinon.restore();
  });

  it(`can start and stop recording`, async function() {
    sessionRecording.startRecording();
    expect(mockRrweb.recordStub.calledOnce).to.be.true;
    expect(sessionRecording.isRrwebStopped()).to.be.false;

    sessionRecording.stopRecording();
    expect(mockRrweb.stopSpy.calledOnce).to.be.true;
    expect(sessionRecording.isRrwebStopped()).to.be.true;
  });

  it(`flushes the batcher when stopRecording is called`, function() {
    sessionRecording.startRecording();
    expect(flushSpy.calledOnce).to.be.true;

    sessionRecording.stopRecording();
    expect(flushSpy.calledTwice).to.be.true;
  });

  it(`still flushes the batcher when stopRecording throws an error`, function() {
    mockRrweb.recordStub.returns(function () {
      throw new Error(`test error`);
    });

    sessionRecording.startRecording();
    expect(flushSpy.calledOnce).to.be.true;

    sessionRecording.stopRecording();
    expect(flushSpy.calledTwice).to.be.true;
  });

  it(`does not start batcher and timeouts when rrweb silently fails (returns undefined)`, function() {
    mockRrweb.recordStub.returns(undefined);
    sessionRecording.startRecording();

    expect(flushSpy.calledOnce).to.be.false;
    expect(sessionRecording.batcher.stopped).to.be.true;
    expect(sessionRecording.maxTimeoutId).to.be.null;
  });

  it(`queues rrweb events and flushes them after 10 seconds`, async function() {
    sessionRecording.startRecording();

    mockRrweb.emit(EventType.Meta);
    mockRrweb.emit(EventType.FullSnapshot);
    clock.tick(RECORD_ENQUEUE_THROTTLE_MS); // tick for 10ms throttle
    await sessionRecording.__enqueuePromise;

    mockRrweb.emit(EventType.IncrementalSnapshot, IncrementalSource.MouseInteraction);
    clock.tick(RECORD_ENQUEUE_THROTTLE_MS / 2);
    mockRrweb.emit(EventType.IncrementalSnapshot, IncrementalSource.MouseMove);
    clock.tick(RECORD_ENQUEUE_THROTTLE_MS / 2);
    await sessionRecording.__enqueuePromise;

    // this isn't really what we're testing, but we should make sure that the queue is persisted in indexeddb
    const queue = await idbGetItem(`mixpanelRecordingEvents`, batcherKey);
    expect(queue.length).to.equal(4, `queued rrweb events are persisted in indexeddb`);

    await clock.tickAsync(10 * 1000);
    expect(flushSpy.calledTwice).to.be.true;
    await sessionRecording.batcher._flushPromise;
    expect(fetchStub.calledOnce).to.be.true;

    const fetchCall = fetchStub.getCall(0);
    const calledURL = fetchCall.args[0];
    expect(calledURL.startsWith(`https://api.mixpanel.com/record`)).to.be.true;

    const paramsStr = calledURL.split(`?`)[1];
    const params = new URLSearchParams(paramsStr);
    expect(params.get(`replay_id`)).to.equal(replayId);
    expect(params.get(`distinct_id`)).to.equal(`test-distinct-id`);
    expect(params.get(`$device_id`)).to.equal(`test-device-id`);
    expect(params.get(`$user_id`)).to.equal(`test-user-id`);
    expect(params.get(`replay_start_time`)).to.equal((NOW_MS / 1000).toString());
    expect(params.get(`replay_length_ms`)).to.equal(`375`);

    const body = JSON.parse(fetchCall.args[1].body);
    expect(body).to.deep.equal([
      {type: EventType.Meta, timestamp: NOW_MS, data: {}},
      {type: EventType.FullSnapshot, timestamp: NOW_MS, data: {}},
      {type: EventType.IncrementalSnapshot, timestamp: NOW_MS + RECORD_ENQUEUE_THROTTLE_MS, data: {source: IncrementalSource.MouseInteraction}},
      {type: EventType.IncrementalSnapshot, timestamp: NOW_MS + 1.5 * RECORD_ENQUEUE_THROTTLE_MS, data: {source: IncrementalSource.MouseMove}},
    ]);

    const queueAfterFlush = await idbGetItem(`mixpanelRecordingEvents`, batcherKey);
    expect(queueAfterFlush.length).to.equal(0, `queue is emptied after successful request`);
  });

  it(`can serialize into a POJO and deserialize back`, function () {
    sessionRecording.startRecording();
    expect(sessionRecording.replayId).to.equal(replayId);
    expect(sessionRecording.replayStartTime).to.equal(NOW_MS);
    expect(sessionRecording.idleExpires).to.equal(NOW_MS + 30 * 60 * 1000);
    expect(sessionRecording.maxExpires).to.equal(NOW_MS + 24 * 60 * 60 * 1000);
    expect(sessionRecording.seqNo).to.equal(0);

    // simulate some rrweb events occurring
    sessionRecording.lastEventTimestamp = NOW_MS + 100;

    const serializedRecording = sessionRecording.serialize();

    expect(serializedRecording).to.deep.equal({
      replayId,
      seqNo: 0,
      replayStartTime: NOW_MS,
      batchStartUrl: undefined,
      replayStartUrl: undefined,
      lastEventTimestamp: NOW_MS + 100,
      idleExpires: NOW_MS + 30 * 60 * 1000,
      maxExpires: NOW_MS + 24 * 60 * 60 * 1000,
      tabId: `test-tab-id`,
    });

    // clock time should not affect deserialized times
    clock.tick(10 * 60 * 1000);

    const deserializedRecording = SessionRecording.deserialize(serializedRecording, {mixpanelInstance: mockMixpanelInstance});
    expect(deserializedRecording.replayId).to.equal(replayId);
    expect(deserializedRecording.replayStartTime).to.equal(NOW_MS);
    expect(deserializedRecording.lastEventTimestamp).to.equal(NOW_MS + 100);
    expect(deserializedRecording.idleExpires).to.equal(NOW_MS + 30 * 60 * 1000);
    expect(deserializedRecording.maxExpires).to.equal(NOW_MS + 24 * 60 * 60 * 1000);
    expect(deserializedRecording.seqNo).to.equal(0);
  });

  it(`deserialized recording still resets after reaching maxExpires`, function () {
    const serializedRecording = {
      replayId,
      seqNo: 0,
      replayStartTime: NOW_MS,
      batchStartUrl: undefined,
      replayStartUrl: undefined,
      idleExpires: NOW_MS + 30 * 60 * 1000,
      maxExpires: NOW_MS + 30 * 1000,
      tabId: `test-tab-id`,
    };

    // clock time should not affect deserialized times
    clock.tick(10 * 1000);

    var onMaxLengthReachedSpy = sinon.spy();

    const deserializedRecording = SessionRecording.deserialize(serializedRecording, {
      mixpanelInstance: mockMixpanelInstance,
      onMaxLengthReached: onMaxLengthReachedSpy,
      rrwebRecord: mockRrweb.recordStub
    });
    deserializedRecording.startRecording();

    clock.tick(10 * 1000);
    expect(onMaxLengthReachedSpy.calledOnce).to.be.false;
    clock.tick(11 * 1000);
    expect(onMaxLengthReachedSpy.calledOnce).to.be.true;
    deserializedRecording.stopRecording();
  });

  it(`can unload persisted rrweb data and clean up indexeddb`, async function() {
    await idbCreateDatabase(`mixpanelBrowserDb`, 1, [`mixpanelRecordingEvents`]);
    const startTime = 1737870254055;

    const recordingToUnload = SessionRecording.deserialize({
      replayId: `some-other-replay-id`,
      seqNo: 5,
      replayStartTime: startTime,
      batchStartUrl: `https://foobar.com/login`,
      replayStartUrl: `https://foobar.com/`,
      idleExpires: startTime + 30 * 60 * 1000,
      maxExpires: startTime + 24 * 60 * 60 * 1000,
      tabId: `test-some-other-tab-id`,
    }, {mixpanelInstance: mockMixpanelInstance, sharedLockStorage: localStorage});

    const persistedEvents = [
      {type: EventType.IncrementalSnapshot, timestamp: startTime + 10, data: {source: IncrementalSource.MouseInteraction}},
      {type: EventType.IncrementalSnapshot, timestamp: startTime + 15, data: {source: IncrementalSource.MouseMove}},
      {type: EventType.IncrementalSnapshot, timestamp: startTime + 50, data: {source: IncrementalSource.Mutation}},
      {type: EventType.IncrementalSnapshot, timestamp: startTime + 60000, data: {source: IncrementalSource.Mutation}},
    ];
    await idbSetItem(`mixpanelRecordingEvents`, `__mprec_mp_test_test-token_some-other-replay-id`, persistedEvents.map((ev, idx) => ({
      id: idx,
      payload: ev,
      flushAfter: startTime,
    })));

    await recordingToUnload.unloadPersistedData();
    expect(fetchStub.calledOnce).to.be.true;

    const fetchCall = fetchStub.getCall(0);
    const calledURL = fetchCall.args[0];
    expect(calledURL.startsWith(`https://api.mixpanel.com/record`)).to.be.true;

    const paramsStr = calledURL.split(`?`)[1];
    const params = new URLSearchParams(paramsStr);
    expect(params.get(`replay_id`)).to.equal(`some-other-replay-id`);
    expect(params.get(`distinct_id`)).to.equal(`test-distinct-id`);
    expect(params.get(`$device_id`)).to.equal(`test-device-id`);
    expect(params.get(`$user_id`)).to.equal(`test-user-id`);
    expect(params.get(`$current_url`)).to.equal(`https://foobar.com/login`);
    expect(params.get(`replay_start_url`)).to.equal(`https://foobar.com/`);
    expect(params.get(`seq`)).to.equal(`5`);
    expect(params.get(`replay_start_time`)).to.equal((startTime / 1000).toString());
    expect(params.get(`replay_length_ms`)).to.equal(`60000`);

    const body = JSON.parse(fetchCall.args[1].body);
    expect(body).to.deep.equal(persistedEvents);

    const queueAfterFlush = await idbGetItem(`mixpanelRecordingEvents`, batcherKey);
    expect(queueAfterFlush).to.not.be.ok;
  });

  it(`does not unload persisted rrweb data and cleans up IndexedDB items if the recording is too short`, async function() {
    await idbCreateDatabase(`mixpanelBrowserDb`, 1, [`mixpanelRecordingEvents`]);
    const startTime = 1737870254055;
    const recordMinMs = 2000;
    const lastEventTimestamp = startTime + recordMinMs - 1;
    const mockMixpanelInstance = new MockMixpanelLib({ 'record_min_ms': recordMinMs });

    const recordingToUnload = SessionRecording.deserialize({
      replayId: `some-other-replay-id`,
      seqNo: 5,
      replayStartTime: startTime,
      batchStartUrl: `https://foobar.com/login`,
      replayStartUrl: `https://foobar.com/`,
      idleExpires: startTime + 30 * 60 * 1000,
      maxExpires: startTime + 24 * 60 * 60 * 1000,
      tabId: `test-some-other-tab-id`,
      lastEventTimestamp: lastEventTimestamp,
    }, {mixpanelInstance: mockMixpanelInstance, sharedLockStorage: localStorage});

    const persistedEvents = [
      {timestamp: startTime + 10, data: {source: IncrementalSource.MouseInteraction}},
      {timestamp: startTime + 15, data: {source: IncrementalSource.MouseMove}},
      {timestamp: lastEventTimestamp, data: {source: IncrementalSource.Mutation}},
    ].map(ev => {
      return {
        type: EventType.IncrementalSnapshot,
        id: ev.timestamp - startTime,
        payload: ev,
        flushAfter: startTime,
      };
    });

    const batcherKey = `__mprec_mp_test_test-token_some-other-replay-id`;

    await idbSetItem(`mixpanelRecordingEvents`, batcherKey, persistedEvents);

    await recordingToUnload.unloadPersistedData();
    expect(fetchStub.calledOnce).to.be.false;

    const queueAfterFlush = await idbGetItem(`mixpanelRecordingEvents`, batcherKey);
    expect(queueAfterFlush).to.be.undefined;
  });

  it(`aborts recording and doesn't flush if there is no full snapshot on the first sequence`, async function() {
    sessionRecording.startRecording();

    mockRrweb.emit(EventType.Meta);
    mockRrweb.emit(EventType.IncrementalSnapshot, IncrementalSource.MouseInteraction);
    clock.tick(RECORD_ENQUEUE_THROTTLE_MS);
    await sessionRecording.__enqueuePromise;
    clock.tick(10 * 1000);
    await sessionRecording.batcher._flushPromise;

    expect(flushSpy.calledOnce).to.be.false;
    expect(mockRrweb.stopSpy.calledOnce).to.be.true;
    expect(sessionRecording.isRrwebStopped()).to.be.true;
  });

  it(`sends the right timestamps if events arrive in the queue out of order`, async function () {
    sessionRecording.startRecording();

    mockRrweb.emit(EventType.Meta);
    clock.tick(1000);
    await sessionRecording.__enqueuePromise;
    mockRrweb.emit(EventType.IncrementalSnapshot, IncrementalSource.MouseInteraction);
    mockRrweb.emit(EventType.FullSnapshot, null, NOW_MS); // out of order

    clock.tick(RECORD_ENQUEUE_THROTTLE_MS);
    await sessionRecording.__enqueuePromise;
    clock.tick(10 * 1000);
    await sessionRecording.batcher._flushPromise;

    expect(flushSpy.calledTwice).to.be.true;
    expect(fetchStub.calledOnce).to.be.true;

    const fetchCall = fetchStub.getCall(0);
    const calledURL = fetchCall.args[0];
    expect(calledURL.startsWith(`https://api.mixpanel.com/record`)).to.be.true;

    const paramsStr = calledURL.split(`?`)[1];
    const params = new URLSearchParams(paramsStr);
    expect(params.get(`replay_start_time`)).to.equal((NOW_MS / 1000).toString());
    expect(params.get(`replay_length_ms`)).to.equal(`1000`);
    expect(params.get(`batch_start_time`)).to.equal((NOW_MS / 1000).toString());

    mockRrweb.emit(EventType.IncrementalSnapshot, IncrementalSource.MouseInteraction);
    mockRrweb.emit(EventType.IncrementalSnapshot, IncrementalSource.MouseInteraction, NOW_MS + 1000); // out of order
    clock.tick(RECORD_ENQUEUE_THROTTLE_MS);
    await sessionRecording.__enqueuePromise;
    clock.tick(10 * 1000);
    await sessionRecording.batcher._flushPromise;

    expect(flushSpy.calledThrice).to.be.true;
    expect(fetchStub.calledTwice).to.be.true;

    const fetchCall2 = fetchStub.getCall(1);
    const calledURL2 = fetchCall2.args[0];
    expect(calledURL2.startsWith(`https://api.mixpanel.com/record`)).to.be.true;

    const paramsStr2 = calledURL2.split(`?`)[1];
    const params2 = new URLSearchParams(paramsStr2);
    expect(params2.get(`replay_start_time`)).to.equal((NOW_MS / 1000).toString());
    expect(params2.get(`replay_length_ms`)).to.equal((11 * 1000 + RECORD_ENQUEUE_THROTTLE_MS).toString());

    expect(params2.get(`batch_start_time`)).to.equal(((NOW_MS + 1000) / 1000).toString());
  });

  it(`runs the idle timeout handler when timing out`, function () {
    sessionRecording.startRecording();
    clock.tick(60 * 1000);

    mockRrweb.emit(EventType.IncrementalSnapshot, IncrementalSource.MouseMove);
    clock.tick(29 * 60 * 1000);
    expect(onIdleTimeoutSpy.calledOnce).to.be.false;
    clock.tick(61 * 1000);

    expect(onIdleTimeoutSpy.calledOnce).to.be.true;
  });

  it(`will respect the idle timeout even when setTimeout fails (race condition where a browser tab might pause timers)`, function () {
    sessionRecording.startRecording();

    const rightBeforeTimeout = 30 * 60 * 1000 - 1;
    clock.tick(rightBeforeTimeout);

    expect(onIdleTimeoutSpy.calledOnce).to.be.false;
    mockRrweb.emit(EventType.IncrementalSnapshot, IncrementalSource.MouseMove, NOW_MS + rightBeforeTimeout + 2);
    expect(onIdleTimeoutSpy.calledOnce).to.be.true;
  });

  it(`respects tracking opt-out check`, async function() {
    sessionRecording.startRecording();
    expect(sessionRecording.isRrwebStopped()).to.be.false;

    mockRrweb.emit(EventType.Meta);
    mockRrweb.emit(EventType.FullSnapshot);
    clock.tick(RECORD_ENQUEUE_THROTTLE_MS);
    await sessionRecording.__enqueuePromise;

    sinon.stub(_.localStorage, `get`).callsFake(function (key) {
      if (key === `__mp_opt_in_out_test-token`) {
        return `0`;
      }
      return null;
    });

    clock.tick(1000);
    mockRrweb.emit(EventType.IncrementalSnapshot, IncrementalSource.MouseInteraction);
    // this should not be queued, it would await the previous completed enqueuePromise
    clock.tick(RECORD_ENQUEUE_THROTTLE_MS);
    await sessionRecording.__enqueuePromise;

    clock.tick(10 * 1000);
    await sessionRecording.batcher._flushPromise;
    expect(fetchStub.calledOnce).to.be.false;
    expect(mockRrweb.stopSpy.calledOnce).to.be.true;
    expect(sessionRecording.isRrwebStopped()).to.be.true;

    const queue = await idbGetItem(`mixpanelRecordingEvents`, batcherKey);
    expect(queue.length).to.equal(0, `batcher should have removed the items from IDB`);
  });

  describe(`_getMaskFn`, function() {
    let mockElement;
    let mockPrivacyConfig;
    let shouldMaskFnStub;
    let reportErrorSpy;

    beforeEach(function() {
      mockElement = {}; // doesn't matter for these tests
      mockPrivacyConfig = {};
      shouldMaskFnStub = sinon.stub();
      reportErrorSpy = sinon.spy(sessionRecording, `reportError`);
    });

    afterEach(function() {
      reportErrorSpy.restore();
    });

    it(`returns empty string for whitespace-only text`, function() {
      const maskFn = sessionRecording._getMaskFn(shouldMaskFnStub, mockPrivacyConfig);

      expect(maskFn(`   `, mockElement)).to.equal(``);
      expect(maskFn(`\t\t\t`, mockElement)).to.equal(``);
      expect(maskFn(`\n\n`, mockElement)).to.equal(``);
      expect(maskFn(`  \n\t  `, mockElement)).to.equal(``);
      expect(maskFn(``, mockElement)).to.equal(``);

      // shouldMaskFn should not be called for whitespace-only text
      expect(shouldMaskFnStub.called).to.be.false;
    });

    it(`handles errors in shouldMaskFn and defaults to masking`, function() {
      shouldMaskFnStub.throws(new Error(`Test error in shouldMaskFn`));

      const maskFn = sessionRecording._getMaskFn(shouldMaskFnStub, mockPrivacyConfig);
      const result = maskFn(`sensitive data`, mockElement);

      // Should default to masking when error occurs
      expect(result).to.equal(`**************`);
      expect(reportErrorSpy.calledOnce).to.be.true;
      expect(reportErrorSpy.firstCall.args[0]).to.include(`Error checking if text should be masked`);
    });

    it(`truncates massive text lengths to 10000 characters`, function() {
      shouldMaskFnStub.returns(true);

      const maskFn = sessionRecording._getMaskFn(shouldMaskFnStub, mockPrivacyConfig);

      const massiveText = `a`.repeat(50000);
      const result = maskFn(massiveText, mockElement);

      expect(result).to.equal(`*`.repeat(10000));
      expect(result.length).to.equal(10000);
    });

    it(`masks text when shouldMaskFn returns true`, function() {
      shouldMaskFnStub.returns(true);

      const maskFn = sessionRecording._getMaskFn(shouldMaskFnStub, mockPrivacyConfig);
      const result = maskFn(`secret`, mockElement);

      expect(result).to.equal(`******`);
      expect(shouldMaskFnStub.calledOnce).to.be.true;
      expect(shouldMaskFnStub.firstCall.args[0]).to.equal(mockElement);
      expect(shouldMaskFnStub.firstCall.args[1]).to.equal(mockPrivacyConfig);
    });

    it(`does not mask text when shouldMaskFn returns false`, function() {
      shouldMaskFnStub.returns(false);

      const maskFn = sessionRecording._getMaskFn(shouldMaskFnStub, mockPrivacyConfig);
      const result = maskFn(`public data`, mockElement);

      expect(result).to.equal(`public data`);
      expect(shouldMaskFnStub.calledOnce).to.be.true;
    });
  });
});
