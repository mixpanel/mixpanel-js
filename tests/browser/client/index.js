import {trackTests} from './suites/track';
import {batchRequestsTests} from './suites/batchRequests';
import {recorderTests} from './suites/recorder';

export {trackTests, batchRequestsTests, recorderTests};

export const ALL_TESTS = [
  trackTests,
  batchRequestsTests,
  recorderTests,
];
