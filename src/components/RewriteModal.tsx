'use client';

import React, { useState, useEffect } from 'react';
import { DifficultSentence } from '../lib/linguistics/types';
import { X, Copy, Check, Sparkles, Shield, AlertCircle, RefreshCw, Feather } from 'lucide-react';

interface RewriteModalProps {
  sentence: DifficultSentence | null;
  onClose: () => void;
}

export function RewriteModal({ sentence, onClose }: RewriteModalProps) {
  const [apiStatus, setApiStatus] = useState<{ available: boolean; provider?: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [rationale, setRationale] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!sentence) return;

    // Check if rewriting API route is configured
    fetch('/api/rewrite')
      .then((res) => res.json())
      .then((data) => setApiStatus(data))
      .catch(() => setApiStatus({ available: false }));
  }, [sentence]);

  if (!sentence) return null;

  const handleRequestRewrite = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/rewrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sentence: sentence.text }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setErrorMessage(data.error || 'Failed to generate rewrites.');
      } else {
        setSuggestions(data.suggestions || []);
        setRationale(data.rationale || null);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error connecting to rewriting service.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopySuggestion = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="rewrite-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 sm:p-6"
    >
      <div className="relative w-full max-w-2xl rounded-2xl border border-[#E6E4D9] bg-white p-6 shadow-2xl sm:p-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 rounded-lg p-1.5 text-[#7A817D] hover:bg-[#F5F4EE] hover:text-[#1C1E1D] focus-visible:outline-2 focus-visible:outline-[#1A3C2D]"
          aria-label="Close dialog"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2 text-[#1A3C2D]">
          <Feather className="h-5 w-5 text-[#537562]" />
          <span className="text-xs font-bold uppercase tracking-wider text-[#537562]">
            Editorial Revision Studio
          </span>
        </div>
        <h3
          id="rewrite-modal-title"
          className="mt-1 font-editorial-serif text-2xl font-bold tracking-tight text-[#1C1E1D]"
        >
          Untangle Difficult Sentence #{sentence.rank}
        </h3>

        {/* Original Sentence Display */}
        <div className="mt-4 rounded-xl border border-[#E6E4D9] bg-[#FBFBF9] p-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#7A817D]">
            Original Sentence ({sentence.signals.wordCount} words)
          </span>
          <p className="mt-2 font-editorial-serif text-base italic leading-relaxed text-[#1C1E1D]">
            “{sentence.text}”
          </p>
          <p className="mt-2 text-xs text-[#5E6460]">
            <strong className="text-[#2C302E]">Friction Point:</strong> {sentence.explanation}
          </p>
        </div>

        {/* Deterministic Editing Suggestion (Always Available & 100% Private) */}
        {sentence.suggestedRewrite ? (
          <div className="mt-5 rounded-xl border border-[#CBD9D0] bg-[#F4F8F5] p-4 text-left">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#D8E6DC] pb-2">
              <div className="flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-[#1A3C2D]" />
                <span className="text-xs font-bold text-[#1A3C2D]">
                  Deterministic Editing Tip (Rule-Based · Offline)
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleCopySuggestion(sentence.suggestedRewrite!, 100)}
                className="inline-flex items-center gap-1 rounded border border-[#CBD9D0] bg-white px-2.5 py-1 text-xs font-medium text-[#1A3C2D] hover:bg-[#EBF1ED] transition-colors"
                aria-label="Copy deterministic rewrite suggestion"
              >
                {copiedIndex === 100 ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                    <span className="text-emerald-700 font-semibold">Copied suggestion</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy suggestion</span>
                  </>
                )}
              </button>
            </div>
            <div className="mt-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#537562]">
                Suggested Revision:
              </span>
              <p className="mt-1 font-editorial-serif text-[15px] leading-relaxed text-[#1C1E1D]">
                “{sentence.suggestedRewrite}”
              </p>
            </div>
            {sentence.editorialTip && (
              <p className="mt-2 text-xs text-[#424744]">
                <strong>Diagnostic action:</strong> {sentence.editorialTip}
              </p>
            )}
          </div>
        ) : (
          <div className="mt-5 rounded-xl border border-[#CBD9D0] bg-[#F4F8F5] p-4 text-left">
            <span className="text-xs font-bold text-[#1A3C2D]">
              Deterministic Editing Tip (Rule-Based · Offline)
            </span>
            <p className="mt-1 text-xs text-[#2C302E]">
              {sentence.editorialTip || sentence.explanation}
            </p>
          </div>
        )}

        {/* Manual Craft Guidelines (Always Available Offline) */}
        <div className="mt-5 rounded-xl border border-[#E6E4D9] bg-[#FBFBF9] p-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#424744]">
            Authorial Craft Checkpoints
          </h4>
          <ul className="mt-2 space-y-1.5 text-xs text-[#5E6460]">
            <li className="flex items-start gap-1.5">
              <span className="font-bold text-[#1A3C2D]">•</span>
              <span><strong>Split at the pivot:</strong> Locate the primary conjunction or semicolon to turn one long sentence into two punchy statements.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="font-bold text-[#1A3C2D]">•</span>
              <span><strong>Swap multisyllabic terms:</strong> Replace formal Latinate vocabulary with direct Anglo-Saxon roots (e.g., &quot;utilize&quot; → &quot;use&quot;).</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="font-bold text-[#1A3C2D]">•</span>
              <span><strong>Eliminate parenthetical asides:</strong> Pull em dashes or bracketed thoughts into their own independent sentence to give the reader a breath.</span>
            </li>
          </ul>
        </div>

        {/* AI Assisted Rewriting Section */}
        <div className="mt-5 border-t border-[#F0EFEA] pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1C1E1D]">
              <Sparkles className="h-3.5 w-3.5 text-[#C2632B]" />
              <span>Optional AI-Assisted Alternatives</span>
            </div>

            <div className="flex items-center gap-1 text-[11px] text-[#7A817D]">
              <Shield className="h-3 w-3 text-[#537562]" />
              <span>Sends only this single sentence</span>
            </div>
          </div>

          {apiStatus === null ? (
            <div className="mt-3 text-xs text-[#7A817D]">Checking service availability...</div>
          ) : !apiStatus.available ? (
            <div className="mt-3 rounded-lg border border-[#E6E4D9] bg-[#F5F4EE] p-3 text-xs text-[#5E6460]">
              <div className="flex items-center gap-1.5 font-semibold text-[#2C302E]">
                <AlertCircle className="h-3.5 w-3.5 text-[#7A817D]" />
                <span>AI Rewriting Service Not Configured</span>
              </div>
              <p className="mt-1">
                ChapterLens operates 100% privately in offline mode without requiring external API keys. All readability scores and deterministic editing tips above run inside your browser. To enable optional AI suggestions, configure GEMINI_API_KEY, OPENAI_API_KEY, or ANTHROPIC_API_KEY in your deployment environment.
              </p>
            </div>
          ) : (
            <div className="mt-3 space-y-3">
              <p className="text-[11px] text-[#537562]">
                Connected provider: <strong>{apiStatus.provider || 'AI Provider'}</strong>. Click below to generate 2 alternative cadences.
              </p>
              {suggestions.length === 0 && !loading && (
                <button
                  onClick={handleRequestRewrite}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#1A3C2D] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#122B20] focus-visible:outline-2 focus-visible:outline-[#1A3C2D]"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Generate 2 Simplified Variations</span>
                </button>
              )}

              {loading && (
                <div className="flex items-center gap-2 py-4 text-xs font-medium text-[#1A3C2D]">
                  <RefreshCw className="h-4 w-4 animate-spin text-[#1A3C2D]" />
                  <span>Analyzing cadence and generating simplified suggestions...</span>
                </div>
              )}

              {errorMessage && (
                <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-800 border border-rose-200">
                  {errorMessage}
                </div>
              )}

              {suggestions.length > 0 && (
                <div className="space-y-3">
                  {suggestions.map((suggestion, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-[#E6E4D9] bg-[#FBFBF9] p-3 text-left"
                    >
                      <div className="flex items-center justify-between border-b border-[#F0EFEA] pb-2">
                        <span className="text-[11px] font-bold text-[#537562]">
                          Option {idx === 0 ? 'A (Direct & Clear)' : 'B (Rhythmic)'}
                        </span>
                        <button
                          onClick={() => handleCopySuggestion(suggestion, idx)}
                          className="inline-flex items-center gap-1 rounded border border-[#CDC9B8] bg-white px-2 py-0.5 text-[11px] font-medium text-[#2C302E] hover:bg-[#F5F4EE]"
                        >
                          {copiedIndex === idx ? (
                            <>
                              <Check className="h-3 w-3 text-emerald-600" />
                              <span className="text-emerald-700">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                      <p className="mt-2 font-editorial-serif text-sm leading-relaxed text-[#1C1E1D]">
                        “{suggestion}”
                      </p>
                    </div>
                  ))}

                  {rationale && (
                    <p className="text-xs text-[#5E6460] italic">
                      <strong>Editorial note:</strong> {rationale}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end border-t border-[#F0EFEA] pt-4">
          <button
            onClick={onClose}
            className="rounded-lg border border-[#CDC9B8] bg-white px-4 py-2 text-xs font-semibold text-[#1C1E1D] hover:bg-[#F5F4EE]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
