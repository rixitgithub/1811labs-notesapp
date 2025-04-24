'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function useThemeWithStorage() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync theme with local storage on change
  useEffect(() => {
    if (mounted) {
      try {
        localStorage.setItem('theme', theme || 'system');
        console.log('Theme saved to localStorage:', theme);
      } catch (e) {
        console.warn('Failed to save theme to localStorage:', e);
      }
    }
  }, [theme, mounted]);

  // Load theme from local storage on mount
  useEffect(() => {
    if (mounted) {
      try {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme && savedTheme !== theme) {
          setTheme(savedTheme);
          console.log('Theme loaded from localStorage:', savedTheme);
        }
      } catch (e) {
        console.warn('Failed to load theme from localStorage:', e);
      }
    }
  }, [mounted, setTheme]);

  return { theme, setTheme, resolvedTheme, mounted };
}