import {
  ExtractedBlock,
  ExtractedDocument,
  DocumentExtractionWarning,
  DocumentValidationError,
  ExtractionProgress,
} from '../types';

let pdfjsCache: any = null;

async function getPdfJsLibrary() {
  if (pdfjsCache) return pdfjsCache;

  // Use universal legacy build for maximum compatibility across Node, tests, and modern browsers
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');

  if (typeof window !== 'undefined' && !pdfjs.GlobalWorkerOptions.workerSrc) {
    // Local worker in public directory ensures 100% offline local processing without CDN network calls
    pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
  }

  pdfjsCache = pdfjs;
  return pdfjs;
}

/**
 * Reconstructs lines and paragraphs from PDF text items on a single page.
 * Uses item coordinates (transform) to detect vertical drops and line/paragraph breaks.
 */
function reconstructPageParagraphs(items: any[]): string[] {
  if (!items || items.length === 0) return [];

  interface TextRun {
    str: string;
    x: number;
    y: number;
    width: number;
    height: number;
    hasEOL: boolean;
  }

  const textRuns: TextRun[] = [];

  for (const item of items) {
    if (!item.str || typeof item.str !== 'string') continue;
    const transform = item.transform || [1, 0, 0, 1, 0, 0];
    const x = transform[4];
    const y = transform[5];
    const height = Math.abs(transform[3]) || 12;
    const width = item.width || 0;

    textRuns.push({
      str: item.str,
      x,
      y,
      width,
      height,
      hasEOL: Boolean(item.hasEOL),
    });
  }

  if (textRuns.length === 0) return [];

  // Group into lines based on Y coordinate proximity
  const lines: string[] = [];
  let currentLine = '';
  let lastY = textRuns[0].y;
  let lastHeight = textRuns[0].height;
  let lastX = textRuns[0].x;
  let lastWidth = textRuns[0].width;

  for (let i = 0; i < textRuns.length; i++) {
    const run = textRuns[i];
    const yDiff = Math.abs(run.y - lastY);
    const isNewLine = yDiff > lastHeight * 0.45;

    if (isNewLine) {
      if (currentLine.trim()) {
        lines.push(currentLine.trim());
      }
      currentLine = run.str;
    } else {
      // Check if space needed between horizontal items on the same line
      const spaceNeeded =
        currentLine.length > 0 &&
        !currentLine.endsWith(' ') &&
        !run.str.startsWith(' ') &&
        run.x > lastX + lastWidth + 2;

      currentLine += (spaceNeeded ? ' ' : '') + run.str;
    }

    lastY = run.y;
    lastHeight = run.height;
    lastX = run.x;
    lastWidth = run.width;
  }

  if (currentLine.trim()) {
    lines.push(currentLine.trim());
  }

  // Group lines into paragraphs (short lines or double spacing create paragraph breaks)
  const paragraphs: string[] = [];
  let currentParagraphLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // If this line starts a new figure caption or table header (e.g. "Figure 2:", "Figure 3:", "Table 1:")
    // and we already have accumulated lines from a preceding block or figure, flush the previous lines
    const isCaptionStart = /^(?:Figure|Fig\.?|Table|Chart)\s+\d+[:.]/i.test(line);
    if (isCaptionStart && currentParagraphLines.length > 0) {
      const paragraphText = currentParagraphLines.join(' ').replace(/\s+/g, ' ').trim();
      if (paragraphText) {
        paragraphs.push(paragraphText);
      }
      currentParagraphLines = [];
    }

    currentParagraphLines.push(line);

    // If line ends with terminal punctuation and is noticeably shorter than average, or empty line
    const isShortTerminalLine = line.length < 55 && /[.?!:"']$/.test(line);
    const nextLine = lines[i + 1];
    const nextIsCaption = nextLine && /^(?:Figure|Fig\.?|Table|Chart)\s+\d+[:.]/i.test(nextLine);

    if (isShortTerminalLine || nextIsCaption || i === lines.length - 1) {
      const paragraphText = currentParagraphLines.join(' ').replace(/\s+/g, ' ').trim();
      if (paragraphText) {
        paragraphs.push(paragraphText);
      }
      currentParagraphLines = [];
    }
  }

  if (currentParagraphLines.length > 0) {
    const paragraphText = currentParagraphLines.join(' ').replace(/\s+/g, ' ').trim();
    if (paragraphText) {
      paragraphs.push(paragraphText);
    }
  }

  return paragraphs;
}

/**
 * Extracts structured document model from a PDF file.
 * Preserves page numbers, paragraph boundaries, and warns on scanned pages.
 */
