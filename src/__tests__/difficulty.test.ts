import { describe, it, expect } from 'vitest';
import { segmentText } from '../lib/linguistics/segmenter';
import { identifyHardestSentences, scoreSentenceDifficulty } from '../lib/linguistics/difficulty';

describe('Difficulty Ranking & Multi-Signal Heuristic', () => {
  it('correctly scores complex sentence higher than simple declarative sentence', () => {
    const simple = segmentText('The cat sat on the mat.')[0];
    const complex = segmentText(
      'Although the expeditionary team postulated that subterranean geothermal conduits might generate localized magnetohydrodynamic turbulence, empirical telemetry remained inconclusive.'
    )[0];

    const simpleScore = scoreSentenceDifficulty(simple);
    const complexScore = scoreSentenceDifficulty(complex);

    expect(complexScore.score).toBeGreaterThan(simpleScore.score);
    expect(complexScore.signals.polysyllabicWordCount).toBeGreaterThan(2);
    expect(complexScore.primaryIssue).toBeDefined();
  });

  it('limits results to at most five sentences even with many candidates', () => {
    const text = `
      Sentence one is quite simple.
      Sentence two is also simple.
      Sentence three contains slightly more elaborate mechanical exposition regarding kinematics.
      Sentence four is another short phrase.
      Sentence five introduces additional polysyllabic terminology and subterranean anomalies.
      Sentence six is plain.
      Sentence seven is straightforward.
    `;
    const tokens = segmentText(text);
    const topSentences = identifyHardestSentences(tokens, 5);

    expect(topSentences.length).toBe(5);
    expect(topSentences[0].rank).toBe(1);
    expect(topSentences[4].rank).toBe(5);
    // Verified descending order of score
    expect(topSentences[0].difficultyScore).toBeGreaterThanOrEqual(topSentences[1].difficultyScore);
  });

  it('gracefully handles text with fewer than five sentences', () => {
    const text = 'The first sentence is short. The second sentence is slightly more elaborate with descriptive language.';
    const tokens = segmentText(text);
    const topSentences = identifyHardestSentences(tokens, 5);

    expect(topSentences).toHaveLength(2);
    expect(topSentences[0].rank).toBe(1);
    expect(topSentences[1].rank).toBe(2);
  });

  it('uses deterministic tie-breaking for sentences with equal score', () => {
    // Two identical sentences in different places
    const text = 'The delicate clockwork clicked softly. The delicate clockwork clicked softly.';
    const tokens = segmentText(text);
    const topSentences = identifyHardestSentences(tokens, 5);

    expect(topSentences).toHaveLength(2);
    // Earlier occurrence ranks first as tie-breaker
    expect(topSentences[0].startIndex).toBeLessThan(topSentences[1].startIndex);
    expect(topSentences[0].rank).toBe(1);
    expect(topSentences[1].rank).toBe(2);
  });

  it('generates deterministic suggested rewrites for semicolon pivot sentences', () => {
    const text = 'The escapement arbor had a fracture; an imperceptible flaw would cause the assembly to seize.';
    const tokens = segmentText(text);
    const hardest = identifyHardestSentences(tokens, 1);

    expect(hardest).toHaveLength(1);
    expect(hardest[0].editorialTip).toBeDefined();
    expect(hardest[0].suggestedRewrite).toBeDefined();
    expect(hardest[0].suggestedRewrite).toContain('.');
    expect(hardest[0].editorialTip).toContain('Split at the semicolon');
  });

  it('generates deterministic vocabulary substitutions for dense academic words', () => {
    const text = 'The team commenced subterranean exploration to utilize new sensors.';
    const tokens = segmentText(text);
    const hardest = identifyHardestSentences(tokens, 1);

    expect(hardest[0].suggestedRewrite).toBeDefined();
    expect(hardest[0].suggestedRewrite).toContain('underground');
    expect(hardest[0].suggestedRewrite).toContain('use');
  });
});
