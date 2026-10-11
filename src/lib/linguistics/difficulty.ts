import { SentenceToken, DifficultSentence, ContributingSignals } from './types';

export interface DifficultyWeights {
  length: number;
  syllablesPerWord: number;
  polysyllabicRatio: number;
  structuralComplexity: number;
}

export const DEFAULT_DIFFICULTY_WEIGHTS: DifficultyWeights = {
  length: 0.35,
  syllablesPerWord: 0.25,
  polysyllabicRatio: 0.25,
  structuralComplexity: 0.15,
};

/**
 * Calculates normalized difficulty signals and score for a single sentence token.
 */
export function scoreSentenceDifficulty(
  token: SentenceToken,
  weights: DifficultyWeights = DEFAULT_DIFFICULTY_WEIGHTS
): {
  score: number;
  signals: ContributingSignals;
  primaryIssue: 'length' | 'vocabulary' | 'structure' | 'combination';
  explanation: string;
} {
  const wordCount = token.wordCount;
  if (wordCount === 0) {
    return {
      score: 0,
      signals: {
        wordCount: 0,
        syllableCount: 0,
        avgSyllablesPerWord: 0,
        polysyllabicWordCount: 0,
        polysyllabicRatio: 0,
        complexPunctuationCount: 0,
        structuralComplexityScore: 0,
        lengthScore: 0,
        vocabularyScore: 0,
      },
      primaryIssue: 'length',
      explanation: 'Empty or punctuation-only fragment.',
    };
  }

  const avgSyllables = token.syllableCount / wordCount;
  const polyRatio = token.polysyllabicWordCount / wordCount;

  // 1. Length feature: 8 words = 0.0; 50+ words = 1.0
  const lengthScore = Math.min(1, Math.max(0, (wordCount - 8) / 42));

  // 2. Syllable density: 1.2 syllables/word = 0.0; 2.4+ = 1.0
  const syllableScore = Math.min(1, Math.max(0, (avgSyllables - 1.2) / 1.2));

  // 3. Polysyllabic ratio: 0% = 0.0; 40%+ = 1.0
  const polyScore = Math.min(1, Math.max(0, polyRatio / 0.4));

  // 4. Structural complexity: semicolons, em dashes, parentheticals, colons, comma density
  const commaDensity = token.commaCount / Math.max(1, wordCount);
  const structuralScore = Math.min(
    1,
    token.complexPunctuationCount * 0.25 + Math.min(0.5, commaDensity * 2.5)
  );

  const vocabularyComposite = (syllableScore + polyScore) / 2;

  // Composite normalized score scaled to 0-100
  const rawScore =
    weights.length * lengthScore +
    weights.syllablesPerWord * syllableScore +
    weights.polysyllabicRatio * polyScore +
    weights.structuralComplexity * structuralScore;

  const score = Math.round(rawScore * 1000) / 10; // 1 decimal place

  // Determine primary friction driver
  let primaryIssue: 'length' | 'vocabulary' | 'structure' | 'combination' = 'combination';
  let explanation = '';

  const highLength = lengthScore >= 0.6;
  const highVocab = vocabularyComposite >= 0.55;
  const highStructure = structuralScore >= 0.5;

  if (highLength && !highVocab && !highStructure) {
    primaryIssue = 'length';
    explanation = `${wordCount} words in a single sentence. Readers must hold multiple premises in working memory before reaching the resolution.`;
  } else if (highVocab && !highLength && !highStructure) {
    primaryIssue = 'vocabulary';
    explanation = `High vocabulary density (${token.polysyllabicWordCount} words with 3+ syllables, avg ${avgSyllables.toFixed(1)} syllables/word) requires extra phonological decoding effort.`;
  } else if (highStructure && !highLength && !highVocab) {
    primaryIssue = 'structure';
    explanation = `Complex structural cadence with ${token.complexPunctuationCount} nested punctuation breaks (semicolons/dashes/parentheses) and ${token.commaCount} pauses.`;
  } else if (highLength && highVocab) {
    primaryIssue = 'combination';
    explanation = `Compounded difficulty: ${wordCount} words coupled with dense polysyllabic terms (${token.polysyllabicWordCount} complex words), slowing cadence significantly.`;
  } else if (highLength && highStructure) {
    primaryIssue = 'combination';
    explanation = `Long syntactic path (${wordCount} words) segmented by multiple clauses and punctuation turns (${token.commaCount} commas, ${token.complexPunctuationCount} structural marks).`;
  } else {
    primaryIssue = 'combination';
    explanation = `Elevated combination of sentence length (${wordCount} words), syllable weight (${avgSyllables.toFixed(1)} syl/word), and syntactic variation.`;
  }

  const signals: ContributingSignals = {
    wordCount,
    syllableCount: token.syllableCount,
    avgSyllablesPerWord: Math.round(avgSyllables * 100) / 100,
    polysyllabicWordCount: token.polysyllabicWordCount,
    polysyllabicRatio: Math.round(polyRatio * 100) / 100,
    complexPunctuationCount: token.complexPunctuationCount,
    structuralComplexityScore: Math.round(structuralScore * 100) / 100,
    lengthScore: Math.round(lengthScore * 100) / 100,
    vocabularyScore: Math.round(vocabularyComposite * 100) / 100,
  };

  return {
    score,
    signals,
    primaryIssue,
    explanation,
  };
}

/**
 * Identify the top hardest sentences (up to maxCount, default 5).
 * Uses deterministic tie-breaking:
 * 1. Higher difficulty score
 * 2. Higher polysyllabic word count
 * 3. Higher word count
 * 4. Earlier startIndex in text
 */
export function identifyHardestSentences(
  tokens: SentenceToken[],
  maxCount: number = 5,
  weights: DifficultyWeights = DEFAULT_DIFFICULTY_WEIGHTS
): DifficultSentence[] {
  if (tokens.length === 0) return [];

  // Score each sentence
  const scored = tokens.map((token) => {
    const { score, signals, primaryIssue, explanation } = scoreSentenceDifficulty(token, weights);
    return {
      token,
      score,
      signals,
      primaryIssue,
      explanation,
    };
  });

  // Sort descending with deterministic tie-breaking
  scored.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    if (b.token.polysyllabicWordCount !== a.token.polysyllabicWordCount) {
      return b.token.polysyllabicWordCount - a.token.polysyllabicWordCount;
    }
    if (b.token.wordCount !== a.token.wordCount) {
      return b.token.wordCount - a.token.wordCount;
    }
    return a.token.startIndex - b.token.startIndex;
  });

  const countToTake = Math.min(maxCount, scored.length);
  const topScored = scored.slice(0, countToTake);

  return topScored.map((item, index) => ({
    id: item.token.id,
    rank: index + 1,
    text: item.token.text,
    startIndex: item.token.startIndex,
    endIndex: item.token.endIndex,
    difficultyScore: item.score,
    explanation: item.explanation,
    primaryIssue: item.primaryIssue,
    signals: item.signals,
  }));
}
