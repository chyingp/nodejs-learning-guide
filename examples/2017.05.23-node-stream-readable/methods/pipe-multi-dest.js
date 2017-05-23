var fs = require('fs');
var r = fs.createReadStream('./hello.txt');
var z = require('zlib').createGzip();
var w = fs.createWriteStream('./hello.txt.gz');

r.pipe(z).pipe(w);