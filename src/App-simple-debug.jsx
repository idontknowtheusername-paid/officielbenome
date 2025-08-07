import React from 'react';

console.log('🔍 App-simple-debug: Démarrage');

function App() {
  console.log('🔍 App-simple-debug: Render fonction');
  
  const [renderCount, setRenderCount] = React.useState(0);
  const [errors, setErrors] = React.useState([]);

  React.useEffect(() => {
    console.log('🔍 App-simple-debug: useEffect');
    setRenderCount(prev => prev + 1);
    
    // Test imports un par un
    const testImports = async () => {
      console.log('🔍 Testing imports...');
      
      // Test 1: React Router
      try {
        const router = await import('react-router-dom');
        console.log('✅ React Router OK:', router);
      } catch (error) {
        console.error('❌ React Router FAILED:', error);
        setErrors(prev => [...prev, 'React Router: ' + error.message]);
      }
      
      // Test 2: UI Components
      try {
        const toaster = await import('@/components/ui/toaster');
        console.log('✅ Toaster OK:', toaster);
      } catch (error) {
        console.error('❌ Toaster FAILED:', error);
        setErrors(prev => [...prev, 'Toaster: ' + error.message]);
      }
      
      // Test 3: Auth Context
      try {
        const auth = await import('@/contexts/AuthContext');
        console.log('✅ AuthContext OK:', auth);
      } catch (error) {
        console.error('❌ AuthContext FAILED:', error);
        setErrors(prev => [...prev, 'AuthContext: ' + error.message]);
      }
      
      // Test 4: Supabase
      try {
        const supabase = await import('@/lib/supabase');
        console.log('✅ Supabase OK:', supabase);
      } catch (error) {
        console.error('❌ Supabase FAILED:', error);
        setErrors(prev => [...prev, 'Supabase: ' + error.message]);
      }
    };
    
    testImports();
  }, []);

  return (
    <div style={{
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f0f0f0',
      minHeight: '100vh'
    }}>
      <h1 style={{ color: '#333' }}>🔍 Debug Simple - Page Blanche</h1>
      
      <div style={{ 
        backgroundColor: '#fff',
        padding: '20px',
        borderRadius: '5px',
        marginBottom: '20px'
      }}>
        <h2>État de l'application :</h2>
        <p><strong>Renders:</strong> {renderCount}</p>
        <p><strong>Timestamp:</strong> {new Date().toISOString()}</p>
        <p><strong>Environment:</strong> {import.meta.env.MODE}</p>
      </div>

      <div style={{ 
        backgroundColor: '#fff',
        padding: '20px',
        borderRadius: '5px',
        marginBottom: '20px'
      }}>
        <h2>Variables Supabase :</h2>
        <p><strong>URL:</strong> {import.meta.env.VITE_SUPABASE_URL || 'MANQUANTE'}</p>
        <p><strong>Key:</strong> {import.meta.env.VITE_SUPABASE_ANON_KEY ? 'PRÉSENTE' : 'MANQUANTE'}</p>
      </div>

      {errors.length > 0 && (
        <div style={{ 
          backgroundColor: '#ffebee',
          padding: '20px',
          borderRadius: '5px',
          marginBottom: '20px'
        }}>
          <h2 style={{ color: '#c62828' }}>Erreurs d'import :</h2>
          {errors.map((error, index) => (
            <div key={index} style={{ 
              color: '#c62828',
              marginBottom: '10px',
              fontFamily: 'monospace',
              backgroundColor: '#fff',
              padding: '10px',
              borderRadius: '3px'
            }}>
              {error}
            </div>
          ))}
        </div>
      )}

      <div style={{ 
        backgroundColor: '#e8f5e8',
        padding: '20px',
        borderRadius: '5px'
      }}>
        <h2>✅ Si vous voyez ceci :</h2>
        <p>React fonctionne correctement !</p>
        <p>Le problème vient des imports des dépendances.</p>
        <button 
          onClick={() => {
            console.log('Test click');
            alert('JavaScript fonctionne !');
          }}
          style={{
            backgroundColor: '#4caf50',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Test JavaScript
        </button>
      </div>
    </div>
  );
}

export default App;