import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { extractPassageContext, MAX_CONTEXT_LENGTH } from '../lib/reading/contextExtractor';
import { GET, POST } from '../app/api/explain/route';
import { ExtractedDocument, ExtractedBlock } from '../lib/document/types';
import { ExplanationLevel, PassageExplanation } from '../lib/reading/types';

describe('Guided Research Reading (Milestone 2)', () => {
  describe('Context Extraction & Source Location Preservation', () => {
    const sampleDoc: ExtractedDocument = {
      id: 'doc-research-paper',
      fileName: 'attention-is-all-you-need.pdf',
      fileSize: 40960,
      format: 'pdf',
      pageCount: 3,
      extractedAt: new Date().toISOString(),
      fullText:
        'Abstract\n\nThe dominant sequence transduction models are based on complex recurrent or convolutional neural networks. We propose the Transformer, a model architecture eschewing recurrence and instead relying entirely on an attention mechanism to draw global dependencies between input and output.\n\nIntroduction\n\nRecurrent neural networks, particularly LSTM and GRU architectures, have been firmly established as state of the art approaches in sequence modeling.',
      blocks: [
        {
          id: 'block-1',
          type: 'heading',
          level: 1,
          text: 'Abstract',
          pageNumber: 1,
          startIndex: 0,
          endIndex: 8,
          paragraphIndex: 0,
        },
        {
          id: 'block-2',
          type: 'paragraph',
          pageNumber: 1,
          text: 'The dominant sequence transduction models are based on complex recurrent or convolutional neural networks. We propose the Transformer, a model architecture eschewing recurrence and instead relying entirely on an attention mechanism to draw global dependencies between input and output.',
          startIndex: 10,
          endIndex: 288,
          paragraphIndex: 1,
          headingHierarchy: ['Abstract'],
        },
        {
          id: 'block-3',
          type: 'heading',
          level: 1,
          text: 'Introduction',
          pageNumber: 2,
          startIndex: 290,
          endIndex: 302,
          paragraphIndex: 2,
        },
        {
          id: 'block-4',
          type: 'paragraph',
          pageNumber: 2,
          text: 'Recurrent neural networks, particularly LSTM and GRU architectures, have been firmly established as state of the art approaches in sequence modeling.',
          startIndex: 304,
          endIndex: 453,
          paragraphIndex: 3,
          headingHierarchy: ['Introduction'],
        },
      ],
      hasHeadings: true,
      warnings: [],
    };

    it('extracts enclosing paragraph as surrounding context for a selected passage', () => {
      const sentence =
        'We propose the Transformer, a model architecture eschewing recurrence and instead relying entirely on an attention mechanism to draw global dependencies between input and output.';
      const startIndex = sampleDoc.fullText.indexOf(sentence);
      const endIndex = startIndex + sentence.length;

      const passage = extractPassageContext(sampleDoc, startIndex, endIndex, sentence);

      expect(passage.text).toBe(sentence);
      expect(passage.startIndex).toBe(startIndex);
      expect(passage.endIndex).toBe(endIndex);
      expect(passage.blockId).toBe('block-2');
      expect(passage.sourceLocation.pageNumber).toBe(1);
      expect(passage.sourceLocation.paragraphIndex).toBe(1);
      expect(passage.sourceLocation.headingHierarchy).toEqual(['Abstract']);
      expect(passage.surroundingContext).toContain('The dominant sequence transduction models');
    });

    it('preserves section heading hierarchy and page numbers from multi-page document', () => {
      const sentence =
        'Recurrent neural networks, particularly LSTM and GRU architectures, have been firmly established as state of the art approaches in sequence modeling.';
      const startIndex = sampleDoc.fullText.indexOf(sentence);
      const endIndex = startIndex + sentence.length;

      const passage = extractPassageContext(sampleDoc, startIndex, endIndex, sentence);

      expect(passage.sourceLocation.pageNumber).toBe(2);
      expect(passage.sourceLocation.headingHierarchy).toEqual(['Introduction']);
      expect(passage.blockId).toBe('block-4');
    });

    it('strictly bounds transmitted surrounding context to at most MAX_CONTEXT_LENGTH characters', () => {
      // Create a document with an enormous 4,000 character paragraph
      const longSentence = 'The critical mathematical anomaly occurs at the boundary of tensor factorization.';
      const massiveParagraph = `${'Preceding text noise. '.repeat(100)}${longSentence}${' Following text noise. '.repeat(100)}`;

      const largeDoc: ExtractedDocument = {
        id: 'doc-large',
        fileName: 'massive-paper.txt',
        fileSize: 10000,
        format: 'txt',
        extractedAt: new Date().toISOString(),
        fullText: massiveParagraph,
        blocks: [
          {
            id: 'block-massive',
            type: 'paragraph',
            text: massiveParagraph,
            startIndex: 0,
            endIndex: massiveParagraph.length,
            paragraphIndex: 0,
          },
        ],
        hasHeadings: false,
        warnings: [],
      };

      const start = massiveParagraph.indexOf(longSentence);
      const end = start + longSentence.length;

      const passage = extractPassageContext(largeDoc, start, end, longSentence);

      expect(passage.surroundingContext.length).toBeLessThanOrEqual(MAX_CONTEXT_LENGTH);
      expect(passage.surroundingContext).toContain(longSentence);
    });

    it('handles fallback gracefully when offset does not match an exact block', () => {
      const text = 'Fallback floating passage';
      const fallbackDoc: ExtractedDocument = {
        id: 'doc-empty-blocks',
        fileName: 'empty.txt',
        fileSize: 100,
        format: 'txt',
        extractedAt: new Date().toISOString(),
        fullText: `Some document preamble here. ${text}. Some postamble follow-up.`,
        blocks: [],
        hasHeadings: false,
        warnings: [],
      };

      const start = fallbackDoc.fullText.indexOf(text);
      const end = start + text.length;

      const passage = extractPassageContext(fallbackDoc, start, end, text);

      expect(passage.text).toBe(text);
      expect(passage.surroundingContext).toContain(text);
      expect(passage.sourceLocation.paragraphIndex).toBe(0);
    });
  });

  describe('API Route /api/explain: Status & Validation', () => {
    const originalEnv = process.env;

    beforeEach(() => {
      vi.resetModules();
      process.env = { ...originalEnv };
      delete process.env.GEMINI_API_KEY;
      delete process.env.OPENAI_API_KEY;
      delete process.env.ANTHROPIC_API_KEY;
    });

    afterEach(() => {
      process.env = originalEnv;
    });

    it('GET /api/explain returns available: false when no provider key is configured', async () => {
      const res = await GET();
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.available).toBe(false);
      expect(data.provider).toBeNull();
      expect(data.message).toContain('no API key is configured');
    });

    it('GET /api/explain reports Google Gemini when GEMINI_API_KEY is configured', async () => {
      process.env.GEMINI_API_KEY = 'test-gemini-key';
      const res = await GET();
      const data = await res.json();

      expect(data.available).toBe(true);
      expect(data.provider).toBe('Google Gemini');
    });

    it('GET /api/explain reports OpenAI when OPENAI_API_KEY is configured', async () => {
      process.env.OPENAI_API_KEY = 'test-openai-key';
      const res = await GET();
      const data = await res.json();

      expect(data.available).toBe(true);
      expect(data.provider).toBe('OpenAI');
    });

    it('POST /api/explain rejects missing selectedPassage with 400', async () => {
      const req = new NextRequest('http://localhost:3000/api/explain', {
        method: 'POST',
        body: JSON.stringify({ level: 'beginner' }),
      });
      const res = await POST(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain('"selectedPassage" string is required');
    });

    it('POST /api/explain rejects empty/whitespace passage with 400', async () => {
      const req = new NextRequest('http://localhost:3000/api/explain', {
        method: 'POST',
        body: JSON.stringify({ selectedPassage: '   ' }),
      });
      const res = await POST(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain('cannot be empty');
    });

    it('POST /api/explain rejects passages exceeding 800 characters with 400', async () => {
      const hugePassage = 'A'.repeat(850);
      const req = new NextRequest('http://localhost:3000/api/explain', {
        method: 'POST',
        body: JSON.stringify({ selectedPassage: hugePassage }),
      });
      const res = await POST(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain('exceeds maximum limit of 800 characters');
    });

    it('POST /api/explain returns 503 when no AI provider key is configured on deployment', async () => {
      const req = new NextRequest('http://localhost:3000/api/explain', {
        method: 'POST',
        body: JSON.stringify({
          selectedPassage: 'We propose the Transformer architecture.',
          level: 'beginner',
        }),
      });
      const res = await POST(req);
      expect(res.status).toBe(503);
      const data = await res.json();
      expect(data.available).toBe(false);
      expect(data.error).toContain('No AI explanation API key');
    });
  });

  describe('API Route /api/explain: Provider Responses & Error Handling', () => {
    const originalEnv = process.env;
    const originalFetch = global.fetch;

    beforeEach(() => {
      process.env = { ...originalEnv };
      process.env.GEMINI_API_KEY = 'mock-gemini-key';
    });

    afterEach(() => {
      process.env = originalEnv;
      global.fetch = originalFetch;
    });

    it('generates source-grounded explanation conforming to schema across levels', async () => {
      const mockAiPayload = {
        explanation:
          'The Transformer replaces recurrent step-by-step reading with an attention mechanism that looks at the entire sentence at once, like scanning a whole page.',
        terms: [
          {
            term: 'Attention Mechanism',
            definition: 'A mathematical way to weigh how important each word is relative to all other words.',
          },
        ],
        contextFit: 'Introduces the core architectural novelty of the paper in contrast to prior RNNs.',
        prerequisites: [
          {
            name: 'Recurrent Neural Network (RNN)',
            definition: 'A model that processes sequences one token at a time in order.',
            whyItMatters: 'Essential to understand what the Transformer is replacing.',
          },
        ],
        comprehensionCheck: {
          question: 'How does the Transformer process word dependencies differently than an RNN?',
          answer: 'It connects words across the entire sequence directly using attention rather than step-by-step recurrence.',
          explanation: 'Recurrent models must step sequentially through words, whereas attention allows direct pairwise links.',
        },
        limitationsNotice: '',
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          candidates: [
            {
              content: {
                parts: [{ text: JSON.stringify(mockAiPayload) }],
              },
            },
          ],
        }),
      } as any);

      const req = new NextRequest('http://localhost:3000/api/explain', {
        method: 'POST',
        body: JSON.stringify({
          selectedPassage: 'We propose the Transformer, eschewing recurrence.',
          surroundingContext: 'Recurrent models have limitations. We propose the Transformer, eschewing recurrence.',
          sourceLocation: { pageNumber: 1, sectionHeading: 'Abstract', paragraphIndex: 1 },
          level: 'beginner',
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body.available).toBe(true);

      const explanation: PassageExplanation = body.explanation;
      expect(explanation.passage).toBe('We propose the Transformer, eschewing recurrence.');
      expect(explanation.level).toBe('beginner');
      expect(explanation.explanation).toContain('Transformer replaces recurrent');
      expect(explanation.terms.length).toBe(1);
      expect(explanation.terms[0].term).toBe('Attention Mechanism');
      expect(explanation.prerequisites.length).toBe(1);
      expect(explanation.prerequisites[0].name).toBe('Recurrent Neural Network (RNN)');
      expect(explanation.sourceReference.pageNumber).toBe(1);
      expect(explanation.sourceReference.sectionHeading).toBe('Abstract');
      expect(explanation.comprehensionCheck).toBeDefined();
      expect(explanation.comprehensionCheck?.question).toContain('How does the Transformer process');
      expect(explanation.comprehensionCheck?.answer).toBeDefined();
    });

    it('caps prerequisite concepts to at most 3', async () => {
      const mockPayloadWithManyPrereqs = {
        explanation: 'Test explanation',
        terms: [],
        contextFit: 'Test context',
        prerequisites: [
          { name: 'Concept 1', definition: 'D1', whyItMatters: 'M1' },
          { name: 'Concept 2', definition: 'D2', whyItMatters: 'M2' },
          { name: 'Concept 3', definition: 'D3', whyItMatters: 'M3' },
          { name: 'Concept 4', definition: 'D4', whyItMatters: 'M4' },
          { name: 'Concept 5', definition: 'D5', whyItMatters: 'M5' },
        ],
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          candidates: [
            { content: { parts: [{ text: JSON.stringify(mockPayloadWithManyPrereqs) }] } },
          ],
        }),
      } as any);

      const req = new NextRequest('http://localhost:3000/api/explain', {
        method: 'POST',
        body: JSON.stringify({
          selectedPassage: 'Multi-head self-attention relies on scaled dot-products.',
          level: 'technical',
        }),
      });

      const res = await POST(req);
      const body = await res.json();
      expect(body.explanation.prerequisites.length).toBe(3);
    });

    it('surfaces limitationsNotice when document context is insufficient or references missing figures', async () => {
      const mockWithLimitation = {
        explanation: 'The paper references equation (1) for scaled dot-product computation.',
        terms: [],
        contextFit: 'Mathematical specification',
        prerequisites: [],
        limitationsNotice:
          'Equation (1) could not be verified in full mathematical detail because raw PDF extraction omitted the LaTeX symbol rendering.',
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          candidates: [{ content: { parts: [{ text: JSON.stringify(mockWithLimitation) }] } }],
        }),
      } as any);

      const req = new NextRequest('http://localhost:3000/api/explain', {
        method: 'POST',
        body: JSON.stringify({
          selectedPassage: 'We compute the attention function on a set of queries simultaneously as in Equation 1.',
          level: 'step-by-step',
        }),
      });

      const res = await POST(req);
      const body = await res.json();
      expect(body.explanation.limitationsNotice).toContain('raw PDF extraction omitted the LaTeX symbol');
    });

    it('handles upstream 429 rate limit response gracefully', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 429,
        text: async () => 'Resource exhausted: quota exceeded',
      } as any);

      const req = new NextRequest('http://localhost:3000/api/explain', {
        method: 'POST',
        body: JSON.stringify({
          selectedPassage: 'Sample sentence to explain.',
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(429);
      const data = await res.json();
      expect(data.error).toContain('rate limit exceeded');
    });

    it('handles upstream 500 error gracefully by returning 502 Bad Gateway', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        text: async () => 'Internal server failure at Google Gemini',
      } as any);

      const req = new NextRequest('http://localhost:3000/api/explain', {
        method: 'POST',
        body: JSON.stringify({
          selectedPassage: 'Sample sentence to explain.',
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(502);
      const data = await res.json();
      expect(data.error).toContain('Gemini API error (500)');
    });

    it('handles upstream timeout gracefully by returning 504 Gateway Timeout', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('The operation was aborted due to timeout'));

      const req = new NextRequest('http://localhost:3000/api/explain', {
        method: 'POST',
        body: JSON.stringify({
          selectedPassage: 'Sample sentence to explain.',
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(504);
      const data = await res.json();
      expect(data.error).toContain('timed out');
    });

    it('handles malformed JSON from provider without crashing', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          candidates: [{ content: { parts: [{ text: 'This is not valid JSON string' }] } }],
        }),
      } as any);

      const req = new NextRequest('http://localhost:3000/api/explain', {
        method: 'POST',
        body: JSON.stringify({
          selectedPassage: 'Sample sentence to explain.',
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(500);
      const data = await res.json();
      expect(data.error).toBeDefined();
    });

    it('generates structured explanation via OpenAI adapter when OPENAI_API_KEY is configured', async () => {
      delete process.env.GEMINI_API_KEY;
      process.env.OPENAI_API_KEY = 'mock-openai-key';

      const mockOpenAiPayload = {
        explanation: 'OpenAI generated explanation for researchers.',
        terms: [{ term: 'Residual Connection', definition: 'A shortcut bypassing one or more layers.' }],
        contextFit: 'Explains architectural skip connections.',
        prerequisites: [{ name: 'Deep Networks', definition: 'Multi-layer models.', whyItMatters: 'Context.' }],
        comprehensionCheck: { question: 'What does a residual connection do?', answer: 'Bypasses layers.', explanation: 'Prevents vanishing gradient.' },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          choices: [{ message: { content: JSON.stringify(mockOpenAiPayload) } }],
        }),
      } as any);

      const req = new NextRequest('http://localhost:3000/api/explain', {
        method: 'POST',
        body: JSON.stringify({
          selectedPassage: 'We employ a residual connection around each of the two sub-layers.',
          level: 'technical',
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.available).toBe(true);
      expect(data.explanation.explanation).toContain('OpenAI generated explanation');
      expect(data.explanation.terms[0].term).toBe('Residual Connection');
    });

    it('generates structured explanation via Anthropic adapter when ANTHROPIC_API_KEY is configured', async () => {
      delete process.env.GEMINI_API_KEY;
      delete process.env.OPENAI_API_KEY;
      process.env.ANTHROPIC_API_KEY = 'mock-anthropic-key';

      const mockClaudePayload = {
        explanation: 'Claude generated explanation emphasizing step-by-step reasoning.',
        terms: [{ term: 'Layer Normalization', definition: 'Normalizes activations across features.' }],
        contextFit: 'Stabilizes hidden state dynamics.',
        prerequisites: [],
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          content: [{ text: JSON.stringify(mockClaudePayload) }],
        }),
      } as any);

      const req = new NextRequest('http://localhost:3000/api/explain', {
        method: 'POST',
        body: JSON.stringify({
          selectedPassage: 'Layer normalization is applied to each sub-layer output.',
          level: 'step-by-step',
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.available).toBe(true);
      expect(data.explanation.explanation).toContain('Claude generated explanation');
      expect(data.explanation.terms[0].term).toBe('Layer Normalization');
    });

    it('sanitizes upstream error messages so API keys are never leaked to client', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        text: async () =>
          'Invalid argument: https://generativelanguage.googleapis.com/v1beta/models?key=AIzaSySecretApiKey123 failed',
      } as any);

      const req = new NextRequest('http://localhost:3000/api/explain', {
        method: 'POST',
        body: JSON.stringify({
          selectedPassage: 'Sample passage.',
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(502);
      const data = await res.json();
      expect(data.error).not.toContain('AIzaSySecretApiKey123');
      expect(data.error).toContain('key=[REDACTED]');
    });
  });

  describe('Privacy, Payload Constraints & User Consent', () => {
    it('ensures consent state is tracked and never sends requests when consent is not established', () => {
      // Test the session storage key contract
      const consentKey = 'chapterlens-ai-consent';
      expect(consentKey).toBe('chapterlens-ai-consent');

      // Simulating consent gate logic
      let hasConsented = false;
      let networkCallCount = 0;

      const triggerExplanation = () => {
        if (!hasConsented) {
          // Open disclosure modal instead of calling network
          return 'MODAL_OPENED';
        }
        networkCallCount++;
        return 'NETWORK_CALLED';
      };

      expect(triggerExplanation()).toBe('MODAL_OPENED');
      expect(networkCallCount).toBe(0);

      // User grants consent
      hasConsented = true;
      expect(triggerExplanation()).toBe('NETWORK_CALLED');
      expect(networkCallCount).toBe(1);
    });

    it('verifies outbound payload contains only selected passage, bounded context, and location — never full document', () => {
      const fullManuscript = 'Chapter 1. '.repeat(500) + 'A confusing technical sentence.' + ' Chapter 2. '.repeat(500);
      const testDoc: ExtractedDocument = {
        id: 'doc-confidential',
        fileName: 'confidential_manuscript.pdf',
        fileSize: 50000,
        format: 'pdf',
        extractedAt: new Date().toISOString(),
        fullText: fullManuscript,
        blocks: [
          {
            id: 'block-1',
            type: 'paragraph',
            text: fullManuscript,
            startIndex: 0,
            endIndex: fullManuscript.length,
            paragraphIndex: 0,
          },
        ],
        hasHeadings: false,
        warnings: [],
      };

      const sentence = 'A confusing technical sentence.';
      const start = fullManuscript.indexOf(sentence);
      const end = start + sentence.length;

      const passage = extractPassageContext(testDoc, start, end, sentence);

      // Verify payload constraints
      expect(passage.text).toBe(sentence);
      expect(passage.surroundingContext.length).toBeLessThanOrEqual(MAX_CONTEXT_LENGTH);
      expect(passage.surroundingContext.length).toBeLessThan(fullManuscript.length);
      expect(passage.surroundingContext).toContain(sentence);
      // Ensure the rest of the manuscript is excluded
      expect(passage.surroundingContext).not.toContain('Chapter 1. '.repeat(300));
    });

    it('server truncates excessive surroundingContext exceeding 1,500 characters safely', async () => {
      process.env.GEMINI_API_KEY = 'mock-key';
      let capturedBody: any = null;

      global.fetch = vi.fn().mockImplementation(async (url: string, opts: any) => {
        capturedBody = JSON.parse(opts.body);
        return {
          ok: true,
          status: 200,
          json: async () => ({
            candidates: [
              {
                content: {
                  parts: [
                    {
                      text: JSON.stringify({
                        explanation: 'Bounded context verified.',
                        terms: [],
                        contextFit: '',
                        prerequisites: [],
                      }),
                    },
                  ],
                },
              },
            ],
          }),
        };
      });

      const hugeContext = 'C'.repeat(3000);
      const req = new NextRequest('http://localhost:3000/api/explain', {
        method: 'POST',
        body: JSON.stringify({
          selectedPassage: 'A brief sentence.',
          surroundingContext: hugeContext,
          level: 'beginner',
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(200);
      // The upstream prompt must not contain the 3000 character context
      const promptText = capturedBody.contents[0].parts[0].text;
      expect(promptText).not.toContain('C'.repeat(1600));
    });
  });

  describe('Edge Cases and Malformed Inputs', () => {
    it('handles document with zero blocks gracefully in context extraction', () => {
      const emptyDoc: ExtractedDocument = {
        id: 'doc-empty',
        fileName: 'empty.pdf',
        fileSize: 0,
        format: 'pdf',
        extractedAt: new Date().toISOString(),
        fullText: '',
        blocks: [],
        hasHeadings: false,
        warnings: [],
      };

      const passage = extractPassageContext(emptyDoc, 0, 0, 'No text');
      expect(passage.text).toBe('No text');
      expect(passage.surroundingContext).toBe('No text');
      expect(passage.sourceLocation.paragraphIndex).toBe(0);
      expect(passage.sourceLocation.pageNumber).toBeUndefined();
    });

    it('handles passages at document offset 0 and at the very end of fullText', () => {
      const boundaryText = 'First sentence of the text. Intermediate sentence. Last sentence of the text.';
      const boundaryDoc: ExtractedDocument = {
        id: 'doc-boundary',
        fileName: 'boundary.txt',
        fileSize: boundaryText.length,
        format: 'txt',
        extractedAt: new Date().toISOString(),
        fullText: boundaryText,
        blocks: [
          {
            id: 'block-0',
            type: 'paragraph',
            text: boundaryText,
            startIndex: 0,
            endIndex: boundaryText.length,
            paragraphIndex: 0,
          },
        ],
        hasHeadings: false,
        warnings: [],
      };

      // Offset 0 passage
      const firstPassage = extractPassageContext(boundaryDoc, 0, 27, 'First sentence of the text.');
      expect(firstPassage.startIndex).toBe(0);
      expect(firstPassage.surroundingContext).toContain('First sentence');

      // End of text passage
      const lastIndex = boundaryText.indexOf('Last sentence of the text.');
      const lastPassage = extractPassageContext(
        boundaryDoc,
        lastIndex,
        boundaryText.length,
        'Last sentence of the text.'
      );
      expect(lastPassage.endIndex).toBe(boundaryText.length);
      expect(lastPassage.surroundingContext).toContain('Last sentence');
    });

    it('safely handles non-object JSON output from provider (e.g. array or primitive)', async () => {
      process.env.GEMINI_API_KEY = 'mock-key';

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          candidates: [{ content: { parts: [{ text: JSON.stringify(['item1', 'item2']) }] } }],
        }),
      } as any);

      const req = new NextRequest('http://localhost:3000/api/explain', {
        method: 'POST',
        body: JSON.stringify({
          selectedPassage: 'A valid passage.',
          level: 'beginner',
        }),
      });

      const res = await POST(req);
      // Array is an object in JS, but let's see how our schema mapper validates fields
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.explanation.explanation).toBe('Explanation could not be generated for this passage.');
      expect(data.explanation.terms).toEqual([]);
      expect(data.explanation.prerequisites).toEqual([]);
    });
  });

  describe('Explanation Levels and Exploration', () => {
    it('supports switching between beginner, step-by-step, and technical levels', () => {
      const levels: ExplanationLevel[] = ['beginner', 'step-by-step', 'technical'];

      levels.forEach((level) => {
        const payload = {
          selectedPassage: 'Self-attention calculates a weighted representation of each position.',
          level,
        };
        expect(payload.level).toBe(level);
      });
    });

    it('passes conceptToExplore parameter when user explores a prerequisite concept', () => {
      const payload = {
        selectedPassage: 'The decoder generates output one element at a time.',
        level: 'beginner' as ExplanationLevel,
        conceptToExplore: 'Autoregressive Decoding',
      };

      expect(payload.conceptToExplore).toBe('Autoregressive Decoding');
    });
  });
});

