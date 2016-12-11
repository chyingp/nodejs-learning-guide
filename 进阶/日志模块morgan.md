## morgan概览

node.js的HTTP请求日志中间件，一般跟express框架配合使用，也可以单独使用。

## 入门例子

首先，初始化项目。

```bash
npm install express morgan
```

然后，在`basic.js`中添加如下代码。

```js
var express = require('express');
var app = express();
var morgan = require('morgan');

app.use(morgan('short'));
app.use(function(req, res, next){
    res.send('ok');
});

app.listen(3000);
```

`node basic.js`运行程序，并在浏览器里访问 http://127.0.0.1:3000 ，打印日志如下

```bash
➜  2016.12.11-advanced-morgan git:(master) ✗ node basic.js
::ffff:127.0.0.1 - GET / HTTP/1.1 304 - - 3.019 ms
::ffff:127.0.0.1 - GET /favicon.ico HTTP/1.1 200 2 - 0.984 ms
```

## 将日志打印到本地文件

morgan支持stream配置项，可以通过它来实现将日志落地的效果，代码如下：

```js
var express = require('express');
var app = express();
var morgan = require('morgan');
var fs = require('fs');
var path = require('path');

var accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), {flags: 'a'});

app.use(morgan('short', {stream: accessLogStream}));
app.use(function(req, res, next){
    res.send('ok');
});

app.listen(3000);
```

## 使用讲解

### 核心API

morgan的API非常少，使用频率最高的就是`morgan()`，作用是返回一个express日志中间件。

```js
morgan(format, options)
```

参数说明如下：

* [format]：可选，morgan与定义了几种日志格式，每种格式都有对应的名称，比如`combined`、`short`等，默认是`default`。不同格式的差别可参考[这里](https://github.com/expressjs/morgan/#predefined-formats)。下文会讲解下，如果自定义日志格式。
* [options]：可选，配置项，包含`stream（常用）`、`skip`、`immediate`。
  * stream：日志的输出流配置，默认是`process.stdout`。
  * skip：是否跳过日志记录，使用方式可以参考[这里](https://github.com/expressjs/morgan/#skip)。
  * immediate：布尔值，默认是false。当为true时，一收到请求，就记录日志；如果为false，则在请求返回后，再记录日志。

### 自定义日志格式

