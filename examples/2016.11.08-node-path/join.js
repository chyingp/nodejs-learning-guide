var path = require('path');

// 输出 '/foo/bar/baz/asdf'
path.join('/foo', 'bar', 'baz/asdf', 'quux', '..');

/* 伪代码如下
module.exports.join = function(){
	var paths = Array.prototye.slice.call(arguments, 0);
	return this.normalize( paths.join('/') );
};
*/