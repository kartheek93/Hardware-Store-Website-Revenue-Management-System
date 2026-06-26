import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

/**
 * True only when both env vars are present. The UI uses this to show a
 * friendly "connect Supabase" banner instead of crashing when the
 * project hasn't been wired up yet.
 */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

if (!isSupabaseConfigured) {
  // Loud, actionable warning rather than a cryptic runtime crash.
  console.warn(
    '[MahairaSystem] Supabase is not configured.\n' +
      'Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file, ' +
      'then restart the dev server. See README.md → "Connect Supabase".'
  )
}

/**
 * Single shared Supabase client for the whole app.
 * Falls back to harmless placeholder values when unconfigured so that
 * importing this module never throws — pages guard on isSupabaseConfigured.
 */
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
)
