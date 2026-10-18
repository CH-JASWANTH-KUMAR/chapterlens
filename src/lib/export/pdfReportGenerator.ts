import { jsPDF } from 'jspdf';
import { AnalysisResult, DifficultSentence } from '../linguistics/types';

export interface PdfReportOptions {
  includeSentenceExcerpts?: boolean;
  includeSuggestedRevisions?: boolean;
  includeMethodologyNote?: boolean;
}

/**
 * Normalizes Unicode characters that commonly occur in typography and academic prose
 * into standard PDF-safe representations to ensure clean, uncorrupted glyph rendering.
 */
export function sanitizePdfText(str: string): string {
  if (!str) return '';
  return str
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/\u2014/g, ' -- ')
    .replace(/–/g, ' - ')
    .replace(/…/g, '...')
    .replace(/[•·]/g, '*')
    .replace(/§/g, 'Section ')
    .replace(/¶/g, 'Paragraph ')
    .replace(/[^\x00-\x7F]/g, (char) => {
      // Map common accented latin characters or fallback to space
      const code = char.charCodeAt(0);
      if (code >= 192 && code <= 255) return char; // Standard Latin-1 supplement
      return ' ';
    })
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Generates a clean, professional, multi-page ChapterLens Analysis Report in PDF format.
 * Includes complete document metrics, readability band interpretation, ranked high-friction
 * sentences, and transparent diagnostics.
 */
