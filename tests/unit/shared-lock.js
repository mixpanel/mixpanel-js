import { expect, use as chaiUse } from 'chai';

import localStorage from 'localStorage';
import sinon from 'sinon';

import { acquireLockForPid } from './lock-test-utils';
import { SharedLock } from '../../src/shared-lock';

const START_TIME = 200000;
const TIMEOUT_MS = 1000;

describe(`SharedLock`, function() {
  let clock = null;
  let sharedLock;

  beforeEach(function() {
    if (clock) {
      clock.restore();
    }
    clock = sinon.useFakeTimers(START_TIME);
    localStorage.clear();
    sharedLock = new SharedLock(`some-key`, {storage: localStorage, timeoutMS: TIMEOUT_MS});
  });

  afterEach(function() {
    if (clock) {
      clock.restore();
    }
    clock = null;
  });

  it(`stores the given key and options`, function() {
    expect(sharedLock.storageKey).to.equal(`some-key`);
    expect(sharedLock.timeoutMS).to.equal(TIMEOUT_MS);
  });

  describe(`withLock()`, function() {
    it(`runs the given code`, async function() {
      const sharedArray = [];
      sharedLock.withLock(async function() {
        sharedArray.push(`A`);
      });

      const secondLockPromise = sharedLock.withLock(async function() {
        sharedArray.push(`B`);
        expect(sharedArray).to.eql([`A`, `B`]);
      });

      await clock.tickAsync(200);
      await secondLockPromise;
    });

    it(`waits for previous acquirer to release lock`, async function() {
      const sharedArray = [];

      acquireLockForPid(sharedLock, `foobar`);

      // this should block until 'foobar' process releases below
      const firstLockPromise = sharedLock.withLock(async function() {
        sharedArray.push(`B`);
        expect(sharedArray).to.eql([`A`, `B`]);
      });

      // 'foobar' process
      sharedLock.withLock(async function() {
        sharedArray.push(`A`);
      }, `foobar`);

      await clock.tickAsync(1000);
      await firstLockPromise;
    });

    it(`clears the lock when one caller does not release it`, async function() {
      acquireLockForPid(sharedLock, `foobar`);

      const startTime = Date.now();
      const lockPromise = sharedLock.withLock(function() {
        expect(Date.now() - startTime).to.be.above(TIMEOUT_MS);
      });

      await clock.tickAsync(TIMEOUT_MS * 2);
      await lockPromise;
    });

    it(`throws an error in the outer promise chain when not handled by lockedCB`, async function() {
      const error = new Error(`test error`);

      let caughtError = null;
      const lockPromise = sharedLock.withLock(function() {
        throw error;
      }).catch(function (err) {
        caughtError = err;
      });

      await clock.tickAsync(1000);
      await lockPromise;

      expect(caughtError).to.equal(error);
    });

    context(`when localStorage.setItem breaks`, function() {
      afterEach(function() {
        localStorage.setItem.restore();
      });

      it(`runs error callback immediately if setItem throws`, async function() {
        sinon.stub(localStorage, `setItem`).throws(`localStorage disabled`);

        let caughtError = null;
        await sharedLock.withLock(() => Promise.resolve()).catch(function (err) {
          caughtError = err;
        });

        expect(String(caughtError)).to.equal(`Error: localStorage support check failed`);
      });

      it(`runs error callback immediately if setItem silently fails`, async function() {
        sinon.stub(localStorage, `setItem`).callsFake(function() {
          // Does nothing, but doesn't throw either. (Yes, this behavior has been
          // observed in the wild thanks to monkeypatching...)
        });

        let caughtError = null;
        await sharedLock.withLock(() => Promise.resolve()).catch(err => {
          caughtError = err;
        });

        expect(String(caughtError)).to.equal(`Error: localStorage support check failed`);
      });

      it(`runs error callback quickly if setItem starts failing mid-acquisition`, async function() {
        sinon.stub(localStorage, `setItem`)
          .withArgs(`some-key:Y`, `mypid`)
          .onCall(0).returns(null)
          .onCall(1).callsFake(function() {
            // now break it for every call, as though it just got disabled
            localStorage.setItem.restore();
            sinon.stub(localStorage, `setItem`).returns(null);
          });
        localStorage.setItem.callThrough();

        let caughtError = null;
        const lockPromise = sharedLock.withLock(() => Promise.resolve(), `mypid`).catch(err => {
          caughtError = err;
        });

        await clock.tickAsync(1000);
        await lockPromise;

        expect(String(caughtError)).to.equal(`Error: localStorage support dropped while acquiring lock`);
      });
    });
  });
});
