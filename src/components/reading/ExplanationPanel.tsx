'use client';

import React, { useState } from 'react';
import {
  ExplanationLevel,
  PassageExplanation,
  SelectedPassage,
} from '../../lib/reading/types';
import {
  Sparkles,
  BookOpen,
  ArrowLeft,
  CheckCircle2,
  HelpCircle,
  AlertTriangle,
  Loader2,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  BookMarked,
  Layers,
  X,
  ExternalLink,
} from 'lucide-react';

interface ExplanationPanelProps {
  selectedPassage: SelectedPassage | null;
  currentExplanation: PassageExplanation | null;
  currentLevel: ExplanationLevel;
  onChangeLevel: (level: ExplanationLevel) => void;
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  onExploreConcept: (conceptName: string) => void;
  onReturnToReading: () => void;
  onClose: () => void;
  providerConfigured: boolean;
}

export function ExplanationPanel({
  selectedPassage,
  currentExplanation,
  currentLevel,
  onChangeLevel,
  isLoading,
  error,
  onRetry,
  onExploreConcept,
  onReturnToReading,
  onClose,
  providerConfigured,
}: ExplanationPanelProps) {
  const [showAnswer, setShowAnswer] = useState(false);

  if (!selectedPassage) {
    return (
      <aside
        aria-label="Guided Explanation Panel"
        className="flex flex-col w-full lg:w-96 rounded-2xl border border-[var(--border-subtle)] bg-[var(--canvas-card)] shadow-editorial p-6 text-center justify-center items-center space-y-4 shrink-0 transition-all duration-200 min-h-[380px]"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--canvas-card-subtle)] border border-[var(--border-subtle)] text-[var(--brand-emerald)]">
          <BookMarked className="h-6 w-6" />
        </div>
        <div className="space-y-1.5 max-w-xs">
          <h3 className="font-editorial-serif text-base sm:text-lg font-bold text-[var(--text-main)]">
            Passage Explanations
          </h3>
          <p className="text-xs text-[var(--text-muted)] leading-relaxed">
            Click any sentence or technical term in the paper to view guided explanations, prerequisite concepts, and context analysis.
          </p>
        </div>
        <div className="text-[11px] font-editorial-mono text-[var(--text-faint)] rounded-lg bg-[var(--canvas-card-subtle)] border border-[var(--border-subtle)] px-3 py-1.5">
          Tip: Switch between Beginner, Step by Step, and Technical views at any time.
        </div>
      </aside>
    );
  }

  const levelOptions: Array<{
    id: ExplanationLevel;
    label: string;
    icon: string;
    desc: string;
  }> = [
    { id: 'beginner', label: 'Beginner', icon: '🌱', desc: 'Clear everyday language and intuitive analogies' },
    { id: 'step-by-step', label: 'Step by Step', icon: '🪜', desc: 'Logical breakdown of premise, mechanism, and conclusion' },
    { id: 'technical', label: 'Technical', icon: '🔬', desc: 'Rigorous terminology, methods, and assumptions' },
  ];

  return (
    <aside
      id="explanation-panel-container"
      aria-label="Passage Explanation and Guided Reading"
      className="flex flex-col w-full lg:w-96 rounded-2xl border border-[var(--border-subtle)] bg-[var(--canvas-card)] shadow-editorial overflow-hidden shrink-0 transition-all duration-200"
    >
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-5 py-3.5 bg-[var(--canvas-card-subtle)]">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--brand-accent-bg)] text-[var(--brand-emerald)] border border-[var(--brand-accent-border)] text-xs font-bold">
            <Sparkles className="h-3.5 w-3.5" />
          </span>
          <span className="font-editorial-serif text-sm font-bold text-[var(--text-main)]">
            Guided Explanation
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onReturnToReading}
            title="Return to Reading"
            className="rounded-lg px-2.5 py-1 text-xs font-semibold text-[var(--brand-emerald)] hover:bg-[var(--canvas-card-hover)] transition-colors inline-flex items-center gap-1"
          >
            <ArrowLeft className="h-3 w-3" />
            <span>Back</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close explanation panel"
            className="rounded-lg p-1 text-[var(--text-faint)] hover:text-[var(--text-main)] hover:bg-[var(--canvas-card-hover)] transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Target Passage Quote Callout */}
      <div className="border-b border-[var(--border-subtle)] p-4 bg-[var(--canvas-card)] space-y-2">
        <div className="flex items-center justify-between text-[11px] font-editorial-mono text-[var(--text-faint)]">
          <span className="font-bold text-[var(--brand-emerald)] uppercase">Selected Passage</span>
          <div className="flex items-center gap-1.5">
            {selectedPassage.sourceLocation.pageNumber && (
              <span className="rounded bg-[var(--canvas-card-subtle)] border border-[var(--border-subtle)] px-1.5 py-0.5">
                Page {selectedPassage.sourceLocation.pageNumber}
              </span>
            )}
            {selectedPassage.sourceLocation.sectionHeading && (
              <span className="italic truncate max-w-[130px]" title={selectedPassage.sourceLocation.sectionHeading}>
                § {selectedPassage.sourceLocation.sectionHeading}
              </span>
            )}
          </div>
        </div>

        <blockquote className="font-editorial-serif text-xs italic leading-relaxed text-[var(--text-main)] border-l-2 border-[var(--brand-emerald)] pl-2.5">
          &ldquo;{selectedPassage.text}&rdquo;
        </blockquote>
      </div>

      {/* Level Selection Tabs (Beginner / Step by Step / Technical) */}
      <div className="border-b border-[var(--border-subtle)] bg-[var(--canvas-card-subtle)] p-2">
        <div className="grid grid-cols-3 gap-1 rounded-xl bg-[var(--canvas-card)] p-1 border border-[var(--border-subtle)]">
          {levelOptions.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => {
                setShowAnswer(false);
                onChangeLevel(opt.id);
              }}
              title={opt.desc}
              className={`rounded-lg py-1.5 text-center text-xs font-semibold transition-all focus-visible:outline-2 focus-visible:outline-[var(--brand-emerald)] ${
                currentLevel === opt.id
                  ? 'bg-[var(--brand-forest)] text-white shadow-xs'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--canvas-card-hover)]'
              }`}
            >
              <span className="mr-1">{opt.icon}</span>
              <span>{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Explanation Scrollable Body */}
      <div className="max-h-[500px] overflow-y-auto custom-scrollbar p-5 space-y-5">
        {/* Unconfigured Provider Notice */}
        {!providerConfigured && (
          <div className="rounded-xl border border-amber-300 bg-amber-50 dark:bg-amber-950/40 dark:border-amber-800 p-3.5 text-xs text-amber-900 dark:text-amber-200 space-y-1.5">
            <div className="flex items-center gap-2 font-semibold">
              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>AI Explanations Not Configured</span>
            </div>
            <p className="text-[11px] leading-relaxed text-amber-800 dark:text-amber-300">
              To enable multi-level explanations, set an API key in your environment (<code>GEMINI_API_KEY</code>, <code>OPENAI_API_KEY</code>, or <code>ANTHROPIC_API_KEY</code>). All document reading, structural navigation, and local readability analysis remain 100% available offline.
            </p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="py-8 text-center space-y-3 animate-in fade-in">
            <div className="flex h-10 w-10 mx-auto items-center justify-center rounded-xl bg-[var(--brand-accent-bg)] text-[var(--brand-emerald)] border border-[var(--brand-accent-border)]">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
            <p className="font-editorial-serif text-xs text-[var(--text-muted)] font-semibold">
              Synthesizing {currentLevel} explanation...
            </p>
            <p className="text-[10px] text-[var(--text-faint)] font-editorial-mono">
              Grounding in passage context
            </p>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="rounded-xl border border-rose-200 bg-rose-50/80 p-3.5 text-xs text-rose-900 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-200 space-y-2">
            <p className="font-semibold">{error}</p>
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex items-center gap-1 rounded-lg bg-rose-700 px-3 py-1 text-xs font-semibold text-white hover:bg-rose-800 transition-colors"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* Explanation Content */}
        {currentExplanation && !isLoading && (
          <div className="space-y-4 animate-in fade-in">
            {/* Main Explanation */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-editorial-mono text-[var(--text-faint)]">
                <span className="font-bold text-[var(--text-main)] uppercase tracking-wider">
                  {currentLevel === 'beginner'
                    ? 'Plain Language Concept'
                    : currentLevel === 'step-by-step'
                    ? 'Logical Decomposition'
                    : 'Technical Formulation'}
                </span>
              </div>
              <p className="font-editorial-sans text-xs sm:text-sm leading-relaxed text-[var(--text-main)]">
                {currentExplanation.explanation}
              </p>
            </div>

            {/* Terminology Definitions */}
            {currentExplanation.terms && currentExplanation.terms.length > 0 && (
              <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--canvas-card-subtle)] p-3 space-y-2">
                <span className="text-[10px] font-editorial-mono font-bold uppercase tracking-wider text-[var(--brand-emerald)]">
                  Key Terminology
                </span>
                <div className="space-y-1.5">
                  {currentExplanation.terms.map((t, idx) => (
                    <div key={idx} className="text-xs leading-normal">
                      <strong className="text-[var(--text-main)] font-semibold">{t.term}: </strong>
                      <span className="text-[var(--text-muted)]">{t.definition}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Section Context Fit */}
            {currentExplanation.contextFit && (
              <div className="text-xs text-[var(--text-muted)] leading-relaxed border-t border-[var(--border-subtle)] pt-3">
                <strong className="text-[var(--text-main)] font-semibold">Context in section: </strong>
                <span>{currentExplanation.contextFit}</span>
              </div>
            )}

            {/* Prerequisite Concepts */}
            {currentExplanation.prerequisites && currentExplanation.prerequisites.length > 0 && (
              <div className="border-t border-[var(--border-subtle)] pt-3 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-editorial-mono font-bold uppercase tracking-wider text-[var(--brand-emerald)]">
                    Prerequisites to Understand
                  </span>
                  <span className="text-[10px] text-[var(--text-faint)] font-editorial-mono">
                    {currentExplanation.prerequisites.length} concepts
                  </span>
                </div>

                <div className="space-y-2">
                  {currentExplanation.prerequisites.map((prereq, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-[var(--border-subtle)] bg-[var(--canvas-card)] p-3 text-xs space-y-1 hover:border-[var(--brand-emerald)]/70 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <strong className="text-[var(--text-main)] font-semibold">{prereq.name}</strong>
                        <button
                          type="button"
                          onClick={() => onExploreConcept(prereq.name)}
                          className="shrink-0 text-[10px] font-bold text-[var(--brand-emerald)] hover:underline inline-flex items-center gap-0.5"
                        >
                          <span>Explore</span>
                          <ExternalLink className="h-2.5 w-2.5" />
                        </button>
                      </div>
                      <p className="text-[11px] text-[var(--text-muted)] leading-normal">{prereq.definition}</p>
                      <p className="text-[10px] text-[var(--text-faint)] italic">
                        Why it matters: {prereq.whyItMatters}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Lightweight Comprehension Check */}
            {currentExplanation.comprehensionCheck && (
              <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--canvas-card-subtle)] p-3.5 space-y-2.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--text-main)]">
                  <HelpCircle className="h-4 w-4 text-[var(--brand-emerald)]" />
                  <span>Comprehension Check</span>
                </div>

                <p className="text-xs text-[var(--text-muted)] leading-relaxed font-medium">
                  {currentExplanation.comprehensionCheck.question}
                </p>

                {showAnswer ? (
                  <div className="rounded-lg bg-[var(--canvas-card)] border border-[var(--border-subtle)] p-2.5 text-xs space-y-1 animate-in fade-in">
                    <div className="flex items-center gap-1 text-[var(--brand-emerald)] font-bold text-[11px]">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Answer: {currentExplanation.comprehensionCheck.answer}</span>
                    </div>
                    <p className="text-[11px] text-[var(--text-muted)] leading-normal">
                      {currentExplanation.comprehensionCheck.explanation}
                    </p>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowAnswer(true)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--brand-emerald)] hover:underline"
                  >
                    <span>Reveal Answer & Explanation</span>
                    <ChevronDown className="h-3 w-3" />
                  </button>
                )}
              </div>
            )}

            {/* Source Grounding & Limitations Notice */}
            {currentExplanation.limitationsNotice && (
              <div className="rounded-xl border border-amber-200 bg-amber-50/70 dark:border-amber-900/40 dark:bg-amber-950/20 p-2.5 text-[11px] text-amber-900 dark:text-amber-200 flex items-start gap-2">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Document Limitation:</strong> {currentExplanation.limitationsNotice}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Return to Reading CTA */}
      <div className="border-t border-[var(--border-subtle)] px-4 py-3 bg-[var(--canvas-card-subtle)] flex items-center justify-between">
        <span className="text-[11px] font-editorial-mono text-[var(--text-faint)]">
          {currentExplanation?.fromCache ? 'Cached in memory' : 'Source grounded'}
        </span>
        <button
          type="button"
          onClick={onReturnToReading}
          className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--brand-forest)] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[var(--brand-forest-hover)] active:scale-[0.98] transition-all focus-visible:outline-2 focus-visible:outline-[var(--brand-emerald)]"
        >
          <ArrowLeft className="h-3 w-3" />
          <span>Return to Reading</span>
        </button>
      </div>
    </aside>
  );
}
