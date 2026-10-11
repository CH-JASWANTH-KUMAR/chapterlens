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
import { ArrowLeft, RotateCcw, Columns, AlignLeft, ListOrdered } from 'lucide-react';

interface WorkspaceProps {
  onAnalysisStateChange?: (hasAnalysis: boolean) => void;
}

export function Workspace({ onAnalysisStateChange }: WorkspaceProps) {
  const [text, setText] = useState<string>('');
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedSentenceId, setSelectedSentenceId] = useState<string | null>(null);
  const [rewriteSentence, setRewriteSentence] = useState<DifficultSentence | null>(null);
  const [desktopLayout, setDesktopLayout] = useState<'split' | 'stacked'>('split');

  const editorSectionRef = useRef<HTMLDivElement>(null);
  const analysisSectionRef = useRef<HTMLDivElement>(null);

  const handleAnalyze = () => {
    if (!text.trim()) return;
    setIsAnalyzing(true);

    // Perform analysis
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
          className="space-y-8 animate-in fade-in duration-300"
        >
          {/* Action bar above results */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E6E4D9] pb-4">
            <div className="flex items-center gap-2">
              <button
                onClick={handleNewAnalysis}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#CDC9B8] bg-white px-3 py-1.5 text-xs font-semibold text-[#1C1E1D] shadow-xs hover:bg-[#F5F4EE] hover:border-[#1A3C2D] focus-visible:outline-2 focus-visible:outline-[#1A3C2D]"
              >
                <RotateCcw className="h-3.5 w-3.5 text-[#537562]" />
                <span>Reset / Edit Chapter</span>
              </button>
            </div>

            {/* Desktop Layout Toggle */}
            <div className="hidden lg:flex items-center gap-1 rounded-lg border border-[#E6E4D9] bg-[#F5F4EE] p-0.5 text-xs">
              <button
                onClick={() => setDesktopLayout('split')}
                className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  desktopLayout === 'split'
                    ? 'bg-white text-[#1A3C2D] shadow-xs font-semibold'
                    : 'text-[#5E6460] hover:text-[#1C1E1D]'
                }`}
                aria-label="Side-by-side view"
              >
                <Columns className="h-3.5 w-3.5" />
                <span>Side by Side</span>
              </button>
              <button
                onClick={() => setDesktopLayout('stacked')}
                className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  desktopLayout === 'stacked'
                    ? 'bg-white text-[#1A3C2D] shadow-xs font-semibold'
                    : 'text-[#5E6460] hover:text-[#1C1E1D]'
                }`}
                aria-label="Stacked view"
              >
                <AlignLeft className="h-3.5 w-3.5" />
                <span>Stacked</span>
              </button>
            </div>
          </div>

          {/* Readability Scorecard */}
          <ScoreCard analysis={analysis} />

          {/* Sentence Analysis: Responsive Two-Column or Stacked */}
          {desktopLayout === 'split' ? (
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
              {/* Left Column: Inline Highlighted Manuscript */}
              <div className="lg:col-span-7">
                <InlineHighlightedText
                  originalText={text}
                  difficultSentences={analysis.difficultSentences}
                  selectedSentenceId={selectedSentenceId}
                  onSelectSentence={handleSelectSentence}
                />
              </div>

              {/* Right Column: Ranked Difficult Sentences List */}
              <div className="lg:col-span-5">
                <HardestSentencesList
                  sentences={analysis.difficultSentences}
                  totalSentencesInText={analysis.totalSentences}
                  selectedSentenceId={selectedSentenceId}
                  onSelectSentence={handleSelectSentence}
                  onOpenRewrite={(s) => setRewriteSentence(s)}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              <HardestSentencesList
                sentences={analysis.difficultSentences}
                totalSentencesInText={analysis.totalSentences}
                selectedSentenceId={selectedSentenceId}
                onSelectSentence={handleSelectSentence}
                onOpenRewrite={(s) => setRewriteSentence(s)}
              />

              <InlineHighlightedText
                originalText={text}
                difficultSentences={analysis.difficultSentences}
                selectedSentenceId={selectedSentenceId}
                onSelectSentence={handleSelectSentence}
              />
            </div>
          )}
        </section>
      )}

      {/* Educational & Craft Insights Section */}
      <div className="pt-8">
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
