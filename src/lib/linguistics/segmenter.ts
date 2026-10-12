import { SentenceToken } from './types';
import { countSyllablesInWord, isPolysyllabic } from './syllables';

// Known abbreviations that end in a period and should not trigger a sentence break
const COMMON_ABBREVIATIONS = new Set([
  'mr', 'mrs', 'ms', 'dr', 'prof', 'sr', 'jr', 'rev', 'gen', 'col', 'capt', 'lt',
  'sgt', 'gov', 'sen', 'rep', 'pres', 'fr', 'br', 'hon', 'maj', 'cpl', 'pvt', 'adm',
  'cmdr', 'supt', 'insp', 'det', 'st', 'mt', 'etc', 'eg', 'ie', 'vs', 'fig', 'vol',
  'dept', 'est', 'approx', 'al', 'cf', 'ca', 'us', 'uk', 'un', 'eu', 'dc', 'ny', 'no',
]);

const TITLE_ABBREVIATIONS = new Set([
  'mr', 'mrs', 'ms', 'dr', 'prof', 'rev', 'sr', 'jr', 'st', 'mt', 'col', 'gen',
  'capt', 'lt', 'sgt', 'gov', 'sen', 'rep', 'pres', 'fr', 'br', 'hon', 'maj',
  'cpl', 'pvt', 'adm', 'cmdr', 'supt', 'insp', 'det',
]);

/**
 * Checks if a token right before a period is a known abbreviation or single-letter initial.
 */
function isAbbreviation(tokenBeforePeriod: string): boolean {
  const clean = tokenBeforePeriod.toLowerCase().replace(/[^a-z]/g, '');
  if (!clean) return false;
  // Single letter initials (e.g. "J. K. Rowling" or "John F. Kennedy")
  if (clean.length === 1) return true;
  return COMMON_ABBREVIATIONS.has(clean);
}

/**
 * Segment full input text into sentences while strictly preserving
 * the exact character offsets in the original text.
 */
