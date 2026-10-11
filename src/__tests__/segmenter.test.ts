import { describe, it, expect } from 'vitest';
import { segmentText, extractWords } from '../lib/linguistics/segmenter';

describe('Sentence Segmentation & Offset Preservation Engine', () => {
  it('returns empty array for empty or whitespace-only input', () => {
    expect(segmentText('')).toEqual([]);
    expect(segmentText('   \n\t  \r\n   ')).toEqual([]);
  });

  it('correctly segments simple consecutive sentences and preserves exact character slices', () => {
    const text = 'The rain tapped on the roof. The wind howled through the pines.';
    const sentences = segmentText(text);

    expect(sentences).toHaveLength(2);
    expect(sentences[0].text).toBe('The rain tapped on the roof.');
    expect(sentences[1].text).toBe('The wind howled through the pines.');

    // Strict offset check
    expect(text.slice(sentences[0].startIndex, sentences[0].endIndex)).toBe(sentences[0].text);
    expect(text.slice(sentences[1].startIndex, sentences[1].endIndex)).toBe(sentences[1].text);
  });

  it('handles abbreviations without false sentence splits', () => {
    const text = 'Dr. Watson met with Mr. Holmes in London. The case was urgent.';
    const sentences = segmentText(text);

    expect(sentences).toHaveLength(2);
    expect(sentences[0].text).toBe('Dr. Watson met with Mr. Holmes in London.');
    expect(sentences[1].text).toBe('The case was urgent.');
  });

  it('handles decimal numbers without false splits', () => {
    const text = 'The temperature dropped to 3.14 degrees. Marcus shivered.';
    const sentences = segmentText(text);

    expect(sentences).toHaveLength(2);
    expect(sentences[0].text).toBe('The temperature dropped to 3.14 degrees.');
    expect(sentences[1].text).toBe('Marcus shivered.');
  });

  it('handles dialogue quotes and trailing speech attributions', () => {
    const text = '"Hold the loupe steady," the old man murmured. "A single tremor will shear the teeth."';
    const sentences = segmentText(text);

    expect(sentences).toHaveLength(2);
    expect(sentences[0].text).toBe('"Hold the loupe steady," the old man murmured.');
    expect(sentences[1].text).toBe('"A single tremor will shear the teeth."');
  });

  it('handles Windows line endings (\\r\\n) and paragraph boundaries', () => {
    const text = 'First paragraph sentence.\r\n\r\nSecond paragraph sentence.';
    const sentences = segmentText(text);

    expect(sentences).toHaveLength(2);
    expect(sentences[0].paragraphIndex).toBe(0);
    expect(sentences[1].paragraphIndex).toBe(1);
    expect(text.slice(sentences[0].startIndex, sentences[0].endIndex)).toBe(sentences[0].text);
    expect(text.slice(sentences[1].startIndex, sentences[1].endIndex)).toBe(sentences[1].text);
  });

  it('handles text without ending punctuation', () => {
    const text = 'A solitary sentence drifting in the wind without a period';
    const sentences = segmentText(text);

    expect(sentences).toHaveLength(1);
    expect(sentences[0].text).toBe('A solitary sentence drifting in the wind without a period');
    expect(sentences[0].wordCount).toBe(10);
  });

  it('extracts clean words properly', () => {
    const words = extractWords('The clockmaker’s apprentice—eager, yet trembling—held the 17th gear.');
    expect(words).toContain('The');
    expect(words).toContain('clockmaker’s');
    expect(words).toContain('apprentice');
    expect(words).toContain('trembling');
    expect(words).toContain('held');
  });
});
