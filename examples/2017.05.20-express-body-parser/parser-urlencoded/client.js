var http = require('http');
var querystring = require('querystring');

var options = {
    hostname: '127.0.0.1',
    port: '3000',
    path: '/test',
    method: 'POST',
    headers: {
        'Content-Type': 'form/x-www-form-urlencoded',
        'Content-Encoding': 'identity'
    }
};

var postBody = { nick: 'chyingp' };

var client = http.request(options, (res) => {
    res.pipe(process.stdout);
});

client.end( querystring.stringify(postBody) );