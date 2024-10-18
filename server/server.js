const { error } = require("console");
const {
	generateFromEmail,
	generateUsername,
} = require("unique-username-generator");

const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const app = express();

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let connections = [];

let newConnections = {};
let rooms = {};

wss.on("connection", (ws) => {
	const currentUser = {
		data: {
			text: "Welcome!",
			userId: new Date().getTime(),
			username: generateUsername("_", undefined, 10),
		},
		ws,
	};

	// newConnections[ws] = currentUser;

	connections.push(currentUser);

	ws.send(
		JSON.stringify({
			room: "all",
			type: "welcome",
			...currentUser.data,
			connectionCount: connections.length,
			otherUsers: connections
				.filter((client) => client.ws !== ws)
				.map((client) => client.data),
		})
	);

	// Diğer kullanıcılara bu yeni kullanıcının bağlandığını bildir
	// Object.values(newConnections).forEach((client) => {
	// 	console.log(client.data.userId, client.ws !== ws);

	// 	if (client.ws !== ws) {
	// 		client.ws.send(
	// 			JSON.stringify({
	// 				room: "all",
	// 				type: "joined",
	// 				...client.data,
	// 			})
	// 		);
	// 	}
	// });

	connections.forEach((client) => {
		console.log(client.data.userId, client.ws !== ws);
		if (client.ws !== ws) {
			client.ws.send(
				JSON.stringify({
					room: "all",
					type: "joined",
					connectionCount: connections.length,
					otherUsers: connections
						.filter((_client) => _client.ws !== client.ws)
						.map((client) => client.data),
					...client.data,
				})
			);
		}
	});

	ws.on("message", (data) => {
		const message = JSON.parse(data);

		const room = message.room;
		const text = message.text;
		const type = message.type;

		if (!rooms[room]) {
			rooms[room] = [];
		}
		rooms[room].forEach((client) => {
			if (client !== ws) {
				client.send(JSON.stringify({ text, room, type }));
			}
		});

		rooms[room].push(ws);
	});

	ws.on("close", () => {
		for (let room in rooms) {
			rooms[room] = rooms[room].filter((client) => client !== ws);
		}

		connections = connections.filter((client) => client.ws !== ws);
	});
});

server.listen(3001, () => {
	console.log("Server 3001 portunda çalışıyor");
});
