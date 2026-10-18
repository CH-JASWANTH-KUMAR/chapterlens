import { segmentText, extractWords } from './segmenter';
import { countTotalSyllables } from './syllables';
import { calculateFleschScore, getReadabilityBand, calculateReadingTimeMinutes } from './flesch';
import { identifyHardestSentences } from './difficulty';
import { AnalysisResult } from './types';

/**
 * Analyzes full chapter text deterministically in-browser.
 */
export function analyzeChapter(text: string): AnalysisResult {
  const normalizedText = text.replace(/\r\n/g, '\n');
  const sentences = segmentText(normalizedText);

  // Paragraph count
  const paragraphs = normalizedText
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
  const totalParagraphs = Math.max(1, paragraphs.length);

  // Total raw document tokens (including numbers and symbols)
  const extractedWordCount = normalizedText
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0).length;

  // Extract all clean prose words across text (linguistic phonemes for syllables/cadence)
  const allWords = extractWords(normalizedText);
  const totalWords = allWords.length;
  const totalSentences = sentences.length;

  if (totalWords === 0 || totalSentences === 0) {
    const defaultBand = getReadabilityBand(0);
    return {
      rawFleschScore: 0,
      clampedScore: 0,
      band: defaultBand,
      totalWords: 0,
      extractedWordCount,
      totalSentences: 0,
      totalParagraphs: 0,
      totalSyllables: 0,
      averageWordsPerSentence: 0,
      averageSyllablesPerWord: 0,
      estimatedReadingTimeMinutes: 0,
      difficultSentences: [],
      sentences: [],
      isStatisticallyReliable: false,
      reliabilityNotice: 'No analyzeable words or sentences detected.',
      analyzedAt: new Date().toISOString(),
    };
  }

  // Calculate syllables
  const totalSyllables = countTotalSyllables(allWords);
  const avgWordsPerSentence = Math.round((totalWords / totalSentences) * 10) / 10;
  const avgSyllablesPerWord = Math.round((totalSyllables / totalWords) * 100) / 100;

  // Flesch score
  const { rawScore, clampedScore } = calculateFleschScore(
    totalWords,
    totalSentences,
    totalSyllables
  );
  const band = getReadabilityBand(clampedScore);
  const readingTime = calculateReadingTimeMinutes(totalWords);

  // Identify hardest sentences (up to 5)
  const difficultSentences = identifyHardestSentences(sentences, 5);

  // Statistical reliability checks
  let isStatisticallyReliable = true;
  let reliabilityNotice: string | undefined = undefined;

  if (totalWords < 30 || totalSentences < 3) {
    isStatisticallyReliable = false;
    reliabilityNotice =
      'Short sample warning: The Flesch formula was calibrated on passages of 100+ words. Samples with fewer than 30 words or 3 sentences have high mathematical volatility.';
  } else if (totalSentences < 5) {
    reliabilityNotice = `Sample contains only ${totalSentences} sentence(s). Displaying all available sentences in difficulty ranking.`;
  }

  return {
    rawFleschScore: rawScore,
    clampedScore,
    band,
    totalWords,
    extractedWordCount,
    totalSentences,
    totalParagraphs,
    totalSyllables,
    averageWordsPerSentence: avgWordsPerSentence,
    averageSyllablesPerWord: avgSyllablesPerWord,
    estimatedReadingTimeMinutes: readingTime,
    difficultSentences,
    sentences,
    isStatisticallyReliable,
    reliabilityNotice,
    analyzedAt: new Date().toISOString(),
  };
}
