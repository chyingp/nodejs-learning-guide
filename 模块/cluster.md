## 模块概览

node是单进程单线程作业的，这在一定程度上有利于降低编程复杂度。但是在多核的机器上，只开一个进程，无法充分发挥机器的性能。

因此，nodejs引入了cluster这个模块，来提供多进程编程的能力。

## 基础例子

我们先看下一个简单的例子。几行代码，就创建了多个服务端实例，用来处理用户的访问请求。

```js
var cluster = require('cluster');
var cpuNums = require('os').cpus().length;
var http = require('http');

if(cluster.isMaster){
  for(var i = 0; i < cpuNums; i++){
    cluster.fork();
  }
}else{
  http.createServer(function(req, res){
    res.end('ok');
  }).listen(3000);
}
```

## 实现原理

主要搞清楚三个问题：

1. cluster模块是如何同时创建多个node server实例，同时对外提供服务的？
2. 在多进程实例的情况下，cluster的负载均衡策略是怎么设计的？
3. 多个server实例，是如何实现端口共享的？


### 问题1：如何同时创建多个server实例

这个问题比较简单，cluster模块通过`cluster.fork()`方法创建多个进程实例，而`cluster.fork()`内部又是通过`child_process.fork()`来创建子进程的。

>cluster.fork() --> child_process.for()

如果需要传递环境变量，可以加上参数env，`cluster.fork(env)`。

此外，子进程跟父进程之间可以通过IPC通道进行进程间通信，下文会举简单的例子进行说明

### 问题2：cluster的负载均衡策略

cluster默认支持两种负载均衡策略，最常见的是第一种轮询。（round-robin，除了windows外的其他平台，默认都是这种）

主进程监听特定端口，收到请求后，依次将请求派送给worker。

### 问题3：如何实现端口共享

对大部分初学者来说，这点是比较令人困惑的。根据经验来说，几个进程，同时监听同一个端口，系统会报错。那么，cluster是如何实现几个进程共享一个端口的呢？

看了cluster的源码后，发现实现思路很简单。net模块内部，判断当前进程是master进程，还是worker进程。

* master进程：不做特殊处理。
* worker进程：通过`cluster._getServer`来创建server。端口共享的秘密就在这里面了。

假设有workerA、workerB，同时监听端口`port`

```js
  if (cluster.isMaster || exclusive) {
    self._listen2(address, port, addressType, backlog, fd);
    return;
  }

  cluster._getServer(self, {
    address: address,
    port: port,
    addressType: addressType,
    fd: fd,
    flags: 0
  }, cb);
```

在master进程里，通过 cluster.fork() 创建子进程。

cluster.fork() 内部调用了 child_process.fork() 来创建子进程。该进程监听 internalMessage

```js
worker.process.on('internalMessage', internal(worker, onmessage));
```

看下子进程，比如创建了server，并监听port。当调用 server.listen(port)时，由于 cluster.isMaster 为false，所以运行的是第二段代码

```js
  if (cluster.isMaster || exclusive) {
    self._listen2(address, port, addressType, backlog, fd);
    return;
  }

  // 子进程中，运行的是这段代码
  cluster._getServer(self, {
    address: address,
    port: port,
    addressType: addressType,
    fd: fd,
    flags: 0
  }, cb);
```

看下 cluster._getServer() 的实现。

```js
  // obj is a net#Server or a dgram#Socket object.
  cluster._getServer = function(obj, options, cb) {
    const indexesKey = [ options.address,
                         options.port,
                         options.addressType,
                         options.fd ].join(':');
    if (indexes[indexesKey] === undefined)
      indexes[indexesKey] = 0;
    else
      indexes[indexesKey]++;

    const message = util._extend({
      act: 'queryServer',
      index: indexes[indexesKey],
      data: null
    }, options);

    // Set custom data on handle (i.e. tls tickets key)
    if (obj._getServerData) message.data = obj._getServerData();
    send(message, function(reply, handle) {
      if (obj._setServerData) obj._setServerData(reply.data);

      if (handle)
        shared(reply, handle, indexesKey, cb);  // Shared listen socket.
      else
        rr(reply, indexesKey, cb);              // Round-robin.
    });
    obj.once('listening', function() {
      cluster.worker.state = 'listening';
      const address = obj.address();
      message.act = 'listening';
      message.port = address && address.port || options.port;
      send(message);
    });
  };
```


```js
    handle.add(worker, function(errno, reply, handle) {
      reply = util._extend({
        errno: errno,
        key: key,
        ack: message.seq,
        data: handles[key].data
      }, reply);
      if (errno) delete handles[key];  // Gives other workers a chance to retry.
      send(worker, reply, handle);
    });
```

## 代码备忘

```js
    const message = util._extend({
      act: 'queryServer',
      index: indexes[indexesKey],
      data: null
    }, options);
```


```js
    send(message, function(reply, handle) {
      if (obj._setServerData) obj._setServerData(reply.data);

      if (handle)
        shared(reply, handle, indexesKey, cb);  // Shared listen socket.
      else
        rr(reply, indexesKey, cb);              // Round-robin.
    });
```


```js

  function send(message, cb) {
    return sendHelper(process, message, null, cb);
  }
```

```js
      handles[key] = handle = new constructor(key,
                                              message.address,
                                              message.port,
                                              message.addressType,
                                              message.fd,
                                              message.flags);
```

## 相关链接

官方文档：https://nodejs.org/api/cluster.html

[How Node.js Multiprocess Load Balancing Works](http://onlinevillage.blogspot.com/2011/11/how-nodejs-multiprocess-load-balancing.html)


## 备注

>The cluster module allows you to easily create child processes that all share server ports.

>Please note that on Windows, it is not yet possible to set up a named pipe server in a worker.

