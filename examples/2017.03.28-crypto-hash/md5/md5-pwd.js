var crypto = require('crypto');

function cryptPwd(password) {
	var md5 = crypto.createHash('md5');
	return md5.update(password).digest('hex');
}

var password = '123456';
var cryptedPassword = cryptPwd(password);

console.log(cryptedPassword);
// 输出：e10adc3949ba59abbe56e057f20f883e

console.log( cryptPwd(password) );
// 输出：e10adc3949ba59abbe56e057f20f883e

console.log( cryptPwd(password) );
// 输出：e10adc3949ba59abbe56e057f20f883e