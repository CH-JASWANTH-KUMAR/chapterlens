import { SourceLocation, DocumentExtractionWarning } from '../document/types';
export type { SourceLocation };

export interface SentenceToken {
  id: string;
  text: string;
  startIndex: number;
  endIndex: number;
  paragraphIndex: number;
  sentenceIndexInParagraph: number;
  wordCount: number;
  syllableCount: number;
  polysyllabicWordCount: number; // words with >= 3 syllables
  longWordCount: number; // words with >= 10 characters
  complexPunctuationCount: number; // semicolons, em dashes, parentheses, colons
  commaCount: number;
  sourceLocation?: SourceLocation;
  isNonProse?: boolean;
}

export interface ContributingSignals {
  wordCount: number;
  syllableCount: number;
  avgSyllablesPerWord: number;
  polysyllabicWordCount: number;
  polysyllabicRatio: number;
  complexPunctuationCount: number;
  structuralComplexityScore: number;
  lengthScore: number;
  vocabularyScore: number;
}

export interface DifficultSentence {
  id: string;
  rank: number;
  text: string;
  startIndex: number;
  endIndex: number;
  difficultyScore: number; // 0 to 100
  explanation: string;
  primaryIssue: 'length' | 'vocabulary' | 'structure' | 'combination';
  signals: ContributingSignals;
  suggestedRewrite?: string;
  editorialTip?: string;
  aiRewrite?: string;
  aiProvider?: string;
  sourceLocation?: SourceLocation;
  isNonProse?: boolean;
}

export interface ReadabilityBand {
  min: number;
  max: number;
  label: string;
  gradeLevel: string;
  targetAudience: string;
  color: string;
  badgeClass: string;
  summary: string;
}

export interface AnalysisResult {
  rawFleschScore: number;
  clampedScore: number;
  band: ReadabilityBand;
  totalWords: number; // Analyzed prose words evaluated for syllables and cadence
  extractedWordCount?: number; // Total raw extracted tokens/words in document
  totalSentences: number;
  totalParagraphs: number;
  totalSyllables: number;
  averageWordsPerSentence: number;
  averageSyllablesPerWord: number;
  estimatedReadingTimeMinutes: number;
  difficultSentences: DifficultSentence[];
  sentences: SentenceToken[];
  isStatisticallyReliable: boolean;
  reliabilityNotice?: string;
  analyzedAt: string;
  sourceDocument?: {
    id?: string;
    fileName: string;
    format: string;
    pageCount?: number;
    hasHeadings?: boolean;
    isSample?: boolean;
    warnings?: DocumentExtractionWarning[];
  };
}

export interface TextSegment {
  text: string;
  startIndex: number;
  endIndex: number;
  isDifficult: boolean;
  difficultSentence?: DifficultSentence;
}
