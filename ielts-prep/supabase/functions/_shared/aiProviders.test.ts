// Unit tests for the Gemini provider branch added to aiProviders.ts, plus a
// couple of provider-selection cases. Run with (from supabase/functions/):
//   deno test --allow-env --allow-read --node-modules-dir=none _shared/aiProviders.test.ts
//
// The module under test reads its provider keys/preference from env vars
// into top-level consts at import time, so each test that needs a specific
// env configuration sets `Deno.env` first and then dynamically imports the
// module with a cache-busting query string to force a fresh evaluation —
// otherwise Deno would reuse the first-imported module instance (and its
// already-read env snapshot) for every test in this file.
import { strict as assert } from 'node:assert';

import { WritingEvaluationSchema } from './schemas.ts';

function clearAiEnv() {
  for (const key of ['OPENAI_API_KEY', 'ANTHROPIC_API_KEY', 'GEMINI_API_KEY', 'AI_PROVIDER', 'GEMINI_MODEL', 'GEMINI_TRANSCRIBE_MODEL']) {
    Deno.env.delete(key);
  }
}

async function freshImport() {
  return await import(`./aiProviders.ts?t=${Date.now()}-${Math.random()}`);
}

Deno.test('getConfiguredTextProvider — returns gemini when only GEMINI_API_KEY is set', async () => {
  clearAiEnv();
  Deno.env.set('GEMINI_API_KEY', 'test-key');
  const mod = await freshImport();
  assert.equal(mod.getConfiguredTextProvider(), 'gemini');
});

Deno.test('getConfiguredTextProvider — honors AI_PROVIDER=gemini even when other keys are also set', async () => {
  clearAiEnv();
  Deno.env.set('OPENAI_API_KEY', 'test-openai-key');
  Deno.env.set('GEMINI_API_KEY', 'test-gemini-key');
  Deno.env.set('AI_PROVIDER', 'gemini');
  const mod = await freshImport();
  assert.equal(mod.getConfiguredTextProvider(), 'gemini');
});

Deno.test('getConfiguredTextProvider — returns null when nothing is configured', async () => {
  clearAiEnv();
  const mod = await freshImport();
  assert.equal(mod.getConfiguredTextProvider(), null);
});

Deno.test('getConfiguredTranscriptionProvider — returns gemini when only GEMINI_API_KEY is set', async () => {
  clearAiEnv();
  Deno.env.set('GEMINI_API_KEY', 'test-key');
  const mod = await freshImport();
  assert.equal(mod.getConfiguredTranscriptionProvider(), 'gemini');
});

Deno.test('getConfiguredTranscriptionProvider — prefers openai over gemini by default when both are set (backwards compatible)', async () => {
  clearAiEnv();
  Deno.env.set('OPENAI_API_KEY', 'test-openai-key');
  Deno.env.set('GEMINI_API_KEY', 'test-gemini-key');
  const mod = await freshImport();
  assert.equal(mod.getConfiguredTranscriptionProvider(), 'openai');
});

Deno.test('getConfiguredTranscriptionProvider — honors AI_PROVIDER=gemini even when an OpenAI key is also set', async () => {
  clearAiEnv();
  Deno.env.set('OPENAI_API_KEY', 'test-openai-key');
  Deno.env.set('GEMINI_API_KEY', 'test-gemini-key');
  Deno.env.set('AI_PROVIDER', 'gemini');
  const mod = await freshImport();
  assert.equal(mod.getConfiguredTranscriptionProvider(), 'gemini');
});

Deno.test('getConfiguredTranscriptionProvider — returns null when nothing is configured', async () => {
  clearAiEnv();
  const mod = await freshImport();
  assert.equal(mod.getConfiguredTranscriptionProvider(), null);
});

