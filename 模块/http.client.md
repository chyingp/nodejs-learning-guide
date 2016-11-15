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

