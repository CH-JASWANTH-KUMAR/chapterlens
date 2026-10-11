'use client';

import React, { useState, useEffect } from 'react';
import { SAMPLE_PASSAGES, SamplePassage } from '../lib/linguistics/samples';
import { extractWords } from '../lib/linguistics/segmenter';
import { Sparkles, Trash2, BookMarked, ShieldCheck, CornerDownLeft, AlertCircle } from 'lucide-react';

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
  const [selectedSampleId, setSelectedSampleId] = useState<string>('');

  // Live lightweight metrics
  const words = extractWords(text);
  const wordCount = words.length;
  const charCount = text.length;

  // Approximate sentence count for live counter
  const sentenceCount = text.trim()
    ? (text.match(/[^.!?…\n]+[.!?…]+|[^.!?…\n]+$/g) || []).length
    : 0;

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
    setSelectedSampleId(sample.id);
    onChangeText(sample.text);
  };

  const handleConfirmClear = () => {
    onClear();
    setShowClearConfirm(false);
    setSelectedSampleId('');
  };

  return (
    <section aria-labelledby="editor-headline" className="w-full">
      {/* Editorial Headline & Statement */}
      <div className="mb-6 text-center sm:text-left">
        <h1
          id="editor-headline"
          className="font-editorial-serif text-3xl font-extrabold tracking-tight text-[#1C1E1D] sm:text-4xl lg:text-5xl"
        >
          Make every sentence easier to read.
        </h1>
        <p className="mt-2 text-base text-[#5E6460] sm:text-lg">
          Evaluate Flesch Reading Ease, pinpoint your five hardest sentences, and explore transparent linguistic signals—without signing up or sending your words to a server.
        </p>
      </div>

      {/* Editor Container */}
      <div className="rounded-2xl border border-[#E6E4D9] bg-white shadow-editorial transition-all">
        {/* Editor Toolbar (Top) */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#F0EFEA] px-4 py-3 sm:px-6">
          {/* Sample Passages Loader */}
          <div className="flex items-center gap-2">
            <BookMarked className="h-4 w-4 text-[#537562]" />
            <span className="text-xs font-semibold text-[#424744]">Load Sample:</span>
            <div className="flex flex-wrap gap-1.5">
              {SAMPLE_PASSAGES.map((sample) => (
                <button
                  key={sample.id}
                  type="button"
                  onClick={() => handleSelectSample(sample)}
                  className={`rounded-md border px-2 py-1 text-xs font-medium transition-colors ${
                    selectedSampleId === sample.id
                      ? 'border-[#1A3C2D] bg-[#EBF1ED] text-[#1A3C2D]'
                      : 'border-[#E6E4D9] bg-[#FBFBF9] text-[#5E6460] hover:border-[#CDC9B8] hover:text-[#1C1E1D]'
                  }`}
                  title={sample.description}
                >
                  {sample.title}
                </button>
              ))}
            </div>
          </div>

          {/* Clear text button */}
          {text.length > 0 && (
            <div>
              {showClearConfirm ? (
                <div className="flex items-center gap-2 rounded-lg bg-rose-50 px-2.5 py-1 border border-rose-200">
                  <span className="text-xs font-medium text-rose-800">Clear manuscript?</span>
                  <button
                    onClick={handleConfirmClear}
                    className="rounded bg-rose-700 px-2 py-0.5 text-xs font-semibold text-white hover:bg-rose-800"
                  >
                    Yes, clear
                  </button>
                  <button
                    onClick={() => setShowClearConfirm(false)}
                    className="rounded border border-[#CDC9B8] bg-white px-2 py-0.5 text-xs font-medium text-[#424744]"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowClearConfirm(true)}
                  className="inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium text-[#7A817D] hover:bg-[#F5F4EE] hover:text-rose-700 transition-colors"
                  aria-label="Clear manuscript text"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Clear text</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Textarea Area */}
        <div className="relative p-4 sm:p-6">
          <label htmlFor="chapter-text-input" className="sr-only">
            Paste your chapter manuscript here
          </label>
          <textarea
            id="chapter-text-input"
            value={text}
            onChange={(e) => {
              onChangeText(e.target.value);
              setSelectedSampleId('');
            }}
            placeholder="Paste your chapter manuscript or short story here...

Every sentence will be evaluated for Flesch Reading Ease and analyzed across four distinct friction metrics (cadence, syllable weight, polysyllabic density, and syntactic fragmentation)."
            rows={14}
            className="w-full resize-y font-editorial-serif text-[17px] leading-[1.8] text-[#1C1E1D] placeholder:font-editorial-sans placeholder:text-sm placeholder:text-[#A3AAA5] focus:outline-none"
            spellCheck="true"
          />

          {wordCount > 35000 && (
            <div className="mt-2 flex items-center gap-1.5 text-xs text-[#C2632B]">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              <span>
                Long manuscript ({wordCount.toLocaleString()} words). For best reading ease insight, consider analyzing one chapter at a time.
              </span>
            </div>
          )}
        </div>

        {/* Editor Bottom Status Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#F0EFEA] bg-[#FBFBF9] px-4 py-3 sm:px-6 rounded-b-2xl">
          {/* Live Text Metrics */}
          <div className="flex items-center gap-4 text-xs font-medium text-[#5E6460]">
            <span>
              <strong className="text-[#1C1E1D]">{wordCount.toLocaleString()}</strong> words
            </span>
            <span className="text-[#CDC9B8]">•</span>
            <span>
              <strong className="text-[#1C1E1D]">{sentenceCount.toLocaleString()}</strong> sentences
            </span>
            <span className="text-[#CDC9B8]">•</span>
            <span>
              <strong className="text-[#1C1E1D]">{charCount.toLocaleString()}</strong> characters
            </span>
          </div>

          {/* Primary Action Button */}
          <div className="flex items-center gap-3">
            <span className="hidden text-[11px] text-[#7A817D] lg:inline-flex items-center gap-1">
              <CornerDownLeft className="h-3 w-3" />
              <span>Press ⌘+Enter to analyze</span>
            </span>

            <button
              id="analyze-chapter-button"
              type="button"
              disabled={!text.trim() || isAnalyzing}
              onClick={onAnalyze}
              className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold shadow-sm transition-all focus-visible:outline-2 focus-visible:outline-[#1A3C2D] ${
                !text.trim() || isAnalyzing
                  ? 'cursor-not-allowed bg-[#E6E4D9] text-[#7A817D]'
                  : 'bg-[#1A3C2D] text-white hover:bg-[#122B20] active:scale-[0.99]'
              }`}
            >
              <Sparkles className="h-4 w-4 text-[#EBF1ED]" />
              <span>{isAnalyzing ? 'Analyzing Cadence...' : 'Analyze chapter'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Visible Privacy Reassurance */}
      <div className="mt-3 flex items-center justify-center sm:justify-start gap-1.5 text-xs text-[#5E6460]">
        <ShieldCheck className="h-3.5 w-3.5 text-[#537562]" />
        <span>Your chapter stays in your browser during readability analysis. Zero data transmission.</span>
      </div>
    </section>
  );
}
