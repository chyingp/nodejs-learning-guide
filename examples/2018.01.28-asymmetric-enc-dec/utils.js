const crypto = require('crypto');

/**
 * 公钥加密
 * @param  {String} plainText 待加密的明文
 * @param  {Buffer} pubKey    公钥
 * @return {Buffer}           加密后的密文
 */
exports.encrypt = (plainText, pubKey) => {
  return crypto.publicEncrypt(pubKey, Buffer.from(plainText));
};

/**
 * 公钥加密
 * @param  {Buffer} encrypted 加密后的密文
 * @param  {Buffer} privKey   私钥
 * @return {Buffer}           解密后的明文
 */
exports.decrypt = (encrypted, privKey) => {
  return crypto.privateDecrypt(privKey, encrypted);
};