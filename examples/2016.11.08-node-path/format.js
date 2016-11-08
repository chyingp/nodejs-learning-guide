var path = require('path');

var p1 = path.format({
	root: '/tmp/', 
	base: 'hello.js'
});
console.log( p1 ); // 输出 /tmp/hello.js

var p2 = path.format({
	dir: '/tmp', 
	name: 'hello',
	ext: '.js'
});
console.log( p2 );  // 输出 /tmp/hello.js