var Readable = require('stream').Readable;
var r = new Readable;

var c = 97;

r._read = function () {
    r.push(String.fromCharCode(c++));
    if(c > 'z'.charCodeAt(0)) r.push(null);
};

r.pipe(process.stdout);
