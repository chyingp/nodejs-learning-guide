## 模块概览

## 例子

```js
var fs = require('fs');
var file = fs.createWriteStream('./stdout.txt');

var logger = new console.Console(file, file);
logger.log('hello');
logger.log('word');
```

## 相关链接

