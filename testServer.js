'use strict';

const express      = require('express');
const cookieParser = require('cookie-parser');
const logger       = require('morgan');
const { PARENT_PORT, CHILD_PORT } = require('./tests/browser/test-ports');

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
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set('views', __dirname + '/tests');
app.set('view engine', 'pug');

// ========================================
// Test API endpoints for network plugin tests
// ========================================

// Main test endpoint - handles all HTTP methods
app.all('/api/test', function(req, res) {
    res.json({
        success: true,
        method: req.method,
        headers: req.headers,
        query: req.query,
        body: req.body,
        url: req.originalUrl,
        timestamp: Date.now()
    });
});

// Form submission endpoint
app.post('/api/test/form', function(req, res) {
    res.json({
        success: true,
        method: 'POST',
        contentType: req.get('Content-Type'),
        formData: req.body,
        timestamp: Date.now()
    });
});

// Endpoint with custom response headers
app.get('/api/test/headers', function(req, res) {
    res.set({
        'X-Custom-Header': 'custom-value',
        'X-Request-Id': 'test-request-123'
    });
    res.json({
        success: true,
        message: 'Response includes custom headers'
    });
});

// Error response endpoint
app.get('/api/test/error/:status', function(req, res) {
    const status = parseInt(req.params.status, 10) || 500;
    res.status(status).json({ success: false, status: status });
});

// Session recording endpoint (mimics Mixpanel's /record API)
app.post(/^\/record\/.*/, express.raw({ type: '*/*', limit: '10mb' }), function(req, res) {
    res.json({ code: 200, status: 'OK' });
});

// ========================================

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

    // Cross-origin child iframe page for session recording tests
    app.get('/tests/new/' + suiteId + '-cross-origin-page', function(req, res) {
        res.render('cross-origin-page.pug', {
            testUrl: './static/build/test/browser/cross-origin-page.js'
        });
    });
}

const server = app.listen(PARENT_PORT, function () {
    console.log(`Mixpanel test app listening on port ${server.address().port}`);
});

// Second port for cross-origin iframe tests
const server2 = app.listen(CHILD_PORT, function () {
    console.log(`Mixpanel cross-origin test server listening on port ${server2.address().port}`);
});
