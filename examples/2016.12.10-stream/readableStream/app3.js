var fs = require('fs');

fs.readFile('./sample.txt', 'utf8', function(err, content){
	// 文件读取完成，文件内容是 [你好，我是程序猿小卡]
	console.log('文件读取完成，文件内容是 [%s]', content);
});
