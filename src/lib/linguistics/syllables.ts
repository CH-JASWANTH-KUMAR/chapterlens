/**
 * Deterministic Syllable Estimation Module
 * Uses an irregular phonetic dictionary + rule-based morphological decomposition
 * for transparent, reproducible syllable counts.
 */

const SYLLABLE_EXCEPTIONS: Record<string, number> = {
  a: 1,
  the: 1,
  to: 1,
  of: 1,
  and: 1,
  in: 1,
  is: 1,
  it: 1,
  you: 1,
  that: 1,
  he: 1,
  was: 1,
  for: 1,
  on: 1,
  are: 1,
  as: 1,
  with: 1,
  his: 1,
  they: 1,
  at: 1,
  be: 1,
  this: 1,
  from: 1,
  i: 1,
  have: 1,
  or: 1,
  by: 1,
  one: 1,
  had: 1,
  not: 1,
  but: 1,
  what: 1,
  all: 1,
  were: 1,
  we: 1,
  when: 1,
  your: 1,
  can: 1,
  said: 1,
  there: 1,
  use: 1,
  an: 1,
  each: 1,
  which: 1,
  she: 1,
  do: 1,
  how: 1,
  their: 1,
  if: 1,
  will: 1,
  up: 1,
  other: 2,
  about: 2,
  out: 1,
  many: 2,
  then: 1,
  them: 1,
  these: 1,
  so: 1,
  some: 1,
  her: 1,
  would: 1,
  make: 1,
  like: 1,
  him: 1,
  into: 2,
  time: 1,
  has: 1,
  look: 1,
  two: 1,
  more: 1,
  write: 1,
  go: 1,
  see: 1,
  number: 2,
  no: 1,
  way: 1,
  could: 1,
  people: 2,
  my: 1,
  than: 1,
  first: 1,
  water: 2,
  been: 1,
  call: 1,
  who: 1,
  oil: 1,
  its: 1,
  now: 1,
  find: 1,
  long: 1,
  down: 1,
  day: 1,
  did: 1,
  get: 1,
  come: 1,
  made: 1,
  may: 1,
  part: 1,
  // Irregular words that frequently break basic vowel counting
  area: 3,
  idea: 3,
  create: 2,
  creation: 3,
  creative: 3,
  created: 3,
  rhythm: 2,
  rhythms: 2,
  queue: 1,
  queued: 1,
  queuing: 2,
  business: 2,
  wednesday: 2,
  different: 3,
  difference: 3,
  every: 2,
  everything: 3,
  family: 3,
  favorite: 3,
  chocolate: 2,
  comfortable: 4,
  vegetable: 3,
  temperature: 4,
  miniature: 4,
  several: 2,
  special: 2,
  ocean: 2,
  ancient: 2,
  natural: 2,
  separate: 3,
  lonely: 2,
  maybe: 2,
  simple: 2,
  little: 2,
  apple: 2,
  table: 2,
  circle: 2,
  subtle: 2,
  iron: 2,
  poem: 2,
  poems: 2,
  poet: 2,
  poetry: 3,
  chaos: 2,
  oasis: 3,
  naive: 2,
  quiet: 2,
  quietly: 3,
  riot: 2,
  science: 2,
  scientific: 4,
  society: 4,
  variety: 4,
  anxiety: 4,
  giant: 2,
  lion: 2,
  diet: 2,
  fluent: 2,
  cruel: 2,
  ruin: 2,
  ruined: 2,
  fuel: 2,
  real: 1,
  really: 2,
  dial: 2,
  trial: 2,
  dual: 2,
  actual: 3,
  actually: 4,
  casual: 3,
  visual: 3,
  annual: 3,
  manual: 3,
  museum: 3,
  stadium: 3,
  medium: 3,
  vacuum: 3,
  piano: 3,
  radio: 3,
  studio: 3,
  video: 3,
  audio: 3,
  hero: 2,
  zero: 2,
  echo: 2,
  onion: 2,
  opinion: 3,
  million: 2,
  billion: 2,
  trillion: 2,
  alien: 2,
  genius: 2,
  radius: 3,
  curious: 3,
  furious: 3,
  serious: 3,
  various: 3,
  obvious: 3,
  previous: 3,
  precious: 2,
  delicious: 3,
  suspicious: 3,
  ambitious: 3,
  cautious: 2,
  infectious: 3,
  conscience: 2,
  conscious: 2,
  spacious: 2,
  gracious: 2,
  silhouette: 3,
  reservoir: 3,
  bourgeois: 2,
  chauffeur: 2,
  debris: 2,
  colonel: 2,
};

