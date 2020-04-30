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

      it(`runs error callback immediately if setItem throws`, function(done) {
        sinon.stub(localStorage, `setItem`).throws(`localStorage disabled`);
        sharedLock.withLock(function() {}, function(err) {
          expect(String(err)).to.equal(`Error: localStorage support check failed`);
          done();
        });
      });

      it(`runs error callback immediately if setItem silently fails`, function(done) {
        sinon.stub(localStorage, `setItem`).callsFake(function() {
          // Does nothing, but doesn't throw either. (Yes, this behavior has been
          // observed in the wild thanks to monkeypatching...)
        });
        sharedLock.withLock(function() {}, function(err) {
          expect(String(err)).to.equal(`Error: localStorage support check failed`);
          done();
        });
      });

      it(`runs error callback quickly if setItem starts failing mid-acquisition`, function(done) {
        sinon.stub(localStorage, `setItem`)
          .withArgs(`some-key:Y`, `mypid`)
          .onCall(0).returns(null)
          .onCall(1).callsFake(function() {
            // now break it for every call, as though it just got disabled
            localStorage.setItem.restore();
            sinon.stub(localStorage, `setItem`).returns(null);
          });
        localStorage.setItem.callThrough();

        sharedLock.withLock(function() {}, function(err) {
          expect(String(err)).to.equal(`Error: localStorage support dropped while acquiring lock`);
          done();
        }, `mypid`);
      });
    });
  });
});
