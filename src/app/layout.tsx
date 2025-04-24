import { Providers } from './Providers';
import './globals.css';
import ThemeHeader from './ThemeHeader';

export const metadata = {
  title: '1811 Labs - Notes Summarizer',
  description: 'A mini AI-powered notes app with Gemini API',
  icons: {
    icon: [
      { url: '/icon-dark.png', type: 'image/png', sizes: '192x192', media: '(prefers-color-scheme: light)' },
      { url: '/icon-light.png', type: 'image/png', sizes: '192x192', media: '(prefers-color-scheme: dark)' },
    ],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen">
        <Providers>
          <ThemeHeader />
          <main className="container mx-auto px-4 py-6">{children}</main>
        </Providers>
      </body>
    </html>
  );
}