'use client';

import React, { useState, useRef } from 'react';
import { Editor } from './Editor';
import { ScoreCard } from './ScoreCard';
import { InlineHighlightedText } from './InlineHighlightedText';
import { HardestSentencesList } from './HardestSentencesList';
import { EducationalSection } from './EducationalSection';
import { RewriteModal } from './RewriteModal';
import { DocumentImportZone } from './document/DocumentImportZone';
import { DocumentPreview } from './document/DocumentPreview';
import { GuidedReadingWorkspace } from './reading/GuidedReadingWorkspace';
import { analyzeChapter } from '../lib/linguistics/analyzer';
import { enrichAnalysisWithDocument } from '../lib/document/locator';
import { extractFromPastedText } from '../lib/document/extractors/pastedExtractor';
import { AnalysisResult, DifficultSentence } from '../lib/linguistics/types';
import { ExtractedDocument } from '../lib/document/types';
import { SelectedPassage } from '../lib/reading/types';
import { extractPassageContext } from '../lib/reading/contextExtractor';
import { getSampleResearchDocument } from '../lib/document/sampleDocument';
import { RotateCcw, UploadCloud, Edit3, BookOpen, BarChart3 } from 'lucide-react';

interface WorkspaceProps {
  onAnalysisStateChange?: (hasAnalysis: boolean) => void;
  loadSampleSignal?: number;
}

