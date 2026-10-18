'use client';

import React, { useState, useRef, useCallback } from 'react';
import {
  UploadCloud,
  FileText,
  FileCode,
  FileType,
  Loader2,
  X,
  AlertCircle,
  ShieldCheck,
  Info,
} from 'lucide-react';
import {
  extractDocument,
  formatFileSize,
  MAX_FILE_SIZE_BYTES,
} from '../../lib/document/documentService';
import {
  ExtractedDocument,
  ExtractionProgress,
  DocumentValidationError,
} from '../../lib/document/types';
import { ExtractionAlert } from './ExtractionAlert';

interface DocumentImportZoneProps {
  onDocumentExtracted: (doc: ExtractedDocument) => void;
  onSwitchToPaste: () => void;
}

export function DocumentImportZone({
  onDocumentExtracted,
  onSwitchToPaste,
}: DocumentImportZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [progress, setProgress] = useState<ExtractionProgress | null>(null);
  const [error, setError] = useState<{
    message: string;
    guidance?: string;
    code?: any;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleCancelExtraction = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsExtracting(false);
    setProgress(null);
  };

  const processFile = useCallback(
    async (file: File) => {
      setError(null);
      setIsExtracting(true);
      setProgress({
        stage: 'reading',
        percent: 5,
        message: `Opening ${file.name}...`,
      });

      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const doc = await extractDocument(file, {
          onProgress: (p) => setProgress(p),
          signal: controller.signal,
        });

        setIsExtracting(false);
        setProgress(null);
        abortControllerRef.current = null;
        onDocumentExtracted(doc);
      } catch (err: any) {
        setIsExtracting(false);
        setProgress(null);
        abortControllerRef.current = null;

        if (err?.code === 'ABORTED' || err?.message?.includes('cancelled')) {
          // User deliberately cancelled; do not display noisy error
          return;
        }

        if (err instanceof DocumentValidationError) {
          setError({
            message: err.message,
            guidance: err.recoveryGuidance,
            code: err.code,
          });
        } else {
          setError({
            message: err?.message || 'An unexpected error occurred while parsing the document.',
            guidance: 'Please ensure the file is not corrupted and try uploading again.',
          });
        }
      } finally {
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    },
    [onDocumentExtracted]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      processFile(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      processFile(file);
    }
  };

  return (
    <section aria-labelledby="document-import-heading" className="w-full space-y-4">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        id="document-file-input"
        accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
        onChange={handleFileInputChange}
        className="sr-only"
        aria-hidden="true"
        tabIndex={-1}
      />

      {/* Main Drag & Drop Card */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative rounded-2xl border-2 border-dashed p-8 sm:p-12 text-center transition-all duration-200 ${
          isDragging
            ? 'border-[var(--brand-emerald)] bg-[var(--brand-accent-bg)] shadow-editorial-elevated scale-[1.005]'
            : 'border-[var(--border-strong)] bg-[var(--canvas-card)] hover:border-[var(--brand-emerald)]/70 hover:bg-[var(--canvas-card-subtle)]'
        }`}
      >
        {isExtracting ? (
          /* Live Extraction Progress State */
          <div className="mx-auto max-w-md space-y-5 animate-in fade-in">
            <div className="flex h-14 w-14 mx-auto items-center justify-center rounded-2xl bg-[var(--brand-accent-bg)] text-[var(--brand-emerald)] border border-[var(--brand-accent-border)] shadow-xs animate-pulse">
              <Loader2 className="h-7 w-7 animate-spin" />
            </div>

            <div className="space-y-1.5">
              <h3 className="font-editorial-serif text-lg sm:text-xl font-bold text-[var(--text-main)]">
                Extracting Document Text...
              </h3>
              <p className="text-xs text-[var(--text-muted)] font-editorial-mono">
                {progress?.message || 'Processing manuscript structure locally in browser...'}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="w-full rounded-full bg-[var(--canvas-card-subtle)] border border-[var(--border-subtle)] p-1">
              <div
                className="h-2 rounded-full bg-[var(--brand-emerald)] transition-all duration-300 ease-out"
                style={{ width: `${progress?.percent || 15}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] font-editorial-mono text-[var(--text-faint)]">
              <span>{progress?.percent || 15}% Complete</span>
              {progress?.currentPage && progress?.totalPages && (
                <span>
                  Page {progress.currentPage} / {progress.totalPages}
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={handleCancelExtraction}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border-strong)] bg-[var(--canvas-card)] px-4 py-2 text-xs font-semibold text-[var(--text-muted)] hover:text-rose-600 hover:border-rose-300 dark:hover:text-rose-400 transition-colors focus-visible:outline-2 focus-visible:outline-rose-500"
            >
              <X className="h-3.5 w-3.5" />
              <span>Cancel Extraction</span>
            </button>
          </div>
        ) : (
          /* Default File Drop & Pick State */
          <div className="mx-auto max-w-xl space-y-5">
            <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-2xl bg-[var(--brand-accent-bg)] text-[var(--brand-emerald)] border border-[var(--brand-accent-border)] shadow-xs">
              <UploadCloud className="h-8 w-8" />
            </div>

            <div className="space-y-1.5">
              <h3
                id="document-import-heading"
                className="font-editorial-serif text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-main)]"
              >
                Drag and drop your manuscript file here
              </h3>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] max-w-md mx-auto leading-relaxed">
                Import chapters, research papers, or essays directly into the readability engine.
              </p>
            </div>

            {/* File Picker Button & Paste Alternative */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
              <button
                type="button"
                id="browse-files-button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 rounded-xl bg-[var(--brand-forest)] px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-editorial transition-all hover:bg-[var(--brand-forest-hover)] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-[var(--brand-emerald)]"
              >
                <FileText className="h-4 w-4 text-[var(--brand-forest-light)]" />
                <span>Browse Files on Device</span>
              </button>

              <button
                type="button"
                onClick={onSwitchToPaste}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border-strong)] bg-[var(--canvas-card)] px-4 py-2.5 text-xs sm:text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text-main)] hover:border-[var(--brand-emerald)] transition-colors focus-visible:outline-2 focus-visible:outline-[var(--brand-emerald)]"
              >
                <span>Or Paste Text Directly</span>
              </button>
            </div>

            {/* Format Chips & Badges */}
            <div className="pt-3 border-t border-[var(--border-subtle)] max-w-lg mx-auto">
              <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-editorial-mono">
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--canvas-card-subtle)] px-2.5 py-1 text-[var(--text-muted)]">
                  <FileType className="h-3.5 w-3.5 text-red-500" />
                  <strong>.PDF</strong> (Selectable text)
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--canvas-card-subtle)] px-2.5 py-1 text-[var(--text-muted)]">
                  <FileText className="h-3.5 w-3.5 text-blue-500" />
                  <strong>.DOCX</strong> (Word)
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--canvas-card-subtle)] px-2.5 py-1 text-[var(--text-muted)]">
                  <FileCode className="h-3.5 w-3.5 text-emerald-500" />
                  <strong>.TXT</strong> (Plain text)
                </span>
              </div>

              {/* Explicit OCR Limitation Note */}
              <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-[var(--text-faint)] leading-normal">
                <Info className="h-3.5 w-3.5 shrink-0 text-[var(--brand-emerald)]" />
                <span>
                  Text-based PDF extraction only. Scanned image PDFs requiring OCR are not supported. Max {formatFileSize(MAX_FILE_SIZE_BYTES)}.
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Error / Validation Alert Banner */}
      {error && (
        <ExtractionAlert
          message={error.message}
          recoveryGuidance={error.guidance}
          code={error.code}
          onDismiss={() => setError(null)}
          onRetry={() => {
            setError(null);
            fileInputRef.current?.click();
          }}
        />
      )}

      {/* Privacy Guarantee Reassurance */}
      <div className="flex items-center justify-center sm:justify-start gap-2 text-xs text-[var(--text-muted)] pt-1">
        <ShieldCheck className="h-4 w-4 text-[var(--brand-emerald)] shrink-0" />
        <span>
          100% In-Browser Ingestion. Your document is processed strictly in local browser memory and never uploaded to any remote server or database.
        </span>
      </div>
    </section>
  );
}
