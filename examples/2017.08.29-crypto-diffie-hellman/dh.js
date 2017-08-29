var crypto = require('crypto');

var primeLength = 1024;  // 素数p的长度
var generator = 5;  // 素数a

// 创建客户端的DH实例
var client = crypto.createDiffieHellman(primeLength, generator);
// 产生公、私钥对，Ya = a^Xa mod p
var clientKey = client.generateKeys();

// 创建服务端的DH实例，采用跟客户端相同的素数a、p
var server = crypto.createDiffieHellman(client.getPrime(), client.getGenerator());
// 产生公、私钥对，Yb = a^Xb mod p
var serverKey = server.generateKeys();

// 计算 Ka = Yb^Xa mod p
var clientSecret = client.computeSecret(server.getPublicKey());
// 计算 Kb = Ya^Xb mod p
var serverSecret = server.computeSecret(client.getPublicKey());

// 由于素数p是动态生成的，所以每次打印都不一样
// 但是 clientSecret === serverSecret
console.log(clientSecret.toString('hex'));
console.log(serverSecret.toString('hex'));