import Link from 'next/link';

export default function SOSPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 px-6">
      <span className="text-5xl">🆘</span>
      <h1 className="text-2xl font-bold" style={{ color: 'var(--danger)' }}>Potrzebujesz pomocy?</h1>
      <p className="text-center max-w-sm" style={{ color: 'var(--text-muted)' }}>
        Jeśli czujesz się w kryzysie, zadzwoń na Telefon Zaufania. Ktoś zawsze Cię wysłucha.
      </p>
      <a
        href="tel:116123"
        className="px-8 py-4 rounded-2xl text-lg font-bold transition-all hover:scale-105"
        style={{ background: 'var(--danger)', color: '#fff' }}
      >
        📞 Zadzwoń: 116 123
      </a>
      <p className="text-xs text-center max-w-xs" style={{ color: 'var(--text-muted)' }}>
        Dostępny 24/7, anonimowy i bezpłatny
      </p>
      <Link
        href="/app/chat"
        className="text-sm underline"
        style={{ color: 'var(--primary)' }}
      >
        Lub porozmawiaj z Psyche AI
      </Link>
    </div>
  );
}
