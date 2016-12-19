var index  = 0;

setInterval(function(){
	index++;

	if(index==1){
		process.title = 'Hello World';
	}
}, 1000);
