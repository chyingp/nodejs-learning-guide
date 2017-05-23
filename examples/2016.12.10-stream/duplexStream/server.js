var net = require('net');

var server = net.createServer(function (socket) {
    socket.on('data', function(data) {
        console.log('server: msg from client [%s]', data);
    });
    socket.end('reply from server');
});

server.listen(3000);

