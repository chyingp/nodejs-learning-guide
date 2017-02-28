## 入门例子

输出日志如下，包括日志打印时间、日志级别、日志分类、日志内容。

```javascript
// started.js
var log4js = require('log4js');
var logger = log4js.getLogger();
logger.debug('hello world');

// 输出： 
// [2017-02-28 21:28:22.853] [DEBUG] [default] - hello world
```

## 日志级别

`logger.setLevel('INFO');` 表示想要打印的最低级别的日志是`INFO`，也就是说，调用类似`logger.debug()`等级别低于`INFO`的接口，日志是不会打印出来的。

```javascript
var log4js = require('log4js');
var logger = log4js.getLogger();
logger.setLevel('INFO');

logger.debug('level: debug');
logger.info('level: info');
logger.error('level: error');

// 输出如下：
// [2017-02-28 21:50:45.372] [INFO] [default] - level: info
// [2017-02-28 21:50:45.376] [ERROR] [default] - level: error
```

## 日志类别

除级别外，还可以对日志进行分类，`log4js.getLogger(category)`，如下所示

```javascript
var log4js = require('log4js');
var alogger = log4js.getLogger('category-a');
var blogger = log4js.getLogger('category-b');

alogger.info('hello');
blogger.info('hello');

// 输出如下：
// [2017-02-28 22:36:57.570] [INFO] category-a - hello
// [2017-02-28 22:36:57.574] [INFO] category-b - hello
```

## appenders

appenders指定日志输出的位置，可以同时配置多个，用category进行区分。比如 `log4js.getLogger('info')` 应用的就是 `type` 为 `dateFile` 的配置。

可以注意到，`type` 为 `console` 的配置没有声明 `category` ，因此，所有的日志都会打印到控制台。

```javascript
var log4js = require('log4js');

log4js.configure({
    appenders: [
        { type: 'console'},
        { type: 'dateFile', filename: './logs/info.log', category: 'info' }
    ]
});

var logger = log4js.getLogger('info');
logger.setLevel('INFO');

logger.trace('trace');
logger.debug('debug');
logger.info('info');

// 输出如下：
// [2017-02-28 22:51:30.723] [INFO] info - info
```

## 相关链接

官网：https://github.com/nomiddlename/log4js-node