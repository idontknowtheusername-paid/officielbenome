import React, { useState, useEffect } from 'react';

const KkiapayCorrected = () => {
  const [amount, setAmount] = useState('100');
  const [email, setEmail] = useState('test@maxiimarket.com');
  const [phone, setPhone] = useState('+22990123456');
  const [name, setName] = useState('Test User');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Charger le script KkiaPay
    const script = document.createElement('script');
    script.src = 'https://cdn.kkiapay.me/k.js';
    script.async = true;
    script.onload = () => console.log('✅ Script KkiaPay chargé');
    script.onerror = () => console.error('❌ Erreur chargement KkiaPay');
    document.head.appendChild(script);
  }, []);

  const handlePayment = () => {
    setIsLoading(true);

    // Créer le widget KkiaPay avec les bons paramètres
    const widget = document.createElement('kkiapay-widget');
    widget.setAttribute('amount', amount);
    widget.setAttribute('key', '0cf13550819511f09ce691e5b43c1d2c');
    widget.setAttribute('callback', 'https://maxiimarket.com/payment-callback');
    widget.setAttribute('data-email', email);
    widget.setAttribute('data-phone', phone);
    widget.setAttribute('data-name', name);
    widget.setAttribute('data-description', 'Test KkiaPay Corrected');

    // Créer un modal pour afficher le widget
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.8);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
    `;

    const content = document.createElement('div');
    content.style.cssText = `
      background: white;
      padding: 20px;
      border-radius: 10px;
      position: relative;
      min-width: 300px;
      max-width: 90%;
      max-height: 90%;
      overflow: auto;
    `;

    const closeBtn = document.createElement('button');
    closeBtn.textContent = '✕';
    closeBtn.style.cssText = `
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
      z-index: 10000;
    `;
    closeBtn.onclick = () => {
      document.body.removeChild(modal);
      setIsLoading(false);
    };

    content.appendChild(closeBtn);
    content.appendChild(widget);
    modal.appendChild(content);
    document.body.appendChild(modal);

    console.log('🧪 Widget KkiaPay créé avec succès');
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">🧪 Test KkiaPay Corrigé</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Montant (XOF)</label>
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
          <label className="block text-sm font-medium mb-2">Téléphone</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+22990123456"
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
          {isLoading ? '⏳ Chargement...' : '💳 Tester KkiaPay'}
        </button>

        <div className="text-xs text-gray-500 text-center">
          Mode Sandbox - Aucun vrai paiement
        </div>
      </div>
    </div>
  );
};

export default KkiapayCorrected;
