import { describe, it, expect } from 'vitest';
import { calculateFleschScore, getReadabilityBand, calculateReadingTimeMinutes } from '../lib/linguistics/flesch';

describe('Flesch Reading Ease Engine', () => {
  it('calculates the standard Flesch score correctly', () => {
    // Standard test case: 100 words, 5 sentences (20 words/sentence), 150 syllables (1.5 syl/word)
    // Formula: 206.835 - (1.015 * 20) - (84.6 * 1.5) = 206.835 - 20.3 - 126.9 = 59.635
    const { rawScore, clampedScore } = calculateFleschScore(100, 5, 150);
    expect(rawScore).toBeCloseTo(59.64, 1);
    expect(clampedScore).toBe(59.6);
  });

  it('clamps scores between 0 and 100 for display', () => {
    // Extremely difficult (should clamp to 0)
    const difficult = calculateFleschScore(100, 1, 350);
    expect(difficult.clampedScore).toBe(0);
    expect(difficult.rawScore).toBeLessThan(0);

    // Extremely easy (should clamp to 100)
    const veryEasy = calculateFleschScore(50, 25, 50);
    expect(veryEasy.clampedScore).toBe(100);
    expect(veryEasy.rawScore).toBeGreaterThan(100);
  });

  it('handles zero words or zero sentences gracefully', () => {
    const zeroWords = calculateFleschScore(0, 0, 0);
    expect(zeroWords.rawScore).toBe(0);
    expect(zeroWords.clampedScore).toBe(0);

    const zeroSentences = calculateFleschScore(10, 0, 15);
    expect(zeroSentences.clampedScore).toBe(0);
  });

  it('correctly maps scores to readability bands', () => {
    expect(getReadabilityBand(95).label).toBe('Very easy');
    expect(getReadabilityBand(85).label).toBe('Easy');
    expect(getReadabilityBand(75).label).toBe('Fairly easy');
    expect(getReadabilityBand(65).label).toBe('Standard');
    expect(getReadabilityBand(55).label).toBe('Fairly difficult');
    expect(getReadabilityBand(35).label).toBe('Difficult');
    expect(getReadabilityBand(15).label).toBe('Very difficult');
  });

  it('calculates estimated reading time at 220 words per minute', () => {
    expect(calculateReadingTimeMinutes(0)).toBe(0);
    expect(calculateReadingTimeMinutes(110)).toBe(1);
    expect(calculateReadingTimeMinutes(220)).toBe(1);
    expect(calculateReadingTimeMinutes(440)).toBe(2);
    expect(calculateReadingTimeMinutes(1100)).toBe(5);
  });
});
