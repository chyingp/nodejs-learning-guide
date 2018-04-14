## 模块概览

process是node的全局模块，作用比较直观。可以通过它来获得node进程相关的信息，比如运行node程序时的命令行参数。或者设置进程相关信息，比如设置环境变量。

## 环境变量：process.env

使用频率很高，node服务运行时，时常会判断当前服务运行的环境，如下所示

```js
if(process.env.NODE_ENV === 'production'){
    console.log('生产环境');
}else{
    console.log('非生产环境');
}
```

运行命令 `NODE_ENV=production node env.js`，输出如下

```bash
非生产环境
```

## 异步：process.nextTick(fn)

使用频率同样很高，通常用在异步的场景，来个简单的栗子：

```js
console.log('海贼王');
process.nextTick(function(){
    console.log('火影忍者');
});
console.log('死神');

// 输出如下
// 海贼王
// 死神
// 火影忍者
```

process.nextTick(fn) 咋看跟 setTimeout(fn, 0) 很像，但实际有实现及性能上的差异，我们先记住几个点：

* process.nextTick(fn) 将 fn 放到 node 事件循环的 下一个tick 里；
* process.nextTick(fn) 比 setTimetout(fn, 0) 性能高；

这里不打算深入讨论，感兴趣的可以点击[这里](https://cnodejs.org/topic/4f16442ccae1f4aa2700109b)进行了解。

## 获取命令行参数：process.argv

process.argv 返回一个数组，数组元素分别如下：

* 元素1：node
* 元素2：可执行文件的绝对路径
* 元素x：其他，比如参数等

```js
// print process.argv
process.argv.forEach(function(val, index, array) {
  console.log('参数' + index + ': ' + val);
});
```

运行命令 `NODE_ENV=dev node argv.js --env production`，输出如下。（不包含环境变量）

```bash
参数0: /Users/a/.nvm/versions/node/v6.1.0/bin/node
参数1: /Users/a/Documents/git-code/nodejs-learning-guide/examples/2016.11.22-node-process/argv.js
参数2: --env
参数3: production
```

## 获取node specific参数：process.execArgv

跟 process.argv 看着像，但差异很大。它会返回 node specific 的参数（也就是运行node程序特有的参数啦，比如 --harmony）。这部分参数不会出现在 process.argv 里。

我们来看个例子，相当直观。输入命令 `node --harmony execArgv.js --nick chyingp`， execArgv.js 代码如下：

```js
process.execArgv.forEach(function(val, index, array) {
  console.log(index + ': ' + val);
});
// 输出：
// 0: --harmony

process.argv.forEach(function(val, index, array) {
  console.log(index + ': ' + val);
});
// 输出：
// 0: /Users/a/.nvm/versions/node/v6.1.0/bin/node
// 1: /Users/a/Documents/git-code/nodejs-learning-guide/examples/2016.11.22-node-process/execArgv.js
// 2: --nick
// 3: chyingp
```

## 当前工作路径：process.cwd() vs process.chdir(directory)

* process.cwd()：返回当前工作路径
* process.chdir(directory)：切换当前工作路径

工作路径的用途不用过多解释了，直接上代码

```js
console.log('Starting directory: ' + process.cwd());
try {
  process.chdir('/tmp');
  console.log('New directory: ' + process.cwd());
}
catch (err) {
  console.log('chdir: ' + err);
}
```

输出如下：

```bash
Starting directory: /Users/a/Documents/git-code/nodejs-learning-guide/examples/2016.11.22-node-process
New directory: /private/tmp
```

## IPC相关

* process.connected：如果当前进程是子进程，且与父进程之间通过IPC通道连接着，则为true；
* process.disconnect()：断开与父进程之间的IPC通道，此时会将 process.connected 置为false；

首先是 connected.js，通过 fork 创建子进程（父子进程之间创建了IPC通道）

```js
var child_process = require('child_process');

child_process.fork('./connectedChild.js', {
  stdio: 'inherit'
});
```

然后，在 connectedChild.js 里面。

```js
console.log( 'process.connected: ' + process.connected );
process.disconnect();
console.log( 'process.connected: ' + process.connected );

// 输出：
// process.connected: true
// process.connected: false
```

## 其他

process.config：跟node的编译配置参数有关


## 标准输入/标准输出/标准错误输出：process.stdin、process.stdout

process.stdin、process.stdout、process.stderr 分别代表进程的标准输入、标准输出、标准错误输出。看官网的例子

```js
process.stdin.setEncoding('utf8');

process.stdin.on('readable', () => {
  var chunk = process.stdin.read();
  if (chunk !== null) {
    process.stdout.write(`data: ${chunk}`);
  }
});

process.stdin.on('end', () => {
  process.stdout.write('end');
});
```

执行程序，可以看到，程序通过 process.stdin 读取用户输入的同时，通过 process.stdout 将内容输出到控制台

```bash
hello
data: hello
world
data: world
```

process.stderr也差不多，读者可以自己试下。

## 用户组/用户 相关

process.seteuid(id)：
process.geteuid()：获得当前用户的id。（POSIX平台上才有效）

process.getgid(id)
process.getgid()：获得当前群组的id。（POSIX平台上才有效，群组、有效群组 的区别，请自行谷歌）

process.setegid(id)
process.getegid()：获得当前有效群组的id。（POSIX平台上才有效）

process.setroups(groups)：
process.getgroups()：获得附加群组的id。（POSIX平台上才有效，

process.setgroups(groups)：
process.setgroups(groups)：

process.initgroups(user, extra_group)：

## 当前进程信息

* process.pid：返回进程id。
* process.title：可以用它来修改进程的名字，当你用`ps`命令，同时有多个node进程在跑的时候，作用就出来了。

## 运行情况/资源占用情况

* process.uptime()：当前node进程已经运行了多长时间（单位是秒）。
* process.memoryUsage()：返回进程占用的内存，单位为字节。输出内容大致如下：

```js
{ 
    rss: 19181568, 
    heapTotal: 8384512, // V8占用的内容
    heapUsed: 4218408 // V8实际使用了的内存
}
```

* process.cpuUsage([previousValue])：CPU使用时间耗时，单位为毫秒。user表示用户程序代码运行占用的时间，system表示系统占用时间。如果当前进程占用多个内核来执行任务，那么数值会比实际感知的要大。官方例子如下：

```js
const startUsage = process.cpuUsage();
// { user: 38579, system: 6986 }

// spin the CPU for 500 milliseconds
const now = Date.now();
while (Date.now() - now < 500);

console.log(process.cpuUsage(startUsage));
// { user: 514883, system: 11226 }
```

* process.hrtime()：一般用于做性能基准测试。返回一个数组，数组里的值为 [[seconds, nanoseconds] （1秒等10的九次方毫微秒）。
注意，这里返回的值，是相对于过去一个随机的时间，所以本身没什么意义。仅当你将上一次调用返回的值做为参数传入，才有实际意义。

把官网的例子稍做修改：

```js
var time = process.hrtime();

setInterval(() => {
  var diff = process.hrtime(time);

  console.log(`Benchmark took ${diff[0] * 1e9 + diff[1]} nanoseconds`);
}, 1000);
```

输出大概如下：

```bash
Benchmark took 1006117293 nanoseconds
Benchmark took 2049182207 nanoseconds
Benchmark took 3052562935 nanoseconds
Benchmark took 4053410161 nanoseconds
Benchmark took 5056050224 nanoseconds
```

## node可执行程序相关信息

1. process.version：返回当前node的版本，比如'v6.1.0'。
2. process.versions：返回node的版本，以及依赖库的版本，如下所示。

```js
{ http_parser: '2.7.0',
  node: '6.1.0',
  v8: '5.0.71.35',
  uv: '1.9.0',
  zlib: '1.2.8',
  ares: '1.10.1-DEV',
  icu: '56.1',
  modules: '48',
  openssl: '1.0.2h' }
```

3. process.release：返回当前node发行版本的相关信息，大部分时候不会用到。具体字段含义可以看[这里](https://nodejs.org/api/process.html#process_process_release)。

```js
{
  name: 'node',
  lts: 'Argon',
  sourceUrl: 'https://nodejs.org/download/release/v4.4.5/node-v4.4.5.tar.gz',
  headersUrl: 'https://nodejs.org/download/release/v4.4.5/node-v4.4.5-headers.tar.gz',
  libUrl: 'https://nodejs.org/download/release/v4.4.5/win-x64/node.lib'
}
```

4. process.config：返回当前 node版本 编译时的参数，同样很少会用到，一般用来查问题。
5. process.execPath：node可执行程序的绝对路径，比如 '/usr/local/bin/node'

## 进程运行所在环境

* process.arch：返回当前系统的处理器架构（字符串），比如'arm', 'ia32', or 'x64'。
* process.platform：返回关于平台描述的字符串，比如 darwin、win32 等。

## 警告信息:process.emitWarning(warning);

v6.0.0新增的接口，可以用来抛出警告信息。最简单的例子如下，只有警告信息

```js
process.emitWarning('Something happened!');
// (node:50215) Warning: Something happened!
```

可以给警告信息加个名字，便于分类

```js
process.emitWarning('Something Happened!', 'CustomWarning');
// (node:50252) CustomWarning: Something Happened!
```

可以对其进行监听

```js
process.emitWarning('Something Happened!', 'CustomWarning');

process.on('warning', (warning) => {
  console.warn(warning.name);
  console.warn(warning.message);
  console.warn(warning.stack);
});

/*
(node:50314) CustomWarning: Something Happened!
CustomWarning
Something Happened!
CustomWarning: Something Happened!
    at Object.<anonymous> (/Users/a/Documents/git-code/nodejs-learning-guide/examples/2016.11.22-node-process/emitWarning.js:3:9)
    at Module._compile (module.js:541:32)
    at Object.Module._extensions..js (module.js:550:10)
    at Module.load (module.js:456:32)
    at tryModuleLoad (module.js:415:12)
    at Function.Module._load (module.js:407:3)
    at Function.Module.runMain (module.js:575:10)
    at startup (node.js:160:18)
    at node.js:445:3
*/    
```

也可以直接给个Error对象

```js
const myWarning = new Error('Warning! Something happened!');
myWarning.name = 'CustomWarning';

process.emitWarning(myWarning);
```

## 向进程发送信号：process.kill(pid, signal)

process.kill() 这个方法名可能会让初学者感到困惑，其实它并不是用来杀死进程的，而是用来向进程发送信号。举个例子：

```js
console.log('hello');

process.kill(process.pid, 'SIGHUP');

console.log('world');
```

输出如下，可以看到，最后一行代码并没有执行，因为向当前进程发送 SIGHUP 信号，进程退出所致。

```bash
hello
[1]    50856 hangup     node kill.js
```

可以通过监听 SIGHUP 事件，来阻止它的默认行为。

```js
process.on('SIGHUP', () => {
  console.log('Got SIGHUP signal.');
});

console.log('hello');

process.kill(process.pid, 'SIGHUP');

console.log('world');
```

测试结果比较意外，输出如下：（osx 10.11.4），SIGHUP 事件回调里的内容并没有输出。

```bash
hello
world
```

猜测是因为写标准输出被推到下一个事件循环导致（类似process.exit()小节提到的），再试下

```js
process.on('SIGHUP', () => {
  console.log('Got SIGHUP signal.');
});

setTimeout(function(){
  console.log('Exiting.');
}, 0);

console.log('hello');

process.kill(process.pid, 'SIGHUP');

console.log('world');
```

输出如下（其实并不能说明什么。。。知道真相的朋友请举手。。。）

```bash
hello
world
Exiting.
Got SIGHUP signal.
```

## 终止进程：process.exit([exitCode])、process.exitCode

1. process.exit([exitCode]) 可以用来立即退出进程。即使当前有操作没执行完，比如 process.exit() 的代码逻辑，或者未完成的异步逻辑。
2. 写数据到 process.stdout 之后，立即调用 process.exit() 是不保险的，因为在node里面，往 stdout 写数据是非阻塞的，可以跨越多个事件循环。于是，可能写到一半就跪了。比较保险的做法是，通过process.exitCode设置退出码，然后等进程自动退出。
3. 如果程序出现异常，必须退出不可，那么，可以抛出一个未被捕获的error，来终止进程，这个比 process.exit() 安全。

来段官网的例子镇楼：

```js
// How to properly set the exit code while letting
// the process exit gracefully.
if (someConditionNotMet()) {
  printUsageToStdout();
  process.exitCode = 1;
}
```

备注：整个 process.exit() 的接口说明，都在告诉我们 process.exit() 这个接口有多不可靠。。。还用吗。。。

## 事件

* beforeExit：进程退出之前触发，参数为 exitCode。（此时eventLoop已经空了）如果是显式调用 process.exit()退出，或者未捕获的异常导致退出，那么 beforeExit 不会触发。（我要，这事件有何用。。。）
* exit：

## TODO 待进一步验证

1. 官方文档里，对于 process.nextTick(fn) 有如下描述，如何构造用例进行测试？

>It runs before any additional I/O events (including timers) fire in subsequent ticks of the event loop.

2. process.channel：实际测试结果，即使父、子进程间存在IPC通道，process.channel 的值依旧是undefined.（测试方法有问题？）

## 相关链接

[Understanding process.nextTick()](https://howtonode.org/understanding-process-next-tick)

[nodejs 异步之 Timer &Tick; 篇](https://cnodejs.org/topic/4f16442ccae1f4aa2700109b)
