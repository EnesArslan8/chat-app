import "./snapdrop.ui.css";
import React, { useState, useEffect, useRef } from "react";

function App() {
	const [selectedDevice, setSelectedDevice] = useState(null);

	const [defaultUser, setDefaultUser] = useState(null);

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

	const handleSendFile = (file) => {
		if (selectedDevice) {
			//   socket.emit('sendFile', { file, to: selectedDevice });
		}
	};

	return (
		<div className="app">
			<h1>Snapdrop Clone</h1>

			{defaultUser && (
				<p>
					Welcome <b>name:</b> {defaultUser.username} <b>id:</b>{" "}
					{defaultUser.userId}
				</p>
			)}

			<DeviceList
				devices={defaultUser?.otherUsers ?? []}
				onSelect={setSelectedDevice}
			/>
			<FileSender onSendFile={handleSendFile} />
			<FileReceiver />
		</div>
	);
}

const DeviceList = ({ devices, onSelect }) => {
	return (
		<div className="device-list">
			<h2>Available Devices</h2>
			<ul>
				{devices.map((device, index) => (
					<li key={index} onClick={() => onSelect(device)}>
						{device.username} - {device.userId}
					</li>
				))}
			</ul>
		</div>
	);
};

const FileSender = ({ onSendFile }) => {
	const [file, setFile] = useState(null);

	const handleFileChange = (event) => {
		setFile(event.target.files[0]);
	};

	const handleSend = () => {
		if (file) {
			onSendFile(file);
		}
	};

	return (
		<div className="file-sender">
			<input type="file" onChange={handleFileChange} />
			<button onClick={handleSend} disabled={!file}>
				Send File
			</button>
		</div>
	);
};

const FileReceiver = () => {
	return (
		<div className="file-receiver">
			<h2>File Receiver</h2>
			{/* Burada dosya alma işlemi görüntülenecek */}
		</div>
	);
};

export default App;
