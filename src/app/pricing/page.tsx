'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: '0 zł',
    period: 'na zawsze',
    color: '#5EEAD4',
    features: [
      '10 wiadomości dziennie',
      'Mood tracker',
      'Ćwiczenia oddechowe',
      'Tryb SOS',
      'Dziennik (5 wpisów)',
    ],
    cta: 'Zacznij za darmo',
    highlight: false,
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '19 zł',
    period: 'miesięcznie',
    color: '#A78BFA',
    features: [
      'Nielimitowany chat AI',
      'Mood tracker + wykresy',
      'Dziennik z AI (nielimitowany)',
      'Wszystkie ćwiczenia',
      'Historia rozmów',
      'Brak reklam',
    ],
    cta: 'Wybierz Premium',
    highlight: true,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '39 zł',
    period: 'miesięcznie',
    color: '#F9A8D4',
    features: [
      'Wszystko z Premium',
      'Raporty nastrojów (PDF)',
      'Eksport do psychologa',
      'Priorytetowe AI',
      'Wczesny dostęp do nowości',
      'Wsparcie priorytetowe',
    ],
    cta: 'Wybierz Pro',
    highlight: false,
  },
];

export default function PricingPage() {
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);

  const handleCheckout = async (planId: string) => {
    if (planId === 'free') { router.push('/app/chat'); return; }
    if (!isSignedIn) { router.push('/login'); return; }

    setLoading(planId);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planId }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else alert('Błąd: ' + (data.error || 'Spróbuj ponownie'));
    } catch {
      alert('Błąd połączenia');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen py-16 px-6" style={{ background: 'var(--bg-base)' }}>
      <div className="max-w-5xl mx-auto">

        {/* Back */}
        <Link href="/" className="inline-flex items-center gap-2 text-sm mb-10"
          style={{ color: 'var(--text-muted)' }}>
          ← Wróć
        </Link>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-3xl">🧠</span>
            <span className="text-2xl font-bold gradient-text">Psychika</span>
          </div>
          <h1 className="text-4xl font-bold mb-3" style={{ color: 'var(--text)' }}>Wybierz swój plan</h1>
          <p style={{ color: 'var(--text-muted)' }}>Zacznij za darmo. Upgrade kiedy chcesz. Anuluj w dowolnym momencie.</p>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          {plans.map((plan) => (
            <div key={plan.id}
              className="p-6 rounded-2xl flex flex-col relative"
              style={{
                background: plan.highlight ? 'linear-gradient(160deg, #1e1040, #1a1030)' : 'var(--bg-card)',
                border: `1px solid ${plan.highlight ? plan.color + '66' : 'var(--border)'}`,
                boxShadow: plan.highlight ? `0 0 32px ${plan.color}22` : 'none',
              }}>
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold px-3 py-1 rounded-full"
                  style={{ background: plan.color, color: '#111' }}>
                  NAJPOPULARNIEJSZY
                </div>
              )}

              <h3 className="text-lg font-bold mb-1" style={{ color: plan.color }}>{plan.name}</h3>
              <div className="flex items-end gap-1 mb-1">
                <span className="text-4xl font-bold" style={{ color: 'var(--text)' }}>{plan.price}</span>
              </div>
              <p className="text-xs mb-6" style={{ color: 'var(--text-muted)' }}>{plan.period}</p>

              <ul className="flex flex-col gap-3 flex-1 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm" style={{ color: 'var(--text)' }}>
                    <span style={{ color: plan.color }}>✓</span> {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleCheckout(plan.id)}
                disabled={loading === plan.id}
                className="w-full py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
                style={{
                  background: plan.highlight ? 'linear-gradient(135deg, #7C3AED, #0D9488)' : 'var(--bg-card2)',
                  color: plan.highlight ? '#fff' : 'var(--text)',
                  border: plan.highlight ? 'none' : '1px solid var(--border)',
                  opacity: loading === plan.id ? 0.5 : 1,
                  pointerEvents: loading === plan.id ? 'none' : 'auto',
                  cursor: loading === plan.id ? 'not-allowed' : 'pointer',
                }}>
                {loading === plan.id ? 'Przekierowywanie...' : plan.cta}
              </button>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="max-w-xl mx-auto text-sm" style={{ color: 'var(--text-muted)' }}>
          <p className="text-center mb-4 font-semibold" style={{ color: 'var(--text)' }}>Często zadawane pytania</p>
          <div className="flex flex-col gap-3">
            {[
              ['Czy mogę anulować w dowolnym momencie?', 'Tak. Anulujesz w ustawieniach konta — bez opłat.'],
              ['Czy dane są bezpieczne?', 'Tak. Dane są zaszyfrowane, nigdy nie sprzedajemy ich osobom trzecim.'],
              ['Czy Free jest naprawdę za darmo?', 'Tak, na zawsze. Nie wymagamy karty kredytowej.'],
            ].map(([q, a]) => (
              <div key={q} className="p-4 rounded-xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <p className="font-medium mb-1" style={{ color: 'var(--text)' }}>{q}</p>
                <p>{a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
