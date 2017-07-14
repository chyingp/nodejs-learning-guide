var crypto = require('crypto');
var key = crypto.randomBytes(192/8);  // 替换成自己需要的key
var iv = crypto.randomBytes(128/8);  // 替换成自己需要的iv
var algorithm = 'aes192';

function encrypt(text){
	var cipher = crypto.createCipheriv(algorithm, key, iv);
	cipher.update(text);
	return cipher.final('hex');
}

function decrypt(encrypted){
	var decipher = crypto.createDecipheriv(algorithm, key, iv);
	decipher.update(encrypted, 'hex');
	return decipher.final('utf8');
}

var content = 'hello';
var crypted = encrypt('hello');
console.log( crypted );  // 输出：1b87be446405ff910cd280ae6aa0423f

var decrypted = decrypt( crypted );
console.log( decrypted );  // 输出：hello
