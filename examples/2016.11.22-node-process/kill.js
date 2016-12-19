process.on('SIGHUP', () => {
  console.log('Got SIGHUP signal.');
});

setTimeout(function(){
	console.log('Exiting.');
}, 0);

console.log('hello');

process.kill(process.pid, 'SIGHUP');

console.log('world');