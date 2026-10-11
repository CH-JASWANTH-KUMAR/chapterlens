'use client';

import React from 'react';
import { AnalysisResult } from '../lib/linguistics/types';
import { Clock, BookText, HelpCircle, Layers, FileText, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface ScoreCardProps {
  analysis: AnalysisResult;
}

export function ScoreCard({ analysis }: ScoreCardProps) {
  const {
    clampedScore,
    rawFleschScore,
    band,
    totalWords,
    totalSentences,
    totalParagraphs,
    averageWordsPerSentence,
    averageSyllablesPerWord,
    estimatedReadingTimeMinutes,
    isStatisticallyReliable,
    reliabilityNotice,
  } = analysis;

  // Compute a circular progress stroke dash offset or score gauge
  const scorePercent = Math.min(100, Math.max(0, clampedScore));
  const strokeDashoffset = 283 - (283 * scorePercent) / 100;

  return (
    <section
      aria-labelledby="readability-summary-heading"
      className="rounded-xl border border-[#E6E4D9] bg-white p-6 shadow-sm transition-all sm:p-8"
    >
      {/* Header with Title and Reliability Notice */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between border-b border-[#F0EFEA] pb-6">
        <div>
          <span className="text-[11px] font-semibold tracking-wider uppercase text-[#537562]">
            Flesch Reading Ease Diagnostic
          </span>
          <h2
            id="readability-summary-heading"
            className="font-editorial-serif text-2xl font-bold tracking-tight text-[#1C1E1D] sm:text-3xl"
          >
            Chapter Readability Score
          </h2>
          <p className="mt-1 text-sm text-[#5E6460]">
            Calculated mathematically using sentence cadence, word length, and phonetic syllable counts.
          </p>
        </div>

        {/* Live Timestamp & Reliability Status */}
        <div className="flex items-center gap-2">
          {isStatisticallyReliable ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#EBF1ED] px-2.5 py-1 text-xs font-medium text-[#1A3C2D]">
              <CheckCircle2 className="h-3.5 w-3.5 text-[#1A3C2D]" />
              Reliable Sample
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#FDF4ED] px-2.5 py-1 text-xs font-medium text-[#C2632B]">
              <AlertTriangle className="h-3.5 w-3.5 text-[#C2632B]" />
              Short Sample
            </span>
          )}
        </div>
      </div>

      {/* Warning Notice if sample is short */}
      {reliabilityNotice && (
        <div
          role="alert"
          className="mt-4 flex items-start gap-3 rounded-lg border border-[#F3CBB3] bg-[#FDF4ED] p-3 text-xs text-[#8A3B14]"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#C2632B]" />
          <div>
            <strong className="font-semibold">Notice on Sample Size:</strong> {reliabilityNotice}
          </div>
        </div>
      )}

      {/* Main Score Display and Interpretation */}
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center">
        {/* Score Dial / Visual Gauge */}
        <div className="flex flex-col items-center justify-center lg:col-span-4 border-b lg:border-b-0 lg:border-r border-[#F0EFEA] pb-6 lg:pb-0 lg:pr-8">
          <div className="relative flex h-36 w-36 items-center justify-center">
            {/* SVG circular meter */}
            <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="44"
                stroke="#F2EFE8"
                strokeWidth="7"
                fill="none"
              />
              <circle
                cx="50"
                cy="50"
                r="44"
                stroke={band.color}
                strokeWidth="7"
                strokeDasharray="283"
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="none"
                className="transition-all duration-700 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="font-editorial-serif text-4xl font-extrabold tracking-tight text-[#1C1E1D]">
                {clampedScore}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A817D]">
                out of 100
              </span>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-1.5 text-xs text-[#7A817D]">
            <span>Raw mathematical score:</span>
            <span className="font-editorial-mono font-medium text-[#2C302E]">
              {rawFleschScore}
            </span>
          </div>
        </div>

        {/* Plain Language Interpretation */}
        <div className="lg:col-span-8 flex flex-col justify-center space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center rounded-md border px-3 py-1 text-sm font-bold tracking-tight ${band.badgeClass}`}
            >
              {band.label}
            </span>
            <span className="rounded-md border border-[#E6E4D9] bg-[#FBFBF9] px-2.5 py-1 text-xs font-semibold text-[#424744]">
              {band.gradeLevel}
            </span>
          </div>

          <p className="font-editorial-serif text-lg leading-snug text-[#1C1E1D]">
            {band.summary}
          </p>

          <p className="text-xs text-[#5E6460]">
            <strong className="text-[#2C302E]">Expected Readership:</strong> {band.targetAudience}
          </p>
        </div>
      </div>

      {/* Chapter Statistics Grid */}
      <div className="mt-8 border-t border-[#F0EFEA] pt-6">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[#7A817D]">
          Key Chapter Statistics
        </h3>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <div className="rounded-lg border border-[#E6E4D9] bg-[#FBFBF9] p-3 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-1.5 text-[#7A817D]">
              <FileText className="h-3.5 w-3.5 text-[#537562]" />
              <span className="text-xs font-medium">Total Words</span>
            </div>
            <div className="mt-1 font-editorial-serif text-xl font-bold text-[#1C1E1D]">
              {totalWords.toLocaleString()}
            </div>
          </div>

          <div className="rounded-lg border border-[#E6E4D9] bg-[#FBFBF9] p-3 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-1.5 text-[#7A817D]">
              <BookText className="h-3.5 w-3.5 text-[#537562]" />
              <span className="text-xs font-medium">Sentences</span>
            </div>
            <div className="mt-1 font-editorial-serif text-xl font-bold text-[#1C1E1D]">
              {totalSentences.toLocaleString()}
            </div>
          </div>

          <div className="rounded-lg border border-[#E6E4D9] bg-[#FBFBF9] p-3 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-1.5 text-[#7A817D]">
              <Layers className="h-3.5 w-3.5 text-[#537562]" />
              <span className="text-xs font-medium">Paragraphs</span>
            </div>
            <div className="mt-1 font-editorial-serif text-xl font-bold text-[#1C1E1D]">
              {totalParagraphs.toLocaleString()}
            </div>
          </div>

          <div className="rounded-lg border border-[#E6E4D9] bg-[#FBFBF9] p-3 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-1.5 text-[#7A817D]">
              <span className="text-xs font-medium">Avg Words/Sent</span>
            </div>
            <div className="mt-1 font-editorial-serif text-xl font-bold text-[#1C1E1D]">
              {averageWordsPerSentence}
            </div>
            <span className="text-[10px] text-[#7A817D]">Target: 14–20</span>
          </div>

          <div className="rounded-lg border border-[#E6E4D9] bg-[#FBFBF9] p-3 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-1.5 text-[#7A817D]">
              <span className="text-xs font-medium">Avg Syl/Word</span>
            </div>
            <div className="mt-1 font-editorial-serif text-xl font-bold text-[#1C1E1D]">
              {averageSyllablesPerWord}
            </div>
            <span className="text-[10px] text-[#7A817D]">Target: 1.3–1.5</span>
          </div>

          <div className="rounded-lg border border-[#E6E4D9] bg-[#FBFBF9] p-3 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-1.5 text-[#7A817D]">
              <Clock className="h-3.5 w-3.5 text-[#537562]" />
              <span className="text-xs font-medium">Reading Time</span>
            </div>
            <div className="mt-1 font-editorial-serif text-xl font-bold text-[#1C1E1D]">
              ~{estimatedReadingTimeMinutes} min
            </div>
            <span className="text-[10px] text-[#7A817D]">@ 220 wpm</span>
          </div>
        </div>
      </div>
    </section>
  );
}
