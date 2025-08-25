import React, { useState } from 'react';

const KkiapayTest = () => {
  const [amount, setAmount] = useState('100');
  const [email, setEmail] = useState('test@maxiimarket.com');
  const [phone, setPhone] = useState('+22990123456');
  const [name, setName] = useState('Test User');

  const handlePayment = () => {
    // Récupérer la clé depuis les variables d'environnement
    const kkiapayKey = import.meta.env.VITE_KKIAPAY_PUBLIC_KEY || '0cf13550819511f09ce691e5b43c1d2c';
    
    console.log('🧪 Clé KkiaPay utilisée:', kkiapayKey);
    
    // Méthode officielle KkiaPay - Widget HTML
    const kkiapayWidget = document.createElement('kkiapay-widget');
    kkiapayWidget.setAttribute('amount', amount);
    kkiapayWidget.setAttribute('key', kkiapayKey);
    kkiapayWidget.setAttribute('callback', 'https://maxiimarket.com/payment-callback');
    kkiapayWidget.setAttribute('data-email', email);
    kkiapayWidget.setAttribute('data-phone', phone);
    kkiapayWidget.setAttribute('data-name', name);
    kkiapayWidget.setAttribute('data-description', 'Test KkiaPay - Boost Premium');

    // Charger le script KkiaPay si pas déjà fait
    if (!document.querySelector('script[src*="kkiapay"]')) {
      const script = document.createElement('script');
      script.src = 'https://cdn.kkiapay.me/k.js';
      script.async = true;
      document.head.appendChild(script);
    }

    // Créer un modal pour afficher le widget
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
    `;

    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
      background: white;
      padding: 20px;
      border-radius: 10px;
      position: relative;
      max-width: 90%;
      max-height: 90%;
    `;

    const closeButton = document.createElement('button');
    closeButton.textContent = '✕';
    closeButton.style.cssText = `
      position: absolute;
      top: 10px;
      right: 10px;
      background: red;
      color: white;
      border: none;
      border-radius: 50%;
      width: 30px;
      height: 30px;
      cursor: pointer;
    `;
    closeButton.onclick = () => document.body.removeChild(modal);

    modalContent.appendChild(closeButton);
    modalContent.appendChild(kkiapayWidget);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    console.log('🧪 Widget KkiaPay créé');
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">🧪 Test KkiaPay</h2>
      
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
          💳 Tester KkiaPay
        </button>

        <div className="text-xs text-gray-500 text-center">
          Mode Sandbox - Aucun vrai paiement
        </div>
      </div>
    </div>
  );
};

export default KkiapayTest;
