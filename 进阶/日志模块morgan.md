## 章节概览

morgan是express默认的日志中间件，也可以脱离express，作为node.js的日志组件单独使用。本文由浅入深，内容主要包括：

* morgan使用入门例子
* 如何将日志保存到本地文件
* 核心API使用说明及例子
* 进阶使用：1、日志分割 2、将日志写入数据库
* 源码剖析：morgan的日志格式以及预编译

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

* format：可选，morgan与定义了几种日志格式，每种格式都有对应的名称，比如`combined`、`short`等，默认是`default`。不同格式的差别可参考[这里](https://github.com/expressjs/morgan/#predefined-formats)。下文会讲解下，如果自定义日志格式。
* options：可选，配置项，包含`stream（常用）`、`skip`、`immediate`。
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

## 高级使用

### 日志切割

一个线上应用，如果所有的日志都落地到同一个本地文件，时间久了，文件会变得非常大，既影响性能，又不便于查看。这时候，就需要用到日志分割了。

借助`file-stream-rotator`插件，可以轻松完成日志分割的工作。除了`file-stream-rotator`相关的配置代码，其余跟之前的例子差不多，这里不赘述。

```js
var FileStreamRotator = require('file-stream-rotator')
var express = require('express')
var fs = require('fs')
var morgan = require('morgan')
var path = require('path')

var app = express()
var logDirectory = path.join(__dirname, 'log')

// ensure log directory exists
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory)

// create a rotating write stream
var accessLogStream = FileStreamRotator.getStream({
  date_format: 'YYYYMMDD',
  filename: path.join(logDirectory, 'access-%DATE%.log'),
  frequency: 'daily',
  verbose: false
})

// setup the logger
app.use(morgan('combined', {stream: accessLogStream}))

app.get('/', function (req, res) {
  res.send('hello, world!')
})

```

### 日志写入数据库

有的时候，我们会有这样的需求，将访问日志写入数据库。这种需求常见于需要实时查询统计的日志系统。

在morgan里该如何实现呢？从文档上，并没有看到适合的扩展接口。于是查阅了下`morgan`的源码，发现实现起来非常简单。

回顾下之前日志写入本地文件的例子，最关键的两行代码如下。通过`stream`指定日志的输出流。

```js
var accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), {flags: 'a'});
app.use(morgan('short', {stream: accessLogStream}));
```

在`morgan`内部，大致实现是这样的（简化后）。

```js
// opt为配置文件
var stream = opts.stream || process.stdout;
var logString = createLogString();  // 伪代码，根据format、token的定义，生成日志
stream.write(logString);
```

于是，可以用比较取巧的方式来实现目的：声明一个带`write`方法的对象，并作为`stream`配置传入。

```js
var express = require('express');
var app = express();
var morgan = require('morgan');

// 带write方法的对象
var dbStream = {
  write: function(line){
    saveToDatabase(line);  // 伪代码，保存到数据库
  }
};

// 将 dbStream 作为 stream 配置项的值
app.use(morgan('short', {stream: dbStream}));
app.use(function(req, res, next){
  res.send('ok');
});

app.listen(3000);
```

## 深入剖析

morgan的代码非常简洁，从设计上来说，morgan的生命周期包含：

>token定义 --> 日志格式定义 -> 日志格式预编译 --> 请求达到/返回 --> 写日志

其中，token定义、日志格式定义前面已经讲到，这里就只讲下 **日志格式预编译** 的细节。

跟模板引擎预编译一样，日志格式预编译，也是为了提升性能。源码如下，最关键的代码就是`compile(fmt)`。

```js
function getFormatFunction (name) {
  // lookup format
  var fmt = morgan[name] || name || morgan.default

  // return compiled format
  return typeof fmt !== 'function'
    ? compile(fmt)
    : fmt
}
```

`compile()`方法的实现细节这里不赘述，着重看下`compile(fmt)`返回的内容：

```js
var morgan = require('morgan');
var format = morgan['tiny'];
var fn = morgan.compile(format);

console.log(fn.toString());
```

运行上面程序，输出内容如下，其中`tokens`其实就是`morgan`。

```bash
function anonymous(tokens, req, res
/**/) {
  return ""
    + (tokens["method"](req, res, undefined) || "-") + " "
    + (tokens["url"](req, res, undefined) || "-") + " "
    + (tokens["status"](req, res, undefined) || "-") + " "
    + (tokens["res"](req, res, "content-length") || "-") + " - "
    + (tokens["response-time"](req, res, undefined) || "-") + " ms";
}
```

看下`morgan.token()`的定义，就很清晰了

```js
function token (name, fn) {
  morgan[name] = fn
  return this
}
```

## 相关链接

https://github.com/expressjs/morgan