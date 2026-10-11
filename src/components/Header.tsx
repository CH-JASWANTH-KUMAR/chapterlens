'use client';

import React from 'react';
import { BookOpen, ShieldCheck, Sparkles, Compass } from 'lucide-react';

interface HeaderProps {
  onNewAnalysis?: () => void;
  onFocusEditor?: () => void;
  hasAnalysis?: boolean;
}

export function Header({ onNewAnalysis, onFocusEditor, hasAnalysis }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#E6E4D9] bg-[#FBFBF9]/95 backdrop-blur-sm transition-colors">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1A3C2D] text-[#FBFBF9] shadow-sm">
            <BookOpen className="h-5 w-5" strokeWidth={2.2} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-editorial-serif text-xl font-bold tracking-tight text-[#1C1E1D]">
                ChapterLens
              </span>
              <span className="hidden rounded-full border border-[#CBD9D0] bg-[#EBF1ED] px-2 py-0.5 text-[11px] font-medium text-[#1A3C2D] sm:inline-block">
                Editorial Studio
              </span>
            </div>
            <p className="hidden text-xs text-[#5E6460] md:block">
              Understand your writing. Keep your voice.
            </p>
          </div>
        </div>

        {/* Navigation & Trust Badges */}
        <nav className="flex items-center gap-3 sm:gap-6" aria-label="Main Navigation">
          <a
            href="#how-it-works"
            className="hidden text-xs font-medium text-[#424744] transition-colors hover:text-[#1A3C2D] sm:inline-flex items-center gap-1.5"
          >
            <Compass className="h-3.5 w-3.5 text-[#537562]" />
            Methodology
          </a>
          <a
            href="#about-scoring"
            className="hidden text-xs font-medium text-[#424744] transition-colors hover:text-[#1A3C2D] md:inline-block"
          >
            Readability Scale
          </a>

          {/* Privacy badge */}
          <div className="flex items-center gap-1.5 rounded-full border border-[#E6E4D9] bg-[#F5F4EE] px-2.5 py-1 text-xs font-medium text-[#2C302E]">
            <ShieldCheck className="h-3.5 w-3.5 text-[#1A3C2D]" />
            <span className="text-[11px] sm:text-xs">Free · Private · In-Browser</span>
          </div>

          {/* Actions */}
          {hasAnalysis && (
            <button
              onClick={onNewAnalysis}
              className="inline-flex items-center gap-1.5 rounded-md border border-[#CDC9B8] bg-white px-3 py-1.5 text-xs font-semibold text-[#1C1E1D] shadow-xs transition-all hover:bg-[#F5F4EE] hover:border-[#1A3C2D] focus-visible:outline-2 focus-visible:outline-[#1A3C2D]"
              aria-label="Start new chapter analysis"
            >
              New Analysis
            </button>
          )}

          <button
            onClick={onFocusEditor}
            className="inline-flex items-center gap-1.5 rounded-md bg-[#1A3C2D] px-3.5 py-1.5 text-xs font-semibold text-[#FBFBF9] shadow-xs transition-all hover:bg-[#122B20] focus-visible:outline-2 focus-visible:outline-[#1A3C2D]"
            aria-label="Focus manuscript editor"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Editor</span>
          </button>
        </nav>
      </div>
    </header>
  );
}
