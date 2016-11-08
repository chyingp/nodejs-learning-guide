var path = require('path');

var p1 = path.relative('/data/orandea/test/aaa', '/data/orandea/impl/bbb');
console.log(p1);	// 输出 "../../impl/bbb"

var p2 = path.relative('/data/demo', '/data/demo');
console.log(p2);	// 输出 ""

var p3 = path.relative('/data/demo', '');
console.log(p3);	// 输出 "../../Users/a/Documents/git-code/nodejs-learning-guide/examples/2016.11.08-node-path"