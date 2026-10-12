'use client';

import React from 'react';
import { Gauge, Target, Feather, ArrowDown } from 'lucide-react';
import { BrandLogo } from './BrandLogo';

interface HeroProps {
  onScrollToEditor?: () => void;
}

export function Hero({ onScrollToEditor }: HeroProps) {
  return (
    <section className="relative overflow-hidden pt-8 pb-10 sm:pt-12 sm:pb-12 border-b border-[var(--border-subtle)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center">
          {/* Left Text / Value Proposition */}
          <div className="lg:col-span-7 space-y-5 text-center sm:text-left">
            {/* Unified Editorial Brand Badge */}
            <div className="inline-flex items-center gap-2.5 rounded-full border border-[var(--brand-accent-border)] bg-[var(--brand-accent-bg)] px-3 py-1 text-xs font-semibold text-[var(--brand-accent-text)]">
              <BrandLogo size={18} />
              <span>ChapterLens Editorial Studio · In-Browser Readability</span>
            </div>

            <h1 className="font-editorial-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[var(--text-main)] leading-[1.15]">
              Understand your writing.{' '}
              <span className="italic font-normal text-[var(--brand-forest-light)] underline decoration-[var(--brand-emerald)]/40 decoration-wavy decoration-2">
                Keep your voice
              </span>.
            </h1>

            <p className="max-w-2xl text-base sm:text-lg text-[var(--text-muted)] leading-relaxed font-editorial-sans">
              Evaluate exact Flesch Reading Ease, pinpoint your chapter’s most difficult sentences, and untangle syntactic friction—completely in your browser with zero data transmission.
            </p>

            {/* Three Core Benefits Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--canvas-card)] p-3.5 shadow-editorial-sm transition-all hover:border-[var(--brand-accent-border)] text-left">
                <div className="flex items-center gap-2 text-[var(--brand-forest-light)]">
                  <Gauge className="h-4 w-4 shrink-0 text-[var(--brand-emerald)]" />
                  <h3 className="text-xs font-bold text-[var(--text-main)]">Understand Readability</h3>
                </div>
                <p className="mt-1.5 text-[11px] leading-normal text-[var(--text-faint)]">
                  Flesch Reading Ease scores, grade levels, and target reader bands.
                </p>
              </div>

              <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--canvas-card)] p-3.5 shadow-editorial-sm transition-all hover:border-[var(--brand-accent-border)] text-left">
                <div className="flex items-center gap-2 text-[var(--brand-forest-light)]">
                  <Target className="h-4 w-4 shrink-0 text-[var(--brand-emerald)]" />
                  <h3 className="text-xs font-bold text-[var(--text-main)]">Isolate Hard Sentences</h3>
                </div>
                <p className="mt-1.5 text-[11px] leading-normal text-[var(--text-faint)]">
                  Composite 4-signal ranking reveals exact cognitive friction points.
                </p>
              </div>

              <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--canvas-card)] p-3.5 shadow-editorial-sm transition-all hover:border-[var(--brand-accent-border)] text-left">
                <div className="flex items-center gap-2 text-[var(--brand-forest-light)]">
                  <Feather className="h-4 w-4 shrink-0 text-[var(--brand-emerald)]" />
                  <h3 className="text-xs font-bold text-[var(--text-main)]">Preserve Your Voice</h3>
                </div>
                <p className="mt-1.5 text-[11px] leading-normal text-[var(--text-faint)]">
                  Transparent linguistic mirrors, never algorithmic homogenization.
                </p>
              </div>
            </div>

            {/* Quick Action Button */}
            <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-4">
              <button
                onClick={onScrollToEditor}
                className="inline-flex items-center gap-2 rounded-xl bg-[var(--brand-forest)] px-5 py-2.5 text-xs font-semibold text-white shadow-editorial transition-all hover:bg-[var(--brand-forest-hover)] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-[var(--brand-emerald)]"
              >
                <span>Open Manuscript Editor</span>
                <ArrowDown className="h-3.5 w-3.5 text-[var(--brand-emerald)]" />
              </button>
              <span className="text-xs text-[var(--text-faint)] font-editorial-mono">
                No sign-up · 100% Client-side · Free forever
              </span>
            </div>
          </div>

          {/* Right Column: Restrained Editorial Cadence Spectrum Instrument */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="w-full max-w-md rounded-2xl border border-[var(--border-subtle)] bg-[var(--canvas-card)] p-5 sm:p-6 shadow-editorial transition-colors">
              <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
                <div className="flex items-center gap-2">
                  <BrandLogo size={24} />
                  <span className="font-editorial-serif text-sm font-bold text-[var(--text-main)]">
                    Prose Cadence Diagnostics
                  </span>
                </div>
                <span className="font-editorial-mono text-[10px] font-semibold text-[var(--brand-emerald)] uppercase">
                  Client-Engine
                </span>
              </div>

              {/* Minimal Cadence Spectrum Indicators */}
              <div className="mt-4 space-y-3.5">
                <div>
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-[var(--text-muted)]">Sentence Cadence</span>
                    <span className="font-editorial-mono text-[var(--text-main)]">14–20 words/sent</span>
                  </div>
                  <div className="mt-1.5 h-2 w-full rounded-full bg-[var(--canvas-card-subtle)] overflow-hidden">
                    <div className="h-full w-[65%] rounded-full bg-[var(--brand-emerald)]" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-[var(--text-muted)]">Phonetic Syllable Weight</span>
                    <span className="font-editorial-mono text-[var(--text-main)]">1.3–1.5 syl/word</span>
                  </div>
                  <div className="mt-1.5 h-2 w-full rounded-full bg-[var(--canvas-card-subtle)] overflow-hidden">
                    <div className="h-full w-[45%] rounded-full bg-[var(--brand-emerald)]" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-[var(--text-muted)]">Flesch Reading Ease Spectrum</span>
                    <span className="font-editorial-mono text-[var(--brand-emerald)] font-bold">0 – 100 Ease</span>
                  </div>
                  <div className="mt-1.5 h-2 w-full rounded-full bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-500 opacity-80" />
                </div>
              </div>

              {/* Sample Diagnostic Callout Quote */}
              <div className="mt-4.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--canvas-card-subtle)] p-3 text-xs leading-relaxed">
                <div className="flex items-center gap-1.5 font-semibold text-[var(--text-main)] font-editorial-mono text-[11px] mb-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand-emerald)]" />
                  <span>Objective Diagnostic Mirror</span>
                </div>
                <p className="italic text-[var(--text-muted)] font-editorial-serif">
                  &ldquo;A clockwork heart does not forgive impatience... It measures mortal hours with indifferent geometry.&rdquo;
                </p>
                <div className="mt-1.5 flex items-center justify-between text-[10px] text-[var(--text-faint)] font-editorial-mono">
                  <span>Score: 78.4 · Fairly Easy</span>
                  <span className="text-[var(--brand-emerald)]">Optimal cadence</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
