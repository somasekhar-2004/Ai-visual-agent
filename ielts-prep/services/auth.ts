import AsyncStorage from '@react-native-async-storage/async-storage';

import { isDemoMode } from '@/lib/env';
import { DEMO_USER_ID } from '@/lib/demoStore';
import { supabase } from '@/lib/supabase';

const DEMO_SESSION_KEY = 'ielts-prep/auth/demo-session';
const ONBOARDING_KEY = 'ielts-prep/auth/onboarding-complete';

export type AuthResult = { userId: string } | { error: string } | { pendingConfirmation: true; email: string };

/** Turns a raw Supabase auth error into copy a user can act on, using the
 * stable `error.code` values Supabase documents (auth-js's `ErrorCode`
 * union) rather than matching on `error.message` text, which is not a
 * documented, stable contract. */
function friendlyAuthErrorMessage(error: { code?: string; message: string }): string {
  switch (error.code) {
    case 'over_email_send_rate_limit':
      return 'Too many emails were requested for this address recently. Please wait a few minutes, then try again — also check spam for one already sent.';
    case 'user_already_exists':
    case 'email_exists':
      return 'An account with this email already exists and is confirmed. Please sign in instead.';
    case 'email_not_confirmed':
      return 'This account has not confirmed its email yet. Check your inbox, or use "Resend confirmation email".';
    default:
      return error.message;
  }
}

/** Returns the signed-in user's id, or null if nobody is signed in. Works transparently across demo mode and real Supabase auth. */
export async function getCurrentUserId(): Promise<string | null> {
  if (isDemoMode) {
    const flag = await AsyncStorage.getItem(DEMO_SESSION_KEY);
    return flag === '1' ? DEMO_USER_ID : null;
  }
  const { data } = await supabase!.auth.getSession();
  return data.session?.user.id ?? null;
}

export async function hasCompletedOnboarding(): Promise<boolean> {
  return (await AsyncStorage.getItem(ONBOARDING_KEY)) === '1';
}

export async function setOnboardingComplete(): Promise<void> {
  await AsyncStorage.setItem(ONBOARDING_KEY, '1');
}

/** Signs the user into demo mode instantly — no credentials required. */
export async function signInDemo(): Promise<AuthResult> {
  await AsyncStorage.setItem(DEMO_SESSION_KEY, '1');
  return { userId: DEMO_USER_ID };
}

export async function signUpWithEmail(email: string, password: string, fullName: string): Promise<AuthResult> {
  if (isDemoMode) return signInDemo();
  const { data, error } = await supabase!.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });
  if (error) return { error: friendlyAuthErrorMessage(error) };
  if (!data.user) return { error: 'Sign up did not return a user. Check your email to confirm your account.' };
  // Anti-enumeration: when the email already belongs to a CONFIRMED account,
  // Supabase returns success with an empty `identities` array instead of an
  // error, so a confirmed duplicate must be detected explicitly here.
  if (data.user.identities && data.user.identities.length === 0) {
    return { error: 'An account with this email already exists and is confirmed. Please sign in instead.' };
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
 * clearly instead of a raw "over_email_send_rate_limit" message). */
export async function resendConfirmationEmail(email: string): Promise<{ ok: boolean; error?: string }> {
  if (isDemoMode) return { ok: true };
  const { error } = await supabase!.auth.resend({ type: 'signup', email });
  if (error) return { ok: false, error: friendlyAuthErrorMessage(error) };
  return { ok: true };
}

export async function signInWithEmail(email: string, password: string): Promise<AuthResult> {
  if (isDemoMode) return signInDemo();
  const { data, error } = await supabase!.auth.signInWithPassword({ email, password });
  if (error) {
    // Give this its own outcome (rather than a plain error string) so the
    // sign-in screen can offer "Resend confirmation email" for it, the same
    // as the pending-confirmation outcome from signUpWithEmail.
    if (error.code === 'email_not_confirmed') return { pendingConfirmation: true, email };
    return { error: friendlyAuthErrorMessage(error) };
  }
  return { userId: data.user.id };
}

export async function sendPasswordReset(email: string): Promise<{ ok: boolean; error?: string }> {
  if (isDemoMode) return { ok: true };
  const { error } = await supabase!.auth.resetPasswordForEmail(email);
  return error ? { ok: false, error: error.message } : { ok: true };
}

/**
 * Deletes the current user's account. In Demo Mode this clears the local
 * on-device database. Against a real Supabase project, self-service account
 * deletion requires a server-side Edge Function (the anon/client key cannot
 * call `auth.admin.deleteUser`) — see README.md "Account deletion" for the
 * function to deploy; this calls it via RPC if present, and otherwise
 * surfaces guidance instead of silently no-op'ing.
 */
export async function deleteAccount(): Promise<{ ok: boolean; message?: string }> {
  if (isDemoMode) {
    const { resetDb } = await import('@/lib/demoStore');
    await resetDb();
    await AsyncStorage.removeItem(DEMO_SESSION_KEY);
    return { ok: true };
  }
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
  if (isDemoMode) {
    await AsyncStorage.removeItem(DEMO_SESSION_KEY);
    return;
  }
  await supabase!.auth.signOut();
}
