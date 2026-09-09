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
