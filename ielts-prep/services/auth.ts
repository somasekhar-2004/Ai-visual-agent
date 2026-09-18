import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Linking from 'expo-linking';

import { supabase } from '@/lib/supabase';

const ONBOARDING_KEY = 'ielts-prep/auth/onboarding-complete';

// Where Supabase sends the browser after verifying a signup confirmation
// link. In a production/preview (standalone) build this resolves to
// `ieltsprep://confirm` — app.json's top-level "scheme" — via Expo Router's
// file-based linking to app/confirm.tsx, which is what this resolves to.
//
// This exact value (or a wildcard covering it, e.g. `ieltsprep://*`) MUST be
// added to the Supabase project's Auth → URL Configuration → Redirect URLs
// allowlist. If it isn't, Supabase does NOT error — it silently falls back
// to the project's "Site URL" instead (every fresh Supabase project's Site
// URL defaults to `http://localhost:3000`), which is exactly the
// `localhost:3000` / ERR_FAILED bug real-device testing found: the app side
// was already building the correct deep link, but Supabase never used it
// because nothing had allowlisted it in the Dashboard.
export const EMAIL_CONFIRMATION_REDIRECT_URL = Linking.createURL('confirm');

export type AuthResult =
  | { userId: string }
  | { error: string; retryAfterSeconds?: number }
  | { pendingConfirmation: true; email: string; alreadyRegistered?: boolean }
  | { existingConfirmedAccount: true; email: string };

/** Supabase's over_email_send_rate_limit message includes the exact wait
 * time (e.g. "For security purposes, you can only request this after 58
 * seconds."), so the countdown shown to the user reflects the real
 * server-enforced cooldown rather than a guessed constant. */
function parseRetryAfterSeconds(message: string): number | undefined {
  const match = message.match(/(\d+)\s*seconds?/i);
  return match ? Number(match[1]) : undefined;
}

/** Turns a raw Supabase auth error into copy a user can act on, using the
 * stable `error.code` values Supabase documents (auth-js's `ErrorCode`
 * union) rather than matching on `error.message` text, which is not a
 * documented, stable contract. */
function friendlyAuthErrorMessage(error: { code?: string; message: string }): { message: string; retryAfterSeconds?: number } {
  switch (error.code) {
    case 'over_email_send_rate_limit': {
      const retryAfterSeconds = parseRetryAfterSeconds(error.message);
      return {
        message: retryAfterSeconds
          ? `Please wait ${retryAfterSeconds} seconds before requesting another email.`
          : 'Too many emails were requested for this address recently. Please wait a few minutes, then try again.',
        retryAfterSeconds,
      };
    }
    default:
      return { message: error.message };
  }
}

/**
 * The only reliable way to tell a CONFIRMED existing account apart from an
 * UNCONFIRMED one when signUp() reports "this email is already taken"
 * (whether via an explicit user_already_exists/email_exists error, or —
 * with anti-enumeration protection on — a bare success with an empty
 * `identities` array): actually attempt the resend a returning, still-
 * unconfirmed user would need anyway, via auth.resend(), and read what
 * really happens. This is deliberately NOT inferred from the identities
 * array alone — Supabase returns that same ambiguous shape for both a
 * confirmed and an unconfirmed existing account (community-confirmed by a
 * Supabase maintainer: the old identities-length-only heuristic "has
 * changed since" it was first documented), so treating it as "confirmed"
 * on its own produces exactly the false "already exists and is confirmed"
 * message for a genuinely unconfirmed account that this function fixes.
 *
 * - Resend succeeds → a fresh confirmation link really was just sent, so
 *   the account was unconfirmed.
 * - Resend fails because of the rate limit → genuinely can't tell right
 *   now; surface that plainly rather than guessing either way.
 * - Resend fails for any other reason → there was no pending confirmation
 *   left to resend, which only happens for an already-confirmed account.
 */
async function disambiguateExistingAccount(email: string): Promise<AuthResult> {
  const resend = await resendConfirmationEmail(email);
  if (resend.ok) return { pendingConfirmation: true, email, alreadyRegistered: true };
  if (resend.retryAfterSeconds) return { error: resend.error ?? 'Please try again shortly.', retryAfterSeconds: resend.retryAfterSeconds };
  return { existingConfirmedAccount: true, email };
}

/** Returns the signed-in user's id, or null if nobody is signed in. */
export async function getCurrentUserId(): Promise<string | null> {
  const { data } = await supabase!.auth.getSession();
  return data.session?.user.id ?? null;
}

export async function hasCompletedOnboarding(): Promise<boolean> {
  return (await AsyncStorage.getItem(ONBOARDING_KEY)) === '1';
}

export async function setOnboardingComplete(): Promise<void> {
  await AsyncStorage.setItem(ONBOARDING_KEY, '1');
}

