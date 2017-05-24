process.stdin.on('data', function (buf) {
    console.log(buf);
});
process.stdin.on('end', function () {
    console.log('__END__');
});

// ➜  2017.05.24-implement-stream git:(master) ✗ (echo beep; sleep 1; echo boop) | node 08.js
// <Buffer 62 65 65 70 0a>
// <Buffer 62 6f 6f 70 0a>
// __END__