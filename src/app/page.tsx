'use client';

import React, { useState } from 'react';
import { Header } from '../components/Header';
import { Hero } from '../components/Hero';
import { Workspace } from '../components/Workspace';
import { Footer } from '../components/Footer';

export default function Home() {
  const [hasAnalysis, setHasAnalysis] = useState(false);

  const handleFocusEditor = () => {
    const editor = document.getElementById('editor-workspace');
    if (editor) {
      editor.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    const textarea = document.getElementById('chapter-text-input');
    textarea?.focus();
  };

  const handleNewAnalysis = () => {
    const editor = document.getElementById('editor-workspace');
    if (editor) {
      editor.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    const textarea = document.getElementById('chapter-text-input');
    textarea?.focus();
  };

  return (
    <div className="flex min-h-screen flex-col bg-[var(--canvas-bg)] text-[var(--text-main)] transition-colors duration-200">
      <Header
        onNewAnalysis={handleNewAnalysis}
        onFocusEditor={handleFocusEditor}
        hasAnalysis={hasAnalysis}
      />
      
      {/* Editorial Hero Banner */}
      <Hero onScrollToEditor={handleFocusEditor} />

      {/* Main Analysis Workspace */}
      <div className="flex-1">
        <Workspace onAnalysisStateChange={setHasAnalysis} />
      </div>

      {/* Studio Footer */}
      <Footer />
    </div>
  );
}
