'use client';

import { useSettings } from '@/hooks/useSettings';
import { useUserPlan } from '@/hooks/useUserPlan';
import { useClerk, useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

type Row<T extends string> = { value: T; label: string; emoji?: string };

function OptionGroup<T extends string>({
  label, options, value, onChange,
}: { label: string; options: Row<T>[]; value: T; onChange: (v: T) => void }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider mb-3"
        style={{ color: 'var(--text-muted)' }}>{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map(o => (
          <button key={o.value} onClick={() => onChange(o.value)}
            className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
            style={{
              background: value === o.value ? 'var(--primary-soft)' : 'var(--bg-card2)',
              color: value === o.value ? '#fff' : 'var(--text-muted)',
              border: value === o.value ? '1px solid var(--primary)' : '1px solid var(--border)',
            }}>
            {o.emoji} {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function Toggle({ label, desc, value, onChange }: {
  label: string; desc?: string; value: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{label}</p>
        {desc && <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{desc}</p>}
      </div>
      <button
        onClick={() => onChange(!value)}
        className="w-12 h-6 rounded-full relative transition-all shrink-0"
        style={{ background: value ? 'var(--primary-soft)' : 'var(--border)' }}>
        <span className="absolute top-1 w-4 h-4 rounded-full bg-white transition-all"
          style={{ left: value ? '28px' : '4px' }} />
      </button>
    </div>
  );
}

export default function SettingsPage() {
  const { settings, update } = useSettings();
  const { plan, loading: planLoading } = useUserPlan();
  const { signOut } = useClerk();
  const { user } = useUser();
  const router = useRouter();

  const planColors = { free: '#5EEAD4', premium: '#A78BFA', pro: '#F9A8D4' };
  const planColor = planColors[plan];

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="px-6 py-5 border-b shrink-0" style={{ borderColor: 'var(--border)' }}>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>⚙️ Ustawienia</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Dostosuj aplikację do siebie</p>
      </div>

      <div className="flex-1 px-6 py-6 max-w-xl mx-auto w-full flex flex-col gap-6">

        {/* Account */}
        <div className="p-5 rounded-2xl flex flex-col gap-4"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <p className="font-semibold" style={{ color: 'var(--text)' }}>👤 Konto</p>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold"
              style={{ background: 'var(--primary-soft)', color: '#fff' }}>
              {user?.firstName?.[0] || user?.emailAddresses?.[0]?.emailAddress?.[0]?.toUpperCase() || '?'}
            </div>
            <div>
              <p className="font-medium text-sm" style={{ color: 'var(--text)' }}>
                {user?.firstName || 'Użytkownik'}
              </p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {user?.emailAddresses?.[0]?.emailAddress}
              </p>
            </div>
            <span className="ml-auto text-xs px-3 py-1 rounded-full font-semibold"
              style={{ background: planColor + '22', color: planColor }}>
              {planLoading ? '...' : plan.toUpperCase()}
            </span>
          </div>
          {plan === 'free' && (
            <button onClick={() => router.push('/pricing')}
              className="w-full py-2.5 rounded-xl text-sm font-semibold"
              style={{ background: 'linear-gradient(135deg, #7C3AED, #0D9488)', color: '#fff' }}>
              ⭐ Upgrade do Premium
            </button>
          )}
        </div>

        {/* Appearance */}
        <div className="p-5 rounded-2xl flex flex-col gap-5"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <p className="font-semibold" style={{ color: 'var(--text)' }}>🎨 Wygląd</p>

          <OptionGroup label="Motyw"
            options={[
              { value: 'dark', label: 'Ciemny', emoji: '🌙' },
              { value: 'light', label: 'Jasny', emoji: '☀️' },
              { value: 'system', label: 'Systemowy', emoji: '⚙️' },
            ]}
            value={settings.theme}
            onChange={v => update({ theme: v })}
          />

          <OptionGroup label="Kolor akcentu"
            options={[
              { value: 'purple', label: 'Lila', emoji: '💜' },
              { value: 'teal', label: 'Miętowy', emoji: '🩵' },
              { value: 'pink', label: 'Różowy', emoji: '🩷' },
              { value: 'blue', label: 'Niebieski', emoji: '💙' },
            ]}
            value={settings.accent}
            onChange={v => update({ accent: v })}
          />
        </div>

        {/* Language */}
        <div className="p-5 rounded-2xl flex flex-col gap-5"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <p className="font-semibold" style={{ color: 'var(--text)' }}>🌍 Język</p>

          <OptionGroup label="Język aplikacji"
            options={[
              { value: 'pl', label: 'Polski', emoji: '🇵🇱' },
              { value: 'en', label: 'English', emoji: '🇬🇧' },
            ]}
            value={settings.language}
            onChange={v => update({ language: v })}
          />
        </div>

        {/* AI Settings */}
        <div className="p-5 rounded-2xl flex flex-col gap-5"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <p className="font-semibold" style={{ color: 'var(--text)' }}>🤖 Chat AI</p>

          <OptionGroup label="Styl odpowiedzi"
            options={[
              { value: 'short', label: 'Krótki' },
              { value: 'normal', label: 'Normalny' },
              { value: 'detailed', label: 'Szczegółowy' },
            ]}
            value={settings.aiStyle}
            onChange={v => update({ aiStyle: v })}
          />

          <OptionGroup label="Język AI"
            options={[
              { value: 'pl', label: 'Polski', emoji: '🇵🇱' },
              { value: 'en', label: 'English', emoji: '🇬🇧' },
            ]}
            value={settings.aiLanguage}
            onChange={v => update({ aiLanguage: v })}
          />
        </div>

        {/* Notifications */}
        <div className="p-5 rounded-2xl flex flex-col gap-4"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <p className="font-semibold" style={{ color: 'var(--text)' }}>🔔 Powiadomienia</p>
          <Toggle
            label="Codzienne przypomnienie"
            desc="Przypomnienie o sprawdzeniu nastroju każdego wieczoru"
            value={settings.moodReminder}
            onChange={v => update({ moodReminder: v })}
          />
        </div>

        {/* Logout */}
        <button
          onClick={() => signOut(() => router.push('/'))}
          className="w-full py-3 rounded-2xl text-sm font-medium transition-all"
          style={{ background: 'var(--bg-card)', border: '1px solid #F8717144', color: '#F87171' }}>
          🚪 Wyloguj się
        </button>

        <p className="text-xs text-center pb-4" style={{ color: 'var(--text-muted)' }}>
          Psychika v1.0 · Made by @PawelZhenchak
        </p>
      </div>
    </div>
  );
}
