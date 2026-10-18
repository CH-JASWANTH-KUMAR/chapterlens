import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ThemeProvider } from '../context/ThemeContext';

export const viewport: Viewport = {
  themeColor: '#193d2d',
};

export const metadata: Metadata = {
  metadataBase: new URL('https://chapterlens-five.vercel.app'),
  title: 'ChapterLens | Research Paper Clarity and Readability',
  description:
    'Analyze research-paper readability, find difficult passages, and explore contextual explanations. Documents are processed in your browser, and external AI requests require explicit consent.',
  applicationName: 'ChapterLens',
  keywords: [
    'research paper readability',
    'Flesch Reading Ease',
    'academic clarity',
    'scholarly reading',
    'sentence complexity',
    'guided research reading',
    'document analysis',
    'in-browser analysis',
  ],
  authors: [{ name: 'ChapterLens Studio' }],
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://chapterlens-five.vercel.app',
  },
  icons: {
    icon: [
      { url: '/brand-assets/chapterlens-logo-mark.png' },
      { url: '/favicon.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/brand-assets/chapterlens-logo-mark.png' },
    ],
  },
  openGraph: {
    title: 'ChapterLens | Research Paper Clarity and Readability',
    description:
      'Analyze research-paper readability, find difficult passages, and explore contextual explanations. Documents are processed in your browser, and external AI requests require explicit consent.',
    url: 'https://chapterlens-five.vercel.app',
    siteName: 'ChapterLens',
    type: 'website',
    images: [
      {
        url: '/brand-assets/chapterlens-og-image.png',
        width: 1200,
        height: 630,
        alt: 'ChapterLens - Research Paper Clarity and Readability Studio',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ChapterLens | Research Paper Clarity and Readability',
    description:
      'Analyze research-paper readability, find difficult passages, and explore contextual explanations. Documents are processed in your browser, and external AI requests require explicit consent.',
    images: ['/brand-assets/chapterlens-og-image.png'],
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
