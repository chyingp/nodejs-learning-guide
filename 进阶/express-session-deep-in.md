## 写在前面


## session vs cookie vs 登录态

HTTP是无状态的，也就是说，同个用户，多次访问同一个网站，网站无法区分前后访问的是否同个用户。cookie跟session的出现很好的解决了这个问题。

抛开两者的学术定义，从应用的角度来讲，session跟cookie就是一对好基友，可以用来实现用户的身份识别。

session是保存在服务端的小段数据，cookie是保存在用户本地的小段数据，它们一般是一一对应的。

上面的解释比较抽象，先举两个常见的例子：**用户登录** 和 **登录态检验**。

### 用户登录

1. 张三：在网站输入用户名(zhang)、密码，点击“登录”。
2. 浏览器：向服务端发送登录请求。
3. 服务端：收到登录请求，对 用户名、密码 进行校验，且校验通过。
4. 服务端：把张三的用户名 zhang 写到本地文件 session.txt。（session）
5. 服务端：请求成功返回，附带 `Set-Cookie:uid=zhang` 首部。
6. 浏览器：收到服务端返回，检测到 `Set-Cookie` 首部，将cookie(`uid=zhang`)保存到本地。(cookie)

### 登录态检验

张三再次访问网站：

1. 张三：访问网站的个人主页。
2. 浏览器：向服务端发送访问请求（带上之前的cookie）。
3. 服务端：解析cookie，找到`uid=zhang`。
4. 服务端：查找本地session.txt，发现`uid=zhang`这条记录，判断用户已登录。
5. 服务端：返回个人主页。

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