/**
 * Client-generated operation IDs for the three paid AI provider calls
 * (Writing eval, Speaking eval, transcription) — see the Bandpath recovery
 * handover's item 5 ("Writing/Speaking AI reliability") and the deployed
 * `ai_operations` table (supabase/migrations/0017_ai_operation_idempotency.sql,
 * recovered from the live project — see that file's header for the full
 * server-side reasoning).
 *
 * Reconciled against the live backend (api.supabase.com, read-only token,
 * 2026-11-06): the deployed Edge Functions validate this field with Zod's
 * `z.string().uuid()` (supabase/functions/_shared/schemas.ts) — a stable
 * content-hash in some other format, which an earlier version of this file
 * used, is REJECTED outright with a 400 before the request ever reaches the
 * idempotency check at all. This must be a real RFC 4122 v4 UUID string.
 *
 * Design (matches migration 0016's own comment on the sibling XP-idempotency
 * ledger, which names this exact file/function): generate ONE id per logical
 * attempt, have the CALLER persist it (a ref is enough — it only needs to
 * survive across retries of the same in-progress attempt, not across app
 * restarts) and reuse it for every retry of that attempt; generate a fresh
 * one only when starting a genuinely new attempt (a new essay, a new
 * recording). The server's claim/cache logic (ai_operations table) is what
 * actually makes a reused id safe — this function only produces the id.
 *
 * Not from `expo-crypto` (not a dependency of this project) or
 * `crypto.randomUUID` (not reliably present in this React Native runtime) —
 * Math.random() has more than enough entropy for this: the only collision
 * space that matters is one user's own concurrent/recent operations, not
 * resistance to a deliberate attacker.
 */
export function generateOperationId(): string {
  const bytes = new Uint8Array(16);
  for (let i = 0; i < 16; i++) bytes[i] = Math.floor(Math.random() * 256);
  // RFC 4122 v4: version nibble = 4, variant bits = 10xxxxxx. The deployed
  // schema's z.string().uuid() check enforces both exactly — a UUID-shaped
  // string with the wrong version/variant nibble still fails validation.
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
