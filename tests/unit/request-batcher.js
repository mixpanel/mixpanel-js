import { expect } from 'chai';
import localStorage from 'localStorage';

import { RequestBatcher } from '../../src/request-batcher';

describe(`RequestBatcher`, function() {
  let batcher;

  beforeEach(function() {
    localStorage.clear();
    batcher = new RequestBatcher(`fake-rb-key`, `/fake-track/`, {
      libConfig: {
        batch_size: 50,
      },
      storage: localStorage,
    });
  });

  it(`initializes successfully`, function() {
    expect(true).to.be.ok;
  });
});
