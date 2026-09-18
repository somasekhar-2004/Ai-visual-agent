// Pure-ish deletion logic for delete-account/index.ts, kept separate (same
// reasoning as _shared/revenuecatWebhook.ts) so it's directly unit-testable
// without a top-level Deno.serve — see deleteAccount.test.ts.
import type { SupabaseClient } from 'npm:@supabase/supabase-js@2';

export type DeleteAccountResult = { ok: boolean; error?: string };

/** Deletes everything owned by exactly `userId` — never any other id; the
 * caller (delete-account/index.ts) only ever passes the id `requireUser`
 * resolved from the caller's own verified session JWT, so this function has
 * no way to delete anyone else's account even if it wanted to.
 *
 * Deleting the auth.users row is the only application-data deletion this
 * performs: every user-owned table declares `user_id ... references
 * profiles (id) on delete cascade`, and profiles.id itself `references
 * auth.users (id) on delete cascade` (see supabase/migrations/0001_init.sql,
 * 0003_grammar_practice.sql, 0005_ai_usage_log.sql) — deleting auth.users
 * cascades through every one of them. revenuecat_webhook_events has no such
 * FK (it's a webhook idempotency ledger keyed by RevenueCat's own event id,
 * with app_user_id stored as plain text for audit purposes only), so it's
 * cleaned up explicitly first; a failure there must never block the actual
 * account deletion. */
export async function performAccountDeletion(admin: SupabaseClient, userId: string): Promise<DeleteAccountResult> {
  const { error: webhookCleanupError } = await admin.from('revenuecat_webhook_events').delete().eq('app_user_id', userId);
  if (webhookCleanupError) {
    console.warn('[delete-account] failed to clean up revenuecat_webhook_events (continuing):', webhookCleanupError.message);
  }

  const { error: deleteError } = await admin.auth.admin.deleteUser(userId);
  if (deleteError) {
    // Idempotent: a retry after this user id was already deleted (e.g. a
    // double-tap firing two concurrent requests) means GoTrue reports the
    // id as not found — nothing is left to delete, so this specific case
    // is success, not a failure to surface to the user.
    if (/not.?found/i.test(deleteError.message)) return { ok: true };
    return { ok: false, error: deleteError.message };
  }
  return { ok: true };
}
