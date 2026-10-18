'use client';

import React from 'react';
import { AnalysisResult } from '../lib/linguistics/types';
import { Clock, BookText, Layers, FileText, AlertTriangle, CheckCircle2, Award } from 'lucide-react';

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

  // Compute circular meter stroke dashoffset (circumference = 2 * PI * 44 ≈ 276.46)
  const scorePercent = Math.min(100, Math.max(0, clampedScore));
  const circumference = 276.46;
  const strokeDashoffset = circumference - (circumference * scorePercent) / 100;

  const getBandBadgeClass = (label: string) => {
    switch (label) {
      case 'Very easy':
      case 'Easy':
        return 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800';
      case 'Fairly easy':
        return 'bg-teal-50 text-teal-800 border-teal-300 dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-800';
      case 'Standard':
        return 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800/80 dark:text-slate-200 dark:border-slate-700';
      case 'Fairly difficult':
        return 'bg-amber-50 text-amber-900 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800';
      case 'Difficult':
        return 'bg-orange-50 text-orange-900 border-orange-300 dark:bg-orange-950/60 dark:text-orange-300 dark:border-orange-800';
      case 'Very difficult':
        return 'bg-rose-50 text-rose-900 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800';
      default:
        return 'bg-neutral-100 text-neutral-800 border-neutral-300 dark:bg-neutral-800 dark:text-neutral-200';
    }
  };

  return (
    <section
      aria-labelledby="readability-summary-heading"
      className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--canvas-card)] p-6 sm:p-8 shadow-editorial transition-all duration-200"
    >
      {/* Header bar with diagnostic classification and reliability status */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between border-b border-[var(--border-subtle)] pb-6">
        <div>
          <span className="text-[11px] font-semibold tracking-wider uppercase text-[var(--brand-emerald)]">
            Linguistic Cadence Diagnostic
          </span>
          <h2
            id="readability-summary-heading"
            className="font-editorial-serif text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-main)]"
          >
            Chapter Readability Score
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-[var(--text-muted)]">
            Exact Rudolf Flesch formula balancing average sentence cadence against phonetic syllable weight.
          </p>

          {analysis.sourceDocument && (
            <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs text-[var(--text-muted)] font-editorial-mono">
              <span className="rounded-md border border-[var(--brand-accent-border)] bg-[var(--brand-accent-bg)] px-2 py-0.5 font-semibold text-[var(--brand-accent-text)]">
                Document: {analysis.sourceDocument.fileName}
              </span>
              {analysis.sourceDocument.isSample && (
                <span className="rounded-md border border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/40 px-2 py-0.5 text-[11px] font-bold text-amber-800 dark:text-amber-300">
                  🧪 Sample Document
                </span>
              )}
              {analysis.sourceDocument.pageCount && (
                <span>• {analysis.sourceDocument.pageCount} Pages</span>
              )}
              <span className="uppercase text-[10px] text-[var(--text-faint)]">
                ({analysis.sourceDocument.format})
              </span>
            </div>
          )}
        </div>

        {/* Statistical Reliability Pill */}
        <div className="flex items-center gap-2 shrink-0">
          {isStatisticallyReliable ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--brand-accent-border)] bg-[var(--brand-accent-bg)] px-3 py-1 text-xs font-semibold text-[var(--brand-accent-text)]">
              <CheckCircle2 className="h-3.5 w-3.5 text-[var(--brand-emerald)]" />
              <span>Statistically Reliable</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 dark:bg-amber-950/40 dark:border-amber-800 px-3 py-1 text-xs font-semibold text-amber-800 dark:text-amber-300">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
              <span>Short Sample Notice</span>
            </span>
          )}
        </div>
      </div>

      {/* Reliability warning notice if sample size is short */}
      {reliabilityNotice && (
        <div
          role="alert"
          className="mt-4 flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50/80 dark:bg-amber-950/30 dark:border-amber-800 p-3.5 text-xs text-amber-900 dark:text-amber-200"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <div className="leading-relaxed">
            <strong className="font-semibold">Sample Size Consideration:</strong> {reliabilityNotice}
          </div>
        </div>
      )}

      {/* Main Score & Interpretation Grid */}
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center">
        {/* Score Dial / Visual Gauge */}
        <div className="flex flex-col items-center justify-center lg:col-span-4 border-b lg:border-b-0 lg:border-r border-[var(--border-subtle)] pb-6 lg:pb-0 lg:pr-8">
          <div className="relative flex h-40 w-40 items-center justify-center">
            {/* SVG circular meter */}
            <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 100 100" aria-hidden="true">
              {/* Background Track */}
              <circle
                cx="50"
                cy="50"
                r="44"
                stroke="currentColor"
                strokeWidth="7"
                fill="none"
                className="text-[var(--border-subtle)]"
              />
              {/* Progress Stroke */}
              <circle
                cx="50"
                cy="50"
                r="44"
                stroke={band.color}
                strokeWidth="7"
                strokeDasharray="276.46"
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="none"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="font-editorial-serif text-4xl sm:text-5xl font-extrabold tracking-tight text-[var(--text-main)]">
                {clampedScore}
              </span>
              <span className="font-editorial-mono text-[10px] font-bold uppercase tracking-wider text-[var(--text-faint)]">
                out of 100
              </span>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-1.5 text-xs text-[var(--text-faint)]">
            <span>Raw mathematical index:</span>
            <span className="font-editorial-mono font-bold text-[var(--text-main)]">
              {rawFleschScore}
            </span>
          </div>
        </div>

        {/* Plain Language Interpretation */}
        <div className="lg:col-span-8 flex flex-col justify-center space-y-4">
          <div className="flex flex-wrap items-center gap-2.5">
            <span
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1 text-sm font-bold tracking-tight ${getBandBadgeClass(
                band.label
              )}`}
            >
              <Award className="h-4 w-4" />
              <span>{band.label}</span>
            </span>
            <span className="rounded-lg border border-[var(--border-subtle)] bg-[var(--canvas-card-subtle)] px-2.5 py-1 text-xs font-semibold text-[var(--text-muted)] font-editorial-mono">
              {band.gradeLevel}
            </span>
          </div>

          <p className="font-editorial-serif text-lg sm:text-xl leading-relaxed text-[var(--text-main)]">
            {band.summary}
          </p>

          <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--canvas-card-subtle)] p-3.5 text-xs text-[var(--text-muted)]">
            <strong className="text-[var(--text-main)]">Target Readership Profile:</strong>{' '}
            {band.targetAudience}
          </div>
        </div>
      </div>

      {/* Chapter Statistics Grid */}
      <div className="mt-8 border-t border-[var(--border-subtle)] pt-6">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-faint)] font-editorial-mono">
          Core Manuscript Metrics
        </h3>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--canvas-card-subtle)] p-3.5 text-center sm:text-left transition-colors hover:border-[var(--border-strong)]">
            <div className="flex items-center justify-center sm:justify-start gap-1.5 text-[var(--text-faint)]">
              <FileText className="h-3.5 w-3.5 text-[var(--brand-emerald)]" />
              <span className="text-xs font-medium">Total Words</span>
            </div>
            <div className="mt-1 font-editorial-serif text-xl sm:text-2xl font-bold text-[var(--text-main)]">
              {totalWords.toLocaleString()}
            </div>
          </div>

          <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--canvas-card-subtle)] p-3.5 text-center sm:text-left transition-colors hover:border-[var(--border-strong)]">
            <div className="flex items-center justify-center sm:justify-start gap-1.5 text-[var(--text-faint)]">
              <BookText className="h-3.5 w-3.5 text-[var(--brand-emerald)]" />
              <span className="text-xs font-medium">Sentences</span>
            </div>
            <div className="mt-1 font-editorial-serif text-xl sm:text-2xl font-bold text-[var(--text-main)]">
              {totalSentences.toLocaleString()}
            </div>
          </div>

          <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--canvas-card-subtle)] p-3.5 text-center sm:text-left transition-colors hover:border-[var(--border-strong)]">
            <div className="flex items-center justify-center sm:justify-start gap-1.5 text-[var(--text-faint)]">
              <Layers className="h-3.5 w-3.5 text-[var(--brand-emerald)]" />
              <span className="text-xs font-medium">Paragraphs</span>
            </div>
            <div className="mt-1 font-editorial-serif text-xl sm:text-2xl font-bold text-[var(--text-main)]">
              {totalParagraphs.toLocaleString()}
            </div>
          </div>

          <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--canvas-card-subtle)] p-3.5 text-center sm:text-left transition-colors hover:border-[var(--border-strong)]">
            <div className="flex items-center justify-center sm:justify-start gap-1.5 text-[var(--text-faint)]">
              <span className="text-xs font-medium">Avg Words/Sent</span>
            </div>
            <div className="mt-1 font-editorial-serif text-xl sm:text-2xl font-bold text-[var(--text-main)]">
              {averageWordsPerSentence}
            </div>
            <span className="text-[10px] text-[var(--text-faint)] font-editorial-mono">Target: 14–20</span>
          </div>

          <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--canvas-card-subtle)] p-3.5 text-center sm:text-left transition-colors hover:border-[var(--border-strong)]">
            <div className="flex items-center justify-center sm:justify-start gap-1.5 text-[var(--text-faint)]">
              <span className="text-xs font-medium">Avg Syl/Word</span>
            </div>
            <div className="mt-1 font-editorial-serif text-xl sm:text-2xl font-bold text-[var(--text-main)]">
              {averageSyllablesPerWord}
            </div>
            <span className="text-[10px] text-[var(--text-faint)] font-editorial-mono">Target: 1.3–1.5</span>
          </div>

          <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--canvas-card-subtle)] p-3.5 text-center sm:text-left transition-colors hover:border-[var(--border-strong)]">
            <div className="flex items-center justify-center sm:justify-start gap-1.5 text-[var(--text-faint)]">
              <Clock className="h-3.5 w-3.5 text-[var(--brand-emerald)]" />
              <span className="text-xs font-medium">Reading Time</span>
            </div>
            <div className="mt-1 font-editorial-serif text-xl sm:text-2xl font-bold text-[var(--text-main)]">
              ~{estimatedReadingTimeMinutes} min
            </div>
            <span className="text-[10px] text-[var(--text-faint)] font-editorial-mono">@ 220 wpm</span>
          </div>
        </div>
      </div>
    </section>
  );
}
