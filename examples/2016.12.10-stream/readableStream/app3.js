var fs = require('fs');

fs.readFile('./sample.txt', 'utf8', function(err, content){
	console.log('文件读取完成，文件内容是\n[%s]', content);
});
