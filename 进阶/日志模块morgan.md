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

首先搞清楚morgan中的两个概念：format 跟 token。非常简单：

* format：日志格式，本质是代表日志格式的字符串，比如 `:method :url :status :res[content-length] - :response-time ms`。
* token：format的组成部分，比如上面的`:method`、`:url`即使所谓的token。

搞清楚format、token的区别后，就可以看下morgan中，关于自定义日志格式的关键API。

```js
morgan.format(name, format);  // 自定义日志格式
morgan.token(name, fn);  // 自定义token
```

## 自定义format

非常简单，首先通过`morgan.format()`定义名为`joke`的日志格式，然后通过`morgan('joke')`调用即可。

```js
var express = require('express');
var app = express();
var morgan = require('morgan');

morgan.format('joke', '[joke] :method :url :status');

app.use(morgan('joke'));

app.use(function(req, res, next){
    res.send('ok');
});

app.listen(3000);
```

我们来看下运行结果

```bash
➜  2016.12.11-advanced-morgan git:(master) ✗ node morgan.format.js
[joke] GET / 304
[joke] GET /favicon.ico 200
```

## 自定义token

代码如下，通过`morgan.token()`自定义token，然后将自定义的token，加入自定义的format中即可。

```js
var express = require('express');
var app = express();
var morgan = require('morgan');

// 自定义token
morgan.token('from', function(req, res){
    return req.query.from || '-';
});

// 自定义format，其中包含自定义的token
morgan.format('joke', '[joke] :method :url :status :from');

// 使用自定义的format
app.use(morgan('joke'));

app.use(function(req, res, next){
    res.send('ok');
});

app.listen(3000);
```

运行程序，并在浏览器里先后访问 http://127.0.0.1:3000/hello?from=app 和 http://127.0.0.1:3000/hello?from=pc

```bash
➜  2016.12.11-advanced-morgan git:(master) ✗ node morgan.token.js 
[joke] GET /hello?from=app 200 app
[joke] GET /favicon.ico 304 -
[joke] GET /hello?from=pc 200 pc
[joke] GET /favicon.ico 304 -
```