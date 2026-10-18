'use client';

import React, { useState } from 'react';
import { ExtractedDocument } from '../../lib/document/types';
import { formatFileSize } from '../../lib/document/documentService';
import {
  FileText,
  Sparkles,
  RefreshCw,
  Trash2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Layers,
  BookOpen,
  ShieldCheck,
  CheckCircle2,
  FlaskConical,
} from 'lucide-react';

interface DocumentPreviewProps {
  document: ExtractedDocument;
  isAnalyzing: boolean;
  onAnalyze: () => void;
  onStartGuidedReading?: () => void;
  onReplace: () => void;
  onClear: () => void;
}

export function DocumentPreview({
  document,
  isAnalyzing,
  onAnalyze,
  onStartGuidedReading,
  onReplace,
  onClear,
}: DocumentPreviewProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const wordCount = document.fullText
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0).length;

  const getFormatBadge = () => {
    if (document.isSample) {
      return {
        label: 'Sample Paper',
        color: 'bg-amber-50 text-amber-900 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800',
      };
    }
    switch (document.format) {
      case 'pdf':
        return {
          label: 'PDF Document',
          color: 'bg-red-50 text-red-800 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900',
        };
      case 'docx':
        return {
          label: 'Word DOCX',
          color: 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900',
        };
      case 'txt':
        return {
          label: 'Plain Text',
          color: 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900',
        };
      default:
        return {
          label: 'Imported Document',
          color: 'bg-neutral-50 text-neutral-800 border-neutral-200 dark:bg-neutral-900 dark:text-neutral-300',
        };
    }
  };

  const badge = getFormatBadge();

  // Preview the first 8 blocks by default
  const previewBlocks = isExpanded ? document.blocks : document.blocks.slice(0, 8);

  return (
    <section
      aria-labelledby="extracted-document-preview-heading"
      className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--canvas-card)] shadow-editorial overflow-hidden transition-all duration-200"
    >
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-subtle)] px-6 py-5 bg-[var(--canvas-card-subtle)]">
        <div className="flex items-start sm:items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-accent-bg)] text-[var(--brand-emerald)] border border-[var(--brand-accent-border)] shadow-xs">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${badge.color}`}
              >
                {badge.label}
              </span>
              <span className="font-editorial-mono text-xs text-[var(--text-faint)]">
                {formatFileSize(document.fileSize)}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] text-[var(--brand-emerald)] font-medium">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Extracted in memory</span>
              </span>
            </div>
            <h3
              id="extracted-document-preview-heading"
              className="mt-1 font-editorial-serif text-lg sm:text-xl font-bold tracking-tight text-[var(--text-main)] truncate max-w-lg"
              title={document.fileName}
            >
              {document.fileName}
            </h3>
          </div>
        </div>

        {/* Structural Metrics Chips */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {document.pageCount && (
            <div className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--canvas-card)] px-2.5 py-1 text-[var(--text-muted)] font-editorial-mono">
              <BookOpen className="h-3.5 w-3.5 text-[var(--brand-emerald)]" />
              <span>
                <strong className="text-[var(--text-main)]">{document.pageCount}</strong>{' '}
                {document.pageCount === 1 ? 'Page' : 'Pages'}
              </span>
            </div>
          )}

          <div className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--canvas-card)] px-2.5 py-1 text-[var(--text-muted)] font-editorial-mono">
            <Layers className="h-3.5 w-3.5 text-[var(--brand-emerald)]" />
            <span>
              <strong className="text-[var(--text-main)]">{document.blocks.length}</strong>{' '}
              {document.blocks.length === 1 ? 'Block' : 'Blocks'}
            </span>
          </div>

          <div className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--canvas-card)] px-2.5 py-1 text-[var(--text-muted)] font-editorial-mono">
            <span>
              <strong className="text-[var(--text-main)]">{wordCount.toLocaleString()}</strong> words
            </span>
          </div>
        </div>
      </div>

      {/* Sample Document Notice Banner */}
      {document.isSample && (
        <div className="border-b border-[var(--brand-accent-border)] bg-[var(--brand-accent-bg)] px-6 py-3.5 text-xs text-[var(--brand-accent-text)] flex items-start gap-2.5">
          <FlaskConical className="h-4 w-4 shrink-0 text-[var(--brand-emerald)] mt-0.5" />
          <div className="leading-relaxed">
            <strong>Illustrative Research Paper Excerpt:</strong> This sample document demonstrates ChapterLens&apos;s real analysis pipeline. Readability scores, sentence difficulty rankings, and guided reading features are computed live from this text. Click <strong>Start Guided Reading</strong> to explore sentence explanations or <strong>Run Readability Audit</strong> to evaluate syntactic cadence.
          </div>
        </div>
      )}

      {/* Warnings & Notices Banner (e.g. Scanned pages or skipped complex formatting) */}
      {document.warnings.length > 0 && (
        <div className="border-b border-amber-200 bg-amber-50/70 dark:border-amber-900/60 dark:bg-amber-950/30 px-6 py-3.5 text-xs text-amber-900 dark:text-amber-200 space-y-1.5">
          <div className="flex items-center gap-2 font-semibold">
            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>Extraction Notices ({document.warnings.length}):</span>
          </div>
          <ul className="list-disc pl-5 space-y-1 text-[11px] leading-relaxed text-amber-800 dark:text-amber-300">
            {document.warnings.map((w, index) => (
              <li key={index}>
                {w.pageNumber ? <strong>Page {w.pageNumber}: </strong> : null}
                <span>{w.message}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Structured Text Preview Area (Safely renders only text strings, never untrusted HTML) */}
      <div className="p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between text-xs font-semibold text-[var(--text-muted)] border-b border-[var(--border-subtle)] pb-2">
          <span>Extracted Prose & Structure Preview</span>
          <span className="font-editorial-mono text-[11px] text-[var(--text-faint)]">
            Showing {previewBlocks.length} of {document.blocks.length} blocks
          </span>
        </div>

        <div className="max-h-[380px] overflow-y-auto custom-scrollbar space-y-3.5 pr-2 font-editorial-serif text-[15px] sm:text-[16px] leading-relaxed text-[var(--text-main)]">
          {previewBlocks.map((block) => {
            if (block.type === 'heading') {
              return (
                <div
                  key={block.id}
                  className="rounded-lg bg-[var(--canvas-card-subtle)] border-l-4 border-[var(--brand-emerald)] p-3 my-2"
                >
                  <div className="flex items-center gap-2 text-[10px] uppercase font-editorial-mono font-bold text-[var(--brand-emerald)] mb-1">
                    <span>Heading {block.level || 1}</span>
                    {block.pageNumber && <span>· Page {block.pageNumber}</span>}
                  </div>
                  <h4 className="font-editorial-serif text-base sm:text-lg font-bold text-[var(--text-main)]">
                    {block.text}
                  </h4>
                </div>
              );
            }

            return (
              <div key={block.id} className="relative group">
                {(block.pageNumber || block.sectionHeading) && (
                  <div className="text-[10px] font-editorial-mono text-[var(--text-faint)] mb-1 flex items-center gap-2 select-none">
                    {block.pageNumber && (
                      <span className="rounded bg-[var(--canvas-card-subtle)] px-1.5 py-0.5 border border-[var(--border-subtle)]">
                        Page {block.pageNumber}
                      </span>
                    )}
                    {block.sectionHeading && (
                      <span className="italic truncate max-w-xs">
                        § {block.sectionHeading}
                      </span>
                    )}
                  </div>
                )}
                <p className="text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors">
                  {block.text}
                </p>
              </div>
            );
          })}
        </div>

        {document.blocks.length > 8 && (
          <div className="pt-2 flex justify-center">
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--canvas-card-subtle)] px-3 py-1.5 text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-main)] hover:border-[var(--brand-emerald)] transition-colors"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="h-3.5 w-3.5 text-[var(--brand-emerald)]" />
                  <span>Show Fewer Blocks</span>
                </>
              ) : (
                <>
                  <ChevronDown className="h-3.5 w-3.5 text-[var(--brand-emerald)]" />
                  <span>Show All {document.blocks.length} Blocks</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Action Bar & Clear Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[var(--border-subtle)] bg-[var(--canvas-card-subtle)] px-6 py-4">
        {/* Replace or Clear actions */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onReplace}
            disabled={isAnalyzing}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--canvas-card)] px-3.5 py-2 text-xs font-semibold text-[var(--text-main)] shadow-editorial-sm hover:border-[var(--border-strong)] hover:bg-[var(--canvas-card-hover)] transition-colors focus-visible:outline-2 focus-visible:outline-[var(--brand-emerald)]"
          >
            <RefreshCw className="h-3.5 w-3.5 text-[var(--brand-emerald)]" />
            <span>{document.isSample ? 'Replace with My Document' : 'Replace File'}</span>
          </button>

          {showClearConfirm ? (
            <div className="flex items-center gap-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 px-2.5 py-1 border border-rose-200 dark:border-rose-900 animate-in fade-in">
              <span className="text-xs font-medium text-rose-800 dark:text-rose-300">
                {document.isSample ? 'Clear sample document?' : 'Clear document?'}
              </span>
              <button
                type="button"
                onClick={onClear}
                className="rounded bg-rose-700 px-2 py-0.5 text-xs font-semibold text-white hover:bg-rose-800 transition-colors"
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="rounded border border-[var(--border-strong)] bg-[var(--canvas-card)] px-2 py-0.5 text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
              >
                No
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowClearConfirm(true)}
              disabled={isAnalyzing}
              className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium text-[var(--text-faint)] hover:text-rose-600 dark:hover:text-rose-400 hover:bg-[var(--canvas-card-hover)] transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>{document.isSample ? 'Clear Sample' : 'Clear'}</span>
            </button>
          )}
        </div>

        {/* Actions Group */}
        <div className="flex flex-wrap items-center gap-3">
          {onStartGuidedReading && (
            <button
              id="start-guided-reading-button"
              type="button"
              disabled={isAnalyzing}
              onClick={onStartGuidedReading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--brand-forest)] px-5 py-2.5 text-sm font-semibold text-white shadow-editorial transition-all hover:bg-[var(--brand-forest-hover)] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-[var(--brand-emerald)] disabled:opacity-50"
            >
              <BookOpen className="h-4 w-4 text-[var(--brand-forest-light)]" />
              <span>Start Guided Reading</span>
            </button>
          )}

          <button
            id="analyze-imported-document-button"
            type="button"
            disabled={isAnalyzing}
            onClick={onAnalyze}
            className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all focus-visible:outline-2 focus-visible:outline-[var(--brand-emerald)] disabled:opacity-50 ${
              onStartGuidedReading
                ? 'border border-[var(--border-strong)] bg-[var(--canvas-card)] text-[var(--text-main)] hover:border-[var(--brand-emerald)] hover:bg-[var(--canvas-card-hover)] shadow-editorial-sm'
                : 'bg-[var(--brand-forest)] text-white shadow-editorial hover:bg-[var(--brand-forest-hover)]'
            }`}
          >
            <Sparkles className="h-4 w-4 text-[var(--brand-emerald)]" />
            <span>{isAnalyzing ? 'Analyzing Cadence...' : 'Run Readability Audit'}</span>
          </button>
        </div>
      </div>

      {/* Visible Privacy Reassurance */}
      <div className="flex items-center justify-center sm:justify-start gap-2 border-t border-[var(--border-subtle)] px-6 py-2.5 text-[11px] text-[var(--text-faint)] bg-[var(--canvas-card)]">
        <ShieldCheck className="h-3.5 w-3.5 text-[var(--brand-emerald)] shrink-0" />
        <span>
          Extracted locally in browser memory. Zero files or text transmitted to any server.
        </span>
      </div>
    </section>
  );
}