export function segmentText(originalText: string): SentenceToken[] {
  if (!originalText || !originalText.trim()) {
    return [];
  }

  const sentences: SentenceToken[] = [];
  const textLength = originalText.length;

  let currentIndex = 0;
  let paragraphIndex = 0;
  let sentenceIndexInParagraph = 0;

  // Track start of current candidate sentence
  let currentSentenceStart = -1;

  while (currentIndex < textLength) {
    // Skip leading whitespace when looking for sentence start
    if (currentSentenceStart === -1) {
      if (/\s/.test(originalText[currentIndex])) {
        let hasNewline = false;
        while (currentIndex < textLength && /\s/.test(originalText[currentIndex])) {
          if (originalText[currentIndex] === '\n') {
            hasNewline = true;
          }
          currentIndex++;
        }
        if (hasNewline) {
          paragraphIndex++;
          sentenceIndexInParagraph = 0;
        }
        continue;
      }
      currentSentenceStart = currentIndex;
    }

    const char = originalText[currentIndex];

    // Check for paragraph break (\n or \r\n)
    if (char === '\n' || (char === '\r' && originalText[currentIndex + 1] === '\n')) {
      // If we have content accumulated, close the sentence at current position
      if (currentSentenceStart !== -1) {
        const sentenceRaw = originalText.slice(currentSentenceStart, currentIndex);
        if (sentenceRaw.trim().length > 0) {
          sentences.push(
            createSentenceToken(
              sentences.length.toString(),
              sentenceRaw,
              currentSentenceStart,
              currentIndex,
              paragraphIndex,
              sentenceIndexInParagraph++
            )
          );
        }
        currentSentenceStart = -1;
      }

      // Consume this newline and any subsequent whitespace/newlines in this break
      while (currentIndex < textLength && /\s/.test(originalText[currentIndex])) {
        if (originalText[currentIndex] === '\r' && originalText[currentIndex + 1] === '\n') {
          currentIndex += 2;
        } else {
          currentIndex++;
        }
      }
      paragraphIndex++;
      sentenceIndexInParagraph = 0;
      continue;
    }

    // Check for sentence terminator candidates: . ! ? …
    const isTerminator =
      char === '.' ||
      char === '!' ||
      char === '?' ||
      char === '…' ||
      (char === '.' && originalText.slice(currentIndex, currentIndex + 3) === '...');

    if (isTerminator) {
      // Check for decimal number: digit . digit
      if (
        char === '.' &&
        currentIndex > 0 &&
        /\d/.test(originalText[currentIndex - 1]) &&
        currentIndex + 1 < textLength &&
        /\d/.test(originalText[currentIndex + 1])
      ) {
        currentIndex++;
        continue;
      }

      // Check for ellipsis: ...
      let terminatorEndIndex = currentIndex + 1;
      if (char === '.' && originalText.slice(currentIndex, currentIndex + 3) === '...') {
        terminatorEndIndex = currentIndex + 3;
      }

      // Check for trailing quotation marks / brackets right after terminator
      while (
        terminatorEndIndex < textLength &&
        /['"”’»›\)\]}]/.test(originalText[terminatorEndIndex])
      ) {
        terminatorEndIndex++;
      }

      // Look at what precedes the period for abbreviation check
      if (char === '.') {
        // Extract preceding word token
        const textBefore = originalText.slice(currentSentenceStart, currentIndex);
        const lastWordMatch = textBefore.match(/([A-Za-z]+)$/);
        if (lastWordMatch) {
          const cleanAbbr = lastWordMatch[1].toLowerCase();
          const isMultiDotAbbr = /(?:^|\s|\()(?:e\.g|i\.e|vs|cf|al)$/i.test(textBefore);

          if (isAbbreviation(cleanAbbr) || isMultiDotAbbr) {
            const afterTerminator = originalText.slice(terminatorEndIndex).trimStart();
            if (afterTerminator.length > 0) {
              const nextChar = afterTerminator[0];
              // If next token begins with lowercase, it is NOT sentence boundary
              if (nextChar >= 'a' && nextChar <= 'z') {
                currentIndex = terminatorEndIndex;
                continue;
              }
              // If it's a known title like "Dr." or "Mr." or multi-dot abbreviation like "e.g.", don't split!
              if (TITLE_ABBREVIATIONS.has(cleanAbbr) || isMultiDotAbbr) {
                currentIndex = terminatorEndIndex;
                continue;
              }
            }
          }
        }
      }

      // Quoted dialogue tag check:
      // If punctuation was inside quotes and what follows on the same line starts with a lowercase letter,
      // it is a dialogue speech tag (e.g. "Wait!" said John, "Stop!" she screamed, “Voilà!” she cried).
      const remainder = originalText.slice(terminatorEndIndex);
      const isQuoteTerminated = /['"”’»›]/.test(originalText[terminatorEndIndex - 1]);
      if (isQuoteTerminated) {
        if (remainder.startsWith('—') || remainder.startsWith('--')) {
          currentIndex = terminatorEndIndex;
          continue;
        }
        const trimmedRemainder = remainder.trimStart();
        const leadingWhitespace = remainder.slice(0, remainder.length - trimmedRemainder.length);
        if (leadingWhitespace.indexOf('\n') === -1 && trimmedRemainder.length > 0) {
          const firstChar = trimmedRemainder[0];
          if (firstChar >= 'a' && firstChar <= 'z') {
            currentIndex = terminatorEndIndex;
            continue;
          }
        }
      }

      // Check what follows the terminator
      // If end of text, or followed by whitespace/newline
      const nextChar = originalText[terminatorEndIndex];
      const isEndOfText = terminatorEndIndex >= textLength;
      const isFollowedByWhitespace = isEndOfText || /\s/.test(nextChar);

      if (isFollowedByWhitespace) {
        const sentenceRaw = originalText.slice(currentSentenceStart, terminatorEndIndex);
        if (sentenceRaw.trim().length > 0) {
          sentences.push(
            createSentenceToken(
              sentences.length.toString(),
              sentenceRaw,
              currentSentenceStart,
              terminatorEndIndex,
              paragraphIndex,
              sentenceIndexInParagraph++
            )
          );
        }
        currentSentenceStart = -1;
        currentIndex = terminatorEndIndex;
        continue;
      }
    }

    currentIndex++;
  }

  // Handle trailing text without terminal punctuation
  if (currentSentenceStart !== -1 && currentSentenceStart < textLength) {
    const sentenceRaw = originalText.slice(currentSentenceStart);
    if (sentenceRaw.trim().length > 0) {
      sentences.push(
        createSentenceToken(
          sentences.length.toString(),
          sentenceRaw,
          currentSentenceStart,
          textLength,
          paragraphIndex,
          sentenceIndexInParagraph
        )
      );
    }
  }

  return sentences;
}

/**
 * Creates a SentenceToken with linguistic metadata.
 */
function createSentenceToken(
  id: string,
  rawText: string,
  startIndex: number,
  endIndex: number,
  paragraphIndex: number,
  sentenceIndexInParagraph: number
): SentenceToken {
  // Extract words
  const words = extractWords(rawText);
  let syllableCount = 0;
  let polysyllabicWordCount = 0;
  let longWordCount = 0;

  for (const word of words) {
    const syl = countSyllablesInWord(word);
    syllableCount += syl;
    if (isPolysyllabic(word)) polysyllabicWordCount++;
    const clean = word.replace(/[^a-zA-Z]/g, '');
    if (clean.length >= 10) longWordCount++;
  }

  // Count punctuation signals
  const semicolons = (rawText.match(/;/g) || []).length;
  const emDashes = (rawText.match(/—|--/g) || []).length;
  const colons = (rawText.match(/:/g) || []).length;
  const parens = (rawText.match(/\([^)]*\)/g) || []).length;
  const commas = (rawText.match(/,/g) || []).length;

  return {
    id,
    text: rawText,
    startIndex,
    endIndex,
    paragraphIndex,
    sentenceIndexInParagraph,
    wordCount: words.length,
    syllableCount,
    polysyllabicWordCount,
    longWordCount,
    complexPunctuationCount: semicolons + emDashes + colons + parens,
    commaCount: commas,
  };
}

/**
 * Extracts clean word tokens from text.
 * Handles hyphenated words and contractions.
 */
export function extractWords(text: string): string[] {
  if (!text) return [];
  // Match word characters, including internal hyphens and apostrophes
  const matches = text.match(/[A-Za-z0-9]+(?:['’\-][A-Za-z0-9]+)*/g);
  return matches ? matches.filter((w) => /[A-Za-z]/.test(w)) : [];
}
