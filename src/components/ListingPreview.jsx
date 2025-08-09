import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  MapPin, 
  Calendar, 
  Eye, 
  Heart,
  Share2,
  Phone,
  MessageSquare,
  Star,
  Clock,
  Tag,
  Building,
  Car,
  Briefcase,
  ShoppingBag
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const ListingPreview = ({ formData, onClose }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  // Fonction pour obtenir l'icone de categorie
  const getCategoryIcon = (category) => {
    const iconMap = {
      'real_estate': Building,
      'automobile': Car,
      'services': Briefcase,
      'marketplace': ShoppingBag
    };
    return iconMap[category] || Building;
  };

  // Fonction pour obtenir le nom d'affichage de la categorie
  const getCategoryDisplayName = (category) => {
    const categoryMap = {
      'real_estate': 'Immobilier',
      'automobile': 'Automobile',
      'services': 'Service',
      'marketplace': 'Produit'
    };
    return categoryMap[category] || 'Autre';
  };

  const CategoryIcon = getCategoryIcon(formData.category);

  const nextImage = () => {
    if (formData.images && formData.images.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === formData.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (formData.images && formData.images.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? formData.images.length - 1 : prev - 1
      );
    }
  };

  const goToImage = (index) => {
    setCurrentImageIndex(index);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header avec bouton fermer */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-semibold text-gray-900">Aperçu de l'annonce</h2>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </Button>
        </div>

        <div className="p-6">
          {/* Section Images */}
          <div className="mb-6">
            <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
              {formData.images && formData.images.length > 0 ? (
                <>
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={currentImageIndex}
                      src={typeof formData.images[currentImageIndex] === 'string' 
                        ? formData.images[currentImageIndex] 
                        : formData.images[currentImageIndex]?.url}
                      alt={`Image ${currentImageIndex + 1}`}
                      className="w-full h-full object-cover"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    />
                  </AnimatePresence>

                  {/* Navigation arrows */}
                  {formData.images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </>
                  )}

                  {/* Image counter */}
                  <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                    {currentImageIndex + 1} / {formData.images.length}
                  </div>

                  {/* Action buttons */}
                  <div className="absolute top-4 left-4 flex space-x-2">
                    <button
                      onClick={() => setIsLiked(!isLiked)}
                      className={`p-2 rounded-full transition-all ${
                        isLiked 
                          ? 'bg-red-500 text-white' 
                          : 'bg-white bg-opacity-80 text-gray-700 hover:bg-opacity-100'
                      }`}
                    >
                      <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
                    </button>
                    <button className="p-2 rounded-full bg-white bg-opacity-80 text-gray-700 hover:bg-opacity-100 transition-all">
                      <Share2 className="h-5 w-5" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Tag className="h-8 w-8" />
                    </div>
                    <p>Aucune image</p>
                  </div>
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {formData.images && formData.images.length > 1 && (
              <div className="flex space-x-2 mt-4 overflow-x-auto">
                {formData.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => goToImage(index)}
                    className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      index === currentImageIndex 
                        ? 'border-blue-500' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={typeof image === 'string' ? image : image?.url}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Section Informations principales */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              {/* Titre et catégorie */}
              <div className="mb-4">
                <div className="flex items-center space-x-3 mb-2">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    <CategoryIcon className="h-3 w-3 mr-1" />
                    {getCategoryDisplayName(formData.category)}
                  </Badge>
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    Actif
                  </Badge>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {formData.title || 'Titre de l\'annonce'}
                </h1>
                <div className="flex items-center text-gray-600 text-sm">
                  <MapPin className="h-4 w-4 mr-1" />
                  {formData.location?.city && formData.location?.country 
                    ? `${formData.location.city}, ${formData.location.country}`
                    : 'Localisation non définie'
                  }
                </div>
              </div>

              {/* Prix */}
              <div className="mb-6">
                <div className="text-3xl font-bold text-gray-900">
                  {formData.price ? `${formData.price} ${formData.currency || 'XOF'}` : 'Prix non défini'}
                </div>
                {formData.category === 'real_estate' && formData.specificData?.areaSqMeters && (
                  <div className="text-sm text-gray-600 mt-1">
                    {formData.specificData.areaSqMeters} m²
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                <p className="text-gray-700 leading-relaxed">
                  {formData.description || 'Aucune description fournie.'}
                </p>
              </div>

              {/* Détails spécifiques */}
              {formData.specificData && Object.keys(formData.specificData).length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Détails</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {formData.category === 'real_estate' && (
                      <>
                        {formData.specificData.propertyType && (
                          <div>
                            <span className="text-sm text-gray-600">Type:</span>
                            <div className="font-medium">{formData.specificData.propertyType}</div>
                          </div>
                        )}
                        {formData.specificData.bedrooms && (
                          <div>
                            <span className="text-sm text-gray-600">Chambres:</span>
                            <div className="font-medium">{formData.specificData.bedrooms}</div>
                          </div>
                        )}
                        {formData.specificData.bathrooms && (
                          <div>
                            <span className="text-sm text-gray-600">Salles de bain:</span>
                            <div className="font-medium">{formData.specificData.bathrooms}</div>
                          </div>
                        )}
                        {formData.specificData.areaSqMeters && (
                          <div>
                            <span className="text-sm text-gray-600">Surface:</span>
                            <div className="font-medium">{formData.specificData.areaSqMeters} m²</div>
                          </div>
                        )}
                      </>
                    )}
                    {formData.category === 'automobile' && (
                      <>
                        {formData.specificData.make && (
                          <div>
                            <span className="text-sm text-gray-600">Marque:</span>
                            <div className="font-medium">{formData.specificData.make}</div>
                          </div>
                        )}
                        {formData.specificData.model && (
                          <div>
                            <span className="text-sm text-gray-600">Modèle:</span>
                            <div className="font-medium">{formData.specificData.model}</div>
                          </div>
                        )}
                        {formData.specificData.year && (
                          <div>
                            <span className="text-sm text-gray-600">Année:</span>
                            <div className="font-medium">{formData.specificData.year}</div>
                          </div>
                        )}
                        {formData.specificData.mileage && (
                          <div>
                            <span className="text-sm text-gray-600">Kilométrage:</span>
                            <div className="font-medium">{formData.specificData.mileage} km</div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Actions */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="space-y-3">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    <Phone className="h-4 w-4 mr-2" />
                    Contacter
                  </Button>
                  <Button variant="outline" className="w-full">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Envoyer un message
                  </Button>
                </div>
              </div>

              {/* Informations vendeur */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Vendeur</h4>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {formData.user?.firstName?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {formData.user?.firstName ? `${formData.user.firstName} ${formData.user.lastName || ''}` : 'Utilisateur'}
                    </div>
                    <div className="text-sm text-gray-600">Membre depuis 2024</div>
                  </div>
                </div>
                <div className="flex items-center mt-3 text-sm text-gray-600">
                  <Star className="h-4 w-4 text-yellow-400 mr-1" />
                  <span>4.8 (12 avis)</span>
                </div>
              </div>

              {/* Statistiques */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Statistiques</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Vues:</span>
                    <span className="font-medium">0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Favoris:</span>
                    <span className="font-medium">0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Partages:</span>
                    <span className="font-medium">0</span>
                  </div>
                </div>
              </div>

              {/* Date de publication */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="h-4 w-4 mr-2" />
                  Publié aujourd'hui
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ListingPreview; 