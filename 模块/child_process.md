## 模块概览

在node中，child_process这个模块非常重要。掌握了它，等于在node的世界开启了一扇新的大门。

举个简单的例子：

```javascript
const spawn = require('child_process').spawn;
const ls = spawn('ls', ['-lh', '/usr']);

ls.stdout.on('data', (data) => {
  console.log(`stdout: ${data}`);
});

ls.stderr.on('data', (data) => {
  console.log(`stderr: ${data}`);
});

ls.on('close', (code) => {
  console.log(`child process exited with code ${code}`);
});
```

## 几种创建子进程的方式

注意事项：

* 下面列出来的都是异步创建子进程的方式，每一种方式都有对应的同步版本。
* `.exec()`、`.execFile()`、`.fork()`底层都是通过`.spawn()`实现的。
* `.exec()`、`execFile()`额外提供了回调，当子进程停止的时候执行。

>child_process.spawn(command[, args][, options])
>child_process.exec(command[, options][, callback])
>child_process.execFile(file[, args][, options][, callback])
>child_process.fork(modulePath[, args][, options])

### child_process.exec(command[, options][, callback])

创建一个shell，然后在shell里执行命令。执行完成后，将stdout、stderr作为参数传入回调方法。

>spawns a shell and runs a command within that shell, passing the stdout and stderr to a callback function when complete.

例子如下：

1. 执行成功，`error`为`null`；执行失败，`error`为`Error`实例。`error.code`为错误码，
2. `stdout`、`stderr`为标准输出、标准错误。默认是字符串，除非`options.encoding`为`buffer`

```javascript
var exec = require('child_process').exec;

// 成功的例子
exec('ls -al', function(error, stdout, stderr){
    if(error) {
        console.error('error: ' + error);
        return;
    }
    console.log('stdout: ' + stdout);
    console.log('stderr: ' + typeof stderr);
});

// 失败的例子
exec('ls hello.txt', function(error, stdout, stderr){
    if(error) {
        console.error('error: ' + error);
        return;
    }
    console.log('stdout: ' + stdout);
    console.log('stderr: ' + stderr);
});
```

#### 参数说明：

* `cwd`：当前工作路径。
* `env`：环境变量。
* `encoding`：编码，默认是`utf8`。
* `shell`：用来执行命令的shell，unix上默认是`/bin/sh`，windows上默认是`cmd.exe`。
* `timeout`：默认是0。
* `killSignal`：默认是`SIGTERM`。
* `uid`：执行进程的uid。
* `gid`：执行进程的gid。
* `maxBuffer`：<Number> 标准输出、错误输出最大允许的数据量（单位为字节），如果超出的话，子进程就会被杀死。默认是200*1024（就是200k啦）

备注：

1. 如果`timeout`大于0，那么，当子进程运行超过`timeout`毫秒，那么，就会给进程发送`killSignal`指定的信号（比如`SIGTERM`）。
2. 如果运行没有出错，那么`error`为`null`。如果运行出错，那么，`error.code`就是退出代码（exist code），`error.signal`会被设置成终止进程的信号。（比如`CTRL+C`时发送的`SIGINT`）

#### 风险项

传入的命令，如果是用户输入的，有可能产生类似sql注入的风险，比如

```
exec('ls hello.txt; rm -rf *', function(error, stdout, stderr){
    if(error) {
        console.error('error: ' + error);
        // return;
    }
    console.log('stdout: ' + stdout);
    console.log('stderr: ' + stderr);
});
```

#### 备注事项

Note: Unlike the exec(3) POSIX system call, child_process.exec() does not replace the existing process and uses a shell to execute the command.

### child_process.execFile(file[, args][, options][, callback])

跟`.exec()`类似，不同点在于，没有创建一个新的shell。至少有两点影响

1. 比`child_process.exec()`效率高一些。（实际待测试）
2. 一些操作，比如I/O重定向，文件glob等不支持。

>similar to child_process.exec() except that it spawns the command directly without first spawning a shell.

`file`：<String> 可执行文件的名字，或者路径。

例子：

