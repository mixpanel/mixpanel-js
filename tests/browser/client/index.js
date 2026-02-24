import {trackTests} from './suites/track';
import {batchRequestsTests} from './suites/batchRequests';
import {recorderTests} from './suites/recorder';
import {flagsTests} from './suites/flags';

export {trackTests, batchRequestsTests, recorderTests, flagsTests};

export const ALL_TESTS = [
  trackTests,
  batchRequestsTests,
  recorderTests,
  flagsTests,
];
