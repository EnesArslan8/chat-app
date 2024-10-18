import React, { useState, useEffect, useRef } from "react";

function App() {
	const [room, setRoom] = useState("");
	const [defaultUser, setDefaultUser] = useState(null);
	const [message, setMessage] = useState("");
	const [messages, setMessages] = useState([]);
	const ws = useRef(null);

	useEffect(() => {
		ws.current = new WebSocket("ws://localhost:3001");
		ws.current.onmessage = (event) => {
			console.log(event.data);

			const receivedMessage = JSON.parse(event.data);

			if (receivedMessage.type === "message") {
				setMessages((prevMessages) => [...prevMessages, receivedMessage.text]);
			} else if (receivedMessage.type === "welcome") {
				console.log("Welcome", receivedMessage);
				setDefaultUser(receivedMessage);
			} else if (receivedMessage.type === "joined") {
				console.log("Welcome", receivedMessage);
				setDefaultUser(receivedMessage);
			}
		};

		return () => {
			if (ws.current.readyState === 1) {
				ws.current.close();
			}
		};
	}, []);

	const joinRoom = () => {
		if (room) {
			setMessages([]);
		}
	};

	const sendMessage = () => {
		const messageObject = {
			room,
			text: message,
			type: "message",
		};
		ws.current.send(JSON.stringify(messageObject));
		setMessages((prevMessages) => [...prevMessages, message]);
		setMessage("");
	};

	return (
		<div>
			<h1>Mesajlaşma Uygulaması</h1>
			<h5>
				{defaultUser?.text}: user-id - {defaultUser?.userId}:{" "}
				{defaultUser?.connectionCount}{" "}
			</h5>
			<div>
				<input
					type="text"
					placeholder="Oda adı"
					value={room}
					onChange={(e) => setRoom(e.target.value)}
				/>
				<button onClick={joinRoom}>Odaya Katıl</button>
			</div>
			<div>
				<input
					type="text"
					placeholder="Mesaj yazın"
					value={message}
					onChange={(e) => setMessage(e.target.value)}
				/>
				<button onClick={sendMessage}>Gönder</button>
			</div>
			<div>
				<h2>Mesajlar</h2>
				<ul>
					{messages.map((msg, index) => (
						<li key={index}>{msg}</li>
					))}
				</ul>
			</div>
		</div>
	);
}

export default App;
