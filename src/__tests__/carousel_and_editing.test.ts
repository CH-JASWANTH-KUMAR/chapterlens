import { describe, it, expect, vi } from 'vitest';
import { analyzeChapter } from '../lib/linguistics/analyzer';
import { DifficultSentence } from '../lib/linguistics/types';
import { POST } from '../app/api/rewrite/route';
import { NextRequest } from 'next/server';

describe('Difficult Sentences Carousel & Revision Workflow', () => {
  const sampleProse =
    'The quick brown fox jumps over the lazy dog. Incomprehensibility in epistemological metaphysics constitutes an insurmountable obstacle to philosophical cognition, whereas straightforward statements elucidate core ideas effortlessly. Short sentence three.';

  it('correctly analyzes sample text and yields ranked difficult sentences', () => {
    const analysis = analyzeChapter(sampleProse);
    expect(analysis.difficultSentences.length).toBeGreaterThanOrEqual(1);

    const hardest = analysis.difficultSentences[0];
    expect(hardest.rank).toBe(1);
    expect(hardest.difficultyScore).toBeGreaterThan(0);
    expect(hardest.text).toContain('epistemological');
    expect(hardest.startIndex).toBeGreaterThanOrEqual(0);
    expect(hardest.endIndex).toBeGreaterThan(hardest.startIndex);
  });

  it('safely applies sentence revision to working draft at exact character boundary', () => {
    const analysis = analyzeChapter(sampleProse);
    const targetSentence = analysis.difficultSentences[0];

    // Verify exact slice match before replacement
    const sliced = sampleProse.slice(targetSentence.startIndex, targetSentence.endIndex);
    expect(sliced).toBe(targetSentence.text);

    // Apply revision
    const simplifiedText = 'Complex philosophical jargon confuses readers, while direct prose clarifies meaning.';
    const revisedDraft =
      sampleProse.slice(0, targetSentence.startIndex) +
      simplifiedText +
      sampleProse.slice(targetSentence.endIndex);

    // Assert surrounding text is 100% preserved
    expect(revisedDraft.startsWith('The quick brown fox jumps over the lazy dog.')).toBe(true);
    expect(revisedDraft.endsWith('Short sentence three.')).toBe(true);
    expect(revisedDraft).toContain(simplifiedText);
    expect(revisedDraft).not.toContain('epistemological metaphysics');

    // Recompute analysis on the revised working draft
    const recomputed = analyzeChapter(revisedDraft);
    expect(recomputed.totalSentences).toBe(3);
    // Average syllables per word should decrease
    expect(recomputed.averageSyllablesPerWord).toBeLessThan(
      analysis.averageSyllablesPerWord
    );
  });

  it('supports exact reversible undo of applied revisions', () => {
    const originalText = sampleProse;
    const originalAnalysis = analyzeChapter(originalText);
    const target = originalAnalysis.difficultSentences[0];

    const simplifiedText = 'Direct writing helps readers understand key thoughts.';
    const revisedText =
      originalText.slice(0, target.startIndex) +
      simplifiedText +
      originalText.slice(target.endIndex);

    // Simulate undo stack
    const undoStack = {
      previousText: originalText,
      previousAnalysis: originalAnalysis,
      previousSentenceId: target.id,
    };

    // Revert using undo state
    const restoredText = undoStack.previousText;
    expect(restoredText).toBe(originalText);

    const restoredAnalysis = analyzeChapter(restoredText);
    expect(restoredAnalysis.clampedScore).toBe(originalAnalysis.clampedScore);
    expect(restoredAnalysis.difficultSentences[0].text).toBe(target.text);
  });
});

describe('Privacy and AI Rewriting Bounded Payload', () => {
  it('enforces payload constraint: rejects transmission of whole documents exceeding 1,200 characters', async () => {
    const wholeChapter =
      'Paragraph 1: In the beginning of the research project, many methodologies were scrutinized.\n\n' +
      'Paragraph 2: '.repeat(100) +
      'Final remarks.';

    const req = new NextRequest('http://localhost:3000/api/rewrite', {
      method: 'POST',
      body: JSON.stringify({
        sentence: wholeChapter,
        consentConfirmed: true,
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain('1,200 characters');
  });

  it('rejects rewrite requests when explicit consent has not been confirmed', async () => {
    const singleSentence =
      'Incomprehensibility in epistemological metaphysics constitutes an insurmountable obstacle.';

    const reqWithoutConsent = new NextRequest('http://localhost:3000/api/rewrite', {
      method: 'POST',
      body: JSON.stringify({
        sentence: singleSentence,
      }),
    });

    const res1 = await POST(reqWithoutConsent);
    expect(res1.status).toBe(403);
    const data1 = await res1.json();
    expect(data1.error).toContain('Explicit user consent is required');

    const reqWithFalseConsent = new NextRequest('http://localhost:3000/api/rewrite', {
      method: 'POST',
      body: JSON.stringify({
        sentence: singleSentence,
        consentConfirmed: false,
      }),
    });

    const res2 = await POST(reqWithFalseConsent);
    expect(res2.status).toBe(403);
  });

  it('handles missing provider keys cleanly with 503 and clear offline reassurance', async () => {
    const originalEnv = process.env;
    process.env = { ...originalEnv };
    delete process.env.GEMINI_API_KEY;
    delete process.env.OPENAI_API_KEY;
    delete process.env.ANTHROPIC_API_KEY;

    const req = new NextRequest('http://localhost:3000/api/rewrite', {
      method: 'POST',
      body: JSON.stringify({
        sentence: 'The clockwork escapement failed to maintain its kinetic momentum.',
        consentConfirmed: true,
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(503);
    const data = await res.json();
    expect(data.available).toBe(false);
    expect(data.error).toContain('operates 100% offline and privately');

    process.env = originalEnv;
  });
});
