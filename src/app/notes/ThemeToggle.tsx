// components/ThemeToggle.tsx
'use client';

import { useThemeWithStorage } from '@/hooks/useThemeWithStorage';
import { Button } from '@/components/ui/button';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const { theme, setTheme, resolvedTheme, mounted } = useThemeWithStorage();

  if (!mounted) return null;

  const isDark = resolvedTheme === 'dark';

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
      className="transition-colors"
    >
      {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </Button>
  );
}