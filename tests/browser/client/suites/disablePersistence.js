/* global chai, sinon */

const { expect } = chai;
import { clearAllLibInstances, clearAllStorage, putIDBValue, randName, realSetTimeout } from "../utils";
import { FLAGS_STORE_NAME } from "../../../../src/flags/flags-persistence";

export function disablePersistenceTests(mixpanel) {
  describe(`disable_persistence`, function() {
    let token;

    beforeEach(async () => {
      token = randName();
      await clearAllStorage();
    });

    afterEach(async () => {
      sinon.restore();
      await clearAllLibInstances(mixpanel);
    });

    [`cookie`, `localStorage`].forEach(persistence => {
      it(`makes no calls to browser storage APIs with ${persistence} persistence`, async () => {
        // a database from an earlier page, which the SDK mustn't open either
        await putIDBValue(FLAGS_STORE_NAME, `unrelated`, {});
        const idbOpenSpy = sinon.spy(window.indexedDB, `open`);
        const localStorageSetItemSpy = sinon.spy(localStorage, `setItem`);
        const sessionStorageSetItemSpy = sinon.spy(sessionStorage, `setItem`);
        const originalCookie = document.cookie;

        mixpanel.init(token, {
          persistence,
          batch_requests: false,
          disable_persistence: true,
        }, `test`);
        await new Promise(resolve => realSetTimeout(resolve, 500));

        expect(idbOpenSpy.callCount, `IDB opens`).to.equal(0);
        expect(localStorageSetItemSpy.callCount, `localStorage writes`).to.equal(0);
        expect(sessionStorageSetItemSpy.callCount, `sessionStorage writes`).to.equal(0);
        expect(document.cookie).to.equal(originalCookie);
      });
    });

    it(`stores no tab ID`, () => {
      mixpanel.init(token, {batch_requests: false, disable_persistence: true}, `test`);

      expect(mixpanel.test.get_tab_id()).to.equal(null);
      expect(Object.keys(sessionStorage)).to.have.lengthOf(0);
    });
  });
}
