export const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
export const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';
export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

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
 * The app runs in Demo Mode whenever Supabase isn't configured (no project
 * wired up yet). Every feature works against a local, seeded, on-device
 * store instead of a real backend — see lib/demoStore.ts.
 */
export const isDemoMode = !isSupabaseConfigured;
