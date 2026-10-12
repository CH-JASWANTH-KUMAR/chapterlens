import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '../context/ThemeContext';

export const metadata: Metadata = {
  title: 'ChapterLens — Understand your writing. Keep your voice.',
  description:
    'A production-grade editorial readability studio for authors. Calculate exact Flesch Reading Ease scores, isolate your chapter’s hardest sentences, and inspect transparent linguistic signals entirely inside your browser.',
  keywords: [
    'readability score',
    'Flesch Reading Ease',
    'author tools',
    'editing software',
    'sentence complexity',
    'chapter analysis',
    'fiction writing tool',
  ],
  authors: [{ name: 'ChapterLens Studio' }],
  robots: 'index, follow',
  openGraph: {
    title: 'ChapterLens — Editorial Readability Studio',
    description:
      'Understand your writing. Keep your voice. Instant, private chapter readability analysis with transparent linguistic diagnostics.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <meta name="color-scheme" content="light" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        {/* Anti-FOUC Theme Initializer: Light mode is default for all new visitors */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function() {
              try {
                var stored = localStorage.getItem('chapterlens-theme');
                if (stored === 'dark') {
                  document.documentElement.classList.add('dark');
                  var meta = document.querySelector('meta[name="color-scheme"]');
                  if (meta) meta.setAttribute('content', 'dark');
                } else {
                  document.documentElement.classList.remove('dark');
                  var meta = document.querySelector('meta[name="color-scheme"]');
                  if (meta) meta.setAttribute('content', 'light');
                }
              } catch (e) {}
            })();`,
          }}
        />
      </head>
      <body className="min-h-screen bg-[var(--canvas-bg)] text-[var(--text-main)] antialiased selection:bg-[var(--selection-bg)] selection:text-[var(--selection-text)] transition-colors duration-200">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
