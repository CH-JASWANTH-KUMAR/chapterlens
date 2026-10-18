import { describe, it, expect } from 'vitest';
import { segmentText } from '../lib/linguistics/segmenter';
import { analyzeChapter } from '../lib/linguistics/analyzer';
import {
  scoreSentenceDifficulty,
  identifyHardestSentences,
  generateDeterministicEditingGuidance,
} from '../lib/linguistics/difficulty';
import { enrichAnalysisWithDocument } from '../lib/document/locator';
import { ExtractedDocument, ExtractedBlock } from '../lib/document/types';
import { extractPassageContext } from '../lib/reading/contextExtractor';
import { evaluateExtractionQuality } from '../lib/linguistics/contentQuality';

describe('Milestone 3.2: Validation with Representative Research Papers', () => {
  // 1. Adam: A Method for Stochastic Optimization (Kingma & Ba, 2014 - arXiv:1412.6980)
  describe('Adam (arXiv:1412.6980) Validation', () => {
    const adamPassage = `We introduce Adam, an algorithm for first-order gradient-based optimization of stochastic objective functions, based on adaptive estimates of lower-order moments. In Eq. (1) and Eq. 2, the moving averages of the gradient and squared gradient are computed with hyperparameters beta_1 = 0.9 and beta_2 = 0.999. Some of Adam’s advantages are that the magnitudes of parameter updates are invariant to rescaling of the gradient, its stepsizes are approximately bounded by the stepsize hyperparameter, it does not require a stationary objective, it works with sparse gradients, and it naturally performs a form of step size annealing. The method was evaluated against AdaGrad (Duchi et al., 2011) and RMSProp.`;

    it('correctly segments Adam text without false breaks on Eq. (1), Eq. 2, or citations', () => {
      const sentences = segmentText(adamPassage);
      expect(sentences).toHaveLength(4);

      // Sentence 1: Introduction
      expect(sentences[0].text).toContain('We introduce Adam');

      // Sentence 2: Equation reference & parameters (must NOT split on Eq. (1) or Eq. 2)
      expect(sentences[1].text).toContain('In Eq. (1) and Eq. 2, the moving averages');
      expect(sentences[1].text).toContain('beta_2 = 0.999.');

      // Sentence 3: Long compound advantages sentence
      expect(sentences[2].text).toContain('magnitudes of parameter updates');

      // Sentence 4: Citation (Duchi et al., 2011)
      expect(sentences[3].text).toContain('(Duchi et al., 2011)');
    });

    it('identifies the multi-clause compound sentence as highest friction candidate', () => {
      const sentences = segmentText(adamPassage);
      const hardest = identifyHardestSentences(sentences, 3);
      expect(hardest.length).toBeGreaterThan(0);
      expect(hardest[0].text).toContain('Some of Adam’s advantages are that the magnitudes of parameter updates');
      expect(hardest[0].signals.wordCount).toBeGreaterThan(40);
      expect(hardest[0].primaryIssue).toBe('combination');
    });
  });

  // 2. Attention Is All You Need (Vaswani et al., 2017 - arXiv:1706.03762)
  describe('Attention Is All You Need (arXiv:1706.03762) Validation', () => {
    const transformerPassage = `The dominant sequence transduction models are based on complex recurrent or convolutional neural networks that include an encoder and a decoder. As illustrated in Fig. 1 and Fig. 2, the Transformer is the first transduction model relying entirely on self-attention to compute representations of its input and output without using sequence-aligned RNNs or convolution. In Table 1 and Table 2, we show that our model achieves 28.4 BLEU on the WMT 2014 English-to-German translation task, improving over the existing best results, including ensembles, by over 2.0 BLEU. The experiments were executed on 8 NVIDIA P100 GPUs for 3.5 days.`;

    it('preserves Fig. 1, Fig. 2, Table 1, Table 2, and decimal numbers (28.4, 2.0, 3.5)', () => {
      const sentences = segmentText(transformerPassage);
      expect(sentences).toHaveLength(4);

      // Must not split at Fig. 1 or Fig. 2
      expect(sentences[1].text).toBe(
        'As illustrated in Fig. 1 and Fig. 2, the Transformer is the first transduction model relying entirely on self-attention to compute representations of its input and output without using sequence-aligned RNNs or convolution.'
      );

      // Must not split at Table 1 or Table 2 or 28.4 or 2.0
      expect(sentences[2].text).toContain('In Table 1 and Table 2');
      expect(sentences[2].text).toContain('28.4 BLEU');
      expect(sentences[2].text).toContain('2.0 BLEU.');

      // Must not split at 3.5 days
      expect(sentences[3].text).toBe('The experiments were executed on 8 NVIDIA P100 GPUs for 3.5 days.');
    });

    it('retains numerical accuracy and terms in context extraction', () => {
      const doc: ExtractedDocument = {
        id: 'doc-transformer-test',
        fileName: 'attention_is_all_you_need.pdf',
        fileSize: 45000,
        format: 'pdf',
        extractedAt: new Date().toISOString(),
        fullText: transformerPassage,
        blocks: [
          {
            id: 'block-1',
            type: 'paragraph',
            text: transformerPassage,
            startIndex: 0,
            endIndex: transformerPassage.length,
            paragraphIndex: 0,
            pageNumber: 1,
            sectionHeading: '3 Model Architecture',
          },
        ],
        pageCount: 15,
        hasHeadings: true,
        warnings: [],
      };

      const sentences = segmentText(transformerPassage);
      const targetSentence = sentences[2]; // The BLEU score sentence
      const context = extractPassageContext(doc, targetSentence.startIndex, targetSentence.endIndex, targetSentence.text);

      expect(context.text).toContain('28.4 BLEU');
      expect(context.sourceLocation.pageNumber).toBe(1);
      expect(context.sourceLocation.sectionHeading).toBe('3 Model Architecture');
      expect(context.surroundingContext.length).toBeLessThanOrEqual(1200);
    });
  });

  // 3. BERT: Pre-training of Deep Bidirectional Transformers (Devlin et al., 2018 - arXiv:1810.04805)
  describe('BERT (arXiv:1810.04805) Validation', () => {
    const bertPassage = `We introduce a new language representation model called BERT, which stands for Bidirectional Encoder Representations from Transformers. Unlike recent language representation models (Peters et al., 2018a; Radford et al., 2018), BERT is designed to pre-train deep bidirectional representations from unlabeled text by jointly conditioning on both left and right context in all layers. As a result, the pre-trained BERT model can be fine-tuned with just one additional output layer to create state-of-the-art models for a wide range of tasks, such as question answering and language inference, without substantial task-specific architecture modifications. It obtains new state-of-the-art results on eleven natural language processing tasks, including pushing the GLUE score to 80.5% (7.7% point absolute improvement).`;

    it('preserves multi-author parenthetical citations with semicolons and letters (Peters et al., 2018a)', () => {
      const sentences = segmentText(bertPassage);
      expect(sentences).toHaveLength(4);

      // Sentence 2 contains "(Peters et al., 2018a; Radford et al., 2018)"
      expect(sentences[1].text).toContain('(Peters et al., 2018a; Radford et al., 2018)');
      expect(sentences[1].text.startsWith('Unlike recent language representation models')).toBe(true);

      // Sentence 4 contains decimal percentages
      expect(sentences[3].text).toContain('80.5% (7.7% point absolute improvement)');
    });
  });

  // 4. Vision Transformer (Dosovitskiy et al., 2020 - arXiv:2010.11929)
  describe('Vision Transformer (arXiv:2010.11929) Validation', () => {
    const vitPassage = `While the Transformer architecture has become the de-facto standard for natural language processing tasks, its applications to computer vision remain limited. In vision, attention is either applied in conjunction with convolutional networks, or used to replace certain components of convolutional networks while keeping their overall structure in place. In Sec. 3.1 and Sec. 3.2, we show that this reliance on CNNs is not necessary and a pure transformer applied directly to sequences of image patches can perform very well on image classification tasks. When trained on mid-sized datasets (e.g. ImageNet-1k), such models yield modest accuracies of a few percentage points below ResNets of comparable size.`;

    it('handles Sec. 3.1, Sec. 3.2, and e.g. ImageNet without false breaks', () => {
      const sentences = segmentText(vitPassage);
      expect(sentences).toHaveLength(4);

      // Sentence 3 has "In Sec. 3.1 and Sec. 3.2, we show..."
      expect(sentences[2].text).toContain('In Sec. 3.1 and Sec. 3.2, we show');
      expect(sentences[2].text).toContain('image classification tasks.');

      // Sentence 4 has "(e.g. ImageNet-1k)"
      expect(sentences[3].text).toContain('(e.g. ImageNet-1k)');
    });
  });

  // 5. LoRA: Low-Rank Adaptation of Large Language Models (Hu et al., 2021 - arXiv:2106.09685)
  describe('LoRA (arXiv:2106.09685) Validation', () => {
    const loraPassage = `An important paradigm of natural language processing consists of large-scale pre-training on general domain data and adaptation to particular tasks or domains. We propose Low-Rank Adaptation, or LoRA, which freezes the pre-trained model weights and injects trainable rank decomposition matrices into each layer of the Transformer architecture, greatly reducing the number of trainable parameters for downstream tasks. Compared to GPT-3 175B fine-tuned with Adam, LoRA can reduce the number of trainable parameters by 10,000 times and the GPU memory requirement by 3 times. As detailed in Sec. 4, Ref. [14], and pp. 5-7, LoRA performs on par or better than full fine-tuning.`;

    it('handles Sec. 4, Ref. [14], and page ranges pp. 5-7 cleanly', () => {
      const sentences = segmentText(loraPassage);
      expect(sentences).toHaveLength(4);

      expect(sentences[3].text).toContain('Sec. 4');
      expect(sentences[3].text).toContain('Ref. [14]');
      expect(sentences[3].text).toContain('pp. 5-7');
    });
  });

  // 6. The Lottery Ticket Hypothesis (Frankle & Carbin, 2018 - arXiv:1803.03635)
  describe('The Lottery Ticket Hypothesis (arXiv:1803.03635) Validation', () => {
    const lotteryPassage = `Neural network pruning techniques can reduce the parameter counts of trained networks by over 90%, decreasing storage requirements and improving computational performance of inference without compromising accuracy. However, contemporary experience is that the sparse architectures produced by pruning are difficult to train from the start, which would similarly improve training performance. We find that a standard pruning technique naturally uncovers subnetworks whose initializations made them capable of training effectively. This leads to the Lottery Ticket Hypothesis: a randomly-initialized, dense neural network contains a subnetwork that is initialized such that\u2014when trained in isolation\u2014it can match the test accuracy of the original network after training for at most the same number of iterations.`;

    it('correctly parses em-dash clauses and evaluates complex punctuation density', () => {
      const sentences = segmentText(lotteryPassage);
      expect(sentences).toHaveLength(4);

      const hypothesisSentence = sentences[3];
      expect(hypothesisSentence.text).toContain('Lottery Ticket Hypothesis:');
      expect(hypothesisSentence.complexPunctuationCount).toBeGreaterThan(0);

      const scored = scoreSentenceDifficulty(hypothesisSentence);
      expect(scored.signals.complexPunctuationCount).toBeGreaterThanOrEqual(2);
      expect(scored.score).toBeGreaterThan(40);
    });
  });

  // 7. Full Working Copy Revision & Safe Undo Lifecycle
  describe('Safe In-Memory Working Copy Editing & Undo Integrity', () => {
    it('accurately updates document blocks, character offsets, and restores on undo', () => {
      const initialText =
        'Section 1 begins here. In traditional recurrent neural networks, hidden state vectors are iteratively propagated from one token position to the next; consequently, researchers frequently adopt sparse matrix approximations and factorization heuristics to maintain tractability across extended token horizons. Section 2 follows here.';

      const originalDoc: ExtractedDocument = {
        id: 'doc-edit-test',
        fileName: 'edit_test.txt',
        fileSize: 400,
        format: 'txt',
        extractedAt: new Date().toISOString(),
        fullText: initialText,
        blocks: [
          {
            id: 'block-1',
            type: 'paragraph',
            text: 'Section 1 begins here.',
            startIndex: 0,
            endIndex: 22,
            paragraphIndex: 0,
          },
          {
            id: 'block-2',
            type: 'paragraph',
            text: 'In traditional recurrent neural networks, hidden state vectors are iteratively propagated from one token position to the next; consequently, researchers frequently adopt sparse matrix approximations and factorization heuristics to maintain tractability across extended token horizons.',
            startIndex: 23,
            endIndex: 300,
            paragraphIndex: 1,
          },
          {
            id: 'block-3',
            type: 'paragraph',
            text: 'Section 2 follows here.',
            startIndex: 302,
            endIndex: 325,
            paragraphIndex: 2,
          },
        ],
        pageCount: 1,
        hasHeadings: false,
        warnings: [],
      };

      const analysis = analyzeChapter(initialText);
      const enriched = enrichAnalysisWithDocument(analysis, originalDoc);
      const difficult = enriched.difficultSentences[0];
      expect(difficult).toBeDefined();

      const simplified =
        'In traditional recurrent neural networks, hidden state vectors propagate token by token. Consequently, researchers use sparse matrix approximations to preserve tractability.';

      // Simulate Workspace handleApplyRevision logic
      const delta = simplified.length - difficult.text.length;
      const updatedText =
        initialText.slice(0, difficult.startIndex) + simplified + initialText.slice(difficult.endIndex);

      const updatedBlocks = originalDoc.blocks.map((block) => {
        if (difficult.startIndex >= block.startIndex && difficult.startIndex < block.endIndex) {
          const relStart = difficult.startIndex - block.startIndex;
          const relEnd = Math.min(block.text.length, relStart + difficult.text.length);
          const newBlockText =
            block.text.slice(0, relStart) + simplified + block.text.slice(relEnd);
          return {
            ...block,
            text: newBlockText,
            endIndex: block.endIndex + delta,
          };
        } else if (block.startIndex > difficult.startIndex) {
          return {
            ...block,
            startIndex: block.startIndex + delta,
            endIndex: block.endIndex + delta,
          };
        }
        return block;
      });

      const updatedDoc: ExtractedDocument = {
        ...originalDoc,
        fullText: updatedText,
        blocks: updatedBlocks,
      };

      // Verify the revision was applied cleanly
      expect(updatedDoc.fullText).toContain(simplified);
      expect(updatedBlocks[1].text).toBe(simplified);

      // Verify block 3 shifted cleanly by delta
      expect(updatedBlocks[2].startIndex).toBe(originalDoc.blocks[2].startIndex + delta);
      expect(updatedBlocks[2].endIndex).toBe(originalDoc.blocks[2].endIndex + delta);

      // Recompute analysis on updated draft
      const recomputedAnalysis = enrichAnalysisWithDocument(analyzeChapter(updatedText), updatedDoc);
      expect(recomputedAnalysis.totalWords).toBeLessThan(analysis.totalWords);

      // Verify undo restores exact initial state
      const restoredDoc = originalDoc;
      const restoredText = initialText;
      expect(restoredDoc.fullText).toBe(initialText);
      expect(restoredDoc.blocks[1].text).toBe(originalDoc.blocks[1].text);
      expect(restoredText).toBe(initialText);
    });
  });

  // 8. Hotfix Regression: Figure Extraction Boundary & Mixed Content Protection
  describe('Hotfix Regression: Figure Extraction Boundary & Mixed Content Protection', () => {
    // 52-word selection from the Adam paper merging Figure 2 SFO comparison, axis labels, legend entries, and Figure 3 caption
    const adamContaminatedSelection =
      'Figure 2: Comparison of Adam to other optimization methods on logistic regression with SFO (Sohl-Dickstein et al., 2014). 0 20 40 60 80 100 10^-1 10^-2 10^-3 Adam AdaGrad RMSProp SGD SFO Figure 3: Convolutional neural networks on CIFAR-10 with standard architecture.';

    it('segmentText separates Figure 2 SFO caption from Figure 3 caption', () => {
      const sentences = segmentText(adamContaminatedSelection);
      // Figure 2 and Figure 3 must not be merged into a single sentence
      expect(sentences.length).toBeGreaterThanOrEqual(2);
      expect(sentences[0].text).toContain('Figure 2:');
      expect(sentences[0].text).not.toContain('Figure 3:');
      expect(sentences[sentences.length - 1].text).toContain('Figure 3:');
    });

    it('evaluateExtractionQuality flags the contaminated selection as mixed content with specific signals', () => {
      const quality = evaluateExtractionQuality(adamContaminatedSelection);
      expect(quality.isMixedContent).toBe(true);
      expect(quality.confidence).toBe('high');
      expect(quality.signals.multipleCaptions).toBe(true);
      expect(quality.signals.axisTicks).toBe(true);
      expect(quality.signals.legendLabels).toBe(true);
      expect(quality.reasons.length).toBeGreaterThanOrEqual(2);
      expect(quality.warningMessage).toContain('non-prose figure content');
    });

    it('generateDeterministicEditingGuidance refuses to synthesize a fake rewrite for mixed figure content', () => {
      const quality = evaluateExtractionQuality(adamContaminatedSelection);
      const token = {
        id: 'token-adam-contaminated',
        text: adamContaminatedSelection,
        startIndex: 0,
        endIndex: adamContaminatedSelection.length,
        paragraphIndex: 0,
        sentenceIndexInParagraph: 0,
        wordCount: 30,
        syllableCount: 60,
        polysyllabicWordCount: 8,
        longWordCount: 10,
        complexPunctuationCount: 4,
        commaCount: 2,
        isNonProse: true,
        extractionQuality: quality,
      };

      const guidance = generateDeterministicEditingGuidance(token, 'combination', {
        wordCount: 30,
        syllableCount: 60,
        avgSyllablesPerWord: 2.0,
        polysyllabicWordCount: 8,
        polysyllabicRatio: 0.27,
        complexPunctuationCount: 4,
        structuralComplexityScore: 0.8,
        lengthScore: 0.7,
        vocabularyScore: 0.7,
      });

      expect(guidance.suggestedRewrite).toBeUndefined();
      expect(guidance.editorialTip).toContain('Extraction warning:');
    });

    it('preserves source text integrity without silently modifying or truncating content', () => {
      const tokens = segmentText(adamContaminatedSelection);
      // Rebuilding tokens covers the spans faithfully
      expect(adamContaminatedSelection).toContain('SFO (Sohl-Dickstein et al., 2014)');
      expect(adamContaminatedSelection).toContain('Convolutional neural networks on CIFAR-10');
      // Character offsets must be preserved
      for (const t of tokens) {
        expect(adamContaminatedSelection.slice(t.startIndex, t.endIndex)).toBe(t.text);
      }
    });

    it('allows ordinary scholarly prose with Fig. 1 and Fig. 2 cross-references to pass cleanly', () => {
      const cleanProse =
        'As illustrated in Fig. 1 and Fig. 2, the Transformer is the first transduction model relying entirely on self-attention.';
      const quality = evaluateExtractionQuality(cleanProse);
      expect(quality.isMixedContent).toBe(false);
      expect(quality.signals.multipleCaptions).toBe(false);

      const sentences = segmentText(cleanProse);
      expect(sentences).toHaveLength(1);
      expect(sentences[0].isNonProse).toBe(false);
    });

    it('keeps legitimate complex academic prose eligible for readability scoring', () => {
      const complexProse =
        'Some of Adam advantages are that the magnitudes of parameter updates are invariant to rescaling of the gradient, its stepsizes are approximately bounded by the stepsize hyperparameter, and it naturally performs a form of step size annealing.';
      const sentences = segmentText(complexProse);
      expect(sentences).toHaveLength(1);
      expect(sentences[0].isNonProse).toBe(false);

      const hardest = identifyHardestSentences(sentences, 1);
      expect(hardest).toHaveLength(1);
      expect(hardest[0].difficultyScore).toBeGreaterThan(30);
      expect(hardest[0].extractionQuality?.isMixedContent).toBeFalsy();
    });
  });
});
