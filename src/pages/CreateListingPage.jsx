import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ListingForm from '@/components/ListingForm';
import ListingPreview from '@/components/ListingPreview';
import { useNavigate, useParams } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { listingService } from '@/services';
import { useToast } from '@/components/ui/use-toast';
import { personalData } from '@/lib/personalData';
import { 
  ArrowLeft, 
  CheckCircle, 
  Home, 
  Car, 
  Briefcase, 
  ShoppingBag,
  Camera,
  MapPin,
  DollarSign,
  FileText,
  Settings,
  Eye
} from 'lucide-react';

const CreateListingPage = () => {
  const navigate = useNavigate();
  const { category, id } = useParams();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({});
  const [showPreview, setShowPreview] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Charger les données de l'annonce existante
  const loadExistingListing = async (listingId) => {
    try {
      setIsLoading(true);
      const listing = await listingService.getListingById(listingId);
      
      if (listing) {
        // Préparer les données pour le formulaire
        const preparedData = {
          title: listing.title || '',
          description: listing.description || '',
          price: listing.price || '',
          category: listing.category || category,
          location: listing.location || {},
          images: listing.images || [],
          contact_info: listing.contact_info || {},
          // Détails spécifiques par catégorie
          real_estate_details: listing.real_estate_details || {},
          automobile_details: listing.automobile_details || {},
          service_details: listing.service_details || {},
          product_details: listing.product_details || {},
        };
        
        setFormData(preparedData);
        toast({
          title: "Annonce chargée",
          description: "Les données de l'annonce ont été chargées avec succès.",
        });
      }
    } catch (error) {
      console.error('Erreur lors du chargement de l\'annonce:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données de l'annonce. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Déterminer si on est en mode édition ou création
  React.useEffect(() => {
    if (id) {
      setIsEditing(true);
      loadExistingListing(id);
    }
  }, [id]);

  // Fonction pour convertir les categories en noms d'affichage
  const getCategoryDisplayName = (cat) => {
    const categoryMap = {
      'real-estate': 'Immobilière',
      'automobile': 'Automobile',
      'services': 'de Service',
      'marketplace': 'Marketplace'
    };
    return categoryMap[cat] || '';
  };

  // Fonction pour obtenir l'icone de categorie
  const getCategoryIcon = (cat) => {
    const iconMap = {
      'real-estate': Home,
      'automobile': Car,
      'services': Briefcase,
      'marketplace': ShoppingBag
    };
    return iconMap[cat] || Home;
  };

  const CategoryIcon = getCategoryIcon(category);

  const steps = [
    {
      id: 1,
      title: 'Informations de base',
      description: 'Titre, description, catégorie, prix et localisation',
      icon: FileText,
      completed: false
    },
    {
      id: 2,
      title: 'Médias et publication',
      description: 'Photos, vidéos, caractéristiques spécifiques et publication',
      icon: Camera,
      completed: false
    }
  ];

  const handleSuccess = (res) => {
    // Redirige vers le profil avec un message de succes
    if (res?.id) {
      const message = isEditing 
        ? 'Annonce modifiée avec succès ! Les changements sont maintenant visibles sur le site.'
        : 'Annonce créée avec succès ! Elle est maintenant visible sur le site.';
      
      navigate('/profile', { 
        state: { 
          message,
          type: 'success'
        }
      });
    } else {
      navigate('/profile');
    }
  };

  const handleFormDataChange = (data) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  // Validation des données pour le preview
  const canShowPreview = () => {
    // Permettre le preview même avec des données partielles
    const hasBasicData = formData.title || formData.description || formData.price;
    return hasBasicData; // Plus permissif
  };

  // Fonction pour afficher un message d'aide
  const showPreviewHelp = () => {
    if (!formData.title && !formData.description && !formData.price) {
      return 'Commencez à remplir le formulaire pour voir l\'aperçu';
    }
    return 'Aperçu disponible (certaines données peuvent être manquantes)';
  };

  // Fonction pour contacter le support - MISE À JOUR
  const handleContactSupport = () => {
    // Construire le message pré-rempli
    const subject = encodeURIComponent('Support création annonce - MaxiMarket');
    const body = encodeURIComponent(`Bonjour l'équipe MaxiMarket,

Je rencontre des difficultés lors de la création de mon annonce et j'aurais besoin de votre aide.

📋 Détails de ma demande :
• Catégorie d'annonce : ${category ? getCategoryDisplayName(category) : 'Non spécifiée'}
• Étape actuelle : Étape ${currentStep} sur ${steps.length}
• Problème rencontré : [Veuillez décrire votre problème ici]

📧 Mon email de contact : [Votre email]
📱 Mon téléphone : [Votre téléphone]

Merci de votre aide !

Cordialement,
[Votre nom]

---
Ce message a été généré automatiquement depuis le formulaire de création d'annonce MaxiMarket.
Support : support@maximarket.com
Site : https://maximarket.com`);

    // Construire l'URL mailto avec tous les paramètres
const mailtoUrl = `mailto:${personalData.supportEmail}?subject=${subject}&body=${body}`;
    
    // Ouvrir le client mail par défaut
            window.open(mailtoUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header avec navigation */}
      <div className="bg-background/80 backdrop-blur-sm border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
              <div className="flex items-center space-x-3">
                {category && (
                  <div className="flex items-center space-x-2 bg-primary/10 px-3 py-1 rounded-full">
                    <CategoryIcon className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-primary">
                      {getCategoryDisplayName(category)}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
                disabled={!canShowPreview()}
                className={!canShowPreview() ? 'opacity-50 cursor-not-allowed' : ''}
                title={!canShowPreview() ? showPreviewHelp() : 'Voir l\'aperçu de votre annonce'}
              >
                <Eye className="h-4 w-4 mr-2" />
                {showPreview ? 'Masquer' : 'Aperçu'}
              </Button>

              

            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Titre principal */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl font-bold text-foreground mb-3">
              {isEditing 
                ? 'Modifier l\'annonce' 
                : category 
                  ? `Créer une annonce ${getCategoryDisplayName(category)}` 
                  : 'Créer une annonce'
              }
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {isEditing 
                ? isLoading 
                  ? 'Chargement des données de l\'annonce...'
                  : 'Modifiez les informations de votre annonce existante.'
                : 'Partagez votre offre avec notre communauté. Remplissez les informations ci-dessous pour publier votre annonce.'
              }
            </p>
          </motion.div>

          {/* Étapes de progression */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <div className="flex items-center justify-center space-x-4">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    currentStep >= step.id 
                      ? 'bg-primary border-primary text-white' 
                      : 'bg-card border-border text-muted-foreground'
                  }`}>
                    {currentStep > step.id ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <step.icon className="h-5 w-5" />
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-16 h-0.5 mx-2 ${
                      currentStep > step.id ? 'bg-primary' : 'bg-border'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="text-center mt-4">
              <p className="text-sm text-muted-foreground">
                Étape {currentStep} sur {steps.length} : {steps[currentStep - 1]?.title}
              </p>
            </div>
          </motion.div>

          {/* Aperçu de l'annonce */}
          {showPreview && (
            <ListingPreview 
              formData={formData} 
              onClose={() => setShowPreview(false)} 
            />
          )}

          {/* Contenu principal */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Formulaire principal */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="shadow-lg border-0">
                  <CardContent className="p-6">
                    <ListingForm 
                      onSuccess={handleSuccess} 
                      category={category}
                      onDataChange={handleFormDataChange}
                      currentStep={currentStep}
                      onStepChange={setCurrentStep}
                    />
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Sidebar d'aide */}
            <div className="space-y-6">
              {/* Conseils de publication */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="shadow-lg border-0">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      Conseils pour une annonce réussie
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-sm text-muted-foreground">
                          Utilisez un titre clair et descriptif
                        </p>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-sm text-muted-foreground">
                          Ajoutez des photos de qualité
                        </p>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-sm text-muted-foreground">
                          Décrivez précisément votre offre
                        </p>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-sm text-muted-foreground">
                          Fixez un prix compétitif
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>



              {/* Support */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="shadow-lg border-0">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-4">Besoin d'aide ?</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Notre équipe est là pour vous accompagner dans la création de votre annonce.
                    </p>
                    <Button variant="outline" className="w-full" onClick={handleContactSupport}>
                      Contacter le support
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
      <Toaster />
    </div>
  );
};

export default CreateListingPage; 