'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton, useUser } from '@clerk/nextjs';

const navItems = [
  { href: '/app/chat', icon: '💬', label: 'Chat' },
  { href: '/app/mood', icon: '📊', label: 'Nastrój' },
  { href: '/app/exercises', icon: '🌬️', label: 'Ćwiczenia' },
  { href: '/app/journal', icon: '📓', label: 'Dziennik' },
  { href: '/app/sos', icon: '🆘', label: 'SOS' },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useUser();

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
        <nav className="flex flex-col gap-1 flex-1">
          {navItems.map((item) => {
            const active = pathname.startsWith(item.href);
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

        {/* Bottom user area */}
        <div className="border-t pt-4 mt-4 px-2" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-3">
            <UserButton />
            <div>
              <p className="text-sm font-medium truncate max-w-[140px]" style={{ color: 'var(--text)' }}>
                {user?.firstName || user?.emailAddresses?.[0]?.emailAddress || 'Użytkownik'}
              </p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Plan Free</p>
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
