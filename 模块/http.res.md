## 概览

http模块四剑客之一的`res`，应该都不陌生了。一个web服务程序，接受到来自客户端的http请求后，向客户端返回正确的响应内容，这就是`res`的职责。

返回的内容包括：状态代码/状态描述信息、响应头部、响应主体。下文会举几个简单的例子。

```js
var http = require('http');
var server = http.createServer(function(req, res){
    res.send('ok');
});
server.listen(3000);
```

## 例子

在下面的例子中，我们同时设置了 状态代码/状态描述信息、响应头部、响应主体，就是这么简单。

```js
var http = require('http');

// 设置状态码、状态描述信息、响应主体
var server = http.createServer(function(req, res){
    res.writeHead(200, 'ok', {
        'Content-Type': 'text/plain'
    });
    res.end('hello');
});

server.listen(3000);
```

### 设置状态代码、状态描述信息

`res`提供了 res.writeHead()、res.statusCode/res.statusMessage 来实现这个目的。

举例，如果想要设置 200/ok ，可以

```js
res.writeHead(200, 'ok');
```

也可以

```js
res.statusCode = 200;
res.statusMessage = 'ok';
```

两者差不多，差异点在于

1. res.writeHead() 可以提供额外的功能，比如设置响应头部。
2. 当响应头部发送出去后，res.statusCode/res.statusMessage 会被设置成已发送出去的 状态代码/状态描述信息。

### 设置响应头部

`res`提供了 res.writeHead()、response.setHeader() 来实现响应头部的设置。

举例，比如想把 `Content-Type` 设置为 `text-plain`，那么可以

```js
// 方法一
res.writeHead(200, 'ok', {
    'Content-Type': 'text-plain'
});

// 方法二
res.setHeader('Content-Type', 'text-plain');
```

两者的差异点在哪里呢？

1. res.writeHead() 不单单是设置header。
2. 已经通过 res.setHeader() 设置了header，当通过 res.writeHead() 设置同名header，res.writeHead() 的设置会覆盖之前的设置。

关于第2点差异，这里举个例子。下面代码，最终的 `Content-Type` 为 `text/plain`。

```js
var http = require('http');

var server = http.createServer(function(req, res){
    res.setHeader('Content-Type', 'text/html');
    res.writeHead(200, 'ok', {
        'Content-Type': 'text/plain'
    });
    res.end('hello');
});

server.listen(3000);
```

而下面的例子，则直接报错。报错信息为 `Error: Can't set headers after they are sent.`。

```js
var http = require('http');

var server = http.createServer(function(req, res){    
    res.writeHead(200, 'ok', {
        'Content-Type': 'text/plain'
    });
    res.setHeader('Content-Type', 'text/html');
    res.end('hello');
});

server.listen(3000);
```