export function Workspace({ onAnalysisStateChange, loadSampleSignal }: WorkspaceProps) {
  const [activeTab, setActiveTab] = useState<'import' | 'paste'>('import');
  const [document, setDocument] = useState<ExtractedDocument | null>(null);
  const [text, setText] = useState<string>('');
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedSentenceId, setSelectedSentenceId] = useState<string | null>(null);
  const [rewriteSentence, setRewriteSentence] = useState<DifficultSentence | null>(null);

  // Guided Reading mode state
  const [viewMode, setViewMode] = useState<'reading' | 'audit'>('audit');
  const [guidedReadingPassage, setGuidedReadingPassage] = useState<SelectedPassage | null>(null);

  const editorSectionRef = useRef<HTMLDivElement>(null);
  const analysisSectionRef = useRef<HTMLDivElement>(null);
  const readingSectionRef = useRef<HTMLDivElement>(null);

  const handleLoadSampleDocument = () => {
    const sampleDoc = getSampleResearchDocument();
    setDocument(sampleDoc);
    setText(sampleDoc.fullText);
    setAnalysis(null);
    setSelectedSentenceId(null);
    setGuidedReadingPassage(null);
    setActiveTab('import');
    setViewMode('audit');
    setTimeout(() => {
      editorSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  React.useEffect(() => {
    if (loadSampleSignal && loadSampleSignal > 0) {
      handleLoadSampleDocument();
    }
  }, [loadSampleSignal]);

  // Handles analysis of raw pasted text
  const handleAnalyzeText = () => {
    if (!text.trim()) return;
    setIsAnalyzing(true);

    try {
      const result = analyzeChapter(text);
      setAnalysis(result);
      if (result.difficultSentences.length > 0) {
        setSelectedSentenceId(result.difficultSentences[0].id);
      }
      onAnalysisStateChange?.(true);

      setTimeout(() => {
        analysisSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    } catch (err) {
      console.error('Analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handles analysis of imported document
  const handleAnalyzeDocument = () => {
    if (!document || !document.fullText.trim()) return;
    setIsAnalyzing(true);

    try {
      const rawResult = analyzeChapter(document.fullText);
      const enrichedResult = enrichAnalysisWithDocument(rawResult, document);

      setText(document.fullText);
      setAnalysis(enrichedResult);

      if (enrichedResult.difficultSentences.length > 0) {
        setSelectedSentenceId(enrichedResult.difficultSentences[0].id);
      }
      onAnalysisStateChange?.(true);

      setTimeout(() => {
        analysisSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    } catch (err) {
      console.error('Document analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const effectiveDoc =
    document ||
    (text.trim()
      ? extractFromPastedText(text, 'Pasted Manuscript')
      : null);

  const handleStartGuidedReading = () => {
    setViewMode('reading');
    setTimeout(() => {
      readingSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  const handleOpenGuidedReading = (sentence: DifficultSentence) => {
    setViewMode('reading');
    if (effectiveDoc) {
      const passage = extractPassageContext(
        effectiveDoc,
        sentence.startIndex,
        sentence.endIndex,
        sentence.text
      );
      setGuidedReadingPassage(passage);
    }
    setTimeout(() => {
      readingSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  const handleDocumentExtracted = (extractedDoc: ExtractedDocument) => {
    setDocument(extractedDoc);
    setText(extractedDoc.fullText);
    setAnalysis(null);
    setSelectedSentenceId(null);
    setGuidedReadingPassage(null);
  };

  const handleReplaceDocument = () => {
    setDocument(null);
    setAnalysis(null);
    setSelectedSentenceId(null);
    setGuidedReadingPassage(null);
    setActiveTab('import');
    setViewMode('audit');
  };

  const handleClear = () => {
    setDocument(null);
    setText('');
    setAnalysis(null);
    setSelectedSentenceId(null);
    setGuidedReadingPassage(null);
    setViewMode('audit');
    onAnalysisStateChange?.(false);
  };

  const handleNewAnalysis = () => {
    setAnalysis(null);
    setSelectedSentenceId(null);
    setGuidedReadingPassage(null);
    onAnalysisStateChange?.(false);
    setTimeout(() => {
      editorSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  const handleSelectSentence = (sentence: DifficultSentence) => {
    setSelectedSentenceId(sentence.id);
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-12">
      {/* Intake Section: Tab Selection & Active Workspace */}
      <div ref={editorSectionRef} id="editor-workspace" className="space-y-6">
        {/* Method Selector Tabs (Upload vs Paste) */}
        {!document && (
          <div className="flex items-center justify-center sm:justify-start">
            <div
              role="tablist"
              aria-label="Input mode selection"
              className="inline-flex rounded-xl border border-[var(--border-subtle)] bg-[var(--canvas-card-subtle)] p-1 shadow-editorial-sm"
            >
              <button
                type="button"
                role="tab"
                id="tab-import"
                aria-selected={activeTab === 'import'}
                aria-controls="panel-import"
                onClick={() => setActiveTab('import')}
                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-all focus-visible:outline-2 focus-visible:outline-[var(--brand-emerald)] ${
                  activeTab === 'import'
                    ? 'bg-[var(--canvas-card)] text-[var(--text-main)] shadow-xs border border-[var(--border-subtle)]'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`}
              >
                <UploadCloud className="h-4 w-4 text-[var(--brand-emerald)]" />
                <span>Upload Document (PDF, DOCX, TXT)</span>
              </button>

              <button
                type="button"
                role="tab"
                id="tab-paste"
                aria-selected={activeTab === 'paste'}
                aria-controls="panel-paste"
                onClick={() => setActiveTab('paste')}
                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-all focus-visible:outline-2 focus-visible:outline-[var(--brand-emerald)] ${
                  activeTab === 'paste'
                    ? 'bg-[var(--canvas-card)] text-[var(--text-main)] shadow-xs border border-[var(--border-subtle)]'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`}
              >
                <Edit3 className="h-4 w-4 text-[var(--brand-emerald)]" />
                <span>Paste & Draft Text</span>
              </button>
            </div>
          </div>
        )}

        {/* View A: Document Upload or Inspection */}
        {activeTab === 'import' ? (
          document ? (
            <div id="panel-import" role="tabpanel" aria-labelledby="tab-import">
              <DocumentPreview
                document={document}
                isAnalyzing={isAnalyzing}
                onAnalyze={handleAnalyzeDocument}
                onStartGuidedReading={handleStartGuidedReading}
                onReplace={handleReplaceDocument}
                onClear={handleClear}
              />
            </div>
          ) : (
            <div id="panel-import" role="tabpanel" aria-labelledby="tab-import">
              <DocumentImportZone
                onDocumentExtracted={handleDocumentExtracted}
                onSwitchToPaste={() => setActiveTab('paste')}
                onLoadSample={handleLoadSampleDocument}
              />
            </div>
          )
        ) : (
          /* View B: Conventional Raw Text Editor & Demo Passages */
          <div id="panel-paste" role="tabpanel" aria-labelledby="tab-paste">
            <Editor
              text={text}
              onChangeText={(newText) => {
                setText(newText);
                setDocument(null);
              }}
              onAnalyze={handleAnalyzeText}
              isAnalyzing={isAnalyzing}
              onClear={handleClear}
            />
          </div>
        )}
      </div>

      {/* Guided Reading Workspace View */}
      {viewMode === 'reading' && effectiveDoc && (
        <section
          ref={readingSectionRef}
          id="guided-reading-workspace"
          aria-label="Guided Research Reading Workspace"
          className="space-y-6 animate-in fade-in duration-300"
        >
          {/* Top Mode Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-4">
            <div className="flex items-center gap-2">
              <div
                role="tablist"
                aria-label="Workspace view modes"
                className="inline-flex rounded-xl border border-[var(--border-subtle)] bg-[var(--canvas-card-subtle)] p-1 shadow-editorial-sm"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={true}
                  className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold bg-[var(--canvas-card)] text-[var(--brand-emerald)] shadow-xs border border-[var(--border-subtle)]"
                >
                  <BookOpen className="h-4 w-4 text-[var(--brand-emerald)]" />
                  <span>Guided Research Reading</span>
                </button>

                <button
                  type="button"
                  role="tab"
                  aria-selected={false}
                  onClick={() => {
                    setViewMode('audit');
                    if (!analysis && effectiveDoc) {
                      if (document) {
                        handleAnalyzeDocument();
                      } else {
                        handleAnalyzeText();
                      }
                    }
                  }}
                  className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
                >
                  <BarChart3 className="h-4 w-4" />
                  <span>Readability & Cadence Audit</span>
                </button>
              </div>
            </div>

            <button
              onClick={handleNewAnalysis}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border-strong)] bg-[var(--canvas-card)] px-3 py-1.5 text-xs font-semibold text-[var(--text-main)] shadow-editorial-sm hover:bg-[var(--canvas-card-hover)] hover:border-[var(--brand-emerald)] focus-visible:outline-2 focus-visible:outline-[var(--brand-emerald)] transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5 text-[var(--brand-emerald)]" />
              <span>Reset / Edit Chapter</span>
            </button>
          </div>

          <GuidedReadingWorkspace
            document={effectiveDoc}
            onSelectDifficultSentenceFromOutside={guidedReadingPassage}
          />
        </section>
      )}

      {/* Analysis Results Section (Readability & Friction Audit) */}
      {viewMode === 'audit' && analysis && (
        <section
          ref={analysisSectionRef}
          id="analysis-results"
          aria-label="Chapter Readability Results"
          className="space-y-10 animate-in fade-in duration-300"
        >
          {/* Action & Quick Navigation Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-4">
            <div className="flex items-center gap-3">
              {/* Mode Switcher */}
              {effectiveDoc && (
                <div
                  role="tablist"
                  aria-label="Workspace view modes"
                  className="inline-flex rounded-xl border border-[var(--border-subtle)] bg-[var(--canvas-card-subtle)] p-1 shadow-editorial-sm"
                >
                  <button
                    type="button"
                    role="tab"
                    aria-selected={false}
                    onClick={() => setViewMode('reading')}
                    className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
                  >
                    <BookOpen className="h-4 w-4" />
                    <span>Guided Research Reading</span>
                  </button>

                  <button
                    type="button"
                    role="tab"
                    aria-selected={true}
                    className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold bg-[var(--canvas-card)] text-[var(--brand-emerald)] shadow-xs border border-[var(--border-subtle)]"
                  >
                    <BarChart3 className="h-4 w-4 text-[var(--brand-emerald)]" />
                    <span>Readability & Cadence Audit</span>
                  </button>
                </div>
              )}

              <button
                onClick={handleNewAnalysis}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border-strong)] bg-[var(--canvas-card)] px-3 py-1.5 text-xs font-semibold text-[var(--text-main)] shadow-editorial-sm hover:bg-[var(--canvas-card-hover)] hover:border-[var(--brand-emerald)] focus-visible:outline-2 focus-visible:outline-[var(--brand-emerald)] transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5 text-[var(--brand-emerald)]" />
                <span>Reset / Edit Chapter</span>
              </button>
            </div>

            {/* Quick in-page anchor links */}
            <div className="flex items-center gap-2.5 text-xs text-[var(--text-faint)] font-editorial-mono">
              <a
                href="#manuscript-section"
                className="hover:text-[var(--text-main)] transition-colors"
              >
                ↓ Manuscript Inspector
              </a>
              <span>•</span>
              <a
                href="#difficult-sentences-section"
                className="hover:text-[var(--text-main)] transition-colors"
              >
                ↓ Difficult Sentences ({analysis.difficultSentences.length})
              </a>
            </div>
          </div>

          {/* A. Readability Summary & Chapter Statistics */}
          <div id="readability-summary-section">
            <ScoreCard analysis={analysis} />
          </div>

          {/* B. Full-Width Manuscript Inspector */}
          <div id="manuscript-section" className="w-full">
            <InlineHighlightedText
              originalText={text}
              difficultSentences={analysis.difficultSentences}
              selectedSentenceId={selectedSentenceId}
              onSelectSentence={handleSelectSentence}
              sourceDoc={document}
            />
          </div>

          {/* C. Difficult Sentences Responsive Horizontal Card Grid */}
          <div id="difficult-sentences-section" className="w-full">
            <HardestSentencesList
              sentences={analysis.difficultSentences}
              totalSentencesInText={analysis.totalSentences}
              selectedSentenceId={selectedSentenceId}
              onSelectSentence={handleSelectSentence}
              onOpenRewrite={(s) => setRewriteSentence(s)}
              onOpenGuidedReading={handleOpenGuidedReading}
            />
          </div>
        </section>
      )}

      {/* Educational & Craft Insights Section */}
      <div className="pt-6">
        <EducationalSection />
      </div>

      {/* Optional Rewrite & Craft Modal */}
      {rewriteSentence && (
        <RewriteModal
          sentence={rewriteSentence}
          onClose={() => setRewriteSentence(null)}
        />
      )}
    </main>
  );
}
