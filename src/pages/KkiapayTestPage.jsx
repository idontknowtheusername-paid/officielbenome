import React from 'react';
import PaymentSimulator from '@/components/PaymentSimulator';

const KkiapayTestPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">
            🧪 Simulateur de Paiement
          </h1>
          <p className="text-muted-foreground">
            Testez les paiements en mode simulation - Aucun vrai argent ne sera débité
          </p>
        </div>
        
        <PaymentSimulator />
        
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold mb-2">📋 Instructions de test :</h3>
          <ul className="text-sm space-y-1">
            <li>• Entrez un montant (ex: 100 XOF)</li>
            <li>• Remplissez vos informations</li>
            <li>• Cliquez sur une méthode de paiement</li>
            <li>• Attendez la simulation (2 secondes)</li>
            <li>• Vérifiez le résultat du paiement</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default KkiapayTestPage;
