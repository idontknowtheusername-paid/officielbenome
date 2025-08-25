import React, { useState } from 'react';

const KkiapayApiTest = () => {
  const [amount, setAmount] = useState('100');
  const [email, setEmail] = useState('test@maxiimarket.com');
  const [phone, setPhone] = useState('+22990123456');
  const [name, setName] = useState('Test User');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handlePayment = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch('https://api.kkiapay.me/api/v1/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer tsk_0cf15c60819511f09ce691e5b43c1d2c'
        },
        body: JSON.stringify({
          amount: parseInt(amount),
          currency: 'XOF',
          country: 'BJ',
          phone,
          email,
          name,
          reason: 'Test KkiaPay - Boost Premium',
          callback_url: 'https://maxiimarket.com/payment-callback',
          return_url: 'https://maxiimarket.com/payment-callback',
          data: {
            description: 'Test KkiaPay - Boost Premium'
          }
        })
      });

      const data = await response.json();
      console.log('🧪 Réponse KkiaPay:', data);
      
      setResult(data);

      if (data.paymentUrl) {
        window.open(data.paymentUrl, '_blank');
      }

    } catch (error) {
      console.error('❌ Erreur KkiaPay:', error);
      setResult({ error: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">🧪 Test KkiaPay API</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Montant (XOF)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="100"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="test@maxiimarket.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Téléphone</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+22990123456"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Nom</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Test User"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          onClick={handlePayment}
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-md transition-colors"
        >
          {isLoading ? '⏳ Chargement...' : '💳 Tester API KkiaPay'}
        </button>

        {result && (
          <div className="mt-4 p-3 bg-gray-100 rounded-md">
            <h4 className="font-semibold mb-2">Résultat :</h4>
            <pre className="text-xs overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

        <div className="text-xs text-gray-500 text-center">
          Mode Sandbox - Aucun vrai paiement
        </div>
      </div>
    </div>
  );
};

export default KkiapayApiTest;