```javascript
var child_process = require('child_process');

child_process.execFile('node', ['--version'], function(error, stdout, stderr){
    if(error){
        throw error;
    }
    console.log(stdout);
});

child_process.execFile('/Users/a/.nvm/versions/node/v6.1.0/bin/node', ['--version'], function(error, stdout, stderr){
    if(error){
        throw error;
    }
    console.log(stdout);
});
```

====== 扩展阅读 =======

从node源码来看，`exec()`、`execFile()`最大的差别，就在于是否创建了shell。（execFile()内部，options.shell === false），那么，可以手动设置shell。以下代码差不多是等价的。win下的shell设置有所不同，感兴趣的同学可以自己试验下。

备注：execFile()内部最终还是通过spawn()实现的， 如果没有设置 {shell: '/bin/bash'}，那么 spawm() 内部对命令的解析会有所不同，execFile('ls -al .') 会直接报错。

```javascript
var child_process = require('child_process');
var execFile = child_process.execFile;
var exec = child_process.exec;

exec('ls -al .', function(error, stdout, stderr){
    if(error){
        throw error;
    }
    console.log(stdout);
});

execFile('ls -al .', {shell: '/bin/bash'}, function(error, stdout, stderr){
    if(error){
        throw error;
    }
    console.log(stdout);
});
```


### child_process.fork(modulePath[, args][, options])

`modulePath`：子进程运行的模块。

参数说明：（重复的参数说明就不在这里列举）

* `execPath`：<String> 用来创建子进程的可执行文件，默认是`/usr/local/bin/node`。也就是说，你可通过`execPath`来指定具体的node可执行文件路径。（比如多个node版本）
* `execArgv`：<Array> 传给可执行文件的字符串参数列表。默认是`process.execArgv`，跟父进程保持一致。
* `silent`：<Boolean> 默认是`false`，即子进程的`stdio`从父进程继承。如果是`true`，则直接`pipe`向子进程的`child.stdin`、`child.stdout`等。
* `stdio`：<Array> 如果声明了`stdio`，则会覆盖`silent`选项的设置。


例子1：silent

**parent.js**

```javascript
var child_process = require('child_process');

// 例子一：会打印出 output from the child
// 默认情况，silent 为 false，子进程的 stdout 等
// 从父进程继承
child_process.fork('./child.js', {
    silent: false
});

// 例子二：不会打印出 output from the silent child
// silent 为 true，子进程的 stdout 等
// pipe 向父进程
child_process.fork('./silentChild.js', {
    silent: true
});

// 例子三：打印出 output from another silent child
var child = child_process.fork('./anotherSilentChild.js', {
    silent: true
});

child.stdout.setEncoding('utf8');
child.stdout.on('data', function(data){
    console.log(data);
});
```

**child.js**

```javascript
console.log('output from the child');
```

**silentChild.js**

```javascript
console.log('output from the silent child');
```

**anotherSilentChild.js**

```javascript
console.log('output from another silent child');
```

例子二：ipc

parent.js

```javascript
var child_process = require('child_process');

var child = child_process.fork('./child.js');

child.on('message', function(m){
    console.log('message from child: ' + JSON.stringify(m));
});

child.send({from: 'parent'});
```
child.js
```javascript
process.on('message', function(m){
    console.log('message from parent: ' + JSON.stringify(m));
});

process.send({from: 'child'});
```

运行结果

```powershell
➜  ipc git:(master) ✗ node parent.js
message from child: {"from":"child"}
message from parent: {"from":"parent"}
```

例子三：execArgv

