## http服务端概览

## 创建server

几行代码搞定

```js
var http = require('http');
var requestListener = function(req, res){
    res.end('ok');
};
var server = http.createServer(requestListener);
// var server = new http.Server(requestListener); 跟上面是等价的
server.listen(3000);
```

## 获取请求方信息

### HTTP版本、HTTP method、headers、url

```js
var http = require('http');

var server = http.createServer(function(req, res){
    console.log('客户端请求url：' + req.url);
    console.log('http版本：' + req.httpVersion);
    console.log('http请求方法：' + req.method);

    res.end('ok');
});

server.listen(3000);
```

效果如下：

```bash
客户端请求url：/hello
http版本：1.1
http请求方法：GET
http headers：{"host":"127.0.0.1:3000","connection":"keep-alive","cache-control":"max-age=0","upgrade-insecure-requests":"1","user-agent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.71 Safari/537.36","accept":"text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8","accept-encoding":"gzip, deflate, sdch, br","accept-language":"zh-CN,zh;q=0.8,en;q=0.6,zh-TW;q=0.4"}
```

### 获取get请求参数

```js
var http = require('http');
var url = require('url');
var querystring = require('querystring');

var server = http.createServer(function(req, res){
    var urlObj = url.parse(req.url);
    var query = urlObj.query;
    var queryObj = querystring.parse(query);
    
    console.log( JSON.stringify(queryObj) );
    
    res.end('ok');
});

server.listen(3000);
```

运行如下命令

```bash
curl http://127.0.0.1:3000/hello\?nick\=chyingp\&hello\=world
```

服务端输出如下

```bash
{"nick":"chyingp","hello":"world"}
```


### 获取post请求参数

代码如下

```js
var http = require('http');
var url = require('url');
var querystring = require('querystring');

var server = http.createServer(function(req, res){
    
    var body = '';  
    req.on('data', function(thunk){
        body += thunk;
    });

    req.on('end', function(){
        console.log( 'post body is: ' + body );
        res.end('ok');
    }); 
});

server.listen(3000);
```

通过curl构造极简post请求

```bash
curl -d 'nick=casper&hello=world' http://127.0.0.1:3000
```

服务端打印如下。注意，在post请求中，不同的`Content-type`，post body有不小差异，感兴趣的同学可以自己试下。

```bash
post body is: nick=casper&hello=world
```

比如本例中的post请求，HTTP报文大概如下

```http
POST / HTTP/1.1
Host: 127.0.0.1:3000
Content-Type: application/x-www-form-urlencoded
Cache-Control: no-cache

nick=casper&hello=world
```


## 枯燥的事件

首先，我们来看下有哪些事件

checkContinue、checkExpectation、clientError、close、connect、connection、request、upgrade

### error

```js
var http = require('http');
var PORT = 3000;
var noop = function(){};

var svr = http.createServer(noop);
var anotherSvr = http.createServer(noop);

anotherSvr.on('error', function(e){
    console.error('出错啦！' + e.message);
});

svr.listen(PORT, function(){
    anotherSvr.listen(PORT);
});
```

运行代码，输出如下

```bash
出错啦！listen EADDRINUSE :::3000
```

### connect vs connection

两者差别非常大，虽然字眼看着有点像。

* connect：当客户端的HTTP method为connect时触发。
* connection：当TCP连接建立时触发，大部分时候可以忽略这个事件（目测模块内部自己用到而已）。此外，可以通过 req.connection 来获取这个socket（从nodejs源码来看，req.socket、req.connection 都指向了这个socket）。此外，socket上的readable事件不会触发（具体原因请看模块内部实现，反正我是还没研究）

大部分时候都不会用到，除非你要开发HTTP代理。当客户端发起 connect 请求时触发（注意绕过了 requestListener）

```js
var http = require('http');
var PORT = 3000;

var server = http.createServer(function(req, res){
    res.end('ok');
});

// 注意：发起connect请求的例子在 ./httpServerEventConnectClient.js 里
server.on('connect', function(req, socket, head){
    console.log('connect事件触发');
    socket.end();   // 反正我就只想举个例子，没打算正经处理。。。
});

server.listen(PORT);
```

### request

当有新的连接到来时触发。那跟 connection 有什么区别呢？

好了，`keep-alive`闪亮登场！在持久化连接的情况下，多个 request 可能对应的是 一个 connection。

先来看下没有`keep-alive`的场景

```js
var http = require('http');
var PORT = 3000;
var requestIndex = 0;
var connectionIndex = 0;

var server = http.createServer(function(req, res){
    res.end('ok');
});

server.on('request', function(req, res){
    requestIndex++;
    console.log('request event: 第'+ requestIndex +'个请求！');
});

server.on('connection', function(req, res){
    connectionIndex++;
    console.log('connection event: 第'+ connectionIndex +'个请求！');
});

server.listen(PORT);
```

通过curl连续发送3个请求，看下效果

```bash
for i in `seq 1 3`; do curl http://127.0.0.1:3000; done
```

服务端输出如下

```bash
connection event: 第1个请求！
request event: 第1个请求！
connection event: 第2个请求！
request event: 第2个请求！
connection event: 第3个请求！
request event: 第3个请求！
```

然后，再来看下有`keep-alive`的场景。用 postman 构造包含 keep-alive 的请求，最终的HTTP请求报文如下

```http
GET / HTTP/1.1
Host: 127.0.0.1:3000
Connection: keep-alive
Cache-Control: no-cache
Postman-Token: 6027fda7-f936-d3ac-e54f-dafcbf5e58ff
```

连续发送3个请求，服务端打印日志如下

```bash
connection event: 第1个请求！
request event: 第1个请求！
request event: 第2个请求！
request event: 第3个请求！
```



## 不常用接口

### server.close([callback]); 

关闭服务器。其实就是 (new net.Server()).close()，停止接受新的连接。
已经连接上的请求会继续处理，当所有连接结束的时候，server 正式关闭，并抛出 close 事件。
一般提供了callback，就不用监听close; 监听了close，就不用添加callback。

### 其他server.listen()

其实除了 server.listen(PORT) 这种监听方式外，还有以下几种相对不那么常用的监听方式。用到的时候看看文档就行了。

server.listen(handle[, callback])：监听本地文件描述符（fd）（windows不支持），或者server，或者socket
server.listen(path[, callback])：监听本地socket，创建一个 UNIX socket server 。
server.listen([port][, hostname][, backlog][, callback])

### 网络超时 server.setTimeout(msecs, callback)

设置网络连接的超时时间。当超过 msecs 没有响应时，网络就会自动断开。

如果传了 callback，那么当 timeout 发生时，就会将timeout的socket作为参数传给callback。

注意，一般情况下超时的socket会自动销毁。但当你传了callback后，你就需要手动end或者destroy这个socket。

## 不常用属性

server.listening：是否在监听连接
server.timeout：设置超时时间（毫秒），注意，修改这个值，只会对新建立的连接产生影响。此外，将timeout设置为0，就会禁用自动超时行为。（目测不推荐）
server.maxHeadersCount：客户端最多传送的header数量，默认是1000，如果设置为0，则没有限制。（问题：如果超过1000怎么办？？）



