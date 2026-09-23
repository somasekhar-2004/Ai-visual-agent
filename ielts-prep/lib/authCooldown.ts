import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * The single shared resend-cooldown duration for every auth email resend
 * flow (signup confirmation, password reset). Applied optimistically right
 * after a request Supabase actually accepted (which itself carries no
 * cooldown info back) so the button doesn't invite an immediate rate-limit
 * error; a real 429 response overrides this with the exact remaining time
 * Supabase reports (see services/auth.ts's parseRetryAfterSeconds).
 *
 * Deliberately the one place this number is defined — do not hardcode 60
 * anywhere else. If this changes, every resend flow changes with it.
 */
export const AUTH_RESEND_COOLDOWN_SECONDS = 60;

/** Independent cooldown "lanes" — a signup-confirmation resend and a
 * password-reset resend must never block each other. */
export type AuthCooldownKey = 'signup-confirmation' | 'password-reset';

function storageKey(cooldownKey: AuthCooldownKey, email: string): string {
  return `ielts-prep/auth/cooldown/${cooldownKey}/${email.trim().toLowerCase()}`;
}

/** Returns the absolute expiry timestamp (ms since epoch) for this
 * cooldown lane + email, or null if none is active. Storing an absolute
 * timestamp — rather than a remaining-seconds counter — is what lets the
 * cooldown survive a component remount or the app being backgrounded and
 * resumed: elapsed time is recomputed from `Date.now()`, never assumed from
 * whatever the in-memory countdown last rendered. */
export async function getCooldownExpiry(cooldownKey: AuthCooldownKey, email: string): Promise<number | null> {
  if (!email) return null;
  const raw = await AsyncStorage.getItem(storageKey(cooldownKey, email));
  if (!raw) return null;
  const expiry = Number(raw);
  return Number.isFinite(expiry) ? expiry : null;
}

/** Starts (or replaces) the cooldown for this lane + email, `seconds` from
 * now, and returns the resulting absolute expiry timestamp. */
export async function startCooldown(cooldownKey: AuthCooldownKey, email: string, seconds: number): Promise<number> {
  const expiresAt = Date.now() + seconds * 1000;
  await AsyncStorage.setItem(storageKey(cooldownKey, email), String(expiresAt));
  return expiresAt;
}

export async function clearCooldown(cooldownKey: AuthCooldownKey, email: string): Promise<void> {
  await AsyncStorage.removeItem(storageKey(cooldownKey, email));
}