export async function signUpWithEmail(email: string, password: string, fullName: string): Promise<AuthResult> {
  const { data, error } = await supabase!.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName }, emailRedirectTo: EMAIL_CONFIRMATION_REDIRECT_URL },
  });
  // Some Supabase configurations report a duplicate email as an explicit
  // error instead of the ambiguous "success with empty identities" case
  // below — either way, whether it's confirmed is verified the same way,
  // never assumed from the error code alone.
  if (error && (error.code === 'user_already_exists' || error.code === 'email_exists')) {
    return disambiguateExistingAccount(email);
  }
  if (error) {
    const { message, retryAfterSeconds } = friendlyAuthErrorMessage(error);
    return { error: message, retryAfterSeconds };
  }
  if (!data.user) return { error: 'Sign up did not return a user. Check your email to confirm your account.' };
  if (data.user.identities && data.user.identities.length === 0) {
    return disambiguateExistingAccount(email);
  }
  if (!data.session) {
    // This Supabase project requires email confirmation: signUp() creates
    // (or, for an existing unconfirmed user, resends to) the user but starts
    // no session, so the client has no auth.uid() yet. Proceeding to
    // onboarding writes here would hit RLS-protected tables (e.g. user_goals)
    // with no authenticated user and fail. Surface this distinctly instead
    // of returning a userId the caller would wrongly treat as signed in.
    return { pendingConfirmation: true, email };
  }
  return { userId: data.user.id };
}

/** Resends the signup confirmation email for an account that hasn't
 * confirmed yet — the purpose-built API for this (rather than calling
 * signUpWithEmail again), with the same friendly error mapping (in
 * particular, this is what surfaces Supabase's per-address send-rate-limit
 * clearly, with the exact cooldown, instead of a raw
 * "over_email_send_rate_limit" message). Never throws — a genuine network
 * failure (no connectivity, DNS failure) can make auth.resend()'s
 * underlying fetch reject outright rather than resolve with { error }, so
 * that's caught here too and folded into the same { ok: false } shape every
 * caller already handles, instead of leaving an unhandled rejection that
 * left the resend button stuck showing "Sending…" forever. */
export async function resendConfirmationEmail(email: string): Promise<{ ok: boolean; error?: string; retryAfterSeconds?: number }> {
  try {
    const { error } = await supabase!.auth.resend({
      type: 'signup',
      email,
      options: { emailRedirectTo: EMAIL_CONFIRMATION_REDIRECT_URL },
    });
    if (error) {
      const { message, retryAfterSeconds } = friendlyAuthErrorMessage(error);
      return { ok: false, error: message, retryAfterSeconds };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, error: (err as Error).message || 'Could not resend the confirmation email. Check your connection and try again.' };
  }
}

/** Exchanges the one-time `code` from a tapped email-confirmation link
 * (app/confirm.tsx's deep link) for a real session — the PKCE counterpart to
 * the implicit flow's URL-fragment tokens. A failure here (invalid, already
 * used, or expired code) is surfaced as a plain message; the confirm screen
 * points the user back to sign-in, which already offers "Resend confirmation
 * email" for an account that still isn't confirmed. */
export async function exchangeConfirmationCode(code: string): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabase!.auth.exchangeCodeForSession(code);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function signInWithEmail(email: string, password: string): Promise<AuthResult> {
  const { data, error } = await supabase!.auth.signInWithPassword({ email, password });
  if (error) {
    // Give this its own outcome (rather than a plain error string) so the
    // sign-in screen can offer "Resend confirmation email" for it, the same
    // as the pending-confirmation outcome from signUpWithEmail.
    if (error.code === 'email_not_confirmed') return { pendingConfirmation: true, email };
    const { message, retryAfterSeconds } = friendlyAuthErrorMessage(error);
    return { error: message, retryAfterSeconds };
  }
  return { userId: data.user.id };
}

export async function sendPasswordReset(email: string): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabase!.auth.resetPasswordForEmail(email);
  return error ? { ok: false, error: error.message } : { ok: true };
}

/**
 * Deletes the current user's account. Self-service account deletion
 * requires a server-side Edge Function (the anon/client key cannot call
 * `auth.admin.deleteUser`) — see README.md "Account deletion" for the
 * function to deploy; this calls it via RPC if present, and otherwise
 * surfaces guidance instead of silently no-op'ing.
 */
export async function deleteAccount(): Promise<{ ok: boolean; message?: string }> {
  const { error } = await supabase!.functions.invoke('delete-account');
  if (error) {
    return {
      ok: false,
      message: 'Account deletion requires the "delete-account" Edge Function to be deployed on your Supabase project — see README.md.',
    };
  }
  await supabase!.auth.signOut();
  return { ok: true };
}

export async function signOut(): Promise<void> {
  await supabase!.auth.signOut();
}
