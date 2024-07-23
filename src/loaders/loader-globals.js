/* eslint camelcase: "off" */
import { init_from_snippet } from '../mixpanel-core';
import {loadAsync} from './bundle-loaders';

init_from_snippet(loadAsync);
