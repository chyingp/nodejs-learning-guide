#!/usr/bin/env node

// Verify the most famous MD5 collision example in JavaScript, using nothing but
// built-in Node modules.

var crypto = require('crypto');
var ucs2encode = require('punycode').ucs2.encode;
var assert = require('assert');

var md5 = function(string) {
	return crypto.createHash('md5').update(string).digest('hex');
};

var block1 = 'd1 31 dd 02 c5 e6 ee c4 69 3d 9a 06 98 af f9 5c \
2f ca b5 87 12 46 7e ab 40 04 58 3e b8 fb 7f 89 \
55 ad 34 06 09 f4 b3 02 83 e4 88 83 25 71 41 5a \
08 51 25 e8 f7 cd c9 9f d9 1d bd f2 80 37 3c 5b \
d8 82 3e 31 56 34 8f 5b ae 6d ac d4 36 c9 19 c6 \
dd 53 e2 b4 87 da 03 fd 02 39 63 06 d2 48 cd a0 \
e9 9f 33 42 0f 57 7e e8 ce 54 b6 70 80 a8 0d 1e \
c6 98 21 bc b6 a8 83 93 96 f9 65 2b 6f f7 2a 70 ';

var block2 = 'd1 31 dd 02 c5 e6 ee c4 69 3d 9a 06 98 af f9 5c \
2f ca b5 07 12 46 7e ab 40 04 58 3e b8 fb 7f 89 \
55 ad 34 06 09 f4 b3 02 83 e4 88 83 25 f1 41 5a \
08 51 25 e8 f7 cd c9 9f d9 1d bd 72 80 37 3c 5b \
d8 82 3e 31 56 34 8f 5b ae 6d ac d4 36 c9 19 c6 \
dd 53 e2 34 87 da 03 fd 02 39 63 06 d2 48 cd a0 \
e9 9f 33 42 0f 57 7e e8 ce 54 b6 70 80 28 0d 1e \
c6 98 21 bc b6 a8 83 93 96 f9 65 ab 6f f7 2a 70 ';

var processBlock = function(string) {
	var codePoints = string.trim().split(/\s+/).map(function(hex) {
		return parseInt(hex, 16);
	});
	return ucs2encode(codePoints);
}

var string1 = processBlock(block1);
var string2 = processBlock(block2);

console.log(string1);

var hash1 = md5(string1);
var hash2 = md5(string2);

console.log(hash1);
console.log(hash2);

assert(string1 != string2, 'Strings should be different');
// assert(hash1 == hash2, 'MD5 hashes should be the same (collision)');