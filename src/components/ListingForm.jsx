import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { listingService, storageService } from '@/services/supabase.service';
import { Camera } from 'lucide-react';

const CATEGORY_OPTIONS = [
  { value: 'REAL_ESTATE', label: 'Immobilier' },
  { value: 'AUTOMOBILE', label: 'Automobile' },
  { value: 'SERVICE', label: 'Service' },
  { value: 'PRODUCT', label: 'Produit' },
];

const DEFAULT_FORM = {
  title: '',
  description: '',
  price: '',
  currency: 'XOF',
  category: '',
  subCategory: '',
  location: { city: '', country: '' },
  images: [],
  videos: [],
  specificData: {},
};

// Fonction pour convertir les catégories URL en valeurs du formulaire
const getCategoryValue = (cat) => {
  const categoryMap = {
    'real-estate': 'REAL_ESTATE',
    'automobile': 'AUTOMOBILE',
    'services': 'SERVICE',
    'marketplace': 'PRODUCT'
  };
  return categoryMap[cat] || '';
};

const ListingForm = ({ onSuccess, category, onDataChange, currentStep = 1, onStepChange }) => {
  const { toast } = useToast();
  const [form, setForm] = useState({
    ...DEFAULT_FORM,
    category: category ? getCategoryValue(category) : ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeStep, setActiveStep] = useState(currentStep);

  // Synchroniser les étapes avec le parent
  useEffect(() => {
    setActiveStep(currentStep);
  }, [currentStep]);

  // Ajout des données pays/villes
  const COUNTRY_CITY_OPTIONS = [
    {
      code: 'BJ',
      name: 'Bénin',
      cities: [
        'Cotonou', 'Porto-Novo', 'Parakou', 'Djougou', 'Bohicon',
        'Kandi', 'Abomey', 'Natitingou', 'Ouidah', 'Lokossa'
      ]
    },
    {
      code: 'CI',
      name: 'Côte d\'Ivoire',
      cities: [
        'Abidjan', 'Bouaké', 'Daloa', 'Yamoussoukro', 'San Pedro',
        'Korhogo', 'Man', 'Gagnoa', 'Abengourou', 'Divo'
      ]
    },
    {
      code: 'NG',
      name: 'Nigeria',
      cities: [
        'Lagos', 'Kano', 'Ibadan', 'Abuja', 'Port Harcourt',
        'Benin City', 'Maiduguri', 'Zaria', 'Aba', 'Jos'
      ]
    }
  ];

  // Gestion des champs principaux
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('location.')) {
      const locField = name.split('.')[1];
      setForm((prev) => ({ ...prev, location: { ...prev.location, [locField]: value } }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
    
    // Notifier le parent des changements
    if (onDataChange) {
      onDataChange({ [name]: value });
    }
  };

  // Gestion des champs spécifiques selon la catégorie
  const handleSpecificChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      specificData: { ...prev.specificData, [name]: value },
    }));
  };

  // Gestion des images (URLs pour simplifier)
  const handleImagesChange = (e) => {
    setForm((prev) => ({ ...prev, images: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) }));
  };

  // Limitation à 8 images lors de l'upload
  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    
    // Vérifier la limite d'images
    if (form.images.length + files.length > 8) {
      toast({ 
        title: 'Limite atteinte', 
        description: 'Vous pouvez uploader jusqu\'à 8 images maximum.', 
        variant: 'destructive' 
      });
      return;
    }

    // Vérifier les types de fichiers
    const invalidFiles = files.filter(file => !file.type.startsWith('image/'));
    if (invalidFiles.length > 0) {
      toast({ 
        title: 'Type de fichier invalide', 
        description: 'Seules les images sont acceptées.', 
        variant: 'destructive' 
      });
      return;
    }

    // Vérifier la taille des fichiers (max 10MB chacun)
    const oversizedFiles = files.filter(file => file.size > 10 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      toast({ 
        title: 'Fichier trop volumineux', 
        description: 'Chaque image ne doit pas dépasser 10MB.', 
        variant: 'destructive' 
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const uploadedUrls = [];
      const errors = [];

      for (const file of files) {
        try {
          const res = await storageService.uploadImage(file, 'listings');
          if (res) uploadedUrls.push(res);
        } catch (error) {
          console.error('Erreur upload pour', file.name, error);
          errors.push(`${file.name}: ${error.message}`);
        }
      }

      // Ajouter les images uploadées avec succès
      if (uploadedUrls.length > 0) {
        setForm((prev) => ({ ...prev, images: [...prev.images, ...uploadedUrls] }));
        toast({ 
          title: 'Images ajoutées', 
          description: `${uploadedUrls.length} image(s) téléchargée(s) avec succès.` 
        });
      }

      // Afficher les erreurs s'il y en a
      if (errors.length > 0) {
        toast({ 
          title: 'Erreurs d\'upload', 
          description: `Erreurs pour ${errors.length} fichier(s): ${errors.join(', ')}`, 
          variant: 'destructive' 
        });
      }
    } catch (err) {
      console.error('Erreur générale upload:', err);
      toast({ 
        title: 'Erreur upload', 
        description: err?.message || 'Erreur lors de l\'upload.', 
        variant: 'destructive' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Suppression d'une image uploadée (avant publication)
  const handleRemoveImage = (idxToRemove) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== idxToRemove)
    }));
  };

  // Réordonner les images (flèches)
  const moveImage = (fromIdx, toIdx) => {
    setForm((prev) => {
      const images = [...prev.images];
      if (toIdx < 0 || toIdx >= images.length) return prev;
      const [moved] = images.splice(fromIdx, 1);
      images.splice(toIdx, 0, moved);
      return { ...prev, images };
    });
  };

  // Validation simple
  const validate = () => {
    if (!form.title || form.title.length < 5) return 'Le titre est requis (min 5 caractères)';
    if (!form.description || form.description.length < 10) return 'La description est requise (min 10 caractères)';
    if (!form.price || isNaN(Number(form.price))) return 'Le prix est requis et doit être un nombre';
    if (!form.category) return 'La catégorie est requise';
    return null;
  };

  const nextStep = () => {
    if (activeStep < 3) {
      setActiveStep(activeStep + 1);
      if (onStepChange) {
        onStepChange(activeStep + 1);
      }
    }
  };

  const prevStep = () => {
    if (activeStep > 1) {
      setActiveStep(activeStep - 1);
      if (onStepChange) {
        onStepChange(activeStep - 1);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const error = validate();
    if (error) {
      toast({ title: 'Erreur de validation', description: error, variant: 'destructive' });
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price),
      };
      const res = await listingService.createListing(payload);
      toast({ title: 'Annonce créée !', description: 'Votre annonce a été soumise avec succès.' });
      setForm(DEFAULT_FORM);
      if (onSuccess) onSuccess(res);
    } catch (err) {
      toast({ title: 'Erreur', description: err?.message || 'Erreur lors de la création.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Champs spécifiques selon la catégorie
  const renderSpecificFields = () => {
    switch (form.category) {
      case 'REAL_ESTATE':
        return (
          <>
            <Label>Type de bien</Label>
            <Input name="propertyType" placeholder="Appartement, Maison..." value={form.specificData.propertyType || ''} onChange={handleSpecificChange} />
            <Label>Transaction</Label>
            <Input name="transactionType" placeholder="sale/rent" value={form.specificData.transactionType || ''} onChange={handleSpecificChange} />
            <Label>Chambres</Label>
            <Input name="bedrooms" type="number" value={form.specificData.bedrooms || ''} onChange={handleSpecificChange} />
            <Label>Salles de bain</Label>
            <Input name="bathrooms" type="number" value={form.specificData.bathrooms || ''} onChange={handleSpecificChange} />
            <Label>Surface (m²)</Label>
            <Input name="areaSqMeters" type="number" value={form.specificData.areaSqMeters || ''} onChange={handleSpecificChange} />
            <Label>Commodités (amenities)</Label>
            {(form.specificData.amenities || []).map((a, i) => (
              <div key={i} className="flex gap-2 mb-1">
                <Input
                  value={a}
                  onChange={e => handleAmenityChange(i, e.target.value)}
                  placeholder="Ex: Piscine, Parking..."
                />
                <Button type="button" size="icon" variant="destructive" onClick={() => removeAmenity(i)} title="Supprimer" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                  ×
                </Button>
              </div>
            ))}
            <Button type="button" size="sm" variant="outline" onClick={addAmenity} className="mb-2 border-gray-400 text-gray-700 hover:bg-gray-50">+ Ajouter une commodité</Button>
          </>
        );
      case 'AUTOMOBILE':
        return (
          <>
            <Label>Type de véhicule</Label>
            <Input name="vehicleType" placeholder="Voiture, Moto..." value={form.specificData.vehicleType || ''} onChange={handleSpecificChange} />
            <Label>Marque</Label>
            <Input name="make" value={form.specificData.make || ''} onChange={handleSpecificChange} />
            <Label>Modèle</Label>
            <Input name="model" value={form.specificData.model || ''} onChange={handleSpecificChange} />
            <Label>Année</Label>
            <Input name="year" type="number" value={form.specificData.year || ''} onChange={handleSpecificChange} />
            <Label>Kilométrage</Label>
            <Input name="mileage" type="number" value={form.specificData.mileage || ''} onChange={handleSpecificChange} />
          </>
        );
      case 'SERVICE':
        return (
          <>
            <Label>Catégorie de service</Label>
            <Input name="serviceCategory" value={form.specificData.serviceCategory || ''} onChange={handleSpecificChange} />
            <Label>Disponibilité</Label>
            <Input name="availability" value={form.specificData.availability || ''} onChange={handleSpecificChange} />
            <Label>Années d'expérience</Label>
            <Input name="experienceYears" type="number" value={form.specificData.experienceYears || ''} onChange={handleSpecificChange} />
            <Label>Liens de portfolio</Label>
            {(form.specificData.portfolioLinks || []).map((l, i) => (
              <div key={i} className="flex gap-2 mb-1">
                <Input
                  value={l}
                  onChange={e => handlePortfolioChange(i, e.target.value)}
                  placeholder="https://..."
                />
                <Button type="button" size="icon" variant="destructive" onClick={() => removePortfolioLink(i)} title="Supprimer" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                  ×
                </Button>
              </div>
            ))}
            <Button type="button" size="sm" variant="outline" onClick={addPortfolioLink} className="mb-2 border-gray-400 text-gray-700 hover:bg-gray-50">+ Ajouter un lien</Button>
          </>
        );
      case 'PRODUCT':
        return (
          <>
            <Label>Catégorie de produit</Label>
            <Input name="productCategory" value={form.specificData.productCategory || ''} onChange={handleSpecificChange} />
            <Label>Marque</Label>
            <Input name="brand" value={form.specificData.brand || ''} onChange={handleSpecificChange} />
            <Label>Quantité en stock</Label>
            <Input name="stockQuantity" type="number" value={form.specificData.stockQuantity || ''} onChange={handleSpecificChange} />
          </>
        );
      default:
        return null;
    }
  };

  // Champs dynamiques avancés pour les sous-champs
  // Ajout/suppression de liens de portfolio (Service)
  const handlePortfolioChange = (i, value) => {
    setForm((prev) => ({
      ...prev,
      specificData: {
        ...prev.specificData,
        portfolioLinks: prev.specificData.portfolioLinks?.map((l, idx) => idx === i ? value : l) || [],
      },
    }));
  };
  const addPortfolioLink = () => {
    setForm((prev) => ({
      ...prev,
      specificData: {
        ...prev.specificData,
        portfolioLinks: [...(prev.specificData.portfolioLinks || []), ''],
      },
    }));
  };
  const removePortfolioLink = (i) => {
    setForm((prev) => ({
      ...prev,
      specificData: {
        ...prev.specificData,
        portfolioLinks: prev.specificData.portfolioLinks?.filter((_, idx) => idx !== i) || [],
      },
    }));
  };
  // Ajout/suppression d'amenities (Real Estate)
  const handleAmenityChange = (i, value) => {
    setForm((prev) => ({
      ...prev,
      specificData: {
        ...prev.specificData,
        amenities: prev.specificData.amenities?.map((a, idx) => idx === i ? value : a) || [],
      },
    }));
  };
  const addAmenity = () => {
    setForm((prev) => ({
      ...prev,
      specificData: {
        ...prev.specificData,
        amenities: [...(prev.specificData.amenities || []), ''],
      },
    }));
  };
  const removeAmenity = (i) => {
    setForm((prev) => ({
      ...prev,
      specificData: {
        ...prev.specificData,
        amenities: prev.specificData.amenities?.filter((_, idx) => idx !== i) || [],
      },
    }));
  };

  // Rendu des étapes du formulaire
  const renderStep = () => {
    switch (activeStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Informations de base</h3>
              <p className="text-gray-600 mb-6">Commencez par les informations essentielles de votre annonce.</p>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titre de l'annonce *</Label>
                <Input
                  id="title"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Ex: Appartement moderne 3 pièces à Cotonou"
                  required
                  className="h-12"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Décrivez votre offre en détail..."
                  rows={6}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Catégorie *</Label>
                <select
                  id="category"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-3 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent h-12 text-gray-900 bg-white"
                >
                  <option value="" className="text-gray-900">Sélectionner une catégorie</option>
                  {CATEGORY_OPTIONS.map(option => (
                    <option key={option.value} value={option.value} className="text-gray-900">{option.label}</option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Prix et localisation intégrés dans l'étape 1 */}
            <div className="space-y-4 pt-6 border-t">
              <h4 className="text-lg font-medium text-gray-900">Prix et localisation</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="price">Prix *</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    value={form.price}
                    onChange={handleChange}
                    placeholder="0"
                    required
                    className="h-12"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="currency">Devise</Label>
                  <select
                    id="currency"
                    name="currency"
                    value={form.currency}
                    onChange={handleChange}
                    className="w-full px-3 py-3 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent h-12 text-gray-900 bg-white"
                  >
                    <option value="XOF" className="text-gray-900">XOF (Franc CFA)</option>
                    <option value="EUR" className="text-gray-900">EUR (Euro)</option>
                    <option value="USD" className="text-gray-900">USD (Dollar US)</option>
                    <option value="NGN" className="text-gray-900">NGN (Naira)</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="country">Pays</Label>
                  <select
                    id="country"
                    name="location.country"
                    value={form.location.country}
                    onChange={handleChange}
                    className="w-full px-3 py-3 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent h-12 text-gray-900 bg-white"
                  >
                    <option value="" className="text-gray-900">Sélectionner un pays</option>
                    {COUNTRY_CITY_OPTIONS.map(country => (
                      <option key={country.code} value={country.name} className="text-gray-900">{country.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="city">Ville</Label>
                  <select
                    id="city"
                    name="location.city"
                    value={form.location.city}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-3 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent h-12 text-gray-900 bg-white disabled:bg-gray-100 disabled:text-gray-500"
                    disabled={!form.location.country}
                  >
                    <option value="" className="text-gray-900">Sélectionner une ville</option>
                    {COUNTRY_CITY_OPTIONS.find(c => c.name === form.location.country)?.cities.map(city => (
                      <option key={city} value={city} className="text-gray-900">{city}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Médias et détails</h3>
              <p className="text-gray-600 mb-6">Ajoutez des photos et des informations spécifiques à votre catégorie.</p>
            </div>
            
            {/* Section Médias */}
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-gray-900">Images</h4>
              <div className="space-y-2">
                <Label>Images</Label>
                <div className="border-2 border-dashed border-gray-400 rounded-lg p-6 text-center hover:border-primary transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <div className="space-y-2">
                      <div className="mx-auto w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                        <Camera className="h-6 w-6 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Cliquez pour ajouter des images</p>
                        <p className="text-xs text-gray-600">PNG, JPG jusqu'à 10MB</p>
                      </div>
                    </div>
                  </label>
                </div>
              </div>
              
              {form.images.length > 0 && (
                <div className="space-y-3">
                  <Label>Images sélectionnées ({form.images.length})</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {form.images.map((img, idx) => (
                      <div key={idx} className="relative group aspect-square">
                        <img
                          src={img}
                          alt={`Aperçu ${idx + 1}`}
                          className="w-full h-full object-cover rounded-lg border"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1.5 text-xs opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                          title="Supprimer cette image"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Section Détails spécifiques */}
            <div className="space-y-4 pt-6 border-t">
              <h4 className="text-lg font-medium text-gray-900">Détails spécifiques</h4>
              {form.category ? (
                <div className="space-y-4">
                  {renderSpecificFields()}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500">Veuillez d'abord sélectionner une catégorie à l'étape 1.</p>
                </div>
              )}
            </div>
          </div>
        );
        
      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Aperçu et publication</h3>
              <p className="text-gray-600 mb-6">Vérifiez les informations avant de publier votre annonce.</p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <div>
                <h4 className="font-semibold text-lg">{form.title}</h4>
                <p className="text-gray-600">{form.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Prix:</span> {form.price} {form.currency}
                </div>
                <div>
                  <span className="font-medium">Catégorie:</span> {form.category}
                </div>
                <div>
                  <span className="font-medium">Localisation:</span> {form.location.city}, {form.location.country}
                </div>
                <div>
                  <span className="font-medium">Images:</span> {form.images.length}
                </div>
              </div>
              
              {form.images.length > 0 && (
                <div>
                  <span className="font-medium text-sm">Aperçu des images:</span>
                  <div className="flex gap-2 mt-2">
                    {form.images.slice(0, 3).map((img, idx) => (
                      <img key={idx} src={img} alt="" className="w-16 h-16 object-cover rounded" />
                    ))}
                    {form.images.length > 3 && (
                      <div className="w-16 h-16 bg-gray-300 rounded flex items-center justify-center text-xs text-gray-600 font-medium">
                        +{form.images.length - 3}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {renderStep()}
      
      {/* Navigation entre les étapes */}
      <div className="flex justify-between items-center pt-6 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={prevStep}
          disabled={activeStep === 1}
        >
          Précédent
        </Button>
        
        <div className="flex items-center space-x-2">
          {activeStep < 3 ? (
            <Button
              type="button"
              onClick={nextStep}
              disabled={!form.title || !form.description || !form.category}
            >
              Suivant
            </Button>
          ) : (
            <Button
              type="submit"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? 'Publication...' : 'Publier l\'annonce'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ListingForm; 