import { useState, useRef, useEffect, useCallback } from 'react';
import { sendChatMessage } from '../../api/chatbotApi';
import { useAuth } from '../../hooks/useAuth';

interface Message {
  id: string;
  role: 'user' | 'bot';
  text: string;
}

const WELCOME: Message = {
  id: 'welcome',
  role: 'bot',
  text: "Hi! I'm CampusBot 🏫 — your campus maintenance assistant. Ask me anything about your issues, status updates, or campus stats.",
};

export default function ChatbotWidget() {
  const { isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 150);
  }, [open]);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = { id: `u-${Date.now()}`, role: 'user', text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const reply = await sendChatMessage(text);
      setMessages((prev) => [
        ...prev,
        { id: `b-${Date.now()}`, role: 'bot', text: reply },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `e-${Date.now()}`,
          role: 'bot',
          text: "Sorry, I couldn't reach the server. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [input, loading]);

  if (!isAuthenticated) return null;

  return (
    <>
      {/* Floating toggle button */}
      <button
        id="chatbot-toggle-btn"
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-50 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center text-xl sm:text-2xl"
        aria-label="Toggle campus assistant"
      >
        {open ? '✕' : '💬'}
      </button>

      {/* Chat panel */}
      <div
        className={`fixed bottom-20 sm:bottom-24 inset-x-2 sm:inset-x-auto sm:right-6 z-50 sm:w-[350px] h-[480px] sm:h-[500px] flex flex-col bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden transition-all duration-300 origin-bottom-right ${
          open
            ? 'opacity-100 scale-100 pointer-events-auto'
            : 'opacity-0 scale-90 pointer-events-none'
        }`}
      >
        {/* Header */}
        <div className="bg-indigo-600 text-white px-4 py-3 flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-base">
            🏫
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold leading-tight">CampusBot</p>
            <p className="text-[11px] text-indigo-200">AI Maintenance Assistant</p>
          </div>
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" title="Online" />
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 bg-gray-50">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                  m.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-sm'
                    : 'bg-white text-gray-800 border border-gray-100 rounded-bl-sm'
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                <div className="flex gap-1 items-center h-4">
                  <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0ms]" />
                  <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:150ms]" />
                  <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="border-t border-gray-100 px-3 py-2.5 bg-white flex gap-2 items-center shrink-0">
          <input
            ref={inputRef}
            id="chatbot-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about your issues…"
            className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder:text-gray-400"
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            id="chatbot-send-btn"
            className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
            aria-label="Send message"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}
