import {trackTests} from './suites/track';
import {batchRequestsTests} from './suites/batchRequests';
import {recorderTests} from './suites/recorder';
import {flagsTests} from './suites/flags';
import {remoteSettingsTests} from './suites/remoteSettings';
import {bundleCompatTests} from './suites/bundleCompat';

export {trackTests, batchRequestsTests, recorderTests, flagsTests, remoteSettingsTests, bundleCompatTests};

export const ALL_TESTS = [
  trackTests,
  batchRequestsTests,
  recorderTests,
  flagsTests,
  remoteSettingsTests,
  bundleCompatTests,
];
