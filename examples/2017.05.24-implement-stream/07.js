var Writable = require('stream').Writable;
var w = new Writable;

w._write = function (chunk, enc, next) {
    console.log(chunk);
    next();
};

process.stdin.pipe(w);

// ➜  2017.05.24-implement-stream git:(master) ✗ (echo beep; sleep 1; echo boop) | node 07.js
// <Buffer 62 65 65 70 0a>
// <Buffer 62 6f 6f 70 0a>