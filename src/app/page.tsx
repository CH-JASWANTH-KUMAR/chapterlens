'use client';

import React, { useState } from 'react';
import { Header } from '../components/Header';
import { Workspace } from '../components/Workspace';
import { Footer } from '../components/Footer';

export default function Home() {
  const [hasAnalysis, setHasAnalysis] = useState(false);

  const handleFocusEditor = () => {
    const textarea = document.getElementById('chapter-text-input');
    if (textarea) {
      textarea.scrollIntoView({ behavior: 'smooth', block: 'center' });
      textarea.focus();
    }
  };

  const handleNewAnalysis = () => {
    const editor = document.getElementById('editor-workspace');
    if (editor) {
      editor.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#FBFBF9] text-[#1C1E1D]">
      <Header
        onNewAnalysis={handleNewAnalysis}
        onFocusEditor={handleFocusEditor}
        hasAnalysis={hasAnalysis}
      />
      <div className="flex-1">
        <Workspace onAnalysisStateChange={setHasAnalysis} />
      </div>
      <Footer />
    </div>
  );
}
