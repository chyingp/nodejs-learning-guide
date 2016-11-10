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



## 相关事件

有依赖关系

有时间次序

## 常用接口

