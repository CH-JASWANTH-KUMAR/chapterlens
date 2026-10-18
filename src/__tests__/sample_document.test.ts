import { describe, it, expect } from 'vitest';
import { getSampleResearchDocument, SAMPLE_DOCUMENT_TITLE } from '../lib/document/sampleDocument';
import { analyzeChapter } from '../lib/linguistics/analyzer';
import { enrichAnalysisWithDocument } from '../lib/document/locator';
import { extractPassageContext } from '../lib/reading/contextExtractor';
import { ExtractedDocument } from '../lib/document/types';

describe('Sample Research Document & FTUX Integration', () => {
  it('generates a structurally valid sample document adhering to ExtractedDocument', () => {
    const doc = getSampleResearchDocument();

    expect(doc.id).toBe('sample-doc-research-illustrative');
    expect(doc.fileName).toBe(SAMPLE_DOCUMENT_TITLE);
    expect(doc.isSample).toBe(true);
    expect(doc.format).toBe('txt');
    expect(doc.hasHeadings).toBe(true);
    expect(doc.pageCount).toBe(1);
    expect(doc.warnings).toHaveLength(0);
    expect(doc.fullText.length).toBeGreaterThan(500);
    expect(doc.blocks.length).toBeGreaterThanOrEqual(8);
  });

  it('guarantees exact character slice alignment for all blocks in the sample document', () => {
    const doc = getSampleResearchDocument();

    for (const block of doc.blocks) {
      expect(block.startIndex).toBeGreaterThanOrEqual(0);
      expect(block.endIndex).toBeGreaterThan(block.startIndex);
      const sliced = doc.fullText.slice(block.startIndex, block.endIndex);
      expect(sliced).toBe(block.text);
      expect(block.sectionHeading).toBeDefined();
    }
  });

  it('contains diverse headings including Abstract, Introduction, and Cognitive Architecture', () => {
    const doc = getSampleResearchDocument();
    const headings = doc.blocks.filter((b) => b.type === 'heading');

    expect(headings.length).toBeGreaterThanOrEqual(4);
    const headingTexts = headings.map((h) => h.text);
    expect(headingTexts).toContain('Abstract');
    expect(headingTexts).toContain('1. Introduction & Sequence Transduction');
    expect(headingTexts).toContain('2. Cognitive Architecture & Working Memory Limits');
    expect(headingTexts).toContain('3. Computational Complexity & Quadratic Bottlenecks');
  });

  it('executes through the real mathematical readability pipeline without mocked data', () => {
    const doc = getSampleResearchDocument();

    // Must calculate real Rudolf Flesch score and sentence cadence
    const rawAnalysis = analyzeChapter(doc.fullText);

    expect(rawAnalysis.totalWords).toBeGreaterThan(150);
    expect(rawAnalysis.totalSentences).toBeGreaterThan(5);
    expect(rawAnalysis.clampedScore).toBeGreaterThanOrEqual(0);
    expect(rawAnalysis.clampedScore).toBeLessThanOrEqual(100);
    expect(rawAnalysis.band).toBeDefined();
    expect(rawAnalysis.difficultSentences.length).toBeGreaterThan(0);

    // Enriches with real document structure
    const enriched = enrichAnalysisWithDocument(rawAnalysis, doc);

    expect(enriched.sourceDocument).toBeDefined();
    expect(enriched.sourceDocument?.isSample).toBe(true);

    const firstHard = enriched.difficultSentences[0];
    expect(firstHard).toBeDefined();
    expect(firstHard.sourceLocation).toBeDefined();
    expect(firstHard.sourceLocation?.sectionHeading).toBeDefined();
  });

  it('extracts bounded passage context from the sample document for guided reading', () => {
    const doc = getSampleResearchDocument();
    const rawAnalysis = analyzeChapter(doc.fullText);
    const enriched = enrichAnalysisWithDocument(rawAnalysis, doc);

    const targetSentence = enriched.difficultSentences[0];
    const passage = extractPassageContext(
      doc,
      targetSentence.startIndex,
      targetSentence.endIndex,
      targetSentence.text
    );

    expect(passage.text).toBe(targetSentence.text);
    expect(passage.surroundingContext.length).toBeLessThanOrEqual(1200);
    expect(passage.sourceLocation.sectionHeading).toBeDefined();
    expect(passage.surroundingContext).toContain(targetSentence.text);
  });

  it('simulates replacing sample document with user-uploaded document', () => {
    const sampleDoc = getSampleResearchDocument();
    expect(sampleDoc.isSample).toBe(true);

    // Simulated user document
    const userDoc: ExtractedDocument = {
      id: 'user-doc-custom-1',
      fileName: 'MyCustomManuscript.docx',
      fileSize: 4096,
      format: 'docx',
      extractedAt: new Date().toISOString(),
      fullText: 'This is the user own private manuscript chapter. It explores custom themes.',
      blocks: [
        {
          id: 'b-1',
          type: 'paragraph',
          text: 'This is the user own private manuscript chapter. It explores custom themes.',
          startIndex: 0,
          endIndex: 75,
          paragraphIndex: 0,
        },
      ],
      hasHeadings: false,
      warnings: [],
      isSample: false,
    };

    expect(userDoc.isSample).toBe(false);
    expect(userDoc.fileName).not.toBe(sampleDoc.fileName);

    const userAnalysis = analyzeChapter(userDoc.fullText);
    const enrichedUserAnalysis = enrichAnalysisWithDocument(userAnalysis, userDoc);

    expect(enrichedUserAnalysis.sourceDocument?.isSample).toBe(false);
    expect(enrichedUserAnalysis.sourceDocument?.fileName).toBe('MyCustomManuscript.docx');
  });
});
