import { expect } from 'chai';
import localStorage from 'localStorage';
import sinon from 'sinon';

import { acquireLockForPid } from './lock-test-utils';
import { SharedLock } from '../../src/shared-lock';

describe(`SharedLock`, function() {
  let sharedLock;

  beforeEach(function() {
    localStorage.clear();
    sharedLock = new SharedLock(`some-key`, {storage: localStorage, timeoutMS: 1000});
  });

  it(`stores the given key and options`, function() {
    expect(sharedLock.storageKey).to.equal(`some-key`);
    expect(sharedLock.timeoutMS).to.equal(1000);
  });

  describe(`withLock()`, function() {
    it(`runs the given code`, function(done) {
      const sharedArray = [];
      sharedLock.withLock(function() {
        sharedArray.push(`A`);
      });
      sharedLock.withLock(function() {
        sharedArray.push(`B`);
        expect(sharedArray).to.eql([`A`, `B`]);
        done();
      });
    });

    it(`waits for previous acquirer to release lock`, function(done) {
      const sharedArray = [];

      acquireLockForPid(sharedLock, `foobar`);

      // this should block until 'foobar' process releases below
      sharedLock.withLock(function() {
        sharedArray.push(`B`);
        expect(sharedArray).to.eql([`A`, `B`]);
        done();
      });

      // 'foobar' process
      sharedLock.withLock(function() {
        sharedArray.push(`A`);
      }, `foobar`);
    });

    it(`clears the lock when one caller does not release it`, function(done) {
      acquireLockForPid(sharedLock, `foobar`);

      const startTime = Date.now();
      sharedLock.withLock(function() {
        expect(Date.now() - startTime).to.be.above(1000); // timeout MS
        done();
      });
    });

    context(`when localStorage.setItem breaks`, function() {
      afterEach(function() {
        localStorage.setItem.restore();
      });

      it(`throws immediately if setItem throws`, function() {
        sinon.stub(localStorage, `setItem`).throws(`localStorage disabled`);
        expect(() => sharedLock.withLock()).to.throw(`localStorage support check failed`);
      });

      it(`throws immediately if setItem silently fails`, function() {
        sinon.stub(localStorage, `setItem`).callsFake(function() {
          // Does nothing, but doesn't throw either. (Yes, this behavior has been
          // observed in the wild thanks to monkeypatching...)
        });
        expect(() => sharedLock.withLock()).to.throw(`localStorage support check failed`);
      });

      it(`throws quickly if setItem starts failing mid-acquisition`, function() {
        sinon.stub(localStorage, `setItem`)
          .withArgs(`some-key:Y`, `mypid`)
          .callsFake(function() {
            // now break it for every call, as though it just got disabled
            localStorage.setItem.restore();
            sinon.stub(localStorage, `setItem`).returns(null);
          });
        localStorage.setItem.callThrough();
        expect(function() {
          sharedLock.withLock(function() {}, `mypid`);
        }).to.throw(`localStorage support dropped while acquiring lock`);
      });
    });
  });
});
