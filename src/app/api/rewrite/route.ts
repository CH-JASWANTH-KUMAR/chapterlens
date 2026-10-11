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

    if (!geminiKey && !openaiKey) {
      return NextResponse.json(
        {
          available: false,
          error:
            'No external AI rewriting API key (GEMINI_API_KEY or OPENAI_API_KEY) is configured on this deployment. ChapterLens operates 100% offline and privately by default.',
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
Output format: JSON object with keys "options" (array of strings) and "rationale" (string explaining what friction was reduced).`;

    if (geminiKey) {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [
                  {
                    text: `${systemPrompt}\n\nOriginal Sentence to simplify:\n"${trimmedSentence}"\n\nReturn JSON only.`,
                  },
                ],
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
        const errorText = await response.text();
        return NextResponse.json(
          { error: `Gemini API error (${response.status}): ${errorText}` },
          { status: 502 }
        );
      }

      const data = await response.json();
      const rawOutput = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (rawOutput) {
        const parsed = JSON.parse(rawOutput);
        return NextResponse.json({
          available: true,
          suggestions: parsed.options || [parsed.suggestion],
          rationale: parsed.rationale,
        });
      }
    }

    return NextResponse.json(
      { error: 'Unexpected response from rewriting service.' },
      { status: 500 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Internal server error while processing rewrite.' },
      { status: 500 }
    );
  }
}
