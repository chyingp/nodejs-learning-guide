var net = require('net');

var data = `
POST  HTTP/1.1
Host: 127.0.0.1:3000
Cache-Control: no-cache
Postman-Token: 8439f584-61bc-1eca-20e8-8cad1d005aac
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW

------WebKitFormBoundary7MA4YWxkTrZu0gW
Content-Disposition: form-data; name="logo"; filename=""
Content-Type: 


------WebKitFormBoundary7MA4YWxkTrZu0gW--
`;

var client = net.connect(3000, function () {

    client.on('data', chunk => {
        console.log('收到服务端返回：%s', chunk);
    });

    client.on('end', () => {
        console.log('断开连接');
    });
    
    client.write(data);
});
