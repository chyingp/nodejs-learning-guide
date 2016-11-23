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

运行命令 `node argv.js --env production`，输出如下。

```bash
参数0: /Users/a/.nvm/versions/node/v6.1.0/bin/node
参数1: /Users/a/Documents/git-code/nodejs-learning-guide/examples/2016.11.22-node-process/argv.js
参数2: --env
参数3: production
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

* process.connected
* process.channel：

## 其他

process.config：跟node的编译配置参数有关

process.cpuUsage([previousValue])：使用时间耗时

```js
const startUsage = process.cpuUsage();
// { user: 38579, system: 6986 }

// spin the CPU for 500 milliseconds
const now = Date.now();
while (Date.now() - now < 500);

console.log(process.cpuUsage(startUsage));
// { user: 514883, system: 11226 }
```

process.hrtime()：一般用于做性能基准测试。返回一个数组，数组里的值...

```js
var time = process.hrtime();
// [ 1800216, 25 ]

setTimeout(() => {
  var diff = process.hrtime(time);
  // [ 1, 552 ]

  console.log(`Benchmark took ${diff[0] * 1e9 + diff[1]} nanoseconds`);
  // benchmark took 1000000527 nanoseconds
}, 1000);
```

## 标准输入/标准输出/标准错误输出：process.stdin、process.stdout

process.stdin、process.stdout分别代表进程的标准输入、标准输出。看官网的例子

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

## TODO

官方文档里，对于 process.nextTick(fn) 有如下描述，如何构造用例进行测试？

>It runs before any additional I/O events (including timers) fire in subsequent ticks of the event loop.

## 相关链接

[Understanding process.nextTick()](https://howtonode.org/understanding-process-next-tick)

[nodejs 异步之 Timer &Tick; 篇](https://cnodejs.org/topic/4f16442ccae1f4aa2700109b)
