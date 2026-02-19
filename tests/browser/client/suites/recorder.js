/* global chai, sinon */
import { clearAllStorage, clearAllLibInstances, untilDone, realSetTimeout, simulateMouseClick, makeFakeFetchResponse, makeDelayedFetchResponse, resetExternalLibrary, getExternalLibraryScript } from "../utils";
import { RECORDER_GLOBAL_NAME } from "../../../../src/globals";

const expect = chai.expect;

export function recorderTests (mixpanel) {
  // module tests have the recorder bundled in already, so don't need to test certain things
  const IS_RECORDER_BUNDLED = Boolean(window[RECORDER_GLOBAL_NAME]);
  var loadedRecorderProject = false;

  var recorderSrc = null;
  if (!IS_RECORDER_BUNDLED) {
    recorderSrc = window.MIXPANEL_CUSTOM_LIB_URL.endsWith(`.min.js`) ?
      `../../build/mixpanel-recorder.min.js`:
      `../../build/mixpanel-recorder.js`;
  }

  function validateAndGetUrlParams(fetchStubCall) {
    var calledURL = fetchStubCall.args[0];
    expect(calledURL).to.match(/^https:\/\/api-js\.mixpanel\.com\/record\//);

    var paramsStr = calledURL.split(`?`)[1];
    var params = new URLSearchParams(paramsStr);
    expect(params.get(`distinct_id`)).to.equal(mixpanel.recordertest.get_distinct_id());
    expect(params.get(`$device_id`)).to.equal(mixpanel.recordertest.get_property(`$device_id`));

    return params;
  }

  function getRecorderScript () {
    return getExternalLibraryScript('mixpanel-recorder');
  }


  describe(`recorder`, function () {
    this.timeout(30000);
    this.retries(3);

    beforeEach(async function () {
      await clearAllLibInstances(mixpanel);
      await clearAllStorage();

      if (!IS_RECORDER_BUNDLED) {
        resetExternalLibrary(RECORDER_GLOBAL_NAME, 'mixpanel-recorder');
      }

      this.token = `RECORDER_TEST_TOKEN`;
      this.startTime = 1723733423402;
      this.clock = sinon.useFakeTimers({toFake: [
        `setTimeout`, `clearTimeout`, `setInterval`, `clearInterval`
      ]});
      this.randomStub = sinon.stub(Math, `random`);
      this.fetchStub = sinon.stub(window, `fetch`);

      // realistic successful response
      this.fetchStub.returns(Promise.resolve(new Response(JSON.stringify({code: 200, status: `OK`}), {
        status: 200,
        headers: {
          'Content-type': `application/json`
        }
      })));

      this.initMixpanelRecorder = function (extraConfig) {
        loadedRecorderProject = true;
        return new Promise((resolve) => {
          const config = Object.assign({
            debug: true,
            record_sessions_percent: 0,
            recorder_src: recorderSrc,
            record_console: false,
            loaded: function () {
              resolve();
            }
          }, extraConfig);
          mixpanel.init(this.token, config, `recordertest`);
        });
      };

      this.assertRecorderScript = function (exists) {
        if (IS_RECORDER_BUNDLED) {
          expect(true).to.be.true; // recorder is bundled, so we don't need to check the script
        } else if (exists) {
          expect(getRecorderScript()).to.not.be.null; // recorder script should exist
        } else {
          expect(getRecorderScript()).to.be.null; // recorder script should not exist
        }
      };

      this.waitForFetchCalls = async function (numCalls) {
        await untilDone(() => {
          return this.fetchStub.getCalls().length === numCalls;
        });
        await mixpanel.recordertest.__get_recorder().__flushPromise;
      };

      this.waitForRecorderEnqueue = async function () {
        await this.clock.tickAsync(250);
        await mixpanel.recordertest.__get_recorder().activeRecording.__enqueuePromise;
      };

      this.waitForRecordingStarted = async function () {
        await untilDone(() => Object.keys(mixpanel.recordertest.get_session_recording_properties()).length > 0);
      };

      if (IS_RECORDER_BUNDLED) {
        this.waitForRecorderLoad = async function () {
          this.randomStub.restore();
          await this.waitForRecordingStarted();
        };
      } else {
        this.waitForRecorderLoad = async function () {
          await untilDone(() => Boolean(getRecorderScript()));
          this.assertRecorderScript(true);
          await new Promise(resolve => {
            this.randomStub.restore();
            if (window[RECORDER_GLOBAL_NAME]) {
              resolve();
            } else {
              getRecorderScript().addEventListener(`load`, resolve);
            }
          });
          await this.waitForRecordingStarted();
        };
      }
    });

    afterEach(async function () {
      await mixpanel.recordertest.stop_session_recording();

      sinon.restore();

      if (!IS_RECORDER_BUNDLED) {
        resetExternalLibrary(RECORDER_GLOBAL_NAME, 'mixpanel-recorder');
      }
      window.location.hash = ``;
    });


    it(`adds script tag when sampled`, async function () {
      this.randomStub.returns(0.02);
      this.initMixpanelRecorder({record_sessions_percent: 2});
      await this.waitForRecorderLoad();
      // initial two rrweb captured events: meta and full snapshots
      await this.waitForRecorderEnqueue();
      await mixpanel.recordertest.stop_session_recording();
      await this.waitForFetchCalls(1);
    // let last flush through so it doesn't leak into next test
    });

    it(`does not add script tag when not sampled`, async function () {
      this.randomStub.returns(0.02);
      this.initMixpanelRecorder({record_sessions_percent: 1});

      await new Promise(resolve => realSetTimeout(resolve, 100));
      this.assertRecorderScript(false);
    });

    it(`sends recording payload to server`, async function () {
      // set hash to test $current_url logic without reloading test page
      window.location.hash = `my-url-1`;
      this.randomStub.returns(0.02);
      this.initMixpanelRecorder({record_sessions_percent: 10});

      await this.waitForRecorderLoad();
      window.location.hash = `my-url-2`;
      simulateMouseClick(document.body);
      await this.waitForRecorderEnqueue();

      await this.clock.tickAsync(10 * 1000);
      await this.waitForFetchCalls(1);

      expect(this.fetchStub.getCalls().length).to.equal(1, `one batch fetch request made every ten seconds`);
      const fetchCall1 = this.fetchStub.getCall(0);
      const callArgs1 = fetchCall1.args;
      const body1 = callArgs1[1].body;
      expect(body1.constructor).to.equal(Blob, `request body is a Blob`);

      const urlParams1 = validateAndGetUrlParams(fetchCall1);
      expect(urlParams1.get(`seq`)).to.equal(`0`);
      expect(urlParams1.get(`$current_url`)).to.match(/#my-url-1$/, `includes the current url from when we started recording`);
      expect(urlParams1.get(`replay_start_url`)).to.match(/#my-url-1$/, `includes the start url from when we started recording`);
      expect(urlParams1.get(`mp_lib`)).to.equal(`web`);

      simulateMouseClick(document.body);
      await this.waitForRecorderEnqueue();

      await this.clock.tickAsync(10 * 1000);
      await this.waitForFetchCalls(2);

      expect(this.fetchStub.getCalls().length).to.equal(2, `one batch fetch request made every ten seconds`);
      const fetchCall2 = this.fetchStub.getCall(1);
      const callArgs2 = fetchCall2.args;
      const body2 = callArgs2[1].body;
      expect(body2.constructor).to.equal(Blob, `request body is a Blob`);

      const urlParams2 = validateAndGetUrlParams(fetchCall2);
      expect(urlParams2.get(`seq`)).to.equal(`1`);
      expect(urlParams2.get(`$current_url`)).to.match(/#my-url-2$/, `url is updated at the start of this batch`);
      expect(urlParams2.get(`replay_start_url`)).to.match(/#my-url-1$/, `start url does not change in later batches`);

      await mixpanel.recordertest.stop_session_recording();
    });

    it(`can get replay properties when recording is active`, async function () {
      this.randomStub.restore();
      this.initMixpanelRecorder();
      expect(Object.keys(mixpanel.recordertest.get_session_recording_properties()).length).to.equal(0, `no recording is taking place`);
      mixpanel.recordertest.start_session_recording();

      await this.waitForRecorderLoad();
      await this.waitForRecorderEnqueue();

      expect(Boolean(mixpanel.recordertest.get_session_recording_properties()[`$mp_replay_id`])).to.be.true;
      await mixpanel.recordertest.stop_session_recording();
      await this.clock.tickAsync(10 * 1000);
      await this.waitForFetchCalls(1);
    });

    it(`can get replay link when recording is active`, async function () {
      this.randomStub.restore();
      this.initMixpanelRecorder();
      expect(mixpanel.recordertest.get_session_replay_url()).to.be.null;

      mixpanel.recordertest.start_session_recording();
      await this.waitForRecorderLoad();
      await this.waitForRecorderEnqueue();

      const replay_url = new URL(mixpanel.recordertest.get_session_replay_url());
      expect(replay_url.hostname).to.equal(`mixpanel.com`);
      expect(replay_url.pathname).to.equal(`/projects/replay-redirect`);
      expect(replay_url.searchParams.get(`token`)).to.equal(this.token);
      expect(replay_url.searchParams.get(`replay_id`)).to.exist;
      expect(replay_url.searchParams.get(`distinct_id`)).to.exist;

      await mixpanel.recordertest.stop_session_recording();
      await this.clock.tickAsync(10 * 1000);
      await this.waitForFetchCalls(1);
    });

    it(`can manually start a session recording`, async function () {
      this.randomStub.returns(0.02);
      this.initMixpanelRecorder({record_sessions_percent: 1});
      this.assertRecorderScript(false);

      await this.clock.tickAsync(20 * 1000);
      expect(this.fetchStub.getCalls().length).to.equal(0, `no /record call has been made since the user did not fall into the sample.`);
      mixpanel.recordertest.start_session_recording();
      await this.waitForRecorderLoad();

      simulateMouseClick(document.body);
      await this.waitForRecorderEnqueue();
      await this.clock.tickAsync(10 * 1000);
      await this.waitForFetchCalls(1);

      expect(this.fetchStub.getCalls().length).to.equal(1, `one batch fetch request made every ten seconds`);
      expect(this.fetchStub.getCall(0).args[0]).to.match(/^https:\/\/api-js\.mixpanel\.com\/record\//);
    });

    it(`can manually stop a session recording`, async function () {
      this.randomStub.returns(0.02);
      this.initMixpanelRecorder({record_sessions_percent: 10});
      await this.waitForRecorderLoad();

      simulateMouseClick(document.body);
      await this.waitForRecorderEnqueue();
      await this.clock.tickAsync(10 * 1000);
      await this.waitForFetchCalls(1);

      const fetchCall1 = this.fetchStub.getCall(0);
      expect(this.fetchStub.getCalls().length).to.equal(1, `one batch fetch request made every ten seconds`);
      expect(fetchCall1.args[0].startsWith(`https://api-js.mixpanel.com/record/`)).to.be.true;

      simulateMouseClick(document.body);
      await this.clock.tickAsync(2 * 1000);
      await this.waitForRecorderEnqueue();

      await mixpanel.recordertest.stop_session_recording();
      await this.waitForFetchCalls(2);

      const fetchCall2 = this.fetchStub.getCall(1);
      if (fetchCall2) {
        expect(this.fetchStub.getCalls().length).to.equal(2, `flushes the events up to the point that the recording was stopped`);
        expect(fetchCall2.args[0].startsWith(`https://api-js.mixpanel.com/record/`)).to.be.true;

        simulateMouseClick(document.body);
        await this.clock.tickAsync(20 * 1000);
      }

      await new Promise(resolve => realSetTimeout(resolve, 2));
      expect(this.fetchStub.getCalls().length).to.equal(2, `no more fetch requests after recording is stopped`);
    });

    it(`respects tracking opt-out when sampled`, function () {
      this.randomStub.returns(0.02);
      this.initMixpanelRecorder({record_sessions_percent: 10, window: {navigator: {doNotTrack: `1`}}});

      this.assertRecorderScript(false);
      expect(Object.keys(mixpanel.recordertest.get_session_recording_properties()).length).to.equal(0, `no recording is taking place`);
    });

    it(`respects tracking opt-out when manually triggered`, function () {
      this.randomStub.returns(0.02);
      this.initMixpanelRecorder({record_sessions_percent: 10, window: {navigator: {doNotTrack: `1`}}});

      this.assertRecorderScript(false);
      mixpanel.recordertest.start_session_recording();
      this.assertRecorderScript(false);
      expect(Object.keys(mixpanel.recordertest.get_session_recording_properties()).length).to.equal(0, `no recording is taking place`);
    });

    it(`respects tracking opt-out after recording started`, async function () {
      this.randomStub.returns(0.02);
      this.initMixpanelRecorder({record_sessions_percent: 10});

      await this.waitForRecorderLoad();
      simulateMouseClick(document.body);
      await this.waitForRecorderEnqueue();
      await this.clock.tickAsync(10 * 1000);
      await this.waitForFetchCalls(1);

      expect(this.fetchStub.getCalls().length).to.equal(1, `one batch fetch request made every ten seconds`);
      simulateMouseClick(document.body);
      await this.clock.tickAsync(2 * 1000);

      simulateMouseClick(document.body);
      mixpanel.recordertest.opt_out_tracking();
      simulateMouseClick(document.body);
      await this.clock.tickAsync(10 * 1000);

      await untilDone(() => Object.keys(mixpanel.recordertest.get_session_recording_properties()).length === 0);
      expect(this.fetchStub.getCalls().length).to.equal(1, `no /record calls made after user has opted out.`);
      expect(Object.keys(mixpanel.recordertest.get_session_recording_properties()).length).to.equal(0, `no recording is taking place`);
      await mixpanel.recordertest.stop_session_recording();
    });

    it(`retries record request after a 500`, async function () {
      this.randomStub.returns(0.02);
      this.initMixpanelRecorder({record_sessions_percent: 10});

      this.responseBlobStub = sinon.stub(window.Response.prototype, `blob`);
      this.responseBlobStub.returns(Promise.resolve(new Blob()));
      this.fetchStub.onFirstCall()
        .returns(makeFakeFetchResponse(200))
        .onSecondCall()
        .returns(makeFakeFetchResponse(500));

      await this.waitForRecorderLoad();
      simulateMouseClick(document.body);
      await this.waitForRecorderEnqueue();
      await this.clock.tickAsync(10 * 1000);
      await this.waitForFetchCalls(1);

      expect(this.fetchStub.getCalls().length).to.equal(1, `one batch fetch request made every ten seconds`);
      let urlParams = validateAndGetUrlParams(this.fetchStub.getCall(0));
      expect(urlParams.get(`seq`)).to.equal(`0`, `sends first sequence`);
      simulateMouseClick(document.body);
      await this.waitForRecorderEnqueue();
      await this.clock.tickAsync(10 * 1000);
      await this.waitForFetchCalls(2);

      expect(this.fetchStub.getCalls().length).to.equal(2, `one batch fetch request made every ten seconds`);
      urlParams = validateAndGetUrlParams(this.fetchStub.getCall(1));
      expect(urlParams.get(`seq`)).to.equal(`1`, `2nd sequence fails`);
      await this.clock.tickAsync(20 * 2000);
      await this.waitForFetchCalls(3);

      expect(this.fetchStub.getCalls().length).to.equal(3, `record request is retried after a 500`);
      validateAndGetUrlParams(this.fetchStub.getCall(2));
      expect(urlParams.get(`seq`)).to.equal(`1`, `2nd sequence is retried`);

      await mixpanel.recordertest.stop_session_recording();
    });

    it(`retries record requests when offline`, async function () {
      const onlineStub = sinon.stub(window.navigator, `onLine`).value(false);
      const compressionStreamStub = sinon.stub(window, `CompressionStream`).value(undefined);

      this.randomStub.returns(0.02);
      this.initMixpanelRecorder({ record_sessions_percent: 10 });

      this.responseBlobStub = sinon.stub(window.Response.prototype, `blob`);
      this.responseBlobStub.returns(Promise.resolve(new Blob()));
      this.fetchStub.onCall(0)
        .returns(Promise.reject(new TypeError(`Failed to fetch`)))
        .onCall(1)
        .returns(makeFakeFetchResponse(200));

      let fetchBody = null;

      await this.waitForRecorderLoad();
      simulateMouseClick(document.body);
      await this.waitForRecorderEnqueue();
      await this.clock.tickAsync(10 * 1000);
      await this.waitForFetchCalls(1);

      expect(this.fetchStub.getCalls().length).to.equal(1, `one batch fetch request made every ten seconds`);
      const urlParams = validateAndGetUrlParams(this.fetchStub.getCall(0));
      expect(urlParams.get(`seq`)).to.equal(`0`, `first sequence fails because we're offline`);
      fetchBody = this.fetchStub.getCall(0).args[1].body;

      await this.clock.tickAsync(20 * 1000);
      await this.waitForFetchCalls(2);

      const fetchCall1 = this.fetchStub.getCall(1);
      const urlParamsRetry = validateAndGetUrlParams(fetchCall1);
      expect(urlParamsRetry.get(`seq`)).to.equal(`0`, `first sequence is retried with exponential backoff`);
      expect(fetchBody).to.equal(fetchCall1.args[1].body, `fetch body should be the same as the first request`);

      onlineStub.restore();
      compressionStreamStub.restore();
      await mixpanel.recordertest.stop_session_recording();
    });

    it(`halves batch size and retries record request after a 413`, async function () {
      this.randomStub.returns(0.02);

      this.blobConstructorSpy = sinon.spy(window, `Blob`);
      this.responseBlobStub = sinon.stub(window.Response.prototype, `blob`);
      this.responseBlobStub.returns(Promise.resolve(new Blob()));

      this.fetchStub.onCall(0)
        .returns(makeFakeFetchResponse(200))
        .onCall(1)
        .returns(makeFakeFetchResponse(413))
        .onCall(2)
        .returns(makeFakeFetchResponse(200))
        .onCall(3)
        .returns(makeFakeFetchResponse(200));

      this.initMixpanelRecorder({ record_sessions_percent: 10 });

      await this.waitForRecorderLoad();
      simulateMouseClick(document.body);
      await this.waitForRecorderEnqueue();
      await this.clock.tickAsync(10 * 1000);
      await this.waitForFetchCalls(1);

      expect(this.fetchStub.getCalls().length).to.equal(1, `one batch fetch request made every ten seconds`);
      const urlParams = validateAndGetUrlParams(this.fetchStub.getCall(0));
      expect(urlParams.get(`seq`)).to.equal(`0`);

      for (let i = 0; i < 1000; i++) {
        simulateMouseClick(document.body);
      }
      await this.waitForRecorderEnqueue();
      await this.clock.tickAsync(10 * 1000);
      await this.waitForFetchCalls(2);

      expect(this.fetchStub.getCalls().length).to.equal(2, `one batch fetch request made every ten seconds`);
      const urlParamsBatch = validateAndGetUrlParams(this.fetchStub.getCall(1));
      expect(urlParamsBatch.get(`seq`)).to.equal(`1`);

      const events = JSON.parse(this.blobConstructorSpy.lastCall.args[0][0]);
      expect(events.length).to.equal(1000);

      await this.clock.tickAsync(10 * 1000);
      await this.waitForFetchCalls(4);

      expect(this.fetchStub.getCalls().length).to.equal(4, `record request is retried after a 413 and subsequently flushes the rest of events`);

      const urlParamsRetry1 = validateAndGetUrlParams(this.fetchStub.getCall(2));
      expect(urlParamsRetry1.get(`seq`)).to.equal(`1`);

      const urlParamsRetry2 = validateAndGetUrlParams(this.fetchStub.getCall(3));
      expect(urlParamsRetry2.get(`seq`)).to.equal(`2`);

      const numBlobCalls = this.blobConstructorSpy.getCalls().length;
      expect(JSON.parse(this.blobConstructorSpy.getCall(numBlobCalls - 2).args[0][0]).length).to.equal(500, `first batch request was halved`);
      expect(JSON.parse(this.blobConstructorSpy.getCall(numBlobCalls - 1).args[0][0]).length).to.equal(500, `second batch request was halved`);

      await this.clock.tickAsync(20 * 1000);
      expect(this.fetchStub.getCalls().length).to.equal(4, `all events are flushed, no more requests are made`);

      await mixpanel.recordertest.stop_session_recording();
      this.blobConstructorSpy.restore();
    });

    it(`respects minimum session length setting`, async function () {
      this.randomStub.returns(0.02);
      this.initMixpanelRecorder({ record_sessions_percent: 10, record_min_ms: 8000 });

      await this.waitForRecorderLoad();
      simulateMouseClick(document.body);
      await this.waitForRecorderEnqueue();
      await this.clock.tickAsync(5 * 1000);

      await mixpanel.recordertest.stop_session_recording();
      await this.clock.tickAsync(5 * 1000);

      expect(this.fetchStub.getCalls().length).to.equal(0, `does not flush events if session is too short`);
      await this.clock.tickAsync(20 * 1000);

      await new Promise(resolve => realSetTimeout(resolve, 2));
      expect(this.fetchStub.getCalls().length).to.equal(0, `no fetch requests after recording is stopped`);
    });

    it(`continues recording across SDK loads`, async function () {
      this.randomStub.returns(0.02);
      this.initMixpanelRecorder({ record_sessions_percent: 10 });

      let replayId;

      await this.waitForRecorderLoad();
      mixpanel.recordertest.identify(`guy`);
      simulateMouseClick(document.body);
      await this.waitForRecorderEnqueue();
      await this.clock.tickAsync(10 * 1000);
      await this.waitForFetchCalls(1);

      expect(this.fetchStub.getCalls().length).to.equal(1, `one batch fetch request made every ten seconds`);
      const fetchCall1 = this.fetchStub.getCall(0);
      const urlParams1 = validateAndGetUrlParams(fetchCall1);
      expect(urlParams1.get(`seq`)).to.equal(`0`);
      replayId = urlParams1.get(`replay_id`);

      simulateMouseClick(document.body);

      mixpanel.recordertest.pause_session_recording();
      delete mixpanel[`recordertest`];
      window.sessionStorage.removeItem(`mp_gen_new_tab_id_recordertest_RECORDER_TEST_TOKEN`);

      if (!IS_RECORDER_BUNDLED) {
        resetExternalLibrary(RECORDER_GLOBAL_NAME, 'mixpanel-recorder');
      }

      await this.clock.tickAsync(500);

      this.initMixpanelRecorder();
      await this.waitForRecorderLoad();
      await this.waitForRecordingStarted();
      await this.waitForRecorderEnqueue();
      await this.clock.tickAsync(10 * 1000);
      await this.waitForFetchCalls(2);

      expect(this.fetchStub.getCalls().length).to.equal(2, `one batch fetch request made every ten seconds`);
      const fetchCall2 = this.fetchStub.getCall(1);
      const urlParams2 = validateAndGetUrlParams(fetchCall2);
      expect(urlParams2.get(`seq`)).to.equal(`1`);
      expect(replayId).to.equal(urlParams2.get(`replay_id`));

      await mixpanel.recordertest.stop_session_recording();
    });

    it(`resets recording session after idle timeout`, async function () {
      this.randomStub.restore();
      this.initMixpanelRecorder({ record_idle_timeout_ms: 60 * 1000 });
      mixpanel.recordertest.start_session_recording();

      this.responseBlobStub = sinon.stub(window.Response.prototype, `blob`);
      this.responseBlobStub.returns(Promise.resolve(new Blob()));
      this.fetchStub.onFirstCall()
        .returns(makeFakeFetchResponse(200))
        .onSecondCall()
        .returns(makeFakeFetchResponse(200));

      let replayId1 = null;

      await this.waitForRecorderLoad();
      await this.waitForRecorderEnqueue();
      await this.clock.tickAsync(10 * 1000);
      await this.waitForFetchCalls(1);

      expect(this.fetchStub.getCalls().length).to.equal(1, `one batch fetch request made every ten seconds`);
      const urlParams = validateAndGetUrlParams(this.fetchStub.getCall(0));
      expect(urlParams.get(`seq`)).to.equal(`0`, `sends first sequence`);
      replayId1 = urlParams.get(`replay_id`);

      await this.clock.tickAsync(61 * 1000);
      await this.waitForRecorderEnqueue();

      document.body.appendChild(document.createElement(`div`));
      await this.waitForRecorderEnqueue();
      await this.clock.tickAsync(10 * 1000);

      expect(this.fetchStub.getCalls().length).to.equal(1, `still just the one fetch request, mutation is ignored`);
      simulateMouseClick(document.body);

      await this.waitForFetchCalls(2);
      expect(this.fetchStub.getCalls().length).to.equal(2, `starts sending record requests again after user activity`);
      const urlParamsRetry = validateAndGetUrlParams(this.fetchStub.getCall(1));
      expect(urlParamsRetry.get(`seq`)).to.equal(`0`, `resets to first sequence`);
      const replayId2 = urlParamsRetry.get(`replay_id`);
      expect(replayId1).to.not.equal(replayId2, `replay id is different after reset`);

      await mixpanel.recordertest.stop_session_recording();
    });

    it(`handles race condition where the recording resets while a request is in flight`, async function () {
      if (!IS_RECORDER_BUNDLED) {
        this.clock.restore();
        this.clock = sinon.useFakeTimers(this.startTime, {
          toFake: [`setTimeout`, `clearTimeout`, `setInterval`, `clearInterval`]
        });
      }

      this.randomStub.returns(0.02);

      this.initMixpanelRecorder({ record_sessions_percent: 10 });
      this.randomStub.restore(); // restore the random stub after script is loaded for batcher uuid dedupe

      this.responseBlobStub = sinon.stub(window.Response.prototype, `blob`);
      this.responseBlobStub.returns(Promise.resolve(new Blob()));
      this.fetchStub
        .onFirstCall().returns(makeDelayedFetchResponse(200, {}, 5 * 1000))
        .onSecondCall().returns(makeFakeFetchResponse(200));

      let replayId1;

      await this.waitForRecorderLoad();
      await this.waitForRecorderEnqueue();

      var stopRecordingPromise = mixpanel.recordertest.stop_session_recording();

      await this.waitForFetchCalls(1);

      expect(this.fetchStub.getCalls().length).to.equal(1, `flushed events after stopping recording`);
      const urlParams = validateAndGetUrlParams(this.fetchStub.getCall(0));
      expect(urlParams.get(`seq`)).to.equal(`0`, `sends first sequence`);

      if (!IS_RECORDER_BUNDLED) {
        expect(urlParams.get(`replay_start_time`)).to.equal((this.startTime / 1000).toString(), `sends the right start time`);
      } else {
        expect(true).to.be.true; // cannot test replay_start_time when recorder is bundled
      }

      replayId1 = urlParams.get(`replay_id`);
      expect(replayId1).to.not.equal(String(null), `replay id is not null`);

      // start recording again while the first replay's request is in flight
      mixpanel.recordertest.start_session_recording();
      await this.waitForRecordingStarted();

      simulateMouseClick(document.body);
      await this.waitForRecorderEnqueue();

      await this.clock.tickAsync(15 * 1000);
      await this.waitForFetchCalls(2);

      const urlParams2 = validateAndGetUrlParams(this.fetchStub.getCall(1));
      expect(urlParams2.get(`seq`)).to.equal(`0`, `new replay uses the first sequence`);

      if (!IS_RECORDER_BUNDLED) {
        const expectedStartTimeMs = this.startTime + 250; // we waited for the first recording to enqueue (250ms throttle) before starting the second one
        expect(urlParams2.get(`replay_start_time`)).to.equal((expectedStartTimeMs / 1000).toString(), `sends the right start time`);
      } else {
        expect(true).to.be.true; // cannot test replay_start_time when recorder is bundled
      }

      const replayId2 = urlParams2.get(`replay_id`);
      expect(replayId2).to.not.equal(String(null), `replay id is not null`);
      expect(replayId1).to.not.equal(replayId2, `replay id is different after reset`);
      await stopRecordingPromise;
      await mixpanel.recordertest.stop_session_recording();
    });

    it(`changes replay_id on reset()`, async function () {
      this.randomStub.restore();
      this.initMixpanelRecorder({ record_sessions_percent: 100 });

      const distinctId = mixpanel.recordertest.get_distinct_id();
      this.responseBlobStub = sinon.stub(window.Response.prototype, `blob`);
      this.responseBlobStub.returns(Promise.resolve(new Blob()));
      this.fetchStub.onFirstCall()
        .returns(makeFakeFetchResponse(200))
        .onSecondCall()
        .returns(makeFakeFetchResponse(200));

      let replayId1 = null;

      await this.waitForRecorderLoad();
      await this.waitForRecorderEnqueue();

      mixpanel.recordertest.reset();
      await this.waitForRecorderLoad();

      await this.waitForFetchCalls(1);

      expect(this.fetchStub.getCalls().length).to.equal(1, `one batch fetch request made every ten seconds`);
      const calledURL1 = this.fetchStub.getCall(0).args[0];
      const paramsStr1 = calledURL1.split(`?`)[1];
      const urlParams1 = new URLSearchParams(paramsStr1);

      expect(urlParams1.get(`seq`)).to.equal(`0`, `sends first sequence`);
      expect(urlParams1.get(`distinct_id`)).to.equal(distinctId, `distinct_id is set`);
      replayId1 = urlParams1.get(`replay_id`);

      document.body.appendChild(document.createElement(`div`));
      await this.waitForRecorderEnqueue();
      await this.clock.tickAsync(10 * 1000);

      await this.waitForFetchCalls(2);

      expect(this.fetchStub.getCalls().length).to.equal(2, `Starts sending record requests again after user activity`);
      const calledURL2 = this.fetchStub.getCall(1).args[0];
      const paramsStr2 = calledURL2.split(`?`)[1];
      const urlParams2 = new URLSearchParams(paramsStr2);

      expect(urlParams2.get(`seq`)).to.equal(`0`, `resets to first sequence`);
      const replayId2 = urlParams2.get(`replay_id`);
      expect(replayId1).to.not.equal(replayId2, `replay id is different after reset`);
      expect(urlParams2.get(`distinct_id`)).to.not.equal(distinctId, `distinct_id is different after reset`);

      await mixpanel.recordertest.stop_session_recording();
    });

    it(`includes console logs in recording payload`, async function () {
      // set hash to test $current_url logic without reloading test page
      window.location.hash = `my-url-1`;
      this.randomStub.returns(0.02);
      this.initMixpanelRecorder({ record_sessions_percent: 10, record_console: true });
      this.blobConstructorSpy = sinon.spy(window, `Blob`);

      await this.waitForRecorderLoad();
      window.location.hash = `my-url-2`;
      simulateMouseClick(document.body);
      document.defaultView.console.log(`test console log message`);
      await this.waitForRecorderEnqueue();

      await this.clock.tickAsync(10 * 1000);
      await this.waitForFetchCalls(1);

      expect(this.fetchStub.getCalls().length).to.equal(1, `one batch fetch request made every ten seconds`);
      const fetchCall1 = this.fetchStub.getCall(0);

      const events = JSON.parse(this.blobConstructorSpy.lastCall.args[0][0]);

      // Find events by type instead of relying on order
      const metaEvent = events.find(e => e.type === 4);
      const fullSnapshotEvent = events.find(e => e.type === 2);
      const incrementalSnapshotEvent = events.find(e => e.type === 3);
      const consoleEvent = events.find(e => e.type === 6 && e.data?.plugin?.includes(`console`));

      expect(metaEvent).to.exist;
      expect(fullSnapshotEvent).to.exist;
      expect(incrementalSnapshotEvent).to.exist;
      expect(consoleEvent).to.exist;

      expect(consoleEvent.data.plugin.includes(`console`)).to.be.true;
      expect(consoleEvent.data.payload.level).to.equal(`log`, `console event has the correct level`);
      expect(consoleEvent.data.payload.payload).to.deep.equal([`"test console log message"`], `console event has the correct message`);
      expect(consoleEvent.data.payload.trace.length).to.be.greaterThan(0, `console event has a stack trace`);

      const urlParams1 = validateAndGetUrlParams(fetchCall1);
      expect(urlParams1.get(`seq`)).to.equal(`0`);
      expect(urlParams1.get(`$current_url`)).to.match(/#my-url-1$/, `includes the current url from when we started recording`);
      expect(urlParams1.get(`replay_start_url`)).to.match(/#my-url-1$/, `includes the start url from when we started recording`);
      expect(urlParams1.get(`mp_lib`)).to.equal(`web`);

      simulateMouseClick(document.body);
      await this.waitForRecorderEnqueue();

      await this.clock.tickAsync(10 * 1000);
      await this.waitForFetchCalls(2);

      expect(this.fetchStub.getCalls().length).to.equal(2, `one batch fetch request made every ten seconds`);
      const fetchCall2 = this.fetchStub.getCall(1);

      const urlParams2 = validateAndGetUrlParams(fetchCall2);
      expect(urlParams2.get(`seq`)).to.equal(`1`);
      expect(urlParams2.get(`$current_url`)).to.match(/#my-url-2$/, `url is updated at the start of this batch`);
      expect(urlParams2.get(`replay_start_url`)).to.match(/#my-url-1$/, `start url does not change in later batches`);

      this.blobConstructorSpy.restore();
      await mixpanel.recordertest.stop_session_recording();
    });
  });
}
