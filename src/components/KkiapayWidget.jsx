import React, { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

const KkiapayWidget = () => {
  const [amount, setAmount] = React.useState('100');
  const [email, setEmail] = React.useState('test@maxiimarket.com');
  const [phone, setPhone] = React.useState('+22990123456');
  const [name, setName] = React.useState('Test User');
  const { toast } = useToast();
  const widgetRef = useRef(null);

  useEffect(() => {
    // Charger le script KkiaPay
    const script = document.createElement('script');
    script.src = 'https://cdn.kkiapay.me/k.js';
    script.async = true;
    script.onload = () => {
      console.log('✅ Script KkiaPay chargé');
    };
    document.head.appendChild(script);

    return () => {
      // Nettoyer le script
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  const handlePayment = () => {
    if (!window.Kkiapay) {
      toast({
        title: "Erreur",
        description: "Widget KkiaPay non chargé",
        variant: "destructive",
      });
      return;
    }

    try {
      // Configuration du widget KkiaPay
      const config = {
        amount: parseInt(amount),
        key: '0cf13550819511f09ce691e5b43c1d2c', // Votre clé publique
        callback: 'https://maxiimarket.com/payment-callback',
        data: {
          email,
          phone,
          name,
          description: 'Test KkiaPay - Boost Premium'
        }
      };

      console.log('🧪 Configuration KkiaPay:', config);

      // Ouvrir le widget KkiaPay
      window.Kkiapay.open(config);

      toast({
        title: "Paiement initié",
        description: "Widget KkiaPay ouvert",
      });

    } catch (error) {
      console.error('❌ Erreur KkiaPay:', error);
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>🧪 Test KkiaPay Widget</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="amount">Montant (XOF)</Label>
          <Input
            id="amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="100"
          />
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="test@maxiimarket.com"
          />
        </div>

        <div>
          <Label htmlFor="phone">Téléphone</Label>
          <Input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+22990123456"
          />
        </div>

        <div>
          <Label htmlFor="name">Nom</Label>
          <Input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Test User"
          />
        </div>

        <Button
          onClick={handlePayment}
          className="w-full bg-green-600 hover:bg-green-700"
          ref={widgetRef}
        >
          💳 Payer avec KkiaPay
        </Button>

        <div className="text-xs text-gray-500 text-center">
          Mode Sandbox - Aucun vrai paiement
        </div>
      </CardContent>
    </Card>
  );
};

export default KkiapayWidget;
