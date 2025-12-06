import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, TrendingUp, Star, Users, Eye, Heart, BarChart3 } from 'lucide-react';
import { useAppMode } from '@/hooks/useAppMode';
import MobilePageLayout from '@/layouts/MobilePageLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { listingService, boostService } from '@/services';
import { useAuth } from '@/contexts/AuthContext';
import ListingCard from '@/components/ListingCard';
import BoostPackageSelector from '@/components/BoostPackageSelector';
import { useToast } from '@/components/ui/use-toast';

// 1. IMPORT DU PULL-TO-REFRESH
import PullToRefresh from 'react-simple-pull-to-refresh';

const BoostListingPage = () => {
  const { id: listingId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { isAppMode } = useAppMode();
  
  const [listing, setListing] = useState(null);
  const [boostStatus, setBoostStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPackageSelector, setShowPackageSelector] = useState(false);
  const [purchaseResult, setPurchaseResult] = useState(null);

  useEffect(() => {
    if (listingId) {
      loadListingAndBoostStatus();
    }
  }, [listingId]);

  // 2. FONCTION DE RAFRAÎCHISSEMENT
  const handleRefresh = async () => {
    return new Promise((resolve) => {
      window.location.reload();
      resolve();
    });
  };

  const loadListingAndBoostStatus = async () => {
    try {
      setLoading(true);
      setError(null);

      // Charger l'annonce
      const listingData = await listingService.getListingById(listingId);
      setListing(listingData);

      // Charger le statut de boost
      const boostData = await boostService.getBoostStatus(listingId);
      setBoostStatus(boostData);
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement des données');
      console.error('Erreur chargement:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePackageSelected = (result) => {
    setPurchaseResult(result);
    setShowPackageSelector(false);
    
    // Rediriger vers la nouvelle page de paiement Lygos
    navigate(`/paiement/boost/${listingId}`);
  };

  // Renouvellement retiré - Les utilisateurs doivent acheter un nouveau boost

  // Annulation retirée - Gestion admin uniquement

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-20">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold mb-4">Erreur</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={() => navigate(-1)} variant="outline">
            Retour
          </Button>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold mb-4">Annonce non trouvée</h1>
          <p className="text-muted-foreground mb-6">L'annonce que vous recherchez n'existe pas.</p>
          <Button onClick={() => navigate(-1)} variant="outline">
            Retour
          </Button>
        </div>
      </div>
    );
  }

  // Vérifier que l'utilisateur possède l'annonce
  if (user?.id !== listing.user_id) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold mb-4">Accès non autorisé</h1>
          <p className="text-muted-foreground mb-6">Vous ne pouvez booster que vos propres annonces.</p>
          <Button onClick={() => navigate(-1)} variant="outline">
            Retour
          </Button>
        </div>
      </div>
    );
  }

  const pageContent = (
    // 3. ENVELOPPE PULL TO REFRESH
    <PullToRefresh onRefresh={handleRefresh} pullingContent=''>
      <div className={`min-h-screen bg-gradient-to-br from-background via-slate-50 to-blue-50/30 ${isAppMode ? 'pb-20' : ''}`}>
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            {!isAppMode && (
            <Button
              onClick={() => navigate(-1)}
              variant="ghost"
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
            )}
            
            <h1 className={`${isAppMode ? 'text-2xl' : 'text-3xl md:text-4xl'} font-bold mb-2`}>
              🚀 Booster votre annonce
            </h1>
            <p className="text-muted-foreground text-lg">
              Augmentez votre visibilité et obtenez plus de contacts
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Colonne gauche : Annonce et statut */}
            <div className="lg:col-span-2 space-y-6">
              {/* Annonce */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <h2 className="text-xl font-semibold mb-4">Votre annonce</h2>
                <ListingCard listing={listing} showActions={false} />
              </motion.div>

              {/* Statut actuel du boost */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2 text-primary" />
                      Statut du boost
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {boostStatus?.hasActiveBoost ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                          <div className="flex items-center">
                            <Star className="h-5 w-5 text-green-600 mr-2" />
                            <div>
                              <p className="font-semibold text-green-800">
                                Boost actif : {boostStatus.currentBoost.boost_packages?.name}
                              </p>
                              <p className="text-sm text-green-600">
                                Expire le {new Date(boostStatus.currentBoost.end_date).toLocaleDateString('fr-FR')}
                              </p>
                            </div>
                          </div>
                          <Badge variant="default" className="bg-green-600">
                            Actif
                          </Badge>
                        </div>

                        <Button
                          onClick={() => navigate(`/paiement/boost/${listingId}`)}
                          className="w-full bg-gradient-to-r from-primary to-blue-600"
                        >
                          ⚡ Acheter un nouveau boost
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="text-6xl mb-4">📈</div>
                        <h3 className="text-lg font-semibold mb-2">Aucun boost actif</h3>
                        <p className="text-muted-foreground mb-4">
                          Votre annonce n'est actuellement pas boostée
                        </p>
                        <Button
                            onClick={() => navigate(`/paiement/boost/${listingId}`)}
                          className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90"
                        >
                          🚀 Booster maintenant
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Colonne droite : Statistiques et avantages */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-6"
            >




              {/* CTA principal */}
              {!boostStatus?.hasActiveBoost && (
                <Card className="bg-gradient-to-br from-primary/10 to-blue-500/10 border-primary/20">
                  <CardContent className="p-6 text-center">
                    <div className="text-4xl mb-3">🚀</div>
                    <h3 className="text-lg font-semibold mb-2">Prêt à booster ?</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Augmentez votre visibilité et obtenez plus de contacts
                    </p>
                    <Button
                      onClick={() => navigate(`/paiement/boost/${listingId}`)}
                      className="w-full bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90"
                    >
                      Commencer maintenant
                    </Button>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </div>

          {/* Résultat de l'achat */}
          {purchaseResult && (
            <Dialog open={!!purchaseResult} onOpenChange={() => setPurchaseResult(null)}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-center">🎉 Boost acheté !</DialogTitle>
                </DialogHeader>
                <div className="text-center py-6">
                  <div className="text-6xl mb-4">✅</div>
                  <h3 className="text-lg font-semibold mb-2">Félicitations !</h3>
                  <p className="text-muted-foreground mb-4">
                    Votre boost a été acheté avec succès et sera activé après confirmation du paiement.
                  </p>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <p className="text-sm text-green-800">
                      <strong>Package :</strong> {purchaseResult.packageData.name}<br/>
                      <strong>Prix :</strong> {purchaseResult.packageData.price} FCFA<br/>
                      <strong>Durée :</strong> {purchaseResult.packageData.duration_days} jours
                    </p>
                  </div>
                </div>
                <div className="flex justify-center">
                  <Button onClick={() => setPurchaseResult(null)}>
                    Continuer
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}

          {/* Sélecteur de packages */}
          <Dialog open={showPackageSelector} onOpenChange={setShowPackageSelector}>
            <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Choisir un package de boost</DialogTitle>
              </DialogHeader>
              <BoostPackageSelector
                listingId={listingId}
                onPackageSelected={handlePackageSelected}
                onClose={() => setShowPackageSelector(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </PullToRefresh>
  );

  if (isAppMode) {
    return (
      <MobilePageLayout title="Booster l'annonce" showBack>
        {pageContent}
      </MobilePageLayout>
    );
  }

  return pageContent;
};

export default BoostListingPage;
