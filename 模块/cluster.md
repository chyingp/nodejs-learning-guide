## 模块概览

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