export function generatePdfReport(
  analysis: AnalysisResult,
  options: PdfReportOptions = {}
): jsPDF {
  const {
    includeSentenceExcerpts = true,
    includeSuggestedRevisions = true,
    includeMethodologyNote = true,
  } = options;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const marginX = 20;
  const marginY = 20;
  const contentWidth = pageWidth - marginX * 2; // 170 mm
  const maxY = pageHeight - marginY;

  let y = marginY;

  // Helper: check page break
  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > maxY) {
      doc.addPage();
      y = marginY;
    }
  };

  // ==========================================
  // 1. BRAND HEADER & REPORT METADATA
  // ==========================================
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(25, 61, 45); // Emerald/Forest green
  doc.text('ChapterLens', marginX, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(117, 125, 119); // Muted gray
  doc.text('READABILITY & LINGUISTIC CADENCE AUDIT', marginX + 48, y - 1);

  y += 7;
  doc.setDrawColor(205, 201, 186); // Border subtle
  doc.setLineWidth(0.5);
  doc.line(marginX, y, marginX + contentWidth, y);
  y += 6;

  // Document Name & Date Subheader
  const docName = sanitizePdfText(
    analysis.sourceDocument?.fileName || 'Pasted Manuscript / Working Draft'
  );
  const dateFormatted = new Date(analysis.analyzedAt || Date.now()).toLocaleDateString(
    'en-US',
    {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }
  );

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(25, 27, 26);
  doc.text(`Document: ${docName}`, marginX, y);
  y += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  const formatStr = analysis.sourceDocument?.format
    ? `Format: ${analysis.sourceDocument.format.toUpperCase()} | `
    : '';
  const pagesStr = analysis.sourceDocument?.pageCount
    ? `Pages: ${analysis.sourceDocument.pageCount} | `
    : '';
  doc.text(`${formatStr}${pagesStr}Report Generated: ${dateFormatted}`, marginX, y);
  y += 8;

  // ==========================================
  // 2. READABILITY SUMMARY (SCORE & BAND)
  // ==========================================
  checkPageBreak(35);
  doc.setFillColor(245, 244, 238); // Canvas subtle
  doc.roundedRect(marginX, y, contentWidth, 26, 2, 2, 'F');

  // Left column: Score
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.setTextColor(25, 61, 45);
  doc.text(String(analysis.clampedScore), marginX + 6, y + 14);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(115, 126, 119);
  doc.text('/ 100 Flesch Score', marginX + 6, y + 20);

  // Right column: Interpretation
  const band = analysis.band;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(25, 27, 26);
  doc.text(`${band.label} (${band.gradeLevel})`, marginX + 38, y + 9);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(75, 82, 78);
  const summaryLines = doc.splitTextToSize(sanitizePdfText(band.summary), contentWidth - 44);
  doc.text(summaryLines, marginX + 38, y + 15);

  y += 32;

  // ==========================================
  // 3. CORE MANUSCRIPT METRICS TABLE
  // ==========================================
  checkPageBreak(30);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(25, 27, 26);
  doc.text('Core Manuscript Metrics', marginX, y);
  y += 5;

  const colWidth = contentWidth / 4;
  const metricsRow1 = [
    {
      label: 'Analyzed Words',
      value: analysis.totalWords.toLocaleString(),
      subtext: analysis.extractedWordCount
        ? `(${analysis.extractedWordCount.toLocaleString()} extracted tokens)`
        : 'Prose words evaluated',
    },
    {
      label: 'Sentences',
      value: analysis.totalSentences.toLocaleString(),
      subtext: `${analysis.totalParagraphs} Paragraphs`,
    },
    {
      label: 'Avg Words / Sent',
      value: String(analysis.averageWordsPerSentence),
      subtext: 'Target: 14 -- 20',
    },
    {
      label: 'Avg Syllables / Word',
      value: String(analysis.averageSyllablesPerWord),
      subtext: `~${analysis.estimatedReadingTimeMinutes} min read`,
    },
  ];

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(230, 227, 216);

  metricsRow1.forEach((m, idx) => {
    const boxX = marginX + idx * colWidth;
    doc.rect(boxX, y, colWidth - 2, 18);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(115, 126, 119);
    doc.text(m.label, boxX + 3, y + 5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(25, 27, 26);
    doc.text(m.value, boxX + 3, y + 11);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(130, 130, 130);
    doc.text(m.subtext, boxX + 3, y + 15);
  });

  y += 24;

  // Short Sample or Extraction Notice
  if (analysis.reliabilityNotice) {
    checkPageBreak(14);
    doc.setFillColor(254, 243, 199); // Amber alert
    doc.setDrawColor(251, 191, 36);
    doc.roundedRect(marginX, y, contentWidth, 12, 1, 1, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(146, 64, 14);
    doc.text('Note: ', marginX + 3, y + 5);

    doc.setFont('helvetica', 'normal');
    const noticeLines = doc.splitTextToSize(
      sanitizePdfText(analysis.reliabilityNotice),
      contentWidth - 18
    );
    doc.text(noticeLines, marginX + 13, y + 5);
    y += 16;
  }

  // ==========================================
  // 4. RANKED DIFFICULT SENTENCES
  // ==========================================
  const flagged = analysis.difficultSentences || [];
  checkPageBreak(20);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(25, 27, 26);
  doc.text(`Sentences That May Need Attention (${flagged.length} Flagged)`, marginX, y);
  y += 3;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 100, 100);
  doc.text(
    'Ranked by Cognitive Friction Index (sentence length, syllable weight, and structural complexity).',
    marginX,
    y + 3
  );
  y += 7;

  if (flagged.length === 0) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text(
      'No high-friction sentences detected in this chapter. Prose exhibits clear cadence.',
      marginX,
      y + 4
    );
    y += 10;
  } else {
    flagged.forEach((sentence: DifficultSentence) => {
      // Estimate card height
      let cardHeight = 22;
      if (includeSentenceExcerpts) cardHeight += 20;
      if (sentence.editorialTip && includeSuggestedRevisions) cardHeight += 16;
      if (sentence.suggestedRewrite && includeSuggestedRevisions) cardHeight += 16;
      if (sentence.aiRewrite && includeSuggestedRevisions) cardHeight += 16;

      checkPageBreak(Math.min(cardHeight, 60));

      const cardStartY = y;
      doc.setDrawColor(205, 201, 186);
      doc.setFillColor(250, 250, 248);

      // Card Header: Rank & Score
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(25, 61, 45);
      doc.text(`Rank #${sentence.rank} Most Difficult`, marginX + 3, y + 5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      const locText = sentence.sourceLocation
        ? `Location: Page ${sentence.sourceLocation.pageNumber || 1}, Para ${
            sentence.sourceLocation.paragraphIndex + 1
          } | `
        : '';
      doc.text(
        `${locText}Friction Score: ${sentence.difficultyScore}/100 (${sentence.primaryIssue.toUpperCase()})`,
        marginX + 55,
        y + 5
      );

      y += 8;

      // Sentence Excerpt
      if (includeSentenceExcerpts) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(8.5);
        doc.setTextColor(35, 37, 36);
        const excerptLines = doc.splitTextToSize(
          `"${sanitizePdfText(sentence.text)}"`,
          contentWidth - 8
        );
        doc.text(excerptLines, marginX + 4, y);
        y += excerptLines.length * 4.2 + 2;
      }

      // Linguistic Diagnosis
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(80, 85, 82);
      const diagLines = doc.splitTextToSize(
        `Diagnosis: ${sanitizePdfText(sentence.explanation)}`,
        contentWidth - 8
      );
      doc.text(diagLines, marginX + 4, y);
      y += diagLines.length * 3.8 + 2;

      // Authorial Craft Tip & Deterministic Suggestion
      if (includeSuggestedRevisions) {
        if (sentence.editorialTip) {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(7.5);
          doc.setTextColor(25, 61, 45);
          doc.text('Craft Guidance: ', marginX + 4, y);

          doc.setFont('helvetica', 'normal');
          const tipLines = doc.splitTextToSize(
            sanitizePdfText(sentence.editorialTip),
            contentWidth - 30
          );
          doc.text(tipLines, marginX + 27, y);
          y += tipLines.length * 3.6 + 2;
        }

        if (sentence.suggestedRewrite) {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(7.5);
          doc.setTextColor(25, 61, 45);
          doc.text('Rule-Based Suggestion: ', marginX + 4, y);

          doc.setFont('helvetica', 'normal');
          doc.setTextColor(40, 40, 40);
          const sugLines = doc.splitTextToSize(
            `"${sanitizePdfText(sentence.suggestedRewrite)}"`,
            contentWidth - 42
          );
          doc.text(sugLines, marginX + 39, y);
          y += sugLines.length * 3.6 + 2;
        }

        if (sentence.aiRewrite) {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(7.5);
          doc.setTextColor(37, 99, 235); // Blue for genuine AI revisions
          const aiLabel = sentence.aiProvider
            ? `AI Revision (${sanitizePdfText(sentence.aiProvider)}): `
            : 'AI Revision: ';
          doc.text(aiLabel, marginX + 4, y);

          doc.setFont('helvetica', 'normal');
          doc.setTextColor(30, 41, 59);
          const aiLines = doc.splitTextToSize(
            `"${sanitizePdfText(sentence.aiRewrite)}"`,
            contentWidth - 42
          );
          doc.text(aiLines, marginX + 39, y);
          y += aiLines.length * 3.6 + 2;
        }
      }

      // Draw border around sentence box
      const actualCardHeight = y - cardStartY + 2;
      doc.rect(marginX, cardStartY, contentWidth, actualCardHeight);
      y += 5;
    });
  }

  // ==========================================
  // 5. METHODOLOGY & SCORING BOUNDARIES
  // ==========================================
  if (includeMethodologyNote) {
    checkPageBreak(30);
    y += 2;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(25, 27, 26);
    doc.text('Methodology & Measurement Limitations', marginX, y);
    y += 4;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(110, 110, 110);
    const methodText =
      'The Flesch Reading Ease score is calculated using standard American English phoneme counts and syllable estimation rules. In research manuscripts containing specialized Latinate nomenclature, equations, or formal citations, high friction scores reflect cognitive processing load on human working memory rather than defects in scholarship. ChapterLens analyzes all documents locally in your browser to maintain strict privacy.';
    const methodLines = doc.splitTextToSize(methodText, contentWidth);
    doc.text(methodLines, marginX, y);
    y += methodLines.length * 3.5 + 4;
  }

  // ==========================================
  // 6. FOOTER WITH PAGE NUMBERS ("Page X of Y")
  // ==========================================
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(140, 140, 140);

    // Bottom footer line
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.3);
    doc.line(marginX, 287, marginX + contentWidth, 287);

    doc.text(
      `ChapterLens  *  Readability & Cadence Report  *  Page ${p} of ${totalPages}`,
      pageWidth / 2,
      292,
      { align: 'center' }
    );
  }

  return doc;
}

/**
 * Generates and triggers browser download of the PDF report.
 * Sanitizes filename to prevent invalid filesystem characters.
 */
export function downloadPdfReport(
  analysis: AnalysisResult,
  options: PdfReportOptions = {}
): { fileName: string; sizeBytes: number } {
  const doc = generatePdfReport(analysis, options);

  const rawName = analysis.sourceDocument?.fileName || 'manuscript';
  const cleanBaseName = rawName
    .replace(/\.[^/.]+$/, '') // Strip extension
    .replace(/[^a-zA-Z0-9_\-]/g, '_')
    .slice(0, 40);

  const dateStr = new Date().toISOString().slice(0, 10);
  const fileName = `chapterlens-report-${cleanBaseName}-${dateStr}.pdf`;

  doc.save(fileName);

  // Return generated file info
  const pdfOutput = doc.output('arraybuffer');
  return {
    fileName,
    sizeBytes: pdfOutput.byteLength,
  };
}
