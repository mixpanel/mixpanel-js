import {trackTests} from './suites/track';
import {batchRequestsTests} from './suites/batchRequests';
import {recorderTests} from './suites/recorder';
import {targetingTests} from './suites/targeting';

export {trackTests, batchRequestsTests, recorderTests, targetingTests};

export const ALL_TESTS = [
  trackTests,
  batchRequestsTests,
  recorderTests,
  targetingTests,
];
