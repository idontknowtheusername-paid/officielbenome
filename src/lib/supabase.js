import { createClient } from '@supabase/supabase-js'

// Fix pour URL Supabase malformee (manque https://)
let supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

console.log('🔍 Variables d\'environnement détectées:');
console.log('🔍 VITE_SUPABASE_URL:', supabaseUrl);
console.log('🔍 VITE_SUPABASE_ANON_KEY length:', supabaseAnonKey?.length);

// Corriger l'URL si elle commence par // au lieu de https://
if (supabaseUrl && supabaseUrl.startsWith('//')) {
  supabaseUrl = 'https:' + supabaseUrl;
  console.log('🔧 URL Supabase corrigée:', supabaseUrl);
}

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

console.log('🔍 isSupabaseConfigured:', isSupabaseConfigured);

// Ne pas faire planter l'application en production si les variables manquent
if (!isSupabaseConfigured) {
  console.error('Supabase non configuré: VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY manquants')
}

// Configuration de sécurité professionnelle
const SECURITY_CONFIG = {
  // Session active : 30 minutes
  sessionTimeout: 30 * 60 * 1000, // 30 minutes en millisecondes
  // Option "Se souvenir" : 1 jour (au lieu de 7)
  rememberMeDays: 1,
  // Renouvellement automatique des tokens
  autoRefresh: true,
  // Détection de session dans l'URL
  detectSessionInUrl: true,
  // Persistance des sessions (désactivée pour forcer la reconnexion)
  persistSession: false
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      autoRefreshToken: SECURITY_CONFIG.autoRefresh,
      persistSession: SECURITY_CONFIG.persistSession,
      detectSessionInUrl: SECURITY_CONFIG.detectSessionInUrl,
      flowType: 'pkce', // Plus sécurisé que implicit
      debug: import.meta.env.DEV, // Debug uniquement en développement
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
    global: {
      headers: {
        'X-Client-Info': 'maximarket-web'
      }
    }
  }
)

// Logs utiles en developpement
if (import.meta.env.DEV) {
  console.log('🔧 Mode développement activé')
  console.log('📡 Supabase URL:', supabaseUrl)
  console.log('✅ Supabase configuré:', isSupabaseConfigured)
  console.log('🔑 Clé API longueur:', supabaseAnonKey?.length)
  console.log('⚙️ Configuration sécurité:', SECURITY_CONFIG)
}

export { SECURITY_CONFIG }
export default supabase