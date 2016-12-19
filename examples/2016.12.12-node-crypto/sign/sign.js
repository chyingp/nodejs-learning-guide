var crypto = require('crypto');
var fs = require('fs');
var privateKey = fs.readFileSync('./private-key.pem');  // 私钥
var publicKey = fs.readFileSync('./public-key.pem');  // 公钥
var algorithm = 'RSA-SHA256';  // 加密算法 vs 摘要算法

// 数字签名
function sign(text){
	var sign = crypto.createSign(algorithm);
	sign.update(text);
	return sign.sign(privateKey, 'hex');	
}

// 校验签名
function verify(oriContent, signature){
	var verifier = crypto.createVerify(algorithm);
	verifier.update(oriContent);
	return verifier.verify(publicKey, signature, 'hex');
}

// 对内容进行签名
var content = 'hello world';
var signature = sign(content);
console.log(signature);

// 校验签名，如果通过，返回true
var verified = verify(content, signature);
console.log(verified);




