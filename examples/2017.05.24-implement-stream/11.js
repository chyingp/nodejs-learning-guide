var through = require('through');

function write (chunk) {
    console.log('write: %s', chunk);
}

function end () {
    console.log('end');
}

process.stdin.pipe(through(write, end));

// npm install --save through
// (echo abc; sleep 1; echo def) | node 11.js

// write: abc

// write: def

// end