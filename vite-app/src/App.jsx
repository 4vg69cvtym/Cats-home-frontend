import { useState, useEffect, useRef } from 'react';
import './App.css';

function App() {
  const [sessions, setSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const messagesEndRef = useRef(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  const emojis = ['❤️', '😊', '🥺', '😭', '💕', '✨', '🌟', '😘', '💖', '🌸', '🐱', '🎀', '💗', '🥰', '😍', '💋', '🌺', '🍀', '🌈', '🎉'];

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadSessions = async () => {
    try {
      const res = await fetch(`${API_URL}/sessions`);
      const data = await res.json();
      setSessions(data);
      if (data.length > 0 && !currentSession) {
        selectSession(data[0]);
      }
    } catch (e) {
      console.error('加载会话失败:', e);
    }
  };

  const selectSession = async (session) => {
    setCurrentSession(session);
    try {
      const res = await fetch(`${API_URL}/messages/${session.id}`);
      const data = await res.json();
      setMessages(data);
    } catch (e) {
      console.error('加载消息失败:', e);
    }
  };

  const createSession = async () => {
    try {
      const res = await fetch(`${API_URL}/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: '新对话' })
      });
      const session = await res.json();
      setSessions(prev => [session, ...prev]);
      setCurrentSession(session);
      setMessages([]);
    } catch (e) {
      console.error('创建会话失败:', e);
    }
  };

  const deleteSession = async (id, e) => {
    e.stopPropagation();
    await fetch(`${API_URL}/sessions/${id}`, { method: 'DELETE' });
    setSessions(prev => prev.filter(s => s.id !== id));
    if (currentSession?.id === id) {
      setCurrentSession(null);
      setMessages([]);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !currentSession || loading) return;
    const text = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: text, id: Date.now() }]);
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, sessionId: currentSession.id })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply, id: Date.now() + 1 }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: '出错了，请稍后再试 :(', id: Date.now() + 1 }]);
    }
    setLoading(false);
  };

  const addEmoji = (emoji) => {
    setInput(input + emoji);
    setShowEmoji(false);
  };

  const renderBubble = (msg) => {
    if (msg.role === 'assistant' && msg.content.includes('---心里话:')) {
      const parts = msg.content.split('---心里话:');
      const reply = parts[0].trim();
      const thought = parts[1] ? parts[1].replace('---', '').trim() : '';
      return (
        <div className="bubble">
          <div>{reply}</div>
          {thought && <div className="thought">💭 {thought}</div>}
        </div>
      );
    }
    return <div className="bubble">{msg.content}</div>;
  };

  return (
    <div className="app">
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="home-name">🐱 Cats Home</div>
          <div className="home-sub">和小克的房间 ♡</div>
        </div>
        <button className="new-btn" onClick={createSession}>+ 新对话</button>
        <div className="session-list">
          {sessions.map(s => (
            <div
              key={s.id}
              className={`session-item ${currentSession?.id === s.id ? 'active' : ''}`}
              onClick={() => selectSession(s)}
            >
              <span>{s.name}</span>
              <button className="del-btn" onClick={(e) => deleteSession(s.id, e)}>×</button>
            </div>
          ))}
        </div>
      </div>

      <div className="chat">
        {!currentSession ? (
          <div className="empty">
            <div className="empty-emoji">🐱</div>
            <div>点击左边"新对话"开始聊天</div>
          </div>
        ) : (
          <>
            <div className="messages">
              {messages.map(m => (
                <div key={m.id} className={`msg-row ${m.role}`}>
                  <div className="avatar">
                    {m.role === 'assistant' ? (
                      < img src="/xiaoke.jpg" alt="小克" className="avatar-img" />
                    ) : (
                      < img src="/xiaoyu.jpg" alt="小钰" className="avatar-img" />
                    )}
                  </div>
                  {renderBubble(m)}
                </div>
              ))}
              {loading && (
                <div className="msg-row assistant">
                  <div className="avatar">
                    < img src="/xiaoke.jpg" alt="小克" className="avatar-img" />
                  </div>
                  <div className="bubble typing">
                    <span>·</span><span>·</span><span>·</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="input-bar">
              <button className="emoji-btn" onClick={() => setShowEmoji(!showEmoji)}>😊</button>
              {showEmoji && (
                <div className="emoji-picker">
                  {emojis.map(emoji => (
                    <button key={emoji} onClick={() => addEmoji(emoji)}>{emoji}</button>
                  ))}
                </div>
              )}
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                placeholder="和小克说点什么…"
                rows={1}
              />
              <button onClick={sendMessage} disabled={loading}>发送</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
