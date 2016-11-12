## 概览

本文的重点会放在`req`这个对象上。前面已经提到过了，可以用它来获取请求方的相关信息，如request header等。

```js
var http = require('http');
var server = http.createServer(function(req, res){
    res.send('ok');
});
server.listen(3000);
```

## httpVersion/method/url

下面是一个典型的HTTP请求报文，里面最重要的内容包括：HTTP版本、请求方法、请求地址、请求头部。

```http
GET /hello HTTP/1.1
Host: 127.0.0.1:3000
Connection: keep-alive
Cache-Control: no-cache
```

那么，如何获取上面提到的信息呢？很简单，直接上代码

```js
// getClientInfo.js
var http = require('http');

var server = http.createServer(function(req, res){
    console.log( '1、客户端请求url：' + req.url );
    console.log( '2、http版本：' + req.httpVersion );
    console.log( '3、http请求方法：' + req.method );
    console.log( '4、http请求头部' + JSON.stringify(req.headers) );

    res.end('ok');
});

server.listen(3000);
```

效果如下：

```bash
1、客户端请求url：/hello
2、http版本：1.1
3、http请求方法：GET
4、http headers：{"host":"127.0.0.1:3000","connection":"keep-alive","cache-control":"no-cache","user-agent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.71 Safari/537.36","postman-token":"1148986a-ddfb-3569-e2c0-585634655fe4","accept":"*/*","accept-encoding":"gzip, deflate, sdch, br","accept-language":"zh-CN,zh;q=0.8,en;q=0.6,zh-TW;q=0.4"}
```

## 获取get请求参数

服务端代码如下：

```js
// getClientGetQuery.js
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

访问地址 http://127.0.0.1:3000/hello?nick=chyingp&hello=world

服务端输出如下

```bash
{"nick":"chyingp","hello":"world"}
```

## 获取post请求参数

服务端代码如下

```js
// getClientPostBody.js
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

通过curl构造post请求：

```bash
curl -d 'nick=casper&hello=world' http://127.0.0.1:3000
```

服务端打印如下：

```bash
post body is: nick=casper&hello=world
```

备注：post请求中，不同的`Content-type`，post body有不小差异，感兴趣的同学可以研究下。

本例中的post请求，HTTP报文大概如下

```http
POST / HTTP/1.1
Host: 127.0.0.1:3000
Content-Type: application/x-www-form-urlencoded
Cache-Control: no-cache

nick=casper&hello=world
```

## 分不清差异的事件：aborted、close

官方文档对这两个事件的解释是：当客户端终止请求时，触发aborted事件；当客户端连接断开时，触发close事件；官方文档传送们：[地址](https://nodejs.org/api/http.html#http_event_aborted_1)

反正我看了是一头雾水，根据实际测试结果来看：

* 当客户端abort请求时，服务端req的aborted、close事件都会触发；
* 客户端请求正常完成时，服务端req的close事件都不会会触发；

直接扒了下nodejs的源代码，发现的确是同时触发的，触发场景：请求正常结束前，客户端abort请求。

测试代码如下：

```js
var http = require('http');

var server = http.createServer(function(req, res){
    
    console.log('1、收到客户端请求: ' + req.url);
    
    req.on('aborted', function(){
        console.log('2、客户端请求aborted');
    });
    
    req.on('close', function(){
        console.log('3、客户端请求close');
    });
    
    // res.end('ok'); 故意不返回，等着客户端中断请求
});

server.listen(3000, function(){
    var client = http.get('http://127.0.0.1:3000/aborted');
    setTimeout(function(){
        client.abort();  // 故意延迟100ms，确保请求发出
    }, 100);    
});


// 输出如下
// 1、收到客户端请求: /aborted
// 2、客户端请求aborted
// 3、客户端请求close
```


以下代码来自nodejs源码（_http_server.js）

```js
  function abortIncoming() {
    while (incoming.length) {
      var req = incoming.shift();
      req.emit('aborted');
      req.emit('close');
    }
    // abort socket._httpMessage ?
  }
```

TODO ：客户端侧的aborted、close事件在什么场景下触发？



## 不常用属性

* rawHeaders：
* trailers：
* rawTrailers：

## 相关链接

官方文档：
https://nodejs.org/api/http.html#http_class_http_incomingmessage