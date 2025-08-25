import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { kkiapayService } from '@/services/kkiapay.service';

const KkiapayTest = () => {
  const [amount, setAmount] = useState('100');
  const [email, setEmail] = useState('test@maxiimarket.com');
  const [phone, setPhone] = useState('+22990123456');
  const [name, setName] = useState('Test User');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleTestPayment = async (paymentMethod) => {
    setIsLoading(true);
    
    try {
      console.log('🧪 Test paiement KkiaPay:', paymentMethod);
      
      const paymentData = {
        amount: parseInt(amount),
        email,
        phone,
        name,
        payment_method: paymentMethod,
        country: 'BJ',
        customizations: {
          description: `Test ${paymentMethod} - Boost Premium`
        },
        boost_id: 'test_boost_123',
        listing_id: 'test_listing_456',
        package_name: 'Premium Boost',
        user_id: 'test_user_789'
      };

      const result = await kkiapayService.initializePayment(paymentData);
      
      console.log('✅ Résultat paiement:', result);
      
      toast({
        title: "Paiement initié",
        description: `Redirection vers ${paymentMethod}...`,
      });

      // Ouvrir la page de paiement
      if (result.paymentUrl) {
        window.open(result.paymentUrl, '_blank');
      }

    } catch (error) {
      console.error('❌ Erreur paiement:', error);
      
      toast({
        title: "Erreur de paiement",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>🧪 Test KkiaPay Sandbox</CardTitle>
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

        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={() => handleTestPayment('orange_money')}
            disabled={isLoading}
            className="bg-orange-500 hover:bg-orange-600"
          >
            🟠 Orange Money
          </Button>
          
          <Button
            onClick={() => handleTestPayment('mtn_mobile_money')}
            disabled={isLoading}
            className="bg-yellow-500 hover:bg-yellow-600"
          >
            🟡 MTN Money
          </Button>
          
          <Button
            onClick={() => handleTestPayment('moov_money')}
            disabled={isLoading}
            className="bg-blue-500 hover:bg-blue-600"
          >
            🔵 Moov Money
          </Button>
          
          <Button
            onClick={() => handleTestPayment('card')}
            disabled={isLoading}
            className="bg-green-500 hover:bg-green-600"
          >
            💳 Carte
          </Button>
        </div>

        <div className="text-xs text-gray-500 text-center">
          Mode Sandbox - Aucun vrai paiement
        </div>
      </CardContent>
    </Card>
  );
};

export default KkiapayTest;
