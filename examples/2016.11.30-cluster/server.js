var cluster = require('cluster');
var cpuNums = require('os').cpus().length;
var http = require('http');

if(cluster.isMaster){
	for(var i = 0; i < cpuNums; i++){
		cluster.fork();
	}
}else{
	http.createServer(function(req, res){
		res.end(`response from worker ${process.pid}`);
	}).listen(3000);

	console.log(`Worker ${process.pid} started`);
}