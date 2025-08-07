import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

// Ne pas faire planter l'application en production si les variables manquent
if (!isSupabaseConfigured) {
  console.error('Supabase non configuré: VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY manquants')
}

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    })
  : null

// Logs utiles en développement
if (import.meta.env.DEV) {
  console.log('🔧 Mode développement activé')
  console.log('📡 Supabase URL:', supabaseUrl)
  console.log('✅ Supabase configuré:', isSupabaseConfigured)
}

export default supabase