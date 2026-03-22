'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/app/chat', icon: '💬', label: 'Chat' },
  { href: '/app/mood', icon: '📊', label: 'Nastrój' },
  { href: '/app/exercises', icon: '🌬️', label: 'Ćwiczenia' },
  { href: '/app/journal', icon: '📓', label: 'Dziennik' },
  { href: '/app/sos', icon: '🆘', label: 'SOS' },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-base)' }}>
      {/* Sidebar */}
      <aside className="flex flex-col w-64 border-r py-6 px-4 shrink-0"
        style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>

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
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
              style={{ background: 'var(--primary-soft)', color: '#fff' }}>P</div>
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>Użytkownik</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Plan Free</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  );
}
