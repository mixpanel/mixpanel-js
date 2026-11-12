import {sharedPreviewTests} from './suites/sharedPreviews';
import {visualExperimentsTests} from './suites/visualExperiments';
import {trackTests} from './suites/track';
import {batchRequestsTests} from './suites/batchRequests';
import {recorderTests} from './suites/recorder';
import {flagsTests} from './suites/flags';
import {remoteSettingsTests} from './suites/remoteSettings';
import {bundleCompatTests} from './suites/bundleCompat';
import {autocaptureTests} from './suites/autocapture';
import {domTrackersTests} from './suites/domTrackers';
import {gdprTests} from './suites/gdpr';
import {consentRequiredTests} from './suites/consentRequired';
import {disablePersistenceTests} from './suites/disablePersistence';

export {trackTests, batchRequestsTests, recorderTests, flagsTests, remoteSettingsTests, bundleCompatTests, domTrackersTests, gdprTests, consentRequiredTests, disablePersistenceTests};

export const ALL_TESTS = [
  trackTests,
  batchRequestsTests,
  autocaptureTests,
  recorderTests,
  flagsTests,
  sharedPreviewTests,
  visualExperimentsTests,
  remoteSettingsTests,
  bundleCompatTests,
  domTrackersTests,
  gdprTests,
  consentRequiredTests,
  disablePersistenceTests,
];
