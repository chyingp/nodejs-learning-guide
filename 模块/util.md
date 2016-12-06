## debuglog(section)

很有用的调试方法。可以通过 util.debuglog(name) 来创建一个调试fn，这个fn的特点是，只有在运行程序时候，声明环境变量NODE_DEBUG=name，才会打印出调试信息。

可以看下面的例子，直接运行 `node debuglog.js`，没有任何输出。需要`NODE_DEBUG=foo`，才会有打印信息.

```js
var util = require('util');
var logger = util.debuglog('foo');

logger('hello');
```

如下所示，注意，6347 是当前进程id。

```bash
➜  2016.12.02-util git:(master) ✗ NODE_DEBUG=foo node debuglog.js
FOO 6347: hello world
```

此外，还可以一次指定多个`name`，通过逗号分隔。

```js
var util = require('util');
var firstLogger = util.debuglog('first');
var secondLogger = util.debuglog('second');
var thirdLogger = util.debuglog('third');

firstLogger('hello');
secondLogger('hello');
thirdLogger('hello');
```

运行如下：

```bash
FOO 6347: hello world
➜  2016.12.02-util git:(master) ✗ NODE_DEBUG=first,second node debuglog.js
FIRST 6456: hello
SECOND 6456: hello
```

## 将方法标识为作废：util.deprecate(fn, str)

将`fn`包裹一层，并返回一个新的函数`fn2`。调用`fn2`时，同样完成`fn`原有的功能，但同时会打印出错误日志，提示方法已作废，具体的提示信息就是第二个参数`str`。

```js
var util = require('util');
var foo = function(){
    console.log('foo');
};

var foo2 = util.deprecate(foo, 'foo is deprecate');

foo2();

// 输出如下：
// foo
// (node:6608) DeprecationWarning: foo is deprecate
```

如果嫌错误提示信息烦人，可以通过`--no-deprecation`参数禁掉，可以参考[这里](https://nodejs.org/api/util.html#util_util_deprecate_function_string)。

```bash
➜  2016.12.02-util git:(master) ✗ node --no-deprecation deprecate.js 
foo
```

## 格式化打印：util.format(format[, ...args])

格式化打印大家应该比较熟悉了，基本每种语言里都有自己的实现，直接上例子。

```js
var util = require('util');

console.log( util.format('hello %s', 'world') );
// 输出：hello world

console.log( util.format('1 + 1 = %d', 2) );
// 输出：1 + 1 = 2

console.log( util.format('info: %j', {nick: 'chyingp'}) );
// 输出：info: {"nick":"chyingp"}

console.log( util.format('%s is %d age old', 'chyingp') );
// 输出：chyingp is %d age old

console.log( util.format('%s is a man', 'chyingp', 'indeed') );
// 输出：chyingp is a man indeed
```

## 调试方法：util.inspect(obj[, options])

非常实用的一个方法，参数说明如下：

* obj：js原始值，或者对象。
* options：配置参数，包含下面选项
    * showHidden：如果是true的话，obj的非枚举属性也会被展示出来。默认是false。
    * depth：如果obj是对象，那么，depth限制对象递归展示的层级，这对可读性有一定的好处，默认是2。如果设置为null，则不做限制。
    * colors：自定义配色方案。
    * showProxy：
    * maxArrayLength：如果obj是数组，那么限制最大可展示的数组个数。默认是100，如果设置为null，则不做限制。如果设置为0或负数，则一个都不展示。

```js
var util = require('util');

var obj = {};

Object.defineProperty(obj, 'nick', {
  enumerable: false,  
  value: 'chyingp'
});

console.log( util.inspect(obj) );
// 输出：{}

console.log( util.inspect(obj, {showHidden: true}) );
// 输出：{ [nick]: 'chyingp' }
```