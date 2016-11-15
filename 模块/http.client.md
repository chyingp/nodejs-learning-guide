## ClientRequest概览

当你调用 http.request(options) 时，会返回 ClientRequest实例，主要用来创建HTTP客户端请求。

在前面的章节里，已经对http模块的的其他方面进行了不少介绍，如http.Server、http.ServerResponse、http.IncomingMessage。

有了前面的基础，详细本文不难理解，本文更多的以例子为主。

## 简单的GET请求

下面构造了个GET请求，访问 http://id.qq.com/ ，并将返回的网页内容打印在控制台下。

```js
var http = require('http');
var options = {
    protocol: 'http:',
    hostname: 'id.qq.com',
    port: '80',
    path: '/',
    method: 'GET'
};

var client = http.request(options, function(res){
    var data = '';
    res.setEncoding('utf8');
    res.on('data', function(chunk){
        data += chunk;
    });
    res.on('end', function(){
        console.log(data);
    });
});

client.end();
```

当然，也可以用便捷方法 http.get(options) 进行重写

```js
var http = require('http');

http.get('http://id.qq.com/', function(res){
    var data = '';
    res.setEncoding('utf8');
    res.on('data', function(chunk){
        data += chunk;
    });
    res.on('end', function(){
        console.log(data);
    });
});
```

## 简单的post请求

在下面例子中，首先创建了个http server，负责将客户端发送过来的数据回传。

接着，创建客户端POST请求，向服务端发送数据。需要注意的点有：

1. method 指定为 POST。
2. headers 里声明了 content-type 为 application/x-www-form-urlencoded。
3. 数据发送前，用 querystring.stringify(obj) 对传输的对象进行了格式化。

```js
var http = require('http');
var querystring = require('querystring');

var createClientPostRequest = function(){
    var options = {
        method: 'POST',
        protocol: 'http:',
        hostname: '127.0.0.1',
        port: '3000',
        path: '/post',
        headers: {
            "connection": "keep-alive",
            "content-type": "application/x-www-form-urlencoded"
        }    
    };

    // 发送给服务端的数据
    var postBody = {
        nick: 'chyingp'
    };

    // 创建客户端请求
    var client = http.request(options, function(res){
        // 最终输出：Server got client data: nick=chyingp
        res.pipe(process.stdout);  
    });

    // 发送的报文主体，记得先用 querystring.stringify() 处理下
    client.write( querystring.stringify(postBody) );
    client.end();
};

// 服务端程序，只是负责回传客户端数据
var server = http.createServer(function(req, res){
    res.write('Server got client data: ');
    req.pipe(res);
});

server.listen(3000, createClientPostRequest);
```

## 各种事件

在官方文档里，http.RequestClient相关的事件共有7个。跟HTTP协议密切相关的有3个，分别是 connect、continue、upgrade，其他4个分别是 abort、aborted、socket、response。

* 其他：abort、aborted、socket、response
* 与HTTP协议相关：connect、continue、upgrade

跟HTTP协议相关的会相对复杂些，因为涉及HTTP协议的设计细节。其他3个相对简单。下面分别进行简单的介绍。

### response事件

最容易理解的一个，当收到来自服务端的响应时触发，其实跟 http.get(url, cbk) 中的回调是一样的，看下程序运行的打印信息就知道。

```js
var http = require('http');

var url = 'http://id.qq.com/';

var client = http.get(url, function(res){
    console.log('1. response event');
});

client.on('response', function(res){
    console.log('2. response event');
});

client.end();
```

打印信息：

```bash
1. response event
2. response event
```

### socket事件

当给client分配socket的时候触发，如果熟悉net模块对这个事件应该不陌生。大部分时候并不需要关注这个事件，虽然内部其实挺复杂的。

### abort/aborted 事件

这两个事件看着非常像，都是请求中断时触发，差异在于中断的发起方：

* abort：客户端主动中断请求（第一次调用 client.abort() 时触发）
* aborted：服务端主动中断请求，且请求已经中断时触发。

### continue事件

当收到服务端的响应 `100 Continue` 时触发。熟悉HTTP协议的同学应该对 `100 Continue` 有所了解。当客户端向服务端发送首部 `Expect: 100-continue` ，服务端经过一定的校验后，决定对客户端的后续请求放行，于是返回返回 `100 Continue`，知会客户端，可以继续发送数据。（request body）

### upgrade事件

同样是跟HTTP协议密切相关。当客户端向客户端发起请求时，可以在请求首部里声明 `'Connection': 'Upgrade'` ，以此要求服务端，将当前连接升级到新的协议。如果服务器同意，那么就升级协议继续通信。这里不打算展开太多细节，直接上官方文档的代码

```js
const http = require('http');

// Create an HTTP server
var srv = http.createServer( (req, res) => {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('okay');
});
srv.on('upgrade', (req, socket, head) => {
  socket.write('HTTP/1.1 101 Web Socket Protocol Handshake\r\n' +
               'Upgrade: WebSocket\r\n' +
               'Connection: Upgrade\r\n' +
               '\r\n');

  socket.pipe(socket); // echo back
});

// now that server is running
srv.listen(1337, '127.0.0.1', () => {

  // make a request
  var options = {
    port: 1337,
    hostname: '127.0.0.1',
    headers: {
      'Connection': 'Upgrade',
      'Upgrade': 'websocket'
    }
  };

  var req = http.request(options);
  req.end();

  req.on('upgrade', (res, socket, upgradeHead) => {
    console.log('got upgraded!');
    socket.end();
    process.exit(0);
  });
});
```

## 其他

除了上面讲解到的属性、方法、事件外，还有下面方法没有讲到。并不是它们不重要，篇幅有限，后面再展开。

* client.abort()：中断请求；
* client.setTimeout(timeout)：请求超时设置；
* client.flushHeaders() 及早将请求首部发送出去；
* client.setSocketKeepAlive()：当内部分配 socket 并连接上时，就会内部调用 socket.keepAlive()；
* client.setNoDelay([noDelay])：当内部分配 socket 并连接上时，就会内部调用 socket.setNoDelay()；

## 参考链接

upgrade机制：
https://developer.mozilla.org/en-US/docs/Web/HTTP/Protocol_upgrade_mechanism

官方文档：
https://nodejs.org/api/http.html#http_class_http_clientrequest

nodejs源码：
https://github.com/nodejs/node/blob/master/lib/_http_client.js
