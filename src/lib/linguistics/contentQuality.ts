import { ExtractedBlock } from '../document/types';

export interface ExtractionQualitySignals {
  multipleCaptions?: boolean;
  axisTicks?: boolean;
  legendLabels?: boolean;
  denseVariables?: boolean;
  interruptedStructure?: boolean;
  spansIncoherentBlocks?: boolean;
}

export interface ExtractionQuality {
  isMixedContent: boolean;
  confidence: 'high' | 'medium' | 'low';
  reasons: string[];
  signals: ExtractionQualitySignals;
  warningMessage?: string;
  suggestedAction?: 'narrow_selection' | 'inspect_source' | 'manual_review';
}

// Common optimizer and algorithm legend labels that appear grouped in ML chart legends
const KNOWN_LEGEND_TOKENS = new Set([
  'adam', 'adagrad', 'rmsprop', 'sgd', 'sfo', 'nesterov', 'momentum',
  'adadelta', 'adamax', 'nadam', 'l-bfgs', 'bfgs', 'natural-gradient',
]);

/**
 * Detects whether a string has multiple distinct figure or table caption declarations.
 * Distinguishes true caption declarations (e.g. "Figure 2: ..." and "Figure 3: ...")
 * from valid prose in-text cross-references (e.g. "As shown in Fig. 1 and Fig. 2, the model...").
 */
function detectMultipleCaptions(text: string): { hasMultiple: boolean; captionLabels: string[] } {
  // Caption declarations typically follow patterns like "Figure 2:", "Figure 2.", "Fig. 2:", "Table 1:"
  const captionDeclarationRegex = /\b(?:Figure|Fig\.?|Table|Chart)\s+(\d+[a-zA-Z]?)\s*[:.]/gi;
  const matches: string[] = [];
  let match: RegExpExecArray | null;

  while ((match = captionDeclarationRegex.exec(text)) !== null) {
    matches.push(match[1]);
  }

  // Also check if text has distinct "Figure X" and "Figure Y" occurrences followed by descriptive text
  const distinctFigures = new Set(matches.map((m) => m.toLowerCase()));
  if (distinctFigures.size >= 2) {
    return { hasMultiple: true, captionLabels: Array.from(distinctFigures) };
  }

  // Check for distinct "Figure 2" and "Figure 3" without punctuation if separated by other text
  const broadFigureRegex = /\b(?:Figure|Fig\.?)\s+(\d+)\b/gi;
  const broadMatches: string[] = [];
  while ((match = broadFigureRegex.exec(text)) !== null) {
    broadMatches.push(match[1]);
  }
  const distinctBroad = Array.from(new Set(broadMatches));
  if (distinctBroad.length >= 2) {
    // Verify it is NOT just a coordination like "Fig. 1 and Fig. 2" or "Figures 1, 2, and 3"
    const isProseCoordination =
      /\b(?:Fig\.?|Figure|Figures|Figs\.?)\s+\d+\s*(?:and|,|\/|-|to)\s*(?:Fig\.?|Figure)?\s*\d+\b/i.test(text);
    if (!isProseCoordination) {
      return { hasMultiple: true, captionLabels: distinctBroad };
    }
  }

  return { hasMultiple: false, captionLabels: [] };
}

/**
 * Detects sequences of isolated numerical axis ticks, e.g. "0 20 40 60 80 100",
 * "10^-1 10^-2 10^-3 10^-4", "0.0 0.2 0.4 0.6 0.8 1.0", or repeated scientific powers.
 */
function detectAxisTicks(text: string): boolean {
  // 1. Check for 3+ consecutive scientific notation or powers of 10 (e.g. 10^-1 10^-2 10^-3 or 10^{-1})
  const scientificPowerSequence = /(?:(?:10\^[-+]?\d+|\b10\{[-+]?\d+\})\s*[,;]?\s*){3,}/i;
  if (scientificPowerSequence.test(text)) return true;

  // 2. Check for sequences of 4+ isolated numbers (integers or decimals) separated only by spaces/commas
  // e.g. "0 20 40 60 80 100" or "0.0 0.5 1.0 1.5 2.0"
  const isolatedNumberSequence = /(?:\b\d+(?:\.\d+)?\b[\s,]+){4,}\b\d+(?:\.\d+)?\b/;
  if (isolatedNumberSequence.test(text)) return true;

  // 3. Dense clusters of standalone numeric tokens in short span (e.g. axis ticks mixed with minimal text)
  const tokens = text.split(/\s+/);
  let consecutiveNumeric = 0;
  let maxConsecutiveNumeric = 0;
  let totalNumeric = 0;

  for (const token of tokens) {
    const clean = token.replace(/[,;:.()]/g, '');
    const isNum = /^[-+]?\d+(?:\.\d+)?(?:e[-+]?\d+)?$/i.test(clean) || /^10\^[-+]?\d+$/i.test(clean);
    if (isNum) {
      consecutiveNumeric++;
      totalNumeric++;
      if (consecutiveNumeric > maxConsecutiveNumeric) {
        maxConsecutiveNumeric = consecutiveNumeric;
      }
    } else {
      consecutiveNumeric = 0;
    }
  }

  if (maxConsecutiveNumeric >= 4) return true;
  if (tokens.length >= 8 && totalNumeric / tokens.length > 0.35) return true;

  return false;
}

