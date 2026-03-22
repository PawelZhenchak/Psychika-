'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Props {
  onClose: () => void;
}

export default function UpgradeModal({ onClose }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const checkout = async (plan: 'premium' | 'pro') => {
    setLoading(plan);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {
      alert('Błąd połączenia');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
      <div className="w-full max-w-md rounded-3xl p-8 relative"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>

        {/* Close */}
        <button onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-sm"
          style={{ background: 'var(--bg-card2)', color: 'var(--text-muted)' }}>
          ✕
        </button>

        <div className="text-center mb-6">
          <p className="text-3xl mb-2">🔒</p>
          <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--text)' }}>
            Wykorzystałeś dzienny limit
          </h2>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Plan Free: 10 wiadomości dziennie. Upgrade aby pisać bez limitu.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <button onClick={() => checkout('premium')}
            disabled={loading === 'premium'}
            className="w-full py-4 rounded-2xl font-semibold transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #7C3AED, #0D9488)', color: '#fff' }}>
            {loading === 'premium' ? 'Przekierowywanie...' : '⭐ Premium — 19 zł/mies'}
          </button>

          <button onClick={() => checkout('pro')}
            disabled={loading === 'pro'}
            className="w-full py-3 rounded-2xl text-sm font-medium transition-all"
            style={{ background: 'var(--bg-card2)', border: '1px solid var(--border)', color: 'var(--text)' }}>
            {loading === 'pro' ? 'Przekierowywanie...' : '🚀 Pro — 39 zł/mies'}
          </button>

          <button onClick={() => router.push('/pricing')}
            className="text-xs text-center py-2"
            style={{ color: 'var(--text-muted)' }}>
            Zobacz pełne porównanie planów →
          </button>

          <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
            Limit resetuje się o północy. Jutro dostaniesz kolejne 10 wiadomości za darmo.
          </p>
        </div>
      </div>
    </div>
  );
}
