import { ExtractedDocument, ExtractedBlock } from './types';

export const SAMPLE_DOCUMENT_TITLE = 'Sample Study: Attention & Cognitive Load (Illustrative)';

/**
 * Returns an illustrative research-style sample document built on the ExtractedDocument model.
 * Contains structured sections, paragraphs, technical terms, and varying sentence complexity
 * for first-time user exploration in both Guided Reading and Readability Audit modes.
 */
export function getSampleResearchDocument(): ExtractedDocument {
  const sections: Array<{
    heading: string;
    level: number;
    paragraphs: string[];
  }> = [
    {
      heading: 'Abstract',
      level: 1,
      paragraphs: [
        'This illustrative paper demonstrates ChapterLens\'s guided reading and readability analysis. Modern sequence transduction models rely on layered attention mechanisms to balance computational throughput against linguistic fidelity.',
        'However, the quadratic time complexity inherent in full dot-product self-attention imposes severe memory pressure during autoregressive decoding; consequently, researchers frequently adopt sparse matrix approximations and factorization heuristics to maintain tractability across extended token horizons.',
      ],
    },
    {
      heading: '1. Introduction & Sequence Transduction',
      level: 1,
      paragraphs: [
        'Sequence transduction remains a foundational paradigm in computational linguistics. In traditional recurrent neural networks, hidden state vectors are iteratively propagated from one token position to the next. This sequential dependency fundamentally precludes parallelization across training batches.',
        'By eliminating recurrence, the Transformer architecture computes pairwise token interactions across all positions in constant operational depth. This architectural transition dramatically accelerates parallelized training on modern hardware accelerators.',
      ],
    },
    {
      heading: '2. Cognitive Architecture & Working Memory Limits',
      level: 1,
      paragraphs: [
        'Reading dense technical prose imposes significant cognitive friction on human readers.',
        'When complex technical sentences introduce multiple nested subordinate clauses without immediate predicate resolution—particularly when accompanied by specialized polysyllabic terminology, ungrounded acronyms, and parenthetical digressions—the reader\'s working memory buffer becomes rapidly saturated.',
        'For this reason, editorial clarity does not demand omitting technical precision. Rather, effective scientific writing anchors difficult formulations in tangible analogies before introducing formal methodological derivations.',
      ],
    },
    {
      heading: '3. Computational Complexity & Quadratic Bottlenecks',
      level: 1,
      paragraphs: [
        'Let n denote the sequence length of an input context. Full self-attention computes an n by n compatibility matrix using scaled dot-products between query and key projections.',
        'The memory footprint of this operation scales quadratically with sequence length, creating a formidable computational bottleneck when processing long-form documents. Sparse attention patterns mitigate this limitation by restricting evaluations to localized neighborhoods and dilated strides.',
      ],
    },
    {
      heading: '4. Conclusion & Pedagogical Implications',
      level: 1,
      paragraphs: [
        'Clear scholarly communication requires balancing conceptual rigor against syntactic cadence. By systematically isolating high-friction sentences and exploring unfamiliar prerequisites, readers can navigate challenging literature without abandoning the original text.',
      ],
    },
  ];

  const blocks: ExtractedBlock[] = [];
  let fullText = '';
  let cursor = 0;
  let paragraphIndex = 0;

  for (let sIdx = 0; sIdx < sections.length; sIdx++) {
    const sec = sections[sIdx];

    // Add Heading Block
    if (fullText.length > 0) {
      fullText += '\n\n';
      cursor += 2;
    }
    const hStart = cursor;
    fullText += sec.heading;
    cursor += sec.heading.length;
    const hEnd = cursor;

    blocks.push({
      id: `block-sample-${blocks.length + 1}`,
      type: 'heading',
      level: sec.level,
      sectionHeading: sec.heading,
      headingHierarchy: [sec.heading],
      text: sec.heading,
      startIndex: hStart,
      endIndex: hEnd,
      paragraphIndex: paragraphIndex++,
    });

    // Add Paragraph Blocks
    for (let pIdx = 0; pIdx < sec.paragraphs.length; pIdx++) {
      const pText = sec.paragraphs[pIdx];

      fullText += '\n\n';
      cursor += 2;

      const pStart = cursor;
      fullText += pText;
      cursor += pText.length;
      const pEnd = cursor;

      blocks.push({
        id: `block-sample-${blocks.length + 1}`,
        type: 'paragraph',
        sectionHeading: sec.heading,
        headingHierarchy: [sec.heading],
        text: pText,
        startIndex: pStart,
        endIndex: pEnd,
        paragraphIndex: paragraphIndex++,
      });
    }
  }

  return {
    id: 'sample-doc-research-illustrative',
    fileName: SAMPLE_DOCUMENT_TITLE,
    fileSize: typeof TextEncoder !== 'undefined' ? new TextEncoder().encode(fullText).length : fullText.length,
    format: 'txt',
    extractedAt: new Date().toISOString(),
    fullText,
    blocks,
    pageCount: 1,
    hasHeadings: true,
    warnings: [],
    isSample: true,
  };
}
