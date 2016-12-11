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