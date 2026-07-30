import { useEffect, useState } from 'react';

function getStorage(key: string, fallback: string): string {
  try {
    const v = localStorage.getItem(key);
    return v || fallback;
  } catch {
    return fallback;
  }
}

function setStorage(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // storage unavailable
  }
}

export function useTheme() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const storedLock = getStorage('themeLock', 'auto');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    let active: 'light' | 'dark';
    if (storedLock === 'light') active = 'light';
    else if (storedLock === 'dark') active = 'dark';
    else active = prefersDark ? 'dark' : 'light';
    setTheme(active);
    document.documentElement.classList.toggle('dark', active === 'dark');
  }, []);

  const setThemeLock = (lock: 'auto' | 'light' | 'dark') => {
    setStorage('themeLock', lock);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    let active: 'light' | 'dark';
    if (lock === 'light') active = 'light';
    else if (lock === 'dark') active = 'dark';
    else active = prefersDark ? 'dark' : 'light';
    setTheme(active);
    document.documentElement.classList.toggle('dark', active === 'dark');
  };

  if (!mounted) {
    return { theme: 'light' as const, themeLock: 'auto' as const, setThemeLock: (_lock: 'auto' | 'light' | 'dark') => {} };
  }

  const currentLock = getStorage('themeLock', 'auto') as 'auto' | 'light' | 'dark';
  return { theme, themeLock: currentLock, setThemeLock };
}