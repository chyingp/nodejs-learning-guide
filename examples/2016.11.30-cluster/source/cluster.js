'use strict';

const EventEmitter = require('events');
const assert = require('assert');
const dgram = require('dgram');
const fork = require('child_process').fork;
const net = require('net');
const util = require('util');
const SCHED_NONE = 1;
const SCHED_RR = 2;

const uv = process.binding('uv');

const cluster = new EventEmitter();
module.exports = cluster;
cluster.Worker = Worker;

// 根据环境变量 NODE_UNIQUE_ID 判断当前进程是master还是worker
cluster.isWorker = ('NODE_UNIQUE_ID' in process.env);
cluster.isMaster = (cluster.isWorker === false);


function Worker(options) {
  if (!(this instanceof Worker))
    return new Worker(options);

  EventEmitter.call(this);

  if (options === null || typeof options !== 'object')
    options = {};

  this.exitedAfterDisconnect = undefined;

  Object.defineProperty(this, 'suicide', {
    get: function() {
      // TODO: Print deprecation message.
      return this.exitedAfterDisconnect;
    },
    set: function(val) {
      // TODO: Print deprecation message.
      this.exitedAfterDisconnect = val;
    },
    enumerable: true
  });

  this.state = options.state || 'none';
  this.id = options.id | 0;

  if (options.process) {
    this.process = options.process;
    this.process.on('error', (code, signal) =>
      this.emit('error', code, signal)
    );
    this.process.on('message', (message, handle) =>
      this.emit('message', message, handle)
    );
  }
}
util.inherits(Worker, EventEmitter);

Worker.prototype.kill = function() {
  this.destroy.apply(this, arguments);
};

Worker.prototype.send = function() {
  return this.process.send.apply(this.process, arguments);
};

Worker.prototype.isDead = function isDead() {
  return this.process.exitCode != null || this.process.signalCode != null;
};

Worker.prototype.isConnected = function isConnected() {
  return this.process.connected;
};

// Master/worker specific methods are defined in the *Init() functions.

function SharedHandle(key, address, port, addressType, fd, flags) {
  this.key = key;
  this.workers = [];
  this.handle = null;
  this.errno = 0;

  // FIXME(bnoordhuis) Polymorphic return type for lack of a better solution.
  var rval;
  if (addressType === 'udp4' || addressType === 'udp6')
    rval = dgram._createSocketHandle(address, port, addressType, fd, flags);
  else
    rval = net._createServerHandle(address, port, addressType, fd);

  if (typeof rval === 'number')
    this.errno = rval;
  else
    this.handle = rval;
}

SharedHandle.prototype.add = function(worker, send) {
  assert(this.workers.indexOf(worker) === -1);
  this.workers.push(worker);
  send(this.errno, null, this.handle);
};

SharedHandle.prototype.remove = function(worker) {
  var index = this.workers.indexOf(worker);
  if (index === -1) return false; // The worker wasn't sharing this handle.
  this.workers.splice(index, 1);
  if (this.workers.length !== 0) return false;
  this.handle.close();
  this.handle = null;
  return true;
};


// Start a round-robin server. Master accepts connections and distributes
// them over the workers.
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
    this.handle.onconnection = (err, handle) => this.distribute(err, handle);
    this.server._handle = null;
    this.server = null;
  });
}

RoundRobinHandle.prototype.add = function(worker, send) {
  assert(worker.id in this.all === false);
  this.all[worker.id] = worker;

  // 当listening事件触发，done 被调用（注意，在 RoundRobinHandle 构造方法里也监听了 listening）
  const done = () => {
    if (this.handle.getsockname) {
      var out = {};
      this.handle.getsockname(out);
      // TODO(bnoordhuis) Check err.
      // 这里的 send 函数名比较有歧义，其实是 handle.add(worker, callback) 中的 callback
      send(null, { sockname: out }, null);
    } else {
      send(null, null, null);  // UNIX socket.
    }
    this.handoff(worker);  // In case there are connections pending.
  };

  if (this.server === null) return done();
  // Still busy binding.
  this.server.once('listening', done);
  this.server.once('error', function(err) {
    // Hack: translate 'EADDRINUSE' error string back to numeric error code.
    // It works but ideally we'd have some backchannel between the net and
    // cluster modules for stuff like this.
    var errno = uv['UV_' + err.errno];
    send(errno, null);
  });
};

