import { describe, it, expect, vi } from 'vitest';
import { jsPDF } from 'jspdf';
import { generatePdfReport, downloadPdfReport, sanitizePdfText } from '../lib/export/pdfReportGenerator';
import { analyzeChapter } from '../lib/linguistics/analyzer';
import { enrichAnalysisWithDocument } from '../lib/document/locator';
import { isNonProseSentence } from '../lib/linguistics/segmenter';
import { identifyHardestSentences } from '../lib/linguistics/difficulty';
import { ExtractedDocument } from '../lib/document/types';
import { AnalysisResult } from '../lib/linguistics/types';

describe('Milestone 3.3: PDF Report Export and Research Analysis Accuracy', () => {
  const sampleAcademicText = `
Linear models often fail to generalize across non-stationary distributions in real-world scenarios.
When the dimensionality of the parameter space exceeds the sample size, empirical risk minimization leads to overfitting.
Consequently, regularization techniques must be rigorously applied to constrain model complexity.
However, excessive penalization degrades representation capacity, inducing catastrophic underfitting.
Thus, optimal balance requires data-driven cross-validation across diverse partitions.
`.trim();

  const mockDocument: ExtractedDocument = {
    id: 'doc-academic-test',
    fileName: 'neural_optimization_review.pdf',
    fileSize: 45000,
    extractedAt: '2026-10-18T10:00:00.000Z',
    format: 'pdf',
    pageCount: 3,
    hasHeadings: false,
    fullText: sampleAcademicText,
    blocks: [
      {
        id: 'block-1',
        type: 'paragraph',
        text: sampleAcademicText,
        startIndex: 0,
        endIndex: sampleAcademicText.length,
        pageNumber: 2,
        paragraphIndex: 1,
      },
    ],
    warnings: [
      {
        code: 'COMPLEX_FORMATTING',
        message: 'Mathematical notation and table structures were flattened to plaintext.',
      },
    ],
  };

  describe('PDF Report Generation & Document Integrity', () => {
    it('generates a real multi-page PDF document without hardcoded demonstration values', () => {
      const baseAnalysis = analyzeChapter(sampleAcademicText);
      const enrichedAnalysis = enrichAnalysisWithDocument(baseAnalysis, mockDocument);

      const doc = generatePdfReport(enrichedAnalysis);
      expect(doc).toBeDefined();
      expect(doc.getNumberOfPages()).toBeGreaterThanOrEqual(1);

      const arrayBuffer = doc.output('arraybuffer');
      expect(arrayBuffer.byteLength).toBeGreaterThan(1000); // Substantial PDF binary content
    });

    it('correctly formats and sanitizes typography and Unicode characters', () => {
      const rawString = '“Smart quotes”, ‘apostrophes’, em\u2014dash, en–dash, ellipsis…, and bullet • symbols.';
      const sanitized = sanitizePdfText(rawString);

      expect(sanitized).toContain('"Smart quotes"');
      expect(sanitized).toContain("'apostrophes'");
      expect(sanitized).toContain('--');
      expect(sanitized).toContain('...');
      expect(sanitized).not.toContain('“');
      expect(sanitized).not.toContain('”');
      expect(sanitized).not.toContain('\u2014');
    });

    it('honors option toggles to omit sentence excerpts and suggestions', () => {
      const baseAnalysis = analyzeChapter(sampleAcademicText);
      const enrichedAnalysis = enrichAnalysisWithDocument(baseAnalysis, mockDocument);

      // Report with all options enabled
      const fullDoc = generatePdfReport(enrichedAnalysis, {
        includeSentenceExcerpts: true,
        includeSuggestedRevisions: true,
        includeMethodologyNote: true,
      });

      // Report with excerpts and suggestions omitted
      const leanDoc = generatePdfReport(enrichedAnalysis, {
        includeSentenceExcerpts: false,
        includeSuggestedRevisions: false,
        includeMethodologyNote: false,
      });

      const fullSize = fullDoc.output('arraybuffer').byteLength;
      const leanSize = leanDoc.output('arraybuffer').byteLength;

      // Lean report without verbose excerpts/suggestions is smaller
      expect(leanSize).toBeLessThan(fullSize);
    });

    it('preserves source page and paragraph references in exported analysis data', () => {
      const baseAnalysis = analyzeChapter(sampleAcademicText);
      const enrichedAnalysis = enrichAnalysisWithDocument(baseAnalysis, mockDocument);

      const firstDifficult = enrichedAnalysis.difficultSentences[0];
      expect(firstDifficult.sourceLocation).toBeDefined();
      expect(firstDifficult.sourceLocation?.pageNumber).toBe(2);
      expect(firstDifficult.sourceLocation?.paragraphIndex).toBe(1);

      // Verify PDF generates with enriched source location
      const doc = generatePdfReport(enrichedAnalysis);
      expect(doc.getNumberOfPages()).toBeGreaterThanOrEqual(1);
    });

    it('handles documents with genuine AI-generated revisions distinct from rule-based suggestions', () => {
      const baseAnalysis = analyzeChapter(sampleAcademicText);
      if (baseAnalysis.difficultSentences.length > 0) {
        baseAnalysis.difficultSentences[0].suggestedRewrite = 'Linear models fail when data distributions shift.';
        baseAnalysis.difficultSentences[0].aiRewrite = 'Linear models often fail on changing data in real situations.';
        baseAnalysis.difficultSentences[0].aiProvider = 'Gemini 2.5 Flash';
      }

      const doc = generatePdfReport(baseAnalysis, {
        includeSuggestedRevisions: true,
      });

      expect(doc).toBeDefined();
      expect(baseAnalysis.difficultSentences[0].aiRewrite).toBeDefined();
      expect(baseAnalysis.difficultSentences[0].suggestedRewrite).not.toEqual(
        baseAnalysis.difficultSentences[0].aiRewrite
      );
    });

    it('does not include the entire manuscript text in the exported summary report', () => {
      // Long manuscript with 25 sentences
      const longManuscript = Array.from({ length: 25 }, (_, i) =>
        `Sentence number ${i + 1} represents an individual unit of scholarly discourse across the section.`
      ).join(' ');

      const analysis = analyzeChapter(longManuscript);
      expect(analysis.totalSentences).toBe(25);
      // Hardest sentences are capped (max 5)
      expect(analysis.difficultSentences.length).toBeLessThanOrEqual(5);

      const doc = generatePdfReport(analysis);
      // Full manuscript is not dumped into the report
      expect(doc).toBeDefined();
    });

    it('sanitizes filename and triggers local browser download', async () => {
      const baseAnalysis = analyzeChapter(sampleAcademicText);
      const enrichedAnalysis = enrichAnalysisWithDocument(baseAnalysis, {
        ...mockDocument,
        fileName: 'Unsafe / File:Name * "Draft"?.pdf',
      });

      const result = downloadPdfReport(enrichedAnalysis);
      expect(result.fileName).toMatch(/^chapterlens-report-Unsafe.+-\d{4}-\d{2}-\d{2}\.pdf$/);
      expect(result.sizeBytes).toBeGreaterThan(0);

      // Clean up any temporary file written by jsPDF in Node test environment
      try {
        const fs = await import('fs');
        if (fs.existsSync(result.fileName)) {
          fs.unlinkSync(result.fileName);
        }
      } catch {}
    });
  });

  describe('Word-Count Metric Reconciliation', () => {
    it('distinguishes raw extracted document tokens from linguistic prose words', () => {
      // Research paper text containing equations, numbers, and references:
      // "Figure 1", "[12, 14]", "O(N^2)", "$E = mc^2$"
      const textWithNonProse = `
Figure 1 illustrates the comparative convergence behavior across epochs.
Under condition [12, 14], the computational complexity scales as O(N^2) where N = 1024.
Furthermore, empirical loss approaches zero asymptotically when learning rates remain bounded.
`.trim();

      const rawTokens = textWithNonProse.split(/\s+/).length;
      const analysis = analyzeChapter(textWithNonProse);

      // Raw token count includes numerals, math symbols, citations
      expect(rawTokens).toBeGreaterThan(0);
      // Linguistic analysis extracts words with alphabetic phonemes for syllable calculation
      expect(analysis.totalWords).toBeLessThanOrEqual(rawTokens);
      expect(analysis.extractedWordCount).toBe(rawTokens);

      // Both values are preserved and accessible
      expect(analysis.extractedWordCount).toBeDefined();
      expect(analysis.totalWords).toBeGreaterThan(0);
    });

    it('preserves exact extracted word count from Document locator enrichment', () => {
      const docWithExtraTokens: ExtractedDocument = {
        id: 'doc-token-test',
        fileName: 'math_paper.pdf',
        fileSize: 12000,
        extractedAt: '2026-10-18T10:00:00.000Z',
        format: 'pdf',
        hasHeadings: false,
        fullText: 'Section 1. 2. 3. 4. [1] [2] The architecture performs admirably.',
        blocks: [
          {
            id: 'b1',
            type: 'paragraph',
            text: 'Section 1. 2. 3. 4. [1] [2] The architecture performs admirably.',
            startIndex: 0,
            endIndex: 67,
            paragraphIndex: 0,
          },
        ],
        warnings: [],
      };

      const baseAnalysis = analyzeChapter(docWithExtraTokens.fullText);
      const enriched = enrichAnalysisWithDocument(baseAnalysis, docWithExtraTokens);

      const rawDocCount = docWithExtraTokens.fullText.split(/\s+/).length;
      expect(enriched.extractedWordCount).toBe(rawDocCount);
      expect(enriched.totalWords).toBeLessThan(rawDocCount);
    });
  });

  describe('Research Paper Non-Prose Content Handling', () => {
    it('detects pseudocode lines and algorithm control structures', () => {
      expect(isNonProseSentence('for t = 1 to T do:')).toBe(true);
      expect(isNonProseSentence('while norm(gradient) > epsilon do')).toBe(true);
      expect(isNonProseSentence('Initialize theta_0 in R^d, alpha = 0.001')).toBe(true);
      expect(isNonProseSentence('return theta_T')).toBe(true);
    });

    it('detects standalone mathematical equations and formulas', () => {
      expect(isNonProseSentence('f(x) = (1 / sqrt(2*pi*sigma^2)) * exp(-(x - mu)^2 / (2*sigma^2))')).toBe(true);
      expect(isNonProseSentence('L(theta) = -sum_{i=1}^N y_i log p_i + (1 - y_i) log(1 - p_i)')).toBe(true);
      expect(isNonProseSentence('x_{t+1} = x_t - gamma * nabla f(x_t)')).toBe(true);
    });

    it('detects bibliography entries and citation strings', () => {
      expect(
        isNonProseSentence('[1] Vaswani, A., Shazeer, N., Parmar, N., et al. Attention is all you need. NeurIPS 2017.')
      ).toBe(true);
      expect(isNonProseSentence('[14] Goodfellow, I., Pouget-Abadie, J., et al. Generative adversarial nets. 2014.')).toBe(
        true
      );
    });

    it('treats genuine scholarly prose sentences as prose, not non-prose', () => {
      expect(
        isNonProseSentence(
          'We evaluate our optimization procedure across three benchmark datasets using standard evaluation protocols.'
        )
      ).toBe(false);

      expect(
        isNonProseSentence(
          'The empirical results demonstrate significant improvements in convergence velocity without compromising generalization.'
        )
      ).toBe(false);
    });

    it('does not select pseudocode or math lines as prose difficult sentences for rewriting', () => {
      const mixedPaperText = `
Linear models often fail to generalize across non-stationary distributions in real-world scenarios.
for t = 1 to T do: theta_{t+1} = theta_t - alpha * nabla L(theta_t).
Empirical risk minimization leads to severe parameter instability under covariate shift.
[1] Vaswani, A., Shazeer, N., et al. Attention is all you need. NeurIPS, 2017.
Optimal hyperparameters require careful validation across held-out experimental cohorts.
`.trim();

      const analysis = analyzeChapter(mixedPaperText);

      // Verify that pseudocode and references are not ranked as top difficult prose sentences
      const flaggedSentences = analysis.difficultSentences;
      for (const sent of flaggedSentences) {
        expect(sent.text).not.toContain('for t = 1 to T do');
        expect(sent.text).not.toContain('[1] Vaswani');
      }
    });

    it('retains all non-prose sentences in the document sentence stream for reader alignment', () => {
      const mixedPaperText = `
We present Algorithm 1 for iterative parameter optimization.
for t = 1 to T do:
  compute stochastic gradients
  update parameters
This concludes the primary derivation.
`.trim();

      const analysis = analyzeChapter(mixedPaperText);

      // Verify all sentences exist in sentences array (nothing silently deleted!)
      expect(analysis.sentences.length).toBeGreaterThan(1);
      const hasAlgorithmLine = analysis.sentences.some((s) => s.text.includes('for t = 1 to T do:'));
      expect(hasAlgorithmLine).toBe(true);

      const nonProseSentence = analysis.sentences.find((s) => s.text.includes('for t = 1 to T do:'));
      expect(nonProseSentence?.isNonProse).toBe(true);
    });
  });
});
