import { ExtractedBlock, ExtractedDocument } from '../types';

/**
 * Creates an ExtractedDocument from raw pasted text or sample passages.
 * Preserves paragraph structure and provides full compatibility with the document model.
 */
export function createDocumentFromPastedText(
  text: string,
  title = 'Pasted Manuscript'
): ExtractedDocument {
  const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const paragraphs = normalized.split(/\n{2,}/);

  const blocks: ExtractedBlock[] = [];
  let fullText = '';
  let cursor = 0;
  let paragraphIndex = 0;

  for (let i = 0; i < paragraphs.length; i++) {
    const pText = paragraphs[i].trim();
    if (!pText) continue;

    if (fullText.length > 0) {
      fullText += '\n\n';
      cursor += 2;
    }

    const start = cursor;
    fullText += pText;
    cursor += pText.length;
    const end = cursor;

    const isHeading =
      pText.length < 80 &&
      !/[.?!]$/.test(pText) &&
      (pText.startsWith('#') ||
        /^chapter\s+\d+/i.test(pText) ||
        (pText === pText.toUpperCase() && pText.length > 3));

    blocks.push({
      id: `block-${blocks.length + 1}`,
      type: isHeading ? 'heading' : 'paragraph',
      level: isHeading ? 1 : undefined,
      text: pText.replace(/^#+\s*/, ''),
      startIndex: start,
      endIndex: end,
      paragraphIndex: paragraphIndex++,
    });
  }

  return {
    id: `doc-pasted-${Date.now()}`,
    fileName: title,
    fileSize: new Blob([normalized]).size,
    format: 'pasted',
    extractedAt: new Date().toISOString(),
    fullText: fullText || normalized,
    blocks,
    hasHeadings: blocks.some((b) => b.type === 'heading'),
    warnings: [],
  };
}

export const extractFromPastedText = createDocumentFromPastedText;