Deno.test('transcribeWithGemini — sends inline base64 audio + a verbatim-transcription instruction, and returns the transcript', async () => {
  clearAiEnv();
  Deno.env.set('GEMINI_API_KEY', 'test-key');
  const mod = await freshImport();

  let capturedUrl = '';
  let capturedBody: Record<string, unknown> | null = null;
  const originalFetch = globalThis.fetch;
  globalThis.fetch = ((url: string | URL, init?: RequestInit) => {
    capturedUrl = String(url);
    capturedBody = JSON.parse(init!.body as string);
    return Promise.resolve(
      new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: 'um, I think that, like, it depends' }] }, finishReason: 'STOP' }] }), { status: 200 })
    );
  }) as typeof fetch;

  try {
    const text = await mod.transcribeWithGemini('ZmFrZS1hdWRpby1ieXRlcw==', 'audio/m4a');
    assert.equal(text, 'um, I think that, like, it depends');
    assert.ok(capturedUrl.includes('generativelanguage.googleapis.com'), 'expected the Gemini API host');
    assert.ok(capturedUrl.includes(':generateContent'), 'expected the generateContent endpoint, not a different transcription API');

    assert.ok(capturedBody, 'expected fetch to have been called');
    const body = capturedBody as Record<string, unknown>;
    const contents = body.contents as { role: string; parts: { text?: string; inlineData?: { mimeType: string; data: string } }[] }[];
    assert.equal(contents.length, 1);
    assert.equal(contents[0].role, 'user');
    const audioPart = contents[0].parts.find((p) => p.inlineData);
    assert.ok(audioPart?.inlineData, 'expected an inlineData part carrying the audio');
    assert.equal(audioPart!.inlineData!.mimeType, 'audio/m4a');
    assert.equal(audioPart!.inlineData!.data, 'ZmFrZS1hdWRpby1ieXRlcw==');
    const textPart = contents[0].parts.find((p) => p.text);
    assert.ok(textPart?.text?.toLowerCase().includes('verbatim'), 'expected the prompt to instruct verbatim transcription (filler words must survive for fluency scoring)');

    const generationConfig = body.generationConfig as Record<string, unknown>;
    assert.equal(generationConfig.temperature, 0, 'transcription should use temperature 0 for determinism, not the 0.4 default used for eval prompts');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

Deno.test('transcribeWithGemini — strips surrounding quotes the model sometimes wraps the transcript in', async () => {
  clearAiEnv();
  Deno.env.set('GEMINI_API_KEY', 'test-key');
  const mod = await freshImport();

  const originalFetch = globalThis.fetch;
  globalThis.fetch = (() =>
    Promise.resolve(new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: '"Hello, my hometown is quite small."' }] } }] }), { status: 200 }))) as typeof fetch;

  try {
    const text = await mod.transcribeWithGemini('ZmFrZQ==', 'audio/wav');
    assert.equal(text, 'Hello, my hometown is quite small.');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

Deno.test('transcribeWithGemini — throws a descriptive error when the response was safety-blocked (no content)', async () => {
  clearAiEnv();
  Deno.env.set('GEMINI_API_KEY', 'test-key');
  const mod = await freshImport();

  const originalFetch = globalThis.fetch;
  globalThis.fetch = (() => Promise.resolve(new Response(JSON.stringify({ candidates: [{ finishReason: 'SAFETY' }] }), { status: 200 }))) as typeof fetch;

  try {
    await assert.rejects(() => mod.transcribeWithGemini('ZmFrZQ==', 'audio/wav'), /SAFETY/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

Deno.test('transcribeWithGemini — uses GEMINI_TRANSCRIBE_MODEL override independently of GEMINI_MODEL', async () => {
  clearAiEnv();
  Deno.env.set('GEMINI_API_KEY', 'test-key');
  Deno.env.set('GEMINI_MODEL', 'gemini-eval-model');
  Deno.env.set('GEMINI_TRANSCRIBE_MODEL', 'gemini-transcribe-model');
  const mod = await freshImport();

  let capturedUrl = '';
  const originalFetch = globalThis.fetch;
  globalThis.fetch = ((url: string | URL) => {
    capturedUrl = String(url);
    return Promise.resolve(new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: 'ok' }] } }] }), { status: 200 }));
  }) as typeof fetch;

  try {
    await mod.transcribeWithGemini('ZmFrZQ==', 'audio/wav');
    assert.ok(capturedUrl.includes('gemini-transcribe-model'), `expected the transcribe-specific model in the URL, got: ${capturedUrl}`);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

Deno.test('runJsonPrompt(gemini) — extracts the JSON text from a real-shaped Gemini API response', async () => {
  clearAiEnv();
  Deno.env.set('GEMINI_API_KEY', 'test-key');
  const mod = await freshImport();

  const originalFetch = globalThis.fetch;
  globalThis.fetch = ((url: string | URL) => {
    assert.ok(String(url).includes('generativelanguage.googleapis.com'));
    assert.ok(String(url).includes('gemini-2.0-flash'));
    return Promise.resolve(
      new Response(
        JSON.stringify({
          candidates: [{ content: { parts: [{ text: '{"focusSummary":"Focus on Reading.","motivationalNote":"Keep going."}' }] }, finishReason: 'STOP' }],
        }),
        { status: 200 }
      )
    );
  }) as typeof fetch;

  try {
    const raw = await mod.runJsonPrompt('gemini', 'some prompt');
    assert.deepEqual(JSON.parse(raw), { focusSummary: 'Focus on Reading.', motivationalNote: 'Keep going.' });
  } finally {
    globalThis.fetch = originalFetch;
  }
});

Deno.test('runJsonPrompt(gemini) — throws a descriptive error when the response was safety-blocked (no content)', async () => {
  clearAiEnv();
  Deno.env.set('GEMINI_API_KEY', 'test-key');
  const mod = await freshImport();

  const originalFetch = globalThis.fetch;
  globalThis.fetch = (() => Promise.resolve(new Response(JSON.stringify({ candidates: [{ finishReason: 'SAFETY' }] }), { status: 200 }))) as typeof fetch;

  try {
    await assert.rejects(() => mod.runJsonPrompt('gemini', 'some prompt'), /SAFETY/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

Deno.test('runChat(gemini) — maps assistant/user roles into Gemini model/user roles and calls the API', async () => {
  clearAiEnv();
  Deno.env.set('GEMINI_API_KEY', 'test-key');
  const mod = await freshImport();

  let capturedBody: Record<string, unknown> | null = null;
  const originalFetch = globalThis.fetch;
  globalThis.fetch = ((_url: string | URL, init?: RequestInit) => {
    capturedBody = JSON.parse(init!.body as string);
    return Promise.resolve(
      new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: 'Great question — focus on skimming first.' }] } }] }), { status: 200 })
    );
  }) as typeof fetch;

  const context = {
    fullName: 'Alex',
    ieltsType: 'academic' as const,
    targetBand: 7,
    currentBand: 6,
    examDate: null,
    weakestSkill: 'reading' as const,
    bandBySkill: { reading: 6 },
    streakDays: 2,
    dailyStudyMinutes: 30,
  };

  try {
    const reply = await mod.runChat(
      'gemini',
      [
        { role: 'user', content: 'How do I improve my reading?' },
        { role: 'assistant', content: 'Try skimming first.' },
        { role: 'user', content: 'What else?' },
      ],
      context
    );
    assert.equal(reply, 'Great question — focus on skimming first.');
    assert.ok(capturedBody, 'expected fetch to have been called');
    const contents = (capturedBody as Record<string, unknown>).contents as { role: string }[];
    assert.deepEqual(
      contents.map((c) => c.role),
      ['user', 'model', 'user']
    );
    assert.ok((capturedBody as Record<string, unknown>).systemInstruction, 'expected a systemInstruction field carrying the coach system prompt');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

// --- Response validation: Gemini's raw JSON goes through the exact same Zod
// schema every other provider's output does (each function's index.ts calls
// `WritingEvaluationSchema.safeParse(JSON.parse(raw))` regardless of which
// provider produced `raw`) — these two cases exercise that boundary directly
// with a Gemini-shaped payload, both valid and deliberately malformed.
Deno.test('Gemini-shaped Writing evaluation JSON validates against WritingEvaluationSchema', () => {
  const validGeminiOutput = {
    overallBand: 6.5,
    taskAchievement: 6,
    coherenceCohesion: 7,
    lexicalResource: 6,
    grammaticalRange: 7,
    strengths: ['Clear structure', 'Good range of linking words'],
    weaknesses: ['Some repeated vocabulary'],
    suggestions: ['Vary word choice more', 'Add a stronger conclusion'],
    improvedExample: 'A more developed concluding sentence would strengthen the essay.',
    nextBandAction: 'Focus on lexical variety to reach band 7.',
  };
  const parsed = WritingEvaluationSchema.safeParse(validGeminiOutput);
  assert.equal(parsed.success, true);
});

Deno.test('malformed Gemini output (wrong types / missing required fields) fails WritingEvaluationSchema validation', () => {
  const malformedGeminiOutput = {
    overallBand: 'six point five', // wrong type — Gemini is not immune to instruction-following slips
    strengths: [],
    weaknesses: ['Some repeated vocabulary'],
    // missing: taskAchievement, coherenceCohesion, lexicalResource, grammaticalRange, suggestions, improvedExample, nextBandAction
  };
  const parsed = WritingEvaluationSchema.safeParse(malformedGeminiOutput);
  assert.equal(parsed.success, false);
});
