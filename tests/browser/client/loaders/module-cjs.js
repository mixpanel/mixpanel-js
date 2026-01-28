/* global chai */

const { expect } = chai;

import { ALL_TESTS } from "..";
import { testMixpanel } from "../runTests";
import mixpanel from '../../../../build/mixpanel.cjs.js';

testMixpanel(mixpanel, ALL_TESTS);

describe(`window test`, () => {
  it(`does not attach a mixpanel object to window`, () => {
    expect(window.mixpanel).to.not.be.ok;
  });
});
