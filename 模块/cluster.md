## 模块概览

node实例是单线程作业的，因此，在服务端编程中，通常会创建多个node实例来处理客户端的请求，以此降低CPU的负载。对这样多个服务端node实例，我们称之为cluster（集群）。

集群的有以下两种常见的实现方案，而cluster模块采用了第二种。

### 实现一：多个node实例监听多个端口

集群内的node实例，各自监听不同的端口，再由反向代理实现请求到多个端口的分发。

* 优点：实现简单，各实例相对独立，这对服务稳定性有好处。
* 缺点：增加端口占用，进程之间通信也比较麻烦。

### 实现二：主进程向子进程转发请求

集群内，创建一个主进程，以及若干个子进程。由主进程监听客户端请求，并根据特定的策略，转发到集群内的子进程。

* 优点：通常只占用一个端口，通信相对简单，转发策略更灵活。
* 缺点：实现相对复杂，对主进程的稳定性要求较高。

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
    res.end(`response from worker ${process.pid}`);
  }).listen(3000);

  console.log(`Worker ${process.pid} started`);
}
```

客户端发送请求：`./req.sh`

```bash
#!/bin/bash

# req.sh
for((i=1;i<=4;i++)); do   
  curl http://127.0.0.1:3000
  echo ""
done 
```

输出如下：

```bash
response from worker 23735
response from worker 23731
response from worker 23729
response from worker 23730
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

## 备忘

首先，master 进程 fork() 子进程：

```javascript
// master进程
cluster.fork()
```

子进程创建 net.Server 实例：

```javascript
// worker进程
require('net').createServer(() => {}).listen(3000);
```

在 net 模块中，调用 cluster._getServer 

```javascript
// worker进程
cluster._getServer(self, {
  address: address,
  port: port,
  addressType: addressType,
  fd: fd,
  flags: 0
}, cb);

function cb(err, handle) {
  // 忽略错误处理
  self._handle = handle;
  self._listen2(address, port, addressType, backlog, fd);
}
```

在 cluster._getServer 中，通过 process.send(message)，向 master 进程发送 queryServer 请求。

```javascript
// worker进程
cluster._getServer = function(obj, options, cb) {
    const indexesKey = [ options.address,
                         options.port,
                         options.addressType,
                         options.fd ].join(':');
    if (indexes[indexesKey] === undefined)
      indexes[indexesKey] = 0;
    else
      indexes[indexesKey]++;

    // message =>
    // {
    //   act: 'queryServer',
    //   index: ':3000:4:',
    //   data: null,
    //   address: null,
    //   port: 3000,
    //   addressType: 4,
    //   fd: undefined
    // }
    const message = util._extend({
      act: 'queryServer',
      index: indexes[indexesKey],
      data: null
    }, options);

    // Set custom data on handle (i.e. tls tickets key)
    if (obj._getServerData) message.data = obj._getServerData();

    /*
      send 方法的定义如下，注意：masterInit 里也有 send 方法
      function send(message, cb) {
        return sendHelper(process, message, null, cb);
      }
      在 sendHelper 里对 message 进程加工，最终 message 如下所示（关键字段）：
      { cmd: 'NODE_CLUSTER', act: 'queryServer' }
    */  
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

在 cluster.fork() 方法里，监听了 internalMessage 事件，onmessage里，调用了 queryServer()。

```javascript
// master进程
cluster.fork = function(env) {
  // 忽略非关键代码
  const workerProcess = createWorkerProcess(id, env);
  const worker = new Worker({
    id: id,
    process: workerProcess
  });
  worker.process.on('internalMessage', internal(worker, onmessage));
};

