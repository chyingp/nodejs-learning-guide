var crypto = require('crypto');

function getMd5Result(input) {
	var md5 = crypto.createHash('md5');
	md5.update(input, 'utf8');
	return md5.digest('hex');	
}

// 特点：输入长度不固定，输出长度固定128位

console.log( getMd5Result('a') );
// 输出：0cc175b9c0f1b6a831c399e269772661


console.log( getMd5Result('ab') );
// 输出：187ef4436122d1cc2f40dc2b92f0eba0