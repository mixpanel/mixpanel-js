// since es6 imports are static and we run unit tests from the console, window won't be defined when importing this file
var win;
if (typeof(window) === 'undefined') {
    var loc = {
        hostname: ''
    };
    win = {
        crypto: {randomUUID: function() {throw Error('unsupported');}},
        navigator: { userAgent: '', onLine: true },
        document: {
            createElement: function() { return {}; },
            location: loc,
            referrer: ''
        },
        screen: { width: 0, height: 0 },
        location: loc,
        addEventListener: function() {},
        removeEventListener: function() {}
    };
} else {
    win = window;
}

export { win as window };