// 
function onmessage(message, handle) {
  var worker = this;
  if (message.act === 'online')
    online(worker);
  else if (message.act === 'queryServer')
    // 调用 queryServer 方法
    queryServer(worker, message);
  else if (message.act === 'listening')
    listening(worker, message);
  else if (message.act === 'exitedAfterDisconnect')
    exitedAfterDisconnect(worker, message);
  else if (message.act === 'close')
    close(worker, message);
}
```

在 queryServer 里，首先 创建 RoundRobinHandle 实例，然后调用 handle.add()。

对于 address + port + addressType + fd + index 一样的 net.Server 实例，只创建一个 RoundRobinHandle 实例，并通过 handle.add() 将worker添加进去。

```javascript
// master进程
function queryServer(worker, message) {  
    var args = [message.address,
                message.port,
                message.addressType,
                message.fd, // undefined
                message.index]; // 注意：对于同样的监听参数，index 是从0开始递增的整数
    var key = args.join(':'); // 例子：':3000:4::0'
    var handle = handles[key];
    if (handle === undefined) {      
      var constructor = RoundRobinHandle;

      // 创建新的handle，并挂载到 handles 上
      // 这里的 constructor 为 RoundRobinHandle
      handles[key] = handle = new constructor(key,
                                              message.address,
                                              message.port,
                                              message.addressType,
                                              message.fd,
                                              message.flags);
    }
    if (!handle.data) handle.data = message.data;

    // Set custom server data
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
  }
```

看下 RoundRobinHandle 的构造方法。创建了 net.Server 实例，并调用 server.listen() 方法（实际监听）。

当 listening 事件触发，将 onconnection 事件覆盖掉，实现在多个worker中分发请求的逻辑。

```javascript
// master进程
function RoundRobinHandle(key, address, port, addressType, fd) {
  this.key = key;
  this.all = {};
  this.free = [];
  this.handles = [];
  this.handle = null;
  this.server = net.createServer(assert.fail);

  if (fd >= 0)
    this.server.listen({ fd: fd });
  else if (port >= 0)
    this.server.listen(port, address);
  else
    this.server.listen(address);  // UNIX socket path.

  this.server.once('listening', () => {
    this.handle = this.server._handle;
    // 监听 connection 事件，当用户请求进来时，通过 this.distribute() 分发请求到各个worker
    this.handle.onconnection = (err, handle) => this.distribute(err, handle);
    this.server._handle = null;
    this.server = null;
  });
}
```

注意，前面调用了 handle.add() 方法，如下所示

```javascript
// master进程
// Set custom server data
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

看下方法定义（忽略非主要逻辑）：

```javascript
// master进程
RoundRobinHandle.prototype.add = function(worker, send) {
  // 存储worker的引用
  this.all[worker.id] = worker;

  // 当listening事件触发，done 被调用（注意，在 RoundRobinHandle 构造方法里也监听了 listening）
  const done = () => {
    if (this.handle.getsockname) {
      // osx 10.13.1，node 8.9.3，跑这个分支
      var out = {};
      this.handle.getsockname(out);
      // 这里的 send 函数名比较有歧义，其实是 handle.add(worker, callback) 中的 callback
      // TODO(bnoordhuis) Check err.
      send(null, { sockname: out }, null);
    } else {
      send(null, null, null);  // UNIX socket.
    }
    this.handoff(worker);  // In case there are connections pending.
  };

  // Still busy binding.
  this.server.once('listening', done);
};
```

当 listening 事件触发，下面方法被调用。同样的，最终被 sendHelper 封装了一遍

```javascript
// master进程
// error: null
// reply: {}
// handle: null 
function(errno, reply, handle) {
  reply = util._extend({
    errno: errno,
    key: key,
    ack: message.seq,
    data: handles[key].data
  }, reply);
  if (errno) delete handles[key];  // Gives other workers a chance to retry.
  {"errno":null,"key":":3000:4::0","ack":1,"data":null,"sockname":{"address":"::","family":"IPv6","port":3000}}
  send(worker, reply, handle);
}
```

经过 sendHelper 的封装，worker.process.send(message)，message 内容如下。注意，此时 ack === 1。

```javascript
// master进程
{
  "cmd": "NODE_CLUSTER",
  "sockname": {
    "address": "::",
    "family": "IPv6",
    "port": 3000
  },
  "data": null,
  "ack": 1,
  "key": ":3000:4::0",
  "errno": null,
  "seq": 0
}
```

