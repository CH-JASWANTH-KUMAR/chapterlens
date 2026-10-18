'use client';

import React from 'react';
import { ExtractedDocument, ExtractedBlock } from '../../lib/document/types';
import {
  BookOpen,
  List,
  Layers,
  ChevronRight,
  Hash,
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react';

interface DocumentNavigatorProps {
  document: ExtractedDocument;
  activeBlockId: string | null;
  onNavigateToBlock: (block: ExtractedBlock) => void;
  isOpen: boolean;
  onToggleOpen: () => void;
}

export function DocumentNavigator({
  document,
  activeBlockId,
  onNavigateToBlock,
  isOpen,
  onToggleOpen,
}: DocumentNavigatorProps) {
  // Extract major navigation targets: headings and page starts
  const navItems = React.useMemo(() => {
    const items: Array<{
      id: string;
      title: string;
      subtitle?: string;
      level?: number;
      type: 'heading' | 'page';
      block: ExtractedBlock;
    }> = [];

    let lastPage = 0;

    for (const block of document.blocks) {
      // 1. Page boundary item (for multi-page documents like PDF)
      if (block.pageNumber && block.pageNumber !== lastPage) {
        items.push({
          id: `nav-page-${block.pageNumber}`,
          title: `Page ${block.pageNumber}`,
          type: 'page',
          block,
        });
        lastPage = block.pageNumber;
      }

      // 2. Heading item
      if (block.type === 'heading') {
        items.push({
          id: `nav-heading-${block.id}`,
          title: block.text,
          level: block.level || 1,
          type: 'heading',
          block,
        });
      }
    }

    // If no headings or pages were detected, provide paragraph checkpoint anchors every 5 paragraphs
    if (items.length === 0 && document.blocks.length > 0) {
      for (let i = 0; i < document.blocks.length; i += 5) {
        const block = document.blocks[i];
        items.push({
          id: `nav-para-${i}`,
          title: `Paragraph ${i + 1}`,
          subtitle: block.text.slice(0, 45) + '...',
          type: 'heading',
          block,
        });
      }
    }

    return items;
  }, [document]);

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={onToggleOpen}
        title="Open Document Outline"
        aria-label="Open Document Outline"
        className="hidden lg:flex items-center gap-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--canvas-card)] p-2.5 text-xs font-semibold text-[var(--text-muted)] shadow-editorial-sm hover:border-[var(--brand-emerald)] hover:text-[var(--text-main)] transition-colors shrink-0"
      >
        <PanelLeft className="h-4 w-4 text-[var(--brand-emerald)]" />
        <span className="sr-only">Outline</span>
      </button>
    );
  }

  return (
    <nav
      aria-label="Document Outline and Navigation"
      className="flex flex-col w-full lg:w-64 rounded-2xl border border-[var(--border-subtle)] bg-[var(--canvas-card)] shadow-editorial overflow-hidden shrink-0 transition-all duration-200"
    >
      {/* Navigator Header */}
      <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-4 py-3 bg-[var(--canvas-card-subtle)]">
        <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-main)]">
          <List className="h-4 w-4 text-[var(--brand-emerald)]" />
          <span>Document Outline</span>
        </div>
        <button
          type="button"
          onClick={onToggleOpen}
          aria-label="Collapse Document Outline"
          className="rounded-lg p-1 text-[var(--text-faint)] hover:text-[var(--text-main)] hover:bg-[var(--canvas-card-hover)] transition-colors"
        >
          <PanelLeftClose className="h-4 w-4" />
        </button>
      </div>

      {/* Document Overview Metadata */}
      <div className="border-b border-[var(--border-subtle)] px-4 py-2.5 text-[11px] text-[var(--text-faint)] font-editorial-mono flex items-center justify-between">
        <span className="truncate max-w-[130px]" title={document.fileName}>
          {document.fileName}
        </span>
        <span className="uppercase font-bold text-[var(--brand-emerald)]">
          {document.format}
        </span>
      </div>

      {/* Navigation Links */}
      <div className="max-h-[500px] overflow-y-auto custom-scrollbar p-2 space-y-1">
        {navItems.length === 0 ? (
          <div className="py-6 px-3 text-center text-xs text-[var(--text-faint)] font-editorial-mono">
            No document outline anchors detected.
          </div>
        ) : (
          navItems.map((item) => {
            const isActive = activeBlockId === item.block.id;
            const isPage = item.type === 'page';

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigateToBlock(item.block)}
                className={`w-full text-left rounded-xl px-3 py-2 text-xs transition-all flex items-center justify-between group focus-visible:outline-2 focus-visible:outline-[var(--brand-emerald)] ${
                  isActive
                    ? 'bg-[var(--brand-accent-bg)] text-[var(--brand-forest-light)] font-bold shadow-xs border border-[var(--brand-accent-border)]'
                    : 'text-[var(--text-muted)] hover:bg-[var(--canvas-card-subtle)] hover:text-[var(--text-main)]'
                }`}
                style={{
                  paddingLeft: !isPage && item.level && item.level > 1 ? `${item.level * 10}px` : undefined,
                }}
              >
                <div className="flex items-center gap-2 truncate">
                  {isPage ? (
                    <BookOpen className="h-3 w-3 shrink-0 text-[var(--brand-emerald)]" />
                  ) : (
                    <Hash className="h-3 w-3 shrink-0 text-[var(--text-faint)] group-hover:text-[var(--brand-emerald)]" />
                  )}
                  <span className="truncate">{item.title}</span>
                </div>
                <ChevronRight
                  className={`h-3 w-3 shrink-0 transition-transform ${
                    isActive ? 'text-[var(--brand-emerald)] translate-x-0.5' : 'text-[var(--border-strong)] opacity-0 group-hover:opacity-100'
                  }`}
                />
              </button>
            );
          })
        )}
      </div>
    </nav>
  );
}
