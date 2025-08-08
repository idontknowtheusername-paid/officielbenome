import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ListingForm from '@/components/ListingForm';
import { useNavigate, useParams } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  const { category } = useParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({});
  const [showPreview, setShowPreview] = useState(false);

  // Fonction pour convertir les catégories en noms d'affichage
  const getCategoryDisplayName = (cat) => {
    const categoryMap = {
      'real-estate': 'Immobilière',
      'automobile': 'Automobile',
      'services': 'de Service',
      'marketplace': 'Marketplace'
    };
    return categoryMap[cat] || '';
  };

  // Fonction pour obtenir l'icône de catégorie
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
      title: 'Médias et détails',
      description: 'Photos, vidéos et caractéristiques spécifiques',
      icon: Camera,
      completed: false
    },
    {
      id: 3,
      title: 'Aperçu et publication',
      description: 'Vérification finale et publication',
      icon: Eye,
      completed: false
    }
  ];

  const handleSuccess = (res) => {
    // Redirige vers la page de l'annonce ou dashboard après création
    if (res?.listing?.id) {
      navigate(`/listings/${res.listing.id}`);
    } else {
      navigate('/profile');
    }
  };

  const handleFormDataChange = (data) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header avec navigation */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="text-gray-600 hover:text-gray-900"
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
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Nouvelle annonce
                </Badge>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
              >
                <Eye className="h-4 w-4 mr-2" />
                {showPreview ? 'Masquer' : 'Aperçu'}
              </Button>
              <Button variant="outline" size="sm">
                Sauvegarder
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
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              {category ? `Créer une annonce ${getCategoryDisplayName(category)}` : 'Créer une annonce'}
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Partagez votre offre avec notre communauté. Remplissez les informations ci-dessous pour publier votre annonce.
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
                      : 'bg-white border-gray-300 text-gray-400'
                  }`}>
                    {currentStep > step.id ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <step.icon className="h-5 w-5" />
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-16 h-0.5 mx-2 ${
                      currentStep > step.id ? 'bg-primary' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="text-center mt-4">
              <p className="text-sm text-gray-600">
                Étape {currentStep} sur {steps.length} : {steps[currentStep - 1]?.title}
              </p>
            </div>
          </motion.div>

          {/* Aperçu de l'annonce */}
          {showPreview && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <Card className="shadow-lg border-0">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <Eye className="h-5 w-5 text-blue-500 mr-2" />
                    Aperçu de votre annonce
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                    <div>
                      <h4 className="font-semibold text-lg text-gray-900">
                        {formData.title || 'Titre de l\'annonce'}
                      </h4>
                      <p className="text-gray-600 mt-2">
                        {formData.description || 'Description de l\'annonce...'}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Prix:</span> 
                        <span className="ml-2 text-gray-900">
                          {formData.price ? `${formData.price} ${formData.currency || 'XOF'}` : 'Non défini'}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Catégorie:</span> 
                        <span className="ml-2 text-gray-900">
                          {formData.category || 'Non définie'}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Localisation:</span> 
                        <span className="ml-2 text-gray-900">
                          {formData.location?.city && formData.location?.country 
                            ? `${formData.location.city}, ${formData.location.country}`
                            : 'Non définie'
                          }
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Images:</span> 
                        <span className="ml-2 text-gray-900">
                          {formData.images?.length || 0} image(s)
                        </span>
                      </div>
                    </div>
                    
                    {formData.images && formData.images.length > 0 && (
                      <div>
                        <span className="font-medium text-sm text-gray-700">Aperçu des images:</span>
                        <div className="flex gap-2 mt-2">
                          {formData.images.slice(0, 3).map((img, idx) => (
                            <img key={idx} src={img} alt="" className="w-16 h-16 object-cover rounded" />
                          ))}
                          {formData.images.length > 3 && (
                            <div className="w-16 h-16 bg-gray-300 rounded flex items-center justify-center text-xs text-gray-600 font-medium">
                              +{formData.images.length - 3}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
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
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      Conseils pour une annonce réussie
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-sm text-gray-600">
                          Utilisez un titre clair et descriptif
                        </p>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-sm text-gray-600">
                          Ajoutez des photos de qualité
                        </p>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-sm text-gray-600">
                          Décrivez précisément votre offre
                        </p>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-sm text-gray-600">
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
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Besoin d'aide ?</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Notre équipe est là pour vous accompagner dans la création de votre annonce.
                    </p>
                    <Button variant="outline" className="w-full">
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