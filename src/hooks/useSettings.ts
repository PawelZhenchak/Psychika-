import { useState, useEffect } from 'react';

export interface AppSettings {
  theme: 'dark' | 'light' | 'system';
  accent: 'purple' | 'teal' | 'pink' | 'blue';
  language: 'pl' | 'en';
  aiStyle: 'short' | 'normal' | 'detailed';
  aiLanguage: 'pl' | 'en';
  moodReminder: boolean;
}

const DEFAULTS: AppSettings = {
  theme: 'dark',
  accent: 'purple',
  language: 'pl',
  aiStyle: 'normal',
  aiLanguage: 'pl',
  moodReminder: false,
};

const KEY = 'psychika_settings';

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULTS);

  useEffect(() => {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      try { setSettings({ ...DEFAULTS, ...JSON.parse(raw) }); } catch { /* ignore */ }
    }
  }, []);

  const update = (patch: Partial<AppSettings>) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    localStorage.setItem(KEY, JSON.stringify(next));
    // Apply theme immediately
    if (patch.theme) applyTheme(patch.theme);
    if (patch.accent) applyAccent(patch.accent);
  };

  return { settings, update };
}

export function applyTheme(theme: AppSettings['theme']) {
  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.style.setProperty('--bg-base', isDark ? '#0F0A1E' : '#F8F7FF');
  document.documentElement.style.setProperty('--bg-card', isDark ? '#1A1030' : '#FFFFFF');
  document.documentElement.style.setProperty('--bg-card2', isDark ? '#221540' : '#F0EEFF');
  document.documentElement.style.setProperty('--text', isDark ? '#F1F0FF' : '#1F1535');
  document.documentElement.style.setProperty('--text-muted', isDark ? '#8B7FB8' : '#6B5F8A');
  document.documentElement.style.setProperty('--border', isDark ? '#2D1F4E' : '#DDD6FE');
}

const ACCENTS: Record<AppSettings['accent'], [string, string]> = {
  purple: ['#A78BFA', '#7C3AED'],
  teal:   ['#5EEAD4', '#0D9488'],
  pink:   ['#F9A8D4', '#BE185D'],
  blue:   ['#60A5FA', '#2563EB'],
};

export function applyAccent(accent: AppSettings['accent']) {
  const [light, dark] = ACCENTS[accent];
  document.documentElement.style.setProperty('--primary', light);
  document.documentElement.style.setProperty('--primary-soft', dark);
}
