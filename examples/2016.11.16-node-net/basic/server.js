var net = require('net');

var PORT = 8989;
var HOST = '127.0.0.1';

// tcp服务端
var server = net.createServer(function(socket){
    console.log('服务端：收到来自客户端的请求');

    socket.on('data', function(data){
        console.log('服务端：收到客户端数据，内容为{'+ data +'}');

        // 给客户端返回数据
        socket.write('你好，我是服务端');
    });

    socket.on('close', function(){
         console.log('服务端：客户端连接断开');
    });
});
server.listen(PORT, HOST, function(){
    console.log('服务端：开始监听来自客户端的请求');
});