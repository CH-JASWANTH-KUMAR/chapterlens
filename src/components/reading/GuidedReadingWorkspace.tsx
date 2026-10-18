'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ExtractedDocument, ExtractedBlock } from '../../lib/document/types';
import {
  ExplanationLevel,
  PassageExplanation,
  SelectedPassage,
} from '../../lib/reading/types';
import { DocumentNavigator } from './DocumentNavigator';
import { ReadingPane } from './ReadingPane';
import { ExplanationPanel } from './ExplanationPanel';
import { ExternalDisclosureModal } from './ExternalDisclosureModal';
import { Sparkles, BookOpen, Layers } from 'lucide-react';

interface GuidedReadingWorkspaceProps {
  document: ExtractedDocument;
  onSelectDifficultSentenceFromOutside?: SelectedPassage | null;
}

export function GuidedReadingWorkspace({
  document,
  onSelectDifficultSentenceFromOutside,
}: GuidedReadingWorkspaceProps) {
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const [selectedPassage, setSelectedPassage] = useState<SelectedPassage | null>(null);
  const [currentLevel, setCurrentLevel] = useState<ExplanationLevel>('beginner');
  const [isNavigatorOpen, setIsNavigatorOpen] = useState(true);

  // In-memory cache for generated explanations across levels and concepts
  const [explanationCache, setExplanationCache] = useState<Record<string, PassageExplanation>>({});
  const [isLoadingExplanation, setIsLoadingExplanation] = useState(false);
  const [explanationError, setExplanationError] = useState<string | null>(null);

  // AI disclosure and provider availability state
  const [isDisclosureOpen, setIsDisclosureOpen] = useState(false);
  const [hasConsentedToAI, setHasConsentedToAI] = useState(false);
  const [pendingPassageToExplain, setPendingPassageToExplain] = useState<SelectedPassage | null>(null);
  const [providerInfo, setProviderInfo] = useState<{
    available: boolean;
    provider: string | null;
  }>({ available: false, provider: null });

  // Check AI provider availability on mount
  useEffect(() => {
    async function checkProvider() {
      try {
        const res = await fetch('/api/explain');
        if (res.ok) {
          const data = await res.json();
          setProviderInfo({
            available: Boolean(data.available),
            provider: data.provider || null,
          });
        }
      } catch {
        setProviderInfo({ available: false, provider: null });
      }
    }
    checkProvider();

    // Check if user already consented in this session
    try {
      const consented = sessionStorage.getItem('chapterlens-ai-consent');
      if (consented === 'true') {
        setHasConsentedToAI(true);
      }
    } catch {}
  }, []);

  // Handle outside sentence selection (e.g. from Readability Card jump)
  useEffect(() => {
    if (onSelectDifficultSentenceFromOutside) {
      setSelectedPassage(onSelectDifficultSentenceFromOutside);
      setActiveBlockId(onSelectDifficultSentenceFromOutside.blockId || null);
    }
  }, [onSelectDifficultSentenceFromOutside]);

  const getCacheKey = (passage: SelectedPassage, level: ExplanationLevel, concept?: string) => {
    return `${passage.startIndex}_${passage.endIndex}_${level}_${concept || 'root'}`;
  };

  const fetchExplanation = useCallback(
    async (passage: SelectedPassage, level: ExplanationLevel, conceptToExplore?: string) => {
      const cacheKey = getCacheKey(passage, level, conceptToExplore);
      if (explanationCache[cacheKey]) {
        return;
      }

      setIsLoadingExplanation(true);
      setExplanationError(null);

      try {
        const response = await fetch('/api/explain', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            selectedPassage: passage.text,
            surroundingContext: passage.surroundingContext,
            sourceLocation: passage.sourceLocation,
            level,
            conceptToExplore,
          }),
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || `HTTP ${response.status}: Failed to generate explanation.`);
        }

        const data = await response.json();
        if (data.explanation) {
          setExplanationCache((prev) => ({
            ...prev,
            [cacheKey]: data.explanation,
          }));
        }
      } catch (err: any) {
        setExplanationError(err?.message || 'Error communicating with explanation service.');
      } finally {
        setIsLoadingExplanation(false);
      }
    },
    [explanationCache]
  );

  const scrollExplanationIntoViewOnMobile = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setTimeout(() => {
        const el = window.document.getElementById('explanation-panel-container');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }, 100);
    }
  };

  const handleRequestExplain = (passage: SelectedPassage, level = currentLevel, concept?: string) => {
    setSelectedPassage(passage);
    setActiveBlockId(passage.blockId || null);

    // If external AI provider is not configured on this deployment, do not prompt for consent or dispatch outbound request
    if (!providerInfo.available) {
      scrollExplanationIntoViewOnMobile();
      return;
    }

    if (!hasConsentedToAI) {
      setPendingPassageToExplain(passage);
      setIsDisclosureOpen(true);
      return;
    }

    scrollExplanationIntoViewOnMobile();
    fetchExplanation(passage, level, concept);
  };

  const handleConfirmDisclosure = () => {
    setIsDisclosureOpen(false);
    setHasConsentedToAI(true);
    try {
      sessionStorage.setItem('chapterlens-ai-consent', 'true');
    } catch {}

    if (pendingPassageToExplain) {
      scrollExplanationIntoViewOnMobile();
      fetchExplanation(pendingPassageToExplain, currentLevel);
      setPendingPassageToExplain(null);
    }
  };

  const handleChangeLevel = (newLevel: ExplanationLevel) => {
    setCurrentLevel(newLevel);
    if (selectedPassage) {
      const cacheKey = getCacheKey(selectedPassage, newLevel);
      if (!explanationCache[cacheKey] && hasConsentedToAI && providerInfo.available) {
        fetchExplanation(selectedPassage, newLevel);
      }
    }
  };

  const handleExploreConcept = (conceptName: string) => {
    if (selectedPassage) {
      handleRequestExplain(selectedPassage, currentLevel, conceptName);
    }
  };

  const handleNavigateToBlock = (block: ExtractedBlock) => {
    setActiveBlockId(block.id);
    const el = window.document.getElementById(`reading-block-${block.id}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleReturnToReading = () => {
    if (selectedPassage) {
      const el = window.document.getElementById(`reading-sentence-${selectedPassage.startIndex}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.focus();
      }
    }
  };

  const currentExplanation = selectedPassage
    ? explanationCache[getCacheKey(selectedPassage, currentLevel)] || null
    : null;

  return (
    <div className="w-full space-y-4">
      {/* Workspace Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-4">
        <div>
          <span className="text-[11px] font-semibold tracking-wider uppercase text-[var(--brand-emerald)]">
            Research Companion
          </span>
          <h2 className="font-editorial-serif text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-main)]">
            Guided Research Reading
          </h2>
          <p className="mt-0.5 text-xs text-[var(--text-muted)]">
            Read challenging research papers without cognitive overload. Click any confusing sentence to unpack core ideas at your level.
          </p>
        </div>

        {/* Outline toggle for mobile & small screens */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsNavigatorOpen(!isNavigatorOpen)}
            className="lg:hidden inline-flex items-center gap-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--canvas-card)] px-3 py-1.5 text-xs font-semibold text-[var(--text-main)] shadow-xs"
          >
            <BookOpen className="h-3.5 w-3.5 text-[var(--brand-emerald)]" />
            <span>{isNavigatorOpen ? 'Hide Outline' : 'Show Outline'}</span>
          </button>
        </div>
      </div>

      {/* Main 3-Column Responsive Grid */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Left Column: Outline Navigator */}
        <DocumentNavigator
          document={document}
          activeBlockId={activeBlockId}
          onNavigateToBlock={handleNavigateToBlock}
          isOpen={isNavigatorOpen}
          onToggleOpen={() => setIsNavigatorOpen(!isNavigatorOpen)}
        />

        {/* Center Column: Academic Reading Pane */}
        <ReadingPane
          document={document}
          selectedPassage={selectedPassage}
          onSelectPassage={(p) => {
            setSelectedPassage(p);
            setActiveBlockId(p.blockId || null);
          }}
          onRequestExplain={handleRequestExplain}
        />

        {/* Right Column: Explanation Panel */}
        <ExplanationPanel
          selectedPassage={selectedPassage}
          currentExplanation={currentExplanation}
          currentLevel={currentLevel}
          onChangeLevel={handleChangeLevel}
          isLoading={isLoadingExplanation}
          error={explanationError}
          onRetry={() => {
            if (selectedPassage) fetchExplanation(selectedPassage, currentLevel);
          }}
          onExploreConcept={handleExploreConcept}
          onReturnToReading={handleReturnToReading}
          onClose={() => setSelectedPassage(null)}
          providerConfigured={providerInfo.available}
        />
      </div>

      {/* First-time External AI Disclosure Modal */}
      <ExternalDisclosureModal
        isOpen={isDisclosureOpen}
        providerName={providerInfo.provider}
        onConfirm={handleConfirmDisclosure}
        onCancel={() => {
          setIsDisclosureOpen(false);
          setPendingPassageToExplain(null);
        }}
      />
    </div>
  );
}
