/* eslint camelcase: "off" */
import {init_as_module} from '../mixpanel-core.js';
import {loadThrowError} from './bundle-loaders.js';

var mixpanel = init_as_module(loadThrowError);

export default mixpanel;
