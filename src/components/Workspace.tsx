'use client';

import React, { useState, useRef } from 'react';
import { Editor } from './Editor';
import { ScoreCard } from './ScoreCard';
import { InlineHighlightedText } from './InlineHighlightedText';
import { HardestSentencesList } from './HardestSentencesList';
import { EducationalSection } from './EducationalSection';
import { RewriteModal } from './RewriteModal';
import { analyzeChapter } from '../lib/linguistics/analyzer';
import { AnalysisResult, DifficultSentence } from '../lib/linguistics/types';
import { RotateCcw } from 'lucide-react';

interface WorkspaceProps {
  onAnalysisStateChange?: (hasAnalysis: boolean) => void;
}

export function Workspace({ onAnalysisStateChange }: WorkspaceProps) {
  const [text, setText] = useState<string>('');
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedSentenceId, setSelectedSentenceId] = useState<string | null>(null);
  const [rewriteSentence, setRewriteSentence] = useState<DifficultSentence | null>(null);

  const editorSectionRef = useRef<HTMLDivElement>(null);
  const analysisSectionRef = useRef<HTMLDivElement>(null);

  const handleAnalyze = () => {
    if (!text.trim()) return;
    setIsAnalyzing(true);

    try {
      const result = analyzeChapter(text);
      setAnalysis(result);
      if (result.difficultSentences.length > 0) {
        setSelectedSentenceId(result.difficultSentences[0].id);
      }
      onAnalysisStateChange?.(true);

      // Smooth scroll to results
      setTimeout(() => {
        analysisSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    } catch (err) {
      console.error('Analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleClear = () => {
    setText('');
    setAnalysis(null);
    setSelectedSentenceId(null);
    onAnalysisStateChange?.(false);
  };

  const handleNewAnalysis = () => {
    setAnalysis(null);
    setSelectedSentenceId(null);
    onAnalysisStateChange?.(false);
    setTimeout(() => {
      editorSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  const handleSelectSentence = (sentence: DifficultSentence) => {
    setSelectedSentenceId(sentence.id);
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-12">
      {/* Editor Section */}
      <div ref={editorSectionRef} id="editor-workspace">
        <Editor
          text={text}
          onChangeText={setText}
          onAnalyze={handleAnalyze}
          isAnalyzing={isAnalyzing}
          onClear={handleClear}
        />
      </div>

      {/* Analysis Results Section */}
      {analysis && (
        <section
          ref={analysisSectionRef}
          id="analysis-results"
          aria-label="Chapter Readability Results"
          className="space-y-10 animate-in fade-in duration-300"
        >
          {/* Action & Quick Navigation Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-4">
            <button
              onClick={handleNewAnalysis}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border-strong)] bg-[var(--canvas-card)] px-3 py-1.5 text-xs font-semibold text-[var(--text-main)] shadow-editorial-sm hover:bg-[var(--canvas-card-hover)] hover:border-[var(--brand-emerald)] focus-visible:outline-2 focus-visible:outline-[var(--brand-emerald)] transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5 text-[var(--brand-emerald)]" />
              <span>Reset / Edit Chapter</span>
            </button>

            {/* Quick in-page anchor links */}
            <div className="flex items-center gap-2.5 text-xs text-[var(--text-faint)] font-editorial-mono">
              <a
                href="#manuscript-section"
                className="hover:text-[var(--text-main)] transition-colors"
              >
                ↓ Manuscript Inspector
              </a>
              <span>•</span>
              <a
                href="#difficult-sentences-section"
                className="hover:text-[var(--text-main)] transition-colors"
              >
                ↓ Difficult Sentences ({analysis.difficultSentences.length})
              </a>
            </div>
          </div>

          {/* A. Readability Summary & Chapter Statistics */}
          <div id="readability-summary-section">
            <ScoreCard analysis={analysis} />
          </div>

          {/* B. Full-Width Manuscript Inspector */}
          <div id="manuscript-section" className="w-full">
            <InlineHighlightedText
              originalText={text}
              difficultSentences={analysis.difficultSentences}
              selectedSentenceId={selectedSentenceId}
              onSelectSentence={handleSelectSentence}
            />
          </div>

          {/* C. Difficult Sentences Responsive Horizontal Card Grid */}
          <div id="difficult-sentences-section" className="w-full">
            <HardestSentencesList
              sentences={analysis.difficultSentences}
              totalSentencesInText={analysis.totalSentences}
              selectedSentenceId={selectedSentenceId}
              onSelectSentence={handleSelectSentence}
              onOpenRewrite={(s) => setRewriteSentence(s)}
            />
          </div>
        </section>
      )}

      {/* Educational & Craft Insights Section */}
      <div className="pt-6">
        <EducationalSection />
      </div>

      {/* Optional Rewrite & Craft Modal */}
      {rewriteSentence && (
        <RewriteModal
          sentence={rewriteSentence}
          onClose={() => setRewriteSentence(null)}
        />
      )}
    </main>
  );
}
