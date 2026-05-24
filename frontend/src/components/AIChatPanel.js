import React, { useState, useEffect, useRef } from 'react';
import { aiAPI } from '../services/api';
import '../styles/AIMascot.css';

const ALLOWED_SUBJECTS = [
  'Maths', 'Science', 'Physics', 'Chemistry', 'Biology',
  'Social Studies', 'English', 'Telugu', 'Hindi', 'Computer Basics'
];

export default function AIChatPanel({ isOpen, onClose, initialData }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [selectedSubject, setSelectedSubject] = useState('Science');
  
  const messagesEndRef = useRef(null);

  // Set up initial greeting
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          sender: 'assistant',
          text: `Hi there! I'm your EduMasterPro AI Tutor! 🚀\n\nI can help you learn, solve doubts, summarize your notes, and translate explanations in English, Telugu, or Hindi!\n\nWhich subject are we studying today?`,
          actions: true
        }
      ]);
    }
  }, [messages]);

  // Handle incoming global events to open chat with specific actions (e.g. summarize notes)
  useEffect(() => {
    const handleGlobalOpen = async (e) => {
      const { action, text, subject, materialId, attemptId } = e.detail || {};
      
      if (subject && ALLOWED_SUBJECTS.includes(subject)) {
        setSelectedSubject(subject);
      }

      if (action === 'summarize') {
        setMessages(prev => [
          ...prev,
          {
            id: Date.now() + '-stud',
            sender: 'student',
            text: materialId 
              ? 'Can you summarize this study material notes for me?' 
              : 'Can you summarize these notes?'
          }
        ]);
        setLoading(true);
        try {
          const res = await aiAPI.summarize(materialId, text, 'summarize', selectedLanguage);
          setMessages(prev => [
            ...prev,
            {
              id: Date.now() + '-ai',
              sender: 'assistant',
              text: res.data.result || 'Here is the summary!'
            }
          ]);
        } catch (error) {
          const errMsg = error.response?.data?.error || 'Oh no, I encountered an error. Please try again.';
          setMessages(prev => [
            ...prev,
            {
              id: Date.now() + '-ai',
              sender: 'assistant',
              text: errMsg,
              isBlocked: error.response?.status === 400 && errMsg.includes("only help")
            }
          ]);
        } finally {
          setLoading(false);
        }
      } else if (action === 'translate') {
        setMessages(prev => [
          ...prev,
          {
            id: Date.now() + '-stud',
            sender: 'student',
            text: `Can you translate these notes into ${selectedLanguage}?`
          }
        ]);
        setLoading(true);
        try {
          const res = await aiAPI.summarize(materialId, text, 'translate', selectedLanguage);
          setMessages(prev => [
            ...prev,
            {
              id: Date.now() + '-ai',
              sender: 'assistant',
              text: res.data.result || 'Here is your translation!'
            }
          ]);
        } catch (error) {
          const errMsg = error.response?.data?.error || 'Oh no, I encountered an error. Please try again.';
          setMessages(prev => [
            ...prev,
            {
              id: Date.now() + '-ai',
              sender: 'assistant',
              text: errMsg,
              isBlocked: error.response?.status === 400 && errMsg.includes("only help")
            }
          ]);
        } finally {
          setLoading(false);
        }
      } else if (action === 'explain-quiz') {
        setMessages(prev => [
          ...prev,
          {
            id: Date.now() + '-stud',
            sender: 'student',
            text: 'I completed my quiz. Could you explain the questions I got wrong?'
          }
        ]);
        setLoading(true);
        try {
          const res = await aiAPI.explainAnswer(attemptId);
          setMessages(prev => [
            ...prev,
            {
              id: Date.now() + '-ai',
              sender: 'assistant',
              text: res.data.explanation || 'Here is the breakdown of your quiz attempt.'
            }
          ]);
        } catch (error) {
          setMessages(prev => [
            ...prev,
            {
              id: Date.now() + '-ai',
              sender: 'assistant',
              text: error.response?.data?.error || 'I could not retrieve the quiz attempts. Make sure you finished the attempt!'
            }
          ]);
        } finally {
          setLoading(false);
        }
      }
    };

    window.addEventListener('open-ai-chat', handleGlobalOpen);
    return () => window.removeEventListener('open-ai-chat', handleGlobalOpen);
  }, [selectedLanguage]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (textToSend) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    // Add user message
    const userMsg = {
      id: Date.now() + '-student',
      sender: 'student',
      text: query
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    // Format chat history
    const history = messages
      .filter(m => m.id !== 'welcome')
      .map(m => ({
        role: m.sender === 'student' ? 'user' : 'assistant',
        content: m.text
      }));

    try {
      // Send chat message with subject context
      const res = await aiAPI.chat(
        `[Subject: ${selectedSubject}] ${query}`,
        history,
        selectedLanguage
      );

      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + '-ai',
          sender: 'assistant',
          text: res.data.message
        }
      ]);
    } catch (error) {
      console.error('Chat error:', error);
      const errMsg = error.response?.data?.error || 'Oops, connection issue! Please try again.';
      
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + '-ai',
          sender: 'assistant',
          text: errMsg,
          isBlocked: error.response?.status === 400 && errMsg.includes("only help")
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = (action) => {
    let promptText = '';
    if (action === 'math') {
      setSelectedSubject('Maths');
      promptText = 'Solve 2x + 5 = 15 step-by-step';
    } else if (action === 'science') {
      setSelectedSubject('Science');
      promptText = 'Explain photosynthesis in simple terms';
    } else if (action === 'summarize') {
      promptText = 'How do I write a good summary of science notes?';
    } else if (action === 'quiz') {
      promptText = 'Ask me a fun Class 8 Science question!';
    }
    
    handleSend(promptText);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="ai-chat-backdrop" onClick={onClose}></div>
      <div className="ai-chat-drawer" style={{ transform: isOpen ? 'translateX(0)' : 'translateX(100%)' }}>
        
        {/* Drawer Header */}
        <div className="ai-chat-header">
          <div className="ai-chat-header-info">
            <img src="/assets/mascot.png" alt="Mascot" className="ai-chat-header-mascot" />
            <div>
              <h3 className="ai-chat-header-title">EduMaster AI Tutor</h3>
              <span className="ai-chat-header-subtitle">Online & Safe</span>
            </div>
          </div>
          <button className="ai-chat-close-btn" onClick={onClose} aria-label="Close Chat">
            ✕
          </button>
        </div>

        {/* Dynamic Language & Subject Controllers */}
        <div className="ai-chat-controls">
          <div className="ai-control-group">
            <label>Language</label>
            <select 
              value={selectedLanguage} 
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="ai-chat-select"
            >
              <option value="English">🇬🇧 English</option>
              <option value="Hindi">🇮🇳 Hindi / हिंदी</option>
              <option value="Telugu">🇮🇳 Telugu / తెలుగు</option>
            </select>
          </div>
          <div className="ai-control-group">
            <label>Subject</label>
            <select 
              value={selectedSubject} 
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="ai-chat-select"
            >
              {ALLOWED_SUBJECTS.map(subj => (
                <option key={subj} value={subj}>{subj}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="ai-chat-messages">
          {messages.map(msg => (
            <div 
              key={msg.id} 
              className={`ai-chat-bubble-wrapper ${msg.sender} ${msg.isBlocked ? 'blocked' : ''}`}
            >
              <div className={`ai-chat-bubble-avatar ${msg.sender}`}>
                {msg.sender === 'student' ? 'S' : <img src="/assets/mascot.png" alt="AI" />}
              </div>
              <div className="ai-chat-bubble-content">
                <div style={{ whiteSpace: 'pre-line' }}>{msg.text}</div>
                
                {/* Show Quick Action Buttons on Greeting */}
                {msg.actions && (
                  <div className="ai-quick-actions">
                    <button onClick={() => handleQuickAction('science')} className="ai-action-pill">
                      🌱 Explain Photosynthesis
                    </button>
                    <button onClick={() => handleQuickAction('math')} className="ai-action-pill">
                      📐 Help with Maths
                    </button>
                    <button onClick={() => handleQuickAction('summarize')} className="ai-action-pill">
                      📝 Summarizing Tips
                    </button>
                    <button onClick={() => handleQuickAction('quiz')} className="ai-action-pill">
                      🧠 Fun Science Question
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="ai-chat-bubble-wrapper assistant">
              <div className="ai-chat-bubble-avatar assistant">
                <img src="/assets/mascot.png" alt="AI Loading" />
              </div>
              <div className="ai-chat-bubble-content">
                <div className="ai-typing-indicator">
                  <div className="ai-typing-dot"></div>
                  <div className="ai-typing-dot"></div>
                  <div className="ai-typing-dot"></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input Footer */}
        <div className="ai-chat-footer">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="ai-chat-input-wrapper"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Ask anything about ${selectedSubject}...`}
              className="ai-chat-input"
              disabled={loading}
            />
            <button 
              type="submit" 
              className="ai-chat-send-btn"
              disabled={loading || !input.trim()}
            >
              🚀
            </button>
          </form>
        </div>

      </div>
    </>
  );
}
