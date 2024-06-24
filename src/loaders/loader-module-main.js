/* eslint camelcase: "off" */
import '../recorder/index.js';

import {init_as_module} from '../mixpanel-core.js';
import {loadAsync} from './bundle-loaders.js';

var mixpanel = init_as_module(loadAsync);

export default mixpanel;
