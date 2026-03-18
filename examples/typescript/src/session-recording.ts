import mixpanel from '../../../dist/mixpanel-with-async-recorder.cjs.js';

mixpanel.init("FAKE_TOKEN", {
    debug: true,
    loaded: function() {
        console.log("Mixpanel with async recorder loaded successfully with TypeScript");
    },
    remote_settings_mode: 'fallback',

    // session recording config
    record_block_class: 'mp-sensitive',
    record_block_selector: '.do-not-record',
    record_collect_fonts: true,
    record_idle_timeout_ms: 1800000,
    record_inline_images: false,
    record_mask_text_class: 'mp-mask',
    record_mask_text_selector: ['.mask-me', '.also-mask-me'],
    record_unmask_text_selector: '.safe-to-show',
    record_mask_all_text: false,
    record_mask_input_selector: '.sensitive-input',
    record_unmask_input_selector: '.public-input',
    record_mask_all_inputs: true,
    record_min_ms: 3000,
    record_max_ms: 86400000,
    record_sessions_percent: 50,
    record_canvas: true,
    record_heatmap_data: true,

    // network recording config
    record_console: true,
    record_network: true,
    record_network_options: {
        initiatorTypes: ['fetch', 'xmlhttprequest', 'img', 'link'],
        ignoreRequestUrls: ['https://example.com/ignore-this-url'],
        ignoreRequestFn: function(data) {
            return data.responseHeaders?.['content-type'] === 'image/png';
        },
        recordHeaders: {
            request: ['content-type'],
            response: ['content-type', 'x-custom-header']
        },
        recordBodyUrls: {
            request: ['https://example.com/record-body'],
            response: ['https://example.com/record-body']
        },
        recordInitialRequests: true
    }
});

// start and stop session recording manually
mixpanel.start_session_recording();
mixpanel.stop_session_recording();

// get session recording properties to attach to events
const replayProps = mixpanel.get_session_recording_properties();
mixpanel.track('Event With Replay', {
    source: 'typescript-example',
    ...replayProps
});

// get a URL to view the session replay in Mixpanel
const replayUrl: string = mixpanel.get_session_replay_url();
console.log('Session replay URL:', replayUrl);