/**
 * Detects clustered optimizer or algorithm legend labels, e.g.
 * "Adam AdaGrad RMSProp SGD SFO" or "Adam (alpha=10^-3) AdaGrad RMSProp".
 */
function detectLegendLabels(text: string): boolean {
  const words = text.toLowerCase().split(/[\s,;:.()]+/);
  let legendCount = 0;
  const foundLegends = new Set<string>();

  for (const word of words) {
    if (KNOWN_LEGEND_TOKENS.has(word)) {
      legendCount++;
      foundLegends.add(word);
    }
  }

  // 3 or more distinct optimizer legend labels in a single passage without rich syntactic connective prose
  if (foundLegends.size >= 3) {
    // Check if they occur in tight proximity (e.g., legend listing "Adam AdaGrad RMSProp SGD")
    const legendCluster =
      /\b(?:adam|adagrad|rmsprop|sgd|sfo|nesterov|momentum|adadelta)\b[\s,/()=\d^.-]*\b(?:adam|adagrad|rmsprop|sgd|sfo|nesterov|momentum|adadelta)\b[\s,/()=\d^.-]*\b(?:adam|adagrad|rmsprop|sgd|sfo|nesterov|momentum|adadelta)\b/i;
    if (legendCluster.test(text)) {
      return true;
    }
    // If 4 or more legend tokens appear in the selection
    if (foundLegends.size >= 4) {
      return true;
    }
  }

  return false;
}

/**
 * Detects dense subplot variables or parameter annotations (e.g. "(left) (right)", "(a) (b)", "alpha = 10^-2").
 */
function detectDenseVariables(text: string): boolean {
  const subplotMarkers = (text.match(/\((?:left|right|top|bottom|center|a|b|c|d|middle)\)/gi) || []).length;
  const paramAssignments = (text.match(/\b(?:alpha|beta_1|beta_2|lambda|gamma|lr|epsilon)\s*=\s*[0-9e^.-]+/gi) || []).length;

  if (subplotMarkers >= 2 && paramAssignments >= 1) return true;
  if (subplotMarkers >= 3) return true;
  if (paramAssignments >= 3) return true;

  return false;
}

/**
 * Detects whether sentence structure is abruptly interrupted by non-prose chart fragments.
 * (e.g., prose ... numbers/labels ... prose or caption).
 */
function detectInterruptedStructure(text: string): boolean {
  // A pattern where text is followed by a cluster of 3+ numbers/symbols, then another capitalized sentence start
  const tickIntrusion = /[a-z][,.]?\s+(?:(?:10\^[-+]?\d+|\d+(?:\.\d+)?)\s+){3,}[A-Z]/;
  if (tickIntrusion.test(text)) return true;

  // A pattern where caption starts, followed by axis ticks/legends, followed by "Figure" or "Table"
  const captionFollowedByAnother = /\bFigure\s+\d+[:.][\s\S]+?\b(?:0|10\^|Adam|SGD|RMSProp)\b[\s\S]+?\bFigure\s+\d+[:.]/i;
  if (captionFollowedByAnother.test(text)) return true;

  return false;
}

/**
 * Checks if the selection crosses multiple disparate document blocks that do not form a single coherent sentence.
 */
