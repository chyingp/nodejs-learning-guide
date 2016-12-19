// Start reading from stdin so we don't exit.
process.stdin.resume();

process.on('SIGINT', function() {
  console.log('Got SIGINT.  Press Control-D to exit.');
});