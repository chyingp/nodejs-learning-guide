## 模块概览

nodejs的精华所在，无需赘言。

## 先来个例子

在下面这个简单的例子里，涉及了4个实例

* http.Server：http.createServer() 的返回值
* http.ClientRequest：http.get() 的返回值
* http.IncomingMessage：其实 server 例子里的 serverReq，以及 client 例子里的 clientRes 都是
* http.ServerResponse：server例子里的 serverRes

```javascript
var http = require('http');

// http server 例子
var server = http.createServer(function(serverReq, serverRes){
    serverRes.end('hello');
});

server.listen(3000);

// http client 例子
var client = http.get('http://127.0.0.1:3000', function(clientRes){
    clientRes.pipe(process.stdout);
});

```

## 关于http.IncomingMessage、http.ServerResponse

大部分时候，http.IncomingMessage、http.ServerResponse才是主角。

先讲下 http.ServerResponse实例。作用很明确，服务端通过http.ServerResponse 实例，来个请求方发送数据。包括发送响应表头，发送响应主体等。

接下来是 http.IncomingMessage 实例，由于在 server、client 都出现了，初学者难免有点迷茫。它的作用是

在server端：获取请求发送方的信息，比如请求方法、路径、传递的数据等。
在client端：获取 server 端发送过来的信息，比如请求方法、路径、传递的数据等。

http.IncomingMessage实例 有三个属性需要注意：method、statusCode、statusMessage。

* method：只在 server 端的实例有（也就是 serverReq.method）
* statusCode/statusMessage：只在 client 端 的实例有（也就是 clientRes.method）

应该不难理解。

## 关于继承与扩展

http.Server 继承 net.Server

http.ServerResponse 实现了 Writable Stream interface

http.IncomingMessage 实现了 Readable Stream interface

### http.IncomingMessage 与 socket

(new http.IncomingMessage()).socket --> 获得跟这次连接相关的socket

...

