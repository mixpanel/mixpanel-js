import { bootstrap_sdk } from './mixpanel-core';

bootstrap_sdk({
    global_context: window,
    mixpanel: window['mixpanel'],
    init_type: 'snippet'
});
