import { expect } from 'chai';
import localStorage from 'localStorage';

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
  });
});
