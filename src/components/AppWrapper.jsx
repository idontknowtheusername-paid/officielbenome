import React, { useEffect, useState } from 'react';
import { isSupabaseConfigured } from '@/lib/supabase';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n/config';

const AppWrapper = ({ children }) => {
  const [i18nReady, setI18nReady] = useState(false);

  useEffect(() => {
    // Attendre que i18n soit initialisé
    if (i18n.isInitialized) {
      setI18nReady(true);
    } else {
      i18n.on('initialized', () => {
        setI18nReady(true);
      });
    }
  }, []);

  // Si Supabase n'est pas configure, afficher un message au lieu de planter
  if (!isSupabaseConfigured) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1a1a1a',
        color: '#fff',
        fontFamily: 'Arial, sans-serif',
        padding: '20px',
        textAlign: 'center'
      }}>
        <div>
          <h1 style={{ color: '#e74c3c', marginBottom: '20px' }}>
            ⚠️ Configuration Supabase requise
          </h1>
          <p style={{ marginBottom: '15px' }}>
            L'application nécessite la configuration des variables Supabase.
          </p>
          <div style={{
            backgroundColor: '#2c3e50',
            padding: '15px',
            borderRadius: '5px',
            textAlign: 'left',
            marginBottom: '20px'
          }}>
            <strong>Variables requises dans Vercel :</strong>
            <div style={{ marginTop: '10px', fontFamily: 'monospace' }}>
              VITE_SUPABASE_URL<br/>
              VITE_SUPABASE_ANON_KEY
            </div>
          </div>
          <button 
            onClick={() => window.location.reload()}
            style={{
              backgroundColor: '#3498db',
              color: '#fff',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            🔄 Recharger
          </button>
        </div>
      </div>
    );
  }

  // Si Supabase est configure, afficher l'app normale avec i18n
  if (!i18nReady) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1a1a1a',
        color: '#fff',
        fontFamily: 'Arial, sans-serif',
        padding: '20px',
        textAlign: 'center'
      }}>
        <div>
          <h1 style={{ color: '#3498db', marginBottom: '20px' }}>
            🌍 Initialisation de l'internationalisation...
          </h1>
          <p>Chargement des traductions...</p>
        </div>
      </div>
    );
  }

  return (
    <I18nextProvider i18n={i18n}>
      {children}
    </I18nextProvider>
  );
};

export default AppWrapper;