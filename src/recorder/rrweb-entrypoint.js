// this file exists as an entry point to be able to transpile rrweb packages to es5
// compatible code without needing to transpile the entire mixpanel-js codebase
import {record, EventType, IncrementalSource} from '@mixpanel/rrweb';
import {classMatchesRegex} from '@mixpanel/rrweb-snapshot';
import {getRecordConsolePlugin} from '@mixpanel/rrweb-plugin-console-record';

export { record, EventType, IncrementalSource, getRecordConsolePlugin, classMatchesRegex };
