import { expect } from 'chai';

import sinon from 'sinon';
import { window } from '../../src/window';
import { IDBStorageWrapper } from '../../src/storage/indexed-db';
import {
  MIXPANEL_BROWSER_DB_NAME,
  RECORDING_REGISTRY_STORE_NAME,
  RECORDER_VERSION_DATA,
} from '../../src/recorder/idb-config';
import { setupFakeIDB } from './test-utils/indexed-db';

describe(`IDBStorageWrapper`, function() {
  /**
   * @type {IDBStorageWrapper}
   */
  let idbWrapper;

  setupFakeIDB();

  beforeEach( function() {
    // all the stores are key/value for now, so just use one of the stores supported in mixpanelBrowserDb
    idbWrapper = new IDBStorageWrapper(MIXPANEL_BROWSER_DB_NAME, RECORDING_REGISTRY_STORE_NAME, RECORDER_VERSION_DATA);
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

  describe(`createIfMissing: false`, function() {
    const existingOnly = () => new IDBStorageWrapper(
      MIXPANEL_BROWSER_DB_NAME, RECORDING_REGISTRY_STORE_NAME, RECORDER_VERSION_DATA, {createIfMissing: false}
    );
    // a database whose creation was aborted is left at version 0, which browsers' databases() leaves
    // out (IndexedDB spec, IDBFactory.databases()) and fake-indexeddb's doesn't
    const databaseNames = async () => (await window.indexedDB.databases())
      .filter(database => database.version !== 0)
      .map(database => database.name);

    it(`opens a database the device has`, async function() {
      await idbWrapper.init();
      await idbWrapper.setItem(`drop`, {n: 1});

      const existing = existingOnly();
      await existing.init();
      await existing.removeItem(`drop`);

      expect(await idbWrapper.getItem(`drop`)).to.be.undefined;
    });

    it(`creates no database, without opening one the browser doesn't list`, async function() {
      const open = sinon.spy(window.indexedDB, `open`);

      let rejected = false;
      await existingOnly().init().catch(() => { rejected = true; });

      expect(rejected).to.equal(true);
      expect(open.called).to.equal(false);
      expect(await databaseNames()).to.deep.equal([]);
    });

    it(`creates no database in a browser that can't list them`, async function() {
      const databases = window.indexedDB.databases;
      window.indexedDB.databases = undefined;

      let rejected = false;
      await existingOnly().init().catch(() => { rejected = true; });

      window.indexedDB.databases = databases;
      expect(rejected).to.equal(true);
      expect(await databaseNames()).to.deep.equal([]);
    });
  });
});
