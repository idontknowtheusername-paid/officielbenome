import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { listingService, storageService } from '@/services/supabase.service';
import { Dialog } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';

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

const ListingForm = ({ onSuccess, category }) => {
  const { toast } = useToast();
  const [form, setForm] = useState({
    ...DEFAULT_FORM,
    category: category ? getCategoryValue(category) : ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

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
    if (form.images.length + files.length > 8) {
      toast({ title: 'Limite atteinte', description: 'Vous pouvez uploader jusqu\'à 8 images maximum.', variant: 'destructive' });
      return;
    }
    setIsSubmitting(true);
    try {
      const uploadedUrls = [];
      for (const file of files) {
        const res = await storageService.uploadFile(file, 'annonces');
        if (res?.url) uploadedUrls.push(res.url);
      }
      setForm((prev) => ({ ...prev, images: [...prev.images, ...uploadedUrls] }));
      toast({ title: 'Images ajoutées', description: `${uploadedUrls.length} image(s) téléchargée(s).` });
    } catch (err) {
      toast({ title: 'Erreur upload', description: err?.message || 'Erreur lors de l\'upload.', variant: 'destructive' });
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
                <Button type="button" size="icon" variant="ghost" onClick={() => removeAmenity(i)} title="Supprimer">
                  ×
                </Button>
              </div>
            ))}
            <Button type="button" size="sm" variant="outline" onClick={addAmenity} className="mb-2">+ Ajouter une commodité</Button>
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
                <Button type="button" size="icon" variant="ghost" onClick={() => removePortfolioLink(i)} title="Supprimer">
                  ×
                </Button>
              </div>
            ))}
            <Button type="button" size="sm" variant="outline" onClick={addPortfolioLink} className="mb-2">+ Ajouter un lien</Button>
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

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-lg mx-auto p-4 bg-card rounded-lg shadow">
        <h2 className="text-xl font-bold mb-2">Créer une annonce</h2>
        <div className="space-y-2">
          <Label htmlFor="title">Titre *</Label>
          <Input id="title" name="title" value={form.title} onChange={handleChange} required minLength={5} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description *</Label>
          <Textarea id="description" name="description" value={form.description} onChange={handleChange} required minLength={10} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="price">Prix *</Label>
          <Input id="price" name="price" type="number" value={form.price} onChange={handleChange} required min={0} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="currency">Devise</Label>
          <Input id="currency" name="currency" value={form.currency} onChange={handleChange} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Catégorie *</Label>
          <select id="category" name="category" value={form.category} onChange={handleChange} required className="w-full border rounded p-2">
            <option value="">Sélectionner...</option>
            {CATEGORY_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="subCategory">Sous-catégorie</Label>
          <Input id="subCategory" name="subCategory" value={form.subCategory} onChange={handleChange} />
        </div>
        <div className="space-y-2">
          <Label>Pays</Label>
          <select
            name="location.country"
            value={form.location.country}
            onChange={handleChange}
            required
            className="input"
          >
            <option value="">Sélectionner un pays</option>
            {COUNTRY_CITY_OPTIONS.map((c) => (
              <option key={c.code} value={c.name}>{c.name}</option>
            ))}
          </select>
          <Label>Ville</Label>
          <select
            name="location.city"
            value={form.location.city}
            onChange={handleChange}
            required
            className="input"
            disabled={!form.location.country}
          >
            <option value="">Sélectionner une ville</option>
            {COUNTRY_CITY_OPTIONS.find(c => c.name === form.location.country)?.cities.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label>Images</Label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
          />
          {form.images.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {form.images.map((img, idx) => (
                <div key={idx} className="relative group">
                  <img
                    src={img}
                    alt={`Aperçu ${idx + 1}`}
                    className="w-20 h-20 object-cover rounded border"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-1 right-1 bg-white/80 rounded-full p-1 text-xs text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Supprimer cette image"
                  >
                    ×
                  </button>
                  {/* Flèches de réorganisation */}
                  <div className="absolute bottom-1 left-1 flex gap-1">
                    <button
                      type="button"
                      onClick={() => moveImage(idx, idx - 1)}
                      disabled={idx === 0}
                      className="bg-white/80 rounded-full p-1 text-xs text-gray-500 hover:text-primary disabled:opacity-30"
                      title="Déplacer à gauche"
                    >
                      ←
                    </button>
                    <button
                      type="button"
                      onClick={() => moveImage(idx, idx + 1)}
                      disabled={idx === form.images.length - 1}
                      className="bg-white/80 rounded-full p-1 text-xs text-gray-500 hover:text-primary disabled:opacity-30"
                      title="Déplacer à droite"
                    >
                      →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Champs spécifiques selon la catégorie */}
        {form.category && (
          <div className="space-y-2 border-t pt-4 mt-4">
            <h3 className="font-semibold">Détails spécifiques</h3>
            {renderSpecificFields()}
          </div>
        )}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => setShowPreview(true)}>
            Prévisualiser
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Publication...' : 'Publier'}
          </Button>
        </div>
      </form>
      {/* Modale de prévisualisation */}
      {showPreview && (
        <Dialog open={showPreview} onOpenChange={setShowPreview}>
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <Card className="max-w-xl w-full p-6 relative">
              <button
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl"
                onClick={() => setShowPreview(false)}
                aria-label="Fermer la prévisualisation"
              >
                ×
              </button>
              <h2 className="text-2xl font-bold mb-2">Aperçu de l'annonce</h2>
              <div className="mb-4">
                <div className="font-semibold">Titre :</div>
                <div>{form.title}</div>
              </div>
              <div className="mb-4">
                <div className="font-semibold">Description :</div>
                <div className="whitespace-pre-line text-gray-700">{form.description}</div>
              </div>
              <div className="mb-4">
                <div className="font-semibold">Prix :</div>
                <div>{form.price} {form.currency}</div>
              </div>
              <div className="mb-4">
                <div className="font-semibold">Catégorie :</div>
                <div>{form.category}</div>
              </div>
              {form.images.length > 0 && (
                <div className="mb-4">
                  <div className="font-semibold">Images :</div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {form.images.map((img, idx) => (
                      <div key={idx} className="relative group">
                        <img
                          src={img}
                          alt={`Aperçu ${idx + 1}`}
                          className="w-24 h-24 object-cover rounded border"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute top-1 right-1 bg-white/80 rounded-full p-1 text-xs text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Supprimer cette image"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Affichage des champs spécifiques */}
              {form.category && (
                <div className="mb-4">
                  <div className="font-semibold">Détails spécifiques :</div>
                  <pre className="bg-gray-50 rounded p-2 text-xs overflow-x-auto">
                    {JSON.stringify(form.specificData, null, 2)}
                  </pre>
                </div>
              )}
              <div className="mb-2">
                <div className="font-semibold">Localisation :</div>
                <div>{form.location.city}, {form.location.country}</div>
              </div>
            </Card>
          </div>
        </Dialog>
      )}
    </>
  );
};

export default ListingForm; 