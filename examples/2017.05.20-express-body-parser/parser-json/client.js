var http = require('http');
var querystring = require('querystring');

var options = {
    hostname: '127.0.0.1',
    port: '3000',
    path: '/test',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Encoding': 'identity'
    }
};

var jsonBody = {
    nick: 'chyingp'
};

var client = http.request(options, (res) => {
    res.pipe(process.stdout);
});

client.end( JSON.stringify(jsonBody) );