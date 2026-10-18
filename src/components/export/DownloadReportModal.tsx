'use client';

import React, { useState } from 'react';
import { AnalysisResult } from '../../lib/linguistics/types';
import { downloadPdfReport, PdfReportOptions } from '../../lib/export/pdfReportGenerator';
import {
  X,
  Download,
  FileText,
  CheckCircle2,
  ShieldCheck,
  Check,
  Layers,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DownloadReportModalProps {
  isOpen: boolean;
  analysis: AnalysisResult;
  onClose: () => void;
}

export function DownloadReportModal({
  isOpen,
  analysis,
  onClose,
}: DownloadReportModalProps) {
  const [includeExcerpts, setIncludeExcerpts] = useState(true);
  const [includeSuggestions, setIncludeSuggestions] = useState(true);
  const [includeMethodology, setIncludeMethodology] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDownload = () => {
    setIsGenerating(true);
    setDownloadSuccess(null);

    try {
      const options: PdfReportOptions = {
        includeSentenceExcerpts: includeExcerpts,
        includeSuggestedRevisions: includeSuggestions,
        includeMethodologyNote: includeMethodology,
      };

      const result = downloadPdfReport(analysis, options);
      setDownloadSuccess(result.fileName);
      setTimeout(() => {
        setIsGenerating(false);
      }, 500);
    } catch (err: any) {
      console.error('PDF generation error:', err);
      setIsGenerating(false);
    }
  };

  const docName = analysis.sourceDocument?.fileName || 'manuscript';

  return (
    <AnimatePresence>
      <motion.div
        key="pdf-modal-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="pdf-modal-title"
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 sm:p-6"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <motion.div
          key="pdf-modal-content"
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-lg rounded-2xl border border-[var(--border-strong)] bg-[var(--canvas-card)] p-6 sm:p-7 shadow-editorial-elevated text-left"
        >
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 rounded-lg p-1.5 text-[var(--text-faint)] hover:bg-[var(--canvas-card-hover)] hover:text-[var(--text-main)] transition-colors focus-visible:outline-2 focus-visible:outline-[var(--brand-emerald)]"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Modal header */}
          <div className="flex items-center gap-2 text-[var(--brand-emerald)]">
            <FileText className="h-5 w-5" />
            <span className="text-xs font-bold uppercase tracking-wider font-editorial-mono">
              Export Analysis
            </span>
          </div>

          <h3
            id="pdf-modal-title"
            className="mt-1 font-editorial-serif text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-main)]"
          >
            Download Analysis Report (PDF)
          </h3>
          <p className="mt-1 text-xs text-[var(--text-muted)] leading-relaxed">
            Generate an archival, multi-page PDF summary of readability scores, document metrics, and ranked sentence diagnostics.
          </p>

          {/* Document Summary Card */}
          <div className="mt-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--canvas-card-subtle)] p-3.5 text-xs space-y-1.5 font-editorial-mono">
            <div className="flex justify-between items-center text-[var(--text-muted)]">
              <span>Source Document:</span>
              <strong className="text-[var(--text-main)] truncate max-w-[220px]" title={docName}>
                {docName}
              </strong>
            </div>
            <div className="flex justify-between items-center text-[var(--text-muted)]">
              <span>Readability Score:</span>
              <span className="font-bold text-[var(--brand-emerald)]">
                {analysis.clampedScore}/100 ({analysis.band.label})
              </span>
            </div>
            <div className="flex justify-between items-center text-[var(--text-muted)]">
              <span>Analyzed Prose Words:</span>
              <span className="text-[var(--text-main)]">
                {analysis.totalWords.toLocaleString()}
                {analysis.extractedWordCount && analysis.extractedWordCount !== analysis.totalWords && (
                  <span className="text-[10px] text-[var(--text-faint)] ml-1">
                    (of {analysis.extractedWordCount.toLocaleString()} tokens)
                  </span>
                )}
              </span>
            </div>
            <div className="flex justify-between items-center text-[var(--text-muted)]">
              <span>Flagged Sentences:</span>
              <span className="text-[var(--text-main)]">
                {analysis.difficultSentences.length} candidates
              </span>
            </div>
          </div>

          {/* Customization Options */}
          <div className="mt-4 space-y-3">
            <span className="text-xs font-bold text-[var(--text-main)] uppercase tracking-wider font-editorial-mono block">
              Report Content Options
            </span>

            <label className="flex items-start gap-3 text-xs text-[var(--text-main)] cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includeExcerpts}
                onChange={(e) => setIncludeExcerpts(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-[var(--border-strong)] text-[var(--brand-emerald)] focus:ring-[var(--brand-emerald)]"
              />
              <div>
                <span className="font-semibold block">Include verbatim sentence passages</span>
                <span className="text-[11px] text-[var(--text-muted)]">
                  Print the full text of each flagged sentence in the report.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 text-xs text-[var(--text-main)] cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includeSuggestions}
                onChange={(e) => setIncludeSuggestions(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-[var(--border-strong)] text-[var(--brand-emerald)] focus:ring-[var(--brand-emerald)]"
              />
              <div>
                <span className="font-semibold block">Include editorial craft tips & suggested rewrites</span>
                <span className="text-[11px] text-[var(--text-muted)]">
                  Include diagnostic actions and deterministic suggestions.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 text-xs text-[var(--text-main)] cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includeMethodology}
                onChange={(e) => setIncludeMethodology(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-[var(--border-strong)] text-[var(--brand-emerald)] focus:ring-[var(--brand-emerald)]"
              />
              <div>
                <span className="font-semibold block">Include scoring methodology note</span>
                <span className="text-[11px] text-[var(--text-muted)]">
                  Explains Flesch formula, CMU phoneme counting, and academic constraints.
                </span>
              </div>
            </label>
          </div>

          {/* Privacy Notice */}
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-[var(--brand-accent-bg)] border border-[var(--brand-accent-border)] p-2.5 text-[11px] text-[var(--brand-accent-text)]">
            <ShieldCheck className="h-4 w-4 text-[var(--brand-emerald)] shrink-0" />
            <span>
              <strong>100% Client-Side Generation:</strong> PDF is compiled entirely inside your browser. No document text is transmitted to external servers.
            </span>
          </div>

          {/* Download Success Banner */}
          {downloadSuccess && (
            <div className="mt-3 flex items-center justify-between rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 p-2.5 text-xs text-emerald-900 dark:text-emerald-200">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="truncate max-w-[280px]">Downloaded: {downloadSuccess}</span>
              </div>
              <span className="text-[10px] font-bold font-editorial-mono uppercase text-emerald-700 dark:text-emerald-300">
                Ready
              </span>
            </div>
          )}

          {/* Modal Action Buttons */}
          <div className="mt-6 flex flex-wrap items-center justify-end gap-3 border-t border-[var(--border-subtle)] pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-[var(--border-strong)] bg-[var(--canvas-card)] px-4 py-2 text-xs font-semibold text-[var(--text-main)] hover:bg-[var(--canvas-card-hover)] transition-colors"
            >
              Close
            </button>

            <button
              type="button"
              onClick={handleDownload}
              disabled={isGenerating}
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--brand-forest)] px-5 py-2 text-xs sm:text-sm font-semibold text-white shadow-editorial hover:bg-[var(--brand-forest-hover)] active:scale-[0.98] transition-all focus-visible:outline-2 focus-visible:outline-[var(--brand-emerald)] disabled:opacity-50"
            >
              <Download className="h-4 w-4 text-[var(--brand-forest-light)]" />
              <span>{isGenerating ? 'Generating PDF...' : 'Download PDF Report'}</span>
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
