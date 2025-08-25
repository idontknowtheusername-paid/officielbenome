import React, { useState } from 'react';

const KkiapaySimple = () => {
  const [amount, setAmount] = useState('100');
  const [email, setEmail] = useState('test@maxiimarket.com');
  const [phone, setPhone] = useState('+22990123456');
  const [name, setName] = useState('Test User');

  const handlePayment = () => {
    // Utiliser seulement la clé publique (pas de secret)
    const publicKey = import.meta.env.VITE_KKIAPAY_PUBLIC_KEY || '0cf13550819511f09ce691e5b43c1d2c';
    
    console.log('🧪 Test simple avec clé publique:', publicKey);
    
    // Créer un bouton de paiement simple
    const paymentButton = document.createElement('button');
    paymentButton.innerHTML = '💳 Payer avec KkiaPay';
    paymentButton.style.cssText = `
      background: #00d4aa;
      color: white;
      border: none;
      padding: 15px 30px;
      border-radius: 8px;
      font-size: 16px;
      cursor: pointer;
      margin: 10px;
    `;
    
    // Ajouter les attributs KkiaPay
    paymentButton.setAttribute('data-amount', amount);
    paymentButton.setAttribute('data-key', publicKey);
    paymentButton.setAttribute('data-callback', 'https://maxiimarket.com/payment-callback');
    paymentButton.setAttribute('data-email', email);
    paymentButton.setAttribute('data-phone', phone);
    paymentButton.setAttribute('data-name', name);
    paymentButton.setAttribute('data-description', 'Test KkiaPay Simple');
    
    // Créer un modal simple
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
      padding: 30px;
      border-radius: 15px;
      text-align: center;
      max-width: 400px;
      position: relative;
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

    const title = document.createElement('h3');
    title.textContent = '🧪 Test KkiaPay Simple';
    title.style.marginBottom = '20px';

    const info = document.createElement('div');
    info.innerHTML = `
      <p><strong>Montant:</strong> ${amount} XOF</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Téléphone:</strong> ${phone}</p>
      <p><strong>Nom:</strong> ${name}</p>
      <p><strong>Clé:</strong> ${publicKey}</p>
    `;
    info.style.marginBottom = '20px';
    info.style.textAlign = 'left';

    modalContent.appendChild(closeButton);
    modalContent.appendChild(title);
    modalContent.appendChild(info);
    modalContent.appendChild(paymentButton);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    // Charger le script KkiaPay
    if (!document.querySelector('script[src*="kkiapay"]')) {
      const script = document.createElement('script');
      script.src = 'https://cdn.kkiapay.me/k.js';
      script.async = true;
      document.head.appendChild(script);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">🧪 Test KkiaPay Simple</h2>
      
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
          💳 Test Simple KkiaPay
        </button>

        <div className="text-xs text-gray-500 text-center">
          Utilise seulement la clé publique
        </div>
      </div>
    </div>
  );
};

export default KkiapaySimple;
