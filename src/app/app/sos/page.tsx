'use client';

import { useState } from 'react';

const HOTLINES = [
  {
    name: 'Telefon Zaufania dla Dzieci i Młodzieży',
    number: '116 111',
    desc: 'Bezpłatny, całą dobę, 7 dni w tygodniu. Anonimowy.',
    color: '#F87171',
    icon: '📞',
  },
  {
    name: 'Telefon Zaufania dla Dorosłych',
    number: '116 123',
    desc: 'Bezpłatny, całą dobę. Pomoc psychologiczna i kryzysowa.',
    color: '#FB923C',
    icon: '📱',
  },
  {
    name: 'Pogotowie Ratunkowe',
    number: '112',
    desc: 'Zagrożenie życia — dzwoń natychmiast.',
    color: '#EF4444',
    icon: '🚨',
  },
  {
    name: 'Centrum Wsparcia dla osób w kryzysie',
    number: '116 123',
    desc: 'Chat online: liniawsparcia.pl — całą dobę.',
    color: '#A78BFA',
    icon: '💬',
  },
];

const BREATHING_STEPS = ['Wdech 4s', 'Zatrzymaj 4s', 'Wydech 4s', 'Zatrzymaj 4s'];

const GROUNDING = [
  { num: '5', label: 'rzeczy które WIDZISZ', color: '#A78BFA' },
  { num: '4', label: 'rzeczy które CZUJESZ dotykiem', color: '#5EEAD4' },
  { num: '3', label: 'rzeczy które SŁYSZYSZ', color: '#34D399' },
  { num: '2', label: 'rzeczy które WĄCHASZ', color: '#FACC15' },
  { num: '1', label: 'rzecz którą SMAKUJESZ', color: '#F9A8D4' },
];

export default function SosPage() {
  const [breathStep, setBreathStep] = useState(0);
  const [breathing, setBreathing] = useState(false);
  const [groundStep, setGroundStep] = useState(-1);

  const startBreathing = () => {
    setBreathing(true);
    setBreathStep(0);
    const run = (step: number) => {
      setBreathStep(step);
      setTimeout(() => {
        const next = (step + 1) % BREATHING_STEPS.length;
        if (next !== 0 || step !== BREATHING_STEPS.length - 1) run(next);
        else { setBreathing(false); setBreathStep(0); }
      }, 4000);
    };
    run(0);
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Header */}
      <div className="px-6 py-5 border-b shrink-0"
        style={{ background: 'linear-gradient(135deg, #3b0a0a, #1a0a0a)', borderColor: '#7f1d1d' }}>
        <div className="flex items-center gap-3">
          <span className="text-3xl">🆘</span>
          <div>
            <h1 className="text-2xl font-bold text-white">Tryb SOS</h1>
            <p className="text-sm mt-0.5" style={{ color: '#FCA5A5' }}>
              Jesteś bezpieczny/a. Tutaj jest pomoc.
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 px-6 py-6 max-w-2xl mx-auto w-full flex flex-col gap-6">

        {/* Emergency message */}
        <div className="p-5 rounded-2xl text-center"
          style={{ background: 'linear-gradient(135deg, #1c0a0a, #0f0a1e)', border: '1px solid #7f1d1d' }}>
          <p className="text-lg font-bold mb-2 text-white">
            Jeśli jesteś w niebezpieczeństwie — zadzwoń teraz
          </p>
          <a href="tel:112"
            className="inline-block text-4xl font-bold py-3 px-8 rounded-2xl mt-2 transition-all hover:scale-105"
            style={{ background: '#EF4444', color: '#fff' }}>
            🚨 112
          </a>
        </div>

        {/* Quick breathing */}
        <div className="p-5 rounded-2xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <p className="font-semibold mb-1" style={{ color: 'var(--text)' }}>🌬️ Oddychaj ze mną</p>
          <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
            Skupienie na oddechu zmniejsza panikę w 60 sekund.
          </p>
          {!breathing ? (
            <button onClick={startBreathing}
              className="w-full py-3 rounded-xl font-semibold text-sm"
              style={{ background: 'linear-gradient(135deg, #7C3AED, #0D9488)', color: '#fff' }}>
              Zacznij ćwiczenie
            </button>
          ) : (
            <div className="text-center py-4">
              <div className="text-5xl mb-2 animate-pulse">
                {breathStep === 0 ? '⬆️' : breathStep === 2 ? '⬇️' : '⏸️'}
              </div>
              <p className="text-2xl font-bold" style={{ color: '#A78BFA' }}>
                {BREATHING_STEPS[breathStep]}
              </p>
              <div className="flex justify-center gap-2 mt-4">
                {BREATHING_STEPS.map((_, i) => (
                  <div key={i} className="w-2 h-2 rounded-full transition-all"
                    style={{ background: breathStep === i ? '#A78BFA' : 'var(--border)' }} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 5-4-3-2-1 Grounding */}
        <div className="p-5 rounded-2xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <p className="font-semibold mb-1" style={{ color: 'var(--text)' }}>🌿 Grounding 5-4-3-2-1</p>
          <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
            Atak paniki? Skup się na zmysłach — to przywróci Cię do teraźniejszości.
          </p>
          <div className="flex flex-col gap-2">
            {GROUNDING.map((g, i) => (
              <button key={i}
                onClick={() => setGroundStep(i === groundStep ? -1 : i)}
                className="flex items-center gap-3 p-3 rounded-xl text-left transition-all"
                style={{
                  background: groundStep === i ? g.color + '22' : 'var(--bg-base)',
                  border: `1px solid ${groundStep === i ? g.color : 'var(--border)'}`,
                }}>
                <span className="text-2xl font-bold w-8 text-center" style={{ color: g.color }}>{g.num}</span>
                <span className="text-sm" style={{ color: groundStep === i ? g.color : 'var(--text)' }}>{g.label}</span>
                {groundStep === i && <span className="ml-auto text-lg">✓</span>}
              </button>
            ))}
          </div>
          {groundStep === 4 && (
            <div className="mt-4 p-3 rounded-xl text-center text-sm"
              style={{ background: '#34D39922', border: '1px solid #34D399', color: '#34D399' }}>
              ✨ Świetnie! Jesteś tu i teraz. Jesteś bezpieczny/a.
            </div>
          )}
        </div>

        {/* Hotlines */}
        <div>
          <p className="font-semibold mb-3 text-sm" style={{ color: 'var(--text-muted)' }}>
            📞 Numery pomocowe — bezpłatne, całą dobę
          </p>
          <div className="flex flex-col gap-3">
            {HOTLINES.map((h) => (
              <a key={h.number + h.name} href={`tel:${h.number.replace(' ', '')}`}
                className="flex items-center gap-4 p-4 rounded-2xl transition-all hover:scale-[1.01]"
                style={{ background: 'var(--bg-card)', border: `1px solid ${h.color}33` }}>
                <span className="text-2xl">{h.icon}</span>
                <div className="flex-1">
                  <p className="font-semibold text-sm" style={{ color: h.color }}>{h.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{h.desc}</p>
                </div>
                <span className="text-lg font-bold shrink-0" style={{ color: h.color }}>{h.number}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Reminder */}
        <div className="p-5 rounded-2xl text-center"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <p className="text-2xl mb-2">💙</p>
          <p className="font-semibold mb-1" style={{ color: 'var(--text)' }}>To minie.</p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Każdy kryzys ma koniec. Nie jesteś sam/a. Zrobiłeś/aś dobrze, że tu jesteś.
          </p>
        </div>

      </div>
    </div>
  );
}
