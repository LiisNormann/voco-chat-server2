// Node.js WebSocket server script
const http = require('http');
const WebSocketServer = require('websocket').server;

const server = http.createServer();
server.listen(8000);
const messages = [];

const wsServer = new WebSocketServer({
    httpServer: server
});

wsServer.on('request', function(request) {
    const connection = request.accept(null, request.origin);

    connection.on('message', function(message) {
        let data = JSON.parse(message.utf8Data);
        let msg = data.message ?? "";
        data.message = msg.substring(1, 100);

        console.log(data);

        switch(data.action) {
            case 'login':
                connection.send(JSON.stringify(messages));
                messages.push({created: new Date(), user: data.user, action: 'login'});
                wsServer.broadcast(JSON.stringify([{created: new Date(), user: data.user, action: 'login'}]));
                break;
            default:
                messages.push({created: new Date(), user: data.user, action: 'message', message: data.message});
                wsServer.broadcast(JSON.stringify([{created: new Date(), user: data.user, action: 'message', message: data.message}]));
                break;
        }
    });

    connection.on('close', function(reasonCode, description) {
        messages.push({created: new Date(), user: 'Server', action: 'disconnect'});
        wsServer.broadcast(JSON.stringify([{created: new Date(), user: 'Server', action: 'disconnect'}]));
    });
});

wsServer.broadcast = function broadcast(msg) {
    console.log("sending to all clients: " + msg);
    wsServer.connections.forEach(function(client) {
        client.send(msg);
    });
}