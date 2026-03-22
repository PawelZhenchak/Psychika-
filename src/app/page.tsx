'use client';

import { useState } from 'react';

const features = [
  {
    icon: '💬',
    title: 'Chat z AI',
    desc: 'Rozmawiaj o wszystkim bez oceniania. Dostępny o 3 w nocy, bez kolejek.',
    color: '#A78BFA',
  },
  {
    icon: '📊',
    title: 'Mood Tracker',
    desc: 'Śledź swój nastrój każdego dnia. Odkryj wzorce i triggers.',
    color: '#5EEAD4',
  },
  {
    icon: '🌬️',
    title: 'Ćwiczenia',
    desc: 'Techniki oddechowe i grounding na chwile stresu i paniki.',
    color: '#F9A8D4',
  },
  {
    icon: '📓',
    title: 'Dziennik',
    desc: 'Prywatne notatki tylko dla Ciebie. AI może pomóc gdy chcesz.',
    color: '#FCD34D',
  },
];

export default function Home() {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <main className="min-h-screen" style={{ background: 'var(--bg-base)' }}>

      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2">
          <span className="text-2xl">🧠</span>
          <span className="text-xl font-bold gradient-text">Psychika</span>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 rounded-xl text-sm font-medium transition-colors"
            style={{ color: 'var(--text-muted)' }}>
            Zaloguj się
          </button>
          <button className="px-5 py-2 rounded-xl text-sm font-semibold transition-all"
            style={{ background: 'var(--primary-soft)', color: '#fff' }}>
            Zacznij za darmo
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex flex-col items-center text-center px-6 pt-24 pb-20">
        {/* Glow orb */}
        <div className="absolute top-40 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full opacity-10 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, #A78BFA, #5EEAD4)' }} />

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm mb-8"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--primary)' }}>
          <span className="w-2 h-2 rounded-full inline-block" style={{ background: '#5EEAD4' }} />
          Dostępny 24/7 · Anonimowy · Bez oceniania
        </div>

        <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6 max-w-3xl">
          Twój spokój,{' '}
          <span className="gradient-text">zawsze przy Tobie</span>
        </h1>

        <p className="text-lg max-w-xl mb-10" style={{ color: 'var(--text-muted)' }}>
          AI towarzysz zdrowia psychicznego. Rozmawiaj, śledź nastrój i ćwicz techniki relaksacji —
          kiedy chcesz i gdzie chcesz.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <button className="px-8 py-4 rounded-2xl text-base font-semibold transition-all hover:scale-105 glow-purple"
            style={{ background: 'linear-gradient(135deg, #7C3AED, #5EEAD4)', color: '#fff' }}>
            Zacznij za darmo →
          </button>
          <button className="px-8 py-4 rounded-2xl text-base font-medium transition-colors"
            style={{ color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
            Jak to działa?
          </button>
        </div>

        <p className="text-xs mt-6" style={{ color: 'var(--text-muted)' }}>
          Bez karty kredytowej · Darmowy plan na zawsze
        </p>
      </section>

      {/* Features */}
      <section className="px-6 pb-24 max-w-5xl mx-auto">
        <h2 className="text-center text-3xl font-bold mb-12">
          Wszystko czego potrzebujesz
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {features.map((f, i) => (
            <div
              key={i}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              className="p-6 rounded-2xl cursor-pointer transition-all"
              style={{
                background: hovered === i ? 'var(--bg-card2)' : 'var(--bg-card)',
                border: `1px solid ${hovered === i ? f.color + '44' : 'var(--border)'}`,
                boxShadow: hovered === i ? `0 0 24px ${f.color}22` : 'none',
              }}
            >
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: f.color }}>{f.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-24">
        <div className="max-w-2xl mx-auto text-center p-10 rounded-3xl"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <div className="text-4xl mb-4">🧠</div>
          <h2 className="text-2xl font-bold mb-3">Zacznij dziś. To nic nie kosztuje.</h2>
          <p className="mb-8" style={{ color: 'var(--text-muted)' }}>
            Nie czekaj aż będzie "odpowiedni moment". Twoje zdrowie psychiczne jest ważne teraz.
          </p>
          <button className="px-8 py-4 rounded-2xl text-base font-semibold transition-all hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #7C3AED, #5EEAD4)', color: '#fff' }}>
            Zacznij bezpłatnie →
          </button>
          <p className="text-xs mt-4" style={{ color: 'var(--text-muted)' }}>
            ⚠️ Psychika to wsparcie AI, nie zastępuje psychologa ani psychiatry.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-8 text-sm border-t" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
        <p>Psychika © 2026 · Zbudowane przez <strong style={{ color: 'var(--primary)' }}>@PawelZhenchak</strong></p>
        <p className="mt-1">Telefon Zaufania: <strong>116 123</strong> · Dostępny całą dobę</p>
      </footer>
    </main>
  );
}
