import { NextRequest, NextResponse } from 'next/server';

interface RewriteRequestBody {
  sentence: string;
  consentConfirmed?: boolean;
  context?: string;
  style?: 'clear' | 'concise' | 'literary';
}

function getValidApiKey(key: string | undefined): string | null {
  if (!key) return null;
  const trimmed = key.trim();
  if (
    !trimmed ||
    trimmed === 'replace_with_your_gemini_api_key' ||
    trimmed === 'replace_with_your_openai_api_key' ||
    trimmed === 'replace_with_your_anthropic_api_key' ||
    trimmed.startsWith('replace_with_') ||
    trimmed === 'your_gemini_api_key_here' ||
    trimmed === 'your_openai_api_key_here' ||
    trimmed === 'your_anthropic_api_key_here'
  ) {
    return null;
  }
  return trimmed;
}

/**
 * GET /api/rewrite
 * Reports whether optional AI rewriting is configured in the deployment environment.
 */
export async function GET() {
  const geminiKey = getValidApiKey(process.env.GEMINI_API_KEY);
  const openaiKey = getValidApiKey(process.env.OPENAI_API_KEY);
  const anthropicKey = getValidApiKey(process.env.ANTHROPIC_API_KEY);
  const isConfigured = Boolean(geminiKey || openaiKey || anthropicKey);

  return NextResponse.json({
    available: isConfigured,
    provider: geminiKey
      ? 'Google Gemini'
      : openaiKey
      ? 'OpenAI'
      : anthropicKey
      ? 'Anthropic'
      : null,
    message: isConfigured
      ? 'AI rewriting assistance is configured.'
      : 'AI rewriting is currently disabled. All readability scoring and analysis runs locally and privately in your browser without any external API keys.',
  });
}

