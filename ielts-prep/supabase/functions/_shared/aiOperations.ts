// RECOVERY NOTE (added 2026-11-06, Bandpath recovery session): this file was
// missing from this git branch entirely. Recovered verbatim from the live
// "Bandpath IELTS" project (kudgtxdwbpfqobteyeqy) — extracted from the
// deployed evaluate-writing Edge Function's own eszip bundle (its embedded
// source map's sourcesContent) via the Supabase Management API (read-only
// token). The comment immediately below, reading "NOT APPLIED/DEPLOYED...
// has NOT been run against a real or local Postgres instance", is the
// AUTHOR's pre-deployment note at drafting time and is stale: this exact
// file IS deployed and running in production right now — evaluate-writing,
// evaluate-speaking and transcribe-audio (v10/v10/v7, last updated
// 2026-10-29T11:22:59Z) all import it, and the live schema really does have
// an ai_operations table matching 0017_ai_operation_idempotency.sql. Left
// verbatim rather than edited, since the reasoning in it is accurate and
// worth keeping as a record of how this was built.
//
// Server-side idempotency for the three paid AI provider calls (writing
// eval, speaking eval, transcription) — see supabase/migrations/
// 0017_ai_operation_idempotency.sql's header comment for the full
// reasoning on why this is needed even after the client's own request
// timeout was fixed. The actual branching logic lives in the pure,
// Jest-tested aiOperationDecision.ts; this file is just real Supabase
// queries around it.
//
// NOT APPLIED/DEPLOYED: depends on migration 0017, which has not been
// applied to any real database. Reviewed (deno check + deno lint, both
// clean) and exercised via aiOperationDecision.test.ts's coverage of the
// pure decision logic this wraps — the actual Supabase read/write calls
// below have NOT been run against a real or local Postgres instance
// (no psql/Docker/Supabase CLI session available in this environment;
// see migration 0016's own review for the identical constraint and how
// that one WAS later verified against real staging/production projects
// once access became available — the same path applies here once this
// migration is actually applied somewhere).
import type { SupabaseClient, User } from 'npm:@supabase/supabase-js@2';
import { decideFromExistingRow, type AiOperationDecision } from './aiOperationDecision.ts';

export type AiOperationType = 'writing_eval' | 'speaking_eval' | 'transcription';

/** Attempts to claim `operationId` for `operationType`, or reports what
 * to do instead if it's already claimed. Callers with NO operationId at
 * all (every pre-existing client before this was added) skip this
 * entirely and keep the original, non-idempotent-but-unchanged behavior
 * — see each Edge Function's own `if (operationId) { ... }` guard. */
export async function claimOrGetCachedResult(
  supabase: SupabaseClient,
  user: User,
  operationId: string,
  operationType: AiOperationType
): Promise<AiOperationDecision> {
  const { error: insertError } = await supabase
    .from('ai_operations')
    .insert({ user_id: user.id, operation_id: operationId, operation_type: operationType, status: 'pending' });

  if (!insertError) {
    // Freshly claimed — no prior row existed. Caller should call the
    // provider now.
    return { action: 'proceed' };
  }
  if (insertError.code !== '23505') {
    // Some OTHER database error (not a unique-violation on the
    // (user_id, operation_id) primary key) — never silently treated as
    // "someone else already has this," which would wrongly skip a
    // provider call that should have happened. Surface it as a genuine
    // failure instead.
    throw new Error(`Failed to claim AI operation: ${insertError.message}`);
  }

  // Conflict — a row for this EXACT (user, operationId) already exists
  // (claimed by this same request racing itself, an earlier attempt, or
  // a genuinely concurrent one). Load it and decide what to do.
  const { data: existing, error: selectError } = await supabase
    .from('ai_operations')
    .select('status, result, provider, updated_at')
    .eq('user_id', user.id)
    .eq('operation_id', operationId)
    .single();
  if (selectError || !existing) {
    throw new Error(`AI operation claim conflicted but the existing row could not be read: ${selectError?.message ?? 'not found'}`);
  }

  const decision = decideFromExistingRow(existing, Date.now());
  if (decision.action === 'proceed') {
    // Reclaiming a stale-'pending' or definitively-'failed' row — mark it
    // 'pending' again (and bump updated_at) so a THIRD concurrent
    // request sees a fresh staleness clock, then let the caller proceed
    // to call the provider.
    const { error: reclaimError } = await supabase
      .from('ai_operations')
      .update({ status: 'pending', result: null, provider: null, error_message: null, updated_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .eq('operation_id', operationId);
    if (reclaimError) throw new Error(`Failed to reclaim AI operation: ${reclaimError.message}`);
  }
  return decision;
}

/** Marks a claimed operation as completed, storing the result so a
 * retried request for the SAME operationId gets it back without ever
 * calling the provider again. Only ever called after claimOrGetCachedResult
 * returned {action: 'proceed'} for this exact id. */
export async function recordOperationSuccess(
  supabase: SupabaseClient,
  user: User,
  operationId: string,
  result: unknown,
  provider: string
): Promise<void> {
  const { error } = await supabase
    .from('ai_operations')
    .update({ status: 'completed', result, provider, error_message: null, updated_at: new Date().toISOString() })
    .eq('user_id', user.id)
    .eq('operation_id', operationId);
  // Never thrown: the ACTUAL AI result is already in hand and about to
  // be returned to the client regardless — a failure to persist the
  // cache entry only means a future retry might (harmlessly, from the
  // user's perspective, though not quota-wise) call the provider again,
  // not that this response itself should fail.
  if (error) console.error(`[ai_operations] failed to record success for ${operationId}:`, error.message);
}

/** Marks a claimed operation as failed — see decideFromExistingRow: a
 * 'failed' row lets a later retry reclaim the SAME id and try again,
 * unlike 'completed', which permanently returns the cached result. */
export async function recordOperationFailure(supabase: SupabaseClient, user: User, operationId: string, errorMessage: string): Promise<void> {
  const { error } = await supabase
    .from('ai_operations')
    .update({ status: 'failed', error_message: errorMessage.slice(0, 500), updated_at: new Date().toISOString() })
    .eq('user_id', user.id)
    .eq('operation_id', operationId);
  if (error) console.error(`[ai_operations] failed to record failure for ${operationId}:`, error.message);
}
