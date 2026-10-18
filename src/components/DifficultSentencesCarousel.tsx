'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { DifficultSentence } from '../lib/linguistics/types';
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Copy,
  Check,
  Wand2,
  BookOpen,
  Info,
  Sparkles,
  HelpCircle,
  ChevronDown,
  Layers,
  AlertTriangle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DifficultSentencesCarouselProps {
  sentences: DifficultSentence[];
  totalSentencesInText: number;
  selectedSentenceId: string | null;
  onSelectSentence: (sentence: DifficultSentence) => void;
  onOpenRewrite: (sentence: DifficultSentence) => void;
  onOpenGuidedReading?: (sentence: DifficultSentence) => void;
}

export function DifficultSentencesCarousel({
  sentences,
  totalSentencesInText,
  selectedSentenceId,
  onSelectSentence,
  onOpenRewrite,
  onOpenGuidedReading,
}: DifficultSentencesCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');
  const [copied, setCopied] = useState(false);
  const [isMethodologyOpen, setIsMethodologyOpen] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);
  const touchStartXRef = useRef<number | null>(null);

  // Synchronize carousel index if external selection occurs (e.g. from manuscript click)
  useEffect(() => {
    if (selectedSentenceId && sentences.length > 0) {
      const matchIndex = sentences.findIndex((s) => s.id === selectedSentenceId);
      if (matchIndex !== -1 && matchIndex !== currentIndex) {
        setDirection(matchIndex > currentIndex ? 'next' : 'prev');
        setCurrentIndex(matchIndex);
      }
    }
  }, [selectedSentenceId, sentences]);

  const currentSentence: DifficultSentence | undefined = sentences[currentIndex];

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setDirection('prev');
      setCurrentIndex(newIndex);
      onSelectSentence(sentences[newIndex]);
    }
  }, [currentIndex, sentences, onSelectSentence]);

  const handleNext = useCallback(() => {
    if (currentIndex < sentences.length - 1) {
      const newIndex = currentIndex + 1;
      setDirection('next');
      setCurrentIndex(newIndex);
      onSelectSentence(sentences[newIndex]);
    }
  }, [currentIndex, sentences, onSelectSentence]);

  const handleSelectIndex = useCallback(
    (index: number) => {
      if (index >= 0 && index < sentences.length && index !== currentIndex) {
        setDirection(index > currentIndex ? 'next' : 'prev');
        setCurrentIndex(index);
        onSelectSentence(sentences[index]);
      }
    },
    [currentIndex, sentences, onSelectSentence]
  );

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      handlePrev();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      handleNext();
    }
  };

  // Touch swipe support
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const deltaX = touchEndX - touchStartXRef.current;
    touchStartXRef.current = null;

    if (Math.abs(deltaX) > 40) {
      if (deltaX > 0) {
        handlePrev();
      } else {
        handleNext();
      }
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLocate = (sentence: DifficultSentence) => {
    onSelectSentence(sentence);
    const el = document.getElementById(`highlight-${sentence.id}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('ring-4', 'ring-[var(--brand-emerald)]');
      setTimeout(() => {
        el.classList.remove('ring-4', 'ring-[var(--brand-emerald)]');
      }, 1500);
    }
  };

  const rankBadgeStyles: Record<number, string> = {
    1: 'bg-[var(--highlight-r1-marker)] text-[var(--highlight-r1-marker-text)]',
    2: 'bg-[var(--highlight-r2-marker)] text-[var(--highlight-r2-marker-text)]',
    3: 'bg-[var(--highlight-r3-marker)] text-[var(--highlight-r3-marker-text)]',
    4: 'bg-[var(--highlight-r4-marker)] text-[var(--highlight-r4-marker-text)]',
    5: 'bg-[var(--highlight-r5-marker)] text-[var(--highlight-r5-marker-text)]',
  };

  const primaryIssueLabels: Record<string, { label: string; badge: string }> = {
    length: {
      label: 'Sentence Length',
      badge:
        'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800',
    },
    vocabulary: {
      label: 'Vocabulary Density',
      badge:
        'bg-purple-100 text-purple-900 border-purple-300 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800',
    },
    structure: {
      label: 'Clause Structure',
      badge:
        'bg-blue-100 text-blue-900 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800',
    },
    combination: {
      label: 'Compound Complexity',
      badge:
        'bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800',
    },
  };

  if (sentences.length === 0) {
    return (
      <section aria-labelledby="sentences-attention-heading" className="space-y-4">
        <div className="border-b border-[var(--border-subtle)] pb-4">
          <h3
            id="sentences-attention-heading"
            className="font-editorial-serif text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-main)]"
          >
            Sentences that may need attention
          </h3>
          <p className="mt-1 text-xs sm:text-sm text-[var(--text-muted)]">
            Explore the passages that may be hardest to read, understand why they are flagged, and review possible improvements.
          </p>
        </div>
        <div className="rounded-2xl border border-dashed border-[var(--border-strong)] p-10 text-center text-sm text-[var(--text-faint)] bg-[var(--canvas-card)]">
          <Sparkles className="mx-auto h-8 w-8 text-[var(--text-faint)] mb-2 opacity-50" />
          <p className="font-semibold text-[var(--text-main)]">No high-friction sentences detected.</p>
          <p className="text-xs mt-1 text-[var(--text-muted)]">
            The chapter prose is remarkably accessible, or too brief to exhibit multi-clause friction.
          </p>
        </div>
      </section>
    );
  }

  const issueInfo =
    currentSentence && primaryIssueLabels[currentSentence.primaryIssue]
      ? primaryIssueLabels[currentSentence.primaryIssue]
      : primaryIssueLabels.combination;

  return (
    <section
      aria-labelledby="sentences-attention-heading"
      className="space-y-5"
      onKeyDown={handleKeyDown}
      ref={carouselRef}
      tabIndex={0}
      aria-roledescription="carousel"
      aria-label="Difficult sentences carousel"
    >
      {/* Section Header */}
      <div className="flex flex-col gap-2 border-b border-[var(--border-subtle)] pb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[var(--brand-emerald)]">
              <Layers className="h-4 w-4" />
              <span className="text-[11px] font-bold uppercase tracking-wider font-editorial-mono">
                Cadence & Friction Review
              </span>
            </div>
            <h3
              id="sentences-attention-heading"
              className="font-editorial-serif text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-main)]"
            >
              Sentences that may need attention
            </h3>
          </div>

          {/* Candidate Count and Navigation Status */}
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-[var(--brand-accent-border)] bg-[var(--brand-accent-bg)] px-3 py-1 text-xs font-semibold text-[var(--brand-accent-text)]">
              {sentences.length} {sentences.length === 1 ? 'Candidate Flagged' : 'Candidates Flagged'}
            </span>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
          Explore the passages that may be hardest to read, understand why they are flagged, and review possible improvements.
        </p>

        {/* Expandable Cognitive Friction Methodology Note */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setIsMethodologyOpen(!isMethodologyOpen)}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--text-faint)] hover:text-[var(--text-main)] transition-colors focus-visible:outline-2 focus-visible:outline-[var(--brand-emerald)] rounded"
            aria-expanded={isMethodologyOpen}
          >
            <HelpCircle className="h-3.5 w-3.5 text-[var(--brand-emerald)]" />
            <span>How does ChapterLens calculate sentence friction?</span>
            <ChevronDown
              className={`h-3 w-3 transition-transform duration-200 ${
                isMethodologyOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          <AnimatePresence>
            {isMethodologyOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="mt-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--canvas-card-subtle)] p-3.5 text-xs text-[var(--text-muted)] space-y-1.5 leading-relaxed">
                  <p>
                    <strong className="text-[var(--text-main)]">Cognitive Friction Index:</strong> Rather than relying solely on raw word count, our deterministic algorithm evaluates four distinct linguistic signals:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-[11px]">
                    <li><strong>Length:</strong> Number of words before terminal punctuation.</li>
                    <li><strong>Phonetic Weight:</strong> Average syllables per word using CMU-derived syllabic counting.</li>
                    <li><strong>Polysyllabic Density:</strong> Frequency of complex terms with 3 or more syllables.</li>
                    <li><strong>Syntactic Fragmentation:</strong> Count of semicolons, em dashes, and embedded parenthetical clauses.</li>
                  </ul>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {totalSentencesInText < 5 && (
          <div className="mt-1 flex items-center gap-2 rounded-xl bg-[var(--canvas-card-subtle)] border border-[var(--border-subtle)] px-3 py-2 text-xs text-[var(--text-muted)]">
            <Info className="h-3.5 w-3.5 shrink-0 text-[var(--brand-emerald)]" />
            <span>
              Your manuscript contains {totalSentencesInText} sentence{totalSentencesInText === 1 ? '' : 's'}. Showing all available candidates.
            </span>
          </div>
        )}
      </div>

      {/* Inline Carousel Container */}
      <div
        className="relative w-full rounded-2xl border border-[var(--border-strong)] bg-[var(--canvas-card)] shadow-editorial-elevated overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Top Carousel Navigation Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border-subtle)] bg-[var(--canvas-card-subtle)]/70 px-5 py-3">
          {/* Position Indicator */}
          <div className="flex items-center gap-2 font-editorial-mono text-xs text-[var(--text-muted)]">
            <span>Candidate</span>
            <strong className="text-[var(--text-main)] font-bold text-sm">
              {currentIndex + 1}
            </strong>
            <span>of</span>
            <strong className="text-[var(--text-main)]">{sentences.length}</strong>
          </div>

          {/* Dot Indicator Buttons */}
          <div
            className="hidden sm:flex items-center gap-1.5"
            role="tablist"
            aria-label="Sentence candidate navigation dots"
          >
            {sentences.map((s, idx) => (
              <button
                key={s.id}
                type="button"
                role="tab"
                aria-selected={idx === currentIndex}
                aria-label={`Jump to candidate ${idx + 1} (Rank #${s.rank})`}
                onClick={() => handleSelectIndex(idx)}
                className={`h-2.5 rounded-full transition-all focus-visible:outline-2 focus-visible:outline-[var(--brand-emerald)] ${
                  idx === currentIndex
                    ? 'w-6 bg-[var(--brand-forest)] dark:bg-[var(--brand-emerald)] shadow-xs'
                    : 'w-2.5 bg-[var(--border-strong)] hover:bg-[var(--text-faint)]'
                }`}
              />
            ))}
          </div>

          {/* Arrow Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentIndex === 0}
              aria-label="Previous difficult sentence candidate"
              className={`inline-flex items-center gap-1 rounded-xl border border-[var(--border-subtle)] bg-[var(--canvas-card)] px-3 py-1.5 text-xs font-semibold shadow-xs transition-colors focus-visible:outline-2 focus-visible:outline-[var(--brand-emerald)] ${
                currentIndex === 0
                  ? 'opacity-40 cursor-not-allowed text-[var(--text-faint)]'
                  : 'text-[var(--text-main)] hover:bg-[var(--canvas-card-hover)] hover:border-[var(--brand-emerald)]'
              }`}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Previous</span>
            </button>

            <button
              type="button"
              onClick={handleNext}
              disabled={currentIndex === sentences.length - 1}
              aria-label="Next difficult sentence candidate"
              className={`inline-flex items-center gap-1 rounded-xl border border-[var(--border-subtle)] bg-[var(--canvas-card)] px-3 py-1.5 text-xs font-semibold shadow-xs transition-colors focus-visible:outline-2 focus-visible:outline-[var(--brand-emerald)] ${
                currentIndex === sentences.length - 1
                  ? 'opacity-40 cursor-not-allowed text-[var(--text-faint)]'
                  : 'text-[var(--text-main)] hover:bg-[var(--canvas-card-hover)] hover:border-[var(--brand-emerald)]'
              }`}
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Animated Carousel Card Content */}
        <div className="p-6 sm:p-8">
          <AnimatePresence mode="wait">
            {currentSentence && (
              <motion.article
                key={currentSentence.id}
                id={`card-${currentSentence.id}`}
                initial={{
                  opacity: 0,
                  x: direction === 'next' ? 16 : -16,
                }}
                animate={{ opacity: 1, x: 0 }}
                exit={{
                  opacity: 0,
                  x: direction === 'next' ? -16 : 16,
                }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-6"
              >
                {/* Card Top Meta Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-4">
                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold shadow-xs select-none ${
                        rankBadgeStyles[currentSentence.rank] || 'bg-neutral-800 text-white'
                      }`}
                    >
                      {currentSentence.rank}
                    </span>
                    <span className="font-editorial-sans text-sm font-bold text-[var(--text-main)]">
                      {currentSentence.extractionQuality?.isMixedContent
                        ? `Candidate #${currentSentence.rank} (Mixed Figure Content)`
                        : `Rank #${currentSentence.rank} Most Difficult`}
                    </span>
                    <span className="text-xs text-[var(--text-faint)] font-editorial-mono">
                      Friction Score:{' '}
                      <strong className="text-[var(--text-main)] text-sm">
                        {currentSentence.difficultyScore}
                      </strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {currentSentence.extractionQuality?.isMixedContent ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-100 dark:border-amber-800 dark:bg-amber-950/60 px-2.5 py-0.5 text-xs font-semibold text-amber-900 dark:text-amber-300">
                        <AlertTriangle className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                        <span>Extraction Warning</span>
                      </span>
                    ) : (
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${issueInfo.badge}`}
                      >
                        {issueInfo.label}
                      </span>
                    )}
                  </div>
                </div>

                {/* Source Document Occurrence */}
                {currentSentence.sourceLocation && (
                  <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-faint)] font-editorial-mono bg-[var(--canvas-card-subtle)] p-2 rounded-lg border border-[var(--border-subtle)]">
                    {currentSentence.sourceLocation.pageNumber && (
                      <span className="inline-flex items-center gap-1 font-semibold text-[var(--text-main)]">
                        <BookOpen className="h-3.5 w-3.5 text-[var(--brand-emerald)]" />
                        <span>Page {currentSentence.sourceLocation.pageNumber}</span>
                      </span>
                    )}
                    {currentSentence.sourceLocation.sectionHeading && (
                      <span
                        className="truncate max-w-sm font-medium text-[var(--text-muted)]"
                        title={currentSentence.sourceLocation.sectionHeading}
                      >
                        § {currentSentence.sourceLocation.sectionHeading}
                      </span>
                    )}
                    <span>¶ Paragraph {currentSentence.sourceLocation.paragraphIndex + 1}</span>
                  </div>
                )}

                {/* Extraction Quality Warning Alert */}
                {currentSentence.extractionQuality?.isMixedContent && (
                  <div className="rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 p-4 text-xs text-amber-900 dark:text-amber-200 space-y-2">
                    <div className="flex items-center gap-2 font-bold text-sm text-amber-900 dark:text-amber-200">
                      <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
                      <span>Extraction Boundary Notice: Mixed Non-Prose Content</span>
                    </div>
                    <p className="leading-relaxed text-amber-800 dark:text-amber-300">
                      {currentSentence.extractionQuality.warningMessage ||
                        'This candidate contains non-prose figure elements or ambiguous source boundaries. AI rewriting is restricted unless explicitly reviewed to prevent combining distinct figures or chart data.'}
                    </p>
                    {currentSentence.extractionQuality.reasons.length > 0 && (
                      <ul className="list-disc pl-4 text-[11px] text-amber-800/90 dark:text-amber-300/90 space-y-0.5">
                        {currentSentence.extractionQuality.reasons.map((r, i) => (
                          <li key={i}>{r}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                {/* Verbatim Sentence Blockquote */}
                <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--canvas-card-subtle)]/60 p-5 sm:p-6">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-faint)] font-editorial-mono block mb-2">
                    Full Sentence Passage
                  </span>
                  <blockquote className="font-editorial-serif text-lg sm:text-xl italic leading-relaxed text-[var(--text-main)] border-l-3 border-[var(--brand-emerald)] pl-4">
                    “{currentSentence.text}”
                  </blockquote>
                </div>

                {/* Diagnostic & Editorial Craft Tip */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--canvas-card-subtle)] p-4 text-xs space-y-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-[var(--text-main)]">
                      <Info className="h-3.5 w-3.5 text-[var(--brand-emerald)]" />
                      <span>Linguistic Diagnosis</span>
                    </div>
                    <p className="text-[var(--text-muted)] leading-relaxed">
                      {currentSentence.explanation}
                    </p>
                  </div>

                  {currentSentence.editorialTip && (
                    <div className="rounded-xl border border-[var(--brand-accent-border)] bg-[var(--brand-accent-bg)] p-4 text-xs space-y-1.5">
                      <div className="flex items-center gap-1.5 font-bold text-[var(--brand-accent-text)]">
                        <Sparkles className="h-3.5 w-3.5 text-[var(--brand-emerald)]" />
                        <span>Authorial Craft Tip</span>
                      </div>
                      <p className="text-[var(--text-main)] leading-relaxed">
                        {currentSentence.editorialTip}
                      </p>
                    </div>
                  )}
                </div>

                {/* Metrics Breakdown Chips */}
                <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--canvas-card)] p-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-faint)] font-editorial-mono block mb-2.5">
                    Linguistic Metrics Breakdown
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--canvas-card-subtle)] px-3 py-2 flex justify-between items-center">
                      <span className="text-[var(--text-faint)]">Words</span>
                      <strong className="font-editorial-mono font-bold text-[var(--text-main)] text-sm">
                        {currentSentence.signals.wordCount}
                      </strong>
                    </div>
                    <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--canvas-card-subtle)] px-3 py-2 flex justify-between items-center">
                      <span className="text-[var(--text-faint)]">Syl / Word</span>
                      <strong className="font-editorial-mono font-bold text-[var(--text-main)] text-sm">
                        {currentSentence.signals.avgSyllablesPerWord}
                      </strong>
                    </div>
                    <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--canvas-card-subtle)] px-3 py-2 flex justify-between items-center">
                      <span className="text-[var(--text-faint)]">Complex Words</span>
                      <strong className="font-editorial-mono font-bold text-[var(--text-main)] text-sm">
                        {currentSentence.signals.polysyllabicWordCount}
                      </strong>
                    </div>
                    <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--canvas-card-subtle)] px-3 py-2 flex justify-between items-center">
                      <span className="text-[var(--text-faint)]">Punctuation</span>
                      <strong className="font-editorial-mono font-bold text-[var(--text-main)] text-sm">
                        {currentSentence.signals.complexPunctuationCount}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Structured Action Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border-subtle)] pt-5">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => handleLocate(currentSentence)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--canvas-card)] px-3.5 py-2 text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-main)] hover:border-[var(--brand-emerald)] hover:bg-[var(--canvas-card-hover)] transition-colors focus-visible:outline-2 focus-visible:outline-[var(--brand-emerald)]"
                    >
                      <Eye className="h-4 w-4 text-[var(--brand-emerald)]" />
                      <span>Locate in Text</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCopy(currentSentence.text)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--canvas-card)] px-3.5 py-2 text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-main)] hover:border-[var(--border-strong)] transition-colors focus-visible:outline-2 focus-visible:outline-[var(--brand-emerald)]"
                      aria-label="Copy sentence passage"
                    >
                      {copied ? (
                        <>
                          <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                          <span className="text-emerald-700 dark:text-emerald-300">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 text-[var(--text-faint)]" />
                          <span>Copy Sentence</span>
                        </>
                      )}
                    </button>

                    {onOpenGuidedReading && (
                      <button
                        type="button"
                        onClick={() => onOpenGuidedReading(currentSentence)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--brand-emerald)]/40 bg-emerald-50 dark:bg-emerald-950/40 px-3.5 py-2 text-xs font-semibold text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-all focus-visible:outline-2 focus-visible:outline-[var(--brand-emerald)]"
                      >
                        <BookOpen className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        <span>Explain in Guided Reader</span>
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => onOpenRewrite(currentSentence)}
                    className="inline-flex items-center gap-2 rounded-xl bg-[var(--brand-forest)] px-5 py-2 text-xs sm:text-sm font-semibold text-white shadow-editorial hover:bg-[var(--brand-forest-hover)] active:scale-[0.98] transition-all focus-visible:outline-2 focus-visible:outline-[var(--brand-emerald)]"
                  >
                    {currentSentence.extractionQuality?.isMixedContent ? (
                      <>
                        <AlertTriangle className="h-4 w-4 text-amber-300" />
                        <span>Review & Rewrite</span>
                      </>
                    ) : (
                      <>
                        <Wand2 className="h-4 w-4 text-[var(--brand-forest-light)]" />
                        <span>Simplify / Rewrite</span>
                      </>
                    )}
                  </button>
                </div>
              </motion.article>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
