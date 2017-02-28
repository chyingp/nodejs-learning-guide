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

## 相关链接

官网：https://github.com/nomiddlename/log4js-node