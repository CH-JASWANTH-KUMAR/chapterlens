import { DifficultSentence, TextSegment } from './types';

/**
 * Slices the unmutated original text into contiguous segments of normal text
 * and highlighted difficult sentences using strict character offsets.
 *
 * Guaranteed:
 * - 100% preservation of original characters, spaces, and line breaks
 * - Zero regex string search or replacement
 * - Handles repeated identical sentences without collisions
 */
export function buildTextSegments(
  originalText: string,
  difficultSentences: DifficultSentence[]
): TextSegment[] {
  if (!originalText) return [];
  if (!difficultSentences || difficultSentences.length === 0) {
    return [
      {
        text: originalText,
        startIndex: 0,
        endIndex: originalText.length,
        isDifficult: false,
      },
    ];
  }

  // Sort highlights strictly by ascending startIndex
  const sorted = [...difficultSentences].sort((a, b) => a.startIndex - b.startIndex);

  const segments: TextSegment[] = [];
  let cursor = 0;

  for (const sentence of sorted) {
    // If there is un-highlighted text before this sentence
    if (sentence.startIndex > cursor) {
      segments.push({
        text: originalText.slice(cursor, sentence.startIndex),
        startIndex: cursor,
        endIndex: sentence.startIndex,
        isDifficult: false,
      });
    }

    // Ensure we don't produce overlapping invalid offsets
    const actualStart = Math.max(cursor, sentence.startIndex);
    const actualEnd = Math.max(actualStart, sentence.endIndex);

    if (actualEnd > actualStart) {
      segments.push({
        text: originalText.slice(actualStart, actualEnd),
        startIndex: actualStart,
        endIndex: actualEnd,
        isDifficult: true,
        difficultSentence: sentence,
      });
      cursor = actualEnd;
    }
  }

  // Add any remaining text after the final highlighted sentence
  if (cursor < originalText.length) {
    segments.push({
      text: originalText.slice(cursor),
      startIndex: cursor,
      endIndex: originalText.length,
      isDifficult: false,
    });
  }

  return segments;
}
