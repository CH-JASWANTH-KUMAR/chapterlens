'use client';

import React from 'react';
import { BookOpen, ShieldCheck, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-[#E6E4D9] bg-[#F5F4EE] text-[#5E6460]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
          {/* Brand & Manifesto */}
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded bg-[#1A3C2D] text-white">
                <BookOpen className="h-4 w-4" />
              </div>
              <span className="font-editorial-serif text-lg font-bold text-[#1C1E1D]">
                ChapterLens
              </span>
            </div>
            <p className="font-editorial-serif text-sm italic text-[#424744]">
              “Understand your writing. Keep your voice.”
            </p>
            <p className="text-xs leading-relaxed text-[#5E6460]">
              An editorial analysis studio designed for novelists, essayists, students, and independent authors seeking clarity without sacrificing stylistic identity.
            </p>
          </div>

          {/* Privacy & Engine Pledge */}
          <div className="md:col-span-4 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#1C1E1D]">
              Privacy & Local Processing
            </h4>
            <div className="flex items-start gap-2 text-xs text-[#5E6460]">
              <ShieldCheck className="h-4 w-4 shrink-0 text-[#1A3C2D] mt-0.5" />
              <p>
                Your manuscript is analyzed exclusively in client-side memory. No tracking cookies, no server uploads, no local storage persistence, and zero retention.
              </p>
            </div>
          </div>

          {/* Methodology */}
          <div className="md:col-span-3 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#1C1E1D]">
              Methodology
            </h4>
            <p className="text-xs text-[#5E6460] leading-relaxed">
              Built on Rudolf Flesch’s 1948 Reading Ease formula paired with composite linguistic tokenization and deterministic syllable estimation.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 border-t border-[#E6E4D9] pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#7A817D]">
          <div>
            © {new Date().getFullYear()} ChapterLens Editorial Studio. Open, private readability tooling.
          </div>
          <div className="flex items-center gap-4">
            <a href="#how-it-works" className="hover:text-[#1A3C2D]">
              Methodology
            </a>
            <a href="#about-scoring" className="hover:text-[#1A3C2D]">
              Scoring Scale
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
