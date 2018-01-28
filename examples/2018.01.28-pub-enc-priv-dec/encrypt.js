const crypto = require('crypto');
// crypto.js
export const encrypt = (data, key) => {
  return crypto.publicEncrypt(key, Buffer.from(data));
}
export const decrypt = (encrypted, key) => {
  return crypto.privateDecrypt(key, encrypted);
}