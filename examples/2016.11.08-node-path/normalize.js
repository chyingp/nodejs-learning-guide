var path = require('path');

var index = 0;

var compare = function(desc, callback){
	console.log('[用例%d]：%s', ++index, desc);
	callback();
	console.log('\n');
};

compare('路径为空', function(){
	// 输出 .
	console.log( path.normalize('') );
});

compare('路径结尾是否带/', function(){
	// 输出 /tmp/demo/js/upload
	console.log( path.normalize('/tmp/demo/js/upload') );

	// /tmp/demo/js/upload/
	console.log( path.normalize('/tmp/demo/js/upload/') );
});

compare('重复的/', function(){
	// 输出 /tmp/demo/js
	console.log( path.normalize('/tmp/demo//js') );
});

compare('路径带..', function(){
	// 输出 /tmp/demo/js
	console.log( path.normalize('/tmp/demo/js/upload/..') );
});

compare('相对路径', function(){
	// 输出 demo/js/upload/
	console.log( path.normalize('./demo/js/upload/') );

	// 输出 demo/js/upload/
	console.log( path.normalize('demo/js/upload') );
});

compare('不常用边界', function(){
	// 输出 ..
	console.log( path.normalize('./..') );

	// 输出 ..
	console.log( path.normalize('..') );

	// 输出 ../
	console.log( path.normalize('../') );

	// 输出 /
	console.log( path.normalize('/../') );
	
	// 输出 /
	console.log( path.normalize('/..') );
});
