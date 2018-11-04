## 模块概览

dgram模块是对UDP socket的一层封装，相对net模块简单很多，下面看例子。

## UDP客户端 vs UDP服务端

首先，启动UDP server，监听来自端口33333的请求。

**server.js**

```js
// 例子：UDP服务端
var PORT = 33333;
var HOST = '127.0.0.1';

var dgram = require('dgram');
var server = dgram.createSocket('udp4');

server.on('listening', function () {
    var address = server.address();
    console.log('UDP Server listening on ' + address.address + ":" + address.port);
});

server.on('message', function (message, remote) {
    console.log(remote.address + ':' + remote.port +' - ' + message);
});

server.bind(PORT, HOST);
```


然后，创建UDP socket，向端口33333发送请求。

**client.js**

```js
// 例子：UDP客户端
var PORT = 33333;
var HOST = '127.0.0.1';

var dgram = require('dgram');
var message = Buffer.from('My KungFu is Good!');

var client = dgram.createSocket('udp4');

client.send(message, PORT, HOST, function(err, bytes) {
    if (err) throw err;
    console.log('UDP message sent to ' + HOST +':'+ PORT);
    client.close();
});
```

运行 server.js。

```bash
node server.js
```

运行 client.js。

```bash
➜  2016.12.22-dgram git:(master) ✗ node client.js 
UDP message sent to 127.0.0.1:33333
```

服务端打印日志如下

```bash
UDP Server listening on 127.0.0.1:33333
127.0.0.1:58940 - My KungFu is Good!
```

## 广播

通过dgram实现广播功能很简单，服务端代码如下。

```js
var dgram = require('dgram');
var server = dgram.createSocket('udp4');
var port = 33333;

server.on('message', function(message, rinfo){
    console.log('server got message from: ' + rinfo.address + ':' + rinfo.port);
});

server.bind(port);
```

接着创建客户端，向地址'255.255.255.255:33333'进行广播。

```js
var dgram = require('dgram');
var client = dgram.createSocket('udp4');
var msg = Buffer.from('hello world');
var port = 33333;
var host = '255.255.255.255';

client.bind(function(){
    client.setBroadcast(true);
    client.send(msg, port, host, function(err){
        if(err) throw err;
        console.log('msg has been sent');
        client.close();
    });
});
```

运行程序，最终服务端打印日志如下

```bash
➜  2016.12.22-dgram git:(master) ✗ node broadcast-server.js
server got message from: 192.168.0.102:61010
```

## 相关链接

https://nodejs.org/api/dgram.html
