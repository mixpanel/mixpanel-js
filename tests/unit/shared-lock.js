import { expect } from 'chai';

import { SharedLock } from '../../src/shared-lock';

describe(`SharedLock`, function() {
  it(`initializes without blowing up`, function() {
    const myLock = new SharedLock(`some-key`, {storage: `foobar`});
    expect(myLock.storageKey).to.equal(`some-key`);
  });
});
