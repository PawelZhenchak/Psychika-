'use client';

import { useState, useEffect } from 'react';

const MOODS = [
  { emoji: '😢', label: 'Bardzo źle', value: 1, color: '#F87171' },
  { emoji: '😕', label: 'Źle', value: 2, color: '#FB923C' },
  { emoji: '😐', label: 'Neutralnie', value: 3, color: '#FACC15' },
  { emoji: '🙂', label: 'Dobrze', value: 4, color: '#34D399' },
  { emoji: '😄', label: 'Świetnie', value: 5, color: '#A78BFA' },
];

interface MoodEntry {
  date: string;
  value: number;
  note: string;
  emoji: string;
}

const today = () => new Date().toISOString().slice(0, 10);

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('pl', { weekday: 'short', day: 'numeric', month: 'short' });
};

export default function MoodPage() {
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [note, setNote] = useState('');
  const [saved, setSaved] = useState(false);
  const todayStr = today();
  const todayEntry = entries.find(e => e.date === todayStr);

  useEffect(() => {
    const raw = localStorage.getItem('psychika_mood');
    if (raw) setEntries(JSON.parse(raw));
  }, []);

  const saveEntry = () => {
    if (!selected) return;
    const mood = MOODS.find(m => m.value === selected)!;
    const entry: MoodEntry = { date: todayStr, value: selected, note, emoji: mood.emoji };
    const updated = [...entries.filter(e => e.date !== todayStr), entry]
      .sort((a, b) => a.date.localeCompare(b.date));
    setEntries(updated);
    localStorage.setItem('psychika_mood', JSON.stringify(updated));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  // Last 7 days for chart
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().slice(0, 10);
  });

  const chartMax = 5;
  const avg = entries.length
    ? Math.round((entries.reduce((s, e) => s + e.value, 0) / entries.length) * 10) / 10
    : null;

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Header */}
      <div className="px-6 py-5 border-b shrink-0" style={{ borderColor: 'var(--border)' }}>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>📊 Mood Tracker</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Jak się czujesz dzisiaj?</p>
      </div>

      <div className="flex-1 px-6 py-6 flex flex-col gap-6 max-w-2xl mx-auto w-full">

        {/* Today check-in */}
        <div className="p-6 rounded-2xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <p className="font-semibold mb-4 text-sm" style={{ color: 'var(--text-muted)' }}>
            {todayEntry ? '✅ Dzisiaj już zaznaczono — możesz zmienić' : `Dzisiaj, ${new Date().toLocaleDateString('pl', { day: 'numeric', month: 'long' })}`}
          </p>

          {/* Emoji picker */}
          <div className="flex justify-between gap-2 mb-5">
            {MOODS.map((m) => (
              <button
                key={m.value}
                onClick={() => setSelected(m.value)}
                className="flex flex-col items-center gap-1 flex-1 py-3 rounded-2xl transition-all"
                style={{
                  background: selected === m.value ? m.color + '22' : 'var(--bg-base)',
                  border: `2px solid ${selected === m.value ? m.color : 'transparent'}`,
                  transform: selected === m.value ? 'scale(1.1)' : 'scale(1)',
                }}
              >
                <span className="text-3xl">{m.emoji}</span>
                <span className="text-xs" style={{ color: selected === m.value ? m.color : 'var(--text-muted)' }}>
                  {m.label}
                </span>
              </button>
            ))}
          </div>

          {/* Note */}
          <textarea
            rows={2}
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Coś szczególnego się wydarzyło? (opcjonalnie)"
            className="w-full resize-none rounded-xl px-4 py-3 text-sm outline-none"
            style={{
              background: 'var(--bg-base)',
              border: '1px solid var(--border)',
              color: 'var(--text)',
            }}
          />

          <button
            onClick={saveEntry}
            disabled={!selected}
            className="mt-4 w-full py-3 rounded-xl font-semibold text-sm transition-all"
            style={{
              background: selected ? 'linear-gradient(135deg, #7C3AED, #0D9488)' : 'var(--bg-base)',
              color: selected ? '#fff' : 'var(--text-muted)',
              border: selected ? 'none' : '1px solid var(--border)',
            }}
          >
            {saved ? '✅ Zapisano!' : 'Zapisz nastrój'}
          </button>
        </div>

        {/* Chart - last 7 days */}
        {entries.length > 0 && (
          <div className="p-6 rounded-2xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <div className="flex items-center justify-between mb-4">
              <p className="font-semibold text-sm" style={{ color: 'var(--text)' }}>Ostatnie 7 dni</p>
              {avg && (
                <span className="text-xs px-3 py-1 rounded-full"
                  style={{ background: 'var(--bg-card2)', color: 'var(--primary)' }}>
                  Średnia: {avg}/5
                </span>
              )}
            </div>
            <div className="flex items-end gap-2 h-32">
              {last7.map((date) => {
                const entry = entries.find(e => e.date === date);
                const height = entry ? (entry.value / chartMax) * 100 : 0;
                const mood = entry ? MOODS.find(m => m.value === entry.value) : null;
                const isToday = date === todayStr;
                return (
                  <div key={date} className="flex flex-col items-center flex-1 gap-1">
                    {entry && <span className="text-sm">{mood?.emoji}</span>}
                    <div className="w-full rounded-t-lg transition-all relative group"
                      style={{
                        height: `${Math.max(height, 4)}%`,
                        background: mood ? mood.color + (isToday ? 'FF' : '88') : 'var(--border)',
                        minHeight: 4,
                      }}>
                      {entry?.note && (
                        <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 w-32 text-xs p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none"
                          style={{ background: 'var(--bg-card2)', color: 'var(--text)', border: '1px solid var(--border)' }}>
                          {entry.note}
                        </div>
                      )}
                    </div>
                    <span className="text-xs" style={{ color: isToday ? 'var(--primary)' : 'var(--text-muted)', fontWeight: isToday ? 600 : 400 }}>
                      {formatDate(date).split(' ')[0]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* History */}
        {entries.length > 0 && (
          <div className="p-6 rounded-2xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <p className="font-semibold text-sm mb-4" style={{ color: 'var(--text)' }}>Historia</p>
            <div className="flex flex-col gap-3">
              {[...entries].reverse().slice(0, 10).map((e) => {
                const mood = MOODS.find(m => m.value === e.value)!;
                return (
                  <div key={e.date} className="flex items-center gap-3">
                    <span className="text-2xl">{e.emoji}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                        {formatDate(e.date)}
                      </p>
                      {e.note && <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{e.note}</p>}
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full" style={{ background: mood.color + '22', color: mood.color }}>
                      {mood.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {entries.length === 0 && !selected && (
          <div className="text-center py-10" style={{ color: 'var(--text-muted)' }}>
            <p className="text-4xl mb-3">📊</p>
            <p className="text-sm">Zaznacz dzisiejszy nastrój żeby zacząć śledzić</p>
          </div>
        )}
      </div>
    </div>
  );
}
