'use client';

import React from 'react';
import { BookOpen, Scale, Compass, ShieldCheck, Award } from 'lucide-react';
import { READABILITY_BANDS } from '../lib/linguistics/flesch';
import { BrandLogo } from './BrandLogo';

export function EducationalSection() {
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
    <section aria-labelledby="educational-section-heading" className="space-y-10">
      {/* Section Header */}
      <div className="border-b border-[var(--border-subtle)] pb-4">
        <span className="text-[11px] font-semibold tracking-wider uppercase text-[var(--brand-emerald)]">
          Editorial Craft & Methodology
        </span>
        <h2
          id="educational-section-heading"
          className="font-editorial-serif text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-main)]"
        >
          Understanding Readability & Authorial Voice
        </h2>
        <p className="mt-1.5 text-xs sm:text-sm text-[var(--text-muted)]">
          Formulas are diagnostic mirrors, not arbiters of literary taste. Here is how ChapterLens interprets prose.
        </p>
      </div>

      {/* Grid of Key Methodology Concepts */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {/* Card 1: What Flesch Reading Ease Measures */}
        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--canvas-card)] p-5 sm:p-6 shadow-editorial-sm transition-all hover:border-[var(--border-strong)] flex flex-col justify-between">
          <div>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--brand-accent-bg)] text-[var(--brand-emerald)] border border-[var(--brand-accent-border)]">
              <Scale className="h-4.5 w-4.5" />
            </div>
            <h3 className="mt-3.5 font-editorial-serif text-lg font-bold text-[var(--text-main)]">
              What Flesch Reading Ease Measures
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-[var(--text-muted)]">
              Formulated in 1948 by Rudolf Flesch, the index calculates cognitive reading ease by weighing average sentence cadence against phonetic syllables per word. Scores range from 0 to 100, where higher scores indicate prose requiring less short-term working memory to parse.
            </p>
          </div>
          <div className="mt-4 rounded-xl bg-[var(--canvas-card-subtle)] border border-[var(--border-subtle)] p-3 text-[11px] font-editorial-mono text-[var(--text-main)] text-center sm:text-left">
            206.835 - 1.015 × (words/sentences) - 84.6 × (syllables/words)
          </div>
        </div>

        {/* Card 2: Readability ≠ Literary Quality */}
        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--canvas-card)] p-5 sm:p-6 shadow-editorial-sm transition-all hover:border-[var(--border-strong)] flex flex-col justify-between">
          <div>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900">
              <BookOpen className="h-4.5 w-4.5" />
            </div>
            <h3 className="mt-3.5 font-editorial-serif text-lg font-bold text-[var(--text-main)]">
              Readability ≠ Literary Quality
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-[var(--text-muted)]">
              A high score does not mean great writing, and a low score does not mean flawed prose. Ernest Hemingway’s sentences often score 80–90 (accessible, direct), while William Faulkner, Virginia Woolf, and Cormac McCarthy routinely score 30–50. Your voice and dramatic intention should always take precedence over formulaic metrics.
            </p>
          </div>
          <div className="mt-4 rounded-xl bg-[var(--canvas-card-subtle)] border border-[var(--border-subtle)] p-3 text-[11px] text-[var(--text-muted)] italic text-center sm:text-left">
            &ldquo;Write hard and clear about what hurts.&rdquo; (Ernest Hemingway)
          </div>
        </div>

        {/* Card 3: Multi-Signal Difficulty Ranking */}
        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--canvas-card)] p-5 sm:p-6 shadow-editorial-sm transition-all hover:border-[var(--border-strong)] flex flex-col justify-between">
          <div>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--brand-accent-bg)] text-[var(--brand-emerald)] border border-[var(--brand-accent-border)]">
              <Compass className="h-4.5 w-4.5" />
            </div>
            <h3 className="mt-3.5 font-editorial-serif text-lg font-bold text-[var(--text-main)]">
              Multi-Signal Difficulty Ranking
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-[var(--text-muted)]">
              Unlike primitive tools that simply flag the longest sentences, ChapterLens combines four distinct cognitive friction signals: word cadence (35%), syllable density (25%), polysyllabic word ratio (25%), and structural punctuation breaks (15%). This isolates truly tangled sentences from naturally flowing long sentences.
            </p>
          </div>
          <div className="mt-4 rounded-xl bg-[var(--canvas-card-subtle)] border border-[var(--border-subtle)] p-3 text-[11px] font-editorial-mono text-[var(--text-muted)] flex justify-between">
            <span>Cadence 35%</span>
            <span>Syllables 25%</span>
            <span>Syntax 25%</span>
            <span>Marks 15%</span>
          </div>
        </div>
      </div>

      {/* Readability Scale Table Section */}
      <div id="about-scoring" className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--canvas-card)] p-5 sm:p-7 shadow-editorial">
        <div className="flex items-center gap-2">
          <Award className="h-5 w-5 text-[var(--brand-emerald)]" />
          <h3 className="font-editorial-serif text-xl font-bold text-[var(--text-main)]">
            The Standard Flesch Interpretation Scale
          </h3>
        </div>
        <p className="mt-1 text-xs text-[var(--text-muted)]">
          Standardized reading difficulty bands and their corresponding educational grade levels.
        </p>

        <div className="mt-5 overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-subtle)] bg-[var(--canvas-card-subtle)] text-[var(--text-main)]">
                <th className="py-2.5 px-3.5 font-semibold font-editorial-mono">Score Range</th>
                <th className="py-2.5 px-3.5 font-semibold">Category</th>
                <th className="py-2.5 px-3.5 font-semibold">Equivalent Grade</th>
                <th className="py-2.5 px-3.5 font-semibold">Audience Profile</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {READABILITY_BANDS.map((band) => (
                <tr key={band.label} className="hover:bg-[var(--canvas-card-subtle)] transition-colors">
                  <td className="py-3 px-3.5 font-editorial-mono font-bold text-[var(--text-main)] whitespace-nowrap">
                    {band.min} – {band.max}
                  </td>
                  <td className="py-3 px-3.5 whitespace-nowrap">
                    <span
                      className={`inline-flex rounded-md px-2.5 py-0.5 text-[11px] font-semibold border ${getBandBadgeClass(
                        band.label
                      )}`}
                    >
                      {band.label}
                    </span>
                  </td>
                  <td className="py-3 px-3.5 text-[var(--text-main)] font-medium font-editorial-mono">
                    {band.gradeLevel}
                  </td>
                  <td className="py-3 px-3.5 text-[var(--text-muted)] leading-relaxed">
                    {band.targetAudience}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Editorial Studio Philosophy Banner */}
      <div className="flex flex-col md:flex-row items-center gap-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--canvas-card)] p-5 sm:p-7 shadow-editorial">
        <div className="shrink-0 p-1">
          <BrandLogo size={48} />
        </div>
        <div className="space-y-1.5 text-center md:text-left">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--brand-emerald)] font-editorial-mono">
            Authorial Philosophy
          </span>
          <h3 className="font-editorial-serif text-xl sm:text-2xl font-bold text-[var(--text-main)]">
            Crafting Clarity Without Sacrificing Soul
          </h3>
          <p className="text-xs sm:text-sm leading-relaxed text-[var(--text-muted)]">
            Every great story balances compression and elaboration. ChapterLens gives authors transparency into where readers slow down, stumble, or hold their breath, so you can decide whether that cognitive pause is intentional artistry or accidental friction.
          </p>
        </div>
      </div>

      {/* Privacy By Design Architecture Section */}
      <div id="how-it-works" className="rounded-2xl border border-[var(--brand-accent-border)] bg-[var(--brand-accent-bg)] p-5 sm:p-7">
        <div className="flex items-center gap-2 text-[var(--brand-accent-text)]">
          <ShieldCheck className="h-5 w-5 text-[var(--brand-emerald)]" />
          <h3 className="font-editorial-serif text-lg sm:text-xl font-bold">
            Privacy By Design Architecture
          </h3>
        </div>
        <p className="mt-2 text-xs sm:text-sm leading-relaxed text-[var(--text-muted)]">
          ChapterLens runs 100% inside your browser’s client runtime. Your manuscript is never transmitted across an external network, never stored in browser cookies or persistent storage, never saved to an external database, and never used to train machine learning models. When you close your browser tab or click &ldquo;Clear text&rdquo;, the text disappears from memory completely.
        </p>
      </div>
    </section>
  );
}
