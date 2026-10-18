import {
  ExtractedDocument,
  DocumentValidationError,
  ExtractionProgress,
  SourceFormat,
} from './types';
import { extractFromPdf } from './extractors/pdfExtractor';
import { extractFromDocx } from './extractors/docxExtractor';
import { extractFromTxt } from './extractors/txtExtractor';

export const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB
export const SUPPORTED_EXTENSIONS = ['pdf', 'docx', 'txt'] as const;

export interface ExtractionOptions {
  onProgress?: (progress: ExtractionProgress) => void;
  signal?: AbortSignal;
}

/**
 * Formats byte size into human readable string (e.g. "1.2 MB" or "450 KB").
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Determines source format from file name or MIME type.
 */
export function detectFormat(fileName: string, mimeType?: string): SourceFormat | null {
  const ext = fileName.split('.').pop()?.toLowerCase();

  if (ext === 'pdf' || mimeType === 'application/pdf') {
    return 'pdf';
  }
  if (
    ext === 'docx' ||
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    return 'docx';
  }
  if (ext === 'txt' || mimeType === 'text/plain') {
    return 'txt';
  }

  return null;
}

/**
 * Validates a file for size, emptiness, and supported format before processing.
 */
export function validateFile(file: File | { name: string; size: number; type?: string }): SourceFormat {
  if (file.size === 0) {
    throw new DocumentValidationError(
      'EMPTY_FILE',
      'The selected file is empty (0 bytes).',
      'Please choose a file that contains written manuscript content.'
    );
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new DocumentValidationError(
      'SIZE_LIMIT_EXCEEDED',
      `File size (${formatFileSize(file.size)}) exceeds the 25 MB browser processing limit.`,
      'To ensure fast and reliable browser performance, please upload a smaller chapter segment or split the document.'
    );
  }

  const format = detectFormat(file.name, file.type);
  if (!format) {
    const ext = file.name.includes('.') ? `.${file.name.split('.').pop()}` : '';
    throw new DocumentValidationError(
      'UNSUPPORTED_TYPE',
      `Unsupported file format (${ext || 'unknown'}).`,
      'ChapterLens currently supports PDF (.pdf with selectable text), Word (.docx), and plain text (.txt) files. You can also paste your text directly.'
    );
  }

  return format;
}

/**
 * Universal helper to read ArrayBuffer from File/Blob across Browser, JSDOM, and Node.
 */
export async function fileToArrayBuffer(file: Blob | File | ArrayBuffer): Promise<ArrayBuffer> {
  if (file instanceof ArrayBuffer) return file;
  if (typeof (file as any).arrayBuffer === 'function') {
    try {
      const buf = await (file as any).arrayBuffer();
      if (buf && buf instanceof ArrayBuffer) return buf;
    } catch {}
  }
  if (typeof FileReader !== 'undefined') {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = () => reject(reader.error || new Error('FileReader failed'));
      reader.readAsArrayBuffer(file as any);
    });
  }
  throw new Error('Unable to read file into ArrayBuffer in the current environment.');
}

/**
 * Main ingestion entry point. Validates and extracts structured document model
 * directly in the browser memory with progress and cancellation support.
 */
export async function extractDocument(
  file: File,
  options?: ExtractionOptions
): Promise<ExtractedDocument> {
  const format = validateFile(file);

  options?.onProgress?.({
    stage: 'reading',
    percent: 5,
    message: `Reading ${file.name} (${formatFileSize(file.size)})...`,
  });

  const arrayBuffer = await fileToArrayBuffer(file);

  try {
    switch (format) {
      case 'pdf':
        return await extractFromPdf(
          arrayBuffer,
          file.name,
          file.size,
          options?.onProgress,
          options?.signal
        );

      case 'docx':
        options?.onProgress?.({
          stage: 'parsing',
          percent: 30,
          message: 'Extracting sections and paragraphs from Word document...',
        });
        const docxDoc = await extractFromDocx(arrayBuffer, file.name, file.size);
        options?.onProgress?.({
          stage: 'complete',
          percent: 100,
          message: 'DOCX extraction complete.',
        });
        return docxDoc;

      case 'txt':
        options?.onProgress?.({
          stage: 'parsing',
          percent: 40,
          message: 'Parsing plain text paragraphs...',
        });
        const txtDoc = await extractFromTxt(arrayBuffer, file.name, file.size);
        options?.onProgress?.({
          stage: 'complete',
          percent: 100,
          message: 'Text extraction complete.',
        });
        return txtDoc;

      default:
        throw new DocumentValidationError(
          'UNSUPPORTED_TYPE',
          'Unsupported file format.',
          'Please select a PDF, DOCX, or TXT file.'
        );
    }
  } catch (err: any) {
    if (err instanceof DocumentValidationError) {
      throw err;
    }
    throw new DocumentValidationError(
      'CORRUPTED_FILE',
      `Error processing document: ${err?.message || 'Unknown error'}`,
      'Please verify that the file is not corrupted and try again.'
    );
  }
}
