var util = require('util');
var foo = function(){
	console.log('foo');
};

var foo2 = util.deprecate(foo, 'foo is deprecate');

foo2();