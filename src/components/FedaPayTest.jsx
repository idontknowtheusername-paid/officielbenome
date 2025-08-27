import React, { useState, useEffect } from 'react';
import { fedapayService } from '@/services/fedapay.service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export default function FedaPayTest() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [paymentData, setPaymentData] = useState({
    amount: 1000,
    currency: 'XOF',
    description: 'Test FedaPay - MaxiMarket',
    email: 'test@maxiimarket.com',
    phone: '+229 90 12 34 56',
    name: 'Test Utilisateur',
    payment_method: 'orange_money'
  });

  useEffect(() => {
    // Vérifier la configuration au chargement
    const config = fedapayService.getConfig();
    setConfig(config);
  }, []);

  const handleInputChange = (field, value) => {
    setPaymentData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTestPayment = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('🚀 Test FedaPay - Données:', paymentData);

      const result = await fedapayService.initializePayment({
        ...paymentData,
        callback_url: `${window.location.origin}/payment-callback?test=true`
      });

      console.log('✅ Résultat FedaPay:', result);
      setResult(result);

      // Ouvrir l'URL de paiement dans un nouvel onglet
      if (result.paymentUrl) {
        window.open(result.paymentUrl, '_blank', 'noopener,noreferrer');
      }

    } catch (err) {
      console.error('❌ Erreur test FedaPay:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPayment = async (transactionId) => {
    if (!transactionId) {
      setError('ID de transaction requis');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await fedapayService.verifyPayment(transactionId);
      setResult(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const paymentMethods = fedapayService.getPaymentMethods();
  const fees = fedapayService.calculateFees(paymentData.amount);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🏦 Test FedaPay - Paiements Bénin
          </CardTitle>
          <CardDescription>
            Testez l'intégration FedaPay pour les paiements Orange Money, MTN, Moov et cartes bancaires
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Configuration */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Configuration</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Badge variant={config?.isConfigured ? "default" : "destructive"}>
                {config?.isConfigured ? "✅ Configuré" : "❌ Non configuré"}
              </Badge>
              <Badge variant={config?.isTestMode ? "secondary" : "default"}>
                {config?.isTestMode ? "🧪 Mode Test" : "🚀 Mode Production"}
              </Badge>
              <Badge variant={config?.hasPublicKey ? "default" : "destructive"}>
                {config?.hasPublicKey ? "🔑 Clé Publique" : "❌ Pas de clé"}
              </Badge>
              <Badge variant={config?.hasSecretKey ? "default" : "destructive"}>
                {config?.hasSecretKey ? "🔐 Clé Secrète" : "❌ Pas de clé"}
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Données de test */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Données de Test</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="amount">Montant (FCFA)</Label>
                <Input
                  id="amount"
                  type="number"
                  value={paymentData.amount}
                  onChange={(e) => handleInputChange('amount', parseInt(e.target.value))}
                  placeholder="1000"
                />
              </div>
              <div>
                <Label htmlFor="currency">Devise</Label>
                <Select value={paymentData.currency} onValueChange={(value) => handleInputChange('currency', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="XOF">XOF (FCFA)</SelectItem>
                    <SelectItem value="EUR">EUR (Euro)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={paymentData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="test@maxiimarket.com"
                />
              </div>
              <div>
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={paymentData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+229 90 12 34 56"
                />
              </div>
              <div>
                <Label htmlFor="name">Nom complet</Label>
                <Input
                  id="name"
                  type="text"
                  value={paymentData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Test Utilisateur"
                />
              </div>
              <div>
                <Label htmlFor="payment_method">Méthode de paiement</Label>
                <Select value={paymentData.payment_method} onValueChange={(value) => handleInputChange('payment_method', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethods.map(method => (
                      <SelectItem key={method.id} value={method.id}>
                        {method.icon} {method.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Calcul des frais */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Calcul des Frais</h3>
            <div className="bg-muted p-4 rounded-lg">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-medium">Montant:</span>
                  <div className="text-lg font-bold">{fees.amount.toLocaleString()} FCFA</div>
                </div>
                <div>
                  <span className="font-medium">Frais ({fees.percentage}%):</span>
                  <div className="text-lg font-bold text-orange-600">{fees.fee.toLocaleString()} FCFA</div>
                </div>
                <div>
                  <span className="font-medium">Frais fixes:</span>
                  <div className="text-lg font-bold text-orange-600">{fees.fixedFee} FCFA</div>
                </div>
                <div>
                  <span className="font-medium">Total:</span>
                  <div className="text-lg font-bold text-green-600">{fees.total.toLocaleString()} FCFA</div>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Actions */}
          <div className="flex flex-wrap gap-4">
            <Button 
              onClick={handleTestPayment} 
              disabled={loading || !config?.isConfigured}
              className="flex-1"
            >
              {loading ? "⏳ Initialisation..." : "🚀 Tester le Paiement"}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => {
                setResult(null);
                setError(null);
              }}
            >
              🔄 Réinitialiser
            </Button>
          </div>

          {/* Vérification manuelle */}
          {result?.transactionId && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Vérification Manuelle</h3>
              <div className="flex gap-2">
                <Input
                  placeholder="ID de transaction"
                  value={result.transactionId}
                  readOnly
                />
                <Button 
                  variant="outline"
                  onClick={() => handleVerifyPayment(result.transactionId)}
                  disabled={loading}
                >
                  {loading ? "⏳ Vérification..." : "🔍 Vérifier"}
                </Button>
              </div>
            </div>
          )}

          {/* Résultats */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>
                <strong>Erreur:</strong> {error}
              </AlertDescription>
            </Alert>
          )}

          {result && (
            <Alert>
              <AlertDescription>
                <div className="space-y-2">
                  <div><strong>Statut:</strong> {result.success ? "✅ Succès" : "❌ Échec"}</div>
                  {result.transactionId && <div><strong>ID Transaction:</strong> {result.transactionId}</div>}
                  {result.reference && <div><strong>Référence:</strong> {result.reference}</div>}
                  {result.paymentUrl && <div><strong>URL Paiement:</strong> <a href={result.paymentUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{result.paymentUrl}</a></div>}
                  {result.status && <div><strong>Statut:</strong> {result.status}</div>}
                  {result.message && <div><strong>Message:</strong> {result.message}</div>}
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
