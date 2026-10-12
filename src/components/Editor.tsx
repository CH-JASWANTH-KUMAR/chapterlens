'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { SAMPLE_PASSAGES, SamplePassage } from '../lib/linguistics/samples';
import { extractWords, segmentText } from '../lib/linguistics/segmenter';
import {
  Sparkles,
  Trash2,
  BookMarked,
  ShieldCheck,
  CornerDownLeft,
  AlertCircle,
  Info,
  X,
  FileText,
  AlignLeft,
} from 'lucide-react';

interface EditorProps {
  text: string;
  onChangeText: (newText: string) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  onClear: () => void;
}

export function Editor({
  text,
  onChangeText,
  onAnalyze,
  isAnalyzing,
  onClear,
}: EditorProps) {
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [selectedSample, setSelectedSample] = useState<SamplePassage | null>(null);

  // Live metrics calculation matching linguistics engine
  const { wordCount, sentenceCount, charCount, paragraphCount } = useMemo(() => {
    if (!text.trim()) {
      return { wordCount: 0, sentenceCount: 0, charCount: text.length, paragraphCount: 0 };
    }
    const words = extractWords(text);
    const sentences = segmentText(text);
    const paragraphs = text
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    return {
      wordCount: words.length,
      sentenceCount: sentences.length,
      charCount: text.length,
      paragraphCount: Math.max(1, paragraphs.length),
    };
  }, [text]);

  // Handle keyboard shortcut: Cmd+Enter or Ctrl+Enter to trigger analysis
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        if (text.trim() && !isAnalyzing) {
          e.preventDefault();
          onAnalyze();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [text, isAnalyzing, onAnalyze]);

  const handleSelectSample = (sample: SamplePassage) => {
    setSelectedSample(sample);
    onChangeText(sample.text);
  };

  const handleConfirmClear = () => {
    onClear();
    setShowClearConfirm(false);
    setSelectedSample(null);
  };

  return (
    <section aria-labelledby="editor-workspace-heading" className="w-full space-y-4">
      {/* Editor Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <span className="text-[11px] font-semibold tracking-wider uppercase text-[var(--brand-emerald)]">
            Manuscript Studio
          </span>
          <h2
            id="editor-workspace-heading"
            className="font-editorial-serif text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-main)]"
          >
            Draft & Chapter Workspace
          </h2>
        </div>

        {/* Word limit / Length advisory */}
        {wordCount > 35000 && (
          <div className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-950/40 dark:border-amber-800 px-3 py-1 text-xs text-amber-800 dark:text-amber-300">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            <span>Long chapter ({wordCount.toLocaleString()} words). Ready for analysis.</span>
          </div>
        )}
      </div>

      {/* Editor Main Surface */}
      <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--canvas-card)] shadow-editorial transition-all duration-200">
        {/* Top Control Bar: Demonstration Passages & Clear */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border-subtle)] px-4 py-3 sm:px-6 bg-[var(--canvas-card-subtle)] rounded-t-2xl">
          {/* Sample loader group */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-muted)]">
              <BookMarked className="h-4 w-4 text-[var(--brand-emerald)]" />
              <span>Load Demonstration Excerpt:</span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {SAMPLE_PASSAGES.map((sample) => (
                <button
                  key={sample.id}
                  type="button"
                  onClick={() => handleSelectSample(sample)}
                  className={`rounded-lg border px-2.5 py-1 text-xs font-medium transition-all duration-150 focus-visible:outline-2 focus-visible:outline-[var(--brand-emerald)] ${
                    selectedSample?.id === sample.id
                      ? 'border-[var(--brand-emerald)] bg-[var(--brand-accent-bg)] text-[var(--brand-accent-text)] font-semibold shadow-xs'
                      : 'border-[var(--border-subtle)] bg-[var(--canvas-card)] text-[var(--text-muted)] hover:border-[var(--border-strong)] hover:text-[var(--text-main)]'
                  }`}
                  title={`${sample.genre}: ${sample.description}`}
                >
                  <span>{sample.title}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Clear text control */}
          {text.length > 0 && (
            <div>
              {showClearConfirm ? (
                <div className="flex items-center gap-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 px-2.5 py-1 border border-rose-200 dark:border-rose-900 animate-in fade-in duration-150">
                  <span className="text-xs font-medium text-rose-800 dark:text-rose-300">
                    Clear manuscript?
                  </span>
                  <button
                    onClick={handleConfirmClear}
                    className="rounded bg-rose-700 hover:bg-rose-800 px-2 py-0.5 text-xs font-semibold text-white transition-colors"
                  >
                    Yes, clear
                  </button>
                  <button
                    onClick={() => setShowClearConfirm(false)}
                    className="rounded border border-[var(--border-strong)] bg-[var(--canvas-card)] px-2 py-0.5 text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowClearConfirm(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium text-[var(--text-faint)] hover:bg-[var(--canvas-card-hover)] hover:text-rose-600 dark:hover:text-rose-400 transition-colors focus-visible:outline-2 focus-visible:outline-[var(--brand-emerald)]"
                  aria-label="Clear manuscript text"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Clear text</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Demonstration Passage Active Notice Banner */}
        {selectedSample && (
          <div className="flex items-center justify-between border-b border-[var(--brand-accent-border)] bg-[var(--brand-accent-bg)] px-4 py-2.5 text-xs text-[var(--brand-accent-text)]">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 shrink-0 text-[var(--brand-emerald)]" />
              <span>
                <strong>Demonstration Passage Loaded:</strong> “{selectedSample.title}” ({selectedSample.genre}). Fictional excerpt for instant testing. Edit freely or click <strong>Analyze chapter</strong>.
              </span>
            </div>
            <button
              onClick={() => setSelectedSample(null)}
              className="rounded p-1 text-[var(--brand-accent-text)] hover:opacity-75 transition-opacity"
              aria-label="Dismiss demo passage notice"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Textarea Workspace Area */}
        <div className="relative p-4 sm:p-6">
          <label htmlFor="chapter-text-input" className="sr-only">
            Paste your chapter manuscript here
          </label>
          <textarea
            id="chapter-text-input"
            value={text}
            onChange={(e) => {
              onChangeText(e.target.value);
              setSelectedSample(null);
            }}
            placeholder="Paste your chapter manuscript, essay draft, or short story here...

Every sentence will be evaluated for Flesch Reading Ease and analyzed across four distinct friction metrics: word cadence, syllable weight, polysyllabic density, and syntactic fragmentation.

Press ⌘+Enter to analyze immediately, or select one of the demonstration passages above."
            rows={14}
            className="w-full resize-y font-editorial-serif text-[17px] sm:text-[18px] leading-[1.85] text-[var(--text-main)] placeholder:font-editorial-sans placeholder:text-sm placeholder:text-[var(--text-faint)] bg-transparent focus:outline-none transition-colors"
            spellCheck="true"
          />
        </div>

        {/* Editor Bottom Bar: Metrics & Action */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[var(--border-subtle)] bg-[var(--canvas-card-subtle)] px-4 py-3.5 sm:px-6 rounded-b-2xl">
          {/* Live Text Metrics */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs font-medium text-[var(--text-muted)]">
            <span className="inline-flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-[var(--brand-emerald)]" />
              <strong className="font-editorial-mono font-bold text-[var(--text-main)]">
                {wordCount.toLocaleString()}
              </strong>
              <span>words</span>
            </span>
            <span className="text-[var(--border-strong)]">•</span>
            <span className="inline-flex items-center gap-1.5">
              <strong className="font-editorial-mono font-bold text-[var(--text-main)]">
                {sentenceCount.toLocaleString()}
              </strong>
              <span>sentences</span>
            </span>
            <span className="text-[var(--border-strong)]">•</span>
            <span className="inline-flex items-center gap-1.5">
              <AlignLeft className="h-3.5 w-3.5 text-[var(--text-faint)]" />
              <strong className="font-editorial-mono font-bold text-[var(--text-main)]">
                {paragraphCount.toLocaleString()}
              </strong>
              <span>paragraphs</span>
            </span>
            <span className="hidden md:inline-block text-[var(--border-strong)]">•</span>
            <span className="hidden md:inline-flex items-center gap-1.5">
              <strong className="font-editorial-mono font-bold text-[var(--text-main)]">
                {charCount.toLocaleString()}
              </strong>
              <span>characters</span>
            </span>
          </div>

          {/* Primary Action Button */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <span className="hidden lg:inline-flex items-center gap-1 text-[11px] text-[var(--text-faint)] font-editorial-mono">
              <CornerDownLeft className="h-3 w-3" />
              <span>⌘+Enter to analyze</span>
            </span>

            <button
              id="analyze-chapter-button"
              type="button"
              disabled={!text.trim() || isAnalyzing}
              onClick={onAnalyze}
              className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold shadow-editorial transition-all focus-visible:outline-2 focus-visible:outline-[var(--brand-emerald)] ${
                !text.trim() || isAnalyzing
                  ? 'cursor-not-allowed bg-[var(--border-subtle)] text-[var(--text-faint)]'
                  : 'bg-[var(--brand-forest)] text-white hover:bg-[var(--brand-forest-hover)] active:scale-[0.98]'
              }`}
            >
              <Sparkles className="h-4 w-4 text-[var(--brand-forest-light)]" />
              <span>{isAnalyzing ? 'Analyzing Cadence...' : 'Analyze Chapter'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Visible Privacy Reassurance */}
      <div className="flex items-center justify-center sm:justify-start gap-2 text-xs text-[var(--text-muted)] pt-1">
        <ShieldCheck className="h-4 w-4 text-[var(--brand-emerald)] shrink-0" />
        <span>
          Your manuscript remains in local browser memory. Zero cloud storage, zero tracking, zero AI model training.
        </span>
      </div>
    </section>
  );
}
