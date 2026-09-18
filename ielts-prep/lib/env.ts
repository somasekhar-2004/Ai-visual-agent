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

// `__DEV__` is false for any release JS bundle — every EAS profile except
// `development` (the only one with developmentClient: true) — and true only
// for a Metro dev-server/development-client session. This is deliberately
// NOT "is this the `production` EAS profile specifically": an internal-test
// `preview` build is just as much a release a real user could install as
// `production` is, and must never show fabricated demo data either.
const isReleaseBuild = !__DEV__;

/**
 * The app runs in Demo Mode whenever Supabase isn't configured (no project
 * wired up yet) — but ONLY in a local development build. Every feature
 * works against a local, seeded, on-device store instead of a real backend
 * — see lib/demoStore.ts.
 *
 * A release build (an EAS `preview` or `production` build — anything a real
 * user could install) must NEVER silently substitute that fabricated demo
 * data ("Alex", seeded bands, a 3-day streak) for a real account just
 * because its Supabase env vars are missing or malformed — see the exact
 * production incident this guards against in git history. See
 * isBackendMisconfigured below for what a release build shows instead.
 */
export const isDemoMode = !isSupabaseConfigured && !isReleaseBuild;

/**
 * True only for a release build whose Supabase config is missing or
 * invalid — the state app/_layout.tsx renders a full-screen configuration
 * error for instead of either crashing or falling back to Demo Mode.
 */
export const isBackendMisconfigured = !isSupabaseConfigured && isReleaseBuild;
