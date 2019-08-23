const request = require('request');

const url = 'https://[host]/[path]'; // 替换成你要访问的地址
const options = {
	url: url,
	proxy:'http://[ip]:[port]', // 替换成代理的ip:端口
	strictSSL: false
};
request.get(options).pipe(process.stdout);