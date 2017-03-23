## 什么是session

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

