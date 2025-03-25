import express from 'express';
import http from 'http';
import {WebSocketServer, WebSocket} from 'ws';

const app = express();
app.use(express.static('public'));

const server = http.createServer(app);
const wss = new WebSocketServer({server});

const actorMap = new Map<string, WebSocket>();

wss.on('connection', (ws) => {
    let actorId: string | null = null;

    ws.on('message', (msg) => {
        const data = JSON.parse(msg.toString());
        if (data.type === 'actor' && data.actorId) {
            actorId = data.actorId;
            if (actorId) actorMap.set(actorId, ws);
        } else if (data.type === 'controller' && data.actorId && data.payload) {
            const actorSocket = actorMap.get(data.actorId);
            if (actorSocket && actorSocket.readyState === WebSocket.OPEN) {
                actorSocket.send(JSON.stringify({from: 'controller', payload: data.payload}));
            }
        }
    });

    ws.on('close', () => {
        if (actorId) {
            actorMap.delete(actorId);
        }
    });
});

server.listen(3000, () => {
    console.log('Server running on port 3000.');
});
