import express from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';

const app = express();
app.use(express.static('public'));

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const actorMap = new Map<string, WebSocket>();

wss.on('connection', (ws) => {
  ws.on('message', (msg) => {
    try {
      const data = JSON.parse(msg.toString());
      if (data.type === 'actor' && data.actorId) {
        actorMap.set(data.actorId, ws);
      } else if (data.type === 'controller' && data.actorId && data.payload) {
        const actorSocket = actorMap.get(data.actorId);
        if (actorSocket && actorSocket.readyState === WebSocket.OPEN) {
          actorSocket.send(JSON.stringify({ from: 'controller', payload: data.payload }));
        }
      }
    } catch {}
  });
});

server.listen(3000, () => {
  console.log('Server running on port 3000.');
});
