/*
 * Unit tests for the SessionRecording module, excluding the rrweb dependency.
 */

import { expect } from 'chai';
import { SessionRecording } from '../../src/recorder/session-recording';
import sinon from 'sinon';

describe(`SessionRecording`, function() {
  beforeEach(function() {
    const mockMixpanelInstance = {
      'get_distinct_id': () => `test-distinct-id`,
      'get_config': () => ({
        token: `test-token`,
        'record_sessions_percent': 100,
        'record_min_ms': 0,
        'record_max_ms': 24 * 60 * 60 * 1000,
        'record_idle_timeout_ms': 30 * 60 * 1000,
      }),
    };
    this.replayId = `test-replay-id`;

    this.onIdleTimeoutSpy = sinon.spy();
    this.onMaxLengthReachedSpy = sinon.spy();

    this.rrwebStopSy = sinon.spy();
    this.rrwebRecordStub = sinon.stub();
    this.rrwebRecordStub.returns(this.rrwebStopSy);

    this.sessionRecording = new SessionRecording({
      mixpanelInstance: mockMixpanelInstance,
      replayId: this.replayId,
      onIdleTimeout: this.onIdleTimeoutSpy,
      onMaxLengthReached: this.onMaxLengthReachedSpy,
      rrwebRecord: this.rrwebRecordStub,
    });
    this.flushSpy = sinon.spy(this.sessionRecording.batcher, `flush`);
  });

  afterEach(function () {
    sinon.restore();
  });

  it(`can start and stop recording`, function() {
    this.sessionRecording.startRecording();
    expect(this.rrwebRecordStub.calledOnce).to.be.true;
    expect(this.sessionRecording.isRrwebStopped()).to.be.false;

    this.sessionRecording.stopRecording();
    expect(this.rrwebStopSy.calledOnce).to.be.true;
    expect(this.sessionRecording.isRrwebStopped()).to.be.true;
  });

  it(`flushes the batcher when stopRecording is called`, function() {
    this.sessionRecording.startRecording();
    expect(this.flushSpy.calledOnce).to.be.true;

    this.sessionRecording.stopRecording();
    expect(this.flushSpy.calledTwice).to.be.true;
  });

  it(`still flushes the batcher when stopRecording throws an error`, function() {
    this.rrwebRecordStub.returns(function () {
      throw new Error(`test error`);
    });

    this.sessionRecording.startRecording();
    expect(this.flushSpy.calledOnce).to.be.true;

    this.sessionRecording.stopRecording();
    expect(this.flushSpy.calledTwice).to.be.true;
  });

  it(`does not start batcher and timeouts when rrweb silently fails (returns undefined)`, function() {
    this.rrwebRecordStub.returns(undefined);
    this.sessionRecording.startRecording();

    expect(this.flushSpy.calledOnce).to.be.false;
    expect(this.sessionRecording.batcher.stopped).to.be.true;
    expect(this.sessionRecording.idleTimeoutId).to.be.null;
    expect(this.sessionRecording.maxTimeoutId).to.be.null;
  });
});
