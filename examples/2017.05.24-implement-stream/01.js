var Readable = require('stream').Readable;
var r = new Readable;

r.push('beep ');
r.push('boop\n ');
r.push(null);

r.pipe(process.stdout);