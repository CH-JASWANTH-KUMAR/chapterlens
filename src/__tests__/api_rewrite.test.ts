import { describe, it, expect, vi, beforeEach } from 'vitest';
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

  it('GET /api/rewrite reports provider when GEMINI_API_KEY is configured', async () => {
    process.env.GEMINI_API_KEY = 'test-gemini-key';
    const res = await GET();
    const data = await res.json();
    expect(data.available).toBe(true);
    expect(data.provider).toBe('Google Gemini');
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

  it('POST /api/rewrite rejects sentence exceeding character limit', async () => {
    const longSentence = 'A'.repeat(1300);
    const req = new NextRequest('http://localhost:3000/api/rewrite', {
      method: 'POST',
      body: JSON.stringify({ sentence: longSentence }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain('maximum allowable length');
  });

  it('POST /api/rewrite returns 503 when no rewriting service is configured in deployment', async () => {
    const req = new NextRequest('http://localhost:3000/api/rewrite', {
      method: 'POST',
      body: JSON.stringify({ sentence: 'The escapement clicked in the dark workshop.' }),
    });
    const res = await POST(req);
    expect(res.status).toBe(503);
    const data = await res.json();
    expect(data.available).toBe(false);
    expect(data.error).toContain('No external AI rewriting API key');
  });
});
