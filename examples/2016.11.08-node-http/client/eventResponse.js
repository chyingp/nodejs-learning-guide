var http = require('http');

var url = 'http://id.qq.com/';

var client = http.get(url, function(res){
    console.log('1. response event');
});

client.on('response', function(res){
    console.log('2. response event');
});

client.end();