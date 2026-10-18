'use client';

import React, { useState } from 'react';
import { ShieldCheck, Sparkles, Compass, Sun, Moon, RotateCcw, Menu, X, BookOpen } from 'lucide-react';
import { BrandWordmark } from './BrandLogo';
import { useTheme } from '../context/ThemeContext';

interface HeaderProps {
  onNewAnalysis?: () => void;
  onFocusEditor?: () => void;
  hasAnalysis?: boolean;
}

export function Header({ onNewAnalysis, onFocusEditor, hasAnalysis }: HeaderProps) {
  const { theme, toggleTheme, mounted } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[var(--border-subtle)] bg-[var(--canvas-bg)]/90 backdrop-blur-md transition-colors duration-200">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Brand identity using shared BrandWordmark */}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="group focus-visible:outline-2 focus-visible:outline-[var(--brand-emerald)] rounded-lg"
          aria-label="ChapterLens Home"
        >
          <BrandWordmark size="md" />
        </a>

        {/* Desktop Navigation & Actions */}
        <nav className="hidden md:flex items-center gap-4 lg:gap-6" aria-label="Main Navigation">
          <a
            href="#analysis-results"
            className="text-xs font-medium text-[var(--text-muted)] transition-colors hover:text-[var(--text-main)] inline-flex items-center gap-1.5 focus-visible:outline-2 focus-visible:outline-[var(--brand-emerald)] rounded px-1"
          >
            <span>Readability Audit</span>
          </a>
          <a
            href="#guided-reading-workspace"
            className="text-xs font-medium text-[var(--text-muted)] transition-colors hover:text-[var(--text-main)] inline-flex items-center gap-1.5 focus-visible:outline-2 focus-visible:outline-[var(--brand-emerald)] rounded px-1"
          >
            <span>Guided Reading</span>
          </a>
          <a
            href="#how-it-works"
            className="text-xs font-medium text-[var(--text-muted)] transition-colors hover:text-[var(--text-main)] inline-flex items-center gap-1.5 focus-visible:outline-2 focus-visible:outline-[var(--brand-emerald)] rounded px-1"
          >
            <Compass className="h-3.5 w-3.5 text-[var(--brand-emerald)]" />
            <span>Methodology</span>
          </a>
          <a
            href="#about-scoring"
            className="text-xs font-medium text-[var(--text-muted)] transition-colors hover:text-[var(--text-main)] inline-flex items-center gap-1.5 focus-visible:outline-2 focus-visible:outline-[var(--brand-emerald)] rounded px-1"
          >
            <BookOpen className="h-3.5 w-3.5 text-[var(--text-faint)]" />
            <span>Scale</span>
          </a>

          {/* Privacy badge */}
          <div className="hidden lg:flex items-center gap-1.5 rounded-full border border-[var(--border-subtle)] bg-[var(--canvas-card-subtle)] px-2.5 py-1 text-xs font-medium text-[var(--text-muted)]">
            <ShieldCheck className="h-3.5 w-3.5 text-[var(--brand-emerald)]" />
            <span className="text-[11px]">Free · Private · In-Browser</span>
          </div>

          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border-subtle)] bg-[var(--canvas-card)] text-[var(--text-main)] shadow-xs transition-colors hover:bg-[var(--canvas-card-hover)] hover:border-[var(--border-strong)] focus-visible:outline-2 focus-visible:outline-[var(--brand-emerald)]"
            aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          >
            {mounted ? (
              theme === 'dark' ? (
                <Sun className="h-4 w-4 text-amber-400 transition-transform duration-300 rotate-0 hover:rotate-45" />
              ) : (
                <Moon className="h-4 w-4 text-[var(--brand-forest)] transition-transform duration-300 rotate-0 hover:-rotate-12" />
              )
            ) : (
              <span className="h-4 w-4" />
            )}
          </button>

          {/* Contextual New Analysis button */}
          {hasAnalysis && (
            <button
              onClick={onNewAnalysis}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-strong)] bg-[var(--canvas-card)] px-3 py-1.5 text-xs font-semibold text-[var(--text-main)] shadow-xs transition-colors hover:bg-[var(--canvas-card-hover)] hover:border-[var(--brand-emerald)] focus-visible:outline-2 focus-visible:outline-[var(--brand-emerald)]"
              aria-label="Start new chapter analysis"
            >
              <RotateCcw className="h-3 w-3 text-[var(--brand-emerald)]" />
              <span>New Analysis</span>
            </button>
          )}

          {/* Editor Focus Button */}
          <button
            onClick={onFocusEditor}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--brand-forest)] px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs transition-all hover:bg-[var(--brand-forest-hover)] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-[var(--brand-emerald)]"
            aria-label="Focus manuscript editor"
          >
            <Sparkles className="h-3.5 w-3.5 text-[var(--brand-forest-light)]" />
            <span>Editor</span>
          </button>
        </nav>

        {/* Mobile Header Controls */}
        <div className="flex md:hidden items-center gap-2">
          {/* Theme Toggle Mobile */}
          <button
            type="button"
            onClick={toggleTheme}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border-subtle)] bg-[var(--canvas-card)] text-[var(--text-main)] shadow-xs"
            aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4 text-amber-400" />
            ) : (
              <Moon className="h-4 w-4 text-[var(--brand-forest)]" />
            )}
          </button>

          {hasAnalysis && (
            <button
              onClick={onNewAnalysis}
              className="inline-flex items-center gap-1 rounded-lg border border-[var(--border-subtle)] bg-[var(--canvas-card)] px-2.5 py-1 text-xs font-semibold text-[var(--text-main)]"
              aria-label="New analysis"
            >
              <RotateCcw className="h-3 w-3 text-[var(--brand-emerald)]" />
              <span>Reset</span>
            </button>
          )}

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border-subtle)] bg-[var(--canvas-card)] text-[var(--text-main)]"
            aria-label="Toggle mobile menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div
          id="mobile-navigation-menu"
          className="md:hidden border-t border-[var(--border-subtle)] bg-[var(--canvas-card)] px-4 py-3 space-y-3 transition-all animate-in slide-in-from-top-2 duration-150"
        >
          <div className="flex flex-col gap-2.5 text-xs font-medium text-[var(--text-muted)]">
            <a
              href="#analysis-results"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 py-1.5 hover:text-[var(--text-main)]"
            >
              <span>Readability Audit</span>
            </a>
            <a
              href="#guided-reading-workspace"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 py-1.5 hover:text-[var(--text-main)]"
            >
              <span>Guided Research Reading</span>
            </a>
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 py-1.5 hover:text-[var(--text-main)]"
            >
              <Compass className="h-4 w-4 text-[var(--brand-emerald)]" />
              <span>Methodology</span>
            </a>
            <a
              href="#about-scoring"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 py-1.5 hover:text-[var(--text-main)]"
            >
              <BookOpen className="h-4 w-4 text-[var(--text-faint)]" />
              <span>Readability Scale</span>
            </a>
            <div className="flex items-center gap-2 py-1.5 text-[var(--text-faint)] border-t border-[var(--border-subtle)] pt-2">
              <ShieldCheck className="h-4 w-4 text-[var(--brand-emerald)]" />
              <span>100% In-Browser Privacy</span>
            </div>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onFocusEditor?.();
              }}
              className="w-full mt-1 flex items-center justify-center gap-1.5 rounded-lg bg-[var(--brand-forest)] py-2 text-xs font-semibold text-white shadow-xs"
            >
              <Sparkles className="h-3.5 w-3.5 text-[var(--brand-forest-light)]" />
              <span>Go to Editor</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
