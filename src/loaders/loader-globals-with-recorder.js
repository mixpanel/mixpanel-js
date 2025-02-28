/* eslint camelcase: "off" */
import '../recorder';

import { init_from_snippet } from '../mixpanel-core';
import { loadNoop } from './bundle-loaders';

init_from_snippet(loadNoop);
