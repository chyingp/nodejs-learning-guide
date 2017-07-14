var https = require('https');
var fs = require('fs');

var key = fs.readFileSync('./ca/chyingp.key');
console.log(key);

var options = {
    key: fs.readFileSync('./ca/chyingp.key'),
    cert: fs.readFileSync('./ca/chyingp.cert')
};

var server = https.createServer(options, function (req, res) {
    res.end('ok');
});

server.listen(443);