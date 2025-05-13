import React, { useState } from 'react';
import { Message } from '../types';
import { API } from '../api';
import './chat.css';

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const formatDuration = (ms: number): string => {
    if (ms < 1000) return `${ms} ms`;

    const seconds = ms / 1000;
    if (seconds < 60) return `${seconds.toFixed(2)} s`;

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = (seconds % 60).toFixed(1);
    if (minutes < 60) return `${minutes} min ${remainingSeconds}s`;

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}min`;
  }
  const handleSendMessage = () => {
    if (!input.trim()) return;

    const newMessages: Message[] = [...messages, { role: 'user', content: input, duration: 0 }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    const start = Date.now();
    API.ask(newMessages).then(answer  => {
      const duration = Date.now() - start;
      setMessages([...newMessages, { role: 'assistant', content: answer.data.answer, duration}])
      setLoading(false)
    });
    
  }

  return (
    <div style={{ maxWidth: '600px', margin: 'auto', padding: '20px' }}>
      <h2>🤖 Chatbot Local (Ollama)</h2>
      <div style={{ minHeight: '300px', border: '1px solid #ccc', padding: '10px', marginBottom: '10px' }}>
      {messages.map((msg, index) => (
        <div key={index} className={`message ${msg.role}`}>
          <p><strong>{msg.role === 'user' ? 'Vous' : `Bot (${formatDuration(msg.duration)})`}:</strong> {msg.content}</p>
        </div>
      ))}
      {loading && (
        <div className="message assistant">
          <p>•••</p>
        </div>
      )}
      </div>
      <div style={{ display: 'flex', gap: '10px' }}>
        <input
          type="text"
          value={input}
          disabled={loading}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
          if (e.key === 'Enter') {
              handleSendMessage();
            }
          }}
          style={{ flexGrow: 1, padding: '10px' }}
          placeholder="Écrivez votre message..."
        />
        <button disabled={loading} onClick={handleSendMessage}>Envoyer</button>
      </div>
    </div>
  );
};

export default Chat;
