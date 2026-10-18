'use client';

import React, { useState, useEffect } from 'react';
import { DifficultSentence } from '../lib/linguistics/types';
import {
  X,
  Copy,
  Check,
  Sparkles,
  Shield,
  AlertCircle,
  AlertTriangle,
  RefreshCw,
  Feather,
  Wand2,
  Lightbulb,
  ArrowRight,
  ShieldCheck,
  BookmarkCheck,
  Eye,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ExternalDisclosureModal } from './reading/ExternalDisclosureModal';

interface RewriteModalProps {
  sentence: DifficultSentence | null;
  onClose: () => void;
  onApplyRevision?: (sentence: DifficultSentence, newText: string) => void;
}

export function RewriteModal({ sentence, onClose, onApplyRevision }: RewriteModalProps) {
  const [apiStatus, setApiStatus] = useState<{ available: boolean; provider?: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [rationale, setRationale] = useState<string | null>(null);
  const [preservedElements, setPreservedElements] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [appliedIndex, setAppliedIndex] = useState<number | null>(null);

  // Mixed-content extraction quality warning state
  const isMixedContent = Boolean(sentence?.extractionQuality?.isMixedContent);
  const [reviewedMixedContent, setReviewedMixedContent] = useState(false);
  const [contaminatedRefusal, setContaminatedRefusal] = useState<{
    warning: string;
    rationale: string;
  } | null>(null);

  // Consent state management
  const [hasConsented, setHasConsented] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      return sessionStorage.getItem('chapterlens-ai-consent') === 'true';
    } catch {
      return false;
    }
  });
  const [isDisclosureOpen, setIsDisclosureOpen] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isDisclosureOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, isDisclosureOpen]);

  useEffect(() => {
    if (!sentence) return;

    setReviewedMixedContent(false);
    setContaminatedRefusal(null);
    setSuggestions([]);
    setRationale(null);
    setPreservedElements(null);
    setErrorMessage(null);

    // Check if rewriting API route is configured
    fetch('/api/rewrite')
      .then((res) => res.json())
      .then((data) => setApiStatus(data))
      .catch(() => setApiStatus({ available: false }));
  }, [sentence?.id]);

  const handleLocateInDocument = () => {
    if (!sentence) return;
    const el = document.getElementById(`highlight-${sentence.id}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('ring-4', 'ring-[var(--brand-emerald)]');
      setTimeout(() => {
        el.classList.remove('ring-4', 'ring-[var(--brand-emerald)]');
      }, 1500);
    }
    onClose();
  };

  const executeRewriteRequest = async () => {
    if (!sentence) return;
    setLoading(true);
    setErrorMessage(null);
    setContaminatedRefusal(null);
    try {
      const res = await fetch('/api/rewrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sentence: sentence.text,
          consentConfirmed: true,
          reviewedMixedContent: isMixedContent ? reviewedMixedContent : true,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        if (res.status === 422 && data.code === 'MIXED_CONTENT_WARNING') {
          setErrorMessage(
            data.extractionQuality?.warningMessage ||
              'Extraction quality check failed: This passage contains mixed figure content. Please review the text and check the acknowledgement box before requesting an AI rewrite.'
          );
        } else {
          setErrorMessage(data.error || 'Failed to generate rewrites.');
        }
      } else if (data.warning === 'CONTAMINATED_SOURCE') {
        setContaminatedRefusal({
          warning: data.warning,
          rationale:
            data.rationale ||
            'The AI service identified contaminated figure content and refused to generate an ungrounded rewrite.',
        });
        setSuggestions([]);
      } else {
        setSuggestions(data.suggestions || []);
        setRationale(data.rationale || null);
        setPreservedElements(data.preservedElements || null);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error connecting to rewriting service.');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestRewrite = () => {
    if (!sentence) return;

    // Require explicit consent before transmitting manuscript text
    if (!hasConsented) {
      setIsDisclosureOpen(true);
      return;
    }

    executeRewriteRequest();
  };

  const handleConfirmDisclosure = () => {
    setIsDisclosureOpen(false);
    setHasConsented(true);
    try {
      sessionStorage.setItem('chapterlens-ai-consent', 'true');
    } catch {}
    executeRewriteRequest();
  };

  const handleCopySuggestion = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleApply = (text: string, index: number) => {
    if (!sentence || !onApplyRevision) return;
    setAppliedIndex(index);
    onApplyRevision(sentence, text);
    setTimeout(() => {
      onClose();
    }, 250);
  };

  return (
    <AnimatePresence>
      {sentence && (
        <motion.div
          key="rewrite-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="rewrite-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 sm:p-6"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isDisclosureOpen) onClose();
          }}
        >
          <motion.div
            key="rewrite-dialog"
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar rounded-2xl border border-[var(--border-strong)] bg-[var(--canvas-card)] p-6 sm:p-8 shadow-editorial-elevated transition-colors duration-200"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute right-5 top-5 rounded-lg p-1.5 text-[var(--text-faint)] hover:bg-[var(--canvas-card-hover)] hover:text-[var(--text-main)] transition-colors focus-visible:outline-2 focus-visible:outline-[var(--brand-emerald)]"
              aria-label="Close dialog"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-2 text-[var(--brand-emerald)]">
              <Feather className="h-5 w-5" />
              <span className="text-xs font-bold uppercase tracking-wider font-editorial-mono">
                {isMixedContent ? 'Extraction Review & Revision Studio' : 'Editorial Revision Studio'}
              </span>
            </div>
            <h3
              id="rewrite-modal-title"
              className="mt-1 font-editorial-serif text-2xl font-bold tracking-tight text-[var(--text-main)]"
            >
              {isMixedContent
                ? `Review Extracted Selection #${sentence.rank}`
                : `Untangle Difficult Sentence #${sentence.rank}`}
            </h3>

            {/* Extraction Quality Warning Banner if mixed figure content */}
            {isMixedContent && (
              <div className="mt-4 rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 p-4 sm:p-5 text-left">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h4 className="font-editorial-sans text-sm font-bold text-amber-900 dark:text-amber-200">
                        Extraction Quality Warning: Mixed Figure / Non-Prose Content
                      </h4>
                      <span className="rounded-full bg-amber-200/80 dark:bg-amber-900/80 px-2 py-0.5 text-[10px] font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider font-editorial-mono">
                        Ambiguous Boundaries
                      </span>
                    </div>
                    <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                      {sentence.extractionQuality?.warningMessage ||
                        'The selected text contains non-prose figure elements or ambiguous source boundaries (e.g. chart labels, axis ticks, or multiple figure captions). Rewriting mixed figure text can create inaccurate academic claims.'}
                    </p>

                    {sentence.extractionQuality?.reasons && sentence.extractionQuality.reasons.length > 0 && (
                      <ul className="list-disc pl-4 text-[11px] text-amber-800/90 dark:text-amber-300/90 space-y-0.5">
                        {sentence.extractionQuality.reasons.map((reason, idx) => (
                          <li key={idx}>{reason}</li>
                        ))}
                      </ul>
                    )}

                    <div className="pt-2 flex flex-wrap items-center gap-2 border-t border-amber-200 dark:border-amber-900/60">
                      <button
                        type="button"
                        onClick={handleLocateInDocument}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 dark:border-amber-700 bg-white dark:bg-neutral-900 px-3 py-1 text-xs font-semibold text-amber-900 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-neutral-800 transition-colors"
                      >
                        <Eye className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                        <span>Inspect in Document</span>
                      </button>
                      <button
                        type="button"
                        onClick={onClose}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 dark:border-amber-700 bg-white dark:bg-neutral-900 px-3 py-1 text-xs font-semibold text-amber-900 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-neutral-800 transition-colors"
                      >
                        <X className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                        <span>Select Smaller Passage</span>
                      </button>
                    </div>

                    <div className="pt-2 border-t border-amber-200 dark:border-amber-900/60">
                      <label className="flex items-start gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={reviewedMixedContent}
                          onChange={(e) => setReviewedMixedContent(e.target.checked)}
                          className="mt-0.5 h-4 w-4 rounded border-amber-400 text-[var(--brand-emerald)] focus:ring-[var(--brand-emerald)]"
                        />
                        <span className="text-xs font-medium text-amber-900 dark:text-amber-200">
                          I have inspected the source passage and acknowledge that this selection contains mixed figure elements before requesting an AI rewrite.
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Original Sentence Display */}
            <div className="mt-5 rounded-xl border border-[var(--border-subtle)] bg-[var(--canvas-card-subtle)] p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-faint)] font-editorial-mono">
                  Original Sentence ({sentence.signals.wordCount} words)
                </span>
                <span className="text-xs text-[var(--text-faint)] font-editorial-mono">
                  Friction: {sentence.difficultyScore}
                </span>
              </div>
              <p className="mt-2.5 font-editorial-serif text-[16px] italic leading-relaxed text-[var(--text-main)] border-l-2 border-[var(--border-strong)] pl-3.5">
                “{sentence.text}”
              </p>
              <p className="mt-2.5 text-xs text-[var(--text-muted)]">
                <strong className="text-[var(--text-main)]">Diagnostic:</strong> {sentence.explanation}
              </p>
            </div>

            {/* Deterministic Rule-Based Suggestion (Always Available & 100% Private) */}
            {sentence.suggestedRewrite ? (
              <div className="mt-5 rounded-xl border border-[var(--brand-accent-border)] bg-[var(--brand-accent-bg)] p-4 sm:p-5 text-left">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--brand-accent-border)] pb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-[var(--brand-emerald)]" />
                    <span className="text-xs font-bold text-[var(--brand-accent-text)]">
                      Deterministic Rule-Based Suggestion (100% Offline · Private)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopySuggestion(sentence.suggestedRewrite!, 100)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--brand-accent-border)] bg-[var(--canvas-card)] px-3 py-1 text-xs font-semibold text-[var(--brand-accent-text)] hover:bg-[var(--canvas-card-hover)] transition-colors focus-visible:outline-2 focus-visible:outline-[var(--brand-emerald)]"
                      aria-label="Copy deterministic rewrite suggestion"
                    >
                      {copiedIndex === 100 ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span className="text-emerald-700 dark:text-emerald-300">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>

                    {onApplyRevision && (
                      <button
                        type="button"
                        onClick={() => handleApply(sentence.suggestedRewrite!, 100)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--brand-forest)] px-3 py-1 text-xs font-semibold text-white hover:bg-[var(--brand-forest-hover)] transition-colors shadow-xs focus-visible:outline-2 focus-visible:outline-[var(--brand-emerald)]"
                        title="Apply this revision to your manuscript"
                      >
                        {appliedIndex === 100 ? (
                          <>
                            <BookmarkCheck className="h-3.5 w-3.5 text-emerald-400" />
                            <span>Applied!</span>
                          </>
                        ) : (
                          <>
                            <ArrowRight className="h-3.5 w-3.5" />
                            <span>Apply to Document</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-faint)] font-editorial-mono">
                    Suggested Revision:
                  </span>
                  <p className="mt-1 font-editorial-serif text-[16px] leading-relaxed text-[var(--text-main)]">
                    “{sentence.suggestedRewrite}”
                  </p>
                </div>
                {sentence.editorialTip && (
                  <p className="mt-2.5 text-xs text-[var(--text-muted)] border-t border-[var(--brand-accent-border)] pt-2">
                    <strong className="text-[var(--text-main)]">Diagnostic action:</strong>{' '}
                    {sentence.editorialTip}
                  </p>
                )}
              </div>
            ) : (
              <div className="mt-5 rounded-xl border border-[var(--brand-accent-border)] bg-[var(--brand-accent-bg)] p-4 text-left">
                <span className="text-xs font-bold text-[var(--brand-accent-text)]">
                  Deterministic Rule-Based Suggestion (100% Offline · Private)
                </span>
                <p className="mt-1 text-xs text-[var(--text-muted)]">
                  {sentence.editorialTip || sentence.explanation}
                </p>
              </div>
            )}

            {/* Manual Craft Checkpoints (Always Available Offline) */}
            <div className="mt-5 rounded-xl border border-[var(--border-subtle)] bg-[var(--canvas-card-subtle)] p-4 sm:p-5">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--text-main)] font-editorial-mono">
                <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
                <span>Authorial Craft Checkpoints</span>
              </div>
              <ul className="mt-3 space-y-2 text-xs text-[var(--text-muted)]">
                <li className="flex items-start gap-2">
                  <span className="font-bold text-[var(--brand-emerald)]">•</span>
                  <span>
                    <strong>Split at the pivot:</strong> Locate the primary conjunction or semicolon to turn one dense sentence into two rhythmic statements.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-[var(--brand-emerald)]">•</span>
                  <span>
                    <strong>Swap multisyllabic terms:</strong> Replace formal Latinate vocabulary with direct Anglo-Saxon roots (e.g., &quot;utilize&quot; → &quot;use&quot;).
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-[var(--brand-emerald)]">•</span>
                  <span>
                    <strong>Eliminate parenthetical asides:</strong> Pull em dashes or bracketed thoughts into their own independent sentence to give the reader a breath.
                  </span>
                </li>
              </ul>
            </div>

            {/* Optional AI Assisted Rewriting Section */}
            <div className="mt-5 border-t border-[var(--border-subtle)] pt-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-main)]">
                  <Wand2 className="h-3.5 w-3.5 text-amber-500" />
                  <span>Optional AI-Assisted Alternatives</span>
                </div>

                <div className="flex items-center gap-1 text-[11px] text-[var(--text-faint)]">
                  <Shield className="h-3 w-3 text-[var(--brand-emerald)]" />
                  <span>Transmits only this single sentence ({sentence.signals.wordCount} words)</span>
                </div>
              </div>

              {apiStatus === null ? (
                <div className="mt-3 text-xs text-[var(--text-faint)]">Checking service availability...</div>
              ) : !apiStatus.available ? (
                <div className="mt-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--canvas-card-subtle)] p-4 text-xs text-[var(--text-muted)]">
                  <div className="flex items-center gap-1.5 font-semibold text-[var(--text-main)]">
                    <AlertCircle className="h-4 w-4 text-[var(--text-faint)]" />
                    <span>AI Rewriting Service Not Configured</span>
                  </div>
                  <p className="mt-1.5 leading-relaxed">
                    ChapterLens operates 100% privately in offline mode without requiring external API keys. All readability scores and deterministic editing tips above run inside your browser. To enable optional AI suggestions, configure <code>GEMINI_API_KEY</code>, <code>OPENAI_API_KEY</code>, or <code>ANTHROPIC_API_KEY</code> in your deployment environment.
                  </p>
                </div>
              ) : (
                <div className="mt-3 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-[11px] text-[var(--brand-accent-text)]">
                      Connected provider: <strong>{apiStatus.provider || 'AI Provider'}</strong>. Click below to generate 2 alternative cadences.
                    </p>
                    {hasConsented && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-editorial-mono">
                        <ShieldCheck className="h-3 w-3" />
                        <span>Consent granted</span>
                      </span>
                    )}
                  </div>

                  {isMixedContent && !reviewedMixedContent ? (
                    <div className="rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50/70 dark:bg-amber-950/30 p-3 text-xs text-amber-900 dark:text-amber-200">
                      <p className="font-semibold flex items-center gap-1.5">
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                        <span>Review Required Before AI Rewriting</span>
                      </p>
                      <p className="mt-1 text-[11px] text-amber-800 dark:text-amber-300">
                        This selection contains non-prose figure elements. Please review the extraction warning above and check the confirmation box to proceed with an AI rewrite request.
                      </p>
                    </div>
                  ) : suggestions.length === 0 && !loading && !contaminatedRefusal && (
                    <button
                      onClick={handleRequestRewrite}
                      className="inline-flex items-center gap-2 rounded-xl bg-[var(--brand-forest)] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[var(--brand-forest-hover)] active:scale-[0.98] transition-all focus-visible:outline-2 focus-visible:outline-[var(--brand-emerald)]"
                    >
                      <Sparkles className="h-3.5 w-3.5 text-[var(--brand-forest-light)]" />
                      <span>Generate 2 Simplified Variations</span>
                    </button>
                  )}

                  {contaminatedRefusal && (
                    <div className="rounded-xl border border-rose-300 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 p-4 text-left space-y-2">
                      <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300 font-bold text-xs uppercase tracking-wider font-editorial-mono">
                        <AlertCircle className="h-4 w-4" />
                        <span>AI Grounding Protection: Refusal</span>
                      </div>
                      <p className="text-xs text-rose-900 dark:text-rose-200 font-medium leading-relaxed">
                        {contaminatedRefusal.rationale}
                      </p>
                      <p className="text-[11px] text-rose-700 dark:text-rose-400">
                        The AI copyeditor detected that this selection contains contaminated figure or chart fragments and refused to combine them into an ungrounded claim.
                      </p>
                    </div>
                  )}

                  {loading && (
                    <div className="flex items-center gap-2 py-4 text-xs font-medium text-[var(--brand-emerald)]">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Analyzing cadence and generating simplified suggestions...</span>
                    </div>
                  )}

                  {errorMessage && (
                    <div className="rounded-xl bg-rose-50 dark:bg-rose-950/40 p-3 text-xs text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
                      {errorMessage}
                    </div>
                  )}

                  {suggestions.length > 0 && (
                    <div className="space-y-3">
                      {suggestions.map((suggestion, idx) => (
                        <div
                          key={idx}
                          className="rounded-xl border border-[var(--border-subtle)] bg-[var(--canvas-card-subtle)] p-3.5 text-left"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-2">
                            <span className="text-[11px] font-bold text-[var(--brand-emerald)] font-editorial-mono">
                              Option {idx === 0 ? 'A (Direct & Clear)' : 'B (Rhythmic)'}
                            </span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleCopySuggestion(suggestion, idx)}
                                className="inline-flex items-center gap-1 rounded-lg border border-[var(--border-subtle)] bg-[var(--canvas-card)] px-2.5 py-1 text-[11px] font-medium text-[var(--text-main)] hover:bg-[var(--canvas-card-hover)] transition-colors"
                              >
                                {copiedIndex === idx ? (
                                  <>
                                    <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                                    <span className="text-emerald-700 dark:text-emerald-300">Copied</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="h-3 w-3 text-[var(--text-faint)]" />
                                    <span>Copy</span>
                                  </>
                                )}
                              </button>

                              {onApplyRevision && (
                                <button
                                  onClick={() => handleApply(suggestion, idx)}
                                  className="inline-flex items-center gap-1 rounded-lg bg-[var(--brand-forest)] px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-[var(--brand-forest-hover)] transition-colors shadow-xs"
                                  title="Replace this sentence in your working document"
                                >
                                  {appliedIndex === idx ? (
                                    <>
                                      <BookmarkCheck className="h-3 w-3 text-emerald-400" />
                                      <span>Applied!</span>
                                    </>
                                  ) : (
                                    <>
                                      <ArrowRight className="h-3 w-3" />
                                      <span>Apply to Document</span>
                                    </>
                                  )}
                                </button>
                              )}
                            </div>
                          </div>
                          <p className="mt-2 font-editorial-serif text-sm leading-relaxed text-[var(--text-main)]">
                            “{suggestion}”
                          </p>
                        </div>
                      ))}

                      {rationale && (
                        <p className="text-xs text-[var(--text-muted)] italic">
                          <strong>Editorial note:</strong> {rationale}
                        </p>
                      )}

                      {preservedElements && (
                        <div className="rounded-lg bg-[var(--canvas-card-subtle)] border border-[var(--border-subtle)] p-2.5 text-xs text-[var(--text-muted)]">
                          <span className="font-bold text-[var(--brand-emerald)] font-editorial-mono text-[10px] uppercase tracking-wider block">
                            Preserved Scientific & Literary Elements:
                          </span>
                          <span className="mt-0.5 block">{preservedElements}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="mt-6 flex justify-end border-t border-[var(--border-subtle)] pt-4">
              <button
                onClick={onClose}
                className="rounded-xl border border-[var(--border-strong)] bg-[var(--canvas-card)] px-4 py-2 text-xs font-semibold text-[var(--text-main)] hover:bg-[var(--canvas-card-hover)] transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>

          {/* Privacy Consent Disclosure Modal */}
          {isDisclosureOpen && (
            <ExternalDisclosureModal
              isOpen={isDisclosureOpen}
              providerName={apiStatus?.provider || 'Configured AI Provider'}
              purpose="rewrite"
              onConfirm={handleConfirmDisclosure}
              onCancel={() => setIsDisclosureOpen(false)}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
