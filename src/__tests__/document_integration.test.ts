import { describe, it, expect } from 'vitest';
import {
  validateFile,
  detectFormat,
  extractDocument,
  MAX_FILE_SIZE_BYTES,
} from '../lib/document/documentService';
import { findBlockForOffset, enrichAnalysisWithDocument } from '../lib/document/locator';
import { analyzeChapter } from '../lib/linguistics/analyzer';
import { buildTextSegments } from '../lib/linguistics/highlighter';
import { createDocumentFromPastedText } from '../lib/document/extractors/pastedExtractor';
import { createMockDocx, createMockPdf } from './fixtures/documentFixtures';
import { DocumentValidationError, ExtractedBlock, ExtractedDocument } from '../lib/document/types';

describe('Document Integration & Pipeline', () => {
  describe('File Validation', () => {
    it('detects formats accurately from extension or MIME type', () => {
      expect(detectFormat('chapter1.pdf')).toBe('pdf');
      expect(detectFormat('document.docx')).toBe('docx');
      expect(detectFormat('notes.txt')).toBe('txt');
      expect(detectFormat('file.PDF')).toBe('pdf');
      expect(detectFormat('file.DOCX')).toBe('docx');
      expect(detectFormat('unknown.xyz', 'application/pdf')).toBe('pdf');
      expect(detectFormat('notes', 'text/plain')).toBe('txt');
      expect(detectFormat('archive.zip')).toBeNull();
      expect(detectFormat('document.pages')).toBeNull();
    });

    it('rejects unsupported file formats with helpful guidance', () => {
      const unsupported = { name: 'essay.pages', size: 1024, type: 'application/x-iwork-pages' };
      expect(() => validateFile(unsupported)).toThrow(DocumentValidationError);

      try {
        validateFile(unsupported);
      } catch (err: any) {
        expect(err.code).toBe('UNSUPPORTED_TYPE');
        expect(err.message).toContain('.pages');
        expect(err.recoveryGuidance).toContain('supports PDF');
      }
    });

    it('rejects 0-byte empty files', () => {
      const emptyFile = { name: 'empty.docx', size: 0 };
      expect(() => validateFile(emptyFile)).toThrow(DocumentValidationError);
      try {
        validateFile(emptyFile);
      } catch (err: any) {
        expect(err.code).toBe('EMPTY_FILE');
      }
    });

    it('rejects files exceeding the 25 MB size limit', () => {
      const oversized = { name: 'huge.pdf', size: MAX_FILE_SIZE_BYTES + 1024 };
      expect(() => validateFile(oversized)).toThrow(DocumentValidationError);
      try {
        validateFile(oversized);
      } catch (err: any) {
        expect(err.code).toBe('SIZE_LIMIT_EXCEEDED');
      }
    });
  });

  describe('Downstream Analysis & Source Location Enrichment', () => {
    it('enriches analysis with page numbers from an imported PDF', async () => {
      const page1Text =
        'The philosophical implications of artificial intelligence continue to fascinate scholars across disciplines. Cognitive architecture remains fundamentally mysterious.';
      const page2Text =
        'Nevertheless, the unyielding mathematical formalization of probabilistic gradient descent defies trivial intuitive simplifications. Every researcher must contemplate this dichotomy.';

      const pdfBytes = createMockPdf([page1Text, page2Text]);
      const doc = await extractDocument(
        new File([pdfBytes.buffer as ArrayBuffer], 'research_paper.pdf', { type: 'application/pdf' })
      );

      expect(doc.format).toBe('pdf');
      expect(doc.pageCount).toBe(2);

      // Run existing core analysis engine on extracted text
      const rawAnalysis = analyzeChapter(doc.fullText);
      expect(rawAnalysis.totalWords).toBeGreaterThan(20);
      expect(rawAnalysis.difficultSentences.length).toBeGreaterThan(0);

      // Enrich with document locations
      const enriched = enrichAnalysisWithDocument(rawAnalysis, doc);

      expect(enriched.sourceDocument?.fileName).toBe('research_paper.pdf');
      expect(enriched.sourceDocument?.pageCount).toBe(2);

      // Verify that every difficult sentence received its correct pageNumber
      for (const sentence of enriched.difficultSentences) {
        expect(sentence.sourceLocation).toBeDefined();
        expect(sentence.sourceLocation?.pageNumber).toBeGreaterThanOrEqual(1);
        expect(sentence.sourceLocation?.pageNumber).toBeLessThanOrEqual(2);
      }

      // Verify highlighting offsets remain 100% exact
      const segments = buildTextSegments(doc.fullText, enriched.difficultSentences);
      for (const segment of segments) {
        if (segment.isDifficult && segment.difficultSentence) {
          const expectedSlice = doc.fullText.slice(
            segment.difficultSentence.startIndex,
            segment.difficultSentence.endIndex
          );
          expect(segment.text).toBe(expectedSlice);
        }
      }
    });

    it('enriches analysis with section headings from an imported DOCX', async () => {
      const docxBuffer = await createMockDocx([
        { type: 'heading', level: 1, text: 'Introduction and Scope' },
        {
          type: 'p',
          text: 'The foundational premise of our investigation relies upon empirical observations collected over several decades.',
        },
        { type: 'heading', level: 2, text: 'Detailed Methodology' },
        {
          type: 'p',
          text: 'Superficial epistemological categorization frequently obfuscates underlying ontological complexities that require rigorous multidimensional mathematical formulation.',
        },
      ]);

      const doc = await extractDocument(
        new File([docxBuffer], 'study.docx', {
          type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        })
      );

      expect(doc.format).toBe('docx');
      expect(doc.hasHeadings).toBe(true);

      const rawAnalysis = analyzeChapter(doc.fullText);
      const enriched = enrichAnalysisWithDocument(rawAnalysis, doc);

      // Find the complex sentence in the Methodology section
      const hardSentence = enriched.difficultSentences.find((s) =>
        s.text.includes('Superficial epistemological categorization')
      );

      expect(hardSentence).toBeDefined();
      expect(hardSentence?.sourceLocation?.sectionHeading).toBe('Detailed Methodology');
      expect(hardSentence?.sourceLocation?.sectionLevel).toBe(2);
    });

    it('handles repeated identical sentences with distinct offsets and source locations', () => {
      const repeatedSentence = 'History often repeats itself in unexpected ways.';
      const fullText = `Chapter 1: The Beginning\n\n${repeatedSentence}\n\nChapter 2: The Echo\n\n${repeatedSentence}`;

      const blocks: ExtractedBlock[] = [
        {
          id: 'b1',
          type: 'heading',
          text: 'Chapter 1: The Beginning',
          startIndex: 0,
          endIndex: 24,
          paragraphIndex: 0,
          sectionHeading: 'Chapter 1: The Beginning',
        },
        {
          id: 'b2',
          type: 'paragraph',
          text: repeatedSentence,
          startIndex: 26,
          endIndex: 26 + repeatedSentence.length,
          paragraphIndex: 1,
          sectionHeading: 'Chapter 1: The Beginning',
        },
        {
          id: 'b3',
          type: 'heading',
          text: 'Chapter 2: The Echo',
          startIndex: 76,
          endIndex: 95,
          paragraphIndex: 2,
          sectionHeading: 'Chapter 2: The Echo',
        },
        {
          id: 'b4',
          type: 'paragraph',
          text: repeatedSentence,
          startIndex: 97,
          endIndex: 97 + repeatedSentence.length,
          paragraphIndex: 3,
          sectionHeading: 'Chapter 2: The Echo',
        },
      ];

      const doc: ExtractedDocument = {
        id: 'doc-rep',
        fileName: 'repeats.txt',
        fileSize: fullText.length,
        format: 'txt',
        extractedAt: new Date().toISOString(),
        fullText,
        blocks,
        hasHeadings: true,
        warnings: [],
      };

      const blockFirst = findBlockForOffset(doc.blocks, 28);
      const blockSecond = findBlockForOffset(doc.blocks, 99);

      expect(blockFirst?.sectionHeading).toBe('Chapter 1: The Beginning');
      expect(blockSecond?.sectionHeading).toBe('Chapter 2: The Echo');
      expect(blockFirst?.startIndex).not.toBe(blockSecond?.startIndex);
    });
  });

  describe('Regression: Paste and Analyze Compatibility', () => {
    it('maintains identical readability score for pasted text', () => {
      const sampleText =
        'The antique clockwork pendulum swung with deliberate mathematical precision. Each oscillation marked another second consumed by eternity.';

      const doc = createDocumentFromPastedText(sampleText);
      const analysisFromDoc = analyzeChapter(doc.fullText);
      const analysisDirect = analyzeChapter(sampleText);

      expect(analysisFromDoc.clampedScore).toBe(analysisDirect.clampedScore);
      expect(analysisFromDoc.totalWords).toBe(analysisDirect.totalWords);
      expect(analysisFromDoc.totalSentences).toBe(analysisDirect.totalSentences);
      expect(analysisFromDoc.difficultSentences.length).toBe(analysisDirect.difficultSentences.length);
    });
  });
});
