## 写在前面

下文适合对cluster模块有一定了解的同学阅读。主要包含两部分内容：

1. cluster模块如何实现端口共享
2. cluster模块如何分发请求

## 端口共享源码分析

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
// message： {"cmd":"NODE_CLUSTER","sockname":{"address":"::","family":"IPv6","port":3000},"data":null,"ack":1,"key":":3000:4::0","errno":null,"seq":0}
// indexsKey: ":3000:4:"
// cb: _getServer 的回调
// Round-robin. Master distributes handles across workers.
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
  
  handles[key] = handle;
  cb(0, handle); // 终于调用 cb 了。。。
}
```

然后，下面的回调函数被调用：

```javascript
// worker进程
function cb(err, handle) {
  // err：0
  // handle: {close: fn, listen: fn, getsockname: fn, ref: fn, unref: fn}
  if (err === 0 && port > 0 && handle.getsockname) {
    var out = {};
    err = handle.getsockname(out);
    if (err === 0 && port !== out.port)
      err = uv.UV_EADDRINUSE;
  }

  self._handle = handle; // 将 handle 赋给 net.Server 实例
  self._listen2(address, port, addressType, backlog, fd); // 调用 _listen2 方法
}
```

看下此时 _listen2 做了什么。主要是抛出 listening 事件，以及 添加 onconnection 监听。

```javascript
// worker进程
Server.prototype._listen2 = function(address, port, addressType, backlog, fd) {

  // If there is not yet a handle, we need to create one and bind.
  // In the case of a server sent via IPC, we don't need to do this.
  if (this._handle) {
    debug('_listen2: have a handle already');
  } 

  this._handle.onconnection = onconnection; // onconnect 回调
  this._handle.owner = this;

  var err = _listen(this._handle, backlog);

  // generate connection key, this should be unique to the connection
  this._connectionKey = addressType + ':' + address + ':' + port;

  process.nextTick(emitListeningNT, this);
};
```

前面说过，在主进程里，创建了 net.Server 实例，并对端口进行实际的监听。再来回顾这段代码

```javascript
// master进程
// Start a round-robin server. Master accepts connections and distributes
// them over the workers.
function RoundRobinHandle(key, address, port, addressType, fd) {
  // 忽略非重点代码
  this.server = net.createServer(assert.fail);
  this.server.listen(port, address); // 注意这里的监听

  this.server.once('listening', () => {
    this.handle = this.server._handle;
    this.handle.onconnection = (err, handle) => this.distribute(err, handle);
    this.server._handle = null;
    this.server = null;
  });
}
```

监听调用的是 net 模块中如下函数：

```javascript
// master进程
self._listen2(address, port, addressType, backlog, fd);
```

```javascript
// master进程
Server.prototype._listen2 = function(address, port, addressType, backlog, fd) {

  // If there is not yet a handle, we need to create one and bind.
  // In the case of a server sent via IPC, we don't need to do this.
  // 此时，this._handle 是 null（初始化状态），于是走第二个分支
  if (this._handle) {
    debug('_listen2: have a handle already');
  } else {
    debug('_listen2: create a handle');

    var rval = null;

    if (!address && typeof fd !== 'number') {
      rval = createServerHandle('::', port, 6, fd);

      if (typeof rval === 'number') {
        rval = null;
        address = '0.0.0.0';
        addressType = 4;
      } else {
        address = '::';
        addressType = 6;
      }
    }

    // rval: {"reading":false,"owner":null,"onread":null,"onconnection":null,"writeQueueSize":0}
    if (rval === null)
      // 重点是这行代码，在这里面创建 TCP 实例，并进行监听
      // fd: undefined
      // address: ::''
      rval = createServerHandle(address, port, addressType, fd);

    if (typeof rval === 'number') {
      var error = exceptionWithHostPort(rval, 'listen', address, port);
      process.nextTick(emitErrorNT, this, error);
      return;
    }
    this._handle = rval;
  }

  this._handle.onconnection = onconnection;
  this._handle.owner = this;

  var err = _listen(this._handle, backlog);

  if (err) {
    var ex = exceptionWithHostPort(err, 'listen', address, port);
    this._handle.close();
    this._handle = null;
    process.nextTick(emitErrorNT, this, ex);
    return;
  }

  // generate connection key, this should be unique to the connection
  this._connectionKey = addressType + ':' + address + ':' + port;

  // unref the handle if the server was unref'ed prior to listening
  if (this._unref)
    this.unref();

  process.nextTick(emitListeningNT, this);
};
```

主要逻辑：创建 TCP 实例，绑定端口、IP，并返回 handle。

```javascript
//master进程
function createServerHandle(address, port, addressType, fd) {
  var err = 0;
  // assign handle in listen, and clean up if bind or listen fails
  var handle;

  var isTCP = false;
  
  handle = new TCP();
  isTCP = true;

  if (address || port || isTCP) {
    debug('bind to ' + (address || 'anycast'));
    if (!address) {
      // Try binding to ipv6 first
      err = handle.bind6('::', port);
      if (err) {
        handle.close();
        // Fallback to ipv4
        return createServerHandle('0.0.0.0', port);
      }
    } else if (addressType === 6) {
      err = handle.bind6(address, port);
    } else {
      err = handle.bind(address, port);
    }
  }

  if (err) {
    handle.close();
    return err;
  }

  return handle;
}
```

server._handle 初始化完成，开始监听后，触发 listening 事件。此时，RoundRobinHandle 中的回调函数被调用。

```javascript
// master进程
this.server.once('listening', () => {
  // 将 this.server._handle 赋值给 this.handle
  this.handle = this.server._handle;
  // 覆盖 this.handle.onconnection，以达到请求分发的目的
  this.handle.onconnection = (err, handle) => this.distribute(err, handle);
  // 将server._handle 设置为null
  this.server._handle = null;
  // 将this.server 设置为null（这里只需要 handle 就够了）
  this.server = null;
});
```

经过上面的复杂流程，最终的结果是：

1. master 进程中创建了 net.Server 实例A，并对来自特定端口的请求进行监听。
2. worker 进程中创建了 net.Server 实例B。
3. 当新连接创建时，实例A 将请求分发给实例B。（如果有多个worker进程，master进程会按照特定算法进行分发）

## 请求分发源码分析

首先，当连接请求进来时，调用 this.distribute(err, handle);

```javascript
// master进程
this.handle.onconnection = (err, handle) => this.distribute(err, handle);
```

看下distribute的实现。主要做了两件事情：

1. 将 handle 加入待处理队列。
2. 取得第一个空闲的worker，如果存在，就调用 this.handoff(worker); 处理请求。

```javascript
// master进程
RoundRobinHandle.prototype.distribute = function(err, handle) {
  // 将 handle 加入 handles 队列，该队列里是待处理的请求对应的handle。
  this.handles.push(handle);
  // 取第一个空闲的worker
  var worker = this.free.shift();
  // 如果有空闲的worker
  if (worker) this.handoff(worker);
};
```

看下 handoff(worker) 的实现。

```javascript
// master进程
RoundRobinHandle.prototype.handoff = function(worker) {
  if (worker.id in this.all === false) {
    return;  // Worker is closing (or has closed) the server.
  }
  // 获取第一个待处理的请求
  var handle = this.handles.shift();
  if (handle === undefined) {
    this.free.push(worker);  // Add to ready queue again.
    return;
  }
  var message = { act: 'newconn', key: this.key };

  // 向worker进程发送消息
  // message：{ act: 'newconn', key: this.key }
  sendHelper(worker.process, message, handle, (reply) => {
    // 当 worker进程 收到消息后，ack回应，调用 handle.close() 
    if (reply.accepted)
      handle.close();
    else
      this.distribute(0, handle);  // Worker is shutting down. Send to another.
    // 再次调用 handoff(worker)。有可能前面已经有一堆的待处理请求，因此检查下还有没有请求需要处理
    // 如有，已经空闲出来的worker可以接着处理请求
    this.handoff(worker);
  });
};
```
