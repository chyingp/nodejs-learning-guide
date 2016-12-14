var crypto = require('crypto');
var key = crypto.randomBytes(192/8);
var iv = crypto.randomBytes(128/8);
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
console.log( crypted );

var decrypted = decrypt( crypted );
console.log( decrypted );  // 输出：utf8
