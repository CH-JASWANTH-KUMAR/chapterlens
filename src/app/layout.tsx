import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ChapterLens — Understand your writing. Keep your voice.',
  description:
    'A production-grade editorial readability studio for authors. Calculate exact Flesch Reading Ease scores, isolate your chapter’s five hardest sentences, and inspect transparent linguistic signals entirely inside your browser.',
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
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[#FBFBF9] text-[#1C1E1D] antialiased selection:bg-[#DDE8E0] selection:text-[#122B20]">
        {children}
      </body>
    </html>
  );
}
