// Regression coverage for the Bandpath recovery handover's item 5/6: this
// is the pure decision logic behind the deployed `ai_operations` idempotency
// table (supabase/migrations/0017_ai_operation_idempotency.sql), recovered
// this session from the live "Bandpath IELTS" project's deployed
// evaluate-writing Edge Function bundle. It has zero Deno-specific imports
// by design (see its own header comment), specifically so it can be tested
// here with plain Jest — the real Supabase read/write wrapper around it
// (aiOperations.ts) runs on Deno and is excluded from Jest collection (see
// jest.config.js's testPathIgnorePatterns) and can only be run with
// `deno test`, which isn't available in this environment.
import { decideFromExistingRow, STALE_PENDING_THRESHOLD_MS, type AiOperationRow } from '@/supabase/functions/_shared/aiOperationDecision';

function row(overrides: Partial<AiOperationRow>): AiOperationRow {
  return { status: 'pending', result: null, provider: null, updated_at: new Date().toISOString(), ...overrides };
}

describe('decideFromExistingRow', () => {
  it('returns the cached result for a completed operation — never calls the provider again', () => {
    const decision = decideFromExistingRow(row({ status: 'completed', result: { overallBand: 7 }, provider: 'openai' }), Date.now());
    expect(decision).toEqual({ action: 'return_cached', result: { overallBand: 7 }, provider: 'openai' });
  });

  it('falls back to "unknown" provider for a completed row that somehow has none, rather than withholding the cached result', () => {
    const decision = decideFromExistingRow(row({ status: 'completed', result: { overallBand: 7 }, provider: null }), Date.now());
    expect(decision).toEqual({ action: 'return_cached', result: { overallBand: 7 }, provider: 'unknown' });
  });

  it('lets a definitively failed operation be retried immediately — no staleness wait needed', () => {
    const decision = decideFromExistingRow(row({ status: 'failed', updated_at: new Date().toISOString() }), Date.now());
    expect(decision).toEqual({ action: 'proceed' });
  });

  it('treats a recent pending row as still genuinely in flight — must not start a second provider call', () => {
    const now = Date.now();
    const decision = decideFromExistingRow(row({ status: 'pending', updated_at: new Date(now - 5_000).toISOString() }), now);
    expect(decision).toEqual({ action: 'in_progress' });
  });

  it('treats a pending row right at the staleness threshold as still in flight (not yet stale)', () => {
    const now = Date.now();
    const decision = decideFromExistingRow(row({ status: 'pending', updated_at: new Date(now - STALE_PENDING_THRESHOLD_MS).toISOString() }), now);
    expect(decision).toEqual({ action: 'in_progress' });
  });

  it('treats a pending row older than the staleness threshold as abandoned — safe to reclaim and retry', () => {
    const now = Date.now();
    const decision = decideFromExistingRow(row({ status: 'pending', updated_at: new Date(now - STALE_PENDING_THRESHOLD_MS - 1).toISOString() }), now);
    expect(decision).toEqual({ action: 'proceed' });
  });

  it('the staleness threshold is set above both this app\'s own worst-case duration (~120.6s transcription) and the platform\'s 150s wall-clock ceiling', () => {
    expect(STALE_PENDING_THRESHOLD_MS).toBeGreaterThan(120_600);
    expect(STALE_PENDING_THRESHOLD_MS).toBeGreaterThan(150_000);
  });
});
