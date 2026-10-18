'use client';

import React from 'react';
import { AlertCircle, RotateCcw, XCircle } from 'lucide-react';
import { ValidationErrorCode } from '../../lib/document/types';

interface ExtractionAlertProps {
  title?: string;
  message: string;
  recoveryGuidance?: string;
  code?: ValidationErrorCode;
  onDismiss?: () => void;
  onRetry?: () => void;
}

export function ExtractionAlert({
  title = 'Document Import Issue',
  message,
  recoveryGuidance,
  code,
  onDismiss,
  onRetry,
}: ExtractionAlertProps) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      className="rounded-2xl border border-rose-200 bg-rose-50/80 p-4 sm:p-5 dark:border-rose-900/60 dark:bg-rose-950/30 transition-all duration-200 animate-in fade-in"
    >
      <div className="flex items-start gap-3.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300">
          <AlertCircle className="h-4.5 w-4.5" />
        </div>

        <div className="flex-1 space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <h4 className="font-editorial-serif text-sm font-bold text-rose-900 dark:text-rose-200">
              {title}
            </h4>
            {code && (
              <span className="font-editorial-mono text-[10px] font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                {code}
              </span>
            )}
          </div>

          <p className="text-xs leading-relaxed text-rose-800 dark:text-rose-300">{message}</p>

          {recoveryGuidance && (
            <div className="rounded-xl border border-rose-200/80 bg-rose-100/40 p-2.5 text-[11px] leading-relaxed text-rose-900 dark:border-rose-900/40 dark:bg-rose-950/40 dark:text-rose-200 mt-2">
              <strong className="font-semibold">How to recover: </strong>
              <span>{recoveryGuidance}</span>
            </div>
          )}

          {(onRetry || onDismiss) && (
            <div className="flex items-center gap-2 pt-2">
              {onRetry && (
                <button
                  type="button"
                  onClick={onRetry}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-rose-700 px-3 py-1 text-xs font-semibold text-white shadow-xs hover:bg-rose-800 transition-colors focus-visible:outline-2 focus-visible:outline-rose-600"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Try Again</span>
                </button>
              )}
              {onDismiss && (
                <button
                  type="button"
                  onClick={onDismiss}
                  className="inline-flex items-center gap-1 rounded-lg border border-rose-300 px-2.5 py-1 text-xs font-medium text-rose-800 hover:bg-rose-100/60 dark:border-rose-800 dark:text-rose-300 dark:hover:bg-rose-900/40 transition-colors"
                >
                  <XCircle className="h-3 w-3" />
                  <span>Dismiss</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
