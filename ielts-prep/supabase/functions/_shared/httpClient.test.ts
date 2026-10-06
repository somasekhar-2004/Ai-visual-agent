// Unit tests for fetchWithRetry's retryable-vs-non-retryable classification
// and friendlyAiErrorMessage's user-facing mapping — in particular the
// distinction between a genuine, temporary provider rate limit (worth
// retrying) and an exhausted quota/billing problem (never worth retrying,
// no matter how many attempts or how long the backoff). See httpClient.ts's
// own comments for exactly which provider-documented signals these are
// based on and what remains a known, flagged gap (Anthropic's spend-cap
// 429, indistinguishable from a genuine rate limit by body text alone).
//
// Run with (from supabase/functions/):
//   deno test --allow-env --allow-read --node-modules-dir=none _shared/httpClient.test.ts
import { strict as assert } from 'node:assert';

import { AiRequestError, fetchWithRetry, friendlyAiErrorMessage } from './httpClient.ts';

function withMockFetch(impl: typeof fetch, run: () => Promise<void>): Promise<void> {
  const original = globalThis.fetch;
  globalThis.fetch = impl;
  return run().finally(() => {
    globalThis.fetch = original;
  });
}

Deno.test('fetchWithRetry — retries a genuine rate limit (429, no quota/billing signal) and succeeds once the provider recovers', async () => {
  let calls = 0;
  await withMockFetch(
    (async () => {
      calls++;
      if (calls < 3) {
        return new Response(
          JSON.stringify({ error: { type: 'rate_limit_error', message: 'Too many requests, please slow down.' } }),
          { status: 429 }
        );
      }
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    }) as typeof fetch,
    async () => {
      const res = await fetchWithRetry('https://example.test/v1/chat', {}, { maxAttempts: 3 });
      assert.equal(res.status, 200);
      assert.equal(calls, 3, 'must have actually retried twice before succeeding on the third attempt');
    }
  );
});

Deno.test('fetchWithRetry — does NOT retry an OpenAI-style insufficient_quota 429 (exhausted quota never resolves by retrying)', async () => {
  let calls = 0;
  await withMockFetch(
    (async () => {
      calls++;
      return new Response(
        JSON.stringify({
          error: { type: 'insufficient_quota', code: 'insufficient_quota', message: 'You exceeded your current quota, please check your plan and billing details.' },
        }),
        { status: 429 }
      );
    }) as typeof fetch,
    async () => {
      await assert.rejects(
        () => fetchWithRetry('https://example.test/v1/chat', {}, { maxAttempts: 3 }),
        (err: unknown) => {
          assert.ok(err instanceof AiRequestError);
          assert.equal(err.status, 429);
          assert.equal(err.retryable, false);
          assert.equal(err.kind, 'quota_exceeded');
          return true;
        }
      );
      assert.equal(calls, 1, 'must give up after the first attempt — no point burning further requests against an exhausted quota');
    }
  );
});

Deno.test('fetchWithRetry — does NOT retry OpenAI\'s "no prepaid credits remaining" 429 phrasing either', async () => {
  let calls = 0;
  await withMockFetch(
    (async () => {
      calls++;
      return new Response(JSON.stringify({ error: { message: 'Your organization has no prepaid credits remaining.' } }), { status: 429 });
    }) as typeof fetch,
    async () => {
      await assert.rejects(() => fetchWithRetry('https://example.test/v1/chat', {}, { maxAttempts: 3 }));
      assert.equal(calls, 1);
    }
  );
});

Deno.test('fetchWithRetry — does NOT retry Anthropic\'s documented 402 billing_error, by status code alone (no body keyword needed)', async () => {
  let calls = 0;
  await withMockFetch(
    (async () => {
      calls++;
      return new Response(
        JSON.stringify({ type: 'error', error: { type: 'billing_error', message: "There's an issue with your billing or payment information." } }),
        { status: 402 }
      );
    }) as typeof fetch,
    async () => {
      await assert.rejects(
        () => fetchWithRetry('https://example.test/v1/messages', {}, { maxAttempts: 3 }),
        (err: unknown) => {
          assert.ok(err instanceof AiRequestError);
          assert.equal(err.status, 402);
          assert.equal(err.retryable, false);
          assert.equal(err.kind, 'quota_exceeded');
          return true;
        }
      );
      assert.equal(calls, 1);
    }
  );
});

Deno.test('fetchWithRetry — still retries a plain 500, unrelated to quota/billing', async () => {
  let calls = 0;
  await withMockFetch(
    (async () => {
      calls++;
      if (calls < 2) return new Response('internal error', { status: 500 });
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    }) as typeof fetch,
    async () => {
      const res = await fetchWithRetry('https://example.test/v1/chat', {}, { maxAttempts: 3 });
      assert.equal(res.status, 200);
      assert.equal(calls, 2);
    }
  );
});

Deno.test('fetchWithRetry — gives up after maxAttempts for a persistent genuine rate limit, still marked retryable', async () => {
  let calls = 0;
  await withMockFetch(
    (async () => {
      calls++;
      return new Response(JSON.stringify({ error: { type: 'rate_limit_error', message: 'slow down' } }), { status: 429 });
    }) as typeof fetch,
    async () => {
      await assert.rejects(
        () => fetchWithRetry('https://example.test/v1/chat', {}, { maxAttempts: 3 }),
        (err: unknown) => {
          assert.ok(err instanceof AiRequestError);
          assert.equal(err.retryable, true, 'a genuine rate limit is still retryable in principle — maxAttempts, not the error itself, is what stopped it');
          assert.equal(err.kind, undefined);
          return true;
        }
      );
      assert.equal(calls, 3);
    }
  );
});

Deno.test('friendlyAiErrorMessage — gives a distinct, non-"try again" message for a quota/billing AiRequestError', () => {
  const err = new AiRequestError('Request failed: 429 ...', 429, false, 'quota_exceeded');
  const message = friendlyAiErrorMessage(err);
  assert.match(message, /quota or credit/i);
  assert.doesNotMatch(message, /try again/i);
});

Deno.test('friendlyAiErrorMessage — gives the temporary-throttle message for a genuine rate limit', () => {
  const err = new AiRequestError('Request failed: 429 ...', 429, true);
  const message = friendlyAiErrorMessage(err);
  assert.match(message, /rate-limiting requests right now/i);
});
