import { ExtractedBlock, ExtractedDocument, DocumentValidationError } from '../types';

/**
 * Extracts structured blocks from plain text content or File.
 * Guarantees preservation of paragraph boundaries and clean offset tracking.
 */
export async function extractFromTxt(
  input: string | ArrayBuffer | Blob,
  fileName = 'document.txt',
  fileSize = 0
): Promise<ExtractedDocument> {
  let rawText = '';

  if (typeof input === 'string') {
    rawText = input;
  } else if (input instanceof Blob) {
    rawText = await input.text();
  } else if (input instanceof ArrayBuffer) {
    const decoder = new TextDecoder('utf-8');
    rawText = decoder.decode(input);
  }

  // Normalize line breaks (\r\n and \r to \n)
  const normalized = rawText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  if (!normalized.trim()) {
    throw new DocumentValidationError(
      'EMPTY_FILE',
      'The text file is empty or contains only whitespace.',
      'Please select a text file with readable content.'
    );
  }

  // Split into paragraphs by two or more newlines
  const paragraphStrings = normalized.split(/\n{2,}/);
  const blocks: ExtractedBlock[] = [];

  let fullText = '';
  let cursor = 0;
  let paragraphIndex = 0;

  for (let i = 0; i < paragraphStrings.length; i++) {
    const pText = paragraphStrings[i].trim();
    if (!pText) continue;

    if (fullText.length > 0) {
      fullText += '\n\n';
      cursor += 2;
    }

    const start = cursor;
    fullText += pText;
    cursor += pText.length;
    const end = cursor;

    // Detect if this short line looks like a title/heading (e.g. "Chapter 1", all caps, or under 60 chars ending without terminal punct)
    const isHeading =
      pText.length < 80 &&
      !/[.?!]$/.test(pText) &&
      (pText.startsWith('#') ||
        /^chapter\s+\d+/i.test(pText) ||
        pText === pText.toUpperCase() && pText.length > 3);

    const cleanText = pText.replace(/^#+\s*/, '');

    blocks.push({
      id: `block-${blocks.length + 1}`,
      type: isHeading ? 'heading' : 'paragraph',
      level: isHeading ? 1 : undefined,
      text: cleanText,
      startIndex: start,
      endIndex: end,
      paragraphIndex: paragraphIndex++,
    });
  }

  if (blocks.length === 0) {
    throw new DocumentValidationError(
      'NO_TEXT_FOUND',
      'No analyzeable text could be extracted from this text file.',
      'Check that the text file contains written prose.'
    );
  }

  return {
    id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    fileName,
    fileSize: fileSize || rawText.length,
    format: 'txt',
    extractedAt: new Date().toISOString(),
    fullText,
    blocks,
    hasHeadings: blocks.some((b) => b.type === 'heading'),
    warnings: [],
  };
}
