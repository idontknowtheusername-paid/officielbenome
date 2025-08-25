import React, { useState, useEffect } from 'react';

const PaystackTest = () => {
  const [amount, setAmount] = useState('100');
  const [email, setEmail] = useState('test@maxiimarket.com');
  const [name, setName] = useState('Test User');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Charger le script Paystack
    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    document.head.appendChild(script);
  }, []);

  const handlePayment = () => {
    if (!window.PaystackPop) {
      alert('Script Paystack non chargé');
      return;
    }

    setIsLoading(true);

    const handler = window.PaystackPop.setup({
      key: 'pk_test_51H1234567890', // Clé de test Paystack
      email: email,
      amount: parseInt(amount) * 100, // Paystack utilise les kobo (centimes)
      currency: 'NGN',
      callback: function(response) {
        console.log('✅ Paiement Paystack réussi:', response);
        alert('Paiement réussi ! Transaction: ' + response.reference);
        setIsLoading(false);
      },
      onClose: function() {
        console.log('❌ Paiement Paystack annulé');
        setIsLoading(false);
      }
    });

    handler.openIframe();
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">🧪 Test Paystack</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Montant (NGN)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="100"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="test@maxiimarket.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Nom</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Test User"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <button
          onClick={handlePayment}
          disabled={isLoading}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-md"
        >
          {isLoading ? '⏳ Chargement...' : '💳 Payer avec Paystack'}
        </button>

        <div className="text-xs text-gray-500 text-center">
          Mode Test - Aucun vrai paiement
        </div>
      </div>
    </div>
  );
};

export default PaystackTest;
