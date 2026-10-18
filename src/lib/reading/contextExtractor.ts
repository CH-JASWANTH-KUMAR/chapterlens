import { ExtractedDocument, ExtractedBlock, SourceLocation } from '../document/types';
import { findBlockForOffset, getLocationFromBlock } from '../document/locator';
import { SelectedPassage } from './types';

export const MAX_CONTEXT_LENGTH = 1200; // Strict limit on context length transmitted

/**
 * Extracts the minimum necessary surrounding context for a selected passage in an ExtractedDocument.
 * Strictly avoids transmitting entire documents or large sections.
 */
export function extractPassageContext(
  doc: ExtractedDocument,
  startIndex: number,
  endIndex: number,
  passageText?: string
): SelectedPassage {
  const text = passageText || doc.fullText.slice(startIndex, endIndex).trim();
  const enclosingBlock = findBlockForOffset(doc.blocks, startIndex);

  let surroundingContext = '';
  let sourceLocation: SourceLocation;

  if (enclosingBlock) {
    sourceLocation = getLocationFromBlock(enclosingBlock);
    const blockIndex = doc.blocks.findIndex((b) => b.id === enclosingBlock.id);

    // Primary context is the enclosing paragraph
    surroundingContext = enclosingBlock.text;

    // If the paragraph is short (< 200 chars), append immediate neighboring block if available
    if (surroundingContext.length < 200 && blockIndex >= 0) {
      const prevBlock = blockIndex > 0 ? doc.blocks[blockIndex - 1] : null;
      const nextBlock = blockIndex < doc.blocks.length - 1 ? doc.blocks[blockIndex + 1] : null;

      let combined = '';
      if (prevBlock && prevBlock.type === 'paragraph') {
        combined += `${prevBlock.text}\n\n`;
      }
      combined += surroundingContext;
      if (nextBlock && nextBlock.type === 'paragraph') {
        combined += `\n\n${nextBlock.text}`;
      }
      surroundingContext = combined;
    }
  } else {
    // Fallback: slice 250 characters before and after the passage from fullText
    const startWindow = Math.max(0, startIndex - 250);
    const endWindow = Math.min(doc.fullText.length, endIndex + 250);
    surroundingContext = doc.fullText.slice(startWindow, endWindow).trim();
    sourceLocation = { paragraphIndex: 0 };
  }

  // Enforce strict upper bound on surrounding context
  if (surroundingContext.length > MAX_CONTEXT_LENGTH) {
    // Center around the passage
    const passageIdxInContext = surroundingContext.indexOf(text);
    if (passageIdxInContext !== -1) {
      const halfWindow = Math.floor((MAX_CONTEXT_LENGTH - text.length) / 2);
      const sliceStart = Math.max(0, passageIdxInContext - halfWindow);
      const sliceEnd = Math.min(surroundingContext.length, sliceStart + MAX_CONTEXT_LENGTH);
      surroundingContext = surroundingContext.slice(sliceStart, sliceEnd).trim();
    } else {
      surroundingContext = surroundingContext.slice(0, MAX_CONTEXT_LENGTH).trim();
    }
  }

  return {
    text,
    startIndex,
    endIndex,
    blockId: enclosingBlock?.id,
    sourceLocation,
    surroundingContext: surroundingContext || text,
  };
}
