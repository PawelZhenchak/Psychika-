'use client';

import { useState, useEffect } from 'react';
import { useUserPlan } from '@/hooks/useUserPlan';
import Link from 'next/link';

interface JournalEntry {
  id: string;
  date: string;
  title: string;
  content: string;
  aiComment?: string;
  loadingAi?: boolean;
}

const today = () => new Date().toISOString().slice(0, 10);

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('pl', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

const PROMPTS = [
  'Jak minął dzisiaj dzień?',
  'Co Cię dzisiaj zaskoczyło?',
  'Za co jesteś dzisiaj wdzięczny/a?',
  'Co Cię dzisiaj stresowało?',
  'Czego dzisiaj się nauczyłeś/aś?',
];

const FREE_JOURNAL_LIMIT = 5;

export default function JournalPage() {
  const { isPremium } = useUserPlan();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [view, setView] = useState<'list' | 'write' | 'read'>('list');
  const [current, setCurrent] = useState<JournalEntry | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [prompt] = useState(() => PROMPTS[Math.floor(Math.random() * PROMPTS.length)]);

  useEffect(() => {
    const raw = localStorage.getItem('psychika_journal');
    if (raw) setEntries(JSON.parse(raw));
  }, []);

  const save = (entries: JournalEntry[]) => {
    localStorage.setItem('psychika_journal', JSON.stringify(entries));
    setEntries(entries);
  };

  const journalLimitReached = !isPremium && entries.length >= FREE_JOURNAL_LIMIT;

  const saveEntry = () => {
    if (!content.trim() || journalLimitReached) return;
    setSaving(true);
    const entry: JournalEntry = {
      id: Date.now().toString(),
      date: today(),
      title: title.trim() || prompt,
      content: content.trim(),
    };
    const updated = [entry, ...entries];
    save(updated);
    setSaving(false);
    setTitle('');
    setContent('');
    setView('list');
  };

  const deleteEntry = (id: string) => {
    save(entries.filter(e => e.id !== id));
    if (view === 'read') setView('list');
  };

  const askAi = async (entry: JournalEntry) => {
    const updated = entries.map(e => e.id === entry.id ? { ...e, loadingAi: true } : e);
    save(updated);
    if (view === 'read') setCurrent({ ...entry, loadingAi: true });

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Przeczytaj mój wpis w dzienniku i odpowiedz empatycznie (2-3 zdania, bez oceniania):\n\nTytuł: ${entry.title}\n\n${entry.content}`,
          history: [],
        }),
      });
      const data = await res.json();
      const withAi = entries.map(e =>
        e.id === entry.id ? { ...e, aiComment: data.reply, loadingAi: false } : e
      );
      save(withAi);
      if (view === 'read') setCurrent({ ...entry, aiComment: data.reply, loadingAi: false });
    } catch {
      const withErr = entries.map(e =>
        e.id === entry.id ? { ...e, aiComment: 'Błąd połączenia.', loadingAi: false } : e
      );
      save(withErr);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Header */}
      <div className="px-6 py-5 border-b shrink-0 flex items-center justify-between"
        style={{ borderColor: 'var(--border)' }}>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>📓 Dziennik</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Prywatne notatki tylko dla Ciebie</p>
        </div>
        {view === 'list' && (
          !isPremium && entries.length >= FREE_JOURNAL_LIMIT ? (
            <Link href="/pricing"
              className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
              style={{ background: 'linear-gradient(135deg, #7C3AED, #0D9488)', color: '#fff' }}>
              🔒 Odblokuj Premium
            </Link>
          ) : (
            <button onClick={() => setView('write')}
              className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
              style={{ background: 'linear-gradient(135deg, #7C3AED, #0D9488)', color: '#fff' }}>
              + Nowy wpis
            </button>
          )
        )}
        {view !== 'list' && (
          <button onClick={() => setView('list')}
            className="px-4 py-2 rounded-xl text-sm transition-all"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
            ← Wróć
          </button>
        )}
      </div>

      <div className="flex-1 px-6 py-6 max-w-2xl mx-auto w-full">

        {/* Write view */}
        {view === 'write' && (
          <div className="flex flex-col gap-4">
            <div className="p-4 rounded-xl text-sm" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
              💡 <em>{prompt}</em>
            </div>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Tytuł (opcjonalnie)"
              className="w-full px-4 py-3 rounded-xl text-sm outline-none"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text)' }}
            />
            <textarea
              rows={10}
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Napisz co czujesz, co myślisz, co się wydarzyło..."
              className="w-full resize-none px-4 py-3 rounded-xl text-sm outline-none leading-relaxed"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text)' }}
            />
            <button
              onClick={saveEntry}
              disabled={!content.trim() || saving}
              className="py-3 rounded-xl font-semibold text-sm transition-all"
              style={{
                background: content.trim() ? 'linear-gradient(135deg, #7C3AED, #0D9488)' : 'var(--bg-card)',
                color: content.trim() ? '#fff' : 'var(--text-muted)',
                border: content.trim() ? 'none' : '1px solid var(--border)',
              }}>
              Zapisz wpis
            </button>
          </div>
        )}

        {/* Read view */}
        {view === 'read' && current && (
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{formatDate(current.date)}</p>
              <h2 className="text-xl font-bold" style={{ color: 'var(--text)' }}>{current.title}</h2>
            </div>
            <div className="p-5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text)' }}>
              {current.content}
            </div>

            {/* AI comment */}
            {!current.aiComment && !current.loadingAi && (
              isPremium ? (
                <button onClick={() => askAi(current)}
                  className="py-3 rounded-xl text-sm font-medium transition-all"
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--primary)' }}>
                  🧠 Zapytaj AI o komentarz
                </button>
              ) : (
                <Link href="/pricing"
                  className="py-3 rounded-xl text-sm font-medium transition-all text-center block"
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                  🔒 Komentarz AI — dostępny w Premium
                </Link>
              )
            )}
            {current.loadingAi && (
              <div className="py-3 rounded-xl text-sm text-center" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                AI czyta i myśli...
              </div>
            )}
            {current.aiComment && (
              <div className="p-4 rounded-2xl text-sm leading-relaxed"
                style={{ background: 'linear-gradient(135deg, #1e1040, #0f1a20)', border: '1px solid #A78BFA44', color: 'var(--text)' }}>
                <p className="text-xs font-semibold mb-2" style={{ color: '#A78BFA' }}>🧠 Psyche AI:</p>
                {current.aiComment}
              </div>
            )}

            <button onClick={() => deleteEntry(current.id)}
              className="py-2 rounded-xl text-xs transition-all"
              style={{ color: '#F87171', border: '1px solid #F8717122', background: 'transparent' }}>
              🗑 Usuń wpis
            </button>
          </div>
        )}

        {/* List view */}
        {view === 'list' && (
          <>
            {entries.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-4xl mb-3">📓</p>
                <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>Jeszcze nie ma wpisów. Zacznij pisać!</p>
                <button onClick={() => setView('write')}
                  className="px-6 py-3 rounded-xl text-sm font-semibold"
                  style={{ background: 'linear-gradient(135deg, #7C3AED, #0D9488)', color: '#fff' }}>
                  Napisz pierwszy wpis
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {/* Limit banner for free users */}
                {!isPremium && (
                  <div className="p-3 rounded-xl text-center text-xs"
                    style={{
                      background: entries.length >= FREE_JOURNAL_LIMIT ? 'rgba(239,68,68,0.1)' : 'var(--bg-card2)',
                      border: entries.length >= FREE_JOURNAL_LIMIT ? '1px solid rgba(239,68,68,0.3)' : '1px solid var(--border)',
                      color: entries.length >= FREE_JOURNAL_LIMIT ? '#EF4444' : 'var(--text-muted)',
                    }}>
                    📓 {entries.length}/{FREE_JOURNAL_LIMIT} wpisów · {entries.length >= FREE_JOURNAL_LIMIT ? 'Limit osiągnięty — ' : ''}
                    {entries.length >= FREE_JOURNAL_LIMIT && (
                      <Link href="/pricing" className="underline font-semibold" style={{ color: 'var(--primary)' }}>
                        Odblokuj Premium
                      </Link>
                    )}
                  </div>
                )}
                {entries.map(e => (
                  <button key={e.id}
                    onClick={() => { setCurrent(e); setView('read'); }}
                    className="p-4 rounded-2xl text-left transition-all hover:scale-[1.01]"
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate" style={{ color: 'var(--text)' }}>{e.title}</p>
                        <p className="text-xs mt-1 truncate" style={{ color: 'var(--text-muted)' }}>{e.content}</p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          {new Date(e.date).toLocaleDateString('pl', { day: 'numeric', month: 'short' })}
                        </p>
                        {e.aiComment && <p className="text-xs mt-1" style={{ color: '#A78BFA' }}>🧠 AI</p>}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
