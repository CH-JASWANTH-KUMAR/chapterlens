'use client';

import React, { useEffect, useRef } from 'react';
import { ShieldCheck, Lock, ExternalLink, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ExternalDisclosureModalProps {
  isOpen: boolean;
  providerName?: string | null;
  purpose?: 'explanation' | 'rewrite';
  onConfirm: () => void;
  onCancel: () => void;
}

export function ExternalDisclosureModal({
  isOpen,
  providerName = 'Configured AI Provider',
  purpose = 'explanation',
  onConfirm,
  onCancel,
}: ExternalDisclosureModalProps) {
  const confirmBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    // Focus the primary confirmation button when modal appears
    setTimeout(() => {
      confirmBtnRef.current?.focus();
    }, 50);

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="disclosure-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="disclosure-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              onCancel();
            }
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
        >
          <motion.div
            key="disclosure-dialog"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-lg rounded-2xl border border-[var(--border-subtle)] bg-[var(--canvas-card)] p-6 sm:p-7 shadow-editorial-elevated space-y-5 text-left"
          >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-[var(--border-subtle)] pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--brand-accent-bg)] text-[var(--brand-emerald)] border border-[var(--brand-accent-border)]">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3
                id="disclosure-title"
                className="font-editorial-serif text-lg sm:text-xl font-bold text-[var(--text-main)]"
              >
                {purpose === 'rewrite'
                  ? 'External AI Rewriting Disclosure'
                  : 'External Processing Disclosure'}
              </h3>
              <p className="text-xs text-[var(--text-faint)]">
                {purpose === 'rewrite'
                  ? 'Transparent privacy assurance before generating AI-assisted sentence revisions.'
                  : 'Transparent privacy assurance before generating AI explanations.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Close dialog"
            className="rounded-lg p-1 text-[var(--text-faint)] hover:text-[var(--text-main)] hover:bg-[var(--canvas-card-hover)] transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Disclosure Body */}
        <div className="space-y-3.5 text-xs leading-relaxed text-[var(--text-muted)]">
          <p>
            ChapterLens parses manuscripts and calculates readability metrics <strong>100% locally in your browser</strong>. To {purpose === 'rewrite' ? 'generate simplified sentence variations' : 'provide guided academic explanations'}, the following minimal data will be transmitted to the configured external provider (<strong>{providerName}</strong>):
          </p>

          <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--canvas-card-subtle)] p-3.5 space-y-2">
            <div className="flex items-start gap-2">
              <Check className="h-4 w-4 text-[var(--brand-emerald)] shrink-0 mt-0.5" />
              <span>
                <strong>What is sent:</strong>{' '}
                {purpose === 'rewrite'
                  ? 'Only this single sentence (strictly bounded under 1,200 characters) to untangle its syntax and cadence.'
                  : 'Only the specific sentence or phrase you selected, plus its immediate surrounding paragraph (~100–150 words) to provide necessary context.'}
              </span>
            </div>
            <div className="flex items-start gap-2">
              <Lock className="h-4 w-4 text-[var(--brand-emerald)] shrink-0 mt-0.5" />
              <span>
                <strong>What is NOT sent:</strong> The rest of your manuscript, full chapters, uploaded document files, user identifiers, or metadata are never transmitted or stored.
              </span>
            </div>
          </div>

          <p className="text-[11px] text-[var(--text-faint)]">
            {purpose === 'rewrite'
              ? 'All suggested revisions can be copied or applied to your working draft. You can decline at any time and use the 100% offline rule-based suggestions.'
              : 'Explanations are cached in local browser session memory for your reading duration. You can decline at any time and continue reading locally with full structural navigation and readability scoring.'}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-[var(--border-subtle)] pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-[var(--border-subtle)] bg-[var(--canvas-card)] px-4 py-2 text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--canvas-card-hover)] transition-colors"
          >
            {purpose === 'rewrite' ? 'Cancel / Stay Offline' : 'Cancel / Read Offline'}
          </button>

          <button
            ref={confirmBtnRef}
            type="button"
            onClick={onConfirm}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--brand-forest)] px-5 py-2 text-xs font-semibold text-white shadow-editorial hover:bg-[var(--brand-forest-hover)] active:scale-[0.98] transition-all focus-visible:outline-2 focus-visible:outline-[var(--brand-emerald)]"
          >
            <span>{purpose === 'rewrite' ? 'Allow & Generate AI Rewrites' : 'Allow & Request Explanation'}</span>
            <ExternalLink className="h-3 w-3 text-[var(--brand-forest-light)]" />
          </button>
        </div>
      </motion.div>
    </motion.div>
      )}
    </AnimatePresence>
  );
}
