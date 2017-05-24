var http = require('http');
var StringDecoder = require('string_decoder').StringDecoder;

var net = require('net');

var parserHeader = function (stream, callback) {
    var decoder = new StringDecoder('utf8');
    var headers = '';
    var str = '';    

    stream.on('readable', onReadable);

    function onReadable (){
        var chunk;
        var arr, remaining;
        var buff;
        var spliter = '\n\n';

        while( (chunk = stream.read()) !== null ) {
            str = decoder.write(chunk);

            if(str.indexOf(spliter)!==-1) {
                arr = str.split(spliter);
                headers += arr.shift();
                
                stream.removeListener('readable', onReadable);

                // 备注：有可能有多个 spliter ，所以 这里需要 arr.join(spliter)
                remaining = arr.join(spliter);
                buff = Buffer.from(remaining, 'utf8')
                if(buff.length) stream.unshift(buff);                

                callback(headers);
                break;
            }else{
                headers += str;
            }
        }
    };
};

var server = net.createServer(function (socket) {
   parserHeader(socket, (headers) => {
       socket.end(headers);
   }); 
});

server.listen(3000);