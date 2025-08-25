import React, { useState } from 'react';

const PaymentSimulator = () => {
  const [amount, setAmount] = useState('100');
  const [email, setEmail] = useState('test@maxiimarket.com');
  const [phone, setPhone] = useState('+22990123456');
  const [name, setName] = useState('Test User');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentResult, setPaymentResult] = useState(null);

  const simulatePayment = async (method) => {
    setIsProcessing(true);
    setPaymentResult(null);

    // Simuler un délai de traitement
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simuler un succès de paiement
    const result = {
      success: true,
      transactionId: `TXN_${Date.now()}`,
      amount: parseInt(amount),
      method: method,
      timestamp: new Date().toISOString(),
      message: `Paiement ${method} réussi !`
    };

    setPaymentResult(result);
    setIsProcessing(false);
  };

  const resetPayment = () => {
    setPaymentResult(null);
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">🧪 Simulateur de Paiement</h2>
      
      {!paymentResult ? (
        <>
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

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => simulatePayment('Orange Money')}
                disabled={isProcessing}
                className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-md"
              >
                {isProcessing ? '⏳' : '🟠'} Orange Money
              </button>
              
              <button
                onClick={() => simulatePayment('MTN Money')}
                disabled={isProcessing}
                className="bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-md"
              >
                {isProcessing ? '⏳' : '🟡'} MTN Money
              </button>
              
              <button
                onClick={() => simulatePayment('Moov Money')}
                disabled={isProcessing}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-md"
              >
                {isProcessing ? '⏳' : '🔵'} Moov Money
              </button>
              
              <button
                onClick={() => simulatePayment('Carte Bancaire')}
                disabled={isProcessing}
                className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-md"
              >
                {isProcessing ? '⏳' : '💳'} Carte
              </button>
            </div>

            <div className="text-xs text-gray-500 text-center">
              Simulation - Aucun vrai paiement
            </div>
          </div>
        </>
      ) : (
        <div className="text-center">
          <div className="text-6xl mb-4">✅</div>
          <h3 className="text-xl font-bold text-green-600 mb-4">
            Paiement Réussi !
          </h3>
          
          <div className="bg-green-50 p-4 rounded-md mb-4">
            <div className="text-sm space-y-2">
              <div><strong>Transaction ID:</strong> {paymentResult.transactionId}</div>
              <div><strong>Montant:</strong> {paymentResult.amount} XOF</div>
              <div><strong>Méthode:</strong> {paymentResult.method}</div>
              <div><strong>Date:</strong> {new Date(paymentResult.timestamp).toLocaleString()}</div>
            </div>
          </div>
          
          <button
            onClick={resetPayment}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md"
          >
            Nouveau Test
          </button>
        </div>
      )}
    </div>
  );
};

export default PaymentSimulator;
