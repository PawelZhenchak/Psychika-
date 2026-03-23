'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton, useUser } from '@clerk/nextjs';
import { useUserPlan } from '@/hooks/useUserPlan';

interface Conversation {
  id: string;
  title: string;
  updated_at: string;
}

const navItems = [
  { href: '/app/chat', icon: '💬', label: 'Chat' },
  { href: '/app/mood', icon: '📊', label: 'Nastrój' },
  { href: '/app/exercises', icon: '🌬️', label: 'Ćwiczenia' },
  { href: '/app/journal', icon: '📓', label: 'Dziennik' },
  { href: '/app/sos', icon: '🆘', label: 'SOS' },
  { href: '/app/settings', icon: '⚙️', label: 'Ustawienia' },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useUser();
  const { plan, isPremium } = useUserPlan();
  const planColors: Record<string, string> = { free: '#5EEAD4', premium: '#A78BFA', pro: '#F9A8D4' };

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [historyOpen, setHistoryOpen] = useState(true);

  // Fetch chat history for Premium users
  useEffect(() => {
    if (!isPremium) return;
    fetch('/api/conversations')
      .then((r) => r.json())
      .then((d) => setConversations(d.conversations || []))
      .catch(() => {});
  }, [isPremium, pathname]); // refetch when navigating

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString('pl', { day: 'numeric', month: 'short' });

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-base)' }}>
      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 border-b"
        style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl">🧠</span>
          <span className="text-lg font-bold gradient-text">Psychika</span>
        </Link>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="w-10 h-10 flex items-center justify-center rounded-xl"
          style={{ color: 'var(--text)' }}
        >
          {sidebarOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:static z-50 md:z-auto
          top-0 left-0 h-full w-64
          flex flex-col border-r py-6 px-4 shrink-0
          transition-transform duration-200
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
        `}
        style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 mb-8 px-2">
          <span className="text-2xl">🧠</span>
          <span className="text-xl font-bold gradient-text">Psychika</span>
        </Link>

        {/* Nav */}
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const active = pathname === item.href || (item.href !== '/app/chat' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all"
                style={{
                  background: active ? 'var(--bg-card2)' : 'transparent',
                  color: active ? 'var(--primary)' : 'var(--text-muted)',
                  borderLeft: active ? '3px solid var(--primary)' : '3px solid transparent',
                }}
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Chat History */}
        <div className="flex-1 overflow-hidden flex flex-col mt-4">
          {isPremium ? (
            <>
              <button
                onClick={() => setHistoryOpen(!historyOpen)}
                className="flex items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-wider"
                style={{ color: 'var(--text-muted)' }}
              >
                <span>📜 Historia</span>
                <span>{historyOpen ? '▾' : '▸'}</span>
              </button>

              {historyOpen && (
                <div className="flex-1 overflow-y-auto flex flex-col gap-0.5 px-1">
                  <Link href="/app/chat"
                    onClick={() => setSidebarOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all"
                    style={{ color: 'var(--primary)', background: 'transparent' }}>
                    + Nowa rozmowa
                  </Link>

                  {conversations.map((c) => {
                    const isActive = pathname === '/app/chat' && typeof window !== 'undefined' &&
                      new URLSearchParams(window.location.search).get('id') === c.id;
                    return (
                      <Link
                        key={c.id}
                        href={`/app/chat?id=${c.id}`}
                        onClick={() => setSidebarOpen(false)}
                        className="px-3 py-2 rounded-lg text-xs transition-all truncate block"
                        style={{
                          color: isActive ? 'var(--text)' : 'var(--text-muted)',
                          background: isActive ? 'var(--bg-card2)' : 'transparent',
                        }}
                        title={c.title}
                      >
                        {c.title}
                        <span className="block text-[10px] mt-0.5 opacity-60">{fmtDate(c.updated_at)}</span>
                      </Link>
                    );
                  })}

                  {conversations.length === 0 && (
                    <p className="px-3 py-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                      Brak rozmów
                    </p>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="px-3 py-3 mt-2 rounded-xl text-center"
              style={{ background: 'var(--bg-card2)', border: '1px solid var(--border)' }}>
              <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>🔒 Historia czatów</p>
              <Link href="/pricing" className="text-xs font-semibold" style={{ color: 'var(--primary)' }}>
                Dostępna w Premium →
              </Link>
            </div>
          )}
        </div>

        {/* Bottom user area */}
        <div className="border-t pt-4 mt-4 px-2" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-3">
            <UserButton />
            <div>
              <p className="text-sm font-medium truncate max-w-[140px]" style={{ color: 'var(--text)' }}>
                {user?.firstName || user?.emailAddresses?.[0]?.emailAddress || 'Użytkownik'}
              </p>
              <p className="text-xs font-medium" style={{ color: planColors[plan] || 'var(--text-muted)' }}>
                Plan {plan.charAt(0).toUpperCase() + plan.slice(1)}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-hidden pt-14 md:pt-0">
        {children}
      </main>
    </div>
  );
}
