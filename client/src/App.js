import React, { useState, useEffect, useRef } from 'react';

function App() {
    const [room, setRoom] = useState('');
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const ws = useRef(null);

    useEffect(() => {
        ws.current = new WebSocket('ws://localhost:3001');
        ws.current.onmessage = (event) => {
            const receivedMessage = JSON.parse(event.data);
            setMessages(prevMessages => [...prevMessages, receivedMessage.text]);
        };

        return () => {
            ws.current.close();
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
        };
        ws.current.send(JSON.stringify(messageObject));
        setMessages(prevMessages => [...prevMessages, message]);
        setMessage('');
    };

    return (
        <div>
            <h1>Mesajlaşma Uygulaması</h1>
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