export const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
export const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

// Catches a malformed value (e.g. a Markdown link `[https://x](https://x)`
// pasted into an EAS env var instead of the raw URL) at config-check time,
// rather than letting @supabase/supabase-js's createClient() throw on it —
// see lib/supabase.ts, which only calls createClient() once this is true.
function isValidHttpsUrl(value: string): boolean {
  if (!value) return false;
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
}

export const isSupabaseUrlValid = isValidHttpsUrl(SUPABASE_URL);
export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY && isSupabaseUrlValid);

/**
 * Human-readable (and secret-free — it never echoes SUPABASE_URL or
 * SUPABASE_ANON_KEY's actual values) description of why Supabase isn't
 * configured, or null when it is. Used by the release-build configuration
 * error screen (see isBackendMisconfigured below and app/_layout.tsx) and
 * safe to show on-screen or log.
 */
export function getSupabaseConfigIssue(): string | null {
  if (!SUPABASE_URL && !SUPABASE_ANON_KEY) {
    return 'EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY are both missing.';
  }
  if (!SUPABASE_URL) return 'EXPO_PUBLIC_SUPABASE_URL is missing.';
  if (!isSupabaseUrlValid) return 'EXPO_PUBLIC_SUPABASE_URL is not a valid https:// URL.';
  if (!SUPABASE_ANON_KEY) return 'EXPO_PUBLIC_SUPABASE_ANON_KEY is missing.';
  return null;
}

// There is deliberately no client-side AI provider name or API key here.
// OPENAI_API_KEY / ANTHROPIC_API_KEY / AI_PROVIDER live only in the
// Supabase Edge Function runtime (supabase secrets set — see
// supabase/functions/.env.example), never in this app's bundle. The client
// only needs to know whether a backend exists to call at all
// (isSupabaseConfigured, above) — see services/ai/index.ts.

export const REVENUECAT_API_KEY_IOS = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY ?? '';
export const REVENUECAT_API_KEY_ANDROID = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY ?? '';
export const isRevenueCatConfigured = Boolean(REVENUECAT_API_KEY_IOS || REVENUECAT_API_KEY_ANDROID);

/**
 * True whenever Supabase isn't configured or its config is invalid — in
 * EVERY build type (production, preview, AND local development). There is
 * no Demo Mode / fake-data fallback anywhere in this app any more: a
 * missing or malformed backend config always renders the full-screen
 * ConfigurationErrorScreen (see app/_layout.tsx) instead of substituting
 * fabricated data ("Alex", seeded bands, a 3-day streak) for a real
 * account — see the exact production incident this guards against in git
 * history.
 */
export const isBackendMisconfigured = !isSupabaseConfigured;