当上面 message 被发出时，worker 进程的 internalMessage 事件触发。（worker进程 的internalMessage 事件是在 node_bootstrap阶段监听的，这里容易忽略）

```javascript
// worker进程
cluster._setupWorker = function() {
  var worker = new Worker({
    id: +process.env.NODE_UNIQUE_ID | 0,
    process: process,
    state: 'online'
  });
  cluster.worker = worker;
  process.on('internalMessage', internal(worker, onmessage));
};
```

如下所示，当 message.ack 存在时，callbacks[message.ack] 被调用。

```javascript
// worker进程
function internal(worker, cb) {
  return function(message, handle) {
    if (message.cmd !== 'NODE_CLUSTER') return;
    var fn = cb;
    // 此时，message.ack === 1
    // callbacks[message.ack] 是 _getServer 的回调
    if (message.ack !== undefined && callbacks[message.ack] !== undefined) {
      fn = callbacks[message.ack];
      delete callbacks[message.ack];
    }
    fn.apply(worker, arguments);
  };
}
```

也就是下面的回调。

```javascript
// worker进程
// obj is a net#Server or a dgram#Socket object.
cluster._getServer = function(obj, options, cb) {

  // 忽略部分代码
  const message = util._extend({
    act: 'queryServer',
    index: indexes[indexesKey],
    data: null
  }, options);

  /* 
  注意：就是这里的回调】
  reply: {
    "cmd": "NODE_CLUSTER",
    "sockname": {
      "address": "::",
      "family": "IPv6",
      "port": 3000
    },
    "data": null,
    "ack": 1,
    "key": ":3000:4::0",
    "errno": null,
    "seq": 0
  }
  handle：undefined
  */
  send(message, (reply, handle) => {
    if (handle)
      shared(reply, handle, indexesKey, cb);  // Shared listen socket.
    else
      // 这里被调用
      rr(reply, indexesKey, cb);              // Round-robin.
  });
};
```

下面是 rr 方法的定义。

```javascript
// worker进程
// Round-robin. Master distributes handles across workers.
// message： {"cmd":"NODE_CLUSTER","sockname":{"address":"::","family":"IPv6","port":3000},"data":null,"ack":1,"key":":3000:4::0","errno":null,"seq":0}
// indexsKey: ":3000:4:"
// cb: _getServer 的回调
function rr(message, indexesKey, cb) {
  if (message.errno)
    return cb(message.errno, null);

  var key = message.key;
  function listen(backlog) {
    // TODO(bnoordhuis) Send a message to the master that tells it to
    // update the backlog size. The actual backlog should probably be
    // the largest requested size by any worker.
    return 0;
  }

  function close() {
    // lib/net.js treats server._handle.close() as effectively synchronous.
    // That means there is a time window between the call to close() and
    // the ack by the master process in which we can still receive handles.
    // onconnection() below handles that by sending those handles back to
    // the master.
    if (key === undefined) return;
    send({ act: 'close', key: key });
    delete handles[key];
    delete indexes[indexesKey];
    key = undefined;
  }

  function getsockname(out) {
    if (key) util._extend(out, message.sockname);
    return 0;
  }

  // XXX(bnoordhuis) Probably no point in implementing ref() and unref()
  // because the control channel is going to keep the worker alive anyway.
  function ref() {
  }

  function unref() {
  }

  // Faux handle. Mimics a TCPWrap with just enough fidelity to get away
  // with it. Fools net.Server into thinking that it's backed by a real
  // handle.
  var handle = {
    close: close,
    listen: listen,
    ref: ref,
    unref: unref,
  };
  if (message.sockname) {
    handle.getsockname = getsockname;  // TCP handles only.
  }
  assert(handles[key] === undefined);
  handles[key] = handle;
  cb(0, handle);
}
```

## 相关链接

官方文档：https://nodejs.org/api/cluster.html

[How Node.js Multiprocess Load Balancing Works](http://onlinevillage.blogspot.com/2011/11/how-nodejs-multiprocess-load-balancing.html)
