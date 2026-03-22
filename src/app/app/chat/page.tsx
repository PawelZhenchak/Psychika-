'use client';

import { useState, useRef, useEffect } from 'react';

interface Message {
  role: 'user' | 'ai';
  text: string;
  time: string;
}

const SUGGESTIONS = [
  'Jestem dziś bardzo zestresowany...',
  'Nie mogę spać od kilku dni',
  'Czuję się samotny/a',
  'Mam problem w szkole',
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'ai',
      text: 'Cześć 👋 Jestem tutaj dla Ciebie. Możesz mi powiedzieć co czujesz — bez oceniania, anonimowo. O czym chcesz porozmawiać?',
      time: new Date().toLocaleTimeString('pl', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (text?: string) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput('');

    const userMsg: Message = {
      role: 'user',
      text: msg,
      time: new Date().toLocaleTimeString('pl', { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          text: data.reply || 'Przepraszam, spróbuj ponownie.',
          time: new Date().toLocaleTimeString('pl', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'ai', text: '⚠️ Błąd połączenia. Sprawdź internet i spróbuj ponownie.', time: '' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b shrink-0"
        style={{ borderColor: 'var(--border)' }}>
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
          style={{ background: 'linear-gradient(135deg, #7C3AED, #0D9488)' }}>🧠</div>
        <div>
          <p className="font-semibold text-sm" style={{ color: 'var(--text)' }}>Psyche AI</p>
          <p className="text-xs flex items-center gap-1" style={{ color: '#5EEAD4' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
            Online · Dostępny 24/7
          </p>
        </div>
        <div className="ml-auto text-xs px-3 py-1 rounded-full"
          style={{ background: 'var(--bg-card2)', color: 'var(--text-muted)' }}>
          🔒 Anonimowo
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'ai' && (
              <div className="w-8 h-8 rounded-full flex items-center justify-center mr-2 shrink-0 self-end"
                style={{ background: 'linear-gradient(135deg, #7C3AED, #0D9488)', fontSize: 14 }}>🧠</div>
            )}
            <div className="max-w-sm">
              <div className="px-4 py-3 rounded-2xl text-sm leading-relaxed"
                style={{
                  background: msg.role === 'user' ? 'var(--primary-soft)' : 'var(--bg-card)',
                  color: 'var(--text)',
                  borderRadius: msg.role === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                  border: msg.role === 'ai' ? '1px solid var(--border)' : 'none',
                }}>
                {msg.text}
              </div>
              {msg.time && (
                <p className="text-xs mt-1 px-1" style={{ color: 'var(--text-muted)', textAlign: msg.role === 'user' ? 'right' : 'left' }}>
                  {msg.time}
                </p>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="w-8 h-8 rounded-full flex items-center justify-center mr-2 shrink-0"
              style={{ background: 'linear-gradient(135deg, #7C3AED, #0D9488)', fontSize: 14 }}>🧠</div>
            <div className="px-4 py-3 rounded-2xl flex gap-1 items-center"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              {[0, 1, 2].map((d) => (
                <span key={d} className="w-2 h-2 rounded-full animate-bounce"
                  style={{ background: 'var(--primary)', animationDelay: `${d * 0.15}s` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      {messages.length === 1 && (
        <div className="px-6 pb-2 flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button key={s} onClick={() => sendMessage(s)}
              className="text-xs px-3 py-2 rounded-xl transition-all"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="px-6 py-4 border-t shrink-0" style={{ borderColor: 'var(--border)' }}>
        <div className="flex gap-3 items-end">
          <textarea
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            placeholder="Napisz jak się czujesz..."
            className="flex-1 resize-none rounded-2xl px-4 py-3 text-sm outline-none transition-all"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              color: 'var(--text)',
              maxHeight: 120,
            }}
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            className="w-11 h-11 rounded-2xl flex items-center justify-center transition-all shrink-0"
            style={{
              background: input.trim() && !loading ? 'linear-gradient(135deg, #7C3AED, #0D9488)' : 'var(--bg-card)',
              color: input.trim() && !loading ? '#fff' : 'var(--text-muted)',
              border: '1px solid var(--border)',
            }}
          >
            ↑
          </button>
        </div>
        <p className="text-xs text-center mt-2" style={{ color: 'var(--text-muted)' }}>
          Psychika to wsparcie AI — nie zastępuje psychologa. SOS: <strong>116 123</strong>
        </p>
      </div>
    </div>
  );
}
