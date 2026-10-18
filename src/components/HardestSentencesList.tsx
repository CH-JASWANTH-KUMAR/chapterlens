import React from 'react';
import { DifficultSentence } from '../lib/linguistics/types';
import { DifficultSentencesCarousel } from './DifficultSentencesCarousel';

interface HardestSentencesListProps {
  sentences: DifficultSentence[];
  totalSentencesInText: number;
  selectedSentenceId: string | null;
  onSelectSentence: (sentence: DifficultSentence) => void;
  onOpenRewrite: (sentence: DifficultSentence) => void;
  onOpenGuidedReading?: (sentence: DifficultSentence) => void;
}

export function HardestSentencesList(props: HardestSentencesListProps) {
  return <DifficultSentencesCarousel {...props} />;
}

