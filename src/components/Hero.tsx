'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Gauge, BookOpen, ShieldCheck, ArrowDown, FlaskConical, FileText, Activity } from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { CadenceScannerVisual } from './visuals/CadenceScannerVisual';
import { motion, AnimatePresence } from 'motion/react';

interface HeroProps {
  onScrollToEditor?: () => void;
  onTrySample?: () => void;
}

export function Hero({ onScrollToEditor, onTrySample }: HeroProps) {
  const [visualMode, setVisualMode] = useState<'illustration' | 'scanner'>('illustration');

  return (
    <section className="relative overflow-hidden pt-8 pb-10 sm:pt-12 sm:pb-12 border-b border-[var(--border-subtle)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center">
          {/* Left Text / Value Proposition */}
          <div className="lg:col-span-7 space-y-5 text-center sm:text-left">
            {/* Unified Editorial Brand Badge */}
            <div className="inline-flex items-center gap-2.5 rounded-full border border-[var(--brand-accent-border)] bg-[var(--brand-accent-bg)] px-3 py-1 text-xs font-semibold text-[var(--brand-accent-text)]">
              <BrandLogo size={18} />
              <span>ChapterLens Editorial Studio · In-Browser Document Intelligence</span>
            </div>

            <h1 className="font-editorial-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[var(--text-main)] leading-[1.15]">
              Understand complex research.{' '}
              <span className="italic font-normal text-[var(--brand-forest-light)] underline decoration-[var(--brand-emerald)]/40 decoration-wavy decoration-2">
                Audit prose cadence
              </span>.
            </h1>

            <p className="max-w-2xl text-base sm:text-lg text-[var(--text-muted)] leading-relaxed font-editorial-sans">
              ChapterLens combines two dedicated reading environments: inspect exact Flesch Reading Ease and isolate syntactic friction in your writing, or explore dense research papers with multi-level explanations anchored to the original text.
            </p>

            {/* Two Core Modes & Privacy Foundation Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--canvas-card)] p-3.5 shadow-editorial-sm transition-all hover:border-[var(--brand-accent-border)] text-left">
                <div className="flex items-center gap-2 text-[var(--brand-forest-light)]">
                  <Gauge className="h-4 w-4 shrink-0 text-[var(--brand-emerald)]" />
                  <h3 className="text-xs font-bold text-[var(--text-main)]">Readability Audit</h3>
                </div>
                <p className="mt-1.5 text-[11px] leading-normal text-[var(--text-faint)]">
                  Compute exact Flesch scores, rank high-friction sentences, and pinpoint revisions (100% offline).
                </p>
              </div>

              <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--canvas-card)] p-3.5 shadow-editorial-sm transition-all hover:border-[var(--brand-accent-border)] text-left">
                <div className="flex items-center gap-2 text-[var(--brand-forest-light)]">
                  <BookOpen className="h-4 w-4 shrink-0 text-[var(--brand-emerald)]" />
                  <h3 className="text-xs font-bold text-[var(--text-main)]">Guided Research Reading</h3>
                </div>
                <p className="mt-1.5 text-[11px] leading-normal text-[var(--text-faint)]">
                  Unpack difficult sentences across Beginner, Step-by-Step, and Technical levels without leaving your place.
                </p>
              </div>

              <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--canvas-card)] p-3.5 shadow-editorial-sm transition-all hover:border-[var(--brand-accent-border)] text-left">
                <div className="flex items-center gap-2 text-[var(--brand-forest-light)]">
                  <ShieldCheck className="h-4 w-4 shrink-0 text-[var(--brand-emerald)]" />
                  <h3 className="text-xs font-bold text-[var(--text-main)]">Privacy By Design</h3>
                </div>
                <p className="mt-1.5 text-[11px] leading-normal text-[var(--text-faint)]">
                  Documents are parsed in browser memory. Full texts are never transmitted; AI requires explicit per-session consent.
                </p>
              </div>
            </div>

            {/* First-time Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-3">
              <button
                type="button"
                id="hero-upload-button"
                onClick={onScrollToEditor}
                className="inline-flex items-center gap-2 rounded-xl bg-[var(--brand-forest)] px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-editorial transition-all hover:bg-[var(--brand-forest-hover)] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-[var(--brand-emerald)]"
              >
                <span>Upload Manuscript or Paper</span>
                <ArrowDown className="h-3.5 w-3.5 text-[var(--brand-emerald)]" />
              </button>

              {onTrySample && (
                <button
                  type="button"
                  id="hero-try-sample-button"
                  onClick={onTrySample}
                  className="inline-flex items-center gap-2 rounded-xl border border-[var(--border-strong)] bg-[var(--canvas-card)] px-4 py-2.5 text-xs sm:text-sm font-semibold text-[var(--text-main)] shadow-editorial-sm transition-all hover:border-[var(--brand-emerald)] hover:bg-[var(--canvas-card-hover)] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-[var(--brand-emerald)]"
                >
                  <FlaskConical className="h-4 w-4 text-[var(--brand-emerald)]" />
                  <span>Try Sample Research Paper</span>
                </button>
              )}

              <span className="text-xs text-[var(--text-faint)] font-editorial-mono">
                PDF · DOCX · TXT · Zero Server Storage
              </span>
            </div>
          </div>

          {/* Right Column: Purposeful Interactive Visual Studio */}
          <div className="lg:col-span-5 flex flex-col items-center lg:items-end space-y-3">
            {/* Visual Mode Selector Tabs */}
            <div
              role="tablist"
              aria-label="Hero visual demonstration modes"
              className="inline-flex rounded-xl border border-[var(--border-subtle)] bg-[var(--canvas-card-subtle)] p-1 shadow-editorial-sm"
            >
              <button
                type="button"
                role="tab"
                id="tab-hero-illustration"
                aria-selected={visualMode === 'illustration'}
                onClick={() => setVisualMode('illustration')}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all focus-visible:outline-2 focus-visible:outline-[var(--brand-emerald)] ${
                  visualMode === 'illustration'
                    ? 'bg-[var(--canvas-card)] text-[var(--brand-emerald)] shadow-xs border border-[var(--border-subtle)]'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`}
              >
                <FileText className="h-3.5 w-3.5" />
                <span>Research Manuscript</span>
              </button>

              <button
                type="button"
                role="tab"
                id="tab-hero-scanner"
                aria-selected={visualMode === 'scanner'}
                onClick={() => setVisualMode('scanner')}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all focus-visible:outline-2 focus-visible:outline-[var(--brand-emerald)] ${
                  visualMode === 'scanner'
                    ? 'bg-[var(--canvas-card)] text-[var(--brand-emerald)] shadow-xs border border-[var(--border-subtle)]'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`}
              >
                <Activity className="h-3.5 w-3.5" />
                <span>Cadence Scanner</span>
              </button>
            </div>

            {/* Active Visual Container with Motion Transitions */}
            <div className="w-full max-w-md min-h-[340px] flex items-center justify-center">
              <AnimatePresence mode="wait">
                {visualMode === 'illustration' ? (
                  <motion.div
                    key="hero-illustration-visual"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full"
                  >
                    <div className="relative w-full rounded-2xl border border-[var(--border-subtle)] bg-[var(--canvas-card)] p-3 sm:p-4 shadow-editorial overflow-hidden">
                      <Image
                        src="/brand-assets/chapterlens-hero-illustration.png"
                        alt="ChapterLens editorial research manuscript analysis illustration"
                        width={560}
                        height={380}
                        priority
                        className="w-full h-auto rounded-xl object-contain"
                      />
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="hero-scanner-visual"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full"
                  >
                    <CadenceScannerVisual />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
