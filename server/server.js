const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const app = express();

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let rooms = {};

wss.on('connection', (ws) => {

    ws.on('message', (data) => {
        const message = JSON.parse(data);
        const room = message.room;
        const text = message.text;

        if (!rooms[room]) {
            rooms[room] = [];
        }
        rooms[room].forEach(client => {
            if (client !== ws) {
                client.send(JSON.stringify({ text, room }));
            }
        });

        rooms[room].push(ws);
    });

    ws.on('close', () => {
        for (let room in rooms) {
            rooms[room] = rooms[room].filter(client => client !== ws);
        }
    });
});

server.listen(3001, () => {
    console.log('Server 3001 portunda çalışıyor');
});
