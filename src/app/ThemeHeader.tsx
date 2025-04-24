// app/ThemeHeader.tsx
'use client';

import { useThemeWithStorage } from '@/hooks/useThemeWithStorage';

export default function ThemeHeader() {
  const { resolvedTheme, mounted } = useThemeWithStorage();

  if (!mounted) {
    return (
      <header className="flex justify-center py-6">
        <div className="max-w-[50px] w-full h-4" />
      </header>
    );
  }

  const logoSrc = resolvedTheme === 'dark' ? '/logo-dark.png' : '/logo-light.png';

  return (
    <header className="flex justify-center py-4">
      <img
        src={logoSrc}
        alt="AI Notes App Logo"
        className="max-w-[92px] w-full h-auto object-contain"
      />
    </header>
  );
}