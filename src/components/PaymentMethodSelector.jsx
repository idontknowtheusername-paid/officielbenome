import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  CreditCard, 
  Smartphone, 
  Circle, 
  Wifi, 
  CheckCircle,
  Lock,
  Shield,
  Clock,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const PaymentMethodSelector = ({ 
  amount, 
  currency = 'XOF',
  onPaymentMethodSelected, 
  onClose,
  packageName = 'Package Premium'
}) => {
  const [selectedMethod, setSelectedMethod] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [cardData, setCardData] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: '',
    brand: 'visa'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const paymentMethods = [
    {
      id: 'orange_money',
      name: 'Orange Money',
      icon: <Circle className="h-6 w-6 text-orange-500" />,
      description: 'Paiement sécurisé via Orange Money',
      advantages: ['Paiement instantané', 'Sécurisé', 'Sans frais'],
      color: 'orange',
      popular: true
    },
    {
      id: 'mtn_mobile_money',
      name: 'MTN Mobile Money',
      icon: <Wifi className="h-6 w-6 text-yellow-500" />,
      description: 'Paiement via MTN Mobile Money',
      advantages: ['Paiement rapide', 'Sécurisé', 'Large couverture'],
      color: 'yellow',
      popular: false
    },
    {
      id: 'card',
      name: 'Carte Bancaire',
      icon: <CreditCard className="h-6 w-6 text-blue-500" />,
      description: 'Paiement par carte Visa/Mastercard',
      advantages: ['Paiement international', 'Sécurisé', 'Accepté partout'],
      color: 'blue',
      popular: false
    }
  ];

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const validatePhoneNumber = (phone) => {
    // Validation pour les numéros ivoiriens
    const phoneRegex = /^(225|00225|\+225)?[0-9]{10}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  };

  const validateCardData = () => {
    if (!cardData.number || !cardData.expiry || !cardData.cvv || !cardData.name) {
      return false;
    }
    
    // Validation basique de la carte
    const cardNumberRegex = /^[0-9]{13,19}$/;
    const expiryRegex = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
    const cvvRegex = /^[0-9]{3,4}$/;
    
    return cardNumberRegex.test(cardData.number.replace(/\s/g, '')) &&
           expiryRegex.test(cardData.expiry) &&
           cvvRegex.test(cardData.cvv);
  };

  const handlePaymentMethodSelect = (methodId) => {
    setSelectedMethod(methodId);
    setError(null);
  };

  const handlePhoneNumberChange = (value) => {
    // Formatage automatique du numéro de téléphone
    let formatted = value.replace(/\D/g, '');
    if (formatted.startsWith('225')) {
      formatted = formatted.substring(3);
    }
    if (formatted.length > 0) {
      formatted = formatted.match(/.{1,2}/g).join(' ');
    }
    setPhoneNumber(formatted);
  };

  const handleCardNumberChange = (value) => {
    // Formatage automatique du numéro de carte
    const formatted = value.replace(/\D/g, '').match(/.{1,4}/g)?.join(' ') || '';
    setCardData(prev => ({ ...prev, number: formatted }));
    
    // Détection automatique de la marque de carte
    const firstDigit = value.replace(/\D/g, '')[0];
    let brand = 'visa';
    if (firstDigit === '5') brand = 'mastercard';
    else if (firstDigit === '3') brand = 'amex';
    else if (firstDigit === '6') brand = 'discover';
    
    setCardData(prev => ({ ...prev, brand }));
  };

  const handleExpiryChange = (value) => {
    // Formatage automatique de la date d'expiration
    let formatted = value.replace(/\D/g, '');
    if (formatted.length >= 2) {
      formatted = formatted.substring(0, 2) + '/' + formatted.substring(2, 4);
    }
    setCardData(prev => ({ ...prev, expiry: formatted }));
  };

  const handleSubmit = async () => {
    setError(null);
    
    if (!selectedMethod) {
      setError('Veuillez sélectionner une méthode de paiement');
      return;
    }

    if (selectedMethod === 'orange_money' || selectedMethod === 'mtn_mobile_money') {
      if (!phoneNumber || !validatePhoneNumber(phoneNumber)) {
        setError('Veuillez entrer un numéro de téléphone valide');
        return;
      }
    }

    if (selectedMethod === 'card') {
      if (!validateCardData()) {
        setError('Veuillez remplir tous les champs de la carte correctement');
        return;
      }
    }

    try {
      setLoading(true);
      
      const paymentData = {
        method: selectedMethod,
        amount: amount,
        currency: currency,
        packageName: packageName,
        ...(selectedMethod === 'orange_money' || selectedMethod === 'mtn_mobile_money' ? { phoneNumber } : {}),
        ...(selectedMethod === 'card' ? { cardData } : {})
      };

      onPaymentMethodSelected(paymentData);
    } catch (err) {
      setError(err.message || 'Erreur lors de la sélection de la méthode de paiement');
    } finally {
      setLoading(false);
    }
  };

  const getMethodColor = (color) => {
    switch (color) {
      case 'orange': return 'border-orange-200 bg-orange-50 hover:bg-orange-100';
      case 'yellow': return 'border-yellow-200 bg-yellow-50 hover:bg-yellow-100';
      case 'blue': return 'border-blue-200 bg-blue-50 hover:bg-blue-100';
      default: return 'border-gray-200 bg-gray-50 hover:bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">💳 Choisir le mode de paiement</h2>
        <p className="text-muted-foreground">
          Sélectionnez votre méthode de paiement préférée pour finaliser votre achat
        </p>
        
        {/* Résumé de la commande */}
        <div className="mt-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
          <div className="text-sm text-muted-foreground mb-1">Résumé de votre commande</div>
          <div className="font-semibold text-lg">{packageName}</div>
          <div className="text-2xl font-bold text-primary">{formatAmount(amount)}</div>
        </div>
      </div>

      {/* Méthodes de paiement */}
      <RadioGroup value={selectedMethod} onValueChange={handlePaymentMethodSelect}>
        <div className="space-y-4">
          {paymentMethods.map((method) => (
            <motion.div
              key={method.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <RadioGroupItem
                value={method.id}
                id={method.id}
                className="sr-only"
              />
              <Label
                htmlFor={method.id}
                className={`block cursor-pointer p-4 border-2 rounded-lg transition-all duration-200 ${
                  selectedMethod === method.id
                    ? 'border-primary bg-primary/5 shadow-md'
                    : getMethodColor(method.color)
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    {method.icon}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg">{method.name}</h3>
                      {method.popular && (
                        <Badge variant="default" className="bg-primary text-xs">
                          Populaire
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-muted-foreground mb-2">{method.description}</p>
                    
                    <div className="flex flex-wrap gap-2">
                      {method.advantages.map((advantage, index) => (
                        <div key={index} className="flex items-center gap-1 text-xs text-muted-foreground">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          {advantage}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex-shrink-0">
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      selectedMethod === method.id
                        ? 'border-primary bg-primary'
                        : 'border-gray-300'
                    }`}>
                      {selectedMethod === method.id && (
                        <div className="w-2 h-2 bg-white rounded-full m-0.5" />
                      )}
                    </div>
                  </div>
                </div>
              </Label>
            </motion.div>
          ))}
        </div>
      </RadioGroup>

      {/* Formulaire selon la méthode sélectionnée */}
      {selectedMethod && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-4"
        >
          {/* Orange Money / MTN */}
          {(selectedMethod === 'orange_money' || selectedMethod === 'mtn_mobile_money') && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5" />
                  {selectedMethod === 'orange_money' ? 'Orange Money' : 'MTN Mobile Money'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="phone">Numéro de téléphone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Ex: 07 08 09 10 11"
                    value={phoneNumber}
                    onChange={(e) => handlePhoneNumberChange(e.target.value)}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Entrez votre numéro {selectedMethod === 'orange_money' ? 'Orange' : 'MTN'}
                  </p>
                </div>
                
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Shield className="h-4 w-4 text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium">Paiement sécurisé</p>
                      <p>Vous recevrez un SMS de confirmation pour valider le paiement</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Carte bancaire */}
          {selectedMethod === 'card' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Informations de la carte
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="cardNumber">Numéro de carte</Label>
                  <Input
                    id="cardNumber"
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    value={cardData.number}
                    onChange={(e) => handleCardNumberChange(e.target.value)}
                    maxLength={19}
                    className="mt-1"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="expiry">Date d'expiration</Label>
                    <Input
                      id="expiry"
                      type="text"
                      placeholder="MM/AA"
                      value={cardData.expiry}
                      onChange={(e) => handleExpiryChange(e.target.value)}
                      maxLength={5}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="cvv">Code de sécurité</Label>
                    <Input
                      id="cvv"
                      type="text"
                      placeholder="123"
                      value={cardData.cvv}
                      onChange={(e) => setCardData(prev => ({ ...prev, cvv: e.target.value }))}
                      maxLength={4}
                      className="mt-1"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="cardName">Nom sur la carte</Label>
                  <Input
                    id="cardName"
                    type="text"
                    placeholder="Nom et prénom"
                    value={cardData.name}
                    onChange={(e) => setCardData(prev => ({ ...prev, name: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Lock className="h-4 w-4 text-green-600 mt-0.5" />
                    <div className="text-sm text-green-800">
                      <p className="font-medium">Paiement sécurisé SSL</p>
                      <p>Vos informations sont chiffrées et protégées</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      )}

      {/* Message d'erreur */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-red-50 border border-red-200 rounded-lg"
        >
          <div className="flex items-center gap-2 text-red-800">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{error}</span>
          </div>
        </motion.div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button
          onClick={onClose}
          variant="outline"
          className="flex-1 sm:flex-none"
        >
          Annuler
        </Button>
        
        <Button
          onClick={handleSubmit}
          disabled={!selectedMethod || loading}
          className="flex-1 sm:flex-none bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Traitement...
            </>
          ) : (
            <>
              💳 Payer {formatAmount(amount)}
            </>
          )}
        </Button>
      </div>

      {/* Informations de sécurité */}
      <div className="text-center text-sm text-muted-foreground">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Lock className="h-4 w-4" />
          <span>Paiement 100% sécurisé</span>
        </div>
        <p>Vos informations de paiement sont protégées par un chiffrement SSL de niveau bancaire</p>
      </div>
    </div>
  );
};

export default PaymentMethodSelector;
