import type { PostgrestError } from '@supabase/supabase-js';

/**
 * Throws a descriptive Error when a Supabase query's `error` is set, and is
 * a no-op otherwise. Every repository function against a real Supabase
 * backend must call this on the `error` half of `{ data, error }` before
 * doing anything with `data` — see the "permission denied for table
 * profiles" investigation: several repository functions used to destructure
 * only `data`, so a real failure (RLS/permission denial, network error,
 * constraint violation) silently looked identical to "no rows" or "empty
 * list" instead of surfacing anywhere, producing blank screens and buttons
 * that appeared to do nothing.
 *
 * `.maybeSingle()`/`.single()` legitimately return `{ data: null, error:
 * null }` for "no row found" — that is NOT an error and must still be
 * handled separately by the caller (`if (!data) return null`), which is why
 * this only throws when `error` itself is non-null.
 */
export function throwIfSupabaseError(error: PostgrestError | null, context: string): void {
  if (!error) return;
  // Postgres 23503 = foreign_key_violation. The most common real cause in
  // this app is content/database drift: a row id baked into the bundled
  // lib/content/*.ts (e.g. a mock test) that the live database was never
  // actually seeded with, or was seeded with before that content changed —
  // see scripts/verify-content-in-db.ts, which catches this proactively.
  // Naming that here turns a bare Postgres error code into something
  // immediately actionable instead of a generic "(code: 23503)".
  if (error.code === '23503') {
    throw new Error(
      `${context}: ${error.message} (code: 23503 — foreign key violation, likely content/database drift: run \`npm run verify:content-in-db\` to find which content the live database is missing)`,
    );
  }
  throw new Error(`${context}: ${error.message}${error.code ? ` (code: ${error.code})` : ''}`);
}
