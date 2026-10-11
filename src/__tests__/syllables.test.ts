import { describe, it, expect } from 'vitest';
import { countSyllablesInWord, countTotalSyllables, isPolysyllabic, cleanWord } from '../lib/linguistics/syllables';

describe('Deterministic Syllable Counter', () => {
  it('cleans word tokens properly', () => {
    expect(cleanWord('“Hello!”')).toBe('hello');
    expect(cleanWord('...world,')).toBe('world');
    expect(cleanWord("author's")).toBe("author's");
  });

  it('counts single-syllable common words accurately', () => {
    expect(countSyllablesInWord('the')).toBe(1);
    expect(countSyllablesInWord('cat')).toBe(1);
    expect(countSyllablesInWord('jump')).toBe(1);
    expect(countSyllablesInWord('book')).toBe(1);
    expect(countSyllablesInWord('word')).toBe(1);
  });

  it('handles silent final e', () => {
    expect(countSyllablesInWord('rate')).toBe(1);
    expect(countSyllablesInWord('bake')).toBe(1);
    expect(countSyllablesInWord('plane')).toBe(1);
    expect(countSyllablesInWord('time')).toBe(1);
  });

  it('correctly handles -le endings preceded by a consonant', () => {
    expect(countSyllablesInWord('table')).toBe(2);
    expect(countSyllablesInWord('middle')).toBe(2);
    expect(countSyllablesInWord('candle')).toBe(2);
    expect(countSyllablesInWord('simple')).toBe(2);
  });

  it('correctly distinguishes silent -ed from pronounced -ed', () => {
    // Silent -ed
    expect(countSyllablesInWord('walked')).toBe(1);
    expect(countSyllablesInWord('looked')).toBe(1);
    expect(countSyllablesInWord('jumped')).toBe(1);

    // Pronounced -ed (after t or d)
    expect(countSyllablesInWord('wanted')).toBe(2);
    expect(countSyllablesInWord('needed')).toBe(2);
  });

  it('accurately counts irregular exceptions and hiatus', () => {
    expect(countSyllablesInWord('rhythm')).toBe(2);
    expect(countSyllablesInWord('queue')).toBe(1);
    expect(countSyllablesInWord('business')).toBe(2);
    expect(countSyllablesInWord('wednesday')).toBe(2);
    expect(countSyllablesInWord('idea')).toBe(3);
    expect(countSyllablesInWord('area')).toBe(3);
    expect(countSyllablesInWord('quiet')).toBe(2);
    expect(countSyllablesInWord('science')).toBe(2);
    expect(countSyllablesInWord('society')).toBe(4);
    expect(countSyllablesInWord('creation')).toBe(3);
  });

  it('identifies polysyllabic words (>= 3 syllables)', () => {
    expect(isPolysyllabic('cat')).toBe(false);
    expect(isPolysyllabic('simple')).toBe(false);
    expect(isPolysyllabic('computer')).toBe(true);
    expect(isPolysyllabic('inextricable')).toBe(true);
    expect(isPolysyllabic('chronometers')).toBe(true);
  });

  it('counts total syllables across a list of tokens', () => {
    const tokens = ['The', 'delicate', 'clockwork', 'mechanism', 'clicked'];
    // The (1) + delicate (3) + clockwork (2) + mechanism (4) + clicked (1) = 11
    expect(countTotalSyllables(tokens)).toBe(11);
  });
});
