## 模块概览

TODO

## 基础示例

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



## 相关链接

https://nodejs.org/api/dgram.html