import React, { useState } from 'react';

const KkiapayDebug = () => {
  const [debugInfo, setDebugInfo] = useState(null);

  const checkKeys = () => {
    const publicKey = import.meta.env.VITE_KKIAPAY_PUBLIC_KEY;
    const secretKey = import.meta.env.VITE_KKIAPAY_SECRET_KEY;
    
    const info = {
      publicKey: publicKey || 'Non définie',
      secretKey: secretKey ? `${secretKey.substring(0, 10)}...` : 'Non définie',
      hasPublicKey: !!publicKey,
      hasSecretKey: !!secretKey,
      environment: import.meta.env.MODE,
      timestamp: new Date().toISOString()
    };
    
    setDebugInfo(info);
    console.log('🔍 Debug KkiaPay:', info);
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-gray-100 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4 text-center">🔍 Debug KkiaPay</h2>
      
      <button
        onClick={checkKeys}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md mb-4"
      >
        Vérifier les clés
      </button>

      {debugInfo && (
        <div className="bg-white p-4 rounded-md">
          <h3 className="font-semibold mb-2">Informations :</h3>
          <div className="text-sm space-y-1">
            <div><strong>Clé publique :</strong> {debugInfo.publicKey}</div>
            <div><strong>Clé secrète :</strong> {debugInfo.secretKey}</div>
            <div><strong>Environnement :</strong> {debugInfo.environment}</div>
            <div><strong>Timestamp :</strong> {debugInfo.timestamp}</div>
          </div>
          
          <div className="mt-4 p-3 bg-yellow-100 rounded-md">
            <h4 className="font-semibold mb-2">Instructions :</h4>
            <ul className="text-xs space-y-1">
              <li>• Vérifiez que les clés sont définies dans Vercel</li>
              <li>• Assurez-vous d'utiliser les bonnes clés (sandbox/live)</li>
              <li>• Redéployez après modification des variables</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default KkiapayDebug;
