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

var str1 = 'd131dd02c5e6eec4693d9a0698aff95c2fcab58712467eab4004583eb8fb7f8955ad340609f4b30283e488832571415a085125e8f7cdc99fd91dbdf280373c5bd8823e3156348f5bae6dacd436c919c6dd53e2b487da03fd02396306d248cda0e99f33420f577ee8ce54b67080a80d1ec69821bcb6a8839396f9652b6ff72a70';
var str2 = 'd131dd02c5e6eec4693d9a0698aff95c2fcab50712467eab4004583eb8fb7f8955ad340609f4b30283e4888325f1415a085125e8f7cdc99fd91dbd7280373c5bd8823e3156348f5bae6dacd436c919c6dd53e23487da03fd02396306d248cda0e99f33420f577ee8ce54b67080280d1ec69821bcb6a8839396f965ab6ff72a70';

var result1 = getHashResult(str1);
var result2 = getHashResult(str2);

if(result1 === result2) {
	console.log(`Got the same md5 result: ${result1}`);
}else{
	console.log(`Not the same md5 result`);
}