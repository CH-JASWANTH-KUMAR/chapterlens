'use client';

import React, { useEffect, useRef } from 'react';
import { DifficultSentence } from '../lib/linguistics/types';
import { buildTextSegments } from '../lib/linguistics/highlighter';
import { Eye, BookOpen, ExternalLink } from 'lucide-react';

interface InlineHighlightedTextProps {
  originalText: string;
  difficultSentences: DifficultSentence[];
  selectedSentenceId: string | null;
  onSelectSentence: (sentence: DifficultSentence) => void;
}

export function InlineHighlightedText({
  originalText,
  difficultSentences,
  selectedSentenceId,
  onSelectSentence,
}: InlineHighlightedTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // When selectedSentenceId changes externally, scroll to the highlight
  useEffect(() => {
    if (!selectedSentenceId) return;
    const el = document.getElementById(`highlight-${selectedSentenceId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [selectedSentenceId]);

  const segments = buildTextSegments(originalText, difficultSentences);

  const rankBadgeClasses: Record<number, string> = {
    1: 'bg-[var(--highlight-r1-marker)] text-white',
    2: 'bg-[var(--highlight-r2-marker)] text-white',
    3: 'bg-[var(--highlight-r3-marker)] text-white dark:text-neutral-900',
    4: 'bg-[var(--highlight-r4-marker)] text-white dark:text-neutral-900',
    5: 'bg-[var(--highlight-r5-marker)] text-white dark:text-neutral-900',
  };

  const selectedSentence = difficultSentences.find((s) => s.id === selectedSentenceId);

  return (
    <section
      aria-labelledby="manuscript-preview-heading"
      className="flex flex-col h-full rounded-2xl border border-[var(--border-subtle)] bg-[var(--canvas-card)] shadow-editorial transition-all duration-200 overflow-hidden"
    >
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border-subtle)] px-5 py-4 bg-[var(--canvas-card-subtle)]">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--brand-accent-bg)] text-[var(--brand-emerald)] border border-[var(--brand-accent-border)]">
            <Eye className="h-4 w-4" />
          </div>
          <div>
            <h3
              id="manuscript-preview-heading"
              className="font-editorial-serif text-lg font-bold tracking-tight text-[var(--text-main)]"
            >
              Manuscript Inspector
            </h3>
            <p className="text-[11px] text-[var(--text-faint)]">
              Original verbatim text with cognitive friction pinpoints.
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-2 text-[11px] text-[var(--text-muted)]">
          <span className="font-semibold text-[var(--text-main)]">Friction:</span>
          <span className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold border border-[var(--highlight-r1-border)] bg-[var(--highlight-r1-bg)] text-[var(--highlight-r1-marker)]">
            [1] Highest
          </span>
          <span className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold border border-[var(--highlight-r2-border)] bg-[var(--highlight-r2-bg)] text-[var(--highlight-r2-marker)]">
            [2-3] Heavy
          </span>
          <span className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold border border-[var(--highlight-r4-border)] bg-[var(--highlight-r4-bg)] text-[var(--highlight-r4-marker)]">
            [4-5] Moderate
          </span>
        </div>
      </div>

      {/* Selected sentence quick inspector banner */}
      {selectedSentence && (
        <div className="border-b border-[var(--border-subtle)] bg-[var(--brand-accent-bg)]/60 px-5 py-3 transition-all duration-200">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold shadow-xs ${
                    rankBadgeClasses[selectedSentence.rank]
                  }`}
                >
                  {selectedSentence.rank}
                </span>
                <span className="text-xs font-bold text-[var(--text-main)]">
                  Sentence #{selectedSentence.rank} Focus
                </span>
                <span className="text-xs text-[var(--text-faint)] font-editorial-mono">
                  ({selectedSentence.signals.wordCount} words · {selectedSentence.signals.polysyllabicWordCount} complex words)
                </span>
              </div>
              <p className="text-xs text-[var(--text-muted)] italic leading-relaxed line-clamp-2">
                {selectedSentence.explanation}
              </p>
            </div>
            <button
              onClick={() => {
                const card = document.getElementById(`card-${selectedSentence.id}`);
                card?.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }}
              className="shrink-0 inline-flex items-center gap-1 text-xs text-[var(--brand-emerald)] hover:underline font-semibold pt-1"
            >
              <span>Inspect Card</span>
              <ExternalLink className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}

      {/* Manuscript Content Display Area */}
      <div
        ref={containerRef}
        tabIndex={0}
        aria-label="Manuscript viewer with interactive difficulty highlights"
        className="flex-1 max-h-[640px] overflow-y-auto custom-scrollbar p-6 sm:p-8 focus-visible:outline-none bg-[var(--canvas-card)]"
      >
        <div className="font-editorial-serif text-[17px] sm:text-[18px] leading-[1.9] text-[var(--text-main)] whitespace-pre-wrap selection:bg-[var(--selection-bg)] selection:text-[var(--selection-text)]">
          {segments.map((segment, index) => {
            if (!segment.isDifficult || !segment.difficultSentence) {
              return <span key={index}>{segment.text}</span>;
            }

            const sentence = segment.difficultSentence;
            const isSelected = selectedSentenceId === sentence.id;
            const rank = sentence.rank;

            return (
              <mark
                key={index}
                id={`highlight-${sentence.id}`}
                tabIndex={0}
                role="button"
                aria-pressed={isSelected}
                aria-label={`Sentence rank ${rank} difficult: ${sentence.text}`}
                onClick={() => onSelectSentence(sentence)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectSentence(sentence);
                  }
                }}
                className={`sentence-highlight sentence-highlight-rank-${rank} ${
                  isSelected ? 'sentence-highlight-selected' : ''
                }`}
              >
                {/* Numbered marker tag for non-color accessibility */}
                <span
                  aria-hidden="true"
                  className={`inline-flex items-center justify-center rounded px-1.5 py-0.5 text-[10px] font-bold font-editorial-mono mr-1.5 select-none align-middle shadow-xs ${
                    rankBadgeClasses[rank] || 'bg-neutral-800 text-white'
                  }`}
                >
                  [{rank}]
                </span>
                <span>{segment.text}</span>
              </mark>
            );
          })}
        </div>
      </div>
    </section>
  );
}
