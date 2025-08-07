import React, { useState, useEffect } from 'react';

const VercelDebug = () => {
  const [envVars, setEnvVars] = useState({});
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    // Vérifier les variables d'environnement
    const vars = {
      'VITE_SUPABASE_URL': import.meta.env.VITE_SUPABASE_URL,
      'VITE_SUPABASE_ANON_KEY': import.meta.env.VITE_SUPABASE_ANON_KEY,
      'VITE_APP_URL': import.meta.env.VITE_APP_URL,
      'VITE_APP_NAME': import.meta.env.VITE_APP_NAME,
      'MODE': import.meta.env.MODE,
      'DEV': import.meta.env.DEV,
      'PROD': import.meta.env.PROD
    };
    setEnvVars(vars);

    // Vérifier les erreurs
    const errorList = [];
    if (!vars['VITE_SUPABASE_URL']) errorList.push('VITE_SUPABASE_URL manquante');
    if (!vars['VITE_SUPABASE_ANON_KEY']) errorList.push('VITE_SUPABASE_ANON_KEY manquante');
    if (vars['VITE_SUPABASE_URL'] === 'https://your-project-id.supabase.co') errorList.push('VITE_SUPABASE_URL non configurée');
    
    setErrors(errorList);

    // Capturer les erreurs JavaScript
    window.addEventListener('error', (event) => {
      setErrors(prev => [...prev, `JS Error: ${event.message}`]);
    });

    window.addEventListener('unhandledrejection', (event) => {
      setErrors(prev => [...prev, `Promise Error: ${event.reason}`]);
    });
  }, []);

  // Ne s'afficher qu'en mode développement ou si il y a des erreurs
  if (import.meta.env.PROD && errors.length === 0) {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      backgroundColor: '#1a1a1a',
      color: '#fff',
      padding: '20px',
      fontFamily: 'monospace',
      fontSize: '12px',
      zIndex: 9999,
      maxHeight: '50vh',
      overflow: 'auto',
      borderBottom: '2px solid #e74c3c'
    }}>
      <h3 style={{ color: '#e74c3c', margin: '0 0 10px 0' }}>
        🔍 Diagnostic Vercel - {import.meta.env.PROD ? 'PRODUCTION' : 'DÉVELOPPEMENT'}
      </h3>
      
      <div style={{ marginBottom: '15px' }}>
        <strong>Variables d'environnement :</strong>
        {Object.entries(envVars).map(([key, value]) => (
          <div key={key} style={{ margin: '2px 0' }}>
            <span style={{ color: value ? '#2ecc71' : '#e74c3c' }}>
              {value ? '✅' : '❌'} {key}:
            </span>
            <span style={{ marginLeft: '10px', color: '#bdc3c7' }}>
              {key.includes('KEY') ? 
                (value ? `${value.substring(0, 30)}...` : 'MANQUANTE') : 
                (value || 'MANQUANTE')}
            </span>
          </div>
        ))}
      </div>

      {errors.length > 0 && (
        <div style={{ marginBottom: '15px' }}>
          <strong style={{ color: '#e74c3c' }}>Erreurs détectées :</strong>
          {errors.map((error, index) => (
            <div key={index} style={{ color: '#e74c3c', margin: '2px 0' }}>
              ❌ {error}
            </div>
          ))}
        </div>
      )}

      {errors.length > 0 && (
        <div style={{ 
          backgroundColor: '#2c3e50', 
          padding: '10px', 
          borderRadius: '5px',
          marginTop: '10px'
        }}>
          <strong>🔧 Solution :</strong>
          <ol style={{ margin: '5px 0', paddingLeft: '20px' }}>
            <li>Allez sur vercel.com</li>
            <li>Sélectionnez votre projet officielbenome</li>
            <li>Settings > Environment Variables</li>
            <li>Ajoutez les variables Supabase manquantes</li>
            <li>Redeployez l'application</li>
          </ol>
        </div>
      )}

      <button 
        onClick={() => window.location.reload()} 
        style={{
          backgroundColor: '#3498db',
          color: '#fff',
          border: 'none',
          padding: '5px 10px',
          borderRadius: '3px',
          cursor: 'pointer',
          marginTop: '10px'
        }}
      >
        🔄 Recharger
      </button>
    </div>
  );
};

export default VercelDebug; 