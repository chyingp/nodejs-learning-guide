## cluster模块概览

node实例是单线程作业的。在服务端编程中，通常会创建多个node实例来处理客户端的请求，以此提升系统的吞吐率。对这样多个node实例，我们称之为cluster（集群）。

借助node的cluster模块，开发者可以在几乎不修改原有项目代码的前提下，获得集群服务带来的好处。

集群有以下两种常见的实现方案，而node自带的cluster模块，采用了方案二。

### 方案一：多个node实例+多个端口

集群内的node实例，各自监听不同的端口，再由反向代理实现请求到多个端口的分发。

* 优点：实现简单，各实例相对独立，这对服务稳定性有好处。
* 缺点：增加端口占用，进程之间通信比较麻烦。

### 方案二：主进程向子进程转发请求

集群内，创建一个主进程(master)，以及若干个子进程(worker)。由master监听客户端连接请求，并根据特定的策略，转发给worker。

* 优点：通常只占用一个端口，通信相对简单，转发策略更灵活。
* 缺点：实现相对复杂，对主进程的稳定性要求较高。

## 入门实例

在cluster模块中，主进程称为master，子进程称为worker。

例子如下，创建与CPU数目相同的服务端实例，来处理客户端请求。注意，它们监听的都是同样的端口。

```js
// server.js
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

创建批处理脚本：./req.sh。

```bash
#!/bin/bash

# req.sh
for((i=1;i<=4;i++)); do   
  curl http://127.0.0.1:3000
  echo ""
done 
```

输出如下。可以看到，响应来自不同的进程。

```bash
response from worker 23735
response from worker 23731
response from worker 23729
response from worker 23730
```

## cluster模块实现原理

了解cluster模块，主要搞清楚3个问题：

1. master、worker如何通信？
2. 多个server实例，如何实现端口共享？
2. 多个server实例，来自客户端的请求如何分发到多个worker？

下面会结合示意图进行介绍，源码级别的介绍，可以参考 [笔者的github](https://github.com/chyingp/nodejs-learning-guide)。

## 问题1：master、worker如何通信

这个问题比较简单。master进程通过 cluster.fork() 来创建 worker进程。cluster.fork() 内部 是通过 child_process.fork() 来创建子进程。

也就是说：

1. master进程、worker进程是父、子进程的关系。
2. master进程、woker进程可以通过IPC通道进行通信。（重要）

## 问题2：如何实现端口共享

在前面的例子中，多个woker中创建的server监听了同个端口3000。通常来说，多个进程监听同个端口，系统会报错。

为什么我们的例子没问题呢？

秘密在于，net模块中，对 listen() 方法进行了特殊处理。根据当前进程是master进程，还是worker进程：

1. master进程：在该端口上正常监听请求。（没做特殊处理）
2. worker进程：创建server实例。然后通过IPC通道，向master进程发送消息，让master进程也创建 server 实例，并在该端口上监听请求。当请求进来时，master进程将请求转发给worker进程的server实例。

归纳起来，就是：master进程监听特定端口，并将客户请求转发给worker进程。

如下图所示：

![](https://www.chyingp.com/wp-content/uploads/2018/04/4c1692183865cb201df83f8ee357d070.png)

### 问题3：如何将请求分发到多个worker

每当worker进程创建server实例来监听请求，都会通过IPC通道，在master上进行注册。当客户端请求到达，master会负责将请求转发给对应的worker。

具体转发给哪个worker？这是由转发策略决定的。可以通过环境变量NODE_CLUSTER_SCHED_POLICY设置，也可以在cluster.setupMaster(options)时传入。

默认的转发策略是轮询（SCHED_RR）。

当有客户请求到达，master会轮询一遍worker列表，找到第一个空闲的worker，然后将该请求转发给该worker。

## master、worker内部通信小技巧

在开发过程中，我们会通过 process.on('message', fn) 来实现进程间通信。

前面提到，master进程、worker进程在server实例的创建过程中，也是通过IPC通道进行通信的。那会不会对我们的开发造成干扰呢？比如，收到一堆其实并不需要关心的消息？

答案肯定是不会？那么是怎么做到的呢？

当发送的消息包含`cmd`字段，且改字段以`NODE_`作为前缀，则该消息会被视为内部保留的消息，不会通过`message`事件抛出，但可以通过监听'internalMessage'捕获。

以worker进程通知master进程创建server实例为例子。worker伪代码如下：

```javascript
// woker进程
const message = {
  cmd: 'NODE_CLUSTER',
  act: 'queryServer'
};
process.send(message);
```

master伪代码如下：

```javascript
worker.process.on('internalMessage', fn);
```

## 相关链接

官方文档：[https://nodejs.org/api/cluster.html](https://nodejs.org/api/cluster.html)

Node学习笔记：[https://github.com/chyingp/nodejs-learning-guide](https://github.com/chyingp/nodejs-learning-guide)
