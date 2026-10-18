'use client';

import React, { useRef, useEffect } from 'react';
import { ExtractedDocument, ExtractedBlock } from '../../lib/document/types';
import { SelectedPassage } from '../../lib/reading/types';
import { extractPassageContext } from '../../lib/reading/contextExtractor';
import { segmentText } from '../../lib/linguistics/segmenter';
import { Sparkles, BookOpen, Bookmark } from 'lucide-react';

interface ReadingPaneProps {
  document: ExtractedDocument;
  selectedPassage: SelectedPassage | null;
  onSelectPassage: (passage: SelectedPassage) => void;
  onRequestExplain: (passage: SelectedPassage) => void;
}

export function ReadingPane({
  document,
  selectedPassage,
  onSelectPassage,
  onRequestExplain,
}: ReadingPaneProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // When selectedPassage changes, ensure the active element is smoothly centered in view
  useEffect(() => {
    if (!selectedPassage) return;
    const el = window.document.getElementById(`reading-sentence-${selectedPassage.startIndex}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [selectedPassage]);

  // Splits a paragraph block into interactive sentence spans while preserving character offsets
  const renderParagraphSentences = (block: ExtractedBlock) => {
    const blockText = block.text;
    const sentencesInBlock = segmentText(blockText);

    if (sentencesInBlock.length === 0) {
      return <span>{blockText}</span>;
    }

    const elements: React.ReactNode[] = [];
    let cursor = 0;

    sentencesInBlock.forEach((s, idx) => {
      if (s.startIndex > cursor) {
        elements.push(
          <span key={`gap-${idx}`}>{blockText.slice(cursor, s.startIndex)}</span>
        );
      }

      const absStart = block.startIndex + s.startIndex;
      const absEnd = block.startIndex + s.endIndex;
      const isSelected =
        selectedPassage &&
        selectedPassage.startIndex === absStart &&
        selectedPassage.endIndex === absEnd;

      const handleClick = () => {
        const passage = extractPassageContext(document, absStart, absEnd, s.text);
        onSelectPassage(passage);
      };

      elements.push(
        <span
          key={`sent-${idx}`}
          id={`reading-sentence-${absStart}`}
          tabIndex={0}
          role="button"
          aria-pressed={Boolean(isSelected)}
          onClick={handleClick}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleClick();
            }
          }}
          className={`relative inline rounded-xs transition-colors duration-150 cursor-pointer ${
            isSelected
              ? 'bg-[var(--brand-accent-bg)] text-[var(--brand-forest)] font-medium ring-2 ring-[var(--brand-emerald)] shadow-xs'
              : 'hover:bg-[var(--canvas-card-subtle)] hover:text-[var(--text-main)]'
          }`}
        >
          {s.text}
          {isSelected && (
            <span className="inline-flex items-center ml-1 align-baseline">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  const passage = extractPassageContext(document, absStart, absEnd, s.text);
                  onRequestExplain(passage);
                }}
                className="inline-flex items-center gap-1 rounded-md bg-[var(--brand-forest)] text-white px-2 py-0.5 text-[10px] font-sans font-semibold shadow-xs hover:bg-[var(--brand-forest-hover)] active:scale-95 transition-all mx-1"
              >
                <Sparkles className="h-3 w-3 text-[var(--brand-forest-light)]" />
                <span>Explain this passage</span>
              </button>
            </span>
          )}
        </span>
      );

      cursor = s.endIndex;
    });

    if (cursor < blockText.length) {
      elements.push(
        <span key="trailing-gap">{blockText.slice(cursor)}</span>
      );
    }

    return elements;
  };

  let lastPage = 0;

  return (
    <article
      ref={containerRef}
      tabIndex={0}
      aria-label="Academic Manuscript Reading Surface"
      className="flex-1 rounded-2xl border border-[var(--border-subtle)] bg-[var(--canvas-card)] shadow-editorial overflow-hidden focus-visible:outline-none"
    >
      {/* Top Reading Surface Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border-subtle)] px-6 py-3.5 bg-[var(--canvas-card-subtle)]">
        <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-muted)]">
          <BookOpen className="h-4 w-4 text-[var(--brand-emerald)]" />
          <span className="font-editorial-mono truncate max-w-sm">{document.fileName}</span>
          {document.isSample && (
            <span className="rounded-md border border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/40 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider">
              🧪 Sample
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-[11px] font-editorial-mono text-[var(--text-faint)]">
          <span>Click any sentence to explain</span>
          <span>•</span>
          <span>{document.blocks.length} blocks</span>
        </div>
      </div>

      {/* Main Document Reading Flow */}
      <div className="max-h-[720px] overflow-y-auto custom-scrollbar p-6 sm:p-10 lg:p-12">
        <div className="max-w-3xl mx-auto space-y-6 font-editorial-serif text-[17px] sm:text-[18px] leading-[1.88] text-[var(--text-main)] selection:bg-[var(--selection-bg)] selection:text-[var(--selection-text)]">
          {document.blocks.length === 0 ? (
            <div className="py-16 text-center text-sm text-[var(--text-muted)] space-y-2">
              <p className="font-semibold text-[var(--text-main)]">No text content detected</p>
              <p className="text-xs text-[var(--text-faint)]">
                This document contains no readable paragraphs or text layers.
              </p>
            </div>
          ) : (
            document.blocks.map((block) => {
              const hasNewPage =
                block.pageNumber && block.pageNumber > 1 && block.pageNumber !== lastPage;
              if (block.pageNumber) {
                lastPage = block.pageNumber;
              }

              return (
                <div key={block.id} id={`reading-block-${block.id}`} className="space-y-4">
                  {/* Visual Page Break Indicator */}
                  {hasNewPage && (
                    <div className="my-8 flex items-center gap-3 select-none text-[11px] font-editorial-mono text-[var(--text-faint)]">
                      <div className="h-px flex-1 bg-[var(--border-subtle)]" />
                      <span className="rounded-full border border-[var(--border-subtle)] bg-[var(--canvas-card-subtle)] px-3 py-0.5 shadow-xs">
                        Page {block.pageNumber}
                      </span>
                      <div className="h-px flex-1 bg-[var(--border-subtle)]" />
                    </div>
                  )}

                  {/* Heading Block */}
                  {block.type === 'heading' ? (
                    <div className="pt-4 pb-2 border-b border-[var(--border-subtle)]">
                      <div className="text-[10px] uppercase font-editorial-mono font-bold text-[var(--brand-emerald)] tracking-wider">
                        § Section {block.level || 1}
                      </div>
                      <h2 className="mt-1 font-editorial-serif text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-main)]">
                        {block.text}
                      </h2>
                    </div>
                  ) : (
                    /* Paragraph Block */
                    <p className="text-[var(--text-main)] relative">
                      {renderParagraphSentences(block)}
                    </p>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </article>
  );
}
