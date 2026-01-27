'use strict';

const express      = require('express');
const cookieParser = require('cookie-parser');
const logger       = require('morgan');

const app = express();

// Test suite definitions
const TEST_SUITES = {
    'dev': {
        name: 'Development Build',
        description: 'Unminified library for easier debugging',
        customLibUrl: './static/build/mixpanel.js',
        snippetUrl: './static/src/loaders/mixpanel-jslib-snippet.js',
        testUrl: './static/build/test/browser/snippet-test.js'
    },
    'minified': {
        name: 'Minified Build',
        description: 'Production build (closure compiled, served via Mixpanel CDN)',
        customLibUrl: './static/build/mixpanel.min.js',
        snippetUrl: './static/build/mixpanel-jslib-snippet.min.test.js',
        testUrl: './static/build/test/browser/snippet-test.js'
    },
    'module-cjs': {
        name: 'CommonJS Module',
        description: 'Node.js compatible module (served via npm install)',
        testUrl: './static/build/test/browser/module-cjs-test.js'
    }
};

app.use(cookieParser());
app.use(logger('dev'));

app.set('views', __dirname + '/tests');
app.set('view engine', 'pug');

app.use('/tests', express.static(__dirname + "/tests"));
app.get('/tests/cookie_included/:cookieName', function(req, res) {
    if (req.cookies && req.cookies[req.params.cookieName]) {
        res.json(1);
    } else {
        res.json(0);
    }
});
app.use(express.static(__dirname));
app.get('/', function(req, res) {
    res.redirect(301, '/tests/new');
});

app.get('/tests/new', function(req, res) {
    res.render('directory.pug', { testSuites: TEST_SUITES });
});

app.use('/tests/new/static', express.static(__dirname));

// register routes for each test suite
for (const [suiteId, suite] of Object.entries(TEST_SUITES)) {
    app.get('/tests/new/' + suiteId, function(req, res) {
        res.render('integration.pug', {
            suiteName: suite.name,
            customLibUrl: suite.customLibUrl,
            snippetUrl: suite.snippetUrl,
            testUrl: suite.testUrl
        });
    });
}

const server = app.listen(3001, function () {
    console.log(`Mixpanel test app listening on port ${server.address().port}`);
});
