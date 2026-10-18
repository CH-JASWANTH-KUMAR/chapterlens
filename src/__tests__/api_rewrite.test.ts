import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GET, POST } from '../app/api/rewrite/route';
import { NextRequest } from 'next/server';

describe('Rewrite API Route (/api/rewrite)', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
    delete process.env.GEMINI_API_KEY;
    delete process.env.OPENAI_API_KEY;
    delete process.env.ANTHROPIC_API_KEY;
  });

  it('GET /api/rewrite reports unavailable when no API keys are configured', async () => {
    const res = await GET();
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.available).toBe(false);
    expect(data.message).toContain('locally and privately in your browser');
  });

  it('GET /api/rewrite treats placeholder keys as unconfigured', async () => {
    process.env.GEMINI_API_KEY = 'replace_with_your_gemini_api_key';
    const res = await GET();
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.available).toBe(false);
  });

  it('GET /api/rewrite reports provider when GEMINI_API_KEY is configured with default model', async () => {
    process.env.GEMINI_API_KEY = 'test-gemini-key';
    delete process.env.GEMINI_MODEL;
    const res = await GET();
    const data = await res.json();
    expect(data.available).toBe(true);
    expect(data.provider).toBe('Google Gemini');
    expect(data.model).toBe('gemini-3.8-flash');
  });

  it('GET /api/rewrite respects GEMINI_MODEL override', async () => {
    process.env.GEMINI_API_KEY = 'test-gemini-key';
    process.env.GEMINI_MODEL = 'gemini-custom-flash';
    const res = await GET();
    const data = await res.json();
    expect(data.available).toBe(true);
    expect(data.provider).toBe('Google Gemini');
    expect(data.model).toBe('gemini-custom-flash');
  });

  it('GET /api/rewrite reports OpenAI provider when OPENAI_API_KEY is configured', async () => {
    process.env.OPENAI_API_KEY = 'test-openai-key';
    const res = await GET();
    const data = await res.json();
    expect(data.available).toBe(true);
    expect(data.provider).toBe('OpenAI');
  });

  it('GET /api/rewrite reports Anthropic provider when ANTHROPIC_API_KEY is configured', async () => {
    process.env.ANTHROPIC_API_KEY = 'test-anthropic-key';
    const res = await GET();
    const data = await res.json();
    expect(data.available).toBe(true);
    expect(data.provider).toBe('Anthropic');
  });

  it('POST /api/rewrite validates missing sentence payload', async () => {
    const req = new NextRequest('http://localhost:3000/api/rewrite', {
      method: 'POST',
      body: JSON.stringify({}),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain('Invalid request');
  });

  it('POST /api/rewrite strictly enforces explicit user consent before external transmission', async () => {
    const req = new NextRequest('http://localhost:3000/api/rewrite', {
      method: 'POST',
      body: JSON.stringify({
        sentence: 'A complex technical hypothesis requires verification.',
        consentConfirmed: false,
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(403);
    const data = await res.json();
    expect(data.error).toContain('Explicit user consent is required');
  });

  it('POST /api/rewrite rejects request when consentConfirmed is omitted', async () => {
    const req = new NextRequest('http://localhost:3000/api/rewrite', {
      method: 'POST',
      body: JSON.stringify({
        sentence: 'A complex technical hypothesis requires verification.',
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(403);
    const data = await res.json();
    expect(data.error).toContain('Explicit user consent is required');
  });

  it('POST /api/rewrite rejects sentence exceeding character limit', async () => {
    const longSentence = 'A'.repeat(1300);
    const req = new NextRequest('http://localhost:3000/api/rewrite', {
      method: 'POST',
      body: JSON.stringify({ sentence: longSentence, consentConfirmed: true }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain('maximum allowable length');
  });

  it('POST /api/rewrite returns 503 when no rewriting service is configured in deployment', async () => {
    const fetchSpy = vi.fn();
    global.fetch = fetchSpy;
    const req = new NextRequest('http://localhost:3000/api/rewrite', {
      method: 'POST',
      body: JSON.stringify({
        sentence: 'The escapement clicked in the dark workshop.',
        consentConfirmed: true,
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(503);
    const data = await res.json();
    expect(data.available).toBe(false);
    expect(data.error).toContain('No external AI rewriting API key');
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('POST /api/rewrite returns 503 when GEMINI_API_KEY is only a placeholder', async () => {
    process.env.GEMINI_API_KEY = 'replace_with_your_gemini_api_key';
    const fetchSpy = vi.fn();
    global.fetch = fetchSpy;
    const req = new NextRequest('http://localhost:3000/api/rewrite', {
      method: 'POST',
      body: JSON.stringify({
        sentence: 'The escapement clicked in the dark workshop.',
        consentConfirmed: true,
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(503);
    const data = await res.json();
    expect(data.available).toBe(false);
    expect(data.error).toContain('No external AI rewriting API key');
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('POST /api/rewrite rejects alternative placeholder formats without invoking fetch', async () => {
    for (const placeholder of ['your_gemini_api_key_here', 'replace_with_something', '   ']) {
      process.env.GEMINI_API_KEY = placeholder;
      const fetchSpy = vi.fn();
      global.fetch = fetchSpy;
      const req = new NextRequest('http://localhost:3000/api/rewrite', {
        method: 'POST',
        body: JSON.stringify({
          sentence: 'The escapement clicked in the dark workshop.',
          consentConfirmed: true,
        }),
      });
      const res = await POST(req);
      expect(res.status).toBe(503);
      const data = await res.json();
      expect(data.available).toBe(false);
      expect(fetchSpy).not.toHaveBeenCalled();
    }
  });

  describe('Mocked Gemini Provider Execution', () => {
    const originalFetch = global.fetch;

    afterEach(() => {
      global.fetch = originalFetch;
    });

    it('generates simplified variations using default model gemini-3.8-flash', async () => {
      process.env.GEMINI_API_KEY = 'mock-gemini-key';
      delete process.env.GEMINI_MODEL;

      const mockResponse = {
        candidates: [
          {
            content: {
              parts: [
                {
                  text: JSON.stringify({
                    options: [
                      'The workshop was dark, and the escapement clicked quietly.',
                      'In the darkened workshop, the escapement clicked.'
                    ],
                    rationale: 'Untangled clause structure.',
                    preservedElements: ['escapement', 'workshop']
                  })
                }
              ]
            }
          }
        ]
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      } as any);

      const req = new NextRequest('http://localhost:3000/api/rewrite', {
        method: 'POST',
        body: JSON.stringify({
          sentence: 'The escapement clicked in the dark workshop.',
          consentConfirmed: true,
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(200);
      const data = await res.json();

      expect(data.available).toBe(true);
      expect(data.suggestions.length).toBe(2);
      expect(data.suggestions[0]).toContain('The workshop was dark');
      expect(global.fetch).toHaveBeenCalledTimes(1);
      const [calledUrl, calledOptions] = (global.fetch as any).mock.calls[0];
      expect(calledUrl).toBe(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent'
      );
      expect(calledUrl).not.toContain('?key=');
      expect(calledUrl).not.toContain('mock-gemini-key');
      expect(calledOptions.headers).toHaveProperty('x-goog-api-key', 'mock-gemini-key');
      expect(calledOptions.headers['Content-Type']).toBe('application/json');
      expect(JSON.stringify(data)).not.toContain('mock-gemini-key');
    });

    it('uses GEMINI_MODEL override in generateContent URL when provided', async () => {
      process.env.GEMINI_API_KEY = 'mock-gemini-key';
      process.env.GEMINI_MODEL = 'gemini-custom-model';

      const mockResponse = {
        candidates: [
          {
            content: {
              parts: [
                {
                  text: JSON.stringify({
                    options: ['Simplified sentence.'],
                    rationale: 'Simplified.',
                    preservedElements: []
                  })
                }
              ]
            }
          }
        ]
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      } as any);

      const req = new NextRequest('http://localhost:3000/api/rewrite', {
        method: 'POST',
        body: JSON.stringify({
          sentence: 'The escapement clicked in the dark workshop.',
          consentConfirmed: true,
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(200);
      expect(global.fetch).toHaveBeenCalledTimes(1);
      const [calledUrl, calledOptions] = (global.fetch as any).mock.calls[0];
      expect(calledUrl).toBe(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-custom-model:generateContent'
      );
      expect(calledUrl).not.toContain('?key=');
      expect(calledUrl).not.toContain('mock-gemini-key');
      expect(calledOptions.headers).toHaveProperty('x-goog-api-key', 'mock-gemini-key');
    });

    it('handles Gemini 429 rate limit safely', async () => {
      process.env.GEMINI_API_KEY = 'mock-gemini-key';

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 429,
        json: async () => ({ error: { message: 'Quota exceeded' } }),
      } as any);

      const req = new NextRequest('http://localhost:3000/api/rewrite', {
        method: 'POST',
        body: JSON.stringify({
          sentence: 'The escapement clicked in the dark workshop.',
          consentConfirmed: true,
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(429);
      const data = await res.json();
      expect(data.error).toContain('rate limit exceeded');
    });

    it('sanitizes upstream error messages containing keys and x-goog-api-key', async () => {
      process.env.GEMINI_API_KEY = 'mock-gemini-key';

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        text: async () =>
          'Gemini error: https://generativelanguage.googleapis.com/models?key=AIzaSecretKey123 with x-goog-api-key: secret-header-key and raw mock-gemini-key',
      } as any);

      const req = new NextRequest('http://localhost:3000/api/rewrite', {
        method: 'POST',
        body: JSON.stringify({
          sentence: 'The escapement clicked in the dark workshop.',
          consentConfirmed: true,
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(502);
      const data = await res.json();
      expect(data.error).not.toContain('AIzaSecretKey123');
      expect(data.error).not.toContain('secret-header-key');
      expect(data.error).not.toContain('mock-gemini-key');
      expect(data.error).toContain('key=[REDACTED]');
      expect(data.error).toContain('x-goog-api-key: [REDACTED]');
    });

    it('sanitizes unhandled internal errors so API keys never leak in 500 response', async () => {
      process.env.GEMINI_API_KEY = 'mock-gemini-key';

      global.fetch = vi.fn().mockImplementation(() => {
        throw new Error('Connection failed while setting x-goog-api-key: mock-gemini-key');
      });

      const req = new NextRequest('http://localhost:3000/api/rewrite', {
        method: 'POST',
        body: JSON.stringify({
          sentence: 'The escapement clicked in the dark workshop.',
          consentConfirmed: true,
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(500);
      const data = await res.json();
      expect(data.error).not.toContain('mock-gemini-key');
      expect(data.error).toContain('x-goog-api-key: [REDACTED]');
    });

    it('proves request URL never contains API key and x-goog-api-key receives configured key without leaking to client', async () => {
      process.env.GEMINI_API_KEY = 'super-secret-gemini-key-777';
      let capturedUrl = '';
      let capturedOptions: any = null;

      global.fetch = vi.fn().mockImplementation(async (url: string, opts: any) => {
        capturedUrl = url;
        capturedOptions = opts;
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
                        options: ['Revised sentence.'],
                        rationale: 'Simplified syntax.',
                        preservedElements: ['key'],
                      }),
                    },
                  ],
                },
              },
            ],
          }),
        };
      });

      const req = new NextRequest('http://localhost:3000/api/rewrite', {
        method: 'POST',
        body: JSON.stringify({
          sentence: 'The escapement clicked in the dark workshop.',
          consentConfirmed: true,
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(200);
      const data = await res.json();

      // Proves URL never contains API key
      expect(capturedUrl).not.toContain('super-secret-gemini-key-777');
      expect(capturedUrl).not.toContain('?key=');
      expect(capturedUrl).not.toContain('key=');
      expect(capturedUrl).toBe(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent'
      );

      // Proves x-goog-api-key header receives the configured key
      expect(capturedOptions.headers['x-goog-api-key']).toBe('super-secret-gemini-key-777');
      expect(capturedOptions.headers['Content-Type']).toBe('application/json');

      // Proves API key never appears in client response
      const serializedResponse = JSON.stringify(data);
      expect(serializedResponse).not.toContain('super-secret-gemini-key-777');
    });

    it('blocks mixed-content figure selections with 422 MIXED_CONTENT_WARNING when unreviewed', async () => {
      process.env.GEMINI_API_KEY = 'mock-gemini-key';
      const fetchSpy = vi.fn();
      global.fetch = fetchSpy;

      const contaminatedPassage =
        'Figure 2: Comparison of Adam with SFO. 0 20 40 60 80 100 10^-1 10^-2 Adam AdaGrad RMSProp SGD SFO Figure 3: Convolutional networks on CIFAR-10.';

      const req = new NextRequest('http://localhost:3000/api/rewrite', {
        method: 'POST',
        body: JSON.stringify({
          sentence: contaminatedPassage,
          consentConfirmed: true,
          // reviewedMixedContent is omitted / false
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(422);
      const data = await res.json();
      expect(data.code).toBe('MIXED_CONTENT_WARNING');
      expect(data.extractionQuality.isMixedContent).toBe(true);
      expect(data.extractionQuality.signals.multipleCaptions).toBe(true);
      // Upstream provider must never be invoked for unreviewed contaminated selection
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it('allows mixed-content figure selection to proceed to provider when reviewedMixedContent is true', async () => {
      process.env.GEMINI_API_KEY = 'mock-gemini-key';

      const mockResponse = {
        candidates: [
          {
            content: {
              parts: [
                {
                  text: JSON.stringify({
                    options: ['Carefully bounded single figure description.'],
                    rationale: 'Isolated to verified claim.',
                    preservedElements: ['CIFAR-10'],
                  }),
                },
              ],
            },
          },
        ],
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      } as any);

      const contaminatedPassage =
        'Figure 2: Comparison of Adam with SFO. 0 20 40 60 80 100 10^-1 10^-2 Adam AdaGrad RMSProp SGD SFO Figure 3: Convolutional networks on CIFAR-10.';

      const req = new NextRequest('http://localhost:3000/api/rewrite', {
        method: 'POST',
        body: JSON.stringify({
          sentence: contaminatedPassage,
          consentConfirmed: true,
          reviewedMixedContent: true, // User reviewed and confirmed
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.available).toBe(true);
      expect(data.suggestions).toHaveLength(1);
      expect(global.fetch).toHaveBeenCalledTimes(1);

      // Verify that the prompt sent to provider includes strict figure grounding rules
      const [, callOpts] = (global.fetch as any).mock.calls[0];
      const requestPayload = JSON.parse(callOpts.body);
      const promptText = requestPayload.contents[0].parts[0].text;
      expect(promptText).toContain('Never merge information from different figures');
      expect(promptText).toContain('CONTAMINATED_SOURCE');
    });

    it('handles CONTAMINATED_SOURCE refusal warning returned by provider safely', async () => {
      process.env.GEMINI_API_KEY = 'mock-gemini-key';

      const mockResponse = {
        candidates: [
          {
            content: {
              parts: [
                {
                  text: JSON.stringify({
                    warning: 'CONTAMINATED_SOURCE',
                    rationale:
                      'The text conflates Figure 2 SFO optimizer comparisons with Figure 3 CIFAR-10 ConvNet experiments and cannot be safely rewritten.',
                  }),
                },
              ],
            },
          },
        ],
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      } as any);

      const req = new NextRequest('http://localhost:3000/api/rewrite', {
        method: 'POST',
        body: JSON.stringify({
          sentence: 'Figure 2: SFO vs Adam. 0 20 40 Figure 3: CIFAR-10.',
          consentConfirmed: true,
          reviewedMixedContent: true,
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.warning).toBe('CONTAMINATED_SOURCE');
      expect(data.suggestions).toHaveLength(0);
      expect(data.rationale).toContain('conflates Figure 2 SFO optimizer comparisons');
    });
  });
});
