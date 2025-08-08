// Configuration par défaut pour éviter les erreurs de build
export const DEFAULT_CONFIG = {
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key',
  },
  app: {
    name: import.meta.env.VITE_APP_NAME || 'Officiel BenoMe',
    url: import.meta.env.VITE_APP_URL || 'http://localhost:5173',
  },
  debug: import.meta.env.VITE_DEBUG === 'true',
  logLevel: import.meta.env.VITE_LOG_LEVEL || 'info',
};

// Vérifier si la configuration est valide
export const isConfigValid = () => {
  const { supabase } = DEFAULT_CONFIG;
  return supabase.url !== 'https://placeholder.supabase.co' && 
         supabase.anonKey !== 'placeholder-key';
}; 