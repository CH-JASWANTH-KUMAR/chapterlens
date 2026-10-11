import { ReadabilityBand } from './types';

export const READABILITY_BANDS: ReadabilityBand[] = [
  {
    min: 90,
    max: 100,
    label: 'Very easy',
    gradeLevel: '5th grade level',
    targetAudience: 'Easily understood by an average 11-year-old student.',
    color: '#2E7D32', // Forest/emerald
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300',
    summary: 'Fluid and effortless. Ideal for middle-grade fiction, fast-paced dialogue, and mass-market entertainment.',
  },
  {
    min: 80,
    max: 89.9,
    label: 'Easy',
    gradeLevel: '6th grade level',
    targetAudience: 'Conversational English for broad commercial audiences.',
    color: '#388E3C',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    summary: 'Accessible and punchy. Popular standard for contemporary commercial fiction, thrillers, and memoirs.',
  },
  {
    min: 70,
    max: 79.9,
    label: 'Fairly easy',
    gradeLevel: '7th grade level',
    targetAudience: 'General adult fiction and mainstream nonfiction.',
    color: '#4E7E5A',
    badgeClass: 'bg-teal-50 text-teal-800 border-teal-200',
    summary: 'Engaging without friction. Standard for modern narrative nonfiction and character-driven novels.',
  },
  {
    min: 60,
    max: 69.9,
    label: 'Standard',
    gradeLevel: '8th to 9th grade level',
    targetAudience: 'General adult readership (standard literary & journalistic prose).',
    color: '#5C6F84',
    badgeClass: 'bg-slate-100 text-slate-800 border-slate-300',
    summary: 'Balanced prose with varied sentence cadence. Typical of literary magazines, historical fiction, and broadsheet journalism.',
  },
  {
    min: 50,
    max: 59.9,
    label: 'Fairly difficult',
    gradeLevel: '10th to 12th grade level',
    targetAudience: 'High school seniors and college students.',
    color: '#B7791F', // Amber
    badgeClass: 'bg-amber-50 text-amber-900 border-amber-300',
    summary: 'Dense sentence structures or specialized vocabulary. Readers need sustained attention and cognitive effort.',
  },
  {
    min: 30,
    max: 49.9,
    label: 'Difficult',
    gradeLevel: 'College undergraduate level',
    targetAudience: 'Scholarly, formal, or stylistically baroque literature.',
    color: '#C05621', // Dark orange/terracotta
    badgeClass: 'bg-orange-50 text-orange-900 border-orange-300',
    summary: 'Complex clauses, multisyllabic vocabulary, and layered exposition. Common in 19th-century classics and academic essays.',
  },
  {
    min: 0,
    max: 29.9,
    label: 'Very difficult',
    gradeLevel: 'College graduate / specialized academic',
    targetAudience: 'Technical treatises, dense philosophical dissertations, legal briefs.',
    color: '#9B2C2C', // Deep crimson
    badgeClass: 'bg-rose-50 text-rose-900 border-rose-300',
    summary: 'Heavy cognitive friction. Sentences average over 30 words with high polysyllabic density.',
  },
];

/**
 * Calculates raw Flesch Reading Ease score:
 * 206.835 - 1.015 * (totalWords / totalSentences) - 84.6 * (totalSyllables / totalWords)
 */
export function calculateFleschScore(
  totalWords: number,
  totalSentences: number,
  totalSyllables: number
): { rawScore: number; clampedScore: number } {
  if (totalWords === 0 || totalSentences === 0) {
    return { rawScore: 0, clampedScore: 0 };
  }

  const wordsPerSentence = totalWords / totalSentences;
  const syllablesPerWord = totalSyllables / totalWords;

  const rawScore = 206.835 - 1.015 * wordsPerSentence - 84.6 * syllablesPerWord;
  const clampedScore = Math.max(0, Math.min(100, Math.round(rawScore * 10) / 10));

  return {
    rawScore: Math.round(rawScore * 100) / 100,
    clampedScore,
  };
}

/**
 * Maps a score to its corresponding readability band interpretation.
 */
export function getReadabilityBand(score: number): ReadabilityBand {
  for (const band of READABILITY_BANDS) {
    if (score >= band.min && score <= band.max) {
      return band;
    }
  }
  // Fallback for edge clamp
  if (score < 0) return READABILITY_BANDS[READABILITY_BANDS.length - 1];
  return READABILITY_BANDS[0];
}

/**
 * Computes estimated reading time in minutes based on average adult reading speed of 220 wpm.
 */
export function calculateReadingTimeMinutes(totalWords: number): number {
  if (totalWords <= 0) return 0;
  return Math.max(1, Math.ceil(totalWords / 220));
}
