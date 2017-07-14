var startTime = new Date() - 0;

process.stdin.on('data', function (chunk) {
    var endTime = new Date() - startTime;

    console.log('after %d ms, data: %s', endTime, chunk);

    process.stdin.pause();

    setTimeout(function(){
        process.stdin.resume();
    }, 1000);
});