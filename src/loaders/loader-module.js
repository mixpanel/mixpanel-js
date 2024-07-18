/* eslint camelcase: "off" */
import '../recorder';

import { init_as_module } from '../mixpanel-core';
import { loadNoop } from './bundle-loaders';

var mixpanel = init_as_module(loadNoop);

export default mixpanel;
