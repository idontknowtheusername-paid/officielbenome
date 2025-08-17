import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  MapPin, 
  Eye, 
  Heart,
  Share2,
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

  // Fonction pour obtenir l'URL d'une image - CORRIGÉE
  const getImageUrl = (image) => {
    if (!image) return null;
    
    // Si c'est une chaîne (URL directe)
    if (typeof image === 'string') return image;
    
    // Si c'est un objet avec une URL
    if (image?.url) return image.url;
    
    // Si c'est un objet avec un fichier (preview)
    if (image?.file) return URL.createObjectURL(image.file);
    
    // Si c'est un objet avec une source
    if (image?.src) return image.src;
    
    return null;
  };

  // Fonction pour obtenir les images valides - CORRIGÉE
  const getValidImages = () => {
    if (!formData.images || !Array.isArray(formData.images)) return [];
    
    // Filtrer et valider les images
    return formData.images
      .map(img => {
        const url = getImageUrl(img);
        return url ? { ...img, displayUrl: url } : null;
      })
      .filter(Boolean);
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

  const validImages = getValidImages();
  
  const nextImage = () => {
    if (validImages.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === validImages.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (validImages.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? validImages.length - 1 : prev
      );
    }
  };

  const goToImage = (index) => {
    if (index >= 0 && index < validImages.length) {
      setCurrentImageIndex(index);
    }
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
        className="bg-background rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header avec bouton fermer */}
        <div className="sticky top-0 bg-background border-b border-border px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center space-x-3">
            <h2 className="text-xl font-semibold text-foreground">Aperçu de l'annonce</h2>
            {(!formData.title || !formData.description || !formData.price) && (
              <Badge variant="outline" className="text-xs text-yellow-600 border-yellow-600">
                Preview partiel
              </Badge>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-muted-foreground hover:text-foreground">
            ✕
          </Button>
        </div>

        <div className="p-6">
          {/* Section Images - CORRIGÉE */}
          <div className="mb-6">
            <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
              {validImages.length > 0 ? (
                <>
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={currentImageIndex}
                      src={validImages[currentImageIndex]?.displayUrl}
                      alt={`Image ${currentImageIndex + 1}`}
                      className="w-full h-full object-cover"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    />
                  </AnimatePresence>

                  {/* Navigation arrows */}
                  {validImages.length > 1 && (
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
                    {currentImageIndex + 1} / {validImages.length}
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
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                      <Tag className="h-8 w-8" />
                    </div>
                    <p>Aucune image</p>
                    <p className="text-xs mt-1">Ajoutez des images à l'étape 2</p>
                  </div>
                </div>
              )}
            </div>

            {/* Thumbnails - CORRIGÉS */}
            {validImages.length > 1 && (
              <div className="flex space-x-2 mt-4 overflow-x-auto">
                {validImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => goToImage(index)}
                    className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      index === currentImageIndex 
                        ? 'border-primary' 
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <img
                      src={image.displayUrl}
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
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                    <CategoryIcon className="h-3 w-3 mr-1" />
                    {getCategoryDisplayName(formData.category)}
                  </Badge>
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    Actif
                  </Badge>
                </div>
                <h1 className="text-2xl font-bold text-foreground mb-2">
                  {formData.title || 'Titre de l\'annonce (à définir)'}
                </h1>
                <div className="flex items-center text-muted-foreground text-sm">
                  <MapPin className="h-4 w-4 mr-1" />
                  {formData.location && typeof formData.location === 'object' && formData.location.city && formData.location.country 
                    ? `${formData.location.city}, ${formData.location.country}`
                    : 'Localisation non définie'
                  }
                </div>
              </div>

              {/* Prix */}
              <div className="mb-6">
                <div className="text-3xl font-bold text-foreground">
                  {formData.price ? `${formData.price} ${formData.currency || 'XOF'}` : 'Prix à définir'}
                </div>
                {formData.category === 'real_estate' && formData.specificData?.areaSqMeters && (
                  <div className="text-sm text-muted-foreground mt-1">
                    {formData.specificData.areaSqMeters} m²
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-foreground mb-3">Description</h3>
                <p className="text-foreground leading-relaxed">
                  {formData.description || 'Description à ajouter pour votre annonce.'}
                </p>
              </div>

              {/* Détails spécifiques */}
              {formData.specificData && Object.keys(formData.specificData).length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-foreground mb-3">Détails</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {formData.category === 'real_estate' && (
                      <>
                        {formData.specificData.propertyType && (
                          <div>
                            <span className="text-sm text-muted-foreground">Type:</span>
                            <div className="font-medium text-foreground">{formData.specificData.propertyType}</div>
                          </div>
                        )}
                        {formData.specificData.bedrooms && (
                          <div>
                            <span className="text-sm text-muted-foreground">Chambres:</span>
                            <div className="font-medium text-foreground">{formData.specificData.bedrooms}</div>
                          </div>
                        )}
                        {formData.specificData.bathrooms && (
                          <div>
                            <span className="text-sm text-muted-foreground">Salles de bain:</span>
                            <div className="font-medium text-foreground">{formData.specificData.bathrooms}</div>
                          </div>
                        )}
                        {formData.specificData.areaSqMeters && (
                          <div>
                            <span className="text-sm text-muted-foreground">Surface:</span>
                            <div className="font-medium text-foreground">{formData.specificData.areaSqMeters} m²</div>
                          </div>
                        )}
                      </>
                    )}
                    {formData.category === 'automobile' && (
                      <>
                        {formData.specificData.make && (
                          <div>
                            <span className="text-sm text-muted-foreground">Marque:</span>
                            <div className="font-medium text-foreground">{formData.specificData.make}</div>
                          </div>
                        )}
                        {formData.specificData.model && (
                          <div>
                            <span className="text-sm text-muted-foreground">Modèle:</span>
                            <div className="font-medium text-foreground">{formData.specificData.model}</div>
                          </div>
                        )}
                        {formData.specificData.year && (
                          <div>
                            <span className="text-sm text-muted-foreground">Année:</span>
                            <div className="font-medium text-foreground">{formData.specificData.year}</div>
                          </div>
                        )}
                        {formData.specificData.mileage && (
                          <div>
                            <span className="text-sm text-muted-foreground">Kilométrage:</span>
                            <div className="font-medium text-foreground">{formData.specificData.mileage} km</div>
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
              {/* Informations sur les images */}
              <div className="bg-muted/50 rounded-lg p-4">
                <h4 className="font-semibold text-foreground mb-2">Images</h4>
                <div className="text-sm text-muted-foreground">
                  <p>• {validImages.length} image(s) ajoutée(s)</p>
                  {validImages.length === 0 && (
                    <p className="text-yellow-600 mt-1">
                      ⚠️ Aucune image - Ajoutez des images à l'étape 2
                    </p>
                  )}
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