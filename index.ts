import express from 'express';
import https from 'https';
import http from 'http';
import fs from 'fs';
import {WebSocketServer, WebSocket} from 'ws';

const app = express();
app.use(express.static('public'));


const server = process.env.NODE_ENV === 'debug' ?
    https.createServer({
        key: fs.readFileSync('certificate/private.key'),
        cert: fs.readFileSync('certificate/certificate.crt')
    }, app)
    : http.createServer(app);

const wss = new WebSocketServer({server});

const actorMap = new Map<string, WebSocket>();

function onMessage(data: Record<string, string>) {
    if (data.type === 'controller' && data.actorId && data.payload) {
        const actorSocket = actorMap.get(data.actorId);
        if (actorSocket && actorSocket.readyState === WebSocket.OPEN) {
            actorSocket.send(JSON.stringify({from: 'controller', payload: data.payload}));
        } else console.log("No actor with id: " + data.actorId);
    }
}

wss.on('connection', (ws) => {
    let actorId: string | null = null;

    ws.on('message', (msg) => {
        const data = JSON.parse(msg.toString());
        if (data.type === 'actor' && data.actorId) {
            actorId = data.actorId;
            if (actorId) actorMap.set(actorId, ws);
        } else onMessage(data);
    });

    ws.on('close', () => {
        if (actorId) {
            actorMap.delete(actorId);
        }
    });
});

server.listen(3000, "0.0.0.0", () => {
    // Get local IP
    const os = require('os');
    const ifaces = os.networkInterfaces();
    let localIp = '';
    Object.keys(ifaces).forEach(ifname => {
        ifaces[ifname].forEach((iface: Record<string, unknown>) => {
            if (iface.family === 'IPv4' && !iface.internal) {
                localIp = iface.address as string;
            }
        });
    });

    console.log(`Server started on https://${localIp}:3000`);
});
