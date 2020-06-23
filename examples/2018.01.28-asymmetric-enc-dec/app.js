const utils = require('./utils');
const keys = require('./keys');
const path = require('path');
const fs = require('fs-extra');

const plainText = '你好，我是程序猿小卡';

/**
 * 新增两个通过 openssl 生成的密钥文件
 * 必须是1024位长度 使用其他长度报错
 * RSA_padding_add_PKCS1_OAEP_mgf1:data too large for key size
 */
(async function main() {
  let pubKey = await fs.readFile(path.resolve(__dirname, './public_key.pem'));
  let privKey = await fs.readFile(path.resolve(__dirname, './private_key.pem'));

  let crypted = utils.encrypt(plainText, pubKey.toString());
  let decrypted = utils.decrypt(crypted, privKey.toString());

  console.log(decrypted.toString()); // 你好，我是程序员小卡
})();