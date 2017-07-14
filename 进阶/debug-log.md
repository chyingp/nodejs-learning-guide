## 前言

在node程序开发中时，经常需要打印调试日志。用的比较多的是debug模块，比如express框架中就用到了。下文简单举几个例子进行说明。文中相关代码示例，可在[这里](https://github.com/chyingp/nodejs-learning-guide/tree/master/examples/2017.01.16-debug-log/debug)找到。

>备注：node在0.11.3版本也加入了util.debuglog()用于打印调试日志，使用方法跟debug模块大同小异。

## 基础例子

首先，安装`debug`模块。

```bash
npm install debug
```

使用很简单，运行node程序时，加上`DEBUG=app`环境变量即可。

```javascript
/**
 * debug基础例子
 */
var debug = require('debug')('app');

// 运行 DEBUG=app node 01.js
// 输出：app hello +0ms
debug('hello');
```

## 例子：命名空间

当项目程序变得复杂，我们需要对日志进行分类打印，debug支持命令空间，如下所示。

* `DEBUG=app,api`：表示同时打印出命名空间为app、api的调试日志。
* `DEBUG=a*`：支持通配符，所有命名空间为a开头的调试日志都打印出来。

```javascript
/**
 * debug例子：命名空间
 */
var debug = require('debug');
var appDebug = debug('app');
var apiDebug = debug('api');

// 分别运行下面几行命令看下效果
// 
//     DEBUG=app node 02.js
//     DEBUG=api node 02.js
//     DEBUG=app,api node 02.js
//     DEBUG=a* node 02.js
//     
appDebug('hello');
apiDebug('hello');
```

## 例子：命名空间排除

有的时候，我们想要打印出所有的调试日志，除了个别命名空间下的。这个时候，可以通过`-`来进行排除，如下所示。`-account*`表示排除所有以account开头的命名空间的调试日志。

```javascript
/**
 * debug例子：排查命名空间
 */
var debug = require('debug');
var listDebug = debug('app:list');
var profileDebug = debug('app:profile');
var loginDebug = debug('account:login');

// 分别运行下面几行命令看下效果
// 
//     DEBUG=* node 03.js
//     DEBUG=*,-account* node 03.js
//     
listDebug('hello');
profileDebug('hello');
loginDebug('hello');
```

## 例子：自定义格式化

debug也支持格式化输出，如下例子所示。

```javascript
var debug = require('debug')('app');

debug('my name is %s', 'chyingp');
```

此外，也可以自定义格式化内容。

```javascript
/**
 * debug：自定义格式化
 */
var createDebug = require('debug')

createDebug.formatters.h = function(v) {
  return v.toUpperCase();
};
 
var debug = createDebug('foo');

// 运行 DEBUG=foo node 04.js 
// 输出 foo My name is CHYINGP +0ms
debug('My name is %h', 'chying');
```

## 相关链接

debug：https://github.com/visionmedia/debug
debuglog：https://nodejs.org/api/util.html#util_util_debuglog_section