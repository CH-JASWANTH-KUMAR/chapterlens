'use client';

import React from 'react';
import { BookOpen, Scale, AlertCircle, Compass, ShieldCheck } from 'lucide-react';
import { READABILITY_BANDS } from '../lib/linguistics/flesch';

export function EducationalSection() {
  return (
    <section aria-labelledby="educational-section-heading" className="space-y-12">
      {/* Section Header */}
      <div className="border-b border-[#E6E4D9] pb-4">
        <span className="text-[11px] font-semibold tracking-wider uppercase text-[#537562]">
          Editorial Craft & Methodology
        </span>
        <h2
          id="educational-section-heading"
          className="font-editorial-serif text-3xl font-bold tracking-tight text-[#1C1E1D]"
        >
          Understanding Readability & Authorial Voice
        </h2>
        <p className="mt-2 text-sm text-[#5E6460]">
          Formulas are diagnostic mirrors, not arbiters of literary taste. Here is how ChapterLens interprets prose.
        </p>
      </div>

      {/* Grid of Key Concepts */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {/* Card 1: What the Flesch Score Means */}
        <div className="rounded-xl border border-[#E6E4D9] bg-white p-6 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#EBF1ED] text-[#1A3C2D]">
            <Scale className="h-5 w-5" />
          </div>
          <h3 className="mt-4 font-editorial-serif text-lg font-bold text-[#1C1E1D]">
            What Flesch Reading Ease Measures
          </h3>
          <p className="mt-2 text-xs leading-relaxed text-[#5E6460]">
            Formulated in 1948 by Rudolf Flesch, the index calculates cognitive reading ease by weighing average sentence length against average syllables per word. Scores range from 0 to 100, where higher scores indicate prose requiring less working memory to parse.
          </p>
          <div className="mt-4 rounded-lg bg-[#F5F4EE] p-3 text-[11px] font-editorial-mono text-[#2C302E]">
            206.835 - 1.015 × (words/sentences) - 84.6 × (syllables/words)
          </div>
        </div>

        {/* Card 2: Readability is Not Literary Quality */}
        <div className="rounded-xl border border-[#E6E4D9] bg-white p-6 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#FDF4ED] text-[#C2632B]">
            <BookOpen className="h-5 w-5" />
          </div>
          <h3 className="mt-4 font-editorial-serif text-lg font-bold text-[#1C1E1D]">
            Readability ≠ Literary Quality
          </h3>
          <p className="mt-2 text-xs leading-relaxed text-[#5E6460]">
            A high score does not mean great writing, and a low score does not mean flawed prose. Ernest Hemingway’s sentences often score 80–90 (accessible, direct), while William Faulkner, Virginia Woolf, and Cormac McCarthy routinely score 30–50. Your voice and dramatic intention should always take precedence over formulaic metrics.
          </p>
        </div>

        {/* Card 3: How ChapterLens Ranks Hard Sentences */}
        <div className="rounded-xl border border-[#E6E4D9] bg-white p-6 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#EBF1ED] text-[#1A3C2D]">
            <Compass className="h-5 w-5" />
          </div>
          <h3 className="mt-4 font-editorial-serif text-lg font-bold text-[#1C1E1D]">
            Multi-Signal Difficulty Ranking
          </h3>
          <p className="mt-2 text-xs leading-relaxed text-[#5E6460]">
            Unlike primitive tools that simply flag the longest sentences, ChapterLens combines four distinct cognitive friction signals: word cadence (35%), syllable density (25%), polysyllabic word ratio (25%), and structural punctuation breaks (15%). This isolates truly tangled sentences from naturally flowing long sentences.
          </p>
        </div>
      </div>

      {/* Readability Scale Table */}
      <div id="about-scoring" className="rounded-xl border border-[#E6E4D9] bg-white p-6 shadow-sm sm:p-8">
        <h3 className="font-editorial-serif text-xl font-bold text-[#1C1E1D]">
          The Standard Flesch Interpretation Scale
        </h3>
        <p className="mt-1 text-xs text-[#5E6460]">
          Standardized reading difficulty bands and their corresponding educational grade levels.
        </p>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#E6E4D9] bg-[#F5F4EE] text-[#1C1E1D]">
                <th className="py-2.5 px-3 font-semibold">Score Range</th>
                <th className="py-2.5 px-3 font-semibold">Category</th>
                <th className="py-2.5 px-3 font-semibold">Equivalent Grade</th>
                <th className="py-2.5 px-3 font-semibold">Audience Profile</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EFEA]">
              {READABILITY_BANDS.map((band) => (
                <tr key={band.label} className="hover:bg-[#FBFBF9] transition-colors">
                  <td className="py-3 px-3 font-editorial-mono font-bold text-[#1C1E1D]">
                    {band.min} – {band.max}
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`inline-flex rounded px-2 py-0.5 text-[11px] font-semibold border ${band.badgeClass}`}
                    >
                      {band.label}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-[#424744] font-medium">{band.gradeLevel}</td>
                  <td className="py-3 px-3 text-[#5E6460]">{band.targetAudience}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Editorial Studio Philosophy Banner */}
      <div className="flex flex-col md:flex-row items-center gap-6 rounded-2xl border border-[#E6E4D9] bg-white p-6 sm:p-8 shadow-editorial">
        <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-xl border border-[#E6E4D9] shadow-inner bg-[#FBFBF9]">
          <img
            src="/brand_mark.jpg"
            alt="ChapterLens Editorial Bookplate"
            className="h-full w-full object-cover"
          />
        </div>
        <div className="space-y-2 text-center md:text-left">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#537562]">
            Authorial Philosophy
          </span>
          <h3 className="font-editorial-serif text-2xl font-bold text-[#1C1E1D]">
            Crafting Clarity Without Sacrificing Soul
          </h3>
          <p className="text-xs leading-relaxed text-[#5E6460]">
            Every great story balances compression and elaboration. ChapterLens gives authors transparency into where readers slow down, stumble, or hold their breath—so you can decide whether that cognitive pause is intentional artistry or accidental friction.
          </p>
        </div>
      </div>

      {/* How it Works Section */}
      <div id="how-it-works" className="rounded-xl border border-[#CBD9D0] bg-[#EBF1ED]/40 p-6 sm:p-8">
        <div className="flex items-center gap-2 text-[#1A3C2D]">
          <ShieldCheck className="h-5 w-5" />
          <h3 className="font-editorial-serif text-xl font-bold text-[#1A3C2D]">
            Privacy By Design Architecture
          </h3>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-[#2C302E]">
          ChapterLens runs 100% inside your browser’s JavaScript runtime. Your chapter text is never transmitted across a network, never stored in localStorage, never saved to an external database, and never used to train machine learning models. When you close the tab or click "Clear", the manuscript ceases to exist in memory.
        </p>
      </div>
    </section>
  );
}
