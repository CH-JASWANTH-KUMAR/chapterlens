import { describe, it, expect } from 'vitest';
import { extractFromTxt } from '../lib/document/extractors/txtExtractor';
import { extractFromDocx } from '../lib/document/extractors/docxExtractor';
import { extractFromPdf } from '../lib/document/extractors/pdfExtractor';
import { createDocumentFromPastedText } from '../lib/document/extractors/pastedExtractor';
import { createMockPdf, createBlankPdf, createMockDocx } from './fixtures/documentFixtures';
import { DocumentValidationError } from '../lib/document/types';

describe('Document Extractors', () => {
  describe('TXT Extractor', () => {
    it('extracts paragraphs and normalizes CRLF line endings', async () => {
      const text = 'First paragraph with some text.\r\n\r\nSecond paragraph continues here.\r\n\r\nThird paragraph ends.';
      const doc = await extractFromTxt(text, 'test.txt', text.length);

      expect(doc.format).toBe('txt');
      expect(doc.fileName).toBe('test.txt');
      expect(doc.blocks.length).toBe(3);
      expect(doc.blocks[0].text).toBe('First paragraph with some text.');
      expect(doc.blocks[1].text).toBe('Second paragraph continues here.');
      expect(doc.blocks[2].text).toBe('Third paragraph ends.');

      // Check offset alignment
      expect(doc.fullText.slice(doc.blocks[0].startIndex, doc.blocks[0].endIndex)).toBe(
        'First paragraph with some text.'
      );
      expect(doc.fullText.slice(doc.blocks[1].startIndex, doc.blocks[1].endIndex)).toBe(
        'Second paragraph continues here.'
      );
    });

    it('detects chapter headings in text files', async () => {
      const text = '# Chapter One: The Clockwork Heart\n\nThe pendulum swung with mathematical precision.';
      const doc = await extractFromTxt(text);

      expect(doc.hasHeadings).toBe(true);
      expect(doc.blocks[0].type).toBe('heading');
      expect(doc.blocks[0].text).toBe('Chapter One: The Clockwork Heart');
      expect(doc.blocks[1].type).toBe('paragraph');
    });

    it('rejects empty and whitespace-only text files', async () => {
      await expect(extractFromTxt('')).rejects.toThrow(DocumentValidationError);
      await expect(extractFromTxt('   \n\n\t  ')).rejects.toThrow(DocumentValidationError);
    });
  });

  describe('DOCX Extractor', () => {
    it('extracts real binary DOCX files preserving headings and paragraphs', async () => {
      const docxBuffer = await createMockDocx([
        { type: 'heading', level: 1, text: 'Chapter One: Arrival' },
        {
          type: 'p',
          text: 'The train arrived promptly at midnight amidst a dense autumn fog that smothered the platform.',
        },
        { type: 'heading', level: 2, text: 'Section 1.1: The Station Master' },
        {
          type: 'p',
          text: 'An elderly man with an unlit pipe stood watching the passengers disembark.',
        },
      ]);

      const doc = await extractFromDocx(docxBuffer, 'manuscript.docx');

      expect(doc.format).toBe('docx');
      expect(doc.fileName).toBe('manuscript.docx');
      expect(doc.blocks.length).toBe(4);
      expect(doc.hasHeadings).toBe(true);

      // Verify heading 1
      expect(doc.blocks[0].type).toBe('heading');
      expect(doc.blocks[0].level).toBe(1);
      expect(doc.blocks[0].text).toBe('Chapter One: Arrival');

      // Verify paragraph under heading 1
      expect(doc.blocks[1].type).toBe('paragraph');
      expect(doc.blocks[1].sectionHeading).toBe('Chapter One: Arrival');

      // Verify heading 2
      expect(doc.blocks[2].type).toBe('heading');
      expect(doc.blocks[2].level).toBe(2);
      expect(doc.blocks[2].text).toBe('Section 1.1: The Station Master');

      // Verify paragraph under heading 2
      expect(doc.blocks[3].type).toBe('paragraph');
      expect(doc.blocks[3].sectionHeading).toBe('Section 1.1: The Station Master');

      // Verify verbatim slice offsets
      expect(doc.fullText.slice(doc.blocks[0].startIndex, doc.blocks[0].endIndex)).toBe(
        'Chapter One: Arrival'
      );
      expect(doc.fullText.slice(doc.blocks[1].startIndex, doc.blocks[1].endIndex)).toBe(
        'The train arrived promptly at midnight amidst a dense autumn fog that smothered the platform.'
      );
    });

    it('rejects empty 0-byte DOCX file', async () => {
      const emptyBuffer = new ArrayBuffer(0);
      await expect(extractFromDocx(emptyBuffer)).rejects.toThrow(DocumentValidationError);
    });

    it('rejects corrupted DOCX file with friendly error', async () => {
      const corruptBuffer = new TextEncoder().encode('Not a valid zip or docx file');
      await expect(extractFromDocx(corruptBuffer.buffer)).rejects.toThrow(DocumentValidationError);
    });
  });

  describe('PDF Extractor', () => {
    it('extracts multi-page PDF preserving page numbers and boundaries', async () => {
      const pdfBytes = createMockPdf([
        'This is the first page of the manuscript.',
        'This is the second page of the manuscript with further prose.',
      ]);

      const doc = await extractFromPdf(pdfBytes, 'paper.pdf');

      expect(doc.format).toBe('pdf');
      expect(doc.pageCount).toBe(2);
      expect(doc.blocks.length).toBe(2);

      expect(doc.blocks[0].pageNumber).toBe(1);
      expect(doc.blocks[0].text).toContain('first page');

      expect(doc.blocks[1].pageNumber).toBe(2);
      expect(doc.blocks[1].text).toContain('second page');

      // Verify offset integrity in fullText
      expect(doc.fullText.slice(doc.blocks[0].startIndex, doc.blocks[0].endIndex)).toBe(
        doc.blocks[0].text
      );
      expect(doc.fullText.slice(doc.blocks[1].startIndex, doc.blocks[1].endIndex)).toBe(
        doc.blocks[1].text
      );
    });

    it('warns about scanned/empty pages in a mixed PDF without crashing', async () => {
      const pdfBytes = createMockPdf([
        'Page one has selectable text for analysis.',
        '', // Page two is empty / image
      ]);

      const doc = await extractFromPdf(pdfBytes, 'mixed.pdf');

      expect(doc.pageCount).toBe(2);
      expect(doc.blocks.length).toBe(1);
      expect(doc.warnings.length).toBeGreaterThan(0);
      expect(doc.warnings[0].code).toBe('SCANNED_PAGE_DETECTED');
      expect(doc.warnings[0].pageNumber).toBe(2);
    });

    it('rejects completely blank or scanned PDF with helpful OCR explanation', async () => {
      const blankPdf = createBlankPdf(2);

      await expect(extractFromPdf(blankPdf)).rejects.toThrow(
        /No selectable text could be extracted from this PDF/
      );
    });

    it('rejects empty 0-byte PDF', async () => {
      const emptyBuffer = new Uint8Array(0);
      await expect(extractFromPdf(emptyBuffer)).rejects.toThrow(DocumentValidationError);
    });

    it('rejects corrupted PDF with clear error', async () => {
      const corrupt = new TextEncoder().encode('%PDF-invalid-bytes-garbage');
      await expect(extractFromPdf(corrupt)).rejects.toThrow(DocumentValidationError);
    });

    it('supports cancellation via AbortSignal', async () => {
      const pdfBytes = createMockPdf(['Some long text for cancellation testing']);
      const controller = new AbortController();
      controller.abort(); // Pre-aborted

      await expect(
        extractFromPdf(pdfBytes, 'abort.pdf', pdfBytes.length, undefined, controller.signal)
      ).rejects.toThrow(/cancelled/);
    });
  });

  describe('Pasted Text Document Builder', () => {
    it('creates an ExtractedDocument from pasted text', () => {
      const pasted = 'First paragraph.\n\nSecond paragraph.\n\nThird paragraph.';
      const doc = createDocumentFromPastedText(pasted, 'Draft Excerpt');

      expect(doc.format).toBe('pasted');
      expect(doc.fileName).toBe('Draft Excerpt');
      expect(doc.blocks.length).toBe(3);
      expect(doc.blocks[0].text).toBe('First paragraph.');
      expect(doc.blocks[1].text).toBe('Second paragraph.');
      expect(doc.blocks[2].text).toBe('Third paragraph.');
      expect(doc.fullText).toBe('First paragraph.\n\nSecond paragraph.\n\nThird paragraph.');
    });
  });
});
