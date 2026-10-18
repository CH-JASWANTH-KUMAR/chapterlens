import { SentenceToken } from './types';
import { countSyllablesInWord, isPolysyllabic } from './syllables';

// Known abbreviations that end in a period and should not trigger a sentence break
const COMMON_ABBREVIATIONS = new Set([
  'mr', 'mrs', 'ms', 'dr', 'prof', 'sr', 'jr', 'rev', 'gen', 'col', 'capt', 'lt',
  'sgt', 'gov', 'sen', 'rep', 'pres', 'fr', 'br', 'hon', 'maj', 'cpl', 'pvt', 'adm',
  'cmdr', 'supt', 'insp', 'det', 'st', 'mt', 'etc', 'eg', 'ie', 'vs', 'fig', 'figs',
  'figure', 'figures', 'eq', 'eqs', 'equation', 'equations', 'sec', 'secs', 'section',
  'sections', 'tab', 'tabs', 'table', 'tables', 'ref', 'refs', 'vol', 'vols', 'dept',
  'est', 'approx', 'al', 'cf', 'ca', 'us', 'uk', 'un', 'eu', 'dc', 'ny', 'no', 'nos',
  'pp', 'p', 'ch', 'app', 'univ',
]);

const TITLE_ABBREVIATIONS = new Set([
  'mr', 'mrs', 'ms', 'dr', 'prof', 'rev', 'sr', 'jr', 'st', 'mt', 'col', 'gen',
  'capt', 'lt', 'sgt', 'gov', 'sen', 'rep', 'pres', 'fr', 'br', 'hon', 'maj',
  'cpl', 'pvt', 'adm', 'cmdr', 'supt', 'insp', 'det',
]);

const SCHOLARLY_ABBREVIATIONS = new Set([
  'fig', 'figs', 'figure', 'figures', 'eq', 'eqs', 'equation', 'equations',
  'sec', 'secs', 'section', 'sections', 'tab', 'tabs', 'table', 'tables',
  'ref', 'refs', 'vol', 'vols', 'no', 'nos', 'pp', 'p', 'ch', 'app',
  'al', 'cf', 'approx', 'dept', 'est', 'univ',
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
          const isMultiDotAbbr = /(?:^|\s|\()(?:e\.g|i\.e|vs|cf)$/i.test(textBefore);

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
              // Scholarly abbreviations followed by numbers, brackets, citation years, or lists
              if (SCHOLARLY_ABBREVIATIONS.has(cleanAbbr)) {
                // Followed by digit (Fig. 1, Eq. 2, Sec. 3, p. 15, pp. 20-30, vol. 4, no. 5)
                if (nextChar >= '0' && nextChar <= '9') {
                  currentIndex = terminatorEndIndex;
                  continue;
                }
                // Followed by citation bracket or equation paren: Eq. (1), Ref. [2], et al. (2018), et al. [5]
                if (nextChar === '(' || nextChar === '[') {
                  currentIndex = terminatorEndIndex;
                  continue;
                }
                // Followed by continuation comma or semicolon: (Peters et al., 2018; Kingma et al., 2014)
                if (nextChar === ',' || nextChar === ';') {
                  currentIndex = terminatorEndIndex;
                  continue;
                }
                // Followed by Roman numeral or single uppercase letter: Fig. A, Part I, Vol. IV
                if (/^(?:[IVXLCDM]+|[A-Z])(?:\s|[,.:;)\]]|$)/.test(afterTerminator)) {
                  currentIndex = terminatorEndIndex;
                  continue;
                }
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
        if (remainder.startsWith('\u2014') || remainder.startsWith('--')) {
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
  const emDashes = (rawText.match(/\u2014|--/g) || []).length;
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
    isNonProse: isNonProseSentence(rawText),
  };
}

/**
 * Detects whether a sentence token or passage represents non-prose content,
 * such as mathematical equation lines, pseudocode/code lines, or reference bibliography entries.
 */
export function isNonProseSentence(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return true;

  // 1. Standalone equation or math-dense formula
  // Contains LaTeX wrappers or standalone math delimiters
  if (/^\$\$[\s\S]*\$\$$|^\\\[[\s\S]*\\\]$|^\$[^$]+\$$/.test(trimmed)) return true;

  // Function definition / formula assignment e.g. "f(x) = ...", "L(theta) = ...", "x_{t+1} = ...", "y = mx + b"
  const isEquationAssignment =
    /^[A-Za-z](?:_[A-Za-z0-9{}]+|\([A-Za-z0-9_,\s\\^+\-*/.]+\))?\s*=(?!=)/.test(trimmed);
  if (isEquationAssignment) {
    const hasMathTokens =
      /[+\-*/^_\\^~∑∏√∫∂∇α-ωΑ-Ω]|\b(?:sqrt|exp|log|ln|sin|cos|tan|sum|prod|nabla|sigma|theta|alpha|beta|gamma|lambda|mu|pi|epsilon)\b/i.test(
        trimmed
      );
    const hasCommonProseWords =
      /\b(?:the|is|are|was|were|this|that|with|from|which|because|although)\b/i.test(trimmed);
    if (hasMathTokens && !hasCommonProseWords) {
      return true;
    }
  }

  // General math operator density
  const mathChars = (trimmed.match(/[=+\-*/\\_^{}<>≤≥≈≠±×÷∑∏√∫∂∇α-ωΑ-Ω]/g) || []).length;
  const words = trimmed.match(/[A-Za-z]{2,}/g) || [];
  const mathWords = (
    trimmed.match(
      /\b(?:sqrt|exp|log|ln|sin|cos|tan|det|min|max|argmax|argmin|sum|prod|nabla|sigma|theta|alpha|beta|gamma|lambda|mu|pi|epsilon|omega)\b/gi
    ) || []
  ).length;
  const nonMathWords = words.length - mathWords;
  if (mathChars >= 3 && (mathChars + mathWords * 2) / trimmed.length > 0.12 && nonMathWords <= 4) {
    return true;
  }

  // 2. Pseudocode / Programming statements
  const isCodeOrPseudocode =
    /^(?:Algorithm\s+\d+|Input:|Output:|Require:|Ensure:|Initialize\b|for\s+.*(?:do:?|\{)|while\s+.*(?:do:?|\{)|if\s+.*(?:then:?|\{)|return\b|def\b|class\b|let\b|const\b|var\b|import\b|function\b)/i.test(
      trimmed
    ) ||
    /^(?:for|while|if)\s*\(.*?\)\s*\{?$/i.test(trimmed);
  if (isCodeOrPseudocode) return true;

  // 3. Numbered bibliography / reference entries: e.g. "[1] Vaswani, A., ..." or "1. Kingma, D. P., ..."
  const isReferenceEntry =
    /^\[\d+\]\s+[A-Z]/.test(trimmed) ||
    /^\[[A-Za-z0-9,\s\-]+\]\s+[A-Z]/.test(trimmed) ||
    /^\d+\.\s+[A-Z][a-z]+,\s+[A-Z]\./.test(trimmed);
  if (isReferenceEntry) return true;

  return false;
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
