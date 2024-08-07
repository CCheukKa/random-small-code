import http from 'http';
import fs from 'fs-extra';
import { WebSocketServer } from 'ws';

const host = 'localhost';
const port = 8000;

const server = http.createServer(requestListener);
server.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`);
});

function requestListener(request, response) {
    console.log(`${request.method} ${request.url}`);
    switch (request.url) {
        case '/':
            response.writeHead(200, { 'Content-Type': 'text/html' });
            response.end(fs.readFileSync('./index.html', 'utf8'));
            break;
        case '/api':
            response.writeHead(200, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({ message: 'Hello, World!' }));
            setTimeout(() => {
                response.end(JSON.stringify({ message: 'Hello, World again!' }));
            }, 5000);
            break;
        default:
            response.writeHead(404);
            response.end();
            break;
    }
    return;
};

const webSocketServer = new WebSocketServer({ port: port + 1 });

webSocketServer.on('connection', webSocket => {
    webSocket.on('error', console.error);

    webSocket.on('message', function message(data) {
        console.log('received: %s', data);
        webSocket.send('something');
    });
});