export async function extractFromPdf(
  input: ArrayBuffer | Blob | Uint8Array,
  fileName = 'document.pdf',
  fileSize = 0,
  onProgress?: (progress: ExtractionProgress) => void,
  signal?: AbortSignal
): Promise<ExtractedDocument> {
  if (signal?.aborted) {
    throw new DocumentValidationError(
      'ABORTED',
      'Document extraction was cancelled by user.',
      'You can select the file again whenever you are ready.'
    );
  }

  let data: Uint8Array;

  if (input instanceof Blob) {
    const buf = await input.arrayBuffer();
    data = new Uint8Array(buf);
  } else if (input instanceof ArrayBuffer) {
    data = new Uint8Array(input);
  } else {
    data = input;
  }

  if (!data || data.byteLength === 0) {
    throw new DocumentValidationError(
      'EMPTY_FILE',
      'The PDF file is empty (0 bytes).',
      'Please select a valid PDF with text content.'
    );
  }

  onProgress?.({
    stage: 'reading',
    percent: 10,
    message: 'Loading PDF document structure in browser memory...',
  });

  const pdfjs = await getPdfJsLibrary();

  let loadingTask: any;
  try {
    loadingTask = pdfjs.getDocument({
      data,
      isEvalSupported: false,
    });
  } catch (err: any) {
    throw new DocumentValidationError(
      'CORRUPTED_FILE',
      `Failed to initialize PDF loader: ${err?.message || 'Unknown error'}`,
      'Please verify that the file is a standard PDF document.'
    );
  }

  // Handle cancellation if signal fires while loading
  const abortHandler = () => {
    try {
      loadingTask.destroy();
    } catch {}
  };
  signal?.addEventListener('abort', abortHandler);

  let pdfDoc: any;
  try {
    pdfDoc = await loadingTask.promise;
  } catch (err: any) {
    signal?.removeEventListener('abort', abortHandler);
    if (signal?.aborted) {
      throw new DocumentValidationError(
        'ABORTED',
        'Document extraction was cancelled by user.',
        'You can select the file again whenever you are ready.'
      );
    }
    const name = err?.name || '';
    const message = err?.message || '';
    if (name === 'PasswordException' || message.includes('password')) {
      throw new DocumentValidationError(
        'PASSWORD_PROTECTED',
        'This PDF document is encrypted or password-protected.',
        'Please remove password protection from the document before importing.'
      );
    }
    if (message.includes('Invalid PDF') || message.includes('corrupted') || message.includes('format error')) {
      throw new DocumentValidationError(
        'CORRUPTED_FILE',
        'The PDF file appears to be damaged or malformed.',
        'Please check that the file opens in your PDF reader and try uploading again.'
      );
    }
    throw new DocumentValidationError(
      'CORRUPTED_FILE',
      `Unable to parse PDF document: ${message}`,
      'Try re-saving the PDF from your document editor and uploading again.'
    );
  } finally {
    signal?.removeEventListener('abort', abortHandler);
  }

  const numPages = pdfDoc.numPages;
  const blocks: ExtractedBlock[] = [];
  const warnings: DocumentExtractionWarning[] = [];

  let fullText = '';
  let cursor = 0;
  let paragraphIndex = 0;
  let pagesWithSelectableText = 0;

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    if (signal?.aborted) {
      throw new DocumentValidationError(
        'ABORTED',
        'Document extraction was cancelled by user.',
        'You can select the file again whenever you are ready.'
      );
    }

    const percent = Math.min(95, 10 + Math.round((pageNum / numPages) * 85));
    onProgress?.({
      stage: 'extracting',
      percent,
      currentPage: pageNum,
      totalPages: numPages,
      message: `Extracting selectable text from page ${pageNum} of ${numPages}...`,
    });

    try {
      const page = await pdfDoc.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageParagraphs = reconstructPageParagraphs(textContent.items);

      if (pageParagraphs.length === 0) {
        // Page contains no selectable text (scanned or image page)
        warnings.push({
          code: 'SCANNED_PAGE_DETECTED',
          message: `Page ${pageNum} contains no selectable digital text. If this page is scanned or an image, text cannot be read without OCR.`,
          pageNumber: pageNum,
        });
      } else {
        pagesWithSelectableText++;
        for (const pText of pageParagraphs) {
          if (!pText.trim()) continue;

          if (fullText.length > 0) {
            fullText += '\n\n';
            cursor += 2;
          }

          const start = cursor;
          fullText += pText;
          cursor += pText.length;
          const end = cursor;

          // Detect potential heading
          const isHeading =
            pText.length < 80 &&
            !/[.?!]$/.test(pText) &&
            (/^(chapter|section|part)\s+\d+/i.test(pText) ||
              (pText === pText.toUpperCase() && pText.length > 4));

          blocks.push({
            id: `block-${blocks.length + 1}`,
            type: isHeading ? 'heading' : 'paragraph',
            level: isHeading ? 1 : undefined,
            pageNumber: pageNum,
            text: pText,
            startIndex: start,
            endIndex: end,
            paragraphIndex: paragraphIndex++,
          });
        }
      }
    } catch (err: any) {
      warnings.push({
        code: 'COMPLEX_FORMATTING',
        message: `Warning on page ${pageNum}: Some formatting or characters could not be parsed (${err?.message || 'Parse error'}).`,
        pageNumber: pageNum,
      });
    }
  }

  // Check if zero text was extracted across the entire PDF
  if (pagesWithSelectableText === 0 || blocks.length === 0) {
    throw new DocumentValidationError(
      'NO_TEXT_FOUND',
      'No selectable text could be extracted from this PDF. This document appears to be scanned or entirely composed of images.',
      'ChapterLens extracts digital text directly in your browser and does not perform OCR on images. Please upload a PDF with selectable text, or paste your manuscript.'
    );
  }

  onProgress?.({
    stage: 'complete',
    percent: 100,
    message: 'Document extraction complete.',
  });

  return {
    id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    fileName,
    fileSize: fileSize || data.byteLength,
    format: 'pdf',
    extractedAt: new Date().toISOString(),
    fullText,
    blocks,
    pageCount: numPages,
    hasHeadings: blocks.some((b) => b.type === 'heading'),
    warnings,
  };
}
