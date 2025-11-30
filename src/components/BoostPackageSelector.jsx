import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Star, TrendingUp, Zap, Crown, Clock, Users, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { boostService } from '@/services';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const BoostPackageSelector = ({ listingId, onPackageSelected, onClose }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [purchasing, setPurchasing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadBoostPackages();
  }, []);

  const loadBoostPackages = async () => {
    try {
      setLoading(true);
      const response = await boostService.getBoostPackages();
      setPackages(response.packages || []);
    } catch (err) {
      setError('Erreur lors du chargement des packages de boost');
      console.error('Erreur packages:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePackageSelect = (pkg) => {
    setSelectedPackage(pkg);
  };

  const handlePurchase = async () => {
    if (!user) {
      navigate('/connexion', { state: { from: '/paiement/boost' } });
      return;
    }

    if (!selectedPackage) {
      setError('Veuillez sélectionner un package');
      return;
    }

    try {
      setPurchasing(true);
      setError(null);

      const result = await boostService.purchaseBoost(selectedPackage.id, listingId, user.id);
      
      if (result.success) {
        // Rediriger vers la page de paiement ou afficher le succès
        onPackageSelected?.(result);
        onClose?.();
      }
    } catch (err) {
      setError(err.message || 'Erreur lors de l\'achat du boost');
    } finally {
      setPurchasing(false);
    }
  };

  const getFeatureIcon = (feature) => {
    switch (feature) {
      case 'priority':
        return <TrendingUp className="h-4 w-4" />;
      case 'badge':
        return <Star className="h-4 w-4" />;
      case 'featured':
        return <Crown className="h-4 w-4" />;
      case 'analytics':
        return <BarChart3 className="h-4 w-4" />;
      case 'support':
        return <Users className="h-4 w-4" />;
      default:
        return <Check className="h-4 w-4" />;
    }
  };

  const getFeatureText = (feature, value) => {
    switch (feature) {
      case 'priority':
        return value === 'highest' ? 'Priorité maximale' : 
               value === 'high' ? 'Priorité élevée' : 'Priorité moyenne';
      case 'badge':
        return 'Badge boosté visible';
      case 'featured':
        return value ? 'Mise en avant premium' : 'Visibilité standard';
      case 'analytics':
        return value === 'premium' ? 'Analytics détaillés' : 
               value === 'detailed' ? 'Analytics avancés' : 'Analytics de base';
      case 'support':
        return 'Support prioritaire';
      default:
        return value;
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-6">
        <div className="text-red-500 mb-4">{error}</div>
        <Button onClick={loadBoostPackages} variant="outline">
          Réessayer
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">🚀 Booster votre annonce</h2>
        <p className="text-muted-foreground">
          Choisissez le package qui correspond à vos besoins et boostez votre visibilité !
        </p>
      </div>

      {/* Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {packages.map((pkg, index) => (
          <motion.div
            key={pkg.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card 
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                selectedPackage?.id === pkg.id 
                  ? 'ring-2 ring-primary border-primary' 
                  : 'hover:border-primary/50'
              }`}
              onClick={() => handlePackageSelect(pkg)}
            >
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-3">
                  {pkg.features?.featured ? (
                    <Crown className="h-8 w-8 text-yellow-500" />
                  ) : pkg.features?.priority === 'highest' ? (
                    <Star className="h-8 w-8 text-purple-500" />
                  ) : (
                    <Zap className="h-8 w-8 text-blue-500" />
                  )}
                </div>
                <CardTitle className="text-xl">{pkg.name}</CardTitle>
                <p className="text-muted-foreground text-sm">{pkg.description}</p>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Prix et durée */}
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-1">
                    {formatPrice(pkg.price)}
                  </div>
                  <div className="flex items-center justify-center text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 mr-1" />
                    {pkg.duration_days} jour{pkg.duration_days > 1 ? 's' : ''}
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-2">
                  {Object.entries(pkg.features || {}).map(([key, value]) => (
                    <div key={key} className="flex items-center text-sm">
                      <div className="text-primary mr-2">
                        {getFeatureIcon(key)}
                      </div>
                      <span>{getFeatureText(key, value)}</span>
                    </div>
                  ))}
                </div>

                {/* Badge de sélection */}
                {selectedPackage?.id === pkg.id && (
                  <div className="flex justify-center">
                    <Badge variant="default" className="bg-primary">
                      <Check className="h-4 w-4 mr-1" />
                      Sélectionné
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

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
          onClick={handlePurchase}
          disabled={!selectedPackage || purchasing}
          className="flex-1 sm:flex-none bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90"
        >
          {purchasing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Achat en cours...
            </>
          ) : (
            <>
              🚀 Acheter le Boost
              {selectedPackage && ` - ${formatPrice(selectedPackage.price)}`}
            </>
          )}
        </Button>
      </div>

      {/* Informations supplémentaires */}
      <div className="text-center text-sm text-muted-foreground">
        <p>💡 Les boosts sont activés immédiatement après confirmation du paiement</p>
        <p>🔄 Vous pouvez renouveler ou annuler vos boosts à tout moment</p>
      </div>
    </div>
  );
};

export default BoostPackageSelector;
