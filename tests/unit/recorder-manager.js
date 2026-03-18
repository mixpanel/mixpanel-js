import { expect } from "chai";
import sinon from "sinon";
import { RecorderManager } from "../../src/recorder-manager";
import { window } from "../../src/window";
import { RECORDER_GLOBAL_NAME, TARGETING_GLOBAL_NAME, RECORDER_FILENAME, TARGETING_FILENAME } from "../../src/config";

describe(`RecorderManager`, function() {
  let recorderManager;
  let mockConfig;
  let mockRecorder;
  let getConfigStub;
  let getDistinctIdStub;

  beforeEach(function() {
    mockRecorder = {
      'isRecording': sinon.stub().returns(false),
      'replayId': `test-replay-id`
    };

    getConfigStub = sinon.stub();
    getDistinctIdStub = sinon.stub().returns(`test-distinct-id`);

    mockConfig = {
      'token': `test-token`,
      'record_heatmap_data': true
    };

    getConfigStub.callsFake((key) => mockConfig[key]);

    recorderManager = new RecorderManager({
      createRecorderFunc: sinon.stub(),
      getConfigFunc: getConfigStub,
      setConfigFunc: sinon.stub(),
      getTabIdFunc: () => `test-tab-id`,
      reportErrorFunc: sinon.stub(),
      getDistinctIdFunc: getDistinctIdStub,
      loadExtraBundle: sinon.stub()
    });
  });

  afterEach(function() {
    sinon.restore();
  });

  describe(`isRecording`, function() {
    it(`should return falsy when no recorder exists`, function() {
      expect(recorderManager.isRecording()).to.not.be.ok;
    });

    it(`should delegate to recorder when it exists`, function() {
      recorderManager._recorder = mockRecorder;
      mockRecorder.isRecording.returns(false);

      expect(recorderManager.isRecording()).to.be.false;
      expect(mockRecorder.isRecording.called).to.be.true;
    });

    it(`should return true when recorder is recording`, function() {
      recorderManager._recorder = mockRecorder;
      mockRecorder.isRecording.returns(true);

      expect(recorderManager.isRecording()).to.be.true;
    });
  });

  describe(`getSessionReplayId`, function() {
    it(`should return null when no recorder exists`, function() {
      expect(recorderManager.getSessionReplayId()).to.be.null;
    });

    it(`should return replay id from recorder`, function() {
      recorderManager._recorder = mockRecorder;

      expect(recorderManager.getSessionReplayId()).to.equal(`test-replay-id`);
    });

    it(`should return null when recorder has no replay id`, function() {
      mockRecorder.replayId = null;
      recorderManager._recorder = mockRecorder;

      expect(recorderManager.getSessionReplayId()).to.be.null;
    });
  });

  describe(`getSessionRecordingProperties`, function() {
    it(`should return empty object when no replay id`, function() {
      const props = recorderManager.getSessionRecordingProperties();

      expect(props).to.deep.equal({});
    });

    it(`should return replay id property when recording`, function() {
      recorderManager._recorder = mockRecorder;

      const props = recorderManager.getSessionRecordingProperties();

      expect(props).to.deep.equal({
        '$mp_replay_id': `test-replay-id`
      });
    });
  });

  describe(`getSessionReplayUrl`, function() {
    it(`should return null when no replay id`, function() {
      expect(recorderManager.getSessionReplayUrl()).to.be.null;
    });

    it(`should return correct URL when recording`, function() {
      recorderManager._recorder = mockRecorder;

      const url = recorderManager.getSessionReplayUrl();

      expect(url).to.include(`https://mixpanel.com/projects/replay-redirect?`);
      expect(url).to.include(`replay_id=test-replay-id`);
      expect(url).to.include(`distinct_id=test-distinct-id`);
      expect(url).to.include(`token=test-token`);
    });

    it(`should properly encode URL parameters`, function() {
      getDistinctIdStub.returns(`user+with spaces`);
      mockRecorder.replayId = `replay/with/slashes`;
      recorderManager._recorder = mockRecorder;

      const url = recorderManager.getSessionReplayUrl();

      // HTTPBuildQuery should encode these properly
      expect(url).to.be.a(`string`);
      expect(url).to.include(`replay_id=`);
      expect(url).to.include(`distinct_id=`);
    });
  });

  describe(`isRecordingHeatmapData`, function() {
    it(`should return falsy when no replay id`, function() {
      expect(recorderManager.isRecordingHeatmapData()).to.not.be.ok;
    });

    it(`should return falsy when heatmap disabled`, function() {
      mockConfig.record_heatmap_data = false;
      recorderManager._recorder = mockRecorder;

      expect(recorderManager.isRecordingHeatmapData()).to.not.be.ok;
    });

    it(`should return truthy when recording and heatmap enabled`, function() {
      recorderManager._recorder = mockRecorder;

      expect(recorderManager.isRecordingHeatmapData()).to.be.ok;
    });
  });

  describe(`stopSessionRecording`, function() {
    it(`should return resolved promise when no recorder exists`, async function() {
      const result = await recorderManager.stopSessionRecording();

      expect(result).to.be.undefined;
    });

    it(`should call recorder stopRecording method`, function() {
      const stopStub = sinon.stub().returns(Promise.resolve());
      mockRecorder[`stopRecording`] = stopStub;
      recorderManager._recorder = mockRecorder;

      recorderManager.stopSessionRecording();

      expect(stopStub.calledOnce).to.be.true;
    });
  });

  describe(`pauseSessionRecording`, function() {
    it(`should return resolved promise when no recorder exists`, async function() {
      const result = await recorderManager.pauseSessionRecording();

      expect(result).to.be.undefined;
    });

    it(`should call recorder pauseRecording method`, function() {
      const pauseStub = sinon.stub().returns(Promise.resolve());
      mockRecorder[`pauseRecording`] = pauseStub;
      recorderManager._recorder = mockRecorder;

      recorderManager.pauseSessionRecording();

      expect(pauseStub.calledOnce).to.be.true;
    });
  });

  describe(`resumeSessionRecording`, function() {
    it(`should return resolved promise when no recorder exists`, async function() {
      const result = await recorderManager.resumeSessionRecording();

      expect(result).to.be.undefined;
    });

    it(`should call recorder resumeRecording method`, function() {
      const resumeStub = sinon.stub().returns(Promise.resolve());
      mockRecorder[`resumeRecording`] = resumeStub;
      recorderManager._recorder = mockRecorder;

      recorderManager.resumeSessionRecording();

      expect(resumeStub.calledOnce).to.be.true;
    });
  });

  describe(`getRecorder`, function() {
    it(`should return null when no recorder exists`, function() {
      expect(recorderManager.getRecorder()).to.be.null;
    });

    it(`should return the recorder instance`, function() {
      recorderManager._recorder = mockRecorder;

      expect(recorderManager.getRecorder()).to.equal(mockRecorder);
    });
  });

  describe(`bundle source loading`, function() {
    let originalMutationObserver;
    let loadExtraBundleStub;

    beforeEach(function() {
      originalMutationObserver = window[`MutationObserver`];
      window[`MutationObserver`] = sinon.stub();
      delete window[RECORDER_GLOBAL_NAME];

      loadExtraBundleStub = sinon.stub().callsFake((_src, callback) => {
        callback();
      });
    });

    afterEach(function() {
      window[`MutationObserver`] = originalMutationObserver;
      delete window[RECORDER_GLOBAL_NAME];
      delete window[TARGETING_GLOBAL_NAME];
    });

    function createManagerWithOpts(opts) {
      var defaults = {
        mixpanelInstance: {},
        getConfigFunc: getConfigStub,
        getTabIdFunc: () => `test-tab-id`,
        reportErrorFunc: sinon.stub(),
        getDistinctIdFunc: getDistinctIdStub,
        loadExtraBundle: loadExtraBundleStub
      };
      return new RecorderManager(Object.assign(defaults, opts));
    }

    describe(`recorderSrc`, function() {
      it(`should use recorderSrc when provided`, async function() {
        const manager = createManagerWithOpts({
          recorderSrc: `https://cdn.example.com/custom-recorder.js`,
          libBasePath: `/base/`
        });
        // stub out the recorder constructor so it doesn't blow up
        window[RECORDER_GLOBAL_NAME] = undefined;
        loadExtraBundleStub.callsFake((_src, callback) => {
          window[RECORDER_GLOBAL_NAME] = sinon.stub().returns({
            'resumeRecording': sinon.stub()
          });
          callback();
        });

        await manager.checkAndStartSessionRecording(true);

        expect(loadExtraBundleStub.calledOnce).to.be.true;
        expect(loadExtraBundleStub.firstCall.args[0]).to.equal(`https://cdn.example.com/custom-recorder.js`);
      });

      it(`should fall back to libBasePath + RECORDER_FILENAME when recorderSrc is not provided`, async function() {
        const manager = createManagerWithOpts({
          libBasePath: `/custom/path/`
        });
        loadExtraBundleStub.callsFake((_src, callback) => {
          window[RECORDER_GLOBAL_NAME] = sinon.stub().returns({
            'resumeRecording': sinon.stub()
          });
          callback();
        });

        await manager.checkAndStartSessionRecording(true);

        expect(loadExtraBundleStub.calledOnce).to.be.true;
        expect(loadExtraBundleStub.firstCall.args[0]).to.equal(`/custom/path/` + RECORDER_FILENAME);
      });

      it(`should not call loadExtraBundle when recorder is already loaded`, async function() {
        window[RECORDER_GLOBAL_NAME] = sinon.stub().returns({
          'resumeRecording': sinon.stub()
        });
        const manager = createManagerWithOpts({
          recorderSrc: `https://cdn.example.com/custom-recorder.js`
        });

        await manager.checkAndStartSessionRecording(true);

        expect(loadExtraBundleStub.called).to.be.false;
      });
    });

    describe(`targetingSrc`, function() {
      it(`should use targetingSrc when provided`, function() {
        const manager = createManagerWithOpts({
          targetingSrc: `https://cdn.example.com/custom-targeting.js`,
          libBasePath: `/base/`
        });
        mockConfig[`recording_event_triggers`] = {
          'test_event': {
            'percentage': 100,
            'property_filters': { 'key': `value` }
          }
        };

        manager.startRecordingOnEvent(`test_event`, { 'key': `value` });

        expect(loadExtraBundleStub.calledOnce).to.be.true;
        expect(loadExtraBundleStub.firstCall.args[0]).to.equal(`https://cdn.example.com/custom-targeting.js`);
      });

      it(`should fall back to libBasePath + TARGETING_FILENAME when targetingSrc is not provided`, function() {
        const manager = createManagerWithOpts({
          libBasePath: `/custom/path/`
        });
        mockConfig[`recording_event_triggers`] = {
          'test_event': {
            'percentage': 100,
            'property_filters': { 'key': `value` }
          }
        };

        manager.startRecordingOnEvent(`test_event`, { 'key': `value` });

        expect(loadExtraBundleStub.calledOnce).to.be.true;
        expect(loadExtraBundleStub.firstCall.args[0]).to.equal(`/custom/path/` + TARGETING_FILENAME);
      });
    });
  });
});
