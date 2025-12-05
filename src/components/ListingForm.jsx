import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { listingService, storageService } from '@/services';
import { Camera } from 'lucide-react';

const CATEGORY_OPTIONS = [
  { value: 'real_estate', label: 'Immobilier' },
  { value: 'automobile', label: 'Automobile' },
  { value: 'services', label: 'Service' },
  { value: 'marketplace', label: 'Produit' },
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

// Fonction pour convertir les categories URL en valeurs du formulaire
const getCategoryValue = (cat) => {
  const categoryMap = {
    'real-estate': 'real_estate',
    'automobile': 'automobile',
    'services': 'services',
    'marketplace': 'marketplace'
  };
  return categoryMap[cat] || '';
};

const ListingForm = ({ onSuccess, category, onDataChange, currentStep = 1, onStepChange, initialData = null, listingId = null }) => {
  const { toast } = useToast();
  const [form, setForm] = useState(
    initialData || {
      ...DEFAULT_FORM,
      category: category ? getCategoryValue(category) : ''
    }
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
  const [activeStep, setActiveStep] = useState(currentStep);

  // Synchroniser les etapes avec le parent
  useEffect(() => {
    setActiveStep(currentStep);
  }, [currentStep]);

  // Charger les données initiales en mode édition
  useEffect(() => {
    if (initialData) {
      setForm(prevForm => ({
        ...prevForm,
        ...initialData
      }));
    }
  }, [initialData]);

  // Ajout des donnees pays/villes
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
      const newLocation = { ...form.location, [locField]: value };
      setForm((prev) => ({ ...prev, location: newLocation }));

      // Notifier le parent avec la structure correcte
      if (onDataChange) {
        onDataChange({ location: newLocation });
      }
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));

      // Notifier le parent des changements
      if (onDataChange) {
        onDataChange({ [name]: value });
      }
    }
  };

  // Gestion des champs specifiques selon la categorie
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

  // Fonction pour compresser une image
  const compressImage = (file, maxWidth = 1920, quality = 0.8) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calculer les nouvelles dimensions
        let { width, height } = img;
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Dessiner l'image compressee
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convertir en blob
        canvas.toBlob((blob) => {
          const compressedFile = new File([blob], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now()
          });
          resolve(compressedFile);
        }, 'image/jpeg', quality);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  // Fonction pour creer une previsualisation immediate
  const createPreview = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve({
          url: e.target.result,
          file: file,
          id: Date.now() + Math.random()
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    
    // Verifier la limite d'images
    if (form.images.length + files.length > 8) {
      toast({ 
        title: 'Limite atteinte', 
        description: 'Vous pouvez uploader jusqu\'à 8 images maximum.', 
        variant: 'destructive' 
      });
      return;
    }

    // Verifier les types de fichiers
    const invalidFiles = files.filter(file => !file.type.startsWith('image/'));
    if (invalidFiles.length > 0) {
      toast({ 
        title: 'Type de fichier invalide', 
        description: 'Seules les images sont acceptées.', 
        variant: 'destructive' 
      });
      return;
    }

    setIsUploadingImages(true);
    setUploadProgress({ current: 0, total: files.length });

    try {
      // Étape 1: Creer les previsualisations immediatement
      const previews = await Promise.all(files.map(createPreview));
      
      // Ajouter les previsualisations au formulaire immediatement
      const newImages = [...form.images, ...previews.map(p => ({ 
        url: p.url, 
        isPreview: true, 
        id: p.id,
        file: p.file 
      }))];
      
      setForm((prev) => ({ 
        ...prev, 
        images: newImages
      }));

      // Notifier le parent des changements d'images - CORRIGÉ
      if (onDataChange) {
        onDataChange({ images: newImages });
      }

      // Étape 2: Compresser les images en parallele
      const compressedFiles = await Promise.all(
        files.map(file => compressImage(file, 1920, 0.8))
      );

      // Étape 3: Uploader en parallele (max 3 simultanes)
      const uploadBatch = async (files, startIndex) => {
        const batch = files.slice(startIndex, startIndex + 3);
        return Promise.all(
          batch.map(async (file, batchIndex) => {
            const globalIndex = startIndex + batchIndex;
            try {
              const res = await storageService.uploadImage(file, 'listings');
              setUploadProgress({ current: globalIndex + 1, total: files.length });
              return { success: true, url: res, index: globalIndex };
            } catch (error) {
              console.error('Erreur upload pour', file.name, error);
              setUploadProgress({ current: globalIndex + 1, total: files.length });
              return { success: false, error: error.message, index: globalIndex };
            }
          })
        );
      };

      const results = [];
      for (let i = 0; i < compressedFiles.length; i += 3) {
        const batchResults = await uploadBatch(compressedFiles, i);
        results.push(...batchResults);
      }

      // Étape 4: Remplacer les previsualisations par les vraies URLs
      const successfulUploads = results.filter(r => r.success);
      const errors = results.filter(r => !r.success);

      if (successfulUploads.length > 0) {
        const finalImages = [...newImages];
        successfulUploads.forEach(({ url, index }) => {
          // Trouver l'index de la previsualisation correspondante
          const previewIndex = finalImages.findIndex(img => img.isPreview && img.id === previews[index].id);
          if (previewIndex !== -1) {
            finalImages[previewIndex] = { url, isPreview: false };
          }
        });
        
        setForm((prev) => ({ ...prev, images: finalImages }));
        
        // Notifier le parent des changements d'images finales - CORRIGÉ
        if (onDataChange) {
          onDataChange({ images: finalImages });
        }

        toast({ 
          title: 'Images ajoutées', 
          description: `${successfulUploads.length} image(s) téléchargée(s) avec succès.` 
        });
      }

      // Afficher les erreurs s'il y en a
      if (errors.length > 0) {
        toast({ 
          title: 'Erreurs d\'upload', 
          description: `Erreurs pour ${errors.length} fichier(s): ${errors.map(e => e.error).join(', ')}`, 
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
      setIsUploadingImages(false);
      setUploadProgress({ current: 0, total: 0 });
    }
  };

  // Suppression d'une image uploadee (avant publication) - CORRIGÉ
  const handleRemoveImage = (idxToRemove) => {
    setForm((prev) => {
      const newImages = prev.images.filter((_, idx) => idx !== idxToRemove);
      
      // Notifier le parent des changements d'images - CORRIGÉ
      if (onDataChange) {
        onDataChange({ images: newImages });
      }
      
      return { ...prev, images: newImages };
    });
  };

  // Reordonner les images (fleches) - CORRIGÉ
  const moveImage = (fromIdx, toIdx) => {
    setForm((prev) => {
      const images = [...prev.images];
      if (toIdx < 0 || toIdx >= images.length) return prev;
      const [moved] = images.splice(fromIdx, 1);
      images.splice(toIdx, 0, moved);
      
      // Notifier le parent des changements d'images - CORRIGÉ
      if (onDataChange) {
        onDataChange({ images: images });
      }
      
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
      // Filtrer les images pour ne garder que celles qui sont uploadees (pas les previsualisations)
      const uploadedImages = form.images.filter(img => !img.isPreview).map(img => typeof img === 'string' ? img : img.url);
      
      const payload = {
        ...form,
        images: uploadedImages,
        price: Number(form.price),
      };

      let res;
      if (listingId) {
        // Mode édition
        res = await listingService.updateListing(listingId, payload);
        toast({ title: 'Annonce modifiée !', description: 'Vos modifications ont été enregistrées.' });
      } else {
        // Mode création
        res = await listingService.createListing(payload);
        toast({ title: 'Annonce créée !', description: 'Votre annonce a été soumise avec succès.' });
        setForm(DEFAULT_FORM);
      }

      if (onSuccess) onSuccess(res);
    } catch (err) {
      toast({ title: 'Erreur', description: err?.message || 'Erreur lors de l\'opération.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Champs specifiques selon la categorie
  const renderSpecificFields = () => {
    switch (form.category) {
      case 'real_estate':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="propertyType">Type de bien immobilier</Label>
              <Input 
                id="propertyType"
                name="propertyType" 
                placeholder="Ex: Appartement, Maison, Terrain, Local commercial..." 
                value={form.specificData.propertyType || ''} 
                onChange={handleSpecificChange} 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="transactionType">Type de transaction</Label>
              <Input 
                id="transactionType"
                name="transactionType" 
                placeholder="Ex: Vente, Location, Location-vente..." 
                value={form.specificData.transactionType || ''} 
                onChange={handleSpecificChange} 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bedrooms">Nombre de chambres</Label>
              <Input 
                id="bedrooms"
                name="bedrooms" 
                type="number" 
                placeholder="Ex: 3"
                min="0"
                value={form.specificData.bedrooms || ''} 
                onChange={handleSpecificChange} 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bathrooms">Nombre de salles de bain</Label>
              <Input 
                id="bathrooms"
                name="bathrooms" 
                type="number" 
                placeholder="Ex: 2"
                min="0"
                value={form.specificData.bathrooms || ''} 
                onChange={handleSpecificChange} 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="areaSqMeters">Surface en mètres carrés</Label>
              <Input 
                id="areaSqMeters"
                name="areaSqMeters" 
                type="number" 
                placeholder="Ex: 120"
                min="1"
                value={form.specificData.areaSqMeters || ''} 
                onChange={handleSpecificChange} 
              />
            </div>
            
            <div className="space-y-2">
              <Label>Commodités et équipements</Label>
              <p className="text-sm text-muted-foreground mb-2">
                Ajoutez les commodités disponibles (piscine, parking, climatisation, etc.)
              </p>
              {(form.specificData.amenities || []).map((a, i) => (
                <div key={i} className="flex gap-2 mb-1">
                  <Input
                    value={a}
                    onChange={e => handleAmenityChange(i, e.target.value)}
                    placeholder="Ex: Piscine, Parking, Climatisation..."
                  />
                  <Button type="button" size="icon" variant="destructive" onClick={() => removeAmenity(i)} title="Supprimer" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                    ×
                  </Button>
                </div>
              ))}
              <Button type="button" size="sm" variant="outline" onClick={addAmenity} className="mb-2 border-gray-400 text-gray-700 hover:bg-gray-50">
                + Ajouter une commodité
              </Button>
            </div>
          </>
        );
      case 'automobile':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="vehicleType">Type de véhicule</Label>
              <Input 
                id="vehicleType"
                name="vehicleType" 
                placeholder="Ex: Voiture, Moto, Camion, Bus..." 
                value={form.specificData.vehicleType || ''} 
                onChange={handleSpecificChange} 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="make">Marque du véhicule</Label>
              <Input 
                id="make"
                name="make" 
                placeholder="Ex: Toyota, Honda, BMW..." 
                value={form.specificData.make || ''} 
                onChange={handleSpecificChange} 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="model">Modèle du véhicule</Label>
              <Input 
                id="model"
                name="model" 
                placeholder="Ex: Corolla, Civic, X5..." 
                value={form.specificData.model || ''} 
                onChange={handleSpecificChange} 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="year">Année de fabrication</Label>
              <Input 
                id="year"
                name="year" 
                type="number" 
                placeholder="Ex: 2020"
                min="1900"
                max={new Date().getFullYear() + 1}
                value={form.specificData.year || ''} 
                onChange={handleSpecificChange} 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="mileage">Kilométrage en km</Label>
              <Input 
                id="mileage"
                name="mileage" 
                type="number" 
                placeholder="Ex: 50000"
                min="0"
                value={form.specificData.mileage || ''} 
                onChange={handleSpecificChange} 
              />
            </div>
          </>
        );
      case 'services':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="serviceCategory">Catégorie de service</Label>
              <Input 
                id="serviceCategory"
                name="serviceCategory" 
                placeholder="Ex: Plomberie, Électricité, Design, Formation..." 
                value={form.specificData.serviceCategory || ''} 
                onChange={handleSpecificChange} 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="availability">Disponibilité</Label>
              <Input 
                id="availability"
                name="availability" 
                placeholder="Ex: Lundi-Vendredi 9h-18h, Weekends..." 
                value={form.specificData.availability || ''} 
                onChange={handleSpecificChange} 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="experienceYears">Années d'expérience</Label>
              <Input 
                id="experienceYears"
                name="experienceYears" 
                type="number" 
                placeholder="Ex: 5"
                min="0"
                value={form.specificData.experienceYears || ''} 
                onChange={handleSpecificChange} 
              />
            </div>
            
            <div className="space-y-2">
              <Label>Liens de portfolio et références</Label>
              <p className="text-sm text-muted-foreground mb-2">
                Ajoutez des liens vers vos réalisations, portfolio ou références
              </p>
              {(form.specificData.portfolioLinks || []).map((l, i) => (
                <div key={i} className="flex gap-2 mb-1">
                  <Input
                    value={l}
                    onChange={e => handlePortfolioChange(i, e.target.value)}
                    placeholder="https://votre-portfolio.com ou lien vers vos réalisations..."
                  />
                  <Button type="button" size="icon" variant="destructive" onClick={() => removePortfolioLink(i)} title="Supprimer" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                    ×
                  </Button>
                </div>
              ))}
              <Button type="button" size="sm" variant="outline" onClick={addPortfolioLink} className="mb-2 border-gray-400 text-gray-700 hover:bg-gray-50">
                + Ajouter un lien de portfolio
              </Button>
            </div>
          </>
        );
      case 'marketplace':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="productCategory">Catégorie de produit</Label>
              <Input 
                id="productCategory"
                name="productCategory" 
                placeholder="Ex: Électronique, Vêtements, Livres, Sport..." 
                value={form.specificData.productCategory || ''} 
                onChange={handleSpecificChange} 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="brand">Marque du produit</Label>
              <Input 
                id="brand"
                name="brand" 
                placeholder="Ex: Apple, Nike, Samsung..." 
                value={form.specificData.brand || ''} 
                onChange={handleSpecificChange} 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="stockQuantity">Quantité disponible en stock</Label>
              <Input 
                id="stockQuantity"
                name="stockQuantity" 
                type="number" 
                placeholder="Ex: 10"
                min="0"
                value={form.specificData.stockQuantity || ''} 
                onChange={handleSpecificChange} 
              />
            </div>
          </>
        );
      default:
        return null;
    }
  };

  // Champs dynamiques avances pour les sous-champs
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

  // Rendu des etapes du formulaire
  const renderStep = () => {
    switch (activeStep) {
      // ÉTAPE 1 : Informations de base (Titre, Description, Catégorie, Localisation)
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-4">Informations de base</h3>
              <p className="text-muted-foreground mb-6">Commencez par les informations essentielles de votre annonce.</p>
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
                  rows={4}
                  required
                  className="max-w-2xl resize-none transition-all duration-200"
                  style={{ minHeight: '120px', height: 'auto', overflow: 'hidden' }}
                  onInput={(e) => {
                    e.target.style.height = 'auto';
                    e.target.style.height = Math.min(e.target.scrollHeight, 300) + 'px';
                  }}
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
                  className="w-full px-3 py-3 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent h-12 text-foreground"
                >
                  <option value="" className="text-foreground">Sélectionner une catégorie</option>
                  {CATEGORY_OPTIONS.map(option => (
                    <option key={option.value} value={option.value} className="text-foreground">{option.label}</option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Localisation */}
            <div className="space-y-4 pt-6 border-t">
              <h4 className="text-lg font-medium text-foreground">Localisation</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="country">Pays *</Label>
                  <select
                    id="country"
                    name="location.country"
                    value={form.location.country}
                    onChange={handleChange}
                    className="w-full px-3 py-3 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent h-12 text-foreground"
                  >
                    <option value="" className="text-foreground">Sélectionner un pays</option>
                    {COUNTRY_CITY_OPTIONS.map(country => (
                      <option key={country.code} value={country.name} className="text-foreground">{country.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="city">Ville *</Label>
                  <select
                    id="city"
                    name="location.city"
                    value={form.location.city}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-3 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent h-12 text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!form.location.country}
                  >
                    <option value="" className="text-foreground">Sélectionner une ville</option>
                    {COUNTRY_CITY_OPTIONS.find(c => c.name === form.location.country)?.cities?.map((city, index) => (
                      <option key={`${form.location.country || 'unknown'}-${city}-${index}`} value={city} className="text-foreground">{city}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        );
        
      // ÉTAPE 2 : Détails techniques (Prix, Devise, Champs spécifiques)
      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-4">Détails et tarification</h3>
              <p className="text-muted-foreground mb-6">Définissez le prix et les caractéristiques spécifiques.</p>
            </div>

            {/* Section Prix */}
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-foreground">Prix et devise</h4>
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
                    min="1"
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
                    className="w-full px-3 py-3 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent h-12 text-foreground"
                  >
                    <option value="XOF">XOF (Franc CFA)</option>
                    <option value="EUR">EUR (Euro)</option>
                    <option value="USD">USD (Dollar US)</option>
                    <option value="NGN">NGN (Naira)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section Détails spécifiques */}
            <div className="space-y-4 pt-6 border-t">
              <h4 className="text-lg font-medium text-foreground">Caractéristiques spécifiques</h4>
              {form.category ? (
                <div className="space-y-4">
                  {renderSpecificFields()}
                </div>
              ) : (
                <div className="text-center py-4 bg-muted/50 rounded-lg">
                  <p className="text-muted-foreground">Veuillez d'abord sélectionner une catégorie à l'étape 1.</p>
                </div>
              )}
            </div>
          </div>
        );

      // ÉTAPE 3 : Images et Publication
      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-4">Photos et publication</h3>
              <p className="text-muted-foreground mb-6">Ajoutez des photos pour rendre votre annonce attractive.</p>
            </div>
            
            {/* Section Médias */}
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-foreground">Images et médias</h4>
              <div className="space-y-2">
                <Label htmlFor="image-upload">Sélectionner des images</Label>
                <div className={`border-2 border-dashed border-gray-400 rounded-lg p-6 text-center transition-colors ${
                  isUploadingImages ? 'border-blue-400 bg-blue-50' : 'hover:border-primary'
                }`}>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                    id="image-upload"
                    disabled={isUploadingImages}
                  />
                  <label htmlFor="image-upload" className={`cursor-pointer ${isUploadingImages ? 'cursor-not-allowed' : ''}`}>
                    <div className="space-y-2">
                      <div className="mx-auto w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                        {isUploadingImages ? (
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                        ) : (
                          <Camera className="h-6 w-6 text-gray-600" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {isUploadingImages ? 'Chargement en cours...' : 'Cliquez pour ajouter des images'}
                        </p>
                        <p className="text-xs text-gray-600">
                          {isUploadingImages ? `Veuillez patienter (${uploadProgress.current}/${uploadProgress.total})` : 'PNG, JPG jusqu\'à 10MB'}
                        </p>
                        {isUploadingImages && uploadProgress.total > 0 && (
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}
                            ></div>
                          </div>
                        )}
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
                          src={img.url}
                          alt={`Aperçu ${idx + 1}`}
                          className={`w-full h-full object-cover rounded-lg border ${img.isPreview ? 'opacity-70' : ''}`}
                        />
                        {img.isPreview && (
                          <div className="absolute inset-0 bg-blue-500 bg-opacity-20 flex items-center justify-center">
                            <div className="bg-white rounded-full p-2 shadow-lg">
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                            </div>
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1.5 text-xs opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                          title="Supprimer cette image"
                          disabled={img.isPreview}
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
              <h4 className="text-lg font-medium text-foreground">Détails spécifiques à la catégorie</h4>
              {form.category ? (
                <div className="space-y-4">
                  {renderSpecificFields()}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">Veuillez d'abord sélectionner une catégorie à l'étape 1.</p>
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
              disabled={
                (activeStep === 1 && (!form.title || !form.description || !form.category || !form.location?.country || !form.location?.city)) ||
                (activeStep === 2 && (!form.price || Number(form.price) < 0))
              }
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