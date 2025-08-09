import { createClient } from '@supabase/supabase-js'

// Fix pour URL Supabase malformee (manque https://)
let supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Corriger l'URL si elle commence par // au lieu de https://
if (supabaseUrl && supabaseUrl.startsWith('//')) {
  supabaseUrl = 'https:' + supabaseUrl;
  console.log('🔧 URL Supabase corrigée:', supabaseUrl);
}

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

// Ne pas faire planter l'application en production si les variables manquent
if (!isSupabaseConfigured) {
  console.error('Supabase non configuré: VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY manquants')
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
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
  }
)

// Logs utiles en developpement
if (import.meta.env.DEV) {
  console.log('🔧 Mode développement activé')
  console.log('📡 Supabase URL:', supabaseUrl)
  console.log('✅ Supabase configuré:', isSupabaseConfigured)
}

export default supabase