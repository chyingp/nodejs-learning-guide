var cluster = require('cluster');
var cpuNums = require('os').cpus().length;
var http = require('http');
var debugPort = 9229;

if(cluster.isMaster){

	for(var i = 0; i < 2; i++){
		debugPort++;
		cluster.setupMaster({
			// execArgv: ['--inspect-brk=0.0.0.0:' + debugPort]
		});
		cluster.fork();
	}
}else{
	http.createServer(function(req, res){
		res.end(`response from worker ${process.pid}`);
	}).listen(3000);

	console.log(`Worker ${process.pid} started`);
}