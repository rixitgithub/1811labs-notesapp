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
      <head>
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180" />
        <link id="favicon" rel="icon" href="/icon-dark.png" type="image/png" sizes="192x192" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                function updateFavicon() {
                  const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  const favicon = document.getElementById('favicon');
                  if (favicon) {
                    favicon.href = isDarkMode ? '/icon-light.png' : '/icon-dark.png';
                  }
                }
                updateFavicon();
                window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', updateFavicon);
              })();
            `,
          }}
        />
      </head>
      <body className="bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen">
        <Providers>
          <ThemeHeader />
          <main className="container mx-auto px-4 py-6">{children}</main>
        </Providers>
      </body>
    </html>
  );
}