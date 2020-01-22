import { expect } from 'chai';
import localStorage from 'localStorage';

import { RequestQueue } from '../../src/request-queue';

describe(`RequestQueue`, function() {
  let queue;

  beforeEach(function() {
    localStorage.clear();
    queue = new RequestQueue(`fake-rq-key`, {storage: localStorage});
  });

  it(`initializes a mutex with the same key`, function() {
    expect(queue.storageKey).to.equal(`fake-rq-key`);
    expect(queue.lock.storageKey).to.equal(`fake-rq-key`);
  });
});
