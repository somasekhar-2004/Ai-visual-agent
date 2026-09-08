// Every function is invoked by the mobile app via supabase-js's
// `functions.invoke()`, which does not go through browser CORS on native —
// but the same client code also runs unmodified in the Expo web build, so
// these headers keep that path working too. `*` is fine here because these
// endpoints are authenticated by the caller's Supabase session JWT, not by
// origin — origin is not a security boundary for this API.
export const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

export function handleCorsPreflight(req: Request): Response | null {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  return null;
}
