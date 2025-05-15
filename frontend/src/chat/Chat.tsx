import React, { useState, useEffect } from 'react';
import { Message } from '../types';
import { API } from '../api';
import './chat.css';

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [provider, setProvider] = useState('ollama');

  const handleChange = (e: any) => {
    setProvider(e.target.value);
  }; 

  useEffect(() => {
    const el = document.getElementById('chat-box');
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages]);
  
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

    const newMessages: Message[] = [...messages, { role: 'user', content: input, duration: 0, provider: '' }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    const start = Date.now();
    API.ask(newMessages, provider).then(answer  => {
      const duration = Date.now() - start;
      setMessages([...newMessages, { role: 'assistant', content: answer.data.answer, duration, provider}])
      setLoading(false)
    });
    
  }

  return (
    <div style={{ maxWidth: '600px', margin: 'auto', padding: '20px' }}>
      <h2>🤖 AI Assistant</h2>
      <div style={{margin: '20px'}}>
        <label>
          <input
            type="radio"
            value="ollama"
            checked={provider === 'ollama'}
            onChange={handleChange}
          />
          <b>Ollama (Local)</b>
        </label>

        <label style={{ marginLeft: '1rem' }}>
          <input
            type="radio"
            value="openai"
            checked={provider === 'openai'}
            onChange={handleChange}
          />
           <b> OpenAI</b>
        </label>
      </div>
      <div id='chat-box' style={{ minHeight: '300px', maxHeight: '600px', overflowY: 'auto', border: '1px solid #ccc', padding: '10px', marginBottom: '10px' }}>
      {messages.map((msg, index) => (
        <div key={index} className={`message ${msg.role}`}>
          <p><strong>{msg.role === 'user' ? 'Vous' : `Bot (${formatDuration(msg.duration)} from ${msg.provider})`}:</strong> {msg.content}</p>
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
