import React from 'react';
import { isSupabaseConfigured } from '@/lib/supabase';

const AppWrapper = ({ children }) => {
  // Si Supabase n'est pas configuré, afficher un message au lieu de planter
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

  // Si Supabase est configuré, afficher l'app normale
  return children;
};

export default AppWrapper;