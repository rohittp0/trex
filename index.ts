import express from 'express';
import https from 'https';
import http from 'http';
import fs from 'fs';
import {WebSocketServer, WebSocket} from 'ws';

const debug = process.env.NODE_ENV === 'debug'
const host = debug ? "0.0.0.0" : "localhost";

const app = express();

if (debug)
    app.use(express.static('public'));


const server = debug ?
    https.createServer({
        key: fs.readFileSync('certificate/private.key'),
        cert: fs.readFileSync('certificate/certificate.crt')
    }, app)
    : http.createServer(app);

const wss = new WebSocketServer({server});

const actorMap = new Map<string, WebSocket>();

function onMessage(data: Record<string, string>, ws: WebSocket) {
    if (data.type !== 'controller' || !data.actorId || !data.payload)
        return;

    const actorSocket = actorMap.get(data.actorId);

    if (!actorSocket)
        return ws.send(JSON.stringify({type: 'error', message: "Invalid Game ID"}));

    if(actorSocket.readyState !== WebSocket.OPEN)
        return ws.send(JSON.stringify({type: 'error', message: "Game Disconnected"}));

    actorSocket.send(JSON.stringify({from: 'controller', payload: data.payload}));
    ws.send(JSON.stringify({type: 'connected'}));
}

wss.on('connection', (ws) => {
    let actorId: string | null = null;

    ws.on('message', (msg) => {
        const data = JSON.parse(msg.toString());
        actorId = data.actorId;

        if (data.type === 'actor' && actorId) actorMap.set(actorId, ws);
        else onMessage(data, ws);
    });

    ws.on('close', () => {
        if (actorId) actorMap.delete(actorId);
    });
});

server.listen(3000, host, () => {
    let localIp = host;

    if (debug) {
        const os = require('os');
        const ifaces = os.networkInterfaces();
        Object.keys(ifaces).forEach(ifname => {
            ifaces[ifname].forEach((iface: Record<string, unknown>) => {
                if (iface.family === 'IPv4' && !iface.internal) {
                    localIp = iface.address as string;
                }
            });
        });
    }

    console.log(`Server started on ${localIp}:3000`);
});
