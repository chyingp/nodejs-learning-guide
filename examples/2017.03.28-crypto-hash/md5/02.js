var crypto = require('crypto');
var fs = require('fs');

function getMd5Result(input) {
	var md5 = crypto.createHash('md5');
	md5.update(input, 'utf8');
	return md5.digest('hex');	
}

// 特点：不同的输入，同样的输出

// var input1 = fs.readFileSync('./01.txt', 'utf8');
// var input2 = fs.readFileSync('./02.txt', 'utf8');

var input1 = `d131dd02c5e6eec4693d9a0698aff95c2fcab58712467eab4004583eb8fb7f89
55ad340609f4b30283e488832571415a085125e8f7cdc99fd91dbdf280373c5b
d8823e3156348f5bae6dacd436c919c6dd53e2b487da03fd02396306d248cda0
e99f33420f577ee8ce54b67080a80d1ec69821bcb6a8839396f9652b6ff72a70`

var input2 = `d131dd02c5e6eec4693d9a0698aff95c2fcab50712467eab4004583eb8fb7f89
55ad340609f4b30283e4888325f1415a085125e8f7cdc99fd91dbd7280373c5b
d8823e3156348f5bae6dacd436c919c6dd53e23487da03fd02396306d248cda0
e99f33420f577ee8ce54b67080280d1ec69821bcb6a8839396f965ab6ff72a7`;


console.log( getMd5Result(input1) );
// DMF1ucDxtqgxw5niaXcmYQ==


console.log( getMd5Result(input2) );
// 输出：GH70Q2Ei0cwvQNwrkvDroA==