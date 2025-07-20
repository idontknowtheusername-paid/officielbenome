import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { createListing } from '@/lib/api/index.js';

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

const ListingForm = ({ onSuccess }) => {
  const { toast } = useToast();
  const [form, setForm] = useState(DEFAULT_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      const res = await createListing(payload);
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

  return (
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
        <Label>Ville</Label>
        <Input name="location.city" value={form.location.city} onChange={handleChange} />
        <Label>Pays</Label>
        <Input name="location.country" value={form.location.country} onChange={handleChange} />
      </div>
      <div className="space-y-2">
        <Label>Images (URLs, séparées par des virgules)</Label>
        <Input name="images" value={form.images.join(', ')} onChange={handleImagesChange} />
      </div>
      {/* Champs spécifiques selon la catégorie */}
      {form.category && (
        <div className="space-y-2 border-t pt-4 mt-4">
          <h3 className="font-semibold">Détails spécifiques</h3>
          {renderSpecificFields()}
        </div>
      )}
      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Publication...' : 'Publier'}
        </Button>
      </div>
    </form>
  );
};

export default ListingForm; 