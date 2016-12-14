var crypto = require('crypto');
var fs = require('fs');
var privateKey = fs.readFileSync('./chyingp-key.pem');  // 私钥
var algorithm = 'RSA-SHA256';  // 加密算法 vs 摘要算法

function sign(text){
	var sign = crypto.createSign(algorithm);
	sign.update(text);
	return sign.sign(privateKey, 'hex');	
}

function verify(signed){
	var verifier = crypto.createVerify(algorithm);
	verifier.update(text, 'hex');
	return verifier.verify(privateKey, 'hex');
}

var content = 'hello world';

var signed = sign(content);
console.log(signed);

var verified = verify(signed);




