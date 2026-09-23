import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import { isSupabaseConfigured, SUPABASE_ANON_KEY, SUPABASE_URL } from './env';

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
        // PKCE (rather than the implicit-flow default) returns the email
        // confirmation link's payload as a `?code=` query parameter instead
        // of a `#access_token=...` URL fragment. Query parameters survive
        // Expo Router's deep-link parsing reliably; fragments often don't —
        // see app/confirm.tsx, which exchanges that code for a session.
        flowType: 'pkce',
      },
    })
  : null;

/**
 * A second, minimal client used ONLY for `resetPasswordForEmail()` — never
 * for anything a real signed-in session should touch (it never persists a
 * session, on this device or anywhere else).
 *
 * Why this can't share `supabase` above: with `flowType: 'pkce'`,
 * `resetPasswordForEmail()` generates a PKCE code_verifier and writes it to
 * `this.storage` — this device's AsyncStorage — then sends only the
 * resulting code_challenge to Supabase. The recovery email link that comes
 * back then carries a `?code=` that can only be exchanged for a session by
 * whichever client holds that exact verifier. But the recovery link is
 * opened by tapping it in an email app, landing in a mobile *browser* (the
 * password-reset page on GitHub Pages) — a completely different JS
 * context with its own storage, which never had access to this device's
 * AsyncStorage in the first place. That page can never complete a PKCE
 * exchange it was never given the verifier for, by design (that's the
 * entire point of PKCE) — this is not a bug to route around, it's PKCE
 * doing its job on a flow that structurally spans two different clients.
 *
 * Using an `implicit`-flow client for this one call instead sidesteps the
 * problem entirely: no code_challenge is sent, so Supabase's `/recover`
 * issues the recovery link as self-contained `#access_token=...&
 * refresh_token=...&type=recovery` URL fragment tokens (see auth-js's
 * `resetPasswordForEmail`/`_getSessionFromURL`). Those tokens need no
 * verifier to redeem — any client, on any device, can call
 * `supabase.auth.getSession()`/listen for the `PASSWORD_RECOVERY` event to
 * establish a session directly from them. This is the officially documented
 * pattern for a password-recovery link that is completed somewhere other
 * than where it was requested, which is effectively always true for email.
 *
 * `persistSession`/`autoRefreshToken` are off because this client only ever
 * sends the recovery *request*; it never receives or holds the resulting
 * session itself (only the GitHub Pages page does, in its own separate
 * supabase-js instance — see reset-password/index.html in the
 * somasekhar-2004/bandpath-public repo).
 */
export const supabasePasswordResetClient: SupabaseClient | null = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
        flowType: 'implicit',
      },
    })
  : null;
