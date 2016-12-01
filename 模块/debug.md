## 写在前面

谈到node断点调试，目前主要有三种方式，通过`node内置调试工具`、`通过IDE（如vscode）`、`通过node-inspector`，三者本质上差不多。本文着重点在于介绍 **如何在本地通过node-inspector 调试远程服务器上的node代码**。

在进入主题之前，首先会对三种调试方式进行入门讲解，方便新手理解后面的内容。至于老司机们，可以直接跳到主题去。


## 方式一：内置debug功能

#### 进入调试模式（在第1行断点）

```powershell
node debug app.js
```


![clipboard.png](https://segmentfault.com/img/bVCNET)



#### 进入调试模式（在第n行断点）

比如要在第3行断点。

方式一：通过`debugger`


![clipboard.png](https://segmentfault.com/img/bVCNE6)


方式二：通过`sb(line)`。


![clipboard.png](https://segmentfault.com/img/bVCNE7)



#### 执行下一步

通过`next`命令。


![clipboard.png](https://segmentfault.com/img/bVCNE9)


#### 跳到下一个断点

通过`cont`命令。


![clipboard.png](https://segmentfault.com/img/bVCNFa)


#### 查看某个变量的值

输入`repl`命令后，再次输入变量名，就可以看到变量对应的值。如果想继续执行代码，可以按`ctrl+c`退出。


![clipboard.png](https://segmentfault.com/img/bVCNFb)


#### 添加/删除watch

* 通过`watch(expr)`来添加监视对象。
* 通过`watchers`查看当前所有的监视对象。
* 通过`unwatch(expr)`来删除监视对象。

添加watch：


![clipboard.png](https://segmentfault.com/img/bVCNFc)


删除watch：


![clipboard.png](https://segmentfault.com/img/bVCNFd)



#### 进入/跳出函数（step in、step out）

* 进入函数：通过`step`或者`s`。
* 跳出函数：通过`out`或者`o`。

示例代码如下，假设代码运行到`logger(str);`这一行，首先跳进函数内部，再跳出函数。

```
var nick = 'chyingp';
var country = 'China';

var str = nick + ' live in ' + country;

var logger = function(msg){
    console.log(msg); // 这里
    console.log('这行会跳过'); // 跳过这行
};

logger(str);  // 假设运行到这里，想要进入logger方法

console.log(str);
```

示例截图如下：


![clipboard.png](https://segmentfault.com/img/bVCNFh)


#### 多个文件断点

通过`setBreakpoint('script.js', 1), sb(...)`，在某个文件某一行添加断点。反正我是没成功过。。。怎么看都是bug。。。


#### 重新运行

每次都退出然后`node debug app.js`相当烦。直接用`restart`


![clipboard.png](https://segmentfault.com/img/bVCNFi)


#### 远程调试

比如远程机器ip是`192.168.1.126`，在远程机器上进入调试模式

```powershell
[root@localhost ex]# node --debug-brk app.js
Debugger listening on port 5858
```

然后，在本地机器通过`node debug 192.168.1.126:5858`连接远程机器进行调试。

```powershell
node debug 192.168.1.126:5858
```

如下：

```powershell
➜  /tmp node debug 192.168.1.126:5858
connecting to 192.168.1.126:5858 ... ok
break in /tmp/ex/app.js:1
> 1 var Logger = require('./logger');
  2 
  3 Logger.info('hello');
debug> n
break in /tmp/ex/app.js:3
  1 var Logger = require('./logger');
  2 
> 3 Logger.info('hello');
  4 
  5 });
```

当然，还可以通过pid进行远程调试，这里就不举例。

参考：https://nodejs.org/api/debugger.html#debugger_advanced_usage

## 方式二：通过IDE(vscode)

首先，在vscode里打开项目


![clipboard.png](https://segmentfault.com/img/bVCNFl)


然后，添加调试配置。主要需要修改的是可执行文件的路径。


![clipboard.png](https://segmentfault.com/img/bVCNFm)


点击代码左侧添加断点。


![clipboard.png](https://segmentfault.com/img/bVCNFp)


开始调试


![clipboard.png](https://segmentfault.com/img/bVCNFr)


顺利断点，左侧的变量、监视对象，右侧的调试工具栏，用过`chrome dev tool`的同学应该很熟悉，不赘述。


![clipboard.png](https://segmentfault.com/img/bVCNFs)


## 方式三：通过node-inspector

首先，安装`node-inspector`。

```powershell
npm install -g node-inspector
```

#### 方式一：通过`node-debug`启动调试

启动调试，它会自动帮你在浏览器里打开调试界面。

```powershell
➜  debugger git:(master) ✗ node-debug app.js
Node Inspector v0.12.8
Visit http://127.0.0.1:8080/?port=5858 to start debugging.
Debugging `app.js`

Debugger listening on port 5858
```

调试界面如下，简直不能更亲切。


![clipboard.png](https://segmentfault.com/img/bVCNFt)


#### 方式二：更加灵活的方式

步骤1：通过`node-inspector`启动Node Inspector Server

```powershell
➜  debugger git:(master) ✗ node-inspector 
Node Inspector v0.12.8
Visit http://127.0.0.1:8080/?port=5858 to start debugging.
```

步骤2：通过传统方式启动调试。加入`--debug-brk`，好让代码在第一行断住。

```powershell
➜  debugger git:(master) ✗ node --debug-brk app.js
Debugger listening on port 5858
```

步骤3：在浏览器里打开调试UI界面。就是步骤1里打印出来的地址 http://127.0.0.1:8080/?port=5858。成功



![clipboard.png](https://segmentfault.com/img/bVCNFu)



#### 实现原理

从上面的例子不难猜想到。（不负责任猜想）

* 通过`node --debug-brk`启动调试，监听`5858`端口。
* `node-inspector`启动服务，监听8080端口。
* 在浏览器里访问`http://127.0.0.1:8080/?port=5858`。可以看到`port=5858`这个参数。结合之前讲到的node内置远程调试的功能，可以猜想，在返回UI调试界面的同时，服务内部通过`5858`端口开始了断点调试。

另外，从下面截图可以看出，UI调试工具（其实是个网页）跟 `inspector服务` 之间通过`websocket`进行通信。

用户在界面上操作时，比如设置断点，就向 `inspector服务` 发送一条消息，`inspector服务` 在内部通过v8调试器来实现代码的断点。


![clipboard.png](https://segmentfault.com/img/bVCNFC)



可以看到，用到了`v8-debug`，这个就待深挖了。


![clipboard.png](https://segmentfault.com/img/bVCNFD)


## 通过node-inspector调试远程代码

细心的同学可能会发现，node远程调试其实在上面`node-inspector`章节的讲解里已经覆盖到了。这里还是来个实际的例子。

假设我们的node代码`app.js`运行在阿里云的服务器上，服务器ip是`xxx.xxx.xxx.xxx`。

首先，服务器上启动node-inspector服务

```powershell
[root@iZ94wb7tioqZ ~]# node-inspector 
Node Inspector v0.12.8
Visit http://127.0.0.1:8080/?port=5858 to start debugging.
```

其次，通过`--debug-brk`参数，进入调试模式

```powershell
[root@iZ94wb7tioqZ ex]# node --debug-brk app.js
Debugger listening on port 5858
```

最后，在本地通过ip地址愉快的访问调试界面。是不是很简单捏。


![clipboard.png](https://segmentfault.com/img/bVCNFF)


#### 常见问题：安全限制

远程调试常见的问题就是请求被拒绝。这是服务器安全策略的限制。遇到这种情况，开放端口就完事了。


![clipboard.png](https://segmentfault.com/img/bVCNHD)


在我们的云主机上，默认安装了`firewall-cmd`，可以通过`--add-port`选项来开放`8080`端口的开放。如果本机没有安装`firewall-cmd`，也可以通过`iptables`来实现同样的功能。

```powershell
[root@iZ94wb7tioqZ ex]# firewall-cmd --add-port=8080/tcp
success
```

然后，就可以愉快的远程调试了。


![clipboard.png](https://segmentfault.com/img/bVCNHE)

 

## 相关链接

[Node Debugger](https://nodejs.org/api/debugger.html)

[How Does a C Debugger Work?](http://blog.0x972.info/?d=2014/11/13/10/40/50-how-does-a-debugger-work)

[How debuggers work: Part 2 - Breakpoints](http://eli.thegreenplace.net/2011/01/27/how-debuggers-work-part-2-breakpoints/)
