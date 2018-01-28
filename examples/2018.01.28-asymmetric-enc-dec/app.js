const utils = require('./utils');
const keys = require('./keys');

const plainText = '你好，我是程序猿小卡';
const crypted = utils.encrypt(plainText, keys.pubKey);
const decrypted = utils.decrypt(crypted, keys.privKey);

console.log(decrypted.toString()); // 你好，我是程序猿小卡