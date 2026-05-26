import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | null = null;

export function isSupabaseConfigured(): boolean {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

/** Server-only client (service role — bypasses RLS). Never expose to the browser. */
export function getSupabaseAdmin(): SupabaseClient {
  if (!isSupabaseConfigured()) {
    throw new Error(
      'Supabase no configurado. Agregá NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en .env.local'
    );
  }
  if (!client) {
    client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } }
    );
  }
  return client;
}

export const supabaseRepositoriesReady = isSupabaseConfigured();
