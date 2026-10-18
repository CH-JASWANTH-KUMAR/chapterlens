import { NextRequest, NextResponse } from 'next/server';
import { ExplainRequestPayload, PassageExplanation, ExplanationLevel } from '@/lib/reading/types';

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

const DEFAULT_GEMINI_MODEL = 'gemini-3.8-flash';

/**
 * GET /api/explain
 * Reports whether the AI explanation provider is configured in the environment.
 */
export async function GET() {
  const geminiKey = getValidApiKey(process.env.GEMINI_API_KEY);
  const openaiKey = getValidApiKey(process.env.OPENAI_API_KEY);
  const anthropicKey = getValidApiKey(process.env.ANTHROPIC_API_KEY);
  const isConfigured = Boolean(geminiKey || openaiKey || anthropicKey);
  const geminiModel = process.env.GEMINI_MODEL?.trim() || DEFAULT_GEMINI_MODEL;

  return NextResponse.json({
    available: isConfigured,
    provider: geminiKey
      ? 'Google Gemini'
      : openaiKey
      ? 'OpenAI'
      : anthropicKey
      ? 'Anthropic'
      : null,
    model: geminiKey
      ? geminiModel
      : openaiKey
      ? 'gpt-4o-mini'
      : anthropicKey
      ? 'claude-3-5-haiku-20241022'
      : null,
    message: isConfigured
      ? 'AI guided reading assistant is configured.'
      : 'AI explanations are currently disabled because no API key is configured. You can still read manuscripts and inspect local readability metrics without external services.',
  });
}

/**
 * POST /api/explain
 * Generates a source-grounded explanation of a selected research paper passage
 * at Beginner, Step-by-Step, or Technical comprehension levels.
 */
