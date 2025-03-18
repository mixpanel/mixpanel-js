import sinon from 'sinon';

export function setupRrwebMock() {
  const stopSpy = sinon.spy();
  const recordStub = sinon.stub();
  recordStub.returns(stopSpy);

  const emit = async (type, source = null, timestamp = new Date().getTime()) => {
    const rrwebOptions = recordStub.getCall(0).args[0];
    const data = {};
    if (source) {
      data.source = source;
    }

    const ev = {type, timestamp, data};
    rrwebOptions.emit(ev);
  };

  return {recordStub, stopSpy, emit};
}
