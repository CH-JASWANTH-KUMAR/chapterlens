import { SourceLocation } from '../document/types';

export type ExplanationLevel = 'beginner' | 'step-by-step' | 'technical';

export interface SelectedPassage {
  text: string;
  startIndex: number;
  endIndex: number;
  blockId?: string;
  sourceLocation: SourceLocation;
  surroundingContext: string;
}

export interface PrerequisiteConcept {
  name: string;
  definition: string;
  whyItMatters: string;
}

export interface ComprehensionCheck {
  question: string;
  answer: string;
  explanation: string;
}

export interface PassageExplanation {
  passage: string;
  level: ExplanationLevel;
  explanation: string;
  terms: Array<{ term: string; definition: string }>;
  contextFit: string;
  sourceReference: {
    passage: string;
    pageNumber?: number;
    sectionHeading?: string;
    paragraphIndex: number;
  };
  prerequisites: PrerequisiteConcept[];
  comprehensionCheck?: ComprehensionCheck;
  limitationsNotice?: string;
  fromCache?: boolean;
  generatedAt: string;
}

export interface ExplainRequestPayload {
  selectedPassage: string;
  surroundingContext?: string;
  sourceLocation?: {
    pageNumber?: number;
    sectionHeading?: string;
    paragraphIndex?: number;
  };
  level: ExplanationLevel;
  conceptToExplore?: string;
}
