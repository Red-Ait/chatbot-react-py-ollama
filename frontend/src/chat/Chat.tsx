import React, { useState, useEffect } from 'react';
import { Message } from '../types';
import { API } from '../api';
import './chat.css';
import { formatDuration } from '../utils';

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [provider, setProvider] = useState<'ollama' | 'openai'>('ollama');

  const handleChange = (e: any) => {
    setProvider(e.target.value);
  }; 

  useEffect(() => {
    const el = document.getElementById('chat-box');
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages]);
  
  const handleRetryMessage = () => {
    const userMessages = messages.filter(m => m.role === 'user');
    const inp = userMessages[userMessages.length - 1].content
    setInput(inp)
    handleSendMessage()
  }
  const handleSendMessage = () => {
    if (!input.trim()) return;

    const newMessages: Message[] = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    const start = Date.now();
    API.ask(newMessages, provider).then(answer  => {
      const duration = Date.now() - start;
      setMessages([...newMessages, { role: 'assistant', content: answer.data.answer, duration, provider, status: 'success'}])
    }).catch(() => {
      setMessages([...newMessages, { role: 'assistant', content: 'Unknown Error, please retry !', provider, status: 'error'}])
    }).finally(() => setLoading(false));
    
  }

  return (
    <div style={{ maxWidth: '600px', margin: 'auto', padding: '20px' }}>
      <h2>🤖 AI Assistant</h2>
      <button ><a href="/metrics">Monitoring</a></button>
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
        <div key={index} className={`message ${msg.role} ${msg.status}`}>
          <p><strong>{msg.role === 'user' ? 'Vous' : `Bot (${formatDuration(msg.duration ?? 0)} from ${msg.provider})`}:</strong> {msg.content}</p>
        </div>
      ))}
      {loading && (
        <div className="message assistant success">
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
        {messages.length > 0 && <button disabled={loading} onClick={handleRetryMessage}>Retry</button>}
      </div>
    </div>
  );
};

export default Chat;
