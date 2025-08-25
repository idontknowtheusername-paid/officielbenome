import React, { useState } from 'react';

const KkiapayIframe = () => {
  const [amount, setAmount] = useState('100');
  const [email, setEmail] = useState('test@maxiimarket.com');
  const [phone, setPhone] = useState('+22990123456');
  const [name, setName] = useState('Test User');
  const [showIframe, setShowIframe] = useState(false);

  const handlePayment = () => {
    setShowIframe(true);
  };

  const closeIframe = () => {
    setShowIframe(false);
  };

  // URL de paiement KkiaPay
  const kkiapayUrl = `https://widget-v3.kkiapay.me/?amount=${amount}&key=0cf13550819511f09ce691e5b43c1d2c&callback=https://maxiimarket.com/payment-callback&data=${encodeURIComponent(JSON.stringify({
    email,
    phone,
    name,
    description: 'Test KkiaPay - Boost Premium'
  }))}`;

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">🧪 Test KkiaPay iFrame</h2>
      
      {!showIframe ? (
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
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-md transition-colors"
          >
            💳 Ouvrir KkiaPay
          </button>

          <div className="text-xs text-gray-500 text-center">
            Mode Sandbox - Aucun vrai paiement
          </div>
        </div>
      ) : (
        <div className="relative">
          <button
            onClick={closeIframe}
            className="absolute top-2 right-2 z-10 bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-700"
          >
            ✕
          </button>
          <iframe
            src={kkiapayUrl}
            className="w-full h-96 border-0 rounded-lg"
            title="KkiaPay Payment"
            allow="payment"
          />
        </div>
      )}
    </div>
  );
};

export default KkiapayIframe;
