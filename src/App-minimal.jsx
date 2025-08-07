import React from 'react';

function App() {
  return (
    <div style={{
      minHeight: '100vh',
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f0f0f0'
    }}>
      <h1 style={{ color: '#333' }}>🔍 Test Minimal - Vercel</h1>
      
      <div style={{ 
        backgroundColor: '#fff',
        padding: '15px',
        borderRadius: '5px',
        margin: '20px 0'
      }}>
        <h2>Variables d'environnement :</h2>
        <div>VITE_SUPABASE_URL: {import.meta.env.VITE_SUPABASE_URL || 'MANQUANTE'}</div>
        <div>VITE_SUPABASE_ANON_KEY: {import.meta.env.VITE_SUPABASE_ANON_KEY ? 'CONFIGURÉE' : 'MANQUANTE'}</div>
        <div>VITE_APP_URL: {import.meta.env.VITE_APP_URL || 'MANQUANTE'}</div>
        <div>MODE: {import.meta.env.MODE}</div>
        <div>DEV: {import.meta.env.DEV ? 'true' : 'false'}</div>
        <div>PROD: {import.meta.env.PROD ? 'true' : 'false'}</div>
      </div>

      <div style={{ 
        backgroundColor: '#e8f5e8',
        padding: '15px',
        borderRadius: '5px',
        margin: '20px 0'
      }}>
        <h2>✅ Si vous voyez ceci, React fonctionne !</h2>
        <p>Le problème n'est pas dans le build de base.</p>
        <p>Timestamp: {new Date().toISOString()}</p>
      </div>

      <div style={{ 
        backgroundColor: '#fff3cd',
        padding: '15px',
        borderRadius: '5px',
        margin: '20px 0'
      }}>
        <h2>Tests JavaScript :</h2>
        <button onClick={() => alert('JavaScript fonctionne !')}>
          Tester JavaScript
        </button>
        <button onClick={() => console.log('Console log test')} style={{ marginLeft: '10px' }}>
          Tester Console
        </button>
      </div>
    </div>
  );
}

export default App;