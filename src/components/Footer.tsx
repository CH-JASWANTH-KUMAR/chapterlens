'use client';

import React from 'react';
import { ShieldCheck, ArrowUp } from 'lucide-react';
import { BrandLogo } from './BrandLogo';

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="border-t border-[var(--border-subtle)] bg-[var(--canvas-card-subtle)] text-[var(--text-muted)] transition-colors duration-200">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
          {/* Brand & Manifesto */}
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center gap-2.5">
              <BrandLogo size={28} />
              <span className="font-editorial-serif text-lg font-bold text-[var(--text-main)]">
                ChapterLens
              </span>
              <span className="rounded-full border border-[var(--brand-accent-border)] bg-[var(--brand-accent-bg)] px-2 py-0.5 text-[10px] font-semibold text-[var(--brand-accent-text)]">
                Editorial Studio
              </span>
            </div>
            <p className="font-editorial-serif text-sm italic text-[var(--text-main)]">
              &ldquo;Understand your writing. Keep your voice.&rdquo;
            </p>
            <p className="text-xs leading-relaxed text-[var(--text-faint)]">
              An editorial analysis studio designed for novelists, essayists, students, and independent authors seeking clarity without sacrificing stylistic identity.
            </p>
          </div>

          {/* Privacy & Local Processing Pledge */}
          <div className="md:col-span-4 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-main)] font-editorial-mono">
              Privacy & Local Execution
            </h4>
            <div className="flex items-start gap-2 text-xs text-[var(--text-muted)] leading-relaxed">
              <ShieldCheck className="h-4 w-4 shrink-0 text-[var(--brand-emerald)] mt-0.5" />
              <p>
                Your chapter is analyzed exclusively in client-side memory. Zero tracking cookies, zero cloud uploads, zero local storage persistence, and zero retention.
              </p>
            </div>
          </div>

          {/* Methodology */}
          <div className="md:col-span-3 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-main)] font-editorial-mono">
              Linguistic Engine
            </h4>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Built on Rudolf Flesch’s 1948 Reading Ease formula paired with composite linguistic tokenization and deterministic syllable estimation.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 border-t border-[var(--border-subtle)] pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--text-faint)]">
          <div>
            © {new Date().getFullYear()} ChapterLens Editorial Studio. Open, client-side readability tooling.
          </div>
          <div className="flex items-center gap-5">
            <a href="#how-it-works" className="hover:text-[var(--text-main)] transition-colors">
              Methodology
            </a>
            <a href="#about-scoring" className="hover:text-[var(--text-main)] transition-colors">
              Scoring Scale
            </a>
            <button
              onClick={scrollToTop}
              className="inline-flex items-center gap-1 hover:text-[var(--text-main)] transition-colors"
              aria-label="Scroll back to top"
            >
              <span>Back to Top</span>
              <ArrowUp className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
