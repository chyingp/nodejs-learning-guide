var net = require('net');
var opt = {
	host: '127.0.0.1',
	port: '3000'
};

var client = net.connect(opt, function(){
	console.log('连接上服务端啦');
	client.write('你好服务端');  // 可写
});

// 可读
client.on('data', function(data){
	console.log('收到来自服务端的数据%s', data);
	client.end();
});