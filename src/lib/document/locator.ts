import { ExtractedBlock, ExtractedDocument, SourceLocation } from './types';
import { AnalysisResult, DifficultSentence, SentenceToken } from '../linguistics/types';

/**
 * Finds the ExtractedBlock that encloses a specific character offset in fullText.
 * Uses binary search over blocks sorted by startIndex.
 */
export function findBlockForOffset(
  blocks: ExtractedBlock[],
  offset: number
): ExtractedBlock | undefined {
  if (!blocks || blocks.length === 0) return undefined;

  let low = 0;
  let high = blocks.length - 1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const block = blocks[mid];

    if (offset >= block.startIndex && offset <= block.endIndex) {
      return block;
    }

    if (offset < block.startIndex) {
      high = mid - 1;
    } else {
      low = mid + 1;
    }
  }

  // Fallback: If offset falls in whitespace between blocks, find nearest preceding block
  if (high >= 0 && high < blocks.length) {
    return blocks[high];
  }

  return blocks[0];
}

/**
 * Constructs a clean SourceLocation from an ExtractedBlock.
 */
export function getLocationFromBlock(block: ExtractedBlock): SourceLocation {
  const headingHierarchy =
    block.headingHierarchy || (block.sectionHeading ? [block.sectionHeading] : undefined);
  return {
    pageNumber: block.pageNumber,
    sectionHeading: block.sectionHeading || headingHierarchy?.[headingHierarchy.length - 1],
    sectionLevel: block.level,
    headingHierarchy,
    paragraphIndex: block.paragraphIndex,
  };
}

/**
 * Enriches an AnalysisResult with source location information from an ExtractedDocument.
 * Maps every sentence and difficult sentence back to its original page, section, and paragraph.
 */
export function enrichAnalysisWithDocument(
  analysis: AnalysisResult,
  document: ExtractedDocument
): AnalysisResult {
  const blocks = document.blocks;

  const enrichedDifficultSentences: DifficultSentence[] = analysis.difficultSentences.map(
    (sentence) => {
      const block = findBlockForOffset(blocks, sentence.startIndex);
      const sourceLocation = block ? getLocationFromBlock(block) : undefined;
      return {
        ...sentence,
        sourceLocation,
      };
    }
  );

  const enrichedSentences: SentenceToken[] = analysis.sentences.map((sentence) => {
    const block = findBlockForOffset(blocks, sentence.startIndex);
    const sourceLocation = block ? getLocationFromBlock(block) : undefined;
    return {
      ...sentence,
      sourceLocation,
    };
  });

  return {
    ...analysis,
    difficultSentences: enrichedDifficultSentences,
    sentences: enrichedSentences,
    sourceDocument: {
      id: document.id,
      fileName: document.fileName,
      format: document.format,
      pageCount: document.pageCount,
      hasHeadings: document.hasHeadings,
      isSample: Boolean(document.isSample),
    },
  };
}