首先，process.execArgv的定义，参考[这里](https://nodejs.org/api/process.html#process_process_execargv)。设置`execArgv`的目的一般在于，让子进程跟父进程保持相同的执行环境。

比如，父进程指定了`--harmony`，如果子进程没有指定，那么就要跪了。

parent.js

```javascript
var child_process = require('child_process');

console.log('parent execArgv: ' + process.execArgv);

child_process.fork('./child.js', {
    execArgv: process.execArgv
});
```

child.js

```javascript
console.log('child execArgv: ' + process.execArgv);
```

运行结果

```powershell
➜  execArgv git:(master) ✗ node --harmony parent.js
parent execArgv: --harmony
child execArgv: --harmony
```

例子3：execPath（TODO 待举例子）

### child_process.spawn(command[, args][, options])

`command`：要执行的命令

options参数说明：

* `argv0`：[String] 这货比较诡异，在uninx、windows上表现不一样。有需要再深究。
* `stdio`：[Array] | [String] 子进程的stdio。参考[这里](https://nodejs.org/api/child_process.html#child_process_options_stdio)
* `detached`：[Boolean] 让子进程独立于父进程之外运行。同样在不同平台上表现有差异，具体参考[这里](https://nodejs.org/api/child_process.html#child_process_options_detached)
* `shell`：[Boolean] | [String] 如果是`true`，在shell里运行程序。默认是`false`。（很有用，比如 可以通过 /bin/sh -c xxx 来实现 .exec() 这样的效果）

例子1：基础例子

```javascript
var spawn = require('child_process').spawn;
var ls = spawn('ls', ['-al']);

ls.stdout.on('data', function(data){
    console.log('data from child: ' + data);
});


ls.stderr.on('data', function(data){
    console.log('error from child: ' + data);
});

ls.on('close', function(code){
    console.log('child exists with code: ' + code);
});
```

例子2：声明stdio

```javascript
var spawn = require('child_process').spawn;
var ls = spawn('ls', ['-al'], {
    stdio: 'inherit'
});

ls.on('close', function(code){
    console.log('child exists with code: ' + code);
});
```

例子3：声明使用shell

```javascript
var spawn = require('child_process').spawn;

// 运行 echo "hello nodejs" | wc
var ls = spawn('bash', ['-c', 'echo "hello nodejs" | wc'], {
    stdio: 'inherit',
    shell: true
});

ls.on('close', function(code){
    console.log('child exists with code: ' + code);
});
```

例子4：错误处理，包含两种场景，这两种场景有不同的处理方式。

* 场景1：命令本身不存在，创建子进程报错。
* 场景2：命令存在，但运行过程报错。

```javascript
var spawn = require('child_process').spawn;
var child = spawn('bad_command');

child.on('error', (err) => {
  console.log('Failed to start child process 1.');
});

var child2 = spawn('ls', ['nonexistFile']);

child2.stderr.on('data', function(data){
    console.log('Error msg from process 2: ' + data);
});

child2.on('error', (err) => {
  console.log('Failed to start child process 2.');
});
```

运行结果如下。

```powershell
➜  spawn git:(master) ✗ node error/error.js
Failed to start child process 1.
Error msg from process 2: ls: nonexistFile: No such file or directory
```

例子5：echo "hello nodejs" | grep "nodejs"

```javascript
// echo "hello nodejs" | grep "nodejs"
var child_process = require('child_process');

var echo = child_process.spawn('echo', ['hello nodejs']);
var grep = child_process.spawn('grep', ['nodejs']);

grep.stdout.setEncoding('utf8');

echo.stdout.on('data', function(data){
    grep.stdin.write(data);
});

echo.on('close', function(code){
    if(code!==0){
        console.log('echo exists with code: ' + code);
    }
    grep.stdin.end();
});

grep.stdout.on('data', function(data){
    console.log('grep: ' + data);
});

grep.on('close', function(code){
    if(code!==0){
        console.log('grep exists with code: ' + code);
    }
});
```

运行结果：

```powershell
➜  spawn git:(master) ✗ node pipe/pipe.js
grep: hello nodejs
```

## 关于`options.stdio`

默认值：['pipe', 'pipe', 'pipe']，这意味着：

1. child.stdin、child.stdout 不是`undefined`
2. 可以通过监听 `data` 事件，来获取数据。

### 基础例子

```javascript
var spawn = require('child_process').spawn;
var ls = spawn('ls', ['-al']);

ls.stdout.on('data', function(data){
    console.log('data from child: ' + data);
});

ls.on('close', function(code){
    console.log('child exists with code: ' + code);
});
```

### 通过child.stdin.write()写入

```javascript
var spawn = require('child_process').spawn;
var grep = spawn('grep', ['nodejs']);

setTimeout(function(){
    grep.stdin.write('hello nodejs \n hello javascript');
    grep.stdin.end();
}, 2000);

grep.stdout.on('data', function(data){
    console.log('data from grep: ' + data);
});

grep.on('close', function(code){
    console.log('grep exists with code: ' + code);
});
```

## 异步 vs 同步

大部分时候，子进程的创建是异步的。也就是说，它不会阻塞当前的事件循环，这对于性能的提升很有帮助。

当然，有的时候，同步的方式会更方便（阻塞事件循环），比如通过子进程的方式来执行shell脚本时。

node同样提供同步的版本，比如：

* spawnSync()
* execSync()
* execFileSync()

## 关于`options.detached`

由于木有在windows上做测试，于是先贴原文

>On Windows, setting options.detached to true makes it possible for the child process to continue running after the parent exits. The child will have its own console window. Once enabled for a child process, it cannot be disabled.

在非window是平台上的表现

>On non-Windows platforms, if options.detached is set to true, the child process will be made the leader of a new process group and session. Note that child processes may continue running after the parent exits regardless of whether they are detached or not. See setsid(2) for more information.

### 默认情况：父进程等待子进程结束。

子进程。可以看到，有个定时器一直在跑

```javascript
var times = 0;
setInterval(function(){
    console.log(++times);
}, 1000);
```

运行下面代码，会发现父进程一直hold着不退出。

```
var child_process = require('child_process');
child_process.spawn('node', ['child.js'], {
    // stdio: 'inherit'
});
```

### 通过child.unref()让父进程退出

调用`child.unref()`，将子进程从父进程的事件循环中剔除。于是父进程可以愉快的退出。这里有几个要点

1. 调用`child.unref()`
2. 设置`detached`为`true`
3. 设置`stdio`为`ignore`（这点容易忘）

```javascript
var child_process = require('child_process');
var child = child_process.spawn('node', ['child.js'], {
    detached: true,
    stdio: 'ignore'  // 备注：如果不置为 ignore，那么 父进程还是不会退出
    // stdio: 'inherit'
});

child.unref();
```

### 将`stdio`重定向到文件

除了直接将stdio设置为`ignore`，还可以将它重定向到本地的文件。

```javascript
var child_process = require('child_process');
var fs = require('fs');

var out = fs.openSync('./out.log', 'a');
var err = fs.openSync('./err.log', 'a');

var child = child_process.spawn('node', ['child.js'], {
    detached: true,
    stdio: ['ignore', out, err]
});

child.unref();
```

## exec()与execFile()之间的区别

首先，exec() 内部调用 execFile() 来实现，而 execFile() 内部调用 spawn() 来实现。

>exec() -> execFile() -> spawn()

其次，execFile() 内部默认将 options.shell 设置为false，exec() 默认不是false。

## Class: ChildProcess

* 通过`child_process.spawn()`等创建，一般不直接用构造函数创建。
* 继承了`EventEmitters`，所以有`.on()`等方法。

### 各种事件

### close

当stdio流关闭时触发。这个事件跟`exit`不同，因为多个进程可以共享同个stdio流。   
参数：code（退出码，如果子进程是自己退出的话），signal（结束子进程的信号）
问题：code一定是有的吗？（从对code的注解来看好像不是）比如用`kill`杀死子进程，那么，code是？

### exit
参数：code、signal，如果子进程是自己退出的，那么`code`就是退出码，否则为null；如果子进程是通过信号结束的，那么，`signal`就是结束进程的信号，否则为null。这两者中，一者肯定不为null。
注意事项：`exit`事件触发时，子进程的stdio stream可能还打开着。（场景？）此外，nodejs监听了SIGINT和SIGTERM信号，也就是说，nodejs收到这两个信号时，不会立刻退出，而是先做一些清理的工作，然后重新抛出这两个信号。（目测此时js可以做清理工作了，比如关闭数据库等。TODO 疑问：js里面是否也可以不退出？？？？）

SIGINT：interrupt，程序终止信号，通常在用户按下CTRL+C时发出，用来通知前台进程终止进程。
SIGTERM：terminate，程序结束信号，该信号可以被阻塞和处理，通常用来要求程序自己正常退出。shell命令kill缺省产生这个信号。如果信号终止不了，我们才会尝试SIGKILL（强制终止）。

>Also, note that Node.js establishes signal handlers for SIGINT and SIGTERM and Node.js processes will not terminate immediately due to receipt of those signals. Rather, Node.js will perform a sequence of cleanup actions and then will re-raise the handled signal.

### error

当发生下列事情时，error就会被触发。当error触发时，exit可能触发，也可能不触发。（内心是崩溃的）
* 无法创建子进程。
* 进程无法kill。（TODO 例子）
* 向子进程发送消息失败。（TODO  例子）

### message

当采用`process.send()`来发送消息时触发。
参数：`message`，为json对象，或者primitive value；`sendHandle`，net.Socket对象，或者net.Server对象（TODO 什么时候是什么对象？？？）

**.connected**：当调用`.disconnected()`时，设为false。代表是否能够从子进程接收消息，或者对子进程发送消息。

**.disconnect()**：关闭父进程、子进程之间的IPC通道。当这个方法被调用时，`disconnect`事件就会触发。如果子进程是node实例（通过child_process.fork()创建），那么在子进程内部也可以主动调用`process.disconnect()`来终止IPC通道。参考[process.disconnect](https://nodejs.org/api/process.html#process_process_disconnect)。
疑问：比如fork了个子进程，子进程里启动了http server，那么，父进程调用 `.disconnect()`的影响？（TODO 求验证？？？）

## 非重要的备忘点

### windows平台上的`cmd`、`bat`

>The importance of the distinction between child_process.exec() and child_process.execFile() can vary based on platform. On Unix-type operating systems (Unix, Linux, OSX) child_process.execFile() can be more efficient because it does not spawn a shell. On Windows, however, .bat and .cmd files are not executable on their own without a terminal, and therefore cannot be launched using child_process.execFile(). When running on Windows, .bat and .cmd files can be invoked using child_process.spawn() with the shell option set, with child_process.exec(), or by spawning cmd.exe and passing the .bat or .cmd file as an argument (which is what the shell option and child_process.exec() do).

```javascript
// On Windows Only ...
const spawn = require('child_process').spawn;
const bat = spawn('cmd.exe', ['/c', 'my.bat']);

bat.stdout.on('data', (data) => {
  console.log(data);
});

bat.stderr.on('data', (data) => {
  console.log(data);
});

bat.on('exit', (code) => {
  console.log(`Child exited with code ${code}`);
});

// OR...
const exec = require('child_process').exec;
exec('my.bat', (err, stdout, stderr) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log(stdout);
});
```


### 进程标题 

Note: Certain platforms (OS X, Linux) will use the value of argv[0] for the process title while others (Windows, SunOS) will use command.

Note: Node.js currently overwrites argv[0] with process.execPath on startup, so process.argv[0] in a Node.js child process will not match the argv0 parameter passed to spawn from the parent, retrieve it with the process.argv0 property instead.


### 代码运行次序的问题

**p.js**

```javascript
const cp = require('child_process');
const n = cp.fork(`${__dirname}/sub.js`);

console.log('1');

n.on('message', (m) => {
  console.log('PARENT got message:', m);
});

console.log('2');

n.send({ hello: 'world' });

console.log('3');
```

**sub.js**

```javascript
console.log('4');
process.on('message', (m) => {
  console.log('CHILD got message:', m);
});

process.send({ foo: 'bar' });
console.log('5');
```

运行`node p.js`，打印出来的内容如下

```powershell
➜  ch node p.js       
1
2
3
4
5
PARENT got message: { foo: 'bar' }
CHILD got message: { hello: 'world' }
```

再来个例子

```javascript
// p2.js
var fork = require('child_process').fork;

console.log('p: 1');

fork('./c2.js');

console.log('p: 2');

// 从测试结果来看，同样是70ms，有的时候，定时器回调比子进程先执行，有的时候比子进程慢执行。
const t = 70;
setTimeout(function(){
    console.log('p: 3 in %s', t);
}, t);


// c2.js
console.log('c: 1');
```

### 关于NODE_CHANNEL_FD

child_process.fork()时，如果指定了execPath，那么父、子进程间通过NODE_CHANNEL_FD 进行通信。

>Node.js processes launched with a custom execPath will communicate with the parent process using the file descriptor (fd) identified using the environment variable NODE_CHANNEL_FD on the child process. The input and output on this fd is expected to be line delimited JSON objects.


## 相关链接

官方文档：https://nodejs.org/api/child_process.html
