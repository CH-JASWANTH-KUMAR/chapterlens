'use client';

import React from 'react';
import { DifficultSentence } from '../lib/linguistics/types';
import { SentenceCard } from './SentenceCard';
import { ListFilter, Info } from 'lucide-react';

interface HardestSentencesListProps {
  sentences: DifficultSentence[];
  totalSentencesInText: number;
  selectedSentenceId: string | null;
  onSelectSentence: (sentence: DifficultSentence) => void;
  onOpenRewrite: (sentence: DifficultSentence) => void;
}

export function HardestSentencesList({
  sentences,
  totalSentencesInText,
  selectedSentenceId,
  onSelectSentence,
  onOpenRewrite,
}: HardestSentencesListProps) {
  return (
    <section aria-labelledby="hardest-sentences-heading" className="space-y-4">
      <div className="flex flex-col gap-1 border-b border-[#E6E4D9] pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ListFilter className="h-5 w-5 text-[#1A3C2D]" />
            <h3
              id="hardest-sentences-heading"
              className="font-editorial-serif text-xl font-bold tracking-tight text-[#1C1E1D]"
            >
              The {sentences.length} Most Difficult Sentences
            </h3>
          </div>
          <span className="rounded-full bg-[#EBF1ED] px-2.5 py-0.5 text-xs font-semibold text-[#1A3C2D]">
            Ranked by Cognitive Friction
          </span>
        </div>

        <p className="text-xs text-[#5E6460]">
          These sentences exhibit the highest combination of word count, polysyllabic density, and syntactic fragmentation.
        </p>

        {totalSentencesInText < 5 && (
          <div className="mt-2 flex items-center gap-1.5 rounded-md bg-[#F5F4EE] px-3 py-1.5 text-xs text-[#5E6460]">
            <Info className="h-3.5 w-3.5 shrink-0 text-[#537562]" />
            <span>
              Your chapter contains {totalSentencesInText} sentence{totalSentencesInText === 1 ? '' : 's'}. Showing all available candidates.
            </span>
          </div>
        )}
      </div>

      {sentences.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#CDC9B8] p-8 text-center text-sm text-[#7A817D]">
          No complex sentences detected. The chapter text is exceptionally brief or homogenous.
        </div>
      ) : (
        <div className="space-y-4">
          {sentences.map((sentence) => (
            <SentenceCard
              key={sentence.id}
              sentence={sentence}
              isSelected={selectedSentenceId === sentence.id}
              onSelect={onSelectSentence}
              onOpenRewrite={onOpenRewrite}
            />
          ))}
        </div>
      )}
    </section>
  );
}
