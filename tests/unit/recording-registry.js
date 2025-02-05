import { expect } from 'chai';

import sinon from 'sinon';
import { window } from '../../src/window';
import localStorage from 'localStorage';
import { setupFakeIDB, idbGetItem, idbSetItem, idbCreateDatabase } from './test-utils/indexed-db';
import { RecordingRegistry } from '../../src/recorder/recording-registry';
import { MockMixpanelLib } from './test-utils/mock-mixpanel-lib';

describe(`RecordingRegistry`, function() {
  /**
   * @type {RecordingRegistry}
   */
  let recordingRegistry;

  let clock, mockMixpanelInstance, fetchStub;
  const NOW_MS = 1737999877508;
  const SERIALIZED_RECORDING = {
    replayId: `test-replay-id`,
    maxExpires: NOW_MS + 10 * 60 * 1000,
    idleExpires: NOW_MS + 5 * 60 * 1000,
    replayStartTime: NOW_MS - 1000,
    seqNo: 0,
    batchStartUrl: `http://foo.org`,
    replayStartUrl: `http://foo.org`,
    tabId: `test-tab-id`,
  };
  const BATCHER_PREFIX = `__mprec_mp_test_test-token_`;

  setupFakeIDB();

  beforeEach(async function() {
    localStorage.clear();
    clock = sinon.useFakeTimers({now: NOW_MS, toFake: [`Date`, `setTimeout`, `clearTimeout`, `setInterval`, `clearInterval`]});

    mockMixpanelInstance = new MockMixpanelLib();

    recordingRegistry = new RecordingRegistry({
      mixpanelInstance: mockMixpanelInstance,
      errorReporter: console.error,
      sharedLockStorage: localStorage
    });

    fetchStub = sinon.stub().returns(Promise.resolve());
    window.fetch = fetchStub;
  });

  afterEach(function () {
    delete window.fetch;
    clock.restore();
    sinon.restore();
  });


  describe(`setActiveRecording()`, function () {
    it(`sets the active recording in IDB` , async function() {
      await recordingRegistry.setActiveRecording(SERIALIZED_RECORDING);

      const storedRecording = await idbGetItem(`mixpanelRecordingRegistry`, `test-tab-id`);
      expect(storedRecording).to.deep.equal(SERIALIZED_RECORDING);
    });
  });

  describe(`getActiveRecording()`, function () {
    it(`gets the active recording based on the current tab ID`, async function() {
      await idbCreateDatabase(`mixpanelBrowserDb`, 1, [`mixpanelRecordingRegistry`]);
      await idbSetItem(`mixpanelRecordingRegistry`, `test-tab-id`, SERIALIZED_RECORDING);

      const storedRecording = await recordingRegistry.getActiveRecording();
      expect(storedRecording).to.deep.equal(SERIALIZED_RECORDING);
    });

    it(`returns null when the current tabs recording is expired`, async function() {
      const expiredRecording = Object.assign({}, SERIALIZED_RECORDING, {maxExpires: NOW_MS - 1000});

      await idbCreateDatabase(`mixpanelBrowserDb`, 1, [`mixpanelRecordingRegistry`]);
      await idbSetItem(`mixpanelRecordingRegistry`, `test-tab-id`, expiredRecording);

      const storedRecording = await recordingRegistry.getActiveRecording();
      expect(storedRecording).to.be.null;
    });
  });

  describe(`clearActiveRecording()`, function () {
    it(`marks the active recording as expired`, async function() {
      await idbCreateDatabase(`mixpanelBrowserDb`, 1, [`mixpanelRecordingRegistry`]);
      await idbSetItem(`mixpanelRecordingRegistry`, `test-tab-id`, SERIALIZED_RECORDING);

      await recordingRegistry.clearActiveRecording();
      const storedRecording = await idbGetItem(`mixpanelRecordingRegistry`, `test-tab-id`);
      expect(storedRecording.maxExpires).to.equal(0);
    });
  });

  describe(`flushInactiveRecordings()`, function () {
    it(`flushes and cleans up inactive recordings`, async function() {
      await idbCreateDatabase(`mixpanelBrowserDb`, 1, [`mixpanelRecordingRegistry`, `mixpanelRecordingEvents`]);

      const lastEventTime = NOW_MS - 10 * 1000;
      const replayStartTime = NOW_MS - 24 * 60 * 1000;
      const expiredRecording = Object.assign({}, SERIALIZED_RECORDING, {
        maxExpires: NOW_MS - 1000,
        tabId: `test-expired-tab-id`,
        replayId: `expired-replay-id`,
        seqNo: 12,
        batchStartUrl: `http://foo.org/login`,
        replayStartTime,
      });
      await idbSetItem(`mixpanelRecordingRegistry`, `test-expired-tab-id`, expiredRecording);
      await idbSetItem(`mixpanelRecordingEvents`, BATCHER_PREFIX + `expired-replay-id`, [
        {id: 1, payload: {type: 3, timestamp: lastEventTime, data: {source: 4}}, flushAfter: lastEventTime},
        {id: 2, payload: {type: 3, timestamp: lastEventTime, data: {source: 7}}, flushAfter: lastEventTime},
      ]);

      const differentTabRecording = Object.assign({}, SERIALIZED_RECORDING, {tabId: `test-diff-tab-id`, replayId: `diff-replay-id`, seqNo: 4});
      await idbSetItem(`mixpanelRecordingRegistry`, `test-diff-tab-id`, differentTabRecording);
      await idbSetItem(`mixpanelRecordingEvents`, BATCHER_PREFIX + `diff-replay-id`, [
        {id: 1, payload: {type: 3, timestamp: NOW_MS, data: {source: 4}}, flushAfter: NOW_MS},
        {id: 2, payload: {type: 3, timestamp: NOW_MS, data: {source: 7}}, flushAfter: NOW_MS},
      ]);

      await idbSetItem(`mixpanelRecordingRegistry`, `test-tab-id`, SERIALIZED_RECORDING);
      await recordingRegistry.flushInactiveRecordings();
      expect(fetchStub.calledOnce).to.be.true;

      const fetchCall = fetchStub.getCall(0);
      const calledURL = fetchCall.args[0];
      expect(calledURL.startsWith(`https://api.mixpanel.com/record`)).to.be.true;

      const paramsStr = calledURL.split(`?`)[1];
      const params = new URLSearchParams(paramsStr);
      expect(params.get(`replay_id`)).to.equal(`expired-replay-id`);
      expect(params.get(`distinct_id`)).to.equal(`test-distinct-id`);
      expect(params.get(`$device_id`)).to.equal(`test-device-id`);
      expect(params.get(`$user_id`)).to.equal(`test-user-id`);
      expect(params.get(`$current_url`)).to.equal(`http://foo.org/login`);
      expect(params.get(`replay_start_url`)).to.equal(`http://foo.org`);
      expect(params.get(`seq`)).to.equal(`12`);
      expect(params.get(`replay_start_time`)).to.equal(((NOW_MS - 24 * 60 * 1000) / 1000).toString());
      expect(params.get(`replay_length_ms`)).to.equal((lastEventTime - replayStartTime).toString());

      const expiredStoredRecording = await idbGetItem(`mixpanelRecordingRegistry`, `test-expired-tab-id`);
      expect(expiredStoredRecording).to.not.exist;
      const expiredStoredEvents = await idbGetItem(`mixpanelRecordingEvents`, BATCHER_PREFIX + `expired-replay-id`);
      expect(expiredStoredEvents).to.not.exist;

      const differentTabStoredRecordin = await idbGetItem(`mixpanelRecordingRegistry`, `test-diff-tab-id`);
      expect(differentTabStoredRecordin).to.deep.equal(differentTabRecording);
      const differentTabStoredEvents = await idbGetItem(`mixpanelRecordingEvents`, BATCHER_PREFIX + `diff-replay-id`);
      expect(differentTabStoredEvents).to.have.lengthOf(2);
    });
  });
});
