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
  });

  it('POST /api/rewrite returns 503 when GEMINI_API_KEY is only a placeholder', async () => {
    process.env.GEMINI_API_KEY = 'replace_with_your_gemini_api_key';
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
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('models/gemini-3.8-flash:generateContent?key=mock-gemini-key'),
        expect.anything()
      );
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
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('models/gemini-custom-model:generateContent?key=mock-gemini-key'),
        expect.anything()
      );
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
  });
});
