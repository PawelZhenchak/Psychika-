'use client';

import { useState, useRef, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useChatLimit } from '@/hooks/useChatLimit';
import { useUserPlan } from '@/hooks/useUserPlan';
import UpgradeModal from '@/components/UpgradeModal';

interface Message {
  role: 'user' | 'ai';
  text: string;
  time: string;
}

// Wrapper with Suspense for useSearchParams
export default function ChatPageWrapper() {
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center"><p style={{ color: 'var(--text-muted)' }}>Ładowanie...</p></div>}>
      <ChatPage />
    </Suspense>
  );
}

const GREETING: Message = {
  role: 'ai',
  text: 'Cześć 👋 Jestem tutaj dla Ciebie. Możesz mi powiedzieć co czujesz — bez oceniania, anonimowo. O czym chcesz porozmawiać?',
  time: new Date().toLocaleTimeString('pl', { hour: '2-digit', minute: '2-digit' }),
};

const SUGGESTIONS = [
  'Jestem dziś bardzo zestresowany...',
  'Nie mogę spać od kilku dni',
  'Czuję się samotny/a',
  'Mam problem w szkole',
];

const fmtTime = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleTimeString('pl', { hour: '2-digit', minute: '2-digit' })
    : new Date().toLocaleTimeString('pl', { hour: '2-digit', minute: '2-digit' });

function ChatPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { canSend, remaining, increment, isLoading, limit } = useChatLimit();
  const { isPremium } = useUserPlan();

  const [conversationId, setConversationId] = useState<string | null>(null);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [messages, setMessages] = useState<Message[]>([GREETING]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingConv, setLoadingConv] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Load conversation from URL param ?id=xxx
  const loadConversation = useCallback(async (id: string) => {
    setLoadingConv(true);
    try {
      const res = await fetch(`/api/conversations/${id}`);
      if (!res.ok) throw new Error('Not found');
      const data = await res.json();
      const loaded: Message[] = [
        GREETING,
        ...data.messages.map((m: { role: string; text: string; created_at: string }) => ({
          role: m.role as 'user' | 'ai',
          text: m.text,
          time: fmtTime(m.created_at),
        })),
      ];
      setMessages(loaded);
      setConversationId(id);
    } catch {
      // Invalid conversation, start fresh
      setMessages([GREETING]);
      setConversationId(null);
    } finally {
      setLoadingConv(false);
    }
  }, []);

  useEffect(() => {
    const id = searchParams.get('id');
    if (id && isPremium) {
      loadConversation(id);
    }
  }, [searchParams, isPremium, loadConversation]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Save messages to Supabase (Premium only)
  const saveToHistory = async (convId: string, userText: string, aiText: string) => {
    try {
      await fetch(`/api/conversations/${convId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userMessage: userText, aiMessage: aiText }),
      });
    } catch {
      // Silent fail — history is optional
    }
  };

  const sendMessage = async (text?: string) => {
    const msg = text || input.trim();
    if (!msg || loading) return;

    if (!canSend) {
      setShowUpgrade(true);
      return;
    }

    setInput('');

    const userMsg: Message = {
      role: 'user',
      text: msg,
      time: fmtTime(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const history = [...messages, userMsg]
        .filter((_, i) => i > 0)
        .slice(-20);

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, history }),
      });
      const data = await res.json();

      if (data.error) {
        throw new Error(data.error);
      }

      increment();

      const aiText = data.reply || 'Przepraszam, spróbuj ponownie.';

      setMessages((prev) => [
        ...prev,
        { role: 'ai', text: aiText, time: fmtTime() },
      ]);

      // Save to Supabase for Premium users
      if (isPremium) {
        let convId = conversationId;

        // Create new conversation if none exists
        if (!convId) {
          try {
            const convRes = await fetch('/api/conversations', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ title: msg.slice(0, 60) }),
            });
            const convData = await convRes.json();
            convId = convData.id;
            setConversationId(convId);
            // Update URL without reload
            router.replace(`/app/chat?id=${convId}`, { scroll: false });
          } catch {
            // Could not create conversation, skip saving
            return;
          }
        }

        if (convId) {
          saveToHistory(convId, msg, aiText);
        }
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'ai', text: '⚠️ Błąd połączenia. Sprawdź internet i spróbuj ponownie.', time: '' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Start new conversation
  const newConversation = () => {
    setMessages([GREETING]);
    setConversationId(null);
    router.replace('/app/chat', { scroll: false });
  };

  return (
    <div className="flex flex-col h-full">
      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}

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
        <div className="ml-auto flex items-center gap-2">
          {/* New conversation button */}
          {conversationId && (
            <button onClick={newConversation}
              className="text-xs px-3 py-1 rounded-full transition-all"
              style={{ background: 'var(--bg-card2)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
              + Nowa
            </button>
          )}
          {/* Message counter for free users */}
          {!isLoading && remaining < limit && (
            <div className="text-xs px-3 py-1 rounded-full"
              style={{
                background: remaining <= 3 ? 'rgba(239,68,68,0.15)' : 'var(--bg-card2)',
                color: remaining <= 3 ? '#EF4444' : 'var(--text-muted)',
                border: remaining <= 3 ? '1px solid rgba(239,68,68,0.3)' : 'none',
              }}>
              💬 {remaining}/{limit}
            </div>
          )}
          <div className="text-xs px-3 py-1 rounded-full"
            style={{ background: 'var(--bg-card2)', color: 'var(--text-muted)' }}>
            🔒 Anonimowo
          </div>
        </div>
      </div>

      {/* Loading conversation */}
      {loadingConv ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Ładowanie rozmowy...</p>
        </div>
      ) : (
        <>
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

          {/* Paywall banner */}
          {!canSend && (
            <div className="mx-6 mb-2 p-4 rounded-2xl text-center"
              style={{
                background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(14,148,136,0.15))',
                border: '1px solid rgba(167,139,250,0.3)',
              }}>
              <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text)' }}>
                Wykorzystałeś dzisiejszy limit 💬
              </p>
              <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
                Darmowy plan ma {limit} wiadomości dziennie. Odblokuj nielimitowany chat z Premium.
              </p>
              <button onClick={() => setShowUpgrade(true)}
                className="inline-block px-6 py-2 rounded-xl text-sm font-semibold transition-all hover:scale-105"
                style={{ background: 'linear-gradient(135deg, #7C3AED, #0D9488)', color: '#fff' }}>
                Odblokuj Premium →
              </button>
              <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                Limit resetuje się o północy
              </p>
            </div>
          )}

          {/* Suggestions */}
          {messages.length === 1 && canSend && (
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
                placeholder={!canSend ? 'Limit wiadomości wyczerpany...' : 'Napisz jak się czujesz...'}
                disabled={!canSend}
                className="flex-1 resize-none rounded-2xl px-4 py-3 text-sm outline-none transition-all"
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  color: 'var(--text)',
                  maxHeight: 120,
                  opacity: !canSend ? 0.5 : 1,
                }}
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || loading || !canSend}
                className="w-11 h-11 rounded-2xl flex items-center justify-center transition-all shrink-0"
                style={{
                  background: input.trim() && !loading && canSend ? 'linear-gradient(135deg, #7C3AED, #0D9488)' : 'var(--bg-card)',
                  color: input.trim() && !loading && canSend ? '#fff' : 'var(--text-muted)',
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
        </>
      )}
    </div>
  );
}
