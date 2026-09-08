import AsyncStorage from '@react-native-async-storage/async-storage';

import { isDemoMode } from '@/lib/env';
import { DEMO_USER_ID } from '@/lib/demoStore';
import { supabase } from '@/lib/supabase';

const DEMO_SESSION_KEY = 'ielts-prep/auth/demo-session';
const ONBOARDING_KEY = 'ielts-prep/auth/onboarding-complete';

export type AuthResult = { userId: string } | { error: string };

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
  if (error) return { error: error.message };
  if (!data.user) return { error: 'Sign up did not return a user. Check your email to confirm your account.' };
  return { userId: data.user.id };
}

export async function signInWithEmail(email: string, password: string): Promise<AuthResult> {
  if (isDemoMode) return signInDemo();
  const { data, error } = await supabase!.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };
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