/**
 * Clean a word token for syllable counting:
 * strips leading/trailing non-alpha chars while keeping apostrophes.
 */
export function cleanWord(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/^[^a-z]+|[^a-z]+$/g, '')
    .trim();
}

/**
 * Counts syllables for a single word token.
 * Deterministic, transparent, and handles English orthographic quirks.
 */
export function countSyllablesInWord(word: string): number {
  const clean = cleanWord(word);
  if (!clean) return 0;
  if (clean.length <= 2) return 1;

  // Handle compound hyphenated words (e.g., hair-thin, well-known)
  if (clean.includes('-')) {
    const parts = clean.split('-').filter(Boolean);
    if (parts.length > 1) {
      return parts.reduce((sum, part) => sum + countSyllablesInWord(part), 0);
    }
  }

  // 1. Direct dictionary check
  if (Object.prototype.hasOwnProperty.call(SYLLABLE_EXCEPTIONS, clean)) {
    return SYLLABLE_EXCEPTIONS[clean];
  }

  // 2. Handle compound word split if common prefix/suffix attached
  // Check for common suffixes that are reliably pronounced
  let count = 0;
  let working = clean;

  // Handle words ending in -le preceded by a consonant (table, candle, puddle, middle)
  const leConsonantMatch = working.match(/([bcdfghjklmnpqrstvwxyz])le$/);
  let hasLeConsonant = false;
  if (leConsonantMatch && working.length > 3) {
    hasLeConsonant = true;
    count += 1;
    working = working.slice(0, -2);
  }

  // Count vowel groups
  // English vowels + y
  const vowelMatches = working.match(/[aeiouy]+/g);
  if (vowelMatches) {
    count += vowelMatches.length;
  }

  // Common diphthong / triphthong adjustments:
  // - silent 'e' at end (unless it was already stripped or part of 'ee', 'le')
  if (working.endsWith('e') && !working.endsWith('ee') && !working.endsWith('le') && working.length > 2) {
    // Check if preceded by a single consonant and vowel (rate, note, pine, etc.)
    const prevChar = working[working.length - 2];
    if (prevChar !== 'i' && prevChar !== 'y') {
      count = Math.max(1, count - 1);
    }
  }

  // - silent past tense '-ed' when not preceded by 't' or 'd'
  if (working.endsWith('ed') && working.length > 3) {
    const charBeforeEd = working[working.length - 3];
    if (charBeforeEd !== 't' && charBeforeEd !== 'd') {
      count = Math.max(1, count - 1);
    }
  }

  // - silent '-es' unless preceded by s, z, x, ch, sh, or consonant+c/g (races, pages, churches, boxes)
  if (working.endsWith('es') && working.length > 3 && !working.endsWith('ies')) {
    const stem = working.slice(0, -2);
    if (!/(s|z|x|ch|sh|c|g)$/.test(stem)) {
      count = Math.max(1, count - 1);
    }
  }

  // Hiatus: two vowels that don't make a standard diphthong and are pronounced separately:
  // e.g., 'ia' in trivia, 'io' in radio (if not matched above), 'ua' in status, 'eo' in neon
  const hiatusMatches = working.match(/(ia|eo|uo|iu|ii|ui|ua)/g);
  if (hiatusMatches && !hasLeConsonant) {
    count += hiatusMatches.length;
  }

  // Syllabic consonants: words ending in -sm or -zm (e.g. mechanism, prism, organism, rhythm)
  if (/(sm|zm)$/.test(working)) {
    count += 1;
  }

  return Math.max(1, count);
}

/**
 * Counts total syllables across a list of words.
 */
export function countTotalSyllables(words: string[]): number {
  return words.reduce((acc, word) => acc + countSyllablesInWord(word), 0);
}

/**
 * Checks if a word is polysyllabic (>= 3 syllables).
 */
export function isPolysyllabic(word: string): boolean {
  return countSyllablesInWord(word) >= 3;
}
