'use client';

import React, { useEffect, useRef, useMemo } from 'react';
import { DifficultSentence } from '../lib/linguistics/types';
import { ExtractedDocument } from '../lib/document/types';
import { buildTextSegments } from '../lib/linguistics/highlighter';
import { Eye, ExternalLink, BookOpen, Layers } from 'lucide-react';

interface InlineHighlightedTextProps {
  originalText: string;
  difficultSentences: DifficultSentence[];
  selectedSentenceId: string | null;
  onSelectSentence: (sentence: DifficultSentence) => void;
  sourceDoc?: ExtractedDocument | null;
}

export function InlineHighlightedText({
  originalText,
  difficultSentences,
  selectedSentenceId,
  onSelectSentence,
  sourceDoc,
}: InlineHighlightedTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // When selectedSentenceId changes externally, scroll to the highlight
  useEffect(() => {
    if (!selectedSentenceId) return;
    const el = window.document.getElementById(`highlight-${selectedSentenceId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [selectedSentenceId]);

  const segments = buildTextSegments(originalText, difficultSentences);

  const rankBadgeClasses: Record<number, string> = {
    1: 'bg-[var(--highlight-r1-marker)] text-[var(--highlight-r1-marker-text)]',
    2: 'bg-[var(--highlight-r2-marker)] text-[var(--highlight-r2-marker-text)]',
    3: 'bg-[var(--highlight-r3-marker)] text-[var(--highlight-r3-marker-text)]',
    4: 'bg-[var(--highlight-r4-marker)] text-[var(--highlight-r4-marker-text)]',
    5: 'bg-[var(--highlight-r5-marker)] text-[var(--highlight-r5-marker-text)]',
  };

  const selectedSentence = difficultSentences.find((s) => s.id === selectedSentenceId);

  // Map starting character offsets to structural page breaks or section headings
  const structuralMarkers = useMemo(() => {
    if (!sourceDoc || !sourceDoc.blocks) return new Map<number, { pageNumber?: number; heading?: string; level?: number }>();
    const map = new Map<number, { pageNumber?: number; heading?: string; level?: number }>();
    let lastPage = 1;

    for (const block of sourceDoc.blocks) {
      if (block.pageNumber && block.pageNumber > 1 && block.pageNumber !== lastPage) {
        map.set(block.startIndex, { pageNumber: block.pageNumber });
        lastPage = block.pageNumber;
      } else if (block.type === 'heading') {
        map.set(block.startIndex, { heading: block.text, level: block.level });
      }
    }
    return map;
  }, [sourceDoc]);

  return (
    <section
      aria-labelledby="manuscript-preview-heading"
      className="flex flex-col w-full rounded-2xl border border-[var(--border-subtle)] bg-[var(--canvas-card)] shadow-editorial transition-all duration-200 overflow-hidden"
    >
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border-subtle)] px-6 py-4 bg-[var(--canvas-card-subtle)]">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--brand-accent-bg)] text-[var(--brand-emerald)] border border-[var(--brand-accent-border)]">
            <Eye className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3
                id="manuscript-preview-heading"
                className="font-editorial-serif text-lg sm:text-xl font-bold tracking-tight text-[var(--text-main)]"
              >
                Manuscript Inspector
              </h3>
              {sourceDoc && sourceDoc.fileName && (
                <span className="hidden sm:inline-flex items-center gap-1 rounded-md border border-[var(--border-subtle)] bg-[var(--canvas-card)] px-2 py-0.5 text-[10px] font-semibold text-[var(--text-muted)] font-editorial-mono">
                  {sourceDoc.pageCount ? (
                    <BookOpen className="h-3 w-3 text-[var(--brand-emerald)]" />
                  ) : (
                    <Layers className="h-3 w-3 text-[var(--brand-emerald)]" />
                  )}
                  <span className="truncate max-w-[160px]">{sourceDoc.fileName}</span>
                  {sourceDoc.pageCount && <span>· {sourceDoc.pageCount}p</span>}
                </span>
              )}
            </div>
            <p className="text-xs text-[var(--text-faint)]">
              Exact verbatim text with character-preserved friction pinpoints.
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-2 text-[11px] text-[var(--text-muted)]">
          <span className="font-semibold text-[var(--text-main)] font-editorial-mono">Friction:</span>
          <span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold border border-[var(--highlight-r1-border)] bg-[var(--highlight-r1-bg)] text-[var(--highlight-r1-border)]">
            [1] Highest
          </span>
          <span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold border border-[var(--highlight-r2-border)] bg-[var(--highlight-r2-bg)] text-[var(--highlight-r2-border)]">
            [2-3] Heavy
          </span>
          <span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold border border-[var(--highlight-r4-border)] bg-[var(--highlight-r4-bg)] text-[var(--highlight-r4-border)]">
            [4-5] Moderate
          </span>
        </div>
      </div>

      {/* Selected sentence quick inspector banner */}
      {selectedSentence && (
        <div className="border-b border-[var(--border-subtle)] bg-[var(--brand-accent-bg)]/60 px-6 py-3 transition-all duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold shadow-xs select-none ${
                    rankBadgeClasses[selectedSentence.rank]
                  }`}
                >
                  {selectedSentence.rank}
                </span>
                <span className="text-xs font-bold text-[var(--text-main)]">
                  Active Sentence #{selectedSentence.rank} Focus
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
              className="shrink-0 inline-flex items-center gap-1.5 text-xs text-[var(--brand-emerald)] hover:underline font-semibold"
            >
              <span>Jump to Sentence Card</span>
              <ExternalLink className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}

      {/* Manuscript Content Display Area (Full Width, comfortable reading line length) */}
      <div
        ref={containerRef}
        tabIndex={0}
        aria-label="Manuscript viewer with interactive difficulty highlights"
        className="max-h-[580px] overflow-y-auto custom-scrollbar p-6 sm:p-8 lg:p-10 focus-visible:outline-none bg-[var(--canvas-card)]"
      >
        <div className="max-w-4xl mx-auto font-editorial-serif text-[17px] sm:text-[18px] leading-[1.9] text-[var(--text-main)] whitespace-pre-wrap selection:bg-[var(--selection-bg)] selection:text-[var(--selection-text)]">
          {segments.map((segment, index) => {
            const marker = structuralMarkers.get(segment.startIndex);
            const markerElement = marker ? (
              marker.pageNumber ? (
                <div
                  key={`page-${marker.pageNumber}-${index}`}
                  className="my-6 flex items-center gap-3 select-none text-[11px] font-editorial-mono text-[var(--text-faint)]"
                >
                  <div className="h-px flex-1 bg-[var(--border-subtle)]" />
                  <span className="rounded-full border border-[var(--border-subtle)] bg-[var(--canvas-card-subtle)] px-3 py-0.5">
                    Page {marker.pageNumber}
                  </span>
                  <div className="h-px flex-1 bg-[var(--border-subtle)]" />
                </div>
              ) : marker.heading ? (
                <div
                  key={`heading-${index}`}
                  className="mt-6 mb-2 text-xs font-editorial-mono text-[var(--brand-emerald)] font-bold uppercase tracking-wider select-none"
                >
                  § {marker.heading}
                </div>
              ) : null
            ) : null;

            if (!segment.isDifficult || !segment.difficultSentence) {
              return (
                <React.Fragment key={index}>
                  {markerElement}
                  <span>{segment.text}</span>
                </React.Fragment>
              );
            }

            const sentence = segment.difficultSentence;
            const isSelected = selectedSentenceId === sentence.id;
            const rank = sentence.rank;

            return (
              <React.Fragment key={index}>
                {markerElement}
                <mark
                  id={`highlight-${sentence.id}`}
                  tabIndex={0}
                  role="button"
                  aria-pressed={isSelected}
                  aria-label={`Sentence rank ${rank} difficult: ${sentence.text}`}
                  onClick={() => {
                    onSelectSentence(sentence);
                    const card = document.getElementById(`card-${sentence.id}`);
                    card?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelectSentence(sentence);
                      const card = document.getElementById(`card-${sentence.id}`);
                      card?.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </section>
  );
}
