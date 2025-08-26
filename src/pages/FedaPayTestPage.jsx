import React from 'react';
import FedaPayTest from '@/components/FedaPayTest';

export default function FedaPayTestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🏦 Test FedaPay - Paiements Bénin
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Testez l'intégration FedaPay pour les paiements mobiles et cartes bancaires au Bénin. 
            Orange Money, MTN Mobile Money, Moov Money et cartes Visa/Mastercard.
          </p>
        </div>
        
        <FedaPayTest />
        
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            💡 <strong>Note:</strong> Ceci est un environnement de test. 
            Les paiements ne seront pas réellement débités.
          </p>
        </div>
      </div>
    </div>
  );
}
