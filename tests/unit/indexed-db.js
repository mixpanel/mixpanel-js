import { expect } from 'chai';

import sinon from 'sinon';
import { window } from '../../src/window';
import { IDBStorageWrapper, RECORDING_REGISTRY_STORE_NAME } from '../../src/storage/indexed-db';
import { setupFakeIDB } from './test-utils/indexed-db';

describe(`Recorder`, function() {
  /**
   * @type {IDBStorageWrapper}
   */
  let idbWrapper;

  setupFakeIDB();

  beforeEach( function() {
    // all the stores are key/value for now, so just use one of the stores supported in mixpanelBrowserDb
    idbWrapper = new IDBStorageWrapper(RECORDING_REGISTRY_STORE_NAME);
  });

  afterEach(function () {
    sinon.restore();
  });

  it(`can get and set items`, async function() {
    await idbWrapper.init();
    await idbWrapper.setItem(`test-key`, {foo: `bar`});
    const value = await idbWrapper.getItem(`test-key`);

    expect(value).to.eql({foo: `bar`});
  });

  it(`can get all items`, async function() {
    await idbWrapper.init();
    await idbWrapper.setItem(`test-key-1`, {foo: `bar`});
    await idbWrapper.setItem(`test-key-2`, {baz: `qux`});
    const values = await idbWrapper.getAll();

    expect(values).to.eql([{foo: `bar`}, {baz: `qux`}]);
  });

  it(`can remove items`, async function() {
    await idbWrapper.init();
    await idbWrapper.setItem(`test-key`, {foo: `bar`});
    const value = await idbWrapper.getItem(`test-key`);
    expect(value).to.eql({foo: `bar`});
    await idbWrapper.removeItem(`test-key`);

    const valueAfterRemove = await idbWrapper.getItem(`test-key`);
    expect(valueAfterRemove).to.be.undefined;
  });

  it(`reopens DB on a closed conection error`, async function() {
    await idbWrapper.init();
    const transactionStub = sinon.stub(window.IDBDatabase.prototype, `transaction`)
      .onCall(0).throws(`InvalidStateError`);
    transactionStub.callThrough();

    await idbWrapper.setItem(`test-key`, {foo: `bar`});
    const value = await idbWrapper.getItem(`test-key`);
    expect(value).to.eql({foo: `bar`});
    expect(transactionStub.callCount).to.equal(3);
  });
});