/**
 * POST /api/rewrite
 * Rewrites a single difficult sentence using configured LLM provider.
 * Strictly limits payload to the single sentence and verifies explicit user consent.
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as RewriteRequestBody;

    if (!body || typeof body.sentence !== 'string') {
      return NextResponse.json(
        { error: 'Invalid request: "sentence" string is required.' },
        { status: 400 }
      );
    }

    // Strict privacy boundary: explicit user consent is required before any transmission
    if (body.consentConfirmed !== true) {
      return NextResponse.json(
        {
          error:
            'Explicit user consent is required before transmitting manuscript text to an external AI provider.',
        },
        { status: 403 }
      );
    }

    const trimmedSentence = body.sentence.trim();
    if (!trimmedSentence) {
      return NextResponse.json(
        { error: 'Sentence cannot be empty.' },
        { status: 400 }
      );
    }

    // Safety limit: don't accept whole chapters into single sentence rewrite (max 1,200 chars)
    if (trimmedSentence.length > 1200) {
      return NextResponse.json(
        { error: 'Sentence exceeds maximum allowable length of 1,200 characters.' },
        { status: 400 }
      );
    }

    const geminiKey = getValidApiKey(process.env.GEMINI_API_KEY);
    const openaiKey = getValidApiKey(process.env.OPENAI_API_KEY);
    const anthropicKey = getValidApiKey(process.env.ANTHROPIC_API_KEY);

    if (!geminiKey && !openaiKey && !anthropicKey) {
      return NextResponse.json(
        {
          available: false,
          error:
            'No external AI rewriting API key (GEMINI_API_KEY, OPENAI_API_KEY, or ANTHROPIC_API_KEY) is configured on this deployment. ChapterLens operates 100% offline and privately by default.',
        },
        { status: 503 }
      );
    }

    const systemPrompt = `You are a distinguished research copyeditor and linguistic specialist. Your goal is to optimize a difficult, high-friction sentence from a manuscript or scholarly document for clarity and cadence.

Rigorous Editorial Principles:
1. Preserve Meaning & Truth: Retain the author's exact thesis, nuance, tone, and technical precision. Do not oversimplify in a way that distorts meaning or changes scientific facts.
2. Preserve Crucial Elements: Retain all uncertainty qualifications (e.g., "may", "suggests", "estimated"), numerical findings, equations, citations, specialized terminology, and named entities.
3. Eliminate Cognitive Friction: Untangle nested clauses, clarify convoluted pronoun references, and break up excessive modifier stacking.
4. Do Not Optimize Blindly for Flesch: Readability must not sacrifice conceptual accuracy.

Output Format:
Return a JSON object with:
- "options": An array containing exactly 2 string revisions:
  - Option A (Direct & Clear): Emphasizes direct syntactic structure and immediate readability.
  - Option B (Rhythmic & Cadenced): Emphasizes natural cadence and balanced clauses for effortless reading.
- "rationale": A concise sentence explaining what syntactic friction was relieved.
- "preservedElements": A short string summarizing key terminology, qualifiers, or citations preserved.`;

    const userPrompt = `${systemPrompt}\n\nOriginal Sentence to simplify:\n"${trimmedSentence}"\n\nReturn JSON only.`;

    const cleanJsonResponse = (text: string) => {
      const trimmed = text.trim();
      const codeBlockMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      return codeBlockMatch ? codeBlockMatch[1] : trimmed;
    };

    const safeParseJson = (text: string) => {
      try {
        return JSON.parse(cleanJsonResponse(text));
      } catch {
        return null;
      }
    };

    const sanitizeErrorMessage = (msg: string): string => {
      if (!msg) return 'An error occurred while communicating with the AI service.';
      return msg
        .replace(/key=[a-zA-Z0-9_\-]+/gi, 'key=[REDACTED]')
        .replace(/Bearer\s+[a-zA-Z0-9_\-]+/gi, 'Bearer [REDACTED]')
        .replace(/x-api-key['"]?\s*[:=]\s*['"]?[a-zA-Z0-9_\-]+/gi, 'x-api-key: [REDACTED]');
    };

    const parseUpstreamError = async (response: Response, provider: string): Promise<string> => {
      let detail = '';
      try {
        const json = await response.json();
        detail = json?.error?.message || json?.message || '';
      } catch {
        try {
          detail = await response.text();
        } catch {}
      }
      const sanitized = sanitizeErrorMessage(detail).slice(0, 250);
      return `${provider} API error (${response.status}): ${sanitized || 'Upstream request failed.'}`;
    };

    // 1. Google Gemini
    if (geminiKey) {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: AbortSignal.timeout(15000),
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [{ text: userPrompt }],
              },
            ],
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0.3,
            },
          }),
        }
      );

      if (!response.ok) {
        if (response.status === 429) {
          return NextResponse.json(
            { error: 'AI rewriting rate limit exceeded. Please wait a moment.' },
            { status: 429 }
          );
        }
        const errorText = await parseUpstreamError(response, 'Gemini');
        return NextResponse.json(
          { error: errorText },
          { status: 502 }
        );
      }

      const data = await response.json();
      const rawOutput = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (rawOutput) {
        const parsed = safeParseJson(rawOutput);
        if (parsed) {
          return NextResponse.json({
            available: true,
            suggestions: parsed.options || (parsed.suggestion ? [parsed.suggestion] : []),
            rationale: parsed.rationale || 'Simplified clause structure.',
            preservedElements: parsed.preservedElements || null,
          });
        }
      }
    }

    // 2. OpenAI
    if (openaiKey) {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openaiKey}`,
        },
        signal: AbortSignal.timeout(15000),
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Original sentence to simplify:\n"${trimmedSentence}"` },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.3,
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          return NextResponse.json(
            { error: 'OpenAI rate limit exceeded. Please try again shortly.' },
            { status: 429 }
          );
        }
        const errText = await parseUpstreamError(response, 'OpenAI');
        return NextResponse.json(
          { error: errText },
          { status: 502 }
        );
      }

      const data = await response.json();
      const rawOutput = data.choices?.[0]?.message?.content;
      if (rawOutput) {
        const parsed = safeParseJson(rawOutput);
        if (parsed) {
          return NextResponse.json({
            available: true,
            suggestions: parsed.options || (parsed.suggestion ? [parsed.suggestion] : []),
            rationale: parsed.rationale || 'Reduced sentence complexity.',
            preservedElements: parsed.preservedElements || null,
          });
        }
      }
    }

    // 3. Anthropic
    if (anthropicKey) {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': anthropicKey,
          'anthropic-version': '2023-06-01',
        },
        signal: AbortSignal.timeout(15000),
        body: JSON.stringify({
          model: 'claude-3-5-haiku-20241022',
          max_tokens: 600,
          system: systemPrompt,
          messages: [
            {
              role: 'user',
              content: `Original sentence to simplify:\n"${trimmedSentence}"\n\nReturn pure JSON only.`,
            },
          ],
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          return NextResponse.json(
            { error: 'Anthropic rate limit exceeded. Please try again shortly.' },
            { status: 429 }
          );
        }
        const errText = await parseUpstreamError(response, 'Anthropic');
        return NextResponse.json(
          { error: errText },
          { status: 502 }
        );
      }

      const data = await response.json();
      const rawOutput = data.content?.[0]?.text;
      if (rawOutput) {
        const parsed = safeParseJson(rawOutput);
        if (parsed) {
          return NextResponse.json({
            available: true,
            suggestions: parsed.options || (parsed.suggestion ? [parsed.suggestion] : []),
            rationale: parsed.rationale || 'Reduced sentence complexity.',
            preservedElements: parsed.preservedElements || null,
          });
        }
      }
    }

    return NextResponse.json(
      { error: 'Unexpected response from rewriting service.' },
      { status: 500 }
    );
  } catch (error: any) {
    if (error?.name === 'TimeoutError' || error?.message?.includes('timeout')) {
      return NextResponse.json(
        { error: 'AI rewriting service timed out after 15 seconds. Please try again.' },
        { status: 504 }
      );
    }
    const safeError = (error?.message || 'Internal server error while processing rewrite.')
      .replace(/key=[a-zA-Z0-9_\-]+/gi, 'key=[REDACTED]')
      .replace(/Bearer\s+[a-zA-Z0-9_\-]+/gi, 'Bearer [REDACTED]')
      .replace(/x-api-key['"]?\s*[:=]\s*['"]?[a-zA-Z0-9_\-]+/gi, 'x-api-key: [REDACTED]');
    return NextResponse.json(
      { error: safeError },
      { status: 500 }
    );
  }
}
