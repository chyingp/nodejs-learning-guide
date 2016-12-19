/*
	0: --harmony
 */
process.execArgv.forEach(function(val, index, array) {
  console.log(index + ': ' + val);
});

/*
	0: node
	1: /Users/a/Documents/git-code/git-blog/demo/2015.05.21-node-basic/process/execArgv.js
	2: --version
 */

process.argv.forEach(function(val, index, array) {
  console.log(index + ': ' + val);
});