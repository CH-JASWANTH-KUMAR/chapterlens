export type SourceFormat = 'pdf' | 'docx' | 'txt' | 'pasted';

export interface SourceLocation {
  pageNumber?: number; // 1-indexed for page-aware documents (PDF)
  sectionHeading?: string; // Section / heading name (DOCX / structured text)
  sectionLevel?: number; // 1 for H1, 2 for H2, etc.
  headingHierarchy?: string[]; // Breadcrumb hierarchy of enclosing headings
  paragraphIndex: number; // 0-indexed paragraph within the document
}

export interface ExtractedBlock {
  id: string;
  type: 'heading' | 'paragraph';
  level?: number; // e.g. 1 for H1, 2 for H2 (only if type === 'heading')
  pageNumber?: number; // 1-indexed page number if available (PDF)
  sectionHeading?: string; // Nearest preceding section heading
  headingHierarchy?: string[];
  text: string;
  startIndex: number; // Inclusive start character offset in ExtractedDocument.fullText
  endIndex: number; // Exclusive end character offset in ExtractedDocument.fullText
  paragraphIndex: number;
}

export type ExtractionWarningCode =
  | 'SCANNED_PAGE_DETECTED'
  | 'EMPTY_PAGES'
  | 'COMPLEX_FORMATTING'
  | 'UNSUPPORTED_ELEMENTS'
  | 'TRUNCATED';

export interface DocumentExtractionWarning {
  code: ExtractionWarningCode;
  message: string;
  pageNumber?: number;
}

export interface ExtractedDocument {
  id: string;
  fileName: string;
  fileSize: number;
  format: SourceFormat;
  extractedAt: string;
  fullText: string;
  blocks: ExtractedBlock[];
  pageCount?: number;
  hasHeadings: boolean;
  warnings: DocumentExtractionWarning[];
}

export type ExtractionStage = 'reading' | 'parsing' | 'extracting' | 'structuring' | 'complete';

export interface ExtractionProgress {
  stage: ExtractionStage;
  percent: number;
  currentPage?: number;
  totalPages?: number;
  message: string;
}

export type ValidationErrorCode =
  | 'UNSUPPORTED_TYPE'
  | 'SIZE_LIMIT_EXCEEDED'
  | 'EMPTY_FILE'
  | 'CORRUPTED_FILE'
  | 'PASSWORD_PROTECTED'
  | 'NO_TEXT_FOUND'
  | 'ABORTED';

export class DocumentValidationError extends Error {
  code: ValidationErrorCode;
  recoveryGuidance: string;

  constructor(code: ValidationErrorCode, message: string, recoveryGuidance: string) {
    super(message);
    this.name = 'DocumentValidationError';
    this.code = code;
    this.recoveryGuidance = recoveryGuidance;
  }
}
