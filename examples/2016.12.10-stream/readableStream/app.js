var fs = require('fs');

var onEnd = function(){
	process.stdout.write(']');	
};

var fileStream = fs.createReadStream('./sample.txt');
fileStream.on('end', onEnd)

fileStream.pipe(process.stdout);

process.stdout.write('文件读取完成，文件内容是[');

// 文件读取完成，文件内容是[你好，我是程序猿小卡]