import { describe, it, expect } from 'vitest';
import { analyzeChapter } from '../lib/linguistics/analyzer';
import { segmentText } from '../lib/linguistics/segmenter';
import { countSyllablesInWord } from '../lib/linguistics/syllables';
import { buildTextSegments } from '../lib/linguistics/highlighter';

describe('Comprehensive Edge Cases Suite (18 Scenarios)', () => {
  // Case 1: Empty input
  it('Case 1: Empty input', () => {
    const res = analyzeChapter('');
    expect(res.totalWords).toBe(0);
    expect(res.totalSentences).toBe(0);
    expect(res.difficultSentences).toHaveLength(0);
    expect(res.isStatisticallyReliable).toBe(false);
  });

  // Case 2: Whitespace-only input
  it('Case 2: Whitespace-only input', () => {
    const res = analyzeChapter('   \n\t  \r\n   ');
    expect(res.totalWords).toBe(0);
    expect(res.totalSentences).toBe(0);
    expect(res.difficultSentences).toHaveLength(0);
  });

  // Case 3: One short sentence
  it('Case 3: One short sentence', () => {
    const res = analyzeChapter('The sun rose.');
    expect(res.totalSentences).toBe(1);
    expect(res.totalWords).toBe(3);
    expect(res.isStatisticallyReliable).toBe(false);
    expect(res.reliabilityNotice).toContain('Short sample warning');
    expect(res.difficultSentences).toHaveLength(1);
  });

  // Case 4: Fewer than five sentences
  it('Case 4: Fewer than five sentences (e.g., 3)', () => {
    const text = 'The clockmaker examined the delicate balance wheel with extreme precision and focus. Meanwhile the young apprentice carefully arranged seventeen replacement gear assemblies across the cedar workbench. Finally the master adjusted the escapement spring and noted that the mechanism was functioning properly.';
    const res = analyzeChapter(text);
    expect(res.totalSentences).toBe(3);
    expect(res.difficultSentences).toHaveLength(3);
    expect(res.reliabilityNotice).toContain('Sample contains only 3 sentence(s)');
  });

  // Case 5: Exactly five sentences
  it('Case 5: Exactly five sentences', () => {
    const text = 'One sentence here. Two sentences here. Three sentences here. Four sentences here. Five sentences here.';
    const res = analyzeChapter(text);
    expect(res.totalSentences).toBe(5);
    expect(res.difficultSentences).toHaveLength(5);
  });

  // Case 6: More than five sentences
  it('Case 6: More than five sentences (limits to top 5 hardest)', () => {
    const text = 'Sentence 1. Sentence 2. Sentence 3. Sentence 4. Sentence 5. Sentence 6. Sentence 7. Sentence 8.';
    const res = analyzeChapter(text);
    expect(res.totalSentences).toBe(8);
    expect(res.difficultSentences).toHaveLength(5);
  });

  // Case 7: Repeated identical sentences
  it('Case 7: Repeated identical sentences with independent offsets', () => {
    const text = 'Whispers in the dark echoed. Whispers in the dark echoed.';
    const res = analyzeChapter(text);
    expect(res.totalSentences).toBe(2);
    expect(res.difficultSentences[0].startIndex).not.toBe(res.difficultSentences[1].startIndex);
  });

  // Case 8: Abbreviations such as "Dr." and "e.g."
  it('Case 8: Abbreviations such as Dr. and e.g.', () => {
    const text = 'Dr. Watson consulted e.g. ancient medical texts. The experiment continued.';
    const tokens = segmentText(text);
    expect(tokens).toHaveLength(2);
    expect(tokens[0].text).toContain('Dr. Watson consulted e.g.');
  });

  // Case 9: Quoted dialogue
  it('Case 9: Quoted dialogue with question and exclamation marks', () => {
    const text = '"Where did you hide the key?" asked the inspector. "I will never tell you!" she screamed.';
    const tokens = segmentText(text);
    expect(tokens).toHaveLength(2);
    expect(tokens[0].text).toBe('"Where did you hide the key?" asked the inspector.');
    expect(tokens[1].text).toBe('"I will never tell you!" she screamed.');
  });

  // Case 10: Contractions and possessives
  it('Case 10: Contractions and possessives', () => {
    const text = "The clockmaker's apprentice couldn't believe what he'd discovered.";
    const tokens = segmentText(text);
    expect(tokens).toHaveLength(1);
    expect(tokens[0].wordCount).toBe(8);
  });

  // Case 11: Decimal numbers
  it('Case 11: Decimal numbers', () => {
    const text = 'Pi is approximately 3.14159 in Euclidean geometry. The measurement was 99.9% accurate.';
    const tokens = segmentText(text);
    expect(tokens).toHaveLength(2);
    expect(tokens[0].text).toContain('3.14159');
  });

  // Case 12: Em dashes, semicolons, and parentheses
  it('Case 12: Em dashes, semicolons, and parentheses', () => {
    const text = 'The escapement—an infinitesimal brass wheel; delicately forged (in 1842)—clicked incessantly.';
    const tokens = segmentText(text);
    expect(tokens).toHaveLength(1);
    expect(tokens[0].complexPunctuationCount).toBeGreaterThanOrEqual(3);
  });

  // Case 13: Unusually long words
  it('Case 13: Unusually long words', () => {
    const syl = countSyllablesInWord('antidisestablishmentarianism');
    expect(syl).toBeGreaterThanOrEqual(10);
  });

  // Case 14: Multiple paragraphs
  it('Case 14: Multiple paragraphs', () => {
    const text = 'Paragraph one begins.\n\nParagraph two continues.\n\nParagraph three finishes.';
    const res = analyzeChapter(text);
    expect(res.totalParagraphs).toBe(3);
    expect(res.totalSentences).toBe(3);
  });

  // Case 15: Unicode punctuation and accented characters
  it('Case 15: Unicode punctuation and accented characters', () => {
    const text = '“Voilà!” she exclaimed with naïve joy. The café door swung open.';
    const tokens = segmentText(text);
    expect(tokens).toHaveLength(2);
    expect(tokens[0].text).toContain('“Voilà!”');
  });

  // Case 16: Very long chapters (performance and safety)
  it('Case 16: Large chapter analysis executes swiftly without error', () => {
    const baseSentence = 'The chronometer ticked steadily on the oak desk while the apprentice examined the gears. ';
    const longText = baseSentence.repeat(500); // 500 sentences, ~7,000 words
    const start = performance.now();
    const res = analyzeChapter(longText);
    const duration = performance.now() - start;

    expect(res.totalSentences).toBe(500);
    expect(res.totalWords).toBeGreaterThan(6500);
    expect(duration).toBeLessThan(1000); // Under 1 second
  });

  // Case 17: Text containing no normal sentence-ending punctuation
  it('Case 17: Text containing no normal sentence-ending punctuation', () => {
    const text = 'A continuous stream of prose without terminal periods commas dashes or interrogation marks anywhere in sight';
    const tokens = segmentText(text);
    expect(tokens).toHaveLength(1);
    expect(tokens[0].wordCount).toBe(16);
  });

  // Case 18: Extremely short fragments
  it('Case 18: Extremely short fragments', () => {
    const text = 'Wait! No? Yes.';
    const tokens = segmentText(text);
    expect(tokens).toHaveLength(3);
    expect(tokens[0].text).toBe('Wait!');
    expect(tokens[1].text).toBe('No?');
    expect(tokens[2].text).toBe('Yes.');
  });
});
