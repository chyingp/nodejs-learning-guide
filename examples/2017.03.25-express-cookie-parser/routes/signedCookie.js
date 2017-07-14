var express = require('express');
var router = express.Router();

// 读取cookie
router.get('/read_cookie', function(req, res, next){
  res.send(`req.cookies.nick: ${req.cookies.nick}`);
});

// 设置cookie
router.get('/set_cookie', function(req, res, next){
  // res.cookie(name, value [, options])
  res.cookie('nick', 'chyingp', {
    maxAge: 60 * 1000  // 过期时间
  });
  res.send(`set cookie nick=chyingp`);
});

module.exports = router;