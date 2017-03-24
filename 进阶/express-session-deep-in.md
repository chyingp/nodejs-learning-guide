## session跟cookie的联系

TODO

## session跟登录态的关系

TODO

## 登录 vs 登录态检验

### 常见登录步骤：

用户输入用户名、密码 -> 发送登录请求到服务端 -> 服务端校验用户名、密码 -> 校验通过，通过Set-Cookie设置登录态相关的cookie（假设isLogined=1）

### 登录态验证步骤：

用户访问网站 -> 请求到达服务端 -> 检查req.headers.cookies，isLogined 是否为1 -> 如是，已登录；

### 其他

1. 防止cookie篡改
2. 登录态超时机制
3. 登录态主动失效机制

## express-session实现原理

关键配置如下。其中，`saveUninitialized`若为`true`，对状态为“未初始化”的会话，服务端会自动为该会话创建session id，并保存到本地。

对于需要实现登录功能的站点，需要将`saveUninitialized`设置为`false`。

```js
app.use(session({
    name: identityKey,
    secret: 'chyingp',  // 用来对session id相关的cookie进行签名
    store: new FileStore(),  // 本地存储session（文本文件，也可以选择其他store，比如redis的）
    saveUninitialized: false,  // 是否自动保存未初始化的会话，建议false
    resave: false,  // 是否每次都重新保存会话，建议false
    cookie: {
        maxAge: 10 * 1000  // 有效期，单位是毫秒
    }
}));
```

从请求的生命周期来看下express-session是怎么发挥作用的。

首先，是一个“未初始化”的请求（比如第一次访问网站的用户）

```js
app.use(session(/* 配置项 */));
app.use('/', function(req, res, next){
    res.end('ok');
});
```


各种配置项

```js
var cookieOptions = opts.cookie || {}

  // get the session id generate function
  var generateId = opts.genid || generateSessionId

  // get the session cookie name
  var name = opts.name || opts.key || 'connect.sid'

  // get the session store
  var store = opts.store || new MemoryStore()

  // get the trust proxy setting
  var trustProxy = opts.proxy

  // get the resave session option
  var resaveSession = opts.resave;

  // get the rolling session option
  var rollingSessions = Boolean(opts.rolling)

  // get the save uninitialized session option
  var saveUninitializedSession = opts.saveUninitialized

  // get the cookie signing secret
  var secret = opts.secret

  if (typeof generateId !== 'function') {
    throw new TypeError('genid option must be a function');
  }

  if (resaveSession === undefined) {
    deprecate('undefined resave option; provide resave option');
    resaveSession = true;
  }

  if (saveUninitializedSession === undefined) {
    deprecate('undefined saveUninitialized option; provide saveUninitialized option');
    saveUninitializedSession = true;
  }

  if (opts.unset && opts.unset !== 'destroy' && opts.unset !== 'keep') {
    throw new TypeError('unset option must be "destroy" or "keep"');
  }

  // TODO: switch to "destroy" on next major
  var unsetDestroy = opts.unset === 'destroy'

  if (Array.isArray(secret) && secret.length === 0) {
    throw new TypeError('secret option array must contain one or more strings');
  }

  if (secret && !Array.isArray(secret)) {
    secret = [secret];
  }

  if (!secret) {
    deprecate('req.secret; provide secret option');
  }

  // notify user that this store is not
  // meant for a production environment
  if ('production' == env && store instanceof MemoryStore) {
    /* istanbul ignore next: not tested */
    console.warn(warning);
  }
```