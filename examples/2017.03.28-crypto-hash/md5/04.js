function getHashResult(hexString){

	// 转成16进制，比如 0x4d 0xc9 ...
	hexString = hexString.replace(/(\w{2,2})/g, '0x$1 ').trim();

	// 转成16进制数组，如 [0x4d, 0xc9, ...]
	var arr = hexString.split(' ');

	// 转成对应的buffer，如：<Buffer 4d c9 ...>
	var buff = Buffer.from(arr);

	var crypto = require('crypto');
	var hash = crypto.createHash('md5');

	// 计算md5值
	var result = hash.update(buff).digest('hex');

	return result;	
}

// hexString = '4dc968ff0ee35c209572d4777b721587d36fa7b21bdc56b74a3dc0783e7b9518afbfa200a8284bf36e8e4b55b35f427593d849676da0d1555d8360fb5f07fea2';
var str1 = '4dc968ff0ee35c209572d4777b721587d36fa7b21bdc56b74a3dc0783e7b9518afbfa200a8284bf36e8e4b55b35f427593d849676da0d1555d8360fb5f07fea2';
var str2 = '4dc968ff0ee35c209572d4777b721587d36fa7b21bdc56b74a3dc0783e7b9518afbfa202a8284bf36e8e4b55b35f427593d849676da0d1d55d8360fb5f07fea2';

var result1 = getHashResult(str1);
var result2 = getHashResult(str2);

if(result1 === result2) {
	console.log(`Got the same md5 result: ${result1}`);
}else{
	console.log(`Not the same md5 result`);
}