## 模块概览

console模块提供了基础的调试功能。使用很简单，常用的API主要有 console.log()、console.error()。

此外，可以基于Console类，方便的扩展出自己的console实例，比如把调试信息打印到文件里，而部署输出在控制台上。

直接看例子。

## 基础例子

无特殊说明，日志都是默认打印到控制台。最常用的是console.log()、console.error()两个方法。

* console.log(msg)：普通日志打印。
* console.error(msg)：错误日志打印。
* console.info(msg)：等同于console.log(msg)
* console.warn(msg)：等同于console.error(msg)

例子如下：

```js
console.log('log: hello');
console.log('log: hello', 'chyingp');
console.log('log: hello %s', 'chyingp');

console.error('error: hello');
console.error('error: hello', 'chyingp');
console.error('error: hello %s', 'chyingp');

// 输出如下：
// log: hello
// log: hello chyingp
// log: hello chyingp
// error: hello
// error: hello chyingp
// error: hello chyingp
```

## 自定义stdout

可以通过 new console.Console(stdout, stderr) 来创建自定义的console实例，这个功能很实用。

比如你想将调试信息打印到本地文件，那么，就可以通过如下代码实现。

```js
var fs = require('fs');
var file = fs.createWriteStream('./stdout.txt');

var logger = new console.Console(file, file);

logger.log('hello');
logger.log('word');

// 备注：内容输出到 stdout.txt里，而不是打印到控制台
```

## 计时

通过`console.time(label)`和`console.timeEnd(label)`，来打印出两个时间点之间的时间差，单位是毫秒，例子如下。

```js
var timeLabel = 'hello'

console.time(timeLabel);

setTimeout(console.timeEnd, 1000, timeLabel);
// 输入出入：
// hello: 1005.505ms
```

## 断言

通过 console.assert(value, message) 进行断言。如果value不为true，那么抛出`AssertionError`异常，并中断程序执行。

如下代码所示，第二个断言报错，程序停止执行。

```js
console.assert(true, '1、right');
console.assert(false, '2、right', '2、wrong');

// 输出如下：
// assert.js:90
//   throw new assert.AssertionError({
//     ^
//     AssertionError: 2、right 2、wrong
//         at Console.assert (console.js:95:23)
```

为避免程序异常退出，需要对上面的异常进行处理，比如：

```js
try{
    console.assert(false, 'error occurred');
}catch(e){
    console.log(e.message);
}

// 输出如下：
// error occurred
```

## 打印错误堆栈：console.trace(msg)

将msg打印到标准错误输出流里，包含当前代码的位置和堆栈信息。

```js
console.trace('trace is called');

// 输出如下：
// Trace: trace is called
//     at Object.<anonymous> (/Users/a/Documents/git-code/nodejs-learning-guide/examples/2016.12.01-console/trace.js:1:71)
//     at Module._compile (module.js:541:32)
//     at Object.Module._extensions..js (module.js:550:10)
//     at Module.load (module.js:456:32)
//     at tryModuleLoad (module.js:415:12)
//     at Function.Module._load (module.js:407:3)
//     at Function.Module.runMain (module.js:575:10)
//     at startup (node.js:160:18)
//     at node.js:445:3
```

## 深层打印

很少关注 console.dir(obj)，因为大部分时候表现跟 console.log(obj) 差不多，看例子

```js
var obj = {
    nick: 'chyingp'
};

console.log(obj);  // 输出：{ nick: 'chyingp' }
console.dir(obj);  // 输出：{ nick: 'chyingp' }
```

但当obj的层级比较深时，用处就出来了。可以通过`depth`自定义打印的层级数，默认是2，这对于调试很有帮助。

```js
var obj2 = {
    human: {
        man: {
            info: {
                nick: 'chyingp'
            }
        }
    }
};

console.log(obj2);  // 输出：{ human: { man: { info: [Object] } } }
console.dir(obj2);  // 输出：{ human: { man: { info: [Object] } } }

console.dir(obj2, {depth: 3});  // 输出：{ human: { man: { info: { nick: 'chyingp' } } } }
```

## 相关链接

官方文档：https://nodejs.org/api/console.html
