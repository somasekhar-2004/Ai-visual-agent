// Permanently deletes the authenticated caller's own account and every row
// of their data. Called by services/auth.ts's deleteAccount() — see
// app/help.tsx's "Delete account" flow for the confirming UI. The actual
// deletion logic lives in ../_shared/deleteAccount.ts (kept separate so
// it's directly unit-testable — see its own test file).
import { createClient } from 'npm:@supabase/supabase-js@2';

import { handleCorsPreflight } from '../_shared/cors.ts';
import { performAccountDeletion } from '../_shared/deleteAccount.ts';
import { errorResponse, jsonResponse } from '../_shared/responses.ts';
import { requireUser } from '../_shared/supabaseClient.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

Deno.serve(async (req) => {
  const preflight = handleCorsPreflight(req);
  if (preflight) return preflight;
  if (req.method !== 'POST') return errorResponse(405, 'method_not_allowed', 'Use POST.');
  if (!SERVICE_ROLE_KEY) return errorResponse(500, 'server_not_configured', 'SUPABASE_SERVICE_ROLE_KEY is not set.');

  // Verifies the caller's own session JWT and resolves exactly which user
  // this is — the client never supplies, and this function never trusts, a
  // user id from the request body. Only the authenticated session's own id
  // is ever used, so this can only ever delete the caller's own account. A
  // missing/invalid/expired session is rejected here with 401 before any
  // database access — an unauthenticated request never reaches
  // performAccountDeletion at all.
  const auth = await requireUser(req);
  if ('error' in auth) return errorResponse(401, 'unauthorized', auth.error);
  const { user } = auth;

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
  const result = await performAccountDeletion(admin, user.id);
  if (!result.ok) {
    console.error('[delete-account] deletion failed:', result.error);
    return errorResponse(500, 'internal_error', 'Failed to delete your account. Please try again or contact support.');
  }

  return jsonResponse({ status: 'ok' });
});
