export const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
export const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';
export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

export type AiProviderName = 'mock' | 'openai' | 'anthropic';
export const AI_PROVIDER = (process.env.EXPO_PUBLIC_AI_PROVIDER as AiProviderName) || 'mock';
export const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY ?? '';
export const ANTHROPIC_API_KEY = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY ?? '';

export const REVENUECAT_API_KEY_IOS = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY ?? '';
export const REVENUECAT_API_KEY_ANDROID = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY ?? '';
export const isRevenueCatConfigured = Boolean(REVENUECAT_API_KEY_IOS || REVENUECAT_API_KEY_ANDROID);

/**
 * The app runs in Demo Mode whenever Supabase isn't configured (no project
 * wired up yet). Every feature works against a local, seeded, on-device
 * store instead of a real backend — see lib/demoStore.ts.
 */
export const isDemoMode = !isSupabaseConfigured;
