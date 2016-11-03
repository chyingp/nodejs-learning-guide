var fs = require('fs');
var zlib = require('zlib');

var input = "hello world";
var output = zlib.gzipSync(input);

console.log('gziped content: ' + output);

var out = zlib.gunzipSync(output);

console.log('guziped content: ' + out);