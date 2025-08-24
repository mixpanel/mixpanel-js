import { expect } from 'chai';
import { EventType } from '@mixpanel/rrweb-types';

import sinon from 'sinon';
import { window } from '../../src/window';
import localStorage from 'localStorage';
import { setupFakeIDB, idbGetItem, idbSetItem } from './test-utils/indexed-db';
import { MixpanelRecorder } from '../../src/recorder/recorder';
import { MockMixpanelLib } from './test-utils/mock-mixpanel-lib';
import { setupRrwebMock } from './test-utils/mock-rrweb';
import { IDBStorageWrapper } from '../../src/storage/indexed-db';
import { RECORD_ENQUEUE_THROTTLE_MS } from '../../src/recorder/utils';

describe(`Recorder`, function() {
  /**
   * @type {MixpanelRecorder}
   */
  let recorder;

  let clock, mockMixpanelInstance, fetchStub, mockRrweb;
  const NOW_MS = 1737999877508;

  setupFakeIDB();

  beforeEach( function() {
    localStorage.clear();
    clock = sinon.useFakeTimers({now: NOW_MS, toFake: [`Date`, `setTimeout`, `clearTimeout`, `setInterval`, `clearInterval`, `performance`]});
    window.performance = clock.performance; // used for UUID generation

    mockMixpanelInstance = new MockMixpanelLib();
    mockRrweb = setupRrwebMock();

    recorder = new MixpanelRecorder(mockMixpanelInstance, mockRrweb.recordStub, localStorage);

    fetchStub = sinon.stub().returns(
      Promise.resolve(new Response(JSON.stringify({code: 200, status: `OK`}), {
        status: 200,
        headers: {
          'Content-type': `application/json`
        }
      }))
    );
    window.fetch = fetchStub;
  });

  afterEach(function () {
    delete window.fetch;
    delete window.performance;
    clock.restore();
    sinon.restore();
  });


  it(`starts recording and updates the registry`, async function () {
    let serializedRecording = await idbGetItem(`mixpanelRecordingRegistry`, `test-tab-id`);
    expect(serializedRecording).to.not.exist;

    await recorder.startRecording();
    serializedRecording = await idbGetItem(`mixpanelRecordingRegistry`, `test-tab-id`);
    expect(serializedRecording).to.exist;
    expect(serializedRecording.seqNo).to.equal(0);
    const expectedMaxExpires = NOW_MS + 24 * 60 * 60 * 1000;
    expect(serializedRecording.maxExpires).to.equal(expectedMaxExpires);
    const expectedIdleExpires = NOW_MS + 30 * 60 * 1000;
    expect(serializedRecording.idleExpires).to.equal(expectedIdleExpires);

    expect(mockRrweb.recordStub.callCount).to.equal(1);

    mockRrweb.emit(EventType.Meta);
    mockRrweb.emit(EventType.FullSnapshot);
    mockRrweb.emit(EventType.IncrementalSnapshot);
    await clock.tickAsync(RECORD_ENQUEUE_THROTTLE_MS);
    await recorder.activeRecording.__enqueuePromise;

    await clock.tickAsync(10 * 1000);
    await recorder.activeRecording.batcher._flushPromise;

    expect(fetchStub.calledOnce).to.be.true;
    const eventTypes = JSON.parse(fetchStub.getCall(0).args[1].body).map(e => e.type);
    expect(eventTypes).to.deep.equal([4, 2, 3]);

    serializedRecording = await idbGetItem(`mixpanelRecordingRegistry`, `test-tab-id`);
    expect(serializedRecording).to.exist;
    expect(serializedRecording.seqNo).to.equal(1);
    expect(serializedRecording.maxExpires).to.equal(expectedMaxExpires);
    expect(serializedRecording.idleExpires).to.equal(expectedIdleExpires);
  });

  it(`starts a new recording upon idle timeout`, async function () {
    await recorder.startRecording();
    const serializedRecording = await idbGetItem(`mixpanelRecordingRegistry`, `test-tab-id`);
    expect(serializedRecording).to.exist;
    expect(serializedRecording.seqNo).to.equal(0);
    const replayId = serializedRecording.replayId;
    const timedOutRecording = recorder.activeRecording;

    mockRrweb.emit(EventType.Meta);
    mockRrweb.emit(EventType.FullSnapshot);
    clock.tick(RECORD_ENQUEUE_THROTTLE_MS);
    await timedOutRecording.__enqueuePromise;
    await clock.tickAsync(30 * 60 * 1000);
    await timedOutRecording.batcher._flushPromise;

    expect(fetchStub.calledOnce).to.be.true;
    expect(fetchStub.getCall(0).args[0]).to.contain(`replay_id=${replayId}`);
    expect(mockRrweb.stopSpy.callCount).to.equal(1);
    expect(mockRrweb.recordStub.callCount).to.equal(2);

    expect(timedOutRecording).to.not.equal(recorder.activeRecording);
    expect(recorder.activeRecording.replayId).to.not.equal(replayId);

    const newSerializedRecording = await idbGetItem(`mixpanelRecordingRegistry`, `test-tab-id`);
    expect(newSerializedRecording).to.exist;
    expect(newSerializedRecording.replayId).to.not.equal(replayId);
    expect(newSerializedRecording.seqNo).to.equal(0);
  });

  describe(`resumeRecording`, function () {
    const SERIALIZED_RECORDING = {
      replayId: `test-replay-id`,
      maxExpires: NOW_MS + 10 * 60 * 1000,
      idleExpires: NOW_MS + 5 * 60 * 1000,
      replayStartTime: NOW_MS - 10000,
      seqNo: 2,
      batchStartUrl: `http://foo.org`,
      replayStartUrl: `http://foo.org`,
      tabId: `test-tab-id`,
    };

    it(`can resume a paused recording`, async function () {
      await recorder.startRecording();
      const replayId = recorder.getActiveReplayId();

      mockRrweb.emit(EventType.Meta);
      mockRrweb.emit(EventType.FullSnapshot);

      await clock.tickAsync(RECORD_ENQUEUE_THROTTLE_MS);
      await recorder.activeRecording.__enqueuePromise;
      await recorder.pauseRecording();

      expect(fetchStub.calledOnce).to.be.true;
      let url = new URL(fetchStub.getCall(0).args[0]);
      expect(url.searchParams.get(`seq`)).to.equal(`0`);
      expect(url.searchParams.get(`replay_id`)).to.equal(replayId);

      // this shouldn't do anything, recording is paused
      mockRrweb.emit(EventType.FullSnapshot);
      clock.tick(RECORD_ENQUEUE_THROTTLE_MS);
      await recorder.activeRecording.__enqueuePromise;
      await clock.tickAsync(100 * 1000);
      expect(fetchStub.calledOnce).to.be.true;

      await recorder.resumeRecording();
      mockRrweb.emit(EventType.IncrementalSnapshot);
      clock.tick(RECORD_ENQUEUE_THROTTLE_MS);
      await recorder.activeRecording.__enqueuePromise;
      await clock.tickAsync(10 * 1000);
      await recorder.activeRecording.batcher._flushPromise;

      expect(fetchStub.calledTwice).to.be.true;
      url = new URL(fetchStub.getCall(1).args[0]);
      expect(url.searchParams.get(`seq`)).to.equal(`1`);
      expect(url.searchParams.get(`replay_id`)).to.equal(replayId);
      recorder.stopRecording();
    });

    async function verifyRegistryRecordingIsResumed() {
      expect(mockRrweb.recordStub.callCount).to.equal(1);

      mockRrweb.emit(EventType.Meta);
      clock.tick(RECORD_ENQUEUE_THROTTLE_MS);
      await recorder.activeRecording.__enqueuePromise;
      await clock.tickAsync(10 * 1000);
      await recorder.activeRecording.batcher._flushPromise;

      expect(fetchStub.calledOnce).to.be.true;
      expect(fetchStub.getCall(0).args[0]).to.contain(`replay_id=test-replay-id`);
      expect(fetchStub.getCall(0).args[0]).to.contain(`seq=2`);
    }

    it(`can resume an active recording in the registry`, async function () {
      await idbSetItem(`mixpanelRecordingRegistry`, `test-tab-id`, SERIALIZED_RECORDING);
      await recorder.resumeRecording();
      await verifyRegistryRecordingIsResumed();
    });

    it(`resumes an active recording in the registry when startNewIfInactive=true`, async function () {
      await idbSetItem(`mixpanelRecordingRegistry`, `test-tab-id`, SERIALIZED_RECORDING);
      await recorder.resumeRecording(true);
      await verifyRegistryRecordingIsResumed();
    });

    it(`does nothing if the recording in the registry is expired`, async function () {
      const expiredRecording = Object.assign({}, SERIALIZED_RECORDING, {maxExpires: NOW_MS - 1000});
      await idbSetItem(`mixpanelRecordingRegistry`, `test-tab-id`, expiredRecording);

      await recorder.resumeRecording();
      expect(mockRrweb.recordStub.callCount).to.equal(0);
    });

    it(`starts a new recording when the recording in the registry is expired and startNewIfInactive=true`, async function () {
      const expiredRecording = Object.assign({}, SERIALIZED_RECORDING, {maxExpires: NOW_MS - 1000});
      await idbSetItem(`mixpanelRecordingRegistry`, `test-tab-id`, expiredRecording);

      await recorder.resumeRecording(true);
      expect(mockRrweb.recordStub.callCount).to.equal(1);
      expect(recorder.getActiveReplayId()).to.not.equal(`test-replay-id`);
    });
  });

  describe(`scenarios with multiple recorders (tabs)`, function () {
    it(`a new recorder will flush a previous recording if expired`, async function () {
      // tab1 starts recording and queues some events
      await recorder.startRecording();
      expect(mockRrweb.recordStub.callCount).to.equal(1);
      mockRrweb.emit(EventType.Meta);
      mockRrweb.emit(EventType.FullSnapshot);
      mockRrweb.emit(EventType.IncrementalSnapshot);
      await clock.tickAsync(RECORD_ENQUEUE_THROTTLE_MS);
      await recorder.activeRecording.__enqueuePromise;
      const tab1ReplayId = recorder.getActiveReplayId();

      // simulate tab1 disconnecting, stop the batcher and clear timeouts
      // no flush should occur after this
      recorder._stopCurrentRecording(true);

      await clock.tickAsync(30 * 60 * 1000);
      await recorder.activeRecording.batcher._flushPromise;
      expect(fetchStub.callCount).to.equal(0);

      // tab2 starts recording, sees that tab1's recording is expired, and flushes it
      const tab2Rrweb = setupRrwebMock();
      const tab2MixpanelLib = new MockMixpanelLib();
      sinon.stub(tab2MixpanelLib, `get_tab_id`).returns(`test-tab-id-2`);
      const tab2Recording = new MixpanelRecorder(tab2MixpanelLib, tab2Rrweb.recordStub, localStorage);
      await tab2Recording._flushInactivePromise;

      expect(fetchStub.callCount).to.equal(1);
      expect(fetchStub.getCall(0).args[0]).to.contain(`replay_id=${tab1ReplayId}`);
      const eventTypes = JSON.parse(fetchStub.getCall(0).args[1].body).map(e => e.type);
      expect(eventTypes).to.deep.equal([4, 2, 3]);

      await tab2Recording.startRecording();
      const tab2ReplayId = tab2Recording.getActiveReplayId();
      expect(tab2ReplayId).to.not.equal(tab1ReplayId);
      tab2Rrweb.emit(EventType.Meta);
      tab2Rrweb.emit(EventType.FullSnapshot);
      clock.tick(RECORD_ENQUEUE_THROTTLE_MS);
      await tab2Recording.activeRecording.__enqueuePromise;
      await clock.tickAsync(10 * 1000);

      await tab2Recording.activeRecording.batcher._flushPromise;
      expect(fetchStub.callCount).to.equal(2);
      expect(fetchStub.getCall(1).args[0]).to.contain(`replay_id=${tab2ReplayId}`);
      const tab2EventTypes = JSON.parse(fetchStub.getCall(1).args[1].body).map(e => e.type);
      expect(tab2EventTypes).to.deep.equal([EventType.Meta, EventType.FullSnapshot]);
    });

    /**
     * tests the following scenario:
     *  1. tab1 was recording and is now in the background and hits idle timeout (but handler is not fired)
     *  2. tab2 is opened and initialized, and flushes tab1's recording data because it sees it was expired
     *  3. tab1 is refocused and the idleTimeout handler is fired - it should start a new recording
     */
    it(`a recorder can reset a recording, even if a different tab flushed its data`, async function () {
      // tab1 starts recording and queues some events
      await recorder.startRecording();
      expect(mockRrweb.recordStub.callCount).to.equal(1);
      mockRrweb.emit(EventType.Meta);
      mockRrweb.emit(EventType.FullSnapshot);
      mockRrweb.emit(EventType.IncrementalSnapshot);
      await clock.tickAsync(RECORD_ENQUEUE_THROTTLE_MS);
      await recorder.activeRecording.__enqueuePromise;
      const tab1ReplayId = recorder.getActiveReplayId();

      // tab1 is now in the background, pretend the JS execution was suspended
      recorder._stopCurrentRecording(true);

      await clock.tickAsync(30 * 60 * 1000);

      await recorder.activeRecording.batcher._flushPromise;
      expect(fetchStub.callCount).to.equal(0);

      // tab2 starts recording, sees that tab1's recording is expired, and flushes it
      const tab2Rrweb = setupRrwebMock();
      const tab2MixpanelLib = new MockMixpanelLib();
      sinon.stub(tab2MixpanelLib, `get_tab_id`).returns(`test-tab-id-2`);
      const tab2Recording = new MixpanelRecorder(tab2MixpanelLib, tab2Rrweb.recordStub, localStorage);

      // tab2 flushed tab1's data because it's expired
      await tab2Recording._flushInactivePromise;
      expect(fetchStub.callCount).to.equal(1);

      // tab1 hit idle timeout, it should reset and start a new recording
      recorder.resetRecording();
      await clock.tickAsync(10 * 10000);
      expect(recorder.getActiveReplayId()).to.not.equal(tab1ReplayId);
    });
  });

  describe(`scenarios where storage is not available`, function () {
    async function verifyBasicRecording() {
      await recorder.startRecording();
      expect(mockRrweb.recordStub.callCount).to.equal(1);

      mockRrweb.emit(EventType.Meta);
      mockRrweb.emit(EventType.FullSnapshot);
      mockRrweb.emit(EventType.IncrementalSnapshot);
      await clock.tickAsync(RECORD_ENQUEUE_THROTTLE_MS);
      await recorder.activeRecording.__enqueuePromise;

      await clock.tickAsync(10 * 1000);
      await recorder.activeRecording.batcher._flushPromise;

      expect(fetchStub.calledOnce).to.be.true;
      const url = new URL(fetchStub.getCall(0).args[0]);
      const eventTypes = JSON.parse(fetchStub.getCall(0).args[1].body).map(e => e.type);
      expect(eventTypes).to.deep.equal([4, 2, 3]);

      expect(url.searchParams.get(`seq`)).to.equal(`0`);
      expect(url.searchParams.get(`replay_id`)).to.equal(recorder.getActiveReplayId());
      expect(url.searchParams.get(`replay_start_time`)).to.equal((NOW_MS / 1000).toString());
    }

    it(`can still record when indexedDB is not available`, async function () {
      delete window.indexedDB;
      delete window.IDBDatabase;
      await verifyBasicRecording();
    });

    it(`can still record when indexedDB fails to initialize`, async function () {
      sinon.stub(IDBStorageWrapper.prototype, `init`).rejects(`test error`);
      await verifyBasicRecording();
    });

    it(`can still record when tab ID is unavailable (sessionStorage failed)`, async function () {
      sinon.stub(mockMixpanelInstance, `get_tab_id`).returns(null);
      await verifyBasicRecording();
    });

    it(`will retry a closed IDB connection error to continue recording`, async function () {
      const transactionStub = sinon.stub(window.IDBDatabase.prototype, `transaction`)
        .onCall(0).throws(`InvalidStateError`)
        .onCall(1).throws(`InvalidStateError`)
        .onCall(2).throws(`InvalidStateError`)
        .onCall(3).throws(`InvalidStateError`)
        .onCall(4).throws(`InvalidStateError`);
      transactionStub.callThrough();
      await verifyBasicRecording();
    });

    it(`records without persistence when localStorage fails`, async function () {
      var idbOpenSpy = sinon.spy(window.indexedDB, `open`);
      sinon.stub(localStorage, `setItem`).throws(`test error`);
      await verifyBasicRecording();
      expect(idbOpenSpy.callCount).to.equal(0);
    });

    it(`records without persistence when disable_persistence=true`, async function () {
      const idbOpenSpy = sinon.spy(window.indexedDB, `open`);
      const getConfigStub = sinon.stub(MockMixpanelLib.prototype, 'get_config');
      getConfigStub.withArgs('disable_persistence').returns(true);
      getConfigStub.callThrough();

      // create new recorder so that disable_persistence is true at the start
      recorder = new MixpanelRecorder(mockMixpanelInstance, mockRrweb.recordStub, localStorage);

      await verifyBasicRecording();
      expect(getConfigStub.called).to.be.true;
      expect(idbOpenSpy.callCount).to.equal(0);
    });

    it(`deletes the active recording when recording is stopped and disable_persistence=true`, async function () {
      await verifyBasicRecording();
      const getConfigStub = sinon.stub(MockMixpanelLib.prototype, 'get_config');
      getConfigStub.withArgs('disable_persistence').returns(true);
      getConfigStub.callThrough();

      await recorder.stopRecording();
      
      const storedRecording = await idbGetItem(`mixpanelRecordingRegistry`, `test-tab-id`);
      expect(storedRecording).to.not.exist;
    });
  });
});
