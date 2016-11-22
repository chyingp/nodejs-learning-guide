/*
	➜  process git:(master) ✗ node chdir.js 
	Starting directory: /Users/a/Documents/git-code/git-blog/demo/2015.05.21-node-basic/process
	New directory: /private/tmp
 */
// 切换当前的工作目录
console.log('Starting directory: ' + process.cwd());
try {
  process.chdir('/tmp');
  console.log('New directory: ' + process.cwd());
}
catch (err) {
  console.log('chdir: ' + err);
}
