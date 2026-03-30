import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

export default function Chat() {
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const [messages, setMessages] = useState([
    { id: 1, sender: 'bot', text: 'Hello! I am your **AI Assistant**. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);

  // Improved Smooth Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  }, [messages, isLoading]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = { id: Date.now(), sender: 'user', text: input };
    setMessages((prev) => [...prev, userMsg]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: currentInput }),
      });
      const data = await response.json();
      setMessages((prev) => [...prev, { id: Date.now() + 1, sender: 'bot', text: data.response }]);
    } catch (err) {
      setMessages((prev) => [...prev, { id: Date.now() + 1, sender: 'bot', text: 'Connection error.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-dvh bg-zinc-100 text-zinc-900">
      <header className="p-4 border-b bg-white/80 backdrop-blur-md sticky top-0 z-10">
        <h1 className="text-lg font-bold flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
          AI Assistant
        </h1>
      </header>

      <main ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
            {/* Avatar for Bot */}
            {msg.sender === 'bot' && (
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs shrink-0">
                AI
              </div>
            )}
            
            {/* Message Bubble */}
            <div className={`max-w-[65%] px-4 py-3 rounded-2xl shadow-md ${
              msg.sender === 'user' 
                ? 'bg-blue-600 text-white rounded-tr-none' 
                : 'bg-white border border-zinc-200 rounded-tl-none'
            }`}>
              <div className={`prose prose-sm max-w-none ${msg.sender === 'user' ? 'prose-invert' : 'prose-zinc'}`}>
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              </div>
            </div>
          </div>
        ))}
        
        {/* Typing Animation */}
        {isLoading && (
          <div className="flex items-center gap-2 text-zinc-400 px-11">
            <span className="text-sm italic">Assistant is typing</span>
            <span className="flex gap-1">
              <span className="w-1 h-1 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1 h-1 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1 h-1 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </span>
          </div>
        )}
      </main>

      <footer className="p-4 bg-white border-t">
        <form onSubmit={sendMessage} className="max-w-3xl mx-auto flex gap-3">
          <input
            className="flex-1 bg-white border border-zinc-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm transition-all"
            placeholder="Ask anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button 
            type="submit"
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50 shadow-lg"
            disabled={isLoading}
          >
            Send
          </button>
        </form>
      </footer>
    </div>
  );
}
