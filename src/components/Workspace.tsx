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
import { RotateCcw, UploadCloud, Edit3, BookOpen, BarChart3, Sparkles, X, Download } from 'lucide-react';
import { DownloadReportModal } from './export/DownloadReportModal';
import { motion, AnimatePresence } from 'motion/react';

interface WorkspaceProps {
  onAnalysisStateChange?: (hasAnalysis: boolean) => void;
  loadSampleSignal?: number;
}

interface RevisionUndoState {
  previousText: string;
  previousDocument: ExtractedDocument | null;
  previousAnalysis: AnalysisResult | null;
  previousSentenceId: string | null;
  sentenceRank: number;
}

export function Workspace({ onAnalysisStateChange, loadSampleSignal }: WorkspaceProps) {
  const [activeTab, setActiveTab] = useState<'import' | 'paste'>('import');
  const [document, setDocument] = useState<ExtractedDocument | null>(null);
  const [text, setText] = useState<string>('');
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedSentenceId, setSelectedSentenceId] = useState<string | null>(null);
  const [rewriteSentence, setRewriteSentence] = useState<DifficultSentence | null>(null);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [undoState, setUndoState] = useState<RevisionUndoState | null>(null);
  const [revisionToast, setRevisionToast] = useState<{ message: string; rank: number } | null>(null);

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

  const handleApplyRevision = (sentence: DifficultSentence, newSentenceText: string) => {
    const currentText = document ? document.fullText : text;
    if (!currentText) return;

    // Save previous state for full reversible undo
    setUndoState({
      previousText: currentText,
      previousDocument: document,
      previousAnalysis: analysis,
      previousSentenceId: selectedSentenceId,
      sentenceRank: sentence.rank,
    });

    let updatedText = currentText;
    const startIndex = sentence.startIndex;
    const endIndex = sentence.endIndex;

    if (
      startIndex >= 0 &&
      endIndex <= currentText.length &&
      currentText.slice(startIndex, endIndex) === sentence.text
    ) {
      updatedText = currentText.slice(0, startIndex) + newSentenceText + currentText.slice(endIndex);
    } else {
      const foundIdx = currentText.indexOf(sentence.text);
      if (foundIdx !== -1) {
        updatedText =
          currentText.slice(0, foundIdx) + newSentenceText + currentText.slice(foundIdx + sentence.text.length);
      } else {
        console.warn('Could not locate exact sentence occurrence in manuscript.');
        return;
      }
    }

    setText(updatedText);

    let updatedDoc: ExtractedDocument | null = null;
    if (document) {
      const delta = newSentenceText.length - sentence.text.length;
      const updatedBlocks = document.blocks.map((block) => {
        if (startIndex >= block.startIndex && startIndex < block.endIndex) {
          const relStart = startIndex - block.startIndex;
          const relEnd = Math.min(block.text.length, relStart + sentence.text.length);
          const newBlockText =
            block.text.slice(0, relStart) + newSentenceText + block.text.slice(relEnd);
          return {
            ...block,
            text: newBlockText,
            endIndex: block.endIndex + delta,
          };
        } else if (block.startIndex > startIndex) {
          return {
            ...block,
            startIndex: block.startIndex + delta,
            endIndex: block.endIndex + delta,
          };
        }
        return block;
      });

      updatedDoc = {
        ...document,
        fullText: updatedText,
        blocks: updatedBlocks,
      };
      setDocument(updatedDoc);
    }

    // Recompute readability analysis immediately
    try {
      const rawResult = analyzeChapter(updatedText);
      const newAnalysis = updatedDoc
        ? enrichAnalysisWithDocument(rawResult, updatedDoc)
        : rawResult;
      setAnalysis(newAnalysis);

      if (newAnalysis.difficultSentences.length > 0) {
        setSelectedSentenceId(newAnalysis.difficultSentences[0].id);
      }
    } catch (err) {
      console.error('Error re-analyzing after revision:', err);
    }

    setRevisionToast({
      message: `Applied revision to difficult sentence #${sentence.rank}. Analysis recomputed.`,
      rank: sentence.rank,
    });

    setRewriteSentence(null);
  };

  const handleUndoRevision = () => {
    if (!undoState) return;

    setText(undoState.previousText);
    setDocument(undoState.previousDocument);
    setAnalysis(undoState.previousAnalysis);
    setSelectedSentenceId(undoState.previousSentenceId);
    setUndoState(null);
    setRevisionToast(null);
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

      {/* Dynamic Viewport: Guided Reading vs Readability Audit */}
      <AnimatePresence mode="wait">
        {viewMode === 'reading' && effectiveDoc ? (
          <motion.section
            key="guided-reading-workspace"
            ref={readingSectionRef}
            id="guided-reading-workspace"
            aria-label="Guided Research Reading Workspace"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-6"
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
          </motion.section>
        ) : viewMode === 'audit' && analysis ? (
          <motion.section
            key="analysis-results"
            ref={analysisSectionRef}
            id="analysis-results"
            aria-label="Chapter Readability Results"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-10"
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
                  type="button"
                  onClick={() => setIsPdfModalOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border-strong)] bg-[var(--canvas-card)] px-3 py-1.5 text-xs font-semibold text-[var(--text-main)] shadow-editorial-sm hover:bg-[var(--canvas-card-hover)] hover:border-[var(--brand-emerald)] focus-visible:outline-2 focus-visible:outline-[var(--brand-emerald)] transition-colors"
                  title="Export complete analysis report as a publication-ready PDF"
                >
                  <Download className="h-3.5 w-3.5 text-[var(--brand-emerald)]" />
                  <span>Download Analysis Report</span>
                </button>

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

            {/* Undo Revision Alert Banner */}
            <AnimatePresence>
              {revisionToast && undoState && (
                <motion.div
                  initial={{ opacity: 0, y: -8, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -8, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center justify-between gap-3 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/60 p-3 sm:px-4 text-xs shadow-editorial-sm text-emerald-900 dark:text-emerald-200 overflow-hidden"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-[var(--brand-emerald)] shrink-0" />
                    <span>{revisionToast.message}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleUndoRevision}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-400 dark:border-emerald-700 bg-[var(--canvas-card)] px-3 py-1 font-bold text-emerald-900 dark:text-emerald-100 hover:bg-[var(--canvas-card-hover)] transition-colors shadow-xs"
                    >
                      <RotateCcw className="h-3.5 w-3.5 text-[var(--brand-emerald)]" />
                      <span>Undo Revision</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRevisionToast(null)}
                      className="rounded p-1 text-emerald-700 dark:text-emerald-400 hover:text-emerald-950 hover:bg-emerald-100 dark:hover:bg-emerald-900 transition-colors"
                      aria-label="Dismiss notice"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* A. Readability Summary & Chapter Statistics */}
            <div id="readability-summary-section">
              <ScoreCard analysis={analysis} onDownloadReport={() => setIsPdfModalOpen(true)} />
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
          </motion.section>
        ) : null}
      </AnimatePresence>

      {/* Educational & Craft Insights Section */}
      <div className="pt-6">
        <EducationalSection />
      </div>

      {/* Optional Rewrite & Craft Modal */}
      {rewriteSentence && (
        <RewriteModal
          sentence={rewriteSentence}
          onClose={() => setRewriteSentence(null)}
          onApplyRevision={handleApplyRevision}
        />
      )}

      {/* Download PDF Analysis Report Modal */}
      {analysis && (
        <DownloadReportModal
          isOpen={isPdfModalOpen}
          analysis={analysis}
          onClose={() => setIsPdfModalOpen(false)}
        />
      )}
    </main>
  );
}
