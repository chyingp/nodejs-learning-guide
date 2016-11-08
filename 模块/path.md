## 模块概览

## 获取路径/文件名/扩展名

* 获取路径：path.dirname(filepath)
* 获取文件名：path.basename(filepath)
* 获取扩展名：path.extname(filepath)

### 获取所在路径

例子如下：

```javascript
var path = require('path');
var filepath = '/tmp/demo/js/test.js';

// 输出：/tmp/demo/js
console.log( path.dirname(filepath) );
```

### 获取文件名

严格意义上来说，path.basename(filepath) 只是输出路径的最后一部分，并不会判断是否文件名。

但大部分时候，我们可以用它来作为简易的“获取文件名“的方法。

```javascript
var path = require('path');

// 输出：test.js
console.log( path.basename('/tmp/demo/js/test.js') );

// 输出：test
console.log( path.basename('/tmp/demo/js/test/') );

// 输出：test
console.log( path.basename('/tmp/demo/js/test') );
```

如果只想获取文件名，单不包括文件扩展呢？可以用上第二个参数。

```javascript
// 输出：test
console.log( path.basename('/tmp/demo/js/test.js', '.js') );
```

### 获取文件扩展名

简单的例子如下：

```javascript
var path = require('path');
var filepath = '/tmp/demo/js/test.js';

// 输出：.js
console.log( path.extname(filepath) );
```

更详细的规则是如下：（假设 path.basename(filepath) === B ）

* 从B的最后一个`.`开始截取，直到最后一个字符。
* 如果B中不存在`.`，或者B的第一个字符就是`.`，那么返回空字符串。

直接看[官方文档](https://nodejs.org/api/path.html#path_path_extname_path)的例子

```javascript
path.extname('index.html')
// returns '.html'

path.extname('index.coffee.md')
// returns '.md'

path.extname('index.')
// returns '.'

path.extname('index')
// returns ''

path.extname('.index')
// returns ''

```

## 路径组合

* path.join([...paths])
* path.resolve([...paths])

### path.join([...paths])

把`paths`拼起来，然后再normalize一下。这句话反正我自己看着也是莫名其妙，可以参考下面的伪代码定义。

例子如下：

```javacript
var path = require('path');

// 输出 '/foo/bar/baz/asdf'
path.join('/foo', 'bar', 'baz/asdf', 'quux', '..');
```

path定义的伪代码如下：

```javascript
module.exports.join = function(){
  var paths = Array.prototye.slice.call(arguments, 0);
  return this.normalize( paths.join('/') );
};
```

### path.resolve([...paths])

这个接口的说明有点啰嗦。你可以想象现在你在shell下面，从左到右运行一遍`cd path`命令，最终获取的绝对路径/文件名，就是这个接口所返回的结果了。

比如 `path.resolve('/foo/bar', './baz')` 可以看成下面命令的结果

```bash
cd /foo/bar
cd ./baz
```

更多对比例子如下：

```javascript
var path = require('path');

// 假设当前工作路径是 /Users/a/Documents/git-code/nodejs-learning-guide/examples/2016.11.08-node-path

// 输出 /Users/a/Documents/git-code/nodejs-learning-guide/examples/2016.11.08-node-path
console.log( path.resolve('') )

// 输出 /Users/a/Documents/git-code/nodejs-learning-guide/examples/2016.11.08-node-path
console.log( path.resolve('.') )

// 输出 /foo/bar/baz
console.log( path.resolve('/foo/bar', './baz') );

// 输出 /foo/bar/baz
console.log( path.resolve('/foo/bar', './baz/') );

// 输出 /tmp/file
console.log( path.resolve('/foo/bar', '/tmp/file/') );

// 输出 /Users/a/Documents/git-code/nodejs-learning-guide/examples/2016.11.08-node-path/www/js/mod.js
console.log( path.resolve('www', 'js/upload', '../mod.js') );

```

## 路径解析

path.parse(path)

## path.normalize(filepath)

从官方文档的描述来看，path.normalize(filepath) 应该是比较简单的一个API，不过用起来总是觉得没底。

为什么呢？API说明过于简略了，包括如下：

* 如果路径为空，返回`.`，相当于当前的工作路径。
* 将对路径中重复的路径分隔符（比如linux下的`/`)合并为一个。
* 对路径中的`.`、`..`进行处理。（类似于shell里的`cd ..`）
* 如果路径最后有`/`，那么保留该`/`。

感觉stackoverflow上一个兄弟对这个API的解释更实在，[原文链接](http://stackoverflow.com/questions/10822574/difference-between-path-normalize-and-path-resolve-in-node-js)。

>In other words, path.normalize is "What is the shortest path I can take that will take me to the same place as the input"


代码示例如下。建议读者把代码拷贝出来运行下，看下实际效果。

```javascript
var path = require('path');
var filepath = '/tmp/demo/js/test.js';

var index = 0;

var compare = function(desc, callback){
  console.log('[用例%d]：%s', ++index, desc);
  callback();
  console.log('\n');
};

compare('路径为空', function(){
  // 输出 .
  console.log( path.normalize('') );
});

compare('路径结尾是否带/', function(){
  // 输出 /tmp/demo/js/upload
  console.log( path.normalize('/tmp/demo/js/upload') );

  // /tmp/demo/js/upload/
  console.log( path.normalize('/tmp/demo/js/upload/') );
});

compare('重复的/', function(){
  // 输出 /tmp/demo/js
  console.log( path.normalize('/tmp/demo//js') );
});

compare('路径带..', function(){
  // 输出 /tmp/demo/js
  console.log( path.normalize('/tmp/demo/js/upload/..') );
});

compare('相对路径', function(){
  // 输出 demo/js/upload/
  console.log( path.normalize('./demo/js/upload/') );

  // 输出 demo/js/upload/
  console.log( path.normalize('demo/js/upload/') );
});

compare('不常用边界', function(){
  // 输出 ..
  console.log( path.normalize('./..') );

  // 输出 ..
  console.log( path.normalize('..') );

  // 输出 ../
  console.log( path.normalize('../') );

  // 输出 /
  console.log( path.normalize('/../') );
  
  // 输出 /
  console.log( path.normalize('/..') );
});
```

感兴趣的可以看下 path.normalize(filepath) 的node源码如下：[传送门](https://github.com/nodejs/node/blob/master/lib/path.js)


## 相关链接

官方文档：https://nodejs.org/api/path.html#path_path
