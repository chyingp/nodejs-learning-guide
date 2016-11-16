## 模块概览

net模块是同样是nodejs的核心模块。在http模块概览里提到，http.Server继承了net.Server，此外，http客户端与http服务端的通信均依赖于socket（net.Socket）。也就是说，做node服务端编程，net基本是绕不开的一个模块。

从组成来看，net模块主要包含两部分，了解socket编程的同学应该比较熟悉了：

* net.Server：TCP server，内部通过socket来实现与客户端的通信。
* net.Socket：tcp/本地 socket的node版实现，它实现了全双工的stream接口。

## 简单的 server+client 例子

tcp服务端程序如下：

```js
var net = require('net');

var PORT = 8989;
var HOST = '127.0.0.1';

// tcp服务端
var server = net.createServer(function(socket){
    console.log('服务端：收到来自客户端的请求');

    socket.on('data', function(data){
        console.log('服务端：收到客户端数据，内容为{'+ data +'}');

        // 给客户端返回数据
        socket.write('你好，我是服务端');
    });

    socket.on('close', function(){
         console.log('服务端：客户端连接断开');
    });
});
server.listen(PORT, HOST, function(){
    console.log('服务端：开始监听来自客户端的请求');
});
```

tcp客户端如下：

```js
var net = require('net');

var PORT = 8989;
var HOST = '127.0.0.1';

// tcp客户端
var client = net.createConnection(PORT, HOST);

client.on('connect', function(){
    console.log('客户端：已经与服务端建立连接');
});

client.on('data', function(data){
    console.log('客户端：收到服务端数据，内容为{'+ data +'}');
});

client.on('close', function(data){
    console.log('客户端：连接断开');
});

client.end('你好，我是客户端');
```

运行服务端、客户端代码，控制台分别输出如下：

服务端：

```bash
服务端：开始监听来自客户端的请求
服务端：收到来自客户端的请求
服务端：收到客户端数据，内容为{你好，我是客户端}
服务端：客户端连接断开
```

客户端：

```bash
客户端：已经与服务端建立连接
客户端：收到服务端数据，内容为{你好，我是服务端}
客户端：连接断开
```

## 服务端

### server.address()

返回服务端的地址信息，比如绑定的ip地址、端口等。

```js
console.log( server.address() );
// 输出如下 { port: 3000, family: 'IPv4', address: '127.0.0.1' }
```

### server.close(callback])

关闭服务器，停止接收新的客户端请求。有几点注意事项：

* 对正在处理中的客户端请求，服务器会等待它们处理完（或超时），然后再正式关闭。
* 正常关闭的同时，callback 会被执行，同时会触发 close 事件。
* 异常关闭的同时，callback 也会执行，同时将对应的 error 作为参数传入。（比如还没调用 server.listen(port) 之前，就调用了server.close()）

下面会通过两个具体的例子进行对比，先把结论列出来

* 已调用server.listen()：正常关闭，close事件触发，然后callback执行，error参数为undefined
* 未调用server.listen()：异常关闭，close事件触发，然后callback执行，error为具体的错误信息。（注意，error 事件没有触发）

例子1：服务端正常关闭

```js
var net = require('net');
var PORT = 3000;
var HOST = '127.0.0.1';
var noop = function(){};

// tcp服务端
var server = net.createServer(noop);

server.listen(PORT, HOST, function(){

    server.close(function(error){
        if(error){
            console.log( 'close回调：服务端异常：' + error.message );
        }else{
            console.log( 'close回调：服务端正常关闭' );
        }            
    }); 
});

server.on('close', function(){
    console.log( 'close事件：服务端关闭' );
});

server.on('error', function(error){
    console.log( 'error事件：服务端异常：' + error.message );
});
```

输出为：

```bash
close事件：服务端关闭
close回调：服务端正常关闭
```

例子2：服务端异常关闭

代码如下

```js
var net = require('net');
var PORT = 3000;
var HOST = '127.0.0.1';
var noop = function(){};

// tcp服务端
var server = net.createServer(noop);

// 没有正式启动请求监听
// server.listen(PORT, HOST);

server.on('close', function(){
    console.log( 'close事件：服务端关闭' );
});

server.on('error', function(error){
    console.log( 'error事件：服务端异常：' + error.message );
});

server.close(function(error){
    if(error){
        console.log( 'close回调：服务端异常：' + error.message );
    }else{
        console.log( 'close回调：服务端正常关闭' );
    }            
});
```

输出为：

```bash
close事件：服务端关闭
close回调：服务端异常：Not running
```

### server.ref()/server.unref()

了解node事件循环的同学对这两个API应该不陌生，主要用于将server 加入事件循环/从事件循环里面剔除，影响就在于会不会影响进程的退出。

对出学习net的同学来说，并不需要特别关注，感兴趣的自己做下实验就好。

### 事件 listening/connection/close/error

* listening：调用 server.listen()，正式开始监听请求的时候触发。
* connection：当有新的请求进来时触发，参数为请求相关的 socket。
* close：服务端关闭的时候触发。
* error：服务出错的时候触发，比如监听了已经被占用的端口。

几个事件都比较简单，这里仅举个 connection 的例子。

从测试结果可以看出，有新的客户端连接产生时，net.createServer(callback) 中的callback回调 会被调用，同时 connection 事件注册的回调函数也会被调用。

事实上，net.createServer(callback) 中的 callback 在node内部实现中 也是加入了做为 connection事件 的监听函数。感兴趣的可以看下node的源码。

```js
var net = require('net');
var PORT = 3000;
var HOST = '127.0.0.1';
var noop = function(){};

// tcp服务端
var server = net.createServer(function(socket){
    socket.write('1. connection 触发\n');
});

server.on('connection', function(socket){
    socket.end('2. connection 触发\n');
});

server.listen(PORT, HOST);
```

通过下面命令测试下效果

```bash
curl http://127.0.0.1:3000
```

输出：

```bash
1. connection 触发
2. connection 触发
```

## 客户端

## 相关链接