import { describe, it, expect } from 'vitest';
import { segmentText } from '../lib/linguistics/segmenter';
import { identifyHardestSentences } from '../lib/linguistics/difficulty';
import { buildTextSegments } from '../lib/linguistics/highlighter';

describe('Inline Highlighter & Non-destructive Offset Engine', () => {
  it('guarantees 100% exact character-for-character reconstruction of original text', () => {
    const original = `The rain had slackened by dusk.

"Hold the loupe steady, Elian," the old man murmured.
Although he had spent four arduous winters memorizing the kinematics of celestial chronometers, his pulse quickened.

A solitary final sentence.`;

    const tokens = segmentText(original);
    const hardest = identifyHardestSentences(tokens, 2);
    const segments = buildTextSegments(original, hardest);

    const reconstructed = segments.map((s) => s.text).join('');
    expect(reconstructed).toBe(original);
  });

  it('correctly handles repeated identical sentences without collisions or string replacement errors', () => {
    // Two identical complex sentences separated by a simple brief sentence
    const original = 'Although she whispered in the dark about kinematics, nobody heard. She ran. Although she whispered in the dark about kinematics, nobody heard.';
    const tokens = segmentText(original);
    // Both occurrences will be recognized
    const hardest = identifyHardestSentences(tokens, 2);

    expect(tokens[0].text).toBe('Although she whispered in the dark about kinematics, nobody heard.');
    expect(tokens[2].text).toBe('Although she whispered in the dark about kinematics, nobody heard.');
    expect(tokens[0].startIndex).not.toBe(tokens[2].startIndex);

    const segments = buildTextSegments(original, hardest);
    const reconstructed = segments.map((s) => s.text).join('');
    expect(reconstructed).toBe(original);

    // Filter segments that are difficult
    const diffSegments = segments.filter((s) => s.isDifficult);
    expect(diffSegments.length).toBe(2);
    expect(diffSegments[0].startIndex).toBe(tokens[0].startIndex);
    expect(diffSegments[1].startIndex).toBe(tokens[2].startIndex);
  });

  it('returns single unhighlighted segment when difficultSentences list is empty', () => {
    const text = 'Simple sentence.';
    const segments = buildTextSegments(text, []);
    expect(segments).toHaveLength(1);
    expect(segments[0].text).toBe(text);
    expect(segments[0].isDifficult).toBe(false);
  });
});
