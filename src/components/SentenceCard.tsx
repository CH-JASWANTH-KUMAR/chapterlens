'use client';

import React, { useState } from 'react';
import { DifficultSentence } from '../lib/linguistics/types';
import { Copy, Check, Eye, Wand2, BookOpen } from 'lucide-react';

interface SentenceCardProps {
  sentence: DifficultSentence;
  isSelected: boolean;
  onSelect: (sentence: DifficultSentence) => void;
  onOpenRewrite: (sentence: DifficultSentence) => void;
  onOpenGuidedReading?: (sentence: DifficultSentence) => void;
}

export function SentenceCard({
  sentence,
  isSelected,
  onSelect,
  onOpenRewrite,
  onOpenGuidedReading,
}: SentenceCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(sentence.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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

  const issueInfo = primaryIssueLabels[sentence.primaryIssue] || primaryIssueLabels.combination;

  const handleLocate = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(sentence);
    const el = document.getElementById(`highlight-${sentence.id}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Add a quick pulse effect
      el.classList.add('ring-4', 'ring-[var(--brand-emerald)]');
      setTimeout(() => {
        el.classList.remove('ring-4', 'ring-[var(--brand-emerald)]');
      }, 1500);
    }
  };

  return (
    <article
      id={`card-${sentence.id}`}
      tabIndex={0}
      role="button"
      aria-pressed={isSelected}
      onClick={() => onSelect(sentence)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(sentence);
        }
      }}
      className={`group relative rounded-2xl border p-5 flex flex-col justify-between transition-all duration-200 text-left outline-none cursor-pointer ${
        isSelected
          ? 'border-[var(--brand-emerald)] bg-[var(--canvas-card-subtle)] shadow-editorial ring-2 ring-[var(--brand-emerald)]/25'
          : 'border-[var(--border-subtle)] bg-[var(--canvas-card)] hover:border-[var(--border-strong)] hover:shadow-editorial-sm'
      }`}
    >
      {/* Top Segment: Header, Original Quote & Diagnostic */}
      <div className="space-y-3.5">
        {/* Card Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-3">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold shadow-xs select-none ${
                rankBadgeStyles[sentence.rank] || 'bg-neutral-800 text-white'
              }`}
            >
              {sentence.rank}
            </span>
            <span className="font-editorial-sans text-xs font-bold text-[var(--text-main)]">
              Rank #{sentence.rank}
            </span>
            <span className="text-[11px] text-[var(--text-faint)] font-editorial-mono">
              Score: <strong className="text-[var(--text-main)]">{sentence.difficultyScore}</strong>
            </span>
          </div>

          <span
            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${issueInfo.badge}`}
          >
            {issueInfo.label}
          </span>
        </div>

        {/* Source Location Indicator if available */}
        {sentence.sourceLocation && (
          <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-[var(--text-faint)] font-editorial-mono">
            {sentence.sourceLocation.pageNumber ? (
              <span className="inline-flex items-center gap-1 rounded-md bg-[var(--canvas-card-subtle)] border border-[var(--border-subtle)] px-2 py-0.5 text-[var(--text-muted)] font-semibold">
                <BookOpen className="h-3 w-3 text-[var(--brand-emerald)]" />
                <span>Page {sentence.sourceLocation.pageNumber}</span>
              </span>
            ) : null}
            {sentence.sourceLocation.sectionHeading ? (
              <span
                className="inline-flex items-center gap-1 rounded-md bg-[var(--canvas-card-subtle)] border border-[var(--border-subtle)] px-2 py-0.5 text-[var(--text-muted)] font-semibold truncate max-w-[220px]"
                title={sentence.sourceLocation.sectionHeading}
              >
                <span className="text-[var(--brand-emerald)]">§</span>
                <span className="truncate">{sentence.sourceLocation.sectionHeading}</span>
              </span>
            ) : null}
            <span className="text-[10px] text-[var(--text-faint)]">
              ¶ Para {sentence.sourceLocation.paragraphIndex + 1}
            </span>
          </div>
        )}

        {/* Verbatim Sentence Blockquote */}
        <div>
          <blockquote className="font-editorial-serif text-[14.5px] italic leading-relaxed text-[var(--text-main)] border-l-2 border-[var(--brand-emerald)]/60 pl-3">
            &ldquo;{sentence.text}&rdquo;
          </blockquote>
        </div>

        {/* Honest Diagnostic Explanation */}
        <div className="rounded-xl bg-[var(--canvas-card-subtle)] border border-[var(--border-subtle)] p-3 text-xs text-[var(--text-muted)] space-y-1.5 leading-relaxed">
          <p>
            <strong className="text-[var(--text-main)]">Diagnostic:</strong> {sentence.explanation}
          </p>
          {sentence.editorialTip && (
            <p className="text-[var(--brand-accent-text)] dark:text-[var(--brand-emerald)] font-medium border-t border-[var(--border-subtle)] pt-1.5 mt-1.5">
              <strong>Craft tip:</strong> {sentence.editorialTip}
            </p>
          )}
        </div>
      </div>

      {/* Bottom Segment: Signal Chips & Structured Actions */}
      <div className="mt-4 pt-3.5 border-t border-[var(--border-subtle)] space-y-3">
        {/* Contributing Signals Breakdown Chips */}
        <div className="grid grid-cols-2 gap-1.5 text-[10px] text-[var(--text-muted)]">
          <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--canvas-card)] px-2 py-1 flex justify-between items-center">
            <span className="text-[var(--text-faint)]">Words</span>
            <strong className="font-editorial-mono font-bold text-[var(--text-main)]">
              {sentence.signals.wordCount}
            </strong>
          </div>
          <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--canvas-card)] px-2 py-1 flex justify-between items-center">
            <span className="text-[var(--text-faint)]">Syl/word</span>
            <strong className="font-editorial-mono font-bold text-[var(--text-main)]">
              {sentence.signals.avgSyllablesPerWord}
            </strong>
          </div>
          <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--canvas-card)] px-2 py-1 flex justify-between items-center">
            <span className="text-[var(--text-faint)]">Complex words</span>
            <strong className="font-editorial-mono font-bold text-[var(--text-main)]">
              {sentence.signals.polysyllabicWordCount}
            </strong>
          </div>
          <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--canvas-card)] px-2 py-1 flex justify-between items-center">
            <span className="text-[var(--text-faint)]">Punctuation</span>
            <strong className="font-editorial-mono font-bold text-[var(--text-main)]">
              {sentence.signals.complexPunctuationCount}
            </strong>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleLocate}
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--canvas-card)] py-1.5 px-2 text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-main)] hover:border-[var(--brand-emerald)] hover:bg-[var(--canvas-card-hover)] transition-colors focus-visible:ring-2 focus-visible:ring-[var(--brand-emerald)]"
            >
              <Eye className="h-3.5 w-3.5 text-[var(--brand-emerald)] shrink-0" />
              <span>{isSelected ? 'Focused in Text' : 'Locate in Text'}</span>
            </button>

            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center justify-center gap-1 rounded-lg border border-[var(--border-subtle)] bg-[var(--canvas-card)] py-1.5 px-2.5 text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-main)] hover:border-[var(--border-strong)] transition-colors focus-visible:ring-2 focus-visible:ring-[var(--brand-emerald)] shrink-0"
              aria-label="Copy original sentence to clipboard"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-emerald-700 dark:text-emerald-300 font-semibold">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 text-[var(--text-faint)]" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          {onOpenGuidedReading && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenGuidedReading(sentence);
              }}
              className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg border border-[var(--brand-emerald)]/40 bg-emerald-50 dark:bg-emerald-950/40 py-1.5 px-3 text-xs font-semibold text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 active:scale-[0.98] transition-all focus-visible:ring-2 focus-visible:ring-[var(--brand-emerald)]"
              aria-label="Explain this sentence in Guided Reader"
            >
              <BookOpen className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Explain in Guided Reader</span>
            </button>
          )}

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenRewrite(sentence);
            }}
            className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-[var(--brand-forest)] py-1.5 px-3 text-xs font-semibold text-white shadow-xs hover:bg-[var(--brand-forest-hover)] active:scale-[0.98] transition-all focus-visible:ring-2 focus-visible:ring-[var(--brand-emerald)]"
            aria-label="Open rewrite assistance for this sentence"
          >
            <Wand2 className="h-3.5 w-3.5 text-[var(--brand-forest-light)]" />
            <span>Simplify / Rewrite</span>
          </button>
        </div>
      </div>
    </article>
  );
}
