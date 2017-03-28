var crypto = require('crypto');

function getRandomSalt(){
	return Math.random().toString().slice(2, 5);
}

function cryptPwd(password, salt) {
	// 密码“加盐”
	var saltPassword = password + ':' + salt;
	console.log('原始密码：%s', password);
	console.log('加盐后的密码：%s', saltPassword);

	// 加盐密码的md5值
	var md5 = crypto.createHash('md5');
	var result = md5.update(saltPassword).digest('hex');
	console.log('加盐密码的md5值：%s', result);
}

var password = '123456';

cryptPwd('123456', getRandomSalt());
// 输出：
// 原始密码：123456
// 加盐后的密码：123456:498
// 加盐密码的md5值：af3b7d32cc2a254a6bf1ebdcfd700115

cryptPwd('123456', getRandomSalt());
// 输出：
// 原始密码：123456
// 加盐后的密码：123456:287
// 加盐密码的md5值：65d7dd044c2db64c5e658d947578d759