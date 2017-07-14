var express = require('express');
var router = express.Router();

// 读取cookie
router.get('/read_cookie', function(req, res, next){
	var arr = [
		`req.cookies.nick: ${req.cookies.nick}`,
		`req.cookies.signed_nick: ${req.cookies.signed_nick}`,
		`req.signedCookies.nick: ${req.signedCookies.nick}`,
		`req.signedCookies.signed_nick: ${req.signedCookies.signed_nick}`
	];	
	res.send( arr.join('<br/>') );
});

// 设置cookie
router.get('/set_cookie', function(req, res, next){
  
  // res.cookie(name, value [, options])
  var maxAge = 60 * 1000;
  
  res.cookie('nick', 'chyingp', {
    maxAge: maxAge  // 过期时间
  });

  res.cookie('signed_nick', 'chyingp', {
    maxAge: maxAge,  // 过期时间
    signed: true
  });

  res.send(`set cookie`);
});

module.exports = router;