function detectBlockMismatch(
  startIndex?: number,
  endIndex?: number,
  blocks?: ExtractedBlock[]
): boolean {
  if (startIndex === undefined || endIndex === undefined || !blocks || blocks.length === 0) {
    return false;
  }

  // Find all blocks that overlap with [startIndex, endIndex]
  const overlappingBlocks = blocks.filter(
    (b) => b.startIndex < endIndex && b.endIndex > startIndex
  );

  if (overlappingBlocks.length >= 2) {
    // Check if overlapping blocks include both a heading/caption and paragraph, or jump across pages
    const pageNumbers = new Set(overlappingBlocks.map((b) => b.pageNumber).filter(Boolean));
    if (pageNumbers.size >= 2) {
      return true;
    }

    // Check if one block is a heading or caption-like short block and another is a distinct body paragraph
    const hasHeadingOrCaption = overlappingBlocks.some(
      (b) =>
        b.type === 'heading' ||
        /^(?:Figure|Fig\.?|Table|Chart)\s+\d+/i.test(b.text.trim())
    );
    if (hasHeadingOrCaption && overlappingBlocks.length > 2) {
      return true;
    }
  }

  return false;
}

/**
 * Evaluates the extraction quality and source boundary integrity of a candidate sentence or selection.
 * Conservative multi-signal assessment prevents presenting contaminated figure/chart artifacts
 * as normal prose sentences.
 */
export function evaluateExtractionQuality(
  text: string,
  blocks?: ExtractedBlock[],
  startIndex?: number,
  endIndex?: number
): ExtractionQuality {
  const trimmed = text.trim();
  if (!trimmed) {
    return {
      isMixedContent: false,
      confidence: 'high',
      reasons: [],
      signals: {},
    };
  }

  const { hasMultiple: multipleCaptions, captionLabels } = detectMultipleCaptions(trimmed);
  const axisTicks = detectAxisTicks(trimmed);
  const legendLabels = detectLegendLabels(trimmed);
  const denseVariables = detectDenseVariables(trimmed);
  const interruptedStructure = detectInterruptedStructure(trimmed);
  const spansIncoherentBlocks = detectBlockMismatch(startIndex, endIndex, blocks);

  const signals: ExtractionQualitySignals = {
    multipleCaptions,
    axisTicks,
    legendLabels,
    denseVariables,
    interruptedStructure,
    spansIncoherentBlocks,
  };

  const reasons: string[] = [];

  if (multipleCaptions) {
    reasons.push(
      `Contains multiple figure or table caption declarations (${captionLabels.map((l) => `Figure ${l}`).join(' and ')})`
    );
  }
  if (axisTicks) {
    reasons.push('Contains isolated sequences of numerical chart axis ticks or exponent steps');
  }
  if (legendLabels) {
    reasons.push('Contains clustered optimizer or algorithm chart legend labels');
  }
  if (denseVariables) {
    reasons.push('Contains dense subplot coordinates or parameter annotations');
  }
  if (interruptedStructure) {
    reasons.push('Sentence structure is interrupted by chart labels or mid-stream caption transitions');
  }
  if (spansIncoherentBlocks) {
    reasons.push('Selection spans across disparate document layout blocks or page boundaries');
  }

  // Count active signals
  const activeSignalCount =
    (multipleCaptions ? 2 : 0) + // multiple captions is a very strong signal
    (axisTicks ? 1 : 0) +
    (legendLabels ? 1 : 0) +
    (denseVariables ? 1 : 0) +
    (interruptedStructure ? 1 : 0) +
    (spansIncoherentBlocks ? 1 : 0);

  // Decision rule:
  // 1. Multiple captions present (e.g. Figure 2 and Figure 3 merged) -> Always mixed content
  // 2. Axis ticks + Legend labels -> Always mixed content
  // 3. Any 2 or more distinct signals active -> Mixed content
  // 4. Axis ticks with interrupted structure -> Mixed content
  const isMixedContent =
    multipleCaptions ||
    (axisTicks && legendLabels) ||
    (axisTicks && interruptedStructure) ||
    activeSignalCount >= 2;

  let confidence: 'high' | 'medium' | 'low' = 'low';
  if (multipleCaptions || (axisTicks && legendLabels)) {
    confidence = 'high';
  } else if (activeSignalCount >= 2) {
    confidence = 'medium';
  }

  let warningMessage: string | undefined;
  if (isMixedContent) {
    warningMessage = `This selection contains non-prose figure content (${reasons.slice(0, 2).join('; ')}). AI rewriting of mixed figure text is restricted to prevent generating inaccurate academic revisions that combine separate experiments.`;
  }

  return {
    isMixedContent,
    confidence,
    reasons,
    signals,
    warningMessage,
    suggestedAction: isMixedContent ? 'narrow_selection' : undefined,
  };
}
