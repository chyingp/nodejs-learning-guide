// 参考：https://nodejs.org/docs/latest-v0.12.x/api/process.html#process_event_beforeexit
// 这段代码是有问题的，每当进程要退出（before exit）
// 就会调用setTimeout，导致死循环
process.on('beforeExit', function(code){
	setTimeout(function(){
		console.log('process exits with code: ' + code);
	}, 2000);
});