var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'jade');

app.set('views', 'views/');  // 模板所在路径
app.set('view engine', 'html');  // 模板引擎
app.engine('.html', require('ejs').renderFile);

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// app.use('/', routes);
// app.use('/users', users);
var session = require('./routes/session');

app.use(session);

app.use('/login', function(req, res, next){
  var users = [
    {name: 'chyingp', password: '123456'}
  ];

  var name = req.body.name;
  var password = req.body.password;
  var user = users.find(function(item){
    return item.name === name && item.password === password;
  });

  if(user){
    req.session.name = name;
    req.session.generate();  // 创建session
    res.redirect('/profile');  // 重定向到主页
  }else{
    res.redirect('/');
  }
});

app.use('/profile', function(req, res, next){
  // var users = [
  //   {name: 'chyingp', password: '123456'}
  // ];

  // var name = req.body.name;
  // var password = req.body.password;
  // var user = users.find(function(item){
  //   return item.name === name && item.password === password;
  // });

  // if(user){
  //   req.session.generate();  // 创建session
  //   res.redirect('/profile');  // 重定向到主页
  // }else{
  //   res.redirect('/');
  // }

  var sess = req.session;

  res.render('prifile', {
    name: sess.name
  });
});

app.use('/', function(req, res, next){
  var sess = req.session;
  if(sess.isLogined){
    res.send('用户已登录');
  }else{
    res.send('用户未登录');
  }
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
