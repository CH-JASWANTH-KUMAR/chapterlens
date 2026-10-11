'use client';

import React, { useState } from 'react';
import { DifficultSentence } from '../lib/linguistics/types';
import { Copy, Check, Eye, Wand2, HelpCircle } from 'lucide-react';

interface SentenceCardProps {
  sentence: DifficultSentence;
  isSelected: boolean;
  onSelect: (sentence: DifficultSentence) => void;
  onOpenRewrite: (sentence: DifficultSentence) => void;
}

export function SentenceCard({
  sentence,
  isSelected,
  onSelect,
  onOpenRewrite,
}: SentenceCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(sentence.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const rankBadgeStyles: Record<number, string> = {
    1: 'bg-[#C2632B] text-white',
    2: 'bg-[#D47A40] text-white',
    3: 'bg-[#DDA248] text-[#1C1E1D]',
    4: 'bg-[#537562] text-white',
    5: 'bg-[#799C87] text-white',
  };

  const primaryIssueLabels: Record<string, { label: string; badge: string }> = {
    length: { label: 'Sentence Length', badge: 'bg-amber-100 text-amber-900 border-amber-200' },
    vocabulary: { label: 'Vocabulary Density', badge: 'bg-purple-100 text-purple-900 border-purple-200' },
    structure: { label: 'Clause Structure', badge: 'bg-blue-100 text-blue-900 border-blue-200' },
    combination: { label: 'Compound Complexity', badge: 'bg-rose-100 text-rose-900 border-rose-200' },
  };

  const issueInfo = primaryIssueLabels[sentence.primaryIssue] || primaryIssueLabels.combination;

  return (
    <article
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
      className={`group relative rounded-xl border p-5 transition-all text-left outline-none cursor-pointer ${
        isSelected
          ? 'border-[#1A3C2D] bg-[#F9FAF8] shadow-md ring-2 ring-[#1A3C2D]/20'
          : 'border-[#E6E4D9] bg-white hover:border-[#CDC9B8] hover:shadow-xs'
      }`}
    >
      {/* Header: Rank + Primary Issue Badge */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#F0EFEA] pb-3">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold shadow-xs ${
              rankBadgeStyles[sentence.rank] || 'bg-neutral-800 text-white'
            }`}
          >
            {sentence.rank}
          </span>
          <span className="font-editorial-sans text-xs font-semibold text-[#1C1E1D]">
            Rank #{sentence.rank} Difficulty
          </span>
          <span className="text-xs text-[#7A817D]">
            Score: <strong className="font-editorial-mono text-[#2C302E]">{sentence.difficultyScore}</strong>
          </span>
        </div>

        <span
          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${issueInfo.badge}`}
        >
          {issueInfo.label}
        </span>
      </div>

      {/* Original Sentence Quote */}
      <div className="mt-4">
        <blockquote className="font-editorial-serif text-[15px] italic leading-relaxed text-[#1C1E1D] border-l-2 border-[#537562]/30 pl-3.5">
          “{sentence.text}”
        </blockquote>
      </div>

      {/* Honest Diagnostic Explanation */}
      <div className="mt-3.5 rounded-lg bg-[#F5F4EE] p-3 text-xs text-[#424744]">
        <p className="leading-normal">
          <strong className="text-[#1C1E1D]">Diagnostic:</strong> {sentence.explanation}
        </p>
      </div>

      {/* Contributing Signals Breakdown */}
      <div className="mt-3.5 grid grid-cols-2 gap-2 sm:grid-cols-4 text-[11px] text-[#5E6460]">
        <div className="rounded border border-[#E6E4D9] bg-white px-2 py-1">
          <span className="text-[#7A817D]">Words: </span>
          <strong className="text-[#1C1E1D]">{sentence.signals.wordCount}</strong>
        </div>
        <div className="rounded border border-[#E6E4D9] bg-white px-2 py-1">
          <span className="text-[#7A817D]">Syl/word: </span>
          <strong className="text-[#1C1E1D]">{sentence.signals.avgSyllablesPerWord}</strong>
        </div>
        <div className="rounded border border-[#E6E4D9] bg-white px-2 py-1">
          <span className="text-[#7A817D]">Complex words (3+ syl): </span>
          <strong className="text-[#1C1E1D]">{sentence.signals.polysyllabicWordCount}</strong>
        </div>
        <div className="rounded border border-[#E6E4D9] bg-white px-2 py-1">
          <span className="text-[#7A817D]">Punctuation marks: </span>
          <strong className="text-[#1C1E1D]">{sentence.signals.complexPunctuationCount}</strong>
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-[#F0EFEA] pt-3">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSelect(sentence);
          }}
          className="inline-flex items-center gap-1.5 rounded-md border border-[#CDC9B8] bg-white px-2.5 py-1 text-xs font-medium text-[#424744] hover:bg-[#F5F4EE] hover:text-[#1A3C2D] focus-visible:ring-2 focus-visible:ring-[#1A3C2D]"
        >
          <Eye className="h-3.5 w-3.5 text-[#537562]" />
          <span>{isSelected ? 'Focused in Manuscript' : 'Locate in Text'}</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1 rounded-md border border-[#CDC9B8] bg-white px-2.5 py-1 text-xs font-medium text-[#424744] hover:bg-[#F5F4EE] hover:text-[#1A3C2D] focus-visible:ring-2 focus-visible:ring-[#1A3C2D]"
            aria-label="Copy original sentence to clipboard"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-600" />
                <span className="text-emerald-700">Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenRewrite(sentence);
            }}
            className="inline-flex items-center gap-1.5 rounded-md bg-[#1A3C2D] px-2.5 py-1 text-xs font-semibold text-white shadow-xs hover:bg-[#122B20] focus-visible:ring-2 focus-visible:ring-[#1A3C2D]"
            aria-label="Open rewrite assistance for this sentence"
          >
            <Wand2 className="h-3.5 w-3.5 text-[#EBF1ED]" />
            <span>Simplify / Rewrite</span>
          </button>
        </div>
      </div>
    </article>
  );
}
