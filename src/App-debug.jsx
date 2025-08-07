import React from 'react';

// Test d'imports statiques pour identifier le problème
console.log('🔍 App-debug: Import React OK');

let importStatus = {
  router: 'pending',
  toaster: 'pending', 
  auth: 'pending'
};

// Test imports statiques
try {
  console.log('Testing React Router import...');
  const { BrowserRouter } = require('react-router-dom');
  importStatus.router = 'success';
  console.log('✅ React Router import OK');
} catch (error) {
  importStatus.router = 'failed: ' + error.message;
  console.error('❌ React Router import FAILED:', error);
}

function App() {
  console.log('🔍 App-debug: Render démarré');
  
  const [debugInfo, setDebugInfo] = React.useState({
    timestamp: new Date().toISOString(),
    renderCount: 0,
    errors: []
  });

  React.useEffect(() => {
    console.log('🔍 App-debug: useEffect démarré');
    setDebugInfo(prev => ({
      ...prev,
      renderCount: prev.renderCount + 1
    }));
  }, []);

  const addError = (error) => {
    console.error('❌ Erreur détectée:', error);
    setDebugInfo(prev => ({
      ...prev,
      errors: [...prev.errors, error.toString()]
    }));
  };

  React.useEffect(() => {
    // Capturer les erreurs JavaScript
    const handleError = (event) => {
      addError(event.error || event.message);
    };
    
    const handleUnhandledRejection = (event) => {
      addError(event.reason);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  console.log('🔍 App-debug: Rendu JSX');

  return (
    <div style={{
      minHeight: '100vh',
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f8f9fa',
      color: '#333'
    }}>
      <h1 style={{ color: '#dc3545' }}>🔍 Debug Avancé - Vercel</h1>
      
      <div style={{ 
        backgroundColor: '#fff',
        padding: '15px',
        borderRadius: '8px',
        marginBottom: '20px',
        border: '1px solid #dee2e6'
      }}>
        <h2>Informations système :</h2>
        <div><strong>Timestamp:</strong> {debugInfo.timestamp}</div>
        <div><strong>Renders:</strong> {debugInfo.renderCount}</div>
        <div><strong>User Agent:</strong> {navigator.userAgent}</div>
        <div><strong>URL:</strong> {window.location.href}</div>
      </div>

      <div style={{ 
        backgroundColor: '#fff',
        padding: '15px',
        borderRadius: '8px',
        marginBottom: '20px',
        border: '1px solid #dee2e6'
      }}>
        <h2>Variables d'environnement :</h2>
        <div><strong>VITE_SUPABASE_URL:</strong> {import.meta.env.VITE_SUPABASE_URL || 'MANQUANTE'}</div>
        <div><strong>VITE_SUPABASE_ANON_KEY:</strong> {import.meta.env.VITE_SUPABASE_ANON_KEY ? 'CONFIGURÉE' : 'MANQUANTE'}</div>
        <div><strong>VITE_APP_URL:</strong> {import.meta.env.VITE_APP_URL || 'MANQUANTE'}</div>
        <div><strong>MODE:</strong> {import.meta.env.MODE}</div>
        <div><strong>DEV:</strong> {import.meta.env.DEV ? 'true' : 'false'}</div>
        <div><strong>PROD:</strong> {import.meta.env.PROD ? 'true' : 'false'}</div>
      </div>

      <div style={{ 
        backgroundColor: '#fff',
        padding: '15px',
        borderRadius: '8px',
        marginBottom: '20px',
        border: '1px solid #dee2e6'
      }}>
        <h2>Status des imports :</h2>
        <div style={{ color: importStatus.router === 'success' ? '#28a745' : '#dc3545' }}>
          {importStatus.router === 'success' ? '✅' : '❌'} React Router: {importStatus.router}
        </div>
        <div style={{ color: importStatus.toaster === 'success' ? '#28a745' : '#dc3545' }}>
          {importStatus.toaster === 'success' ? '✅' : '❌'} Toaster: {importStatus.toaster}
        </div>
        <div style={{ color: importStatus.auth === 'success' ? '#28a745' : '#dc3545' }}>
          {importStatus.auth === 'success' ? '✅' : '❌'} AuthContext: {importStatus.auth}
        </div>
      </div>

      {debugInfo.errors.length > 0 && (
        <div style={{ 
          backgroundColor: '#f8d7da',
          padding: '15px',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid #f5c6cb'
        }}>
          <h2 style={{ color: '#721c24' }}>Erreurs détectées :</h2>
          {debugInfo.errors.map((error, index) => (
            <div key={index} style={{ 
              color: '#721c24',
              backgroundColor: '#fff',
              padding: '8px',
              marginBottom: '8px',
              borderRadius: '4px',
              fontFamily: 'monospace',
              fontSize: '12px'
            }}>
              {error}
            </div>
          ))}
        </div>
      )}

      <div style={{ 
        backgroundColor: '#d4edda',
        padding: '15px',
        borderRadius: '8px',
        border: '1px solid #c3e6cb'
      }}>
        <h2 style={{ color: '#155724' }}>Tests :</h2>
        <button 
          onClick={() => {
            console.log('Test console log');
            alert('Test JavaScript OK');
          }}
          style={{
            backgroundColor: '#007bff',
            color: '#fff',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          Test JavaScript
        </button>
        <button 
          onClick={() => setDebugInfo(prev => ({ ...prev, renderCount: prev.renderCount + 1 }))}
          style={{
            backgroundColor: '#28a745',
            color: '#fff',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Test Re-render
        </button>
      </div>
    </div>
  );
}

export default App;