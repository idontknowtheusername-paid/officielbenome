import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CreditCard, 
  Smartphone, 
  Circle, 
  Wifi, 
  CheckCircle,
  Lock,
  Shield,
  Clock,
  AlertCircle,
  Star,
  Zap,
  Info,
  Eye,
  EyeOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
  const [showCardDetails, setShowCardDetails] = useState(false);
  const [focusedField, setFocusedField] = useState('');

  const paymentMethods = [
    {
      id: 'orange_money',
      name: 'Orange Money',
      icon: <Circle className="h-6 w-6 text-orange-500" />,
      description: 'Paiement sécurisé via Orange Money',
      advantages: ['Paiement instantané', 'Sécurisé', 'Sans frais'],
      color: 'orange',
      popular: true,
      processingTime: '2-3 minutes'
    },
    {
      id: 'mtn_mobile_money',
      name: 'MTN Mobile Money',
      icon: <Wifi className="h-6 w-6 text-yellow-500" />,
      description: 'Paiement via MTN Mobile Money',
      advantages: ['Paiement rapide', 'Sécurisé', 'Large couverture'],
      color: 'yellow',
      popular: false,
      processingTime: '2-3 minutes'
    },
    {
      id: 'card',
      name: 'Carte Bancaire',
      icon: <CreditCard className="h-6 w-6 text-blue-500" />,
      description: 'Paiement par carte Visa/Mastercard',
      advantages: ['Paiement international', 'Sécurisé', 'Accepté partout'],
      color: 'blue',
      popular: false,
      processingTime: '30 secondes'
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
      case 'orange': return 'border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 hover:from-orange-100 hover:to-amber-100';
      case 'yellow': return 'border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50 hover:from-yellow-100 hover:to-orange-100';
      case 'blue': return 'border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100';
      default: return 'border-gray-200 bg-gradient-to-r from-gray-50 to-slate-50 hover:from-gray-100 hover:to-slate-100';
    }
  };

  const getCardBrandIcon = (brand) => {
    switch (brand) {
      case 'visa': return '💳';
      case 'mastercard': return '💳';
      case 'amex': return '💳';
      default: return '💳';
    }
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            💳 Choisir le mode de paiement
          </h2>
          <p className="text-muted-foreground">
            Sélectionnez votre méthode de paiement préférée pour finaliser votre achat
          </p>
          
          {/* Résumé de la commande */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-6 p-6 bg-gradient-to-r from-primary/5 to-blue-500/5 rounded-xl border border-primary/20 shadow-sm"
          >
            <div className="text-sm text-muted-foreground mb-2">Résumé de votre commande</div>
            <div className="font-semibold text-lg text-primary">{packageName}</div>
            <div className="text-3xl font-bold text-primary">{formatAmount(amount)}</div>
            <div className="mt-2 text-xs text-muted-foreground">
              Paiement sécurisé • Pas de frais cachés
            </div>
          </motion.div>
        </motion.div>

        {/* Méthodes de paiement */}
        <RadioGroup value={selectedMethod} onValueChange={handlePaymentMethodSelect}>
          <div className="space-y-4">
            {paymentMethods.map((method, index) => (
              <motion.div
                key={method.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <RadioGroupItem
                  value={method.id}
                  id={method.id}
                  className="sr-only"
                />
                <Label
                  htmlFor={method.id}
                  className={`block cursor-pointer p-6 border-2 rounded-xl transition-all duration-300 hover:shadow-lg ${
                    selectedMethod === method.id
                      ? 'border-primary bg-gradient-to-r from-primary/5 to-blue-500/5 shadow-lg scale-[1.02]'
                      : getMethodColor(method.color)
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        className="p-3 rounded-lg bg-white shadow-sm"
                      >
                        {method.icon}
                      </motion.div>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{method.name}</h3>
                        {method.popular && (
                          <Badge variant="default" className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs">
                            <Star className="h-3 w-3 mr-1" />
                            Populaire
                          </Badge>
                        )}
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-4 w-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Temps de traitement : {method.processingTime}</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      
                      <p className="text-muted-foreground mb-3">{method.description}</p>
                      
                      <div className="flex flex-wrap gap-2 mb-2">
                        {method.advantages.map((advantage, idx) => (
                          <div key={idx} className="flex items-center gap-1 text-xs text-muted-foreground bg-white/50 px-2 py-1 rounded-full">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            {advantage}
                          </div>
                        ))}
                      </div>
                      
                      <div className="text-xs text-muted-foreground">
                        ⏱️ Traitement : {method.processingTime}
                      </div>
                    </div>
                    
                    <div className="flex-shrink-0">
                      <div className={`w-6 h-6 rounded-full border-2 transition-all duration-300 ${
                        selectedMethod === method.id
                          ? 'border-primary bg-primary shadow-lg'
                          : 'border-gray-300'
                      }`}>
                        {selectedMethod === method.id && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-3 h-3 bg-white rounded-full m-0.5"
                          />
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
        <AnimatePresence mode="wait">
          {selectedMethod && (
            <motion.div
              key={selectedMethod}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4"
            >
              {/* Orange Money / MTN */}
              {(selectedMethod === 'orange_money' || selectedMethod === 'mtn_mobile_money') && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Smartphone className="h-5 w-5" />
                        {selectedMethod === 'orange_money' ? 'Orange Money' : 'MTN Mobile Money'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="phone" className="text-sm font-medium">
                          Numéro de téléphone
                        </Label>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="Ex: 07 08 09 10 11"
                          value={phoneNumber}
                          onChange={(e) => handlePhoneNumberChange(e.target.value)}
                          className="mt-2 h-12 text-lg"
                          onFocus={() => setFocusedField('phone')}
                          onBlur={() => setFocusedField('')}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Entrez votre numéro {selectedMethod === 'orange_money' ? 'Orange' : 'MTN'}
                        </p>
                      </div>
                      
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-start gap-3">
                          <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                          <div className="text-sm text-blue-800">
                            <p className="font-medium mb-1">Paiement sécurisé</p>
                            <p>Vous recevrez un SMS de confirmation pour valider le paiement</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Carte bancaire */}
              {selectedMethod === 'card' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        Informations de la carte
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="cardNumber" className="text-sm font-medium">
                          Numéro de carte
                        </Label>
                        <div className="relative mt-2">
                          <Input
                            id="cardNumber"
                            type="text"
                            placeholder="1234 5678 9012 3456"
                            value={cardData.number}
                            onChange={(e) => handleCardNumberChange(e.target.value)}
                            maxLength={19}
                            className="h-12 text-lg pr-12"
                            onFocus={() => setFocusedField('cardNumber')}
                            onBlur={() => setFocusedField('')}
                          />
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-2xl">
                            {getCardBrandIcon(cardData.brand)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="expiry" className="text-sm font-medium">
                            Date d'expiration
                          </Label>
                          <Input
                            id="expiry"
                            type="text"
                            placeholder="MM/AA"
                            value={cardData.expiry}
                            onChange={(e) => handleExpiryChange(e.target.value)}
                            maxLength={5}
                            className="mt-2 h-12"
                            onFocus={() => setFocusedField('expiry')}
                            onBlur={() => setFocusedField('')}
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="cvv" className="text-sm font-medium">
                            Code de sécurité
                          </Label>
                          <div className="relative mt-2">
                            <Input
                              id="cvv"
                              type={showCardDetails ? "text" : "password"}
                              placeholder="123"
                              value={cardData.cvv}
                              onChange={(e) => setCardData(prev => ({ ...prev, cvv: e.target.value }))}
                              maxLength={4}
                              className="h-12 pr-12"
                              onFocus={() => setFocusedField('cvv')}
                              onBlur={() => setFocusedField('')}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                              onClick={() => setShowCardDetails(!showCardDetails)}
                            >
                              {showCardDetails ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="cardName" className="text-sm font-medium">
                          Nom sur la carte
                        </Label>
                        <Input
                          id="cardName"
                          type="text"
                          placeholder="Nom et prénom"
                          value={cardData.name}
                          onChange={(e) => setCardData(prev => ({ ...prev, name: e.target.value }))}
                          className="mt-2 h-12"
                          onFocus={() => setFocusedField('cardName')}
                          onBlur={() => setFocusedField('')}
                        />
                      </div>
                      
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-start gap-3">
                          <Lock className="h-5 w-5 text-green-600 mt-0.5" />
                          <div className="text-sm text-green-800">
                            <p className="font-medium mb-1">Paiement sécurisé SSL</p>
                            <p>Vos informations sont chiffrées et protégées</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Message d'erreur */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 bg-red-50 border border-red-200 rounded-lg"
            >
              <div className="flex items-center gap-2 text-red-800">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{error}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actions */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1 sm:flex-none h-12"
          >
            Annuler
          </Button>
          
          <Button
            onClick={handleSubmit}
            disabled={!selectedMethod || loading}
            className="flex-1 sm:flex-none h-12 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 shadow-lg"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Traitement...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Payer {formatAmount(amount)}
              </>
            )}
          </Button>
        </motion.div>

        {/* Informations de sécurité */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-sm text-muted-foreground"
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <Lock className="h-4 w-4" />
            <span>Paiement 100% sécurisé</span>
          </div>
          <p>Vos informations de paiement sont protégées par un chiffrement SSL de niveau bancaire</p>
        </motion.div>
      </div>
    </TooltipProvider>
  );
};

export default PaymentMethodSelector;
