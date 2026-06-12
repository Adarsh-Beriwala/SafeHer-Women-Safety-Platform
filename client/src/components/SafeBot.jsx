import { useState, useRef, useEffect } from 'react';
import { FiMessageCircle, FiX, FiSend } from 'react-icons/fi';
import { sendChatMessage } from '../services/geminiService';
import './SafeBot.css';

const SafeBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hi, I am SafeHer AI. I can answer questions about women's safety, self-defense, and legal rights. How can I help?", isBot: true }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { text: userMessage, isBot: false }]);
    setIsLoading(true);

    const botResponse = await sendChatMessage(userMessage);
    
    setMessages(prev => [...prev, { text: botResponse, isBot: true }]);
    setIsLoading(false);
  };

  return (
    <div className="safebot-container">
      {isOpen && (
        <div className="safebot-window glass-card animate-fadeInUp">
          <div className="safebot-header">
            <div className="safebot-title">
              <FiMessageCircle /> SafeHer AI
            </div>
            <button className="safebot-close" onClick={() => setIsOpen(false)}>
              <FiX />
            </button>
          </div>
          
          <div className="safebot-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`chat-message ${msg.isBot ? 'bot' : 'user'}`}>
                {msg.text}
              </div>
            ))}
            {isLoading && (
              <div className="chat-message bot typing">
                <span className="dot"></span>
                <span className="dot"></span>
                <span className="dot"></span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form className="safebot-input-form" onSubmit={handleSend}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a safety question..."
              className="safebot-input"
              disabled={isLoading}
            />
            <button type="submit" className="safebot-send" disabled={isLoading || !input.trim()}>
              <FiSend />
            </button>
          </form>
        </div>
      )}

      {!isOpen && (
        <button className="safebot-toggle animate-bounce" onClick={() => setIsOpen(true)}>
          <FiMessageCircle size={24} />
        </button>
      )}
    </div>
  );
};

export default SafeBot;
