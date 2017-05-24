var concat = require('concat-stream');
process.stdin.pipe(concat(function (body) {
    console.log(body.toString());
}));

// npm install --save concat-stream
// (echo '{"nick": "chyingp"}') | node 10.js

// {"nick": "chyingp"}