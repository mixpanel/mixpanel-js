import { window } from '../window';
import { RECORDER_GLOBAL_NAME } from '../globals';
import { MixpanelRecorder } from './recorder';

window[RECORDER_GLOBAL_NAME] = MixpanelRecorder;
