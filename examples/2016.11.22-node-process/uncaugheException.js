// 如果异常触发，且没有被任何的try、catch捕获
// node进程就会抛出 uncaughtException
// 如果开发者没有监听 uncaughtException，那么，就
// 1、打印异常的堆栈信息
// 2、触发exit退出
function example1(){
	function external(){
		throw(new Error('catch me'));
		console.log('hello world');
	}

	function internal(){
		external();
	}

	internal();
}

// 如果监听了 uncaughtException，那么
// 1、默认的错误堆栈信息打印会被取消
// 2、进程不会退出
function example2(){
	
	process.on('uncaughtException', function(err){
		console.log('Caught exception: ' + err);
	});

	function external(){
		throw(new Error('catch me'));
		console.log('hello world');  // 这行代码不会运行
	}

	function internal(){
		external();
	}

	internal();
}

example2();