export async function POST(req: NextRequest) {
  const geminiKey = getValidApiKey(process.env.GEMINI_API_KEY);
  const openaiKey = getValidApiKey(process.env.OPENAI_API_KEY);
  const anthropicKey = getValidApiKey(process.env.ANTHROPIC_API_KEY);

  const sanitizeErrorMessage = (msg: string): string => {
    if (!msg) return 'An error occurred while communicating with the AI service.';
    let sanitized = msg
      .replace(/key=[a-zA-Z0-9_\-]+/gi, 'key=[REDACTED]')
      .replace(/Bearer\s+[a-zA-Z0-9_\-]+/gi, 'Bearer [REDACTED]')
      .replace(/x-goog-api-key['"]?\s*[:=]\s*['"]?[a-zA-Z0-9_\-]+/gi, 'x-goog-api-key: [REDACTED]')
      .replace(/x-api-key['"]?\s*[:=]\s*['"]?[a-zA-Z0-9_\-]+/gi, 'x-api-key: [REDACTED]');
    if (geminiKey && geminiKey.length > 3) {
      sanitized = sanitized.replaceAll(geminiKey, '[REDACTED]');
    }
    if (openaiKey && openaiKey.length > 3) {
      sanitized = sanitized.replaceAll(openaiKey, '[REDACTED]');
    }
    if (anthropicKey && anthropicKey.length > 3) {
      sanitized = sanitized.replaceAll(anthropicKey, '[REDACTED]');
    }
    return sanitized;
  };

  try {
    const body = (await req.json()) as ExplainRequestPayload;

    if (!body || typeof body.selectedPassage !== 'string') {
      return NextResponse.json(
        { error: 'Invalid request: "selectedPassage" string is required.' },
        { status: 400 }
      );
    }

    const passage = body.selectedPassage.trim();
    if (!passage) {
      return NextResponse.json(
        { error: 'Selected passage cannot be empty.' },
        { status: 400 }
      );
    }

    // Safety limit: Don't accept huge blocks as a single passage
    if (passage.length > 800) {
      return NextResponse.json(
        { error: 'Selected passage exceeds maximum limit of 800 characters. Please select a specific sentence or paragraph.' },
        { status: 400 }
      );
    }

    // Context limit: Never accept more than 1500 chars of surrounding context
    const rawContext = typeof body.surroundingContext === 'string' ? body.surroundingContext.trim() : '';
    const surroundingContext = rawContext.slice(0, 1500);

    const level: ExplanationLevel =
      body.level === 'technical' || body.level === 'step-by-step'
        ? body.level
        : 'beginner';

    const conceptToExplore = typeof body.conceptToExplore === 'string' ? body.conceptToExplore.trim() : undefined;

    if (!geminiKey && !openaiKey && !anthropicKey) {
      return NextResponse.json(
        {
          available: false,
          error:
            'No AI explanation API key (GEMINI_API_KEY, OPENAI_API_KEY, or ANTHROPIC_API_KEY) is configured on this deployment. ChapterLens operates locally and privately by default.',
        },
        { status: 503 }
      );
    }

    const systemPrompt = `You are a scholarly reading mentor helping a student understand a challenging research paper.
Your goal is to explain a specific passage clearly, truthfully, and without hallucination.

Rules for Grounding & Truthfulness:
1. Ground your explanation strictly in the provided passage and immediate context. Distinguish between what the paper specifically claims and general domain background knowledge.
2. DO NOT fabricate citations, formulas, page numbers, experimental data, or author intentions.
3. If an equation, diagram, or vital context is missing from the extracted text, explicitly state this limitation in "limitationsNotice".
4. Do not merely paraphrase the sentence. Explain the actual concept, its purpose in this section, and how the terms connect.
5. Strict Figure & Boundary Integrity: Never merge claims or experimental conditions from different figures or chart axis labels unless the paper explicitly connects them in prose.

Tailor the explanation to the requested level: "${level}":
- "beginner": Use clear, everyday analogies. Avoid jargon where possible. If technical terms are unavoidable, define them plainly.
- "step-by-step": Break down the passage into its logical constituents. Walk through premise -> mechanism -> conclusion.
- "technical": Provide rigorous mathematical/methodological explanations, underlying assumptions, and formal definitions supported by the text.

If "conceptToExplore" is provided ("${conceptToExplore || 'none'}"), focus the explanation primarily on illuminating that specific prerequisite concept in the context of this passage.

Output Format: Pure JSON with the following schema:
{
  "explanation": "Clear explanation matching the requested level",
  "terms": [
    { "term": "Technical Term", "definition": "Concise, plain-language definition" }
  ],
  "contextFit": "Brief 1-2 sentence description of how this passage relates to the surrounding paragraph/section",
  "prerequisites": [
    { "name": "Concept Name", "definition": "Beginner definition", "whyItMatters": "Why reader needs this to understand the passage" }
  ],
  "comprehensionCheck": {
    "question": "A focused single question testing understanding of this passage",
    "answer": "Concise correct answer",
    "explanation": "Brief explanation of why this answer is correct"
  },
  "limitationsNotice": "Any limitation if extracted text lacks surrounding context, figures, or equations (or empty string if sufficient)"
}`;

    const userPrompt = `${systemPrompt}

Document Context:
---
${surroundingContext || passage}
---

Target Passage to Explain:
"${passage}"

Source Location:
${body.sourceLocation ? JSON.stringify(body.sourceLocation) : 'In-document'}

Requested Comprehension Level: ${level}
${conceptToExplore ? `Specific Concept to Explore: "${conceptToExplore}"` : ''}

Respond with pure JSON matching the requested schema.`;

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

    let parsedResult: any = null;

    // 1. Google Gemini
    if (geminiKey) {
      const geminiModel = process.env.GEMINI_MODEL?.trim() || DEFAULT_GEMINI_MODEL;
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(geminiModel)}:generateContent`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': geminiKey,
          },
          signal: AbortSignal.timeout(15000),
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0.2,
            },
          }),
        }
      );

      if (!response.ok) {
        if (response.status === 429) {
          return NextResponse.json(
            { error: 'AI explanation rate limit exceeded. Please wait a moment.' },
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
        parsedResult = safeParseJson(rawOutput);
      }
    }

    // 2. OpenAI
    else if (openaiKey) {
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
            { role: 'user', content: userPrompt },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.2,
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
        parsedResult = safeParseJson(rawOutput);
      }
    }

    // 3. Anthropic
    else if (anthropicKey) {
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
          max_tokens: 1000,
          system: systemPrompt,
          messages: [{ role: 'user', content: userPrompt }],
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
        parsedResult = safeParseJson(rawOutput);
      }
    }

    if (!parsedResult || typeof parsedResult !== 'object') {
      return NextResponse.json(
        { error: 'Unable to parse AI explanation response.' },
        { status: 500 }
      );
    }

    const explanationResponse: PassageExplanation = {
      passage,
      level,
      explanation: typeof parsedResult.explanation === 'string' && parsedResult.explanation.trim()
        ? parsedResult.explanation.trim()
        : 'Explanation could not be generated for this passage.',
      terms: Array.isArray(parsedResult.terms)
        ? parsedResult.terms
            .filter((t: any) => t && typeof t.term === 'string' && typeof t.definition === 'string')
            .map((t: any) => ({ term: t.term.trim(), definition: t.definition.trim() }))
        : [],
      contextFit: typeof parsedResult.contextFit === 'string' && parsedResult.contextFit.trim()
        ? parsedResult.contextFit.trim()
        : 'Fits within the paragraph context.',
      sourceReference: {
        passage,
        pageNumber: body.sourceLocation?.pageNumber,
        sectionHeading: body.sourceLocation?.sectionHeading,
        paragraphIndex: body.sourceLocation?.paragraphIndex ?? 0,
      },
      prerequisites: Array.isArray(parsedResult.prerequisites)
        ? parsedResult.prerequisites
            .filter((p: any) => p && typeof p.name === 'string')
            .slice(0, 3)
            .map((p: any) => ({
              name: String(p.name).trim(),
              definition: typeof p.definition === 'string' ? p.definition.trim() : '',
              whyItMatters: typeof p.whyItMatters === 'string' ? p.whyItMatters.trim() : '',
            }))
        : [],
      comprehensionCheck:
        parsedResult.comprehensionCheck && typeof parsedResult.comprehensionCheck.question === 'string'
          ? {
              question: parsedResult.comprehensionCheck.question.trim(),
              answer: typeof parsedResult.comprehensionCheck.answer === 'string' ? parsedResult.comprehensionCheck.answer.trim() : '',
              explanation: typeof parsedResult.comprehensionCheck.explanation === 'string' ? parsedResult.comprehensionCheck.explanation.trim() : '',
            }
          : undefined,
      limitationsNotice: typeof parsedResult.limitationsNotice === 'string' && parsedResult.limitationsNotice.trim()
        ? parsedResult.limitationsNotice.trim()
        : undefined,
      generatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      available: true,
      explanation: explanationResponse,
    });
  } catch (error: any) {
    if (error?.name === 'TimeoutError' || error?.message?.includes('timeout')) {
      return NextResponse.json(
        { error: 'AI explanation service timed out after 15 seconds. Please try again.' },
        { status: 504 }
      );
    }
    const safeError = sanitizeErrorMessage(error?.message || 'Internal server error while generating explanation.');
    return NextResponse.json(
      { error: safeError },
      { status: 500 }
    );
  }
}
