import type { SupabaseClient, User } from 'npm:@supabase/supabase-js@2';

/**
 * Verifies a claimed Full Mock attempt actually exists and belongs to the
 * calling user, rather than trusting a client-supplied "this is a mock"
 * flag by itself. `supabase` here is scoped to the caller's own JWT (see
 * clientForRequest in supabaseClient.ts), so `mock_attempts`'s owner_all RLS
 * policy already restricts this query to rows where `auth.uid() =
 * user_id` — the explicit `.eq('user_id', user.id)` below is defense in
 * depth, not the only thing standing between a request and another user's
 * data. A forged or expired id simply returns no row, exactly like a real
 * request that never started a mock attempt.
 */
export async function verifyMockAttemptOwnership(supabase: SupabaseClient, user: User, mockAttemptId: string): Promise<boolean> {
  const { data, error } = await supabase.from('mock_attempts').select('id').eq('id', mockAttemptId).eq('user_id', user.id).maybeSingle();
  if (error) {
    console.error('[mockAttempt] failed to verify mock attempt ownership:', error.message);
    return false;
  }
  return data != null;
}