RoundRobinHandle.prototype.remove = function(worker) {
  if (worker.id in this.all === false) return false;
  delete this.all[worker.id];
  var index = this.free.indexOf(worker);
  if (index !== -1) this.free.splice(index, 1);
  if (Object.getOwnPropertyNames(this.all).length !== 0) return false;
  for (var handle; handle = this.handles.shift(); handle.close());
  this.handle.close();
  this.handle = null;
  return true;
};

RoundRobinHandle.prototype.distribute = function(err, handle) {
  this.handles.push(handle);
  var worker = this.free.shift();
  if (worker) this.handoff(worker);
};

RoundRobinHandle.prototype.handoff = function(worker) {
  if (worker.id in this.all === false) {
    return;  // Worker is closing (or has closed) the server.
  }
  var handle = this.handles.shift();
  if (handle === undefined) {
    this.free.push(worker);  // Add to ready queue again.
    return;
  }
  var message = { act: 'newconn', key: this.key };

  sendHelper(worker.process, message, handle, (reply) => {
    if (reply.accepted)
      handle.close();
    else
      this.distribute(0, handle);  // Worker is shutting down. Send to another.
    this.handoff(worker);
  });
};

// 根据当前进程是master还是worker，执行不同的初始化方法
if (cluster.isMaster)
  masterInit();
else
  workerInit();

