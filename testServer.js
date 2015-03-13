var express = require('express')
var cookieParser = require('cookie-parser')
var app = express()

app.use(cookieParser())

app.use('/tests', express.static(__dirname+"/tests"));
app.use( express.static(__dirname+"/js"));

app.get('/tests/cookie_included/:cookieName', function (req, res) {
    console.log(JSON.stringify(req.cookies));
    if (req.cookies && req.cookies[req.params.cookieName]){
        res.json(1);
    }
    else{
        res.json(0);
    }
});

var server = app.listen(3000, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);

});