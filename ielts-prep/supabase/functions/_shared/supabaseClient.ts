// deno-lint-ignore-file no-explicit-any
import { createClient, type SupabaseClient, type User } from 'npm:@supabase/supabase-js@2';

// SUPABASE_URL and SUPABASE_ANON_KEY are reserved names the Supabase Edge
// Runtime injects into every function automatically — they must NOT be set
// via `supabase secrets set` (that will be rejected). See
// supabase/functions/.env.example for the secrets that DO need setting.
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;

/** Builds a Supabase client that forwards the caller's own JWT, so every
 * query it makes runs as that authenticated user and is subject to the
 * exact same row-level-security policies as a client-side query — this
 * function never needs (and never receives) the service-role key, so
 * there is no elevated-privilege secret to leak even if this code were
 * somehow exposed. */
export function clientForRequest(req: Request): SupabaseClient {
  const authHeader = req.headers.get('Authorization') ?? '';
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export type AuthResult = { user: User; supabase: SupabaseClient } | { error: string };

/** Verifies the request carries a valid Supabase session JWT and resolves
 * the authenticated user. Every function must call this before doing
 * anything else — there is no anonymous access to any AI operation. */
export async function requireUser(req: Request): Promise<AuthResult> {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return { error: 'Missing or malformed Authorization header.' };

  const supabase = clientForRequest(req);
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return { error: 'Invalid or expired session — please sign in again.' };
  return { user, supabase };
}
