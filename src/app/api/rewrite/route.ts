import { NextRequest, NextResponse } from 'next/server';

interface RewriteRequestBody {
  sentence: string;
  context?: string;
  style?: 'clear' | 'concise' | 'literary';
}

/**
 * GET /api/rewrite
 * Reports whether optional AI rewriting is configured in the deployment environment.
 */
export async function GET() {
  const isConfigured = Boolean(
    process.env.GEMINI_API_KEY ||
    process.env.OPENAI_API_KEY ||
    process.env.ANTHROPIC_API_KEY
  );

  return NextResponse.json({
    available: isConfigured,
    provider: process.env.GEMINI_API_KEY
      ? 'Google Gemini'
      : process.env.OPENAI_API_KEY
      ? 'OpenAI'
      : process.env.ANTHROPIC_API_KEY
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
 * Strictly limits payload to the single sentence to preserve user privacy.
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

    const trimmedSentence = body.sentence.trim();
    if (!trimmedSentence) {
      return NextResponse.json(
        { error: 'Sentence cannot be empty.' },
        { status: 400 }
      );
    }

    // Safety limit: don't accept whole chapters into single sentence rewrite
    if (trimmedSentence.length > 1200) {
      return NextResponse.json(
        { error: 'Sentence exceeds maximum allowable length of 1,200 characters.' },
        { status: 400 }
      );
    }

    const geminiKey = process.env.GEMINI_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;
    const anthropicKey = process.env.ANTHROPIC_API_KEY;

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

    const systemPrompt = `You are an expert literary copyeditor. Your mission is to provide 2 distinct, simplified alternatives to a difficult sentence from a manuscript.
Rules:
1. Maintain the author's exact voice, point of view (1st/3rd person), tense, character names, and core meaning.
2. Reduce cognitive load by untangling complex clauses or reducing polysyllabic density.
3. Never invent new plot details or alter emotional tone.
4. Return exactly two options: Option A (Direct and Clear) and Option B (Rhythmic and Cadenced).
Output format: JSON object with keys "options" (array of 2 strings) and "rationale" (string explaining what friction was reduced).`;

    const userPrompt = `${systemPrompt}\n\nOriginal Sentence to simplify:\n"${trimmedSentence}"\n\nReturn JSON only.`;

    const cleanJsonResponse = (text: string) => {
      const trimmed = text.trim();
      const codeBlockMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      return codeBlockMatch ? codeBlockMatch[1] : trimmed;
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
        const errorText = await response.text();
        return NextResponse.json(
          { error: `Gemini API error (${response.status}): ${errorText}` },
          { status: 502 }
        );
      }

      const data = await response.json();
      const rawOutput = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (rawOutput) {
        const parsed = JSON.parse(cleanJsonResponse(rawOutput));
        return NextResponse.json({
          available: true,
          suggestions: parsed.options || (parsed.suggestion ? [parsed.suggestion] : []),
          rationale: parsed.rationale || 'Simplified clause structure.',
        });
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
        const errText = await response.text();
        return NextResponse.json(
          { error: `OpenAI API error (${response.status}): ${errText}` },
          { status: 502 }
        );
      }

      const data = await response.json();
      const rawOutput = data.choices?.[0]?.message?.content;
      if (rawOutput) {
        const parsed = JSON.parse(cleanJsonResponse(rawOutput));
        return NextResponse.json({
          available: true,
          suggestions: parsed.options || (parsed.suggestion ? [parsed.suggestion] : []),
          rationale: parsed.rationale || 'Reduced sentence complexity.',
        });
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
        const errText = await response.text();
        return NextResponse.json(
          { error: `Anthropic API error (${response.status}): ${errText}` },
          { status: 502 }
        );
      }

      const data = await response.json();
      const rawOutput = data.content?.[0]?.text;
      if (rawOutput) {
        const parsed = JSON.parse(cleanJsonResponse(rawOutput));
        return NextResponse.json({
          available: true,
          suggestions: parsed.options || (parsed.suggestion ? [parsed.suggestion] : []),
          rationale: parsed.rationale || 'Reduced sentence complexity.',
        });
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
    return NextResponse.json(
      { error: error?.message || 'Internal server error while processing rewrite.' },
      { status: 500 }
    );
  }
}
