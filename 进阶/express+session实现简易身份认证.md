## 文档概览

本文基于express、express-session实现了简易的登录/登出功能，完整的代码示例可以在[这里](https://github.com/chyingp/nodejs-learning-guide/tree/master/examples/2016.12.06-session)找到。

## 环境初始化

首先，初始化项目

```bash
express -e
```

然后，安装依赖。

```bash
npm install
```

接着，安装session相关的包。

```bash
npm install --save express-session session-file-store
```

## session相关配置

配置如下，并不复杂，可以见代码注释，或者参考[官方文档](https://github.com/expressjs/session#options)。

```js
var express = require('express');
var app = express();
var session = require('express-session');
var FileStore = require('session-file-store')(session);

var identityKey = 'skey';

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

## 实现登录/登出接口

### 创建测试账户数据

首先，在本地创建个文件，来保存可用于登录的账户信息，避免创建链接数据库的繁琐。

```js
// users.js
module.exports = {
    items: [
        {name: 'chyingp', password: '123456'}
    ]
};
```

### 登录、登出接口实现

实现登录、登出接口，其中：

* 登录：如果用户存在，则通过`req.regenerate`创建session，保存到本地，并通过`Set-Cookie`将session id保存到用户侧；
* 登出：销毁session，并清除cookie；

```js
var users = require('./users').items;

var findUser = function(name, password){
    return users.find(function(item){
        return item.name === name && item.password === password;
    });
};

// 登录接口
app.post('/login', function(req, res, next){
    
    var sess = req.session;
    var user = findUser(req.body.name, req.body.password);

    if(user){
        req.session.regenerate(function(err) {
            if(err){
                return res.json({ret_code: 2, ret_msg: '登录失败'});                
            }
            
            req.session.loginUser = user.name;
            res.json({ret_code: 0, ret_msg: '登录成功'});                           
        });
    }else{
        res.json({ret_code: 1, ret_msg: '账号或密码错误'});
    }   
});

// 退出登录
app.get('/logout', function(req, res, next){
    // 备注：这里用的 session-file-store 在destroy 方法里，并没有销毁cookie
    // 所以客户端的 cookie 还是存在，导致的问题 --> 退出登陆后，服务端检测到cookie
    // 然后去查找对应的 session 文件，报错
    // session-file-store 本身的bug    

    req.session.destroy(function(err) {
        if(err){
            res.json({ret_code: 2, ret_msg: '退出登录失败'});
            return;
        }
        
        // req.session.loginUser = null;
        res.clearCookie(identityKey);
        res.redirect('/');
    });
});
```

### 登录态判断

用户访问 http://127.0.0.1:3000 时，判断用户是否登录，如果是，则调到用户详情界面（简陋无比）；如果没有登录，则跳到登录界面；

```js
app.get('/', function(req, res, next){
    var sess = req.session;
    var loginUser = sess.loginUser;
    var isLogined = !!loginUser;

    res.render('index', {
        isLogined: isLogined,
        name: loginUser || ''
    });
});

```

### UI界面

最后，看下登录、登出UI相关的代码。

```html
<!DOCTYPE html>
<html>
<head>
    <title>会话管理</title>
</head>
<body>

<h1>会话管理</h1>

<% if(isLogined){ %>
    <p>当前登录用户：<%= name %>，<a href="/logout" id="logout">退出登陆</a></p>
<% }else{ %>
    <form method="POST" action="/login">
        <input type="text" id="name" name="name" value="chyingp" />
        <input type="password" id="password" name="password" value="123456" />
        <input type="submit" value="登录" id="login" />
    </form>
<% } %> 

<script type="text/javascript" src="/jquery-3.1.0.min.js"></script>
<script type="text/javascript">
    $('#login').click(function(evt){
        evt.preventDefault();

        $.ajax({
            url: '/login',
            type: 'POST',
            data: {
                name: $('#name').val(),
                password: $('#password').val()
            },
            success: function(data){
                if(data.ret_code === 0){
                    location.reload();
                }   
            }
        });
    });
</script>

</body>
</html>
```

## 相关链接

https://github.com/expressjs/session