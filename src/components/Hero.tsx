'use client';

import React from 'react';
import { Gauge, Target, Feather, ArrowDown } from 'lucide-react';

interface HeroProps {
  onScrollToEditor?: () => void;
}

export function Hero({ onScrollToEditor }: HeroProps) {
  return (
    <section className="relative overflow-hidden pt-8 pb-10 sm:pt-12 sm:pb-14 border-b border-[var(--border-subtle)]/70">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-center">
          {/* Left Text / Value Proposition */}
          <div className="lg:col-span-7 space-y-6 text-center sm:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--brand-accent-border)] bg-[var(--brand-accent-bg)] px-3 py-1 text-xs font-semibold text-[var(--brand-accent-text)]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--brand-emerald)] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--brand-emerald)]"></span>
              </span>
              <span>Client-Side Editorial Workspace for Authors</span>
            </div>

            <h1 className="font-editorial-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[var(--text-main)] leading-[1.15]">
              Editorial clarity meets{' '}
              <span className="italic font-normal text-[var(--brand-forest-light)] underline decoration-[var(--brand-emerald)]/40 decoration-wavy decoration-2">
                authorial voice
              </span>.
            </h1>

            <p className="max-w-2xl text-base sm:text-lg text-[var(--text-muted)] leading-relaxed font-editorial-sans">
              Evaluate Flesch Reading Ease, pinpoint your chapter’s five hardest sentences, and inspect transparent linguistic friction—completely in your browser with zero data transmission.
            </p>

            {/* Three Core Benefits Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--canvas-card)] p-3.5 shadow-editorial-sm transition-all hover:border-[var(--brand-accent-border)]">
                <div className="flex items-center gap-2 text-[var(--brand-forest-light)]">
                  <Gauge className="h-4 w-4 shrink-0 text-[var(--brand-emerald)]" />
                  <h3 className="text-xs font-bold text-[var(--text-main)]">Understand Readability</h3>
                </div>
                <p className="mt-1.5 text-[11px] leading-normal text-[var(--text-faint)]">
                  Exact mathematical Flesch Reading Ease scores and target grade bands.
                </p>
              </div>

              <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--canvas-card)] p-3.5 shadow-editorial-sm transition-all hover:border-[var(--brand-accent-border)]">
                <div className="flex items-center gap-2 text-[var(--brand-forest-light)]">
                  <Target className="h-4 w-4 shrink-0 text-[var(--brand-emerald)]" />
                  <h3 className="text-xs font-bold text-[var(--text-main)]">Isolate Difficult Sentences</h3>
                </div>
                <p className="mt-1.5 text-[11px] leading-normal text-[var(--text-faint)]">
                  Composite 4-signal ranking reveals syntactic bottlenecks.
                </p>
              </div>

              <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--canvas-card)] p-3.5 shadow-editorial-sm transition-all hover:border-[var(--brand-accent-border)]">
                <div className="flex items-center gap-2 text-[var(--brand-forest-light)]">
                  <Feather className="h-4 w-4 shrink-0 text-[var(--brand-emerald)]" />
                  <h3 className="text-xs font-bold text-[var(--text-main)]">Preserve Your Voice</h3>
                </div>
                <p className="mt-1.5 text-[11px] leading-normal text-[var(--text-faint)]">
                  Linguistic mirrors, not generative homogenization or censorship.
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
                No sign-up · No tracking · Free forever
              </span>
            </div>
          </div>

          {/* Right Column: Abstract Editorial SVG Graphic */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-md aspect-[4/3] rounded-2xl border border-[var(--border-subtle)] bg-[var(--canvas-card)] p-6 shadow-editorial overflow-hidden flex items-center justify-center">
              {/* Subtle background graph paper pattern */}
              <div
                className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
                style={{
                  backgroundImage:
                    'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
                  backgroundSize: '16px 16px',
                }}
              />

              {/* Vector Editorial Composition: "The Optics of Prose" */}
              <svg
                viewBox="0 0 380 280"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full text-[var(--text-main)] transition-all duration-300"
                aria-label="Editorial illustration representing manuscript pages and optical readability analysis"
                role="img"
              >
                <defs>
                  <linearGradient id="folioGradLight" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="var(--canvas-card-subtle)" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="var(--canvas-card)" stopOpacity="0.7" />
                  </linearGradient>
                  <linearGradient id="beamGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="var(--brand-emerald)" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="var(--brand-emerald)" stopOpacity="0" />
                  </linearGradient>
                </defs>

                {/* Back Manuscript Sheet */}
                <rect
                  x="45"
                  y="40"
                  width="210"
                  height="180"
                  rx="10"
                  fill="url(#folioGradLight)"
                  stroke="var(--border-subtle)"
                  strokeWidth="1.5"
                  className="rotate-[-3deg] transform origin-bottom-left"
                />

                {/* Main Manuscript Folio */}
                <rect
                  x="65"
                  y="48"
                  width="220"
                  height="190"
                  rx="10"
                  fill="var(--canvas-card)"
                  stroke="var(--border-strong)"
                  strokeWidth="1.5"
                  className="shadow-sm"
                />

                {/* Folio Header & Ruled Lines */}
                <line x1="85" y1="75" x2="150" y2="75" stroke="var(--brand-forest-light)" strokeWidth="3" strokeLinecap="round" />
                <line x1="85" y1="95" x2="255" y2="95" stroke="var(--border-subtle)" strokeWidth="2" strokeLinecap="round" />
                <line x1="85" y1="115" x2="260" y2="115" stroke="var(--border-subtle)" strokeWidth="2" strokeLinecap="round" />
                <line x1="85" y1="135" x2="240" y2="135" stroke="var(--border-subtle)" strokeWidth="2" strokeLinecap="round" />
                
                {/* Highlighted Difficult Sentence on Folio */}
                <rect x="83" y="148" width="180" height="20" rx="4" fill="var(--highlight-r1-bg)" stroke="var(--highlight-r1-border)" strokeWidth="1" />
                <line x1="87" y1="158" x2="258" y2="158" stroke="var(--highlight-r1-border)" strokeWidth="2" strokeLinecap="round" />
                
                <line x1="85" y1="185" x2="250" y2="185" stroke="var(--border-subtle)" strokeWidth="2" strokeLinecap="round" />
                <line x1="85" y1="205" x2="210" y2="205" stroke="var(--border-subtle)" strokeWidth="2" strokeLinecap="round" />

                {/* Refractive Optical Lens Overlap */}
                <circle
                  cx="255"
                  cy="145"
                  r="56"
                  fill="url(#beamGrad)"
                  stroke="var(--brand-emerald)"
                  strokeWidth="2.5"
                  className="backdrop-blur-xs"
                />

                {/* Optical Concentric Rings & Reticle */}
                <circle cx="255" cy="145" r="44" stroke="var(--brand-emerald)" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
                <circle cx="255" cy="145" r="28" stroke="var(--brand-emerald)" strokeWidth="1.2" opacity="0.8" />
                
                {/* Crosshairs */}
                <line x1="255" y1="95" x2="255" y2="110" stroke="var(--brand-emerald)" strokeWidth="1.5" />
                <line x1="255" y1="180" x2="255" y2="195" stroke="var(--brand-emerald)" strokeWidth="1.5" />
                <line x1="205" y1="145" x2="220" y2="145" stroke="var(--brand-emerald)" strokeWidth="1.5" />
                <line x1="290" y1="145" x2="305" y2="145" stroke="var(--brand-emerald)" strokeWidth="1.5" />

                {/* Lens Handle */}
                <path
                  d="M295 185L340 230"
                  stroke="var(--brand-forest-light)"
                  strokeWidth="7"
                  strokeLinecap="round"
                />
                <path
                  d="M295 185L340 230"
                  stroke="var(--brand-emerald)"
                  strokeWidth="3"
                  strokeLinecap="round"
                />

                {/* Diagnostic Badge inside Lens Focus */}
                <rect x="230" y="132" width="50" height="26" rx="6" fill="var(--canvas-card)" stroke="var(--brand-emerald)" strokeWidth="1.5" />
                <text x="255" y="149" textAnchor="middle" fill="var(--text-main)" fontSize="11" fontWeight="bold" fontFamily="var(--font-mono)">
                  #1 [84]
                </text>

                {/* Tiny Floating Linguistic Badges */}
                <g className="animate-pulse">
                  <rect x="26" y="115" width="46" height="20" rx="4" fill="var(--canvas-card-subtle)" stroke="var(--border-subtle)" strokeWidth="1" />
                  <text x="49" y="129" textAnchor="middle" fill="var(--text-faint)" fontSize="9" fontWeight="600" fontFamily="var(--font-mono)">
                    Cadence
                  </text>
                </g>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
