// since es6 imports are static and we run unit tests from the console, window won't be defined when importing this file
var win;
if (typeof(window) === 'undefined') {
    var loc = {
        hostname: ''
    };
    win = {
        navigator: { userAgent: '', onLine: true },
        document: {
            location: loc,
            referrer: ''
        },
        screen: { width: 0, height: 0 },
        location: loc
    };
} else {
    win = window;
}

export { win as window };
