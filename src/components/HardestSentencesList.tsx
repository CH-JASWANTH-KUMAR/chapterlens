'use client';

import React from 'react';
import { DifficultSentence } from '../lib/linguistics/types';
import { SentenceCard } from './SentenceCard';
import { ListFilter, Info, Sparkles } from 'lucide-react';

interface HardestSentencesListProps {
  sentences: DifficultSentence[];
  totalSentencesInText: number;
  selectedSentenceId: string | null;
  onSelectSentence: (sentence: DifficultSentence) => void;
  onOpenRewrite: (sentence: DifficultSentence) => void;
  onOpenGuidedReading?: (sentence: DifficultSentence) => void;
}

export function HardestSentencesList({
  sentences,
  totalSentencesInText,
  selectedSentenceId,
  onSelectSentence,
  onOpenRewrite,
  onOpenGuidedReading,
}: HardestSentencesListProps) {
  return (
    <section aria-labelledby="hardest-sentences-heading" className="space-y-5">
      {/* Header bar */}
      <div className="flex flex-col gap-2 border-b border-[var(--border-subtle)] pb-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--brand-accent-bg)] text-[var(--brand-emerald)] border border-[var(--brand-accent-border)]">
              <ListFilter className="h-4 w-4" />
            </div>
            <div>
              <h3
                id="hardest-sentences-heading"
                className="font-editorial-serif text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-main)]"
              >
                Difficult Sentences Ranked by Friction
              </h3>
            </div>
          </div>

          <span className="rounded-full border border-[var(--brand-accent-border)] bg-[var(--brand-accent-bg)] px-3 py-1 text-xs font-semibold text-[var(--brand-accent-text)]">
            Showing {sentences.length} {sentences.length === 1 ? 'Candidate' : 'Candidates'}
          </span>
        </div>

        <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
          Sentences carrying the highest combined cognitive friction load across word cadence, syllable weight, polysyllabic density, and syntactic fragmentation.
        </p>

        {totalSentencesInText < 5 && (
          <div className="mt-1 flex items-center gap-2 rounded-xl bg-[var(--canvas-card-subtle)] border border-[var(--border-subtle)] px-3 py-2 text-xs text-[var(--text-muted)]">
            <Info className="h-3.5 w-3.5 shrink-0 text-[var(--brand-emerald)]" />
            <span>
              Your chapter contains {totalSentencesInText} sentence{totalSentencesInText === 1 ? '' : 's'}. Showing all available candidates.
            </span>
          </div>
        )}
      </div>

      {/* Responsive Horizontal Card Grid */}
      {sentences.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--border-strong)] p-10 text-center text-sm text-[var(--text-faint)] bg-[var(--canvas-card)]">
          <Sparkles className="mx-auto h-8 w-8 text-[var(--text-faint)] mb-2 opacity-50" />
          <p className="font-semibold text-[var(--text-muted)]">No complex sentences detected.</p>
          <p className="text-xs mt-1">The chapter prose is exceptionally brief or uniformly accessible.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-5 sm:gap-6 items-stretch">
          {sentences.map((sentence) => (
            <SentenceCard
              key={sentence.id}
              sentence={sentence}
              isSelected={selectedSentenceId === sentence.id}
              onSelect={onSelectSentence}
              onOpenRewrite={onOpenRewrite}
              onOpenGuidedReading={onOpenGuidedReading}
            />
          ))}
        </div>
      )}
    </section>
  );
}
