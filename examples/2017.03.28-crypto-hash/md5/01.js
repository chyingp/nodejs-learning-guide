var crypto = require('crypto');

function getMd5Result(input) {
	var md5 = crypto.createHash('md5');
	md5.update(input, 'utf8');
	return md5.digest('hex');	
}

// 特点：输入长度不固定，输出长度固定128位

console.log( getMd5Result('a') );
// DMF1ucDxtqgxw5niaXcmYQ==


console.log( getMd5Result('ab') );
// 输出：GH70Q2Ei0cwvQNwrkvDroA==