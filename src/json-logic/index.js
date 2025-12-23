// Entry point for json-logic bundle - exports to window global for async loading
import * as jsonLogic from 'json-logic-js';
import { window } from '../window';

window['__mp_json_logic'] = jsonLogic;
