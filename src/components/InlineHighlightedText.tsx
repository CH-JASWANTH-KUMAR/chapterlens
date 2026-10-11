'use client';

import React, { useEffect, useRef } from 'react';
import { DifficultSentence } from '../lib/linguistics/types';
import { buildTextSegments } from '../lib/linguistics/highlighter';
import { Sparkles, Eye, Info } from 'lucide-react';

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

  // When selectedSentenceId changes externally (e.g. clicked in list), scroll to highlight
  useEffect(() => {
    if (!selectedSentenceId) return;
    const el = document.getElementById(`highlight-${selectedSentenceId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [selectedSentenceId]);

  const segments = buildTextSegments(originalText, difficultSentences);

  const rankBadgeClasses: Record<number, string> = {
    1: 'bg-[#C2632B] text-white',
    2: 'bg-[#D47A40] text-white',
    3: 'bg-[#DDA248] text-[#1C1E1D]',
    4: 'bg-[#537562] text-white',
    5: 'bg-[#799C87] text-white',
  };

  const selectedSentence = difficultSentences.find((s) => s.id === selectedSentenceId);

  return (
    <section
      aria-labelledby="manuscript-preview-heading"
      className="flex flex-col rounded-xl border border-[#E6E4D9] bg-white shadow-sm transition-all"
    >
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#F0EFEA] px-6 py-4">
        <div>
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-[#1A3C2D]" />
            <h3
              id="manuscript-preview-heading"
              className="font-editorial-serif text-lg font-bold tracking-tight text-[#1C1E1D]"
            >
              Manuscript Highlighting
            </h3>
          </div>
          <p className="text-xs text-[#5E6460]">
            Exact character-preserved original text. Difficult sentences are marked with numbered pins and contrast bands.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 text-[11px] text-[#5E6460]">
          <span className="font-semibold text-[#1C1E1D]">Legend:</span>
          <span className="inline-flex items-center gap-1 rounded bg-[#FDF4ED] px-1.5 py-0.5 text-[#C2632B] border border-[#F3CBB3]">
            <span className="font-bold">[1]</span> Highest Friction
          </span>
          <span className="inline-flex items-center gap-1 rounded bg-[#EBF1ED] px-1.5 py-0.5 text-[#1A3C2D] border border-[#CBD9D0]">
            <span className="font-bold">[4-5]</span> Moderate
          </span>
        </div>
      </div>

      {/* Selected sentence quick inspector callout */}
      {selectedSentence && (
        <div className="border-b border-[#E6E4D9] bg-[#FBFBF9] px-6 py-3 transition-all">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold ${
                    rankBadgeClasses[selectedSentence.rank]
                  }`}
                >
                  {selectedSentence.rank}
                </span>
                <span className="text-xs font-bold text-[#1C1E1D]">
                  Sentence #{selectedSentence.rank} Focus
                </span>
                <span className="text-xs text-[#7A817D]">
                  ({selectedSentence.signals.wordCount} words, {selectedSentence.signals.polysyllabicWordCount} complex words)
                </span>
              </div>
              <p className="text-xs text-[#424744] italic">
                {selectedSentence.explanation}
              </p>
            </div>
            <button
              onClick={() => onSelectSentence(selectedSentence)}
              className="shrink-0 text-xs text-[#1A3C2D] hover:underline font-medium"
            >
              View Full Metrics
            </button>
          </div>
        </div>
      )}

      {/* Manuscript Content Display */}
      <div
        ref={containerRef}
        tabIndex={0}
        aria-label="Manuscript viewer with inline difficulty highlights"
        className="max-h-[600px] overflow-y-auto px-6 py-6 sm:px-8 sm:py-8 focus-visible:outline-none"
      >
        <div className="font-editorial-serif text-[17px] leading-[1.85] text-[#2C302E] whitespace-pre-wrap selection:bg-[#DDE8E0]">
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
                  className={`inline-flex items-center justify-center rounded px-1 py-0.5 text-[10px] font-bold font-editorial-mono mr-1 select-none align-middle shadow-xs ${
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
