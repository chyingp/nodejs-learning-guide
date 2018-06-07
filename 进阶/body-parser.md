## 写在前面

`body-parser`是非常常用的一个`express`中间件，作用是对http请求体进行解析。使用非常简单，以下两行代码已经覆盖了大部分的使用场景。

```javascript
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
```

本文从简单的例子出发，探究`body-parser`的内部实现。至于`body-parser`如何使用，感兴趣的同学可以参考[官方文档](https://github.com/expressjs/body-parser/)。

## 入门基础

在正式讲解前，我们先来看一个POST请求的报文，如下所示。

```http
POST /test HTTP/1.1
Host: 127.0.0.1:3000
Content-Type: text/plain; charset=utf8
Content-Encoding: gzip

chyingp
```

其中需要我们注意的有`Content-Type`、`Content-Encoding`以及报文主体：

* Content-Type：请求报文主体的类型、编码。常见的类型有`text/plain`、`application/json`、`application/x-www-form-urlencoded`。常见的编码有`utf8`、`gbk`等。
* Content-Encoding：声明报文主体的压缩格式，常见的取值有`gzip`、`deflate`、`identity`。
* 报文主体：这里是个普通的文本字符串`chyingp`。

## body-parser主要做了什么

`body-parser`实现的要点如下：

1. 处理不同类型的请求体：比如`text`、`json`、`urlencoded`等，对应的报文主体的格式不同。
2. 处理不同的编码：比如`utf8`、`gbk`等。
3. 处理不同的压缩类型：比如`gzip`、`deflare`等。
4. 其他边界、异常的处理。

## 一、处理不同类型请求体

为了方便读者测试，以下例子均包含服务端、客户端代码，完整代码可在[笔者github](https://github.com/chyingp/nodejs-learning-guide/tree/master/examples/2017.05.20-express-body-parser)上找到。

### 解析text/plain

客户端请求的代码如下，采用默认编码，不对请求体进行压缩。请求体类型为`text/plain`。

```javascript
var http = require('http');

var options = {
    hostname: '127.0.0.1',
    port: '3000',
    path: '/test',
    method: 'POST',
    headers: {
        'Content-Type': 'text/plain',
        'Content-Encoding': 'identity'
    }
};

var client = http.request(options, (res) => {
    res.pipe(process.stdout);
});

client.end('chyingp');
```

服务端代码如下。`text/plain`类型处理比较简单，就是buffer的拼接。

```javascript
var http = require('http');

var parsePostBody = function (req, done) {
    var arr = [];
    var chunks;

    req.on('data', buff => {
        arr.push(buff);
    });

    req.on('end', () => {
        chunks = Buffer.concat(arr);
        done(chunks);
    });
};

var server = http.createServer(function (req, res) {
    parsePostBody(req, (chunks) => {
        var body = chunks.toString();
        res.end(`Your nick is ${body}`)
    });
});

server.listen(3000);
```

### 解析application/json

客户端代码如下，把`Content-Type`换成`application/json`。

```javascript
var http = require('http');
var querystring = require('querystring');

var options = {
    hostname: '127.0.0.1',
    port: '3000',
    path: '/test',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Encoding': 'identity'
    }
};

var jsonBody = {
    nick: 'chyingp'
};

var client = http.request(options, (res) => {
    res.pipe(process.stdout);
});

client.end( JSON.stringify(jsonBody) );
```

服务端代码如下，相比`text/plain`，只是多了个`JSON.parse()`的过程。

```javascript
var http = require('http');

var parsePostBody = function (req, done) {
    var length = req.headers['content-length'] - 0;
    var arr = [];
    var chunks;

    req.on('data', buff => {
        arr.push(buff);
    });

    req.on('end', () => {
        chunks = Buffer.concat(arr);
        done(chunks);
    });
};

var server = http.createServer(function (req, res) {
    parsePostBody(req, (chunks) => {
        var json = JSON.parse( chunks.toString() );    // 关键代码    
        res.end(`Your nick is ${json.nick}`)
    });
});

server.listen(3000);
```

### 解析application/x-www-form-urlencoded

客户端代码如下，这里通过`querystring`对请求体进行格式化，得到类似`nick=chyingp`的字符串。

```javascript
var http = require('http');
var querystring = require('querystring');

var options = {
    hostname: '127.0.0.1',
    port: '3000',
    path: '/test',
    method: 'POST',
    headers: {
        'Content-Type': 'form/x-www-form-urlencoded',
        'Content-Encoding': 'identity'
    }
};

var postBody = { nick: 'chyingp' };

var client = http.request(options, (res) => {
    res.pipe(process.stdout);
});

client.end( querystring.stringify(postBody) );
```

服务端代码如下，同样跟`text/plain`的解析差不多，就多了个`querystring.parse()`的调用。

```javascript
var http = require('http');
var querystring = require('querystring');

var parsePostBody = function (req, done) {
    var length = req.headers['content-length'] - 0;
    var arr = [];
    var chunks;

    req.on('data', buff => {
        arr.push(buff);
    });

    req.on('end', () => {
        chunks = Buffer.concat(arr);
        done(chunks);
    });
};

var server = http.createServer(function (req, res) {
    parsePostBody(req, (chunks) => {
        var body = querystring.parse( chunks.toString() );  // 关键代码
        res.end(`Your nick is ${body.nick}`)
    });
});

server.listen(3000);
```

## 二、处理不同编码

很多时候，来自客户端的请求，采用的不一定是默认的`utf8`编码，这个时候，就需要对请求体进行解码处理。

客户端请求如下，有两个要点。

1. 编码声明：在`Content-Type`最后加上` ;charset=gbk`
2. 请求体编码：这里借助了`iconv-lite`，对请求体进行编码`iconv.encode('程序猿小卡', encoding)`

```javascript
var http = require('http');
var iconv = require('iconv-lite');

var encoding = 'gbk';  // 请求编码

var options = {
    hostname: '127.0.0.1',
    port: '3000',
    path: '/test',
    method: 'POST',
    headers: {
        'Content-Type': 'text/plain; charset=' + encoding,
        'Content-Encoding': 'identity',        
    }
};

// 备注：nodejs本身不支持gbk编码，所以请求发送前，需要先进行编码
var buff = iconv.encode('程序猿小卡', encoding);

var client = http.request(options, (res) => {
    res.pipe(process.stdout);
});

client.end(buff, encoding);
```

服务端代码如下，这里多了两个步骤：编码判断、解码操作。首先通过`Content-Type`获取编码类型`gbk`，然后通过`iconv-lite`进行反向解码操作。

```javascript
var http = require('http');
var contentType = require('content-type');
var iconv = require('iconv-lite');

var parsePostBody = function (req, done) {
    var obj = contentType.parse(req.headers['content-type']);
    var charset = obj.parameters.charset;  // 编码判断：这里获取到的值是 'gbk'

    var arr = [];
    var chunks;

    req.on('data', buff => {
        arr.push(buff);
    });

    req.on('end', () => {
        chunks = Buffer.concat(arr);
        var body = iconv.decode(chunks, charset);  // 解码操作
        done(body);
    });
};

var server = http.createServer(function (req, res) {
    parsePostBody(req, (body) => {
        res.end(`Your nick is ${body}`)
    });
});

server.listen(3000);
```

## 三、处理不同压缩类型

这里举个`gzip`压缩的例子。客户端代码如下，要点如下：

1. 压缩类型声明：`Content-Encoding`赋值为`gzip`。
2. 请求体压缩：通过`zlib`模块对请求体进行gzip压缩。

```javascript
var http = require('http');
var zlib = require('zlib');

var options = {
    hostname: '127.0.0.1',
    port: '3000',
    path: '/test',
    method: 'POST',
    headers: {
        'Content-Type': 'text/plain',
        'Content-Encoding': 'gzip'
    }
};

var client = http.request(options, (res) => {
    res.pipe(process.stdout);
});

// 注意：将 Content-Encoding 设置为 gzip 的同时，发送给服务端的数据也应该先进行gzip
var buff = zlib.gzipSync('chyingp');

client.end(buff);
```

服务端代码如下，这里通过`zlib`模块，对请求体进行了解压缩操作（guzip）。

```javascript
var http = require('http');
var zlib = require('zlib');

var parsePostBody = function (req, done) {
    var length = req.headers['content-length'] - 0;
    var contentEncoding = req.headers['content-encoding'];
    var stream = req;

    // 关键代码如下
    if(contentEncoding === 'gzip') {
        stream = zlib.createGunzip();
        req.pipe(stream);
    }

    var arr = [];
    var chunks;

    stream.on('data', buff => {
        arr.push(buff);
    });

    stream.on('end', () => {
        chunks = Buffer.concat(arr);        
        done(chunks);
    });

    stream.on('error', error => console.error(error.message));
};

var server = http.createServer(function (req, res) {
    parsePostBody(req, (chunks) => {
        var body = chunks.toString();
        res.end(`Your nick is ${body}`)
    });
});

server.listen(3000);
```

## 写在后面

`body-parser`的核心实现并不复杂，翻看源码后你会发现，更多的代码是在处理异常跟边界。

另外，对于POST请求，还有一个非常常见的`Content-Type`是`multipart/form-data`，这个的处理相对复杂些，`body-parser`不打算对其进行支持。篇幅有限，后续章节再继续展开。

欢迎交流，如有错漏请指出。

## 相关链接

https://github.com/expressjs/body-parser/

https://github.com/ashtuchkin/iconv-lite
