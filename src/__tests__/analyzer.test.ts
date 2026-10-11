import { describe, it, expect } from 'vitest';
import { analyzeChapter } from '../lib/linguistics/analyzer';
import { SAMPLE_PASSAGES } from '../lib/linguistics/samples';

describe('Chapter Analysis Orchestrator', () => {
  it('handles empty input gracefully', () => {
    const result = analyzeChapter('');
    expect(result.totalWords).toBe(0);
    expect(result.totalSentences).toBe(0);
    expect(result.clampedScore).toBe(0);
    expect(result.isStatisticallyReliable).toBe(false);
  });

  it('flags very short passages as statistically unreliable with clear explanation', () => {
    const shortText = 'The quick brown fox jumps over the lazy dog.';
    const result = analyzeChapter(shortText);

    expect(result.totalWords).toBe(9);
    expect(result.totalSentences).toBe(1);
    expect(result.isStatisticallyReliable).toBe(false);
    expect(result.reliabilityNotice).toContain('Short sample warning');
  });

  it('fully analyzes a multi-paragraph chapter with reliable metrics', () => {
    const sample = SAMPLE_PASSAGES[0].text;
    const result = analyzeChapter(sample);

    expect(result.totalWords).toBeGreaterThan(100);
    expect(result.totalSentences).toBeGreaterThan(5);
    expect(result.totalParagraphs).toBeGreaterThanOrEqual(4);
    expect(result.isStatisticallyReliable).toBe(true);
    expect(result.difficultSentences.length).toBe(5);
    expect(result.clampedScore).toBeGreaterThan(0);
    expect(result.clampedScore).toBeLessThanOrEqual(100);
    expect(result.band).toBeDefined();
    expect(result.estimatedReadingTimeMinutes).toBeGreaterThanOrEqual(1);
  });
});