function masterInit() {
  cluster.workers = {};

  var intercom = new EventEmitter();
  cluster.settings = {};

  // 转发策略，可以通过环境变量 NODE_CLUSTER_SCHED_POLICY 指定
  // 默认：SCHED_RR
  // XXX(bnoordhuis) Fold cluster.schedulingPolicy into cluster.settings?
  var schedulingPolicy = {
    'none': SCHED_NONE,
    'rr': SCHED_RR
  }[process.env.NODE_CLUSTER_SCHED_POLICY];

  // 如果没有指定 NODE_CLUSTER_SCHED_POLICY，那么
  // 1、win32：采用 SCHED_NONE
  // 2、其他：采用 SCHED_RR（默认）
  if (schedulingPolicy === undefined) {
    // FIXME Round-robin doesn't perform well on Windows right now due to the
    // way IOCP is wired up. Bert is going to fix that, eventually.
    schedulingPolicy = (process.platform === 'win32') ? SCHED_NONE : SCHED_RR;
  }

  cluster.schedulingPolicy = schedulingPolicy;
  cluster.SCHED_NONE = SCHED_NONE;  // Leave it to the operating system.
  cluster.SCHED_RR = SCHED_RR;      // Master distributes connections.

  // Keyed on address:port:etc. When a worker dies, we walk over the handles
  // and remove() the worker from each one. remove() may do a linear scan
  // itself so we might end up with an O(n*m) operation. Ergo, FIXME.
  const handles = require('internal/cluster').handles;

  var initialized = false;

  // 默认：cluster.fork() => cluster.setupMaster() 
  // 可以在调用 cluster.fork() 之前，先通过主动调用 cluster.setupMaster(options)
  // 对 args、exec、execArgv、silent 等进行设置
  cluster.setupMaster = function(options) {
    // 举例：node --harmony app.js --env prod
    // args：[ '--env', 'prod' ]
    // exec：[ '/private/tmp/app.js' ]
    // execArgv：[ '--harmony' ]
    var settings = {
      args: process.argv.slice(2),
      exec: process.argv[1],
      execArgv: process.execArgv,
      silent: false
    };
    settings = util._extend(settings, cluster.settings);
    settings = util._extend(settings, options || {});
    // Tell V8 to write profile data for each process to a separate file.
    // Without --logfile=v8-%p.log, everything ends up in a single, unusable
    // file. (Unusable because what V8 logs are memory addresses and each
    // process has its own memory mappings.)
    if (settings.execArgv.some((s) => s.startsWith('--prof')) &&
        !settings.execArgv.some((s) => s.startsWith('--logfile='))) {
      settings.execArgv = settings.execArgv.concat(['--logfile=v8-%p.log']);
    }
    cluster.settings = settings;
    if (initialized === true)
      return process.nextTick(setupSettingsNT, settings);
    initialized = true;
    schedulingPolicy = cluster.schedulingPolicy;  // Freeze policy.
    assert(schedulingPolicy === SCHED_NONE || schedulingPolicy === SCHED_RR,
           'Bad cluster.schedulingPolicy: ' + schedulingPolicy);

    // 判断是否有断点调试的参数
    var hasDebugArg = process.execArgv.some(function(argv) {
      return /^(--debug|--debug-brk)(=\d+)?$/.test(argv);
    });

    process.nextTick(setupSettingsNT, settings);

    // Send debug signal only if not started in debug mode, this helps a lot
    // on windows, because RegisterDebugHandler is not called when node starts
    // with --debug.* arg.
    if (hasDebugArg)
      return;

    process.on('internalMessage', function(message) {
      // 只有 message.cmd === 'NODE_DEBUG_ENABLED' 才有有，目测是调试相关的消息
      // TODO 具体探究下
      if (message.cmd !== 'NODE_DEBUG_ENABLED') return;
      var key;
      for (key in cluster.workers) {
        var worker = cluster.workers[key];
        if (worker.state === 'online' || worker.state === 'listening') {
          process._debugProcess(worker.process.pid);
        } else {
          worker.once('online', function() {
            process._debugProcess(this.process.pid);
          });
        }
      }
    });
  };

  // 每次 cluster.setupMaster() 被调用，都会抛出 'setup' 事件
  // 备注：cluster.setupMaster() 会被调用多次，因此，'setup' 事件会触发多次
  function setupSettingsNT(settings) {
    cluster.emit('setup', settings);
  }

  var debugPortOffset = 1;

  function createWorkerProcess(id, env) {
    // 环境变量，默认继承 master 进程的环境变量。
    // 此外，还可以在 cluster.fork(env) 的时候传入额外的环境变量
    var workerEnv = util._extend({}, process.env);
    // node 的命令行选项，比如 [ '--harmony' ]
    var execArgv = cluster.settings.execArgv.slice();
    var debugPort = 0;
    var debugArgvRE = /^(--inspect|--debug|--debug-(brk|port))(=\d+)?$/;

    workerEnv = util._extend(workerEnv, env);
    // 设置 NODE_UNIQUE_ID 环境变量，node 根据它来确认是否 worker
    workerEnv.NODE_UNIQUE_ID = '' + id;

    // 设置调试端口（这个以新版本的代码为准，旧版本的先跳过）
    // TODO 对比7.x、6.x的区别
    for (var i = 0; i < execArgv.length; i++) {
      var match = execArgv[i].match(debugArgvRE);

      if (match) {
        if (debugPort === 0) {
          // 默认情况下，process.debugPort === 5858;
          debugPort = process.debugPort + debugPortOffset;
          ++debugPortOffset;
        }

        execArgv[i] = match[1] + '=' + debugPort;
      }
    }

    // 举例：node app.js --env prod
    // cluster.settings.exec：/private/tmp/app.js
    // cluster.settings.args：[ '--env', 'prod' ]
    return fork(cluster.settings.exec, cluster.settings.args, {
      env: workerEnv, // 环境变量
      silent: cluster.settings.silent,
      execArgv: execArgv,
      stdio: cluster.settings.stdio,
      gid: cluster.settings.gid,
      uid: cluster.settings.uid
    });
  }

  // worker id：递增
  var ids = 0;

  function removeWorker(worker) {
    assert(worker);

    delete cluster.workers[worker.id];

    if (Object.keys(cluster.workers).length === 0) {
      assert(Object.keys(handles).length === 0, 'Resource leak detected.');
      intercom.emit('disconnect');
    }
  }

  function removeHandlesForWorker(worker) {
    assert(worker);

    for (var key in handles) {
      var handle = handles[key];
      if (handle.remove(worker)) delete handles[key];
    }
  }

  // 创建 worker 进程
  cluster.fork = function(env) {
    cluster.setupMaster();
    const id = ++ids;
    const workerProcess = createWorkerProcess(id, env);
    const worker = new Worker({
      id: id,
      process: workerProcess
    });

    worker.on('message', function(message, handle) {      
      cluster.emit('message', this, message, handle);
    });

    worker.process.once('exit', function(exitCode, signalCode) {
      /*
       * Remove the worker from the workers list only
       * if it has disconnected, otherwise we might
       * still want to access it.
       */
      if (!worker.isConnected()) {
        removeHandlesForWorker(worker);
        removeWorker(worker);
      }

      worker.exitedAfterDisconnect = !!worker.exitedAfterDisconnect;
      worker.state = 'dead';
      worker.emit('exit', exitCode, signalCode);
      cluster.emit('exit', worker, exitCode, signalCode);
    });

    worker.process.once('disconnect', function() {
      /*
       * Now is a good time to remove the handles
       * associated with this worker because it is
       * not connected to the master anymore.
       */
      removeHandlesForWorker(worker);

      /*
       * Remove the worker from the workers list only
       * if its process has exited. Otherwise, we might
       * still want to access it.
       */
      if (worker.isDead()) removeWorker(worker);

      worker.exitedAfterDisconnect = !!worker.exitedAfterDisconnect;
      worker.state = 'disconnected';
      worker.emit('disconnect');
      cluster.emit('disconnect', worker);
    });

    // 创建 worker，初始化 server实例，并调用 listen() 时
    // worker 会通过 sendHelper() 抛出 internalMessage
    // 
    // message：{ cmd: 'NODE_CLUSTER', act: 'queryServer', seq: 0, cb: function () {} }
    // 
    // internal(worker, onmessage) 这层包装，使得 进程知会处理 cmd === 'NODE_CLUSTER' 的内部事件
    // 注意：workerInit 里也有 onmessage 方法
    worker.process.on('internalMessage', internal(worker, onmessage));
    process.nextTick(emitForkNT, worker);
    cluster.workers[worker.id] = worker;
    return worker;
  };

  function emitForkNT(worker) {
    cluster.emit('fork', worker);
  }

  cluster.disconnect = function(cb) {
    var workers = Object.keys(cluster.workers);
    if (workers.length === 0) {
      process.nextTick(() => intercom.emit('disconnect'));
    } else {
      for (var key in workers) {
        key = workers[key];
        if (cluster.workers[key].isConnected())
          cluster.workers[key].disconnect();
      }
    }
    if (cb) intercom.once('disconnect', cb);
  };

  Worker.prototype.disconnect = function() {
    this.exitedAfterDisconnect = true;
    send(this, { act: 'disconnect' });
    removeHandlesForWorker(this);
    removeWorker(this);
    return this;
  };

  Worker.prototype.destroy = function(signo) {
    signo = signo || 'SIGTERM';
    var proc = this.process;
    if (this.isConnected()) {
      this.once('disconnect', () => proc.kill(signo));
      this.disconnect();
      return;
    }
    proc.kill(signo);
  };

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

  function online(worker) {
    worker.state = 'online';
    worker.emit('online');
    cluster.emit('online', worker);
  }

  function exitedAfterDisconnect(worker, message) {
    worker.exitedAfterDisconnect = true;
    send(worker, { ack: message.seq });
  }

  function queryServer(worker, message) {
    // Stop processing if worker already disconnecting
    if (worker.exitedAfterDisconnect)
      return;

/*
    注意：在 cluster._getServer() 里有如下代码

    const indexesKey = [ options.address,
                         options.port,
                         options.addressType,
                         options.fd ].join(':');
 */    
    var args = [message.address,
                message.port,
                message.addressType,
                message.fd, // undefined
                message.index]; // 注意：对于同样的监听参数，index 是从0开始递增的整数
    var key = args.join(':'); // 例子：':3000:4::0'
    var handle = handles[key];
    if (handle === undefined) {
      // 默认情况下，net.Server().listen() => RoundRobinHandle
      var constructor = RoundRobinHandle;
      // UDP is exempt from round-robin connection balancing for what should
      // be obvious reasons: it's connectionless. There is nothing to send to
      // the workers except raw datagrams and that's pointless.
      if (schedulingPolicy !== SCHED_RR ||
          message.addressType === 'udp4' ||
          message.addressType === 'udp6') {
        constructor = SharedHandle;
      }

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
      // errno: null
      // reply: {"sockname":{"address":"::","family":"IPv6","port":3000}}
      // handle: null
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

  function listening(worker, message) {
    var info = {
      addressType: message.addressType,
      address: message.address,
      port: message.port,
      fd: message.fd
    };
    worker.state = 'listening';
    worker.emit('listening', info);
    cluster.emit('listening', worker, info);
  }

  // Server in worker is closing, remove from list.  The handle may have been
  // removed by a prior call to removeHandlesForWorker() so guard against that.
  function close(worker, message) {
    var key = message.key;
    var handle = handles[key];
    if (handle && handle.remove(worker)) delete handles[key];
  }

  function send(worker, message, handle, cb) {
    return sendHelper(worker.process, message, handle, cb);
  }
}


function workerInit() {
  var handles = {};
  var indexes = {};

  // Called from src/node.js
  cluster._setupWorker = function() {
    var worker = new Worker({
      id: +process.env.NODE_UNIQUE_ID | 0,
      process: process,
      state: 'online'
    });
    cluster.worker = worker;
    process.once('disconnect', function() {
      worker.emit('disconnect');
      if (!worker.exitedAfterDisconnect) {
        // Unexpected disconnect, master exited, or some such nastiness, so
        // worker exits immediately.
        process.exit(0);
      }
    });
    process.on('internalMessage', internal(worker, onmessage));
    send({ act: 'online' });
    function onmessage(message, handle) {
      if (message.act === 'newconn')
        onconnection(message, handle);
      else if (message.act === 'disconnect')
        _disconnect.call(worker, true);
    }
  };

  // cluster._getServer仅在 worker 进程里可用
  // obj：有可能是 net.Server 实例，或者 dgram.Server 实例
  // obj is a net#Server or a dgram#Socket object.
  // 
  // addressType：4、6（ipv4、ipv6）
  // 
  // 假设：require('net').createServer(fn).listen(3000)
  // options.address：null
  // options.port：3000
  // options.addressType：4
  // options.fd：undefined
  // 
  // indexesKey => ':3000:4:'
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

  // Shared listen socket.
  function shared(message, handle, indexesKey, cb) {
    var key = message.key;
    // Monkey-patch the close() method so we can keep track of when it's
    // closed. Avoids resource leaks when the handle is short-lived.
    var close = handle.close;
    handle.close = function() {
      send({ act: 'close', key: key });
      delete handles[key];
      delete indexes[indexesKey];
      return close.apply(this, arguments);
    };
    assert(handles[key] === undefined);
    handles[key] = handle;
    cb(message.errno, handle);
  }

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
    assert(handles[key] === undefined);
    handles[key] = handle;
    cb(0, handle);
  }

  // Round-robin connection.
  function onconnection(message, handle) {
    var key = message.key;
    var server = handles[key];
    var accepted = server !== undefined;
    send({ ack: message.seq, accepted: accepted });
    if (accepted) server.onconnection(0, handle);
  }

  Worker.prototype.disconnect = function() {
    _disconnect.call(this);
    return this;
  };

  Worker.prototype.destroy = function() {
    this.exitedAfterDisconnect = true;
    if (!this.isConnected()) {
      process.exit(0);
    } else {
      send({ act: 'exitedAfterDisconnect' }, () => process.disconnect());
      process.once('disconnect', () => process.exit(0));
    }
  };

  function send(message, cb) {
    // process：worker 进程
    // message：{ act: 'queryServer' }
    // cb：function(reply, handle) { }
    return sendHelper(process, message, null, cb);
  }

  function _disconnect(masterInitiated) {
    this.exitedAfterDisconnect = true;
    let waitingCount = 1;

    function checkWaitingCount() {
      waitingCount--;
      if (waitingCount === 0) {
        // If disconnect is worker initiated, wait for ack to be sure
        // exitedAfterDisconnect is properly set in the master, otherwise, if
        // it's master initiated there's no need to send the
        // exitedAfterDisconnect message
        if (masterInitiated) {
          process.disconnect();
        } else {
          send({ act: 'exitedAfterDisconnect' }, () => process.disconnect());
        }
      }
    }

    for (const key in handles) {
      const handle = handles[key];
      delete handles[key];
      waitingCount++;

      if (handle.owner)
        handle.owner.close(checkWaitingCount);
      else
        handle.close(checkWaitingCount);
    }

    checkWaitingCount();
  }
}


var seq = 0;
var callbacks = {};

// worker queryServer 时，参数分别为：
// proc：worker进程
// message：{ act: 'queryServer' }
// handle：null
// cb：function(reply, handle) { }
function sendHelper(proc, message, handle, cb) {
  if (!proc.connected)
    return false;

  // Mark message as internal. See INTERNAL_PREFIX in lib/child_process.js
  // message => { cmd: 'NODE_CLUSTER', act: 'queryServer', seq: 0 }
  // callbacks[0] => function(reply, handle) { }
  message = util._extend({ cmd: 'NODE_CLUSTER' }, message);
  if (cb) callbacks[seq] = cb;
  message.seq = seq;
  seq += 1;
  return proc.send(message, handle);
}


// Returns an internalMessage listener that hands off normal messages
// to the callback but intercepts and redirects ACK messages.
function internal(worker, cb) {
  return function(message, handle) {
    if (message.cmd !== 'NODE_CLUSTER') return;
    var fn = cb;
    if (message.ack !== undefined && callbacks[message.ack] !== undefined) {
      fn = callbacks[message.ack];
      delete callbacks[message.ack];
    }
    fn.apply(worker, arguments);
  };
}
