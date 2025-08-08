import React, { useEffect } from 'react';

const TestComponent = () => {
  useEffect(() => {
    console.log('🧪 TestComponent monté');
    console.log('🧪 Variables d\'environnement:');
    console.log('🧪 VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
    console.log('🧪 VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Configurée' : 'Non configurée');
  }, []);

  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      background: 'red', 
      color: 'white', 
      padding: '10px', 
      zIndex: 9999,
      fontSize: '12px'
    }}>
      🧪 Test Component
    </div>
  );
};

export default TestComponent; 